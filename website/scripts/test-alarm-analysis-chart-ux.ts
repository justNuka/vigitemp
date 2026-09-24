import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const graphSource = readFileSync(
  fileURLToPath(new URL("../src/components/monitoring-details/monitoring-graph-tab.tsx", import.meta.url)),
  "utf8",
)

const analysisSource = readFileSync(
  fileURLToPath(new URL("../src/app/[locale]/(dashboard)/alarmes/analyse/page-client.tsx", import.meta.url)),
  "utf8",
)

assert.match(graphSource, /interactionProfile\?: "default" \| "alarm-analysis"/)
assert.match(graphSource, /interactionProfile = "default"/)
assert.match(graphSource, /interactionProfile === "alarm-analysis"/)

assert.match(graphSource, /duration: 180/)
assert.match(graphSource, /easing: "easeOutQuart"/)

assert.match(graphSource, /min: rangeStartMs/)
assert.match(graphSource, /max: rangeEndMs/)
assert.match(graphSource, /minRange: alarmAnalysisMinRangeMs/)
assert.match(graphSource, /: \{ minRange: 60_000 \}/)

assert.match(graphSource, /speed: isAlarmAnalysisInteraction \? 0\.25 : 0\.1/)
assert.match(graphSource, /threshold: isAlarmAnalysisInteraction \? 4 : 10/)

assert.match(analysisSource, /interactionProfile="alarm-analysis"/)
assert.match(analysisSource, /setZoomBounds\(\{[\s\S]*xMin:[\s\S]*xMax:/)
assert.doesNotMatch(
  analysisSource.slice(
    analysisSource.indexOf("const captureZoomBounds"),
    analysisSource.indexOf("const resetChartZoom"),
  ),
  /yMin:|yMax:/,
)

console.log("Alarm analysis chart UX tests passed")
