# Agent - Vigitemp Agent (C#)

## Vue d'ensemble

**Vigitemp Agent** est une **application Windows Desktop** qui tourne en arrière-plan (system tray) et fait le pont entre:
1. Les **capteurs LogTag USB** (dock + sonde température)
2. Le **site web Next.js** (interface utilisateur)
3. L'**utilisateur Windows** (alertes visuelles pop-up)

### Caractéristiques principales

- **Type :** Application Windows (System Tray)
- **Framework :** .NET Framework 4.8
- **UI :** Windows Forms
- **Plateforme :** Windows 7+ (x86)
- **Port HTTP :** 8000 (serveur local)
- **Point d'entrée :** `HttpServer.cs` → `Main()`

---

## Rôle et responsabilités

### 1. Interface capteurs LogTag USB
**Manipulation physique des sondes de température**

- **Détection dock USB** : Vérifie automatiquement si un dock LogTag est branché
- **Lecture données** : Récupère l'historique complet des mesures stockées dans la sonde
- **Configuration seuils** : Permet de définir les températures min/max (alarmes)
- **Interrogation instantanée** : Peut lire la température actuelle sur demande du site web

**Technologies utilisées :**
- DLL propriétaire `LogTagIO29.dll` (fournie par LogTag)
- SDK encapsulé dans `LogTagNET2.9V2.cs`
- Fonctions clés : `OpenAccess()`, `GetInfo2()`, `GetData2()`, `SetInfo2()`

### 2. Serveur HTTP local (Port 8000)
**API REST pour communication avec le site web**

L'agent écoute sur **2 adresses** :
- `http://127.0.0.1:8000/` (localhost)
- `http://[IP_locale]:8000/` (accès réseau local)

**Pourquoi 2 adresses ?**
- Localhost : site web accède depuis le même PC
- IP locale : site web peut être hébergé sur un autre PC du réseau

**Endpoints disponibles :**
```
POST /alarm?action=show&idLieu=X    → Affiche alerte pour le lieu X
POST /alarm?action=hide&idLieu=X    → Cache alerte pour le lieu X
GET  /getdata?idLieu=X               → Télécharge historique LogTag
POST /setinfo?idLieu=X               → Configure seuils température
GET  /getinfo?idLieu=X               → Lit config actuelle LogTag
```

### 3. Interface utilisateur Windows
**Gestion des alertes visuelles**

- **System Tray** : Icône permanente dans la barre des tâches (en bas à droite)
- **Pop-up alarmes** : Fenêtre `Form_Alert` qui s'affiche automatiquement
- **Always On Top** : La fenêtre reste au premier plan (impossible à ignorer)
- **Menu contextuel** : Clic droit sur l'icône → Exit

---

## Flux de données complet (Exemples concrets)

### Scénario 1 : Téléchargement historique LogTag

**Contexte :** L'utilisateur clique sur "Télécharger" dans le site web Next.js pour récupérer les 500 dernières mesures stockées dans un capteur LogTag.

**Déroulement :**

1. **Site web envoie requête** :
   ```javascript
   // website/src/app/api/logtag/download/route.ts
   fetch('http://127.0.0.1:8000/DownloadLogTagData?idLieu=5')
   ```

2. **Agent reçoit requête** → `HttpServer.cs`
   ```csharp
   if (req.HttpMethod == "POST" && req.Url.AbsolutePath.StartsWith("/DownloadLogTagData"))
   ```

3. **Détection dock LogTag** :
   ```csharp
   HINSTANCE hInstance = GetModuleHandle(null);
   LOGTAG_HANDLE hLogTag = LogTag.OpenAccess(hInstance);
   
   if (hLogTag == 0) {
       return "Erreur: Impossible d'accéder au logtag";
   }
   ```

4. **Vérification dock connecté** :
   ```csharp
   UInt16 portCount = 0;
   LogTag.GetPortInfo(null, ref portCount, 4);
   
   if (portCount == 0) {
       return "Aucun docker logtag connecté";
   }
   if (portCount > 1) {
       return "Plusieurs docker connectés";  // Erreur!
   }
   ```

5. **Ouverture communication USB** :
   ```csharp
   LOGTAG_PORTINFO[] tabPortInfo = new LOGTAG_PORTINFO[portCount];
   LogTag.GetPortInfo(tabPortInfo, ref portCount, 4);
   LogTag.OpenIO(hLogTag, tabPortInfo);  // Connexion au dock
   ```

6. **Lecture info capteur** :
   ```csharp
   LOGTAG_INFO[] ltinfo = new LOGTAG_INFO[1];
   LOGTAG_SENSOR[] ltsensor = new LOGTAG_SENSOR[1];
   LogTag.GetInfo2(hLogTag, ltinfo, ltsensor);
   
   // Extraction numéro de série
   string serialNumber = "";
   for (int i = 0; i < ltinfo[0].szChannelInfo.Length; i += 2) {
       serialNumber += (char)ltinfo[0].szChannelInfo[i];
   }
   // Résultat: "TL52-1-3543218"
   ```

