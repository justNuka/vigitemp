import { NextRequest } from "next/server"

import { apiError, apiOk } from "@/lib/api-response"
import { withAnyAuthorizationLogging } from "@/lib/api-wrappers"
import { log } from "@/lib/logger"
import { prisma, prismaMesure } from "@/lib/prisma"
import { VIGILOG_ACCESS_CODES } from "../../_shared"

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
  async (_req: NextRequest, _ctx, routeContext: { params: Promise<{ id: string }> }) => {
    try {
      const { id } = await routeContext.params
      const tourneeId = Number(id)
      if (!Number.isInteger(tourneeId) || tourneeId <= 0) {
        return apiError(400, "invalid_id", "Identifiant de tournee invalide")
      }

      const [tournee, measures] = await Promise.all([
        prisma.t_vigilog_tournee.findUnique({
          where: { Id_VigiLog_Tournee: tourneeId },
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
              select: { Login: true, Prenom: true, Nom: true },
            },
            t_utilisateur_t_vigilog_tournee_Id_Utilisateur_ArriveeTot_utilisateur: {
              select: { Login: true, Prenom: true, Nom: true },
            },
            t_utilisateur_t_vigilog_tournee_Id_Utilisateur_AcquittementTot_utilisateur: {
              select: { Login: true, Prenom: true, Nom: true },
            },
            t_vigilog_configuration: {
              select: { Actif: true },
            },
          },
        }),
        prismaMesure.tm_vigilog_mesure.findMany({
          where: { Id_VigiLog_Tournee: tourneeId },
          orderBy: [{ Date_Heure_Mesure: "asc" }, { Numero_Ordre: "asc" }],
        }),
      ])

      if (!tournee) {
        return apiError(404, "not_found", "Tournee VigiLog introuvable")
      }

      return apiOk({
        tournee: {
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
        },
        measures: measures.map((measure) => ({
          id: measure.Id_VigiLog_Mesure,
          order: measure.Numero_Ordre,
          measuredAt: measure.Date_Heure_Mesure,
          value: measure.Valeur ? Number(measure.Valeur) : null,
          outOfLimit: measure.Est_Hors_Limites,
          inAlarm: measure.Est_En_Alarme,
          marker: measure.Est_Marqueur,
          details: measure.Details,
          importedAt: measure.Date_Heure_Import,
        })),
      })
    } catch (error) {
      log.error("services/vigilog/tournees/[id]", "vigilog_tournee_detail_fetch_failed", { error })
      return apiError(500, "vigilog_tournee_detail_fetch_failed", "Erreur lors du chargement de la tournee VigiLog")
    }
  },
)
