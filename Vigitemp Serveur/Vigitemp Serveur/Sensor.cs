using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO.Ports;
using System.Net.Http;
using System.Threading.Tasks;

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
        public bool pendingResults = false;
        // private string m_regexResponseTempSensor = @"R[A-Z][0-9]{2}[A-Z]TEMP-?[0-9]{1,3}.[0-9]{2}'C";
        public string m_sensor_response;

        public ThreadServeur ths;

        protected string tmp_resistance = "";
        protected string tmp_valeur = "";
        protected string tmp_numeroSerie = "";
        protected Stopwatch sw;

        private static readonly HttpClient client = new HttpClient();
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

        // Constructeur
        public Sensor(ThreadServeur p_ths, string p_comPort, string p_sondeSerialNumber, string p_sondeAdresse)
        {
            this.ths = p_ths;
            m_comPort = p_comPort;
            m_sondeSerialNumber = p_sondeSerialNumber;
            m_sondeAdresse = p_sondeAdresse;
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

        public abstract Task<bool> read();
        protected abstract void DataReceivedHandler(object sender, SerialDataReceivedEventArgs e);
        protected double ApplyMetrology(double rawValue)
        {
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

                var forceImmediateRetrigger = ths.GetDatabase().getLieuImmediateRetriggerFlag(m_idLieu);

                var forceLowImmediate = hasLow && forceImmediateRetrigger;
                if (forceLowImmediate)
                {
                    AlarmStateEvaluator.ResetState("alarm-low", m_idLieu);
                    _lowAlarmStateByLieu[m_idLieu] = false;
                    _alarmStateByLieu[m_idLieu] = false;
                }

                var forceHighImmediate = hasHigh && forceImmediateRetrigger;
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
                    eligible: eligible,
                    debounceSeconds: forceLowImmediate ? 0 : Math.Max(0, settings.RetardAlarmeBasMinutes * 60),
                    ignorePolicyDebounce: forceLowImmediate,
                    nowUtc: nowUtc);

                var highEval = EvaluateAlarmChannel(
                    channel: "alarm-high",
                    enabled: hasHigh,
                    value: p_valeur,
                    low: hasHigh ? -1_000_000_000d : 0d,
                    high: hasHigh ? settings.ConsigneSup.Value : 0d,
                    eligible: eligible,
                    debounceSeconds: forceHighImmediate ? 0 : Math.Max(0, settings.RetardAlarmeHautMinutes * 60),
                    ignorePolicyDebounce: forceHighImmediate,
                    nowUtc: nowUtc);

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

                if (forceImmediateRetrigger)
                {
                    ths.GetDatabase().setLieuImmediateRetriggerFlag(m_idLieu, false);
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

        protected void HandleNoResponseAlarm(bool ok, string reason = null)
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

                if (!ok)
                {
                    var noResponseUnit = ths.GetDatabase().getLieuUnite(m_idLieu);
                    var insertedNoResponse = ths.GetDatabase().AddMesureNoResponse(m_sondeSerialNumber, noResponseUnit);
                    if (!insertedNoResponse)
                    {
                        VigitempServeur.Log($"HandleNoResponseAlarm: echec insertion mesure null sonde={m_sondeSerialNumber} lieu={m_idLieu}");
                    }
                }

                var value = ok ? 0d : 1d;
                var forceImmediate = !ok && ths.GetDatabase().getLieuImmediateRetriggerFlag(m_idLieu);
                if (forceImmediate)
                {
                    AlarmStateEvaluator.ResetState("alarm-nr", m_idLieu);
                    _noResponseStateByLieu[m_idLieu] = false;
                    _alarmStateByLieu[m_idLieu] = false;
                }

                var eval = AlarmStateEvaluator.Evaluate(
                    channel: "alarm-nr",
                    idLieu: m_idLieu,
                    value: value,
                    low: -0.1d,
                    high: 0.1d,
                    eligible: eligible,
                    debounceSeconds: forceImmediate ? 0 : Math.Max(0, settings.RetardNonReponseMinutes * 60),
                    ignorePolicyDebounce: forceImmediate,
                    nowUtc: nowUtc);

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
                    VigitempServeur.Log($"Alarme non-reponse terminee pour le lieu {m_idLieu} - sonde {m_sondeSerialNumber}");
                }

                _noResponseStateByLieu[m_idLieu] = eval.IsActive;

                var overallAlarmActive =
                    (_lowAlarmStateByLieu.TryGetValue(m_idLieu, out var low) && low) ||
                    (_highAlarmStateByLieu.TryGetValue(m_idLieu, out var high) && high) ||
                    eval.IsActive;

                if (ths.GetDatabase().getLieuImmediateRetriggerFlag(m_idLieu) && (overallAlarmActive || ok))
                {
                    ths.GetDatabase().setLieuImmediateRetriggerFlag(m_idLieu, false);
                }

                ApplyAlarmState(overallAlarmActive, preAlarmActive: false, valueForNotify: ok ? (double?)null : 0d);

                if (!ok && !string.IsNullOrWhiteSpace(reason))
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
                // Notifications dispatchées via le poll d'alarme (évite les doublons et couvre les sondes GSO).
            }
            else if (prevAlarm && !alarmActive)
            {
                ths.GetDatabase().setThresholdAlarmEnded(m_idLieu);
                VigitempServeur.Log($"Alarme terminee (H/B) pour le lieu {m_idLieu} - sonde {m_sondeSerialNumber}");
                var ips_clients = ths.GetDatabase().getPCsClients();
                for (int i = 0; i < ips_clients.Count; i++)
                {
                    _ = client.PostAsync("http://" + ips_clients[i] + ":8000/alarm?action=hide&idLieu=" + m_idLieu, null);
                }
            }
        }

    }
}








