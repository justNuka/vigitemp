# Messagerie Interne — Design Document

**Date :** 2026-02-27
**Statut :** Validé

---

## Objectif

Ajouter un système de messagerie interne user-to-user (1-to-1 et groupes) accessible via une cloche dans le header et un lien dans les deux sidebars. Réservé aux licences Standard et Expert, avec un toggle admin pour activer/désactiver le module.

---

## Contraintes

- Ne pas utiliser de custom server Next.js (`output: standalone` conservé)
- Temps réel → service séparé en V2 (Socket.IO), V1 utilise REST + polling
- V1 sans pièces jointes, gifs, emojis — prévu V2+
- License gate + module gate : double protection UI + API

---

## Licences

| Licence | Messagerie |
|---------|-----------|
| Pack    | ❌ Bloqué |
| One     | ❌ Bloqué |
| Standard| ✅ Si module activé |
| Expert  | ✅ Si module activé |

---

## Base de données — `vigi_chat`

Troisième base dédiée (même pattern Prisma que `db-main` et `db-mesures`).

```
t_conversation
  Id_Conversation  INT PK AUTO_INCREMENT
  Type             ENUM('direct', 'group')
  Titre            VARCHAR(128) NULL        -- null pour DM, requis pour groupes
  DM_Key           VARCHAR(64) UNIQUE NULL  -- userId1_userId2 (trié, pour dédup DM)
  Date_Creation    DATETIME DEFAULT NOW()

t_conversation_participant
  Id_Participant    INT PK AUTO_INCREMENT
  Id_Conversation   INT FK -> t_conversation
  Id_Utilisateur    INT                     -- ref Id_Utilisateur (db-main), pas de FK cross-DB
  Last_Read_Msg_Id  INT NULL               -- pour calcul non-lus
  Date_Ajout        DATETIME DEFAULT NOW()
  UNIQUE(Id_Conversation, Id_Utilisateur)

t_message
  Id_Message        INT PK AUTO_INCREMENT
  Id_Conversation   INT FK -> t_conversation
  Sender_Id         INT                     -- ref Id_Utilisateur (db-main)
  Contenu           TEXT
  Date_Creation     DATETIME DEFAULT NOW()
  Date_Modification DATETIME NULL
  Date_Suppression  DATETIME NULL           -- soft delete
  INDEX(Id_Conversation, Id_Message)
```

Pas de `t_message_piece_jointe` en V1 — ajoutée en V2 via migration.

---

## Paramètre admin

**Table** `t_parametre` (db-main) — pattern existant :
- Section : `messaging`
- Mot_Cle : `enabled`
- Valeur : `"true"` (défaut) | `"false"`

---

## API — 7 routes

Toutes protégées : licence Standard/Expert **ET** `messaging:enabled = true`.

```
GET  /api/chat/unread-count
     → { count: number }
     Polling toutes les 10s par le client.

GET  /api/chat/conversations
     → ConversationSummary[]
     (avec lastMessage, unreadCount par conversation)

POST /api/chat/conversations/direct
     body: { targetUserId: number }
     → ConversationSummary (crée ou retourne existant via DM_Key)

POST /api/chat/conversations/group
     body: { titre: string, participantIds: number[] }
     → ConversationSummary

GET  /api/chat/conversations/[id]/messages?cursor=&take=50
     → MessagePage { messages: Message[], nextCursor?: number }
     Pagination par curseur (Id_Message décroissant)

POST /api/chat/conversations/[id]/messages
     body: { contenu: string }
     → Message

POST /api/chat/conversations/[id]/read
     body: {}
     → 204 (met à jour Last_Read_Msg_Id)
```

Sécurité : vérifier que l'utilisateur est participant avant toute lecture/écriture.

---

## Transport

- **V1** : REST + React Query `refetchInterval: 10_000`
- **V2** : Socket.IO dans `realtime-service` (Windows service Node.js séparé)

---

## UI — Bell Popover

Emplacement : `PageHeaderBase` entre `<LanguageSwitcher />` et `<ThemeToggle />`.
Visible uniquement si Standard/Expert + module activé.

**Apparence :**
- Icône Bell avec badge numérique rouge (count non-lus, masqué si 0)
- Clic → `Popover` shadcn/ui

