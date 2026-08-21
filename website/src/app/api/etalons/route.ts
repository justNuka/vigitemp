import { NextRequest } from "next/server"
import { z } from "zod"

import { getClientIp } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { auditRouteCreate } from "@/lib/audit-route"
import { withStandardOrExpertAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import {
  quoteIdentifier,
  getTableReference,
  resolveEtalonFeatureFlags,
  updateEtalonExtendedFields,
  fetchEtalonRows,
  findEtalonBySerial,
  insertEtalonBase,
  fetchEtalonById,
} from "@/lib/metrology-db"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"
import { inferStandardTypeCode } from "@/lib/standard-types"
import { serializeDbDateTime } from "@/lib/date-display"

const ETALON_READ_CODES = getPermissionAliases("METROLOGY_ACCESS")
const ETALON_WRITE_CODES = getPermissionAliases("METROLOGY_OPERATION_ACCESS")

function formatDecimalValue(value: unknown): string | null {
  if (value == null) return null
  const numeric = typeof value === "number" ? value : Number(String(value).replace(",", "."))
  if (!Number.isFinite(numeric)) {
    const raw = String(value).trim()
    return raw.length > 0 ? raw : null
  }

  return numeric
    .toFixed(12)
    .replace(/\.?0+$/, "")
}

const nullableNumberField = z.union([z.number(), z.string(), z.null(), z.undefined()]).transform((value) => {
  if (value === null || value === undefined || value === "") return null
  const parsed = typeof value === "number" ? value : Number(String(value).replace(",", "."))
  return Number.isFinite(parsed) ? parsed : null
})

const createEtalonSchema = z.object({
  Etalon_Numero_Serie: z.string().min(1, "Numero de serie requis"),
  Etat_Etalon: z.string().optional(),
  Id_Module: z.number().nullable().optional(),
  Est_Sonde_Externe: z.boolean().optional(),
  Coeff_A: nullableNumberField,
  Coeff_B: nullableNumberField,
  Coeff_C: nullableNumberField,
  Incertitude_Max: nullableNumberField,
  Pdf_Id: z.number().nullable().optional(),
})

async function fetchEtalonExtras(etalonIds: number[]) {
  if (etalonIds.length === 0) return new Map<number, Record<string, number | null>>()
  const flags = await resolveEtalonFeatureFlags()
  if (!flags.coeffA && !flags.coeffB && !flags.coeffC && !flags.uncertaintyMax) {
    return new Map<number, Record<string, number | null>>()
  }

  const selectedColumns = [
    `${quoteIdentifier("Id_Etalon")} AS Id_Etalon`,
    flags.coeffA ? `${quoteIdentifier("Coeff_A")} AS Coeff_A` : `NULL AS Coeff_A`,
    flags.coeffB ? `${quoteIdentifier("Coeff_B")} AS Coeff_B` : `NULL AS Coeff_B`,
    flags.coeffC ? `${quoteIdentifier("Coeff_C")} AS Coeff_C` : `NULL AS Coeff_C`,
    flags.uncertaintyMax ? `${quoteIdentifier("Incertitude_Max")} AS Incertitude_Max` : `NULL AS Incertitude_Max`,
  ]

  const sql = `SELECT ${selectedColumns.join(", ")} FROM ${getTableReference("t_etalon")} WHERE ${quoteIdentifier("Id_Etalon")} IN (${etalonIds.join(",")})`
  const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(sql)
  const result = new Map<number, Record<string, number | null>>()

  for (const row of rows) {
    const id = Number(row.Id_Etalon)
    result.set(id, {
      Coeff_A: row.Coeff_A == null ? null : Number(row.Coeff_A),
      Coeff_B: row.Coeff_B == null ? null : Number(row.Coeff_B),
      Coeff_C: row.Coeff_C == null ? null : Number(row.Coeff_C),
      Incertitude_Max: row.Incertitude_Max == null ? null : Number(row.Incertitude_Max),
    })
  }

  return result
}

export const GET = withStandardOrExpertAnyAuthorizationLogging(ETALON_READ_CODES, async (req: NextRequest) => {
  try {
    const status = new URL(req.url).searchParams.get("status")
    const rows = await fetchEtalonRows(
      status === "all" ? "all" : status === "archived" ? "archived" : "active",
    )
    const etalons = rows.map((row) => ({
      Id_Etalon: Number(row.Id_Etalon),
      Etalon_Numero_Serie: row.Etalon_Numero_Serie == null ? null : String(row.Etalon_Numero_Serie),
      Etat_Etalon: row.Etat_Etalon == null ? null : String(row.Etat_Etalon),
      Port_Serie: row.Port_Serie == null ? null : String(row.Port_Serie),
      Id_Worker: row.Id_Worker == null ? null : Number(row.Id_Worker),
      Id_Module: row.Id_Module == null ? null : Number(row.Id_Module),
      Resolution: formatDecimalValue(row.Resolution),
      Incertitude: formatDecimalValue(row.Incertitude),
      Nb_Decimale: row.Nb_Decimale == null ? null : Number(row.Nb_Decimale),
      Est_Archive: Boolean(Number(row.Est_Archive ?? 0)),
      Est_Sonde_Externe: row.Est_Sonde_Externe == null ? null : Boolean(Number(row.Est_Sonde_Externe)),
    }))

    const extrasMap = await fetchEtalonExtras(etalons.map((item) => item.Id_Etalon))
    const standardTypes = await prisma.t_etalon_type.findMany({
      select: {
        Type_Etalon: true,
        Resolution: true,
        Est_Sonde_Externe: true,
      },
    })
    const standardTypeByCode = new Map(
      standardTypes.map((item) => [String(item.Type_Etalon).trim().toUpperCase(), item]),
    )
    const serials = Array.from(new Set(etalons.map((item) => item.Etalon_Numero_Serie).filter((value): value is string => Boolean(value))))

    const certifs = serials.length
      ? await prisma.t_certif.findMany({
          where: {
            Etalon_Numero_Serie: { in: serials },
          },
          select: {
            Id_Certif: true,
            Etalon_Numero_Serie: true,
            Numero: true,
            Organisme: true,
            Date: true,
            Unite: true,
            Id_PDF: true,
          },
          orderBy: [{ Date: "desc" }, { Id_Certif: "desc" }],
        })
      : []

    const latestCertifBySerial = new Map<string, (typeof certifs)[number]>()
    for (const certif of certifs) {
      const serial = certif.Etalon_Numero_Serie?.trim()
      if (!serial || latestCertifBySerial.has(serial)) continue
      latestCertifBySerial.set(serial, certif)
    }

    const pdfIds = Array.from(new Set(certifs.map((item) => item.Id_PDF).filter((value): value is number => typeof value === "number" && Number.isFinite(value))))
    const pdfs = pdfIds.length
      ? await prisma.t_pdf.findMany({
          where: { Id_PDF: { in: pdfIds } },
          select: { Id_PDF: true, Nom_PDF: true },
        })
      : []
    const pdfById = new Map(pdfs.map((pdf) => [pdf.Id_PDF, pdf]))

    const data = etalons.map((etalon) => {
      const certif = etalon.Etalon_Numero_Serie ? latestCertifBySerial.get(etalon.Etalon_Numero_Serie) ?? null : null
      const pdf = certif?.Id_PDF ? pdfById.get(certif.Id_PDF) ?? null : null
      const extras = extrasMap.get(etalon.Id_Etalon)
      const typeCode = inferStandardTypeCode(etalon.Etalon_Numero_Serie, standardTypes)
      const typeInfo = typeCode ? standardTypeByCode.get(typeCode) ?? null : null

      return {
        ...etalon,
        Type_Etalon: typeCode,
        Resolution: formatDecimalValue(typeInfo?.Resolution),
        Est_Sonde_Externe:
          typeInfo?.Est_Sonde_Externe == null ? etalon.Est_Sonde_Externe : Boolean(typeInfo.Est_Sonde_Externe),
        Coeff_A: extras?.Coeff_A ?? null,
        Coeff_B: extras?.Coeff_B ?? null,
        Coeff_C: extras?.Coeff_C ?? null,
        Incertitude_Max: extras?.Incertitude_Max ?? null,
        Date_Certif: serializeDbDateTime(certif?.Date),
        Organisme: certif?.Organisme || null,
        Num_Certif: certif?.Numero || null,
        Unite: certif?.Unite || null,
        Pdf_Id: certif?.Id_PDF ?? null,
        Pdf_Name: pdf?.Nom_PDF ?? null,
      }
    })

    return apiOk(data)
  } catch (error) {
    log.error("etalons", "etalons_fetch_error", { error })
    return apiError(500, "etalons_fetch_failed", "Erreur lors de la recuperation des etalons")
  }
})

export const POST = withStandardOrExpertAnyAuthorizationLogging(ETALON_WRITE_CODES, async (req: NextRequest, ctx) => {
  try {
    const body = await req.json()
    const data = createEtalonSchema.parse(body)

    const existingEtalon = await findEtalonBySerial(data.Etalon_Numero_Serie)

    if (existingEtalon) {
      return apiError(409, "conflict", "Un etalon avec ce numero de serie existe deja")
    }

    const selectedModule = data.Id_Module
      ? await prisma.t_module.findUnique({
          where: { Id_Module: data.Id_Module },
          select: { Id_Module: true, Port_Serie: true, Id_Worker: true },
        })
      : null

    const newEtalonId = await insertEtalonBase({
      serial: data.Etalon_Numero_Serie,
      state: data.Etat_Etalon || "1",
      portSerie: selectedModule?.Port_Serie ? String(selectedModule.Port_Serie) : null,
      idWorker: selectedModule?.Id_Worker ?? null,
      idModule: selectedModule?.Id_Module ?? null,
      estSondeExterne: data.Est_Sonde_Externe ?? false,
    })

    const newEtalonRow = await fetchEtalonById(newEtalonId)
    const newEtalon = {
      Id_Etalon: newEtalonId,
      Etalon_Numero_Serie: data.Etalon_Numero_Serie,
      Etat_Etalon: newEtalonRow?.Etat_Etalon == null ? data.Etat_Etalon || "1" : String(newEtalonRow.Etat_Etalon),
      Port_Serie: newEtalonRow?.Port_Serie == null ? (selectedModule?.Port_Serie ? String(selectedModule.Port_Serie) : null) : String(newEtalonRow.Port_Serie),
      Id_Worker: newEtalonRow?.Id_Worker == null ? selectedModule?.Id_Worker ?? null : Number(newEtalonRow.Id_Worker),
      Id_Module: newEtalonRow?.Id_Module == null ? selectedModule?.Id_Module ?? null : Number(newEtalonRow.Id_Module),
      Est_Sonde_Externe: newEtalonRow?.Est_Sonde_Externe == null ? data.Est_Sonde_Externe ?? false : Boolean(Number(newEtalonRow.Est_Sonde_Externe)),
    }

    await updateEtalonExtendedFields(newEtalon.Id_Etalon, {
      coeffA: data.Coeff_A,
      coeffB: data.Coeff_B,
      coeffC: data.Coeff_C,
      uncertaintyMax: data.Incertitude_Max,
    })

    if (data.Pdf_Id) {
      await prisma.t_certif.create({
        data: {
          Etalon_Numero_Serie: data.Etalon_Numero_Serie,
          Id_PDF: data.Pdf_Id,
        },
      })
    }

    log.data.create("Etalon", newEtalon.Id_Etalon, ctx.user.username, ctx.user.userId, getClientIp(req), {
      serie: data.Etalon_Numero_Serie,
      etat: data.Etat_Etalon || "1",
      coeffA: data.Coeff_A,
      coeffB: data.Coeff_B,
      coeffC: data.Coeff_C,
      incertitudeMax: data.Incertitude_Max,
      hasPdf: Boolean(data.Pdf_Id),
    })

    auditRouteCreate(req, ctx.user, {
      resource: "Etalon",
      resourceId: newEtalon.Id_Etalon,
      data: {
        Etalon_Numero_Serie: newEtalon.Etalon_Numero_Serie,
        Etat_Etalon: newEtalon.Etat_Etalon,
        Port_Serie: newEtalon.Port_Serie,
        Id_Worker: newEtalon.Id_Worker,
        Id_Module: newEtalon.Id_Module,
        Coeff_A: data.Coeff_A,
        Coeff_B: data.Coeff_B,
        Coeff_C: data.Coeff_C,
        Incertitude_Max: data.Incertitude_Max,
        Pdf_Id: data.Pdf_Id ?? null,
      },
      reason: `Creation etalon ${newEtalon.Etalon_Numero_Serie}`,
    })

    return apiOk({
      message: "Etalon cree avec succes",
      etalon: newEtalon,
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Donnees invalides", { details: error.issues })
    }

    if (error instanceof Error && /Unknown column 'Coeff_|Unknown column 'Incertitude_Max'/.test(error.message)) {
      return apiError(500, "metrology_sql_missing", "La base de donnees doit etre mise a jour pour gerer les coefficients et l'incertitude max des etalons")
    }

    log.error("etalons", "etalon_creation_error", { error })
    return apiError(500, "etalon_create_failed", "Erreur lors de la creation de l'etalon")
  }
})
