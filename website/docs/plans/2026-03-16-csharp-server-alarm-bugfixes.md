# C# Server Alarm Bug Fixes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corriger 10 bugs identifiés lors de l'audit du serveur C# (alarmes, pré-alarmes, sondes, performances).

**Architecture:** Sensor.cs (logique alarme + communication sondes), AlarmStateEvaluator.cs (machine d'état mémoire), ThreadServeur.cs (orchestrateur timers + snooze), Database.cs / SqlServerDatabaseProvider.cs (accès données MySQL/SQL Server).

**Tech Stack:** C# .NET 4.8, MySqlConnector, System.IO.Ports, ConcurrentDictionary

---

## Bug List

| # | Priorité | Problème | Fichier |
|---|---|---|---|
| B1 | Critique | `setThresholdAlarmEnded` appelé de manière redondante dans `ApplyAlarmState` — peut envoyer une notification "ended" même quand la DB l'a déjà fait via `setThresholdAlarm` | `Sensor.cs:488` |
| B2 | Critique | `SensorHN.read()` ajoute un second handler `DataReceived` sur le port à chaque retry sans enlever le premier → double-parse de chaque trame | `SensorHN.cs:51` |
| B3 | Critique | Aucune réconciliation mémoire/DB au démarrage : `_alarmStateByLieu` est vide, les alarmes actives en DB sont ignorées jusqu'à la prochaine mesure → fenêtre silencieuse de N secondes | `Sensor.cs:472`, `AlarmStateEvaluator.cs`, `ThreadServeur.cs` |
| B4 | Critique | `getLastMeasure` : `double.Parse(dr_mesure["Valeur"].ToString())` crashe si `Valeur` est `DBNull` (mesures no-response) | `Database.cs:1225` |
| B5 | Important | `SensorIE.read()` : busy-wait `while (elapsed < 100) {}` bloque le thread et le sémaphore pendant 100ms | `SensorIE.cs:33` |
| B6 | Important | `_retriggerThresholdWaitCountByLieu` est partagé entre les canaux H (haut) et B (bas) → un retrigger bas remet à zéro le compteur haut (et vice-versa) | `Sensor.cs:187,197,202` |
| B7 | Important | La boucle snooze dans `ProcessMaintenanceTick` n'isole pas les exceptions par lieu → une exception sur un lieu arrête le traitement des lieux suivants | `ThreadServeur.cs:663-734` |
| B8 | Important | `sensor.compareMeasuresAndLimits(derniereMesure.value, unit)` utilise `0.0` si aucune mesure n'existe en DB, pouvant déclencher des fausses alarmes basses | `ThreadServeur.cs:733` |
| B9 | Important | `getLieuImmediateRetriggerFlag` appelé deux fois par mesure (lignes 173 et 355), soit 2 requêtes SQL inutiles par cycle | `Sensor.cs:173,355` |
| B10 | Important | `AddMesure` dans `SqlServerDatabaseProvider` n'exécute pas `UPDATE t_lieu` → `Derniere_Valeur` et `Date_Derniere_Mesure` restent `NULL` sur SQL Server | `SqlServerDatabaseProvider.cs` (autour de ligne 542) |

---

## Task 1 : Fix B1 — Supprimer l'appel redondant à `setThresholdAlarmEnded` dans `ApplyAlarmState`

**Problème :** `ApplyAlarmState` appelle `setThresholdAlarmEnded` (ligne 488) lorsque `prevAlarm && !alarmActive`. Or `setThresholdAlarmEnded` est également appelé dans `setThresholdAlarm` (Database.cs) sur `UPDATE`. Le résultat : deux appels SQL "ended" séquentiels, plus deux notifications SSE "ended".

**Analyse :** La logique correcte est : `setThresholdAlarmEnded` gère la mise à jour DB de `Date_Heure_Fin`. `ApplyAlarmState` doit seulement notifier les agents (POST `alarm?action=hide`). L'appel à `setThresholdAlarmEnded` dans `ApplyAlarmState` est donc redondant.

**Files:**
- Modify: `Vigitemp Serveur/Vigitemp Serveur/Sensor.cs:486-496`

**Step 1: Lire le contexte exact**

Lire `Sensor.cs` lignes 470–498.

**Step 2: Supprimer l'appel redondant**

Remplacer dans `ApplyAlarmState` (bloc `else if (prevAlarm && !alarmActive)`) :
```csharp
else if (prevAlarm && !alarmActive)
{
    ths.GetDatabase().setThresholdAlarmEnded(m_idLieu);   // ← SUPPRIMER CETTE LIGNE
    ths.GetDatabase().setLieuImmediateRetriggerFlag(m_idLieu, true);
    _retriggerThresholdWaitCountByLieu[m_idLieu] = 0;
    VigitempServeur.Log($"Alarme terminée (H/B) pour le lieu {m_idLieu} - sonde {m_sondeSerialNumber}");
    var ips_clients = ths.GetDatabase().getPCsClients();
    for (int i = 0; i < ips_clients.Count; i++)
    {
        _ = client.PostAsync("http://" + ips_clients[i] + ":8000/alarm?action=hide&idLieu=" + m_idLieu, null);
    }
}
```
Par :
```csharp
else if (prevAlarm && !alarmActive)
{
    ths.GetDatabase().setLieuImmediateRetriggerFlag(m_idLieu, true);
    _retriggerThresholdWaitCountByLieu[m_idLieu] = 0;
    VigitempServeur.Log($"Alarme terminée (H/B) pour le lieu {m_idLieu} - sonde {m_sondeSerialNumber}");
    var ips_clients = ths.GetDatabase().getPCsClients();
    for (int i = 0; i < ips_clients.Count; i++)
    {
        _ = client.PostAsync("http://" + ips_clients[i] + ":8000/alarm?action=hide&idLieu=" + m_idLieu, null);
    }
}
```

**Step 3: Commit**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/Sensor.cs"
git commit -m "fix(server): remove redundant setThresholdAlarmEnded call in ApplyAlarmState"
```

---

## Task 2 : Fix B2 — SensorHN double handler DataReceived sur retry

**Problème :** Dans `SensorHN.read()`, à la ligne 51, lors du retry (timeout 1000ms), le code fait :
```csharp
m_port.Close();
m_port.DataReceived += new SerialDataReceivedEventHandler(DataReceivedHandler);  // ← BUG
m_port.Open();
```
Le handler est ajouté sans retirer le précédent. Or le handler initial est enregistré... nulle part dans SensorHN — il est absent du constructeur. C'est donc la ligne 51 qui ajoute le premier handler, mais si un second retry arrive, elle ajoute un deuxième handler. Chaque trame reçue déclenchera `DataReceivedHandler` deux fois → double `AddMesure`, double `compareMeasuresAndLimits`.

**Fix :** Enregistrer le handler dans le constructeur (comme SensorIE), retirer l'ajout au retry. Ajouter `-=` puis `+=` à chaque Open pour être robuste.

**Files:**
- Modify: `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorHN.cs:18-21` (constructeur), `49-52` (retry)

**Step 1: Ajouter le handler dans le constructeur**

Dans le constructeur `SensorHN`, après `this.m_moduleSerialNumber = p_moduleSerialNumber;`, ajouter :
```csharp
m_port.DataReceived += new SerialDataReceivedEventHandler(DataReceivedHandler);
```

**Step 2: Supprimer le `+=` dans le bloc retry**

Dans le bloc retry (après `m_port.Close();` ligne ~50), supprimer :
```csharp
m_port.DataReceived += new SerialDataReceivedEventHandler(DataReceivedHandler);
```

**Résultat attendu :** Le handler est enregistré une seule fois, comme dans SensorIE.

**Step 3: Commit**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorHN.cs"
git commit -m "fix(server): register SensorHN DataReceived handler once in constructor, not on every retry"
```

---

## Task 3 : Fix B4 — `getLastMeasure` crash sur DBNull

**Problème :** `getLastMeasure(int idLieu)` à la ligne 1225 :
```csharp
array_tmpIdLieu = double.Parse(dr_mesure["Valeur"].ToString());
```
Si `Valeur` est `DBNull` (mesures no-response insérées avec `NULL`), `ToString()` retourne `""`, et `double.Parse("")` lève une `FormatException` → crash dans le lock MySQL.

**Files:**
- Modify: `Vigitemp Serveur/Vigitemp Serveur/Database.cs:1225`

**Step 1: Corriger le parse**

Remplacer :
```csharp
array_tmpIdLieu = double.Parse(dr_mesure["Valeur"].ToString());
```
Par :
```csharp
var rawVal = dr_mesure["Valeur"];
if (rawVal != null && rawVal != DBNull.Value)
{
    double.TryParse(rawVal.ToString(), System.Globalization.NumberStyles.Any,
        System.Globalization.CultureInfo.InvariantCulture, out array_tmpIdLieu);
}
```

**Step 2: Commit**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/Database.cs"
git commit -m "fix(server): guard against DBNull in getLastMeasure to prevent parse crash"
```

---

## Task 4 : Fix B5 — SensorIE busy-wait 100ms

**Problème :** `SensorIE.read()` ligne 33 :
```csharp
while (tmp_sw.Elapsed.TotalMilliseconds < 100) { }
```
Cette boucle vide occupe 100% du CPU pendant 100ms et bloque le thread (et donc potentiellement le sémaphore) inutilement. L'objectif est juste d'attendre 100ms entre les deux envois de commande.

**Files:**
- Modify: `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIE.cs:33`

**Step 1: Remplacer le busy-wait par await Task.Delay**

Remplacer :
```csharp
while (tmp_sw.Elapsed.TotalMilliseconds < 100) { }
```
Par :
```csharp
await Task.Delay(100);
```

**Step 2: Commit**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIE.cs"
git commit -m "fix(server): replace busy-wait with await Task.Delay(100) in SensorIE"
```

---

## Task 5 : Fix B6 — Séparer les compteurs de retrigger H et B

**Problème :** `_retriggerThresholdWaitCountByLieu` (type `ConcurrentDictionary<int, int>`) est utilisé pour les deux canaux "alarm-high" ET "alarm-low". Quand la valeur sort de la plage haute, le compteur est incrémenté. Si en même temps elle rentre dans la plage haute mais reste hors de la plage basse, le compteur est remis à zéro (ligne 197 ou 202). Le canal bas repart alors de 0 et doit attendre à nouveau `NbMesuresTemporisationRedeclenchement` mesures.

**Fix :** Créer deux dictionnaires séparés : `_retriggerLowWaitCountByLieu` et `_retriggerHighWaitCountByLieu`.

**Files:**
- Modify: `Vigitemp Serveur/Vigitemp Serveur/Sensor.cs:42-43` (déclarations), `183-217` (compareMeasuresAndLimits), `490` (ApplyAlarmState reset), `500-508` (ClearAlarmState)

**Step 1: Renommer/ajouter les dictionnaires**

Remplacer la déclaration unique :
```csharp
private static readonly ConcurrentDictionary<int, int> _retriggerThresholdWaitCountByLieu =
    new ConcurrentDictionary<int, int>();
```
Par deux déclarations :
```csharp
private static readonly ConcurrentDictionary<int, int> _retriggerLowWaitCountByLieu =
    new ConcurrentDictionary<int, int>();
private static readonly ConcurrentDictionary<int, int> _retriggerHighWaitCountByLieu =
    new ConcurrentDictionary<int, int>();
```

**Step 2: Mettre à jour `compareMeasuresAndLimits`**

Dans le bloc `if (forceImmediateRetrigger)` (lignes 183-203), remplacer toutes les références à `_retriggerThresholdWaitCountByLieu` par le dictionnaire approprié selon le canal :

```csharp
if (forceImmediateRetrigger)
{
    if (outOfToleranceNow)
    {
        if (outLowNow)
        {
            var waitCount = _retriggerLowWaitCountByLieu.AddOrUpdate(m_idLieu, 1, (_, previous) => previous + 1);
            suppressRetriggerThisMeasure = waitCount <= retriggerDelayMeasures;
            if (!suppressRetriggerThisMeasure)
            {
                forceLowImmediate = true;
            }
        }
        if (outHighNow)
        {
            var waitCount = _retriggerHighWaitCountByLieu.AddOrUpdate(m_idLieu, 1, (_, previous) => previous + 1);
            var suppressHigh = waitCount <= retriggerDelayMeasures;
            if (!suppressHigh)
            {
                forceHighImmediate = true;
            }
            else
            {
                suppressRetriggerThisMeasure = true;
            }
        }
    }
    else
    {
        _retriggerLowWaitCountByLieu[m_idLieu] = 0;
        _retriggerHighWaitCountByLieu[m_idLieu] = 0;
    }
}
else
{
    _retriggerLowWaitCountByLieu[m_idLieu] = 0;
    _retriggerHighWaitCountByLieu[m_idLieu] = 0;
}
```

**Step 3: Mettre à jour `ApplyAlarmState` (reset)**

Remplacer (ligne ~490) :
```csharp
_retriggerThresholdWaitCountByLieu[m_idLieu] = 0;
```
Par :
```csharp
_retriggerLowWaitCountByLieu[m_idLieu] = 0;
_retriggerHighWaitCountByLieu[m_idLieu] = 0;
```

**Step 4: Mettre à jour `ClearAlarmState`**

Remplacer :
```csharp
_retriggerThresholdWaitCountByLieu.TryRemove(idLieu, out _);
```
Par :
```csharp
_retriggerLowWaitCountByLieu.TryRemove(idLieu, out _);
_retriggerHighWaitCountByLieu.TryRemove(idLieu, out _);
```

**Step 5: Commit**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/Sensor.cs"
git commit -m "fix(server): split retrigger threshold counter into separate low/high dictionaries"
```

---

## Task 6 : Fix B7 + B8 — Isolation d'exceptions et 0.0 dans la boucle snooze

**B7 :** La boucle `for (int i = 0; i < arr_lieuxAvecAlarmeSnooze.Count(); i++)` n'isole pas les exceptions par lieu. Une exception (ex. lieu sans sonde, serialNumber invalide) coupe le traitement de tous les lieux suivants jusqu'à la fin de `ProcessMaintenanceTick`.

**B8 :** Ligne 733, `sensor.compareMeasuresAndLimits(derniereMesure.value, unit)` est appelé avec `value = 0.0` si aucune mesure n'existe (retour par défaut de `getLastMeasureWithUnit`). Cela peut déclencher une fausse alarme basse.

**Fix B7 :** Entourer le corps de la boucle d'un `try/catch` individuel.

**Fix B8 :** Vérifier que `getLastMeasureWithUnit` a retourné une vraie mesure avant d'appeler `compareMeasuresAndLimits`. On peut vérifier `derniereMesure.value != 0.0 || !string.IsNullOrEmpty(derniereMesure.unit)` — ou mieux, renvoyer un booléen `hasValue` depuis `getLastMeasureWithUnit`.

**Files:**
- Modify: `Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs:663-734`

**Step 1: Ajouter `hasValue` au retour de `getLastMeasureWithUnit`**

Dans `Database.cs`, modifier la signature de `getLastMeasureWithUnit` :
```csharp
// AVANT
public (double value, string unit) getLastMeasureWithUnit(int idLieu)

// APRÈS
public (double value, string unit, bool hasValue) getLastMeasureWithUnit(int idLieu)
```

Dans le corps, retourner `hasValue = true` quand une ligne est lue, `false` sinon. Exemple :
```csharp
bool hasValue = false;
while (dr.Read())
{
    var raw = dr["Valeur"];
    if (raw != null && raw != DBNull.Value)
    {
        double.TryParse(raw.ToString(), System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture, out value);
        hasValue = true;
    }
    var rawUnit = dr["Unite"];
    if (rawUnit != null && rawUnit != DBNull.Value)
    {
        unit = rawUnit.ToString();
    }
}
return (value, unit, hasValue);
```

Faire de même dans `SqlServerDatabaseProvider.cs` pour la même méthode (l'interface `IDatabaseProvider` devra être mise à jour).

**Step 2: Mettre à jour `IDatabaseProvider`**

Modifier la signature dans `IDatabaseProvider.cs` :
```csharp
(double value, string unit, bool hasValue) getLastMeasureWithUnit(int idLieu);
```

**Step 3: Mettre à jour la boucle snooze dans `ThreadServeur.cs`**

Entourer le corps de la boucle d'un `try/catch` et ajouter la vérification `hasValue` :

```csharp
for (int i = 0; i < arr_lieuxAvecAlarmeSnooze.Count(); i++)
{
    try
    {
        var idLieu = arr_lieuxAvecAlarmeSnooze[i];
        VigitempServeur.Log("Le lieu " + idLieu + " doit etre reactiv\u00e9.");

        GetDatabase().setAlarmeByIdLieu(idLieu, true);

        var derniereMesure = GetDatabase().getLastMeasureWithUnit(idLieu);

        if (!derniereMesure.hasValue)
        {
            VigitempServeur.Log($"Snooze reactiv\u00e9 pour lieu {idLieu} : aucune mesure existante, comparaison ignor\u00e9e.");
            continue;
        }

        (string arr_portSerie, string arr_sondeNumeroSerie, string arr_sondeAdresse, string arr_moduleNumeroSerie) = GetDatabase().getInfosByIdLieu(idLieu);

        if (string.IsNullOrEmpty(arr_sondeNumeroSerie) || arr_sondeNumeroSerie.Length < 2)
        {
            VigitempServeur.Log("Numero de serie invalide pour le lieu " + idLieu + ".");
            continue;
        }

        // ... (switch sensorType inchangé) ...

        if (sensor == null)
        {
            VigitempServeur.Log("Aucun capteur cr\u00e9\u00e9 pour le lieu " + idLieu + ".");
            continue;
        }

        string unit;
        if (string.IsNullOrWhiteSpace(derniereMesure.unit))
        {
            var fallbackUnit = GetDatabase().getLieuUnite(idLieu);
            VigitempServeur.Log($"Unite mesure absente en maintenance (lieu {idLieu}). Fallback Derniere_Unite={fallbackUnit}");
            unit = fallbackUnit;
        }
        else
        {
            unit = derniereMesure.unit;
        }

        sensor.compareMeasuresAndLimits(derniereMesure.value, unit);
    }
    catch (Exception exLieu)
    {
        VigitempServeur.Log($"ProcessMaintenanceTick: erreur lieu {arr_lieuxAvecAlarmeSnooze[i]}: {exLieu.Message}");
    }
}
```

**Step 4: Commit**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs" "Vigitemp Serveur/Vigitemp Serveur/Database.cs" "Vigitemp Serveur/Vigitemp Serveur/SqlServerDatabaseProvider.cs" "Vigitemp Serveur/Vigitemp Serveur/IDatabaseProvider.cs"
git commit -m "fix(server): isolate snooze loop exceptions per lieu + guard 0.0 compareMeasures on no prior data"
```

---

## Task 7 : Fix B9 — Éviter le double appel à `getLieuImmediateRetriggerFlag`

**Problème :** Dans `compareMeasuresAndLimits` (ligne 173) ET dans `HandleNoResponseAlarm` (ligne 355), `getLieuImmediateRetriggerFlag` est appelé séparément. Ces deux méthodes sont souvent appelées consécutivement depuis le même cycle de mesure → 2 requêtes SQL pour le même flag.

**Fix :** Le flag est déjà lu une fois par méthode. Il n'y a pas de double appel dans UNE seule méthode, donc le coût est 2 SQL par mesure (1 par méthode). Le vrai fix serait de mettre en cache le flag dans `LieuAlarmSettings` (TTL court ou invalidation explicite).

**Approche :** Ajouter `ImmediateRetriggerFlag` comme champ dans `LieuAlarmSettings` lu depuis la DB. Mais `LieuAlarmSettings` a un TTL de 60s ce qui serait trop long. Alternative plus simple : créer un cache dédié dans `ThreadServeur` avec TTL de 5 secondes.

**Approche retenue :** Cache léger dans `ThreadServeur` — `ConcurrentDictionary<int, (bool flag, DateTime expiry)>` avec TTL de 5s.

**Files:**
- Modify: `Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs` (nouveau champ + nouvelle méthode `GetLieuRetriggerFlagCached`)
- Modify: `Vigitemp Serveur/Vigitemp Serveur/Sensor.cs:173,355` (utiliser le cache)

**Step 1: Ajouter le cache dans `ThreadServeur`**

Après les champs existants (ligne ~45), ajouter :
```csharp
private readonly ConcurrentDictionary<int, (bool flag, DateTime expiry)> _retriggerFlagCache =
    new ConcurrentDictionary<int, (bool, DateTime)>();
private const int _retriggerFlagCacheMs = 5000;

public bool GetLieuRetriggerFlagCached(int idLieu)
{
    if (_retriggerFlagCache.TryGetValue(idLieu, out var cached) && DateTime.UtcNow < cached.expiry)
    {
        return cached.flag;
    }
    var flag = GetDatabase().getLieuImmediateRetriggerFlag(idLieu);
    _retriggerFlagCache[idLieu] = (flag, DateTime.UtcNow.AddMilliseconds(_retriggerFlagCacheMs));
    return flag;
}

public void InvalidateRetriggerFlagCache(int idLieu)
{
    _retriggerFlagCache.TryRemove(idLieu, out _);
}
```

**Step 2: Mettre à jour `Sensor.cs`**

Remplacer à la ligne 173 :
```csharp
var forceImmediateRetrigger = ths.GetDatabase().getLieuImmediateRetriggerFlag(m_idLieu);
```
Par :
```csharp
var forceImmediateRetrigger = ths.GetLieuRetriggerFlagCached(m_idLieu);
```

Remplacer à la ligne 355 :
```csharp
var forceRetriggerFlag = ths.GetDatabase().getLieuImmediateRetriggerFlag(m_idLieu);
```
Par :
```csharp
var forceRetriggerFlag = ths.GetLieuRetriggerFlagCached(m_idLieu);
```

Et après chaque appel `setLieuImmediateRetriggerFlag(m_idLieu, ...)` dans Sensor.cs, invalider le cache :
```csharp
ths.InvalidateRetriggerFlagCache(m_idLieu);
```

**Step 3: Commit**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs" "Vigitemp Serveur/Vigitemp Serveur/Sensor.cs"
git commit -m "perf(server): cache getLieuImmediateRetriggerFlag with 5s TTL to avoid duplicate SQL per measurement"
```

---

## Task 8 : Fix B10 — `AddMesure` SQL Server manquant UPDATE t_lieu

**Problème :** Dans `SqlServerDatabaseProvider.cs`, la méthode `AddMesure` insère la mesure dans `tm_mesures` mais n'exécute pas `UPDATE t_lieu SET Derniere_Valeur=..., Date_Derniere_Mesure=...`. Résultat : le champ `Derniere_Valeur` reste `NULL` indéfiniment sur les installations SQL Server.

**Fix :** Ajouter le même `UPDATE t_lieu` que dans `Database.cs` (MySQL).

**Files:**
- Modify: `Vigitemp Serveur/Vigitemp Serveur/SqlServerDatabaseProvider.cs` (méthode `AddMesure`)

**Step 1: Lire la méthode `AddMesure` dans `SqlServerDatabaseProvider.cs`**

Repérer la fin de l'INSERT dans `AddMesure` (autour de ligne 542).

**Step 2: Ajouter l'UPDATE**

Après l'exécution de l'INSERT, ajouter (même transaction ou connexion) :
```csharp
using (var cmdUpdate = conn.CreateCommand())
{
    cmdUpdate.Transaction = transaction; // si transaction existante
    cmdUpdate.CommandText =
        "UPDATE t_lieu SET " +
        "Derniere_Valeur = @valeur, " +
        "Date_Derniere_Mesure = @dateMesure " +
        "WHERE Id_Lieu = (SELECT Id_Lieu FROM t_sonde WHERE Numero_Serie = @serial)";
    cmdUpdate.Parameters.AddWithValue("@valeur", valeur);
    cmdUpdate.Parameters.AddWithValue("@dateMesure", DateTime.Now);
    cmdUpdate.Parameters.AddWithValue("@serial", serialNumber);
    cmdUpdate.ExecuteNonQuery();
}
```
Adapter les noms de paramètres aux variables locales existantes dans la méthode.

**Step 3: Commit**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/SqlServerDatabaseProvider.cs"
git commit -m "fix(server): add missing UPDATE t_lieu Derniere_Valeur in SqlServer AddMesure"
```

---

## Task 9 : Fix B3 — Réconciliation mémoire/DB au démarrage

**Problème :** À l'initialisation, `_alarmStateByLieu` est vide. Si une alarme était active en DB avant le démarrage du serveur, elle ne sera pas connue de `Sensor.compareMeasuresAndLimits` → `AlarmStateEvaluator` démarrera en `IsActive=false` et re-déclenchera l'alarme après debounce (pire cas : X secondes silencieuses, puis double notification).

**Fix :** Ajouter une méthode `ForceActive` dans `AlarmStateEvaluator`, puis appeler une méthode de réconciliation dans `ThreadServeur.Start()` qui lit les alarmes actives en DB et force l'état mémoire.

**Files:**
- Modify: `Vigitemp Serveur/Vigitemp Serveur/AlarmStateEvaluator.cs` (nouvelle méthode `ForceActive`)
- Modify: `Vigitemp Serveur/Vigitemp Serveur/Sensor.cs` (nouvelle méthode statique `SeedAlarmState`)
- Modify: `Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs` (appel dans `Start()`)

**Step 1: Ajouter `ForceActive` dans `AlarmStateEvaluator`**

Après `ResetState`, ajouter :
```csharp
public static void ForceActive(string channel, int idLieu)
{
    if (idLieu <= 0) return;
    if (channel == null) channel = "alarm";
    var key = channel + ":" + idLieu;
    var state = _stateByKey.GetOrAdd(key, _ => new RuntimeState());
    lock (state)
    {
        state.IsActive = true;
        state.OutOfRangeSinceUtc = null;
    }
}
```

**Step 2: Ajouter `SeedAlarmState` dans `Sensor.cs`**

Après `ClearAlarmState`, ajouter une méthode statique publique :
```csharp
/// <summary>
/// Appelé au démarrage pour réconcilier l'état mémoire avec la DB.
/// Évite qu'une alarme active soit ignorée jusqu'à la prochaine mesure.
/// </summary>
public static void SeedAlarmState(int idLieu, bool isAlarmActive, bool isNoResponseActive)
{
    if (isAlarmActive)
    {
        _alarmStateByLieu[idLieu] = true;
        // On force le channel générique ; les canaux low/high seront affinés
        // à la prochaine vraie mesure.
        AlarmStateEvaluator.ForceActive("alarm-low", idLieu);
        AlarmStateEvaluator.ForceActive("alarm-high", idLieu);
    }
    if (isNoResponseActive)
    {
        _noResponseStateByLieu[idLieu] = true;
        AlarmStateEvaluator.ForceActive("alarm-nr", idLieu);
        _alarmStateByLieu[idLieu] = true;
    }
}
```

**Step 3: Ajouter la requête DB et l'appel dans `ThreadServeur.Start()`**

Dans `Database.cs`, ajouter :
```csharp
public List<(int idLieu, bool isAlarm, bool isNonResponse)> getActiveLieuAlarmStates()
{
    lock (_lock)
    {
        var result = new List<(int, bool, bool)>();
        if (!EnsureConnected()) return result;
        using (var cmd = connection_vigitemp.CreateCommand())
        {
            cmd.CommandText =
                "SELECT Id_Lieu, Alarme, Non_Reponse FROM t_lieu WHERE Alarme = 1 OR Non_Reponse = 1";
            using (var dr = cmd.ExecuteReader())
            {
                while (dr.Read())
                {
                    result.Add((
                        Convert.ToInt32(dr["Id_Lieu"]),
                        Convert.ToInt32(dr["Alarme"]) == 1,
                        Convert.ToInt32(dr["Non_Reponse"]) == 1));
                }
            }
        }
        return result;
    }
}
```

Dans `IDatabaseProvider.cs`, ajouter la signature correspondante.

Dans `SqlServerDatabaseProvider.cs`, ajouter l'implémentation équivalente (colonnes identiques).

Dans `ThreadServeur.Start()`, après `AlarmWebNotifier.ValidateConfig();` et la connexion initiale, ajouter :
```csharp
try
{
    var activeStates = GetDatabase().getActiveLieuAlarmStates();
    foreach (var s in activeStates)
    {
        Sensor.SeedAlarmState(s.idLieu, s.isAlarm, s.isNonResponse);
    }
    VigitempServeur.Log($"Alarm state seeded: {activeStates.Count} lieux actifs en DB au démarrage.");
}
catch (Exception ex)
{
    VigitempServeur.Log("Alarm state seed error (non-fatal): " + ex.Message);
}
```

**Step 4: Commit**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/AlarmStateEvaluator.cs" "Vigitemp Serveur/Vigitemp Serveur/Sensor.cs" "Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs" "Vigitemp Serveur/Vigitemp Serveur/Database.cs" "Vigitemp Serveur/Vigitemp Serveur/SqlServerDatabaseProvider.cs" "Vigitemp Serveur/Vigitemp Serveur/IDatabaseProvider.cs"
git commit -m "fix(server): reconcile in-memory alarm state with DB on startup to prevent silent alarm gap"
```

---

## Vérification finale

1. Compiler (`Build > Rebuild Solution`) — zéro erreur attendu
2. Vérifier au démarrage que `Alarm state seeded: N lieux...` apparaît dans les logs
3. Simuler une mesure HN valide → `DataReceivedHandler` déclenché une seule fois (pas deux)
4. Simuler une fin d'alarme → un seul log `setThresholdAlarmEnded`, une seule notification "ended"
5. Couper le serveur pendant qu'une alarme est active → relancer → vérifier dans les logs que l'état est correctement seedé et qu'aucune re-notification intempestive n'est envoyée
6. Mesure avec `Valeur = NULL` → `getLastMeasure` retourne 0.0 sans exception
