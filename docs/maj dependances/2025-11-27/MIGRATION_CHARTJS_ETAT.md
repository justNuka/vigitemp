# Migration Recharts → Chart.js - État d'avancement

**Date :** 27 novembre 2025  
**Objectif :** Remplacer complètement Recharts par Chart.js pour améliorer les performances et la maintenabilité

---

## ✅ Terminé

### 1. Configuration Chart.js
- ✅ Fichier `libs/chartjs-config.ts` créé
- ✅ Enregistrement plugins (annotation, scales, etc.)
- ✅ Fonctions helper `getDefaultMonitoringOptions()` et `getFullScreenOptions()`
- ✅ Configuration tooltips personnalisés
- ✅ Support des lignes de référence (consignes)

### 2. Migration composant principal
- ✅ `monitoring-graph.tsx` migré vers Chart.js
  - Graphique Area avec gradient
  - Lignes de référence (consignes haute/basse)
  - Tooltip personnalisé affichant heure + valeur
  - Gestion axes X/Y avec formatage dates
  - Labels intelligents (évite doublons "00/00")

### 3. Imports mis à jour
- ✅ Remplacement imports Recharts par `react-chartjs-2` dans 6 fichiers :
  - `monitoring-graph.tsx`
  - `monitoring-graph-fullScreen.tsx`
  - `monitoring-graph-fullScreen-eventHighlight.tsx`
  - `monitoring-graph-fullScreen-eventHighlight copy.tsx`
  - `monitoring-graph-fullScreen-zoom-refine.tsx`
  - `monitoring-graph-fullScreen-zoom-refine_cleanUp.tsx`

---

## 🚧 En cours / À terminer

### 1. Migration graphiques fullScreen

Les 5 fichiers fullScreen nécessitent une attention particulière car ils implémentent :
- **Zoom interactif** (sélection zone avec refAreaLeft/refAreaRight)
- **Gestion événements** (historique alarmes affichées sur graph)
- **Échantillonnage données** (>1000 points)
- **State complexe** (zoomState avec data, left, right, refAreaLeft, refAreaRight)

#### Approche recommandée

**Option A : Utiliser chartjs-plugin-zoom**
```typescript
npm install chartjs-plugin-zoom

// Dans chartjs-config.ts
import zoomPlugin from 'chartjs-plugin-zoom';
ChartJS.register(zoomPlugin);

// Configuration
options: {
  plugins: {
    zoom: {
      pan: {
        enabled: true,
        mode: 'x',
      },
      zoom: {
        wheel: {
          enabled: true,
        },
        pinch: {
          enabled: true,
        },
        mode: 'x',
      },
    },
  },
}
```

**Option B : Implémenter zoom manuel**
```typescript
// Utiliser onMouseDown, onMouseMove, onMouseUp sur canvas
const handleMouseDown = (event: MouseEvent) => {
  const chart = chartRef.current;
  if (!chart) return;
  
  const canvasPosition = getRelativePosition(event, chart);
  const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
  
  setZoomStart(dataX);
};

const handleMouseUp = (event: MouseEvent) => {
  const chart = chartRef.current;
  if (!chart) return;
  
  const canvasPosition = getRelativePosition(event, chart);
  const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
  
  // Filtrer data entre zoomStart et dataX
  const newData = data.filter(d => 
    new Date(d.DateHeureMesure) >= zoomStart && 
    new Date(d.DateHeureMesure) <= dataX
  );
  
  setData(newData);
};
```

#### Zones de référence (événements)

Pour afficher les zones d'alarmes (équivalent `<ReferenceArea>`) :

```typescript
plugins: {
  annotation: {
    annotations: eventHistory.map((event, index) => ({
      type: 'box',
      xMin: new Date(event.startDate).getTime(),
      xMax: new Date(event.endDate).getTime(),
      backgroundColor: 'rgba(255, 0, 0, 0.1)',
      borderColor: 'rgba(255, 0, 0, 0.5)',
      borderWidth: 1,
      label: {
        display: true,
        content: event.alert,
        position: 'start',
      },
    })),
  },
}
```

---

## 📋 Checklist détaillée

### Fichier : `monitoring-graph-fullScreen.tsx`

