# Plan d'implémentation — Messagerie Interne

**Date :** 2026-02-27
**Basé sur :** `website/docs/plans/2026-02-27-messagerie-interne-design.md`
**Statut :** Prêt à implémenter

---

## Objectif

Ajouter un système de messagerie interne (1-to-1 et groupes) réservé aux licences Standard/Expert, avec un toggle admin pour activer/désactiver le module. Le transport V1 est REST + polling React Query (10 s). Le temps réel (Socket.IO) est prévu en V2.

---

## Résumé architectural

```
vigi_chat (MySQL) ─── prisma/vigi-chat/schema.prisma
                  └── src/generated/@prisma-vigi-chat/client
                  └── src/lib/prisma-chat.ts  (singleton Proxy, comme prisma.ts)

API (7 routes)
  /api/chat/unread-count           GET
  /api/chat/conversations          GET
  /api/chat/conversations/direct   POST
  /api/chat/conversations/group    POST
  /api/chat/conversations/[id]/messages  GET + POST
  /api/chat/conversations/[id]/read      POST

Hooks client
  useMessagingEnabled()   → boolean
  useUnreadCount()        → number

UI
  BellButton              (PageHeaderBase)
  AppSidebar              + lien "Messagerie" conditionnel + badge
  AdminSidebar            + lien "Messagerie" conditionnel + badge
  MessagingSettingsCard   (admin/parametres)
  /messages               (page deux colonnes)
```

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| ORM | Prisma 7 + @prisma/adapter-mariadb |
| API routes | Next.js 16 App Router, `withAuthLogging`, `apiOk`/`apiError` |
| Client data | @tanstack/react-query v5, `fetchJson`/`getJson`/`postJson` |
| UI | shadcn/ui : Card, Popover, Badge, Avatar, Tabs, Textarea, ScrollArea, Dialog, Input, Separator |
| i18n | next-intl, `useTranslations("messaging")` + `useTranslations("adminSettings")` |
| Auth | `getAuthenticatedUser(req)` → JWTPayload |
| License | `isStandardOrExpert(license)` depuis `@/lib/license-access` |

---

## Tâche 1 — Schéma Prisma `vigi_chat` + client généré

### But

Créer le troisième schéma Prisma (même pattern que `db-main` et `db-mesures`) et le client singleton.

### Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `website/prisma/vigi-chat/schema.prisma` | Créer |
| `website/prisma-chat.config.ts` | Créer |
| `website/src/lib/prisma-chat.ts` | Créer |
| `website/package.json` | Modifier — ajouter scripts `prisma:generate:chat` et `prisma:studio:chat` |

### Étapes détaillées

**1.1 — `website/prisma/vigi-chat/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../src/generated/@prisma-vigi-chat"
}

datasource db {
  provider = "mysql"
}

model t_conversation {
  Id_Conversation Int      @id @default(autoincrement())
  Type            String   @db.VarChar(10)   // "direct" | "group"
  Titre           String?  @db.VarChar(128)
  DM_Key          String?  @unique @db.VarChar(64)
  Date_Creation   DateTime @default(now()) @db.DateTime(0)

  participants t_conversation_participant[]
  messages     t_message[]

  @@index([Type])
  @@index([Date_Creation])
}

model t_conversation_participant {
  Id_Participant    Int      @id @default(autoincrement())
  Id_Conversation   Int
  Id_Utilisateur    Int
  Last_Read_Msg_Id  Int?
  Date_Ajout        DateTime @default(now()) @db.DateTime(0)

  conversation t_conversation @relation(fields: [Id_Conversation], references: [Id_Conversation], onDelete: Cascade)

  @@unique([Id_Conversation, Id_Utilisateur])
  @@index([Id_Utilisateur])
}

model t_message {
  Id_Message        Int      @id @default(autoincrement())
  Id_Conversation   Int
  Sender_Id         Int
  Contenu           String   @db.Text
  Date_Creation     DateTime @default(now()) @db.DateTime(0)
  Date_Modification DateTime? @db.DateTime(0)
  Date_Suppression  DateTime? @db.DateTime(0)

  conversation t_conversation @relation(fields: [Id_Conversation], references: [Id_Conversation], onDelete: Cascade)

  @@index([Id_Conversation, Id_Message])
  @@index([Date_Creation])
}
```

Remarques :
- `Type` est `VarChar(10)` plutôt qu'ENUM Prisma pour compatibilité MariaDB sans migration.
- La FK cross-DB vers `t_utilisateur.Id_Utilisateur` est intentionnellement absente (design validé).
- `onDelete: Cascade` sur `t_message` et `t_conversation_participant` pour cohérence.

**1.2 — `website/prisma-chat.config.ts`**

Copier la structure de `website/prisma-main.config.ts` :

```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/vigi-chat/schema.prisma",
  datasource: {
    url: env("DATABASE_CHAT_URL"),
  },
});
```

**1.3 — `website/src/lib/prisma-chat.ts`**

Pattern identique à `website/src/lib/prisma.ts` :

```typescript
import "dotenv/config"
import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "../generated/@prisma-vigi-chat/client"

type GlobalChatState = {
  prismaChat?: PrismaClient
}

const globalForChat = globalThis as unknown as GlobalChatState

function requireEnv(name: "DATABASE_CHAT_URL"): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`[prisma-chat] Missing required environment variable: ${name}`)
  }
  return value
}

const chatDbUrl = requireEnv("DATABASE_CHAT_URL")
const chatAdapter = new PrismaMariaDb(chatDbUrl)

function getPrismaChatClient() {
  if (!globalForChat.prismaChat) {
    globalForChat.prismaChat = new PrismaClient({
      adapter: chatAdapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    })
  }
  return globalForChat.prismaChat
}

export const prismaChat = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return (getPrismaChatClient() as any)[prop]
  },
})
```

**1.4 — Ajouts dans `package.json` scripts**

Ajouter dans la section `"scripts"` (après les scripts prisma existants) :

```json
"prisma:generate:chat": "prisma generate --schema=./prisma/vigi-chat/schema.prisma",
"prisma:studio:chat": "prisma studio --schema=./prisma/vigi-chat/schema.prisma --port 5557",
```

Et mettre à jour le script `prisma:generate` pour inclure le chat :
```json
"prisma:generate": "prisma generate --schema=./prisma/db-main/schema.prisma && prisma generate --schema=./prisma/db-mesures/schema.prisma && prisma generate --schema=./prisma/vigi-chat/schema.prisma",
```

**1.5 — Variable d'environnement**

Ajouter `DATABASE_CHAT_URL` dans le fichier `.env` local (non versionné) et dans tout fichier `.env.example` existant :
```
DATABASE_CHAT_URL="mysql://user:pass@localhost:3306/vigi_chat"
```

**1.6 — Génération du client**

```bash
cd website
npx prisma generate --schema=./prisma/vigi-chat/schema.prisma
```

Le client est généré dans `website/src/generated/@prisma-vigi-chat/`.

**1.7 — Vérification TypeScript**

```bash
cd website
npx tsc --noEmit
```

**Commit :** `feat(chat): add vigi_chat Prisma schema and singleton client`

---

## Tâche 2 — Clés i18n

### But

Ajouter toutes les clés de traduction nécessaires dans `fr.json` et `en.json`.

### Fichiers à modifier

- `website/src/messages/fr.json`
- `website/src/messages/en.json`

### Étapes détaillées

**2.1 — Clés à ajouter dans `fr.json`**

Insérer le bloc JSON suivant. Plusieurs namespaces sont concernés.

**Dans `"sidebar"` (après `"services"`) :**
```json
"messaging": "Messagerie"
```

**Dans `"adminSidebar"."management"` (après `"alarms"`) :**
```json
"messaging": "Messagerie"
```

