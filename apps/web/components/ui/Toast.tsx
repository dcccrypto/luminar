import React, { useEffect } from 'react'
import { clsx } from 'clsx'

interface ToastProps {
  type: 'success' | 'error' | 'neutral'
  message: string
  onClose: () => void
  duration?: number
}

export function Toast({ type, message, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div
        className={clsx(
          'rounded-luminar shadow-luminar p-4 flex items-center justify-between',
          {
            'toast-success': type === 'success',
            'toast-error': type === 'error',
            'toast-neutral': type === 'neutral',
          }
        )}
      >
        <div className="flex items-center space-x-3">
          <div className="text-lg">
            {type === 'success' && '✅'}
            {type === 'error' && '❌'}
            {type === 'neutral' && 'ℹ️'}
          </div>
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-current opacity-70 hover:opacity-100"
        >
          ×
        </button>
      </div>
    </div>
  )
}
