'use client'

import React from 'react'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { Pill } from './ui/Pill'

interface Clue {
  id: number
  order_index: number
  prompt: string
  image_url: string
}

interface ClueCardProps {
  clue: Clue
  chapterId: number
  onFragmentRevealed: (fragment: string) => void
}

export function ClueCard({ clue, chapterId, onFragmentRevealed }: ClueCardProps) {
  const [solved, setSolved] = React.useState(false)
  const [fragment, setFragment] = React.useState<string | null>(null)

  const handleEnterClue = () => {
    window.location.href = `/chapter/${chapterId}/clue/${clue.order_index}`
  }

  return (
    <Card>
      <div className="space-y-4">
        {/* Clue Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-text">
              Clue {clue.order_index}
            </h3>
            <p className="text-sm text-muted mt-1">
              {clue.prompt}
            </p>
          </div>
          <Pill variant={solved ? 'success' : 'default'}>
            {solved ? 'Solved' : 'Unsolved'}
          </Pill>
        </div>

        {/* Clue Image Preview */}
        <div className="aspect-video bg-surface-2 rounded-luminar overflow-hidden">
          <img 
            src={clue.image_url} 
            alt={`Clue ${clue.order_index} preview`}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Fragment Display */}
        {solved && fragment && (
          <div className="text-center py-3 bg-glow/10 rounded-luminar">
            <p className="text-sm text-muted mb-1">Fragment:</p>
            <p className="text-lg font-mono text-text code-glow">
              {fragment}
            </p>
          </div>
        )}

        {/* Action Button */}
        <Button 
          onClick={handleEnterClue}
          className="w-full"
          variant={solved ? 'ghost' : 'primary'}
        >
          {solved ? 'View Clue' : 'Solve Clue'}
        </Button>
      </div>
    </Card>
  )
}
