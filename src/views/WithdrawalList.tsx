import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import moment from 'moment'
import { CalendarCheck, Eye, FlaskConical } from 'lucide-react'

import { useTheme } from '../hooks/useTheme'
import { Button } from '../components/common/Button'
import { Card } from '../components/common/Card'
import { getProducts } from '../utils/api/products'
import { queryKeys } from '../constants/query_keys'
import LoadingSpinner from '../components/common/LoadingSpinner'

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
  date: moment.Moment
}

export default function WithdrawalList() {
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
      .flatMap((product: Product) =>
        (product.tests || [])
          .filter(test => !hasResult(product, test) && moment(test.date).isSame(currentMonth, 'month'))
          .map(test => ({
            productId: product._id,
            testId: test._id,
            productName: product.productName,
            batchNumber: product.batchNumber,
            condition: test.condition,
            date: moment(test.date),
          }))
      )
      .sort((a, b) => a.date.diff(b.date))
  }, [products])

  const getStatusColor = (date: moment.Moment) => {
    const diffDays = date.diff(moment().startOf('day'), 'days')
    if (diffDays < 0) return theme.colors.error
    if (diffDays <= 7) return theme.colors.warning
    return theme.colors.success
  }

  return (
    <div className="min-h-full p-8 pb-32" style={{ backgroundColor: theme.colors.background }}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.text }}>
            Withdrawal Schedule
          </h1>
          <p style={{ color: theme.colors.textSecondary }}>
            Tests due for result entry in {now.format('MMMM YYYY')}
          </p>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <LoadingSpinner fullScreen={false} size="md" loadingLabel="Loading schedule..." />
          ) : items.length === 0 ? (
            <Card className="p-8 text-center flex flex-col items-center justify-center gap-3">
              <CalendarCheck size={48} className="text-gray-300 dark:text-gray-600" />
              <p style={{ color: theme.colors.textSecondary }}>
                No withdrawals scheduled for {now.format('MMMM YYYY')}.
              </p>
            </Card>
          ) : (
            items.map((item, i) => (
              <Card key={`${item.productId}-${item.condition}-${i}`} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-1.5 self-stretch rounded-full"
                      style={{ backgroundColor: getStatusColor(item.date) }}
                    />
                    <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${theme.colors.primary}20`, color: theme.colors.primary }}>
                      <FlaskConical size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: theme.colors.text }}>{item.productName}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                        <span>Batch: {item.batchNumber}</span>
                        <span>{item.condition.replace('-', ' - ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-gray-800">
                    <div className="text-right flex-1 md:flex-auto">
                      <p className="text-xs uppercase font-bold tracking-wider" style={{ color: theme.colors.textSecondary }}>Due</p>
                      <p className="font-medium" style={{ color: getStatusColor(item.date) }}>
                        {item.date.format('MMM DD, YYYY')} ({item.date.fromNow()})
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => navigate(`/product/${item.productId}/tests${item.testId ? `?testId=${item.testId}` : ''}`)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Eye size={16} />
                      Enter Result
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
