# Plan de Modernisation - Vigitemp Website

**Date:** 26 novembre 2025  
**Version actuelle:** Next.js 15.1.0, React 19.0.0

---

## 📊 Analyse de l'existant

### Utilisation actuelle des dépendances

| Package | Utilisation | Impact suppression |
|---------|-------------|-------------------|
| `dotenv` | ❌ Non utilisé (commenté) | ✅ Aucun |
| `react-dotenv` | ❌ Non utilisé | ✅ Aucun |
| `next-view-transitions` | ✅ Utilisé (5 fichiers) | ⚠️ Migration nécessaire |
| `os` | ❌ Non utilisé (commenté) | ✅ Aucun |
| `react-webp-image` | ❌ Non trouvé | ✅ Aucun |
| `embla-carousel-react` | ❌ Non trouvé | ✅ Aucun (ou à vérifier) |
| `mysql2` | ✅ Utilisé (mysql.tsx) | ⚠️ Migration nécessaire |
| `react-hot-toast` | ✅ Utilisé (layout, vigilog-settings) | ⚠️ Migration nécessaire |
| `react-icons` | ✅ Très utilisé (20+ fichiers) | ⚠️ Migration nécessaire |
| `chart.js` | ⚠️ Utilisé (commenté dans demo) | ℹ️ À clarifier |
| `recharts` | ❌ Non trouvé | ⚠️ À vérifier |

---

## 🎯 Recommandations par priorité

### 🟢 PRIORITÉ 1 - Suppressions immédiates (SANS RISQUE)

Ces packages peuvent être supprimés **immédiatement** car ils ne sont pas utilisés :

```bash
npm uninstall dotenv react-dotenv os react-webp-image
```

**Justification :**
- ✅ `dotenv` : Next.js gère nativement les `.env` via `process.env`
- ✅ `react-dotenv` : Redondant avec Next.js
- ✅ `os` : Module Node.js built-in, pas besoin du package npm
- ✅ `react-webp-image` : `next/image` gère WebP nativement

**Impact backend C# :** Aucun

---

### 🟡 PRIORITÉ 2 - Mises à jour de sécurité (RECOMMANDÉ)

```bash
npm update --save
```

Packages à mettre à jour en priorité :
- `axios`: 1.7.7 → 1.13.2
- `@heroui/react`: 2.7.5 → 2.8.5
- `chart.js`: 4.4.5 → 4.5.1
- `typescript`: 5.6.3 → 5.9.3
- `mysql2`: 3.11.3 → 3.15.3

**Impact backend C# :** Aucun

---

### 🟠 PRIORITÉ 3 - Migrations majeures (À PLANIFIER)

#### 1️⃣ Next.js 15 → 16 + Migration View Transitions

**⚠️ ACTION REQUISE :** Next.js 16 supporte nativement View Transitions !

**Fichiers à migrer :**
- `src/app/layout.tsx` (ViewTransitions wrapper)
- `src/app/surveillance/[idLieu]/page.tsx` (useTransitionRouter)
- `src/app/components/monitoring-graph.tsx` (useTransitionRouter)
- `src/app/components/sideBarMetrology.tsx` (Link, useTransitionRouter)
- `src/app/components/header-gradient.tsx` (useTransitionRouter)

**Migration :**
```bash
# 1. Mettre à jour Next.js
npm install next@latest --legacy-peer-deps

# 2. Supprimer next-view-transitions
npm uninstall next-view-transitions
```

**Changements de code :**
```tsx
// AVANT
import { ViewTransitions } from "next-view-transitions";
import { Link, useTransitionRouter } from "next-view-transitions";

// APRÈS (Next.js 16 natif)
import Link from "next/link";
import { useRouter } from "next/navigation";
```

**Configuration :** Ajouter dans `next.config.mjs` :
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    viewTransitions: true,
  },
};

