import { prisma } from "@/lib/prisma"

type RawQueryClient = Pick<typeof prisma, "$queryRaw">

export function normalizeLocationName(name: string) {
  return name.trim()
}

export async function findLocationNameConflict(
  client: RawQueryClient,
  name: string,
  excludeId?: number,
) {
  const normalizedName = normalizeLocationName(name)
  if (!normalizedName) {
    return null
  }

  const provider = (process.env.DATABASE_PROVIDER ?? "mysql").toLowerCase()
  const isSqlServer = provider === "sqlserver" || provider === "mssql"

  if (isSqlServer) {
    const rows =
      typeof excludeId === "number"
        ? await client.$queryRaw<Array<{ Id_Lieu: number; Nom_Lieu: string | null }>>`
            SELECT TOP 1 Id_Lieu, Nom_Lieu
            FROM t_lieu
            WHERE LOWER(LTRIM(RTRIM(Nom_Lieu))) = LOWER(${normalizedName})
              AND Id_Lieu <> ${excludeId}
          `
        : await client.$queryRaw<Array<{ Id_Lieu: number; Nom_Lieu: string | null }>>`
            SELECT TOP 1 Id_Lieu, Nom_Lieu
            FROM t_lieu
            WHERE LOWER(LTRIM(RTRIM(Nom_Lieu))) = LOWER(${normalizedName})
          `

    return rows[0] ?? null
  }

  const rows =
    typeof excludeId === "number"
      ? await client.$queryRaw<Array<{ Id_Lieu: number; Nom_Lieu: string | null }>>`
          SELECT Id_Lieu, Nom_Lieu
          FROM t_lieu
          WHERE LOWER(TRIM(Nom_Lieu)) = LOWER(${normalizedName})
            AND Id_Lieu <> ${excludeId}
          LIMIT 1
        `
      : await client.$queryRaw<Array<{ Id_Lieu: number; Nom_Lieu: string | null }>>`
          SELECT Id_Lieu, Nom_Lieu
          FROM t_lieu
          WHERE LOWER(TRIM(Nom_Lieu)) = LOWER(${normalizedName})
          LIMIT 1
        `

  return rows[0] ?? null
}
