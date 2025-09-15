'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ClaimForm } from '@/components/ClaimForm'
import { Toast } from '@/components/ui/Toast'

interface ClaimData {
  chapterId: number
  rank: number
  amountLamports: number
  amountSOL: number
  claimed: boolean
  claimAddress?: string
  claimTx?: string
}

export default function ClaimPage() {
  const { ready, authenticated, user } = usePrivy()
  const params = useParams()
  const router = useRouter()
  const chapterId = parseInt(params.id as string)
  
  const [claimData, setClaimData] = useState<ClaimData | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'neutral', message: string } | null>(null)

  useEffect(() => {
    if (ready && authenticated) {
      // TODO: Replace with actual API call
      // fetchClaimData(chapterId).then(setClaimData).finally(() => setLoading(false))
      
      // Mock data for now
      setClaimData({
        chapterId,
        rank: 3,
        amountLamports: 750000000, // 0.75 SOL
        amountSOL: 0.75,
        claimed: false,
      })
      setLoading(false)
    }
  }, [ready, authenticated, chapterId])

  const handleClaim = async (code: string, claimAddress: string) => {
    try {
      // TODO: Replace with actual API call
      // const response = await claimReward(chapterId, code, claimAddress)
      
      // Mock response for now
      const isSuccess = Math.random() > 0.2 // 80% success rate for demo
      const mockResponse = {
        success: isSuccess,
        txSig: isSuccess ? '5mx...aK' : undefined,
        error: isSuccess ? undefined : 'payout_failed'
      }
      
      if (mockResponse.success) {
        setClaimData(prev => prev ? { 
          ...prev, 
          claimed: true, 
          claimAddress, 
          claimTx: mockResponse.txSig 
        } : null)
        setToast({ 
          type: 'success', 
          message: `Success! Transaction: ${mockResponse.txSig}` 
        })
      } else {
        setToast({ 
          type: 'error', 
          message: 'Claim failed. Please try again.' 
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
        <div className="text-muted">Loading claim data...</div>
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
              Please connect your wallet to access this page.
            </p>
            <Button onClick={() => router.push('/')}>
              Go Home
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (!claimData) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <Card>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-text mb-4">
              Not a Winner
            </h2>
            <p className="text-muted mb-6">
              You are not eligible to claim rewards for this chapter.
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
              <h1 className="text-2xl font-bold text-text">Luminar</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Rank Banner */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-success/20 rounded-full mb-4">
            <span className="text-3xl font-bold text-success">#{claimData.rank}</span>
          </div>
          <h2 className="text-3xl font-bold text-text mb-2">
            🎉 You're a Winner!
          </h2>
          <p className="text-muted">
            You're #{claimData.rank} of 10 winners for Chapter {chapterId}
          </p>
        </div>

        {/* Reward Amount */}
        <Card className="mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-text mb-2">
              {claimData.amountSOL} SOL
            </div>
            <p className="text-muted">
              Your share of the prize pool
            </p>
          </div>
        </Card>

        {/* Claim Status */}
        {claimData.claimed ? (
          <Card>
            <div className="text-center">
              <div className="text-2xl mb-4">✅</div>
              <h3 className="text-xl font-semibold text-success mb-2">
                Reward Claimed!
              </h3>
              <p className="text-muted mb-4">
                Your reward has been sent to:
              </p>
              <div className="font-mono text-sm bg-surface-2 p-3 rounded-luminar mb-4">
                {claimData.claimAddress}
              </div>
              {claimData.claimTx && (
                <div>
                  <p className="text-muted mb-2">Transaction:</p>
                  <a 
                    href={`https://solscan.io/tx/${claimData.claimTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-glow hover:underline"
                  >
                    {claimData.claimTx}
                  </a>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <ClaimForm
            chapterId={chapterId}
            amountSOL={claimData.amountSOL}
            defaultAddress={user?.wallet?.address || ''}
            onClaim={handleClaim}
          />
        )}
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
