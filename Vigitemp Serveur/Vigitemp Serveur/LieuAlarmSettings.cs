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

        // In database/UI this is in minutes ("mn").
        public int RetardAlarmeBasMinutes { get; }
        public int RetardAlarmeHautMinutes { get; }

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
            NotificationActive = notificationActive;
            DateHeureReactivationAlarme = dateHeureReactivationAlarme;
        }
    }
}

