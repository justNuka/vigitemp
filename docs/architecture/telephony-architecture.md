# Architecture téléphonie et alarmes vocales VigiSensys

> Statut : architecture cible et plan de validation.
>
> Baseline fonctionnelle vérifiée : `dev` au 02/09/2026. Le code actuel sait configurer plusieurs providers et dispose d'une première implémentation OVHcloud basée sur l'API Telephony / Click2Call. Cette documentation ne signifie pas que l'orchestration complète d'alarmes vocales est déjà implémentée.

## 1. Objectif

La téléphonie VigiSensys doit pouvoir évoluer d'un simple appel manuel/test vers un vrai canal d'alarme vocal industriel, tout en conservant les contraintes du produit :

- déploiement on-premise ;
- fonctionnement fiable et auditable ;
- compatibilité avec plusieurs opérateurs/providers ;
- secrets protégés ;
- pas de réimplémentation maison du protocole SIP/RTP ;
- possibilité à terme de lire un message d'alarme, gérer du DTMF et des scénarios d'escalade ;
- aucune confusion entre « appel reçu » et « acquittement métier » sans règle d'identification explicite.

## 2. État actuel du dépôt

Les briques principales se trouvent dans :

- `website/src/lib/telephony/config.ts` : configuration commune et stockage des secrets ;
- `website/src/lib/telephony/ovh-provider.ts` : provider OVHcloud Click2Call ;
- `website/src/app/api/admin/telephony/ovh/test-connection/route.ts` : test des credentials et de la ligne ;
- `website/src/app/api/admin/telephony/ovh/click2call-users/route.ts` : liste/création d'identifiants Click2Call ;
- `website/src/app/api/admin/telephony/ovh/test-call/route.ts` : appel de test ;
- `website/src/app/[locale]/(admin)/admin/parametres/_components/telephony-settings-card.tsx` : configuration dans l'administration.

Les providers déclarés actuellement sont :

- `none` ;
- `twilio` ;
- `ovhcloud` ;
- `keyyo` ;
- `asterisk`.

À la date de cette documentation, OVHcloud est le provider réellement câblé pour un test de connexion et un appel Click2Call. Les autres providers sont surtout préconfigurés côté interface/configuration.

## 3. Deux usages différents à ne pas mélanger

### 3.1 Click2Call

Le Click2Call OVHcloud met en relation deux interlocuteurs.

Flux simplifié :

```text
VigiSensys
   │ HTTPS / API OVHcloud
   ▼
OVH Click2Call
   │
   ├─ fait sonner la ligne SIP OVH
   │
   └─ après prise de ligne, appelle le destinataire
```

Cas adaptés :

- test rapide de la ligne ;
- validation des credentials API OVHcloud ;
- appels manuels depuis une interface ;
- fonction « appeler ce contact » ;
- intégration simple ne nécessitant pas de contrôle audio.

Avantages :

- très simple à intégrer ;
- pas de gestion SIP/RTP côté VigiSensys ;
- API OVHcloud déjà implémentée dans le dépôt ;
- excellent outil de validation initiale.

Limites :

- VigiSensys n'est pas directement l'interlocuteur audio ;
- pas de lecture native d'un message d'alarme généré par VigiSensys ;
- pas de maîtrise fine du flux média ;
- DTMF et scénarios vocaux avancés non adaptés au besoin cible ;
- ne constitue pas à lui seul une architecture complète d'alarme vocale automatique.

Conclusion : **Click2Call est conservé comme provider simple et comme première étape de validation, mais n'est pas la cible principale pour les alarmes vocales automatiques.**

## 4. Architecture cible recommandée pour les alarmes vocales

La cible recommandée est de déléguer la téléphonie bas niveau à un IPBX, typiquement Asterisk.

```text
                 VigiSensys
                     │
          API locale / ARI / orchestration
                     │
                     ▼
                  Asterisk
                     │
                  SIP / RTP
                     │
                     ▼
                  OVHcloud
                     │
                     ▼
            réseau téléphonique
                     │
                     ▼
              destinataire
```

### Pourquoi Asterisk

Asterisk prend en charge les sujets qui ne doivent pas être réimplémentés dans VigiSensys :

