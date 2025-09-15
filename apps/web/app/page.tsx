'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SlotsTicker } from '@/components/SlotsTicker'

export default function HomePage() {
  const { ready, authenticated, user, login } = usePrivy()

  if (!ready) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-muted">Loading...</div>
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
              <h1 className="text-2xl font-bold text-text">Luminar</h1>
            </div>
            <div className="flex items-center space-x-4">
              <SlotsTicker chapterId={1} />
              {authenticated ? (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-muted">
                    {user?.email?.address || 'Connected'}
                  </div>
                  <div className="w-8 h-8 bg-surface-2 rounded-full flex items-center justify-center">
                    <span className="text-xs text-text">
                      {user?.email?.address?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
              ) : (
                <Button onClick={login}>
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-text mb-4">
            Chapter One: Hidden Glow
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Solve three clues to reveal fragments that combine into a chapter code. 
            The first 10 users to submit the correct code can claim equal shares of the prize pool.
          </p>
        </div>

        {authenticated ? (
          <div className="max-w-md mx-auto">
            <Card>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-text mb-4">
                  Ready to Begin?
                </h3>
                <p className="text-muted mb-6">
                  Enter Chapter One and start solving clues to reveal the hidden fragments.
                </p>
                <Button 
                  onClick={() => window.location.href = '/chapter/1'}
                  className="w-full"
                >
                  Start Chapter
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <Card>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-text mb-4">
                  Connect to Play
                </h3>
                <p className="text-muted mb-6">
                  Connect your wallet to start solving clues and competing for SOL rewards.
                </p>
                <Button onClick={login} className="w-full">
                  Connect Wallet
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
