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

        private bool ContainsBatteryMarker(string response)
        {
            if (string.IsNullOrWhiteSpace(response) || string.IsNullOrWhiteSpace(m_sondeSerialNumber) || m_sondeSerialNumber.Length < 4)
            {
                return false;
            }

            var serialSuffix = Regex.Escape(m_sondeSerialNumber.Substring(m_sondeSerialNumber.Length - 4));
            return Regex.IsMatch(
                response,
                @"R" + serialSuffix + @"(?:BAT|B)'",
                RegexOptions.IgnoreCase);
        }

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
                BeginReadCycle();
                m_port.Open();
                m_port.DiscardInBuffer();
                m_port.DiscardOutBuffer();
                var command = "SM" + m_sondeAdresse + "0000000000000000";
                VigitempServeur.Log($"[SONDE][TX] type=IP serial={m_sondeSerialNumber} port={m_comPort} adresse={m_sondeAdresse} cmd={command}");
                m_port.Write(command);
                Stopwatch tmp_sw = new Stopwatch();
                tmp_sw.Start();

                while (pendingResults)
                {
                    await Task.Delay(25);
                    if (tmp_sw.Elapsed.TotalMilliseconds > 2000)
                    {
                        if (!TryCompleteRead())
                        {
                            break;
                        }
                        VigitempServeur.Log($"[SONDE][DONE] type=IP serial={m_sondeSerialNumber} port={m_comPort} status=timeout elapsedMs={tmp_sw.Elapsed.TotalMilliseconds:0}");
                        HandleNoResponseAlarm(false, "timeout");
                        m_port.Close();
                        m_sensor_response = "";
                        break;
                    }
                }

                tmp_sw.Stop();
            }
            catch (Exception e)
            {
                VigitempServeur.Log($"[SONDE][ERR] type=IP serial={m_sondeSerialNumber} port={m_comPort} error={e}");
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
                if (HasReadCompleted())
                {
                    return;
                }

                SerialPort sp = (SerialPort)sender;
                string regex_res;
                var chunk = sp.ReadExisting();
                if (!string.IsNullOrEmpty(chunk))
                {
                    AppendToResponse(chunk);
                }
                VigitempServeur.Log($"[SONDE][RX] type=IP serial={m_sondeSerialNumber} port={m_comPort} raw={m_sensor_response}");
                var hasBatteryMarker = ContainsBatteryMarker(m_sensor_response);
                var m = Regex.Match(m_sensor_response, m_regexResponseTempSensor, RegexOptions.None);
                if (m.Groups[1].Value != "")
                {
                    regex_res = m.Groups[1].Value;
                    m_sensor_response = "";
                }
                else
                {
                    if (hasBatteryMarker)
                    {
                        if (!TryCompleteRead())
                        {
                            return;
                        }
                        HandleSensorPowerAlarm(true, "IP-BAT");
                        HandleNoResponseAlarm(true);
                        m_port.Close();
                        m_sensor_response = "";
                        VigitempServeur.Log($"[SONDE][DONE] type=IP serial={m_sondeSerialNumber} port={m_comPort} status=battery-flag");
                        return;
                    }

                    if (m_sensor_response.Length > 1024)
                    {
                        m_sensor_response = m_sensor_response.Substring(m_sensor_response.Length - 1024);
                    }
                    return;
                }

                if (!TryCompleteRead())
                {
                    return;
                }

                int poidsFort = regex_res[6];
                int poidsFaible = regex_res[7];
                tmp_resistance = (poidsFort * 256 + poidsFaible - 2048).ToString();
                VigitempServeur.Log($"[SONDE][RX] type=IP serial={m_sondeSerialNumber} resistance={tmp_resistance}");

                var rawValue = Convert.ToDouble(tmp_resistance, System.Globalization.CultureInfo.InvariantCulture);
                var correctedValue = RoundMeasure(ApplyMetrology(rawValue));

                HandleSensorPowerAlarm(hasBatteryMarker, hasBatteryMarker ? "IP-BAT" : "IP-NORMAL");
                HandleNoResponseAlarm(true);
                compareMeasuresAndLimits(correctedValue, "°C");
                ths.GetDatabase().AddMesure(m_sondeSerialNumber, correctedValue, "°C", ToInvariantRaw(rawValue));
                VigitempServeur.Log($"[SONDE][DONE] type=IP serial={m_sondeSerialNumber} port={m_comPort} status=success value={correctedValue} unit=°C raw={ToInvariantRaw(rawValue)}");

                m_port.Close();
            }
            catch (Exception ex)
            {
                VigitempServeur.Log($"[SONDE][ERR] type=IP serial={m_sondeSerialNumber} port={m_comPort} error={ex}");
                DisposePort();
                TryCompleteRead();
            }
        }
    }
}
