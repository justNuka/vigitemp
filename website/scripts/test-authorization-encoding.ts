import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

import { repairLegacyUtf8Mojibake } from "../src/lib/legacy-text-encoding"

const cases = [
  ["AccÃ¨s paramÃ©trage gÃ©nÃ©ral", "Accès paramétrage général"],
  ["RÃ©aliser ajustage Ã©talonnage", "Réaliser ajustage étalonnage"],
  ["Acc├¿s param├®trage g├®n├®ral", "Accès paramétrage général"],
  ["R├®aliser ajustage ├®talonnage", "Réaliser ajustage étalonnage"],
  ["Temp├®rature interne ┬░C", "Température interne °C"],
  ["Accès paramétrage général", "Accès paramétrage général"],
] as const

for (const [input, expected] of cases) {
  assert.equal(repairLegacyUtf8Mojibake(input), expected, input)
}

assert.equal(repairLegacyUtf8Mojibake(null), null)
assert.equal(repairLegacyUtf8Mojibake(undefined), undefined)

const installerPath = path.resolve(
  process.cwd(),
  "..",
  "Vigitemp Serveur",
  "VigitempServerInstaller",
  "InstallerHelpers.cs",
)
const installerSource = fs.readFileSync(installerPath, "utf8")
const utf8SqlCmdOccurrences = installerSource.match(/-f i:65001,o:65001/g)?.length ?? 0
assert.equal(utf8SqlCmdOccurrences, 2, "Le seed et les events SQL Server doivent forcer l'entrée/sortie UTF-8")

console.log("authorization-encoding: OK")
