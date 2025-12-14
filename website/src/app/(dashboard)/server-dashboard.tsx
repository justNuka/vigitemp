"use cache";

import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Composant serveur pour charger les données du dashboard
 * Cache automatique avec Next.js 16 Cache Components
 */

/**
 * Statistiques principales du dashboard
 */
export async function ServerDashboardStats() {
  "use cache";
  cacheTag("dashboard-stats");

  const [totalLocations, activeAlarms, okSensors, warningSensors, criticalSensors] =
    await Promise.all([
      prisma.t_lieu.count({ where: { Archive: false } }),
      prisma.t_alarme.count({
        where: {
          Acquitee: false,
        },
      }),
      prisma.t_lieu.count({ where: { Archive: false, Lieu_Etat: "O" } }),
      prisma.t_lieu.count({ where: { Archive: false, Lieu_Etat: "P" } }),
      prisma.t_lieu.count({ where: { Archive: false, Lieu_Etat: "A" } }),
    ]);

  return {
    totalLocations,
    activeAlarms,
    okSensors,
    warningSensors,
    criticalSensors,
  };
}

/**
 * Capteurs critiques pour affichage prioritaire sur le dashboard
 */
export async function ServerCriticalSensors() {
  "use cache";
  cacheTag("dashboard-critical-sensors");

  const criticalLocations = await prisma.t_lieu.findMany({
    where: {
      Archive: false,
      Lieu_Etat: "A", // État critique
    },
    include: {
      t_site: {
        select: {
          Id_Site: true,
          Code_Site: true,
          Libelle_Site: true,
        },
      },
    },
    orderBy: {
      Derniere_Date_Heure: "desc",
    },
    take: 4, // Top 4 pour le dashboard
  });

  return criticalLocations.map((lieu) => ({
    id: lieu.Id_Lieu.toString(),
    name: lieu.Nom_Lieu || "Capteur sans nom",
    type: "temperature" as const,
    status: "critical" as const,
    currentValue: lieu.Derniere_Valeur !== null ? parseFloat(lieu.Derniere_Valeur.toString()) : null,
    unit: lieu.Derniere_Unite || "°C",
    minThreshold: lieu.Consigne_Inf ?? 0,
    maxThreshold: lieu.Consigne_Sup ?? 30,
    lastMeasurement: lieu.Derniere_Date_Heure || null,
    isActive: !lieu.Archive,
    location: {
      id: lieu.Id_Site?.toString() || "0",
      name: lieu.t_site?.Code_Site && lieu.t_site?.Libelle_Site
        ? `${lieu.t_site.Code_Site} - ${lieu.t_site.Libelle_Site}`
        : lieu.t_site?.Code_Site || lieu.t_site?.Libelle_Site || "Non assigné",
      description: null,
      siteGroup: lieu.t_site?.Code_Site && lieu.t_site?.Libelle_Site
        ? `${lieu.t_site.Code_Site} - ${lieu.t_site.Libelle_Site}`
        : lieu.t_site?.Code_Site || lieu.t_site?.Libelle_Site || null,
      isActive: true,
    },
  }));
}

/**
 * Alarmes actives récentes pour le tableau du dashboard
 */
