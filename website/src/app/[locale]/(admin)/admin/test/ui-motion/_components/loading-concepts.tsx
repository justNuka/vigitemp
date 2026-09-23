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
import { motion } from "motion/react";
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

const EASE = [0.22, 1, 0.36, 1] as const;

function MotionStage({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  const t = useTranslations("testPages.uiMotion");

  return (
    <div className="relative min-h-[330px] overflow-hidden rounded-2xl border border-slate-800 bg-[#07131f] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.055) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-sky-500/8 to-transparent" />
      <motion.div
        className="pointer-events-none absolute inset-y-0 w-28 bg-linear-to-r from-transparent via-cyan-300/5 to-transparent"
        animate={{ x: ["-40%", "900%"] }}
        transition={{ duration: 5.2, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative z-10 flex min-h-[330px] flex-col">
        <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,.7)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.23em] text-slate-400">
              {t("lab_label")}
            </span>
          </div>
          <span className="rounded-full border border-white/8 bg-white/3 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-400">
            {label}
          </span>
        </div>
        <div className="relative flex flex-1 items-center justify-center p-5 md:p-7">
          {children}
        </div>
      </div>
    </div>
  );
}

function KineticTelemetryLoader({ speed }: LoaderMotionProps) {
  const t = useTranslations("testPages.uiMotion");
  const tokens = [
    {
      label: "°C",
      x: [-92, 0, 92, 0, -92],
      y: [0, -64, 0, 64, 0],
      radius: ["28%", "50%", "28%", "50%", "28%"],
    },
    {
      label: "%HR",
      x: [0, 92, 0, -92, 0],
      y: [-64, 0, 64, 0, -64],
      radius: ["50%", "24%", "50%", "24%", "50%"],
    },
    {
      label: "Pa",
      x: [92, 0, -92, 0, 92],
      y: [0, 64, 0, -64, 0],
      radius: ["24%", "50%", "24%", "50%", "24%"],
    },
    {
      label: "ppm",
      x: [0, -92, 0, 92, 0],
      y: [64, 0, -64, 0, 64],
      radius: ["50%", "28%", "50%", "28%", "50%"],
    },
  ];

  return (
    <MotionStage label={t("loaders.kinetic.stage")}>
      <div className="relative h-56 w-full max-w-xl">
        <svg
          viewBox="0 0 520 230"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <motion.rect
            x="162"
            y="18"
            width="196"
            height="194"
            rx="72"
            fill="none"
            stroke="rgba(56,189,248,.20)"
            strokeWidth="1"
            strokeDasharray="7 8"
            animate={{ rotate: [0, 90, 180, 270, 360] }}
            style={{ transformOrigin: "260px 115px" }}
            transition={{ duration: 12 * speed, repeat: Infinity, ease: "linear" }}
          />
          <motion.path
            d="M168 115 H352 M260 23 V207"
            stroke="rgba(56,189,248,.16)"
            strokeWidth="1"
            strokeDasharray="3 7"
            animate={{ opacity: [0.25, 0.8, 0.25] }}
            transition={{ duration: 2.4 * speed, repeat: Infinity }}
          />
        </svg>

        <div className="absolute left-1/2 top-1/2 h-0 w-0">
          {tokens.map((token, index) => (
            <motion.div
              key={token.label}
              className="absolute -left-7 -top-7 flex h-14 w-14 items-center justify-center border border-cyan-300/35 bg-[#0b2030] text-[10px] font-semibold text-cyan-100 shadow-[0_0_28px_rgba(14,165,233,.16)]"
              animate={{
                x: token.x,
                y: token.y,
                rotate: [0, 90, 180, 270, 360],
                borderRadius: token.radius,
                scale: [0.92, 1.08, 0.96, 1.04, 0.92],
              }}
              transition={{
                duration: 5.2 * speed,
                delay: index * 0.08,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {token.label}
            </motion.div>
          ))}
        </div>

        <motion.div
          className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[2rem] border border-cyan-300/30 bg-[#0b1e2c] shadow-[0_0_55px_rgba(14,165,233,.13)]"
          animate={{
            boxShadow: [
              "0 0 24px rgba(14,165,233,.08)",
              "0 0 58px rgba(14,165,233,.22)",
              "0 0 24px rgba(14,165,233,.08)",
            ],
          }}
          transition={{ duration: 2.6 * speed, repeat: Infinity }}
        >
          <motion.div
            className="absolute inset-3 rounded-[1.45rem] border border-white/6"
            animate={{ rotate: [0, 180, 360], borderRadius: ["30%", "48%", "30%"] }}
            transition={{ duration: 6 * speed, repeat: Infinity, ease: "easeInOut" }}
          />
          <Activity className="relative mb-1 h-6 w-6 text-cyan-300" />
          <motion.span
            className="relative text-xl font-semibold tabular-nums"
            animate={{ opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 1.5 * speed, repeat: Infinity }}
          >
            23,4
          </motion.span>
          <span className="relative text-[9px] uppercase tracking-[0.16em] text-slate-500">
            {t("loaders.kinetic.sample")}
          </span>
        </motion.div>

        {[0, 1, 2, 3, 4, 5].map((index) => (
          <motion.span
            key={index}
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-sky-300"
            animate={{
              x: [
                Math.cos(index) * 35,
                Math.cos(index + 1.4) * 118,
                Math.cos(index + 2.8) * 35,
              ],
              y: [
                Math.sin(index) * 35,
                Math.sin(index + 1.4) * 86,
                Math.sin(index + 2.8) * 35,
              ],
              opacity: [0, 0.9, 0],
            }}
            transition={{
              duration: 2.4 * speed,
              delay: index * 0.24,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <motion.div
          className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.18em] text-slate-500"
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.8 * speed, repeat: Infinity }}
        >
          {t("loaders.kinetic.status")}
        </motion.div>
      </div>
    </MotionStage>
  );
}

function MorphingSignalLoader({ speed }: LoaderMotionProps) {
  const t = useTranslations("testPages.uiMotion");
  const shapes = [
    "polygon(50% 0%, 86% 13%, 100% 50%, 86% 87%, 50% 100%, 14% 87%, 0% 50%, 14% 13%)",
    "polygon(24% 0%, 76% 0%, 100% 24%, 100% 76%, 76% 100%, 24% 100%, 0% 76%, 0% 24%)",
    "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%, 18% 50%, 50% 18%, 82% 50%, 50% 82%)",
    "polygon(24% 0%, 76% 0%, 100% 24%, 100% 76%, 76% 100%, 24% 100%, 0% 76%, 0% 24%)",
    "polygon(50% 0%, 86% 13%, 100% 50%, 86% 87%, 50% 100%, 14% 87%, 0% 50%, 14% 13%)",
  ];

  return (
    <MotionStage label={t("loaders.morph.stage")}>
      <div className="grid w-full max-w-2xl items-center gap-8 md:grid-cols-[1fr_1.1fr]">
        <div className="relative mx-auto flex h-52 w-52 items-center justify-center">
          {[0, 1, 2].map((ring) => (
            <motion.div
              key={ring}
              className="absolute rounded-full border border-cyan-300/15"
              style={{ inset: 17 + ring * 18 }}
              animate={{
                scale: [0.86, 1.22, 0.86],
                opacity: [0.1, 0.65 - ring * 0.12, 0.1],
              }}
              transition={{
                duration: (2.5 + ring * 0.35) * speed,
                delay: ring * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          <motion.div
            className="relative flex h-28 w-28 items-center justify-center bg-linear-to-br from-sky-400 to-cyan-300 text-[#07131f] shadow-[0_0_55px_rgba(34,211,238,.24)]"
            style={{ clipPath: shapes[0] }}
            animate={{
              clipPath: shapes,
              rotate: [0, 18, 45, 72, 90],
              scale: [0.96, 1.05, 0.92, 1.04, 0.96],
            }}
            transition={{ duration: 5 * speed, repeat: Infinity, ease: "easeInOut" }}
          >
            <Waves className="h-9 w-9" />
          </motion.div>

          {[0, 1, 2, 3].map((index) => (
            <motion.span
              key={index}
              className="absolute h-2 w-2 rounded-full bg-cyan-300"
              animate={{
                x: [
                  Math.cos(index * 1.57) * 52,
                  Math.cos(index * 1.57 + 2.1) * 88,
                  Math.cos(index * 1.57 + 4.2) * 52,
                ],
                y: [
                  Math.sin(index * 1.57) * 52,
                  Math.sin(index * 1.57 + 2.1) * 88,
                  Math.sin(index * 1.57 + 4.2) * 52,
                ],
                scale: [0.5, 1.15, 0.5],
                opacity: [0.25, 1, 0.25],
              }}
              transition={{
                duration: 3.4 * speed,
                delay: index * 0.28,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <div className="space-y-5">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300/80">
              {t("loaders.morph.status")}
            </p>
            <div className="flex items-end gap-2">
              <motion.span
                className="text-4xl font-light tracking-tight text-white"
                animate={{ opacity: [0.55, 1, 0.55] }}
                transition={{ duration: 2 * speed, repeat: Infinity }}
              >
                010110
              </motion.span>
              <span className="pb-1 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                {t("loaders.morph.telemetry")}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {[
              [t("loaders.morph.metrics.signal"), "78%"],
              [t("loaders.morph.metrics.decode"), "54%"],
              [t("loaders.morph.metrics.buffer"), "91%"],
            ].map(([name, width], index) => (
              <div key={name}>
                <div className="mb-1 flex justify-between text-[10px] uppercase tracking-[0.14em] text-slate-500">
                  <span>{name}</span>
                  <span>{width}</span>
                </div>
                <div className="h-1 overflow-hidden rounded-full bg-white/6">
                  <motion.div
                    className="h-full rounded-full bg-linear-to-r from-sky-500 to-cyan-300"
                    animate={{
                      width: [
                        String(20 + index * 9) + "%",
                        width,
                        String(35 + index * 7) + "%",
                        width,
                        String(20 + index * 9) + "%",
                      ],
                    }}
                    transition={{
                      duration: (4.2 + index * 0.35) * speed,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MotionStage>
  );
}

function CardAssemblyLoader({ speed }: LoaderMotionProps) {
  const t = useTranslations("testPages.uiMotion");
  const cards = [
    { x: 14, value: "3,8", unit: "°C", path: "M8 74 C38 55 54 68 80 49 S126 31 154 45" },
    { x: 182, value: "-18,4", unit: "°C", path: "M8 53 C33 70 58 34 83 45 S128 68 154 32" },
    { x: 350, value: "48,2", unit: "%HR", path: "M8 65 C36 42 61 48 88 57 S126 38 154 51" },
  ];

  return (
    <MotionStage label={t("loaders.cards.stage")}>
      <div className="w-full max-w-[560px]">
        <svg viewBox="0 0 520 222" className="w-full" aria-hidden="true">
          {cards.map((card, index) => (
            <g key={card.x} transform={"translate(" + card.x + " 18)"}>
              <motion.rect
                x="0"
                y="0"
                width="156"
                height="184"
                rx="14"
                fill="rgba(8,24,36,.72)"
                stroke="rgba(125,211,252,.28)"
                strokeWidth="1.3"
                initial={{ pathLength: 0, opacity: 0.3 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: 0.7 * speed,
                  delay: index * 0.22 * speed,
                  ease: EASE,
                }}
              />
              <motion.rect
                x="0"
                y="0"
                width="156"
                height="44"
                rx="14"
                fill="rgba(14,165,233,.10)"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                style={{ transformOrigin: "left center" }}
                transition={{
                  duration: 0.55 * speed,
                  delay: (0.2 + index * 0.22) * speed,
                  ease: EASE,
                }}
              />
              <motion.circle
                cx="133"
                cy="22"
                r="4"
                fill="#34d399"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.5, 1], opacity: 1 }}
                transition={{
                  duration: 0.5 * speed,
                  delay: (0.45 + index * 0.22) * speed,
                }}
              />
              <motion.text
                x="14"
                y="26"
                fill="#cbd5e1"
                fontSize="8"
                fontWeight="600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (0.38 + index * 0.22) * speed }}
              >
                {"CH-" + String(index + 1).padStart(2, "0")}
              </motion.text>

              <motion.text
                x="14"
                y="72"
                fill="#f8fafc"
                fontSize="22"
                fontWeight="600"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: (0.56 + index * 0.22) * speed,
                  duration: 0.4 * speed,
                }}
              >
                {card.value}
              </motion.text>
              <motion.text
                x="74"
                y="72"
                fill="#64748b"
                fontSize="9"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (0.7 + index * 0.22) * speed }}
              >
                {card.unit}
              </motion.text>

              <line x1="10" y1="90" x2="146" y2="90" stroke="rgba(239,68,68,.28)" strokeDasharray="4 4" />
              <line x1="10" y1="144" x2="146" y2="144" stroke="rgba(59,130,246,.30)" strokeDasharray="4 4" />
              <motion.path
                d={card.path}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                strokeLinecap="round"
                transform="translate(0 62)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{
                  duration: 1.25 * speed,
                  delay: (0.75 + index * 0.22) * speed,
                  ease: "easeInOut",
                }}
              />
              {[0, 1, 2].map((row) => (
                <motion.rect
                  key={row}
                  x="14"
                  y={158 + row * 8}
                  width={row === 0 ? 82 : row === 1 ? 108 : 65}
                  height="3"
                  rx="1.5"
                  fill="rgba(148,163,184,.25)"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  style={{ transformOrigin: "left center" }}
                  transition={{
                    duration: 0.36 * speed,
                    delay: (1.08 + index * 0.22 + row * 0.08) * speed,
                  }}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>
    </MotionStage>
  );
}

function GraphTraceLoader({ speed }: LoaderMotionProps) {
  const t = useTranslations("testPages.uiMotion");
  const path =
    "M34 152 C66 133 82 145 110 122 C137 99 158 115 184 94 C211 73 236 91 261 64 C286 38 318 57 350 32 C378 12 404 31 438 18";

  return (
    <MotionStage label={t("loaders.graph.stage")}>
      <div className="w-full max-w-[690px] rounded-2xl border border-white/8 bg-[#091825]/88 p-4 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,.7)]" />
              <p className="text-xs font-semibold text-slate-100">
                {t("loaders.graph.chart_title")}
              </p>
            </div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
              {t("loaders.graph.chart_subtitle")}
            </p>
          </div>
          <motion.span
            className="rounded-md border border-cyan-300/15 bg-cyan-300/5 px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-cyan-300"
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 1.4 * speed, repeat: Infinity }}
          >
            {t("loaders.graph.live")}
          </motion.span>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-white/6 bg-[#06121c]">
          <svg viewBox="0 0 470 184" className="h-48 w-full" aria-hidden="true">
            {[34, 70, 106, 142].map((y) => (
              <line
                key={y}
                x1="30"
                y1={y}
                x2="446"
                y2={y}
                stroke="rgba(148,163,184,.10)"
              />
            ))}
            {[76, 160, 244, 328, 412].map((x) => (
              <line
                key={x}
                x1={x}
                y1="18"
                x2={x}
                y2="164"
                stroke="rgba(148,163,184,.06)"
              />
            ))}

            <motion.line
              x1="30"
              y1="47"
              x2="446"
              y2="47"
              stroke="rgba(248,113,113,.52)"
              strokeWidth="1.2"
              strokeDasharray="6 6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.65 * speed, ease: EASE }}
            />
            <motion.line
              x1="30"
              y1="146"
              x2="446"
              y2="146"
              stroke="rgba(96,165,250,.52)"
              strokeWidth="1.2"
              strokeDasharray="6 6"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.65 * speed, delay: 0.08 * speed, ease: EASE }}
            />

            <motion.path
              d={path}
              fill="none"
              stroke="rgba(56,189,248,.16)"
              strokeWidth="9"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 3.4 * speed,
                times: [0, 0.55, 0.86, 1],
                repeat: Infinity,
                repeatDelay: 0.55 * speed,
                ease: "easeInOut",
              }}
            />
            <motion.path
              d={path}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.4"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 3.4 * speed,
                times: [0, 0.55, 0.86, 1],
                repeat: Infinity,
                repeatDelay: 0.55 * speed,
                ease: "easeInOut",
              }}
            />

            {[34, 110, 184, 261, 350, 438].map((x, index) => {
              const ys = [152, 122, 94, 64, 32, 18];
              return (
                <motion.circle
                  key={x}
                  cx={x}
                  cy={ys[index]}
                  r="3.2"
                  fill="#67e8f9"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.5, 1, 0], opacity: [0, 1, 1, 0] }}
                  transition={{
                    duration: 3.4 * speed,
                    delay: index * 0.14 * speed,
                    times: [0, 0.2, 0.75, 1],
                    repeat: Infinity,
                    repeatDelay: 0.55 * speed,
                  }}
                />
              );
            })}
          </svg>

          <motion.div
            className="pointer-events-none absolute inset-y-0 w-20 border-r border-cyan-300/12 bg-linear-to-r from-transparent via-cyan-300/8 to-transparent"
            animate={{ left: ["-18%", "110%"] }}
            transition={{ duration: 2.6 * speed, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    </MotionStage>
  );
}

function SensorDiscoveryLoader({ speed }: LoaderMotionProps) {
  const t = useTranslations("testPages.uiMotion");
  const nodes = [
    { Icon: Thermometer, label: "TEMP", x: 74, y: 52 },
    { Icon: Droplets, label: "HUM", x: 426, y: 52 },
    { Icon: Gauge, label: "PRES", x: 74, y: 196 },
    { Icon: Waves, label: "CO₂", x: 426, y: 196 },
  ];

  return (
    <MotionStage label={t("loaders.sensors.stage")}>
      <div className="relative h-[245px] w-full max-w-[520px]">
        <svg
          viewBox="0 0 520 245"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          {nodes.map((node, index) => (
            <motion.line
              key={node.label}
              x1="260"
              y1="122"
              x2={node.x}
              y2={node.y}
              stroke="rgba(56,189,248,.26)"
              strokeWidth="1.2"
              strokeDasharray="5 6"
              animate={{ strokeDashoffset: [0, -44] }}
              transition={{
                duration: (2 + index * 0.1) * speed,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
          {[46, 78, 108].map((radius, index) => (
            <motion.circle
              key={radius}
              cx="260"
              cy="122"
              r={radius}
              fill="none"
              stroke="rgba(34,211,238,.16)"
              strokeWidth="1"
              animate={{
                r: [radius * 0.82, radius * 1.14, radius * 0.82],
                opacity: [0.12, 0.48 - index * 0.08, 0.12],
              }}
              transition={{
                duration: (2.4 + index * 0.35) * speed,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </svg>

        <motion.div
          className="absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-55"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(34,211,238,.22), rgba(34,211,238,0) 18%, rgba(34,211,238,0) 100%)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3.4 * speed, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[1.8rem] border border-cyan-300/30 bg-[#0a2130] shadow-[0_0_45px_rgba(34,211,238,.12)]"
          animate={{ scale: [0.98, 1.025, 0.98] }}
          transition={{ duration: 2 * speed, repeat: Infinity }}
        >
          <RadioTower className="mb-1 h-7 w-7 text-cyan-300" />
          <span className="text-[9px] uppercase tracking-[0.18em] text-slate-400">
            {t("loaders.sensors.hub")}
          </span>
        </motion.div>

        {nodes.map(({ Icon, label, x, y }, index) => (
          <motion.div
            key={label}
            className="absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-[#091b29] shadow-lg"
            style={{ left: x, top: y }}
            animate={{
              borderColor: [
                "rgba(255,255,255,.10)",
                "rgba(103,232,249,.55)",
                "rgba(255,255,255,.10)",
              ],
              boxShadow: [
                "0 10px 24px rgba(0,0,0,.15)",
                "0 0 28px rgba(34,211,238,.18)",
                "0 10px 24px rgba(0,0,0,.15)",
              ],
              scale: [0.96, 1.06, 0.96],
            }}
            transition={{
              duration: 2.6 * speed,
              delay: index * 0.55 * speed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon className="h-5 w-5 text-cyan-300" />
            <span className="text-[9px] font-semibold tracking-[0.12em] text-slate-300">
              {label}
            </span>
          </motion.div>
        ))}

        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.18em] text-slate-500"
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.5 * speed, repeat: Infinity }}
        >
          {t("loaders.sensors.status")}
        </motion.div>
      </div>
    </MotionStage>
  );
}

function MeasureStreamLoader({ speed }: LoaderMotionProps) {
  const t = useTranslations("testPages.uiMotion");
  const streams = [
    { Icon: Thermometer, value: "3.8°C", y: 42, delay: 0 },
    { Icon: Droplets, value: "48.2%", y: 96, delay: 0.45 },
    { Icon: Waves, value: "419ppm", y: 150, delay: 0.9 },
  ];

  return (
    <MotionStage label={t("loaders.stream.stage")}>
      <div className="relative h-[245px] w-full max-w-[650px]">
        <div className="absolute inset-y-4 left-4 flex w-28 flex-col justify-around">
          {streams.map(({ Icon, value }, index) => (
            <motion.div
              key={value}
              className="flex items-center gap-2 rounded-xl border border-white/8 bg-[#0a1d2b] px-3 py-2"
              animate={{ x: [0, 4, 0] }}
              transition={{
                duration: 2.4 * speed,
                delay: index * 0.3,
                repeat: Infinity,
              }}
            >
              <Icon className="h-4 w-4 text-cyan-300" />
              <span className="text-[10px] font-semibold text-slate-300">{value}</span>
            </motion.div>
          ))}
        </div>

        <div className="absolute bottom-5 left-36 right-32 top-5 rounded-2xl border border-white/6 bg-[#06121c]/80">
          {[52, 106, 160].map((y) => (
            <div
              key={y}
              className="absolute left-0 right-0 h-px bg-white/6"
              style={{ top: y }}
            />
          ))}

          {streams.map((stream) => (
            <motion.div
              key={stream.value}
              className="absolute left-0 rounded-md border border-cyan-300/25 bg-cyan-300/10 px-2 py-1 font-mono text-[9px] font-semibold text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,.08)]"
              style={{ top: stream.y - 14 }}
              animate={{
                x: ["-18%", "235%"],
                opacity: [0, 1, 1, 0],
                scale: [0.86, 1, 1, 0.9],
              }}
              transition={{
                duration: 2.5 * speed,
                delay: stream.delay * speed,
                repeat: Infinity,
                repeatDelay: 0.55 * speed,
                ease: "easeInOut",
              }}
            >
              {stream.value}
            </motion.div>
          ))}

          <motion.div
            className="absolute inset-y-0 w-12 bg-linear-to-r from-transparent via-cyan-300/7 to-transparent"
            animate={{ left: ["-10%", "110%"] }}
            transition={{ duration: 3 * speed, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <motion.div
          className="absolute right-4 top-1/2 flex h-28 w-24 -translate-y-1/2 flex-col items-center justify-center rounded-[1.7rem] border border-cyan-300/22 bg-[#0a1d2b] shadow-[0_0_35px_rgba(14,165,233,.10)]"
          animate={{
            boxShadow: [
              "0 0 18px rgba(14,165,233,.05)",
              "0 0 42px rgba(14,165,233,.18)",
              "0 0 18px rgba(14,165,233,.05)",
            ],
          }}
          transition={{ duration: 2.2 * speed, repeat: Infinity }}
        >
          <Database className="mb-2 h-8 w-8 text-cyan-300" />
          <Server className="absolute -right-2 -top-2 h-5 w-5 rounded-md border border-white/10 bg-[#07131f] p-1 text-slate-400" />
          <span className="text-center text-[9px] uppercase tracking-[0.14em] text-slate-400">
            {t("loaders.stream.target")}
          </span>
        </motion.div>

        <motion.div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.18em] text-slate-500"
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 1.4 * speed, repeat: Infinity }}
        >
          {t("loaders.stream.status")}
        </motion.div>
      </div>
    </MotionStage>
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
