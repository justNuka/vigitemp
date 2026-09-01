"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Measurement } from "@/lib/api";
import { useLocale, useTranslations } from "next-intl";
import { formatDbDateTime } from "@/lib/date-display";
import { formatNumber } from "@/lib/number-display";

interface MiniChartProps {
  measurements: Measurement[];
  minThreshold?: number;
  maxThreshold?: number;
  className?: string;
  height?: number;
  showScale?: boolean;
  nonNegativeScale?: boolean;
}

export function MiniChart({
  measurements,
  minThreshold,
  maxThreshold,
  className,
  height = 60,
  showScale = false,
  nonNegativeScale = false,
}: MiniChartProps) {
  const t = useTranslations("miniChart");
  const locale = useLocale();
  const chartData = useMemo(() => {
    if (measurements.length === 0) return null;

    const values = measurements.map((m) => m.value);
    const min = Math.min(...values, minThreshold ?? Infinity);
    const max = Math.max(...values, maxThreshold ?? -Infinity);
    const range = max - min || 1;
    const padding = range * 0.1;
    const displayMin = nonNegativeScale ? Math.max(0, min - padding) : min - padding;
    const displayMax = max + padding;
    const displayRange = displayMax - displayMin;

    const points = measurements.map((m, i) => {
      const x = (i / (measurements.length - 1)) * 100;
      const y = ((m.value - displayMin) / displayRange) * 100;
      return { x, y: 100 - y, value: m.value };
    });

    const pathData = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");

    const areaPath = `${pathData} L ${points[points.length - 1].x} 100 L 0 100 Z`;

    return {
      points,
      pathData,
      areaPath,
      displayMin,
      displayMax,
      displayRange,
    };
  }, [measurements, minThreshold, maxThreshold, nonNegativeScale]);

  const xLabels = useMemo(() => {
    if (measurements.length < 2) return [] as string[];
    if (measurements.length > 10) {
      return [
        formatDbDateTime(measurements[0].timestamp, { locale, format: "dateShort" }),
        formatDbDateTime(measurements[measurements.length - 1].timestamp, {
          locale,
          format: "dateShort",
        }),
      ];
    }

    return measurements.map((m) =>
      formatDbDateTime(m.timestamp, { locale, format: "dateShort" }),
    );
  }, [locale, measurements]);

  if (!chartData || measurements.length < 2) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted/30 rounded-lg",
          className
        )}
        style={{ height }}
      >
        <p className="text-xs text-muted-foreground">{t("empty")}</p>
      </div>
    );
  }

  const { points, pathData, areaPath, displayMin, displayMax, displayRange } = chartData;
  const formatScaleValue = (value: number) => {
    if (Number.isInteger(value)) return String(value)
    return formatNumber(value, { decimals: 1, locale: "en-US", grouping: false })
  }
  const showDenseLabels = xLabels.length > 2;
  const hasXLabels = xLabels.length > 0;
  const chartHeight = hasXLabels ? Math.max(height - 20, 40) : height;

  const minThresholdY = minThreshold
    ? 100 - ((minThreshold - displayMin) / displayRange) * 100
    : null;
  const maxThresholdY = maxThreshold
    ? 100 - ((maxThreshold - displayMin) / displayRange) * 100
    : null;

  const lastPoint = points[points.length - 1];
  const isOutOfRange =
    (minThreshold !== undefined && lastPoint.value < minThreshold) ||
    (maxThreshold !== undefined && lastPoint.value > maxThreshold);

  return (
    <div className={cn("relative", className)} style={{ height }}>
      {showScale ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex flex-col justify-between py-1 text-[10px] text-muted-foreground">
          <span className="rounded bg-background/80 px-1 py-0.5 shadow-sm">{formatScaleValue(displayMax)}</span>
          <span className="rounded bg-background/80 px-1 py-0.5 shadow-sm">{formatScaleValue(displayMin)}</span>
        </div>
      ) : null}
      <div style={{ height: chartHeight }}>
        <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
        role="img"
        aria-label={t("aria_label")}
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              className={isOutOfRange ? "stop-color-destructive" : "stop-color-primary"}
              style={{
                stopColor: isOutOfRange
                  ? "hsl(var(--destructive))"
                  : "hsl(var(--primary))",
                stopOpacity: 0.3,
              }}
            />
            <stop
              offset="100%"
              style={{
                stopColor: isOutOfRange
                  ? "hsl(var(--destructive))"
                  : "hsl(var(--primary))",
                stopOpacity: 0,
              }}
            />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#chartGradient)" />

        {minThresholdY !== null && (
          <line
            x1="0"
            y1={minThresholdY}
            x2="100"
            y2={minThresholdY}
            stroke="hsl(var(--warning))"
            strokeWidth="0.35"
            strokeDasharray="2,2"
            vectorEffect="non-scaling-stroke"
          />
        )}
        {maxThresholdY !== null && (
          <line
            x1="0"
            y1={maxThresholdY}
            x2="100"
            y2={maxThresholdY}
            stroke="hsl(var(--destructive))"
            strokeWidth="0.35"
            strokeDasharray="2,2"
            vectorEffect="non-scaling-stroke"
          />
        )}

        <path
          d={pathData}
          fill="none"
          stroke={isOutOfRange ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
          strokeWidth="1.1"
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle
          cx={lastPoint.x}
          cy={lastPoint.y}
          r="1.9"
          fill={isOutOfRange ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
          className={isOutOfRange ? "animate-pulse" : ""}
        />
        </svg>
      </div>
      {hasXLabels ? (
        <div className="mt-1 grid text-muted-foreground" style={{ gridTemplateColumns: `repeat(${xLabels.length}, minmax(0, 1fr))` }}>
          {xLabels.map((label, index) => (
            <span
              key={`${label}-${index}`}
              className={cn(
                "text-[10px]",
                showDenseLabels ? "text-center" : index === 0 ? "text-left" : "text-right",
              )}
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
