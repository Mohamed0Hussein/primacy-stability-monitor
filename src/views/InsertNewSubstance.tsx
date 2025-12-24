import { useState, Activity } from 'react'
import { FlaskConical, Package, Calendar } from 'lucide-react'
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
import { conditionDetails, conditions } from '../constants/stability_conditions'
import { insertSubstance } from '../utils/api/substances'
import { queryKeys } from '../constants/query_keys'

const steps = ['Basic Info', 'Batch', 'Dates']

type Errors = Partial<Record<string, string>>


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

const expiryDateOptions = [
  { label : "2 Years" , value : 2},
  { label : "3 Years" , value : 3},
]

const conditionsOptions = [
  { label : conditionDetails[5], value : conditions[5]},
  { label : conditionDetails[25], value : conditions[25]},
  { label : conditionDetails[30], value : conditions[30]},
  { label : conditionDetails[40], value : conditions[40]},
] 

const InsertNewSubstance = () => {
  const { theme } = useTheme()
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Errors>({})
  const { success, error,info,warning } = useToast()

  const [data, setData] = useState({
    productName: '',
    dosageForm: '',
    strength: '',
    packType: '',
    condition: '',
    customConditionDate: null as Date | null,

    batchNumber: '',
    batchType: '',
    batchSize: '',
    apiBatchNumbers: '',

    manufacturingDate: null as Date | null,
    stabilityDate: null as Date | null,
    expiryDate: "" as string | string[],

    testsDates: [] as Moment[]
  })


  const { mutateAsync : insertSubstanceMutation ,isPending : isInsertSubstancePending, isError : isInsertSubstanceError} = useMutation({
    mutationFn : insertSubstance,
    mutationKey : [queryKeys.insert_substance, data],
    onSuccess : () => {
      success('Substance inserted successfully')
    },
    onError : () => {
      error('Failed to insert substance')
    },
    retry : 1,
    retryDelay : 1000
  })

  const validateStep = () => {
    const e: Errors = {}

    if (step === 0) {
      if (!data.productName) e.productName = 'Required'
      if (!data.dosageForm) e.dosageForm = 'Required'
      if (!data.strength) e.strength = 'Required'
      if (!data.packType) e.packType = 'Required'
      if (!data.condition) e.condition = 'Required'
      if (!data.customConditionDate && data.condition === conditions[5]) e.customConditionDate = 'Required'
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

    const testsDates = [
      moment(data.manufacturingDate).add('months',3).startOf('day'),
      moment(data.manufacturingDate).add('months',6).startOf('day'),
      moment(data.manufacturingDate).add('months',9).startOf('day'),
      moment(data.manufacturingDate).add('months',12).startOf('day'),
      moment(data.manufacturingDate).add('months',18).startOf('day'),
      moment(data.manufacturingDate).add('months',24).startOf('day'),
      moment(data.manufacturingDate).add('months',36).startOf('day'),
    ]

    data.testsDates = data.condition === conditions[5] ? [moment(data.customConditionDate).startOf('day')] : testsDates
    
    insertSubstanceMutation(data)
  }
  

  return (
    <>
      <div
        className="min-h-screen p-6 flex justify-center pb-28"
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
                    options={dosageForm.map(dosage => ({label: dosage, value: dosage}))}
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
                    options={packTypes.map(arrayOfTypes => arrayOfTypes.map(type => ({label : type, value : type})))}
                      value={data.packType}
                      onChange={e =>
                        setData(d => ({ ...d, packType: Array.isArray(e) ? e[0] : e }))
                      }
                    />
                  </Field>
                  <Field label="Condition" error={errors.condition} theme={theme}>
                    <Pick
                    options={conditionsOptions}
                      value={data.condition}
                      onChange={e => 
                        setData(d => ({ ...d,customConditionDate : e === conditions[5] ? null : d.customConditionDate, condition: Array.isArray(e) ? e[0] : e }))
                    }
                    />
                  </Field>
                  <Activity mode={data.condition === conditions[5] ? "visible" : "hidden"}>
                    <Field label="Condition test date" error={errors.customConditionDate} theme={theme}>
                      <DatePickerInput
                        label=''
                        value={data.customConditionDate}
                        onChange={e =>
                          setData(d => ({ ...d, customConditionDate: Array.isArray(e) ? e[0] : e }))
                        }
                      />
                    </Field>
                  </Activity>
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
                    label="Stability"
                    error={errors.stability}
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
                    error={errors.stability}
                    theme={theme}
                  >
                    <Pick
                      options={expiryDateOptions.map(op => ({label: op.label, value: op.value}))}
                      value={data.expiryDate}
                      onChange={e =>
                        setData(d => ({
                          ...d,
                          expiryDate: Array.isArray(e) ? e[0] : e,
                        }))
                      }
                    />
                  </Field>
                </Grid>
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

        {step < 2 ? (
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

const Section = ({ icon, title, children, theme }: { icon : React.ReactNode, title: string, children: React.ReactNode, theme: Theme}) => (
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


const Field = ({ label, error, children, theme }: { label: string, error: string | undefined, children: React.ReactNode, theme: Theme}) => (
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


export default InsertNewSubstance
