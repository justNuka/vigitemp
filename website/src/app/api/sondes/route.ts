import { NextRequest } from "next/server"

import { withAuthLogging } from "@/lib/api-wrappers"
import { getRequestContext } from "@/lib/api-logger"
import { apiError, apiOk } from "@/lib/api-response"
import { prisma } from "@/lib/prisma"
import { validateLicense } from "@/lib/license-server"
import { log } from "@/lib/logger"
import { buildSensorSerialsFromInput, extractAddressFromSerial } from "@/lib/sensor-naming"
import { z } from "zod"

export const GET = withAuthLogging(async (_req: NextRequest) => {
  try {
    const sondes = await prisma.t_sonde.findMany({
      include: {
        t_lieu: {
          select: {
            Nom_Lieu: true,
            Id_Lieu: true,
          },
        },
      },
      orderBy: {
        Sonde_Numero_Serie: "asc",
      },
    })

    const serials = sondes
      .map((sonde) => sonde.Sonde_Numero_Serie)
      .filter((serial): serial is string => Boolean(serial))

    const latestEtalonnages = serials.length
      ? await prisma.t_etalonnage.findMany({
          where: { Sonde_Numero_Serie: { in: serials } },
          orderBy: [{ Sonde_Numero_Serie: "asc" }, { Date_Heure_Etalonnage: "desc" }, { Id_Etalonnage: "desc" }],
          select: {
            Sonde_Numero_Serie: true,
            Date_Validite: true,
          },
        })
      : []

    const latestValidityBySerial = new Map<string, Date | null>()
    for (const etal of latestEtalonnages) {
      const serial = etal.Sonde_Numero_Serie
      if (!serial) continue
      if (!latestValidityBySerial.has(serial)) {
        latestValidityBySerial.set(serial, etal.Date_Validite ?? null)
      }
    }

    const formatted = sondes.map((sonde) => ({
      Id_Sonde: sonde.Id_Sonde,
      Adresse_Sonde: sonde.Adresse_Sonde,
      Sonde_Numero_Serie: sonde.Sonde_Numero_Serie,
      Port_Serie: sonde.Port_Serie,
      Sonde_Type: (sonde as any).Sonde_Type ?? null,
      Surveillance_Etat: sonde.Surveillance_Etat,
      Surveillance_Etat_Libelle: sonde.Surveillance_Etat,
      Id_Module: sonde.Id_Module,
      Sonde_Offset: sonde.Sonde_Offset,
      Lieu: sonde.t_lieu[0]?.Nom_Lieu || null,
      Date_Validite_Etalonnage: sonde.Sonde_Numero_Serie
        ? latestValidityBySerial.get(sonde.Sonde_Numero_Serie) ?? null
        : null,
    }))

    return apiOk(formatted)
  } catch (error) {
    log.error("sondes", "sondes_fetch_error", { error: error });
    return apiError(500, "internal_error", "Erreur lors de la récupération des sondes")
  }
})

const createSensorSchema = z.object({
  sondeType: z.string().min(1),
  serieNum: z.string().regex(/^[A-Z0-9-]+$/i, "Numéro de série invalide"),
  moduleId: z.number().int().positive().nullable().optional(),
  sondeOffset: z.number().nullable().optional(),
})

export const POST = withAuthLogging(async (req: NextRequest, ctx: any) => {
  try {
    const body = await req.json()
    const data = createSensorSchema.parse(body)
    const { ip } = getRequestContext(req)

    const creation = buildSensorSerialsFromInput(data.sondeType, data.serieNum)
    const serialsToCreate = Array.from(new Set(creation.serials))

    const license = await validateLicense()
    if (!license.ok) {
      return apiError(403, "license_invalid", "Licence invalide, création de sonde refusée")
    }

    const edition = (license.edition || "one").trim().toLowerCase()
    if (edition === "pack") {
      const limit = typeof license.maxSensors === "number" ? license.maxSensors : null
      if (!limit || limit <= 0) {
        return apiError(403, "license_pack_limit_invalid", "Limite de sondes invalide pour la licence Pack")
      }

      const currentCount = await prisma.t_sonde.count({
        where: {
          Sonde_Numero_Serie: {
            not: null,
          },
        },
      })

      if (currentCount + serialsToCreate.length > limit) {
        return apiError(
          403,
          "license_sensor_limit_reached",
          `Limite de sondes atteinte pour la licence Pack (${currentCount}/${limit})`,
          { limit, currentCount, requested: serialsToCreate.length },
        )
      }
    }

    const existing = await prisma.t_sonde.findMany({
      where: { Sonde_Numero_Serie: { in: serialsToCreate } },
      select: { Sonde_Numero_Serie: true },
    })

    if (existing.length > 0) {
      const existingSerials = existing
        .map((item) => item.Sonde_Numero_Serie)
        .filter((value): value is string => Boolean(value))
      return apiError(409, "conflict", "Une sonde avec ce numéro de série existe déjà", {
        serials: existingSerials,
      })
    }

    let portSerie: string | null = null
    if (data.moduleId) {
      const module = await prisma.t_module.findUnique({
        where: { Id_Module: data.moduleId },
        select: { Port_Serie: true },
      })
      if (!module) {
        return apiError(400, "invalid_module", "Module introuvable")
      }
      portSerie = module.Port_Serie ?? null
    }

    const created = await prisma.$transaction(
      serialsToCreate.map((serial) =>
        prisma.t_sonde.create({
          data: {
            Adresse_Sonde: creation.isGso ? extractAddressFromSerial(serial) : data.serieNum,
            Sonde_Numero_Serie: serial,
            Id_Module: data.moduleId ?? null,
            Port_Serie: portSerie,
            Sonde_Offset: data.sondeOffset ?? 0,
            Surveillance_Etat: "D",
            Est_Sonde_GSO: creation.isGso,
          },
        }),
      ),
    )

    for (const item of created) {
      log.data.create("Sonde", item.Id_Sonde, ctx.user.username, ctx.user.userId, ip, {
        serial: item.Sonde_Numero_Serie,
        adresse: item.Adresse_Sonde,
        moduleId: item.Id_Module,
        offset: item.Sonde_Offset,
        estGso: item.Est_Sonde_GSO,
      })
    }

    return apiOk(
      {
        message: "Sonde créée avec succès",
        sensors: created.map((item) => ({
          Id_Sonde: item.Id_Sonde,
          Sonde_Numero_Serie: item.Sonde_Numero_Serie,
          Adresse_Sonde: item.Adresse_Sonde,
          Est_Sonde_GSO: item.Est_Sonde_GSO,
        })),
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Données invalides", { details: error.issues })
    }

    log.error("sondes", "sonde_create_error", { error: error });
    return apiError(500, "internal_error", "Erreur lors de la création de la sonde")
  }
})
