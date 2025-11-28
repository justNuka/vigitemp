# Backend - Vigitemp Serveur (C#)

## Vue d'ensemble

**Vigitemp Serveur** est un **service Windows** (tourne en arrière-plan 24/7) qui interroge automatiquement des capteurs de température branchés en série (ports COM) et déclenche des alertes si les seuils sont dépassés.

### Caractéristiques principales

- **Type :** Service Windows (Windows Service)
- **Framework :** .NET Framework 4.8
- **Plateforme :** Windows Server / Windows 10+
- **Architecture :** Multi-thread (1 thread par serveur de capteurs)
- **Base de données :** MySQL
  - `vigitemp` : Configuration (lieux, capteurs, seuils)
  - `vigitemp_mesure` : Historique mesures
- **Point d'entrée :** `VigitempServeur.cs` → `OnStart()`

---

## Rôle et responsabilités

### 1. Collecte automatique de mesures
**Interrogation périodique des capteurs physiques**

**Fonctionnement :**
- Le service interroge chaque capteur selon sa fréquence configurée (30s, 60s, 300s, etc.)
- Chaque capteur est sur un port série (COM1, COM2, COM3...)
- Support de **7 types de capteurs** différents :
  - `IN` (Temperature standard)
  - `IE` (Temperature externe)
  - `IP` (Temperature + pression)
  - `IC` (Temperature + courant)
  - `IH` (Humidité)
  - `EN` (Energie)
  - `HN` (Humidité + energie)

**Exemple de communication série :**
```csharp
// Envoi d'une commande au capteur IH (humidité)
port.Write("SM" + adresse + "0000000000000000");
// Ex: "SM05430000000000000" pour le capteur à l'adresse 0543

// Le capteur répond avec: R0543R[poidsFort][poidsFaible]'
// Décodage: resistance = (poidsFort * 256 + poidsFaible - 2048)
// Conversion: humidité = (resistance * coeffX + coeffConstant)
```

### 2. Gestion des alertes en temps réel
**Détection et notification des dépassements de seuils**

**Processus complet :**

1. **Lecture de la mesure** (ex: 28.5°C)
2. **Comparaison avec les seuils** (ex: min=18°C, max=25°C)
3. **Dépassement détecté** → 28.5 > 25
4. **Vérification statut alarme** :
   - Si notification active → Afficher pop-up
   - Si alarme snooze → Attendre fin snooze
5. **Notification Agent** :
   ```csharp
   client.PostAsync("http://192.168.1.100:8000/alarm?action=show&idLieu=5", null);
   ```
6. **Enregistrement BDD** :
   ```sql
   INSERT INTO vigitemp.alarmes (idLieu, dateDebut, valeur, type)
   VALUES (5, '2025-11-27 14:30:00', 28.5, 'HAUTE');
   ```

### 3. Service Windows robuste
**Fonctionnement continu et fiable**

- **Démarrage automatique** : Se lance au boot Windows
- **Multi-threading** : Un thread par groupe de capteurs (par IdServeur)
- **Gestion d'erreurs** : Retry automatique si port COM occupé
- **Logging** :
  - Event Viewer Windows (`Application` → `New Vigitemp Serveur`)
  - Fichier texte `C:\Users\User\Desktop\log.txt`
- **Arrêt propre** : Fermeture de tous les ports COM avant arrêt

---

## Flux de données complet (Exemple concret)

### Scénario : Capteur IH (Humidité) - Lieu "Chambre froide n°3"

**Configuration dans la base :**
```sql
-- Table: vigitemp.lieux
idLieu: 5
NomLieu: "Chambre froide n°3"
idServeur: 1
frequence: 60  -- Interrogation toutes les 60 secondes
PortSerie: "COM3"
SondeNumeroSerie: "IH054321"
SondeAdresse: "0543"
Consigne_Inf: 2.0°C
Consigne_Sup: 8.0°C
```

**Déroulement automatique (toutes les 60 secondes) :**

1. **Timer déclenche** → `ThreadServeur.Process()` appelé
2. **Ouverture port série** :
   ```csharp
   SerialPort port = new SerialPort("COM3", 9600);
   port.Open();
   ```

3. **Envoi commande** au capteur :
   ```csharp
   port.Write("SM05430000000000000");
   //        └─┬─┘└─┬┘
   //          │   └─ Adresse capteur (0543)
   //          └─── Commande "SM" (Send Measure)
   ```

4. **Réception réponse** du capteur (via port série) :
   ```
   R0543R[12][245]'
   //└─┬┘ └─┬┘ └──┬─┘
   //  │    │     └─ Poids faible (245)
   //  │    └─────── Poids fort (12)
   //  └────────────┬─ Confirmation numéro série
   ```

5. **Décodage mesure** :
   ```csharp
   int resistance = (12 * 256 + 245 - 2048);  // = 1317
   
   // Récupération coefficients calibrage depuis BDD
   (double coeffX, double coeffConstant) = db.getCoeffCalibrageBySerialNumber("IH054321");
   // Exemple: coeffX = 0.05, coeffConstant = -10
   
   double humidite = (1317 * 0.05 + (-10));  // = 55.85%
   ```

