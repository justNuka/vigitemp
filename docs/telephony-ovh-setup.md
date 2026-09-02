# Guide de configuration OVHcloud pour la téléphonie VigiSensys

> Guide opératoire pour préparer une ligne OVHcloud et renseigner Administration > Paramètres > Téléphonie dans VigiSensys.
>
> Vérifié avec la documentation OVHcloud disponible au 02/09/2026. Les offres, tarifs et noms de menus OVHcloud peuvent évoluer : vérifier le catalogue au moment de l'installation.

## 1. Résumé rapide

Pour tester l'intégration OVHcloud actuellement disponible dans VigiSensys, il faut :

1. une ligne VoIP/SIP OVHcloud compatible Click2Call ;
2. le groupe de téléphonie / billing account ;
3. le service name de la ligne ;
4. le numéro présenté / caller ID ;
5. trois clés API OVHcloud : AK, AS et CK ;
6. un identifiant Click2Call, existant ou créé depuis VigiSensys ;
7. enregistrer la configuration avant de lancer les tests.

La configuration SIP détaillée (mot de passe SIP, registrar, proxy, codecs) **n'est pas nécessaire pour Click2Call**, mais sera utile pour le futur PoC Asterisk.

## 2. Quel type d'offre choisir ?

### Pour le Click2Call actuel

Au 02/09/2026, le catalogue OVHcloud France présente :

- **Découverte** : offre simple ; Click2Call n'est pas annoncé dans la liste courante des fonctionnalités ;
- **Entreprise** : Click2Call annoncé, 2 appels simultanés, appels fixes inclus selon le forfait ;
- **Entreprise+** : Click2Call annoncé, avec une couverture mobile plus large/incluse selon l'offre du moment.

Pour VigiSensys, choisir **au minimum une offre qui affiche explicitement Click2Call comme fonctionnalité**.

Si la majorité des alarmes doivent appeler des mobiles, comparer le coût réel des appels mobiles entre Entreprise et Entreprise+ au moment de la commande.

Page officielle : https://www.ovhcloud.com/fr/phone/voip/

### Pour la cible Asterisk / IPBX

Deux possibilités :

- commencer avec la ligne SIP VoIP existante pour un PoC ;
- envisager un **SIP Trunk** si l'installation devient un vrai IPBX avec plusieurs canaux/appels simultanés.

Le SIP Trunk est conçu par OVHcloud pour les IPBX/UC/SBC et permet de dimensionner le nombre de canaux.

Page officielle : https://www.ovhcloud.com/fr/phone/sip-trunk/

## 3. Où trouver chaque information

### Endpoint OVH

Pour un compte OVHcloud Europe :

```text
ovh-eu
```

C'est la valeur à sélectionner dans VigiSensys.

### Billing Account / Compte de facturation

Dans l'espace client OVHcloud :

```text
Télécom
→ VoIP & Fax
→ sélectionner le groupe de téléphonie
```

Le nom du groupe est généralement sous la forme :

```text
xx12345-ovh-1
```

C'est la valeur à saisir dans **Compte de facturation**.

### Service Name / ligne

Dans :

```text
Télécom
→ VoIP & Fax
→ groupe
→ Services / ligne concernée
```

Relever la ligne SIP au format international telle qu'OVH l'identifie.

Exemple :

```text
0033972140930
```

C'est la valeur de **Nom du service / ligne**.

### Caller ID

Utiliser le numéro autorisé à être présenté par OVH pour cette ligne.

Pour le premier test, utiliser de préférence la ligne elle-même au format accepté par OVH. Si un test échoue sur `callingNumber`, reprendre exactement le format du `serviceName` retourné par OVH/API.

## 4. Créer les clés API OVHcloud

VigiSensys utilise l'API REST OVHcloud pour le Click2Call. Il faut créer trois clés :

- **Application Key (AK)** ;
- **Application Secret (AS)** ;
- **Consumer Key (CK)**.

Documentation officielle :

https://docs.ovhcloud.com/fr/guides/manage-and-operate/api/first-steps

Page de création de token Europe :

https://eu.api.ovh.com/createToken/

### Étapes

1. se connecter avec le compte OVHcloud qui possède la ligne ;
2. ouvrir la page de création de token ;
3. saisir un nom explicite, par exemple :

```text
VigiSensys Telephony
```

4. ajouter une description, par exemple :

