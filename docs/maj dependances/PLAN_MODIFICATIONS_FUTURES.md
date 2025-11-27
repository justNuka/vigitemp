# 🎯 Plan des Modifications Futures - Vigitemp Website

**Date :** 26 novembre 2025  
**Phase actuelle :** Phase 1 terminée ✅  
**Prochaine phase :** Phase 2 (optionnel)

---

## 📋 Vue d'ensemble

Ce document regroupe toutes les migrations et améliorations **futures** possibles pour le projet Vigitemp Website. Ces modifications sont **optionnelles** et à planifier selon les priorités.

---

## 🟢 Priorité HAUTE - Migration Sonner (Toast)

### Contexte
Remplacer `react-hot-toast` par `sonner` pour une meilleure UX.

### Bénéfices
- ✅ Animations plus fluides
- ✅ Meilleure accessibilité
- ✅ Optimisé pour React Server Components
- ✅ API moderne et flexible
- ✅ Bundle size similaire (~3.8kb)

### Durée estimée
⏱️ **30 minutes**

### Difficulté
⭐ Facile

### Impact Backend C#
✅ **Aucun**

### Instructions détaillées

#### 1. Installation
```bash
cd "C:\Vigitemp project\vigitemp\website"
npm uninstall react-hot-toast --legacy-peer-deps
npm install sonner --legacy-peer-deps
```

#### 2. Modifications de code

**Fichier : `src/app/layout.tsx`**
```tsx
// AVANT
import { Toaster } from "react-hot-toast";

<body>
  <Toaster position="bottom-right" />
  {children}
</body>

// APRÈS
import { Toaster } from "sonner";

<body>
  <Toaster position="bottom-right" richColors />
  {children}
</body>
```

**Fichier : `src/app/components/vigilog-settings.tsx`**
```tsx
// AVANT
import toast from "react-hot-toast";

toast.error("Message d'erreur", {
    duration: 4000,
});

// APRÈS
import { toast } from "sonner";

// L'API est identique !
toast.error("Message d'erreur", {
    duration: 4000,
});
```

#### 3. Tests
```bash
npm run dev
# Tester les toasts dans l'interface
# Vérifier les animations
# Tester sur mobile
```

#### 4. Checklist
- [ ] `npm install sonner` réussi
- [ ] `layout.tsx` modifié
- [ ] `vigilog-settings.tsx` modifié
- [ ] Toasts s'affichent correctement
- [ ] Animations fluides
- [ ] Aucune erreur console

---

## 🟡 Priorité MOYENNE - Next.js 16 + View Transitions Natives

### ⚠️ NOTE
Next.js 15 est la version stable actuelle (15.1.0). Next.js 16 n'est pas encore sorti.

### Contexte
Une future version de Next.js pourrait supporter nativement les View Transitions, permettant de supprimer `next-view-transitions`.

### Bénéfices
- ✅ Support natif = meilleures performances
- ✅ Une dépendance en moins
- ✅ API standard Web Platform
- ✅ Maintenance simplifiée

### Durée estimée
⏱️ **4-6 heures**

### Difficulté
⭐⭐⭐ Moyen-Difficile

### Impact Backend C#
✅ **Aucun**

### Quand faire cette migration ?
➡️ **Attendre l'annonce officielle du support natif des View Transitions** dans une future version de Next.js

### Instructions détaillées

#### 1. Vérification de la disponibilité
```bash
npm info next version
# Vérifier les notes de version pour le support des View Transitions
```

#### 2. Mise à jour
```bash
cd "C:\Vigitemp project\vigitemp\website"
npm install next@latest react@latest react-dom@latest --legacy-peer-deps
npm uninstall next-view-transitions --legacy-peer-deps
```

#### 3. Configuration `next.config.mjs`
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    viewTransitions: true, // ⬅️ Activer View Transitions natives
  },
  images: {
    remotePatterns: [
      {
        hostname: "media.geeksforgeeks.org",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
};

export default nextConfig;
```

#### 4. Migrations de code (5 fichiers)

**Fichier : `src/app/layout.tsx`**
```tsx
// AVANT
import { ViewTransitions } from "next-view-transitions";

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <ViewTransitions>
        <body>
          {children}
        </body>
      </ViewTransitions>
    </html>
  );
}

