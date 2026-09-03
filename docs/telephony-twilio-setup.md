# Configuration Twilio pour les appels d'alarme VigiSensys

> Statut : guide d'installation et de validation du PoC Twilio V1.
>
> Vérifié avec la documentation Twilio disponible au **02/09/2026**.
>
> Les offres, tarifs, règles réglementaires et écrans Twilio peuvent évoluer. Toujours revalider les pages officielles liées dans ce document avant une installation de production.

## 1. Objectif

La V1 Twilio doit permettre à VigiSensys de déclencher un appel vocal automatique sans installer de système téléphonique supplémentaire chez le client.

Architecture retenue :

```text
Sondes
  │
  ▼
Vigitemp Serveur C#
  │
  │ événement d'alarme
  ▼
VigiSensys Web / notification queue
  │
  │ HTTPS sortant 443
  ▼
Twilio du client
  │
  ├── appel téléphonique
  └── synthèse vocale (TTS)
        │
        ▼
Téléphone d'astreinte
```

Pour le premier PoC implémenté dans l'administration :

```text
Administration → Téléphonie
        │
        ├── Tester la connexion
        │       └── HTTPS → Twilio REST API
        │
        └── Tester l'appel
                └── HTTPS → Twilio → appel → TTS fr-FR
```

Le message de test est envoyé directement sous forme de **TwiML inline** à Twilio. Twilio n'a donc aucune URL VigiSensys à appeler pour lire le message.

## 2. Pourquoi Twilio est le provider recommandé pour la V1

Comparé à une architecture SIP/Asterisk, Twilio évite au client d'avoir à déployer ou administrer :

- une VM Linux supplémentaire ;
- Asterisk / FreePBX ;
- un trunk ou compte SIP à configurer dans un IPBX ;
- UDP 5060 ;
- une plage RTP ;
- des redirections NAT ;
- SIP ALG ;
- une IP publique dédiée ;
- un service téléphonique supplémentaire sur Windows.

La V1 nécessite uniquement une connexion HTTPS sortante depuis le serveur VigiSensys.

Asterisk reste disponible dans le dépôt comme provider avancé/on-premise et comme solution possible pour certains projets spécifiques, mais il n'est plus considéré comme un prérequis standard pour tous les clients.

## 3. Propriété du compte et facturation

Le modèle recommandé est :

```text
Client A
└── compte Twilio A
    ├── numéro A
    ├── API Key A
    └── facturation A

Client B
└── compte Twilio B
    ├── numéro B
    ├── API Key B
    └── facturation B
```

MC2 ne doit pas :

- posséder le compte Twilio de production à la place du client ;
- acheter les minutes pour les refacturer ;
- partager une API Key entre plusieurs clients ;
- utiliser un même numéro Twilio pour plusieurs installations indépendantes sauf décision commerciale/contractuelle explicite.

Le client doit pouvoir conserver son compte, son historique Twilio, ses moyens de paiement et ses credentials indépendamment de MC2.

## 4. Prérequis à transmettre au service informatique du client

Cette section est prévue pour être envoyée telle quelle à la DSI avant l'installation.

### 4.1 Flux réseau requis — Twilio V1

Le serveur ou la VM Windows hébergeant VigiSensys doit disposer de :

| Sens | Protocole | Port | Destination | Usage |
| --- | --- | ---: | --- | --- |
| Sortant | HTTPS / TCP | 443 | `api.twilio.com` | REST API Twilio : test, création et suivi des appels |
| Sortant | DNS | selon infrastructure client | DNS d'entreprise / public | résolution de `api.twilio.com` |

Twilio indique que la REST API utilise **HTTPS sur le port standard TCP 443**.

Référence :

- <https://help.twilio.com/articles/360007130274-Requirements-for-Connecting-to-the-Twilio-REST-API-and-Troubleshooting-Common-Issues>

### 4.2 Flux qui ne sont PAS requis pour la V1

Ne pas ouvrir pour Twilio V1 :

- aucun port entrant depuis Internet ;
- aucune redirection NAT vers VigiSensys ;
- aucun port SIP `5060` ;
- aucune plage RTP UDP ;
- aucun port WebSocket public ;
- aucun port Twilio Voice SDK ;
- aucune IP publique dédiée au serveur VigiSensys.

La VM client initie elle-même la connexion HTTPS vers Twilio.

