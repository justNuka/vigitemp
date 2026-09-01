"use cache";

import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export async function DashboardStats() {
  "use cache";
  cacheTag("dashboard-stats");
  // Pas besoin de cacheLife ici, le cache est invalide manuellement

  const t = await getTranslations("dashboard");

  const [activeLocations, disabledLocations, activeAlarms, alertSensors] = await Promise.all([
    prisma.t_lieu.count({ where: { Est_Archive: false, Lieu_Etat: "S" } }),
    prisma.t_lieu.count({ where: { Est_Archive: false, Lieu_Etat: "D" } }),
    prisma.t_alarme.count({
      where: {
        Est_Acquittee: false,
        Date_Heure_Fin: null,
      }
    }),
    prisma.t_lieu.count({
      where: {
        Est_Archive: false,
        OR: [{ Est_Lieu_En_Alarme: 1 }, { Est_Lieu_En_Pre_Alarme: 1 }]
      }
    })
  ]);

  const stats = {
    activeLocations,
    disabledLocations,
    activeAlarms,
    alertSensors,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title={t("stats.locations_monitored")}
        value={stats.activeLocations}
        description={t("stats_descriptions.active_locations")}
        variant="info"
      />
      <StatCard
        title={t("stats.locations_disabled")}
        value={stats.disabledLocations}
        description={t("stats_descriptions.disabled_locations")}
      />
      <StatCard
        title={t("stats.active_alarms")}
        value={stats.activeAlarms}
        description={
          stats.activeAlarms > 0
            ? t("stats_descriptions.active_alarms_warning")
            : t("stats_descriptions.active_alarms_ok")
        }
        variant={stats.activeAlarms > 0 ? "warning" : "success"}
      />
      <StatCard
        title={t("stats.sensors_alert")}
        value={stats.alertSensors}
        description={t("stats_descriptions.alert_sensors")}
        variant={stats.alertSensors > 0 ? "warning" : "success"}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: "up" | "down";
  variant?: "default" | "success" | "warning" | "info";
}

function StatCard({ title, value, description, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "border-border",
    success: "border-success/30 bg-success/5",
    warning: "border-warning/30 bg-warning/5",
    info: "border-primary/30 bg-primary/5",
  };

  return (
    <div className={`rounded-lg border ${variantStyles[variant]} p-6`}>
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
