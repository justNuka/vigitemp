using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
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

        public bool compareMeasuresAndLimits(double p_valeur)
        {
            try
            {
                List<string> ips_clients = ths.GetDatabase().getPCsClients();

                var settings = ths.GetDatabase().getLieuAlarmSettings(m_idLieu);
                if (settings == null)
                {
                    VigitempServeur.Log("compareMeasuresAndLimits: settings null pour le lieu " + m_idLieu);
                    return false;
                }

                var hasLow = settings.ConsigneInfActive && settings.ConsigneInf.HasValue;
                var hasHigh = settings.ConsigneSupActive && settings.ConsigneSup.HasValue;

                if (!hasLow && !hasHigh)
                {
                    // Pas de consigne active -> pas d'alarme.
                    return true;
                }

                // Valeurs bornes: si une borne est inactive, on utilise une plage "très large"
                // pour éviter d'activer l'alarme sur ce côté.
                var low = hasLow ? settings.ConsigneInf.Value : -1_000_000_000d;
                var high = hasHigh ? settings.ConsigneSup.Value : 1_000_000_000d;

                var policy = AlarmPolicy.Current;
                var eligible =
                    (settings.NotificationActive ||
                     (policy.ShowWhileSnoozed && settings.DateHeureReactivationAlarme != default(DateTime)));

                var isBelow = hasLow && p_valeur < settings.ConsigneInf.Value;
                var isAbove = hasHigh && p_valeur > settings.ConsigneSup.Value;

                var delaySeconds = 0;
                if (isBelow)
                {
                    delaySeconds = Math.Max(0, settings.RetardAlarmeBasMinutes) * 60;
                }
                else if (isAbove)
                {
                    delaySeconds = Math.Max(0, settings.RetardAlarmeHautMinutes) * 60;
                }

                var evaluation = AlarmStateEvaluator.Evaluate(
                    channel: "alarm",
                    idLieu: m_idLieu,
                    value: p_valeur,
                    low: low,
                    high: high,
                    eligible: eligible,
                    debounceSeconds: delaySeconds,
                    nowUtc: DateTime.UtcNow);

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
                        nowUtc: DateTime.UtcNow);
                }

                var effectivePreAlarm = preEvaluation.IsActive && !evaluation.IsActive;

                var shouldUpdateFlags =
                    evaluation.TransitionToActive ||
                    evaluation.TransitionToInactive ||
                    (!evaluation.IsActive && (preEvaluation.TransitionToActive || preEvaluation.TransitionToInactive));

                if (shouldUpdateFlags)
                {
                    ths.GetDatabase().setLieuAlarmFlags(m_idLieu, isPreAlarm: effectivePreAlarm, isAlarm: evaluation.IsActive);
                }

                if (evaluation.TransitionToActive)
                {
                    _ = AlarmWebNotifier.NotifyAlarmAsync(m_idLieu, p_valeur);

                    for (int i = 0; i < ips_clients.Count; i++)
                    {
                        _ = client.PostAsync("http://" + ips_clients[i] + ":8000/alarm?action=show&idLieu=" + m_idLieu, null);
                    }
                }
                else if (evaluation.TransitionToInactive)
                {
                    for (int i = 0; i < ips_clients.Count; i++)
                    {
                        _ = client.PostAsync("http://" + ips_clients[i] + ":8000/alarm?action=hide&idLieu=" + m_idLieu, null);
                    }
                }

                return true;
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("compareMeasuresAndLimits error: " + ex);
                return false;
            }
        }
    }
}