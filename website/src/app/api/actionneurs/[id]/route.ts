import { NextRequest } from "next/server"

import { getRequestContext } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { auditRouteDelete, auditRouteUpdate } from "@/lib/audit-route"
import { withOneOrHigherAnyAuthorizationLogging } from "@/lib/license-guards"
import { log } from "@/lib/logger"
import { getPermissionAliases } from "@/lib/permissions"
import { prisma } from "@/lib/prisma"

const ACTIONNEUR_ACCESS_CODES = getPermissionAliases("HARDWARE_CONFIG_ACCESS")

export const PATCH = withOneOrHigherAnyAuthorizationLogging(
  ACTIONNEUR_ACCESS_CODES,
  async (req: NextRequest, ctx, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: idParam } = await params
      const id = parseInt(idParam, 10)

      if (!id) {
        return apiError(400, "invalid_id", "ID actionneur invalide")
      }

      const body = await req.json()
      const { type, serie, commentaire, lieuId } = body
      const { ip } = getRequestContext(req)

      const actionneur = await prisma.t_actionneur.findUnique({
        where: { Id_Actionneur: id },
      })

      if (!actionneur) {
        return apiError(404, "not_found", "Actionneur non trouve")
      }

      const updated = await prisma.t_actionneur.update({
        where: { Id_Actionneur: id },
        data: {
          Type: type ? parseInt(type, 10) : actionneur.Type,
          Num_Serie: serie || actionneur.Num_Serie,
          Commentaire: commentaire || actionneur.Commentaire,
        },
      })

      if (lieuId) {
        const newLieuId = parseInt(lieuId, 10)

        const oldLieu = await prisma.t_lieu.findFirst({
          where: { Id_Actionneur: id },
          select: { Id_Lieu: true },
        })

        if (oldLieu && oldLieu.Id_Lieu !== newLieuId) {
          await prisma.t_lieu.update({
            where: { Id_Lieu: oldLieu.Id_Lieu },
            data: { Id_Actionneur: null },
          })

          await prisma.t_lieu.update({
            where: { Id_Lieu: newLieuId },
            data: { Id_Actionneur: id },
          })
        } else if (!oldLieu) {
          await prisma.t_lieu.update({
            where: { Id_Lieu: newLieuId },
            data: { Id_Actionneur: id },
          })
        }
      } else {
        await prisma.t_lieu.updateMany({
          where: { Id_Actionneur: id },
          data: { Id_Actionneur: null },
        })
      }

      const lieu = await prisma.t_lieu.findFirst({
        where: { Id_Actionneur: id },
        select: { Id_Lieu: true },
      })

      auditRouteUpdate(req, ctx.user, {
        resource: "Actionneur",
        resourceId: id,
        before: {
          Type: actionneur.Type,
          Num_Serie: actionneur.Num_Serie,
          Commentaire: actionneur.Commentaire,
        },
        after: {
          Type: updated.Type,
          Num_Serie: updated.Num_Serie,
          Commentaire: updated.Commentaire,
          Id_Lieu: lieu?.Id_Lieu || null,
        },
        reason: `Modification actionneur ${actionneur.Num_Serie || id}`,
      })

      return apiOk({
        ...updated,
        Id_Lieu: lieu?.Id_Lieu || null,
      })
    } catch (error) {
      log.error("actionneurs", "actionneur_update_error", { error })
      return apiError(500, "actionneur_update_failed", "Erreur lors de la mise a jour de l'actionneur")
    }
  },
)

export const DELETE = withOneOrHigherAnyAuthorizationLogging(
  ACTIONNEUR_ACCESS_CODES,
  async (req: NextRequest, ctx, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id: idParam } = await params
      const id = parseInt(idParam, 10)

      if (!id) {
        return apiError(400, "invalid_id", "ID actionneur invalide")
      }

      const actionneur = await prisma.t_actionneur.findUnique({
        where: { Id_Actionneur: id },
      })

      if (!actionneur) {
        return apiError(404, "not_found", "Actionneur non trouve")
      }

      await prisma.t_lieu.updateMany({
        where: { Id_Actionneur: id },
        data: { Id_Actionneur: null },
      })

      const updated = await prisma.t_actionneur.update({
        where: { Id_Actionneur: id },
        data: { Est_Archive: true },
      })

      auditRouteDelete(req, ctx.user, {
        resource: "Actionneur",
        resourceId: id,
        reason: `Archivage actionneur ${actionneur.Num_Serie || id}`,
        data: { Num_Serie: actionneur.Num_Serie },
      })

      return apiOk({ Id_Actionneur: updated.Id_Actionneur, Est_Archive: updated.Est_Archive })
    } catch (error) {
      log.error("actionneurs", "actionneur_archive_error", { error })
      return apiError(500, "actionneur_archive_failed", "Erreur lors de l'archivage de l'actionneur")
    }
  },
)
