import "dotenv/config"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaMssql } from "@prisma/adapter-mssql"

import { PrismaClient } from "../generated/@prisma-vigi-chat/client"
import {
  detectDatabaseProvider,
  parseMysqlConnectionUrl,
  parseSqlServerConnectionUrl,
} from "./database-connection"

type GlobalPrismaChatState = {
  prismaChat?: PrismaClient
}

const globalForPrismaChat = globalThis as unknown as GlobalPrismaChatState

function requireEnv(name: "DATABASE_CHAT_URL"): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`[prisma-chat] Missing required environment variable: ${name}`)
  }
  return value
}

const chatDbUrl = requireEnv("DATABASE_CHAT_URL")

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

const chatAdapter =
  detectDatabaseProvider(chatDbUrl) === "mssql"
    ? createMssqlAdapter(chatDbUrl)
    : createMysqlAdapter(chatDbUrl)

function getPrismaChatClient(): PrismaClient {
  if (!globalForPrismaChat.prismaChat) {
    globalForPrismaChat.prismaChat = new PrismaClient({
      adapter: chatAdapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    })
  }
  return globalForPrismaChat.prismaChat
}

export const prismaChat = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getPrismaChatClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
