# Design : Sheet détails messagerie

**Date :** 2026-03-11
**Statut :** Approuvé

---

## Contexte

Amélioration de l'affichage de la messagerie interne VigiSensys :
- Afficher les avatars des membres dans le header d'une conversation de groupe
- Permettre de consulter les détails d'une conversation (groupe ou DM) via un Sheet latéral

---

## Fonctionnalités

### 1. Header de conversation — avatars de groupe

Dans `message-thread.tsx`, le header d'une conversation groupe affiche :
- **Stack d'avatars** : max 4 avatars empilés (overlap) des membres, puis badge `+N` si plus
- **Nom du groupe** + badge "Groupe" existant
- **Icône `Info`** (lucide-react) à droite pour indiquer la cliquabilité
- `cursor-pointer` sur l'ensemble du header

Pour un DM : avatar + nom inchangés, icône `Info` ajoutée à droite.

### 2. Sheet — Groupe (`ConversationDetailsSheet`)

Déclenché au clic sur le header. Contenu :

**Section En-tête**
- Nom du groupe
- Date de création (formatée)
- Nombre de membres

**Section Membres**
- Liste scrollable : avatar + nom complet + rôle
- Chaque membre est cliquable → ouvre `UserProfileSheet`

**Section Documents partagés**
- Liste de toutes les pièces jointes de la conversation (tous messages)
- Colonnes : icône type, nom fichier, taille, date upload
- Clic → téléchargement via `/api/chat/attachments/[id]`

### 3. Sheet — Utilisateur (`UserProfileSheet`)

Utilisé depuis :
- Clic sur le header d'un DM
- Clic sur un membre dans le Sheet groupe

Contenu :
- Grand avatar centré (ou fallback initiales)
- Nom complet
- Username (`@login`)
- Email (lien `mailto:`)
- Rôle
- Téléphone mobile + fixe (masqués si non renseignés)
- Date de création du compte

---

## Architecture

### Nouveaux composants

| Fichier | Description |
|---|---|
| `_components/conversation-details-sheet.tsx` | Sheet principal pour groupe |
| `_components/user-profile-sheet.tsx` | Sheet/fiche utilisateur (DM + membre groupe) |

### Nouveaux endpoints API

| Route | Méthode | Description |
|---|---|---|
| `/api/chat/conversations/[id]/details` | GET | Participants avec infos complètes (db-main) + métadonnées groupe |
| `/api/chat/conversations/[id]/attachments` | GET | Toutes les PJ de la conversation |

### Modifications existantes

| Fichier | Changement |
|---|---|
| `message-thread.tsx` | Header cliquable, stack d'avatars groupe, icône Info, intégration Sheet |

---

## Données

### `GET /api/chat/conversations/[id]/details`

```ts
{
  id: number
  type: "dm" | "group"
  titre: string | null
  createdAt: string
  participants: {
    id: number
    displayName: string
    username: string
    email: string | null
    avatar: string | null
    role: string | null
    phoneMobile: string | null
    phoneFixed: string | null
    createdAt: string
    joinedAt: string  // Date_Ajout de t_conversation_participant
  }[]
}
```

### `GET /api/chat/conversations/[id]/attachments`

```ts
{
  attachments: {
    id: number
    fileName: string
    mimeType: string
    size: number
    uploadedAt: string
    senderName: string
  }[]
}
```

---

## Stack technique

- `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle` — shadcn/ui
- `Avatar`, `AvatarFallback`, `AvatarImage` — shadcn/ui (déjà utilisé)
- `ScrollArea` — shadcn/ui (déjà utilisé)
- `lucide-react` : `Info`, `FileText`, `Download`, `Phone`, `Mail`, `User`
- Fetch via React Query (même pattern que le reste de la messagerie)

---

## Hors scope

- Modifier les infos du groupe (renommer, ajouter/retirer membres)
- Envoyer un message depuis la fiche utilisateur
- Prévisualisation des images dans la liste documents
