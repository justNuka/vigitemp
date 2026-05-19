# Couverture des audits VigiSensys

Date de controle: 2026-05-19

## Mecanisme utilise

Les traces d'audit passent par `log.audit(...)` dans `website/src/lib/logger.ts`.
Chaque appel ecrit:

- dans les logs applicatifs avec le label `AUDIT`;
- dans la base mesures, table `tm_journal`, via `writeAuditToDatabase(...)`;
- avec le code journal fourni (`CC`, `ACQ`, `ACT`, `DES`, `MDP`, `ET`, `CA`, `VLOG`, etc.).

Les helpers `auditRouteCreate`, `auditRouteUpdate` et `auditRouteDelete` comparent les champs avant/apres et evitent d'ecrire un audit vide quand aucune valeur suivie n'a change.

## Actions metier couvertes

### Lieux et surveillance

- Creation de lieu: `log.data.create("Lieu", ...)` dans `api/lieux/route.ts`.
- Modification de lieu: audit multi-champs dans `api/lieux/[id]/route.ts`.
- Activation/desactivation de surveillance: codes `ACT` / `DES` dans `api/lieux/[id]/route.ts`.
- Modification des alarmes par lieu: `api/lieux/[id]/alarm/route.ts`.
- Planning de lieu: creation, modification, suppression dans `api/lieux/[id]/planning/*`.
- Templates de lieu: creation, modification, suppression dans `api/lieux/templates/*`.
- Ouverture graphe lieu: code `GRPH` si `DASHBOARD:AUDIT_GRAPH_OPENINGS=true`.
- Reactivation automatique de surveillance/snooze: ajoutee le 2026-05-19 dans `api/capteurs/reactivate/route.ts` avec code `ACT`.
- Le serveur d'interrogation trace aussi les reactivations automatiques de surveillance avec `writeAuditJournal("ACT", "SERVEUR", "SYSTEME", ...)`.

### Sondes, modules, sites, groupes, actionneurs

- Sondes: creation dans `api/sondes/route.ts`, modification dans `api/sondes/[idSonde]/route.ts`.
- Modules: creation dans `api/modules/route.ts`, modification dans `api/modules/[id]/route.ts`.
- Sites: creation dans `api/sites/route.ts`, modification/archive dans `api/sites/[id]/route.ts`.
- Groupes: creation dans `api/groupes/route.ts`, modification/suppression dans `api/groupes/[id]/route.ts`.
- Associations groupe/lieux et groupe/utilisateurs: auditees via endpoints dedies.
- Actionneurs: creation, modification, suppression dans `api/actionneurs/*`.

### Metrologie, ajustage, etalonnage

- Ajustage par import: code `CA` dans `api/sondes/ajustages/import/route.ts`.
- Ajustage bulk: code `CA` dans `api/sondes/ajustages/bulk/route.ts`.
- Etalonnage bulk: code `ET` dans `api/sondes/etalonnages/bulk/route.ts`.
- Modification d'etalonnage: code `ET` dans `api/sondes/etalonnages/[id]/route.ts`.
- Application d'un etalonnage sur un lieu: code `ETAP` dans `api/lieux/route.ts` et `api/lieux/[id]/route.ts`.
- Etalons: creation, modification, suppression dans `api/etalons/*`.

### Alarmes

- Acquittement d'alarme: code `ACQ` dans `api/alarmes/[id]/acknowledge/route.ts`.
- Resolution manuelle: `ALARM_RESOLVED` dans `api/alarmes/[id]/resolve/route.ts`.
- Dispatch de notifications d'alarme: pas audite comme action utilisateur; c'est un flux technique haut volume. Les alarmes elles-memes restent tracees dans `t_alarme` / `t_alarme_histo` et les envois dans les logs/notifications.

### Parametres et configuration

- Parametres generiques: `log.config.change(...)` dans `api/parametres/[key]/route.ts` et `api/parametres/route.ts`.
- SMTP: audit `CC` dans `api/admin/configuration-smtp/route.ts`.
- Telephonie: audit `CC` dans `api/admin/telephony/config/route.ts`.
- Regles mot de passe: les modifications passent par les endpoints parametres, donc audit `CC`.

### Utilisateurs, profils, mots de passe

- Creation utilisateur: `log.data.create("Utilisateur", ...)` dans `api/utilisateurs/route.ts`.
- Modification/suppression utilisateur: `api/utilisateurs/[id]/route.ts`.
- Associations utilisateur/site/groupe: endpoints `api/utilisateurs/[id]/sites/*` et `api/utilisateurs/[id]/groupes/*`.
- Creation/modification/suppression profil: `api/profils/*`.
- Connexion/deconnexion: codes `CONNEXION` / `DECONNEXION`.
- Changement de mot de passe utilisateur connecte: code `MDP` dans `api/profil/change-password/route.ts`.
- Changement de mot de passe force apres expiration/temporaire: code `MDP` dans `api/auth/force-password-change/route.ts`.
- Reinitialisation par token: succes ajoute le 2026-05-19 avec code `MDP`; echecs serveur deja traces.

### VigiLog

- Configurations VigiLog: creation/modification avec code `VLOG`.
- Loggers: creation/modification avec code `VLOG`.
- Tournees: creation, reception, acquittement, annulation avec codes `VLOG` / `ACQ`.
- Usages ponctuels: creation/arret avec code `VLOG`.

## Flux volontairement non audites dans `tm_journal`

Ces routes modifient des tables techniques mais ne doivent pas polluer l'audit metier par defaut:

- Chat: conversations, messages, pieces jointes, lecture.
- Heartbeat/evenements agent: `api/notifications/agent-heartbeat` et `api/notifications/agent-event`.
- Validation de token temporaire de mot de passe: lecture/validation technique sans modification metier durable.
- Dispatch technique d'alarme: envoi d'emails/Teams/agents, deja observable via logs et tables de notification.

Si une exigence CFR21 impose une tracabilite stricte de ces flux, il faudra creer des codes dedies et probablement separer audit metier et audit technique pour eviter de rendre `tm_journal` illisible.

## Points d'attention

- Les creations via `log.data.create(...)` ecrivent bien en audit car `log.data.create` appelle `log.audit("CC", ...)`.
- Les modifications qui passent par `auditRouteUpdate(...)` ne creent pas de ligne si aucun champ suivi ne change.
- Certains audits utilisent encore des libelles avec caracteres mal encodes dans le code source historique (`Cr?ation`, accents corrompus). Fonctionnellement l'audit est ecrit, mais un nettoyage d'encodage serait souhaitable.
- Les actions automatiques massives peuvent generer plusieurs lignes d'audit. C'est voulu pour la reactivation de surveillance afin de conserver un historique par lieu.
