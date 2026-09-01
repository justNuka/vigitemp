import { prisma } from "@/lib/prisma"

const columnExistsCache = new Map<string, boolean>()
const tableExistsCache = new Map<string, boolean>()

function asNumber(value: unknown) {
  if (typeof value === "number") return value
  if (typeof value === "bigint") return Number(value)
  if (typeof value === "string") return Number(value)
  return 0
}

function isMssqlProvider() {
  const provider = process.env.DATABASE_PROVIDER?.trim().toLowerCase()
  const url = process.env.DATABASE_URL?.trim().toLowerCase() ?? ""
  return provider === "mssql" || provider === "sqlserver" || url.startsWith("sqlserver://")
}

export async function hasMainDbColumn(tableName: string, columnName: string) {
  const cacheKey = `${tableName}.${columnName}`.toLowerCase()
  const cached = columnExistsCache.get(cacheKey)
  if (cached !== undefined) return cached

  try {
    const rows = isMssqlProvider()
      ? await prisma.$queryRaw<Array<{ cnt: number | bigint | string }>>`
          SELECT COUNT(*) AS cnt
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = 'dbo'
            AND TABLE_NAME = ${tableName}
            AND COLUMN_NAME = ${columnName}
        `
      : await prisma.$queryRaw<Array<{ cnt: number | bigint | string }>>`
          SELECT COUNT(*) AS cnt
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ${tableName}
            AND COLUMN_NAME = ${columnName}
        `

    const exists = asNumber(rows?.[0]?.cnt ?? 0) > 0
    columnExistsCache.set(cacheKey, exists)
    return exists
  } catch {
    columnExistsCache.set(cacheKey, false)
    return false
  }
}

export async function hasMainDbTable(tableName: string) {
  const cacheKey = tableName.toLowerCase()
  const cached = tableExistsCache.get(cacheKey)
  if (cached !== undefined) return cached

  try {
    const rows = isMssqlProvider()
      ? await prisma.$queryRaw<Array<{ cnt: number | bigint | string }>>`
          SELECT COUNT(*) AS cnt
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = 'dbo'
            AND TABLE_NAME = ${tableName}
        `
      : await prisma.$queryRaw<Array<{ cnt: number | bigint | string }>>`
          SELECT COUNT(*) AS cnt
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ${tableName}
        `

    const exists = asNumber(rows?.[0]?.cnt ?? 0) > 0
    tableExistsCache.set(cacheKey, exists)
    return exists
  } catch {
    tableExistsCache.set(cacheKey, false)
    return false
  }
}