**État actuel :**
- Import Chart.js ✅
- Logique fetchData ✅ (pas de changement)
- Logique zoomState ❌ (à adapter)
- Logique updateXaxisLabels ❌ (à adapter ou supprimer si géré par Chart.js)
- Render ResponsiveContainer + AreaChart ❌ (à remplacer par `<Line>`)

**Modifications nécessaires :**

1. **Ajouter ref pour Chart.js**
```typescript
const chartRef = useRef<any>(null);
```

2. **Créer chartData structure**
```typescript
const chartData = {
  labels: zoomState.data.map(d => d.DateHeureMesure),
  datasets: [
    {
      label: 'Température',
      data: zoomState.data.map(d => d.Valeur),
      borderColor: '#FFBD50',
      backgroundColor: (context: any) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, context.chart.height);
        gradient.addColorStop(0, 'rgba(255, 189, 80, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 189, 80, 0)');
        return gradient;
      },
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    },
  ],
};
```

3. **Créer chartOptions**
```typescript
const chartOptions = getFullScreenOptions(
  unite,
  YaxisMin,
  YaxisMax,
  consigneInf,
  consigneSup
);
```

4. **Remplacer le JSX**
```typescript
// Avant (Recharts)
<ResponsiveContainer>
  <AreaChart data={zoomState.data}>
    <XAxis dataKey="DateHeureMesure" />
    <YAxis domain={[YaxisMin, YaxisMax]} />
    <Area dataKey="Valeur" />
    <ReferenceLine y={consigneInf} />
    <ReferenceLine y={consigneSup} />
  </AreaChart>
</ResponsiveContainer>

// Après (Chart.js)
<div className="w-full h-full">
  <Line ref={chartRef} data={chartData} options={chartOptions} />
</div>
```

5. **Gérer le zoom** (Option simplifiée sans plugin)
```typescript
// Dans chartOptions
options: {
  ...chartOptions,
  onClick: (event, elements) => {
    if (elements.length > 0) {
      const dataIndex = elements[0].index;
      const clickedDate = data[dataIndex].DateHeureMesure;
      // Gérer la logique de zoom
    }
  },
}
```

**OU** utiliser le plugin zoom (recommandé) :
```bash
npm install chartjs-plugin-zoom
```

```typescript
import zoomPlugin from 'chartjs-plugin-zoom';
ChartJS.register(zoomPlugin);

// Dans chartOptions
plugins: {
  zoom: {
    limits: {
      x: { min: 'original', max: 'original' },
      y: { min: 'original', max: 'original' },
    },
    pan: {
      enabled: true,
      mode: 'x',
      modifierKey: 'shift',
    },
    zoom: {
      wheel: {
        enabled: true,
      },
      drag: {
        enabled: true,
        backgroundColor: 'rgba(255, 189, 80, 0.2)',
      },
      pinch: {
        enabled: true,
      },
      mode: 'x',
    },
  },
}
```

---

### Fichiers : `monitoring-graph-fullScreen-eventHighlight*.tsx`

**Spécificité :** Affichent des zones colorées pour les événements (alarmes)

**Modification supplémentaire :**

```typescript
// Ajouter dans chartOptions.plugins.annotation
annotations: {
  ...consignesAnnotations, // consignes haute/basse
  ...eventHistory.map((event, index) => ({
    [`event-${index}`]: {
      type: 'box',
      xMin: event.startDate,
      xMax: event.endDate,
      backgroundColor: event.alert === 'HAUTE' 
        ? 'rgba(255, 0, 0, 0.1)' 
        : 'rgba(0, 0, 255, 0.1)',
      borderColor: event.alert === 'HAUTE'
        ? 'rgba(255, 0, 0, 0.5)'
        : 'rgba(0, 0, 255, 0.5)',
      borderWidth: 1,
      label: {
        display: true,
        content: event.alert,
        position: 'center',
      },
    },
  })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
}
```

---

### Fichiers : `monitoring-graph-fullScreen-zoom-refine*.tsx`

**Spécificité :** Zoom avec raffinement (sélection précise zone)

**Recommandation :** Utiliser `chartjs-plugin-zoom` avec mode drag

