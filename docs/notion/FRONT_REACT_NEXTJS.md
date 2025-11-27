# Front - React/Next.js

## Vue d'ensemble

Le frontend Vigitemp est une application web moderne construite avec **Next.js 15.1.0** et **React 19.0.0**, offrant une interface responsive pour la visualisation et la gestion d'un système de surveillance de température en temps réel.

### Technologies principales

- **Framework :** Next.js 15.1.0 (App Router)
- **UI Library :** React 19.0.0
- **Langage :** TypeScript 5.x
- **Styling :** Tailwind CSS 3.4.1 + Hero UI 2.7.5
- **Base de données :** MySQL 2 (via mysql2 3.9.7)

---

## Stack technique détaillée

### Core Framework

#### Next.js 15.1.0
- **App Router** : Architecture moderne basée sur le système de fichiers
- **Server Components** : Composants React côté serveur par défaut
- **API Routes** : Endpoints REST intégrés dans `/api`
- **Optimisations** : Image optimization, font optimization, automatic code splitting

#### React 19.0.0
- Version stable la plus récente
- Server Components natifs
- Improved Suspense et Error Boundaries
- Concurrent rendering

---

## Bibliothèques UI & UX

### Hero UI 2.7.5
Bibliothèque de composants React moderne et accessible.

**Composants utilisés :**
- `Button`, `Input`, `Select`, `Checkbox`, `Switch`
- `Card`, `CardBody`, `CardHeader`
- `Modal`, `ModalContent`, `ModalHeader`, `ModalBody`, `ModalFooter`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`
- `Dropdown`, `DropdownTrigger`, `DropdownMenu`, `DropdownItem`
- `Tooltip`, `Chip`, `Badge`

**Configuration :**
```javascript
// tailwind.config.ts
import {nextui} from "@heroui/react";

export default {
  plugins: [nextui()],
}
```

**Provider :**
```tsx
// app/providers.tsx
import {NextUIProvider} from '@heroui/react'

export function Providers({children}: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      {children}
    </NextUIProvider>
  )
}
```

### Tailwind CSS 3.4.1
Framework CSS utility-first pour le styling personnalisé.

**Configuration :**
```javascript
// tailwind.config.ts
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs personnalisées
      }
    }
  }
}
```

---

## Bibliothèques de notifications

### Sonner 2.0.7
Bibliothèque moderne de notifications toast, remplaçant react-hot-toast.

**Installation :**
```tsx
// app/layout.tsx
import { Toaster } from "sonner"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
```

**Usage :**
```tsx
import { toast } from "sonner"

// Types de notifications
toast.success("Opération réussie")
toast.error("Une erreur est survenue")
toast.info("Information importante")
toast.warning("Attention")
toast.loading("Chargement en cours...")

// Toast avec Promise
toast.promise(
  saveData(),
  {
    loading: 'Sauvegarde...',
    success: 'Données sauvegardées',
    error: 'Erreur lors de la sauvegarde'
  }
)
```

**Avantages vs react-hot-toast :**
- API plus moderne et intuitive
- Meilleure performance (moins de re-renders)
- Support natif des Promises
- Animations plus fluides
- Bundle size réduit

---

## Bibliothèques d'icônes

### Lucide React 0.555.0
Bibliothèque d'icônes moderne, remplaçant react-icons.

**Usage :**
```tsx
import { Bell, Settings, User, ChevronDown, AlertTriangle } from 'lucide-react'

