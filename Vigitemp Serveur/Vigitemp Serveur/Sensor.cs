using System;
using System.Configuration;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO.Ports;
using System.Net.Http;
using System.Threading.Tasks;
using System.Threading;

namespace Vigitemp_Serveur
{
    abstract class Sensor
    {
        protected string m_comPort;
        protected string m_sondeSerialNumber;
        protected string m_sondeAdresse;
        protected int m_idLieu;
        protected SerialPort m_port;
        // public static bool LOCKER = false;
        public volatile bool pendingResults = false;
        // private string m_regexResponseTempSensor = @"R[A-Z][0-9]{2}[A-Z]TEMP-?[0-9]{1,3}.[0-9]{2}'C";
        private string m_sensor_response_internal;
        private readonly object _responseLock = new object();
        public string m_sensor_response
        {
            get { lock (_responseLock) { return m_sensor_response_internal; } }
            set { lock (_responseLock) { m_sensor_response_internal = value; } }
        }

        /// <summary>
        /// Appends a chunk to the accumulated response buffer under the response lock.
        /// Use this instead of m_sensor_response += chunk in DataReceivedHandlers to avoid
        /// a read-modify-write race condition (compound += is not atomic with a property lock).
        /// </summary>
        protected void AppendToResponse(string chunk)
        {
            lock (_responseLock) { m_sensor_response_internal += chunk; }
        }

        /// <summary>
        /// Closes and disposes the serial port, then removes it from the global open-port list.
        /// Must be called only on error paths (catch blocks). The normal success path closes the
        /// port but keeps it in the list for reuse on the next cycle.
        /// </summary>
        protected void DisposePort()
        {
            try { if (m_port.IsOpen) m_port.Close(); } catch { /* ignore */ }
            try { m_port.Dispose(); } catch { /* ignore */ }
            ths.list_removeComPort(m_port);
        }

        public ThreadServeur ths;
        public DateTime? LastResponseReceivedAtLocal { get; protected set; }

        protected string tmp_resistance = "";
        protected string tmp_valeur = "";
        protected string tmp_numeroSerie = "";
        protected Stopwatch sw;
        private int _readCompletionState = 0;

        private static readonly HttpClient client = new HttpClient { Timeout = TimeSpan.FromSeconds(10) };
        private static readonly bool _legacyAgentNotificationsEnabled =
            GetSettingBool("Vigitemp.LegacyAgentNotifications.Enabled", false);
        private static readonly int _legacyAgentNotificationMaxRecipients =
            GetSettingInt("Vigitemp.LegacyAgentNotifications.MaxRecipients", 25);
        private static readonly ConcurrentDictionary<int, bool> _alarmStateByLieu =
            new ConcurrentDictionary<int, bool>();
        private static readonly ConcurrentDictionary<int, bool> _preAlarmStateByLieu =
            new ConcurrentDictionary<int, bool>();
        private static readonly ConcurrentDictionary<int, bool> _lowAlarmStateByLieu =
            new ConcurrentDictionary<int, bool>();
        private static readonly ConcurrentDictionary<int, bool> _highAlarmStateByLieu =
            new ConcurrentDictionary<int, bool>();
        private static readonly ConcurrentDictionary<int, bool> _noResponseStateByLieu =
            new ConcurrentDictionary<int, bool>();
        private static readonly ConcurrentDictionary<int, int> _retriggerLowWaitCountByLieu =
            new ConcurrentDictionary<int, int>();
        private static readonly ConcurrentDictionary<int, int> _retriggerHighWaitCountByLieu =
            new ConcurrentDictionary<int, int>();
        private static readonly ConcurrentDictionary<int, int> _retriggerNoResponseWaitCountByLieu =
            new ConcurrentDictionary<int, int>();
        private static readonly ConcurrentDictionary<int, bool> _sensorPowerAlarmStateByLieu =
            new ConcurrentDictionary<int, bool>();
        private static readonly ConcurrentDictionary<string, SemaphoreSlim> _portLocks =
            new ConcurrentDictionary<string, SemaphoreSlim>(StringComparer.OrdinalIgnoreCase);

        // Constructeur
        public Sensor(ThreadServeur p_ths, string p_comPort, string p_sondeSerialNumber, string p_sondeAdresse)
        {
            this.ths = p_ths;
            m_comPort = p_comPort;
            m_sondeSerialNumber = p_sondeSerialNumber;
            m_sondeAdresse = NormalizeSensorAddress(p_sondeSerialNumber, p_sondeAdresse);
            m_idLieu = ths.GetDatabase().getIDLieuBySerialNumber(m_sondeSerialNumber);

            sw = new Stopwatch();

            m_port = new SerialPort();
            m_port.PortName = m_comPort;
            m_port.BaudRate = 9600;
            m_port.Parity = Parity.None;
            m_port.DataBits = 8;
            m_port.StopBits = StopBits.One;
            m_port.DtrEnable = false;
            m_port.RtsEnable = false;
            m_port.Handshake = Handshake.None;
            // m_port.Handshake = Handshake.XOnXOff;

            m_port.ReadTimeout = 5000;
            m_port.WriteTimeout = 5000;

            p_ths.list_addComPort(m_port);
        }

