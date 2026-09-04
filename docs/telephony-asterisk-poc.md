# PoC Asterisk + ligne SIP OVHcloud

> Statut : TEL-3 — preuve de concept technique.
>
> Ce document décrit un environnement de validation. Il ne constitue pas encore le packaging final d'installation VigiSensys.

## 1. Objectif

Valider la chaîne cible de téléphonie vocale :

```text
VigiSensys Web
    │ ARI HTTP
    ▼
Asterisk
    │ SIP / RTP
    ▼
OVHcloud
    │
    ▼
Téléphone destinataire
```

Le premier PoC doit prouver que :

1. Asterisk démarre avec une configuration reproductible ;
2. Asterisk s'enregistre auprès de la ligne SIP OVHcloud ;
3. VigiSensys joint Asterisk via ARI ;
4. VigiSensys demande un appel sortant ;
5. le téléphone destinataire sonne ;
6. après décroché, Asterisk joue un message audio local ;
7. l'appel est raccroché proprement.

Le moteur d'alarmes, l'escalade, les événements ARI temps réel et le DTMF sont volontairement hors de ce PoC.

## 2. Pourquoi abandonner Click2Call comme voie principale

Le test réel du 02/09/2026 a validé l'authentification API OVHcloud et la création d'un utilisateur Click2Call, mais l'appel a retourné :

```json
{"message":"Can't use this function with this offer."}
```

L'offre actuelle ne fournit donc pas la fonction Click2Call. Comme l'architecture cible des alarmes vocales nécessite de toute façon le contrôle du média, Asterisk/SIP devient la voie prioritaire au lieu de faire évoluer l'offre uniquement pour valider Click2Call.

Click2Call peut rester un provider secondaire si un futur client dispose d'une offre compatible.

## 3. Prérequis

### Machine Asterisk

Pour le PoC, utiliser une machine Linux avec Docker Engine et Docker Compose.

Recommandation :

- VM Ubuntu/Debian ou petit serveur Linux sur le même LAN que VigiSensys ;
- adresse LAN stable ;
- sortie Internet vers OVHcloud ;
- accès à l'adresse publique/NAT du site.

Le PoC Docker n'est pas une recommandation de déployer Docker Desktop sur un serveur Windows de production. Le packaging final sera décidé après validation TEL-3.

### Informations OVHcloud nécessaires

Les captures OVHcloud fournissent déjà normalement :

- Login / User name SIP ;
- Authorization user name ;
- Domain / Registrar ;
- Proxy sortant ;
- codecs autorisés.

Il faut en plus récupérer le **mot de passe SIP de la ligne** depuis OVHcloud.

Ne jamais :

- mettre le mot de passe SIP dans Git ;
- le mettre dans une issue ou PR ;
- le copier dans les logs VigiSensys ;
- utiliser le même mot de passe pour ARI.

Les clés API OVHcloud AK/AS/CK ne sont pas nécessaires au fonctionnement SIP/Asterisk lui-même.

## 4. Fichiers du PoC

Le bundle est dans :

```text
deploy/asterisk-poc/
├── Dockerfile
├── docker-compose.yml
├── docker-entrypoint.sh
├── .env.example
└── templates/
    ├── ari.conf.template
    ├── extensions.conf.template
    ├── http.conf.template
    ├── pjsip.conf.template
    └── rtp.conf.template
```

Le vrai fichier `.env` est ignoré par Git.

## 5. Préparer l'environnement

Sur la machine Linux :

```bash
git clone <repo VigiSensys>
cd vigitemp/deploy/asterisk-poc
cp .env.example .env
```

Modifier ensuite `.env`.

Exemple générique :

