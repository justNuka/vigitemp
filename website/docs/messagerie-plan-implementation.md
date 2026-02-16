# Messagerie interne - plan d'implementation (Vigi)

## 1) Objectif

Ajouter une messagerie interne disponible uniquement pour les licences `standard` et `expert`, sans casser l'architecture actuelle:

- `website` Next.js en standalone (inchangé)
- `serveur C#` (inchangé)
- nouveau service Windows `realtime-service` (Node + Socket.IO + TypeScript)
- nouvelle base dediee `vigi_chat`

## 2) Contraintes d'architecture

- Ne pas utiliser de custom server Next.js avec `output: 'standalone'`.
- Le temps reel doit etre porte par un service separe.
- La verification licence ne doit pas dependre d'un appel runtime permanent au serveur C#.

## 3) Ciblage licence

Messagerie active seulement pour:
- `standard`
- `expert`

Messagerie interdite pour:
- `one`
- `pack`

### Enforcement (obligatoire)

1. UI: masquer les liens/pages messagerie si licence non autorisee.
2. API: retourner `403` pour toutes routes chat si licence non autorisee.
3. Socket handshake: refuser la connexion si licence non autorisee.

## 4) Base de donnees dediee

Creer `vigi_chat` avec tables:

- `t_conversation`
  - type (`direct|group`), titre, site_id (optionnel), dm_key (unique pour DM), date creation
- `t_conversation_participant`
  - conversation_id, user_id, role, last_read_message_id, options mute/pin/archive
- `t_message`
  - conversation_id, sender_id, type, contenu, dates (creation/modif/suppression)
- `t_message_piece_jointe`
  - message_id, metadata fichier + chemin disque

### Index minimaux

- `t_message (Id_Conversation, Id_Message)`
- `t_conversation_participant (Id_User, Id_Conversation)`
- `t_conversation_participant (Id_Conversation, Id_User)`
- `t_conversation (DM_Key unique)`

## 5) Strategie de livraison

## V1 (recommandee)

- Transport: polling (3 a 5s) via API REST.
- Fan-out: on-read.
- Non-lus: `Last_Read_Message_Id`.
- Pas de WebSocket au debut.

## V2

- Ajout Socket.IO dans `realtime-service`.
- REST conserve pour historique/rattrapage.
- WS pour push temps reel (`message:new`, `read:update`, `typing`).

## 6) API V1 (website)

- `GET /api/chat/conversations`
- `POST /api/chat/conversations/direct`
- `POST /api/chat/conversations/group`
- `GET /api/chat/conversations/:id/messages?cursor=&take=`
- `POST /api/chat/conversations/:id/messages`
- `POST /api/chat/conversations/:id/read`

Regle securite:
- verifier que l'utilisateur est participant de la conversation avant lecture/ecriture.

## 7) Service realtime (V2)

Service Windows dedie (Node): `realtime-service`

- Port interne exemple: `3100`
- Socket.IO + TypeScript
- Rooms: `conv:<id>` et `user:<id>`
- Evenements:
  - client -> serveur: `conversation:join`, `message:send`, `conversation:read`
  - serveur -> client: `message:new`, `conversation:read:update`

Auth handshake:
- reutiliser la meme logique de session/token que le website
- ne jamais accepter un `userId` brut envoye par le client sans validation

## 8) Installateur / services Windows

## Cas A - licence connue a l'installation

- `standard|expert`:
  - installer + demarrer `realtime-service`
- `one|pack`:
  - ne pas installer, ou installer en `Disabled`

## Cas B - licence inconnue a l'installation

- installer `realtime-service` en `Disabled`
- apres activation licence:
  - `standard|expert`: enable + start
  - `one|pack`: stop + disable

Important:
- Le website doit rester fonctionnel meme si `realtime-service` est arrete.

## 9) Dossier pieces jointes (si activees)

Stockage disque (pas BLOB DB), ex:
- `C:\ProgramData\Vigitemp\uploads\chat`

Protections:
- whitelist MIME
- taille max
- noms neutralises
- quotas/nettoyage

## 10) Checklist implementation

1. Creer DB `vigi_chat` + tables + index.
2. Ajouter Prisma chat (schema/client dedie).
3. Creer routes API chat V1 avec guards licence + droits participant.
4. Integrer UI messagerie (gating licence).
5. Ajouter polling client et unread.
6. Ajouter `realtime-service` (V2) + handshake auth.
7. Adapter installateur (install/start/disable selon licence).
8. Tests:
   - licence one/pack bloque partout
   - standard/expert OK
   - fallback sans WS OK

## 11) Risques a eviter

- Coupler le chat a un custom server Next en standalone.
- Faire des broadcasts globaux au lieu de rooms.
- Compter les non-lus par `COUNT(*)` lourd en boucle.
- Laisser l'acces API sans verification participant/licence.

## 12) Decision cible

- V1: REST + polling (livrable rapidement, risque faible)
- V2: Socket.IO service separe (upgrade UX sans refonte)
