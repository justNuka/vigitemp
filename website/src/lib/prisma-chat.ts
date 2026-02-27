import "dotenv/config"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

import { PrismaClient } from "../generated/@prisma-vigi-chat/client"

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

const chatAdapter = new PrismaMariaDb(chatDbUrl)

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