export async function ServerActiveAlarms() {
  "use cache";
  cacheTag("dashboard-active-alarms");

  const alarms = await prisma.t_alarme.findMany({
    where: {
      Acquitee: false,
    },
    include: {
      t_lieu: {
        include: {
          t_site: {
            select: {
              Id_Site: true,
              Code_Site: true,
              Libelle_Site: true,
            },
          },
        },
      },
    },
    orderBy: {
      Date_Heure_Debut: "desc",
    },
    take: 5, // Top 5 pour le dashboard
  });

  return alarms.map((alarm) => ({
    id: alarm.Id_Alarme.toString(),
    sensorId: alarm.Id_Lieu?.toString() || "0",
    locationId: alarm.t_lieu?.Id_Site?.toString() || "0",
    type: alarm.Type === "H" ? ("high" as const) : ("low" as const),
    status: alarm.Acquitee ? ("acknowledged" as const) : ("active" as const),
    value: alarm.Valeur !== null ? parseFloat(alarm.Valeur.toString()) : 0,
    threshold: 0, // Pas de champ threshold direct dans t_alarme
    triggeredAt: alarm.Date_Heure_Debut || new Date(),
    acknowledgedAt: alarm.Acquitee ? alarm.Date_Heure_Fin : null,
    acknowledgedBy: alarm.Acquitee ? "user" : null,
    resolvedAt: alarm.Date_Heure_Fin,
    comment: null,
    sensor: {
      id: alarm.Id_Lieu?.toString() || "0",
      name: alarm.t_lieu?.Nom_Lieu || "Capteur sans nom",
      type: "temperature" as const,
      status: "critical" as const,
      currentValue: alarm.Valeur !== null ? parseFloat(alarm.Valeur.toString()) : null,
      unit: alarm.Unite || "°C",
      locationId: alarm.t_lieu?.Id_Site?.toString() || "0",
      minThreshold: alarm.t_lieu?.Consigne_Inf ?? 0,
      maxThreshold: alarm.t_lieu?.Consigne_Sup ?? 30,
      measurementFrequency: 60,
      alarmDelay: 0,
      lastMeasurement: alarm.t_lieu?.Derniere_Date_Heure || null,
      isActive: !alarm.t_lieu?.Archive,
    },
    location: {
      id: alarm.t_lieu?.Id_Lieu.toString() || "0",
      name: alarm.t_lieu?.t_site?.Code_Site && alarm.t_lieu?.t_site?.Libelle_Site
        ? `${alarm.t_lieu.t_site.Code_Site} - ${alarm.t_lieu.t_site.Libelle_Site}`
        : alarm.t_lieu?.t_site?.Code_Site || alarm.t_lieu?.t_site?.Libelle_Site || "Non assigné",
      description: null,
      siteGroup: alarm.t_lieu?.t_site?.Code_Site && alarm.t_lieu?.t_site?.Libelle_Site
        ? `${alarm.t_lieu.t_site.Code_Site} - ${alarm.t_lieu.t_site.Libelle_Site}`
        : alarm.t_lieu?.t_site?.Code_Site || alarm.t_lieu?.t_site?.Libelle_Site || null,
      isActive: true,
    },
  }));
}

/**
 * Aperçu des capteurs (8 premiers pour le dashboard)
 */
export async function ServerSensorOverview() {
  "use cache";
  cacheTag("dashboard-sensor-overview");

  const locations = await prisma.t_lieu.findMany({
    where: {
      Archive: false,
    },
    include: {
      t_site: {
        select: {
          Id_Site: true,
          Code_Site: true,
          Libelle_Site: true,
        },
      },
    },
    orderBy: {
      Derniere_Date_Heure: "desc",
    },
    take: 8, // 8 premiers pour le dashboard
  });

  return locations.map((lieu) => {
    const status = mapSensorStatus(lieu.Lieu_Etat);
    return {
      id: lieu.Id_Lieu.toString(),
      name: lieu.Nom_Lieu || "Capteur sans nom",
      type: "temperature" as const,
      status: status === "offline" ? "warning" : status, // Map offline to warning for compatibility
      currentValue: lieu.Derniere_Valeur !== null ? parseFloat(lieu.Derniere_Valeur.toString()) : null,
      unit: lieu.Derniere_Unite || "°C",
      minThreshold: lieu.Consigne_Inf ?? 0,
      maxThreshold: lieu.Consigne_Sup ?? 30,
      lastMeasurement: lieu.Derniere_Date_Heure || null,
      isActive: !lieu.Archive,
      location: {
        id: lieu.Id_Site?.toString() || "0",
        name: lieu.t_site?.Code_Site && lieu.t_site?.Libelle_Site
          ? `${lieu.t_site.Code_Site} - ${lieu.t_site.Libelle_Site}`
          : lieu.t_site?.Code_Site || lieu.t_site?.Libelle_Site || "Non assigné",
        description: null,
        siteGroup: lieu.t_site?.Code_Site && lieu.t_site?.Libelle_Site
          ? `${lieu.t_site.Code_Site} - ${lieu.t_site.Libelle_Site}`
          : lieu.t_site?.Code_Site || lieu.t_site?.Libelle_Site || null,
        isActive: true,
      },
    };
  });
}

function mapSensorStatus(etat: string | null): "ok" | "warning" | "critical" | "offline" {
  switch (etat) {
    case "O":
      return "ok";
    case "P":
      return "warning";
    case "A":
      return "critical";
    default:
      return "offline";
  }
}
