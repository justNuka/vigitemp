# Rapport verification fonctionnalites / licences - 2026-06-02

## Perimetre

Objectif corrige : verifier deux choses pour chaque fonctionnalite listee dans `website/docs/infos-licences.md` :

1. La fonctionnalite existe dans le code et semble finie/exploitable.
2. La fonctionnalite est correctement bornee par licence, cote UI et cote API quand c'est applicable.

Les trois fonctionnalites explicitement marquees `a dev` dans la licence Standard sont exclues du statut bloquant :

- Module de calibrage
- Module d'etalonnage
- Module de lecture de la sonde etalon

Les fonctionnalites Expert sont documentees sous `Expert (Sortira plus tard)`. Elles sont quand meme auditees, mais classees separement quand elles ne sont pas encore implementees.

## Legende

| Statut | Sens |
| --- | --- |
| OK | Fonctionnalite trouvee et coherente avec la licence. |
| PARTIEL | Fonctionnalite trouvee, mais incomplete, ambigue, ou mal bornee. |
| MANQUANT | Pas d'implementation trouvee dans le code audite. |
| EXCLU | Fonctionnalite explicitement marquee `a dev` dans la documentation licence. |
| A ARBITRER | Documentation ou intention produit contradictoire avec le code existant. |

## Synthese courte

Le socle Pack est majoritairement present : surveillance, historique, alarmes, tolerances, retards et mails existent.

Le bornage licence est incomplet sur plusieurs fonctionnalites importantes. Certains controles existent seulement cote UI, mais pas cote API. C'est le cas notamment de l'analyse d'impact, de la superposition des courbes, de certains parametres, du rapport mensuel et de CFR21.

La licence One est partiellement coherente : l'offset est bien bloque en Pack, mais les sites/groupes ne semblent pas reserves a One+, et l'agent Windows semble present sans controle licence clair.

La licence Standard contient des protections solides pour etalons, etalonnage et champs metrologie des lieux. En revanche, analyse d'impact, superposition des courbes, CFR21 et certains parametres ne sont pas assez proteges cote serveur.

La licence Expert est largement incomplete si on la considere comme une licence disponible aujourd'hui. Comme le document indique `Sortira plus tard`, ce n'est pas forcement anormal, mais il faut le formaliser dans la roadmap.

## Pack

| Fonctionnalite | Etat implementation | Bornage licence | Statut | Notes |
| --- | --- | --- | --- | --- |
| Surveillance | Page de surveillance, cartes, graphes courts, refresh et filtres presents. | Fonctionnalite de base, pas besoin de blocage. | OK | Present dans `website/src/app/[locale]/(dashboard)/surveillance`. |
| Historique de mesures | Graphiques, tableau de mesures et fenetres de details presents. | Fonctionnalite de base. | OK | Present via les composants de mesure et API mesures/graphiques. |
| Alarme | Pages alarmes, dispatch mail/agent, acquittement et historique presents. | Fonctionnalite de base. | OK | Present dans `website/src/app/[locale]/(dashboard)/alarmes` et `website/src/app/api/alarmes`. |
| Tolerance | Champs consignes/tolerances dans lieux + persistence API. | Fonctionnalite de base. | OK | Present dans formulaire lieu et `website/src/app/api/lieux`. |
| Retard d'alarme | Champs retard haut/bas et traitement serveur. | Fonctionnalite de base. | OK | Present dans formulaire lieu et routes lieux. |
| Notification Mail | Dispatch email present, SMTP et destinataires configures par parametres. | Pack bloque sauf option licence mail explicite ; autres licences autorisees de base. | OK | Les emails applicatifs passent par `canUseApplicationEmail()`. |
| Nombre de sondes limite | Controle Pack present a la creation de sonde. | Controle API present. | OK | `website/src/app/api/sondes/route.ts` verifie `license.maxSensors` pour Pack. |
| Mail en option dans la licence uniquement | Controle present sur emails applicatifs. | Pack bloque sauf option mail ; One/Standard/Expert autorises de base. | OK | Alarmes, test SMTP, creation utilisateur et demandes materiel sont controles. |
| Pas de chat | Chat protege par licence Standard/Expert. | Controle API present. | OK | `website/src/lib/chat-guard.ts` bloque hors Standard/Expert. |

### Points Pack a corriger

1. Controle explicite de l'option mail Pack applique sur les emails applicatifs.
2. Revoir l'onglet mailing du formulaire lieu : il est actuellement masque hors Standard/Expert, alors que Pack inclut la notification mail.
3. Verifier que Pack ne peut pas acceder aux fonctionnalites One+ via API si l'intention produit est stricte.

## One

