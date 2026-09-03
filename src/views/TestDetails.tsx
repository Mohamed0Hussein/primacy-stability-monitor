import { useState, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import moment from 'moment'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Beaker,
} from 'lucide-react'

import { useTheme } from '../hooks/useTheme'
import { useToast } from '../hooks/useToast'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { TestResultForm } from '../components/specifications/TestResultForm'
import { SubmittedResultsView } from '../components/specifications/SubmittedResultsView'
import { Specification, SubmittedResult } from '../constants/specifications'
import { getProducts, addTestResult } from '../utils/api/products'
import { queryKeys } from '../constants/query_keys'
import ROUTE_PATHS from '../constants/route_paths'

interface TestResult {
  specName: string
  value: any
  status: 'pass' | 'fail' | 'pending'
}

interface Test {
  _id?: string
  condition: string
  date: string
  status: 'pending' | 'completed' | 'overdue'
  results?: TestResult[]
  specificationIds?: string[]
}

interface Product {
  _id: string
  productName: string
  batchNumber: string
  dosageForm: string
  strength: string
  packType: string
  tests?: Test[]
  testsResults?: TestResult[]
  specifications?: Specification[]
}

export default function TestDetails() {
  const { theme } = useTheme()
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { success, error: showError } = useToast()
  const queryClient = useQueryClient()

  const [expandedTest, setExpandedTest] = useState<string | null>(null)
  const targetTestId = searchParams.get('testId')

  const { data: products = [], isLoading } = useQuery({
    queryKey: [queryKeys.get_products],
    queryFn: async () => {
      const response = await getProducts()
      return response.data
    },
  })

  const product = useMemo(() => {
    return products.find((p: Product) => p._id === productId)
  }, [products, productId])

  const submitMutation = useMutation({
    mutationFn: async ({ testId, results }: { testId: string, results: object }) => {
      if (!productId) throw new Error('Product ID is missing')
      await addTestResult(productId, testId, results)
    },
    onSuccess: () => {
      success('Results submitted successfully!')
      queryClient.invalidateQueries({ queryKey: [queryKeys.get_products] })
      setExpandedTest(null)
      // Clear local state for this test is handled by the hook/rendering cycle via query invalidation
    },
    onError: (err) => {
      showError('Failed to submit results. Please try again.')
      console.error(err)
    }
  })

  const getTestStatus = (test: Test): 'pending' | 'completed' | 'overdue' => {
    if (test.results && test.results.length > 0) return 'completed'
    
    const testDate = moment(test.date)
    const now = moment().startOf('day')

    if (testDate.isBefore(now)) return 'overdue'
    return 'pending'
  }

  type EnrichedTest = Test & {
    key: string
    momentDate: moment.Moment
    computedStatus: 'pending' | 'completed' | 'overdue'
  }

  const groupedTests = useMemo((): { upcoming: EnrichedTest[], past: EnrichedTest[] } => {
    if (!product?.tests) return { upcoming: [], past: [] }

    const now = moment().startOf('day')
    const tests: EnrichedTest[] = product.tests.map((t: Test, index: number) => {
      // Filter results that belong to this specific test ID
      const resultsForTest = product.testsResults?.filter((r: any) => r.testId === t._id) || []
      
      const testWithResults = {
        ...t,
        results: resultsForTest
      }

      return {
        ...testWithResults,
        key: `${t.condition}-${t.date}-${index}`,
        momentDate: moment(t.date),
        computedStatus: getTestStatus(testWithResults as Test)
      }
    })

    return {
      upcoming: tests
        .filter((t: EnrichedTest) => t.momentDate.isSameOrAfter(now) && t.computedStatus !== 'completed')
        .sort((a: EnrichedTest, b: EnrichedTest) => a.momentDate.diff(b.momentDate)),
      past: tests
        .filter((t: EnrichedTest) => t.momentDate.isBefore(now) || t.computedStatus === 'completed')
        .sort((a: EnrichedTest, b: EnrichedTest) => b.momentDate.diff(a.momentDate))
    }
  }, [product])

  // Deep-link from the Withdrawal Schedule: focus on just that one test.
  const targetTest = useMemo(
    () => (targetTestId ? [...groupedTests.upcoming, ...groupedTests.past].find(t => t._id === targetTestId) : undefined),
    [targetTestId, groupedTests]
  )

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.colors.background }}
      >
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Beaker size={48} style={{ color: theme.colors.primary }} className="animate-bounce" />
          <p style={{ color: theme.colors.textSecondary }}>Loading test details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: theme.colors.background }}
      >
        <Card className="p-8 text-center max-w-md">
          <AlertCircle size={48} className="mx-auto mb-4" style={{ color: theme.colors.error }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text }}>
            Product Not Found
          </h2>
          <p className="mb-6" style={{ color: theme.colors.textSecondary }}>
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button variant="primary" onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div
      className="flex-1 pb-32"
      style={{ backgroundColor: theme.colors.background }}
    >
      {/* Hero Header */}
      <div
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${theme.colors.primary}15 0%, ${theme.colors.background} 100%)`
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="lg"
            className="mb-6 font-bold"
            onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}
          >
            <ArrowLeft size={20} />
            Back to Dashboard
          </Button>

          {/* Product Info */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${theme.colors.primary}20` }}
                >
                  <Beaker size={24} style={{ color: theme.colors.primary }} />
                </div>
                <span
                  className="text-sm font-medium px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: theme.colors.surfaceVariant,
                    color: theme.colors.textSecondary
                  }}
                >
                  Batch: {product.batchNumber}
                </span>
              </div>
              <h1
                className="text-3xl md:text-4xl font-bold"
                style={{ color: theme.colors.text }}
              >
                {product.productName}
              </h1>
              <div className="flex flex-wrap gap-4 mt-3" style={{ color: theme.colors.textSecondary }}>
                <span>{product.dosageForm}</span>
                <span>•</span>
                <span>{product.strength}</span>
                <span>•</span>
                <span>{product.packType}</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4">
              <div
                className="text-center px-6 py-3 rounded-xl"
                style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
              >
                <p className="text-2xl font-bold" style={{ color: theme.colors.primary }}>
                  {groupedTests.upcoming.length}
                </p>
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Upcoming</p>
              </div>
              <div
                className="text-center px-6 py-3 rounded-xl"
                style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
              >
                <p className="text-2xl font-bold" style={{ color: theme.colors.success }}>
                  {groupedTests.past.filter((t: EnrichedTest) => t.computedStatus === 'completed').length}
                </p>
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tests Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {targetTestId ? (
          /* Deep-link from Withdrawal Schedule: just the due test's input, nothing else */
          <section>
            <h2
              className="text-xl font-semibold mb-4 flex items-center gap-2"
              style={{ color: theme.colors.text }}
            >
              <Clock size={20} style={{ color: theme.colors.warning }} />
              Enter Result
            </h2>

            {targetTest ? (
              <TestCard
                key={targetTest.key}
                test={targetTest}
                isUpcoming={targetTest.computedStatus !== 'completed'}
                expandedTest={targetTest.key}
                onToggleExpand={() => {}}
                specifications={product.specifications || []}
                onSubmit={(results) => submitMutation.mutate({ testId: targetTest._id!, results })}
                isSubmitting={submitMutation.isPending}
              />
            ) : (
              <Card className="p-8 text-center">
                <AlertCircle size={48} className="mx-auto mb-3" style={{ color: theme.colors.error }} />
                <p style={{ color: theme.colors.textSecondary }}>Test not found.</p>
              </Card>
            )}
          </section>
        ) : (
          <>
            {/* Upcoming Tests */}
            <section>
              <h2
                className="text-xl font-semibold mb-4 flex items-center gap-2"
                style={{ color: theme.colors.text }}
              >
                <Clock size={20} style={{ color: theme.colors.warning }} />
                Upcoming Tests
                <span
                  className="text-sm font-normal ml-2 px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: theme.colors.surfaceVariant, color: theme.colors.textSecondary }}
                >
                  {groupedTests.upcoming.length}
                </span>
              </h2>

              {groupedTests.upcoming.length > 0 ? (
                <div className="space-y-3">
                  {groupedTests.upcoming.map((test: EnrichedTest) => (
                    <TestCard
                      key={test.key}
                      test={test}
                      isUpcoming={true}
                      expandedTest={expandedTest}
                      onToggleExpand={(key) => setExpandedTest(prev => prev === key ? null : key)}
                      specifications={product.specifications || []}
                      onSubmit={(results) => submitMutation.mutate({ testId: test._id!, results })}
                      isSubmitting={submitMutation.isPending}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <CheckCircle2 size={48} className="mx-auto mb-3" style={{ color: theme.colors.success }} />
                  <p style={{ color: theme.colors.textSecondary }}>
                    No upcoming tests scheduled.
                  </p>
                </Card>
              )}
            </section>

            {/* Past Tests */}
            {groupedTests.past.length > 0 && (
              <section>
                <h2
                  className="text-xl font-semibold mb-4 flex items-center gap-2"
                  style={{ color: theme.colors.text }}
                >
                  <CheckCircle2 size={20} style={{ color: theme.colors.success }} />
                  Past Tests
                  <span
                    className="text-sm font-normal ml-2 px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: theme.colors.surfaceVariant, color: theme.colors.textSecondary }}
                  >
                    {groupedTests.past.length}
                  </span>
                </h2>

                <div className="space-y-3">
                  {groupedTests.past.map((test: EnrichedTest) => (
                    <TestCard
                      key={test.key}
                      test={test}
                      isUpcoming={false}
                      expandedTest={expandedTest}
                      onToggleExpand={(key) => setExpandedTest(prev => prev === key ? null : key)}
                      specifications={product.specifications || []}
                      onSubmit={() => {}}
                      isSubmitting={false}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}

interface TestCardProps {
  test: any // EnrichedTest
  isUpcoming: boolean
  expandedTest: string | null
  onToggleExpand: (key: string) => void
  specifications: Specification[]
  onSubmit: (results: Record<string, string>) => void
  isSubmitting: boolean
}

function TestCard({ 
  test, 
  isUpcoming, 
  expandedTest, 
  onToggleExpand, 
  specifications,
  onSubmit, 
  isSubmitting 
}: TestCardProps) {
  const { theme } = useTheme()
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle2,
          color: theme.colors.success,
          bgColor: `${theme.colors.success}15`,
          label: 'Completed'
        }
      case 'overdue':
        return {
          icon: AlertCircle,
          color: theme.colors.error,
          bgColor: `${theme.colors.error}15`,
          label: 'Overdue'
        }
      default:
        return {
          icon: Clock,
          color: theme.colors.warning,
          bgColor: `${theme.colors.warning}15`,
          label: 'Pending'
        }
    }
  }

  const statusConfig = getStatusConfig(test.computedStatus)
  const StatusIcon = statusConfig.icon
  const isExpanded = expandedTest === test.key
  const applicableSpecs: Specification[] = test.specificationIds
    ? specifications.filter(s => test.specificationIds.includes(s.id))
    : specifications

  return (
    <Card
      id={`test-${test.key}`}
      className="overflow-hidden transition-all duration-300"
      style={{
        borderLeft: `4px solid ${statusConfig.color}`,
      }}
    >
      {/* Test Header */}
      <div
        className="p-4 cursor-pointer flex items-center justify-between gap-4 hover:bg-opacity-50 transition-colors"
        style={{ backgroundColor: isExpanded ? theme.colors.surfaceVariant : 'transparent' }}
        onClick={() => onToggleExpand(test.key)}
      >
        <div className="flex items-center gap-4">
          <div
            className="p-2 rounded-lg"
            style={{ backgroundColor: statusConfig.bgColor }}
          >
            <StatusIcon size={20} style={{ color: statusConfig.color }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold" style={{ color: theme.colors.text }}>
                {test.condition.replace('-', ' - ')}
              </h3>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: statusConfig.bgColor,
                  color: statusConfig.color
                }}
              >
                {statusConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1" style={{ color: theme.colors.textSecondary }}>
              <Calendar size={14} />
              <span className="text-sm">
                {test.momentDate.format('MMMM DD, YYYY')}
              </span>
              <span className="text-sm opacity-60">
                ({test.momentDate.fromNow()})
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="p-2!"
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(test.key)
            }}
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div
          className="border-t p-4 animate-fadeIn"
          style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}
        >
          {test.computedStatus === 'completed' ? (
            <SubmittedResultsView
              result={
                (test.results as unknown as SubmittedResult[] || []).reduce<SubmittedResult | null>(
                  (latest, r) => (!latest || moment(r.createdAt).isAfter(latest.createdAt) ? r : latest),
                  null
                ) || { testId: test._id || '' }
              }
              specifications={applicableSpecs}
            />
          ) : isUpcoming ? (
            <TestResultForm 
              specifications={applicableSpecs} 
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="text-center py-4" style={{ color: theme.colors.textSecondary }}>
              <Clock size={24} className="mx-auto mb-2 opacity-50" />
              <p>This test is overdue. Please enter results as soon as possible.</p>
              <div className="mt-4">
                <TestResultForm 
                  specifications={applicableSpecs} 
                  onSubmit={onSubmit}
                  isSubmitting={isSubmitting}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

