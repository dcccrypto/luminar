// Load environment variables FIRST
import dotenv from 'dotenv'

// Load .env file from the api directory
const result = dotenv.config({ path: '.env' })
if (result.error) {
  console.error('Error loading .env file:', result.error)
} else {
  console.log('✓ .env file loaded successfully')
}

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

// Coming Soon Mode - Set to true to disable all API endpoints
const COMING_SOON_MODE = process.env.COMING_SOON_MODE === 'true' || true // Default to true for now

// Import routes
import cluesRouter from './routes/clues'
import chaptersRouter from './routes/chapters'
import adminRouter from './routes/admin'
import userRouter from './routes/user'

// Import middleware
import { authMiddleware } from './middleware/auth'
import { turnstileMiddleware } from './middleware/turnstile'

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002'
  ],
  credentials: true
}))

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Coming Soon Mode Middleware
if (COMING_SOON_MODE) {
  app.use('/v1/*', (req, res) => {
    res.status(503).json({
      error: 'service_unavailable',
      message: 'Luminar is currently in development. All features will be available at launch.',
      coming_soon: true
    })
  })
} else {
  // API routes with versioning
  app.use('/v1/clues', authMiddleware, turnstileMiddleware, cluesRouter)
  app.use('/v1/chapters', authMiddleware, chaptersRouter)
  app.use('/v1/admin', authMiddleware, adminRouter)
  app.use('/v1/user', authMiddleware, userRouter)
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err)
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'invalid_json',
      message: 'Invalid JSON in request body'
    })
  }
  
  res.status(500).json({
    error: 'internal_server_error',
    message: 'An unexpected error occurred'
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'not_found',
    message: 'Endpoint not found'
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Luminar API server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
})

export default app
