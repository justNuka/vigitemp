import { NextRequest } from "next/server"
import { prisma, prismaMesure } from "@/lib/prisma"
import { withAuthLogging, type HandlerContext } from "@/lib/api-wrappers"
import { getCachedMeasurements, setCachedMeasurements } from "@/lib/measurement-cache"
import { apiError, apiOk } from "@/lib/api-response"
import {
  formatDbDateTime,
  parseDbDateTime,
  serializeDbDateTime,
  serializeStoredDbDateTime,
} from "@/lib/date-display"
import { getGlobalNonResponseDefault } from "@/lib/non-response-preference"
import { canUserAccessLieu } from "@/lib/location-access-scope"
import { log } from "@/lib/logger"
import { normalizeMeasureNumber } from "@/lib/measurements"
import { downsampleMeasurementsForGraph } from "@/lib/measurement-downsampling"
import { resolveSensorDisplayUnit } from "@/lib/sensor-unit"

export const GET = withAuthLogging(
  async (req: NextRequest, ctx: HandlerContext, { params }: { params: Promise<{ idLieu: string }> }) => {
    try {
      const { idLieu } = await params
      const searchParams = req.nextUrl.searchParams
      const rowNumberParam = parseInt(searchParams.get("rowNumber") || "125")
      const pageParam = parseInt(searchParams.get("page") || "1")
      const pageSizeParam = parseInt(searchParams.get("pageSize") || "200")
      const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
      const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? Math.min(pageSizeParam, 1000) : 200
      const graphMaxPointsParam = parseInt(searchParams.get("graphMaxPoints") || "")
      const graphMaxPoints = Number.isFinite(graphMaxPointsParam)
        ? Math.min(Math.max(graphMaxPointsParam, 16), 1200)
        : null
      const startDate = searchParams.get("startDate")
      const endDate = searchParams.get("endDate")
      const sortByParam = searchParams.get("sortBy")
      const sortDirectionParam = searchParams.get("sortDirection")
      const forceFresh = searchParams.get("fresh") === "true"
      const includeMeta = searchParams.get("includeMeta") === "true"
      const source = searchParams.get("source") === "mesures" ? "mesures" : "graphique"
      const maxRowNumber = source === "mesures" ? 2000 : 500
      const rowNumber = Math.min(rowNumberParam, maxRowNumber)
      const usePagination = source === "mesures" && (searchParams.has("page") || searchParams.has("pageSize"))
      const useGraphDownsampling =
        source === "mesures" &&
        !usePagination &&
        graphMaxPoints !== null &&
        Boolean(startDate && endDate)
      const includeNullNonResponseParam = searchParams.get("includeNullNonResponse")
      const includeNullNonResponse =
        includeNullNonResponseParam === null
          ? await getGlobalNonResponseDefault()
          : includeNullNonResponseParam === "1" || includeNullNonResponseParam === "true"
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
        const parsedStartDate = parseDbDateTime(startDate)
        const parsedEndDate = parseDbDateTime(endDate)
        if (!parsedStartDate || !parsedEndDate) {
          return apiError(400, "invalid_date_range", "Invalid date range")
        }
        whereClause.Date_Heure_Mesure = {
          gte: parsedStartDate,
          lte: parsedEndDate,
        }
      }

      const [primaryMeasurements, lieu, total] = await Promise.all([
        source === "mesures"
          ? prismaMesure.tm_mesures.findMany({
              where: {
                ...whereClause,
                ...(includeNullNonResponse ? {} : { Est_Valeur_Null: 0 }),
              },
              take: useGraphDownsampling ? undefined : usePagination ? pageSize : rowNumber,
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
                Est_Valeur_Memoire: true,
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
            t_sonde: {
              select: {
                t_sonde_type: { select: { Unite: true } },
              },
            },
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

      const [adjustment, calibration] = lieu?.Sonde_Numero_Serie
        ? await Promise.all([
            prisma.t_ajustage.findFirst({
              where: {
                Sonde_Numero_Serie: lieu.Sonde_Numero_Serie,
                Unite: { not: null },
              },
              orderBy: [{ Date_Heure_Ajustage: "desc" }, { Id_Ajustage: "desc" }],
              select: { Unite: true },
            }),
            prisma.t_etalonnage.findFirst({
              where: {
                Sonde_Numero_Serie: lieu.Sonde_Numero_Serie,
                Unite: { not: null },
              },
              orderBy: [{ Date_Heure_Etalonnage: "desc" }, { Id_Etalonnage: "desc" }],
              select: { Unite: true },
            }),
          ])
        : [null, null]

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

      // Graph points are chronological. Paginated table rows keep the exact
      // server ordering so page boundaries remain stable and predictable.
      const shouldReverseMeasurements = source === "graphique" || (source === "mesures" && !usePagination && sortBy === null)
      const chronologicalMeasurements = shouldReverseMeasurements ? measurements.reverse() : measurements

      const formattedMeasurements = chronologicalMeasurements.map((m) => {
        const dateHeure =
          serializeStoredDbDateTime(m.Date_Heure_Mesure) ??
          serializeDbDateTime(new Date()) ??
          ""
        const isNullMeasurement =
          typeof m.Est_Valeur_Null === "number" ? m.Est_Valeur_Null !== 0 : Boolean(m.Est_Valeur_Null)
        const isMemoryMeasurement =
          "Est_Valeur_Memoire" in m
            ? typeof m.Est_Valeur_Memoire === "number"
              ? m.Est_Valeur_Memoire !== 0
              : Boolean(m.Est_Valeur_Memoire)
            : false

        const dateDisplay = formatDbDateTime(dateHeure, { format: "dateTime" })
        const dateXaxis = formatDbDateTime(dateHeure, { format: "time" })
        const resolvedDecimals =
          m.Nb_Decimal !== null && m.Nb_Decimal !== undefined
            ? Number(m.Nb_Decimal)
            : decimalsLieu !== null
              ? Number(decimalsLieu)
              : null

        return {
          id: ("Id_Mesure" in m ? m.Id_Mesure : m.Id_Graphique)?.toString() || "",
          Valeur:
            isNullMeasurement || m.Valeur === null
              ? null
              : normalizeMeasureNumber(parseFloat(m.Valeur.toString()), resolvedDecimals ?? 2),
          Nb_Decimal: resolvedDecimals,
          Unite: resolveSensorDisplayUnit({
            adjustmentUnit: adjustment?.Unite,
            sensorTypeUnit: lieu?.t_sonde?.t_sonde_type?.Unite,
            calibrationUnit: calibration?.Unite,
            locationUnit: lieu?.Derniere_Unite,
            measurementUnit: m.Unite,
          }),
          DateHeureMesure: dateDisplay,
          DateHeureMesureIso: dateHeure,
          DateHeureMesureXaxis: dateXaxis,
          Consigne:
            m.Consigne !== null
              ? normalizeMeasureNumber(parseFloat(m.Consigne.toString()), 2)
              : consigneLieu !== null
                ? normalizeMeasureNumber(parseFloat(consigneLieu.toString()), 2)
                : null,
          Consigne_Sup:
            m.Consigne_Sup !== null
              ? normalizeMeasureNumber(parseFloat(m.Consigne_Sup.toString()), 2)
              : consigneSupLieu !== null
                ? normalizeMeasureNumber(parseFloat(consigneSupLieu.toString()), 2)
                : null,
          Consigne_Inf:
            m.Consigne_Inf !== null
              ? normalizeMeasureNumber(parseFloat(m.Consigne_Inf.toString()), 2)
              : consigneInfLieu !== null
                ? normalizeMeasureNumber(parseFloat(consigneInfLieu.toString()), 2)
                : null,
          SondeNumeroSerie: m.Sonde_Numero_Serie || "",
          Frequence: m.Frequence || 15,
          Est_Valeur_Null: isNullMeasurement,
          Est_Valeur_Memoire: isMemoryMeasurement,
          Etat_Alarme:
            typeof m.Est_Etat_Alarme === "number"
              ? m.Est_Etat_Alarme
              : m.Est_Etat_Alarme
                ? 1
                : 0,
        }
      })

      const graphResult = useGraphDownsampling && graphMaxPoints !== null
        ? downsampleMeasurementsForGraph(formattedMeasurements, graphMaxPoints)
        : null
      const responseMeasurements = graphResult?.measurements ?? formattedMeasurements

      if (canUseCache && !startDate && !endDate) {
        setCachedMeasurements(idLieuInt, formattedMeasurements)
      }

      const response = apiOk(
        usePagination
          ? { measurements: formattedMeasurements, total, page, pageSize }
          : includeMeta || useGraphDownsampling
            ? {
              measurements: responseMeasurements,
              lieuType: lieu?.Type_Lieu ?? null,
              graphMeasureCount: responseMeasurements.length,
              graphSourceCount: graphResult?.sourceCount ?? responseMeasurements.length,
              graphSampled: graphResult?.sampled ?? false,
              graphRangeStart: startDate ?? null,
              graphRangeEnd: endDate ?? null,
            }
            : responseMeasurements,
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
