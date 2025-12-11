// /**
//  * Script pour hacher les mots de passe existants avec bcrypt
//  * Usage: npm run hash:passwords
//  * 
//  * ⚠️ IMPORTANT: Exécuter UNE SEULE FOIS après avoir étendu le champ Mot_de_passe à VARCHAR(60)
//  * Ce script va:
//  * 1. Lire tous les utilisateurs avec des mots de passe en clair
//  * 2. Hasher chaque mot de passe avec bcrypt
//  * 3. Mettre à jour la base de données
//  */

// import 'dotenv/config'
// import { PrismaClient } from '../src/generated/@prisma-db-main/client.js'
// import { PrismaMariaDb } from '@prisma/adapter-mariadb'
// import bcrypt from 'bcryptjs'

// const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
// const prisma = new PrismaClient({ adapter })

// const SALT_ROUNDS = 10 // Nombre de rounds pour bcrypt (10 est un bon compromis sécurité/performance)

// async function hashPasswords() {
//   console.log('\n🔐 Démarrage du hachage des mots de passe...\n')
  
//   try {
//     // Récupérer tous les utilisateurs non archivés avec un mot de passe
//     const users = await prisma.t_utilisateur.findMany({
//       where: {
//         Archive: false,
//         Mot_de_passe: {
//           not: null
//         }
//       },
//       select: {
//         IdUtilisateur: true,
//         Login: true,
//         Mot_de_passe: true
//       }
//     })

//     if (users.length === 0) {
//       console.log('✅ Aucun utilisateur à traiter')
//       return
//     }

//     console.log(`📊 ${users.length} utilisateur(s) trouvé(s)\n`)

//     let successCount = 0
//     let errorCount = 0
//     let skippedCount = 0

//     for (const user of users) {
//       const password = user.Mot_de_passe!
      
//       // Vérifier si le mot de passe est déjà haché (bcrypt commence par $2a$, $2b$ ou $2y$)
//       if (password.startsWith('$2a$') || password.startsWith('$2b$') || password.startsWith('$2y$')) {
//         console.log(`⏭️  ${user.Login}: Déjà haché, ignoré`)
//         skippedCount++
//         continue
//       }

//       try {
//         // Hasher le mot de passe
//         const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)
        
//         // Mettre à jour en base
//         await prisma.t_utilisateur.update({
//           where: { IdUtilisateur: user.IdUtilisateur },
//           data: { Mot_de_passe: hashedPassword }
//         })
        
//         console.log(`✅ ${user.Login}: Mot de passe haché avec succès`)
//         successCount++
//       } catch (error) {
//         console.error(`❌ ${user.Login}: Erreur lors du hachage -`, error)
//         errorCount++
//       }
//     }

//     console.log(`\n${'='.repeat(60)}`)
//     console.log(`\n📊 Résumé:`)
//     console.log(`   ✅ Réussis: ${successCount}`)
//     console.log(`   ⏭️  Ignorés (déjà hashés): ${skippedCount}`)
//     console.log(`   ❌ Erreurs: ${errorCount}`)
//     console.log(`\n${'='.repeat(60)}\n`)

//     if (successCount > 0) {
//       console.log('✅ Tous les mots de passe ont été hachés avec succès!')
//       console.log('🔐 Les utilisateurs peuvent maintenant se connecter avec leurs mots de passe d\'origine')
//     }

//   } catch (error) {
//     console.error('❌ Erreur fatale:', error)
//     process.exit(1)
//   } finally {
//     await prisma.$disconnect()
//   }
// }

// // Exécuter le script
// hashPasswords()
