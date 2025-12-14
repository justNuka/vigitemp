import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";
import { validatePassword, checkPasswordHistory } from "@/lib/password-validation";
import { PasswordRules } from "@/lib/api";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { log } from "@/lib/logger";
import { getRequestContext } from "@/lib/api-logger";

const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "L'ancien mot de passe est requis"),
  newPassword: z.string().min(1, "Le nouveau mot de passe est requis"),
  confirmPassword: z.string().min(1, "La confirmation est requise"),
});

/**
 * POST /api/profile/change-password
 * Change le mot de passe de l'utilisateur authentifié
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const user = getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // 2. Valider les données reçues
    const body = await req.json();
    const { oldPassword, newPassword, confirmPassword } = changePasswordSchema.parse(body);

    // 3. Vérifier que le nouveau mot de passe correspond à la confirmation
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Les mots de passe ne correspondent pas" },
        { status: 400 }
      );
    }

    // 4. Récupérer l'utilisateur depuis la base de données
    const dbUser = await prisma.t_utilisateur.findUnique({
      where: { Id_Utilisateur: user.userId },
      select: {
        Id_Utilisateur: true,
        Mot_De_Passe: true,
      },
    });

    if (!dbUser || !dbUser.Mot_De_Passe) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // 5. Vérifier que l'ancien mot de passe est correct
    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      dbUser.Mot_De_Passe as string
    );

    if (!isOldPasswordValid) {
      return NextResponse.json(
        { error: "L'ancien mot de passe est incorrect" },
        { status: 400 }
      );
    }

    // 6. Récupérer les règles de mot de passe
    const rulesParams = await prisma.t_parametre.findMany({
      where: {
        Section: "security",
        MotCle: {
          startsWith: "password_",
        },
      },
      select: {
        MotCle: true,
        Valeur: true,
      },
    });

    const rules: PasswordRules = {
      min_length: parseInt(rulesParams.find(p => p.MotCle === "password_min_length")?.Valeur || "8", 10),
      min_uppercase: parseInt(rulesParams.find(p => p.MotCle === "password_min_uppercase")?.Valeur || "1", 10),
      min_lowercase: parseInt(rulesParams.find(p => p.MotCle === "password_min_lowercase")?.Valeur || "1", 10),
      min_numbers: parseInt(rulesParams.find(p => p.MotCle === "password_min_numbers")?.Valeur || "1", 10),
      min_special: parseInt(rulesParams.find(p => p.MotCle === "password_min_special")?.Valeur || "1", 10),
      history_count: 0, // Not used anymore, but kept for type compatibility
    };

    // 7. Valider le nouveau mot de passe
    const validation = validatePassword(newPassword, rules);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Le mot de passe ne respecte pas les règles de sécurité",
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    // 8. Vérifier l'historique des mots de passe (tous les anciens mots de passe)
    const historyCheck = await checkPasswordHistory(
      user.userId,
      newPassword
    );

    if (historyCheck.isReused) {
      return NextResponse.json(
        {
          error: "Vous ne pouvez pas réutiliser l'un de vos anciens mots de passe",
        },
        { status: 400 }
      );
    }

    // 9. Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 10. Sauvegarder l'ancien mot de passe dans l'historique
    await prisma.t_ancien_mot_de_passe.create({
      data: {
        Id_Utilisateur: user.userId,
        Mot_De_Passe: dbUser.Mot_De_Passe as string,
      },
    });

    // 11. Mettre à jour le mot de passe et la date de dernière modification
    await prisma.t_utilisateur.update({
      where: { Id_Utilisateur: user.userId },
      data: {
        Mot_De_Passe: hashedPassword,
        Date_Derniere_Modification_MDP: new Date(),
      },
    });

    // 12. Logger le changement de mot de passe
    const { ip } = getRequestContext(req);
    log.auth.passwordChange(user.username, user.userId, ip, false);

    // 13. Succès !
    return NextResponse.json({
      message: "Mot de passe changé avec succès",
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Erreur lors du changement de mot de passe" },
      { status: 500 }
    );
  }
}
