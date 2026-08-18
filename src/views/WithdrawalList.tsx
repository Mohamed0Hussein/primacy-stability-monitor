import moment from 'moment'
import { useTheme } from '../hooks/useTheme'
import { WithdrawalTable } from '../components/withdrawal/WithdrawalTable'

export default function WithdrawalList() {
  const { theme } = useTheme()
  const now = moment()
  const monthStart = now.clone().startOf('month')
  const monthEnd = now.clone().endOf('month')

  return (
    <div className="min-h-full p-8 pb-32" style={{ backgroundColor: theme.colors.background }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.text }}>
            Monthly Withdrawal List
          </h1>
          <p style={{ color: theme.colors.textSecondary }}>
            {monthStart.format('DD/MM/YYYY')} - {monthEnd.format('DD/MM/YYYY')}
          </p>
        </div>

        <WithdrawalTable />
      </div>
    </div>
  )
}
