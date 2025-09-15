'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CodeBar } from '@/components/CodeBar'
import { SlotsTicker } from '@/components/SlotsTicker'
import { ClueCard } from '@/components/ClueCard'
import { getUserProgress } from '@/lib/api'

interface Chapter {
  id: number
  title: string
  status: 'scheduled' | 'active' | 'ended'
  clues: Array<{
    id: number
    order_index: number
    prompt: string
    image_url: string
    solved: boolean
  }>
  fragments: string[]
  qualified: boolean
  rank?: number
}

export default function ChapterPage() {
  const { ready, authenticated, getAccessToken } = usePrivy()
  const params = useParams()
  const chapterId = parseInt(params.id as string)
  
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ready && authenticated) {
      loadChapterData()
    }
  }, [ready, authenticated, chapterId])

  const loadChapterData = async () => {
    try {
      const accessToken = await getAccessToken()
      if (!accessToken) {
        setLoading(false)
        return
      }

      // Load user progress to check which clues are solved
      const progress = await getUserProgress(accessToken)
      const solvedClueIds = new Set(progress.proofs.map(p => p.clue_id))
      const isQualified = progress.qualifications.some(q => q.chapter_id === chapterId)

      // Mock chapter data (in real app, this would come from API)
      setChapter({
        id: chapterId,
        title: 'Hidden Glow',
        status: 'active',
        clues: [
          { 
            id: 1, 
            order_index: 1, 
            prompt: 'Find the first glowing fragment in the image.', 
            image_url: '/api/placeholder/1280/720',
            solved: solvedClueIds.has(1)
          },
          { 
            id: 2, 
            order_index: 2, 
            prompt: 'Find the second glowing fragment in the image.', 
            image_url: '/api/placeholder/1280/720',
            solved: solvedClueIds.has(2)
          },
          { 
            id: 3, 
            order_index: 3, 
            prompt: 'Find the numeric fragment glowing at the edge.', 
            image_url: '/api/placeholder/1280/720',
            solved: solvedClueIds.has(3)
          },
        ],
        fragments: [
          solvedClueIds.has(1) ? 'lu' : '??',
          solvedClueIds.has(2) ? 'mi' : '??',
          solvedClueIds.has(3) ? '042' : '??'
        ],
        qualified: isQualified,
      })
    } catch (error) {
      console.error('Failed to load chapter data:', error)
      // Fallback to mock data
      setChapter({
        id: chapterId,
        title: 'Hidden Glow',
        status: 'active',
        clues: [
          { id: 1, order_index: 1, prompt: 'Find the first glowing fragment in the image.', image_url: '/api/placeholder/1280/720', solved: false },
          { id: 2, order_index: 2, prompt: 'Find the second glowing fragment in the image.', image_url: '/api/placeholder/1280/720', solved: false },
          { id: 3, order_index: 3, prompt: 'Find the numeric fragment glowing at the edge.', image_url: '/api/placeholder/1280/720', solved: false },
        ],
        fragments: ['??', '??', '??'],
        qualified: false,
      })
    } finally {
      setLoading(false)
    }
  }

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-muted">Loading chapter...</div>
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
              Please connect your wallet to access this chapter.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Go Home
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-error">Chapter not found</div>
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
                onClick={() => window.location.href = '/'}
                className="mr-4"
              >
                ← Back
              </Button>
              <h1 className="text-2xl font-bold text-text">Luminar</h1>
            </div>
            <div className="flex items-center space-x-4">
              <SlotsTicker chapterId={chapterId} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-text mb-2">
            {chapter.title}
          </h2>
          <p className="text-muted">
            Solve all three clues to reveal the chapter code and qualify for rewards.
          </p>
        </div>

        {/* Code Bar */}
        <div className="mb-8">
          <CodeBar fragments={chapter.fragments} />
        </div>

        {/* Clues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {chapter.clues.map((clue) => (
            <ClueCard
              key={clue.id}
              clue={clue}
              chapterId={chapterId}
              onFragmentRevealed={(fragment) => {
                // TODO: Update fragments state
                console.log('Fragment revealed:', fragment)
              }}
            />
          ))}
        </div>

        {/* Qualify Button */}
        {chapter.fragments.every(f => f !== '??') && !chapter.qualified && (
          <div className="text-center">
            <Button 
              onClick={() => {
                // TODO: Call qualify API
                console.log('Qualifying for chapter', chapterId)
              }}
              className="px-8 py-4 text-lg"
            >
              Submit Chapter Code
            </Button>
          </div>
        )}

        {/* Qualified Status */}
        {chapter.qualified && (
          <div className="text-center">
            <Card className="max-w-md mx-auto">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-success mb-2">
                  🎉 You're Qualified!
                </h3>
                <p className="text-muted mb-4">
                  You're #{chapter.rank} of 10 winners
                </p>
                <Button 
                  onClick={() => window.location.href = `/claim/${chapterId}`}
                  className="w-full"
                >
                  Claim Your Reward
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
