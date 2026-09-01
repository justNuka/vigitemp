using System;

namespace Vigitemp_Serveur
{
    internal sealed class GspRecoverySpan
    {
        public int Id { get; set; }
        public int IdLieu { get; set; }
        public string Serial { get; set; }
        public DateTime RecoverFromProbeDateTime { get; set; }
        public DateTime RecoverUntilProbeDateTime { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int AttemptCount { get; set; }
        public string LastError { get; set; }
    }
}
