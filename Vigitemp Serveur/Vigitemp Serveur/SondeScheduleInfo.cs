using System;

namespace Vigitemp_Serveur
{
    internal sealed class SondeScheduleInfo
    {
        public int IdLieu { get; set; }
        public int? EmtChoixMode { get; set; }
        public bool ApplyCorrectionEj { get; set; }
        public string PortSerie { get; set; }
        public string ModuleNumeroSerie { get; set; }
        public int? ModuleType { get; set; }
        public int? ManualWorkerId { get; set; }
        public string SondeNumeroSerie { get; set; }
        public string SondeType { get; set; }
        public string FamilleSonde { get; set; }
        public string AdresseSonde { get; set; }
        public int FrequenceSecondes { get; set; }
        public DateTime? DerniereDateHeure { get; set; }
        public bool InfosModifiees { get; set; }
        public bool GspRecoveryPending { get; set; }
        public bool ConfigurationOnly { get; set; }
        public double? SondeOffset { get; set; }
        public bool HasAjustage { get; set; }
        public double CoeffX { get; set; } = 1d;
        public double CoeffConstant { get; set; } = 0d;

        public bool HasEtalonnage { get; set; }
        public double? ErrJustesse { get; set; }
        public double? CorrectionJustesse { get; set; }
        public double? Incertitude { get; set; }
        public DateTime? DateValiditeEtalonnage { get; set; }
    }
}
