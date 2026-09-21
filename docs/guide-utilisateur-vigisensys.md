# Guide utilisateur VigiSensys

Dernière mise à jour : 16/07/2026

## Objectif

VigiSensys permet de surveiller des lieux instrumentés par des sondes, de suivre les alarmes, d'acquitter les événements, de consulter l'historique des mesures et de gérer les paramètres d'exploitation.

Ce guide décrit les écrans principaux et les actions courantes pour un utilisateur d'exploitation ou un administrateur.

## Accès à l'application

L'application est accessible depuis un navigateur web à l'adresse fournie lors de l'installation, par exemple :

```text
http://adresse-du-serveur:3000
```

Si l'installation est configurée derrière un reverse proxy HTTPS, l'adresse peut être de la forme :

```text
https://vigisensys.example.com
```

### Connexion

1. Ouvrir l'adresse VigiSensys.
2. Saisir le login et le mot de passe.
3. Utiliser l'icône œil si nécessaire pour afficher temporairement le mot de passe saisi.
4. Vérifier l'avertissement **Verr. Maj** : il apparaît lorsque Caps Lock est actif pendant la saisie.
5. Valider la connexion.

Selon la configuration, l'utilisateur peut devoir changer son mot de passe à la première connexion ou après expiration.

### Droits et licences

Les menus visibles dépendent :

- de la licence active ;
- du profil utilisateur ;
- des autorisations affectées au profil ;
- des sites et groupes auxquels l'utilisateur est rattaché.

Si une page n'est pas visible, vérifier d'abord le profil et la licence active.

## Navigation générale

La barre latérale permet d'accéder aux grandes zones :

| Zone | Usage principal |
| --- | --- |
| Tableau de bord | Vue synthétique de l'état de surveillance |
| Surveillance | Suivi temps réel des lieux et sondes |
| Alarmes | Gestion et acquittement des alarmes |
| Messagerie | Conversations internes si le module est activé |
| VigiLog | Suivi des tournées si disponible |
| Administration | Gestion des données, utilisateurs et paramètres |
| Métrologie | Étalons, bains, ajustages et étalonnages selon licence |

## Tableau de bord utilisateur

Le tableau de bord donne une vue rapide :

- des lieux en surveillance ;
- des alarmes actives ;
- des lieux en surveillance désactivée ;
- des tendances d'alarmes ;
- des dernières alarmes nécessitant une action.

Les indicateurs sont destinés à orienter rapidement l'utilisateur vers les pages de détail.

## Page Surveillance

La page Surveillance est l'écran principal d'exploitation.

Elle affiche les lieux sous forme de cartes, avec :

- le site et le groupe ;
- le nom du lieu ;
- le numéro de série de la sonde ;
- le graphique récent ;
- la dernière mesure ;
- l'état radio ou batterie ;
- la fréquence de mesure ;
- le retard d'alarme ;
- les actions rapides.

### Badges de synthèse

En haut de page, les badges indiquent les principaux états :

| Badge | Signification |
| --- | --- |
| OK | Lieux en surveillance sans alarme |
| Pré-alertes | Lieux en pré-alarme |
| Critiques | Lieux en alarme active |
| Terminées | Alarmes terminées à acquitter |
| Désactivés | Lieux dont la surveillance est désactivée |

Un clic sur un badge peut appliquer un filtre correspondant.

### Filtres

Les filtres permettent de réduire l'affichage :

- site ;
- groupe ;
- recherche par nom de lieu ou numéro de série ;
- état d'affichage ;
- vue graphique ou arborescence.

Quand un filtre est actif, un bandeau d'information le signale.

### Vue graphique

La vue graphique affiche les cartes de lieux.

Couleurs principales :

| Couleur | Signification |
| --- | --- |
| Bleu | Situation normale |
| Rouge | Alarme active |
| Orange | Pré-alarme |
| Noir | Non-réponse ou problème technique |
| Violet | Alarme terminée à acquitter |
| Gris | Surveillance désactivée |

Les icônes affichées sur une carte permettent d'accéder aux actions disponibles : détails, acquittement, localisation, paramètres ou activation/désactivation selon les droits.

### Vue arborescence

La vue arborescence regroupe les lieux par site et groupe.

Elle est utile pour :

