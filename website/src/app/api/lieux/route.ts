import { NextRequest } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getClientIp, withLogging } from "@/lib/api-logger"
import { z } from "zod"
import { apiError, apiOk } from "@/lib/api-response"
import { log } from "@/lib/logger"
import { extractAddressFromSerial, isGsoType } from "@/lib/sensor-naming"
import { computeEmt, emtModeToDb, emtModeFromDb } from "@/lib/emt"
import { requireStandardOrExpertIfFieldsUsed } from "@/lib/license-guards"
import { applyAccessFilter, buildLieuAccessFilter, getUserLocationScope } from "@/lib/location-access-scope"

const mailingContactSchema = z.object({
  Id_Tel_Num: z.number().optional(),
  Numero_Ordre: z.number().int().min(1).optional(),
  Id_Utilisateur: z.number().nullable().optional(),
  Est_Via_Telephone: z.boolean().optional(),
  Est_Via_Email: z.boolean().optional(),
})

const STANDARD_METROLOGY_FIELDS = [
  "EMT_Mode",
  "EMT_Valeur",
  "Corriger_Erreur_Justesse",
  "Prendre_En_Compte_Derive",
  "Erreur_Justesse",
  "Incertitude",
  "Derive",
] as const


function addConsigneGuards(data: Record<string, unknown>, ctx: z.RefinementCtx) {
  const hasConsigne = data.Consigne !== null && data.Consigne !== undefined
  const hasSup = data.Consigne_Sup !== null && data.Consigne_Sup !== undefined
  const hasInf = data.Consigne_Inf !== null && data.Consigne_Inf !== undefined
  const supActive = data.Est_Consigne_Sup_Active ?? hasSup
  const infActive = data.Est_Consigne_Inf_Active ?? hasInf

  if (hasConsigne && supActive && hasSup && Number(data.Consigne_Sup) <= Number(data.Consigne)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Consigne_Sup"],
      message: "La consigne sup doit etre strictement superieure a la consigne.",
    })
  }

  if (hasConsigne && infActive && hasInf && Number(data.Consigne_Inf) >= Number(data.Consigne)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Consigne_Inf"],
      message: "La consigne inf doit etre strictement inferieure a la consigne.",
    })
  }

  if (supActive && infActive && hasSup && hasInf && Number(data.Consigne_Inf) >= Number(data.Consigne_Sup)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["Consigne_Inf"],
      message: "La consigne inf doit etre strictement inferieure a la consigne sup.",
    })
  }
}

const createLieuSchema = z.object({
  Nom_Lieu: z.string().min(1, "Nom du lieu requis").max(50),
  Lieu_Etat: z.string().max(1).nullable().optional(),
  Commentaire: z.string().nullable().optional(),
  Observations_Info: z.string().nullable().optional(),
  Id_Site: z.number().nullable().optional(),
  GroupIds: z.array(z.number()).optional(),
  Sonde_Numero_Serie: z.string().nullable().optional(),
  Id_Module: z.number().nullable().optional(),
  Consigne: z.number().nullable().optional(),
  Frequence: z.number().nullable().optional(),
  Consigne_Sup: z.number().nullable().optional(),
  Tolerance_Surveillance_Sup: z.number().nullable().optional(),
  Est_Consigne_Sup_Active: z.boolean().optional(),
  Consigne_Sup_Pre_Alarme: z.number().nullable().optional(),
  Est_Consigne_Sup_Pre_Alarme_Active: z.boolean().optional(),
  Retard_Alarme_Haut: z.number().nullable().optional(),
  Consigne_Inf: z.number().nullable().optional(),
  Tolerance_Surveillance_Inf: z.number().nullable().optional(),
  Est_Consigne_Inf_Active: z.boolean().optional(),
  Consigne_Inf_Pre_Alarme: z.number().nullable().optional(),
  Est_Consigne_Inf_Pre_Alarme_Active: z.boolean().optional(),
  Retard_Alarme_Bas: z.number().nullable().optional(),
  Nb_Mesures_Temporisation_Redeclenchement: z.number().int().min(0).nullable().optional(),
  EMT_Mode: z.string().nullable().optional(),
  EMT_Valeur: z.number().nullable().optional(),
  Corriger_Erreur_Justesse: z.boolean().optional(),
  Prendre_En_Compte_Derive: z.boolean().optional(),
  Erreur_Justesse: z.number().nullable().optional(),
  Incertitude: z.number().nullable().optional(),
  Derive: z.number().nullable().optional(),
  MailingContacts: z.array(mailingContactSchema).optional(),
  Est_Son_Alarme_Active: z.boolean().optional(),
}).superRefine(addConsigneGuards)