- enregistrement SIP ;
- appels sortants/entrants ;
- SDP ;
- RTP/audio ;
- codecs ;
- DTMF ;
- états d'appel ;
- temporisations et raccrochage ;
- routage ;
- files/scénarios ;
- gestion de plusieurs lignes/trunks.

VigiSensys doit rester responsable de la logique métier :

- quelle alarme déclenche un appel ;
- quel destinataire appeler ;
- quel message jouer ;
- combien de tentatives ;
- qui est ensuite contacté ;
- comment tracer le résultat ;
- ce qu'une touche DTMF signifie métier.

## 5. Ligne VoIP classique ou SIP Trunk OVHcloud

Les offres OVHcloud évoluent. Toujours vérifier le catalogue au moment de l'installation.

### Ligne VoIP classique

Adaptée pour :

- première intégration ;
- Click2Call ;
- softphone/téléphone SIP ;
- PoC Asterisk avec une seule ligne ;
- faible besoin de simultanéité.

Au 02/09/2026, le catalogue OVHcloud France affiche notamment :

- Découverte ;
- Entreprise ;
- Entreprise+.

Les offres Entreprise et Entreprise+ annoncent Click2Call dans leurs fonctionnalités. L'offre Découverte ne l'annonce pas dans la comparaison courante.

### SIP Trunk

À envisager si VigiSensys évolue vers :

- Asterisk/IPBX comme composant permanent ;
- plusieurs appels simultanés ;
- plusieurs numéros ;
- montée en charge ;
- besoin de canaux clairement dimensionnés ;
- architecture téléphonique plus centralisée.

Le SIP Trunk n'est pas obligatoire pour le premier PoC Asterisk : une ligne SIP classique peut suffire pour valider le principe.

## 6. Données OVHcloud utiles selon le mode

### 6.1 Pour Click2Call API

Nécessaire :

- endpoint OVHcloud, généralement `ovh-eu` pour un compte européen ;
- Application Key (AK) ;
- Application Secret (AS) ;
- Consumer Key (CK) ;
- billing account / groupe de téléphonie ;
- service name / ligne SIP ;
- caller ID / calling number ;
- identifiant Click2Call (ID) ;
- login/mot de passe Click2Call uniquement pour créer ou administrer cet identifiant.

Non nécessaire pour l'appel Click2Call actuel :

- mot de passe SIP ;
- registrar SIP ;
- proxy SIP sortant ;
- codec SIP.

### 6.2 Pour Asterisk

Nécessaire ou potentiellement nécessaire selon la configuration opérateur :

- login SIP ;
- authorization username ;
- mot de passe SIP ;
- registrar/domaine SIP ;
- proxy sortant ;
- codecs autorisés ;
- numéro/ligne ;
- paramètres NAT/réseau applicables ;
- éventuellement SIP Trunk et nombre de canaux si l'installation est dimensionnée ainsi.

## 7. Stratégie de sécurité

### 7.1 Secrets OVHcloud

Ne jamais :

- committer AK/AS/CK ;
- copier AS/CK dans une issue ou PR ;
- mettre ces valeurs dans des logs ;
- les envoyer dans une capture ou un canal de discussion non prévu pour les secrets.

VigiSensys stocke déjà les valeurs sensibles de téléphonie via le mécanisme `secret-crypto`.

### 7.2 Droits API

Pour un premier test, des droits limités à :

```text
GET  /telephony/*
POST /telephony/*
```

sont simples à mettre en place.

En production, réduire autant que possible aux routes nécessaires à la ligne/groupe concernés.

### 7.3 Compte Click2Call

Utiliser un compte dédié à VigiSensys, avec un mot de passe différent du mot de passe SIP et des comptes humains.

### 7.4 Asterisk

Si Asterisk est ajouté :

- ARI ne doit pas être exposé publiquement ;
- privilégier une communication locale/LAN contrôlée ;
- protéger ARI par credentials dédiés ;
- limiter les flux SIP/RTP au strict besoin ;
- documenter les règles firewall/NAT propres à l'installation ;
- ne pas inclure de mot de passe SIP dans les logs applicatifs.

