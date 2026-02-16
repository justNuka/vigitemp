# SMTP/JWT Secret - Generation et integration installateur

## Option a choisir pour la cle
Pour ton ecran actuel, prends :

- `Enhanced Secret Key` (avec caracteres speciaux)
- `256 bits`

C'est suffisant et adapte pour JWT + chiffrement SMTP.

## Format recommande dans `.env`
On utilise une seule cle applicative, puis on la reference pour SMTP :

```env
JWT_SECRET=<CLE_GENEREE_256_BITS>
SMTP_SECRET_KEY=<MEME_CLE_QUE_JWT_SECRET>
```

Pourquoi pareil :

- evite une rupture de decrypt SMTP si une cle est oubliee
- simplifie le support et les migrations

## Regle importante
Ne jamais regenerer automatiquement la cle sur une mise a jour.

- Si la cle change, les mots de passe SMTP deja chiffres deviennent indechiffrables.
- La cle doit etre stable pour une instance cliente.

## Mise a jour installateurs (plan concret)
Fichiers cibles :

- `installer/Install-VigitempWeb.ps1`
- `installer/Prepare-StandaloneBuild.ps1` (si besoin de template)
- `installer/README.md`

### 1) A l'installation (nouvelle instance)
Objectif : creer une cle une seule fois, puis l'ecrire dans `.env`.

Pseudo-flux :

1. Verifier si `JWT_SECRET` existe deja dans `.env`.
2. Si absent :
   1. Generer une cle 32 octets random (256 bits), encodee en Base64.
   2. Ecrire `JWT_SECRET=<cle>`.
3. Verifier `SMTP_SECRET_KEY`.
4. Si absent :
   1. Ecrire `SMTP_SECRET_KEY=<valeur JWT_SECRET>`.

### 2) En mise a jour
Objectif : ne pas casser l'existant.

- Si `.env` existe : conserver `JWT_SECRET` et `SMTP_SECRET_KEY`.
- Ajouter uniquement les cles manquantes.
- Ne jamais remplacer une cle deja presente.

### 3) Script PowerShell de generation (reference)

```powershell
# 32 bytes => 256 bits
$bytes = New-Object byte[] 32
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)

# Exemple d'ecriture
# JWT_SECRET=$secret
# SMTP_SECRET_KEY=$secret
```

## Validation post-install
Apres installation :

1. verifier `.env` contient `JWT_SECRET` et `SMTP_SECRET_KEY`
2. lancer l'app
3. sauvegarder une config SMTP
4. verifier en BDD que `SMTP_MOT_DE_PASSE` commence par `enc:v1:`
5. verifier qu'un envoi email test fonctionne (decrypt OK)

## Rotation de cle (plus tard)
Si besoin de rotation un jour, il faudra :

1. decrypter toutes les valeurs SMTP avec l'ancienne cle
2. rechiffrer avec la nouvelle cle
3. seulement ensuite remplacer la cle dans `.env`

Sans ca, perte de lecture des secrets SMTP.
