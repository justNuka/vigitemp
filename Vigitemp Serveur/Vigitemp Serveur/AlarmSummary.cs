using System;

namespace Vigitemp_Serveur
{
    internal sealed class AlarmSummary
    {
        public int IdAlarme { get; }
        public string Type { get; }
        public DateTime? DateHeureDebut { get; }
        public DateTime? DateHeureDerniereMesure { get; }
        public double? Valeur { get; }
        public string Unite { get; }

        public AlarmSummary(
            int idAlarme,
            string type,
            DateTime? dateHeureDebut,
            DateTime? dateHeureDerniereMesure,
            double? valeur,
            string unite)
        {
            IdAlarme = idAlarme;
            Type = type;
            DateHeureDebut = dateHeureDebut;
            DateHeureDerniereMesure = dateHeureDerniereMesure;
            Valeur = valeur;
            Unite = unite;
        }
    }
}
