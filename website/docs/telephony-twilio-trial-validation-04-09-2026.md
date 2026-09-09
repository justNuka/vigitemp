# Téléphonie Twilio — validation compte Trial — 04/09/2026

## Statut

`VALIDE_TRIAL` — correctif mergé via PR #94, validation terrain confirmée le **07/09/2026**.

## Contexte

Le PoC Twilio V1 utilisait jusqu'ici le chemin production de la Calls API :

```text
POST /2010-04-01/Accounts/{AccountSid}/Calls.json
To=...
From=...
Twiml=<Response><Say ...>...</Say></Response>
Timeout=30
```

Un premier test réel a été effectué avec un compte Twilio Trial créé le 04/09/2026 :

- l'appel lancé depuis `Products > Voice > Try out Voice` fonctionne ;
- le numéro Trial présenté par Twilio appelle correctement le numéro français vérifié ;
- une API Key dédiée VigiSensys a été créée ;
- le test de connexion VigiSensys atteint bien l'API Twilio ;
- le premier appel VigiSensys a été refusé avec :

```text
Invalid or disallowed parameters provided - trial accounts have limited parameter access, upgrade your account to unlock full functionality
```

Aucun credential, numéro complet ou secret opérationnel n'est conservé dans ce document.

## Cause vérifiée

La documentation Twilio Trial actuelle limite les paramètres utilisables lors de la création d'un appel REST.

Pour un compte Trial, Twilio demande notamment d'utiliser l'un de ses templates Voice hébergés, par exemple :

```text
https://webhooks.twilio.com/v1/Voice/Template/voice_text_to_speech
```

Le `Twiml` inline et les paramètres supplémentaires du chemin production ne doivent donc pas être envoyés lors de ce fallback Trial.

Références officielles :

- https://www.twilio.com/docs/usage/trials/try-out-voice
- https://www.twilio.com/docs/usage/trials
- https://www.twilio.com/docs/voice/api/call-resource

## Correctif retenu

Le comportement production n'est pas remplacé par le comportement Trial.

`TwilioVoiceProvider.triggerTestCall()` :

1. tente toujours le vrai chemin VigiSensys avec `Twiml` inline/TTS `fr-FR` et `Timeout=30` ;
2. si Twilio retourne précisément une erreur HTTP 400 contenant `trial accounts have limited parameter access`, effectue une seule seconde tentative ;
3. cette seconde tentative conserve `To` et `From` mais remplace les instructions par :

```text
Url=https://webhooks.twilio.com/v1/Voice/Template/voice_text_to_speech
```

4. le fallback Trial n'envoie ni `Twiml` ni `Timeout` ;
5. toute autre erreur Twilio est remontée telle quelle et ne déclenche aucun retry automatique.

Le résultat expose :

```text
testMode = vigisensys_tts
```

ou :

```text
testMode = twilio_trial_template
```

L'interface affiche un message spécifique lorsque le template Trial est utilisé afin de ne pas confondre :

- validation de la chaîne réseau/API/appel ;
- validation du message TTS métier VigiSensys.

Sur Trial, seul le premier point est validé par ce fallback. Le message VigiSensys personnalisé sera validé sur un compte Twilio complet.

## Tests automatisés

`website/scripts/test-twilio-provider.ts` couvre :

- compte complet : un seul POST avec `Twiml`, `Timeout`, sans `Url` ;
- compte Trial : premier POST refusé, puis un seul fallback avec le template Twilio autorisé, sans `Twiml`/`Timeout` ;
- erreur Twilio non liée au Trial : aucune seconde tentative.

Validation GitHub Actions du lot #94 :

- génération Prisma MySQL : OK ;
- test provider Twilio : OK ;
- TypeScript : OK ;
- ESLint ciblé : OK.

Run de validation : `33875141908`.

## Validation terrain du 07/09/2026

Après merge de la PR #94 dans `dev`, le test a été rejoué avec le compte Twilio Trial réel :

- la connexion Twilio reste fonctionnelle ;
- **Tester l'appel** depuis VigiSensys aboutit désormais correctement ;
- l'appel est bien reçu sur le numéro vérifié du compte Trial ;
- le fallback Trial permet donc de valider la chaîne **VigiSensys → API Twilio → réseau téléphonique → téléphone**.

Le TTS VigiSensys personnalisé via `Twiml` inline reste à valider sur un compte Twilio complet, puisque le Trial impose le template Twilio hébergé.

## Checklist terrain

- [x] appel `Try out Voice` Twilio reçu sur le numéro vérifié ;
- [x] numéro Trial émetteur confirmé ;
- [x] API Key dédiée créée ;
- [x] erreur VigiSensys Trial reproduite et cause identifiée ;
- [x] correctif PR #94 mergé dans `dev` ;
- [x] relancer `Tester la connexion` ;
- [x] relancer `Tester l'appel` vers le numéro vérifié ;
- [x] vérifier la réception de l'appel via le template TTS Twilio ;
- [ ] après passage sur un compte complet, vérifier que le test revient automatiquement sur `vigisensys_tts` et lit le message VigiSensys personnalisé.

## Suite production — décision reportée

La prochaine étape commerciale n'est pas lancée immédiatement : le responsable concerné est absent quelques jours.

La cible technique documentée à reprendre à son retour est :

```text
Compte Twilio du client
+ Programmable Voice
+ Pay-as-you-go
+ numéro France autorisé pour Automated Outbound Calling
```

Pour la France, le type **Verified Polyvalent / NPV** est actuellement la piste recommandée à revalider au moment de la commande.

Le scénario métier cible inclut également :

- un ou plusieurs contacts par lieu ;
- message TTS dynamique selon l'alarme ;
- stratégie d'appel séquentielle ou parallèle ;
- saisie DTMF via Twilio `<Gather>` ;
- récupération du code côté VigiSensys ;
- validation des permissions/règles d'acquittement ;
- réponse vocale de confirmation ou d'erreur ;
- audit complet.

L'interactivité DTMF nécessite une URL HTTPS joignable par Twilio. La VM VigiSensys on-premise ne doit pas être exposée directement : un relais public minimal, Twilio Functions ou une combinaison des deux doit être choisi avant implémentation.

Le cadrage détaillé est conservé dans :

- `docs/telephony-twilio-production-interactive.md`

## Fichiers principaux

- `website/src/lib/telephony/twilio-provider.ts`
- `website/src/app/[locale]/(admin)/admin/parametres/_components/telephony-settings-card.tsx`
- `website/src/app/[locale]/(admin)/admin/parametres/_components/telephony/telephony-settings-helpers.ts`
- `website/src/app/[locale]/(admin)/admin/parametres/_components/telephony/telephony-settings-types.ts`
- `website/scripts/test-twilio-provider.ts`
- `website/CHANGELOG.md`
- `docs/telephony-twilio-production-interactive.md`
