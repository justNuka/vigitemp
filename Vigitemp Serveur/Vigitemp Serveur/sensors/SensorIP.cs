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
                var command = "SM" + m_sondeAdresse + "0000000000000000";
                VigitempServeur.Log($"[SONDE][TX] type=IP serial={m_sondeSerialNumber} port={m_comPort} adresse={m_sondeAdresse} cmd={command}");
                m_port.Write(command);
                Stopwatch tmp_sw = new Stopwatch();
                tmp_sw.Start();

                Console.WriteLine("Donnees ecrites dans le port COM: " + "SM" + m_sondeAdresse + "0000000000000000");
                Trace.WriteLine("Donnees ecrites dans le port COM: " + "SM" + m_sondeAdresse + "0000000000000000");

                while (pendingResults)
                {
                    await Task.Delay(25);
                    if (tmp_sw.Elapsed.TotalMilliseconds > 2000)
                    {
                        VigitempServeur.Log($"[SONDE][DONE] type=IP serial={m_sondeSerialNumber} port={m_comPort} status=timeout elapsedMs={tmp_sw.Elapsed.TotalMilliseconds:0}");
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
                VigitempServeur.Log($"[SONDE][ERR] type=IP serial={m_sondeSerialNumber} port={m_comPort} error={e}");
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
                    AppendToResponse(chunk);
                }
                VigitempServeur.Log($"[SONDE][RX] type=IP serial={m_sondeSerialNumber} port={m_comPort} raw={m_sensor_response}");
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
                VigitempServeur.Log($"[SONDE][RX] type=IP serial={m_sondeSerialNumber} resistance={tmp_resistance}");

                var rawValue = Convert.ToDouble(tmp_resistance, System.Globalization.CultureInfo.InvariantCulture);
                var correctedValue = RoundMeasure(ApplyMetrology(rawValue));

                Console.WriteLine("Donnees corrigees: " + correctedValue);
                Trace.WriteLine("Donnees corrigees: " + correctedValue);
                ths.GetDatabase().AddMesure(m_sondeSerialNumber, correctedValue, "°C", ToInvariantRaw(rawValue));
                HandleNoResponseAlarm(true);
                compareMeasuresAndLimits(correctedValue, "°C");
                VigitempServeur.Log($"[SONDE][DONE] type=IP serial={m_sondeSerialNumber} port={m_comPort} status=success value={correctedValue} unit=°C raw={ToInvariantRaw(rawValue)}");

                m_port.Close();
                pendingResults = false;
                Trace.WriteLine("Fermeture du port " + m_comPort);
            }
            catch (Exception ex)
            {
                VigitempServeur.Log($"[SONDE][ERR] type=IP serial={m_sondeSerialNumber} port={m_comPort} error={ex}");
            }
        }
    }
}

