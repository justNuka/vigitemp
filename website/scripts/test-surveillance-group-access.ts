import assert from "node:assert/strict"
import fs from "node:fs"
import path from "node:path"

import { buildLieuAccessFilter, type UserLocationScope } from "../src/lib/location-access-scope"

const root = process.cwd()
const read = (relative: string) => fs.readFileSync(path.join(root, relative), "utf8")

const unrestricted: UserLocationScope = { siteIds: [], groupIds: [], hasRestrictions: false }
assert.equal(buildLieuAccessFilter(unrestricted), null)

assert.deepEqual(
  buildLieuAccessFilter({ siteIds: [1, 2], groupIds: [], hasRestrictions: true }),
  { Id_Site: { in: [1, 2] } },
)

assert.deepEqual(
  buildLieuAccessFilter({ siteIds: [], groupIds: [10, 20], hasRestrictions: true }),
  { t_lieu_groupe: { some: { Id_Groupe: { in: [10, 20] } } } },
)

assert.deepEqual(
  buildLieuAccessFilter({ siteIds: [1, 2], groupIds: [10, 20], hasRestrictions: true }),
  {
    AND: [
      { Id_Site: { in: [1, 2] } },
      { t_lieu_groupe: { some: { Id_Groupe: { in: [10, 20] } } } },
    ],
  },
)

const serverFilters = read("src/app/[locale]/(dashboard)/surveillance/server-filters.ts")
assert.ok(serverFilters.includes("disabled?: boolean"))
assert.ok(serverFilters.includes("disabled: hasGroupRestrictions && !allowedGroupIds.has(group.Id_Groupe)"))
assert.ok(serverFilters.includes("groupCandidateLocations"))

const monitoringFilters = read("src/app/[locale]/(dashboard)/surveillance/monitoring-filters.tsx")
assert.ok(monitoringFilters.includes("group.disabled ||"))
assert.ok(monitoringFilters.includes("!disabledGroupIds.has(id)"))
assert.ok(monitoringFilters.includes("sanitizedGroupIds"))

const paginatedRoute = read("src/app/api/capteurs/paginated/route.ts")
assert.ok(paginatedRoute.includes('buildLieuAccessFilter, getUserLocationScope'))
assert.ok(paginatedRoute.includes("visibleGroupMembershipWhere"))
assert.ok(paginatedRoute.includes("effectiveGroupIds"))
assert.ok(paginatedRoute.includes("effectiveSiteIds"))
assert.ok(!paginatedRoute.includes("const accessOr:"))
assert.ok(!paginatedRoute.includes("t_liaison_utilisateur_site.findMany"))
assert.ok(!paginatedRoute.includes("t_liaison_utilisateur_groupe.findMany"))

const visibleRelationMatches = paginatedRoute.match(
  /visibleGroupMembershipWhere \? \{ where: visibleGroupMembershipWhere \} : \{\}/g,
)
assert.equal(visibleRelationMatches?.length, 2)

console.log("surveillance-group-access: OK")
