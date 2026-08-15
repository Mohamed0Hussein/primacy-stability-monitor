import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import moment from 'moment'
import { Boxes, Copy, Eye, FlaskConical } from 'lucide-react'

import { useTheme } from '../hooks/useTheme'
import { Theme } from '../themes/themes'
import { useToast } from '../hooks/useToast'
import { Card } from '../components/common/Card'
import { Button } from '../components/common/Button'
import { Modal } from '../components/common/Modal'
import { SpecificationForm } from '../components/specifications/SpecificationForm'
import { SpecificationList } from '../components/specifications/SpecificationList'
import { Specification } from '../constants/specifications'
import { getProducts, updateProduct } from '../utils/api/products'
import { queryKeys } from '../constants/query_keys'
import ROUTE_PATHS from '../constants/route_paths'
import LoadingSpinner from '../components/common/LoadingSpinner'

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
  specifications?: Specification[]
}

export default function Products() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const queryClient = useQueryClient()

  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data: products = [], isLoading } = useQuery({
    queryKey: [queryKeys.get_products],
    queryFn: async () => {
      const response = await getProducts()
      return response.data
    },
  })

  const sortedProducts = useMemo(() => {
    if (!Array.isArray(products)) return []
    return [...products].sort((a: Product, b: Product) => a.productName.localeCompare(b.productName))
  }, [products])

  const selectedProduct = useMemo(
    () => sortedProducts.find((p: Product) => p._id === selectedId) || null,
    [sortedProducts, selectedId]
  )

  const updateMutation = useMutation({
    mutationFn: ({ id, specifications }: { id: string; specifications: Specification[] }) =>
      updateProduct(id, { specifications }),
    onSuccess: () => {
      success('Specification added')
      queryClient.invalidateQueries({ queryKey: [queryKeys.get_products] })
    },
    onError: () => {
      showError('Failed to add specification. Please try again.')
    },
  })

  const handleAddSpecification = (spec: Specification) => {
    if (!selectedProduct) return
    updateMutation.mutate({
      id: selectedProduct._id,
      specifications: [...(selectedProduct.specifications || []), spec],
    })
  }

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id)
    success('ID copied to clipboard')
  }

  return (
    <div className="min-h-full p-8 pb-32" style={{ backgroundColor: theme.colors.background }}>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: theme.colors.text }}>
            Products
          </h1>
          <p style={{ color: theme.colors.textSecondary }}>
            All inserted products and their unique IDs
          </p>
        </div>

        {isLoading ? (
          <LoadingSpinner fullScreen={false} size="md" loadingLabel="Loading products..." />
        ) : sortedProducts.length === 0 ? (
          <Card className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <Boxes size={48} className="text-gray-300 dark:text-gray-600" />
            <p style={{ color: theme.colors.textSecondary }}>No products found.</p>
            <Button variant="ghost" onClick={() => navigate(ROUTE_PATHS.INSERT_PRODUCT)}>Insert a product</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedProducts.map((product: Product) => (
              <Card
                key={product._id}
                className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedId(product._id)}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-4">
                    <div
                      className="p-2.5 rounded-lg"
                      style={{ backgroundColor: `${theme.colors.primary}20`, color: theme.colors.primary }}
                    >
                      <FlaskConical size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: theme.colors.text }}>{product.productName}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span
                          className="text-xs font-mono px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: theme.colors.surfaceVariant, color: theme.colors.textSecondary }}
                        >
                          {product._id}
                        </span>
                        {product.batchNumber && (
                          <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            Batch: {product.batchNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" className="flex items-center gap-2 self-start md:self-auto">
                    <Eye size={16} />
                    View details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!selectedProduct}
        onClose={() => setSelectedId(null)}
        title={selectedProduct?.productName || ''}
        subtitle={selectedProduct?._id}
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div
              className="flex items-center gap-2 text-xs font-mono px-2 py-1 rounded-md w-fit"
              style={{ backgroundColor: theme.colors.surfaceVariant, color: theme.colors.textSecondary }}
            >
              {selectedProduct._id}
              <button onClick={() => copyId(selectedProduct._id)} aria-label="Copy ID" className="cursor-pointer">
                <Copy size={12} />
              </button>
            </div>

            <DetailSection title="Basic Information" theme={theme}>
              <DetailGrid theme={theme}>
                <DetailItem label="Dosage form" value={selectedProduct.dosageForm} theme={theme} />
                <DetailItem label="Strength" value={selectedProduct.strength} theme={theme} />
                <DetailItem label="Pack type" value={selectedProduct.packType} theme={theme} />
                <DetailItem label="Size" value={selectedProduct.size} theme={theme} />
                <DetailItem label="Conditions" value={selectedProduct.conditions?.join(', ')} theme={theme} />
              </DetailGrid>
            </DetailSection>

            <DetailSection title="Batch Information" theme={theme}>
              <DetailGrid theme={theme}>
                <DetailItem label="Batch type" value={selectedProduct.batchType} theme={theme} />
                <DetailItem label="Batch number" value={selectedProduct.batchNumber} theme={theme} />
                <DetailItem label="Batch size" value={selectedProduct.batchSize} theme={theme} />
                <DetailItem label="API batch numbers" value={selectedProduct.apiBatchNumbers} theme={theme} />
              </DetailGrid>
            </DetailSection>

            <DetailSection title="Dates" theme={theme}>
              <DetailGrid theme={theme}>
                <DetailItem
                  label="Manufacturing date"
                  value={selectedProduct.manufacturingDate ? moment(selectedProduct.manufacturingDate).format('MMM DD, YYYY') : undefined}
                  theme={theme}
                />
                <DetailItem
                  label="Stability start date"
                  value={selectedProduct.stabilityDate ? moment(selectedProduct.stabilityDate).format('MMM DD, YYYY') : undefined}
                  theme={theme}
                />
                <DetailItem
                  label="Expiry date"
                  value={selectedProduct.expiryDate ? moment(selectedProduct.expiryDate).format('MMM DD, YYYY') : undefined}
                  theme={theme}
                />
              </DetailGrid>
            </DetailSection>

            <DetailSection title="Tests/Specifications" theme={theme}>
              <div className="mb-4">
                <SpecificationList specifications={selectedProduct.specifications || []} />
              </div>
              <SpecificationForm onAdd={handleAddSpecification} submitLabel="Add to Product" />
            </DetailSection>
          </div>
        )}
      </Modal>
    </div>
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
