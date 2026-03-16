# Messagerie — Sheet Détails Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Afficher les avatars des membres dans le header d'un groupe, et ouvrir un Sheet latéral au clic sur le header pour voir les détails d'une conversation (membres, infos, documents partagés) ou la fiche d'un utilisateur.

**Architecture:** Deux nouveaux composants React (`ConversationDetailsSheet`, `UserProfileSheet`) + deux nouveaux endpoints API (`/details`, `/attachments`). Le header de `message-thread.tsx` devient cliquable et intègre un stack d'avatars pour les groupes. Aucune modification de schéma DB nécessaire.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, shadcn/ui (`Sheet`, `Avatar`, `ScrollArea`), `@tanstack/react-query`, Prisma dual-DB (`prisma` pour db-main, `prismaChat` pour vigi-chat), `lucide-react`, `next-intl`

---

## Task 1 : Nouveaux types TypeScript

**Files:**
- Modify: `website/src/app/[locale]/(dashboard)/messages/_components/_types.ts`

### Step 1 : Ajouter les types `ConversationParticipant`, `ConversationDetails`, `ConversationAttachment`

À la fin du fichier `_types.ts`, ajouter :

```ts
export type ConversationParticipant = {
  id: number
  displayName: string
  username: string
  email: string | null
  avatar: string | null
  role: string | null
  phoneMobile: string | null
  phoneFixed: string | null
  createdAt: string | null
  joinedAt: string
}

export type ConversationDetails = {
  id: number
  type: "dm" | "group"
  titre: string | null
  createdAt: string
  participants: ConversationParticipant[]
}

export type ConversationAttachment = {
  id: number
  fileName: string
  mimeType: string
  size: number
  uploadedAt: string
  senderName: string
}

export type ConversationAttachmentsResponse = {
  attachments: ConversationAttachment[]
}
```

### Step 2 : Commit

```bash
git add website/src/app/[locale]/\(dashboard\)/messages/_components/_types.ts
git commit -m "feat(messaging): add ConversationDetails and ConversationAttachment types"
```

---

## Task 2 : API route GET /api/chat/conversations/[id]/details

**Files:**
- Create: `website/src/app/api/chat/conversations/[id]/details/route.ts`

### Step 1 : Créer la route

