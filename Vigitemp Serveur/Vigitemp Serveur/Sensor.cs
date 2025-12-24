using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO.Ports;
using System.Net.Http;
using System.Collections.Concurrent;
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
        private static readonly ConcurrentDictionary<int, bool> _lastWebAlarmStateByLieu = new ConcurrentDictionary<int, bool>();


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

            List<string> ips_clients = ths.GetDatabase().getPCsClients();
            (List<float> consignes, bool notificationActive, DateTime dateHeure_reactivationAlarme) = ths.GetDatabase().getConsignesLieux(m_idLieu);


            //si consigne dépassée
            if (p_valeur < consignes[0] || p_valeur > consignes[1])
            {
                //consignes dépassées
                //if (p_valeur < consignes[0])
                //{
                //    VigitempServeur.Log("Consigne BASSE dépassée!!");
                //}
                //else if (p_valeur > consignes[1])
                //{
                //    VigitempServeur.Log("Consigne HAUTE depassée!!");
                //}

                // si alarme active (et consigne dépassée)
                if (notificationActive || dateHeure_reactivationAlarme != default(DateTime))
                {
                    // Signal site web (uniquement au changement d'état, pour éviter spam)
                    var wasActive = _lastWebAlarmStateByLieu.GetOrAdd(m_idLieu, false);
                    if (!wasActive)
                    {
                        _lastWebAlarmStateByLieu[m_idLieu] = true;
                        _ = AlarmWebNotifier.NotifyAlarmAsync(m_idLieu, p_valeur);
                    }

                    for (int i = 0; i < ips_clients.Count; i++)
                    {
                        //VigitempServeur.Log("envoi de la requete: " + ips_clients[i] + ":8000/alarm?action=show&idLieu=" + m_idLieu.ToString());
                        client.PostAsync("http://" + ips_clients[i] + ":8000/alarm?action=show&idLieu=" + m_idLieu, null);
                    }
                }
                else // si pas alarme (et consigne dépassée)
                {
                    _lastWebAlarmStateByLieu[m_idLieu] = false;
                    for (int i = 0; i < ips_clients.Count; i++)
                    {
                        //VigitempServeur.Log("envoi de la requete: " + ips_clients[i] + ":8000/alarm?action=hide&idLieu=" + m_idLieu.ToString());
                        client.PostAsync("http://" + ips_clients[i] + ":8000/alarm?action=hide&idLieu=" + m_idLieu, null);
                    }
                }
            }
            else // si pas consigne dépassée
            {
                _lastWebAlarmStateByLieu[m_idLieu] = false;
                //VigitempServeur.Log("Pas de consigne depassée");
                for (int i = 0; i < ips_clients.Count; i++)
                {
                    //VigitempServeur.Log("envoi de la requete: " + ips_clients[i] + ":8000/alarm?action=hide&idLieu=" + m_idLieu.ToString());
                    client.PostAsync("http://" + ips_clients[i] + ":8000/alarm?action=hide&idLieu=" + m_idLieu, null);
                }
            }

            return true;
        }

    }
}
