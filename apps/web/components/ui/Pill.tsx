import React from 'react'
import { clsx } from 'clsx'

interface PillProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'error' | 'warning'
  children: React.ReactNode
}

export function Pill({ variant = 'default', className, children, ...props }: PillProps) {
  return (
    <div
      className={clsx(
        'pill inline-flex items-center',
        {
          'bg-surface-2 text-muted': variant === 'default',
          'bg-success/20 text-success': variant === 'success',
          'bg-error/20 text-error': variant === 'error',
          'bg-warning/20 text-warning': variant === 'warning',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
