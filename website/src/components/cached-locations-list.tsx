"use cache";

import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "./status-badge";

export async function CachedLocationsList() {
  "use cache";
  cacheTag("locations-list");

  const locations = await prisma.t_lieu.findMany({
    where: { Lieu_Etat: "1" },
    include: {
      t_sonde: {
        where: { Etat_Sonde: { not: null } },
        select: {
          Etat_Sonde: true,
        },
      },
    },
    orderBy: { Nom_Lieu: "asc" },
  });

  const formatted = locations.map((loc) => {
    const sensors = Array.isArray(loc.t_sonde) ? loc.t_sonde : [];
    const okCount = sensors.filter((s: any) => s.Etat_Sonde === "O").length;
    const warningCount = sensors.filter((s: any) => s.Etat_Sonde === "P").length;
    const criticalCount = sensors.filter((s: any) => s.Etat_Sonde === "A").length;

    let status: "ok" | "warning" | "critical" = "ok";
    if (criticalCount > 0) status = "critical";
    else if (warningCount > 0) status = "warning";

    return {
      id: loc.Id_Lieu,
      name: loc.Nom_Lieu || "Sans nom",
      site: loc.Id_Site || null,
      status,
      sensorCount: sensors.length,
      okSensors: okCount,
      warningSensors: warningCount,
      criticalSensors: criticalCount,
    };
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {formatted.map((location) => (
        <LocationCard key={location.id} location={location} />
      ))}
    </div>
  );
}

interface LocationCardProps {
  location: {
    id: number;
    name: string;
    site: number | null;
    status: "ok" | "warning" | "critical";
    sensorCount: number;
    okSensors: number;
    warningSensors: number;
    criticalSensors: number;
  };
}

function LocationCard({ location }: LocationCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold">{location.name}</h3>
          {location.site && (
            <p className="text-sm text-muted-foreground">Site #{location.site}</p>
          )}
        </div>
        <StatusBadge status={location.status} size="sm" />
      </div>
      
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded bg-success/10 p-2">
          <div className="text-lg font-bold text-success">{location.okSensors}</div>
          <div className="text-xs text-muted-foreground">OK</div>
        </div>
        <div className="rounded bg-warning/10 p-2">
          <div className="text-lg font-bold text-warning">{location.warningSensors}</div>
          <div className="text-xs text-muted-foreground">Warn</div>
        </div>
        <div className="rounded bg-destructive/10 p-2">
          <div className="text-lg font-bold text-destructive">{location.criticalSensors}</div>
          <div className="text-xs text-muted-foreground">Crit</div>
        </div>
      </div>
      
      <div className="mt-3 text-sm text-muted-foreground text-center">
        {location.sensorCount} capteur{location.sensorCount > 1 ? "s" : ""} total
      </div>
    </div>
  );
}
