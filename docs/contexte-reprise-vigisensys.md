# Contexte De Reprise - VigiSensys (ex Vigitemp)

Date de mise a jour: 2026-04-24

## Identite projet
- Nom actuel en transition: VigiSensys (ancien nom encore present dans le code/dossiers: Vigitemp).
- Repo local: `c:\VigitempProject\vigitemp`.
- 3 briques principales:
1. Serveur C# (interrogation sondes + orchestration workers + trigger notifications)
2. Web Next.js (interface + API metier + dispatch vers agents + emails)
3. Agent C# Windows (notif locale + infos machine/IP + session locale)

## Environnement de test/prod partage
- Serveur de prod/test principal: `192.168.63.189`.
- Usage: les collegues font des tests dessus et remontent des retours ponctuels.
- Format de retour habituel: captures d'ecran avec texte explicatif.

## Scripts racine (orchestration)
- A la racine du repo, 2 scripts PowerShell sont utilises:
1. `Prepare-All.ps1`
   - Prepare les 3 briques (serveur, web, agent) pour livraison/installation.
2. `Prepare-And-Deploy.ps1`
   - Prepare serveur + web + agent,
   - puis deploie le web et le serveur sur la machine `192.168.63.189`.

## Brique 1 - Serveur C#

### Role
- Interroge les sondes (serie/reseau selon type).
- Evalue les alarmes et ecrit en base.
- Declenche vers le web:
1. dispatch alarmes
2. realtime alarmes
3. recap mensuel statistiques

### Points de code importants
- Entree service/console: `Vigitemp Serveur/Vigitemp Serveur/Program.cs`
- Service principal: `Vigitemp Serveur/Vigitemp Serveur/VigitempServeur.cs`
- Worker interrogation: `Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs`
- Notification HTTP vers web: `Vigitemp Serveur/Vigitemp Serveur/AlarmWebNotifier.cs`
- API hotline locale C#: `Vigitemp Serveur/Vigitemp Serveur/HotlineApiServer.cs`
- Provider DB (MySQL/MSSQL): `Vigitemp Serveur/Vigitemp Serveur/DatabaseFactory.cs`

### Config cle (App.config serveur)
- `Vigi.WebsiteBaseUrl`
- `Vigi.AlarmDispatchSecret`
- `Vigitemp.Workers.Count`
- `Vigitemp.Alarms.PollServerId`
- `Vigi.Db.Provider` (`mysql` ou `mssql`)
- `Vigitemp.StatsMonthlyDispatch.*`

### Note logs recap mensuel
- Les logs:
1. `Monthly stats dispatch trigger start ...`
2. `AlarmWebNotifier: trigger recap mensuel stats ...`
3. `AlarmWebNotifier: recap mensuel stats check OK (status=200)`
- Signifient que le trigger est bien parti du serveur C# vers le web.
- `status=200` valide l'appel HTTP; l'envoi effectif d'email depend ensuite des conditions du endpoint web (horaire, deja envoye, active/desactive, destinataires).

## Brique 2 - Web Next.js

### Role
- UI metier (dashboard/admin/hotline/messages).
- API centrale de coordination.
- Stockage/etat notifications et callbacks agent.
- Envoi emails d'alarmes et recap.

### Stack
- Next.js 16, React 19, TypeScript.
- Prisma avec 3 schemas/bases:
1. `db-main`
2. `db-mesures`
3. `vigi-chat`

### Points de code importants
- Scripts/deps: `website/package.json`
- Prisma principal: `website/src/lib/prisma.ts`
- Prisma chat: `website/src/lib/prisma-chat.ts`
- API map: `website/docs/API_MAP.md`
- Dispatch alarmes vers agents + email: `website/src/app/api/alarmes/dispatch/route.ts`
- Realtime alarmes: `website/src/app/api/alarmes/dispatch-realtime/route.ts`
- Callback events agent: `website/src/app/api/notifications/agent-event/route.ts`
- Heartbeat agent: `website/src/app/api/notifications/agent-heartbeat/route.ts`
- Route recap mensuel: `website/src/app/api/statistiques/recap-mensuel/send/route.ts`
- Doc notifications agent: `website/docs/NOTIFICATIONS_AGENT.md`

### Secrets/headers usuels
- Serveur C# -> Web:
1. header `x-vigitemp-secret`
2. secret attendu: `VIGITEMP_ALARM_DISPATCH_SECRET`
- Agent -> Web:
1. header `x-vigitemp-agent-secret`
2. secret attendu: `VIGITEMP_AGENT_SECRET`

## Brique 3 - Agent C# Windows

### Role
- Recoit les notifications locales sur port 8000.
- Affiche la notification Windows + UI tray.
- Remonte les evenements (`shown`, `clicked`, `closed`, `failed`) au web.
- Remonte heartbeat machine/IP/utilisateur.

### Points de code importants
- Entree applicative: `Vigitemp agent/Vigitemp agent/HttpServer.cs` (Main dans ce fichier)
- Contexte UI/tray/session: `Vigitemp agent/Vigitemp agent/MyCustomApplicationContext.cs`
- Fallback loopback session server: `Vigitemp agent/Vigitemp agent/LoopbackSessionServer.cs`
- Config locale: `Vigitemp agent/Vigitemp agent/App.config`

### Endpoints agent locaux
- `POST /notify`
- `GET|POST|DELETE /session`
- `GET /info`
- `POST /agent-secret`

## Flux global simplifie
1. Le serveur C# detecte/evalue une alarme et persiste en DB.
2. Le serveur C# appelle l'API web de dispatch.
3. Le web cible les postes actifs et envoie `POST /notify` vers les agents.
4. Les agents affichent la notif et font callback vers le web.
5. Le web tient l'etat des livraisons/evenements et envoie email si applicable.

## Methode de travail conseillee pour retours collegues (captures)
- Conserver chaque retour sous format:
1. date/heure exacte
2. environnement (prod/test sur `192.168.63.189`)
3. capture
4. texte brut du retour
5. impact (bloquant/majeur/mineur)
6. composant suspect (serveur/web/agent)
7. statut (a analyser/en cours/corrige/deploye)
- En pratique, le fichier vivant existant est `docs/backlog-retours-live-2026-04.md`.

## Points d'attention
- Nom VigiSensys pas encore uniformise dans le code.
- Certains logs affichent encore des caracteres accentues mal encodes selon composants/outils.
- Les secrets serveur/web/agent doivent rester alignes entre briques.
