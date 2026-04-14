"use client";

import React from "react"

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Clipboard,
  Power,
  BellOff,
  MapPin,
  Settings,
  RefreshCw,
  Activity,
} from "lucide-react";

interface SurveillanceLoaderProps {
  textToDisplay?: string;
  description?: string;
  speed?: number;
  showBrand?: boolean;
  className?: string;
}

function pseudoRandom(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

/* ------------------------------------------------------------------ */
/*  Mini chart (draws a temperature line with dashed alarm thresholds) */
/* ------------------------------------------------------------------ */

function MiniChart({
  index,
  speed,
  hasData,
}: {
  index: number;
  speed: number;
  hasData: boolean;
}) {
  const points = useMemo(() => {
    if (!hasData) return [];
    const pts: { x: number; y: number }[] = [];
    const baseTemp = -20 + pseudoRandom(index + 1) * 55;
    for (let i = 0; i <= 20; i++) {
      const localJitter = pseudoRandom((index + 1) * 100 + i) * 8;
      pts.push({
        x: (i / 20) * 100,
        y: 50 + (baseTemp > 10 ? -1 : 1) * (Math.sin(i * 0.8 + index) * 15 + localJitter),
      });
    }
    return pts;
  }, [index, hasData]);

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const highThreshold = 20 + pseudoRandom(index + 201) * 15;
  const lowThreshold = 65 + pseudoRandom(index + 301) * 15;

  return (
    <div className="w-full h-16 relative">
      {hasData ? (
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          {/* High alarm threshold (red dashed) */}
          <motion.line
            x1="0" y1={highThreshold} x2="100" y2={highThreshold}
            stroke="#ef4444"
            strokeWidth="0.8"
            strokeDasharray="3 2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
          />
          {/* Low alarm threshold (blue dashed) */}
          <motion.line
            x1="0" y1={lowThreshold} x2="100" y2={lowThreshold}
            stroke="#3b82f6"
            strokeWidth="0.8"
            strokeDasharray="3 2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
          />
          {/* Data line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 1.5 * speed,
              delay: 0.4 + index * 0.15,
              ease: "easeInOut",
            }}
          />
        </svg>
      ) : (
        <div className="flex items-center justify-center h-full">
          <motion.span
            className="text-[10px] text-muted-foreground italic"
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2 * speed, repeat: Infinity }}
          >
            Aucune mesure disponible
          </motion.span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sensor card (mimics the real surveillance card layout)            */
/* ------------------------------------------------------------------ */

const SENSOR_SITES = [
  { name: "PTA BIOCH, PTA HEMATO et HCV", group: "RG-PTA-BIOCH", probe: "Armoire68102000093", hasData: false },
  { name: "Site inconnu", group: "IFB / N2 / 215/ SBMGC1", probe: "68101000886 PII 215", hasData: true, temp: "-21,85\u00b0C", date: "06/12/2025 13:24", freq: "20 min", delay: "180 min" },
  { name: "PTA BIOCH, PTA HEMATO et HCV", group: "RG-PTA-BIOCH", probe: "68102000473", hasData: true, temp: "1,87\u00b0C", date: "08/12/2025 22:57", freq: "20 min", delay: "60 min" },
  { name: "Site inconnu", group: "IFB / N2 / 251 / BACT", probe: "68102000074 PII 251", hasData: true, temp: "1,78\u00b0C", date: "08/12/2025 22:54", freq: "20 min", delay: "180 min" },
  { name: "Site inconnu", group: "IFB / N-1 / PIIA15 / HLA", probe: "1076937 PII A15", hasData: true, temp: "1,25C", date: "08/12/2025 22:52", freq: "20 min", delay: "180 min" },
];

const DISABLED_SITES = [
  { name: "PTA BIOCH, PTA HEMATO et HCV", group: "RG-PTA-BIOCH", probe: "P 501" },
  { name: "Site inconnu", group: "IFB / N2 / 215/ SBMGC2", probe: "68101000954 PII 215" },
  { name: "Site inconnu", group: "IFB / BIOTH / PTI VIRO DD", probe: "3204092 PIJ A07" },
];

function CardActionIcons({ isActive }: { isActive: boolean }) {
  const iconClass = `h-3.5 w-3.5 ${isActive ? "text-red-400" : "text-muted-foreground/60"}`;
  return (
    <div className="flex items-center gap-3 pt-2 border-t border-border/30">
      <Clipboard className="h-3.5 w-3.5 text-muted-foreground/60" />
      <Power className="h-3.5 w-3.5 text-muted-foreground/60" />
      <BellOff className={iconClass} />
      <MapPin className="h-3.5 w-3.5 text-muted-foreground/60" />
      <Settings className="h-3.5 w-3.5 text-muted-foreground/60" />
    </div>
  );
}

function SensorCard({
  site,
  index,
  speed,
  isActive,
}: {
  site: (typeof SENSOR_SITES)[0];
  index: number;
  speed: number;
  isActive: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: 0.3 + index * 0.12,
        ease: [0.23, 1, 0.32, 1],
      }}
      className="relative overflow-hidden rounded-lg border border-border bg-card"
    >
      {/* Card header - dark blue like the real app */}
      <div className="bg-sidebar text-sidebar-foreground p-3 pb-2.5 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5 min-w-0 flex-1">
            <p className="text-[10px] text-sidebar-foreground/70 truncate leading-tight">
              {site.name}
            </p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate">
              {site.group}
            </p>
            <motion.p
              className="text-sm font-bold text-sidebar-foreground truncate mt-1"
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
            >
              {site.probe}
            </motion.p>
          </div>
          {isActive && (
            <motion.div
              className="shrink-0 ml-2"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4 * speed, repeat: Infinity, ease: "linear" }}
            >
              <Activity className="h-4 w-4 text-primary" />
            </motion.div>
          )}
          {!isActive && (
            <BellOff className="h-4 w-4 text-amber-400/70 shrink-0 ml-2" />
          )}
        </div>
        {!isActive && (
          <motion.span
            className="inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-[9px] font-medium text-amber-400 mt-1.5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + index * 0.1 }}
          >
            Surveillance desactivee
          </motion.span>
        )}
      </div>

      {/* Card body */}
      <div className="p-3 space-y-2">
        {isActive ? (
          <>
            <MiniChart index={index} speed={speed} hasData={site.hasData} />
            {site.hasData && (
              <motion.div
                className="space-y-0.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + index * 0.15 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {"Derniere mesure : "}
                  </span>
                  <motion.span
                    className="text-[10px] font-mono font-semibold text-foreground tabular-nums"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{
                      duration: 2 * speed,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  >
                    {site.temp}
                  </motion.span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">{site.date}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[9px] text-muted-foreground/70">
                    {"Freq : "}{site.freq}
                  </span>
                  <span className="text-[9px] text-muted-foreground/70">
                    {"Retard alarme : "}{site.delay}
                  </span>
                </div>
              </motion.div>
            )}
          </>
        ) : (
          <motion.p
            className="text-xs text-muted-foreground py-2"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 2 * speed, repeat: Infinity }}
          >
            Surveillance desactivee
          </motion.p>
        )}
        <CardActionIcons isActive={isActive} />
      </div>

      {/* Shimmer */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.03) 50%, transparent 100%)",
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
/*  Filters bar                                                       */
/* ------------------------------------------------------------------ */

function FiltersBar({ speed }: { speed: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className="space-y-3"
    >
      {/* Dropdowns */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5">
          <span className="text-[10px] font-semibold text-foreground">Sites</span>
          <span className="text-[10px] text-muted-foreground flex-1">
            Tous les sites
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5">
          <span className="text-[10px] font-semibold text-foreground">Groupes</span>
          <span className="text-[10px] text-muted-foreground flex-1">
            Tous les groupes
          </span>
        </div>
      </div>

      {/* Toggle + legend */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <motion.span
            className="rounded-l-md bg-primary px-3 py-1 text-[10px] font-semibold text-primary-foreground"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2 * speed, repeat: Infinity }}
          >
            Graphiques
          </motion.span>
          <span className="rounded-r-md border border-border bg-background px-3 py-1 text-[10px] text-muted-foreground">
            Arborescence
          </span>
        </div>
        <div className="flex items-center gap-3">
          {[
            { color: "bg-red-500", label: "Alarme haute" },
            { color: "bg-blue-500", label: "Alarme basse" },
            { color: "bg-emerald-500", label: "OK" },
            { color: "bg-gray-400", label: "Desactivee" },
          ].map((legend) => (
            <div key={legend.label} className="flex items-center gap-1">
              <div className={`h-1.5 w-1.5 rounded-full ${legend.color}`} />
              <span className="text-[9px] text-muted-foreground">{legend.label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section header                                                    */
/* ------------------------------------------------------------------ */

function SectionHeader({
  icon,
  title,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  delay: number;
}) {
  return (
    <motion.div
      className="flex items-center gap-2 mb-3"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {icon}
      <span className="text-sm font-semibold text-foreground">{title}</span>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

export default function SurveillanceLoader({
  textToDisplay = "Chargement de la surveillance",
  description = "Suivi en temps réel des lieux surveillés et de leurs mesures",
  speed = 1,
  showBrand = true,
  className = "",
}: SurveillanceLoaderProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

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
            className="text-sm font-semibold text-foreground"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {textToDisplay}
          </motion.span>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2 * speed, repeat: Infinity }}
          >
            <RefreshCw className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Actualiser</span>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-5">
        <FiltersBar speed={speed} />

        {/* Section: Disabled surveillance */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.5 }}
            >
              <SectionHeader
                icon={<BellOff className="h-4 w-4 text-amber-500" />}
                title="Lieux avec surveillance desactivee"
                delay={0}
              />
              <div className="grid grid-cols-3 gap-3">
                {DISABLED_SITES.map((site, i) => (
                  <SensorCard
                    key={site.probe}
                    site={{ ...site, hasData: false }}
                    index={i}
                    speed={speed}
                    isActive={false}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section: Active surveillance */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.5 }}
            >
              <SectionHeader
                icon={<Activity className="h-4 w-4 text-primary" />}
                title="Lieux en surveillance"
                delay={0}
              />
              <div className="grid grid-cols-3 gap-3">
                {SENSOR_SITES.map((site, i) => (
                  <SensorCard
                    key={site.probe}
                    site={site}
                    index={i + DISABLED_SITES.length}
                    speed={speed}
                    isActive={true}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-2.5 flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground">{description}</span>
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
            "linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.015) 50%, transparent 100%)",
        }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{
          duration: 3.5 * speed,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1,
        }}
      />
    </div>
  );
}
