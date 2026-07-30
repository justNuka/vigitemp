using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.IO.Ports;
using System.Text;
using System.Threading.Tasks;

namespace Vigitemp_Serveur.sensors
{
    class SensorGSP : Sensor
    {
        private const int ReadTimeoutMs = 2000;
        private const int BufferDrainMs = 400;
        private const int PostCommandDrainMs = 1000;
        private const int PostCommandQuietMs = 250;
        private const int PostInterrogationDrainMs = 1000;
        private const int PostInterrogationQuietMs = 200;
        private const int ExtendedBufferDrainMs = 3000;
        private const int ExtendedBufferQuietMs = 750;
        private const int RepeatedDrainThreshold = 3;
        private const int RepeatedDrainWindowSeconds = 120;
        private const int PortPurgeCooldownSeconds = 60;
        private const int EndOfResponseSilenceMs = 500;
        private const int IncompleteResponseSilenceMs = 1200;
        private const int ResponseCompletionTimeoutMs = 4000;
        private const int AcknowledgedIncompleteResponseSilenceMs = 3500;
        private const int AcknowledgedResponseCompletionTimeoutMs = 8000;
        private const int ConfigurationResponseSilenceMs = 1200;
        private const int ConfigurationReadTimeoutMs = 10000;
        private const int InterCommandDelayMs = 150;
        private const int ClockCheckIntervalHours = 6;
        private const int ClockDriftWarningSeconds = 120;
        private const int ClockDriftCriticalSeconds = 600;
        private const int ClockDriftImmediateResyncSeconds = 3600;
        private const int ClockSyncCooldownMinutes = 30;
        private const int ClockSyncEmptyResponseRetryMinutes = 5;
        private const int DefaultBatteryNotifyPercent = 50;
        private const int DefaultBatteryEmailPercent = 25;
        private const int BatteryThresholdRefreshMinutes = 5;
        private static readonly ConcurrentDictionary<string, DrainState> DrainStateByPort =
            new ConcurrentDictionary<string, DrainState>(StringComparer.OrdinalIgnoreCase);
        private static readonly ConcurrentDictionary<string, DateTime> LastClockSyncAttemptUtcBySerial =
            new ConcurrentDictionary<string, DateTime>(StringComparer.OrdinalIgnoreCase);
        private static readonly ConcurrentDictionary<string, DateTime> LastSuccessfulProbeDateTimeBySerial =
            new ConcurrentDictionary<string, DateTime>(StringComparer.OrdinalIgnoreCase);

        private const int MemoBatchReadTimeoutMsShort = 10000;
        private const int MemoBatchReadTimeoutMsMedium = 30000;
        private const int MemoBatchReadTimeoutMsLarge = 120000;
        private const int MemoBatchReadTimeoutMsVeryLarge = 180000;
        private const int MemoBatchListenWindowMsShort = 1000;
        private const int MemoBatchListenWindowMsMedium = 5000;
        private const int MemoBatchListenWindowMsLarge = 15000;
        private const int MemoBatchListenWindowMsVeryLarge = 30000;

        private readonly int _frequencySeconds;
        private readonly bool _synchronizeConfiguration;
        private readonly string _commandTarget;
        private readonly bool _requestGraphDisplay;

        private int? _lastBatteryPercent;
        private int? _lastRssi;
        private DateTime? _lastDateTimeCheckUtc;
        private int _consecutiveTimeouts;
        private string _lastBatteryStatus;
        private int _batteryNotifyPercent = DefaultBatteryNotifyPercent;
        private int _batteryEmailPercent = DefaultBatteryEmailPercent;
        private DateTime? _lastBatteryThresholdRefreshUtc;
        private bool _maintenanceModeActive;

        private sealed class DrainState
        {
            public int Count;
            public DateTime WindowStartedUtc;
            public DateTime LastPurgeUtc;
        }

        public SensorGSP(
            ThreadServeur p_ths,
            string p_comPort,
            string p_sondeSerialNumber,
            string p_sondeAdresse,
            int frequencySeconds = 0,
            bool synchronizeConfiguration = false,
            bool requestGraphDisplay = false) : base(p_ths, p_comPort, p_sondeSerialNumber, p_sondeAdresse)
        {
            _frequencySeconds = Math.Max(0, frequencySeconds);
            _synchronizeConfiguration = synchronizeConfiguration;
            _requestGraphDisplay = requestGraphDisplay;
            _commandTarget = GspProtocol.NormalizeCommandTarget(string.IsNullOrWhiteSpace(p_sondeAdresse) ? p_sondeSerialNumber : p_sondeAdresse);
            m_port.ReadTimeout = ReadTimeoutMs;
        }

        protected override bool ShouldApplyMetrology => false;

        public bool ConfigurationSynchronized { get; private set; }
        public string LastFailureReason { get; private set; }
        public bool LastFailureLooksLikeModuleUnavailable =>
            string.Equals(LastFailureReason, "serial-semaphore-timeout", StringComparison.OrdinalIgnoreCase);

        public static void PrimeLastSuccessfulProbeDateTime(string serialNumber, DateTime probeDateTime)
        {
            var serialKey = string.IsNullOrWhiteSpace(serialNumber)
                ? string.Empty
                : serialNumber.Trim().ToUpperInvariant();
            if (string.IsNullOrWhiteSpace(serialKey))
            {
                return;
            }

            LastSuccessfulProbeDateTimeBySerial[serialKey] = probeDateTime;
        }

        public override async Task<bool> read()
        {
            return await ExecuteWithPortLockAsync(ReadCoreAsync);
        }

        public async Task<bool> SynchronizeConfigurationOnlyAsync(bool fullConfiguration)
        {
            if (VigitempServeur.InterrogationOnlyMode)
            {
                VigitempServeur.Log(
                    $"[SERVER][MODE] type=GSP serial={m_sondeSerialNumber} command=config status=blocked reason=interrogation-only");
                return false;
            }

            return await ExecuteWithPortLockAsync(async () =>
            {
                try
                {
                    pendingResults = true;
                    await OpenPortWithRetryAsync();
                    m_port.DiscardInBuffer();
                    m_port.DiscardOutBuffer();
                    VigitempServeur.Log($"[SONDE][CFG-JOB] type=GSP serial={m_sondeSerialNumber} port={m_comPort} status=port-open full={fullConfiguration}");

                    return fullConfiguration
                        ? await TrySynchronizeConfigurationAsync()
                        : await TryVerifyAndSynchronizeRuntimeConfigurationAsync();
                }
                finally
                {
                    pendingResults = false;
                    try
                    {
                        if (m_port != null && m_port.IsOpen)
                        {
                            m_port.Close();
                        }
                    }
                    catch
                    {
                        // The port may already be disposed after a low-level serial recovery.
                    }
                }
            });
        }

