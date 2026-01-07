# Plan de travaux : installation / déploiement / support (on‑prem)

Ce document liste les chantiers “structurants” à mener en parallèle des finitions serveur C# (ingestion mesures + alarmes).

## 1) Licence (workstream)
Référence : `website/docs/LICENSING_CSHARP_SOURCE_OF_TRUTH.md`.

Contrainte projet :
- **Solution hébergée chez le client** (BDD, serveur C#, serveur web).
- **Pas de dépendance Internet sortante** côté serveur C#.

À faire :
- Implémenter `GET /license/status` + `POST /license/install` côté serveur C#.
- Définir la liste de `featureKey` + règles d’expiration/grâce/quotas.
- Website : écran admin “Licence” + proxy `GET /api/license/status` (cache court).
- Enforcement : sur les routes Next “licenciées” → `403` avec codes stables.

## 2) Permissions (workstream)
Objectif :
- garder **une seule source de vérité** côté serveur (DB + logique serveur),
- UX “app-like” : soft gates UI (masquage/inline) + hard gates au boot si nécessaire.

À faire :
- Auditer les permissions actuelles en BDD (naming, doublons, périmètres).
- Définir une convention stable :
  - format (strings) : ex `ADMIN_USERS_READ`, `ADMIN_USERS_WRITE`, …
  - scopes éventuels (site/groupe/lieu) si besoin.
- Implémenter une réponse session unifiée (ou enrichir `/api/me`) pour exposer permissions + rôle global + licence (quand prête).
- Standardiser les protections API : mêmes codes d’erreur, mêmes messages, même logging.

## 3) Installation serveur C# (wizard / bootstrap)
Objectif : plus rien de critique “hard codé”.

Wizard attendu (au minimum) :
- SMTP : host/port/SSL/user/pass + email “from”.
- DB :
  - type : `MySQL` ou `MsSQL`
  - host/port/user/pass
  - noms des 2 bases (main + mesures)
- Web :
  - URL de la website (ou host/port)
  - URL/port du serveur Next si besoin
- Licence :
  - import du fichier `license.vtlic`
  - affichage statut licence (valide/expirée/invalide)
- Dossiers :
  - chemin des logs
  - chemin config

Livrables :
- fichier de config (json/yaml) + validation au démarrage,
- commandes “test connexion SMTP/DB”,
- service Windows (start/stop/restart) + logs.

## 4) Installation website (script PowerShell)
Objectif : installer, démarrer, et relancer automatiquement.

Script (idéalement) :
- choix du dossier d’installation (paramètre, ou valeur par défaut documentée),
- installation Node + package manager (ex `pnpm`) si absent,
- `pnpm install` + `pnpm build` + `pnpm start` (ou `next start`),
- création d’un service Windows (NSSM / sc.exe) ou tâche planifiée pour auto-restart,
- logs d’installation détaillés (fichier + console),
- santé :
  - test HTTP local (ex: `/api/health` à ajouter)
  - restart si KO

Notes :
- exclusion Windows Defender du store pnpm : nécessite terminal admin (optionnel, documenté).

## 5) Installation BDD (script d’aide)
Cible : les techs savent le faire, mais un script peut fiabiliser.

Optionnel :
- installer MySQL Server (ou SQL Server) si absent,
- créer les 2 bases + utilisateurs,
- appliquer les schémas (Prisma migrations / SQL),
- injecter des données minimales :
  - compte admin initial (mdp temporaire) + “change password on first login”
  - autorisations/permissions de base
  - paramètres système indispensables

## 6) Support hotline “à distance” (outils + panel)
Objectif : dépanner sans exposer l’audit trail utilisateur et sans accès complet.

À faire :
- accès remote (TeamViewer ou équivalent) : procédures + check-list.
- “panel dépannage” dans la website, accessible via un compte support “caché” :
  - compte défini via licence (ou config) : username + hash de mot de passe
  - accès lecture seule aux logs “tech” (pas l’audit trail utilisateur)
  - filtres : date, niveau (error/warn), routes 500, recherche texte
  - export (csv) pour la hotline

Sécurité :
- journaliser (audit trail) l’usage du compte support,
- limiter strictement les actions possibles (idéalement lecture seule).

## 7) Multi‑DB : clients MsSQL
Objectif : supporter MySQL et MsSQL, sans casser l’on‑prem.

À faire :
- définir la stratégie Prisma (génération/build) selon le provider :
  - soit 2 builds,
  - soit 2 schémas/prisma clients selon config (complexité),
  - soit migration progressive (à cadrer).
- intégrer le choix DB dans l’install wizard C# + scripts BDD + website config.

## 8) Priorisation proposée (ordre)
1) Licence : format + endpoints C# + enforcement minimal (bloque les features).
2) Permissions : convention + standardisation API + session unifiée.
3) Installer C# : wizard/config + service Windows.
4) Installer website : script PS + service + healthcheck.
5) Outil support : panel logs + compte support.
6) Multi‑DB MsSQL : cadrage + preuve de concept.
