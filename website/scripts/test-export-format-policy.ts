import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const sourceRoot = path.join(root, "src")

function collectFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return collectFiles(fullPath)
    return /\.(ts|tsx)$/.test(entry.name) ? [fullPath] : []
  })
}

function read(relative: string) {
  return fs.readFileSync(path.join(root, relative), "utf8")
}

const sourceFiles = collectFiles(sourceRoot)
const printViolations: string[] = []
const csvExportViolations: string[] = []
const enablePrintViolations: string[] = []

for (const file of sourceFiles) {
  const source = fs.readFileSync(file, "utf8")
  const relative = path.relative(root, file).replaceAll("\\", "/")

  if (/\bwindow\.print\s*\(|\bpopup\.print\s*\(|\bPrinter\b/.test(source)) {
    printViolations.push(relative)
  }
  if (/text\/csv;charset/i.test(source)) {
    csvExportViolations.push(relative)
  }
  if (/\benablePrint\b/.test(source)) {
    enablePrintViolations.push(relative)
  }
}

assert.deepEqual(printViolations, [], `No print UI may remain: ${printViolations.join(", ")}`)
assert.deepEqual(
  csvExportViolations,
  [],
  `No user-facing CSV export may remain: ${csvExportViolations.join(", ")}`,
)
assert.deepEqual(
  enablePrintViolations,
  [],
  `The generic print option must be removed: ${enablePrintViolations.join(", ")}`,
)

const table = read("src/components/data-table/tanstack-table.tsx")
assert.match(table, /exportFormats\?: Array<"xlsx" \| "pdf">/)
assert.match(table, /exportFormats = \["xlsx", "pdf"\]/)
assert.doesNotMatch(table, /requestExport\("csv"\)/)
assert.doesNotMatch(table, /\.csv/)
assert.match(table, /requestExport\("xlsx"\)/)
assert.match(table, /requestExport\("pdf"\)/)

const audit = read("src/app/[locale]/(admin)/admin/audit/audit-client.tsx")
assert.doesNotMatch(audit, /enablePrint/)

const acknowledgements = read("src/app/[locale]/(dashboard)/alarmes/acquittements/page-client.tsx")
assert.match(acknowledgements, /exportFormats=\{\["xlsx", "pdf"\]\}/)
assert.doesNotMatch(acknowledgements, /csv/)

const monitoringTable = read("src/components/monitoring-details/monitoring-table-tab.tsx")
assert.match(monitoringTable, /exportFormats=\{\["pdf"\]\}/)
assert.match(monitoringTable, /exportStyledExcel/)
assert.match(monitoringTable, /table\.multi_tabs\.button/)

const alarmAnalysis = read("src/app/[locale]/(dashboard)/alarmes/analyse/page-client.tsx")
assert.match(alarmAnalysis, /handleExportXlsx/)
assert.match(alarmAnalysis, /exportStyledExcel/)
assert.match(alarmAnalysis, /presentationImage/)
assert.doesNotMatch(alarmAnalysis, /window\.print|text\/csv;charset|jsPDF/)

const impactAnalysis = read("src/app/[locale]/(admin)/admin/analyse-impact/impact-analysis-client.tsx")
assert.match(impactAnalysis, /handleExportExcel/)
assert.match(impactAnalysis, /exportStyledExcel/)
assert.match(impactAnalysis, /presentationImage/)
assert.doesNotMatch(impactAnalysis, /handleExportCSV|handleExportImage|handleExportPdf|window\.print|jsPDF/)

const impactTables = read("src/app/[locale]/(admin)/admin/analyse-impact/_components/impact-alarms-table.tsx")
assert.equal(
  impactTables.match(/enableExport=\{false\}/g)?.length,
  2,
  "Impact analysis sub-tables must not expose independent exports",
)

const overlay = read("src/app/[locale]/(dashboard)/surveillance/_components/curves-overlay-modal.tsx")
assert.match(overlay, /handleExportExcel/)
assert.match(overlay, /exportStyledExcel/)
assert.match(overlay, /presentationImage/)
assert.doesNotMatch(overlay, /handleExportCsv|handlePrintChart|text\/csv;charset|popup\.print/)

const vigilog = read("src/components/services/vigilog/vigilog-tournee-detail-dialog.tsx")
assert.match(vigilog, /exportMeasuresAsExcel/)
assert.match(vigilog, /exportStyledExcel/)
assert.match(vigilog, /presentationImage/)
assert.doesNotMatch(vigilog, /exportMeasuresAsCsv|text\/csv;charset|escapeCsv/)

for (const language of ["fr", "en"]) {
  const messages = JSON.parse(read(`src/messages/${language}.json`))
  assert.ok(messages.impactAnalysis?.export?.excel)
  assert.ok(messages.surveillance?.overlay?.export?.excel)
  assert.ok(messages.servicesVigilog?.detail?.export)
  assert.ok(messages.monitoringDetailsModal?.table?.multi_tabs?.button)
}

console.log("export-format-policy: OK")
