"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

interface DataFeedLoaderProps {
  /** Main status text displayed at the top */
  textToDisplay?: string;
  /** Number of visible lines in the feed window */
  maxVisibleLines?: number;
  /** Speed multiplier (lower = faster). Default 1 */
  speed?: number;
  /** Show brand mark */
  showBrand?: boolean;
  /** Additional className for the wrapper */
  className?: string;
}

type LogLevel = "INFO" | "DATA" | "WARN" | "OK" | "INIT";

interface LogLine {
  id: number;
  timestamp: string;
  level: LogLevel;
  message: string;
}

const LOG_MESSAGES: { level: LogLevel; message: string }[] = [
  { level: "INIT", message: "Connecting to probe network..." },
  { level: "OK", message: "Connection established [192.168.1.40]" },
  { level: "INFO", message: "Requesting sensor manifest..." },
  { level: "DATA", message: "TEMP_01: 22.4\u00b0C | status: nominal" },
  { level: "DATA", message: "PRES_ATM_02: 1013.2 hPa | status: nominal" },
  { level: "DATA", message: "CO2_04: 412 ppm | status: nominal" },
  { level: "DATA", message: "HUMID_05: 48.7 %RH | status: nominal" },
  { level: "WARN", message: "PRES_DIFF_03: 6.2 \u0394Pa | threshold exceeded" },
  { level: "INFO", message: "Calibration check in progress..." },
  { level: "OK", message: "Calibration nominal for 11/12 probes" },
  { level: "DATA", message: "TEMP_06: 21.8\u00b0C | status: nominal" },
  { level: "DATA", message: "CO2_08: 445 ppm | status: nominal" },
  { level: "INFO", message: "Aggregating telemetry batch #0042..." },
  { level: "DATA", message: "HUMID_09: 52.1 %RH | status: nominal" },
  { level: "OK", message: "Batch #0042 committed to datastore" },
  { level: "DATA", message: "PRES_ATM_07: 1011.8 hPa | status: nominal" },
  { level: "WARN", message: "TEMP_10: 27.9\u00b0C | approaching upper limit" },
  { level: "INFO", message: "Scheduling next acquisition cycle..." },
  { level: "DATA", message: "PRES_DIFF_11: 3.1 \u0394Pa | status: nominal" },
  { level: "OK", message: "All systems operational" },
];

const LEVEL_STYLES: Record<LogLevel, { text: string; bg: string }> = {
  INFO: {
    text: "text-primary",
    bg: "bg-primary/10",
  },
  DATA: {
    text: "text-muted-foreground",
    bg: "bg-muted",
  },
  WARN: {
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
  OK: {
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  INIT: {
    text: "text-primary",
    bg: "bg-primary/10",
  },
};

function getTimestamp(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}.${String(now.getMilliseconds()).padStart(3, "0")}`;
}

export default function DataFeedLoader({
  textToDisplay = "Sensor data feed",
  maxVisibleLines = 10,
  speed = 1,
  showBrand = true,
  className = "",
}: DataFeedLoaderProps) {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [dots, setDots] = useState("");
  const lineIdRef = useRef(0);
  const messageIndexRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLine = useCallback(() => {
    const msg = LOG_MESSAGES[messageIndexRef.current % LOG_MESSAGES.length];
    messageIndexRef.current++;
    lineIdRef.current++;

    const newLine: LogLine = {
      id: lineIdRef.current,
      timestamp: getTimestamp(),
      level: msg.level,
      message: msg.message,
    };

    setLines((prev) => {
      const next = [...prev, newLine];
      if (next.length > maxVisibleLines + 5) {
        return next.slice(-maxVisibleLines);
      }
      return next;
    });
  }, [maxVisibleLines]);

  useEffect(() => {
    const interval = setInterval(
      () => addLine(),
      (400 + Math.random() * 300) * speed,
    );
    return () => clearInterval(interval);
  }, [addLine, speed]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

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
      {/* Terminal header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
          </div>
          <div className="h-3 w-px bg-border" />
          {showBrand && (
            <span className="text-[10px] font-mono text-muted-foreground tracking-wider">
              Vigi<span className="font-bold text-foreground">Sensys</span>
            </span>
          )}
        </div>
        <motion.span
          className="text-[10px] font-mono text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {textToDisplay}
          {dots}
        </motion.span>
      </div>

      {/* Log body */}
      <div
        ref={scrollRef}
        className="overflow-hidden font-mono text-xs leading-relaxed"
        style={{ height: `${maxVisibleLines * 28}px` }}
      >
        <div className="px-3 py-2">
          <AnimatePresence initial={false}>
            {lines.map((line) => {
              const style = LEVEL_STYLES[line.level];
              return (
                <motion.div
                  key={line.id}
                  initial={{ opacity: 0, y: 8, filter: "blur(3px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                  className="flex items-start gap-2 py-0.5"
                >
                  <span className="text-[10px] text-muted-foreground/40 w-5 text-right tabular-nums shrink-0 select-none">
                    {line.id}
                  </span>
                  <span className="text-muted-foreground/50 shrink-0 tabular-nums">
                    {line.timestamp}
                  </span>
                  <span
                    className={`shrink-0 rounded px-1 py-px text-[10px] font-semibold ${style.text} ${style.bg}`}
                  >
                    {line.level.padEnd(4)}
                  </span>
                  <span className="text-card-foreground/80 break-all">
                    {line.message}
                    {line.id === lines[lines.length - 1]?.id && (
                      <motion.span
                        className="inline-block w-1.5 h-3 ml-0.5 translate-y-px"
                        style={{ backgroundColor: "hsl(var(--primary) / 0.6)" }}
                        animate={{ opacity: [1, 0] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          repeatType: "reverse",
                        }}
                      />
                    )}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-emerald-500"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <span className="text-[10px] font-mono text-muted-foreground">Connected</span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
          {lines.length} events
        </span>
      </div>

      {/* Scan line */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 h-px"
        style={{ backgroundColor: "hsl(var(--primary) / 0.06)" }}
        animate={{ top: ["0%", "100%"] }}
        transition={{ duration: 3 * speed, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
