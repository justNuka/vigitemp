# Téléphonie Twilio — cible production, interactivité et acquittement

> Statut : **DECISION_COMMERCIALE_EN_ATTENTE**.
>
> Dernière vérification : **07/09/2026**.
>
> Le PoC Twilio Trial est validé. La décision de passage sur un compte payant et le choix du numéro de production sont volontairement reportés jusqu'au retour du responsable.
>
> Les offres, tarifs, règles réglementaires et capacités Twilio peuvent évoluer. Revalider les références officielles avant toute commande ou mise en production.

## 1. Contexte validé

Le PoC actuel a validé la chaîne :

```text
VigiSensys
  │
  │ HTTPS REST
  ▼
Twilio Trial
  │
  ▼
Réseau téléphonique
  │
  ▼
Téléphone vérifié
```

Éléments déjà confirmés :

- compte Twilio Trial réel ;
- numéro Trial réel ;
- API Key dédiée VigiSensys ;
- test de connexion depuis VigiSensys ;
- création d'un appel depuis VigiSensys ;
- réception réelle de l'appel sur le numéro vérifié ;
- fallback Trial vers le template Twilio autorisé ;
- aucune ouverture de port entrant sur l'installation VigiSensys pour ce PoC.

Le TTS VigiSensys personnalisé en `Twiml` inline reste à valider sur un compte complet, le Trial imposant des paramètres/templates spécifiques pour la création d'appel.

Référence de validation :

- `website/docs/telephony-twilio-trial-validation-04-09-2026.md`

## 2. Offre Twilio recommandée pour VigiSensys

Pour le besoin VigiSensys standard, la cible retenue est :

```text
Compte Twilio client
+ Programmable Voice
+ paiement à l'utilisation (Pay-as-you-go)
+ numéro autorisé pour les appels automatisés
```

Aucun besoin identifié à ce stade pour :

- Twilio Flex ;
- un produit de centre de contact complet ;
- Elastic SIP Trunking comme prérequis standard ;
- une infrastructure Asterisk chez chaque client.

Le modèle **Pay-as-you-go / Programmable Voice** permet de payer principalement les appels, le numéro et les éventuelles fonctions Voice utilisées, sans engagement nécessaire pour le cas standard.

Référence officielle :

- https://www.twilio.com/fr-fr/voice/pricing/fr

### 2.1 Propriété du compte

Le modèle recommandé reste :

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

MC2 ne devient pas revendeur de minutes par défaut.

## 3. France — numéro de production

Le type de numéro doit être validé avant commande.

Au 07/09/2026, les règles Twilio France indiquent que les numéros locaux `+331` à `+335`, mobiles `+336/+337...` et nationaux `+339` classiques ne sont pas prévus pour `Automated Outbound Calling`.

Twilio documente en revanche le type **Verified Polyvalent / NPV** pour les appels sortants automatisés, avec notamment les familles de préfixes documentées à cette date :

```text
+3316229...
+33948353...
+33948194...
```

Ces préfixes ne doivent **jamais être codés en dur** dans VigiSensys : ils servent uniquement de référence documentaire et peuvent évoluer.

Avant production :

1. demander un numéro dont l'usage autorise explicitement les appels automatisés ;
2. privilégier un numéro **Verified Polyvalent / NPV** si c'est toujours la catégorie adaptée au moment de la commande ;
3. compléter les éléments entreprise/KYC/réglementaires demandés par Twilio ;
4. attendre la validation du numéro avant d'activer les alarmes téléphoniques.

Référence officielle :

- https://www.twilio.com/en-us/guidelines/fr/regulatory

## 4. Ordre de grandeur des coûts

Tarifs publics indicatifs vus au 07/09/2026 pour la France :

| Élément | Tarif indicatif |
| --- | ---: |
| Appel vers fixe France | environ `0,0187 $/min` |
| Appel vers mobile France depuis l'EEE | environ `0,0404 $/min` |
| Numéro local Twilio | environ `1,35 $/mois` lorsque ce type est applicable |
| TTS Premium Standard | environ `0,0008 $ / 100 caractères` |
| TTS Premium Neural | environ `0,0032 $ / 100 caractères` |
| TTS Premium Generative | environ `0,0130 $ / 100 caractères` |

Ces chiffres servent uniquement au dimensionnement initial. Toujours revalider la page tarifaire Twilio avant chiffrage commercial.

## 5. Besoin métier cible

Le scénario métier envisagé est plus riche qu'un simple appel de test.

Pour une alarme associée à un lieu :

1. déterminer si le canal téléphonique est activé ;
2. récupérer un ou plusieurs destinataires configurés ;
3. appeler selon la stratégie du lieu ;
4. lire un message dynamique ;
5. demander éventuellement un code utilisateur ;
6. récupérer les chiffres saisis ;
7. vérifier le code côté VigiSensys ;
8. appliquer la règle métier d'acquittement si le code est valide ;
9. répondre vocalement à l'utilisateur ;
10. historiser le résultat complet.

