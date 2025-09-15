-- =============================================================================
-- LUMINAR DATABASE SCHEMA
-- =============================================================================
-- Run this SQL in your Supabase SQL editor to set up the database schema
-- Based on the PRD requirements

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS TABLE
-- =============================================================================
-- Maps Privy user IDs to internal user records
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  privy_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CHAPTERS TABLE  
-- =============================================================================
-- Game chapters with prize pools and timing
CREATE TABLE chapters (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('scheduled','active','ended')) NOT NULL DEFAULT 'scheduled',
  code_hash TEXT NOT NULL,          -- sha256(normalized final code)
  pot_lamports BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CLUES TABLE
-- =============================================================================
-- Individual clues within chapters
CREATE TABLE clues (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  prompt TEXT NOT NULL,             -- descriptive caption (no answers)
  answer_hash TEXT NOT NULL,        -- sha256(normalized answer)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PROOFS TABLE
-- =============================================================================
-- One proof per user per clue (verified solutions)
CREATE TABLE proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
  clue_id INTEGER REFERENCES clues(id) ON DELETE CASCADE,
  proof_hash TEXT NOT NULL,         -- hash of normalized answer
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure one proof per user per clue
CREATE UNIQUE INDEX proofs_user_clue_uniq ON proofs(user_id, clue_id);

-- =============================================================================
-- QUALIFICATIONS TABLE
-- =============================================================================
-- One qualification per user per chapter (completion tracking)
CREATE TABLE qualifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rank INTEGER CHECK (rank BETWEEN 1 AND 10)
);

-- Ensure one qualification per user per chapter
CREATE UNIQUE INDEX qual_user_chapter_uniq ON qualifications(user_id, chapter_id);

-- Index for ranking queries
CREATE INDEX qual_chapter_rank_idx ON qualifications(chapter_id, rank);

-- =============================================================================
-- WINNERS TABLE
-- =============================================================================
-- Top 10 winners with claim tracking
CREATE TABLE winners (
  id SERIAL PRIMARY KEY,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL CHECK (rank BETWEEN 1 AND 10),
  claim_address TEXT,
  claim_tx TEXT,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure one winner record per user per chapter
CREATE UNIQUE INDEX winners_chapter_user_uniq ON winners(chapter_id, user_id);

-- Ensure unique ranks per chapter
CREATE UNIQUE INDEX winners_chapter_rank_uniq ON winners(chapter_id, rank);

-- =============================================================================
-- THROTTLES TABLE
-- =============================================================================
-- Cooldown management for wrong answers
CREATE TABLE throttles (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  clue_id INTEGER REFERENCES clues(id) ON DELETE CASCADE,
  next_allowed_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY(user_id, clue_id)
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE throttles ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================
-- Note: These are basic policies. Adjust based on your security requirements.
-- The backend uses service role key for privileged operations.

-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = privy_user_id);

-- Public read access to active chapters
CREATE POLICY "Public can read active chapters" ON chapters
  FOR SELECT USING (status = 'active');

-- Public read access to clues for active chapters
CREATE POLICY "Public can read clues for active chapters" ON clues
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chapters 
      WHERE chapters.id = clues.chapter_id 
      AND chapters.status = 'active'
    )
  );

-- Users can read their own proofs
CREATE POLICY "Users can read own proofs" ON proofs
  FOR SELECT USING (auth.uid()::text = (SELECT privy_user_id FROM users WHERE users.id = proofs.user_id));

-- Users can read their own qualifications
CREATE POLICY "Users can read own qualifications" ON qualifications
  FOR SELECT USING (auth.uid()::text = (SELECT privy_user_id FROM users WHERE users.id = qualifications.user_id));

-- Public read access to winners (for transparency)
CREATE POLICY "Public can read winners" ON winners
  FOR SELECT USING (true);

-- Users can read their own throttles
CREATE POLICY "Users can read own throttles" ON throttles
  FOR SELECT USING (auth.uid()::text = (SELECT privy_user_id FROM users WHERE users.id = throttles.user_id));

-- =============================================================================
-- REALTIME SUBSCRIPTIONS
-- =============================================================================
-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE winners;
ALTER PUBLICATION supabase_realtime ADD TABLE chapters;

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on chapters
CREATE TRIGGER update_chapters_updated_at 
  BEFORE UPDATE ON chapters 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SAMPLE DATA (OPTIONAL)
-- =============================================================================
-- Uncomment to insert sample data for testing

-- INSERT INTO chapters (title, starts_at, ends_at, status, code_hash, pot_lamports) VALUES
-- ('Hidden Glow', NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', 'active', 'sha256_hash_of_final_code', 7500000000);

-- INSERT INTO clues (chapter_id, order_index, prompt, answer_hash) VALUES
-- (1, 1, 'Look carefully at the image. What do you see?', 'sha256_hash_of_answer_1'),
-- (1, 2, 'Examine the details. What fragment is hidden?', 'sha256_hash_of_answer_2'),
-- (1, 3, 'Find the final piece of the puzzle.', 'sha256_hash_of_answer_3');

-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================
-- Create storage buckets for game assets and chapter packs
-- Run these in the Supabase Storage section or via SQL

-- INSERT INTO storage.buckets (id, name, public) VALUES
-- ('chapters', 'chapters', true),
-- ('packs', 'packs', true);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================
-- Additional indexes for common query patterns

CREATE INDEX idx_proofs_user_chapter ON proofs(user_id, chapter_id);
CREATE INDEX idx_qualifications_chapter_completed ON qualifications(chapter_id, completed_at);
CREATE INDEX idx_winners_chapter_claimed ON winners(chapter_id, claimed_at);
CREATE INDEX idx_throttles_next_allowed ON throttles(next_allowed_at);

-- =============================================================================
-- NOTES
-- =============================================================================
-- 1. Replace 'sha256_hash_of_*' with actual SHA-256 hashes of your game content
-- 2. Adjust RLS policies based on your security requirements
-- 3. The backend service role key bypasses RLS for privileged operations
-- 4. Consider adding more indexes based on your query patterns
-- 5. Set up proper backup and monitoring for production use
