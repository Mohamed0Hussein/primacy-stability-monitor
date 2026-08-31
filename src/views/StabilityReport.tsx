import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, AlertCircle, Beaker, Printer } from 'lucide-react'

import { useTheme } from '../hooks/useTheme'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { StabilityReportTable } from '../components/products/StabilityReportTable'
import { formatCondition } from '../constants/stability_conditions'
import { Specification, SubmittedResult } from '../constants/specifications'
import { getProducts } from '../utils/api/products'
import { queryKeys } from '../constants/query_keys'
import ROUTE_PATHS from '../constants/route_paths'
import { printSection } from '../utils/print'

interface TestEntry {
  _id?: string
  condition: string
  date: string
  specificationIds?: string[]
}

interface Product {
  _id: string
  productName: string
  strength?: string
  batchNumber?: string
  packType?: string
  size?: string
  conditions?: string[]
  manufacturingDate?: string
  stabilityDate?: string
  expiryDate?: string
  tests?: TestEntry[]
  testsResults?: SubmittedResult[]
  specifications?: Specification[]
}

export default function StabilityReport() {
  const { theme } = useTheme()
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()

  const { data: products = [], isLoading } = useQuery({
    queryKey: [queryKeys.get_products],
    queryFn: async () => {
      const response = await getProducts()
      return response.data
    },
  })

  const product = useMemo(
    () => products.find((p: Product) => p._id === productId),
    [products, productId]
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Beaker size={48} style={{ color: theme.colors.primary }} className="animate-bounce" />
          <p style={{ color: theme.colors.textSecondary }}>Loading stability report...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <Card className="p-8 text-center max-w-md">
          <AlertCircle size={48} className="mx-auto mb-4" style={{ color: theme.colors.error }} />
          <h2 className="text-xl font-semibold mb-2" style={{ color: theme.colors.text }}>Product Not Found</h2>
          <Button variant="primary" onClick={() => navigate(ROUTE_PATHS.PRODUCTS_UNDER_TESTING)}>
            <ArrowLeft size={16} />
            Back to Products
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-full p-8 pb-32 w-full" style={{ backgroundColor: theme.colors.background }}>
      <div className="w-full space-y-6">
        <div className="print:hidden">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-3 flex items-center gap-2">
            <ArrowLeft size={16} />
            Back
          </Button>
          <h1 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
            Stability Report — {product.productName}
          </h1>
          <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
            Batch: {product.batchNumber || '—'}
          </p>
        </div>

        {(product.conditions || []).length === 0 ? (
          <Card className="p-8 text-center">
            <p style={{ color: theme.colors.textSecondary }}>No conditions defined for this product.</p>
          </Card>
        ) : (
          <div className="space-y-10">
            {(product.conditions || []).map((condition: string) => {
              const printId = `printable-report-${condition}`
              return (
                <div key={condition}>
                  <div className="flex items-center justify-between mb-2 print:hidden">
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: theme.colors.textSecondary }}>
                      {formatCondition(condition)}
                    </p>
                    <Button variant="ghost" onClick={() => printSection(printId)} className="flex items-center gap-2">
                      <Printer size={16} />
                      Print
                    </Button>
                  </div>
                  <div id={printId}>
                    <StabilityReportTable product={product} condition={condition} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
