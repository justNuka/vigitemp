# Architecture téléphonie et alarmes vocales VigiSensys

> Statut : architecture cible et plan de validation.
>
> Baseline fonctionnelle vérifiée : `dev` après merge de la PR #84, au 02/09/2026.
>
> Cette documentation décrit la direction produit. L'orchestration complète des appels d'alarme n'est pas encore implémentée tant que les lots Twilio/queue correspondants ne sont pas mergés.

## 1. Objectif

La téléphonie VigiSensys doit devenir un canal d'alarme supplémentaire, au même niveau que les autres notifications, sans transformer VigiSensys en PBX ou en implémentation SIP maison.

Principes :

- VigiSensys reste on-premise ;
- le fournisseur de voix porte la complexité téléphonique ;
- la détection des alarmes ne doit jamais être bloquée par un appel ;
- chaque client doit pouvoir posséder son propre compte/fournisseur et sa propre facturation ;
- les secrets restent protégés ;
- la V1 doit rester simple à installer sur les VM Windows existantes ;
- les scénarios futurs DTMF/escalade restent possibles ;
- une confirmation téléphonique ne devient jamais un acquittement réglementaire sans règle métier/audit explicite.

## 2. État réel du dépôt

Providers déclarés :

- `none` ;
- `twilio` ;
- `ovhcloud` ;
- `keyyo` ;
- `asterisk`.

Briques déjà présentes :

- `website/src/lib/telephony/config.ts` : configuration commune et stockage chiffré des secrets ;
- provider OVHcloud Click2Call ;
- provider Asterisk ARI / PoC TEL-3 ;
- interface Administration > Paramètres > Téléphonie ;
- préconfiguration Twilio (Account SID, API Key, Auth Token, From number) ;
- `AlarmWebNotifier.cs` côté serveur C# ;
- `/api/alarmes/dispatch` côté Web ;
- queue de notifications email existante, utile comme modèle de résilience.

Retours terrain/PoC :

1. OVH API : authentification AK/AS/CK validée ;
2. création d'un utilisateur Click2Call validée ;
3. appel Click2Call réel refusé par l'offre testée avec `Can't use this function with this offer.` ;
4. un PoC Asterisk reproductible a été mergé en PR #84 ;
5. l'obligation d'une infrastructure Linux/Asterisk supplémentaire est considérée trop lourde comme prérequis standard pour la majorité des clients VigiSensys ;
6. la direction recommandée V1 devient donc **Twilio Programmable Voice via API HTTPS**.

## 3. Architecture recommandée V1 — Twilio

```text
Sondes
  │
  ▼
Vigitemp Serveur C#
  │
  │ événement d'alarme
  ▼
VigiSensys Web
  │
  ▼
queue de notifications VOICE
  │
  │ HTTPS sortant TCP 443
  ▼
Twilio du client
  │
  ├── appel PSTN
  └── TTS / TwiML
        │
        ▼
Téléphone destinataire
```

### Pourquoi Twilio devient le provider recommandé

Pour le client standard :

- pas de VM Linux supplémentaire ;
- pas d'Asterisk/FreePBX ;
- pas de SIP ;
- pas de RTP ;
- pas de NAT téléphonie ;
- pas de port entrant ;
- pas d'IP publique dédiée ;
- pas de driver ou softphone ;
- seulement HTTPS sortant depuis le serveur VigiSensys.

Twilio prend en charge :

- l'établissement de l'appel ;
- le réseau téléphonique ;
- le TTS ;
- les statuts d'appel ;
- le DTMF/TwiML dans les futures versions ;
- la capacité et les limites opérateur associées au compte.

VigiSensys reste responsable de :

- décider quelle alarme déclenche un appel ;
- sélectionner les destinataires ;
- construire le message ;
- gérer la file, les retries et l'escalade ;
- journaliser les résultats ;
- appliquer les règles métier d'acquittement.

## 4. Modèle commercial recommandé

Chaque installation utilise le **compte Twilio du client**.

```text
Client
└── Twilio
    ├── compte
    ├── numéro
    ├── API Key
    └── facturation
