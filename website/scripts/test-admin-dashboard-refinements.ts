import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8")

const dock = read("src/components/admin-nav-dock.tsx")
assert.match(dock, /ADMIN_NAV_DOCK_PATHS/)
assert.match(dock, /"\/admin\/sondes"/)
assert.match(dock, /"\/admin\/lieux"/)
assert.doesNotMatch(dock, /\/admin\/metrologie\/bains-etalons/)
assert.doesNotMatch(dock, /\/admin\/lieux\/templates/)
assert.doesNotMatch(dock, /key: "etalons"/)
assert.doesNotMatch(dock, /key: "lieux_templates"/)

const layout = read("src/app/[locale]/(admin)/admin/layout.tsx")
assert.match(layout, /shouldShowAdminNavDock\(normalizedPathname\)/)
assert.doesNotMatch(layout, /showDock\s*=\s*!\(/)
assert.doesNotMatch(layout, /isOneOrPack\(license\)/)

const locationDialog = read("src/app/[locale]/(admin)/admin/lieux/_components/location-form-dialog.tsx")
assert.match(locationDialog, /href="\/admin\/lieux\/templates"/)
assert.match(locationDialog, /template\.manage/)
assert.match(locationDialog, /!isEdit/)

const dashboard = read("src/app/[locale]/(admin)/admin/page.tsx")
assert.match(dashboard, /useAcknowledgments\(1, 7\)/)
assert.match(dashboard, /useUpcomingCalibrationCount\(!hideStandards\)/)
assert.match(dashboard, /description_recent/)
assert.match(dashboard, /upcomingCalibrationCount/)
assert.match(dashboard, /setIsBackupLogOpen\(true\)/)
assert.match(dashboard, /auto-rows-fr/)

const adminData = read("src/hooks/useAdminData.ts")
assert.match(adminData, /dateFrom/)
assert.match(adminData, /dateTo/)
assert.match(adminData, /\/api\/admin\/metrologie\/etalonnages-a-prevoir/)
assert.doesNotMatch(adminData, /etalonnages-a-prevoir\\?days=/)

const calibrationRoute = read("src/app/api/admin/metrologie/etalonnages-a-prevoir/route.ts")
assert.match(calibrationRoute, /ROW_NUMBER\(\) OVER/)
assert.match(calibrationRoute, /PARTITION BY Sonde_Numero_Serie/)
assert.match(calibrationRoute, /COALESCE\(s\.Est_Sonde_Reformee, 0\) = 0/)
assert.match(calibrationRoute, /e\.Date_Validite >= \$\{from\}/)
assert.match(calibrationRoute, /e\.Date_Validite <= \$\{to\}/)
assert.match(calibrationRoute, /t_parametre\.findFirst/)
assert.match(calibrationRoute, /normalizeCalibrationWarningDays/)

const backupRoute = read("src/app/api/admin/sauvegardes/route.ts")
assert.match(backupRoute, /MAX_BACKUP_LOG_ENTRIES = 300/)
assert.match(backupRoute, /toBackupLogEntry/)
assert.match(backupRoute, /logEntries: backupLog\.entries/)
assert.match(backupRoute, /logTruncated: backupLog\.truncated/)

const backupDialog = read("src/app/[locale]/(admin)/admin/_components/admin-backup-log-dialog.tsx")
assert.match(backupDialog, /adminDashboard\.backup\.log/)
assert.match(backupDialog, /entry\.level === "error"/)
assert.match(backupDialog, /summary\?\.logTruncated/)
assert.match(backupDialog, /max-h-\[58vh\]/)

const expertDashboard = read("src/app/[locale]/(admin)/admin/_components/expert-admin-dashboard.tsx")
assert.match(expertDashboard, /DEFAULT_WIDGETS/)
assert.doesNotMatch(expertDashboard, /widget\.id !== "etalons"/)
assert.match(expertDashboard, /onOpenBackupLog/)

const expertLayout = read("src/app/[locale]/(admin)/admin/_components/expert-dashboard/expert-dashboard-layout.ts")
assert.match(expertLayout, /\{ id: "etalons", w: 12, h: 13 \}/)

for (const language of ["fr", "en"]) {
  const messages = JSON.parse(read(`src/messages/${language}.json`))
  assert.ok(messages.locationsForm?.dialog?.template?.manage)
  assert.ok(messages.adminDashboard?.acknowledgments?.description_recent)
  assert.ok(messages.adminDashboard?.backup?.log?.title)
  assert.ok(messages.adminDashboard?.metrology?.title)
}

console.log("admin-dashboard-refinements: OK")
