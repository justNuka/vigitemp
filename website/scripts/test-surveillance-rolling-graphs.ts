import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

import {
  downsampleMeasurementsForGraph,
  MONITORING_CARD_GRAPH_MAX_POINTS,
  MONITORING_DETAIL_GRAPH_MAX_POINTS,
} from "../src/lib/measurement-downsampling"
import type { MeasureData } from "../src/lib/measurements"

const root = process.cwd()
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8")

function makeMeasure(
  index: number,
  overrides: Partial<MeasureData> = {},
): MeasureData {
  const date = new Date(2026, 8, 1, 0, index, 0, 0)
  const iso = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-") + "T" + [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0"),
  ].join(":")

  return {
    id: String(index),
    Valeur: index,
    Unite: "°C",
    Nb_Decimal: 1,
    DateHeureMesure: iso,
    DateHeureMesureIso: iso,
    DateHeureMesureXaxis: "",
    Consigne: 5,
    Consigne_Sup: 8,
    Consigne_Inf: 2,
    SondeNumeroSerie: "TEST",
    Frequence: 60,
    Etat_Alarme: 0,
    ...overrides,
  }
}

assert.equal(MONITORING_CARD_GRAPH_MAX_POINTS, 180)
assert.equal(MONITORING_DETAIL_GRAPH_MAX_POINTS, 600)

const small = Array.from({ length: 10 }, (_, index) => makeMeasure(index))
const smallResult = downsampleMeasurementsForGraph(small, 20)
assert.equal(smallResult.sampled, false)
assert.equal(smallResult.sourceCount, 10)
assert.deepEqual(smallResult.measurements, small)

const source = Array.from({ length: 100 }, (_, index) => makeMeasure(index))
source[50] = makeMeasure(50, { Valeur: 999 })
source[51] = makeMeasure(51, { Valeur: null, Est_Valeur_Null: true })
source[75] = makeMeasure(75, { Valeur: 75, Est_Valeur_Memoire: true })
source[80] = makeMeasure(80, { Consigne: 6 })

const sampled = downsampleMeasurementsForGraph(source, 22)
assert.equal(sampled.sampled, true)
assert.equal(sampled.sourceCount, source.length)
assert.ok(sampled.measurements.length <= 22)
assert.equal(sampled.measurements[0].id, "0")
assert.equal(sampled.measurements.at(-1)?.id, "99")
assert.ok(sampled.measurements.some((measure) => measure.Valeur === 999), "local maximum must be preserved")
assert.ok(sampled.measurements.some((measure) => measure.Est_Valeur_Null), "no-response point must be preserved")
for (let index = 1; index < sampled.measurements.length; index += 1) {
  assert.ok(
    sampled.measurements[index - 1].DateHeureMesureIso! <= sampled.measurements[index].DateHeureMesureIso!,
    "downsampled points must stay chronological",
  )
}

const card = read("src/components/monitoring-card.tsx")
assert.match(card, /rollingHours:\s*24/)
assert.match(card, /MONITORING_CARD_GRAPH_MAX_POINTS/)
assert.match(card, /rangeStartMs=\{chartRangeStartMs\}/)
assert.match(card, /rangeEndMs=\{chartRangeEndMs\}/)

const cardPreview = read("src/components/monitoring-card/monitoring-card-chart-preview.tsx")
assert.match(cardPreview, /type:\s*['"]linear['"]/)
assert.match(cardPreview, /min:\s*rangeStartMs/)
assert.match(cardPreview, /max:\s*rangeEndMs/)
assert.match(cardPreview, /getMeasureTimestamp\(point\)/)

const cardHeader = read("src/components/monitoring-card/monitoring-card-header.tsx")
const sensorIdentityIndex = cardHeader.indexOf("{sondeNumeroSerie || nomLieu}")
const locationIdentityIndex = cardHeader.indexOf("{nomLieu}", sensorIdentityIndex + 1)
assert.ok(sensorIdentityIndex >= 0, "sensor serial must be the primary identity")
assert.ok(locationIdentityIndex > sensorIdentityIndex, "location name must be rendered below sensor serial")

const detail = read("src/components/monitoring-details-modal.tsx")
assert.match(detail, /ROLLING_GRAPH_HOURS\s*=\s*24/)
assert.match(detail, /MONITORING_DETAIL_GRAPH_MAX_POINTS/)
assert.match(detail, /maxGraphPoints:\s*MONITORING_DETAIL_GRAPH_MAX_POINTS/)
assert.match(detail, /xRangeStart=\{graphRangeStart\}/)
assert.match(detail, /xRangeEnd=\{graphRangeEnd\}/)
assert.match(detail, /isRollingWindow=\{!hasExplicitRange\}/)

const graph = read("src/components/monitoring-details/monitoring-graph-tab.tsx")
assert.match(graph, /type:\s*"linear"/)
assert.match(graph, /sampled_measure_count/)
assert.match(graph, /rolling_measure_count/)
assert.match(graph, /rangeStartMs/)
assert.match(graph, /rangeEndMs/)

const rangeHook = read("src/components/monitoring-details/use-monitoring-range-measurements.ts")
assert.match(rangeHook, /maxGraphPoints\?: number/)
assert.match(rangeHook, /graphMaxPoints/)
assert.match(rangeHook, /graphSourceCount/)
assert.match(rangeHook, /graphSampled/)

const api = read("src/app/api/mesures/[idLieu]/route.ts")
assert.match(api, /graphMaxPoints/)
assert.match(api, /useGraphDownsampling/)
assert.match(api, /!usePagination/)
assert.match(api, /downsampleMeasurementsForGraph/)
assert.match(api, /graphSourceCount/)
assert.match(api, /graphSampled/)

const impactAnalysis = read("src/app/[locale]/(admin)/admin/analyse-impact/impact-analysis-client.tsx")
assert.doesNotMatch(
  impactAnalysis,
  /useMonitoringRangeMeasurements[\s\S]{0,500}maxGraphPoints/,
  "impact analysis must continue using full-resolution measurements",
)

const dateRangePicker = read("src/components/ui/date-range-picker.tsx")
assert.match(dateRangePicker, /triggerLabel \?\? t\('selectRange'\)/)
assert.match(dateRangePicker, /onUpdate\?\.\(\{ range: \{ from: undefined, to: undefined \}/)

for (const language of ["fr", "en"]) {
  const messages = JSON.parse(read(`src/messages/${language}.json`))
  assert.ok(messages.monitoringDetailsModal?.filters?.last_24_hours)
  assert.ok(messages.monitoringDetailsModal?.actions?.last_24_hours)
  assert.ok(messages.monitoringDetailsModal?.chart?.rolling_measure_count)
  assert.ok(messages.monitoringDetailsModal?.chart?.sampled_measure_count)
}

console.log("surveillance-rolling-graphs: OK")
