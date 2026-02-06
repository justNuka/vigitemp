/**
 * Prisma Client Instances (Prisma v6 - Classic Mode)
 * 
 * Ce fichier exporte deux clients Prisma pour accéder aux deux bases de données:
 * - prisma: Base principale vigitemp (config, users, sensors, alarms, etc.)
 * - prismaMesure: Base time-series vigitemp_mesure (mesures, journal, historiques)
 * 
 * Prisma v6 se connecte directement via les URLs dans les schémas.
 * 
 * Utilisation:
 * import { prisma, prismaMesure } from '@/lib/prisma'
 * 
 * const users = await prisma.t_utilisateur.findMany()
 * const mesures = await prismaMesure.tm_mesure.findMany()
 */
import 'dotenv/config'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

import { PrismaClient } from '../generated/@prisma-db-main/client'
import { PrismaClient as PrismaMesureClient } from '../generated/@prisma-db-mesures/client'

// Singleton pattern pour éviter de créer plusieurs instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaMesure: PrismaMesureClient | undefined
}

// Adapters basés sur les URLs de connexion
// .env :
// DATABASE_URL=mysql://user:pass@host:3306/db_main
// DATABASE_MESURES_URL=mysql://user:pass@host:3306/db_mesures
const mainAdapter = new PrismaMariaDb(process.env.DATABASE_URL as string)
const mesureAdapter = new PrismaMariaDb(process.env.DATABASE_MESURES_URL as string)
// Variante possible fromUrl (même effet) :
// const mainAdapter = PrismaMariaDb.fromUrl(process.env.DATABASE_URL as string)
// const mesureAdapter = PrismaMariaDb.fromUrl(process.env.DATABASE_MESURES_URL as string)

// Lazy initialization function for main database client
function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter: mainAdapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }
  return globalForPrisma.prisma
}

// Lazy initialization function for time-series database client
function getPrismaMesureClient() {
  if (!globalForPrisma.prismaMesure) {
    globalForPrisma.prismaMesure = new PrismaMesureClient({
      adapter: mesureAdapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }
  return globalForPrisma.prismaMesure
}

// Export clients through getters for lazy initialization
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