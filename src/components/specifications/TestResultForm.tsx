import { useState } from 'react'
import { FlaskConical, Send, Loader2 } from 'lucide-react'

import { useTheme } from '../../hooks/useTheme'
import { useToast } from '../../hooks/useToast'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import Pick from '../common/PickInput'
import { Specification, NON_NUMERICAL_CHOICES, formatRange } from '../../constants/specifications'

interface TestResultFormProps {
  specifications: Specification[]
  onSubmit: (results: Record<string, string>) => void
  isSubmitting: boolean
  initialValues?: Record<string, string>
  submitLabel?: string
}

export function TestResultForm({ specifications, onSubmit, isSubmitting, initialValues, submitLabel = 'Submit Results' }: TestResultFormProps) {
  const { theme } = useTheme()
  const { error: showError } = useToast()

  const [results, setResults] = useState<Record<string, string>>(initialValues || {})
  const [choices, setChoices] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    if (initialValues) {
      for (const spec of specifications) {
        const value = initialValues[spec.testName]
        if (!spec.isNumerical && value) {
          initial[spec.testName] = NON_NUMERICAL_CHOICES.includes(value) ? value : 'Other'
        }
      }
    }
    return initial
  })
  const [otherText, setOtherText] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    if (initialValues) {
      for (const spec of specifications) {
        const value = initialValues[spec.testName]
        if (!spec.isNumerical && value && !NON_NUMERICAL_CHOICES.includes(value)) {
          initial[spec.testName] = value
        }
      }
    }
    return initial
  })
  const [validation, setValidation] = useState<Record<string, { error: string | null, warning: string | null }>>({})

  const validateValue = (spec: Specification, value: string) => {
    if (!value) return { error: null, warning: null }

    if (spec.isNumerical) {
      const numVal = parseFloat(value)
      if (isNaN(numVal)) return { error: 'Must be a number', warning: null }

      if ((spec.min && numVal < parseFloat(spec.min)) || (spec.max && numVal > parseFloat(spec.max))) {
        return { error: null, warning: 'Out of limits' }
      }
    }
    return { error: null, warning: null }
  }

  const handleChange = (spec: Specification, value: string) => {
    setResults(prev => ({
      ...prev,
      [spec.testName]: value
    }))

    const result = validateValue(spec, value)
    setValidation(prev => ({
      ...prev,
      [spec.testName]: result
    }))
  }

  const handleChoiceChange = (spec: Specification, choice: string) => {
    setChoices(prev => ({ ...prev, [spec.testName]: choice }))

    if (choice === 'Other') {
      setResults(prev => ({ ...prev, [spec.testName]: otherText[spec.testName] || '' }))
    } else {
      setResults(prev => ({ ...prev, [spec.testName]: choice }))
    }
  }

  const handleOtherTextChange = (spec: Specification, text: string) => {
    setOtherText(prev => ({ ...prev, [spec.testName]: text }))
    setResults(prev => ({ ...prev, [spec.testName]: text }))
  }

  const handleSubmit = () => {
    if (Object.keys(results).length === 0) {
      showError('Please enter at least one result')
      return
    }

    const hasErrors = Object.values(validation).some(v => !!v.error)
    if (hasErrors) {
      showError('Please fix validation errors before submitting')
      return
    }

    const missingSpecs = specifications.filter(s => !results[s.testName])
    if (missingSpecs.length > 0) {
      showError(`Please enter results for: ${missingSpecs.map(s => s.testName).join(', ')}`)
      return
    }

    onSubmit(results)
  }

  return (
    <>
      <h4 className="font-medium mb-4 flex items-center gap-2" style={{ color: theme.colors.text }}>
        <FlaskConical size={16} style={{ color: theme.colors.primary }} />
        Enter Test Results
      </h4>

      {specifications && specifications.length > 0 ? (
        <div className="space-y-4">
          {specifications.map((spec: Specification) => (
            <div
              key={spec.id}
              className="p-3 rounded-lg border transition-all duration-300"
              style={{
                borderColor: validation[spec.testName]?.error
                  ? theme.colors.error
                  : validation[spec.testName]?.warning
                    ? '#EAB308'
                    : theme.colors.border,
                backgroundColor: validation[spec.testName]?.warning ? 'rgba(234, 179, 8, 0.05)' : theme.colors.background
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <label
                      className="font-medium text-sm block"
                      style={{ color: theme.colors.text }}
                    >
                      {spec.testName}
                    </label>
                    {validation[spec.testName]?.warning && (
                      <span className="text-[10px] font-bold uppercase text-yellow-600 bg-yellow-500/20 px-2 py-0.5 rounded-full">
                        {validation[spec.testName]?.warning}
                      </span>
                    )}
                  </div>
                  {spec.isNumerical && (
                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                      Acceptable range: {formatRange(spec.min, spec.max, spec.unit)}
                    </p>
                  )}
                  {validation[spec.testName]?.error && (
                    <p className="text-xs mt-1 animate-fadeIn" style={{ color: theme.colors.error }}>
                      {validation[spec.testName]?.error}
                    </p>
                  )}
                </div>
                <div className="md:w-56 space-y-2">
                  {spec.isNumerical ? (
                    <Input
                      type="number"
                      placeholder={`${spec.min} - ${spec.max}`}
                      value={results[spec.testName] || ''}
                      onChange={(e) => handleChange(spec, e.target.value)}
                      className={
                        validation[spec.testName]?.error
                          ? 'border-red-500 focus:border-red-500'
                          : validation[spec.testName]?.warning
                            ? 'border-yellow-500 focus:border-yellow-500 shadow-[0_0_0_1px_rgba(234,179,8,0.2)]'
                            : ''
                      }
                    />
                  ) : (
                    <>
                      <Pick
                        options={NON_NUMERICAL_CHOICES.map(c => ({ label: c, value: c }))}
                        value={choices[spec.testName] || ''}
                        placeholder="Select result..."
                        onChange={(v) => handleChoiceChange(spec, Array.isArray(v) ? v[0] : v)}
                      />
                      {choices[spec.testName] === 'Other' && (
                        <Input
                          type="text"
                          placeholder="Enter result..."
                          value={otherText[spec.testName] || ''}
                          onChange={(e) => handleOtherTextChange(spec, e.target.value)}
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              {isSubmitting ? 'Submitting...' : submitLabel}
            </Button>
          </div>
        </div>
      ) : (
        <div
          className="text-center py-6 border-2 border-dashed rounded-lg"
          style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}
        >
          <FlaskConical size={32} className="mx-auto mb-2 opacity-50" />
          <p>No specifications defined for this product.</p>
          <p className="text-sm mt-1">Add specifications when creating the product to enable result entry.</p>
        </div>
      )}
    </>
  )
}
