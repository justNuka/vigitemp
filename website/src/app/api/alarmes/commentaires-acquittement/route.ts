import { NextRequest } from "next/server"
import { prismaMesure } from "@/lib/prisma"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"

export const GET = withAuthLogging(async (_req: NextRequest) => {
  try {
    const comments = await prismaMesure.tm_journal_commentaire_libre.findMany({
      where: {
        Code_Journal: "ACQ",
      },
      select: {
        Id_Commentaire_Journal: true,
        Code_Journal: true,
        Commentaire: true,
      },
      orderBy: [{ Commentaire: "asc" }, { Id_Commentaire_Journal: "desc" }],
    })

    const payload = comments
      .map((comment) => ({
        id: comment.Id_Commentaire_Journal,
        type: comment.Code_Journal?.trim() ?? null,
        text: comment.Commentaire?.trim() ?? "",
      }))
      .filter((comment) => comment.text.length > 0)

    return apiOk(payload)
  } catch (error) {
    log.error("alarmes/commentaires-acquittement", "get_alarm_acknowledgment_comments_error", { error: error });
    return apiError(500, "comments_fetch_failed", "Failed to fetch comments")
  }
})
