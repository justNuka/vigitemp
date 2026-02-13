import { unstable_noStore } from "next/cache";

const shouldSkipDbOnBuild = process.env.VIGITEMP_SKIP_DB_ON_BUILD === "1";

/**
 * Composant serveur pour charger les données du dashboard
 * Cache automatique avec Next.js 16 Cache Components
 */

/**
 * Statistiques principales du dashboard
 */
export async function ServerDashboardStats() {
  unstable_noStore();
  const { prisma } = await import("@/lib/prisma");
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
        Date_Heure_Fin: null,
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
  unstable_noStore();
  const { prisma } = await import("@/lib/prisma");
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
    minThreshold: lieu.Tolerance_Surveillance_Inf ?? 0,
    maxThreshold: lieu.Tolerance_Surveillance_Sup ?? 30,
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
  unstable_noStore();
  const { prisma } = await import("@/lib/prisma");
  if (shouldSkipDbOnBuild) {
    return [];
  }

  const alarms = await prisma.t_alarme.findMany({
    where: {
      Est_Acquittee: false,
      Date_Heure_Fin: null,
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
    type:
      alarm.Type === "H"
        ? ("high" as const)
        : alarm.Type === "B"
          ? ("low" as const)
          : ("no-response" as const),
    status: alarm.Est_Acquittee ? ("acknowledged" as const) : ("active" as const),
    value: alarm.Valeur !== null ? parseFloat(alarm.Valeur.toString()) : 0,
    threshold: 0, // Pas de champ threshold direct dans t_alarme
    triggeredAt: alarm.Date_Heure_Debut!,
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
      minThreshold: alarm.t_lieu?.Tolerance_Surveillance_Inf ?? 0,
      maxThreshold: alarm.t_lieu?.Tolerance_Surveillance_Sup ?? 30,
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
  unstable_noStore();
  const { prisma } = await import("@/lib/prisma");
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

  const overviewIds = locations.map((lieu) => lieu.Id_Lieu).filter(Boolean)
  const overviewAlarms = overviewIds.length
    ? await prisma.t_alarme.findMany({
        where: {
          Id_Lieu: { in: overviewIds },
          Date_Heure_Fin: null,
          Est_Acquittee: false,
        },
        select: { Id_Lieu: true, Type: true, Date_Heure_Debut: true },
        orderBy: { Date_Heure_Debut: "desc" },
      })
    : []

  const overviewAlarmTypeByLieu = new Map<number, "H" | "B" | "N">()
  for (const alarm of overviewAlarms) {
    if (!alarm.Id_Lieu) continue
    const type = alarm.Type as "H" | "B" | "N" | null
    if (!type) continue
    if (!overviewAlarmTypeByLieu.has(alarm.Id_Lieu)) {
      overviewAlarmTypeByLieu.set(alarm.Id_Lieu, type)
    }
  }

  return locations.map((lieu) => {
    const alarmType = overviewAlarmTypeByLieu.get(lieu.Id_Lieu) ?? null
    const status = mapSensorStatus({
      isCritical: (alarmType === "H" || alarmType === "B") || lieu.Est_Lieu_En_Alarme === 1,
      isWarning: lieu.Est_Lieu_En_Alarme !== 1 && lieu.Est_Lieu_En_Pre_Alarme === 1,
      isEnded:
        lieu.Est_Lieu_En_Alarme !== 1 &&
        (lieu.Est_Lieu_Alarme_Terminee_Non_Acquittee === 1 ||
          lieu.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 === 1),
      isTechnical: alarmType === "N",
    });
    return {
      id: lieu.Id_Lieu.toString(),
      name: lieu.Nom_Lieu || "Capteur sans nom",
      type: "temperature" as const,
      status: status === "offline" ? "warning" : status, // Map offline to warning for compatibility
      alarmType,
      currentValue: lieu.Derniere_Valeur !== null ? parseFloat(lieu.Derniere_Valeur.toString()) : null,
      unit: lieu.Derniere_Unite || "°C",
      minThreshold: lieu.Tolerance_Surveillance_Inf ?? 0,
      maxThreshold: lieu.Tolerance_Surveillance_Sup ?? 30,
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

/**
 * Compteur d'alarmes sur les dernières 24h (t_alarme + t_alarme_histo)
 */
export async function ServerAlarmTrendCount() {
  unstable_noStore();
  const { prisma } = await import("@/lib/prisma");
  if (shouldSkipDbOnBuild) {
    return { countLast24h: 0 };
  }

  const [activeRows, histoRows] = await Promise.all([
    prisma.$queryRaw<Array<{ count: bigint | number }>>`
      SELECT COUNT(*) AS count
      FROM t_alarme
      WHERE Date_Heure_Debut >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `,
    prisma.$queryRaw<Array<{ count: bigint | number }>>`
      SELECT COUNT(*) AS count
      FROM t_alarme_histo
      WHERE Date_Heure_Debut >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `,
  ]);

  const activeCount = Number(activeRows[0]?.count ?? 0);
  const histoCount = Number(histoRows[0]?.count ?? 0);
  return { countLast24h: activeCount + histoCount };
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















