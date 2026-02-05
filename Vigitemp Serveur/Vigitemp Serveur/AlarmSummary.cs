using System;

namespace Vigitemp_Serveur
{
    internal sealed class AlarmSummary
    {
        public int IdAlarme { get; }
        public string Type { get; }
        public DateTime? DateHeureDebut { get; }
        public DateTime? DateHeureDebutAlarmeVrai { get; }
        public DateTime? DateHeureDerniereMesure { get; }
        public double? Valeur { get; }
        public string Unite { get; }

        public AlarmSummary(
            int idAlarme,
            string type,
            DateTime? dateHeureDebut,
            DateTime? dateHeureDebutAlarmeVrai,
            DateTime? dateHeureDerniereMesure,
            double? valeur,
            string unite)
        {
            IdAlarme = idAlarme;
            Type = type;
            DateHeureDebut = dateHeureDebut;
            DateHeureDebutAlarmeVrai = dateHeureDebutAlarmeVrai;
            DateHeureDerniereMesure = dateHeureDerniereMesure;
            Valeur = valeur;
            Unite = unite;
        }
    }
}
