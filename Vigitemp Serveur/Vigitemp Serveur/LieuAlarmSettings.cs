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

        // En base/UI, les retards d'alarme sont en minutes.
        public int RetardAlarmeBasMinutes { get; }
        public int RetardAlarmeHautMinutes { get; }
        public int RetardNonReponseMinutes { get; }
        public int NbMesuresTemporisationRedeclenchement { get; }

        // Legacy fields (if present in schema)
        public bool NotificationActive { get; }
        public DateTime DateHeureReactivationAlarme { get; }

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
            int nbMesuresTemporisationRedeclenchement,
            bool notificationActive,
            DateTime dateHeureReactivationAlarme)
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
            RetardAlarmeBasMinutes = retardAlarmeBasMinutes;
            RetardAlarmeHautMinutes = retardAlarmeHautMinutes;
            RetardNonReponseMinutes = retardNonReponseMinutes;
            NbMesuresTemporisationRedeclenchement = Math.Max(0, nbMesuresTemporisationRedeclenchement);
            NotificationActive = notificationActive;
            DateHeureReactivationAlarme = dateHeureReactivationAlarme;
        }
    }
}

