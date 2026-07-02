i??i??# Installateur site web Vigitemp

Ce script installe le site Next.js, ecrit le fichier env, puis cree un service Windows.

## Prerequis
- Lancer PowerShell en tant qu'administrateur.
- Node.js LTS installe (node dans PATH ou `-NodePath`).
- pnpm disponible si mode online (le script tente Corepack sinon `-PnpmPath`).

## Mode standalone (recommande)
Le build produit un bundle autonome (`.next/standalone`) qui evite de copier `node_modules`.

### Preparer le build (machine connectee)
```
cd website
pnpm install
pnpm prisma:generate
pnpm build
```

### Copier vers une cle USB
Copier le dossier `website/` (au minimum : `.next/standalone`, `.next/static`, `public`, `package.json`).

### Installer en offline (machine client)
```
cd "website\installer"
.\Install-VigitempWeb.ps1 -Standalone -Offline
```

## Mode offline classique (sans standalone)
- Necessite de copier `node_modules` et `.next`.
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
  -InstallDir "C:\ProgramData\VigiSensys\website" \
  -ServiceName "VigiSensysWeb" \
  -Port 3000 \
  -EnvFileName ".env.production" \
  -NodePath "C:\Program Files\nodejs\node.exe" \
  -PnpmPath "C:\Users\<user>\AppData\Roaming\npm\pnpm.cmd"
```

## Ce que fait le script
- Copie le site dans le dossier d'installation
- Ecrit le fichier env avec DB + secrets
- Cree un service Windows qui lance le serveur

## Fichiers
- Logs install : `C:\ProgramData\VigiSensys\install-logs\install-web-*.log`
- Logs app : (demande pendant l'install, defaut `C:\ProgramData\VigiSensys\web-logs`)

## Rollback
```
sc.exe stop VigiSensysWeb
sc.exe delete VigiSensysWeb
```
Supprimer le dossier d'installation si besoin.

## Desinstallation
```
cd "website\installer"
.\Uninstall-VigitempWeb.ps1
```