7. **Téléchargement mesures** :
   ```csharp
   LOGTAG_READING[] ltreading = new LOGTAG_READING[ltinfo[0].dwNumOfReadings];
   ltinfo[0].dwReadingsCount = ltinfo[0].dwNumOfReadings;  // Ex: 500
   LogTag.GetData2(hLogTag, ltinfo, ltsensor, ltreading);
   
   // ltreading[0] = { time: 1732713600, temp: 22.5 }
   // ltreading[1] = { time: 1732713660, temp: 22.3 }
   // ...
   // ltreading[499] = { time: 1732743600, temp: 21.8 }
   ```

8. **Génération ID récupération** :
   ```csharp
   string id_recuperationMesure = DateTime.Now.ToString("yyyyMMddHHmmss");
   // Ex: "20251127143025"
   ```

9. **Insertion en masse BDD** :
   ```csharp
   for (int i = 0; i < ltreading.Length; i++) {
       DateTime dateTime = UnixTimeToDateTime(ltreading[i].dwTime);
       double temperature = ltreading[i].fValue;
       
       db.AddMesure(
           serialNumber,           // "TL52-1-3543218"
           temperature,            // 22.5
           "°C",
           id_recuperationMesure  // "20251127143025"
       );
   }
   ```

10. **Réponse JSON au site** :
    ```json
    {
      "res": "true",
      "details": "Données téléchargées avec succès",
      "id_recuperation": "20251127143025",
      "nombre_mesures": 500,
      "serialNumber": "TL52-1-3543218"
    }
    ```

### Scénario 2 : Réception alarme du serveur

**Contexte :** Le service Windows `Vigitemp Serveur` détecte une température trop élevée (28.5°C > 25°C) dans la "Chambre froide n°3" (idLieu=5).

**Déroulement :**

1. **Serveur envoie notification** :
   ```csharp
   // VigitempServeur → Sensor.cs
   HttpClient client = new HttpClient();
   client.PostAsync("http://192.168.1.100:8000/alarm?action=show&idLieu=5", null);
   ```

2. **Agent reçoit requête** → `HttpServer.cs`
   ```csharp
   if (req.Url.AbsolutePath.StartsWith("/alarm"))
   {
       string action = postParams["action"];   // "show"
       int idLieu = int.Parse(postParams["idLieu"]);  // 5
   ```

3. **Vérification action** :
   ```csharp
   if (action == "show") {
       // Ajouter à la liste si pas déjà présent
       if (!idLieuxEnAlarmes.Contains(idLieu)) {
           idLieuxEnAlarmes.Add(idLieu);
       }
   }
   else if (action == "hide") {
       // Retirer de la liste
       idLieuxEnAlarmes.Remove(idLieu);
   }
   ```

4. **Mise à jour visuelle** :
   ```csharp
   // Invoke sur thread UI (Windows Forms)
   frm_alert.Invoke((MethodInvoker)delegate {
       if (idLieuxEnAlarmes.Count > 0) {
           frm_alert.showAlert();  // Affiche pop-up
       } else {
           frm_alert.hideAlert();  // Cache pop-up
       }
   });
   ```

5. **Form_Alert s'affiche** :
   - Fenêtre toujours au premier plan
   - Fond rouge avec icône alarme
   - Liste des lieux en alarme
   - Bouton "Voir sur le site" → Ouvre navigateur

---

## Architecture

### Structure du projet

```
Vigitemp agent/
├── Vigitemp Agent.sln                # Solution Visual Studio
├── packages/                         # Dépendances NuGet
├── getServerIP/                      # Projet utilitaire
└── Vigitemp agent/
    ├── HttpServer.cs                 ⭐ Serveur HTTP + Main()
    ├── Database.cs                   📊 Accès base de données
    ├── LogTagNet2.9.cs               🔌 SDK LogTag (ancien)
    ├── LogTagNET2.9V2.cs             🔌 SDK LogTag (v2)
    ├── Form_Alert.cs                 🔔 Interface alertes
    ├── MyCustomApplicationContext.cs 🖥️ Gestion app tray
    ├── Installer.cs                  📦 Logique installation
    ├── App.config                    ⚙️ Configuration
    ├── LogTagIO29.dll                ⚠️ DLL propriétaire LogTag
    ├── bin/Debug|Release/            🔧 Binaires
    └── Properties/                   📁 Ressources
```

### Diagramme de flux

