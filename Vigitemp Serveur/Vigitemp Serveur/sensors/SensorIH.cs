using System;
using System.Diagnostics;
using System.Globalization;
using System.IO.Ports;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Vigitemp_Serveur.sensors
{
    class SensorIH : Sensor
    {
        private string m_regexResponseTempSensor;

        // Constructeur
        public SensorIH(ThreadServeur p_ths, string p_comPort, string p_sondeSerialNumber, string p_sondeAdresse) : base(p_ths, p_comPort, p_sondeSerialNumber, p_sondeAdresse)
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
                var command = "SM" + m_sondeAdresse + "0000000000000000";
                VigitempServeur.Log($"[SONDE][TX] type=IH serial={m_sondeSerialNumber} port={m_comPort} adresse={m_sondeAdresse} cmd={command}");
                m_port.Write(command);
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
                        VigitempServeur.Log($"[SONDE][DONE] type=IH serial={m_sondeSerialNumber} port={m_comPort} status=timeout elapsedMs={tmp_sw.Elapsed.TotalMilliseconds:0}");
                        HandleNoResponseAlarm(false, "timeout");
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
                VigitempServeur.Log($"[SONDE][ERR] type=IH serial={m_sondeSerialNumber} port={m_comPort} error={e}");
                HandleNoResponseAlarm(false, "exception");
                m_port.Close();
                return false;
            }
            return true;
        }

        protected override void DataReceivedHandler(
                            object sender,
                            SerialDataReceivedEventArgs e)
        {
            try
            {
                SerialPort sp = (SerialPort)sender;
                string regex_res;
                var chunk = sp.ReadExisting();
                if (!string.IsNullOrEmpty(chunk))
                {
                    m_sensor_response += chunk;
                }
                VigitempServeur.Log($"[SONDE][RX] type=IH serial={m_sondeSerialNumber} port={m_comPort} raw={m_sensor_response}");
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

                int poidsFort = regex_res[6];
                int poidsFaible = regex_res[7];
                tmp_resistance = (poidsFort * 256 + poidsFaible - 2048).ToString();
                VigitempServeur.Log($"[SONDE][RX] type=IH serial={m_sondeSerialNumber} resistance={tmp_resistance}");

                if (int.Parse(tmp_resistance) > -2048 && int.Parse(tmp_resistance) < 2048)
                {
                    // recuperer a et b our corriger la valeur brute
                    (double coeffX, double coeffConstant) = ths.GetDatabase().getCoeffCalibrageBySerialNumber(m_sondeSerialNumber);
                    // Console.WriteLine("Convert.ToDouble: " + (Convert.ToDouble(tmp_temperature, CultureInfo.InvariantCulture.NumberFormat)*coeffX+coeffConstant).ToString());
                    tmp_valeur = (Convert.ToDouble(float.Parse(tmp_resistance, CultureInfo.InvariantCulture.NumberFormat)) * coeffX + coeffConstant).ToString();
                    Console.WriteLine("Données corrigées: " + Math.Round(Convert.ToDouble(tmp_valeur), 2, MidpointRounding.AwayFromZero));
                    Trace.WriteLine("Données corrigées: " + Math.Round(Convert.ToDouble(tmp_valeur), 2, MidpointRounding.AwayFromZero));

                    ths.GetDatabase().AddMesure(m_sondeSerialNumber, Math.Round(Convert.ToDouble(tmp_valeur), 2, MidpointRounding.AwayFromZero), "%HR", tmp_resistance);
                    VigitempServeur.Log($"[SONDE][DONE] type=IH serial={m_sondeSerialNumber} port={m_comPort} status=success value={Math.Round(Convert.ToDouble(tmp_valeur), 2, MidpointRounding.AwayFromZero)} unit=%HR raw={tmp_resistance}");
                    HandleNoResponseAlarm(true);
                    compareMeasuresAndLimits(Math.Round(Convert.ToDouble(tmp_valeur), 2, MidpointRounding.AwayFromZero), "%HR");
                }
                else
                {
                    VigitempServeur.Log($"[SONDE][DONE] type=IH serial={m_sondeSerialNumber} port={m_comPort} status=ignored reason=out_of_range raw={tmp_resistance}");
                    HandleNoResponseAlarm(true);
                }

                m_port.Close();
                pendingResults = false;
                Trace.WriteLine("Fermeture du port " + m_comPort);
                Trace.WriteLine("Taux de réponse:  " + VigitempServeur.nombres_reponses + "/" + VigitempServeur.nombres_interrogations + "(" + ((float)VigitempServeur.nombres_reponses / (float)VigitempServeur.nombres_interrogations * 100) + "%)");
                Trace.WriteLine("-----------------------------------");
            }
            catch (Exception ex)
            {
                VigitempServeur.Log($"[SONDE][ERR] type=IH serial={m_sondeSerialNumber} port={m_comPort} error={ex}");
            }
        }
    }
}


