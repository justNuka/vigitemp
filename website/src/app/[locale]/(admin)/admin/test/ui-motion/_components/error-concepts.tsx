"use client";

import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Check,
  CircleHelp,
  CloudOff,
  Cpu,
  Database,
  Home,
  Network,
  RefreshCw,
  Router,
  Server,
  Settings,
  Thermometer,
  Wrench,
  X,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useCallback, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ErrorConceptId = "404" | "500" | "maintenance" | "network";

export interface ErrorConceptDefinition {
  id: ErrorConceptId;
  title: string;
  description: string;
  usage: string;
  preview: ReactNode;
}

interface ErrorPreviewFrameProps {
  eyebrow: string;
  code: string;
  title: string;
  description: string;
  accent?: "primary" | "amber" | "red";
  actions?: ReactNode;
  illustration: ReactNode;
  footer?: ReactNode;
}

const accentClasses = {
  primary: {
    code: "text-primary",
    glow: "bg-primary/15",
    border: "border-primary/20",
  },
  amber: {
    code: "text-amber-500",
    glow: "bg-amber-500/15",
    border: "border-amber-500/20",
  },
  red: {
    code: "text-red-500",
    glow: "bg-red-500/15",
    border: "border-red-500/20",
  },
};

function ErrorPreviewFrame({
  eyebrow,
  code,
  title,
  description,
  accent = "primary",
  actions,
  illustration,
  footer,
}: ErrorPreviewFrameProps) {
  const palette = accentClasses[accent];

  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-2xl border border-border bg-linear-to-br from-background via-background to-muted/35">
      <div className={cn("pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full blur-3xl", palette.glow)} />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(circle at center, black, transparent 74%)",
        }}
      />

      <div className="relative z-10 grid min-h-[430px] items-center gap-8 p-6 md:grid-cols-[0.9fr_1.1fr] md:p-9">
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card">
              VS
            </span>
            {eyebrow}
          </div>
          <div className="space-y-2">
            <div className={cn("text-6xl font-black tracking-tighter md:text-7xl", palette.code)}>
              {code}
            </div>
            <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          {footer ? <div>{footer}</div> : null}
        </div>

        <div className={cn("relative min-h-72 overflow-hidden rounded-3xl border bg-card/70 p-5 shadow-xl backdrop-blur", palette.border)}>
          {illustration}
        </div>
      </div>
    </div>
  );
}

