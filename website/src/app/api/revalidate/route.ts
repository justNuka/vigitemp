import { revalidateTag } from "next/cache"
import { NextRequest } from "next/server"
import { FEATURE_FLAGS } from "@/lib/feature-flags"
import { withAdminLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"

export const POST = withAdminLogging(async (request: NextRequest) => {
  if (!FEATURE_FLAGS.enableRevalidateAPI) {
    return apiError(403, "forbidden", "This API is only available in development")
  }

  try {
    const body = await request.json()
    const { tag } = body

    if (!tag) {
      return apiError(400, "missing_fields", "Tag parameter is required")
    }

    revalidateTag(tag, "default")

    return apiOk({
      success: true,
      message: `Cache invalidated for tag: ${tag}`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    log.error("revalidate", "error_revalidating_cache", { error: error });
    return apiError(500, "revalidate_failed", "Failed to revalidate cache")
  }
})

export const GET = withAdminLogging(async (_req: NextRequest) => {
  if (!FEATURE_FLAGS.enableRevalidateAPI) {
    return apiError(403, "forbidden", "This API is only available in development")
  }

  try {
    revalidateTag("dashboard-stats", "default")
    revalidateTag("locations-list", "default")

    return apiOk({
      success: true,
      message: "All dashboard caches invalidated",
      tags: ["dashboard-stats", "locations-list"],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    log.error("revalidate", "error_revalidating_caches", { error: error });
    return apiError(500, "revalidate_failed", "Failed to revalidate caches")
  }
})
