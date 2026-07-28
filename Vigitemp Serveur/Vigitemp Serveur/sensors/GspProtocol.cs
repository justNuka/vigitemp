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
        public string Unit { get; set; }
        public int? BatteryPercent { get; set; }
        public int? Rssi { get; set; }
        public bool? IsOnBatteryPower { get; set; }
        public bool IsMaintenanceMode { get; set; }
        public string AlarmStateRaw { get; set; }
    }

    internal sealed class GspConfigurationResponse
    {
        public string Serial { get; set; }
        public double? HighLimit { get; set; }
        public double? LowLimit { get; set; }
        public int? FrequencyMinutes { get; set; }
        public int? AlarmDelayLowMinutes { get; set; }
        public int? AlarmDelayHighMinutes { get; set; }
        public List<string> MissingConfigurationCodes { get; } = new List<string>();
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
                alarmSettings == null ? 0 : Math.Max(0, alarmSettings.RetardAlarmeBasMinutes),
                alarmSettings == null ? 0 : Math.Max(0, alarmSettings.RetardAlarmeHautMinutes),
                frequencySeconds);
        }

        internal static List<KeyValuePair<string, string>> BuildConfigurationCommands(
            string channel,
            SondeMetrologySettings metrology,
            double? highLimit,
            double? lowLimit,
            int alarmDelayLowMinutes,
            int alarmDelayHighMinutes,
            int frequencySeconds)
        {
            var commands = new List<KeyValuePair<string, string>>();

            var now = DateTime.Now;
            commands.Add(new KeyValuePair<string, string>(
                "ED-H",
                BuildDateTimePayload(now)));

            if (metrology != null)
            {
                // For GSP probes, metrology is pushed into the probe itself.
                // The local sensor offset is an additive correction, so it is folded into ECAL's B coefficient.
                var effectiveCoeffConstant = metrology.CoeffConstant + (metrology.Offset ?? 0d);
                commands.Add(new KeyValuePair<string, string>(
                    "ECAL",
                    string.Format(
                        CultureInfo.InvariantCulture,
                        "{0}a{1}b",
                        FormatNumericPayload(metrology.CoeffX),
                        FormatNumericPayload(effectiveCoeffConstant))));

                if (metrology.ErrJustesse.HasValue)
                {
                    commands.Add(new KeyValuePair<string, string>(
                        "EETA",
                        FormatNumericPayload(metrology.ErrJustesse.Value) + "c"));
                }
            }

            if (highLimit.HasValue || lowLimit.HasValue || frequencySeconds > 0 || alarmDelayLowMinutes > 0 || alarmDelayHighMinutes > 0)
            {
                var payload = string.Format(
                    CultureInfo.InvariantCulture,
                    "{0}h{1}l{2}f",
                    FormatNumericPayload(highLimit ?? 0d),
                    FormatNumericPayload(lowLimit ?? 0d),
                    Math.Max(1, (int)Math.Round(Math.Max(1, frequencySeconds) / 60d, MidpointRounding.AwayFromZero)));

                if (alarmDelayLowMinutes > 0 || alarmDelayHighMinutes > 0)
                {
                    payload += string.Format(
                        CultureInfo.InvariantCulture,
                        "{0}r{1}t",
                        Math.Max(0, alarmDelayLowMinutes),
                        Math.Max(0, alarmDelayHighMinutes));
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

            // New GSP serials are the protocol target as-is, for example SPPS-26000001
            // and SPNB-26000001. Only keep the old generic GSPxxxx compatibility path.
            if (Regex.IsMatch(trimmed, @"^SP[A-Z0-9]{2}-\d+$", RegexOptions.IgnoreCase))
            {
                return trimmed;
            }

            if (trimmed.StartsWith("GSP", StringComparison.OrdinalIgnoreCase) && trimmed.Length > 3)
            {
                return trimmed.Substring(3);
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

            yield return baseCommand;
        }

        internal static string BuildCommand(string prefix, string target, string payload)
        {
            var normalizedPrefix = (prefix ?? string.Empty).Trim();
            var normalizedTarget = (target ?? string.Empty).Trim();
            var normalizedPayload = (payload ?? string.Empty).Trim();

            if (normalizedPayload.Length == 0)
            {
                return normalizedPrefix + normalizedTarget + " ";
            }

            return normalizedPrefix + normalizedTarget + " " + normalizedPayload;
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
            return TryExtractTemperature(response, target, out temperature, out _);
        }

        internal static bool TryExtractTemperature(string response, string target, out double temperature, out string unit)
        {
            temperature = 0d;
            unit = "C";
            if (!TryParseTemperatureResponse(response, target, out var parsed) || !parsed.Temperature.HasValue)
            {
                return false;
            }

            temperature = parsed.Temperature.Value;
            unit = string.IsNullOrWhiteSpace(parsed.Unit) ? "C" : parsed.Unit;
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

            var measuredValue = TryExtractTemperatureValue(response, normalizedTarget, out var measuredUnit);
            var result = new GspTemperatureResponse
            {
                Serial = !string.IsNullOrWhiteSpace(extractedSerial)
                    ? extractedSerial.Trim().ToUpperInvariant()
                    : ExtractDetectedSerials(response).FirstOrDefault(),
                ProbeDateTime = TryExtractProbeDateTime(response),
                Temperature = measuredValue,
                Unit = measuredUnit,
                BatteryPercent = TryExtractIntLineValue(response, "Batterie"),
                Rssi = TryExtractIntLineValue(response, "RSSI"),
                AlarmStateRaw = TryExtractLineValue(response, "Alarm"),
            };

            result.IsOnBatteryPower = TryExtractPowerState(result.AlarmStateRaw);
            result.IsMaintenanceMode = ContainsAlarmToken(result.AlarmStateRaw, "M");

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

            var hasMemoAck = Regex.IsMatch(response, @"(?:^|\r?\n)\s*ACK\s*=\s*MEMO\s*(?:\r?\n|$)", RegexOptions.IgnoreCase);
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
                @"^[ \t]*(\d+)\|(\d{2}/\d{2}/\d{4}[ \t]+\d{2}:\d{2}:\d{2})=(-?\d+(?:[.,]\d+)?)[ \t]*\r?$",
                RegexOptions.IgnoreCase | RegexOptions.Multiline))
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

                // Reject corrupted physical values before they can reach the database.
                if (double.IsNaN(temperature) || double.IsInfinity(temperature) || Math.Abs(temperature) > 1000d)
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

            if (!hasMemoAck && result.Measurements.Count == 0)
            {
                return false;
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

        internal static bool TryParseConfigurationResponse(string response, string target, out GspConfigurationResponse parsed)
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

            var result = new GspConfigurationResponse
            {
                Serial = !string.IsNullOrWhiteSpace(extractedSerial)
                    ? extractedSerial.Trim().ToUpperInvariant()
                    : ExtractDetectedSerials(response).FirstOrDefault(),
                HighLimit = TryExtractDoubleLineValue(response, "LimiteHaute")
                    ?? TryExtractDoubleLineValue(response, "ConsigneSup")
                    ?? TryExtractDoubleLineValue(response, "High")
                    ?? TryExtractCompactNumeric(response, 'h'),
                LowLimit = TryExtractDoubleLineValue(response, "LimiteBasse")
                    ?? TryExtractDoubleLineValue(response, "ConsigneInf")
                    ?? TryExtractDoubleLineValue(response, "Low")
                    ?? TryExtractCompactNumeric(response, 'l'),
                FrequencyMinutes = TryExtractRoundedIntLineValue(response, "Frequence")
                    ?? TryExtractRoundedIntLineValue(response, "FrequenceMinutes")
                    ?? TryExtractCompactInt(response, 'f'),
                AlarmDelayLowMinutes = TryExtractRoundedIntLineValue(response, "RetardBas")
                    ?? TryExtractRoundedIntLineValue(response, "RetardAlarmeBas")
                    ?? TryExtractRoundedIntLineValue(response, "RetardAlarmeBasMinutes")
                    ?? TryExtractCompactInt(response, 'r')
                    ?? TryExtractRoundedIntLineValue(response, "Retard")
                    ?? TryExtractRoundedIntLineValue(response, "RetardAlarme")
                    ?? TryExtractRoundedIntLineValue(response, "RetardAlarmeMinutes")
                    ?? TryExtractCompactInt(response, 'd'),
                AlarmDelayHighMinutes = TryExtractRoundedIntLineValue(response, "RetardHaut")
                    ?? TryExtractRoundedIntLineValue(response, "RetardAlarmeHaut")
                    ?? TryExtractRoundedIntLineValue(response, "RetardAlarmeHautMinutes")
                    ?? TryExtractCompactInt(response, 't')
                    ?? TryExtractRoundedIntLineValue(response, "Retard")
                    ?? TryExtractRoundedIntLineValue(response, "RetardAlarme")
                    ?? TryExtractRoundedIntLineValue(response, "RetardAlarmeMinutes")
                    ?? TryExtractCompactInt(response, 'd'),
            };

            foreach (var code in ExtractMissingConfigurationCodes(response))
            {
                result.MissingConfigurationCodes.Add(code);
            }

            if (!result.HighLimit.HasValue &&
                !result.LowLimit.HasValue &&
                !result.FrequencyMinutes.HasValue &&
                !result.AlarmDelayLowMinutes.HasValue &&
                !result.AlarmDelayHighMinutes.HasValue &&
                result.MissingConfigurationCodes.Count == 0)
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

            return Regex.Matches(response, @"(?:R?TEMP|R?FTEM|FTEM|DCAL|DETA|DCON|ECAL|EETA|ECON|ED-H|MEMO|DD-H)((?:SP[A-Z0-9]{2}-\d+)|[PN]\d+)", RegexOptions.IgnoreCase)
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

        internal static bool IsAcknowledgementForTarget(string response, string commandPrefix, string target)
        {
            if (string.IsNullOrWhiteSpace(response) ||
                string.IsNullOrWhiteSpace(commandPrefix) ||
                string.IsNullOrWhiteSpace(target))
            {
                return false;
            }

            var normalizedPrefix = commandPrefix.Trim().ToUpperInvariant();
            var normalizedTarget = target.Trim().ToUpperInvariant();
            if (!Regex.IsMatch(response, @"(?:^|\r?\n)\s*ACK\s*=\s*" + Regex.Escape(normalizedPrefix) + @"\b", RegexOptions.IgnoreCase))
            {
                return false;
            }

            var detectedSerials = ExtractDetectedSerials(response);
            return detectedSerials.Any(serial => string.Equals(serial, normalizedTarget, StringComparison.OrdinalIgnoreCase));
        }

        internal static bool ContainsForeignSerial(string response, string target)
        {
            if (string.IsNullOrWhiteSpace(response) || string.IsNullOrWhiteSpace(target))
            {
                return false;
            }

            var normalizedTarget = target.Trim().ToUpperInvariant();
            var detectedSerials = ExtractDetectedSerials(response);
            return detectedSerials.Count > 0 &&
                !detectedSerials.Any(serial => string.Equals(serial, normalizedTarget, StringComparison.OrdinalIgnoreCase));
        }

        internal static string FormatNumericPayload(double value)
        {
            return value.ToString("0.######", CultureInfo.InvariantCulture);
        }

        private static double? TryExtractTemperatureValue(string response, string normalizedTarget, out string unit)
        {
            unit = "C";
            foreach (var definition in new[]
            {
                new { Pattern = @"R?TEMP" + Regex.Escape(normalizedTarget) + @"\s*:\s*(-?\d+(?:[.,]\d+)?)", Unit = "C" },
                new { Pattern = @"R?FTEM" + Regex.Escape(normalizedTarget) + @"\s*:\s*(-?\d+(?:[.,]\d+)?)", Unit = "C" },
                new { Pattern = @"ACK\s*:\s*R?FTEM" + Regex.Escape(normalizedTarget) + @"\s*:\s*(-?\d+(?:[.,]\d+)?)", Unit = "C" },
                new { Pattern = @"(?:^|\r?\n)\s*Temperature\s*=\s*(-?\d+(?:[.,]\d+)?)", Unit = "C" },
                new { Pattern = @"(?:^|\r?\n)\s*Mesure\s*=\s*(-?\d+(?:[.,]\d+)?)", Unit = "C" },
                new { Pattern = @"(?:^|\r?\n)\s*Humidite\s*=\s*(-?\d+(?:[.,]\d+)?)", Unit = "%" },
                new { Pattern = @"(?:^|\r?\n)\s*Humidité\s*=\s*(-?\d+(?:[.,]\d+)?)", Unit = "%" },
                new { Pattern = @"(?:^|\r?\n)\s*Humidity\s*=\s*(-?\d+(?:[.,]\d+)?)", Unit = "%" }
            })
            {
                var matches = Regex.Matches(response, definition.Pattern, RegexOptions.IgnoreCase);
                for (var i = matches.Count - 1; i >= 0; i--)
                {
                    var candidate = matches[i].Groups[1].Value.Replace(',', '.');
                    if (double.TryParse(candidate, NumberStyles.Float | NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out var parsed))
                    {
                        unit = definition.Unit;
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

        private static int? TryExtractRoundedIntLineValue(string response, string key)
        {
            var value = TryExtractDoubleLineValue(response, key);
            return value.HasValue
                ? (int?)Math.Max(0, (int)Math.Round(value.Value, MidpointRounding.AwayFromZero))
                : null;
        }

        private static double? TryExtractDoubleLineValue(string response, string key)
        {
            var raw = TryExtractLineValue(response, key);
            if (string.IsNullOrWhiteSpace(raw))
            {
                return null;
            }

            return double.TryParse(
                raw.Trim().Replace(',', '.'),
                NumberStyles.Float | NumberStyles.AllowLeadingSign,
                CultureInfo.InvariantCulture,
                out var parsed)
                ? (double?)parsed
                : null;
        }

        private static double? TryExtractCompactNumeric(string response, char suffix)
        {
            if (string.IsNullOrWhiteSpace(response))
            {
                return null;
            }

            var pattern = @"(-?\d+(?:[.,]\d+)?)" + Regex.Escape(suffix.ToString());
            var matches = Regex.Matches(response, pattern, RegexOptions.IgnoreCase);
            for (var i = matches.Count - 1; i >= 0; i--)
            {
                var candidate = matches[i].Groups[1].Value.Replace(',', '.');
                if (double.TryParse(candidate, NumberStyles.Float | NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out var parsed))
                {
                    return parsed;
                }
            }

            return null;
        }

        private static int? TryExtractCompactInt(string response, char suffix)
        {
            var value = TryExtractCompactNumeric(response, suffix);
            return value.HasValue
                ? (int?)Math.Max(0, (int)Math.Round(value.Value, MidpointRounding.AwayFromZero))
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

        private static IEnumerable<string> ExtractMissingConfigurationCodes(string response)
        {
            if (string.IsNullOrWhiteSpace(response))
            {
                yield break;
            }

            var rawCodes =
                TryExtractLineValue(response, "EEPROM")
                ?? TryExtractLineValue(response, "ConfigMissing")
                ?? TryExtractLineValue(response, "ConfigurationMissing")
                ?? TryExtractLineValue(response, "Missing")
                ?? TryExtractLineValue(response, "MissingConfig")
                ?? TryExtractLineValue(response, "ParametresManquants")
                ?? TryExtractLineValue(response, "ParamètresManquants")
                ?? TryExtractLineValue(response, "ErreurEEPROM")
                ?? TryExtractLineValue(response, "EepromError");

            if (string.IsNullOrWhiteSpace(rawCodes))
            {
                yield break;
            }

            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var token in rawCodes
                .Split(new[] { '+', ',', ';', '|', ' ' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(part => (part ?? string.Empty).Trim().ToUpperInvariant()))
            {
                if (!IsKnownMissingConfigurationCode(token) || !seen.Add(token))
                {
                    continue;
                }

                yield return token;
            }
        }

        private static bool IsKnownMissingConfigurationCode(string code)
        {
            switch ((code ?? string.Empty).Trim().ToUpperInvariant())
            {
                case "A":
                case "B":
                case "E":
                case "LH":
                case "LB":
                case "RB":
                case "RH":
                    return true;
                default:
                    return false;
            }
        }

        private static bool? TryExtractPowerState(string rawAlarmState)
        {
            if (string.IsNullOrWhiteSpace(rawAlarmState))
            {
                return null;
            }

            var tokens = rawAlarmState
                .Split(new[] { '+', ',', ';', '|', ' ' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(token => (token ?? string.Empty).Trim().ToUpperInvariant())
                .Where(token => !string.IsNullOrWhiteSpace(token))
                .ToList();

            if (tokens.Count == 0)
            {
                return null;
            }

            // Compatibilite ancien/nouveau firmware:
            // - ancien: BAT/B/ON_BATTERY...
            // - nouveau: S = secteur/defaut alimentation
            if (tokens.Any(token =>
                token == "S" ||
                token == "BAT" ||
                token == "SUR_BATTERIE" ||
                token == "ON_BATTERY" ||
                token == "BATTERY"))
            {
                return true;
            }

            if (tokens.Any(token =>
                token == "NONE" ||
                token == "NORMAL" ||
                token == "N" ||
                token == "OK" ||
                token == "AUCUNE" ||
                token == "NO"))
            {
                return false;
            }

            switch (rawAlarmState.Trim().ToUpperInvariant())
            {
                case "NONE":
                case "NORMAL":
                case "N":
                case "OK":
                case "AUCUNE":
                case "NO":
                    return false;
                default:
                    return null;
            }
        }

        private static bool ContainsAlarmToken(string rawAlarmState, string expectedToken)
        {
            if (string.IsNullOrWhiteSpace(rawAlarmState) || string.IsNullOrWhiteSpace(expectedToken))
            {
                return false;
            }

            return rawAlarmState
                .Split(new[] { '+', ',', ';', '|', ' ' }, StringSplitOptions.RemoveEmptyEntries)
                .Any(token => string.Equals(
                    (token ?? string.Empty).Trim(),
                    expectedToken.Trim(),
                    StringComparison.OrdinalIgnoreCase));
        }
    }
}
