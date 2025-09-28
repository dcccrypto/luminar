'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Only load the 3D component when absolutely safe
const TigersEye3D = dynamic(() => import('./TigersEye3D').then(mod => ({ default: mod.TigersEye3D })), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-muted">Loading 3D Model...</div>
    </div>
  )
})

interface SafeTigersEyeProps {
  size?: number
  className?: string
}

// Enhanced fallback with better styling
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
        animation: 'pulse 2s ease-in-out infinite',
      }}
    >
      <div className="text-muted text-center">
        <div className="text-2xl mb-2">🔮</div>
        <div className="text-sm">Loading 3D Model...</div>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export function SafeTigersEye({ size = 300, className = '' }: SafeTigersEyeProps) {
  const [isSafe, setIsSafe] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Multiple safety checks with delays
    const checkSafety = async () => {
      // Wait for DOM to be ready
      if (typeof window === 'undefined') return
      
      // Wait for document ready state
      if (document.readyState !== 'complete') {
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(true)
          } else {
            document.addEventListener('readystatechange', () => {
              if (document.readyState === 'complete') {
                resolve(true)
              }
            })
          }
        })
      }

      // Additional delay to ensure everything is stable
      await new Promise(resolve => setTimeout(resolve, 500))

      // Check WebGL support
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        
        if (gl && (gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext)) {
          // Test WebGL context
          const testTexture = gl.createTexture()
          if (testTexture) {
            gl.deleteTexture(testTexture)
            setIsSafe(true)
          }
        }
      } catch (error) {
        console.warn('WebGL safety check failed:', error)
        setHasError(true)
      }
    }

    checkSafety()
  }, [])

  // Show fallback if not safe or if there was an error
  if (!isSafe || hasError) {
    return <TigersEyeFallback size={size} />
  }

  return (
    <div className={className}>
      <TigersEye3D size={size} />
    </div>
  )
}