```
┌────────────────────────┐
│ Windows Startup        │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Main()                 │
│ MyCustomApplicationContext
└───────────┬────────────┘
            │
            ├─────────────────┐
            │                 │
            ▼                 ▼
┌───────────────────┐  ┌──────────────┐
│ HttpServer        │  │ Form_Alert   │
│ (Port 8000)       │  │ (Hidden)     │
│                   │  │              │
│ Listeners:        │  │ Show/Hide    │
│ - 127.0.0.1:8000  │  │ Based on     │
│ - [IP]:8000       │  │ Alarms       │
└───────────┬───────┘  └──────┬───────┘
            │                 │
            │ HTTP Requests   │
            │ from Website    │
            ▼                 │
┌───────────────────────────────┐
│ LogTag SDK                    │
│ (LogTagNET2.9V2.cs)           │
│ - GetData2()                  │
│ - GetInfo2()                  │
│ - SetInfo2()                  │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ Dock USB LogTag               │
│ + Capteur LogTag              │
└───────────┬───────────────────┘
            │
            ▼
┌───────────────────────────────┐
│ MySQL Database                │
│ - vigitemp                    │
│ - vigitemp_mesure             │
└───────────────────────────────┘
```

---

## Dépendances

### Packages NuGet

```xml
<packages>
  <!-- Base de données -->
  <package id="MySql.Data" version="9.0.0" />
  
  <!-- Sérialisation JSON -->
  <package id="Newtonsoft.Json" version="13.0.3" />
  
  <!-- Cryptographie (MySQL) -->
  <package id="BouncyCastle.Cryptography" version="2.3.1" />
  
  <!-- Compression (MySQL) -->
  <package id="K4os.Compression.LZ4" version="1.3.8" />
  <package id="K4os.Compression.LZ4.Streams" version="1.3.8" />
  <package id="K4os.Hash.xxHash" version="1.0.8" />
  <package id="ZstdSharp.Port" version="0.8.0" />
  
  <!-- Protobuf (MySQL) -->
  <package id="Google.Protobuf" version="3.26.1" />
  
  <!-- Utilitaires -->
  <package id="System.Configuration.ConfigurationManager" version="8.0.0" />
  <package id="System.Diagnostics.DiagnosticSource" version="8.0.1" />
</packages>
```

### Dépendances natives

- **LogTagIO29.dll** : Bibliothèque propriétaire LogTag (non NuGet)
- **System.Windows.Forms** : Interface utilisateur Windows
- **System.Net.Http** : Serveur HTTP

---

## API HTTP exposée (Port 8000)

### Configuration serveur

```csharp
// HttpServer.cs
public static string url = "http://" + GetLocalIPAddress() + ":8000/";
public static string url_localhost = "http://127.0.0.1:8000/";

public static HttpListener listener;
```

Le serveur écoute sur **2 URLs** :
- `http://127.0.0.1:8000/` (localhost)
- `http://[IP_LOCALE]:8000/` (réseau local)

---

## Endpoints disponibles

### 1. GET /DownloadLogTagData

**Fonction :** Télécharge toutes les mesures stockées dans un capteur LogTag.

**Processus complet :**

1. **Détecte le dock LogTag USB**
   ```csharp
   IntPtr[] hLogTag = new IntPtr[MAX_LOGTAG_DEVICES];
   int numDevices = LogTag.GetDevices(hLogTag);
   
   if (numDevices == 0)
       return "Aucun docker logtag connecté";
   if (numDevices > 1)
       return "Plusieurs docker connectés";
   ```

2. **Vérifie la présence d'un capteur**
   ```csharp
   if (!LogTag.IsLogTagInserted(hLogTag[0]))
       return "Pas de capteur logtag dans le dock";
   ```

3. **Lit les informations du capteur**
   ```csharp
   LOGTAG_INFO[] ltinfo = new LOGTAG_INFO[1];
   LOGTAG_SENSOR[] ltsensor = new LOGTAG_SENSOR[MAX_SENSOR_COUNT];
   LogTag.GetInfo2(hLogTag[0], ltinfo, ltsensor);
   ```

4. **Extrait le numéro de série**
   ```csharp
   string serialNumber = "";
   for (int i = 0; i < ltinfo[0].szChannelInfo.Length; i += 2)
   {
       if (ltinfo[0].szChannelInfo[i] == 0) break;
       serialNumber += (char)ltinfo[0].szChannelInfo[i];
   }
   ```

5. **Télécharge toutes les mesures**
   ```csharp
   LOGTAG_READING[] ltreading = new LOGTAG_READING[ltinfo[0].dwNumOfReadings];
   ltinfo[0].dwReadingsCount = ltinfo[0].dwNumOfReadings;
   LogTag.GetData2(hLogTag[0], ltinfo, ltsensor, ltreading);
   ```

6. **Génère un ID de récupération unique**
   ```csharp
   string id_recuperationMesure = DateTime.Now.ToString("yyyyMMddHHmmss");
   // Exemple: "20251127143025"
   ```

