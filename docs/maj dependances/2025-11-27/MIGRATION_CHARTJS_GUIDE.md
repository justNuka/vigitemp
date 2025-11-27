# 📊 Guide de Migration : Recharts → Chart.js

**Date :** 27 novembre 2025  
**Status :** 📝 En attente  
**Priorité :** Haute (après tests Sonner et Lucide)

---

## ⚠️ IMPORTANT

Cette migration est **complexe et nécessite une refonte complète** des composants graphiques. Les API de Recharts et Chart.js sont fondamentalement différentes :

- **Recharts** : Approche déclarative avec composants React
- **Chart.js** : Approche impérative avec configuration d'objet

**Temps estimé :** 12-16 heures de travail

---

## 📋 Fichiers concernés

### Composants graphiques à migrer (7 fichiers)

1. `src/app/components/monitoring-graph.tsx` ⭐ Principal
2. `src/app/components/monitoring-graph-fullScreen.tsx`
3. `src/app/components/monitoring-graph-fullScreen-zoom-refine.tsx`
4. `src/app/components/monitoring-graph-fullScreen-eventHighlight.tsx`
5. `src/app/components/monitoring-graph-fullScreen-zoom-refine_cleanUp.tsx`
6. `src/app/components/monitoring-graph-fullScreen-eventHighlight copy.tsx`
7. `src/app/components/customTooltipGraph.tsx` (tooltip personnalisé)

### Note importante
Recharts a été **temporairement réinstallé** pour maintenir le projet fonctionnel pendant la migration progressive.

---

## 🎯 Stratégie de migration recommandée

### Phase 1 : Préparation (1-2h)
1. Créer un nouveau composant `monitoring-graph-chartjs.tsx` (test)
2. Implémenter Chart.js pour un graphique simple
3. Tester et valider l'approche

### Phase 2 : Migration progressive (8-10h)
1. Migrer `monitoring-graph.tsx` (composant principal)
2. Tester intensivement sur plusieurs lieux
3. Migrer les composants fullScreen un par un
4. Adapter le tooltip personnalisé

### Phase 3 : Finalisation (2-3h)
1. Supprimer les anciens fichiers Recharts
2. Désinstaller `recharts`
3. Tests complets
4. Optimisations

---

## 📦 Packages nécessaires

### Déjà installés ✅
```json
"chart.js": "^4.4.3",
"chartjs-plugin-annotation": "^3.0.1",
"react-chartjs-2": "^5.3.1"
```

### Installation supplémentaire recommandée
```bash
cd "c:\Vigitemp project\vigitemp\website"
npm install chartjs-adapter-date-fns date-fns --legacy-peer-deps
# Pour les échelles de temps
```

---

## 🔄 Comparaison des APIs

### Structure de base

#### Recharts (Ancien)
```tsx
<ResponsiveContainer width="100%" height="100%">
  <AreaChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="DateHeureMesureXaxis" />
    <YAxis domain={[YaxisMin, YaxisMax]} />
    <Tooltip content={<CustomTooltip />} />
    <ReferenceLine y={consigneSup} stroke="red" />
    <ReferenceLine y={consigneInf} stroke="blue" />
    <Area 
      type="monotone" 
      dataKey="Valeur" 
      stroke="#8884d8" 
      fill="#8884d8" 
    />
  </AreaChart>
</ResponsiveContainer>
```

#### Chart.js (Nouveau)
```tsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

// Enregistrer les composants
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
  annotationPlugin
);

// Configuration des données
const chartData = {
  labels: data.map(d => d.DateHeureMesureXaxis),
  datasets: [
    {
      label: 'Température',
      data: data.map(d => d.Valeur),
      borderColor: '#8884d8',
      backgroundColor: 'rgba(136, 132, 216, 0.2)',
      fill: true,
      tension: 0.4 // Pour courbe lisse (équivalent "monotone")
    }
  ]
};

// Configuration des options
const options = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      min: YaxisMin,
      max: YaxisMax,
      ticks: {
        callback: (value: number) => value + unite
      }
    },
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45
      }
    }
  },
  plugins: {
    annotation: {
      annotations: {
        consigneHaute: {
          type: 'line',
          yMin: consigneSup,
          yMax: consigneSup,
          borderColor: 'red',
          borderWidth: 2,
          borderDash: [5, 5]
        },
        consigneBasse: {
          type: 'line',
          yMin: consigneInf,
          yMax: consigneInf,
          borderColor: 'blue',
          borderWidth: 2,
          borderDash: [5, 5]
        }
      }
    },
    tooltip: {
      enabled: true,
      callbacks: {
        // Équivalent CustomTooltip
        title: (context: any) => {
          return context[0].label;
        },
        label: (context: any) => {
          return `${context.parsed.y}${unite}`;
        }
      }
    }
  }
};

// Rendu
<div style={{ height: '400px' }}>
  <Line data={chartData} options={options} />
</div>
```

