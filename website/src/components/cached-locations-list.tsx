import { cacheTag } from "next/cache";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "./status-badge";

async function getCachedLocations() {
  "use cache";
  cacheTag("locations-list");

  return prisma.t_lieu.findMany({
    where: { Est_Archive: false },
    include: {
      t_sonde: {
        where: { Est_Sonde_Reformee: false },
        select: { Id_Sonde: true },
      },
    },
    orderBy: { Nom_Lieu: "asc" },
  });
}

export async function CachedLocationsList() {
  const [locations, tDashboard, tTables, tMonitoring, tStatus, tSurveillance] = await Promise.all([
    getCachedLocations(),
    getTranslations("dashboard.fallback"),
    getTranslations("tables"),
    getTranslations("monitoringCard"),
    getTranslations("surveillanceStatus"),
    getTranslations("surveillance"),
  ]);

  const formatted = locations.map((loc) => {
    const sensors = Array.isArray(loc.t_sonde) ? loc.t_sonde : [];
    const isCritical = loc.Est_Lieu_En_Alarme === 1;
    const isWarning = !isCritical && loc.Est_Lieu_En_Pre_Alarme === 1;
    const status: "ok" | "warning" | "critical" = isCritical
      ? "critical"
      : isWarning
        ? "warning"
        : "ok";

    return {
      id: loc.Id_Lieu,
      name: loc.Nom_Lieu || tDashboard("unnamed_sensor"),
      site: loc.Id_Site || null,
      status,
      sensorCount: sensors.length,
      okSensors: status === "ok" ? sensors.length : 0,
      warningSensors: status === "warning" ? sensors.length : 0,
      criticalSensors: status === "critical" ? sensors.length : 0,
    };
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {formatted.map((location) => (
        <div key={location.id} className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold">{location.name}</h3>
              {location.site && (
                <p className="text-sm text-muted-foreground">
                  {tTables("site")} #{location.site}
                </p>
              )}
            </div>
            <StatusBadge status={location.status} size="sm" />
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded bg-success/10 p-2">
              <div className="text-lg font-bold text-success">{location.okSensors}</div>
              <div className="text-xs text-muted-foreground">{tMonitoring("status.ok")}</div>
            </div>
            <div className="rounded bg-warning/10 p-2">
              <div className="text-lg font-bold text-warning">{location.warningSensors}</div>
              <div className="text-xs text-muted-foreground">{tStatus("warning")}</div>
            </div>
            <div className="rounded bg-destructive/10 p-2">
              <div className="text-lg font-bold text-destructive">{location.criticalSensors}</div>
              <div className="text-xs text-muted-foreground">{tStatus("critical")}</div>
            </div>
          </div>

          <div className="mt-3 text-sm text-muted-foreground text-center">
            {tSurveillance("footer.count", { count: location.sensorCount })}
          </div>
        </div>
      ))}
    </div>
  );
}