export function Component() {
  return (
    <div>
      <Bell size={24} strokeWidth={2} />
      <Settings className="text-blue-500" />
      <AlertTriangle color="red" size={20} />
    </div>
  )
}
```

**Icônes couramment utilisées dans Vigitemp :**
- `Bell`, `BellOff` : Notifications
- `Settings`, `Sliders` : Configuration
- `ChevronDown`, `ChevronUp`, `ChevronLeft`, `ChevronRight` : Navigation
- `AlertTriangle`, `AlertCircle` : Alertes
- `Eye`, `EyeOff` : Visibilité
- `Filter`, `Search` : Filtres et recherche
- `Download`, `Upload` : Téléchargement
- `Thermometer` : Température
- `X`, `Check` : Actions

**Avantages vs react-icons :**
- Bundle size plus petit (~175 KB économisés)
- Design plus cohérent et moderne
- Props TypeScript complètes
- Support du tree-shaking natif
- Active maintenance

---

## Bibliothèques de graphiques

### Chart.js 4.4.3 + React-Chart.js-2 5.3.1
Bibliothèque de graphiques moderne (en cours de migration depuis recharts).

**Configuration :**
```tsx
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Enregistrer les composants nécessaires
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)
```

**Usage :**
```tsx
const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  datasets: [
    {
      label: 'Température',
      data: [18, 20, 19, 22, 21],
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    }
  ]
}

const options = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Évolution de la température' }
  }
}

<Line data={data} options={options} />
```

### Recharts 3.5.0
Bibliothèque de graphiques actuelle (temporairement maintenue).

**Usage actuel :**
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

<LineChart width={600} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="temperature" stroke="#8884d8" />
</LineChart>
```

**Note :** Migration vers Chart.js en cours (guide disponible dans `docs/maj dependances/2025-11-27/MIGRATION_CHARTJS_GUIDE.md`).

---

## Bibliothèques d'animations

### Framer Motion 11.15.0
Bibliothèque d'animations React déclarative et performante.

**Usage :**
```tsx
import { motion } from 'framer-motion'

export function AnimatedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card>...</Card>
    </motion.div>
  )
}

// Animations au hover
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Cliquez-moi
</motion.button>
```

### Next View Transitions 0.3.4
Bibliothèque pour les transitions entre pages Next.js.

**Usage :**
```tsx
import { Link } from 'next-view-transitions'

// Remplace les <Link> de Next.js pour des transitions fluides
<Link href="/surveillance">Surveillance</Link>
```

---

## Bibliothèques de carrousels

### Swiper 12.0.3
Bibliothèque de carrousels moderne et performante.

**Installation :**
```bash
npm install swiper@12.0.3
```

**Usage :**
```tsx
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

export function ImageCarousel() {
  return (
    <Swiper
      modules={[Navigation, Pagination]}
      spaceBetween={50}
      slidesPerView={1}
      navigation
      pagination={{ clickable: true }}
    >
      <SwiperSlide><img src="/img1.jpg" /></SwiperSlide>
      <SwiperSlide><img src="/img2.jpg" /></SwiperSlide>
    </Swiper>
  )
}
```

---

## Bibliothèques réseau

### Axios 1.7.2
Client HTTP pour les requêtes vers l'Agent C# et services externes.

**Usage :**
```tsx
import axios from 'axios'

// Requêtes vers Agent C#
const response = await axios.get('http://localhost:8000/downloadLogTagConfiguration')

// Requêtes avec timeout
const data = await axios.get('/api/mesures/123', { timeout: 5000 })

// Requêtes POST
await axios.post('http://localhost:8000/alarm', null, {
  params: { action: 'show', idLieu: 123 }
})
```

### mysql2 3.9.7
Driver MySQL pour Node.js utilisé dans les API routes.

**Configuration :**
```tsx
// app/libs/mysql.tsx
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST || '192.168.63.121',
  port: 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pass',
  database: process.env.DB_SCHEMA_VIGITEMP || 'vigitemp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export default pool
```

**Usage dans API Routes :**
```tsx
// app/api/lieux/route.ts
import pool from '@/app/libs/mysql'

export async function GET() {
  const [rows] = await pool.query('SELECT * FROM lieux WHERE actif = 1')
  return Response.json(rows)
}
```

---

## Structure du projet

