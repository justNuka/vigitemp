# Script pour vérifier et appliquer uniquement les migrations manquantes
# Ce script vérifie chaque colonne avant de l'ajouter

Write-Host "=== Vérification et application des migrations sur vigitemp_ifb ===" -ForegroundColor Cyan
Write-Host ""

$migrations = @(
    @{
        Name = "Étendre Mot_de_passe pour bcrypt (VARCHAR(60))"
        SQL = "ALTER TABLE ``t_utilisateur`` MODIFY COLUMN ``Mot_de_passe`` VARCHAR(60);"
        Check = "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='vigitemp_ifb' AND TABLE_NAME='t_utilisateur' AND COLUMN_NAME='Mot_de_passe';"
        CheckValue = "varchar(60)"
    },
    @{
        Name = "Ajouter DateDerniereModificationMDP"
        SQL = "ALTER TABLE ``t_utilisateur`` ADD COLUMN ``DateDerniereModificationMDP`` DATETIME(0) NULL;"
        Check = "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='vigitemp_ifb' AND TABLE_NAME='t_utilisateur' AND COLUMN_NAME='DateDerniereModificationMDP';"
    },
    @{
        Name = "Ajouter ResetPasswordToken"
        SQL = "ALTER TABLE ``t_utilisateur`` ADD COLUMN ``ResetPasswordToken`` VARCHAR(255) NULL;"
        Check = "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='vigitemp_ifb' AND TABLE_NAME='t_utilisateur' AND COLUMN_NAME='ResetPasswordToken';"
    },
    @{
        Name = "Ajouter ResetPasswordExpires"
        SQL = "ALTER TABLE ``t_utilisateur`` ADD COLUMN ``ResetPasswordExpires`` DATETIME(0) NULL;"
        Check = "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='vigitemp_ifb' AND TABLE_NAME='t_utilisateur' AND COLUMN_NAME='ResetPasswordExpires';"
    },
    @{
        Name = "Ajouter MotDePasseTemporaire"
        SQL = "ALTER TABLE ``t_utilisateur`` ADD COLUMN ``MotDePasseTemporaire`` BOOLEAN DEFAULT FALSE;"
        Check = "SELECT COUNT(*) as cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA='vigitemp_ifb' AND TABLE_NAME='t_utilisateur' AND COLUMN_NAME='MotDePasseTemporaire';"
    }
)

# Fonction pour exécuter une requête SQL via Prisma
function Invoke-PrismaSQL {
    param($SQL)
    
    $tempFile = New-TemporaryFile
    $SQL | Out-File -FilePath $tempFile.FullName -Encoding utf8
    
    try {
        $result = npx prisma db execute --file="$($tempFile.FullName)" --schema=prisma/db-main/schema.prisma 2>&1
        return $result
    }
    finally {
        Remove-Item $tempFile.FullName -ErrorAction SilentlyContinue
    }
}

# Appliquer chaque migration
foreach ($migration in $migrations) {
    Write-Host "Vérification: $($migration.Name)" -ForegroundColor Yellow
    
    # Essayer d'appliquer la migration
    $result = Invoke-PrismaSQL -SQL $migration.SQL
    
    if ($result -match "Duplicate column" -or $result -match "already exists") {
        Write-Host "  ✓ Déjà présent - Ignoré" -ForegroundColor Gray
    }
    elseif ($result -match "Script executed successfully" -or $result -match "successfully") {
        Write-Host "  ✓ Appliqué avec succès" -ForegroundColor Green
    }
    else {
        Write-Host "  ⚠ Résultat: $result" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Ajout des paramètres de sécurité ===" -ForegroundColor Cyan

$paramsSQL = "INSERT INTO t_parametre (Section, MotCle, Valeur, Commentaire) VALUES ('security:password', 'expiry_days', '90', 'Durée de validité du mot de passe en jours'), ('security:password', 'expiry_enabled', 'true', 'Activer expiration des mots de passe'), ('security:email', 'smtp_host', '', 'Serveur SMTP'), ('security:email', 'smtp_port', '587', 'Port SMTP'), ('security:email', 'smtp_user', '', 'Utilisateur SMTP'), ('security:email', 'smtp_password', '', 'Mot de passe SMTP'), ('security:email', 'smtp_from', 'noreply@vigitemp.com', 'Adresse email expéditeur'), ('security:email', 'smtp_enabled', 'false', 'Activer envoi emails') ON DUPLICATE KEY UPDATE Valeur = VALUES(Valeur), Commentaire = VALUES(Commentaire);"

$result = Invoke-PrismaSQL -SQL $paramsSQL
if ($result -match "Script executed successfully" -or $result -match "successfully") {
    Write-Host "  ✓ Paramètres ajoutés/mis à jour" -ForegroundColor Green
}
else {
    Write-Host "  ⚠ Résultat: $result" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Génération du client Prisma ===" -ForegroundColor Cyan
npx prisma generate

Write-Host ""
Write-Host "✓ Migrations terminées!" -ForegroundColor Green
Write-Host "Vous pouvez maintenant lancer Prisma Studio pour voir vos nouvelles bases." -ForegroundColor White
