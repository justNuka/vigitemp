# Design — Audit complet C# : Serveur + Agent

**Date :** 2026-03-18
**Approche choisie :** Option A — deux plans indépendants exécutés en parallèle

## Contexte

Suite à une revue complète des deux projets C# .NET 4.8, un ensemble d'anomalies a été identifié dans :
- **Vigitemp Serveur** — logique d'alarme, sondes série, DB MySQL
- **Vigitemp Agent** — serveur HTTP local port 8000, WinForms, notifications

## Plan Serveur C# — 6 tâches

| Task | Thème | Anomalies |
|---|---|---|
| 1 | Thread safety | TS-01 `volatile pendingResults`, TS-02 lock `m_sensor_response`, TS-03 `sensor`/`sensorType` → vars locales, TS-04 `volatile m_database`, TS-05 `_lock` instance, TS-06 `Interlocked` |
| 2 | SerialPort lifecycle | RES-01 fermeture dans DataReceivedHandler, RES-02 purge liste |
| 3 | Ressources DB | RES-03 CacheService 1 connexion/mesure, RES-04 HttpClient dupliqué, RES-05 `using` sur MySqlCommand |
| 4 | Gestion d'erreurs | ERR-01 `Read()` ignoré, ERR-02 `DateTime.Parse` culture, ERR-03/04 SensorHN/SensorEN catch trop étroit, ERR-05 code HTTP non vérifié, ERR-06 sous-méthodes sans try/catch, BIZ-05 log SQL prod |
| 5 | Logique métier | BIZ-01 SeedAlarmState, BIZ-02 INSERT ON DUPLICATE KEY, BIZ-03 DateTime.Now/UTC, BIZ-06 Encoding, MISC-01 regex JS, MISC-03 writeAuditJournal, MISC-02 AlarmPolicy doc |
| 6 | Code mort | DEAD-01 `Console.WriteLine` sensors, DEAD-02 à DEAD-08 méthodes orphelines + interface, DEAD-05 `HotlineApiServer.ValidateApiKey` |

## Plan Agent C# — 5 tâches

| Task | Thème | Anomalies |
|---|---|---|
| 1 | Thread safety | TS-1 `url` init statique, TS-2 `listener` sans lock, TS-3 `SITEWEB_URL`/`AGENT_SECRET` volatile, TS-4 `frm` volatile |
| 2 | Ressources | RES-2 `Font` non disposé dans `showAlert`, RES-3 `Database` sans `IDisposable`, RES-4 `StatusForm._refreshTimer`, RES-5 rotation log VigilogWorker |
| 3 | Gestion d'erreurs | ERR-1 `/uploadLogTagConfiguration` TryGetValue, ERR-2 `DateTime` sans validation, ERR-3 `ParseNullableDoubleArg`, ERR-4 `SessionStore.Load` log, ERR-5 `Installer.cs` `MyApp.exe`, ERR-6 `GetLocalIPAddress` fallback, ERR-7 fallback `while(true)` sleep |
| 4 | Logique métier | LOG-2 double affectation `x`, LOG-3 timer stop on wait, LOG-4 `base.Opacity` → `this.Opacity`, LOG-5 JSON escaping, LOG-6 `portType` variable, LOG-7 `cbSize` |
| 5 | Code mort | DEAD-1 blocs commentés, DEAD-2 champs `x`/`y`, DEAD-3 `HttpServer.url` inutilisé, DEAD-4 imports, DEAD-6 `ExecuteVigilogOperation` + méthodes mortes |

## Notes

- RES-1 agent (`fonts?.Dispose()`) : déjà appliqué dans la session précédente (commit cb970e4) — à vérifier avant d'inclure
- Suppression de code mort dans l'interface `IDatabaseProvider` : à confirmer par grep avant suppression
- BIZ-02 (INSERT ON DUPLICATE KEY) : vérifier d'abord si une contrainte UNIQUE existe sur la table avant d'adapter la requête
