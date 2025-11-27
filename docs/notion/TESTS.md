# Tests

## Vue d'ensemble

Cette page regroupe la documentation des tests pour l'ensemble du projet Vigitemp. Le système est composé de 3 applications principales qui nécessitent chacune une stratégie de test appropriée.

---

## État actuel

⚠️ **Aucun test n'est actuellement implémenté** sur les 3 composants du projet.

### Coverage actuel
- ❌ **Frontend (Next.js)** : 0% de couverture
- ❌ **Backend (Server C#)** : 0% de couverture  
- ❌ **Agent (C#)** : 0% de couverture
- ⚠️ **Tests manuels** : En cours lors du développement

---

## Stratégie de test globale

### Objectifs
- Atteindre 80% de couverture de code sur le frontend
- Atteindre 70% de couverture sur les composants critiques C#
- Automatiser les tests de régression
- Valider l'intégration entre les 3 composants

### Priorités
1. **Tests critiques** : Base de données, API, collecte capteurs
2. **Tests fonctionnels** : Alertes, configuration, visualisation
3. **Tests d'intégration** : Communication entre composants
4. **Tests E2E** : Scénarios utilisateur complets

---

## Frontend - Next.js / React

### Stack de test recommandée

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event
npm install -D @playwright/test
```

**Outils :**
- **Vitest** : Framework de tests unitaires (plus rapide que Jest)
- **React Testing Library** : Tests de composants React
- **Playwright** : Tests end-to-end

### Tests unitaires (à implémenter)

#### Exemple : Tester un composant

```tsx
// __tests__/components/card-alarm.test.tsx
import { render, screen } from '@testing-library/react'
import { expect, test, describe } from 'vitest'
import CardAlarm from '@/app/components/card-alarm'

describe('CardAlarm', () => {
  test('affiche le nom du lieu en alarme', () => {
    render(<CardAlarm lieu="Chambre froide A" temperature={10} />)
    expect(screen.getByText('Chambre froide A')).toBeInTheDocument()
  })
  
  test('affiche la température actuelle', () => {
    render(<CardAlarm lieu="Chambre froide A" temperature={10} />)
    expect(screen.getByText('10°C')).toBeInTheDocument()
  })
  
  test('applique le style danger si température hors seuil', () => {
    const { container } = render(
      <CardAlarm lieu="Chambre froide A" temperature={10} seuilHaut={8} />
    )
    expect(container.firstChild).toHaveClass('bg-danger')
  })
})
```

#### Exemple : Tester une API route

```tsx
// __tests__/api/lieux.test.ts
import { expect, test, describe } from 'vitest'
import { GET } from '@/app/api/lieux/route'

describe('API /api/lieux', () => {
  test('retourne la liste des lieux', async () => {
    const response = await GET()
    const data = await response.json()
    
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('Id')
    expect(data[0]).toHaveProperty('Nom')
  })
})
```

#### Exemple : Tester un hook

```tsx
// __tests__/hooks/useMesures.test.tsx
import { renderHook, waitFor } from '@testing-library/react'
import { expect, test } from 'vitest'
import useMesures from '@/app/hooks/useMesures'

test('useMesures charge les données', async () => {
  const { result } = renderHook(() => useMesures(1))
  
  expect(result.current.loading).toBe(true)
  
  await waitFor(() => {
    expect(result.current.loading).toBe(false)
  })
  
  expect(result.current.mesures).toBeDefined()
  expect(Array.isArray(result.current.mesures)).toBe(true)
})
```

### Tests d'intégration (à implémenter)

#### Exemple : Tester communication avec Agent C#

```tsx
// __tests__/integration/vigilog.test.tsx
import { expect, test, describe, beforeAll } from 'vitest'
import axios from 'axios'

describe('Communication Agent C#', () => {
  beforeAll(() => {
    // Vérifier Agent disponible
  })
  
  test('télécharge la configuration LogTag', async () => {
    const response = await axios.get('http://localhost:8000/downloadLogTagConfiguration')
    
    expect(response.data.res).toBe('true')
    expect(response.data).toHaveProperty('res_consigneHauteActive')
    expect(response.data).toHaveProperty('res_consigneBasseActive')
  })
})
```

### Tests E2E (à implémenter)

```typescript
// e2e/surveillance.spec.ts
import { test, expect } from '@playwright/test'

test('affiche la liste des lieux surveillés', async ({ page }) => {
  await page.goto('http://localhost:3000/surveillance')
  
  await expect(page.locator('h1')).toHaveText('Surveillance')
  
  const lieuCards = page.locator('.lieu-card')
  await expect(lieuCards).toHaveCount(5)
  
  // Cliquer sur premier lieu
  await lieuCards.first().click()
  
  // Vérifier redirection
  await expect(page).toHaveURL(/\/surveillance\/\d+/)
  
  // Vérifier graphique affiché
  await expect(page.locator('canvas')).toBeVisible()
})

test('déclenche une alarme', async ({ page }) => {
  await page.goto('http://localhost:3000/surveillance/1')
  
  // Cliquer bouton alarme
  await page.click('button[aria-label="Déclencher alarme"]')
  
  // Vérifier toast affiché
  await expect(page.locator('.toast')).toHaveText('Alarme déclenchée')
  
  // Vérifier badge notification
  const badge = page.locator('.notification-badge')
  await expect(badge).toHaveText('1')
})
```

### Configuration Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

```typescript
// vitest.setup.ts
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock des modules Next.js
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/surveillance',
}))
```

---

## Backend - Vigitemp Server (C#)

### Stack de test recommandée

```xml
<PackageReference Include="NUnit" Version="4.0.1" />
<PackageReference Include="NUnit3TestAdapter" Version="4.5.0" />
<PackageReference Include="Moq" Version="4.20.70" />
<PackageReference Include="FluentAssertions" Version="6.12.0" />
```

**Outils :**
- **NUnit** : Framework de tests unitaires
- **Moq** : Mocking (simuler dépendances)
- **FluentAssertions** : Assertions lisibles

### Tests unitaires (à implémenter)

#### Exemple : Tester Database.cs

```csharp
// Tests/DatabaseTests.cs
using NUnit.Framework;
using FluentAssertions;
using Vigitemp_Serveur;