```typescript
zoom: {
  drag: {
    enabled: true,
    backgroundColor: 'rgba(255, 189, 80, 0.2)',
    borderColor: 'rgba(255, 189, 80, 0.8)',
    borderWidth: 2,
  },
  mode: 'x',
  onZoomComplete: ({ chart }) => {
    const xScale = chart.scales.x;
    const startIndex = xScale.min;
    const endIndex = xScale.max;
    
    // Mettre à jour les données affichées
    const newData = data.slice(startIndex, endIndex + 1);
    setZoomState(prev => ({
      ...prev,
      data: newData,
    }));
  },
}
```

---

## 🔧 Fonctionnalités avancées à implémenter

### 1. Bouton Reset Zoom

```typescript
const handleResetZoom = () => {
  if (chartRef.current) {
    chartRef.current.resetZoom();
  }
};

// Dans le JSX
<Button onClick={handleResetZoom}>
  Reset Zoom
</Button>
```

### 2. Échantillonnage intelligent (>1000 points)

Chart.js gère mieux les gros datasets que Recharts, mais on peut optimiser :

```typescript
// Option A : Decimation plugin (intégré)
options: {
  plugins: {
    decimation: {
      enabled: true,
      algorithm: 'lttb', // Largest Triangle Three Buckets
      samples: 1000,
    },
  },
}

// Option B : Échantillonnage manuel (déjà fait dans le code actuel)
// Garder la logique existante qui fonctionne bien
```

### 3. Animations conditionnelles

```typescript
const [isAnimated, setIsAnimated] = useState(true);

options: {
  animation: {
    duration: isAnimated ? 750 : 0,
  },
}

// Désactiver lors du zoom pour fluidité
const handleZoomStart = () => setIsAnimated(false);
const handleZoomComplete = () => setIsAnimated(true);
```

---

## 📦 Dépendances finales

```json
{
  "dependencies": {
    "chart.js": "^4.4.3",
    "react-chartjs-2": "^5.3.1",
    "chartjs-plugin-annotation": "^3.0.1",
    "chartjs-plugin-zoom": "^2.0.1"
  }
}
```

**Installation :**
```bash
npm install chartjs-plugin-zoom@2.0.1
```

---

## 🧹 Nettoyage final

### 1. Supprimer Recharts

```bash
npm uninstall recharts
```

### 2. Supprimer fichier obsolète

```bash
rm src/app/components/customTooltipGraph.tsx
```

### 3. Supprimer autres fichiers Recharts custom

Vérifier s'il existe :
- `customActiveDotGraph.tsx` → Remplacer par plugin Chart.js
- Autres composants custom Recharts

---

## 🎯 Résultat attendu

### Avantages Chart.js vs Recharts

| Feature | Recharts | Chart.js |
|---------|----------|----------|
| **Performance** | 🟡 Moyen | 🟢 Excellent |
| **Bundle size** | 🔴 ~450 KB | 🟢 ~200 KB |
| **Gros datasets** | 🔴 Lag >5000 pts | 🟢 Smooth >10000 pts |
| **Plugins** | 🟡 Limités | 🟢 Riches (zoom, annotation, etc.) |
| **Documentation** | 🟡 Bonne | 🟢 Excellente |
| **Maintenance** | 🟢 Active | 🟢 Très active |
| **Customisation** | 🟢 Facile (React) | 🟡 Moyenne (impératif) |

### Gains attendus

- ⚡ **30-40% plus rapide** sur affichage graphiques
- 📦 **~250 KB économisés** (bundle size)
- 🔍 **Zoom fluide** avec plugin dédié
- 🎨 **Annotations riches** (boxes, lignes, points)
- 📱 **Touch gestures** (pinch zoom mobile)

---

## 📝 Prochaines étapes

1. ✅ Configuration de base Chart.js
2. ✅ Migration `monitoring-graph.tsx`
3. ✅ Mise à jour imports 5 fichiers fullScreen
4. ⏳ **Installer chartjs-plugin-zoom**
5. ⏳ **Migrer JSX des 5 fichiers fullScreen**
6. ⏳ **Tester zoom interactif**
7. ⏳ **Tester affichage événements**
8. ⏳ **Supprimer Recharts**
9. ⏳ **Tests complets et validation**
10. ⏳ **Documentation utilisateur**

---

**Prochaine action recommandée :**

```bash
# Installer le plugin zoom
npm install chartjs-plugin-zoom@2.0.1

# Puis migrer un fichier fullScreen en test
# Commencer par monitoring-graph-fullScreen.tsx (le plus simple)
```

---

**Créé le 27 novembre 2025**
