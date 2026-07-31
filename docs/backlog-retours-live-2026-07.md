# Backlog Retours Live 2026-07

## Contexte
- Source: reunion de retours VigiSensys du 2026-07-02.
- Source complementaire: session de tests live du 2026-07-08.
- Source complementaire 2: session de tests live detaillee du 2026-07-08.
- Environnement: test principalement.
- Statut initial de tous les points de ce fichier: `a analyser`.

## Regle de tri
- `rapide`: faible risque, correctif localise.
- `moyen`: plusieurs couches impactees ou besoin de validation.
- `lourd`: sujet transverse, impact architecture/produit/deploiement.

## 1. Versioning et change log
| ID | Sujet | Impact | Complexite | Statut | Notes |
|---|---|---|---|---|---|
| R-001 | Maintenir un change log avec version a chaque maj | majeur | moyen | fait | Version test detaillee, version prod orientee utilisateur |
| R-002 | Version publique de test | moyen | moyen | a faire | A cadrer avec la strategie de diffusion |

## 2. Cache, rafraichissement et coherence d'affichage
| ID | Sujet | Impact | Complexite | Statut | Notes |
|---|---|---|---|---|---|
| R-010 | Verifier le cache global et possiblement supprimer la notion de cache | majeur | lourd | fait | Les donnees dynamiques (surveillance, mesures, graphiques, dashboards et audits) ne sont plus servies depuis un cache HTTP ou un cache UI considere frais. React Query reste utilise pour l'etat de pagination, mais les vues sont invalidees et rechargees au montage |
| R-011 | Remontees memoire: le graphique ne se met pas a jour apres recuperation serveur | majeur | moyen | en cours | Correctif applique sur la modale de detail: elle recharge maintenant les mesures fraiches au lieu de rester figee sur le snapshot initial de la carte. Validation terrain encore necessaire |
| R-012 | Si filtre actif mais lieu non charge, afficher explicitement `Aucune sonde` | mineur | rapide | en cours | Le refresh recharge maintenant toutes les pages correspondantes quand un filtre serveur est actif, et le bouton `charger plus` a ete replace dans chaque section. Validation terrain encore necessaire |

