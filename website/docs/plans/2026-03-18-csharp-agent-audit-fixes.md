# Vigitemp Agent — Audit Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corriger toutes les anomalies identifiées dans la revue de code de l'agent C# .NET 4.8.

**Architecture:** L'agent est une application WinForms .NET 4.8 avec un icône systray. Il expose un serveur HTTP local sur le port 8000 (HttpListener) pour recevoir les notifications du website Next.js. Il affiche des alertes via Form_Alert et communique avec des sondes LogTag via VigilogWorkerRunner.

**Tech Stack:** C# .NET 4.8, WinForms, System.Net.HttpListener, MySqlConnector, DPAPI (ProtectedData), Newtonsoft.Json

---

## Vérification préalable — RES-1 (fonts.Dispose)

`Form_Alert.Designer.cs` lignes 19-27 contient déjà :

```csharp
protected override void Dispose(bool disposing)
{
    if (disposing)
    {
        components?.Dispose();
        fonts?.Dispose();   // ligne 24
    }
    base.Dispose(disposing);
}
```

La disposition de `PrivateFontCollection fonts` est déjà présente (commit cb970e4). **RES-1 est exclu du plan.**

---

## Task 1 — Thread Safety

**Fichiers touchés :** `HttpServer.cs`, `MyCustomApplicationContext.cs`

### TS-1 — `HttpServer.url` initialisé statiquement via appel réseau

**Fichier :** `Vigitemp agent/Vigitemp agent/HttpServer.cs`
**Ligne actuelle :** 34

Problème : `public static string url = "http://" + GetLocalIPAddress() + ":8000/";`
L'appel `GetLocalIPAddress()` a lieu lors du chargement statique de la classe. Si aucun adaptateur IPv4 n'est disponible au démarrage, une `TypeInitializationException` non rattrapable est levée.

**Avant (ligne 34) :**
```csharp
public static string url = "http://" + GetLocalIPAddress() + ":8000/";
```

**Après :**
```csharp
public static string url = "";
```

Puis ajouter une propriété ou méthode d'accès paresseux après la déclaration de `url_localhost` (ligne 35) :

```csharp
public static string GetUrl()
{
    try
    {
        return "http://" + GetLocalIPAddress() + ":8000/";
    }
    catch
    {
        return "http://127.0.0.1:8000/";
    }
}
```

Vérifier que `url` n'est pas utilisé ailleurs dans le code (grep). Dans la version actuelle du fichier `url` n'est référencé qu'une fois, dans `ShowInstallSummaryIfNeeded` (`MyCustomApplicationContext.cs` ligne 568 via `HttpServer.url`) — adapter cet appel si nécessaire.

---

### TS-2 — `HttpServer.listener` public static sans lock

**Fichier :** `Vigitemp agent/Vigitemp agent/HttpServer.cs`
**Lignes concernées :** 32 (déclaration), 601-603 (Start dans `MyCustomApplicationContext`), 740 (`/shutdown` handler), 666-670 (`Shutdown`)

Problème : `listener` est lu/écrit sans protection depuis le thread UI (`Shutdown`), le thread pool (`/shutdown`), et le thread serveur (`Start`).

**Après la ligne 38** (`private static readonly object _alarmLock`), ajouter :

```csharp
private static readonly object _listenerLock = new object();
```

Dans `HandleIncomingConnections` (ligne 1296), le `GetContextAsync()` est déjà protégé par le fait que `listener` ne change pas pendant l'exécution normale. Le vrai risque est dans `/shutdown` (ligne 740) et `Shutdown` (lignes 666-670).

Remplacer la ligne 740 dans le case `/shutdown` :

**Avant :**
```csharp
try { listener.Stop(); } catch { }
```

**Après :**
```csharp
try { lock (_listenerLock) { listener?.Stop(); } } catch { /* ignore */ }
```

Dans `MyCustomApplicationContext.Shutdown()` (lignes 666-671) :

**Avant :**
```csharp
if (HttpServer.listener != null)
{
    try { HttpServer.listener.Stop(); } catch { /* ignore */ }
    try { HttpServer.listener.Close(); } catch { /* ignore */ }
    HttpServer.listener = null;
}
```

**Après :**
```csharp
lock (HttpServer._listenerLock)
{
    if (HttpServer.listener != null)
    {
        try { HttpServer.listener.Stop(); } catch { /* ignore */ }
        try { HttpServer.listener.Close(); } catch { /* ignore */ }
        HttpServer.listener = null;
    }
}
```

Note : Pour que `MyCustomApplicationContext` puisse accéder à `_listenerLock`, il faut passer le modificateur de `private` à `internal static readonly`.

---

### TS-3 — `SITEWEB_URL` et `AGENT_SECRET` sans `volatile`

**Fichier :** `Vigitemp agent/Vigitemp agent/MyCustomApplicationContext.cs`
**Lignes :** 19-20

Ces champs sont lus depuis le thread pool (`ResolveNotifySecret` dans `HttpServer.cs` ligne 114) et écrits depuis le thread UI.

**Avant :**
```csharp
public string SITEWEB_URL;
public string AGENT_SECRET;
```

**Après :**
```csharp
public volatile string SITEWEB_URL;
public volatile string AGENT_SECRET;
```

---

### TS-4 — `frm` public sans `volatile`

**Fichier :** `Vigitemp agent/Vigitemp agent/MyCustomApplicationContext.cs`
**Ligne :** 30

`frm` est assigné dans le constructeur (thread UI) et lu depuis le thread serveur (`HandleIncomingConnections` via `HttpServer.Start`).

**Avant :**
```csharp
public Form_Alert frm;
```

**Après :**
```csharp
private volatile Form_Alert _frm;
public Form_Alert frm
{
    get { return _frm; }
    set { _frm = value; }
}
```

Alternativement, si l'encapsulation est jugée excessive pour ce projet :

```csharp
public volatile Form_Alert frm;
```

