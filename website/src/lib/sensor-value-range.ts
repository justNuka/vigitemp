import { prisma } from "@/lib/prisma"

type SensorTypeRangeRow = {
  valeurMin: number | null
  valeurMax: number | null
}

type LocationValueIssue = {
  code: "custom"
  path: [string]
  message: string
}

type LocationValuesPayload = Partial<Record<
  | "Consigne"
  | "Consigne_Sup"
  | "Consigne_Inf"
  | "Consigne_Sup_Pre_Alarme"
  | "Consigne_Inf_Pre_Alarme"
  | "Tolerance_Surveillance_Sup"
  | "Tolerance_Surveillance_Inf",
  number | null | undefined
>>

const RANGE_FIELDS: Array<{ key: keyof LocationValuesPayload; label: string }> = [
  { key: "Consigne", label: "La consigne" },
  { key: "Consigne_Sup", label: "La consigne superieure" },
  { key: "Consigne_Inf", label: "La consigne inferieure" },
  { key: "Consigne_Sup_Pre_Alarme", label: "La pre-alarme superieure" },
  { key: "Consigne_Inf_Pre_Alarme", label: "La pre-alarme inferieure" },
  { key: "Tolerance_Surveillance_Sup", label: "La tolerance superieure" },
  { key: "Tolerance_Surveillance_Inf", label: "La tolerance inferieure" },
]

function isMissingSensorTypeRangeColumnError(error: unknown) {
  if (error instanceof Error) {
    return error.message.includes("Valeur_Min") || error.message.includes("Valeur_Max")
  }

  return false
}

export async function getSensorTypeValueRangeBySerial(serialNumber: string | null | undefined) {
  if (!serialNumber) return null

  try {
    const rows = await prisma.$queryRaw<SensorTypeRangeRow[]>`
      SELECT
        st.Valeur_Min AS valeurMin,
        st.Valeur_Max AS valeurMax
      FROM t_sonde s
      LEFT JOIN t_sonde_type st ON st.Sonde_Type = s.Sonde_Type
      WHERE s.Sonde_Numero_Serie = ${serialNumber}
      LIMIT 1
    `

    const row = rows[0]
    if (!row) return null

    return {
      min: row.valeurMin ?? null,
      max: row.valeurMax ?? null,
    }
  } catch (error) {
    if (isMissingSensorTypeRangeColumnError(error)) {
      return null
    }
    throw error
  }
}

export function buildLocationValueRangeIssues(
  values: LocationValuesPayload,
  range: { min: number | null; max: number | null } | null,
) {
  if (!range || (range.min == null && range.max == null)) return [] as LocationValueIssue[]

  const issues: LocationValueIssue[] = []

  for (const field of RANGE_FIELDS) {
    const value = values[field.key]
    if (value == null || Number.isNaN(Number(value))) continue

    if (range.min != null && Number(value) < range.min) {
      issues.push({
        code: "custom",
        path: [field.key],
        message: `${field.label} doit etre superieure ou egale a ${range.min}.`,
      })
    }

    if (range.max != null && Number(value) > range.max) {
      issues.push({
        code: "custom",
        path: [field.key],
        message: `${field.label} doit etre inferieure ou egale a ${range.max}.`,
      })
    }
  }

  return issues
}
