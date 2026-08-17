import { Trash2 } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { Button } from '../common/Button'
import { Specification } from '../../constants/specifications'

interface SpecificationListProps {
  specifications: Specification[]
  onRemove?: (id: string) => void
  emptyLabel?: string
}

export function SpecificationList({ specifications, onRemove, emptyLabel = 'No specifications added yet.' }: SpecificationListProps) {
  const { theme } = useTheme()

  if (specifications.length === 0) {
    return (
      <div className="text-center py-6 border-2 border-dashed rounded-lg opacity-60" style={{ borderColor: theme.colors.border }}>
        <p>{emptyLabel}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {specifications.map((spec, index) => (
        <div
          key={spec.id}
          className="p-3 rounded-lg flex items-center justify-between gap-3 border"
          style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}
        >
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5"
              style={{ backgroundColor: `${theme.colors.primary}20`, color: theme.colors.primary }}
            >
              {index + 1}
            </div>
            <div className="min-w-0">
              <div className="font-semibold" style={{ color: theme.colors.text }}>{spec.testName}</div>
              {(spec.specification || spec.reference) && (
                <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                  {spec.specification}
                  {spec.reference ? `${spec.specification ? ' · ' : ''}Ref: ${spec.reference}` : ''}
                </div>
              )}
              {spec.isNumerical && (
                <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                  Range: {spec.min} - {spec.max} {spec.unit || ''}
                </div>
              )}
            </div>
          </div>
          {onRemove && (
            <Button variant="ghost" onClick={() => onRemove(spec.id)}>
              <Trash2 size={16} className="text-red-500 cursor-pointer" />
            </Button>
          )}
        </div>
      ))}
    </div>
  )
}
