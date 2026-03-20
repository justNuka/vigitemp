import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { getClientIp } from "@/lib/api-logger"
import { withAnyAuthorizationLogging, type HandlerContext } from "@/lib/api-wrappers"
import { log } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import {
  buildVigilogReference,
  normalizeOptionalText,
  vigilogDepartureSchema,
  VIGILOG_ACCESS_CODES,
  VIGILOG_STATUSES,
} from "../_shared"

function formatSiteName(site: { Code_Site: string | null; Libelle_Site: string | null } | null | undefined) {
  if (!site) return null
  if (site.Code_Site && site.Libelle_Site) return `${site.Code_Site} - ${site.Libelle_Site}`
  return site.Code_Site || site.Libelle_Site || null
}

function formatUserLabel(user: {
  Login: string | null
  Prenom: string | null
  Nom: string | null
} | null | undefined) {
  if (!user) return null
  const fullName = [user.Prenom, user.Nom].filter(Boolean).join(" ").trim()
  return fullName || user.Login || null
}

export const GET = withAnyAuthorizationLogging(
  VIGILOG_ACCESS_CODES,
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url)
      const requestedStatus = searchParams.get("status")?.trim().toUpperCase() || null
      const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "50"), 1), 200)

      const where = requestedStatus && VIGILOG_STATUSES.includes(requestedStatus as (typeof VIGILOG_STATUSES)[number])
        ? { Statut: requestedStatus }
        : undefined

      const [tournees, pendingCount, alarmCount] = await Promise.all([
        prisma.t_vigilog_tournee.findMany({
          where,
          orderBy: [{ Date_Heure_Depart: "desc" }],
          take: limit,
          select: {
            Id_VigiLog_Tournee: true,
            Reference_Tournee: true,
            Id_VigiLog_Configuration: true,
            Id_VigiLog: true,
            Nom_Configuration: true,
            Numero_Serie_VigiLog: true,
            Statut: true,
            Resultat_Feu: true,
            Date_Heure_Depart: true,
            Date_Heure_Arrivee: true,
            Consigne: true,
            Limite_Basse_Active: true,
            Limite_Basse: true,
            Limite_Haute_Active: true,
            Limite_Haute: true,
            Frequence_Min: true,
            Retard_Alarme_Min: true,
            Delai_Demarrage_Min: true,
            Autorise_Arret_Bouton_Stop: true,
            Reinitialise_Avec_Bouton_Start: true,
            Nb_Mesures: true,
            Temperature_Min: true,
            Temperature_Moyenne: true,
            Temperature_Max: true,
            Duree_Hors_Limites_Secondes: true,
            Duree_Alarme_Secondes: true,
            Est_Depassement_Limites: true,
            Est_Alarme: true,
            Est_Acquittee: true,
            Commentaire: true,
            Commentaire_Acquittement: true,
            Date_Heure_Acquittement: true,
            Date_Heure_Creation: true,
            Date_Heure_Maj: true,
            t_site_t_vigilog_tournee_Id_Site_DepartTot_site: {
              select: { Id_Site: true, Code_Site: true, Libelle_Site: true },
            },
            t_site_t_vigilog_tournee_Id_Site_ArriveeTot_site: {
              select: { Id_Site: true, Code_Site: true, Libelle_Site: true },
            },
            t_utilisateur_t_vigilog_tournee_Id_Utilisateur_DepartTot_utilisateur: {
              select: { Id_Utilisateur: true, Login: true, Prenom: true, Nom: true },
            },
            t_utilisateur_t_vigilog_tournee_Id_Utilisateur_ArriveeTot_utilisateur: {
              select: { Id_Utilisateur: true, Login: true, Prenom: true, Nom: true },
            },
            t_utilisateur_t_vigilog_tournee_Id_Utilisateur_AcquittementTot_utilisateur: {
              select: { Id_Utilisateur: true, Login: true, Prenom: true, Nom: true },
            },
            t_vigilog_configuration: {
              select: { Id_VigiLog_Configuration: true, Nom_Configuration: true, Actif: true },
            },
          },
        }),
        prisma.t_vigilog_tournee.count({ where: { Statut: "EN_ATTENTE_RECEPTION" } }),
        prisma.t_vigilog_tournee.count({ where: { Est_Alarme: true, Est_Acquittee: false } }),
      ])

      return apiOk({
        stats: {
          pendingCount,
          activeAlarmCount: alarmCount,
          totalCount: tournees.length,
        },
        tournees: tournees.map((tournee) => ({
          id: tournee.Id_VigiLog_Tournee,
          reference: tournee.Reference_Tournee,
          configurationId: tournee.Id_VigiLog_Configuration,
          loggerId: tournee.Id_VigiLog,
          configurationName: tournee.Nom_Configuration,
          loggerSerial: tournee.Numero_Serie_VigiLog,
          status: tournee.Statut,
          trafficLight: tournee.Resultat_Feu,
          departureAt: tournee.Date_Heure_Depart,
          arrivalAt: tournee.Date_Heure_Arrivee,
          target: tournee.Consigne ? Number(tournee.Consigne) : null,
          lowLimitActive: tournee.Limite_Basse_Active,
          lowLimit: tournee.Limite_Basse ? Number(tournee.Limite_Basse) : null,
          highLimitActive: tournee.Limite_Haute_Active,
          highLimit: tournee.Limite_Haute ? Number(tournee.Limite_Haute) : null,
          frequencyMinutes: tournee.Frequence_Min,
          alarmDelayMinutes: tournee.Retard_Alarme_Min,
          startDelayMinutes: tournee.Delai_Demarrage_Min,
          stopButtonEnabled: tournee.Autorise_Arret_Bouton_Stop,
          resetWithStartEnabled: tournee.Reinitialise_Avec_Bouton_Start,
          measurementCount: tournee.Nb_Mesures,
          temperatureMin: tournee.Temperature_Min ? Number(tournee.Temperature_Min) : null,
          temperatureAverage: tournee.Temperature_Moyenne ? Number(tournee.Temperature_Moyenne) : null,
          temperatureMax: tournee.Temperature_Max ? Number(tournee.Temperature_Max) : null,
          outOfLimitDurationSeconds: tournee.Duree_Hors_Limites_Secondes,
          alarmDurationSeconds: tournee.Duree_Alarme_Secondes,
          hasExcursion: tournee.Est_Depassement_Limites,
          hasAlarm: tournee.Est_Alarme,
          acknowledged: tournee.Est_Acquittee,
          comment: tournee.Commentaire,
          acknowledgeComment: tournee.Commentaire_Acquittement,
          acknowledgedAt: tournee.Date_Heure_Acquittement,
          createdAt: tournee.Date_Heure_Creation,
          updatedAt: tournee.Date_Heure_Maj,
          departureSite: {
            id: tournee.t_site_t_vigilog_tournee_Id_Site_DepartTot_site.Id_Site,
            name: formatSiteName(tournee.t_site_t_vigilog_tournee_Id_Site_DepartTot_site),
          },
          arrivalSite: {
            id: tournee.t_site_t_vigilog_tournee_Id_Site_ArriveeTot_site.Id_Site,
            name: formatSiteName(tournee.t_site_t_vigilog_tournee_Id_Site_ArriveeTot_site),
          },
          departureUser: formatUserLabel(
            tournee.t_utilisateur_t_vigilog_tournee_Id_Utilisateur_DepartTot_utilisateur,
          ),
          arrivalUser: formatUserLabel(
            tournee.t_utilisateur_t_vigilog_tournee_Id_Utilisateur_ArriveeTot_utilisateur,
          ),
          acknowledgedBy: formatUserLabel(
            tournee.t_utilisateur_t_vigilog_tournee_Id_Utilisateur_AcquittementTot_utilisateur,
          ),
          configurationActive: tournee.t_vigilog_configuration?.Actif ?? null,
        })),
      })
    } catch (error) {
      log.error("services/vigilog/tournees", "vigilog_tournees_fetch_failed", { error })
      return apiError(500, "vigilog_tournees_fetch_failed", "Erreur lors du chargement des tournees VigiLog")
    }
  },
)

