import 'dotenv/config'
import { PrismaClient } from '../src/generated/@prisma-db-main/client.js'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

async function listUsers() {
  try {
    const users = await prisma.t_utilisateur.findMany({
      where: { Archive: false },
      select: {
        IdUtilisateur: true,
        Login: true,
        Mot_de_passe: true,
        Prenom: true,
        Nom: true,
        t_profil: {
          select: {
            ProfilUtilisateur: true,
          }
        }
      },
      take: 10,
      orderBy: { Login: 'asc' }
    })

    console.log('\n📋 Utilisateurs disponibles:\n')
    users.forEach(user => {
      console.log(`ID: ${user.IdUtilisateur}`)
      console.log(`Login: ${user.Login}`)
      console.log(`Password: ${user.Mot_de_passe || '(vide)'}`)
      console.log(`Nom: ${user.Prenom || ''} ${user.Nom || ''}`.trim() || '(non défini)')
      console.log(`Profil: ${user.t_profil?.ProfilUtilisateur || 'Aucun'}`)
      console.log('---')
    })

    console.log(`\nTotal: ${users.length} utilisateurs\n`)
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()