```

MC2 ne doit pas devenir revendeur de minutes par défaut.

Bénéfices :

- facturation directe au client ;
- séparation des données/comptes ;
- révocation/rotation indépendantes ;
- pas de partage de quota entre clients ;
- départ/réversibilité plus simples.

## 5. Réseau client — V1

Le guide opératoire canonique est :

- [`../telephony-twilio-setup.md`](../telephony-twilio-setup.md)

Pour la V1 :

```text
sortant HTTPS TCP 443 → api.twilio.com
```

Aucun flux entrant n'est nécessaire.

Ne pas demander au client pour Twilio V1 :

- UDP 5060 ;
- RTP ;
- port forwarding ;
- WebSocket public ;
- IP publique ;
- VM Linux.

Les IP REST Twilio étant dynamiques, préférer une règle FQDN à une allowlist IP figée.

## 6. France — numérotation réglementaire

Le choix du numéro ne doit pas être traité comme un simple détail d'UI.

Au 02/09/2026, les règles Twilio France indiquent que les numéros classiques locaux/mobile/nationaux ne sont pas tous autorisés pour `Automated Outbound Calling`.

Twilio documente le type **Verified Polyvalent / NPV** pour cet usage, avec notamment des préfixes dédiés à la date de vérification.

Règle produit :

- ne jamais coder en dur « n'importe quel +33 fonctionne » ;
- guider le client vers un numéro explicitement autorisé pour l'appel automatisé ;
- revalider la réglementation/catalogue à chaque installation ;
- conserver les informations de conformité/KYC dans le périmètre Twilio/client, pas dans le code VigiSensys.

## 7. Authentification Twilio

Configuration recommandée :

```text
Account SID
API Key SID
API Key Secret
Twilio From Number
```

Préférer une API Key dédiée à VigiSensys plutôt que l'Auth Token principal.

Le code conserve le mode Auth Token pour compatibilité/test.

Après validation :

- préférer une Restricted API Key lorsque possible ;
- accorder uniquement les permissions Voice/Calls nécessaires ;
- rotation/révocation sans impact sur les autres applications du compte.

Les secrets restent stockés via `secret-crypto`.

## 8. PoC Twilio sans webhook

Le premier lot utilise le paramètre `Twiml` inline de la Calls API.

Exemple conceptuel :

```xml
<Response>
  <Say language="fr-FR">
    Ceci est un appel de test VigiSensys.
  </Say>
</Response>
```

Conséquence :

- Twilio n'appelle aucune URL publique VigiSensys pour lire le message ;
- aucune ouverture Internet entrante client ;
- aucune infrastructure MC2 publique nécessaire pour la V1.

## 9. Architecture applicative — ne pas appeler Twilio depuis la boucle de mesure

À éviter :

```text
Thread d'interrogation / calcul alarme
       │
       └── appel HTTP Twilio bloquant
```

Cible :

```text
Alarme détectée
       │
       ▼
AlarmWebNotifier / dispatch existant
       │
       ▼
notification VOICE persistée en BDD
       │
       ▼
worker / processor de notifications
       │
       ▼
VoiceNotificationService
       │
       ▼
