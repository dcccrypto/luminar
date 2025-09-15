/**
 * Supabase client for realtime subscriptions
 * Used only for client-side realtime features (slots ticker, etc.)
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with anon key for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// =============================================================================
// REALTIME SUBSCRIPTIONS
// =============================================================================

export interface SlotsUpdate {
  chapter_id: number
  remaining: number
}

/**
 * Subscribe to slots updates for a chapter
 * Returns a cleanup function to unsubscribe
 */
export function subscribeToSlots(
  chapterId: number,
  onUpdate: (data: SlotsUpdate) => void
): () => void {
  const channel = supabase
    .channel(`slots-${chapterId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'winners',
        filter: `chapter_id=eq.${chapterId}`,
      },
      (payload) => {
        // Recalculate remaining slots based on winners table changes
        // This is a simplified calculation - in production, you might want
        // to fetch the actual count from the API
        console.log('Winners table updated:', payload)
        
        // Trigger a slots update (you might want to fetch actual data)
        onUpdate({
          chapter_id: chapterId,
          remaining: 0, // This should be calculated properly
        })
      }
    )
    .subscribe()

  // Return cleanup function
  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to chapter status updates
 */
export function subscribeToChapterStatus(
  chapterId: number,
  onUpdate: (status: string) => void
): () => void {
  const channel = supabase
    .channel(`chapter-${chapterId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'chapters',
        filter: `id=eq.${chapterId}`,
      },
      (payload) => {
        const newStatus = payload.new?.status
        if (newStatus) {
          onUpdate(newStatus)
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get the current user's ID from Supabase auth
 * Note: This assumes you're using Supabase auth alongside Privy
 * You might not need this if you're only using Privy
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

/**
 * Check if the user is authenticated with Supabase
 * Note: This might not be needed if you're only using Privy
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}