[TestFixture]
public class DatabaseTests
{
    private Database _database;
    
    [SetUp]
    public void Setup()
    {
        _database = new Database();
        _database.InitConnexion();
    }
    
    [Test]
    public void GetDistinctIdServeur_ReturnsListOfIntegers()
    {
        // Act
        List<int> serveurs = _database.getDistinctIdServeur();
        
        // Assert
        serveurs.Should().NotBeNull();
        serveurs.Should().NotBeEmpty();
        serveurs.Should().AllBeOfType<int>();
    }
    
    [Test]
    public void AddMesure_ValidData_ReturnsTrue()
    {
        // Arrange
        Mesure mesure = new Mesure
        {
            IdSonde = 1,
            IdLieu = 1,
            ValeurMesure = 20.5,
            HeureMesure = DateTime.Now
        };
        
        // Act
        bool result = _database.AddMesure(mesure);
        
        // Assert
        result.Should().BeTrue();
    }
    
    [Test]
    public void GetConsignesLieux_ExistingLieu_ReturnsConsignes()
    {
        // Act
        ConsignesLieu consignes = _database.getConsignesLieux(1);
        
        // Assert
        consignes.Should().NotBeNull();
        consignes.ConsigneHaute.Should().BeGreaterThan(0);
        consignes.ConsigneBasse.Should().BeLessThan(consignes.ConsigneHaute);
    }
    
    [TearDown]
    public void TearDown()
    {
        _database.CloseConnexion();
    }
}
```

#### Exemple : Tester Sensor.cs avec Moq

```csharp
// Tests/SensorTests.cs
using NUnit.Framework;
using Moq;
using FluentAssertions;

