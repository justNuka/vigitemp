# Reset mot de passe — retour de livraison email — 16/09/2026

## Statut

- **Branche** : `fix/password-reset-delivery-feedback`
- **PR** : à renseigner après ouverture
- **Cible** : `dev`
- **État** : correctif prêt à valider

## Retour terrain

Une demande de réinitialisation de mot de passe affichait un succès côté Web alors que Nodemailer journalisait un échec de connexion SMTP, par exemple `EDNS / getaddrinfo` avant même l'établissement de la connexion au serveur de messagerie.

Le message utilisateur pouvait donc laisser croire que l'email était parti alors qu'aucun message n'avait été remis au serveur SMTP.

## Cause

`sendEmail()` capture les erreurs Nodemailer et retourne un résultat `{ success: false, error }` afin que les appelants puissent choisir leur stratégie de repli.

La route `POST /api/auth/request-password-reset` attendait bien `sendEmail()`, mais ignorait son résultat. Elle poursuivait ensuite avec un audit `success: true` et une réponse de succès.

La route exposait également un comportement différent lorsqu'un compte existait et que SMTP était désactivé : compte inconnu => réponse générique 200, compte connu => erreur 503. Cette différence allait à l'encontre de la règle de sécurité qui impose une réponse extérieure indistinguable pour un email connu ou inconnu.

## Correctif

- la réponse publique ne prétend plus qu'un email a été envoyé ; elle confirme uniquement que la demande a été prise en compte ;
- le même message générique est renvoyé pour une adresse connue ou inconnue lorsque SMTP n'est pas configuré ;
- le résultat de `sendEmail()` est maintenant contrôlé explicitement ;
- en cas d'échec de livraison, le token de reset fraîchement créé est invalidé afin de ne pas conserver un token inutilisable ;
- l'échec reste visible dans les logs et dans l'audit interne, sans exposer au navigateur l'existence du compte ;
- les textes FR/EN de la fenêtre et du toast ont été alignés sur ce comportement.

Le correctif ne masque pas le problème SMTP lui-même : une erreur DNS, réseau, TLS ou d'authentification reste à corriger dans la configuration de l'installation et demeure journalisée côté serveur.

## Fichiers principaux

- `website/src/app/api/auth/request-password-reset/route.ts`
- `website/src/messages/auth-reset-supplements.ts`
- `website/src/i18n/request.ts`

## Checklist de validation

- [ ] adresse existante + SMTP fonctionnel : email reçu et audit `MDP - SUCCESS` ;
- [ ] adresse existante + SMTP DNS invalide : aucun faux message « Email envoyé », log de livraison en échec et token de reset supprimé ;
- [ ] adresse existante + SMTP désactivé/incomplet : réponse publique générique, sans 503 spécifique au compte ;
- [ ] adresse inconnue : même wording public que pour une adresse existante ;
- [ ] email au format invalide : validation 400 conservée ;
- [ ] rate limit : comportement 429 conservé ;
- [ ] vérifier les textes français et anglais dans la fenêtre « mot de passe oublié ».
