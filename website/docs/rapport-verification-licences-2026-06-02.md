# Rapport de verification des bornages licence

Date: 2026-06-02

## Perimetre controle

Source fonctionnelle utilisee: `website/docs/infos-licences.md`.

Objectif demande: verifier que les fonctionnalites de la licence Standard ne sont pas disponibles en licence One ou Pack.

Fichiers et zones inspectes:

- Helpers licence: `website/src/lib/license-access.ts`, `website/src/lib/license-guards.ts`, `website/src/lib/license-server.ts`
- Navigation: `website/src/components/app-sidebar.tsx`, `website/src/components/admin-sidebar.tsx`, `website/src/components/main-navbar.tsx`, `website/src/components/admin-nav-dock.tsx`
- Pages admin et surveillance: `admin/etalons`, `admin/sondes/etalonnage-import`, `admin/analyse-impact`, `admin/lieux`, `surveillance`
- APIs principales: `api/etalons`, `api/sondes/etalonnages`, `api/sondes/ajustages`, `api/lieux`, `api/parametres`, `api/analyse-impact`, `api/chat`, `api/services/vigilog`, `api/statistiques/recap-mensuel`
- Script de smoke existant: `website/scripts/smoke-license-matrix.ts`

Note: le fichier indique `infos-licence.md` dans la demande, mais le fichier present dans le depot est `infos-licences.md`.

## Synthese

Le bornage Standard/Pack/One est partiellement en place.

Conforme sur les modules metrologie critiques deja identifies:

- Gestion des etalons: protegee cote UI et API pour Standard/Expert uniquement.
- Import et gestion des etalonnages: proteges cote UI et API pour Standard/Expert uniquement.
- Champs metrologie avancee d'un lieu: EMT, etalonnage applique, erreur de justesse, incertitude, derive sont bloques cote API si envoyes en Pack/One.
- Messagerie inter-utilisateurs: globalement protegee cote UI et API par Standard/Expert.

Ecarts principaux:

- Analyse d'impact: page accessible par URL directe et API de sauvegarde non bornee par licence.
- Superposition des courbes: bouton et modale accessibles sans garde licence apparent.
- Parametres reserves: l'UI masque certains reglages en Pack/One, mais les API generiques de parametres permettent encore de les modifier avec le droit `GERER_PROFIL`.
- VigiLog: protege par droits utilisateur, mais pas par edition de licence. A arbitrer car VigiLog n'est pas clairement classe dans `infos-licences.md`.
- Rapport mensuel statistique: fonctionnalite Expert dans la matrice produit, mais API non bornee par licence.

## Matrice attendue issue de `infos-licences.md`

### Pack

Fonctions autorisees:

- Surveillance
- Historique des mesures
- Alarmes
- Tolerances
- Retards d'alarme
- Notification mail
- Nombre de sondes limite par licence

Fonctions non autorisees:

- Chat / messagerie interne
- Fonctions One, Standard et Expert

### One

Fonctions Pack plus:

- Notification Windows Agent
- Multi-sites / groupes
- Sondes illimitees
- Offset
- Ajustage / calibrage

Fonctions non autorisees:

- Fonctions Standard et Expert

### Standard

Fonctions One plus:

- EMT par lieu
- Gestion des resultats d'etalonnage
- Gestion de derive
- Module calibrage / etalonnage / lecture sonde etalon
- Superposition des courbes
- Analyse d'impact
- Dashboard administrateur
- Messagerie inter-utilisateurs
- CFR21 Part 11

### Expert

Fonctions Standard plus:

- Suivi derive avance
- Parametrage incertitude
- Dashboard personnalisable
- Etalonnage multi-point X2
- MKT
- Planning metrologie
- IA / analyse temps reel
- Rapport statistique parametrable
- Non-conformites
- Retard non-reponse configurable min 1h
- Ecosysteme MC2

## Points conformes

