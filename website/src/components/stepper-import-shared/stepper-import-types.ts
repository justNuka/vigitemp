export type ValidationStatus = "ok" | "fixed" | "error"

export type ValidationResult = {
  file: File
  status: ValidationStatus
  errors: string[]
  encoding: string
  xmlText: string
}

export type SharedImportStepperProps<TImportResult> = {
  stepperNamespace: "sensorAdjustmentStepper" | "sensorCalibrationStepper"
  uploadNamespace: "sensorAdjustmentUpload" | "sensorCalibrationUpload"
  previewEndpoint: string
  validateRootTag: (rootTag: string) => boolean
  invalidRootError?: string
  onUploadResult?: (result: TImportResult) => void
  onFinish?: () => void
}
