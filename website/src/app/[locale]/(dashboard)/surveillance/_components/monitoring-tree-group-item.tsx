"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { SensorWithLocation } from "@/lib/api";
import { SurveillanceTreeSensorRow } from "./monitoring-tree-sensor-row";
import type { TreeStats } from "./monitoring-tree-types";
import { SurveillanceTreeStatsBadges } from "./monitoring-tree-stats-badges";
import { formatAlarmes, formatSondes } from "../_helpers/monitoring-labels";

export function SurveillanceTreeGroupItem({
  siteId,
  groupId,
  groupName,
  sensors,
  stats,
  indexFallback,
}: {
  siteId: number;
  groupId: number | null;
  groupName: string;
  sensors: SensorWithLocation[];
  stats: TreeStats;
  indexFallback: number;
}) {
  const groupKey = groupId ?? indexFallback;
  const alarmsCount = stats.critical + stats.warning;

  return (
    <AccordionItem
      key={`${siteId}-group-${groupKey}`}
      value={`group-${siteId}-${groupKey}`}
      className="border rounded-lg overflow-hidden dark:border-gray-700"
    >
      <AccordionTrigger className="px-3 py-2 hover:bg-muted/30 dark:hover:bg-gray-800/50">
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center gap-2 flex-1 text-left">
            <span className="font-medium text-sm">{groupName}</span>
            <span className="text-xs text-muted-foreground">
              {formatSondes(stats.total)}
              {alarmsCount > 0 ? ` • ${formatAlarmes(alarmsCount)}` : ""}
            </span>
          </div>

          <SurveillanceTreeStatsBadges stats={stats} compact />
        </div>
      </AccordionTrigger>

      <AccordionContent className="pt-0">
        <div className="space-y-2 pl-3 pr-3 pb-3">
          {sensors.map((sensor) => (
            <SurveillanceTreeSensorRow key={sensor.id} sensor={sensor} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
