import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

type Option = {
  label: string
  value: any
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
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null)

  const groups = Array.isArray(options[0])
    ? (options as Option[][])
    : [options as Option[]]

  // Dropdown renders in a portal (not clipped by any ancestor's overflow:hidden,
  // e.g. the collapsible test-result cards this sits inside on TestDetails)
  const updatePosition = () => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    setRect({ top: r.bottom + 4, left: r.left, width: r.width })
  }

  useLayoutEffect(() => {
    if (open) updatePosition()
  }, [open])

  useEffect(() => {
    if (!open) return

    const handler = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }
    const reposition = () => updatePosition()

    document.addEventListener('mousedown', handler)
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      document.removeEventListener('mousedown', handler)
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open])

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

    const selectedCount = (value as string[]).length
    if (selectedCount === 1) {
      return flat.find(o => o.value === (value as string[])[0])?.label ?? placeholder
    }
    return `${selectedCount} selected`
  }

  return (
    <>
      <button
        ref={triggerRef}
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
        <ChevronDown
          size={16}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </button>

      {open && rect && createPortal(
        <div
          ref={dropdownRef}
          className="fixed z-50 rounded-md overflow-hidden"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
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
                      className="w-full text-left px-3 py-2 rounded text-sm transition-all flex items-center gap-3"
                      style={{
                        backgroundColor: active && !multiple
                          ? theme.colors.primary
                          : 'transparent',
                        color: active && !multiple
                          ? (theme.name === 'dark' ? theme.colors.background : '#fff')
                          : theme.colors.text,
                      }}
                      onMouseEnter={e => {
                        if (!active || multiple)
                          e.currentTarget.style.backgroundColor =
                            theme.colors.surfaceVariant
                      }}
                      onMouseLeave={e => {
                        if (!active || multiple)
                          e.currentTarget.style.backgroundColor =
                            'transparent'
                      }}
                    >
                      {/* Checkbox for multi-select */}
                      {multiple && (
                        <div
                          className="shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                          style={{
                            borderColor: active ? theme.colors.primary : theme.colors.border,
                            backgroundColor: active ? theme.colors.primary : 'transparent',
                          }}
                        >
                          {active && (
                            <Check
                              size={12}
                              strokeWidth={3}
                              style={{
                                color: theme.name === 'dark' ? theme.colors.background : '#fff'
                              }}
                            />
                          )}
                        </div>
                      )}
                      <span className="flex-1">{opt.label}</span>
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
        </div>,
        document.body
      )}
    </>
  )
}
