import React from 'react'
import { Theme } from '../../themes/themes'

export const Grid = ({
  cols = 2,
  children,
}: {
  cols?: number
  children: React.ReactNode
}) => {
  const colsClass =
    cols === 3
      ? 'md:grid-cols-3'
      : cols === 1
        ? 'md:grid-cols-1'
        : 'md:grid-cols-2'

  return (
    <div className={`grid grid-cols-1 ${colsClass} gap-4`}>
      {children}
    </div>
  )
}

export const Field = ({ label, error, children, theme }: { label: string, error: string | undefined, children: React.ReactNode, theme: Theme }) => (
  <div className="space-y-1">
    <label
      className="text-sm font-medium"
      style={{ color: theme.colors.textSecondary }}
    >
      {label}
    </label>
    {children}
    {error && (
      <p className="text-xs" style={{ color: theme.colors.error }}>
        {error}
      </p>
    )}
  </div>
)
