# 🖥️ Vigitemp Agent (C#) - Documentation Technique

**Type :** Application Windows (System Tray)  
**Framework :** .NET Framework 4.8  
**UI :** Windows Forms  
**Plateforme :** Windows 7+ (x86)

---

## 📋 Vue d'ensemble

Vigitemp Agent est une application Windows qui s'exécute en arrière-plan (system tray) et sert d'interface entre :
- Les capteurs de température LogTag (via dock USB)
- Le website Next.js (via serveur HTTP local)
- L'utilisateur Windows (via pop-ups d'alerte)

### Responsabilités principales
1. **Interface capteurs LogTag USB**
   - Détection automatique dock LogTag
   - Lecture données capteurs
   - Configuration capteurs (seuils température)
   - Téléchargement historique mesures

2. **Serveur HTTP local**
   - Exposition API REST sur port 8000
   - Communication avec website Next.js
   - Endpoints pour capteurs et alertes

3. **Interface utilisateur**
   - Icône system tray persistante
   - Pop-ups alertes visuelles
   - Menu contextuel configuration

---

## 🏗️ Architecture

### Structure du projet
```
Vigitemp agent/
├── Vigitemp agent/
│   ├── HttpServer.cs              ⭐ Serveur HTTP + Main()
│   ├── Database.cs                📊 Accès base de données
│   ├── LogTagNet2.9.cs            🔌 SDK LogTag (ancien)
│   ├── LogTagNET2.9V2.cs          🔌 SDK LogTag (v2)
│   ├── Form_Alert.cs              🔔 Interface alertes
│   ├── MyCustomApplicationContext.cs  🖥️ Gestion app tray
│   ├── Installer.cs               📦 Logique installation
│   ├── App.config                 ⚙️ Configuration
│   ├── LogTagIO29.dll             ⚠️ DLL propriétaire LogTag
│   └── bin/Debug|Release/         🔧 Compilés
└── VigitempAgentInstaller/        📦 Projet installateur MSI
```

### Diagramme de flux
```
┌────────────────────────┐
│  Windows Startup       │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│  Main()                │
│  HttpServer.cs         │
└───────────┬────────────┘
            │
            ├──────────────┐
            │              │
            ▼              ▼
┌──────────────┐    ┌─────────────┐
│ HTTP Listener │    │ Form_Alert  │
│ (Port 8000)   │    │ (Hidden)    │
└───────┬───────┘    └──────┬──────┘
        │                   │
        │ Requêtes          │ Show/Hide
        │ Website           │ Alertes
        ▼                   ▼
┌──────────────────────────┐
│  LogTag SDK              │
│  (LogTagNET2.9V2.cs)     │
└───────────┬──────────────┘
            │
            ▼
┌──────────────────────────┐
│  Dock USB LogTag         │
│  + Capteurs              │
└──────────────────────────┘
            │
            ▼
┌──────────────────────────┐
│  MySQL Database          │
│  vigitemp_mesure         │
└──────────────────────────┘
```

---

## 📦 Dépendances NuGet

### Packages principaux
```xml
<packages>
  <!-- Base de données -->
  <package id="MySql.Data" version="9.0.0" />
  
  <!-- Cryptographie (requis par MySQL) -->
  <package id="BouncyCastle.Cryptography" version="2.3.1" />
  
  <!-- Sérialisation JSON -->
  <package id="Newtonsoft.Json" version="13.0.3" />
  
  <!-- Compression (requis par MySQL) -->
  <package id="K4os.Compression.LZ4" version="1.3.8" />
  <package id="K4os.Compression.LZ4.Streams" version="1.3.8" />
  <package id="K4os.Hash.xxHash" version="1.0.8" />
  <package id="ZstdSharp.Port" version="0.8.0" />
  
  <!-- Protobuf (requis par MySQL) -->
  <package id="Google.Protobuf" version="3.26.1" />
  
  <!-- Utilitaires système -->
  <package id="System.Configuration.ConfigurationManager" version="8.0.0" />
  <package id="System.Diagnostics.DiagnosticSource" version="8.0.1" />
</packages>
```

### Dépendances natives
- **LogTagIO29.dll** - Bibliothèque propriétaire LogTag (non NuGet)
- **System.Windows.Forms** - Interface utilisateur Windows
- **System.Net.Http** - Serveur HTTP

