import "dotenv/config"

import { prismaMesure } from "../src/lib/prisma"

/**
 * Seed script — table tm_journal_code (db-mesures)
 *
 * Insère les codes journal de référence de manière idempotente (upsert).
 * Exécution : tsx scripts/seed-mesures-journal-codes.ts
 */

type JournalCodeEntry = {
  Code_Journal: string
  Commentaire: string
}

const JOURNAL_CODES: JournalCodeEntry[] = [
  {
    Code_Journal: "AIM",
    Commentaire: "Analyse d'impact des mesures",
  },
  {
    Code_Journal: "SONS",
    Commentaire: "Son des alarmes activé",
  },
  {
    Code_Journal: "SOND",
    Commentaire: "Son des alarmes désactivé",
  },
]

async function seedJournalCodes() {
  console.log("[seed] Début du seed tm_journal_code...")

  for (const entry of JOURNAL_CODES) {
    await prismaMesure.tm_journal_code.upsert({
      where: { Code_Journal: entry.Code_Journal },
      update: { Commentaire: entry.Commentaire },
      create: {
        Code_Journal: entry.Code_Journal,
        Commentaire: entry.Commentaire,
      },
    })
    console.log(`[seed] Code journal upserted : ${entry.Code_Journal} — ${entry.Commentaire}`)
  }

  console.log("[seed] Seed tm_journal_code terminé.")
}

seedJournalCodes()
  .catch((err) => {
    console.error("[seed] Erreur lors du seed :", err)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
