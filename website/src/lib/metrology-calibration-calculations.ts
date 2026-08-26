export const CALIBRATION_SAMPLE_COUNT = 10
export const DEFAULT_SENSOR_RESOLUTION = 0.01
export const CALIBRATION_U2_RANGE = 0.04
export const CALIBRATION_STANDARD_SELF_HEATING = 0.000032

export type CalibrationUncertaintyInputs = {
  sensorValues: number[]
  standardResolution: number
  standardUncertainty: number
  mediumStability: number
  mediumHomogeneity: number
  sensorResolution?: number
}

export type CalibrationCalculationDetails = {
  sampleCount: number
  sensorSum: number
  standardSum: number
  meanSensor: number
  meanStandard: number
  accuracyError: number
  standardDeviation: {
    squaredDeviationSum: number
    divisor: number
    variance: number
    value: number
  }
  uncertainty: {
    standardResolution: number
    standardUncertainty: number
    mediumStability: number
    mediumHomogeneity: number
    sensorResolution: number
    sqrt3: number
    u1: number
    u2: number
    u3: number
    u4: number
    u5: number
    u6: number
    u7: number
    u8: number
    u9: number
    u10: number
    u11: number
    squaredSum: number
    value: number
  }
}

export type CalibrationCalculationResult = {
  meanSensor: number
  meanStandard: number
  accuracyError: number
  standardDeviation: number
  uncertainty: number
  details: CalibrationCalculationDetails
}

function assertFiniteValues(values: number[], label: string) {
  if (values.length === 0 || values.some((value) => !Number.isFinite(value))) {
    throw new Error(`${label}: valeurs invalides.`)
  }
}

export function averageCalibrationValues(values: number[]) {
  assertFiniteValues(values, "Moyenne")
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

/**
 * Écart-type expérimental (n - 1), utilisé comme composante U7.
 * Les campagnes d'étalonnage comportent 10 mesures appariées.
 */
export function sampleStandardDeviation(values: number[]) {
  assertFiniteValues(values, "Ecart-type")
  if (values.length < 2) return 0
  const mean = averageCalibrationValues(values)
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

export function calculateCalibrationResult(
  sensorValues: number[],
  standardValues: number[],
  inputs: Omit<CalibrationUncertaintyInputs, "sensorValues">,
): CalibrationCalculationResult {
  assertFiniteValues(sensorValues, "Mesures sonde")
  assertFiniteValues(standardValues, "Mesures etalon")

  if (sensorValues.length !== standardValues.length) {
    throw new Error("Les mesures sonde et etalon doivent etre appariees.")
  }

  const standardResolution = inputs.standardResolution
  const standardUncertainty = inputs.standardUncertainty
  const mediumStability = inputs.mediumStability
  const mediumHomogeneity = inputs.mediumHomogeneity
  const sensorResolution = inputs.sensorResolution ?? DEFAULT_SENSOR_RESOLUTION

  for (const [label, value] of [
    ["resolution etalon", standardResolution],
    ["incertitude etalon", standardUncertainty],
    ["stabilite", mediumStability],
    ["homogeneite", mediumHomogeneity],
    ["resolution sonde", sensorResolution],
  ] as const) {
    if (!Number.isFinite(value) || value < 0) {
      throw new Error(`Parametre d'etalonnage invalide : ${label}.`)
    }
  }

  const meanSensor = averageCalibrationValues(sensorValues)
  const meanStandard = averageCalibrationValues(standardValues)
  const standardDeviation = sampleStandardDeviation(sensorValues)
  const accuracyError = meanSensor - meanStandard
  const sensorSum = sensorValues.reduce((sum, value) => sum + value, 0)
  const standardSum = standardValues.reduce((sum, value) => sum + value, 0)
  const squaredDeviationSum = sensorValues.reduce(
    (sum, value) => sum + (value - meanSensor) ** 2,
    0,
  )
  const standardDeviationDivisor = Math.max(1, sensorValues.length - 1)
  const standardDeviationVariance = sensorValues.length < 2
    ? 0
    : squaredDeviationSum / standardDeviationDivisor

  const sqrt3 = Math.sqrt(3)
  const u1 = standardResolution / (2 * sqrt3)
  const u2 = CALIBRATION_U2_RANGE / sqrt3
  const u3 = standardUncertainty / 2
  const u4 = sensorResolution / (2 * sqrt3)
  const u5 = 0
  const u6 = CALIBRATION_STANDARD_SELF_HEATING
  const u7 = standardDeviation
  const u8 = 0
  const u9 = Math.sqrt((mediumStability / sqrt3) ** 2 + (mediumHomogeneity / sqrt3) ** 2)
  const u10 = 0
  const u11 = 0
  const uncertaintySquaredSum =
    u1 ** 2 +
    u2 ** 2 +
    u3 ** 2 +
    u4 ** 2 +
    u5 ** 2 +
    u6 ** 2 +
    u7 ** 2 +
    u8 ** 2 +
    u9 ** 2 +
    u10 ** 2 +
    u11 ** 2
  const uncertainty = Math.sqrt(uncertaintySquaredSum)

  return {
    meanSensor,
    meanStandard,
    accuracyError,
    standardDeviation,
    uncertainty,
    details: {
      sampleCount: sensorValues.length,
      sensorSum,
      standardSum,
      meanSensor,
      meanStandard,
      accuracyError,
      standardDeviation: {
        squaredDeviationSum,
        divisor: standardDeviationDivisor,
        variance: standardDeviationVariance,
        value: standardDeviation,
      },
      uncertainty: {
        standardResolution,
        standardUncertainty,
        mediumStability,
        mediumHomogeneity,
        sensorResolution,
        sqrt3,
        u1,
        u2,
        u3,
        u4,
        u5,
        u6,
        u7,
        u8,
        u9,
        u10,
        u11,
        squaredSum: uncertaintySquaredSum,
        value: uncertainty,
      },
    },
  }
}
