# Pages et Composants de Test

Ce dossier contient des pages et composants utilisés pour le développement et les tests de performance. Ces éléments sont **automatiquement désactivés en production**.

## 🧪 Pages de test

### `/surveillance-cached`
- **But** : Tester les performances du cache Next.js 16 avec Cache Components
- **Fonctionnalités** :
  - Stats dashboard avec `"use cache"`
  - Liste des locations cachée
  - Contrôles pour invalider le cache manuellement
  - Mesure des temps de chargement

### Composants de test

#### `<DashboardStats />` (`components/dashboard-stats.tsx`)
- Statistiques globales du système (capteurs, alarmes, lieux)
- Utilise `"use cache"` avec tag `"dashboard-stats"`
- Requêtes Prisma groupées pour optimiser les perfs

#### `<CachedLocationsList />` (`components/cached-locations-list.tsx`)
- Liste des lieux avec compteurs de capteurs
- Utilise `"use cache"` avec tag `"locations-list"`
- Affichage optimisé avec StatusBadge

#### `<CacheControls />` (`components/cache-controls.tsx`)
- Boutons pour tester le cache en temps réel
- Refresh : Recharge depuis le cache (~10ms)
- Invalider : Force le rechargement depuis MySQL (~200ms)

#### `<DevModeBadge />` (`components/dev-mode-badge.tsx`)
- Badge visuel "Mode Test / Dev" en bas à gauche
- S'affiche uniquement quand les feature flags de test sont actifs

## 🚀 Scripts disponibles

### Développement
```bash
npm run dev
# Toutes les pages de test sont accessibles
# http://localhost:3000/surveillance-cached
```

### Build Production (sans pages de test)
```bash
npm run build:prod
npm start
# Les routes /surveillance-cached, /test, /debug renvoient 404
```

### Build Test (avec pages de test)
```bash
npm run build:test
npm run start:test
# Les pages de test sont accessibles même en build
# Utile pour tester les perfs en conditions réelles
```

## 🎯 Feature Flags

Configurés dans `src/lib/feature-flags.ts` :

| Flag | Dev | Prod | Description |
|------|-----|------|-------------|
| `enableTestPages` | ✅ | ❌ | Pages /surveillance-cached, /test, /debug |
| `enableCacheControls` | ✅ | ❌ | Boutons de contrôle du cache |
| `enableRevalidateAPI` | ✅ | ❌ | API /api/revalidate |
| `enablePerformanceLogs` | ✅ | ❌ | Console.log des temps de réponse |

### Override en production
```bash
# Activer les pages de test en prod (staging seulement)
ENABLE_TEST_PAGES=true npm start

# Activer le debug du cache
ENABLE_CACHE_DEBUG=true npm start

# Activer l'API de revalidation
ENABLE_REVALIDATE_API=true npm start
```

## 🔒 Sécurité

- **Proxy** : Bloque les routes de test en production (redirect 404)
- **API** : `/api/revalidate` renvoie 403 Forbidden en prod
- **Composants** : Retournent `null` ou `notFound()` en prod

## 📊 Performances mesurées

### Dev mode (Turbopack)
- Page cached : ~100-200ms
- Page fresh : ~300-500ms
- API revalidate : ~300ms

### Production build (optimisé)
- Page cached : **~5-15ms** ⚡
- Page fresh : ~50-100ms
- API revalidate : ~20-50ms

## 💡 Utilisation recommandée

1. **Pendant le dev** : Utilise `/surveillance-cached` pour tester les perfs
2. **Avant le déploiement** : Test avec `npm run build:test` pour mesurer les gains réels
3. **En production** : Les pages de test sont automatiquement inaccessibles
4. **En staging** : Utilise les env vars pour activer temporairement les outils de debug

## 🗑️ Nettoyage

Si tu veux supprimer définitivement ces pages de test :

```bash
# Supprimer les fichiers
rm -rf src/app/(dashboard)/surveillance-cached
rm src/components/dashboard-stats.tsx
rm src/components/cached-locations-list.tsx
rm src/components/cache-controls.tsx
rm src/components/dev-mode-badge.tsx
rm src/app/api/revalidate/route.ts
rm src/middleware/test-routes.ts
rm src/lib/feature-flags.ts
```

Mais je recommande de les garder pour les futurs développements !