// APRÈS
export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}
// ViewTransitions wrapper n'est plus nécessaire !
```

**Fichier : `src/app/surveillance/[idLieu]/page.tsx`**
```tsx
// AVANT
import { useTransitionRouter } from "next-view-transitions";

export default function Page() {
  const router = useTransitionRouter();
  
  const handleClick = () => {
    router.push('/autre-page');
  };
  
  return <div onClick={handleClick}>...</div>;
}

// APRÈS
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  
  const handleClick = () => {
    router.push('/autre-page');
  };
  
  return <div onClick={handleClick}>...</div>;
}
```

**Fichier : `src/app/components/monitoring-graph.tsx`**
```tsx
// AVANT
import { useTransitionRouter } from "next-view-transitions";

// APRÈS
import { useRouter } from "next/navigation";

// Remplacer useTransitionRouter() par useRouter()
```

**Fichier : `src/app/components/sideBarMetrology.tsx`**
```tsx
// AVANT
import { Link, useTransitionRouter } from "next-view-transitions";

// APRÈS
import Link from "next/link";
import { useRouter } from "next/navigation";
```

**Fichier : `src/app/components/header-gradient.tsx`**
```tsx
// AVANT
import { useTransitionRouter } from "next-view-transitions";

// APRÈS
import { useRouter } from "next/navigation";
```

#### 5. Styles CSS (optionnel)

Pour personnaliser les transitions, ajouter dans `globals.css` :
```css
@view-transition {
  navigation: auto;
}

/* Personnalisation des durées et effets */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
  animation-timing-function: ease-in-out;
}

/* Transition spécifique pour certaines pages */
::view-transition-old(surveillance),
::view-transition-new(surveillance) {
  animation-duration: 0.5s;
}
```

#### 6. Tests requis
- [ ] Navigation entre pages fonctionne
- [ ] Bouton retour (back) fonctionne
- [ ] Transitions fluides (pas de flash)
- [ ] Aucun blink entre pages
- [ ] Performance stable
- [ ] Fonctionnalités non régressées

#### 7. Checklist
- [ ] Next.js 16 stable sorti
- [ ] Mise à jour effectuée
- [ ] `next-view-transitions` désinstallé
- [ ] `next.config.mjs` modifié
- [ ] 5 fichiers migrés
- [ ] CSS transitions ajouté (optionnel)
- [ ] Tests complets réussis
- [ ] Aucune régression

---

## 🔴 Priorité BASSE - Migration MySQL2 → Prisma

### ⚠️ CRITIQUE
Cette migration nécessite une **coordination étroite avec l'équipe backend C#** car :
- Le backend C# Agent écrit dans la base
- Le backend C# Server écrit dans la base
- Le website Next.js lit/écrit dans la base

### Contexte
Remplacer `mysql2` par `@prisma/client` pour bénéficier de :
- Type-safety complète
- Autocomplétion IDE
- Migrations trackées
- Prisma Studio (GUI de debug)

### Bénéfices
- ✅ Type-safety TypeScript complète
- ✅ Moins de bugs (erreurs détectées à la compilation)
- ✅ Meilleure DX (Developer Experience)
- ✅ Requêtes plus lisibles
- ✅ Relations automatiques
- ✅ Prisma Studio pour debug

### Inconvénients
- ⚠️ Migration longue (~8-12h)
- ⚠️ Courbe d'apprentissage
- ⚠️ Coordination backend C# nécessaire
- ⚠️ Tests intensifs requis

### Durée estimée
⏱️ **8-12 heures**

### Difficulté
⭐⭐⭐⭐ Difficile

### Impact Backend C#
⚠️ **Tests requis** - Coordination nécessaire

### Prérequis OBLIGATOIRES
- [ ] Backup complet de la base de données
- [ ] Réunion avec équipe backend C#
- [ ] Environnement de test disponible
- [ ] Plan de rollback préparé
- [ ] Temps dédié pour tests intensifs

### Instructions détaillées

#### 1. Installation
```bash
cd "C:\Vigitemp project\vigitemp\website"
npm install @prisma/client --legacy-peer-deps
npm install -D prisma --legacy-peer-deps
```

#### 2. Initialisation
```bash
npx prisma init
```

Cela crée :
- `prisma/schema.prisma` (vide)
- `.env` avec `DATABASE_URL`

#### 3. Configuration `.env`

**IMPORTANT :** Ne pas remplacer vos variables actuelles, les dupliquer :
```env
# Variables actuelles (garder pour rollback)
DB_HOST=192.168.63.121
DB_USER=root
DB_PASS=pass
DB_SCHEMA_VIGITEMP=vigitemp
DB_SCHEMA_VIGITEMP_MESURE=vigitemp_mesure