Exemple :

```text
VigiSensys.
Alarme température haute.
Site Lille.
Lieu Chambre froide numéro 2.
Valeur actuelle : douze virgule quatre degrés.
Entrez votre code d'acquittement.
```

Puis :

```text
Code valide
→ acquittement appliqué côté VigiSensys
→ "L'alarme a bien été acquittée. Merci."
→ fin de l'appel
```

ou :

```text
Code invalide
→ pas d'acquittement
→ "Code incorrect. Veuillez réessayer."
→ nouvelle saisie bornée ou fin d'appel selon la règle métier
```

## 6. DTMF — saisie du code par téléphone

Twilio fournit le verbe TwiML `<Gather>` pour collecter les touches DTMF.

Exemple conceptuel :

```xml
<Response>
  <Gather input="dtmf" numDigits="4" action="https://.../voice/code" method="POST">
    <Say language="fr-FR">Entrez votre code d'acquittement.</Say>
  </Gather>
</Response>
```

Après la saisie, Twilio envoie notamment :

```text
CallSid=CA...
Digits=1234
```

à l'URL `action`.

L'URL renvoie ensuite un nouveau document TwiML. Le même appel peut donc continuer dynamiquement :

- code correct → message de confirmation puis fin ;
- code incorrect → message d'erreur puis nouveau `<Gather>` ;
- délai dépassé → répétition ou fin ;
- choix complémentaire → réécoute, transfert, etc.

Référence officielle :

- https://www.twilio.com/docs/voice/twiml/gather

## 7. Point d'architecture important — `<Gather>` nécessite une URL joignable par Twilio

Le PoC actuel et la première version non interactive ont un avantage important : VigiSensys peut fonctionner uniquement avec des connexions HTTPS **sortantes** vers `api.twilio.com`.

Une interaction DTMF change ce point : Twilio doit pouvoir envoyer le résultat du `<Gather>` à une URL HTTPS.

Il ne faut pas répondre à ce besoin en exposant directement chaque serveur VigiSensys on-premise sur Internet.

### 7.1 Cible recommandée à étudier

```text
Téléphone
   │ DTMF
   ▼
Twilio
   │ webhook HTTPS signé
   ▼
Relais public minimal / Twilio Function
   │
   │ état court / résultat de saisie
   ▼
Canal de récupération initié par VigiSensys
   │ HTTPS sortant
   ▼
VigiSensys on-premise
```

Deux familles de solutions restent à comparer avant implémentation :

### Option A — relais public MC2 minimal

Le relais reçoit les callbacks Twilio, valide leur authenticité, conserve uniquement l'état nécessaire et permet à l'installation on-premise de récupérer le résultat via un canal initié depuis l'intérieur.

Avantages :

- maîtrise complète du protocole VigiSensys ;
- découplage du fournisseur ;
- possibilité d'une architecture commune à d'autres providers futurs.

Contraintes :

- service public à héberger et superviser ;
- haute disponibilité ;
- sécurité et isolation multi-client ;
- gestion de la rétention minimale ;
- responsabilité d'exploitation MC2.

### Option B — Twilio Functions pour la logique de premier niveau

Twilio Functions peut héberger une URL HTTPS et produire du TwiML. Une Function **Protected** peut être limitée aux requêtes portant une signature Twilio valide.

Cela peut simplifier :

- les réponses TwiML intermédiaires ;
- les `<Gather>` ;
- les messages de confirmation/erreur ;
- une partie de l'état temporaire.

Cela ne résout pas à lui seul la synchronisation sécurisée du résultat avec VigiSensys on-premise. Il faudra toujours définir comment VigiSensys récupère ou confirme la décision métier sans exposer la VM client.

Référence :

- https://www.twilio.com/docs/serverless/functions-assets/visibility

## 8. Sécurité des callbacks Twilio

Twilio signe ses requêtes avec l'en-tête :

```text
X-Twilio-Signature
```

Une URL publique recevant des événements Voice doit valider cette signature avant de traiter les données.

Twilio recommande d'utiliser ses mécanismes/SDK de validation plutôt que de réimplémenter manuellement l'algorithme.

Points obligatoires avant production interactive :

- HTTPS avec certificat public valide ;
- validation `X-Twilio-Signature` ;
- association stricte `CallSid` ↔ alarme ↔ contact ↔ installation ;
- token/identifiant opaque, jamais un identifiant BDD devinable seul ;
- expiration courte des états temporaires ;
- anti-rejeu/idempotence ;
- limitation du nombre d'essais de code ;
- logs sans secret ni code en clair si le code est sensible ;
- séparation stricte des clients si un relais MC2 est mutualisé ;
- audit de la décision d'acquittement.

Référence officielle :

