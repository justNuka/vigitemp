# Systeme de licence Vigitemp (version actuelle)

Tags: Guides et procedures, Licence  
Derniere modification: 12 janvier 2026

---

## Objectif

Mettre en place une gestion de licence robuste, offline, et difficile a contourner, tout en restant simple pour l’installation client.  
La licence est verifiee par le serveur C# et reste la source de verite (pas la base).

---

## Contraintes du projet

- Solution installee chez le client (BDD, serveur C#, serveur web).
- Pas de dependance Internet sortante (serveur C# offline par principe).
- Le client a acces a la base, donc la DB n’est pas une source fiable pour la licence.

---

## Composants et roles

- Serveur C#  
  - Verifie la licence (signature + contenu).  
  - Applique les limites (edition, options, acces simultanes).  
  - Expose les infos necessaires au site (a minima et sans secrets).  

- Site web (Next.js)  
  - Authentifie les utilisateurs.  
  - Applique l’UX selon les droits/licence.  
  - Ne valide pas une licence par lui-meme.

- Base de donnees  
  - Stockage metier.  
  - Ne decide pas si la licence est valide ou non.

---

## Format de la licence (.vtlic)

Le fichier de licence contient les informations suivantes (exemples) :

- licenseId  
- customerId (format attendu: X9999999)  
- edition: one | standard | expert  
- concurrentAccess: 5 | 10 | 25 | illimite  
- options: telephonie, mail, options_futures, ...  
- expiresAt (optionnel)  
- bind (optionnel):
  - instancePublicKey (si liaison a une instance)
- hotline (optionnel):
  - login
  - passwordHash (hash cote generateur)

La licence est signee (asymetrique) et verifiee avec la cle publique fournie a l’installation.

---

## Generation des licences

Un outil interne (Vigitemp License Generator) genere :

- une paire de cles (publique / privee)  
- un fichier .vtlic signe  
- un affichage “numero de licence” (pour usage client/support)

Regles internes:
- La cle privee ne doit jamais sortir de l’equipe.  
- La cle publique est fournie avec la licence pour verification offline.

---

## Stockage sur machine cliente

Fichiers attendus (serveur C#):

- C:\ProgramData\Vigitemp\licenses\*.vtlic  
- C:\ProgramData\Vigitemp\license_keys\license_public.pem  

La route d’installation peut aussi stocker ces chemins dans le registre :

- HKLM\SOFTWARE\Vigitemp\Server
  - InstallPath
  - Version
  - LastInstalledUtc
  - LicensePath
  - LicensePublicKeyPath

---

## Validation au demarrage (serveur C#)

1) Charge la licence (.vtlic).  
2) Verifie la signature avec la cle publique.  
3) Parse le contenu.  
4) Charge les limites en memoire:
   - edition
   - options actives
   - limite d’acces simultanes
   - date d’expiration (si presente)
   - bind instance (si present)

Si la licence est invalide, le service refuse de demarrer.

---

## Gestion des acces simultanes (principe)

Le serveur C# est la reference.

Approche recommandee:
- table en memoire des sessions actives  
- heartbeat pour expirer les sessions inactives  
- un redemarrage serveur remet a zero (acceptable a ce stade)

Cela evite la dependance a la DB pour la licence.

---

## Portail hotline (optionnel, licence)

Les identifiants “hotline” peuvent etre fournis dans la licence.  
Ils sont hashes dans le generateur, et verifies cote serveur.

Avantages:
- Informations sensibles non modifiables par la DB  
- Acces support controle par la licence

---

## Raison du modele “offline”

Avantages:
- Aucun besoin Internet.  
- Le client ne peut pas “forcer” la licence via la DB.  
- Fonctionne en environnement cloisonne (hopital, labo, etc.).

Limites:
- Requiert un generateur interne et une gestion des cles.
- La revalidation est locale, pas de “call home”.

---

## Installation (resume)

1) Installer le serveur C#  
2) Fournir la licence .vtlic et la cle publique  
3) Verifier les logs (licence OK)  
4) Demarrer le service

---

## Logs utiles

Serveur C#:
- C:\ProgramData\Vigitemp\logs\vigitemp-serveur.log  
  - “Licence OK” ou “Licence invalide”

---

## Points a confirmer / evolutions

- Endpoint d’expo des infos licence vers le web (si besoin).  
- Strategie de refresh des sessions (si besoin multi-front).  
- Rotation / renouvellement des cles (process interne).

