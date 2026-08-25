# GSP — ECON métrologique embarqué (août 2026)

## Contexte

Le firmware GSP d'août 2026 embarque désormais les coefficients métrologiques complets. Le serveur ne doit donc pas recalculer une correction supplémentaire sur les mesures GSP : la valeur `TEMP` reçue est déjà la valeur finale corrigée par la sonde.

Le serveur C# avait déjà `SensorGSP.ShouldApplyMetrology = false`; les lots d'août 2026 font évoluer la synchronisation `ECON` et les opérations Ajustage/Étalonnage pour exploiter le firmware tout en respectant les contraintes du module de réception.

## Format ECON complet hors métrologie

La synchronisation normale de Surveillance conserve le format étendu.

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

Pour le nouveau firmware, une limite haute/basse désactivée est envoyée avec `NAN` lors des synchronisations normales complètes. La sentinelle historique `999` reste reconnue comme valeur désactivée côté serveur pour compatibilité des données existantes, mais elle n'est plus envoyée à la GSP.

## Transport ECON pendant Ajustage / Étalonnage

Depuis le lot `agent/gsp-metrology-compact-abc`, toute commande `ECON` reçue par la hotline avec le contexte `AJUSTAGE` ou `ETALONNAGE` est compactée **côté serveur C# juste avant l'écriture série**.

Le serveur conserve uniquement :

- `a` ;
- `b` ;
- `c`.

Les autres paramètres présents dans la requête logique (`d/e/m/h/l/f/r/t`) ne sont pas transmis au module pendant une opération de métrologie. En particulier, les consignes `h/l` ne font plus partie de la trame métrologique.

Exemple avec une sonde `SPNB-26000065` et trois coefficients positifs formatés sur 10 décimales :

`ECONSPNB-26000065 1.0000000000a0.0000000000b0.0000000000c`

Cette trame fait **57 caractères**, taille validée pour le module de réception.

Le serveur :

1. vérifie que la commande cible bien la sonde attendue ;
2. vérifie la présence de `a`, `b`, `c` dans cet ordre et que les trois valeurs sont numériques ;
3. tronque la commande immédiatement après `c` ;
4. envoie une seule trame `ECON ... a...b...c` ;
5. conserve l'attente de 500 ms après l'écriture ;
6. exige toujours un `ACK=ECON`.

Le découpage introduit par la PR #48 pour l'étalonnage (`a/b` puis `c/d/e/m/h/l/f/r/t`) est donc remplacé. Le compactage s'applique désormais de la même manière à l'Ajustage et à l'Étalonnage.

Les synchronisations `ECON` hors contexte `AJUSTAGE` / `ETALONNAGE` ne sont pas compactées et conservent le comportement complet de Surveillance.

## Infos modifiées depuis la dernière mesure

À **chaque interrogation de mesure GSP** réalisée avec le contexte `AJUSTAGE` ou `ETALONNAGE`, le serveur force :

`t_lieu.Infos_Modifiees_Depuis_Derniere_Mesure = 1`.

Cela couvre :

- `action=read` ;
- `action=force-read` ;
- les lectures brutes `TEMP`, `FTEM` ou `RTEMP` exécutées avec un contexte de métrologie.

Le marquage est tenté même lorsque le port série est fourni explicitement par la requête : le lieu est d'abord résolu via le numéro de série. Un échec de mise à jour est journalisé mais ne bloque pas l'interrogation série.

Ce flag permet au scheduler de considérer la configuration comme modifiée lorsque la sonde revient dans le cycle normal de Surveillance. Une synchronisation normale réussie remet ensuite le flag à `0`, selon le comportement existant du serveur.

## Ajustage

Le web continue de préparer la configuration temporaire correspondant au mode d'ajustage. Au niveau transport série, le serveur n'envoie toutefois que les valeurs `a/b/c` de cette requête ; `d/e/m` et les paramètres d'exploitation ne sont pas transmis pendant l'opération.

Les lectures répétées d'ajustage passent par `action=read` avec `operationContext=AJUSTAGE` et remettent donc `Infos_Modifiees_Depuis_Derniere_Mesure` à `1` à chaque interrogation.

À la sortie de l'opération, le retour au cycle normal de Surveillance permet la resynchronisation complète de la configuration grâce au flag de modification resté actif.

## Étalonnage

Le même principe est appliqué à l'étalonnage : les requêtes de configuration métrologique sont réduites à une seule trame `ECON` contenant uniquement `a/b/c`.

Les lectures répétées d'étalonnage passent par `action=read` avec `operationContext=ETALONNAGE` et remettent donc `Infos_Modifiees_Depuis_Derniere_Mesure` à `1` à chaque interrogation.

La précédente stratégie en deux trames n'est plus utilisée. Le retour au cycle normal de Surveillance doit ensuite provoquer une synchronisation complète à partir de la configuration persistée.

## Compatibilité

Le parseur `DCON` accepte toujours :

- le nouveau retour contenant `A/B/C/Off/Justesse/Multi/LimH/LimB/F/RetB/RetH` ;
- les anciens retours utilisés par les firmwares historiques.

Le sens historique de `d` comme retard compact n'est interprété que lorsque les nouveaux champs métrologiques ne sont pas détectés.

Le helper `GspProtocol.TrySplitEconCalibrationCommand` peut encore être présent pour compatibilité historique du code, mais la hotline ne l'utilise plus pour les commandes `ECON` métrologiques.

## Fichiers principaux

- `Vigitemp Serveur/Vigitemp Serveur/HotlineApiServer.cs` ;
- `Vigitemp Serveur/Vigitemp Serveur/sensors/GspProtocol.cs` ;
- `Vigitemp Serveur/Vigitemp Serveur/IDatabaseProvider.cs` ;
- `Vigitemp Serveur/Vigitemp Serveur/MySqlDatabaseProvider.cs` ;
- `Vigitemp Serveur/Vigitemp Serveur/SqlServerDatabaseProvider.cs` ;
- `website/src/lib/metrology-gsp-configuration.ts` ;
- `website/src/lib/metrology-adjustment-session.ts` ;
- `website/src/lib/metrology-calibration-session.ts`.

## Validation terrain

- Ajustage : contrôler qu'une configuration GSP produit **une seule** trame `ECON` contenant uniquement `a/b/c` ;
- Étalonnage : même contrôle, sans seconde trame contenant `d/e/m/h/l/f/r/t` ;
- avec `SPNB-26000065` et `1.0000000000 / 0.0000000000 / 0.0000000000`, vérifier une trame de 57 caractères ;
- contrôler que chaque `ECON` compact reçoit bien `ACK=ECON` ;
- pendant plusieurs interrogations successives en Ajustage, vérifier que `Infos_Modifiees_Depuis_Derniere_Mesure` reste/revient à `1` ;
- faire le même contrôle pendant l'Étalonnage ;
- vérifier le comportement avec `read`, `force-read` et, si utilisé, un `TEMP` brut ;
- sortir d'une opération puis remettre la sonde en Surveillance : vérifier qu'une synchronisation normale complète est déclenchée et que le flag revient ensuite à `0` ;
- contrôler que la synchronisation normale hors métrologie continue d'envoyer `d/e/m/h/l/f/r/t` selon la configuration persistée ;
- vérifier qu'une GSO n'est jamais ciblée par ces commandes série GSP ;
- vérifier en Surveillance qu'aucune double correction serveur n'est appliquée.
