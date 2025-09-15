import { Router, Request, Response } from 'express'
import { supabase } from '../services/supabase'
import '../types/express.d'

const router = Router()

// GET /v1/user/progress
router.get('/progress', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'User authentication required'
      })
    }

    const supabaseClient = supabase()

    // Get user's proofs
    const { data: proofs, error: proofsError } = await supabaseClient
      .from('proofs')
      .select('clue_id, verified_at')
      .eq('user_id', userId)

    if (proofsError) {
      console.error('Failed to fetch proofs:', proofsError)
      return res.status(500).json({
        error: 'internal_server_error',
        message: 'Failed to fetch user progress'
      })
    }

    // Get user's qualifications
    const { data: qualifications, error: qualsError } = await supabaseClient
      .from('qualifications')
      .select('chapter_id, rank, completed_at')
      .eq('user_id', userId)

    if (qualsError) {
      console.error('Failed to fetch qualifications:', qualsError)
      return res.status(500).json({
        error: 'internal_server_error',
        message: 'Failed to fetch user progress'
      })
    }

    res.json({
      proofs: proofs || [],
      qualifications: qualifications || []
    })

  } catch (error) {
    console.error('User progress error:', error)
    res.status(500).json({
      error: 'internal_server_error',
      message: 'An unexpected error occurred'
    })
  }
})

export default router
