# Script PowerShell pour générer un hash bcrypt et mettre à jour un utilisateur admin

$password = "Admin123!"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Generation du hash bcrypt..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Créer un script Node.js temporaire
$nodeScript = @"
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('$password', 10);
console.log(hash);
"@

$tempFile = [System.IO.Path]::GetTempFileName() + ".js"
$nodeScript | Out-File -FilePath $tempFile -Encoding utf8

# Exécuter le script
$hash = & node $tempFile

# Nettoyer
Remove-Item $tempFile

Write-Host "Mot de passe temporaire: $password" -ForegroundColor Green
Write-Host "Hash bcrypt: $hash" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Application du mot de passe..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Créer le fichier SQL
$sql = @"
-- Mettre à jour le mot de passe de l'utilisateur admin
UPDATE ``t_utilisateur`` 
SET ``Mot_de_passe`` = '$hash',
    ``MotDePasseTemporaire`` = TRUE,
    ``DateDerniereModificationMDP`` = NOW()
WHERE ``Login`` = 'admin' OR ``Login`` = 'Admin' OR ``IdUtilisateur`` = 1;
"@

$sqlFile = "prisma\db-main\migrations\ifb\update_admin_password.sql"
$sql | Out-File -FilePath $sqlFile -Encoding utf8

Write-Host "Fichier SQL cree: $sqlFile" -ForegroundColor Green
Write-Host ""
Write-Host "Application de la mise a jour sur vigitemp_ifb..." -ForegroundColor Yellow

# Appliquer le SQL
$env:DATABASE_URL = "mysql://root:root@127.0.0.1:3306/vigitemp_ifb"
npx prisma db execute --file="$sqlFile" --schema=prisma/db-main/schema.prisma

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TERMINE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Vous pouvez maintenant vous connecter avec:" -ForegroundColor White
Write-Host "  Login: admin" -ForegroundColor Cyan
Write-Host "  Mot de passe: $password" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ce mot de passe est temporaire et vous devrez le changer a la premiere connexion." -ForegroundColor Yellow
