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
        private const int BufferDrainMs = 400;
        private const int EndOfResponseSilenceMs = 500;
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
            _commandTarget = GspProtocol.NormalizeCommandTarget(p_sondeSerialNumber);
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
                    VigitempServeur.Log($"[SONDE][WARN] type=GSP serial={m_sondeSerialNumber} no response on TEMP, retrying TEMP after 5s");
                    await Task.Delay(5000);
                    response = await SendRequestAndReadAsync("TEMP", allowEmptyResponse: false);
                }

                if (string.IsNullOrWhiteSpace(response))
                {
                    VigitempServeur.Log($"[SONDE][WARN] type=GSP serial={m_sondeSerialNumber} no response on TEMP after retry, retrying with FTEM");
                    response = await SendRequestAndReadAsync("FTEM", allowEmptyResponse: false);
                }

                if (string.IsNullOrWhiteSpace(response))
                {
                    VigitempServeur.Log($"[SONDE][DONE] type=GSP serial={m_sondeSerialNumber} port={m_comPort} status=timeout");
                    HandleNoResponseAlarm(false, "timeout");
                    return false;
                }

                var detectedSerials = GspProtocol.ExtractDetectedSerials(response);
                VigitempServeur.Log($"[SONDE][INFO] type=GSP serial={m_sondeSerialNumber} port={m_comPort} detectedSerials={(detectedSerials.Count == 0 ? "<none>" : string.Join(",", detectedSerials))}");

                if (!GspProtocol.TryExtractTemperature(response, _commandTarget, out var rawValue))
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
            return GspProtocol.BuildConfigurationCommands(
                channel: null,
                metrology: metrology,
                alarmSettings: alarmSettings,
                frequencySeconds: _frequencySeconds);
        }

        private async Task<string> SendRequestAndReadAsync(string commandPrefix, bool allowEmptyResponse)
        {
            return await SendRequestAndReadAsync(commandPrefix, string.Empty, allowEmptyResponse);
        }

        private async Task<string> SendRequestAndReadAsync(string commandPrefix, string payload, bool allowEmptyResponse)
        {
            var command = GspProtocol.BuildCommand(commandPrefix, _commandTarget, payload);
            foreach (var candidate in GspProtocol.BuildCandidateCommands(command))
            {
                var drained = await DrainBufferedDataAsync();
                if (!string.IsNullOrWhiteSpace(drained))
                {
                    VigitempServeur.Log($"[SONDE][DRAIN] type=GSP serial={m_sondeSerialNumber} port={m_comPort} raw={drained}");
                }

                m_port.DiscardInBuffer();
                m_port.DiscardOutBuffer();
                VigitempServeur.Log($"[SONDE][TX] type=GSP serial={m_sondeSerialNumber} port={m_comPort} cmd={EscapeForLog(candidate)}");
                m_port.Write(candidate);
                await Task.Delay(InterCommandDelayMs);

                var response = await ReadResponseAsync();
                if (!string.IsNullOrWhiteSpace(response))
                {
                    VigitempServeur.Log($"[SONDE][RX] type=GSP serial={m_sondeSerialNumber} port={m_comPort} raw={response}");
                    return response;
                }

                VigitempServeur.Log($"[SONDE][RX] type=GSP serial={m_sondeSerialNumber} port={m_comPort} raw=<empty>");

                if (allowEmptyResponse)
                {
                    return string.Empty;
                }
            }

            VigitempServeur.Log($"[SONDE][RX] type=GSP serial={m_sondeSerialNumber} port={m_comPort} raw=<timeout>");
            return string.Empty;
        }

        private async Task<string> ReadResponseAsync()
        {
            var startedAt = DateTime.UtcNow;
            var buffer = string.Empty;
            DateTime? lastDataAt = null;
            while ((DateTime.UtcNow - startedAt).TotalMilliseconds < ReadTimeoutMs)
            {
                await Task.Delay(50);

                var chunk = m_port.ReadExisting();
                if (string.IsNullOrEmpty(chunk))
                {
                    if (lastDataAt.HasValue && (DateTime.UtcNow - lastDataAt.Value).TotalMilliseconds >= EndOfResponseSilenceMs)
                    {
                        break;
                    }
                    continue;
                }

                buffer += chunk;
                lastDataAt = DateTime.UtcNow;
            }

            return buffer.Trim();
        }

        private async Task<string> DrainBufferedDataAsync()
        {
            var startedAt = DateTime.UtcNow;
            var buffer = string.Empty;
            DateTime? lastDataAt = null;

            while ((DateTime.UtcNow - startedAt).TotalMilliseconds < BufferDrainMs)
            {
                await Task.Delay(25);
                var chunk = m_port.ReadExisting();
                if (string.IsNullOrEmpty(chunk))
                {
                    if (lastDataAt.HasValue && (DateTime.UtcNow - lastDataAt.Value).TotalMilliseconds >= 100)
                    {
                        break;
                    }
                    continue;
                }

                buffer += chunk;
                lastDataAt = DateTime.UtcNow;
            }

            return buffer.Trim();
        }

        private static string EscapeForLog(string value)
        {
            return value
                .Replace("\r", "\\r")
                .Replace("\n", "\\n");
        }
    }
}
