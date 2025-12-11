# Chargement Virtualisé et Responsif - Guide d'Intégration

## 📋 Vue d'ensemble

Ce système implémente un **chargement intelligent et progressif** des capteurs sur la page de surveillance, basé sur:
- **Taille d'écran** (responsive detection)
- **Scroll utilisateur** (Intersection Observer)
- **Cache intelligent** (déjà en place)

## 🎯 Résultats attendus

### Avant (ancien système)
```
Chargement TOUS les 764 capteurs au chargement initial
↓
~ 30-40 secondes de freeze
↓
95,500 requêtes DB en parallèle (collision)
↓
Page inutilisable pendant le chargement
```

### Après (nouveau système)
```
Affichage initial: 4-10 capteurs seulement (selon l'écran)
↓
~ 0.5-1 seconde de chargement initial
↓
~8-24 requêtes DB max en parallèle
↓
Page interactive immédiatement ✓

Au scroll: Chargement par batch de 24 capteurs
↓
~ 0.3-0.5s par batch
↓
Utilisateur voit: "Affichage 50 sur 764 capteurs"
```

## 📱 Breakpoints de responsive

| Appareil | Grille | Cards initiales | Après 1 scroll | Après 2 scrolls |
|----------|--------|-----------------|----------------|-----------------|
| **Mobile (sm)** | 1 col | 1-2 cards | 26 cards | 50 cards |
| **Tablet (md)** | 3 cols | 6 cards | 30 cards | 54 cards |
| **Desktop (lg)** | 4 cols | 8 cards | 32 cards | 56 cards |
| **Wide (xl)** | 5 cols | 10 cards | 34 cards | 58 cards |
| **Ultra Wide (2xl)** | 6 cols | 12 cards | 36 cards | 60 cards |

## 🛠️ Architecture

### 1. **Hook: `useVirtualizedPagination`**
```typescript
// Calcule dynamiquement combien de cards doivent être affichées
// En fonction de la taille de l'écran et de la hauteur disponible
{
  visibleCount: 10,          // Nombre de cards à afficher initialement
  displayedCount: 10,         // Nombre actuellement affiché
  totalItems: 764,            // Total disponible
  hasMore: true,              // Y a-t-il plus à charger?
  getDisplayedItems(items)    // Fonction pour filtrer les items à afficher
}
```

### 2. **Hook: `usePaginatedSensors`**
```typescript
// React Query infinite scroll pour charger les données
// Fait les requêtes API par batches
{
  sensors: [],               // Tous les sensors chargés
  total: 764,               // Total dans le système
  hasMore: true,            // Peut-on charger plus?
  isLoading: false,         // Chargement initial?
  isFetching: true,         // Chargement en cours?
  loadMore()                // Charger la page suivante
}
```

### 3. **Composant: `SensorsGridWithVirtualization`**
```typescript
// Combine les deux hooks
// Affiche seulement ce qui est nécessaire
// Charge automatiquement en scrollant

<SensorsGridWithVirtualization
  siteId={filters.siteId}
  groupIds={filters.groupIds}
>
  {(sensor) => <SensorCard sensor={sensor} />}
</SensorsGridWithVirtualization>
```

### 4. **API Route: `/api/sensors/paginated`**
```typescript
// Backend optimisé pour pagination
// Query parameters:
//   - offset: À partir de quel index commencer
//   - limit: Combien de résultats
//   - siteId: Filtrer par site (optionnel)
//   - groupIds: Filtrer par groupes (optionnel)

GET /api/sensors/paginated?offset=0&limit=24&siteId=1&groupIds=1,2
↓
Response:
{
  data: [{...}, {...}],
  pagination: {
    offset: 0,
    limit: 24,
    total: 764,
    hasMore: true,
    count: 24
  }
}
```

## 💾 Base de données - Optimisations

Le système utilise des **requêtes Prisma optimisées**:

```typescript
// ❌ MAUVAIS: N requêtes (une par location)
for (let location of locations) {
  const measure = await db.query(`SELECT * FROM ts_mesure WHERE IdLieu = ${location.IdLieu} LIMIT 1`);
}
// Résultat: 764 requêtes de mesures = lent et coûteux

// ✅ BON: 1 requête batch + Promise.all
const locations = await prisma.t_lieu.findMany({
  where: filters,
  skip: offset,
  take: limit  // Pagination à la DB level
});

const withMeasures = await Promise.all(
  locations.map(loc => 
    db.ts_mesure.findFirst({ where: { IdLieu: loc.IdLieu } })
  )
);
// Résultat: 1 query pour locations + 24 queries en parallèle = rapide
```

## 🔄 Flux de données

