import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import moment from 'moment'
import {
  ArrowLeft,
  Calendar,
  FlaskConical,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Send,
  Beaker,
  Loader2
} from 'lucide-react'

import { useTheme } from '../hooks/useTheme'
import { useToast } from '../hooks/useToast'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { getProducts, addTestResult } from '../utils/api/products'
import { queryKeys } from '../constants/query_keys'
import ROUTE_PATHS from '../constants/route_paths'

interface TestResult {
  specName: string
  value: string
  status: 'pass' | 'fail' | 'pending'
}

interface Test {
  _id?: string
  condition: string
  date: string
  status: 'pending' | 'completed' | 'overdue'
  results?: TestResult[]
}

interface Specification {
  id: string
  testName: string
  isNumerical: boolean
  min?: string
  max?: string
}

interface Product {
  _id: string
  productName: string
  batchNumber: string
  dosageForm: string
  strength: string
  packType: string
  tests?: Test[]
  specifications?: Specification[]
}

export default function TestDetails() {
  const { theme } = useTheme()
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const queryClient = useQueryClient()

  const [expandedTest, setExpandedTest] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, Record<string, string>>>({})
  const [validationErrors, setValidationErrors] = useState<Record<string, Record<string, string>>>({})

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

  const getTestStatus = (dateStr: string): 'pending' | 'completed' | 'overdue' => {
    const testDate = moment(dateStr)
    const now = moment().startOf('day')

    if (testDate.isBefore(now)) return 'overdue'
    return 'pending'
  }

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

  const validateValue = (spec: Specification, value: string): string | null => {
    if (!value) return null // Empty value is handled by submission check

    if (spec.isNumerical) {
      const numVal = parseFloat(value)
      if (isNaN(numVal)) return 'Must be a number'

      if (spec.min && numVal < parseFloat(spec.min)) {
        return `Value must be >= ${spec.min}`
      }
      if (spec.max && numVal > parseFloat(spec.max)) {
        return `Value must be <= ${spec.max}`
      }
    }
    return null
  }

  const handleResultChange = (testKey: string, spec: Specification, value: string) => {
    setTestResults(prev => ({
      ...prev,
      [testKey]: {
        ...prev[testKey],
        [spec.testName]: value
      }
    }))

    // Validate on change
    const error = validateValue(spec, value)
    setValidationErrors(prev => ({
      ...prev,
      [testKey]: {
        ...prev[testKey],
        [spec.testName]: error || ''
      }
    }))
  }

  const handleSubmitResults = (test: Test, testKey: string) => {
    const results = testResults[testKey]
    if (!results || Object.keys(results).length === 0) {
      showError('Please enter at least one result')
      return
    }

    // Check for validation errors
    const currentErrors = validationErrors[testKey] || {}
    const hasErrors = Object.values(currentErrors).some(err => !!err)
    if (hasErrors) {
      showError('Please fix validation errors before submitting')
      return
    }

    // Check if required fields (all specs ideally) are filled? 
    // For now, let's enforce all defined specs must be filled or at least validated
    if (product?.specifications) {
      const missingSpecs = product.specifications.filter((s: Specification) => !results[s.testName])
      if (missingSpecs.length > 0) {
        showError(`Please enter results for: ${missingSpecs.map((s: Specification) => s.testName).join(', ')}`)
        return
      }
    }

    // We need the Test ID (actual one from DB) to submit
    if (!test._id) {
      // Fallback or error if _id is missing on the client type but actually needed
      // Assuming test object has _id
      showError('Test ID missing. Cannot submit.')
      return
    }

    submitMutation.mutate({
      testId: test._id,
      results: results
    })
  }

  type EnrichedTest = Test & {
    key: string
    momentDate: moment.Moment
    computedStatus: 'pending' | 'completed' | 'overdue'
  }

  const groupedTests = useMemo((): { upcoming: EnrichedTest[], past: EnrichedTest[] } => {
    if (!product?.tests) return { upcoming: [], past: [] }

    const now = moment().startOf('day')
    const tests: EnrichedTest[] = product.tests.map((t: Test, index: number) => ({
      ...t,
      key: `${t.condition}-${t.date}-${index}`,
      momentDate: moment(t.date),
      computedStatus: getTestStatus(t.date)
    }))

    return {
      upcoming: tests
        .filter((t: EnrichedTest) => t.momentDate.isSameOrAfter(now))
        .sort((a: EnrichedTest, b: EnrichedTest) => a.momentDate.diff(b.momentDate)),
      past: tests
        .filter((t: EnrichedTest) => t.momentDate.isBefore(now))
        .sort((a: EnrichedTest, b: EnrichedTest) => b.momentDate.diff(a.momentDate))
    }
  }, [product])

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

  const TestCard = ({ test, isUpcoming = true }: { test: EnrichedTest, isUpcoming?: boolean }) => {
    const statusConfig = getStatusConfig(test.computedStatus)
    const StatusIcon = statusConfig.icon
    const isExpanded = expandedTest === test.key
    const currentResults = testResults[test.key] || {}

    return (
      <Card
        className="overflow-hidden transition-all duration-300"
        style={{
          borderLeft: `4px solid ${statusConfig.color}`,
        }}
      >
        {/* Test Header */}
        <div
          className="p-4 cursor-pointer flex items-center justify-between gap-4 hover:bg-opacity-50 transition-colors"
          style={{ backgroundColor: isExpanded ? theme.colors.surfaceVariant : 'transparent' }}
          onClick={() => setExpandedTest(isExpanded ? null : test.key)}
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
            {isUpcoming && (
              <Button
                variant="ghost"
                className="p-2!"
                onClick={(e) => {
                  e.stopPropagation()
                  setExpandedTest(isExpanded ? null : test.key)
                }}
              >
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Content - Result Entry Form */}
        {isExpanded && isUpcoming && (
          <div
            className="border-t p-4 animate-fadeIn"
            style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}
          >
            <h4 className="font-medium mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
              <FlaskConical size={16} style={{ color: theme.colors.primary }} />
              Enter Test Results
            </h4>

            {product.specifications && product.specifications.length > 0 ? (
              <div className="space-y-4">
                {product.specifications.map((spec: Specification) => (
                  <div
                    key={spec.id}
                    className="p-3 rounded-lg border transition-colors"
                    style={{
                      borderColor: validationErrors[test.key]?.[spec.testName] ? theme.colors.error : theme.colors.border,
                      backgroundColor: theme.colors.background
                    }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-3">
                      <div className="flex-1">
                        <label
                          className="font-medium text-sm block mb-1"
                          style={{ color: theme.colors.text }}
                        >
                          {spec.testName}
                        </label>
                        {spec.isNumerical && (
                          <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            Acceptable range: {spec.min} - {spec.max}
                          </p>
                        )}
                        {validationErrors[test.key]?.[spec.testName] && (
                          <p className="text-xs mt-1 animate-fadeIn" style={{ color: theme.colors.error }}>
                            {validationErrors[test.key]?.[spec.testName]}
                          </p>
                        )}
                      </div>
                      <div className="md:w-48">
                        <Input
                          type={spec.isNumerical ? 'number' : 'text'}
                          placeholder={spec.isNumerical ? `${spec.min} - ${spec.max}` : 'Enter result...'}
                          value={currentResults[spec.testName] || ''}
                          onChange={(e) => handleResultChange(test.key, spec, e.target.value)}
                          className={validationErrors[test.key]?.[spec.testName] ? 'border-red-500 focus:border-red-500' : ''}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end pt-2">
                  <Button
                    variant="primary"
                    onClick={() => handleSubmitResults(test, test.key)}
                    disabled={submitMutation.isPending}
                  >
                    {submitMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    {submitMutation.isPending ? 'Submitting...' : 'Submit Results'}
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="text-center py-6 border-2 border-dashed rounded-lg"
                style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}
              >
                <FlaskConical size={32} className="mx-auto mb-2 opacity-50" />
                <p>No specifications defined for this product.</p>
                <p className="text-sm mt-1">Add specifications when creating the product to enable result entry.</p>
              </div>
            )}
          </div>
        )}
      </Card>
    )
  }

  return (
    <div
      className="min-h-screen pb-32"
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
            className="mb-6"
            onClick={() => navigate(ROUTE_PATHS.DASHBOARD)}
          >
            <ArrowLeft size={18} />
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
                <TestCard key={test.key} test={test} isUpcoming={true} />
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
                <TestCard key={test.key} test={test} isUpcoming={false} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
