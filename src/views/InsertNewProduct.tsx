import { useState } from 'react'
import { FlaskConical, Package, Calendar, ClipboardList, Plus, Trash2 } from 'lucide-react'
import moment, { Moment } from 'moment'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { useToast } from '../hooks/useToast'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { DatePickerInput } from '../components/common/DatePickerInput'
import { useTheme } from '../hooks/useTheme'
import { Theme } from '../themes/themes'
import Pick from '../components/common/PickInput'
import { Grid, Field } from '../components/common/FormLayout'
import { SpecificationForm } from '../components/specifications/SpecificationForm'
import { SpecificationList } from '../components/specifications/SpecificationList'
import { Specification } from '../constants/specifications'
import { conditionDetails } from '../constants/stability_conditions'
import { insertProduct } from '../utils/api/products'
import { queryKeys } from '../constants/query_keys'
import ROUTE_PATHS from '../constants/route_paths'

const steps = ['Basic Info', 'Batch', 'Dates', 'Tests/Specifications']

type Errors = Partial<Record<string, string>>

interface Batch {
  id: string
  batchNumber: string
  batchSize: string
  apiBatchNumbers: string
  manufacturingDate: Date | null
  stabilityDate: Date | null
  expiryDate: Date | null
}

const MAX_BATCHES = 4

const createEmptyBatch = (): Batch => ({
  id: crypto.randomUUID(),
  batchNumber: '',
  batchSize: '',
  apiBatchNumbers: '',
  manufacturingDate: null,
  stabilityDate: null,
  expiryDate: null,
})

const packTypes = [
  [
    "PVC/Clear",
    "PVC/PVDC",
    "PVC/Aclar",
    "PVC/PE/PVDC",
    "ALU/ALU",
    "Glass bottle clear",
  ],
  [
    "PVC/Clear - white",
    "PVC/PVDC - white",
    "PVC/Aclar - white",
    "PVC/PE/PVDC - white",
    "ALU/ALU - white",
    "Glass bottle clear - white",
    "Polyethylene  (HDPE) bottle white With Polypropylene cap white",
    "Aluminum tube laminated",
    "Polypropylene tube"
  ],
  [
    "Amber glass bottle",
    "Glass ampule clear",
    "Glass ampule amber",
  ]
]

const dosageForm = [
  "Immediate release tablet",
  "Extended release tablet",
  "Hard gelatin capsule",
  "Enteric coated tablet",
  "Fast melting tablet",
  "Syrup",
  "Oral solution",
  "Suspension",
  "Emulsion",
  "Injection",
  "Cream",
  "Ointment",
  "Gel",
  "Dry syrup",
  "Powder",
  "Soft gelatin capsule",
]

const baseTemperatures = [5, 25, 30, 40] as const
const conditionTypes = ['Accelerated', 'Long-term'] as const

const conditionsOptions = baseTemperatures.flatMap(temp =>
  conditionTypes.map(type => ({
    label: `${conditionDetails[temp]} - ${type}`,
    value: `${temp}-${type}`
  }))
)

