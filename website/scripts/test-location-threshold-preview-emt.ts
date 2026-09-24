import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import {
  buildLocationAlarmThresholdIssues,
  computeLocationAlarmThresholdState,
} from "../src/lib/location-alarm-threshold-contract"

const base = {
  mode: "manuel",
  emtValue: 2,
  consigne: 5,
  consigneSup: 10,
  consigneInf: 0,
  isConsigneSupActive: true,
  isConsigneInfActive: true,
  preAlarmHigh: 7,
  preAlarmHighActive: true,
  preAlarmLow: 3,
  preAlarmLowActive: true,
  criticalHigh: 12,
  criticalHighActive: true,
  criticalLow: -2,
  criticalLowActive: true,
  incertitude: null,
  erreurJustesse: null,
  derive: null,
  includeDeriveInUncertainty: true,
  correctAccuracyError: false,
}

const state = computeLocationAlarmThresholdState(base)
assert.equal(state.effectiveHigh, 8)
assert.equal(state.effectiveLow, 2)
assert.deepEqual(buildLocationAlarmThresholdIssues(base, "fr"), [])

const highPreAlarmOnEffectiveThreshold = buildLocationAlarmThresholdIssues(
  { ...base, preAlarmHigh: 8 },
  "fr",
)
assert.ok(
  highPreAlarmOnEffectiveThreshold.some(
    (issue) =>
      issue.path[0] === "Consigne_Sup_Pre_Alarme" &&
      issue.message.includes("EMT"),
  ),
)

const lowPreAlarmOnEffectiveThreshold = buildLocationAlarmThresholdIssues(
  { ...base, preAlarmLow: 2 },
  "en",
)
assert.ok(
  lowPreAlarmOnEffectiveThreshold.some(
    (issue) =>
      issue.path[0] === "Consigne_Inf_Pre_Alarme" &&
      issue.message.includes("MPE"),
  ),
)

const emtCrossesTarget = buildLocationAlarmThresholdIssues(
  {
    ...base,
    emtValue: 6,
    preAlarmHighActive: false,
    preAlarmLowActive: false,
    criticalHighActive: false,
    criticalLowActive: false,
  },
  "fr",
)
assert.ok(
  emtCrossesTarget.some(
    (issue) =>
      issue.path[0] === "Consigne_Sup" &&
      issue.message.includes("seuil effectif haut"),
  ),
)
assert.ok(
  emtCrossesTarget.some(
    (issue) =>
      issue.path[0] === "Consigne_Inf" &&
      issue.message.includes("seuil effectif bas"),
  ),
)

const invalidCriticalAgainstEffective = buildLocationAlarmThresholdIssues(
  { ...base, criticalHigh: 8 },
  "fr",
)
assert.ok(
  invalidCriticalAgainstEffective.some(
    (issue) => issue.path[0] === "Seuil_Critique_Haut",
  ),
)

const previewSource = readFileSync(
  fileURLToPath(
    new URL(
      "../src/app/[locale]/(admin)/admin/lieux/_components/general-tab/location-alarm-preview.tsx",
      import.meta.url,
    ),
  ),
  "utf8",
)
assert.match(previewSource, /const \[stableDomain, setStableDomain\] = useState/)
assert.match(previewSource, /setStableDomain\(\(current\) =>/)
assert.doesNotMatch(previewSource, /fallbackDomainRef/)
assert.match(previewSource, /Never shrink the scale while the form is open/)
assert.match(previewSource, /\[highDelayStart, highAlarmLevel\]/)
assert.match(previewSource, /\[lowDelayStart, lowAlarmLevel\]/)
assert.match(previewSource, /delay_window/)
assert.match(previewSource, /fill="rgba\(249, 115, 22, 0\.08\)"/)

const setpointsSource = readFileSync(
  fileURLToPath(
    new URL(
      "../src/app/[locale]/(admin)/admin/lieux/_components/general-tab/location-setpoints-section.tsx",
      import.meta.url,
    ),
  ),
  "utf8",
)
assert.match(setpointsSource, /buildLocationAlarmThresholdIssues/)
assert.match(setpointsSource, /setpoints\.invalid_title/)
assert.match(setpointsSource, /setpoints\.emt_effective_title/)
assert.match(setpointsSource, /getThresholdIssue\('Consigne_Sup_Pre_Alarme'\)/)
assert.match(setpointsSource, /getThresholdIssue\('Consigne_Inf_Pre_Alarme'\)/)

for (const relativePath of [
  "../src/app/api/lieux/route.ts",
  "../src/app/api/lieux/[id]/route.ts",
]) {
  const source = readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), "utf8")
  assert.match(source, /buildLocationAlarmThresholdIssues/)
  assert.match(source, /thresholdIssues/)
}

console.log("Location threshold preview / EMT tests passed")