```
User scrolls to bottom
         ↓
Intersection Observer détecte (rootMargin: 200px)
         ↓
loadMore() appelé
         ↓
usePaginatedSensors.fetchNextPage()
         ↓
API: GET /api/sensors/paginated?offset=24&limit=24
         ↓
Prisma filtre + pagine à la DB level
         ↓
Récupère les mesures en parallèle (cache hit probable)
         ↓
Retour: 24 nouveaux sensors
         ↓
React Query fusion les pages
         ↓
useVirtualizedPagination affiche le nouveau batch
         ↓
UI se met à jour (animation loader → cards)
```

## 🚀 Performance attendue

### Avec 764 capteurs

| Métrique | Avant | Après |
|----------|-------|-------|
| **Time to First Paint** | 35s | 0.5s |
| **Time to Interactive** | 40s | 0.5s |
| **Initial DB Queries** | 95,500 | ~24 |
| **Concurrent Connections** | 95,500 | ~24 |
| **Memory Usage** | ~500MB | ~50MB |
| **CPU Usage** | 95% | 15% |

### Avec cache existant
- Premier chargement: **0.5s** (cache miss)
- Deuxième chargement: **0.1s** (cache hit avec TTL 15 min)
- Scroll supplémentaire: **0.3s** par batch

## 📝 Intégration dans `surveillance-client.tsx`

```typescript
export function SurveillancePageClient({ stats }: Props) {
  const [filters, setFilters] = useState<FilterState>({
    siteId: null,
    groupIds: []
  });

  return (
    <>
      <SurveillanceFilters onFilterChange={setFilters} />
      
      {/* ANCIEN CODE - à remplacer */}
      {/* <MonitoringCardsGrid sensors={sensors} /> */}
      
      {/* NOUVEAU CODE */}
      <SensorsGridWithVirtualization
        siteId={filters.siteId}
        groupIds={filters.groupIds}
      >
        {(sensor) => (
          <MonitoringCard
            idLieu={sensor.location.id.toString()}
            NomLieu={sensor.location.name}
            SondeNumeroSerie={sensor.sonde?.numeroSerie}
          />
        )}
      </SensorsGridWithVirtualization>
    </>
  );
}
```

## 🎨 Customisation

### Ajuster le nombre de cards initiales

```typescript
// Dans useVirtualizedPagination:
const visibleCount = colCount * rowCount;

// Ajouter un buffer supplémentaire:
return Math.min(visibleCount + (colCount * 2), totalItems); // +2 rangées
```

### Ajuster le déclenchement du scroll

```typescript
// Dans useVirtualizedPagination:
const observerOptions = {
  rootMargin: "200px"  // Charger à 200px du viewport
  // Réduire pour charger plus tard: "100px"
  // Augmenter pour charger plus tôt: "500px"
};
```

### Ajuster la taille des batches

```typescript
// Dans usePaginatedSensors:
limit = 8   // Petit batch = moins de latence, plus de requêtes
limit = 24  // Moyen = équilibre
limit = 50  // Grand batch = moins de requêtes, plus de latence
```

## 🧪 Tests

```typescript
// Test: Vérifier le calcul responsif
import { useVirtualizedPagination } from '@/hooks/use-virtualized-pagination';

test('calcule le bon nombre de cards', () => {
  window.innerWidth = 1280; // xl breakpoint
  const { visibleCount } = useVirtualizedPagination({ totalItems: 764 });
  expect(visibleCount).toBeGreaterThanOrEqual(8);
  expect(visibleCount).toBeLessThanOrEqual(12);
});

// Test: Intersection Observer
test('charge plus en scrollant', () => {
  const { loadMoreRef, loadMore } = useVirtualizedPagination({ totalItems: 764 });
  // Simuler intersection
  simulateIntersection(loadMoreRef.current);
  expect(loadMore).toHaveBeenCalled();
});
```

## 📊 Monitoring

Ajouter des métriques pour tracker la performance:

```typescript
// Dans SensorsGridWithVirtualization
const onLoadMore = () => {
  const start = performance.now();
  loadMore();
  // Tracker le temps dans Sentry/Analytics
};
```

## ⚠️ Limitations

1. **Pas de "sauter à l'index"**: L'utilisateur doit scroller pour charger les données intermédiaires
2. **Ordre fixe**: Les sensors ne peuvent pas être réordonnés sans rechargement
3. **Filtres**: Changer les filtres recharge tout (comportement normal avec React Query)

## 🔗 Ressources

- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [React Query Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries)
- [Tailwind Responsive Design](https://tailwindcss.com/docs/responsive-design)

## ✅ Checklist d'implémentation

- [ ] Créer les hooks dans `/src/hooks/`
- [ ] Créer l'API route `/api/sensors/paginated`
- [ ] Créer le composant `SensorsGridWithVirtualization`
- [ ] Remplacer l'utilisation dans `surveillance-client.tsx`
- [ ] Tester sur mobile/tablet/desktop
- [ ] Vérifier les requêtes DB en profiler
- [ ] Monitorer les performances en production
