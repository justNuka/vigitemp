# Hotline VigiSensys - Installation et prérequis

Dernière mise à jour : 16/07/2026

## Objectif

Ce document décrit les éléments nécessaires pour installer et exploiter la hotline VigiSensys.

Il complète le guide de fonctionnement en détaillant :

- les composants nécessaires ;
- les dépendances ;
- les variables de configuration ;
- les ports réseau ;
- les vérifications après installation.

## Composants nécessaires

| Composant | Obligatoire | Description |
| --- | --- | --- |
| Site web VigiSensys | Oui | Interface hotline et API web |
| Serveur C# VigiSensys | Oui | Communication avec modules et sondes |
| Base de données | Oui | Configuration sondes, modules, utilisateurs |
| Licence VigiSensys | Oui | Activation des fonctionnalités |
| Modules de communication | Oui pour tests sondes | Accès aux sondes via ports COM ou réseau |
| Agent VigiSensys | Non pour Pack | Notifications locales selon licence |

## Topologies possibles

### Installation tout-en-un

Tous les composants sont sur la même machine :

```text
PC / serveur
  - Site web
  - Serveur C#
  - Base de données
  - Modules locaux ou accessibles réseau
```

Adapté aux petites installations et licences Pack.

### Installation répartie

Les composants sont séparés :

```text
Serveur web
  -> Serveur C#
  -> Base de données
  -> Modules / sondes
```

Dans ce cas, les ports réseau et règles firewall doivent être configurés explicitement.

## Dépendances système

### Serveur web

Le serveur web est basé sur Next.js.

Il nécessite :

- Windows Server ou Windows compatible avec le service installé ;
- Node.js embarqué ou fourni par l'installateur selon package ;
- accès réseau à la base ;
- accès réseau au serveur C# hotline ;
- fichier de licence ;
- clé publique de licence.

### Serveur C#

Le serveur C# nécessite :

- Windows ;
- .NET Framework 4.8 ;
- accès aux ports COM ou modules ;
- accès à la base de données ;
- fichier de configuration `.config` ;
- droits suffisants pour lancer un service Windows.

### Base de données

VigiSensys supporte :

- MySQL ;
- Microsoft SQL Server.

Bases utilisées :

| Base | Rôle |
| --- | --- |
| `vigi_main` | Configuration, utilisateurs, lieux, alarmes |
| `vigi_mesures` | Mesures, graphiques, données techniques |
| `vigi_chat` | Messagerie |

L'utilisateur base de données doit avoir les droits nécessaires à l'application et à l'installation :

- `SELECT`
- `INSERT`
- `UPDATE`
- `DELETE`
- `CREATE`
- `ALTER`
- `DROP`
- `INDEX`
- `TRIGGER`

Selon le mode d'installation, les droits de création de base peuvent aussi être nécessaires.

## Ports réseau

| Port | Composant | Usage |
| --- | --- | --- |
| `3000` | Web | Accès à VigiSensys |
| `5310` | Serveur C# hotline | API technique hotline |
| `8000` | Agent | Agent local, selon licence |
| `3306` | MySQL | Base de données MySQL |
| `1433` | SQL Server | Base de données SQL Server |

Les ports doivent être adaptés si l'installation utilise une configuration personnalisée.

## Variables web importantes

Exemple de configuration :

```env
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://user:password@192.168.1.10:3306/vigi_main"
DATABASE_MESURES_URL="mysql://user:password@192.168.1.10:3306/vigi_mesures"
DATABASE_CHAT_URL="mysql://user:password@192.168.1.10:3306/vigi_chat"

NEXT_PUBLIC_API_BASE_URL="http://192.168.1.10:3000/"
NEXT_PUBLIC_APP_URL="http://192.168.1.10:3000/"

HOTLINE_SERVER_HOST="192.168.1.10"
HOTLINE_SERVER_PORT=5310
HOTLINE_SERVER_TIMEOUT_MS=10000

HOTLINE_JWT_SECRET="secret-long-et-aleatoire"
HOTLINE_ACCESS_TOKEN_TTL_MINUTES=15
HOTLINE_REFRESH_TOKEN_TTL_MINUTES=120

VIGISENSYS_LICENSE_PATH="C:\ProgramData\VigiSensys\licenses\licence.vtlic"
VIGISENSYS_LICENSE_PUBLIC_KEY_PATH="C:\ProgramData\VigiSensys\license_keys\public_key.pem"
VIGISENSYS_LOGS_DIR="C:\ProgramData\VigiSensys\web-logs"
```

Pour SQL Server, les chaînes de connexion doivent utiliser le format SQL Server prévu par Prisma et le provider doit être :

