using System;
using System.Diagnostics;
using System.Globalization;
using System.IO.Ports;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Vigitemp_Serveur.sensors
{
    class SensorIE : Sensor
    {
        private string m_regexResponseTempSensor = @".*(R[A-Z0-9]{4}TEMP-?[0-9]{1,3}.[0-9]{2}'C).*";

        // Constructeur
        public SensorIE(ThreadServeur p_ths, string p_comPort, string p_sondeSerialNumber, string p_sondeAdresse) : base(p_ths, p_comPort, p_sondeSerialNumber, p_sondeAdresse)
        {
            m_port.DataReceived += new SerialDataReceivedEventHandler(DataReceivedHandler);
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
                VigitempServeur.Log($"[SONDE][TX] type=IE serial={m_sondeSerialNumber} port={m_comPort} adresse={m_sondeAdresse} cmd={command}");
                m_port.Write(command);
                Stopwatch tmp_sw = new Stopwatch();
                tmp_sw.Start();
                await Task.Delay(100);
                VigitempServeur.Log($"[SONDE][TX] type=IE serial={m_sondeSerialNumber} port={m_comPort} adresse={m_sondeAdresse} cmd={command} (repeat)");
                m_port.Write(command);

                //Console.WriteLine("Donnees ecrites dans le port COM: " + "SM" + m_sondeAdresse + "0000000000000000");
                //Trace.WriteLine("Donnees ecrites dans le port COM: " + "SM" + m_sondeAdresse + "0000000000000000");
                VigitempServeur.Log("Donnees ecrites dans le port COM: " + "SM" + m_sondeAdresse + "0000000000000000");

                while (pendingResults)
                {
                    await Task.Delay(25);
                    if (tmp_sw.Elapsed.TotalMilliseconds > 2000)
                    {
                        VigitempServeur.Log($"[SONDE][DONE] type=IE serial={m_sondeSerialNumber} port={m_comPort} status=timeout elapsedMs={tmp_sw.Elapsed.TotalMilliseconds:0}");
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
                VigitempServeur.Log("SensorIE.read error: " + e);
                HandleNoResponseAlarm(false, "exception");
                DisposePort();
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
                VigitempServeur.Log($"[SONDE][RX] type=IE serial={m_sondeSerialNumber} port={m_comPort} raw={m_sensor_response}");
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

                // Console.WriteLine("Donnees recues dans le port COM: " + regex_res);
                tmp_valeur = regex_res.Split(new string[] { "TEMP" }, StringSplitOptions.None)[1];
                tmp_numeroSerie = regex_res.Split(new string[] { "TEMP" }, StringSplitOptions.None)[0];
                VigitempServeur.Log($"[SONDE][RX] type=IE serial={m_sondeSerialNumber} parsedSerial={tmp_numeroSerie} rawValue={tmp_valeur}");

                //recuperer a et b our corriger la valeur brute
                // (double coeffX, double coeffConstant) = ThreadServeur.GetDatabase().getCoeffCalibrageBySerialNumber(m_serialNumber);
                var rawValue = Convert.ToDouble(float.Parse(tmp_valeur.Remove(tmp_valeur.Length - 2, 2), CultureInfo.InvariantCulture.NumberFormat));
                var correctedValue = RoundMeasure(ApplyMetrology(rawValue));
                // tmp_temperature = (-19.5262).ToString();


                // ThreadServeur.GetDatabase().AddMesure(m_serialNumber, float.Parse(String.Format("{0:0.00}", tmp_temperature)), "°C");
                ths.GetDatabase().AddMesure(m_sondeSerialNumber, correctedValue, "°C", ToInvariantRaw(rawValue));
                VigitempServeur.Log($"[SONDE][DONE] type=IE serial={m_sondeSerialNumber} port={m_comPort} status=success value={correctedValue} unit=°C raw={ToInvariantRaw(rawValue)}");
                HandleNoResponseAlarm(true);
                compareMeasuresAndLimits(correctedValue, "°C");
                m_port.Close();
                pendingResults = false;
            }
            catch (Exception ex)
            {
                VigitempServeur.Log($"[SONDE][ERR] type=IE serial={m_sondeSerialNumber} port={m_comPort} error={ex}");
                DisposePort();
                pendingResults = false;
            }
        }

    }
}





