'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ErrorBoundary } from './ErrorBoundary'

// Dynamically import the 3D component with no SSR and additional safety
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

// Fallback component for SSR and error states
function TigersEyeFallback({ size }: { size: number }) {
  return (
    <div 
      className="tigers-eye-container"
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
        boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="text-muted text-center">
        <div className="text-lg mb-2">🔮</div>
        <div className="text-sm">Loading 3D Model...</div>
      </div>
    </div>
  )
}

export function TigersEyeModel({ size = 300, className = '' }: TigersEyeModelProps) {
  const [isClient, setIsClient] = useState(false)
  const [isWebGLSupported, setIsWebGLSupported] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== 'undefined') {
      setIsClient(true)
      
      // Add a delay to ensure DOM is fully ready
      const timer = setTimeout(() => {
        // Check WebGL support with more comprehensive validation
        try {
          const canvas = document.createElement('canvas')
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
          
          if (gl) {
            // Additional WebGL context validation
            const isWebGLValid = gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext
            setIsWebGLSupported(isWebGLValid)
            
            if (isWebGLValid) {
              // Additional delay to ensure everything is ready
              setTimeout(() => {
                setIsReady(true)
              }, 100)
            }
          } else {
            setIsWebGLSupported(false)
          }
        } catch (error) {
          console.warn('WebGL not supported:', error)
          setIsWebGLSupported(false)
        }
      }, 200) // Initial delay to ensure DOM is ready

      return () => clearTimeout(timer)
    }
  }, [])

  // Show fallback during SSR, if WebGL is not supported, or if not ready
  if (!isClient || !isWebGLSupported || !isReady) {
    return <TigersEyeFallback size={size} />
  }

  return (
    <div className={className}>
      <ErrorBoundary fallback={<TigersEyeFallback size={size} />}>
        <TigersEye3D size={size} />
      </ErrorBoundary>
    </div>
  )
}