### 4.3 Filtrage par domaine plutôt que par IP

Twilio précise que les IP utilisées par sa REST API proviennent d'une infrastructure cloud dynamique et peuvent changer.

Ne pas construire une règle de production basée sur une petite liste d'IP Twilio copiée à un instant donné.

Préférer :

```text
api.twilio.com
```

Si la politique DSI le permet et si de futures fonctions Twilio doivent être ajoutées, une autorisation plus large sur :

```text
*.twilio.com
```

peut simplifier les évolutions, mais **`api.twilio.com` suffit pour le PoC REST V1 actuel**.

Twilio recommande également que le cache DNS respecte ses TTL ; la documentation REST mentionne actuellement un TTL de 60 secondes.

### 4.4 TLS et certificats

La machine doit permettre :

- TLS 1.2 ou TLS 1.3 ;
- la validation d'une chaîne de certificats publique de confiance ;
- l'accès HTTPS à Twilio sans certificat auto-signé injecté de manière incompatible avec le trust store utilisé par le runtime VigiSensys.

Ne pas faire de certificate pinning sur le certificat courant de Twilio.

### 4.5 Proxy d'entreprise

Si le client impose un proxy HTTP/HTTPS explicite, authentifié ou une inspection TLS :

1. le signaler avant l'installation ;
2. vérifier que le processus serveur VigiSensys peut réellement joindre `https://api.twilio.com/` ;
3. valider la chaîne de certificats vue par le runtime ;
4. valider les credentials/propriétés proxy nécessaires à l'environnement Windows du client.

Le premier PoC n'ajoute pas encore de page de configuration proxy spécifique à Twilio.

Une installation nécessitant un proxy applicatif explicite doit donc faire l'objet d'un test réseau sur le serveur réel avant activation des alarmes vocales.

### 4.6 Autres prérequis système recommandés

- DNS fonctionnel ;
- heure Windows synchronisée ;
- certificats racine système à jour ;
- sortie Internet stable ;
- aucun antivirus/EDR bloquant le processus Node/VigiSensys lorsqu'il ouvre une connexion HTTPS vers Twilio.

## 5. Compte Twilio : qui doit le créer ?

Le compte doit être créé par ou pour **l'entreprise cliente**.

Recommandations :

- utiliser une adresse mail professionnelle du client ;
- activer la MFA ;
- éviter un compte attaché à l'adresse personnelle d'un prestataire ou d'un salarié unique ;
- identifier au moins deux administrateurs lorsque la politique du client le permet ;
- configurer directement les moyens de paiement du client pour la production ;
- configurer des alertes de consommation/budget Twilio.

Console :

- <https://console.twilio.com/>

## 6. Compte Trial ou compte de production

### 6.1 Trial

Un compte Trial est utile pour prouver rapidement l'accès à l'API.

Contraintes Twilio documentées :

- les appels sont limités à des destinataires vérifiés ;
- le nombre de destinataires vérifiés est limité ;
- un message Twilio d'essai peut être joué avant le message VigiSensys ;
- les appels sont limités géographiquement ;
- certaines fonctions sont limitées ;
- le Trial expire.

Référence :

- <https://www.twilio.com/docs/usage/trials/try-out-voice>

Pour une validation de production, utiliser un compte payant et le numéro définitif.

## 7. France : attention au type de numéro émetteur

Ce point est critique.

Un numéro Twilio français classique ne peut pas forcément être utilisé pour un appel automatique VigiSensys.

La page **France Regulatory Guidelines** de Twilio indique actuellement :

| Type | Préfixes / famille | Automated Outbound Calling |
| --- | --- | --- |
| Local polyvalent | `+331` à `+335` | interdit |
| Mobile | `+336`, `+337…` | interdit |
| National polyvalent | `+339` classique | interdit |
| Verified Polyvalent — NPV | notamment `+3316229`, `+33948353`, `+33948194` | autorisé |

Référence officielle :

- <https://www.twilio.com/en-us/guidelines/fr/regulatory>
- <https://www.twilio.com/en-us/legal/service-country-specific-terms/france-phone-numbers>

### 7.1 Recommandation VigiSensys France

Pour un client français en production :

