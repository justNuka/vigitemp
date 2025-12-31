"use client";

import { Progress } from "@/components/ui/progress";
import { calculatePasswordStrength } from "@/lib/password-validation";

function getStrengthLabel(score: number) {
  if (score < 25) return "Faible";
  if (score < 50) return "Moyen";
  if (score < 75) return "Bon";
  return "Fort";
}

function getStrengthBarClass(score: number) {
  if (score < 25) return "bg-red-500";
  if (score < 50) return "bg-orange-500";
  if (score < 75) return "bg-yellow-500";
  return "bg-green-500";
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const score = calculatePasswordStrength(password);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Force du mot de passe</span>
        <span className="font-medium">{getStrengthLabel(score)}</span>
      </div>
      <Progress value={score} className="h-2" indicatorClassName={getStrengthBarClass(score)} />
    </div>
  );
}