7. **Sauvegarde en base de données**
   ```csharp
   Database database = new Database();
   database.InitConnexion();
   
   for (int i = 0; i < ltreading.Length; i++)
   {
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
           ltreading[i].dReading[0],  // Température
           dt_mesure
       );
   }
   ```

**Réponse succès :**
```json
{
  "res": "true",
  "details": "Valeur correctements recupérées",
  "id_recuperationMesure": "20251127143025"
}
```

**Réponses erreur :**
```json
// Aucun dock branché
{
  "res": "false",
  "details": "Aucun docker logtag connecté"
}

// Plusieurs docks branchés
{
  "res": "false",
  "details": "Plusieurs docker connectés"
}

// Pas de capteur dans le dock
{
  "res": "false",
  "details": "Pas de capteur logtag dans le dock"
}

// Erreur lecture capteur
{
  "res": "false",
  "details": "Impossible d'accéder au logtag"
}
```

**Usage depuis le website :**
```tsx
// website/components/vigilog-settings.tsx
const response = await axios.get('http://localhost:8000/DownloadLogTagData')

if (response.data.res === "true") {
  const idRecup = response.data.id_recuperationMesure
  
  // Récupérer les mesures depuis API Next.js
  const mesuresResponse = await axios.get(`/api/mesures/vigilog/${idRecup}`)
  setMesures(mesuresResponse.data)
  
  toast.success("Données téléchargées avec succès")
} else {
  toast.error(response.data.details)
}
```

---

### 2. GET /downloadLogTagConfiguration

**Fonction :** Lit la configuration actuelle d'un capteur LogTag (seuils de température).

**Processus :**

1. **Lecture configuration**
   ```csharp
   LOGTAG_INFO[] ltinfo = new LOGTAG_INFO[1];
   LOGTAG_SENSOR[] ltsensor = new LOGTAG_SENSOR[MAX_SENSOR_COUNT];
   LogTag.GetInfo2(hLogTag, ltinfo, ltsensor);
   ```

2. **Extraction seuils**
   ```csharp
   // Consigne haute active ?
   bool consigneHauteActive = (ltinfo[0].baAlertControlByte[0] == 129);
   
   // Consigne basse active ?
   bool consigneBasseActive = (ltinfo[0].baAlertControlByte[1] == 128);
   
   // Valeurs des seuils
   float consigneHauteValeur = ltinfo[0].fAlertThreshVal[0];
   float consigneBasseValeur = ltinfo[0].fAlertThreshVal[1];
   ```

**Réponse succès :**
```json
{
  "res": "true",
  "details": "Valeur correctements recupérées",
  "res_consigneHauteActive": true,
  "res_consigneBasseActive": true,
  "res_consigneHauteValeur": 8.0,
  "res_consigneBasseValeur": 2.0
}
```

**Usage depuis le website :**
```tsx
const response = await axios.get('http://localhost:8000/downloadLogTagConfiguration')

if (response.data.res === "true") {
  setConsigneHaute(response.data.res_consigneHauteActive)
  setValeurHaute(response.data.res_consigneHauteValeur)
  setConsigneBasse(response.data.res_consigneBasseActive)
  setValeurBasse(response.data.res_consigneBasseValeur)
  
  toast.success("Configuration téléchargée")
}
```

---

### 3. POST /uploadLogTagConfiguration

**Fonction :** Configure les seuils d'alerte d'un capteur LogTag.

**Paramètres (query string) :**
```
?consigneHaute=1
&consigneBasse=1
&valeurConsigneHaute=8
&valeurConsigneBasse=2
```

- `consigneHaute` : `0` (désactivé) ou `1` (activé)
- `consigneBasse` : `0` (désactivé) ou `1` (activé)
- `valeurConsigneHaute` : Température seuil haute (°C)
- `valeurConsigneBasse` : Température seuil basse (°C)

**Processus :**

1. **Parsing des paramètres**
   ```csharp
   bool params_consigneHaute = Convert.ToBoolean(postParams["consigneHaute"]);
   bool params_consigneBasse = Convert.ToBoolean(postParams["consigneBasse"]);
   int params_valeurConsigneHaute = Convert.ToInt32(postParams["valeurConsigneHaute"]);
   int params_valeurConsigneBasse = Convert.ToInt32(postParams["valeurConsigneBasse"]);
   ```

2. **Configuration du capteur**
   ```csharp
   // Délai d'alerte consécutive (1 mesure)
   ltsensor[i].wConsecutiveAlertDelay = (1 / 1) - 1;
   
   // Seuil bas
   if (params_consigneBasse) {
       ltsensor[i].dLowerAlert = params_valeurConsigneBasse;
   }
   
   // Seuil haut
   if (params_consigneHaute) {
       ltsensor[i].dUpperAlert = params_valeurConsigneHaute;
   }
   
   // Intervalle de log (1 minute)
   ltinfo[0].dwLogInterval = 1 * 60 * 1000;
   ```

