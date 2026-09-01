using System;
using System.Text;

namespace VigitempAgent
{
    internal static class TextEncodingHelper
    {
        private static readonly Encoding Latin1 = Encoding.GetEncoding(28591);

        public static string NormalizeDisplayText(string value)
        {
            if (string.IsNullOrEmpty(value))
            {
                return value;
            }

            var trimmed = value.Trim();
            if (!LooksLikeUtf8Mojibake(trimmed))
            {
                return value;
            }

            try
            {
                var bytes = Latin1.GetBytes(trimmed);
                var repaired = Encoding.UTF8.GetString(bytes);
                if (string.IsNullOrWhiteSpace(repaired))
                {
                    return value;
                }

                return repaired;
            }
            catch
            {
                return value;
            }
        }

        private static bool LooksLikeUtf8Mojibake(string value)
        {
            return value.IndexOf('Ã') >= 0 ||
                   value.IndexOf('Â') >= 0 ||
                   value.IndexOf('â') >= 0 ||
                   value.IndexOf('\uFFFD') >= 0;
        }
    }
}