        private static string NormalizeSensorAddress(string serialNumber, string sensorAddress)
        {
            if (string.IsNullOrWhiteSpace(sensorAddress))
            {
                return sensorAddress;
            }

            var address = sensorAddress.Trim();
            var serial = (serialNumber ?? string.Empty).Trim();
            if (serial.Length < 2)
            {
                return address;
            }

            var sensorType = serial.Substring(0, 2).ToUpperInvariant();
            switch (sensorType)
            {
                case "IN":
                case "IE":
                case "IP":
                case "IC":
                case "IH":
                case "EN":
                    // These ASCII probes answer on a 4-character address.
                    // Some DB rows contain the full serial instead of the short address.
                    if (address.Length > 4)
                    {
                        return address.Substring(address.Length - 4, 4);
                    }
                    break;
            }

            return address;
        }

        public abstract Task<bool> read();
        protected abstract void DataReceivedHandler(object sender, SerialDataReceivedEventArgs e);
        protected virtual bool ShouldApplyMetrology => true;
        protected double ApplyMetrology(double rawValue)
        {
            if (!ShouldApplyMetrology)
            {
                if (ths != null && ths.LogMetrologyDetailed)
                {
                    VigitempServeur.Log(
                        $"Metrology bypass serial={m_sondeSerialNumber} idLieu={m_idLieu} raw={rawValue.ToString(CultureInfo.InvariantCulture)}");
                }

                return rawValue;
            }

            var metrology = ths.GetSondeMetrologyCached(m_sondeSerialNumber);
            if (metrology == null)
            {
                return rawValue;
            }

            var value = rawValue;
            var afterAjustage = value;
            var afterOffset = value;
            var afterEtalonnage = value;

            // Ordre metrologie: ajustage (a*x + b) puis offset, puis correction EJ conditionnelle.
            if (metrology.HasAjustage)
            {
                value = metrology.CoeffX * value + metrology.CoeffConstant;
                afterAjustage = value;
            }

            if (metrology.Offset.HasValue)
            {
                value += metrology.Offset.Value;
                afterOffset = value;
            }
            else
            {
                afterOffset = value;
            }

            var appliedCorrectionEj = false;
            if (metrology.HasEtalonnage && metrology.ApplyCorrectionEj && metrology.CorrectionJustesse.HasValue)
            {
                value += metrology.CorrectionJustesse.Value;
                afterEtalonnage = value;
                appliedCorrectionEj = true;
            }
            else
            {
                afterEtalonnage = value;
            }

            if (ths != null && ths.LogMetrologyDetailed)
            {
                VigitempServeur.Log(
                    $"Metrology apply serial={m_sondeSerialNumber} idLieu={m_idLieu} " +
                    $"raw={rawValue.ToString(CultureInfo.InvariantCulture)} " +
                    $"hasAjustage={metrology.HasAjustage} coeffX={metrology.CoeffX.ToString(CultureInfo.InvariantCulture)} coeffC={metrology.CoeffConstant.ToString(CultureInfo.InvariantCulture)} " +
                    $"afterAjustage={afterAjustage.ToString(CultureInfo.InvariantCulture)} " +
                    $"offset={(metrology.Offset.HasValue ? metrology.Offset.Value.ToString(CultureInfo.InvariantCulture) : "null")} afterOffset={afterOffset.ToString(CultureInfo.InvariantCulture)} " +
                    $"hasEtalonnage={metrology.HasEtalonnage} mode={metrology.EmtChoixMode?.ToString() ?? "null"} applyCorrectionEj={metrology.ApplyCorrectionEj} " +
                    $"errJustesse={(metrology.ErrJustesse.HasValue ? metrology.ErrJustesse.Value.ToString(CultureInfo.InvariantCulture) : "null")} " +
                    $"correction={(metrology.CorrectionJustesse.HasValue ? metrology.CorrectionJustesse.Value.ToString(CultureInfo.InvariantCulture) : "null")} " +
                    $"appliedCorrectionEj={appliedCorrectionEj} final={afterEtalonnage.ToString(CultureInfo.InvariantCulture)}");
            }

            return value;
        }

        protected string ToInvariantRaw(double rawValue)
        {
            return rawValue.ToString("0.########", CultureInfo.InvariantCulture);
        }