6. **Sauvegarde dans BDD** :
   ```sql
   INSERT INTO vigitemp_mesure.mesure_IH054321 
   (DateHeureMesure, Valeur, Resistance, Unite) 
   VALUES ('2025-11-27 14:30:00', 55.85, '1317', '%HR');
   ```

7. **Vérification seuils** → Pas de dépassement (2% < 55.85% < 8% ❌ - erreur config!)
   
8. **Fermeture port** :
   ```csharp
   port.Close();
   ```

### Cas d'alarme (température trop élevée)

**Capteur :** `IN123456` (température)  
**Mesure :** 28.5°C  
**Seuils :** min=18°C, max=25°C  

**Déclenchement alarme :**

1. **Détection dépassement** :
   ```csharp
   if (28.5 > 25.0) {  // VRAI
       // Alarme déclenchée!
   }
   ```

2. **Enregistrement alarme** :
   ```sql
   INSERT INTO vigitemp.alarmes 
   (idLieu, dateDebut, valeur, type) 
   VALUES (5, '2025-11-27 14:30:00', 28.5, 'HAUTE');
   ```

3. **Notification Agent C#** :
   ```csharp
   HttpClient client = new HttpClient();
   client.PostAsync("http://192.168.1.100:8000/alarm?action=show&idLieu=5", null);
   //                └──────────────┬────────────┘
   //                               └─ IP du PC avec Agent Windows
   ```

4. **Agent affiche pop-up** sur le PC Windows avec l'icône rouge

5. **Site web** affiche l'alerte en temps réel (via API Next.js)

---

## Architecture

### Structure du projet

```
Vigitemp Serveur/
├── Vigitemp Serveur.sln               # Solution Visual Studio
├── packages/                          # Dépendances NuGet
└── Vigitemp Serveur/
    ├── VigitempServeur.cs             ⭐ Service Windows principal
    ├── ThreadServeur.cs               🔄 Thread collecte par serveur
    ├── Database.cs                    📊 Accès base de données
    ├── Sensor.cs                      🌡️ Interface générique capteur
    ├── sensors/                       📁 Implémentations capteurs
    │   ├── SensorIH.cs
    │   ├── SensorIC.cs
    │   ├── SensorIP.cs
    │   ├── SensorIN.cs
    │   ├── SensorIE.cs
    │   ├── SensorHN.cs
    │   └── SensorEN.cs
    ├── App.config                     ⚙️ Configuration
    ├── bin/Debug|Release/             🔧 Binaires compilés
    └── obj/                           📦 Objets temporaires
```

### Diagramme de flux

```
┌───────────────────┐
│ Windows Boot      │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ OnStart()         │
│ VigitempServeur   │
└────────┬──────────┘
         │
         ├──────────────────────┐
         │                      │
         ▼                      ▼
┌─────────────────┐    ┌──────────────────┐
│ Process()       │    │ ThreadServeur    │
│ Timer 60s       │    │ par IdServeur    │
└────────┬────────┘    └────────┬─────────┘
         │                      │
         │ Vérifier             │ Timer par fréquence
         │ nouveaux             │ (30s, 60s, 300s, etc.)
         │ serveurs             │
         │                      ▼
         │             ┌────────────────────┐
         │             │ Process()          │
         │             │ - Query sensor     │
         │             │ - Check thresholds │
         │             │ - Save to DB       │
         │             │ - Trigger alerts   │
         │             └──────────┬─────────┘
         │                        │
         │                        ▼
         │             ┌────────────────────┐
         │             │ Sensors/*.cs       │
         │             │ Read COM ports     │
         │             └──────────┬─────────┘
         │                        │
         ▼                        ▼
┌────────────────────────────────────┐
│ MySQL Database                     │
│ - vigitemp (config)                │
│ - vigitemp_mesure (data)           │
└────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│ HTTP POST /alarm                   │
│ → Agent C# (port 8000)             │
│ → Pop-up Windows                   │
└────────────────────────────────────┘
```

---

## Dépendances NuGet

```xml
<packages>
  <!-- Base de données -->
  <package id="MySql.Data" version="9.0.0" />
  
  <!-- Communication série -->
  <package id="System.IO.Ports" version="8.0.0" />
  
  <!-- Service Windows -->
  <package id="System.ServiceProcess.ServiceController" version="8.0.0" />
  
  <!-- Cryptographie (MySQL) -->
  <package id="BouncyCastle.Cryptography" version="2.3.1" />
  
  <!-- Compression (MySQL) -->
  <package id="K4os.Compression.LZ4" version="1.3.8" />
  <package id="K4os.Compression.LZ4.Streams" version="1.3.8" />
  <package id="ZstdSharp.Port" version="0.8.0" />
  
  <!-- Protobuf (MySQL) -->
  <package id="Google.Protobuf" version="3.26.1" />
  
  <!-- JSON -->
  <package id="Newtonsoft.Json" version="13.0.3" />
</packages>
```

