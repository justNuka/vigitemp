# Suivi modules et retours reunion - 2026-06-03

## Objectif

Centraliser les retours de reunion du 2026-06-03 pour eviter les oublis pendant les prochains chantiers.

Statuts utilises :

| Statut | Sens |
| --- | --- |
| A traiter | Sujet a analyser et implementer. |
| En cours | Sujet commence mais pas termine. |
| A arbitrer | Besoin de decision produit/technique avant implementation. |
| Ignore pour le moment | Sujet volontairement hors scope actuel. |
| Fait | Sujet implemente et verifie. |

## Priorites rapides

1. Corriger la gestion du refresh surveillance quand une modal est ouverte. Fait, premiere passe.
2. Revoir l'acquittement d'alarme pour afficher toutes les alarmes du lieu et permettre le multi-acquittement. En cours, premiere passe fonctionnelle.
3. Verifier cote serveur l'utilisation de `Date_Heure_Derniere_Reponse_Recue_OK`. Fait, premiere passe.
4. Decaler les envois de configuration GSP vers les moments creux. Fait, avec priorite des pushes dirty.
5. Structurer le module sondes etalon, sans lancer tout le module ajustage/etalonnage complet.
6. Ameliorer l'affichage de l'audit pour les modifications de lieu/sonde/groupe/site/utilisateur/parametres.
7. La mémoire des GSP n'a pas l'air de remonter correctement dans le serveur, a verifier.
8. Review le fichier de logs pour trouver si des bugs/problèmes sont détectés.

## Installation Pack Dutscher

Statut : Ignore pour le moment

Scope note, a reprendre plus tard :

- Installateur simplifie pour installation Pack.
- MySQL.
- Recuperation automatique de l'adresse IP.
- Installation sur une seule machine.

Decision actuelle : ne pas traiter maintenant.

## Authentification / Session

Statut : En cours, premiere passe fonctionnelle

Probleme :

- Lors de la connexion, si l'utilisateur n'a pas ete connecte depuis X heures, il n'a pas toujours besoin de se reconnecter.
- Ce comportement n'est pas attendu.
- Hypothese actuelle : redemarrage serveur ou persistence/session trop permissive -> hypothèse du redémarrage serveur dû à une maj très fortement possible.

Actions a verifier :

- Verifier la duree reelle des tokens/session cookies.
- Verifier si le redemarrage web invalide ou conserve l'etat attendu.
- Verifier les refresh tokens et le stockage cote navigateur.
- Definir le comportement attendu apres X heures d'inactivite.

## Serveur C# / Interrogation

### Derniere reponse recue OK

Statut : Fait, deuxieme passe

Objectif :