        protected double RoundMeasure(double value)
        {
            return Math.Round(value, 2, MidpointRounding.AwayFromZero);
        }

        protected void BeginReadCycle()
        {
            Interlocked.Exchange(ref _readCompletionState, 0);
            pendingResults = true;
        }

        protected async Task<bool> ExecuteWithPortLockAsync(Func<Task<bool>> readAction)
        {
            var portKey = string.IsNullOrWhiteSpace(m_comPort)
                ? "__NO_PORT__"
                : m_comPort.Trim().ToUpperInvariant();
            var portSemaphore = _portLocks.GetOrAdd(portKey, _ => new SemaphoreSlim(1, 1));
            await portSemaphore.WaitAsync().ConfigureAwait(false);
            Mutex namedMutex = null;
            var mutexAcquired = false;
            try
            {
                namedMutex = new Mutex(false, BuildPortMutexName(portKey));
                try
                {
                    mutexAcquired = namedMutex.WaitOne(TimeSpan.FromMinutes(5));
                }
                catch (AbandonedMutexException)
                {
                    mutexAcquired = true;
                    VigitempServeur.Log($"[SONDE][PORT-LOCK] port={portKey} serial={m_sondeSerialNumber} status=abandoned-acquired");
                }

                if (!mutexAcquired)
                {
                    VigitempServeur.Log($"[SONDE][PORT-LOCK] port={portKey} serial={m_sondeSerialNumber} status=timeout");
                    HandleNoResponseAlarm(false, "port-lock-timeout");
                    return false;
                }

                return await readAction().ConfigureAwait(false);
            }
            finally
            {
                if (mutexAcquired && namedMutex != null)
                {
                    try
                    {
                        namedMutex.ReleaseMutex();
                    }
                    catch (ApplicationException)
                    {
                        // Mutex deja relache ou non acquis: rien a faire.
                    }
                }

                if (namedMutex != null)
                {
                    namedMutex.Dispose();
                }

                portSemaphore.Release();
            }
        }

        private static string BuildPortMutexName(string portKey)
        {
            var normalized = string.IsNullOrWhiteSpace(portKey)
                ? "__NO_PORT__"
                : portKey.Trim().ToUpperInvariant();
            var chars = normalized.ToCharArray();
            for (var i = 0; i < chars.Length; i++)
            {
                if (!char.IsLetterOrDigit(chars[i]))
                {
                    chars[i] = '_';
                }
            }

            return @"Global\VigitempSerialPort_" + new string(chars);
        }

        protected bool TryCompleteRead()
        {
            var completed = Interlocked.CompareExchange(ref _readCompletionState, 1, 0) == 0;
            if (completed)
            {
                _ = MarkReadLoopCompletedWhenPortReleasedAsync();
            }
            return completed;
        }

        protected bool HasReadCompleted()
        {
            return Volatile.Read(ref _readCompletionState) != 0;
        }

        private async Task MarkReadLoopCompletedWhenPortReleasedAsync()
        {
            try
            {
                var timeoutAt = DateTime.UtcNow.AddSeconds(6);
                while (DateTime.UtcNow < timeoutAt)
                {
                    try
                    {
                        if (m_port == null || !m_port.IsOpen)
                        {
                            pendingResults = false;
                            return;
                        }
                    }
                    catch
                    {
                        pendingResults = false;
                        return;
                    }

                    await Task.Delay(10).ConfigureAwait(false);
                }

                try
                {
                    if (m_port != null && m_port.IsOpen)
                    {
                        m_port.Close();
                    }
                }
                catch
                {
                    // Ignore: this path only exists to unblock a stuck read cycle.
                }
            }
            finally
            {
                pendingResults = false;
            }
        }

