# Smoke test licence (automatique)

Script: `website/scripts/smoke-license-matrix.ts`

## Lancer

```bash
pnpm -C website test:license-smoke -- --base http://127.0.0.1:3000 --username EBO --password "xxxx"
```

Ou via variables d'environnement:

```bash
$env:SMOKE_BASE_URL="http://127.0.0.1:3000"
$env:SMOKE_USERNAME="EBO"
$env:SMOKE_PASSWORD="xxxx"
pnpm -C website test:license-smoke
```

## Ce que le script vérifie
- Login API
- Edition licence détectée
- Accès/bloquage API étalons
- Accès/bloquage API étalonnage
- Ajustage import reste accessible (pas 403)
- Anti-contournement EMT sur `/api/lieux` (Pack/One bloqués)
- Accès `/fr/admin`

## Résultat
- `PASS`/`FAIL` par test
- code retour `0` si tout est OK
- code retour `2` s'il y a au moins un échec