- Verifier l'utilisation de `Date_Heure_Derniere_Reponse_Recue_OK` dans le serveur pour le déclenchement d'alarmes de non réponse (surtout en cas de redémarrage serveur, évite de ne pas générer d'alarme de non réponse).
- Cette colonne doit correspondre a une mesure qui a repondu, non null, et dans les seuils.

Points a verifier :

- Mise a jour uniquement sur mesure valide.
- Non mise a jour sur non-reponse, mesure null, alarme haute/basse, alarme module.
- Usage possible dans l'ordonnancement ou la detection de trous.

Correction 2026-06-03 :

- `Date_Heure_Derniere_Reponse_Recue_OK` est chargee dans les parametres d'alarme du lieu cote serveur.
- Sur mesure normale et sur remontee memoire GSP, la colonne n'est avancee que si la valeur est dans les seuils actifs du lieu.
- Sur non-reponse / mesure null / alarme module, la colonne n'est pas modifiee.
- Au premier timeout apres un redemarrage, le serveur recale le debut du retard non-reponse sur `Date_Heure_Derniere_Reponse_Recue_OK` au lieu de repartir de l'heure courante.
- Build serveur OK via `dotnet build "Vigitemp Serveur\\Vigitemp Serveur.sln" --no-restore`.
- TypeScript web OK via `pnpm exec tsc --noEmit`.

Point d'attention :

- La colonne represente bien une reponse "OK" au sens metier : mesure non-null et dans les seuils actifs. Une sonde qui repond mais reste en depassement haut/bas ne repousse donc pas cette date.

### Envoi des consignes GSP

Statut : Fait, premiere passe

Probleme :

- Le serveur ne doit pas envoyer une demande de consigne juste apres une interrogation si cela encombre le port COM.

Comportement cible :

- Garder les demandes de configuration en file d'attente.
- Envoyer les configurations GSP pendant un moment creux.
- Ne pas bloquer le cycle principal d'interrogation.

Points lies :

- Scheduler des prochaines interrogations.
- Detection des trous libres.
- File de commandes par port COM / module.

Correction 2026-06-03 :

- Le cycle d'interrogation GSP ne lance plus de verification/envoi de configuration (`DCON`/`ECON`) apres `TEMP`.
- Les modifications de configuration restent marquees dans le scheduler via `ConfigDirty`.
- Le flag BDD `Infos_Modifiees_Depuis_Derniere_Mesure` n'est plus remis a zero lors du simple chargement scheduler.
- Le flag BDD est remis a zero uniquement apres succes du job de configuration GSP.
- Les envois de configuration passent par `CFG-JOB`, qui attend un creneau libre sur le port COM.
- Les modifications de lieu declenchent un job `push` complet pendant un creneau libre.
- Hors modification, le serveur ne demande plus `DCON` a chaque interrogation : il marque un job `verify` apres `Vigitemp.Gsp.ConfigCheckEverySuccessfulProbes` mesures GSP reussies (12 par defaut).
- Un `verify` conforme remet le compteur a zero sans toucher au flag BDD ; un `push` reussi remet aussi `Infos_Modifiees_Depuis_Derniere_Mesure` a false.
- Les `push` de configuration marques `ConfigDirty` sont maintenant prioritaires sur les interrogations GSP normales.
- Les `verify` periodiques restent opportunistes et ne preemptent pas la surveillance normale.
- Build serveur OK via `dotnet build "Vigitemp Serveur\\Vigitemp Serveur.sln" --no-restore`.

## Acquittement d'alarme

Statut : A traiter

Objectif :

- Transformer la modal d'acquittement pour gerer toutes les alarmes du lieu, pas seulement une alarme isolee.

Fonctionnalites attendues :

- Afficher un tableau avec toutes les alarmes concernees.
- Premiere alarme depliee par defaut avec les informations actuelles.
- Permettre le multi-acquittement via cases a cocher.
- Des qu'une alarme est acquittee, l'afficher comme acquittee dans le tableau.
- Conserver les commentaires pre-existants et les remonter correctement.

Points UI :

- Prevoir un affichage lisible si le lieu a beaucoup d'alarmes.
- Ne pas perdre la saisie du commentaire pendant les refresh.
- Clarifier si le meme commentaire s'applique a toutes les alarmes cochees ou si chaque ligne peut avoir son propre commentaire.

Correction 2026-06-03 :

- La modal charge les alarmes non acquittees du meme lieu.
- Selection multi-alarmes via cases a cocher.
- Acquittement sequentiel des alarmes selectionnees avec un commentaire commun.
- Le cache surveillance est marque pour les alarmes acquittees.
- Le graphique ouvert depuis la modal d'acquittement charge de nouveau l'historique du lieu.
- La modal n'est plus reinitialisee sur simple changement de reference de l'objet alarme : la saisie du commentaire est preservee tant que l'alarme/lieu ne change pas.

Reste a traiter :

- Refonte UI complete sous forme de tableau detaille avec premiere alarme depliee.
- Affichage visuel plus clair des alarmes deja acquittees dans la modal si on decide de les inclure.
- Arbitrage commentaire unique vs commentaire par ligne.

## Page Surveillance

### Refresh et modals

Statut : Fait, premiere passe

Problemes :

- Quand on acquitte une alarme, le rafraichissement automatique se fait et peut perturber la modal.
- Quand une fenetre est ouverte, les graphes peuvent etre decharges ou la page peut se rafraichir trop fortement.

Comportement cible :

- Quand une fenetre/modale est ouverte, stopper uniquement le timer de refresh.
- Ne pas decharger les graphes.
- Quand la fenetre est fermee, reprendre le timer la ou il en etait, sans le recommencer.
- Frequence de refresh par defaut : 1 minute.

Correction 2026-06-03 :

- Defaut serveur passe a 60 secondes.
- Le timer est suspendu quand une modal/fenetre est ouverte.
- A la fermeture, le timer reprend avec le temps restant.
- La fermeture d'une modal ne declenche plus de refresh force immediat.
- Les graphes ne sont plus decharges par un refresh force de sortie de modal.

### Commentaires d'acquittement

Statut : Fait, premiere passe

Probleme :

- Dans l'acquittement d'alarme, les commentaires pre-existants ne remontent pas correctement.

Action :

- Verifier l'API et le composant de modal.
- Verifier les donnees disponibles en base et le mapping front.

Correction 2026-06-03 :

- La modal etait deja branchee sur `/api/alarmes/commentaires-acquittement`.
- L'API est forcee en dynamique pour eviter un retour stale.
- Les commentaires vides sont filtres avant retour front.
- Les textes restent mappes sur `id`, `type`, `text`.

### Etats etalonnage / ajustage

Statut : Fait, premiere passe

Objectif :

- Afficher les lieux en etat `E` pour etalonnage.
- Afficher les lieux en etat `A` pour ajustage.
- Rendre ces etats visibles sur la page surveillance.

Points a definir :

- Couleur / badge pour `E`.
- Couleur / badge pour `A`.
- Comportement d'alarme pendant ces etats.
- Si ces etats doivent exclure l'interrogation normale ou seulement modifier l'affichage.

Correction 2026-06-03 :

- Les cartes de surveillance affichent un badge `Etalonnage` quand `Lieu_Etat = E`.
- Les cartes de surveillance affichent un badge `Ajustage` quand `Lieu_Etat = A`.
- Les libelles sont ajoutes dans les traductions FR/EN.
- Aucun changement metier n'est applique pour le moment : `A` et `E` restent des etats visibles, sans exclusion automatique de l'interrogation ou des alarmes.

## Audit

Statut : En cours, deuxieme passe technique faite

Retours :

- Ne pas afficher uniquement `id lieu`.
- Afficher le nom du lieu.
- Afficher la modification effectuee.
- Afficher login + nom + prenom de l'utilisateur.

Actions :

- Revoir les payloads d'audit pour creation/modification lieu, sonde, groupe, site, utilisateur, parametres.
- Enrichir l'affichage audit sans casser l'historique existant.
- Garder l'identifiant technique en metadata si utile, mais ne pas en faire l'information principale.

Correction 2026-06-04 :

- Les lectures d'audit web enrichissent maintenant les lignes existantes sans changer le format stocke en base.
- L'ecran audit admin affiche desormais :
  - login utilisateur
  - nom + prenom quand disponibles
  - nom du lieu quand `Id_Lieu` est present
  - adresse IP extraite du commentaire technique quand presente
- La recherche cote audit prend aussi en compte :
  - login
  - nom complet
  - nom du lieu
- Validation TypeScript OK via `pnpm exec tsc --noEmit`.

Correction 2026-06-04 - ecriture :

- Les creations suivantes ecrivent maintenant un audit metier plus exploitable :
  - site
  - groupe
  - lieu
  - sonde
  - module
  - actionneur
  - utilisateur
  - profil
  - etalon
- Les modifications suivantes ecrivent maintenant un `reason` explicite au lieu d'un simple evenement technique :
  - site
  - groupe
  - sonde
  - module
  - actionneur
  - utilisateur
  - profil
  - etalon
- Les routes d'audit elles-memes (`/api/audit`, `/api/audit/codes`) sont maintenant bornees par `PARAMETRES_GERER`.
- Validation TypeScript OK via `pnpm exec tsc --noEmit`.

Reste a traiter :

- Enrichir cote ecriture les actions critiques pour que le detail de modification soit plus explicite directement dans le journal.
- Revoir en priorite les evenements :
  - modification des parametres
  - acquittement d'alarme / operations sur alarmes
  - activation / desactivation de surveillance
  - futur mode surveillance prolongee
  - operations metrologie secondaires
- Verifier si la route de modification lieu doit encore etre enrichie sur certains cas metier fins, meme si elle porte deja un audit detaille multi-champs.

Points deja couverts :

- creation / modification lieu
- creation / modification sonde
- creation / modification groupe
- creation / modification site
- creation / modification utilisateur / profil
  - modification des parametres

## Autorisations

Statut : En cours, troisieme passe technique faite

Constat 2026-06-03 :

- Le filtre "sites" de la page surveillance affichait encore des sites archives. Ce point est corrige.
- Le menu admin et les pages admin ne sont pas encore alignes proprement sur les autorisations metier.
- Plusieurs protections API "admin" utilisent encore `GERER_PROFIL` comme garde generique, ce qui melange profils, parametres, audit et administration generale.
- Plusieurs alias de `website/src/lib/permissions.ts` restent trop larges et masquent les differences reelles entre droits.

### Sites archives

Statut : Fait

Correction 2026-06-03 :

- Les sites archives sont exclus des filtres de surveillance.
- Le fallback construit depuis les lieux ignores maintenant les `t_site.Est_Archive = true`.

### Administration / autres / metrologie

Statut : En cours

Retours ajoutes :

- `Acces Administration` et `Acces Dashboard administrateur` semblent aujourd'hui trop proches et doivent etre requalifies.
- `Acces Dashboard utilisateur` : comportement considere OK.
- `Module conversation` : comportement considere OK.
- `Acces parametrage generaux`, `Gerer les parametres`, `Gerer les profils et les autorisations`, `Parametrage materiel` doivent etre reverifies cote UI + API.
- `Acces Metrologie` et `Ajustage / etalonnage` paraissent aujourd'hui surtout controles par la licence ; il faut verifier la part exacte du controle par autorisation.
- `Acces VigiLog` : comportement considere OK.

### Surveillance - droits a remettre au propre

Statut : En cours

Retours ajoutes :

- `Activer / Desactiver un lieu` et `Desactivation lieu` semblent redondants ou mal differencies.
- `Gerer les alarmes` semble trop large et sert aujourd'hui d'alias a d'autres usages.
- `Gerer les lieux` et `Parametrage du lieu` se recouvrent partiellement.
- `Visualiser les lieux` parait decoratif dans certains cas et doit etre verifie cote API.

### Premier diagnostic technique

Statut : Fait

Constats :

- Le layout admin ne bloque aujourd'hui explicitement que `/admin` et `/admin/parametres`.
- Les pages `/admin/profils` et `/admin/utilisateurs` n'ont pas de garde de page dediee.
- Le `AdminSidebar` n'applique pas encore de filtrage fin par autorisation metier.
- Les API suivantes utilisent encore `GERER_PROFIL` comme garde generique :
  - `/api/profils`
  - `/api/autorisations`
  - `/api/parametres`
  - `/api/audit/comments`
  - `/api/email/test`
  - une partie des endpoints rapport mensuel

Travail a faire :

1. Cartographier chaque page admin et chaque endpoint sur un droit metier cible.
2. Filtrer le menu admin par droit reel, pas uniquement par profil admin.
3. Ajouter des gardes de page sur les routes admin exposees directement.
4. Remplacer progressivement les gardes `GERER_PROFIL` trop larges par :
   - `PARAMETRES_GERER`
   - `GERER_PROFIL`
   - `PARAMETRAGE_MATERIEL`
   - `ACCES_METROLOGIE` / `REALISER_AJUSTAGE_ETALONNAGE`
   selon le cas.

Correction 2026-06-04 :

- Les aliases de permissions ont ete resserres dans `website/src/lib/permissions.ts` :
  - `SURVEILLANCE_VIEW_ACCESS` ne couvre plus des droits de gestion d'alarmes ni des droits dashboard.
  - `GENERAL_SETTINGS_ACCESS` ne couvre plus `GERER_PROFIL` ni `ACCES_ADMIN`.
  - `ALARM_ACK_ACCESS` est dedie a l'acquittement.
  - `HARDWARE_CONFIG_ACCESS` couvre maintenant les anciens et nouveaux codes materiel (`PARAMETRAGE_MATERIEL`, `ACCES_PARAMETRAGE_MATERIEL`, `MATERIEL_MESURE_GERER`, `MATERIEL_METROLOGIE_GERER`).
  - `METROLOGY_WORK_ACCESS` reste dedie a la metrologie.
- Les routes `sites` et `groupes` (liste + modification/archive) sont maintenant protegees par `PARAMETRES_GERER` au lieu d'un alias trop large.
- L'historique d'acquittement n'est plus autorise via les droits metrologie ; il suit maintenant le droit d'acquittement.
- La page `alarmes par lieu` n'utilise plus `GERER_PROFIL` pour la gestion du rapport/export associe ; elle suit `PARAMETRES_GERER`.
- Les commentaires d'audit ne passent plus par `GERER_PROFIL` mais par `PARAMETRES_GERER`.
- L'acces VigiLog reste gouverne par `ACCES_VIGILOG` uniquement :
  - le sidebar utilisateur ne laisse plus entrer via `ACCES_METROLOGIE`
  - la page VigiLog ne laisse plus entrer via `ACCES_METROLOGIE`
  - le message de blocage EN a ete aligne
- La gestion des configurations / enregistreurs VigiLog suit maintenant les droits materiel et non plus `ACCES_METROLOGIE`.
- Le layout admin et la sidebar admin utilisent maintenant les permissions agregees metrologie/materiel plutot qu'un melange de codes bruts.
- Validation TypeScript OK via `pnpm exec tsc --noEmit`.

Correction 2026-06-04 - passe complementaire :

- Le layout admin bloque maintenant explicitement les familles de routes suivantes selon le bon droit :
  - `/admin/profils`, `/admin/utilisateurs` -> `GERER_PROFIL`
  - `/admin/parametres`, `/admin/sites`, `/admin/groupes`, `/admin/audit` -> `PARAMETRES_GERER`
  - `/admin/lieux`, `/admin/lieux/templates` -> `LOCATION_CONFIG_ACCESS`
  - `/admin/sondes/etalonnage-import`, `/admin/sondes/ajustage-import`, `/admin/analyse-impact`, `/admin/etalons` -> `METROLOGY_WORK_ACCESS`
  - `/admin/modules`, `/admin/actionneurs`, `/admin/sondes` -> `HARDWARE_CONFIG_ACCESS`
  - `/admin/alarmes` -> `ALARM_ACK_ACCESS`
  - `/admin/outils` -> `PARAMETRES_GERER` ou `HARDWARE_CONFIG_ACCESS` ou `METROLOGY_WORK_ACCESS`
- La sidebar admin masque maintenant plus finement :
  - audit -> `PARAMETRES_GERER`
  - alarmes admin -> `ALARM_ACK_ACCESS`
  - metrologie admin -> `METROLOGY_WORK_ACCESS` reel, sans fallback materiel
- Les APIs suivantes sont maintenant bornees proprement :
  - `sites`, `groupes` -> `PARAMETRES_GERER`
  - `audit`, `audit/codes` -> `PARAMETRES_GERER`
  - `sondes`, `modules`, `actionneurs` -> `HARDWARE_CONFIG_ACCESS`
  - `etalons`, `etalonnages` -> `METROLOGY_WORK_ACCESS` + licence Standard/Expert
- Les imports et previews metrologie ne reposent plus sur une simple authentification/licence : ils sont aussi gates par l'autorisation metier.
- Validation TypeScript OK via `pnpm exec tsc --noEmit`.

Reste a traiter sur ce bloc :

- Finir la cartographie de tous les endpoints/pages restants pour verifier qu'il n'y a plus de garde trop large ou decorative.
- Decider fonctionnellement quels droits surveillance doivent disparaitre ou fusionner (`Desactivation lieu`, `Gerer les alarmes`, `Visualiser les lieux`, `Gerer les lieux`, `Parametrage du lieu`).
- Clarifier `Acces Administration` vs `Acces Dashboard administrateur` avant simplification UI.
- Revoir les ecrans/services annexes encore potentiellement lies a un statut admin brut ou a un alias trop permissif.

## Alertes Teams

Statut : A traiter

Retour :
- Vérifier les alertes Teams (bcp, mais bcp d'alarmes aussi, donc surement pas un bug).
- Renvoyer le nom du lieu et non l'id dans les alertes.

Actions :
- Vérifier le format des alertes Teams.
- Ajouter le nom du lieu dans les alertes Teams.
- Eventuellement revoir le format global des alertes pour les rendre plus lisibles.

## Ajustage / Etalonnage - scope actuel limite aux sondes etalon

Statut : En cours, premiere passe type/serie faite

Decision importante :

- Ne pas developper tout le module ajustage/etalonnage maintenant.
- Faire uniquement la partie sondes etalon pour le moment.

### Types de sondes etalon

Statut : En cours

Nouveaux types :

- Nouvelles sondes etalon : GSP platine, type `SPET-...`.
- Anciennes sondes etalon : code WinDev `SEF`.

Attendu :

- Pouvoir creer plusieurs sondes etalon.
- Types autorises pour les sondes etalon : `SEF`, `SPET`.
- Stocker les coefficients necessaires aux calculs.

Correction 2026-06-04 :

- Le module etalon web existant a ete repris pour fiabiliser la gestion des types et des numeros de serie.
- La creation/modification d'un etalon ne force plus un numero purement numerique : la saisie conserve maintenant les prefixes alpha (`SEF`, `SPET`, etc.).
- Une aide centralisee de deduction/construction de numero a ete ajoutee dans `website/src/lib/standard-types.ts`.
- L'ecran d'affectation de la sonde etalon lit maintenant le type a partir d'un vrai parsing du numero de serie, et non plus via un simple `slice(0, 4)`.
- Les seeds SQL et MSSQL ont ete prepares pour accepter `SPET` dans `t_etalon_type`.
- Le seed MySQL corrige aussi la longueur de `t_etalon_type.Type_Etalon` en `VARCHAR(4)` pour permettre `SPET`.
- Validation TypeScript OK via `pnpm exec tsc --noEmit`.

Reste a traiter :

- Ajouter `SPET` sur les bases deja existantes si elles ont ete creees avant la correction seed.
- Verifier si le type doit etre stocke explicitement dans `t_etalon` ou si le numero de serie reste la seule source de verite.

### Coefficients sonde etalon

Statut : A traiter

Modele :

- Equation etalon : `y = ax^2 + bx + c`.
- Champs necessaires :
  - coefficient `a`
  - coefficient `b`
  - coefficient `c`
  - incertitude max

Usage :

- Calculs metrologiques.
- Documentation / generation certificat.
- Chargement ou association PDF.
- Pouvoir charger les PDF et exploiter les données

### Sondes externes

Constat 2026-06-04 sur les coefficients :

- Le schema actuel de `t_etalon` ne porte pas encore les coefficients `a`, `b`, `c` ni une incertitude max dediee.
- Le module actuel est surtout un module "certificat / serie / mesures de certificat".
- Pour aller plus loin, il faudra une evolution BDD explicite et pas seulement une retouche front.

Travail a preparer :

- SQL MySQL + MSSQL pour ajouter les colonnes metrologiques necessaires sur `t_etalon`.
- Reprise du formulaire et des APIs `/api/etalons` pour lire/ecrire ces nouveaux champs.
- Eventuel arbitrage sur la reutilisation ou non du champ `Incertitude` existant.

Statut : A arbitrer

Retour :

- Pas d'etalonnage quand sonde externe.
- Ajustage OK.
- On peut quand meme creer la sonde, mais pas pour l'instant.

Points a clarifier :

- Comment identifier une sonde externe de maniere fiable.
- Si l'interdiction d'etalonnage doit etre cote UI seulement ou aussi cote API.
- Si la creation doit etre bloquee temporairement ou simplement masquee.

### Ajustage

Statut : A traiter plus tard

Modele attendu :

- Deux equations lineaires :
  - `t1 = ax1 + b`
  - `t2 = ax2 + b`

Informations documentaires :

- Enregistrer le milieu d'inter-comparaison.
- Afficher ce milieu dans le certificat.

Note :

- Ce point est documente ici, mais le developpement complet ajustage n'est pas le scope immediat.

## Questions ouvertes

1. Pour le multi-acquittement, un commentaire unique suffit-il pour toutes les alarmes cochees ?
   - Decision 2026-06-03 : oui. Pas de commentaire par ligne pour le moment.
2. Les etats `E` et `A` doivent-ils bloquer les alarmes ou seulement modifier l'affichage ?
   - Decision 2026-06-03 : ils doivent tout bloquer.
   - Regle cible :
     - quand une sonde est basculee en ajustage ou etalonnage, le `Lieu_Etat` passe respectivement a `A` ou `E` dans `t_lieu`
     - la surveillance du lieu est desactivee pendant cet etat
     - les alarmes et traitements associes doivent etre bloques tant que le lieu reste en `A` ou `E`
   - A faire : appliquer les blocages metier et pas seulement l'affichage.
3. L'envoi de configuration GSP en moment creux doit-il avoir une priorite configurable ?
   - Clarification : il s'agit de savoir si on doit laisser un parametre pour dire a quel point les jobs de configuration GSP sont prioritaires par rapport aux interrogations normales.
   - Exemple :
     - mode prudent : on attend un trou large avant d'envoyer `DCON` / `ECON`
     - mode agressif : on pousse la config plus vite, quitte a prendre plus souvent le port COM
   - Statut 2026-06-03 : pas de priorite configurable demandee pour l'instant. Garder une logique simple et automatique.
4. Quelle duree exacte d'inactivite doit forcer une reconnexion ?
   - Decision 2026-06-03 : cible a 30 min ou 1 h, mais il existe deja un parametre BDD d'inactivite a respecter pour l'admin.
   - A faire : aligner la deconnexion auto sur ce parametre existant.
5. Le module sondes etalon doit-il etre borne par licence Standard uniquement des maintenant ?
   - Decision 2026-06-03 : disponible a partir de Standard (`Standard+`), donc Standard et Expert.

## Nouveau besoin - mode surveillance prolongee

Statut : A traiter

Objectif :

- Ajouter un mode dedie aux clients qui laissent un ecran 24/7 sur la page de surveillance.

Comportement cible :

- Ajouter en haut de la page de surveillance une action du type `Passer en mode surveillance prolongee`.
- Ouvrir une modale d'explication avant activation.
- Le texte doit preciser :
  - la deconnexion auto est desactivee tant que l'utilisateur reste sur la page de surveillance
  - si l'utilisateur quitte cette page, une reconnexion sera demandee
- L'activation et la desactivation de ce mode doivent etre tracees dans l'audit trail.

Points techniques a traiter :

- Suspendre uniquement la logique de deconnexion automatique par inactivite sur cette page.
- Reimposer l'authentification des que l'utilisateur navigue ailleurs.
- Verifier l'impact sur refresh token / access token / reprise de session.

## Autorisations surveillance a remettre au propre

Statut : A traiter

Contexte :

- Plusieurs autorisations de la section surveillance semblent aujourd'hui peu utilisees ou redondantes.
- Il faut remettre en place leur usage reel dans le produit au lieu de laisser des cases qui n'ont pas d'effet clair.

Retour fonctionnel :

- Les autorisations suivantes sont a priori inutiles ou pas correctement exploitees :
  - `Desactivation lieu`
  - `Gerer les alarmes`
  - `Visualiser les lieux`
- Il y a aussi un doublon fonctionnel identifie entre :
  - `Gerer les lieux`
  - `Parametrage du lieu`

Objectif :

- Verifier toutes les autorisations de surveillance exposees dans l'UI.
- Rebrancher dans le code celles qui doivent avoir un effet reel.
- Supprimer, fusionner ou masquer celles qui sont strictement redondantes apres arbitrage.

Points a traiter :

- Definir precisement le perimetre de chaque droit :
  - `Acces Surveillance`
  - `Acquittement des alarmes`
  - `Activer / Desactiver un lieu`
  - `Desactivation lieu`
  - `Gerer les alarmes`
  - `Gerer les lieux`
  - `Parametrage du lieu`
  - `Visualiser les lieux`
- Identifier ce qui est deja controle cote UI.
- Identifier ce qui est deja controle cote API.
- Completer les gardes manquantes cote API en priorite.
- Arbitrer le doublon `Gerer les lieux` vs `Parametrage du lieu`.

Premiere lecture pragmatique :

- `Gerer les lieux` et `Parametrage du lieu` se recouvrent probablement fortement aujourd'hui.
- `Desactivation lieu` et `Activer / Desactiver un lieu` sentent la duplication historique.
- `Visualiser les lieux` n'a de valeur que si la consultation de la table / fiche lieu peut etre isolee du reste.

## Autorisations administration / autres / metrologie a remettre au propre

Statut : A traiter

Retours supplementaires :

- Administration :
  - `Acces Administration`
  - `Acces Dashboard administrateur`
  - suspicion de recouvrement ou d'effet incomplet a verifier
- Autres :
  - `Acces Dashboard utilisateur` : OK
  - `Module conversation` : OK
  - le reste semble aujourd'hui mal differencie ou potentiellement peu exploite :
    - `Acces parametrage generaux`
    - `Gerer les parametres`
    - `Gerer les profils et les autorisations`
    - `Parametrage materiel`
- Metrologie :
  - `Acces Metrologie`
  - `Ajustage / etalonnage`
  - retour fonctionnel : ces droits semblent surtout influences par la licence aujourd'hui, pas assez par les autorisations
- VigiLog :
  - `Acces VigiLog` : retour OK, a conserver tel quel

Objectif :

- Cartographier toutes les autorisations visibles dans l'ecran profils.
- Determiner pour chaque autorisation :
  - si elle masque juste un menu
  - si elle bloque vraiment des actions cote API
  - si elle est doublon d'une autre
  - si elle est en pratique remplacee par une contrainte licence
- Rebrancher les gardes manquantes cote API.
- Simplifier ensuite les doublons visibles dans l'UI.

Points a verifier en priorite :

- `Acces Administration` vs `Acces Dashboard administrateur`
- `Gerer les parametres` vs `Acces parametrage generaux`
- `Gerer les profils et les autorisations`
- `Parametrage materiel`
- `Acces Metrologie` vs `Ajustage / etalonnage`

## Surveillance - ne pas afficher les sites archives

Statut : Fait

Retour :

- Le filtre `Sites` de la page surveillance ne doit pas afficher les sites archives.

Correction 2026-06-03 :

- `ServerFilterOptions()` filtre maintenant `t_site` sur `Est_Archive = false`.
- Le fallback base sur `t_lieu.t_site` ignore aussi les sites archives.
## Metrologie / Sondes etalon

Statut : En cours, premiere passe structurelle faite

Objectif :

- Renommer le point d'entree admin `Etalons` en `Metrologie`.
- Conserver la gestion des sondes etalon.
- Ajouter la gestion des milieux d'inter-comparaison.
- Preparer une page `/metrologie` cote dashboard, reservee aux profils disposant de l'autorisation `ACCES_METROLOGIE`.
- Reserver les operations d'ajustage / etalonnage aux profils disposant de `ACCES_AJUSTAGE_ETALONNAGE`.

Correction 2026-06-04 :

- Nouvelle page admin metrologie : `/admin/metrologie`.
- L'ancien chemin `/admin/etalons` reste present mais redirige vers `/admin/metrologie`.
- Les liens admin et dashboard expert ont ete recables vers `Metrologie`.
- Nouvelle page dashboard `/metrologie`, bornee par `ACCES_METROLOGIE`.
- Les routes d'operations d'ajustage / etalonnage sont maintenant bornees par `ACCES_AJUSTAGE_ETALONNAGE` via `METROLOGY_OPERATION_ACCESS`.
- Les standards utilisent maintenant :
  - `Coeff_A`
  - `Coeff_B`
  - `Coeff_C`
  - `Incertitude_Max`
- Le tableau de mesures certificat a ete retire de la modal standard.
- Le certificat est maintenant gere via chargement PDF avec :
  - stockage serveur
  - preview integree
  - grande preview
- Message jaune ajoute pour rappeler que les coefficients doivent etre verifies depuis le certificat.
- Message bleu ajoute pour signaler qu'une sonde etalon externe ne permettra pas les modules d'ajustage / etalonnage.
- Les modals standard et milieu d'inter-comparaison ont ete elargies.
- Nouveau bloc admin pour les milieux d'inter-comparaison :
  - Model
  - Reference
  - Stabilite
  - Homogeneite
  - Contenu
- Le code applicatif sait lire `t_milieu_inter`, avec repli legacy sur `t_milieu` tant que la base n'est pas migree.
- Les seeds MySQL et MSSQL ont ete mis a jour pour :
  - `t_milieu_inter`
  - `Coeff_A`
  - `Coeff_B`
  - `Coeff_C`
  - `Incertitude_Max`

Reste a traiter :

- Ajouter les scripts SQL de migration a appliquer sur les bases existantes.
- Verifier en recette l'upload / preview PDF sur MySQL et MSSQL.
- Faire un point fonctionnel avant de demarrer la partie sondes etalon avancee / exploitation metrologique.

Correction 2026-06-05 :
- Audit secondaire complete sur les parametres et le recap mensuel (sauvegarde config + envoi manuel).
