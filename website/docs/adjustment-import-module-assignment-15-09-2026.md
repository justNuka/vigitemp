# Import d'ajustage — assignation optionnelle et multi-modules (15/09/2026)

## Contexte

L'import XML d'ajustage imposait jusque-là un module global pour toutes les sondes importées. Le bouton d'insertion était bloqué tant qu'aucun module n'était sélectionné.

Ce comportement pose deux problèmes terrain :

- une sonde doit pouvoir être créée/importée sans module puis affectée plus tard ;
- un même lot d'import peut contenir des sondes raccordées à plusieurs modules différents.

Un retest terrain après la PR #116 a révélé un second problème : dès qu'un module était affecté à une GSP, la route bulk tentait une lecture `DCON` synchrone avant l'insertion BDD. Un lot sans module fonctionnait avec 24 fichiers, alors qu'un lot avec module pouvait rester bloqué indéfiniment sur « insertion en cours » sans log de fin.

## Branches / PR

- `feature/import-module-assignment` — PR #116, mergée dans `dev` ;
- `fix/adjustment-import-bulk-coefficients` — PR #117 — correctif du blocage bulk et séparation import / synchronisation des coefficients.

## Assignation des modules

- aucun module n'est obligatoire pour insérer les ajustages ;
- le sélecteur global de module est supprimé ;
- un bouton **Assignation des modules** ouvre une boîte de dialogue ;
- l'opérateur sélectionne un module puis coche les sondes qui doivent lui être affectées ;
- il peut sélectionner un autre module et continuer l'assignation dans la même boîte de dialogue ;
- une sonde non cochée reste sans module ;
- une affectation préparée dans la boîte de dialogue peut être retirée ;
- une sonde existante qui possède déjà un module n'est pas réaffectée par l'import : elle reste verrouillée et doit être modifiée depuis la gestion des sondes.

Les affectations sont portées par sonde et non par fichier. Si plusieurs fichiers du lot concernent la même sonde, le serveur exige une affectation cohérente pour cette sonde.

## Coefficients GSP — comportement corrigé

Le choix d'un module est désormais **strictement une affectation BDD**. Il ne déclenche plus aucune communication matérielle pendant l'import :

- aucune lecture `DCON` ;
- aucun envoi `ECON` ;
- les coefficients A/B/C enregistrés sont ceux du fichier XML ;
- l'insertion BDD ne dépend donc plus de la disponibilité du serveur d'interrogation ou de la réponse d'une sonde.

Cette séparation est importante pour les imports volumineux : affecter 20 ou 30 sondes à des modules ne doit pas lancer 20 ou 30 communications série au moment où l'opérateur veut seulement importer l'historique.

### Synchronisation optionnelle

L'interface propose une case décochée par défaut :

**Envoyer les coefficients aux sondes à la prochaine interrogation de métrologie**

Quand elle reste décochée :

- les XML sont importés ;
- les modules sont affectés si demandé ;
- aucun dirty flag métrologie n'est armé ;
- aucun coefficient n'est programmé pour envoi par le workflow d'import.

Quand elle est cochée :

- seuls les ajustages GSP importés qui sont devenus l'ajustage le plus récent de leur sonde peuvent être marqués pour synchronisation ;
- la GSP doit disposer d'un module (existant ou affecté pendant l'import) avec un port série exploitable ;
- `t_ajustage.Coeffs_Modifies_Depuis_Derniere_Mesure` est positionné à `1` sur la ligne concernée ;
- le mécanisme métrologie existant effectuera l'envoi `ECON` lors de la prochaine interrogation Ajustage/Étalonnage compatible ;
- aucune communication matérielle synchrone n'est effectuée par la route d'import elle-même.

Le dirty flag historique de Surveillance `t_lieu.Infos_Modifiees_Depuis_Derniere_Mesure` n'est **pas** modifié par ce correctif : la synchronisation des coefficients importés utilise uniquement le mécanisme dédié de `t_ajustage`.

Si un XML historique est importé alors qu'un ajustage plus récent existe déjà, la synchronisation n'est volontairement pas armée : cela évite d'envoyer les coefficients d'une autre ligne que celle que l'opérateur vient d'importer.

Les lignes importées/remplacées sont remises avec un dirty flag à `0` avant l'éventuel armement explicite, afin qu'un ancien état « à envoyer » ne provoque pas une synchronisation non demandée après un import.

## Cause du blocage observé après #116