```text
VigiSensys OVH Click2Call integration
```

5. limiter les droits aux API de téléphonie.

### Droits simples pour le premier test

Pour démarrer :

```text
GET  /telephony/*
POST /telephony/*
```

Ces droits permettent de tester facilement l'intégration sans ouvrir les autres familles d'API OVHcloud.

Après validation, réduire les droits aux routes strictement nécessaires si possible.

### Routes utilisées par VigiSensys

```text
GET  /telephony/{billingAccount}/line/{serviceName}/click2CallUser
GET  /telephony/{billingAccount}/line/{serviceName}/click2CallUser/{id}
POST /telephony/{billingAccount}/line/{serviceName}/click2CallUser
POST /telephony/{billingAccount}/line/{serviceName}/click2CallUser/{id}/click2Call
```

### Sécurité

AK identifie l'application. AS et CK sont des secrets.

Ne pas :

- les envoyer par email non sécurisé ;
- les inclure dans une capture ;
- les coller dans une issue/PR ;
- les committer dans Git ;
- les placer dans des logs.

Dans VigiSensys, les champs secrets de téléphonie passent par le stockage chiffré prévu dans `secret-crypto`.

## 5. Créer un identifiant Click2Call

Documentation officielle :

https://docs.ovhcloud.com/fr/guides/web-cloud/phone-and-fax/voip/configurer-utiliser-click2call

### Depuis OVHcloud

Dans l'espace client :

```text
Télécom
→ VoIP & Fax
→ groupe de téléphonie
→ sélectionner la ligne
→ Gestion des appels
→ Appel en 1 clic (Click2Call)
```

Il faut au moins un identifiant Click2Call.

Créer par exemple :

```text
Login : vigisensys_alarm
Password : mot de passe dédié fort
```

Le login/mot de passe Click2Call est **différent** du login/mot de passe SIP.

### Depuis VigiSensys

L'interface VigiSensys sait aussi créer un identifiant Click2Call via l'API OVHcloud.

Procédure :

1. renseigner les clés OVH, billing account, service name et caller ID ;
2. renseigner un login Click2Call ;
3. renseigner un mot de passe Click2Call ;
4. cliquer sur **Enregistrer** ;
5. cliquer sur **Créer l'utilisateur Click2Call**.

Important : les actions de test utilisent la configuration **enregistrée côté serveur**. Toujours enregistrer avant de tester ou de créer l'identifiant.

VigiSensys sauvegarde ensuite l'ID retourné par OVH.

## 6. Renseigner VigiSensys

Ouvrir :

```text
Administration
→ Paramètres
→ Téléphonie
```

Puis :

```text
Activer la téléphonie : Oui
Fournisseur : OVHcloud
```

Renseigner :

### Point d'accès

```text
ovh-eu
```

### Numéro présenté / Caller ID

Numéro autorisé par la ligne OVHcloud.

### Application Key

AK générée sur le portail API OVHcloud.

### Application Secret

AS générée en même temps.

### Consumer Key

CK générée en même temps.

### Compte de facturation

Nom du groupe OVHcloud, par exemple :

```text
xx12345-ovh-1
```

### Nom du service / ligne

Ligne SIP au format international, par exemple :

```text
0033972140930
```

### Id utilisateur Click2Call

Si VigiSensys a créé l'utilisateur, cet ID est renseigné automatiquement.

Si un identifiant existe déjà, récupérer son ID via l'API OVHcloud ou l'outil de gestion correspondant avant le test final.

### Login / mot de passe Click2Call

Nécessaires uniquement pour créer/administrer le compte Click2Call depuis VigiSensys.

## 7. Ordre de test recommandé

### Étape A — Enregistrer

Cliquer sur **Enregistrer**.

### Étape B — Tester la connexion

Cliquer sur :

```text
Tester la connexion
```

Résultat attendu :

- credentials OVH acceptés ;
- billing account trouvé ;
- ligne trouvée ;
- liste des identifiants Click2Call récupérable.

### Étape C — Créer l'identifiant si nécessaire

Si aucun identifiant n'existe, renseigner login + password Click2Call, enregistrer, puis cliquer :

```text
Créer l'utilisateur Click2Call
```

### Étape D — Tester un appel

Renseigner un numéro de test au format international, par exemple :

```text
+33612345678
```

Puis cliquer :

```text
Tester l'appel
```

