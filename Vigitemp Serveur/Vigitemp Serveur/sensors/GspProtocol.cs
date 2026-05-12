using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;

namespace Vigitemp_Serveur.sensors
{
    internal sealed class GspTemperatureResponse
    {
        public string Serial { get; set; }
        public DateTime? ProbeDateTime { get; set; }
        public double? Temperature { get; set; }
        public int? BatteryPercent { get; set; }
        public int? Rssi { get; set; }
    }


    internal sealed class GspMemoMeasurement
    {
        public int Index { get; set; }
        public DateTime? ProbeDateTime { get; set; }
        public double? Temperature { get; set; }
    }

    internal sealed class GspMemoResponse
    {
        public string Serial { get; set; }
        public int? Offset { get; set; }
        public int? ReturnedCount { get; set; }
        public List<GspMemoMeasurement> Measurements { get; } = new List<GspMemoMeasurement>();
    }

    internal static class GspProtocol
    {
        private static readonly string[] GspTypePrefixes =
        {
            "SPNB", "SPNG", "SPPS", "SPAL", "SPPC", "SPAU", "SPCF", "SPMI",
            "SPCO", "SPHY", "SPTH", "SPDI", "SPAT", "SPLU", "SP01", "SP42",
            "SPOF", "SPXB", "SPXG", "SPXP", "SPFB", "SPFG", "SPFP", "GSP",
        };

        internal static List<KeyValuePair<string, string>> BuildConfigurationCommands(
            string channel,
            SondeMetrologySettings metrology,
            LieuAlarmSettings alarmSettings,
            int frequencySeconds)
        {
            return BuildConfigurationCommands(
                channel,
                metrology,
                alarmSettings?.ConsigneSup,
                alarmSettings?.ConsigneInf,
                alarmSettings == null ? 0 : Math.Max(0, Math.Max(alarmSettings.RetardAlarmeBasMinutes, alarmSettings.RetardAlarmeHautMinutes)),
                frequencySeconds);
        }

        internal static List<KeyValuePair<string, string>> BuildConfigurationCommands(
            string channel,
            SondeMetrologySettings metrology,
            double? highLimit,
            double? lowLimit,
            int alarmDelayMinutes,
            int frequencySeconds)
        {
            var commands = new List<KeyValuePair<string, string>>();

            var now = DateTime.Now;
            commands.Add(new KeyValuePair<string, string>(
                "ED-H",
                BuildDateTimePayload(now)));

            if (metrology != null)
            {
                commands.Add(new KeyValuePair<string, string>(
                    "ECAL",
                    string.Format(
                        CultureInfo.InvariantCulture,
                        "{0}a{1}b",
                        FormatNumericPayload(metrology.CoeffX),
                        FormatNumericPayload(metrology.CoeffConstant))));

                if (metrology.ErrJustesse.HasValue)
                {
                    commands.Add(new KeyValuePair<string, string>(
                        "EETA",
                        FormatNumericPayload(metrology.ErrJustesse.Value) + "c"));
                }
            }

            if (highLimit.HasValue || lowLimit.HasValue || frequencySeconds > 0 || alarmDelayMinutes > 0)
            {
                var payload = string.Format(
                    CultureInfo.InvariantCulture,
                    "{0}h{1}l{2}f",
                    FormatNumericPayload(highLimit ?? 0d),
                    FormatNumericPayload(lowLimit ?? 0d),
                    Math.Max(1, (int)Math.Round(Math.Max(1, frequencySeconds) / 60d, MidpointRounding.AwayFromZero)));

                if (alarmDelayMinutes > 0)
                {
                    payload += string.Format(CultureInfo.InvariantCulture, "{0}d", Math.Max(0, alarmDelayMinutes));
                }

                commands.Add(new KeyValuePair<string, string>(
                    "ECON",
                    payload));
            }

            if (!string.IsNullOrWhiteSpace(channel))
            {
                commands.Add(new KeyValuePair<string, string>("CHAN", channel.Trim() + "n"));
            }

            return commands;
        }

        internal static string NormalizeCommandTarget(string serialNumber)
        {
            if (string.IsNullOrWhiteSpace(serialNumber))
            {
                return string.Empty;
            }

            var trimmed = serialNumber.Trim().ToUpperInvariant();
            foreach (var prefix in GspTypePrefixes.OrderByDescending(item => item.Length))
            {
                if (trimmed.StartsWith(prefix, StringComparison.OrdinalIgnoreCase) && trimmed.Length > prefix.Length)
                {
                    return trimmed.Substring(prefix.Length);
                }
            }

            return trimmed;
        }

