# C# Agent Bug Fixes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corriger 5 groupes de bugs dans l'agent Windows (Vigitemp Agent) : fuite de ressources DB, crash du serveur HTTP, thread safety + fuite mémoire de police, fixes mineurs, et traitement concurrent des requêtes.

**Architecture:** L'agent Windows est une application WinForms (tray icon) qui expose un serveur HTTP sur le port 8000. Il reçoit les notifications d'alarme du website Next.js, affiche une bannière WinForms (`Form_Alert`), stocke la session via DPAPI, et peut interagir avec des loggers LogTag via un sous-processus worker.

**Tech Stack:** C# .NET 4.8, WinForms, HttpListener, MySqlConnector, DPAPI (`ProtectedData`)

---

## Task 1 : Database — double-init + fuites de ressources

**Problème :** Le constructeur `Database()` appelle `InitConnexion()` (ligne 21), mais l'appelant (`MyCustomApplicationContext`) rappelle aussi `database.InitConnexion()` (ligne 155) → 4 connexions ouvertes, 2 fuites. De plus, les méthodes `addPCtoDBClientsList`, `AddMesure`, `getServerIp`, `getWebsiteURL` appellent toutes `CloseConnexion()` en interne, ce qui ferme la connexion au milieu d'une session — causant un crash lors de boucles multi-mesures (`DownloadLogTagData`). Autres bugs : `||` au lieu de `&&` dans les null-checks (si une connexion est null, NullReferenceException) ; `MySqlCommand` jamais disposé ; `Console.WriteLine(res)` en prod.

**Files:**
- Modify: `Vigitemp agent/Vigitemp agent/Database.cs` (toutes méthodes)
- Modify: `Vigitemp agent/Vigitemp agent/MyCustomApplicationContext.cs:153-161` (ordre init)

**Step 1: Retirer l'appel `InitConnexion()` du constructeur**

Dans `Database.cs`, remplacer :
```csharp
public Database()
{
    this.InitConnexion();
}
```
Par :
```csharp
public Database()
{
    // Connexion gérée par l'appelant via InitConnexion() / CloseConnexion()
}
```

**Step 2: Fixer `addPCtoDBClientsList` — supprimer les CloseConnexion internes, fix null-check, using commands, supprimer Console.WriteLine**

Remplacer toute la méthode `addPCtoDBClientsList` :
```csharp
public string addPCtoDBClientsList(string adresseIP, string nomMachine)
{
    if (this.connection_vigitemp == null || this.connection_vigitemp_mesure == null)
        return null;

    try
    {
        string res;
        using (var cmd = this.connection_vigitemp.CreateCommand())
        {
            cmd.CommandText = "SELECT 1 AS res FROM t_postes_clients WHERE AdresseIpConnexion = @adresseIP";
            cmd.Parameters.AddWithValue("@adresseIP", adresseIP);

            using (var dr = cmd.ExecuteReader())
            {
                dr.Read();
                res = dr.HasRows ? "1" : "0";
            }
        }

        using (var cmd2 = this.connection_vigitemp.CreateCommand())
        {
            if (res == "1")
            {
                cmd2.CommandText = "UPDATE t_postes_clients SET NomMachineConnexion = @nomMachine WHERE AdresseIpConnexion = @adresseIP";
            }
            else
            {
                cmd2.CommandText = "INSERT INTO t_postes_clients (NomMachineConnexion, AdresseIpConnexion) VALUES (@nomMachine, @adresseIP)";
            }
            cmd2.Parameters.AddWithValue("@nomMachine", nomMachine);
            cmd2.Parameters.AddWithValue("@adresseIP", adresseIP);
            cmd2.ExecuteNonQuery();
        }

        return res;
    }
    catch (Exception ex)
    {
        AgentLog.Error("Database operation failed.", ex);
        return null;
    }
}
```

**Step 3: Fixer `AddMesure` — supprimer CloseConnexion interne, fix null-check, using command**