1. indiquer à Twilio que le besoin est **un appel sortant automatisé d'alarme** ;
2. demander/commander un numéro dont l'usage prescrit autorise explicitement **Automated Outbound Calling** ;
3. privilégier le type **Verified Polyvalent / NPV** lorsque disponible ;
4. fournir les justificatifs entreprise / KYC demandés ;
5. attendre l'activation et la validation réglementaire avant le déploiement production.

Les préfixes et disponibilités peuvent évoluer : ne jamais coder une liste de préfixes NPV dans la logique métier comme règle permanente.

### 7.2 Numéro inbound-enabled

La page Twilio France indique également des contraintes d'usage autour des appels one-way.

Le numéro choisi doit donc rester conforme au produit acheté et à ses capacités. VigiSensys V1 **n'a pas besoin de traiter les appels entrants**, mais cela ne signifie pas qu'il faut commander un numéro réglementairement « outbound-only ».

Le type de numéro et son usage doivent être validés avec Twilio au moment de la commande.

## 8. Créer les credentials dédiés à VigiSensys

### 8.1 Valeurs nécessaires

Pour le mode recommandé :

```text
Account SID
API Key SID
API Key Secret
Numéro Twilio émetteur
```

Formats typiques :

```text
Account SID  ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
API Key SID  SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Le **Secret** est une valeur sensible et ne doit jamais être mise dans Git ou dans cette documentation.

### 8.2 Pourquoi API Key plutôt que Auth Token

Twilio recommande l'utilisation des API Keys pour les applications.

Avantages :

- credential dédié à VigiSensys ;
- révocable indépendamment ;
- rotation plus simple ;
- pas besoin d'exposer l'Auth Token principal du compte ;
- possibilité d'utiliser une Restricted API Key pour le moindre privilège.

Références :

- <https://www.twilio.com/docs/iam/api-keys>
- <https://www.twilio.com/docs/iam/api-keys/keys-in-console>

### 8.3 Standard ou Restricted ?

Pour le **premier PoC**, une API Key **Standard dédiée** est recommandée afin de réduire les variables de diagnostic.

Une Standard Key :

- n'accède pas aux ressources de gestion `Accounts` / `Keys` ;
- peut utiliser les autres APIs Twilio, dont Voice.

C'est la raison pour laquelle le bouton **Tester la connexion** VigiSensys ne lit pas la ressource `/Accounts/{sid}` : il lit une page minimale de la collection `Calls`.

Après validation, une **Restricted API Key** peut être créée.

Pour l'implémentation actuelle, elle doit au minimum permettre :

- lecture des Calls — utilisée par `Tester la connexion` et plus tard par le polling de statut ;
- création des Calls — utilisée par `Tester l'appel` et les futures alarmes.

L'intitulé exact des permissions peut évoluer dans la console ; sélectionner les permissions Voice / Call Resource correspondant à la lecture et à la création.

Référence :

- <https://www.twilio.com/docs/iam/api-keys/restricted-api-keys>

### 8.4 Création dans la console

Chemin courant Twilio :

```text
Console
→ Account management
→ API keys & tokens
→ Create API key
```

Nom conseillé :

```text
VigiSensys Voice
```

Après la création :

1. copier l'API Key SID ;
2. copier immédiatement le Secret ;
3. stocker le Secret dans le coffre de secrets prévu par le client ;
4. saisir ensuite directement les valeurs dans VigiSensys ;
5. ne jamais envoyer le Secret dans un email, Teams, ticket, screenshot, issue ou PR.

## 9. Configuration dans VigiSensys

Dans :

```text
Administration
→ Paramètres
→ Téléphonie
```

sélectionner :

```text
Fournisseur : Twilio
```

### 9.1 Méthode recommandée

```text
API Key SID + Secret
```

### 9.2 Champs

| Champ VigiSensys | Source Twilio | Secret |
| --- | --- | --- |
| Account SID | compte Twilio | non |
| API Key SID | API Key VigiSensys | non |
| API Key Secret | secret généré lors de la création | **oui** |
| Numéro Twilio émetteur | numéro Voice actif | non |

Le numéro doit être au format **E.164** :

```text
+33...
```

La V1 Twilio refuse volontairement les formats techniques ambigus tels que :

```text
0033...
06...
```

Le format normalisé évite de laisser le provider deviner le pays.

### 9.3 Auth Token

Le mode :

```text
Account SID + Auth Token
```

reste présent pour compatibilité/test.

