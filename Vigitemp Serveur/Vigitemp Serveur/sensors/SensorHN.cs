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
    class SensorHN : Sensor
    {
        protected string m_moduleSerialNumber;
        private string m_regexResponseTempSensor = @"(.{19})";

        // Constructeur
        public SensorHN(ThreadServeur p_ths, string p_comPort, string p_sondeSerialNumber, string p_sondeAdresse, string p_moduleSerialNumber) : base(p_ths, p_comPort, p_sondeSerialNumber, p_sondeAdresse)
        {
            this.m_moduleSerialNumber = p_moduleSerialNumber;
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

                string sRelais1 = m_sondeAdresse; //adresse sonde
                string sRelais2 = m_moduleSerialNumber; //adresse module 

                byte[] bytestosend = checksumRequete("54", sRelais1, sRelais2);
                m_port.Write(bytestosend, 0, bytestosend.Length);

                Stopwatch tmp_sw = new Stopwatch();
                tmp_sw.Start();
                Console.WriteLine("write");
                Trace.WriteLine("write");
                while (pendingResults)
                {
                    await Task.Delay(25);
                    if (tmp_sw.Elapsed.TotalMilliseconds > 1000)
                    {
                        m_port.Close();
                        m_port.DataReceived += new SerialDataReceivedEventHandler(DataReceivedHandler);
                        m_port.Open();
                        m_port.DiscardInBuffer();
                        m_port.DiscardOutBuffer();
                        tmp_sw.Stop();
                        bytestosend = checksumRequete("54", sRelais1, sRelais2);
                        m_port.Write(bytestosend, 0, bytestosend.Length);
                        tmp_sw = new Stopwatch();
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
            Console.WriteLine("read");
            Trace.WriteLine("read");
            SerialPort sp = (SerialPort)sender;
            Encoding iso = Encoding.GetEncoding("ISO-8859-1");
            string regex_res;
            string suplex;
            int length = sp.BytesToRead;
            Console.WriteLine("byte buf length: " + length);
            Trace.WriteLine("byte buf length: " + length);
            byte[] buf = new byte[length];
            sp.Read(buf, 0, length);
            m_sensor_response += iso.GetString(buf);
            m_sensor_response = m_sensor_response.Replace(@"/(/\r?\n|\r/)/gm", "");
            Console.WriteLine("reponse: " + m_sensor_response + "       | " + m_sensor_response.Length);
            Trace.WriteLine("reponse: " + m_sensor_response + "       | " + m_sensor_response.Length);
            var m = Regex.Match(m_sensor_response, m_regexResponseTempSensor, RegexOptions.None);
            if (m_sensor_response.Length == 19)
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
            Trace.WriteLine($"resultat complet hexString: \"{hexString}\"");

            suplex = hexString.Substring(28, 2);
            Console.WriteLine("suplex: " + suplex);
            Trace.WriteLine("suplex: " + suplex);
            tmp_valeur = Convert.ToString(Convert.ToInt32(suplex, 16), 2).PadLeft(8, '0');

            suplex = hexString.Substring(30, 2);
            Console.WriteLine("suplex: " + suplex);
            Trace.WriteLine("suplex: " + suplex);
            tmp_valeur += Convert.ToString(Convert.ToInt32(suplex, 16), 2).PadLeft(8, '0');

            suplex = hexString.Substring(32, 2);
            Console.WriteLine("suplex: " + suplex);
            Trace.WriteLine("suplex: " + suplex);
            tmp_valeur += Convert.ToString(Convert.ToInt32(suplex, 16), 2).PadLeft(8, '0');

            Console.WriteLine("resultat binaire: " + tmp_valeur);
            Trace.WriteLine("resultat binaire: " + tmp_valeur);
            int tmp_temperature_int = (int)Convert.ToInt64(tmp_valeur, 2);
            Console.WriteLine("resultat décimal: " + tmp_temperature_int);
            Trace.WriteLine("resultat décimal: " + tmp_temperature_int);
            tmp_valeur = ((1 - tmp_temperature_int / Math.Pow(2, 20) - 0.32) / 0.0047).ToString();
            tmp_valeur = tmp_valeur.Replace(",", ".");
            Console.WriteLine("resultat final: " + tmp_valeur);
            Trace.WriteLine("resultat final: " + tmp_valeur);

            // recuperer a et b our corriger la valeur brute
            (double coeffX, double coeffConstant) = ths.GetDatabase().getCoeffCalibrageBySerialNumber(m_sondeSerialNumber);
            Console.WriteLine("Convert.ToDouble: " + (Convert.ToDouble(tmp_valeur, CultureInfo.InvariantCulture.NumberFormat) * coeffX + coeffConstant).ToString());
            Trace.WriteLine("Convert.ToDouble: " + (Convert.ToDouble(tmp_valeur, CultureInfo.InvariantCulture.NumberFormat) * coeffX + coeffConstant).ToString());
            tmp_valeur = (Convert.ToDouble(float.Parse(tmp_valeur, CultureInfo.InvariantCulture.NumberFormat)) * coeffX + coeffConstant).ToString();
            Console.WriteLine("Données corrigées: " + Math.Round(Convert.ToDouble(tmp_valeur), 2, MidpointRounding.AwayFromZero));
            Trace.WriteLine("Données corrigées: " + Math.Round(Convert.ToDouble(tmp_valeur), 2, MidpointRounding.AwayFromZero));
            

            ths.GetDatabase().AddMesure(m_sondeSerialNumber, Math.Round(Convert.ToDouble(tmp_valeur), 2, MidpointRounding.AwayFromZero), "°C", null);
            m_port.DiscardInBuffer(); 
            m_port.DiscardOutBuffer();
            m_port.Close();
            pendingResults = false;
            Trace.WriteLine("Fermeture du port " + m_comPort);
        }

        private byte[] checksumRequete(string sCode, string sRelais1, string sRelais2)
        {
            // string sCode="4D";
            string sSaut = "01";
            int nval1, nval2, nval3, nval4, nval5, nval6, nval18, nval19;
            int nSomme;
            string sChaineBinaire;
            string sChaineResultat;

            nval1 = Convert.ToInt32(sCode, 16);
            nval2 = Convert.ToInt32(sSaut, 16);

            nval3 = Convert.ToInt32(sRelais1.Substring(0, 2), 16);
            nval4 = Convert.ToInt32(sRelais1.Substring(2, 2), 16);

            nval5 = Convert.ToInt32(sRelais2.Substring(0, 2), 16);
            nval6 = Convert.ToInt32(sRelais2.Substring(2, 2), 16);

            nSomme = nval1 + nval2 + nval3 + nval4 + nval5 + nval6;

            sChaineBinaire = Convert.ToString(nSomme, 2);

            sChaineBinaire = sChaineBinaire.PadLeft(16, '0');
            sChaineResultat = sChaineBinaire.Replace('0', 'o').Replace('1', '0').Replace('o', '1');

            sChaineResultat = Convert.ToString(Convert.ToInt32(sChaineResultat, 2), 16).ToUpper();

            nval18 = Convert.ToInt32(sChaineResultat.Substring(0, 2), 16);
            nval19 = Convert.ToInt32(sChaineResultat.Substring(2, 2), 16);

            // byte[] bytestosend = { 84, 1, 4, 20, 1, 211, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 254, 190 };
            byte[] bytestosend = {  Convert.ToByte(nval1),
                                Convert.ToByte(nval2),
                                Convert.ToByte(nval3),
                                Convert.ToByte(nval4),
                                Convert.ToByte(nval5),
                                Convert.ToByte(nval6),
                                0,
                                0,
                                0,
                                0,
                                0,
                                0,
                                0,
                                0,
                                0,
                                0,
                                0,
                                Convert.ToByte(nval18),
                                Convert.ToByte(nval19)};
            return bytestosend;
        }
    }
}