# Nouvelles variables Prisma
DATABASE_URL="mysql://root:pass@192.168.63.121:3306/vigitemp"
DATABASE_URL_MESURE="mysql://root:pass@192.168.63.121:3306/vigitemp_mesure"
```

#### 4. ⚠️ ÉTAPE CRITIQUE : Importer le schéma C# existant

**NE PAS créer le schéma manuellement !**

```bash
# Importer DEPUIS la base existante
npx prisma db pull
```

Cela va :
- ✅ Analyser votre base MySQL
- ✅ Générer automatiquement `prisma/schema.prisma`
- ✅ Créer les modèles TypeScript correspondants
- ✅ **Pas de modification de la base !**

#### 5. Vérification du schéma généré

Ouvrir `prisma/schema.prisma` et vérifier :
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Les modèles doivent correspondre à vos tables
model lieux {
  id              Int     @id @default(autoincrement())
  nom             String
  enSurveillance  Int?
  // ... autres champs
}

model mesures {
  id              Int      @id @default(autoincrement())
  serialNumber    String
  valeur_mesure   Float
  heure_mesure    DateTime
  // ... autres champs
}

// Etc.
```

#### 6. Générer le client Prisma
```bash
npx prisma generate
```

#### 7. Créer le wrapper Prisma

**Nouveau fichier : `src/app/libs/prisma.ts`**
```typescript
import { PrismaClient } from '@prisma/client'

// Pattern singleton pour éviter les connexions multiples en dev
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  prisma_mesure: PrismaClient | undefined
}

// Client pour base vigitemp
export const prisma_vigitemp = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Client pour base vigitemp_mesure
export const prisma_vigitemp_mesure = globalForPrisma.prisma_mesure ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_MESURE,
    },
  },
})

// En développement, stocker dans global pour HMR
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma_vigitemp
  globalForPrisma.prisma_mesure = prisma_vigitemp_mesure
}
```

#### 8. Exemples de migration de requêtes

**Exemple 1 : SELECT simple**
```typescript
// ========================================
// AVANT (mysql.tsx)
// ========================================
import { pool_vigitemp } from '@/app/libs/mysql';

export async function GET() {
  const [rows] = await pool_vigitemp.query(
    'SELECT * FROM lieux WHERE enSurveillance = ?',
    [1]
  );
  return Response.json(rows);
}

// ========================================
// APRÈS (prisma.ts)
// ========================================
import { prisma_vigitemp } from '@/app/libs/prisma';

export async function GET() {
  const lieux = await prisma_vigitemp.lieux.findMany({
    where: {
      enSurveillance: 1
    }
  });
  return Response.json(lieux);
}
```

**Exemple 2 : SELECT avec JOIN**
```typescript
// ========================================
// AVANT
// ========================================
const [rows] = await pool_vigitemp.query(`
  SELECT l.*, m.valeur_mesure, m.heure_mesure
  FROM lieux l
  LEFT JOIN mesures m ON m.lieu_id = l.id
  WHERE l.id = ?
`, [idLieu]);

// ========================================
// APRÈS
// ========================================
const lieu = await prisma_vigitemp.lieux.findUnique({
  where: { id: idLieu },
  include: {
    mesures: {
      select: {
        valeur_mesure: true,
        heure_mesure: true,
      }
    }
  }
});
```

