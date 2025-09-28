'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { SlotsTicker } from '@/components/SlotsTicker'
import { SafeTigersEye } from '@/components/SafeTigersEye' // Ultra-safe 3D component

export default function HomePage() {
  const { ready, authenticated, user, login } = usePrivy()
  
  // Coming Soon Mode - Set to true to disable all user interactions
  const COMING_SOON_MODE = true

  // Function to copy contract address to clipboard
  const copyContractAddress = async () => {
    try {
      const contractAddress = "0x1234567890abcdef1234567890abcdef12345678" // Replace with actual contract address
      await navigator.clipboard.writeText(contractAddress)
      alert('Contract address copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy contract address: ', err)
      alert('Failed to copy contract address')
    }
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Coming Soon Banner */}
      {COMING_SOON_MODE && (
        <div className="bg-glow/20 border-b border-glow/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="text-center">
              <p className="text-sm text-glow">
                🚀 Luminar is launching soon! Follow us on X for updates.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* App Shell */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-text">Luminar</h1>
              {COMING_SOON_MODE && (
                <span className="ml-3 px-2 py-1 bg-glow/20 text-glow text-xs rounded-full">
                  Coming Soon
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {!COMING_SOON_MODE && <SlotsTicker chapterId={1} />}
              {COMING_SOON_MODE ? (
                <div className="text-sm text-muted">
                  Launching Soon
                </div>
              ) : authenticated ? (
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
                <div className="text-sm text-muted">
                  Connect to Play
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Centered Globe */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        {/* Tigers Eye Model Section - Perfectly Centered */}
        <div className="flex flex-col justify-center items-center mb-16">
          <SafeTigersEye size={300} />
          <label className="globe-label text-lg text-muted mt-4">
            Discover the Hidden Fragments
          </label>
          
          {/* Contract Address Section */}
          <div className="mt-8 flex flex-col items-center space-y-3">
            <label className="text-sm text-muted">Contract Address:</label>
            <div className="flex items-center space-x-2 bg-surface-2 rounded-lg px-4 py-2">
              <input 
                type="text" 
                value="0x1234567890abcdef1234567890abcdef12345678" 
                readOnly 
                className="bg-transparent text-text text-sm font-mono min-w-0 flex-1 outline-none"
                id="contractAddress"
              />
              <button 
                onClick={copyContractAddress}
                className="bg-glow/20 hover:bg-glow/30 text-text px-3 py-1 rounded text-sm font-medium transition-colors"
                id="copyContractAddressBtn"
              >
                Copy
              </button>
              <a 
                href="https://x.com/luminar_game" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Follow X
                </button>
              </a>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-text mb-4">
            Chapter One: Hidden Glow
          </h2>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Solve three clues to reveal fragments that combine into a chapter code. 
            The first 10 users to submit the correct code can claim equal shares of the prize pool.
          </p>
        </div>

        {COMING_SOON_MODE ? (
          <div className="max-w-md mx-auto">
            <Card>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-text mb-4">
                  🚀 Coming Soon
                </h3>
                <p className="text-muted mb-6">
                  Luminar is launching soon! Follow us on X to be the first to know when the game goes live.
                </p>
                
                {/* Coming Soon Message */}
                <div className="bg-glow/10 border border-glow/20 rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted">
                    The game is currently in development. All features will be available at launch.
                  </p>
                </div>
                
                {/* Single Coming Soon Button */}
                <Button 
                  disabled
                  className="w-full mb-4 opacity-50 cursor-not-allowed"
                >
                  Game Features Coming Soon
                </Button>
              </div>
            </Card>
          </div>
        ) : authenticated ? (
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
                
                {/* Connect Wallet Button */}
                <Button 
                  onClick={login} 
                  className="w-full mb-4"
                >
                  Connect Wallet
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
      
      {/* Custom styles for globe label */}
      <style jsx>{`
        .globe-label {
          display: block;
          text-align: center;
          margin-top: 16px;
          font-weight: 500;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  )
}
