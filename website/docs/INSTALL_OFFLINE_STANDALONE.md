# Installation web offline (standalone)

Ce mémo décrit le build standalone et l’installation offline.

## 1) Préparations (machine connectée)
Dans `website/installer/` :

```
.\Prepare-StandaloneBuild.ps1
```

Le script exécute déjà :
- `pnpm install`
- `pnpm prisma:generate`
- `pnpm build`

## 2) Package
Le package est créé dans `build/website-standalone/` :
- `.next/standalone`
- `.next/static`
- `public/`
- `installer/` (Install-VigitempWeb.ps1 + winsw.exe)

## 3) Copie USB
Copier `build/website-standalone/` sur la clé.

## 4) Install offline (client)

```
cd "<chemin>\website-standalone\installer"
.\Install-VigitempWeb.ps1
```

Le script :
- copie dans `C:\ProgramData\Vigitemp\website`
- écrit `.env.production`
- installe et démarre `VigitempWeb` via WinSW

## 5) Vérification
```
Get-Service VigitempWeb
curl http://localhost:3000
```

## 6) Stop / suppression service
PowerShell admin :

```
sc.exe stop VigitempWeb
sc.exe delete VigitempWeb
```

Puis supprimer `C:\ProgramData\Vigitemp\website` si besoin.