---

## Service Windows (VigitempServeur.cs)

### Classe principale

```csharp
public partial class VigitempServeur : ServiceBase
{
    public static EventLog eventLog1;
    private System.Timers.Timer _timer;
    private List<Thread> m_threads = new List<Thread>();
    private List<CancellationTokenSource> m_cancellationsTokens = new List<CancellationTokenSource>();
    private List<int> m_idServeurs = new List<int>();
    
    public VigitempServeur()
    {
        InitializeComponent();
        eventLog1 = new EventLog();
        
        if (!EventLog.SourceExists("Vigitemp"))
        {
            EventLog.CreateEventSource("Vigitemp", "New Vigitemp Serveur");
        }
        eventLog1.Source = "Vigitemp";
        eventLog1.Log = "New Vigitemp Serveur";
    }
}
```

### Méthode OnStart()

Appelée au démarrage du service Windows.

```csharp
protected override void OnStart(string[] args)
{
    VigitempServeur.Log("Demarrage du service Vigitemp");
    
    Database db = new Database();
    Thread.Sleep(2000);
    
    // Récupérer les serveurs distincts depuis DB
    List<int> arr_serveurs = db.getDistinctIdServeur();
    
    // Créer un thread par serveur
    foreach (int IdServeur in arr_serveurs)
    {
        CancellationTokenSource cts = new CancellationTokenSource();
        ThreadServeur threadServeur = new ThreadServeur(cts.Token, IdServeur);
        Thread thread = new Thread(new ThreadStart(threadServeur.Start));
        thread.IsBackground = true;
        thread.Start();
        
        m_threads.Add(thread);
        m_cancellationsTokens.Add(cts);
        m_idServeurs.Add(IdServeur);
    }
    
    // Timer de surveillance (60 secondes)
    _timer = new System.Timers.Timer(60000);
    _timer.Elapsed += Process;
    _timer.Start();
}
```

**Processus :**
1. Logging du démarrage
2. Connexion base de données
3. Récupération liste `IdServeur` distincts
4. Création d'un `ThreadServeur` par serveur
5. Démarrage timer 60s pour surveiller nouveaux serveurs

### Méthode Process()

Appelée toutes les **60 secondes** par le timer.

```csharp
protected void Process(object sender, ElapsedEventArgs eventArgs)
{
    Database db = new Database();
    List<int> arr_serveurs = db.getDistinctIdServeur();
    List<int> tmp_idServeurs = m_idServeurs.ToList();
    
    // Ajouter nouveaux serveurs créés depuis le lancement
    foreach (int IdServeur in arr_serveurs)
    {
        if (!tmp_idServeurs.Contains(IdServeur))
        {
            CancellationTokenSource cts = new CancellationTokenSource();
            ThreadServeur threadServeur = new ThreadServeur(cts.Token, IdServeur);
            Thread thread = new Thread(new ThreadStart(threadServeur.Start));
            thread.IsBackground = true;
            thread.Start();
            
            m_threads.Add(thread);
            m_cancellationsTokens.Add(cts);
            tmp_idServeurs.Add(IdServeur);
        }
    }
    
    // Supprimer serveurs qui ne sont plus utilisés
    foreach (int IdServeur in m_idServeurs)
    {
        if (!arr_serveurs.Contains(IdServeur))
        {
            int indexOfIdServeur = tmp_idServeurs.IndexOf(IdServeur);
            m_cancellationsTokens[indexOfIdServeur].Cancel();
            m_threads.RemoveAt(indexOfIdServeur);
            tmp_idServeurs.RemoveAt(indexOfIdServeur);
        }
    }
    
    m_idServeurs = tmp_idServeurs;
}
```

**Responsabilités :**
- Détection nouveaux serveurs ajoutés dans la base
- Démarrage threads pour nouveaux serveurs
- Arrêt threads pour serveurs supprimés
- Mise à jour dynamique sans redémarrage service

### Méthode OnStop()

Appelée à l'arrêt du service Windows.

```csharp
protected override void OnStop()
{
    VigitempServeur.Log("Arrêt du service Vigitemp");
    
    // Annuler tous les tokens
    foreach (CancellationTokenSource cts in m_cancellationsTokens)
    {
        cts.Cancel();
    }
    
    // Arrêter tous les threads
    foreach (Thread thread in m_threads)
    {
        if (thread.IsAlive)
        {
            thread.Abort();
        }
    }
}
```

### Logging centralisé

```csharp
public static void Log(string logMessage)
{
    lock (_lock)
    {
        // Écriture dans Event Viewer Windows
        eventLog1.WriteEntry(logMessage);
        
        // Écriture dans fichier log
        w.Write("\r\nLog Entry : ");
        w.WriteLine($"{DateTime.Now.ToLongTimeString()} {DateTime.Now.ToLongDateString()}");
        w.WriteLine($"  :{logMessage}");
        w.WriteLine("-------------------------------");
        
        // Écriture dans console (debug)
        Console.WriteLine(logMessage);
        Trace.WriteLine(logMessage);
    }
}
```

