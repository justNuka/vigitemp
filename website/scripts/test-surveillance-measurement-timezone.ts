import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

process.env.TZ = "Europe/Paris"

import {
  formatStoredDbDateTime,
  parseStoredDbDateTime,
  serializePrismaStoredDbDateTimeForProvider,
  serializeStoredDbDateTime,
  toPrismaStoredDbDateTimeForProvider,
} from "../src/lib/date-display"
import {
  formatTimeAxisLabel,
  getMeasureSummary,
  getMeasureTimestamp,
  type MeasureData,
} from "../src/lib/measurements"

const root = process.cwd()
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8")

const storedIso = "2026-09-23T10:36:17.000Z"
const storedOffsetIso = "2026-09-23T10:36:17+02:00"

assert.equal(serializeStoredDbDateTime(storedIso), "2026-09-23T10:36:17")
assert.equal(serializeStoredDbDateTime(storedOffsetIso), "2026-09-23T10:36:17")
assert.equal(
  formatStoredDbDateTime(storedIso, { format: "dateTimeSeconds" }),
  "23/09/2026 10:36:17",
)
assert.equal(
  formatStoredDbDateTime(storedIso, {
    format: "dateTimeSeconds",
    locale: "fr-FR",
    timeZone: "Europe/Paris",
  }),
  "23/09/2026 10:36:17",
)

const parsedStored = parseStoredDbDateTime(storedIso)
assert.ok(parsedStored)
assert.equal(parsedStored.getHours(), 10)
assert.equal(parsedStored.getMinutes(), 36)
assert.equal(parsedStored.getSeconds(), 17)

const measure: MeasureData = {
  id: "1",
  Valeur: 5.25,
  Unite: "°C",
  Nb_Decimal: 2,
  DateHeureMesure: "23/09/2026 10:36:17",
  DateHeureMesureIso: storedIso,
  DateHeureMesureXaxis: "10:36",
  Consigne: 5,
  Consigne_Sup: 8,
  Consigne_Inf: 2,
  SondeNumeroSerie: "TEST",
  Frequence: 900,
  Etat_Alarme: 0,
}

assert.equal(
  getMeasureTimestamp(measure),
  new Date(2026, 8, 23, 10, 36, 17).getTime(),
)
assert.equal(getMeasureSummary([measure]).lastDateTime, "23/09/2026 10:36")
assert.equal(formatTimeAxisLabel(storedIso, "fr-FR", 0), "10:36")

// MariaDB adapter: DATETIME is exposed with local Date components.
const mysqlPrismaMeasurement = new Date(2026, 8, 23, 13, 36, 0)
assert.equal(mysqlPrismaMeasurement.getHours(), 13)
assert.equal(mysqlPrismaMeasurement.toISOString(), "2026-09-23T11:36:00.000Z")
assert.equal(
  serializePrismaStoredDbDateTimeForProvider(mysqlPrismaMeasurement, "mysql"),
  "2026-09-23T13:36:00",
)

// node-mssql default useUTC=true: DB wall-clock components are UTC components.
const mssqlPrismaMeasurement = new Date(Date.UTC(2026, 8, 23, 13, 36, 0))
assert.equal(
  serializePrismaStoredDbDateTimeForProvider(mssqlPrismaMeasurement, "mssql"),
  "2026-09-23T13:36:00",
)

// UI boundary 15:00 must remain DB wall-clock 15:00 for both providers.
const uiBoundary = new Date(2026, 8, 23, 15, 0, 0)
assert.equal(uiBoundary.toISOString(), "2026-09-23T13:00:00.000Z")

const mysqlBoundary = toPrismaStoredDbDateTimeForProvider(uiBoundary, "mysql")
assert.ok(mysqlBoundary)
assert.equal(mysqlBoundary.getHours(), 15)
assert.equal(mysqlBoundary.toISOString(), "2026-09-23T13:00:00.000Z")

const mssqlBoundary = toPrismaStoredDbDateTimeForProvider(uiBoundary, "mssql")
assert.ok(mssqlBoundary)
assert.equal(mssqlBoundary.toISOString(), "2026-09-23T15:00:00.000Z")

const tableSource = read("src/components/monitoring-details/monitoring-table-tab.tsx")
assert.ok(tableSource.includes("formatStoredDbDateTime"))
assert.ok(tableSource.includes("parseStoredDbDateTime"))

const graphSource = read("src/components/monitoring-details/monitoring-graph-tab.tsx")
assert.ok(graphSource.includes("formatStoredDbDateTime"))
assert.ok(graphSource.includes("parseStoredDbDateTime"))

const cardSource = read("src/components/monitoring-card.tsx")
assert.ok(cardSource.includes("serializeStoredDbDateTime(lastMeasurement)"))
assert.ok(cardSource.includes("formatStoredDbDateTime"))

const paginatedSource = read("src/app/api/capteurs/paginated/route.ts")
assert.ok(
  paginatedSource.includes(
    "alarmDisabledUntil: serializePrismaStoredDbDateTime(location.Date_Heure_Reactivation_Alarme)",
  ),
)
assert.ok(
  paginatedSource.includes(
    "surveillanceDisabledUntil: serializePrismaStoredDbDateTime(location.Date_Heure_Reactivation_Surveillance)",
  ),
)

const siteSectionSource = read(
  "src/app/[locale]/(dashboard)/surveillance/_components/monitoring-site-section.tsx",
)
assert.ok(siteSectionSource.includes("formatStoredDbDateTime"))
assert.ok(!siteSectionSource.includes("timeZone: timezone"))

const overlaySource = read(
  "src/app/[locale]/(dashboard)/surveillance/_components/curves-overlay-modal.tsx",
)
assert.ok(overlaySource.includes("formatStoredDbDateTime(label"))
assert.ok(overlaySource.includes("parseStoredDbDateTime"))

const measuresRouteSource = read("src/app/api/mesures/[idLieu]/route.ts")
assert.ok(measuresRouteSource.includes("toPrismaStoredDbDateTime(startDate)"))
assert.ok(measuresRouteSource.includes("toPrismaStoredDbDateTime(endDate)"))
assert.ok(measuresRouteSource.includes("serializePrismaStoredDbDateTime(m.Date_Heure_Mesure)"))

const alarmDetailSource = read("src/app/api/alarmes/[id]/route.ts")
assert.ok(alarmDetailSource.includes("serializePrismaStoredDbDateTime(alarm.Date_Heure_Debut)"))
assert.ok(alarmDetailSource.includes("serializePrismaStoredDbDateTime(alarm.Date_Heure_Fin)"))

const alarmRangeSource = read("src/app/api/alarmes/range/route.ts")
assert.ok(alarmRangeSource.includes("toPrismaStoredDbDateTime(startDate)"))
assert.ok(alarmRangeSource.includes("toPrismaStoredDbDateTime(endDate)"))

console.log("surveillance-measurement-timezone: OK")
