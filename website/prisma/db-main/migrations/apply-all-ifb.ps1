# Script simple pour appliquer les migrations
Write-Host "=== Application des migrations sur vigitemp_ifb ===" -ForegroundColor Cyan

# Liste des migrations à appliquer
$sqlFiles = @(
    "migration1_extend_password.sql",
    "migration2_add_date_modif.sql",
    "migration3_add_reset_fields.sql",
    "migration4_add_temp_password.sql",
    "migration5_add_parameters.sql"
)

foreach ($file in $sqlFiles) {
    $fullPath = "prisma\db-main\migrations\ifb\$file"
    if (Test-Path $fullPath) {
        Write-Host "Application de $file..." -ForegroundColor Yellow
        $result = npx prisma db execute --file="$fullPath" --schema=prisma/db-main/schema.prisma 2>&1
        
        if ($result -like "*Duplicate column*") {
            Write-Host "  - Deja presente, ignore" -ForegroundColor Gray
        }
        elseif ($result -like "*successfully*") {
            Write-Host "  - OK" -ForegroundColor Green
        }
        else {
            Write-Host "  - $result" -ForegroundColor Yellow
        }
    }
}

Write-Host "`nGeneration du client Prisma..." -ForegroundColor Cyan
npx prisma generate

Write-Host "`nTermine!" -ForegroundColor Green
