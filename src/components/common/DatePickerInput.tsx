// components/common/DatePickerInput.tsx
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useTheme } from '../../hooks/useTheme'

interface Props {
  label: string
  value: Date | null
  onChange: (date: Date) => void
  disabled?: boolean
}

export const DatePickerInput = ({
  label,
  value,
  onChange,
  disabled,
}: Props) => {
  const { theme } = useTheme()

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium" style={{ color: theme.colors.text }}>
        {label}
      </label>

      <DatePicker
        selected={value}
        onChange={(d) => d && onChange(d)}
        disabled={disabled}
        dateFormat="yyyy-MM-dd"
        className="w-full px-3 py-2 rounded-md border"
      />
    </div>
  )
}
