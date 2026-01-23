# Installation offline standalone (web)

## Preparation (machine connectee)
Dans `website/` :
- `pnpm install`
- `pnpm prisma:generate`
- `pnpm build`

Ou utiliser directement :
- `website/installer/Prepare-StandaloneBuild.ps1`

## Contenu a copier
Le package `build/website-standalone` doit contenir :
- `.next/standalone`
- `.next/static`
- `public/`
- `installer/` (scripts + winsw + node msi)

## Installation (machine cible)
1. `installer/Install-Node.ps1`
2. `installer/Install-VigitempWeb.ps1`

## Notes
- Le fichier env est ecrit dans `.next/standalone/.env`.
- Pas de dependances npm installees sur la machine cible.
