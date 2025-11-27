# 🏗️ Architecture Vigitemp - Vue d'ensemble

**Date :** 26 novembre 2025  
**Projet :** Vigitemp (Migration depuis WinDev)

---

## 📋 Contexte du projet

### Historique
- **Ancien système :** WinDev (défauts et limites identifiés)
- **Décision :** Migration vers stack moderne
- **Équipe :** Service informatique MC2
- **État actuel :** En cours de développement

### Composants du système
Vigitemp est composé de **3 applications indépendantes** qui partagent la même base de données :

```
┌─────────────────────────┐
│  Vigitemp Agent (C#)    │  ➜ Application Windows (système tray)
│  .NET Framework 4.8     │     - Collecte données capteurs LogTag
│  Windows Forms          │     - Interface HTTP locale (port 8000)
└────────────┬────────────┘     - Alertes visuelles
             │
             │
┌────────────┴────────────┐
│  Vigitemp Server (C#)   │  ➜ Service Windows
│  .NET Framework 4.8     │     - Gestion capteurs série (ports COM)
│  Windows Service        │     - Traitement en arrière-plan
└────────────┬────────────┘     - Collecte automatique
             │
             │
             ├──────────────────────────┐
             │                          │
             ▼                          ▼
    ┌────────────────┐        ┌────────────────┐
    │  MySQL         │        │  MySQL         │
    │  vigitemp      │        │  vigitemp      │
    │                │        │  _mesure       │
    └────────┬───────┘        └────────┬───────┘
             │                          │
             └──────────┬───────────────┘
                        │
                        ▼
             ┌─────────────────────┐
             │  Website (Next.js)  │  ➜ Interface web moderne
             │  Next.js 15         │     - Visualisation données
             │  React 19           │     - Graphiques temps réel
             │  TypeScript         │     - Gestion alertes
             └─────────────────────┘     - Configuration système
```

---

## 🗄️ Architecture Base de Données

### MySQL - 2 bases distinctes

#### `vigitemp` (Base principale)
Tables de configuration et paramétrage :
- `lieux` - Sites de surveillance
- `vigilogs` - Capteurs LogTag
- `t_parametre` - Configuration système
- `t_postes_clients` - Postes connectés
- `alarmes` - Historique alertes
- Etc.

#### `vigitemp_mesure` (Base de mesures)
Tables de données temps réel :
- `ts_mesuresvigiloghugo` - Mesures des capteurs
- Tables de séries temporelles
- Haute fréquence d'écriture

**Raison de la séparation :**
- ⚡ Performance (mesures sur base dédiée)
- 🔧 Maintenance simplifiée
- 📊 Optimisation différente (OLTP vs OLAP)

---

## 💻 Vigitemp Agent (C#)

### Vue d'ensemble
**Type :** Application Windows (System Tray)  
**Framework :** .NET Framework 4.8  
**UI :** Windows Forms  
**Plateforme :** Windows uniquement

### Responsabilités
1. **Interface avec capteurs LogTag**
   - Lecture données via dock USB
   - Configuration capteurs (seuils, intervalles)
   - Téléchargement mesures

2. **Serveur HTTP local**
   - Port : 8000
   - Endpoints REST pour le website
   - Communication inter-applications

3. **Alertes visuelles**
   - Pop-ups Windows
   - Icône système tray
   - Notifications utilisateur

### Technologies clés
```xml
<Dependencies>
  - MySql.Data 9.0.0          (Connexion base)
  - LogTagIO29.dll            (SDK capteurs propriétaire)
  - Newtonsoft.Json 13.0.3    (Sérialisation JSON)
  - System.Net.Http           (Serveur HTTP)
</Dependencies>
```

### Fichiers principaux
- `HttpServer.cs` - Serveur HTTP + endpoints
- `Database.cs` - Accès base de données
- `LogTagNET2.9V2.cs` - Interface SDK LogTag
- `Form_Alert.cs` - Interface alertes Windows
- `MyCustomApplicationContext.cs` - Gestion app tray

### Endpoints HTTP exposés

#### `GET /DownloadLogTagData`
**Fonction :** Récupère les mesures d'un capteur LogTag  
**Retour :** JSON avec mesures + id_recuperationMesure

