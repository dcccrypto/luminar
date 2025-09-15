'use client'

import React, { useState, useEffect } from 'react'
import { Pill } from './ui/Pill'

interface SlotsTickerProps {
  chapterId: number
}

export function SlotsTicker({ chapterId }: SlotsTickerProps) {
  const [remaining, setRemaining] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Replace with actual Supabase realtime subscription
    // const channel = supabase
    //   .channel(`slots-${chapterId}`)
    //   .on('postgres_changes', {
    //     event: '*',
    //     schema: 'public',
    //     table: 'winners',
    //     filter: `chapter_id=eq.${chapterId}`
    //   }, (payload) => {
    //     // Update remaining slots based on winners table changes
    //     fetchRemainingSlots()
    //   })
    //   .subscribe()

    // Mock data for now
    const fetchRemainingSlots = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch(`/api/v1/chapters/${chapterId}/slots`)
        // const data = await response.json()
        // setRemaining(data.remaining)
        
        // Mock data
        setRemaining(Math.floor(Math.random() * 10) + 1)
      } catch (error) {
        console.error('Failed to fetch remaining slots:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRemainingSlots()

    // Cleanup subscription on unmount
    return () => {
      // channel.unsubscribe()
    }
  }, [chapterId])

  if (loading) {
    return (
      <Pill>
        <div className="animate-pulse">Loading...</div>
      </Pill>
    )
  }

  if (remaining === null) {
    return (
      <Pill variant="error">
        Error
      </Pill>
    )
  }

  const isLow = remaining <= 3
  const isCritical = remaining === 0

  return (
    <Pill variant={isCritical ? 'error' : isLow ? 'warning' : 'default'}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          isCritical ? 'bg-error' : isLow ? 'bg-warning' : 'bg-success'
        }`} />
        <span>
          {remaining === 0 ? 'Full' : `${remaining} slots left`}
        </span>
      </div>
    </Pill>
  )
}