[TestFixture]
public class SensorTests
{
    [Test]
    public void SensorIH_ExecuteCommand_ReturnsValidMesures()
    {
        // Arrange
        var mockSonde = new Sonde
        {
            Id = 1,
            TypeSonde = "IH",
            PortCOM = "COM3",
            BaudRate = 9600,
            IdLieu = 1
        };
        
        SensorIH sensor = new SensorIH(mockSonde);
        
        // Act
        List<Mesure> mesures = sensor.ExecuteCommand();
        
        // Assert
        mesures.Should().NotBeNull();
        mesures.Should().HaveCountGreaterThan(0);
        mesures[0].ValeurMesure.Should().BeInRange(-50, 100);
        mesures[0].HeureMesure.Should().BeCloseTo(DateTime.Now, TimeSpan.FromMinutes(1));
    }
}
```

### Tests d'intégration (à implémenter)

```csharp
// Tests/IntegrationTests/ServiceIntegrationTests.cs
[TestFixture]
[Category("Integration")]
public class ServiceIntegrationTests
{
    [Test]
    public void VigitempServeur_OnStart_CreatesThreadsForAllServers()
    {
        // Arrange
        var service = new VigitempServeur();
        
        // Act
        service.OnStart(null);
        Thread.Sleep(5000); // Attendre initialisation
        
        // Assert
        Database db = new Database();
        List<int> serveurs = db.getDistinctIdServeur();
        
        // Vérifier qu'un thread existe par serveur
        // (nécessite exposition propriétés pour tests)
    }
    
    [Test]
    public void ThreadServeur_Process_CollectsMesuresFromAllSondes()
    {
        // Test de bout en bout du processus de collecte
    }
}
```

---

## Agent - Vigitemp Agent (C#)

### Tests unitaires (à implémenter)

#### Exemple : Tester Database.cs

```csharp
// Tests/DatabaseTests.cs
[TestFixture]
public class AgentDatabaseTests
{
    [Test]
    public void AddMesure_ValidVigilogData_ReturnsTrue()
    {
        // Arrange
        Database db = new Database();
        db.InitConnexion();
        
        // Act
        bool result = db.AddMesure(
            "LT1234",
            "20251127143025",
            20.5,
            DateTime.Now
        );
        
        // Assert
        result.Should().BeTrue();
    }
    
    [Test]
    public void AddPCtoDBClientsList_NewPC_InsertsRecord()
    {
        // Arrange
        Database db = new Database();
        db.InitConnexion();
        
        // Act
        string result = db.addPCtoDBClientsList("192.168.1.100", "TEST-PC");
        
        // Assert
        result.Should().Be("OK");
    }
}
```

#### Exemple : Tester HttpServer.cs

```csharp
// Tests/HttpServerTests.cs
[TestFixture]
public class HttpServerTests
{
    [Test]
    public void GetLocalIPAddress_ReturnsValidIP()
    {
        // Act
        string ip = HttpServer.GetLocalIPAddress();
        
        // Assert
        ip.Should().NotBeNullOrEmpty();
        ip.Should().MatchRegex(@"^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$");
    }
}
```

### Tests d'intégration (à implémenter)

```csharp
// Tests/IntegrationTests/LogTagIntegrationTests.cs
[TestFixture]
[Category("Integration")]
[Category("RequiresLogTag")] // Nécessite dock branché
public class LogTagIntegrationTests
{
    [Test]
    public void DownloadLogTagData_WithDockConnected_ReturnsSuccess()
    {
        // Arrange
        // (nécessite dock LogTag branché)
        
        // Act
        string response = HttpServer.DownloadLogTagData();
        
        // Assert
        response.Should().Contain("res");
        var json = JsonConvert.DeserializeObject<dynamic>(response);
        json.res.Should().Be("true");
        json.id_recuperationMesure.Should().NotBeNull();
    }
    
