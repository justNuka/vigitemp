/**
 * Script de test de connexion via les API Routes Next.js
 * Lance d'abord le serveur de dev avec `npm run dev`
 * Puis exécute ce script avec `npm run test:api`
 */

const API_BASE = 'http://localhost:3000/api'

interface TestResult {
  name: string
  success: boolean
  message: string
  data?: any
}

async function testEndpoint(
  name: string,
  endpoint: string,
  options: RequestInit = {}
): Promise<TestResult> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options)
    const data = await response.json()

    if (response.ok) {
      return {
        name,
        success: true,
        message: `✅ ${name} - Status ${response.status}`,
        data
      }
    } else {
      return {
        name,
        success: false,
        message: `❌ ${name} - Status ${response.status}: ${data.error || 'Unknown error'}`,
        data
      }
    }
  } catch (error) {
    return {
      name,
      success: false,
      message: `❌ ${name} - ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

async function runTests() {
  console.log('🚀 Démarrage des tests d\'API...\n')
  console.log('⚠️  Assure-toi que le serveur de dev tourne (npm run dev)\n')
  console.log('=' .repeat(70))

  const results: TestResult[] = []

  // Test 1: Dashboard Stats
  console.log('\n📊 Test 1: Dashboard Stats')
  results.push(await testEndpoint(
    'Dashboard Stats',
    '/dashboard/stats'
  ))

  // Test 2: Sensors List
  console.log('\n📡 Test 2: Sensors (t_lieu) List')
  results.push(await testEndpoint(
    'Sensors List',
    '/sensors'
  ))

  // Test 3: Alarms List
  console.log('\n🚨 Test 3: Alarms List')
  results.push(await testEndpoint(
    'Alarms List',
    '/alarms'
  ))

  // Test 4: Measurements
  console.log('\n📈 Test 4: Recent Measurements')
  results.push(await testEndpoint(
    'Recent Measurements',
    '/dashboard/measurements'
  ))

  // Test 5: Audit Log
  console.log('\n📝 Test 5: Audit Log')
  results.push(await testEndpoint(
    'Audit Log',
    '/audit'
  ))

  // Test 6: Users (may fail without auth)
  console.log('\n👥 Test 6: Users List')
  results.push(await testEndpoint(
    'Users List',
    '/users'
  ))

  // Affichage des résultats
  console.log('\n' + '='.repeat(70))
  console.log('\n📊 Résumé des tests:\n')

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.message}`)
    if (result.success && result.data) {
      // Afficher un aperçu des données
      if (Array.isArray(result.data)) {
        console.log(`   └─ ${result.data.length} éléments retournés`)
        if (result.data.length > 0) {
          console.log(`   └─ Premier élément: ${JSON.stringify(result.data[0]).substring(0, 100)}...`)
        }
      } else {
        const keys = Object.keys(result.data)
        console.log(`   └─ Champs: ${keys.join(', ')}`)
      }
    }
    console.log('')
  })

  const successCount = results.filter(r => r.success).length
  const totalCount = results.length

  console.log('=' .repeat(70))
  console.log(`\n✅ ${successCount}/${totalCount} tests réussis`)

  if (successCount === totalCount) {
    console.log('\n🎉 Tous les tests API sont passés avec succès!')
    console.log('   La connexion à la base de données fonctionne correctement.\n')
    process.exit(0)
  } else {
    console.log('\n⚠️  Certains tests ont échoué.')
    console.log('   Vérifie que:')
    console.log('   - Le serveur de dev est en cours d\'exécution (npm run dev)')
    console.log('   - Les bases de données MySQL sont accessibles')
    console.log('   - Les credentials dans .env.local sont corrects\n')
    process.exit(1)
  }
}

// Attendre un peu pour s'assurer que le serveur est prêt
setTimeout(runTests, 2000)
