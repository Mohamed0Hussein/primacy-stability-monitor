import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useTheme } from '../../hooks/useTheme'
import { useToast } from '../../hooks/useToast'
import { Modal } from '../common/Modal'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { DatePickerInput } from '../common/DatePickerInput'
import Pick from '../common/PickInput'
import { Grid, Field } from '../common/FormLayout'
import { packTypes, dosageForm, conditionsOptions } from '../../constants/product_options'
import { updateProduct } from '../../utils/api/products'
import { queryKeys } from '../../constants/query_keys'

export interface EditableProduct {
  _id: string
  productName: string
  dosageForm?: string
  strength?: string
  packType?: string
  size?: string
  conditions?: string[]
  batchType?: string
  batchNumber: string
  batchSize?: string
  apiBatchNumbers?: string
  manufacturingDate?: string
  stabilityDate?: string
  expiryDate?: string
}

interface EditProductModalProps {
  product: EditableProduct | null
  onClose: () => void
}

const toDate = (value: string | undefined) => (value ? new Date(value) : null)

export function EditProductModal({ product, onClose }: EditProductModalProps) {
  const { theme } = useTheme()
  const { success, error: showError } = useToast()
  const queryClient = useQueryClient()

  const [form, setForm] = useState(() => ({
    productName: product?.productName || '',
    dosageForm: product?.dosageForm || '',
    strength: product?.strength || '',
    packType: product?.packType || '',
    size: product?.size || '',
    conditions: product?.conditions || [],
    batchType: product?.batchType || '',
    batchNumber: product?.batchNumber || '',
    batchSize: product?.batchSize || '',
    apiBatchNumbers: product?.apiBatchNumbers || '',
    manufacturingDate: toDate(product?.manufacturingDate),
    stabilityDate: toDate(product?.stabilityDate),
    expiryDate: toDate(product?.expiryDate),
  }))

  const updateMutation = useMutation({
    mutationFn: (updates: object) => updateProduct(product!._id, updates),
    onSuccess: () => {
      success('Product updated')
      queryClient.invalidateQueries({ queryKey: [queryKeys.get_products] })
      onClose()
    },
    onError: () => showError('Failed to update product. Please try again.'),
  })

  if (!product) return null

  const handleSave = () => {
    updateMutation.mutate(form)
  }

  return (
    <Modal open={!!product} onClose={onClose} title="Edit Product" subtitle={`${product.productName} — Batch ${product.batchNumber}`}>
      <div className="space-y-6">
        <Grid>
          <Field label="Product name" error={undefined} theme={theme}>
            <Input value={form.productName} onChange={e => setForm(f => ({ ...f, productName: e.target.value }))} />
          </Field>
          <Field label="Dosage form" error={undefined} theme={theme}>
            <Pick
              options={dosageForm.map(d => ({ label: d, value: d }))}
              value={form.dosageForm}
              onChange={e => setForm(f => ({ ...f, dosageForm: Array.isArray(e) ? e[0] : e }))}
            />
          </Field>
          <Field label="Strength" error={undefined} theme={theme}>
            <Input value={form.strength} onChange={e => setForm(f => ({ ...f, strength: e.target.value }))} />
          </Field>
          <Field label="Pack type" error={undefined} theme={theme}>
            <Pick
              options={packTypes.map(group => group.map(type => ({ label: type, value: type })))}
              value={form.packType}
              onChange={e => setForm(f => ({ ...f, packType: Array.isArray(e) ? e[0] : e }))}
            />
          </Field>
          <Field label="Conditions" error={undefined} theme={theme}>
            <Pick
              options={conditionsOptions}
              value={form.conditions}
              multiple={true}
              placeholder="Select conditions..."
              onChange={e => setForm(f => ({ ...f, conditions: Array.isArray(e) ? e : [e] }))}
            />
          </Field>
          <Field label="Size" error={undefined} theme={theme}>
            <Input value={form.size} onChange={e => setForm(f => ({ ...f, size: e.target.value }))} placeholder="Enter size in grams..." />
          </Field>
        </Grid>

        <Grid>
          <Field label="Batch type" error={undefined} theme={theme}>
            <Input value={form.batchType} onChange={e => setForm(f => ({ ...f, batchType: e.target.value }))} />
          </Field>
          <Field label="Batch number" error={undefined} theme={theme}>
            <Input value={form.batchNumber} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))} />
          </Field>
          <Field label="Batch size" error={undefined} theme={theme}>
            <Input value={form.batchSize} onChange={e => setForm(f => ({ ...f, batchSize: e.target.value }))} />
          </Field>
          <Field label="Raw material batch numbers (API)" error={undefined} theme={theme}>
            <Input value={form.apiBatchNumbers} onChange={e => setForm(f => ({ ...f, apiBatchNumbers: e.target.value }))} />
          </Field>
        </Grid>

        <Grid cols={3}>
          <Field label="Manufacturing date" error={undefined} theme={theme}>
            <DatePickerInput label="" value={form.manufacturingDate} onChange={d => setForm(f => ({ ...f, manufacturingDate: d }))} />
          </Field>
          <Field label="Stability start date" error={undefined} theme={theme}>
            <DatePickerInput label="" value={form.stabilityDate} onChange={d => setForm(f => ({ ...f, stabilityDate: d }))} />
          </Field>
          <Field label="Expiry date" error={undefined} theme={theme}>
            <DatePickerInput label="" value={form.expiryDate} onChange={d => setForm(f => ({ ...f, expiryDate: d }))} />
          </Field>
        </Grid>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={updateMutation.isPending}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} isLoading={updateMutation.isPending}>Save Changes</Button>
        </div>
      </div>
    </Modal>
  )
}
