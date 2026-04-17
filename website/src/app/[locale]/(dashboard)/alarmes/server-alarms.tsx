import { applyAccessFilter, buildAlarmAccessFilter, getUserLocationScope } from "@/lib/location-access-scope"
import { getServerAuthenticatedUserId } from "@/lib/server-auth"
import { unstable_noStore } from "next/cache"
import { getTranslations } from "next-intl/server"

type AlarmStatus = "active" | "acknowledged" | "resolved"

export async function ServerAlarms(status?: AlarmStatus) {
  unstable_noStore()
  const t = await getTranslations("alarmsPage")
  const { prisma } = await import("@/lib/prisma")

  const userId = await getServerAuthenticatedUserId()
  if (!userId) return []

  const where: Record<string, unknown> = {}

  if (status === "active") {
    where.Est_Acquittee = false
    where.Date_Heure_Fin = null
  } else if (status === "acknowledged") {
    where.Est_Acquittee = true
  } else if (status === "resolved") {
    where.Est_Acquittee = false
    where.Date_Heure_Fin = { not: null }
  }

  const scope = await getUserLocationScope(userId)
  const alarmAccessFilter = buildAlarmAccessFilter(scope)

  const alarms = await prisma.t_alarme.findMany({
    where: applyAccessFilter(where, alarmAccessFilter),
    include: {
      t_lieu: {
        select: {
          Id_Lieu: true,
          Sonde_Numero_Serie: true,
          Nom_Lieu: true,
          Derniere_Valeur: true,
          Derniere_Unite: true,
          Consigne_Sup: true,
          Consigne_Inf: true,
          Tolerance_Surveillance_Sup: true,
          Tolerance_Surveillance_Inf: true,
        },
      },
    },
    orderBy: { Date_Heure_Debut: "desc" },
    take: 100,
  })

  return alarms.map((alarm) => {
    const hasConfiguredThresholds =
      alarm.t_lieu?.Consigne_Sup !== null || alarm.t_lieu?.Consigne_Inf !== null

    const consigneSup = hasConfiguredThresholds
      ? alarm.t_lieu?.Tolerance_Surveillance_Sup ?? alarm.t_lieu?.Consigne_Sup ?? null
      : null
    const consigneInf = hasConfiguredThresholds
      ? alarm.t_lieu?.Tolerance_Surveillance_Inf ?? alarm.t_lieu?.Consigne_Inf ?? null
      : null

    const statusValue = alarm.Est_Acquittee
      ? ("acknowledged" as const)
      : alarm.Date_Heure_Fin
        ? ("resolved" as const)
        : ("active" as const)

    const alarmType = (
      alarm.Type === "H"
        ? "high"
        : alarm.Type === "B"
          ? "low"
          : alarm.Type === "N"
            ? "no-response"
            : "sector"
    ) as "high" | "low" | "no-response" | "sector"

    const thresholdValue =
      alarmType === "high" ? (consigneSup ?? 0) : alarmType === "low" ? (consigneInf ?? 0) : 0

    const rawUnit = alarm.Unite?.trim() || t("fallback.unknown_unit")
    const unit = rawUnit.toUpperCase() === "C" ? "°C" : rawUnit

    return {
      id: alarm.Id_Alarme.toString(),
      sensorId: alarm.Id_Lieu?.toString() || "0",
      locationId: alarm.Id_Lieu?.toString() || "0",
      type: alarmType,
      value: alarm.Type === "N" || alarm.Type === "S" ? null : (alarm.Valeur ?? null),
      threshold: thresholdValue,
      status: statusValue,
      triggeredAt: alarm.Date_Heure_Debut!,
      acknowledgedAt: alarm.Est_Acquittee ? alarm.Date_Heure_Debut : null,
      resolvedAt: alarm.Date_Heure_Fin || null,
      acknowledgedBy: null,
      comment: null,
      sensor: {
        id: alarm.Id_Lieu?.toString() || "0",
        name: alarm.t_lieu?.Sonde_Numero_Serie || t("fallback.unknown_name"),
        type: "temperature",
        unit,
        locationId: alarm.Id_Lieu?.toString() || "0",
        currentValue: alarm.t_lieu?.Derniere_Valeur ?? alarm.Valeur ?? null,
        minThreshold: consigneInf,
        maxThreshold: consigneSup,
        hasThresholds: hasConfiguredThresholds,
        measurementFrequency: 60,
        alarmDelay: 0,
        lastMeasurement: alarm.Date_Heure_Derniere_Mesure || null,
        isActive: true,
      },
      location: {
        id: alarm.Id_Lieu?.toString() || "0",
        name: alarm.t_lieu?.Nom_Lieu || alarm.t_lieu?.Sonde_Numero_Serie || t("fallback.unknown_name"),
        description: null,
        siteGroup: null,
        isActive: true,
      },
    }
  })
}

export async function ServerAlarmStats() {
  unstable_noStore()
  const { prisma } = await import("@/lib/prisma")

  const userId = await getServerAuthenticatedUserId()
  if (!userId) {
    return { active: 0, acknowledged: 0, resolved: 0, total: 0 }
  }

  const scope = await getUserLocationScope(userId)
  const alarmAccessFilter = buildAlarmAccessFilter(scope)

  const [activeCount, acknowledgedCount, resolvedCount] = await Promise.all([
    prisma.t_alarme.count({
      where: applyAccessFilter({ Est_Acquittee: false, Date_Heure_Fin: null }, alarmAccessFilter),
    }),
    prisma.t_alarme.count({
      where: applyAccessFilter({ Est_Acquittee: true }, alarmAccessFilter),
    }),
    prisma.t_alarme.count({
      where: applyAccessFilter({ Est_Acquittee: false, Date_Heure_Fin: { not: null } }, alarmAccessFilter),
    }),
  ])

  return {
    active: activeCount,
    acknowledged: acknowledgedCount,
    resolved: resolvedCount,
    total: activeCount + acknowledgedCount + resolvedCount,
  }
}