        private async Task<bool> ReadCoreAsync()
        {
            try
            {
                LastFailureReason = null;
                LastResponseReceivedAtLocal = null;
                pendingResults = true;
                await OpenPortWithRetryAsync();
                m_port.DiscardInBuffer();
                m_port.DiscardOutBuffer();
                VigitempServeur.LogDetailed($"[SONDE][OPEN] type=GSP serial={m_sondeSerialNumber} port={m_comPort} adresse={m_sondeAdresse} target={_commandTarget}");

                var tempPayload = _requestGraphDisplay ? "1g" : string.Empty;
                string response = await SendRequestAndReadAsync("TEMP", tempPayload, allowEmptyResponse: false);

                if (string.IsNullOrWhiteSpace(response))
                {
                    _consecutiveTimeouts++;
                    LastFailureReason = "timeout";
                    VigitempServeur.Log($"[SONDE][DONE] type=GSP serial={m_sondeSerialNumber} port={m_comPort} status=timeout consecutiveTimeouts={_consecutiveTimeouts}");
                    HandleCommunicationFailure("timeout");
                    return false;
                }

                var detectedSerials = GspProtocol.ExtractDetectedSerials(response);
                VigitempServeur.LogDetailed($"[SONDE][INFO] type=GSP serial={m_sondeSerialNumber} port={m_comPort} detectedSerials={(detectedSerials.Count == 0 ? "<none>" : string.Join(",", detectedSerials))}");

                if (!GspProtocol.TryParseTemperatureResponse(response, _commandTarget, out var parsed) || !parsed.Temperature.HasValue)
                {
                    _consecutiveTimeouts++;
                    LastFailureReason = "parse";
                    VigitempServeur.Log($"[SONDE][ERR] type=GSP serial={m_sondeSerialNumber} port={m_comPort} parse=temperature rawResponse={response}");
                    HandleCommunicationFailure("parse");
                    return false;
                }

                if (IsInvalidMeasurementPayload(parsed))
                {
                    _consecutiveTimeouts++;
                    LastFailureReason = "invalid-payload";
                    VigitempServeur.Log(
                        $"[SONDE][ERR] type=GSP serial={m_sondeSerialNumber} port={m_comPort} status=invalid-payload reason=zero-temperature temp={parsed.Temperature.Value.ToString(CultureInfo.InvariantCulture)} battery={(parsed.BatteryPercent.HasValue ? parsed.BatteryPercent.Value.ToString(CultureInfo.InvariantCulture) : "null")} rssi={(parsed.Rssi.HasValue ? parsed.Rssi.Value.ToString(CultureInfo.InvariantCulture) : "null")} rawResponse={TrimForLog(response)}");
                    VigitempServeur.Log($"[SONDE][DONE] type=GSP serial={m_sondeSerialNumber} port={m_comPort} status=invalid-payload consecutiveTimeouts={_consecutiveTimeouts}");
                    HandleCommunicationFailure("invalid-payload");
                    return false;
                }

                var probeResponseReceivedAtLocal = LastResponseReceivedAtLocal;
                var hadTimeoutBeforeSuccess = _consecutiveTimeouts > 0;
                _consecutiveTimeouts = 0;
                LastFailureReason = null;

                parsed = await CheckAndSynchronizeClockAsync(parsed, hadTimeoutBeforeSuccess);
                var maintenanceWasActive = _maintenanceModeActive;
                _maintenanceModeActive = parsed.IsMaintenanceMode;
                if (_maintenanceModeActive != maintenanceWasActive)
                {
                    VigitempServeur.Log(
                        $"[SONDE][MAINTENANCE] type=GSP serial={m_sondeSerialNumber} active={_maintenanceModeActive.ToString().ToLowerInvariant()}");
                }
                LogMeasurementGap(parsed);
                HandlePowerSupplyAlarm(parsed);
                LogBatteryHealth(parsed);
                LogSignalHealth(parsed);

                ConfigurationSynchronized = false;
                if (_synchronizeConfiguration)
                {
                    ConfigurationSynchronized = await TrySynchronizeConfigurationAsync();
                }

                var rawValue = parsed.Temperature.Value;
                var measuredValue = RoundMeasure(ApplyMetrology(rawValue));
                var unit = string.IsNullOrWhiteSpace(parsed.Unit) ? "C" : parsed.Unit;
                HandleNoResponseAlarm(true);
                if (!_maintenanceModeActive)
                {
                    compareMeasuresAndLimits(measuredValue, unit);
                }
                ths.GetDatabase().AddMesure(m_sondeSerialNumber, measuredValue, unit, ToInvariantRaw(rawValue), FormatRssi(parsed.Rssi));
                ths.GetDatabase().UpdateLieuWirelessMetrics(m_sondeSerialNumber, parsed.BatteryPercent, parsed.Rssi);
                LastResponseReceivedAtLocal = probeResponseReceivedAtLocal;
                VigitempServeur.Log($"[SONDE][DONE] type=GSP serial={m_sondeSerialNumber} port={m_comPort} status=success value={measuredValue.ToString(CultureInfo.InvariantCulture)} unit={unit} raw={ToInvariantRaw(rawValue)}");
                return true;
            }
            catch (IOException ex) when (IsSerialSemaphoreTimeout(ex))
            {
                _consecutiveTimeouts++;
                LastFailureReason = "serial-semaphore-timeout";
                VigitempServeur.Log($"[SONDE][PORT-RECOVER] type=GSP serial={m_sondeSerialNumber} port={m_comPort} reason=semaphore-timeout action=dispose-port error={ex.Message}");
                DisposePort();
                HandleCommunicationFailure("serial-semaphore-timeout");
                return false;
            }
            catch (Exception ex)
            {
                _consecutiveTimeouts++;
                LastFailureReason = "exception";
                VigitempServeur.Log($"[SONDE][ERR] type=GSP serial={m_sondeSerialNumber} port={m_comPort} error={ex}");
                HandleCommunicationFailure("exception");
                return false;
            }
            finally
            {
                pendingResults = false;
                try
                {
                    if (m_port != null && m_port.IsOpen)
                    {
                        await ClearPortAfterInterrogationAsync();
                        m_port.Close();
                    }
                }
                catch
                {
                    // The port may already be disposed after a low-level serial recovery.
                }

                await Task.Delay(200);

                VigitempServeur.LogDetailed($"[SONDE][CLOSE] type=GSP serial={m_sondeSerialNumber} port={m_comPort}");
            }
        }

        private void HandleCommunicationFailure(string reason)
        {
            if (_maintenanceModeActive)
            {
                VigitempServeur.Log(
                    $"[SONDE][MAINTENANCE] type=GSP serial={m_sondeSerialNumber} communicationFailure={reason} alarm=suppressed");
                return;
            }

            HandleNoResponseAlarm(false, reason, insertNullMeasureImmediately: true);
        }

        private static bool IsSerialSemaphoreTimeout(IOException ex)
        {
            var message = ex.Message ?? string.Empty;
            return message.IndexOf("semaphore", StringComparison.OrdinalIgnoreCase) >= 0
                || message.IndexOf("sémaphore", StringComparison.OrdinalIgnoreCase) >= 0;
        }

        protected override void DataReceivedHandler(object sender, SerialDataReceivedEventArgs e)
        {
            // GSP is polled synchronously for now to keep command/response logging deterministic.
        }

