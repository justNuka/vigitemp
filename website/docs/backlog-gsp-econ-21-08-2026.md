# Retour terrain 21/08/2026 — coefficients métrologiques GSP embarqués

> Ce document complète temporairement `website/docs/backlog-retours-17-08-2026.md` pour le lot firmware GSP. Le point doit être reporté dans le backlog central avec le numéro de PR avant merge.

## B21-002 — GSP : coefficients métrologiques embarqués dans ECON

**Statut : `EN_COURS` — branche `agent/gsp-onboard-metrology-coefficients`**

### Retour

Le firmware GSP accepte désormais les paramètres métrologiques complets dans `ECON` : coefficients A/B/C, offset, erreur de justesse et mode multipoint. Les limites désactivées doivent être envoyées sous forme `NAN` au lieu de la sentinelle historique `999`.

Le démarrage d'un ajustage doit neutraliser temporairement tous les coefficients afin d'obtenir la valeur non corrigée. Le démarrage d'un étalonnage doit conserver l'ajustage et l'offset mais neutraliser l'erreur de justesse (`e=0`) puisque la campagne sert précisément à calculer cette nouvelle valeur.

### Implémentation

- nouveau mapping linéaire/multipoint `a/b/c/d/e/m` ;
- format 10 décimales pour A/B/C et 2 décimales pour Offset/Justesse ;
- `NAN` pour les limites désactivées ;
- parsing `DCON` étendu avec compatibilité des anciens firmwares ;
- Ajustage : configuration temporaire `1a 0b 0c 0d 0e 0m` avant le démarrage effectif de la session ;
- restauration après validation finale, arrêt, annulation, expiration ou rollback ;
- Étalonnage : `e=0` avant la première lecture, sans modifier A/B/C/Offset/Multi ;
- même préparation lorsqu'une GSP est ajoutée pendant la phase de lecture ;
- restauration après 10/10, arrêt, expiration ou rollback ;
- après réussite, la restauration relit les nouveaux coefficients / la nouvelle erreur de justesse déjà persistés en base ;
- les GSO ne sont pas concernées ;
- aucune nouvelle correction métrologique n'est ajoutée côté serveur sur les valeurs GSP.

### Fichiers principaux

- `Vigitemp Serveur/Vigitemp Serveur/sensors/GspProtocol.cs` ;
- `website/src/lib/metrology-gsp-configuration.ts` ;
- `website/src/lib/metrology-gsp-configuration-restore.ts` ;
- `website/src/app/api/metrologie/ajustage/session/route.ts` ;
- `website/src/app/api/metrologie/ajustage/session/point/route.ts` ;
- `website/src/app/api/metrologie/etalonnage/session/route.ts` ;
- `website/docs/gsp-econ-metrology-2026-08.md`.

### Validation terrain

- [ ] Build C# du service Windows ;
- [ ] `pnpm i18n:check` ;
- [ ] `pnpm lint` ;
- [ ] `pnpm build` ;
- [ ] configuration normale linéaire : vérifier A/B/C/Off/Justesse/Multi dans `DCON` ;
- [ ] multipoint : vérifier `Multi=1` et le mapping `Coeff_X2/Coeff_X/Coeff_Constant` ;
- [ ] seuil haut désactivé => `LimH=NAN` ;
- [ ] seuil bas désactivé => `LimB=NAN` ;
- [ ] Ajustage : vérifier l'ECON neutre avant la première lecture ;
- [ ] Ajustage terminé : vérifier que les nouveaux coefficients sont immédiatement renvoyés ;
- [ ] Ajustage annulé/arrêté/expiré : vérifier la restauration de la configuration normale ;
- [ ] Étalonnage : vérifier que A/B/C/Off/Multi restent inchangés et que Justesse passe à 0 ;
- [ ] Étalonnage 10/10 : vérifier que le nouvel `Err_Justesse` est renvoyé si `Est_Correction_Ej=1` ;
- [ ] Étalonnage avec `Est_Correction_Ej=0` : vérifier `Justesse=0` après restauration ;
- [ ] ajout d'une GSP pendant la phase de lecture : vérifier `e=0` avant intégration ;
- [ ] GSO : vérifier qu'aucun ECON de ce lot ne lui est envoyé ;
- [ ] ancien firmware disponible : vérifier que l'ancien DCON reste lisible ;
- [ ] Surveillance : contrôler l'absence de double correction de la valeur GSP.