| Fonctionnalite | Etat implementation | Bornage licence | Statut | Notes |
| --- | --- | --- | --- | --- |
| Notification Windows agent | Endpoints agent et dispatch agent presents. | Controle licence non trouve dans le dispatch. | PARTIEL | `website/src/app/api/alarmes/dispatch/route.ts` envoie aux agents si `skipAgent` false, sans controle edition visible. |
| Gestion multi-sites et groupes | Sites/groupes presents en UI et API. | Pas de blocage Pack trouve. | PARTIEL | `main-navbar.tsx` affiche sites/groupes sans condition One+. APIs `api/sites` et `api/groupes` ne semblent pas controler la licence. |
| Sondes illimitees | Pack seul a une limite de creation. | OK pour One+. | OK | `website/src/app/api/sondes/route.ts` applique la limite seulement si edition Pack. |
| Offset | Offset bloque en Pack, autorise au-dessus. | Controle API present. | OK | `POST /api/sondes` force offset 0 en Pack ; `PATCH /api/sondes/[id]` refuse modification offset en Pack. |
| Ajustage / Calibrage | Import ajustage et stockage presents. | Ambigu : l'import ajustage est actuellement disponible plus largement que One. | A ARBITRER | `matrice-licences-acces.md` indique ajustage disponible pour toutes les licences, mais `infos-licences.md` le liste en One+. |

### Points One a corriger

1. Decider si sites/groupes doivent etre interdits en Pack. Si oui, ajouter garde UI + API sur `/api/sites*` et `/api/groupes*`.
2. Decider si agent Windows est One+ uniquement. Si oui, ajouter controle licence avant envoi agent et sur endpoints agent si necessaire.
3. Clarifier `Ajustage / Calibrage` : la matrice actuelle contredit `infos-licences.md`.

## Standard

| Fonctionnalite | Etat implementation | Bornage licence | Statut | Notes |
| --- | --- | --- | --- | --- |
| EMT par lieu | Champs EMT presents dans formulaire lieu et API. | Controle Standard/Expert present. | OK | `STANDARD_METROLOGY_FIELDS` + `requireStandardOrExpertIfFieldsUsed`. |
| Gestion des resultats d'etalonnage | Import etalonnage, APIs et page admin presents. | Controle Standard/Expert present. | OK | `api/sondes/etalonnages*` et page `admin/sondes/etalonnage-import`. |
| Gestion de la derive | Champs derive dans metrologie lieu. | Controle Standard/Expert present, mode avance plutot Expert cote UI. | OK | Present dans formulaire metrologie et routes lieux. |
| Module de calibrage | Marque `a dev`. | Exclu du controle. | EXCLU | Ne pas compter comme manque dans ce rapport. |
| Module d'etalonnage | Marque `a dev`. | Exclu du controle. | EXCLU | Ne pas compter comme manque dans ce rapport. |
| Module de lecture de la sonde etalon | Marque `a dev`. | Exclu du controle. | EXCLU | Ne pas compter comme manque dans ce rapport. |
| Superposition des courbes | Fonctionnalite presente sur surveillance. | Pas de controle licence trouve. | PARTIEL | Bouton/modal `CurvesOverlayModal` presents sans condition Standard/Expert visible. |
| Analyse d'impact | Page, export, sauvegarde presents. | UI masquee hors Standard/Expert dans sidebar, mais API/page pas protegees clairement. | PARTIEL | `/admin/analyse-impact` et `/api/analyse-impact/save` necessitent une garde serveur. |
| Dashboard administrateur | Dashboard admin present. Variante Expert aussi presente. | Acces admin pas strictement Standard, selon matrice existante. | A ARBITRER | Le document liste cette fonctionnalite en Standard, mais l'app fournit un dashboard simplifie Pack/One. |
| Messagerie inter-utilisateurs | Chat present. | Controle Standard/Expert present. | OK | `checkChatAccess()` applique `isStandardOrExpert`. |
| Fonctionnement CFR21 part 11 | Parametres CFR21, password rules, audit/logique auth presents. | Pas de controle licence trouve sur parametres CFR21. | PARTIEL | Les cles CFR21 passent par API parametres generique sans garde Standard/Expert visible. |

### Points Standard a corriger

1. Proteger `/admin/analyse-impact` et `/api/analyse-impact/save` par Standard/Expert cote serveur.
2. Proteger la superposition des courbes en UI et dans les APIs de donnees si elle expose une capacite Standard.
3. Proteger les parametres CFR21 dans `/api/parametres` et `/api/parametres/[key]`.
4. Clarifier le dashboard admin : soit il reste disponible en simplifie pour Pack/One, soit il devient une vraie fonctionnalite Standard.

## Expert