function normalizeMailingContacts(contacts: Array<{
  Numero_Ordre?: number | null
  Id_Utilisateur?: number | null
  Est_Via_Telephone?: boolean | null
  Est_Via_Email?: boolean | null
}> | undefined) {
  if (!contacts) return [] as Array<{
    Numero_Ordre: number
    Id_Utilisateur: number
    Est_Via_Telephone: boolean
    Est_Via_Email: boolean
  }>

  return contacts
    .map((contact, index) => ({
      Numero_Ordre: contact.Numero_Ordre ?? index + 1,
      Id_Utilisateur: contact.Id_Utilisateur ?? null,
      Est_Via_Telephone: !!contact.Est_Via_Telephone,
      Est_Via_Email: !!contact.Est_Via_Email,
    }))
    .filter((contact) => contact.Id_Utilisateur !== null && (contact.Est_Via_Email || contact.Est_Via_Telephone))
    .map((contact) => ({
      Numero_Ordre: contact.Numero_Ordre,
      Id_Utilisateur: contact.Id_Utilisateur as number,
      Est_Via_Telephone: contact.Est_Via_Telephone,
      Est_Via_Email: contact.Est_Via_Email,
    }))
}

export const GET = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req)
  if (!user) return apiError(401, "unauthenticated", "Non authentifié")

  try {
    const scope = await getUserLocationScope(user.userId)
    const lieuAccessFilter = buildLieuAccessFilter(scope)

    const lieux = await prisma.t_lieu.findMany({
      where: applyAccessFilter({ Est_Archive: false }, lieuAccessFilter),
      include: {
        t_lieu_groupe: {
          include: {
            t_groupe: { select: { Id_Groupe: true, Nom_Groupe: true, Numero_Regroupement: true } },
          },
        },
        t_site: { select: { Libelle_Site: true } },
        t_sonde: { select: { Sonde_Numero_Serie: true, Id_Module: true } },
        t_lieu_mail_tel: {
          select: {
            Id_Mail_Tel: true,
            Ordre_Contact: true,
            Id_Utilisateur: true,
            Est_Via_Telephone: true,
            Est_Via_Email: true,
          },
          orderBy: { Ordre_Contact: "asc" },
        },
      },
      orderBy: { Nom_Lieu: "asc" },
    })

    type SerializedLieu = typeof lieux[number] & {
      t_sonde?: { Sonde_Numero_Serie?: string | null; Id_Module?: number | null } | null
      t_lieu_mail_tel?: Array<{
        Id_Mail_Tel?: number | null
        Ordre_Contact?: number | null
        Id_Utilisateur?: number | null
        Est_Via_Telephone?: boolean | null
        Est_Via_Email?: boolean | null
      }>
    }

    const serialized = JSON.parse(
      JSON.stringify(lieux, (_, value) => (typeof value === "bigint" ? value.toString() : value)),
    ) as SerializedLieu[]

    const normalized = serialized.map((lieu) => ({
      ...lieu,
      Commentaire: lieu?.Observations_Info ?? lieu?.Commentaire ?? null,
      EMT_Mode: emtModeFromDb(lieu?.EMT_Choix_Mode),
      EMT_Valeur: lieu?.EMT_Sonde ?? null,
      Corriger_Erreur_Justesse: lieu?.Est_Correction_Ej === 1,
      Prendre_En_Compte_Derive: lieu?.Est_Correction_derive ?? false,
      Erreur_Justesse: lieu?.Derniere_Erreur_Justesse ?? null,
      Incertitude: lieu?.Derniere_Incertitude ?? null,
      Id_Module: lieu?.t_sonde?.Id_Module ?? null,
      Frequence:
        lieu?.Frequence === null || lieu?.Frequence === undefined
          ? lieu?.Frequence
          : Number(lieu.Frequence) / 60,
      GroupIds: (lieu?.t_lieu_groupe ?? []).map((lg) => lg.Id_Groupe),
      MailingContacts: (lieu?.t_lieu_mail_tel ?? []).map((contact, index) => ({
        Id_Tel_Num: contact.Id_Mail_Tel,
        Numero_Ordre: contact.Ordre_Contact ?? index + 1,
        Id_Utilisateur: contact.Id_Utilisateur ?? null,
        Est_Via_Telephone: !!contact.Est_Via_Telephone,
        Est_Via_Email: !!contact.Est_Via_Email,
      })),
    }))

    return apiOk(normalized)
  } catch (error) {
    log.error("lieux", "lieux_fetch_error", { error: error });
    return apiError(500, "lieux_fetch_failed", "Erreur lors de la récupération des lieux")
  }
})

