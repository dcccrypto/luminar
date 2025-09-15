import { Router, Request, Response } from 'express'
import { supabase } from '../services/supabase'
import { adminMiddleware } from '../middleware/auth'
import '../types/express.d'

const router = Router()

// Apply admin middleware to all admin routes
router.use(adminMiddleware)

// POST /v1/admin/chapters/:id/end
router.post('/chapters/:id/end', async (req: Request, res: Response) => {
  try {
    const chapterId = parseInt(req.params.id)
    const supabaseClient = supabase()

    // Get chapter details
    const { data: chapter, error: chapterError } = await supabaseClient
      .from('chapters')
      .select('id, title, status, pot_lamports')
      .eq('id', chapterId)
      .single()

    if (chapterError || !chapter) {
      return res.status(404).json({
        error: 'chapter_not_found',
        message: 'Chapter not found'
      })
    }

    if (chapter.status === 'ended') {
      return res.status(400).json({
        error: 'chapter_already_ended',
        message: 'Chapter has already been ended'
      })
    }

    // Get all winners for this chapter
    const { data: winners, error: winnersError } = await supabaseClient
      .from('winners')
      .select(`
        id,
        rank,
        claim_address,
        claim_tx,
        claimed_at,
        users!inner(
          id,
          email
        )
      `)
      .eq('chapter_id', chapterId)
      .order('rank', { ascending: true })

    if (winnersError) {
      console.error('Failed to fetch winners:', winnersError)
      return res.status(500).json({
        error: 'internal_server_error',
        message: 'Failed to fetch winners'
      })
    }

    // Update chapter status to ended
    const { error: updateError } = await supabaseClient
      .from('chapters')
      .update({ status: 'ended' })
      .eq('id', chapterId)

    if (updateError) {
      console.error('Failed to end chapter:', updateError)
      return res.status(500).json({
        error: 'internal_server_error',
        message: 'Failed to end chapter'
      })
    }

    // Create chapter pack JSON
    const shareAmount = Math.floor(chapter.pot_lamports / 10)
    const chapterPack = {
      chapter_id: chapterId,
      title: chapter.title,
      cutoff_iso: new Date().toISOString(),
      pot_lamports: chapter.pot_lamports,
      share_amount_lamports: shareAmount,
      winners: winners?.map(winner => ({
        rank: winner.rank,
        user_id: (winner.users as any).id,
        email: (winner.users as any).email,
        address: winner.claim_address,
        amount_lamports: shareAmount,
        tx: winner.claim_tx,
        claimed_at: winner.claimed_at
      })) || []
    }

    // TODO: Upload chapter pack to Supabase Storage
    // const { data: uploadData, error: uploadError } = await supabaseClient.storage
    //   .from('packs')
    //   .upload(`chapter-${chapterId}-pack.json`, JSON.stringify(chapterPack, null, 2), {
    //     contentType: 'application/json',
    //     upsert: true
    //   })
    // 
    // if (uploadError) {
    //   console.error('Failed to upload chapter pack:', uploadError)
    //   return res.status(500).json({
    //     error: 'internal_server_error',
    //     message: 'Failed to create chapter pack'
    //   })
    // }
    // 
    // const { data: publicUrl } = supabase.storage
    //   .from('packs')
    //   .getPublicUrl(`chapter-${chapterId}-pack.json`)

    // Mock chapter pack URL for now
    const chapterPackUrl = `https://storage.supabase.co/object/public/packs/chapter-${chapterId}-pack.json`

    res.json({
      chapter_pack_url: chapterPackUrl,
      winners_count: winners?.length || 0,
      total_payout: (winners?.length || 0) * shareAmount
    })

  } catch (error) {
    console.error('End chapter error:', error)
    res.status(500).json({
      error: 'internal_server_error',
      message: 'An unexpected error occurred'
    })
  }
})

// GET /v1/admin/chapters
router.get('/chapters', async (req: Request, res: Response) => {
  try {
    const supabaseClient = supabase()
    const { data: chapters, error } = await supabaseClient
      .from('chapters')
      .select(`
        id,
        title,
        status,
        starts_at,
        ends_at,
        pot_lamports,
        winners(count)
      `)
      .order('id', { ascending: false })

    if (error) {
      console.error('Failed to fetch chapters:', error)
      return res.status(500).json({
        error: 'internal_server_error',
        message: 'Failed to fetch chapters'
      })
    }

    res.json({
      chapters: chapters?.map(chapter => ({
        ...chapter,
        winners_count: chapter.winners?.[0]?.count || 0
      })) || []
    })

  } catch (error) {
    console.error('Get chapters error:', error)
    res.status(500).json({
      error: 'internal_server_error',
      message: 'An unexpected error occurred'
    })
  }
})

// GET /v1/admin/chapters/:id/winners
router.get('/chapters/:id/winners', async (req: Request, res: Response) => {
  try {
    const chapterId = parseInt(req.params.id)
    const supabaseClient = supabase()

    const { data: winners, error } = await supabaseClient
      .from('winners')
      .select(`
        id,
        rank,
        claim_address,
        claim_tx,
        claimed_at,
        users!inner(
          id,
          email
        )
      `)
      .eq('chapter_id', chapterId)
      .order('rank', { ascending: true })

    if (error) {
      console.error('Failed to fetch winners:', error)
      return res.status(500).json({
        error: 'internal_server_error',
        message: 'Failed to fetch winners'
      })
    }

    res.json({
      winners: winners?.map(winner => ({
        rank: winner.rank,
        user_id: (winner.users as any).id,
        email: (winner.users as any).email,
        address: winner.claim_address,
        tx: winner.claim_tx,
        claimed_at: winner.claimed_at
      })) || []
    })

  } catch (error) {
    console.error('Get winners error:', error)
    res.status(500).json({
      error: 'internal_server_error',
      message: 'An unexpected error occurred'
    })
  }
})

export default router