Le document indique `Expert (Sortira plus tard)`. L'audit ci-dessous indique donc l'etat actuel, pas une anomalie bloquante si Expert n'est pas encore commercialise.

| Fonctionnalite | Etat implementation | Bornage licence | Statut | Notes |
| --- | --- | --- | --- | --- |
| Suivi de la derive | Champs derive presents, pas de module de suivi dedie trouve. | Partiellement Standard/Expert. | PARTIEL | Standard gere deja la derive ; le suivi Expert dedie n'est pas identifie. |
| Parametrage du calcul d'incertitude | UI Expert presente dans metrologie lieu. | UI Expert, mais API semble seulement Standard/Expert. | PARTIEL | Un utilisateur Standard pourrait potentiellement envoyer certains modes avances via API si non bloque ailleurs. |
| Dashboard personnalisable | Dashboard Expert present. | Controle Expert present sur page admin. | OK | `ExpertAdminDashboard` rendu uniquement si edition Expert. |
| Gestion des etalonnages multi-point par courbe en X2 | Pas d'implementation trouvee. | Non applicable. | MANQUANT | A planifier si Expert doit sortir. |
| Calcul de la MKT | Pas d'implementation trouvee. | Non applicable. | MANQUANT | A planifier. |
| Planning de metrologie | Pas de planning metrologie dedie trouve. | Non applicable. | MANQUANT | Attention a ne pas confondre avec planning consignes/lieux. |
| IA assistant | Documentation technique trouvee, pas d'integration app trouvee. | Non applicable. | MANQUANT | `website/docs/ia-on-premise-vigisensys.md` existe, mais pas de module produit trouve. |
| Analyse temps reel | Pas de module dedie trouve. | Non applicable. | MANQUANT | A planifier. |
| Rapport statistique parametrable | Rapport mensuel/config present. | Pas de garde Expert trouvee. | PARTIEL | `/api/statistiques/recap-mensuel/*` utilise `GERER_PROFIL`, pas edition Expert. |
| Gestion des non-conformites | Pas d'implementation trouvee. | Non applicable. | MANQUANT | A planifier. |
| Modification retard alarme non-reponse possible, minimum 1h | Champ `Retard_Non_Reponse` present. | Pas de garde Expert ni min 1h stricte trouvee. | PARTIEL | API accepte valeur > 0 sur update, et la creation/schema ne montre pas une contrainte min 60. |
| Ecosysteme MC2 | Marque `a definir`. | Non verifiable. | A ARBITRER | Besoin de specification produit. |

## Ecarts critiques a traiter en priorite

### 1. Fonctionnalites masquees UI mais accessibles API

- Analyse d'impact : la sidebar masque selon Standard/Expert, mais la page et l'API de sauvegarde ne semblent pas avoir de garde licence serveur.
- Parametres : `/api/parametres` et `/api/parametres/[key]` permettent potentiellement de modifier des cles reservees (`CFR21:*`, `STATISTICS_MONTHLY_REPORT:*`, `messaging:*`, options surveillance).
- Rapport mensuel : endpoints de config/envoi non bornes Expert.

### 2. Fonctionnalites One+ accessibles Pack

- Sites/groupes : aucune garde licence claire trouvee.
- Agent Windows : pas de controle licence clair dans le dispatch.
- Ajustage : contradiction entre la matrice et `infos-licences.md`.

### 3. Options de licence partiellement exploitees

`license-server.ts` expose `options`. L'option mail Pack est maintenant exploitee pour les emails applicatifs. Les autres options fines restent a formaliser si elles deviennent contractuelles :

- agent Windows,
- autres options fines de licence.

Donc les options hors mail dans le fichier licence risquent encore d'etre informatives au lieu d'etre enforcees.

### 4. Expert pas pret comme licence complete

A part le dashboard Expert et une partie metrologie avancee, la plupart des fonctionnalites Expert listees ne sont pas encore trouvees dans le code.

C'est acceptable uniquement si Expert reste officiellement `sortira plus tard`.

## Recommandations techniques

1. Creer une matrice applicative unique des fonctionnalites : `featureKey`, `minEdition`, `licenseOption`, `status`.
2. Utiliser cette matrice cote UI et cote API, pour eviter les divergences entre masquage et securite serveur.
3. Ajouter des guards serveur dedies : `requireEdition("standard")`, `requireEdition("one")`, `requireLicenseOption("mail")`.
4. Ajouter une allowlist des cles parametres modifiables par edition dans `/api/parametres`.
5. Ajouter des tests API de non-regression par edition : Pack, One, Standard, Expert.
6. Clarifier la documentation entre `infos-licences.md` et `matrice-licences-acces.md`, surtout pour ajustage/calibrage et dashboard admin.

## Checklist de correction proposee

