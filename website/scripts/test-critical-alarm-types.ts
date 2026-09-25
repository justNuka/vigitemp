import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import {
  isCriticalThresholdAlarmType,
  isHighThresholdAlarmType,
  isLowThresholdAlarmType,
  isThresholdAlarmType,
  mapAlarmTypeCategory,
} from "../src/lib/alarm-types"

const read = (relative: string) =>
  readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8")

assert.equal(isCriticalThresholdAlarmType("CH"), true)
assert.equal(isCriticalThresholdAlarmType("CB"), true)
assert.equal(isCriticalThresholdAlarmType("H"), false)
assert.equal(isCriticalThresholdAlarmType("B"), false)
assert.equal(isHighThresholdAlarmType("CH"), true)
assert.equal(isHighThresholdAlarmType("H"), true)
assert.equal(isLowThresholdAlarmType("CB"), true)
assert.equal(isLowThresholdAlarmType("B"), true)
assert.equal(isThresholdAlarmType("CH"), true)
assert.equal(isThresholdAlarmType("CB"), true)
assert.equal(mapAlarmTypeCategory("CH"), "high")
assert.equal(mapAlarmTypeCategory("CB"), "low")

const prismaSchema = read("../prisma/db-main/schema.prisma")
for (const model of ["t_alarme", "t_alarme_histo", "t_alarme_message"]) {
  const start = prismaSchema.indexOf(`model ${model} `)
  const end = prismaSchema.indexOf("\n}", start)
  assert.ok(start >= 0 && end > start, `Missing Prisma model ${model}`)
  const block = prismaSchema.slice(start, end)
  assert.match(block, /Type\s+String\?\s+@db\.VarChar\(2\)/)
}

const mysqlMigration = read("../../db/migrations/0.92.0/mysql.sql")
const mssqlMigration = read("../../db/migrations/0.92.0/mssql.sql")
const mysqlSeed = read("../../db/vigisensys_seed.sql")
const mssqlSeed = read("../../db/vigisensys_seed_mssql.sql")

