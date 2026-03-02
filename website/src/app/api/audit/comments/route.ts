import { NextRequest } from "next/server"
import { withAuthorizationLogging } from "@/lib/api-wrappers"
import { prismaMesure } from "@/lib/prisma"
import { apiError, apiOk } from "@/lib/api-response"
import { getRequestContext } from "@/lib/api-logger"
import { log } from "@/lib/logger"

/**
 * GET /api/audit/comments
 * Recupere les commentaires des codes d'audit (tm_journal_code).
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
    return apiError(500, "audit_comments_fetch_failed", "Erreur lors de la recuperation des commentaires")
  }
})

/**
 * POST /api/audit/comments
 * Cree ou met a jour un commentaire (tm_journal_code).
 */
export const POST = withAuthorizationLogging("GERER_PROFIL", async (req: NextRequest, ctx: any) => {
  const { ip } = getRequestContext(req)
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

    log.info("AUDIT_COMMENTS", "Audit code comment upserted", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      code: comment.Code_Journal,
    })
    log.audit("CC", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      resource: "Audit code comment",
      resourceId: comment.Code_Journal,
      changes: { text: comment.Commentaire ?? "" },
      success: true,
    })

    return apiOk({
      type: comment.Code_Journal,
      text: comment.Commentaire,
    })
  } catch (error) {
    log.error("AUDIT_COMMENTS", "Audit code comment upsert failed", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      error: error instanceof Error ? error.message : String(error),
    })
    log.audit("CC", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      resource: "Audit code comment",
      success: false,
      reason: error instanceof Error ? error.message : String(error),
    })
    console.error("Error creating/updating audit comment:", error)
    return apiError(500, "audit_comment_upsert_failed", "Erreur lors de la creation/mise a jour du commentaire")
  }
})

/**
 * PATCH /api/audit/comments
 * Met a jour un commentaire (tm_journal_code).
 */
export const PATCH = withAuthorizationLogging("GERER_PROFIL", async (req: NextRequest, ctx: any) => {
  const { ip } = getRequestContext(req)
  try {
    const { type, text } = await req.json()

    if (!type || text === undefined) {
      return apiError(400, "missing_fields", "Type et commentaire requis")
    }

    const comment = await prismaMesure.tm_journal_code.update({
      where: { Code_Journal: type },
      data: { Commentaire: text },
    })

    log.info("AUDIT_COMMENTS", "Audit code comment updated", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      code: comment.Code_Journal,
    })
    log.audit("CC", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      resource: "Audit code comment",
      resourceId: comment.Code_Journal,
      changes: { text: comment.Commentaire ?? "" },
      success: true,
    })

    return apiOk({
      type: comment.Code_Journal,
      text: comment.Commentaire,
    })
  } catch (error) {
    log.error("AUDIT_COMMENTS", "Audit code comment update failed", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      error: error instanceof Error ? error.message : String(error),
    })
    log.audit("CC", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      resource: "Audit code comment",
      success: false,
      reason: error instanceof Error ? error.message : String(error),
    })
    console.error("Error updating audit comment:", error)
    return apiError(500, "audit_comment_update_failed", "Erreur lors de la mise a jour du commentaire")
  }
})