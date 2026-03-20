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
            if (!int.TryParse(m_sondeAdresse, out int sRelais1))
            {
                VigitempServeur.Log($"[SONDE][ERR] type=EN serial={m_sondeSerialNumber} adresse invalide='{m_sondeAdresse}'");
                HandleNoResponseAlarm(false, "invalid-address");
                return false;
            }

            try
            {
                pendingResults = true;
                // L'encodage du port n'est pas utilisé directement : les bytes sont lus via
                // sp.Read(buf) et décodés manuellement avec ISO-8859-1 dans le handler.
                m_port.Encoding = Encoding.GetEncoding("ISO-8859-1");
                m_port.Open();
                m_port.DiscardInBuffer();
                m_port.DiscardOutBuffer();


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
                VigitempServeur.Log($"[SONDE][TX] type=EN serial={m_sondeSerialNumber} port={m_comPort} adresse={m_sondeAdresse} cmdHex={BitConverter.ToString(bytestosend)}");
                m_port.Write(bytestosend, 0, bytestosend.Length);

                Stopwatch tmp_sw = new Stopwatch();
                tmp_sw.Start();
                while (pendingResults)
                {
                    await Task.Delay(25);
                    if (tmp_sw.Elapsed.TotalMilliseconds > 2000)
                    {
                        VigitempServeur.Log($"[SONDE][DONE] type=EN serial={m_sondeSerialNumber} port={m_comPort} status=timeout elapsedMs={tmp_sw.Elapsed.TotalMilliseconds:0}");
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
                VigitempServeur.Log($"[SONDE][ERR] type=EN serial={m_sondeSerialNumber} port={m_comPort} error={e}");
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
                Encoding iso = Encoding.GetEncoding("ISO-8859-1");
                string regex_res;
                string suplex;
                int length = sp.BytesToRead;
                byte[] buf = new byte[length];
                VigitempServeur.Log($"[SONDE][RX] type=EN serial={m_sondeSerialNumber} port={m_comPort} event=read");


                VigitempServeur.Log($"[SONDE][RX] type=EN serial={m_sondeSerialNumber} bytes={length}");
                sp.Read(buf, 0, length);
                AppendToResponse(iso.GetString(buf));
                m_sensor_response = Regex.Replace(m_sensor_response, @"\r?\n|\r", "");
                VigitempServeur.Log($"[SONDE][RX] type=EN serial={m_sondeSerialNumber} raw={m_sensor_response} len={m_sensor_response.Length}");
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
                VigitempServeur.Log($"[SONDE][RX] type=EN serial={m_sondeSerialNumber} frame={regex_res}");

                byte[] bytes = iso.GetBytes(regex_res);
                string hexString = Hex.ToHexString(bytes);
                VigitempServeur.Log($"[SONDE][RX] type=EN serial={m_sondeSerialNumber} hex={hexString}");

                suplex = hexString.Substring(24, 2);
                int poidsFort = int.Parse(suplex, NumberStyles.HexNumber);
                VigitempServeur.Log($"[SONDE][RX] type=EN serial={m_sondeSerialNumber} poidsFort={poidsFort}");

                suplex = hexString.Substring(26, 2);
                int poidsFaible = int.Parse(suplex, NumberStyles.HexNumber);
                VigitempServeur.Log($"[SONDE][RX] type=EN serial={m_sondeSerialNumber} poidsFaible={poidsFaible}");

                tmp_resistance = (poidsFort * 256 + poidsFaible - 2048).ToString();
                VigitempServeur.Log($"[SONDE][RX] type=EN serial={m_sondeSerialNumber} resistance={tmp_resistance}");

                if (int.Parse(tmp_resistance) > -2048 && int.Parse(tmp_resistance) < 2048)
                {
                    // recuperer a et b our corriger la valeur brute
                    var rawValue = Convert.ToDouble(float.Parse(tmp_resistance, CultureInfo.InvariantCulture.NumberFormat));
                    var correctedValue = RoundMeasure(ApplyMetrology(rawValue));

                    ths.GetDatabase().AddMesure(m_sondeSerialNumber, correctedValue, "C", ToInvariantRaw(rawValue));
                    VigitempServeur.Log($"[SONDE][DONE] type=EN serial={m_sondeSerialNumber} port={m_comPort} status=success value={correctedValue} unit=C raw={ToInvariantRaw(rawValue)}");
                    HandleNoResponseAlarm(true);
                    compareMeasuresAndLimits(correctedValue, "C");
                }
                else
                {
                    VigitempServeur.Log($"[SONDE][DONE] type=EN serial={m_sondeSerialNumber} port={m_comPort} status=ignored reason=out_of_range raw={tmp_resistance}");
                    HandleNoResponseAlarm(true);
                }


                //m_port.DiscardInBuffer();
                //m_port.DiscardOutBuffer();
                m_port.Close();
                //sp.Dispose();
                pendingResults = false;
            }
            catch (Exception ex)
            {
                VigitempServeur.Log($"[SONDE][ERR] type=EN serial={m_sondeSerialNumber} port={m_comPort} error={ex}");
                DisposePort();
                pendingResults = false;
            }
        }
    }
}

