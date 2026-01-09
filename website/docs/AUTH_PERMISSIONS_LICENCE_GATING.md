# Auth / permissions / licence (gating UX + archi)

Ce document résume la stratégie pour une UX type logiciel (shell stable, pas de flash) sans perdre la revalidation.

## TL;DR
- Ne pas bloquer l’écran à chaque navigation.
- Hard gate seulement au premier chargement (auth + licence + rôle global).
- Soft gate par page (accès refusé inline, actions masquées).
- Revalidation intelligente (focus, interval, 401, changement de contexte).

## Définitions
- Hard gate : bloque le rendu tant que l’accès n’est pas connu.
- Soft gate : UI prête mais zone/page refusée.
- Revalidation : refresh auth/licence/perms en arrière-plan.

## État actuel
- `/api/me` est la source session.
- TanStack Query est déjà utilisé.
- SSE/polling stoppé sur 401.
- Hotline utilise un cookie dédié + namespace `/api/hotline/*`.

## Pattern recommandé
1) Hard gate dans les layouts AppShell (dashboard/admin).
2) Soft gate au niveau page/action.
3) Revalidation sur focus + interval + 401.

## À faire
- Ajouter un endpoint `/api/session` (auth + licence + perms).
- Standardiser les codes de permission (strings).
- Ajouter la licence dans la session.

## Note sécurité
Soft gate = UX. Les routes API doivent forcer auth + droits côté serveur.