La version avec propriété est préférable car elle préserve le contrat public.

**Vérification Task 1 :** Compiler le projet. Aucun changement comportemental observable en fonctionnement normal ; l'amélioration se manifeste sous charge ou lors du shutdown.

---

## Task 2 — Ressources

**Fichiers touchés :** `Form_Alert.cs`, `HttpServer.cs`, `StatusForm.cs`, `VigilogWorkerRunner.cs`

### RES-2 — `Font` créée dans `showAlert()` non disposée

**Fichier :** `Vigitemp agent/Vigitemp agent/Form_Alert.cs`
**Ligne concernée :** 154

À chaque appel de `showAlert()`, une nouvelle `Font` est créée sans jamais être disposée.

**Étape 1 — Ajouter le champ dans `Form_Alert.cs` après la ligne 12** (`PrivateFontCollection fonts`) :

```csharp
private Font _alertFont;
```

**Étape 2 — Remplacer la ligne 154 dans `showAlert()`** :

**Avant :**
```csharp
if (fonts.Families.Length > 0)
    this.label2.Font = new Font(fonts.Families[0], 14.0F);
```

**Après :**
```csharp
if (fonts.Families.Length > 0)
{
    if (_alertFont == null)
        _alertFont = new Font(fonts.Families[0], 14.0F);
    this.label2.Font = _alertFont;
}
```

**Étape 3 — Disposer dans `Form_Alert.Designer.cs` (méthode `Dispose`, ligne 21-26)** :

**Avant :**
```csharp
if (disposing)
{
    components?.Dispose();
    fonts?.Dispose();
}
```

**Après :**
```csharp
if (disposing)
{
    components?.Dispose();
    fonts?.Dispose();
    _alertFont?.Dispose();
}
```

---

### RES-3 — `Database` sans couverture complète du `try` dans `/DownloadLogTagData`

**Fichier :** `Vigitemp agent/Vigitemp agent/HttpServer.cs`
**Lignes :** 1158-1180

`database.InitConnexion()` est appelé à la ligne 1159, avant le bloc `try` qui commence à la ligne 1160. Si `InitConnexion()` lève une exception, le `finally { database.CloseConnexion(); }` ne s'exécute pas.

**Avant (lignes 1158-1180) :**
```csharp
Database database = new Database();
database.InitConnexion();
try
{
    foreach (var token in measuresArray)
    {
        // ...
    }
}
finally
{
    database.CloseConnexion();
}
```

**Après :**
```csharp
Database database = new Database();
try
{
    database.InitConnexion();
    foreach (var token in measuresArray)
    {
        // ...
    }
}
finally
{
    database.CloseConnexion();
}
```

---

### RES-4 — `StatusForm._refreshTimer` non disposé lors du shutdown

**Fichier :** `Vigitemp agent/Vigitemp agent/MyCustomApplicationContext.cs`
**Lignes :** 725-731 (bloc `statusForm?.Close()` dans `Shutdown`)

`StatusForm.FormClosed` (qui dispose `_refreshTimer`) ne se déclenche jamais car `FormClosing` annule la fermeture (`e.Cancel = true`). Ainsi, lors du `Shutdown`, l'appel à `statusForm?.Close()` ne libère pas le timer.

**Avant (lignes 725-731) :**
```csharp
try
{
    statusForm?.Close();
}
catch
{
    // ignore
}
```

**Après :**
```csharp
try
{
    statusForm?.Dispose();
}
catch
{
    // ignore
}
```

`Dispose()` contourne `FormClosing` et déclenche `FormClosed`, ce qui permet au timer d'être disposé via le handler `FormClosed += (_, __) => _refreshTimer.Dispose()` dans `StatusForm.cs` ligne 110.

---

### RES-5 — `VigilogWorkerRunner.Log()` sans rotation

**Fichier :** `Vigitemp agent/Vigitemp agent/VigilogWorkerRunner.cs`
**Lignes :** 830-843 (méthode `Log`)

La méthode `Log` écrit en append sans limite de taille. `AgentLog` dispose d'une rotation à 5 Mo (`AgentLog.cs` lignes 33-54), mais le worker LogTag utilise son propre fichier (`vigilog-worker.log`) avec un logger distinct.

`VigilogWorkerRunner` tourne en sous-processus distinct (`--vigilog-worker`) et n'a pas accès à `AgentLog` à l'exécution. Il faut dupliquer la logique de rotation.

**Ajouter une constante et une méthode avant `Log()` (après la ligne 829) :**

```csharp
private const long MaxWorkerLogSizeBytes = 5L * 1024 * 1024; // 5 MB

private static void RotateWorkerLogIfNeeded(string path)
{
    try
    {
        if (!File.Exists(path)) return;
        var info = new FileInfo(path);
        if (info.Length < MaxWorkerLogSizeBytes) return;
        var backupPath = path + ".bak";
        if (File.Exists(backupPath)) File.Delete(backupPath);
        File.Move(path, backupPath);
    }
    catch
    {
        // ignore rotation errors — don't break logging
    }
}
```

**Modifier la méthode `Log()` (lignes 830-843) :**

**Avant :**
```csharp
private static void Log(string level, string message)
{
    try
    {
        File.AppendAllText(
            LogFilePath,
            $"{DateTime.UtcNow:O} [{level}] {message}{Environment.NewLine}"
        );
    }
    catch
    {
        // ignore
    }
}
```

**Après :**
```csharp
private static void Log(string level, string message)
{
    try
    {
        RotateWorkerLogIfNeeded(LogFilePath);
        File.AppendAllText(
            LogFilePath,
            $"{DateTime.UtcNow:O} [{level}] {message}{Environment.NewLine}"
        );
    }
    catch
    {
        // ignore
    }
}
```

