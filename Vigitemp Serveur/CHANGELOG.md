# Changelog — VigiSensys Serveur

Ce fichier décrit les évolutions propres au service Windows d'interrogation VigiSensys et, lorsqu'il suit directement le binaire livré, à son installateur.

Pour la vue synthétique d'une livraison complète, voir [`../CHANGELOG.md`](../CHANGELOG.md).

La version produit de référence du Serveur est `AssemblyInformationalVersion("x.y.z")`. L'installateur Serveur suit normalement la même version via sa propriété `<Version>`.

## [Unreleased]

Aucun changement supplémentaire documenté depuis la préparation de la version Serveur 1.1.0.

## [1.1.0] — 2026-09-21

### Alarmes — seuils critiques haut / bas

- `LieuAlarmSettings` expose désormais les seuils critiques haut/bas et leurs flags d'activation.
- Pour les sondes dont les mesures passent par `Sensor.compareMeasuresAndLimits()`, un franchissement critique utilise le même canal métier `H` / `B` que l'alarme de seuil correspondante, mais son activation est immédiate.
- Le franchissement critique ignore le retard d'alarme normal, le debounce global, le retard après changement de consigne et la temporisation de redéclenchement. Le comportement normal reste inchangé lorsque seul le seuil normal est dépassé.
- Un seuil critique peut rester actif même si le seuil normal du même côté est désactivé.
- Les providers MySQL et SQL Server lisent d'abord le schéma 0.91.0 (`ReadLieuAlarmSettingsV3`) puis conservent les fallbacks V2/V1 afin qu'un Serveur 1.1.0 puisse démarrer sur une installation pas encore migrée.
- Les seuils critiques sont évalués côté VigiSensys : ils ne sont pas ajoutés aux commandes `ECON` et ne modifient donc pas le contrat firmware GSP.
- Les GSO restent gérées par la logique BDD historique ; leurs triggers d'alarme sont mis à jour par la migration BDD 0.91.0 pour appliquer le même déclenchement critique immédiat.

### Version / compatibilité

- Version produit Serveur : **1.1.0**.
- Installateur Serveur : **1.1.0**.
- Le Serveur reste compatible en lecture avec le schéma 0.90.2, mais les seuils critiques nécessitent **BDD 0.91.0** pour être configurés et utilisés.

## [1.0.0] — 2026-09-18

Cette version consolide les évolutions Serveur intégrées depuis `0.90.3` et constitue la première release Serveur VigiSensys finalisée. Les versions techniques `AssemblyVersion` / `AssemblyFileVersion` restent volontairement indépendantes ; la version produit est portée par `AssemblyInformationalVersion("1.0.0")`.


### IC / IP / IH — préservation des octets de mesure binaires

- Les trames IC, IP et IH utilisent un en-tête ASCII mais encodent la mesure sur deux octets binaires.
- Le `SerialPort` de ces trois protocoles est désormais décodé en ISO-8859-1 afin de conserver une correspondance 1:1 pour les octets `0x00..0xFF` avec `ReadExisting()`.
- La regex de mesure accepte maintenant les deux octets sur toute la plage `0x00..0xFF`, au lieu de les limiter à `0x00..0x7F`.
- La formule historique `raw = poidsFort * 256 + poidsFaible - 2048` reste inchangée.
- Les logs de réception indiquent `high=0x..` et `low=0x..` pour faciliter la comparaison entre la trame physique, la valeur brute et la valeur corrigée.
- Ce correctif vise notamment les sondes CO2 `IC`, pour lesquelles des octets supérieurs à `0x7F` pouvaient produire une mesure rejetée ou altérée et donner l'impression de paliers de mesure.

### GSP — commandes de configuration limitées à 60 caractères

- Les commandes `ECON` générées automatiquement par le Serveur respectent désormais la limite firmware/module de **60 caractères maximum par trame**.
- Une commande plus longue est découpée uniquement entre deux paramètres `a/b/c/d/e/m/h/l/f/r/t` : aucune valeur n'est tronquée.
- Le découpage est calculé avec la cible réelle de la sonde, donc les 60 caractères incluent `ECON`, le numéro/adresse de la sonde et l'espace avant le payload.
- Chaque fragment doit être acquitté avant l'envoi du suivant ; un ACK manquant arrête immédiatement la synchronisation et la laisse en échec.
- Le comportement couvre la synchronisation de Surveillance (`SensorGSP`) et la synchronisation de configuration via la Hotline. Les `ECON a/b/c` compacts d'Ajustage/Étalonnage restent inchangés lorsqu'ils tiennent déjà dans la limite.
- Le nombre de fragments n'est pas forcé à deux : une configuration habituelle est envoyée en deux trames, mais une valeur exceptionnellement longue peut produire davantage de fragments afin de ne jamais dépasser la limite.

