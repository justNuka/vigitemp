import { hasMainDbColumn } from "@/lib/db-schema"
import { getTableReference, isMssqlProvider, quoteIdentifier } from "@/lib/metrology-db"
import { prisma } from "@/lib/prisma"

const DIRTY_COLUMN = "Coeffs_Modifies_Depuis_Derniere_Mesure"

export async function requireAdjustmentCoefficientDirtyColumn() {
  if (await hasMainDbColumn("t_ajustage", DIRTY_COLUMN)) return

  throw new Error(
    "La base doit être migrée en version 0.90.2 avant de modifier les coefficients de métrologie.",
  )
}

export async function markLatestAdjustmentCoefficientRowsDirty(serialNumbers: string[]) {
  await requireAdjustmentCoefficientDirtyColumn()

  const serials = Array.from(
    new Set(serialNumbers.map((serial) => serial.trim()).filter((serial) => serial.length > 0)),
  )
  if (serials.length === 0) return

  await prisma.$transaction(async (tx) => {
    for (const serial of serials) {
      const latest = await tx.t_ajustage.findFirst({
        where: { Sonde_Numero_Serie: serial },
        orderBy: [{ Date_Heure_Ajustage: "desc" }, { Id_Ajustage: "desc" }],
        select: { Id_Ajustage: true },
      })

      if (!latest) {
        throw new Error(`Aucun ajustage disponible pour la sonde ${serial}.`)
      }

      const sql = isMssqlProvider()
        ? `UPDATE ${getTableReference("t_ajustage")} SET ${quoteIdentifier(DIRTY_COLUMN)} = @P1 WHERE ${quoteIdentifier("Id_Ajustage")} = @P2`
        : `UPDATE ${getTableReference("t_ajustage")} SET ${quoteIdentifier(DIRTY_COLUMN)} = ? WHERE ${quoteIdentifier("Id_Ajustage")} = ?`

      await tx.$executeRawUnsafe(sql, 1, latest.Id_Ajustage)
    }
  })
}