**Vérification Task 2 :** Compiler le projet. Pour RES-2, afficher/masquer l'alerte plusieurs fois et vérifier en Task Manager qu'il n'y a pas de croissance mémoire. Pour RES-5, générer suffisamment de logs (ou simuler en baissant la constante à 1 Ko) et vérifier que `vigilog-worker.log.bak` est créé.

---

## Task 3 — Gestion d'erreurs

**Fichiers touchés :** `HttpServer.cs`, `VigilogWorkerRunner.cs`, `SessionStore.cs`, `Installer.cs`, `MyCustomApplicationContext.cs`

### ERR-1 — `/uploadLogTagConfiguration` : accès direct à `postParams["x"]`

**Fichier :** `Vigitemp agent/Vigitemp agent/HttpServer.cs`
**Lignes :** 1051-1054

Accès par indexeur sans vérification : si l'un des paramètres (`consigneHaute`, `consigneBasse`, `valeurConsigneHaute`, `valeurConsigneBasse`) est absent de l'URL, une `KeyNotFoundException` est levée et non rattrapée au niveau du routeur.

**Avant (lignes 1051-1054) :**
```csharp
bool params_consigneHaute = Convert.ToBoolean(postParams["consigneHaute"]);
bool params_consigneBasse = Convert.ToBoolean(postParams["consigneBasse"]);
int params_valeurConsigneHaute = Convert.ToInt32(postParams["valeurConsigneHaute"]);
int params_valeurConsigneBasse = Convert.ToInt32(postParams["valeurConsigneBasse"]);
```

**Après :**
```csharp
string rawConsigneHaute, rawConsigneBasse, rawValeurHaute, rawValeurBasse;
if (!postParams.TryGetValue("consigneHaute", out rawConsigneHaute) ||
    !postParams.TryGetValue("consigneBasse", out rawConsigneBasse) ||
    !postParams.TryGetValue("valeurConsigneHaute", out rawValeurHaute) ||
    !postParams.TryGetValue("valeurConsigneBasse", out rawValeurBasse))
{
    res = "false";
    details = "Parametre(s) manquant(s) dans la requete uploadLogTagConfiguration";
    json = "{\"res\":" + res + ", \"details\":\"" + JsonEscape(details) + "\"}";
    data = Encoding.UTF8.GetBytes(json.ToCharArray());
    resp.ContentType = "application/json";
    resp.ContentEncoding = Encoding.UTF8;
    EnsureCorsHeaders(resp, req);
    resp.StatusCode = 400;
    resp.ContentLength64 = data.LongLength;
    await resp.OutputStream.WriteAsync(data, 0, data.Length);
    resp.Close();
    break;
}
bool params_consigneHaute = Convert.ToBoolean(rawConsigneHaute);
bool params_consigneBasse = Convert.ToBoolean(rawConsigneBasse);
int params_valeurConsigneHaute = Convert.ToInt32(rawValeurHaute);
int params_valeurConsigneBasse = Convert.ToInt32(rawValeurBasse);
```

---

### ERR-2 — `ReadVigilogLoggerInternal` : `DateTime` sans validation

**Fichier :** `Vigitemp agent/Vigitemp agent/HttpServer.cs`
**Lignes :** 633-641

La méthode `ReadVigilogLoggerInternal` est du code mort (voir DEAD-6), mais tant qu'elle existe elle peut lever `ArgumentOutOfRangeException`. Le worker `VigilogWorkerRunner.Read()` (lignes 440-460) valide déjà avec `if (year <= 0 || month <= 0 || day <= 0)` et un `try/catch (ArgumentOutOfRangeException)`.

Aligner `ReadVigilogLoggerInternal` (lignes 633-641) sur la même logique :

**Avant (lignes 631-641) :**
```csharp
for (int i = 0; i < ltreading.Length; i++)
{
    DateTime dtMesure = new DateTime(
        ltreading[i].stTaken.wYear,
        ltreading[i].stTaken.wMonth,
        ltreading[i].stTaken.wDay,
        ltreading[i].stTaken.wHour,
        ltreading[i].stTaken.wMinute,
        ltreading[i].stTaken.wSecond,
        DateTimeKind.Local
    );
```

**Après :**
```csharp
for (int i = 0; i < ltreading.Length; i++)
{
    var year = ltreading[i].stTaken.wYear;
    var month = ltreading[i].stTaken.wMonth;
    var day = ltreading[i].stTaken.wDay;
    if (year <= 0 || month <= 0 || day <= 0) continue;

    DateTime dtMesure;
    try
    {
        dtMesure = new DateTime(
            year,
            month,
            day,
            ltreading[i].stTaken.wHour,
            ltreading[i].stTaken.wMinute,
            ltreading[i].stTaken.wSecond,
            DateTimeKind.Local
        );
    }
    catch (ArgumentOutOfRangeException)
    {
        continue;
    }
```

Note : Si DEAD-6 est implémenté avant ERR-2, ce fix devient sans objet (la méthode est supprimée). Appliquer ERR-2 seulement si DEAD-6 n'est pas encore traité.

---

### ERR-3 — `ParseNullableDoubleArg` : `double.Parse` sans guard

**Fichier :** `Vigitemp agent/Vigitemp agent/VigilogWorkerRunner.cs`
**Ligne :** 700

`double.Parse` lève une exception si la valeur n'est pas parseable. Le worker tournant en sous-processus, l'exception serait capturée en haut par le `try/catch` général (lignes 78-94), mais elle produirait un message d'erreur peu clair.

**Avant (lignes 693-701) :**
```csharp
private static double? ParseNullableDoubleArg(string value)
{
    if (string.IsNullOrWhiteSpace(value) || string.Equals(value, "null", StringComparison.OrdinalIgnoreCase))
    {
        return null;
    }

    return double.Parse(value, CultureInfo.InvariantCulture);
}
```

**Après :**
```csharp
private static double? ParseNullableDoubleArg(string value)
{
    if (string.IsNullOrWhiteSpace(value) || string.Equals(value, "null", StringComparison.OrdinalIgnoreCase))
    {
        return null;
    }

    double val;
    return double.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out val) ? val : (double?)null;
}
```

