"use client";

import { Progress } from "@/components/ui/progress";
import { calculatePasswordStrength } from "@/lib/password-validation";
import { useTranslations } from "next-intl";

function getStrengthLabel(score: number, t: (key: string) => string) {
  if (score < 25) return t("levels.weak");
  if (score < 50) return t("levels.medium");
  if (score < 75) return t("levels.good");
  return t("levels.strong");
}

function getStrengthBarClass(score: number) {
  if (score < 25) return "bg-red-500";
  if (score < 50) return "bg-orange-500";
  if (score < 75) return "bg-yellow-500";
  return "bg-green-500";
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const t = useTranslations("passwordStrength");

  const score = calculatePasswordStrength(password);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{t("label")}</span>
        <span className="font-medium">{getStrengthLabel(score, t)}</span>
      </div>
      <Progress value={score} className="h-2" indicatorClassName={getStrengthBarClass(score)} />
    </div>
  );
}