Remplacer toute la méthode `AddMesure` :
```csharp
public bool AddMesure(string p_numeroSerie, string p_id_recuperationMesure, double p_valeur_mesure, DateTime p_heure_mesure)
{
    if (this.connection_vigitemp == null || this.connection_vigitemp_mesure == null)
        return false;

    try
    {
        using (var cmd = this.connection_vigitemp_mesure.CreateCommand())
        {
            cmd.CommandText = "INSERT INTO ts_mesuresvigiloghugo " +
                              "(serialNumber, id_recuperationMesure, valeur_mesure, heure_mesure) " +
                              "VALUES (@serialNumber, @idrecuperationmesure, @valeurmesure, @heuremesure)";
            cmd.Parameters.AddWithValue("@serialNumber", p_numeroSerie);
            cmd.Parameters.AddWithValue("@idrecuperationmesure", p_id_recuperationMesure);
            cmd.Parameters.AddWithValue("@valeurmesure", p_valeur_mesure);
            cmd.Parameters.AddWithValue("@heuremesure", p_heure_mesure);
            cmd.ExecuteNonQuery();
        }
        return true;
    }
    catch (Exception ex)
    {
        AgentLog.Error("Database operation failed.", ex);
        return false;
    }
}
```

**Step 4: Fixer `getServerIp` et `getWebsiteURL` — supprimer CloseConnexion interne, fix null-check, using commands**

Remplacer `getServerIp` :
```csharp
public string getServerIp()
{
    if (this.connection_vigitemp == null || this.connection_vigitemp_mesure == null)
        return null;

    try
    {
        using (var cmd = this.connection_vigitemp.CreateCommand())
        {
            cmd.CommandText = "SELECT Valeur from t_parametre where MotCle = 'serveur_ip_1';";
            using (var dr = cmd.ExecuteReader())
            {
                if (!dr.Read()) return null;
                return dr["Valeur"].ToString();
            }
        }
    }
    catch (Exception ex)
    {
        AgentLog.Error("Database operation failed.", ex);
        return null;
    }
}
```

Remplacer `getWebsiteURL` :
```csharp
public string getWebsiteURL()
{
    if (this.connection_vigitemp == null || this.connection_vigitemp_mesure == null)
        return null;

    try
    {
        using (var cmd = this.connection_vigitemp.CreateCommand())
        {
            cmd.CommandText = "SELECT Valeur from t_parametre where MotCle = 'SITE_WEB_URL';";
            using (var dr = cmd.ExecuteReader())
            {
                if (!dr.Read()) return null;
                return dr["Valeur"].ToString();
            }
        }
    }
    catch (Exception ex)
    {
        AgentLog.Error("Database operation failed.", ex);
        return null;
    }
}
```

**Step 5: Fixer `MyCustomApplicationContext.cs` — appeler `InitConnexion()` avant `addPCtoDBClientsList`**

Ligne 153, remplacer :
```csharp
Database database = new Database();
database.addPCtoDBClientsList(GetLocalIPAddress(), Environment.MachineName);
database.InitConnexion();
var url = database.getWebsiteURL();
```
Par :
```csharp
Database database = new Database();
database.InitConnexion();
database.addPCtoDBClientsList(GetLocalIPAddress(), Environment.MachineName);
var url = database.getWebsiteURL();
```

**Step 6: Commit**
```bash
git add "Vigitemp agent/Vigitemp agent/Database.cs" "Vigitemp agent/Vigitemp agent/MyCustomApplicationContext.cs"
git commit -m "fix(agent): fix Database double-init, resource leaks, null-checks, Console.WriteLine"
```

---

## Task 2 : HttpServer — crash loop + resource leaks + dead code

