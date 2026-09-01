"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import type { PasswordRules } from "@/lib/api";
import {
  getEffectivePasswordRules,
  getPasswordRuleChecks,
} from "./password-rules";
import { useTranslations } from "next-intl";

export function PasswordRulesList({
  password,
  confirmPassword,
  rules,
  title,
  includeConfirmMatch = false,
  showWhenEmpty = false,
}: {
  password: string;
  confirmPassword?: string;
  rules?: PasswordRules | null;
  title?: string;
  includeConfirmMatch?: boolean;
  showWhenEmpty?: boolean;
}) {
  const t = useTranslations("passwordRules");
  const resolvedTitle = title ?? t("title");
  const effectiveRules = getEffectivePasswordRules(rules);
  const checks = getPasswordRuleChecks({
    password,
    confirmPassword,
    rules: effectiveRules,
    includeConfirmMatch,
    t,
  });

  if (!showWhenEmpty && !password) return null;

  return (
    <div className="space-y-2 text-sm">
      <p className="font-medium">{resolvedTitle}</p>
      {checks.map((rule) => (
        <div key={rule.key} className="flex items-center gap-2">
          {rule.isValid ? (
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <span className={rule.isValid ? "text-green-600" : "text-muted-foreground"}>
            {rule.label}
          </span>
        </div>
      ))}
    </div>
  );
}
