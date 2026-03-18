# Vigitemp Serveur — Audit Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corriger toutes les anomalies identifiées dans la revue de code du serveur C# .NET 4.8.

**Architecture:** Le serveur C# détecte les alarmes via polling de sondes série, les écrit en DB (t_alarme), puis notifie le website Next.js via HTTP. Chaque serveur physique est géré par un ThreadServeur distinct avec un SemaphoreSlim(1,1). Les sondes (SensorIN, SensorHN, etc.) communiquent via SerialPort.

**Tech Stack:** C# .NET 4.8, MySqlConnector, System.IO.Ports.SerialPort, System.Net.Http.HttpClient, System.Configuration.ConfigurationManager

---

## Task 1 — Thread Safety

**Fichiers touchés :**
- `Vigitemp Serveur/Vigitemp Serveur/Sensor.cs`
- `Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs`
- `Vigitemp Serveur/Vigitemp Serveur/Database.cs`
- `Vigitemp Serveur/Vigitemp Serveur/VigitempServeur.cs`

---

### TS-01 — `pendingResults` non volatile

**Fichier :** `Sensor.cs` ligne 20

**Problème :** `pendingResults` est un champ `public bool` partagé entre le thread de polling (`read()`) et le `DataReceivedHandler` (thread pool I/O). Le compilateur ou le JIT peut en cacher la valeur en registre, rendant la boucle while non-terminable.

**Avant (ligne 20) :**
```csharp
public bool pendingResults = false;
```

**Après :**
```csharp
public volatile bool pendingResults = false;
```

---

### TS-02 — `m_sensor_response` sans lock

**Fichier :** `Sensor.cs` ligne 22

**Problème :** `m_sensor_response` est une `string` écrite avec `+=` dans `DataReceivedHandler` (thread pool) et lue dans la boucle de timeout de `read()` (thread scheduler). Sans synchronisation, le compilateur peut lire une valeur partiellement mise à jour. De plus, l'opérateur `+=` sur string n'est pas atomique.

**Avant (ligne 22) :**
```csharp
public string m_sensor_response;
```

**Après :**
```csharp
private string m_sensor_response_internal;
private readonly object _responseLock = new object();
public string m_sensor_response
{
    get { lock (_responseLock) { return m_sensor_response_internal; } }
    set { lock (_responseLock) { m_sensor_response_internal = value; } }
}
```

**Note :** Dans chaque `DataReceivedHandler`, les accès `m_sensor_response += chunk` deviennent implicitement protégés via la propriété. Les lectures dans la boucle de timeout (ex. `m_sensor_response = ""`) le sont également.

**Vérification :** Le compilateur doit accepter ce changement sans erreur. Les sous-classes (SensorIN, SensorIE, etc.) n'accèdent à `m_sensor_response` que via la propriété héritée, pas directement au champ.

---

### TS-03 — `sensor` et `sensorType` champs partagés dans `ThreadServeur`

**Fichier :** `ThreadServeur.cs` lignes 24–25

**Problème :** `private Sensor sensor` et `private string sensorType` sont des champs d'instance modifiés dans `InterrogateSchedule` (appelé depuis `ProcessSchedulerTickAsync`) et dans `ProcessMaintenanceTickAsync`. Bien que le sémaphore assure l'exclusion mutuelle entre les deux méthodes, la mutabilité partagée rend le code fragile et difficile à maintenir.

**Avant (lignes 24–25) :**
```csharp
private Sensor sensor;
private string sensorType;
```

**Après :** Supprimer ces deux déclarations de champs, et les remplacer par des variables locales dans chaque méthode.

Dans `InterrogateSchedule` (ligne 616), transformer :
```csharp
sensorType = serial.StartsWith("GSP", ...
```
en :
```csharp
var sensorType = serial.StartsWith("GSP", ...
```

Dans `ProcessMaintenanceTickAsync` (ligne 735), transformer :
```csharp
sensorType = arr_sondeNumeroSerie.StartsWith("GSP", ...
```
en :
```csharp
var sensorType = arr_sondeNumeroSerie.StartsWith("GSP", ...
```

