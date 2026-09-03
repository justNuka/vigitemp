import { MssqlDialect } from "kysely"
import { createPool } from "mysql2/promise"
import * as Tarn from "tarn"
import * as Tedious from "tedious"

export type BetterAuthPocDatabaseProvider = "mysql" | "mssql"

type SqlServerConnectionOptions = {
  server: string
  port: number
  database: string
  user: string
  password: string
  encrypt: boolean
  trustServerCertificate: boolean
}

function requireDatabaseUrl(databaseUrl?: string) {
  const value = databaseUrl?.trim() || process.env.DATABASE_URL?.trim()
  if (!value) {
    throw new Error("[better-auth-poc] DATABASE_URL is required")
  }
  return value
}

function decodeConnectionValue(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback
  return ["1", "true", "yes"].includes(value.trim().toLowerCase())
}

function parseSqlServerHost(authority: string) {
  if (authority.startsWith("[")) {
    const end = authority.indexOf("]")
    if (end < 0) throw new Error("[better-auth-poc] Invalid SQL Server host")
    const server = authority.slice(1, end)
    const portPart = authority.slice(end + 1)
    const port = portPart.startsWith(":") ? Number.parseInt(portPart.slice(1), 10) : 1433
    return { server, port: Number.isFinite(port) ? port : 1433 }
  }

  const separator = authority.lastIndexOf(":")
  if (separator < 0) return { server: authority, port: 1433 }

  const parsedPort = Number.parseInt(authority.slice(separator + 1), 10)
  if (!Number.isFinite(parsedPort)) return { server: authority, port: 1433 }
  return { server: authority.slice(0, separator), port: parsedPort }
}

export function parsePrismaSqlServerUrl(databaseUrl: string): SqlServerConnectionOptions {
  const prefix = "sqlserver://"
  if (!databaseUrl.toLowerCase().startsWith(prefix)) {
    throw new Error("[better-auth-poc] Expected a sqlserver:// DATABASE_URL")
  }

  const parts = databaseUrl.slice(prefix.length).split(";")
  const authority = parts.shift()?.trim()
  if (!authority) throw new Error("[better-auth-poc] SQL Server host is missing")

  const values = new Map<string, string>()
  for (const part of parts) {
    const separator = part.indexOf("=")
    if (separator <= 0) continue
    values.set(part.slice(0, separator).trim().toLowerCase(), decodeConnectionValue(part.slice(separator + 1).trim()))
  }

  const { server, port } = parseSqlServerHost(authority)
  const database = values.get("database")
  const user = values.get("user")
  const password = values.get("password")

  if (!server || !database || !user || password === undefined) {
    throw new Error("[better-auth-poc] SQL Server DATABASE_URL must include host, database, user and password")
  }

  return {
    server,
    port,
    database,
    user,
    password,
    encrypt: parseBoolean(values.get("encrypt"), true),
    trustServerCertificate: parseBoolean(values.get("trustservercertificate"), false),
  }
}

export function getBetterAuthPocDatabaseProvider(databaseUrl?: string): BetterAuthPocDatabaseProvider {
  const url = requireDatabaseUrl(databaseUrl).toLowerCase()
  const configured = process.env.DATABASE_PROVIDER?.trim().toLowerCase()
  if (configured === "mssql" || configured === "sqlserver" || url.startsWith("sqlserver://")) return "mssql"
  if (configured === "mysql" || url.startsWith("mysql://") || url.startsWith("mariadb://")) return "mysql"
  throw new Error("[better-auth-poc] Unsupported DATABASE_PROVIDER for Better Auth PoC")
}

function createMysqlDatabase(databaseUrl: string) {
  const normalizedUrl = databaseUrl.replace(/^mariadb:/i, "mysql:")
  const parsed = new URL(normalizedUrl)
  const database = decodeConnectionValue(parsed.pathname.replace(/^\//, ""))
  if (!database) throw new Error("[better-auth-poc] MySQL database name is missing")

  return createPool({
    host: parsed.hostname,
    port: parsed.port ? Number.parseInt(parsed.port, 10) : 3306,
    user: decodeConnectionValue(parsed.username),
    password: decodeConnectionValue(parsed.password),
    database,
    timezone: "Z",
    connectionLimit: 10,
  })
}

function createMssqlDatabase(databaseUrl: string) {
  const config = parsePrismaSqlServerUrl(databaseUrl)
  const dialect = new MssqlDialect({
    tarn: {
      ...Tarn,
      options: {
        min: 0,
        max: 10,
      },
    },
    tedious: {
      ...Tedious,
      connectionFactory: () =>
        new Tedious.Connection({
          server: config.server,
          authentication: {
            type: "default",
            options: {
              userName: config.user,
              password: config.password,
            },
          },
          options: {
            database: config.database,
            port: config.port,
            encrypt: config.encrypt,
            trustServerCertificate: config.trustServerCertificate,
          },
        }),
    },
    TYPES: {
      ...Tedious.TYPES,
      DateTime: Tedious.TYPES.DateTime2,
    },
  })

  return {
    dialect,
    type: "mssql" as const,
  }
}

export function createBetterAuthPocDatabase(databaseUrl?: string) {
  const url = requireDatabaseUrl(databaseUrl)
  return getBetterAuthPocDatabaseProvider(url) === "mssql" ? createMssqlDatabase(url) : createMysqlDatabase(url)
}