export default nextConfig;
```

**Impact backend C# :** Aucun  
**Risque :** ⚠️ Moyen - Tests requis  
**Bénéfice :** 🎉 Support natif, meilleure performance

---

#### 2️⃣ MySQL2 → Prisma

**✅ RECOMMANDATION : Prisma**

**Pourquoi Prisma > Drizzle :**
| Critère | Prisma | Drizzle |
|---------|--------|---------|
| TypeScript natif | ✅ Excellent | ✅ Bon |
| Migrations | ✅ Auto-générées | ⚠️ Manuelles |
| Studio GUI | ✅ Prisma Studio | ❌ Non |
| Documentation | ✅ Excellente | ⚠️ Moyenne |
| Communauté | ✅ Très large | ⚠️ Petite |
| Performance | ⚠️ Bonne | ✅ Excellente |
| **CRITIQUE :** Backend C# | ⚠️ **Schéma indépendant** | ⚠️ **Schéma indépendant** |

**⚠️ ATTENTION BACKEND C# :**
Vous avez deux serveurs C# qui utilisent la même base de données. Prisma génère son propre schéma mais **peut travailler avec un schéma existant**.

**Plan de migration :**

```bash
# 1. Installer Prisma
npm install @prisma/client
npm install -D prisma

# 2. Initialiser Prisma
npx prisma init

# 3. Importer le schéma existant (IMPORTANT!)
npx prisma db pull
```

**Configuration `.env` :**
```env
DATABASE_URL="mysql://user:password@host:3306/vigitemp"
DATABASE_URL_MESURE="mysql://user:password@host:3306/vigitemp_mesure"
```

**Avantages :**
- ✅ Type-safety complet
- ✅ Pas de SQL brut
- ✅ Migrations trackées
- ✅ Prisma Studio pour debug
- ✅ Compatible avec schéma C# existant

**Inconvénients :**
- ⚠️ Migration initiale ~4-8h
- ⚠️ Courbe d'apprentissage
- ⚠️ Coordination avec backend C#

**Impact backend C# :** ⚠️ **Aucun SI** vous utilisez `prisma db pull` (recommandé)  
**Risque :** ⚠️ Moyen  
**Bénéfice :** 🎉 Type-safety, maintenabilité

---

#### 3️⃣ Embla Carousel → Swiper

**✅ RECOMMANDATION : Swiper**

**Pourquoi Swiper :**
- ✅ Plus mature (depuis 2014)
- ✅ Meilleure documentation
- ✅ Plus de fonctionnalités (parallax, effet 3D, etc.)
- ✅ Touch gestures supérieurs
- ✅ Accessibilité meilleure

**⚠️ ATTENTION :** Je n'ai **pas trouvé** d'utilisation d'Embla dans le code.

**Vérification requise :**
```bash
# Chercher manuellement
grep -r "embla" src/
```

**Si utilisé, migration :**
```bash
npm uninstall embla-carousel-react
npm install swiper
```

**Impact backend C# :** Aucun  
**Risque :** ⚠️ Faible-Moyen (selon usage)

---

#### 4️⃣ React-hot-toast → Sonner

**🤔 AVIS PARTAGÉ**

| Critère | react-hot-toast | Sonner |
|---------|----------------|--------|
| Bundle size | 3.5kb | 3.8kb |
| Performance | ✅ Excellente | ✅ Excellente |
| API | ✅ Simple | ✅ Moderne |
| Animations | ⚠️ Basiques | ✅ Fluides |
| Accessibilité | ✅ Bonne | ✅ Meilleure |
| Maintenance | ✅ Active | ✅ Active |
| Next.js RSC | ⚠️ Compatible | ✅ Optimisé |

**✅ RECOMMANDATION : Migrer vers Sonner**

**Raisons :**
- ✅ Meilleure intégration React Server Components
- ✅ Animations plus modernes
- ✅ API plus flexible
- ⚠️ Migration facile (~30min)

**Fichiers à modifier :**
- `src/app/layout.tsx`
- `src/app/components/vigilog-settings.tsx`

**Migration :**
```bash
npm uninstall react-hot-toast
npm install sonner
```

```tsx
// AVANT
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

// APRÈS
import { Toaster } from "sonner";
import { toast } from "sonner";

