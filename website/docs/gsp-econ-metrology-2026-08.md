# GSP — ECON métrologique embarqué (août 2026)

## Contexte

Le firmware GSP d'août 2026 embarque désormais les coefficients métrologiques complets. Le serveur ne doit donc pas recalculer une correction supplémentaire sur les mesures GSP : la valeur `TEMP` reçue est déjà la valeur finale corrigée par la sonde.

Le serveur C# avait déjà `SensorGSP.ShouldApplyMetrology = false`; ce lot fait évoluer la synchronisation `ECON` et les opérations Ajustage/Étalonnage pour exploiter le nouveau firmware.

## Nouveau format ECON

Paramètres métrologiques :

- `a` : coefficient A, 10 décimales ;
- `b` : coefficient B, 10 décimales ;
- `c` : coefficient C, 10 décimales ;
- `d` : offset, 2 décimales ;
- `e` : erreur de justesse, 2 décimales ;
- `m` : multipoint (`0` ou `1`).

Formules firmware :

- `m=0` : `a*x + b + offset - justesse` ;
- `m=1` : `a*x² + b*x + c + offset - justesse`.

Mapping VigiSensys :

- linéaire : `a=Coeff_X`, `b=Coeff_Constant`, `c=0`, `m=0` ;
- multipoint : `a=Coeff_X2`, `b=Coeff_X`, `c=Coeff_Constant`, `m=1` ;
- `d=t_sonde.Sonde_Offset` ;
- `e=dernier t_etalonnage.Err_Justesse` si `t_lieu.Est_Correction_Ej=1`, sinon `0`.

Le mode multipoint est actuellement déduit d'un `Coeff_X2` non nul, aucun flag multipoint séparé n'existant dans le schéma actuel.

## Limites

Pour le nouveau firmware, une limite haute/basse désactivée est envoyée avec `NAN`. La sentinelle historique `999` reste reconnue comme valeur désactivée côté serveur pour compatibilité des données existantes, mais elle n'est plus envoyée à la GSP.

## Ajustage

Avant la création effective de la session d'ajustage, chaque GSP sélectionnée reçoit une configuration temporaire neutre :

`a=1, b=0, c=0, d=0, e=0, m=0`.

Les paramètres d'exploitation `h/l/f/r/t` sont conservés. L'ajustage travaille ainsi sur la valeur non corrigée de la GSP.

Après :

- validation du second point ;
- arrêt manuel ;
- annulation ;
- expiration ;
- échec de démarrage après bascule ;

la configuration normale est renvoyée. Lors d'un ajustage réussi, les nouveaux coefficients déjà persistés en `t_ajustage` sont relus avant cette restauration.

## Étalonnage

Avant la première lecture d'étalonnage, les coefficients d'ajustage, l'offset et le mode multipoint sont conservés mais `e` est temporairement forcé à `0`.

Ainsi, l'erreur de justesse précédente n'entre pas dans les dix mesures servant précisément à calculer la nouvelle erreur de justesse.

Après :

- fin automatique des 10 mesures ;
- arrêt manuel ;
- expiration ;
- échec de démarrage ;

la configuration normale est renvoyée. Après une campagne réussie, la restauration relit le nouvel `Err_Justesse` persisté. Si `Est_Correction_Ej` est désactivé, `e` reste à `0`.

Une GSP ajoutée pendant la phase de lecture de l'étalonnage reçoit également `e=0` avant d'intégrer la session.

### Envoi en deux commandes

Toute configuration envoyée avec le contexte `ETALONNAGE`, y compris la restauration de la configuration normale, est découpée côté serveur pour chaque sonde :

1. un premier `ECON` contenant uniquement les coefficients `a` et `b` ;
2. un second `ECON` contenant `c/d/e/m/h/l/f/r/t`.

Les deux commandes sont envoyées pendant la même prise du verrou du port série. Le serveur attend 500 ms après chaque écriture et exige un `ACK=ECON` avant de poursuivre. Si le premier envoi n'est pas acquitté, le second n'est pas envoyé. Les synchronisations hors contexte d'étalonnage conservent leur comportement actuel.

## Compatibilité

Le parseur `DCON` accepte :

- le nouveau retour contenant `A/B/C/Off/Justesse/Multi/LimH/LimB/F/RetB/RetH` ;
- les anciens retours utilisés par les firmwares historiques.

Le sens historique de `d` comme retard compact n'est interprété que lorsque les nouveaux champs métrologiques ne sont pas détectés.

## Fichiers principaux

- `Vigitemp Serveur/Vigitemp Serveur/sensors/GspProtocol.cs` ;
- `Vigitemp Serveur/Vigitemp Serveur/HotlineApiServer.cs` ;
- `website/src/lib/metrology-gsp-configuration.ts` ;
- `website/src/lib/metrology-gsp-configuration-restore.ts` ;
- `website/src/app/api/metrologie/ajustage/session/route.ts` ;
- `website/src/app/api/metrologie/ajustage/session/point/route.ts` ;
- `website/src/app/api/metrologie/etalonnage/session/route.ts`.

## Validation terrain

- synchronisation normale linéaire : contrôler `A/B/C/Off/Justesse/Multi` via `DCON` ;
- synchronisation multipoint avec un `Coeff_X2` non nul ;
- limites haute/basse actives puis désactivées (`NAN`) ;
- Ajustage : contrôler l'`ECON` neutre avant la première mesure puis les nouveaux coefficients après le second point ;
- Ajustage : contrôler la restauration après annulation, arrêt et expiration ;
- Étalonnage : contrôler deux trames `ECON` successives par sonde (`a/b`, puis `c/d/e/m/h/l/f/r/t`), espacées d'au moins 500 ms et chacune acquittée ;
- Étalonnage : contrôler que seul `e` passe à `0` et que `A/B/C/Off/Multi` restent identiques ;
- Étalonnage : après 10/10, vérifier que le nouvel `Err_Justesse` est renvoyé si la correction EJ est active ;
- ajouter une GSP pendant la phase de lecture d'étalonnage et vérifier `e=0` ;
- vérifier qu'une GSO n'est jamais ciblée par ces commandes ;
- si une ancienne GSP est disponible, vérifier la compatibilité `DCON` historique ;
- vérifier en Surveillance qu'aucune double correction serveur n'est appliquée.