    [Test]
    public void UploadLogTagConfiguration_ValidParams_ConfiguresCapteur()
    {
        // Test de configuration du capteur
    }
}
```

---

## Tests inter-composants

### Scénarios de test globaux (à implémenter)

#### Scénario 1 : Collecte de mesures complète

```
1. Server interroge capteur série
2. Server enregistre mesure dans DB
3. Website affiche mesure dans graphique
4. Vérifier temps de latence < 5 secondes
```

#### Scénario 2 : Déclenchement alarme

```
1. Server détecte dépassement seuil
2. Server enregistre alarme dans DB
3. Server appelle Agent POST /alarm
4. Agent affiche pop-up Windows
5. Website affiche notification toast
6. Vérifier toutes étapes réussies < 3 secondes
```

#### Scénario 3 : Configuration capteur Vigilog

```
1. Website affiche interface configuration
2. Utilisateur modifie seuils
3. Website appelle Agent POST /uploadLogTagConfiguration
4. Agent configure capteur via USB
5. Website appelle Agent GET /downloadLogTagConfiguration
6. Vérifier configuration appliquée correctement
```

---

## Outils de monitoring et qualité

### Coverage (à configurer)

#### Frontend
```bash
npm install -D @vitest/coverage-v8

# Générer rapport
npm run test:coverage

# Voir rapport
open coverage/index.html
```

#### C# (Backend + Agent)
```bash
# Utiliser coverlet
dotnet add package coverlet.msbuild

# Générer coverage
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=html
```

### Linting et qualité

#### Frontend
```bash
# ESLint (déjà configuré)
npm run lint

# TypeScript strict mode
# Activer dans tsconfig.json:
"strict": true
```

#### C# (Backend + Agent)
```xml
<!-- Ajouter dans .csproj -->
<PropertyGroup>
  <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  <CodeAnalysisRuleSet>AllRules.ruleset</CodeAnalysisRuleSet>
</PropertyGroup>
```

---

## CI/CD (à implémenter)

### Pipeline recommandé (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci --legacy-peer-deps
      - run: npm run test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
  
  test-backend:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-dotnet@v3
        with:
          dotnet-version: 4.8
      - run: dotnet test --configuration Release
```

---

## Métriques de qualité visées

### Coverage
- **Frontend** : 80% minimum
- **Backend API Routes** : 90% minimum
- **Backend Sensors** : 70% minimum
- **Agent HTTP Server** : 80% minimum
- **Database classes** : 90% minimum

### Performance
- **Tests unitaires** : < 5 minutes
- **Tests intégration** : < 15 minutes
- **Tests E2E** : < 30 minutes

### Stabilité
- **Flaky tests** : 0 toléré
- **Tests cassés** : Blocage PR
- **Dépendances** : Mises à jour automatiques

---

## Roadmap tests

### Phase 1 (Court terme)
- [ ] Configurer Vitest pour frontend
- [ ] Configurer NUnit pour C#
- [ ] Écrire tests unitaires Database.cs
- [ ] Écrire tests unitaires composants React critiques
- [ ] Configuration CI/CD basique

### Phase 2 (Moyen terme)
- [ ] Tests intégration API routes
- [ ] Tests intégration capteurs
- [ ] Tests E2E Playwright (3-5 scénarios critiques)
- [ ] Coverage > 50% sur tous composants
- [ ] Dashboard monitoring coverage

### Phase 3 (Long terme)
- [ ] Tests de performance (load testing)
- [ ] Tests de sécurité (OWASP)
- [ ] Tests de compatibilité (différents OS)
- [ ] Coverage > 80% global
- [ ] Mutation testing

---

## Ressources

### Documentation
- [Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)
- [NUnit](https://nunit.org/)
- [Moq](https://github.com/moq/moq4)

### Bonnes pratiques
- **AAA Pattern** : Arrange, Act, Assert
- **Tests isolés** : Pas de dépendances entre tests
- **Noms descriptifs** : `test("fait X quand Y dans le contexte Z")`
- **Mocks minimaux** : Préférer tests réels quand possible
- **Fixtures réutilisables** : Setup commun dans beforeEach

---

**Documentation créée le 27 novembre 2025**

**Note :** Cette page sera mise à jour au fur et à mesure de l'implémentation des tests.