```ts
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { prismaChat } from "@/lib/prisma-chat"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { checkChatAccess, verifyParticipant } from "@/lib/chat-guard"
import { getInitialsForAvatar, resolveAvatarSrc } from "@/lib/avatar-library"
import { getUserAvatarMap } from "@/lib/user-avatar-db"
import type { JWTPayload } from "@/lib/jwt"
import { log } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string }> }

export const GET = withAuthLogging(
  async (_req: NextRequest, ctx: { user: JWTPayload }, { params }: RouteParams) => {
    try {
      const guard = await checkChatAccess()
      if (!guard.ok) return guard.response

      const { id: idParam } = await params
      const convId = parseInt(idParam, 10)
      if (isNaN(convId) || convId <= 0) {
        return apiError(400, "invalid_id", "ID de conversation invalide")
      }

      const userId = ctx.user.userId
      const isMember = await verifyParticipant(convId, userId)
      if (!isMember) {
        return apiError(403, "not_participant", "Vous n'êtes pas membre de cette conversation")
      }

      const conversation = await prismaChat.t_conversation.findUnique({
        where: { Id_Conversation: convId },
        select: {
          Id_Conversation: true,
          Type: true,
          Titre: true,
          Date_Creation: true,
          participants: {
            select: {
              Id_Utilisateur: true,
              Date_Ajout: true,
            },
          },
        },
      })

      if (!conversation) {
        return apiError(404, "not_found", "Conversation introuvable")
      }

      const participantIds = conversation.participants.map((p) => p.Id_Utilisateur)

      const [dbUsers, avatarMap] = await Promise.all([
        prisma.t_utilisateur.findMany({
          where: { Id_Utilisateur: { in: participantIds } },
          select: {
            Id_Utilisateur: true,
            Login: true,
            Prenom: true,
            Nom: true,
            Adresse_Email: true,
            Tel_Num_Mobile: true,
            Tel_Num_Fixe: true,
            Date_Creation: true,
            Profil_Utilisateur: true,
          },
        }),
        getUserAvatarMap(participantIds),
      ])

      const joinedAtMap = new Map(
        conversation.participants.map((p) => [p.Id_Utilisateur, p.Date_Ajout.toISOString()])
      )

      const participants = dbUsers.map((u) => {
        const initials = getInitialsForAvatar(u.Prenom, u.Nom, u.Login)
        const avatarValue = avatarMap.get(u.Id_Utilisateur) ?? null
        const avatar = resolveAvatarSrc(avatarValue, initials)
        const displayName =
          (`${u.Prenom ?? ""} ${u.Nom ?? ""}`.trim()) || (u.Login ?? `User ${u.Id_Utilisateur}`)
        return {
          id: u.Id_Utilisateur,
          displayName,
          username: u.Login ?? "",
          email: u.Adresse_Email ?? null,
          avatar,
          role: u.Profil_Utilisateur ?? null,
          phoneMobile: u.Tel_Num_Mobile ?? null,
          phoneFixed: u.Tel_Num_Fixe ?? null,
          createdAt: u.Date_Creation?.toISOString() ?? null,
          joinedAt: joinedAtMap.get(u.Id_Utilisateur) ?? conversation.Date_Creation.toISOString(),
        }
      })

      return apiOk({
        id: conversation.Id_Conversation,
        type: conversation.Type as "dm" | "group",
        titre: conversation.Titre ?? null,
        createdAt: conversation.Date_Creation.toISOString(),
        participants,
      })
    } catch (error) {
      log.error("chat/conversations/details", "details_fetch_error", { error })
      return apiError(500, "details_fetch_failed", "Erreur lors de la récupération des détails")
    }
  },
)
```

### Step 2 : Vérifier TypeScript

```bash
cd website && npx tsc --noEmit 2>&1 | head -30
```

Expected : 0 erreurs sur les nouveaux fichiers.

### Step 3 : Commit

```bash
git add website/src/app/api/chat/conversations/\[id\]/details/route.ts
git commit -m "feat(messaging): add GET /api/chat/conversations/[id]/details endpoint"
```

---

## Task 3 : API route GET /api/chat/conversations/[id]/attachments

**Files:**
- Create: `website/src/app/api/chat/conversations/[id]/attachments/route.ts`

