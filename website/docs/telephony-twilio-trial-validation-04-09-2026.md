# Téléphonie Twilio — validation compte Trial — 04/09/2026

## Statut

`EN_VALIDATION` — branche `fix/telephony-twilio-trial-call`.

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
- le premier appel VigiSensys est refusé avec :

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

## Checklist terrain

- [x] appel `Try out Voice` Twilio reçu sur le numéro vérifié ;
- [x] numéro Trial émetteur confirmé ;
- [x] API Key dédiée créée ;
- [x] erreur VigiSensys Trial reproduite et cause identifiée ;
- [ ] déployer la branche `fix/telephony-twilio-trial-call` ;
- [ ] relancer `Tester la connexion` ;
- [ ] relancer `Tester l'appel` vers le numéro vérifié ;
- [ ] vérifier la réception de l'appel via le template TTS Twilio ;
- [ ] vérifier que l'UI indique `Compte Twilio Trial détecté` ;
- [ ] relever le Call SID retourné pour diagnostic ;
- [ ] après passage sur un compte complet, vérifier que le test revient automatiquement sur `vigisensys_tts` et lit le message VigiSensys personnalisé.

## Fichiers principaux

- `website/src/lib/telephony/twilio-provider.ts`
- `website/src/app/[locale]/(admin)/admin/parametres/_components/telephony-settings-card.tsx`
- `website/src/app/[locale]/(admin)/admin/parametres/_components/telephony/telephony-settings-helpers.ts`
- `website/src/app/[locale]/(admin)/admin/parametres/_components/telephony/telephony-settings-types.ts`
- `website/scripts/test-twilio-provider.ts`
- `website/CHANGELOG.md`
