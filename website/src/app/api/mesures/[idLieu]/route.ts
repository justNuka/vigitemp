import { NextRequest } from "next/server"
import { prisma, prismaMesure } from "@/lib/prisma"
import { withAuthLogging, type HandlerContext } from "@/lib/api-wrappers"
import { getCachedMeasurements, setCachedMeasurements } from "@/lib/measurement-cache"
import { apiError, apiOk } from "@/lib/api-response"
import { formatDbDateTime } from "@/lib/date-display"
import { getGlobalNonResponseDefault } from "@/lib/non-response-preference"
import { canUserAccessLieu } from "@/lib/location-access-scope"
import { log } from "@/lib/logger"

function normalizeDisplayUnit(unit: string | null | undefined): string {
  const normalized = unit?.trim()
  if (!normalized) return "°C"
  return normalized.toUpperCase() === "C" ? "°C" : normalized
}

export const GET = withAuthLogging(
  async (req: NextRequest, ctx: HandlerContext, { params }: { params: Promise<{ idLieu: string }> }) => {
    try {
      const { idLieu } = await params
      const searchParams = req.nextUrl.searchParams
      const rowNumberParam = parseInt(searchParams.get("rowNumber") || "125")
      const rowNumber = Math.min(rowNumberParam, 125)
      const pageParam = parseInt(searchParams.get("page") || "1")
      const pageSizeParam = parseInt(searchParams.get("pageSize") || "200")
      const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
      const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? Math.min(pageSizeParam, 200) : 200
      const startDate = searchParams.get("startDate")
      const endDate = searchParams.get("endDate")
      const sortByParam = searchParams.get("sortBy")
      const sortDirectionParam = searchParams.get("sortDirection")
      const forceFresh = searchParams.get("fresh") === "true"
      const includeMeta = searchParams.get("includeMeta") === "true"
      const source = searchParams.get("source") === "mesures" ? "mesures" : "graphique"
      const usePagination = source === "mesures" && (searchParams.has("page") || searchParams.has("pageSize"))
      const includeNullNonResponse = await getGlobalNonResponseDefault()
      const sortBy = sortByParam === "value" ? "value" : sortByParam === "date" ? "date" : null
      const sortDirection: "asc" | "desc" = sortDirectionParam === "asc" ? "asc" : "desc"

      const idLieuInt = parseInt(idLieu)
      if (isNaN(idLieuInt)) {
        return apiError(400, "invalid_id", "Invalid idLieu parameter")
      }

      const canAccessLieu = await canUserAccessLieu(ctx.user.userId, idLieuInt)
      if (!canAccessLieu) {
        return apiError(403, "forbidden", "Acces interdit")
      }

      const canUseCache = source === "graphique" && !includeNullNonResponse

      if (canUseCache && !forceFresh && !startDate && !endDate && !includeMeta) {
        const cached = getCachedMeasurements(idLieuInt)
        if (cached) {
          const response = apiOk(cached)
          response.headers.set("Cache-Control", "private, max-age=0, must-revalidate")
          response.headers.set("X-Cache", "HIT")
          return response
        }
      }

      if (canUseCache && !forceFresh && !startDate && !endDate && includeMeta) {
        const cached = getCachedMeasurements(idLieuInt)
        if (cached) {
          const lieuMeta = await prisma.t_lieu.findUnique({
            where: { Id_Lieu: idLieuInt },
            select: { Type_Lieu: true },
          })
          const response = apiOk({
            measurements: cached,
            lieuType: lieuMeta?.Type_Lieu ?? null,
            graphMeasureCount: cached.length,
          })
          response.headers.set("Cache-Control", "private, max-age=0, must-revalidate")
          response.headers.set("X-Cache", "HIT")
          return response
        }
      }

      const whereClause: Record<string, unknown> = {
        Id_Lieu: idLieuInt,
      }

      const mesureOrderBy =
        sortBy === "value"
          ? [{ Valeur: sortDirection }, { Date_Heure_Mesure: sortDirection }]
          : [{ Date_Heure_Mesure: sortBy === "date" ? sortDirection : "desc" }]

      if (startDate && endDate) {
        whereClause.Date_Heure_Mesure = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        }
      }

      const [primaryMeasurements, lieu, total] = await Promise.all([
        source === "mesures"
          ? prismaMesure.tm_mesures.findMany({
              where: {
                ...whereClause,
                ...(includeNullNonResponse ? {} : { Est_Valeur_Null: 0 }),
              },
              take: usePagination ? pageSize : rowNumber,
              skip: usePagination ? (page - 1) * pageSize : 0,
              orderBy: mesureOrderBy,
              select: {
                Id_Mesure: true,
                Date_Heure_Mesure: true,
                Valeur: true,
                Nb_Decimal: true,
                Unite: true,
                Consigne: true,
                Consigne_Sup: true,
                Consigne_Inf: true,
                Sonde_Numero_Serie: true,
                Frequence: true,
                Est_Etat_Alarme: true,
                Est_Valeur_Null: true,
              },
            })
          : prismaMesure.tm_graphique.findMany({
              where: {
                ...whereClause,
                ...(includeNullNonResponse ? {} : { Est_Valeur_Null: false }),
              },
              take: rowNumber,
              orderBy: { Date_Heure_Mesure: "desc" },
              select: {
                Id_Graphique: true,
                Date_Heure_Mesure: true,
                Valeur: true,
                Nb_Decimal: true,
                Unite: true,
                Consigne: true,
                Consigne_Sup: true,
                Consigne_Inf: true,
                Sonde_Numero_Serie: true,
                Frequence: true,
                Est_Etat_Alarme: true,
                Est_Valeur_Null: true,
              },
            }),
        prisma.t_lieu.findUnique({
          where: { Id_Lieu: idLieuInt },
          select: {
            Consigne: true,
            Consigne_Sup: true,
            Consigne_Inf: true,
            Tolerance_Surveillance_Sup: true,
            Tolerance_Surveillance_Inf: true,
            Derniere_Nb_Decimal: true,
            Type_Lieu: true,
            Derniere_Unite: true,
            Sonde_Numero_Serie: true,
            Est_Consigne_Sup_Active: true,
            Est_Consigne_Inf_Active: true,
          },
        }),
        usePagination
          ? prismaMesure.tm_mesures.count({
              where: {
                ...whereClause,
                ...(includeNullNonResponse ? {} : { Est_Valeur_Null: 0 }),
              },
            })
          : Promise.resolve(0),
      ])

      const measurements = primaryMeasurements

      const calibration = lieu?.Sonde_Numero_Serie
        ? await prisma.t_etalonnage.findFirst({
            where: {
              Sonde_Numero_Serie: lieu.Sonde_Numero_Serie,
              Unite: { not: null },
            },
            orderBy: [
              { Date_Heure_Etalonnage: "desc" },
              { Id_Etalonnage: "desc" },
            ],
            select: { Unite: true },
          })
        : null

            const consigneSupLieu =
        lieu?.Est_Consigne_Sup_Active === false
          ? null
          : lieu?.Tolerance_Surveillance_Sup ?? lieu?.Consigne_Sup ?? null
      const consigneInfLieu =
        lieu?.Est_Consigne_Inf_Active === false
          ? null
          : lieu?.Tolerance_Surveillance_Inf ?? lieu?.Consigne_Inf ?? null
      const consigneLieu = lieu?.Consigne ?? null
      const decimalsLieu = lieu?.Derniere_Nb_Decimal ?? null

      const shouldReverseMeasurements = source === "graphique" || sortBy === null
      const chronologicalMeasurements = shouldReverseMeasurements ? measurements.reverse() : measurements

      const formattedMeasurements = chronologicalMeasurements.map((m) => {
        const dateHeure = m.Date_Heure_Mesure ? new Date(m.Date_Heure_Mesure) : new Date()
        const isNullMeasurement =
          typeof m.Est_Valeur_Null === "number" ? m.Est_Valeur_Null !== 0 : Boolean(m.Est_Valeur_Null)

        const dateDisplay = formatDbDateTime(dateHeure, { withSeconds: false })
        const dateXaxis = formatDbDateTime(dateHeure, { timeOnly: true, withSeconds: false })

        return {
          id: ("Id_Mesure" in m ? m.Id_Mesure : m.Id_Graphique)?.toString() || "",
          Valeur: isNullMeasurement || m.Valeur === null ? null : parseFloat(m.Valeur.toString()),
          Nb_Decimal:
            m.Nb_Decimal !== null && m.Nb_Decimal !== undefined
              ? Number(m.Nb_Decimal)
              : decimalsLieu !== null
                ? Number(decimalsLieu)
                : null,
          Unite: normalizeDisplayUnit(calibration?.Unite ?? lieu?.Derniere_Unite ?? m.Unite),
          DateHeureMesure: dateDisplay,
          DateHeureMesureIso: dateHeure.toISOString(),
          DateHeureMesureXaxis: dateXaxis,
          Consigne:
            m.Consigne !== null
              ? parseFloat(m.Consigne.toString())
              : consigneLieu !== null
                ? parseFloat(consigneLieu.toString())
                : null,
          Consigne_Sup:
            m.Consigne_Sup !== null
              ? parseFloat(m.Consigne_Sup.toString())
              : consigneSupLieu !== null
                ? parseFloat(consigneSupLieu.toString())
                : null,
          Consigne_Inf:
            m.Consigne_Inf !== null
              ? parseFloat(m.Consigne_Inf.toString())
              : consigneInfLieu !== null
                ? parseFloat(consigneInfLieu.toString())
                : null,
          SondeNumeroSerie: m.Sonde_Numero_Serie || "",
          Frequence: m.Frequence || 15,
          Est_Valeur_Null: isNullMeasurement,
          Etat_Alarme:
            typeof m.Est_Etat_Alarme === "number"
              ? m.Est_Etat_Alarme
              : m.Est_Etat_Alarme
                ? 1
                : 0,
        }
      })

      if (canUseCache && !startDate && !endDate) {
        setCachedMeasurements(idLieuInt, formattedMeasurements)
      }

      const response = apiOk(
        usePagination
          ? { measurements: formattedMeasurements, total, page, pageSize }
          : includeMeta
            ? {
              measurements: formattedMeasurements,
              lieuType: lieu?.Type_Lieu ?? null,
              graphMeasureCount: source === "graphique" ? formattedMeasurements.length : undefined,
            }
            : formattedMeasurements,
      )
      response.headers.set(
        "Cache-Control",
        forceFresh ? "no-store, no-cache, must-revalidate, proxy-revalidate" : "private, max-age=0, must-revalidate",
      )
      response.headers.set("X-Cache", "MISS")
      return response
    } catch (error) {
      log.error("mesures", "get_measurements_error", { error: error });
      return apiError(500, "measurements_fetch_failed", "Failed to fetch measurements")
    }
  },
)
