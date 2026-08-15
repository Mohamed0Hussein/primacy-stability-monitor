import React from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
}

export function Modal({ open, onClose, title, subtitle, children }: ModalProps) {
  const { theme } = useTheme()

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: theme.colors.overlay }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] rounded-2xl border overflow-hidden flex flex-col"
        style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
      >
        <div
          className="flex items-start justify-between gap-4 p-5 border-b"
          style={{ borderColor: theme.colors.border }}
        >
          <div>
            <h2 className="text-lg font-semibold" style={{ color: theme.colors.text }}>{title}</h2>
            {subtitle && (
              <p className="text-sm mt-0.5" style={{ color: theme.colors.textSecondary }}>{subtitle}</p>
            )}
          </div>
          <Button variant="ghost" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>
        <div className="p-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