**Destinations :**
- Event Viewer Windows : `Applications and Services Logs → New Vigitemp Serveur`
- Fichier texte : `C:\Users\User\Desktop\log.txt`
- Console (mode debug uniquement)

---

## Thread de collecte (ThreadServeur.cs)

Chaque `IdServeur` possède son propre thread qui gère plusieurs timers (un par fréquence de collecte).

### Classe ThreadServeur

```csharp
class ThreadServeur
{
    private readonly SemaphoreSlim semaphore = new SemaphoreSlim(1, 1);
    private CancellationToken m_cts;
    private Database m_database;
    private List<System.Timers.Timer> timers = new List<System.Timers.Timer>();
    private List<int> frequencies = new List<int>();
    private List<Status> frequencies_status = new List<Status>();
    private List<SerialPort> list_SerialPort_open = new List<SerialPort>();
    private int _idServer;
    
    private enum Status
    {
        EN_ATTENTE,
        EN_COURS
    }
    
    public ThreadServeur(CancellationToken obj, int p_idServer)
    {
        this.m_cts = obj;
        this._idServer = p_idServer;
    }
}
```

### Méthode Start()

Appelée au lancement du thread.

```csharp
public void Start()
{
    VigitempServeur.Log("Starting Thread#" + _idServer + "...");
    
    // Récupérer les fréquences distinctes pour ce serveur
    List<int> arr_frequencies = GetDatabase().getDistinctFrequenciesByIdServeur(this._idServer);
    
    // Créer un timer par fréquence
    foreach (int frequency in arr_frequencies)
    {
        _timer = new System.Timers.Timer(frequency * 1000);
        _timer.Elapsed += (sender, e) => Process(sender, e, frequency);
        _timer.Start();
        
        this.timers.Add(_timer);
        this.frequencies.Add(frequency);
        this.frequencies_status.Add(Status.EN_ATTENTE);
    }
    
    // Timer 60s pour mise à jour fréquences + réactivation alarmes snooze
    _timer = new System.Timers.Timer(60000);
    _timer.Elapsed += ProcessGetFrequenciesAndReactivateSnoozedAlarm;
    _timer.Start();
    
    VigitempServeur.Log("Thread#" + _idServer + " started!");
}
```

**Processus :**
1. Récupération fréquences pour le serveur (ex: 30s, 60s, 300s)
2. Création d'un timer par fréquence
3. Timer supplémentaire 60s pour mise à jour configuration
4. Logging démarrage

### Méthode Process()

Appelée à chaque tick du timer de fréquence.

```csharp
private async void Process(object sender, ElapsedEventArgs eventArgs, int frequency)
{
    int indxOf = frequencies.IndexOf(frequency);
    
    // Vérifier si pas déjà en cours
    if (this.frequencies_status[indxOf] == Status.EN_ATTENTE)
    {
        this.frequencies_status[indxOf] = Status.EN_COURS;
        await semaphore.WaitAsync();
        
        try
        {
            // Récupérer les sondes pour cette fréquence
            List<Sonde> sondes = GetDatabase().getInfosByIdServeurAndFrequencies(
                this._idServer, 
                frequency
            );
            
            foreach (Sonde sonde in sondes)
            {
                try
                {
                    // Instancier le bon type de capteur
                    sensor = InstantiateSensor(sonde.TypeSonde, sonde);
                    
                    if (sensor != null)
                    {
                        // Interroger le capteur
                        List<Mesure> mesures = sensor.ExecuteCommand();
                        
                        // Sauvegarder les mesures
                        foreach (Mesure mesure in mesures)
                        {
                            GetDatabase().AddMesure(mesure);
                            
                            // Vérifier seuils et déclencher alarmes
                            CheckThresholdsAndTriggerAlarms(mesure, sonde);
                        }
                    }
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log($"Erreur sonde {sonde.Id}: {ex.Message}");
                }
            }
        }
        finally
        {
            semaphore.Release();
            this.frequencies_status[indxOf] = Status.EN_ATTENTE;
        }
    }
}
```

**Processus :**
1. Vérifier statut (éviter double exécution)
2. Acquérir sémaphore (exclusion mutuelle)
3. Récupérer sondes pour cette fréquence
4. Pour chaque sonde :
   - Instancier le bon capteur
   - Interroger capteur via port COM
   - Sauvegarder mesures en base
   - Vérifier dépassement seuils
   - Déclencher alarmes si nécessaire
5. Libérer sémaphore

---

## Types de capteurs supportés

Le système supporte **7 types de capteurs** différents, tous héritant de `Sensor.cs`.

### Interface Sensor.cs

