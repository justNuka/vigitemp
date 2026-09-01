"use client";

import type { SensorWithLocation } from "@/lib/api";
import { getStatusBadge, getStatusColor } from "./monitoring-tree-status";
import { useLocale, useTranslations } from "next-intl";
import { formatMeasureValue } from "@/lib/measurements";

export function SurveillanceTreeSensorRow({ sensor }: { sensor: SensorWithLocation }) {
  const tStatus = useTranslations("surveillanceStatus");
  const tCard = useTranslations("monitoringCard");
  const locale = useLocale();
  const statusLabels = {
    inactive: tStatus("inactive"),
    critical: tStatus("critical"),
    technical: tStatus("technical"),
    warning: tStatus("warning"),
    ended: tStatus("ended"),
    ok: tStatus("ok"),
  };
  const colors = getStatusColor(sensor.status, sensor.isActive, statusLabels);

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border ${colors.bg} dark:border-gray-700`}
    >
      <div className="flex items-center gap-3 flex-1">
        <div className={`${colors.text}`}>{colors.icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm truncate ${colors.text}`}>{sensor.name}</p>
          {sensor.currentValue !== null && (
            <p className="text-xs text-muted-foreground">
              {formatMeasureValue(sensor.currentValue, sensor.decimals ?? null, locale)}
              {sensor.unit}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {sensor.location.alarmDisabled ? (
          <span className="rounded-full bg-red-500/70 text-red-500 dark:text-red-100 text-[10px] px-2 py-0.5">
            {tCard("alarms.disabled")}
          </span>
        ) : null}
        {getStatusBadge(sensor.status, sensor.isActive, statusLabels)}
      </div>
    </div>
  );
}
