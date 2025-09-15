-- =============================================================================
-- LUMINAR DATABASE SCHEMA - INITIAL MIGRATION
-- =============================================================================
-- This migration creates the complete database schema for Luminar v1
-- Based on PRD specifications with exact table structures

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- USERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS users(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  privy_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- CHAPTERS TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS chapters(
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('scheduled','active','ended')) NOT NULL,
  code_hash TEXT NOT NULL,
  pot_lamports BIGINT NOT NULL DEFAULT 0
);

-- =============================================================================
-- CLUES TABLE
-- =============================================================================
CREATE TABLE IF NOT EXISTS clues(
  id SERIAL PRIMARY KEY,
  chapter_id INT REFERENCES chapters(id) ON DELETE CASCADE,
  order_index INT NOT NULL,
  prompt TEXT NOT NULL,
  answer_hash TEXT NOT NULL
);

-- =============================================================================
-- PROOFS TABLE (one per user per clue)
-- =============================================================================
CREATE TABLE IF NOT EXISTS proofs(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chapter_id INT REFERENCES chapters(id) ON DELETE CASCADE,
  clue_id INT REFERENCES clues(id) ON DELETE CASCADE,
  proof_hash TEXT NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS proofs_user_clue_uniq ON proofs(user_id, clue_id);

-- =============================================================================
-- QUALIFICATIONS TABLE (one per user per chapter)
-- =============================================================================
CREATE TABLE IF NOT EXISTS qualifications(
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chapter_id INT REFERENCES chapters(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL,
  rank INT
);

CREATE UNIQUE INDEX IF NOT EXISTS qual_user_chapter_uniq ON qualifications(user_id, chapter_id);
CREATE INDEX IF NOT EXISTS qual_chapter_rank_idx ON qualifications(chapter_id, rank);

-- =============================================================================
-- WINNERS TABLE (top 10)
-- =============================================================================
CREATE TABLE IF NOT EXISTS winners(
  id SERIAL PRIMARY KEY,
  chapter_id INT REFERENCES chapters(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rank INT NOT NULL CHECK (rank BETWEEN 1 AND 10),
  claim_address TEXT,
  claim_tx TEXT,
  claimed_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS winners_chapter_user_uniq ON winners(chapter_id, user_id);
CREATE UNIQUE INDEX IF NOT EXISTS winners_chapter_rank_uniq ON winners(chapter_id, rank);

-- =============================================================================
-- THROTTLES TABLE (cooldowns)
-- =============================================================================
CREATE TABLE IF NOT EXISTS throttles(
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  clue_id INT REFERENCES clues(id) ON DELETE CASCADE,
  next_allowed_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY(user_id, clue_id)
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- Enable RLS on all user data tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE throttles ENABLE ROW LEVEL SECURITY;

-- Minimal RLS policies for v1
-- Backend uses service role for writes. Frontend only reads chapter/clue metadata and slots.
-- 1) Allow authenticated read on chapters, clues, winners (read-only)
CREATE POLICY "chapters_read_auth" ON chapters FOR SELECT TO authenticated USING (true);
CREATE POLICY "clues_read_auth" ON clues FOR SELECT TO authenticated USING (true);
CREATE POLICY "winners_read_auth" ON winners FOR SELECT TO authenticated USING (true);

-- 2) Deny inserts/updates from client (no policy) — backend (service role) bypasses RLS

-- =============================================================================
-- REALTIME CONFIGURATION
-- =============================================================================
-- Enable Realtime replication on winners and qualifications to drive the 'slots remaining' ticker
-- (Postgres logical replication settings are handled by Supabase; just mark publications)
ALTER PUBLICATION supabase_realtime ADD TABLE winners;
ALTER PUBLICATION supabase_realtime ADD TABLE qualifications;

-- =============================================================================
-- ADDITIONAL INDEXES FOR PERFORMANCE
-- =============================================================================
-- Additional indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_proofs_user_chapter ON proofs(user_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_qualifications_chapter_completed ON qualifications(chapter_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_winners_chapter_claimed ON winners(chapter_id, claimed_at);
CREATE INDEX IF NOT EXISTS idx_throttles_next_allowed ON throttles(next_allowed_at);
