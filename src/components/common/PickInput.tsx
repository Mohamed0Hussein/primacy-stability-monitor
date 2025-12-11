import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

type Option = {
  label: string
  value: string
}

type PickProps = {
  value: string | string[] | null
  onChange: (value: string | string[]) => void
  options: Option[] | Option[][]
  multiple?: boolean
  placeholder?: string
  disabled?: boolean
}

export default function Pick({
  value,
  onChange,
  options,
  multiple = false,
  placeholder = 'Select...',
  disabled,
}: PickProps) {
  const { theme } = useTheme()
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  const groups = Array.isArray(options[0])
    ? (options as Option[][])
    : [options as Option[]]

  const onPrimary =
    theme.name === 'dark'
      ? theme.colors.background
      : '#fff'

  /* ✅ Click outside */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isSelected = (v: string) =>
    multiple
      ? Array.isArray(value) && value.includes(v)
      : value === v

  const toggle = (v: string) => {
    if (disabled) return

    if (!multiple) {
      onChange(v)
      setOpen(false)
      return
    }

    const current = Array.isArray(value) ? value : []
    onChange(
      current.includes(v)
        ? current.filter(x => x !== v)
        : [...current, v]
    )
  }

  const displayLabel = () => {
    if (!value || (Array.isArray(value) && value.length === 0))
      return placeholder

    const flat = groups.flat()

    if (!multiple)
      return flat.find(o => o.value === value)?.label ?? placeholder

    return (value as string[])
      .map(v => flat.find(o => o.value === v)?.label)
      .join(', ')
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-2 rounded-md flex items-center justify-between text-sm transition"
        style={{
          backgroundColor: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          color: theme.colors.text,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span className="truncate">{displayLabel()}</span>
        <ChevronDown size={16} />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md overflow-hidden"
          style={{
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: `0 10px 30px ${theme.colors.overlay}`,
          }}
        >
          <div className="max-h-64 overflow-auto p-1">
            {groups.map((group, groupIndex) => (
              <div key={groupIndex}>
                {group.map(opt => {
                  const active = isSelected(opt.value)

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggle(opt.value)}
                      className="w-full text-left px-3 py-2 rounded text-sm transition-colors"
                      style={{
                        backgroundColor: active
                          ? theme.colors.primary
                          : 'transparent',
                        color: active
                          ? onPrimary
                          : theme.colors.text,
                      }}
                      onMouseEnter={e => {
                        if (!active)
                          e.currentTarget.style.backgroundColor =
                            theme.colors.surfaceVariant
                      }}
                      onMouseLeave={e => {
                        if (!active)
                          e.currentTarget.style.backgroundColor =
                            'transparent'
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}

                {/* Separator */}
                {groupIndex < groups.length - 1 && (
                  <div
                    className="h-px my-1"
                    style={{ backgroundColor: theme.colors.border }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
