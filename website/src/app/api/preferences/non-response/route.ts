import { NextRequest } from "next/server";

import { apiError, apiOk } from "@/lib/api-response";
import { withAuthLogging } from "@/lib/api-wrappers";
import { getGlobalNonResponseDefault } from "@/lib/non-response-preference";
import { log } from "@/lib/logger"

export const GET = withAuthLogging(async () => {
  try {
    const enabled = await getGlobalNonResponseDefault();
    return apiOk({
      enabled,
      globalDefault: enabled,
      scope: "global",
    });
  } catch (error) {
    log.error("preferences/non-response", "non_response_preference_fetch_error", { error: error });
    return apiError(500, "preference_fetch_failed", "Impossible de charger le param?tre global.");
  }
});

async function methodNotAllowed(_req: NextRequest) {
  return apiError(405, "method_not_allowed", "La pr?f?rence est d?sormais globale et en lecture seule ici.");
}

export const PUT = withAuthLogging(methodNotAllowed);
export const PATCH = withAuthLogging(methodNotAllowed);