        /// <summary>
        /// Handles power alarm transitions raised by probe frames (IE/IP battery markers).
        /// Only clears alarms previously raised by this sensor path to avoid interfering
        /// with other technical alarm sources.
        /// </summary>
        protected void HandleSensorPowerAlarm(bool isActive, string reason = null)
        {
            try
            {
                if (m_idLieu <= 0)
                {
                    return;
                }

                if (!_sensorPowerAlarmStateByLieu.ContainsKey(m_idLieu))
                {
                    var persistedState = ths.GetDatabase().getPowerAlarmActiveState(m_idLieu);
                    if (persistedState.HasValue)
                    {
                        _sensorPowerAlarmStateByLieu[m_idLieu] = persistedState.Value;
                    }
                }

                if (isActive)
                {
                    if (_sensorPowerAlarmStateByLieu.TryGetValue(m_idLieu, out var wasActive) && wasActive)
                    {
                        return;
                    }

                    if (ths.GetDatabase().setPowerAlarm(m_idLieu, m_sondeSerialNumber, true))
                    {
                        _sensorPowerAlarmStateByLieu[m_idLieu] = true;
                        VigitempServeur.Log($"Alarme coupure secteur activee (trame sonde) lieu={m_idLieu} sonde={m_sondeSerialNumber} reason={reason ?? "frame-battery"}");
                    }
                    else
                    {
                        VigitempServeur.Log($"HandleSensorPowerAlarm: echec activation lieu={m_idLieu} sonde={m_sondeSerialNumber}");
                    }

                    return;
                }

                if (!_sensorPowerAlarmStateByLieu.TryGetValue(m_idLieu, out var wasSensorRaised) || !wasSensorRaised)
                {
                    return;
                }

                if (ths.GetDatabase().setPowerAlarm(m_idLieu, m_sondeSerialNumber, false))
                {
                    _sensorPowerAlarmStateByLieu[m_idLieu] = false;
                    VigitempServeur.Log($"Alarme coupure secteur terminee (trame sonde) lieu={m_idLieu} sonde={m_sondeSerialNumber} reason={reason ?? "frame-normal"}");
                }
                else
                {
                    VigitempServeur.Log($"HandleSensorPowerAlarm: echec cloture lieu={m_idLieu} sonde={m_sondeSerialNumber}");
                }
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("HandleSensorPowerAlarm error: " + ex);
            }
        }

