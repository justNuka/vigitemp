import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { render } from "@react-email/components"

import CriticalThresholdAlarmNotificationEmail from "../emails/critical-threshold-alarm-notification"
import { resolveCriticalThresholdContext } from "../src/lib/alarm-email"

const high = resolveCriticalThresholdContext({
  eventType: "triggered",
  alarmTypeCode: "H",
  alarmValue: 12.5,
  highThreshold: 10,
  highEnabled: true,
})
assert.deepEqual(high, { direction: "high", threshold: 10 })

const low = resolveCriticalThresholdContext({
  eventType: "triggered",
  alarmTypeCode: "B",
  alarmValue: -25,
  lowThreshold: -20,
  lowEnabled: true,
})
assert.deepEqual(low, { direction: "low", threshold: -20 })

assert.equal(
  resolveCriticalThresholdContext({
    eventType: "triggered",
    alarmTypeCode: "H",
    alarmValue: 9,
    highThreshold: 10,
    highEnabled: true,
  }),
  null,
)

assert.equal(
  resolveCriticalThresholdContext({
    eventType: "ended",
    alarmTypeCode: "H",
    alarmValue: 12.5,
    highThreshold: 10,
    highEnabled: true,
  }),
  null,
)

const html = await render(
  CriticalThresholdAlarmNotificationEmail({
    locale: "fr",
    site: "AUBIERE",
    lieu: "Chambre froide",
    sonde: "SPNB-26000059",
    alarmType: "ALARME HAUTE",
    triggeredAt: "24/09/2026 13:08:15",
    measuredValue: "12,50°C",
    criticalThreshold: "10,00°C",
    direction: "high",
    alarmUrl: "http://localhost/fr/alarmes",
  }),
)

assert.match(html, /Seuil critique dépassé/i)
assert.match(html, /10,00°C/)
assert.match(html, /12,50°C/)

const dispatchSource = readFileSync(
  fileURLToPath(new URL("../src/app/api/alarmes/dispatch/route.ts", import.meta.url)),
  "utf8",
)

assert.match(dispatchSource, /alarm\.Type === "N" && isEndedAlarmDispatch/)
assert.match(dispatchSource, /getRecoveredMeasurementForEndedNoResponse/)
assert.match(dispatchSource, /const attempts = 5/)
assert.match(dispatchSource, /recoveredAt: alarm\.Date_Heure_Fin \?\? alarm\.Date_Heure_Debut/)
assert.match(dispatchSource, /Est_Valeur_Null: 0/)
assert.match(dispatchSource, /order: "desc"/)
assert.match(dispatchSource, /criticalThreshold: criticalThresholdContext/)

console.log("Alarm email notification tests passed")
