import { NextRequest } from "next/server";

import { apiOk, apiError } from "@/lib/api-response";
import { getRequestContext } from "@/lib/api-logger";
import { log } from "@/lib/logger";
import {
  NON_RESPONSE_COOKIE,
  getGlobalNonResponseDefault,
  getUserNonResponsePreference,
  resolveNonResponsePreference,
  setUserNonResponsePreference,
} from "@/lib/non-response-preference";
import { withAuthLogging } from "@/lib/api-wrappers";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365 * 20;

export const GET = withAuthLogging(async (req: NextRequest, ctx: any) => {
  try {
    const userId = ctx.user.userId;
    const [enabled, globalDefault, userValue] = await Promise.all([
      resolveNonResponsePreference(req, userId),
      getGlobalNonResponseDefault(),
      getUserNonResponsePreference(userId),
    ]);

    const cookieRaw = req.cookies.get(NON_RESPONSE_COOKIE)?.value;

    return apiOk({
      enabled,
      globalDefault,
      userValue,
      cookieValue: cookieRaw ?? null,
    });
  } catch (error) {
    console.error("[GET /api/preferences/non-response]", error);
    return apiError(500, "preference_fetch_failed", "Impossible de charger la preference utilisateur.");
  }
});

async function updatePreference(req: NextRequest, ctx: any) {
  try {
    const { enabled } = (await req.json()) as { enabled?: unknown };
    if (typeof enabled !== "boolean") {
      return apiError(400, "invalid_input", "Le champ enabled (boolean) est requis.");
    }

    const { ip } = getRequestContext(req);
    const userId = ctx.user.userId;
    const previous = await resolveNonResponsePreference(req, userId);

    await setUserNonResponsePreference(userId, enabled);

    const response = apiOk({ enabled });
    response.cookies.set({
      name: NON_RESPONSE_COOKIE,
      value: enabled ? "1" : "0",
      maxAge: COOKIE_MAX_AGE_SECONDS,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    });

    log.config.change(
      "Preference utilisateur: afficher non-reponses null",
      ctx.user.username,
      userId,
      ip,
      previous ? "1" : "0",
      enabled ? "1" : "0",
    );

    return response;
  } catch (error) {
    console.error("[PUT/PATCH /api/preferences/non-response]", error);
    return apiError(500, "preference_update_failed", "Impossible de sauvegarder la preference utilisateur.");
  }
}

export const PUT = withAuthLogging(updatePreference);
export const PATCH = withAuthLogging(updatePreference);
