export const conditions = {
    5: '5˚C',
    25: '25˚C',
    30: '30˚C',
    40: '40˚C',
  } as const
  
  type ConditionKey = keyof typeof conditions

  export const conditionDetails: Record<ConditionKey, string> = {
    5: '5˚C',
    25: '25˚C - 60%RH',
    30: '30˚C - 65%RH',
    40: '40˚C - 75%RH',
  }

  const humidityByTemp: Partial<Record<ConditionKey, string>> = {
    25: '60',
    30: '65',
    40: '75',
  }

  // "(40°C, 75% RH)" style — used where conditions are shown as a compact
  // parenthesized list rather than full "temp - humidity - Accelerated" text.
  function formatConditionParen(temp: number): string {
    const rh = humidityByTemp[temp as ConditionKey]
    return rh ? `(${temp}°C, ${rh}% RH)` : `(${temp}°C)`
  }

  export function formatConditionsList(rawConditions: string[] | undefined): string {
    if (!rawConditions || rawConditions.length === 0) return '—'
    const temps = Array.from(new Set(rawConditions.map(c => Number(c.split('-')[0]))))
    return temps.map(formatConditionParen).join(' & ')
  }

  // "30°C - 65%RH - Long-term" style — a single condition's full label, used
  // where one specific condition (not a list of them) needs describing.
  export function formatCondition(condition: string): string {
    const temp = Number(condition.split('-')[0]) as ConditionKey
    const type = condition.includes('Accelerated') ? 'Accelerated' : 'Long-term'
    return `${conditionDetails[temp] || condition} - ${type}`
  }

  // Position-in-schedule labels, oldest to newest. Prepending 'Initial' keeps
  // these aligned with the day-0 test every new batch's schedule now includes.
  export const ACCELERATED_PERIODS = ['Initial', '1M', '3M', '6M'] as const
  export const LONG_TERM_PERIODS = ['Initial', '3M', '6M', '9M', '12M', '18M', '24M', '36M'] as const

  export function getPeriodsForCondition(condition: string): readonly string[] {
    return condition.includes('Accelerated') ? ACCELERATED_PERIODS : LONG_TERM_PERIODS
  }
