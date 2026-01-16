# Processus de developpement et bonnes pratiques

## Branching et releases
- `main` / `master` : stable
- branches par feature ou correctif
- versions taguees pour les releases client

## Conventions de code
- Noms de dossiers en francais (ex: `alarmes`, `utilisateurs`).
- Noms de fichiers et code en anglais (components, hooks, services).
- Slugs localises :
  - en anglais pour `/en/*`
  - en francais pour `/fr/*`

## API et responses
- Format standard : `{ ok: true, data }` ou `{ ok: false, error, message }`.
- Centraliser dans `api-response` et `http`.
- Eviter les endpoints redondants (un seul dossier canon par ressource).

## I18n
- Sources uniques pour les traductions.
- Pas de doublon i18n.
- Locale determine aussi les slugs.

## Logs vs audit
- Audit trail : trace metier des actions utilisateur.
- Logging : diagnostic technique (timestamp, ip, page, action).
- Toujours distinguer ces deux objectifs.

## Performance et UX
- Pas de revalidation globale a chaque navigation.
- Skeletons uniquement pour les donnees (pas de blocage plein ecran).
- Tables standardisees (pagination, header sticky, scroll interne).

## Tests et validation
- Tester en dev et en build standalone.
- Verifier les logs serveur et web.
- Valider les scripts d'installation offline.

## Documentation
- Toute decision ou process doit etre documente.
- Mettre a jour les docs a chaque evolution importante.
