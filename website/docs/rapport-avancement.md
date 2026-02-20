# Rapport d'avancement - Licences VigiSensys

## Contexte
Source de référence : `website/docs/infos-licences.md`.

Ce rapport synthétise :
- ce qui est déjà en place dans la codebase,
- ce qui reste à faire,
- les écarts à corriger pour coller au périmètre Pack / One / Standard / Expert.

## Résumé exécutif
- Le socle **Pack/One** est globalement opérationnel.
- La partie **Standard** est partiellement en place (EMT + étalonnage + dashboard admin), mais plusieurs features annoncées ne sont pas encore implémentées.
- **Expert** est majoritairement non implémenté (normal selon la roadmap).
- Il reste des écarts de **gating licence** (UI + API) à verrouiller.

## État par licence

### Pack
Attendu : surveillance, historique, alarmes, tolérances, retard d'alarme, mail, limite de sondes.

État :
- ✅ Socle surveillance/alarmes/historique/tolérances/retards : présent.
- ✅ Notification mail (config SMTP) : présent (`/api/admin/configuration-smtp`, `src/lib/email.ts`).
- ⚠️ Limite de sondes Pack : partiellement appliquée.
  - ✅ Appliquée sur création sonde manuelle (`src/app/api/sondes/route.ts`).
  - ❌ Non appliquée sur tous les flux qui créent des sondes (notamment import ajustage `src/app/api/sondes/ajustages/bulk/route.ts`).

### One
Attendu : Pack + notif Windows agent, multi-sites/groupes, sondes illimitées, offset, ajustage/calibrage.

État :
- ✅ Multi-sites/groupes : présent.
- ✅ Offset sonde : présent.
- ✅ Ajustage import + insertion : présent (`/api/sondes/ajustages/*`, UI import).
- ✅ Sondes illimitées : implicite (restriction Pack uniquement).
- ⚠️ Notification Windows agent : en place fonctionnellement, à revalider en recette bout-en-bout sur machine client.

### Standard
Attendu : Pack+One + EMT, résultats d'étalonnage, dérive, modules calibrage/étalonnage/lecture étalon, superposition courbes, analyse d'impact, dashboard admin, messagerie inter-utilisateurs, CFR21 part 11.

État :
- ✅ EMT par lieu : en place (modes quart/manuelle/incertitudes/sans objet), persistence API et calculs (`src/lib/emt.ts`, routes lieux, UI métrologie).
- ✅ Gestion des résultats d'étalonnage : en place (`t_etalonnage` + `t_etalonnage_mesure`, import preview/bulk + UI).
- ✅ Gestion de la dérive : en place dans EMT.
- ✅ Module ajustage / module étalonnage (import) : en place.
- ✅ Dashboard admin (version standard simplifiée) : en place (`src/app/[locale]/(admin)/admin/page.tsx`).
- ✅ CFR21 (paramétrage + expiration mot de passe) : en place côté applicatif.
- ❌ Messagerie inter-utilisateurs : non implémentée.
- ❌ Superposition des courbes : non trouvée dans le code.
- ❌ Analyse d'impact : non trouvée côté fonctionnel (hors textes marketing).
- ❓ Module de lecture de la sonde étalon : non identifié clairement dans le code actuel.

### Expert
Attendu : Standard + fonctions avancées (MKT, IA, analyses temps réel, planning métrologie, etc.).

État :
- ❌ Non implémenté (hors textes/UI marketing).
- ✅ Cohérent avec la note "sortira plus tard".

## Écarts à corriger pour coller au besoin

## 1) Verrouillage licence (priorité haute)
- Ajouter un gating **UI + API** centralisé par feature.
- Cacher/bloquer les pages/actions non autorisées selon édition (ex: imports métrologie en Pack/One si non prévus).
- Vérifier `admin-sidebar` : lien métrologie actuellement visible sans filtre d'édition.

## 2) Limite de sondes Pack (priorité haute)
- Appliquer la limite Pack sur **tous** les points d'entrée qui peuvent créer une sonde :
  - création manuelle,
  - import ajustage (création implicite),
  - tout autre batch/import futur.
- Retourner des erreurs fonctionnelles homogènes (`license_sensor_limit_reached`).

## 3) Standard manquant (priorité moyenne)
- Implémenter (ou retirer du périmètre si report) :
  - messagerie inter-utilisateurs,
  - superposition des courbes,
  - analyse d'impact,
  - module lecture sonde étalon (à clarifier fonctionnellement).

## 4) CFR21 part 11 (priorité moyenne)
- Le socle est présent, mais vérifier l'écart avec un vrai périmètre CFR21 complet (signatures électroniques, traçabilité réglementaire complète, exigences audit/process).

## 5) Hygiène doc/encodage
- `infos-licences.md` contient des caractères encodés incorrectement (mojibake).
- Corriger l'encodage UTF-8 pour éviter les ambiguïtés de spécification.

## Plan recommandé (court terme)
1. Mettre en place une matrice de droits par licence (feature flags) partagée UI/API.
2. Verrouiller la limite Pack sur les imports (notamment ajustage bulk).
3. Bloquer les routes/pages non autorisées par édition (pas seulement masquer les menus).
4. Arbitrer ce qui est réellement dans le lot Standard restant (messagerie/impact/superposition/lecture étalon).
5. Lancer une recette fonctionnelle par licence avec checklist.

## Références principales (code)
- Validation licence : `website/src/lib/license-server.ts`
- Limite Pack création sonde : `website/src/app/api/sondes/route.ts`
- Import ajustage (création implicite sondes) : `website/src/app/api/sondes/ajustages/bulk/route.ts`
- Import étalonnage : `website/src/app/api/sondes/etalonnages/bulk/route.ts`
- Dashboard admin par édition : `website/src/app/[locale]/(admin)/admin/page.tsx`
- EMT calcul : `website/src/lib/emt.ts`
- EMT UI lieu : `website/src/app/[locale]/(admin)/admin/lieux/_components/location-form-tab-metrology.tsx`
- Page étalons (blocage One/Pack) : `website/src/app/[locale]/(admin)/admin/etalons/page.tsx`
- Sidebar admin : `website/src/components/admin-sidebar.tsx`
