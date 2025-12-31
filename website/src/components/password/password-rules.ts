import type { PasswordRules } from "@/lib/api";

const DEFAULT_PASSWORD_RULES: PasswordRules = {
  min_length: 8,
  min_uppercase: 1,
  min_lowercase: 1,
  min_numbers: 1,
  min_special: 1,
  cfr21_enabled: false,
  history_count: 5,
  expiry_days: 90,
  expiry_enabled: false,
};

export type PasswordRuleCheck = {
  key: string;
  label: string;
  isValid: boolean;
};

export function getEffectivePasswordRules(
  rules: PasswordRules | null | undefined
): PasswordRules {
  return rules ?? DEFAULT_PASSWORD_RULES;
}

export function getPasswordRuleChecks({
  password,
  confirmPassword,
  rules,
  includeConfirmMatch = false,
}: {
  password: string;
  confirmPassword?: string;
  rules: PasswordRules;
  includeConfirmMatch?: boolean;
}): PasswordRuleCheck[] {
  const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
  const lowercaseCount = (password.match(/[a-z]/g) || []).length;
  const numbersCount = (password.match(/[0-9]/g) || []).length;
  const specialCount =
    (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;

  const checks: PasswordRuleCheck[] = [
    {
      key: "min_length",
      label: `Au moins ${rules.min_length} caractères`,
      isValid: password.length >= rules.min_length,
    },
  ];

  if (rules.min_uppercase > 0) {
    checks.push({
      key: "min_uppercase",
      label: `Au moins ${rules.min_uppercase} lettre(s) majuscule(s)`,
      isValid: uppercaseCount >= rules.min_uppercase,
    });
  }

  if (rules.min_lowercase > 0) {
    checks.push({
      key: "min_lowercase",
      label: `Au moins ${rules.min_lowercase} lettre(s) minuscule(s)`,
      isValid: lowercaseCount >= rules.min_lowercase,
    });
  }

  if (rules.min_numbers > 0) {
    checks.push({
      key: "min_numbers",
      label: `Au moins ${rules.min_numbers} chiffre(s)`,
      isValid: numbersCount >= rules.min_numbers,
    });
  }

  if (rules.min_special > 0) {
    checks.push({
      key: "min_special",
      label: `Au moins ${rules.min_special} caractère(s) spécial(aux) (!@#$%^&* etc.)`,
      isValid: specialCount >= rules.min_special,
    });
  }

  if (includeConfirmMatch) {
    checks.push({
      key: "confirm_match",
      label: "Les mots de passe correspondent",
      isValid:
        password.length > 0 &&
        typeof confirmPassword === "string" &&
        password === confirmPassword,
    });
  }

  return checks;
}

export function areAllPasswordRuleChecksValid(checks: PasswordRuleCheck[]) {
  return checks.every((c) => c.isValid);
}

