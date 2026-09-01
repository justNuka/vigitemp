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

type Translator = (key: string, values?: Record<string, any>) => string;

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
  t,
}: {
  password: string;
  confirmPassword?: string;
  rules: PasswordRules;
  includeConfirmMatch?: boolean;
  t?: Translator;
}): PasswordRuleCheck[] {
  const translate: Translator = t
    ? t
    : (key, values) => {
        switch (key) {
          case "rules.min_length":
            return `Au moins ${values?.count} caractères`;
          case "rules.min_uppercase":
            return `Au moins ${values?.count} lettre(s) majuscule(s)`;
          case "rules.min_lowercase":
            return `Au moins ${values?.count} lettre(s) minuscule(s)`;
          case "rules.min_numbers":
            return `Au moins ${values?.count} chiffre(s)`;
          case "rules.min_special":
            return `Au moins ${values?.count} caractère(s) spécial(aux) (!@#$%^&* etc.)`;
          case "rules.confirm_match":
            return "Les mots de passe correspondent";
          default:
            return String(key);
        }
      };
  const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
  const lowercaseCount = (password.match(/[a-z]/g) || []).length;
  const numbersCount = (password.match(/[0-9]/g) || []).length;
  const specialCount =
    (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;

  const checks: PasswordRuleCheck[] = [
    {
      key: "min_length",
      label: translate("rules.min_length", { count: rules.min_length }),
      isValid: password.length >= rules.min_length,
    },
  ];

  if (rules.min_uppercase > 0) {
    checks.push({
      key: "min_uppercase",
      label: translate("rules.min_uppercase", { count: rules.min_uppercase }),
      isValid: uppercaseCount >= rules.min_uppercase,
    });
  }

  if (rules.min_lowercase > 0) {
    checks.push({
      key: "min_lowercase",
      label: translate("rules.min_lowercase", { count: rules.min_lowercase }),
      isValid: lowercaseCount >= rules.min_lowercase,
    });
  }

  if (rules.min_numbers > 0) {
    checks.push({
      key: "min_numbers",
      label: translate("rules.min_numbers", { count: rules.min_numbers }),
      isValid: numbersCount >= rules.min_numbers,
    });
  }

  if (rules.min_special > 0) {
    checks.push({
      key: "min_special",
      label: translate("rules.min_special", { count: rules.min_special }),
      isValid: specialCount >= rules.min_special,
    });
  }

  if (includeConfirmMatch) {
    checks.push({
      key: "confirm_match",
      label: translate("rules.confirm_match"),
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