**Exemple 3 : INSERT**
```typescript
// ========================================
// AVANT
// ========================================
await pool_vigitemp_mesure.query(
  'INSERT INTO mesures (serialNumber, valeur_mesure, heure_mesure) VALUES (?, ?, ?)',
  [serialNumber, valeur, date]
);

// ========================================
// APRÈS
// ========================================
await prisma_vigitemp_mesure.mesures.create({
  data: {
    serialNumber,
    valeur_mesure: valeur,
    heure_mesure: date,
  }
});
```

**Exemple 4 : UPDATE**
```typescript
// ========================================
// AVANT
// ========================================
await pool_vigitemp.query(
  'UPDATE lieux SET nom = ? WHERE id = ?',
  [nouveauNom, idLieu]
);

// ========================================
// APRÈS
// ========================================
await prisma_vigitemp.lieux.update({
  where: { id: idLieu },
  data: { nom: nouveauNom }
});
```

#### 9. Migration progressive

**Ne pas tout migrer d'un coup !** Procéder fichier par fichier :

1. Créer `prisma.ts` à côté de `mysql.tsx` (les 2 coexistent)
2. Migrer 1 route API simple (ex: `api/lieux/route.tsx`)
3. Tester intensivement
4. Migrer route par route
5. Une fois tout migré, supprimer `mysql.tsx`

#### 10. Tests requis (CRUCIAL)

**Checklist de tests :**
- [ ] Connexion à la base de données
- [ ] SELECT simple (findMany, findUnique)
- [ ] SELECT avec WHERE complexe
- [ ] SELECT avec JOIN (include, select)
- [ ] INSERT (create)
- [ ] INSERT multiple (createMany)
- [ ] UPDATE (update)
- [ ] DELETE (delete)
- [ ] Transactions (transaction)
- [ ] Relations entre tables
- [ ] Backend C# écrit en parallèle → lecture Next.js OK
- [ ] Next.js écrit → lecture backend C# OK
- [ ] Performance comparable à MySQL2
- [ ] Aucune perte de données

#### 11. Avantages Prisma (exemples concrets)

**Type-safety automatique :**
```typescript
const lieu = await prisma_vigitemp.lieux.findUnique({
  where: { id: 1 }
});

console.log(lieu.nom);      // ✅ TypeScript sait que c'est un string
console.log(lieu.invalid);  // ❌ Erreur TypeScript à la compilation !
```

**Autocomplétion IDE :**
```typescript
prisma_vigitemp.lieux. // ⬅️ IDE propose : findMany, findUnique, create, etc.
```

**Relations automatiques :**
```typescript
const lieu = await prisma_vigitemp.lieux.findUnique({
  where: { id: 1 },
  include: {
    vigilogs: true,  // ⬅️ Inclut automatiquement les vigilogs liés
    alarmes: {
      where: {
        date: { gte: new Date('2025-01-01') }
      }
    }
  }
});

// lieu.vigilogs est typé automatiquement !
```

#### 12. Prisma Studio (bonus)

Interface graphique pour explorer/modifier la base :
```bash
npx prisma studio
```

Ouvre http://localhost:5555 avec :
- Visualisation des tables
- Édition des données
- Recherche et filtrage
- Très utile pour debug !

#### 13. Plan de rollback

Si problème majeur :

```bash
# 1. Réinstaller mysql2
npm install mysql2 --legacy-peer-deps

# 2. Restaurer mysql.tsx depuis git
git checkout HEAD -- src/app/libs/mysql.tsx

# 3. Désinstaller Prisma
npm uninstall @prisma/client prisma --legacy-peer-deps

# 4. Supprimer dossier prisma/
rm -rf prisma

# 5. Restaurer .env (supprimer DATABASE_URL)

# 6. Rebuild
npm run build
```

#### 14. Checklist complète

**Avant de commencer :**
- [ ] Backup base de données
- [ ] Réunion équipe backend C#
- [ ] Environnement de test prêt
- [ ] Plan rollback préparé

**Installation :**
- [ ] @prisma/client installé
- [ ] prisma (dev) installé
- [ ] `npx prisma init` exécuté

**Configuration :**
- [ ] DATABASE_URL dans .env
- [ ] `npx prisma db pull` réussi
- [ ] schema.prisma généré correctement
- [ ] `npx prisma generate` réussi