## 3. Dates, heures et formatage
| ID | Sujet | Impact | Complexite | Statut | Notes |
|---|---|---|---|---|---|
| R-020 | Dates/heures decalees de 2h sur certaines lignes d'audit | majeur | moyen | fait | Les audits globaux, les audits de lieu et les details structures passent desormais par `date-display` avec le fuseau applicatif |
| R-021 | Verifier chaque affichage/reutilisation de date dans le produit | majeur | lourd | fait | Les affichages persistants (audit, surveillance, dashboards, utilisateurs, analyse d'impact, exports, graphiques et messagerie) passent par `date-display`; seuls les controles de saisie et l'horloge locale restent autonomes |
| R-022 | Valeurs au hover affichent parfois trop de decimales | mineur | rapide | fait | Formatage front normalise sur les tooltips graphiques |

## 4. Graphiques et visualisation
| ID | Sujet | Impact | Complexite | Statut | Notes |
|---|---|---|---|---|---|
| R-030 | Afficher les remontees memoire avec une couleur specifique dans le tableau detail lieu | moyen | moyen | fait | Legende explicative et coloration dediee dans le tableau detail |
| R-031 | Passer les graphiques en lignes droites comme analyse d'impact | moyen | rapide | fait | Rendu passe en lignes droites sur le composant partage des details et de l'analyse d'alarme |
| R-032 | Non reponse: pas de trou si moins de 5 non reponses consecutives, trou si 5 ou plus | majeur | moyen | fait | Les petits trous sont maintenant relies visuellement, les longues sequences restent interrompues |
| R-033 | Audit sur courbe: marqueur plus visible et infos au hover | moyen | rapide | fait | Marqueurs agrandis, date formatee et details visibles au hover |
| R-034 | Graphiques detail: afficher les tolerances a gauche | mineur | rapide | fait | Les libelles des seuils/consigne sont maintenant positionnes a gauche |
| R-035 | Graphiques detail: les labels de tolerance ne doivent plus depasser les pointilles | mineur | rapide | fait | Les libelles overlays ne reposent plus sur un double tracage qui sortait visuellement du graphe |

## 5. Licences et bascule de mode
| ID | Sujet | Impact | Complexite | Statut | Notes |
|---|---|---|---|---|---|
| R-040 | Pouvoir switcher de licence directement en version test | majeur | lourd | a faire | A traiter en dernier |
| R-041 | En prod, basculer temporairement en version test depuis hotline pendant x temps | majeur | lourd | a faire | A traiter en dernier |
| R-042 | Pouvoir charger un fichier de licence pour faire changer la licence directement | majeur | moyen | a faire | Probable lien avec workflow d'upgrade |

## 6. Sondes, surveillance et alarmes
| ID | Sujet | Impact | Complexite | Statut | Notes |
|---|---|---|---|---|---|
| R-050 | Verifier que le retard bas n'est pas passe a la sonde | majeur | rapide | fait | Creation et modification de lieu transmettent maintenant distinctement le retard bas et le retard haut. Tous les chemins C# (synchronisation prioritaire, controle periodique et hotline) construisent `ECON...{bas}r{haut}t`, puis `DCON` compare separement `RetardBas` et `RetardHaut` |
| R-051 | Bloquer la surveillance quand code `M` | moyen | moyen | termine | Le code `M` suspend maintenant l'evaluation des seuils et les alarmes de non-reponse GSP. La mesure reste historisee et la surveillance reprend automatiquement quand `M` disparait de la trame |

## 7. Dashboard admin et navigation
| ID | Sujet | Impact | Complexite | Statut | Notes |
|---|---|---|---|---|---|
| R-060 | Journal d'acquittement d'alarme depuis admin dashboard: mauvais lien / page absente | majeur | rapide | fait | Page et lien admin ajoutes |
| R-061 | Bloc `Sauvegarde systeme` present sur tous les dashboards admin sans lien de navigation | mineur | rapide | fait | Carte visible pour toutes les licences, sans clic de navigation |

## 8. Commentaires, agent, hotline
| ID | Sujet | Impact | Complexite | Statut | Notes |
|---|---|---|---|---|---|
| R-070 | Commentaire perso fonctionne mal | moyen | moyen | termine | Le commentaire libre et le commentaire predefini sont reinitialises a la fermeture, au changement d'alarme et apres un acquittement sans fermeture. Une nouvelle fenetre ne reprend plus la saisie precedente |
| R-071 | Message `configuration invalide agent` a revoir | moyen | moyen | termine | Les erreurs internes de licence/dechiffrement ne sont plus affichees globalement dans les pages admin/hotline. Seule une indisponibilite effective de l'agent reste visible |
| R-072 | Revoir les logs pour la hotline | moyen | moyen | fait | Une operation produit au plus un bilan `[HOTLINE][DONE]` et une ligne TX/RX agregee `[HOTLINE][IO]`, tronquee pour les grosses reponses memoire. Les parametres de requete et le cycle du verrou COM sont disponibles avec `Vigitemp.Hotline.LogDetailed=true`; erreurs et timeouts restent toujours traces. |
| R-073 | Revoir les logs serveur: plus propres, moins lourds, plus concis | moyen | moyen | fait | Les traces detaillees de demarrage, affectation, ouverture/fermeture, drain normal, RSSI, cache et scheduler sont desactivees par defaut. Les TX/RX, erreurs et bilans DONE restent visibles; `Vigitemp.Log.Detailed=true` permet de retablir le detail. |

## 9. Mailing et telephonie
| ID | Sujet | Impact | Complexite | Statut | Notes |
|---|---|---|---|---|---|
| R-080 | Mailing: `appliquer au groupe` quand on ajoute un mail dans un lieu | moyen | moyen | fait | Option ajoutee dans l'onglet mailing; les contacts sont recopies sur les autres lieux des groupes selectionnes a la creation et a la modification |
| R-081 | Planning telephonie: plage horaire ou il ne faut pas appeler | majeur | moyen | a faire | A traiter apres |
| R-082 | Ne pas mettre la telephonie pendant 1 mois apres installation | moyen | moyen | a faire | Plus tard, probablement parametre/date de grace |

## 10. Points divers
| ID | Sujet | Impact | Complexite | Statut | Notes |
|---|---|---|---|---|---|
| R-090 | Audit trail d'acquittement n'apparait pas dans les détails d'un lieu | majeur | léger | fait | Le détail d'un lieu recolle maintenant aussi les acquittements via l'alarme historisée, même si la ligne d'audit n'est pas directement rattachée au lieu |

## 11. Retours live du 2026-07-08
| ID | Sujet | Impact | Complexite | Statut | Notes |
|---|---|---|---|---|---|
| R-091 | Exports: appliquer les filtres selectionnes | majeur | moyen | fait | Les alarmes et l'historique des acquittements exportent maintenant toutes les pages correspondant aux filtres; le tableau generique applique aussi sa recherche locale aux donnees d'export |
| R-092 | Exports: revoir la forme Excel/CSV avec onglet de presentation + onglet de donnees | moyen | moyen | fait | Les exports Excel utilisent une feuille Presentation avec logo VigiSensys, titre, date, filtres et nombre de lignes, puis une feuille Donnees stylisee, dimensionnee et filtrable. CSV reste volontairement mono-table car le format ne gere pas les onglets |
| R-093 | Exports: supprimer le langage trop technique/code dans les valeurs exportees | moyen | rapide | fait | Le tableau generique accepte maintenant une valeur metier par colonne; les exports d'alarmes et d'acquittements formatent types, statuts, dates, durees, valeurs et seuils comme dans l'interface |
| R-094 | Page alarmes: verifier le nombre total d'alarmes et la pagination bloquee | majeur | moyen | fait | Le chargement serveur recupere tout l'onglet actif, les compteurs restent globaux et la table pagine localement sans plafond a 200. Les tailles 500 et 1000 sont disponibles et le bouton suivant repose sur le nombre reel de pages. |
| R-095 | Page alarmes: supprimer l'onglet `Acquittees` | mineur | rapide | fait | Onglet retire de la page alarmes |
| R-096 | Page alarmes: retirer le filtre type `terminee` | mineur | rapide | fait | Option retiree du filtre type |
| R-097 | Paginations globales: retirer 30/40 et ajouter 500/1000 | moyen | rapide | fait | Options 30/40 retirees, 500/1000 ajoutees dans le composant de pagination partage |
| R-098 | Acquittement: charger les commentaires libres depuis `tm_journal_commentaire_libre` | moyen | rapide | fait | Menu deroulant branche sur le journal libre code `ACQ` |
| R-099 | Surveillance: afficher les lieux desactives en mode repliable comme l'arborescence | moyen | moyen | fait | Bloc `Lieux avec surveillance desactivee` replie par defaut et depliable |
| R-100 | Surveillance: badge du nombre d'alarmes incorrect | majeur | moyen | fait | Les compteurs top-level distinguent maintenant correctement critiques, pre-alarmes, terminees et desactives |
| R-101 | Surveillance: revoir les badges du haut | majeur | moyen | fait | Badge desactives ajoute, OK sans desactives, separation pre-alarmes / alarmes terminees |
| R-102 | Audit details lieu: dates pas au bon format | moyen | rapide | fait | Le rendu repasse par les helpers de format date/heure |
| R-103 | Audit details lieu: floats trop longs | mineur | rapide | fait | Valeurs numeriques reformatees avec le helper de mesure |
| R-104 | Audit details lieu: ne pas reduire la taille de l'onglet audit | mineur | rapide | fait | Hauteur du tableau audit harmonisee avec le reste de la modale |
| R-105 | Audit details lieu: verifier la presence des audits sur le graphique | moyen | moyen | fait | Les audits sont maintenant traces avec des marqueurs plus visibles sur le graphique detail |
| R-106 | Audit details lieu: proposer 2 tailles d'affichage | moyen | moyen | fait | La modale de detail propose maintenant un basculement entre affichage standard et agrandi |
| R-107 | Graphique details lieu: afficher les plages de remontees memoire avec une couleur differente | majeur | moyen | fait | Les plages memoire sont maintenant surlignees sur le graphe en plus du tableau |
| R-108 | Cards surveillance: supprimer les lettres d'etat et garder uniquement les icones avec hover | mineur | rapide | fait | Le code lettre a ete retire, l'information reste disponible via les icones et tooltips |
| R-109 | GSO: remplacer l'affichage tension par un etat OK / Moyen / Faible | moyen | rapide | fait | Les cartes affichent maintenant un etat batterie metier avec les seuils demandes |
| R-110 | Sonde SPNB-26000068: remontees memoire anormales autour de 11h avec mesures vers 3h le 2026-07-08 | majeur | moyen | fait | L'incident provenait du reset d'horloge de la sonde. Une date manifestement invalide declenche maintenant une synchronisation `ED-H` immediate suivie d'une nouvelle lecture `TEMP`, avant de poursuivre le traitement |
| R-111 | Verifier que l'erreur de justesse est bien prise en compte avec le bon signe | majeur | moyen | fait | Le serveur applique `-Err_Justesse` uniquement si `Est_Correction_Ej` est actif, pour MySQL et MSSQL |
| R-112 | Dashboard utilisateur: certaines alarmes de non reponse affichent l'icone alarme basse | moyen | rapide | fait | Les alarmes non-reponse et module utilisent maintenant l'icone technique WifiOff |
| R-113 | Dashboard utilisateur: affichage de `-7,5` a expliquer/corriger | moyen | rapide | fait | Le padding de l'echelle de tendance des alarmes est maintenant borne a zero |
| R-114 | Dashboard utilisateur: ajouter une echelle sur le graphique de tendance d'alarmes | mineur | rapide | fait | Echelle min/max et reperes temporels affiches sur la tendance |
| R-115 | Dashboard utilisateur: ajouter un camembert par type d'alarmes | moyen | moyen | fait | Camembert calcule sur toutes les alarmes actives accessibles, avec detail par type |
| R-116 | Mail d'alarme terminee pour les GSO ne part pas | majeur | moyen | fait | Suivi persistant en base; envoi retente et marque uniquement apres succes HTTP |

## 12. Retours live detailles du 2026-07-08
| ID | Sujet | Impact | Complexite | Statut | Notes |
|---|---|---|---|---|---|
| R-117 | Exports: les filtres selectionnes ne sont pas appliques | majeur | moyen | fait | Les filtres serveur, les filtres de type et la recherche locale sont appliques au jeu complet avant export; l'historique charge aussi toutes les pages au-dela de 1000 lignes |
| R-118 | Exports Excel/CSV: revoir la presentation | moyen | moyen | fait | Excel dispose des feuilles Presentation et Donnees, du logo VigiSensys, de largeurs adaptees, d'en-tetes stylises et d'un filtre automatique |
| R-119 | Exports: remplacer les libelles trop techniques par du vocabulaire metier | moyen | rapide | fait | Doublon de R-093 traite sur les alarmes actives et l'historique des acquittements |
| R-120 | Page alarmes: nombre total incoherent et pagination bloquee | majeur | moyen | fait | Doublon de R-094: les onglets affichent les totaux globaux, le libelle du tableau distingue les lignes visibles du total charge et la pagination accepte plus de 200 alarmes. |
| R-121 | Page alarmes: supprimer l'onglet `Acquittees` | mineur | rapide | fait | Deja corrige sur la page alarmes, doublon de R-095 |
| R-122 | Page alarmes: retirer le filtre type d'alarme `terminee` | mineur | rapide | fait | Deja corrige sur la page alarmes, doublon de R-096 |
| R-123 | Paginations: retirer 30 et 40, ajouter 500 et 1000 | moyen | rapide | fait | Deja corrige sur les tableaux concernes, doublon de R-097 |
| R-124 | Acquittement: charger les commentaires libres depuis `tm_journal_commentaire_libre` | moyen | rapide | fait | Deja branche sur l'acquittement, doublon de R-098 |
| R-125 | Surveillance: afficher les lieux desactives en bloc repliable/depliable | moyen | moyen | fait | Bloc replie par defaut avec depliage manuel |
| R-126 | Surveillance: badge du nombre d'alarmes incorrect | majeur | moyen | fait | Recalcul des stats de synthese corrige |
| R-127 | Surveillance: revoir les badges du haut | majeur | moyen | fait | Badges reorganises selon le retour metier |
| R-128 | Audit details de lieu: dates pas au bon format | moyen | rapide | fait | Helpers de format reappliques |
| R-129 | Audit details de lieu: floats trop longs | mineur | rapide | fait | Affichage normalise a partir du helper de mesure |
| R-130 | Audit details de lieu: ne pas reduire la taille de l'onglet audit | mineur | rapide | fait | Hauteur du tableau audit alignee sur le reste |
| R-131 | Audit details de lieu: verifier que les audits apparaissent bien sur le graphique | moyen | moyen | fait | Presence et positionnement corriges sur le composant partage |
| R-132 | Audit details de lieu: proposer deux tailles d'affichage | moyen | moyen | fait | La modale de detail permet maintenant de passer d'un format standard a un format agrandi |
| R-133 | Graphique details de lieu: afficher les plages de remontees memoire avec une couleur differente | majeur | moyen | fait | Les plages memoire sont maintenant visibles distinctement sur le graphe |
| R-134 | Cards surveillance: retirer les lettres d'etat, ne garder que les icones avec hover | mineur | rapide | fait | Les cartes n'affichent plus de code lettre, uniquement des icones explicites |
| R-135 | GSO: remplacer l'affichage de tension par un etat batterie | moyen | rapide | fait | Tension brute remplacee sur les cartes par un etat OK / Moyen / Faible |
| R-136 | SPNB-26000068: remontees memoire anormales autour de 11h avec mesures de 3h du matin le 08/07 | majeur | moyen | fait | Doublon de R-110: reset d'horloge identifie et resynchronisation immediate ajoutee avant traitement de la mesure |
| R-137 | Verifier que l'erreur de justesse est bien appliquee avec le bon signe | majeur | moyen | fait | Le serveur applique l'inverse de l'erreur de justesse lorsque la correction est active |
| R-138 | Dashboard utilisateur: certaines alarmes de non reponse affichent l'icone alarme basse | moyen | rapide | fait | Mapping corrige vers l'icone technique |
| R-139 | Dashboard utilisateur: affichage de `-7,5` a expliquer/corriger | moyen | rapide | fait | Doublon de R-113: l'echelle des comptages d'alarmes ne descend plus sous zero |
| R-140 | Dashboard utilisateur: ajouter une echelle sur le graphique de tendance d'alarmes | mineur | rapide | fait | Echelle ajoutee au graphique de tendance |
| R-141 | Dashboard utilisateur: ajouter un camembert type d'alarmes | moyen | moyen | fait | Camembert alimente par un comptage serveur complet |
| R-142 | Mail d'alarme terminee pour les GSO ne part pas | majeur | moyen | fait | Correctif commun avec R-116, compatible MySQL et SQL Server |

## 13. Retours backlog du 2026-07-13
| ID | Sujet | Impact | Complexite | Statut | Notes |
|---|---|---|---|---|---|
| R-143 | Remontees memoire: thread dedie avec buffer de demandes | majeur | lourd | fait | Le thread d'interrogation place les lots lus dans une file concurrente; un worker dedie filtre la plage puis insere uniquement les mesures absentes. |
| R-144 | Remontees memoire: stocker debut et fin de non reponse dans une nouvelle table | majeur | moyen | fait | `tm_remontee_plage_gsp` est presente dans les seeds MySQL et MSSQL avec les statuts persistants `A_FAIRE`, `EN_COURS`, `TRAITEE` et `ERREUR`, les tentatives et la derniere erreur. |
| R-145 | Remontees memoire: construire les demandes a partir des vraies plages date/heure | majeur | lourd | fait | Le serveur agrege la premiere date de debut et la derniere date de fin, puis calcule offset et volume selon la frequence et l'heure serveur. |
| R-146 | Remontees memoire: ne pas lancer de demande si la non reponse n'a pas encore de fin | majeur | rapide | fait | La plage est creee seulement lors d'une nouvelle reponse valide; les alarmes actives `N` ou `M` reportent la demande. En cas d'echec de verification SQL, le traitement reste bloque par securite. |
| R-147 | Page admin alarmes: erreur 500 depuis le dashboard admin | majeur | moyen | fait | `/admin/alarmes` reutilise le chargement serveur et l'ecran principal stabilise au lieu de l'ancien client autonome branche sur `/api/alarmes` |
| R-148 | Acquittement page alarmes: statut non mis a jour sur la surveillance | majeur | moyen | fait | L'acquittement met a jour le capteur correspondant dans le cache puis invalide les donnees alarmes, surveillance et dashboards |
| R-149 | Surveillance: agrandir en largeur le badge alarmes du header | mineur | rapide | fait | Le bouton d'acces aux alarmes actives dans le header a ete elargi pour afficher proprement le volume d'alarmes |
| R-150 | Afficher le nombre d'alarmes sur le lien de la page alarmes | mineur | rapide | fait | Le dashboard admin affiche maintenant le nombre d'alarmes directement dans le lien d'acces a la page alarmes |
| R-151 | Ameliorer l'affichage des audits trop "code" | moyen | moyen | fait | Les details des audits de lieu masquent maintenant les champs techniques bruts, resumant les changements avec des libelles metier et des valeurs reformatees |
| R-152 | Modale de lieu: plage par defaut sur la journee courante | majeur | moyen | fait | A l'ouverture, la modale charge maintenant par defaut la journee courante pour le graphe, le tableau et l'audit |
| R-153 | Cards surveillance: retirer les boutons details et plan | mineur | rapide | fait | Les actions details et plan ont ete retirees des cards de surveillance |
| R-154 | Tableau de mesures: afficher les remontees memoire en italique, sans couleur | mineur | rapide | fait | La mise en avant amber a ete retiree au profit d'un rendu en italique uniquement |
| R-155 | Passer les mails a envoyer en base via `notification` pour suivi | majeur | lourd | fait | File persistante dans `t_notification` (`ALARM_EMAIL`) avant SMTP, deduplication alarme/evenement/destinataire, statuts/tentatives/erreur dans le payload, envoi immediat puis reprise periodique par le serveur (5 tentatives max) |
| R-156 | Nouveaux logos light/dark: utiliser le logo blanc dans la sidebar | mineur | rapide | fait | Le logo de sidebar est maintenant force en rendu blanc sur les barres laterales sombres |

## 14. Retours backlog du 2026-07-15
| ID | Sujet | Impact | Complexite | Statut | Notes |
|---|---|---|---|---|---|
| R-157 | Acquittement automatique des alarmes de non reponse | majeur | moyen | fait | Champ present dans les seeds, comportement serveur MySQL/MSSQL implemente et parametrage admin ajoute: recherche, activation individuelle, tout cocher/decocher et audit par lieu. |

## 15. Retours backlog du 2026-07-16
| ID | Sujet | Impact | Complexite | Statut | Notes |
|---|---|---|---|---|---|
| R-158 | Graphiques: ne pas afficher les audits par defaut | mineur | rapide | fait | Les audits restent activables manuellement dans les graphiques de lieu et d'analyse d'alarme. |
| R-159 | Graphiques: prevoir un export de la courbe | moyen | moyen | fait | Export PNG ajoute au composant partage, disponible dans les details de lieu et l'analyse d'alarme. |

## 16. Retours backlog du 2026-07-31
| ID | Sujet | Impact | Complexite | Statut | Notes |
|---|---|---|---|---|---|
| R-160 | Analyse d'impact: ajouter un bouton imprimer | mineur | rapide | fait | Fonction deja presente: le bouton declenche l'impression de la page avec la mise en page dediee. |
| R-161 | Lieux desactives: permettre d'ouvrir l'historique des mesures | majeur | rapide | fait | Le bouton historique est present sur les cartes desactivees et ouvre la modale de details avec acces au choix de plage et au tableau. |
| R-162 | Tableau des mesures: afficher correctement toutes les mesures | majeur | moyen | fait | Pagination rendue fraiche a chaque chargement, ordre serveur conserve entre les pages et retour automatique a la premiere page lors d'un changement de lieu, plage ou preference de non-reponse. |

## Proposition d'ordre de traitement
1. R-011 remontees memoire non visibles
2. R-012 aucun lieu/aucune sonde si filtre actif sans resultat charge -> si on met un filtre sur la page de surveillance (par exemple une recherche de lieu), qu'on change de page, et qu'on revient, si le lieu ne fait pas parti des 50 lieux chargés de base, alors on voit aucun résultat
3. R-050 retard bas sonde
4. R-033 audit plus visible sur courbe
5. R-034 / R-035 ajustements visuels tolerances
6. R-020 / R-021 unification dates/heures
7. R-010 revue/suppression cache
8. R-080 mailing appliquer au groupe
9. R-081 / R-082 telephonie
10. R-070 / R-071 / R-072 / R-073 points reportes
11. R-040 / R-041 / R-042 switch licence et upgrade licence
12. R-091 / R-092 / R-093 exports
13. R-094 / R-095 / R-096 / R-097 page alarmes et paginations
14. R-098 / R-099 / R-100 / R-101 / R-108 / R-109 surveillance
15. R-102 / R-103 / R-104 / R-105 / R-106 / R-107 audit details lieu
16. R-110 incident SPNB-26000068
17. R-111 erreur de justesse
18. R-112 / R-113 / R-114 / R-115 dashboard utilisateur
19. R-116 mail d'alarme terminee GSO
20. R-117 / R-118 / R-119 exports
21. R-120 / R-121 / R-122 / R-123 page alarmes et paginations
22. R-124 / R-125 / R-126 / R-127 / R-134 / R-135 surveillance
23. R-128 / R-129 / R-130 / R-131 / R-132 / R-133 audit details lieu
24. R-136 incident SPNB-26000068
25. R-137 erreur de justesse
26. R-138 / R-139 / R-140 / R-141 dashboard utilisateur
27. R-142 mail d'alarme terminee GSO
28. R-143 / R-144 / R-145 / R-146 refonte remontees memoire
29. R-147 page admin alarmes 500
30. R-148 acquittement page alarmes -> surveillance
31. R-149 / R-150 header et lien alarmes
32. R-151 audit plus lisible
33. R-152 / R-153 details modale lieu et cards surveillance
34. R-154 remontees memoire en italique dans le tableau
35. R-155 notifications mail en base
36. R-156 nouveaux logos light/dark sidebar
37. R-158 affichage audits sur graphiques par defaut
38. R-159 export de courbe / graphique

## Points a preciser
- R-002 `version publique de test`: parle-t-on d'un environnement expose, d'un badge visible, ou d'un canal de diffusion logiciel ?
- R-010 suppression du cache: faut-il vraiment supprimer tout cache ou seulement les caches UI / revalidation qui perturbent l'affichage ?
- R-032 non reponse et trous sur courbe: le seuil de 5 s'applique-t-il a 5 mesures null consecutives strictes ?
- R-040 / R-041 switch licence: comportement exact attendu sur les droits, modules et caches une fois la licence changee ?
- R-082 telephonie pendant 1 mois: blocage complet des appels ou simple desactivation par defaut avec possibilite d'override admin ?
