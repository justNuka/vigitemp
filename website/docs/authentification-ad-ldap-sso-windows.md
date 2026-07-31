# Authentification Active Directory, LDAP et SSO Windows

## 1. Statut du document

Ce document décrit l'architecture cible permettant à VigiSensys de prendre en charge :

- Microsoft Active Directory ;
- un annuaire LDAP compatible ;
- l'authentification Windows intégrée (SSO) ;
- l'authentification locale actuelle.

> **Statut : à implémenter.** L'application utilise actuellement des comptes locaux, des mots de passe hachés avec `bcrypt` et des sessions JWT stockées dans des cookies HTTP sécurisés.

L'objectif est d'ajouter les fournisseurs d'identité externes sans remplacer le système de profils, d'autorisations, de sites et de groupes de VigiSensys.

---

## 2. Principes retenus

### 2.1. Séparer authentification et autorisation

L'annuaire externe répond à la question :

> Qui est cet utilisateur ?

VigiSensys continue de répondre aux questions :

> À quelles fonctionnalités, quels sites et quels groupes cet utilisateur a-t-il accès ?

Ainsi :

- Active Directory ou LDAP valide l'identité ;
- VigiSensys conserve un compte local de liaison dans `t_utilisateur` ;
- le profil et les autorisations restent gérés dans VigiSensys ;
- après validation, VigiSensys génère ses JWT actuels ;
- les API existantes continuent de fonctionner sans connaître le fournisseur utilisé.

### 2.2. Conserver un accès local de secours

Un compte administrateur local de secours doit rester disponible afin de permettre l'accès lorsque :

- l'annuaire est indisponible ;
- le réseau ou le DNS du domaine est indisponible ;
- la configuration LDAP est erronée ;
- Kerberos ou l'authentification Windows ne fonctionne plus ;
- le certificat LDAPS a expiré.

Ce compte doit être protégé par un mot de passe fort, surveillé dans l'audit et réservé aux opérations de maintenance.

---

## 3. Modes d'authentification

VigiSensys devra proposer les modes suivants.

| Mode | Description | Saisie d'un mot de passe dans VigiSensys |
|---|---|---:|
| `LOCAL` | Authentification actuelle avec un compte VigiSensys | Oui |
| `LDAP` | Authentification auprès d'un annuaire LDAP ou Active Directory | Oui |
| `WINDOWS_SSO` | Authentification transparente du compte Windows | Non |
| `HYBRIDE` | SSO ou LDAP avec comptes locaux de secours | Selon le parcours |

Le mode `HYBRIDE` est recommandé pour les installations rattachées à un domaine d'entreprise.

---

## 4. Active Directory et LDAP

### 4.1. Fonctionnement

Active Directory expose une interface LDAP. Un même connecteur peut donc prendre en charge :

- Microsoft Active Directory via LDAP ou LDAPS ;
- OpenLDAP ;
- un annuaire compatible LDAPv3.

Flux proposé :

```text
Utilisateur
    -> page de connexion VigiSensys
    -> API d'authentification VigiSensys
    -> recherche du compte dans l'annuaire
    -> validation du mot de passe par bind LDAP
    -> association avec t_utilisateur
    -> génération des JWT VigiSensys
```

### 4.2. LDAPS obligatoire en production

Une authentification LDAP simple ne doit pas transmettre de mot de passe sur une connexion non chiffrée.

En production, utiliser :

- `ldaps://serveur.domaine.local:636` ; ou
- LDAP avec StartTLS si le connecteur retenu le supporte correctement.

Le certificat du serveur LDAP doit être vérifié. L'option permettant d'ignorer les erreurs de certificat ne doit être disponible qu'en environnement de test et doit générer un avertissement visible.

### 4.3. Méthodes de recherche

Deux stratégies sont possibles.

#### Recherche avec compte technique

1. VigiSensys se connecte avec un compte de service en lecture seule.
2. Il recherche le DN de l'utilisateur.
3. Il tente ensuite un bind avec le DN trouvé et le mot de passe saisi.

Cette méthode est adaptée lorsque les utilisateurs peuvent être placés dans plusieurs unités d'organisation.

#### Construction directe du compte

VigiSensys construit directement l'identité, par exemple :

```text
utilisateur@entreprise.local
ENTREPRISE\utilisateur
uid=utilisateur,ou=people,dc=entreprise,dc=local
```