**Nouveau namespace `"messaging"` (à ajouter à la fin du fichier avant le `}` final) :**
```json
"messaging": {
  "page": {
    "title": "Messagerie",
    "description": "Messages internes",
    "meta": {
      "title": "Messagerie - VigiSensys",
      "description": "Messages internes entre utilisateurs"
    }
  },
  "conversations": {
    "new": "Nouvelle conversation",
    "search_placeholder": "Rechercher une conversation...",
    "empty_list": "Aucune conversation",
    "group_badge": "Groupe",
    "deleted_message": "Message supprimé",
    "edited_label": "(modifié)"
  },
  "thread": {
    "empty_state": "Sélectionnez une conversation ou démarrez-en une nouvelle",
    "participants_count": "{count, plural, one {{count} participant} other {{count} participants}}",
    "input_placeholder": "Écrivez un message… (Entrée pour envoyer, Maj+Entrée pour saut de ligne)",
    "send": "Envoyer",
    "load_more": "Charger les messages précédents"
  },
  "new_conversation": {
    "title": "Nouvelle conversation",
    "tab_direct": "Message direct",
    "tab_group": "Groupe",
    "direct_search": "Rechercher un utilisateur...",
    "group_title_label": "Titre du groupe",
    "group_title_placeholder": "Ex. : Équipe qualité",
    "group_members_label": "Membres",
    "group_members_search": "Ajouter des membres...",
    "create": "Créer",
    "no_users": "Aucun utilisateur trouvé"
  },
  "bell": {
    "tooltip": "Messages",
    "title": "Messages",
    "mark_all_read": "Tout marquer comme lu",
    "empty": "Aucun nouveau message",
    "view_all": "Voir tous les messages"
  },
  "time": {
    "just_now": "À l'instant",
    "minutes_ago": "Il y a {count} min",
    "yesterday": "Hier",
    "date_separator_today": "Aujourd'hui",
    "date_separator_yesterday": "Hier"
  }
}
```

**Dans `"adminSettings"` (après `"smtp_modal"`, avant la fermeture du namespace) :**
```json
"messaging": {
  "title": "Messagerie interne",
  "description": "Activer la messagerie interne entre utilisateurs (Standard/Expert uniquement)",
  "toggle_label": "Activer la messagerie"
}
```

**2.2 — Clés à ajouter dans `en.json`**

Mêmes namespaces, traduction anglaise :

**Dans `"sidebar"` :**
```json
"messaging": "Messaging"
```

**Dans `"adminSidebar"."management"` :**
```json
"messaging": "Messaging"
```

**Nouveau namespace `"messaging"` :**
```json
"messaging": {
  "page": {
    "title": "Messaging",
    "description": "Internal messages",
    "meta": {
      "title": "Messaging - VigiSensys",
      "description": "Internal messages between users"
    }
  },
  "conversations": {
    "new": "New conversation",
    "search_placeholder": "Search conversations...",
    "empty_list": "No conversations",
    "group_badge": "Group",
    "deleted_message": "Message deleted",
    "edited_label": "(edited)"
  },
  "thread": {
    "empty_state": "Select a conversation or start a new one",
    "participants_count": "{count, plural, one {{count} participant} other {{count} participants}}",
    "input_placeholder": "Write a message… (Enter to send, Shift+Enter for new line)",
    "send": "Send",
    "load_more": "Load previous messages"
  },
  "new_conversation": {
    "title": "New conversation",
    "tab_direct": "Direct message",
    "tab_group": "Group",
    "direct_search": "Search a user...",
    "group_title_label": "Group title",
    "group_title_placeholder": "E.g.: Quality team",
    "group_members_label": "Members",
    "group_members_search": "Add members...",
    "create": "Create",
    "no_users": "No users found"
  },
  "bell": {
    "tooltip": "Messages",
    "title": "Messages",
    "mark_all_read": "Mark all as read",
    "empty": "No new messages",
    "view_all": "View all messages"
  },
  "time": {
    "just_now": "Just now",
    "minutes_ago": "{count} min ago",
    "yesterday": "Yesterday",
    "date_separator_today": "Today",
    "date_separator_yesterday": "Yesterday"
  }
}
```

**Dans `"adminSettings"` :**
```json
"messaging": {
  "title": "Internal messaging",
  "description": "Enable internal messaging between users (Standard/Expert only)",
  "toggle_label": "Enable messaging"
}
```

**2.3 — Vérification TypeScript**
```bash
npx tsc --noEmit
```

**Commit :** `feat(chat): add i18n keys for messaging module`

---

## Tâche 3 — Paramètre admin `messaging:enabled`

### But

Exposer un endpoint public (non admin) pour lire l'état du module, et créer la `MessagingSettingsCard` dans la page admin des paramètres.

### Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `website/src/app/api/settings/messaging-enabled/route.ts` | Créer |
| `website/src/app/[locale]/(admin)/admin/parametres/_components/messaging-settings-card.tsx` | Créer |
| `website/src/app/[locale]/(admin)/admin/parametres/_components/settings-client.tsx` | Modifier |
| `website/src/app/[locale]/(admin)/admin/parametres/server-settings.tsx` | Modifier |

### Étapes détaillées

**3.1 — `website/src/app/api/settings/messaging-enabled/route.ts`**

Route publique (authentifiée, pas besoin de droit admin) car elle est interrogée par les hooks client sur toutes les pages.

```typescript
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiOk } from "@/lib/api-response"

export const GET = withAuthLogging(async (_req: NextRequest) => {
  try {
    const setting = await prisma.t_parametre.findFirst({
      where: { Section: "messaging", Mot_Cle: "enabled" },
      select: { Valeur: true },
    })
    // Défaut : activé si le paramètre n'existe pas encore
    const enabled = setting ? setting.Valeur === "true" : true
    return apiOk({ enabled })
  } catch {
    return apiOk({ enabled: true })
  }
})
```

Notes :
- Le fallback `true` est intentionnel pour la première exécution avant que le DBA ait créé la ligne.
- `withAuthLogging` garantit l'auth mais pas de droit GERER_PROFIL, contrairement aux autres routes parametres.
- La recherche est case-sensitive côté Prisma, mais la valeur insérée par le toggle admin sera toujours `"messaging"` minuscule (même pattern que le rest du code).

**3.2 — `website/src/app/[locale]/(admin)/admin/parametres/_components/messaging-settings-card.tsx`**

Copier le pattern exact de `notifications-settings-card.tsx` :

```typescript
"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { SwitchWithLoading } from "@/components/ui/switch-with-loading"
import { useTranslations } from "next-intl"

type Setting = {
  key: string
  value: string
  label: string
}

type MessagingSettingsCardProps = {
  settings: Setting[]
  loadingKeys: Set<string>
  onToggle: (key: string, currentValue: string) => void
}

export function MessagingSettingsCard({
  settings,
  loadingKeys,
  onToggle,
}: MessagingSettingsCardProps) {
  const t = useTranslations("adminSettings")

  const enabledSetting = useMemo(
    () => settings.find((s) => s.key === "messaging:enabled"),
    [settings],
  )

  if (!enabledSetting) return null

  return (
    <Card className="bg-white/50 dark:bg-card">
      <CardHeader>
        <CardTitle>{t("messaging.title")}</CardTitle>
        <CardDescription>{t("messaging.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Label htmlFor={enabledSetting.key} className="flex-1">
            {t("messaging.toggle_label")}
          </Label>
          <SwitchWithLoading
            id={enabledSetting.key}
            checked={enabledSetting.value === "true"}
            onCheckedChange={() => onToggle(enabledSetting.key, enabledSetting.value)}
            isLoading={loadingKeys.has(enabledSetting.key)}
          />
        </div>
      </CardContent>
    </Card>
  )
}
```

**3.3 — Modifier `settings-client.tsx`**

Ajouter l'import et le rendu conditionnel (visible uniquement Standard/Expert) :

```typescript
// Ajouter aux imports existants :
import { MessagingSettingsCard } from "./messaging-settings-card"

// Dans le JSX, après <NotificationsSettingsCard ... /> et avant <SmtpSettingsCard ... /> :
{isStandardOrExpert(license) && (
  <MessagingSettingsCard
    settings={settings.filter((s) => s.key === "messaging:enabled")}
    loadingKeys={loadingKeys}
    onToggle={handleToggle}
  />
)}
```

**3.4 — Modifier `server-settings.tsx`**

Ajouter `"messaging"` dans la clause `where` du `findMany` :

```typescript
// Ligne existante :
where: {
  Section: {
    in: ["general", "notifications", "alarms", "dashboard", "GENERAL", "NOTIFICATIONS", "ALARMS", "DASHBOARD"],
  },
},
// Devient :
where: {
  Section: {
    in: ["general", "notifications", "alarms", "dashboard", "messaging",
         "GENERAL", "NOTIFICATIONS", "ALARMS", "DASHBOARD", "MESSAGING"],
  },
},
```

Et ajouter dans `defaultSettings` :

```typescript
{ key: "messaging:enabled", value: "true", label: "Messagerie interne" },
```

**3.5 — Vérification TypeScript**
```bash
npx tsc --noEmit
```

**Commit :** `feat(chat): add messaging:enabled admin toggle + API endpoint`

---

## Tâche 4 — API routes — 7 endpoints