| Priorite | Action |
| --- | --- |
| P0 | Bloquer analyse d'impact cote serveur hors Standard/Expert. |
| P0 | Bloquer les cles CFR21 et rapport mensuel dans API parametres selon licence. |
| P0 | Controle de l'option mail licence applique pour Pack. |
| P1 | Clarifier et borner sites/groupes pour Pack vs One. |
| P1 | Clarifier et borner agent Windows pour Pack vs One. |
| P1 | Corriger le conflit Ajustage/Calibrage entre docs et code. |
| P1 | Borner superposition des courbes a Standard/Expert. |
| P2 | Formaliser Expert comme non commercialise ou completer les modules manquants. |
| P2 | Ajouter tests automatises par edition. |

## Conclusion

La base fonctionnelle est solide pour Pack/One/Standard, mais le modele licence n'est pas encore suffisamment centralise ni systematiquement applique cote API.

Le risque principal n'est pas l'absence des fonctions Pack ou Standard principales ; le risque principal est qu'une fonctionnalite reservee soit seulement cachee dans l'interface mais encore appelable par API.

Avant validation produit, il faut surtout fermer les guards serveur et clarifier les contradictions documentaires.

## Corrections appliquees le 2026-06-02

- VigiLog : acces UI et APIs bornes a Standard/Expert, avec conservation du controle de role existant.
- Rapport mensuel : endpoints de configuration/envoi bornes a Standard/Expert.
- Analyse d'impact : page directe et endpoint de sauvegarde bornes a Standard/Expert.
- Superposition des courbes : action masquee et modal non rendue hors Standard/Expert.
- Sites/groupes : menus et APIs bornes a One/Standard/Expert, donc non disponibles en Pack.
- Ajustages/calibrages : imports, previews, bulk import et lecture des ajustages bornes a One/Standard/Expert avec permission metrologie.
- Agent Windows : heartbeat/event et dispatch d'alarme bornes a One/Standard/Expert. En Pack, le dispatch alarme continue email/Teams et ignore l'agent avec `agentSkipped=license_forbidden`.
- Parametres reserves : CFR21, rapport mensuel, refresh surveillance et messagerie sont filtres/refuses hors Standard/Expert.
- Fallback de licence front : fallback ramene a One au lieu de Standard pour eviter d'ouvrir par defaut des fonctionnalites Standard pendant le chargement.
- Mail Pack optionnel : les emails applicatifs sont bloques en Pack si la licence ne contient pas d'option mail/email explicite. Les editions One, Standard et Expert conservent le mail de base.
- Mail Pack optionnel : les flux alarmes, test SMTP, creation utilisateur et demande materiel sont controles. Les demandes materiel basculent en `mailto` au lieu d'envoyer en SMTP si l'option mail manque.
- Mail Pack optionnel : la reinitialisation de mot de passe reste volontairement hors blocage licence pour ne pas verrouiller l'acces aux comptes.

## Verification apres corrections

- `pnpm exec tsc --noEmit` : OK.

## Verification complementaire des APIs le 2026-06-02

- VigiLog : toutes les routes `/api/services/vigilog/*` sont protegees Standard/Expert et conservent les controles de roles.
- Rapport mensuel : `/api/statistiques/recap-mensuel/config` et `/api/statistiques/recap-mensuel/send` sont proteges Standard/Expert.
- Analyse d'impact : `/api/analyse-impact/save` est protege Standard/Expert.
- Sites/groupes : `/api/sites*` et `/api/groupes*` de creation/modification/liste sont proteges One+.
- Agent Windows : heartbeat/event et dispatch agent sont proteges One+.
- Parametres reserves : CFR21, rapport mensuel, refresh surveillance et messagerie sont filtres/refuses hors Standard/Expert.
- Messagerie : les routes `/api/chat/*` utilisent `checkChatAccess()` et sont protegees Standard/Expert ; `/api/chat/users` a ete alignee. `/api/settings/messaging-enabled` renvoie maintenant `enabled:false` hors Standard/Expert.
- Etalons/etalonnages : les routes etalons et import etalonnage sont protegees Standard/Expert.
- Ajustages/calibrages : les routes d'import/preview/bulk et lecture ajustage sont protegees One+.

Routes encore uniquement `auth-only` apres scan : alarmes, surveillance, mesures, dashboard, sondes de base, modules/actionneurs, utilisateurs/profils/autorisations, SMTP/sauvegardes/journaux, telephonie et hotline. Elles correspondent soit au socle fonctionnel Pack, soit a de l'administration generale, soit a des modules non encore rattaches explicitement a une edition dans `infos-licences.md`. Elles restent donc a arbitrer uniquement si le produit decide de les borner par edition.
