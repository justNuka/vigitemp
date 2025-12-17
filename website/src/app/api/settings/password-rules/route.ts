import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/settings/password-rules
 * Récupère toutes les règles de validation des mots de passe depuis t_parametre
 * Utilise la nouvelle structure avec les sections:
 * - SECURITE_MOT_DE_PASSE: Règles de complexity (longueur, majuscules, minuscules, chiffres, caractères spéciaux)
 * - CFR21: Paramètres réglementaires (expiration, historique, activation CFR21)
 */
export async function GET() {
  try {
    // Récupérer les paramètres de sécurité des mots de passe (SECURITE_MOT_DE_PASSE)
    const securityParams = await prisma.t_parametre.findMany({
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

    // Transformer en objets avec des valeurs numériques
    const securityRules = securityParams.reduce(
      (acc, param) => {
        acc[param.Mot_Cle] = parseInt(param.Valeur || "0", 10);
        return acc;
      },
      {} as Record<string, number>
    );

    const cfr21Rules = cfr21Params.reduce(
      (acc, param) => {
        if (param.Mot_Cle === "ACTIVATION_NORME_CFR21") {
          acc[param.Mot_Cle] = param.Valeur === "1" || param.Valeur?.toLowerCase() === "true";
        } else {
          acc[param.Mot_Cle] = parseInt(param.Valeur || "0", 10);
        }
        return acc;
      },
      {} as Record<string, number | boolean>
    );

    // Vérifier que tous les paramètres nécessaires existent
    const requiredSecurityKeys = [
      "LONGUEUR_MINIMALE",
      "MIN_LETTRES_MAJUSCULES",
      "MIN_LETTRES_MINUSCULES",
      "MIN_CHIFFRES",
      "MIN_CARACTERES_SPECIAUX",
    ];

    const missingSecurityKeys = requiredSecurityKeys.filter((key) => !(key in securityRules));

    if (missingSecurityKeys.length > 0) {
      console.warn(
        "⚠️ Paramètres de sécurité manquants:",
        missingSecurityKeys.join(", ")
      );
    }

    // Retourner avec des valeurs par défaut si manquantes
    return NextResponse.json({
      min_length: securityRules.LONGUEUR_MINIMALE ?? 8,
      min_uppercase: securityRules.MIN_LETTRES_MAJUSCULES ?? 1,
      min_lowercase: securityRules.MIN_LETTRES_MINUSCULES ?? 1,
      min_numbers: securityRules.MIN_CHIFFRES ?? 1,
      min_special: securityRules.MIN_CARACTERES_SPECIAUX ?? 1,
      // Paramètres CFR21
      cfr21_enabled: (cfr21Rules.ACTIVATION_NORME_CFR21 as boolean) ?? false,
      history_count: (cfr21Rules.NOMBRE_ANCIENS_MOT_DE_PASSE as number) ?? 5,
      expiry_days: (cfr21Rules.JOURS_VALIDITE_MOT_DE_PASSE as number) ?? 90,
      expiry_enabled: (cfr21Rules.ACTIVATION_EXPIRATION_MOT_DE_PASSE as boolean) ?? false,
    });
  } catch (error) {
    console.error("Error fetching password rules:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des règles de mot de passe" },
      { status: 500 }
    );
  }
}
