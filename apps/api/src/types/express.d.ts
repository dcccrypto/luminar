import { Request } from 'express'

interface PrivyUser {
  id: string
  email?: {
    address: string
  }
  wallet?: {
    address: string
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: PrivyUser
      turnstileVerified?: boolean
    }
  }
}

export {}