**Problème :**
- `HandleIncomingConnections` n'a pas de try/catch extérieur → toute exception dans la boucle (ex: `GetContextAsync` qui lève) tue définitivement le serveur HTTP
- Pas de per-request try/finally → si un handler throw, `resp.Close()` est skipé et la connexion fuit
- `/uploadLogTagConfiguration` accède à `kvPair[1]` sans vérifier que `kvPair.Length >= 2` → crash si un paramètre URL n'a pas de `=`
- Multiples `Console.WriteLine` debug en prod (lignes 750-755, 763, 930)
- Code commenté mort (lignes 698-700, 1298-1302)
- `resp.Close()` à la ligne 1296 peut double-closer des réponses déjà closes (risque d'ObjectDisposedException)

**Files:**
- Modify: `Vigitemp agent/Vigitemp agent/HttpServer.cs`

**Step 1: Ajouter outer try/catch dans `HandleIncomingConnections`**

À la ligne 694, la méthode commence :
```csharp
public static async Task HandleIncomingConnections(Form_Alert frm_alert)
{
    bool runServer = true;

    //try
    //{
    while (runServer)
    {
        HttpListenerContext ctx = await listener.GetContextAsync();
        ...
    }
    //}
    //catch (Exception)
    //{
    //    Console.WriteLine("Thread terminé");
    //}
}
```

Remplacer le bloc complet (supprimer commentaires morts, ajouter vrai guard) :
```csharp
public static async Task HandleIncomingConnections(Form_Alert frm_alert)
{
    bool runServer = true;

    while (runServer)
    {
        HttpListenerContext ctx;
        try
        {
            ctx = await listener.GetContextAsync();
        }
        catch (HttpListenerException)
        {
            // Listener stopped (shutdown)
            return;
        }
        catch (Exception ex)
        {
            AgentLog.Error("HttpServer GetContextAsync failed.", ex);
            return;
        }

        HttpListenerRequest req = ctx.Request;
        HttpListenerResponse resp = ctx.Response;

        try
        {
            EnsureCorsHeaders(resp, req);
            // [tout le code existant de traitement de la requête ici, inchangé]
            // ... (voir steps suivants)
        }
        catch (Exception ex)
        {
            AgentLog.Error("HttpServer request handler failed.", ex);
            try
            {
                resp.StatusCode = 500;
                resp.Close();
            }
            catch
            {
                // ignore
            }
            continue;
        }
    }
}
```

**Step 2: Supprimer le `resp.Close()` orphelin à la fin de la boucle (ligne 1296)**

Ligne 1296 : `resp.Close();` — le supprimer. Chaque handler doit déjà fermer sa réponse. Pour toute route inconnue (GET/POST sans match dans les switch), ajouter une réponse 404 par défaut dans les branches `default: break;`.

Dans la branche POST `default:` (ligne 1120-1122), remplacer :
```csharp
default:
    break;
```
Par :
```csharp
default:
    resp.StatusCode = 404;
    resp.Close();
    break;
```

Dans la branche GET `default:` (ligne 1288-1290), même fix.

Ajouter également un fallback pour les méthodes inconnues (après le `if (req.HttpMethod == "GET")` bloc, avant la fin de la boucle) :
```csharp
// Fallback pour les requêtes non matchées par aucun handler
if (!resp.ContentLength64.Equals(0) == false)
{
    // Déjà traité
}
```
Note : en pratique, après Step 1, le try/catch extérieur couvre les double-closes car `resp.Close()` appelle `Dispose()` qui est idempotent pour `HttpListenerResponse`. Le plus simple est juste de supprimer le `resp.Close()` orphelin de la ligne 1296 et d'ajouter les 404 dans les default.

**Step 3: Fix `/uploadLogTagConfiguration` — vérification bounds sur kvPair**

Ligne 1077, remplacer :
```csharp
foreach (string param in rawParams)
{
    string[] kvPair = param.Split('=');
    string key = kvPair[0];
    string value = HttpUtility.UrlDecode(kvPair[1]);
    postParams.Add(key, value);
}
```
Par :
```csharp
foreach (string param in rawParams)
{
    string[] kvPair = param.Split('=');
    if (kvPair.Length < 2 || string.IsNullOrEmpty(kvPair[0])) continue;
    string key = kvPair[0];
    string value = HttpUtility.UrlDecode(kvPair[1]);
    postParams[key] = value;
}
```

**Step 4: Supprimer les Console.WriteLine debug**

Supprimer les lignes 750-755 (request debug dump) :
```csharp
// Print out some info about the request
Console.WriteLine("Request #: {0}", ++requestCount);
Console.WriteLine(req.Url.ToString());
Console.WriteLine(req.HttpMethod);
Console.WriteLine(req.UserHostName);
Console.WriteLine(req.UserAgent);
Console.WriteLine();
```

Supprimer ligne 763 dans `/shutdown` :
```csharp
Console.WriteLine("Shutdown requested");
```

Supprimer ligne 930 dans `/alarm` hide :
```csharp
Console.WriteLine("alamres en cours: " + idLieuxEnAlarmes.Count);
```

Supprimer les `Console.WriteLine` dans `TryOpenSingleLogTag` (lignes 286, 297, 301, 321, 328, 330) — les remplacer par `AgentLog.Error(...)` ou simplement les supprimer (les erreurs retournées via `errorDetails` suffisent).

**Step 5: Supprimer les champs debug obsolètes**

Supprimer les champs static inutilisés après suppression de Console.WriteLine :
- `public static int pageViews = 0;` (ligne 34)
- `public static int requestCount = 0;` (ligne 35)
- `public static string pageData = ...` (lignes 36-48)
- La ligne `if (req.Url.AbsolutePath != "/favicon.ico") pageViews += 1;` (ligne 1294)

**Step 6: Commit**
```bash
git add "Vigitemp agent/Vigitemp agent/HttpServer.cs"
git commit -m "fix(agent): add HttpServer outer try/catch, per-request guard, fix param bounds, remove debug output"
```

---

## Task 3 : Thread safety + Form_Alert fixes

**Problèmes :**
- `lastAlarmUrl`, `lastNotificationTracking`, `lastNotificationClicked` dans `MyCustomApplicationContext` sont écrits depuis le thread serveur HTTP (via `/notify`) et lus depuis le thread UI (dans `OnBalloonTipClicked` / `OnBalloonTipClosed`) — race condition
- `Form_Alert.showAlert()` appelle `fonts.AddMemoryFont(...)` à chaque appel → la `PrivateFontCollection` grossit sans limite (fuite mémoire)
- `this.Opacity == 1` (ligne 94) est une comparaison floating-point exacte qui peut ne jamais être vraie → boucle d'animation infinie
- `Process.Start(SITEWEB_URL + "/alarmes")` (lignes 246, 252) sans try/catch → crash si l'URL est malformée ou si le processus ne peut pas démarrer
- Stubs d'événements vides (lignes 256-302) — code mort

**Files:**
- Modify: `Vigitemp agent/Vigitemp agent/MyCustomApplicationContext.cs`
- Modify: `Vigitemp agent/Vigitemp agent/Form_Alert.cs`

**Step 1: Protéger les champs de notification partagés dans `MyCustomApplicationContext`**

Ajouter un champ lock après la déclaration de `NotificationClient` (ligne 39) :
```csharp
private readonly object _notifLock = new object();
```

Modifier `ShowAlarmNotification` pour protéger les 3 champs :
```csharp
public void ShowAlarmNotification(string title, string message, string alarmUrl, NotificationTracking tracking)
{
    lock (_notifLock)
    {
        if (!string.IsNullOrWhiteSpace(alarmUrl))
        {
            lastAlarmUrl = alarmUrl;
        }
        lastNotificationTracking = tracking;
        lastNotificationClicked = false;
    }
    // ... reste inchangé
```

Modifier `OnBalloonTipClicked` pour lire sous lock :
```csharp
private void OnBalloonTipClicked(object sender, EventArgs e)
{
    NotificationTracking tracking;
    lock (_notifLock)
    {
        lastNotificationClicked = true;
        tracking = lastNotificationTracking;
    }

    try
    {
        if (tracking != null)
        {
            _ = SendNotificationEvent(tracking, "clicked", null);
        }
    }
    catch
    {
        // ignore
    }

    OpenPortal(sender, e);
}
```

Modifier `OnBalloonTipClosed` :
```csharp
private void OnBalloonTipClosed(object sender, EventArgs e)
{
    NotificationTracking tracking;
    bool clicked;
    lock (_notifLock)
    {
        clicked = lastNotificationClicked;
        tracking = lastNotificationTracking;
        lastNotificationClicked = false;
    }

    try
    {
        if (!clicked && tracking != null)
        {
            _ = SendNotificationEvent(tracking, "closed", null);
        }
    }
    catch
    {
        // ignore
    }
}
```

**Step 2: Fixer la fuite mémoire de police dans `Form_Alert`**

Dans le constructeur `Form_Alert` (ligne 15), après `InitializeComponent()`, ajouter le chargement unique de la police :
```csharp
public Form_Alert(string p_SITEWEB_URL)
{
    InitializeComponent();
    SITEWEB_URL = p_SITEWEB_URL;

    // Charger la police une seule fois
    byte[] fontData = Properties.Resources.Poppins_SemiBold;
    IntPtr fontPtr = System.Runtime.InteropServices.Marshal.AllocCoTaskMem(fontData.Length);
    Marshal.Copy(fontData, 0, fontPtr, fontData.Length);
    uint dummy = 0;
    fonts.AddMemoryFont(fontPtr, fontData.Length);
    AddFontMemResourceEx(fontPtr, (uint)fontData.Length, IntPtr.Zero, ref dummy);
    Marshal.FreeCoTaskMem(fontPtr);

    foreach (Control ctl in this.Controls)
    {
        ctl.MouseClick += new MouseEventHandler(Form_Alert_Click);
    }
}
```

Dans `showAlert`, supprimer le bloc de chargement de police (lignes 146-152) et remplacer l'affectation de police :
```csharp
public void showAlert(string msg)
{
    if (fonts.Families.Length > 0)
    {
        this.label2.Font = new Font(fonts.Families[0], 14.0F);
    }
    this.Opacity = 1.0;
    // ... reste inchangé
```

**Step 3: Fixer la comparaison Opacity**

Ligne 94, remplacer :
```csharp
if (this.Opacity == 1)
```
Par :
```csharp
if (this.Opacity >= 1.0)
```

**Step 4: Protéger les Process.Start dans Form_Alert**

Lignes 246-247, remplacer :
```csharp
private void Form_Alert_Click(object sender, EventArgs e)
{
    System.Diagnostics.Process.Start(SITEWEB_URL + "/alarmes");
    HideAlarm();
}
```
Par :
```csharp
private void Form_Alert_Click(object sender, EventArgs e)
{
    try
    {
        var url = (SITEWEB_URL ?? "").TrimEnd('/') + "/alarmes";
        System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo(url) { UseShellExecute = true });
    }
    catch (Exception ex)
    {
        AgentLog.Error("Failed to open alarm URL.", ex);
    }
    HideAlarm();
}
```

Lignes 251-253, même fix pour `button1_Click_1`.

**Step 5: Supprimer les stubs vides**

Supprimer les méthodes vides (lignes 256-302) :
- `labelmessage_Click_1`
- `button2_Click_1`
- `button3_Click`
- `label1_Click`
- `pictureBox1_Click`
- `button1_Click`

Et supprimer la ligne de code mort commenté dans `showAlert` (ligne 158-168 commenter block si existant).

**Step 6: Commit**
```bash
git add "Vigitemp agent/Vigitemp agent/MyCustomApplicationContext.cs" "Vigitemp agent/Vigitemp agent/Form_Alert.cs"
git commit -m "fix(agent): fix notification field race condition, font leak, Opacity comparison, Process.Start guard"
```

---

## Task 4 : Fixes mineurs

**Problèmes :**
- `AgentLog.cs` : `File.AppendAllText` sans rotation → log illimité, peut remplir le disque
- `LoopbackSessionServer.cs` ligne 311 : `default: return "OK"` — le fallback pour les codes d'erreur (ex: 500) retourne "OK"
- `AgentSecretStore.cs` : `secret ?? ""` stocke une chaîne vide pour null → `AgentSecretStore.Get()` retourne `""` qui passe le check `IsNullOrWhiteSpace` ; `catch` silencieux masque les erreurs DPAPI

**Files:**
- Modify: `Vigitemp agent/Vigitemp agent/AgentLog.cs`
- Modify: `Vigitemp agent/Vigitemp agent/LoopbackSessionServer.cs`
- Modify: `Vigitemp agent/Vigitemp agent/AgentSecretStore.cs`

**Step 1: Ajouter rotation de log dans `AgentLog.cs`**

Ajouter une méthode `RotateIfNeeded` avant `WriteLog` :
```csharp
private const long MaxLogSizeBytes = 5 * 1024 * 1024; // 5 MB

private static void RotateIfNeeded(string path)
{
    try
    {
        if (!File.Exists(path)) return;
        var info = new FileInfo(path);
        if (info.Length < MaxLogSizeBytes) return;

        var backupPath = path + ".bak";
        if (File.Exists(backupPath))
        {
            File.Delete(backupPath);
        }
        File.Move(path, backupPath);
    }
    catch
    {
        // ignore rotation errors
    }
}
```

Dans la méthode `WriteLog` (ou `Info`/`Error`), appeler `RotateIfNeeded(filePath)` avant `File.AppendAllText`.

**Step 2: Fixer `StatusText` dans `LoopbackSessionServer.cs`**

Ligne 303-313, remplacer :
```csharp
private static string StatusText(int status)
{
    switch (status)
    {
        case 200: return "OK";
        case 204: return "No Content";
        case 400: return "Bad Request";
        case 403: return "Forbidden";
        case 404: return "Not Found";
        default: return "OK";
    }
}
```
Par :
```csharp
private static string StatusText(int status)
{
    switch (status)
    {
        case 200: return "OK";
        case 204: return "No Content";
        case 400: return "Bad Request";
        case 403: return "Forbidden";
        case 404: return "Not Found";
        case 500: return "Internal Server Error";
        default: return "Unknown";
    }
}
```

**Step 3: Fixer `AgentSecretStore.Save` — null stocké comme vide**

Dans `AgentSecretStore.cs`, trouver la méthode `Save`. Remplacer le stockage de null par une suppression du fichier :
```csharp
public static void Save(string secret)
{
    try
    {
        var path = SecretFilePath();
        if (string.IsNullOrWhiteSpace(secret))
        {
            // Pas de secret → supprimer le fichier
            if (File.Exists(path)) File.Delete(path);
            return;
        }
        var bytes = Encoding.UTF8.GetBytes(secret);
        var protectedBytes = ProtectedData.Protect(bytes, null, DataProtectionScope.CurrentUser);
        File.WriteAllBytes(path, protectedBytes);
    }
    catch (Exception ex)
    {
        AgentLog.Error("AgentSecretStore.Save failed.", ex);
    }
}
```

**Step 4: Ajouter logging dans le `catch` de `AgentSecretStore.Get`**

Chercher le `catch` silencieux dans `Get()` (chargement DPAPI) et ajouter :
```csharp
catch (Exception ex)
{
    AgentLog.Error("AgentSecretStore.Get failed.", ex);
    return null;
}
```

**Step 5: Commit**
```bash
git add "Vigitemp agent/Vigitemp agent/AgentLog.cs" "Vigitemp agent/Vigitemp agent/LoopbackSessionServer.cs" "Vigitemp agent/Vigitemp agent/AgentSecretStore.cs"
git commit -m "fix(agent): add log rotation, fix StatusText fallback, fix AgentSecretStore null handling"
```

---

## Task 5 : Traitement concurrent des requêtes HTTP

**Problème :** `HandleIncomingConnections` traite les requêtes séquentiellement dans une boucle `while`. Une requête longue (ex: lecture LogTag = 35s) bloque entièrement le serveur : une alarme `/notify` envoyée pendant ce temps sera mise en attente jusqu'à la fin de la lecture. L'alarme est affichée avec 35s de retard.

De plus, `idLieuxEnAlarmes` est un `List<int>` statique non thread-safe. Avec le traitement concurrent, plusieurs handlers peuvent accéder simultanément → corruption de liste ou crash.

**Files:**
- Modify: `Vigitemp agent/Vigitemp agent/HttpServer.cs`

**Step 1: Remplacer `List<int>` par `HashSet<int>` protégé par lock**

En haut de la classe `HttpServer`, remplacer :
```csharp
public static List<int> idLieuxEnAlarmes = new List<int>();
```
Par :
```csharp
private static readonly object _alarmLock = new object();
private static readonly HashSet<int> idLieuxEnAlarmes = new HashSet<int>();
```

Mettre à jour les usages dans `HandleIncomingConnections` (branche `/alarm`) :
```csharp
// show
lock (_alarmLock)
{
    idLieuxEnAlarmes.Add(idLieuVal);
}
// ...

// hide
int alarmCount;
lock (_alarmLock)
{
    idLieuxEnAlarmes.Remove(idLieuVal);
    alarmCount = idLieuxEnAlarmes.Count;
}
if (alarmCount == 0)
    SafeInvokeFormAlert(frm_alert, () => frm_alert.HideAlarm());
```

Pour `/session`, remplacer `if (idLieuxEnAlarmes.Count > 0 ...)` par :
```csharp
int pendingAlarms;
lock (_alarmLock)
{
    pendingAlarms = idLieuxEnAlarmes.Count;
}
if (pendingAlarms > 0 && SessionStore.HasValidSession())
{
    SafeInvokeFormAlert(frm_alert, () => frm_alert.DisplayAlarm());
}
```

**Step 2: Extraire le handler de requête dans une méthode séparée**

Renommer la logique interne de traitement (le bloc `try { EnsureCorsHeaders ... }`) en méthode :
```csharp
private static async Task HandleRequestAsync(HttpListenerContext ctx, Form_Alert frm_alert)
{
    HttpListenerRequest req = ctx.Request;
    HttpListenerResponse resp = ctx.Response;

    try
    {
        EnsureCorsHeaders(resp, req);
        // [tout le code de traitement existant inchangé]
    }
    catch (Exception ex)
    {
        AgentLog.Error("Request handler failed.", ex);
        try
        {
            resp.StatusCode = 500;
            resp.Close();
        }
        catch
        {
            // ignore
        }
    }
}
```

**Step 3: Dispatcher chaque requête sur un Task.Run dans la boucle principale**

Modifier `HandleIncomingConnections` pour ne plus traiter les requêtes dans le thread de la boucle :
```csharp
public static async Task HandleIncomingConnections(Form_Alert frm_alert)
{
    while (true)
    {
        HttpListenerContext ctx;
        try
        {
            ctx = await listener.GetContextAsync();
        }
        catch (HttpListenerException)
        {
            // Listener arrêté (shutdown)
            return;
        }
        catch (Exception ex)
        {
            AgentLog.Error("HttpServer GetContextAsync failed.", ex);
            return;
        }

        // Dispatch sur un thread pool — ne bloque pas la réception des requêtes suivantes
        _ = Task.Run(() => HandleRequestAsync(ctx, frm_alert));
    }
}
```

Note : `runServer = false` (shutdown) est maintenant géré en appelant `listener.Stop()` depuis `MyCustomApplicationContext.Shutdown()` — ce qui fait lancer `HttpListenerException` → retour propre. La variable locale `runServer` peut être supprimée.

**Step 4: Vérifier les autres accès statiques pour thread safety**

Vérifier qu'il n'y a pas d'autres accès statiques modifiés par plusieurs threads :
- `listener` : lu depuis `HandleRequestAsync` mais non modifié → OK (stop = Shutdown thread uniquement)
- `url`, `url_localhost` : readonly → OK
- `pageViews`, `requestCount` : supprimés en Task 2 → OK
- `frm_alert` : passé par référence, seul accès via `SafeInvokeFormAlert` (thread-safe via BeginInvoke) → OK

**Step 5: Commit**
```bash
git add "Vigitemp agent/Vigitemp agent/HttpServer.cs"
git commit -m "refactor(agent): dispatch HTTP requests concurrently via Task.Run to prevent /notify blocking"
```

---

## Vérification finale

1. Compiler le projet (`Build > Rebuild Solution`) — zéro erreur, zéro warning
2. Démarrer l'agent → vérifier dans les logs : pas d'erreur au démarrage
3. Simuler une alarme `POST /notify` pendant qu'une requête `/vigilog/read` est en cours → la notification doit s'afficher immédiatement (pas de délai de 35s)
4. Vérifier que les connexions DB ne fuient pas : envoyer plusieurs requêtes `/DownloadLogTagData` consécutives → pas d'erreur "too many connections"
5. Vérifier que l'animation de la bannière fonctionne toujours (Opacity float fix)
