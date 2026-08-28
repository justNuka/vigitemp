# Ajustage — acquisitions pilotées par point et moyenne du plateau — 28/08/2026

## Statut

**EN COURS — branche `agent/adjustment-acquisition-stability-flow` — base `dev` `156da60c3847ee751fa3ad7077b35f4bdd505c02`.**

## Retour terrain

Le flux précédent séparait une prélecture des sondes du démarrage de l’ajustage et lançait automatiquement le plateau dès la première mesure étalon de la session. Une fois le plateau déclaré stable, l’utilisateur devait encore cliquer sur `Valider` pour figer le point.

Le nouveau besoin est :

1. un seul bouton pour lancer l’ajustage ;
2. dès le lancement, lecture continue des sondes et de l’étalon sans démarrer le plateau ;
3. un bouton explicite `Lancer l’acquisition du premier/deuxième point` ;
4. le clic démarre seulement alors la fenêtre de stabilité ;
5. si la stabilité reste conforme pendant la durée configurée, le point est validé automatiquement ;
6. la valeur du point et chaque valeur sonde sont les moyennes de toutes les mesures du plateau ;
7. les coefficients A/B/C deviennent immuables dès le lancement de l’acquisition du premier point ;
8. un dialogue demande de vérifier/enregistrer les coefficients avant ce verrouillage ;
9. après les deux points, un bouton permet d’afficher le détail de la formule d’ajustage linéaire.

## Conception

- La session démarre avec `currentPoint = null` : la boucle continue d’interroger sondes + étalon mais n’accumule aucune mesure de point.
- `POST /api/metrologie/ajustage/session/point` lance désormais l’acquisition au lieu de valider manuellement un point.
- Le `startedAt` du plateau correspond au clic utilisateur.
- Un dépassement de l’écart maximum étalon conserve le comportement sûr existant : la fenêtre est remise à zéro et recommence à partir de la mesure courante.
- À l’échéance de la durée, le backend calcule la moyenne étalon et la moyenne de chaque sonde puis crée automatiquement le `ValidatedPoint`.
- Entre le point 1 et le point 2, la boucle de lecture continue mais aucune mesure n’est incorporée tant que le second bouton n’est pas déclenché.
- `coefficientsLocked` est exposé dans la session publique et contrôlé dans `updateAdjustmentCoefficients()` : le verrouillage ne dépend donc pas uniquement de l’interface.
- Pour un étalon externe, le point manuel reste la référence et la capture existante reste immédiate, afin de ne pas inventer un critère de stabilité pour une valeur qui n’est pas interrogée automatiquement.

## Formule affichée

Pour chaque sonde, à partir des moyennes du point 1 et du point 2 :

```text
A = (Etalon2 - Etalon1) / (Sonde2 - Sonde1)
B = Etalon1 - A × Sonde1
C = 0
```

Cette présentation correspond au calcul déjà utilisé par `computeLinearAdjustment()` pour persister `Coeff_X` et `Coeff_Constant`.

## Fichiers principaux

- `website/src/lib/metrology-adjustment-session.ts`
- `website/src/app/api/metrologie/ajustage/session/point/route.ts`
- `website/src/app/[locale]/(admin)/admin/metrologie/realiser-ajustage/adjustment-workflow-client.tsx`
- `website/src/messages/supplements.ts`
- `website/CHANGELOG.md`
- `website/docs/backlog-retours-17-08-2026.md`

## Checklist de validation

- [ ] lancer l’ajustage : aucune progression de plateau avant le premier bouton d’acquisition ;
- [ ] confirmer que sondes et étalon continuent pourtant d’être lus ;
- [ ] modifier puis enregistrer A/B/C avant le point 1 ;
- [ ] cliquer sur le point 1 : vérifier le dialogue de confirmation ;
- [ ] après confirmation, vérifier que les champs et l’API de coefficients sont verrouillés ;
- [ ] vérifier que le timer de plateau part au clic ;
- [ ] laisser un plateau stable arriver à son terme : point 1 validé sans clic supplémentaire ;
- [ ] comparer la valeur enregistrée du point à la moyenne manuelle des mesures de la fenêtre ;
- [ ] provoquer un écart supérieur au maximum : le plateau doit repartir de zéro ;
- [ ] entre les deux points, confirmer la lecture continue sans accumulation de point 2 ;
- [ ] répéter pour le point 2 et vérifier la fin automatique ;
- [ ] afficher le détail des calculs et comparer A/B/C au calcul manuel ;
- [ ] vérifier un étalon externe sans régression ;
- [ ] vérifier GSP puis GSO ;
- [ ] vérifier FR/EN et thèmes clair/sombre ;
- [ ] lancer `pnpm lint`, `pnpm i18n:check` et `pnpm build`.
