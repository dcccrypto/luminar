'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the 3D component with no SSR
const TigersEye3D = dynamic(() => import('./TigersEye3D').then(mod => ({ default: mod.TigersEye3D })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-muted">Loading 3D Model...</div>
    </div>
  )
})

interface TigersEyeModelProps {
  size?: number
  className?: string
}

export function TigersEyeModel({ size = 300, className = '' }: TigersEyeModelProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Fallback for SSR - show a placeholder
    return (
      <div 
        className={`tigers-eye-container ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          position: 'relative',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#1a1a2e',
          borderRadius: '50%',
          border: '2px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="text-muted">Loading 3D Model...</div>
      </div>
    )
  }

  return (
    <div className={className}>
      <TigersEye3D size={size} />
    </div>
  )
}