```env
DATABASE_PROVIDER="sqlserver"
```

## Configuration serveur C#

Le serveur C# doit connaître :

- l'URL du site web ;
- les secrets de communication ;
- le provider base de données ;
- les informations de connexion BDD ;
- le nombre de workers ;
- les paramètres GSP ;
- les chemins de licence.

Exemples de clés importantes :

```xml
<add key="VigiSensys.WebsiteBaseUrl" value="http://192.168.1.10:3000" />
<add key="VigiSensys.AlarmDispatchSecret" value="..." />

<add key="Vigi.Db.Provider" value="mysql" />
<add key="Vigi.Db.Host" value="192.168.1.10" />
<add key="Vigi.Db.Port" value="3306" />
<add key="Vigi.Db.User" value="vigiwww" />
<add key="Vigi.Db.Password" value="..." />
<add key="Vigi.Db.MainDatabase" value="vigi_main" />
<add key="Vigi.Db.MeasureDatabase" value="vigi_mesures" />

<add key="Vigitemp.Workers.Count" value="1" />
<add key="Vigitemp.Gsp.ConfigCheckEverySuccessfulProbes" value="12" />
<add key="Vigitemp.Gsp.ConfigFreeSlotMinSeconds" value="20" />
```

## Étapes d'installation recommandées

### 1. Préparer la base

1. Installer MySQL ou SQL Server.
2. Créer ou vérifier les bases `vigi_main`, `vigi_mesures`, `vigi_chat`.
3. Créer l'utilisateur applicatif.
4. Exécuter les scripts de seed adaptés au provider.
5. Vérifier la présence des tables, vues, triggers et jobs/events.

### 2. Installer le serveur C#

1. Installer le service serveur.
2. Renseigner la configuration BDD.
3. Renseigner l'URL du site web.
4. Renseigner les chemins de licence.
5. Vérifier les ports COM et modules.
6. Démarrer le service.

### 3. Installer le site web

1. Installer le site.
2. Renseigner les chaînes de connexion.
3. Renseigner l'adresse du serveur C# hotline.
4. Renseigner les chemins de licence.
5. Démarrer le service web.

### 4. Ouvrir les ports nécessaires

Sur une installation simple, ouvrir au minimum le port web.

Si le serveur C# est séparé du web, ouvrir aussi le port hotline entre le web et le serveur C#.

Exemple :

```powershell
New-NetFirewallRule -DisplayName "VigiSensys Web" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
New-NetFirewallRule -DisplayName "VigiSensys Hotline Server" -Direction Inbound -Protocol TCP -LocalPort 5310 -Action Allow
```

Limiter le port `5310` au serveur web si possible.

### 5. Tester l'installation

Checklist :

- le site web répond ;
- la connexion utilisateur fonctionne ;
- la page hotline s'ouvre ;
- `/api/hotline/health` retourne un état disponible ;
- un test `TEMP` répond sur une sonde connue ;
- les trames TX/RX sont visibles ;
- les logs web et serveur sont alimentés.

## HTTPS et reverse proxy

Si la hotline est utilisée depuis plusieurs postes, HTTPS est recommandé.

Deux cas :

### Reverse proxy client existant

Configurer l'URL publique :

```text
https://vigisensys.client.local
```

Configurer les origines autorisées si le proxy change l'hôte ou le protocole.

### Pas de reverse proxy

L'installation peut fonctionner en HTTP sur réseau local.

Pour du HTTPS sans reverse proxy existant, prévoir :

- un certificat fourni par le client ;
- ou un reverse proxy local type Caddy/IIS ;
- ou un certificat auto-signé pour un usage de test, en acceptant les contraintes navigateur.

## Dépannage installation

| Problème | Vérification |
| --- | --- |
| Le site ne s'ouvre pas | Service web, port 3000, firewall |
| Connexion impossible | Base accessible, provider correct, JWT, utilisateur existant |
| Hotline indisponible | Serveur C# lancé, port 5310 ouvert, `HOTLINE_SERVER_HOST` correct |
| Timeout sonde | Module, port COM, sonde alimentée, surveillance concurrente |
| Erreur licence | Chemin licence, clé publique, droits fichier |
| Erreur base | Chaîne de connexion, droits utilisateur, provider MySQL/MSSQL |

## Informations à fournir au support

Pour analyser un problème hotline, fournir :

- version VigiSensys ;
- provider base de données ;
- architecture tout-en-un ou répartie ;
- adresse web ;
- adresse et port hotline serveur ;
- numéro de série testé ;
- type de sonde ;
- action demandée ;
- logs web ;
- logs serveur C# ;
- capture des trames TX/RX.