for (const source of [mysqlMigration, mssqlMigration, mysqlSeed, mssqlSeed]) {
  assert.match(source, /CRITIQUE_BAS/)
  assert.match(source, /CRITIQUE_HAUT/)
  assert.match(source, /['"]?CB['"]?/)
  assert.match(source, /['"]?CH['"]?/)
  assert.match(source, /0\.92\.0/)
}

assert.match(mysqlMigration, /ALTER TABLE\s+`t_alarme`\s+MODIFY COLUMN\s+`Type`\s+varchar\(2\)/i)
assert.match(mysqlMigration, /ALTER TABLE\s+`t_alarme_histo`\s+MODIFY COLUMN\s+`Type`\s+varchar\(2\)/i)
assert.match(mysqlMigration, /ALTER TABLE\s+`t_alarme_message`\s+MODIFY COLUMN\s+`Type`\s+varchar\(2\)/i)
assert.match(mysqlMigration, /TRG_GSO_BEF_UPD_LIEU_ALARME/)
assert.match(mysqlMigration, /Seuil_Critique_Bas/)
assert.match(mysqlMigration, /Seuil_Critique_Haut/)
assert.match(mysqlMigration, /Type\s+IN\s*\(\s*'B'\s*,\s*'CB'\s*,\s*'H'\s*,\s*'CH'\s*,\s*'N'\s*\)/i)
assert.match(mysqlMigration, /\(20, 'CRITIQUE_BAS', 'CB'/)
assert.match(mysqlMigration, /\(21, 'CRITIQUE_HAUT', 'CH'/)

assert.match(mssqlMigration, /ALTER TABLE dbo\.\[t_alarme\] ALTER COLUMN \[Type\] VARCHAR\(2\)/)
assert.match(mssqlMigration, /ALTER TABLE dbo\.\[t_alarme_histo\] ALTER COLUMN \[Type\] VARCHAR\(2\)/)
assert.match(mssqlMigration, /ALTER TABLE dbo\.\[t_alarme_message\] ALTER COLUMN \[Type\] VARCHAR\(2\)/)
assert.match(mssqlMigration, /TRG_GSO_BEF_UPD_LIEU_ALARME/)
assert.match(mssqlMigration, /Seuil_Critique_Bas/)
assert.match(mssqlMigration, /Seuil_Critique_Haut/)
assert.match(mssqlMigration, /\[Type\]\s+IN\s*\(\s*'B'\s*,\s*'CB'\s*,\s*'H'\s*,\s*'CH'\s*,\s*'N'\s*\)/i)

assert.equal((mysqlSeed.match(/\`Type\` varchar\(2\)/g) ?? []).length, 3)
assert.equal((mssqlSeed.match(/\[Type\] VARCHAR\(2\)/g) ?? []).length, 3)
assert.match(mysqlSeed, /\(20, 'CRITIQUE_BAS', 'CB'/)
assert.match(mysqlSeed, /\(21, 'CRITIQUE_HAUT', 'CH'/)
assert.match(mssqlSeed, /VALUES\(20,N'CRITIQUE_BAS','CB'/)
assert.match(mssqlSeed, /VALUES\(21,N'CRITIQUE_HAUT','CH'/)

const mysqlTriggerStart = mysqlSeed.indexOf(
  "/*!50003 CREATE*/ /*!50003 TRIGGER `TRG_GSO_BEF_UPD_LIEU_ALARME`",
)
assert.ok(mysqlTriggerStart >= 0, "MySQL GSO trigger CREATE block must exist")
const mysqlTriggerEnd = mysqlSeed.indexOf("DELIMITER ;", mysqlTriggerStart)
assert.ok(mysqlTriggerEnd > mysqlTriggerStart, "MySQL GSO trigger end marker must exist")
const mysqlTrigger = mysqlSeed.slice(mysqlTriggerStart, mysqlTriggerEnd)
assert.match(mysqlTrigger, /Seuil_Critique_Bas/)
assert.match(mysqlTrigger, /Seuil_Critique_Haut/)
assert.match(mysqlTrigger, /Type\s+IN\s*\(\s*'B'\s*,\s*'CB'\s*,\s*'H'\s*,\s*'CH'\s*,\s*'N'\s*\)/i)
assert.match(mysqlTrigger, /v_TypeAlarme\s+IN\s*\(\s*'B'\s*,\s*'CB'\s*\)/i)
assert.match(mysqlTrigger, /v_TypeAlarme\s+IN\s*\(\s*'H'\s*,\s*'CH'\s*\)/i)
assert.match(mysqlTrigger, /NEW\.Derniere_Valeur\s*,\s*'CB'/s)
assert.match(mysqlTrigger, /NEW\.Derniere_Valeur\s*,\s*'CH'/s)

const mssqlTriggerStart = mssqlSeed.indexOf(
  "CREATE OR ALTER TRIGGER dbo.[TRG_GSO_BEF_UPD_LIEU_ALARME]",
)
assert.ok(mssqlTriggerStart >= 0, "SQL Server GSO trigger block must exist")
const mssqlTriggerEnd = mssqlSeed.indexOf("USE [vigi_mesures];", mssqlTriggerStart)
assert.ok(mssqlTriggerEnd > mssqlTriggerStart, "SQL Server GSO trigger end marker must exist")
const mssqlTrigger = mssqlSeed.slice(mssqlTriggerStart, mssqlTriggerEnd)
assert.match(mssqlTrigger, /Seuil_Critique_Bas/)
assert.match(mssqlTrigger, /Seuil_Critique_Haut/)
assert.match(mssqlTrigger, /\[Type\]\s+IN\s*\(\s*'B'\s*,\s*'CB'\s*,\s*'H'\s*,\s*'CH'\s*,\s*'N'\s*\)/i)
assert.match(mssqlTrigger, /@v_TypeAlarme\s+IN\s*\(\s*'B'\s*,\s*'CB'\s*\)/i)
assert.match(mssqlTrigger, /@v_TypeAlarme\s+IN\s*\(\s*'H'\s*,\s*'CH'\s*\)/i)
assert.match(mssqlTrigger, /@Derniere_Valeur\s*,\s*'CB'/s)
assert.match(mssqlTrigger, /@Derniere_Valeur\s*,\s*'CH'/s)

const sensorSource = read("../../Vigitemp Serveur/Vigitemp Serveur/Sensor.cs")
assert.match(sensorSource, /criticalLowNow \? "CB" : "B"/)
assert.match(sensorSource, /criticalHighNow \? "CH" : "H"/)

for (const provider of [
  "../../Vigitemp Serveur/Vigitemp Serveur/MySqlDatabaseProvider.cs",
  "../../Vigitemp Serveur/Vigitemp Serveur/SqlServerDatabaseProvider.cs",
]) {
  const source = read(provider)
  assert.match(source, /case "B": return "CB";/)
  assert.match(source, /case "CB": return "B";/)
  assert.match(source, /case "H": return "CH";/)
  assert.match(source, /case "CH": return "H";/)
  assert.match(source, /Type IN \(@type, @siblingType\)/)
  assert.doesNotMatch(source, /cmdCloseSibling/)
}

const headerSource = read("../src/components/monitoring-card/monitoring-card-header.tsx")
assert.match(headerSource, /isCriticalThresholdAlarmType/)
assert.match(headerSource, /effectiveAlarmType === 'CH'/)
assert.match(headerSource, /effectiveAlarmType === 'CB'/)
assert.match(headerSource, /status !== 'critical' \|\| hasCriticalThresholdAlarm/)

const statsSource = read("../src/lib/statistics/location-stats.ts")
assert.match(statsSource, /src\.Type IN \('H','CH'\)/)
assert.match(statsSource, /src\.Type IN \('B','CB'\)/)

const emailSource = read("../src/lib/alarm-email.ts")
assert.match(emailSource, /case "CH":/)
assert.match(emailSource, /case "CB":/)
assert.match(emailSource, /type === "CH"/)
assert.match(emailSource, /type === "CB"/)

const dispatchSource = read("../src/app/api/alarmes/dispatch/route.ts")
assert.match(dispatchSource, /alarm\.Type === "CH"/)
assert.match(dispatchSource, /alarm\.Type === "CB"/)

console.log("Critical alarm type contract tests passed")