```
website/
├── src/
│   └── app/
│       ├── api/                    # API Routes Next.js
│       │   ├── lieux/              # Endpoints lieux
│       │   │   ├── route.ts        # GET /api/lieux
│       │   │   ├── type/[slug]/    # GET /api/lieux/type/:slug
│       │   │   ├── getInfos/[slug]/# GET /api/lieux/getInfos/:slug
│       │   │   └── alerte/[slug]/  # POST /api/lieux/alerte/:slug
│       │   ├── mesures/            # Endpoints mesures
│       │   │   ├── [IdLieu]/       # GET /api/mesures/:IdLieu
│       │   │   └── vigilog/[id]/   # GET /api/mesures/vigilog/:id
│       │   ├── groupes/            # GET /api/groupes
│       │   └── postes_clients/     # GET /api/postes_clients
│       │
│       ├── components/             # Composants React réutilisables
│       │   ├── filter/             # Composants de filtrage
│       │   │   ├── Filter.tsx
│       │   │   ├── groupFilter.tsx
│       │   │   └── typeFilter.tsx
│       │   ├── monitoring-graph.tsx              # Graphique principal
│       │   ├── monitoring-graph-fullScreen*.tsx  # Variantes plein écran
│       │   ├── card-alarm.tsx                    # Carte d'alarme
│       │   ├── vigilog-settings.tsx              # Configuration Vigilog
│       │   ├── notificationBellDelay-dropdown.tsx# Notification bell
│       │   └── infoTooltip-lieu.tsx              # Info tooltip
│       │
│       ├── libs/                   # Utilitaires et helpers
│       │   ├── mysql.tsx           # Connexion MySQL
│       │   ├── utils_lieux.tsx     # Helpers lieux
│       │   ├── utils_mesures.tsx   # Helpers mesures
│       │   └── utils_graphiques.tsx# Helpers graphiques
│       │
│       ├── surveillance/           # Module Surveillance
│       │   └── [idLieu]/           # Page détail lieu dynamique
│       │       └── page.tsx
│       │
│       ├── metrologie/             # Module Métrologie
│       │   ├── sondes/             # Gestion sondes
│       │   ├── lieux/              # Gestion lieux
│       │   ├── calibrages/         # Calibrages
│       │   └── alarmes/            # Historique alarmes
│       │       └── page.tsx
│       │
│       ├── vigilog/                # Module Vigilog
│       │   └── page.tsx
│       │
│       ├── layout.tsx              # Layout racine
│       ├── page.tsx                # Page d'accueil
│       ├── providers.tsx           # Providers React
│       └── globals.css             # Styles globaux
│
├── public/                         # Assets statiques
├── next.config.mjs                 # Configuration Next.js
├── tailwind.config.ts              # Configuration Tailwind
├── tsconfig.json                   # Configuration TypeScript
└── package.json                    # Dépendances
```

---

## Modules fonctionnels

### 1. Surveillance (`/surveillance`)

Module principal pour la visualisation en temps réel des températures.

**Fonctionnalités :**
- Liste des lieux surveillés
- Graphiques temps réel (LineChart)
- Alertes actives avec notification visuelle
- Filtres par groupe, type, statut
- Vue détaillée par lieu (`/surveillance/[idLieu]`)

**Composants clés :**
- `monitoring-graph.tsx` : Graphique principal avec données temps réel
- `card-alarm.tsx` : Carte affichant les alarmes actives
- `Filter.tsx`, `groupFilter.tsx`, `typeFilter.tsx` : Composants de filtrage

### 2. Métrologie (`/metrologie`)

Module de gestion et configuration du système.

**Sous-modules :**
- **Sondes** (`/metrologie/sondes`) : Gestion des capteurs série
- **Lieux** (`/metrologie/lieux`) : Configuration des sites surveillés
- **Calibrages** (`/metrologie/calibrages`) : Historique des calibrages
- **Alarmes** (`/metrologie/alarmes`) : Historique complet des alarmes

**Composants clés :**
- Tableaux de données (Hero UI `Table`)
- Formulaires de configuration (Hero UI `Input`, `Select`)
- Modals de confirmation (Hero UI `Modal`)

### 3. Vigilog (`/vigilog`)

Module d'interface avec les capteurs LogTag USB.

