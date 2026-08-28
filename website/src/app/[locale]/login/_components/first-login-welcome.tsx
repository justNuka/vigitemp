"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from "motion/react"
import { useTranslations } from "next-intl"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type FirstLoginWelcomeProps = {
  open: boolean
  displayName: string
  passwordExpiryEnabled: boolean
  passwordValidityDays: number | null
  onContinue: () => void
}

export function FirstLoginWelcome({
  open,
  displayName,
  passwordExpiryEnabled,
  passwordValidityDays,
  onContinue,
}: FirstLoginWelcomeProps) {
  const t = useTranslations("login.first_login")
  const reduceMotion = useReducedMotion()
  const [step, setStep] = useState<"welcome" | "policy">("welcome")

  useEffect(() => {
    if (!open || step !== "welcome") return
    const timer = window.setTimeout(() => setStep("policy"), reduceMotion ? 0 : 1500)
    return () => window.clearTimeout(timer)
  }, [open, reduceMotion, step])

  if (!open) return null

  const name = displayName.trim() || t("fallback_name")
  const hasValidity = passwordExpiryEnabled && passwordValidityDays != null

  return (
    <LazyMotion features={domAnimation}>
      <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background/98 p-4 backdrop-blur-xl">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <m.div
            className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
            animate={reduceMotion ? undefined : { scale: [0.85, 1.08, 0.95], opacity: [0.35, 0.7, 0.45] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === "welcome" ? (
            <m.div
              key="welcome"
              className="relative z-10 flex max-w-2xl flex-col items-center text-center"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.04, y: -12 }}
              transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <m.div
                className="mb-8 rounded-3xl border border-primary/20 bg-card/80 p-6 shadow-2xl shadow-primary/10"
                animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <Logo size="lg" showText />
              </m.div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-primary">
                {t("eyebrow")}
              </p>
              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
                {t("welcome_title", { name })}
              </h1>
              <p className="mt-4 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
                {t("welcome_description")}
              </p>
            </m.div>
          ) : (
            <m.div
              key="policy"
              className="relative z-10 w-full max-w-2xl"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card className="border-border/70 bg-card/95 shadow-2xl">
                <CardHeader className="space-y-4 text-center">
                  <div className="mx-auto rounded-2xl border border-primary/15 bg-primary/5 p-4">
                    <Logo size="md" showText={false} />
                  </div>
                  <div>
                    <CardTitle className="text-2xl sm:text-3xl">{t("policy_title")}</CardTitle>
                    <CardDescription className="mt-2 text-sm sm:text-base">
                      {t("policy_description")}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="rounded-xl border bg-muted/35 p-4">
                    <p className="font-semibold">{t("password_title")}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {hasValidity
                        ? t("password_validity", { days: passwordValidityDays })
                        : passwordExpiryEnabled
                          ? t("password_validity_unavailable")
                          : t("password_expiry_disabled")}
                    </p>
                  </div>

                  {hasValidity ? (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-6">
                      {t("expiry_reminder")}
                    </div>
                  ) : null}

                  <p className="text-sm leading-6 text-muted-foreground">
                    {t("forced_change_note")}
                  </p>

                  <Button type="button" className="w-full" size="lg" onClick={onContinue}>
                    {t("continue")}
                  </Button>
                </CardContent>
              </Card>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  )
}
