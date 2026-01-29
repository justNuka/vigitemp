import { NextRequest } from "next/server"

import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma, prismaMesure } from "@/lib/prisma"

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

    const where: any = { Est_Archive: false }

    const assignedSites = await prisma.t_liaison_utilisateur_site.findMany({
      where: { Id_Utilisateur: ctx.user.userId },
      select: { Id_Site: true },
    })
    const assignedGroups = await prisma.t_liaison_utilisateur_groupe.findMany({
      where: { Id_Utilisateur: ctx.user.userId },
      select: { Id_Groupe: true },
    })

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
        return apiOk({ total: 0, page, limit, totalPages: 0, sensors: [] })
      }
      where.Id_Site = { in: allowedSiteIds }
    }

    if (groupIds.length > 0) {
      const allowedGroupIds = hasAssignedGroups
        ? groupIds.filter((id) => assignedGroupIds.includes(id))
        : groupIds
      if (allowedGroupIds.length === 0) {
        return apiOk({ total: 0, page, limit, totalPages: 0, sensors: [] })
      }
      where.OR = [
        { t_lieu_groupe: { some: { Id_Groupe: { in: allowedGroupIds } } } },
        { Id_Groupe1: { in: allowedGroupIds } },
        { Id_Groupe2: { in: allowedGroupIds } },
      ]
    }

    if (!hasFilters && (hasAssignedSites || hasAssignedGroups)) {
      const accessOr: any[] = []
      if (hasAssignedSites) {
        accessOr.push({ Id_Site: { in: assignedSiteIds } })
      }
      if (hasAssignedGroups) {
        accessOr.push({
          OR: [
            { t_lieu_groupe: { some: { Id_Groupe: { in: assignedGroupIds } } } },
            { Id_Groupe1: { in: assignedGroupIds } },
            { Id_Groupe2: { in: assignedGroupIds } },
          ],
        })
      }
      if (accessOr.length > 0) {
        where.OR = accessOr
      }
    }

    await prisma.t_lieu.updateMany({
      where: {
        Est_Archive: false,
        Notification_Active: false,
        Date_Heure_Reactivation_Alarme: { lt: new Date() },
      },
      data: {
        Notification_Active: true,
        Date_Heure_Reactivation_Alarme: null,
      },
    })

    const total = await prisma.t_lieu.count({ where })

    const locations = await prisma.t_lieu.findMany({
      where,
      include: {
        t_sonde: true,
        t_site: true,
        t_groupe1: true,
        t_groupe2: true,
        t_lieu_groupe: { include: { t_groupe: true } },
      },
      skip,
      take: limit,
      // PrioritÃÂ© aux alarmes / prÃÂ©-alarmes pour charger lÃ¢ÂÂUI rapidement.
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
            Id_Lieu: true,
            Type: true,
            Date_Heure_Debut: true,
          },
          orderBy: { Date_Heure_Debut: "desc" },
        })
      : []

    const alarmTypeByLieu = new Map<number, "H" | "B" | "N">()
    for (const alarm of activeAlarms) {
      if (!alarm.Id_Lieu) continue
      const type = alarm.Type as "H" | "B" | "N" | null
      if (!type) continue
      if (!alarmTypeByLieu.has(alarm.Id_Lieu)) {
        alarmTypeByLieu.set(alarm.Id_Lieu, type)
      }
    }

    const sensorsWithMeasurements = await Promise.all(
      locations.map(async (location) => {
        const groups = (location.t_lieu_groupe || [])
          .map((lg) => lg.t_groupe)
          .filter((g): g is NonNullable<typeof g> => !!g)

        const locationGroupIds = groups.map((g) => g.Id_Groupe)
        const groupNames = groups.map((g) => g.Nom_Groupe).filter((n): n is string => !!n)

        const lastMeasurement = await prismaMesure.tm_mesures.findFirst({
          where: { Id_Lieu: location.Id_Lieu },
          orderBy: { Date_Heure_Mesure: "desc" },
          select: { Valeur: true, Date_Heure_Mesure: true },
        })

        const alarmType = alarmTypeByLieu.get(location.Id_Lieu) ?? null
        const isCriticalByType = alarmType === "H" || alarmType === "B"
        const isTechnical = alarmType === "N"
        const isCritical = isCriticalByType || location.Est_Lieu_En_Alarme === 1
        const isWarning = !isCritical && !isTechnical && location.Est_Lieu_En_Pre_Alarme === 1
        const isEnded =
          !isCritical &&
          (location.Est_Lieu_Alarme_Terminee_Non_Acquittee === 1 ||
            location.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 === 1)

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

        return {
          id: location.Id_Lieu.toString(),
          name: location.Nom_Lieu,
          lieuType: location.Type_Lieu ?? null,
          alarmType,
          type: "temperature",
          unit: "ÃÂ°C",
          currentValue: lastMeasurement?.Valeur ?? null,
          minThreshold: location.Consigne_Inf ?? 0,
          maxThreshold: location.Consigne_Sup ?? 25,
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
            alarmDisabledUntil: location.Date_Heure_Reactivation_Alarme ?? null,
            lieuEtat: location.Lieu_Etat ?? null,
            surveillanceDisabled,
            lieuType: location.Type_Lieu ?? null,
            alarmDelayMinutes: location.Retard_Alarme_Changement_Consigne ?? null,
            siteId: location.Id_Site,
            groupIds: locationGroupIds,
            groupNames,
            groupId1: location.Id_Groupe1 ?? locationGroupIds[0] ?? null,
            groupId2: location.Id_Groupe2 ?? locationGroupIds[1] ?? null,
            site: location.t_site?.Libelle_Site ?? "",
            groupName1: location.t_groupe1?.Nom_Groupe ?? null,
            groupName2: location.t_groupe2?.Nom_Groupe ?? null,
          },
        }
      }),
    )

    return apiOk({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      sensors: sensorsWithMeasurements,
    })
  } catch (error) {
    console.error("Erreur lors de la rÃÂ©cupÃÂ©ration des capteurs paginÃÂ©s:", error)
    return apiError(500, "internal_error", "Erreur lors du chargement des sondes")
  }
})
