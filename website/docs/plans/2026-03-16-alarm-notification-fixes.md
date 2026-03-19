# Alarm Notification Fixes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corriger 5 bugs identifiés dans le flux de notifications d'alarme C# serveur → website → agent.

**Architecture:** Le serveur C# détecte les alarmes via polling de sondes, les écrit en DB (`t_alarme`), puis notifie le website Next.js via HTTP. Le website dispatche vers les agents Windows (port 8000) et envoie des emails. Le serveur maintient deux curseurs en mémoire : `_lastAlarmIdSeen` (ID-based) pour les nouvelles alarmes, `_lastAlarmEndPollLocal` (time-based) pour les fins d'alarme.

**Tech Stack:** C# .NET 4.8, MySQL (via MySqlConnector), `System.Net.Http.HttpClient`, `System.Configuration.ConfigurationManager`

---

## Contexte par bug

| # | Problème | Impact réel | Fichier |
|---|---|---|---|
| P3 | `_lastAlarmIdSeen = 0` si init DB échoue → flood de vieilles alarmes | Élevé | `ThreadServeur.cs` |
| P5 | `getEndedAlarmsSince` compare sur horloge locale C# sans buffer → alarmes manquées si drift | Moyen | `ThreadServeur.cs` |
| P4 | Aucun avertissement au démarrage si `Vigi.WebsiteBaseUrl` absent → silences totaux | Moyen | `AlarmWebNotifier.cs`, `ThreadServeur.cs` |
| P7 | `ReadLieuAlarmSettingsV2` hardcode `notificationActive: true` et `dateHeureReactivation: default` alors que les colonnes existent bien en DB | Moyen | `Database.cs` |
| P8 | `NotifyRealtimeAlarmAsync` lancé depuis l'intérieur du `lock (_lock)` de Database | Faible | `Database.cs` |

> **P1 (double notification) : FALSE ALARM.** `dispatch-realtime` → SSE web uniquement, `dispatch` → agent port 8000 + email. Endpoints complémentaires, pas de doublon.
> **P2 (redémarrage) : NON-ISSUE.** Le check SQL `WHERE Date_Heure_Fin IS NULL` empêche les double-INSERTs, et `_lastAlarmIdSeen` initialisé par `getLastAlarmIdByServeur` empêche le re-envoi (sauf si P3 = cursor à 0).
> **P6 (fire-and-forget ended) : DESIGN INTENTIONNEL.** Best-effort "at most once" pour les fins d'alarme.
> **P9 (`_lastAlarmIdSeen` volatile) : NON-ISSUE.** Protégé par le sémaphore, une seule exécution concurrente possible.

---

## Task 1 : Fix P3 — Sentinel pour le curseur d'initialisation

**Problème :** `_lastAlarmIdSeen` vaut `0` à la fois quand (a) l'init n'a pas encore eu lieu et (b) quand aucune alarme n'existe. Si `getLastAlarmIdByServeur` lève une exception, le curseur reste à `0` et le prochain poll envoie TOUTES les alarmes existantes (`Id_Alarme > 0`).

**Fix :** Ajouter un booléen `_alarmCursorInitialized`. Si l'init échoue, skiper le poll pour ce tick et retenter au suivant.

**Files:**
- Modify: `Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs:47-48` (champs), `281-298` (EnsureAlarmCursorInitialized), `311-355` (PollNewAlarmsAsync)

**Step 1: Ajouter le champ sentinel**

Ligne 47, après `private int _lastAlarmIdSeen = 0;`, ajouter :
```csharp
private bool _alarmCursorInitialized = false;
```

**Step 2: Modifier `EnsureAlarmCursorInitialized`**

```csharp
private void EnsureAlarmCursorInitialized()
{
    if (_alarmCursorInitialized)
    {
        return;
    }

    try
    {
        var lastId = GetDatabase().getLastAlarmIdByServeur(_idServer);
        _lastAlarmIdSeen = Math.Max(0, lastId);
        _alarmCursorInitialized = true;
        VigitempServeur.Log($"Alarm poll init: lastAlarmId={_lastAlarmIdSeen} server={_idServer}");
    }
    catch (Exception ex)
    {
        VigitempServeur.Log("Alarm poll init error (will retry next tick): " + ex.Message);
        // _alarmCursorInitialized reste false → skip poll ce tick
    }
}
```

**Step 3: Modifier `PollNewAlarmsAsync` pour vérifier le sentinel**

Dans `PollNewAlarmsAsync`, après `EnsureAlarmCursorInitialized();` (ligne 333), ajouter :
```csharp
EnsureAlarmCursorInitialized();

if (!_alarmCursorInitialized)
{
    VigitempServeur.Log("Alarm poll skipped: cursor not initialized yet");
    return;
}
```

