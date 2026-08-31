import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import moment from 'moment'
import { Copy, FileText, Pencil, Printer } from 'lucide-react'

import { useTheme } from '../../hooks/useTheme'
import { Theme } from '../../themes/themes'
import { useToast } from '../../hooks/useToast'
import { Button } from '../common/Button'
import { Modal } from '../common/Modal'
import { SpecificationForm } from '../specifications/SpecificationForm'
import { SpecificationList } from '../specifications/SpecificationList'
import { SubmittedResultsView } from '../specifications/SubmittedResultsView'
import { TestResultForm } from '../specifications/TestResultForm'
import { Specification, SubmittedResult } from '../../constants/specifications'
import { addTestResult, updateProduct } from '../../utils/api/products'
import { queryKeys } from '../../constants/query_keys'
import { printSection } from '../../utils/print'

interface TestEntry {
  _id?: string
  condition: string
  date: string
  specificationIds?: string[]
}

interface Product {
  _id: string
  productName: string
  dosageForm?: string
  strength?: string
  packType?: string
  size?: string
  conditions?: string[]
  batchType?: string
  batchNumber?: string
  batchSize?: string
  apiBatchNumbers?: string
  manufacturingDate?: string
  stabilityDate?: string
  expiryDate?: string
  tests?: TestEntry[]
  testsResults?: SubmittedResult[]
  specifications?: Specification[]
}

interface ProductDetailModalProps {
  product: Product | null
  onClose: () => void
}

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const queryClient = useQueryClient()
  const [editingResult, setEditingResult] = useState(false)

  const updateSpecsMutation = useMutation({
    mutationFn: ({ id, specifications }: { id: string; specifications: Specification[] }) =>
      updateProduct(id, { specifications }),
    onSuccess: () => {
      success('Specification added')
      queryClient.invalidateQueries({ queryKey: [queryKeys.get_products] })
    },
    onError: () => showError('Failed to add specification. Please try again.'),
  })

  const correctResultMutation = useMutation({
    mutationFn: ({ productId, testId, results }: { productId: string; testId: string; results: object }) =>
      addTestResult(productId, testId, results),
    onSuccess: () => {
      success('Result corrected — original submission kept in history.')
      queryClient.invalidateQueries({ queryKey: [queryKeys.get_products] })
      setEditingResult(false)
    },
    onError: () => showError('Failed to save correction. Please try again.'),
  })

  const handleAddSpecification = (spec: Specification) => {
    if (!product) return
    updateSpecsMutation.mutate({
      id: product._id,
      specifications: [...(product.specifications || []), spec],
    })
  }

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id)
    success('ID copied to clipboard')
  }

  const handlePrint = () => printSection('printable-results')

  if (!product) return null

  // "Last submitted" = whichever test result was most recently recorded,
  // regardless of which scheduled test it belongs to.
  const allResults = product.testsResults || []
  const latestResult = allResults.reduce<SubmittedResult | null>(
    (latest, r) => (!latest || moment(r.createdAt).isAfter(latest.createdAt) ? r : latest),
    null
  )
  const latestTest = latestResult ? product.tests?.find(t => t._id === latestResult.testId) : undefined
  const applicableSpecs = latestTest?.specificationIds
    ? (product.specifications || []).filter(s => latestTest.specificationIds!.includes(s.id))
    : (product.specifications || [])

  return (
    <Modal
      open={!!product}
      onClose={() => { setEditingResult(false); onClose(); }}
      title={product.productName}
      subtitle={product._id}
    >
      <div className="space-y-6">
        <div
          className="flex items-center gap-2 text-xs font-mono px-2 py-1 rounded-md w-fit"
          style={{ backgroundColor: theme.colors.surfaceVariant, color: theme.colors.textSecondary }}
        >
          {product._id}
          <button onClick={() => copyId(product._id)} aria-label="Copy ID" className="cursor-pointer">
            <Copy size={12} />
          </button>
        </div>

        <DetailSection title="Dates" theme={theme}>
          <DetailGrid theme={theme}>
            <DetailItem
              label="Manufacturing date"
              value={product.manufacturingDate ? moment(product.manufacturingDate).format('MMM DD, YYYY') : undefined}
              theme={theme}
            />
            <DetailItem
              label="Stability start date"
              value={product.stabilityDate ? moment(product.stabilityDate).format('MMM DD, YYYY') : undefined}
              theme={theme}
            />
            <DetailItem
              label="Expiry date"
              value={product.expiryDate ? moment(product.expiryDate).format('MMM DD, YYYY') : undefined}
              theme={theme}
            />
          </DetailGrid>
        </DetailSection>

        <DetailSection title="Last Submitted Results" theme={theme}>
          {latestResult ? (
            editingResult ? (
              <TestResultForm
                specifications={applicableSpecs}
                initialValues={latestResult as unknown as Record<string, string>}
                submitLabel="Save Correction"
                isSubmitting={correctResultMutation.isPending}
                onSubmit={(results) =>
                  correctResultMutation.mutate({ productId: product._id, testId: latestResult.testId, results })
                }
              />
            ) : (
              <div id="printable-results">
                <div className="mb-4" style={{ color: theme.colors.textSecondary }}>
                  <h2 className="text-lg font-bold" style={{ color: theme.colors.text }}>{product.productName}</h2>
                  <p className="text-sm">Batch: {product.batchNumber} · ID: {product._id}</p>
                  {latestTest && <p className="text-sm">{latestTest.condition.replace('-', ' - ')}</p>}
                </div>
                <SubmittedResultsView result={latestResult} specifications={applicableSpecs} />
                <div className="flex gap-3 justify-end mt-4 print:hidden">
                  <Button variant="ghost" onClick={handlePrint} className="flex items-center gap-2">
                    <Printer size={16} />
                    Print
                  </Button>
                  <Button variant="ghost" onClick={() => setEditingResult(true)} className="flex items-center gap-2">
                    <Pencil size={16} />
                    Edit
                  </Button>
                </div>
              </div>
            )
          ) : (
            <div
              className="text-center py-6 border-2 border-dashed rounded-lg"
              style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}
            >
              <p style={{ color: theme.colors.textSecondary }}>No results submitted yet.</p>
            </div>
          )}
        </DetailSection>

        {(product.conditions || []).length > 0 && (
          <DetailSection title="Stability Report" theme={theme}>
            <Button
              variant="ghost"
              onClick={() => navigate(`/product/${product._id}/report`)}
              className="flex items-center gap-2"
            >
              <FileText size={16} />
              View Full Stability Report
            </Button>
          </DetailSection>
        )}

        <DetailSection title="Tests/Specifications" theme={theme}>
          <div className="mb-4">
            <SpecificationList specifications={product.specifications || []} />
          </div>
          <SpecificationForm onAdd={handleAddSpecification} submitLabel="Add to Product" isSubmitting={updateSpecsMutation.isPending} />
        </DetailSection>
      </div>
    </Modal>
  )
}

const DetailSection = ({ title, children, theme }: { title: string, children: React.ReactNode, theme: Theme }) => (
  <section>
    <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: theme.colors.textSecondary }}>
      {title}
    </h3>
    {children}
  </section>
)

const DetailGrid = ({ children, theme }: { children: React.ReactNode, theme: Theme }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg border" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.background }}>
    {children}
  </div>
)

const DetailItem = ({ label, value, theme }: { label: string, value: string | undefined, theme: Theme }) => (
  <div>
    <p className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>{label}</p>
    <p className="text-sm mt-0.5" style={{ color: theme.colors.text }}>{value || '—'}</p>
  </div>
)
