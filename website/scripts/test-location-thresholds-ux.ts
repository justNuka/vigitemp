import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8")

const emt = read("src/app/[locale]/(admin)/admin/lieux/_components/metrology-tab/emt-mode-section.tsx")
assert.match(emt, /formatNumber/)
assert.match(emt, /maximumDecimals: 4/)
assert.match(emt, /locale === 'fr' \? 'fr-FR' : locale/)
assert.match(emt, /formatEmtNumber\(emtPreview\.emtSonde\)/)
assert.match(emt, /formatEmtNumber\(absEj\)/)
assert.match(emt, /formatEmtNumber\(iEtalonnage\)/)
assert.match(emt, /formatEmtNumber\(withDerivePart\)/)

const metrology = read("src/app/[locale]/(admin)/admin/lieux/_components/location-form-tab-metrology.tsx")
assert.match(metrology, /formatMetrologyNumber\(formData\.Tolerance_Surveillance_Sup\)/)
assert.match(metrology, /formatMetrologyNumber\(formData\.Tolerance_Surveillance_Inf\)/)

const general = read("src/app/[locale]/(admin)/admin/lieux/_components/location-form-tab-general.tsx")
const timingPosition = general.indexOf("<LocationTimingSection")
const setpointsPosition = general.indexOf("<LocationSetpointsSection")
assert.ok(timingPosition >= 0, "Timing section must be rendered")
assert.ok(setpointsPosition > timingPosition, "Timing section must be above setpoints")

const timing = read("src/app/[locale]/(admin)/admin/lieux/_components/general-tab/location-timing-section.tsx")
assert.match(timing, /register\('Frequence'/)
assert.match(timing, /register\('Nb_Mesures_Temporisation_Redeclenchement'/)
assert.match(timing, /frequency_gso/)

const setpoints = read("src/app/[locale]/(admin)/admin/lieux/_components/general-tab/location-setpoints-section.tsx")
assert.doesNotMatch(setpoints, /register\('Frequence'/)
assert.doesNotMatch(setpoints, /register\('Nb_Mesures_Temporisation_Redeclenchement'/)
assert.match(setpoints, /labels\.lower_threshold/)
assert.match(setpoints, /labels\.upper_threshold/)
assert.match(setpoints, /register\('Consigne_Inf'/)
assert.match(setpoints, /register\('Consigne_Sup'/)
assert.match(setpoints, /register\('Consigne_Inf_Pre_Alarme'/)
assert.match(setpoints, /register\('Consigne_Sup_Pre_Alarme'/)

console.log("location-thresholds-ux: OK")