---

## 🔌 API HTTP Exposée (Port 8000)

### Configuration serveur
```csharp
// HttpServer.cs
public static string url = "http://" + GetLocalIPAddress() + ":8000/";
public static string url_localhost = "http://127.0.0.1:8000/";

public static HttpListener listener;
```

### Endpoints disponibles

#### 1. `GET /DownloadLogTagData`

**Fonction :** Récupère toutes les mesures stockées dans un capteur LogTag.

**Processus :**
1. Détecte dock LogTag USB
2. Lit toutes les mesures du capteur
3. Extrait numéro de série
4. Génère `id_recuperationMesure` (timestamp)
5. Insère mesures dans `vigitemp_mesure.ts_mesuresvigiloghugo`
6. Retourne JSON avec résultat

**Réponse succès :**
```json
{
  "res": "true",
  "details": "Valeur correctements recupérées",
  "id_recuperationMesure": "20251126143025"
}
```

**Réponse erreur :**
```json
{
  "res": "false",
  "details": "Aucun docker logtag connecté"
}
// Autres erreurs possibles :
// - "Plusieurs docker connectés"
// - "Pas de capteur logtag dans le dock"
// - "Impossible d'accéder au logtag"
```

**Code clé :**
```csharp
// Lecture données capteur
LOGTAG_READING[] ltreading = new LOGTAG_READING[ltinfo[0].dwNumOfReadings];
ltinfo[0].dwReadingsCount = ltinfo[0].dwNumOfReadings;
LogTag.GetData2(hLogTag, ltinfo, ltsensor, ltreading);

// Extraction numéro de série
string serialNumber = "";
for (int i = 0; i < ltinfo[0].szChannelInfo.Length; i += 2) {
    if (ltinfo[0].szChannelInfo[i] == 0) break;
    serialNumber += (char)ltinfo[0].szChannelInfo[i];
}

// Stockage en base
string id_recuperationMesure = DateTime.Now.ToString("yyyyMMddHHmmss");
Database database = new Database();
database.InitConnexion();

for (int i = 0; i < ltreading.Length; i++) {
    DateTime dt_mesure = new DateTime(
        ltreading[i].stTaken.wYear,
        ltreading[i].stTaken.wMonth,
        ltreading[i].stTaken.wDay,
        ltreading[i].stTaken.wHour,
        ltreading[i].stTaken.wMinute,
        ltreading[i].stTaken.wSecond
    );
    
    database.AddMesure(
        serialNumber,
        id_recuperationMesure,
        ltreading[i].dReading[0],
        dt_mesure
    );
}
```

---

#### 2. `GET /downloadLogTagConfiguration`

**Fonction :** Lit la configuration actuelle d'un capteur LogTag.

**Réponse succès :**
```json
{
  "res": "true",
  "details": "Valeur correctements recupérées",
  "res_consigneBasseActive": true,
  "res_consigneHauteActive": true,
  "res_consigneBasseValeur": 2.0,
  "res_consigneHauteValeur": 8.0
}
```

**Code clé :**
```csharp
// Lecture configuration
LOGTAG_INFO[] ltinfo = new LOGTAG_INFO[1];
LogTag.GetInfo2(hLogTag, ltinfo, ltsensor);

// Extraction configuration
string res_consigneHauteActive = (ltinfo[0].baAlertControlByte[0] == 129) ? "true" : "false";
string res_consigneBasseActive = (ltinfo[0].baAlertControlByte[1] == 128) ? "true" : "false";
float res_consigneHauteValeur = ltinfo[0].fAlertThreshVal[0];
float res_consigneBasseValeur = ltinfo[0].fAlertThreshVal[1];
```

---

#### 3. `POST /uploadLogTagConfiguration`

**Fonction :** Configure les seuils d'alerte d'un capteur LogTag.

**Paramètres (query string) :**
```
?consigneHaute=1
&consigneBasse=1
&valeurConsigneHaute=8
&valeurConsigneBasse=2
```

