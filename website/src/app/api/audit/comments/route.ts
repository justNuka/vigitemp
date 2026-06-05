import { NextRequest } from "next/server"
import { withAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { prismaMesure } from "@/lib/prisma"
import { apiError, apiOk } from "@/lib/api-response"
import { getRequestContext } from "@/lib/api-logger"
import { log } from "@/lib/logger"

/**
 * GET /api/audit/comments
 * Recupere la liste des commentaires libres par type d'audit.
 */
export const GET = withAuthorizationLogging("PARAMETRES_GERER", async (_req: NextRequest) => {
  try {
    const comments = await prismaMesure.tm_journal_commentaire_libre.findMany({
      orderBy: [{ Date_Creation: "desc" }, { Id_Commentaire_Journal: "desc" }],
    })

    return apiOk(
      comments.map((comment) => ({
        id: comment.Id_Commentaire_Journal,
        type: comment.Code_Journal,
        text: comment.Commentaire,
      })),
    )
  } catch (error) {
    log.error("audit/comments", "error_fetching_audit_comments", { error })
    return apiError(500, "audit_comments_fetch_failed", "Erreur lors de la recuperation des commentaires")
  }
})

/**
 * POST /api/audit/comments
 * Cree un nouveau commentaire libre pour un type d'audit.
 */
export const POST = withAuthorizationLogging("PARAMETRES_GERER", async (req: NextRequest, ctx: HandlerContext) => {
  const { ip } = getRequestContext(req)
  try {
    const { type, text } = await req.json()

    if (!type || text === undefined) {
      return apiError(400, "missing_fields", "Type et commentaire requis")
    }

    const comment = await prismaMesure.tm_journal_commentaire_libre.create({
      data: {
        Code_Journal: String(type).trim(),
        Commentaire: String(text).trim(),
      },
    })

    log.info("AUDIT_COMMENTS", "Audit free comment created", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      code: comment.Code_Journal,
      commentId: comment.Id_Commentaire_Journal,
    })
    log.audit("CC", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      resource: "Audit free comment",
      resourceId: comment.Id_Commentaire_Journal,
      changes: { type: comment.Code_Journal, text: comment.Commentaire },
      success: true,
    })

    return apiOk({
      id: comment.Id_Commentaire_Journal,
      type: comment.Code_Journal,
      text: comment.Commentaire,
    })
  } catch (error) {
    log.error("AUDIT_COMMENTS", "Audit free comment create failed", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      error: error instanceof Error ? error.message : String(error),
    })
    log.audit("CC", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      resource: "Audit free comment",
      success: false,
      reason: error instanceof Error ? error.message : String(error),
    })
    return apiError(500, "audit_comment_create_failed", "Erreur lors de la creation du commentaire")
  }
})

/**
 * PATCH /api/audit/comments
 * Met a jour un commentaire libre existant.
 */
export const PATCH = withAuthorizationLogging("PARAMETRES_GERER", async (req: NextRequest, ctx: HandlerContext) => {
  const { ip } = getRequestContext(req)
  try {
    const { id, text } = await req.json()

    if (!id || text === undefined) {
      return apiError(400, "missing_fields", "Identifiant et commentaire requis")
    }

    const comment = await prismaMesure.tm_journal_commentaire_libre.update({
      where: { Id_Commentaire_Journal: Number(id) },
      data: {
        Commentaire: String(text).trim(),
        Date_Modification: new Date(),
      },
    })

    log.info("AUDIT_COMMENTS", "Audit free comment updated", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      code: comment.Code_Journal,
      commentId: comment.Id_Commentaire_Journal,
    })
    log.audit("CC", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      resource: "Audit free comment",
      resourceId: comment.Id_Commentaire_Journal,
      changes: { type: comment.Code_Journal, text: comment.Commentaire },
      success: true,
    })

    return apiOk({
      id: comment.Id_Commentaire_Journal,
      type: comment.Code_Journal,
      text: comment.Commentaire,
    })
  } catch (error) {
    log.error("AUDIT_COMMENTS", "Audit free comment update failed", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      error: error instanceof Error ? error.message : String(error),
    })
    log.audit("CC", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      resource: "Audit free comment",
      success: false,
      reason: error instanceof Error ? error.message : String(error),
    })
    return apiError(500, "audit_comment_update_failed", "Erreur lors de la mise a jour du commentaire")
  }
})

/**
 * DELETE /api/audit/comments?id=123
 * Supprime un commentaire libre.
 */
export const DELETE = withAuthorizationLogging("PARAMETRES_GERER", async (req: NextRequest, ctx: HandlerContext) => {
  const { ip } = getRequestContext(req)
  try {
    const id = Number(req.nextUrl.searchParams.get("id"))
    if (!Number.isFinite(id) || id <= 0) {
      return apiError(400, "missing_id", "Identifiant requis")
    }

    await prismaMesure.tm_journal_commentaire_libre.delete({
      where: { Id_Commentaire_Journal: id },
    })

    log.info("AUDIT_COMMENTS", "Audit free comment deleted", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      commentId: id,
    })
    log.audit("CC", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      resource: "Audit free comment",
      resourceId: id,
      success: true,
    })

    return apiOk({ success: true })
  } catch (error) {
    log.error("AUDIT_COMMENTS", "Audit free comment delete failed", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      error: error instanceof Error ? error.message : String(error),
    })
    log.audit("CC", {
      user: ctx.user.username,
      userId: ctx.user.userId,
      ip,
      resource: "Audit free comment",
      success: false,
      reason: error instanceof Error ? error.message : String(error),
    })
    return apiError(500, "audit_comment_delete_failed", "Erreur lors de la suppression du commentaire")
  }
})