Cette méthode nécessite une arborescence prévisible et homogène.

### 4.4. Paramètres nécessaires

| Paramètre | Exemple | Obligatoire |
|---|---|---:|
| Activation | `true` | Oui |
| URL LDAP | `ldaps://ad01.entreprise.local:636` | Oui |
| Base DN | `DC=entreprise,DC=local` | Oui |
| Domaine ou suffixe UPN | `entreprise.local` | Selon la méthode |
| DN du compte technique | `CN=vigisensys,OU=Services,...` | Selon la méthode |
| Secret du compte technique | Secret chiffré | Selon la méthode |
| Filtre utilisateur | `(&(objectClass=user)(sAMAccountName={username}))` | Oui |
| Attribut identifiant | `objectGUID`, `objectSid` ou DN | Oui |
| Attribut login | `sAMAccountName` ou `uid` | Oui |
| Attribut nom | `sn` | Non |
| Attribut prénom | `givenName` | Non |
| Attribut e-mail | `mail` | Non |
| Groupes autorisés | DN des groupes | Non |
| Délai de connexion | Par exemple 5 secondes | Oui |

Le mot de passe du compte technique ne doit jamais être enregistré en clair dans les logs ou dans l'interface.

---

## 5. Authentification Windows intégrée (SSO)

### 5.1. Objectif

Un utilisateur connecté à sa session Windows accède à VigiSensys sans saisir une seconde fois son mot de passe.

### 5.2. Architecture recommandée

Sur une installation Windows, la solution recommandée consiste à placer IIS devant le serveur Next.js :

```text
Navigateur du poste domaine
    -> HTTPS
    -> IIS avec authentification Windows
    -> Kerberos, avec repli NTLM si autorisé
    -> reverse proxy vers VigiSensys sur une interface interne
    -> création de la session JWT VigiSensys
```

IIS authentifie l'utilisateur puis transmet son identité au site. Le serveur Next.js ne doit pas implémenter lui-même le protocole Kerberos si l'infrastructure Windows peut le faire de manière native.

### 5.3. Prérequis

- serveur IIS joint au domaine Active Directory ;
- postes utilisateurs joints au domaine ou approuvés par celui-ci ;
- authentification Windows installée et activée dans IIS ;
- authentification anonyme désactivée sur le point d'entrée SSO ;
- nom DNS stable pour VigiSensys ;
- certificat HTTPS correspondant à ce nom DNS ;
- SPN configuré si Kerberos l'exige ;
- site déclaré comme intranet ou autorisé pour l'authentification intégrée dans les navigateurs ;
- accès direct au port Next.js interdit depuis le réseau utilisateur.

### 5.4. Transmission sécurisée de l'identité

IIS peut transmettre une identité normalisée à VigiSensys, par exemple :

```text
X-VigiSensys-Authenticated-User: ENTREPRISE\jdupont
X-VigiSensys-Authenticated-Upn: jdupont@entreprise.local
```

Ces en-têtes ne doivent être acceptés que si la requête provient du proxy de confiance.

Mesures obligatoires :

- supprimer les en-têtes entrants portant les mêmes noms avant de les recréer dans IIS ;
- limiter l'écoute de Next.js à l'interface locale ou à un réseau d'administration ;
- filtrer le port Next.js dans le pare-feu ;
- configurer explicitement les adresses des proxies de confiance ;
- ne jamais activer le SSO par simple présence d'un en-tête HTTP non vérifié ;
- journaliser l'identité Windows et l'adresse réellement transmise par le proxy.

### 5.5. Parcours utilisateur

1. L'utilisateur ouvre l'URL publique VigiSensys.
2. IIS authentifie sa session Windows.
3. VigiSensys recherche le compte local lié au SID ou à l'UPN.
4. VigiSensys vérifie que le compte n'est pas archivé et qu'il dispose d'un profil.
5. VigiSensys applique la limite de sessions prévue par la licence.
6. VigiSensys crée ses cookies JWT.
7. L'utilisateur est redirigé vers sa page autorisée.

---

## 6. Comptes et liaison avec VigiSensys

### 6.1. Colonnes proposées

Le modèle `t_utilisateur` pourra être complété par les colonnes suivantes :