        private void HideAlarmOnClientAsync(string ipClient)
        {
            if (!_legacyAgentNotificationsEnabled)
            {
                return;
            }

            if (string.IsNullOrWhiteSpace(ipClient))
            {
                return;
            }

            _ = Task.Run(async () =>
            {
                try
                {
                    var url = "http://" + ipClient + ":8000/alarm?action=hide&idLieu=" + m_idLieu;
                    await client.PostAsync(url, null);
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log(
                        $"HideAlarm notification failed lieu={m_idLieu} sonde={m_sondeSerialNumber} ip={ipClient}: {ex.Message}");
                }
            });
        }

        
        public bool compareMeasuresAndLimits(double p_valeur, string p_unite)
        {
            try
            {
                var settings = ths.GetLieuAlarmSettingsCached(m_idLieu);
                if (settings == null)
                {
                    VigitempServeur.Log("compareMeasuresAndLimits: settings null pour le lieu " + m_idLieu);
                    return false;
                }

                var hasLow = settings.ConsigneInfActive && settings.ConsigneInf.HasValue;
                var hasHigh = settings.ConsigneSupActive && settings.ConsigneSup.HasValue;

                var policy = AlarmPolicy.Current;
                var eligible =
                    (settings.NotificationActive ||
                     (policy.ShowWhileSnoozed && settings.DateHeureReactivationAlarme != default(DateTime)));

                var nowUtc = DateTime.UtcNow;
                var planningDelayActive =
                    settings.RetardAlarmeChangementConsigneMinutes > 0 &&
                    settings.PlanningDerniereMaj != default(DateTime) &&
                    DateTime.Now < settings.PlanningDerniereMaj.AddMinutes(settings.RetardAlarmeChangementConsigneMinutes);

                var retriggerDelayMeasures = Math.Max(0, settings.NbMesuresTemporisationRedeclenchement);
                var forceImmediateRetrigger = ths.GetLieuRetriggerFlagCached(m_idLieu);

                var outLowNow = hasLow && p_valeur < settings.ConsigneInf.Value;
                var outHighNow = hasHigh && p_valeur > settings.ConsigneSup.Value;
                var outOfToleranceNow = outLowNow || outHighNow;

                var suppressRetriggerThisMeasure = false;
                var forceLowImmediate = false;
                var forceHighImmediate = false;

                if (forceImmediateRetrigger)
                {
                    if (outOfToleranceNow)
                    {
                        if (outLowNow)
                        {
                            var waitCount = _retriggerLowWaitCountByLieu.AddOrUpdate(m_idLieu, 1, (_, previous) => previous + 1);
                            if (waitCount > retriggerDelayMeasures)
                            {
                                forceLowImmediate = true;
                            }
                            else
                            {
                                suppressRetriggerThisMeasure = true;
                            }
                        }
                        if (outHighNow)
                        {
                            var waitCount = _retriggerHighWaitCountByLieu.AddOrUpdate(m_idLieu, 1, (_, previous) => previous + 1);
                            if (waitCount > retriggerDelayMeasures)
                            {
                                forceHighImmediate = true;
                            }
                            else
                            {
                                suppressRetriggerThisMeasure = true;
                            }
                        }
                    }
                    else
                    {
                        ths.GetDatabase().setLieuImmediateRetriggerFlag(m_idLieu, false);
                        ths.InvalidateRetriggerFlagCache(m_idLieu);
                        _retriggerLowWaitCountByLieu[m_idLieu] = 0;
                        _retriggerHighWaitCountByLieu[m_idLieu] = 0;
                    }
                }
                else
                {
                    _retriggerLowWaitCountByLieu[m_idLieu] = 0;
                    _retriggerHighWaitCountByLieu[m_idLieu] = 0;
                }

                if (forceLowImmediate)
                {
                    AlarmStateEvaluator.ResetState("alarm-low", m_idLieu);
                    _lowAlarmStateByLieu[m_idLieu] = false;
                    _alarmStateByLieu[m_idLieu] = false;
                }

                if (forceHighImmediate)
                {
                    AlarmStateEvaluator.ResetState("alarm-high", m_idLieu);
                    _highAlarmStateByLieu[m_idLieu] = false;
                    _alarmStateByLieu[m_idLieu] = false;
                }

                var lowEval = EvaluateAlarmChannel(
                    channel: "alarm-low",
                    enabled: hasLow,
                    value: p_valeur,
                    low: hasLow ? settings.ConsigneInf.Value : 0d,
                    high: hasLow ? 1_000_000_000d : 0d,
                    eligible: suppressRetriggerThisMeasure ? false : (eligible && !planningDelayActive),
                    debounceSeconds: forceLowImmediate ? 0 : Math.Max(0, settings.RetardAlarmeBasMinutes * 60),
                    ignorePolicyDebounce: forceLowImmediate,
                    nowUtc: nowUtc);

                var highEval = EvaluateAlarmChannel(
                    channel: "alarm-high",
                    enabled: hasHigh,
                    value: p_valeur,
                    low: hasHigh ? -1_000_000_000d : 0d,
                    high: hasHigh ? settings.ConsigneSup.Value : 0d,
                    eligible: suppressRetriggerThisMeasure ? false : (eligible && !planningDelayActive),
                    debounceSeconds: forceHighImmediate ? 0 : Math.Max(0, settings.RetardAlarmeHautMinutes * 60),
                    ignorePolicyDebounce: forceHighImmediate,
                    nowUtc: nowUtc);

                if (planningDelayActive && outOfToleranceNow)
                {
                    VigitempServeur.Log($"Retard changement consigne actif lieu {m_idLieu} - sonde {m_sondeSerialNumber} jusqu'a {settings.PlanningDerniereMaj.AddMinutes(settings.RetardAlarmeChangementConsigneMinutes):O}");
                }
                else
                {
                    if (outLowNow && !lowEval.IsActive)
                    {
                        VigitempServeur.Log(
                            $"Depassement bas sonde {m_sondeSerialNumber}: valeur={p_valeur} en attente retard={Math.Max(0, settings.RetardAlarmeBasMinutes)}m lieu={m_idLieu}");
                    }

                    if (outHighNow && !highEval.IsActive)
                    {
                        VigitempServeur.Log(
                            $"Depassement haut sonde {m_sondeSerialNumber}: valeur={p_valeur} en attente retard={Math.Max(0, settings.RetardAlarmeHautMinutes)}m lieu={m_idLieu}");
                    }
                }

                var unit = string.IsNullOrWhiteSpace(p_unite)
                    ? ths.GetDatabase().getLieuUnite(m_idLieu)
                    : p_unite;

                if (lowEval.TransitionToActive)
                {
                    if (forceLowImmediate)
                    {
                        VigitempServeur.Log(
                            $"Re-declenchement immediat (alarme basse acquittee) lieu {m_idLieu} - sonde {m_sondeSerialNumber} valeur={p_valeur} unite={unit ?? ""}");
                    }
                    VigitempServeur.Log($"Alarme basse declenchee pour le lieu {m_idLieu} - sonde {m_sondeSerialNumber} valeur={p_valeur}");
                }
                else if (lowEval.TransitionToInactive)
                {
                    VigitempServeur.Log($"Alarme basse terminee pour le lieu {m_idLieu} - sonde {m_sondeSerialNumber}");
                }

                if (highEval.TransitionToActive)
                {
                    if (forceHighImmediate)
                    {
                        VigitempServeur.Log(
                            $"Re-declenchement immediat (alarme haute acquittee) lieu {m_idLieu} - sonde {m_sondeSerialNumber} valeur={p_valeur} unite={unit ?? ""}");
                    }
                    VigitempServeur.Log($"Alarme haute declenchee pour le lieu {m_idLieu} - sonde {m_sondeSerialNumber} valeur={p_valeur}");
                }
                else if (highEval.TransitionToInactive)
                {
                    VigitempServeur.Log($"Alarme haute terminee pour le lieu {m_idLieu} - sonde {m_sondeSerialNumber}");
                }
                _lowAlarmStateByLieu[m_idLieu] = lowEval.IsActive;
                _highAlarmStateByLieu[m_idLieu] = highEval.IsActive;
                ths.GetDatabase().setThresholdAlarm(m_idLieu, m_sondeSerialNumber, "B", p_valeur, unit, lowEval.IsActive);
                ths.GetDatabase().setThresholdAlarm(m_idLieu, m_sondeSerialNumber, "H", p_valeur, unit, highEval.IsActive);

                var noResponseActive = _noResponseStateByLieu.TryGetValue(m_idLieu, out var nrActive) && nrActive;
                var overallAlarmActive = lowEval.IsActive || highEval.IsActive || noResponseActive;

                if (forceImmediateRetrigger && overallAlarmActive)
                {
                    ths.GetDatabase().setLieuImmediateRetriggerFlag(m_idLieu, false);
                    ths.InvalidateRetriggerFlagCache(m_idLieu);
                    _retriggerLowWaitCountByLieu[m_idLieu] = 0;
                    _retriggerHighWaitCountByLieu[m_idLieu] = 0;
                }

                AlarmEvaluation preEvaluation;
                var hasPreLow = settings.ConsigneInfPreAlarmeActive && settings.ConsigneInfPreAlarme.HasValue;
                var hasPreHigh = settings.ConsigneSupPreAlarmeActive && settings.ConsigneSupPreAlarme.HasValue;
                if (!hasPreLow && !hasPreHigh)
                {
                    preEvaluation = new AlarmEvaluation(false, false, false);
                }
                else
                {
                    var lowPre = hasPreLow ? settings.ConsigneInfPreAlarme.Value : -1_000_000_000d;
                    var highPre = hasPreHigh ? settings.ConsigneSupPreAlarme.Value : 1_000_000_000d;
                    preEvaluation = AlarmStateEvaluator.Evaluate(
                        channel: "prealarm",
                        idLieu: m_idLieu,
                        value: p_valeur,
                        low: lowPre,
                        high: highPre,
                        eligible: eligible,
                        debounceSeconds: 0,
                        ignorePolicyDebounce: false,
                        nowUtc: nowUtc);
                }

                var effectivePreAlarm = preEvaluation.IsActive && !overallAlarmActive;
                ApplyAlarmState(overallAlarmActive, effectivePreAlarm, p_valeur);

                return true;
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("compareMeasuresAndLimits error: " + ex);
                return false;
            }
        }

