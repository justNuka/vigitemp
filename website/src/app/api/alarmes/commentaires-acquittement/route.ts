import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"

export const GET = withAuthLogging(async (_req: NextRequest) => {
  try {
    const comments = await prisma.t_commentaire_acquittement_alarme.findMany({
      select: {
        Id_Commentaire: true,
        Type_Commentaire: true,
        Texte: true,
      },
      orderBy: {
        Texte: "asc",
      },
    })

    const payload = comments
      .map((comment) => ({
        id: comment.Id_Commentaire,
        type: comment.Type_Commentaire ?? null,
        text: comment.Texte?.trim() ?? "",
      }))
      .filter((comment) => comment.text.length > 0)

    return apiOk(payload)
  } catch (error) {
    log.error("alarmes/commentaires-acquittement", "get_alarm_acknowledgment_comments_error", { error: error });
    return apiError(500, "comments_fetch_failed", "Failed to fetch comments")
  }
})
