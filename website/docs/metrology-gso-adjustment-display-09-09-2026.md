# Ajustage GSO — affichage corrigé des coefficients — 09/09/2026

## Référence

- Dépôt : `justNuka/vigitemp`
- Branche d’intégration : `dev`
- HEAD `dev` au démarrage : `ac22dc39e5af49d893bf10d0d450cf60f5e61629`
- Branche : `fix/metrology-gso-adjustment-display`

## Retour terrain

Pendant un ajustage GSO, modifier puis valider les coefficients A/B/C ne faisait pas évoluer la valeur affichée par le Web.

## Cause vérifiée

Le chemin GSO d’ajustage est volontairement différent du chemin de Surveillance : les trames métrologie `10` / `110` sont copiées dans `tm_mesures_ajustage` avec leur signal brut. Le moteur Web d’ajustage relit cette valeur brute afin de calculer les deux plateaux et les nouveaux coefficients.

La session exposait ensuite directement ce signal brut à l’interface. Les nouveaux coefficients étaient bien persistés dans `t_ajustage`, mais leur effet n’était pas représenté sur la mesure affichée.

Le signal brut doit rester la source des calculs d’ajustage : appliquer les coefficients directement dans les échantillons du plateau modifierait la grandeur utilisée par la formule métier.

## Correctif Web

Le correctif sépare maintenant les deux responsabilités au moment de construire la réponse API :

- la session interne conserve la mesure GSO brute pour les acquisitions et calculs ;
- la réponse envoyée à l’interface calcule une valeur d’affichage avec les coefficients A/B/C courants de la session ;
- le signal brut est conservé dans `rawValue` ;
- le calcul linéaire utilise `A × brut + B` lorsque `C = 0` ;
- le mapping à trois coefficients reste cohérent avec l’existant : `A × brut² + B × brut + C` ;
- aucune valeur métier n’est arrondie par le helper ; l’arrondi reste une responsabilité de présentation ;
- les GSP et les calculs de plateau ne sont pas modifiés.

Ainsi, après validation de nouveaux A/B/C sur une GSO, la valeur visible peut refléter immédiatement ces coefficients sans transformer le signal utilisé pour calculer l’ajustage.

## Point BDD à conserver

Il n’est pas nécessaire de modifier le trigger métrologie GSO pour remplir `tm_mesures_ajustage.Valeur` afin de résoudre ce retour. Le brut doit rester disponible pour le calcul.

Le chemin de Surveillance doit en revanche continuer à appliquer le dernier ajustage lors du passage `tm_mesures_gso` → `tm_mesures_gso_build` → `tm_mesures` / `tm_graphique`. Une vérification séparée des vues/triggers GSO reste pertinente, notamment la sélection déterministe du dernier `t_ajustage` (`Date_Heure_Ajustage`, puis `Id_Ajustage`) et le support éventuel des coefficients quadratiques.

## Fichiers principaux

- `website/src/lib/metrology-gso-adjustment-display.ts`
- `website/src/app/api/metrologie/ajustage/session/route.ts`
- `website/scripts/test-metrology-gso-adjustment-display.ts`

## Validation technique

GitHub Actions run `34352282333` :

- [x] dépendances figées ;
- [x] génération Prisma MySQL ;
- [x] test helper : formule linéaire ;
- [x] test helper : formule à trois coefficients ;
- [x] test helper : conservation du brut dans `rawValue` ;
- [x] TypeScript ;
- [x] ESLint ciblé ;
- [x] build Web standalone production.

Le workflow GitHub Actions temporaire utilisé pour cette validation a été retiré du diff final.

## Validation terrain restante

- [ ] démarrer un ajustage GSO et attendre une mesure ;
- [ ] modifier A/B/C puis valider ;
- [ ] vérifier que la valeur affichée évolue avec les nouveaux coefficients ;
- [ ] vérifier que le timestamp de mesure reste cohérent ;
- [ ] terminer les deux points et comparer les coefficients calculés avec un calcul manuel à partir des valeurs brutes ;
- [ ] vérifier une GSP en non-régression.
