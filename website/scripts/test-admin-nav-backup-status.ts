import assert from "node:assert/strict"

import { shouldShowAdminNavDock } from "../src/components/admin-nav-dock"
import {
  buildSecondaryCopySummary,
  getBackupLogMessage,
  getRobocopyState,
  isBackupErrorLine,
  isBackupProcessEndLine,
  isBackupProcessStartLine,
  isDailyArchiveSuccessLine,
  isMeaningfulBackupLogLine,
  parseBackupLogStatus,
} from "../src/lib/backup-log-parser"

const sampleLog = String.raw`### Backup quotidien des bases de donnees VigiSensys ###
Repertoire principal de sauvegarde : "C:\ProgramData\Vigisensys\Backup_BDD\BACKUP"
Repertoire secondaire de sauvegarde (si defini) : "Z:\Temp"
[23/09/2026 10:36:17] ## DEBUT PROCESS BACKUP ##
[23/09/2026 10:36:17] Rotation des historiques
[23/09/2026 10:36:17] OK robocopy J-6_J-7 (code=1)
[23/09/2026 10:36:18] Dump MAIN_SCHEMA_DATA : OK
[23/09/2026 10:36:28] DUMP MESURES_SCHEMA_DATA : OK
[23/09/2026 10:37:24] 7zip DUMP JOUR vers J : OK (code=0)
[23/09/2026 10:37:24] Nettoyage dossier de travail
[23/09/2026 10:37:24] ERREUR robocopy Repertoire principal vers Repertoire Secondaire (code=16)
## FIN PROCESS BACKUP ##
[23/09/2026 10:37:24]`

const parsed = parseBackupLogStatus(sampleLog)
assert.equal(parsed.secondaryPath, String.raw`Z:\Temp`)
assert.equal(parsed.runs.length, 1)
assert.equal(parsed.runs[0].primaryStatus, "success")
assert.equal(parsed.runs[0].secondaryStatus, "failed")
assert.equal(parsed.runs[0].secondaryRobocopyCode, 16)

const secondary = buildSecondaryCopySummary(parsed)
assert.deepEqual(secondary, {
  configured: true,
  path: String.raw`Z:\Temp`,
  etat: "failed",
  robocopyCode: 16,
})

const noSecondary = parseBackupLogStatus(String.raw`Repertoire secondaire de sauvegarde (si defini) : ""
[23/09/2026 10:36:17] ## DEBUT PROCESS BACKUP ##
[23/09/2026 10:37:24] 7zip DUMP JOUR vers J : OK (code=0)
[23/09/2026 10:37:24] ## FIN PROCESS BACKUP ##`)
assert.equal(noSecondary.runs[0].primaryStatus, "success")
assert.equal(buildSecondaryCopySummary(noSecondary).etat, "not_configured")

const englishError = parseBackupLogStatus(String.raw`Secondary backup directory (if defined): "Z:\Backup"
[23/09/2026 10:36:17] ## DEBUT PROCESS BACKUP ##
[23/09/2026 10:37:24] 7zip DUMP JOUR vers J : OK (code=0)
[23/09/2026 10:37:25] ERROR robocopy Primary backup directory to Secondary backup directory (code=8)
[23/09/2026 10:37:25] ## FIN PROCESS BACKUP ##`)
assert.equal(englishError.runs[0].primaryStatus, "success")
assert.equal(englishError.runs[0].secondaryStatus, "failed")
assert.equal(englishError.runs[0].secondaryRobocopyCode, 8)

const fullyEnglishLog = parseBackupLogStatus(String.raw`Secondary backup directory (if defined): "Z:\Backup"
[23/09/2026 10:36:17] ## START BACKUP PROCESS ##
[23/09/2026 10:36:18] MAIN DATABASE DUMP : SUCCESS
[23/09/2026 10:37:24] 7zip DAILY DUMP to J : SUCCESS (code=0)
[23/09/2026 10:37:25] Robocopy Primary backup directory to Secondary backup directory : SUCCESS (code=1)
[23/09/2026 10:37:25] ## END BACKUP PROCESS ##
[23/09/2026 10:37:25]
`)
assert.equal(fullyEnglishLog.runs.length, 1)
assert.equal(fullyEnglishLog.runs[0].primaryStatus, "success")
assert.equal(fullyEnglishLog.runs[0].secondaryStatus, "success")
assert.equal(fullyEnglishLog.runs[0].secondaryRobocopyCode, 1)

assert.equal(isBackupProcessStartLine("[23/09/2026 10:36:17] ## DEBUT PROCESS BACKUP ##"), true)
assert.equal(isBackupProcessStartLine("[23/09/2026 10:36:17] ## START BACKUP PROCESS ##"), true)
assert.equal(isBackupProcessEndLine("[23/09/2026 10:37:25] ## FIN PROCESS BACKUP ##"), true)
assert.equal(isBackupProcessEndLine("[23/09/2026 10:37:25] ## END BACKUP PROCESS ##"), true)
assert.equal(isDailyArchiveSuccessLine("[23/09/2026 10:37:24] 7zip DUMP JOUR vers J : OK (code=0)"), true)
assert.equal(isDailyArchiveSuccessLine("[23/09/2026 10:37:24] 7zip DAILY DUMP to J : SUCCESS (code=0)"), true)

assert.equal(getBackupLogMessage("[23/09/2026 10:37:25]"), "")
assert.equal(isMeaningfulBackupLogLine("[23/09/2026 10:37:25]"), false)
assert.equal(isMeaningfulBackupLogLine("   "), false)
assert.equal(isMeaningfulBackupLogLine("[23/09/2026 10:37:25] ERROR copy failed"), true)

assert.equal(isBackupErrorLine("ERREUR copie impossible"), true)
assert.equal(isBackupErrorLine("ERROR 5 (0x00000005) Access is denied."), true)
assert.equal(isBackupErrorLine("ERREURS lors de la copie"), true)
assert.equal(isBackupErrorLine("ERRORS while copying"), true)
assert.equal(isBackupErrorLine("FAILED to copy file"), true)
assert.equal(isBackupErrorLine("DUMP MAIN : OK"), false)

for (let code = 0; code <= 7; code += 1) {
  assert.equal(getRobocopyState(code), "success", `Robocopy code ${code} must not be treated as failure`)
}
for (let code = 8; code <= 16; code += 1) {
  assert.equal(getRobocopyState(code), "failed", `Robocopy code ${code} must be treated as failure`)
}

assert.equal(shouldShowAdminNavDock("/admin"), true)
assert.equal(shouldShowAdminNavDock("/admin/sondes"), true)
assert.equal(shouldShowAdminNavDock("/admin/sondes/ajustage-import"), true)
assert.equal(shouldShowAdminNavDock("/admin/lieux/templates"), true)
assert.equal(shouldShowAdminNavDock("/admin/outils/test-sonde"), true)
assert.equal(shouldShowAdminNavDock("/admin/parametres"), false)
assert.equal(shouldShowAdminNavDock("/admin/audit"), false)
assert.equal(shouldShowAdminNavDock("/admin/metrologie"), false)

console.log("admin-nav-backup-status: OK")
