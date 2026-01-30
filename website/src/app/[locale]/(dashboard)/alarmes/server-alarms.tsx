"use cache";

import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

type AlarmStatus = "active" | "acknowledged" | "resolved";

/**
 * Composant serveur pour charger les alarmes depuis la base de données
 * Utilise le cache Next.js 16 pour optimiser les performances
 */
export async function ServerAlarms(status?: AlarmStatus) {
  "use cache";
  cacheTag("alarms-data");

  const where: any = {};

  if (status === "active") {
    where.Acquite = false;
  } else if (status === "acknowledged") {
    where.Acquite = true;
  } else if (status === "resolved") {
    // Pour l'instant, pas d'alarmes résolues - tout est basé sur Acquite
    where.Acquite = null; // Aucune alarme ne correspondra
  }

  const alarms = await prisma.t_alarme.findMany({
    where,
    include: {
      t_lieu: {
        select: {
          Id_Lieu: true,
          Nom_Lieu: true,
        },
      },
    },
    orderBy: { Date_Heure_Debut: "desc" },
    take: 100,
  });

  // Transform to API format (AlarmWithDetails)
  const formatted = alarms.map((alarm) => ({
    id: alarm.Id_Alarme.toString(),
    sensorId: alarm.Id_Lieu?.toString() || "0",
    locationId: alarm.Id_Lieu?.toString() || "0",
    type: (alarm.Type === "H"
      ? "high"
      : alarm.Type === "B"
        ? "low"
        : alarm.Type === "T"
          ? "ended"
          : "no-response") as "high" | "low" | "no-response" | "ended",
    value: alarm.Valeur || 0,
    threshold: 0, // Threshold from t_lieu if needed
    status: alarm.Est_Acquittee ? ("acknowledged" as const) : ("active" as const),
    triggeredAt: alarm.Date_Heure_Debut || new Date(),
    acknowledgedAt: alarm.Est_Acquittee ? alarm.Date_Heure_Debut : null,
    resolvedAt: alarm.Date_Heure_Fin || null,
    acknowledgedBy: null,
    comment: null,
    sensor: {
      id: alarm.Id_Lieu?.toString() || "0",
      name: alarm.t_lieu?.Nom_Lieu || "Unknown",
      type: "temperature",
      unit: alarm.Unite || "°C",
      locationId: alarm.Id_Lieu?.toString() || "0",
      currentValue: alarm.Valeur || null,
      minThreshold: 0,
      maxThreshold: 30,
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
  }));

  return formatted;
}

/**
 * Composant serveur pour obtenir les statistiques d'alarmes
 */
export async function ServerAlarmStats() {
  "use cache";
  cacheTag("alarms-stats");

  const [activeCount, acknowledgedCount, resolvedCount] = await Promise.all([
    prisma.t_alarme.count({
      where: { Est_Acquittee: false },
    }),
    prisma.t_alarme.count({
      where: { Est_Acquittee: true },
    }),
    prisma.t_alarme.count({
      where: { Est_Acquittee: null }, // Pour l'instant, pas d'alarmes résolues
    }),
  ]);

  return {
    active: activeCount,
    acknowledged: acknowledgedCount,
    resolved: resolvedCount,
    total: activeCount + acknowledgedCount + resolvedCount,
  };
}
