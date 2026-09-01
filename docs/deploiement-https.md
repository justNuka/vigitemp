# Deploiement HTTPS VigiSensys - version technique

## Objet

Cette note decrit la strategie HTTPS recommandee pour VigiSensys selon les modes d'installation :

1. licence Pack sur un poste portable ou un poste unique
2. installation client avec reverse proxy deja present
3. installation client sans reverse proxy

## Principes techniques

### Ce que fait l'application

Le site VigiSensys :

- tourne en HTTP sur le port `3000`
- ne termine pas lui-meme le TLS
- peut etre publie en HTTPS derriere un frontal

Le serveur C# :

- n'a pas besoin d'implementer HTTPS nativement pour les echanges internes
- peut continuer a parler au site web en HTTP local ou prive

Architecture cible :

`Utilisateur -> HTTPS -> frontal TLS -> HTTP -> site web VigiSensys:3000`

Architecture inter-services recommandee :

`serveur C# -> HTTP interne -> site web VigiSensys`

### Conclusion importante

Le HTTPS concerne en priorite l'acces navigateur utilisateur.

Il n'est pas necessaire, dans l'etat actuel, de chiffrer egalement tous les echanges inter-processus entre :

- serveur C#
- site web
- base de donnees

si ces composants sont sur la meme machine ou sur un reseau interne maitrise.

## Parametres a renseigner

Les champs fonctionnels a exposer dans l'installation sont :

- `URL publique`
- `Origines autorisees`

Correspondance :

- `URL publique` = URL finale utilisee par les utilisateurs
- `Origines autorisees` = liste des origines HTTPS autorisees a relayer les Server Actions

Exemple simple :

- URL publique : `https://vigisensys.client.fr`
- Origines autorisees : `https://vigisensys.client.fr`

Exemple avec plusieurs noms :

- URL publique : `https://vigisensys.client.fr`
- Origines autorisees : `https://vigisensys.client.fr,https://supervision.client.fr`

Ne pas mettre :

- `http://127.0.0.1:3000`
- `http://localhost:3000`

dans ces champs si le site est publie en HTTPS.

## Cas 1 - Licence Pack sur un poste portable

### Strategie recommandee

Pour une licence Pack, tout est generalement installe sur une seule machine :

- site web
- serveur C#
- base

Dans ce cas, il faut viser un HTTPS local simple et autonome.

Strategie recommandee :

- installer `Caddy`
- publier le site en `https://vigisensys.local`
- ajouter une entree `hosts` locale vers `127.0.0.1`
- generer un certificat local
- installer automatiquement la racine locale dans le magasin Windows de confiance

Architecture :

`navigateur -> https://vigisensys.local -> Caddy -> http://127.0.0.1:3000`

### Pourquoi ce choix

Avantages :

- affichage HTTPS dans le navigateur
- pas d'alerte rouge si la racine locale est correctement installee
- aucune dependance a un reverse proxy client externe
- pas besoin d'un vrai serveur

### Repli

Si l'installation du certificat local ou du frontal echoue :

- proposer un mode de repli HTTP

Ordre recommande :

1. tenter HTTPS local avec Caddy
2. si echec, proposer HTTP local

### URL a renseigner

- URL publique : `https://vigisensys.local`
- Origines autorisees : `https://vigisensys.local`

### Variables conseillees

```env
NEXT_PUBLIC_APP_URL="https://vigisensys.local"
NEXT_PUBLIC_API_BASE_URL="https://vigisensys.local/"
VIGISENSYS_SERVER_ACTIONS_ALLOWED_ORIGINS="https://vigisensys.local"
```

## Cas 2 - Le client dispose deja d'un reverse proxy

### Strategie recommandee

Ne pas installer Caddy.

Le reverse proxy client :

- termine le TLS
- presente le certificat
- publie le site en HTTPS
- relaie ensuite vers `http://127.0.0.1:3000` ou vers l'IP interne du serveur web

### Prerequis

- nom DNS ou sous-domaine
- certificat TLS valide sur le proxy
- connectivite reseau vers le serveur VigiSensys

### Entetes a transmettre idealement

- `X-Forwarded-Proto`
- `X-Forwarded-Host`
- `X-Forwarded-For`

### URL a renseigner

Exemple :

- acces utilisateur : `https://vigisensys.client.fr`

Alors :

- URL publique : `https://vigisensys.client.fr`
- Origines autorisees : `https://vigisensys.client.fr`

Si plusieurs noms doivent marcher :

- URL publique : `https://vigisensys.client.fr`
- Origines autorisees : `https://vigisensys.client.fr,https://supervision.client.fr`

### Variables conseillees