function LostSensorScene() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative h-full min-h-64">
      <div className="absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/20" />
      <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/15" />

      <motion.div
        className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-3xl border border-primary/25 bg-background shadow-lg"
        animate={reduceMotion ? undefined : { rotate: [-2, 2, -2], y: [0, -4, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Network className="h-8 w-8 text-primary" />
      </motion.div>

      {[0, 1, 2].map((index) => {
        const positions = [
          { left: "12%", top: "20%" },
          { left: "72%", top: "16%" },
          { left: "18%", top: "72%" },
        ];
        return (
          <motion.div
            key={index}
            className="absolute flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-background shadow-sm"
            style={positions[index]}
            animate={
              reduceMotion
                ? undefined
                : { scale: [0.95, 1.06, 0.95], opacity: [0.55, 1, 0.55] }
            }
            transition={{ duration: 2.4, delay: index * 0.35, repeat: Infinity }}
          >
            <Activity className="h-5 w-5 text-emerald-500" />
          </motion.div>
        );
      })}

      <motion.div
        className="absolute right-[4%] top-[62%] flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/8 shadow-sm"
        animate={
          reduceMotion
            ? undefined
            : { x: [0, 14, 7, 0], y: [0, -9, 5, 0], rotate: [0, 8, -5, 0] }
        }
        transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Thermometer className="h-6 w-6 text-red-500" />
      </motion.div>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 420 260" aria-hidden="true">
        <motion.path
          d="M210 132 C280 130 305 150 356 190"
          fill="none"
          stroke="currentColor"
          className="text-red-500/45"
          strokeWidth="2"
          strokeDasharray="7 7"
          animate={reduceMotion ? undefined : { strokeDashoffset: [0, -28] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
      </svg>

      <motion.div
        className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-border bg-background/90 px-3 py-1 text-[11px] text-muted-foreground"
        animate={reduceMotion ? undefined : { opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 1.8, repeat: Infinity }}
      >
        route introuvable
      </motion.div>
    </div>
  );
}

function ServerIncidentScene() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative h-full min-h-64">
      <div className="absolute inset-x-5 top-6 grid grid-cols-3 gap-3">
        {[Server, Cpu, Database].map((Icon, index) => (
          <motion.div
            key={index}
            className="flex h-20 items-center justify-center rounded-2xl border border-border bg-background/80"
            animate={
              reduceMotion
                ? undefined
                : {
                    y: [0, index === 1 ? 5 : -3, 0],
                    opacity: index === 1 ? [1, 0.55, 1] : [0.75, 1, 0.75],
                  }
            }
            transition={{ duration: 2.6 + index * 0.25, repeat: Infinity, ease: "easeInOut" }}
          >
            <Icon className={cn("h-7 w-7", index === 1 ? "text-red-500" : "text-primary")} />
          </motion.div>
        ))}
      </div>

      <svg className="absolute inset-x-4 bottom-8 h-36 w-[calc(100%-2rem)]" viewBox="0 0 380 120" aria-hidden="true">
        <motion.path
          d="M8 66 C40 66 56 38 82 66 S124 95 149 66 L172 66 L181 38 L191 92 L201 20 L213 102 L224 66 L250 66 C278 66 290 38 318 66 S352 66 372 66"
          fill="none"
          stroke="currentColor"
          className="text-red-500"
          strokeWidth="3"
          strokeLinecap="round"
          initial={reduceMotion ? false : { pathLength: 0.1, opacity: 0.35 }}
          animate={
            reduceMotion
              ? { pathLength: 1, opacity: 1 }
              : { pathLength: [0.15, 1, 1], opacity: [0.35, 1, 0.7] }
          }
          transition={{ duration: 2.4, repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }}
        />
      </svg>

      <motion.div
        className="absolute bottom-4 right-5 flex items-center gap-2 rounded-full border border-red-500/25 bg-red-500/8 px-3 py-1 text-[11px] font-medium text-red-500"
        animate={reduceMotion ? undefined : { scale: [1, 1.03, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        incident applicatif
      </motion.div>
    </div>
  );
}

function MaintenanceScene() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative flex h-full min-h-64 items-center justify-center">
      <motion.div
        className="absolute h-44 w-44 rounded-full border border-dashed border-amber-500/25"
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute -top-4 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-xl border border-amber-500/25 bg-background">
          <Wrench className="h-4 w-4 text-amber-500" />
        </div>
        <div className="absolute -bottom-4 left-1/2 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-xl border border-amber-500/25 bg-background">
          <Settings className="h-4 w-4 text-amber-500" />
        </div>
      </motion.div>

      <motion.div
        className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] border border-amber-500/25 bg-background shadow-lg"
        animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Thermometer className="h-12 w-12 text-primary" />
        <motion.div
          className="absolute -right-3 -top-3 flex h-9 w-9 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10"
          animate={reduceMotion ? undefined : { rotate: [0, 18, -12, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Wrench className="h-4 w-4 text-amber-500" />
        </motion.div>
      </motion.div>

      <div className="absolute bottom-4 left-1/2 w-48 -translate-x-1/2">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-amber-500"
            animate={reduceMotion ? { width: "62%" } : { width: ["18%", "74%", "48%", "88%", "18%"] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}

type DiagnosticStatus = "idle" | "running" | "ok" | "error";

interface DiagnosticCheck {
  id: "browser" | "origin" | "api";
  label: string;
  status: DiagnosticStatus;
  detail?: string;
}

async function networkProbe(url: string, timeoutMs = 4000) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = performance.now();

  try {
    const response = await fetch(url, {
      method: "HEAD",
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    });
    return {
      reachable: true,
      latency: Math.max(1, Math.round(performance.now() - startedAt)),
      status: response.status,
    };
  } catch {
    return {
      reachable: false,
      latency: Math.max(1, Math.round(performance.now() - startedAt)),
      status: null,
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function NetworkDiagnosticScene() {
  const t = useTranslations("testPages.uiMotion");
  const reduceMotion = useReducedMotion();
  const makeChecks = useCallback(
    (): DiagnosticCheck[] => [
      { id: "browser", label: t("errors.network.checks.browser"), status: "idle" },
      { id: "origin", label: t("errors.network.checks.origin"), status: "idle" },
      { id: "api", label: t("errors.network.checks.api"), status: "idle" },
    ],
    [t],
  );
  const [checks, setChecks] = useState<DiagnosticCheck[]>(() => makeChecks());
  const [running, setRunning] = useState(false);

  const updateCheck = useCallback(
    (id: DiagnosticCheck["id"], patch: Partial<DiagnosticCheck>) => {
      setChecks((current) =>
        current.map((check) => (check.id === id ? { ...check, ...patch } : check)),
      );
    },
    [],
  );

  const runDiagnostic = useCallback(async () => {
    setRunning(true);
    setChecks(makeChecks());

    updateCheck("browser", { status: "running" });
    await new Promise((resolve) => window.setTimeout(resolve, 220));
    const browserOnline = navigator.onLine;
    updateCheck("browser", {
      status: browserOnline ? "ok" : "error",
      detail: browserOnline
        ? t("errors.network.details.online")
        : t("errors.network.details.offline"),
    });

    if (!browserOnline) {
      updateCheck("origin", { status: "error", detail: t("errors.network.details.skipped") });
      updateCheck("api", { status: "error", detail: t("errors.network.details.skipped") });
      setRunning(false);
      return;
    }

    updateCheck("origin", { status: "running" });
    const originProbe = await networkProbe(window.location.href);
    updateCheck("origin", {
      status: originProbe.reachable ? "ok" : "error",
      detail: originProbe.reachable
        ? `${originProbe.latency} ms · HTTP ${originProbe.status}`
        : t("errors.network.details.unreachable"),
    });

    updateCheck("api", { status: "running" });
    const apiProbe = await networkProbe("/api/me");
    updateCheck("api", {
      status: apiProbe.reachable ? "ok" : "error",
      detail: apiProbe.reachable
        ? `${apiProbe.latency} ms · HTTP ${apiProbe.status}`
        : t("errors.network.details.unreachable"),
    });

    setRunning(false);
  }, [makeChecks, t, updateCheck]);

  const statusIcon = (status: DiagnosticStatus) => {
    if (status === "ok") return <Check className="h-3.5 w-3.5 text-emerald-500" />;
    if (status === "error") return <X className="h-3.5 w-3.5 text-red-500" />;
    if (status === "running") {
      return (
        <motion.span
          className="h-3.5 w-3.5 rounded-full border-2 border-primary/25 border-t-primary"
          animate={reduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        />
      );
    }
    return <CircleHelp className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  return (
    <div className="grid min-h-64 gap-4 md:grid-cols-[0.8fr_1.2fr]">
      <div className="relative flex min-h-44 items-center justify-center rounded-2xl border border-border/70 bg-background/70">
        <div className="absolute left-1/2 top-1/2 h-px w-2/3 -translate-x-1/2 bg-border" />
        <div className="absolute left-1/2 top-1/2 h-2/3 w-px -translate-y-1/2 bg-border" />
        {[
          { Icon: Router, left: "14%", top: "44%", tone: "text-primary" },
          { Icon: Server, left: "43%", top: "16%", tone: "text-primary" },
          { Icon: Database, left: "70%", top: "44%", tone: "text-primary" },
          { Icon: CloudOff, left: "43%", top: "70%", tone: "text-red-500" },
        ].map(({ Icon, left, top, tone }, index) => (
          <motion.div
            key={index}
            className="absolute flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-card shadow-sm"
            style={{ left, top }}
            animate={
              reduceMotion
                ? undefined
                : { scale: [0.96, 1.04, 0.96], opacity: [0.7, 1, 0.7] }
            }
            transition={{ duration: 2.4, delay: index * 0.25, repeat: Infinity }}
          >
            <Icon className={cn("h-5 w-5", tone)} />
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{t("errors.network.diagnostic_title")}</p>
            <p className="text-[11px] text-muted-foreground">
              {t("errors.network.diagnostic_description")}
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={runDiagnostic} disabled={running}>
            <RefreshCw className={cn("mr-2 h-3.5 w-3.5", running && !reduceMotion && "animate-spin")} />
            {t("errors.network.run")}
          </Button>
        </div>

        <div className="space-y-2">
          {checks.map((check) => (
            <div
              key={check.id}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-3 py-2"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                {statusIcon(check.status)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">{check.label}</p>
                <p className="truncate text-[10px] text-muted-foreground">
                  {check.detail ?? t("errors.network.details.waiting")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorActionButtons({
  home,
  back,
  retry,
}: {
  home?: boolean;
  back?: boolean;
  retry?: boolean;
}) {
  const t = useTranslations("testPages.uiMotion");

  return (
    <>
      {retry ? (
        <Button size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          {t("errors.actions.retry")}
        </Button>
      ) : null}
      {home ? (
        <Button size="sm">
          <Home className="mr-2 h-4 w-4" />
          {t("errors.actions.home")}
        </Button>
      ) : null}
      {back ? (
        <Button size="sm" variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("errors.actions.back")}
        </Button>
      ) : null}
    </>
  );
}

export function useErrorConcepts(): ErrorConceptDefinition[] {
  const t = useTranslations("testPages.uiMotion");

  return [
    {
      id: "404",
      title: t("errors.notFound.concept_title"),
      description: t("errors.notFound.concept_description"),
      usage: t("errors.notFound.usage"),
      preview: (
        <ErrorPreviewFrame
          eyebrow={t("errors.brand")}
          code="404"
          title={t("errors.notFound.title")}
          description={t("errors.notFound.description")}
          actions={<ErrorActionButtons home back />}
          illustration={<LostSensorScene />}
        />
      ),
    },
    {
      id: "500",
      title: t("errors.server.concept_title"),
      description: t("errors.server.concept_description"),
      usage: t("errors.server.usage"),
      preview: (
        <ErrorPreviewFrame
          eyebrow={t("errors.brand")}
          code="500"
          title={t("errors.server.title")}
          description={t("errors.server.description")}
          accent="red"
          actions={<ErrorActionButtons retry back />}
          illustration={<ServerIncidentScene />}
        />
      ),
    },
    {
      id: "maintenance",
      title: t("errors.maintenance.concept_title"),
      description: t("errors.maintenance.concept_description"),
      usage: t("errors.maintenance.usage"),
      preview: (
        <ErrorPreviewFrame
          eyebrow={t("errors.brand")}
          code={t("errors.maintenance.code")}
          title={t("errors.maintenance.title")}
          description={t("errors.maintenance.description")}
          accent="amber"
          actions={<ErrorActionButtons retry />}
          illustration={<MaintenanceScene />}
          footer={
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Settings className="h-3.5 w-3.5" />
              {t("errors.maintenance.footer")}
            </div>
          }
        />
      ),
    },
    {
      id: "network",
      title: t("errors.network.concept_title"),
      description: t("errors.network.concept_description"),
      usage: t("errors.network.usage"),
      preview: (
        <ErrorPreviewFrame
          eyebrow={t("errors.brand")}
          code={t("errors.network.code")}
          title={t("errors.network.title")}
          description={t("errors.network.description")}
          accent="red"
          actions={<ErrorActionButtons retry />}
          illustration={<NetworkDiagnosticScene />}
          footer={
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CloudOff className="h-3.5 w-3.5" />
              {t("errors.network.footer")}
            </div>
          }
        />
      ),
    },
  ];
}
