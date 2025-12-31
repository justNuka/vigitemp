"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { PasswordRules } from "@/lib/api";
import {
  getEffectivePasswordRules,
  getPasswordRuleChecks,
} from "./password-rules";

export function PasswordRulesList({
  password,
  confirmPassword,
  rules,
  title = "Le mot de passe doit contenir :",
  includeConfirmMatch = false,
}: {
  password: string;
  confirmPassword?: string;
  rules?: PasswordRules | null;
  title?: string;
  includeConfirmMatch?: boolean;
}) {
  const effectiveRules = getEffectivePasswordRules(rules);
  const checks = getPasswordRuleChecks({
    password,
    confirmPassword,
    rules: effectiveRules,
    includeConfirmMatch,
  });

  if (!password) return null;

  return (
    <div className="space-y-2 text-sm">
      <p className="font-medium">{title}</p>
      {checks.map((rule) => (
        <div key={rule.key} className="flex items-center gap-2">
          {rule.isValid ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
          <span className={rule.isValid ? "text-green-600" : "text-muted-foreground"}>
            {rule.label}
          </span>
        </div>
      ))}
    </div>
  );
}
