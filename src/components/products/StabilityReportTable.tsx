import moment from 'moment'
import { formatCondition } from '../../constants/stability_conditions'
import { Specification, SubmittedResult, formatRange } from '../../constants/specifications'

interface TestEntry {
  _id?: string
  condition: string
  date: string
}

interface StabilityReportProduct {
  productName: string
  strength?: string
  batchNumber?: string
  packType?: string
  size?: string
  manufacturingDate?: string
  stabilityDate?: string
  expiryDate?: string
  tests?: TestEntry[]
  testsResults?: SubmittedResult[]
  specifications?: Specification[]
}

interface StabilityReportTableProps {
  product: StabilityReportProduct
  condition: string
}

const formatDate = (date: string | undefined) => (date ? moment(date).format('DD/MM/YYYY') : '—')

// The Parameters × Period-in-months report for one product batch and one of
// its storage conditions — shared by the standalone Stability Report page
// and the "Stability Reports" section embedded in the product detail modal.
export function StabilityReportTable({ product, condition }: StabilityReportTableProps) {
  const periodColumns = (() => {
    const tests = (product.tests || [])
      .filter(t => t.condition === condition)
      .sort((a, b) => moment(a.date).diff(moment(b.date)))
    if (tests.length === 0) return []
    const anchor = moment(tests[0].date)
    return tests.map(test => {
      const months = moment(test.date).diff(anchor, 'months')
      return { test, label: months === 0 ? 'Initial' : String(months) }
    })
  })()

  if (periodColumns.length === 0) {
    return (
      <p className="text-sm text-gray-600">No tests scheduled for this condition.</p>
    )
  }

  const studyEndDate = moment.max(periodColumns.map(c => moment(c.test.date))).toISOString()
  const specifications = product.specifications || []

  const getResultValue = (testId: string | undefined, testName: string) => {
    const result = (product.testsResults || []).find(r => r.testId === testId)
    const value = result ? result[testName] : undefined
    return value === undefined || value === null || value === '' ? '' : String(value)
  }

  return (
    <div className="bg-white text-black p-6 space-y-4">
      <h2 className="text-xl font-bold text-center">
        {condition.includes('Accelerated') ? 'Accelerated' : 'Long term'} Stability Report for{' '}
        {product.productName}{product.strength ? ` ${product.strength}` : ''}
      </h2>

      <table className="w-full border-collapse border border-black text-xs">
        <tbody>
          <tr>
            <td className="border border-black p-2 font-semibold w-1/4">Product Name</td>
            <td className="border border-black p-2 w-1/4">{product.productName}{product.strength ? ` ${product.strength}` : ''}</td>
            <td className="border border-black p-2 font-semibold w-1/4">Batch No.</td>
            <td className="border border-black p-2 w-1/4">{product.batchNumber || '—'}</td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">Mfg Date</td>
            <td className="border border-black p-2">{formatDate(product.manufacturingDate)}</td>
            <td className="border border-black p-2 font-semibold">Exp Date</td>
            <td className="border border-black p-2">{formatDate(product.expiryDate)}</td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">Study Start Date</td>
            <td className="border border-black p-2">{formatDate(product.stabilityDate)}</td>
            <td className="border border-black p-2 font-semibold">Study End Date</td>
            <td className="border border-black p-2">{formatDate(studyEndDate)}</td>
          </tr>
          <tr>
            <td className="border border-black p-2 font-semibold">Storage Condition</td>
            <td className="border border-black p-2" colSpan={3}>{formatCondition(condition)}</td>
          </tr>
          {(product.packType || product.size) && (
            <tr>
              <td className="border border-black p-2 font-semibold">Container/Closure System</td>
              <td className="border border-black p-2" colSpan={3}>
                {[product.packType, product.size].filter(Boolean).join(', ')}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <table className="w-full border-collapse border border-black text-xs">
        <thead>
          <tr>
            <th rowSpan={2} className="border border-black p-2 align-middle">Parameters</th>
            <th rowSpan={2} className="border border-black p-2 align-middle">Limits</th>
            <th colSpan={periodColumns.length} className="border border-black p-2">Period in months</th>
          </tr>
          <tr>
            {periodColumns.map(({ test, label }) => (
              <th key={test._id || label} className="border border-black p-2 whitespace-nowrap">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {specifications.length === 0 ? (
            <tr>
              <td className="border border-black p-3 text-center" colSpan={2 + periodColumns.length}>
                No specifications defined for this product.
              </td>
            </tr>
          ) : specifications.map(spec => (
            <tr key={spec.id}>
              <td className="border border-black p-2 whitespace-nowrap">{spec.testName}</td>
              <td className="border border-black p-2 whitespace-nowrap">
                {spec.isNumerical
                  ? formatRange(spec.min, spec.max, spec.unit)
                  : [spec.specification, spec.reference].filter(Boolean).join(' - ')}
              </td>
              {periodColumns.map(({ test, label }) => {
                const isFuture = moment(test.date).isAfter(moment(), 'day')
                if (isFuture) {
                  return <td key={test._id || label} className="border border-black p-2" />
                }
                return (
                  <td key={test._id || label} className="border border-black p-2 text-center whitespace-nowrap">
                    {getResultValue(test._id, spec.testName)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