## 8. Architecture applicative cible

L'orchestration voix ne doit pas être codée directement dans une route HTTP ou dans le composant React d'administration.

Cible conceptuelle :

```text
Alarm / notification event
          │
          ▼
NotificationDispatcher
          │
          ├── email
          ├── agent Windows
          ├── SMS
          └── voice
                │
                ▼
          VoiceNotificationService
                │
        ┌───────┴────────┐
        ▼                ▼
OVH Click2Call      AsteriskProvider
(simple/manual)     (alarme avancée)
```

Le provider ne décide pas :

- qui appeler ;
- si l'alarme est critique ;
- si une nouvelle tentative doit être lancée ;
- si l'alarme est acquittée.

Il exécute uniquement une opération téléphonique demandée par la couche métier.

## 9. Contrat provider cible

Le code réel sera défini quand le besoin sera implémenté. Une direction possible :

```ts
interface VoiceProvider {
  healthCheck(): Promise<VoiceProviderHealth>
  placeCall(request: VoiceCallRequest): Promise<VoiceCallHandle>
  hangup(callId: string): Promise<void>
}
```

Pour un provider avancé :

```ts
interface InteractiveVoiceProvider extends VoiceProvider {
  playAudio(callId: string, audio: AudioSource): Promise<void>
  collectDtmf(callId: string, options: DtmfOptions): Promise<DtmfResult>
}
```

Éviter de forcer Click2Call à implémenter des capacités qu'il n'a pas. La capacité interactive peut rester spécifique à Asterisk/Twilio si besoin.

## 10. Message vocal

### 10.1 Objectif

Exemple :

```text
VigiSensys.
Alarme température haute.
Site Clermont.
Chambre froide 3.
Valeur actuelle : douze virgule quatre degrés.
```

### 10.2 TTS

Pour respecter l'orientation on-premise, étudier en priorité :

- un moteur TTS local/offline ;
- cache des phrases générées si pertinent ;
- génération déterministe et testable ;
- FR/EN ;
- gestion correcte des unités et nombres.

Une solution cloud TTS peut rester optionnelle pour certains clients, mais ne doit pas devenir une dépendance obligatoire du cœur de supervision sans décision produit explicite.

### 10.3 Audio statique

Les phrases fixes peuvent aussi être préenregistrées, mais cette approche est vite limitée par les noms de lieux, valeurs et unités dynamiques.

## 11. DTMF et acquittement

Exemple d'UX future :

```text
Appuyez sur 1 pour confirmer la réception.
Appuyez sur 2 pour réécouter.
```

Important : **« confirmer la réception » et « acquitter une alarme » ne sont pas forcément la même action métier.**

Avant d'autoriser un vrai acquittement depuis le téléphone, définir :

- comment identifier l'utilisateur ;
- si le numéro appelé suffit comme identité ;
- s'il faut un PIN/code personnel ;
- quelles informations doivent être inscrites dans l'audit ;
- comment cela interagit avec CFR21 et les signatures électroniques éventuelles ;
- le comportement en cas de numéro transféré ou de messagerie vocale.

Tant que ces règles ne sont pas validées, un DTMF doit être traité au maximum comme un statut de livraison/réception et non comme un acquittement réglementaire.

## 12. Escalade d'alarme

Cible future possible :

```text
Alarme critique
   │
   ├─ appel opérateur A
   │     ├─ confirmation → stop
   │     └─ échec/timeout
   │
   ├─ appel opérateur B
   │     ├─ confirmation → stop
   │     └─ échec/timeout
   │
   └─ appel responsable / astreinte
```

Les règles d'escalade doivent être configurables et auditables. Elles ne doivent pas être encodées en dur dans le provider téléphonique.

## 13. États à journaliser

Pour un canal voix industriel, viser des statuts explicites :

- queued ;
- provider_requested ;
- ringing ;
- answered ;
- audio_playing ;
- dtmf_received ;
- completed ;
- busy ;
- no_answer ;
- rejected ;
- provider_error ;
- cancelled.

Ne pas affirmer qu'un appel a été « reçu » uniquement parce que la requête API de création d'appel a répondu 200.

