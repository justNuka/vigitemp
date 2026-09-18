import { getPermissionAliases } from "@/lib/permissions"

const DASHBOARD_ADMIN_CODES = new Set(
  getPermissionAliases("DASHBOARD_ADMIN_ACCESS").map((code) =>
    code.trim().toUpperCase(),
  ),
)

export function hasDashboardAdminAccess(
  authorizations: readonly string[] | undefined,
) {
  return (authorizations ?? []).some((code) =>
    DASHBOARD_ADMIN_CODES.has(code.trim().toUpperCase()),
  )
}
