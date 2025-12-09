import React, { useEffect, useState } from 'react'
import { FlaskConical, Package, Calendar } from 'lucide-react'

import { Card } from '../components/common/Card'
import { Input } from '../components/common/Input'
import { Button } from '../components/common/Button'
import { DatePickerInput } from '../components/common/DatePickerInput'
import { useTheme } from '../hooks/useTheme'
import { Theme } from '../themes/themes'

const steps = ['Basic Info', 'Batch', 'Dates']

type Errors = Partial<Record<string, string>>

const InsertNewSubstance = () => {
  const { theme } = useTheme()
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState<Errors>({})

  const [data, setData] = useState({
    productName: '',
    dosageForm: '',
    strength: '',
    packType: '',

    batchNumber: '',
    batchType: '',
    batchSize: '',
    apiBatchNumbers: '',

    manufacturingDate: null as Date | null,
    stabilityMonths: '',
    expiryDate: null as Date | null,
  })

  /* ✅ Auto expiry */
  useEffect(() => {
    if (data.manufacturingDate && data.stabilityMonths) {
      const expiry = new Date(data.manufacturingDate)
      expiry.setMonth(expiry.getMonth() + Number(data.stabilityMonths))
      setData(d => ({ ...d, expiryDate: expiry }))
    }
  }, [data.manufacturingDate, data.stabilityMonths])

  const validateStep = () => {
    const e: Errors = {}

    if (step === 0) {
      if (!data.productName) e.productName = 'Required'
      if (!data.dosageForm) e.dosageForm = 'Required'
      if (!data.strength) e.strength = 'Required'
      if (!data.packType) e.packType = 'Required'
    }

    if (step === 1) {
      if (!data.batchNumber) e.batchNumber = 'Required'
      if (!data.batchType) e.batchType = 'Required'
      if (!data.batchSize) e.batchSize = 'Required'
      if (!data.apiBatchNumbers) e.apiBatchNumbers = 'Required'
    }

    if (step === 2) {
      if (!data.manufacturingDate) e.manufacturingDate = 'Required'
      if (!data.stabilityMonths) e.stabilityMonths = 'Required'
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
    console.log(data)
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
                    <Input
                      value={data.dosageForm}
                      onChange={e =>
                        setData(d => ({ ...d, dosageForm: e.target.value }))
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
                    <Input
                      value={data.packType}
                      onChange={e =>
                        setData(d => ({ ...d, packType: e.target.value }))
                      }
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
                    label="API batch numbers"
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
                    label="Stability (months)"
                    error={errors.stabilityMonths}
                    theme={theme}
                  >
                    <Input
                      type="number"
                      value={data.stabilityMonths}
                      onChange={e =>
                        setData(d => ({
                          ...d,
                          stabilityMonths: e.target.value,
                        }))
                      }
                    />
                  </Field>

                  <DatePickerInput
                    label="Expiry date (auto)"
                    value={data.expiryDate}
                    onChange={() => {}}
                    disabled
                  />
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
