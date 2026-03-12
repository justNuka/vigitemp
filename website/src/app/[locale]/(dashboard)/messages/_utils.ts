/**
 * Derives 1-2 initials from a display name.
 * "Jean Martin" → "JM", "Alice" → "A", "" → "?"
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return (parts[0]?.[0] ?? "?").toUpperCase()
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase()
}

/**
 * Formats an ISO date string as a human-readable date.
 * Accepts null and returns "—" as fallback.
 */
export function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString([], { day: "numeric", month: "long", year: "numeric" })
}
