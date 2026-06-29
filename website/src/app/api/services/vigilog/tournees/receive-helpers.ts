import { prisma, prismaMesure } from "@/lib/prisma"
import { normalizeOptionalText } from "../_shared"

export type InputVigilogMeasure = {
  Numero_Ordre?: number | null
  Date_Heure_Mesure: Date
  Valeur?: number | null
  Est_Marqueur?: boolean
  Details?: string | null
}

type AnalysedMeasure = {
  order: number | null
  measuredAt: Date
  value: number | null
  isOutOfLimit: boolean
  isInAlarm: boolean
  isMarker: boolean
  details: string | null
}

function isOutOfLimits(
  value: number | null,
  lowActive: boolean,
  lowLimit: number | null,
  highActive: boolean,
  highLimit: number | null,
) {
  if (value == null) return false
  if (lowActive && lowLimit != null && value < lowLimit) return true
  if (highActive && highLimit != null && value > highLimit) return true
  return false
}

function applyAccuracyError(value: number | null, accuracyError: number | null) {
  if (value == null) return null
  if (accuracyError == null) return value
  return Number((value + accuracyError).toFixed(4))
}

export function analyseVigilogMeasures(params: {
  measures: InputVigilogMeasure[]
  lowActive: boolean
  lowLimit: number | null
  highActive: boolean
  highLimit: number | null
  frequencyMinutes: number
  alarmDelayMinutes: number
  accuracyError?: number | null
}) {
  const sorted = [...params.measures].sort(
    (a, b) => a.Date_Heure_Mesure.getTime() - b.Date_Heure_Mesure.getTime(),
  )

  let outOfLimitDurationSeconds = 0
  let alarmDurationSeconds = 0
  let hasExcursion = false
  let hasAlarm = false

  const analysed = sorted.map((measure, index) => {
    const value = applyAccuracyError(measure.Valeur ?? null, params.accuracyError ?? null)
    const outOfLimit = isOutOfLimits(
      value,
      params.lowActive,
      params.lowLimit,
      params.highActive,
      params.highLimit,
    )
    if (outOfLimit) hasExcursion = true

    let intervalSeconds = params.frequencyMinutes * 60
    if (index < sorted.length - 1) {
      const nextTime = sorted[index + 1].Date_Heure_Mesure.getTime()
      const deltaSeconds = Math.max(
        0,
        Math.round((nextTime - measure.Date_Heure_Mesure.getTime()) / 1000),
      )
      if (deltaSeconds > 0) intervalSeconds = deltaSeconds
    }

    return {
      order: measure.Numero_Ordre ?? null,
      measuredAt: measure.Date_Heure_Mesure,
      value,
      isOutOfLimit: outOfLimit,
      isInAlarm: false,
      isMarker: Boolean(measure.Est_Marqueur),
      details: normalizeOptionalText(measure.Details),
      intervalSeconds,
    }
  }) as Array<AnalysedMeasure & { intervalSeconds: number }>

  let runStartIndex = -1
  let elapsedSeconds = 0
  const delayThresholdSeconds = params.alarmDelayMinutes * 60

  for (let index = 0; index < analysed.length; index += 1) {
    const measure = analysed[index]
    if (!measure.isOutOfLimit) {
      runStartIndex = -1
      elapsedSeconds = 0
      continue
    }

    if (runStartIndex === -1) {
      runStartIndex = index
      elapsedSeconds = measure.intervalSeconds
    } else {
      elapsedSeconds += measure.intervalSeconds
    }

    outOfLimitDurationSeconds += measure.intervalSeconds

    if (elapsedSeconds >= delayThresholdSeconds) {
      hasAlarm = true
      alarmDurationSeconds += measure.intervalSeconds
      for (let markIndex = runStartIndex; markIndex <= index; markIndex += 1) {
        analysed[markIndex].isInAlarm = true
      }
    }
  }

  const numericValues = analysed
    .map((measure) => measure.value)
    .filter((value): value is number => value != null)

  const measurementCount = analysed.length
  const temperatureMin = numericValues.length ? Math.min(...numericValues) : null
  const temperatureMax = numericValues.length ? Math.max(...numericValues) : null
  const temperatureAverage = numericValues.length
    ? Number(
        (numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length).toFixed(2),
      )
    : null

  const trafficLight = hasAlarm ? "ROUGE" : hasExcursion ? "ORANGE" : "VERT"

  return {
    analysed,
    measurementCount,
    temperatureMin,
    temperatureMax,
    temperatureAverage,
    outOfLimitDurationSeconds,
    alarmDurationSeconds,
    hasExcursion,
    hasAlarm,
    trafficLight,
  }
}

