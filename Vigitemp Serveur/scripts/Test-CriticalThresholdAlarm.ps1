$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

function Read-RepoFile([string]$relativePath) {
    $path = Join-Path $root $relativePath
    if (-not (Test-Path $path)) {
        throw "Missing file: $relativePath"
    }
    return [System.IO.File]::ReadAllText($path)
}

function Assert-Match([string]$content, [string]$pattern, [string]$message) {
    if ($content -notmatch $pattern) {
        throw $message
    }
}

function Assert-Order([string]$content, [string]$first, [string]$second, [string]$message) {
    $firstIndex = $content.IndexOf($first, [System.StringComparison]::Ordinal)
    $secondIndex = $content.IndexOf($second, [System.StringComparison]::Ordinal)
    if ($firstIndex -lt 0 -or $secondIndex -lt 0 -or $firstIndex -ge $secondIndex) {
        throw $message
    }
}

$settings = Read-RepoFile "Vigitemp Serveur\LieuAlarmSettings.cs"
Assert-Match $settings "SeuilCritiqueBas" "LieuAlarmSettings must expose lower critical threshold."
Assert-Match $settings "SeuilCritiqueHaut" "LieuAlarmSettings must expose upper critical threshold."
Assert-Match $settings "bool seuilCritiqueHautActive = false" "Critical threshold constructor parameters must remain optional for legacy fallbacks."

$sensor = Read-RepoFile "Vigitemp Serveur\Sensor.cs"
Assert-Match $sensor "criticalLowNow = hasCriticalLow" "Sensor must evaluate the lower critical threshold."
Assert-Match $sensor "criticalHighNow = hasCriticalHigh" "Sensor must evaluate the upper critical threshold."
Assert-Match $sensor "lowImmediate = forceLowImmediate \|\| criticalLowNow" "Lower critical threshold must force immediate evaluation."
Assert-Match $sensor "highImmediate = forceHighImmediate \|\| criticalHighNow" "Upper critical threshold must force immediate evaluation."
Assert-Match $sensor "debounceSeconds: lowImmediate \? 0" "Lower critical threshold must bypass the normal delay."
Assert-Match $sensor "debounceSeconds: highImmediate \? 0" "Upper critical threshold must bypass the normal delay."
Assert-Match $sensor "criticalLowNow \|\| !planningDelayActive" "Critical lower threshold must bypass planning setpoint delay."
Assert-Match $sensor "criticalHighNow \|\| !planningDelayActive" "Critical upper threshold must bypass planning setpoint delay."

$mysqlProvider = Read-RepoFile "Vigitemp Serveur\MySqlDatabaseProvider.cs"
Assert-Match $mysqlProvider "ReadLieuAlarmSettingsV3" "MySQL provider must read schema 0.91 critical fields."
Assert-Match $mysqlProvider "return ReadLieuAlarmSettingsV2\(idLieu\)" "MySQL provider must retain 0.90.2 fallback."
Assert-Match $mysqlProvider "Seuil_Critique_Haut" "MySQL provider must select the upper critical threshold."

$mssqlProvider = Read-RepoFile "Vigitemp Serveur\SqlServerDatabaseProvider.cs"
Assert-Match $mssqlProvider "ReadLieuAlarmSettingsV3" "SQL Server provider must read schema 0.91 critical fields."
Assert-Match $mssqlProvider "return ReadLieuAlarmSettingsV2\(idLieu\)" "SQL Server provider must retain 0.90.2 fallback."
Assert-Match $mssqlProvider "Seuil_Critique_Bas" "SQL Server provider must select the lower critical threshold."

$mysqlSeed = Read-RepoFile "..\db\vigisensys_seed.sql"
Assert-Match $mysqlSeed "Est_Seuil_Critique_Haut_Active" "MySQL seed must define critical threshold fields."
Assert-Match $mysqlSeed "NEW\.Derniere_Valeur < NEW\.Seuil_Critique_Bas" "MySQL GSO trigger must detect a critical low excursion."
Assert-Match $mysqlSeed "NEW\.Derniere_Valeur > NEW\.Seuil_Critique_Haut" "MySQL GSO trigger must detect a critical high excursion."
Assert-Match $mysqlSeed "NEW\.Derniere_Date_Heure,\s*NEW\.Derniere_Valeur,\s*'B'" "MySQL critical low alarm must start on the current measure."

$mssqlSeed = Read-RepoFile "..\db\vigisensys_seed_mssql.sql"
Assert-Match $mssqlSeed "@Est_Seuil_Critique_Haut_Active" "SQL Server trigger must read upper critical activation."
Assert-Match $mssqlSeed "@Derniere_Valeur < @Seuil_Critique_Bas" "SQL Server GSO trigger must detect critical low."
Assert-Match $mssqlSeed "@Derniere_Valeur > @Seuil_Critique_Haut" "SQL Server GSO trigger must detect critical high."

$mysqlMigration = Read-RepoFile "..\db\migrations\0.91.0\mysql.sql"
Assert-Match $mysqlMigration "DROP TRIGGER IF EXISTS `TRG_GSO_BEF_UPD_LIEU_ALARME`" "MySQL migration must replace the GSO alarm trigger."
Assert-Order $mysqlMigration "DROP TRIGGER IF EXISTS `TRG_GSO_BEF_UPD_LIEU_ALARME`" "INSERT INTO `t_parametre` (`Section`, `Mot_Cle`, `Valeur`, `Commentaire`)" "MySQL schema version must be updated after the trigger definition."

$mssqlMigration = Read-RepoFile "..\db\migrations\0.91.0\mssql.sql"
Assert-Match $mssqlMigration "CREATE OR ALTER TRIGGER dbo\.\[TRG_GSO_BEF_UPD_LIEU_ALARME\]" "SQL Server migration must replace the GSO alarm trigger."
Assert-Order $mssqlMigration "CREATE OR ALTER TRIGGER dbo.[TRG_GSO_BEF_UPD_LIEU_ALARME]" "SET Valeur = N'0.91.0'" "SQL Server schema version must be updated after the trigger definition."

Write-Host "Critical threshold alarm contract: OK"
