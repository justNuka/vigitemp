import { prisma } from "@/lib/prisma"

let ensured: boolean | null = null

export async function ensureVigilogTemporaryUsageTable() {
  if (ensured !== null) return ensured

  const rows = await prisma.$queryRaw<Array<{ present: number }>>`
    SELECT 1 AS present
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 't_vigilog_usage_ponctuel'
    LIMIT 1
  `

  ensured = rows.length > 0
  return ensured
}