```csharp
public abstract class Sensor
{
    protected SerialPort serialPort;
    protected Sonde sonde;
    
    public Sensor(Sonde p_sonde)
    {
        this.sonde = p_sonde;
        OpenSerialPort();
    }
    
    protected void OpenSerialPort()
    {
        serialPort = new SerialPort(sonde.PortCOM);
        serialPort.BaudRate = sonde.BaudRate;
        serialPort.DataBits = sonde.DataBits;
        serialPort.Parity = sonde.Parity;
        serialPort.StopBits = sonde.StopBits;
        serialPort.Open();
    }
    
    public abstract List<Mesure> ExecuteCommand();
}
```

### Types de capteurs

| Type | Description | Fichier |
|------|-------------|---------|
| **SensorIH** | Capteur Interface Hybride | `sensors/SensorIH.cs` |
| **SensorIC** | Capteur Interface Connectée | `sensors/SensorIC.cs` |
| **SensorIP** | Capteur Interface Protocole | `sensors/SensorIP.cs` |
| **SensorIN** | Capteur Interface Native | `sensors/SensorIN.cs` |
| **SensorIE** | Capteur Interface Externe | `sensors/SensorIE.cs` |
| **SensorHN** | Capteur Hybride Natif | `sensors/SensorHN.cs` |
| **SensorEN** | Capteur Externe Natif | `sensors/SensorEN.cs` |

### Instanciation dynamique

```csharp
private Sensor InstantiateSensor(string typeSonde, Sonde sonde)
{
    switch (typeSonde)
    {
        case "IH":
            return new SensorIH(sonde);
        case "IC":
            return new SensorIC(sonde);
        case "IP":
            return new SensorIP(sonde);
        case "IN":
            return new SensorIN(sonde);
        case "IE":
            return new SensorIE(sonde);
        case "HN":
            return new SensorHN(sonde);
        case "EN":
            return new SensorEN(sonde);
        default:
            VigitempServeur.Log($"Type capteur inconnu: {typeSonde}");
            return null;
    }
}
```

### Exemple : SensorIH.cs