> ⚠️ Ce fichier est différent de `/api/chat/attachments/[id]/route.ts` (qui sert le téléchargement d'un fichier par son ID). Ici on liste toutes les PJ d'une conversation.

### Step 1 : Créer la route

```ts
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { prismaChat } from "@/lib/prisma-chat"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { checkChatAccess, verifyParticipant } from "@/lib/chat-guard"
import type { JWTPayload } from "@/lib/jwt"
import { log } from "@/lib/logger"

type RouteParams = { params: Promise<{ id: string }> }

export const GET = withAuthLogging(
  async (_req: NextRequest, ctx: { user: JWTPayload }, { params }: RouteParams) => {
    try {
      const guard = await checkChatAccess()
      if (!guard.ok) return guard.response

      const { id: idParam } = await params
      const convId = parseInt(idParam, 10)
      if (isNaN(convId) || convId <= 0) {
        return apiError(400, "invalid_id", "ID de conversation invalide")
      }

      const userId = ctx.user.userId
      const isMember = await verifyParticipant(convId, userId)
      if (!isMember) {
        return apiError(403, "not_participant", "Vous n'êtes pas membre de cette conversation")
      }

      // Fetch all attachments for messages in this conversation (non-deleted messages only)
      const attachments = await prismaChat.t_message_attachment.findMany({
        where: {
          message: {
            Id_Conversation: convId,
            Date_Suppression: null,
          },
        },
        select: {
          Id_Attachment: true,
          File_Name: true,
          Mime_Type: true,
          File_Size: true,
          Date_Upload: true,
          message: {
            select: {
              Sender_Id: true,
            },
          },
        },
        orderBy: { Date_Upload: "desc" },
      })

      if (attachments.length === 0) {
        return apiOk({ attachments: [] })
      }

      const senderIds = Array.from(new Set(attachments.map((a) => a.message.Sender_Id)))
      const dbUsers = await prisma.t_utilisateur.findMany({
        where: { Id_Utilisateur: { in: senderIds } },
        select: {
          Id_Utilisateur: true,
          Login: true,
          Prenom: true,
          Nom: true,
        },
      })

      const userNameMap = new Map<number, string>()
      for (const u of dbUsers) {
        const name = (`${u.Prenom ?? ""} ${u.Nom ?? ""}`.trim()) || (u.Login ?? `User ${u.Id_Utilisateur}`)
        userNameMap.set(u.Id_Utilisateur, name)
      }

      const result = attachments.map((att) => ({
        id: att.Id_Attachment,
        fileName: att.File_Name,
        mimeType: att.Mime_Type,
        size: att.File_Size,
        uploadedAt: att.Date_Upload.toISOString(),
        senderName: userNameMap.get(att.message.Sender_Id) ?? `User ${att.message.Sender_Id}`,
      }))

      return apiOk({ attachments: result })
    } catch (error) {
      log.error("chat/conversations/attachments", "attachments_fetch_error", { error })
      return apiError(500, "attachments_fetch_failed", "Erreur lors de la récupération des documents")
    }
  },
)
```

### Step 2 : Vérifier TypeScript

```bash
cd website && npx tsc --noEmit 2>&1 | head -30
```

### Step 3 : Commit

```bash
git add website/src/app/api/chat/conversations/\[id\]/attachments/route.ts
git commit -m "feat(messaging): add GET /api/chat/conversations/[id]/attachments endpoint"
```

---

## Task 4 : Composant UserProfileSheet

**Files:**
- Create: `website/src/app/[locale]/(dashboard)/messages/_components/user-profile-sheet.tsx`

### Step 1 : Créer le composant

```tsx
"use client"

import { useTranslations } from "next-intl"
import { Mail, Phone, PhoneCall, User, Shield, Calendar } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "../_utils"
import type { ConversationParticipant } from "./_types"

type UserProfileSheetProps = {
  user: ConversationParticipant | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" })
}

export function UserProfileSheet({ user, open, onOpenChange }: UserProfileSheetProps) {
  const t = useTranslations("messaging.details")

  if (!user) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 sm:w-96 overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle>{t("user_profile_title")}</SheetTitle>
        </SheetHeader>

        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 py-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar ?? undefined} />
            <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
              {getInitials(user.displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="text-base font-semibold">{user.displayName}</p>
            <p className="text-sm text-muted-foreground">@{user.username}</p>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-3 px-1">
          {user.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <a
                href={`mailto:${user.email}`}
                className="text-sm hover:underline break-all"
              >
                {user.email}
              </a>
            </div>
          )}

          {user.role && (
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{user.role}</span>
            </div>
          )}

          {user.phoneMobile && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{user.phoneMobile}</span>
            </div>
          )}

          {user.phoneFixed && (
            <div className="flex items-center gap-3">
              <PhoneCall className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm">{user.phoneFixed}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">
              {t("member_since")} {formatDate(user.createdAt)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">
              {t("joined_conversation")} {formatDate(user.joinedAt)}
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

### Step 2 : Ajouter les clés i18n

Dans `website/src/messages/fr.json`, dans la section `messaging` (chercher `"messaging": {`), ajouter une sous-section `"details"` :

```json
"details": {
  "sheet_title": "Détails",
  "user_profile_title": "Profil",
  "member_since": "Membre depuis",
  "joined_conversation": "A rejoint le",
  "members_section": "Membres",
  "documents_section": "Documents partagés",
  "no_documents": "Aucun document partagé",
  "group_created": "Créé le",
  "download": "Télécharger"
}
```

Répéter pour `website/src/messages/en.json` :

```json
"details": {
  "sheet_title": "Details",
  "user_profile_title": "Profile",
  "member_since": "Member since",
  "joined_conversation": "Joined on",
  "members_section": "Members",
  "documents_section": "Shared documents",
  "no_documents": "No shared documents",
  "group_created": "Created on",
  "download": "Download"
}
```

### Step 3 : Vérifier TypeScript

```bash
cd website && npx tsc --noEmit 2>&1 | head -30
```

### Step 4 : Commit

```bash
git add website/src/app/[locale]/\(dashboard\)/messages/_components/user-profile-sheet.tsx \
        website/src/messages/fr.json \
        website/src/messages/en.json
git commit -m "feat(messaging): add UserProfileSheet component + i18n keys"
```

---

## Task 5 : Composant ConversationDetailsSheet

**Files:**
- Create: `website/src/app/[locale]/(dashboard)/messages/_components/conversation-details-sheet.tsx`

### Step 1 : Créer le composant

```tsx
"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useQuery } from "@tanstack/react-query"
import { Download, FileText, FileSpreadsheet, FileImage, File } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { getJson } from "@/lib/http"
import { getInitials } from "../_utils"
import { UserProfileSheet } from "./user-profile-sheet"
import type {
  ConversationDetails,
  ConversationAttachmentsResponse,
  ConversationParticipant,
} from "./_types"

type ConversationDetailsSheetProps = {
  convId: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" })
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return <FileImage className="h-4 w-4 text-blue-500 shrink-0" />
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel") || mimeType === "text/csv")
    return <FileSpreadsheet className="h-4 w-4 text-green-600 shrink-0" />
  if (mimeType.includes("pdf") || mimeType.includes("word") || mimeType.includes("text"))
    return <FileText className="h-4 w-4 text-orange-500 shrink-0" />
  return <File className="h-4 w-4 text-muted-foreground shrink-0" />
}

export function ConversationDetailsSheet({
  convId,
  open,
  onOpenChange,
}: ConversationDetailsSheetProps) {
  const t = useTranslations("messaging.details")
  const [selectedUser, setSelectedUser] = useState<ConversationParticipant | null>(null)

  const { data: details, isLoading: isLoadingDetails } = useQuery<ConversationDetails>({
    queryKey: ["chat", "conv-details", convId],
    queryFn: () => getJson<ConversationDetails>(`/api/chat/conversations/${convId}/details`),
    enabled: open,
    staleTime: 30_000,
  })

  const { data: attachmentsData, isLoading: isLoadingAttachments } =
    useQuery<ConversationAttachmentsResponse>({
      queryKey: ["chat", "conv-attachments", convId],
      queryFn: () =>
        getJson<ConversationAttachmentsResponse>(`/api/chat/conversations/${convId}/attachments`),
      enabled: open,
      staleTime: 30_000,
    })

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-80 sm:w-96 flex flex-col p-0">
          <SheetHeader className="px-6 py-4 border-b shrink-0">
            <SheetTitle>{t("sheet_title")}</SheetTitle>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="px-6 py-4 space-y-6">
              {/* Group info */}
              {isLoadingDetails ? (
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ) : details ? (
                <div>
                  <p className="text-base font-semibold">
                    {details.titre ?? details.participants.map((p) => p.displayName).join(", ")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("group_created")} {formatDate(details.createdAt)}
                  </p>
                </div>
              ) : null}

              {/* Members */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  {t("members_section")}
                  {details ? ` (${details.participants.length})` : ""}
                </p>
                {isLoadingDetails ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-3.5 w-28" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {details?.participants.map((participant) => (
                      <button
                        key={participant.id}
                        onClick={() => setSelectedUser(participant)}
                        className="flex items-center gap-3 w-full rounded-lg p-2 hover:bg-muted/60 transition-colors text-left"
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarImage src={participant.avatar ?? undefined} />
                          <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                            {getInitials(participant.displayName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{participant.displayName}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            @{participant.username}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Shared documents */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  {t("documents_section")}
                </p>
                {isLoadingAttachments ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full rounded-md" />
                    ))}
                  </div>
                ) : !attachmentsData?.attachments.length ? (
                  <p className="text-sm text-muted-foreground">{t("no_documents")}</p>
                ) : (
                  <div className="space-y-1">
                    {attachmentsData.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center gap-2 rounded-md p-2 hover:bg-muted/60 transition-colors"
                      >
                        {getFileIcon(att.mimeType)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{att.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(att.size)} · {formatDate(att.uploadedAt)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          asChild
                        >
                          <a
                            href={`/api/chat/attachments/${att.id}`}
                            download={att.fileName}
                            title={t("download")}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Nested user profile sheet */}
      <UserProfileSheet
        user={selectedUser}
        open={selectedUser !== null}
        onOpenChange={(o) => { if (!o) setSelectedUser(null) }}
      />
    </>
  )
}
```

### Step 2 : Vérifier TypeScript

```bash
cd website && npx tsc --noEmit 2>&1 | head -30
```

### Step 3 : Commit

```bash
git add website/src/app/[locale]/\(dashboard\)/messages/_components/conversation-details-sheet.tsx
git commit -m "feat(messaging): add ConversationDetailsSheet with members and shared documents"
```

---

## Task 6 : Modifier message-thread.tsx — header cliquable + stack d'avatars

**Files:**
- Modify: `website/src/app/[locale]/(dashboard)/messages/_components/message-thread.tsx`

### Step 1 : Ajouter l'import des nouveaux composants et de l'icône Info

Remplacer la ligne d'import lucide existante :
```ts
import { ChevronUp, Check, CheckCheck } from "lucide-react"
```
par :
```ts
import { ChevronUp, Check, CheckCheck, Info } from "lucide-react"
```

Ajouter après l'import de `TypingIndicator` :
```ts
import { ConversationDetailsSheet } from "./conversation-details-sheet"
import { UserProfileSheet } from "./user-profile-sheet"
```

Ajouter l'import du type `ConversationDetails` dans les types importés :
```ts
import type { ConversationSummary, MessageItem, MessagesResponse, ConversationDetails } from "./_types"
```

### Step 2 : Ajouter l'état du Sheet dans `MessageThread`

Dans la fonction `MessageThread`, après la déclaration des états existants (`hasScrolledToBottom`, `allMessages`, etc.), ajouter :

```ts
const [sheetOpen, setSheetOpen] = useState(false)
const [dmSheetUser, setDmSheetUser] = useState<import("./_types").ConversationParticipant | null>(null)
```

### Step 3 : Remplacer le header

Remplacer le bloc header (lignes 200–214) :

```tsx
{/* Thread header */}
<div className="flex items-center gap-3 px-5 py-3.5 border-b shrink-0 bg-background/80 backdrop-blur-sm">
  <Avatar className="h-8 w-8 shrink-0">
    <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
      {getInitials(conversation.name)}
    </AvatarFallback>
  </Avatar>
  <div className="flex-1 min-w-0">
    <h3 className="text-sm font-semibold truncate">{conversation.name}</h3>
    {conversation.type === "group" && (
      <p className="text-xs text-muted-foreground">
        {t("conversations.group_badge")}
      </p>
    )}
  </div>
</div>
```

par :

```tsx
{/* Thread header — cliquable pour ouvrir le Sheet de détails */}
<button
  onClick={() => setSheetOpen(true)}
  className="flex items-center gap-3 px-5 py-3.5 border-b shrink-0 bg-background/80 backdrop-blur-sm w-full text-left cursor-pointer hover:bg-muted/40 transition-colors"
>
  {conversation.type === "group" ? (
    /* Stack d'avatars pour les groupes — alimenté par le fetch details */
    <GroupAvatarStack convId={convId} />
  ) : (
    <Avatar className="h-8 w-8 shrink-0">
      <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
        {getInitials(conversation.name)}
      </AvatarFallback>
    </Avatar>
  )}
  <div className="flex-1 min-w-0">
    <h3 className="text-sm font-semibold truncate">{conversation.name}</h3>
    {conversation.type === "group" && (
      <p className="text-xs text-muted-foreground">
        {t("conversations.group_badge")}
      </p>
    )}
  </div>
  <Info className="h-4 w-4 text-muted-foreground shrink-0" />
</button>
```

### Step 4 : Ajouter le sous-composant GroupAvatarStack

**Avant** la fonction `MessageThread`, ajouter :

```tsx
function GroupAvatarStack({ convId }: { convId: number }) {
  const { data } = useQuery<import("./_types").ConversationDetails>({
    queryKey: ["chat", "conv-details", convId],
    queryFn: () => getJson<import("./_types").ConversationDetails>(`/api/chat/conversations/${convId}/details`),
    staleTime: 60_000,
  })

  const MAX_SHOWN = 4
  const participants = data?.participants ?? []
  const shown = participants.slice(0, MAX_SHOWN)
  const extra = participants.length - MAX_SHOWN

  if (shown.length === 0) {
    return (
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
          G
        </AvatarFallback>
      </Avatar>
    )
  }

  return (
    <div className="flex items-center shrink-0">
      {shown.map((p, i) => (
        <Avatar
          key={p.id}
          className="h-7 w-7 border-2 border-background"
          style={{ marginLeft: i === 0 ? 0 : -10 }}
        >
          <AvatarImage src={p.avatar ?? undefined} />
          <AvatarFallback className="text-[10px] font-medium bg-primary/10 text-primary">
            {getInitials(p.displayName)}
          </AvatarFallback>
        </Avatar>
      ))}
      {extra > 0 && (
        <div
          className="h-7 w-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground"
          style={{ marginLeft: -10 }}
        >
          +{extra}
        </div>
      )}
    </div>
  )
}
```

### Step 5 : Ajouter le Sheet en bas du return

Juste avant la fermeture du `</div>` racine du composant, ajouter :

```tsx
<ConversationDetailsSheet
  convId={convId}
  open={sheetOpen}
  onOpenChange={setSheetOpen}
/>
```

> Note : Pour les DMs, `ConversationDetailsSheet` affichera automatiquement le seul autre participant (pas de titre groupe). La fiche utilisateur s'ouvrira au clic sur le membre dans le Sheet.

### Step 6 : Vérifier TypeScript

```bash
cd website && npx tsc --noEmit 2>&1 | head -30
```

### Step 7 : Commit final

```bash
git add website/src/app/[locale]/\(dashboard\)/messages/_components/message-thread.tsx
git commit -m "feat(messaging): clickable header with group avatar stack + details sheet"
```

---

## Récapitulatif des fichiers touchés

| Action | Fichier |
|---|---|
| Modifié | `_components/_types.ts` |
| Créé | `api/chat/conversations/[id]/details/route.ts` |
| Créé | `api/chat/conversations/[id]/attachments/route.ts` |
| Créé | `_components/user-profile-sheet.tsx` |
| Créé | `_components/conversation-details-sheet.tsx` |
| Modifié | `_components/message-thread.tsx` |
| Modifié | `messages/fr.json` |
| Modifié | `messages/en.json` |

## Tests manuels à effectuer

1. Ouvrir une **conversation de groupe** → vérifier le stack d'avatars dans le header
2. Cliquer sur le header → vérifier l'ouverture du Sheet avec membres + documents
3. Cliquer sur un membre → vérifier la fiche utilisateur (Sheet imbriqué)
4. Ouvrir une **conversation DM** → vérifier icône Info + Sheet avec fiche utilisateur
5. Groupe sans documents → vérifier message "Aucun document partagé"
6. Groupe avec >4 membres → vérifier le badge `+N`
