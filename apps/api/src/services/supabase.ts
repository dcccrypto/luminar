import { createClient } from '@supabase/supabase-js'

let supabaseClient: any = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Debug logging
    console.log('Environment check:')
    console.log('SUPABASE_URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓ Set' : '✗ Missing')

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables:')
      console.error('SUPABASE_URL:', supabaseUrl)
      console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing')
      throw new Error('Missing Supabase environment variables')
    }

    // Create Supabase client with service role key for backend operations
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  
  return supabaseClient
}

// Export the function for use in routes
export { getSupabaseClient as supabase }

// Database schema types (these would be generated from your actual schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          privy_user_id: string
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          privy_user_id: string
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          privy_user_id?: string
          email?: string | null
          created_at?: string
        }
      }
      chapters: {
        Row: {
          id: number
          title: string
          starts_at: string
          ends_at: string
          status: 'scheduled' | 'active' | 'ended'
          code_hash: string
          pot_lamports: number
        }
        Insert: {
          id?: number
          title: string
          starts_at: string
          ends_at: string
          status: 'scheduled' | 'active' | 'ended'
          code_hash: string
          pot_lamports?: number
        }
        Update: {
          id?: number
          title?: string
          starts_at?: string
          ends_at?: string
          status?: 'scheduled' | 'active' | 'ended'
          code_hash?: string
          pot_lamports?: number
        }
      }
      clues: {
        Row: {
          id: number
          chapter_id: number
          order_index: number
          prompt: string
          answer_hash: string
        }
        Insert: {
          id?: number
          chapter_id: number
          order_index: number
          prompt: string
          answer_hash: string
        }
        Update: {
          id?: number
          chapter_id?: number
          order_index?: number
          prompt?: string
          answer_hash?: string
        }
      }
      proofs: {
        Row: {
          id: string
          user_id: string
          chapter_id: number
          clue_id: number
          proof_hash: string
          verified_at: string
        }
        Insert: {
          id?: string
          user_id: string
          chapter_id: number
          clue_id: number
          proof_hash: string
          verified_at: string
        }
        Update: {
          id?: string
          user_id?: string
          chapter_id?: number
          clue_id?: number
          proof_hash?: string
          verified_at?: string
        }
      }
      qualifications: {
        Row: {
          id: number
          user_id: string
          chapter_id: number
          completed_at: string
          rank: number | null
        }
        Insert: {
          id?: number
          user_id: string
          chapter_id: number
          completed_at: string
          rank?: number | null
        }
        Update: {
          id?: number
          user_id?: string
          chapter_id?: number
          completed_at?: string
          rank?: number | null
        }
      }
      winners: {
        Row: {
          id: number
          chapter_id: number
          user_id: string
          rank: number
          claim_address: string | null
          claim_tx: string | null
          claimed_at: string | null
        }
        Insert: {
          id?: number
          chapter_id: number
          user_id: string
          rank: number
          claim_address?: string | null
          claim_tx?: string | null
          claimed_at?: string | null
        }
        Update: {
          id?: number
          chapter_id?: number
          user_id?: string
          rank?: number
          claim_address?: string | null
          claim_tx?: string | null
          claimed_at?: string | null
        }
      }
      throttles: {
        Row: {
          user_id: string
          clue_id: number
          next_allowed_at: string
        }
        Insert: {
          user_id: string
          clue_id: number
          next_allowed_at: string
        }
        Update: {
          user_id?: string
          clue_id?: number
          next_allowed_at?: string
        }
      }
    }
  }
}