## 14. Simultanéité et capacité

La capacité dépend de l'offre opérateur et du nombre de canaux/appels simultanés autorisés.

À prévoir :

- file d'attente si toutes les ressources voix sont occupées ;
- priorité des alarmes critiques ;
- limite de tentatives ;
- protection contre une boucle d'appels ;
- métriques de saturation ;
- comportement lorsque le fournisseur téléphonique ou Internet est indisponible.

## 15. Résilience

La téléphonie ne doit pas devenir l'unique canal d'alarme sauf exigence projet explicite.

Une panne :

- Internet ;
- OVHcloud ;
- Asterisk ;
- SIP ;
- ligne opérateur ;

ne doit pas empêcher les autres canaux disponibles (Agent, email, SMS, etc.) de fonctionner.

## 16. Roadmap proposée

### TEL-0 — Documentation et onboarding OVH

- document d'architecture ;
- guide opérateur OVHcloud ;
- aide embarquée dans Administration > Téléphonie.

### TEL-1 — Validation réelle OVH Click2Call

- générer AK/AS/CK ;
- configurer billingAccount/serviceName ;
- test connexion ;
- créer/lister l'utilisateur Click2Call ;
- appel test ;
- vérifier caller ID et facturation ;
- documenter les erreurs réelles OVH rencontrées.

### TEL-2 — Durcissement du provider OVH

Après retour du test réel :

- normalisation des numéros si nécessaire ;
- messages d'erreur plus lisibles ;
- sélection d'un utilisateur Click2Call existant si utile ;
- tests automatisés sur la signature et la validation de configuration ;
- limitation fine des permissions API documentées.

### TEL-3 — PoC Asterisk + ligne SIP OVH

Critères de succès :

1. Asterisk s'enregistre correctement auprès d'OVH ;
2. VigiSensys déclenche un appel via ARI ;
3. un téléphone externe sonne ;
4. lecture d'un fichier audio de test ;
5. réception d'une touche DTMF ;
6. journalisation complète du résultat.

### TEL-4 — VoiceNotificationService

- service applicatif dédié ;
- mapping alarmes/destinataires ;
- génération du message ;
- TTS ou audio ;
- timeouts et retries ;
- livraison/audit.

### TEL-5 — Escalade et réception DTMF

- scénarios d'astreinte ;
- politiques de confirmation ;
- décision séparée sur l'acquittement métier.

### TEL-6 — Industrialisation

- MySQL + SQL Server ;
- installateur ;
- sauvegarde/restauration config ;
- monitoring ;
- sécurité réseau ;
- documentation client ;
- tests de charge/simultanéité ;
- validation terrain.

## 17. Checklist avant une PR téléphonie

- [ ] vérifier le HEAD courant de `dev` ;
- [ ] lire cette documentation ;
- [ ] vérifier l'implémentation réelle du provider ;
- [ ] aucun secret dans Git/logs ;
- [ ] droits API minimaux ;
- [ ] test avec numéros non facturés/maîtrisés si possible ;
- [ ] ne pas changer les règles d'acquittement sans validation métier ;
- [ ] ne pas implémenter SIP/RTP directement dans VigiSensys ;
- [ ] vérifier FR/EN ;
- [ ] documenter les prérequis réseau ;
- [ ] vérifier l'effet sur les autres canaux de notification.

## 18. Références OVHcloud vérifiées le 02/09/2026

Documentation officielle :

- offres VoIP : https://www.ovhcloud.com/fr/phone/voip/
- SIP Trunk : https://www.ovhcloud.com/fr/phone/sip-trunk/
- Click2Call : https://docs.ovhcloud.com/fr/guides/web-cloud/phone-and-fax/voip/configurer-utiliser-click2call
- premiers pas API / AK-AS-CK : https://docs.ovhcloud.com/fr/guides/manage-and-operate/api/first-steps
- FAQ VoIP : https://docs.ovhcloud.com/fr/guides/web-cloud/phone-and-fax/voip/faq-voip

Les noms de menus, tarifs et fonctionnalités commerciales peuvent évoluer. Pour une installation client, toujours recouper avec le catalogue OVHcloud au moment du déploiement.