### But

Créer les 7 endpoints qui alimentent le module messagerie, avec double guard (licence + module activé) et vérification de participation.

### Fichiers à créer

| Fichier | Méthode(s) |
|---------|-----------|
| `website/src/app/api/chat/unread-count/route.ts` | GET |
| `website/src/app/api/chat/conversations/route.ts` | GET |
| `website/src/app/api/chat/conversations/direct/route.ts` | POST |
| `website/src/app/api/chat/conversations/group/route.ts` | POST |
| `website/src/app/api/chat/conversations/[id]/messages/route.ts` | GET + POST |
| `website/src/app/api/chat/conversations/[id]/read/route.ts` | POST |
| `website/src/lib/chat-guard.ts` | Helper partagé |

### Helper partagé — `website/src/lib/chat-guard.ts`

Ce helper centralise le double guard pour éviter la duplication :

```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { isStandardOrExpert } from "@/lib/license-access"
import { apiError } from "@/lib/api-response"
import type { JWTPayload } from "@/lib/jwt"

// Récupère la licence de l'utilisateur depuis la DB
async function getUserLicense(userId: number): Promise<string | null> {
  // La licence est stockée en t_parametre Section=license Mot_Cle=edition,
  // ou on peut interroger directement. Selon le pattern existant dans
  // website/src/lib/license-server.ts:
  const { getLicenseForUser } = await import("@/lib/license-server")
  return getLicenseForUser(userId)
}

export type ChatGuardResult =
  | { ok: true }
  | { ok: false; response: NextResponse }

export async function checkChatAccess(user: JWTPayload): Promise<ChatGuardResult> {
  // 1. Vérification licence
  const license = await getUserLicense(user.userId)
  if (!isStandardOrExpert(license)) {
    return {
      ok: false,
      response: apiError(403, "license_insufficient", "Licence Standard ou Expert requise"),
    }
  }

  // 2. Vérification module activé
  const setting = await prisma.t_parametre.findFirst({
    where: { Section: "messaging", Mot_Cle: "enabled" },
    select: { Valeur: true },
  })
  const enabled = setting ? setting.Valeur === "true" : true
  if (!enabled) {
    return {
      ok: false,
      response: apiError(403, "messaging_disabled", "La messagerie est désactivée"),
    }
  }

  return { ok: true }
}

// Vérifie que userId est bien participant de la conversation
export async function verifyParticipant(
  conversationId: number,
  userId: number,
): Promise<boolean> {
  const { prismaChat } = await import("@/lib/prisma-chat")
  const participant = await prismaChat.t_conversation_participant.findUnique({
    where: {
      Id_Conversation_Id_Utilisateur: {
        Id_Conversation: conversationId,
        Id_Utilisateur: userId,
      },
    },
  })
  return participant !== null
}
```

Note importante : `getLicenseForUser` est à adapter selon ce que fait `website/src/lib/license-server.ts`. Si cette fonction n'existe pas, lire directement `t_licence` ou le champ correspondant. Adapter l'import en conséquence.

### 4.1 — `GET /api/chat/unread-count`

```typescript
// website/src/app/api/chat/unread-count/route.ts
import { NextRequest } from "next/server"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiOk } from "@/lib/api-response"
import { prismaChat } from "@/lib/prisma-chat"
import { checkChatAccess } from "@/lib/chat-guard"

export const GET = withAuthLogging(async (req: NextRequest, { user }) => {
  const guard = await checkChatAccess(user)
  if (!guard.ok) return guard.response

  // Compter les conversations où il y a des messages plus récents que Last_Read_Msg_Id
  const participants = await prismaChat.t_conversation_participant.findMany({
    where: { Id_Utilisateur: user.userId },
    select: { Id_Conversation: true, Last_Read_Msg_Id: true },
  })

  let count = 0
  for (const p of participants) {
    const lastMsg = await prismaChat.t_message.findFirst({
      where: {
        Id_Conversation: p.Id_Conversation,
        Date_Suppression: null,
        ...(p.Last_Read_Msg_Id ? { Id_Message: { gt: p.Last_Read_Msg_Id } } : {}),
        // Exclure les messages envoyés par soi-même
        NOT: { Sender_Id: user.userId },
      },
      orderBy: { Id_Message: "desc" },
      select: { Id_Message: true },
    })
    if (lastMsg) count++
  }

  return apiOk({ count })
})
```

### 4.2 — `GET /api/chat/conversations`

Retourne les conversations avec `lastMessage`, `unreadCount`, enrichies des infos utilisateur depuis `db-main`.

```typescript
// website/src/app/api/chat/conversations/route.ts
import { NextRequest } from "next/server"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiOk } from "@/lib/api-response"
import { prismaChat } from "@/lib/prisma-chat"
import { prisma } from "@/lib/prisma"
import { checkChatAccess } from "@/lib/chat-guard"
import { getInitialsForAvatar, resolveAvatarSrc } from "@/lib/avatar-library"
import { getUserAvatarMap } from "@/lib/user-avatar-db"

export const GET = withAuthLogging(async (req: NextRequest, { user }) => {
  const guard = await checkChatAccess(user)
  if (!guard.ok) return guard.response

  // Récupérer toutes les conversations de l'utilisateur
  const participants = await prismaChat.t_conversation_participant.findMany({
    where: { Id_Utilisateur: user.userId },
    include: {
      conversation: {
        include: {
          participants: true,
          messages: {
            where: { Date_Suppression: null },
            orderBy: { Id_Message: "desc" },
            take: 1,
          },
        },
      },
    },
  })

  // Collecter tous les Id_Utilisateur impliqués pour une requête db-main groupée
  const allUserIds = new Set<number>()
  for (const p of participants) {
    for (const cp of p.conversation.participants) {
      allUserIds.add(cp.Id_Utilisateur)
    }
  }

  const dbUsers = await prisma.t_utilisateur.findMany({
    where: { Id_Utilisateur: { in: [...allUserIds] } },
    select: { Id_Utilisateur: true, Prenom: true, Nom: true, Login: true },
  })
  const avatarMap = await getUserAvatarMap([...allUserIds])
  const userMap = new Map(dbUsers.map((u) => [u.Id_Utilisateur, u]))

  function buildUserInfo(userId: number) {
    const u = userMap.get(userId)
    if (!u) return { id: userId, name: String(userId), initials: "?", avatarSrc: null }
    const initials = getInitialsForAvatar(u.Prenom, u.Nom, u.Login)
    const avatarValue = avatarMap.get(userId) ?? null
    return {
      id: userId,
      name: `${u.Prenom ?? ""} ${u.Nom ?? ""}`.trim() || u.Login,
      initials,
      avatarSrc: resolveAvatarSrc(avatarValue, initials),
    }
  }

  const result = participants
    .map((p) => {
      const conv = p.conversation
      const lastMsg = conv.messages[0] ?? null
      const myParticipant = p

      // Compter non-lus : messages plus récents que Last_Read_Msg_Id, pas envoyés par moi
      const unreadCount = 0 // sera calculé en batch si nécessaire (simplification V1)

      // Nom de la conversation :
      // - group : conv.Titre
      // - direct : nom de l'autre participant
      let name = conv.Titre ?? ""
      let avatarInfo = null
      if (conv.Type === "direct") {
        const other = conv.participants.find((cp) => cp.Id_Utilisateur !== user.userId)
        if (other) {
          const info = buildUserInfo(other.Id_Utilisateur)
          name = info.name
          avatarInfo = info
        }
      }

      return {
        id: conv.Id_Conversation,
        type: conv.Type,
        name,
        avatar: avatarInfo,
        participants: conv.participants.map((cp) => buildUserInfo(cp.Id_Utilisateur)),
        lastMessage: lastMsg
          ? {
              id: lastMsg.Id_Message,
              senderId: lastMsg.Sender_Id,
              contenu: lastMsg.Date_Suppression ? null : lastMsg.Contenu,
              deleted: !!lastMsg.Date_Suppression,
              createdAt: lastMsg.Date_Creation,
            }
          : null,
        lastReadMsgId: myParticipant.Last_Read_Msg_Id,
        unreadCount,
        dateCreation: conv.Date_Creation,
      }
    })
    // Trier par date du dernier message décroissante
    .sort((a, b) => {
      const dateA = a.lastMessage?.createdAt ?? a.dateCreation
      const dateB = b.lastMessage?.createdAt ?? b.dateCreation
      return dateB.getTime() - dateA.getTime()
    })

  return apiOk(result)
})
```

