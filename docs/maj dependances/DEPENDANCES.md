# Dépendances - Version Finale

## Framework & Core

### Next.js
- **Version**: `^15.1.0` (latest stable)
- **Rôle**: Framework React avec SSR/SSG, routing, API routes
- **Statut**: ✅ À conserver
- **Notes**: Next.js 15 avec support React 19

### React
- **Version**: `^19.0.0` (latest)
- **Rôle**: Bibliothèque UI principale
- **Statut**: ✅ À conserver
- **Notes**: React 19 avec React Compiler, Actions, et optimisations

### TypeScript
- **Version**: `^5.x` (latest stable)
- **Rôle**: Typage statique
- **Statut**: ✅ À conserver

---

## Styling

### Tailwind CSS
- **Version recommandée**: `^3.4.1` (stable actuelle)
- **Alternative**: `^4.0.0-beta.1` (beta - sortie stable imminente)
- **Rôle**: Framework CSS utility-first
- **Statut**: ✅ À conserver

**Recommandation**: **Rester sur Tailwind CSS v3.4.1 pour l'instant**
- ✅ **Stable et production-ready**
- ✅ Compatibilité totale avec HeroUI v2
- ✅ Écosystème mature (plugins, documentation)
- ✅ Pas de breaking changes à gérer
- ⚠️ **v4 est en beta** (sortie stable prévue fin 2025/début 2026)
- ⚠️ v4 nécessite migration de configuration (CSS-first au lieu de JS)
- ⚠️ v4 peut avoir des incompatibilités avec certains composants actuels

**Migration v4**: À considérer après sortie stable et une fois le frontend stabilisé.

### PostCSS
- **Version**: `^8.x`
- **Rôle**: Transformation CSS (requis par Tailwind)
- **Statut**: ✅ À conserver

---

## UI Components

### HeroUI (NextUI)
- **Version**: `^2.7.5` (latest)
- **Package**: `@heroui/react`
- **Rôle**: Bibliothèque de composants UI (boutons, modals, inputs, etc.)
- **Statut**: ✅ À conserver
- **Notes**: Compatible Tailwind v3, utilise Framer Motion

### Lucide React
- **Version**: `^0.555.0`
- **Rôle**: Icônes (fork de Feather Icons)
- **Statut**: ✅ À conserver
- **Notes**: 1400+ icônes, tree-shakeable

---

## Animations & UI Effects

### Framer Motion
- **Version**: `^11.15.0`
- **Rôle**: Animations React déclaratives
- **Statut**: ✅ À conserver
- **Notes**: Dépendance de HeroUI, utilisé pour animations custom

### Swiper
- **Version**: `^12.0.3` (latest)
- **Rôle**: Carousels/sliders tactiles
- **Statut**: ✅ À conserver
- **Notes**: Touch-enabled, responsive

### Next View Transitions
- **Version**: `^0.3.4`
- **Rôle**: Transitions entre pages (View Transitions API)
- **Statut**: ✅ À conserver
- **Notes**: Animations fluides entre routes Next.js
- **Notes supplémentaires**: privilégier Framer Motion + layout App Router, et passer sur les view transitions natives à Next.js quand la version 16 sortira en LTS + stable

---

## Data Visualization

### Chart.js
- **Version**: `^4.4.3` (latest stable)
- **Rôle**: Graphiques canvas (lignes, barres, etc.)
- **Statut**: ✅ À conserver - **Migration en cours**
- **Notes**: Remplace Recharts progressivement

### React-Chart.js-2
- **Version**: `^5.3.1`
- **Rôle**: Wrapper React pour Chart.js
- **Statut**: ✅ À conserver

### chartjs-plugin-zoom
- **Version**: `^2.0.1`
- **Rôle**: Zoom/pan interactif sur graphiques
- **Statut**: ✅ À conserver

### chartjs-plugin-annotation
- **Version**: `^3.0.1`
- **Rôle**: Annotations sur graphiques (lignes seuils, zones)
- **Statut**: ✅ À conserver

### Recharts
- **Version**: `^3.5.0`
- **Rôle**: Graphiques SVG déclaratifs
- **Statut**: ❌ **À SUPPRIMER après migration complète**
- **Notes**: Remplacé par Chart.js (meilleures performances)