| Fonction | Attendu | Constat | References |
| --- | --- | --- | --- |
| Helpers licence | Fonctions reutilisables par edition | `isPack`, `isOne`, `isStandard`, `isExpert`, `isStandardOrExpert` existent | `website/src/lib/license-access.ts` |
| Garde serveur Standard/Expert | Bloquer Pack/One cote API | `requireStandardOrExpertLicense` et `requireStandardOrExpertIfFieldsUsed` existent | `website/src/lib/license-guards.ts` |
| Etalons | Standard/Expert uniquement | Page bloquee en Pack/One via `LicenseBlockedCard`; API protegee | `website/src/app/[locale]/(admin)/admin/etalons/page.tsx:16`, `website/src/app/api/etalons/route.ts:43`, `website/src/app/api/etalons/types/route.ts:16`, `website/src/app/api/etalons/[id]/route.ts:41` |
| Import etalonnage | Standard/Expert uniquement | Page et APIs bloquees | `website/src/app/[locale]/(admin)/admin/sondes/etalonnage-import/page.tsx`, `website/src/app/api/sondes/etalonnages/route.ts:28`, `website/src/app/api/sondes/etalonnages/preview/route.ts:37`, `website/src/app/api/sondes/etalonnages/bulk/route.ts:76` |
| Ajustage | Autorise Pack/One/Standard/Expert selon matrice actuelle | Pas de garde Standard, coherent avec `matrice-licences-acces.md` | `website/src/app/api/sondes/ajustages/bulk/route.ts` |
| Champs EMT / etalonnage / derive du lieu | Standard/Expert uniquement | Onglet metrologie masque en Pack/One; API bloque si champs envoyes | `website/src/app/[locale]/(admin)/admin/lieux/_components/location-form-dialog.tsx:107`, `website/src/app/api/lieux/route.ts:21`, `website/src/app/api/lieux/route.ts:315`, `website/src/app/api/lieux/[id]/route.ts:23`, `website/src/app/api/lieux/[id]/route.ts:327` |
| Pack: limite du nombre de sondes | Limite active uniquement Pack | API creation sonde verifie `maxSensors` en Pack | `website/src/app/api/sondes/route.ts:152` |
| Pack: offset non disponible | Offset autorise One, pas Pack | Creation force offset a 0 en Pack; modification bloque changement d'offset en Pack | `website/src/app/api/sondes/route.ts:176`, `website/src/app/api/sondes/[idSonde]/route.ts:40` |
| Messagerie interne | Standard/Expert uniquement | Sidebar et pages masquees via `useMessagingEnabled`; APIs chat passent par `checkChatAccess` | `website/src/hooks/useMessagingEnabled.ts`, `website/src/lib/chat-guard.ts:12`, `website/src/app/api/chat/conversations/route.ts:31` |
| Dashboard admin | Matrice interne actuelle: accessible toutes editions avec contenu adapte | `matrice-licences-acces.md` indique `/admin` autorise toutes editions; code prevoit variantes Pack/One | `website/docs/matrice-licences-acces.md`, `website/src/app/[locale]/(admin)/admin/page.tsx` |

## Ecarts et risques

### 1. Analyse d'impact non bornee par licence

Severite: elevee.

Attendu: Standard/Expert uniquement.

Constat:

- Le menu admin masque l'entree dans les items metrologie si la licence n'est pas Standard/Expert.
- La page `/admin/analyse-impact` ne contient pas de garde licence.
- L'API `/api/analyse-impact/save` verifie uniquement le droit metrologie (`METROLOGY_WORK_ACCESS`), pas l'edition de licence.

Impact:

- Un utilisateur Pack/One ayant les droits suffisants peut potentiellement acceder a la page par URL directe.
- La sauvegarde d'une analyse d'impact peut etre effectuee par API sans licence Standard/Expert.

References:

- `website/src/components/admin-sidebar.tsx:109`
- `website/src/app/[locale]/(admin)/admin/analyse-impact/page.tsx`
- `website/src/app/api/analyse-impact/save/route.ts:17`

Correction recommandee:

- Ajouter un garde UI avec `useLicense` + `isStandardOrExpert` ou un wrapper serveur equivalent sur la page.
- Ajouter `requireStandardOrExpertLicense()` au debut de `POST /api/analyse-impact/save`.
- Ajouter ce cas au script `smoke-license-matrix.ts`.

### 2. Superposition des courbes accessible sans garde licence apparent

Severite: elevee.

Attendu: Standard/Expert uniquement.

Constat:

- `infos-licences.md` classe la superposition des courbes en Standard.
- Le bouton `Superposer des courbes` est affiche si `onOpenOverlay` est fourni, sans condition licence.
- La modale `CurvesOverlayModal` est montee directement dans la page surveillance.

Impact:

- Pack/One peuvent probablement ouvrir et utiliser la superposition des courbes sur la surveillance.

References:

- `website/docs/infos-licences.md:37`
- `website/src/app/[locale]/(dashboard)/surveillance/_components/monitoring-header-controls.tsx:76`
- `website/src/app/[locale]/(dashboard)/surveillance/monitoring-page-client.tsx:653`

Correction recommandee:

- Charger la licence dans la page surveillance et ne passer `onOpenOverlay` que pour Standard/Expert.
- Ajouter une protection dans `CurvesOverlayModal` ou un composant `LicenseBlockedCard` en defense secondaire.
- Ajouter un test smoke UI/API si une API dediee est ajoutee.

### 3. API de parametres trop generique pour des reglages reserves