3. **Écriture sur le capteur**
   ```csharp
   LogTag.SetInfo2(hLogTag, ltinfo, ltsensor);
   ```

**Réponse succès :**
```json
{
  "res": "true",
  "details": "Parametrages correctement appliqués"
}
```

**Usage depuis le website :**
```tsx
await axios.post('http://localhost:8000/uploadLogTagConfiguration', null, {
  params: {
    consigneHaute: consigneHaute ? 1 : 0,
    consigneBasse: consigneBasse ? 1 : 0,
    valeurConsigneHaute: valeurHaute,
    valeurConsigneBasse: valeurBasse
  }
})

toast.success("Configuration appliquée au capteur")
```

---

### 4. POST /alarm

**Fonction :** Affiche ou masque une alerte visuelle Windows pour un lieu spécifique.

**Paramètres (query string) :**
```
?action=show&idLieu=123
// OU
?action=hide&idLieu=123
```

- `action` : `"show"` (afficher) ou `"hide"` (masquer)
- `idLieu` : Identifiant du lieu en alarme

**Processus :**

1. **Action "show" (afficher alarme)**
   ```csharp
   if (postParams["action"] == "show")
   {
       // Ajouter à la liste des alarmes actives
       if (!idLieuxEnAlarmes.Contains(Int32.Parse(postParams["idLieu"])))
       {
           idLieuxEnAlarmes.Add(Int32.Parse(postParams["idLieu"]));
       }
       
       // Afficher pop-up (thread-safe avec Invoke)
       frm_alert.Invoke((Action)(() => frm_alert.DisplayAlarm()));
   }
   ```

2. **Action "hide" (masquer alarme)**
   ```csharp
   if (postParams["action"] == "hide")
   {
       // Retirer de la liste
       idLieuxEnAlarmes.Remove(Int32.Parse(postParams["idLieu"]));
       
       // Si plus aucune alarme, masquer la pop-up
       if (idLieuxEnAlarmes.Count == 0)
       {
           frm_alert.Invoke((Action)(() => frm_alert.HideAlarm()));
       }
   }
   ```

**Gestion multi-alarmes :**
- La liste `idLieuxEnAlarmes` maintient tous les lieux en alerte
- La pop-up reste visible tant qu'au moins 1 alarme est active
- Masquage automatique quand la dernière alarme est résolue

**Réponse :**
```json
{
  "res": "true"
}
```

**Usage depuis le Backend C# :**
```csharp
// Vigitemp Server déclenche l'alarme
using (HttpClient client = new HttpClient())
{
    var parameters = new Dictionary<string, string>
    {
        { "action", "show" },
        { "idLieu", "123" }
    };
    
    var content = new FormUrlEncodedContent(parameters);
    var response = await client.PostAsync(
        "http://192.168.1.100:8000/alarm", 
        content
    );
}
```

---

## Base de données (Database.cs)

### Connexions MySQL

```csharp
public class Database
{
    private static readonly string IP_ADDRESS = "192.168.63.121";
    private static readonly string PORT = "3306";
    private static readonly string UID = "root";
    private static readonly string PASSWORD = "pass";
    
    private MySqlConnection connection_vigitemp;        // Base config
    private MySqlConnection connection_vigitemp_mesure; // Base mesures
    
    public void InitConnexion()
    {
        string connectionString = 
            $"SERVER={IP_ADDRESS};Port={PORT};DATABASE=vigitemp;UID={UID};PASSWORD={PASSWORD};";
        
        this.connection_vigitemp = new MySqlConnection(connectionString);
        this.connection_vigitemp.Open();
        
        connectionString = 
            $"SERVER={IP_ADDRESS};Port={PORT};DATABASE=vigitemp_mesure;UID={UID};PASSWORD={PASSWORD};";
        
        this.connection_vigitemp_mesure = new MySqlConnection(connectionString);
        this.connection_vigitemp_mesure.Open();
    }
}
```

### Méthodes principales

#### AddMesure()

Enregistre une mesure Vigilog dans `vigitemp_mesure.ts_mesuresvigiloghugo`.

```csharp
public bool AddMesure(
    string p_numeroSerie,
    string p_id_recuperationMesure,
    double p_valeur_mesure,
    DateTime p_heure_mesure
)
{
    MySqlCommand cmd = connection_vigitemp_mesure.CreateCommand();
    cmd.CommandText = 
        "INSERT INTO ts_mesuresvigiloghugo " +
        "(serialNumber, id_recuperationMesure, valeur_mesure, heure_mesure) " +
        "VALUES " +
        "(@serialNumber, @idrecuperationmesure, @valeurmesure, @heuremesure)";
    
    cmd.Parameters.AddWithValue("@serialNumber", p_numeroSerie);
    cmd.Parameters.AddWithValue("@idrecuperationmesure", p_id_recuperationMesure);
    cmd.Parameters.AddWithValue("@valeurmesure", p_valeur_mesure);
    cmd.Parameters.AddWithValue("@heuremesure", p_heure_mesure);
    
    cmd.ExecuteNonQuery();
    CloseConnexion();
    
    return true;
}
```