Note V1 : `unreadCount` est mis à 0 ici pour simplicité. Le client peut calculer l'état "non lu" en comparant `lastMessage.id > lastReadMsgId`. Une implémentation plus précise peut être faite si nécessaire.

### 4.3 — `POST /api/chat/conversations/direct`

```typescript
// website/src/app/api/chat/conversations/direct/route.ts
import { NextRequest } from "next/server"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiOk, apiError } from "@/lib/api-response"
import { prismaChat } from "@/lib/prisma-chat"
import { checkChatAccess } from "@/lib/chat-guard"
import { z } from "zod"

const schema = z.object({
  targetUserId: z.number().int().positive(),
})

export const POST = withAuthLogging(async (req: NextRequest, { user }) => {
  const guard = await checkChatAccess(user)
  if (!guard.ok) return guard.response

  let body: unknown
  try { body = await req.json() } catch { return apiError(400, "invalid_json", "JSON invalide") }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return apiError(400, "validation_error", parsed.error.message)

  const { targetUserId } = parsed.data

  if (targetUserId === user.userId) {
    return apiError(400, "self_message", "Impossible de se envoyer un message à soi-même")
  }

  // DM_Key : userId trié pour déduplication
  const dmKey = [user.userId, targetUserId].sort((a, b) => a - b).join("_")

  // Créer ou retrouver la conversation existante
  let conv = await prismaChat.t_conversation.findUnique({ where: { DM_Key: dmKey } })

  if (!conv) {
    conv = await prismaChat.t_conversation.create({
      data: {
        Type: "direct",
        DM_Key: dmKey,
        participants: {
          create: [
            { Id_Utilisateur: user.userId },
            { Id_Utilisateur: targetUserId },
          ],
        },
      },
    })
  }

  return apiOk({ id: conv.Id_Conversation, type: conv.Type, dmKey: conv.DM_Key })
})
```

### 4.4 — `POST /api/chat/conversations/group`

```typescript
// website/src/app/api/chat/conversations/group/route.ts
import { NextRequest } from "next/server"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiOk, apiError } from "@/lib/api-response"
import { prismaChat } from "@/lib/prisma-chat"
import { checkChatAccess } from "@/lib/chat-guard"
import { z } from "zod"

const schema = z.object({
  titre: z.string().trim().min(1).max(128),
  participantIds: z.array(z.number().int().positive()).min(1).max(50),
})

export const POST = withAuthLogging(async (req: NextRequest, { user }) => {
  const guard = await checkChatAccess(user)
  if (!guard.ok) return guard.response

  let body: unknown
  try { body = await req.json() } catch { return apiError(400, "invalid_json", "JSON invalide") }

  const parsed = schema.safeParse(body)
  if (!parsed.success) return apiError(400, "validation_error", parsed.error.message)

  const { titre, participantIds } = parsed.data

  // S'assurer que le créateur est inclus
  const allParticipants = [...new Set([user.userId, ...participantIds])]

  const conv = await prismaChat.t_conversation.create({
    data: {
      Type: "group",
      Titre: titre,
      participants: {
        create: allParticipants.map((id) => ({ Id_Utilisateur: id })),
      },
    },
  })

  return apiOk({ id: conv.Id_Conversation, type: conv.Type, titre: conv.Titre })
})
```

### 4.5 — `GET + POST /api/chat/conversations/[id]/messages`

```typescript
// website/src/app/api/chat/conversations/[id]/messages/route.ts
import { NextRequest } from "next/server"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiOk, apiError } from "@/lib/api-response"
import { prismaChat } from "@/lib/prisma-chat"
import { prisma } from "@/lib/prisma"
import { checkChatAccess, verifyParticipant } from "@/lib/chat-guard"
import { getUserAvatarMap } from "@/lib/user-avatar-db"
import { getInitialsForAvatar, resolveAvatarSrc } from "@/lib/avatar-library"
import { z } from "zod"

type RouteContext = { params: Promise<{ id: string }> }

export const GET = withAuthLogging(async (req: NextRequest, { user }, ctx: RouteContext) => {
  const guard = await checkChatAccess(user)
  if (!guard.ok) return guard.response

  const { id } = await ctx.params
  const convId = parseInt(id, 10)
  if (isNaN(convId)) return apiError(400, "invalid_id", "ID invalide")

  if (!(await verifyParticipant(convId, user.userId))) {
    return apiError(403, "not_participant", "Accès refusé")
  }

  const url = new URL(req.url)
  const cursor = parseInt(url.searchParams.get("cursor") ?? "0", 10)
  const take = 50

  const messages = await prismaChat.t_message.findMany({
    where: {
      Id_Conversation: convId,
      ...(cursor > 0 ? { Id_Message: { lt: cursor } } : {}),
    },
    orderBy: { Id_Message: "desc" },
    take,
  })

  // Enrichir avec les infos utilisateurs (db-main)
  const senderIds = [...new Set(messages.map((m) => m.Sender_Id))]
  const dbUsers = await prisma.t_utilisateur.findMany({
    where: { Id_Utilisateur: { in: senderIds } },
    select: { Id_Utilisateur: true, Prenom: true, Nom: true, Login: true },
  })
  const avatarMap = await getUserAvatarMap(senderIds)
  const userMap = new Map(dbUsers.map((u) => [u.Id_Utilisateur, u]))

  const enriched = messages.reverse().map((m) => {
    const u = userMap.get(m.Sender_Id)
    const initials = u ? getInitialsForAvatar(u.Prenom, u.Nom, u.Login) : "?"
    const avatarValue = avatarMap.get(m.Sender_Id) ?? null
    return {
      id: m.Id_Message,
      conversationId: m.Id_Conversation,
      senderId: m.Sender_Id,
      senderName: u ? `${u.Prenom ?? ""} ${u.Nom ?? ""}`.trim() || u.Login : String(m.Sender_Id),
      senderInitials: initials,
      senderAvatarSrc: resolveAvatarSrc(avatarValue, initials),
      contenu: m.Date_Suppression ? null : m.Contenu,
      deleted: !!m.Date_Suppression,
      edited: !!m.Date_Modification,
      createdAt: m.Date_Creation,
    }
  })

  const nextCursor = messages.length === take ? messages[0]?.Id_Message : undefined

  return apiOk({ messages: enriched, nextCursor })
})

const postSchema = z.object({
  contenu: z.string().trim().min(1).max(10_000),
})

export const POST = withAuthLogging(async (req: NextRequest, { user }, ctx: RouteContext) => {
  const guard = await checkChatAccess(user)
  if (!guard.ok) return guard.response

  const { id } = await ctx.params
  const convId = parseInt(id, 10)
  if (isNaN(convId)) return apiError(400, "invalid_id", "ID invalide")

  if (!(await verifyParticipant(convId, user.userId))) {
    return apiError(403, "not_participant", "Accès refusé")
  }

  let body: unknown
  try { body = await req.json() } catch { return apiError(400, "invalid_json", "JSON invalide") }

  const parsed = postSchema.safeParse(body)
  if (!parsed.success) return apiError(400, "validation_error", parsed.error.message)

  const msg = await prismaChat.t_message.create({
    data: {
      Id_Conversation: convId,
      Sender_Id: user.userId,
      Contenu: parsed.data.contenu,
    },
  })

  return apiOk({
    id: msg.Id_Message,
    conversationId: msg.Id_Conversation,
    senderId: msg.Sender_Id,
    contenu: msg.Contenu,
    deleted: false,
    edited: false,
    createdAt: msg.Date_Creation,
  })
})
```

### 4.6 — `POST /api/chat/conversations/[id]/read`

```typescript
// website/src/app/api/chat/conversations/[id]/read/route.ts
import { NextRequest, NextResponse } from "next/server"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError } from "@/lib/api-response"
import { prismaChat } from "@/lib/prisma-chat"
import { checkChatAccess, verifyParticipant } from "@/lib/chat-guard"

type RouteContext = { params: Promise<{ id: string }> }

export const POST = withAuthLogging(async (req: NextRequest, { user }, ctx: RouteContext) => {
  const guard = await checkChatAccess(user)
  if (!guard.ok) return guard.response

  const { id } = await ctx.params
  const convId = parseInt(id, 10)
  if (isNaN(convId)) return apiError(400, "invalid_id", "ID invalide")

  if (!(await verifyParticipant(convId, user.userId))) {
    return apiError(403, "not_participant", "Accès refusé")
  }

  // Trouver le dernier message de la conversation
  const lastMsg = await prismaChat.t_message.findFirst({
    where: { Id_Conversation: convId },
    orderBy: { Id_Message: "desc" },
    select: { Id_Message: true },
  })

  if (lastMsg) {
    await prismaChat.t_conversation_participant.update({
      where: {
        Id_Conversation_Id_Utilisateur: {
          Id_Conversation: convId,
          Id_Utilisateur: user.userId,
        },
      },
      data: { Last_Read_Msg_Id: lastMsg.Id_Message },
    })
  }

  return new NextResponse(null, { status: 204 })
})
```

