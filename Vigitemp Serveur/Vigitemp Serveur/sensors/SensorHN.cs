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
            m_port.DataReceived += new SerialDataReceivedEventHandler(DataReceivedHandler);
        }

        public override async Task<bool> read()
        {
            return await ExecuteWithPortLockAsync(async () =>
            {
                try
                {
                    BeginReadCycle();
                    // L'encodage du port n'est pas utilisé directement : les bytes sont lus via
                    // sp.Read(buf) et décodés manuellement avec ISO-8859-1 dans le handler.
                    m_port.Encoding = Encoding.GetEncoding("ISO-8859-1");
                    m_port.Open();
                    m_port.DiscardInBuffer();
                    m_port.DiscardOutBuffer();

                    string sRelais1 = m_sondeAdresse; //adresse sonde
                    string sRelais2 = m_moduleSerialNumber; //adresse module 

                    byte[] bytestosend = checksumRequete("4D", sRelais1, sRelais2);
                    VigitempServeur.Log($"[SONDE][TX] type=HN serial={m_sondeSerialNumber} port={m_comPort} adresse={m_sondeAdresse} module={m_moduleSerialNumber} cmdHex={BitConverter.ToString(bytestosend)}");
                    m_port.Write(bytestosend, 0, bytestosend.Length);

                    var tmp_sw = Stopwatch.StartNew();
                    var retrySent = false;
                    while (pendingResults)
                    {
                        await Task.Delay(25);

                        if (!retrySent && tmp_sw.Elapsed.TotalMilliseconds > 1000)
                        {
                            VigitempServeur.Log($"[SONDE][DONE] type=HN serial={m_sondeSerialNumber} port={m_comPort} status=retry elapsedMs={tmp_sw.Elapsed.TotalMilliseconds:0}");
                            if (!m_port.IsOpen)
                            {
                                m_port.Open();
                            }
                            m_port.DiscardInBuffer();
                            m_port.DiscardOutBuffer();
                            bytestosend = checksumRequete("4D", sRelais1, sRelais2);
                            VigitempServeur.Log($"[SONDE][TX] type=HN serial={m_sondeSerialNumber} port={m_comPort} adresse={m_sondeAdresse} module={m_moduleSerialNumber} cmdHex={BitConverter.ToString(bytestosend)} (retry)");
                            m_port.Write(bytestosend, 0, bytestosend.Length);
                            retrySent = true;
                        }

                        if (tmp_sw.Elapsed.TotalMilliseconds > 3000)
                        {
                            if (!TryCompleteRead())
                            {
                                break;
                            }
                            VigitempServeur.Log($"[SONDE][DONE] type=HN serial={m_sondeSerialNumber} port={m_comPort} status=timeout elapsedMs={tmp_sw.Elapsed.TotalMilliseconds:0}");
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
                    VigitempServeur.Log($"[SONDE][ERR] type=HN serial={m_sondeSerialNumber} port={m_comPort} error={e}");
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

                VigitempServeur.Log($"[SONDE][RX] type=HN serial={m_sondeSerialNumber} port={m_comPort} event=read");
                SerialPort sp = (SerialPort)sender;
                Encoding iso = Encoding.GetEncoding("ISO-8859-1");
                string regex_res;
                string suplex;
                int length = sp.BytesToRead;
                VigitempServeur.Log($"[SONDE][RX] type=HN serial={m_sondeSerialNumber} bytes={length}");
                byte[] buf = new byte[length];
                sp.Read(buf, 0, length);
                AppendToResponse(iso.GetString(buf));
                m_sensor_response = Regex.Replace(m_sensor_response, @"\r?\n|\r", "");
                VigitempServeur.Log($"[SONDE][RX] type=HN serial={m_sondeSerialNumber} raw={m_sensor_response} len={m_sensor_response.Length}");
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

                if (!TryCompleteRead())
                {
                    return;
                }
                VigitempServeur.Log($"[SONDE][RX] type=HN serial={m_sondeSerialNumber} frame={regex_res}");

                byte[] bytes = iso.GetBytes(regex_res);
                string hexString = Hex.ToHexString(bytes);
                VigitempServeur.Log($"[SONDE][RX] type=HN serial={m_sondeSerialNumber} hex={hexString}");

            suplex = hexString.Substring(28, 2);
            tmp_valeur = Convert.ToString(Convert.ToInt32(suplex, 16), 2).PadLeft(8, '0');

            suplex = hexString.Substring(30, 2);
            tmp_valeur += Convert.ToString(Convert.ToInt32(suplex, 16), 2).PadLeft(8, '0');

            suplex = hexString.Substring(32, 2);
            tmp_valeur += Convert.ToString(Convert.ToInt32(suplex, 16), 2).PadLeft(8, '0');

            VigitempServeur.Log($"[SONDE][RX] type=HN serial={m_sondeSerialNumber} binary={tmp_valeur}");
            int tmp_temperature_int = (int)Convert.ToInt64(tmp_valeur, 2);
            tmp_valeur = ((1 - tmp_temperature_int / Math.Pow(2, 20) - 0.32) / 0.0047).ToString();
            tmp_valeur = tmp_valeur.Replace(",", ".");
            VigitempServeur.Log($"[SONDE][RX] type=HN serial={m_sondeSerialNumber} parsedValue={tmp_valeur}");

            var rawValue = Convert.ToDouble(float.Parse(tmp_valeur, CultureInfo.InvariantCulture.NumberFormat));
            var correctedValue = RoundMeasure(ApplyMetrology(rawValue));

                HandleNoResponseAlarm(true);
                compareMeasuresAndLimits(correctedValue, "C");
                ths.GetDatabase().AddMesure(m_sondeSerialNumber, correctedValue, "C", ToInvariantRaw(rawValue));
                VigitempServeur.Log($"[SONDE][DONE] type=HN serial={m_sondeSerialNumber} port={m_comPort} status=success value={correctedValue} unit=C raw={ToInvariantRaw(rawValue)}");
                m_port.DiscardInBuffer(); 
                m_port.DiscardOutBuffer();
                m_port.Close();
            }
            catch (Exception ex)
            {
                VigitempServeur.Log($"[SONDE][ERR] type=HN serial={m_sondeSerialNumber} port={m_comPort} error={ex}");
                DisposePort();
                TryCompleteRead();
            }
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


