import { MssqlDialect } from "kysely"
import { createPool } from "mysql2/promise"
import * as Tarn from "tarn"
import * as Tedious from "tedious"

export type BetterAuthDatabaseProvider = "mysql" | "mssql"

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
    throw new Error("[better-auth] DATABASE_URL is required")
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
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase())
}

function parseMysqlUrl(databaseUrl: string) {
  const normalized = databaseUrl.trim().replace(/^mariadb:/i, "mysql:")
  const parsed = new URL(normalized)
  if (parsed.protocol !== "mysql:") {
    throw new Error("[better-auth] Expected a mysql:// or mariadb:// DATABASE_URL")
  }

  const database = decodeConnectionValue(parsed.pathname.replace(/^\//, ""))
  const port = parsed.port ? Number.parseInt(parsed.port, 10) : 3306
  if (!parsed.hostname || !database || !Number.isFinite(port) || port <= 0 || port > 65535) {
    throw new Error("[better-auth] Invalid MySQL DATABASE_URL")
  }

  return {
    host: parsed.hostname,
    port,
    user: decodeConnectionValue(parsed.username),
    password: decodeConnectionValue(parsed.password),
    database,
  }
}

function parseSqlServerHost(authority: string) {
  if (authority.startsWith("[")) {
    const end = authority.indexOf("]")
    if (end < 0) throw new Error("[better-auth] Invalid SQL Server host")
    const server = authority.slice(1, end)
    const portPart = authority.slice(end + 1)
    const parsedPort = portPart.startsWith(":") ? Number.parseInt(portPart.slice(1), 10) : 1433
    return { server, port: Number.isFinite(parsedPort) ? parsedPort : 1433 }
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
    throw new Error("[better-auth] Expected a sqlserver:// DATABASE_URL")
  }

  const parts = databaseUrl.slice(prefix.length).split(";")
  const authority = parts.shift()?.trim()
  if (!authority) throw new Error("[better-auth] SQL Server host is missing")

  const values = new Map<string, string>()
  for (const part of parts) {
    const separator = part.indexOf("=")
    if (separator <= 0) continue
    values.set(
      part.slice(0, separator).trim().toLowerCase(),
      decodeConnectionValue(part.slice(separator + 1).trim()),
    )
  }

  const { server, port } = parseSqlServerHost(authority)
  const database = values.get("database")
  const user = values.get("user")
  const password = values.get("password")

  if (!server || !database || !user || password === undefined) {
    throw new Error(
      "[better-auth] SQL Server DATABASE_URL must include host, database, user and password",
    )
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

export function getBetterAuthDatabaseProvider(databaseUrl?: string): BetterAuthDatabaseProvider {
  const url = requireDatabaseUrl(databaseUrl).toLowerCase()
  const configured = process.env.DATABASE_PROVIDER?.trim().toLowerCase()

  if (configured === "mssql" || configured === "sqlserver" || url.startsWith("sqlserver://")) {
    return "mssql"
  }
  if (configured === "mysql" || url.startsWith("mysql://") || url.startsWith("mariadb://")) {
    return "mysql"
  }
  throw new Error("[better-auth] Unsupported DATABASE_PROVIDER")
}

function createMysqlDatabase(databaseUrl: string) {
  const connection = parseMysqlUrl(databaseUrl)
  return createPool({
    host: connection.host,
    port: connection.port,
    user: connection.user,
    password: connection.password,
    database: connection.database,
    timezone: "Z",
    connectionLimit: 10,
    enableKeepAlive: true,
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
  })

  return {
    dialect,
    type: "mssql" as const,
  }
}

export function createBetterAuthDatabase(databaseUrl?: string) {
  const url = requireDatabaseUrl(databaseUrl)
  return getBetterAuthDatabaseProvider(url) === "mssql"
    ? createMssqlDatabase(url)
    : createMysqlDatabase(url)
}
