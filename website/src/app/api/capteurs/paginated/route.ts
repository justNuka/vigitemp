import { NextRequest } from "next/server"

import { Prisma } from "../../../../generated/@prisma-db-mesures"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma, prismaMesure } from "@/lib/prisma"
import { log } from "@/lib/logger"

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
} as const

export const GET = withAuthLogging(async (request: NextRequest, ctx) => {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)))
    const siteIdsStr = searchParams.get("siteIds")
    const groupIdsStr = searchParams.get("groupIds")
    const siteIds = siteIdsStr?.split(",").map(Number).filter(Boolean) || []
    const groupIds = groupIdsStr?.split(",").map(Number).filter(Boolean) || []

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { Est_Archive: false }

    const [assignedSites, assignedGroups] = await Promise.all([
      prisma.t_liaison_utilisateur_site.findMany({
        where: { Id_Utilisateur: ctx.user.userId },
        select: { Id_Site: true },
      }),
      prisma.t_liaison_utilisateur_groupe.findMany({
        where: { Id_Utilisateur: ctx.user.userId },
        select: { Id_Groupe: true },
      }),
    ])

    const assignedSiteIds = assignedSites.map((site) => site.Id_Site).filter((id): id is number => !!id)
    const assignedGroupIds = assignedGroups
      .map((group) => group.Id_Groupe)
      .filter((id): id is number => !!id)

    const hasAssignedSites = assignedSiteIds.length > 0
    const hasAssignedGroups = assignedGroupIds.length > 0
    const hasFilters = siteIds.length > 0 || groupIds.length > 0

    if (siteIds.length > 0) {
      const allowedSiteIds = hasAssignedSites
        ? siteIds.filter((id) => assignedSiteIds.includes(id))
        : siteIds
      if (allowedSiteIds.length === 0) {
        return apiOk({ total: 0, page, limit, totalPages: 0, sensors: [] }, { headers: NO_STORE_HEADERS })
      }
      where.Id_Site = { in: allowedSiteIds }
    }

    if (groupIds.length > 0) {
      const allowedGroupIds = hasAssignedGroups
        ? groupIds.filter((id) => assignedGroupIds.includes(id))
        : groupIds
      if (allowedGroupIds.length === 0) {
        return apiOk({ total: 0, page, limit, totalPages: 0, sensors: [] }, { headers: NO_STORE_HEADERS })
      }
      where.OR = [
        { t_lieu_groupe: { some: { Id_Groupe: { in: allowedGroupIds } } } },
      ]
    }

    if (!hasFilters && (hasAssignedSites || hasAssignedGroups)) {
      const accessOr: Record<string, unknown>[] = []
      if (hasAssignedSites) {
        accessOr.push({ Id_Site: { in: assignedSiteIds } })
      }
      if (hasAssignedGroups) {
        accessOr.push({
          OR: [
            { t_lieu_groupe: { some: { Id_Groupe: { in: assignedGroupIds } } } },
          ],
        })
      }
      if (accessOr.length > 0) {
        where.OR = accessOr
      }
    }

    const total = await prisma.t_lieu.count({ where })

    const locations = await prisma.t_lieu.findMany({
      where,
      include: {
        t_sonde: { select: { Est_Sonde_GSO: true } },
        t_site: { select: { Libelle_Site: true } },
        t_lieu_groupe: { include: { t_groupe: { select: { Id_Groupe: true, Nom_Groupe: true } } } },
      },
      skip,
      take: limit,
      // Priorité aux alarmes / pré-alarmes pour charger l’UI rapidement.
      orderBy: [
        { Est_Lieu_En_Alarme: "desc" },
        { Est_Lieu_En_Pre_Alarme: "desc" },
        { Derniere_Date_Heure: "desc" },
        { Id_Lieu: "desc" },
      ],
    })

    const locationIds = locations.map((location) => location.Id_Lieu).filter(Boolean)
    const activeAlarms = locationIds.length
      ? await prisma.t_alarme.findMany({
          where: {
            Id_Lieu: { in: locationIds },
            Date_Heure_Fin: null,
            Est_Acquittee: false,
          },
          select: {
            Id_Alarme: true,
            Id_Lieu: true,
            Type: true,
            Date_Heure_Debut: true,
          },
          orderBy: { Date_Heure_Debut: "desc" },
        })
      : []

    const endedAlarms = locationIds.length
      ? await prisma.t_alarme.findMany({
          where: {
            Id_Lieu: { in: locationIds },
            Est_Acquittee: false,
            Date_Heure_Fin: { not: null },
          },
          select: {
            Id_Alarme: true,
            Id_Lieu: true,
            Date_Heure_Fin: true,
          },
          orderBy: { Date_Heure_Fin: "desc" },
        })
      : []

    const alarmTypeByLieu = new Map<number, "H" | "B" | "N" | "S">()
    const alarmIdByLieu = new Map<number, number>()
    for (const alarm of activeAlarms) {
      if (!alarm.Id_Lieu) continue
      const type = alarm.Type as "H" | "B" | "N" | "S" | null
      if (!type) continue
      if (!alarmTypeByLieu.has(alarm.Id_Lieu)) {
        alarmTypeByLieu.set(alarm.Id_Lieu, type)
      }
      if (!alarmIdByLieu.has(alarm.Id_Lieu)) {
        alarmIdByLieu.set(alarm.Id_Lieu, alarm.Id_Alarme)
      }
    }

    const endedAlarmByLieu = new Set<number>()
    for (const alarm of endedAlarms) {
      if (!alarm.Id_Lieu) continue
      if (!endedAlarmByLieu.has(alarm.Id_Lieu)) {
        endedAlarmByLieu.add(alarm.Id_Lieu)
      }
      if (!alarmIdByLieu.has(alarm.Id_Lieu)) {
        alarmIdByLieu.set(alarm.Id_Lieu, alarm.Id_Alarme)
      }
    }

    type LastMeasurementRow = {
      Id_Lieu: number
      Valeur: number | null
      Date_Heure_Mesure: Date | null
    }

    const lastMeasurementRows =
      locationIds.length > 0
        ? await prismaMesure.$queryRaw<LastMeasurementRow[]>`
            SELECT m1.Id_Lieu, m1.Valeur, m1.Date_Heure_Mesure
            FROM tm_mesures m1
            INNER JOIN (
              SELECT Id_Lieu, MAX(Date_Heure_Mesure) AS max_time
              FROM tm_mesures
              WHERE Id_Lieu IN (${Prisma.join(locationIds)})
              GROUP BY Id_Lieu
            ) m2 ON m1.Id_Lieu = m2.Id_Lieu AND m1.Date_Heure_Mesure = m2.max_time
          `
        : []

    const lastMeasurementByLieu = new Map(
      lastMeasurementRows.map((row) => [row.Id_Lieu, row]),
    )

    const disabledLocationIds = locations
      .filter((location) => location.Lieu_Etat === "D")
      .map((location) => location.Id_Lieu)

    const disabledAuditRows = disabledLocationIds.length
      ? await prismaMesure.tm_journal.findMany({
          where: {
            Id_Lieu: { in: disabledLocationIds },
            Code_Journal: "DES",
          },
          select: {
            Id_Lieu: true,
            Nom_Utilisateur: true,
            Commentaire_Utilisateur: true,
            Date_Heure_Journal: true,
          },
          orderBy: [{ Date_Heure_Journal: "desc" }, { Id_Journal: "desc" }],
        })
      : []

    const disabledAuditByLieu = new Map<number, {
      disabledBy: string | null
      disabledComment: string | null
      disabledAt: Date | null
    }>()

    for (const auditRow of disabledAuditRows) {
      if (!auditRow.Id_Lieu || disabledAuditByLieu.has(auditRow.Id_Lieu)) continue
      disabledAuditByLieu.set(auditRow.Id_Lieu, {
        disabledBy: auditRow.Nom_Utilisateur?.trim() || null,
        disabledComment: auditRow.Commentaire_Utilisateur?.trim() || null,
        disabledAt: auditRow.Date_Heure_Journal ?? null,
      })
    }

    const sensorsWithMeasurements = locations.map((location) => {
        const groups = (location.t_lieu_groupe || [])
          .map((lg) => lg.t_groupe)
          .filter((g): g is NonNullable<typeof g> => !!g)

        const locationGroupIds = groups.map((g) => g.Id_Groupe)
        const groupNames = groups.map((g) => g.Nom_Groupe).filter((n): n is string => !!n)

        const lastMeasurement = lastMeasurementByLieu.get(location.Id_Lieu) ?? null
        const disabledAudit = disabledAuditByLieu.get(location.Id_Lieu) ?? null

        const hasEndedFlag =
          location.Est_Lieu_Alarme_Terminee_Non_Acquittee === 1 ||
          location.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 === 1 ||
          endedAlarmByLieu.has(location.Id_Lieu)

        const alarmType =
          alarmTypeByLieu.get(location.Id_Lieu) ?? (hasEndedFlag ? ("T" as const) : null)
        const alarmId = alarmIdByLieu.get(location.Id_Lieu) ?? null
        const isCriticalByType = alarmType === "H" || alarmType === "B"
        const isTechnical = alarmType === "N" || alarmType === "S"
        const isCritical = isCriticalByType || location.Est_Lieu_En_Alarme === 1
        const isEnded = !isCritical && !isTechnical && hasEndedFlag
        const isWarning = !isCritical && !isTechnical && !isEnded && location.Est_Lieu_En_Pre_Alarme === 1

        const status: "ok" | "warning" | "critical" | "technical" | "ended" = isTechnical
          ? "technical"
          : isCritical
            ? "critical"
            : isWarning
              ? "warning"
              : isEnded
                ? "ended"
                : "ok"

        const alarmDisabled = location.Notification_Active === false
        const surveillanceDisabled = location.Lieu_Etat === "D"
        const isGso = location.t_sonde?.Est_Sonde_GSO ?? location.Est_Lieu_GSO ?? false
        const rawUnit = location.Derniere_Unite?.trim() || "°C"
        const unit = rawUnit.toUpperCase() === "C" ? "°C" : rawUnit
        const decimals = location.Derniere_Nb_Decimal ?? null
        const minThreshold =
          location.Est_Consigne_Inf_Active === false
            ? null
            : location.Tolerance_Surveillance_Inf ?? location.Consigne_Inf ?? null
        const maxThreshold =
          location.Est_Consigne_Sup_Active === false
            ? null
            : location.Tolerance_Surveillance_Sup ?? location.Consigne_Sup ?? null

          const alarmDelayMinutes =
            location.Retard_Alarme_Haut ??
            location.Retard_Alarme_Bas ??
            location.Retard_Alarme_Changement_Consigne ??
            null

          return {
            id: location.Id_Lieu.toString(),
            name: location.Nom_Lieu,
            lieuType: location.Type_Lieu ?? null,
            alarmId,
            alarmType,
          type: "temperature",
          unit,
          decimals,
          currentValue: lastMeasurement?.Valeur ?? null,
          minThreshold,
          maxThreshold,
          lastMeasurement: lastMeasurement?.Date_Heure_Mesure ?? null,
          isActive: !location.Est_Archive,
          status,
          location: {
            id: location.Id_Lieu.toString(),
            name: location.Nom_Lieu,
            description: null,
            siteGroup: null,
            isActive: !location.Est_Archive,
            alarmDisabled,
            estSonAlarmeActive: location.Est_Son_Alarme_Active ?? true,
            alarmDisabledUntil: location.Date_Heure_Reactivation_Alarme ?? null,
            lieuEtat: location.Lieu_Etat ?? null,
            surveillanceDisabled,
            surveillanceDisabledSince: location.Date_Heure_Surveillance_Off ?? disabledAudit?.disabledAt ?? null,
            surveillanceDisabledBy: disabledAudit?.disabledBy ?? null,
            surveillanceDisabledComment: disabledAudit?.disabledComment ?? null,
            lieuType: location.Type_Lieu ?? null,
            alarmId,
            alarmDelayMinutes,
            alarmDelayHighMinutes: location.Retard_Alarme_Haut ?? null,
            alarmDelayLowMinutes: location.Retard_Alarme_Bas ?? null,
            noResponseDelayMinutes: location.Retard_Non_Reponse ?? null,
            consigneSupPreAlarme: location.Consigne_Sup_Pre_Alarme ?? null,
            estConsigneSupPreAlarmeActive: location.Est_Consigne_Sup_Pre_Alarme_Active ?? false,
            consigneInfPreAlarme: location.Consigne_Inf_Pre_Alarme ?? null,
            estConsigneInfPreAlarmeActive: location.Est_Consigne_Inf_Pre_Alarme_Active ?? false,
            comment: location.Commentaire ?? null,
            sondeNumeroSerie: location.Sonde_Numero_Serie ?? null,
            isGso: isGso ?? null,
            gsoRssi: location.Derniere_Val_Rssi ?? null,
            batteryPercent: location.Derniere_Val_Batterie ?? null,
            gsoTension: location.Derniere_Val_Tension ?? null,
            siteId: location.Id_Site,
            groupIds: locationGroupIds,
            groupNames,
            groupId1: locationGroupIds[0] ?? null,
            groupId2: locationGroupIds[1] ?? null,
            site: location.t_site?.Libelle_Site ?? "",
            groupName1: groups[0]?.Nom_Groupe ?? null,
            groupName2: groups[1]?.Nom_Groupe ?? null,
          },
        }
      })

    return apiOk({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      sensors: sensorsWithMeasurements,
    }, { headers: NO_STORE_HEADERS })
  } catch (error) {
    log.error("capteurs/paginated", "paginated_sensors_fetch_error", { error: error });
    return apiError(500, "internal_error", "Erreur lors du chargement des sondes")
  }
})