La route `POST /api/sondes/ajustages/bulk` exécutait `readGspCoefficientsFromTarget()` avant la transaction BDD dès qu'un module exploitable était résolu. Ce helper appelle le serveur C# via `/api/hotline/sensor-test` pour un `read-config`.

Le timeout de lecture était transmis au serveur dans le payload, mais l'appel `fetch()` Node lui-même n'avait pas de borne de transport. Une requête C# qui ne rendait pas la main pouvait donc retenir tout le bulk avant la première écriture BDD. Le fait que 24 imports sans module réussissent alors que 2 imports avec module restent bloqués confirme ce chemin.

Le correctif ne se contente pas d'ajouter un timeout : cette communication n'a pas à être une conséquence implicite du choix d'un module, elle est donc retirée du workflow bulk.

## API

`POST /api/sondes/ajustages/bulk` accepte :

- `moduleId` au niveau de chaque ligne importée (`number | null`) ;
- `sendCoefficients?: boolean`, `false` par défaut ;
- le `moduleId` global reste accepté temporairement pour compatibilité des anciens consommateurs.

Le serveur :

- normalise d'abord l'identité de la sonde ;
- refuse deux modules différents pour la même sonde dans le même lot ;
- valide en masse les modules demandés ;
- préserve toujours le module déjà enregistré d'une sonde existante ;
- affecte le module demandé uniquement aux sondes nouvelles ou encore sans module ;
- insère systématiquement les coefficients XML sans lecture matérielle ;
- retourne le nombre de GSP dont la synchronisation a été programmée ou ignorée.

## Fichiers principaux

- `website/src/app/[locale]/(admin)/admin/sondes/ajustage-import/adjustment-import-client.tsx`
- `website/src/app/[locale]/(admin)/admin/sondes/ajustage-import/_components/adjustment-import-save.ts`
- `website/src/app/api/sondes/ajustages/bulk/route.ts`
- `website/src/messages/adjustment-import-supplements.ts`
- `website/src/i18n/request.ts`
- `website/scripts/test-adjustment-import-module-assignment.ts`

## Validation technique

GitHub Actions run **`34965104733`** : ✅

- `git diff --check` : ✅ ;
- génération Prisma MySQL : ✅ ;
- test ciblé du contrat d'import : ✅ ;
- contrôle i18n sans nouvelle dette liée à l'import : ✅ ;
- ESLint ciblé : ✅ ;
- TypeScript MySQL : ✅ ;
- génération Prisma SQL Server : ✅ ;
- TypeScript SQL Server : ✅ ;
- restauration Prisma MySQL : ✅ ;
- build Next.js production : ✅.

Le test ciblé vérifie notamment que la route bulk ne référence plus `readGspCoefficientsFromTarget` / `read-config`, que l'option est décochée par défaut, que seul `t_ajustage.Coeffs_Modifies_Depuis_Derniere_Mesure` est utilisé et que le dirty flag Surveillance n'est pas touché.

Le workflow temporaire utilisé pour cette validation a été retiré du diff final. Les modifications postérieures au run concernent uniquement la documentation, le libellé explicatif FR/EN de l'option et le nettoyage du workflow temporaire ; le code fonctionnel testé de la route et du client reste inchangé.

## Validation terrain

- [ ] importer 24 fichiers sans module : insertion rapide et complète ;
- [ ] importer plusieurs GSP en leur affectant un ou plusieurs modules, case d'envoi décochée : insertion complète, sans appel matériel et sans blocage ;
- [ ] vérifier `Id_Module` / `Port_Serie` après l'import ;
- [ ] vérifier que les coefficients BDD correspondent exactement aux XML ;
- [ ] cocher **Envoyer les coefficients aux sondes à la prochaine interrogation de métrologie** : dirty flag `t_ajustage` à `1` uniquement sur les GSP éligibles ;
- [ ] vérifier que `t_lieu.Infos_Modifiees_Depuis_Derniere_Mesure` reste inchangé par cet import ;
- [ ] vérifier qu'une GSP sans module ou sans port série est importée mais signalée comme non programmée pour synchronisation ;
- [ ] importer un ancien XML lorsqu'un ajustage plus récent existe : aucune synchronisation de la ligne plus récente ne doit être armée par erreur ;
- [ ] vérifier qu'une GSO n'est jamais mise dans la file de synchronisation GSP ;
- [ ] vérifier FR / EN et thèmes clair / sombre ;
- [ ] vérifier MySQL puis SQL Server.
