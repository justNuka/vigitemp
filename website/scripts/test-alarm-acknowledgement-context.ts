import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8")

const api = read("src/app/api/alarmes/acknowledgement-candidates/route.ts")
assert.match(api, /locationId: z\.coerce\.number\(\)\.int\(\)\.positive\(\)\.optional\(\)/)
assert.match(api, /parsed\.data\.locationId \? \{ Id_Lieu: parsed\.data\.locationId \} : \{\}/)

const monitoring = read("src/components/monitoring-card.tsx")
assert.match(monitoring, /\/alarmes\/analyse\?locationId=/)
assert.match(monitoring, /onAcknowledge=\{handleAcknowledgeOpen\}/)
assert.doesNotMatch(monitoring, /AlarmAcknowledgeDialog/)

const dialog = read("src/components/alarm-acknowledge-dialog/alarm-acknowledge-dialog.tsx")
assert.match(dialog, /acknowledgement-candidates\$\{candidateQuery\}/)
assert.match(dialog, /relatedCandidates = visibleCandidates\.filter/)
assert.match(dialog, /focused_alarm_label/)

const analysis = read("src/app/[locale]/(dashboard)/alarmes/analyse/page-client.tsx")
assert.match(analysis, /xl:grid-cols-\[380px_minmax\(0,1fr\)\]/)
assert.match(analysis, /selectedAlarmIds/)
assert.match(analysis, /selectAllForAcknowledgement/)
assert.match(analysis, /status: "acknowledged" as const/)
assert.match(analysis, /selectedAlarmIds\.length > 1/)
assert.match(analysis, /exportStyledExcel/)
assert.match(analysis, /presentationImage:/)
assert.match(analysis, /showAuditControls=\{false\}/)
assert.match(analysis, /allowImageExport=\{false\}/)
assert.match(analysis, /showExportActions=\{false\}/)
assert.match(analysis, /selectedAlarmDetail\?\.triggeredAt \? parseDbDateTime/)
assert.match(analysis, /selectedAlarmDetail\?\.endedAt\s*\? parseDbDateTime/)
assert.doesNotMatch(analysis, /DateRangePicker/)
assert.doesNotMatch(analysis, /MonitoringAuditTab/)
assert.doesNotMatch(analysis, /useMonitoringAuditLogs/)
assert.doesNotMatch(analysis, /window\.print\(/)
assert.doesNotMatch(analysis, /exportAuditCsv/)
assert.doesNotMatch(analysis, /exportMeasurementsCsv/)
assert.doesNotMatch(analysis, /TabsTrigger value="audit"/)

const compactDialog = read("src/app/[locale]/(dashboard)/alarmes/analyse/alarm-acknowledgement-comment-dialog.tsx")
assert.match(compactDialog, /commentaires-acquittement/)
assert.match(compactDialog, /maxLength=\{200\}/)
assert.match(compactDialog, /acknowledgeMany/)
assert.doesNotMatch(compactDialog, /acknowledgement-candidates/)
assert.doesNotMatch(compactDialog, /\/stats/)
assert.doesNotMatch(compactDialog, /graph_show/)
assert.doesNotMatch(compactDialog, /confirm_stay/)

const graph = read("src/components/monitoring-details/monitoring-graph-tab.tsx")
assert.match(graph, /showAuditControls\?: boolean/)
assert.match(graph, /allowImageExport\?: boolean/)
assert.match(graph, /onChartImageReady\?: \(dataUrl: string\) => void/)
assert.match(graph, /showAuditControls \? \(/)
assert.match(graph, /allowImageExport \? \(/)

const excel = read("src/lib/excel-export.ts")
assert.match(excel, /presentationImage\?:/)
assert.match(excel, /options\.presentationImage\?\.dataUrl/)
assert.match(excel, /presentationSheet\.addImage/)

console.log("alarm-acknowledgement-context: OK")
