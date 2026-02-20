import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { withAuthLogging } from "@/lib/api-wrappers"
import { log } from "@/lib/logger"
import { getRequestContext } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { requireStandardOrExpertLicense } from "@/lib/license-guards"

const updateEtalonSchema = z.object({
  Etalon_Numero_Serie: z.string().min(1, "Numéro de série requis"),
  Etat_Etalon: z.string().optional(),
  Port_Serie: z.string().optional(),
  Resolution: z.string().optional(),
  Incertitude: z.string().optional(),
  Nb_Decimale: z.number().optional(),
  Reserve_MC2: z.string().optional(),
  Id_Serveur: z.number().optional(),
  Id_Module: z.number().optional(),
  Numero: z.string().optional(),
  Organisme: z.string().optional(),
  Date: z.string().optional(),
  Unite: z.string().optional(),
  mesures: z
    .array(
      z.object({
        Numero_Ordre: z.number(),
        Temperature_Reference: z.string(),
        Temperature_Vraie: z.string(),
        Incertitude: z.string(),
      }),
    )
    .optional(),
})

export const PATCH = withAuthLogging(
  async (req: NextRequest, ctx: any, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { ip } = getRequestContext(req)
      const guard = await requireStandardOrExpertLicense()
      if (guard) return guard

      const body = await req.json()
      const data = updateEtalonSchema.parse(body)
      const resolvedParams = await params
      const etalonId = parseInt(resolvedParams.id, 10)

      if (Number.isNaN(etalonId)) {
        return apiError(400, "invalid_id", "ID invalide")
      }

      const existingEtalon = await prisma.t_etalon.findUnique({
        where: { Id_Etalon: etalonId },
      })
      if (!existingEtalon) {
        return apiError(404, "not_found", "Étalon introuvable")
      }

      const updatedEtalon = await prisma.t_etalon.update({
        where: { Id_Etalon: etalonId },
        data: {
          Etat_Etalon: data.Etat_Etalon,
          Port_Serie: data.Port_Serie,
          Resolution: data.Resolution,
          Incertitude: data.Incertitude,
          Nb_Decimale: data.Nb_Decimale,
          Reserve_MC2: data.Reserve_MC2,
          Id_Serveur: data.Id_Serveur,
          Id_Module: data.Id_Module,
        },
      })

      log.data.update("Etalon", etalonId, ctx.user.username, ctx.user.userId, ip, {
        serie: data.Etalon_Numero_Serie,
        etat: data.Etat_Etalon,
      })

      if (data.Numero || data.Organisme || data.Date || data.Unite) {
        const certifDate = data.Date ? new Date(data.Date) : null

        const existingCertif = await prisma.t_certif.findFirst({
          where: { Etalon_Numero_Serie: data.Etalon_Numero_Serie },
        })

        if (existingCertif) {
          await prisma.t_certif.update({
            where: { Id_Certif: existingCertif.Id_Certif },
            data: {
              Numero: data.Numero,
              Organisme: data.Organisme,
              Date: certifDate,
              Unite: data.Unite,
            },
          })

          await prisma.t_certif_mesure.deleteMany({
            where: { Id_Certif: existingCertif.Id_Certif },
          })

          if (data.mesures?.length) {
            await prisma.t_certif_mesure.createMany({
              data: data.mesures.map((m) => ({
                Id_Certif: existingCertif.Id_Certif,
                Numero_Ordre: m.Numero_Ordre,
                Temperature_Reference: m.Temperature_Reference,
                Temperature_Vraie: m.Temperature_Vraie,
                Incertitude: parseFloat(m.Incertitude) || null,
              })),
            })
          }
        } else {
          const newCertif = await prisma.t_certif.create({
            data: {
              Numero: data.Numero,
              Organisme: data.Organisme,
              Date: certifDate,
              Etalon_Numero_Serie: data.Etalon_Numero_Serie,
              Unite: data.Unite,
            },
          })

          if (data.mesures?.length) {
            await prisma.t_certif_mesure.createMany({
              data: data.mesures.map((m) => ({
                Id_Certif: newCertif.Id_Certif,
                Numero_Ordre: m.Numero_Ordre,
                Temperature_Reference: m.Temperature_Reference,
                Temperature_Vraie: m.Temperature_Vraie,
                Incertitude: parseFloat(m.Incertitude) || null,
              })),
            })
          }
        }
      }

      return apiOk({
        message: "Étalon mis à jour avec succès",
        etalon: updatedEtalon,
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return apiError(400, "validation_error", "Données invalides", { details: error.issues })
      }

      console.error("Etalon update error:", error)
      return apiError(500, "etalon_update_failed", "Erreur lors de la mise à jour de l'étalon")
    }
  },
)

export const DELETE = withAuthLogging(
  async (req: NextRequest, ctx: any, { params }: { params: Promise<{ id: string }> }) => {
    try {
      const { ip } = getRequestContext(req)
      const guard = await requireStandardOrExpertLicense()
      if (guard) return guard

      const resolvedParams = await params
      const etalonId = parseInt(resolvedParams.id, 10)

      if (Number.isNaN(etalonId)) {
        return apiError(400, "invalid_id", "ID invalide")
      }

      const existingEtalon = await prisma.t_etalon.findUnique({
        where: { Id_Etalon: etalonId },
      })

      if (!existingEtalon) {
        return apiError(404, "not_found", "Étalon introuvable")
      }

      const updated = await prisma.t_etalon.update({
        where: { Id_Etalon: etalonId },
        data: { Est_Archive: true },
      })

      log.data.delete("Etalon", etalonId, ctx.user.username, ctx.user.userId, ip, `Archivage etalon ${existingEtalon.Etalon_Numero_Serie}`)

      return apiOk({ Id_Etalon: updated.Id_Etalon, Est_Archive: updated.Est_Archive })
    } catch (error) {
      console.error("Etalon archive error:", error)
      return apiError(500, "etalon_archive_failed", "Erreur lors de l'archivage de l'étalon")
    }
  },
)