// API identique !
toast.error("Message");
toast.success("Message");
```

**Impact backend C# :** Aucun  
**Risque :** ✅ Très faible  
**Bénéfice :** 🎉 Meilleure UX

---

#### 5️⃣ React-icons → ? (Radix vs Tabler)

**🤔 AVIS : GARDER react-icons**

**Analyse :**

| Package | Taille | Icônes | Tree-shaking | Personnalisation |
|---------|--------|--------|--------------|------------------|
| react-icons | ~2kb/icône | 50,000+ | ✅ Excellent | ⚠️ Limité |
| @radix-ui/icons | ~1.5kb/icône | 300+ | ✅ Excellent | ⚠️ Limité |
| @tabler/icons-react | ~2kb/icône | 4,000+ | ✅ Excellent | ✅ Bon |

**❌ NE PAS MIGRER**

**Raisons :**
- ✅ Vous utilisez **plusieurs packs d'icônes** (io5, fa, rx, tb, pi, cg, ti, hi, go)
- ✅ react-icons = tous ces packs en un
- ✅ Tree-shaking excellent (seules les icônes utilisées sont bundlées)
- ⚠️ Radix : seulement 300 icônes (insuffisant)
- ⚠️ Tabler : style uniforme (perte de variété)

**20+ fichiers utilisent react-icons** - migration = ~4-6h de travail pour **aucun bénéfice**.

**Impact backend C# :** Aucun  
**Risque :** ❌ Élevé pour aucun gain  
**Recommandation :** ✅ **GARDER react-icons**

---

#### 6️⃣ Request-ip → @supercharge/request-ip

**⚠️ ATTENTION :** Package `request-ip` non trouvé dans le code !

**Vérification :**
```bash
grep -r "request-ip\|requestIp\|getClientIp" src/
```

**Si utilisé :**
```bash
npm uninstall request-ip
npm install @supercharge/request-ip
```

```tsx
// AVANT
import requestIp from 'request-ip';
const ip = requestIp.getClientIp(req);

// APRÈS
import { getClientIp } from '@supercharge/request-ip';
const ip = getClientIp(req);
```

**Impact backend C# :** Aucun  
**Risque :** ✅ Très faible

---

#### 7️⃣ Chart.js vs Recharts

**🔍 SITUATION ACTUELLE :**
- Chart.js : Importé mais **commenté** dans `demo/page.tsx`
- Recharts : **Non trouvé** dans le code

**✅ RECOMMANDATION : GARDER Chart.js UNIQUEMENT**

**Raisons :**
| Critère | Chart.js | Recharts |
|---------|----------|----------|
| Performance | ✅ Excellente (Canvas) | ⚠️ Moyenne (SVG) |
| Bundle size | 3.5kb (tree-shaked) | 8-12kb |
| Personnalisation | ✅ Excellente | ⚠️ Limitée |
| TypeScript | ✅ Excellent | ✅ Bon |
| Documentation | ✅ Excellente | ⚠️ Moyenne |
| **Votre cas** | ✅ Déjà intégré | ❌ Non utilisé |

**Actions :**
```bash
# Supprimer recharts
npm uninstall recharts

# Garder Chart.js + plugins
npm install chart.js@latest chartjs-plugin-annotation@latest
```

**Impact backend C# :** Aucun  
**Risque :** ✅ Aucun (recharts non utilisé)  
**Bénéfice :** 🎉 Bundle plus léger

---

#### 8️⃣ NextUI CLI vs HeroUI CLI

**⚠️ ATTENTION : NextUI vs HeroUI**

Vous utilisez `@heroui/react` dans le code mais `nextui-cli` dans les dépendances.

**Clarification :**
- **HeroUI** = Fork de NextUI (maintenance active)
- **NextUI** = Original (projet mère)

**✅ RECOMMANDATION :** Rester cohérent

```bash
# Si vous utilisez HeroUI (recommandé)
npm uninstall nextui-cli
# Pas besoin de CLI pour HeroUI

# OU migrer complètement vers NextUI
npm uninstall @heroui/react
npm install @nextui-org/react
npm install -D @nextui-org/cli
```

**Mon avis :** ✅ **Garder HeroUI** (maintenance + features)

**Impact backend C# :** Aucun  
**Risque :** ⚠️ Moyen si changement complet

---

## 📋 Plan d'action recommandé

### Phase 1 - Nettoyage (30 minutes)
```bash
# Supprimer packages inutilisés
npm uninstall dotenv react-dotenv os react-webp-image recharts

