# Backlog Retours Live - 2026-04-07/08

Ce fichier centralise les retours de la journ?e de revue live.

R?gles de suivi:
- `[ ]` ? faire
- `[-]` en cours
- `[x]` fait
- priorit?: `Rapide`, `Moyen`, `Lourd`

## Quick Wins Prioritaires

### Dashboard utilisateur
- [x] `Rapide` Remplacer `derni?res 24h` par `derniers 7j`.
- [x] `Rapide` Ajouter une ?chelle au graphique d'alarmes.
- [x] `Moyen` Ajouter un bouton `D?tails` menant vers une page listant les alarmes par lieu.

### Page de connexion
- [x] `Rapide` Afficher un pop-up 7 jours avant l'obligation de changement de mot de passe.
- [x] `Rapide/Moyen` Lors de la détection de la première connexion, envoie vers un mauvais lien.

### Profil utilisateur
- [x] `Rapide` Corriger le chargement de l'avatar personnalis?.

### Services
- [x] `Rapide` Supprimer le lien vers Vigilog.

### Surveillance
- [x] `Rapide` Quand on fait une recherche sur la page de surveillance via le champ de recherche, limiter la taille des cards ? celle de base (actuellement les r?sultats vont prendre tout l'?cran).
- [x] `Rapide` Vider le champ de recherche d?s qu'on change de page.
- [x] `Rapide` Supprimer `x sondes affich?s`.
- [x] `Rapide` Modifier la couleur du nombre de lieux en haut.
- [x] `Rapide` Passer le statut `OK` en bleu.
- [x] `Rapide` Ajouter un tooltip sur les stats du bandeau haut.
- [x] `Rapide` Parler en `lieux` plut?t qu'en `sondes`.
- [x] `Rapide` Ajouter un tooltip sur `derni?re mesure`.
- [x] `Rapide` R?duire le padding des ic?nes sur les cards.
- [x] `Rapide` Passer la derni?re date/heure sous la derni?re mesure.
- [x] `Rapide` Aligner le point d'?tat sur les cards.
- [x] `Rapide` Remplacer le point d'exclamation par un point d'interrogation.
- [x] `Rapide` Afficher les observations du lieu au survol.
- [x] `Rapide` Ajouter les pr?-alarmes dans la l?gende.
- [x] `Rapide` Tracer les pr?-alarmes sur les graphs preview.
- [x] `Rapide` Corriger l'unit?: priorit? ?talonnage, fallback `t_lieu.Unite`, afficher `degr?s` pour `C`.
- [x] `Rapide` Afficher sur les cards d?sactiv?es: `d?sactiv?e depuis le ... par ...` + commentaire.
- [x] `Rapide` Ajouter une colonne / info `nombre de sondes sans lieu` sur dashboard admin.
- [x] `Rapide` Supprimer le bouton `d?sactiver la surveillance d'un groupe` et le basculer en admin.
- [x] `Rapide` Quand une plage est s?lectionn?e, d?charger les graphs derri?re puis recharger ? la fermeture.

### Surveillance - modal d?tails / historique
- [x] `Rapide` Corriger les traductions `monitoringDetailsModal.chart.drag_zoom_hint` et `monitoringDetailsModal.chart.reset_zoom`.
- [x] `Rapide` Le tableau de la modal doit s'?tendre au lieu de rester fixe.
- [x] `Rapide` Fixer les headers des tables.
- [x] `Rapide` Quand une plage est s?lectionn?e, ne pas afficher les audits dans l'onglet `tableau des mesures`.
- [x] `Rapide` Garder l'audit sur l'onglet graphique.
- [x] `Rapide` Traduire le code `d?tails` dans la table d'audit.
- [x] `Rapide` Corriger la string parasite / doublon de recherche dans l'audit.
- [x] `Rapide` Corriger la superposition lignes de tol?rance / pointill?s / infobulle.
- [x] `Rapide` Faire porter l'infobulle de survol sur la courbe de mesures, pas sur les lignes de consigne.

### Lieux - ?dition / cr?ation
- [x] `Rapide` Si des modifications non enregistr?es existent: bloquer clic ext?rieur / close / ?chap avec confirmation.
- [x] `Rapide` Retirer `sauvegarder pour plus tard` et `vider le formulaire` des modals d'?dition.
- [x] `Rapide` Garder ces boutons seulement en cr?ation.
- [x] `Rapide` En ?dition, passer `site` ? c?t? de `groupe`.
- [x] `Rapide` Supprimer `type de lieu`.
- [x] `Rapide` Mettre `observations` ? la place et permettre d'agrandir le champ.
- [x] `Rapide` Site obligatoire, groupe facultatif.
- [x] `Rapide` Si aucune sonde s?lectionn?e: surveillance d?sactiv?e obligatoire + champ gris?.
- [x] `Rapide` Ne pas pr?remplir la surveillance en cr?ation; forcer un choix explicite.
- [x] `Rapide` Corriger l'affichage d'une tol?rance minimale quand elle n'est pas renseign?e.
- [x] `Rapide` Validation: consigne inf <= consigne sup et inversement, c?t? UI et serveur, revoir le message serveur.
- [x] `Rapide` Figer la fr?quence ? `15 min` pour les GSO.
- [x] `Rapide` Ajouter un trait au-dessus de la consigne dans le bloc consignes.
- [x] `Rapide` Remplacer `ordre` par `priorit?` dans mailing.
- [x] `Rapide` Griser `via t?l?phone` avec mention `? venir`.
- [x] `Rapide` Pouvoir assigner une sonde ?talon.
- [x] `Rapide` Corriger l'unit? qui doit remonter depuis la derni?re unit? `t_lieu`.
- [x] `Rapide` Retirer `toutes les` devant la fr?quence.
- [x] `Rapide` Ajouter une colonne `planning consigne` indiquant s'il existe une ou plusieurs r?gles.
- [x] `Rapide` Fusionner les retards d'alarme dans une seule colonne.
- [x] `Rapide` Fusionner tol?rances inf/sup dans une m?me colonne.
- [x] `Rapide` Ne pas proposer des sondes d?j? affect?es ? un lieu, en cr?ation comme en modification.

### Planning de consignes
- [x] `Rapide` Si d?but et fin sur le m?me jour, ne pas afficher `Lundi - Lundi`.
- [x] `Rapide` Corriger les cl?s i18n:
  - `lieux.planning.backToBaseSetPoints`
  - `lieux.planning.dialog.baseSetpointsTitle`
  - `lieux.planning.dialog.baseSetpoint`
  - `lieux.planning.dialog.baseFrequency`
  - `lieux.planning.dialog.baseUpper`
  - `lieux.planning.dialog.baseLower`
- [x] `Rapide` Ne pas afficher l'id de la r?gle.
- [x] `Rapide` Ne pas s?lectionner de jours par d?faut.

### Alarmes
- [x] `Rapide` Corriger la traduction `alarmsPage.table.columns.triggered_value`.
- [x] `Rapide` Pour les non-r?ponses, afficher `-` au lieu de `0.0`.
- [x] `Rapide` Mettre ? jour le nombre d'alarmes apr?s acquittement.
- [x] `Rapide` Calculer la dur?e d'alarme m?me si elle n'est pas termin?e.

### Historique d'acquittement d'alarmes
- [x] `Rapide` Faire remonter le nom du lieu.
- [x] `Rapide` Ajouter tous les types d'alarme.
- [x] `Rapide` Renommer `Type` en `Type d'alarme`.
- [x] `Rapide` Remplacer le filtre par site par un filtre par lieu.
- [x] `Rapide` Retirer le bouton `Filtrer` et passer en recherche dynamique.
- [x] `Rapide` Indiquer que la recherche porte sur `lieu` et `utilisateur`.
- [x] `Rapide` Remplacer l'ic?ne actuelle par une loupe.
- [x] `Rapide` Remplacer la colonne `sonde` par `dur?e`.
- [x] `Rapide` Si acquitt?e avant fin, afficher la dur?e jusqu'? acquittement.

### Messagerie
- [x] `Rapide` Corriger le chargement de l'avatar image.
- [x] `Rapide` Liste des documents partag?s: fond distinct + retour ? la ligne si nom trop long.
- [x] `Rapide` Remplacer `Membre depuis` par `Conversation rejointe depuis ...` ou ?quivalent.

### Dashboard admin
- [x] `Rapide` Supprimer la tuile ?talons.
- [x] `Rapide` La tuile journal d'audit doit afficher la journ?e en cours.
- [x] `Rapide` Au clic sur la tuile audit, ouvrir la page audit avec les filtres d?j? appliqu?s.

### Hotline
- [x] `Rapide` Remplacer le placeholder `COM101` par `COMXXX` dans le portail hotline.

### Transversal
- [x] `Moyen` Ajouter sur chaque page de gestion un onglet suppl?mentaire `... archiv?s` s?parant les ?l?ments actifs des ?l?ments archiv?s (utilisateurs, sondes, modules, etc.).
  - [x] `Rapide` Page `Utilisateurs`: onglets `Actifs / Archiv?s`.
  - [x] `Rapide` Page `Sondes`: onglets `Actives / Archiv?es`.
  - [x] `Rapide` Page `Modules`: onglets `Actifs / Archiv?s`.
  - [x] `Rapide` Page `Sites`: onglets `Actifs / Archiv?s`.
  - [x] `Rapide` Page `Groupes`: onglets `Actifs / Archiv?s`.
  - [x] `Rapide` Page `Lieux`: onglets `Actifs / Archiv?s`.
  - [x] `Moyen` Page `Profils`: onglets `Actifs / Archiv?s` avec archivage logique.
- [x] `Rapide` Ne pas compter les sondes archiv?es dans `sondes sans lieu actif`.

### Profils
- [x] `Rapide` Passer les inputs sur fond blanc.
- [x] `Rapide` Ajouter une case globale pour cocher toutes les autorisations.

### Admin - utilisateurs
- [x] `Rapide` Si un admin change le mot de passe, marquer `mot de passe temporaire` en BDD.
- [x] `Rapide` Regrouper les infos `aucun groupe ou site s?lectionn? ...` dans un seul rectangle au-dessus.
- [x] `Rapide` Afficher les listes sites / groupes dans des zones scrollables en cr?ation et modification.
- [x] `Rapide` Rendre le mail non obligatoire.

### Admin - alarmes
- [x] `Rapide` `derni?re valeur` -> `valeur de d?clenchement`.
- [x] `Rapide` Corriger les consignes sup/inf qui ne remontent pas correctement.
- [x] `Rapide` Permettre la s?lection de 200 ?l?ments.
- [x] `Rapide` Reprendre la m?me fen?tre que l'historique d'acquittement.
- [x] `Rapide` Mettre d?but et fin d'alarme dans la m?me colonne, puis ?tat, puis dur?e.
- [x] `Rapide` Ouvrir la dialog d'acquittement au clic sur la ligne.

### Admin - audit
- [x] `Rapide` Remplacer le filtre par code par un filtre par action.
- [x] `Rapide` Arriver avec le filtre `aujourd'hui` (00:00 -> 23:59).
- [x] `Rapide` Indiquer qu'il faut s?lectionner une range plus pr?cise pour plus de 100 entr?es.
- [x] `Rapide` Garder la limite ? 100 par d?faut.
- [x] `Rapide` Retirer le champ de recherche utilisateur.
- [x] `Rapide` Supprimer la colonne cible.

### Admin - import ?talonnage
- [x] `Rapide` Ajouter la colonne `nom ?talonnage` optionnelle.
- [x] `Rapide` Ajouter des lignes d?pliantes pour les infos non visibles.
- [x] `Rapide` Ajouter un bouton pour afficher les mesures ?talon dans une dialog.
- [x] `Rapide` Au r?cap, indiquer qu'il faut enregistrer via le bouton et rendre ce bouton visible.
- [x] `Rapide` Passer `vider la liste` en rouge + confirmation.
- [x] `Rapide` Faire de la s?lection une s?lection de suppression, pas d'insertion.
- [x] `Rapide` Renommer `ins?rer en base` en `valider / enregistrer / valider l'import`.
- [x] `Rapide` Afficher un message si la sonde n'est pas encore cr??e.

### Admin - analyse d'impact
- [x] `Rapide` Revoir le nombre d'alarmes r?elles.
- [x] `Rapide` Sur la courbe, afficher le d?tail peu importe o? on vise, comme en surveillance.
- [x] `Rapide` Revoir le format date/heure actuellement JS natif.
- [x] `Rapide` Corriger les pointill?s dessin?s sur la tol?rance inf.

### Admin - param?tres
- [x] `Rapide` Ajouter l'intervalle de rafra?chissement.
- [x] `Rapide` Alerte validit? ?talonnage: griser le champ quand pas manuel, vide par d?faut, v?rifier couleurs et comportement.
- [x] `Rapide` Renommer `audit trail` en `Trace dans le journal d'audit`.
- [x] `Rapide` Griser le choix fuseau horaire quand d?sactiv?.
- [x] `Rapide` Ne pas enregistrer imm?diatement; afficher un bandeau `annuler / enregistrer`.
- [x] `Rapide` `verrouillage auto` -> `d?connexion auto`.
- [x] `Rapide` Passer le max de caract?res mot de passe ? 24.
- [x] `Rapide` Si modif SMTP: audit + log.

### Admin - sondes
- [x] `Rapide` `validit? ajustage` -> `validit? ?talonnage`.
- [x] `Rapide` Ajouter / corriger `?tat`.
- [x] `Rapide` Rendre scrollable le bandeau de type.
- [x] `Rapide` Supprimer `GSP` et `GSO` du bandeau type, garder les types concrets.
- [x] `Rapide` V?rifier offset non dispo en pack et son usage c?t? serveur C#.
- [x] `Rapide` Pour module, afficher le nom + port COM num?ro.

### Admin - modules
- [x] `Rapide` M?me style de header que les autres pages.
- [x] `Rapide` Afficher le count sur la page.

### Admin - groupes
- [x] `Rapide` Afficher le nombre d'utilisateurs ? c?t? de `lieux` et renommer en `nombre de lieux`.
- [x] `Rapide` Ne pas s?lectionner un regroupement par d?faut.

### Admin - sites
- [x] `Rapide` Renommer `libell? site` en `nom site`.
- [x] `Rapide` Supprimer `code site` apr?s v?rification d'usage et modification BDD.
- [x] `Rapide` Interdire l'archivage d'un site utilis? avec message explicite.

### Admin - outils
- [x] `Rapide` `test de connexion` -> `test de sonde`.
- [x] `Rapide` Supprimer les relais.
- [x] `Rapide` Ajouter `lieu` juste apr?s `sonde`.
- [x] `Rapide` `signal lu` doit afficher la mesure actuelle; rien pour non-r?ponse.
- [x] `Rapide` Ne pas afficher les GSO et les stats parasites.
- [x] `Rapide` Message avant test: la lecture prend la priorit? sur la surveillance, demander une dur?e max (1 min par d?faut, 5 min max).
- [x] `Rapide` Commentaires: ajouter un type.
- [x] `Rapide` Pouvoir cr?er des commentaires avec ce type.
- [x] `Rapide` Supprimer `%1` et `%2` des types de commentaire.
- [x] `Rapide` `ACQ` = `acquittement d'alarme`.
- [x] `Rapide` Supprimer `config et surveillance`.

### Technique / audit
- [x] `Rapide` Supprimer le dispatch service de l'audit.
- [x] `Rapide` Retirer l'impression sur les tables.
- [x] `Rapide` Corriger les libell?s BDD m?tier:
  - `tm_mesure_etalon` = ?talon
  - `tm_mesure_etalonnage` = sonde ?talonn?e

## Backlog d?taill? par page / fonctionnalit?

### Dashboard utilisateur
- [x] `Rapide` Remplacer `derni?res 24h` par `derniers 7j`.
- [x] `Rapide` Ajouter une ?chelle au graphique d'alarmes.
- [x] `Moyen` Bouton `D?tails` vers une page de visualisation des alarmes par lieu.

### Page statistiques
- [ ] `Lourd` Cr?er une page `stats`, accessible depuis le dashboard utilisateur et la sidebar.
- [ ] `Lourd` Afficher tous les lieux en surveillance auxquels l'utilisateur a acc?s.
- [ ] `Lourd` Permettre la s?lection de p?riode.
- [ ] `Lourd` Afficher pour la p?riode:
  - r?cap lieu (nom, site-groupe, consignes/tol?rances, fr?quences, retards)
  - mini
  - maxi
  - moyenne
  - nombre d'alarmes
  - dur?e d'alarme cumul?e haute/basse s?par?e
  - dur?e de d?passement haute/basse sans alarme.

### Surveillance
#### Filtres et navigation
- [x] `Rapide` Vider la recherche au changement de page.
- [x] `Rapide` Rendre le site obligatoire.
- [x] `Rapide` Groupe facultatif.
- [x] `Rapide` Supprimer `x sondes affich?s`.
- [x] `Rapide` Retirer la d?sactivation de surveillance groupe du dashboard et la basculer en admin.

#### KPIs / stats
- [x] `Rapide` Couleur du nombre de lieux.
- [x] `Rapide` `OK` en bleu.
- [x] `Rapide` Tooltip sur stats hautes.
- [x] `Rapide` Terminologie `lieux` au lieu de `sondes`.

#### Cards de lieux
- [x] `Rapide` Afficher d?sactiv?e depuis/par/commentaire.
- [x] `Rapide` Tooltip sur derni?re mesure.
- [x] `Rapide` R?duire padding ic?nes.
- [x] `Rapide` Mettre date/heure sous la derni?re mesure.
- [x] `Rapide` Aligner le point d'?tat.
- [x] `Rapide` Point d'interrogation au lieu d'exclamation.
- [x] `Rapide` Survol -> observations.
- [x] `Moyen` Revoir le header:
  - point clignotant + lettre alarme en haut
  - observations en bas
  - m?me disposition hors alarme.
- [x] `Rapide` Commenter le code du bouton localisation.

#### Graphs preview
- [x] `Rapide` Ajouter les pr?-alarmes ? la l?gende.
- [x] `Rapide` Tracer les pr?-alarmes.

#### Mesures / unit?s
- [x] `Rapide` Priorit? ?talonnage puis fallback unit? lieu.
- [x] `Rapide` `C` -> `degr?s`.

#### Modal d?tails / historique
##### Traductions
- [x] `Rapide` `monitoringDetailsModal.chart.drag_zoom_hint`.
- [x] `Rapide` `monitoringDetailsModal.chart.reset_zoom`.

##### Table / layout
- [x] `Rapide` Table extensible.
- [x] `Rapide` Headers fix?s.
- [x] `Moyen` Agrandir la zone de plage s?lectionn?e.
- [x] `Rapide` En s?lection de plage, garder l'audit sur le graphe mais pas dans l'onglet tableau.

##### Graphe
- [x] `Moyen` Drag / zoom.
- [x] `Moyen` Zoom par encadrement de zone.
- [x] `Moyen` Toggle pour afficher les audits sur le graphique.
- [x] `Moyen` En s?lection de plage, lignes pleines plut?t que pointill?s.
- [x] `Rapide` Corriger la superposition lignes / pointill?s / tooltip.
- [x] `Rapide` L'infobulle doit se coller ? la courbe de mesures.
- [x] `Moyen` ?ventuellement resserrer les pointill?s de consigne.

##### Audit
- [x] `Rapide` Traduire le code `d?tails`.
- [x] `Rapide` Corriger la string parasite / doublon de recherche.

##### Export
- [x] `Moyen` Demander le nombre de mesures ? exporter.
- [x] `Moyen` Exporter toutes les colonnes.
- [x] `Moyen` S?lection des colonnes.
- [x] `Rapide` Revoir le format date/heure.
- [x] `Rapide` Ajouter `num?ro de s?rie sonde`.
- [x] `Rapide` Nom de fichier `nom lieu + date`.
- [x] `Lourd` Export multi-onglets: pr?sentation + mesures.

#### Param?trage / actions sur lieu
- [x] `Moyen` Lors des actions de param?trage, demander un commentaire optionnel.
- [x] `Moyen` Afficher ce commentaire dans la colonne commentaire.
- [x] `Moyen` Si plusieurs infos changent, les auditer dans une seule ligne BDD avec affichage multi-lignes propre.
- [x] `Moyen` Param?tre admin pour imposer ou non le commentaire.

#### Alarmes m?tier li?es ? la surveillance
- [x] `Lourd` Ajouter l'alarme `coupure secteur / coupure alimentation`.
- [x] `Lourd` Pour `IE/IP`, interpr?ter `B` / `BAT` dans la trame.
- [x] `Moyen` Int?grer ce type dans les tris et pages alarmes.
- [x] `Moyen` Pour GSP, notifier si batterie < 50%.
- [x] `Moyen` Pour GSP, mail si batterie < 25%.
- [x] `Moyen` Ajouter ces seuils en param?tres.
- [ ] `? cadrer` Voir avec Nico la possibilit? d'une valeur neutralisant les alarmes d'une sonde.

#### Templates
- [ ] `Lourd` Mettre en place un syst?me de template de cr?ation/configuration de lieux.

### Lieux - cr?ation / ?dition
#### Modal globale
- [x] `Rapide` Confirmation de sortie si modifs non enregistr?es.
- [x] `Moyen` Boutons `Annuler` et `Enregistrer` avec mini-menu:
  - enregistrer/annuler et fermer
  - enregistrer/annuler et rester.
- [x] `Rapide` Retirer `save pour plus tard` / `vider` des modals d'?dition.
- [x] `Rapide` Les garder uniquement en cr?ation.

#### Mise en page ?dition
- [x] `Rapide` Site ? c?t? de groupe.
- [x] `Rapide` Type de lieu supprim?.
- [x] `Rapide` Observations ? la place, champ agrandissable.
- [x] `Rapide` Site obligatoire.
- [x] `Rapide` Groupe facultatif.

#### Cr?ation
- [x] `Rapide` Sans sonde, forcer `surveillance d?sactiv?e` et griser le champ.
- [x] `Rapide` Ne pas pr?s?lectionner la surveillance.
- [x] `Rapide` Forcer l'utilisateur ? choisir.

#### Consignes / validations
- [x] `Rapide` Corriger tol?rance minimale affich?e ? tort.
- [x] `Rapide` Bloquer les incoh?rences consigne inf/sup en UI et serveur.
- [x] `Rapide` Revoir le message serveur.
- [x] `Rapide` GSO = fr?quence forc?e ? 15 min.
- [x] `Rapide` Ajouter le trait visuel au-dessus de consigne.
- [x] `Moyen` Revoir l'ensemble des v?rifications de valeurs.

#### ?talonnage
- [ ] `Lourd` G?rer le multi-?talonnage.
- [x] `Moyen` Choix manuel d'un ?talonnage ? appliquer.
- [ ] `Moyen` Modes standard et expert.
- [x] `Moyen` Audit de l'application d'?talonnage.
- [x] `Rapide` Ajouter un nom d'?talonnage non obligatoire.

#### Mailing / escalade
- [x] `Rapide` `ordre` -> `priorit?`.
- [x] `Rapide` Griser `via t?l?phone`.
- [ ] `Lourd` Planning hebdo type Teams pour destinataires mail/t?l?phone.

#### Colonnes / liste admin des lieux
- [x] `Rapide` Assigner une sonde ?talon.
- [x] `Rapide` Unit? depuis derni?re unit? lieu.
- [x] `Rapide` Retirer type de lieu.
- [x] `Rapide` Retirer `toutes les` de la fr?quence.
- [x] `Rapide` Colonne planning de consigne.
- [x] `Rapide` Colonne unique retard alarme.
- [x] `Rapide` Colonne unique tol?rances inf/sup.
- [x] `Rapide` Exclure les sondes d?j? affect?es.

### Planning de consignes
- [x] `Moyen` Revoir l'affichage global.
- [x] `Rapide` Ne pas afficher `Lundi - Lundi`.
- [x] `Rapide` Corriger les cl?s i18n list?es plus haut.
- [x] `Rapide` Pas de jours pr?s?lectionn?s.
- [x] `Moyen` R?p?ter une r?gle vers d'autres jours si un seul jour d?but/fin.
- [x] `Rapide` Ne pas afficher l'id de r?gle.

### Autorisations / profils / acc?s
- [ ] `Lourd` Repasser sur toutes les autorisations et v?rifier les acc?s.

#### Profils
- [x] `Rapide` Inputs en fond blanc.
- [x] `Rapide` Case globale `tout cocher`.
- [x] `Moyen` Ajouter deux onglets:
  - autorisations
  - utilisateurs affect?s.

#### Groupes
- [x] `Rapide` Afficher nombre d'utilisateurs et `nombre de lieux`.
- [x] `Moyen` Deux onglets: cr?ation + utilisateurs affect?s.
- [x] `Rapide` Ne pas pr?s?lectionner un regroupement.

#### Sites
- [x] `Moyen` Deux onglets: cr?ation + utilisateurs affect?s.
- [x] `Rapide` `libell? site` -> `nom site`.
- [x] `Moyen` Supprimer `code site` apr?s v?rification et migration table.
- [x] `Rapide` Bloquer l'archivage d'un site utilis?.

#### Utilisateurs
- [x] `Rapide` MDP admin chang? => flag mot de passe temporaire.
- [x] `Rapide` Fusionner le rectangle d'info en un seul.
- [x] `Rapide` Listes sites/groupes scrollables.
- [x] `Rapide` Mail non obligatoire.

### Alarmes
#### Page alarmes
- [x] `Rapide` Corriger `triggered_value`.
- [x] `Moyen` Cases ? cocher multi-types d'alarmes.
- [x] `Rapide` Non-r?ponse = `-`.
- [x] `Moyen` Revoir les onglets qui ne rechargent pas correctement.
- [x] `Rapide` Mise ? jour du nombre d'alarmes apr?s acquittement.
- [x] `Moyen` Acquittement multiple avec filtres lieu/site et s?lection multiple.

#### M?tier
- [ ] `Moyen` Revoir le d?clenchement des alarmes GSO par mail.
- [ ] `Lourd` Ajouter le type `secteur / alimentation`.
- [x] `Moyen` Calculer la dur?e d'alarme m?me non termin?e.

#### Admin alarmes
- [x] `Rapide` `derni?re valeur` -> `valeur de d?clenchement`.
- [x] `Rapide` Corriger la remont?e consignes sup/inf.
- [x] `Rapide` S?lection de 200 ?l?ments.
- [x] `Rapide` Reprendre la m?me fen?tre que l'acquittement standard.
- [x] `Rapide` Mettre d?but+fin dans une m?me colonne, puis ?tat, puis dur?e.
- [x] `Rapide` Ouvrir la dialog d'acquittement au clic sur ligne.
- [x] `Moyen` Acquitter plusieurs alarmes d'un coup avec filtres lieu/site.

#### Historique d'acquittement
- [x] `Rapide` Nom du lieu.
- [x] `Rapide` Tous les types d'alarme.
- [x] `Rapide` `Type` -> `Type d'alarme`.
- [x] `Rapide` Filtre lieu au lieu de site.
- [x] `Rapide` `Actualiser` dans la table.
- [x] `Rapide` Recherche dynamique, bouton filtrer retir?.
- [x] `Rapide` Recherche indiqu?e sur lieu/utilisateur, ic?ne loupe.
- [x] `Rapide` Colonne dur?e, y compris si acquitt?e avant fin.
- [x] `Moyen` Export.

### Messagerie
- [x] `Rapide` Avatar image.
- [x] `Rapide` Fond distinct + wrap documents partag?s.
- [x] `Rapide` `Conversation rejointe depuis ...`.

### Vigilog
- [x] `Rapide/Moyen` Erreur lors de la configuration d'un vigilog :
| '[2026-04-09 13:43:17.085] [ERROR] [services/vigilog/agent/configure] vigilog_agent_configure_failed {"error":{}}
[2026-04-09 13:43:17.087] [HTTP] [HTTP] POST /api/services/vigilog/agent/configure - 503 {"user":"EBO","userId":8,"ip":"192.168.63.144","duration":671,"statusCode":503,"error":"req_b50a58a654374a2f","errorBody":"Impossible de parametrer le logger VigiLog","requestBody":{"configurationId":4}} '| 
- [ ] `Moyen` V?rifier le d?chargement si mauvais Vigilog.
- [ ] `Moyen` Permettre la cr?ation de tourn?e ? l'arriv?e.
- [x] `Rapide` Ajouter une card de stats pour les usages ponctuels.
- [ ] `Moyen` Usage ponctuel: pr?paration d'un Vigilog.
- [ ] `Moyen` D?part/arriv?e: case `d?j? pr?par?`.
- [ ] `Moyen` Si oui, cr?er juste la tourn?e; sinon appliquer la config.
- [x] `Rapide` Ne pas choisir une config par d?faut.
- [ ] `Lourd` Nouvel onglet `usage ponctuel` pour remplacement temporaire de sonde hors lieu existant.
- [x] `Rapide` `num?ro de s?rie` -> `num?ro de s?rie constructeur`.

### Dashboard admin
- [ ] `Lourd` Mettre en place la sauvegarde syst?me:
  - backup BDD
  - t?che planifi?e
  - contr?le dossier / nom du fichier / date de modification.
- [x] `Rapide` Tuile journal audit du jour courant, clic -> page audit filtr?e.
- [x] `Rapide` Supprimer la tuile ?talons.
- [x] `Rapide` `sondes sans lieu actif` sans les sondes archiv?es.
- [x] `Rapide` Ajouter la tuile `nombre de sondes sans lieu`.

### Admin - audit
- [x] `Rapide` Filtre par action au lieu de code.
- [x] `Rapide` Affichage par d?faut sur la journ?e courante.
- [x] `Rapide` Message explicatif pour limiter ? 100 entr?es.
- [x] `Rapide` Retirer recherche utilisateur d?di?e.
- [x] `Rapide` Supprimer colonne cible.
- [x] `Rapide` Supprimer le dispatch service de l'audit.

### Admin - import ?talonnage
- [x] `Rapide` Colonne `nom ?talonnage`.
- [x] `Moyen` Lignes d?pliantes.
- [x] `Moyen` Dialog mesures ?talon.
- [x] `Rapide` R?cap avec message + bouton visible.
- [x] `Rapide` `vider la liste` en rouge + confirmation.
- [x] `Rapide` S?lection d?di?e suppression.
- [x] `Rapide` Renommer le CTA d'insertion.
- [x] `Rapide` Message sonde non cr??e.

### Admin - analyse d'impact
- [x] `Moyen` Export PDF avec m?me mise en page.
- [x] `Rapide` Revoir nombre d'alarmes r?elles.
- [x] `Rapide` Interaction graphe comme surveillance.
- [x] `Rapide` Format date/heure lisible.
- [ ] `Lourd` Analyse d'impact en s?lectionnant un ?talonnage.
- [x] `Rapide` Corriger les pointill?s sur tol?rance inf.

### Admin - param?tres
- [x] `Rapide` Intervalle de rafra?chissement.
- [x] `Rapide` Validit? ?talonnage: ?tat, couleurs, gris?, valeur par d?faut.
- [x] `Rapide` Libell? `consultation de graphiques` / `Trace dans le journal d'audit`.
- [x] `Rapide` Fuseau horaire gris? quand d?sactiv?.
- [x] `Rapide` Ne pas enregistrer ? la vol?e; bandeau annuler / enregistrer.
- [x] `Rapide` `verrouillage auto` -> `d?connexion auto`.
- [ ] `Moyen` Mode / profil visualisation surveillance uniquement.
- [x] `Rapide` Max mot de passe = 24.
- [x] `Rapide` Audit + log sur modif SMTP.

### Admin - sondes
- [x] `Rapide` `validit? ajustage` -> `validit? ?talonnage`.
- [x] `Rapide` V?rifier / compl?ter l'?tat.
- [x] `Rapide` Rendre scrollable le bandeau type.
- [x] `Rapide` Retirer `GSP` / `GSO` au profit des types concrets.
- [x] `Rapide` V?rifier offset non dispo en pack + usage c?t? serveur C#.
- [x] `Rapide` Module = nom + port COM.

### Admin - modules
- [ ] `Moyen` Double clic sur une sonde du tableau bas pour modifier uniquement le module.
- [x] `Rapide` M?me header visuel que les autres pages.
- [x] `Rapide` Count affich? sur la page.

### Admin - ?talons
- [ ] `Moyen` Import XML quand disponible.

### Admin - outils
#### Test de sonde
- [x] `Rapide` Renommer `test de connexion` en `test de sonde`.
- [x] `Rapide` Retirer les relais.
- [x] `Rapide` Ajouter `lieu` apr?s `sonde`.
- [x] `Rapide` `signal lu` = mesure actuelle, rien si non-r?ponse.
- [ ] `Moyen` ? la fin, proposer un r?cap des 10 derni?res mesures par sonde.
- [x] `Rapide` Ne pas afficher les GSO / stats parasites.
- [x] `Moyen` Avant test, pr?venir que la lecture prend la priorit? sur la surveillance et demander une dur?e max.

#### Commentaires
- [x] `Rapide` Ajouter un type de commentaire.
- [x] `Rapide` Pouvoir cr?er des commentaires avec type.
- [x] `Rapide` Supprimer `%1` et `%2` des types.
- [x] `Rapide` `ACQ` = acquittement d'alarme.

#### Divers
- [x] `Rapide` Supprimer `config et surveillance`.

### Technique / architecture
- [x] `Moyen` Retirer l'impression sur les tables.
- [x] `Rapide` Clarifier `tm_mesure_etalon` vs `tm_mesure_etalonnage`.
- [ ] `Lourd` ?tudier un serveur d'interrogation principal (`Id_Serveur = 1`) pilotant les sous-serveurs, avec arr?t centralis?.

## Notes de cadrage
- Les quick wins sont la priorit? demand?e.
- Plusieurs sujets sont explicitement `? cadrer` ou `Lourd` et demandent un design avant implementation:
  - templates lieux
  - planning Teams mailing
  - usage ponctuel Vigilog
  - stats utilisateur
  - sauvegarde syst?me admin
  - architecture multi-serveurs d'interrogation

### Serveur d'interrogation / protocoles
- [ ] `Moyen` D?bugger les sondes quand on envoie une fr?quence de `1 min (1f)`.

### Création / modification des sondes
- [x] `Rapide` La liste déroulante de type n'est pas scrollable

### Erreurs dans les logs
- [x] `Rapide/Moyen` Logs sur le serveur de "prod test" :
[2026-04-09 14:00:17.475] [INFO] [ADJUSTMENT_PREVIEW] Ajustage preview requested {"user":"JTA","userId":2,"ip":"127.0.0.1","hasFile":true}
[2026-04-09 14:00:17.491] [INFO] [ADJUSTMENT_PREVIEW] Ajustage preview parsed {"user":"JTA","userId":2,"ip":"127.0.0.1","fileName":"Calibrage_EN02463_2026040913565376.xml","sonde":"EN02461","date":"2024-10-28T13:29:00.000Z","warnings":0}
[2026-04-09 14:00:17.501] [INFO] [ADJUSTMENT_PREVIEW] Ajustage preview requested {"user":"JTA","userId":2,"ip":"127.0.0.1","hasFile":true}
[2026-04-09 14:00:17.503] [INFO] [ADJUSTMENT_PREVIEW] Ajustage preview parsed {"user":"JTA","userId":2,"ip":"127.0.0.1","fileName":"Calibrage_EN02466_2026040913570786.xml","sonde":"EN02465","date":"2021-11-19T13:06:00.000Z","warnings":0}
[2026-04-09 14:00:18.129] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"127.0.0.1","duration":11,"statusCode":200}
[2026-04-09 14:00:22.351] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":11,"statusCode":200}
[2026-04-09 14:00:28.462] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"127.0.0.1","duration":11,"statusCode":200}
[2026-04-09 14:00:32.407] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":12,"statusCode":200}
[2026-04-09 14:00:38.784] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"127.0.0.1","duration":6,"statusCode":200}
[2026-04-09 14:00:42.441] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":9,"statusCode":200}
[2026-04-09 14:00:49.130] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"127.0.0.1","duration":11,"statusCode":200}
[2026-04-09 14:00:52.478] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":10,"statusCode":200}
[2026-04-09 14:00:54.714] [HTTP] [HTTP] GET /api/alarmes - 200 {"user":"JTA","userId":2,"ip":"127.0.0.1","duration":18,"statusCode":200}
[2026-04-09 14:00:58.085] [HTTP] [HTTP] GET /api/sondes - 200 {"user":"JTA","userId":2,"ip":"127.0.0.1","duration":14,"statusCode":200}
[2026-04-09 14:00:59.157] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"127.0.0.1","duration":9,"statusCode":200}
[2026-04-09 14:01:00.848] [INFO] [ADJUSTMENT_IMPORT] Bulk adjustment import requested {"user":"JTA","userId":2,"ip":"127.0.0.1","files":2,"moduleId":91}
[2026-04-09 14:01:00.884] [INFO] [ADJUSTMENT_IMPORT] Bulk adjustment import completed {"user":"JTA","userId":2,"ip":"127.0.0.1","inserted":2,"skipped":0,"createdSensorsFromAdjustment":2,"invalidatedEtalonnages":0,"invalidatedEtalonnageMeasures":0}
[2026-04-09 14:01:00.885] [HTTP] [HTTP] POST /api/sondes/ajustages/bulk - 200 {"user":"JTA","userId":2,"ip":"127.0.0.1","duration":40,"statusCode":200}
[2026-04-09 14:01:02.518] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":14,"statusCode":200}
[2026-04-09 14:01:08.584] [HTTP] [HTTP] GET /api/alarmes - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":17,"statusCode":200}
[2026-04-09 14:01:09.500] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"127.0.0.1","duration":10,"statusCode":200}
[2026-04-09 14:01:12.567] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":11,"statusCode":200}
[2026-04-09 14:01:13.706] [INFO] [ADJUSTMENT_PREVIEW] Ajustage preview requested {"user":"JTA","userId":2,"ip":"127.0.0.1","hasFile":true}
[2026-04-09 14:01:13.709] [INFO] [ADJUSTMENT_PREVIEW] Ajustage preview parsed {"user":"JTA","userId":2,"ip":"127.0.0.1","fileName":"Calibrage_HN0AC8_2026040913572435.xml","sonde":"HN0AC6","date":"2021-04-20T12:42:00.000Z","warnings":0}
[2026-04-09 14:01:13.719] [INFO] [ADJUSTMENT_PREVIEW] Ajustage preview requested {"user":"JTA","userId":2,"ip":"127.0.0.1","hasFile":true}
[2026-04-09 14:01:13.719] [INFO] [ADJUSTMENT_PREVIEW] Ajustage preview parsed {"user":"JTA","userId":2,"ip":"127.0.0.1","fileName":"Calibrage_HN0414_2026040913573897.xml","sonde":"HN0414","date":"2008-04-01T09:03:00.000Z","warnings":0}
[2026-04-09 14:01:19.535] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"127.0.0.1","duration":12,"statusCode":200}
[2026-04-09 14:01:22.611] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":10,"statusCode":200}
[2026-04-09 14:01:29.890] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"127.0.0.1","duration":12,"statusCode":200}
[2026-04-09 14:01:32.645] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":12,"statusCode":200}
[2026-04-09 14:01:37.552] [INFO] [ADJUSTMENT_IMPORT] Bulk adjustment import requested {"user":"JTA","userId":2,"ip":"127.0.0.1","files":2,"moduleId":90}
[2026-04-09 14:01:37.578] [INFO] [ADJUSTMENT_IMPORT] Bulk adjustment import completed {"user":"JTA","userId":2,"ip":"127.0.0.1","inserted":2,"skipped":0,"createdSensorsFromAdjustment":2,"invalidatedEtalonnages":0,"invalidatedEtalonnageMeasures":0}
[2026-04-09 14:01:37.578] [HTTP] [HTTP] POST /api/sondes/ajustages/bulk - 200 {"user":"JTA","userId":2,"ip":"127.0.0.1","duration":27,"statusCode":200}
[2026-04-09 14:01:42.765] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":10,"statusCode":200}
[2026-04-09 14:06:31.785] [INFO] [ALARM_REALTIME] Alarm realtime event broadcasted {"ip":"192.168.63.189","eventType":"triggered","alarmId":3459,"idLieu":50,"subscribers":2}
[2026-04-09 14:06:31.786] [HTTP] [HTTP] POST /api/alarmes/dispatch-realtime - 200 {"ip":"192.168.63.189","duration":6,"statusCode":200}
[2026-04-09 14:06:35.528] [WARN] [ALARM_DISPATCH] Agent notification failed {"ip":"127.0.0.1","machineName":"DESKTOP-NDO4EP9","error":"agent_http_401"}
[2026-04-09 14:06:35.528] [INFO] [ALARM_DISPATCH] Alarm dispatched to agents {"ip":"192.168.63.189","alarmId":3459,"eventType":"triggered","lieuId":50,"alarmTypeCode":"N","agentTargets":1,"agentFailed":1}
[2026-04-09 14:06:35.862] [ERROR] [email] failed_to_send_email {"error":{"code":"EAUTH","response":"535 Incorrect authentication data","responseCode":535,"command":"AUTH PLAIN"}}
[2026-04-09 14:06:35.863] [WARN] [ALARM_EMAIL] Alarm event email send failed {"eventType":"triggered","alarmId":3459,"to":"e.boez@mc2lab.fr","error":"Invalid login: 535 Incorrect authentication data"}
[2026-04-09 14:06:35.863] [INFO] [ALARM_EMAIL] Alarm email dispatch result {"ip":"192.168.63.189","alarmId":3459,"eventType":"triggered","attempted":1,"sent":0,"skipped":null,"usedSystemFallback":false}
[2026-04-09 14:06:35.864] [HTTP] [HTTP] POST /api/alarmes/dispatch - 200 {"ip":"192.168.63.189","duration":381,"statusCode":200}
[2026-04-09 14:16:39.532] [HTTP] [HTTP] POST /api/auth/logout-auto - 200 {"user":"JTA","userId":2,"ip":"127.0.0.1","duration":2,"statusCode":200}
[2026-04-09 14:16:39.539] [HTTP] [HTTP] POST /api/auth/logout-auto - 200 {"user":"JTA","userId":2,"ip":"127.0.0.1","duration":1,"statusCode":200}
[2026-04-09 14:18:20.264] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":11,"statusCode":200}
[2026-04-09 14:18:30.316] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":11,"statusCode":200}
[2026-04-09 14:18:40.373] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":12,"statusCode":200}
[2026-04-09 14:18:50.702] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":11,"statusCode":200}
[2026-04-09 14:19:00.743] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":12,"statusCode":200}
[2026-04-09 14:19:10.802] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":11,"statusCode":200}
[2026-04-09 14:19:11.861] [HTTP] [HTTP] GET /api/alarmes - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":21,"statusCode":200}
[2026-04-09 14:19:20.854] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":14,"statusCode":200}
[2026-04-09 14:19:28.316] [HTTP] [HTTP] GET /api/modules/91/sondes - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":5,"statusCode":200}
[2026-04-09 14:19:30.886] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":10,"statusCode":200}
[2026-04-09 14:19:40.941] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":9,"statusCode":200}
[2026-04-09 14:19:50.996] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":12,"statusCode":200}
[2026-04-09 14:20:01.041] [HTTP] [HTTP] GET /api/chat/unread-count - 200 {"user":"JTA","userId":2,"ip":"192.168.63.214","duration":11,"statusCode":200}
[2026-04-09 14:21:36.669] [INFO] [ALARM_REALTIME] Alarm realtime event broadcasted {"ip":"192.168.63.189","eventType":"ended","alarmId":null,"idLieu":50,"subscribers":1}
[2026-04-09 14:21:36.670] [HTTP] [HTTP] POST /api/alarmes/dispatch-realtime - 200 {"ip":"192.168.63.189","duration":1,"statusCode":200}
[2026-04-09 14:21:36.701] [INFO] [ALARM_DISPATCH] Alarm dispatched to agents {"ip":"192.168.63.189","alarmId":3459,"eventType":"ended","lieuId":50,"alarmTypeCode":"N","agentTargets":0,"agentFailed":0}
[2026-04-09 14:21:37.050] [ERROR] [email] failed_to_send_email {"error":{"code":"EAUTH","response":"535 Incorrect authentication data","responseCode":535,"command":"AUTH PLAIN"}}
[2026-04-09 14:21:37.050] [WARN] [ALARM_EMAIL] Alarm event email send failed {"eventType":"ended","alarmId":3459,"to":"e.boez@mc2lab.fr","error":"Invalid login: 535 Incorrect authentication data"}
[2026-04-09 14:21:37.050] [INFO] [ALARM_EMAIL] Alarm email dispatch result {"ip":"192.168.63.189","alarmId":3459,"eventType":"ended","attempted":1,"sent":0,"skipped":null,"usedSystemFallback":false}
[2026-04-09 14:21:37.051] [HTTP] [HTTP] POST /api/alarmes/dispatch - 200 {"ip":"192.168.63.189","duration":362,"statusCode":200}
