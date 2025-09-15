import { Router, Request, Response } from 'express'
import { supabase } from '../services/supabase'
import { solanaService } from '../services/solana'
import crypto from 'crypto'
import '../types/express.d'

const router = Router()

// POST /v1/chapters/:id/qualify
router.post('/:id/qualify', async (req: Request, res: Response) => {
  try {
    const chapterId = parseInt(req.params.id)
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'User authentication required'
      })
    }

    // Check if user has 3 verified proofs for this chapter
    const supabaseClient = supabase()
    const { data: proofs, error: proofsError } = await supabaseClient
      .from('proofs')
      .select('id')
      .eq('user_id', userId)
      .eq('chapter_id', chapterId)

    if (proofsError) {
      console.error('Failed to fetch proofs:', proofsError)
      return res.status(500).json({
        error: 'internal_server_error',
        message: 'Failed to verify qualifications'
      })
    }

    if (!proofs || proofs.length < 3) {
      return res.json({
        qualified: false,
        reason: 'not_enough_proofs'
      })
    }

    // Check if user is already qualified
    const { data: existingQual } = await supabaseClient
      .from('qualifications')
      .select('id, rank')
      .eq('user_id', userId)
      .eq('chapter_id', chapterId)
      .single()

    if (existingQual) {
      return res.json({
        qualified: true,
        rank: existingQual.rank
      })
    }

    // TODO: Implement atomic qualification with proper transaction handling
    // This is a simplified version - in production, you'd want proper DB transactions
    
    // Insert qualification
    const { data: qualification, error: qualError } = await supabaseClient
      .from('qualifications')
      .insert({
        user_id: userId,
        chapter_id: chapterId,
        completed_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (qualError) {
      console.error('Failed to create qualification:', qualError)
      return res.status(500).json({
        error: 'internal_server_error',
        message: 'Failed to qualify user'
      })
    }

    // Calculate rank (simplified - in production, use proper atomic ranking)
    const { data: allQuals } = await supabaseClient
      .from('qualifications')
      .select('user_id, completed_at')
      .eq('chapter_id', chapterId)
      .order('completed_at', { ascending: true })

    const rank = allQuals ? allQuals.findIndex(q => q.user_id === userId) + 1 : null

    // Update qualification with rank
    if (rank && rank <= 10) {
      await supabaseClient
        .from('qualifications')
        .update({ rank })
        .eq('id', qualification.id)

      // Insert into winners table
      await supabaseClient
        .from('winners')
        .insert({
          chapter_id: chapterId,
          user_id: userId,
          rank
        })
    }

    res.json({
      qualified: true,
      rank
    })

  } catch (error) {
    console.error('Qualify error:', error)
    res.status(500).json({
      error: 'internal_server_error',
      message: 'An unexpected error occurred'
    })
  }
})

// GET /v1/chapters/:id/slots
router.get('/:id/slots', async (req: Request, res: Response) => {
  try {
    const chapterId = parseInt(req.params.id)
    const supabaseClient = supabase()

    // Count unclaimed winners
    const { data: winners, error } = await supabaseClient
      .from('winners')
      .select('rank')
      .eq('chapter_id', chapterId)
      .is('claimed_at', null)

    if (error) {
      console.error('Failed to fetch slots:', error)
      return res.status(500).json({
        error: 'internal_server_error',
        message: 'Failed to fetch remaining slots'
      })
    }

    const claimedCount = winners?.length || 0
    const remaining = Math.max(0, 10 - claimedCount)

    res.json({
      remaining
    })

  } catch (error) {
    console.error('Slots error:', error)
    res.status(500).json({
      error: 'internal_server_error',
      message: 'An unexpected error occurred'
    })
  }
})

// POST /v1/chapters/:id/claim
router.post('/:id/claim', async (req: Request, res: Response) => {
  try {
    const chapterId = parseInt(req.params.id)
    const { code, to } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'User authentication required'
      })
    }

    if (!code || !to) {
      return res.status(400).json({
        error: 'bad_request',
        message: 'Code and recipient address are required'
      })
    }

    // Validate Solana address format
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(to)) {
      return res.status(400).json({
        error: 'bad_address',
        message: 'Invalid Solana address format'
      })
    }

    // Get chapter details
    const supabaseClient = supabase()
    const { data: chapter, error: chapterError } = await supabaseClient
      .from('chapters')
      .select('id, code_hash, pot_lamports, status')
      .eq('id', chapterId)
      .single()

    if (chapterError || !chapter) {
      return res.status(404).json({
        error: 'chapter_not_found',
        message: 'Chapter not found'
      })
    }

    if (chapter.status !== 'active') {
      return res.status(400).json({
        error: 'chapter_ended',
        message: 'Chapter is no longer active'
      })
    }

    // Verify code
    const normalizedCode = code.toLowerCase().trim()
    const codeHash = crypto.createHash('sha256').update(normalizedCode).digest('hex')

    if (codeHash !== chapter.code_hash) {
      return res.status(400).json({
        error: 'bad_code',
        message: 'Incorrect chapter code'
      })
    }

    // Check if user is a winner
    const { data: winner, error: winnerError } = await supabaseClient
      .from('winners')
      .select('id, rank, claim_address, claim_tx, claimed_at')
      .eq('chapter_id', chapterId)
      .eq('user_id', userId)
      .single()

    if (winnerError || !winner) {
      return res.status(404).json({
        error: 'not_winner',
        message: 'You are not a winner for this chapter'
      })
    }

    if (winner.claimed_at) {
      return res.status(409).json({
        error: 'already_claimed',
        message: 'You have already claimed your reward'
      })
    }

    // Calculate payout amount
    const shareAmount = Math.floor(chapter.pot_lamports / 10)

    // TODO: Execute Solana transfer
    // const txSig = await solanaService.transfer(to, shareAmount)
    
    // Mock transaction for now
    const txSig = `5mx${Math.random().toString(36).substring(2, 15)}aK`

    // Update winner record
    const { error: updateError } = await supabaseClient
      .from('winners')
      .update({
        claim_address: to,
        claim_tx: txSig,
        claimed_at: new Date().toISOString()
      })
      .eq('id', winner.id)

    if (updateError) {
      console.error('Failed to update winner record:', updateError)
      return res.status(500).json({
        error: 'internal_server_error',
        message: 'Failed to record claim'
      })
    }

    res.json({
      status: 'paid',
      tx_sig: txSig
    })

  } catch (error) {
    console.error('Claim error:', error)
    res.status(500).json({
      error: 'internal_server_error',
      message: 'An unexpected error occurred'
    })
  }
})

export default router
