using System;
using System.Diagnostics;
using System.IO.Ports;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Vigitemp_Serveur.sensors
{
    class SensorIP : Sensor
    {
        private const double PlatinumCoefficientA = 0.0039083d;
        private const double PlatinumCoefficientB = -0.0000005775d;
        private const double LegacyPlatinumSlopeThreshold = 0.01d;
        private const double CoefficientEpsilon = 0.000000000001d;

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

        private static bool UsesLegacyPlatinumTransferFunction(SondeMetrologySettings metrology)
        {
            if (metrology == null || !metrology.HasAjustage)
            {
                return false;
            }

            // Les ajustages historiques des sondes IP ne stockent pas une pente °C/raw.
            // Coeff_X et Coeff_Constant décrivent la conversion raw -> R/R0 de la platine,
            // avant inversion de la loi Callendar-Van Dusen utilisée par Vigitemp.
            // Les ajustages linéaires VigiSensys récents restent, eux, sur le chemin générique.
            return Math.Abs(metrology.CoeffX2) <= CoefficientEpsilon
                && Math.Abs(metrology.CoeffX) > CoefficientEpsilon
                && Math.Abs(metrology.CoeffX) < LegacyPlatinumSlopeThreshold
                && Math.Abs(metrology.CoeffConstant) < 10d;
        }

        private bool TryApplyLegacyPlatinumMetrology(double rawValue, out double correctedValue)
        {
            correctedValue = 0d;

            var metrology = ths.GetSondeMetrologyCached(m_sondeSerialNumber);
            if (!UsesLegacyPlatinumTransferFunction(metrology))
            {
                return false;
            }

            var halfRatio = PlatinumCoefficientA / (2d * PlatinumCoefficientB);
            var discriminant =
                (halfRatio * halfRatio)
                + (metrology.CoeffX * rawValue + (metrology.CoeffConstant - 1d)) / PlatinumCoefficientB;

            if (double.IsNaN(discriminant) || double.IsInfinity(discriminant) || discriminant < 0d)
            {
                VigitempServeur.Log(
                    $"[SONDE][METROLOGY][WARN] type=IP serial={m_sondeSerialNumber} model=platinum-legacy " +
                    $"raw={ToInvariantRaw(rawValue)} discriminant={discriminant} status=invalid");
                return false;
            }

            var value = -halfRatio - Math.Sqrt(discriminant);
            var afterPlatinum = value;

            if (metrology.Offset.HasValue)
            {
                value += metrology.Offset.Value;
            }

            var appliedCorrectionEj = false;
            if (metrology.HasEtalonnage && metrology.ApplyCorrectionEj && metrology.CorrectionJustesse.HasValue)
            {
                value += metrology.CorrectionJustesse.Value;
                appliedCorrectionEj = true;
            }

            if (double.IsNaN(value) || double.IsInfinity(value))
            {
                return false;
            }

            if (ths != null && ths.LogMetrologyDetailed)
            {
                VigitempServeur.Log(
                    $"Metrology apply serial={m_sondeSerialNumber} idLieu={m_idLieu} model=platinum-legacy " +
                    $"raw={ToInvariantRaw(rawValue)} coeffX={metrology.CoeffX} coeffC={metrology.CoeffConstant} " +
                    $"afterPlatinum={afterPlatinum} " +
                    $"offset={(metrology.Offset.HasValue ? metrology.Offset.Value.ToString() : "null")} " +
                    $"applyCorrectionEj={metrology.ApplyCorrectionEj} appliedCorrectionEj={appliedCorrectionEj} final={value}");
            }

            correctedValue = value;
            return true;
        }

        // Constructeur
        public SensorIP(ThreadServeur p_ths, string p_comPort, string p_sondeSerialNumber, string p_sondeAdresse) : base(p_ths, p_comPort, p_sondeSerialNumber, p_sondeAdresse)
        {
            m_port.DataReceived += new SerialDataReceivedEventHandler(DataReceivedHandler);
            // La trame IP est hybride : en-tete ASCII + 2 octets de mesure binaires.
            // Latin-1 conserve une correspondance 1:1 byte -> char avec ReadExisting(),
            // contrairement a l'ASCII par defaut qui remplace les octets > 0x7F par '?'.
            m_port.Encoding = Encoding.GetEncoding("ISO-8859-1");
            m_regexResponseTempSensor = @".*(R" + m_sondeSerialNumber.Substring(m_sondeSerialNumber.Length - 4) + "R[\x00-\xFF]{2}').*";
        }

        public override async Task<bool> read()
        {
            return await ExecuteWithPortLockAsync(ReadCoreAsync);
        }

        private async Task<bool> ReadCoreAsync()
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
                VigitempServeur.Log($"[SONDE][RX] type=IP serial={m_sondeSerialNumber} high=0x{poidsFort:X2} low=0x{poidsFaible:X2} resistance={tmp_resistance}");

                var rawValue = Convert.ToDouble(tmp_resistance, System.Globalization.CultureInfo.InvariantCulture);
                double metrologyValue;
                var usedLegacyPlatinumConversion = TryApplyLegacyPlatinumMetrology(rawValue, out metrologyValue);
                var correctedValue = RoundMeasure(
                    usedLegacyPlatinumConversion
                        ? metrologyValue
                        : ApplyMetrology(rawValue));

                HandleSensorPowerAlarm(hasBatteryMarker, hasBatteryMarker ? "IP-BAT" : "IP-NORMAL");
                HandleNoResponseAlarm(true);
                compareMeasuresAndLimits(correctedValue, "°C");
                ths.GetDatabase().AddMesure(m_sondeSerialNumber, correctedValue, "°C", ToInvariantRaw(rawValue));
                VigitempServeur.Log(
                    $"[SONDE][DONE] type=IP serial={m_sondeSerialNumber} port={m_comPort} status=success " +
                    $"value={correctedValue} unit=°C raw={ToInvariantRaw(rawValue)} " +
                    $"model={(usedLegacyPlatinumConversion ? "platinum-legacy" : "linear")}");

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