---

### ERR-4 — `SessionStore.Load()` catch silencieux

**Fichier :** `Vigitemp agent/Vigitemp agent/SessionStore.cs`
**Lignes :** 35-53

Le bloc `catch` (lignes 50-53) avale silencieusement les exceptions. Un fichier de session corrompu ne laisse aucune trace dans les logs.

Note : `SessionStore` est une classe `internal static` sans référence à `AgentLog`. `AgentLog` est dans le même assembly (`VigitempAgent`) donc accessible.

**Avant (lignes 50-53) :**
```csharp
catch
{
    _session = null;
}
```

**Après :**
```csharp
catch (Exception ex)
{
    AgentLog.Error("SessionStore.Load failed: session file may be corrupt or unreadable.", ex);
    _session = null;
}
```

Note : Le bloc `try/catch` externe dans `MyCustomApplicationContext.cs` (lignes 180-187) log déjà les exceptions de `SessionStore.Load()`. Ce fix ajoute un log au niveau le plus précis (dans le `Load` lui-même, sous le verrou), ce qui est utile pour les appels futurs de `Load()` hors de `MyCustomApplicationContext`.

---

### ERR-5 — `Installer.cs` référence `MyApp.exe` (placeholder)

**Fichier :** `Vigitemp agent/Vigitemp agent/Installer.cs`
**Ligne :** 27

`"MyApp.exe"` est un placeholder qui ne correspond pas au nom réel de l'exécutable. Après installation via le setup, l'agent ne démarrera pas automatiquement.

**Avant (ligne 27) :**
```csharp
Process.Start(Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location) + "\\MyApp.exe");
```

**Après :**
```csharp
var exePath = Path.Combine(
    Path.GetDirectoryName(Assembly.GetExecutingAssembly().Location),
    "VigitempAgent.exe"
);
if (File.Exists(exePath))
{
    Process.Start(new ProcessStartInfo(exePath) { UseShellExecute = true });
}
```

**Vérification :** Confirmer le nom de l'exécutable dans les propriétés du projet Visual Studio (`Project > Properties > Application > Assembly name`). Si le nom diffère de `VigitempAgent`, adapter en conséquence.

---

### ERR-6 — `GetLocalIPAddress()` dupliquée et lève dans `HttpServer`

**Fichier :** `Vigitemp agent/Vigitemp agent/HttpServer.cs`
**Ligne :** 681 (méthode `GetLocalIPAddress` dans `HttpServer`)

Deux implémentations identiques existent (`MyCustomApplicationContext.cs` ligne 501 et `HttpServer.cs` ligne 671). La version dans `HttpServer` lève une exception si aucun adaptateur IPv4 n'est trouvé, ce qui est problématique pour l'initialisation statique (TS-1).

**Avant (lignes 671-682 dans `HttpServer.cs`) :**
```csharp
public static string GetLocalIPAddress()
{
    var host = Dns.GetHostEntry(Dns.GetHostName());
    foreach (var ip in host.AddressList)
    {
        if (ip.AddressFamily == AddressFamily.InterNetwork)
        {
            return ip.ToString();
        }
    }
    throw new Exception("No network adapters with an IPv4 address in the system!");
}
```

**Après :**
```csharp
public static string GetLocalIPAddress()
{
    try
    {
        var host = Dns.GetHostEntry(Dns.GetHostName());
        foreach (var ip in host.AddressList)
        {
            if (ip.AddressFamily == AddressFamily.InterNetwork)
            {
                return ip.ToString();
            }
        }
    }
    catch (Exception ex)
    {
        AgentLog.Error("GetLocalIPAddress failed.", ex);
    }
    return "0.0.0.0";
}
```

Note : Le fallback `"0.0.0.0"` est retourné au lieu de lever, ce qui préserve la stabilité. La valeur `"0.0.0.0"` est un indicateur explicite d'absence d'adresse (visible dans les logs `/info`).

---

### ERR-7 — `ThreadInterruptedException` non catchée dans la boucle loopback fallback

**Fichier :** `Vigitemp agent/Vigitemp agent/MyCustomApplicationContext.cs`
**Lignes :** 617-621 (dans la méthode `Start`, bloc catch `HttpListenerException`)

Quand `HttpServer` échoue avec "Access denied" (code 5), le code bascule sur `LoopbackSessionServer` et entre dans une boucle `while(true) Thread.Sleep(1000)`. Lors du shutdown, `serverThread.Interrupt()` est appelé (ligne 693), ce qui lève `ThreadInterruptedException` dans `Thread.Sleep`. Cette exception est capturée par le `catch (Exception ex)` externe (ligne 623) et loggée comme "HttpServer thread crashed" — ce qui est trompeur.

**Avant (lignes 617-621) :**
```csharp
while (true)
{
    Thread.Sleep(1000);
}
```

**Après :**
```csharp
while (true)
{
    try
    {
        Thread.Sleep(1000);
    }
    catch (ThreadInterruptedException)
    {
        AgentLog.Info("LoopbackSessionServer fallback loop interrupted (clean shutdown).");
        return;
    }
}
```

**Vérification Task 3 :** Compiler le projet. Pour ERR-5, exécuter l'installeur et vérifier que l'agent démarre. Pour ERR-7, tester le shutdown propre en mode loopback et vérifier que les logs n'indiquent pas de crash.

---

## Task 4 — Logique métier

**Fichiers touchés :** `Form_Alert.cs`, `HttpServer.cs`

### LOG-2 — Double affectation de `this.x` dans `showAlert()`

**Fichier :** `Vigitemp agent/Vigitemp agent/Form_Alert.cs`
**Ligne :** 163

Ligne 163 assigne `this.x` (position centrée), puis ligne 166 l'écrase immédiatement avec la position bord droit. La ligne 163 est inutile.

