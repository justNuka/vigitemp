"use client"

import { CheckCircle2, XCircle } from "lucide-react"
import type { PasswordRules } from "@/lib/api"

interface Props {
  rules: PasswordRules
  password: string
}

export function PasswordRulesChecklist({ rules, password }: Props) {
  return (
    <div className="mt-2 p-3 rounded-lg border bg-muted/50 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Règles de sécurité :</p>
      <div className="space-y-1">
        <RuleLine ok={password.length >= rules.min_length} label={`Au moins ${rules.min_length} caractères`} />
        {rules.min_uppercase > 0 ? (
          <RuleLine
            ok={(password.match(/[A-Z]/g) || []).length >= rules.min_uppercase}
            label={`Au moins ${rules.min_uppercase} majuscule${rules.min_uppercase > 1 ? "s" : ""}`}
          />
        ) : null}
        {rules.min_lowercase > 0 ? (
          <RuleLine
            ok={(password.match(/[a-z]/g) || []).length >= rules.min_lowercase}
            label={`Au moins ${rules.min_lowercase} minuscule${rules.min_lowercase > 1 ? "s" : ""}`}
          />
        ) : null}
        {rules.min_numbers > 0 ? (
          <RuleLine
            ok={(password.match(/[0-9]/g) || []).length >= rules.min_numbers}
            label={`Au moins ${rules.min_numbers} chiffre${rules.min_numbers > 1 ? "s" : ""}`}
          />
        ) : null}
        {rules.min_special > 0 ? (
          <RuleLine
            ok={(password.match(/[^A-Za-z0-9]/g) || []).length >= rules.min_special}
            label={`Au moins ${rules.min_special} caractère spécial${rules.min_special > 1 ? "s" : ""}`}
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

