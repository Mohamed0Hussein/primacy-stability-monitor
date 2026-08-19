import moment from 'moment'
import { CheckCircle2, Clock } from 'lucide-react'
import { useTheme } from '../../hooks/useTheme'
import { Specification, SubmittedResult, formatRange } from '../../constants/specifications'

interface SubmittedResultsViewProps {
  result: SubmittedResult
  specifications: Specification[]
  title?: string
}

export function SubmittedResultsView({ result, specifications, title = 'Submitted Results' }: SubmittedResultsViewProps) {
  const { theme } = useTheme()

  return (
    <div className="space-y-4">
      <h4 className="font-medium mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
        <CheckCircle2 size={16} style={{ color: theme.colors.success }} />
        {title}
      </h4>
      <div className="grid grid-cols-1 gap-4">
        {specifications.map(spec => {
          const value = result[spec.testName] as string | undefined;
          const numVal = parseFloat(value ?? '');
          const isOutOfLimits = spec.isNumerical && !isNaN(numVal) && (
            (spec.min && numVal < parseFloat(spec.min)) ||
            (spec.max && numVal > parseFloat(spec.max))
          );

          return (
            <div
              key={spec.id}
              className="p-3 rounded-lg border flex flex-col justify-center transition-all duration-300"
              style={{
                borderColor: isOutOfLimits ? '#EAB308' : theme.colors.border,
                backgroundColor: isOutOfLimits ? 'rgba(234, 179, 8, 0.05)' : theme.colors.background,
                boxShadow: isOutOfLimits ? '0 0 10px rgba(234, 179, 8, 0.1)' : '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <div className="flex justify-between items-start mb-1">
                <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>
                  {spec.testName}
                </p>
                {isOutOfLimits && (
                  <span className="text-[8px] font-bold uppercase bg-yellow-500/20 text-yellow-600 px-1.5 py-0.5 rounded-full">
                    Out of Limits
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold" style={{ color: isOutOfLimits ? '#CA8A04' : theme.colors.primary }}>
                  {value || 'N/A'} {spec.isNumerical ? (spec.unit || '') : ''}
                </p>
              </div>
              {spec.isNumerical && (
                <p className="text-[10px] mt-1" style={{ color: theme.colors.textSecondary }}>
                  Limit: {formatRange(spec.min, spec.max, spec.unit)}
                </p>
              )}
            </div>
          );
        })}
      </div>
      {result.createdAt && (
        <div
          className="mt-6 pt-4 border-t flex items-center gap-2 text-xs"
          style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}
        >
          <Clock size={12} />
          <span>Recorded on {moment(result.createdAt).format('MMMM DD, YYYY [at] HH:mm')}</span>
        </div>
      )}
    </div>
  )
}
