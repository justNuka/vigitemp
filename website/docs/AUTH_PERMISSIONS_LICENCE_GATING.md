# Auth / permissions / licence (gating UX + archi)

## Principes
- Ne pas bloquer l'ecran a chaque navigation.
- Hard gate uniquement au premier chargement (auth + licence + role global).
- Soft gate par page (acces refuse inline, actions masquee).
- Revalidation intelligente (focus, interval, 401, changement de contexte).

## Definitions
- Hard gate : bloque le rendu tant que l'acces n'est pas connu.
- Soft gate : UI prete mais zone/page refusee.
- Revalidation : refresh auth/licence/perms en arriere-plan.

## Etat actuel
- `/api/me` sert de source session.
- TanStack Query est utilise.
- SSE/polling stoppes sur 401.
- Hotline isolee par cookie dedie et namespace `/api/hotline/*`.

## Pattern recommande
1) Hard gate dans les layouts AppShell (dashboard/admin).
2) Soft gate au niveau page/action.
3) Revalidation sur focus + interval + 401.

## A faire
- Ajouter un endpoint `/api/session` (auth + licence + perms).
- Standardiser les codes de permission (strings).
- Injecter la licence dans la session.

## Note securite
Le soft gate est UX uniquement. Les routes API doivent forcer auth + droits cote serveur.
