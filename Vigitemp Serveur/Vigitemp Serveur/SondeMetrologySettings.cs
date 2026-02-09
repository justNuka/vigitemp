namespace Vigitemp_Serveur
{
    internal sealed class SondeMetrologySettings
    {
        public double? Offset { get; set; }
        public bool HasAjustage { get; set; }
        public double CoeffX { get; set; } = 1d;
        public double CoeffConstant { get; set; } = 0d;
    }
}
