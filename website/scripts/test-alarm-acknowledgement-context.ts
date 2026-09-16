import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8")

const api = read("src/app/api/alarmes/acknowledgement-candidates/route.ts")
assert.match(api, /locationId: z\.coerce\.number\(\)\.int\(\)\.positive\(\)\.optional\(\)/)
assert.match(api, /parsed\.data\.locationId \? \{ Id_Lieu: parsed\.data\.locationId \} : \{\}/)

const monitoring = read("src/components/monitoring-card.tsx")
assert.match(monitoring, /candidateLocationId=\{idLieu\}/)
assert.match(monitoring, /relatedAlarmsInitiallyOpen=\{false\}/)

const dialog = read("src/components/alarm-acknowledge-dialog/alarm-acknowledge-dialog.tsx")
assert.match(dialog, /acknowledgement-candidates\$\{candidateQuery\}/)
assert.match(dialog, /relatedCandidates = visibleCandidates\.filter/)
assert.match(dialog, /focused_alarm_label/)
assert.match(dialog, /source=acknowledgement/)

const analysis = read("src/app/[locale]/(dashboard)/alarmes/analyse/page-client.tsx")
assert.match(analysis, /isFromAcknowledgement = source === "acknowledgement"/)
assert.match(analysis, /otherAlarms = alarms\.filter/)
assert.match(analysis, /order-2 min-w-0/)
assert.match(analysis, /otherLocationAlarms/)

console.log("alarm-acknowledgement-context: OK")
