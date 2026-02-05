﻿using System;
using System.Diagnostics;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Timers;
using Vigitemp_Serveur.sensors;
using System.IO.Ports;

namespace Vigitemp_Serveur
{
    class ThreadServeur
    {
        private readonly SemaphoreSlim semaphore = new SemaphoreSlim(1, 1);
        private static readonly object _lock = new object();
        private CancellationToken m_cts;
        private IDatabaseProvider m_database;
        private Sensor sensor;
        private string sensorType;
        private readonly ConcurrentDictionary<int, SensorSchedule> _schedules =
            new ConcurrentDictionary<int, SensorSchedule>();
        private List<SerialPort> list_SerialPort_open = new List<SerialPort>();

        private System.Timers.Timer _schedulerTimer;
        private System.Timers.Timer _maintenanceTimer;
        private int _idServer;
        private readonly ConcurrentDictionary<int, CachedLieuSettings> _lieuSettingsCache =
            new ConcurrentDictionary<int, CachedLieuSettings>();
        private readonly object _lieuSettingsLock = new object();
        private readonly int _settingsCacheSeconds = GetSettingInt("Vigi.License.SettingsCacheSeconds", 60);
        private readonly bool _logSettingsCache = GetSettingBool("Vigitemp.Alarms.LogSettingsCache", true);
        private readonly int _schedulerTickMs = GetSettingInt("Vigitemp.Scheduler.TickMs", 5000);
        private readonly bool _logScheduler = GetSettingBool("Vigitemp.Scheduler.Log", true);

        private sealed class CachedLieuSettings
        {
            public CachedLieuSettings(LieuAlarmSettings settings, DateTime fetchedAtUtc)
            {
                Settings = settings;
                FetchedAtUtc = fetchedAtUtc;
            }

            public LieuAlarmSettings Settings { get; }
            public DateTime FetchedAtUtc { get; }
        }

        private sealed class SensorSchedule
        {
            public int IdLieu { get; set; }
            public string Serial { get; set; }
            public string Adresse { get; set; }
            public string Port { get; set; }
            public string Module { get; set; }
            public int FrequencySeconds { get; set; }
            public DateTime? LastMeasure { get; set; }
            public DateTime NextDue { get; set; }
            public bool InProgress { get; set; }
        }

        public ThreadServeur(CancellationToken obj, int p_idServer)
        {
            this.m_cts = obj;
            this._idServer = p_idServer;
        }

        public IDatabaseProvider GetDatabase()
        { // singleton
            if (m_database == null)
            {
                lock (_lock)
                {
                    if (m_database == null)
                    {
                        m_database = DatabaseFactory.Create();
                    }
                }
            }
            return m_database;
            // return new Database();
        }

        public LieuAlarmSettings GetLieuAlarmSettingsCached(int idLieu)
        {
            if (idLieu <= 0) return null;

            var nowUtc = DateTime.UtcNow;

            if (_lieuSettingsCache.TryGetValue(idLieu, out var cached))
            {
                if ((nowUtc - cached.FetchedAtUtc).TotalSeconds <= _settingsCacheSeconds)
                {
                    if (_logSettingsCache)
                    {
                        LogLieuSettings(idLieu, cached.Settings, "cache-hit");
                    }
                    return cached.Settings;
                }
                if (_logSettingsCache)
                {
                    LogLieuSettings(idLieu, cached.Settings, "cache-expired");
                }
            }

            lock (_lieuSettingsLock)
            {
                if (_lieuSettingsCache.TryGetValue(idLieu, out cached))
                {
                    if ((nowUtc - cached.FetchedAtUtc).TotalSeconds <= _settingsCacheSeconds)
                    {
                        if (_logSettingsCache)
                        {
                            LogLieuSettings(idLieu, cached.Settings, "cache-hit");
                        }
                        return cached.Settings;
                    }
                    if (_logSettingsCache)
                    {
                        LogLieuSettings(idLieu, cached.Settings, "cache-expired");
                    }
                }

                var settings = GetDatabase().getLieuAlarmSettings(idLieu);
                if (settings == null)
                {
                    if (_logSettingsCache)
                    {
                        VigitempServeur.Log($"LieuAlarmSettings[db-null] idLieu={idLieu}");
                    }
                    return null;
                }

                _lieuSettingsCache[idLieu] = new CachedLieuSettings(settings, nowUtc);
                if (_logSettingsCache)
                {
                    LogLieuSettings(idLieu, settings, "db-refresh");
                }
                return settings;
            }
        }