**4.7 — Vérification TypeScript**
```bash
npx tsc --noEmit
```

**Commit :** `feat(chat): add 7 API routes for messaging (conversations, messages, read, unread-count)`

---

## Tâche 5 — Hooks client : `useMessagingEnabled` + `useUnreadCount`

### Fichiers à créer

| Fichier | But |
|---------|-----|
| `website/src/hooks/useMessagingEnabled.ts` | Combine license check + setting |
| `website/src/hooks/useUnreadCount.ts` | Polling toutes les 10 s |

### 5.1 — `website/src/hooks/useMessagingEnabled.ts`

```typescript
import { useQuery } from "@tanstack/react-query"
import { getJson, isAuthDisconnected } from "@/lib/http"
import { useLicense } from "@/components/license/license-provider"
import { isStandardOrExpert } from "@/lib/license-access"

type MessagingEnabledResponse = { enabled: boolean }

export function useMessagingEnabled(): boolean {
  const { license, loading: licenseLoading } = useLicense()
  const hasLicense = isStandardOrExpert(license)

  const { data } = useQuery<MessagingEnabledResponse>({
    queryKey: ["settings", "messaging-enabled"],
    queryFn: () => getJson<MessagingEnabledResponse>("/api/settings/messaging-enabled"),
    // Seulement si la licence est OK et qu'on est connecté
    enabled: hasLicense && !licenseLoading && !isAuthDisconnected(),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false,
  })

  if (!hasLicense) return false
  // Défaut optimiste : true tant que la réponse n'est pas arrivée
  return data?.enabled ?? true
}
```

### 5.2 — `website/src/hooks/useUnreadCount.ts`

```typescript
import { useQuery } from "@tanstack/react-query"
import { getJson, isAuthDisconnected } from "@/lib/http"
import { useMessagingEnabled } from "@/hooks/useMessagingEnabled"

type UnreadCountResponse = { count: number }

export function useUnreadCount(): number {
  const messagingEnabled = useMessagingEnabled()

  const { data } = useQuery<UnreadCountResponse>({
    queryKey: ["chat", "unread-count"],
    queryFn: () => getJson<UnreadCountResponse>("/api/chat/unread-count"),
    enabled: messagingEnabled && !isAuthDisconnected(),
    refetchInterval: 10_000,
    staleTime: 0,
    retry: false,
  })

  return data?.count ?? 0
}
```

**5.3 — Vérification TypeScript**
```bash
npx tsc --noEmit
```

**Commit :** `feat(chat): add useMessagingEnabled and useUnreadCount hooks`

---

## Tâche 6 — Bell icon dans `PageHeaderBase`

### But

Ajouter un `BellButton` entre `<LanguageSwitcher />` et `<ThemeToggle />`, visible uniquement si le module est actif.

### Fichiers à créer / modifier

| Fichier | Action |
|---------|--------|
| `website/src/components/messaging/bell-button.tsx` | Créer |
| `website/src/components/page-header-base.tsx` | Modifier |

### 6.1 — `website/src/components/messaging/bell-button.tsx`

Ce composant est 100% client (`"use client"`). Il utilise `Popover` de shadcn/ui.

```typescript
"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { useTranslations } from "next-intl"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useUnreadCount } from "@/hooks/useUnreadCount"
import { getJson } from "@/lib/http"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/date-display"  // ou implémentation locale

// Type correspondant à ce que retourne GET /api/chat/conversations
type ConversationSummary = {
  id: number
  type: "direct" | "group"
  name: string
  avatar: { initials: string; avatarSrc: string | null } | null
  lastMessage: {
    id: number
    senderId: number
    contenu: string | null
    deleted: boolean
    createdAt: string
  } | null
  lastReadMsgId: number | null
}

function isUnread(conv: ConversationSummary, currentUserId?: number): boolean {
  if (!conv.lastMessage) return false
  if (conv.lastMessage.senderId === currentUserId) return false
  if (!conv.lastReadMsgId) return true
  return conv.lastMessage.id > conv.lastReadMsgId
}

export function BellButton({ currentUserId }: { currentUserId?: number }) {
  const t = useTranslations("messaging")
  const unreadCount = useUnreadCount()
  const [open, setOpen] = useState(false)

  const { data: conversations } = useQuery<ConversationSummary[]>({
    queryKey: ["chat", "conversations"],
    queryFn: () => getJson<ConversationSummary[]>("/api/chat/conversations"),
    enabled: open, // ne charge que quand le popover est ouvert
    staleTime: 10_000,
  })

  // Filtrer les 5 conversations avec des non-lus
  const unreadConvs = (conversations ?? [])
    .filter((c) => isUnread(c, currentUserId))
    .slice(0, 5)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={t("bell.tooltip")}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-sm">{t("bell.title")}</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground">
              {t("bell.mark_all_read")}
            </Button>
          )}
        </div>

        {/* Liste */}
        {unreadConvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
            <Bell className="h-8 w-8 opacity-30" />
            <p className="text-sm">{t("bell.empty")}</p>
          </div>
        ) : (
          <ScrollArea className="max-h-72">
            <div className="py-1">
              {unreadConvs.map((conv, index) => (
                <div key={conv.id}>
                  <Link
                    href={`/messages?conv=${conv.id}` as any}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <Avatar className="h-9 w-9 shrink-0 mt-0.5">
                      {conv.avatar?.avatarSrc && (
                        <AvatarImage src={conv.avatar.avatarSrc} />
                      )}
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                        {conv.avatar?.initials ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate flex-1">{conv.name}</p>
                        {conv.lastMessage && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {/* formatRelativeTime ou date-fns formatDistanceToNow */}
                            {new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage?.contenu && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {conv.lastMessage.contenu}
                        </p>
                      )}
                    </div>
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" aria-hidden />
                  </Link>
                  {index < unreadConvs.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        <Separator />
        <div className="px-4 py-2">
          <Link
            href="/messages"
            onClick={() => setOpen(false)}
            className="text-xs text-primary hover:underline font-medium"
          >
            {t("bell.view_all")}
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
```

Note : `Popover`, `ScrollArea`, `Separator` sont tous présents dans `website/src/components/ui/` (vérifiés).

### 6.2 — Modifier `website/src/components/page-header-base.tsx`

Le composant `PageHeaderBase` est côté server (pas de `"use client"`). Pour injecter `BellButton` (client), il faut passer le `currentUserId` depuis le parent, ou rendre `PageHeaderBase` client, ou utiliser un slot.

Stratégie recommandée : passer `currentUserId` en prop optionnel, et importer `BellButton` avec `dynamic` pour éviter le SSR sur le composant client.

```typescript
// Ajouter dans les imports de page-header-base.tsx :
import dynamic from "next/dynamic"
import { useMessagingEnabled } from "@/hooks/useMessagingEnabled"

const BellButton = dynamic(
  () => import("@/components/messaging/bell-button").then((m) => m.BellButton),
  { ssr: false }
)

// Ajouter dans l'interface PageHeaderProps :
interface PageHeaderProps {
  // ...props existants...
  currentUserId?: number
}

// Dans le JSX, remplacer l'ordre existant :
// Avant : <LanguageSwitcher /> <ThemeToggle />
// Après :
<div className="flex items-center gap-2">
  {/* ...alertes alarmes existantes... */}
  <MessagingBellWrapper currentUserId={currentUserId} />
  <LanguageSwitcher />
  <ThemeToggle />
</div>
```

Créer un composant wrapper interne :

```typescript
// Composant wrapper à l'intérieur du fichier page-header-base.tsx (ou dans messaging/bell-wrapper.tsx)
"use client"
function MessagingBellWrapper({ currentUserId }: { currentUserId?: number }) {
  const messagingEnabled = useMessagingEnabled()
  if (!messagingEnabled) return null
  return <BellButton currentUserId={currentUserId} />
}
```

Puisque `page-header-base.tsx` n'a pas `"use client"` actuellement, la bonne approche est de créer `MessagingBellWrapper` dans un fichier séparé `"use client"` et de l'importer dans le header. Cela garde `PageHeaderBase` comme Server Component si besoin.