export async function persistVigilogReception(params: {
  tourneeId: number
  arrivalUserId: number
  now: Date
  existingComment: string | null
  receiveComment: string | null | undefined
  measures: InputVigilogMeasure[]
  lowActive: boolean
  lowLimit: number | null
  highActive: boolean
  highLimit: number | null
  frequencyMinutes: number
  alarmDelayMinutes: number
  accuracyError?: number | null
}) {
  const analysis = analyseVigilogMeasures({
    measures: params.measures,
    lowActive: params.lowActive,
    lowLimit: params.lowLimit,
    highActive: params.highActive,
    highLimit: params.highLimit,
    frequencyMinutes: params.frequencyMinutes,
    alarmDelayMinutes: params.alarmDelayMinutes,
    accuracyError: params.accuracyError ?? null,
  })

  if (analysis.analysed.length > 0) {
    const rawMeasures = analysis.analysed.map((measure, index) => ({
      Id_VigiLog_Tournee: params.tourneeId,
      Numero_Ordre: measure.order ?? index + 1,
      Date_Heure_Mesure: measure.measuredAt,
      Valeur: measure.value,
      Est_Hors_Limites: measure.isOutOfLimit,
      Est_En_Alarme: measure.isInAlarm,
      Est_Marqueur: measure.isMarker,
      Details: measure.details,
      Date_Heure_Import: params.now,
    }))

    const dedupedMeasures = Array.from(
      new Map(
        rawMeasures.map((measure) => [
          `${measure.Id_VigiLog_Tournee}::${measure.Numero_Ordre}::${measure.Date_Heure_Mesure.toISOString()}`,
          measure,
        ]),
      ).values(),
    )

    const existingMeasures = await prismaMesure.tm_vigilog_mesure.findMany({
      where: { Id_VigiLog_Tournee: params.tourneeId },
      select: { Numero_Ordre: true, Date_Heure_Mesure: true },
    })

    const existingKeys = new Set(
      existingMeasures.map(
        (measure) =>
          `${params.tourneeId}::${measure.Numero_Ordre}::${measure.Date_Heure_Mesure.toISOString()}`,
      ),
    )

    const measuresToInsert = dedupedMeasures.filter((measure) => {
      const key = `${measure.Id_VigiLog_Tournee}::${measure.Numero_Ordre}::${measure.Date_Heure_Mesure.toISOString()}`
      return !existingKeys.has(key)
    })

    if (measuresToInsert.length > 0) {
    await prismaMesure.tm_vigilog_mesure.createMany({
      data: measuresToInsert,
    })
    }
  }

  const updated = await prisma.t_vigilog_tournee.update({
    where: { Id_VigiLog_Tournee: params.tourneeId },
    data: {
      Statut: analysis.analysed.length > 0 ? "ANALYSEE" : "RECUE",
      Resultat_Feu: analysis.trafficLight,
      Id_Utilisateur_Arrivee: params.arrivalUserId,
      Date_Heure_Arrivee: params.now,
      Nb_Mesures: analysis.measurementCount,
      Temperature_Min: analysis.temperatureMin,
      Temperature_Moyenne: analysis.temperatureAverage,
      Temperature_Max: analysis.temperatureMax,
      Duree_Hors_Limites_Secondes: analysis.outOfLimitDurationSeconds,
      Duree_Alarme_Secondes: analysis.alarmDurationSeconds,
      Est_Depassement_Limites: analysis.hasExcursion,
      Est_Alarme: analysis.hasAlarm,
      Date_Heure_Maj: params.now,
      Commentaire: normalizeOptionalText(
        [params.existingComment, normalizeOptionalText(params.receiveComment)]
          .filter(Boolean)
          .join("\n\n"),
      ),
    },
  })

  return { analysis, updated }
}
