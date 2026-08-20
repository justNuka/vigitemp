"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { formatMeasureValue } from "@/lib/measurements";
import {
  Thermometer,
  Droplets,
  Wind,
  Gauge,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import type { SensorWithLocation } from "@/lib/api";
import { useTranslations } from "next-intl";

interface SensorCardProps {
  sensor: SensorWithLocation;
  onClick?: () => void;
  className?: string;
}

const sensorIcons: Record<string, typeof Thermometer> = {
  temperature: Thermometer,
  humidity: Droplets,
  co2: Wind,
  pressure: Gauge,
};

const sensorColors: Record<string, string> = {
  temperature: "text-destructive",
  humidity: "text-info",
  co2: "text-warning",
  pressure: "text-primary",
};

function getValueTrend(current: number | null, min: number | null, max: number | null): "up" | "down" | "stable" {
  if (current === null || min === null || max === null) return "stable";
  const range = max - min;
  const midpoint = min + range / 2;
  const diff = current - midpoint;
  if (Math.abs(diff) < range * 0.1) return "stable";
  return diff > 0 ? "up" : "down";
}

export function SensorCard({ sensor, onClick, className }: SensorCardProps) {
  const tMonitoring = useTranslations("monitoringCard");
  const tTables = useTranslations("tables");
  const Icon = sensorIcons[sensor.type] || Thermometer;
  const iconColor = sensorColors[sensor.type] || "text-primary";
  const trend = getValueTrend(sensor.currentValue, sensor.minThreshold, sensor.maxThreshold);
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const hasThresholds = sensor.minThreshold !== null && sensor.maxThreshold !== null;
  const minThreshold = sensor.minThreshold;
  const maxThreshold = sensor.maxThreshold;

  const isOutOfRange = hasThresholds && sensor.currentValue !== null && minThreshold !== null && maxThreshold !== null && (
    sensor.currentValue < minThreshold || sensor.currentValue > maxThreshold
  );

  const badgeStatus: "ok" | "warning" | "critical" =
    sensor.status === "warning"
      ? "warning"
      : sensor.status === "critical" || sensor.status === "technical" || sensor.status === "ended"
        ? "critical"
        : "ok";

  const currentValueLabel = sensor.currentValue != null && typeof sensor.currentValue === "number"
    ? `${formatMeasureValue(sensor.currentValue)}${sensor.unit}`
    : "--";
  const minValueLabel = sensor.minThreshold !== null ? `${formatMeasureValue(sensor.minThreshold)}${sensor.unit}` : "-";
  const maxValueLabel = sensor.maxThreshold !== null ? `${formatMeasureValue(sensor.maxThreshold)}${sensor.unit}` : "-";

  return (
    <Card
      className={cn(
        "overflow-visible transition-all duration-200 cursor-pointer group",
        "hover-elevate",
        isOutOfRange && sensor.status === "critical" && "pulse-alarm",
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      data-testid={`card-sensor-${sensor.id}`}
      aria-label={`${sensor.name} · ${tTables("value")}: ${currentValueLabel} · ${tTables("status")}: ${sensor.status}`}
    >
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className={cn("p-2 rounded-lg bg-muted/50", iconColor)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm truncate">{sensor.name}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {sensor.location.name}
            </p>
          </div>
        </div>
        <StatusBadge status={badgeStatus} size="sm" />
      </CardHeader>

      <CardContent className="px-4 pb-4">
        <div className="flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl md:text-4xl font-bold data-value">
              {sensor.currentValue != null && typeof sensor.currentValue === "number"
                ? formatMeasureValue(sensor.currentValue)
                : "--"}
            </span>
            <span className="text-sm text-muted-foreground font-medium">
              {sensor.unit}
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <TrendIcon className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">
                {tMonitoring("guides.min", { value: minValueLabel })}
              </span>
              <span className="text-muted-foreground">
                {tMonitoring("guides.max", { value: maxValueLabel })}
              </span>
            </div>
          </div>

          <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
            <ThresholdBar
              value={sensor.currentValue}
              min={sensor.minThreshold}
              max={sensor.maxThreshold}
              status={badgeStatus}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ThresholdBarProps {
  value: number | null;
  min: number | null;
  max: number | null;
  status: "ok" | "warning" | "critical";
}

function ThresholdBar({ value, min, max, status }: ThresholdBarProps) {
  if (value === null || min === null || max === null) return null;

  const range = max - min;
  const buffer = range * 0.2;
  const displayMin = min - buffer;
  const displayMax = max + buffer;
  const displayRange = displayMax - displayMin;
  const percentage = Math.max(0, Math.min(100, ((value - displayMin) / displayRange) * 100));

  const statusColors = {
    ok: "bg-success",
    warning: "bg-warning",
    critical: "bg-destructive",
  };

  return (
    <div
      className={cn("h-full rounded-full transition-all duration-300", statusColors[status])}
      style={{ width: `${percentage}%` }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
    />
  );
}

export function SensorCardSkeleton() {
  return (
    <Card className="overflow-visible">
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-start justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2 flex-1">
          <div className="p-2 rounded-lg bg-muted animate-pulse w-8 h-8" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="h-5 w-12 bg-muted rounded-full animate-pulse" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex items-baseline gap-1">
          <div className="h-10 w-20 bg-muted rounded animate-pulse" />
          <div className="h-4 w-6 bg-muted rounded animate-pulse" />
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex gap-4">
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          </div>
          <div className="mt-2 h-1.5 w-full bg-muted rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