Alternative plus simple : marquer `PageHeaderBase` lui-même en `"use client"` (il utilise déjà `useTranslations`, `usePathname` — donc c'est déjà un client component). Vérifier dans le fichier existant : oui, il utilise `useTranslations` et `usePathname` donc c'est déjà un composant client. L'import direct fonctionne.

**6.3 — Vérification TypeScript**
```bash
npx tsc --noEmit
```

**Commit :** `feat(chat): add BellButton with popover in PageHeaderBase`

---

## Tâche 7 — Navigation : `AppSidebar` + `AdminSidebar`

### But

Ajouter un lien "Messagerie" conditionnel dans les deux sidebars avec badge non-lus.

### Fichiers à modifier

- `website/src/components/app-sidebar.tsx`
- `website/src/components/admin-sidebar.tsx`

### 7.1 — Modifier `website/src/components/app-sidebar.tsx`

**Imports à ajouter :**
```typescript
import { MessageSquare } from "lucide-react"
import { useMessagingEnabled } from "@/hooks/useMessagingEnabled"
import { useUnreadCount } from "@/hooks/useUnreadCount"
```

**Dans le composant `AppSidebar`, après les hooks existants :**
```typescript
const messagingEnabled = useMessagingEnabled()
const messagingUnread = useUnreadCount()
```

**Modifier l'interface `NavItem` pour accepter `/messages` :**
```typescript
interface NavItem {
  href: "/" | "/surveillance" | "/alarmes" | "/profil" | "/admin" | "/messages"
  // ...reste identique
}
```

**Dans le JSX, entre le groupe "Navigation" et le groupe "Administration" (ou entre alarmes et mon compte selon la position désirée), ajouter le rendu conditionnel :**

La position requise est entre "Alarmes" et "Mon compte". Puisque le groupe navigation contient `mainNavItems` et le groupe mon_compte contient `moncompteNavItems`, insérer entre les deux groups :

```typescript
{/* Messagerie — visible uniquement si Standard/Expert + module activé */}
{messagingEnabled && (
  <SidebarGroup>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive("/messages")}
            tooltip={tSidebar("messaging")}
          >
            <Link
              href="/messages"
              data-testid="nav-messages"
              onClick={() => { if (isMobile) setOpenMobile(false) }}
            >
              <MessageSquare className="h-4 w-4" />
              <span className="flex-1">{tSidebar("messaging")}</span>
              {messagingUnread > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-auto h-5 min-w-5 px-1.5 text-xs"
                >
                  {messagingUnread}
                </Badge>
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
)}
```

### 7.2 — Modifier `website/src/components/admin-sidebar.tsx`

**Imports à ajouter :**
```typescript
import { MessageSquare } from "lucide-react"
import { useMessagingEnabled } from "@/hooks/useMessagingEnabled"
import { useUnreadCount } from "@/hooks/useUnreadCount"
```

**Dans le composant `AdminSidebar`, après les hooks existants :**
```typescript
const messagingEnabled = useMessagingEnabled()
const messagingUnread = useUnreadCount()
```

**Modifier `managementNavItems` pour insérer conditionnellement :**

Au lieu de modifier le tableau statique (qui ne peut pas utiliser de hook), construire le tableau avec le lien messaging conditionnel après le hook :

```typescript
const managementNavItems: Array<NavItem & { badge?: number; badgeVariant?: "default" | "destructive" }> = [
  { title: t("management.profiles"), href: "/admin/profils", icon: Lock },
  { title: t("management.users"), href: "/admin/utilisateurs", icon: Users },
  {
    title: t("management.alarms"),
    href: "/admin/alarmes",
    icon: Bell,
    badge: activeAlarms > 0 ? activeAlarms : undefined,
    badgeVariant: "destructive",
  },
  // Messagerie insérée ici conditionnellement :
  ...(messagingEnabled
    ? [{
        title: t("management.messaging"),
        href: "/admin/messages",  // ou "/messages" selon la décision de routing
        icon: MessageSquare,
        badge: messagingUnread > 0 ? messagingUnread : undefined,
        badgeVariant: "destructive" as const,
      }]
    : []),
  { title: t("management.audit"), href: "/admin/audit", icon: FileText },
]
```

Note : Ajouter la clé `"messaging"` dans `adminSidebar.management` en i18n (déjà fait en tâche 2).

**7.3 — Ajouter `/messages` dans i18n routing**

Dans `website/src/i18n/routing.ts`, ajouter dans `pathnames` :

```typescript
'/messages': {
  fr: '/messages',
  en: '/messages',
},
```

**7.4 — Vérification TypeScript**
```bash
npx tsc --noEmit
```

**Commit :** `feat(chat): add Messagerie nav item in AppSidebar and AdminSidebar`

---

## Tâche 8 — Page `/messages`

### But

Créer la page de messagerie en deux colonnes avec liste des conversations, fil de messages, et modal de création.

### Fichiers à créer

| Fichier | But |
|---------|-----|
| `website/src/app/[locale]/(dashboard)/messages/page.tsx` | Page principale |
| `website/src/app/[locale]/(dashboard)/messages/_components/conversation-list.tsx` | Colonne gauche |
| `website/src/app/[locale]/(dashboard)/messages/_components/message-thread.tsx` | Colonne droite |
| `website/src/app/[locale]/(dashboard)/messages/_components/new-conversation-modal.tsx` | Modal création |
| `website/src/app/[locale]/(dashboard)/messages/_components/message-input.tsx` | Zone saisie |

### 8.1 — `page.tsx`

```typescript
"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useMessagingEnabled } from "@/hooks/useMessagingEnabled"
import { getJson, postJson } from "@/lib/http"
import { ConversationList } from "./_components/conversation-list"
import { MessageThread } from "./_components/message-thread"
import { NewConversationModal } from "./_components/new-conversation-modal"

export default function MessagesPage() {
  const t = useTranslations("messaging")
  const router = useRouter()
  const searchParams = useSearchParams()
  const messagingEnabled = useMessagingEnabled()
  const qc = useQueryClient()

  const [selectedConvId, setSelectedConvId] = useState<number | null>(
    () => {
      const conv = searchParams.get("conv")
      return conv ? parseInt(conv, 10) : null
    }
  )
  const [newConvOpen, setNewConvOpen] = useState(false)

  // Redirection si module désactivé
  useEffect(() => {
    if (!messagingEnabled) router.replace("/")
  }, [messagingEnabled, router])

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ["chat", "conversations"],
    queryFn: () => getJson<ConversationSummary[]>("/api/chat/conversations"),
    refetchInterval: 10_000,
    enabled: messagingEnabled,
  })

  const readMutation = useMutation({
    mutationFn: (convId: number) => postJson<void>(`/api/chat/conversations/${convId}/read`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat", "unread-count"] })
      qc.invalidateQueries({ queryKey: ["chat", "conversations"] })
    },
  })

  const handleSelectConv = (convId: number) => {
    setSelectedConvId(convId)
    readMutation.mutate(convId)
  }

  if (!messagingEnabled) return null

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Colonne gauche */}
      <aside className="w-80 shrink-0 border-r flex flex-col bg-background">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h1 className="font-semibold text-sm">{t("page.title")}</h1>
          <button
            onClick={() => setNewConvOpen(true)}
            className="text-primary hover:text-primary/80 text-xl font-light leading-none"
            aria-label={t("conversations.new")}
          >
            +
          </button>
        </div>
        <ConversationList
          conversations={conversations}
          isLoading={isLoading}
          selectedId={selectedConvId}
          onSelect={handleSelectConv}
        />
      </aside>

      {/* Colonne droite */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {selectedConvId ? (
          <MessageThread conversationId={selectedConvId} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <p className="text-sm">{t("thread.empty_state")}</p>
          </div>
        )}
      </main>

      <NewConversationModal
        open={newConvOpen}
        onOpenChange={setNewConvOpen}
        onCreated={(convId) => {
          setNewConvOpen(false)
          handleSelectConv(convId)
          qc.invalidateQueries({ queryKey: ["chat", "conversations"] })
        }}
      />
    </div>
  )
}
```

### 8.2 — `conversation-list.tsx`

```typescript
"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type Props = {
  conversations: ConversationSummary[]
  isLoading: boolean
  selectedId: number | null
  onSelect: (id: number) => void
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  if (isToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  return date.toLocaleDateString([], { day: "2-digit", month: "short" })
}

export function ConversationList({ conversations, isLoading, selectedId, onSelect }: Props) {
  const t = useTranslations("messaging")
  const [search, setSearch] = useState("")

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="p-3 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="px-3 py-2 border-b">
        <Input
          placeholder={t("conversations.search_placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
      </div>

      <ScrollArea className="flex-1">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            {t("conversations.empty_list")}
          </div>
        ) : (
          <div className="py-1">
            {filtered.map((conv) => {
              const isActive = conv.id === selectedId
              const hasUnread = conv.lastMessage && conv.lastReadMsgId !== null
                ? conv.lastMessage.id > (conv.lastReadMsgId ?? -1)
                : !!conv.lastMessage && !conv.lastReadMsgId
              const preview = conv.lastMessage?.deleted
                ? t("conversations.deleted_message")
                : conv.lastMessage?.contenu ?? ""

              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors",
                    isActive && "bg-muted"
                  )}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    {conv.avatar?.avatarSrc && <AvatarImage src={conv.avatar.avatarSrc} />}
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {conv.avatar?.initials ?? "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("text-sm truncate flex-1", hasUnread && "font-semibold")}>
                        {conv.name}
                      </span>
                      {conv.type === "group" && (
                        <Badge variant="secondary" className="text-xs h-4 px-1 shrink-0">
                          {t("conversations.group_badge")}
                        </Badge>
                      )}
                      {conv.lastMessage && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTime(conv.lastMessage.createdAt as unknown as string)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "text-xs text-muted-foreground truncate flex-1",
                        conv.lastMessage?.deleted && "italic"
                      )}>
                        {preview}
                      </p>
                      {hasUnread && (
                        <div className="h-2 w-2 rounded-full bg-primary shrink-0" aria-hidden />
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </>
  )
}
```

### 8.3 — `message-thread.tsx`

Structure JSX principale :

```typescript
"use client"

import { useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageInput } from "./message-input"
import { getJson, postJson } from "@/lib/http"
import { cn } from "@/lib/utils"
import { useCurrentUser } from "@/hooks/useCurrentUser"

// Types locaux
type MessageItem = {
  id: number
  senderId: number
  senderName: string
  senderInitials: string
  senderAvatarSrc: string | null
  contenu: string | null
  deleted: boolean
  edited: boolean
  createdAt: string
}

type MessagePage = { messages: MessageItem[]; nextCursor?: number }

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

function getDateLabel(dateStr: string, t: ReturnType<typeof useTranslations>): string {
  const date = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86_400_000)
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (msgDate.getTime() === today.getTime()) return t("time.date_separator_today")
  if (msgDate.getTime() === yesterday.getTime()) return t("time.date_separator_yesterday")
  return date.toLocaleDateString([], { day: "2-digit", month: "long", year: "numeric" })
}

export function MessageThread({ conversationId }: { conversationId: number }) {
  const t = useTranslations("messaging")
  const { data: currentUser } = useCurrentUser()
  const qc = useQueryClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  const isFirstLoad = useRef(true)

  const { data, isLoading } = useQuery<MessagePage>({
    queryKey: ["chat", "messages", conversationId],
    queryFn: () => getJson<MessagePage>(`/api/chat/conversations/${conversationId}/messages`),
    refetchInterval: 10_000,
  })

  // Auto-scroll vers le bas lors du premier chargement et des nouveaux messages
  useEffect(() => {
    if (!scrollRef.current) return
    if (isFirstLoad.current && data?.messages.length) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      isFirstLoad.current = false
    }
  }, [data?.messages.length])

  const sendMutation = useMutation({
    mutationFn: (contenu: string) =>
      postJson<MessageItem>(`/api/chat/conversations/${conversationId}/messages`, { contenu }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["chat", "messages", conversationId] })
      qc.invalidateQueries({ queryKey: ["chat", "conversations"] })
      // Scroll vers le bas après envoi
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }, 100)
    },
  })

  const messages = data?.messages ?? []

  // Grouper messages par date pour les séparateurs
  const groups: Array<{ dateLabel: string; messages: MessageItem[] }> = []
  let currentLabel = ""
  for (const msg of messages) {
    const label = getDateLabel(msg.createdAt, t)
    if (label !== currentLabel) {
      currentLabel = label
      groups.push({ dateLabel: label, messages: [msg] })
    } else {
      groups[groups.length - 1].messages.push(msg)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Zone messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
      >
        {isLoading && (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={cn("flex gap-3", i % 3 === 0 && "flex-row-reverse")}>
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <Skeleton className={cn("h-10 rounded-2xl", i % 3 === 0 ? "w-48" : "w-64")} />
              </div>
            ))}
          </div>
        )}

        {groups.map((group) => (
          <div key={group.dateLabel}>
            <DateSeparator label={group.dateLabel} />
            {group.messages.map((msg) => {
              const isOwn = msg.senderId === currentUser?.id
              return (
                <div
                  key={msg.id}
                  className={cn("flex gap-2 mb-2", isOwn ? "flex-row-reverse" : "flex-row")}
                >
                  {!isOwn && (
                    <Avatar className="h-7 w-7 shrink-0 mt-1">
                      {msg.senderAvatarSrc && <AvatarFallback>{msg.senderInitials}</AvatarFallback>}
                      <AvatarFallback className="text-xs">{msg.senderInitials}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn("flex flex-col max-w-[70%]", isOwn ? "items-end" : "items-start")}>
                    {!isOwn && (
                      <span className="text-xs text-muted-foreground mb-0.5 ml-1">{msg.senderName}</span>
                    )}
                    <div
                      className={cn(
                        "px-3 py-2 text-sm",
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-2xl rounded-br-sm"
                          : "bg-muted text-foreground rounded-2xl rounded-bl-sm",
                        msg.deleted && "italic opacity-60"
                      )}
                    >
                      {msg.deleted
                        ? t("conversations.deleted_message")
                        : msg.contenu}
                    </div>
                    {msg.edited && !msg.deleted && (
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {t("conversations.edited_label")}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Zone saisie */}
      <MessageInput
        onSend={(text) => sendMutation.mutate(text)}
        isSending={sendMutation.isPending}
      />
    </div>
  )
}
```

### 8.4 — `message-input.tsx`

```typescript
"use client"

import { useRef, useState, KeyboardEvent } from "react"
import { useTranslations } from "next-intl"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  onSend: (text: string) => void
  isSending: boolean
}

export function MessageInput({ onSend, isSending }: Props) {
  const t = useTranslations("messaging")
  const [text, setText] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || isSending) return
    onSend(trimmed)
    setText("")
    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    // Auto-resize
    const el = e.target
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 96)}px` // max ~4 lignes
  }

  return (
    <div className="border-t px-4 py-3 bg-background flex items-end gap-2">
      <Textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={t("thread.input_placeholder")}
        className="resize-none min-h-10 max-h-24 text-sm"
        rows={1}
        disabled={isSending}
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!text.trim() || isSending}
        className="shrink-0 h-10 w-10"
        aria-label={t("thread.send")}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

