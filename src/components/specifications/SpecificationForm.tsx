import { useState } from 'react'
import { Plus } from 'lucide-react'

import { useTheme } from '../../hooks/useTheme'
import { useToast } from '../../hooks/useToast'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { Grid, Field } from '../common/FormLayout'
import Pick from '../common/PickInput'
import { Specification, unitOptions, referenceOptions } from '../../constants/specifications'

interface SpecificationFormProps {
  onAdd: (spec: Specification) => void
  submitLabel?: string
  isSubmitting?: boolean
}

const emptyNewSpec: Partial<Specification> = {
  testName: '',
  specification: '',
  reference: '',
  isNumerical: false,
  min: '',
  max: '',
  unit: '',
}

export function SpecificationForm({ onAdd, submitLabel = 'Add Specification', isSubmitting = false }: SpecificationFormProps) {
  const { theme } = useTheme()
  const { error } = useToast()
  const [newSpec, setNewSpec] = useState<Partial<Specification>>(emptyNewSpec)
  const [customUnit, setCustomUnit] = useState('')

  const handleAdd = () => {
    if (!newSpec.testName) {
      error("Test name is required")
      return
    }
    if (!newSpec.isNumerical && !newSpec.specification) {
      error("Test specification is required")
      return
    }
    if (newSpec.isNumerical && (!newSpec.min || !newSpec.max)) {
      error("Min and Max values are required for numerical specifications")
      return
    }
    if (newSpec.isNumerical && newSpec.unit === 'Other' && !customUnit) {
      error("Enter the custom unit")
      return
    }

    const spec: Specification = {
      id: crypto.randomUUID(),
      testName: newSpec.testName!,
      specification: newSpec.isNumerical ? '' : newSpec.specification!,
      reference: newSpec.reference || '',
      isNumerical: newSpec.isNumerical!,
      min: newSpec.min,
      max: newSpec.max,
      unit: newSpec.unit === 'Other' ? customUnit : (newSpec.unit || ''),
    }

    onAdd(spec)
    setNewSpec(emptyNewSpec)
    setCustomUnit('')
  }

  return (
    <div className="p-4 rounded-lg border" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
      <h3 className="font-medium mb-4">Add New Test/Specification</h3>

      <Grid cols={newSpec.isNumerical ? 2 : 3}>
        <Field label="Test name (e.g. Assay)" error={undefined} theme={theme}>
          <Input
            value={newSpec.testName}
            onChange={(e) => setNewSpec(s => ({ ...s, testName: e.target.value }))}
            placeholder="Name"
          />
        </Field>

        {!newSpec.isNumerical && (
          <Field label="Test specification" error={undefined} theme={theme}>
            <Input
              value={newSpec.specification}
              onChange={(e) => setNewSpec(s => ({ ...s, specification: e.target.value }))}
              placeholder="e.g. 95.0% - 105.0% of label claim"
            />
          </Field>
        )}

        <Field label="Specification reference" error={undefined} theme={theme}>
          <Pick
            options={referenceOptions}
            value={newSpec.reference ?? ''}
            placeholder="Select reference..."
            onChange={(e) => setNewSpec(s => ({ ...s, reference: Array.isArray(e) ? e[0] : e }))}
          />
        </Field>
      </Grid>

      <div className="flex items-center gap-2 mt-4">
        <input
          type="checkbox"
          id="isNumerical"
          checked={newSpec.isNumerical}
          onChange={(e) => setNewSpec(s => ({ ...s, isNumerical: e.target.checked }))}
          className="w-4 h-4"
        />
        <label htmlFor="isNumerical" style={{ color: theme.colors.text }}>Numerical?</label>
      </div>

      {newSpec.isNumerical && (
        <div className="mt-4">
          <Grid cols={3}>
            <Field label="Min Value" error={undefined} theme={theme}>
              <Input
                type="number"
                value={newSpec.min}
                onChange={(e) => setNewSpec(s => ({ ...s, min: e.target.value }))}
                placeholder="0"
              />
            </Field>
            <Field label="Max Value" error={undefined} theme={theme}>
              <Input
                type="number"
                value={newSpec.max}
                onChange={(e) => setNewSpec(s => ({ ...s, max: e.target.value }))}
                placeholder="100"
              />
            </Field>
            <Field label="Unit" error={undefined} theme={theme}>
              <Pick
                options={unitOptions}
                value={newSpec.unit ?? ''}
                placeholder="Select unit..."
                onChange={(e) => setNewSpec(s => ({ ...s, unit: Array.isArray(e) ? e[0] : e }))}
              />
            </Field>
          </Grid>
          {newSpec.unit === 'Other' && (
            <div className="mt-4 max-w-xs">
              <Field label="Custom unit" error={undefined} theme={theme}>
                <Input
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  placeholder="Enter unit..."
                />
              </Field>
            </div>
          )}
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <Button variant="primary" onClick={handleAdd} isLoading={isSubmitting}>
          <Plus size={16} />
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}
