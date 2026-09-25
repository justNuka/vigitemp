import type { DbDateInput } from "@/lib/date-display"
import {
  serializePrismaStoredDbDateTimeForProvider,
  toPrismaStoredDbDateTimeForProvider,
} from "@/lib/date-display"
import { prisma } from "@/lib/prisma"

type RawQueryClient = Pick<typeof prisma, "$queryRaw">

export function isMssqlProvider() {
  const provider = process.env.DATABASE_PROVIDER?.trim().toLowerCase()
  const url = process.env.DATABASE_URL?.trim().toLowerCase() ?? ""
  return provider === "mssql" || provider === "sqlserver" || url.startsWith("sqlserver://")
}

export function getStoredDbPrismaProvider(): "mysql" | "mssql" {
  return isMssqlProvider() ? "mssql" : "mysql"
}

export function serializePrismaStoredDbDateTime(value: DbDateInput): string | null {
  return serializePrismaStoredDbDateTimeForProvider(value, getStoredDbPrismaProvider())
}

export function toPrismaStoredDbDateTime(value: DbDateInput): Date | null {
  return toPrismaStoredDbDateTimeForProvider(value, getStoredDbPrismaProvider())
}

export async function getDbNow(client: RawQueryClient): Promise<Date> {
  const rows = isMssqlProvider()
    ? await client.$queryRaw<Array<{ currentDate: Date }>>`SELECT GETDATE() AS currentDate`
    : await client.$queryRaw<Array<{ currentDate: Date }>>`SELECT NOW() AS currentDate`

  return rows[0]?.currentDate ?? new Date()
}

export async function getDbDatePlusMinutes(client: RawQueryClient, minutes: number): Promise<Date> {
  const rows = isMssqlProvider()
    ? await client.$queryRaw<Array<{ targetDate: Date }>>`SELECT DATEADD(minute, ${minutes}, GETDATE()) AS targetDate`
    : await client.$queryRaw<Array<{ targetDate: Date }>>`SELECT DATE_ADD(NOW(), INTERVAL ${minutes} MINUTE) AS targetDate`

  return rows[0]?.targetDate ?? new Date(Date.now() + minutes * 60 * 1000)
}
