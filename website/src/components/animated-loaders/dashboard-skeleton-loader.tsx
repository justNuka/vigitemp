"use client";

import { motion } from "motion/react";
import {
  MapPin,
  AlertTriangle,
  EyeOff,
  Activity,
  TrendingUp,
} from "lucide-react";

interface DashboardSkeletonLoaderProps {
  textToDisplay?: string;
  description?: string;
  speed?: number;
  showBrand?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Stat cards row (matches the 4 KPI cards from the real dashboard)  */
/* ------------------------------------------------------------------ */

const STAT_CARDS = [
  {
    label: "Lieux en surveillance",
    value: "766",
    icon: MapPin,
    gradient: "from-[#1e6fa0] to-[#26a5da]",
    iconBg: "bg-white/20",
  },
  {
    label: "Alarmes actives",
    value: "3",
    icon: AlertTriangle,
    gradient: "from-[#1e6fa0] to-[#c0392b]",
    iconBg: "bg-white/20",
  },
  {
    label: "Surveillance desactivee",
    value: "61",
    icon: EyeOff,
    gradient: "from-[#2c3e50] to-[#34495e]",
    iconBg: "bg-white/10",
  },
  {
    label: "Sondes en alerte",
    value: "19",
    icon: Activity,
    gradient: "from-[#2c3e50] to-[#e67e22]",
    iconBg: "bg-white/10",
  },
];

function StatCard({
  card,
  index,
  speed,
}: {
  card: (typeof STAT_CARDS)[0];
  index: number;
  speed: number;
}) {
  const Icon = card.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.3 + index * 0.1,
        ease: [0.23, 1, 0.32, 1],
      }}
      className={`relative overflow-hidden rounded-xl bg-linear-to-br ${card.gradient} p-4 text-white`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs text-white/70 leading-tight">{card.label}</p>
          <motion.p
            className="text-2xl font-bold tabular-nums"
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.5 + index * 0.15 }}
          >
            {card.value}
          </motion.p>
        </div>
        <div className={`rounded-full p-2 ${card.iconBg}`}>
          <Icon className="h-5 w-5 text-white/80" />
        </div>
      </div>
      {/* shimmer sweep */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)",
        }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{
          duration: 2.5 * speed,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.3,
          repeatDelay: 2,
        }}
      />
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Alarm table rows (matches the real alarm table layout)            */
/* ------------------------------------------------------------------ */

const ALARM_ROWS = [
  {
    type: "down",
    location: "IFB - PURPAN",
    probe: "68101000886 PII 215",
    value: "-21.8 \u00b0C",
    consignes: "Sup: 30 \u00b0C / Inf: 0 \u00b0C",
    triggered: "il y a 2 mois",
  },
  {
    type: "down",
    location: "PTA - RANGUEIL",
    probe: "Armoire68102000093",
    value: "0.0 C",
    consignes: "Sup: 30 C / Inf: 0 C",
    triggered: "il y a 2 mois",
  },
  {
    type: "down",
    location: "PTA - RANGUEIL",
    probe: "Ambiance PTA Hemato",
    value: "0.0 C",
    consignes: "Sup: 30 C / Inf: 0 C",
    triggered: "il y a 2 mois",
  },
];

