# Hotfix build Web — coefficients de métrologie — 27/08/2026

## Contexte

Le build Web échoue après les évolutions de la PR #59 avec l'erreur TypeScript suivante dans la validation des coefficients d'étalonnage :

```text
Type error: Argument of type 'number | undefined' is not assignable to parameter of type 'number'.

(Math.abs(item.coeffC) > 1e-12 && Math.abs(item.coeffA) <= 1e-12)
```

Branche de correction : `agent/fix-coefficient-types-build`.

Statut : **PR_OUVERTE — PR #65**.

## Cause confirmée

`CalibrationCoefficientsCard` travaille avec des `AdjustmentSensorRow` provenant de `/api/metrologie/ajustage/sondes`.

L'API garantit déjà les trois coefficients pour chaque sonde :

- `coeffA: previousAdjustment?.coeffA ?? 1` ;
- `coeffB: previousAdjustment?.coeffB ?? 0` ;
- `coeffC: previousAdjustment?.coeffC ?? 0`.

Le type partagé `AdjustmentSensorRow` déclarait néanmoins ces propriétés comme optionnelles (`coeffA?: number`, `coeffB?: number`, `coeffC?: number`). Lorsqu'un coefficient non modifié est repris directement depuis `sensor.coeffA/B/C`, TypeScript conserve donc le type `number | undefined`. La validation numérique appelle ensuite `Math.abs()` sur ces propriétés et le build Next.js s'arrête.

Le problème est uniquement un décalage entre le contrat TypeScript et le payload réel ; aucun cas runtime légitime ne nécessite `undefined` pour ces trois valeurs.

## Correctif

Fichier applicatif :

- `website/src/hooks/useAdjustmentSensors.ts`.

Modification :

- `coeffA`, `coeffB` et `coeffC` deviennent des propriétés obligatoires de type `number` dans `AdjustmentSensorRow` ;
- aucun fallback supplémentaire n'est ajouté dans les composants ;
- le comportement et les valeurs par défaut de l'API restent inchangés ;
- aucun changement de formule, de persistance, de payload JSON ou de base de données.

## Vérifications effectuées

- [x] PR #64 vérifiée comme mergée avant création de la branche ;
- [x] branche créée depuis le HEAD `dev` `65e602060f4c7a7f0f3eb4a8c3e2672898e3399a` ;
- [x] aucune PR ouverte au démarrage ;
- [x] vérification de `/api/metrologie/ajustage/sondes` : A/B/C sont présents sur toutes les lignes avec fallback numérique ;
- [x] correction limitée au contrat TypeScript partagé ;
- [x] changelog Web mis à jour ;
- [x] PR #65 ouverte vers `dev` sans merge automatique.

## Validation à effectuer

- [ ] relancer `pnpm build` et confirmer la disparition de l'erreur sur `Math.abs(item.coeffC)` / `Math.abs(item.coeffA)` ;
- [ ] lancer `pnpm lint` ;
- [ ] lancer `pnpm i18n:check` ;
- [ ] ouvrir Ajustage et vérifier l'affichage A/B/C avant puis pendant une session ;
- [ ] ouvrir Étalonnage, lancer la lecture et vérifier la modification/validation A/B/C ;
- [ ] vérifier une sonde sans historique : `1.000 / 0.000 / 0.000` ;
- [ ] vérifier une sonde avec ajustage existant ;
- [ ] si le build révèle une erreur suivante, la traiter séparément à partir de la nouvelle sortie complète plutôt que de masquer les types.
