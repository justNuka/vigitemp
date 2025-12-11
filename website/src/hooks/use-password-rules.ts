import { useState, useEffect } from "react";

interface PasswordRule {
  label: string;
  isValid: boolean;
}

interface UsePasswordRulesReturn {
  rules: PasswordRule[];
  allRulesValid: boolean;
}

export function usePasswordRules(
  password: string,
  confirmPassword: string
): UsePasswordRulesReturn {
  const [rules, setRules] = useState<PasswordRule[]>([
    { label: "Au moins 8 caractères", isValid: false },
    { label: "Au moins une lettre majuscule", isValid: false },
    { label: "Au moins une lettre minuscule", isValid: false },
    { label: "Au moins un chiffre", isValid: false },
    { label: "Au moins un caractère spécial (!@#$%^&*)", isValid: false },
    { label: "Les mots de passe correspondent", isValid: false },
  ]);

  useEffect(() => {
    const newRules: PasswordRule[] = [
      {
        label: "Au moins 8 caractères",
        isValid: password.length >= 8,
      },
      {
        label: "Au moins une lettre majuscule",
        isValid: /[A-Z]/.test(password),
      },
      {
        label: "Au moins une lettre minuscule",
        isValid: /[a-z]/.test(password),
      },
      {
        label: "Au moins un chiffre",
        isValid: /[0-9]/.test(password),
      },
      {
        label: "Au moins un caractère spécial (!@#$%^&*)",
        isValid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      },
      {
        label: "Les mots de passe correspondent",
        isValid: password.length > 0 && password === confirmPassword,
      },
    ];

    setRules(newRules);
  }, [password, confirmPassword]);

  const allRulesValid = rules.every((rule) => rule.isValid);

  return { rules, allRulesValid };
}