Il n'est pas recommandé comme configuration standard de production si une API Key dédiée peut être utilisée.

### 9.4 Enregistrement

Toujours cliquer sur :

```text
Enregistrer
```

avant de lancer les tests.

Les routes de test lisent la configuration persistée côté serveur, pas simplement les valeurs actuellement visibles dans le formulaire navigateur.

Les secrets Twilio utilisent le mécanisme de chiffrement téléphonie existant (`secret-crypto`).

## 10. Tester la connectivité DSI avant Twilio

Depuis le serveur VigiSensys Windows :

```powershell
Test-NetConnection api.twilio.com -Port 443
```

Résultat attendu :

```text
TcpTestSucceeded : True
```

Tester le DNS :

```powershell
Resolve-DnsName api.twilio.com
```

Une IP précise retournée aujourd'hui ne doit pas être ajoutée comme dépendance permanente au firewall.

Si le port 443 échoue, ne modifier ni l'API Key ni le numéro : corriger d'abord le chemin réseau/proxy.

## 11. Tester la connexion depuis VigiSensys

Après sauvegarde de la configuration Twilio :

```text
Tester la connexion
```

VigiSensys appelle :

```text
GET https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Calls.json?PageSize=1
```

Authentification :

```text
HTTP Basic
username = API Key SID
password = API Key Secret
```

ou, si le mode legacy est sélectionné :

```text
username = Account SID
password = Auth Token
```

Le test ne crée aucun appel.

Il valide principalement :

- DNS ;
- HTTPS 443 ;
- TLS ;
- proxy/firewall ;
- Account SID ;
- credentials ;
- permission de lecture Voice/Calls.

## 12. Premier appel de test

### 12.1 Numéro de destination

Saisir un numéro de test maîtrisé au format E.164 :

```text
+33612345678
```

### 12.2 Déclenchement

Cliquer :

```text
Tester l'appel
```

VigiSensys effectue :

```text
POST https://api.twilio.com/2010-04-01/Accounts/{AccountSid}/Calls.json
```

avec :

```text
To    = numéro de test
From  = numéro Twilio configuré
Twiml = instructions vocales inline
```

Le PoC envoie conceptuellement :

```xml
<Response>
  <Say language="fr-FR">
    Ceci est un appel de test VigiSensys.
    La connexion téléphonique fonctionne correctement.
  </Say>
</Response>
```

Twilio documente `fr-FR` pour `<Say>`.

Références :

- <https://www.twilio.com/docs/voice/api/call-resource>
- <https://www.twilio.com/docs/voice/twiml/say/text-speech>

### 12.3 Résultat attendu

```text
VigiSensys
  │ HTTPS
  ▼
Twilio
  │
  ▼
téléphone sonne
  │
  ▼
décroché
  │
  ▼
message TTS VigiSensys
  │
  ▼
fin de l'appel
```

L'API retourne un `Call SID` de type :