**Fonctionnalités :**
- Configuration des seuils de température
- Téléchargement des mesures depuis dock USB
- Communication avec Agent C# (port 8000)
- Affichage graphique des mesures téléchargées

**Composants clés :**
- `vigilog-settings.tsx` : Configuration capteur
- Communication Axios avec endpoints Agent :
  - `GET /downloadLogTagConfiguration`
  - `POST /uploadLogTagConfiguration`
  - `GET /DownloadLogTagData`

---

## API Routes Next.js

### Endpoints lieux

#### `GET /api/lieux`
Retourne la liste de tous les lieux actifs.

**Réponse :**
```json
[
  {
    "Id": 1,
    "Nom": "Chambre froide A",
    "Type": "Chambre froide",
    "Actif": 1,
    "IdGroupe": 5
  }
]
```

#### `GET /api/lieux/type/[slug]`
Filtre les lieux par type.

**Exemple :** `/api/lieux/type/chambre-froide`

#### `GET /api/lieux/getInfos/[slug]`
Récupère les détails complets d'un lieu.

**Réponse :**
```json
{
  "Id": 1,
  "Nom": "Chambre froide A",
  "Type": "Chambre froide",
  "ConsigneHaute": 8.0,
  "ConsigneBasse": 2.0,
  "DerniereMesure": 5.2,
  "DateDerniereMesure": "2025-11-27T14:30:00"
}
```

#### `POST /api/lieux/alerte/[slug]`
Déclenche ou masque une alerte pour un lieu.

**Body :**
```json
{
  "action": "show" // ou "hide"
}
```

**Processus :**
1. Enregistre l'alarme dans `vigitemp.alarmes`
2. Appelle Agent C# `POST /alarm` (port 8000)
3. Agent affiche pop-up Windows

---

### Endpoints mesures

#### `GET /api/mesures/[IdLieu]`
Récupère l'historique des mesures d'un lieu.

**Query params :**
- `debut` : Date de début (format ISO)
- `fin` : Date de fin (format ISO)
- `limit` : Nombre max de résultats

**Réponse :**
```json
[
  {
    "IdMesure": 12345,
    "ValeurMesure": 5.2,
    "HeureMesure": "2025-11-27T14:30:00",
    "IdLieu": 1
  }
]
```

#### `GET /api/mesures/vigilog/[idRecuperationMesure]`
Récupère les mesures d'un téléchargement Vigilog spécifique.

**Réponse :**
```json
[
  {
    "serialNumber": "LT1234",
    "valeur_mesure": 6.3,
    "heure_mesure": "2025-11-27T10:15:00",
    "id_recuperationMesure": "20251127143025"
  }
]
```

---

### Endpoints groupes

#### `GET /api/groupes`
Liste tous les groupes de lieux.

**Réponse :**
```json
[
  {
    "Id": 1,
    "Nom": "Étage 1",
    "NombreLieux": 5
  }
]
```

---

### Endpoints postes clients

#### `GET /api/postes_clients`
Liste les postes clients avec Agent installé.

**Réponse :**
```json
[
  {
    "Id": 1,
    "NomMachineConnexion": "PC-SUPERVISION",
    "AdresseIpConnexion": "192.168.1.100"
  }
]
```

---

## Communication avec Agent C#

Le frontend communique avec l'Agent C# via Axios pour les opérations Vigilog.

### Configuration Vigilog

```tsx
// Component vigilog-settings.tsx
import axios from 'axios'

async function downloadConfiguration() {
  try {
    const response = await axios.get('http://localhost:8000/downloadLogTagConfiguration')
    
    if (response.data.res === "true") {
      setConsigneHaute(response.data.res_consigneHauteActive)
      setValeurHaute(response.data.res_consigneHauteValeur)
      setConsigneBasse(response.data.res_consigneBasseActive)
      setValeurBasse(response.data.res_consigneBasseValeur)
      
      toast.success("Configuration téléchargée")
    } else {
      toast.error(response.data.details)
    }
  } catch (error) {
    toast.error("Impossible de contacter l'agent")
  }
}
```

### Téléchargement mesures

