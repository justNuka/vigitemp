# Installation web offline (standalone)

Ce mémo décrit la procédure pour préparer un build Next.js autonome et l’installer offline.

## 1) Préparer le build (machine connectée)
Optionnel si vous lancez `Prepare-StandaloneBuild.ps1` sans options : le script exécute déjà `pnpm install`, `pnpm prisma:generate` et `pnpm build`.

Sinon, dans `website/` :

```
pnpm install
pnpm prisma:generate
pnpm build
```

## 2) Générer le package offline
Dans `website/installer/` :

```
.\Prepare-StandaloneBuild.ps1
```

Le package est créé dans `build/website-standalone/` et contient :
- `.next/standalone`
- `.next/static`
- `public/`
- `installer/` (Install-VigitempWeb.ps1 + winsw.exe)

## 3) Copier sur clé USB
Copier le dossier `build/website-standalone/` vers la clé USB.

## 4) Installer offline (machine client)
Sur la machine cible :

```
cd "<chemin>\\website-standalone\\installer"
.\Install-VigitempWeb.ps1
```

Le script :
- copie les fichiers dans `C:\ProgramData\Vigitemp\website`
- écrit `.env.production`
- installe et démarre le service `VigitempWeb` via WinSW

## 5) Vérification
```
Get-Service VigitempWeb
curl http://localhost:3000
```

## 6) Stop / suppression du service
Lancer un PowerShell **admin** :

```
sc.exe stop VigitempWeb
sc.exe delete VigitempWeb
```

Puis supprimer `C:\ProgramData\Vigitemp\website` si nécessaire.
