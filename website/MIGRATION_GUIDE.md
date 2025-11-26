# Guide de Migration Étape par Étape - Vigitemp

## ✅ Phase 1 : Nettoyage (TERMINÉ)

### Packages supprimés
- ✅ `dotenv` - Next.js gère `.env` nativement
- ✅ `react-dotenv` - Redondant
- ✅ `os` - Module Node.js built-in
- ✅ `react-webp-image` - `next/image` le remplace
- ✅ `recharts` - Non utilisé
- ✅ `request-ip` - Non utilisé
- ✅ `nextui-cli` - Déprécié (utiliser heroui-cli si besoin)
- ✅ `npm` - Inutile en dépendance

### Mises à jour automatiques
- ✅ Toutes les dépendances mises à jour vers versions compatibles
- ✅ 0 vulnérabilités restantes

---

## 🔄 Phase 2 : Migrations Optionnelles

### 2.1 - Migration vers Sonner (Toast) [RECOMMANDÉ]

**Durée estimée :** 30 minutes  
**Difficulté :** ⭐ Facile

#### Installation
```bash
cd "C:\Vigitemp project\Vigitemp\website"
npm uninstall react-hot-toast --legacy-peer-deps
npm install sonner --legacy-peer-deps
```

#### Fichiers à modifier

**1. `src/app/layout.tsx`**
```tsx
// AVANT
import {Toaster} from "react-hot-toast";

// APRÈS
import { Toaster } from "sonner";

// Dans le JSX, remplacer :
<Toaster position="bottom-right" />

// Par :
<Toaster position="bottom-right" richColors />
```

**2. `src/app/components/vigilog-settings.tsx`**
```tsx
// AVANT
import toast from "react-hot-toast";

toast.error("Message", {
    duration: 4000,
});

// APRÈS
import { toast } from "sonner";

toast.error("Message", {
    duration: 4000,
});
// API identique ! Aucun changement requis
```

**3. Test rapide**
```bash
npm run dev
# Tester les toasts dans l'application
```

---

### 2.2 - Vérification Embla Carousel

**Action requise :** Vérifier si embla-carousel-react est utilisé

```bash
cd "C:\Vigitemp project\Vigitemp\website"
grep -r "embla\|useEmbla\|EmblaCarousel" src/
```

**Si NON utilisé :**
```bash
npm uninstall embla-carousel-react --legacy-peer-deps
```

**Si utilisé et migration vers Swiper souhaitée :**
Voir section détaillée dans `MIGRATION_PLAN.md`

---

### 2.3 - Next.js 15 → 16 + View Transitions Natives

**⚠️ IMPORTANT :** Next.js 16 est en RC (Release Candidate). Attendre la version stable recommandé.

**Durée estimée :** 4-6 heures  
**Difficulté :** ⭐⭐⭐ Moyen-Difficile

#### Quand Next.js 16 sera stable :

**1. Mise à jour**
```bash
npm install next@latest react@latest react-dom@latest --legacy-peer-deps
npm uninstall next-view-transitions --legacy-peer-deps
```

**2. Configuration `next.config.mjs`**
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    viewTransitions: true,
  },
};

export default nextConfig;
```

**3. Migrations de code**

Fichiers à modifier :
- `src/app/layout.tsx`
- `src/app/surveillance/[idLieu]/page.tsx`
- `src/app/components/monitoring-graph.tsx`
- `src/app/components/sideBarMetrology.tsx`
- `src/app/components/header-gradient.tsx`

**Modèle de migration :**

```tsx
// ========================================
// AVANT (next-view-transitions)
// ========================================
import { ViewTransitions } from "next-view-transitions";
import { Link, useTransitionRouter } from "next-view-transitions";

export default function Layout({ children }) {
  return (
    <ViewTransitions>
      {children}
    </ViewTransitions>
  );
}

function Component() {
  const router = useTransitionRouter();
  
  return (
    <Link href="/page">
      Lien
    </Link>
  );
}

// ========================================
// APRÈS (Next.js 16 natif)
// ========================================
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Layout({ children }) {
  return children; // Plus besoin de wrapper
}

function Component() {
  const router = useRouter();
  
  return (
    <Link href="/page">
      Lien
    </Link>
  );
}
```

**4. Styles CSS (optionnel)**

Pour personnaliser les transitions, ajouter dans `globals.css` :
```css
@view-transition {
  navigation: auto;
}

