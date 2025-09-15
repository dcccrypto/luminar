import { Request, Response, NextFunction } from 'express'
import axios from 'axios'

interface TurnstileRequest extends Request {
  turnstileVerified?: boolean
}

export async function turnstileMiddleware(req: TurnstileRequest, res: Response, next: NextFunction) {
  try {
    const turnstileToken = req.headers['x-turnstile-token'] as string
    
    if (!turnstileToken) {
      return res.status(403).json({
        error: 'bot_check_failed',
        message: 'Turnstile token required'
      })
    }

    // TODO: Replace with actual Turnstile verification
    // For now, we'll mock the verification process
    try {
      // Real implementation would be:
      // const response = await axios.post('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      //   secret: process.env.TURNSTILE_SECRET_KEY,
      //   response: turnstileToken,
      //   remoteip: req.ip
      // })
      // 
      // if (!response.data.success) {
      //   return res.status(403).json({
      //     error: 'bot_check_failed',
      //     message: 'Turnstile verification failed'
      //   })
      // }
      
      // Mock verification for development
      const mockSuccess = Math.random() > 0.1 // 90% success rate for demo
      
      if (!mockSuccess) {
        return res.status(403).json({
          error: 'bot_check_failed',
          message: 'Turnstile verification failed'
        })
      }
      
      req.turnstileVerified = true
      next()
    } catch (error) {
      console.error('Turnstile verification error:', error)
      return res.status(403).json({
        error: 'bot_check_failed',
        message: 'Turnstile verification service unavailable'
      })
    }
  } catch (error) {
    console.error('Turnstile middleware error:', error)
    return res.status(500).json({
      error: 'internal_server_error',
      message: 'Bot protection service unavailable'
    })
  }
}