```dotenv
OVH_SIP_USERNAME=0033XXXXXXXXX
OVH_SIP_AUTH_USERNAME=0033XXXXXXXXX
OVH_SIP_PASSWORD=<mot de passe SIP OVH>
OVH_SIP_DOMAIN=sip-domain.io
OVH_SIP_OUTBOUND_PROXY=<groupe>.sip-proxy.io

ASTERISK_EXTERNAL_ADDRESS=<IPv4 publique du site>
ASTERISK_LOCAL_NET=192.168.0.0/16

ASTERISK_ARI_USERNAME=vigisensys
ASTERISK_ARI_PASSWORD=<mot de passe ARI dédié>

VIGISENSYS_TEST_MESSAGE=Ceci est un appel de test VigiSensys.
```

### Login SIP et Authorization user name

Si OVHcloud affiche la même valeur pour les deux champs, renseigner cette même valeur dans :

```dotenv
OVH_SIP_USERNAME=...
OVH_SIP_AUTH_USERNAME=...
```

Ne pas confondre avec :

- Billing Account ;
- Application Key ;
- Consumer Key ;
- utilisateur Click2Call.

## 6. Réseau, NAT et firewall

Le PoC expose :

| Port | Protocole | Usage |
| --- | --- | --- |
| 5060 | UDP | SIP |
| 8088 | TCP | ARI HTTP |
| 10000-10100 | UDP | RTP/audio |

### ARI 8088

Le port 8088 doit être accessible depuis VigiSensys, mais **ne doit pas être publié sur Internet**.

Limiter le firewall au LAN et idéalement à l'IP du serveur VigiSensys.

### SIP/RTP

Si Asterisk se trouve derrière un routeur/NAT :

1. renseigner l'adresse publique dans `ASTERISK_EXTERNAL_ADDRESS` ;
2. rediriger UDP 5060 vers la machine Asterisk ;
3. rediriger UDP 10000-10100 vers la machine Asterisk ;
4. vérifier qu'aucun autre équipement SIP n'utilise déjà ces ports.

Une erreur de NAT peut produire :

- appel qui sonne mais sans audio ;
- audio dans un seul sens ;
- déconnexion rapide après décroché.

## 7. Démarrer Asterisk

Depuis `deploy/asterisk-poc` :

```bash
docker compose up -d --build
```

Vérifier :

```bash
docker compose ps
```

Puis ouvrir la console Asterisk :

```bash
docker compose exec asterisk asterisk -rvvv
```

## 8. Vérifier l'enregistrement SIP OVHcloud

Dans la console Asterisk :

```text
pjsip show registrations
```

Résultat attendu : l'enregistrement `ovh-registration` doit être en état `Registered`.

Vérifier aussi :

```text
pjsip show endpoint ovh
pjsip show aor ovh-aor
```

### Si `Rejected` / `Forbidden`

Vérifier en priorité :

- mot de passe SIP ;
- Authorization user name ;
- Login SIP ;
- registrar ;
- proxy sortant ;
- espaces ou caractères copiés autour des secrets.

### Si timeout

Vérifier :

- DNS ;
- accès Internet ;
- firewall sortant ;
- UDP 5060 ;
- résolution du registrar/proxy OVHcloud.

## 9. Vérifier ARI sans VigiSensys

Depuis une machine autorisée sur le LAN :

```bash
curl -u 'vigisensys:<mot-de-passe-ARI>' \
  http://<IP-ASTERISK>:8088/ari/asterisk/info
```

Une réponse JSON Asterisk valide confirme que :

- HTTP Asterisk fonctionne ;
- ARI est chargé ;
- les credentials ARI sont corrects ;
- le firewall LAN autorise VigiSensys à joindre Asterisk.

## 10. Configuration dans VigiSensys

Dans :

```text
Administration
→ Paramètres
→ Téléphonie
```

Sélectionner :

```text
Fournisseur : Asterisk
```

Renseigner :

### URL ARI

```text
http://<IP-LAN-ASTERISK>:8088/ari
```

Exemple :

```text
http://192.168.1.50:8088/ari
```

### Utilisateur ARI

La valeur de :

```dotenv
ASTERISK_ARI_USERNAME
```

### Mot de passe ARI

La valeur de :

```dotenv
ASTERISK_ARI_PASSWORD
```

