import { unstable_noStore } from "next/cache";

import {
  applyAccessFilter,
  buildAlarmAccessFilter,
  buildLieuAccessFilter,
  getUserLocationScope,
} from "@/lib/location-access-scope"
import { getServerAuthenticatedUserId } from "@/lib/server-auth"

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
  const userId = await getServerAuthenticatedUserId()
  if (shouldSkipDbOnBuild || !userId) {
    return {
      activeLocations: 0,
      disabledLocations: 0,
      activeAlarms: 0,
      alertSensors: 0,
    };
  }

  const scope = await getUserLocationScope(userId)
  const lieuAccessFilter = buildLieuAccessFilter(scope)
  const alarmAccessFilter = buildAlarmAccessFilter(scope)

  const [activeLocations, disabledLocations, activeAlarms, alertSensors] = await Promise.all([
    prisma.t_lieu.count({ where: applyAccessFilter({ Est_Archive: false, Lieu_Etat: "S" }, lieuAccessFilter) }),
    prisma.t_lieu.count({ where: applyAccessFilter({ Est_Archive: false, Lieu_Etat: "D" }, lieuAccessFilter) }),
    prisma.t_alarme.count({
      where: applyAccessFilter(
        {
          Est_Acquittee: false,
          Date_Heure_Fin: null,
        },
        alarmAccessFilter,
      ),
    }),
    prisma.t_lieu.count({
      where: applyAccessFilter(
        {
          Est_Archive: false,
          OR: [{ Est_Lieu_En_Alarme: 1 }, { Est_Lieu_En_Pre_Alarme: 1 }],
        },
        lieuAccessFilter,
      ),
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
  const userId = await getServerAuthenticatedUserId()
  if (shouldSkipDbOnBuild || !userId) {
    return [];
  }

  const scope = await getUserLocationScope(userId)
  const lieuAccessFilter = buildLieuAccessFilter(scope)

  const criticalLocations = await prisma.t_lieu.findMany({
    where: applyAccessFilter({
      Est_Archive: false,
      Est_Lieu_En_Alarme: 1,
    }, lieuAccessFilter),
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
  const userId = await getServerAuthenticatedUserId()
  if (shouldSkipDbOnBuild || !userId) {
    return [];
  }

  const scope = await getUserLocationScope(userId)
  const alarmAccessFilter = buildAlarmAccessFilter(scope)

  const alarms = await prisma.t_alarme.findMany({
    where: applyAccessFilter({
      Est_Acquittee: false,
      Date_Heure_Fin: null,
    }, alarmAccessFilter),
    select: {
      Id_Alarme: true,
      Id_Lieu: true,
      Type: true,
      Est_Acquittee: true,
      Valeur: true,
      Unite: true,
      Date_Heure_Debut: true,
      Date_Heure_Fin: true,
      t_lieu: {
        select: {
          Id_Lieu: true,
          Id_Site: true,
          Nom_Lieu: true,
          Derniere_Valeur: true,
          Derniere_Unite: true,
          Derniere_Date_Heure: true,
          Tolerance_Surveillance_Inf: true,
          Tolerance_Surveillance_Sup: true,
          Consigne_Inf: true,
          Consigne_Sup: true,
          Est_Archive: true,
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

  return alarms.map((alarm) => {
    const hasConfiguredThresholds =
      alarm.t_lieu?.Consigne_Sup !== null || alarm.t_lieu?.Consigne_Inf !== null;

    return ({
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
      hasThresholds: hasConfiguredThresholds,
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
  });
  });
}

/**
 * Aperçu des capteurs (8 premiers pour le dashboard)
 */
export async function ServerSensorOverview() {
  unstable_noStore();
  const { prisma } = await import("@/lib/prisma");
  const userId = await getServerAuthenticatedUserId()
  if (shouldSkipDbOnBuild || !userId) {
    return [];
  }

  const scope = await getUserLocationScope(userId)
  const lieuAccessFilter = buildLieuAccessFilter(scope)

  const locations = await prisma.t_lieu.findMany({
    where: applyAccessFilter({
      Est_Archive: false,
    }, lieuAccessFilter),
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
 * Tendance des alarmes sur 7 jours glissants (t_alarme + t_alarme_histo)
 */
export async function ServerAlarmTrendCount() {
  unstable_noStore();
  const { prisma } = await import("@/lib/prisma");
  const userId = await getServerAuthenticatedUserId()
  if (shouldSkipDbOnBuild || !userId) {
    return { countLast7d: 0, measurements: [] as Array<{ timestamp: string; value: number; sensorId: string }> };
  }

  const scope = await getUserLocationScope(userId)
  const lieuAccessFilter = buildLieuAccessFilter(scope)
  const allowedLieux = await prisma.t_lieu.findMany({
    where: applyAccessFilter({ Est_Archive: false }, lieuAccessFilter),
    select: { Id_Lieu: true },
  })
  const allowedLieuIds = allowedLieux.map((l) => l.Id_Lieu)
  if (allowedLieuIds.length === 0) {
    return { countLast7d: 0, measurements: [] as Array<{ timestamp: string; value: number; sensorId: string }> }
  }

  const idsList = allowedLieuIds.join(",")
  const trendRows = await prisma.$queryRawUnsafe<Array<{ dayKey: string | Date; total: bigint | number }>>(`
    SELECT
      d.day_key AS dayKey,
      COALESCE(a.cnt, 0) + COALESCE(h.cnt, 0) AS total
    FROM (
      SELECT DATE_SUB(CURDATE(), INTERVAL 6 DAY) AS day_key
      UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 5 DAY)
      UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 4 DAY)
      UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 3 DAY)
      UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 2 DAY)
      UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 1 DAY)
      UNION ALL SELECT CURDATE()
    ) d
    LEFT JOIN (
      SELECT DATE(Date_Heure_Debut) AS day_key, COUNT(*) AS cnt
      FROM t_alarme
      WHERE Date_Heure_Debut >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        AND Id_Lieu IN (${idsList})
      GROUP BY DATE(Date_Heure_Debut)
    ) a ON a.day_key = d.day_key
    LEFT JOIN (
      SELECT DATE(Date_Heure_Debut) AS day_key, COUNT(*) AS cnt
      FROM t_alarme_histo
      WHERE Date_Heure_Debut >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        AND Id_Lieu IN (${idsList})
      GROUP BY DATE(Date_Heure_Debut)
    ) h ON h.day_key = d.day_key
    ORDER BY d.day_key ASC
  `);

  const measurements = trendRows.map((row) => {
    const day = row.dayKey instanceof Date ? row.dayKey.toISOString().slice(0, 10) : String(row.dayKey).slice(0, 10);
    return {
      timestamp: `${day}T00:00:00`,
      value: Number(row.total ?? 0),
      sensorId: "alarm-trend",
    };
  });

  const countLast7d = measurements.reduce((sum, point) => sum + point.value, 0);

  return { countLast7d, measurements };
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