**Migration :**
- [ ] prisma.ts créé
- [ ] 1ère route migrée + testée
- [ ] Toutes les routes migrées progressivement
- [ ] mysql.tsx supprimé (à la fin)

**Tests :**
- [ ] Tous les tests de la checklist point 10 passent
- [ ] Backend C# fonctionne en parallèle
- [ ] Aucune régression
- [ ] Performance OK

---

## 🟡 Autres modifications optionnelles

### Vérification Embla Carousel

**Durée :** 15 minutes  
**Priorité :** Moyenne  
**Impact C# :** Aucun

#### Contexte
Le package `embla-carousel-react` est installé mais je ne l'ai pas trouvé dans le code.

#### Actions
```bash
# Vérifier utilisation
cd "C:\Vigitemp project\vigitemp\website"
grep -r "embla\|useEmbla\|EmblaCarousel" src/

# Si non utilisé :
npm uninstall embla-carousel-react --legacy-peer-deps
```

---

## 📊 Comparaison des priorités

| Migration | Priorité | Durée | Difficulté | Impact C# | Bénéfice |
|-----------|----------|-------|------------|-----------|----------|
| **Sonner** | 🟢 HAUTE | 30min | ⭐ Facile | ✅ Aucun | 🎉 Meilleure UX |
| **View Transitions** | 🟡 MOYENNE | 4-6h | ⭐⭐⭐ Moyen | ✅ Aucun | 🎉 Performance |
| **Prisma** | 🔴 BASSE* | 8-12h | ⭐⭐⭐⭐ Difficile | ⚠️ Tests requis | 🎉 Type-safety |
| **Embla check** | 🟡 MOYENNE | 15min | ⭐ Facile | ✅ Aucun | Bundle léger |

\* Basse priorité car nécessite coordination backend

---

## 🎯 Ordre recommandé d'exécution

### Phase 2 (court terme - 2025)
1. ✅ **Sonner** (30min) - Faire dès que possible
2. ✅ **Vérifier Embla** (15min) - Faire maintenant

### Phase 3 (moyen terme - à déterminer)
3. ⏸️ **View Transitions natives** (4-6h) - Attendre support officiel Next.js

### Phase 4 (long terme - planifier)
4. ⏸️ **Prisma** (8-12h) - Planifier avec équipe C#

---

## ⚠️ Avertissements importants

### Pour Prisma
- ⚠️ **NE JAMAIS** utiliser `npx prisma migrate dev` sans coordination
- ⚠️ **TOUJOURS** utiliser `npx prisma db pull` pour importer le schéma C#
- ⚠️ Laisser le backend C# gérer les migrations de schéma
- ⚠️ Prisma = lecture du schéma, pas création

### Pour View Transitions natives
- ⏸️ Attendre l'annonce officielle du support dans Next.js
- ⏸️ Vérifier changelog complet avant migration
- ⏸️ Tester en environnement de dev d'abord

### Pour Sonner
- ✅ Migration simple et sans risque
- ✅ Peut être faite immédiatement

---

## 📞 Ressources

### Documentation officielle
- Sonner : https://sonner.emilkowal.ski/
- Next.js : https://nextjs.org/docs
- Prisma : https://www.prisma.io/docs

### Guides de migration
- View Transitions API : https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
- Prisma MySQL : https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/using-prisma-migrate-mysql

---

## 📝 Notes finales

### Ce qui a été fait (Phase 1)
- ✅ Nettoyage packages inutilisés
- ✅ Mises à jour sécurité
- ✅ Corrections Next.js 15
- ✅ Corrections recharts 3.x
- ✅ 0 vulnérabilités

### Ce qui reste à faire (optionnel)
- ⏸️ Sonner (recommandé)
- ⏸️ View Transitions natives (attendre support officiel)
- ⏸️ Prisma (planifier avec C#)

### Recommandation finale
**Votre stack actuelle est excellente !** Les migrations futures sont des **améliorations**, pas des nécessités. Procédez selon vos priorités et ressources disponibles.

---

**Bon développement ! 🚀**
