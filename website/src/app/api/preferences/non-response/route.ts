import { NextRequest } from "next/server";

import { apiOk, apiError } from "@/lib/api-response";
import { getGlobalNonResponseDefault } from "@/lib/non-response-preference";
import { withAuthLogging } from "@/lib/api-wrappers";

export const GET = withAuthLogging(async () => {
  try {
    const enabled = await getGlobalNonResponseDefault();
    return apiOk({
      enabled,
      globalDefault: enabled,
      scope: "global",
    });
  } catch (error) {
    console.error("[GET /api/preferences/non-response]", error);
    return apiError(500, "preference_fetch_failed", "Impossible de charger le parametre global.");
  }
});

async function methodNotAllowed(_req: NextRequest) {
  return apiError(405, "method_not_allowed", "La preference est desormais globale et en lecture seule ici.");
}

export const PUT = withAuthLogging(methodNotAllowed);
export const PATCH = withAuthLogging(methodNotAllowed);
