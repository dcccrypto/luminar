import React from 'react'
import { clsx } from 'clsx'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated'
  children: React.ReactNode
}

export function Card({ variant = 'default', className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-luminar shadow-luminar',
        {
          'card': variant === 'default',
          'card-elevated': variant === 'elevated',
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
