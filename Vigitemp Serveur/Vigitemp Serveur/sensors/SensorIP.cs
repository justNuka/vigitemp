using System;
using System.Diagnostics;
using System.IO.Ports;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Vigitemp_Serveur.sensors
{
    class SensorIP : Sensor
    {
        private string m_regexResponseTempSensor;

        // Constructeur
        public SensorIP(ThreadServeur p_ths, string p_comPort, string p_sondeSerialNumber, string p_sondeAdresse) : base(p_ths, p_comPort, p_sondeSerialNumber, p_sondeAdresse)
        {
            m_port.DataReceived += new SerialDataReceivedEventHandler(DataReceivedHandler);
            m_regexResponseTempSensor = @".*(R" + m_sondeSerialNumber.Substring(m_sondeSerialNumber.Length - 4) + "R[\x00-\x7F]{2}').*";
        }

        public override async Task<bool> read()
        {
            try
            {
                pendingResults = true;
                m_port.Open();
                m_port.DiscardInBuffer();
                m_port.DiscardOutBuffer();
                m_port.Write("SM" + m_sondeAdresse + "0000000000000000");
                Stopwatch tmp_sw = new Stopwatch();
                tmp_sw.Start();
                // while (tmp_sw.Elapsed.TotalMilliseconds < 100) {}
                // m_port.Write("SM"+m_serialNumber.Substring(m_serialNumber.Length - 4)+"0000000000000000");

                Console.WriteLine("Données ecrites dans le port COM: " + "SM" + m_sondeAdresse + "0000000000000000");
                Trace.WriteLine("Données ecrites dans le port COM: " + "SM" + m_sondeAdresse + "0000000000000000");

                while (pendingResults)
                {
                    await Task.Delay(25);
                    if (tmp_sw.Elapsed.TotalMilliseconds > 2000)
                    {
                        m_port.Close();
                        m_sensor_response = "";
                        pendingResults = false;
                        break;
                    }
                }

                tmp_sw.Stop();
            }
            catch (Exception e)
            {
                Console.WriteLine("erreur: " + e);
                Trace.WriteLine("erreur: " + e);
                m_port.Close();
                return false;
            }
            return true;
        }

        protected override void DataReceivedHandler(
                            object sender,
                            SerialDataReceivedEventArgs e)
        {

            SerialPort sp = (SerialPort)sender;
            string regex_res;
            var chunk = sp.ReadExisting();
                if (!string.IsNullOrEmpty(chunk))
                {
                    m_sensor_response += chunk;
                }
            var m = Regex.Match(m_sensor_response, m_regexResponseTempSensor, RegexOptions.None);
            if (m.Groups[1].Value != "")
            {
                regex_res = m.Groups[1].Value;
                m_sensor_response = "";
            }
            else
            {
                if (m_sensor_response.Length > 1024)
                    {
                        m_sensor_response = m_sensor_response.Substring(m_sensor_response.Length - 1024);
                    }
                return;
            }

            // Console.WriteLine("Données recues dans le port COM: " + regex_res); 

            //recuperer les coeffs our corriger la valeur brute
            (double coeffX, double constante) = ths.GetDatabase().getCoeffCalibrageBySerialNumber(m_sondeSerialNumber);

            double mesureNonCorrigée, mesureCalculée;

            double coeffTemp;
            double coeffA = 0.0039083;
            double coeffB = -0.0000005775;

            int poidsFort = regex_res[6];
            int poidsFaible = regex_res[7];
            tmp_resistance = (poidsFort * 256 + poidsFaible - 2048).ToString();

            coeffTemp = Math.Pow(coeffA / (2 * coeffB), 2) + (coeffX * int.Parse(tmp_resistance.Replace(",", ".")) + (constante - 1)) / coeffB;

            if (coeffTemp < 0)
            {
                mesureCalculée = 0.0;
                return;
            }
            mesureNonCorrigée = -(coeffA / (2 * coeffB)) - Math.Sqrt(coeffTemp);

            mesureCalculée = mesureNonCorrigée;
            Console.WriteLine("Données corrigées: " + float.Parse(String.Format("{0:0.00}", mesureCalculée)));
            Trace.WriteLine("Données corrigées: " + float.Parse(String.Format("{0:0.00}", mesureCalculée)));
            ths.GetDatabase().AddMesure(m_sondeSerialNumber, mesureCalculée, "°C", tmp_resistance);

            m_port.Close();
            pendingResults = false;
            Trace.WriteLine("Fermeture du port " + m_comPort);
        }
    }
}


