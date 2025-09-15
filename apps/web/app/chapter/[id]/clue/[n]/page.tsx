'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Toast } from '@/components/ui/Toast'
import { submitClue } from '@/lib/api'

interface Clue {
  id: number
  order_index: number
  prompt: string
  image_url: string
  solved: boolean
  fragment?: string
}

export default function CluePage() {
  const { ready, authenticated, getAccessToken } = usePrivy()
  const params = useParams()
  const router = useRouter()
  const chapterId = parseInt(params.id as string)
  const clueNumber = parseInt(params.n as string)
  
  const [clue, setClue] = useState<Clue | null>(null)
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'neutral', message: string } | null>(null)

  useEffect(() => {
    if (ready && authenticated) {
      // TODO: Replace with actual API call
      // fetchClue(chapterId, clueNumber).then(setClue).finally(() => setLoading(false))
      
      // Mock data for now
      setClue({
        id: clueNumber,
        order_index: clueNumber,
        prompt: `Look carefully at the image. What fragment do you see hidden in clue ${clueNumber}?`,
        image_url: '/api/placeholder/1280/720',
        solved: false,
      })
      setLoading(false)
    }
  }, [ready, authenticated, chapterId, clueNumber])

  const handleSubmit = async () => {
    if (!answer.trim()) return
    
    setSubmitting(true)
    try {
      // Get access token from Privy
      const accessToken = await getAccessToken()
      if (!accessToken) {
        setToast({ type: 'error', message: 'Authentication required. Please sign in.' })
        return
      }

      // Get Turnstile token (mock for now)
      const turnstileToken = 'mock-turnstile-token'
      
      // Call the actual API
      const response = await submitClue(clue!.id, { answer }, accessToken, turnstileToken)
      
      setClue(prev => prev ? { ...prev, solved: true, fragment: response.fragment } : null)
      setToast({ type: 'success', message: 'Correct! Fragment revealed.' })
      setTimeout(() => router.push(`/chapter/${chapterId}`), 1500)
      
    } catch (error) {
      console.error('Clue submission error:', error)
      if (error instanceof Error) {
        if (error.message.includes('invalid_answer')) {
          setToast({ type: 'error', message: 'Incorrect answer. Try again.' })
        } else if (error.message.includes('already_solved')) {
          setToast({ type: 'error', message: 'You have already solved this clue.' })
        } else {
          setToast({ type: 'error', message: error.message })
        }
      } else {
        setToast({ type: 'error', message: 'Something went wrong. Please try again.' })
      }
      setAnswer('')
    } finally {
      setSubmitting(false)
    }
  }

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-muted">Loading clue...</div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Card>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-text mb-4">
              Authentication Required
            </h2>
            <p className="text-muted mb-6">
              Please connect your wallet to access this clue.
            </p>
            <Button onClick={() => router.push('/')}>
              Go Home
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!clue) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-error">Clue not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* App Shell */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => router.push(`/chapter/${chapterId}`)}
                className="mr-4"
              >
                ← Back to Chapter
              </Button>
              <h1 className="text-2xl font-bold text-text">Luminar</h1>
            </div>
            <div className="text-muted">
              Clue {clueNumber} of 3
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Pane */}
          <div className="space-y-4">
            <Card>
              <div className="aspect-video bg-surface-2 rounded-luminar overflow-hidden">
                <img 
                  src={clue.image_url} 
                  alt={`Clue ${clueNumber} - A faint code glows near the lower edge.`}
                  className="w-full h-full object-cover"
                />
              </div>
            </Card>
            
            {/* Accessibility Controls */}
            <div className="flex justify-between items-center">
              <Button variant="ghost" size="sm">
                Increase Glow Contrast
              </Button>
              <Button variant="ghost" size="sm">
                Tap to Zoom
              </Button>
            </div>
          </div>

          {/* Input Pane */}
          <div className="space-y-6">
            <Card>
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-text mb-2">
                    Clue {clueNumber}
                  </h2>
                  <p className="text-muted">
                    {clue.prompt}
                  </p>
                </div>

                {clue.solved ? (
                  <div className="text-center py-8">
                    <div className="text-2xl font-mono text-success mb-2">
                      {clue.fragment}
                    </div>
                    <p className="text-muted">Fragment revealed!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Input
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Enter your answer..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                      disabled={submitting}
                    />
                    
                    <Button 
                      onClick={handleSubmit}
                      disabled={!answer.trim() || submitting}
                      className="w-full"
                    >
                      {submitting ? 'Submitting...' : 'Submit Answer'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Helper Text */}
            <Card>
              <div className="text-sm text-muted">
                <h3 className="font-medium text-text mb-2">Tips:</h3>
                <ul className="space-y-1">
                  <li>• Look for subtle patterns or hidden text</li>
                  <li>• Try zooming in on different areas</li>
                  <li>• The fragment might be partially transparent</li>
                  <li>• Wrong answers have a 10-second cooldown</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