| Colonne | Rôle |
|---|---|
| `Type_Authentification` | `LOCAL`, `LDAP` ou `WINDOWS_SSO` |
| `Identifiant_Externe` | SID, objectGUID, UPN ou DN stable |
| `Domaine_Authentification` | Domaine ou annuaire associé |
| `Date_Derniere_Synchronisation` | Date de la dernière synchronisation des informations |
| `Est_Provisionnement_Automatique` | Indique si le compte a été créé depuis l'annuaire |

`Mot_De_Passe` est déjà nullable, ce qui permet de ne pas stocker de mot de passe pour les comptes externes.

Une contrainte unique devra empêcher deux comptes VigiSensys de pointer vers le même identifiant externe au sein d'un même domaine.

### 6.2. Provisionnement des comptes

Trois politiques peuvent être proposées.

#### Comptes précréés uniquement

Un administrateur crée le compte VigiSensys et renseigne son identité externe. Tout utilisateur absent de VigiSensys est refusé.

Cette politique est la plus simple à auditer et la plus prudente.

#### Création automatique contrôlée

Le compte est créé lors de la première connexion uniquement si l'utilisateur appartient à un groupe autorisé. Un profil VigiSensys par défaut lui est affecté.

#### Synchronisation planifiée

Une tâche importe ou désactive périodiquement les comptes à partir des groupes de l'annuaire.

Pour une première version, la politique **comptes précréés uniquement** est recommandée.

### 6.3. Correspondance des groupes

Une évolution ultérieure pourra associer :

```text
Groupe Active Directory -> Profil VigiSensys
Groupe Active Directory -> Sites VigiSensys
Groupe Active Directory -> Groupes de lieux VigiSensys
```

Cette correspondance doit être explicite. Le nom d'un groupe ne doit pas être interprété automatiquement comme un rôle administrateur.

---

## 7. Sécurité et comportement attendu

### 7.1. Règles générales

- ne jamais stocker le mot de passe LDAP de l'utilisateur ;
- chiffrer les secrets techniques avec le mécanisme de secrets VigiSensys ;
- ne jamais inscrire un mot de passe ou un bind complet dans les logs ;
- imposer TLS pour LDAP et HTTPS pour le site ;
- appliquer une limitation de tentatives aux connexions LDAP comme aux connexions locales ;
- conserver la vérification de la limite de sessions de la licence ;
- refuser les comptes VigiSensys archivés même si l'identité externe est valide ;
- invalider les JWT lors de l'archivage ou de la révocation d'un compte ;
- appliquer des délais courts afin qu'un annuaire indisponible ne bloque pas les workers web ;
- ne pas essayer automatiquement un compte local après l'échec LDAP avec le même mot de passe, sauf parcours explicitement séparé.

### 7.2. Mot de passe et CFR21

Pour un compte externe :

- complexité du mot de passe : gérée par l'annuaire ;
- expiration du mot de passe : gérée par l'annuaire ;
- historique du mot de passe : géré par l'annuaire ;
- verrouillage après échecs : géré par l'annuaire, complété par le rate limiting VigiSensys ;
- changement de mot de passe temporaire : géré par l'annuaire.

VigiSensys ne doit pas afficher ses propres écrans de changement ou d'expiration de mot de passe pour ces comptes.

Pour un compte local, le fonctionnement CFR21 actuel reste applicable.

### 7.3. Audit

Les événements suivants doivent être journalisés :

- connexion réussie avec le fournisseur utilisé ;
- échec de connexion sans enregistrer le mot de passe ;
- annuaire indisponible ;
- certificat LDAPS invalide ou expiré ;
- compte externe valide mais compte VigiSensys absent ;
- compte VigiSensys archivé ou sans profil ;
- création ou liaison d'un compte externe ;
- modification de la correspondance entre groupes et profils ;
- utilisation du compte administrateur local de secours ;
- déconnexion et expiration de session.

Un message générique doit être présenté à l'utilisateur afin de ne pas révéler si un compte existe dans l'annuaire.

---

## 8. Configuration dans l'administration

Une page réservée aux administrateurs devra permettre de :

- choisir le mode d'authentification ;
- configurer un ou plusieurs annuaires ;
- tester la connexion réseau et TLS ;
- tester une recherche sans afficher le mot de passe ;
- définir la Base DN et le filtre utilisateur ;
- sélectionner les attributs de correspondance ;
- définir les groupes autorisés ;
- activer ou désactiver le provisionnement automatique ;
- configurer les proxies SSO de confiance ;
- afficher l'état de la dernière vérification ;
- consulter les erreurs récentes sans exposer de secret.