**Traitement :**
```csharp
// Parsing paramètres
bool params_consigneHaute = Convert.ToBoolean(postParams["consigneHaute"]);
bool params_consigneBasse = Convert.ToBoolean(postParams["consigneBasse"]);
int params_valeurConsigneHaute = Convert.ToInt32(postParams["valeurConsigneHaute"]);
int params_valeurConsigneBasse = Convert.ToInt32(postParams["valeurConsigneBasse"]);

// Configuration capteur
ltsensor[i].wConsecutiveAlertDelay = (1 / 1) - 1;

if (params_consigneBasse) {
    ltsensor[i].dLowerAlert = params_valeurConsigneBasse;
}

if (params_consigneHaute) {
    ltsensor[i].dUpperAlert = params_valeurConsigneHaute;
}

ltinfo[0].dwLogInterval = 1 * 60 * 1000; // 1 minute

// Écriture configuration
LogTag.SetInfo2(hLogTag, ltinfo, ltsensor);
```

**Réponse succès :**
```json
{
  "res": "true",
  "details": "Parametrages correctement appliqués"
}
```

---

#### 4. `POST /alarm`

**Fonction :** Affiche ou masque une alerte visuelle Windows.

**Paramètres (query string) :**
```
?action=show&idLieu=123
// OU
?action=hide&idLieu=123
```

**Traitement :**
```csharp
if (postParams["action"] == "show") {
    // Ajouter à la liste des alarmes actives
    if (!idLieuxEnAlarmes.Contains(Int32.Parse(postParams["idLieu"]))) {
        idLieuxEnAlarmes.Add(Int32.Parse(postParams["idLieu"]));
    }
    // Afficher pop-up (thread-safe)
    frm_alert.Invoke((Action)(() => frm_alert.DisplayAlarm()));
}

if (postParams["action"] == "hide") {
    // Retirer de la liste
    idLieuxEnAlarmes.Remove(Int32.Parse(postParams["idLieu"]));
    
    // Si plus d'alarmes, masquer pop-up
    if (idLieuxEnAlarmes.Count == 0) {
        frm_alert.Invoke((Action)(() => frm_alert.HideAlarm()));
    }
}
```

**Gestion multi-alarmes :**
- Liste `idLieuxEnAlarmes` maintient les lieux en alerte
- Pop-up reste visible tant qu'au moins 1 alarme active
- Masquage automatique quand dernière alarme résolue

---

## 🗄️ Classe Database.cs

### Connexions MySQL
```csharp
public class Database {
    private static readonly string IP_ADDRESS = "192.168.63.121";
    private static readonly string PORT = "3306";
    private static readonly string UID = "root";
    private static readonly string PASSWORD = "pass";
    
    private MySqlConnection connection_vigitemp;        // Base config
    private MySqlConnection connection_vigitemp_mesure; // Base mesures
    
    public void InitConnexion() {
        string connectionString = 
            "SERVER=" + IP_ADDRESS + 
            "; Port=" + PORT + 
            "; DATABASE=vigitemp; UID=" + UID + 
            "; PASSWORD=" + PASSWORD + ";";
        
        this.connection_vigitemp = new MySqlConnection(connectionString);
        this.connection_vigitemp.Open();
        
        connectionString = 
            "SERVER=" + IP_ADDRESS + 
            "; Port=" + PORT + 
            "; DATABASE=vigitemp_mesure; UID=" + UID + 
            "; PASSWORD=" + PASSWORD + ";";
        
        this.connection_vigitemp_mesure = new MySqlConnection(connectionString);
        this.connection_vigitemp_mesure.Open();
    }
}
```

### Méthodes disponibles

#### `AddMesure()`
```csharp
public bool AddMesure(
    string p_numeroSerie,
    string p_id_recuperationMesure,
    double p_valeur_mesure,
    DateTime p_heure_mesure
) {
    MySqlCommand cmd_vigitemp_mesure = this.connection_vigitemp_mesure.CreateCommand();
    cmd_vigitemp_mesure.CommandText = 
        "INSERT INTO ts_mesuresvigiloghugo " +
        "(serialNumber, id_recuperationMesure, valeur_mesure, heure_mesure) " +
        "VALUES " +
        "(@serialNumber, @idrecuperationmesure, @valeurmesure, @heuremesure)";
    
    cmd_vigitemp_mesure.Parameters.AddWithValue("@serialNumber", p_numeroSerie);
    cmd_vigitemp_mesure.Parameters.AddWithValue("@idrecuperationmesure", p_id_recuperationMesure);
    cmd_vigitemp_mesure.Parameters.AddWithValue("@valeurmesure", p_valeur_mesure);
    cmd_vigitemp_mesure.Parameters.AddWithValue("@heuremesure", p_heure_mesure);
    
    cmd_vigitemp_mesure.ExecuteNonQuery();
    CloseConnexion();
    
    return true;
}
```

