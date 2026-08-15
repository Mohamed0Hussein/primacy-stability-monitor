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