# Mettre à jour packages compatibles
npm update --save --legacy-peer-deps
```

**Fichiers à nettoyer :**
- Supprimer imports de `dotenv` dans `demo/page.tsx`

### Phase 2 - Migrations faciles (2-3 heures)
1. ✅ Migrer `react-hot-toast` → `sonner` (30 min)
2. ✅ Vérifier/supprimer `embla-carousel` (15 min)
3. ✅ Vérifier/migrer `request-ip` (15 min)

### Phase 3 - Next.js 16 + View Transitions (4-6 heures)
1. ⚠️ Mettre à jour Next.js 15 → 16
2. ⚠️ Supprimer `next-view-transitions`
3. ⚠️ Migrer vers View Transitions natives
4. ⚠️ Tests complets

### Phase 4 - Prisma (8-12 heures)
1. ⚠️ Installer Prisma
2. ⚠️ `prisma db pull` (schéma C# existant)
3. ⚠️ Remplacer `mysql.tsx` par Prisma Client
4. ⚠️ Migrer toutes les queries
5. ⚠️ Tests intensifs avec backend C#

---

## ⚠️ POINTS D'ATTENTION BACKEND C#

### 🔴 CRITIQUE

Votre architecture :
```
Vigitemp Agent (C#) ──┐
                       ├─→ MySQL Database
Vigitemp Server (C#) ──┤
                       │
Website (Next.js) ─────┘
```

**Implications :**

1. **Migrations Prisma :**
   - ⚠️ NE PAS utiliser `prisma migrate` sans coordination
   - ✅ Utiliser `prisma db pull` pour importer le schéma C#
   - ✅ Laisser le backend C# gérer les migrations

2. **Changements de schéma :**
   - Les backends C# doivent rester maîtres
   - Prisma = lecture du schéma, pas création

3. **Tests requis :**
   - Vérifier que les 3 systèmes fonctionnent ensemble
   - Tester les transactions concurrentes

---

## 📊 Résumé des recommandations

| Action | Priorité | Impact Backend | Durée | Bénéfice |
|--------|----------|----------------|-------|----------|
| Supprimer dotenv, react-dotenv, os, react-webp-image | 🟢 Haute | Aucun | 15min | Bundle plus léger |
| Update packages compatibles | 🟢 Haute | Aucun | 15min | Sécurité |
| Supprimer recharts | 🟢 Haute | Aucun | 5min | Bundle plus léger |
| Migrer vers Sonner | 🟡 Moyenne | Aucun | 30min | Meilleure UX |
| Next.js 16 + View Transitions natives | 🟡 Moyenne | Aucun | 4-6h | Performance |
| Garder react-icons | ✅ Recommandé | Aucun | 0min | - |
| Migrer vers Prisma | 🔴 Basse* | ⚠️ Tests requis | 8-12h | Type-safety |
| Swiper (si embla utilisé) | 🟡 Moyenne | Aucun | 2-4h | Fonctionnalités |

\* Basse priorité car requiert coordination backend

---

## 🚀 Commandes de mise à jour immédiate

```bash
# Phase 1 - Nettoyage (SAFE)
cd "C:\Vigitemp project\Vigitemp\website"

npm uninstall dotenv react-dotenv os react-webp-image recharts

npm update @heroui/react axios chart.js chartjs-plugin-annotation typescript mysql2 --save --legacy-peer-deps

# Optionnel : nextui-cli
npm uninstall nextui-cli
```

---

## 📝 Notes finales

### ✅ Points positifs
- Stack moderne (Next.js 15, React 19)
- Peu de dette technique
- Bonnes pratiques (TypeScript, modulaire)

### ⚠️ Points d'attention
- Coordination backend C# essentielle
- Tests requis avant chaque migration
- Documentation à maintenir

### 🎯 Priorité absolue
1. Nettoyage (Phase 1) - **FAIRE MAINTENANT**
2. Mises à jour de sécurité - **FAIRE MAINTENANT**
3. Next.js 16 - **FAIRE QUAND STABLE**
4. Prisma - **PLANIFIER AVEC ÉQUIPE C#**
