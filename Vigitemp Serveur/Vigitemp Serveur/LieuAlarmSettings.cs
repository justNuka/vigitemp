using System;

namespace Vigitemp_Serveur
{
    internal sealed class LieuAlarmSettings
    {
        public int IdLieu { get; }

        public double? ConsigneInf { get; }
        public double? ConsigneSup { get; }
        public bool ConsigneInfActive { get; }
        public bool ConsigneSupActive { get; }

        public double? ConsigneInfPreAlarme { get; }
        public bool ConsigneInfPreAlarmeActive { get; }
        public double? ConsigneSupPreAlarme { get; }
        public bool ConsigneSupPreAlarmeActive { get; }

        public double? SeuilCritiqueBas { get; }
        public bool SeuilCritiqueBasActive { get; }
        public double? SeuilCritiqueHaut { get; }
        public bool SeuilCritiqueHautActive { get; }

        // En base/UI, les retards d'alarme sont en minutes.
        public int RetardAlarmeBasMinutes { get; }
        public int RetardAlarmeHautMinutes { get; }
        public int RetardNonReponseMinutes { get; }
        public int RetardAlarmeChangementConsigneMinutes { get; }
        public int NbMesuresTemporisationRedeclenchement { get; }

        // Legacy fields (if present in schema)
        public bool NotificationActive { get; }
        public DateTime DateHeureReactivationAlarme { get; }
        public DateTime PlanningDerniereMaj { get; }
        public DateTime DateHeureDerniereReponse { get; }
        public DateTime DateHeureDerniereReponseRecueOk { get; }

        public LieuAlarmSettings(
            int idLieu,
            double? consigneInf,
            double? consigneSup,
            bool consigneInfActive,
            bool consigneSupActive,
            double? consigneInfPreAlarme,
            bool consigneInfPreAlarmeActive,
            double? consigneSupPreAlarme,
            bool consigneSupPreAlarmeActive,
            int retardAlarmeBasMinutes,
            int retardAlarmeHautMinutes,
            int retardNonReponseMinutes,
            int retardAlarmeChangementConsigneMinutes,
            int nbMesuresTemporisationRedeclenchement,
            bool notificationActive,
            DateTime dateHeureReactivationAlarme,
            DateTime planningDerniereMaj,
            DateTime dateHeureDerniereReponse = default(DateTime),
            DateTime dateHeureDerniereReponseRecueOk = default(DateTime),
            double? seuilCritiqueBas = null,
            bool seuilCritiqueBasActive = false,
            double? seuilCritiqueHaut = null,
            bool seuilCritiqueHautActive = false)
        {
            IdLieu = idLieu;
            ConsigneInf = consigneInf;
            ConsigneSup = consigneSup;
            ConsigneInfActive = consigneInfActive;
            ConsigneSupActive = consigneSupActive;
            ConsigneInfPreAlarme = consigneInfPreAlarme;
            ConsigneInfPreAlarmeActive = consigneInfPreAlarmeActive;
            ConsigneSupPreAlarme = consigneSupPreAlarme;
            ConsigneSupPreAlarmeActive = consigneSupPreAlarmeActive;
            SeuilCritiqueBas = seuilCritiqueBas;
            SeuilCritiqueBasActive = seuilCritiqueBasActive;
            SeuilCritiqueHaut = seuilCritiqueHaut;
            SeuilCritiqueHautActive = seuilCritiqueHautActive;
            RetardAlarmeBasMinutes = retardAlarmeBasMinutes;
            RetardAlarmeHautMinutes = retardAlarmeHautMinutes;
            RetardNonReponseMinutes = retardNonReponseMinutes;
            RetardAlarmeChangementConsigneMinutes = Math.Max(0, retardAlarmeChangementConsigneMinutes);
            NbMesuresTemporisationRedeclenchement = Math.Max(0, nbMesuresTemporisationRedeclenchement);
            NotificationActive = notificationActive;
            DateHeureReactivationAlarme = dateHeureReactivationAlarme;
            PlanningDerniereMaj = planningDerniereMaj;
            DateHeureDerniereReponse = dateHeureDerniereReponse;
            DateHeureDerniereReponseRecueOk = dateHeureDerniereReponseRecueOk;
        }
    }
}

