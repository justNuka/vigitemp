import { unstable_noStore } from "next/cache";

type AlarmStatus = "active" | "acknowledged" | "resolved";

/**
  * Composant serveur pour charger les alarmes depuis la base de donnees
 * Utilise le cache Next.js 16 pour optimiser les performances
 */
export async function ServerAlarms(status?: AlarmStatus) {
  unstable_noStore();
  const { prisma } = await import("@/lib/prisma");
  const where: any = {};

  if (status === "active") {
    where.Est_Acquittee = false;
    where.Date_Heure_Fin = null;
  } else if (status === "acknowledged") {
    where.Est_Acquittee = true;
  } else if (status === "resolved") {
    where.Est_Acquittee = false;
    where.Date_Heure_Fin = { not: null };
  }

  const alarms = await prisma.t_alarme.findMany({
    where,
    include: {
      t_lieu: {
        select: {
          Id_Lieu: true,
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
  });

  // Transform to API format (AlarmWithDetails)
  const formatted = alarms.map((alarm) => {
    const consigneSup =
      alarm.t_lieu?.Tolerance_Surveillance_Sup ?? alarm.t_lieu?.Consigne_Sup ?? null;
    const consigneInf =
      alarm.t_lieu?.Tolerance_Surveillance_Inf ?? alarm.t_lieu?.Consigne_Inf ?? null;

    const statusValue = alarm.Est_Acquittee
      ? ("acknowledged" as const)
      : alarm.Date_Heure_Fin
        ? ("resolved" as const)
        : ("active" as const);

    const alarmType = (alarm.Type === "H"
      ? "high"
      : alarm.Type === "B"
        ? "low"
          : "no-response") as "high" | "low" | "no-response";

    const thresholdValue =
      alarmType === "high"
        ? consigneSup ?? 0
        : alarmType === "low"
          ? consigneInf ?? 0
          : 0;

    const unit = alarm.Unite?.trim() || "Unite inconnue";

    return {
    id: alarm.Id_Alarme.toString(),
    sensorId: alarm.Id_Lieu?.toString() || "0",
    locationId: alarm.Id_Lieu?.toString() || "0",
    type: alarmType,
    value: alarm.Valeur || 0,
    threshold: thresholdValue,
    status: statusValue,
    triggeredAt: alarm.Date_Heure_Debut!,
    acknowledgedAt: alarm.Est_Acquittee ? alarm.Date_Heure_Debut : null,
    resolvedAt: alarm.Date_Heure_Fin || null,
    acknowledgedBy: null,
    comment: null,
    sensor: {
      id: alarm.Id_Lieu?.toString() || "0",
      name: alarm.t_lieu?.Nom_Lieu || "Unknown",
      type: "temperature",
      unit,
      locationId: alarm.Id_Lieu?.toString() || "0",
      currentValue: alarm.t_lieu?.Derniere_Valeur ?? alarm.Valeur ?? null,
      minThreshold: consigneInf ?? 0,
      maxThreshold: consigneSup ?? 0,
      measurementFrequency: 60,
      alarmDelay: 0,
      lastMeasurement: alarm.Date_Heure_Derniere_Mesure || null,
      isActive: true,
    },
    location: {
      id: alarm.Id_Lieu?.toString() || "0",
      name: alarm.t_lieu?.Nom_Lieu || "Unknown",
      description: null,
      siteGroup: null,
      isActive: true,
    },
    };
  });

  return formatted;
}

/**
 * Composant serveur pour obtenir les statistiques d'alarmes
 */
export async function ServerAlarmStats() {
  unstable_noStore();
  const { prisma } = await import("@/lib/prisma");
  const [activeCount, acknowledgedCount, resolvedCount] = await Promise.all([
    prisma.t_alarme.count({
      where: { Est_Acquittee: false, Date_Heure_Fin: null },
    }),
    prisma.t_alarme.count({
      where: { Est_Acquittee: true },
    }),
    prisma.t_alarme.count({
      where: { Est_Acquittee: false, Date_Heure_Fin: { not: null } },
    }),
  ]);

  return {
    active: activeCount,
    acknowledged: acknowledgedCount,
    resolved: resolvedCount,
    total: activeCount + acknowledgedCount + resolvedCount,
  };
}