        internal static bool IsGspSerial(string serialNumber)
        {
            if (string.IsNullOrWhiteSpace(serialNumber))
            {
                return false;
            }

            var trimmed = serialNumber.Trim().ToUpperInvariant();
            return GspTypePrefixes.Any(prefix => trimmed.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
        }

        internal static IEnumerable<string> BuildCandidateCommands(string command)
        {
            var baseCommand = command ?? string.Empty;
            if (string.IsNullOrWhiteSpace(baseCommand))
            {
                yield return string.Empty;
                yield break;
            }

            yield return baseCommand.Contains(" ") || baseCommand.EndsWith(" ", StringComparison.Ordinal)
                ? baseCommand
                : baseCommand + " ";
        }

        internal static string BuildCommand(string prefix, string target, string payload)
        {
            var normalizedPrefix = (prefix ?? string.Empty).Trim();
            var normalizedTarget = target ?? string.Empty;
            var normalizedPayload = payload ?? string.Empty;

            return string.IsNullOrWhiteSpace(normalizedPayload)
                ? normalizedPrefix + normalizedTarget
                : normalizedPrefix + normalizedTarget + " " + normalizedPayload.Trim();
        }

        internal static string BuildDateTimePayload(DateTime value)
        {
            return string.Format(
                CultureInfo.InvariantCulture,
                "{0:00},{1:00},{2:00},{3:00},{4:00},{5:00},",
                value.Year % 100,
                value.Month,
                value.Day,
                value.Hour,
                value.Minute,
                value.Second);
        }

        internal static bool TryExtractTemperature(string response, string target, out double temperature)
        {
            temperature = 0d;
            if (!TryParseTemperatureResponse(response, target, out var parsed) || !parsed.Temperature.HasValue)
            {
                return false;
            }

            temperature = parsed.Temperature.Value;
            return true;
        }

        internal static bool TryParseTemperatureResponse(string response, string target, out GspTemperatureResponse parsed)
        {
            parsed = null;
            if (string.IsNullOrWhiteSpace(response) || string.IsNullOrWhiteSpace(target))
            {
                return false;
            }

            var normalizedTarget = target.Trim().ToUpperInvariant();
            var extractedSerial = TryExtractLineValue(response, "Serial");
            if (!string.IsNullOrWhiteSpace(extractedSerial)
                && !string.Equals(extractedSerial.Trim(), normalizedTarget, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            var result = new GspTemperatureResponse
            {
                Serial = !string.IsNullOrWhiteSpace(extractedSerial)
                    ? extractedSerial.Trim().ToUpperInvariant()
                    : ExtractDetectedSerials(response).FirstOrDefault(),
                ProbeDateTime = TryExtractProbeDateTime(response),
                Temperature = TryExtractTemperatureValue(response, normalizedTarget),
                BatteryPercent = TryExtractIntLineValue(response, "Batterie"),
                Rssi = TryExtractIntLineValue(response, "RSSI"),
            };

            if (!result.Temperature.HasValue)
            {
                return false;
            }

            parsed = result;
            return true;
        }

        internal static bool TryParseMemoResponse(string response, string target, out GspMemoResponse parsed)
        {
            parsed = null;
            if (string.IsNullOrWhiteSpace(response) || string.IsNullOrWhiteSpace(target))
            {
                return false;
            }

            var normalizedTarget = target.Trim().ToUpperInvariant();
            var extractedSerial = TryExtractLineValue(response, "Serial");
            if (!string.IsNullOrWhiteSpace(extractedSerial)
                && !string.Equals(extractedSerial.Trim(), normalizedTarget, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            var result = new GspMemoResponse
            {
                Serial = !string.IsNullOrWhiteSpace(extractedSerial)
                    ? extractedSerial.Trim().ToUpperInvariant()
                    : ExtractDetectedSerials(response).FirstOrDefault(),
                Offset = TryExtractIntLineValue(response, "Offset"),
                ReturnedCount = TryExtractIntLineValue(response, "NombreMesure"),
            };

            foreach (Match match in Regex.Matches(
                response,
                @"(?:^|\r?\n)\s*(\d+)\|(\d{2}/\d{2}/\d{4}\s+\d{2}:\d{2}:\d{2})=(-?\d+(?:[.,]\d+)?)",
                RegexOptions.IgnoreCase))
            {
                if (!match.Success || match.Groups.Count < 4)
                {
                    continue;
                }

                if (!int.TryParse(match.Groups[1].Value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var index))
                {
                    continue;
                }

                DateTime? probeDateTime = null;
                if (DateTime.TryParseExact(
                    match.Groups[2].Value.Trim(),
                    "dd/MM/yyyy HH:mm:ss",
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out var parsedDateTime))
                {
                    probeDateTime = parsedDateTime;
                }

                if (!double.TryParse(
                    match.Groups[3].Value.Replace(',', '.'),
                    NumberStyles.Float | NumberStyles.AllowLeadingSign,
                    CultureInfo.InvariantCulture,
                    out var temperature))
                {
                    continue;
                }

                result.Measurements.Add(new GspMemoMeasurement
                {
                    Index = index,
                    ProbeDateTime = probeDateTime,
                    Temperature = temperature,
                });
            }

            if (!result.ReturnedCount.HasValue)
            {
                result.ReturnedCount = result.Measurements.Count;
            }

            if (result.Measurements.Count == 0 && !result.ReturnedCount.HasValue)
            {
                return false;
            }

            parsed = result;
            return true;
        }

        internal static List<string> ExtractDetectedSerials(string response)
        {
            if (string.IsNullOrWhiteSpace(response))
            {
                return new List<string>();
            }

            return Regex.Matches(response, @"(?:R?TEMP|R?FTEM|FTEM|DCAL|DETA|DCON|ECAL|EETA|ECON|ED-H|MEMO|DD-H)(N\d+)", RegexOptions.IgnoreCase)
                .Cast<Match>()
                .Where(match => match.Success && match.Groups.Count >= 2)
                .Select(match => (match.Groups[1].Value ?? string.Empty).Trim().ToUpperInvariant())
                .Concat(
                    Regex.Matches(response, @"(?:^|\r?\n)\s*Serial\s*=\s*([A-Z0-9\-]+)\s*(?:\r?\n|$)", RegexOptions.IgnoreCase)
                        .Cast<Match>()
                        .Where(match => match.Success && match.Groups.Count >= 2)
                        .Select(match => (match.Groups[1].Value ?? string.Empty).Trim().ToUpperInvariant()))
                .Where(serial => !string.IsNullOrWhiteSpace(serial))
                .Distinct()
                .ToList();
        }

        internal static string FormatNumericPayload(double value)
        {
            return value.ToString("0.######", CultureInfo.InvariantCulture);
        }

        private static double? TryExtractTemperatureValue(string response, string normalizedTarget)
        {
            foreach (var pattern in new[]
            {
                @"R?TEMP" + Regex.Escape(normalizedTarget) + @"\s*:\s*(-?\d+(?:[.,]\d+)?)",
                @"R?FTEM" + Regex.Escape(normalizedTarget) + @"\s*:\s*(-?\d+(?:[.,]\d+)?)",
                @"ACK\s*:\s*R?FTEM" + Regex.Escape(normalizedTarget) + @"\s*:\s*(-?\d+(?:[.,]\d+)?)",
                @"(?:^|\r?\n)\s*Temperature\s*=\s*(-?\d+(?:[.,]\d+)?)"
            })
            {
                var matches = Regex.Matches(response, pattern, RegexOptions.IgnoreCase);
                for (var i = matches.Count - 1; i >= 0; i--)
                {
                    var candidate = matches[i].Groups[1].Value.Replace(',', '.');
                    if (double.TryParse(candidate, NumberStyles.Float | NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out var parsed))
                    {
                        return parsed;
                    }
                }
            }

            return null;
        }

        private static DateTime? TryExtractProbeDateTime(string response)
        {
            var raw = TryExtractLineValue(response, "DateHeure");
            if (string.IsNullOrWhiteSpace(raw))
            {
                var match = Regex.Match(response, @"DateHeure\s*=\s*(\d{2}/\d{2}/\d{4}\s+\d{2}:\d{2}:\d{2})", RegexOptions.IgnoreCase);
                raw = match.Success ? match.Groups[1].Value : null;
            }

            if (string.IsNullOrWhiteSpace(raw))
            {
                return null;
            }

            if (DateTime.TryParseExact(raw.Trim(), "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed))
            {
                return parsed;
            }

            return null;
        }

        private static int? TryExtractIntLineValue(string response, string key)
        {
            var raw = TryExtractLineValue(response, key);
            if (string.IsNullOrWhiteSpace(raw))
            {
                return null;
            }

            return int.TryParse(raw.Trim(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed)
                ? (int?)parsed
                : null;
        }

        private static string TryExtractLineValue(string response, string key)
        {
            var match = Regex.Match(
                response,
                @"(?:^|\r?\n)\s*" + Regex.Escape(key) + @"\s*=\s*([^\r\n]+)",
                RegexOptions.IgnoreCase);

            if (!match.Success || match.Groups.Count < 2)
            {
                return null;
            }

            return match.Groups[1].Value?.Trim();
        }
    }
}
