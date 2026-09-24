import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import {
  DEFAULT_CALIBRATION_WARNING_DAYS,
  MAX_CALIBRATION_WARNING_DAYS,
  normalizeCalibrationWarningDays,
} from "../src/lib/calibration-warning-window"

assert.equal(DEFAULT_CALIBRATION_WARNING_DAYS, 15)
assert.equal(MAX_CALIBRATION_WARNING_DAYS, 365)
assert.equal(normalizeCalibrationWarningDays("30"), 30)
assert.equal(normalizeCalibrationWarningDays("90"), 90)
assert.equal(normalizeCalibrationWarningDays(7.9), 7)
assert.equal(normalizeCalibrationWarningDays("0"), 15)
assert.equal(normalizeCalibrationWarningDays("-4"), 15)
assert.equal(normalizeCalibrationWarningDays("not-a-number"), 15)
assert.equal(normalizeCalibrationWarningDays(undefined), 15)
assert.equal(normalizeCalibrationWarningDays("999"), 365)

function read(relativePath: string) {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8")
}

const routeSource = read(
  "../src/app/api/admin/metrologie/etalonnages-a-prevoir/route.ts",
)
assert.match(routeSource, /t_parametre\.findFirst/)
assert.match(routeSource, /getCalibrationWarningParameterCandidates/)
assert.match(routeSource, /normalizeCalibrationWarningDays/)
assert.match(routeSource, /source: warningSetting \? "database" : "fallback"/)
assert.doesNotMatch(routeSource, /searchParams\.get\("days"\)/)

const hookSource = read("../src/hooks/useAdminData.ts")
assert.match(
  hookSource,
  /export function useUpcomingCalibrationCount\(enabled: boolean = true\)/,
)
assert.match(
  hookSource,
  /"\/api\/admin\/metrologie\/etalonnages-a-prevoir"/,
)
assert.doesNotMatch(hookSource, /etalonnages-a-prevoir\?days=/)

const dashboardSource = read("../src/app/[locale]/(admin)/admin/page.tsx")
assert.match(
  dashboardSource,
  /useUpcomingCalibrationCount\(!hideStandards\)/,
)
assert.match(
  dashboardSource,
  /upcomingCalibrationQuery\.data\?\.days \?\? DEFAULT_CALIBRATION_WARNING_DAYS/,
)
assert.match(
  dashboardSource,
  /days: upcomingCalibrationDays/,
)
assert.doesNotMatch(
  dashboardSource,
  /useUpcomingCalibrationCount\(15/,
)
assert.doesNotMatch(
  dashboardSource,
  /metrology\.description", \{ days: 15 \}/,
)

const expertTypes = read(
  "../src/app/[locale]/(admin)/admin/_components/expert-dashboard/expert-dashboard-types.ts",
)
assert.match(expertTypes, /upcomingCalibrationDays: number/)

const expertRenderer = read(
  "../src/app/[locale]/(admin)/admin/_components/expert-dashboard/expert-widget-renderer.tsx",
)
assert.match(expertRenderer, /days: metrics\.upcomingCalibrationDays/)
assert.doesNotMatch(
  expertRenderer,
  /metrology\.description", \{ days: 15 \}/,
)

const settingsSource = read(
  "../src/app/[locale]/(admin)/admin/parametres/server-settings.tsx",
)
assert.match(settingsSource, /DEFAULT_CALIBRATION_WARNING_DAYS/)
assert.match(
  settingsSource,
  /dashboard:etalonnage_warning_days", value: String\(DEFAULT_CALIBRATION_WARNING_DAYS\)/,
)

const mysqlSeed = read("../../db/vigisensys_seed.sql")
const mssqlSeed = read("../../db/vigisensys_seed_mssql.sql")
assert.match(mysqlSeed.toUpperCase(), /ETALONNAGE_WARNING_DAYS/)
assert.match(mssqlSeed.toUpperCase(), /ETALONNAGE_WARNING_DAYS/)

console.log("Admin metrology calibration warning window tests passed")