#### `addPCtoDBClientsList()`
```csharp
public string addPCtoDBClientsList(string adresseIP, string nomMachine) {
    MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();
    cmd_vigitemp.CommandText = 
        "SELECT 1 as res from t_postes_clients " +
        "where AdresseIpConnexion = '" + adresseIP + "';";
    
    MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
    
    if (dr_lieux.HasRows) {
        // UPDATE si existe
        dr_lieux.Close();
        cmd_vigitemp.CommandText = 
            "UPDATE t_postes_clients " +
            "SET NomMachineConnexion = '" + nomMachine + "' " +
            "WHERE AdresseIpConnexion = '" + adresseIP + "'";
        cmd_vigitemp.ExecuteNonQuery();
    } else {
        // INSERT si nouveau
        dr_lieux.Close();
        cmd_vigitemp.CommandText = 
            "INSERT INTO t_postes_clients (NomMachineConnexion, AdresseIpConnexion) " +
            "VALUES ('" + nomMachine + "', '" + adresseIP + "')";
        cmd_vigitemp.ExecuteNonQuery();
    }
    
    CloseConnexion();
    return "OK";
}
```

#### `getServerIp()`
```csharp
public string getServerIp() {
    MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();
    cmd_vigitemp.CommandText = 
        "SELECT Valeur from t_parametre where MotCle = 'serveur_ip_1';";
    
    MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
    dr_lieux.Read();
    string res = dr_lieux["Valeur"].ToString();
    dr_lieux.Close();
    CloseConnexion();
    
    return res;
}
```

#### `getWebsiteURL()`
```csharp
public string getWebsiteURL() {
    MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();
    cmd_vigitemp.CommandText = 
        "SELECT Valeur from t_parametre where MotCle = 'SITE_WEB_URL';";
    
    MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
    dr_lieux.Read();
    string res = dr_lieux["Valeur"].ToString();
    dr_lieux.Close();
    CloseConnexion();
    
    return res;
}
```

---

## 🔔 Système d'alertes (Form_Alert.cs)

### Architecture
```csharp
public class Form_Alert : Form {
    private bool isVisible = false;
    
    public void DisplayAlarm() {
        if (!isVisible) {
            this.Show();
            this.WindowState = FormWindowState.Normal;
            this.BringToFront();
            isVisible = true;
        }
    }
    
    public void HideAlarm() {
        if (isVisible) {
            this.Hide();
            isVisible = false;
        }
    }
}
```

### Propriétés Form
- **FormBorderStyle :** FixedDialog
- **ShowInTaskbar :** false
- **TopMost :** true (toujours au premier plan)
- **StartPosition :** CenterScreen

---

## 🖥️ System Tray (MyCustomApplicationContext.cs)

### Implémentation
```csharp
public class MyCustomApplicationContext : ApplicationContext {
    private NotifyIcon trayIcon;
    private Form_Alert frm_alert;
    
    public MyCustomApplicationContext(string[] args) {
        // Créer icône tray
        trayIcon = new NotifyIcon() {
            Icon = Properties.Resources.AppIcon,
            ContextMenu = new ContextMenu(new MenuItem[] {
                new MenuItem("Configuration", OnConfiguration),
                new MenuItem("Quitter", OnExit)
            }),
            Visible = true,
            Text = "Vigitemp Agent"
        };
        
        // Démarrer serveur HTTP
        Task.Run(() => HttpServer.Main(args));
    }
    
    void OnConfiguration(object sender, EventArgs e) {
        // Ouvrir fenêtre configuration
    }
    
    void OnExit(object sender, EventArgs e) {
        trayIcon.Visible = false;
        Application.Exit();
    }
}
```

---

## 🔧 Configuration (App.config)

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <appSettings>
    <add key="ServerIP" value="192.168.63.121"/>
    <add key="ServerPort" value="3306"/>
    <add key="DatabaseUser" value="root"/>
    <add key="DatabasePassword" value="pass"/>
    <add key="HttpPort" value="8000"/>
    <add key="LogTagTimeout" value="30000"/>
  </appSettings>
  
  <startup>
    <supportedRuntime version="v4.0" sku=".NETFramework,Version=v4.8"/>
  </startup>
