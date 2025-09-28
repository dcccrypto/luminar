'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, Environment } from '@react-three/drei'

function TigersEyeModel3D() {
  const { scene } = useGLTF('/tigers_eye.glb')
  
  return (
    <primitive 
      object={scene} 
      scale={[1, 1, 1]} 
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  )
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="text-muted">Loading 3D Model...</div>
    </div>
  )
}

interface TigersEye3DProps {
  size: number
}

export function TigersEye3D({ size }: TigersEye3DProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [canRender, setCanRender] = useState(false)

  useEffect(() => {
    // Ensure we're fully mounted before rendering 3D content
    setIsMounted(true)
    
    // Additional delay to ensure WebGL context is ready
    const timer = setTimeout(() => {
      // Double-check WebGL is still available
      try {
        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
        if (gl && (gl instanceof WebGLRenderingContext || gl instanceof WebGL2RenderingContext)) {
          setCanRender(true)
        }
      } catch (error) {
        console.warn('WebGL context check failed:', error)
      }
    }, 300) // Additional delay for WebGL context

    return () => clearTimeout(timer)
  }, [])

  if (!isMounted || !canRender) {
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
        }}
      >
        <div className="text-muted">Loading...</div>
      </div>
    )
  }

  return (
    <div 
      className="tigers-eye-container"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        margin: '0 auto',
        pointerEvents: 'none',
        userSelect: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={0.6} />
          <pointLight position={[-10, -10, -5]} intensity={0.3} />
          
          {/* Environment for better reflections */}
          <Environment preset="sunset" />
          
          {/* Tigers Eye Model */}
          <TigersEyeModel3D />
        </Suspense>
      </Canvas>
      
      {/* Subtle rotation animation */}
      <style jsx>{`
        .tigers-eye-container canvas {
          animation: slowRotate 30s linear infinite;
        }
        
        @keyframes slowRotate {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }
        
        .tigers-eye-container:hover {
          transform: none !important;
        }
      `}</style>
    </div>
  )
}

// Preload the model
useGLTF.preload('/tigers_eye.glb')
