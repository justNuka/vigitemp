using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO.Ports;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Vigitemp_Serveur.sensors
{
    class SensorGSP : Sensor
    {
        private const int ReadTimeoutMs = 1500;
        private const int InterCommandDelayMs = 150;
        private readonly int _frequencySeconds;
        private readonly bool _synchronizeConfiguration;
        private readonly string _commandTarget;

        public SensorGSP(
            ThreadServeur p_ths,
            string p_comPort,
            string p_sondeSerialNumber,
            string p_sondeAdresse,
            int frequencySeconds = 0,
            bool synchronizeConfiguration = false) : base(p_ths, p_comPort, p_sondeSerialNumber, p_sondeAdresse)
        {
            _frequencySeconds = Math.Max(0, frequencySeconds);
            _synchronizeConfiguration = synchronizeConfiguration;
            _commandTarget = BuildCommandTarget(p_sondeSerialNumber);
            m_port.NewLine = "\r\n";
        }

        protected override bool ShouldApplyMetrology => false;

        public bool ConfigurationSynchronized { get; private set; }

        public override async Task<bool> read()
        {
            try
            {
                pendingResults = true;
                m_port.Open();
                m_port.DiscardInBuffer();
                m_port.DiscardOutBuffer();
                VigitempServeur.Log($"[SONDE][OPEN] type=GSP serial={m_sondeSerialNumber} port={m_comPort} adresse={m_sondeAdresse} target={_commandTarget}");

                if (_synchronizeConfiguration)
                {
                    ConfigurationSynchronized = await TrySynchronizeConfigurationAsync();
                }

                string response = await SendRequestAndReadAsync("TEMP", allowEmptyResponse: false);
                if (string.IsNullOrWhiteSpace(response))
                {
                    VigitempServeur.Log($"[SONDE][WARN] type=GSP serial={m_sondeSerialNumber} no response on TEMP, retrying with FTEM");
                    response = await SendRequestAndReadAsync("FTEM", allowEmptyResponse: false);
                }

                if (string.IsNullOrWhiteSpace(response))
                {
                    VigitempServeur.Log($"[SONDE][DONE] type=GSP serial={m_sondeSerialNumber} port={m_comPort} status=timeout");
                    HandleNoResponseAlarm(false, "timeout");
                    return false;
                }

                if (!TryExtractTemperature(response, out var rawValue))
                {
                    VigitempServeur.Log($"[SONDE][ERR] type=GSP serial={m_sondeSerialNumber} port={m_comPort} parse=temperature rawResponse={response}");
                    HandleNoResponseAlarm(false, "parse");
                    return false;
                }

                var measuredValue = RoundMeasure(ApplyMetrology(rawValue));
                ths.GetDatabase().AddMesure(m_sondeSerialNumber, measuredValue, "°C", ToInvariantRaw(rawValue));
                VigitempServeur.Log($"[SONDE][DONE] type=GSP serial={m_sondeSerialNumber} port={m_comPort} status=success value={measuredValue.ToString(CultureInfo.InvariantCulture)} unit=°C raw={ToInvariantRaw(rawValue)}");
                HandleNoResponseAlarm(true);
                compareMeasuresAndLimits(measuredValue, "°C");
                return true;
            }
            catch (Exception ex)
            {
                VigitempServeur.Log($"[SONDE][ERR] type=GSP serial={m_sondeSerialNumber} port={m_comPort} error={ex}");
                HandleNoResponseAlarm(false, "exception");
                return false;
            }
            finally
            {
                pendingResults = false;
                if (m_port.IsOpen)
                {
                    m_port.Close();
                }

                VigitempServeur.Log($"[SONDE][CLOSE] type=GSP serial={m_sondeSerialNumber} port={m_comPort}");
            }
        }

        protected override void DataReceivedHandler(object sender, SerialDataReceivedEventArgs e)
        {
            // GSP is polled synchronously for now to keep command/response logging deterministic.
        }

        private async Task<bool> TrySynchronizeConfigurationAsync()
        {
            try
            {
                var metrology = ths.GetSondeMetrologyCached(m_sondeSerialNumber);
                var alarmSettings = ths.GetLieuAlarmSettingsCached(m_idLieu);
                if (alarmSettings == null)
                {
                    VigitempServeur.Log($"[SONDE][CFG] type=GSP serial={m_sondeSerialNumber} skip=no-lieu-settings");
                    return false;
                }

                var commands = BuildConfigurationCommands(metrology, alarmSettings);
                if (commands.Count == 0)
                {
                    VigitempServeur.Log($"[SONDE][CFG] type=GSP serial={m_sondeSerialNumber} skip=no-command");
                    return false;
                }

                foreach (var command in commands)
                {
                    await SendRequestAndReadAsync(command.Key, command.Value, allowEmptyResponse: true);
                }

                VigitempServeur.Log($"[SONDE][CFG] type=GSP serial={m_sondeSerialNumber} status=sent commands={commands.Count}");
                return true;
            }
            catch (Exception ex)
            {
                VigitempServeur.Log($"[SONDE][CFG] type=GSP serial={m_sondeSerialNumber} status=error error={ex}");
                return false;
            }
        }

        private List<KeyValuePair<string, string>> BuildConfigurationCommands(
            SondeMetrologySettings metrology,
            LieuAlarmSettings alarmSettings)
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

            var high = alarmSettings.ConsigneSup ?? 0d;
            var low = alarmSettings.ConsigneInf ?? 0d;
            var delay = Math.Max(0, Math.Max(alarmSettings.RetardAlarmeBasMinutes, alarmSettings.RetardAlarmeHautMinutes));
            commands.Add(new KeyValuePair<string, string>(
                "ECON",
                string.Format(
                    CultureInfo.InvariantCulture,
                    "{0}h{1}l{2}f{3}d",
                    FormatNumericPayload(high),
                    FormatNumericPayload(low),
                    Math.Max(1, _frequencySeconds),
                    delay)));

            if (!string.IsNullOrWhiteSpace(m_sondeAdresse))
            {
                commands.Add(new KeyValuePair<string, string>(
                    "CHAN",
                    m_sondeAdresse.Trim() + "n"));
            }

            return commands;
        }

        private async Task<string> SendRequestAndReadAsync(string commandPrefix, bool allowEmptyResponse)
        {
            return await SendRequestAndReadAsync(commandPrefix, string.Empty, allowEmptyResponse);
        }

        private async Task<string> SendRequestAndReadAsync(string commandPrefix, string payload, bool allowEmptyResponse)
        {
            var command = commandPrefix + _commandTarget + payload;
            foreach (var candidate in BuildCandidateCommands(command))
            {
                m_port.DiscardInBuffer();
                m_port.DiscardOutBuffer();
                VigitempServeur.Log($"[SONDE][TX] type=GSP serial={m_sondeSerialNumber} port={m_comPort} cmd={EscapeForLog(candidate)}");
                m_port.Write(candidate);

                var response = await ReadResponseAsync();
                if (!string.IsNullOrWhiteSpace(response))
                {
                    VigitempServeur.Log($"[SONDE][RX] type=GSP serial={m_sondeSerialNumber} port={m_comPort} raw={response}");
                    return response;
                }

                if (allowEmptyResponse)
                {
                    VigitempServeur.Log($"[SONDE][RX] type=GSP serial={m_sondeSerialNumber} port={m_comPort} raw=<empty>");
                    return string.Empty;
                }
            }

            return string.Empty;
        }

        private async Task<string> ReadResponseAsync()
        {
            var startedAt = DateTime.UtcNow;
            var buffer = string.Empty;
            while ((DateTime.UtcNow - startedAt).TotalMilliseconds < ReadTimeoutMs)
            {
                await Task.Delay(50);

                var chunk = m_port.ReadExisting();
                if (string.IsNullOrEmpty(chunk))
                {
                    continue;
                }

                buffer += chunk;
                if (buffer.Contains("\n") || buffer.Contains("\r"))
                {
                    return buffer.Trim();
                }
            }

            return buffer.Trim();
        }

        private static IEnumerable<string> BuildCandidateCommands(string command)
        {
            yield return command;
            yield return command + "\r\n";
            yield return command + "\n";
        }

        private static string BuildCommandTarget(string serialNumber)
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

        private static bool TryExtractTemperature(string response, out double temperature)
        {
            temperature = 0d;
            if (string.IsNullOrWhiteSpace(response))
            {
                return false;
            }

            var matches = Regex.Matches(response, @"-?\d+(?:[.,]\d+)?");
            for (var i = matches.Count - 1; i >= 0; i--)
            {
                var candidate = matches[i].Value.Replace(',', '.');
                if (!double.TryParse(candidate, NumberStyles.Float | NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out var parsed))
                {
                    continue;
                }

                if (Math.Abs(parsed) > 500)
                {
                    continue;
                }

                temperature = parsed;
                return true;
            }

            return false;
        }

        private static string FormatNumericPayload(double value)
        {
            return value.ToString("0.###", CultureInfo.InvariantCulture);
        }

        private static string EscapeForLog(string value)
        {
            return value
                .Replace("\r", "\\r")
                .Replace("\n", "\\n");
        }
    }
}
