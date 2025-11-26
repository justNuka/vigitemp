using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
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
        private Database m_database;
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


        private System.Timers.Timer _timer;
        private int _idServer;

        public ThreadServeur(CancellationToken obj, int p_idServer)
        {
            this.m_cts = obj;
            this._idServer = p_idServer;
        }

        public Database GetDatabase()
        { // singleton
            if (m_database == null)
            {
                lock (_lock)
                {
                    if (m_database == null)
                    {
                        m_database = new Database();
                    }
                }
            }
            return m_database;
            // return new Database();
        }

        public void Start()
        {
            //Console.WriteLine("Starting Thread#" + _idServer + "...");
            //Trace.WriteLine("Starting Thread#" + _idServer + "...");
            VigitempServeur.Log("Starting Thread#" + _idServer + "...");
            List<int> arr_frequencies = GetDatabase().getDistinctFrequenciesByIdServeur(this._idServer);
            foreach (int frequency in arr_frequencies)
            {
                _timer = new System.Timers.Timer(frequency * 1000);
                //Set action associated to each tick
                _timer.Elapsed += (sender, e) => Process(sender, e, frequency);
                //Start the timer
                _timer.Start();
                this.timers.Add(_timer);
                this.frequencies.Add(frequency);
                this.frequencies_status.Add(Status.EN_ATTENTE);
            }

            _timer = new System.Timers.Timer(60000);//timer de 1 minutes
                                                    //Set action associated to each tick
            _timer.Elapsed += ProcessGetFrequenciesAndReactivateSnoozedAlarm;
            //Start the timer
            _timer.Start();
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
                //Dereference tick action
                timer.Elapsed -= (sender, e) => Process(sender, e, 0);
                //Dispose timer
                timer.Dispose();
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

        private async void Process(object sender, ElapsedEventArgs eventArgs, int frequency)
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
            if (this.frequencies_status[indxOf] == Status.EN_ATTENTE)
            {
                this.frequencies_status[indxOf] = Status.EN_COURS;
                await semaphore.WaitAsync();
                //for (int i = 0; i < frequencies.Count(); i++)
                //{
                //    timers[i].Enabled = false;
                //}


                try
                {
                    if (m_cts.IsCancellationRequested)
                    {
                        this.Stop();
                    }
                    //recupere les lieux avec cette frequence et ce id_serveur
                    (List<string> arr_portSerie, List<string> arr_sondeNumeroSerie, List<string> arr_sondeAdresse, List<string> arr_moduleNumeroSerie) = GetDatabase().getInfosByIdServeurAndFrequencies(this._idServer, frequency);
                    if(arr_sondeNumeroSerie.Count != 0)
                    {
                        for (int i = 0; i < arr_sondeNumeroSerie.Count; i++)
                        {
                            //Console.WriteLine("--------------------ID SERVEUR : " + _idServer + "---CAPTEUR : " + arr_sondeNumeroSerie[i] + "--------------------");
                            VigitempServeur.Log("--------------------ID SERVEUR : " + _idServer + "---CAPTEUR : " + arr_sondeNumeroSerie[i] + "--------------------");
                            //Trace.WriteLine("Ouverture du port " + arr_portSerie[i]);
                            VigitempServeur.Log("Ouverture du port " + arr_portSerie[i] + " pour la sonde " + arr_sondeNumeroSerie[i]);
                            sensorType = arr_sondeNumeroSerie[i].Substring(0, 2);

                            switch (sensorType)
                            {
                                case "IN":
                                    VigitempServeur.nombres_interrogations++;
                                    sensor = new SensorIN(this, arr_portSerie[i], arr_sondeNumeroSerie[i], arr_sondeAdresse[i]);
                                    await sensor.read();
                                    break;
                                case "IE":
                                    VigitempServeur.nombres_interrogations++;
                                    sensor = new SensorIE(this, arr_portSerie[i], arr_sondeNumeroSerie[i], arr_sondeAdresse[i]);
                                    await sensor.read();
                                    break;
                                case "IQ":

                                    break;
                                case "IP":
                                    VigitempServeur.nombres_interrogations++;
                                    sensor = new SensorIP(this, arr_portSerie[i], arr_sondeNumeroSerie[i], arr_sondeAdresse[i]);
                                    await sensor.read();
                                    break;
                                case "IC":
                                    VigitempServeur.nombres_interrogations++;
                                    sensor = new SensorIC(this, arr_portSerie[i], arr_sondeNumeroSerie[i], arr_sondeAdresse[i]);
                                    await sensor.read();
                                    break;
                                case "IH":
                                    VigitempServeur.nombres_interrogations++;
                                    sensor = new SensorIH(this, arr_portSerie[i], arr_sondeNumeroSerie[i], arr_sondeAdresse[i]);
                                    await sensor.read();
                                    break;
                                case "EN":
                                    VigitempServeur.nombres_interrogations++;
                                    sensor = new SensorEN(this, arr_portSerie[i], arr_sondeNumeroSerie[i], arr_sondeAdresse[i]);
                                    await sensor.read();
                                    break;

                                case "HN":
                                    VigitempServeur.nombres_interrogations++;
                                    sensor = new SensorHN(this, arr_portSerie[i], arr_sondeNumeroSerie[i], arr_sondeAdresse[i], arr_moduleNumeroSerie[i]);
                                    await sensor.read();
                                    break;
                                default: break;
                            }
                        }

                    }
                }
                finally
                {
                    //for (int i = 0; i < frequencies.Count(); i++)
                    //{
                    //    timers[i].Enabled = true;
                    //}
                    //timers[indxOf].Enabled = true;
                    frequencies_status[indxOf] = Status.EN_ATTENTE;
                    semaphore.Release();
                }
            }

        }


        private async void ProcessGetFrequenciesAndReactivateSnoozedAlarm(object sender, ElapsedEventArgs e)
        {
            await semaphore.WaitAsync();
            try
            {
                List<int> arr_frequencies = GetDatabase().getDistinctFrequenciesByIdServeur(this._idServer);

                List<int> tmp_frequencies = frequencies.ToList();
                List<System.Timers.Timer> tmp_timers = timers.ToList();

                //ajout d'une potentiel nouvelle frequence dans frequencies[]
                foreach (int frequency in arr_frequencies)
                {
                    if (!tmp_frequencies.Contains(frequency))
                    {
                        _timer = new System.Timers.Timer(frequency * 1000);
                        _timer.Elapsed += (p_sender, p_e) => Process(p_sender, p_e, frequency);
                        _timer.Start();
                        timers.Add(_timer);
                        tmp_frequencies.Add(frequency);
                    }
                }

                //suppression d'un frequence de frequencies qui n'existerait plus
                foreach (int frequency in frequencies)
                {
                    if (!arr_frequencies.Contains(frequency))
                    {
                        int indexOfFrequency = tmp_frequencies.IndexOf(frequency);
                        timers[indexOfFrequency].Stop();
                        timers[indexOfFrequency].Elapsed -= (p_sender, p_e) => Process(p_sender, p_e, frequency);
                        timers[indexOfFrequency].Dispose();
                        timers.RemoveAt(indexOfFrequency);
                        tmp_frequencies.RemoveAt(indexOfFrequency);
                    }
                }
                frequencies = tmp_frequencies;


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
                                //Console.WriteLine("--------------------ID SERVEUR : " + _idServer + "---CAPTEUR : " + arr_sondeNumeroSerie[i] + "--------------------");
                                //VigitempServeur.Log("--------------------ID SERVEUR : " + _idServer + "---CAPTEUR : " + arr_sondeNumeroSerie + "--------------------");
                                //Trace.WriteLine("Ouverture du port " + arr_portSerie[i]);
                                //VigitempServeur.Log("Ouverture du port " + arr_portSerie + " pour la sonde " + arr_sondeNumeroSerie);
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

                        
                        sensor.compareMeasuresAndLimits(derniereMesure);
                    }
                }
            }
            finally
            {
                semaphore.Release();
            }
        }
    }
}
