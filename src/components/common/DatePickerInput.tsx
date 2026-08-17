import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'

interface Props {
  label: string
  value: Date | null
  onChange: (date: Date) => void
  disabled?: boolean
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const pad = (n: number) => String(n).padStart(2, '0')
const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()

function buildMonthGrid(viewDate: Date) {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const startWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: { date: Date; inMonth: boolean }[] = []
  for (let i = startWeekday; i > 0; i--) {
    cells.push({ date: new Date(year, month, 1 - i), inMonth: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true })
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].date
    cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false })
  }
  return cells
}

export const DatePickerInput = ({ label, value, onChange, disabled }: Props) => {
  const { theme } = useTheme()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => value || new Date())
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null)

  const today = new Date()

  const updatePosition = () => {
    if (!triggerRef.current) return
    const r = triggerRef.current.getBoundingClientRect()
    setRect({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 260) })
  }

  const handleOpen = () => {
    if (disabled) return
    setViewDate(value || new Date())
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

  const cells = buildMonthGrid(viewDate)

  return (
    <div className="space-y-1 flex flex-col">
      {label && (
        <label className="text-sm font-medium" style={{ color: theme.colors.text }}>
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleOpen}
        className="w-full px-3 py-2 rounded-md border flex items-center justify-between gap-2 text-sm transition"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          color: value ? theme.colors.text : theme.colors.textSecondary,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <span>{value ? formatDate(value) : 'Select date'}</span>
        <Calendar size={15} style={{ color: theme.colors.textSecondary }} />
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
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              className="p-1 rounded-md cursor-pointer"
              style={{ color: theme.colors.textSecondary }}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium" style={{ color: theme.colors.text }}>
              {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              className="p-1 rounded-md cursor-pointer"
              style={{ color: theme.colors.textSecondary }}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS.map(w => (
              <div
                key={w}
                className="text-center text-[10px] font-semibold uppercase tracking-wide py-1"
                style={{ color: theme.colors.textSecondary }}
              >
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map(({ date, inMonth }, i) => {
              const selected = value && isSameDay(date, value)
              const isToday = isSameDay(date, today)

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(date)
                    setOpen(false)
                  }}
                  className="text-xs h-8 rounded-md cursor-pointer transition-colors"
                  style={{
                    backgroundColor: selected ? theme.colors.primary : 'transparent',
                    color: selected
                      ? (theme.name === 'dark' ? theme.colors.background : '#fff')
                      : inMonth ? theme.colors.text : theme.colors.textSecondary,
                    opacity: inMonth ? 1 : 0.4,
                    boxShadow: !selected && isToday ? `inset 0 0 0 1px ${theme.colors.primary}` : 'none',
                    fontWeight: selected ? 600 : 400,
                  }}
                  onMouseEnter={e => {
                    if (!selected) e.currentTarget.style.backgroundColor = theme.colors.surfaceVariant
                  }}
                  onMouseLeave={e => {
                    if (!selected) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  {date.getDate()}
                </button>
              )
            })}
          </div>

          <div className="mt-2 pt-2 flex justify-center" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
            <button
              type="button"
              onClick={() => {
                onChange(today)
                setOpen(false)
              }}
              className="text-xs font-medium cursor-pointer"
              style={{ color: theme.colors.primary }}
            >
              Today
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