Severite: elevee.

Attendu: les reglages lies a Standard/Expert ne doivent pas etre modifiables en Pack/One.

Constat:

- L'UI masque la messagerie en Pack/One et masque `dashboard:surveillance_refresh` si la licence n'est pas Standard/Expert.
- Les routes `/api/parametres` et `/api/parametres/[key]` ne verifient pas l'edition de licence.
- Elles autorisent un utilisateur avec `GERER_PROFIL` a modifier n'importe quelle cle, y compris potentiellement `messaging:enabled`, `dashboard:surveillance_refresh`, `CFR21:*`, `STATISTICS_MONTHLY_REPORT:*`.

Impact:

- Un utilisateur Pack/One avec droit profil peut activer ou modifier des reglages qui correspondent a des fonctions Standard/Expert, meme si l'UI les masque.

References:

- `website/src/app/[locale]/(admin)/admin/parametres/_components/settings-client.tsx:72`
- `website/src/app/[locale]/(admin)/admin/parametres/_components/settings-client.tsx:135`
- `website/src/app/api/parametres/route.ts:30`
- `website/src/app/api/parametres/[key]/route.ts:78`

Correction recommandee:

- Ajouter une table de classification des parametres par edition minimale.
- Bloquer cote API les cles reservees, par exemple:
  - `messaging:enabled` -> Standard/Expert
  - `dashboard:surveillance_refresh` -> Standard/Expert si c'est bien le comportement voulu
  - `CFR21:*` -> Standard/Expert
  - `STATISTICS_MONTHLY_REPORT:*` -> Expert si le rapport parametrable reste Expert
- Garder l'UI actuelle, mais ne pas s'y fier comme protection.

### 4. CFR21 non borne explicitement par licence cote API

Severite: moyenne a elevee.

Attendu: Standard/Expert uniquement d'apres `infos-licences.md`.

Constat:

- Les parametres CFR21 sont lus par l'authentification et `/api/me`.
- Aucun garde licence specifique CFR21 n'a ete trouve sur les routes de parametres.

Impact:

- Si les cles CFR21 sont presentes en base, elles peuvent influencer le comportement meme sur une licence Pack/One.
- Un utilisateur autorise a gerer les parametres peut potentiellement activer CFR21 hors edition Standard.

References:

- `website/src/app/api/auth/login/route.ts:72`
- `website/src/app/api/me/route.ts:51`
- `website/src/app/api/parametres/route.ts:30`
- `website/src/app/api/parametres/[key]/route.ts:78`

Correction recommandee:

- Centraliser `isCfr21Enabled` dans un helper qui retourne toujours `false` si la licence n'est pas Standard/Expert.
- Bloquer les modifications `CFR21:*` dans les API de parametres pour Pack/One.

### 5. VigiLog non borne par edition de licence

Severite: a arbitrer.

Attendu: non documente clairement dans `infos-licences.md`.

Constat:

- La sidebar affiche VigiLog selon les droits utilisateur (`ACCES_VIGILOG` ou `ACCES_METROLOGIE`), sans condition licence.
- Les APIs VigiLog utilisent uniquement les autorisations utilisateur (`VIGILOG_ACCESS_CODES`), pas l'edition de licence.

Impact:

- Si VigiLog est considere comme une fonctionnalite Standard/Expert, il est actuellement disponible en Pack/One des qu'un utilisateur a les droits.
- Si VigiLog est un module/service separe, il faut l'indiquer explicitement dans la documentation licence et idealement dans les options de licence.

References:

- `website/src/components/app-sidebar.tsx`
- `website/src/components/services/VigilogPageClient.tsx`
- `website/src/app/api/services/vigilog/_shared.ts:3`
- `website/src/app/api/services/vigilog/configurations/route.ts:26`
- `website/src/app/api/services/vigilog/tournees/route.ts:32`

Correction recommandee:

- Decider si VigiLog depend d'une edition ou d'une option module.
- Si Standard/Expert: ajouter `requireStandardOrExpertLicense()` sur les APIs et masquer la navigation via licence.
- Si option separee: ajouter une option `VIGILOG` dans la licence et un helper dedie.

### 6. Rapport statistique mensuel non borne par licence

Severite: moyenne.

Attendu: Expert uniquement si l'on suit `Rapport statistique parametrable` dans la licence Expert.

Constat:

- Les routes de configuration et d'envoi du recap mensuel ne verifient pas l'edition de licence.
- La route planifiee utilise seulement un secret d'appel.

Impact:

- Pack/One/Standard peuvent configurer ou declencher le rapport si l'utilisateur a `GERER_PROFIL` ou si le secret est connu.

References:

- `website/src/app/api/statistiques/recap-mensuel/config/route.ts:24`
- `website/src/app/api/statistiques/recap-mensuel/send/route.ts:18`
- `website/src/app/api/statistiques/recap-mensuel/send/route.ts:42`

Correction recommandee:

- Ajouter un helper `requireExpertLicense()` si cette fonction doit rester Expert.
- Ajouter un bornage dans les routes `config` et `send`.
- Clarifier dans `infos-licences.md` si les statistiques simples restent toutes editions et si seul le rapport parametre est Expert.

### 7. Onglet Mailing du lieu probablement trop restreint

Severite: moyenne, risque inverse.

Attendu: Pack inclut `Notification Mail`.

Constat:

- L'onglet `Mailing` du formulaire lieu est affiche uniquement lorsque `hasMetrologyTabs = isStandardOrExpert(license)`.
- Cela cache la configuration des contacts mails par lieu en Pack/One, alors que Pack inclut les notifications mail.

Impact:

- Les clients Pack/One pourraient ne pas pouvoir configurer les destinataires mail par lieu depuis l'UI, malgre une fonctionnalite incluse.

References:

- `website/docs/infos-licences.md`
- `website/src/app/[locale]/(admin)/admin/lieux/_components/location-form-dialog.tsx:107`
- `website/src/app/[locale]/(admin)/admin/lieux/_components/location-form-dialog.tsx:359`
- `website/src/app/[locale]/(admin)/admin/lieux/_components/location-form-dialog.tsx:383`

Correction recommandee:

- Dissocier les onglets metrologie et mailing:
  - `showMetrologyTab = Standard/Expert`
  - `showMailingTab = Pack/One/Standard/Expert` si notification mail est incluse dans toutes les editions.

### 8. Fallback licence UI incoherent dans `AppAccessProvider`

Severite: faible a moyenne.

Constat:

- `validateLicense` utilise une edition de repli `one` si l'edition est absente.
- `AppAccessProvider` calcule `edition = getLicenseEdition(license, "standard")`.

Impact:

- Pendant un etat transitoire ou une licence non chargee, le champ `edition` expose par le provider peut indiquer `standard`.
- Les booleens `isPack`, `isOne`, `isStandard`, `isExpert` restent eux bases sur les helpers et retombent plutot sur `one`, mais le champ `edition` peut induire des erreurs si reutilise ailleurs.

References:

- `website/src/lib/license-server.ts`
- `website/src/components/access/app-access-provider.tsx:39`

Correction recommandee:

- Utiliser le meme fallback partout, idealement `one`.
- Eviter de consommer `edition` directement pour debloquer des fonctions; preferer les helpers explicites.

## Couverture du smoke test licence

Le script `website/scripts/smoke-license-matrix.ts` couvre deja:

- `/api/license`
- `/api/etalons/types`
- `/api/etalons`
- `/api/sondes/etalonnages`
- `/api/sondes/etalonnages/preview`
- `/api/sondes/etalonnages/bulk`
- `/api/sondes/ajustages/bulk`
- `/api/lieux` avec champs EMT
- `/fr/admin`

Manques a ajouter:

- `/fr/admin/analyse-impact` en Pack/One doit etre bloque ou redirige.
- `/api/analyse-impact/save` doit retourner 403 en Pack/One.
- Bouton/modale superposition des courbes en surveillance pour Pack/One.
- `/api/parametres/[key]` sur cles reservees: `messaging:enabled`, `CFR21:*`, `STATISTICS_MONTHLY_REPORT:*`.
- `/api/services/vigilog/*` selon arbitrage licence.
- `/api/statistiques/recap-mensuel/config` et `/send` si Expert uniquement.

## Priorites recommandees

1. Corriger les protections serveur avant les masquages UI: `analyse-impact`, `parametres`, `recap-mensuel`, eventuellement `vigilog`.
2. Corriger la superposition des courbes cote UI, avec une protection defensive dans la modale.
3. Clarifier officiellement VigiLog et rapport mensuel dans `infos-licences.md`.
4. Dissocier `Mailing` et `Metrologie` dans le formulaire lieu pour eviter de bloquer une fonction Pack.
5. Etendre `smoke-license-matrix.ts` avec les cas ci-dessus.

## Conclusion

Les controles critiques deja prevus pour la metrologie Standard sont presents sur les etalons, les etalonnages et les champs EMT/derive/incertitude des lieux. En revanche, plusieurs fonctionnalites Standard ou Expert restent accessibles par URL directe ou par API generique, principalement parce que les droits utilisateur sont controles mais pas l'edition de licence.

Le point le plus important a traiter est le bornage serveur. Un masquage UI seul ne suffit pas: les routes API doivent refuser explicitement Pack/One pour les fonctionnalites Standard.
