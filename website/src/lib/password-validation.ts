import { PasswordRules } from "./api";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

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
 * Vérifie si un mot de passe a déjà été utilisé par l'utilisateur
 * @param userId ID de l'utilisateur
 * @param newPasswordHash Hash du nouveau mot de passe
 * @param historyCount Nombre d'anciens mots de passe à vérifier
 * @returns true si le mot de passe est déjà utilisé, false sinon
 */
export async function checkPasswordHistory(
  userId: number,
  newPassword: string,
  historyCount: number
): Promise<{ isReused: boolean; matchingHash?: string }> {
  try {
    // Récupérer les N derniers anciens mots de passe
    const oldPasswords = await prisma.t_ancienmotpasse.findMany({
      where: {
        IdUtilisateur: userId,
      },
      select: {
        MotDePasse: true,
      },
      orderBy: {
        IdAncienMotPasse: "desc",
      },
      take: historyCount,
    });

    // Récupérer aussi le mot de passe actuel
    const currentUser = await prisma.t_utilisateur.findUnique({
      where: { IdUtilisateur: userId },
      select: { Mot_de_passe: true },
    });

    // Vérifier le mot de passe actuel
    if (currentUser?.Mot_de_passe) {
      const matchesCurrent = await bcrypt.compare(
        newPassword,
        currentUser.Mot_de_passe
      );
      if (matchesCurrent) {
        return { isReused: true, matchingHash: currentUser.Mot_de_passe };
      }
    }

    // Vérifier les anciens mots de passe
    for (const oldPassword of oldPasswords) {
      if (oldPassword.MotDePasse) {
        const matches = await bcrypt.compare(newPassword, oldPassword.MotDePasse);
        if (matches) {
          return { isReused: true, matchingHash: oldPassword.MotDePasse };
        }
      }
    }

    return { isReused: false };
  } catch (error) {
    console.error("Error checking password history:", error);
    // En cas d'erreur, on ne bloque pas (principe de sécurité fail-open sur cette vérification)
    return { isReused: false };
  }
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
