# GSP — limite de 60 caractères par commande — 28/08/2026

## Statut

**PR_OUVERTE — branche `agent/gsp-econ-60-char-limit` — PR #69 vers `dev`.**

## Retour terrain

Les modules qui transportent les commandes des sondes GSP acceptent au maximum **60 caractères par commande**. Une commande qui dépasse cette taille peut être ignorée entièrement par le module.

Le problème est particulièrement visible lors d'une resynchronisation complète de configuration après une modification importante des consignes, fréquences, délais ou paramètres métrologiques : un `ECON` complet contient potentiellement les champs `a/b/c/d/e/m/h/l/f/r/t` et dépasse facilement 60 caractères.

Ajustage et Étalonnage étaient déjà protégés sur le chemin métrologie par l'envoi compact des seuls coefficients `a/b/c` (PR #50). Une SPNB typique produit alors une commande de 57 caractères. Le chemin normal de Surveillance pouvait en revanche encore envoyer le `ECON` complet en une seule trame.

## Solution retenue

La limite est appliquée au **transport série**, après construction du payload métier complet :

1. le Serveur construit le `ECON` normal sans supprimer de paramètre ;
2. si la commande complète fait au plus 60 caractères, elle est envoyée telle quelle ;
3. si elle dépasse 60 caractères, elle est découpée uniquement entre deux paramètres ;
4. chaque fragment reprend `ECON<target> ` et reste à 60 caractères maximum ;
5. chaque fragment doit être acquitté avant l'envoi du suivant ;
6. si un fragment n'est pas acquitté, les fragments suivants ne sont pas envoyés et la synchronisation reste en échec.

Les frontières autorisées sont les marqueurs du payload étendu : `a`, `b`, `c`, `d`, `e`, `m`, `h`, `l`, `f`, `r`, `t`. Une valeur numérique n'est donc jamais coupée au milieu.

La longueur est calculée avec la **cible réelle de la sonde**. Les 60 caractères incluent donc le préfixe `ECON`, le numéro/adresse de la sonde, l'espace et le payload.

## Exemple

Pour la cible `SPNB-26000065`, un payload complet de test donne une commande de 80 caractères :

```text
ECONSPNB-26000065 1.0000000000a0.0000000000b0.0000000000c0.00d0.00e0m8h2l15f0r0t
```

Le transport produit :

```text
ECONSPNB-26000065 1.0000000000a0.0000000000b0.0000000000c
```

57 caractères, puis :

```text
ECONSPNB-26000065 0.00d0.00e0m8h2l15f0r0t
```

41 caractères.

Le nombre de fragments n'est volontairement pas limité artificiellement à deux. Les configurations habituelles tiennent en deux commandes ; si des valeurs exceptionnellement longues nécessitent trois fragments, le Serveur privilégie le respect strict de la limite de 60 caractères.

## Portée

### Surveillance / Serveur

`SensorGSP.SendRequestAndReadAsync()` applique le découpage à tout `ECON` automatique dépassant la limite. Le mécanisme couvre donc notamment :

- resynchronisation complète après modification d'un lieu ;
- consignes haute/basse ;
- fréquence ;
- délais d'alarme ;
- coefficients / offset / erreur de justesse présents dans le `ECON` complet ;
- resynchronisation après retour de métrologie.

### Hotline

`HotlineApiServer.SendGspCommand()` applique la même protection aux commandes `ECON` construites par la synchronisation de configuration Hotline.

Le mode `raw` libre de la Hotline n'est pas transformé automatiquement : il reste un outil de diagnostic manuel. Les parcours Ajustage/Étalonnage qui passent par `raw` sont déjà compactés à `a/b/c` avant l'écriture série et restent sous la limite.

### Ajustage / Étalonnage

Aucun changement métier : le `ECON a/b/c` compact existant fait déjà 57 caractères pour une SPNB typique. Le nouveau helper le laisse intact puisqu'il est inférieur ou égal à 60 caractères.

## Fichiers principaux

- `Vigitemp Serveur/Vigitemp Serveur/sensors/GspProtocol.cs`
  - constante `MaxModuleCommandCharacters = 60` ;
  - helper partagé `TryBuildCommandFragments(...)`.
- `Vigitemp Serveur/Vigitemp Serveur/sensors/SensorGSP.cs`
  - découpage et ACK séquentiel sur le transport normal.
- `Vigitemp Serveur/Vigitemp Serveur/HotlineApiServer.cs`
  - même protection pour la synchronisation Hotline.
- `Vigitemp Serveur/CHANGELOG.md`
- `website/docs/backlog-retours-17-08-2026.md`

## Validation effectuée

- [x] branche créée depuis le HEAD de `dev` `237b582ec6d2dc97639829216899ba841b8914c9` ;
- [x] aucun PR ouvert au démarrage du lot ;
- [x] vérification du cas SPNB 80 caractères => fragments 57 + 41 ;
- [x] vérification qu'un `ECON a/b/c` de 57 caractères n'est pas redécoupé ;
- [x] vérification de payloads plus longs : aucun fragment généré ne dépasse 60 caractères ;
- [x] arrêt prévu immédiatement si un fragment n'est pas acquitté ;
- [x] diff nettoyé des fichiers temporaires utilisés pour appliquer le patch ;
- [ ] build Windows du Serveur ;
- [ ] essai terrain avec une modification simultanée de consigne + fréquence + délais ;
- [ ] vérifier dans les logs plusieurs TX `ECON` de 60 caractères maximum ;
- [ ] vérifier un ACK pour chaque fragment ;
- [ ] simuler l'absence d'ACK du premier fragment et confirmer que le suivant n'est pas envoyé ;
- [ ] vérifier qu'Ajustage et Étalonnage continuent d'envoyer leur `a/b/c` compact sans régression.
