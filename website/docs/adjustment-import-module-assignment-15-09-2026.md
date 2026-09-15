# Import d'ajustage — assignation optionnelle et multi-modules (15/09/2026)

## Contexte

L'import XML d'ajustage imposait jusque-là un module global pour toutes les sondes importées. Le bouton d'insertion était bloqué tant qu'un module n'était pas sélectionné.

Ce comportement pose deux problèmes terrain :

- une sonde doit pouvoir être créée/importée sans module puis affectée plus tard ;
- un même lot d'import peut contenir des sondes raccordées à plusieurs modules différents.

## Branche

- `feature/import-module-assignment`
- PR : #116 — `feat(import): assouplir l'assignation et la lecture GSP`

## Comportement retenu

- aucun module n'est obligatoire pour insérer les ajustages ;
- le sélecteur global de module est supprimé ;
- un bouton **Assignation des modules** ouvre une boîte de dialogue ;
- l'opérateur sélectionne un module puis coche les sondes qui doivent lui être affectées ;
- il peut sélectionner un autre module et continuer l'assignation dans la même boîte de dialogue ;
- une sonde non cochée reste sans module ;
- une affectation préparée dans la boîte de dialogue peut être retirée ;
- une sonde existante qui possède déjà un module n'est pas réaffectée par l'import : elle reste verrouillée et doit être modifiée depuis la gestion des sondes.

Les affectations sont portées par sonde et non par fichier. Si plusieurs fichiers du lot concernent la même sonde, le serveur exige une affectation cohérente pour cette sonde.

## Coefficients GSP

Le comportement de la PR #114 est conservé dès qu'une lecture physique est possible : les coefficients GSP sont relus par `DCON` et priment sur le XML.

Cette relecture est désormais **non bloquante pour l'import**. Si la GSP n'a pas de module, si le module n'a pas de port série exploitable, si le serveur d'interrogation n'est pas joignable ou si la GSP ne répond pas, l'import continue et conserve les coefficients du fichier XML. La sonde concernée est comptabilisée dans le résultat et l'interface affiche un avertissement.

Aucune configuration n'est envoyée à la sonde pendant ce fallback : il s'agit uniquement d'éviter qu'une tentative de relecture DCON empêche l'écriture des données importées en base.

## API

`POST /api/sondes/ajustages/bulk` accepte désormais `moduleId` au niveau de chaque ligne importée (`number | null`). Le `moduleId` global reste accepté temporairement pour compatibilité des anciens consommateurs, mais la nouvelle interface ne l'utilise plus.

Le serveur :

- normalise d'abord l'identité de la sonde ;
- refuse deux modules différents pour la même sonde dans le même lot ;
- valide en masse les modules demandés ;
- préserve toujours le module déjà enregistré d'une sonde existante ;
- affecte le module demandé uniquement aux sondes nouvelles ou encore sans module.

## Fichiers principaux

- `website/src/app/[locale]/(admin)/admin/sondes/ajustage-import/adjustment-import-client.tsx`
- `website/src/app/[locale]/(admin)/admin/sondes/ajustage-import/_components/adjustment-import-module-assignment-dialog.tsx`
- `website/src/app/[locale]/(admin)/admin/sondes/ajustage-import/_components/adjustment-import-table-card.tsx`
- `website/src/app/[locale]/(admin)/admin/sondes/ajustage-import/_components/adjustment-import-save.ts`
- `website/src/app/api/sondes/ajustages/bulk/route.ts`
- `website/src/lib/adjustment-import-module-assignment.ts`
- `website/src/messages/supplements.ts`

## Validation technique

GitHub Actions run `34946767899` : génération Prisma MySQL/MSSQL, test ciblé assignation + fallback GSP, i18n, ESLint, TypeScript sur les deux providers et build Next.js production validés. La branche finale est reconstruite en un seul commit depuis le HEAD courant de `dev`, sans workflow temporaire dans le diff.

## Validation terrain

- [ ] importer une sonde sans sélectionner/affecter de module : l'insertion doit être possible et la sonde doit rester sans module ;
- [ ] affecter plusieurs sondes au module A puis d'autres au module B dans le même lot ;
- [ ] vérifier les `Id_Module` et `Port_Serie` des nouvelles sondes créées ;
- [ ] vérifier qu'une sonde existante sans module peut recevoir une affectation pendant l'import ;
- [ ] vérifier qu'une sonde existante déjà affectée conserve son module et apparaît verrouillée dans la dialog ;
- [ ] importer plusieurs fichiers concernant la même sonde et vérifier que l'affectation reste unique ;
- [ ] GSP avec module valide : vérifier la relecture DCON des coefficients ;
- [ ] GSP sans module : vérifier que l'import utilise le XML sans tenter de lecture matérielle ;
- [ ] GSP affectée mais volontairement injoignable : vérifier que l'import est enregistré, que les coefficients XML sont utilisés et qu'un avertissement est affiché ;
- [ ] GSO : vérifier que l'import multi-modules reste fonctionnel ;
- [ ] vérifier FR / EN et la recherche dans la dialog.
