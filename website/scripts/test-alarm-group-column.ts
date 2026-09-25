import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

import {
  formatAlarmGroupNames,
  normalizeAlarmGroupNames,
} from "../src/app/[locale]/(dashboard)/alarmes/alarm-groups"

const root = process.cwd()
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8")

assert.deepEqual(
  normalizeAlarmGroupNames([
    "Groupe 10",
    " Alpha ",
    null,
    "",
    "groupe 2",
    "Groupe 2",
    "alpha",
    undefined,
    "Zeta",
  ]),
  ["Alpha", "groupe 2", "Groupe 10", "Zeta"],
)
assert.equal(
  formatAlarmGroupNames(["Groupe B", "Groupe A", "Groupe A"]),
  "Groupe A, Groupe B",
)
assert.equal(formatAlarmGroupNames([null, "", undefined]), "")

const serverAlarms = read("src/app/[locale]/(dashboard)/alarmes/server-alarms.tsx")
assert.match(serverAlarms, /t_lieu_groupe:\s*\{/)
assert.match(serverAlarms, /Nom_Groupe:\s*true/)
assert.match(serverAlarms, /normalizeAlarmGroupNames/)
assert.match(serverAlarms, /groupNames,/)
assert.ok(serverAlarms.includes("siteGroup: null"))

const client = read("src/app/[locale]/(dashboard)/alarmes/alarms-client.tsx")
assert.match(client, /accessorKey:\s*"groups"/)
assert.match(client, /table\.columns\.group/)
assert.match(client, /exportValue:\s*\(row: AlarmRow\) => row\.groups \|\| "-"/)
assert.match(client, /searchField="searchText"/)
assert.match(client, /formatAlarmGroupNames/)
assert.ok(client.includes("formatAlarmGroupNames(alarm.location.groupNames ?? [])"))
assert.match(client, /groups,/)

const thresholdsColumnIndex = client.indexOf('id: "consignes"')
const groupsColumnIndex = client.indexOf('accessorKey: "groups"')
const triggeredColumnIndex = client.indexOf('accessorKey: "triggeredAt"')
assert.ok(thresholdsColumnIndex >= 0)
assert.ok(groupsColumnIndex > thresholdsColumnIndex)
assert.ok(triggeredColumnIndex > groupsColumnIndex)

for (const language of ["fr", "en"]) {
  const messages = JSON.parse(read(`src/messages/${language}.json`))
  assert.ok(messages.alarmsPage?.table?.columns?.group)
}

console.log("alarm-group-column: OK")