const InsertNewProduct = () => {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Errors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { success, error } = useToast()

  const [data, setData] = useState({
    productName: '',
    dosageForm: '',
    strength: '',
    packType: '',
    size: '',
    conditions: [] as string[],

    batchType: '',
    batches: [createEmptyBatch()] as Batch[],

    specifications: [] as Specification[]
  })

  const updateBatch = (id: string, patch: Partial<Batch>) => {
    setData(d => ({ ...d, batches: d.batches.map(b => (b.id === id ? { ...b, ...patch } : b)) }))
  }

  const addBatch = () => {
    setData(d => (d.batches.length >= MAX_BATCHES ? d : { ...d, batches: [...d.batches, createEmptyBatch()] }))
  }

  const removeBatch = (id: string) => {
    setData(d => (d.batches.length <= 1 ? d : { ...d, batches: d.batches.filter(b => b.id !== id) }))
  }

  const { mutateAsync: insertProductMutation } = useMutation({
    mutationFn: insertProduct,
    mutationKey: [queryKeys.insert_product],
    onError: () => {
      error('Failed to insert product')
    },
    retry: 1,
    retryDelay: 1000
  })

  const validateStep = () => {
    const e: Errors = {}

    if (step === 0) {
      if (!data.productName) e.productName = 'Required'
      if (!data.dosageForm) e.dosageForm = 'Required'
      if (!data.strength) e.strength = 'Required'
      if (!data.packType) e.packType = 'Required'
      if (data.conditions.length === 0) e.conditions = 'Required'
    }

    if (step === 1) {
      if (!data.batchType) e.batchType = 'Required'
      data.batches.forEach(b => {
        if (!b.batchNumber) e[`batchNumber_${b.id}`] = 'Required'
        if (!b.batchSize) e[`batchSize_${b.id}`] = 'Required'
        if (!b.apiBatchNumbers) e[`apiBatchNumbers_${b.id}`] = 'Required'
      })
    }

    if (step === 2) {
      data.batches.forEach(b => {
        if (!b.manufacturingDate) e[`manufacturingDate_${b.id}`] = 'Required'
        if (!b.stabilityDate) e[`stabilityDate_${b.id}`] = 'Required'
        if (!b.expiryDate) e[`expiryDate_${b.id}`] = 'Required'
      })
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const nextStep = () => {
    if (!validateStep()) return
    setStep(s => s + 1)
  }

  const buildTests = () => {
    const tests: { condition: string; date: Moment }[] = [];

    data.conditions.forEach(condition => {
      let datesForCondition: Moment[] = [];

      if (condition.includes('Accelerated')) {
        datesForCondition = [
          moment().add(1, 'months').startOf('day'),
          moment().add(3, 'months').startOf('day'),
          moment().add(6, 'months').startOf('day'),
        ];
      } else if (condition.includes('Long-term')) {
        datesForCondition = [
          moment().add(3, 'months').startOf('day'),
          moment().add(6, 'months').startOf('day'),
          moment().add(9, 'months').startOf('day'),
          moment().add(12, 'months').startOf('day'),
          moment().add(18, 'months').startOf('day'),
          moment().add(24, 'months').startOf('day'),
          moment().add(36, 'months').startOf('day'),
        ];
      }

      datesForCondition.forEach(d => tests.push({ condition, date: d }));
    });

    tests.sort((a, b) => a.date.diff(b.date));
    return tests
  }

  const submit = async () => {
    if (!validateStep()) return

    const tests = buildTests();
    setIsSubmitting(true)

    try {
      await Promise.all(
        data.batches.map(batch =>
          insertProductMutation({
            productName: data.productName,
            dosageForm: data.dosageForm,
            strength: data.strength,
            packType: data.packType,
            size: data.size,
            conditions: data.conditions,
            batchType: data.batchType,
            batchNumber: batch.batchNumber,
            batchSize: batch.batchSize,
            apiBatchNumbers: batch.apiBatchNumbers,
            manufacturingDate: batch.manufacturingDate,
            stabilityDate: batch.stabilityDate,
            expiryDate: batch.expiryDate,
            tests,
            specifications: data.specifications,
          })
        )
      );
      success(data.batches.length > 1 ? 'Batches inserted successfully' : 'Product inserted successfully');
      navigate(ROUTE_PATHS.DASHBOARD);
    } catch {
      // onError handler shows toast
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <>
      <div
        className="flex-1 p-6 flex justify-center pb-28"
        style={{ backgroundColor: theme.colors.background }}
      >
        <div className="w-full max-w-5xl">
          <Card className="p-6">
            {/* Stepper */}
            <div className="flex gap-4 mb-6">
              {steps.map((label, i) => {
                const active = i <= step
                return (
                  <div
                    key={label}
                    className="flex-1 text-center pb-2 border-b-2 text-sm font-medium transition-colors"
                    style={{
                      borderColor: active
                        ? theme.colors.primary
                        : theme.colors.border,
                      color: active
                        ? theme.colors.text
                        : theme.colors.textSecondary,
                    }}
                  >
                    {label}
                  </div>
                )
              })}
            </div>

            {/* STEP 1 */}
            {step === 0 && (
              <Section
                icon={<FlaskConical size={18} />}
                title="Basic Information"
                theme={theme}
              >
                <Grid>
                  <Field label="Product name" error={errors.productName} theme={theme}>
                    <Input
                      value={data.productName}
                      onChange={e =>
                        setData(d => ({ ...d, productName: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Dosage form" error={errors.dosageForm} theme={theme}>
                    <Pick
                      options={dosageForm.map(dosage => ({ label: dosage, value: dosage }))}
                      value={data.dosageForm}
                      onChange={e =>
                        setData(d => ({ ...d, dosageForm: Array.isArray(e) ? e[0] : e }))
                      }
                    />
                  </Field>
                  <Field label="Strength" error={errors.strength} theme={theme}>
                    <Input
                      value={data.strength}
                      onChange={e =>
                        setData(d => ({ ...d, strength: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Pack type" error={errors.packType} theme={theme}>
                    <Pick
                      options={packTypes.map(arrayOfTypes => arrayOfTypes.map(type => ({ label: type, value: type })))}
                      value={data.packType}
                      onChange={e =>
                        setData(d => ({ ...d, packType: Array.isArray(e) ? e[0] : e }))
                      }
                    />
                  </Field>
                  <Field label="Conditions" error={errors.conditions} theme={theme}>
                    <Pick
                      options={conditionsOptions}
                      value={data.conditions}
                      multiple={true}
                      placeholder="Select conditions..."
                      onChange={e => {
                        const val = Array.isArray(e) ? e : [e];
                        setData(d => ({ ...d, conditions: val }))
                      }}
                    />
                  </Field>
                  <Field label="Size" error={errors.size} theme={theme}>
                    <Input
                      value={data.size}
                      onChange={e => setData(d => ({ ...d, size: e.target.value }))}
                      placeholder="Enter size in grams..." />
                  </Field>
                </Grid>
              </Section>
            )}

            {/* STEP 2 */}
            {step === 1 && (
              <Section
                icon={<Package size={18} />}
                title="Batch Information"
                theme={theme}
              >
                <div className="mb-6 max-w-sm">
                  <Field label="Batch type" error={errors.batchType} theme={theme}>
                    <Input
                      value={data.batchType}
                      onChange={e =>
                        setData(d => ({ ...d, batchType: e.target.value }))
                      }
                    />
                  </Field>
                </div>

                <div className="space-y-4">
                  {data.batches.map((batch, i) => (
                    <div
                      key={batch.id}
                      className="p-4 rounded-lg border"
                      style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium" style={{ color: theme.colors.text }}>Batch {i + 1}</h4>
                        {data.batches.length > 1 && (
                          <Button variant="ghost" onClick={() => removeBatch(batch.id)}>
                            <Trash2 size={16} className="text-red-500 cursor-pointer" />
                          </Button>
                        )}
                      </div>
                      <Grid>
                        <Field label="Batch number" error={errors[`batchNumber_${batch.id}`]} theme={theme}>
                          <Input
                            value={batch.batchNumber}
                            onChange={e => updateBatch(batch.id, { batchNumber: e.target.value })}
                          />
                        </Field>
                        <Field label="Batch size" error={errors[`batchSize_${batch.id}`]} theme={theme}>
                          <Input
                            value={batch.batchSize}
                            onChange={e => updateBatch(batch.id, { batchSize: e.target.value })}
                          />
                        </Field>
                        <Field
                          label="Raw material batch numbers (API)"
                          error={errors[`apiBatchNumbers_${batch.id}`]}
                          theme={theme}
                        >
                          <Input
                            value={batch.apiBatchNumbers}
                            onChange={e => updateBatch(batch.id, { apiBatchNumbers: e.target.value })}
                          />
                        </Field>
                      </Grid>
                    </div>
                  ))}
                </div>

                {data.batches.length < MAX_BATCHES && (
                  <div className="mt-4">
                    <Button variant="ghost" onClick={addBatch}>
                      <Plus size={16} />
                      Add Batch ({data.batches.length}/{MAX_BATCHES})
                    </Button>
                  </div>
                )}
              </Section>
            )}

            {/* STEP 3 */}
            {step === 2 && (
              <Section
                icon={<Calendar size={18} />}
                title="Dates"
                theme={theme}
              >
                <div className="space-y-4">
                  {data.batches.map((batch, i) => (
                    <div
                      key={batch.id}
                      className="p-4 rounded-lg border"
                      style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}
                    >
                      <h4 className="font-medium mb-3" style={{ color: theme.colors.text }}>
                        Batch {i + 1}{batch.batchNumber ? ` — ${batch.batchNumber}` : ''}
                      </h4>
                      <Grid cols={3}>
                        <Field
                          label="Manufacturing date"
                          error={errors[`manufacturingDate_${batch.id}`]}
                          theme={theme}
                        >
                          <DatePickerInput
                            label=""
                            value={batch.manufacturingDate}
                            onChange={d => updateBatch(batch.id, { manufacturingDate: d })}
                          />
                        </Field>

                        <Field
                          label="Stability start date"
                          error={errors[`stabilityDate_${batch.id}`]}
                          theme={theme}
                        >
                          <DatePickerInput
                            label=''
                            value={batch.stabilityDate}
                            onChange={d => updateBatch(batch.id, { stabilityDate: d })}
                          />
                        </Field>
                        <Field
                          label='Expiry Date'
                          error={errors[`expiryDate_${batch.id}`]}
                          theme={theme}
                        >
                          <DatePickerInput
                            label=''
                            value={batch.expiryDate}
                            onChange={d => updateBatch(batch.id, { expiryDate: d })}
                          />
                        </Field>
                      </Grid>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* STEP 4: Specifications */}
            {step === 3 && (
              <Section
                icon={<ClipboardList size={18} />}
                title="Tests/Specifications"
                theme={theme}
              >
                {/* List of added specifications */}
                <div className="mb-6">
                  <SpecificationList
                    specifications={data.specifications}
                    onRemove={(id) => setData(d => ({ ...d, specifications: d.specifications.filter(s => s.id !== id) }))}
                  />
                </div>

                <SpecificationForm
                  onAdd={(spec) => setData(d => ({ ...d, specifications: [...d.specifications, spec] }))}
                />
              </Section>
            )}
          </Card>
        </div>
      </div>

      {/* Sticky bar */}
      <div
        className="fixed bottom-0 left-0 right-0 px-6 py-4 flex justify-between backdrop-blur"
        style={{
          backgroundColor: theme.colors.surface,
          borderTop: `1px solid ${theme.colors.border}`,
        }}
      >
        <Button
          variant="ghost"
          disabled={step === 0 || isSubmitting}
          onClick={() => setStep(s => s - 1)}
        >
          Back
        </Button>

        {step < steps.length - 1 ? (
          <Button variant="primary" onClick={nextStep}>
            Next
          </Button>
        ) : (
          <Button variant="primary" onClick={submit} isLoading={isSubmitting}>
            Save Product
          </Button>
        )}

      </div>
    </>
  )
}

/* ---------- helpers ---------- */

const Section = ({ icon, title, children, theme }: { icon: React.ReactNode, title: string, children: React.ReactNode, theme: Theme }) => (
  <section className="mb-8">
    <h2
      className="flex items-center gap-2 font-semibold mb-4"
      style={{ color: theme.colors.text }}
    >
      <span style={{ color: theme.colors.primary }}>{icon}</span>
      {title}
    </h2>
    {children}
  </section>
)

export default InsertNewProduct
