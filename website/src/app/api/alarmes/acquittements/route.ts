import { NextRequest } from "next/server"

import { withAnyAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma, prismaMesure } from "@/lib/prisma"
import { getAccessibleLieuIds } from "@/lib/location-access-scope"
import { log } from "@/lib/logger"
import { serializeDbDateTime } from "@/lib/date-display"

function extractAlarmId(comment: string | null | undefined): number | null {
  if (!comment) return null

  for (const chunk of comment.split("|")) {
    const trimmed = chunk.trim()
    if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) continue

    try {
      const parsed = JSON.parse(trimmed) as { alarmId?: unknown }
      const value = typeof parsed.alarmId === "number" ? parsed.alarmId : Number(parsed.alarmId)
      if (Number.isFinite(value) && value > 0) {
        return value
      }
    } catch {
      // Ignore malformed audit payload fragments.
    }
  }

  return null
}

function normalizeAlarmType(type: string | null | undefined) {
  switch ((type ?? "").trim().toUpperCase()) {
    case "H":
    case "CH":
      return "HIGH"
    case "B":
    case "CB":
      return "LOW"
    case "A":
    case "S":
      return "SECTOR"
    case "N":
    case "T":
      return "NO_RESPONSE"
    case "M":
      return "MODULE"
    default:
      return type?.trim() || null
  }
}

function formatAlarmValue(value: number | null | undefined, unit: string | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  const formatted = value.toFixed(2)
  const normalizedUnit = unit?.trim()
  return normalizedUnit ? `${formatted} ${normalizedUnit}` : formatted
}

