import "dotenv/config"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"

import { PrismaClient } from "../generated/@prisma-db-main/client"
import { PrismaClient as PrismaMesureClient } from "../generated/@prisma-db-mesures/client"

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

const mainAdapter = new PrismaMariaDb(mainDbUrl)
const mesureAdapter = new PrismaMariaDb(mesuresDbUrl)

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
