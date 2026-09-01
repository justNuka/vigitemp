# HTTPS VigiSensys - version simple

## A quoi sert cette note

Cette note explique simplement comment avoir VigiSensys en HTTPS.

Il y a 3 cas :

1. le client a deja un reverse proxy
2. le client n'a pas de reverse proxy
3. licence Pack sur un poste portable ou un poste unique

## Idee generale

Le site VigiSensys ne fabrique pas lui-meme le HTTPS.

En pratique :

- le site tourne en HTTP sur le port `3000`
- un autre composant se charge du HTTPS devant

Ce composant peut etre :

- le reverse proxy du client
- ou `Caddy` si on l'installe nous-memes

## Cas 1 - Le client a deja un reverse proxy

Dans ce cas, c'est simple :

- le client garde son reverse proxy
- c'est lui qui gere le certificat HTTPS
- VigiSensys reste derriere en HTTP

Ce qu'il faut renseigner dans l'installation :

- `URL publique`
- `Origines autorisees`

Exemple :

- URL publique : `https://vigisensys.client.fr`
- Origines autorisees : `https://vigisensys.client.fr`

Si plusieurs adresses doivent fonctionner :

- `https://vigisensys.client.fr,https://supervision.client.fr`

## Cas 2 - Le client n'a pas de reverse proxy

Dans ce cas, on peut installer `Caddy`.

`Caddy` sert de petit frontal web devant VigiSensys.

Il :

- gere le certificat
- expose le site en HTTPS
- renvoie ensuite vers VigiSensys en local

### En environnement client classique

Le mieux est :

- d'installer Caddy
- de faire fournir un vrai certificat par le client

Pourquoi :

- pas d'alerte navigateur
- plus propre
- plus maintenable

## Cas 3 - Licence Pack sur un portable

Dans ce cas, tout est sur une seule machine.

Le plus propre est :

- installer Caddy localement
- utiliser une adresse locale comme `https://vigisensys.local`
- generer un certificat local
- faire confiance a ce certificat sur la machine

Comme ca :

- le site est en HTTPS
- il n'y a pas d'alerte rouge dans le navigateur

Si cela echoue :

- on peut proposer un mode HTTP en repli

## Le serveur C# doit-il etre en HTTPS aussi ?

Pas forcement.

Ce qui compte surtout, c'est que :

- l'utilisateur accede au site en HTTPS

Le serveur C# peut continuer a parler au site en HTTP local ou interne :

- sur la meme machine
- ou sur le reseau prive

Donc :

- HTTPS obligatoire pour l'acces navigateur
- pas necessairement pour tous les echanges internes

## Que faut-il demander au client ?

### Si le client a deja un reverse proxy

Il faut juste demander :

- l'URL publique
- les origines autorisees

### Si le client n'a pas de reverse proxy

Il faut demander :

- veut-on installer Caddy ?
- quel nom DNS utiliser ?
- le client fournit-il un certificat ?

### Si c'est une licence Pack

Il faut idealement automatiser :

- installation de Caddy
- creation d'un certificat local
- confiance locale du certificat
- URL locale `https://vigisensys.local`

## Resume tres court

### Reverse proxy deja present

- on utilise celui du client

### Pas de reverse proxy

- on installe Caddy

### Licence Pack

- on installe Caddy local
- on publie en `https://vigisensys.local`

## Exemples de valeurs

### Client avec domaine

- URL publique : `https://vigisensys.client.fr`
- Origines autorisees : `https://vigisensys.client.fr`

### Client avec 2 noms

- URL publique : `https://vigisensys.client.fr`
- Origines autorisees : `https://vigisensys.client.fr,https://supervision.client.fr`

### Licence Pack

- URL publique : `https://vigisensys.local`
- Origines autorisees : `https://vigisensys.local`