/* Personnalisation des transitions */
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
}
```

**5. Tests requis**
- ✅ Navigation entre pages
- ✅ Retour arrière (back)
- ✅ Transitions fluides
- ✅ Aucun flash/blink

---

### 2.4 - MySQL2 → Prisma

**⚠️ CRITIQUE :** Coordination avec backend C# requise !

**Durée estimée :** 8-12 heures  
**Difficulté :** ⭐⭐⭐⭐ Difficile

**Prérequis :**
- ✅ Backup de la base de données
- ✅ Coordination avec développeurs backend C#
- ✅ Tests extensifs planifiés

#### Installation

```bash
cd "C:\Vigitemp project\Vigitemp\website"
npm install @prisma/client --legacy-peer-deps
npm install -D prisma --legacy-peer-deps
```

#### Configuration

**1. Initialiser Prisma**
```bash
npx prisma init
```

**2. Configuration `.env`**
```env
# Remplacer les variables existantes par :
DATABASE_URL="mysql://user:password@host:3306/vigitemp"
DATABASE_URL_MESURE="mysql://user:password@host:3306/vigitemp_mesure"
```

**3. Importer le schéma existant (IMPORTANT !)**
```bash
# Importer depuis la base C# existante
npx prisma db pull
```

Cela va générer `prisma/schema.prisma` avec votre schéma existant.

**4. Générer le client Prisma**
```bash
npx prisma generate
```

#### Migration du code

**Fichier `src/app/libs/mysql.tsx` → `src/app/libs/prisma.ts`**

```typescript
// ========================================
// AVANT (mysql.tsx)
// ========================================
import mysql from 'mysql2/promise'

export const pool_vigitemp = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA_VIGITEMP,
    waitForConnections: true
})

export const pool_vigitemp_mesure = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_SCHEMA_VIGITEMP_MESURE,
    waitForConnections: true
})

// ========================================
// APRÈS (prisma.ts)
// ========================================
import { PrismaClient } from '@prisma/client'

// Créer un client global pour éviter les connexions multiples
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma_vigitemp = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

export const prisma_vigitemp_mesure = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_MESURE,
    },
  },
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma_vigitemp
}
```

#### Exemple de migration de requête

```typescript
// ========================================
// AVANT (MySQL2)
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
// APRÈS (Prisma)
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

#### Avantages Prisma

```typescript
// Type-safety automatique
const lieu = await prisma_vigitemp.lieux.findUnique({
  where: { id: 1 },
  include: {
    vigilogs: true, // Relations automatiques
    alarmes: {
      where: {
        date: {
          gte: new Date('2025-01-01')
        }
      }
    }
  }
});

// TypeScript sait exactement ce que contient `lieu` !
console.log(lieu.nom); // ✅ Autocomplétion
console.log(lieu.invalid); // ❌ Erreur TypeScript
```

#### Tests requis

**Checklist :**
- [ ] Connexion à la base de données
- [ ] Lecture des données (SELECT)
- [ ] Insertion des données (INSERT)
- [ ] Mise à jour des données (UPDATE)
- [ ] Suppression des données (DELETE)
- [ ] Transactions
- [ ] Relations entre tables
- [ ] Tests avec backend C# en parallèle
- [ ] Performance (comparer avec MySQL2)

#### Rollback

Si problème, revenir à MySQL2 :
```bash
npm uninstall @prisma/client prisma --legacy-peer-deps
npm install mysql2 --legacy-peer-deps
# Restaurer mysql.tsx depuis git
```

---

## 📊 Checklist complète

### Phase 1 - Nettoyage (TERMINÉ)
- [x] Supprimer packages inutilisés
- [x] Mettre à jour dépendances
- [x] Vérifier 0 vulnérabilités

### Phase 2 - Migrations optionnelles
- [ ] Sonner (recommandé, facile)
- [ ] Vérifier/supprimer Embla Carousel
- [ ] Next.js 16 (attendre version stable)
- [ ] Prisma (planifier avec équipe)

### Tests après chaque migration
- [ ] `npm run dev` fonctionne
- [ ] `npm run build` fonctionne
- [ ] Pas d'erreurs console
- [ ] Fonctionnalités testées manuellement

---

## 🚨 Points d'attention

### Backend C#
- ⚠️ Vigitemp Agent (C#) écrit dans la base
- ⚠️ Vigitemp Server (C#) écrit dans la base
- ⚠️ Website (Next.js) lit/écrit dans la base
- ✅ Prisma peut coexister avec C# (schéma importé)
- ❌ NE PAS utiliser `prisma migrate dev` (laisser C# gérer)

### Best Practices
- ✅ Faire un commit git avant chaque migration
- ✅ Tester en local avant production
- ✅ Garder l'ancienne version accessible (branches git)
- ✅ Migration par étapes (pas tout en même temps)

---

## 📞 Support

- Prisma Docs : https://www.prisma.io/docs
- Next.js 16 Docs : https://nextjs.org/docs
- Sonner : https://sonner.emilkowal.ski/

## 🎉 Résultat final attendu

Après toutes les migrations :
- ✅ Bundle ~15-20% plus léger
- ✅ Type-safety complète avec Prisma
- ✅ Transitions natives Next.js 16
- ✅ Meilleure DX (Developer Experience)
- ✅ Code plus maintenable
- ✅ Dépendances à jour