```text
CAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Ce SID sera la clé technique du futur suivi d'appel.

## 13. Erreurs fréquentes

### 13.1 401 / 403

Vérifier :

- Account SID ;
- API Key SID ;
- API Key Secret ;
- type de key ;
- permissions Restricted Key ;
- région Twilio si une configuration régionale spécifique a été choisie.

### 13.2 Timeout / aucune réponse HTTP

Vérifier :

- connexion Internet ;
- `api.twilio.com` ;
- DNS ;
- TCP 443 ;
- proxy ;
- inspection TLS ;
- EDR / antivirus ;
- certificats racine Windows.

### 13.3 From number rejected

Vérifier :

- numéro bien rattaché au compte Twilio ;
- format `+...` ;
- activation Voice ;
- conformité France / NPV ;
- compte Trial ou production ;
- règles spécifiques du compte.

### 13.4 Destination refusée sur un Trial

Un Trial Twilio limite les appels aux destinataires vérifiés.

Ajouter/vérifier le numéro dans l'environnement de test Twilio ou passer le compte en production selon le besoin.

### 13.5 Appel international ou destination bloquée

Vérifier les **Geographic Permissions** Twilio avant de considérer l'erreur comme un bug VigiSensys.

### 13.6 Le téléphone sonne mais aucun message VigiSensys n'est lu

Consulter :

```text
Twilio Console → Monitor / Logs → Voice / Calls
```

Rechercher le `Call SID` retourné par VigiSensys et contrôler l'exécution du TwiML `<Say>`.

## 14. Sécurité

### 14.1 Secrets

Sont secrets :

- API Key Secret ;
- Auth Token ;
- futurs secrets de webhook/callback si ajoutés.

Ne sont pas des mots de passe, mais doivent rester maîtrisés :

- Account SID ;
- API Key SID ;
- numéro Twilio.

Ne jamais :

- committer un Secret ;
- le mettre dans un seed SQL ;
- le mettre en paramètre d'un script partagé ;
- l'afficher dans un log ;
- le copier dans une issue/PR ;
- le laisser visible dans une capture d'écran.

### 14.2 Rotation

En cas d'exposition :

1. révoquer l'API Key Twilio ;
2. en créer une nouvelle ;
3. mettre à jour VigiSensys ;
4. vérifier les appels/consommations inhabituels ;
5. conserver la trace de l'incident selon la politique du client.

### 14.3 Permissions

Après validation du PoC :

- utiliser une Restricted API Key si possible ;
- autoriser uniquement les opérations nécessaires ;
- ne pas donner à VigiSensys des permissions de gestion du compte ou de la facturation.

## 15. Pourquoi il n'y a aucun webhook en V1

Le premier lot utilise du TwiML inline.

Donc Twilio n'a besoin d'aucune URL publique VigiSensys pour :

- créer l'appel ;
- prononcer le message ;
- terminer l'appel.

Cela permet de conserver :

```text
Serveur client
    │
    └── HTTPS sortant uniquement
```

sans :

```text
Internet
  └── connexion entrante vers la VM client
```

## 16. Suivi de statut sans webhook

Twilio retourne un `Call SID` lors de la création de l'appel.

La V1 métier pourra donc d'abord utiliser du **polling** :

```text
Call SID
  │
  ▼
GET Call Resource
  │
  ▼
queued / ringing / in-progress / completed / busy / failed / no-answer / canceled
```

Cela permet de construire une queue et un historique robustes sans infrastructure publique supplémentaire.

Pour les changements temps réel, Twilio recommande les Status Callbacks, mais ils ne sont pas nécessaires au premier lot.

## 17. Future V2 : DTMF / « Appuyez sur 1 »

Le DTMF avec `<Gather>` nécessitera une URL publique d'action/callback.

Cette V2 sera traitée séparément.

Architecture envisagée :

```text
Twilio
  │ callback HTTPS signé
  ▼
relay public VigiSensys/MC2
  │
  │ canal établi depuis l'installation client
  ▼
VigiSensys client
```

Contraintes à définir avant implémentation :

- validation `X-Twilio-Signature` ;
- absence de stockage cloud des credentials Twilio client si possible ;
- association sûre Call SID ↔ alarme ↔ destinataire ;
- expiration/replay protection ;
- audit ;
- définition métier de « confirmation de réception » ;
- règles CFR21 avant de transformer une touche en acquittement réglementaire.

**Une touche 1 ne doit pas être considérée automatiquement comme un acquittement d'alarme tant que ces règles ne sont pas validées.**

## 18. Intégration future au moteur d'alarmes VigiSensys

Le provider Twilio ne doit pas être appelé directement dans la boucle d'interrogation des sondes.

Le repo possède déjà :

- `AlarmWebNotifier.cs` côté serveur C# ;
- `/api/alarmes/dispatch` ;
- une logique de notifications et de queue email.

Cible :

```text
Alarme détectée
  │
  ▼
AlarmWebNotifier / dispatch
  │
  ▼
notification VOICE persistée
  │
  ▼
worker de notifications
  │
  ▼
