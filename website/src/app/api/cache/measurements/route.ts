import { NextRequest } from "next/server"
import { getCacheStats, clearAllMeasurementCaches } from "@/lib/measurement-cache"
import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"

export const GET = withAdminLogging(async (_req: NextRequest) => {
  try {
    const stats = getCacheStats()
    return apiOk({
      status: "success",
      cache: stats,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Cache stats error:", error)
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
    console.error("Cache clear error:", error)
    return apiError(500, "cache_clear_failed", "Failed to clear caches")
  }
})
