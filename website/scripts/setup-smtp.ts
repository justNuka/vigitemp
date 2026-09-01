/**
 * Script to set up SMTP configuration in the database
 * Run with: npx tsx scripts/setup-smtp.ts
 */

import { PrismaClient } from "../src/generated/@prisma-db-main/client";

const prisma = new PrismaClient();

async function setupSMTP() {
  const smtpConfig = [
    {
      section: "SECURITE_EMAIL",
      mot_Cle: "SMTP_SERVEUR",
      valeur: "smtp-randommail18473.alwaysdata.net",
      commentaire: "Serveur SMTP pour l'envoi d'emails",
    },
    {
      section: "SECURITE_EMAIL",
      mot_Cle: "SMTP_PORT",
      valeur: "587",
      commentaire: "Port SMTP (587 pour TLS, 465 pour SSL)",
    },
    {
      section: "SECURITE_EMAIL",
      mot_Cle: "SMTP_UTILISATEUR",
      valeur: "randommail18473@alwaysdata.net",
      commentaire: "Utilisateur SMTP",
    },
    {
      section: "SECURITE_EMAIL",
      mot_Cle: "SMTP_MOT_DE_PASSE",
      valeur: "Password-123",
      commentaire: "Mot de passe SMTP",
    },
    {
      section: "SECURITE_EMAIL",
      mot_Cle: "SMTP_EXPEDITEUR",
      valeur: "noreply@alwaysdata.net",
      commentaire: "Adresse email expéditeur (doit correspondre au domaine SMTP)",
    },
    {
      section: "SECURITE_EMAIL",
      mot_Cle: "SMTP_ACTIVATION",
      valeur: "true",
      commentaire: "Activer l'envoi d'emails",
    },
  ];

  console.log("🔧 Setting up SMTP configuration...\n");

  for (const config of smtpConfig) {
    try {
      const result = await prisma.t_parametre.upsert({
        where: {
          Section_Mot_Cle: {
            Section: config.section,
            Mot_Cle: config.mot_Cle,
          },
        },
        update: {
          Valeur: config.valeur,
          Commentaire: config.commentaire,
        },
        create: {
          Section: config.section,
          Mot_Cle: config.mot_Cle,
          Valeur: config.valeur,
          Commentaire: config.commentaire,
        },
      });

      console.log(`✓ ${config.mot_Cle}: ${config.valeur}`);
    } catch (error) {
      console.error(`✗ Failed to set ${config.mot_Cle}:`, error);
    }
  }

  console.log("\n✅ SMTP configuration completed!");
  console.log("\nYou can now:");
  console.log("1. Test the configuration at http://localhost:3000/admin/smtp-settings");
  console.log("2. Send password reset emails");
  console.log("\nTo change these settings later:");
  console.log("- Use the admin page at /admin/smtp-settings");
  console.log("- Or run: npx tsx scripts/setup-smtp.ts again");
}

setupSMTP()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