        private async Task OpenPortWithRetryAsync()
        {
            const int maxAttempts = 5;
            for (var attempt = 1; attempt <= maxAttempts; attempt++)
            {
                try
                {
                    m_port.Open();
                    return;
                }
                catch (UnauthorizedAccessException) when (attempt < maxAttempts)
                {
                    VigitempServeur.Log($"[SONDE][OPEN-RETRY] type=GSP serial={m_sondeSerialNumber} port={m_comPort} attempt={attempt}");
                    await Task.Delay(300 * attempt);
                }
            }
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

                var successCount = 0;
                foreach (var command in commands)
                {
                    var response = await SendRequestAndReadWithTimeoutAsync(command.Key, command.Value, allowEmptyResponse: true, ConfigurationResponseSilenceMs, ConfigurationReadTimeoutMs);
                    if (!GspProtocol.IsAcknowledgementForTarget(response, command.Key, _commandTarget))
                    {
                        VigitempServeur.Log(
                            $"[SONDE][CFG] type=GSP serial={m_sondeSerialNumber} command={command.Key} status=ack-mismatch response={(string.IsNullOrWhiteSpace(response) ? "<empty>" : TrimForLog(response))}");
                        continue;
                    }

                    successCount++;
                }

                var allCommandsSucceeded = successCount == commands.Count;
                VigitempServeur.Log(
                    $"[SONDE][CFG] type=GSP serial={m_sondeSerialNumber} status={(allCommandsSucceeded ? "sent" : "partial")} commands={commands.Count} success={successCount}");
                return allCommandsSucceeded;
            }
            catch (Exception ex)
            {
                VigitempServeur.Log($"[SONDE][CFG] type=GSP serial={m_sondeSerialNumber} status=error error={ex}");
                return false;
            }
        }

        private async Task<bool> TryVerifyAndSynchronizeRuntimeConfigurationAsync()
        {
            try
            {
                var metrology = ths.GetSondeMetrologyCached(m_sondeSerialNumber);
                var alarmSettings = ths.GetLieuAlarmSettingsCached(m_idLieu);
                if (alarmSettings == null)
                {
                    VigitempServeur.Log($"[SONDE][CFG-CHECK] type=GSP serial={m_sondeSerialNumber} skip=no-lieu-settings");
                    return false;
                }

                var response = await SendRequestAndReadWithTimeoutAsync("DCON", string.Empty, allowEmptyResponse: true, ConfigurationResponseSilenceMs, ConfigurationReadTimeoutMs);
                if (string.IsNullOrWhiteSpace(response))
                {
                    VigitempServeur.Log($"[SONDE][CFG-CHECK] type=GSP serial={m_sondeSerialNumber} status=no-response");
                    return false;
                }

                if (!GspProtocol.TryParseConfigurationResponse(response, _commandTarget, out var current))
                {
                    VigitempServeur.Log($"[SONDE][CFG-CHECK] type=GSP serial={m_sondeSerialNumber} status=parse-error raw={TrimForLog(response)}");
                    return false;
                }

                if (current.MissingConfigurationCodes.Count > 0)
                {
                    var codes = string.Join("+", current.MissingConfigurationCodes);
                    VigitempServeur.Log(
                        $"[SONDE][CFG-CHECK] type=GSP serial={m_sondeSerialNumber} status=eeprom-missing codes={codes} action=econ-sync");
                    return await SendExpectedConfigurationAsync(metrology, alarmSettings);
                }

                var expectedCoeffA = metrology?.CoeffX ?? 1d;
                var expectedCoeffB = (metrology?.CoeffConstant ?? 0d) + (metrology?.Offset ?? 0d);
                var expectedCorrectionC = metrology?.ErrJustesse ?? 0d;
                var expectedHigh = alarmSettings.ConsigneSup;
                var expectedLow = alarmSettings.ConsigneInf;
                var expectedFrequencyMinutes = Math.Max(1, (int)Math.Round(Math.Max(1, _frequencySeconds) / 60d, MidpointRounding.AwayFromZero));
                var expectedDelayLowMinutes = Math.Max(0, alarmSettings.RetardAlarmeBasMinutes);
                var expectedDelayHighMinutes = Math.Max(0, alarmSettings.RetardAlarmeHautMinutes);

                var coeffAMismatch = current.CoeffA.HasValue && !AreClose(current.CoeffA.Value, expectedCoeffA);
                var coeffBMismatch = current.CoeffB.HasValue && !AreClose(current.CoeffB.Value, expectedCoeffB);
                var correctionCMismatch = current.CorrectionC.HasValue && !AreClose(current.CorrectionC.Value, expectedCorrectionC);
                var highMismatch = current.HighLimit.HasValue && expectedHigh.HasValue && !AreClose(current.HighLimit.Value, expectedHigh.Value);
                var lowMismatch = current.LowLimit.HasValue && expectedLow.HasValue && !AreClose(current.LowLimit.Value, expectedLow.Value);
                var frequencyMismatch = current.FrequencyMinutes.HasValue && current.FrequencyMinutes.Value != expectedFrequencyMinutes;
                var lowDelayMismatch = current.AlarmDelayLowMinutes.HasValue && current.AlarmDelayLowMinutes.Value != expectedDelayLowMinutes;
                var highDelayMismatch = current.AlarmDelayHighMinutes.HasValue && current.AlarmDelayHighMinutes.Value != expectedDelayHighMinutes;
                var hasUnknownCriticalField =
                    !current.CoeffA.HasValue ||
                    !current.CoeffB.HasValue ||
                    !current.CorrectionC.HasValue ||
                    !current.HighLimit.HasValue ||
                    !current.LowLimit.HasValue ||
                    !current.FrequencyMinutes.HasValue ||
                    !current.AlarmDelayLowMinutes.HasValue ||
                    !current.AlarmDelayHighMinutes.HasValue;

                if (!coeffAMismatch &&
                    !coeffBMismatch &&
                    !correctionCMismatch &&
                    !highMismatch &&
                    !lowMismatch &&
                    !frequencyMismatch &&
                    !lowDelayMismatch &&
                    !highDelayMismatch)
                {
                    if (hasUnknownCriticalField)
                    {
                        VigitempServeur.Log($"[SONDE][CFG-CHECK] type=GSP serial={m_sondeSerialNumber} status=partial action=econ-sync");
                        return await SendExpectedConfigurationAsync(metrology, alarmSettings);
                    }

                    VigitempServeur.Log(
                        $"[SONDE][CFG-CHECK] type=GSP serial={m_sondeSerialNumber} status=ok a={current.CoeffA.Value.ToString(CultureInfo.InvariantCulture)} b={current.CoeffB.Value.ToString(CultureInfo.InvariantCulture)} c={current.CorrectionC.Value.ToString(CultureInfo.InvariantCulture)} high={current.HighLimit.Value.ToString(CultureInfo.InvariantCulture)} low={current.LowLimit.Value.ToString(CultureInfo.InvariantCulture)} freqMin={current.FrequencyMinutes.Value.ToString(CultureInfo.InvariantCulture)} delayLowMin={current.AlarmDelayLowMinutes.Value.ToString(CultureInfo.InvariantCulture)} delayHighMin={current.AlarmDelayHighMinutes.Value.ToString(CultureInfo.InvariantCulture)}");

                    return true;
                }

                VigitempServeur.Log(
                    $"[SONDE][CFG-CHECK] type=GSP serial={m_sondeSerialNumber} status=mismatch a={FormatCompare(current.CoeffA, expectedCoeffA)} b={FormatCompare(current.CoeffB, expectedCoeffB)} c={FormatCompare(current.CorrectionC, expectedCorrectionC)} high={FormatCompare(current.HighLimit, expectedHigh)} low={FormatCompare(current.LowLimit, expectedLow)} freqMin={FormatCompare(current.FrequencyMinutes, expectedFrequencyMinutes)} delayLowMin={FormatCompare(current.AlarmDelayLowMinutes, expectedDelayLowMinutes)} delayHighMin={FormatCompare(current.AlarmDelayHighMinutes, expectedDelayHighMinutes)}");

                return await SendExpectedConfigurationAsync(metrology, alarmSettings);
            }
            catch (Exception ex)
            {
                VigitempServeur.Log($"[SONDE][CFG-CHECK] type=GSP serial={m_sondeSerialNumber} status=error error={ex}");
                return false;
            }
        }

