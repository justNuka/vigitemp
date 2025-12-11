/**
 * Test de connexion MySQL directe pour vérifier les credentials
 */
import mysql from 'mysql2/promise'

async function testConnection() {
  console.log('\n🔍 Test de connexion MySQL...\n')
  
  const configs = [
    { name: 'Config: root/root', host: '127.0.0.1', user: 'root', password: 'root', database: 'vigitemp' },
  ]

  for (const config of configs) {
    try {
      console.log(`\n🔄 Test: ${config.name}`)
      const connection = await mysql.createConnection({
        host: config.host,
        port: 3306,
        user: config.user,
        password: config.password,
        database: config.database
      })
      
      const [rows] = await connection.query('SELECT COUNT(*) as count FROM t_utilisateur')
      console.log(`✅ Connexion réussie!`)
      console.log(`   Utilisateurs: ${(rows as any)[0].count}`)
      
      await connection.end()
      break // Sortir dès qu'on trouve une config qui marche
      
    } catch (error: any) {
      console.log(`❌ Échec: ${error.message}`)
    }
  }
}

testConnection()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Erreur:', err)
    process.exit(1)
  })