### 8.5 — `new-conversation-modal.tsx`

```typescript
"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useQuery } from "@tanstack/react-query"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { X } from "lucide-react"
import { getJson, postJson } from "@/lib/http"
import { getInitialsForAvatar } from "@/lib/avatar-library"

type UserOption = {
  id: number
  name: string
  login: string
  initials: string
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (convId: number) => void
}

export function NewConversationModal({ open, onOpenChange, onCreated }: Props) {
  const t = useTranslations("messaging")
  const [tab, setTab] = useState<"direct" | "group">("direct")
  const [directSearch, setDirectSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null)
  const [groupTitle, setGroupTitle] = useState("")
  const [groupSearch, setGroupSearch] = useState("")
  const [groupMembers, setGroupMembers] = useState<UserOption[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const { data: allUsers = [] } = useQuery<UserOption[]>({
    queryKey: ["users", "for-messaging"],
    queryFn: async () => {
      const raw = await getJson<any[]>("/api/utilisateurs")
      return raw.map((u) => ({
        id: u.id,
        name: `${u.prenom ?? ""} ${u.nom ?? ""}`.trim() || u.login,
        login: u.login,
        initials: getInitialsForAvatar(u.prenom, u.nom, u.login),
      }))
    },
    enabled: open,
    staleTime: 60_000,
  })

  const filteredDirect = allUsers.filter((u) =>
    (u.name + u.login).toLowerCase().includes(directSearch.toLowerCase())
  ).slice(0, 8)

  const filteredGroup = allUsers
    .filter((u) => !groupMembers.some((m) => m.id === u.id))
    .filter((u) => (u.name + u.login).toLowerCase().includes(groupSearch.toLowerCase()))
    .slice(0, 8)

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      if (tab === "direct" && selectedUser) {
        const { id } = await postJson<{ id: number }>("/api/chat/conversations/direct", {
          targetUserId: selectedUser.id,
        })
        onCreated(id)
      } else if (tab === "group" && groupTitle.trim() && groupMembers.length > 0) {
        const { id } = await postJson<{ id: number }>("/api/chat/conversations/group", {
          titre: groupTitle.trim(),
          participantIds: groupMembers.map((m) => m.id),
        })
        onCreated(id)
      }
    } finally {
      setIsCreating(false)
    }
  }

  const canCreate = tab === "direct"
    ? !!selectedUser
    : groupTitle.trim().length > 0 && groupMembers.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("new_conversation.title")}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "direct" | "group")}>
          <TabsList className="w-full">
            <TabsTrigger value="direct" className="flex-1">
              {t("new_conversation.tab_direct")}
            </TabsTrigger>
            <TabsTrigger value="group" className="flex-1">
              {t("new_conversation.tab_group")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="space-y-3 mt-4">
            <Input
              placeholder={t("new_conversation.direct_search")}
              value={directSearch}
              onChange={(e) => setDirectSearch(e.target.value)}
            />
            <ScrollArea className="h-48 rounded border">
              {filteredDirect.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{t("new_conversation.no_users")}</p>
              ) : (
                filteredDirect.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50 ${selectedUser?.id === u.id ? "bg-muted" : ""}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{u.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{u.name}</span>
                    {selectedUser?.id === u.id && (
                      <Badge variant="secondary" className="ml-auto text-xs">Sélectionné</Badge>
                    )}
                  </button>
                ))
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="group" className="space-y-3 mt-4">
            <div className="space-y-1.5">
              <Label>{t("new_conversation.group_title_label")}</Label>
              <Input
                placeholder={t("new_conversation.group_title_placeholder")}
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
              />
            </div>
            {groupMembers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {groupMembers.map((m) => (
                  <Badge key={m.id} variant="secondary" className="gap-1 pr-1">
                    {m.name}
                    <button onClick={() => setGroupMembers((prev) => prev.filter((x) => x.id !== m.id))}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <Input
              placeholder={t("new_conversation.group_members_search")}
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
            />
            <ScrollArea className="h-36 rounded border">
              {filteredGroup.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { setGroupMembers((prev) => [...prev, u]); setGroupSearch("") }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-muted/50"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">{u.initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{u.name}</span>
                </button>
              ))}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <Button onClick={handleCreate} disabled={!canCreate || isCreating} className="w-full mt-2">
          {t("new_conversation.create")}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
```

