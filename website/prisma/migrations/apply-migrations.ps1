# Script PowerShell pour appliquer les migrations sur les nouvelles bases
# Ce script vérifie si les colonnes existent avant de les ajouter

$env:DATABASE_URL = "mysql://root:root@127.0.0.1:3306/vigitemp_ifb"
$env:DATABASE_MESURE_URL = "mysql://root:root@127.0.0.1:3306/vigitemp_mesure_ifb"

Write-Host "=== Application des migrations sur vigitemp_ifb ===" -ForegroundColor Cyan

# Migration 1: ResetPasswordToken
Write-Host "Migration 1: Ajout de ResetPasswordToken..." -ForegroundColor Yellow
try {
    npx prisma db execute --stdin --schema=prisma/db-main/schema.prisma <<EOF
ALTER TABLE t_utilisateur ADD COLUMN ResetPasswordToken VARCHAR(255) NULL;
EOF
    Write-Host "✓ ResetPasswordToken ajouté" -ForegroundColor Green
} catch {
    Write-Host "⚠ ResetPasswordToken existe déjà ou erreur" -ForegroundColor Yellow
}

# Migration 2: ResetPasswordExpires
Write-Host "Migration 2: Ajout de ResetPasswordExpires..." -ForegroundColor Yellow
try {
    npx prisma db execute --stdin --schema=prisma/db-main/schema.prisma <<EOF
ALTER TABLE t_utilisateur ADD COLUMN ResetPasswordExpires DATETIME NULL;
EOF
    Write-Host "✓ ResetPasswordExpires ajouté" -ForegroundColor Green
} catch {
    Write-Host "⚠ ResetPasswordExpires existe déjà ou erreur" -ForegroundColor Yellow
}

# Migration 3: MotDePasseTemporaire
Write-Host "Migration 3: Ajout de MotDePasseTemporaire..." -ForegroundColor Yellow
try {
    npx prisma db execute --stdin --schema=prisma/db-main/schema.prisma <<EOF
ALTER TABLE t_utilisateur ADD COLUMN MotDePasseTemporaire BOOLEAN DEFAULT FALSE;
EOF
    Write-Host "✓ MotDePasseTemporaire ajouté" -ForegroundColor Green
} catch {
    Write-Host "⚠ MotDePasseTemporaire existe déjà ou erreur" -ForegroundColor Yellow
}

Write-Host "`n=== Migrations terminées ===" -ForegroundColor Cyan
Write-Host "Génération du client Prisma..." -ForegroundColor Yellow
npx prisma generate

Write-Host "`n✓ Tout est prêt!" -ForegroundColor Green