Toute modification de cette configuration doit être enregistrée dans l'audit.

---

## 9. Paramètres d'installation envisagés

L'installateur du site pourra proposer une section facultative **Authentification d'entreprise**.

### LDAP ou Active Directory

- URL LDAPS ;
- Base DN ;
- domaine ;
- compte de service ;
- secret du compte de service ;
- certificat ou autorité de certification ;
- filtre utilisateur ;
- bouton de test.

### SSO Windows

- URL publique HTTPS ;
- activation du SSO ;
- nom du domaine ;
- identité de l'application IIS ;
- proxy de confiance ;
- vérification des prérequis IIS ;
- rappel de la configuration SPN et navigateur.

Les paramètres sensibles ne doivent pas apparaître dans le récapitulatif final de l'installation.

---

## 10. Gestion des pannes

| Situation | Comportement attendu |
|---|---|
| LDAP indisponible | Échec rapide, message générique et audit technique |
| Certificat LDAPS invalide | Refus de connexion, sauf option de test explicitement activée |
| Utilisateur absent de VigiSensys | Refus ou provisionnement selon la politique configurée |
| Compte VigiSensys archivé | Refus systématique |
| Groupe AD retiré | Retrait au prochain login ou à la prochaine synchronisation |
| IIS/SSO indisponible | Accès local de secours par une URL d'administration protégée |
| JWT VigiSensys expiré | Nouvelle authentification SSO automatique ou retour au login LDAP |

Le repli local doit utiliser un parcours explicite, par exemple `/login/local`, inaccessible aux utilisateurs ordinaires ou limité au réseau d'administration.

---

## 11. Plan d'implémentation recommandé

### Phase 1 - Modèle commun

- ajouter les colonnes d'identité externe ;
- centraliser la création des JWT et l'enregistrement de connexion ;
- abstraire l'authentification derrière un fournisseur ;
- préserver intégralement le mode local.

### Phase 2 - LDAP et Active Directory

- implémenter LDAPS ;
- ajouter la configuration administrateur ;
- prendre en charge les comptes précréés ;
- ajouter les tests de connexion et l'audit.

### Phase 3 - SSO Windows

- documenter et automatiser la configuration IIS ;
- créer l'endpoint d'échange identité Windows vers JWT ;
- sécuriser les proxies de confiance ;
- valider Kerberos et le repli NTLM selon la politique du client.

### Phase 4 - Provisionnement et groupes

- provisionnement automatique facultatif ;
- correspondance groupes AD vers profils et périmètres ;
- synchronisation et désactivation des comptes ;
- outils de diagnostic administrateur.

---

## 12. Recette fonctionnelle

### LDAP/AD

- connexion valide ;
- mot de passe incorrect ;
- compte inconnu ;
- compte VigiSensys archivé ;
- compte sans profil ;
- annuaire indisponible ;
- certificat expiré ou non approuvé ;
- caractères spéciaux dans l'identifiant et le mot de passe ;
- limite de sessions atteinte ;
- fonctionnement MySQL et SQL Server.

### SSO Windows

- connexion Kerberos sur poste domaine ;
- connexion avec plusieurs domaines autorisés ;
- utilisateur non déclaré dans VigiSensys ;
- accès direct au port Next.js impossible ;
- en-tête forgé depuis un poste client refusé ;
- renouvellement de session ;
- déconnexion ;
- utilisation du compte local de secours ;
- fonctionnement derrière l'URL HTTPS publique.

### Audit et autorisations

- identité et fournisseur correctement enregistrés ;
- nom/prénom affichés correctement ;
- profil, sites et groupes respectés ;
- aucune donnée secrète dans les logs ;
- date et heure enregistrées avec le format VigiSensys habituel.

---

## 13. Références dans le projet

- authentification locale : `website/src/app/api/auth/login/route.ts` ;
- lecture du JWT : `website/src/lib/auth.ts` ;
- génération des JWT : `website/src/lib/jwt.ts` ;
- modèle utilisateur : `website/prisma/db-main/schema.prisma` ;
- conventions API : `website/docs/API_CONVENTIONS.md` ;
- déploiement HTTPS et reverse proxy : documentation HTTPS présente dans `vigitemp/docs`.