**Avant (lignes 161-167) :**
```csharp
if(this.Visible == false)
{
    this.Name = "form_Alert";
    this.x = Screen.PrimaryScreen.WorkingArea.Width - Screen.PrimaryScreen.WorkingArea.Width / 2 - this.Width / 2;
    this.y = -this.Height - 15;
    this.Location = new Point(this.x, this.y);
    this.x = Screen.PrimaryScreen.WorkingArea.Width - base.Width - 5;
    this.Show();
}
```

**Après :**
```csharp
if(this.Visible == false)
{
    this.Name = "form_Alert";
    this.x = Screen.PrimaryScreen.WorkingArea.Width - base.Width - 5;
    this.y = -this.Height - 15;
    this.Location = new Point(this.x, this.y);
    this.Show();
}
```

---

### LOG-3 — Timer continue en état `wait` après `base.Hide()`

**Fichier :** `Vigitemp agent/Vigitemp agent/Form_Alert.cs`
**Lignes :** 70-72 (case `wait`) et 107-115 (case `close`)

Dans le case `close` (ligne 111-114), `base.Hide()` est appelé mais `timer1` n'est pas arrêté. Le timer continue à tick au rythme de 1 ms, puis transite vers `wait` (interval 10 s), ce qui est inutile et consomme des ressources quand le formulaire est caché.

**Avant (lignes 107-115, case `close`) :**
```csharp
case enumAction.close:
    timer1.Interval = 1;
    this.Opacity -= 0.1;
    this.Top -= 3;
    if (base.Opacity <= 0.0)
    {
        base.Hide();
    }
    break;
```

**Après :**
```csharp
case enumAction.close:
    timer1.Interval = 1;
    this.Opacity -= 0.1;
    this.Top -= 3;
    if (base.Opacity <= 0.0)
    {
        base.Hide();
        timer1.Stop();
    }
    break;
```

---

### LOG-4 — `base.Opacity` incohérent avec `this.Opacity`

**Fichier :** `Vigitemp agent/Vigitemp agent/Form_Alert.cs`
**Ligne :** 111

Tout le code de `timer1_Tick` utilise `this.Opacity` (lignes 75, 93, 101, 109) sauf la condition de vérification qui utilise `base.Opacity` (ligne 111). `base.Opacity` et `this.Opacity` sont la même valeur car `Opacity` n'est pas surchargée, mais la cohérence est importante pour la lisibilité et pour éviter de futurs bugs si `Opacity` était jamais surchargée.

**Avant (ligne 111) :**
```csharp
if (base.Opacity <= 0.0)
```

**Après :**
```csharp
if (this.Opacity <= 0.0)
```

---

### LOG-5 — `ExtractJsonString` / `ParseJson` ne gèrent pas les `\"`

**Fichiers :** `Vigitemp agent/Vigitemp agent/LoopbackSessionServer.cs` (lignes 322-345), `Vigitemp agent/Vigitemp agent/SessionStore.cs` (lignes 131-174)

Le parser JSON manuel cherche le premier `"` après la valeur sans tenir compte des séquences d'échappement `\"`. Un token ou username contenant `\"` serait tronqué.

**Fix pour `LoopbackSessionServer.cs`, méthode `ExtractJsonString` (lignes 322-345) :**

Remplacer la méthode entière par une utilisation de `Newtonsoft.Json` (déjà référencé dans le projet via `Newtonsoft.Json.Linq`) :

**Avant :**
```csharp
private static string ExtractJsonString(string json, string key)
{
    try
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        var token = "\"" + key + "\"";
        var idx = json.IndexOf(token, StringComparison.OrdinalIgnoreCase);
        if (idx < 0) return null;
        idx = json.IndexOf(':', idx);
        if (idx < 0) return null;
        idx++;
        while (idx < json.Length && char.IsWhiteSpace(json[idx])) idx++;
        if (idx >= json.Length) return null;
        if (json[idx] != '"') return null;
        idx++;
        var end = json.IndexOf('"', idx);
        if (end < 0) return null;
        return json.Substring(idx, end - idx);
    }
    catch
    {
        return null;
    }
}
```

**Après :**
```csharp
private static string ExtractJsonString(string json, string key)
{
    try
    {
        if (string.IsNullOrWhiteSpace(json)) return null;
        var obj = Newtonsoft.Json.Linq.JObject.Parse(json);
        return obj.Value<string>(key);
    }
    catch
    {
        return null;
    }
}
```

Ajouter `using Newtonsoft.Json.Linq;` en tête de `LoopbackSessionServer.cs` si absent.

**Fix pour `SessionStore.cs`, méthode `ParseJson` (lignes 131-174) :**

Remplacer la méthode entière :

**Avant :**
```csharp
private static SessionInfo ParseJson(string json)
{
    // Expected keys: token, userId, username, expiresAtUtc
    var session = new SessionInfo();
    if (string.IsNullOrWhiteSpace(json)) return session;

    string GetValue(string key)
    {
        var token = "\"" + key + "\"";
        var idx = json.IndexOf(token, StringComparison.OrdinalIgnoreCase);
        if (idx < 0) return null;
        idx = json.IndexOf(':', idx);
        if (idx < 0) return null;
        idx++;
        while (idx < json.Length && char.IsWhiteSpace(json[idx])) idx++;
        if (idx >= json.Length) return null;
        if (json[idx] == '"')
        {
            idx++;
            var end = json.IndexOf('"', idx);
            if (end < 0) return null;
            return json.Substring(idx, end - idx);
        }
        // non-string (null/number/bool)
        var end2 = idx;
        while (end2 < json.Length && json[end2] != ',' && json[end2] != '}') end2++;
        return json.Substring(idx, end2 - idx).Trim();
    }

    session.Token = GetValue("token");
    session.UserId = GetValue("userId");
    session.Username = GetValue("username");
    var expires = GetValue("expiresAtUtc") ?? GetValue("expiresAt");
    if (!string.IsNullOrWhiteSpace(expires) && expires != "null")
    {
        DateTime dt;
        if (DateTime.TryParse(expires, out dt))
        {
            session.ExpiresAtUtc = DateTime.SpecifyKind(dt, DateTimeKind.Utc);
        }
    }

    return session;
}
```

