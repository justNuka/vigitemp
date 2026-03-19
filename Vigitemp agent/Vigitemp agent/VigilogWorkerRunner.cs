using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Runtime.InteropServices;
using System.Web.Script.Serialization;
using System.Windows.Forms;
using LogTagNET;
using LOGTAG_INFO = LogTagNET.LOGTAG_INFO;
using LOGTAG_SENSOR = LogTagNET.LOGTAG_SENSOR;
using LOGTAG_READING = LogTagNET.LOGTAG_READING;
using LOGTAG_PDF_INFO = LogTagNET.LOGTAG_PDF_INFO;
using LOGTAG_INTERFACE = LogTagNET.LOGTAG_INTERFACE;
using LOGTAG_PORTINFO = LogTagNET.LOGTAG_PORTINFO;
using COMMPORT = LogTagNET.COMMPORT;
using LogTag = LogTagNET.LogTag;

namespace VigitempLogTagWorker
{
    using HINSTANCE = IntPtr;
    using LOGTAG_HANDLE = UInt32;

    internal static class VigilogWorkerRunner
    {
        private static string _stateFilePath;
        private static readonly string LogDirectory = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "VigitempAgent",
            "logs"
        );
        private static readonly string LogFilePath = Path.Combine(LogDirectory, "vigilog-worker.log");

        private sealed class WorkerResult
        {
            public bool res { get; set; }
            public string details { get; set; }
            public string loggerSerial { get; set; }
            public string productId { get; set; }
            public int? frequencyMinutes { get; set; }
            public int? alarmDelayMinutes { get; set; }
            public bool? lowLimitActive { get; set; }
            public double? lowLimit { get; set; }
            public bool? highLimitActive { get; set; }
            public double? highLimit { get; set; }
            public int? measurementCount { get; set; }
            public List<MeasureDto> measures { get; set; }
            public string step { get; set; }
            public bool? startedAutomatically { get; set; }
            public string scheduledStartAt { get; set; }
        }

        private sealed class MeasureDto
        {
            public int Numero_Ordre { get; set; }
            public string Date_Heure_Mesure { get; set; }
            public double? Valeur { get; set; }
            public bool Est_Marqueur { get; set; }
            public string Details { get; set; }
        }

        private static readonly JavaScriptSerializer Json = new JavaScriptSerializer { MaxJsonLength = int.MaxValue };
        private sealed class HiddenLogTagForm : Form
        {
            public HiddenLogTagForm()
            {
                ShowInTaskbar = false;
                FormBorderStyle = FormBorderStyle.FixedToolWindow;
                StartPosition = FormStartPosition.Manual;
                Location = new System.Drawing.Point(-32000, -32000);
                Size = new System.Drawing.Size(1, 1);
                Opacity = 0;
            }
        }

        public static int Run(string[] args)
        {
            WorkerResult result;
            try
            {
                Directory.CreateDirectory(LogDirectory);
                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);

                using (var hiddenForm = new HiddenLogTagForm())
                {
                    var handle = hiddenForm.Handle;
                    result = Execute(args ?? Array.Empty<string>(), handle);
                }
            }
            catch (Exception ex)
            {
                Log("fatal", ex.ToString());
                result = Fail("Erreur worker LogTag: " + ex.Message, null, null);
            }

            var serialized = Json.Serialize(result);
            try
            {
                Console.OutputEncoding = System.Text.Encoding.UTF8;
            }
            catch (IOException ex)
            {
                Log("warn", "Console.OutputEncoding unavailable: " + ex.Message);
            }
            catch (System.ComponentModel.Win32Exception ex)
            {
                Log("warn", "Console.OutputEncoding blocked: " + ex.Message);
            }

            try
            {
                Console.Write(serialized);
            }
            catch (IOException ex)
            {
                Log("error", "Console.Write failed: " + ex.Message);
                return 2;
            }

