"use cache";

import { cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function DashboardStats() {
  "use cache";
  cacheTag("dashboard-stats");
  // Pas besoin de cacheLife ici, le cache est invalidé manuellement

  const [totalSensors, activeSensors, totalLocations, activeAlarms] = await Promise.all([
    prisma.t_sonde.count(),
    prisma.t_sonde.count({ where: { Etat_Sonde: "O" } }),
    prisma.t_lieu.count({ where: { Lieu_Etat: "1" } }),
    prisma.t_alarme.count({ 
      where: { 
        Est_Acquittee: false, // Alarmes non acquittées
        Est_Alarme_Vrai: true // Alarmes réelles
      } 
    }),
  ]);

  const stats = {
    totalSensors,
    activeSensors,
    okPercentage: totalSensors > 0 ? Math.round((activeSensors / totalSensors) * 100) : 0,
    totalLocations,
    activeAlarms,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Capteurs totaux"
        value={stats.totalSensors}
        description={`${stats.activeSensors} actifs (${stats.okPercentage}%)`}
        trend="up"
      />
      <StatCard
        title="Lieux surveillés"
        value={stats.totalLocations}
        description="Emplacements actifs"
      />
      <StatCard
        title="Alarmes actives"
        value={stats.activeAlarms}
        description={stats.activeAlarms > 0 ? "Attention requise" : "Tout est normal"}
        variant={stats.activeAlarms > 0 ? "warning" : "success"}
      />
      <StatCard
        title="Disponibilité"
        value={`${stats.okPercentage}%`}
        description="Capteurs opérationnels"
        variant={stats.okPercentage >= 95 ? "success" : "warning"}
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: "up" | "down";
  variant?: "default" | "success" | "warning";
}

function StatCard({ title, value, description, variant = "default" }: StatCardProps) {
  const variantStyles = {
    default: "border-border",
    success: "border-success/30 bg-success/5",
    warning: "border-warning/30 bg-warning/5",
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
