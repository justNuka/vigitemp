/**
 * Script pour créer les paramètres de sécurité des mots de passe
 * Lancer avec: npx tsx scripts/seed-password-params.ts
 */

import { PrismaClient } from "../src/generated/@prisma-db-main/client";

const prisma = new PrismaClient();

const SECURITY_PARAMS = [
  {
    Section: "security",
    MotCle: "password_min_length",
    Valeur: "8",
    Commentaire: "Nombre minimum de caractères pour un mot de passe",
  },
  {
    Section: "security",
    MotCle: "password_min_uppercase",
    Valeur: "1",
    Commentaire: "Nombre minimum de lettres majuscules requises",
  },
  {
    Section: "security",
    MotCle: "password_min_lowercase",
    Valeur: "1",
    Commentaire: "Nombre minimum de lettres minuscules requises",
  },
  {
    Section: "security",
    MotCle: "password_min_numbers",
    Valeur: "1",
    Commentaire: "Nombre minimum de chiffres requis",
  },
  {
    Section: "security",
    MotCle: "password_min_special",
    Valeur: "1",
    Commentaire: "Nombre minimum de caractères spéciaux requis (!@#$%^&* etc.)",
  },
  {
    Section: "security",
    MotCle: "password_history_count",
    Valeur: "5",
    Commentaire:
      "Nombre d'anciens mots de passe à vérifier pour empêcher la réutilisation",
  },
];

async function main() {
  console.log("🔐 Création des paramètres de sécurité des mots de passe...\n");

  for (const param of SECURITY_PARAMS) {
    try {
      // Vérifier si le paramètre existe déjà
      const existing = await prisma.t_parametre.findUnique({
        where: {
          Section_MotCle: {
            Section: param.Section,
            MotCle: param.MotCle,
          },
        },
      });

      if (existing) {
        console.log(
          `⏭️  Paramètre "${param.MotCle}" existe déjà (valeur: ${existing.Valeur})`
        );
        continue;
      }

      // Créer le paramètre
      await prisma.t_parametre.create({
        data: param,
      });

      console.log(
        `✅ Paramètre "${param.MotCle}" créé avec valeur: ${param.Valeur}`
      );
    } catch (error) {
      console.error(`❌ Erreur pour "${param.MotCle}":`, error);
    }
  }

  console.log("\n✨ Terminé !\n");
  console.log("📋 Résumé des paramètres de sécurité:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const allSecurityParams = await prisma.t_parametre.findMany({
    where: {
      Section: "security",
      MotCle: {
        startsWith: "password_",
      },
    },
    orderBy: {
      MotCle: "asc",
    },
  });

  allSecurityParams.forEach((param) => {
    console.log(`  ${param.MotCle.padEnd(30)} = ${param.Valeur}`);
    console.log(`    → ${param.Commentaire}`);
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
