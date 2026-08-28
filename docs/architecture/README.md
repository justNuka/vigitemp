# Architecture et règles de développement VigiSensys

> Document d'entrée pour les travaux d'architecture, de refactorisation et les nouvelles fonctionnalités.
>
> Baseline de l'audit : branche `dev` au commit `78aacf0419714473afcddd4b0fd3e74f0637f345` (28/08/2026, merge PR #72).
>
> **Important : cette baseline n'est jamais une autorisation à travailler depuis ce SHA.** Avant tout développement, vérifier l'état GitHub réel et créer la branche depuis le HEAD courant de `dev`.

## 1. Objectif

Ces documents servent de mémoire persistante pour garder une architecture propre sans lancer de réécriture massive ni perdre les conventions déjà présentes dans le dépôt.

Ils complètent les documentations fonctionnelles et backlogs existants. En particulier, `website/docs/backlog-retours-17-08-2026.md` reste la référence pour les retours terrain d'août 2026 ; il ne doit pas devenir un backlog générique d'architecture.

## 2. Ordre de lecture

Pour toute nouvelle conversation ou tout chantier important :

1. lire ce fichier ;
2. lire [`development-guidelines.md`](./development-guidelines.md) avant d'écrire du code ;
3. lire [`refactor-roadmap.md`](./refactor-roadmap.md) pour connaître les priorités et dépendances entre chantiers ;
4. si le sujet touche l'ajustage, l'étalonnage, les sondes de métrologie ou `HotlineApiServer`, lire obligatoirement [`metrology-refactor.md`](./metrology-refactor.md) ;
5. pour une API Next.js, lire également `website/docs/API_CONVENTIONS.md` ;
6. vérifier ensuite le code actuel : la documentation décrit une direction, le code et les PR mergées restent la vérité sur l'état réellement implémenté.

## 3. Architecture actuelle

### Web

`website/` : Next.js / React / TypeScript, Prisma, MySQL ou SQL Server selon le provider, Tailwind/shadcn, Chart.js, TanStack Table, TanStack Query, next-intl.

Responsabilités principales :

- interface utilisateur ;
- authentification et autorisations ;
- APIs applicatives ;
- administration ;
- surveillance ;
- alarmes et notifications ;
- orchestration des opérations de métrologie ;
- accès aux deux bases via les clients Prisma et helpers de compatibilité SQL.

### Serveur Windows

`Vigitemp Serveur/` : service C# responsable notamment de :

- interrogation physique des sondes ;
- coordination des ports/modules ;
- récupération GSP/GSO ;
- calcul et persistance des mesures ;
- alarmes ;
- tâches planifiées ;
- support des opérations matérielles de métrologie ;
- API Hotline locale/réseau selon configuration.

La cible n'est pas d'en faire des microservices. Le bon objectif est un **monolithe modulaire**, avec des responsabilités clairement séparées.

### Agent Windows

`Vigitemp agent/` : agent/tray Windows pour les notifications et interactions locales avec le poste utilisateur.

Le V1 ne doit recevoir que des corrections ciblées et de sécurité. Une V2 est prévue ultérieurement et constitue le bon endroit pour moderniser le runtime .NET, supprimer l'accès direct à la base et adopter les notifications Windows natives.

### Bases de données

`db/`, Prisma côté Web et providers C# côté serveur.

Deux contraintes sont à traiter comme des règles d'architecture :

- compatibilité MySQL / SQL Server là où elle existe déjà ;
- distinction stricte entre un instant UTC et un `DATETIME` historique sans fuseau représentant une heure locale de la base.

## 4. Architecture cible

Le principe général est :

```text
UI / API / transport
        ↓
service applicatif / orchestration
        ↓
logique métier / domaine
        ↓
repository / gateway / protocole
        ↓
DB, matériel, réseau, OS
```

Une couche ne doit pas devenir un raccourci pour une autre. Exemples :

- une route HTTP ne contient pas toute la logique métier ;
- `HotlineApiServer` ne doit pas être le moteur matériel réutilisé par l'ajustage et l'étalonnage ;
- un composant React ne doit pas à la fois charger les données, implémenter les règles métier, construire les DTO et dessiner toute l'interface ;
- un provider SQL ne doit pas devenir l'endroit où sont implémentées des règles métier indépendantes du moteur SQL.

## 5. Règles de travail GitHub

Avant chaque lot de développement :

1. vérifier le HEAD actuel de `dev` ;
2. vérifier les PR ouvertes ;
3. vérifier les dernières PR mergées pertinentes ;
4. vérifier les branches existantes liées au sujet ;
5. lire le code et les docs/backlogs concernés ;
6. ne jamais supposer qu'un bug remonté n'a pas déjà été corrigé ;
7. créer une branche `agent/<sujet>` depuis le HEAD **actuel** de `dev` ;
8. limiter la branche à un sujet cohérent ;
9. avant la PR, comparer le diff complet à `dev` et retirer tout changement parasite ;
10. mettre à jour la documentation/backlog concerné ;
11. ouvrir la PR vers `dev`, sans la merger.

Après que la PR est annoncée comme mergée, vérifier réellement son état et le nouveau HEAD de `dev` avant le lot suivant.

## 6. Principes de refactorisation

- Pas de big-bang rewrite.
- Pas de déplacement massif de fichiers uniquement pour avoir une arborescence plus jolie.
- Extraire une responsabilité lorsqu'elle a une raison indépendante de changer, est réutilisée, devient difficile à tester, ou duplique une logique critique.
- Réutiliser d'abord les helpers existants documentés dans `development-guidelines.md`.
- Ajouter des tests autour du comportement avant une extraction risquée.
- Préserver les comportements terrain, les droits/licences, l'i18n et les contraintes de performance.
- Mesurer avant d'optimiser.
- Ne pas introduire Redis, Kafka, CQRS, microservices ou autre infrastructure distribuée sans besoin démontré pour le produit on-premise.

## 7. Définition de terminé d'une PR

Une PR de code n'est terminée que lorsque les points applicables sont couverts :

- diff ciblé et lisible ;
- aucune duplication évitable introduite ;
- helpers/conventions existants réutilisés ;
- règle métier testée lorsqu'elle est sensible ;
- TypeScript / ESLint / i18n / build Web OK si le Web est touché ;
- build/tests C# OK si un projet C# est touché ;
- aucun secret ou identifiant opérationnel ajouté en dur ;
- dates et fuseaux vérifiés si un `DATETIME` est touché ;
- impact performance vérifié pour les requêtes historiques ou boucles sur les sondes ;
- droits/licences vérifiés si l'accès à une fonction change ;
- documentation/backlog mis à jour ;
- checklist de validation terrain fournie pour un comportement matériel ou métier critique.

## 8. Documents canoniques

- `docs/architecture/README.md` — entrée et règles de reprise du contexte.
- `docs/architecture/development-guidelines.md` — conventions de code et helpers existants à réutiliser.
- `docs/architecture/refactor-roadmap.md` — ordre des chantiers et critères de découpage.
- `docs/architecture/metrology-refactor.md` — cible détaillée ajustage/étalonnage et frontière avec Hotline.
- `website/docs/API_CONVENTIONS.md` — conventions des routes API Next.js.
- `website/docs/backlog-retours-17-08-2026.md` — état des retours terrain d'août 2026.

Lorsque l'architecture réelle évolue, mettre ces documents à jour dans la même PR afin qu'une conversation future ne parte pas d'une architecture obsolète.
