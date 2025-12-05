import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/settings/password-rules
 * Récupère toutes les règles de validation des mots de passe depuis t_parametre
 */
export async function GET() {
  try {
    // Récupérer tous les paramètres de sécurité des mots de passe
    const params = await prisma.t_parametre.findMany({
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

    // Transformer en objet avec des valeurs numériques
    const rules = params.reduce(
      (acc, param) => {
        const key = param.MotCle;
        const value = parseInt(param.Valeur || "0", 10);
        acc[key] = value;
        return acc;
      },
      {} as Record<string, number>
    );

    // Vérifier que tous les paramètres nécessaires existent
    const requiredKeys = [
      "password_min_length",
      "password_min_uppercase",
      "password_min_lowercase",
      "password_min_numbers",
      "password_min_special",
      "password_history_count",
    ];

    const missingKeys = requiredKeys.filter((key) => !(key in rules));

    if (missingKeys.length > 0) {
      console.error(
        "⚠️ Paramètres de sécurité manquants:",
        missingKeys.join(", ")
      );
      console.error(
        "💡 Lancez: npx tsx scripts/seed-password-params.ts pour les créer"
      );
    }

    // Retourner avec des valeurs par défaut si manquantes
    return NextResponse.json({
      min_length: rules.password_min_length ?? 8,
      min_uppercase: rules.password_min_uppercase ?? 1,
      min_lowercase: rules.password_min_lowercase ?? 1,
      min_numbers: rules.password_min_numbers ?? 1,
      min_special: rules.password_min_special ?? 1,
      history_count: rules.password_history_count ?? 5,
    });
  } catch (error) {
    console.error("Error fetching password rules:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des règles de mot de passe" },
      { status: 500 }
    );
  }
}
