using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;

namespace Vigitemp_Serveur.sensors
{
    internal static class GspProtocol
    {
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
                string.Format(
                    CultureInfo.InvariantCulture,
                    "{0:00},{1:00},{2:00},{3:00},{4:00},{5:00},",
                    now.Year % 100,
                    now.Month,
                    now.Day,
                    now.Hour,
                    now.Minute,
                    now.Second)));

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
                commands.Add(new KeyValuePair<string, string>(
                    "ECON",
                    string.Format(
                        CultureInfo.InvariantCulture,
                        "{0}h{1}l{2}f{3}d",
                        FormatNumericPayload(highLimit ?? 0d),
                        FormatNumericPayload(lowLimit ?? 0d),
                        Math.Max(1, frequencySeconds),
                        Math.Max(0, alarmDelayMinutes))));
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

            var trimmed = serialNumber.Trim();
            return trimmed.StartsWith("GSP", StringComparison.OrdinalIgnoreCase) && trimmed.Length > 3
                ? trimmed.Substring(3)
                : trimmed;
        }

        internal static IEnumerable<string> BuildCandidateCommands(string command)
        {
            var baseCommand = command ?? string.Empty;
            yield return baseCommand;

            if (!baseCommand.EndsWith(" ", StringComparison.Ordinal))
            {
                yield return baseCommand + " ";
            }
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

        internal static bool TryExtractTemperature(string response, string target, out double temperature)
        {
            temperature = 0d;
            if (string.IsNullOrWhiteSpace(response) || string.IsNullOrWhiteSpace(target))
            {
                return false;
            }

            var pattern = @"RTEMP" + Regex.Escape(target.Trim()) + @"\s*:\s*(-?\d+(?:[.,]\d+)?)";
            var matches = Regex.Matches(response, pattern, RegexOptions.IgnoreCase);
            for (var i = matches.Count - 1; i >= 0; i--)
            {
                var candidate = matches[i].Groups[1].Value.Replace(',', '.');
                if (!double.TryParse(candidate, NumberStyles.Float | NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out var parsed))
                {
                    continue;
                }

                temperature = parsed;
                return true;
            }

            return false;
        }

        internal static List<string> ExtractDetectedSerials(string response)
        {
            if (string.IsNullOrWhiteSpace(response))
            {
                return new List<string>();
            }

            return Regex.Matches(response, @"(?:R?TEMP|FTEM|DCAL|DETA|DCON|MEMO|DD/H)(N\d+)", RegexOptions.IgnoreCase)
                .Cast<Match>()
                .Where(match => match.Success && match.Groups.Count >= 2)
                .Select(match => (match.Groups[1].Value ?? string.Empty).Trim().ToUpperInvariant())
                .Where(serial => !string.IsNullOrWhiteSpace(serial))
                .Distinct()
                .ToList();
        }

        internal static string FormatNumericPayload(double value)
        {
            return value.ToString("0.###", CultureInfo.InvariantCulture);
        }
    }
}
