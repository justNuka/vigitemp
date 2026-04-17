import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { getClientIp } from "@/lib/api-logger"
import { withAnyAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { auditRouteCreate } from "@/lib/audit-route"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import {
  buildVigilogTemporaryUsageReference,
  normalizeOptionalText,
  vigilogTemporaryUsageStartSchema,
  VIGILOG_ACCESS_CODES,
  VIGILOG_TEMP_USAGE_STATUSES,
} from "../_shared"
import { ensureVigilogTemporaryUsageTable } from "./_table"

type TempUsageRow = {
  id: number
  reference: string
  configurationId: number | null
  loggerId: number | null
  configurationName: string
  loggerSerial: string
  temporaryLocationName: string
  status: string
  startedAt: Date | string
  stoppedAt: Date | string | null
  startComment: string | null
  stopComment: string | null
  createdAt: Date | string
  updatedAt: Date | string | null
  startedByLogin: string | null
  startedByFirstName: string | null
  startedByLastName: string | null
  stoppedByLogin: string | null
  stoppedByFirstName: string | null
  stoppedByLastName: string | null
}

type TempUsageStatsRow = {
  activeCount: bigint | number | null
  totalCount: bigint | number | null
}

function formatUserLabel(login: string | null, firstName: string | null, lastName: string | null) {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim()
  return fullName || login || null
}

export const GET = withAnyAuthorizationLogging(VIGILOG_ACCESS_CODES, async (req: NextRequest) => {
  try {
    const hasTable = await ensureVigilogTemporaryUsageTable()
    if (!hasTable) {
      return apiOk({
        stats: {
          activeCount: 0,
          totalCount: 0,
        },
        usages: [],
      })
    }

    const { searchParams } = new URL(req.url)
    const rawStatus = searchParams.get("status")?.trim().toUpperCase() || null
    const requestedStatus = VIGILOG_TEMP_USAGE_STATUSES.includes(rawStatus as (typeof VIGILOG_TEMP_USAGE_STATUSES)[number])
      ? rawStatus
      : null
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "50"), 1), 200)

    const usages = requestedStatus
      ? await prisma.$queryRaw<TempUsageRow[]>`
          SELECT
            u.Id_VigiLog_Usage_Ponctuel AS id,
            u.Reference_Usage AS reference,
            u.Id_VigiLog_Configuration AS configurationId,
            u.Id_VigiLog AS loggerId,
            u.Nom_Configuration AS configurationName,
            u.Numero_Serie_VigiLog AS loggerSerial,
            u.Nom_Lieu_Temporaire AS temporaryLocationName,
            u.Statut AS status,
            u.Date_Heure_Demarrage AS startedAt,
            u.Date_Heure_Arret AS stoppedAt,
            u.Commentaire_Demarrage AS startComment,
            u.Commentaire_Arret AS stopComment,
            u.Date_Heure_Creation AS createdAt,
            u.Date_Heure_Maj AS updatedAt,
            startUser.Login AS startedByLogin,
            startUser.Prenom AS startedByFirstName,
            startUser.Nom AS startedByLastName,
            stopUser.Login AS stoppedByLogin,
            stopUser.Prenom AS stoppedByFirstName,
            stopUser.Nom AS stoppedByLastName
          FROM t_vigilog_usage_ponctuel u
          LEFT JOIN t_utilisateur startUser ON startUser.Id_Utilisateur = u.Id_Utilisateur_Demarrage
          LEFT JOIN t_utilisateur stopUser ON stopUser.Id_Utilisateur = u.Id_Utilisateur_Arret
          WHERE u.Statut = ${requestedStatus}
          ORDER BY u.Date_Heure_Demarrage DESC
          LIMIT ${limit}
        `
      : await prisma.$queryRaw<TempUsageRow[]>`
          SELECT
            u.Id_VigiLog_Usage_Ponctuel AS id,
            u.Reference_Usage AS reference,
            u.Id_VigiLog_Configuration AS configurationId,
            u.Id_VigiLog AS loggerId,
            u.Nom_Configuration AS configurationName,
            u.Numero_Serie_VigiLog AS loggerSerial,
            u.Nom_Lieu_Temporaire AS temporaryLocationName,
            u.Statut AS status,
            u.Date_Heure_Demarrage AS startedAt,
            u.Date_Heure_Arret AS stoppedAt,
            u.Commentaire_Demarrage AS startComment,
            u.Commentaire_Arret AS stopComment,
            u.Date_Heure_Creation AS createdAt,
            u.Date_Heure_Maj AS updatedAt,
            startUser.Login AS startedByLogin,
            startUser.Prenom AS startedByFirstName,
            startUser.Nom AS startedByLastName,
            stopUser.Login AS stoppedByLogin,
            stopUser.Prenom AS stoppedByFirstName,
            stopUser.Nom AS stoppedByLastName
          FROM t_vigilog_usage_ponctuel u
          LEFT JOIN t_utilisateur startUser ON startUser.Id_Utilisateur = u.Id_Utilisateur_Demarrage
          LEFT JOIN t_utilisateur stopUser ON stopUser.Id_Utilisateur = u.Id_Utilisateur_Arret
          ORDER BY u.Date_Heure_Demarrage DESC
          LIMIT ${limit}
        `

    const [stats] = await prisma.$queryRaw<TempUsageStatsRow[]>`
      SELECT
        SUM(CASE WHEN Statut = 'EN_COURS' THEN 1 ELSE 0 END) AS activeCount,
        COUNT(*) AS totalCount
      FROM t_vigilog_usage_ponctuel
    `

    return apiOk({
      stats: {
        activeCount: Number(stats?.activeCount ?? 0),
        totalCount: Number(stats?.totalCount ?? 0),
      },
      usages: usages.map((usage) => ({
        id: usage.id,
        reference: usage.reference,
        configurationId: usage.configurationId,
        loggerId: usage.loggerId,
        configurationName: usage.configurationName,
        loggerSerial: usage.loggerSerial,
        temporaryLocationName: usage.temporaryLocationName,
        status: usage.status,
        startedAt: usage.startedAt,
        stoppedAt: usage.stoppedAt,
        startComment: usage.startComment,
        stopComment: usage.stopComment,
        createdAt: usage.createdAt,
        updatedAt: usage.updatedAt,
        startedBy: formatUserLabel(usage.startedByLogin, usage.startedByFirstName, usage.startedByLastName),
        stoppedBy: formatUserLabel(usage.stoppedByLogin, usage.stoppedByFirstName, usage.stoppedByLastName),
      })),
    })
  } catch (error) {
    log.error("services/vigilog/usages-ponctuels", "vigilog_temp_usages_fetch_failed", { error })
    return apiError(500, "vigilog_temp_usages_fetch_failed", "Erreur lors du chargement des usages ponctuels VigiLog")
  }
})