### Nom d'application ARI

Conserver pour le moment :

```text
vigisensys
```

Ce champ servira surtout au prochain lot avec événements ARI/Stasis. Le premier PoC utilise volontairement un contexte dialplan après décroché.

Enregistrer la configuration avant les tests.

## 11. Tester la connexion Asterisk dans VigiSensys

Cliquer :

```text
Tester la connexion
```

VigiSensys appelle :

```text
GET /ari/asterisk/info
```

avec l'authentification Basic ARI.

Résultat attendu : toast de succès avec la version Asterisk si elle est retournée.

Si erreur 401 :

- utilisateur ARI incorrect ;
- mot de passe ARI incorrect.

Si connexion refusée / timeout :

- mauvaise IP ;
- conteneur arrêté ;
- port 8088 bloqué ;
- ARI non démarré.

## 12. Tester un appel depuis VigiSensys

Dans `Numéro de test`, saisir un numéro que l'équipe maîtrise.

Formats acceptés par le PoC :

```text
+33612345678
0033612345678
```

Le provider supprime les espaces, parenthèses, points et tirets mais n'effectue pas de conversion métier entre `+33` et `0033`.

Cliquer :

```text
Tester l'appel
```

VigiSensys demande à ARI d'originer :

```text
PJSIP/<numero>@ovh
```

Après décroché, Asterisk exécute :

```text
[vigisensys-test]
Answer()
Wait(1)
Playback(custom/vigisensys-test)
Hangup()
```

Résultat attendu :

1. le portable sonne ;
2. décrocher ;
3. entendre « Ceci est un appel de test VigiSensys » ;
4. Asterisk raccroche.

## 13. Message de test local

Le conteneur génère le WAV au démarrage avec `espeak-ng` puis le convertit en mono 8 kHz avec `sox`.

Cela valide dès le PoC qu'un message peut être généré localement/offline.

Ce mécanisme n'est pas encore le choix TTS de production. Le lot futur devra comparer qualité, licences, performances, FR/EN et génération de valeurs/unités.

## 14. Codecs

Le PoC active seulement :

```text
alaw
ulaw
```

c'est-à-dire G.711.

Même si la ligne OVHcloud annonce également G.729, ne pas l'activer tant que son support et ses contraintes dans le packaging Asterisk ne sont pas explicitement validés.

## 15. Logs utiles

Console Asterisk :

```bash
docker compose exec asterisk asterisk -rvvv
```

Augmenter temporairement le debug SIP :

```text
pjsip set logger on
```

Le désactiver ensuite :

```text
pjsip set logger off
```

Ne pas publier les logs bruts si ceux-ci contiennent des informations d'authentification ou des données client.

## 16. Critères de validation TEL-3

- [ ] image Docker Asterisk construite ;
- [ ] conteneur healthy ;
- [ ] `pjsip show registrations` indique `Registered` ;
- [ ] ARI répond depuis le serveur VigiSensys ;
- [ ] test connexion Asterisk VigiSensys réussi ;
- [ ] appel sortant déclenché via VigiSensys ;
- [ ] téléphone destinataire sonne ;
- [ ] audio entendu dans le bon sens ;
- [ ] message local joué en entier ;
- [ ] raccrochage correct ;
- [ ] numéro présenté vérifié ;
- [ ] absence d'exposition publique du port ARI ;
- [ ] logs récupérés en cas d'échec.

## 17. Étape suivante après succès

Une fois TEL-3 validé, ne pas brancher immédiatement le provider aux alarmes métier.

Le lot suivant devra ajouter :

1. connexion WebSocket ARI aux événements Stasis ;
2. états `ringing`, `answered`, `completed`, `busy`, `no_answer`, etc. ;
3. contrôle du playback depuis VigiSensys ;
4. DTMF ;
5. abstraction `VoiceProvider` / `InteractiveVoiceProvider` ;
6. tests automatisés du provider ;
7. seulement ensuite, orchestration avec le moteur de notifications/alarmes.