#### `GET /downloadLogTagConfiguration`
**Fonction :** Lit la configuration actuelle d'un capteur  
**Retour :** JSON avec consignes (haute/basse) + valeurs

#### `POST /uploadLogTagConfiguration`
**Fonction :** Configure un capteur LogTag  
**Params :**
```json
{
  "consigneHaute": "0|1",
  "consigneBasse": "0|1",
  "valeurConsigneHaute": "température",
  "valeurConsigneBasse": "température"
}
```

#### `POST /alarm`
**Fonction :** Affiche/masque alerte système  
**Params :**
```json
{
  "action": "show|hide",
  "idLieu": "identifiant lieu"
}
```

---

## 🖥️ Vigitemp Server (C#)

### Vue d'ensemble
**Type :** Service Windows  
**Framework :** .NET Framework 4.8  
**Plateforme :** Windows Server / Windows 10+

### Responsabilités
1. **Gestion capteurs série**
   - Communication ports COM
   - Gestion différents types de capteurs :
     - SensorIH, SensorIC, SensorIP, SensorIN, SensorIE
     - SensorHN, SensorEN

2. **Traitement en arrière-plan**
   - Collecte automatique périodique
   - Stockage base de données
   - Gestion erreurs/reconnexions

3. **Service système**
   - Démarrage automatique Windows
   - Logs système
   - Robustesse 24/7

### Technologies clés
```xml
<Dependencies>
  - MySql.Data 9.0.0              (Connexion base)
  - System.IO.Ports 8.0.0         (Communication série)
  - System.ServiceProcess         (Service Windows)
</Dependencies>
```

### Fichiers principaux
- `VigitempServeur.cs` - Service Windows principal
- `ThreadServeur.cs` - Thread de collecte
- `Database.cs` - Accès base de données
- `Sensor.cs` - Interface générique capteurs
- `sensors/` - Implémentations spécifiques capteurs

### Types de capteurs supportés
| Type | Description |
|------|-------------|
| SensorIH | Capteur interface hybride |
| SensorIC | Capteur interface connectée |
| SensorIP | Capteur interface protocole |
| SensorIN | Capteur interface native |
| SensorIE | Capteur interface externe |
| SensorHN | Capteur hybride natif |
| SensorEN | Capteur externe natif |

---

## 🌐 Vigitemp Website (Next.js)

### Vue d'ensemble
**Type :** Application web moderne  
**Framework :** Next.js 15 (App Router)  
**UI Library :** HeroUI + TailwindCSS  
**Langage :** TypeScript

### Responsabilités
1. **Visualisation données**
   - Graphiques temps réel (recharts + Chart.js)
   - Tableaux de bord
   - Historiques mesures

2. **Gestion système**
   - Configuration lieux/capteurs
   - Gestion alertes
   - Paramétrage seuils

3. **Interface moderne**
   - Responsive (desktop/mobile/tablette)
   - Dark mode
   - Transitions fluides

### Stack technique
```json
{
  "framework": "Next.js 15.5.6",
  "runtime": "React 19.0.0",
  "language": "TypeScript 5.9.3",
  "ui": "HeroUI 2.8.5 + TailwindCSS 3.4.1",
  "charts": "recharts 3.5.0 + Chart.js 4.5.1",
  "database": "mysql2 3.15.3",
  "http": "axios 1.13.2",
  "icons": "react-icons 5.5.0",
  "toast": "react-hot-toast 2.6.0"
}
```

### Structure du projet
```
website/
├── src/
│   └── app/
│       ├── api/              # Routes API Next.js
│       │   ├── lieux/        # API lieux
│       │   ├── mesures/      # API mesures
│       │   ├── groupes/      # API groupes
│       │   └── postes_clients/
│       ├── components/       # Composants React
│       │   ├── filter/       # Filtres
│       │   ├── monitoring-graph*.tsx
│       │   ├── card-alarm.tsx
│       │   └── vigilog-settings.tsx
│       ├── libs/             # Utilitaires
│       │   ├── mysql.tsx     # Connexion DB
│       │   └── utils_*.tsx   # Helpers
│       ├── surveillance/     # Module surveillance
│       │   └── [idLieu]/     # Page détail lieu
│       ├── metrologie/       # Module métrologie
│       │   ├── sondes/
│       │   ├── lieux/
│       │   ├── calibrages/
│       │   └── alarmes/
│       ├── vigilog/          # Module vigilog
│       ├── layout.tsx        # Layout principal
│       └── page.tsx          # Page accueil
├── public/                   # Assets statiques
├── next.config.mjs          # Config Next.js
├── tailwind.config.ts       # Config Tailwind
└── package.json             # Dépendances
```

