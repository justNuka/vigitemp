"use client";

import type { SensorWithLocation } from "@/lib/api";
import { getStatusBadge, getStatusColor } from "./monitoring-tree-status";

export function SurveillanceTreeSensorRow({ sensor }: { sensor: SensorWithLocation }) {
  const colors = getStatusColor(sensor.status, sensor.isActive);

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
              {sensor.currentValue.toFixed(1)}
              {sensor.unit}
            </p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0">{getStatusBadge(sensor.status, sensor.isActive)}</div>
    </div>
  );
}
