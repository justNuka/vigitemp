"use client";

import {
  ArrowLeft,
  Check,
  CircleHelp,
  CloudOff,
  Home,
  RefreshCw,
  Router,
  Server,
  Settings,
  Thermometer,
  Wrench,
  X,
} from "lucide-react";
import { motion } from "motion/react";
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

type DiagnosticStatus = "idle" | "running" | "ok" | "error";

interface DiagnosticCheck {
  id: "browser" | "origin" | "api";
  label: string;
  status: DiagnosticStatus;
  detail?: string;
}

const STAR_FIELD = [
  [7, 18, 1.1],
  [13, 71, 0.8],
  [19, 35, 1.5],
  [25, 11, 0.7],
  [29, 82, 1.2],
  [35, 52, 0.9],
  [41, 24, 1.4],
  [47, 75, 0.8],
  [54, 14, 1.1],
  [61, 60, 1.5],
  [67, 32, 0.9],
  [72, 84, 1.3],
  [78, 20, 0.7],
  [83, 48, 1.2],
  [90, 10, 1.5],
  [93, 69, 0.8],
] as const;

function PreviewButton({
  icon,
  children,
  secondary = false,
}: {
  icon: ReactNode;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-xs font-semibold transition-transform active:scale-[0.98]",
        secondary
          ? "border border-white/12 bg-white/5 text-slate-200"
          : "bg-sky-500 text-white shadow-[0_10px_28px_rgba(14,165,233,.22)]",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function ServerRack({
  side,
  alert = false,
}: {
  side: "left" | "right";
  alert?: boolean;
}) {
  return (
    <motion.div
      className="relative h-32 w-24 rounded-lg border border-slate-300 bg-slate-100 p-2 shadow-xl"
      animate={{ y: [0, side === "left" ? -2 : 2, 0] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="mb-2 flex gap-1">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className={cn(
              "h-2 w-2 rounded-full",
              alert && index === 1 ? "bg-red-500" : index === 0 ? "bg-emerald-500" : "bg-sky-400",
            )}
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.3, delay: index * 0.22, repeat: Infinity }}
          />
        ))}
      </div>
      <div className="space-y-1.5">
        {[0, 1, 2, 3].map((row) => (
          <div
            key={row}
            className="relative h-5 rounded border border-slate-300 bg-slate-800"
          >
            <div className="absolute inset-y-1 left-2 right-2 rounded bg-sky-500/70" />
            <motion.span
              className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-white"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{
                duration: 1.5,
                delay: row * 0.18 + (side === "right" ? 0.2 : 0),
                repeat: Infinity,
              }}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function VigiBot({ maintenance = false }: { maintenance?: boolean }) {
  return (
    <motion.div
      className="relative h-40 w-36"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className="absolute left-1/2 top-5 h-16 w-20 -translate-x-1/2 rounded-[1.8rem] border border-sky-200 bg-white shadow-lg"
        animate={{ rotate: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="absolute left-1/2 top-5 flex h-7 w-12 -translate-x-1/2 items-center justify-around rounded-full bg-slate-700">
          <motion.span
            className="h-2 w-2 rounded-full bg-cyan-300"
            animate={{ scaleY: [1, 0.12, 1] }}
            transition={{ duration: 3.7, repeat: Infinity, repeatDelay: 1.1 }}
          />
          <motion.span
            className="h-2 w-2 rounded-full bg-cyan-300"
            animate={{ scaleY: [1, 0.12, 1] }}
            transition={{ duration: 3.7, repeat: Infinity, repeatDelay: 1.1 }}
          />
        </div>
      </motion.div>

      <div className="absolute bottom-2 left-1/2 h-20 w-24 -translate-x-1/2 rounded-[2rem] border border-sky-200 bg-linear-to-b from-white to-sky-100 shadow-xl">
        <div className="absolute inset-x-4 top-4 h-1.5 rounded-full bg-sky-200" />
        <div className="absolute inset-x-6 bottom-5 h-5 rounded-full bg-sky-200/65" />
      </div>

      {maintenance ? (
        <motion.div
          className="absolute -right-2 bottom-14 flex h-10 w-10 items-center justify-center rounded-xl border border-amber-300 bg-amber-100 shadow-lg"
          animate={{ rotate: [-12, 18, -12], x: [0, 4, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Wrench className="h-5 w-5 text-amber-600" />
        </motion.div>
      ) : null}
    </motion.div>
  );
}

function Error404Scene() {
  const t = useTranslations("testPages.uiMotion");

  return (
    <div className="relative min-h-[500px] overflow-hidden rounded-2xl bg-[#030b19] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_75%,rgba(14,165,233,.45),transparent_42%),linear-gradient(180deg,#020817_0%,#061a4d_64%,#0ea5e9_135%)]" />

      {STAR_FIELD.map(([left, top, size], index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-sky-100"
          style={{
            left: String(left) + "%",
            top: String(top) + "%",
            width: size * 2,
            height: size * 2,
          }}
          animate={{ opacity: [0.15, 0.85, 0.15], scale: [0.7, 1.3, 0.7] }}
          transition={{
            duration: 2.1 + (index % 5) * 0.35,
            delay: index * 0.11,
            repeat: Infinity,
          }}
        />
      ))}

      <motion.div
        className="absolute -left-20 top-24 h-48 w-48 rounded-full border border-sky-300/15 bg-linear-to-br from-sky-500/20 to-indigo-800/50 shadow-[inset_-20px_-18px_40px_rgba(15,23,42,.7)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-7 rounded-full border border-white/5" />
        <div className="absolute left-14 top-12 h-8 w-14 rounded-full bg-white/5 blur-sm" />
      </motion.div>

      <motion.div
        className="absolute -right-20 top-16 h-56 w-56 rounded-full border border-violet-300/15 bg-linear-to-br from-violet-500/35 to-indigo-950 shadow-[inset_24px_10px_45px_rgba(0,0,0,.35)]"
        animate={{ rotate: -360 }}
        transition={{ duration: 46, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute left-4 top-14 h-3 w-44 -rotate-12 rounded-full bg-violet-300/12" />
        <div className="absolute left-2 top-24 h-4 w-48 -rotate-12 rounded-full bg-indigo-200/8" />
      </motion.div>

      <div className="absolute inset-x-0 top-10 z-20 flex justify-center">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-100/75 backdrop-blur">
          VigiSensys · {t("errors.notFound.usage")}
        </span>
      </div>

      <div className="absolute inset-x-0 top-[21%] z-10 flex items-center justify-center">
        <div className="relative flex items-center text-[clamp(7rem,19vw,13rem)] font-black leading-none tracking-[-0.09em] text-white">
          <span>4</span>
          <span className="relative mx-2 inline-flex h-[0.75em] w-[0.75em] items-center justify-center rounded-full border-[0.08em] border-white">
            <motion.span
              className="absolute inset-[14%] rounded-full border border-cyan-300/35"
              animate={{ scale: [0.7, 1.15], opacity: [0.75, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <motion.span
              className="absolute inset-[29%] rounded-full bg-cyan-300/15"
              animate={{ scale: [0.8, 1.18, 0.8] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            />
            <motion.span
              className="h-[12%] w-[12%] rounded-full bg-cyan-200 shadow-[0_0_18px_rgba(103,232,249,.75)]"
              animate={{ scale: [0.7, 1.4, 0.7] }}
              transition={{ duration: 1.25, repeat: Infinity }}
            />
          </span>
          <span>4</span>
        </div>
      </div>

      <motion.div
        className="absolute left-[53%] top-[34%] z-30"
        animate={{
          x: [-110, 10, 125],
          y: [24, -12, 16],
          rotate: [-12, 5, 18],
          scale: [0.8, 1.05, 0.82],
        }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative h-12 w-24">
          <div className="absolute left-1/2 top-3 h-7 w-20 -translate-x-1/2 rounded-[50%] border border-cyan-200/40 bg-linear-to-b from-sky-300 to-indigo-500 shadow-[0_0_28px_rgba(56,189,248,.42)]" />
          <div className="absolute left-1/2 top-0 h-6 w-10 -translate-x-1/2 rounded-t-full border border-violet-200/40 bg-violet-400/80" />
          <motion.span
            className="absolute -bottom-1 left-4 h-1.5 w-1.5 rounded-full bg-cyan-200"
            animate={{ opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          <motion.span
            className="absolute -bottom-1 right-4 h-1.5 w-1.5 rounded-full bg-cyan-200"
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        </div>
      </motion.div>

      <div className="absolute inset-x-5 bottom-8 z-30 mx-auto max-w-xl text-center">
        <p className="text-2xl font-bold tracking-tight md:text-3xl">
          {t("errors.notFound.title")}
        </p>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-sky-100/65">
          {t("errors.notFound.description")}
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <PreviewButton icon={<Home className="h-4 w-4" />}>
            {t("errors.actions.home")}
          </PreviewButton>
          <PreviewButton secondary icon={<ArrowLeft className="h-4 w-4" />}>
            {t("errors.actions.back")}
          </PreviewButton>
        </div>
      </div>
    </div>
  );
}

function Error500Scene() {
  const t = useTranslations("testPages.uiMotion");

  return (
    <div className="relative min-h-[500px] overflow-hidden rounded-2xl bg-[#1199e8] p-5 md:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(255,255,255,.22),transparent_33%)]" />
      <div className="relative mx-auto flex min-h-[440px] max-w-5xl flex-col overflow-hidden rounded-[2.2rem] border border-sky-950/30 bg-slate-50 px-6 py-7 text-slate-900 shadow-[0_22px_55px_rgba(2,64,118,.24)]">
        <div className="text-center">
          <motion.div
            className="text-7xl font-black tracking-[-0.07em] text-sky-600 md:text-8xl"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            500
          </motion.div>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.24em] text-sky-700">
            {t("errors.server.title")}
          </p>
        </div>

        <div className="relative mt-2 flex flex-1 items-end justify-center pb-14">
          <div className="absolute bottom-16 left-[8%]">
            <ServerRack side="left" />
          </div>
          <div className="absolute bottom-16 right-[8%]">
            <ServerRack side="right" alert />
          </div>

          <svg
            viewBox="0 0 720 240"
            className="pointer-events-none absolute inset-x-[7%] bottom-8 h-60 w-[86%]"
            aria-hidden="true"
          >
            <motion.path
              d="M112 180 C190 190 205 148 268 122"
              fill="none"
              stroke="#0f4c81"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0.2 }}
              animate={{ pathLength: [0.78, 1, 0.78] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              d="M452 122 C515 148 530 190 608 180"
              fill="none"
              stroke="#0f4c81"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="12 8"
              animate={{ strokeDashoffset: [0, -40] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.circle
              cx="452"
              cy="122"
              r="7"
              fill="#ef4444"
              animate={{ scale: [0.7, 1.45, 0.7], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.1, repeat: Infinity }}
            />
          </svg>

          <div className="relative z-10">
            <VigiBot />
          </div>

          <motion.div
            className="absolute bottom-16 left-[34%] h-8 w-7 rounded-b-xl rounded-t-md border border-sky-300 bg-sky-100"
            animate={{ rotate: [-4, 8, -4], x: [0, -5, 0] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="absolute -bottom-3 left-1.5 h-4 w-1 rounded-full bg-slate-700" />
            <div className="absolute -bottom-3 right-1.5 h-4 w-1 rounded-full bg-slate-700" />
          </motion.div>

          <motion.div
            className="absolute bottom-16 right-[34%] h-8 w-7 rounded-b-xl rounded-t-md border border-sky-300 bg-sky-100"
            animate={{ rotate: [8, -4, 8], x: [0, 5, 0] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="absolute bottom-2 left-1/2 h-3 w-[62%] -translate-x-1/2 rounded-[50%] bg-slate-900/6 blur-sm" />
        </div>

        <div className="absolute inset-x-6 bottom-5 flex items-center justify-between gap-4">
          <p className="max-w-md text-xs leading-5 text-slate-500">
            {t("errors.server.description")}
          </p>
          <PreviewButton icon={<RefreshCw className="h-4 w-4" />}>
            {t("errors.actions.retry")}
          </PreviewButton>
        </div>
      </div>
    </div>
  );
}

function MaintenanceScene() {
  const t = useTranslations("testPages.uiMotion");

  return (
    <div className="relative min-h-[500px] overflow-hidden rounded-2xl bg-[#07131f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_60%,rgba(14,165,233,.16),transparent_38%)]" />
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.06) 1px, transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />

      <div className="absolute inset-x-0 top-10 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-amber-300/70">
          VigiSensys · {t("errors.maintenance.planned")}
        </p>
        <h3 className="mt-3 text-4xl font-black tracking-[-0.045em] text-white/95 md:text-5xl">
          {t("errors.maintenance.title")}
        </h3>
        <p className="mx-auto mt-3 max-w-xl px-5 text-sm leading-6 text-slate-400">
          {t("errors.maintenance.description")}
        </p>
      </div>

      <motion.div
        className="absolute left-1/2 top-[58%] h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-amber-300/20"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        <motion.div
          className="absolute -top-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-xl border border-amber-300/30 bg-amber-300/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          <Settings className="h-5 w-5 text-amber-300" />
        </motion.div>
        <motion.div
          className="absolute -bottom-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-xl border border-sky-300/25 bg-sky-300/8"
          animate={{ rotate: -360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          <Thermometer className="h-5 w-5 text-sky-300" />
        </motion.div>
      </motion.div>

      <div className="absolute left-1/2 top-[59%] -translate-x-1/2 -translate-y-1/2">
        <VigiBot maintenance />
      </div>

      <motion.div
        className="absolute left-[29%] top-[57%] h-20 w-14 rounded-2xl border border-sky-300/20 bg-[#0d2434] shadow-lg"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      >
        <Thermometer className="absolute left-1/2 top-3 h-6 w-6 -translate-x-1/2 text-sky-300" />
        <motion.div
          className="absolute bottom-4 left-3 right-3 h-1 rounded-full bg-sky-300"
          animate={{ scaleX: [0.2, 1, 0.45, 1, 0.2] }}
          style={{ transformOrigin: "left" }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <div className="absolute inset-x-0 bottom-10 mx-auto w-64">
        <div className="mb-2 flex justify-between text-[9px] uppercase tracking-[0.18em] text-slate-500">
          <span>{t("errors.maintenance.service_cycle")}</span>
          <motion.span
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            {t("errors.maintenance.running")}
          </motion.span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/7">
          <motion.div
            className="h-full rounded-full bg-linear-to-r from-amber-400 via-sky-400 to-cyan-300"
            animate={{ width: ["18%", "72%", "48%", "91%", "18%"] }}
            transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
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

function NetworkDiagnosticPanel() {
  const t = useTranslations("testPages.uiMotion");
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
      updateCheck("origin", {
        status: "error",
        detail: t("errors.network.details.skipped"),
      });
      updateCheck("api", {
        status: "error",
        detail: t("errors.network.details.skipped"),
      });
      setRunning(false);
      return;
    }

    updateCheck("origin", { status: "running" });
    const originProbe = await networkProbe(window.location.href);
    updateCheck("origin", {
      status: originProbe.reachable ? "ok" : "error",
      detail: originProbe.reachable
        ? String(originProbe.latency) + " ms · HTTP " + String(originProbe.status)
        : t("errors.network.details.unreachable"),
    });

    updateCheck("api", { status: "running" });
    const apiProbe = await networkProbe("/api/me");
    updateCheck("api", {
      status: apiProbe.reachable ? "ok" : "error",
      detail: apiProbe.reachable
        ? String(apiProbe.latency) + " ms · HTTP " + String(apiProbe.status)
        : t("errors.network.details.unreachable"),
    });

    setRunning(false);
  }, [makeChecks, t, updateCheck]);

  const statusIcon = (status: DiagnosticStatus) => {
    if (status === "ok") {
      return <Check className="h-3.5 w-3.5 text-emerald-400" />;
    }
    if (status === "error") {
      return <X className="h-3.5 w-3.5 text-red-400" />;
    }
    if (status === "running") {
      return (
        <motion.span
          className="h-3.5 w-3.5 rounded-full border-2 border-sky-300/20 border-t-sky-300"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
        />
      );
    }
    return <CircleHelp className="h-3.5 w-3.5 text-slate-500" />;
  };

  return (
    <div className="rounded-2xl border border-white/8 bg-[#081927]/88 p-4 shadow-2xl backdrop-blur">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-100">
            {t("errors.network.diagnostic_title")}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            {t("errors.network.diagnostic_description")}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-8 border-sky-300/20 bg-sky-300/5 text-[10px] text-sky-200 hover:bg-sky-300/10 hover:text-white"
          onClick={runDiagnostic}
          disabled={running}
        >
          <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", running && "animate-spin")} />
          {t("errors.network.run")}
        </Button>
      </div>

      <div className="space-y-2">
        {checks.map((check) => (
          <div
            key={check.id}
            className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.025] px-3 py-2"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5">
              {statusIcon(check.status)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold text-slate-300">{check.label}</p>
              <p className="truncate text-[9px] text-slate-500">
                {check.detail ?? t("errors.network.details.waiting")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NetworkScene() {
  const t = useTranslations("testPages.uiMotion");

  return (
    <div className="relative min-h-[500px] overflow-hidden rounded-2xl bg-[#040d17] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_45%,rgba(14,165,233,.16),transparent_38%)]" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,.055) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.055) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      />

      <div className="absolute left-8 top-8 z-10 max-w-md">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-red-300/75">
          <CloudOff className="h-4 w-4" />
          VigiSensys · {t("errors.network.usage")}
        </div>
        <h3 className="text-3xl font-black tracking-[-0.04em] md:text-4xl">
          {t("errors.network.title")}
        </h3>
        <p className="mt-3 max-w-lg text-sm leading-6 text-slate-400">
          {t("errors.network.description")}
        </p>
      </div>

      <div className="absolute left-8 top-[46%] flex h-24 w-24 items-center justify-center rounded-3xl border border-sky-300/20 bg-[#0a2131] shadow-[0_0_35px_rgba(14,165,233,.10)]">
        <Server className="h-10 w-10 text-sky-300" />
        <span className="absolute -bottom-7 text-[9px] uppercase tracking-[0.16em] text-slate-500">
          {t("errors.network.labels.web")}
        </span>
      </div>

      <div className="absolute right-8 top-[46%] flex h-24 w-24 items-center justify-center rounded-3xl border border-violet-300/20 bg-[#17152b] shadow-[0_0_35px_rgba(139,92,246,.10)]">
        <Router className="h-10 w-10 text-violet-300" />
        <span className="absolute -bottom-7 text-[9px] uppercase tracking-[0.16em] text-slate-500">
          {t("errors.network.labels.network")}
        </span>
      </div>

      <svg
        viewBox="0 0 760 160"
        className="absolute left-[17%] right-[17%] top-[48%] h-36 w-[66%]"
        aria-hidden="true"
      >
        <path
          d="M12 80 C135 80 180 50 318 80"
          fill="none"
          stroke="rgba(56,189,248,.25)"
          strokeWidth="3"
        />
        <path
          d="M442 80 C580 50 625 80 748 80"
          fill="none"
          stroke="rgba(167,139,250,.25)"
          strokeWidth="3"
        />

        {[0, 1, 2].map((index) => (
          <motion.circle
            key={"left-" + index}
            cy="80"
            r="5"
            fill="#67e8f9"
            animate={{ cx: [12, 318], opacity: [0, 1, 0] }}
            transition={{
              duration: 1.65,
              delay: index * 0.52,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        {[0, 1, 2].map((index) => (
          <motion.circle
            key={"right-" + index}
            cy="80"
            r="5"
            fill="#c4b5fd"
            animate={{ cx: [748, 442], opacity: [0, 1, 0] }}
            transition={{
              duration: 1.65,
              delay: index * 0.52,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <motion.path
          d="M342 65 L360 82 L376 62 L394 84 L416 65"
          fill="none"
          stroke="#f87171"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ opacity: [0.35, 1, 0.35], scale: [0.94, 1.04, 0.94] }}
          style={{ transformOrigin: "379px 74px" }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
      </svg>

      <motion.div
        className="absolute left-1/2 top-[58%] -translate-x-1/2 rounded-full border border-red-400/25 bg-red-400/8 px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.17em] text-red-300"
        animate={{ opacity: [0.45, 1, 0.45] }}
        transition={{ duration: 1.25, repeat: Infinity }}
      >
        {t("errors.network.labels.interrupted")}
      </motion.div>

      <div className="absolute bottom-6 left-6 right-6 md:left-auto md:w-[410px]">
        <NetworkDiagnosticPanel />
      </div>
    </div>
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
      preview: <Error404Scene />,
    },
    {
      id: "500",
      title: t("errors.server.concept_title"),
      description: t("errors.server.concept_description"),
      usage: t("errors.server.usage"),
      preview: <Error500Scene />,
    },
    {
      id: "maintenance",
      title: t("errors.maintenance.concept_title"),
      description: t("errors.maintenance.concept_description"),
      usage: t("errors.maintenance.usage"),
      preview: <MaintenanceScene />,
    },
    {
      id: "network",
      title: t("errors.network.concept_title"),
      description: t("errors.network.concept_description"),
      usage: t("errors.network.usage"),
      preview: <NetworkScene />,
    },
  ];
}
