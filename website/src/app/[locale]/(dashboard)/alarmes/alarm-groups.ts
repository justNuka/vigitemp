export function normalizeAlarmGroupNames(
  groupNames: Array<string | null | undefined>,
): string[] {
  const uniqueNames = new Map<string, string>()

  for (const groupName of groupNames) {
    const trimmed = groupName?.trim()
    if (!trimmed) continue

    const key = trimmed.toLocaleLowerCase("fr")
    if (!uniqueNames.has(key)) {
      uniqueNames.set(key, trimmed)
    }
  }

  return Array.from(uniqueNames.values()).sort((left, right) =>
    left.localeCompare(right, "fr", { sensitivity: "base", numeric: true }),
  )
}

export function formatAlarmGroupNames(
  groupNames: Array<string | null | undefined>,
): string {
  return normalizeAlarmGroupNames(groupNames).join(", ")
}
