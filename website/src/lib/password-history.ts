import "server-only";

import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { log } from "@/lib/logger";

/**
 * Verifie si un mot de passe a deja ete utilise par l'utilisateur
 * @param userId ID de l'utilisateur
 * @param newPassword Le nouveau mot de passe en clair
 * @returns true si le mot de passe est deja utilise, false sinon
 */
export async function checkPasswordHistory(
  userId: number,
  newPassword: string
): Promise<{ isReused: boolean; matchingHash?: string }> {
  try {
    const oldPasswords = await prisma.t_ancien_mot_de_passe.findMany({
      where: {
        Id_Utilisateur: userId,
      },
      select: {
        Mot_De_Passe: true,
      },
      orderBy: {
        Id_Ancien_Mot_De_Passe: "desc",
      },
    });

    const currentUser = await prisma.t_utilisateur.findUnique({
      where: { Id_Utilisateur: userId },
      select: { Mot_De_Passe: true },
    });

    if (currentUser?.Mot_De_Passe) {
      const matchesCurrent = await bcrypt.compare(
        newPassword,
        currentUser.Mot_De_Passe
      );
      if (matchesCurrent) {
        return { isReused: true, matchingHash: currentUser.Mot_De_Passe };
      }
    }

    for (const oldPassword of oldPasswords) {
      if (oldPassword.Mot_De_Passe) {
        const matches = await bcrypt.compare(
          newPassword,
          oldPassword.Mot_De_Passe
        );
        if (matches) {
          return { isReused: true, matchingHash: oldPassword.Mot_De_Passe };
        }
      }
    }

    return { isReused: false };
  } catch (error) {
    log.error("password-history", "password_history_check_failed", { error });
    return { isReused: false };
  }
}