De même pour `sensor` : chaque `sensor = new SensorXX(...)` devient `var sensor = new SensorXX(...)` et `sensor = null` (ligne 713) est simplement supprimé (la variable n'existe plus dans ce scope).

---

### TS-04 — double-checked locking sans `volatile` sur `m_database`

**Fichier :** `ThreadServeur.cs` ligne 23

**Problème :** Le pattern double-checked locking de `GetDatabase()` (lignes 101–113) nécessite que le champ soit `volatile` pour empêcher la réordonnancement mémoire qui pourrait faire observer un objet partiellement initialisé depuis un autre thread.

**Avant (ligne 23) :**
```csharp
private IDatabaseProvider m_database;
```

**Après :**
```csharp
private volatile IDatabaseProvider m_database;
```

---

### TS-05 — `Database._lock` statique

**Fichier :** `Database.cs` ligne 12

**Problème :** `_lock` est `static readonly`, donc partagé entre toutes les instances de `Database`. En mode multi-serveur (plusieurs `ThreadServeur`), toutes les requêtes SQL se bloquent mutuellement, ce qui annule le bénéfice du multi-threading.

**Avant (ligne 12) :**
```csharp
private static readonly object _lock = new object();
```

**Après :**
```csharp
private readonly object _lock = new object();
```

**Note :** Vérifier que `SqlServerDatabaseProvider.cs` a le même problème et appliquer le même fix.

---

### TS-06 — Compteurs statiques sans `Interlocked`

**Fichier :** `VigitempServeur.cs` lignes 20–21

**Problème :** `nombres_interrogations` et `nombres_reponses` sont des champs `public static int` incrémentés depuis plusieurs threads (un par ThreadServeur) sans synchronisation. L'incrément `++` n'est pas atomique sur x86 en l'absence de barrières mémoire.

**Avant (lignes 20–21) :**
```csharp
public static int nombres_interrogations;
public static int nombres_reponses;
```

**Après :**
```csharp
public static int nombres_interrogations;
public static int nombres_reponses;
```
Les déclarations restent identiques. Modifier les sites d'appel :

Dans `ThreadServeur.cs` (lignes 623, 629, 637, 643, 649, 655, 661, 667) :
```csharp
// Avant
VigitempServeur.nombres_interrogations++;
// Après
System.Threading.Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
```

Dans `Database.cs` ligne 756 :
```csharp
// Avant
VigitempServeur.nombres_reponses++;
// Après
System.Threading.Interlocked.Increment(ref VigitempServeur.nombres_reponses);
```

**Commit pour Task 1 :**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/Sensor.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/Database.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/VigitempServeur.cs"
git commit -m "fix(server): thread safety — volatile pendingResults, response lock, instance _lock, Interlocked counters"
```

**Vérification manuelle :** Compiler le projet (zéro erreur). Démarrer le service avec plusieurs sondes sur des serveurs différents. Observer dans les logs que les interrogations se produisent en parallèle sans deadlock.

---

## Task 2 — SerialPort lifecycle

**Fichiers touchés :**
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIN.cs`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIE.cs`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIP.cs`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIH.cs`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIC.cs`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorHN.cs`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorEN.cs`
- `Vigitemp Serveur/Vigitemp Serveur/Sensor.cs`

---

### RES-01 — SerialPort non fermé en cas d'exception dans DataReceivedHandler

**Problème :** Dans SensorIE, SensorIP, SensorIH, SensorIC, SensorHN, SensorEN, le bloc `catch` de `DataReceivedHandler` log l'erreur mais ne ferme/dispose pas le port. Le port reste ouvert et non libéré.

**SensorIE.cs — DataReceivedHandler, bloc catch (lignes 121–124) :**
```csharp
// Avant
catch (Exception ex)
{
    VigitempServeur.Log($"[SONDE][ERR] type=IE serial={m_sondeSerialNumber} port={m_comPort} error={ex}");
}
```
```csharp
// Après
catch (Exception ex)
{
    VigitempServeur.Log($"[SONDE][ERR] type=IE serial={m_sondeSerialNumber} port={m_comPort} error={ex}");
    try { if (m_port.IsOpen) m_port.Close(); } catch { /* ignore */ }
    pendingResults = false;
}
```

Même correctif à appliquer dans :
- **SensorIP.cs** lignes 113–116
- **SensorIH.cs** lignes 127–130
- **SensorIC.cs** lignes 127–130
- **SensorHN.cs** lignes 168–171
- **SensorEN.cs** lignes 164–167

**SensorIN.cs** : le `catch` dans `read()` ferme déjà le port (ligne 69–70). Mais le `catch` de `DataReceivedHandler` (lignes 134–137) ne le fait pas :
```csharp
// Avant
catch (Exception error)
{
    VigitempServeur.Log("SensorIN.DataReceived: " + error);
}
```
```csharp
// Après
catch (Exception error)
{
    VigitempServeur.Log("SensorIN.DataReceived: " + error);
    try { if (m_port.IsOpen) m_port.Close(); } catch { /* ignore */ }
    pendingResults = false;
}
```

---

### RES-02 — SerialPort non retiré de la liste globale après disposition

**Fichier :** `Sensor.cs` ligne 74

**Problème :** `m_port` est ajouté à `list_SerialPort_open` dans le constructeur de `Sensor` (ligne 74), mais n'est jamais retiré après fermeture/disposition. La liste grossit indéfiniment, et `Stop()` essaie de fermer des ports déjà fermés.

**Correctif :** Dans chaque sensor, après `m_port.Close()` suivi d'un `m_port.Dispose()` (dans les blocs catch ou finally), ajouter :
```csharp
ths.list_removeComPort(m_port);
```

Pour les sensors qui appellent `m_port.Close()` dans le chemin normal (fin de `DataReceivedHandler`), ne pas retirer le port immédiatement car il peut être réutilisé. Le retrait doit se faire uniquement lors d'un `Dispose` explicite (dans les blocs catch d'exception).

**Note :** `SensorGSP.cs` utilise déjà `finally { if (m_port.IsOpen) m_port.Close(); }` (lignes 86–95). Ajouter `ths.list_removeComPort(m_port)` dans ce `finally` uniquement si une exception a été catchée (sinon le port est réutilisé au prochain cycle).

En pratique, la logique correcte est : retirer de la liste uniquement lors d'un `Dispose`. Ajouter une méthode `protected void DisposePort()` dans `Sensor.cs` :
```csharp
protected void DisposePort()
{
    try { if (m_port.IsOpen) m_port.Close(); } catch { /* ignore */ }
    try { m_port.Dispose(); } catch { /* ignore */ }
    ths.list_removeComPort(m_port);
}
```
Et appeler `DisposePort()` depuis chaque `catch` d'exception dans `read()` au lieu de `m_port.Close(); m_port.Dispose()`.

