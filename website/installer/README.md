ï»¿ï»¿# Installateur site web Vigitemp

Ce script installe le site Next.js, Ã©crit le fichier env, puis crÃ©e un service Windows.

## PrÃ©requis
- Lancer PowerShell en tant quâadministrateur.
- Node.js LTS installÃ© (node dans PATH ou `-NodePath`).
- pnpm disponible si mode online (le script tente Corepack sinon `-PnpmPath`).

## Mode standalone (recommandÃ©)
Le build produit un bundle autonome (`.next/standalone`) qui Ã©vite de copier `node_modules`.

### PrÃ©parer le build (machine connectÃ©e)
```
cd website
pnpm install
pnpm prisma:generate
pnpm build
```

### Copier vers une clÃ© USB
Copier le dossier `website/` (au minimum : `.next/standalone`, `.next/static`, `public`, `package.json`).

### Installer en offline (machine client)
```
cd "website\installer"
.\Install-VigitempWeb.ps1 -Standalone -Offline
```

## Mode offline classique (sans standalone)
- NÃ©cessite de copier `node_modules` et `.next`.
```
.\Install-VigitempWeb.ps1 -Offline
```

## Lancer (interactif)
```
cd "website\installer"
.\Install-VigitempWeb.ps1
```

## Lancer (silencieux)
```
.\Install-VigitempWeb.ps1 \
  -Silent \
  -SourcePath "C:\repo\vigitemp\website" \
  -InstallDir "C:\ProgramData\Vigitemp\website" \
  -ServiceName "VigitempWeb" \
  -Port 3000 \
  -EnvFileName ".env.production" \
  -NodePath "C:\Program Files\nodejs\node.exe" \
  -PnpmPath "C:\Users\<user>\AppData\Roaming\npm\pnpm.cmd"
```

## Ce que fait le script
- Copie le site dans le dossier dâinstallation
- Ãcrit le fichier env avec DB + secrets
- CrÃ©e un service Windows qui lance le serveur

## Fichiers
- Logs install : `C:\ProgramData\Vigitemp\install-logs\install-web-*.log`
- Logs app : (demandÃ© pendant lâinstall, dÃ©faut `C:\ProgramData\Vigitemp\web-logs`)

## Rollback
```
sc.exe stop VigitempWeb
sc.exe delete VigitempWeb
```
Supprimer le dossier dâinstallation si besoin.

## Desinstallation
```
cd "website\installer"
.\Uninstall-VigitempWeb.ps1
```