TwilioVoiceProvider
```

Bénéfices :

- une panne Twilio ne bloque jamais l'interrogation des sondes ;
- retry contrôlé ;
- déduplication ;
- historique ;
- priorités ;
- limites de simultanéité ;
- observabilité ;
- possibilité de changer de provider sans modifier le moteur de mesure.

## 19. Checklist d'installation client

### Compte / conformité

- [ ] compte Twilio créé au nom du client ;
- [ ] MFA activée ;
- [ ] Trial compris ou compte de production activé ;
- [ ] numéro compatible avec l'usage d'appel automatisé confirmé ;
- [ ] KYC/réglementation France validés ;
- [ ] moyen de paiement et alertes de consommation configurés.

### Credentials

- [ ] Account SID récupéré ;
- [ ] API Key dédiée VigiSensys créée ;
- [ ] API Key SID récupéré ;
- [ ] API Key Secret sauvegardé dans un emplacement sécurisé ;
- [ ] permissions Voice/Calls suffisantes ;
- [ ] aucun secret transmis à MC2 dans un canal non prévu pour les secrets.

### DSI / réseau

- [ ] DNS fonctionne depuis la VM VigiSensys ;
- [ ] `api.twilio.com` est résolu ;
- [ ] TCP 443 sortant est autorisé ;
- [ ] proxy/inspection TLS validés si présents ;
- [ ] TLS 1.2/1.3 disponible ;
- [ ] aucun port entrant ouvert pour Twilio V1 ;
- [ ] aucune règle SIP/RTP ajoutée inutilement.

### VigiSensys

- [ ] provider Twilio sélectionné ;
- [ ] Account SID renseigné ;
- [ ] API Key SID renseigné ;
- [ ] API Key Secret renseigné ;
- [ ] numéro Twilio `+...` renseigné ;
- [ ] configuration enregistrée ;
- [ ] Test connexion OK ;
- [ ] Test appel OK ;
- [ ] message français entendu ;
- [ ] Call SID visible dans la réponse/log Twilio ;
- [ ] aucun secret visible dans les logs.

## 20. Critères de validation du PoC Twilio

Le premier lot est validé sur un environnement réel quand :

- [ ] aucune infrastructure supplémentaire n'a été installée sur la VM client ;
- [ ] la seule ouverture réseau spécifique est HTTPS sortant ;
- [ ] une API Key dédiée fonctionne ;
- [ ] VigiSensys teste la connexion ;
- [ ] VigiSensys déclenche un appel ;
- [ ] le téléphone destinataire sonne ;
- [ ] le message TTS `fr-FR` est entendu ;
- [ ] le Call SID est retourné ;
- [ ] le numéro présenté est conforme à l'attendu ;
- [ ] la tarification réelle est vérifiée ;
- [ ] la réglementation/numérotation France est validée pour le numéro de production ;
- [ ] le fonctionnement avec le firewall/proxy réel du client est validé.

## 21. Documentation officielle Twilio

- Console : <https://console.twilio.com/>
- REST API / authentification : <https://www.twilio.com/docs/usage/requests-to-twilio>
- API Keys : <https://www.twilio.com/docs/iam/api-keys>
- Créer une API Key : <https://www.twilio.com/docs/iam/api-keys/keys-in-console>
- Restricted API Keys : <https://www.twilio.com/docs/iam/api-keys/restricted-api-keys>
- REST API réseau / firewall : <https://help.twilio.com/articles/360007130274-Requirements-for-Connecting-to-the-Twilio-REST-API-and-Troubleshooting-Common-Issues>
- Calls API : <https://www.twilio.com/docs/voice/api/call-resource>
- TwiML `<Say>` / TTS : <https://www.twilio.com/docs/voice/twiml/say/text-speech>
- Trial Voice : <https://www.twilio.com/docs/usage/trials/try-out-voice>
- France Regulatory Guidelines : <https://www.twilio.com/en-us/guidelines/fr/regulatory>
- France Phone Number Terms : <https://www.twilio.com/en-us/legal/service-country-specific-terms/france-phone-numbers>

## 22. État de l'implémentation au terme de ce lot

Implémenté :

- configuration Twilio existante réutilisée ;
- secrets API Key / Auth Token chiffrés par le mécanisme téléphonie ;
- validation des champs requis ;
- provider REST `TwilioVoiceProvider` ;
- test de connexion Twilio ;
- appel sortant de test ;
- TTS inline `fr-FR` ;
- Call SID retourné ;
- aide Twilio intégrée dans l'administration ;
- aucun SDK/dépendance Twilio ajouté ;
- aucune ouverture réseau entrante requise.

Non implémenté dans ce lot :

- queue Voice métier ;
- branchement automatique aux alarmes ;
- choix des contacts par lieu ;
- templates dynamiques site/lieu/sonde/valeur/seuil ;
- retry/escalade ;
- polling périodique des Call SID ;
- callbacks ;
- DTMF ;
- acquittement ;
- service public MC2.

Ces fonctions doivent être ajoutées par lots séparés après validation terrain du PoC.