**Commit pour Task 2 :**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/Sensor.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIN.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIE.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIP.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIH.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIC.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorHN.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorEN.cs"
git commit -m "fix(server): SerialPort lifecycle — close on handler exception, remove from global list on dispose"
```

**Vérification manuelle :** Simuler une erreur de parsing dans un DataReceivedHandler (données corrompues). Observer dans les logs que le port est bien fermé et que le prochain cycle reprend correctement.

---

## Task 3 — Ressources DB

**Fichiers touchés :**
- `Vigitemp Serveur/Vigitemp Serveur/CacheService.cs`
- `Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs`
- `Vigitemp Serveur/Vigitemp Serveur/Database.cs`

---

### RES-03 — CacheService ouvre une connexion MySQL par mesure

**Fichier :** `CacheService.cs` lignes 86–128

**Problème :** `InsertMeasureToGraphique` ouvre une nouvelle `MySqlConnection` à chaque appel (ligne 91–92). Elle est appelée depuis `Database.AddMesure` et `Database.AddMesureNoResponse`, qui ont déjà une connexion `connection_vigitemp_mesure` ouverte. Cela double le nombre de connexions et de handshakes.

**Correctif :** Passer la connexion existante en paramètre. Modifier la signature :

```csharp
// Avant (ligne 70)
public static void InsertMeasureToGraphique(
    int idSonde, int idLieu, string sondeNumeroSerie,
    double? valeur, string unite, double? resistance,
    float consigne, float consigneSup, float consigneInf,
    int frequence, int etatAlarme, int estValeurNull = 0)
```

```csharp
// Après
public static void InsertMeasureToGraphique(
    MySqlConnection connection,
    int idSonde, int idLieu, string sondeNumeroSerie,
    double? valeur, string unite, double? resistance,
    float consigne, float consigneSup, float consigneInf,
    int frequence, int etatAlarme, int estValeurNull = 0)