        protected void HandleNoResponseAlarm(bool ok, string reason = null, bool insertNullMeasureImmediately = false)
        {
            try
            {
                var settings = ths.GetLieuAlarmSettingsCached(m_idLieu);
                if (settings == null)
                {
                    return;
                }

                var policy = AlarmPolicy.Current;
                var eligible =
                    (settings.NotificationActive ||
                     (policy.ShowWhileSnoozed && settings.DateHeureReactivationAlarme != default(DateTime)));

                var nowUtc = DateTime.UtcNow;

                var value = ok ? 0d : 1d;
                var retriggerDelayMeasures = Math.Max(0, settings.NbMesuresTemporisationRedeclenchement);
                var forceRetriggerFlag = ths.GetLieuRetriggerFlagCached(m_idLieu);

                var suppressRetriggerThisMeasure = false;
                var forceImmediate = false;

                if (forceRetriggerFlag && !ok)
                {
                    var waitCount = _retriggerNoResponseWaitCountByLieu.AddOrUpdate(m_idLieu, 1, (_, previous) => previous + 1);
                    suppressRetriggerThisMeasure = waitCount <= retriggerDelayMeasures;
                    forceImmediate = !suppressRetriggerThisMeasure;
                }
                else if (ok)
                {
                    _retriggerNoResponseWaitCountByLieu[m_idLieu] = 0;
                }

                if (forceImmediate)
                {
                    AlarmStateEvaluator.ResetState("alarm-nr", m_idLieu);
                    _noResponseStateByLieu[m_idLieu] = false;
                    _alarmStateByLieu[m_idLieu] = false;
                }

                if (!ok)
                {
                    SeedNoResponseDelayFromLastOk(settings, nowUtc);
                }

                var eval = AlarmStateEvaluator.Evaluate(
                    channel: "alarm-nr",
                    idLieu: m_idLieu,
                    value: value,
                    low: -0.1d,
                    high: 0.1d,
                    eligible: suppressRetriggerThisMeasure ? false : eligible,
                    debounceSeconds: forceImmediate ? 0 : Math.Max(0, settings.RetardNonReponseMinutes * 60),
                    ignorePolicyDebounce: forceImmediate,
                    nowUtc: nowUtc);

                if (!ok && (insertNullMeasureImmediately || eval.IsActive))
                {
                    var noResponseUnit = ths.GetDatabase().getLieuUnite(m_idLieu);
                    var insertedNoResponse = ths.GetDatabase().AddMesureNoResponse(m_sondeSerialNumber, noResponseUnit);
                    if (!insertedNoResponse)
                    {
                        VigitempServeur.Log($"HandleNoResponseAlarm: echec insertion mesure null sonde={m_sondeSerialNumber} lieu={m_idLieu}");
                    }
                }
                else if (!ok)
                {
                    VigitempServeur.Log(
                        $"Non-reponse sonde {m_sondeSerialNumber}: {reason ?? "unknown"} en attente retard={Math.Max(0, settings.RetardNonReponseMinutes)}m lieu={m_idLieu}");
                }

                if (eval.TransitionToActive)
                {
                    if (forceImmediate)
                    {
                        VigitempServeur.Log(
                            $"Re-declenchement immediat (alarme non-reponse acquittee) lieu {m_idLieu} - sonde {m_sondeSerialNumber}");
                    }
                    ths.GetDatabase().setNonResponseAlarm(m_idLieu, m_sondeSerialNumber, true);
                    VigitempServeur.Log($"Alarme non-reponse declenchee pour le lieu {m_idLieu} - sonde {m_sondeSerialNumber}");
                }
                else if (eval.TransitionToInactive)
                {
                    ths.GetDatabase().setNonResponseAlarm(m_idLieu, m_sondeSerialNumber, false);
                    ths.GetDatabase().setLieuImmediateRetriggerFlag(m_idLieu, true);
                    ths.InvalidateRetriggerFlagCache(m_idLieu);
                    _retriggerNoResponseWaitCountByLieu[m_idLieu] = 0;
                    VigitempServeur.Log($"Alarme non-reponse terminee pour le lieu {m_idLieu} - sonde {m_sondeSerialNumber}");
                }

                _noResponseStateByLieu[m_idLieu] = eval.IsActive;

                var overallAlarmActive =
                    (_lowAlarmStateByLieu.TryGetValue(m_idLieu, out var low) && low) ||
                    (_highAlarmStateByLieu.TryGetValue(m_idLieu, out var high) && high) ||
                    eval.IsActive;

                if (forceRetriggerFlag && overallAlarmActive)
                {
                    ths.GetDatabase().setLieuImmediateRetriggerFlag(m_idLieu, false);
                    ths.InvalidateRetriggerFlagCache(m_idLieu);
                    _retriggerNoResponseWaitCountByLieu[m_idLieu] = 0;
                }

                ApplyAlarmState(overallAlarmActive, preAlarmActive: false, valueForNotify: ok ? (double?)null : 0d);

                if (!ok && eval.IsActive && !string.IsNullOrWhiteSpace(reason))
                {
                    VigitempServeur.Log($"Non-reponse sonde {m_sondeSerialNumber}: {reason}");
                }
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("HandleNoResponseAlarm error: " + ex);
            }
        }

