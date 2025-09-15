'use client'

import React, { useState } from 'react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

interface ClaimFormProps {
  chapterId: number
  amountSOL: number
  defaultAddress: string
  onClaim: (code: string, address: string) => Promise<void>
}

export function ClaimForm({ chapterId, amountSOL, defaultAddress, onClaim }: ClaimFormProps) {
  const [code, setCode] = useState('')
  const [address, setAddress] = useState(defaultAddress)
  const [showConfirm, setShowConfirm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || !address.trim()) return
    
    setSubmitting(true)
    try {
      await onClaim(code.trim(), address.trim())
    } catch (error) {
      console.error('Claim failed:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const isValidSolanaAddress = (addr: string) => {
    // Basic Solana address validation (base58, 32-44 chars)
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)
  }

  if (showConfirm) {
    return (
      <Card>
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-text mb-4">
              Confirm Claim
            </h3>
            <p className="text-muted mb-6">
              Please review your claim details. Payouts are final and cannot be reversed.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-surface-2 p-4 rounded-luminar">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted">Amount:</span>
                  <div className="text-text font-semibold">{amountSOL} SOL</div>
                </div>
                <div>
                  <span className="text-muted">Chapter:</span>
                  <div className="text-text font-semibold">{chapterId}</div>
                </div>
              </div>
            </div>

            <div>
              <span className="text-muted text-sm">Code:</span>
              <div className="font-mono text-text bg-surface-2 p-3 rounded-luminar mt-1">
                {code}
              </div>
            </div>

            <div>
              <span className="text-muted text-sm">Recipient Address:</span>
              <div className="font-mono text-text bg-surface-2 p-3 rounded-luminar mt-1 break-all">
                {address}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              variant="ghost"
              onClick={() => setShowConfirm(false)}
              className="flex-1"
              disabled={submitting}
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Confirm Claim'}
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <form onSubmit={(e) => { e.preventDefault(); setShowConfirm(true) }} className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-text mb-4">
            Claim Your Reward
          </h3>
          <p className="text-muted">
            Enter the chapter code and your Solana address to claim {amountSOL} SOL.
          </p>
        </div>

        <div className="space-y-4">
          <Input
            label="Chapter Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter the complete chapter code..."
            required
          />

          <Input
            label="Solana Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your Solana wallet address..."
            required
            error={address && !isValidSolanaAddress(address) ? 'Invalid Solana address format' : undefined}
          />
        </div>

        <div className="bg-surface-2 p-4 rounded-luminar">
          <div className="text-sm text-muted">
            <p className="font-medium text-text mb-2">⚠️ Important:</p>
            <ul className="space-y-1">
              <li>• Payouts are final and cannot be reversed</li>
              <li>• Make sure your address is correct</li>
              <li>• You can only claim once per chapter</li>
            </ul>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!code.trim() || !address.trim() || !isValidSolanaAddress(address)}
        >
          Continue to Confirm
        </Button>
      </form>
    </Card>
  )
}