function AlarmRow({
  row,
  index,
  speed,
}: {
  row: (typeof ALARM_ROWS)[0];
  index: number;
  speed: number;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: 0.8 + index * 0.15,
        ease: [0.23, 1, 0.32, 1],
      }}
      className="border-b border-border/50 last:border-0"
    >
      <td className="py-2.5 px-3">
        <motion.span
          className="text-muted-foreground"
          animate={{ y: [0, -1, 0] }}
          transition={{
            duration: 2 * speed,
            repeat: Infinity,
            delay: index * 0.3,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="text-muted-foreground"
          >
            <path
              d="M7 3v5M7 10v1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </motion.span>
      </td>
      <td className="py-2.5 px-3">
        <div className="text-xs font-medium text-foreground">{row.location}</div>
        <div className="text-[10px] text-muted-foreground">{row.probe}</div>
      </td>
      <td className="py-2.5 px-3 text-right">
        <motion.span
          className="text-xs font-mono font-semibold text-foreground tabular-nums"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{
            duration: 2 * speed,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        >
          {row.value}
        </motion.span>
      </td>
      <td className="py-2.5 px-3 text-right">
        <span className="text-[10px] text-muted-foreground font-mono">
          {row.consignes}
        </span>
      </td>
      <td className="py-2.5 px-3 text-center">
        <span className="text-[10px] text-muted-foreground">{row.triggered}</span>
      </td>
      <td className="py-2.5 px-3 text-center">
        <motion.span
          className="inline-flex items-center rounded-full bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:text-red-400"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{
            duration: 2 * speed,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        >
          Active
        </motion.span>
      </td>
      <td className="py-2.5 px-3 text-center">
        <span className="inline-flex items-center rounded-md border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-foreground">
          Acquitter
        </span>
      </td>
    </motion.tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Trend chart placeholder (right panel)                             */
/* ------------------------------------------------------------------ */

function TrendPanel({ speed }: { speed: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
      className="rounded-lg border border-border bg-card p-4 flex flex-col"
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-foreground">
          Tendance des alarmes
        </span>
      </div>
      <div className="text-[10px] text-muted-foreground mb-4">Dernieres 24h</div>
      {/* Animated mini chart lines */}
      <div className="flex-1 flex items-end gap-1 min-h-15">
        {Array.from({ length: 12 }, (_, i) => (
          <motion.div
            key={i}
            className="flex-1 rounded-t"
            style={{ backgroundColor: "hsl(var(--primary) / 0.2)" }}
            animate={{
              height: [
                `${10 + Math.random() * 20}%`,
                `${30 + Math.random() * 50}%`,
                `${10 + Math.random() * 30}%`,
              ],
            }}
            transition={{
              duration: 3 * speed,
              repeat: Infinity,
              delay: i * 0.12,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">0 alarme(s)</span>
        <motion.span
          className="text-[10px] text-primary font-medium cursor-default"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2 * speed, repeat: Infinity }}
        >
          {"Details \u2192"}
        </motion.span>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function DashboardSkeletonLoader({
  textToDisplay = "Chargement du tableau de bord",
  description = "Vue d'ensemble de la surveillance",
  speed = 1,
  showBrand = true,
  className = "",
}: DashboardSkeletonLoaderProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-lg border border-border bg-card shadow-sm ${className}`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          {showBrand && (
            <span className="text-xs font-mono text-muted-foreground tracking-wider">
              Vigi<span className="font-bold text-foreground">Sensys</span>
            </span>
          )}
          <div className="h-3 w-px bg-border" />
          <motion.span
            className="text-sm font-semibold text-foreground"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
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

      {/* Content */}
      <div className="p-4 space-y-5">
        {/* Stat cards row */}
        <div className="grid grid-cols-4 gap-3">
          {STAT_CARDS.map((card, i) => (
            <StatCard key={card.label} card={card} index={i} speed={speed} />
          ))}
        </div>

        {/* Alarmes actives section */}
        <div>
          <motion.div
            className="flex items-center justify-between mb-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-semibold text-foreground">
                Alarmes actives
              </span>
              <span className="inline-flex items-center justify-center h-5 min-w-5 rounded-full bg-red-500 text-[10px] font-bold text-white px-1.5">
                3
              </span>
            </div>
            <motion.span
              className="text-xs text-muted-foreground cursor-default"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2 * speed, repeat: Infinity }}
            >
              {"Toutes les alarmes \u2192"}
            </motion.span>
          </motion.div>

          {/* Table + Trend side by side */}
          <div className="grid grid-cols-[1fr_200px] gap-3">
            {/* Alarm table */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="rounded-lg border border-border bg-background overflow-hidden"
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-sidebar text-sidebar-foreground">
                    <th className="py-2 px-3 text-left text-[10px] font-semibold uppercase tracking-wider w-8">
                      Type
                    </th>
                    <th className="py-2 px-3 text-left text-[10px] font-semibold uppercase tracking-wider">
                      Lieu / Sonde
                    </th>
                    <th className="py-2 px-3 text-right text-[10px] font-semibold uppercase tracking-wider">
                      Valeur
                    </th>
                    <th className="py-2 px-3 text-right text-[10px] font-semibold uppercase tracking-wider">
                      Consignes
                    </th>
                    <th className="py-2 px-3 text-center text-[10px] font-semibold uppercase tracking-wider">
                      Declenchee
                    </th>
                    <th className="py-2 px-3 text-center text-[10px] font-semibold uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="py-2 px-3 text-center text-[10px] font-semibold uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ALARM_ROWS.map((row, i) => (
                    <AlarmRow
                      key={row.probe}
                      row={row}
                      index={i}
                      speed={speed}
                    />
                  ))}
                </tbody>
              </table>
            </motion.div>

            {/* Trend panel */}
            <TrendPanel speed={speed} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <motion.div
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: "hsl(var(--primary))" }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[10px] font-mono text-muted-foreground">
            Licence : One
          </span>
        </div>
        <div className="w-20 h-1 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: "hsl(var(--primary) / 0.5)" }}
            animate={{ width: ["0%", "100%", "0%"] }}
            transition={{
              duration: 3 * speed,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>

      {/* Global shimmer */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.02) 50%, transparent 100%)",
        }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{
          duration: 3 * speed,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1,
        }}
      />
    </div>
  );
}