            return result.res ? 0 : 1;
        }

        private static WorkerResult Execute(string[] args, HINSTANCE windowHandle)
        {
            if (args.Length == 0)
            {
                return Fail("Commande worker manquante", null, null);
            }

            var command = args[0].Trim().ToLowerInvariant();
            var commandArgs = new List<string>();
            for (int i = 1; i < args.Length; i++)
            {
                if (string.Equals(args[i], "--state-file", StringComparison.OrdinalIgnoreCase) && i + 1 < args.Length)
                {
                    _stateFilePath = args[i + 1];
                    i++;
                    continue;
                }

                commandArgs.Add(args[i]);
            }

            Log("info", "command=" + command);
            switch (command)
            {
                case "presence":
                    return Presence(windowHandle);
                case "probe":
                    return Probe(windowHandle);
                case "configure":
                    return Configure(commandArgs.ToArray(), windowHandle);
                case "clear":
                    return Clear(windowHandle);
                case "read":
                    return Read(windowHandle);
                default:
                    return Fail("Commande worker inconnue: " + command, null, null);
            }
        }

        private static WorkerResult Presence(HINSTANCE windowHandle)
        {
            string currentStep = "initialisation";
            LOGTAG_HANDLE handle = 0;

            try
            {
                currentStep = "OpenAccess";
                LogStep("OpenAccess");
                handle = LogTag.OpenAccess(windowHandle);
                if (handle == 0)
                {
                    currentStep = "LogOnUser";
                    LogStep("LogOnUser");
                    LogTag.LogOnUser(null, null, null);
                    currentStep = "OpenAccessRetry";
                    LogStep("OpenAccessRetry");
                    handle = LogTag.OpenAccess(windowHandle);
                    if (handle == 0)
                    {
                        return Fail("Impossible d'acceder au logger", currentStep, null);
                    }
                }

                uint portCount = 0;
                currentStep = "GetPortInfoPrimary";
                LogStep("GetPortInfoPrimary");
                var portType = (ushort)COMMPORT.LTHID;
                LogTag.GetPortInfo(null, ref portCount, portType);
                LogPortProbe("presence", currentStep, portType, portCount);

                if (portCount == 0)
                {
                    currentStep = "GetPortInfoUsb";
                    LogStep("GetPortInfoUsb");
                    portType = (ushort)COMMPORT.USB;
                    LogTag.GetPortInfo(null, ref portCount, portType);
                    LogPortProbe("presence", currentStep, portType, portCount);
                }

                if (portCount == 0)
                {
                    currentStep = "GetPortInfoHid";
                    LogStep("GetPortInfoHid");
                    portType = (ushort)COMMPORT.HID;
                    LogTag.GetPortInfo(null, ref portCount, portType);
                    LogPortProbe("presence", currentStep, portType, portCount);
                }

                if (portCount == 0)
                {
                    return new WorkerResult
                    {
                        res = false,
                        details = "Aucune base VigiLog détectée",
                        step = currentStep
                    };
                }

                currentStep = "GetPortInfoDetails";
                LogStep("GetPortInfoDetails");
                var tabPortInfo = new LOGTAG_PORTINFO[portCount];
                LogTag.GetPortInfo(tabPortInfo, ref portCount, portType);
                tabPortInfo[0].cbSize = (uint)Marshal.SizeOf(tabPortInfo[0]);

                currentStep = "OpenIO";
                LogStep("OpenIO");
                if (LogTag.OpenIO(handle, tabPortInfo) != 0)
                {
                    return Fail("Impossible d'ouvrir la base VigiLog", currentStep, null);
                }

                currentStep = "GetInterface";
                LogStep("GetInterface");
                var ltInterface = new LOGTAG_INTERFACE[1];
                ltInterface[0].cbSize = (uint)Marshal.SizeOf(ltInterface[0]);
                if (LogTag.GetInterface(handle, ltInterface) != 0)
                {
                    return Fail("Impossible de lire l'etat de la base VigiLog", currentStep, null);
                }

                var loggerDetected = (((LTIS)ltInterface[0].wStatus) & LTIS.LOGTAG) == LTIS.LOGTAG;

                return new WorkerResult
                {
                    res = loggerDetected,
                    details = loggerDetected ? "VigiLog détecté" : "Base branchee sans VigiLog",
                    step = currentStep
                };
            }
            finally
            {
                if (handle != 0) LogTag.Close(handle);
            }
        }

        private static WorkerResult Probe(HINSTANCE windowHandle)
        {
            string currentStep = "initialisation";
            LOGTAG_HANDLE handle;
            LOGTAG_INFO[] info;
            LOGTAG_SENSOR[] sensors;
            string error;

            if (!TryOpenSingleLogTag(out handle, out info, out sensors, out error, step => currentStep = step, windowHandle))
            {
                return Fail(error ?? "Impossible d'acceder au logger", currentStep, null);
            }

            try
            {
                int frequencyMinutes = (int)Math.Max(1, info[0].dwLogInterval / 60000);
                int alertReadings = Math.Max(
                    Math.Max(info[0].baAlertDelay[0], info[0].baAlertDelay[1]),
                    sensors[0].wConsecutiveAlertDelay + 1
                );
                int alarmDelayMinutes = Math.Max(1, alertReadings * frequencyMinutes);

                return new WorkerResult
                {
                    res = true,
                    details = "Logger detecte",
                    loggerSerial = ExtractLogTagSerial(info[0]),
                    productId = ExtractLogTagProductId(info[0]),
                    frequencyMinutes = frequencyMinutes,
                    alarmDelayMinutes = alarmDelayMinutes,
                    lowLimitActive = info[0].baAlertControlByte[0] == 128,
                    lowLimit = sensors[0].dLowerAlert,
                    highLimitActive = info[0].baAlertControlByte[1] == 129,
                    highLimit = sensors[0].dUpperAlert,
                    step = currentStep
                };
            }
            finally
            {
                if (handle != 0) LogTag.Close(handle);
            }
        }

        private static WorkerResult Configure(string[] args, HINSTANCE windowHandle)
        {
            if (args.Length < 7)
            {
                return Fail("Arguments configure incomplets", "arguments", null);
            }

            bool lowLimitActive = ParseBoolArg(args[0]);
            double? lowLimit = ParseNullableDoubleArg(args[1]);
            bool highLimitActive = ParseBoolArg(args[2]);
            double? highLimit = ParseNullableDoubleArg(args[3]);
            int frequencyMinutes = ParseIntArg(args[4], 1);
            int alarmDelayMinutes = ParseIntArg(args[5], 1);
            bool startAutomatically = ParseBoolArg(args[6]);

            string currentStep = "initialisation";
            LOGTAG_HANDLE handle;
            LOGTAG_INFO[] info;
            LOGTAG_SENSOR[] sensors;
            string error;

            if (!TryOpenSingleLogTag(out handle, out info, out sensors, out error, step => currentStep = step, windowHandle))
            {
                return Fail(error ?? "Impossible d'acceder au logger", currentStep, null);
            }

            try
            {
                currentStep = "GetInfo3";
                LogStep("GetInfo3");
                var pdfInfo = CreatePdfInfoArray(1);
                if (LogTag.GetInfo3(handle, info, sensors, pdfInfo) != 0)
                {
                    return Fail("Lecture detaillee du logger impossible", currentStep, ExtractLogTagSerial(info[0]));
                }

                string loggerSerial = ExtractLogTagSerial(info[0]);
                int alertDelayReadings = Math.Max(1, (int)Math.Ceiling((double)alarmDelayMinutes / Math.Max(frequencyMinutes, 1)));
                ushort consecutiveAlertDelay = (ushort)Math.Max(0, alertDelayReadings - 1);
                byte alertDelayByte = (byte)Math.Min(255, alertDelayReadings);
                DateTime? scheduledStart = null;

                info[0].wSensorCount = info[0].wNumOfSensors > 0 ? info[0].wNumOfSensors : (ushort)1;

                for (int i = 0; i < info[0].wSensorCount; i++)
                {
                    sensors[i].wConsecutiveAlertDelay = consecutiveAlertDelay;
                    if (lowLimitActive && lowLimit.HasValue) sensors[i].dLowerAlert = lowLimit.Value;
                    if (highLimitActive && highLimit.HasValue) sensors[i].dUpperAlert = highLimit.Value;
                }

                info[0].dwLogInterval = (uint)(frequencyMinutes * 60 * 1000);
                info[0].nFlags = 9251;
                if (startAutomatically)
                {
                    scheduledStart = DateTime.Now.AddMinutes(1);
                    info[0].wStartMethod = (ushort)LTIS2.TIME;
                    info[0].stStart = ToSystemTime(scheduledStart.Value);
                    info[0].dwStartDelay = (uint)Math.Max(0, (int)(scheduledStart.Value - DateTime.Now).TotalMilliseconds);
                }
                else
                {
                    info[0].wStartMethod = (ushort)LTIS2.BUTTON;
                    info[0].dwStartDelay = 0;
                }
                info[0].baAlertControlByte[0] = lowLimitActive ? (byte)128 : (byte)0;
                info[0].baAlertControlByte[1] = highLimitActive ? (byte)129 : (byte)0;
                info[0].baAlertDelay[0] = alertDelayByte;
                info[0].baAlertDelay[1] = alertDelayByte;

                if (lowLimitActive && lowLimit.HasValue) info[0].fAlertThreshVal[0] = (float)lowLimit.Value;
                if (highLimitActive && highLimit.HasValue) info[0].fAlertThreshVal[1] = (float)highLimit.Value;

                currentStep = "SetInfo2";
                if (LogTag.SetInfo2(handle, info, sensors) != 0)
                {
                    return Fail("Parametrage du logger impossible", currentStep, loggerSerial);
                }

                return new WorkerResult
                {
                    res = true,
                    details = "Parametrage correctement applique",
                    loggerSerial = loggerSerial,
                    productId = ExtractLogTagProductId(info[0]),
                    frequencyMinutes = frequencyMinutes,
                    alarmDelayMinutes = alarmDelayMinutes,
                    lowLimitActive = lowLimitActive,
                    lowLimit = lowLimit,
                    highLimitActive = highLimitActive,
                    highLimit = highLimit,
                    step = currentStep,
                    startedAutomatically = startAutomatically,
                    scheduledStartAt = scheduledStart?.ToString("o")
                };
            }
            finally
            {
                if (handle != 0) LogTag.Close(handle);
            }
        }

        private static WorkerResult Read(HINSTANCE windowHandle)
        {
            string currentStep = "initialisation";
            LOGTAG_HANDLE handle;
            LOGTAG_INFO[] info;
            LOGTAG_SENSOR[] sensors;
            string error;

            if (!TryOpenSingleLogTag(out handle, out info, out sensors, out error, step => currentStep = step, windowHandle))
            {
                return Fail(error ?? "Impossible d'acceder au logger", currentStep, null);
            }

            try
            {
                currentStep = "GetInfo3";
                LogStep("GetInfo3");
                var pdfInfo = CreatePdfInfoArray(1);
                if (LogTag.GetInfo3(handle, info, sensors, pdfInfo) != 0)
                {
                    return Fail("Lecture detaillee du logger impossible", currentStep, ExtractLogTagSerial(info[0]));
                }

                info[0].wSensorCount = info[0].wNumOfSensors > 0 ? info[0].wNumOfSensors : (ushort)1;
                info[0].dwReadingsCount = info[0].dwNumOfReadings;

                var readings = new LOGTAG_READING[info[0].dwNumOfReadings + 1];
                currentStep = "GetData2";
                LogStep("GetData2");
                if (LogTag.GetData2(handle, info, sensors, readings) != 0)
                {
                    return Fail("Lecture des mesures impossible", currentStep, ExtractLogTagSerial(info[0]));
                }

                var measures = new List<MeasureDto>(readings.Length);
                for (int i = 0; i < readings.Length; i++)
                {
                    var year = readings[i].stTaken.wYear;
                    var month = readings[i].stTaken.wMonth;
                    var day = readings[i].stTaken.wDay;
                    var hour = readings[i].stTaken.wHour;
                    var minute = readings[i].stTaken.wMinute;
                    var second = readings[i].stTaken.wSecond;

                    if (year <= 0 || month <= 0 || day <= 0)
                    {
                        continue;
                    }

                    DateTime dtMesure;
                    try
                    {
                        dtMesure = new DateTime(year, month, day, hour, minute, second, DateTimeKind.Local);
                    }
                    catch (ArgumentOutOfRangeException)
                    {
                        continue;
                    }

                    measures.Add(new MeasureDto
                    {
                        Numero_Ordre = i + 1,
                        Date_Heure_Mesure = dtMesure.ToString("o"),
                        Valeur = readings[i].dReading[0],
                        Est_Marqueur = false,
                        Details = ExtractLogTagComment(readings[i])
                    });
                }

                return new WorkerResult
                {
                    res = true,
                    details = "Mesures recuperees",
                    loggerSerial = ExtractLogTagSerial(info[0]),
                    productId = ExtractLogTagProductId(info[0]),
                    measurementCount = measures.Count,
                    measures = measures,
                    step = currentStep
                };
            }
            finally
            {
                if (handle != 0) LogTag.Close(handle);
            }
        }

        private static WorkerResult Clear(HINSTANCE windowHandle)
        {
            string currentStep = "initialisation";
            LOGTAG_HANDLE handle;
            LOGTAG_INFO[] info;
            LOGTAG_SENSOR[] sensors;
            string error;

            if (!TryOpenSingleLogTag(out handle, out info, out sensors, out error, step => currentStep = step, windowHandle))
            {
                return Fail(error ?? "Impossible d'acceder au logger", currentStep, null);
            }

            try
            {
                currentStep = "GetInfo3";
                LogStep("GetInfo3");
                var pdfInfo = CreatePdfInfoArray(1);
                if (LogTag.GetInfo3(handle, info, sensors, pdfInfo) != 0)
                {
                    return Fail("Lecture detaillee du logger impossible", currentStep, ExtractLogTagSerial(info[0]));
                }

                currentStep = "SetInfo2";
                LogStep("SetInfo2");
                if (LogTag.SetInfo2(handle, info, sensors) != 0)
                {
                    return Fail("Effacement des mesures impossible", currentStep, ExtractLogTagSerial(info[0]));
                }

                return new WorkerResult
                {
                    res = true,
                    details = "Mesures effacees",
                    loggerSerial = ExtractLogTagSerial(info[0]),
                    productId = ExtractLogTagProductId(info[0]),
                    step = currentStep
                };
            }
            finally
            {
                if (handle != 0) LogTag.Close(handle);
            }
        }

        private static bool TryOpenSingleLogTag(
            out LOGTAG_HANDLE hLogTag,
            out LOGTAG_INFO[] ltinfo,
            out LOGTAG_SENSOR[] ltsensor,
            out string errorDetails,
            Action<string> setStep,
            HINSTANCE windowHandle)
        {
            hLogTag = 0;
            ltinfo = null;
            ltsensor = null;
            errorDetails = null;

            uint portCount = 0;
            ushort portType = (ushort)COMMPORT.LTHID;

            setStep("OpenAccess");
            LogStep("OpenAccess");
            hLogTag = LogTag.OpenAccess(windowHandle);
            if (hLogTag == 0)
            {
                setStep("LogOnUser");
                LogStep("LogOnUser");
                LogTag.LogOnUser(null, null, null);
                setStep("OpenAccessRetry");
                LogStep("OpenAccessRetry");
                hLogTag = LogTag.OpenAccess(windowHandle);
                if (hLogTag == 0)
                {
                    errorDetails = "Impossible d'acceder au logger";
                    Log("error", errorDetails);
                    return false;
                }
            }

            setStep("GetPortInfoPrimary");
            LogStep("GetPortInfoPrimary");
            LogTag.GetPortInfo(null, ref portCount, portType);
            LogPortProbe("open-single", "GetPortInfoPrimary", portType, portCount);
            if (portCount == 0)
            {
                setStep("GetPortInfoFallback");
                LogStep("GetPortInfoFallback");
                portType = (ushort)COMMPORT.USB;
                LogTag.GetPortInfo(null, ref portCount, portType);
                LogPortProbe("open-single", "GetPortInfoFallback", portType, portCount);
            }
            if (portCount == 0)
            {
                setStep("GetPortInfoFallbackHid");
                LogStep("GetPortInfoFallbackHid");
                portType = (ushort)COMMPORT.HID;
                LogTag.GetPortInfo(null, ref portCount, portType);
                LogPortProbe("open-single", "GetPortInfoFallbackHid", portType, portCount);
            }

            if (portCount > 1)
            {
                errorDetails = "Plusieurs docks logger connectes";
                Log("error", errorDetails);
                LogTag.Close(hLogTag);
                hLogTag = 0;
                return false;
            }
            if (portCount == 0)
            {
                errorDetails = "Aucun dock logger connecte";
                Log("error", errorDetails);
                LogTag.Close(hLogTag);
                hLogTag = 0;
                return false;
            }

            setStep("GetPortInfoDetails");
            LogStep("GetPortInfoDetails");
            var tabPortInfo = new LOGTAG_PORTINFO[portCount];
            LogTag.GetPortInfo(tabPortInfo, ref portCount, portType);
            tabPortInfo[0].cbSize = (uint)Marshal.SizeOf(tabPortInfo[0]);

            setStep("OpenIO");
            LogStep("OpenIO");
            var ltInterface = new LOGTAG_INTERFACE[1];
            ltInterface[0].cbSize = (uint)Marshal.SizeOf(ltInterface[0]);
            LogTag.OpenIO(hLogTag, tabPortInfo);

            setStep("GetInterface");
            LogStep("GetInterface");
            LogTag.GetInterface(hLogTag, ltInterface);

            ltinfo = CreateInfoArray(1);
            ltsensor = CreateSensorArray(2);
            ltinfo[0].wSensorCount = 1;
            ltinfo[0].wNumOfSensors = 1;
            var pdfInfo = CreatePdfInfoArray(1);

            setStep("GetInfo3");
            LogStep("GetInfo3");
            if (LogTag.GetInfo3(hLogTag, ltinfo, ltsensor, pdfInfo) != 0)
            {
                errorDetails = "Pas de logger detecte sur le dock";
                Log("error", errorDetails);
                LogTag.Close(hLogTag);
                hLogTag = 0;
                ltinfo = null;
                return false;
            }

            var sensorCount = ltinfo[0].wNumOfSensors > 0 ? ltinfo[0].wNumOfSensors : (ushort)1;
            ltinfo[0].wSensorCount = sensorCount;
            if (ltsensor == null || ltsensor.Length < sensorCount)
            {
                ltsensor = CreateSensorArray(sensorCount);
            }

            return true;
        }

        private static string ReadUnicodeByteArray(byte[] buffer)
        {
            if (buffer == null) return null;

            var chars = new List<char>();
            for (int i = 0; i < buffer.Length; i += 2)
            {
                if (buffer[i] == 0) break;
                chars.Add((char)buffer[i]);
            }

            return new string(chars.ToArray());
        }

        private static string ExtractLogTagSerial(LOGTAG_INFO info)
        {
            var channelInfo = ReadUnicodeByteArray(info.szChannelInfo);
            if (!string.IsNullOrWhiteSpace(channelInfo))
            {
                return channelInfo;
            }

            return ReadUnicodeByteArray(info.szSerialNum);
        }

        private static string ExtractLogTagProductId(LOGTAG_INFO info)
        {
            return ReadUnicodeByteArray(info.szProductId);
        }

        private static string ExtractLogTagComment(LOGTAG_READING reading)
        {
            return ReadUnicodeByteArray(reading.szComment);
        }

        private static bool ParseBoolArg(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return false;
            value = value.Trim();
            return value == "1" || value.Equals("true", StringComparison.OrdinalIgnoreCase);
        }

        private static double? ParseNullableDoubleArg(string value)
        {
            if (string.IsNullOrWhiteSpace(value) || string.Equals(value, "null", StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            return double.Parse(value, CultureInfo.InvariantCulture);
        }

        private static int ParseIntArg(string value, int fallback)
        {
            int parsed;
            return int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out parsed) ? parsed : fallback;
        }

        private static SYSTEMTIME ToSystemTime(DateTime value)
        {
            value = value.ToLocalTime();
            return new SYSTEMTIME
            {
                wYear = (short)value.Year,
                wMonth = (short)value.Month,
                wDay = (short)value.Day,
                wHour = (short)value.Hour,
                wMinute = (short)value.Minute,
                wSecond = (short)value.Second,
                wMilliseconds = (short)value.Millisecond,
                wDayOfWeek = (short)value.DayOfWeek
            };
        }

        private static WorkerResult Fail(string details, string step, string loggerSerial)
        {
            Log("error", $"details={details}; step={step}; serial={loggerSerial}");
            return new WorkerResult
            {
                res = false,
                details = details,
                step = step,
                loggerSerial = loggerSerial
            };
        }

        private static LOGTAG_INFO[] CreateInfoArray(int count)
        {
            var infos = new LOGTAG_INFO[count];
            for (int i = 0; i < count; i++)
            {
                infos[i].szChannelInfo = new byte[32 * 2];
                infos[i].szPassword = new byte[32 * 2];
                infos[i].szProductId = new byte[32 * 2];
                infos[i].szSerialNum = new byte[16 * 2];
                infos[i].szUserInfo = new byte[160 * 2];
                infos[i].szVersion = new byte[16 * 2];
                infos[i].baAlertControlByte = new byte[3];
                infos[i].baAlertDelay = new byte[3];
                infos[i].fAlertThreshVal = new float[3];
                infos[i].baPassword = new byte[32];
                infos[i].baMultiAlertControlByte = new byte[6];
                infos[i].fMultiAlertThreshVal = new float[6];
                infos[i].waMultiAlertDelay = new ushort[6];
                infos[i].cbSize = (uint)Marshal.SizeOf(infos[i]);
            }

            return infos;
        }

        private static LOGTAG_SENSOR[] CreateSensorArray(int count)
        {
            var sensors = new LOGTAG_SENSOR[count];
            for (int i = 0; i < count; i++)
            {
                sensors[i].szUserInfo = new byte[64 * 2];
                sensors[i].szScale = new byte[32 * 2];
                sensors[i].cbSize = (uint)Marshal.SizeOf(sensors[i]);
            }

            return sensors;
        }

        private static LOGTAG_PDF_INFO[] CreatePdfInfoArray(int count)
        {
            var infos = new LOGTAG_PDF_INFO[count];
            for (int i = 0; i < count; i++)
            {
                infos[i].szPDFPassword = new byte[17 * 2];
                infos[i].szPDFBrandname = new byte[17 * 2];
                infos[i].dwAlertPVal80 = new long[6];
                infos[i].dwLimitsPVal80 = new long[2];
                infos[i].cbSize = (uint)Marshal.SizeOf(infos[i]);
            }

            return infos;
        }

        private static void LogStep(string step)
        {
            try
            {
                if (!string.IsNullOrWhiteSpace(_stateFilePath))
                {
                    File.WriteAllText(_stateFilePath, step ?? string.Empty);
                }
            }
            catch
            {
                // ignore
            }

            Log("step", step ?? string.Empty);
        }

        private static void LogPortProbe(string context, string step, ushort portType, uint portCount)
        {
            Log(
                "info",
                string.Format(
                    CultureInfo.InvariantCulture,
                    "port_probe context={0}; step={1}; portType={2}; portTypeName={3}; portCount={4}",
                    context ?? string.Empty,
                    step ?? string.Empty,
                    portType,
                    DescribePortType(portType),
                    portCount
                )
            );
        }

        private static string DescribePortType(ushort portType)
        {
            if (portType == (ushort)COMMPORT.LTHID) return "LTHID";
            if (portType == (ushort)COMMPORT.USB) return "USB";
            if (portType == (ushort)COMMPORT.HID) return "HID";
            return "UNKNOWN";
        }

        private const long MaxWorkerLogSizeBytes = 5L * 1024 * 1024; // 5 MB

        private static void RotateWorkerLogIfNeeded(string path)
        {
            try
            {
                if (!File.Exists(path)) return;
                var info = new FileInfo(path);
                if (info.Length < MaxWorkerLogSizeBytes) return;
                var backupPath = path + ".bak";
                if (File.Exists(backupPath)) File.Delete(backupPath);
                File.Move(path, backupPath);
            }
            catch
            {
                // ignore rotation errors — don't break logging
            }
        }

        private static void Log(string level, string message)
        {
            try
            {
                RotateWorkerLogIfNeeded(LogFilePath);
                File.AppendAllText(
                    LogFilePath,
                    $"{DateTime.UtcNow:O} [{level}] {message}{Environment.NewLine}"
                );
            }
            catch
            {
                // ignore
            }
        }
    }
}
