import { log } from "@/lib/logger"
import { applyGspMetrologyConfiguration } from "@/lib/metrology-gsp-configuration"
import type { GspCoefficientOverride } from "@/lib/metrology-gsp-configuration"

type RestoreState = {
  gspMetrologyRestoredKeys?: Set<string>
}

const globalState = globalThis as typeof globalThis & RestoreState
const restoredKeys = (globalState.gspMetrologyRestoredKeys ??= new Set<string>())

export async function restoreGspMetrologyConfigurationOnce(
  key: string,
  sensorIds: number[],
  operationContext: "AJUSTAGE" | "ETALONNAGE",
  coefficientOverrides?: Readonly<Record<number, GspCoefficientOverride>>,
) {
  if (!key || restoredKeys.has(key)) return

  try {
    await applyGspMetrologyConfiguration(sensorIds, "normal", operationContext, coefficientOverrides)
    restoredKeys.add(key)
  } catch (error) {
    log.error("METROLOGY_GSP", "econ_restore_failed", {
      key,
      operationContext,
      sensorIds,
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}