### Modules principaux

#### 1. Surveillance
**Route :** `/surveillance`  
**Fonctionnalités :**
- Liste des lieux surveillés
- Graphiques temps réel
- Alertes actives
- Filtres et recherche

#### 2. Métrologie
**Route :** `/metrologie`  
**Fonctionnalités :**
- Gestion sondes
- Configuration lieux
- Calibrages
- Historique alarmes

#### 3. Vigilog
**Route :** `/vigilog`  
**Fonctionnalités :**
- Configuration capteurs LogTag
- Interface avec Agent C#
- Téléchargement données

### APIs Next.js exposées

#### Routes dynamiques
- `GET /api/lieux` - Liste lieux
- `GET /api/lieux/type/[slug]` - Lieux par type
- `GET /api/lieux/getInfos/[slug]` - Détails lieu
- `POST /api/lieux/alerte/[slug]` - Déclencher alerte
- `GET /api/mesures/[IdLieu]` - Mesures d'un lieu
- `GET /api/mesures/vigilog/[idRecuperationMesure]` - Mesures vigilog
- `GET /api/groupes` - Liste groupes
- `GET /api/postes_clients` - Postes connectés

---

## 🔄 Flux de données

### Collecte de mesures (LogTag)

```
1. Capteur LogTag dans dock USB
        │
        ▼
2. Vigitemp Agent détecte capteur
        │
        ▼
3. Website appelle GET /DownloadLogTagData (Agent port 8000)
        │
        ▼
4. Agent lit données via LogTagIO29.dll
        │
        ▼
5. Agent écrit dans vigitemp_mesure.ts_mesuresvigiloghugo
        │
        ▼
6. Agent retourne { res: "true", id_recuperationMesure: "..." }
        │
        ▼
7. Website appelle GET /api/mesures/vigilog/[id]
        │
        ▼
8. Website affiche graphiques temps réel
```

### Collecte de mesures (Capteurs série)

```
1. Capteurs connectés ports COM
        │
        ▼
2. Vigitemp Server (service) lit périodiquement
        │
        ▼
3. Server écrit dans vigitemp_mesure
        │
        ▼
4. Website lit via API /api/mesures/[IdLieu]
        │
        ▼
5. Website affiche graphiques temps réel
```

### Gestion alertes

```
1. Server détecte dépassement seuil
        │
        ▼
2. Server écrit dans vigitemp.alarmes
        │
        ▼
3. Server appelle POST /alarm (Agent port 8000)
        │  Params: { action: "show", idLieu: "123" }
        │
        ▼
4. Agent affiche pop-up Windows
        │
        ▼
5. Website appelle POST /api/lieux/alerte/[slug]
        │
        ▼
6. Website affiche notification toast
```

---

## 🔐 Sécurité et Accès

### Base de données
**Connexion directe** depuis les 3 applications :
- Host : `192.168.63.121`
- Port : `3306`
- User : `root` (⚠️ À sécuriser en production)
- Bases : `vigitemp` + `vigitemp_mesure`