        private async Task<bool> SendExpectedConfigurationAsync(
            SondeMetrologySettings metrology,
            LieuAlarmSettings alarmSettings)
        {
            var commands = GspProtocol.BuildConfigurationCommands(
                channel: null,
                metrology: metrology,
                alarmSettings: alarmSettings,
                frequencySeconds: _frequencySeconds);

            foreach (var command in commands)
            {
                if (!string.Equals(command.Key, "ECON", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                var response = await SendRequestAndReadWithTimeoutAsync(command.Key, command.Value, allowEmptyResponse: true, ConfigurationResponseSilenceMs, ConfigurationReadTimeoutMs);
                if (!GspProtocol.IsAcknowledgementForTarget(response, command.Key, _commandTarget))
                {
                    VigitempServeur.Log(
                        $"[SONDE][CFG] type=GSP serial={m_sondeSerialNumber} command={command.Key} status=ack-mismatch response={(string.IsNullOrWhiteSpace(response) ? "<empty>" : TrimForLog(response))}");
                    return false;
                }

                VigitempServeur.Log($"[SONDE][CFG] type=GSP serial={m_sondeSerialNumber} status=sent-runtime command=ECON");
                return true;
            }

            VigitempServeur.Log($"[SONDE][CFG] type=GSP serial={m_sondeSerialNumber} skip=no-econ-command");
            return false;
        }

        private static bool AreClose(double left, double right)
        {
            return Math.Abs(left - right) < 0.000001d;
        }

        private static string FormatCompare(double? current, double? expected)
        {
            return $"{(current.HasValue ? current.Value.ToString(CultureInfo.InvariantCulture) : "unknown")}->{(expected.HasValue ? expected.Value.ToString(CultureInfo.InvariantCulture) : "unknown")}";
        }

        private static string FormatCompare(int? current, int expected)
        {
            return $"{(current.HasValue ? current.Value.ToString(CultureInfo.InvariantCulture) : "unknown")}->{expected.ToString(CultureInfo.InvariantCulture)}";
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

        public async Task<GspMemoResponse> ReadMemoryChunkAsync(int memoryCount, int memoryOffset)
        {
            if (VigitempServeur.InterrogationOnlyMode)
            {
                VigitempServeur.Log(
                    $"[SERVER][MODE] type=GSP serial={m_sondeSerialNumber} command=MEMO status=blocked reason=interrogation-only");
                return null;
            }

            GspMemoResponse response = null;
            await ExecuteWithPortLockAsync(async () =>
            {
                response = await ReadMemoryChunkCoreAsync(memoryCount, memoryOffset);
                return response != null;
            });
            return response;
        }

        private async Task<GspMemoResponse> ReadMemoryChunkCoreAsync(int memoryCount, int memoryOffset)
        {
            if (!GspProtocol.TryNormalizeMemoryRequest(
                    memoryCount,
                    memoryOffset,
                    out var safeCount,
                    out var safeOffset))
            {
                VigitempServeur.Log(
                    $"[SONDE][MEMO] type=GSP serial={m_sondeSerialNumber} port={m_comPort} status=rejected reason=eeprom-range-exhausted requested={memoryCount} offset={memoryOffset} capacity={GspProtocol.MaxMemoryMeasurementCount}");
                return null;
            }

            if (safeCount != memoryCount || safeOffset != memoryOffset)
            {
                VigitempServeur.Log(
                    $"[SONDE][MEMO] type=GSP serial={m_sondeSerialNumber} port={m_comPort} status=limited requested={memoryCount} offset={memoryOffset} count={safeCount} safeOffset={safeOffset} capacity={GspProtocol.MaxMemoryMeasurementCount}");
            }

            var payload = safeCount.ToString(CultureInfo.InvariantCulture) + "x" + safeOffset.ToString(CultureInfo.InvariantCulture) + "o";
            var originalReadTimeout = m_port.ReadTimeout;

            try
            {
                pendingResults = true;
                m_port.Open();
                m_port.DiscardInBuffer();
                m_port.DiscardOutBuffer();
                m_port.ReadTimeout = GetRecommendedMemoReadTimeoutMs(safeCount);

                VigitempServeur.Log(
                    $"[SONDE][MEMO] type=GSP serial={m_sondeSerialNumber} port={m_comPort} status=start count={safeCount} offset={safeOffset} readTimeoutMs={m_port.ReadTimeout} listenWindowMs={GetRecommendedMemoListenWindowMs(safeCount)}");

                var response = await SendRequestAndReadAsync("MEMO", payload, false, GetRecommendedMemoListenWindowMs(safeCount));
                if (string.IsNullOrWhiteSpace(response))
                {
                    VigitempServeur.Log($"[SONDE][MEMO] type=GSP serial={m_sondeSerialNumber} port={m_comPort} status=timeout count={safeCount} offset={safeOffset}");
                    return null;
                }

                if (!GspProtocol.TryParseMemoResponse(response, _commandTarget, out var parsed))
                {
                    VigitempServeur.Log($"[SONDE][MEMO] type=GSP serial={m_sondeSerialNumber} port={m_comPort} status=parse-error count={safeCount} offset={safeOffset} raw={TrimForLog(response)}");
                    return null;
                }

                VigitempServeur.Log(
                    $"[SONDE][MEMO] type=GSP serial={m_sondeSerialNumber} port={m_comPort} status=success count={safeCount} offset={safeOffset} returned={parsed.ReturnedCount ?? parsed.Measurements.Count} parsedOffset={(parsed.Offset.HasValue ? parsed.Offset.Value.ToString(CultureInfo.InvariantCulture) : "null")}");
                return parsed;
            }
            finally
            {
                pendingResults = false;
                m_port.ReadTimeout = originalReadTimeout;
                if (m_port.IsOpen)
                {
                    m_port.Close();
                }
            }
        }

        private async Task<string> SendRequestAndReadAsync(string commandPrefix, bool allowEmptyResponse)
        {
            return await SendRequestAndReadAsync(commandPrefix, string.Empty, allowEmptyResponse);
        }

        private async Task<string> SendRequestAndReadAsync(string commandPrefix, string payload, bool allowEmptyResponse)
        {
            return await SendRequestAndReadAsync(commandPrefix, payload, allowEmptyResponse, EndOfResponseSilenceMs);
        }

        private async Task<string> SendRequestAndReadAsync(string commandPrefix, string payload, bool allowEmptyResponse, int endOfResponseSilenceMs)
        {
            if (VigitempServeur.InterrogationOnlyMode &&
                !string.Equals(commandPrefix, "TEMP", StringComparison.OrdinalIgnoreCase))
            {
                VigitempServeur.Log(
                    $"[SERVER][MODE] type=GSP serial={m_sondeSerialNumber} command={commandPrefix} status=blocked reason=interrogation-only");
                return string.Empty;
            }

            if (string.Equals(commandPrefix, "ECON", StringComparison.OrdinalIgnoreCase) &&
                string.IsNullOrWhiteSpace(payload))
            {
                VigitempServeur.Log(
                    $"[SONDE][TX] type=GSP serial={m_sondeSerialNumber} port={m_comPort} " +
                    "command=ECON status=rejected reason=empty-payload");
                return string.Empty;
            }

            var command = GspProtocol.BuildCommand(commandPrefix, _commandTarget, payload);
            var candidates = new List<string>(GspProtocol.BuildCandidateCommands(command));
            for (var index = 0; index < candidates.Count; index++)
            {
                var candidate = candidates[index];
                var drained = await DrainBufferedDataAsync();
                if (!string.IsNullOrWhiteSpace(drained))
                {
                    VigitempServeur.LogDetailed($"[SONDE][DRAIN] type=GSP serial={m_sondeSerialNumber} port={m_comPort} raw={drained}");
                    if (ShouldRunExtendedPurge(drained))
                    {
                        await PurgePortUntilQuietAsync("repeated-drain");
                    }
                }

                m_port.DiscardInBuffer();
                m_port.DiscardOutBuffer();
                var commandBytes = GspProtocol.EncodeCommand(candidate);
                VigitempServeur.Log(
                    $"[SONDE][TX] type=GSP serial={m_sondeSerialNumber} port={m_comPort} " +
                    $"cmd={EscapeForLog(candidate)}");
                m_port.Write(commandBytes, 0, commandBytes.Length);
                await Task.Delay(InterCommandDelayMs);

                string response;
                var trailingResponse = string.Empty;
                try
                {
                    response = await ReadResponseAsync(candidate, endOfResponseSilenceMs);
                }
                finally
                {
                    trailingResponse = await PurgePortAfterCommandAsync(commandPrefix);
                }

                if (!GspProtocol.HasEndTerminator(response) &&
                    !string.IsNullOrWhiteSpace(trailingResponse))
                {
                    response = GspProtocol.StripCommandEcho(
                        (response ?? string.Empty) + Environment.NewLine + trailingResponse,
                        candidate).Trim();
                }

                if (!string.IsNullOrWhiteSpace(response))
                {
                    VigitempServeur.Log($"[SONDE][RX] type=GSP serial={m_sondeSerialNumber} port={m_comPort} raw={FormatResponseForLog(response)}");
                    if (GspProtocol.ContainsForeignSerial(response, _commandTarget))
                    {
                        VigitempServeur.Log($"[SONDE][STALE] type=GSP serial={m_sondeSerialNumber} port={m_comPort} command={commandPrefix} ignored=foreign-serial raw={TrimForLog(response)}");
                        await PurgePortUntilQuietAsync("foreign-serial-response");
                        continue;
                    }

                    return response;
                }

                VigitempServeur.Log($"[SONDE][RX] type=GSP serial={m_sondeSerialNumber} port={m_comPort} raw=<empty>");

                if (allowEmptyResponse && index == candidates.Count - 1)
                {
                    return string.Empty;
                }
            }

            VigitempServeur.Log($"[SONDE][RX] type=GSP serial={m_sondeSerialNumber} port={m_comPort} raw=<timeout>");
            return string.Empty;
        }

        private async Task<string> SendRequestAndReadWithTimeoutAsync(string commandPrefix, string payload, bool allowEmptyResponse, int endOfResponseSilenceMs, int readTimeoutMs)
        {
            var originalReadTimeout = m_port.ReadTimeout;
            try
            {
                if (readTimeoutMs > originalReadTimeout)
                {
                    m_port.ReadTimeout = readTimeoutMs;
                }

                return await SendRequestAndReadAsync(commandPrefix, payload, allowEmptyResponse, endOfResponseSilenceMs);
            }
            finally
            {
                m_port.ReadTimeout = originalReadTimeout;
            }
        }

        private async Task<string> ReadResponseAsync(string command, int endOfResponseSilenceMs)
        {
            var startedAt = DateTime.UtcNow;
            var buffer = string.Empty;
            DateTime? firstMeaningfulDataAt = null;
            DateTime? lastMeaningfulDataAt = null;
            var acknowledgedResponse = false;
            while (true)
            {
                var now = DateTime.UtcNow;
                if (!firstMeaningfulDataAt.HasValue &&
                    (now - startedAt).TotalMilliseconds >= m_port.ReadTimeout)
                {
                    break;
                }

                if (firstMeaningfulDataAt.HasValue &&
                    (now - firstMeaningfulDataAt.Value).TotalMilliseconds >= Math.Max(
                        acknowledgedResponse
                            ? AcknowledgedResponseCompletionTimeoutMs
                            : ResponseCompletionTimeoutMs,
                        m_port.ReadTimeout))
                {
                    break;
                }

                await Task.Delay(50);

                var chunk = m_port.ReadExisting();
                if (string.IsNullOrEmpty(chunk))
                {
                    var incompleteSilenceMs = acknowledgedResponse
                        ? AcknowledgedIncompleteResponseSilenceMs
                        : IncompleteResponseSilenceMs;
                    if (lastMeaningfulDataAt.HasValue &&
                        (DateTime.UtcNow - lastMeaningfulDataAt.Value).TotalMilliseconds >=
                        Math.Max(endOfResponseSilenceMs, incompleteSilenceMs))
                    {
                        break;
                    }
                    continue;
                }

                buffer += chunk;
                var responseWithoutEcho = GspProtocol.StripCommandEcho(buffer, command);
                if (string.IsNullOrWhiteSpace(responseWithoutEcho))
                {
                    continue;
                }

                if (!firstMeaningfulDataAt.HasValue)
                {
                    firstMeaningfulDataAt = DateTime.UtcNow;
                }
                lastMeaningfulDataAt = DateTime.UtcNow;
                acknowledgedResponse =
                    responseWithoutEcho.IndexOf("ACK=", StringComparison.OrdinalIgnoreCase) >= 0;
                if (GspProtocol.HasEndTerminator(responseWithoutEcho))
                {
                    break;
                }
            }

            var response = GspProtocol.StripCommandEcho(buffer, command).Trim();
            if (!string.IsNullOrWhiteSpace(response) && lastMeaningfulDataAt.HasValue)
            {
                LastResponseReceivedAtLocal = lastMeaningfulDataAt.Value.ToLocalTime();
            }

            return response;
        }

        private async Task<string> PurgePortAfterCommandAsync(string commandPrefix)
        {
            if (m_port == null || !m_port.IsOpen)
            {
                return string.Empty;
            }

            var startedAt = DateTime.UtcNow;
            var quietSince = startedAt;
            var buffer = string.Empty;

            while ((DateTime.UtcNow - startedAt).TotalMilliseconds < PostCommandDrainMs)
            {
                await Task.Delay(25);
                var chunk = m_port.ReadExisting();
                if (!string.IsNullOrEmpty(chunk))
                {
                    buffer += chunk;
                    quietSince = DateTime.UtcNow;
                    continue;
                }

                if ((DateTime.UtcNow - quietSince).TotalMilliseconds >= PostCommandQuietMs)
                {
                    break;
                }
            }

            m_port.DiscardInBuffer();
            m_port.DiscardOutBuffer();

            VigitempServeur.LogDetailed(
                $"[SONDE][PORT-PURGE] type=GSP serial={m_sondeSerialNumber} port={m_comPort} command={commandPrefix} reason=post-command durationMs={(DateTime.UtcNow - startedAt).TotalMilliseconds:0} extraBytes={buffer.Length} extraRaw={TrimForLog(buffer)}");
            return buffer;
        }

        private async Task<string> DrainBufferedDataAsync()
        {
            return await DrainBufferedDataAsync(BufferDrainMs, 100);
        }

        private async Task<string> DrainBufferedDataAsync(int maxDrainMs, int quietMs)
        {
            var startedAt = DateTime.UtcNow;
            var buffer = string.Empty;
            DateTime? lastDataAt = null;

            while ((DateTime.UtcNow - startedAt).TotalMilliseconds < maxDrainMs)
            {
                await Task.Delay(25);
                var chunk = m_port.ReadExisting();
                if (string.IsNullOrEmpty(chunk))
                {
                    if (lastDataAt.HasValue && (DateTime.UtcNow - lastDataAt.Value).TotalMilliseconds >= quietMs)
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

        private async Task ClearPortAfterInterrogationAsync()
        {
            if (m_port == null || !m_port.IsOpen)
            {
                return;
            }

            var startedAt = DateTime.UtcNow;
            var drained = await DrainBufferedDataAsync(PostInterrogationDrainMs, PostInterrogationQuietMs);

            m_port.DiscardInBuffer();
            m_port.DiscardOutBuffer();

            VigitempServeur.Log(
                $"[SONDE][PORT-PURGE] type=GSP port={m_comPort} reason=post-interrogation durationMs={(DateTime.UtcNow - startedAt).TotalMilliseconds:0} extraBytes={drained.Length} extraRaw={TrimForLog(drained)}");

            if (!string.IsNullOrWhiteSpace(drained) && ShouldRunExtendedPurge(drained))
            {
                await PurgePortUntilQuietAsync("post-interrogation-repeated-drain");
            }
        }

        private bool ShouldRunExtendedPurge(string drained)
        {
            if (string.IsNullOrWhiteSpace(drained))
            {
                return false;
            }

            var now = DateTime.UtcNow;
            var portKey = string.IsNullOrWhiteSpace(m_comPort) ? "__NO_PORT__" : m_comPort.Trim().ToUpperInvariant();
            var state = DrainStateByPort.GetOrAdd(portKey, _ => new DrainState { WindowStartedUtc = now });

            lock (state)
            {
                if ((now - state.WindowStartedUtc).TotalSeconds > RepeatedDrainWindowSeconds)
                {
                    state.WindowStartedUtc = now;
                    state.Count = 0;
                }

                state.Count++;

                if (state.Count < RepeatedDrainThreshold)
                {
                    return false;
                }

                if (state.LastPurgeUtc != default(DateTime) &&
                    (now - state.LastPurgeUtc).TotalSeconds < PortPurgeCooldownSeconds)
                {
                    return false;
                }

                state.LastPurgeUtc = now;
                state.Count = 0;
                state.WindowStartedUtc = now;
                return true;
            }
        }

        private async Task PurgePortUntilQuietAsync(string reason)
        {
            var startedAt = DateTime.UtcNow;
            var buffer = string.Empty;
            DateTime? lastDataAt = null;

            while ((DateTime.UtcNow - startedAt).TotalMilliseconds < ExtendedBufferDrainMs)
            {
                await Task.Delay(50);
                var chunk = m_port.ReadExisting();
                if (string.IsNullOrEmpty(chunk))
                {
                    if (!lastDataAt.HasValue ||
                        (DateTime.UtcNow - lastDataAt.Value).TotalMilliseconds < ExtendedBufferQuietMs)
                    {
                        continue;
                    }

                    break;
                }

                buffer += chunk;
                lastDataAt = DateTime.UtcNow;
            }

            m_port.DiscardInBuffer();
            m_port.DiscardOutBuffer();

            VigitempServeur.Log(
                $"[SONDE][PORT-PURGE] type=GSP port={m_comPort} reason={reason} durationMs={(DateTime.UtcNow - startedAt).TotalMilliseconds:0} extraBytes={buffer.Length} extraRaw={TrimForLog(buffer)}");
        }

        private static string FormatRssi(int? rssi)
        {
            return rssi.HasValue
                ? rssi.Value.ToString(CultureInfo.InvariantCulture) + "dBm"
                : null;
        }

        private static bool IsInvalidMeasurementPayload(GspTemperatureResponse parsed)
        {
            if (parsed?.Temperature == null)
            {
                return false;
            }

            return Math.Abs(parsed.Temperature.Value) < 0.000001d;
        }

        private async Task<GspTemperatureResponse> CheckAndSynchronizeClockAsync(GspTemperatureResponse parsed, bool hadTimeoutBeforeSuccess)
        {
            if (VigitempServeur.InterrogationOnlyMode)
            {
                return parsed;
            }

            if (!parsed.ProbeDateTime.HasValue)
            {
                return parsed;
            }

            var nowUtc = DateTime.UtcNow;
            var serverNow = DateTime.Now;
            var signedDriftSeconds = (serverNow - parsed.ProbeDateTime.Value).TotalSeconds;
            var driftSeconds = Math.Abs(signedDriftSeconds);
            var requiresImmediateVerification = IsProbeDateTimeClearlyInvalid(parsed.ProbeDateTime.Value, serverNow)
                || driftSeconds >= ClockDriftImmediateResyncSeconds;
            var shouldCheck = hadTimeoutBeforeSuccess
                || !_lastDateTimeCheckUtc.HasValue
                || (nowUtc - _lastDateTimeCheckUtc.Value).TotalHours >= ClockCheckIntervalHours;

            if (!shouldCheck && driftSeconds < ClockDriftWarningSeconds)
            {
                return parsed;
            }

            _lastDateTimeCheckUtc = nowUtc;
            var status = driftSeconds >= ClockDriftCriticalSeconds
                ? "critical"
                : driftSeconds >= ClockDriftWarningSeconds
                    ? "warning"
                    : "ok";

            VigitempServeur.Log(
                $"[SONDE][TIME] type=GSP serial={m_sondeSerialNumber} probe={parsed.ProbeDateTime.Value:O} server={serverNow:O} driftSec={Math.Round(signedDriftSeconds, 0, MidpointRounding.AwayFromZero)} status={status}");

            if (driftSeconds < ClockDriftWarningSeconds)
            {
                return parsed;
            }

            var serialKey = string.IsNullOrWhiteSpace(m_sondeSerialNumber)
                ? _commandTarget
                : m_sondeSerialNumber.Trim().ToUpperInvariant();

            if (!requiresImmediateVerification &&
                LastClockSyncAttemptUtcBySerial.TryGetValue(serialKey, out var lastAttemptUtc) &&
                (nowUtc - lastAttemptUtc).TotalMinutes < ClockSyncCooldownMinutes)
            {
                VigitempServeur.Log(
                    $"[SONDE][TIME] type=GSP serial={m_sondeSerialNumber} status=sync-skipped reason=cooldown driftSec={Math.Round(signedDriftSeconds, 0, MidpointRounding.AwayFromZero)}");
                return parsed;
            }

            var payload = GspProtocol.BuildDateTimePayload(serverNow);
            var response = await SendRequestAndReadAsync("ED-H", payload, allowEmptyResponse: true, ConfigurationResponseSilenceMs);
            var syncResponseIsEmpty = string.IsNullOrWhiteSpace(response);
            var syncResponseMatchesTarget = GspProtocol.IsAcknowledgementForTarget(response, "ED-H", _commandTarget);
            LastClockSyncAttemptUtcBySerial[serialKey] = (!syncResponseMatchesTarget)
                ? nowUtc.AddMinutes(-(ClockSyncCooldownMinutes - ClockSyncEmptyResponseRetryMinutes))
                : nowUtc;
            VigitempServeur.Log(
                $"[SONDE][TIME] type=GSP serial={m_sondeSerialNumber} status=sync-sent payload={payload} response={(syncResponseIsEmpty ? "<empty>" : TrimForLog(response))} ackTarget={(syncResponseMatchesTarget ? "ok" : "mismatch")} nextRetryMin={(syncResponseMatchesTarget ? ClockSyncCooldownMinutes : ClockSyncEmptyResponseRetryMinutes)}");

            if (!requiresImmediateVerification)
            {
                return parsed;
            }

            await Task.Delay(InterCommandDelayMs);
            var verificationPayload = _requestGraphDisplay ? "1g" : string.Empty;
            var verificationResponse = await SendRequestAndReadWithTimeoutAsync(
                "TEMP",
                verificationPayload,
                allowEmptyResponse: true,
                EndOfResponseSilenceMs,
                ReadTimeoutMs + 1000);

            if (!string.IsNullOrWhiteSpace(verificationResponse) &&
                GspProtocol.TryParseTemperatureResponse(verificationResponse, _commandTarget, out var refreshed) &&
                refreshed.Temperature.HasValue)
            {
                var refreshedServerNow = DateTime.Now;
                if (refreshed.ProbeDateTime.HasValue)
                {
                    var refreshedDriftSeconds = Math.Round(
                        (refreshedServerNow - refreshed.ProbeDateTime.Value).TotalSeconds,
                        0,
                        MidpointRounding.AwayFromZero);
                    VigitempServeur.Log(
                        $"[SONDE][TIME] type=GSP serial={m_sondeSerialNumber} status=post-sync-check probe={refreshed.ProbeDateTime.Value:O} server={refreshedServerNow:O} driftSec={refreshedDriftSeconds}");
                }
                else
                {
                    VigitempServeur.Log(
                        $"[SONDE][TIME] type=GSP serial={m_sondeSerialNumber} status=post-sync-check probe=<missing>");
                }

                return refreshed;
            }

            VigitempServeur.Log(
                $"[SONDE][TIME] type=GSP serial={m_sondeSerialNumber} status=post-sync-check-failed response={(string.IsNullOrWhiteSpace(verificationResponse) ? "<empty>" : TrimForLog(verificationResponse))}");
            return parsed;
        }

        private void LogMeasurementGap(GspTemperatureResponse parsed)
        {
            if (!parsed.ProbeDateTime.HasValue)
            {
                return;
            }

            if (IsProbeDateTimeClearlyInvalid(parsed.ProbeDateTime.Value, DateTime.Now))
            {
                VigitempServeur.Log(
                    $"[SONDE][GAP] type=GSP serial={m_sondeSerialNumber} status=skipped reason=invalid-probe-datetime probe={parsed.ProbeDateTime.Value:O}");
                return;
            }

            var serialKey = string.IsNullOrWhiteSpace(m_sondeSerialNumber)
                ? _commandTarget
                : m_sondeSerialNumber.Trim().ToUpperInvariant();
            var currentProbeDateTime = parsed.ProbeDateTime.Value;
            var hasPreviousProbeDateTime = LastSuccessfulProbeDateTimeBySerial.TryGetValue(serialKey, out var previousProbeDateTime);
            LastSuccessfulProbeDateTimeBySerial[serialKey] = currentProbeDateTime;

            if (!hasPreviousProbeDateTime || _frequencySeconds <= 0)
            {
                return;
            }

            var gapSeconds = (currentProbeDateTime - previousProbeDateTime).TotalSeconds;
            if (gapSeconds <= 0)
            {
                return;
            }

            var thresholdSeconds = _frequencySeconds * 2.5d;
            if (gapSeconds > thresholdSeconds)
            {
                var missingCount = Math.Max(1, (int)Math.Floor(gapSeconds / _frequencySeconds) - 1);
                VigitempServeur.Log(
                    $"[SONDE][GAP] type=GSP serial={m_sondeSerialNumber} previous={previousProbeDateTime:O} current={currentProbeDateTime:O} expectedSec={_frequencySeconds} actualSec={Math.Round(gapSeconds, 0, MidpointRounding.AwayFromZero)} status=anomaly missingCount={missingCount}");
                ths.RegisterGspRecoveryGap(m_idLieu, m_sondeSerialNumber, previousProbeDateTime, currentProbeDateTime);
            }
        }

        private static bool IsProbeDateTimeClearlyInvalid(DateTime probeDateTime, DateTime serverNow)
        {
            if (probeDateTime.Year < 2020)
            {
                return true;
            }

            return Math.Abs((serverNow - probeDateTime).TotalHours) >= 12;
        }

        private void LogBatteryHealth(GspTemperatureResponse parsed)
        {
            if (!parsed.BatteryPercent.HasValue)
            {
                return;
            }

            RefreshBatteryThresholdsIfNeeded();

            _lastBatteryPercent = parsed.BatteryPercent;
            var status = parsed.BatteryPercent.Value <= _batteryEmailPercent
                ? "critical"
                : parsed.BatteryPercent.Value <= _batteryNotifyPercent
                    ? "warning"
                    : "ok";

            if (!string.Equals(status, _lastBatteryStatus, StringComparison.OrdinalIgnoreCase))
            {
                VigitempServeur.Log($"[SONDE][BAT] type=GSP serial={m_sondeSerialNumber} battery={parsed.BatteryPercent.Value} status={status}");
                if (status == "warning")
                {
                    _ = AlarmWebNotifier.NotifyGspBatteryAsync(m_idLieu, m_sondeSerialNumber, parsed.BatteryPercent.Value, sendEmail: false);
                }
                else if (status == "critical")
                {
                    _ = AlarmWebNotifier.NotifyGspBatteryAsync(m_idLieu, m_sondeSerialNumber, parsed.BatteryPercent.Value, sendEmail: true);
                }
                _lastBatteryStatus = status;
            }
        }

        private void HandlePowerSupplyAlarm(GspTemperatureResponse parsed)
        {
            if (!parsed.IsOnBatteryPower.HasValue)
            {
                return;
            }

            var reason = string.IsNullOrWhiteSpace(parsed.AlarmStateRaw)
                ? (parsed.IsOnBatteryPower.Value ? "GSP-BAT" : "GSP-NORMAL")
                : "GSP-" + parsed.AlarmStateRaw.Trim().ToUpperInvariant();

            HandleSensorPowerAlarm(parsed.IsOnBatteryPower.Value, reason);
        }

        private void RefreshBatteryThresholdsIfNeeded()
        {
            var nowUtc = DateTime.UtcNow;
            if (_lastBatteryThresholdRefreshUtc.HasValue &&
                (nowUtc - _lastBatteryThresholdRefreshUtc.Value).TotalMinutes < BatteryThresholdRefreshMinutes)
            {
                return;
            }

            _lastBatteryThresholdRefreshUtc = nowUtc;

            try
            {
                var notifyRaw = ths.GetDatabase().getParameterValue("NOTIFICATIONS", "GSP_BATTERY_NOTIFY_PERCENT");
                var emailRaw = ths.GetDatabase().getParameterValue("NOTIFICATIONS", "GSP_BATTERY_EMAIL_PERCENT");

                var notifyThreshold = ParsePercentSetting(notifyRaw, DefaultBatteryNotifyPercent);
                var emailThreshold = ParsePercentSetting(emailRaw, DefaultBatteryEmailPercent);

                if (emailThreshold > notifyThreshold)
                {
                    emailThreshold = notifyThreshold;
                }

                _batteryNotifyPercent = notifyThreshold;
                _batteryEmailPercent = emailThreshold;
            }
            catch (Exception ex)
            {
                VigitempServeur.Log($"[SONDE][BAT] type=GSP serial={m_sondeSerialNumber} thresholds=error error={ex.Message}");
                _batteryNotifyPercent = DefaultBatteryNotifyPercent;
                _batteryEmailPercent = DefaultBatteryEmailPercent;
            }
        }

        private static int ParsePercentSetting(string rawValue, int fallback)
        {
            if (string.IsNullOrWhiteSpace(rawValue))
            {
                return fallback;
            }

            if (!int.TryParse(rawValue.Trim(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var value))
            {
                if (!int.TryParse(rawValue.Trim(), NumberStyles.Integer, CultureInfo.CurrentCulture, out value))
                {
                    return fallback;
                }
            }

            if (value < 1) value = 1;
            if (value > 100) value = 100;
            return value;
        }

        private void LogSignalHealth(GspTemperatureResponse parsed)
        {
            if (!parsed.Rssi.HasValue)
            {
                return;
            }

            if (_lastRssi != parsed.Rssi.Value)
            {
                VigitempServeur.LogDetailed($"[SONDE][RSSI] type=GSP serial={m_sondeSerialNumber} rssi={parsed.Rssi.Value}");
                _lastRssi = parsed.Rssi.Value;
            }
        }

        private static int GetRecommendedMemoReadTimeoutMs(int memoryCount)
        {
            if (memoryCount <= 20) return MemoBatchReadTimeoutMsShort;
            if (memoryCount <= 100) return MemoBatchReadTimeoutMsMedium;
            if (memoryCount <= 500) return MemoBatchReadTimeoutMsLarge;
            return MemoBatchReadTimeoutMsVeryLarge;
        }

        private static int GetRecommendedMemoListenWindowMs(int memoryCount)
        {
            if (memoryCount <= 20) return MemoBatchListenWindowMsShort;
            if (memoryCount <= 100) return MemoBatchListenWindowMsMedium;
            if (memoryCount <= 500) return MemoBatchListenWindowMsLarge;
            return MemoBatchListenWindowMsVeryLarge;
        }

        private static string EscapeForLog(string value)
        {
            var builder = new StringBuilder();
            foreach (var character in value ?? string.Empty)
            {
                switch (character)
                {
                    case '\r':
                        builder.Append("\\r");
                        break;
                    case '\n':
                        builder.Append("\\n");
                        break;
                    case '\t':
                        builder.Append("\\t");
                        break;
                    default:
                        if (char.IsControl(character) || character == '\uFFFD')
                        {
                            builder.Append("\\u");
                            builder.Append(((int)character).ToString("X4", CultureInfo.InvariantCulture));
                        }
                        else
                        {
                            builder.Append(character);
                        }
                        break;
                }
            }
            return builder.ToString();
        }

        private static string FormatResponseForLog(string value, int maxHexBytes = 192)
        {
            var trimmed = (value ?? string.Empty).Trim();
            if (trimmed.Length == 0)
            {
                return "<empty>";
            }

            var containsBinaryData = false;
            foreach (var character in trimmed)
            {
                if ((char.IsControl(character) && character != '\r' && character != '\n' && character != '\t') ||
                    character == '\uFFFD')
                {
                    containsBinaryData = true;
                    break;
                }
            }

            if (!containsBinaryData)
            {
                return TrimForLog(trimmed);
            }

            var bytes = Encoding.UTF8.GetBytes(trimmed);
            var displayedLength = Math.Min(bytes.Length, maxHexBytes);
            var hex = new StringBuilder(displayedLength * 3);
            for (var index = 0; index < displayedLength; index++)
            {
                if (index > 0)
                {
                    hex.Append(' ');
                }
                hex.Append(bytes[index].ToString("X2", CultureInfo.InvariantCulture));
            }
            if (bytes.Length > displayedLength)
            {
                hex.Append(" ...");
            }

            return $"<binary chars={trimmed.Length} bytes={bytes.Length} escaped={TrimForLog(trimmed, 300)} utf8Hex={hex}>";
        }

        private static string TrimForLog(string value, int maxLength = 1000)
        {
            var escaped = EscapeForLog((value ?? string.Empty).Trim());
            return escaped.Length <= maxLength
                ? escaped
                : escaped.Substring(0, maxLength) + "...";
        }
    }
}