export const POST = withAnyAuthorizationLogging(
  VIGILOG_ACCESS_CODES,
  async (req: NextRequest, ctx: HandlerContext) => {
    try {
      const body = await req.json()
      const parsed = vigilogDepartureSchema.safeParse(body)
      if (!parsed.success) {
        return apiError(400, "validation_error", "Tournée VigiLog invalide", {
          issues: parsed.error.issues,
        })
      }

      const configuration = await prisma.t_vigilog_configuration.findUnique({
        where: { Id_VigiLog_Configuration: parsed.data.Id_VigiLog_Configuration },
      })
      if (!configuration || !configuration.Actif) {
        return apiError(404, "configuration_not_found", "Configuration VigiLog introuvable ou inactive")
      }

      const linkedLogger = await prisma.t_vigilog.findUnique({
        where: { Numero_Serie: parsed.data.Numero_Serie_VigiLog.trim() },
        select: { Id_VigiLog: true, Actif: true },
      })

      const reference = buildVigilogReference(ctx.user.userId)
      const departureDate = new Date()

      const tournee = await prisma.t_vigilog_tournee.create({
        data: {
          Reference_Tournee: reference,
          Id_VigiLog_Configuration: configuration.Id_VigiLog_Configuration,
          Id_VigiLog:
            parsed.data.Id_VigiLog ??
            (linkedLogger?.Actif ? linkedLogger.Id_VigiLog : null),
          Nom_Configuration: configuration.Nom_Configuration,
          Id_Site_Depart: parsed.data.Id_Site_Depart,
          Id_Site_Arrivee: parsed.data.Id_Site_Arrivee,
          Numero_Serie_VigiLog: parsed.data.Numero_Serie_VigiLog.trim(),
          Statut: "EN_ATTENTE_RECEPTION",
          Resultat_Feu: null,
          Id_Utilisateur_Depart: ctx.user.userId,
          Date_Heure_Depart: departureDate,
          Consigne: configuration.Consigne,
          Limite_Basse_Active: configuration.Limite_Basse_Active,
          Limite_Basse: configuration.Limite_Basse,
          Limite_Haute_Active: configuration.Limite_Haute_Active,
          Limite_Haute: configuration.Limite_Haute,
          Frequence_Min: configuration.Frequence_Min,
          Retard_Alarme_Min: configuration.Retard_Alarme_Min,
          Delai_Demarrage_Min: configuration.Delai_Demarrage_Min,
          Autorise_Arret_Bouton_Stop: configuration.Autorise_Arret_Bouton_Stop,
          Reinitialise_Avec_Bouton_Start: configuration.Reinitialise_Avec_Bouton_Start,
          Commentaire: normalizeOptionalText(parsed.data.Commentaire),
          Date_Heure_Creation: departureDate,
          Date_Heure_Maj: departureDate,
        },
      })

      log.data.create(
        "Tournee VigiLog",
        tournee.Id_VigiLog_Tournee,
        ctx.user.username,
        ctx.user.userId,
        getClientIp(req),
        {
          reference,
          configurationId: configuration.Id_VigiLog_Configuration,
          loggerSerial: tournee.Numero_Serie_VigiLog,
          departureSiteId: parsed.data.Id_Site_Depart,
          arrivalSiteId: parsed.data.Id_Site_Arrivee,
        },
      )

      return apiOk(
        {
          id: tournee.Id_VigiLog_Tournee,
          reference,
          status: tournee.Statut,
        },
        { status: 201 },
      )
    } catch (error) {
      log.error("services/vigilog/tournees", "vigilog_tournee_create_failed", { error })
      return apiError(500, "vigilog_tournee_create_failed", "Erreur lors de la creation de la tournee VigiLog")
    }
  },
)
