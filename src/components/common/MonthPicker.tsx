import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import moment from 'moment'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

interface MonthPickerProps {
  value: moment.Moment
  onChange: (month: moment.Moment) => void
}

const MONTHS = Array.from({ length: 12 }, (_, i) => moment().month(i).format('MMM'))

export function MonthPicker({ value, onChange }: MonthPickerProps) {
  const { theme } = useTheme()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(value.year())
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null)

  const updatePosition = () => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    setRect({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 240) })
  }

  const handleOpen = () => {
    setViewYear(value.year())
    setOpen(o => !o)
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
        popoverRef.current && !popoverRef.current.contains(target)
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

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className="px-3 py-2 rounded-md border flex items-center gap-2 text-sm transition"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          color: theme.colors.text,
        }}
      >
        <Calendar size={15} style={{ color: theme.colors.textSecondary }} />
        {value.format('MMMM YYYY')}
      </button>

      {open && rect && createPortal(
        <div
          ref={popoverRef}
          className="fixed z-50 rounded-lg overflow-hidden p-3"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            boxShadow: `0 10px 30px ${theme.colors.overlay}`,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewYear(y => y - 1)}
              className="p-1 rounded-md cursor-pointer"
              style={{ color: theme.colors.textSecondary }}
              aria-label="Previous year"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium" style={{ color: theme.colors.text }}>{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear(y => y + 1)}
              className="p-1 rounded-md cursor-pointer"
              style={{ color: theme.colors.textSecondary }}
              aria-label="Next year"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1">
            {MONTHS.map((label, index) => {
              const selected = value.year() === viewYear && value.month() === index
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    onChange(moment([viewYear, index, 1]))
                    setOpen(false)
                  }}
                  className="text-sm py-2 rounded-md cursor-pointer transition-colors"
                  style={{
                    backgroundColor: selected ? theme.colors.primary : 'transparent',
                    color: selected ? (theme.name === 'dark' ? theme.colors.background : '#fff') : theme.colors.text,
                    fontWeight: selected ? 600 : 400,
                  }}
                  onMouseEnter={e => {
                    if (!selected) e.currentTarget.style.backgroundColor = theme.colors.surfaceVariant
                  }}
                  onMouseLeave={e => {
                    if (!selected) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
