using System;
using System.Diagnostics;
using System.Globalization;
using System.IO.Ports;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Org.BouncyCastle.Utilities.Encoders;

namespace Vigitemp_Serveur.sensors
{
    class SensorEN : Sensor
    {
        private string m_regexResponseTempSensor = @"(.{14})";

        // Constructeur
        public SensorEN(ThreadServeur p_ths, string p_comPort, string p_sondeSerialNumber, string p_sondeAdresse) : base(p_ths, p_comPort, p_sondeSerialNumber, p_sondeAdresse)
        {
            m_port.DataReceived += new SerialDataReceivedEventHandler(DataReceivedHandler);
        }

        public override async Task<bool> read()
        {
            try
            {
                pendingResults = true;
                m_port.Encoding = Encoding.UTF32;
                m_port.Open();
                m_port.DiscardInBuffer();
                m_port.DiscardOutBuffer();

                int sRelais1 = int.Parse(m_sondeAdresse); //adresse sonde

                byte[] bytestosend = {  0x51,
                                    Convert.ToByte(sRelais1),
                                    Convert.ToByte(sRelais1),
                                    Convert.ToByte(sRelais1),
                                    Convert.ToByte(sRelais1),
                                    Convert.ToByte(sRelais1),
                                    0x30,
                                    Convert.ToByte(sRelais1),
                                    Convert.ToByte(sRelais1),
                                    Convert.ToByte(sRelais1),
                                    Convert.ToByte(sRelais1),
                                    Convert.ToByte(sRelais1),
                                    0x30,
                                    0x30
                                };
                m_port.Write(bytestosend, 0, bytestosend.Length);

                Stopwatch tmp_sw = new Stopwatch();
                tmp_sw.Start();
                Console.WriteLine("write");
                Trace.WriteLine("write");
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
            catch (TimeoutException e)
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
            Encoding iso = Encoding.GetEncoding("ISO-8859-1");
            string regex_res;
            string suplex;
            int length = sp.BytesToRead;
            byte[] buf = new byte[length];
            Console.WriteLine("read");
            Trace.WriteLine("read");


            Console.WriteLine("byte buf length: " + length);
            Trace.WriteLine("byte buf length: " + length);
            sp.Read(buf, 0, length);
            m_sensor_response += iso.GetString(buf);
            m_sensor_response = m_sensor_response.Replace(@"/(/\r?\n|\r/)/gm", "");
            Console.WriteLine("reponse: " + m_sensor_response + "       | " + m_sensor_response.Length);
            Trace.WriteLine("reponse: " + m_sensor_response + "       | " + m_sensor_response.Length);
            var m = Regex.Match(m_sensor_response, m_regexResponseTempSensor, RegexOptions.None);
            if (m_sensor_response.Length == 14)
            {
                regex_res = m_sensor_response;
                m_sensor_response = "";
            }
            else
            {
                return;
            }
            Console.WriteLine("resultat complet regex_res: " + regex_res);
            Trace.WriteLine("resultat complet regex_res: " + regex_res);

            byte[] bytes = iso.GetBytes(regex_res);
            string hexString = Hex.ToHexString(bytes);
            Console.WriteLine($"resultat complet hexString: \"{hexString}\"");
            Trace.WriteLine($"resultat complet hexString: \"{hexString}\"");

            suplex = hexString.Substring(24, 2);
            Console.WriteLine("suplex: " + suplex);
            Trace.WriteLine("suplex: " + suplex);
            int poidsFort = int.Parse(suplex, NumberStyles.HexNumber);
            Console.WriteLine("suplex decimal: " + poidsFort);
            Trace.WriteLine("suplex decimal: " + poidsFort);

            suplex = hexString.Substring(26, 2);
            Console.WriteLine("suplex: " + suplex);
            Trace.WriteLine("suplex: " + suplex);
            int poidsFaible = int.Parse(suplex, NumberStyles.HexNumber);
            Console.WriteLine("suplex decimal: " + poidsFaible);
            Trace.WriteLine("suplex decimal: " + poidsFaible);


            tmp_resistance = (poidsFort * 256 + poidsFaible - 2048).ToString();
            Console.WriteLine("resultat décimal: " + tmp_resistance);
            Trace.WriteLine("resultat décimal: " + tmp_resistance);

            if (int.Parse(tmp_resistance) > -2048 && int.Parse(tmp_resistance) < 2048)
            {
                // recuperer a et b our corriger la valeur brute
                (double coeffX, double coeffConstant) = ths.GetDatabase().getCoeffCalibrageBySerialNumber(m_sondeSerialNumber);
                // Console.WriteLine("Convert.ToDouble: " + (Convert.ToDouble(tmp_temperature, CultureInfo.InvariantCulture.NumberFormat)*coeffX+coeffConstant).ToString());
                tmp_valeur = (Convert.ToDouble(float.Parse(tmp_resistance, CultureInfo.InvariantCulture.NumberFormat)) * coeffX + coeffConstant).ToString();
                // Console.WriteLine("Données corrigées: " + Math.Round(Convert.ToDouble(tmp_temperature), 2, MidpointRounding.AwayFromZero));

                ths.GetDatabase().AddMesure(m_sondeSerialNumber, Math.Round(Convert.ToDouble(tmp_valeur), 2, MidpointRounding.AwayFromZero), "°C", tmp_resistance);
            }


            //m_port.DiscardInBuffer();
            //m_port.DiscardOutBuffer();
            m_port.Close();
            //sp.Dispose();
            pendingResults = false;
            System.Diagnostics.Trace.WriteLine("Fermeture du port " + m_comPort);
        }
    }
}
