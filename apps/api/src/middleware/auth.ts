import { Request, Response, NextFunction } from 'express'
import axios from 'axios'
import { supabase } from '../services/supabase'

interface PrivyUser {
  id: string
  email?: {
    address: string
  }
  wallet?: {
    address: string
  }
}

interface AuthRequest extends Request {
  user?: PrivyUser
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'Missing or invalid authorization header'
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix
    
    // TODO: Replace with actual Privy token verification
    // For now, we'll mock the verification process
    try {
      // Real implementation would be:
      // const response = await axios.get('https://auth.privy.io/api/v1/users/me', {
      //   headers: { Authorization: `Bearer ${token}` }
      // })
      // const user = response.data
      
      // Mock user for development
      const mockUser: PrivyUser = {
        id: 'mock-user-id',
        email: { address: 'user@example.com' },
        wallet: { address: 'SoL...MockAddress' }
      }
      
      // Create or get user record in database
      const supabaseClient = supabase()
      const { data: existingUser } = await supabaseClient
        .from('users')
        .select('id')
        .eq('privy_user_id', mockUser.id)
        .single()
      
      let userId: string
      if (existingUser) {
        userId = existingUser.id
      } else {
        // Create new user
        const { data: newUser, error: userError } = await supabaseClient
          .from('users')
          .insert({
            privy_user_id: mockUser.id,
            email: mockUser.email?.address
          })
          .select('id')
          .single()
        
        if (userError) {
          console.error('Failed to create user:', userError)
          return res.status(500).json({
            error: 'internal_server_error',
            message: 'Failed to create user record'
          })
        }
        userId = newUser.id
      }
      
      // Add database user ID to the request
      req.user = {
        ...mockUser,
        id: userId
      }
      next()
    } catch (error) {
      console.error('Privy token verification failed:', error)
      return res.status(401).json({
        error: 'unauthorized',
        message: 'Invalid or expired token'
      })
    }
  } catch (error) {
    console.error('Auth middleware error:', error)
    return res.status(500).json({
      error: 'internal_server_error',
      message: 'Authentication service unavailable'
    })
  }
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      error: 'unauthorized',
      message: 'Authentication required'
    })
  }

  // TODO: Check if user is in admin allowlist
  const adminEmails = process.env.ADMIN_EMAIL_ALLOWLIST?.split(',') || []
  const userEmail = req.user.email?.address

  if (!userEmail || !adminEmails.includes(userEmail)) {
    return res.status(403).json({
      error: 'forbidden',
      message: 'Admin access required'
    })
  }

  next()
}
