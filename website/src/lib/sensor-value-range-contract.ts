export type SensorValueRange = {
  min: number | null
  max: number | null
  unit?: string | null
}

export type LocationRangeField =
  | "Consigne"
  | "Consigne_Sup"
  | "Consigne_Inf"
  | "Consigne_Sup_Pre_Alarme"
  | "Consigne_Inf_Pre_Alarme"
  | "Seuil_Critique_Haut"
  | "Seuil_Critique_Bas"
  | "Tolerance_Surveillance_Sup"
  | "Tolerance_Surveillance_Inf"

export type LocationValueIssue = {
  code: "custom"
  path: [LocationRangeField]
  message: string
}

export type LocationValuesPayload = Partial<
  Record<LocationRangeField, number | null | undefined>
>

const RANGE_FIELDS: Array<{
  key: LocationRangeField
  label: { fr: string; en: string }
}> = [
  { key: "Consigne", label: { fr: "La consigne", en: "The setpoint" } },
  {
    key: "Consigne_Sup",
    label: { fr: "La consigne supérieure", en: "The upper setpoint" },
  },
  {
    key: "Consigne_Inf",
    label: { fr: "La consigne inférieure", en: "The lower setpoint" },
  },
  {
    key: "Consigne_Sup_Pre_Alarme",
    label: { fr: "La pré-alarme supérieure", en: "The upper pre-alarm" },
  },
  {
    key: "Consigne_Inf_Pre_Alarme",
    label: { fr: "La pré-alarme inférieure", en: "The lower pre-alarm" },
  },
  {
    key: "Seuil_Critique_Haut",
    label: { fr: "Le seuil critique haut", en: "The critical upper threshold" },
  },
  {
    key: "Seuil_Critique_Bas",
    label: { fr: "Le seuil critique bas", en: "The critical lower threshold" },
  },
  {
    key: "Tolerance_Surveillance_Sup",
    label: { fr: "La tolérance supérieure", en: "The upper tolerance" },
  },
  {
    key: "Tolerance_Surveillance_Inf",
    label: { fr: "La tolérance inférieure", en: "The lower tolerance" },
  },
]

function formatLimit(value: number, unit?: string | null) {
  return unit?.trim() ? `${value} ${unit.trim()}` : String(value)
}

export function buildLocationValueRangeIssues(
  values: LocationValuesPayload,
  range: SensorValueRange | null,
  locale: "fr" | "en" = "fr",
): LocationValueIssue[] {
  if (!range || (range.min == null && range.max == null)) return []

  const issues: LocationValueIssue[] = []

  for (const field of RANGE_FIELDS) {
    const value = values[field.key]
    if (value == null || Number.isNaN(Number(value))) continue

    if (range.min != null && Number(value) < range.min) {
      issues.push({
        code: "custom",
        path: [field.key],
        message:
          locale === "en"
            ? `${field.label.en} must be greater than or equal to ${formatLimit(
                range.min,
                range.unit,
              )}.`
            : `${field.label.fr} doit être supérieure ou égale à ${formatLimit(
                range.min,
                range.unit,
              )}.`,
      })
    }

    if (range.max != null && Number(value) > range.max) {
      issues.push({
        code: "custom",
        path: [field.key],
        message:
          locale === "en"
            ? `${field.label.en} must be less than or equal to ${formatLimit(
                range.max,
                range.unit,
              )}.`
            : `${field.label.fr} doit être inférieure ou égale à ${formatLimit(
                range.max,
                range.unit,
              )}.`,
      })
    }
  }

  return issues
}