**8.6 — Types partagés**

Créer `website/src/app/[locale]/(dashboard)/messages/_types.ts` pour les types partagés entre composants :

```typescript
export type ConversationSummary = {
  id: number
  type: "direct" | "group"
  name: string
  avatar: { initials: string; avatarSrc: string | null } | null
  participants: Array<{ id: number; name: string; initials: string; avatarSrc: string | null }>
  lastMessage: {
    id: number
    senderId: number
    contenu: string | null
    deleted: boolean
    createdAt: string
  } | null
  lastReadMsgId: number | null
  dateCreation: string
}
```

**8.7 — Vérification TypeScript**
```bash
npx tsc --noEmit
```

**Commit :** `feat(chat): add messages page with two-column layout, thread, and new conversation modal`

---

## Tâche 9 — Vérification finale TypeScript + intégration

### But

S'assurer qu'il n'y a aucune erreur TypeScript et que tous les composants shadcn/ui nécessaires sont présents.

### Étapes

**9.1 — Vérification des composants shadcn/ui**

Tous les composants suivants ont été vérifiés comme présents dans `website/src/components/ui/` :
- `popover.tsx` — Oui (via @radix-ui/react-popover installé)
- `badge.tsx` — Oui
- `avatar.tsx` — Oui
- `tabs.tsx` — Oui
- `textarea.tsx` — Oui
- `scroll-area.tsx` — Oui
- `dialog.tsx` — Oui
- `input.tsx` — Oui
- `separator.tsx` — Oui

Vérifier que `popover.tsx` existe bien (c'est un composant shadcn qu'on doit avoir ajouté) :
```bash
ls website/src/components/ui/popover.tsx
```
S'il est absent : `npx shadcn@latest add popover`

**9.2 — TypeScript complet**
```bash
cd website
npx tsc --noEmit
```

Résoudre toutes les erreurs avant de continuer. Points typiques à surveiller :
- Import de `prismaChat` avant que le client soit généré
- Type `any` interdit → typer explicitement les retours des requêtes Prisma
- Le `{ params }` de type `Promise<...>` dans les route handlers Next.js 16

**9.3 — Checklist de smoke test manuel**

1. Licence Pack/One : liens Messagerie absents dans les deux sidebars, bell absente, `/messages` redirige vers `/`
2. Licence Standard + module désactivé : idem
3. Licence Standard + module activé : liens présents, bell présente
4. Créer une conversation directe : vérifier dédup DM_Key (créer 2 fois avec mêmes users = même conv)
5. Envoyer un message : apparaît dans le fil après 10 s ou immédiatement
6. Unread count : badge rouge sur sidebar et bell, disparaît après clic sur la conversation
7. Groupe : titre requis, au moins 1 autre membre, créateur auto-inclus
8. Admin parametres : toggle visible uniquement Standard/Expert, persisté dans t_parametre

**9.4 — Commit final**

```bash
git commit -m "feat(chat): messaging module V1 — complete implementation"
```

---

## Points hors scope V1 (à documenter)

| Fonctionnalité | Version | Notes |
|----------------|---------|-------|
| Pièces jointes / images | V2 | `t_message_piece_jointe` à ajouter par migration |
| Socket.IO temps réel | V2 | Windows service Node.js séparé `realtime-service` |
| Réactions / threads imbriqués | V3 | |
| Statut "en ligne" / présence | V3 | |
| Notifications push navigateur | V2 | |
| Pagination infinie (messages précédents) | V1+ | Curseur déjà préparé dans l'API, bouton "Charger plus" à brancher |
| Marquer tout comme lu (bell) | V1+ | L'API read existe, la mutation est à câbler dans `BellButton` |
| Suppression / édition de message | V2 | Champs `Date_Suppression`/`Date_Modification` prévus en schema |

---

## Récapitulatif des commits

| # | Message |
|---|---------|
| 1 | `feat(chat): add vigi_chat Prisma schema and singleton client` |
| 2 | `feat(chat): add i18n keys for messaging module` |
| 3 | `feat(chat): add messaging:enabled admin toggle + API endpoint` |
| 4 | `feat(chat): add 7 API routes for messaging` |
| 5 | `feat(chat): add useMessagingEnabled and useUnreadCount hooks` |
| 6 | `feat(chat): add BellButton with popover in PageHeaderBase` |
| 7 | `feat(chat): add Messagerie nav item in AppSidebar and AdminSidebar` |
| 8 | `feat(chat): add messages page with two-column layout` |
| 9 | `feat(chat): messaging module V1 — complete implementation` |

---

## Variables d'environnement requises

Ajouter dans `.env` (non versionné) avant de lancer la tâche 1 :

```env
DATABASE_CHAT_URL="mysql://user:password@localhost:3306/vigi_chat"
```

La base `vigi_chat` doit être créée manuellement par le DBA via le script SQL correspondant au schéma Prisma (les tables n'ont pas de migration auto — elles sont créées manuellement ou via `prisma db push --schema=./prisma/vigi-chat/schema.prisma` en dev uniquement).
```

---

### Critical Files for Implementation

- `website/src/lib/prisma.ts` - Pattern exact du singleton Proxy Prisma à reproduire pour `prisma-chat.ts`
- `website/src/app/[locale]/(admin)/admin/parametres/_components/settings-client.tsx` - Point d'intégration de `MessagingSettingsCard` et pattern du `handleToggle`
- `website/src/app/[locale]/(admin)/admin/parametres/server-settings.tsx` - À modifier pour inclure `messaging` dans les sections chargées et dans `defaultSettings`
- `website/src/components/app-sidebar.tsx` - Pattern NavItem + Badge + hook license pour dupliquer dans le lien Messagerie
- `website/src/lib/api-wrappers.ts` - Wrapper `withAuthLogging` utilisé dans toutes les API routes chat