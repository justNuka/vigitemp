import { MssqlDialect } from "kysely"
import { createPool } from "mysql2/promise"
import * as Tarn from "tarn"
import * as Tedious from "tedious"

import {
  detectDatabaseProvider,
  parseMysqlConnectionUrl,
  parseSqlServerConnectionUrl,
} from "@/lib/database-connection"

export type BetterAuthDatabaseProvider = "mysql" | "mssql"

function requireDatabaseUrl(databaseUrl?: string) {
  const value = databaseUrl?.trim() || process.env.DATABASE_URL?.trim()
  if (!value) {
    throw new Error("[better-auth] DATABASE_URL is required")
  }
  return value
}

export function parsePrismaSqlServerUrl(databaseUrl: string) {
  return parseSqlServerConnectionUrl(databaseUrl)
}

export function getBetterAuthDatabaseProvider(databaseUrl?: string): BetterAuthDatabaseProvider {
  return detectDatabaseProvider(requireDatabaseUrl(databaseUrl))
}

function createMysqlDatabase(databaseUrl: string) {
  const connection = parseMysqlConnectionUrl(databaseUrl)
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
  const config = parseSqlServerConnectionUrl(databaseUrl)
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
