import type { JWTPayload } from "@/lib/jwt"
import { getPermissionAliases } from "@/lib/permissions"

const DASHBOARD_ADMIN_CODES = new Set(
  getPermissionAliases("DASHBOARD_ADMIN_ACCESS").map((code) =>
    code.trim().toUpperCase(),
  ),
)

export function hasDashboardAdminAccessClaim(
  authorizations: readonly string[] | undefined,
) {
  return (authorizations ?? []).some((code) =>
    DASHBOARD_ADMIN_CODES.has(code.trim().toUpperCase()),
  )
}

/**
 * Prefer the signed authorization claims so system health stays diagnosable when
 * the main DB becomes unavailable. Legacy sessions issued before 1.0.0 carried
 * an empty authorization array, so they get a one-time DB fallback. The loaded
 * codes are written back to the in-memory JWT payload; withAuthLogging then
 * renews the access token with those claims on the same response.
 */
export async function hasDashboardAdminAccess(
  user: Pick<JWTPayload, "userId" | "authorizations">,
) {
  if (hasDashboardAdminAccessClaim(user.authorizations)) {
    return true
  }

  try {
    const { getUserAuthorizationCodes } = await import("@/lib/authz")
    const authorizations = await getUserAuthorizationCodes(user.userId)
    user.authorizations = authorizations
    return hasDashboardAdminAccessClaim(authorizations)
  } catch {
    return false
  }
}
