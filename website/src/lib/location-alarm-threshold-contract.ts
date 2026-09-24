import { computeEmt, type EmtInput } from "@/lib/emt"
import { buildCriticalThresholdIssues } from "@/lib/location-critical-threshold-contract"

export type LocationAlarmThresholdField =
  | "Consigne"
  | "Consigne_Sup"
  | "Consigne_Inf"
  | "Consigne_Sup_Pre_Alarme"
  | "Consigne_Inf_Pre_Alarme"
  | "Seuil_Critique_Haut"
  | "Seuil_Critique_Bas"

export type LocationAlarmThresholdIssue = {
  code: "custom"
  path: [LocationAlarmThresholdField]
  message: string
}

export type LocationAlarmThresholdValues = EmtInput & {
  preAlarmHigh?: number | null
  preAlarmHighActive?: boolean | null
  preAlarmLow?: number | null
  preAlarmLowActive?: boolean | null
  criticalHigh?: number | null
  criticalHighActive?: boolean | null
  criticalLow?: number | null
  criticalLowActive?: boolean | null
  effectiveHigh?: number | null
  effectiveLow?: number | null
}

function finite(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

function message(locale: "fr" | "en", fr: string, en: string) {
  return locale === "en" ? en : fr
}

export function computeLocationAlarmThresholdState(values: LocationAlarmThresholdValues) {
  const emt = computeEmt(values)
  const highActive = values.isConsigneSupActive === true
  const lowActive = values.isConsigneInfActive === true

  const rawHigh = finite(values.consigneSup)
  const rawLow = finite(values.consigneInf)
  const effectiveHigh =
    highActive
      ? finite(values.effectiveHigh) ?? finite(emt.toleranceSup) ?? rawHigh
      : null
  const effectiveLow =
    lowActive
      ? finite(values.effectiveLow) ?? finite(emt.toleranceInf) ?? rawLow
      : null

  return {
    emt,
    consigne: finite(values.consigne),
    rawHigh,
    rawLow,
    effectiveHigh,
    effectiveLow,
    preAlarmHigh: finite(values.preAlarmHigh),
    preAlarmLow: finite(values.preAlarmLow),
    criticalHigh: finite(values.criticalHigh),
    criticalLow: finite(values.criticalLow),
    highActive,
    lowActive,
    preAlarmHighActive: values.preAlarmHighActive === true,
    preAlarmLowActive: values.preAlarmLowActive === true,
    criticalHighActive: values.criticalHighActive === true,
    criticalLowActive: values.criticalLowActive === true,
  }
}

export function buildLocationAlarmThresholdIssues(
  values: LocationAlarmThresholdValues,
  locale: "fr" | "en" = "fr",
): LocationAlarmThresholdIssue[] {
  const state = computeLocationAlarmThresholdState(values)
  const issues: LocationAlarmThresholdIssue[] = []

  if (state.highActive && state.rawHigh === null) {
    issues.push({
      code: "custom",
      path: ["Consigne_Sup"],
      message: message(
        locale,
        "La consigne supérieure est requise quand le seuil haut est actif.",
        "The upper setpoint is required when the upper threshold is enabled.",
      ),
    })
  }

  if (state.lowActive && state.rawLow === null) {
    issues.push({
      code: "custom",
      path: ["Consigne_Inf"],
      message: message(
        locale,
        "La consigne inférieure est requise quand le seuil bas est actif.",
        "The lower setpoint is required when the lower threshold is enabled.",
      ),
    })
  }

  if (
    state.consigne !== null &&
    state.highActive &&
    state.rawHigh !== null &&
    state.rawHigh <= state.consigne
  ) {
    issues.push({
      code: "custom",
      path: ["Consigne_Sup"],
      message: message(
        locale,
        "La consigne supérieure doit être strictement supérieure à la consigne.",
        "The upper setpoint must be strictly above the setpoint.",
      ),
    })
  }

  if (
    state.consigne !== null &&
    state.lowActive &&
    state.rawLow !== null &&
    state.rawLow >= state.consigne
  ) {
    issues.push({
      code: "custom",
      path: ["Consigne_Inf"],
      message: message(
        locale,
        "La consigne inférieure doit être strictement inférieure à la consigne.",
        "The lower setpoint must be strictly below the setpoint.",
      ),
    })
  }

  if (
    state.highActive &&
    state.lowActive &&
    state.rawHigh !== null &&
    state.rawLow !== null &&
    state.rawLow >= state.rawHigh
  ) {
    issues.push({
      code: "custom",
      path: ["Consigne_Inf"],
      message: message(
        locale,
        "La consigne inférieure doit être strictement inférieure à la consigne supérieure.",
        "The lower setpoint must be strictly below the upper setpoint.",
      ),
    })
  }

  if (
    state.consigne !== null &&
    state.highActive &&
    state.effectiveHigh !== null &&
    state.effectiveHigh <= state.consigne
  ) {
    issues.push({
      code: "custom",
      path: ["Consigne_Sup"],
      message: message(
        locale,
        "Avec l'EMT appliquée, le seuil effectif haut doit rester strictement supérieur à la consigne.",
        "After applying MPE, the effective upper threshold must remain strictly above the setpoint.",
      ),
    })
  }

  if (
    state.consigne !== null &&
    state.lowActive &&
    state.effectiveLow !== null &&
    state.effectiveLow >= state.consigne
  ) {
    issues.push({
      code: "custom",
      path: ["Consigne_Inf"],
      message: message(
        locale,
        "Avec l'EMT appliquée, le seuil effectif bas doit rester strictement inférieur à la consigne.",
        "After applying MPE, the effective lower threshold must remain strictly below the setpoint.",
      ),
    })
  }

  if (
    state.highActive &&
    state.lowActive &&
    state.effectiveHigh !== null &&
    state.effectiveLow !== null &&
    state.effectiveLow >= state.effectiveHigh
  ) {
    issues.push({
      code: "custom",
      path: ["Consigne_Inf"],
      message: message(
        locale,
        "Les seuils effectifs haut et bas se croisent après prise en compte de l'EMT.",
        "The effective upper and lower thresholds overlap after applying MPE.",
      ),
    })
  }

  if (state.preAlarmHighActive && state.preAlarmHigh === null) {
    issues.push({
      code: "custom",
      path: ["Consigne_Sup_Pre_Alarme"],
      message: message(
        locale,
        "La pré-alarme supérieure est requise lorsqu'elle est activée.",
        "The upper pre-alarm is required when enabled.",
      ),
    })
  }

  if (state.preAlarmLowActive && state.preAlarmLow === null) {
    issues.push({
      code: "custom",
      path: ["Consigne_Inf_Pre_Alarme"],
      message: message(
        locale,
        "La pré-alarme inférieure est requise lorsqu'elle est activée.",
        "The lower pre-alarm is required when enabled.",
      ),
    })
  }

  if (state.preAlarmHighActive && !state.highActive) {
    issues.push({
      code: "custom",
      path: ["Consigne_Sup_Pre_Alarme"],
      message: message(
        locale,
        "La pré-alarme supérieure nécessite un seuil d'alarme haut actif.",
        "The upper pre-alarm requires an active upper alarm threshold.",
      ),
    })
  }

  if (state.preAlarmLowActive && !state.lowActive) {
    issues.push({
      code: "custom",
      path: ["Consigne_Inf_Pre_Alarme"],
      message: message(
        locale,
        "La pré-alarme inférieure nécessite un seuil d'alarme bas actif.",
        "The lower pre-alarm requires an active lower alarm threshold.",
      ),
    })
  }

  if (
    state.consigne !== null &&
    state.preAlarmHighActive &&
    state.preAlarmHigh !== null &&
    state.preAlarmHigh <= state.consigne
  ) {
    issues.push({
      code: "custom",
      path: ["Consigne_Sup_Pre_Alarme"],
      message: message(
        locale,
        "La pré-alarme supérieure doit être strictement supérieure à la consigne.",
        "The upper pre-alarm must be strictly above the setpoint.",
      ),
    })
  }

  if (
    state.preAlarmHighActive &&
    state.preAlarmHigh !== null &&
    state.effectiveHigh !== null &&
    state.preAlarmHigh >= state.effectiveHigh
  ) {
    issues.push({
      code: "custom",
      path: ["Consigne_Sup_Pre_Alarme"],
      message: message(
        locale,
        "La pré-alarme supérieure doit rester strictement sous le seuil effectif haut, EMT comprise.",
        "The upper pre-alarm must remain strictly below the effective upper threshold, including MPE.",
      ),
    })
  }

  if (
    state.consigne !== null &&
    state.preAlarmLowActive &&
    state.preAlarmLow !== null &&
    state.preAlarmLow >= state.consigne
  ) {
    issues.push({
      code: "custom",
      path: ["Consigne_Inf_Pre_Alarme"],
      message: message(
        locale,
        "La pré-alarme inférieure doit être strictement inférieure à la consigne.",
        "The lower pre-alarm must be strictly below the setpoint.",
      ),
    })
  }

  if (
    state.preAlarmLowActive &&
    state.preAlarmLow !== null &&
    state.effectiveLow !== null &&
    state.preAlarmLow <= state.effectiveLow
  ) {
    issues.push({
      code: "custom",
      path: ["Consigne_Inf_Pre_Alarme"],
      message: message(
        locale,
        "La pré-alarme inférieure doit rester strictement au-dessus du seuil effectif bas, EMT comprise.",
        "The lower pre-alarm must remain strictly above the effective lower threshold, including MPE.",
      ),
    })
  }

  if (
    state.preAlarmHighActive &&
    state.preAlarmLowActive &&
    state.preAlarmHigh !== null &&
    state.preAlarmLow !== null &&
    state.preAlarmLow >= state.preAlarmHigh
  ) {
    issues.push({
      code: "custom",
      path: ["Consigne_Inf_Pre_Alarme"],
      message: message(
        locale,
        "La pré-alarme inférieure doit être strictement inférieure à la pré-alarme supérieure.",
        "The lower pre-alarm must be strictly below the upper pre-alarm.",
      ),
    })
  }

  const criticalIssues = buildCriticalThresholdIssues(
    {
      consigne: state.consigne,
      effectiveHigh: state.effectiveHigh,
      effectiveLow: state.effectiveLow,
      criticalHigh: state.criticalHigh,
      criticalHighActive: state.criticalHighActive,
      criticalLow: state.criticalLow,
      criticalLowActive: state.criticalLowActive,
    },
    locale,
  )

  return [...issues, ...criticalIssues]
}
