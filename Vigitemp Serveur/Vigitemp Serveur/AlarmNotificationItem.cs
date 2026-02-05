using System;

namespace Vigitemp_Serveur
{
    internal sealed class AlarmNotificationItem
    {
        public int IdAlarme { get; }
        public int IdLieu { get; }
        public string Type { get; }
        public double? Valeur { get; }
        public string Unite { get; }
        public DateTime? DateHeureDebut { get; }

        public AlarmNotificationItem(
            int idAlarme,
            int idLieu,
            string type,
            double? valeur,
            string unite,
            DateTime? dateHeureDebut)
        {
            IdAlarme = idAlarme;
            IdLieu = idLieu;
            Type = type;
            Valeur = valeur;
            Unite = unite;
            DateHeureDebut = dateHeureDebut;
        }
    }
}
