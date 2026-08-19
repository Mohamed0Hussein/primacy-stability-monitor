export interface Specification {
  id: string
  testName: string
  specification: string
  reference: string
  isNumerical: boolean
  min?: string
  max?: string
  unit?: string
}

export const unitOptions = [
  { label: '—', value: '' },
  ...['ppm', 'cfu/g', 'cfu/ml', 'absent', 'g/ml', '%', '%w/w', '%v/v', '%w/v', 'minute', 'mg/g', 'mg/ml', 'm.Pa.s', 'Pa.s', 'cP']
    .sort()
    .map(u => ({ label: u, value: u })),
  { label: 'Other', value: 'Other' },
]

export const referenceOptions = ['inhouse', 'USP', 'EP', 'Eur.ph'].map(r => ({ label: r, value: r }))

// A recorded test-result entry — always has a testId and createdAt, plus one
// key per specification's testName holding the submitted value.
export interface SubmittedResult {
  testId: string
  createdAt?: string
  [specName: string]: unknown
}

export const NON_NUMERICAL_CHOICES = ['Confirm', 'Complies', 'Positive', 'Not Confirm', 'Not Complies', 'Not Positive', 'Other']

// For a % spec, a limit of 0 means "no limit on that side" rather than a
// literal 0% bound — "0 - 5%" reads as a range, but it's really a ceiling.
export function formatRange(min: string | undefined, max: string | undefined, unit: string | undefined) {
  if (unit === '%') {
    if (min === '0' && max) return `no more than ${max}%`
    if (max === '0' && min) return `no less than ${min}%`
  }
  return `${min} - ${max} ${unit || ''}`.trim()
}
