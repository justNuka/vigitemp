import { NextRequest } from "next/server"
import { getCacheStats, clearAllMeasurementCaches } from "@/lib/measurement-cache"
import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"

export const GET = withAdminLogging(async (_req: NextRequest) => {
  try {
    const stats = getCacheStats()
    return apiOk({
      status: "success",
      cache: stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    log.error("cache/measurements", "cache_stats_error", { error: error });
    return apiError(500, "cache_stats_failed", "Failed to get cache stats")
  }
})

export const DELETE = withAdminLogging(async (_req: NextRequest) => {
  try {
    clearAllMeasurementCaches()
    return apiOk({
      status: "success",
      message: "All measurement caches cleared",
    })
  } catch (error) {
    log.error("cache/measurements", "cache_clear_error", { error: error });
    return apiError(500, "cache_clear_failed", "Failed to clear caches")
  }
})
