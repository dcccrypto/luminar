'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Toast } from '@/components/ui/Toast'

interface Chapter {
  id: number
  title: string
  status: 'scheduled' | 'active' | 'ended'
  starts_at: string
  ends_at: string
  pot_lamports: number
  winners_count: number
}

export default function AdminPage() {
  const { ready, authenticated, user } = usePrivy()
  const router = useRouter()
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'neutral', message: string } | null>(null)

  useEffect(() => {
    if (ready && authenticated && user) {
      // TODO: Check if user is admin based on env allowlist
      // const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAIL_ALLOWLIST?.split(',') || []
      // setIsAdmin(adminEmails.includes(user.email?.address || ''))
      
      // Mock admin check for now
      setIsAdmin(true)
      
      if (isAdmin) {
        // TODO: Replace with actual API call
        // fetchChapters().then(setChapters).finally(() => setLoading(false))
        
        // Mock data for now
        setChapters([
          {
            id: 1,
            title: 'Hidden Glow',
            status: 'active',
            starts_at: '2024-01-01T00:00:00Z',
            ends_at: '2024-01-31T23:59:59Z',
            pot_lamports: 7500000000, // 7.5 SOL
            winners_count: 3,
          },
        ])
      }
      setLoading(false)
    }
  }, [ready, authenticated, user, isAdmin])

  const handleEndChapter = async (chapterId: number) => {
    try {
      // TODO: Replace with actual API call
      // const response = await endChapter(chapterId)
      
      // Mock response for now
      const mockResponse = {
        success: true,
        chapter_pack_url: `https://storage.supabase.co/object/public/packs/chapter-${chapterId}-pack.json`
      }
      
      if (mockResponse.success) {
        setChapters(prev => prev.map(ch => 
          ch.id === chapterId ? { ...ch, status: 'ended' as const } : ch
        ))
        setToast({ 
          type: 'success', 
          message: `Chapter ended. Pack URL: ${mockResponse.chapter_pack_url}` 
        })
      } else {
        setToast({ 
          type: 'error', 
          message: 'Failed to end chapter. Please try again.' 
        })
      }
    } catch (error) {
      setToast({ 
        type: 'error', 
        message: 'Something went wrong. Please try again.' 
      })
    }
  }

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-muted">Loading...</div>
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
              Please connect your wallet to access the admin panel.
            </p>
            <Button onClick={() => router.push('/')}>
              Go Home
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Card>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-text mb-4">
              Access Denied
            </h2>
            <p className="text-muted mb-6">
              You don't have permission to access the admin panel.
            </p>
            <Button onClick={() => router.push('/')}>
              Go Home
            </Button>
          </div>
        </Card>
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
                onClick={() => router.push('/')}
                className="mr-4"
              >
                ← Back to Home
              </Button>
              <h1 className="text-2xl font-bold text-text">Luminar Admin</h1>
            </div>
            <div className="text-muted">
              {user?.email?.address}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-text mb-2">
            Chapter Management
          </h2>
          <p className="text-muted">
            Manage chapters, view winners, and end active chapters.
          </p>
        </div>

        {/* Chapters List */}
        <div className="space-y-6">
          {chapters.map((chapter) => (
            <Card key={chapter.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <h3 className="text-xl font-semibold text-text">
                      Chapter {chapter.id}: {chapter.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      chapter.status === 'active' ? 'bg-success/20 text-success' :
                      chapter.status === 'ended' ? 'bg-muted/20 text-muted' :
                      'bg-glow/20 text-glow'
                    }`}>
                      {chapter.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted">Starts:</span>
                      <div className="text-text">
                        {new Date(chapter.starts_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted">Ends:</span>
                      <div className="text-text">
                        {new Date(chapter.ends_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted">Prize Pool:</span>
                      <div className="text-text">
                        {(chapter.pot_lamports / 1e9).toFixed(2)} SOL
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <span className="text-muted">Winners:</span>
                    <div className="text-text">
                      {chapter.winners_count} / 10
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-6">
                  <Button
                    variant="ghost"
                    onClick={() => window.open(`/chapter/${chapter.id}`, '_blank')}
                  >
                    View Chapter
                  </Button>
                  
                  {chapter.status === 'active' && (
                    <Button
                      onClick={() => handleEndChapter(chapter.id)}
                      className="bg-error/20 text-error hover:bg-error/30"
                    >
                      End Chapter
                    </Button>
                  )}
                  
                  {chapter.status === 'ended' && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        // TODO: Open chapter pack URL
                        console.log('View chapter pack')
                      }}
                    >
                      View Pack
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Create New Chapter */}
        <Card className="mt-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-text mb-4">
              Create New Chapter
            </h3>
            <p className="text-muted mb-6">
              Create and configure a new chapter for players to solve.
            </p>
            <Button
              onClick={() => {
                // TODO: Open create chapter modal/form
                console.log('Create new chapter')
              }}
            >
              Create Chapter
            </Button>
          </div>
        </Card>
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
