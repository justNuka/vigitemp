export type AdjustmentImportModuleAssignmentInput = {
  sensorSerial: string | null
  moduleId: number | null
}

export type AdjustmentImportModuleAssignments = {
  assignments: Map<string, number | null>
  conflicts: string[]
}

export function buildAdjustmentImportModuleAssignments(
  rows: AdjustmentImportModuleAssignmentInput[],
): AdjustmentImportModuleAssignments {
  const assignments = new Map<string, number | null>()
  const conflicts = new Set<string>()

  for (const row of rows) {
    const serial = row.sensorSerial?.trim()
    if (!serial) continue

    const moduleId = row.moduleId ?? null
    if (assignments.has(serial) && assignments.get(serial) !== moduleId) {
      conflicts.add(serial)
      continue
    }
    assignments.set(serial, moduleId)
  }

  return { assignments, conflicts: Array.from(conflicts).sort() }
}

export function resolveEffectiveImportModuleId(
  existingModuleId: number | null | undefined,
  requestedModuleId: number | null | undefined,
) {
  return existingModuleId ?? requestedModuleId ?? null
}
