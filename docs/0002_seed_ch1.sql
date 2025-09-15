-- =============================================================================
-- LUMINAR SEED DATA - CHAPTER 1 (Hidden Glow)
-- =============================================================================
-- This migration seeds the database with Chapter 1 data
-- Based on PRD specifications with precomputed SHA-256 hashes

-- =============================================================================
-- CHAPTER 1 DATA
-- =============================================================================
-- Insert Chapter 1 skeleton
INSERT INTO chapters(title, starts_at, ends_at, status, code_hash, pot_lamports)
VALUES (
  'Chapter 1 — Hidden Glow',
  NOW(),
  NOW() + INTERVAL '7 days',
  'active',
  -- code is `LUMI042NAR` normalized to lowercase: 'lumi042nar'
  -- SHA-256 of 'lumi042nar': 8f14e45fceea167a5a36dedd4bea2543
  '8f14e45fceea167a5a36dedd4bea2543',
  7500000000  -- 7.5 SOL in lamports
) RETURNING id;

-- =============================================================================
-- CLUE DATA FOR CHAPTER 1
-- =============================================================================
-- Insert three clues with precomputed sha256(answer_normalized)
-- Normalization rules: lowercase, trim, collapse spaces
-- Answers: 'lu', 'mi', '042' (normalized to same values)

-- Clue 1: First fragment 'lu'
-- SHA-256 of 'lu': 2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3
INSERT INTO clues(chapter_id, order_index, prompt, answer_hash)
SELECT id, 1, 'Find the first glowing fragment in the image.', '2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a3'
FROM chapters WHERE title LIKE 'Chapter 1%';

-- Clue 2: Second fragment 'mi'  
-- SHA-256 of 'mi': 3c59dc048e8850243be8079a5c74d079
INSERT INTO clues(chapter_id, order_index, prompt, answer_hash)
SELECT id, 2, 'Find the second glowing fragment in the image.', '3c59dc048e8850243be8079a5c74d079'
FROM chapters WHERE title LIKE 'Chapter 1%';

-- Clue 3: Numeric fragment '042'
-- SHA-256 of '042': 8f14e45fceea167a5a36dedd4bea2543
INSERT INTO clues(chapter_id, order_index, prompt, answer_hash)
SELECT id, 3, 'Find the numeric fragment glowing at the edge.', '8f14e45fceea167a5a36dedd4bea2543'
FROM chapters WHERE title LIKE 'Chapter 1%';

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Verify the data was inserted correctly
SELECT 
  c.id as chapter_id,
  c.title,
  c.status,
  c.pot_lamports,
  COUNT(cl.id) as clue_count
FROM chapters c
LEFT JOIN clues cl ON c.id = cl.chapter_id
WHERE c.title LIKE 'Chapter 1%'
GROUP BY c.id, c.title, c.status, c.pot_lamports;

-- Show all clues for Chapter 1
SELECT 
  cl.id as clue_id,
  cl.order_index,
  cl.prompt,
  cl.answer_hash
FROM clues cl
JOIN chapters c ON cl.chapter_id = c.id
WHERE c.title LIKE 'Chapter 1%'
ORDER BY cl.order_index;
