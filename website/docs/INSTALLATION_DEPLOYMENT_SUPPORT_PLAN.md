# Plan installation / déploiement / support (on-prem)

Dernière mise à jour : 2026-01-08

Contraintes
- Solution hébergée chez le client (BDD + serveur C# + web).
- Serveur C# sans dépendance Internet sortante.

## 1) Licence
- Source de vérité : serveur C#.
- Licence + clé publique dans ProgramData.
- Identifiants hotline dans la licence.

À faire :
- `/license/status` et `/license/install` côté C#.
- Proxy web + UI admin.
- Enforcement sur routes Next critiques.

## 2) Permissions
- Audit des codes en BDD.
- Convention stable (strings).
- Exposer permissions dans la session.

## 3) Install serveur C#
Statut : ok
- Script PowerShell, App.config, service Windows, registry.
- Choix DB mysql/mssql.

## 4) Install web
Statut : ok
- Script PowerShell offline/standalone.
- WinSW service + restart policy.
- Registry écrit.

Reste :
- Éventuel endpoint health web.

## 5) Install BDD
Statut : en attente
- Script aide MySQL/MSSQL.

## 6) Hotline support
Statut : ok (core)
- Route cachée + login.
- Logs web/serveur/service + health checks.

Reste :
- Intégration outil remote (reportée).

## 7) Multi-DB (MSSQL)
Statut : en cours
- C# ok, web installer ok.
- Prisma encore mysql.

Reste :
- Stratégie Prisma SQL Server.