**Après :**
```csharp
private static SessionInfo ParseJson(string json)
{
    var session = new SessionInfo();
    if (string.IsNullOrWhiteSpace(json)) return session;

    try
    {
        var obj = Newtonsoft.Json.Linq.JObject.Parse(json);
        session.Token = obj.Value<string>("token");
        session.UserId = obj.Value<string>("userId");
        session.Username = obj.Value<string>("username");
        var expiresRaw = obj.Value<string>("expiresAtUtc") ?? obj.Value<string>("expiresAt");
        if (!string.IsNullOrWhiteSpace(expiresRaw) && expiresRaw != "null")
        {
            DateTime dt;
            if (DateTime.TryParse(expiresRaw, out dt))
            {
                session.ExpiresAtUtc = DateTime.SpecifyKind(dt, DateTimeKind.Utc);
            }
        }
    }
    catch
    {
        // JSON parse error — return partial/empty session
    }

    return session;
}
```

Ajouter `using Newtonsoft.Json.Linq;` en tête de `SessionStore.cs` si absent.

---

### LOG-6 — `TryOpenSingleLogTag` dans `HttpServer` utilise toujours type `4` pour `GetPortInfo` details

**Fichier :** `Vigitemp agent/Vigitemp agent/HttpServer.cs`
**Ligne :** 310

Le code détecte d'abord avec le type `4` (LTHID), puis en fallback avec le type `8` (USB) si portCount == 0. Mais à la ligne 310, `GetPortInfo` pour les détails est toujours appelé avec `4`, même si c'est le fallback `8` qui a trouvé le port.

Note : `TryOpenSingleLogTag` dans `HttpServer.cs` est du code mort selon DEAD-6 (la voie réelle passe par `InvokeVigilogWorkerAsync`). Si DEAD-6 est implémenté avant LOG-6, ce fix devient sans objet.

Si le code doit être corrigé avant suppression :

**Avant (lignes 284-312) :**
```csharp
setStep?.Invoke("GetPortInfoPrimary");
if (LogTag.GetPortInfo(null, ref portCount, 4) != 0)
    AgentLog.Error("TryOpenSingleLogTag: GetPortInfo(4) failed.", null);
if (portCount == 0)
{
    setStep?.Invoke("GetPortInfoFallback");
    if (LogTag.GetPortInfo(null, ref portCount, 8) != 0)
        AgentLog.Error("TryOpenSingleLogTag: GetPortInfo(8) failed.", null);
}
// ... portCount checks ...
LOGTAG_PORTINFO[] tabPortInfo = new LOGTAG_PORTINFO[portCount];
setStep?.Invoke("GetPortInfoDetails");
if (LogTag.GetPortInfo(tabPortInfo, ref portCount, 4) != 0)   // <-- toujours 4
    AgentLog.Error("TryOpenSingleLogTag: GetPortInfo(details) failed.", null);
```

**Après :**
```csharp
int portType = 4;
setStep?.Invoke("GetPortInfoPrimary");
if (LogTag.GetPortInfo(null, ref portCount, (ushort)portType) != 0)
    AgentLog.Error("TryOpenSingleLogTag: GetPortInfo(4) failed.", null);
if (portCount == 0)
{
    portType = 8;
    setStep?.Invoke("GetPortInfoFallback");
    if (LogTag.GetPortInfo(null, ref portCount, (ushort)portType) != 0)
        AgentLog.Error("TryOpenSingleLogTag: GetPortInfo(8) failed.", null);
}
// ... portCount checks ...
LOGTAG_PORTINFO[] tabPortInfo = new LOGTAG_PORTINFO[portCount];
setStep?.Invoke("GetPortInfoDetails");
if (LogTag.GetPortInfo(tabPortInfo, ref portCount, (ushort)portType) != 0)   // portType correct
    AgentLog.Error("TryOpenSingleLogTag: GetPortInfo(details) failed.", null);
```

---

### LOG-7 — `vigilogSensor[0].cbSize = 0` forcé dans `ConfigureVigilogLoggerInternal`

**Fichier :** `Vigitemp agent/Vigitemp agent/HttpServer.cs`
**Ligne :** 559

`CreateSensorArray` initialise `cbSize` correctement (équivalent dans `HttpServer.cs` : `ltsensor = new LOGTAG_SENSOR[1]` à la ligne 326). La ligne 559 écrase cette valeur avec `0`, ce qui provoque un comportement indéfini dans l'API LogTag.

Note : `ConfigureVigilogLoggerInternal` est du code mort (voir DEAD-6). Si DEAD-6 est implémenté avant LOG-7, ce fix devient sans objet.

Si le code doit être corrigé avant suppression :

**Avant (ligne 559) :**
```csharp
vigilogSensor[0].cbSize = 0;
```

**Après :** Supprimer cette ligne entièrement.

**Vérification Task 4 :** Compiler. Pour LOG-2/LOG-3/LOG-4, observer visuellement l'animation du bandeau alerte (apparition, disparition, état après hide).

---

## Task 5 — Code mort

**Fichiers touchés :** `Form_Alert.cs`, `HttpServer.cs`

### DEAD-1 — Blocs de code commentés dans `Form_Alert.cs`

**Fichier :** `Vigitemp agent/Vigitemp agent/Form_Alert.cs`

Supprimer les blocs suivants (après les fixes LOG-2/LOG-3/LOG-4 qui touchent les mêmes zones) :