TwilioVoiceProvider
```

Le serveur C# signale l'événement ; il ne doit pas porter les retries Twilio dans la boucle matérielle.

Le modèle de queue email existant doit être étudié/réutilisé plutôt que créer une deuxième infrastructure de queue sans raison.

## 10. Contrat provider cible

Le provider exécute une demande téléphonique ; il ne contient pas les règles d'escalade.

Direction :

```ts
interface VoiceProvider {
  healthCheck(): Promise<VoiceProviderHealth>
  placeCall(request: VoiceCallRequest): Promise<VoiceCallHandle>
  getCallStatus(callId: string): Promise<VoiceCallStatus>
  cancelCall?(callId: string): Promise<void>
}
```

Capacités additionnelles futures :

```ts
interface InteractiveVoiceProvider extends VoiceProvider {
  // callbacks / DTMF / playback interactif selon provider
}
```

Ne pas forcer OVH Click2Call à simuler des capacités qu'il n'a pas.

## 11. Construction du message vocal

Exemple cible :

```text
VigiSensys.
Alarme température haute.
Site Clermont.
Lieu Chambre froide numéro 3.
Valeur actuelle : neuf virgule quatre degrés.
Seuil maximum : huit degrés.
```

Le message doit être construit côté métier VigiSensys à partir de données structurées.

À prévoir :

- FR/EN ;
- unités ;
- nombres/décimales ;
- noms de site/lieu/sonde ;
- type d'alarme ;
- valeur et seuil ;
- limite de longueur ;
- données éventuellement sensibles à ne pas vocaliser selon client.

Le provider Twilio ne doit pas connaître la façon de calculer un seuil ou le sens d'une alarme.

## 12. État des appels sans webhook — V1

La création d'un appel retourne un `Call SID`.

La première version métier peut utiliser du polling :

```text
queued
ringing
in-progress
completed
busy
failed
no-answer
canceled
```

Cela suffit pour :

- historiser le résultat ;
- décider d'un retry ;
- décider de passer au destinataire suivant ;
- éviter une infrastructure publique prématurée.

Pour les événements temps réel à grande échelle, les callbacks Twilio restent la cible future.

## 13. Queue et résilience

La queue doit être persistante.

Propriétés minimales d'une notification Voice :

- identifiant ;
- alarme ;
- destinataire ;
- provider ;
- statut ;
- compteur de tentative ;
- prochaine tentative ;
- Call SID provider ;
- erreur provider normalisée ;
- date de création/début/fin ;
- snapshot du message ou données nécessaires à sa reconstruction.

Règles :

- une panne Internet/Twilio ne bloque pas l'interrogation ;
- retries bornés ;
- backoff ;
- pas de boucle d'appels infinie ;
- idempotence/déduplication ;
- priorité possible pour alarmes critiques ;
- quota/simultanéité contrôlés ;
- logs sans secrets.

## 14. Contacts et stratégie métier

À terme, le lieu/configuration d'alarme pourra définir :

```text
Téléphonie activée : oui/non
Contacts :
  1. astreinte
  2. responsable
  3. direction
Stratégie :
  - tous les contacts
  - séquentiel
  - séquentiel jusqu'à confirmation
```

Ces règles appartiennent à VigiSensys, pas à Twilio.

Le champ existant `Est_Via_Telephone` doit être réexaminé avec les modèles lieu/alarme avant implémentation afin de réutiliser l'existant proprement.

## 15. DTMF et acquittement — hors V1

Future UX possible :

```text
Appuyez sur 1 pour confirmer la réception.
Appuyez sur 2 pour réécouter.
```

Twilio `<Gather>` nécessite une action/callback public.

Comme les installations VigiSensys ne doivent pas être exposées directement sur Internet, la cible devra être conçue séparément, potentiellement :

```text
Twilio
  │ webhook HTTPS signé
  ▼
relay public MC2 minimal
  │
  │ canal initié depuis le client
  ▼