#### addPCtoDBClientsList()

Enregistre ou met à jour un poste client dans `vigitemp.t_postes_clients`.

```csharp
public string addPCtoDBClientsList(string adresseIP, string nomMachine)
{
    MySqlCommand cmd = connection_vigitemp.CreateCommand();
    cmd.CommandText = 
        "SELECT 1 as res FROM t_postes_clients " +
        "WHERE AdresseIpConnexion = @adresseIP";
    cmd.Parameters.AddWithValue("@adresseIP", adresseIP);
    
    MySqlDataReader dr = cmd.ExecuteReader();
    
    if (dr.HasRows)
    {
        // UPDATE si existe déjà
        dr.Close();
        cmd.CommandText = 
            "UPDATE t_postes_clients " +
            "SET NomMachineConnexion = @nomMachine " +
            "WHERE AdresseIpConnexion = @adresseIP";
        cmd.Parameters.AddWithValue("@nomMachine", nomMachine);
        cmd.ExecuteNonQuery();
    }
    else
    {
        // INSERT si nouveau
        dr.Close();
        cmd.CommandText = 
            "INSERT INTO t_postes_clients (NomMachineConnexion, AdresseIpConnexion) " +
            "VALUES (@nomMachine, @adresseIP)";
        cmd.Parameters.AddWithValue("@nomMachine", nomMachine);
        cmd.ExecuteNonQuery();
    }
    
    CloseConnexion();
    return "OK";
}
```

**Appelé au démarrage de l'Agent :**
```csharp
// Main() dans HttpServer.cs
Database db = new Database();
db.InitConnexion();
db.addPCtoDBClientsList(
    GetLocalIPAddress(), 
    Environment.MachineName
);
```

#### getServerIp()

Récupère l'IP du serveur depuis `vigitemp.t_parametre`.

```csharp
public string getServerIp()
{
    MySqlCommand cmd = connection_vigitemp.CreateCommand();
    cmd.CommandText = 
        "SELECT Valeur FROM t_parametre WHERE MotCle = 'serveur_ip_1'";
    
    MySqlDataReader dr = cmd.ExecuteReader();
    dr.Read();
    string res = dr["Valeur"].ToString();
    dr.Close();
    CloseConnexion();
    
    return res;
}
```

#### getWebsiteURL()

Récupère l'URL du site web depuis `vigitemp.t_parametre`.

```csharp
public string getWebsiteURL()
{
    MySqlCommand cmd = connection_vigitemp.CreateCommand();
    cmd.CommandText = 
        "SELECT Valeur FROM t_parametre WHERE MotCle = 'SITE_WEB_URL'";
    
    MySqlDataReader dr = cmd.ExecuteReader();
    dr.Read();
    string res = dr["Valeur"].ToString();
    dr.Close();
    CloseConnexion();
    
    return res;
}
```

---

## Système d'alertes (Form_Alert.cs)

### Architecture

```csharp
public class Form_Alert : Form
{
    private bool isVisible = false;
    
    public void DisplayAlarm()
    {
        if (!isVisible)
        {
            this.Show();
            this.WindowState = FormWindowState.Normal;
            this.BringToFront();
            isVisible = true;
        }
    }
    
    public void HideAlarm()
    {
        if (isVisible)
        {
            this.Hide();
            isVisible = false;
        }
    }
}
```

### Propriétés du formulaire

