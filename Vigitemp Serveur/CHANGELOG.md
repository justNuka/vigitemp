# Changelog — VigiSensys Serveur

Ce fichier décrit les évolutions propres au service Windows d'interrogation VigiSensys et, lorsqu'il suit directement le binaire livré, à son installateur.

Pour la vue synthétique d'une livraison complète, voir [`../CHANGELOG.md`](../CHANGELOG.md).

La version produit de référence du Serveur est `AssemblyInformationalVersion("x.y.z")`. L'installateur Serveur suit normalement la même version via sa propriété `<Version>`.

## [Unreleased]

### Métrologie — synchronisation A/B/C

- Le Serveur lit désormais `t_ajustage.Coeffs_Modifies_Depuis_Derniere_Mesure` sur le dernier ajustage de la sonde pour décider de l'envoi des coefficients A/B/C pendant Ajustage / Étalonnage.
- Une sonde de métrologie peut ainsi recevoir ses coefficients même si elle n'est affectée à aucun `t_lieu`.
- Après acquittement `ECON`, le dirty flag est remis à `0`; en cas d'échec, le mécanisme existant le restaure à `1`.
- Le dirty flag historique de `t_lieu` reste utilisé par le chemin normal de Surveillance.
- La migration BDD `0.90.2` MySQL ou SQL Server est requise pour activer ce nouveau parcours. Si elle manque, le décorateur DB retombe sur le provider historique afin d'éviter de neutraliser les paramètres métrologiques.

## [0.90.3] — 2026-08-27

### Corrigé — transport GSP `+++`

- Le filtrage du token série exact `+++` est remonté dans `GspProtocol`, la couche protocolaire partagée par les lecteurs GSP.
- `+++` seul, en tête du flux ou sur une ligne dédiée, n'est plus considéré comme une donnée métier significative.
- En Surveillance, ce token ne déclenche donc plus prématurément les délais de fin de réponse : le Serveur continue d'attendre la vraie trame GSP.
- Le filtre reste volontairement strict : les `+` présents dans des valeurs métier, par exemple `Alarm=F+D+E+LH+LB+RB+RH`, sont conservés.

### Corrigé — acquittements `ECON`

- Le protocole détecte maintenant les champs firmware de la forme `*=ovf`.
- `IsAcknowledgementForTarget()` refuse un acquittement qui contient `A=ovf`, `B=ovf`, `C=ovf` ou tout autre champ signalé en overflow, même si `ACK=ECON` est présent.
- Une synchronisation de configuration GSP en Surveillance ne peut donc plus être marquée comme réussie lorsque le firmware indique qu'une valeur n'a pas pu être stockée.
- Aucun clamp automatique des coefficients n'est introduit : la valeur source reste inchangée pour permettre le diagnostic.

### Compatibilité / installation

- Installateur Serveur : `0.90.3`.
- Web `>= 0.90.2` recommandé pour remonter explicitement les erreurs `ECON *=ovf` dans les parcours de métrologie.
- Aucune migration BDD.
- Aucun changement des formules de métrologie ni du mapping A/B/C.

### PR principales

- #62 — filtrage `+++` partagé avec Surveillance et rejet des réponses `ECON` en overflow.

## [0.90.2] — 2026-08-27

### Corrigé — Hotline / Ajustage / Étalonnage

- Le lecteur GSP de la Hotline ignore la séquence série exacte `+++` lorsqu'elle précède la vraie réponse de la sonde.
- Avant ce correctif, `+++` pouvait être pris pour la réponse utile, puis la vraie trame `ACK=TEMP ... END` arrivait pendant la purge et était jetée.
- Le lecteur continue maintenant d'attendre la trame utile jusqu'à `END` ou jusqu'au timeout normal.
- Les signes `+` présents dans les données métier ne sont pas supprimés.

### Portée

- Ce correctif couvrait Hotline, Ajustage et Étalonnage.
- Le chemin Surveillance utilisait un autre lecteur ; sa prise en charge complète est livrée en `0.90.3`.

### Compatibilité / installation

- Installateur Serveur : `0.90.2`.
- Aucune migration BDD.
- Aucun changement de contrat Web/API.

### PR principales

- #61 — ignorer la séquence GSP `+++` avant la réponse utile.

## [0.90.1] — baseline de référence au 2026-08-27

Cette entrée fixe la première baseline documentée du Serveur. Elle ne reconstitue pas exhaustivement l'historique antérieur.

### Versioning

- Normalisation de la version produit historique `0.90.001` vers la notation SemVer canonique `0.90.1`.
- Les métadonnées .NET techniques à quatre composantes restent distinctes lorsqu'elles sont déjà utilisées par le projet.
- L'installateur Serveur est formalisé en `0.90.1` afin de suivre le binaire qu'il distribue.

### GSP / métrologie embarquée présente dans la baseline

- Les mesures GSP sont considérées comme déjà corrigées par le firmware : aucune seconde correction métrologique serveur n'est appliquée.
- Support du protocole `ECON` étendu avec coefficients A/B/C, offset, erreur de justesse et mode multipoint.
- Support du `DCON` étendu tout en conservant la compatibilité avec les réponses historiques.
- Gestion des limites désactivées via `NAN` pour le nouveau firmware.
- Temporisation des écritures de configuration pendant les opérations de métrologie.
- Transport `ECON` compact `a/b/c` pendant Ajustage/Étalonnage et marquage `Infos_Modifiees_Depuis_Derniere_Mesure` pour permettre une resynchronisation complète au retour en Surveillance.

### Compatibilité

- Aucun minimum historique Web/Agent n'est déduit uniquement de cette baseline.

### Références principales

- PR #40, #45, #46, #48 et #50.
- `website/docs/gsp-econ-metrology-2026-08.md`