</configuration>
```

---

## 📦 Installation et déploiement

### Projet VigitempAgentInstaller.vdproj

**Type :** Installateur MSI (Visual Studio Installer Project)

**Contenu :**
- VigitempAgent.exe
- LogTagIO29.dll
- Dépendances NuGet
- Raccourci démarrage Windows
- Icône application

**Prérequis système :**
- Windows 7 ou supérieur (x86/x64)
- .NET Framework 4.8
- Drivers USB LogTag

**Installation :**
```cmd
# Double-clic sur VigitempAgentInstaller.msi
# OU ligne de commande :
msiexec /i VigitempAgentInstaller.msi /qn
```

**Désinstallation :**
```cmd
# Panneau de configuration > Programmes
# OU
msiexec /x VigitempAgentInstaller.msi /qn
```

---

## 🧪 Tests et Debug

### Compilation Debug
```cmd
cd "C:\Vigitemp project\vigitemp\Vigitemp agent"
msbuild "Vigitemp Agent.sln" /p:Configuration=Debug
```

### Exécution Debug
```cmd
cd "Vigitemp agent\bin\Debug"
VigitempAgent.exe
```

### Logs
**Fichier :** `output.txt` (dans le dossier bin)

```csharp
// HttpServer.cs
Console.WriteLine("Request #: {0}", ++requestCount);
Console.WriteLine(req.Url.ToString());
Console.WriteLine(req.HttpMethod);
```

### Test endpoints
```bash
# Depuis navigateur ou curl
curl http://localhost:8000/downloadLogTagConfiguration
curl http://localhost:8000/DownloadLogTagData
curl -X POST http://localhost:8000/alarm?action=show&idLieu=123
```

---

## ⚠️ Limitations et problèmes connus

### Sécurité
- ⚠️ **Credentials hardcodés** dans Database.cs
- ⚠️ **Requêtes SQL non paramétrées** dans certaines méthodes
- ⚠️ **Serveur HTTP sans authentification**
- ⚠️ **CORS wildcard** (Access-Control-Allow-Origin: *)

**Recommandations :**
```csharp
// Utiliser ConfigurationManager
string dbPassword = ConfigurationManager.AppSettings["DatabasePassword"];

// Requêtes paramétrées TOUJOURS
cmd.CommandText = "SELECT * FROM lieux WHERE id = @id";
cmd.Parameters.AddWithValue("@id", idLieu);

// Authentification HTTP
// Ajouter bearer token ou API key
```

### Performance
- ⚠️ **Connexion DB ouverte/fermée à chaque requête**
  - Solution : Utiliser connection pooling (déjà en place dans MySqlConnection)

- ⚠️ **1 seul dock LogTag à la fois**
  - Limitation matérielle

### Robustesse
- ⚠️ **Pas de retry automatique** si échec LogTag
- ⚠️ **Pas de gestion timeout** sur requêtes HTTP longues
- ⚠️ **Exceptions non loggées** (seulement Console.WriteLine)

**Recommandations :**
```csharp
// Logger professionnel
using NLog; // OU Serilog
private static readonly Logger Logger = LogManager.GetCurrentClassLogger();

try {
    // code
} catch (Exception ex) {
    Logger.Error(ex, "Erreur lors de...");
}
```

---

## 🚀 Évolutions futures

### Court terme
- [ ] Extraire credentials dans App.config
- [ ] Paramétrer toutes les requêtes SQL
- [ ] Ajouter logging structuré (NLog/Serilog)
- [ ] Tests unitaires (NUnit)

### Moyen terme
- [ ] Authentification API (token)
- [ ] Support multi-docks USB (si possible matériellement)
- [ ] Configuration via interface graphique
- [ ] Auto-update depuis serveur

### Long terme
- [ ] Migration .NET Framework 4.8 → .NET 8
- [ ] Réécriture en architecture moderne (dependency injection)
- [ ] Support Linux/macOS (si SDK LogTag disponible)
- [ ] Container Docker

---

## 📞 Contact et Support

**Équipe :** Service informatique MC2  
**Documentation :** `docs/architecture/`  
**Code source :** `Vigitemp agent/Vigitemp agent/`

---

**Documentation mise à jour le 26 novembre 2025**
