"use cache";

import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

const shouldSkipDbOnBuild = process.env.VIGITEMP_SKIP_DB_ON_BUILD === "1";

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

  if (shouldSkipDbOnBuild) {
    return {
      activeLocations: 0,
      disabledLocations: 0,
      activeAlarms: 0,
      alertSensors: 0,
    };
  }

  const [activeLocations, disabledLocations, activeAlarms, alertSensors] = await Promise.all([
    prisma.t_lieu.count({ where: { Est_Archive: false, Lieu_Etat: "S" } }),
    prisma.t_lieu.count({ where: { Est_Archive: false, Lieu_Etat: "D" } }),
    prisma.t_alarme.count({
      where: {
        Est_Acquittee: false,
      },
    }),
    prisma.t_lieu.count({
      where: {
        Est_Archive: false,
        OR: [{ Est_Lieu_En_Alarme: 1 }, { Est_Lieu_En_Pre_Alarme: 1 }],
      },
    }),
  ]);

  return {
    activeLocations,
    disabledLocations,
    activeAlarms,
    alertSensors,
  };
}

/**
 * Capteurs critiques pour affichage prioritaire sur le dashboard
 */
export async function ServerCriticalSensors() {
  "use cache";
  cacheTag("dashboard-critical-sensors");

  if (shouldSkipDbOnBuild) {
    return [];
  }

  const criticalLocations = await prisma.t_lieu.findMany({
    where: {
      Est_Archive: false,
      Est_Lieu_En_Alarme: 1,
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
    isActive: !lieu.Est_Archive,
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

  if (shouldSkipDbOnBuild) {
    return [];
  }

  const alarms = await prisma.t_alarme.findMany({
    where: {
      Est_Acquittee: false,
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
    status: alarm.Est_Acquittee ? ("acknowledged" as const) : ("active" as const),
    value: alarm.Valeur !== null ? parseFloat(alarm.Valeur.toString()) : 0,
    threshold: 0, // Pas de champ threshold direct dans t_alarme
    triggeredAt: alarm.Date_Heure_Debut || new Date(),
    acknowledgedAt: alarm.Est_Acquittee ? alarm.Date_Heure_Fin : null,
    acknowledgedBy: alarm.Est_Acquittee ? "user" : null,
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
      isActive: !alarm.t_lieu?.Est_Archive,
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

  if (shouldSkipDbOnBuild) {
    return [];
  }

  const locations = await prisma.t_lieu.findMany({
    where: {
      Est_Archive: false,
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
    const status = mapSensorStatus({
      isCritical: lieu.Est_Lieu_En_Alarme === 1,
      isWarning: lieu.Est_Lieu_En_Alarme !== 1 && lieu.Est_Lieu_En_Pre_Alarme === 1,
      isEnded:
        lieu.Est_Lieu_En_Alarme !== 1 &&
        (lieu.Est_Lieu_Alarme_Termee_Non_Acquittee === 1 ||
          lieu.Est_Lieu_Alarme_Termee_Non_Acquittee_T1 === 1),
      isTechnical: (() => {
        if (!lieu.Retard_Non_Reponse || !lieu.Date_Heure_Derniere_Reponse) return false
        const lastResponse = new Date(lieu.Date_Heure_Derniere_Reponse)
        if (Number.isNaN(lastResponse.getTime())) return false
        const diffMinutes = (Date.now() - lastResponse.getTime()) / 60000
        return diffMinutes >= lieu.Retard_Non_Reponse
      })(),
    });
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
      isActive: !lieu.Est_Archive,
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

function mapSensorStatus({
  isCritical,
  isWarning,
  isEnded,
  isTechnical,
}: {
  isCritical: boolean
  isWarning: boolean
  isEnded: boolean
  isTechnical: boolean
}): "ok" | "warning" | "critical" | "offline" {
  if (isCritical) return "critical";
  if (isTechnical) return "critical";
  if (isWarning) return "warning";
  if (isEnded) return "warning";
  return "ok";
}
