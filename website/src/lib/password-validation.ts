import { PasswordRules } from "./api";

/**
 * Résultat de la validation d'un mot de passe
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength?: "weak" | "fair" | "good" | "strong";
}

/**
 * Valide un mot de passe selon les règles configurées
 * @param password Le mot de passe à valider
 * @param rules Les règles de validation
 * @returns Résultat de la validation avec erreurs éventuelles
 */
export function validatePassword(
  password: string,
  rules: PasswordRules
): PasswordValidationResult {
  const errors: string[] = [];

  // Longueur minimale
  if (password.length < rules.min_length) {
    errors.push(
      `Le mot de passe doit contenir au moins ${rules.min_length} caractères`
    );
  }

  // Lettres majuscules
  const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
  if (uppercaseCount < rules.min_uppercase) {
    errors.push(
      `Le mot de passe doit contenir au moins ${rules.min_uppercase} lettre(s) majuscule(s)`
    );
  }

  // Lettres minuscules
  const lowercaseCount = (password.match(/[a-z]/g) || []).length;
  if (lowercaseCount < rules.min_lowercase) {
    errors.push(
      `Le mot de passe doit contenir au moins ${rules.min_lowercase} lettre(s) minuscule(s)`
    );
  }

  // Chiffres
  const numbersCount = (password.match(/[0-9]/g) || []).length;
  if (numbersCount < rules.min_numbers) {
    errors.push(
      `Le mot de passe doit contenir au moins ${rules.min_numbers} chiffre(s)`
    );
  }

  // Caractères spéciaux
  const specialCount = (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
  if (specialCount < rules.min_special) {
    errors.push(
      `Le mot de passe doit contenir au moins ${rules.min_special} caractère(s) spécial(aux) (!@#$%^&* etc.)`
    );
  }

  // Calculer la force du mot de passe
  let strength: "weak" | "fair" | "good" | "strong" = "weak";
  const lengthScore = Math.min(password.length / 16, 1); // Max à 16 caractères
  const varietyScore =
    (uppercaseCount > 0 ? 0.25 : 0) +
    (lowercaseCount > 0 ? 0.25 : 0) +
    (numbersCount > 0 ? 0.25 : 0) +
    (specialCount > 0 ? 0.25 : 0);

  const totalScore = (lengthScore + varietyScore) / 2;

  if (totalScore >= 0.75) strength = "strong";
  else if (totalScore >= 0.5) strength = "good";
  else if (totalScore >= 0.25) strength = "fair";

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Calcule le score de force d'un mot de passe (0-100)
 * Utile pour l'indicateur de force côté client
 * @param password Le mot de passe
 * @returns Score entre 0 et 100
 */
export function calculatePasswordStrength(password: string): number {
  let score = 0;

  // Longueur (max 40 points)
  score += Math.min(password.length * 2.5, 40);

  // Variété de caractères (60 points)
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;

  return Math.min(Math.round(score), 100);
}
