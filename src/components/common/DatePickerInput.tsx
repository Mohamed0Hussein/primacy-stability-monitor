// components/common/DatePickerInput.tsx
import { forwardRef } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useTheme } from '../../hooks/useTheme'

interface Props {
  label: string
  value: Date | null
  onChange: (date: Date) => void
  disabled?: boolean
}

interface DatePickerInputProps {
  value?: string
  onClick?: () => void
  disabled?: boolean
  onChange?: () => void
}

const ThemedInput = forwardRef<HTMLInputElement, DatePickerInputProps>(
  ({ value, onClick, disabled }, ref) => {
    const { theme } = useTheme()

    return (
      <input
        ref={ref}
        value={value ?? ''}
        onClick={onClick}
        disabled={disabled}
        readOnly
        className="w-full px-3 py-2 rounded-md border"
        style={{
          borderColor: theme.colors.border,
          color: theme.colors.text,
          backgroundColor: theme.colors.surface,
          outline: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 2px ${theme.colors.primary}`
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
    )
  }
)

ThemedInput.displayName = 'ThemedInput'

export const DatePickerInput = ({
  label,
  value,
  onChange,
  disabled,
}: Props) => {
  const { theme } = useTheme()

  return (
    <div className="space-y-1 flex">
      <label
        className="text-sm font-medium"
        style={{ color: theme.colors.text }}
      >
        {label}
      </label>

      <DatePicker
        selected={value}
        onChange={(d) => d && onChange(d)}
        disabled={disabled}
        dateFormat="yyyy-MM-dd"
        customInput={<ThemedInput />}
        wrapperClassName='flex-1'
      />
    </div>
  )
}
