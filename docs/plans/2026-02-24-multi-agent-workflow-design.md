# Design : Système multi-agents VigiSensys

**Date :** 2026-02-24
**Statut :** Validé

---

## 1. Contexte

VigiSensys est composé de 3 sous-projets :
- **Website** — Next.js 16 App Router, React 19, TypeScript, Prisma (dual-DB : `db-main` + `db-mesures`)
- **Vigitemp Serveur** — C# .NET 4.8, communication série avec sondes physiques, alarmes, MySQL/SQL Server
- **Vigitemp Agent** — C# .NET 4.8, WinForms, serveur HTTP local (port 8000), notifications Windows

Les tâches sont gérées dans une base de données Notion (ID : `2c421993-cce7-8135-bd84-000bc4ee9ab9`) avec les propriétés : **Licence** (Pack/One/Standard/Expert), **Statut**, **Priorité**, **Version**.

---

## 2. Architecture retenue

**Approche : Manager-as-main-session**

La session Claude Code courante joue le rôle de manager. Les agents spécialisés vivent dans `.claude/agents/` et sont invoqués via le Task tool. Notion est accessible via MCP dans la session principale.

```
┌─────────────────────────────────────────────────────┐
│  Session Claude Code (= Manager)                    │
│  Guidé par CLAUDE.md + superpowers skills           │
│                                                     │
│  ┌─────────┐  MCP  ┌─────────────────────────────┐  │
│  │  Notion │◄─────►│  Lecture tâches / contexte  │  │
│  └─────────┘       └─────────────────────────────┘  │
│                                                     │
│  Dispatch via Task tool                             │
│  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌─────────┐  │
│  │ nextjs   │ │ csharp-  │ │ csharp │ │   db    │  │
│  │ -agent   │ │ server   │ │ -agent │ │  agent  │  │
│  └──────────┘ └──────────┘ └────────┘ └─────────┘  │
│                                                     │
│  Rapport final → utilisateur + suggestion Notion    │
└─────────────────────────────────────────────────────┘
```

**Fichiers créés :**
| Fichier | Rôle |
|---|---|
| `CLAUDE.md` | Comportement manager : workflow, dispatch, format rapport |
| `.claude/agents/nextjs-agent.md` | Expert Next.js 16 + React 19 + API routes |
| `.claude/agents/csharp-server.md` | Expert C# serveur + sondes physiques |
| `.claude/agents/csharp-agent.md` | Expert C# agent Windows + WinForms |
| `.claude/agents/db-agent.md` | Expert Prisma + schéma dual-DB |
| `.claude/mcp.json` | Configuration MCP Notion |

---

## 3. Cycle de vie d'une tâche

```
Utilisateur : "On travaille sur [tâche X]"
         │
         ▼
    Manager évalue la complexité
         │
    ┌────┴────────────────────────┐
    │ Simple (1 agent, trivial)   │  Complexe (multi-agents)
    │ → Lance directement         │  → Présente plan, demande OK
    └────────────────────────────┘
         │
         ▼
    Brainstorming (superpowers)
    + Découpage en sous-tâches
    + Attribution aux agents
         │
         ▼
    ┌─────────────────────────────────┐
    │ Chaque agent (en parallèle      │
    │ si indépendants) :              │
    │  1. Mini-plan de sa sous-tâche  │
    │  2. Exécution                   │
    │  3. Rapport de retour           │
    └─────────────────────────────────┘
         │
         ▼
    Manager synthétise les rapports
         │
         ▼
    Rapport final :
    ✅ Ce qui a été fait
    ⚠️  Points d'attention
    ❌ Erreurs rencontrées
    💡 Suggestion de prochaine tâche Notion
```

**Règle de dispatch :**

| Type de changement | Agent(s) |
|---|---|
| UI, pages, composants React | `nextjs-agent` |
| API routes, logique serveur web | `nextjs-agent` |
| Schéma Prisma, migrations | `db-agent` |
| Serveur C# + sondes physiques | `csharp-server` |
| Agent Windows + notifications | `csharp-agent` |
| Tâche cross-domain | Manager découpe + plusieurs agents |

---

## 4. Profil des agents spécialisés

### `nextjs-agent`
- **Expertise :** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS, shadcn/ui, Prisma client, internationalisation (next-intl)
- **Scope :** `website/src/`, `website/prisma/`
- **Règles strictes :** zéro `any`, zéro erreur TypeScript, pas de `useEffect` inutile, API routes typées end-to-end, respect du système de licences (Pack/One/Standard/Expert)

### `csharp-server`
- **Expertise :** C# .NET 4.8, communication série/USB avec sondes physiques, logique d'alarme (retard, pré-alarme, hystérésis), MySQL/SQL Server
- **Scope :** `Vigitemp Serveur/`
- **Règles strictes :** gestion d'exceptions exhaustive, pas de magic strings, logs explicites sur chaque action critique, pas de breaking change sur le protocole sonde

### `csharp-agent`
- **Expertise :** C# .NET 4.8, WinForms, serveur HTTP local (port 8000), notifications Windows, communication avec le serveur principal
- **Scope :** `Vigitemp agent/`
- **Règles strictes :** stabilité maximale (tourne 24/7 en tâche de fond), gestion des exceptions sans crash, même rigueur que `csharp-server`

### `db-agent`
- **Expertise :** schéma Prisma dual-DB (`db-main` transactionnel + `db-mesures` time-series), migrations, requêtes SQL brutes MySQL/SQL Server
- **Scope :** `website/prisma/`, requêtes SQL dans `Database.cs`
- **Règles strictes :** toute migration validée contre les deux schémas, pas de breaking change sans plan de migration explicite, cohérence des types entre Prisma et TypeScript

### Format de rapport standard (tous agents)
```
## Rapport [agent-name]
✅ Réalisé : [liste]
⚠️  Points d'attention : [liste ou "aucun"]
❌ Erreurs rencontrées : [liste ou "aucune"]
🔍 Doutes / décisions prises : [liste ou "aucun"]
```

---

## 5. Intégration Notion (MCP)

**Setup requis (une seule fois) :**
1. Créer une intégration Notion → récupérer la clé API
2. Partager la base de données avec l'intégration
3. Configurer `.claude/mcp.json` avec le serveur MCP Notion officiel

**Base de données Notion :**
- ID : `2c421993-cce7-8135-bd84-000bc4ee9ab9`
- Propriétés : Licence, Statut, Priorité, Version

**Logique de suggestion de tâche suivante :**
- Statuts éligibles : `Pas commencé`, `En attente (priorité)`, `En cours`
- Exclus : `Terminé`, `Abandonné`, `Futures Versions`
- Tri : `Élevée` → `Moyenne` → `Faible` → `Future`
- Bonus : même Licence ou même Version que la tâche terminée
- Le manager présente **2-3 suggestions max** avec justification
- Le manager ne modifie jamais le statut Notion sans confirmation explicite

---

## 6. Décisions clés

- **Manager = session principale** (pas un agent fichier) → superpowers skills disponibles directement
- **Agents en parallèle** quand leurs tâches sont indépendantes (pas de shared state)
- **Confirmation requise** pour les tâches complexes (multi-agents), optionnelle pour les tâches simples (1 agent, trivial)
- **Notion read-only** par défaut — le statut n'est jamais modifié sans accord explicite