**Contenu du popover :**
- Header : "Messages" + lien "Tout marquer comme lu"
- Liste des 5 dernières conversations avec non-lus :
  - Avatar utilisateur (initiales ou photo, composant `Avatar` existant)
  - Nom conversation (bold si non lu)
  - Aperçu dernier message (1 ligne, tronqué)
  - Timestamp relatif ("il y a 5 min", "Hier")
  - Indicateur point bleu si non lu
- État vide : icône + "Aucun nouveau message"
- Footer : bouton "Voir tous les messages" → `/messages`

---

## UI — Page `/messages`

Route : `website/src/app/[locale]/(dashboard)/messages/page.tsx`
Layout : pleine hauteur, deux colonnes.

### Colonne gauche (w-80, sticky)
- Header : titre "Messagerie" + bouton `+` (Nouvelle conversation)
- Barre de recherche (filtre local sur les conversations chargées)
- Liste conversations :
  - Avatar + initiales
  - Nom (conversation ou participants pour DM)
  - Badge "Groupe" (shadcn `Badge variant="secondary"`) si type group
  - Dernier message (1 ligne tronqué, italic si date de suppression)
  - Timestamp
  - Badge non-lus (chiffre, `variant="destructive"`)
  - Fond surligné si conversation active
- Tri : plus récent en premier

### Colonne droite (flex-1)
- **Header** : nom conversation + nombre de participants + bouton infos
- **Zone messages** (scrollable, scroll auto vers le bas à l'ouverture) :
  - Séparateurs de date ("Aujourd'hui", "Hier", "20 jan. 2026")
  - Messages propres (droite) : `bg-primary text-primary-foreground`, `rounded-2xl rounded-br-sm`
  - Messages autres (gauche) : `bg-muted`, `rounded-2xl rounded-bl-sm`, avec avatar + nom expéditeur
  - Timestamp discret au survol
  - Indicateur "(modifié)" si Date_Modification non null
  - Messages supprimés : italique grisé "Message supprimé"
- **Zone saisie** :
  - Textarea auto-resize (min 1 ligne, max 4)
  - Bouton Envoyer (disabled si vide)
  - Envoi par `Enter` (Shift+Enter = saut de ligne)
- **État vide** (aucune conversation sélectionnée) :
  - Illustration centrée + "Sélectionnez une conversation ou démarrez-en une nouvelle"

### Modal "Nouvelle conversation"
- Tabs : "Message direct" / "Groupe"
- Direct : recherche utilisateur live (`GET /api/utilisateurs` existant), sélection unique
- Groupe : champ titre + recherche multi-sélection utilisateurs
- Bouton créer → `POST /api/chat/conversations/direct` ou `/group`

---

## UI — Navigation

**`AppSidebar`** (vue utilisateur) :
- Lien "Messagerie" avec icône `MessageSquare` (lucide)
- Entre "Alarmes" et "Mon compte"
- Badge non-lus (chiffre, rouge)
- Masqué si licence insuffisante OU module désactivé

**`AdminSidebar`** (vue admin) :
- Lien "Messagerie" dans groupe "Gestion"
- Entre "Alarmes" et "Audit"
- Même badge et même gating

---

## UI — Paramètre admin

Nouvelle card `MessagingSettingsCard` dans `/admin/parametres` :
- Visible uniquement si Standard/Expert
- Toggle ON/OFF pour `messaging:enabled`
- Description : "Activer la messagerie interne entre utilisateurs (Standard/Expert uniquement)"
- Pattern identique aux cards existantes (`handleToggle`, même structure)
- Ajouté dans `SettingsClient` après `NotificationsSettingsCard`

---

## Enforcement

| Couche | Si non autorisé |
|--------|----------------|
| UI | Liens + bell masqués, page `/messages` redirige vers `/` |
| API | `403 messaging_disabled` ou `403 license_insufficient` |
| V2 Socket | Handshake rejeté |

---

## Hors scope V1

- Pièces jointes, images, gifs, emojis
- Socket.IO / temps réel push
- Reactions / threads imbriqués
- Statut "en ligne" / présence
- Notifications push navigateur
