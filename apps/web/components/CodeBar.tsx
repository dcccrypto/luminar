'use client'

import React from 'react'
import { Card } from './ui/Card'

interface CodeBarProps {
  fragments: string[]
}

export function CodeBar({ fragments }: CodeBarProps) {
  const isComplete = fragments.every(f => f !== '??')
  
  return (
    <Card>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-text mb-4">
          Chapter Code
        </h3>
        <div className="flex justify-center items-center space-x-2">
          {fragments.map((fragment, index) => (
            <React.Fragment key={index}>
              <div 
                className={`
                  px-4 py-2 rounded-luminar font-mono text-lg
                  ${fragment === '??' 
                    ? 'bg-surface-2 text-muted' 
                    : 'bg-glow/20 text-text code-glow'
                  }
                `}
              >
                {fragment}
              </div>
              {index < fragments.length - 1 && (
                <span className="text-muted text-lg">-</span>
              )}
            </React.Fragment>
          ))}
        </div>
        {isComplete && (
          <p className="text-sm text-success mt-3">
            🎉 All fragments revealed! You can now qualify for rewards.
          </p>
        )}
      </div>
    </Card>
  )
}
