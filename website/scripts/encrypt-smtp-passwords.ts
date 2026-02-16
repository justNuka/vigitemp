import "dotenv/config"

import { prisma } from "../src/lib/prisma"
import { encryptSmtpPassword, isEncryptedSmtpPassword } from "../src/lib/secret-crypto"

type CliOptions = {
  password?: string
  secretKey?: string
  dryRun: boolean
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { dryRun: false }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === "--dry-run") {
      options.dryRun = true
      continue
    }

    if (arg.startsWith("--password=")) {
      options.password = arg.slice("--password=".length)
      continue
    }

    if (arg === "--password") {
      options.password = argv[i + 1] ?? ""
      i += 1
      continue
    }

    if (arg.startsWith("--secret-key=")) {
      options.secretKey = arg.slice("--secret-key=".length)
      continue
    }

    if (arg === "--secret-key") {
      options.secretKey = argv[i + 1] ?? ""
      i += 1
      continue
    }
  }

  return options
}

async function main() {
  const options = parseArgs(process.argv.slice(2))

  if (options.secretKey) {
    process.env.SMTP_SECRET_KEY = options.secretKey
  }

  try {
    const rows = await prisma.t_parametre.findMany({
      where: { Mot_Cle: "SMTP_MOT_DE_PASSE" },
      select: { Section: true, Mot_Cle: true, Valeur: true },
    })

    const targets = rows.filter((row) => {
      const value = row.Valeur ?? ""
      if (!value) return false
      if (isEncryptedSmtpPassword(value)) return false
      if (typeof options.password === "string") {
        return value === options.password
      }
      return true
    })

    if (targets.length === 0) {
      console.log("Aucune valeur SMTP en clair a chiffrer.")
      return
    }

    console.log(`Lignes ciblees: ${targets.length}`)

    if (options.dryRun) {
      for (const row of targets) {
        console.log(`- ${row.Section}.${row.Mot_Cle}`)
      }
      console.log("Mode dry-run: aucune modification en base.")
      return
    }

    for (const row of targets) {
      const encrypted = encryptSmtpPassword(row.Valeur ?? "")

      await prisma.t_parametre.update({
        where: {
          Section_Mot_Cle: {
            Section: row.Section,
            Mot_Cle: row.Mot_Cle,
          },
        },
        data: { Valeur: encrypted },
      })
    }

    console.log(`Chiffrement termine. ${targets.length} ligne(s) mise(s) a jour.`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error("Erreur script chiffrement SMTP:", error)
  process.exit(1)
})
