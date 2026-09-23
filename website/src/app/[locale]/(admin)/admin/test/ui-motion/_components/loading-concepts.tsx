"use client";

import {
  Activity,
  Database,
  Droplets,
  Gauge,
  RadioTower,
  Server,
  Thermometer,
  Waves,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

export type LoaderConceptId =
  | "kinetic"
  | "morph"
  | "cards"
  | "graph"
  | "sensors"
  | "stream";

export interface LoaderConceptDefinition {
  id: LoaderConceptId;
  title: string;
  description: string;
  usage: string;
  preview: ReactNode;
}

interface LoaderMotionProps {
  speed: number;
}

const easeOut = [0.22, 1, 0.36, 1] as const;

function LoaderStage({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="relative flex min-h-72 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,hsl(var(--primary)/0.10),transparent_48%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(to bottom, black, transparent 90%)",
        }}
      />
      <div className="relative z-10 w-full p-6">{children}</div>
      <span className="absolute bottom-3 right-4 rounded-full border border-border/70 bg-background/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
        {label}
      </span>
    </div>
  );
}

function KineticTelemetryLoader({ speed }: LoaderMotionProps) {
  const t = useTranslations("testPages.uiMotion");
  const reduceMotion = useReducedMotion();
  const metrics = [
    { value: "2.8 °C", x: "12%", y: "16%" },
    { value: "48 %HR", x: "78%", y: "18%" },
    { value: "1 012 hPa", x: "8%", y: "72%" },
    { value: "419 ppm", x: "76%", y: "72%" },
  ];

  return (
    <LoaderStage label={t("loaders.kinetic.stage")}>
      <div className="relative mx-auto h-52 max-w-xl">
        <motion.div
          className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/25"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 9 * speed, repeat: Infinity, ease: "linear" }}
        >
          {[0, 1, 2, 3].map((index) => (
            <motion.div
              key={index}
              className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full border-2 border-background bg-primary shadow-[0_0_18px_hsl(var(--primary)/0.45)]"
              style={{
                transform: `rotate(${index * 90}deg) translateY(-88px)`,
                transformOrigin: "0 0",
              }}
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [0.85, 1.25, 0.85], opacity: [0.55, 1, 0.55] }
              }
              transition={{
                duration: 1.8 * speed,
                delay: index * 0.22,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[2rem] border border-primary/25 bg-card shadow-lg">
          <motion.div
            className="absolute inset-3 rounded-[1.45rem] bg-primary/10"
            animate={
              reduceMotion
                ? undefined
                : { borderRadius: ["28%", "48%", "34%", "28%"], rotate: [0, 45, 90, 180] }
            }
            transition={{ duration: 5 * speed, repeat: Infinity, ease: "easeInOut" }}
          />
          <Activity className="relative h-9 w-9 text-primary" />
        </div>

        {metrics.map((metric, index) => (
          <motion.div
            key={metric.value}
            className="absolute rounded-xl border border-border/70 bg-card/90 px-3 py-2 shadow-sm backdrop-blur"
            style={{ left: metric.x, top: metric.y }}
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, index % 2 === 0 ? -7 : 7, 0],
                    x: [0, index % 2 === 0 ? 4 : -4, 0],
                  }
            }
            transition={{
              duration: (2.6 + index * 0.2) * speed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="mb-1 h-1 w-10 rounded-full bg-primary/30" />
            <span className="text-xs font-semibold tabular-nums">{metric.value}</span>
          </motion.div>
        ))}

        <motion.div
          className="absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs text-muted-foreground"
          animate={reduceMotion ? undefined : { opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 1.6 * speed, repeat: Infinity }}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {t("loaders.kinetic.status")}
        </motion.div>
      </div>
    </LoaderStage>
  );
}

function MorphingSignalLoader({ speed }: LoaderMotionProps) {
  const t = useTranslations("testPages.uiMotion");
  const reduceMotion = useReducedMotion();
  const shapes = [
    "polygon(0% 0%, 50% 0%, 100% 0%, 100% 50%, 100% 100%, 50% 100%, 0% 100%, 0% 50%)",
    "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
    "polygon(50% 0%, 75% 25%, 100% 50%, 75% 75%, 50% 100%, 25% 75%, 0% 50%, 25% 25%)",
    "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
    "polygon(0% 0%, 50% 0%, 100% 0%, 100% 50%, 100% 100%, 50% 100%, 0% 100%, 0% 50%)",
  ];

  return (
    <LoaderStage label={t("loaders.morph.stage")}>
      <div className="mx-auto flex max-w-md flex-col items-center gap-7">
        <div className="relative flex h-40 w-40 items-center justify-center">
          {[0, 1, 2].map((ring) => (
            <motion.div
              key={ring}
              className="absolute rounded-full border border-primary/20"
              style={{ inset: 16 - ring * 14 }}
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [0.82, 1.1, 0.82], opacity: [0.15, 0.55, 0.15] }
              }
              transition={{
                duration: 2.7 * speed,
                delay: ring * 0.28,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
          <motion.div
            className="relative flex h-24 w-24 items-center justify-center bg-linear-to-br from-primary/85 to-cyan-400/75 text-primary-foreground shadow-[0_18px_55px_hsl(var(--primary)/0.25)]"
            style={{ clipPath: shapes[0] }}
            animate={
              reduceMotion
                ? undefined
                : {
                    clipPath: shapes,
                    rotate: [0, 0, 45, 0, 0],
                    scale: [0.92, 1, 0.96, 1, 0.92],
                  }
            }
            transition={{ duration: 4.8 * speed, repeat: Infinity, ease: "easeInOut" }}
          >
            <Waves className="h-9 w-9" />
          </motion.div>
        </div>

        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{t("loaders.morph.status")}</span>
            <motion.span
              className="font-mono text-muted-foreground"
              animate={reduceMotion ? undefined : { opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.4 * speed, repeat: Infinity }}
            >
              001101 · 010011
            </motion.span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-primary"
              animate={reduceMotion ? { width: "68%" } : { width: ["12%", "86%", "28%", "92%", "12%"] }}
              transition={{ duration: 4.8 * speed, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    </LoaderStage>
  );
}

function CardAssemblyLoader({ speed }: LoaderMotionProps) {
  const t = useTranslations("testPages.uiMotion");
  const reduceMotion = useReducedMotion();
  const cards = [
    { name: "CH-01", value: "3.8 °C", path: "M4 42 C20 30 28 48 42 35 S66 18 92 30" },
    { name: "CH-02", value: "-18.4 °C", path: "M4 30 C20 42 34 20 48 28 S70 48 92 22" },
    { name: "LAB-03", value: "21.6 °C", path: "M4 38 C16 22 30 26 44 32 S68 20 92 34" },
  ];

  return (
    <LoaderStage label={t("loaders.cards.stage")}>
      <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-3">
        {cards.map((card, index) => (
          <motion.div
            key={card.name}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.45 * speed,
              delay: index * 0.18 * speed,
              ease: easeOut,
            }}
          >
            <motion.div
              className="flex items-center justify-between bg-sidebar px-3 py-2 text-sidebar-foreground"
              initial={reduceMotion ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              style={{ transformOrigin: "left" }}
              transition={{
                duration: 0.42 * speed,
                delay: (0.12 + index * 0.18) * speed,
                ease: easeOut,
              }}
            >
              <span className="text-[10px] font-medium">{card.name}</span>
              <motion.span
                className="h-2 w-2 rounded-full bg-emerald-400"
                animate={reduceMotion ? undefined : { scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1.5 * speed, repeat: Infinity, delay: index * 0.15 }}
              />
            </motion.div>
            <div className="space-y-2 p-3">
              <motion.div
                className="text-lg font-semibold tabular-nums"
                initial={reduceMotion ? false : { opacity: 0, filter: "blur(6px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{
                  duration: 0.4 * speed,
                  delay: (0.32 + index * 0.18) * speed,
                }}
              >
                {card.value}
              </motion.div>
              <svg viewBox="0 0 96 56" className="h-14 w-full" aria-hidden="true">
                <line x1="0" y1="14" x2="96" y2="14" stroke="currentColor" className="text-red-500/35" strokeDasharray="4 3" />
                <line x1="0" y1="48" x2="96" y2="48" stroke="currentColor" className="text-blue-500/35" strokeDasharray="4 3" />
                <motion.path
                  d={card.path}
                  fill="none"
                  stroke="currentColor"
                  className="text-primary"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{
                    duration: 1.2 * speed,
                    delay: (0.5 + index * 0.2) * speed,
                    ease: "easeInOut",
                  }}
                />
              </svg>
              <div className="flex gap-1.5">
                {[42, 68, 52].map((width, rowIndex) => (
                  <motion.div
                    key={rowIndex}
                    className="h-1.5 rounded-full bg-muted"
                    style={{ width: `${width}%` }}
                    initial={reduceMotion ? false : { scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: 0.35 * speed,
                      delay: (0.72 + index * 0.15 + rowIndex * 0.08) * speed,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </LoaderStage>
  );
}

function GraphTraceLoader({ speed }: LoaderMotionProps) {
  const t = useTranslations("testPages.uiMotion");
  const reduceMotion = useReducedMotion();
  const path =
    "M18 112 C44 96 54 101 78 84 C100 68 111 78 132 63 C153 49 170 70 194 55 C218 39 232 44 254 31 C278 20 294 36 322 18";

  return (
    <LoaderStage label={t("loaders.graph.stage")}>
      <div className="mx-auto max-w-2xl rounded-2xl border border-border/80 bg-card/80 p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{t("loaders.graph.chart_title")}</p>
            <p className="text-xs text-muted-foreground">{t("loaders.graph.chart_subtitle")}</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            {t("loaders.graph.live")}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-border/70 bg-background">
          <svg viewBox="0 0 340 140" className="h-44 w-full" aria-hidden="true">
            {[28, 56, 84, 112].map((y) => (
              <line key={y} x1="18" y1={y} x2="322" y2={y} stroke="currentColor" className="text-border/70" strokeWidth="1" />
            ))}
            <motion.line
              x1="18"
              y1="46"
              x2="322"
              y2="46"
              stroke="currentColor"
              className="text-red-500/55"
              strokeWidth="1.5"
              strokeDasharray="6 5"
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7 * speed, ease: easeOut }}
            />
            <motion.line
              x1="18"
              y1="104"
              x2="322"
              y2="104"
              stroke="currentColor"
              className="text-blue-500/55"
              strokeWidth="1.5"
              strokeDasharray="6 5"
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.7 * speed, delay: 0.1 * speed, ease: easeOut }}
            />
            <motion.path
              d={path}
              fill="none"
              stroke="currentColor"
              className="text-primary"
              strokeWidth="3"
              strokeLinecap="round"
              initial={reduceMotion ? false : { pathLength: 0, opacity: 0.25 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 2.1 * speed,
                repeat: reduceMotion ? 0 : Infinity,
                repeatDelay: 0.8 * speed,
                ease: "easeInOut",
              }}
            />
            <motion.circle
              r="4"
              fill="currentColor"
              className="text-primary"
              initial={{ cx: 18, cy: 112, opacity: 0 }}
              animate={
                reduceMotion
                  ? { cx: 322, cy: 18, opacity: 1 }
                  : {
                      cx: [18, 78, 132, 194, 254, 322],
                      cy: [112, 84, 63, 55, 31, 18],
                      opacity: [0, 1, 1, 1, 1, 0],
                    }
              }
              transition={{
                duration: 2.1 * speed,
                repeat: reduceMotion ? 0 : Infinity,
                repeatDelay: 0.8 * speed,
                ease: "easeInOut",
              }}
            />
          </svg>

          <motion.div
            className="pointer-events-none absolute inset-y-0 w-20 bg-linear-to-r from-transparent via-primary/8 to-transparent"
            animate={reduceMotion ? undefined : { left: ["-20%", "110%"] }}
            transition={{ duration: 2.8 * speed, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    </LoaderStage>
  );
}

function SensorDiscoveryLoader({ speed }: LoaderMotionProps) {
  const t = useTranslations("testPages.uiMotion");
  const reduceMotion = useReducedMotion();
  const sensors = [
    { Icon: Thermometer, label: "T°", x: "8%", y: "12%" },
    { Icon: Droplets, label: "%HR", x: "79%", y: "10%" },
    { Icon: Gauge, label: "Pa", x: "5%", y: "67%" },
    { Icon: Waves, label: "CO₂", x: "82%", y: "68%" },
  ];

  return (
    <LoaderStage label={t("loaders.sensors.stage")}>
      <div className="relative mx-auto h-52 max-w-xl">
        <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl border border-primary/25 bg-card shadow-lg">
          <RadioTower className="h-9 w-9 text-primary" />
          {[0, 1, 2].map((ring) => (
            <motion.div
              key={ring}
              className="absolute rounded-full border border-primary/25"
              style={{ inset: 10 - ring * 10 }}
              animate={
                reduceMotion
                  ? undefined
                  : { scale: [0.45, 1.15], opacity: [0.7, 0] }
              }
              transition={{
                duration: 2.2 * speed,
                delay: ring * 0.5 * speed,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {sensors.map(({ Icon, label, x, y }, index) => (
          <motion.div
            key={label}
            className="absolute flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card shadow-sm"
            style={{ left: x, top: y }}
            initial={reduceMotion ? false : { opacity: 0.25, scale: 0.82 }}
            animate={
              reduceMotion
                ? { opacity: 1, scale: 1 }
                : { opacity: [0.3, 1, 1, 0.3], scale: [0.9, 1.08, 1, 0.9] }
            }
            transition={{
              duration: 3.2 * speed,
              delay: index * 0.55 * speed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-semibold">{label}</span>
          </motion.div>
        ))}

        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full border border-border bg-background/85 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
          <motion.span
            className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500"
            animate={reduceMotion ? undefined : { opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.2 * speed, repeat: Infinity }}
          />
          {t("loaders.sensors.status")}
        </div>
      </div>
    </LoaderStage>
  );
}

function MeasureStreamLoader({ speed }: LoaderMotionProps) {
  const t = useTranslations("testPages.uiMotion");
  const reduceMotion = useReducedMotion();
  const packets = [
    { value: "3.8°", top: 22, delay: 0 },
    { value: "48%", top: 62, delay: 0.55 },
    { value: "419", top: 102, delay: 1.1 },
    { value: "7.2", top: 142, delay: 1.65 },
  ];

  return (
    <LoaderStage label={t("loaders.stream.stage")}>
      <div className="relative mx-auto h-52 max-w-2xl overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-4">
        <div className="absolute left-5 top-1/2 flex -translate-y-1/2 flex-col gap-3">
          {[Thermometer, Droplets, Waves, Gauge].map((Icon, index) => (
            <div key={index} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background">
              <Icon className="h-4 w-4 text-primary" />
            </div>
          ))}
        </div>

        <div className="absolute left-18 right-28 top-0 h-full">
          {[36, 76, 116, 156].map((y) => (
            <div key={y} className="absolute left-0 right-0 h-px bg-border/65" style={{ top: y }} />
          ))}

          {packets.map((packet) => (
            <motion.div
              key={packet.value}
              className="absolute -left-2 rounded-md border border-primary/25 bg-primary/10 px-2 py-1 font-mono text-[10px] font-semibold text-primary"
              style={{ top: packet.top }}
              animate={
                reduceMotion
                  ? { left: "75%", opacity: 1 }
                  : { left: ["-5%", "82%"], opacity: [0, 1, 1, 0] }
              }
              transition={{
                duration: 2.6 * speed,
                delay: packet.delay * speed,
                repeat: Infinity,
                repeatDelay: 0.6 * speed,
                ease: "easeInOut",
              }}
            >
              {packet.value}
            </motion.div>
          ))}
        </div>

        <div className="absolute right-5 top-1/2 flex -translate-y-1/2 flex-col items-center gap-2">
          <motion.div
            className="flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/25 bg-background shadow-md"
            animate={
              reduceMotion
                ? undefined
                : { boxShadow: ["0 0 0 hsl(var(--primary)/0)", "0 0 34px hsl(var(--primary)/0.22)", "0 0 0 hsl(var(--primary)/0)"] }
            }
            transition={{ duration: 2.2 * speed, repeat: Infinity }}
          >
            <Database className="h-8 w-8 text-primary" />
          </motion.div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Server className="h-3 w-3" />
            {t("loaders.stream.target")}
          </div>
        </div>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 text-[10px] text-muted-foreground">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-primary"
            animate={reduceMotion ? undefined : { scale: [1, 1.5, 1] }}
            transition={{ duration: 1.1 * speed, repeat: Infinity }}
          />
          {t("loaders.stream.status")}
        </div>
      </div>
    </LoaderStage>
  );
}

export function useLoaderConcepts(speed: number): LoaderConceptDefinition[] {
  const t = useTranslations("testPages.uiMotion");

  return [
    {
      id: "kinetic",
      title: t("loaders.kinetic.title"),
      description: t("loaders.kinetic.description"),
      usage: t("loaders.kinetic.usage"),
      preview: <KineticTelemetryLoader speed={speed} />,
    },
    {
      id: "morph",
      title: t("loaders.morph.title"),
      description: t("loaders.morph.description"),
      usage: t("loaders.morph.usage"),
      preview: <MorphingSignalLoader speed={speed} />,
    },
    {
      id: "cards",
      title: t("loaders.cards.title"),
      description: t("loaders.cards.description"),
      usage: t("loaders.cards.usage"),
      preview: <CardAssemblyLoader speed={speed} />,
    },
    {
      id: "graph",
      title: t("loaders.graph.title"),
      description: t("loaders.graph.description"),
      usage: t("loaders.graph.usage"),
      preview: <GraphTraceLoader speed={speed} />,
    },
    {
      id: "sensors",
      title: t("loaders.sensors.title"),
      description: t("loaders.sensors.description"),
      usage: t("loaders.sensors.usage"),
      preview: <SensorDiscoveryLoader speed={speed} />,
    },
    {
      id: "stream",
      title: t("loaders.stream.title"),
      description: t("loaders.stream.description"),
      usage: t("loaders.stream.usage"),
      preview: <MeasureStreamLoader speed={speed} />,
    },
  ];
}