VigiSensys on-premise
```

Avant toute implémentation :

- validation `X-Twilio-Signature` ;
- anti-replay ;
- association Call SID/alarme/contact ;
- confidentialité ;
- haute disponibilité du relay ;
- responsabilité contractuelle ;
- règles CFR21/audit.

**Une touche DTMF n'est pas automatiquement un acquittement réglementaire.**

## 16. Positionnement des autres providers

### Twilio

**Provider recommandé V1** pour les installations disposant d'Internet sortant.

Usage :

- alarmes vocales automatisées ;
- TTS ;
- statuts ;
- future interactivité.

### Asterisk

**Provider avancé/on-premise optionnel**.

Utile lorsque :

- le client possède déjà un IPBX/SIP ;
- une exigence projet impose une téléphonie locale ;
- Twilio/cloud n'est pas acceptable ;
- une intégration téléphonique spécifique justifie l'infrastructure.

Le PoC TEL-3 mergé reste valable et n'est pas supprimé.

### OVHcloud Click2Call

**Provider simple/manual/legacy**.

Peut rester utile si :

- offre compatible ;
- besoin de mise en relation simple ;
- appel manuel ;
- pas de TTS/interactivité avancée.

Ne pas le considérer comme équivalent à Twilio Programmable Voice.

### Keyyo

Préconfiguration uniquement tant qu'une implémentation réelle n'est pas ajoutée.

## 17. Sécurité

Règles communes :

- aucun secret dans Git ;
- aucun secret dans les changelogs/docs ;
- aucun secret dans les logs ;
- credentials dédiés par client/provider ;
- rotation possible ;
- moindre privilège ;
- audit des changements de configuration ;
- test de connexion réservé à l'administration.

Twilio :

- API Key dédiée ;
- Secret chiffré ;
- budget/usage alerts côté client ;
- permissions Voice limitées après PoC.

Asterisk :

- ARI limité au LAN ;
- mot de passe SIP hors VigiSensys si possible ;
- SIP/RTP filtrés.

## 18. Disponibilité et dépendance Internet

Twilio introduit une dépendance à :

- Internet ;
- Twilio ;
- réseau téléphonique.

La téléphonie ne doit donc pas être l'unique canal par défaut.

Une panne voix ne doit pas bloquer :

- email ;
- Agent Windows ;
- Teams ;
- autres mécanismes d'alarme.

L'UI devra présenter clairement un échec du canal voix sans transformer l'alarme métier en échec global.

## 19. Roadmap révisée

### TEL-0 — Documentation/provider framework

Fait :

- configuration multi-provider ;
- guide OVH ;
- architecture téléphonie.

### TEL-1 — OVH Click2Call réel

Partiellement validé :

- API credentials OK ;
- user Click2Call créé ;
- offre testée incompatible avec l'appel.

Pas prioritaire pour la V1.

### TEL-3 — Asterisk SIP/ARI

PoC mergé en PR #84.

Statut : provider avancé optionnel, pas prérequis client standard.

### TEL-TW-1 — PoC Twilio standalone

Objectif :

- documentation client/DSI ;
- test connexion ;
- appel de test ;
- TTS `fr-FR` inline ;
- Call SID ;
- aucun webhook ;
- aucun SDK/dépendance supplémentaire.

### TEL-TW-2 — Queue Voice

- réutiliser l'architecture de dispatch existante ;
- persistance BDD ;
- worker ;
- polling des Call SID ;
- retries ;
- déduplication ;
- historique.

### TEL-TW-3 — Configuration métier

- contacts par lieu/alarme ;
- `Est_Via_Telephone` ;
- stratégie séquentielle/parallèle ;
- message dynamique ;
- horaires ;
- permissions/licence si applicable.

### TEL-TW-4 — Callbacks / DTMF

- relay public si retenu ;
- signature Twilio ;
- temps réel ;
- touche 1 / réécoute.

### TEL-TW-5 — Escalade et acquittement

- identité ;
- audit ;
- CFR21 ;
- règles d'escalade ;
- tests de non-régression.

## 20. Definition of Done du PoC Twilio

Avant de poursuivre TEL-TW-2 :

- [ ] compte de test réel ;
- [ ] contraintes Trial/production comprises ;
- [ ] règle France/numéro vérifiée ;
- [ ] HTTPS 443 depuis une VM Windows VigiSensys ;
- [ ] API Key dédiée ;
- [ ] test connexion OK ;
- [ ] appel sortant OK ;
- [ ] TTS français entendu ;
- [ ] Call SID récupéré ;
- [ ] aucun port entrant ;
- [ ] aucun secret loggé ;
- [ ] tarif réel d'un appel mesuré ;
- [ ] comportement proxy/firewall client documenté ;
- [ ] limites CPS/simultanéité du compte identifiées avant dimensionnement.

## 21. Documents canoniques

- `docs/architecture/telephony-architecture.md` — décision d'architecture et roadmap.
- `docs/telephony-twilio-setup.md` — onboarding client/DSI Twilio.
- `docs/telephony-ovh-setup.md` — provider OVHcloud/Click2Call.
- `docs/telephony-asterisk-poc.md` — provider avancé Asterisk/SIP.

Toute évolution importante de la stratégie téléphonie doit mettre à jour ce document dans la même PR.
