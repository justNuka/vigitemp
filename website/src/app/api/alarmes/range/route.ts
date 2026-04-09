import { NextRequest } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { getUserLocationScope, buildLieuAccessFilter } from "@/lib/location-access-scope"
import { log } from "@/lib/logger"

const querySchema = z.object({
  idLieu: z.coerce.number().int().positive(),
  startDate: z.string().datetime({ offset: true }),
  endDate: z.string().datetime({ offset: true }),
})

export const GET = withAuthLogging(async (req: NextRequest, ctx) => {
  try {
    const parsed = querySchema.safeParse({
      idLieu: req.nextUrl.searchParams.get("idLieu"),
      startDate: req.nextUrl.searchParams.get("startDate"),
      endDate: req.nextUrl.searchParams.get("endDate"),
    })

    if (!parsed.success) {
      return apiError(400, "validation_error", "Parametres invalides", {
        details: parsed.error.issues,
      })
    }

    const { idLieu, startDate, endDate } = parsed.data
    const from = new Date(startDate)
    const to = new Date(endDate)

    const scope = await getUserLocationScope(ctx.user.userId)
    const lieuAccessFilter = buildLieuAccessFilter(scope)

    if (lieuAccessFilter) {
      const lieu = await prisma.t_lieu.findFirst({
        where: { Id_Lieu: idLieu, ...lieuAccessFilter },
        select: { Id_Lieu: true },
      })
      if (!lieu) {
        return apiError(403, "access_denied", "Access denied to this location")
      }
    }

    const dateFilter = {
      Date_Heure_Debut: { lte: to },
      OR: [
        { Date_Heure_Fin: null },
        { Date_Heure_Fin: { gte: from } },
      ],
    }

    const impactAlarmFilter = {
      Est_Alarme_Vrai: true,
      Type: { in: ["H", "B"] },
      ...dateFilter,
    }

    const [activeAlarms, histoAlarms] = await Promise.all([
      prisma.t_alarme.findMany({
        where: {
          Id_Lieu: idLieu,
          ...impactAlarmFilter,
        },
        select: {
          Id_Alarme: true,
          Date_Heure_Debut: true,
          Date_Heure_Fin: true,
          Type: true,
        },
        orderBy: { Date_Heure_Debut: "asc" },
      }),
      prisma.t_alarme_histo.findMany({
        where: {
          Id_Lieu: idLieu,
          ...impactAlarmFilter,
        },
        select: {
          Id_Alarme: true,
          Date_Heure_Debut: true,
          Date_Heure_Fin: true,
          Type: true,
        },
        orderBy: { Date_Heure_Debut: "asc" },
      }),
    ])

    type AlarmRow = {
      Id_Alarme: number
      Date_Heure_Debut: Date | null
      Date_Heure_Fin: Date | null
      Type: string | null
    }

    const seen = new Set<number>()
    const merged: AlarmRow[] = []

    for (const a of [...activeAlarms, ...histoAlarms]) {
      if (!seen.has(a.Id_Alarme)) {
        seen.add(a.Id_Alarme)
        merged.push(a)
      }
    }

    merged.sort((a, b) => {
      const ta = a.Date_Heure_Debut?.getTime() ?? 0
      const tb = b.Date_Heure_Debut?.getTime() ?? 0
      return ta - tb
    })

    const alarms = merged.map((a) => ({
      Id_Alarme: a.Id_Alarme,
      Date_Heure_Debut: a.Date_Heure_Debut?.toISOString() ?? startDate,
      Date_Heure_Fin: a.Date_Heure_Fin?.toISOString() ?? null,
      Type: a.Type,
    }))

    return apiOk({ alarms })
  } catch (error) {
    log.error("alarmes_range", "get_alarms_range_error", { error })
    return apiError(500, "alarms_range_fetch_failed", "Failed to fetch alarms for range")
  }
})