```env
NEXT_PUBLIC_APP_URL="https://vigisensys.client.fr"
NEXT_PUBLIC_API_BASE_URL="https://vigisensys.client.fr/"
VIGISENSYS_SERVER_ACTIONS_ALLOWED_ORIGINS="https://vigisensys.client.fr"
```

## Cas 3 - Multi-serveurs sans reverse proxy existant

### Strategie recommandee

Installer automatiquement `Caddy` sur le serveur qui heberge le site web.

Le client doit alors fournir un certificat exploitable.

### Regle recommandee

Pour une vraie installation client multi-postes :

- ne pas compter par defaut sur un certificat auto-signe local
- demander un certificat fourni par le client

Pourquoi :

- un certificat auto-signe impose de faire confiance a la racine sur chaque poste client
- hors domaine ou hors GPO, cela devient vite lourd a maintenir

### Ce que doit fournir le client

Format recommande :

- `certificat PEM`
- `cle privee PEM`

Formats possibles avec conversion :

- `PFX` + mot de passe

### Utilisation cote installation

L'installation doit :

1. copier les certificats dans un dossier applicatif, par exemple :
   - `C:\ProgramData\VigiSensys\certs\`
2. generer le `Caddyfile`
3. creer et demarrer le service Windows Caddy
4. publier le site en HTTPS
5. router vers `http://127.0.0.1:3000`

### Exemple de configuration Caddy

```caddy
vigisensys.client.fr {
    tls C:\ProgramData\VigiSensys\certs\fullchain.pem C:\ProgramData\VigiSensys\certs\privkey.pem
    reverse_proxy 127.0.0.1:3000
}
```

### URL a renseigner

- URL publique : `https://vigisensys.client.fr`
- Origines autorisees : `https://vigisensys.client.fr`

## Cas non recommande - HTTPS direct sans frontal

Ce mode n'est pas recommande.

Pourquoi :

- l'application web ne gere pas elle-meme le TLS sur `3000`
- l'industrialisation serait plus complexe
- la gestion des certificats serait plus fragile

Conclusion :

- si on veut du HTTPS, il faut un frontal TLS
- reverse proxy client si disponible
- sinon Caddy local

## Comportement recommande des installateurs

### Pour Pack

Options recommandees :

- `Activer HTTPS local avec Caddy`
- `Generer un certificat local automatiquement`
- `Installer le certificat racine localement`
- `Nom local du site`

Valeur par defaut du nom local :

- `vigisensys.local`

### Pour Standard / Expert / autres installations reseau

Choix recommande :

- `Le client dispose deja d'un reverse proxy`
- `Installer un frontal HTTPS local avec Caddy`

#### Si reverse proxy deja present

Demander :

- `URL publique`
- `Origines autorisees`

#### Si Caddy doit etre installe

Demander :

- `Nom DNS public ou interne`
- `Type de certificat`

Options de certificat :

- `Certificat fourni par le client`
- `Mode local / test avec certificat local`

Uploads possibles :

- `cert.pem`
- `privkey.pem`
- ou `PFX` + mot de passe

## Texte conseille pour les bulles d'aide

### URL publique

`URL finale utilisee par les utilisateurs pour acceder a VigiSensys. Exemple : https://vigisensys.client.fr`

### Origines autorisees

`Liste des origines HTTPS autorisees a relayer les requetes vers l'application. Exemple : https://vigisensys.client.fr ou https://vigisensys.client.fr,https://supervision.client.fr`

## Resume decisionnel

### Pack

- HTTPS local automatique avec Caddy
- certificat local genere automatiquement
- confiance locale installee automatiquement
- fallback HTTP si echec

### Installation client avec reverse proxy

- ne pas installer Caddy
- utiliser l'URL HTTPS publiee par le client
- renseigner URL publique et origines autorisees

### Installation client sans reverse proxy

- installer Caddy
- certificat client recommande
- ne pas privilegier un auto-signe en prod multi-postes

## Reponse courte a un client

### Avec reverse proxy

`Oui, VigiSensys peut etre expose en HTTPS derriere votre reverse proxy, a condition de publier l'application via une URL HTTPS et de renseigner cette meme URL dans les parametres d'URL publique et d'origines autorisees.`

### Sans reverse proxy

`Oui. Si aucun reverse proxy n'est deja present, un frontal HTTPS local comme Caddy peut etre installe sur le serveur pour terminer le TLS devant VigiSensys.`

### Licence Pack sur portable

`Oui. Pour une licence Pack sur un poste unique, le plus propre est d'installer un frontal HTTPS local et d'exposer l'application via une adresse locale stable comme https://vigisensys.local.`