- https://www.twilio.com/docs/usage/webhooks/webhooks-security

## 9. Acquittement : distinction réception / acquittement métier

Un appui sur une touche ou la saisie d'un code ne doit pas être considéré automatiquement comme un acquittement réglementaire.

Il faut distinguer au minimum :

```text
appel reçu
≠ personne identifiée
≠ alarme prise en compte
≠ acquittement VigiSensys valide
```

Si la saisie téléphonique doit réellement acquitter une alarme :

- le code doit permettre d'identifier ou d'autoriser l'utilisateur selon la règle retenue ;
- VigiSensys reste la source de vérité de l'acquittement ;
- les permissions de l'utilisateur doivent être vérifiées ;
- l'alarme doit encore être acquittable au moment du traitement ;
- la date/heure, l'utilisateur, le canal téléphonique, le `CallSid` et le résultat doivent être journalisés ;
- les exigences CFR21/audit existantes doivent être réexaminées avant activation.

## 10. Plusieurs numéros par lieu

Les stratégies suivantes sont envisageables :

### Séquentielle

```text
Contact 1
   ├── acquitté → STOP
   └── échec / pas de réponse
          ▼
Contact 2
   ├── acquitté → STOP
   └── échec / pas de réponse
          ▼
Contact 3
```

### Parallèle

Plusieurs appels sont déclenchés en même temps ou presque.

À prévoir si cette stratégie est retenue :

- déduplication de l'acquittement ;
- annulation/fin des appels encore actifs après un acquittement valide ;
- concurrence sur la même alarme ;
- limites CPS et simultanéité du compte Twilio.

### Recommandation initiale

Commencer par une stratégie **séquentielle** est plus simple à auditer et limite les appels inutiles. La stratégie définitive doit être validée avec le besoin client.

## 11. Queue Voice obligatoire

La téléphonie ne doit jamais être appelée directement depuis la boucle d'interrogation des sondes.

Cible :

```text
Alarme détectée
   │
   ▼
Dispatch VigiSensys
   │
   ▼
Queue VOICE persistante
   │
   ▼
Worker
   │
   ▼
TwilioVoiceProvider
```

La queue devra au minimum gérer :

- alarme ;
- lieu ;
- destinataire ;
- message/snapshot ;
- tentative ;
- prochaine tentative ;
- statut ;
- `CallSid` ;
- erreur normalisée ;
- dates création/début/fin ;
- déduplication ;
- backoff ;
- arrêt après acquittement si la stratégie le prévoit.

## 12. Licence VigiSensys

Toute cette fonctionnalité reste conditionnée par l'option de licence :

```text
telephonie
```

L'absence de l'option doit continuer à empêcher côté serveur :

- la configuration du provider ;
- les tests ;
- les futurs appels métier ;
- les futurs endpoints d'interaction/acquittement liés à la téléphonie.

Le verrouillage UI n'est jamais suffisant seul.

## 13. Étapes à reprendre au retour du responsable

Aucune commande Twilio de production n'est nécessaire avant validation commerciale.

À reprendre dans cet ordre :

1. valider le modèle **compte Twilio client + Pay-as-you-go / Programmable Voice** ;
2. valider le type de numéro France autorisé pour `Automated Outbound Calling` ;
3. vérifier les documents/KYC nécessaires au client pilote ;
4. upgrader le compte de test ou créer le compte de production pilote ;
5. valider le vrai TTS VigiSensys en `Twiml` inline ;
6. implémenter la queue Voice et le polling des statuts ;
7. brancher les contacts/configurations des lieux ;
8. valider la stratégie séquentielle/parallèle ;
9. décider si le code DTMF confirme seulement la réception ou acquitte réellement l'alarme ;
10. choisir l'architecture publique pour `<Gather>` : relais MC2, Twilio Functions, ou combinaison ;
11. implémenter l'interactivité avec audit et sécurité ;
12. effectuer une validation terrain complète avant activation client.

## 14. Décisions encore ouvertes

- compte payant pilote : upgrade du compte de test ou nouveau compte dédié ;
- type exact de numéro français disponible au moment de la commande ;
- voix TTS et formulation métier ;
- ordre/stratégie des contacts ;
- nombre d'essais de code ;
- définition exacte du code d'acquittement ;
- distinction confirmation de réception / acquittement réglementaire ;
- relais public MC2 vs Twilio Functions ;
- politique de retry/escalade ;
- politique de conservation des traces téléphoniques.

## 15. Références internes

- `docs/architecture/telephony-architecture.md` — architecture globale et roadmap.
- `docs/telephony-twilio-setup.md` — installation/configuration Twilio.
- `website/docs/telephony-twilio-trial-validation-04-09-2026.md` — validation terrain du Trial.
- `website/src/lib/telephony/twilio-provider.ts` — provider Twilio actuel.
- `website/src/lib/license-guards.ts` — garde licence téléphonie.
