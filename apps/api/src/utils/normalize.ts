/**
 * Normalize answer text for consistent comparison
 * Based on PRD requirements: lowercase, trim, collapse multiple spaces to single
 */
export function normalize(text: string): string {
  if (typeof text !== 'string') {
    return ''
  }

  return text
    .toLowerCase()                    // Convert to lowercase
    .trim()                          // Remove leading/trailing whitespace
    .replace(/\s+/g, ' ')            // Collapse multiple spaces to single space
    .replace(/[^\w\s]/g, '')         // Remove punctuation (optional - adjust based on game requirements)
}

/**
 * Hash a normalized answer using SHA-256
 */
export function hashAnswer(answer: string): string {
  const crypto = require('crypto')
  const normalized = normalize(answer)
  return crypto.createHash('sha256').update(normalized).digest('hex')
}

/**
 * Validate answer format (customize based on game requirements)
 */
export function validateAnswer(answer: string): { valid: boolean; error?: string } {
  if (!answer || typeof answer !== 'string') {
    return { valid: false, error: 'Answer is required' }
  }

  const normalized = normalize(answer)
  
  if (normalized.length === 0) {
    return { valid: false, error: 'Answer cannot be empty' }
  }

  if (normalized.length > 100) {
    return { valid: false, error: 'Answer is too long' }
  }

  // Add more validation rules as needed
  // e.g., specific format requirements, forbidden characters, etc.

  return { valid: true }
}