```tsx
async function downloadData() {
  try {
    const response = await axios.get('http://localhost:8000/DownloadLogTagData')
    
    if (response.data.res === "true") {
      const idRecup = response.data.id_recuperationMesure
      
      // Récupérer les mesures depuis API Next.js
      const mesuresResponse = await axios.get(`/api/mesures/vigilog/${idRecup}`)
      setMesures(mesuresResponse.data)
      
      toast.success("Données téléchargées")
    } else {
      toast.error(response.data.details)
    }
  } catch (error) {
    toast.error("Erreur lors du téléchargement")
  }
}
```

### Upload configuration

```tsx
async function uploadConfiguration() {
  try {
    await axios.post('http://localhost:8000/uploadLogTagConfiguration', null, {
      params: {
        consigneHaute: consigneHaute ? 1 : 0,
        consigneBasse: consigneBasse ? 1 : 0,
        valeurConsigneHaute: valeurHaute,
        valeurConsigneBasse: valeurBasse
      }
    })
    
    toast.success("Configuration appliquée")
  } catch (error) {
    toast.error("Erreur lors de l'upload")
  }
}
```

---

## Gestion des alertes

### Workflow complet

```
1. Capteur dépasse seuil
        │
        ▼
2. Server C# détecte anomalie (timer 60s)
        │
        ▼
3. Server écrit dans vigitemp.alarmes
        │
        ▼
4. Server appelle POST /alarm (Agent port 8000)
        │
        ▼
5. Agent affiche pop-up Windows
        │
        ▼
6. Website appelle POST /api/lieux/alerte/[slug]
        │
        ▼
7. Website affiche toast Sonner
        │
        ▼
8. Website met à jour badge notification
```

### Composant AlertBell

```tsx
import { Bell, BellOff } from 'lucide-react'
import { Badge } from '@heroui/react'

export function AlertBell({ alarmsCount }) {
  return (
    <Badge content={alarmsCount} color="danger">
      {alarmsCount > 0 ? (
        <Bell className="text-red-500" size={24} />
      ) : (
        <BellOff className="text-gray-400" size={24} />
      )}
    </Badge>
  )
}
```

---

## Configuration environnement

### Variables d'environnement

Créer un fichier `.env.local` :

```env
# Base de données MySQL
DB_HOST=192.168.63.121
DB_USER=root
DB_PASSWORD=pass
DB_SCHEMA_VIGITEMP=vigitemp
DB_SCHEMA_VIGITEMP_MESURE=vigitemp_mesure

# Agent C#
AGENT_URL=http://localhost:8000

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Configuration Next.js

```javascript
// next.config.mjs
const nextConfig = {
  reactStrictMode: true,
  
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type' },
        ],
      },
    ]
  },
}

export default nextConfig
```

---

## Développement

### Commandes principales

```bash
# Installation dépendances
npm install --legacy-peer-deps

# Mode développement (hot reload)
npm run dev
# Accessible sur http://localhost:3000

# Build production
npm run build

# Démarrer serveur production
npm start

# Linter
npm run lint
```

### Structure d'un composant type

```tsx
'use client' // Si utilise hooks ou event handlers

import { useState, useEffect } from 'react'
import { Card, CardBody, CardHeader } from '@heroui/react'
import { Thermometer } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

interface MonComposantProps {
  idLieu: number
  titre: string
}