- **FormBorderStyle :** `FixedDialog` (non redimensionnable)
- **ShowInTaskbar :** `false` (pas d'icône dans la barre des tâches)
- **TopMost :** `true` (toujours au premier plan)
- **StartPosition :** `CenterScreen` (centré à l'écran)
- **ControlBox :** `true` (bouton fermer)

### Comportement multi-alarmes

```csharp
// HttpServer.cs
public static List<int> idLieuxEnAlarmes = new List<int>();

// Affichage alarme
if (!idLieuxEnAlarmes.Contains(idLieu))
{
    idLieuxEnAlarmes.Add(idLieu);
}
frm_alert.Invoke((Action)(() => frm_alert.DisplayAlarm()));

// Masquage alarme
idLieuxEnAlarmes.Remove(idLieu);
if (idLieuxEnAlarmes.Count == 0)
{
    frm_alert.Invoke((Action)(() => frm_alert.HideAlarm()));
}
```

**Logique :**
- La pop-up affiche "Alarme active" sans détails spécifiques
- Elle reste visible tant qu'au moins 1 lieu est en alarme
- Masquage uniquement quand toutes les alarmes sont résolues

---

## System Tray (MyCustomApplicationContext.cs)

### Implémentation

```csharp
public class MyCustomApplicationContext : ApplicationContext
{
    private NotifyIcon trayIcon;
    private Form_Alert frm_alert;
    
    public MyCustomApplicationContext(string[] args)
    {
        // Créer icône system tray
        trayIcon = new NotifyIcon()
        {
            Icon = Properties.Resources.AppIcon,
            ContextMenu = new ContextMenu(new MenuItem[] {
                new MenuItem("Configuration", OnConfiguration),
                new MenuItem("Quitter", OnExit)
            }),
            Visible = true,
            Text = "Vigitemp Agent"
        };
        
        // Créer formulaire d'alerte (caché par défaut)
        frm_alert = new Form_Alert();
        
        // Démarrer serveur HTTP dans un thread séparé
        Task.Run(() => HttpServer.Main(args));
    }
    
    void OnConfiguration(object sender, EventArgs e)
    {
        // Ouvrir fenêtre de configuration
        MessageBox.Show("Configuration Vigitemp Agent", "Configuration");
    }
    
    void OnExit(object sender, EventArgs e)
    {
        trayIcon.Visible = false;
        Application.Exit();
    }
}
```

### Point d'entrée

```csharp
// Program.cs
static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        Application.EnableVisualStyles();
        Application.SetCompatibleTextRenderingDefault(false);
        Application.Run(new MyCustomApplicationContext(args));
    }
}
```

---

## Configuration (App.config)

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <appSettings>
    <add key="ServerIP" value="192.168.63.121"/>
    <add key="ServerPort" value="3306"/>
    <add key="DatabaseUser" value="root"/>
    <add key="DatabasePassword" value="pass"/>
    <add key="HttpPort" value="8000"/>
    <add key="LogTagTimeout" value="30000"/> <!-- ms -->
  </appSettings>
  
  <startup>
    <supportedRuntime version="v4.0" sku=".NETFramework,Version=v4.8"/>
  </startup>
</configuration>
```

---

## Installation et déploiement

### Projet VigitempAgentInstaller.vdproj

**Type :** Installateur MSI (Visual Studio Installer Project)

**Contenu :**
- `VigitempAgent.exe`
- `LogTagIO29.dll`
- Toutes les dépendances NuGet
- Raccourci dans le dossier Démarrage Windows
- Icône application

**Prérequis système :**
- Windows 7 ou supérieur (x86/x64)
- .NET Framework 4.8
- Drivers USB LogTag

**Installation utilisateur :**
```cmd
# Double-clic sur VigitempAgentInstaller.msi
# OU ligne de commande :
msiexec /i VigitempAgentInstaller.msi /qn
```

**Installation silencieuse (déploiement masse) :**
```cmd
msiexec /i VigitempAgentInstaller.msi /quiet /norestart
```

**Désinstallation :**
```cmd
# Panneau de configuration > Programmes et fonctionnalités
# OU ligne de commande :
msiexec /x VigitempAgentInstaller.msi /qn
```

**Localisation par défaut :**
```
C:\Program Files (x86)\Vigitemp\VigitempAgent\
├── VigitempAgent.exe
├── LogTagIO29.dll
├── MySql.Data.dll
├── Newtonsoft.Json.dll
└── ... (autres DLLs)
```

**Démarrage automatique :**
Le raccourci est ajouté dans :
```
C:\ProgramData\Microsoft\Windows\Start Menu\Programs\Startup\VigitempAgent.lnk
```

---

## Tests et debug

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

**Fichier :** `output.txt` (dans le dossier `bin`)

```csharp
// HttpServer.cs
Console.WriteLine("Request #: {0}", ++requestCount);
Console.WriteLine(req.Url.ToString());
Console.WriteLine(req.HttpMethod);
```

### Test des endpoints

```bash
# Depuis PowerShell ou curl

# Télécharger configuration LogTag
Invoke-WebRequest -Uri "http://localhost:8000/downloadLogTagConfiguration"

# Télécharger données LogTag
Invoke-WebRequest -Uri "http://localhost:8000/DownloadLogTagData"

# Afficher alarme
Invoke-WebRequest -Uri "http://localhost:8000/alarm?action=show&idLieu=123" -Method POST

# Masquer alarme
Invoke-WebRequest -Uri "http://localhost:8000/alarm?action=hide&idLieu=123" -Method POST
```

---

## Limitations et problèmes connus

### Sécurité

⚠️ **Problèmes actuels :**
- Credentials hardcodés dans `Database.cs`
- Serveur HTTP sans authentification
- CORS wildcard (`Access-Control-Allow-Origin: *`)
- Requêtes SQL non paramétrées dans certaines méthodes

✅ **Recommandations :**
```csharp
// Utiliser App.config
string dbPassword = ConfigurationManager.AppSettings["DatabasePassword"];

// Requêtes paramétrées TOUJOURS
cmd.CommandText = "SELECT * FROM lieux WHERE id = @id";
cmd.Parameters.AddWithValue("@id", idLieu);

// Authentification HTTP (API Key ou Token)
if (req.Headers["Authorization"] != "Bearer SECRET_TOKEN")
{
    resp.StatusCode = 401;
    return;
}
```

### Performance

⚠️ **Limites actuelles :**
- **1 seul dock LogTag à la fois** (limitation matérielle)
- Connexion DB ouverte/fermée à chaque requête
- Pas de retry automatique si échec LogTag

✅ **Optimisations possibles :**
```csharp
// Connection pooling (déjà en place dans MySqlConnection)

// Retry pattern
int retries = 3;
for (int i = 0; i < retries; i++)
{
    try
    {
        result = LogTag.GetData2(hLogTag, ltinfo, ltsensor, ltreading);
        if (result == SUCCESS) break;
    }
    catch { }
    Thread.Sleep(1000);
}
```

### Robustesse

⚠️ **Points d'amélioration :**
- Pas de gestion timeout sur requêtes HTTP longues
- Exceptions non loggées (seulement `Console.WriteLine`)
- Pas de monitoring de l'état du service

✅ **Recommandations :**
```csharp
// Logging professionnel
using NLog;
private static readonly Logger Logger = LogManager.GetCurrentClassLogger();

try
{
    // code
}
catch (Exception ex)
{
    Logger.Error(ex, "Erreur lors de...");
}
```

---

## Dépannage

### Le serveur HTTP ne démarre pas

**Symptômes :**
- Erreur "HttpListener already in use"
- Port 8000 déjà utilisé

**Solutions :**
```cmd
# Vérifier processus utilisant port 8000
netstat -ano | findstr :8000

# Tuer le processus
taskkill /PID <PID> /F

# Ou changer le port dans App.config
<add key="HttpPort" value="8001"/>
```

### Aucun dock LogTag détecté

**Symptômes :**
- Réponse "Aucun docker logtag connecté"

**Solutions :**
1. Vérifier dock branché USB
2. Vérifier drivers LogTag installés :
   ```cmd
   # Gestionnaire de périphériques
   devmgmt.msc
   # Chercher "LogTag" dans Ports (COM & LPT)
   ```
3. Tester avec logiciel officiel LogTag

### Pop-up alerte ne s'affiche pas

**Diagnostic :**
```csharp
// Ajouter logs dans Form_Alert.cs
public void DisplayAlarm()
{
    Console.WriteLine($"DisplayAlarm called, isVisible={isVisible}");
    // ...
}
```

**Solutions :**
1. Vérifier liste `idLieuxEnAlarmes` pas vide
2. Vérifier Thread UI répond (pas de deadlock)
3. Vérifier formulaire pas masqué par autre fenêtre

---

## Tests (à implémenter)

### Tests unitaires

```csharp
using NUnit.Framework;

[TestFixture]
public class DatabaseTests
{
    [Test]
    public void TestAddMesure()
    {
        Database db = new Database();
        db.InitConnexion();
        
        bool result = db.AddMesure(
            "LT1234",
            "20251127143025",
            20.5,
            DateTime.Now
        );
        
        Assert.IsTrue(result);
    }
}
```

### Tests d'intégration

```csharp
[TestFixture]
public class LogTagIntegrationTests
{
    [Test]
    public void TestDownloadLogTagData()
    {
        // Nécessite dock LogTag branché
        var response = HttpServer.DownloadLogTagData();
        
        Assert.That(response, Does.Contain("res"));
        var json = JsonConvert.DeserializeObject<dynamic>(response);
        
        if (json.res == "true")
        {
            Assert.IsNotNull(json.id_recuperationMesure);
        }
    }
}
```

---

## Roadmap

### Court terme
- [ ] Extraire credentials dans App.config
- [ ] Authentification HTTP (API Key)
- [ ] Tests unitaires NUnit
- [ ] Logging structuré (NLog)

### Moyen terme
- [ ] Support multi-docks USB (si possible)
- [ ] Interface configuration graphique
- [ ] Auto-update depuis serveur
- [ ] Dashboard monitoring

### Long terme
- [ ] Migration .NET Framework 4.8 → .NET 8
- [ ] Architecture moderne (DI, MVVM)
- [ ] Support Linux/macOS (si SDK LogTag disponible)
- [ ] Container Docker

---

**Documentation mise à jour le 27 novembre 2025**
