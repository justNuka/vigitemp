import { NextRequest } from "next/server"
import { z } from "zod"

import { getRequestContext } from "@/lib/api-logger"
import { withAuthLogging } from "@/lib/api-wrappers"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"

const updateSensorSchema = z.object({
  name: z.string().optional(),
  minThreshold: z.number().optional(),
  maxThreshold: z.number().optional(),
  unit: z.string().optional(),
})

export const GET = withAuthLogging(
  async (req: NextRequest, _ctx: any, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params
      const sensorId = parseInt(id, 10)

      const lieu = await prisma.t_lieu.findUnique({
        where: { Id_Lieu: sensorId },
        include: {
          t_site: {
            select: {
              Id_Site: true,
              Code_Site: true,
              Libelle_Site: true,
            },
          },
        },
      })

      if (!lieu) {
        return apiError(404, "not_found", "Sensor not found")
      }

      const isCritical = lieu.Est_Lieu_En_Alarme === 1
      const isWarning = !isCritical && lieu.Est_Lieu_En_Pre_Alarme === 1
      const isEnded =
        !isCritical &&
        (lieu.Est_Lieu_Alarme_Terminee_Non_Acquittee === 1 ||
          lieu.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 === 1)
      const nonResponseAlarm = await prisma.t_alarme.findFirst({
        where: {
          Id_Lieu: lieu.Id_Lieu,
          Type: "N",
          Date_Heure_Fin: null,
          Est_Acquittee: false,
        },
        select: { Id_Alarme: true },
      })
      const isTechnical = Boolean(nonResponseAlarm)

      const status = isCritical
        ? "critical"
        : isTechnical
          ? "technical"
          : isWarning
            ? "warning"
            : isEnded
              ? "ended"
              : "ok"

      return apiOk({
        id: lieu.Id_Lieu.toString(),
        name: lieu.Nom_Lieu,
        status,
        value: lieu.Derniere_Valeur !== null ? parseFloat(lieu.Derniere_Valeur.toString()) : null,
        unit: lieu.Derniere_Unite || "°C",
        lastUpdate: lieu.Derniere_Date_Heure?.toISOString() || new Date().toISOString(),
        location: {
          id: lieu.Id_Site || 0,
          name:
            lieu.t_site?.Code_Site && lieu.t_site?.Libelle_Site
              ? `${lieu.t_site.Code_Site} - ${lieu.t_site.Libelle_Site}`
              : lieu.t_site?.Code_Site || lieu.t_site?.Libelle_Site || "Unknown",
        },
        minThreshold: lieu.Tolerance_Surveillance_Inf ?? lieu.Consigne_Inf,
        maxThreshold: lieu.Tolerance_Surveillance_Sup ?? lieu.Consigne_Sup,
      })
    } catch (error) {
      log.error("capteurs", "get_sensor_error", { error: error });
      return apiError(500, "internal_error", "Failed to fetch sensor")
    }
  },
)

export const PATCH = withAuthLogging(
  async (req: NextRequest, ctx: any, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { ip } = getRequestContext(req)

      const { id } = await params
      const sensorId = parseInt(id, 10)
      const body = await req.json()
      const data = updateSensorSchema.parse(body)

      const updateData: any = {}
      if (data.name) updateData.Nom_Lieu = data.name
      if (data.minThreshold !== undefined) updateData.Consigne_Inf = data.minThreshold
      if (data.maxThreshold !== undefined) updateData.Consigne_Sup = data.maxThreshold
      if (data.unit) updateData.Derniere_Unite = data.unit

      const lieu = await prisma.t_lieu.update({
        where: { Id_Lieu: sensorId },
        data: updateData,
        include: {
          t_site: {
            select: {
              Id_Site: true,
              Code_Site: true,
              Libelle_Site: true,
            },
          },
        },
      })

      const changes: any = {}
      if (data.name) changes.name = data.name
      if (data.minThreshold !== undefined) changes.minThreshold = data.minThreshold
      if (data.maxThreshold !== undefined) changes.maxThreshold = data.maxThreshold
      if (data.unit) changes.unit = data.unit

      log.data.update("Capteur", sensorId, ctx.user.username, ctx.user.userId, ip, changes)

      const isCritical = lieu.Est_Lieu_En_Alarme === 1
      const isWarning = !isCritical && lieu.Est_Lieu_En_Pre_Alarme === 1
      const isEnded =
        !isCritical &&
        (lieu.Est_Lieu_Alarme_Terminee_Non_Acquittee === 1 ||
          lieu.Est_Lieu_Alarme_Terminee_Non_Acquittee_T1 === 1)
      const nonResponseAlarm = await prisma.t_alarme.findFirst({
        where: {
          Id_Lieu: lieu.Id_Lieu,
          Type: "N",
          Date_Heure_Fin: null,
          Est_Acquittee: false,
        },
        select: { Id_Alarme: true },
      })
      const isTechnical = Boolean(nonResponseAlarm)

      const status = isCritical
        ? "critical"
        : isTechnical
          ? "technical"
          : isWarning
            ? "warning"
            : isEnded
              ? "ended"
              : "ok"

      return apiOk({
        id: lieu.Id_Lieu.toString(),
        name: lieu.Nom_Lieu,
        status,
        location: {
          id: lieu.Id_Site || 0,
          name:
            lieu.t_site?.Code_Site && lieu.t_site?.Libelle_Site
              ? `${lieu.t_site.Code_Site} - ${lieu.t_site.Libelle_Site}`
              : lieu.t_site?.Code_Site || lieu.t_site?.Libelle_Site || "Unknown",
        },
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "invalid_input", "Invalid input")
      }

      log.error("capteurs", "update_sensor_error", { error: error });
      return apiError(500, "internal_error", "Failed to update sensor")
    }
  },
)

export const DELETE = withAuthLogging(
  async (req: NextRequest, ctx: any, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { ip } = getRequestContext(req)

      const { id } = await params
      const sensorId = parseInt(id, 10)

      const sensorToDelete = await prisma.t_lieu.findUnique({
        where: { Id_Lieu: sensorId },
        select: { Nom_Lieu: true },
      })

      await prisma.t_lieu.update({
        where: { Id_Lieu: sensorId },
        data: { Est_Archive: true },
      })

      log.data.delete(
        "Capteur",
        sensorId,
        ctx.user.username,
        ctx.user.userId,
        ip,
        `Archive du capteur ${sensorToDelete?.Nom_Lieu || sensorId}`,
      )

      return apiOk({ success: true })
    } catch (error) {
      log.error("capteurs", "delete_sensor_error", { error: error });
      return apiError(500, "internal_error", "Failed to delete sensor")
    }
  },
)
