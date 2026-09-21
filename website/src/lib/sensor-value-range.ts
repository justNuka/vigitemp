import { Prisma } from "../generated/@prisma-db-main"
import { prisma } from "@/lib/prisma"
import { isMssqlProvider } from "@/lib/sql-provider"
import { buildLocationValueRangeIssues, type SensorValueRange } from "@/lib/sensor-value-range-contract"

export { buildLocationValueRangeIssues } from "@/lib/sensor-value-range-contract"

type SensorTypeRangeRow = {
  valeurMin: number | null
  valeurMax: number | null
  unite: string | null
}

type SensorTypeDefinitionRangeRow = {
  sondeType: string | null
  valeurMin: number | null
  valeurMax: number | null
  unite: string | null
}

function isMissingSensorTypeRangeColumnError(error: unknown) {
  if (error instanceof Error) {
    return error.message.includes("Valeur_Min") || error.message.includes("Valeur_Max")
  }

  return false
}

export async function getSensorTypeValueRangesByCodes(
  typeCodes: Array<string | null | undefined>,
) {
  const normalized = Array.from(
    new Set(
      typeCodes
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  )

  if (normalized.length === 0) {
    return new Map<string, SensorValueRange>()
  }

  try {
    const rows = await prisma.$queryRaw<SensorTypeDefinitionRangeRow[]>(
      Prisma.sql`
        SELECT
          Sonde_Type AS sondeType,
          Valeur_Min AS valeurMin,
          Valeur_Max AS valeurMax,
          Unite AS unite
        FROM t_sonde_type
        WHERE Sonde_Type IN (${Prisma.join(normalized)})
      `,
    )

    return new Map(
      rows
        .filter((row) => Boolean(row.sondeType))
        .map((row) => [
          row.sondeType as string,
          {
            min: row.valeurMin ?? null,
            max: row.valeurMax ?? null,
            unit: row.unite ?? null,
          } satisfies SensorValueRange,
        ]),
    )
  } catch (error) {
    if (isMissingSensorTypeRangeColumnError(error)) {
      return new Map<string, SensorValueRange>()
    }
    throw error
  }
}

export async function getSensorTypeValueRangeBySerial(serialNumber: string | null | undefined) {
  if (!serialNumber) return null

  try {
    const rows = isMssqlProvider()
      ? await prisma.$queryRaw<SensorTypeRangeRow[]>`
          SELECT TOP 1
            st.Valeur_Min AS valeurMin,
            st.Valeur_Max AS valeurMax,
            st.Unite AS unite
          FROM t_sonde s
          LEFT JOIN t_sonde_type st ON st.Sonde_Type = s.Sonde_Type
          WHERE s.Sonde_Numero_Serie = ${serialNumber}
        `
      : await prisma.$queryRaw<SensorTypeRangeRow[]>`
          SELECT
            st.Valeur_Min AS valeurMin,
            st.Valeur_Max AS valeurMax,
            st.Unite AS unite
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
      unit: row.unite ?? null,
    } satisfies SensorValueRange
  } catch (error) {
    if (isMissingSensorTypeRangeColumnError(error)) {
      return null
    }
    throw error
  }
}
