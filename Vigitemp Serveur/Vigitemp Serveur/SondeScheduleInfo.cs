using System;

namespace Vigitemp_Serveur
{
    internal sealed class SondeScheduleInfo
    {
        public int IdLieu { get; set; }
        public string PortSerie { get; set; }
        public string ModuleNumeroSerie { get; set; }
        public string SondeNumeroSerie { get; set; }
        public string AdresseSonde { get; set; }
        public int FrequenceSecondes { get; set; }
        public DateTime? DerniereDateHeure { get; set; }
        public bool InfosModifiees { get; set; }
    }
}
