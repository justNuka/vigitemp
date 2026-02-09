using System;
using System.Diagnostics;
using System.Globalization;
using System.IO.Ports;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Vigitemp_Serveur.sensors
{
    class SensorGSP : Sensor
    {
        private string m_regexResponseTempSensor = @".*(R[A-Z0-9]{4}TEMP-?[0-9]{1,3}.[0-9]{2}'C).*";
        private readonly string m_serialSansType;

        // Constructeur
        public SensorGSP(ThreadServeur p_ths, string p_comPort, string p_sondeSerialNumber, string p_sondeAdresse)
            : base(p_ths, p_comPort, p_sondeSerialNumber, p_sondeAdresse)
        {
            m_serialSansType = NormalizeSerialWithoutType(p_sondeSerialNumber);
            m_port.DataReceived += new SerialDataReceivedEventHandler(DataReceivedHandler);
        }

        private static string NormalizeSerialWithoutType(string serial)
        {
            if (string.IsNullOrEmpty(serial)) return serial;
            return serial.StartsWith("GSP", StringComparison.OrdinalIgnoreCase) && serial.Length > 3
                ? serial.Substring(3)
                : serial;
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
                VigitempServeur.Log($"[SONDE][TX] type=GSP serial={m_sondeSerialNumber} serialRaw={m_serialSansType} port={m_comPort} adresse={m_sondeAdresse} cmd={command}");
                m_port.Write(command);
                Stopwatch tmp_sw = new Stopwatch();
                tmp_sw.Start();

                VigitempServeur.Log("Données ecrites dans le port COM: " + "SM" + m_sondeAdresse + "0000000000000000");

                while (pendingResults)
                {
                    await Task.Delay(25);
                    if (tmp_sw.Elapsed.TotalMilliseconds > 5000)
                    {
                        VigitempServeur.Log("Délai de 5 secondes dépassé");
                        VigitempServeur.Log("Fermeture du port " + m_comPort);
                        VigitempServeur.Log($"[SONDE][DONE] type=GSP serial={m_sondeSerialNumber} port={m_comPort} status=timeout elapsedMs={tmp_sw.Elapsed.TotalMilliseconds:0}");
                        m_port.Close();
                        m_sensor_response = "";
                        pendingResults = false;
                        HandleNoResponseAlarm(false, "timeout");
                        break;
                    }
                }

                tmp_sw.Stop();
            }
            catch (Exception e)
            {
                VigitempServeur.Log("SensorGSP.read error: " + e);
                HandleNoResponseAlarm(false, "exception");
                m_port.Close();
                m_port.Dispose();
                return false;
            }
            return true;
        }

        protected override void DataReceivedHandler(object sender, SerialDataReceivedEventArgs e)
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
                VigitempServeur.Log($"[SONDE][RX] type=GSP serial={m_sondeSerialNumber} port={m_comPort} raw={m_sensor_response}");
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

                tmp_valeur = regex_res.Split(new string[] { "TEMP" }, StringSplitOptions.None)[1];
                tmp_numeroSerie = regex_res.Split(new string[] { "TEMP" }, StringSplitOptions.None)[0];
                tmp_numeroSerie = NormalizeSerialWithoutType(tmp_numeroSerie);
                VigitempServeur.Log($"[SONDE][RX] type=GSP serial={m_sondeSerialNumber} parsedSerial={tmp_numeroSerie} rawValue={tmp_valeur}");

                var rawValue = Convert.ToDouble(float.Parse(tmp_valeur.Remove(tmp_valeur.Length - 2, 2), CultureInfo.InvariantCulture.NumberFormat));
                var correctedValue = RoundMeasure(ApplyMetrology(rawValue));
                VigitempServeur.Log("Données corrigées: " + correctedValue);

                ths.GetDatabase().AddMesure(m_sondeSerialNumber, correctedValue, "�C", ToInvariantRaw(rawValue));
                VigitempServeur.Log($"[SONDE][DONE] type=GSP serial={m_sondeSerialNumber} port={m_comPort} status=success value={correctedValue} unit=�C raw={ToInvariantRaw(rawValue)}");
                HandleNoResponseAlarm(true);
                compareMeasuresAndLimits(correctedValue, "�C");
                m_port.Close();
                pendingResults = false;
                Trace.WriteLine("Fermeture du port " + m_comPort);
            }
            catch (Exception ex)
            {
                VigitempServeur.Log($"[SONDE][ERR] type=GSP serial={m_sondeSerialNumber} port={m_comPort} error={ex}");
            }
        }
    }
}