```

Dans le corps, supprimer la création de connexion locale (lignes 86–92) et utiliser `connection` directement :
```csharp
// Avant
MySqlConnection connection = null;
try
{
    var databaseName = GetSetting("Vigi.Db.MeasureDatabase", "vigitemp_mesure");
    connection = CreateConnection(databaseName);
    connection.Open();
    MySqlCommand cmd = connection.CreateCommand();
```

```csharp
// Après
try
{
    MySqlCommand cmd = connection.CreateCommand();
```

Et supprimer dans `finally` les lignes `connection?.Close(); connection?.Dispose();` (lignes 126–127).

Dans `Database.cs`, mettre à jour les deux appels (lignes 733 et 839) :
```csharp
// Avant
CacheService.InsertMeasureToGraphique(
    idSonde, idLieu, p_numeroSerie, ...);
```

```csharp
// Après
CacheService.InsertMeasureToGraphique(
    connection_vigitemp_mesure,
    idSonde, idLieu, p_numeroSerie, ...);
```

---

### RES-04 — HttpClient dupliqué dans ThreadServeur

**Fichier :** `ThreadServeur.cs` ligne 19

**Problème :** `private static readonly HttpClient _http` est déclaré mais jamais utilisé (toutes les notifications passent par `AlarmWebNotifier`). C'est du code mort qui maintient un HttpClient inutile.

**Avant (ligne 19) :**
```csharp
private static readonly HttpClient _http = new HttpClient { Timeout = TimeSpan.FromSeconds(10) };
```

**Après :** Supprimer cette ligne entièrement.

---

### RES-05 — MySqlCommand non disposé dans plusieurs méthodes Database

**Fichier :** `Database.cs`

**Problème :** Les méthodes suivantes créent des `MySqlCommand` sans `using`, laissant les ressources non libérées en cas d'exception :

- `getIDLieuBySerialNumber` — `cmd_vigitemp` ligne 157, reader `dr_IdLieu` ligne 164
- `getConsignesLieux` — `cmd_vigitemp` ligne 189, reader ligne 199
- `getInfosByIdLieu` — `cmd_vigitemp` ligne 1057, reader `dr_lieux` ligne 1067
- `getDistinctIdServeur` — `cmd_vigitemp` ligne 1099, reader `dr_lieux` ligne 1107
- `getDistinctFrequenciesByIdServeur` — `cmd_vigitemp` ligne 1130, reader `dr_lieux` ligne 1143
- `getLastMeasure` — `cmd_vigitemp_mesure` ligne 1212, reader `dr_mesure` ligne 1222
- `getLieuxAvecAlarmesEnSnooze` — `cmd_vigitemp` ligne 1179, reader `dr_lieux` ligne 1186
- `UpdateLieuEndedFlag` (lignes 2051–2065) — `cmdCount` et `cmdUpdate` non disposés
- `UpdateLieuAlarmReference` (lignes 2113–2118) — `cmdUpdate` non disposé
- `SetLieuAlarmFlagsV2` (lignes 1807–1817) — `cmd` non disposé
- `SetLieuAlarmFlagsV1` (lignes 1822–1832) — `cmd` non disposé

**Correctif générique :** Entourer chaque commande avec `using`. Exemple pour `getIDLieuBySerialNumber` :

```csharp
// Avant (lignes 157–172)
MySqlCommand cmd_vigitemp = connection_vigitemp.CreateCommand();
cmd_vigitemp.CommandText = "select Id_Lieu ...";
cmd_vigitemp.Parameters.AddWithValue("@serial", p_sondSerialNumber);
MySqlDataReader dr_IdLieu = cmd_vigitemp.ExecuteReader();
while (dr_IdLieu.Read())
{
    idLieu_tmp = dr_IdLieu.GetInt32("Id_Lieu");
}
dr_IdLieu.Close();
```

```csharp
// Après
using (var cmd_vigitemp = connection_vigitemp.CreateCommand())
{
    cmd_vigitemp.CommandText = "select Id_Lieu ...";
    cmd_vigitemp.Parameters.AddWithValue("@serial", p_sondSerialNumber);
    using (var dr_IdLieu = cmd_vigitemp.ExecuteReader())
    {
        while (dr_IdLieu.Read())
        {
            idLieu_tmp = dr_IdLieu.GetInt32("Id_Lieu");
        }
    }
}
```

Appliquer ce pattern à toutes les méthodes listées ci-dessus.

**Commit pour Task 3 :**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/CacheService.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/Database.cs"
git commit -m "fix(server): DB resources — pass connection to CacheService, remove dead HttpClient, wrap MySqlCommand in using"
```

**Vérification manuelle :** Observer la consommation mémoire en production sous charge sur 1 heure. Les connexions MySQL doivent rester stables (pas de fuite).

---

## Task 4 — Gestion d'erreurs

**Fichiers touchés :**
- `Vigitemp Serveur/Vigitemp Serveur/Database.cs`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorHN.cs`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorEN.cs`
- `Vigitemp Serveur/Vigitemp Serveur/AlarmWebNotifier.cs`

---

### ERR-01 — `getCoeffCalibrageBySerialNumber` ignore le résultat de `Read()`

**Fichier :** `Database.cs` ligne 2144

**Problème :** `dr_lieux.Read()` est appelé mais son résultat booléen est ignoré (ligne 2144). Si le reader est vide (aucun calibrage pour la sonde), l'accès `dr_lieux["Coeff_X"]` lève une `InvalidOperationException`.

**Avant (lignes 2143–2147) :**
```csharp
MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
dr_lieux.Read();
coeffX = Convert.ToDouble(dr_lieux["Coeff_X"]);
coeffConstant = Convert.ToDouble(dr_lieux["Coeff_Constant"]);
dr_lieux.Close();
```

**Après :**
```csharp
using (var dr_lieux = cmd_vigitemp.ExecuteReader())
{
    if (dr_lieux.Read())
    {
        coeffX = Convert.ToDouble(dr_lieux["Coeff_X"]);
        coeffConstant = Convert.ToDouble(dr_lieux["Coeff_Constant"]);
    }
    else
    {
        VigitempServeur.Log("getCoeffCalibrageBySerialNumber: aucun calibrage pour " + p_serial_number);
        coeffX = 1;
        coeffConstant = 0;
    }
}
```

---

### ERR-02 — `getConsignesLieux` : `DateTime.Parse` sans culture

**Fichier :** `Database.cs` ligne 212

**Problème :** `DateTime.Parse(dr_ConsignesLieux["Date_Heure_Reactivation_Alarme"].ToString())` utilise la culture système courante. Sur un serveur avec une culture non-française, le parsing peut échouer silencieusement ou produire une date incorrecte.

**Avant (ligne 212) :**
```csharp
Date_Heure_Reactivation_Alarme_tmp = DateTime.Parse(dr_ConsignesLieux["Date_Heure_Reactivation_Alarme"].ToString());
```

**Après :**
```csharp
var rawDate = dr_ConsignesLieux["Date_Heure_Reactivation_Alarme"].ToString();
if (!DateTime.TryParse(rawDate, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out Date_Heure_Reactivation_Alarme_tmp))
{
    DateTime.TryParse(rawDate, CultureInfo.CurrentCulture, DateTimeStyles.AssumeLocal, out Date_Heure_Reactivation_Alarme_tmp);
}
```

---

### ERR-03 — `SensorHN` et `SensorEN` : `catch (TimeoutException)` trop étroit

**Fichiers :**
- `SensorHN.cs` ligne 82 : `catch (TimeoutException e)`
- `SensorEN.cs` ligne 72 : `catch (TimeoutException e)`

**Problème :** Le bloc `catch` ne capture que les `TimeoutException`. Toute autre exception (ex. `InvalidOperationException` si le port n'est pas ouvert, `UnauthorizedAccessException`, `IOException`) remontera sans être gérée.

**SensorHN.cs — avant (lignes 82–90) :**
```csharp
catch (TimeoutException e)
{
    Console.WriteLine("erreur: " + e);
    Trace.WriteLine("erreur: " + e);
    VigitempServeur.Log($"[SONDE][ERR] type=HN serial={m_sondeSerialNumber} port={m_comPort} error={e}");
    HandleNoResponseAlarm(false, "exception");
    m_port.Close();
    return false;
}
```

**Après :**
```csharp
catch (Exception e)
{
    VigitempServeur.Log($"[SONDE][ERR] type=HN serial={m_sondeSerialNumber} port={m_comPort} error={e}");
    HandleNoResponseAlarm(false, "exception");
    try { if (m_port.IsOpen) m_port.Close(); } catch { /* ignore */ }
    return false;
}
```

Même correctif pour **SensorEN.cs** lignes 72–80.

---

### ERR-04 — `SensorEN` : `int.Parse(m_sondeAdresse)` sans guard

**Fichier :** `SensorEN.cs` ligne 32

**Problème :** `int.Parse(m_sondeAdresse)` lève une `FormatException` si l'adresse est null, vide ou non numérique. Cette exception n'est catchée que par le `catch (TimeoutException)` trop étroit (voir ERR-03), donc elle remonte sans être gérée.

**Avant (ligne 32) :**
```csharp
int sRelais1 = int.Parse(m_sondeAdresse); //adresse sonde
```

**Après (en haut du try, avant ligne 26) :**
```csharp
if (!int.TryParse(m_sondeAdresse, out int sRelais1))
{
    VigitempServeur.Log($"[SONDE][ERR] type=EN serial={m_sondeSerialNumber} adresse invalide='{m_sondeAdresse}'");
    HandleNoResponseAlarm(false, "invalid-address");
    return false;
}
```
Et supprimer l'ancienne ligne 32.

---

### ERR-05 — `AlarmWebNotifier.NotifyAsync` : code HTTP non vérifié

**Fichier :** `AlarmWebNotifier.cs`

**Problème :** Les méthodes `NotifyAlarmAsync` (ligne 78), `NotifyAlarmBatchAsync` (ligne 147), `NotifyEndedAlarmBatchAsync` (ligne 192), et `NotifyRealtimeAlarmAsync` (ligne 260) ne vérifient pas si la réponse HTTP est 2xx. Une erreur 401/500 du website est ignorée silencieusement.

**NotifyAlarmAsync — avant (lignes 78–82) :**
```csharp
var response = await _http.SendAsync(req);
VigitempServeur.Log(
    "AlarmWebNotifier: notification envoyee (status=" + (int)response.StatusCode + ") " + ...);
```

**Après :**
```csharp
var response = await _http.SendAsync(req);
var statusCode = (int)response.StatusCode;
if (statusCode < 200 || statusCode >= 300)
{
    VigitempServeur.Log(
        "AlarmWebNotifier: WARNING reponse non-2xx (status=" + statusCode + ") idLieu=" + idLieu + ...);
}
else
{
    VigitempServeur.Log(
        "AlarmWebNotifier: notification envoyee (status=" + statusCode + ") idLieu=" + idLieu + ...);
}
```

Appliquer le même pattern dans `NotifyAlarmBatchAsync` (ligne 147), dans la lambda de `NotifyEndedAlarmBatchAsync` (ligne 192), et dans `NotifyRealtimeAlarmAsync` (ligne 260).

---

### ERR-06 — `UpdateLieuEndedFlag` et `UpdateLieuAlarmReference` sans try/catch

**Fichier :** `Database.cs`

**Problème :**
- `UpdateLieuEndedFlag` (lignes 2049–2066) : aucun try/catch. Une exception SQL ici propagera depuis `setThresholdAlarm` ou `setNonResponseAlarm` et silencera le retour de la méthode publique.
- `UpdateLieuAlarmReference` (lignes 2111–2119) : même problème.

**Avant `UpdateLieuEndedFlag` (ligne 2049) :**
```csharp
private void UpdateLieuEndedFlag(int idLieu)
{
    var cmdCount = this.connection_vigitemp.CreateCommand();
    ...
```

**Après :**
```csharp
private void UpdateLieuEndedFlag(int idLieu)
{
    try
    {
        using (var cmdCount = this.connection_vigitemp.CreateCommand())
        {
            ...
        }
        using (var cmdUpdate = this.connection_vigitemp.CreateCommand())
        {
            ...
        }
    }
    catch (Exception ex)
    {
        VigitempServeur.Log("(UpdateLieuEndedFlag) SQL Erreur idLieu=" + idLieu + ": " + ex.Message);
    }
}
```

Même pattern pour `UpdateLieuAlarmReference`.

---

### BIZ-05 — `getLastMeasure` loggue la requête SQL en production

**Fichier :** `Database.cs` ligne 1220

**Problème :** `VigitempServeur.Log(cmd_vigitemp_mesure.CommandText)` loggue le texte SQL complet à chaque appel de `getLastMeasure`, ce qui pollue les logs en production.

**Avant (ligne 1220) :**
```csharp
VigitempServeur.Log(cmd_vigitemp_mesure.CommandText);
```

**Après :** Supprimer cette ligne.

**Commit pour Task 4 :**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/Database.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorHN.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorEN.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/AlarmWebNotifier.cs"
git commit -m "fix(server): error handling — guard Read(), DateTime culture, catch(Exception), TryParse address, log HTTP status, try/catch helpers, remove SQL log"
```

**Vérification manuelle :** Tester avec une sonde EN dont l'adresse est invalide dans la DB — le service ne doit pas planter. Tester avec un website indisponible — AlarmWebNotifier doit logger un WARNING 5xx.

---

## Task 5 — Logique métier

**Fichiers touchés :**
- `Vigitemp Serveur/Vigitemp Serveur/Sensor.cs`
- `Vigitemp Serveur/Vigitemp Serveur/Database.cs`
- `Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorHN.cs`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorEN.cs`

---

### BIZ-01 — `SeedAlarmState` sème H et B même si une seule est active

**Fichier :** `Sensor.cs` lignes 554–570

**Problème :** Lors du démarrage, si `Est_Lieu_En_Alarme = 1`, les deux états `_lowAlarmStateByLieu` et `_highAlarmStateByLieu` sont mis à `true` pour ce lieu, même si en réalité seule l'alarme haute était active. Cela est dû à l'impossibilité de distinguer H/B depuis le seul flag `Est_Lieu_En_Alarme`.

**Correctif :** Ajouter un commentaire explicatif plutôt que de changer le comportement (car la DB ne stocke pas le type H/B dans le flag d'état global) :

**Avant (lignes 556–563) :**
```csharp
if (isAlarmActive)
{
    _alarmStateByLieu[idLieu] = true;
    _lowAlarmStateByLieu[idLieu] = true;
    _highAlarmStateByLieu[idLieu] = true;
    AlarmStateEvaluator.ForceActive("alarm-low", idLieu);
    AlarmStateEvaluator.ForceActive("alarm-high", idLieu);
}
```

**Après :**
```csharp
if (isAlarmActive)
{
    // LIMITATION : Est_Lieu_En_Alarme ne distingue pas H/B.
    // On sème les deux canaux à true pour éviter un re-déclenchement immédiat
    // au redémarrage. Le prochain cycle de mesure corrigera l'état réel.
    _alarmStateByLieu[idLieu] = true;
    _lowAlarmStateByLieu[idLieu] = true;
    _highAlarmStateByLieu[idLieu] = true;
    AlarmStateEvaluator.ForceActive("alarm-low", idLieu);
    AlarmStateEvaluator.ForceActive("alarm-high", idLieu);
}
```

---

### BIZ-02 — Race condition check-then-insert dans `setThresholdAlarm`

**Fichier :** `Database.cs` lignes 1717–1741 et lignes 1559–1579 (setNonResponseAlarm)

**Problème :** Le pattern SELECT + INSERT pour détecter une alarme existante est sujet à une race condition si deux threads insèrent simultanément (même si le sémaphore ThreadServeur protège dans le cas normal, la méthode est publique et pourrait être appelée depuis d'autres contextes). Vérifier si une contrainte UNIQUE existe sur `t_alarme(Id_Lieu, Type)` où `Date_Heure_Fin IS NULL`.

**Correctif :** Sans accès au schéma DB complet, la solution sûre est d'entourer la séquence SELECT+INSERT dans une transaction MySQL :

```csharp
// Avant (ligne 1704) — début du lock
lock (_lock)
{
    // ... séquence SELECT + INSERT
```

```csharp
// Après — ajouter une transaction
lock (_lock)
{
    using (var transaction = connection_vigitemp.BeginTransaction())
    {
        try
        {
            // ... toute la séquence SELECT + INSERT + UPDATE
            // (tous les MySqlCommand doivent référencer la même transaction)
            cmdCheck.Transaction = transaction;
            cmdInsert.Transaction = transaction;
            // etc.
            transaction.Commit();
        }
        catch
        {
            try { transaction.Rollback(); } catch { /* ignore */ }
            throw;
        }
    }
```

**Note :** Si une contrainte UNIQUE `UNIQUE KEY uk_alarme_active (Id_Lieu, Type)` avec un partial index sur `Date_Heure_Fin IS NULL` est disponible en MySQL 8+, remplacer par `INSERT INTO t_alarme ... ON DUPLICATE KEY UPDATE Date_Heure_Derniere_Mesure = NOW(), ...`. Vérifier avec l'équipe DB avant d'implémenter.

---

### BIZ-03 — Mix `DateTime.Now` / `DateTime.UtcNow`

**Fichier :** `ThreadServeur.cs` ligne 49

**Problème :** `_lastAlarmEndPollLocal` est initialisé à `DateTime.Now` (local) et comparé à des valeurs MySQL `NOW()` qui sont en heure locale serveur. C'est cohérent intentionnellement, mais pas documenté.

**Correctif :** Ajouter un commentaire explicatif :

**Avant (ligne 49) :**
```csharp
private DateTime _lastAlarmEndPollLocal = DateTime.MinValue;
```

**Après :**
```csharp
// NOTE: heure locale intentionnelle — correspond au NOW() MySQL qui utilise
// l'heure locale du serveur de base de données.
// Ne pas remplacer par DateTime.UtcNow sans aligner le fuseau horaire MySQL.
private DateTime _lastAlarmEndPollLocal = DateTime.MinValue;
```

---

### BIZ-06 — `SensorHN` : `Encoding.UTF32` incohérent

**Fichier :** `SensorHN.cs` ligne 29 et `SensorEN.cs` ligne 27

**Problème :** `m_port.Encoding = Encoding.UTF32` est défini dans `read()`, mais le `DataReceivedHandler` lit les données avec `Encoding.GetEncoding("ISO-8859-1")` (ligne 102 de SensorHN). L'encodage du port n'est pas utilisé pour lire (la lecture se fait via `sp.Read(buf, 0, length)` sur des bytes bruts), donc `UTF32` n'a aucun effet pratique mais est trompeur.

**Avant SensorHN.cs (ligne 29) :**
```csharp
m_port.Encoding = Encoding.UTF32;
```

**Après :**
```csharp
// L'encodage du port n'est pas utilisé : les bytes sont lus directement
// via sp.Read(buf) et décodés manuellement avec ISO-8859-1 dans le handler.
m_port.Encoding = Encoding.GetEncoding("ISO-8859-1");
```

Même correctif pour **SensorEN.cs** ligne 27.

---

### MISC-01 — `SensorHN`/`SensorEN` : regex JavaScript dans `string.Replace`

**Fichiers :**
- `SensorHN.cs` ligne 110
- `SensorEN.cs` ligne 102

**Problème :** `m_sensor_response.Replace(@"/(/\r?\n|\r/)/gm", "")` utilise la syntaxe de regex JavaScript, pas C#. Cette chaîne est recherchée littéralement (ce n'est pas une Regex.Replace), donc elle ne correspond jamais à rien et n'a aucun effet. C'est un bug silencieux.

**Avant SensorHN.cs (ligne 110) :**
```csharp
m_sensor_response = m_sensor_response.Replace(@"/(/\r?\n|\r/)/gm", "");
```

**Après :**
```csharp
m_sensor_response = System.Text.RegularExpressions.Regex.Replace(m_sensor_response, @"\r?\n|\r", "");
```

Même correctif pour **SensorEN.cs** ligne 102.

---

### MISC-03 — `writeAuditJournal` : ID manuel non atomique

**Fichier :** `Database.cs` lignes 1416–1481

**Problème :** La séquence `UPDATE tm_compteur_id_table ... LAST_INSERT_ID()` + `SELECT LAST_INSERT_ID()` + `INSERT tm_journal` est une approche manuelle d'auto-increment. Elle est correcte car protégée par le `lock (_lock)` d'instance. Documenter cette garantie.

**Correctif :** Ajouter un commentaire à la ligne 1427 :

```csharp
// NOTE: La séquence UPDATE+SELECT LAST_INSERT_ID() + INSERT est atomique
// du point de vue de cette instance Database car toutes les méthodes
// utilisent le même lock(_lock). En mode multi-serveur, chaque ThreadServeur
// a sa propre instance Database, donc son propre lock.
const int serveurId = 1;
```

---

### MISC-02 — `AlarmPolicy` chargée une seule fois

**Fichier :** `Vigitemp Serveur/Vigitemp Serveur/AlarmPolicy.cs` (à vérifier)

**Problème :** `AlarmPolicy.Current` est probablement chargé au démarrage depuis la config. Un changement de configuration nécessite un redémarrage du service.

**Correctif :** Ajouter un commentaire dans la propriété statique `Current` :
```csharp
// NOTE: AlarmPolicy est chargée une seule fois au démarrage depuis App.config.
// Pour modifier la politique (ShowWhileSnoozed, etc.), un redémarrage
// du service Vigitemp est nécessaire.
```

**Commit pour Task 5 :**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/Sensor.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/Database.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/ThreadServeur.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorHN.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorEN.cs"
git commit -m "fix(server): business logic — BIZ-01 comment, BIZ-02 transaction, BIZ-03/06 comments, MISC-01 fix regex, MISC-02/03 comments"
```

**Vérification manuelle :** Tester SensorHN et SensorEN avec des trames contenant `\r\n` — la réponse doit être propre. Vérifier dans les logs que les bytes HN/EN reçus sont les mêmes qu'avant.

---

## Task 6 — Code mort et sécurité

**Fichiers touchés :**
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIE.cs`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIP.cs`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIH.cs`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIC.cs`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorHN.cs`
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorEN.cs`
- `Vigitemp Serveur/Vigitemp Serveur/Database.cs`
- `Vigitemp Serveur/Vigitemp Serveur/IDatabaseProvider.cs`
- `Vigitemp Serveur/Vigitemp Serveur/AlarmWebNotifier.cs`
- `Vigitemp Serveur/Vigitemp Serveur/HotlineApiServer.cs`

---

### DEAD-01 — `Console.WriteLine` / `Trace.WriteLine` dans sensors

**Problème :** Ces appels survivent dans le code malgré le redirection de `Console` et `Trace` vers `VigitempServeur.Log` dans `OnStart`. Ils produisent des logs dupliqués et doivent être nettoyés pour la lisibilité.

**Fichiers et lignes :**
- **SensorIE.cs** : lignes 59–60 (dans `catch`), ligne 108–109 (dans handler), ligne 119
- **SensorIP.cs** : lignes 34–35 (dans `read()`), lignes 55–56 (dans `catch`), lignes 102–103 (handler), ligne 111
- **SensorIH.cs** : lignes 37–38, lignes 58–59, lignes 107–108, lignes 123–125
- **SensorIC.cs** : lignes 37–38, lignes 58–59, lignes 107–108, lignes 123–125
- **SensorHN.cs** : lignes 43–44, lignes 61–62, lignes 84–85, lignes 129–130, lignes 133–135, lignes 139–141, lignes 143–144, lignes 146–148, lignes 150–151, lignes 155–156, ligne 166
- **SensorEN.cs** : lignes 54–55, lignes 74–75, lignes 121–122, lignes 124–125, lignes 128–132, ligne 136–137, ligne 162

**Correctif :** Supprimer toutes les lignes `Console.WriteLine(...)` et `Trace.WriteLine(...)` (et `System.Diagnostics.Trace.WriteLine(...)`). Les `VigitempServeur.Log(...)` adjacents sont suffisants.

**Note :** Ne pas supprimer les commentaires `//Console.WriteLine` ou `//Trace.WriteLine` déjà en commentaire dans SensorIN.cs — ils sont déjà neutralisés.

---

### DEAD-02 — `getCoeffCalibrageBySerialNumber` orpheline

**Constat (grep) :** Les seuls appels à `getCoeffCalibrageBySerialNumber` dans le code source sont en commentaire (SensorIN.cs ligne 110, SensorIE.cs ligne 104). La méthode est déclarée dans `IDatabaseProvider` (ligne 36), dans `Database.cs` (ligne 2121), et dans `SqlServerDatabaseProvider.cs` (ligne 1992).

**Correctif :** Retirer la déclaration de l'interface `IDatabaseProvider` (ligne 36) et les implémentations dans `Database.cs` (lignes 2121–2159) et `SqlServerDatabaseProvider.cs`.

**Avant IDatabaseProvider.cs (ligne 36) :**
```csharp
(double, double) getCoeffCalibrageBySerialNumber(string p_serial_number);
```
**Après :** Supprimer cette ligne.

---

### DEAD-03 — `getLastMeasure` orpheline

**Constat (grep) :** `getLastMeasure` (sans le suffixe `WithUnit`) n'est appelée nulle part en dehors de sa déclaration dans `IDatabaseProvider` (ligne 20) et ses implémentations. `getLastMeasureWithUnit` est utilisée à la place (ThreadServeur.cs ligne 718).

**Correctif :** Retirer la déclaration de `IDatabaseProvider` (ligne 20), l'implémentation de `Database.cs` (lignes 1200–1238) et celle de `SqlServerDatabaseProvider.cs`.

**Avant IDatabaseProvider.cs (ligne 20) :**
```csharp
double getLastMeasure(int p_IdLieu);
```
**Après :** Supprimer cette ligne.

---

### DEAD-04 — `AlarmWebNotifier.NotifyAlarmAsync` orpheline

**Constat (grep) :** `NotifyAlarmAsync` (méthode ligne 42 de `AlarmWebNotifier.cs`) n'est appelée nulle part dans le code actif. Toutes les notifications passent par `NotifyAlarmBatchAsync`, `NotifyEndedAlarmBatchAsync`, ou `NotifyRealtimeAlarmAsync`.

**Correctif :** Supprimer la méthode `NotifyAlarmAsync` (lignes 42–91 de `AlarmWebNotifier.cs`).

---

### DEAD-05 — `HotlineApiServer.ValidateApiKey` : ouvert si non configuré

**Fichier :** `HotlineApiServer.cs` lignes 991–997

**Problème :** Si `Vigitemp.Hotline.ApiKey` n'est pas configuré, `ValidateApiKey` retourne `true` (ligne 994), acceptant n'importe quelle requête sans authentification. C'est un comportement d'ouverture par défaut dangereux.

**Avant (lignes 991–997) :**
```csharp
private static bool ValidateApiKey(HttpListenerRequest request)
{
    var expected = GetSetting("Vigitemp.Hotline.ApiKey", string.Empty);
    if (string.IsNullOrWhiteSpace(expected)) return true;
    var provided = request.Headers["x-vigitemp-hotline-key"];
    return string.Equals(expected, provided, StringComparison.Ordinal);
}
```

**Après :**
```csharp
private static bool ValidateApiKey(HttpListenerRequest request)
{
    var expected = GetSetting("Vigitemp.Hotline.ApiKey", string.Empty);
    if (string.IsNullOrWhiteSpace(expected))
    {
        VigitempServeur.Log("WARNING HotlineApiServer: Vigitemp.Hotline.ApiKey non configuré. Toutes les requêtes sont rejetées.");
        return false;
    }
    var provided = request.Headers["x-vigitemp-hotline-key"];
    return string.Equals(expected, provided, StringComparison.Ordinal);
}
```

---

### DEAD-06 — `getConsignesLieux` obsolète

**Fichier :** `Database.cs` ligne 176

**Problème :** `getConsignesLieux` est la version V1 de lecture des consignes, remplacée par `getLieuAlarmSettings` / `ReadLieuAlarmSettingsV2`. Elle reste dans l'interface `IDatabaseProvider` (vérifier — elle n'y est pas, donc c'est bon), mais persiste dans `Database.cs`. Vérifier si elle est référencée.

**Constat :** `getConsignesLieux` n'apparaît pas dans `IDatabaseProvider.cs`. Elle est donc uniquement dans `Database.cs` (ligne 176). Une recherche grep dans le projet est nécessaire pour confirmer qu'elle n'est pas appelée.

**Correctif :** Marquer la méthode `[Obsolete]` :

```csharp
// Avant (ligne 176)
public (List<float>, bool notificationActive, DateTime Date_Heure_Reactivation_Alarme) getConsignesLieux(int p_idLieu)
```

```csharp
// Après
[Obsolete("Utiliser getLieuAlarmSettings / ReadLieuAlarmSettingsV2 à la place.")]
public (List<float>, bool notificationActive, DateTime Date_Heure_Reactivation_Alarme) getConsignesLieux(int p_idLieu)
```

---

### DEAD-07 — `getInfosByIdServeurAndFrequencies` orpheline

**Constat (grep) :** La méthode existe dans `IDatabaseProvider.cs` (ligne 13), `Database.cs` (ligne 865), et `SqlServerDatabaseProvider.cs`. Elle n'est pas appelée depuis `ThreadServeur.cs` (qui utilise `getSondesActivesByServeur`) ni depuis aucun autre fichier.

**Correctif :** Retirer la déclaration de `IDatabaseProvider` (ligne 13) et les implémentations correspondantes.

**Avant IDatabaseProvider.cs (ligne 13) :**
```csharp
(List<string>, List<string>, List<string>, List<string>, List<int>, List<DateTime?>) getInfosByIdServeurAndFrequencies(int p_idServer, int p_frequence);
```
**Après :** Supprimer cette ligne.

---

### DEAD-08 — `getDistinctFrequenciesByIdServeur` orpheline

**Constat (grep) :** La méthode existe dans `IDatabaseProvider.cs` (ligne 17), `Database.cs` (ligne 1119), et `SqlServerDatabaseProvider.cs`. Elle n'est pas appelée depuis `ThreadServeur.cs` ni depuis aucun autre fichier.

**Correctif :** Retirer la déclaration de `IDatabaseProvider` (ligne 17) et les implémentations correspondantes.

**Avant IDatabaseProvider.cs (ligne 17) :**
```csharp
List<int> getDistinctFrequenciesByIdServeur(int p_idServeur);
```
**Après :** Supprimer cette ligne.

**Commit pour Task 6 :**
```bash
git add "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIE.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIP.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIH.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorIC.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorHN.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/sensors/SensorEN.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/Database.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/IDatabaseProvider.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/AlarmWebNotifier.cs" \
        "Vigitemp Serveur/Vigitemp Serveur/HotlineApiServer.cs"
git commit -m "fix(server): dead code cleanup — remove Console/Trace, orphan methods, secure HotlineApiServer ValidateApiKey"
```

**Vérification manuelle :** Compiler le projet — zéro erreur, zéro avertissement Obsolete non intentionnel. Tester `HotlineApiServer` sans clé configurée — la requête doit être rejetée 401. Tester avec une clé correcte — la requête doit passer.

---

## Récapitulatif des commits

| Task | Commit message |
|------|---------------|
| 1 | `fix(server): thread safety — volatile pendingResults, response lock, instance _lock, Interlocked counters` |
| 2 | `fix(server): SerialPort lifecycle — close on handler exception, remove from global list on dispose` |
| 3 | `fix(server): DB resources — pass connection to CacheService, remove dead HttpClient, wrap MySqlCommand in using` |
| 4 | `fix(server): error handling — guard Read(), DateTime culture, catch(Exception), TryParse address, log HTTP status, try/catch helpers, remove SQL log` |
| 5 | `fix(server): business logic — BIZ-01 comment, BIZ-02 transaction, BIZ-03/06 comments, MISC-01 fix regex, MISC-02/03 comments` |
| 6 | `fix(server): dead code cleanup — remove Console/Trace, orphan methods, secure HotlineApiServer ValidateApiKey` |

---

## Notes importantes pour l'implémentation

1. **SqlServerDatabaseProvider.cs** n'a pas été audité en détail dans ce plan. Les mêmes fixes TS-05, RES-05, DEAD-02, DEAD-03, DEAD-07, DEAD-08 s'appliquent également à ce fichier.

2. **Ordre d'implémentation recommandé :** Task 6 (code mort) en premier pour réduire la surface, puis Task 1 (thread safety) car impacte la stabilité, puis Tasks 2–5.

3. **Pas de tests automatisés** disponibles. La vérification se fait par compilation + démarrage du service + observation des logs pendant un cycle complet de mesures.

4. **Breaking change possible (Task 3 RES-03) :** La signature de `CacheService.InsertMeasureToGraphique` change. S'assurer qu'il n'y a pas d'autres appelants en dehors de `Database.cs`.
