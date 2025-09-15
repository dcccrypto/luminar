import { Router, Request, Response } from 'express'
import { supabase } from '../services/supabase'
import { normalize } from '../utils/normalize'
import crypto from 'crypto'
import '../types/express.d'

const router = Router()

// POST /v1/clues/:clueId/submit
router.post('/:clueId/submit', async (req: Request, res: Response) => {
  try {
    const { clueId } = req.params
    const { answer } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'User authentication required'
      })
    }

    if (!answer || typeof answer !== 'string') {
      return res.status(400).json({
        error: 'invalid_answer',
        message: 'Answer is required and must be a string'
      })
    }

    // TODO: Check cooldown from throttles table
    // const cooldownCheck = await supabase
    //   .from('throttles')
    //   .select('next_allowed_at')
    //   .eq('user_id', userId)
    //   .eq('clue_id', clueId)
    //   .single()
    // 
    // if (cooldownCheck.data && new Date(cooldownCheck.data.next_allowed_at) > new Date()) {
    //   return res.status(429).json({
    //     error: 'cooldown',
    //     message: 'Please wait before submitting another answer',
    //     retry_after: Math.ceil((new Date(cooldownCheck.data.next_allowed_at).getTime() - Date.now()) / 1000)
    //   })
    // }

    // Get clue details
    const supabaseClient = supabase()
    const { data: clue, error: clueError } = await supabaseClient
      .from('clues')
      .select('id, answer_hash, chapter_id')
      .eq('id', clueId)
      .single()

    if (clueError || !clue) {
      return res.status(404).json({
        error: 'clue_not_found',
        message: 'Clue not found'
      })
    }

    // Normalize and hash the answer
    const normalizedAnswer = normalize(answer)
    const answerHash = crypto.createHash('sha256').update(normalizedAnswer).digest('hex')

    // Check if answer is correct
    const isCorrect = answerHash === clue.answer_hash

    if (!isCorrect) {
      // TODO: Set cooldown in throttles table
      // await supabase
      //   .from('throttles')
      //   .upsert({
      //     user_id: userId,
      //     clue_id: clueId,
      //     next_allowed_at: new Date(Date.now() + 10000) // 10 seconds
      //   })

      return res.status(400).json({
        error: 'invalid_answer',
        message: 'Incorrect answer. Please try again.'
      })
    }

    // Check if user already solved this clue
    const { data: existingProof } = await supabaseClient
      .from('proofs')
      .select('id')
      .eq('user_id', userId)
      .eq('clue_id', clueId)
      .single()

    if (existingProof) {
      return res.status(409).json({
        error: 'already_solved',
        message: 'You have already solved this clue'
      })
    }

    // Create proof record
    const proofId = crypto.randomUUID()
    const { error: proofError } = await supabaseClient
      .from('proofs')
      .insert({
        id: proofId,
        user_id: userId,
        chapter_id: clue.chapter_id,
        clue_id: clueId,
        proof_hash: answerHash,
        verified_at: new Date().toISOString()
      })

    if (proofError) {
      console.error('Failed to create proof:', proofError)
      return res.status(500).json({
        error: 'internal_server_error',
        message: 'Failed to record proof'
      })
    }

    // TODO: Extract fragment from answer (this would be game-specific logic)
    // For now, we'll mock the fragment
    const fragment = `FRAG${clueId}`

    res.json({
      fragment,
      proof_id: proofId
    })

  } catch (error) {
    console.error('Clue submit error:', error)
    res.status(500).json({
      error: 'internal_server_error',
      message: 'An unexpected error occurred'
    })
  }
})

export default router
