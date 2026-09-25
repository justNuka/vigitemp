# Map API (canon FR)

Dernière mise à jour : audit des fichiers `website/src/app/api/**/route.ts`.

Objectif : fournir une vue fiable des endpoints réellement implémentés.

## Authentification et session
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/logout-auto`
- `POST /api/auth/request-password-reset`
- `POST /api/auth/reset-password`
- `POST /api/auth/temp-password-token`
- `POST /api/auth/validate-password-token`
- `POST /api/auth/force-password-change`
- `GET /api/me`
- `POST /api/profil/change-password`

## Alarmes et surveillance
- `GET /api/alarmes`
- `GET /api/alarmes/commentaires-acquittement`
- `POST /api/alarmes/[id]/acknowledge`
- `POST /api/alarmes/[id]/resolve`
- `GET /api/alarmes/[id]/stats`
- `POST /api/alarmes/dispatch`
- `GET /api/alarmes/stream` (SSE)
- `POST /api/surveillance/dispatch`
- `GET /api/surveillance/stream` (SSE)

## Lieux, groupes, sites
- `GET, POST /api/lieux`
- `PATCH /api/lieux/[id]`
- `PATCH /api/lieux/[id]/alarm`
- `GET /api/lieux/[id]/audit`
- `GET, POST /api/lieux/resume`
- `GET, POST /api/groupes`
- `PATCH, DELETE /api/groupes/[id]`
- `PATCH /api/groupes/[id]/alarm`
- `PATCH /api/groupes/[id]/surveillance`
- `GET /api/groupes/[id]/lieux`
- `GET /api/groupes/[id]/utilisateurs`
- `GET, POST /api/sites`
- `PATCH /api/sites/[id]`

## Sondes, capteurs, mesures, modules
- `GET, POST /api/sondes`
- `PATCH /api/sondes/[idSonde]`
- `GET /api/sondes/[idSonde]/mesures`
- `GET /api/sondes/calibrages`
- `GET /api/sondes/etalonnages`
- `POST /api/sondes/etalonnages/preview`
- `POST /api/sondes/etalonnages/bulk`
- `POST /api/sondes/ajustages/preview`
- `POST /api/sondes/ajustages/import`
- `POST /api/sondes/ajustages/bulk`
- `GET /api/sondes/types`
- `GET /api/sondes/unassigned`
- `GET, POST /api/capteurs`
- `GET, PATCH, DELETE /api/capteurs/[id]`
- `GET /api/capteurs/paginated`
- `GET /api/mesures/[idLieu]`
- `GET, POST /api/modules`
- `PATCH, DELETE /api/modules/[id]`
- `GET /api/modules/[id]/sondes`
- `GET /api/modules/types`

## Utilisateurs, profils, autorisations
- `GET, POST /api/utilisateurs`
- `GET, PATCH, DELETE /api/utilisateurs/[id]`
- `GET, POST /api/utilisateurs/[id]/sites`
- `DELETE /api/utilisateurs/[id]/sites/[siteId]`
- `GET, POST /api/utilisateurs/[id]/groupes`
- `DELETE /api/utilisateurs/[id]/groupes/[groupId]`
- `GET, POST /api/profils`
- `GET, PATCH, DELETE /api/profils/[id]`
- `GET /api/autorisations`

## Étalons et actionneurs
- `GET, POST /api/etalons`
- `PATCH, DELETE /api/etalons/[id]`
- `GET /api/etalons/types`
- `GET, POST /api/actionneurs`
- `PATCH, DELETE /api/actionneurs/[id]`
- `GET /api/actionneurs/types`

## Administration et paramètres
- `GET /api/admin/utilisateurs-connectes`
- `GET /api/admin/alarmes-actives`
- `GET /api/admin/acquittements`
- `GET /api/admin/journaux-systeme`
- `GET /api/admin/sauvegardes`
- `GET /api/admin/system-health`
- `GET /api/admin/email-audit`
- `GET /api/admin/telephony/status`
- `GET, PUT, PATCH /api/admin/configuration-smtp`
- `POST /api/admin/configuration-smtp/verification/request`
- `POST /api/admin/configuration-smtp/verification/confirm`
- `GET, PUT /api/parametres`
- `GET, PATCH /api/parametres/[key]`
- `GET /api/parametres/password-rules`
- `GET /api/license`
- `GET, POST /api/revalidate`
- `GET /api/debug/db-ping`

## Audit et commentaires
- `GET /api/audit`
- `GET /api/audit/codes`
- `GET, POST, PATCH /api/audit/comments`

## Agent local et notifications
- `GET /api/agent/secret`
- `GET /api/agent/secret/status`
- `GET, POST, DELETE /api/agent/proxy/[...path]`
- `POST /api/notifications/agent-event`
- `GET /api/hotline/agent-secret-status`

## Hotline et push
- `POST /api/hotline/login`
- `POST /api/hotline/logout`
- `GET /api/hotline/health`
- `GET /api/hotline/logs`
- `GET /api/hotline/request-errors`
- `POST /api/push/subscribe`
- `POST /api/push/unsubscribe`
- `POST /api/email/test`

## Consumers front principaux
- Alarmes : `website/src/hooks/useAlarms.ts`, `website/src/components/global-app-effects.tsx`
- Surveillance capteurs : `website/src/hooks/use-paginated-sensors.ts`, pages `website/src/app/[locale]/(dashboard)/surveillance/**`
- Admin utilisateurs/profils/groupes/sites/lieux : `website/src/app/[locale]/(admin)/admin/**`
- Hotline : `website/src/app/[locale]/(hotline)/hotline/[slug]/**`

## Note de maintenance
- Cette map doit être mise à jour à chaque ajout/suppression de `route.ts`.
- Source de vérité : arborescence `website/src/app/api`.
