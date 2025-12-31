import { NextRequest } from "next/server"
import { withAuthorizationLogging } from "@/lib/api-wrappers"
import { prismaMesure } from "@/lib/prisma"
import { apiError, apiOk } from "@/lib/api-response"

/**
 * GET /api/audit/comments
 * Récupère les commentaires des codes d'audit (tm_journal_code).
 */
export const GET = withAuthorizationLogging("GERER_PROFIL", async (_req: NextRequest) => {
  try {
    const codes = await prismaMesure.tm_journal_code.findMany({
      orderBy: { Code_Journal: "asc" },
    })

    const formattedComments = codes.map((code, index) => ({
      id: index + 1,
      type: code.Code_Journal || "",
      text: code.Commentaire || "",
    }))

    return apiOk(formattedComments)
  } catch (error) {
    console.error("Error fetching audit comments:", error)
    return apiError(500, "audit_comments_fetch_failed", "Erreur lors de la récupération des commentaires")
  }
})

/**
 * POST /api/audit/comments
 * Crée ou met à jour un commentaire (tm_journal_code).
 */
export const POST = withAuthorizationLogging("GERER_PROFIL", async (req: NextRequest) => {
  try {
    const { type, text } = await req.json()

    if (!type || text === undefined) {
      return apiError(400, "missing_fields", "Type et commentaire requis")
    }

    const comment = await prismaMesure.tm_journal_code.upsert({
      where: { Code_Journal: type },
      update: { Commentaire: text },
      create: {
        Code_Journal: type,
        Commentaire: text,
      },
    })

    return apiOk({
      type: comment.Code_Journal,
      text: comment.Commentaire,
    })
  } catch (error) {
    console.error("Error creating/updating audit comment:", error)
    return apiError(500, "audit_comment_upsert_failed", "Erreur lors de la création/mise à jour du commentaire")
  }
})

/**
 * PATCH /api/audit/comments
 * Met à jour un commentaire (tm_journal_code).
 */
export const PATCH = withAuthorizationLogging("GERER_PROFIL", async (req: NextRequest) => {
  try {
    const { type, text } = await req.json()

    if (!type || text === undefined) {
      return apiError(400, "missing_fields", "Type et commentaire requis")
    }

    const comment = await prismaMesure.tm_journal_code.update({
      where: { Code_Journal: type },
      data: { Commentaire: text },
    })

    return apiOk({
      type: comment.Code_Journal,
      text: comment.Commentaire,
    })
  } catch (error) {
    console.error("Error updating audit comment:", error)
    return apiError(500, "audit_comment_update_failed", "Erreur lors de la mise à jour du commentaire")
  }
})