export default function MonComposant({ idLieu, titre }: MonComposantProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchData()
  }, [idLieu])
  
  async function fetchData() {
    try {
      const response = await axios.get(`/api/mesures/${idLieu}`)
      setData(response.data)
      setLoading(false)
    } catch (error) {
      toast.error("Erreur lors du chargement")
      setLoading(false)
    }
  }
  
  if (loading) return <div>Chargement...</div>
  
  return (
    <Card>
      <CardHeader>
        <Thermometer className="mr-2" />
        {titre}
      </CardHeader>
      <CardBody>
        {/* Contenu */}
      </CardBody>
    </Card>
  )
}
```

---

## Bonnes pratiques

### TypeScript
- Toujours typer les props des composants
- Utiliser des interfaces pour les objets complexes
- Éviter `any`, préférer `unknown` si nécessaire

### Performance
- Utiliser `React.memo()` pour composants coûteux
- Éviter les re-renders inutiles avec `useMemo` et `useCallback`
- Lazy loading des composants lourds :
  ```tsx
  const MonGraphique = dynamic(() => import('./MonGraphique'), { ssr: false })
  ```

### Accessibilité
- Hero UI gère l'accessibilité de base
- Ajouter `aria-label` sur les icônes sans texte
- Utiliser des balises sémantiques (`<nav>`, `<main>`, `<section>`)

### Sécurité
- Ne jamais exposer credentials en frontend
- Valider les données côté serveur (API routes)
- Sanitiser les inputs utilisateur
- Utiliser HTTPS en production

---

## Tests (à implémenter)

### Tests unitaires (Vitest + React Testing Library)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

```tsx
// __tests__/components/card-alarm.test.tsx
import { render, screen } from '@testing-library/react'
import CardAlarm from '@/app/components/card-alarm'

describe('CardAlarm', () => {
  it('affiche le nom du lieu en alarme', () => {
    render(<CardAlarm lieu="Chambre froide A" temperature={10} />)
    expect(screen.getByText('Chambre froide A')).toBeInTheDocument()
  })
})
```

### Tests E2E (Playwright)

```bash
npm install -D @playwright/test
```

```typescript
// e2e/surveillance.spec.ts
import { test, expect } from '@playwright/test'

test('affiche la liste des lieux surveillés', async ({ page }) => {
  await page.goto('http://localhost:3000/surveillance')
  await expect(page.locator('h1')).toHaveText('Surveillance')
  await expect(page.locator('.lieu-card')).toHaveCount(5)
})
```

---

## Déploiement

### Build optimisé

```bash
npm run build
```

**Résultat :**
- Génération dossier `.next/`
- Optimisation images, fonts, bundles
- Minification code
- Génération static assets

### Démarrage production

```bash
npm start
# Port par défaut : 3000
```

### Docker (optionnel)

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

RUN npm ci --legacy-peer-deps --production

EXPOSE 3000
CMD ["npm", "start"]
```

**Commandes Docker :**
```bash
docker build -t vigitemp-frontend .
docker run -p 3000:3000 -e DB_HOST=192.168.63.121 vigitemp-frontend
```

---

## Dépendances complètes

```json
{
  "dependencies": {
    "@heroui/react": "^2.7.5",       // Composants UI
    "axios": "^1.7.2",               // Client HTTP
    "chart.js": "^4.4.3",            // Graphiques (migration)
    "chartjs-plugin-annotation": "^3.0.1",
    "framer-motion": "^11.15.0",     // Animations
    "lucide-react": "^0.555.0",      // Icônes
    "mysql2": "^3.9.7",              // Driver MySQL
    "next": "^15.1.0",               // Framework
    "next-view-transitions": "^0.3.4", // Transitions pages
    "react": "^19.0.0",              // UI Library
    "react-chartjs-2": "^5.3.1",     // Wrapper Chart.js
    "react-dom": "^19.0.0",          // React DOM
    "recharts": "^3.5.0",            // Graphiques (temporaire)
    "sonner": "^2.0.7",              // Notifications
    "swiper": "^12.0.3"              // Carrousels
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "^15.1.0",
    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    "typescript": "^5"
  }
}
```

---

## Roadmap

### Court terme
- [ ] Migration complète vers Chart.js (12-16h)
- [ ] Implémentation tests unitaires (Vitest)
- [ ] Optimisation performance (lazy loading)

### Moyen terme
- [ ] Tests E2E (Playwright)
- [ ] PWA (Progressive Web App)
- [ ] Dark mode complet
- [ ] Internationalisation (i18n)

### Long terme
- [ ] Migration vers React Server Components purs
- [ ] Optimisation SEO
- [ ] Application mobile (React Native)

---

**Documentation mise à jour le 27 novembre 2025**
