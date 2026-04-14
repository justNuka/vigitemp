"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

interface SensorStreamLoaderProps {
  /** Main status text displayed at the top */
  textToDisplay?: string;
  /** Secondary description below the title */
  description?: string;
  /** Number of skeleton rows to show */
  rowCount?: number;
  /** Speed multiplier (lower = faster). Default 1 */
  speed?: number;
  /** Whether to show the VigiSensys brand */
  showBrand?: boolean;
  /** Additional className for the wrapper */
  className?: string;
}

const SENSOR_LABELS = [
  "TEMP_SENSOR_01",
  "PRES_ATM_02",
  "PRES_DIFF_03",
  "CO2_SENSOR_04",
  "HUMID_SENSOR_05",
  "TEMP_SENSOR_06",
  "PRES_ATM_07",
  "CO2_SENSOR_08",
  "HUMID_SENSOR_09",
  "TEMP_SENSOR_10",
  "PRES_DIFF_11",
  "CO2_SENSOR_12",
];

const SENSOR_UNITS = [
  "\u00b0C",
  "hPa",
  "\u0394Pa",
  "ppm",
  "%RH",
  "\u00b0C",
  "hPa",
  "ppm",
  "%RH",
  "\u00b0C",
  "\u0394Pa",
  "ppm",
];

function deterministicFraction(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function generateRandomValue(index: number): string {
  const ranges: [number, number][] = [
    [18, 26],
    [1010, 1025],
    [0.2, 5.8],
    [380, 520],
    [35, 65],
    [20, 28],
    [1008, 1022],
    [400, 480],
    [40, 60],
    [19, 25],
    [0.1, 4.5],
    [390, 510],
  ];
  const [min, max] = ranges[index % ranges.length];
  const val = min + deterministicFraction(index + 1) * (max - min);
  return val < 10 ? val.toFixed(2) : val < 100 ? val.toFixed(1) : val.toFixed(0);
}

export default function SensorStreamLoader({
  textToDisplay = "Initializing sensors",
  description = "Establishing connection with monitoring probes...",
  rowCount = 8,
  speed = 1,
  showBrand = true,
  className = "",
}: SensorStreamLoaderProps) {
  const [visibleRows, setVisibleRows] = useState(0);
  const [activeRow, setActiveRow] = useState(-1);
  const [dots, setDots] = useState("");

  const rows = useMemo(
    () =>
      Array.from({ length: rowCount }, (_, i) => ({
        label: SENSOR_LABELS[i % SENSOR_LABELS.length],
        value: generateRandomValue(i),
        unit: SENSOR_UNITS[i % SENSOR_UNITS.length],
        status: deterministicFraction((i + 1) * 7) > 0.15 ? "OK" : "WARN",
      })),
    [rowCount],
  );

  const skeletonWidths = useMemo(
    () =>
      Array.from({ length: rowCount }, (_, i) => {
        const firstColumn = `${60 + deterministicFraction((i + 1) * 13) * 30}%`;
        return [firstColumn, "60%", "40%", "50%"];
      }),
    [rowCount],
  );

  useEffect(() => {
    if (visibleRows >= rowCount) {
      const resetTimer = setTimeout(
        () => {
          setVisibleRows(0);
          setActiveRow(-1);
        },
        2000 * speed,
      );
      return () => clearTimeout(resetTimer);
    }

    const timer = setTimeout(
      () => {
        setActiveRow(visibleRows);
        setVisibleRows((v) => v + 1);
      },
      (180 + deterministicFraction((visibleRows + 1) * 17) * 120) * speed,
    );
    return () => clearTimeout(timer);
  }, [visibleRows, rowCount, speed]);

  useEffect(() => {
    const interval = setInterval(
      () => {
        setDots((d) => (d.length >= 3 ? "" : d + "."));
      },
      500 * speed,
    );
    return () => clearInterval(interval);
  }, [speed]);

  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border bg-card shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          {showBrand && (
            <span className="text-xs font-mono text-muted-foreground tracking-wider">
              Vigi<span className="font-bold text-foreground">Sensys</span>
            </span>
          )}
          <div className="h-3 w-px bg-border" />
          <motion.span
            className="text-xs font-mono text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {textToDisplay}
            {dots}
          </motion.span>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: "hsl(var(--primary))" }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[10px] font-mono text-primary uppercase">
            Live
          </span>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_100px_50px_60px] gap-2 px-4 py-2 border-b border-border/50">
        {["Probe ID", "Value", "Unit", "Status"].map((h) => (
          <span
            key={h}
            className={`text-[10px] font-mono text-muted-foreground uppercase tracking-widest ${h !== "Probe ID" ? "text-right" : ""}`}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="px-4 py-1">
        <AnimatePresence mode="popLayout">
          {rows.slice(0, visibleRows).map((row, i) => (
            <motion.div
              key={`${row.label}-${i}`}
              initial={{ opacity: 0, x: -12, filter: "blur(4px)" }}
              animate={{
                opacity: i === activeRow ? 1 : 0.6,
                x: 0,
                filter: "blur(0px)",
              }}
              exit={{ opacity: 0, x: 12, filter: "blur(4px)" }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="grid grid-cols-[1fr_100px_50px_60px] gap-2 py-1.5 border-b border-border/30 last:border-0"
            >
              <span className="text-xs font-mono text-foreground">{row.label}</span>
              <motion.span
                className="text-xs font-mono text-foreground text-right tabular-nums"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {row.value}
              </motion.span>
              <span className="text-xs font-mono text-muted-foreground text-right">{row.unit}</span>
              <div className="flex items-center justify-end gap-1">
                <div
                  className={`h-1.5 w-1.5 rounded-full ${row.status === "OK" ? "bg-emerald-500" : "bg-amber-500"}`}
                />
                <span
                  className={`text-[10px] font-mono ${row.status === "OK" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}
                >
                  {row.status}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Skeleton placeholder rows */}
        {Array.from({ length: Math.max(0, rowCount - visibleRows) }, (_, i) => (
          <div
            key={`skeleton-${i}`}
            className="grid grid-cols-[1fr_100px_50px_60px] gap-2 py-1.5 border-b border-border/30 last:border-0"
          >
            {(skeletonWidths[i] ?? ["70%", "60%", "40%", "50%"]).map((w, j) => (
              <motion.div
                key={j}
                className={`h-3 rounded bg-muted ${j > 0 ? "ml-auto" : ""}`}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1 + j * 0.05,
                }}
                style={{ width: w }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Footer progress */}
      <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground">{description}</span>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: "hsl(var(--primary) / 0.6)" }}
              animate={{ width: ["0%", "100%"] }}
              transition={{
                duration: 3 * speed,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
            {visibleRows}/{rowCount}
          </span>
        </div>
      </div>

      {/* Shimmer overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.03) 50%, transparent 100%)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: 2 * speed,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 0.5,
        }}
      />
    </div>
  );
}