- Lignes 65-67 : bloc `//if (!this.IsHandleCreated) ...` (3 lignes)
- Lignes 118-148 : second bloc `switch` entier commenté (31 lignes)
- Ligne 158 : `//Form_Alert frm = (Form_Alert)Application.OpenForms["form_Alert"];`
- Lignes 179-183 : bloc commenté dans `hideAlert`
- Ligne 280 : `//MessageBox.Show("Alarm triggered!");` dans `DisplayAlarm`
- Lignes 287-288 : `//MessageBox.Show("Alarm triggered!");` dans `DisplayAlarm` (branche else)
- Lignes 298-300 : `//MessageBox.Show("Alarm triggered!");` dans `HideAlarm` (branche Invoke)
- Lignes 306-308 : `//MessageBox.Show("Alarm triggered!");` dans `HideAlarm` (branche else)

---

### DEAD-2 — Champ `y` inutile dans `Form_Alert`

**Fichier :** `Vigitemp agent/Vigitemp agent/Form_Alert.cs`
**Ligne :** 53 (déclaration `private int x, y;`), usage dans `showAlert()` ligne 164

`this.y` est assigné à la ligne 164 et utilisé immédiatement dans `this.Location = new Point(this.x, this.y)` (ligne 165). Il n'est jamais relu ailleurs. Après LOG-2 (`this.x` est conservé car réutilisé pour la position finale), `this.y` peut être remplacé par une variable locale.

**Avant (lignes 53, 164-165 dans le contexte post-LOG-2) :**
```csharp
private int x, y;   // ligne 53
// ...
this.x = Screen.PrimaryScreen.WorkingArea.Width - base.Width - 5;
this.y = -this.Height - 15;
this.Location = new Point(this.x, this.y);
```

**Après :**

Ligne 53 — remplacer `private int x, y;` par `private int x;`

Dans `showAlert()` — remplacer `this.y` par une variable locale :
```csharp
this.x = Screen.PrimaryScreen.WorkingArea.Width - base.Width - 5;
int startY = -this.Height - 15;
this.Location = new Point(this.x, startY);
```

---

### DEAD-3 — `HttpServer.url` non utilisé après fix TS-1

**Fichier :** `Vigitemp agent/Vigitemp agent/HttpServer.cs`
**Ligne :** 34 (après fix TS-1 : `public static string url = "";`)

