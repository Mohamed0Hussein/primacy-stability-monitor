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
  