        private AlarmEvaluation EvaluateAlarmChannel(
            string channel,
            bool enabled,
            double value,
            double low,
            double high,
            bool eligible,
            int debounceSeconds,
            bool ignorePolicyDebounce,
            DateTime nowUtc)
        {
            if (!enabled)
            {
                return AlarmStateEvaluator.Evaluate(
                    channel: channel,
                    idLieu: m_idLieu,
                    value: 0d,
                    low: 0d,
                    high: 0d,
                    eligible: false,
                    debounceSeconds: 0,
                    ignorePolicyDebounce: false,
                    nowUtc: nowUtc);
            }

            return AlarmStateEvaluator.Evaluate(
                channel: channel,
                idLieu: m_idLieu,
                value: value,
                low: low,
                high: high,
                eligible: eligible,
                debounceSeconds: debounceSeconds,
                ignorePolicyDebounce: ignorePolicyDebounce,
                nowUtc: nowUtc);
        }

        private void ApplyAlarmState(bool alarmActive, bool preAlarmActive, double? valueForNotify)
        {
            var prevAlarm = _alarmStateByLieu.GetOrAdd(m_idLieu, false);
            var prevPre = _preAlarmStateByLieu.GetOrAdd(m_idLieu, false);

            if (prevAlarm != alarmActive || prevPre != preAlarmActive)
            {
                ths.GetDatabase().setLieuAlarmFlags(m_idLieu, isPreAlarm: preAlarmActive, isAlarm: alarmActive);
                _alarmStateByLieu[m_idLieu] = alarmActive;
                _preAlarmStateByLieu[m_idLieu] = preAlarmActive;
            }

            if (!prevAlarm && alarmActive)
            {
                // Notifications dispatchees via le poll d'alarme (evite les doublons et couvre les sondes GSO).
            }
            else if (prevAlarm && !alarmActive)
            {
                ths.GetDatabase().setLieuImmediateRetriggerFlag(m_idLieu, true);
                ths.InvalidateRetriggerFlagCache(m_idLieu);
                _retriggerLowWaitCountByLieu[m_idLieu] = 0;
                _retriggerHighWaitCountByLieu[m_idLieu] = 0;
                VigitempServeur.Log($"Alarme terminee (H/B) pour le lieu {m_idLieu} - sonde {m_sondeSerialNumber}");
                if (_legacyAgentNotificationsEnabled)
                {
                    var ips_clients = ths.GetDatabase().getPCsClients();
                    var maxRecipients = Math.Max(1, _legacyAgentNotificationMaxRecipients);
                    var count = Math.Min(ips_clients.Count, maxRecipients);
                    for (int i = 0; i < count; i++)
                    {
                        HideAlarmOnClientAsync(ips_clients[i]);
                    }
                }
            }
        }

