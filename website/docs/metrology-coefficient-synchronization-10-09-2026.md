# Métrologie — synchronisation des coefficients et suivi GSO (10/09/2026)

## Contexte

Les sondes traitées en ajustage/étalonnage peuvent être neuves (coefficients usine) ou provenir d'un client avec des coefficients déjà programmés. Le lancement d'une lecture ne doit donc plus écraser une GSP avec `A=1`, `B=0`, `C=0`.

## Statut GitHub

- Branche : `feature/metrology-coefficient-synchronization`.
- Pull Request : **#114** vers `dev`.
- Base validée : `dev` `087c3b5c1113d06dbc697e3b07fc1ba800b05aa0`.
- Validation automatique complète : GitHub Actions **run `34572188177`**.

## Comportement retenu

- Au démarrage de la lecture Ajustage/Étalonnage, chaque GSP sélectionnée est interrogée par `DCON`.
- Les coefficients physiques A/B/C et le mode multipoint sont relus puis synchronisés dans le dernier `t_ajustage`; s'il n'existe aucune ligne, une ligne minimale est créée.
- Cette synchronisation positionne explicitement le dirty flag des coefficients à `0`: lire une sonde ne doit jamais déclencher un `ECON`.
- Aucun `ECON` neutre `1/0/0` ni `calibration-without-accuracy` n'est envoyé automatiquement au lancement.
- Les modifications explicites de l'opérateur conservent le mécanisme existant d'envoi à la prochaine interrogation.

## GSO

L'UI suit `t_sonde.Metrologie_en_cours` et `t_sonde.Metrologie_cmd_envoyee` et affiche dans la card de démarrage si la commande de passage en mode métrologie est encore en attente ou a été envoyée.

## Fin d'ajustage

Le dialogue de fin liste uniquement les GSP. L'opérateur coche les sondes qui doivent recevoir les nouveaux coefficients calculés. Les GSO sont exclues de l'envoi série et les GSP non cochées gardent les coefficients précédents.

## Imports / exports

- Ajustage : XML individuel et ZIP XML restent proposés après l'opération.
- L'XML transporte maintenant aussi `COEFFX2` pour préserver les ajustages multipoints/GSO.
- Le parseur XML exige le nom exact de la balise : `COEFFX` ne peut plus être confondu avec `COEFFX2`.
- Étalonnage : ZIP de rapports PDF et PDF individuel par sonde sont proposés dans les résultats.
- Import XML : GSP et GSO supportées. Pour les GSP, A/B/C sont relus sur la sonde lors de l'enregistrement; pour les GSO, les coefficients XML sont utilisés.
- L'import fait un upsert ciblé de la ligne correspondante au lieu de supprimer tout l'historique d'ajustage de la sonde.

## Validation automatique

Run GitHub Actions `34572188177` :

- `git diff --check` : OK ;
- génération Prisma MySQL : OK ;
- test ciblé DCON / mapping A-B-C / XML `COEFFX2` : OK ;
- ESLint ciblé : OK ;
- TypeScript `tsc --noEmit` : OK ;
- build Next.js production : OK.

Les workflows et scripts temporaires utilisés pendant la construction ont été retirés du diff final. La branche finale a été ramenée à un commit fonctionnel au-dessus du HEAD courant de `dev` avant ouverture de la PR #114.

## Validation terrain

- [ ] GSP avec coefficients non neutres : lancer la lecture et vérifier que les champs reprennent exactement A/B/C de la sonde.
- [ ] Vérifier dans les logs qu'aucun `ECON ... 1a0b0c` n'est envoyé au lancement.
- [ ] GSP sans `t_ajustage` : vérifier la création de la ligne à partir de DCON.
- [ ] GSP avec `t_ajustage` : vérifier la mise à jour des coefficients sans création inutile de doublon.
- [ ] Modifier explicitement les coefficients puis vérifier leur envoi à l'interrogation suivante.
- [ ] GSO : observer « commande en attente », puis « commande envoyée » quand `Metrologie_cmd_envoyee` passe à 1.
- [ ] Fin d'ajustage mixte : cocher une seule GSP et vérifier que seule celle-ci reçoit les nouveaux coefficients calculés.
- [ ] Télécharger XML individuel + ZIP d'ajustage et vérifier `COEFFX2/COEFFX/COEFFCONSTANT`.
- [ ] Télécharger PDF individuel + ZIP PDF d'étalonnage.
- [ ] Importer un XML GSO puis un XML GSP; vérifier l'upsert et, pour la GSP, la priorité donnée aux coefficients relus sur la sonde.