---

## 🎨 Fonctionnalités à implémenter

### 1. Reference Lines (Consignes)
**Recharts :**
```tsx
<ReferenceLine y={consigneSup} stroke="red" strokeDasharray="3 3" />
```

**Chart.js :**
```tsx
options.plugins.annotation.annotations = {
  consigneHaute: {
    type: 'line',
    yMin: consigneSup,
    yMax: consigneSup,
    borderColor: 'red',
    borderWidth: 2,
    borderDash: [5, 5],
    label: {
      display: true,
      content: 'Consigne Haute'
    }
  }
}
```

### 2. Reference Areas (Zones)
**Recharts :**
```tsx
<ReferenceArea x1={x1} x2={x2} fill="red" fillOpacity={0.3} />
```

**Chart.js :**
```tsx
options.plugins.annotation.annotations = {
  zone1: {
    type: 'box',
    xMin: x1,
    xMax: x2,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    borderColor: 'rgba(255, 0, 0, 0.3)',
    borderWidth: 1
  }
}
```

### 3. Zoom et Pan
**Chart.js nécessite le plugin zoom :**
```bash
npm install chartjs-plugin-zoom --legacy-peer-deps
```

```tsx
import zoomPlugin from 'chartjs-plugin-zoom';
ChartJS.register(zoomPlugin);

options.plugins.zoom = {
  zoom: {
    wheel: {
      enabled: true
    },
    pinch: {
      enabled: true
    },
    mode: 'xy'
  },
  pan: {
    enabled: true,
    mode: 'xy'
  }
}
```

### 4. Tooltip personnalisé
**Recharts :**
```tsx
<Tooltip content={<CustomTooltip />} />
```

**Chart.js :**
```tsx
options.plugins.tooltip = {
  enabled: true,
  external: function(context) {
    // Créer un tooltip HTML personnalisé
    // Plus complexe mais plus flexible
  },
  // OU callbacks pour personnaliser le tooltip natif
  callbacks: {
    title: (tooltipItems) => {
      // Formater le titre
    },
    label: (tooltipItem) => {
      // Formater les labels
    },
    footer: (tooltipItems) => {
      // Ajouter un footer
    }
  }
}
```

---

## 📝 Template de composant Chart.js

### Fichier : `monitoring-graph-chartjs.tsx` (nouveau)