- vérifier un site complet ;
- repérer rapidement les groupes en défaut ;
- activer ou désactiver la surveillance d'un ensemble de lieux.

### Détail d'un lieu

Depuis une carte, l'utilisateur peut ouvrir le détail d'un lieu.

La fenêtre contient généralement :

- l'identité du lieu et de la sonde ;
- le RSSI ou l'état de communication ;
- la batterie ou l'état d'alimentation ;
- un onglet graphique ;
- un tableau de mesures ;
- un onglet audit.

#### Graphique

Le graphique affiche :

- les mesures ;
- la consigne ;
- les seuils haut et bas ;
- les pré-alarmes si configurées ;
- les événements d'audit si l'option est activée ;
- les remontées mémoire avec un affichage spécifique.

#### Tableau des mesures

Le tableau permet de consulter les mesures brutes, avec la date, la valeur, les seuils, le statut et les informations de communication.

Les mesures issues d'une remontée mémoire sont distinguées visuellement.

#### Audit

L'onglet Audit liste les événements liés au lieu :

- création ou modification ;
- changement de consignes ;
- activation ou désactivation de surveillance ;
- acquittements d'alarme ;
- actions utilisateur ;
- emails d'alarme réellement envoyés pour un déclenchement, une fin d'alarme ou un acquittement.

Les audits d'email indiquent notamment le type d'événement et le destinataire. Une tentative SMTP en échec n'est pas présentée comme un email envoyé.

## Alarmes

La page Alarmes permet de suivre, filtrer et acquitter les alarmes.

### Types d'alarmes

Les principaux types sont :

| Type | Exemple |
| --- | --- |
| Dépassement haut | Valeur supérieure au seuil haut |
| Dépassement bas | Valeur inférieure au seuil bas |
| Non-réponse | La sonde ne répond plus dans le délai prévu |
| Problème module | Le module associé ne répond plus |
| Défaut alimentation | La sonde signale un état batterie ou secteur anormal |
| Pré-alarme | Dépassement d'un seuil de pré-alerte |

### États d'alarme

| État | Description |
| --- | --- |
| Active | L'alarme est en cours |
| Terminée à acquitter | Le défaut est terminé mais doit être acquitté |
| Acquittée | L'alarme a été traitée par un utilisateur |

### Acquitter une alarme

Depuis une carte Surveillance en alarme, l'action **Acquitter** ouvre directement la page d'analyse du lieu sur l'alarme concernée.

La page affiche les alarmes à traiter du lieu dans la colonne de gauche. Pour une alarme sélectionnée :

1. vérifier le résumé et les mesures de la période d'alarme ;
2. cliquer **Acquitter** dans le bandeau **Alarme sélectionnée** ;
3. choisir si nécessaire un commentaire pré-existant et/ou saisir un commentaire libre ;
4. confirmer l'acquittement.

Après confirmation, l'alarme reste visible dans la liste, grisée et marquée **Acquittée**, afin de conserver le contexte du travail en cours. Elle disparaît de cette liste au prochain rafraîchissement, lorsque l'état est rechargé depuis le serveur.

L'acquittement reste tracé dans l'audit général de l'application, même si l'onglet Audit n'est plus affiché sur cette page.

### Multi-acquittement

Les cases de la colonne gauche permettent de sélectionner plusieurs alarmes du même lieu.

Lorsqu'au moins deux alarmes sont sélectionnées :

- le graphique et le tableau sont remplacés par un résumé de chaque alarme ;
- le bouton d'acquittement indique le nombre d'alarmes concernées ;
- un commentaire commun peut être appliqué ;
- les acquittements sont traités séquentiellement ;
- les alarmes effectivement acquittées restent grisées jusqu'au rafraîchissement.

### Analyse d'alarme

La page d'analyse est volontairement centrée sur la période de l'alarme sélectionnée :

- début de l'alarme → fin de l'alarme ;
- début de l'alarme → instant courant si elle est toujours active.

Il n'y a plus de sélecteur de période ni de recherche d'historique sur cet écran. Les onglets disponibles sont **Graphique** et **Tableau des mesures**.

L'onglet Audit et l'affichage des événements d'audit sur la courbe ont été retirés de ce parcours.

L'export de la page est uniquement disponible en **XLSX**. Le classeur contient :

