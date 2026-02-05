"use client";

import Link from "next/link";
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type ErrorAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost";
};

interface ErrorPageLayoutProps {
  code: string;
  title: string;
  description: string;
  badge?: string;
  icon?: ReactNode;
  helperText?: string;
  primaryAction: ErrorAction;
  secondaryAction?: ErrorAction;
}

function ActionButton({
  action,
  fallbackHref,
}: {
  action: ErrorAction;
  fallbackHref: string;
}) {
  if (action.onClick) {
    return (
      <Button
        onClick={action.onClick}
        variant={action.variant ?? "default"}
        className="gap-2"
      >
        {action.icon}
        {action.label}
      </Button>
    );
  }

  const href = action.href ?? fallbackHref;

  return (
    <Button asChild variant={action.variant ?? "default"} className="gap-2">
      <Link href={href}>
        {action.icon}
        {action.label}
      </Link>
    </Button>
  );
}

export function ErrorPageLayout({
  code,
  title,
  description,
  badge,
  icon,
  helperText,
  primaryAction,
  secondaryAction,
}: ErrorPageLayoutProps) {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] || "fr";
  const t = useTranslations("errors");
  const reduceMotion = useReducedMotion();

  const floatAnimation = reduceMotion
    ? undefined
    : { y: [0, -12, 0], opacity: [0.6, 1, 0.6] };

  const shimmerAnimation = reduceMotion
    ? undefined
    : { opacity: [0.35, 0.6, 0.35] };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-background via-background to-muted/30">
      <LazyMotion features={domAnimation}>
        <m.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-12"
        >
          <div className="grid w-full items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-8">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Logo size="sm" showText={false} />
                <span className="rounded-full border border-muted/60 bg-muted/30 px-3 py-1">
                  {badge ?? t("default_badge", { code })}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {icon ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                      {icon}
                    </div>
                  ) : null}
                  <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                    {title}
                  </h1>
                </div>
                <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
                  {description}
                </p>
                {helperText ? (
                  <p className="text-sm text-muted-foreground/80">{helperText}</p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <ActionButton action={primaryAction} fallbackHref={`/${locale}`} />
                {secondaryAction ? (
                  <ActionButton action={secondaryAction} fallbackHref={`/${locale}`} />
                ) : null}
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <m.div
                className="absolute -top-16 right-6 h-32 w-32 rounded-full bg-primary/15 blur-3xl"
                animate={shimmerAnimation}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <m.div
                className="absolute -bottom-10 left-4 h-28 w-28 rounded-full bg-emerald-400/20 blur-3xl"
                animate={shimmerAnimation}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              />

              <m.div
                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-muted/50 bg-card/60 p-6 shadow-xl backdrop-blur"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <m.div
                  className="absolute inset-0 bg-linear-to-tr from-primary/10 via-transparent to-emerald-500/10"
                  animate={shimmerAnimation}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="relative space-y-6">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                        Vigitemp
                      </p>
                      <p className="text-4xl font-semibold text-primary">{code}</p>
                    </div>
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary">
                      {t("system_status")}
                    </span>
                  </div>

                  <m.svg
                    viewBox="0 0 360 160"
                    className="h-32 w-full"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="errorWave" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="currentColor" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
                      </linearGradient>
                    </defs>
                    <m.path
                      d="M10 100 C 50 40, 90 160, 130 100 S 210 40, 250 100 310 160 350 100"
                      fill="none"
                      stroke="url(#errorWave)"
                      strokeWidth="6"
                      className="text-primary"
                      animate={floatAnimation}
                      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <m.circle
                      cx="80"
                      cy="60"
                      r="6"
                      className="fill-emerald-400/70"
                      animate={floatAnimation}
                      transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <m.circle
                      cx="240"
                      cy="120"
                      r="8"
                      className="fill-primary/60"
                      animate={floatAnimation}
                      transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </m.svg>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("monitoring_live")}</span>
                    <span className="flex items-center gap-2">
                      <span className={cn("h-2 w-2 rounded-full bg-emerald-400", !reduceMotion && "animate-pulse")} />
                      {t("connected")}
                    </span>
                  </div>
                </div>
              </m.div>
            </div>
          </div>
        </m.div>
      </LazyMotion>
    </div>
  );
}