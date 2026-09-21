import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

import { buildCriticalThresholdIssues } from "../src/lib/location-critical-threshold-contract"
import { buildLocationValueRangeIssues } from "../src/lib/sensor-value-range-contract"

const root = process.cwd()
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8")

const noHighValue = buildCriticalThresholdIssues({
  effectiveHigh: 8,
  criticalHighActive: true,
  criticalHigh: null,
})
assert.equal(noHighValue[0]?.path[0], "Seuil_Critique_Haut")

const invalidHigh = buildCriticalThresholdIssues({
  effectiveHigh: 8,
  criticalHighActive: true,
  criticalHigh: 8,
})
assert.equal(invalidHigh.length, 1)

const validHigh = buildCriticalThresholdIssues({
  effectiveHigh: 8,
  criticalHighActive: true,
  criticalHigh: 12,
})
assert.equal(validHigh.length, 0)

const invalidLow = buildCriticalThresholdIssues({
  effectiveLow: 2,
  criticalLowActive: true,
  criticalLow: 2,
})
assert.equal(invalidLow.length, 1)

const validLow = buildCriticalThresholdIssues({
  effectiveLow: 2,
  criticalLowActive: true,
  criticalLow: -2,
})
assert.equal(validLow.length, 0)

const fallbackToSetpoint = buildCriticalThresholdIssues({
  consigne: 5,
  criticalHighActive: true,
  criticalHigh: 4,
})
assert.equal(fallbackToSetpoint.length, 1)

const inconsistentCriticalPair = buildCriticalThresholdIssues({
  criticalHighActive: true,
  criticalHigh: 4,
  criticalLowActive: true,
  criticalLow: 5,
})
assert.ok(inconsistentCriticalPair.some((issue) => issue.path[0] === "Seuil_Critique_Bas"))

const rangeIssues = buildLocationValueRangeIssues(
  {
    Seuil_Critique_Haut: 126,
    Seuil_Critique_Bas: -41,
  },
  { min: -40, max: 125, unit: "°C" },
  "fr",
)
assert.deepEqual(
  rangeIssues.map((issue) => issue.path[0]).sort(),
  ["Seuil_Critique_Bas", "Seuil_Critique_Haut"].sort(),
)

const formSchema = read("src/app/[locale]/(admin)/admin/lieux/_components/location-form-schema.ts")
assert.match(formSchema, /buildCriticalThresholdIssues/)
assert.match(formSchema, /Seuil_Critique_Haut: z\.number\(\)\.optional\(\)\.nullable\(\)/)
assert.match(formSchema, /Est_Seuil_Critique_Bas_Active: z\.boolean\(\)\.optional\(\)/)

const setpoints = read("src/app/[locale]/(admin)/admin/lieux/_components/general-tab/location-setpoints-section.tsx")
assert.match(setpoints, /sections\.timing/)
assert.match(setpoints, /LocationAlarmPreview/)
assert.match(setpoints, /Est_Seuil_Critique_Haut_Active/)
assert.match(setpoints, /Est_Seuil_Critique_Bas_Active/)
assert.match(setpoints, /cursor-help/)
assert.match(setpoints, /border-dotted/)

const preview = read("src/app/[locale]/(admin)/admin/lieux/_components/general-tab/location-alarm-preview.tsx")
assert.match(preview, /useFormContext<LocationFormData>/)
assert.match(preview, /Retard_Alarme_Haut/)
assert.match(preview, /Retard_Alarme_Bas/)
assert.match(preview, /critical_description/)
assert.match(preview, /useReducedMotion/)
assert.match(preview, /TooltipContent/)
assert.match(preview, /strokeDasharray/)

const generalTab = read("src/app/[locale]/(admin)/admin/lieux/_components/location-form-tab-general.tsx")
assert.match(generalTab, /maxLength=\{30\}/)
assert.match(generalTab, /name_remaining/)
assert.match(generalTab, /30 - \(formData\.Nom_Lieu\?\.length \?\? 0\)/)

const emtMode = read("src/app/[locale]/(admin)/admin/lieux/_components/metrology-tab/emt-mode-section.tsx")
assert.match(emtMode, /formatNumber/)
assert.match(emtMode, /maximumDecimals: 4/)
assert.doesNotMatch(emtMode, /I_et = \$\{iEtalonnage\}/)

const emtInfo = read("src/app/[locale]/(admin)/admin/lieux/_components/metrology-tab/metrology-sensor-info-section.tsx")
assert.match(emtInfo, /formatNumber/)
assert.match(emtInfo, /formatMetrologyNumber\(formData\.Incertitude\)/)

const createRoute = read("src/app/api/lieux/route.ts")
assert.match(createRoute, /buildCriticalThresholdIssues/)
assert.match(createRoute, /Est_Seuil_Critique_Haut_Active/)
assert.match(createRoute, /effectiveHigh: validated\.Est_Consigne_Sup_Active/)
assert.match(createRoute, /effectiveLow: validated\.Est_Consigne_Inf_Active/)
assert.match(createRoute, /Seuil_Critique_Bas: validated\.Seuil_Critique_Bas/)

const updateRoute = read("src/app/api/lieux/[id]/route.ts")
assert.match(updateRoute, /buildCriticalThresholdIssues/)
assert.match(updateRoute, /effectiveHighActive/)
assert.match(updateRoute, /effectiveLowActive/)
assert.match(updateRoute, /Seuil_Critique_Haut: true/)
assert.match(updateRoute, /"Est_Seuil_Critique_Bas_Active"/)

const templates = read("src/app/api/lieux/templates/route.ts")
assert.match(templates, /Seuil_Critique_Haut/)
assert.match(templates, /Est_Seuil_Critique_Bas_Active/)

console.log("location-critical-thresholds: OK")
