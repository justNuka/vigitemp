import { NextRequest } from "next/server"
import { prisma, prismaMesure } from "@/lib/prisma"
import { withAuthLogging } from "@/lib/api-wrappers"
import { getCachedMeasurements, setCachedMeasurements } from "@/lib/measurement-cache"
import { apiError, apiOk } from "@/lib/api-response"

export const GET = withAuthLogging(
  async (req: NextRequest, _ctx: any, { params }: { params: Promise<{ idLieu: string }> }) => {
    try {
      const { idLieu } = await params
      const searchParams = req.nextUrl.searchParams
      const rowNumberParam = parseInt(searchParams.get("rowNumber") || "125")
      const rowNumber = Math.min(rowNumberParam, 125)
      const startDate = searchParams.get("startDate")
      const endDate = searchParams.get("endDate")
      const forceFresh = searchParams.get("fresh") === "true"
      const includeMeta = searchParams.get("includeMeta") === "true"

      const idLieuInt = parseInt(idLieu)
      if (isNaN(idLieuInt)) {
        return apiError(400, "invalid_id", "Invalid idLieu parameter")
      }

      if (!forceFresh && !startDate && !endDate && !includeMeta) {
        const cached = getCachedMeasurements(idLieuInt)
        if (cached) {
          const response = apiOk(cached)
          response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=900")
          response.headers.set("X-Cache", "HIT")
          return response
        }
      }

      if (!forceFresh && !startDate && !endDate && includeMeta) {
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

      const [measurements, lieu] = await Promise.all([
        prismaMesure.tm_graphique.findMany({
          where: {
            ...whereClause,
            Est_Valeur_Null: false,
          },
          take: rowNumber,
          orderBy: { Date_Heure_Mesure: "desc" },
          select: {
            Id_Graphique: true,
            Date_Heure_Mesure: true,
            Valeur: true,
            Unite: true,
            Consigne: true,
            Consigne_Sup: true,
            Consigne_Inf: true,
            Sonde_Numero_Serie: true,
            Frequence: true,
            Est_Etat_Alarme: true,
          },
        }),
        prisma.t_lieu.findUnique({
          where: { Id_Lieu: idLieuInt },
          select: {
            Consigne: true,
            Consigne_Sup: true,
            Consigne_Inf: true,
            Consigne_Sup_Corrigee: true,
            Consigne_Inf_Corrigee: true,
            Type_Lieu: true,
          },
        }),
      ])

      const consigneSupLieu = lieu?.Consigne_Sup_Corrigee ?? lieu?.Consigne_Sup ?? null
      const consigneInfLieu = lieu?.Consigne_Inf_Corrigee ?? lieu?.Consigne_Inf ?? null
      const consigneLieu = lieu?.Consigne ?? null

      const chronologicalMeasurements = measurements.reverse()

      const formattedMeasurements = chronologicalMeasurements.map((m: any) => {
        const dateHeure = m.Date_Heure_Mesure ? new Date(m.Date_Heure_Mesure) : new Date()

        const dateDisplay = dateHeure.toLocaleString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
        })

        const dateXaxis = dateHeure.toLocaleString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
        })

        return {
          id: m.Id_Graphique?.toString() || "",
          Valeur: m.Valeur !== null ? parseFloat(m.Valeur.toString()) : 0,
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
          Etat_Alarme: m.Est_Etat_Alarme || 0,
        }
      })

      if (!startDate && !endDate) {
        setCachedMeasurements(idLieuInt, formattedMeasurements)
      }

      const response = apiOk(
        includeMeta
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