export const POST = withAnyAuthorizationLogging(
  VIGILOG_ACCESS_CODES,
  async (req: NextRequest, ctx: HandlerContext) => {
    try {
      const hasTable = await ensureVigilogTemporaryUsageTable()
      if (!hasTable) {
        return apiError(
          503,
          "vigilog_temp_usage_table_missing",
          "La table des usages ponctuels VigiLog n'est pas disponible sur cette installation",
        )
      }

      const body = await req.json().catch(() => ({}))
      const parsed = vigilogTemporaryUsageStartSchema.safeParse(body)
      if (!parsed.success) {
        return apiError(400, "validation_error", "Usage ponctuel VigiLog invalide", {
          issues: parsed.error.issues,
        })
      }

      const payload = parsed.data

      const configuration = await prisma.t_vigilog_configuration.findUnique({
        where: { Id_VigiLog_Configuration: payload.Id_VigiLog_Configuration },
        select: {
          Id_VigiLog_Configuration: true,
          Nom_Configuration: true,
          Actif: true,
        },
      })

      if (!configuration || !configuration.Actif) {
        return apiError(404, "configuration_not_found", "Configuration VigiLog introuvable ou inactive")
      }

      const serial = payload.Numero_Serie_VigiLog.trim()
      const [activeUsage] = await prisma.$queryRaw<Array<{ id: number }>>`
        SELECT Id_VigiLog_Usage_Ponctuel AS id
        FROM t_vigilog_usage_ponctuel
        WHERE Numero_Serie_VigiLog = ${serial}
          AND Statut = 'EN_COURS'
        LIMIT 1
      `

      if (activeUsage) {
        return apiError(
          409,
          "vigilog_temp_usage_already_active",
          "Un usage ponctuel est deja actif pour ce VigiLog",
        )
      }

      const linkedLogger = await prisma.t_vigilog.findUnique({
        where: { Numero_Serie: serial },
        select: { Id_VigiLog: true, Actif: true },
      })

      const now = new Date()
      const reference = buildVigilogTemporaryUsageReference(ctx.user.userId)

      await prisma.$executeRaw`
        INSERT INTO t_vigilog_usage_ponctuel (
          Reference_Usage,
          Id_VigiLog_Configuration,
          Id_VigiLog,
          Nom_Configuration,
          Numero_Serie_VigiLog,
          Nom_Lieu_Temporaire,
          Statut,
          Id_Utilisateur_Demarrage,
          Date_Heure_Demarrage,
          Commentaire_Demarrage,
          Date_Heure_Creation,
          Date_Heure_Maj
        )
        VALUES (
          ${reference},
          ${configuration.Id_VigiLog_Configuration},
          ${payload.Id_VigiLog ?? (linkedLogger?.Actif ? linkedLogger.Id_VigiLog : null)},
          ${configuration.Nom_Configuration},
          ${serial},
          ${payload.Nom_Lieu_Temporaire.trim()},
          ${"EN_COURS"},
          ${ctx.user.userId},
          ${now},
          ${normalizeOptionalText(payload.Commentaire_Demarrage)},
          ${now},
          ${now}
        )
      `

      const [createdUsage] = await prisma.$queryRaw<Array<{ id: number; status: string }>>`
        SELECT Id_VigiLog_Usage_Ponctuel AS id, Statut AS status
        FROM t_vigilog_usage_ponctuel
        WHERE Reference_Usage = ${reference}
        LIMIT 1
      `

      if (!createdUsage) {
        return apiError(500, "vigilog_temp_usage_create_failed", "Creation de l'usage ponctuel impossible")
      }

      log.audit("VLOG", {
        user: ctx.user.username,
        userId: ctx.user.userId,
        ip: getClientIp(req),
        resource: "Usage ponctuel VigiLog",
        resourceId: createdUsage.id,
        changes: {
          action: "start",
          reference,
          configurationId: configuration.Id_VigiLog_Configuration,
          configurationName: configuration.Nom_Configuration,
          loggerId: payload.Id_VigiLog ?? null,
          loggerSerial: serial,
          temporaryLocationName: payload.Nom_Lieu_Temporaire.trim(),
          status: createdUsage.status,
        },
      })

      auditRouteCreate(req, ctx.user, {
        resource: "Usage ponctuel VigiLog",
        resourceId: createdUsage.id,
        data: {
          reference,
          configurationId: configuration.Id_VigiLog_Configuration,
          configurationName: configuration.Nom_Configuration,
          loggerId: payload.Id_VigiLog ?? null,
          loggerSerial: serial,
          temporaryLocationName: payload.Nom_Lieu_Temporaire.trim(),
          status: createdUsage.status,
          startComment: normalizeOptionalText(payload.Commentaire_Demarrage),
        },
      })

      return apiOk(
        {
          id: createdUsage.id,
          reference,
          status: createdUsage.status,
        },
        { status: 201 },
      )
    } catch (error) {
      log.error("services/vigilog/usages-ponctuels", "vigilog_temp_usage_create_failed", { error })
      return apiError(500, "vigilog_temp_usage_create_failed", "Erreur lors du demarrage de l'usage ponctuel VigiLog")
    }
  },
)