Vérifier par grep si `url` (l'IP locale) est utilisé après le fix TS-1. Dans la version auditée, l'unique usage externe est `HttpServer.url` dans `MyCustomApplicationContext.cs` ligne 568 (dans `ShowInstallSummaryIfNeeded`). Ce call peut être remplacé par `HttpServer.GetUrl()` (la méthode introduite par TS-1).

Si après substitution `url` n'est plus référencé, supprimer le champ.

**Avant (ligne 568 de `MyCustomApplicationContext.cs`) :**
```csharp
var httpServerOk = HttpServer.listener != null && HttpServer.listener.IsListening;
```
(La variable `url` n'est pas directement dans ce snippet mais vérifier si un log ou affichage l'utilise)

Grep `HttpServer.url` dans tout le projet avant de supprimer.

---

### DEAD-4 — Imports inutilisés dans `HttpServer.cs`

**Fichier :** `Vigitemp agent/Vigitemp agent/HttpServer.cs`
**Lignes :** 1-19

Après la suppression du code LogTag direct (DEAD-6), les imports suivants deviennent potentiellement inutilisés :

- `using System.ComponentModel;` (ligne 14) — vérifier usage
- `using LogTagNETV2;` (ligne 16) — inutilisé si tout le code LogTag direct est supprimé
- Les aliases `using HINSTANCE = IntPtr;` et `using LOGTAG_HANDLE = UInt32;` (lignes 23-24) — inutilisés si le code LogTag direct est supprimé

Lancer une compilation et supprimer tous les `using` signalés comme avertissements CS8019.

---

### DEAD-6 — Méthodes mortes suite au refactoring vers sous-processus worker

**Fichier :** `Vigitemp agent/Vigitemp agent/HttpServer.cs`

Ces méthodes ne sont plus appelées depuis le refactoring vers `InvokeVigilogWorkerAsync`. Vérifier d'abord par grep que `InvokeVigilogWorkerAsync` est bien l'unique point d'entrée pour les opérations LogTag :

```
grep -n "ProbeVigilogLoggerInternal\|ConfigureVigilogLoggerInternal\|ReadVigilogLoggerInternal\|ExecuteVigilogOperation\|TryOpenSingleLogTag" HttpServer.cs
```

Si les méthodes ne sont appelées que par elles-mêmes (récursion) ou par d'autres méthodes mortes, supprimer :

1. **`TryOpenSingleLogTag`** (lignes 252-345) — version `HttpServer`, distincte du worker
2. **`ProbeVigilogLoggerInternal`** (lignes 499-536)
3. **`ConfigureVigilogLoggerInternal`** (lignes 538-604)
4. **`ReadVigilogLoggerInternal`** (lignes 606-668)
5. **`ExecuteVigilogOperation`** (lignes 465-497)
6. Helpers associés : `ReadUnicodeByteArray` (lignes 229-240), `ExtractLogTagSerial` (lignes 242-245), `ExtractLogTagComment` (lignes 247-250), `BuildVigilogFailurePayload` (lignes 347-354) — seulement si non utilisés par le code actif

Attention : `BuildVigilogFailurePayload` est utilisée dans `InvokeVigilogWorkerAsync` (lignes 372, 408, 413, 436, 461) — ne pas la supprimer.

**Avant suppression**, confirmer la liste des méthodes supprimées avec grep et s'assurer que :
- Les `using` associés (`LogTagNETV2`) peuvent être supprimés (DEAD-4)
- Les aliases de type (`HINSTANCE`, `LOGTAG_HANDLE`) ne sont plus utilisés

**Vérification Task 5 :** Compiler sans warnings CS0168 (variable non utilisée), CS0219 (valeur assignée mais non utilisée), CS8019 (using inutilisé). Le comportement fonctionnel ne doit pas changer.

---

## Commits suggérés

Après chaque tâche :

```bash
# Task 1
git add "Vigitemp agent/Vigitemp agent/HttpServer.cs" "Vigitemp agent/Vigitemp agent/MyCustomApplicationContext.cs"
git commit -m "fix(agent): thread safety — volatile fields, lazy IP init, listener lock"

# Task 2
git add "Vigitemp agent/Vigitemp agent/Form_Alert.cs" "Vigitemp agent/Vigitemp agent/Form_Alert.Designer.cs" "Vigitemp agent/Vigitemp agent/HttpServer.cs" "Vigitemp agent/Vigitemp agent/MyCustomApplicationContext.cs" "Vigitemp agent/Vigitemp agent/VigilogWorkerRunner.cs"
git commit -m "fix(agent): resource leaks — Font reuse, Database try scope, StatusForm dispose, worker log rotation"

# Task 3
git add "Vigitemp agent/Vigitemp agent/HttpServer.cs" "Vigitemp agent/Vigitemp agent/VigilogWorkerRunner.cs" "Vigitemp agent/Vigitemp agent/SessionStore.cs" "Vigitemp agent/Vigitemp agent/Installer.cs" "Vigitemp agent/Vigitemp agent/MyCustomApplicationContext.cs"
git commit -m "fix(agent): error handling — TryGetValue for params, DateTime guard, TryParse, SessionStore log, Installer exe name, IP fallback, ThreadInterruptedException"

# Task 4
git add "Vigitemp agent/Vigitemp agent/Form_Alert.cs" "Vigitemp agent/Vigitemp agent/HttpServer.cs" "Vigitemp agent/Vigitemp agent/LoopbackSessionServer.cs" "Vigitemp agent/Vigitemp agent/SessionStore.cs"
git commit -m "fix(agent): business logic — remove double x assignment, stop timer on hide, fix base.Opacity, JSON parser robustness, portType tracking"

# Task 5
git add "Vigitemp agent/Vigitemp agent/Form_Alert.cs" "Vigitemp agent/Vigitemp agent/HttpServer.cs"
git commit -m "refactor(agent): remove dead code — commented blocks, unused field y, dead LogTag methods, unused imports"
```

---

## Ordre d'exécution recommandé

1. **Task 3 (ERR-5)** en premier — risque fort de régression à l'installation
2. **Task 1** — thread safety, zéro impact fonctionnel mais critique pour la stabilité 24/7
3. **Task 3 (reste)** — gestion d'erreurs
4. **Task 2** — ressources
5. **Task 4** — logique métier
6. **Task 5 (DEAD-6)** en dernier — après validation que tout fonctionne, supprimer le code mort

---

## Récapitulatif des anomalies par priorité

| ID | Priorité | Impact | Fichier |
|---|---|---|---|
| ERR-5 | Critique | Installation silencieusement cassée | `Installer.cs` |
| TS-1 | Critique | `TypeInitializationException` non récupérable au démarrage | `HttpServer.cs:34` |
| ERR-7 | Haute | Faux crash loggé au shutdown (mode loopback) | `MyCustomApplicationContext.cs:617` |
| ERR-1 | Haute | `KeyNotFoundException` → HTTP 500 si paramètre absent | `HttpServer.cs:1051` |
| RES-3 | Haute | Fuite connexion DB si `InitConnexion` lève | `HttpServer.cs:1159` |
| TS-2 | Haute | Data race sur `listener` (shutdown concurrent) | `HttpServer.cs:32` |
| TS-3 | Moyenne | Data race sur `SITEWEB_URL`/`AGENT_SECRET` | `MyCustomApplicationContext.cs:19` |
| TS-4 | Moyenne | Data race sur `frm` | `MyCustomApplicationContext.cs:30` |
| ERR-4 | Moyenne | Exception silencieuse dans `SessionStore.Load` | `SessionStore.cs:50` |
| ERR-3 | Moyenne | `FormatException` si valeur non parseable | `VigilogWorkerRunner.cs:700` |
| ERR-6 | Moyenne | Exception non gérée dans `GetLocalIPAddress` (HttpServer) | `HttpServer.cs:681` |
| LOG-5 | Moyenne | Parser JSON cassé si valeur contient `\"` | `LoopbackSessionServer.cs:322`, `SessionStore.cs:131` |
| RES-2 | Faible | Fuite `Font` (GDI) à chaque alerte | `Form_Alert.cs:154` |
| RES-4 | Faible | `_refreshTimer` non disposé au shutdown | `StatusForm.cs:16` |
| RES-5 | Faible | Log worker sans rotation (croissance illimitée) | `VigilogWorkerRunner.cs:830` |
| LOG-2 | Faible | Calcul de position inutile (cosmétique) | `Form_Alert.cs:163` |
| LOG-3 | Faible | Timer inutilement actif après hide | `Form_Alert.cs:111` |
| LOG-4 | Faible | `base.Opacity` vs `this.Opacity` (cohérence) | `Form_Alert.cs:111` |
| LOG-6 | Faible | Port type incorrect dans GetPortInfo details (code mort) | `HttpServer.cs:310` |
| LOG-7 | Faible | `cbSize = 0` forcé (code mort) | `HttpServer.cs:559` |
| ERR-2 | Faible | `DateTime` sans guard (code mort) | `HttpServer.cs:633` |
| DEAD-1 | Info | Code commenté | `Form_Alert.cs` |
| DEAD-2 | Info | Champ `y` inutile | `Form_Alert.cs:53` |
| DEAD-3 | Info | Champ `url` potentiellement inutile | `HttpServer.cs:34` |
| DEAD-4 | Info | Imports inutilisés | `HttpServer.cs:1-19` |
| DEAD-6 | Info | Méthodes mortes (code LogTag direct) | `HttpServer.cs:252-668` |