### Métrologie — synchronisation A/B/C

- Le Serveur lit désormais `t_ajustage.Coeffs_Modifies_Depuis_Derniere_Mesure` sur le dernier ajustage de la sonde pour décider de l'envoi des coefficients A/B/C pendant Ajustage / Étalonnage.
- Une sonde de métrologie peut ainsi recevoir ses coefficients même si elle n'est affectée à aucun `t_lieu`.
- Après acquittement `ECON`, le dirty flag est remis à `0`; en cas d'échec, le mécanisme existant le restaure à `1`.
- Le dirty flag historique de `t_lieu` reste utilisé par le chemin normal de Surveillance.
- La migration BDD `0.90.2` MySQL ou SQL Server est requise pour activer ce nouveau parcours. Si elle manque, le décorateur DB retombe sur le provider historique afin d'éviter de neutraliser les paramètres métrologiques.

### IP — conversion platine restaurée

- Le correctif de lecture binaire IC/IP/IH conserve les octets `0x00..0xFF` sans modifier la formule métier historique des sondes.
- La conversion platine spécifique aux sondes IP a été restaurée après identification d'une régression introduite pendant la fiabilisation du décodage brut.
- Les valeurs IP continuent donc d'utiliser le traitement historique attendu après reconstruction de la mesure brute.

### SEF — communication directe Sollae TCP

- Ajout du protocole `SefProtocol` pour les anciennes sondes étalon SEF reliées à un convertisseur Sollae.
- VigiSensys se connecte directement au Sollae en TCP, avec port `1470` et adresse protocole `01` par défaut, sans dépendre d'ezVSP ni d'un port COM virtuel.
- Le protocole envoie `Q#<adresse>\r00000000` et accepte le banner MAC Sollae avant la réponse de température.
- La lecture reste robuste lorsque le banner et la mesure arrivent dans plusieurs paquets TCP.
- Le support est exposé aux parcours Hotline / métrologie sans dupliquer la logique protocolaire côté Web.

### GSP — configuration avant Surveillance

- Une GSP dont `Infos_Modifiees_Depuis_Derniere_Mesure = 1` peut être planifiée en mode `ConfigurationOnly` même si le lieu n'est pas encore activé en Surveillance.
- La configuration pending est appliquée avant la première mesure normale, sans assouplir les garde-fous utilisés par les chemins de mesure et d'alarme.
- Les sondes en métrologie ou sans module/port exploitable restent exclues du traitement automatique.

### Dispatch alarmes vers le Web

- Les valeurs `VigiSensys.WebsiteBaseUrl` / `Vigi.WebsiteBaseUrl` sont normalisées lorsqu'une installation historique contient seulement `IP:port`.
- Les URL HTTP/HTTPS sont validées avant utilisation et les configurations réellement invalides sont diagnostiquées explicitement.
- L'installateur graphique et le script PowerShell appliquent la même normalisation afin d'éviter de créer de nouvelles configurations ambiguës.

### Installation SQL Server / encodage

- L'installateur Serveur force désormais l'entrée et la sortie UTF-8 de `sqlcmd` pour le seed principal et les scripts associés.
- Cette mesure évite l'insertion de libellés français corrompus selon la page de codes Windows active.
- Le Web dispose en complément d'une réparation conservatrice pour les anciennes autorisations déjà enregistrées avec un mojibake connu.

### Compatibilité / installation 1.0.0

- Installateur Serveur : `1.0.0`.
- La révision de schéma BDD de référence reste `0.90.2` ; elle est requise pour les chemins utilisant `t_ajustage.Coeffs_Modifies_Depuis_Derniere_Mesure`.
- Aucun changement de schéma n'est introduit uniquement par le passage du Serveur à `1.0.0`.
- Les protocoles et correctifs ci-dessus sont inclus dans le binaire Serveur `1.0.0`.

### PR principales

- #67 — synchronisation des coefficients métrologie via `t_ajustage`.
- #69 — limite de 60 caractères des commandes GSP `ECON`.
- #98 — préservation des octets binaires IC/IP/IH.
- #99 — restauration de la conversion platine IP.
- #110 — support SEF via Sollae TCP.
- #119 — synchronisation des GSP dirty avant Surveillance.
- #120 — normalisation de l'URL Web des alarmes.
- #124 — exécution UTF-8 des seeds SQL Server par l'installateur.

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