        private static bool GetSettingBool(string key, bool defaultValue)
        {
            try
            {
                var raw = ConfigurationManager.AppSettings[key];
                if (string.IsNullOrWhiteSpace(raw)) return defaultValue;
                if (bool.TryParse(raw, out var value)) return value;
                return defaultValue;
            }
            catch
            {
                return defaultValue;
            }
        }

        private static int GetSettingInt(string key, int defaultValue)
        {
            try
            {
                var raw = ConfigurationManager.AppSettings[key];
                if (string.IsNullOrWhiteSpace(raw)) return defaultValue;
                if (int.TryParse(raw, NumberStyles.Integer, CultureInfo.InvariantCulture, out var value)) return value;
                return defaultValue;
            }
            catch
            {
                return defaultValue;
            }
        }

        public static void ClearAlarmState(int idLieu)
        {
            _alarmStateByLieu.TryRemove(idLieu, out _);
            _preAlarmStateByLieu.TryRemove(idLieu, out _);
            _lowAlarmStateByLieu.TryRemove(idLieu, out _);
            _highAlarmStateByLieu.TryRemove(idLieu, out _);
            _noResponseStateByLieu.TryRemove(idLieu, out _);
            _retriggerLowWaitCountByLieu.TryRemove(idLieu, out _);
            _retriggerHighWaitCountByLieu.TryRemove(idLieu, out _);
            _retriggerNoResponseWaitCountByLieu.TryRemove(idLieu, out _);
            _sensorPowerAlarmStateByLieu.TryRemove(idLieu, out _);
        }

        /// <summary>
        /// Called at startup to reconcile in-memory alarm state with the DB.
        /// Prevents re-triggering alarms that were already active before restart.
        /// </summary>
        public static void SeedAlarmState(int idLieu, bool isAlarmActive, bool isNoResponseActive)
        {
            if (isAlarmActive)
            {
                // LIMITATION : Est_Lieu_En_Alarme ne distingue pas H/B.
                // On sème les deux canaux à true pour éviter un re-déclenchement immédiat
                // au redémarrage. Le prochain cycle de mesure corrigera l'état réel.
                _alarmStateByLieu[idLieu] = true;
                _lowAlarmStateByLieu[idLieu] = true;
                _highAlarmStateByLieu[idLieu] = true;
                AlarmStateEvaluator.ForceActive("alarm-low", idLieu);
                AlarmStateEvaluator.ForceActive("alarm-high", idLieu);
            }
            if (isNoResponseActive)
            {
                _noResponseStateByLieu[idLieu] = true;
                AlarmStateEvaluator.ForceActive("alarm-nr", idLieu);
                if (!isAlarmActive) _alarmStateByLieu[idLieu] = true;
            }
        }

        private void SeedNoResponseDelayFromLastOk(LieuAlarmSettings settings, DateTime nowUtc)
        {
            if (settings == null) return;
            var lastResponse = settings.DateHeureDerniereReponse != default(DateTime)
                ? settings.DateHeureDerniereReponse
                : settings.DateHeureDerniereReponseRecueOk;
            if (lastResponse == default(DateTime)) return;

            var lastResponseUtc = lastResponse.Kind == DateTimeKind.Utc
                ? lastResponse
                : DateTime.SpecifyKind(lastResponse, DateTimeKind.Local).ToUniversalTime();

            if (lastResponseUtc > nowUtc) return;

            AlarmStateEvaluator.SeedOutOfRangeSinceIfEmpty("alarm-nr", m_idLieu, lastResponseUtc);
        }

    }
}










