import { useState } from 'react'
import { FlaskConical, Package, Calendar, ClipboardList, Plus, Trash2 } from 'lucide-react'
import moment, { Moment } from 'moment'
import { useMutation } from '@tanstack/react-query'

import { useToast } from '../hooks/useToast'
import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { DatePickerInput } from '../components/common/DatePickerInput'
import { useTheme } from '../hooks/useTheme'
import { Theme } from '../themes/themes'
import Pick from '../components/common/PickInput'
import { conditionDetails } from '../constants/stability_conditions'
import { insertProduct } from '../utils/api/products'
import { queryKeys } from '../constants/query_keys'

const steps = ['Basic Info', 'Batch', 'Dates', 'Specifications']

type Errors = Partial<Record<string, string>>

interface Specification {
  id: string
  testName: string
  isNumerical: boolean
  min?: string
  max?: string
}

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
  "Emultion",
  "Injection",
  "Cream",
  "Ointment",
  "Gel",
  "Dry syrup",
  "Poweder",
  "Soft geltin capsule",
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
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Errors>({})
  const { success, error } = useToast()

  const [data, setData] = useState({
    productName: '',
    dosageForm: '',
    strength: '',
    packType: '',
    conditions: [] as string[], // Changed to array

    batchNumber: '',
    batchType: '',
    batchSize: '',
    apiBatchNumbers: '',

    manufacturingDate: null as Date | null,
    stabilityDate: null as Date | null,
    expiryDate: null as Date | null,

    tests: [] as { condition: string, date: Moment }[],
    specifications: [] as Specification[]
  })

  // State for the new specification form
  const [newSpec, setNewSpec] = useState<Partial<Specification>>({
    testName: '',
    isNumerical: false,
    min: '',
    max: ''
  })


  const { mutateAsync: insertProductMutation } = useMutation({
    mutationFn: insertProduct,
    mutationKey: [queryKeys.insert_product, data],
    onSuccess: () => {
      success('Product inserted successfully')
    },
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
      if (!data.batchNumber) e.batchNumber = 'Required'
      if (!data.batchType) e.batchType = 'Required'
      if (!data.batchSize) e.batchSize = 'Required'
      if (!data.apiBatchNumbers) e.apiBatchNumbers = 'Required'
    }

    if (step === 2) {
      if (!data.manufacturingDate) e.manufacturingDate = 'Required'
      if (!data.stabilityDate) e.stabilityDate = 'Required'
      if (!data.expiryDate) e.expiryDate = 'Required'
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  const nextStep = () => {
    if (!validateStep()) return
    setStep(s => s + 1)
  }

  const submit = () => {
    if (!validateStep()) return

    const selectedConditions = data.conditions;
    const tests: { condition: string; date: Moment }[] = [];

    selectedConditions.forEach(condition => {
      let datesForCondition: Moment[] = [];

      if (condition.includes('Accelerated')) {
        // 1, 3, 6 months
        datesForCondition = [
          moment().add(1, 'months').startOf('day'),
          moment().add(3, 'months').startOf('day'),
          moment().add(6, 'months').startOf('day')
        ];
      } else if (condition.includes('Long-term')) {
        // 3, 6, 9, 12, 18, 24, 36 months
        datesForCondition = [
          moment().add(3, 'months').startOf('day'),
          moment().add(6, 'months').startOf('day'),
          moment().add(9, 'months').startOf('day'),
          moment().add(12, 'months').startOf('day'),
          moment().add(18, 'months').startOf('day'),
          moment().add(24, 'months').startOf('day'),
          moment().add(36, 'months').startOf('day')
        ];
      }

      datesForCondition.forEach(d => {
        tests.push({ condition, date: d });
      });
    });

    // Sort tests by date
    tests.sort((a, b) => a.date.diff(b.date));

    data.tests = tests;

    insertProductMutation(data)
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
                <Grid>
                  <Field label="Batch number" error={errors.batchNumber} theme={theme}>
                    <Input
                      value={data.batchNumber}
                      onChange={e =>
                        setData(d => ({ ...d, batchNumber: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Batch type" error={errors.batchType} theme={theme}>
                    <Input
                      value={data.batchType}
                      onChange={e =>
                        setData(d => ({ ...d, batchType: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Batch size" error={errors.batchSize} theme={theme}>
                    <Input
                      value={data.batchSize}
                      onChange={e =>
                        setData(d => ({ ...d, batchSize: e.target.value }))
                      }
                    />
                  </Field>
                  <Field
                    label="Raw material batch numbers (API)"
                    error={errors.apiBatchNumbers}
                    theme={theme}
                  >
                    <Input
                      value={data.apiBatchNumbers}
                      onChange={e =>
                        setData(d => ({
                          ...d,
                          apiBatchNumbers: e.target.value,
                        }))
                      }
                    />
                  </Field>
                </Grid>
              </Section>
            )}

            {/* STEP 3 */}
            {step === 2 && (
              <Section
                icon={<Calendar size={18} />}
                title="Dates"
                theme={theme}
              >
                <Grid cols={3}>
                  <Field
                    label="Manufacturing date"
                    error={errors.manufacturingDate}
                    theme={theme}
                  >
                    <DatePickerInput
                      label=""
                      value={data.manufacturingDate}
                      onChange={d =>
                        setData(v => ({ ...v, manufacturingDate: d }))
                      }
                    />
                  </Field>

                  <Field
                    label="Stability start date"
                    error={errors.stabilityDate}
                    theme={theme}
                  >
                    <DatePickerInput
                      label=''
                      value={data.stabilityDate}
                      onChange={e =>
                        setData(d => ({
                          ...d,
                          stabilityDate: e,
                        }))
                      }
                    />
                  </Field>
                  <Field
                    label='Expiry Date'
                    error={errors.expiryDate}
                    theme={theme}
                  >
                    <DatePickerInput
                      label=''
                      value={data.expiryDate}
                      onChange={e =>
                        setData(d => ({
                          ...d,
                          expiryDate: e,
                        }))
                      }
                    />
                  </Field>
                </Grid>
              </Section>
            )}

            {/* STEP 4: Specifications */}
            {step === 3 && (
              <Section
                icon={<ClipboardList size={18} />}
                title="Specifications (Tests)"
                theme={theme}
              >
                {/* List of added specifications */}
                <div className="space-y-3 mb-6">
                  {data.specifications.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed rounded-lg opacity-60" style={{ borderColor: theme.colors.border }}>
                      <p>No specifications added yet.</p>
                    </div>
                  )}
                  {data.specifications.map((spec) => (
                    <div
                      key={spec.id}
                      className="p-3 rounded-lg flex items-center justify-between border"
                      style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}
                    >
                      <div>
                        <div className="font-semibold" style={{ color: theme.colors.text }}>{spec.testName}</div>
                        <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                          {spec.isNumerical
                            ? `Range: ${spec.min} - ${spec.max}` : ``}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => setData(d => ({ ...d, specifications: d.specifications.filter(s => s.id !== spec.id) }))}
                      >
                        <Trash2 size={16} className="text-red-500 cursor-pointer" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Add new specification form */}
                <div className="p-4 rounded-lg border" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
                  <h3 className="font-medium mb-4">Add New Specification</h3>
                  <Grid>
                    <Field label="Test name (e.g. Assay)" error={undefined} theme={theme}>
                      <Input
                        value={newSpec.testName}
                        onChange={(e) => setNewSpec(s => ({ ...s, testName: e.target.value }))}
                        placeholder="Name"
                      />
                    </Field>


                    <div className="flex items-center gap-2 mt-6">
                      <input
                        type="checkbox"
                        id="isNumerical"
                        checked={newSpec.isNumerical}
                        onChange={(e) => setNewSpec(s => ({ ...s, isNumerical: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <label htmlFor="isNumerical" style={{ color: theme.colors.text }}>Is Numerical?</label>
                    </div>

                    {newSpec.isNumerical && (
                      <>
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
                      </>
                    )}
                  </Grid>
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="primary"
                      onClick={() => {
                        if (!newSpec.testName) {
                          error("Test name is required")
                          return
                        }
                        if (newSpec.isNumerical && (!newSpec.min || !newSpec.max)) {
                          error("Min and Max values are required for numerical specifications")
                          return
                        }

                        const spec: Specification = {
                          id: Math.random().toString(36).substr(2, 9),
                          testName: newSpec.testName!,
                          isNumerical: newSpec.isNumerical!,
                          min: newSpec.min,
                          max: newSpec.max
                        }

                        setData(d => ({ ...d, specifications: [...d.specifications, spec] }))
                        setNewSpec({ testName: '', isNumerical: false, min: '', max: '' })
                      }}
                    >
                      <Plus size={16} />
                      Add Specification
                    </Button>
                  </div>
                </div>
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
          disabled={step === 0}
          onClick={() => setStep(s => s - 1)}
        >
          Back
        </Button>

        {step < steps.length - 1 ? (
          <Button variant="primary" onClick={nextStep}>
            Next
          </Button>
        ) : (
          <Button variant="primary" onClick={submit}>
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

const Grid = ({
  cols = 2,
  children,
}: {
  cols?: number
  children: React.ReactNode
}) => {
  const colsClass =
    cols === 3
      ? 'md:grid-cols-3'
      : cols === 1
        ? 'md:grid-cols-1'
        : 'md:grid-cols-2'

  return (
    <div className={`grid grid-cols-1 ${colsClass} gap-4`}>
      {children}
    </div>
  )
}


const Field = ({ label, error, children, theme }: { label: string, error: string | undefined, children: React.ReactNode, theme: Theme }) => (
  <div className="space-y-1">
    <label
      className="text-sm font-medium"
      style={{ color: theme.colors.textSecondary }}
    >
      {label}
    </label>
    {children}
    {error && (
      <p className="text-xs" style={{ color: theme.colors.error }}>
        {error}
      </p>
    )}
  </div>
)


export default InsertNewProduct
