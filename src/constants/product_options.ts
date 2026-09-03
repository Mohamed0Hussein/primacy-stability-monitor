import { conditionDetails } from './stability_conditions'

export const packTypes = [
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

export const dosageForm = [
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

export const conditionsOptions = baseTemperatures.flatMap(temp =>
  conditionTypes.map(type => ({
    label: `${conditionDetails[temp]} - ${type}`,
    value: `${temp}-${type}`
  }))
)
