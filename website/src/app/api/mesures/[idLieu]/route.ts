import { NextRequest } from "next/server"
import { prisma, prismaMesure } from "@/lib/prisma"
import { withAuthLogging } from "@/lib/api-wrappers"
import { getCachedMeasurements, setCachedMeasurements } from "@/lib/measurement-cache"
import { apiError, apiOk } from "@/lib/api-response"
import { formatDbDateTime } from "@/lib/date-display"
import { resolveNonResponsePreference } from "@/lib/non-response-preference"

export const GET = withAuthLogging(
  async (req: NextRequest, _ctx: any, { params }: { params: Promise<{ idLieu: string }> }) => {
    try {
      const { idLieu } = await params
      const searchParams = req.nextUrl.searchParams
      const rowNumberParam = parseInt(searchParams.get("rowNumber") || "125")
      const rowNumber = Math.min(rowNumberParam, 125)
      const pageParam = parseInt(searchParams.get("page") || "1")
      const pageSizeParam = parseInt(searchParams.get("pageSize") || "20")
      const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1
      const pageSize = Number.isFinite(pageSizeParam) && pageSizeParam > 0 ? Math.min(pageSizeParam, 200) : 20
      const startDate = searchParams.get("startDate")
      const endDate = searchParams.get("endDate")
      const forceFresh = searchParams.get("fresh") === "true"
      const includeMeta = searchParams.get("includeMeta") === "true"
      const source = searchParams.get("source") === "mesures" ? "mesures" : "graphique"
      const usePagination = source === "mesures" && (searchParams.has("page") || searchParams.has("pageSize"))
      const includeNullNonResponse = await resolveNonResponsePreference(req)

      const idLieuInt = parseInt(idLieu)
      if (isNaN(idLieuInt)) {
        return apiError(400, "invalid_id", "Invalid idLieu parameter")
      }

      const canUseCache = source === "graphique" && !includeNullNonResponse

      if (canUseCache && !forceFresh && !startDate && !endDate && !includeMeta) {
        const cached = getCachedMeasurements(idLieuInt)
        if (cached) {
          const response = apiOk(cached)
          response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=900")
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
          })
          response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=900")
          response.headers.set("X-Cache", "HIT")
          return response
        }
      }

      const whereClause: any = {
        Id_Lieu: idLieuInt,
      }

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
              orderBy: { Date_Heure_Mesure: "desc" },
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

      const measurements =
        source === "graphique" && primaryMeasurements.length === 0
          ? await prismaMesure.tm_mesures.findMany({
              where: {
                ...whereClause,
                ...(includeNullNonResponse ? {} : { Est_Valeur_Null: 0 }),
              },
              take: rowNumber,
              orderBy: { Date_Heure_Mesure: "desc" },
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
          : primaryMeasurements

      const consigneSupLieu =
        lieu?.Tolerance_Surveillance_Sup ?? lieu?.Consigne_Sup ?? null
      const consigneInfLieu =
        lieu?.Tolerance_Surveillance_Inf ?? lieu?.Consigne_Inf ?? null
      const consigneLieu = lieu?.Consigne ?? null
      const decimalsLieu = lieu?.Derniere_Nb_Decimal ?? null

      const chronologicalMeasurements = measurements.reverse()

      const formattedMeasurements = chronologicalMeasurements.map((m: any) => {
        const dateHeure = m.Date_Heure_Mesure ? new Date(m.Date_Heure_Mesure) : new Date()
        const isNullMeasurement =
          typeof m.Est_Valeur_Null === "number" ? m.Est_Valeur_Null !== 0 : Boolean(m.Est_Valeur_Null)

        const dateDisplay = formatDbDateTime(dateHeure, { withSeconds: false })
        const dateXaxis = formatDbDateTime(dateHeure, { timeOnly: true, withSeconds: false })

        return {
          id: (m.Id_Mesure ?? m.Id_Graphique)?.toString() || "",
          Valeur: isNullMeasurement || m.Valeur === null ? null : parseFloat(m.Valeur.toString()),
          Nb_Decimal:
            m.Nb_Decimal !== null && m.Nb_Decimal !== undefined
              ? Number(m.Nb_Decimal)
              : decimalsLieu !== null
                ? Number(decimalsLieu)
                : null,
          Unite: m.Unite || "\u00B0C",
          DateHeureMesure: dateDisplay,
          DateHeureMesureIso: dateHeure.toISOString(),
          DateHeureMesureXaxis: dateXaxis,
          Consigne:
            consigneLieu !== null
              ? parseFloat(consigneLieu.toString())
              : m.Consigne !== null
                ? parseFloat(m.Consigne.toString())
                : null,
          Consigne_Sup:
            consigneSupLieu !== null
              ? parseFloat(consigneSupLieu.toString())
              : m.Consigne_Sup !== null
                ? parseFloat(m.Consigne_Sup.toString())
                : null,
          Consigne_Inf:
            consigneInfLieu !== null
              ? parseFloat(consigneInfLieu.toString())
              : m.Consigne_Inf !== null
                ? parseFloat(m.Consigne_Inf.toString())
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
            ? { measurements: formattedMeasurements, lieuType: lieu?.Type_Lieu ?? null }
            : formattedMeasurements,
      )
      response.headers.set("Cache-Control", "public, s-maxage=900, stale-while-revalidate=900")
      response.headers.set("X-Cache", "MISS")
      return response
    } catch (error) {
      console.error("Get measurements error:", error)
      return apiError(500, "measurements_fetch_failed", "Failed to fetch measurements")
    }
  },
)
