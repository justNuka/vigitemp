import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"

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

    return apiOk(
      comments.map((comment) => ({
        id: comment.Id_Commentaire,
        type: comment.Type_Commentaire ?? null,
        text: comment.Texte ?? "",
      }))
    )
  } catch (error) {
    console.error("Get alarm acknowledgment comments error:", error)
    return apiError(500, "comments_fetch_failed", "Failed to fetch comments")
  }
})
