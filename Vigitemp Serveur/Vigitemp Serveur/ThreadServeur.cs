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
        private List<System.Timers.Timer> timers = new List<System.Timers.Timer>();
        private List<int> frequencies = new List<int>();
        private List<Status> frequencies_status = new List<Status>();
        private List<SerialPort> list_SerialPort_open = new List<SerialPort>();

        private enum Status
        {
            EN_ATTENTE,
            EN_COURS
        }


        private System.Timers.Timer _maintenanceTimer;
        private int _idServer;
        private readonly ConcurrentDictionary<int, CachedLieuSettings> _lieuSettingsCache =
            new ConcurrentDictionary<int, CachedLieuSettings>();
        private readonly object _lieuSettingsLock = new object();
        private readonly int _settingsCacheSeconds = GetSettingInt("Vigitemp.Alarms.SettingsCacheSeconds", 60);

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
                    return cached.Settings;
                }
            }

            lock (_lieuSettingsLock)
            {
                if (_lieuSettingsCache.TryGetValue(idLieu, out cached))
                {
                    if ((nowUtc - cached.FetchedAtUtc).TotalSeconds <= _settingsCacheSeconds)
                    {
                        return cached.Settings;
                    }
                }

                var settings = GetDatabase().getLieuAlarmSettings(idLieu);
                if (settings == null)
                {
                    return null;
                }

                _lieuSettingsCache[idLieu] = new CachedLieuSettings(settings, nowUtc);
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

        public void Start()
        {
            VigitempServeur.Log("Starting Thread#" + _idServer + "...");
            List<int> arr_frequencies = GetDatabase().getDistinctFrequenciesByIdServeur(this._idServer);
            foreach (int frequency in arr_frequencies)
            {
                var timer = new System.Timers.Timer(frequency * 1000);
                //Set action associated to each tick
                timer.Elapsed += (sender, e) => Process(sender, e, frequency);
                //Start the timer
                timer.Start();
                this.timers.Add(timer);
                this.frequencies.Add(frequency);
                this.frequencies_status.Add(Status.EN_ATTENTE);
            }

            _maintenanceTimer = new System.Timers.Timer(60000);//timer de 1 minutes
                                                              //Set action associated to each tick
            _maintenanceTimer.Elapsed += ProcessGetFrequenciesAndReactivateSnoozedAlarm;
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

            foreach (System.Timers.Timer timer in timers)
            {
                timer.Stop();
                //Dispose timer
                timer.Dispose();
            }
            timers.Clear();
            frequencies.Clear();
            frequencies_status.Clear();

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

        private void Process(object sender, ElapsedEventArgs eventArgs, int frequency)
        {
            _ = ProcessAsync(frequency);
        }

        private async Task ProcessAsync(int frequency)
        {
            //await semaphore_queue.WaitAsync();
            //try
            //{

            //}
            //finally
            //{
            //    semaphore_queue.Release();
            //}
            int indxOf = frequencies.IndexOf(frequency);
            if (indxOf < 0 || indxOf >= frequencies_status.Count)
            {
                return;
            }
            if (this.frequencies_status[indxOf] == Status.EN_ATTENTE)
            {
                this.frequencies_status[indxOf] = Status.EN_COURS;

                var acquired = false;
                //for (int i = 0; i < frequencies.Count(); i++)
                //{
                //    timers[i].Enabled = false;
                //}

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

                    if (m_cts.IsCancellationRequested)
                    {
                        return;
                    }
                    //recupere les lieux avec cette frequence et ce id_serveur
                    (List<string> arr_portSerie, List<string> arr_sondeNumeroSerie, List<string> arr_sondeAdresse, List<string> arr_moduleNumeroSerie) = GetDatabase().getInfosByIdServeurAndFrequencies(this._idServer, frequency);
                    if(arr_sondeNumeroSerie.Count != 0)
                    {
                        for (int i = 0; i < arr_sondeNumeroSerie.Count; i++)
                        {
                            var serial = arr_sondeNumeroSerie[i];
                            if (string.IsNullOrEmpty(serial) || serial.Length < 2)
                            {
                                VigitempServeur.Log("Numero de serie invalide pour l'index " + i + " (serveur " + _idServer + ").");
                                continue;
                            }
                            VigitempServeur.Log("--------------------ID SERVEUR : " + _idServer + "---CAPTEUR : " + serial + "--------------------");
                            VigitempServeur.Log("Ouverture du port " + arr_portSerie[i] + " pour la sonde " + serial);
                            sensorType = serial.Substring(0, 2);

                            switch (sensorType)
                            {
                                case "IN":
                                    VigitempServeur.nombres_interrogations++;
                                    sensor = new SensorIN(this, arr_portSerie[i], serial, arr_sondeAdresse[i]);
                                    await sensor.read();
                                    break;
                                case "IE":
                                    VigitempServeur.nombres_interrogations++;
                                    sensor = new SensorIE(this, arr_portSerie[i], serial, arr_sondeAdresse[i]);
                                    await sensor.read();
                                    break;
                                case "IQ":

                                    break;
                                case "IP":
                                    VigitempServeur.nombres_interrogations++;
                                    sensor = new SensorIP(this, arr_portSerie[i], serial, arr_sondeAdresse[i]);
                                    await sensor.read();
                                    break;
                                case "IC":
                                    VigitempServeur.nombres_interrogations++;
                                    sensor = new SensorIC(this, arr_portSerie[i], serial, arr_sondeAdresse[i]);
                                    await sensor.read();
                                    break;
                                case "IH":
                                    VigitempServeur.nombres_interrogations++;
                                    sensor = new SensorIH(this, arr_portSerie[i], serial, arr_sondeAdresse[i]);
                                    await sensor.read();
                                    break;
                                case "EN":
                                    VigitempServeur.nombres_interrogations++;
                                    sensor = new SensorEN(this, arr_portSerie[i], serial, arr_sondeAdresse[i]);
                                    await sensor.read();
                                    break;

                                case "HN":
                                    VigitempServeur.nombres_interrogations++;
                                    sensor = new SensorHN(this, arr_portSerie[i], serial, arr_sondeAdresse[i], arr_moduleNumeroSerie[i]);
                                    await sensor.read();
                                    break;
                                default: break;
                            }
                        }

                    }
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("ThreadServeur.Process error: " + ex);
                }
                finally
                {
                    //for (int i = 0; i < frequencies.Count(); i++)
                    //{
                    //    timers[i].Enabled = true;
                    //}
                    //timers[indxOf].Enabled = true;
                    frequencies_status[indxOf] = Status.EN_ATTENTE;
                    if (acquired)
                    {
                        semaphore.Release();
                    }
                }
            }

        }

        private void ProcessGetFrequenciesAndReactivateSnoozedAlarm(object sender, ElapsedEventArgs e)
        {
            _ = ProcessGetFrequenciesAndReactivateSnoozedAlarmAsync();
        }

        private async Task ProcessGetFrequenciesAndReactivateSnoozedAlarmAsync()
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

                List<int> arr_frequencies = GetDatabase().getDistinctFrequenciesByIdServeur(this._idServer);

                List<int> tmp_frequencies = frequencies.ToList();
                List<Status> tmp_statuses = frequencies_status.ToList();

                //ajout d'une potentiel nouvelle frequence dans frequencies[]
                foreach (int frequency in arr_frequencies)
                {
                    if (!tmp_frequencies.Contains(frequency))
                    {
                        var timer = new System.Timers.Timer(frequency * 1000);
                        timer.Elapsed += (p_sender, p_e) => Process(p_sender, p_e, frequency);
                        timer.Start();
                        timers.Add(timer);
                        tmp_frequencies.Add(frequency);
                        tmp_statuses.Add(Status.EN_ATTENTE);
                    }
                }

                //suppression d'un frequence de frequencies qui n'existerait plus
                foreach (int frequency in frequencies)
                {
                    if (!arr_frequencies.Contains(frequency))
                    {
                        int indexOfFrequency = tmp_frequencies.IndexOf(frequency);
                        timers[indexOfFrequency].Stop();
                        timers[indexOfFrequency].Dispose();
                        timers.RemoveAt(indexOfFrequency);
                        tmp_frequencies.RemoveAt(indexOfFrequency);
                        tmp_statuses.RemoveAt(indexOfFrequency);
                    }
                }
                frequencies = tmp_frequencies;
                frequencies_status = tmp_statuses;


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
                                sensorType = arr_sondeNumeroSerie.Substring(0, 2);

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
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("ThreadServeur.ProcessGetFrequenciesAndReactivateSnoozedAlarm error: " + ex);
            }
            finally
            {
                if (acquired)
                {
                    semaphore.Release();
                }
            }
        }
    }
}