---

## Database & Backend

### Prisma
- **Version**: Non installée actuellement
- **Rôle**: ORM TypeScript pour MySQL
- **Statut**: ⚠️ **À évaluer selon refonte**
- **Notes**: Actuellement, queries MySQL directes avec `mysql2`
- **Avantages**: Type-safety, migrations, relations auto
- **Inconvénient**: Nécessite refonte des queries actuelles

### MySQL2
- **Version**: `^3.9.7`
- **Rôle**: Driver MySQL natif pour Node.js
- **Statut**: ✅ À conserver (pour l'instant)
- **Notes**: Connexion directe BDD `vigitemp` et `vigitemp_mesure`

---

## HTTP & Notifications

### Axios
- **Version**: `^1.7.2`
- **Rôle**: Client HTTP pour appels API côté client
- **Statut**: ✅ À conserver
- **Usage recommandé**: 
  - ✅ **Côté client** (Client Components, hooks, interactions utilisateur)
  - ❌ **Éviter côté serveur** (Server Components, Route Handlers)
- **Avantages**: Intercepteurs, timeouts, transformations, gestion erreurs centralisée
- **Best practice**: Créer un client centralisé `apiClient.ts` avec:
  ```typescript
  // lib/apiClient.ts
  import axios from 'axios';
  
  export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
  });
  
  // Intercepteurs pour auth, logs, erreurs
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      // Gestion centralisée des erreurs
      console.error('API Error:', error);
      return Promise.reject(error);
    }
  );
  ```

### Fetch (natif)
- **Version**: Native JavaScript/Next.js
- **Rôle**: Appels HTTP standards
- **Statut**: ✅ À utiliser en complément d'Axios
- **Usage recommandé**:
  - ✅ **Server Components** (data fetching SSR)
  - ✅ **Route Handlers** (API routes Next.js)
  - ✅ Nouveaux endpoints backend
- **Avantages Next.js**: Cache automatique, revalidation, optimisations
- **Exemple**:
  ```typescript
  // app/dashboard/page.tsx (Server Component)
  async function getData() {
    const res = await fetch('http://localhost:8000/api/sensors', {
      next: { revalidate: 60 } // Cache 60s
    });
    return res.json();
  }
  ```

**Stratégie hybride recommandée**:
- 🔵 **Axios** → Client Components (interactions, mutations)
- 🟢 **fetch** → Server Components (data fetching SSR)
- Pas de refactor massif nécessaire, migration progressive

### Sonner
- **Version**: `^2.0.7`
- **Rôle**: Toast notifications élégantes
- **Statut**: ✅ À conserver
- **Notes**: Lightweight, customizable, accessible

---

## DevDependencies

### ESLint
- **Version**: `^8.x`
- **Config**: `eslint-config-next ^15.1.0`
- **Statut**: ✅ À conserver
- **Notes**: Linting code Next.js/React

### Types
- `@types/node`: `^20.x`
- `@types/react`: `^18.x`
- `@types/react-dom`: `^18.x`
- **Statut**: ✅ À conserver

---

## Résumé Installation (Version Finale)

### Dependencies à installer:
```json
{
  "dependencies": {
    "@heroui/react": "^2.7.5",
    "axios": "^1.7.2",
    "chart.js": "^4.4.3",
    "chartjs-plugin-annotation": "^3.0.1",
    "chartjs-plugin-zoom": "^2.0.1",
    "framer-motion": "^11.15.0",
    "lucide-react": "^0.555.0",
    "mysql2": "^3.9.7",
    "next": "^15.1.0",
    "next-view-transitions": "^0.3.4",
    "react": "^19.0.0",
    "react-chartjs-2": "^5.3.1",
    "react-dom": "^19.0.0",
    "sonner": "^2.0.7",
    "swiper": "^12.0.3"
  }
}
```

### DevDependencies à installer:
```json
{
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

### À supprimer après migration:
```bash
npm uninstall recharts
```

---

## Dépendances Optionnelles à Considérer

### Prisma (ORM)
- **Version**: `^6.1.0`
- **Quand**: Si refonte complète des queries BDD
- **Installation**:
  ```bash
  npm install prisma @prisma/client
  npx prisma init
  ```
- **Avantages**: Type-safety totale, migrations auto, dev experience++
- **Effort**: Moyen (modélisation schema, migration queries existantes)

### React Hook Form
- **Version**: `^7.53.0`
- **Quand**: Si nombreux formulaires complexes
- **Avantages**: Performance, validation, typage
- **Note**: HeroUI a déjà des composants form intégrés

### Zod
- **Version**: `^3.23.8`
- **Quand**: Si validation schémas côté client/serveur
- **Combo**: Fonctionne bien avec React Hook Form + Prisma

---

## Notes Migration

### Tailwind CSS v3 → v4 (Future)
**Quand**: Après sortie stable (fin 2025/début 2026) + frontend stabilisé

**Breaking Changes**:
1. Configuration passe de `tailwind.config.js` → CSS `@theme`
2. Plugins doivent être compatibles v4
3. Certaines classes peuvent changer

**Avantages v4**:
- Builds 5x plus rapides
- Incremental builds 100x plus rapides
- CSS-first config (plus propre)
- Support natif cascade layers
- Wide-gamut colors
- Container queries intégrées

**Recommandation**: Rester v3.4.1 pour la stabilité actuelle.

### Recharts → Chart.js
**Statut**: Migration en cours (2/6 fichiers migrés)

**Fichiers restants**:
- `monitoring-graph-fullScreen-eventHighlight.tsx`
- `monitoring-graph-fullScreen-eventHighlight copy.tsx`
- `monitoring-graph-fullScreen-zoom-refine.tsx`
- `monitoring-graph-fullScreen-zoom-refine_cleanUp.tsx`

**Action**: À finaliser après refonte frontend semaine prochaine.

---

## Bonnes Pratiques

### Architecture HTTP recommandée

#### 1. Client API centralisé (Axios côté client)
```typescript
// lib/apiClient.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour logs/auth
apiClient.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Intercepteur pour erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirection login si non authentifié
    }
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);
```

#### 2. Usage dans Client Components
```typescript
// components/SensorList.tsx
'use client';
import { apiClient } from '@/lib/apiClient';
import { useEffect, useState } from 'react';

