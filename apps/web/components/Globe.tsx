'use client'

import React from 'react'

interface GlobeProps {
  size?: number
  className?: string
}

export function Globe({ size = 400, className = '' }: GlobeProps) {
  return (
    <div 
      className={`globe-container ${className}`}
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
      {/* Globe SVG */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 400 400"
        className="globe-svg"
        style={{
          filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.1))',
        }}
      >
        {/* Globe background circle */}
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="url(#globeGradient)"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="2"
        />
        
        {/* Globe gradient definition */}
        <defs>
          <radialGradient id="globeGradient" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="50%" stopColor="#16213e" />
            <stop offset="100%" stopColor="#0f0f23" />
          </radialGradient>
          
          {/* Grid pattern for globe surface */}
          <pattern id="globeGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        
        {/* Globe surface with grid */}
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="url(#globeGrid)"
        />
        
        {/* Latitude lines */}
        <ellipse
          cx="200"
          cy="200"
          rx="180"
          ry="90"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
        <ellipse
          cx="200"
          cy="200"
          rx="180"
          ry="45"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
        <ellipse
          cx="200"
          cy="200"
          rx="180"
          ry="135"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
        
        {/* Longitude lines */}
        <path
          d="M 200 20 Q 380 200 200 380"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
        <path
          d="M 200 20 Q 20 200 200 380"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
        <path
          d="M 200 20 Q 290 200 200 380"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
        <path
          d="M 200 20 Q 110 200 200 380"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="1"
        />
        
        {/* Subtle glow effect */}
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
          opacity="0.5"
        />
      </svg>
      
      {/* Subtle rotation animation */}
      <style jsx>{`
        .globe-svg {
          animation: slowRotate 60s linear infinite;
        }
        
        @keyframes slowRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .globe-container:hover {
          transform: none !important;
        }
      `}</style>
    </div>
  )
}
