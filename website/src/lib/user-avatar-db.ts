import { prisma } from "@/lib/prisma"

let avatarColumnExistsCache: boolean | null = null

function isMssqlProvider() {
  const provider = process.env.DATABASE_PROVIDER?.trim().toLowerCase()
  return provider === "mssql" || provider === "sqlserver"
}

function asNumber(value: unknown) {
  if (typeof value === "number") return value
  if (typeof value === "bigint") return Number(value)
  if (typeof value === "string") return Number(value)
  return 0
}

export async function hasUserAvatarColumn() {
  if (avatarColumnExistsCache !== null) {
    return avatarColumnExistsCache
  }

  try {
    const rows = isMssqlProvider()
      ? await prisma.$queryRaw<Array<{ cnt: number | bigint | string }>>`
          SELECT COUNT(*) AS cnt
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = 'dbo'
            AND TABLE_NAME = 't_utilisateur'
            AND COLUMN_NAME = 'Avatar_Utilisateur'
        `
      : await prisma.$queryRaw<Array<{ cnt: number | bigint | string }>>`
          SELECT COUNT(*) AS cnt
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 't_utilisateur'
            AND COLUMN_NAME = 'Avatar_Utilisateur'
        `

    avatarColumnExistsCache = asNumber(rows?.[0]?.cnt ?? 0) > 0
    return avatarColumnExistsCache
  } catch {
    avatarColumnExistsCache = false
    return false
  }
}

export async function getUserAvatarValue(userId: number) {
  if (!(await hasUserAvatarColumn())) return null

  try {
    const rows = isMssqlProvider()
      ? await prisma.$queryRaw<Array<{ Avatar_Utilisateur: string | null }>>`
          SELECT TOP 1 Avatar_Utilisateur
          FROM t_utilisateur
          WHERE Id_Utilisateur = ${userId}
        `
      : await prisma.$queryRawUnsafe<Array<{ Avatar_Utilisateur: string | null }>>(
          "SELECT Avatar_Utilisateur FROM t_utilisateur WHERE Id_Utilisateur = ? LIMIT 1",
          userId,
        )

    return rows?.[0]?.Avatar_Utilisateur ?? null
  } catch {
    return null
  }
}

export async function getUserAvatarMap(userIds: number[]) {
  const map = new Map<number, string | null>()
  if (userIds.length === 0) return map
  if (!(await hasUserAvatarColumn())) return map

  const placeholders = userIds.map(() => "?").join(",")

  try {
    const rows = isMssqlProvider()
      ? await prisma.t_utilisateur.findMany({
          where: {
            Id_Utilisateur: {
              in: userIds,
            },
          },
          select: {
            Id_Utilisateur: true,
            Avatar_Utilisateur: true,
          },
        })
      : await prisma.$queryRawUnsafe<Array<{ Id_Utilisateur: number; Avatar_Utilisateur: string | null }>>(
          `SELECT Id_Utilisateur, Avatar_Utilisateur FROM t_utilisateur WHERE Id_Utilisateur IN (${placeholders})`,
          ...userIds,
        )

    for (const row of rows) {
      map.set(Number(row.Id_Utilisateur), row.Avatar_Utilisateur ?? null)
    }
  } catch {
    // Ignore: feature disabled when column does not exist.
  }

  return map
}

export async function setUserAvatarValue(userId: number, avatarValue: string | null) {
  if (!(await hasUserAvatarColumn())) return false

  try {
    await prisma.$executeRaw`UPDATE t_utilisateur SET Avatar_Utilisateur = ${avatarValue} WHERE Id_Utilisateur = ${userId}`
    return true
  } catch {
    return false
  }
}