export function SensorList() {
  const [sensors, setSensors] = useState([]);
  
  useEffect(() => {
    apiClient.get('/api/sensors')
      .then(res => setSensors(res.data))
      .catch(err => console.error(err));
  }, []);
  
  return <div>{/* ... */}</div>;
}
```

#### 3. Usage fetch dans Server Components
```typescript
// app/dashboard/page.tsx
async function getSensors() {
  const res = await fetch('http://localhost:8000/api/sensors', {
    next: { revalidate: 60 }, // Cache 60s
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function DashboardPage() {
  const sensors = await getSensors();
  return <div>{/* ... */}</div>;
}
```

#### 4. Route Handlers (API Routes Next.js)
```typescript
// app/api/sensors/route.ts
export async function GET() {
  // Utiliser fetch ou mysql2 directement
  const res = await fetch('http://192.168.1.100:8000/GetAllSensors');
  const data = await res.json();
  
  return Response.json(data);
}
```

### Résumé stratégie HTTP

| Contexte | Outil recommandé | Raison |
|----------|------------------|--------|
| Client Component | ✅ **Axios** | Intercepteurs, gestion erreurs, timeouts |
| Server Component | ✅ **fetch** | Cache Next.js, revalidation auto |
| Route Handler | ✅ **fetch** | Natif, optimisé Next.js |
| Appel C# Agent/Serveur | ✅ **fetch** ou **Axios** | Selon contexte (client vs serveur) |

**Principe**: Pas de refactor massif, migration progressive selon les besoins.

---

## Commandes Utiles

### Installation propre:
```bash
# Supprimer node_modules et lock
Remove-Item -Recurse -Force node_modules, package-lock.json

# Réinstaller
npm install
```

### Vérifier versions outdated:
```bash
npm outdated
```

### Update toutes les dépendances (avec prudence):
```bash
npm update
```

### Audit sécurité:
```bash
npm audit
npm audit fix
```