- une feuille **Présentation** ;
- une feuille **Mesures** ;
- la courbe dans la feuille Présentation lorsqu'un graphique est disponible.

L'impression et les exports CSV/PDF/PNG propres à cette page ne sont plus proposés.

## Administration

Les menus d'administration dépendent du profil utilisateur.

### Sites, groupes et lieux

Un lieu correspond à un point surveillé.

Il contient notamment :

- un nom ;
- un site ;
- un ou plusieurs groupes ;
- une sonde ;
- un module ;
- une consigne ;
- des seuils haut et bas ;
- une fréquence ;
- des retards d'alarme ;
- des options de notification.

Lors de la création ou modification d'un lieu, l'application vérifie les valeurs selon le type de sonde lorsque des bornes sont connues.

### Sondes

La gestion des sondes permet :

- d'ajouter une sonde manuellement ;
- d'importer une sonde depuis un fichier d'ajustage ;
- de modifier son module ou son état ;
- de suivre son affectation à un lieu.

### Modules

Les modules représentent les équipements qui communiquent avec les sondes.

Selon les installations, plusieurs modules peuvent partager un worker ou un port de communication. Une mauvaise affectation peut perturber les interrogations.

### Utilisateurs et profils

Les profils définissent les droits :

- accès surveillance ;
- acquittement ;
- gestion des lieux ;
- administration ;
- métrologie ;
- VigiLog ;
- messagerie ;
- paramètres.

Les sites et groupes affectés à un utilisateur limitent les lieux visibles en surveillance.

### Journal d'audit

Le journal d'audit centralise les actions importantes :

- connexion ;
- modification de lieu ;
- changement de paramètres ;
- acquittement ;
- création ou modification d'utilisateur ;
- actions de surveillance ;
- ouverture de graphiques lorsque l'audit correspondant est activé ;
- emails d'alarme effectivement envoyés.

L'écran utilise une pagination serveur : le nombre de lignes par page peut être augmenté jusqu'à 1000 et les pages suivantes chargent réellement les événements supplémentaires. Le filtre de code est scrollable et les codes connus sont traduits selon la langue de l'interface.

## Métrologie

La partie Métrologie regroupe :

- le tableau de suivi métrologique des lieux ;
- les bains et sondes étalons ;
- l'import d'étalonnage ;
- la réalisation d'ajustage ;
- la réalisation d'étalonnage selon licence et droits.

### Bains et sondes étalons

Les sondes étalons contiennent :

- leur type ;
- leurs coefficients ;
- leur incertitude maximale ;
- leur certificat PDF ;
- leur module de communication.

Les milieux d'inter-comparaison contiennent :

- modèle ;
- référence ;
- stabilité ;
- homogénéité ;
- contenu.

### Ajustage

L'ajustage permet de corriger une sonde à partir de mesures comparées avec un étalon.

Pendant l'opération, les sondes concernées passent en état ajustage et ne sont plus interrogées par la surveillance classique.

## Notifications et mailing

Selon la configuration, les alarmes peuvent générer :

- un affichage dans VigiSensys ;
- un son local ;
- un e-mail ;
- une notification agent ;
- une action téléphonique si le module est disponible.

Les destinataires sont définis au niveau du lieu ou de la configuration globale selon le paramétrage.

## Bonnes pratiques

- Vérifier régulièrement les alarmes terminées à acquitter.
- Ne pas laisser des lieux désactivés sans commentaire clair.
- Utiliser les groupes pour organiser la surveillance.
- Contrôler les affectations de sites et groupes des utilisateurs.
- Vérifier les batteries et les défauts d'alimentation.
- Utiliser l'audit pour comprendre une modification ou un comportement inattendu.

## Dépannage rapide

| Symptôme | Vérification |
| --- | --- |
| Une sonde ne répond plus | Vérifier module, port COM, alimentation, RSSI et logs serveur |
| Une alarme ne part pas par mail | Vérifier destinataires, option mailing, licence et service mail |
| Un utilisateur ne voit pas un lieu | Vérifier sites/groupes affectés et droits |
| Une modification de consigne n'arrive pas à la sonde | Vérifier que la sonde répond et que le serveur a pu envoyer la configuration |
| Le graphique semble incomplet | Vérifier remontées mémoire, plage sélectionnée et disponibilité des mesures |

