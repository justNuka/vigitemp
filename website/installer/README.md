ï»¿ï»¿# Installateur site web Vigitemp

Ce script installe le site Next.js, écrit le fichier env, puis crée un service Windows.

## Prérequis
- Lancer PowerShell en tant quâadministrateur.
- Node.js LTS installé (node dans PATH ou `-NodePath`).
- pnpm disponible si mode online (le script tente Corepack sinon `-PnpmPath`).

## Mode standalone (recommandé)
Le build produit un bundle autonome (`.next/standalone`) qui évite de copier `node_modules`.

### Préparer le build (machine connectée)
```
cd website
pnpm install
pnpm prisma:generate
pnpm build
```

### Copier vers une clé USB
Copier le dossier `website/` (au minimum : `.next/standalone`, `.next/static`, `public`, `package.json`).

### Installer en offline (machine client)
```
cd "website\installer"
.\Install-VigitempWeb.ps1 -Standalone -Offline
```

## Mode offline classique (sans standalone)
- Nécessite de copier `node_modules` et `.next`.
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
- Écrit le fichier env avec DB + secrets
- Crée un service Windows qui lance le serveur

## Fichiers
- Logs install : `C:\ProgramData\Vigitemp\install-logs\install-web-*.log`
- Logs app : (demandé pendant lâinstall, défaut `C:\ProgramData\Vigitemp\web-logs`)

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
