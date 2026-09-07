import "dotenv/config"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaMssql } from "@prisma/adapter-mssql"

import { PrismaClient } from "../generated/@prisma-db-main/client"
import { PrismaClient as PrismaMesureClient } from "../generated/@prisma-db-mesures/client"
import {
  detectDatabaseProvider,
  parseMysqlConnectionUrl,
  parseSqlServerConnectionUrl,
} from "./database-connection"

type GlobalPrismaState = {
  prisma?: PrismaClient
  prismaMesure?: PrismaMesureClient
}

const globalForPrisma = globalThis as unknown as GlobalPrismaState

function requireEnv(name: "DATABASE_URL" | "DATABASE_MESURES_URL"): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`[prisma] Missing required environment variable: ${name}`)
  }
  return value
}

const mainDbUrl = requireEnv("DATABASE_URL")
const mesuresDbUrl = requireEnv("DATABASE_MESURES_URL")

function createMysqlAdapter(url: string) {
  const connection = parseMysqlConnectionUrl(url)
  return new PrismaMariaDb({
    host: connection.host,
    port: connection.port,
    user: connection.user,
    password: connection.password,
    database: connection.database,
    allowPublicKeyRetrieval: connection.allowPublicKeyRetrieval,
  })
}

function createMssqlAdapter(url: string) {
  const connection = parseSqlServerConnectionUrl(url)
  return new PrismaMssql({
    server: connection.server,
    port: connection.port,
    database: connection.database,
    user: connection.user,
    password: connection.password,
    options: {
      encrypt: connection.encrypt,
      trustServerCertificate: connection.trustServerCertificate,
    },
  })
}

function createAdapter(url: string) {
  return detectDatabaseProvider(url) === "mssql"
    ? createMssqlAdapter(url)
    : createMysqlAdapter(url)
}

const mainAdapter = createAdapter(mainDbUrl)
const mesureAdapter = createAdapter(mesuresDbUrl)

function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter: mainAdapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    })
  }
  return globalForPrisma.prisma
}

function getPrismaMesureClient() {
  if (!globalForPrisma.prismaMesure) {
    globalForPrisma.prismaMesure = new PrismaMesureClient({
      adapter: mesureAdapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    })
  }
  return globalForPrisma.prismaMesure
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getPrismaClient() as any)[prop]
  },
})

export const prismaMesure = new Proxy({} as PrismaMesureClient, {
  get(_, prop) {
    return (getPrismaMesureClient() as any)[prop]
  },
})
