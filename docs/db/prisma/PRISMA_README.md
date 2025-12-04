# Configuration Prisma - Vigitemp

Ce projet utilise **deux bases de données MySQL** avec **deux schémas Prisma séparés** :

## 🗄️ Architecture des bases de données

### 1. **vigitemp** (Base principale)
- **Schéma**: `prisma/schema.prisma`
- **Client généré**: `src/generated/prisma`
- **Config**: `prisma.config.ts`
- **URL**: `DATABASE_URL` dans `.env`
- **Contenu**: 
  - Configuration générale
  - Utilisateurs, profils, autorisations
  - Lieux, sites, plans
  - Sondes, capteurs, actionneurs
  - Alarmes actives
  - Paramètres système
  - Étalonnages, calibrages
  - Modules, matériel

**47 tables introspectées**

### 2. **vigitemp_mesure** (Base time-series)
- **Schéma**: `prisma-mesure/schema.prisma`
- **Client généré**: `src/generated/prisma-mesure`
- **Config**: `prisma-mesure.config.ts`
- **URL**: `DATABASE_MESURE_URL` dans `.env`
- **Contenu**:
  - Mesures temps réel (`ts_mesure`)
  - Historique des mesures (`ts_mesurehisto`)
  - Journal des événements (`ts_journal`, `ts_journalhisto`)
  - Graphiques (`ts_graphique`)
  - Mesures de tests, calibrages, étalonnages
  - Compteurs et paramètres techniques

**17 tables introspectées**

## 🚀 Commandes Prisma

### Base principale (vigitemp)
```bash
# Pull du schéma depuis la DB
npx prisma db pull

# Génération du client
npx prisma generate

# Ouvrir Prisma Studio
npx prisma studio
```

### Base mesure (vigitemp_mesure)
```bash
# Pull du schéma depuis la DB
npx prisma db pull --config prisma-mesure.config.ts

# Génération du client
npx prisma generate --config prisma-mesure.config.ts

# Ouvrir Prisma Studio
npx prisma studio --config prisma-mesure.config.ts
```

## 💻 Utilisation dans le code

### Import des clients
```typescript
import { prisma, prismaMesure } from '@/lib/prisma'
```

### Exemples de requêtes

#### Base principale (vigitemp)
```typescript
// Récupérer tous les utilisateurs
const users = await prisma.t_utilisateur.findMany({
  where: { Archive: 0 }
})

// Récupérer les alarmes actives
const activeAlarms = await prisma.t_alarme.findMany({
  where: { 
    Alarme_Vrai: 1,
    Acquite: 0 
  },
  include: {
    t_lieu: true // Relation avec le lieu
  }
})

// Récupérer les sondes d'un lieu
const sensors = await prisma.t_sonde.findMany({
  where: {
    t_lieu: {
      IdLieu: 1
    }
  }
})
```

#### Base mesure (vigitemp_mesure)
```typescript
// Récupérer les dernières mesures
const recentMeasurements = await prismaMesure.ts_mesure.findMany({
  where: {
    IdLieu: 1
  },
  orderBy: {
    DateHeureMesure: 'desc'
  },
  take: 100
})

// Récupérer les mesures pour un graphique
const graphData = await prismaMesure.ts_graphique.findMany({
  where: {
    IdLieu: 1,
    DateHeureMesure: {
      gte: new Date('2025-12-01'),
      lte: new Date('2025-12-03')
    }
  }
})

// Journal des événements
const journal = await prismaMesure.ts_journal.findMany({
  where: {
    CodeJournal: 'ALARME_ACQUIT'
  },
  orderBy: {
    DateHeureJournal: 'desc'
  }
})
```

## 🔄 Mise à jour des schémas

Quand la structure de la base de données change :

```bash
# 1. Pull des deux bases
npx prisma db pull
npx prisma db pull --config prisma-mesure.config.ts

# 2. Génération des clients
npx prisma generate
npx prisma generate --config prisma-mesure.config.ts
```

## ⚠️ Notes importantes

1. **Pas de migrations Prisma**: On utilise `db pull` car les bases existent déjà avec leur propre historique de migrations (WinDev)

2. **Un seul schéma pour toutes les licences**: 
   - Light, Standard, Expert utilisent les mêmes tables
   - La logique métier détermine quelles tables sont accessibles selon la licence
   - Pas de schémas différents à maintenir

3. **Relations entre bases**: 
   - Prisma ne peut pas gérer automatiquement les relations entre les deux bases
   - Les jointures entre `vigitemp` et `vigitemp_mesure` doivent être faites manuellement dans le code

4. **Singleton pattern**: 
   - `@/lib/prisma.ts` utilise un singleton pour éviter de créer plusieurs connexions
   - En développement, les instances sont réutilisées pour les hot-reloads

## 📊 Mapping des tables pour la version Light

Tables principales utilisées par la version Light :

### vigitemp (config)
- `t_utilisateur` → Users (auth, 2 rôles: admin/user)
- `t_profil` → Profils utilisateur
- `t_autorisation` → Permissions
- `t_lieu` → Locations/Sites
- `t_sonde` → Sensors/Sondes
- `t_alarme` → Alarms (actives)
- `t_parametre` → Settings (key-value)

### vigitemp_mesure (time-series)
- `ts_mesure` → Real-time measurements
- `ts_graphique` → Chart data
- `ts_journal` → Audit trail

Les autres tables sont utilisées par les versions Standard et Expert.

## 🔐 Variables d'environnement

Fichier `.env` :
```env
# Base principale
DATABASE_URL="mysql://root:root@127.0.0.1:3306/vigitemp"

# Base time-series
DATABASE_MESURE_URL="mysql://root:root@127.0.0.1:3306/vigitemp_mesure"
```

## 📖 Documentation

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Client API](https://www.prisma.io/docs/concepts/components/prisma-client)
- [Multiple Databases](https://www.prisma.io/docs/guides/database/multi-schema)
