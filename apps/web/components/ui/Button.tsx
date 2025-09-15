import React from 'react'
import { clsx } from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={clsx(
        // Base styles
        'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-glow focus:ring-offset-2 focus:ring-offset-bg',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        
        // Variants
        {
          'btn-primary': variant === 'primary',
          'bg-transparent text-text hover:bg-surface-2 px-4 py-2 rounded-luminar': variant === 'ghost',
          'bg-error/20 text-error hover:bg-error/30 px-4 py-2 rounded-luminar': variant === 'danger',
        },
        
        // Sizes
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
