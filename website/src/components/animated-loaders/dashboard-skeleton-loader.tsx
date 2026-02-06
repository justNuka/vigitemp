"use client";

import { motion } from "motion/react";

interface DashboardSkeletonLoaderProps {
  /** Main status text */
  textToDisplay?: string;
  /** Description text */
  description?: string;
  /** Number of metric cards to show (2-6) */
  cardCount?: number;
  /** Speed multiplier (lower = faster). Default 1 */
  speed?: number;
  /** Show brand mark */
  showBrand?: boolean;
  /** Additional className for the wrapper */
  className?: string;
}

const METRIC_LABELS = [
  "Temperature",
  "Atm. Pressure",
  "Diff. Pressure",
  "CO2 Level",
  "Humidity",
  "Air Quality",
];

const METRIC_UNITS = ["\u00b0C", "hPa", "\u0394Pa", "ppm", "%RH", "AQI"];

function ShimmerBar({
  delay,
  width,
  height = "h-2",
  speed,
}: {
  delay: number;
  width: string;
  height?: string;
  speed: number;
}) {
  return (
    <motion.div
      className={`${height} rounded bg-muted ${width}`}
      animate={{ opacity: [0.3, 0.7, 0.3] }}
      transition={{
        duration: 1.8 * speed,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

function GaugeArc({ index, speed }: { index: number; speed: number }) {
  const circumference = Math.PI * 32;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="76" height="42" viewBox="0 0 76 42" className="overflow-visible">
        <path
          d="M 6 38 A 32 32 0 0 1 70 38"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <motion.path
          d="M 6 38 A 32 32 0 0 1 70 38"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: [
              circumference,
              circumference * (0.3 + Math.random() * 0.3),
              circumference * (0.2 + Math.random() * 0.4),
              circumference,
            ],
            opacity: [0.2, 0.7, 0.5, 0.2],
          }}
          transition={{
            duration: 4 * speed,
            repeat: Infinity,
            delay: index * 0.4,
            ease: "easeInOut",
          }}
        />
      </svg>
    </div>
  );
}

function MetricCard({ index, speed }: { index: number; speed: number }) {
  const label = METRIC_LABELS[index % METRIC_LABELS.length];
  const unit = METRIC_UNITS[index % METRIC_UNITS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.12,
        ease: [0.23, 1, 0.32, 1],
      }}
      className="relative overflow-hidden rounded-lg border border-border bg-background p-4 flex flex-col items-center gap-3"
    >
      <GaugeArc index={index} speed={speed} />

      <div className="flex items-baseline gap-1">
        <ShimmerBar delay={index * 0.15} width="w-12" height="h-5" speed={speed} />
        <span className="text-[10px] font-mono text-muted-foreground">{unit}</span>
      </div>

      <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
        {label}
      </span>

      <motion.div
        className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: "hsl(var(--primary) / 0.6)" }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2 * speed, repeat: Infinity, delay: index * 0.2 }}
      />

      {/* Shimmer sweep */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.03) 50%, transparent 100%)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: 2.5 * speed,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.3,
          repeatDelay: 1,
        }}
      />
    </motion.div>
  );
}

function ChartSkeleton({ speed }: { speed: number }) {
  const barCount = 12;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="relative overflow-hidden rounded-lg border border-border bg-background p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <ShimmerBar delay={0} width="w-28" height="h-3" speed={speed} />
        <ShimmerBar delay={0.1} width="w-16" height="h-3" speed={speed} />
      </div>
      <div className="flex items-end gap-1.5 h-24">
        {Array.from({ length: barCount }, (_, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t"
            style={{ backgroundColor: "hsl(var(--primary) / 0.15)" }}
            animate={{
              height: [
                `${20 + Math.random() * 30}%`,
                `${40 + Math.random() * 50}%`,
                `${20 + Math.random() * 40}%`,
              ],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3 * speed,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between mt-3">
        <ShimmerBar delay={0.2} width="w-10" height="h-2" speed={speed} />
        <ShimmerBar delay={0.3} width="w-10" height="h-2" speed={speed} />
      </div>

      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.02) 50%, transparent 100%)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: 2.5 * speed,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1,
        }}
      />
    </motion.div>
  );
}

export default function DashboardSkeletonLoader({
  textToDisplay = "Loading dashboard",
  description = "Fetching latest sensor telemetry...",
  cardCount = 4,
  speed = 1,
  showBrand = true,
  className = "",
}: DashboardSkeletonLoaderProps) {
  const clampedCount = Math.min(6, Math.max(2, cardCount));

  return (
    <div className={`relative overflow-hidden rounded-lg border border-border bg-card shadow-sm ${className}`}>
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
            transition={{ duration: 0.4 }}
          >
            {textToDisplay}
          </motion.span>
        </div>
        <motion.span
          className="text-[10px] font-mono text-muted-foreground"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {description}
        </motion.span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${Math.min(clampedCount, 3)}, 1fr)`,
          }}
        >
          {Array.from({ length: clampedCount }, (_, i) => (
            <MetricCard key={i} index={i} speed={speed} />
          ))}
        </div>
        <ChartSkeleton speed={speed} />
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <motion.div
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "hsl(var(--primary))" }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-[10px] font-mono text-muted-foreground">
              {clampedCount} probes
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "hsl(var(--primary) / 0.6)" }}
            />
            <span className="text-[10px] font-mono text-muted-foreground">Polling</span>
          </div>
        </div>
        <div className="w-20 h-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: "hsl(var(--primary) / 0.5)" }}
            animate={{ width: ["0%", "100%", "0%"] }}
            transition={{ duration: 3 * speed, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}
