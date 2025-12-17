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
        Est_Mot_De_Passe_Temporaire: true,
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

    // 6. Récupérer les règles de mot de passe depuis SECURITE_MOT_DE_PASSE
    const rulesParams = await prisma.t_parametre.findMany({
      where: {
        Section: "SECURITE_MOT_DE_PASSE",
      },
      select: {
        Mot_Cle: true,
        Valeur: true,
      },
    });

    // Récupérer les paramètres CFR21
    const cfr21Params = await prisma.t_parametre.findMany({
      where: {
        Section: "CFR21",
      },
      select: {
        Mot_Cle: true,
        Valeur: true,
      },
    });

    const rules: PasswordRules = {
      min_length: parseInt(rulesParams.find(p => p.Mot_Cle === "LONGUEUR_MINIMALE")?.Valeur || "8", 10),
      min_uppercase: parseInt(rulesParams.find(p => p.Mot_Cle === "MIN_LETTRES_MAJUSCULES")?.Valeur || "1", 10),
      min_lowercase: parseInt(rulesParams.find(p => p.Mot_Cle === "MIN_LETTRES_MINUSCULES")?.Valeur || "1", 10),
      min_numbers: parseInt(rulesParams.find(p => p.Mot_Cle === "MIN_CHIFFRES")?.Valeur || "1", 10),
      min_special: parseInt(rulesParams.find(p => p.Mot_Cle === "MIN_CARACTERES_SPECIAUX")?.Valeur || "1", 10),
      cfr21_enabled: cfr21Params.find(p => p.Mot_Cle === "ACTIVATION_NORME_CFR21")?.Valeur === "1" || cfr21Params.find(p => p.Mot_Cle === "ACTIVATION_NORME_CFR21")?.Valeur?.toLowerCase() === "true" || false,
      history_count: parseInt(cfr21Params.find(p => p.Mot_Cle === "NOMBRE_ANCIENS_MOT_DE_PASSE")?.Valeur || "5", 10),
      expiry_days: parseInt(cfr21Params.find(p => p.Mot_Cle === "JOURS_VALIDITE_MOT_DE_PASSE")?.Valeur || "90", 10),
      expiry_enabled: cfr21Params.find(p => p.Mot_Cle === "ACTIVATION_EXPIRATION_MOT_DE_PASSE")?.Valeur === "1" || cfr21Params.find(p => p.Mot_Cle === "ACTIVATION_EXPIRATION_MOT_DE_PASSE")?.Valeur?.toLowerCase() === "true" || false,
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

    // 10. Vérifier si c'est une première connexion (mdp temporaire)
    const isFirstPasswordChange = dbUser.Est_Mot_De_Passe_Temporaire === true;

    // 11. Sauvegarder l'ancien mot de passe dans l'historique
    // Si c'est la première connexion, marquer le flag Est_Premiere_Connexion
    await prisma.t_ancien_mot_de_passe.create({
      data: {
        Id_Utilisateur: user.userId,
        Mot_De_Passe: dbUser.Mot_De_Passe as string,
        Est_Premiere_Connexion: isFirstPasswordChange,
      },
    });

    // 12. Mettre à jour le mot de passe, la date de modification et le flag temporaire
    await prisma.t_utilisateur.update({
      where: { Id_Utilisateur: user.userId },
      data: {
        Mot_De_Passe: hashedPassword,
        Date_Derniere_Modification_MDP: new Date(),
        Est_Mot_De_Passe_Temporaire: false, // Plus temporaire après première modif
      },
    });

    // 13. Logger le changement de mot de passe
    const { ip } = getRequestContext(req);
    const logMessage = isFirstPasswordChange 
      ? "Première modification du mot de passe (temporaire)" 
      : "Changement de mot de passe";
    log.auth.passwordChange(user.username, user.userId, ip, false);

    // 14. Succès !
    return NextResponse.json({
      message: "Mot de passe changé avec succès",
      isFirstPasswordChange,
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