export const GET = withAnyAuthorizationLogging(
  getPermissionAliases("ALARM_ACK_ACCESS"),
  async (req: NextRequest, ctx: HandlerContext) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1)
      const rawLimit = parseInt(searchParams.get("limit") || "20", 10)
      const limit = Math.min(Math.max(rawLimit, 1), 1000)
      const skip = (page - 1) * limit
      const q = searchParams.get("q")?.trim() || ""
      const type = searchParams.get("type")?.trim().toUpperCase() || ""
      const lieuId = parseInt(searchParams.get("lieuId") || "", 10)
      const dateFrom = searchParams.get("dateFrom")?.trim() || ""
      const dateTo = searchParams.get("dateTo")?.trim() || ""

      const accessibleLieuIds = await getAccessibleLieuIds(ctx.user.userId)
      if (accessibleLieuIds && accessibleLieuIds.length === 0) {
        return apiOk({
          data: [],
          filters: { sites: [] },
          pagination: { page, limit, total: 0, pages: 1 },
        })
      }

      const accessibleLieuWhere = accessibleLieuIds ? { Id_Lieu: { in: accessibleLieuIds } } : {}
      const finalLieuIds = Number.isFinite(lieuId) && lieuId > 0 ? [lieuId] : accessibleLieuIds

      const where = {
        Code_Journal: "ACQ",
        ...(finalLieuIds ? { Id_Lieu: { in: finalLieuIds } } : {}),
        ...(dateFrom || dateTo
          ? {
              Date_Heure_Journal: {
                ...(dateFrom ? { gte: new Date(`${dateFrom}T00:00:00`) } : {}),
                ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59.999`) } : {}),
              },
            }
          : {}),
        ...(q
          ? {
              OR: [
                { Nom_Utilisateur: { contains: q } },
                { t_lieu: { is: { Nom_Lieu: { contains: q } } } },
                { Nom_Utilisateur: { contains: q } },
              ],
            }
          : {}),
      }

      const [totalWithoutType, rawRows, lieuOptionsRows] = await Promise.all([
        type ? Promise.resolve(0) : prismaMesure.tm_journal.count({ where }),
        prismaMesure.tm_journal.findMany({
          where,
          orderBy: { Date_Heure_Journal: "desc" },
          ...(type ? {} : { skip, take: limit }),
          select: {
            Id_Journal: true,
            Date_Heure_Journal: true,
            Nom_Utilisateur: true,
            Commentaire: true,
            Commentaire_Utilisateur: true,
            Id_Lieu: true,
          },
        }),
        prisma.t_lieu.findMany({
          where: accessibleLieuWhere,
          select: { Id_Lieu: true, Nom_Lieu: true },
          orderBy: { Nom_Lieu: "asc" },
        }),
      ])

      const alarmIds = Array.from(
        new Set(
          rawRows
            .map((row) => extractAlarmId(row.Commentaire))
            .filter((value): value is number => typeof value === "number" && value > 0),
        ),
      )

      const lieuIds = Array.from(
        new Set(
          rawRows
            .map((row) => row.Id_Lieu)
            .filter((value): value is number => typeof value === "number" && value > 0),
        ),
      )

      const [lieux, histos] = await Promise.all([
        lieuIds.length > 0
          ? prisma.t_lieu.findMany({
              where: { Id_Lieu: { in: lieuIds } },
              select: {
                Id_Lieu: true,
                Nom_Lieu: true,
                Sonde_Numero_Serie: true,
                t_site: { select: { Libelle_Site: true } },
              },
            })
          : Promise.resolve([]),
        alarmIds.length > 0
          ? prisma.t_alarme_histo.findMany({
              where: { Id_Alarme: { in: alarmIds } },
              orderBy: [{ Date_Heure_Acquittement: "desc" }, { Date_Heure_Fin: "desc" }],
              select: {
                Id_Alarme: true,
                Sonde_Numero_Serie: true,
                Type: true,
                Valeur: true,
                Unite: true,
                Id_Lieu: true,
                Date_Heure_Debut: true,
                Date_Heure_Fin: true,
                Date_Heure_Acquittement: true,
              },
            })
          : Promise.resolve([]),
      ])

      const histoLieuIds = Array.from(
        new Set(
          histos
            .map((histo) => histo.Id_Lieu)
            .filter((value): value is number => typeof value === "number" && value > 0),
        ),
      )

      const missingHistoLieuIds = histoLieuIds.filter((id) => !lieuIds.includes(id))
      const extraLieux = missingHistoLieuIds.length
        ? await prisma.t_lieu.findMany({
            where: { Id_Lieu: { in: missingHistoLieuIds } },
            select: {
              Id_Lieu: true,
              Nom_Lieu: true,
              Sonde_Numero_Serie: true,
              t_site: { select: { Libelle_Site: true } },
            },
          })
        : []

      const lieuMap = new Map([...lieux, ...extraLieux].map((lieu) => [lieu.Id_Lieu, lieu]))
      const histoMap = new Map<number, (typeof histos)[number]>()
      for (const histo of histos) {
        if (!histoMap.has(histo.Id_Alarme)) {
          histoMap.set(histo.Id_Alarme, histo)
        }
      }

      const normalizedData = rawRows.map((row) => {
        const alarmId = extractAlarmId(row.Commentaire)
        const histo = alarmId ? histoMap.get(alarmId) : undefined
        const resolvedLieuId = row.Id_Lieu ?? histo?.Id_Lieu ?? null
        const lieu = resolvedLieuId ? lieuMap.get(resolvedLieuId) : undefined
        const value = formatAlarmValue(histo?.Valeur, histo?.Unite)

        const endDate = row.Date_Heure_Journal ?? histo?.Date_Heure_Acquittement ?? histo?.Date_Heure_Fin ?? null
        const startDate = histo?.Date_Heure_Debut ?? null
        const durationMs = startDate && endDate ? Math.max(endDate.getTime() - startDate.getTime(), 0) : null

        return {
          id: String(row.Id_Journal),
          alarmId,
          acknowledgedAt:
            serializeDbDateTime(row.Date_Heure_Journal) ||
            serializeDbDateTime(histo?.Date_Heure_Acquittement) ||
            null,
          acknowledgedBy: row.Nom_Utilisateur?.trim() || "-",
          comment: row.Commentaire_Utilisateur?.trim() || null,
          siteName: lieu?.t_site?.Libelle_Site?.trim() || null,
          locationName: lieu?.Nom_Lieu?.trim() || null,
          sensorSerial: histo?.Sonde_Numero_Serie?.trim() || lieu?.Sonde_Numero_Serie?.trim() || null,
          durationMs,
          alarmType: normalizeAlarmType(histo?.Type),
          alarmValue: value,
          triggeredAt: serializeDbDateTime(histo?.Date_Heure_Debut) || null,
          endedAt: serializeDbDateTime(histo?.Date_Heure_Fin) || null,
        }
      })
      const filteredData = type
        ? normalizedData.filter((item) => item.alarmType === type)
        : normalizedData
      const total = type ? filteredData.length : totalWithoutType
      const pages = Math.max(Math.ceil(total / limit), 1)
      const data = type ? filteredData.slice(skip, skip + limit) : filteredData

      const lieuxOptions = lieuOptionsRows.map((lieu) => ({ id: lieu.Id_Lieu, name: lieu.Nom_Lieu || `Lieu ${lieu.Id_Lieu}` }))

      return apiOk({
        data,
        filters: { lieux: lieuxOptions },
        pagination: { page, limit, total, pages },
      })
    } catch (error) {
      log.error("alarmes/acquittements", "alarm_ack_history_fetch_failed", { error })
      return apiError(
        500,
        "alarm_ack_history_fetch_failed",
        "Erreur lors du chargement de l'historique d'acquittement",
      )
    }
  },
)
