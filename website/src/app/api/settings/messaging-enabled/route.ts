import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiOk } from "@/lib/api-response"
import type { JWTPayload } from "@/lib/jwt"
import { log } from "@/lib/logger"

export const GET = withAuthLogging(
  async (_req: NextRequest, _ctx: { user: JWTPayload }) => {
    try {
      const setting = await prisma.t_parametre.findFirst({
        where: { Section: "messaging", Mot_Cle: "enabled" },
        select: { Valeur: true },
      })
      const enabled = setting ? setting.Valeur === "true" : true
      return apiOk({ enabled })
    } catch (error) {
      log.error("settings/messaging-enabled", "get_api_settings_messaging_enabled_failed_to_fetch_setting", { error: error });
      return apiOk({ enabled: true })
    }
  },
  { label: "GET /api/settings/messaging-enabled" },
)