```tsx
'use client'
import React, { useEffect, useState, useRef } from "react";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
  ChartData
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import axios from "axios";

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

interface DataPoint {
  Valeur: number;
  Unite: string;
  DateHeureMesure: string;
  DateHeureMesureXaxis: string;
  Consigne_Sup: number;
  Consigne_Inf: number;
}

interface MonitoringGraphProps {
  idLieu: string;
  NomLieu: string;
}

export default function MonitoringGraphChartJS({ 
  idLieu, 
  NomLieu 
}: MonitoringGraphProps) {
  const [data, setData] = useState<DataPoint[]>([]);
  const [isDataLoaded, setDataLoaded] = useState(false);
  const [consigneSup, setConsigneSup] = useState<number>(0);
  const [consigneInf, setConsigneInf] = useState<number>(0);
  const [unite, setUnite] = useState<string>("");
  const [YaxisMin, setYaxisMin] = useState<number>(0);
  const [YaxisMax, setYaxisMax] = useState<number>(0);

  // Charger les données
  useEffect(() => {
    axios.get(`/api/mesures/${idLieu}`, {
      params: { rowNumber: 20 }
    })
    .then(response => {
      if (Array.isArray(response.data) && response.data.length > 0) {
        setData(response.data);
        
        // Extraire les consignes
        const firstPoint = response.data[0];
        setConsigneSup(firstPoint.Consigne_Sup);
        setConsigneInf(firstPoint.Consigne_Inf);
        setUnite(firstPoint.Unite);

        // Calculer les limites Y
        const values = response.data.map(d => d.Valeur);
        const minVal = Math.min(...values, firstPoint.Consigne_Inf);
        const maxVal = Math.max(...values, firstPoint.Consigne_Sup);
        const padding = (maxVal - minVal) * 0.1;
        
        setYaxisMin(minVal - padding);
        setYaxisMax(maxVal + padding);
        setDataLoaded(true);
      }
    })
    .catch(error => {
      console.error("Erreur chargement données:", error);
    });
  }, [idLieu]);

  // Configuration des données Chart.js
  const chartData: ChartData<'line'> = {
    labels: data.map(d => d.DateHeureMesureXaxis),
    datasets: [
      {
        label: NomLieu,
        data: data.map(d => d.Valeur),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2
      }
    ]
  };

  // Configuration des options Chart.js
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: YaxisMin,
        max: YaxisMax,
        ticks: {
          callback: (value) => `${value}${unite}`
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          title: (context) => {
            const index = context[0].dataIndex;
            return data[index]?.DateHeureMesure || '';
          },
          label: (context) => {
            return `${context.parsed.y}${unite}`;
          }
        }
      },
      annotation: {
        annotations: {
          consigneHaute: {
            type: 'line',
            yMin: consigneSup,
            yMax: consigneSup,
            borderColor: 'rgba(239, 68, 68, 0.8)',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              display: true,
              content: `Max: ${consigneSup}${unite}`,
              position: 'end'
            }
          },
          consigneBasse: {
            type: 'line',
            yMin: consigneInf,
            yMax: consigneInf,
            borderColor: 'rgba(59, 130, 246, 0.8)',
            borderWidth: 2,
            borderDash: [5, 5],
            label: {
              display: true,
              content: `Min: ${consigneInf}${unite}`,
              position: 'end'
            }
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  if (!isDataLoaded) {
    return (
      <div className="relative bg-white rounded-lg w-full h-[300px] flex items-center justify-center">
        <div className="text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-lg w-full p-4">
      <div className="text-lg font-bold mb-4">{NomLieu}</div>
      <div style={{ height: '300px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}
```

---

## 🧪 Plan de test

### Tests fonctionnels
- [ ] Graphique s'affiche correctement
- [ ] Consignes (lignes rouges/bleues) visibles
- [ ] Tooltip affiche les bonnes valeurs
- [ ] Zoom fonctionne (si implémenté)
- [ ] Responsive (mobile + desktop)
- [ ] Données mises à jour en temps réel

### Tests de régression
- [ ] Aucune perte de fonctionnalité vs Recharts
- [ ] Performance égale ou meilleure
- [ ] UI identique ou améliorée

---

## 📚 Ressources

### Documentation officielle
- Chart.js : https://www.chartjs.org/docs/latest/
- react-chartjs-2 : https://react-chartjs-2.js.org/
- Plugin Annotation : https://www.chartjs.org/chartjs-plugin-annotation/latest/
- Plugin Zoom : https://www.chartjs.org/chartjs-plugin-zoom/latest/

### Exemples
- Exemples Chart.js : https://www.chartjs.org/docs/latest/samples/
- Codesandbox demos : Rechercher "react-chartjs-2"

---

## ⚠️ Points d'attention

### Différences importantes

1. **État du graphique**
   - Recharts : État géré par React
   - Chart.js : État interne du canvas, nécessite `ref` pour manipuler

2. **Animations**
   - Recharts : Animations React
   - Chart.js : Animations canvas natives (plus performantes)

3. **Tooltip personnalisé**
   - Recharts : Composant React
   - Chart.js : Callbacks ou HTML externe (plus complexe)

4. **Zoom**
   - Recharts : Composant `<Brush>`
   - Chart.js : Plugin zoom (installation requise)

5. **TypeScript**
   - Chart.js a un excellent support TypeScript
   - Typer correctement `ChartData` et `ChartOptions`

---

## 🎯 Prochaines étapes

1. ✅ Lire ce guide
2. ⬜ Créer un composant test `monitoring-graph-chartjs.tsx`
3. ⬜ Implémenter une version simple
4. ⬜ Tester et valider
5. ⬜ Migrer progressivement les autres composants
6. ⬜ Supprimer Recharts une fois tout migré

---

## 💡 Conseils

- **Ne pas tout migrer d'un coup** : Faire un composant à la fois
- **Utiliser TypeScript** : Les types Chart.js sont excellents
- **Tester régulièrement** : Vérifier après chaque composant migré
- **Garder Recharts** temporairement : Pour pouvoir comparer
- **Demander de l'aide** : La communauté Chart.js est très active

---

**Bon courage pour la migration ! 🚀**

Cette migration améliorera les performances et la maintenabilité du projet.
