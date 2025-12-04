/**
 * Prisma Client Instances (Prisma v7 with Driver Adapters)
 * 
 * Ce fichier exporte deux clients Prisma pour accéder aux deux bases de données:
 * - prisma: Base principale vigitemp (config, users, sensors, alarms, etc.)
 * - prismaMesure: Base time-series vigitemp_mesure (mesures, journal, historiques)
 * 
 * Prisma v7 nécessite des adapters de base de données pour toutes les connexions.
 * Nous utilisons @prisma/adapter-mariadb qui est compatible avec MySQL.
 * 
 * Utilisation:
 * import { prisma, prismaMesure } from '@/lib/prisma'
 * 
 * const users = await prisma.t_utilisateur.findMany()
 * const mesures = await prismaMesure.ts_mesure.findMany()
 */

import { PrismaClient } from '../generated/@prisma-db-main/client'
import { PrismaClient as PrismaMesureClient } from '../generated/@prisma-db-mesure/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// Singleton pattern pour éviter de créer plusieurs instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaMesure: PrismaMesureClient | undefined
}

// Lazy initialization function for main database client
function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    // PrismaMariaDb accepte directement la connection string
    const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
    globalForPrisma.prisma = new PrismaClient({ adapter })
  }
  return globalForPrisma.prisma
}

// Lazy initialization function for time-series database client
function getPrismaMesureClient() {
  if (!globalForPrisma.prismaMesure) {
    // PrismaMariaDb accepte directement la connection string
    const adapter = new PrismaMariaDb(process.env.DATABASE_MESURE_URL!)
    globalForPrisma.prismaMesure = new PrismaMesureClient({ adapter })
  }
  return globalForPrisma.prismaMesure
}

// Export clients through getters for lazy initialization
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getPrismaClient() as any)[prop]
  }
})

export const prismaMesure = new Proxy({} as PrismaMesureClient, {
  get(_, prop) {
    return (getPrismaMesureClient() as any)[prop]
  }
})

// Types can be imported directly from the generated clients if needed:
// import type { t_utilisateur } from '@/generated/@prisma-db-main/client'
// import type { ts_mesure } from '@/generated/@prisma-db-mesure/client'
