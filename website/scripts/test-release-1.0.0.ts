import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import path from "node:path"

const repoRoot = path.resolve(process.cwd(), "..")
const readRepo = (relativePath: string) =>
  readFileSync(path.join(repoRoot, relativePath), "utf8")

const packageJson = JSON.parse(readRepo("website/package.json")) as {
  version?: string
}

assert.equal(packageJson.version, "1.0.0", "Web package version must be 1.0.0")

const serverAssembly = readRepo(
  "Vigitemp Serveur/Vigitemp Serveur/Properties/AssemblyInfo.cs",
)
assert.match(
  serverAssembly,
  /AssemblyInformationalVersion\("1\.0\.0"\)/,
  "Server product version must be 1.0.0",
)

const serverInstaller = readRepo(
  "Vigitemp Serveur/VigitempServerInstaller/VigitempServerInstaller.csproj",
)
assert.match(
  serverInstaller,
  /<Version>1\.0\.0<\/Version>/,
  "Server installer version must follow the Server 1.0.0 release",
)

const agentAssembly = readRepo(
  "Vigitemp agent/Vigitemp agent/Properties/AssemblyInfo.cs",
)
assert.match(
  agentAssembly,
  /AssemblyInformationalVersion\("1\.0\.1"\)/,
  "Agent must remain independently versioned at 1.0.1",
)

for (const seedPath of ["db/vigisensys_seed.sql", "db/vigisensys_seed_mssql.sql"]) {
  assert.ok(
    readRepo(seedPath).includes("0.90.2"),
    `${seedPath} must keep the DB schema/bootstrap revision 0.90.2`,
  )
}

const releaseModal = readRepo(
  "website/src/components/version-changelog-modal.tsx",
)
assert.ok(
  releaseModal.includes("const RELEASE_VERSION = WEB_APP_VERSION"),
  "Release modal must derive its version from package.json",
)
assert.ok(
  !releaseModal.includes('RELEASE_VERSION = "0.3.7"'),
  "Legacy hardcoded release version must be removed",
)
for (const publicPath of [
  "/legal-notice",
  "/mentions-legales",
  "/data-protection",
  "/protection-des-donnees",
]) {
  assert.ok(
    releaseModal.includes(`normalizedPathname === "${publicPath}"`),
    `Release modal must stay disabled on public route ${publicPath}`,
  )
}

const routing = readRepo("website/src/i18n/routing.ts")
assert.ok(routing.includes("fr: '/mentions-legales'"))
assert.ok(routing.includes("fr: '/protection-des-donnees'"))

assert.ok(
  readRepo("website/src/app/[locale]/mentions-legales/page.tsx").includes(
    '../legal-notice/page',
  ),
  "French legal notice fallback route must reuse the canonical page",
)
assert.ok(
  readRepo(
    "website/src/app/[locale]/protection-des-donnees/page.tsx",
  ).includes('../data-protection/page'),
  "French data protection fallback route must reuse the canonical page",
)

const adminGroupLayout = readRepo(
  "website/src/app/[locale]/(admin)/admin-layout-client.tsx",
)
assert.ok(
  adminGroupLayout.includes('const showAdminDock = !(isOneOrPack(license) && normalizedPathname === "/admin")'),
  "Admin footer clearance must follow the same visibility rule as the admin dock",
)
assert.ok(
  adminGroupLayout.includes('<AppFooter className={showAdminDock ? "mb-24" : undefined} />'),
  "Admin footer must reserve clearance below itself while the fixed dock is visible",
)

const dashboardShell = readRepo(
  "website/src/app/[locale]/(dashboard)/dashboard-shell.tsx",
)
assert.ok(
  dashboardShell.includes('className="flex h-dvh w-full flex-col overflow-hidden"'),
  "Dashboard shell must be bounded to the viewport",
)
assert.ok(
  dashboardShell.includes('className="flex min-h-0 flex-1 overflow-hidden"'),
  "Dashboard shell flex child must be allowed to shrink",
)
assert.ok(
  dashboardShell.includes(
    'className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-background"',
  ),
  "Dashboard main must be the single vertical scroll owner",
)
assert.ok(
  !dashboardShell.includes("min-h-screen"),
  "Dashboard shell must not grow the document in addition to its inner scroller",
)

const changelogExpectations: Array<[string, string]> = [
  ["CHANGELOG.md", "Livraison VigiSensys 1.0.0 — 2026-09-18"],
  ["website/CHANGELOG.md", "## [1.0.0] — 2026-09-18"],
  ["Vigitemp Serveur/CHANGELOG.md", "## [1.0.0] — 2026-09-18"],
  ["db/CHANGELOG.md", "## [0.90.2] — 2026-09-18"],
  ["Vigitemp agent/CHANGELOG.md", "État pour VigiSensys 1.0.0 — 2026-09-18"],
  [
    "Vigitemp Serveur/Vigitemp License Generator/CHANGELOG.md",
    "État pour VigiSensys 1.0.0 — 2026-09-18",
  ],
]

for (const [file, expected] of changelogExpectations) {
  assert.ok(
    readRepo(file).includes(expected),
    `${file} must document the 1.0.0 delivery state`,
  )
}

console.log("release-1.0.0: OK")
