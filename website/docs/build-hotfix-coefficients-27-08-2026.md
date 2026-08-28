# Hotfix build Web — coefficients de métrologie — 27/08/2026

## Contexte

Deux erreurs TypeScript successives ont été révélées par `pnpm build` après les évolutions de la PR #59 autour de l'affichage et de la modification des coefficients A/B/C.

### Première erreur

```text
Type error: Argument of type 'number | undefined' is not assignable to parameter of type 'number'.

(Math.abs(item.coeffC) > 1e-12 && Math.abs(item.coeffA) <= 1e-12)
```

La PR #65 a tenté d'aligner `AdjustmentSensorRow` sur le payload réel de `/api/metrologie/ajustage/sondes`, qui fournit toujours A/B/C avec les fallbacks `1 / 0 / 0`.

PR #65 : **mergée dans `dev`**, merge `08c5112bbfe6ae4ffe2ce108cffff86023b9da9f`.

### Deuxième erreur révélée après #65

```text
Type '{ ... currentCoeffC: number; }' is not assignable to type 'ManagedSensor'.
Type '{ ... }' is missing the following properties from type 'AdjustmentSensorRow': coeffA, coeffB, coeffC

const sensors: ManagedSensor[] = sensorRows.map((sensor) => {
```

Branche de correction : `agent/fix-managed-sensor-coefficient-type`.

Statut : **EN_COURS**.

## Cause confirmée

Le premier diagnostic était correct pour le composant d'Étalonnage, mais le type `AdjustmentSensorRow` n'est pas utilisé uniquement comme contrat de réponse de l'API `/api/metrologie/ajustage/sondes`.

Le moteur d'Ajustage définit également :

```ts
type ManagedSensor = AdjustmentSensorRow & {
  // ...
  currentCoeffA: number
  currentCoeffB: number
  currentCoeffC: number
}
```

Son mapper interne construit les coefficients dans `currentCoeffA/B/C`, puis le serializer public expose ces valeurs sous les noms `coeffA/B/C`. Lors d'une modification de coefficients pendant la session, seuls `currentCoeffA/B/C` sont mis à jour.

Ajouter aussi `coeffA/B/C` obligatoires dans le mapper interne créerait donc une duplication de données et deux sources de vérité susceptibles de diverger.

## Correctif retenu

Le correctif reste volontairement local et évite une refonte des types du moteur :

- `AdjustmentSensorRow` retrouve ses propriétés optionnelles `coeffA?: number`, `coeffB?: number`, `coeffC?: number` afin de rester compatible avec le `ManagedSensor` interne existant ;
- dans `CalibrationCoefficientsCard`, les valeurs non modifiées sont normalisées avant validation avec les mêmes valeurs par défaut que l'API :
  - `A = sensor.coeffA ?? 1` ;
  - `B = sensor.coeffB ?? 0` ;
  - `C = sensor.coeffC ?? 0` ;
- le tableau `coefficients` construit par la carte contient donc toujours des `number` avant `Number.isFinite()`, `Math.abs()` et l'appel de mutation ;
- les champs explicitement saisis par l'utilisateur continuent de passer par `parseCoefficient()` et peuvent produire `NaN`, ensuite rejeté par la validation existante ;
- le moteur d'Ajustage conserve une seule source de vérité interne via `currentCoeffA/B/C` ;
- aucune formule, persistance, API ou BDD n'est modifiée.

## Fichiers principaux

- `website/src/hooks/useAdjustmentSensors.ts` ;
- `website/src/app/[locale]/(admin)/admin/metrologie/realiser-etalonnage/calibration-coefficients-card.tsx` ;
- `website/CHANGELOG.md` ;
- ce document.

## Vérifications effectuées

- [x] PR #65 vérifiée comme réellement mergée ;
- [x] `dev` vérifié sur le merge #65 `08c5112bbfe6ae4ffe2ce108cffff86023b9da9f` ;
- [x] aucune PR ouverte au démarrage de ce lot ;
- [x] `ManagedSensor` vérifié : coefficients courants stockés dans `currentCoeffA/B/C` ;
- [x] serializer de session vérifié : `currentCoeffA/B/C` sont exposés en `coeffA/B/C` ;
- [x] mutation de session vérifiée : elle met à jour `currentCoeffA/B/C`, pas une copie parallèle ;
- [x] normalisation de la carte alignée sur les fallbacks API `1 / 0 / 0` ;
- [x] aucun cast `as number` ni assertion non-null ajouté.

## Validation à effectuer

- [ ] relancer `pnpm build` et confirmer la disparition de l'erreur `ManagedSensor` ;
- [ ] confirmer que l'erreur précédente `Math.abs(item.coeffC)` / `Math.abs(item.coeffA)` ne revient pas ;
- [ ] lancer `pnpm lint` ;
- [ ] lancer `pnpm i18n:check` ;
- [ ] ouvrir Ajustage et vérifier l'affichage A/B/C avant puis pendant une session ;
- [ ] modifier A/B/C pendant un Ajustage et confirmer que les valeurs publiques suivent `currentCoeffA/B/C` ;
- [ ] ouvrir Étalonnage, lancer la lecture et vérifier la modification/validation A/B/C ;
- [ ] vérifier une sonde sans historique : `1.000 / 0.000 / 0.000` ;
- [ ] vérifier une sonde avec ajustage existant ;
- [ ] si le build révèle une erreur suivante, repartir de la nouvelle sortie complète.
