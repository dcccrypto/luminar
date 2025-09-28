'use client'

import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Environment } from '@react-three/drei'

interface TigersEyeModelProps {
  size?: number
  className?: string
}

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

export function TigersEyeModel({ size = 300, className = '' }: TigersEyeModelProps) {
  return (
    <div 
      className={`tigers-eye-container ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: 'relative',
        margin: '0 auto',
        pointerEvents: 'none', // Disable all interactions
        userSelect: 'none', // Prevent text selection
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
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
          
          {/* Auto-rotation animation */}
          <mesh rotation={[0, 0, 0]}>
            <TigersEyeModel3D />
          </mesh>
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
