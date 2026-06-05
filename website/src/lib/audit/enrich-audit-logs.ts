import { prisma, prismaMesure } from "@/lib/prisma"

type RawAuditLog = {
  Id_Journal: number
  Date_Heure_Journal: Date | null
  Code_Journal: string | null
  Commentaire: string | null
  Nom_Utilisateur: string | null
  Id_Lieu: number | null
  Commentaire_Utilisateur?: string | null
  Profil_Utilisateur?: string | null
}

function extractIpAddress(details: string | null): string | null {
  if (!details) return null
  const match = details.replace(/::ffff:/g, "").match(/(?:^|\|)\s*IP:\s*([^|]+)/i)
  return match?.[1]?.trim() || null
}

export async function enrichAuditLogs(logs: RawAuditLog[]) {
  const usernames = Array.from(
    new Set(logs.map((log) => log.Nom_Utilisateur?.trim()).filter((value): value is string => !!value)),
  )
  const lieuIds = Array.from(
    new Set(logs.map((log) => log.Id_Lieu).filter((value): value is number => typeof value === "number" && value > 0)),
  )

  const [users, lieux] = await Promise.all([
    usernames.length > 0
      ? prisma.t_utilisateur.findMany({
          where: { Login: { in: usernames } },
          select: { Login: true, Prenom: true, Nom: true },
        })
      : Promise.resolve([]),
    lieuIds.length > 0
      ? prisma.t_lieu.findMany({
          where: { Id_Lieu: { in: lieuIds } },
          select: { Id_Lieu: true, Nom_Lieu: true },
        })
      : Promise.resolve([]),
  ])

  const userDisplayMap = new Map<string, string>()
  for (const user of users) {
    if (!user.Login) continue
    const displayName = `${user.Prenom || ""} ${user.Nom || ""}`.trim()
    if (displayName) {
      userDisplayMap.set(user.Login, displayName)
    }
  }

  const lieuNameMap = new Map<number, string>()
  for (const lieu of lieux) {
    if (lieu.Nom_Lieu?.trim()) {
      lieuNameMap.set(lieu.Id_Lieu, lieu.Nom_Lieu.trim())
    }
  }

  return logs.map((log) => ({
    id: String(log.Id_Journal),
    userId: log.Nom_Utilisateur || null,
    userDisplayName: log.Nom_Utilisateur ? userDisplayMap.get(log.Nom_Utilisateur) ?? null : null,
    action: log.Code_Journal || "unknown",
    details: log.Commentaire || null,
    targetType: log.Id_Lieu ? "location" : null,
    targetId: log.Id_Lieu ? String(log.Id_Lieu) : null,
    timestamp: log.Date_Heure_Journal || new Date(),
    ipAddress: extractIpAddress(log.Commentaire),
    commentaireUtilisateur: log.Commentaire_Utilisateur || null,
    profileUtilisateur: log.Profil_Utilisateur || null,
    locationName: log.Id_Lieu ? lieuNameMap.get(log.Id_Lieu) ?? null : null,
  }))
}

export async function loadRecentAuditLogs(limit = 100, codeFilter?: string) {
  const whereClause = codeFilter ? { Code_Journal: codeFilter } : {}

  const logs = await prismaMesure.tm_journal.findMany({
    where: whereClause,
    take: limit,
    orderBy: { Date_Heure_Journal: "desc" },
    select: {
      Id_Journal: true,
      Date_Heure_Journal: true,
      Code_Journal: true,
      Commentaire: true,
      Nom_Utilisateur: true,
      Id_Lieu: true,
      Commentaire_Utilisateur: true,
      Profil_Utilisateur: true,
    },
  })

  return enrichAuditLogs(logs)
}