```csharp
public class SensorIH : Sensor
{
    public SensorIH(Sonde p_sonde) : base(p_sonde) { }
    
    public override List<Mesure> ExecuteCommand()
    {
        List<Mesure> mesures = new List<Mesure>();
        
        try
        {
            // Envoyer commande de lecture
            serialPort.Write("READ\r\n");
            Thread.Sleep(100);
            
            // Lire réponse
            string response = serialPort.ReadLine();
            
            // Parser réponse (format: "T:25.3")
            if (response.StartsWith("T:"))
            {
                double temperature = double.Parse(response.Substring(2));
                
                mesures.Add(new Mesure
                {
                    IdSonde = sonde.Id,
                    ValeurMesure = temperature,
                    HeureMesure = DateTime.Now
                });
            }
        }
        catch (Exception ex)
        {
            VigitempServeur.Log($"Erreur lecture SensorIH: {ex.Message}");
        }
        
        return mesures;
    }
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

#### getDistinctIdServeur()

Récupère les identifiants de serveurs distincts depuis `vigitemp.sondes`.

```csharp
public List<int> getDistinctIdServeur()
{
    List<int> arr_serveurs = new List<int>();
    InitConnexion();
    
    MySqlCommand cmd = connection_vigitemp.CreateCommand();
    cmd.CommandText = "SELECT DISTINCT IdServeur FROM sondes WHERE actif = 1";
    
    MySqlDataReader dr = cmd.ExecuteReader();
    while (dr.Read())
    {
        arr_serveurs.Add(dr.GetInt32("IdServeur"));
    }
    dr.Close();
    CloseConnexion();
    
    return arr_serveurs;
}
```

#### getDistinctFrequenciesByIdServeur()

Récupère les fréquences distinctes pour un serveur donné.

```csharp
public List<int> getDistinctFrequenciesByIdServeur(int p_idServeur)
{
    List<int> arr_frequencies = new List<int>();
    InitConnexion();
    
    MySqlCommand cmd = connection_vigitemp.CreateCommand();
    cmd.CommandText = 
        "SELECT DISTINCT FrequenceInterrogation FROM sondes " +
        "WHERE IdServeur = @idServeur AND actif = 1";
    cmd.Parameters.AddWithValue("@idServeur", p_idServeur);
    
    MySqlDataReader dr = cmd.ExecuteReader();
    while (dr.Read())
    {
        arr_frequencies.Add(dr.GetInt32("FrequenceInterrogation"));
    }
    dr.Close();
    CloseConnexion();
    
    return arr_frequencies;
}
```

#### getInfosByIdServeurAndFrequencies()

Récupère les sondes pour un serveur et une fréquence donnés.

```csharp
public List<Sonde> getInfosByIdServeurAndFrequencies(int p_idServeur, int p_frequency)
{
    List<Sonde> sondes = new List<Sonde>();
    InitConnexion();
    
    MySqlCommand cmd = connection_vigitemp.CreateCommand();
    cmd.CommandText = 
        "SELECT * FROM sondes " +
        "WHERE IdServeur = @idServeur " +
        "AND FrequenceInterrogation = @frequency " +
        "AND actif = 1";
    cmd.Parameters.AddWithValue("@idServeur", p_idServeur);
    cmd.Parameters.AddWithValue("@frequency", p_frequency);
    
    MySqlDataReader dr = cmd.ExecuteReader();
    while (dr.Read())
    {
        sondes.Add(new Sonde
        {
            Id = dr.GetInt32("Id"),
            Nom = dr.GetString("Nom"),
            TypeSonde = dr.GetString("TypeSonde"),
            PortCOM = dr.GetString("PortCOM"),
            BaudRate = dr.GetInt32("BaudRate"),
            IdLieu = dr.GetInt32("IdLieu")
        });
    }
    dr.Close();
    CloseConnexion();
    
    return sondes;
}
```

#### AddMesure()

Enregistre une mesure dans `vigitemp_mesure`.

```csharp
public bool AddMesure(Mesure mesure)
{
    InitConnexion();
    
    MySqlCommand cmd = connection_vigitemp_mesure.CreateCommand();
    cmd.CommandText = 
        "INSERT INTO mesures (IdSonde, IdLieu, ValeurMesure, HeureMesure) " +
        "VALUES (@idSonde, @idLieu, @valeurMesure, @heureMesure)";
    
    cmd.Parameters.AddWithValue("@idSonde", mesure.IdSonde);
    cmd.Parameters.AddWithValue("@idLieu", mesure.IdLieu);
    cmd.Parameters.AddWithValue("@valeurMesure", mesure.ValeurMesure);
    cmd.Parameters.AddWithValue("@heureMesure", mesure.HeureMesure);
    
    try
    {
        cmd.ExecuteNonQuery();
        VigitempServeur.nombres_reponses++;
        return true;
    }
    catch (Exception ex)
    {
        VigitempServeur.Log($"(AddMesure) SQL Erreur: {ex.Message}");
        return false;
    }
    finally
    {
        CloseConnexion();
    }
}
```

#### getConsignesLieux()

Récupère les seuils de température pour un lieu.

```csharp
public ConsignesLieu getConsignesLieux(int p_idLieu)
{
    InitConnexion();
    
    MySqlCommand cmd = connection_vigitemp.CreateCommand();
    cmd.CommandText = 
        "SELECT ConsigneHaute, ConsigneBasse, DateHeure_reactivationAlarme " +
        "FROM lieux WHERE Id = @idLieu";
    cmd.Parameters.AddWithValue("@idLieu", p_idLieu);
    
    MySqlDataReader dr = cmd.ExecuteReader();
    
    ConsignesLieu consignes = null;
    if (dr.Read())
    {
        consignes = new ConsignesLieu
        {
            ConsigneHaute = dr.GetDouble("ConsigneHaute"),
            ConsigneBasse = dr.GetDouble("ConsigneBasse"),
            DateHeureReactivation = dr.IsDBNull(dr.GetOrdinal("DateHeure_reactivationAlarme"))
                ? (DateTime?)null
                : dr.GetDateTime("DateHeure_reactivationAlarme")
        };
    }
    
    dr.Close();
    CloseConnexion();
    
    return consignes;
}
```

---

## Gestion des alertes

### Vérification seuils

```csharp
private void CheckThresholdsAndTriggerAlarms(Mesure mesure, Sonde sonde)
{
    // Récupérer consignes du lieu
    ConsignesLieu consignes = GetDatabase().getConsignesLieux(sonde.IdLieu);
    
    if (consignes == null) return;
    
    bool alerteHaute = mesure.ValeurMesure > consignes.ConsigneHaute;
    bool alerteBasse = mesure.ValeurMesure < consignes.ConsigneBasse;
    
    if (alerteHaute || alerteBasse)
    {
        // Vérifier si alarme pas en snooze
        if (consignes.DateHeureReactivation == null || 
            DateTime.Now > consignes.DateHeureReactivation)
        {
            TriggerAlarm(sonde.IdLieu, alerteHaute ? "HAUTE" : "BASSE", mesure.ValeurMesure);
        }
    }
}
```

### Déclenchement alarme

```csharp
private void TriggerAlarm(int idLieu, string typeAlarme, double valeurMesure)
{
    try
    {
        // 1. Enregistrer alarme en base
        GetDatabase().AddAlarme(new Alarme
        {
            IdLieu = idLieu,
            TypeAlarme = typeAlarme,
            ValeurMesure = valeurMesure,
            DateHeureAlarme = DateTime.Now,
            Acquittee = false
        });
        
        VigitempServeur.Log($"Alarme déclenchée - Lieu {idLieu} - Type: {typeAlarme}");
        
        // 2. Notifier Agent C# (pop-up Windows)
        NotifyAgentAlarm(idLieu, "show");
        
    }
    catch (Exception ex)
    {
        VigitempServeur.Log($"Erreur déclenchement alarme: {ex.Message}");
    }
}
```

### Notification Agent C#

```csharp
private void NotifyAgentAlarm(int idLieu, string action)
{
    try
    {
        // Récupérer les postes clients avec Agent installé
        List<PosteClient> postes = GetDatabase().getPCsClients();
        
        foreach (PosteClient poste in postes)
        {
            try
            {
                // Appeler endpoint Agent
                string url = $"http://{poste.AdresseIP}:8000/alarm";
                
                using (HttpClient client = new HttpClient())
                {
                    var parameters = new Dictionary<string, string>
                    {
                        { "action", action },
                        { "idLieu", idLieu.ToString() }
                    };
                    
                    var content = new FormUrlEncodedContent(parameters);
                    var response = client.PostAsync(url, content).Result;
                    
                    if (response.IsSuccessStatusCode)
                    {
                        VigitempServeur.Log($"Agent notifié sur {poste.AdresseIP}");
                    }
                }
            }
            catch (Exception ex)
            {
                VigitempServeur.Log($"Erreur notification Agent {poste.AdresseIP}: {ex.Message}");
            }
        }
    }
    catch (Exception ex)
    {
        VigitempServeur.Log($"Erreur getPCsClients: {ex.Message}");
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
    <add key="LogFilePath" value="C:\Users\User\Desktop\log.txt"/>
    <add key="DefaultScanInterval" value="60000"/> <!-- ms -->
  </appSettings>
  
  <startup>
    <supportedRuntime version="v4.0" sku=".NETFramework,Version=v4.8"/>
  </startup>
</configuration>
```

---

## Installation et déploiement

### Compilation

```cmd
cd "C:\Vigitemp project\vigitemp\Vigitemp Serveur"
msbuild "Vigitemp Serveur.sln" /p:Configuration=Release
```

### Installation du service

```cmd
# Se placer dans le dossier Release
cd "Vigitemp Serveur\bin\Release"

# Créer le service Windows
sc create "VigitempServer" ^
    binPath= "C:\Path\To\VigitempServeur.exe" ^
    DisplayName= "Vigitemp Server" ^
    start= auto

# Configurer description
sc description "VigitempServer" "Service de collecte automatique des mesures de température"

# Démarrer le service
sc start "VigitempServer"

# Vérifier le statut
sc query "VigitempServer"
```

### Configuration démarrage automatique

```cmd
# Démarrage automatique au boot
sc config "VigitempServer" start= auto

# Démarrage automatique différé (recommandé)
sc config "VigitempServer" start= delayed-auto
```

### Désinstallation

```cmd
# Arrêter le service
sc stop "VigitempServer"

# Supprimer le service
sc delete "VigitempServer"
```

---

## Monitoring et maintenance

### Consulter les logs

#### Event Viewer Windows

```cmd
# Ouvrir Event Viewer
eventvwr.msc

# Naviguer vers :
# Applications and Services Logs → New Vigitemp Serveur
```

#### Fichier log

```cmd
# Localisation par défaut
C:\Users\User\Desktop\log.txt

# Tail en temps réel (PowerShell)
Get-Content "C:\Users\User\Desktop\log.txt" -Wait -Tail 50
```

### Commandes de gestion

```cmd
# Statut du service
sc query "VigitempServer"

# Démarrer
sc start "VigitempServer"

# Arrêter
sc stop "VigitempServer"

# Redémarrer
sc stop "VigitempServer" && timeout /t 5 && sc start "VigitempServer"

# Voir configuration
sc qc "VigitempServer"
```

### Indicateurs de santé

Le service expose des compteurs via logging :

- **nombres_interrogations** : Nombre total de requêtes capteurs
- **nombres_reponses** : Nombre total de réponses valides
- **Taux de succès** : `(nombres_reponses / nombres_interrogations) * 100`

```csharp
// Dans VigitempServeur.cs
public static int nombres_interrogations;
public static int nombres_reponses;

// Calculer taux de succès
double tauxSucces = (double)nombres_reponses / nombres_interrogations * 100;
VigitempServeur.Log($"Taux de succès: {tauxSucces:F2}%");
```

---

## Bonnes pratiques

### Sécurité

⚠️ **Problèmes actuels :**
- Credentials hardcodés dans `Database.cs`
- Connexions base de données non poolées efficacement
- Logs contiennent potentiellement des données sensibles

✅ **Recommandations :**
```csharp
// Utiliser App.config
string dbPassword = ConfigurationManager.AppSettings["DatabasePassword"];

// Connection pooling explicite
string connectionString = 
    $"SERVER={IP};DATABASE=vigitemp;UID={UID};PASSWORD={pwd};" +
    "Pooling=true;Min Pool Size=5;Max Pool Size=20;";

// Logging sécurisé (ne pas logger credentials)
VigitempServeur.Log($"Connexion à {IP}:{PORT} - User: {UID}");
```

### Performance

✅ **Optimisations :**
- Sémaphore pour éviter interrogations concurrentes
- Timers asynchrones pour non-blocage
- Threads background pour isolation

```csharp
// Sémaphore déjà implémenté
private readonly SemaphoreSlim semaphore = new SemaphoreSlim(1, 1);

await semaphore.WaitAsync();
try
{
    // Code critique
}
finally
{
    semaphore.Release();
}
```

### Robustesse

✅ **Gestion erreurs :**
```csharp
try
{
    // Opération risquée (communication série, DB, HTTP)
}
catch (TimeoutException ex)
{
    VigitempServeur.Log($"Timeout: {ex.Message}");
    // Retry logique
}
catch (IOException ex)
{
    VigitempServeur.Log($"Erreur I/O: {ex.Message}");
    // Fermer/rouvrir port COM
}
catch (MySqlException ex)
{
    VigitempServeur.Log($"Erreur DB: {ex.Message}");
    // Reconnexion DB
}
catch (Exception ex)
{
    VigitempServeur.Log($"Erreur inconnue: {ex.Message}");
}
```

---

## Dépannage

### Le service ne démarre pas

**Symptômes :**
```cmd
sc start "VigitempServer"
[SC] StartService FAILED 1053:
The service did not respond to the start or control request in a timely fashion.
```

**Solutions :**
1. Vérifier Event Viewer pour erreurs détaillées
2. Vérifier connexion base de données accessible
3. Vérifier ports COM disponibles
4. Augmenter timeout démarrage :
   ```cmd
   sc config "VigitempServer" start= delayed-auto
   ```

### Pas de mesures collectées

**Diagnostic :**
```sql
-- Vérifier dernières mesures
SELECT * FROM vigitemp_mesure.mesures 
ORDER BY HeureMesure DESC 
LIMIT 10;

-- Vérifier sondes actives
SELECT * FROM vigitemp.sondes WHERE actif = 1;

-- Vérifier configuration ports COM
SELECT Id, Nom, PortCOM, BaudRate FROM vigitemp.sondes;
```

**Solutions :**
1. Vérifier ports COM existent : `mode` dans cmd
2. Vérifier capteurs alimentés et câblés
3. Tester communication manuelle (PuTTY, HyperTerminal)
4. Vérifier logs pour erreurs de timeout

### Alarmes non reçues

**Vérifications :**
```sql
-- Vérifier alarmes enregistrées
SELECT * FROM vigitemp.alarmes 
ORDER BY DateHeureAlarme DESC 
LIMIT 10;

-- Vérifier postes clients enregistrés
SELECT * FROM vigitemp.t_postes_clients;
```

**Solutions :**
1. Vérifier Agent C# lancé sur postes clients
2. Vérifier port 8000 accessible (firewall)
3. Tester endpoint manuellement :
   ```cmd
   curl -X POST "http://192.168.1.100:8000/alarm?action=show&idLieu=1"
   ```

---

## Tests (à implémenter)

### Tests unitaires

```csharp
// NUnit ou MSTest
using NUnit.Framework;

[TestFixture]
public class DatabaseTests
{
    [Test]
    public void TestGetDistinctIdServeur()
    {
        Database db = new Database();
        List<int> serveurs = db.getDistinctIdServeur();
        
        Assert.IsNotNull(serveurs);
        Assert.Greater(serveurs.Count, 0);
    }
    
    [Test]
    public void TestAddMesure()
    {
        Database db = new Database();
        Mesure mesure = new Mesure
        {
            IdSonde = 1,
            IdLieu = 1,
            ValeurMesure = 20.5,
            HeureMesure = DateTime.Now
        };
        
        bool result = db.AddMesure(mesure);
        Assert.IsTrue(result);
    }
}
```

### Tests d'intégration

```csharp
[TestFixture]
public class SensorIntegrationTests
{
    [Test]
    public void TestSensorIH_ReadData()
    {
        Sonde sonde = new Sonde
        {
            Id = 1,
            TypeSonde = "IH",
            PortCOM = "COM3",
            BaudRate = 9600
        };
        
        SensorIH sensor = new SensorIH(sonde);
        List<Mesure> mesures = sensor.ExecuteCommand();
        
        Assert.IsNotNull(mesures);
        Assert.Greater(mesures.Count, 0);
        Assert.That(mesures[0].ValeurMesure, Is.InRange(-50, 100));
    }
}
```

---

## Roadmap

### Court terme
- [ ] Extraire credentials dans App.config
- [ ] Tests unitaires complets
- [ ] Retry automatique sur échec communication
- [ ] Dashboard monitoring (Grafana)

### Moyen terme
- [ ] Migration .NET Framework 4.8 → .NET 8
- [ ] Support capteurs réseau (TCP/IP) en plus de série
- [ ] Compression logs automatique
- [ ] Alerting par email/SMS

### Long terme
- [ ] Architecture microservices
- [ ] Support Docker/Kubernetes
- [ ] API REST pour administration
- [ ] Machine Learning pour prédiction pannes

---

**Documentation mise à jour le 27 novembre 2025**
