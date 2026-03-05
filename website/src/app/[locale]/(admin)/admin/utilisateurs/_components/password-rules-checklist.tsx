"use client"

import { useTranslations } from "next-intl"
import { CheckCircle2, XCircle } from "lucide-react"
import type { PasswordRules } from "@/lib/api"

interface Props {
  rules: PasswordRules
  password: string
}

export function PasswordRulesChecklist({ rules, password }: Props) {
  const t = useTranslations("usersPage.password_rules_checklist")

  return (
    <div className="mt-2 p-3 rounded-lg border bg-muted/50 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{t("title")}</p>
      <div className="space-y-1">
        <RuleLine ok={password.length >= rules.min_length} label={t("min_length", { count: rules.min_length })} />
        {rules.min_uppercase > 0 ? (
          <RuleLine
            ok={(password.match(/[A-Z]/g) || []).length >= rules.min_uppercase}
            label={t("min_uppercase", { count: rules.min_uppercase })}
          />
        ) : null}
        {rules.min_lowercase > 0 ? (
          <RuleLine
            ok={(password.match(/[a-z]/g) || []).length >= rules.min_lowercase}
            label={t("min_lowercase", { count: rules.min_lowercase })}
          />
        ) : null}
        {rules.min_numbers > 0 ? (
          <RuleLine
            ok={(password.match(/[0-9]/g) || []).length >= rules.min_numbers}
            label={t("min_numbers", { count: rules.min_numbers })}
          />
        ) : null}
        {rules.min_special > 0 ? (
          <RuleLine
            ok={(password.match(/[^A-Za-z0-9]/g) || []).length >= rules.min_special}
            label={t("min_special", { count: rules.min_special })}
          />
        ) : null}
      </div>
    </div>
  )
}

function RuleLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {ok ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
      <span className={ok ? "text-green-600" : "text-red-600"}>{label}</span>
    </div>
  )
}
