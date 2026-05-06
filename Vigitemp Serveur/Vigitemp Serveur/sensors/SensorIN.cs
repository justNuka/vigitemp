using System;
using System.Diagnostics;
using System.Globalization;
using System.IO.Ports;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Vigitemp_Serveur.sensors
{
    class SensorIN : Sensor
    {
        private string m_regexResponseTempSensor = @".*(R[A-Z0-9]{4}TEMP-?[0-9]{1,3}.[0-9]{2}'C).*";

        private bool ContainsBatteryMarker(string response)
        {
            if (string.IsNullOrWhiteSpace(response))
            {
                return false;
            }

            var frame = Regex.Match(response, @"R[A-Z0-9]{4}[^\r\n]*", RegexOptions.IgnoreCase);
            if (!frame.Success)
            {
                return false;
            }

            var payload = frame.Value.Substring(5).ToUpperInvariant();
            if (string.IsNullOrEmpty(payload))
            {
                return false;
            }

            if (payload.Contains("BAT"))
            {
                return true;
            }

            if (payload.StartsWith("B", StringComparison.Ordinal))
            {
                return true;
            }

            return Regex.IsMatch(payload, @"(^|[^A-Z0-9])B([^A-Z0-9]|$)", RegexOptions.None);
        }

        // Constructeur
        public SensorIN(ThreadServeur p_ths, string p_comPort, string p_sondeSerialNumber, string p_sondeAdresse) : base(p_ths, p_comPort, p_sondeSerialNumber, p_sondeAdresse)
        {
            m_port.DataReceived += new SerialDataReceivedEventHandler(DataReceivedHandler);
        }

        public override async Task<bool> read()
        {
            return await ExecuteWithPortLockAsync(async () =>
            {
                try
                {
                    BeginReadCycle();
                    m_port.Open();
                    m_port.DiscardInBuffer();
                    m_port.DiscardOutBuffer();
                    var command = "SM" + m_sondeAdresse + "0000000000000000";
                    VigitempServeur.Log($"[SONDE][TX] type=IN serial={m_sondeSerialNumber} port={m_comPort} adresse={m_sondeAdresse} cmd={command}");
                    m_port.Write(command);
                    Stopwatch tmp_sw = new Stopwatch();
                    tmp_sw.Start();

                //Console.WriteLine("Donnees ecrites dans le port COM: " + "SM" + m_sondeAdresse + "0000000000000000");
                //Trace.WriteLine("Donnees ecrites dans le port COM: " + "SM" + m_sondeAdresse + "0000000000000000");
                VigitempServeur.Log("Donnees ecrites dans le port COM: " + "SM" + m_sondeAdresse + "0000000000000000");

                    while (pendingResults)
                    {
                        await Task.Delay(25);
                        if (tmp_sw.Elapsed.TotalMilliseconds > 5000)
                        {
                            if (!TryCompleteRead())
                            {
                                break;
                            }
                            //Console.WriteLine("Delai de 5 secondes depasse");
                            //Trace.WriteLine("Delai de 5 secondes depasse");
                            VigitempServeur.Log("Delai de 5 secondes depasse");
                            //Trace.WriteLine("Fermeture du port " + m_comPort);
                            VigitempServeur.Log("Fermeture du port " + m_comPort);
                            VigitempServeur.Log($"[SONDE][DONE] type=IN serial={m_sondeSerialNumber} port={m_comPort} status=timeout elapsedMs={tmp_sw.Elapsed.TotalMilliseconds:0}");
                            //Trace.WriteLine("Taux de reponse:  " + VigitempServeur.nombres_reponses + "/" + VigitempServeur.nombres_interrogations + "(" + ((float)VigitempServeur.nombres_reponses / (float)VigitempServeur.nombres_interrogations * 100) + "%)");
                            VigitempServeur.Log("Taux de reponse:  " + VigitempServeur.nombres_reponses + "/" + VigitempServeur.nombres_interrogations + "(" + ((float)VigitempServeur.nombres_reponses / (float)VigitempServeur.nombres_interrogations * 100) + "%)");
                            //Trace.WriteLine("-----------------------------------");
                            VigitempServeur.Log("-----------------------------------");
                            m_port.Close();
                            m_sensor_response = "";
                            HandleNoResponseAlarm(false, "timeout");
                            break;
                        }
                    }

                    tmp_sw.Stop();
                }
                catch (Exception e)
                {
                    //Console.WriteLine("erreur: " + e);
                    //Trace.WriteLine("erreur: " + e);
                    VigitempServeur.Log("erreur read(): " + e);
                    HandleNoResponseAlarm(false, "exception");
                    DisposePort();
                    return false;
                }
                return true;
            });
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
                VigitempServeur.Log($"[SONDE][RX] type=IN serial={m_sondeSerialNumber} port={m_comPort} raw={m_sensor_response}");
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

                        HandleSensorPowerAlarm(true, "IN-BAT");
                        HandleNoResponseAlarm(true);
                        m_port.Close();
                        VigitempServeur.Log($"[SONDE][DONE] type=IN serial={m_sondeSerialNumber} port={m_comPort} status=battery-flag");
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

                // Console.WriteLine("Donnees recues dans le port COM: " + regex_res);
                tmp_valeur = regex_res.Split(new string[] { "TEMP" }, StringSplitOptions.None)[1];
                tmp_numeroSerie = regex_res.Split(new string[] { "TEMP" }, StringSplitOptions.None)[0];

                //recuperer a et b our corriger la valeur brute
                // (double coeffX, double coeffConstant) = ThreadServeur.GetDatabase().getCoeffCalibrageBySerialNumber(m_serialNumber);
                var rawValue = Convert.ToDouble(float.Parse(tmp_valeur.Remove(tmp_valeur.Length - 2, 2), CultureInfo.InvariantCulture.NumberFormat));
                var correctedValue = RoundMeasure(ApplyMetrology(rawValue));
                //Console.WriteLine("Donnees corrigees: " + float.Parse(String.Format("{0:0.00}", tmp_valeur)));
                //Trace.WriteLine("Donnees corrigees: " + float.Parse(String.Format("{0:0.00}", tmp_valeur)));
                VigitempServeur.Log("Donnees corrigees: " + correctedValue);
                //Service1.Log("Donnees corrigees: " + float.Parse(String.Format("{0:0.00}", tmp_valeur)));


                // ThreadServeur.GetDatabase().AddMesure(m_serialNumber, float.Parse(String.Format("{0:0.00}", tmp_temperature)), "°C");
                ths.GetDatabase().AddMesure(m_sondeSerialNumber, correctedValue, "°C", ToInvariantRaw(rawValue));
                VigitempServeur.Log($"[SONDE][DONE] type=IN serial={m_sondeSerialNumber} port={m_comPort} status=success value={correctedValue} unit=°C raw={ToInvariantRaw(rawValue)}");
                HandleSensorPowerAlarm(hasBatteryMarker, hasBatteryMarker ? "IN-BAT" : "IN-NORMAL");
                HandleNoResponseAlarm(true);
                compareMeasuresAndLimits(correctedValue, "°C");
                //checkAlarmespourConsignes(float.Parse(String.Format("{0:0.00}", tmp_valeur)));

                m_port.Close();
                //Trace.WriteLine("Fermeture du port " + m_comPort);
                VigitempServeur.Log("Fermeture du port " + m_comPort);
                //Trace.WriteLine("Taux de reponse:  " + VigitempServeur.nombres_reponses + "/" + VigitempServeur.nombres_interrogations + "(" + ((float)VigitempServeur.nombres_reponses / (float)VigitempServeur.nombres_interrogations * 100) + "%)");
                VigitempServeur.Log("Taux de reponse:  " + VigitempServeur.nombres_reponses + "/" + VigitempServeur.nombres_interrogations + "(" + ((float)VigitempServeur.nombres_reponses / (float)VigitempServeur.nombres_interrogations * 100) + "%)");
                //Trace.WriteLine("-----------------------------------");
                VigitempServeur.Log("-----------------------------------");
            }
            catch (Exception error)
            {
                VigitempServeur.Log("SensorIN.DataReceived: " + error);
                DisposePort();
                TryCompleteRead();
            }
           
        }
    }
}







