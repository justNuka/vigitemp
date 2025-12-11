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
 * const mesures = await prismaMesure.ts_mesure.findMany()
 */

import { PrismaClient } from '../generated/@prisma-db-main/client'
import { PrismaClient as PrismaMesureClient } from '../generated/@prisma-db-mesure/client'

// Singleton pattern pour éviter de créer plusieurs instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prismaMesure: PrismaMesureClient | undefined
}

// Lazy initialization function for main database client
function getPrismaClient() {
  if (!globalForPrisma.prisma) {
    console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL ? 'définie' : '❌ MANQUANTE')
    globalForPrisma.prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
  }
  return globalForPrisma.prisma
}

// Lazy initialization function for time-series database client
function getPrismaMesureClient() {
  if (!globalForPrisma.prismaMesure) {
    globalForPrisma.prismaMesure = new PrismaMesureClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
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
