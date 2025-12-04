/**
 * Script de test de connexion à la base de données (Prisma v7 avec adapters)
 * Usage: npm run test:db
 */

import 'dotenv/config'
import { PrismaClient } from '../src/generated/@prisma-db-main/client.js'
import { PrismaClient as PrismaMesureClient } from '../src/generated/@prisma-db-mesure/client.js'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// Créer les adapters avec les connection strings
const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
const adapterMesure = new PrismaMariaDb(process.env.DATABASE_MESURE_URL!)

// Initialiser les clients avec les adapters
const prisma = new PrismaClient({ adapter })
const prismaMesure = new PrismaMesureClient({ adapter: adapterMesure })

async function testMainDatabase() {
  console.log('\n🔍 (Test de connexion à vigitemp...')
  
  try {
    // Test 1: Compter les utilisateurs
    const userCount = await prisma.t_utilisateur.count()
    console.log(`✅ Connexion réussie à vigitemp`)
    console.log(`   - ${userCount} utilisateurs trouvés`)

    // Test 2: Compter les lieux (sensors)
    const lieuCount = await prisma.t_lieu.count()
    console.log(`   - ${lieuCount} lieux trouvés`)

    // Test 3: Compter les alarmes
    const alarmeCount = await prisma.t_alarme.count()
    console.log(`   - ${alarmeCount} alarmes trouvées`)

    // Test 4: Lister les profils
    const profils = await prisma.t_profil.findMany({
      select: {
        ProfilUtilisateur: true,
        Commentaire: true,
      }
    })
    console.log(`   - ${profils.length} profils disponibles:`)
    profils.forEach(p => {
      console.log(`     • ${p.ProfilUtilisateur}: ${p.Commentaire || 'Pas de description'}`)
    })

    return true
  } catch (error) {
    console.error('❌ Erreur de connexion à vigitemp:', error)
    return false
  }
}

async function testMesureDatabase() {
  console.log('\n🔍 Test de connexion à vigitemp_mesure...')
  
  try {
    // Test 1: Compter les mesures
    const mesureCount = await prismaMesure.ts_mesure.count()
    console.log(`✅ Connexion réussie à vigitemp_mesure`)
    console.log(`   - ${mesureCount} mesures trouvées`)

    // Test 2: Compter les entrées de journal
    const journalCount = await prismaMesure.ts_journal.count()
    console.log(`   - ${journalCount} entrées de journal trouvées`)

    // Test 3: Récupérer les dernières mesures
    const recentMesures = await prismaMesure.ts_mesure.findMany({
      take: 5,
      orderBy: {
        DateHeureMesure: 'desc'
      },
      select: {
        IdMesure: true,
        DateHeureMesure: true,
        Valeur: true,
        IdLieu: true,
      }
    })
    
    if (recentMesures.length > 0) {
      console.log(`   - Dernières mesures:`)
      recentMesures.forEach(m => {
        console.log(`     • Mesure ${m.IdMesure}: ${m.Valeur} (Lieu ${m.IdLieu}) - ${m.DateHeureMesure?.toLocaleString('fr-FR')}`)
      })
    }

    return true
  } catch (error) {
    console.error('❌ Erreur de connexion à vigitemp_mesure:', error)
    return false
  }
}

async function testCRUDOperations() {
  console.log('\n🔍 Test des opérations CRUD...')
  
  try {
    // Test READ: Récupérer un utilisateur
    const user = await prisma.t_utilisateur.findFirst({
      where: {
        Archive: false
      },
      include: {
        t_profil: true
      }
    })

    if (user) {
      console.log(`✅ READ réussi - Utilisateur trouvé:`)
      console.log(`   - ID: ${user.IdUtilisateur}`)
      console.log(`   - Login: ${user.Login}`)
      console.log(`   - Profil: ${user.t_profil?.ProfilUtilisateur || 'Aucun'}`)
    } else {
      console.log(`⚠️  Aucun utilisateur actif trouvé`)
    }

    // Test READ: Récupérer des lieux avec leurs alarmes
    const lieu = await prisma.t_lieu.findFirst({
      where: {
        Archive: false
      },
      include: {
        t_alarme: {
          take: 5,
          orderBy: {
            DateHeureDebut: 'desc'
          }
        }
      }
    })

    if (lieu) {
      console.log(`✅ READ avec relation réussi - Lieu trouvé:`)
      console.log(`   - ID: ${lieu.IdLieu}`)
      console.log(`   - Nom: ${lieu.Nom_Lieu}`)
      console.log(`   - État: ${lieu.Lieu_Etat}`)
      console.log(`   - Alarmes: ${lieu.t_alarme.length}`)
    }

    return true
  } catch (error) {
    console.error('❌ Erreur lors des tests CRUD:', error)
    return false
  }
}

async function main() {
  console.log('🚀 Démarrage des tests de connexion à la base de données...\n')
  console.log('=' .repeat(60))

  const results = {
    main: await testMainDatabase(),
    mesure: await testMesureDatabase(),
    crud: await testCRUDOperations()
  }

  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Résumé des tests:')
  console.log(`   - Base principale (vigitemp): ${results.main ? '✅ OK' : '❌ ERREUR'}`)
  console.log(`   - Base mesures (vigitemp_mesure): ${results.mesure ? '✅ OK' : '❌ ERREUR'}`)
  console.log(`   - Opérations CRUD: ${results.crud ? '✅ OK' : '❌ ERREUR'}`)

  const allPassed = Object.values(results).every(r => r === true)
  
  if (allPassed) {
    console.log('\n✅ Tous les tests sont passés avec succès!')
  } else {
    console.log('\n⚠️  Certains tests ont échoué. Vérifie la configuration de ta base de données.')
  }

  // Fermer les connexions
  await prisma.$disconnect()
  await prismaMesure.$disconnect()

  process.exit(allPassed ? 0 : 1)
}

main()
