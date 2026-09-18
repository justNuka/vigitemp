import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import path from "node:path"

import { hasDashboardAdminAccessClaim } from "../src/lib/dashboard-admin-access"
import {
  generateRefreshToken,
  verifyRefreshToken,
} from "../src/lib/jwt"

assert.equal(hasDashboardAdminAccessClaim(["ACCES_DASHBOARD_ADMIN"]), true)
assert.equal(hasDashboardAdminAccessClaim(["acces_tableau_bord_admin"]), true)
assert.equal(hasDashboardAdminAccessClaim(["ACCES_ADMIN"]), true)
assert.equal(hasDashboardAdminAccessClaim(["PARAMETRES_GERER"]), false)
assert.equal(hasDashboardAdminAccessClaim([]), false)

const previousSecret = process.env.JWT_SECRET
process.env.JWT_SECRET =
  "test-admin-health-authorization-secret-32-characters-minimum"

try {
  const refreshToken = generateRefreshToken({
    userId: 1,
    username: "admin",
    profile: "Administrateurs",
    authorizations: ["ACCES_DASHBOARD_ADMIN", "PARAMETRES_GERER"],
  })

  const payload = verifyRefreshToken(refreshToken)
  assert.ok(payload)
  assert.deepEqual(payload.authorizations, [
    "ACCES_DASHBOARD_ADMIN",
    "PARAMETRES_GERER",
  ])
} finally {
  if (previousSecret === undefined) delete process.env.JWT_SECRET
  else process.env.JWT_SECRET = previousSecret
}

const websiteRoot = path.resolve(process.cwd())
const readWebsite = (relativePath: string) =>
  readFileSync(path.join(websiteRoot, relativePath), "utf8")

const loginRoute = readWebsite("src/app/api/auth/login/route.ts")
assert.ok(loginRoute.includes("getUserAuthorizationCodes"))
assert.ok(
  !loginRoute.includes("const authorizations: string[] = []"),
  "Login must not emit an empty authorization claim by default",
)
assert.ok(
  loginRoute.includes("authorizations,\n    })"),
  "Refresh token emitted at login must include authorization claims",
)

const forcePasswordRoute = readWebsite(
  "src/app/api/auth/force-password-change/route.ts",
)
assert.ok(forcePasswordRoute.includes("getUserAuthorizationCodes"))
assert.ok(
  !forcePasswordRoute.includes("const authorizations: string[] = []"),
  "Forced password change must not emit an empty authorization claim",
)

const refreshRoute = readWebsite("src/app/api/auth/refresh/route.ts")
assert.ok(refreshRoute.includes("await getUserAuthorizationCodes(payload.userId)"))
assert.ok(
  refreshRoute.includes("authorizations,\n    },\n    sessionExpiresAt"),
  "Rotated access and refresh tokens must keep resolved authorization claims",
)

const healthRoute = readWebsite("src/app/api/admin/system-health/route.ts")
const emailAuditRoute = readWebsite("src/app/api/admin/email-audit/route.ts")
assert.ok(healthRoute.includes("await hasDashboardAdminAccess(user)"))
assert.ok(emailAuditRoute.includes("await hasDashboardAdminAccess(user)"))

console.log("admin-health-authorization: OK")