**Step 4: Commit**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs"
git commit -m "fix(server): add sentinel to prevent alarm flood on cursor init failure"
```

---

## Task 2 : Fix P5 — Buffer de 10s dans `getEndedAlarmsSince`

**Problème :** `_lastAlarmEndPollLocal = DateTime.Now` (horloge C# locale) est comparé contre `Date_Heure_Fin` stocké avec `NOW()` MySQL (horloge DB locale). Si les deux machines ont des horloges légèrement décalées, des fins d'alarme peuvent être manquées.

**Fix :** Soustraire 10 secondes du curseur lors de la requête (overlap window). Les duplicates éventuels sont inoffensifs (hide alarm = opération idempotente).

**Files:**
- Modify: `Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs:366` (PollEndedAlarms)

**Step 1: Modifier `PollEndedAlarms`**

Remplacer :
```csharp
var ended = GetDatabase().getEndedAlarmsSince(_idServer, _lastAlarmEndPollLocal, _alarmPollMaxBatch);
```
Par :
```csharp
var queryFrom = _lastAlarmEndPollLocal.AddSeconds(-10);
var ended = GetDatabase().getEndedAlarmsSince(_idServer, queryFrom, _alarmPollMaxBatch);
```

**Step 2: Commit**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs"
git commit -m "fix(server): add 10s overlap buffer in ended alarm poll to prevent clock skew misses"
```

---

## Task 3 : Fix P4 — Validation de config au démarrage

**Problème :** Si `Vigi.WebsiteBaseUrl` ou `Vigi.AlarmDispatchSecret` n'est pas configuré dans `App.config`, toutes les notifications sont silencieusement ignorées. Aucun avertissement au démarrage.

**Files:**
- Modify: `Vigitemp Serveur/Vigitemp Serveur/AlarmWebNotifier.cs` (nouvelle méthode `ValidateConfig`)
- Modify: `Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs:380` (appel depuis `Start()`)

**Step 1: Ajouter `ValidateConfig` dans `AlarmWebNotifier`**

Après la déclaration du `_http` static (ligne 13), ajouter :
```csharp
public static void ValidateConfig()
{
    var baseUrl = ConfigurationManager.AppSettings["Vigi.WebsiteBaseUrl"];
    var secret = ConfigurationManager.AppSettings["Vigi.AlarmDispatchSecret"];

    if (string.IsNullOrWhiteSpace(baseUrl))
    {
        VigitempServeur.Log("WARNING AlarmWebNotifier: Vigi.WebsiteBaseUrl non configuré dans App.config. Aucune notification d'alarme ne sera envoyée aux agents.");
    }
    else
    {
        VigitempServeur.Log($"AlarmWebNotifier: WebsiteBaseUrl={baseUrl}");
    }

    if (string.IsNullOrWhiteSpace(secret))
    {
        VigitempServeur.Log("WARNING AlarmWebNotifier: Vigi.AlarmDispatchSecret non configuré dans App.config. Les requêtes seront rejetées avec 401.");
    }
    else
    {
        VigitempServeur.Log("AlarmWebNotifier: AlarmDispatchSecret configuré.");
    }
}
```

**Step 2: Appeler `ValidateConfig` depuis `ThreadServeur.Start()`**

Au début de `Start()` (ligne 382), après le log d'ouverture, ajouter :
```csharp
AlarmWebNotifier.ValidateConfig();
```