        private static int GetSettingInt(string key, int defaultValue)
        {
            try
            {
                var raw = ConfigurationManager.AppSettings[key];
                if (string.IsNullOrWhiteSpace(raw)) return defaultValue;
                if (int.TryParse(raw, out var value)) return value;
                return defaultValue;
            }
            catch
            {
                return defaultValue;
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

        private static void LogLieuSettings(int idLieu, LieuAlarmSettings settings, string source)
        {
            if (settings == null) return;
            VigitempServeur.Log(
                $"LieuAlarmSettings[{source}] idLieu={idLieu} " +
                $"consigneInf={settings.ConsigneInf?.ToString() ?? "null"} " +
                $"consigneSup={settings.ConsigneSup?.ToString() ?? "null"} " +
                $"consigneInfActive={settings.ConsigneInfActive} " +
                $"consigneSupActive={settings.ConsigneSupActive} " +
                $"consigneInfPre={settings.ConsigneInfPreAlarme?.ToString() ?? "null"} " +
                $"consigneInfPreActive={settings.ConsigneInfPreAlarmeActive} " +
                $"consigneSupPre={settings.ConsigneSupPreAlarme?.ToString() ?? "null"} " +
                $"consigneSupPreActive={settings.ConsigneSupPreAlarmeActive} " +
                $"retardBasMin={settings.RetardAlarmeBasMinutes} " +
                $"retardHautMin={settings.RetardAlarmeHautMinutes} " +
                $"retardNonReponseMin={settings.RetardNonReponseMinutes} " +
                $"notificationActive={settings.NotificationActive} " +
                $"reactivationUtc={settings.DateHeureReactivationAlarme:O}"
            );
        }

        public void Start()
        {
            VigitempServeur.Log("Starting Thread#" + _idServer + "...");
            RefreshSchedule();

            _schedulerTimer = new System.Timers.Timer(_schedulerTickMs);
            _schedulerTimer.Elapsed += ProcessSchedulerTick;
            _schedulerTimer.Start();
            if (_logScheduler)
            {
                VigitempServeur.Log($"Thread#{_idServer} scheduler start: tickMs={_schedulerTickMs}");
            }

            _maintenanceTimer = new System.Timers.Timer(60000);//timer de 1 minutes
                                                              //Set action associated to each tick
            _maintenanceTimer.Elapsed += ProcessMaintenanceTick;
            //Start the timer
            _maintenanceTimer.Start();
            //Console.WriteLine("Thread#" + _idServer + " started!");
            //Trace.WriteLine("Thread#" + _idServer + " started!");
            VigitempServeur.Log("Thread#" + _idServer + " started!");
        }

        public void Stop()
        {

            //Clean your ressources here

            //Console.WriteLine("Stopping Thread#" + _idServer + "...");
            //Trace.WriteLine("Stopping Thread#" + _idServer + "...");
            VigitempServeur.Log("Stopping Thread#" + _idServer + "...");

            try
            {
                _schedulerTimer?.Stop();
                _schedulerTimer?.Dispose();
                _schedulerTimer = null;
            }
            catch
            {
                // ignore
            }

            _schedules.Clear();

            try
            {
                _maintenanceTimer?.Stop();
                _maintenanceTimer?.Dispose();
                _maintenanceTimer = null;
            }
            catch
            {
                // ignore
            }

            foreach (SerialPort sp in list_SerialPort_open)
            {
                if (sp.IsOpen)
                {
                    sp.Close();
                }
                sp.Dispose();
            }
            //Stop timer
            //Console.WriteLine("Thread#" + _idServer + " stopped!");
            //Trace.WriteLine("Thread#" + _idServer + " stopped!");
            VigitempServeur.Log("Thread#" + _idServer + " stopped!");

        }

        public void list_addComPort(SerialPort p_serialport)
        {
            this.list_SerialPort_open.Add(p_serialport);
        }

        public void list_removeComPort(SerialPort p_serialport)
        {
            this.list_SerialPort_open.RemoveAll((SerialPort element) => { return element.Equals(p_serialport); });
        }

        private void ProcessSchedulerTick(object sender, ElapsedEventArgs e)
        {
            _ = ProcessSchedulerTickAsync();
        }

        private async Task ProcessSchedulerTickAsync()
        {
            var acquired = false;

            try
            {
                try
                {
                    if (!await semaphore.WaitAsync(0, m_cts))
                    {
                        return;
                    }
                    acquired = true;
                }
                catch (OperationCanceledException)
                {
                    return;
                }

                if (m_cts.IsCancellationRequested)
                {
                    return;
                }

                if (_schedules.IsEmpty)
                {
                    RefreshSchedule();
                }

                var now = DateTime.Now;
                double ComputePriority(SensorSchedule schedule)
                {
                    if (schedule == null) return double.MinValue;
                    var freq = Math.Max(1, schedule.FrequencySeconds);
                    var latenessSeconds = (now - schedule.NextDue).TotalSeconds;
                    if (latenessSeconds < 0) latenessSeconds = 0;
                    return latenessSeconds / freq;
                }

                var due = _schedules.Values
                    .Where(s => !s.InProgress && IsScheduleDue(s, now))
                    .OrderByDescending(ComputePriority)
                    .ThenBy(s => s.FrequencySeconds)
                    .ThenBy(s => s.NextDue)
                    .ToList();

                foreach (var schedule in due)
                {
                    schedule.InProgress = true;
                    try
                    {
                        await InterrogateSchedule(schedule);
                    }
                    catch (Exception ex)
                    {
                        VigitempServeur.Log("ThreadServeur.Scheduler error: " + ex);
                    }
                    finally
                    {
                        schedule.LastMeasure = DateTime.Now;
                        schedule.NextDue = schedule.LastMeasure.Value.AddSeconds(schedule.FrequencySeconds);
                        schedule.InProgress = false;
                    }
                }
            }
            finally
            {
                if (acquired)
                {
                    semaphore.Release();
                }
            }
        }

        private async Task InterrogateSchedule(SensorSchedule schedule)
        {
            var serial = schedule.Serial;
            if (string.IsNullOrEmpty(serial) || serial.Length < 2)
            {
                VigitempServeur.Log("Numero de serie invalide pour le lieu " + schedule.IdLieu + ".");
                return;
            }

            VigitempServeur.Log("--------------------ID SERVEUR : " + _idServer + "---CAPTEUR : " + serial + "--------------------");
            VigitempServeur.Log("Ouverture du port " + schedule.Port + " pour la sonde " + serial);
            sensorType = serial.StartsWith("GSP", StringComparison.OrdinalIgnoreCase)
                ? "GSP"
                : serial.Substring(0, 2);

            switch (sensorType)
            {
                case "IN":
                    VigitempServeur.nombres_interrogations++;
                    sensor = new SensorIN(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.Log($"Interrogation sonde IN serial={serial} port={schedule.Port} adresse={schedule.Adresse}");
                    await sensor.read();
                    break;
                case "IE":
                    VigitempServeur.nombres_interrogations++;
                    sensor = new SensorIE(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.Log($"Interrogation sonde IE serial={serial} port={schedule.Port} adresse={schedule.Adresse}");
                    await sensor.read();
                    break;
                case "IQ":
                    break;
                case "IP":
                    VigitempServeur.nombres_interrogations++;
                    sensor = new SensorIP(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.Log($"Interrogation sonde IP serial={serial} port={schedule.Port} adresse={schedule.Adresse}");
                    await sensor.read();
                    break;
                case "IC":
                    VigitempServeur.nombres_interrogations++;
                    sensor = new SensorIC(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.Log($"Interrogation sonde IC serial={serial} port={schedule.Port} adresse={schedule.Adresse}");
                    await sensor.read();
                    break;
                case "IH":
                    VigitempServeur.nombres_interrogations++;
                    sensor = new SensorIH(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.Log($"Interrogation sonde IH serial={serial} port={schedule.Port} adresse={schedule.Adresse}");
                    await sensor.read();
                    break;
                case "EN":
                    VigitempServeur.nombres_interrogations++;
                    sensor = new SensorEN(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.Log($"Interrogation sonde EN serial={serial} port={schedule.Port} adresse={schedule.Adresse}");
                    await sensor.read();
                    break;
                case "HN":
                    VigitempServeur.nombres_interrogations++;
                    sensor = new SensorHN(this, schedule.Port, serial, schedule.Adresse, schedule.Module);
                    VigitempServeur.Log($"Interrogation sonde HN serial={serial} port={schedule.Port} adresse={schedule.Adresse} module={schedule.Module}");
                    await sensor.read();
                    break;
                case "GSP":
                    VigitempServeur.nombres_interrogations++;
                    sensor = new SensorGSP(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.Log($"Interrogation sonde GSP serial={serial} port={schedule.Port} adresse={schedule.Adresse}");
                    await sensor.read();
                    break;
                default:
                    break;
            }
        }

        private void ProcessMaintenanceTick(object sender, ElapsedEventArgs e)
        {
            _ = ProcessMaintenanceTickAsync();
        }

        private async Task ProcessMaintenanceTickAsync()
        {
            var acquired = false;

            try
            {
                try
                {
                    await semaphore.WaitAsync(m_cts);
                    acquired = true;
                }
                catch (OperationCanceledException)
                {
                    return;
                }

                RefreshSchedule();

                //cherche les lieux avec une dateReactivationAlarme passé pour réactiver les alarmes
                //VigitempServeur.Log("process 1 minute");
                (List<int> arr_lieuxAvecAlarmeSnooze, List<DateTime> arr_dateDeRemiseEnAlarme) = GetDatabase().getLieuxAvecAlarmesEnSnooze();
                for (int i = 0; i < arr_lieuxAvecAlarmeSnooze.Count(); i++)
                {
                    if (arr_dateDeRemiseEnAlarme[i].CompareTo(DateTime.Now) <= 0 )
                    {
                        VigitempServeur.Log("Le lieu " + arr_lieuxAvecAlarmeSnooze[i] + " doit etre reactivé.");

                        GetDatabase().setAlarmeByIdLieu(arr_lieuxAvecAlarmeSnooze[i], true);

                        double derniereMesure =  GetDatabase().getLastMeasure(arr_lieuxAvecAlarmeSnooze[i]);


                        //recuperer infos du lieu
                        (string arr_portSerie, string arr_sondeNumeroSerie, string arr_sondeAdresse, string arr_moduleNumeroSerie) = GetDatabase().getInfosByIdLieu(arr_lieuxAvecAlarmeSnooze[i]);
                        //if (arr_sondeNumeroSerie != "")
                        //{
                            //for (int i = 0; i < arr_sondeNumeroSerie.Count; i++)
                            //{
                        if (string.IsNullOrEmpty(arr_sondeNumeroSerie) || arr_sondeNumeroSerie.Length < 2)
                        {
                            VigitempServeur.Log("Numero de serie invalide pour le lieu " + arr_lieuxAvecAlarmeSnooze[i] + ".");
                            continue;
                        }
                        VigitempServeur.Log("Ouverture du port " + arr_portSerie + " pour la sonde " + arr_sondeNumeroSerie);
                                sensorType = arr_sondeNumeroSerie.StartsWith("GSP", StringComparison.OrdinalIgnoreCase)
                                    ? "GSP"
                                    : arr_sondeNumeroSerie.Substring(0, 2);

                                switch (sensorType)
                                {
                                    case "IN":
                                        sensor = new SensorIN(this, arr_portSerie, arr_sondeNumeroSerie, arr_sondeAdresse);
                                        //await sensor.read();
                                        break;
                                    case "IE":
                                        //VigitempServeur.nombres_interrogations++;
                                        sensor = new SensorIE(this, arr_portSerie, arr_sondeNumeroSerie, arr_sondeAdresse);
                                        //await sensor.read();
                                        break;
                                    case "IQ":

                                        break;
                                    case "IP":
                                        //VigitempServeur.nombres_interrogations++;
                                        sensor = new SensorIP(this, arr_portSerie, arr_sondeNumeroSerie, arr_sondeAdresse);
                                        //await sensor.read();
                                        break;
                                    case "IC":
                                        //VigitempServeur.nombres_interrogations++;
                                        sensor = new SensorIC(this, arr_portSerie, arr_sondeNumeroSerie, arr_sondeAdresse);
                                        //await sensor.read();
                                        break;
                                    case "IH":
                                        //VigitempServeur.nombres_interrogations++;
                                        sensor = new SensorIH(this, arr_portSerie, arr_sondeNumeroSerie, arr_sondeAdresse);
                                        //await sensor.read();
                                        break;
                                    case "EN":
                                        //VigitempServeur.nombres_interrogations++;
                                        sensor = new SensorEN(this, arr_portSerie, arr_sondeNumeroSerie, arr_sondeAdresse);
                                        //await sensor.read();
                                        break;

                                    case "HN":
                                        //VigitempServeur.nombres_interrogations++;
                                        sensor = new SensorHN(this, arr_portSerie, arr_sondeNumeroSerie, arr_sondeAdresse, arr_moduleNumeroSerie);
                                        //await sensor.read();
                                        break;
                                    case "GSP":
                                        sensor = new SensorGSP(this, arr_portSerie, arr_sondeNumeroSerie, arr_sondeAdresse);
                                        break;
                                    default: break;
                                }
                        //}

                        //}

                        
                        if (sensor == null)
                        {
                            VigitempServeur.Log("Aucun capteur cree pour le lieu " + arr_lieuxAvecAlarmeSnooze[i] + ".");
                            continue;
                        }
                        sensor.compareMeasuresAndLimits(derniereMesure);
                    }
                }

                // Réactivation automatique de la surveillance (Lieu_Etat)
                (List<int> arr_lieuxSurveillanceSnooze, List<DateTime> arr_dateSurveillance) = GetDatabase().getLieuxAvecSurveillanceEnSnooze();
                for (int i = 0; i < arr_lieuxSurveillanceSnooze.Count(); i++)
                {
                    if (arr_dateSurveillance[i].CompareTo(DateTime.Now) <= 0)
                    {
                        VigitempServeur.Log("Surveillance réactivée pour le lieu " + arr_lieuxSurveillanceSnooze[i] + ".");
                        GetDatabase().setSurveillanceByIdLieu(arr_lieuxSurveillanceSnooze[i], true);
                        GetDatabase().writeAuditJournal(
                            "ACT",
                            "SERVEUR",
                            "SYSTEME",
                            arr_lieuxSurveillanceSnooze[i],
                            "Réactivation automatique de la surveillance",
                            null);
                    }
                }
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("ThreadServeur.ProcessMaintenanceTick error: " + ex);
            }
            finally
            {
                if (acquired)
                {
                    semaphore.Release();
                }
            }
        }

        private void RefreshSchedule()
        {
            var now = DateTime.Now;
            var rows = GetDatabase().getSondesActivesByServeur(this._idServer);
            var seen = new HashSet<int>();

            foreach (var row in rows)
            {
                if (row == null) continue;
                if (row.FrequenceSecondes <= 0) continue;

                seen.Add(row.IdLieu);

                if (!_schedules.TryGetValue(row.IdLieu, out var schedule))
                {
                    schedule = BuildSchedule(row, now);
                    _schedules[row.IdLieu] = schedule;
                    if (_logScheduler)
                    {
                        VigitempServeur.Log($"Scheduler add idLieu={row.IdLieu} serial={row.SondeNumeroSerie} freqSec={row.FrequenceSecondes}");
                    }

                    if (row.InfosModifiees)
                    {
                        GetDatabase().setLieuInfosModifiees(row.IdLieu, false);
                    }
                    continue;
                }

                var hasChanges = row.InfosModifiees ||
                                 !string.Equals(schedule.Serial, row.SondeNumeroSerie, StringComparison.Ordinal) ||
                                 !string.Equals(schedule.Adresse, row.AdresseSonde, StringComparison.Ordinal) ||
                                 !string.Equals(schedule.Port, row.PortSerie, StringComparison.Ordinal) ||
                                 !string.Equals(schedule.Module, row.ModuleNumeroSerie, StringComparison.Ordinal) ||
                                 schedule.FrequencySeconds != row.FrequenceSecondes;

                if (hasChanges)
                {
                    schedule.Serial = row.SondeNumeroSerie;
                    schedule.Adresse = row.AdresseSonde;
                    schedule.Port = row.PortSerie;
                    schedule.Module = row.ModuleNumeroSerie;
                    schedule.FrequencySeconds = row.FrequenceSecondes;
                    schedule.LastMeasure = row.DerniereDateHeure ?? schedule.LastMeasure;
                    schedule.NextDue = ComputeNextDue(now, schedule.LastMeasure, schedule.FrequencySeconds);

                    if (_logScheduler)
                    {
                        VigitempServeur.Log($"Scheduler update idLieu={row.IdLieu} serial={row.SondeNumeroSerie} freqSec={row.FrequenceSecondes}");
                    }

                    if (row.InfosModifiees)
                    {
                        GetDatabase().setLieuInfosModifiees(row.IdLieu, false);
                    }
                }
            }

            var toRemove = _schedules.Keys.Where(id => !seen.Contains(id)).ToList();
            foreach (var idLieu in toRemove)
            {
                _schedules.TryRemove(idLieu, out _);
                if (_logScheduler)
                {
                    VigitempServeur.Log($"Scheduler remove idLieu={idLieu}");
                }
            }
        }

        private static SensorSchedule BuildSchedule(SondeScheduleInfo info, DateTime now)
        {
            var lastMeasure = info.DerniereDateHeure;
            return new SensorSchedule
            {
                IdLieu = info.IdLieu,
                Serial = info.SondeNumeroSerie,
                Adresse = info.AdresseSonde,
                Port = info.PortSerie,
                Module = info.ModuleNumeroSerie,
                FrequencySeconds = info.FrequenceSecondes,
                LastMeasure = lastMeasure,
                NextDue = ComputeNextDue(now, lastMeasure, info.FrequenceSecondes)
            };
        }

        private static bool IsScheduleDue(SensorSchedule schedule, DateTime now)
        {
            if (schedule == null) return false;

            if (schedule.LastMeasure.HasValue)
            {
                var minDue = schedule.LastMeasure.Value.AddSeconds(schedule.FrequencySeconds);
                return now >= minDue;
            }

            return schedule.NextDue <= now;
        }

        private static DateTime ComputeNextDue(DateTime now, DateTime? lastMeasure, int frequencySeconds)
        {
            var baseTime = lastMeasure ?? now;
            if (baseTime > now)
            {
                baseTime = now;
            }
            return baseTime.AddSeconds(frequencySeconds);
        }
    }
}