Avec Click2Call, la ligne/équipement OVH sonne d'abord ; après prise de ligne, OVH appelle le numéro destinataire.

## 8. Ce qu'il faut vérifier lors du premier appel réel

- [ ] la requête OVH est acceptée ;
- [ ] la ligne sonne ;
- [ ] le destinataire est appelé ;
- [ ] le bon numéro est présenté ;
- [ ] le format `callerId` accepté est identifié ;
- [ ] le format du numéro destinataire est correct ;
- [ ] la facturation correspond au forfait choisi ;
- [ ] aucune clé secrète n'apparaît dans les logs ;
- [ ] les erreurs OVH sont suffisamment lisibles pour être diagnostiquées.

## 9. Informations SIP à conserver pour Asterisk

Même si elles ne sont pas nécessaires au Click2Call, conserver les informations suivantes dans la documentation d'installation sécurisée :

- Login / User name SIP ;
- Authorization user name ;
- mot de passe SIP ;
- Domain / Registrar ;
- Proxy sortant ;
- codecs autorisés ;
- infrastructure/région si OVH la communique.

Ces informations serviront pour le futur PoC Asterisk.

Ne jamais ajouter le mot de passe SIP dans Git.

## 10. Click2Call vs Asterisk

### Click2Call

Choisir Click2Call pour :

- valider rapidement la ligne ;
- faire des appels manuels ;
- mettre deux interlocuteurs en relation ;
- garder une intégration très simple.

### Asterisk

Choisir Asterisk pour la cible d'alarme vocale automatique :

- VigiSensys appelle sans opérateur humain côté ligne ;
- lecture d'un message audio/TTS ;
- DTMF ;
- statut détaillé de l'appel ;
- scénarios/retry/escalade ;
- plusieurs canaux si l'architecture évolue.

Architecture cible détaillée : `docs/architecture/telephony-architecture.md`.

## 11. Erreurs fréquentes

### `401` / `403` OVH

Vérifier :

- AK/AS/CK ;
- expiration du token ;
- droits GET/POST ;
- endpoint `ovh-eu` ;
- horloge du serveur.

La signature OVH est sensible au timestamp.

### Billing account introuvable

Ne pas saisir le numéro de ligne à la place du groupe. Le billing account ressemble généralement à :

```text
xx12345-ovh-1
```

### Service name introuvable

Utiliser la ligne SIP telle qu'elle est identifiée dans OVH/API, au format international.

### Aucun utilisateur Click2Call

Créer un identifiant depuis OVH ou depuis VigiSensys.

### L'appel ne part pas

Vérifier :

- ID Click2Call ;
- caller ID ;
- numéro de destination ;
- restrictions d'appel de la ligne ;
- forfait/solde/hors-forfait ;
- présence d'un équipement ou comportement Click2Call attendu.

## 12. Checklist installation

### OVHcloud

- [ ] offre compatible choisie ;
- [ ] groupe de téléphonie connu ;
- [ ] service name connu ;
- [ ] caller ID connu ;
- [ ] AK générée ;
- [ ] AS générée et stockée de manière sécurisée ;
- [ ] CK générée et stockée de manière sécurisée ;
- [ ] droits API limités à la téléphonie ;
- [ ] identifiant Click2Call disponible ;
- [ ] informations SIP conservées pour Asterisk si nécessaire.

### VigiSensys

- [ ] provider OVHcloud sélectionné ;
- [ ] configuration enregistrée ;
- [ ] test connexion OK ;
- [ ] utilisateur Click2Call sélectionné/créé ;
- [ ] appel test OK ;
- [ ] numéro présenté validé ;
- [ ] comportement/facturation mobile validés ;
- [ ] logs contrôlés ;
- [ ] secrets absents des logs.

## 13. Références officielles

- offres VoIP : https://www.ovhcloud.com/fr/phone/voip/
- SIP Trunk : https://www.ovhcloud.com/fr/phone/sip-trunk/
- Click2Call : https://docs.ovhcloud.com/fr/guides/web-cloud/phone-and-fax/voip/configurer-utiliser-click2call
- API OVHcloud / clés AK-AS-CK : https://docs.ovhcloud.com/fr/guides/manage-and-operate/api/first-steps
- FAQ VoIP : https://docs.ovhcloud.com/fr/guides/web-cloud/phone-and-fax/voip/faq-voip
- espace client : https://www.ovh.com/manager/