**Step 3: Commit**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/AlarmWebNotifier.cs" "Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs"
git commit -m "fix(server): add startup config validation for WebsiteBaseUrl and AlarmDispatchSecret"
```

---

## Task 4 : Fix P7 — Lire `Notification_Active` et `Date_Heure_Reactivation_Alarme` dans ReadLieuAlarmSettingsV2

**Problème :** `ReadLieuAlarmSettingsV2` hardcode `notificationActive: true` et `dateHeureReactivationAlarme: default(DateTime)`. Or, les colonnes `Notification_Active` et `Date_Heure_Reactivation_Alarme` existent bien dans le schéma Prisma V2 (confirmé dans `prisma/db-main/schema.prisma` lignes 394-395). Un lieu avec notifications désactivées est ignoré.

**Files:**
- Modify: `Vigitemp Serveur/Vigitemp Serveur/Database.cs:444-495` (ReadLieuAlarmSettingsV2)

**Step 1: Ajouter les colonnes au SELECT**

Remplacer la ligne de fin de `cmd.CommandText` dans `ReadLieuAlarmSettingsV2` :
```csharp
"Retard_Alarme_Changement_Consigne, Nb_Mesures_Temporisation_Redeclenchement, Planning_Derniere_Maj " +
```
Par :
```csharp
"Retard_Alarme_Changement_Consigne, Nb_Mesures_Temporisation_Redeclenchement, Planning_Derniere_Maj, " +
"Notification_Active, Date_Heure_Reactivation_Alarme " +
```

**Step 2: Lire les colonnes dans le return**

Dans le return du reader (ligne 477), remplacer :
```csharp
// Legacy fields not present in Prisma schema: default to "enabled"
notificationActive: true,
dateHeureReactivationAlarme: default(DateTime),
```
Par :
```csharp
notificationActive: GetNullableBool(reader, "Notification_Active", true),
dateHeureReactivationAlarme: GetNullableDateTime(reader, "Date_Heure_Reactivation_Alarme") ?? default(DateTime),
```

**Step 3: Vérifier que `GetNullableDateTime` accepte le cas null correctement**

Chercher dans `Database.cs` la méthode `GetNullableDateTime`. Elle doit retourner `null` si la valeur est `DBNull`. Si elle retourne `DateTime?`, le `?? default(DateTime)` est correct.

**Step 4: Commit**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/Database.cs"
git commit -m "fix(server): read Notification_Active and Date_Heure_Reactivation_Alarme from V2 schema instead of hardcoding"
```

---

## Task 5 : Fix P8 — Sortir `NotifyRealtimeAlarmAsync` du `lock (_lock)` dans Database.cs

**Problème :** `NotifyRealtimeAlarmAsync` est lancé en fire-and-forget depuis l'intérieur du `lock (_lock)`. La Task démarre pendant que le lock est tenu. Pattern fragile : si le réseau répond très vite, le website peut interroger la DB avant que le lock soit relâché par l'appelant.

**Files:**
- Modify: `Vigitemp Serveur/Vigitemp Serveur/Database.cs` — méthodes `setThresholdAlarm` (l.1681), `setNonResponseAlarm` (l.1533), `setThresholdAlarmEnded` (l.1778)

**Principe :** Capturer les infos de notification dans des variables locales à l'intérieur du lock, puis appeler `NotifyRealtimeAlarmAsync` après la sortie du lock.

**Step 1: Refactor `setThresholdAlarm`**

Remplacer le pattern dans `setThresholdAlarm` :
```csharp
// AVANT (dans le lock)
if (existing == null || existing == DBNull.Value)
{
    _ = AlarmWebNotifier.NotifyRealtimeAlarmAsync(alarmId, idLieu, "triggered");
}
// ...
if (updated > 0)
    _ = AlarmWebNotifier.NotifyRealtimeAlarmAsync(null, idLieu, "ended");
```

Par :
```csharp
// DANS le lock : capturer uniquement
bool notifyTriggered = false;
bool notifyEnded = false;
int? capturedAlarmId = null;

// ... (SQL inchangé) ...

if (existing == null || existing == DBNull.Value)
{
    notifyTriggered = true;
    capturedAlarmId = alarmId;
}

// ... (cas ended) ...
if (updated > 0)
    notifyEnded = true;

// FIN du lock
// APRÈS le lock :
if (notifyTriggered)
    _ = AlarmWebNotifier.NotifyRealtimeAlarmAsync(capturedAlarmId, idLieu, "triggered");
if (notifyEnded)
    _ = AlarmWebNotifier.NotifyRealtimeAlarmAsync(null, idLieu, "ended");
```

**Step 2: Même refactor dans `setNonResponseAlarm`**

Même pattern : capturer `notifyTriggered` / `notifyEnded` dans le lock, appeler après.

**Step 3: Même refactor dans `setThresholdAlarmEnded`**

```csharp
bool notifyEnded = false;
lock (_lock) {
    // ... SQL ...
    if (updated > 0) notifyEnded = true;
}
if (notifyEnded)
    _ = AlarmWebNotifier.NotifyRealtimeAlarmAsync(null, idLieu, "ended");
```

**Step 4: Commit**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/Database.cs"
git commit -m "refactor(server): move NotifyRealtimeAlarmAsync calls outside DB lock to prevent lock contention"
```

---

## Vérification finale

Après tous les commits :
1. Compiler le projet (`Build > Rebuild Solution` dans Visual Studio) — zéro erreur attendu
2. Vérifier les logs au démarrage du serveur : les lignes `AlarmWebNotifier:` doivent apparaître avec les valeurs de config
3. Vérifier que `Alarm poll init: lastAlarmId=` apparaît au premier tick
4. Simuler une alarme : vérifier que `NotifyRealtimeAlarmAsync` est loggé APRÈS la fin de la méthode SQL dans les logs (pas de chevauchement visible)
