import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import moment from 'moment'
import { CalendarCheck, Eye } from 'lucide-react'

import { useTheme } from '../../hooks/useTheme'
import { Button } from '../common/Button'
import { Card } from '../common/Card'
import { getProducts } from '../../utils/api/products'
import { queryKeys } from '../../constants/query_keys'
import { conditionDetails } from '../../constants/stability_conditions'
import LoadingSpinner from '../common/LoadingSpinner'

interface TestEntry {
  _id?: string
  condition: string
  date: string
}

interface TestResultEntry {
  testId: string
}

interface Product {
  _id: string
  productName: string
  batchNumber: string
  tests?: TestEntry[]
  testsResults?: TestResultEntry[]
}

interface WithdrawalItem {
  productId: string
  testId?: string
  productName: string
  batchNumber: string
  condition: string
  period: string
  date: moment.Moment
}

const ACCELERATED_PERIODS = ['1M', '3M', '6M']
const LONG_TERM_PERIODS = ['3M', '6M', '9M', '12M', '18M', '24M', '36M']

function formatCondition(condition: string) {
  const temp = Number(condition.split('-')[0]) as keyof typeof conditionDetails
  const type = condition.includes('Accelerated') ? 'Accelerated' : 'Long-term'
  return `${conditionDetails[temp] || condition} - ${type}`
}

// The Product name/Batch #/Period/Condition/Due date table — used standalone
// on the Withdrawal Schedule page and embedded directly on the Dashboard.
export function WithdrawalTable() {
  const { theme } = useTheme()
  const navigate = useNavigate()

  const { data: products = [], isLoading } = useQuery({
    queryKey: [queryKeys.get_products],
    queryFn: async () => {
      const response = await getProducts()
      return response.data
    },
  })

  const now = moment()

  const items = useMemo((): WithdrawalItem[] => {
    if (!Array.isArray(products)) return []

    const currentMonth = moment()
    const hasResult = (product: Product, test: TestEntry) =>
      (product.testsResults || []).some(r => r.testId === test._id)

    return products
      .flatMap((product: Product) => {
        // Period (1M/3M/6M...) isn't stored on the test — it's this test's
        // position among its own condition's tests, in schedule order.
        const byCondition = new Map<string, TestEntry[]>()
        for (const test of product.tests || []) {
          const list = byCondition.get(test.condition) || []
          list.push(test)
          byCondition.set(test.condition, list)
        }

        return Array.from(byCondition.entries()).flatMap(([condition, tests]) => {
          const periods = condition.includes('Accelerated') ? ACCELERATED_PERIODS : LONG_TERM_PERIODS
          return [...tests]
            .sort((a, b) => moment(a.date).diff(moment(b.date)))
            .map((test, index) => ({ test, period: periods[index] || '' }))
        })
          .filter(({ test }) => !hasResult(product, test) && moment(test.date).isSame(currentMonth, 'month'))
          .map(({ test, period }) => ({
            productId: product._id,
            testId: test._id,
            productName: product.productName,
            batchNumber: product.batchNumber,
            condition: test.condition,
            period,
            date: moment(test.date),
          }))
      })
      .sort((a, b) => a.date.diff(b.date))
  }, [products])

  const getStatus = (date: moment.Moment) => {
    const diffDays = date.diff(moment().startOf('day'), 'days')
    if (diffDays < 0) return { label: 'Overdue', color: theme.colors.error }
    if (diffDays <= 7) return { label: 'Due soon', color: theme.colors.warning }
    return { label: 'On track', color: theme.colors.success }
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen={false} size="md" loadingLabel="Loading schedule..." />
  }

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center flex flex-col items-center justify-center gap-3">
        <CalendarCheck size={48} className="text-gray-300 dark:text-gray-600" />
        <p style={{ color: theme.colors.textSecondary }}>
          No withdrawals scheduled for {now.format('MMMM YYYY')}.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ minWidth: 780 }}>
          <thead>
            <tr style={{ backgroundColor: theme.colors.surfaceVariant }}>
              {['Product name', 'Batch #', 'Period', 'Condition', 'Due date', 'Status', ''].map(h => (
                <th
                  key={h}
                  className="text-left px-4 py-3 font-semibold whitespace-nowrap"
                  style={{ color: theme.colors.textSecondary }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const status = getStatus(item.date)
              return (
                <tr
                  key={`${item.productId}-${item.condition}-${i}`}
                  className="border-t"
                  style={{ borderColor: theme.colors.border }}
                >
                  <td className="px-4 py-3 font-medium whitespace-nowrap" style={{ color: theme.colors.text }}>
                    {item.productName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: theme.colors.textSecondary }}>
                    {item.batchNumber}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: theme.colors.textSecondary }}>
                    {item.period}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: theme.colors.textSecondary }}>
                    {formatCondition(item.condition)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" style={{ color: theme.colors.textSecondary }}>
                    {item.date.format('DD/MM/YYYY')}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="text-xs font-semibold px-2 py-1 rounded-full"
                      style={{ backgroundColor: `${status.color}20`, color: status.color }}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <Button
                      variant="ghost"
                      onClick={() => navigate(`/product/${item.productId}/tests${item.testId ? `?testId=${item.testId}` : ''}`)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Eye size={16} />
                      Enter Result
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
