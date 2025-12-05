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
    where.DateHeureFin = null;
  } else if (status === "acknowledged") {
    where.Acquite = true;
    where.DateHeureFin = null;
  } else if (status === "resolved") {
    where.DateHeureFin = { not: null };
  }

  const alarms = await prisma.t_alarme.findMany({
    where,
    include: {
      t_lieu: {
        select: {
          IdLieu: true,
          Nom_Lieu: true,
        },
      },
    },
    orderBy: { DateHeureDebut: "desc" },
    take: 100,
  });

  // Transform to API format (AlarmWithDetails)
  const formatted = alarms.map((alarm) => ({
    id: alarm.IdAlarme.toString(),
    sensorId: alarm.IdLieu?.toString() || "0",
    locationId: alarm.IdLieu?.toString() || "0",
    type: (alarm.Type === "H" ? "high" : "low") as "high" | "low",
    value: alarm.Valeur || 0,
    threshold: 0, // Threshold from t_lieu if needed
    status: alarm.DateHeureFin ? ("resolved" as const) : alarm.Acquite ? ("acknowledged" as const) : ("active" as const),
    triggeredAt: alarm.DateHeureDebut || new Date(),
    acknowledgedAt: alarm.Acquite ? alarm.DateHeureDebut : null,
    resolvedAt: alarm.DateHeureFin || null,
    acknowledgedBy: null,
    comment: null,
    sensor: {
      id: alarm.IdLieu?.toString() || "0",
      name: alarm.t_lieu?.Nom_Lieu || "Unknown",
      type: "temperature",
      unit: alarm.Unite || "°C",
      locationId: alarm.IdLieu?.toString() || "0",
      currentValue: alarm.Valeur || null,
      minThreshold: 0,
      maxThreshold: 30,
      measurementFrequency: 60,
      alarmDelay: 0,
      lastMeasurement: alarm.DateHeureDerniereMesure || null,
      isActive: true,
    },
    location: {
      id: alarm.IdLieu?.toString() || "0",
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
      where: { Acquite: false, DateHeureFin: null },
    }),
    prisma.t_alarme.count({
      where: { Acquite: true, DateHeureFin: null },
    }),
    prisma.t_alarme.count({
      where: { DateHeureFin: { not: null } },
    }),
  ]);

  return {
    active: activeCount,
    acknowledged: acknowledgedCount,
    resolved: resolvedCount,
    total: activeCount + acknowledgedCount + resolvedCount,
  };
}
