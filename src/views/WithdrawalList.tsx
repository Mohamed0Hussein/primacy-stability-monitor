import { useState } from 'react'
import moment from 'moment'
import { Printer } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { Button } from '../components/common/Button'
import { MonthPicker } from '../components/common/MonthPicker'
import { WithdrawalTable } from '../components/withdrawal/WithdrawalTable'
import { printSection } from '../utils/print'

export default function WithdrawalList() {
  const { theme } = useTheme()
  const [targetMonth, setTargetMonth] = useState(() => moment())
  const monthStart = targetMonth.clone().startOf('month')
  const monthEnd = targetMonth.clone().endOf('month')

  return (
    <div className="min-h-full p-8 pb-32" style={{ backgroundColor: theme.colors.background }}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.text }}>
              Monthly Withdrawal List
            </h1>
            <p style={{ color: theme.colors.textSecondary }}>
              {monthStart.format('DD/MM/YYYY')} - {monthEnd.format('DD/MM/YYYY')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <MonthPicker value={targetMonth} onChange={setTargetMonth} />
            <Button variant="ghost" onClick={() => printSection('printable-withdrawal')} className="flex items-center gap-2">
              <Printer size={16} />
              Print
            </Button>
          </div>
        </div>

        <div id="printable-withdrawal">
          <h2 className="hidden print:block text-xl font-bold mb-1 text-black">
            Monthly Withdrawal List — {targetMonth.format('MMMM YYYY')}
          </h2>
          <p className="hidden print:block text-sm mb-4 text-black">
            {monthStart.format('DD/MM/YYYY')} - {monthEnd.format('DD/MM/YYYY')}
          </p>
          <WithdrawalTable targetMonth={targetMonth} />
        </div>
      </div>
    </div>
  )
}