export const POST = withLogging(async (req: NextRequest) => {
  const user = getAuthenticatedUser(req)
  if (!user) return apiError(401, "unauthenticated", "Non authentifié")

  try {
    const body = await req.json()
    const metrologyGuard = await requireStandardOrExpertIfFieldsUsed(body as Record<string, unknown>, STANDARD_METROLOGY_FIELDS)
    if (metrologyGuard) return metrologyGuard

    const validated = createLieuSchema.parse(body)
    const frequencySeconds =
      validated.Frequence === undefined
        ? undefined
        : validated.Frequence === null
        ? null
        : Math.round(validated.Frequence * 60)

    const groupIds = Array.from(
      new Set(
        [...(validated.GroupIds ?? [])].filter((v): v is number => typeof v === "number" && !Number.isNaN(v)),
      ),
    )

    const lieuEtat = validated.Lieu_Etat ?? "D"
    const sondeNumeroSerie = validated.Sonde_Numero_Serie?.trim() || null
    const hasIdModule = Object.prototype.hasOwnProperty.call(validated, "Id_Module")

    let estLieuGso = false
    let adresseSondeLieu: string | null = null
    if (sondeNumeroSerie) {
      const gsoInfo = await prisma.t_sonde.findUnique({
        where: { Sonde_Numero_Serie: sondeNumeroSerie },
        select: { Est_Sonde_GSO: true, Adresse_Sonde: true },
      })
      estLieuGso = gsoInfo?.Est_Sonde_GSO ?? isGsoType(sondeNumeroSerie)
      if (estLieuGso) {
        adresseSondeLieu = gsoInfo?.Adresse_Sonde ?? extractAddressFromSerial(sondeNumeroSerie)
      }
    }

    const mailingContacts = normalizeMailingContacts(validated.MailingContacts)
    const dateCreation = new Date()
    dateCreation.setHours(0, 0, 0, 0)
    const [dbNowRow] = await prisma.$queryRaw<Array<{ nowAt: Date }>>`SELECT NOW() AS nowAt`
    const dbNow = dbNowRow?.nowAt ?? new Date()
    const surveillanceOnAt = lieuEtat === "S" ? dbNow : null
    const surveillanceOffAt = lieuEtat === "D" ? dbNow : null

    const includeDeriveInUncertainty =
      validated.EMT_Mode === "quart" || validated.EMT_Mode === "manuel"
        ? true
        : (validated.Prendre_En_Compte_Derive ?? false)

    const emt = computeEmt({
      mode: validated.EMT_Mode,
      emtValue: validated.EMT_Valeur,
      consigne: validated.Consigne,
      consigneSup: validated.Consigne_Sup,
      consigneInf: validated.Consigne_Inf,
      isConsigneSupActive: validated.Est_Consigne_Sup_Active ?? false,
      isConsigneInfActive: validated.Est_Consigne_Inf_Active ?? false,
      incertitude: validated.Incertitude,
      erreurJustesse: validated.Erreur_Justesse,
      derive: validated.Derive,
      includeDeriveInUncertainty,
      correctAccuracyError: validated.Corriger_Erreur_Justesse ?? false,
    })

    const toleranceSup =
      validated.EMT_Mode === "quart" || validated.EMT_Mode === "manuel"
        ? emt.toleranceSup
        : validated.EMT_Mode === "sans-objet"
        ? (validated.Est_Consigne_Sup_Active ? validated.Consigne_Sup : null)
        : validated.Tolerance_Surveillance_Sup
    const toleranceInf =
      validated.EMT_Mode === "quart" || validated.EMT_Mode === "manuel"
        ? emt.toleranceInf
        : validated.EMT_Mode === "sans-objet"
        ? (validated.Est_Consigne_Inf_Active ? validated.Consigne_Inf : null)
        : validated.Tolerance_Surveillance_Inf

    const lieu = await prisma.t_lieu.create({
      data: ({
        Nom_Lieu: validated.Nom_Lieu,
        Date_Creation: dateCreation,
        Commentaire: validated.Commentaire ?? validated.Observations_Info ?? null,
        Observations_Info: validated.Observations_Info ?? validated.Commentaire ?? null,
        Consigne: validated.Consigne,
        Consigne_Base: validated.Consigne ?? null,
        Frequence: frequencySeconds,
        Consigne_Sup: validated.Consigne_Sup,
        Consigne_Sup_Base: validated.Consigne_Sup ?? null,
        Tolerance_Surveillance_Sup: toleranceSup,
        Tolerance_Surveillance_Sup_Base: toleranceSup ?? null,
        Est_Consigne_Sup_Active: validated.Est_Consigne_Sup_Active ?? false,
        Consigne_Sup_Pre_Alarme: validated.Consigne_Sup_Pre_Alarme,
        Est_Consigne_Sup_Pre_Alarme_Active: validated.Est_Consigne_Sup_Pre_Alarme_Active ?? false,
        Retard_Alarme_Haut: validated.Retard_Alarme_Haut,
        Consigne_Inf: validated.Consigne_Inf,
        Consigne_Inf_Base: validated.Consigne_Inf ?? null,
        Tolerance_Surveillance_Inf: toleranceInf,
        Tolerance_Surveillance_Inf_Base: toleranceInf ?? null,
        Est_Consigne_Inf_Active: validated.Est_Consigne_Inf_Active ?? false,
        Consigne_Inf_Pre_Alarme: validated.Consigne_Inf_Pre_Alarme,
        Est_Consigne_Inf_Pre_Alarme_Active: validated.Est_Consigne_Inf_Pre_Alarme_Active ?? false,
        Retard_Alarme_Bas: validated.Retard_Alarme_Bas,
        Nb_Mesures_Temporisation_Redeclenchement: validated.Nb_Mesures_Temporisation_Redeclenchement ?? 0,
        EMT_Choix_Mode: emtModeToDb(validated.EMT_Mode),
        EMT_Sonde: emt.emtSonde,
        Est_Correction_Ej: validated.Corriger_Erreur_Justesse ? 1 : 0,
        Est_Correction_derive: includeDeriveInUncertainty,
        Est_Archive: false,
        Date_Heure_Surveillance_On: surveillanceOnAt,
        Date_Heure_Surveillance_Off: surveillanceOffAt,
        Est_Lieu_GSO: estLieuGso,
        Est_Son_Alarme_Active: validated.Est_Son_Alarme_Active ?? true,
        Adresse_Sonde: adresseSondeLieu,
        t_etat_surveillance: {
          connect: { Surveillance_Etat: lieuEtat },
        },
        ...(validated.Id_Site
          ? {
              t_site: {
                connect: { Id_Site: validated.Id_Site },
              },
            }
          : {}),
        ...(sondeNumeroSerie
          ? {
              t_sonde: {
                connect: { Sonde_Numero_Serie: sondeNumeroSerie },
              },
            }
          : {}),
        ...(groupIds.length > 0
          ? {
              t_lieu_groupe: {
                createMany: {
                  data: groupIds.map((Id_Groupe) => ({ Id_Groupe })),
                  skipDuplicates: true,
                },
              },
            }
          : {}),
        ...(mailingContacts.length > 0
          ? {
              t_lieu_mail_tel: {
                createMany: {
                  data: mailingContacts.map((contact) => ({
                    Ordre_Contact: contact.Numero_Ordre,
                    Id_Utilisateur: contact.Id_Utilisateur,
                    Est_Via_Telephone: contact.Est_Via_Telephone,
                    Est_Via_Email: contact.Est_Via_Email,
                  })),
                },
              },
            }
          : {}),
      }) as any,
    })

    if (sondeNumeroSerie && Object.prototype.hasOwnProperty.call(validated, "Lieu_Etat")) {
      await prisma.t_sonde.updateMany({
        where: { Sonde_Numero_Serie: sondeNumeroSerie },
        data: { Surveillance_Etat: lieuEtat },
      })
    }

    if (sondeNumeroSerie && hasIdModule) {
      let modulePortSerie: string | null = null
      if (validated.Id_Module !== null && validated.Id_Module !== undefined) {
        const module = await prisma.t_module.findUnique({
          where: { Id_Module: validated.Id_Module },
          select: { Port_Serie: true },
        })
        if (!module) {
          return apiError(400, "invalid_module", "Module introuvable")
        }
        modulePortSerie = module.Port_Serie ?? null
      }

      await prisma.t_sonde.updateMany({
        where: { Sonde_Numero_Serie: sondeNumeroSerie },
        data: {
          Id_Module: validated.Id_Module ?? null,
          Port_Serie: modulePortSerie,
        },
      })
    }

    log.data.create("Lieu", lieu.Id_Lieu, user.username, user.userId, getClientIp(req), {
      nom: validated.Nom_Lieu,
      sondeNumeroSerie,
      idSite: validated.Id_Site ?? null,
      groupIds,
      idModule: validated.Id_Module ?? null,
      mailingContactsCount: mailingContacts.length,
    })

    const serialized = JSON.parse(
      JSON.stringify(lieu, (_, value) => (typeof value === "bigint" ? value.toString() : value)),
    )

    const normalized = {
      ...serialized,
      EMT_Mode: emtModeFromDb(serialized?.EMT_Choix_Mode),
      EMT_Valeur: serialized?.EMT_Sonde ?? null,
      Corriger_Erreur_Justesse: serialized?.Est_Correction_Ej === 1,
      Prendre_En_Compte_Derive: serialized?.Est_Correction_derive ?? false,
      Erreur_Justesse: serialized?.Derniere_Erreur_Justesse ?? null,
      Incertitude: serialized?.Derniere_Incertitude ?? null,
      // The lieu was just created without including t_sonde, so use the validated input value.
      Id_Module: validated.Id_Module ?? null,
      Frequence:
        serialized?.Frequence === null || serialized?.Frequence === undefined
          ? serialized?.Frequence
          : Number(serialized.Frequence) / 60,
    }

    return apiOk(normalized, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(400, "validation_error", "Invalid input", { issues: error.issues })
    }
    log.error("lieux", "lieu_create_error", { error: error });
    return apiError(500, "lieu_create_failed", "Erreur lors de la création du lieu")
  }
})