### Réseau
- **Agent :** Serveur HTTP local (127.0.0.1:8000 + IP locale:8000)
- **Server :** Service local (pas d'exposition réseau)
- **Website :** Application web (port 3000 en dev, 80/443 en prod)

### CORS (Website)
```javascript
// next.config.mjs
headers: [
  { key: "Access-Control-Allow-Origin", value: "*" }
]
// ⚠️ À restreindre en production
```

---

## 📦 Déploiement

### Vigitemp Agent
**Type :** Installateur Windows (MSI)  
**Projet :** `VigitempAgentInstaller.vdproj`  
**Prérequis :**
- Windows 7+ (x86)
- .NET Framework 4.8
- LogTagIO29.dll (drivers)

**Installation :**
1. Double-clic sur installer
2. Installation dans `Program Files`
3. Démarrage automatique avec Windows
4. Icône dans system tray

### Vigitemp Server
**Type :** Service Windows  
**Installation :**
```cmd
# Compilation Release
msbuild /p:Configuration=Release

# Installation service
sc create "VigitempServer" binPath="C:\...\VigitempServeur.exe"
sc start "VigitempServer"

# Configuration démarrage auto
sc config "VigitempServer" start=auto
```

### Vigitemp Website
**Type :** Application Node.js  
**Déploiement :**

#### Production (recommandé)
```bash
# Build optimisé
npm run build

# Démarrage serveur production
npm run start
# OU
node .next/standalone/server.js
```

#### Docker (optionnel)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

---

## 🔧 Configuration Système

### Variables d'environnement (Website)
```env
# Base de données
DB_HOST=192.168.63.121
DB_USER=root
DB_PASS=pass
DB_SCHEMA_VIGITEMP=vigitemp
DB_SCHEMA_VIGITEMP_MESURE=vigitemp_mesure

# Agent C# (URL)
AGENT_URL=http://localhost:8000
```

### Configuration Agent (App.config)
```xml
<appSettings>
  <add key="ServerIP" value="192.168.63.121" />
  <add key="DatabaseName" value="vigitemp" />
  <add key="HttpPort" value="8000" />
</appSettings>
```

### Configuration Server (App.config)
```xml
<appSettings>
  <add key="ServerIP" value="192.168.63.121" />
  <add key="DatabaseName" value="vigitemp" />
  <add key="SensorScanInterval" value="60000" /> <!-- ms -->
</appSettings>
```

---

## 📊 Performance et Scalabilité

### Capacités actuelles
- **Lieux surveillés :** Illimité (limité par base de données)
- **Capteurs LogTag :** ~50 simultanés (limité par USB)
- **Capteurs série :** ~20 ports COM simultanés
- **Fréquence mesures :** 1 mesure/minute (configurable)
- **Utilisateurs web :** ~100 simultanés (limité par serveur web)

### Goulots d'étranglement
- 🔴 **USB LogTag :** 1 dock à la fois par poste
- 🟡 **Ports COM :** Limité par carte série
- 🟢 **Base de données :** Bon (séparation vigitemp/vigitemp_mesure)
- 🟢 **Website :** Très bon (Next.js optimisé)

### Recommandations scaling
1. **Multi-agents :** Déployer Agent sur plusieurs postes
2. **Load balancing :** Nginx devant plusieurs instances website
3. **Base de données :** Réplication MySQL maître-esclave
4. **Caching :** Redis pour données fréquentes

---

## 🧪 Tests et Qualité

### Coverage actuel
- ❌ Tests unitaires : Non implémentés
- ❌ Tests intégration : Non implémentés
- ⚠️ Tests manuels : En cours

### Recommandations
#### C# (Agent + Server)
```csharp
// NUnit ou MSTest
[TestClass]
public class DatabaseTests {
    [TestMethod]
    public void TestAddMesure() { ... }
}
```

#### Website (Next.js)
```bash
npm install -D jest @testing-library/react vitest
```

---

## 📚 Documentation complémentaire

### Fichiers de documentation
- `MODIFICATIONS_EFFECTUEES.md` - Changements effectués
- `PLAN_MODIFICATIONS_FUTURES.md` - Roadmap
- `PROJET_CSHARP_AGENT.md` - Détails Agent
- `PROJET_CSHARP_SERVER.md` - Détails Server
- `PROJET_WEBSITE.md` - Détails Website

### Ressources externes
- Next.js : https://nextjs.org/docs
- .NET Framework : https://docs.microsoft.com/dotnet
- MySQL : https://dev.mysql.com/doc/

---

## 🚀 Prochaines étapes

### Court terme (2025)
- [ ] Terminer migration WinDev → Stack actuelle
- [ ] Tests intensifs environnement production
- [ ] Formation utilisateurs
- [ ] Documentation utilisateur

### Moyen terme (2026)
- [ ] Migration .NET Framework → .NET 8 (C#)
- [ ] Implémentation tests automatisés
- [ ] Monitoring et alerting (Prometheus/Grafana)
- [ ] Optimisations performance

### Long terme
- [ ] Application mobile (iOS/Android)
- [ ] API publique (REST + GraphQL)
- [ ] IA pour prédiction pannes
- [ ] Multi-tenancy (plusieurs clients)

---

**Documentation mise à jour le 26 novembre 2025**
