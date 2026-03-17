using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.Globalization;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text;
using System.IO;
using System.Threading.Tasks;
using System.Web;
using System.Windows.Forms;
using System.ComponentModel;
// using LogTagNET;
using LogTagNETV2;
using Newtonsoft.Json.Linq;
using VigitempAgent;
using VigitempLogTagWorker;

namespace VigitempAgent
{
    using HINSTANCE = IntPtr;
    using LOGTAG_HANDLE = UInt32;

    class HttpServer
    {
        [DllImport("kernel32.dll", CharSet = CharSet.Auto)]
        private static extern HINSTANCE GetModuleHandle(string lpModuleName);
        // [DllImport("LogTagIO29.dll")]
        // private static extern HINSTANCE getData(string lpModuleName);
        public static HttpListener listener;

        public static string url = "http://" + GetLocalIPAddress() + ":8000/";
        public static string url_localhost = "http://127.0.0.1:8000/";


        private static readonly object _alarmLock = new object();
        private static readonly HashSet<int> _alarmLieuxActive = new HashSet<int>();

        private static void SafeInvokeFormAlert(Form_Alert frmAlert, Action action)
        {
            if (frmAlert == null || action == null) return;

            try
            {
                if (frmAlert.IsDisposed || !frmAlert.IsHandleCreated)
                {
                    return;
                }

                if (frmAlert.InvokeRequired)
                {
                    frmAlert.BeginInvoke((Action)(() =>
                    {
                        if (!frmAlert.IsDisposed)
                        {
                            action();
                        }
                    }));
                }
                else
                {
                    action();
                }
            }
            catch (InvalidOperationException)
            {
                // The form handle can disappear during startup/shutdown. Ignore transient UI races.
            }
        }

        private static bool IsLoopback(HttpListenerRequest req)
        {
            try
            {
                var ep = req.RemoteEndPoint;
                if (ep == null) return false;
                return IPAddress.IsLoopback(ep.Address);
            }
            catch
            {
                return false;
            }
        }


        private static string ResolveNotifySecret()
        {
            try
            {
                var env = Environment.GetEnvironmentVariable("VIGITEMP_AGENT_SECRET");
                if (!string.IsNullOrWhiteSpace(env)) return env.Trim();
            }
            catch
            {
                // ignore
            }

            try
            {
                var cfg =
                    ConfigurationManager.AppSettings["VigitempAgentSecret"] ??
                    ConfigurationManager.AppSettings["VIGITEMP_AGENT_SECRET"];
                if (!string.IsNullOrWhiteSpace(cfg)) return cfg.Trim();
            }
            catch
            {
                // ignore
            }

            try
            {
                var inMemory = MyCustomApplicationContext.Instance?.AGENT_SECRET;
                if (!string.IsNullOrWhiteSpace(inMemory)) return inMemory.Trim();
            }
            catch
            {
                // ignore
            }

            try
            {
                var stored = AgentSecretStore.Get();
                if (!string.IsNullOrWhiteSpace(stored)) return stored.Trim();
            }
            catch
            {
                // ignore
            }

            return null;
        }

        private static bool IsNotifyAuthorized(HttpListenerRequest req)
        {
            var expected = ResolveNotifySecret();
            if (string.IsNullOrWhiteSpace(expected)) return false;

            var provided = req.Headers["x-vigitemp-agent-secret"];
            return !string.IsNullOrWhiteSpace(provided) &&
                   string.Equals(provided.Trim(), expected, StringComparison.Ordinal);
        }

        private static string JsonEscape(string value)
        {
            if (value == null) return "";
            return value.Replace("\\", "\\\\").Replace("\"", "\\\"");
        }

        private static bool IsPrivateOrLoopback(IPAddress address)
        {
            if (address == null) return false;
            if (IPAddress.IsLoopback(address)) return true;

            var bytes = address.GetAddressBytes();
            return address.AddressFamily == AddressFamily.InterNetwork && (
                bytes[0] == 10 ||
                (bytes[0] == 172 && bytes[1] >= 16 && bytes[1] <= 31) ||
                (bytes[0] == 192 && bytes[1] == 168)
            );
        }

        private static string ResolveAllowedCorsOrigin(HttpListenerRequest req)
        {
            var configuredOrigin =
                System.Configuration.ConfigurationManager.AppSettings["VigitempSiteWebUrl"] ??
                "http://127.0.0.1:3000";

            var origin = req?.Headers["Origin"];
            if (string.IsNullOrWhiteSpace(origin))
            {
                return configuredOrigin;
            }

            try
            {
                if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                {
                    return configuredOrigin;
                }

                if (string.Equals(origin.TrimEnd('/'), configuredOrigin.TrimEnd('/'), StringComparison.OrdinalIgnoreCase))
                {
                    return origin;
                }

                if (string.Equals(uri.Host, "localhost", StringComparison.OrdinalIgnoreCase))
                {
                    return origin;
                }

                IPAddress ip;
                if (IPAddress.TryParse(uri.Host, out ip) && IsPrivateOrLoopback(ip))
                {
                    return origin;
                }
            }
            catch
            {
                // ignore and fall back to configured origin
            }

            return configuredOrigin;
        }

        private static void EnsureCorsHeaders(HttpListenerResponse resp, HttpListenerRequest req = null)
        {
            resp.Headers["Access-Control-Allow-Origin"] = ResolveAllowedCorsOrigin(req);
            resp.Headers["Access-Control-Allow-Methods"] = "GET, POST, DELETE, OPTIONS";
            resp.Headers["Access-Control-Allow-Headers"] = "Content-Type";
            resp.Headers["Access-Control-Max-Age"] = "600";
            resp.Headers["Vary"] = "Origin";
        }

        private static async Task WriteJsonResponse(HttpListenerResponse resp, int statusCode, JObject payload, HttpListenerRequest req = null)
        {
            var json = payload.ToString(Newtonsoft.Json.Formatting.None);
            var bytes = Encoding.UTF8.GetBytes(json);
            resp.StatusCode = statusCode;
            resp.ContentType = "application/json";
            resp.ContentEncoding = Encoding.UTF8;
            EnsureCorsHeaders(resp, req);
            resp.ContentLength64 = bytes.LongLength;
            await resp.OutputStream.WriteAsync(bytes, 0, bytes.Length);
            resp.Close();
        }

        private static string ReadUnicodeByteArray(byte[] buffer)
        {
            if (buffer == null) return null;

            var builder = new StringBuilder();
            for (int i = 0; i < buffer.Length; i += 2)
            {
                if (buffer[i] == 0) break;
                builder.Append((char)buffer[i]);
            }
            return builder.ToString();
        }

        private static string ExtractLogTagSerial(LOGTAG_INFO info)
        {
            return ReadUnicodeByteArray(info.szChannelInfo);
        }

        private static string ExtractLogTagComment(LOGTAG_READING reading)
        {
            return ReadUnicodeByteArray(reading.szComment);
        }

        private static bool TryOpenSingleLogTag(
            out LOGTAG_HANDLE hLogTag,
            out LOGTAG_INFO[] ltinfo,
            out LOGTAG_SENSOR[] ltsensor,
            out string errorDetails,
            Action<string> setStep = null)
        {
            hLogTag = 0;
            ltinfo = null;
            ltsensor = null;
            errorDetails = null;

            HINSTANCE hInstance = GetModuleHandle(null);
            uint portCount = 0;

            setStep?.Invoke("OpenAccess");
            hLogTag = LogTag.OpenAccess(hInstance);
            if (hLogTag == 0)
            {
                setStep?.Invoke("LogOnUser");
                if (LogTag.LogOnUser(null, null, null) != 0)
                    AgentLog.Error("TryOpenSingleLogTag: LogOnUser failed.", null);
                setStep?.Invoke("OpenAccessRetry");
                hLogTag = LogTag.OpenAccess(hInstance);
                if (hLogTag == 0)
                {
                    errorDetails = "Impossible d acceder au logger";
                    return false;
                }
            }

            setStep?.Invoke("GetPortInfoPrimary");
            if (LogTag.GetPortInfo(null, ref portCount, 4) != 0)
                AgentLog.Error("TryOpenSingleLogTag: GetPortInfo(4) failed.", null);
            if (portCount == 0)
            {
                setStep?.Invoke("GetPortInfoFallback");
                if (LogTag.GetPortInfo(null, ref portCount, 8) != 0)
                    AgentLog.Error("TryOpenSingleLogTag: GetPortInfo(8) failed.", null);
            }

            if (portCount > 1)
            {
                errorDetails = "Plusieurs docks logger connectes";
                LogTag.Close(hLogTag);
                hLogTag = 0;
                return false;
            }
            if (portCount == 0)
            {
                errorDetails = "Aucun dock logger connecte";
                LogTag.Close(hLogTag);
                hLogTag = 0;
                return false;
            }

            LOGTAG_PORTINFO[] tabPortInfo = new LOGTAG_PORTINFO[portCount];
            setStep?.Invoke("GetPortInfoDetails");
            if (LogTag.GetPortInfo(tabPortInfo, ref portCount, 4) != 0)
                AgentLog.Error("TryOpenSingleLogTag: GetPortInfo(details) failed.", null);
            tabPortInfo[0].cbSize = (uint)Marshal.SizeOf(tabPortInfo[0]);
            tabPortInfo[0].wPortIndex = 1;

            LOGTAG_INTERFACE[] ltInterface = new LOGTAG_INTERFACE[1];
            ltInterface[0].cbSize = (uint)Marshal.SizeOf(ltInterface[0]);
            setStep?.Invoke("OpenIO");
            if (LogTag.OpenIO(hLogTag, tabPortInfo) != 0)
                AgentLog.Error("TryOpenSingleLogTag: OpenIO failed.", null);
            setStep?.Invoke("GetInterface");
            if (LogTag.GetInterface(hLogTag, ltInterface) != 0)
                AgentLog.Error("TryOpenSingleLogTag: GetInterface failed.", null);

            ltinfo = new LOGTAG_INFO[1];
            ltinfo[0].cbSize = (uint)Marshal.SizeOf(ltinfo[0]);
            ltsensor = new LOGTAG_SENSOR[1];

            setStep?.Invoke("GetInfo2");
            if (LogTag.GetInfo2(hLogTag, ltinfo, ltsensor) != 0)
            {
                errorDetails = "Pas de logger detecte sur le dock";
                LogTag.Close(hLogTag);
                hLogTag = 0;
                ltinfo = null;
                ltsensor = null;
                return false;
            }

            if (ltinfo[0].wNumOfSensors <= 0)
                ltinfo[0].wSensorCount = 1;
            else
                ltinfo[0].wSensorCount = ltinfo[0].wNumOfSensors;

            return true;
        }

        private static JObject BuildVigilogFailurePayload(string details)
        {
            return new JObject
            {
                ["res"] = false,
                ["details"] = details ?? "Operation logger impossible"
            };
        }

        private static string GetVigilogWorkerPath()
        {
            return Application.ExecutablePath;
        }

        private static string EscapeWorkerArgument(string value)
        {
            if (string.IsNullOrEmpty(value)) return "\"\"";
            return "\"" + value.Replace("\\", "\\\\").Replace("\"", "\\\"") + "\"";
        }

        private static async Task<JObject> InvokeVigilogWorkerAsync(string command, int timeoutMs, params string[] args)
        {
            var workerPath = GetVigilogWorkerPath();
            if (!File.Exists(workerPath))
            {
                return BuildVigilogFailurePayload("Worker VigiLog introuvable");
            }

            var workerStateDirectory = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "VigitempAgent",
                "logs"
            );
            Directory.CreateDirectory(workerStateDirectory);
            var workerStatePath = Path.Combine(workerStateDirectory, "vigilog-worker.state");

            var allArgs = new List<string> { "--vigilog-worker", command };
            allArgs.Add("--state-file");
            allArgs.Add(workerStatePath);
            if (args != null) allArgs.AddRange(args);

            var startInfo = new ProcessStartInfo
            {
                FileName = workerPath,
                Arguments = string.Join(" ", allArgs.ConvertAll(EscapeWorkerArgument)),
                WorkingDirectory = Path.GetDirectoryName(workerPath),
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };

            using (var process = new Process { StartInfo = startInfo })
            {
                try
                {
                    process.Start();
                }
                catch (Win32Exception ex)
                {
                    AgentLog.Error("Unable to start VigiLog worker.", ex);
                    return BuildVigilogFailurePayload("Le composant VigiLog a ete bloque par la securite Windows");
                }
                catch (Exception ex)
                {
                    AgentLog.Error("Unable to start VigiLog worker.", ex);
                    return BuildVigilogFailurePayload("Impossible de lancer le composant VigiLog");
                }

                var stdoutTask = process.StandardOutput.ReadToEndAsync();
                var stderrTask = process.StandardError.ReadToEndAsync();
                var exited = await Task.Run(() => process.WaitForExit(timeoutMs));

                if (!exited)
                {
                    try { process.Kill(); } catch { }
                    string lastStep = null;
                    try
                    {
                        if (File.Exists(workerStatePath))
                        {
                            lastStep = File.ReadAllText(workerStatePath)?.Trim();
                        }
                    }
                    catch
                    {
                        // ignore
                    }

                    return BuildVigilogFailurePayload(string.IsNullOrWhiteSpace(lastStep)
                        ? "Timeout d acces au logger"
                        : $"Timeout d acces au logger (etape: {lastStep})");
                }

                var stdout = (await stdoutTask) ?? string.Empty;
                var stderr = (await stderrTask) ?? string.Empty;
                var trimmedStdout = stdout.Trim().TrimStart('\uFEFF');

                if (!string.IsNullOrWhiteSpace(trimmedStdout))
                {
                    try
                    {
                        return JObject.Parse(trimmedStdout);
                    }
                    catch (Exception ex)
                    {
                        AgentLog.Error("Unable to parse VigiLog worker output.", ex);
                    }
                }

                var details = !string.IsNullOrWhiteSpace(stderr)
                    ? stderr.Trim()
                    : $"Worker VigiLog termine anormalement (code {process.ExitCode})";

                return BuildVigilogFailurePayload(details);
            }
        }

        private static async Task<(bool TimedOut, JObject Payload)> ExecuteVigilogOperation(Func<Action<string>, JObject> operation, int timeoutMs, string operationName)
        {
            string currentStep = "initialisation";
            try
            {
                var task = Task.Run(() => operation(step => currentStep = step ?? currentStep));
                var completedTask = await Task.WhenAny(task, Task.Delay(timeoutMs));
                if (completedTask != task)
                {
                    AgentLog.Error($"VigiLog operation timed out: {operationName}", new TimeoutException(operationName));
                    return (true, BuildVigilogFailurePayload($"Timeout d acces au logger (etape: {currentStep})"));
                }

                return (false, task.Result ?? BuildVigilogFailurePayload("Reponse logger invalide"));
            }
            catch (Exception ex)
            {
                AgentLog.Error($"VigiLog operation failed: {operationName}", ex);
                var message = ex.Message;
                if (ex.InnerException != null && !string.IsNullOrWhiteSpace(ex.InnerException.Message))
                {
                    message = $"{message} | {ex.InnerException.Message}";
                }

                return (false, new JObject
                {
                    ["res"] = false,
                    ["details"] = string.IsNullOrWhiteSpace(message)
                        ? "Erreur lors de l acces au logger"
                        : $"Erreur lors de l acces au logger: {message}"
                });
            }
        }

        private static JObject ProbeVigilogLoggerInternal(Action<string> setStep)
        {
            LOGTAG_HANDLE probeHandle;
            LOGTAG_INFO[] probeInfo;
            LOGTAG_SENSOR[] probeSensor;
            string openError;
            if (!TryOpenSingleLogTag(out probeHandle, out probeInfo, out probeSensor, out openError, setStep))
            {
                return BuildVigilogFailurePayload(openError ?? "Impossible d acceder au logger");
            }

            try
            {
                int frequencyMinutes = (int)Math.Max(1, probeInfo[0].dwLogInterval / 60000);
                int alertReadings = Math.Max(
                    Math.Max(probeInfo[0].baAlertDelay[0], probeInfo[0].baAlertDelay[1]),
                    probeSensor[0].wConsecutiveAlertDelay + 1
                );
                int alarmDelayMinutes = Math.Max(1, alertReadings * frequencyMinutes);

                return new JObject
                {
                    ["res"] = true,
                    ["details"] = "Logger detecte",
                    ["loggerSerial"] = ExtractLogTagSerial(probeInfo[0]),
                    ["frequencyMinutes"] = frequencyMinutes,
                    ["alarmDelayMinutes"] = alarmDelayMinutes,
                    ["lowLimitActive"] = probeInfo[0].baAlertControlByte[0] == 128,
                    ["lowLimit"] = probeSensor[0].dLowerAlert,
                    ["highLimitActive"] = probeInfo[0].baAlertControlByte[1] == 129,
                    ["highLimit"] = probeSensor[0].dUpperAlert
                };
            }
            finally
            {
                if (probeHandle != 0) LogTag.Close(probeHandle);
            }
        }

        private static JObject ConfigureVigilogLoggerInternal(Action<string> setStep, bool lowLimitActive, bool highLimitActive, double? lowLimit, double? highLimit, int frequencyMinutes, int alarmDelayMinutes)
        {
            if (frequencyMinutes <= 0) frequencyMinutes = 1;
            if (alarmDelayMinutes <= 0) alarmDelayMinutes = 1;

            LOGTAG_HANDLE vigilogHandle;
            LOGTAG_INFO[] vigilogInfo;
            LOGTAG_SENSOR[] vigilogSensor;
            string openError;
            if (!TryOpenSingleLogTag(out vigilogHandle, out vigilogInfo, out vigilogSensor, out openError, setStep))
            {
                return BuildVigilogFailurePayload(openError ?? "Impossible d acceder au logger");
            }

            try
            {
                string loggerSerial = ExtractLogTagSerial(vigilogInfo[0]);
                int alertDelayReadings = Math.Max(1, (int)Math.Ceiling((double)alarmDelayMinutes / Math.Max(frequencyMinutes, 1)));
                ushort consecutiveAlertDelay = (ushort)Math.Max(0, alertDelayReadings - 1);
                byte alertDelayByte = (byte)Math.Min(255, alertDelayReadings);

                vigilogSensor[0].cbSize = 0;
                vigilogInfo[0].wSensorCount = 1;

                for (int i = 0; i < vigilogInfo[0].wSensorCount; i++)
                {
                    vigilogSensor[i].wConsecutiveAlertDelay = consecutiveAlertDelay;
                    if (lowLimitActive && lowLimit.HasValue) vigilogSensor[i].dLowerAlert = lowLimit.Value;
                    if (highLimitActive && highLimit.HasValue) vigilogSensor[i].dUpperAlert = highLimit.Value;
                }

                vigilogInfo[0].dwLogInterval = (uint)(frequencyMinutes * 60 * 1000);
                vigilogInfo[0].nFlags = 9251;
                vigilogInfo[0].wStartMethod = 1;

                vigilogInfo[0].baAlertControlByte[0] = lowLimitActive ? (byte)128 : (byte)0;
                vigilogInfo[0].baAlertControlByte[1] = highLimitActive ? (byte)129 : (byte)0;
                vigilogInfo[0].baAlertDelay[0] = alertDelayByte;
                vigilogInfo[0].baAlertDelay[1] = alertDelayByte;

                if (lowLimitActive && lowLimit.HasValue) vigilogInfo[0].fAlertThreshVal[0] = (float)lowLimit.Value;
                if (highLimitActive && highLimit.HasValue) vigilogInfo[0].fAlertThreshVal[1] = (float)highLimit.Value;

                setStep?.Invoke("SetInfo2");
                if (LogTag.SetInfo2(vigilogHandle, vigilogInfo, vigilogSensor) != 0)
                {
                    return BuildVigilogFailurePayload("Parametrage du logger impossible");
                }

                return new JObject
                {
                    ["res"] = true,
                    ["details"] = "Parametrage correctement applique",
                    ["loggerSerial"] = string.IsNullOrWhiteSpace(loggerSerial) ? null : loggerSerial,
                    ["frequencyMinutes"] = frequencyMinutes,
                    ["alarmDelayMinutes"] = alarmDelayMinutes,
                    ["lowLimitActive"] = lowLimitActive,
                    ["lowLimit"] = lowLimit.HasValue ? (JToken)lowLimit.Value : JValue.CreateNull(),
                    ["highLimitActive"] = highLimitActive,
                    ["highLimit"] = highLimit.HasValue ? (JToken)highLimit.Value : JValue.CreateNull()
                };
            }
            finally
            {
                if (vigilogHandle != 0) LogTag.Close(vigilogHandle);
            }
        }

        private static JObject ReadVigilogLoggerInternal(Action<string> setStep)
        {
            LOGTAG_HANDLE readHandle;
            LOGTAG_INFO[] readInfo;
            LOGTAG_SENSOR[] readSensor;
            string openError;
            if (!TryOpenSingleLogTag(out readHandle, out readInfo, out readSensor, out openError, setStep))
            {
                return BuildVigilogFailurePayload(openError ?? "Impossible d acceder au logger");
            }

            try
            {
                readSensor[0].cbSize = (uint)Marshal.SizeOf(readSensor[0]);
                readInfo[0].wSensorCount = readInfo[0].wNumOfSensors > 0 ? readInfo[0].wNumOfSensors : (ushort)1;
                readInfo[0].dwReadingsCount = readInfo[0].dwNumOfReadings;

                LOGTAG_READING[] ltreading = new LOGTAG_READING[readInfo[0].dwNumOfReadings];
                setStep?.Invoke("GetData2");
                if (LogTag.GetData2(readHandle, readInfo, readSensor, ltreading) != 0)
                {
                    return BuildVigilogFailurePayload("Lecture des mesures impossible");
                }

                var measures = new JArray();
                for (int i = 0; i < ltreading.Length; i++)
                {
                    DateTime dtMesure = new DateTime(
                        ltreading[i].stTaken.wYear,
                        ltreading[i].stTaken.wMonth,
                        ltreading[i].stTaken.wDay,
                        ltreading[i].stTaken.wHour,
                        ltreading[i].stTaken.wMinute,
                        ltreading[i].stTaken.wSecond,
                        DateTimeKind.Local
                    );

                    string measureDetails = ExtractLogTagComment(ltreading[i]);

                    measures.Add(new JObject
                    {
                        ["Numero_Ordre"] = i + 1,
                        ["Date_Heure_Mesure"] = dtMesure.ToString("o"),
                        ["Valeur"] = ltreading[i].dReading[0],
                        ["Est_Marqueur"] = false,
                        ["Details"] = string.IsNullOrWhiteSpace(measureDetails) ? null : measureDetails
                    });
                }

                return new JObject
                {
                    ["res"] = true,
                    ["details"] = "Mesures recuperees",
                    ["loggerSerial"] = ExtractLogTagSerial(readInfo[0]),
                    ["measurementCount"] = measures.Count,
                    ["measures"] = measures
                };
            }
            finally
            {
                if (readHandle != 0) LogTag.Close(readHandle);
            }
        }


        public static string GetLocalIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    return ip.ToString();
                }
            }
            throw new Exception("No network adapters with an IPv4 address in the system!");
        }

        // Méthode helper pour afficher l'alerte via un `Invoke`

        private static async Task HandleRequestAsync(HttpListenerContext ctx, Form_Alert frm_alert)
        {
            HttpListenerRequest req = ctx.Request;
            HttpListenerResponse resp = ctx.Response;

            try
            {
                EnsureCorsHeaders(resp, req);

                if (req.HttpMethod == "OPTIONS")
                {
                    resp.StatusCode = 204;
                    resp.Close();
                    return;
                }
                if (req.HttpMethod == "GET" && req.Url.AbsolutePath == "/info")
                {
                    if (!IsLoopback(req))
                    {
                        resp.StatusCode = 403;
                        resp.Close();
                        return;
                    }

                    var payload =
                        "{\"machineName\":\"" + JsonEscape(Environment.MachineName) + "\"," +
                        "\"ip\":\"" + JsonEscape(GetLocalIPAddress()) + "\"}";
                    var infoData = Encoding.UTF8.GetBytes(payload.ToCharArray());
                    resp.ContentType = "application/json";
                    resp.ContentEncoding = Encoding.UTF8;
                    EnsureCorsHeaders(resp, req);
                    resp.ContentLength64 = infoData.LongLength;
                    await resp.OutputStream.WriteAsync(infoData, 0, infoData.Length);
                    resp.Close();
                    return;
                }

                    //réponse de la fonction renvoyées par le HttpListener
                    string res = "false";
                    string details = "erreur";
                    string json = "";
                    byte[] data = new byte[0];

                    string[] rawParams;
                    Dictionary<string, string> postParams = new Dictionary<string, string>();

                    // If `shutdown` url requested w/ POST, then shutdown the server after serving the page
                    if (req.HttpMethod == "POST")
                    {
                        switch (req.Url.AbsolutePath)
                        {
                            case "/shutdown":
                                try { listener.Stop(); } catch { }
                                break;
                            case "/notify":
                                {
                                    if (!IsNotifyAuthorized(req))
                                    {
                                        resp.StatusCode = 401;
                                        resp.Close();
                                        break;
                                    }

                                    string payload;
                                    using (var reader = new StreamReader(req.InputStream, req.ContentEncoding))
                                    {
                                        payload = await reader.ReadToEndAsync();
                                    }

                                    JObject jPayload;
                                    try { jPayload = JObject.Parse(payload); }
                                    catch { jPayload = new JObject(); }

                                    var title        = jPayload.Value<string>("title") ?? "Alarme Vigitemp";
                                    var message      = jPayload.Value<string>("message");
                                    var location     = jPayload.Value<string>("location");
                                    var date         = jPayload.Value<string>("date");
                                    var url          = jPayload.Value<string>("url");
                                    var deliveryId   = jPayload.Value<int?>("deliveryId");
                                    var correlationId= jPayload.Value<string>("correlationId");
                                    var alarmId      = jPayload.Value<int?>("alarmId");
                                    var lieuId       = jPayload.Value<int?>("lieuId");
                                    var alarmType    = jPayload.Value<string>("alarmType");
                                    var triggeredAt  = jPayload.Value<string>("triggeredAt");
                                    var lastValue    = jPayload.Value<string>("lastValue");
                                    var lastMeasureAt= jPayload.Value<string>("lastMeasureAt");

                                    var combined = message;
                                    if (!string.IsNullOrWhiteSpace(location) || !string.IsNullOrWhiteSpace(date))
                                    {
                                        var detailsText = string.Join(" | ", new[] { location, date });
                                        combined = string.IsNullOrWhiteSpace(message)
                                            ? detailsText
                                            : (message + Environment.NewLine + detailsText);
                                    }

                                    try
                                    {
                                        if (SessionStore.HasValidSession())
                                        {
                                            SafeInvokeFormAlert(frm_alert, () =>
                                            {
                                                frm_alert.SetAlarmBannerDetails(new Form_Alert.AlarmBannerDetails
                                                {
                                                    Location = location,
                                                    TriggeredAt = triggeredAt,
                                                    AlarmType = alarmType,
                                                    LastValue = lastValue,
                                                    LastMeasureAt = lastMeasureAt,
                                                });
                                                frm_alert.DisplayAlarm();
                                            });
                                        }
                                    }
                                    catch (Exception ex)
                                    {
                                        AgentLog.Error("DisplayAlarm failed.", ex);
                                    }

                                    try
                                    {
                                        MyCustomApplicationContext.Instance?.ShowAlarmNotification(
                                            title,
                                            combined,
                                            url ?? (MyCustomApplicationContext.Instance?.SITEWEB_URL ?? ""),
                                            new NotificationTracking
                                            {
                                                DeliveryId = deliveryId,
                                                CorrelationId = correlationId,
                                                AlarmId = alarmId,
                                                LieuId = lieuId,
                                            }
                                        );
                                    }
                                    catch (Exception ex)
                                    {
                                        AgentLog.Error("ShowAlarmNotification failed.", ex);
                                    }

                                    resp.StatusCode = 204;
                                    resp.Close();
                                    break;
                                }
                            case "/agent-secret":
                                {
                                    if (!IsLoopback(req))
                                    {
                                        resp.StatusCode = 403;
                                        resp.Close();
                                        break;
                                    }

                                    string payload;
                                    using (var reader = new StreamReader(req.InputStream, req.ContentEncoding))
                                    {
                                        payload = await reader.ReadToEndAsync();
                                    }

                                    JObject jSecret;
                                    try { jSecret = JObject.Parse(payload); } catch { jSecret = new JObject(); }
                                    var secret = jSecret.Value<string>("secret");
                                    if (!string.IsNullOrWhiteSpace(secret))
                                    {
                                        try
                                        {
                                            AgentSecretStore.Save(secret);
                                            MyCustomApplicationContext.Instance?.SetAgentSecret(secret);
                                        }
                                        catch (Exception ex)
                                        {
                                            AgentLog.Error("AgentSecretStore.Save failed.", ex);
                                        }
                                    }

                                    resp.StatusCode = 204;
                                    resp.Close();
                                    break;
                                }
                            case "/alarm":
                            {
                                if (!IsLoopback(req))
                                {
                                    resp.StatusCode = 403;
                                    resp.Close();
                                    break;
                                }

                                var queryParts = req.RawUrl.Split('?');
                                if (queryParts.Length > 1)
                                {
                                    rawParams = queryParts[1].Split('&');
                                    foreach (string param in rawParams)
                                    {
                                        string[] kvPair = param.Split('=');
                                        if (kvPair.Length < 2 || string.IsNullOrEmpty(kvPair[0])) continue;
                                        postParams[kvPair[0]] = HttpUtility.UrlDecode(kvPair[1]);
                                    }
                                }

                                string action;
                                postParams.TryGetValue("action", out action);
                                string idLieuStr;
                                int idLieuVal = 0;
                                if (postParams.TryGetValue("idLieu", out idLieuStr))
                                    int.TryParse(idLieuStr, out idLieuVal);

                                if (action == "show" && idLieuVal > 0)
                                {
                                    lock (_alarmLock) { _alarmLieuxActive.Add(idLieuVal); }
                                    if (SessionStore.HasValidSession())
                                        SafeInvokeFormAlert(frm_alert, () => frm_alert.DisplayAlarm());
                                    else
                                        SafeInvokeFormAlert(frm_alert, () => frm_alert.HideAlarm());
                                }
                                if (action == "hide" && idLieuVal > 0)
                                {
                                    int alarmCount;
                                    lock (_alarmLock)
                                    {
                                        _alarmLieuxActive.Remove(idLieuVal);
                                        alarmCount = _alarmLieuxActive.Count;
                                    }
                                    if (alarmCount == 0)
                                        SafeInvokeFormAlert(frm_alert, () => frm_alert.HideAlarm());
                                }
                            }
                                resp.ContentType = "application/json";
                                resp.ContentEncoding = Encoding.UTF8;
                                EnsureCorsHeaders(resp, req);
                                resp.ContentLength64 = data.LongLength;

                                // Write out to the response stream (asynchronously), then close it
                                await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                resp.Close();

                                //break;

                                break;
                            case "/session":
                                if (!IsLoopback(req))
                                {
                                    resp.StatusCode = 403;
                                    resp.Close();
                                    break;
                                }

                                string body;
                                using (var reader = new StreamReader(req.InputStream, req.ContentEncoding))
                                {
                                    body = await reader.ReadToEndAsync();
                                }

                                var session = new SessionInfo();
                                if (!string.IsNullOrWhiteSpace(body))
                                {
                                    JObject jSession;
                                    try { jSession = JObject.Parse(body); } catch { jSession = new JObject(); }
                                    var expiresAtRaw = jSession.Value<string>("expiresAtUtc") ?? jSession.Value<string>("expiresAt");
                                    DateTime? expiresAt = null;
                                    if (!string.IsNullOrWhiteSpace(expiresAtRaw))
                                    {
                                        DateTime dt;
                                        if (DateTime.TryParse(expiresAtRaw, out dt))
                                            expiresAt = DateTime.SpecifyKind(dt, DateTimeKind.Utc);
                                    }
                                    session = new SessionInfo
                                    {
                                        Token = jSession.Value<string>("token"),
                                        UserId = jSession.Value<string>("userId"),
                                        Username = jSession.Value<string>("username"),
                                        ExpiresAtUtc = expiresAt,
                                    };
                                }

                                SessionStore.Save(session);

                                int pendingAlarms;
                                lock (_alarmLock) { pendingAlarms = _alarmLieuxActive.Count; }
                                if (pendingAlarms > 0 && SessionStore.HasValidSession())
                                {
                                    SafeInvokeFormAlert(frm_alert, () => frm_alert.DisplayAlarm());
                                }

                                resp.ContentType = "application/json";
                                resp.ContentEncoding = Encoding.UTF8;
                                EnsureCorsHeaders(resp, req);
                                resp.ContentLength64 = 0;
                                await resp.OutputStream.WriteAsync(new byte[0], 0, 0);
                                resp.Close();
                                break;

                            case "/vigilog/configure":
                                {
                                    if (!IsLoopback(req))
                                    {
                                        resp.StatusCode = 403;
                                        resp.Close();
                                        break;
                                    }

                                    string payload;
                                    using (var reader = new StreamReader(req.InputStream, req.ContentEncoding))
                                    {
                                        payload = await reader.ReadToEndAsync();
                                    }

                                    JObject jPayload;
                                    try { jPayload = JObject.Parse(payload); } catch { jPayload = new JObject(); }

                                    bool lowLimitActive = jPayload.Value<bool?>("lowLimitActive") ?? false;
                                    bool highLimitActive = jPayload.Value<bool?>("highLimitActive") ?? false;
                                    double? lowLimit = jPayload.Value<double?>("lowLimit");
                                    double? highLimit = jPayload.Value<double?>("highLimit");
                                    int frequencyMinutes = jPayload.Value<int?>("frequencyMinutes") ?? 1;
                                    int alarmDelayMinutes = jPayload.Value<int?>("alarmDelayMinutes") ?? 1;
                                    bool startAutomatically = jPayload.Value<bool?>("startAutomatically") ?? false;
                                    var configurePayload = await InvokeVigilogWorkerAsync(
                                        "configure",
                                        30000,
                                        lowLimitActive ? "1" : "0",
                                        lowLimit.HasValue ? lowLimit.Value.ToString(CultureInfo.InvariantCulture) : "null",
                                        highLimitActive ? "1" : "0",
                                        highLimit.HasValue ? highLimit.Value.ToString(CultureInfo.InvariantCulture) : "null",
                                        frequencyMinutes.ToString(CultureInfo.InvariantCulture),
                                        alarmDelayMinutes.ToString(CultureInfo.InvariantCulture),
                                        startAutomatically ? "1" : "0"
                                    );
                                    await WriteJsonResponse(resp, configurePayload.Value<bool?>("res") == true ? 200 : 503, configurePayload, req);
                                    break;
                                }

                            case "/vigilog/clear":
                                {
                                    if (!IsLoopback(req))
                                    {
                                        resp.StatusCode = 403;
                                        resp.Close();
                                        break;
                                    }

                                    var clearPayload = await InvokeVigilogWorkerAsync("clear", 35000);
                                    await WriteJsonResponse(resp, clearPayload.Value<bool?>("res") == true ? 200 : 503, clearPayload, req);
                                    break;
                                }

                            case "/uploadLogTagConfiguration":
                                if (req.RawUrl.Split('?').Length <= 1)
                                {
                                    res = "false";
                                    details = "Echec d'envoi des paramatres -> aucun parametre";
                                    json = "{\"res\":" + res + ", \"details\":\"" + JsonEscape(details) + "\"}";
                                    data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                    resp.ContentType = "application/json";
                                    resp.ContentEncoding = Encoding.UTF8;
                                    EnsureCorsHeaders(resp, req);
                                    resp.ContentLength64 = data.LongLength;
                                    await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                    resp.Close();
                                    break;
                                }

                                rawParams = req.RawUrl.Split('?')[1].Split('&');
                                foreach (string param in rawParams)
                                {
                                    string[] kvPair = param.Split('=');
                                    if (kvPair.Length < 2 || string.IsNullOrEmpty(kvPair[0])) continue;
                                    string key = kvPair[0];
                                    string value = HttpUtility.UrlDecode(kvPair[1]);
                                    postParams[key] = value;
                                }

                                bool params_consigneHaute = Convert.ToBoolean(postParams["consigneHaute"]);
                                bool params_consigneBasse = Convert.ToBoolean(postParams["consigneBasse"]);
                                int params_valeurConsigneHaute = Convert.ToInt32(postParams["valeurConsigneHaute"]);
                                int params_valeurConsigneBasse = Convert.ToInt32(postParams["valeurConsigneBasse"]);

                                var legacyConfigurePayload = await InvokeVigilogWorkerAsync(
                                    "configure",
                                    30000,
                                    params_consigneBasse ? "1" : "0",
                                    params_consigneBasse ? params_valeurConsigneBasse.ToString(CultureInfo.InvariantCulture) : "null",
                                    params_consigneHaute ? "1" : "0",
                                    params_consigneHaute ? params_valeurConsigneHaute.ToString(CultureInfo.InvariantCulture) : "null",
                                    "1",
                                    "1",
                                    "0"
                                );

                                if (legacyConfigurePayload.Value<bool?>("res") == true)
                                {
                                    res = "true";
                                    details = "Parametrages correctement appliques";
                                }
                                else
                                {
                                    res = "false";
                                    details = legacyConfigurePayload.Value<string>("details") ?? "Parametrage echoue";
                                }

                                json = "{\"res\":" + res + ", \"details\":\"" + JsonEscape(details) + "\"}";
                                data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                resp.ContentType = "application/json";
                                resp.ContentEncoding = Encoding.UTF8;
                                EnsureCorsHeaders(resp, req);
                                resp.ContentLength64 = data.LongLength;
                                await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                resp.Close();

                                break;

                            default:
                                resp.StatusCode = 404;
                                resp.Close();
                                break;
                        }

                    }
                    else if (req.HttpMethod == "DELETE" && req.Url.AbsolutePath == "/session")
                    {
                        if (!IsLoopback(req))
                        {
                            resp.StatusCode = 403;
                            resp.Close();
                            return;
                        }

                        SessionStore.Clear();
                        SafeInvokeFormAlert(frm_alert, () => frm_alert.HideAlarm());

                        resp.StatusCode = 204;
                        resp.Close();
                        return;
                    }
                    else if (req.HttpMethod == "GET" && req.Url.AbsolutePath == "/session")
                    {
                        var s = SessionStore.Get();
                        var connected = SessionStore.HasValidSession();
                        var jsonSession = "{\"connected\":" + (connected ? "true" : "false") +
                                          ",\"username\":\"" + JsonEscape(s != null ? s.Username : "") + "\"" +
                                          ",\"userId\":\"" + JsonEscape(s != null ? s.UserId : "") + "\"" +
                                          ",\"expiresAtUtc\":\"" + (s != null && s.ExpiresAtUtc.HasValue ? s.ExpiresAtUtc.Value.ToString("o") : "") + "\"" +
                                          "}";

                        var bytes = Encoding.UTF8.GetBytes(jsonSession);
                        resp.ContentType = "application/json";
                        resp.ContentEncoding = Encoding.UTF8;
                        EnsureCorsHeaders(resp, req);
                        resp.ContentLength64 = bytes.LongLength;
                        await resp.OutputStream.WriteAsync(bytes, 0, bytes.Length);
                        resp.Close();
                        return;
                    }
                    if (req.HttpMethod == "GET")
                    {
                        switch (req.Url.AbsolutePath)
                        {
                            case "/DownloadLogTagData":
                                {
                                var legacyReadPayload = await InvokeVigilogWorkerAsync("read", 35000);
                                    if (legacyReadPayload.Value<bool?>("res") != true)
                                    {
                                        res = "false";
                                        details = legacyReadPayload.Value<string>("details") ?? "Lecture des mesures impossible";
                                        json = "{\"res\":" + res + ", \"details\":\"" + JsonEscape(details) + "\"}";
                                        data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                        resp.ContentType = "application/json";
                                        resp.ContentEncoding = Encoding.UTF8;
                                        EnsureCorsHeaders(resp, req);
                                        resp.ContentLength64 = data.LongLength;
                                        await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                        resp.Close();
                                        break;
                                    }

                                    string serialNumber = legacyReadPayload.Value<string>("loggerSerial") ?? string.Empty;
                                    string id_recuperationMesure = DateTime.Now.ToString("yyyyMMddHHmmss");
                                    var measuresArray = legacyReadPayload["measures"] as JArray ?? new JArray();

                                    Database database = new Database();
                                    database.InitConnexion();
                                    try
                                    {
                                        foreach (var token in measuresArray)
                                        {
                                            var measureObject = token as JObject;
                                            if (measureObject == null) continue;
                                            var valeur = measureObject.Value<double?>("Valeur");
                                            var rawDate = measureObject.Value<string>("Date_Heure_Mesure");
                                            DateTime dt_mesure;
                                            if (!valeur.HasValue || string.IsNullOrWhiteSpace(rawDate) || !DateTime.TryParse(rawDate, null, DateTimeStyles.RoundtripKind, out dt_mesure))
                                            {
                                                continue;
                                            }

                                            database.AddMesure(serialNumber, id_recuperationMesure, valeur.Value, dt_mesure);
                                        }
                                    }
                                    finally
                                    {
                                        database.CloseConnexion();
                                    }

                                    res = "true";
                                    details = "Valeur correctement recuperees";
                                    json = "{\"res\":" + res + ", \"details\":\"" + details + "\", \"id_recuperationMesure\":" + id_recuperationMesure + "}";
                                    data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                    resp.ContentType = "application/json";
                                    resp.ContentEncoding = Encoding.UTF8;
                                    EnsureCorsHeaders(resp, req);
                                    resp.ContentLength64 = data.LongLength;
                                    await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                    resp.Close();
                                    break;
                                }
                            case "/vigilog/probe":
                                {
                                    if (!IsLoopback(req))
                                    {
                                        resp.StatusCode = 403;
                                        resp.Close();
                                        break;
                                    }
                                    var probePayload = await InvokeVigilogWorkerAsync("probe", 15000);
                                    await WriteJsonResponse(resp, probePayload.Value<bool?>("res") == true ? 200 : 503, probePayload, req);
                                    break;
                                }
                            case "/vigilog/presence":
                                {
                                    if (!IsLoopback(req))
                                    {
                                        resp.StatusCode = 403;
                                        resp.Close();
                                        break;
                                    }
                                    var presencePayload = await InvokeVigilogWorkerAsync("presence", 5000);
                                    await WriteJsonResponse(resp, 200, presencePayload, req);
                                    break;
                                }
                            case "/vigilog/read":
                                {
                                    if (!IsLoopback(req))
                                    {
                                        resp.StatusCode = 403;
                                        resp.Close();
                                        break;
                                    }
                                    var readPayload = await InvokeVigilogWorkerAsync("read", 35000);
                                    await WriteJsonResponse(resp, readPayload.Value<bool?>("res") == true ? 200 : 503, readPayload, req);
                                    break;
                                }

                            case "/downloadLogTagConfiguration":
                                {
                                    AgentLog.Info("Legacy LogTag configuration download requested.");
                                    var legacyProbePayload = await InvokeVigilogWorkerAsync("probe", 15000);
                                    if (legacyProbePayload.Value<bool?>("res") == true)
                                    {
                                        var legacySuccessPayload = new JObject
                                        {
                                            ["res"] = true,
                                            ["details"] = "Valeur correctement recuperees",
                                            ["res_consigneBasseActive"] = legacyProbePayload.Value<bool?>("lowLimitActive") == true,
                                            ["res_consigneHauteActive"] = legacyProbePayload.Value<bool?>("highLimitActive") == true,
                                            ["res_consigneBasseValeur"] = legacyProbePayload["lowLimit"] ?? JValue.CreateNull(),
                                            ["res_consigneHauteValeur"] = legacyProbePayload["highLimit"] ?? JValue.CreateNull()
                                        };
                                        AgentLog.Info("Legacy LogTag configuration download: success via worker");
                                        await WriteJsonResponse(resp, 200, legacySuccessPayload, req);
                                        break;
                                    }

                                    AgentLog.Error("Legacy LogTag configuration download failed via worker.", null);
                                    await WriteJsonResponse(resp, 503, new JObject
                                    {
                                        ["res"] = false,
                                        ["details"] = legacyProbePayload.Value<string>("details") ?? "Erreur lors de la lecture de configuration LogTag"
                                    });
                                    break;
                                }

                            default:
                                resp.StatusCode = 404;
                                resp.Close();
                                break;
                        }
                    }

                }
                catch (Exception ex)
                {
                    AgentLog.Error("HttpServer request handler failed.", ex);
                    try
                    {
                        resp.StatusCode = 500;
                        resp.Close();
                    }
                    catch
                    {
                        // ignore
                    }
                }
        }

        public static async Task HandleIncomingConnections(Form_Alert frm_alert)
        {
            while (true)
            {
                HttpListenerContext ctx;
                try
                {
                    ctx = await listener.GetContextAsync();
                }
                catch (HttpListenerException)
                {
                    // Listener stopped (shutdown)
                    return;
                }
                catch (Exception ex)
                {
                    AgentLog.Error("HttpServer GetContextAsync failed.", ex);
                    return;
                }

                // Dispatch each request on the thread pool — don't block the accept loop
                _ = Task.Run(async () => await HandleRequestAsync(ctx, frm_alert));
            }
        }


        public static void Main(string[] args)
        {
            try
            {
                if (args != null && args.Length > 0 && string.Equals(args[0], "--vigilog-worker", StringComparison.OrdinalIgnoreCase))
                {
                    var workerArgs = new string[args.Length - 1];
                    Array.Copy(args, 1, workerArgs, 0, workerArgs.Length);
                    Environment.ExitCode = VigilogWorkerRunner.Run(workerArgs);
                    return;
                }

                Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
                Application.ThreadException += (_, e) =>
                {
                    AgentLog.Error("UI thread exception.", e.Exception);
                    try
                    {
                        MessageBox.Show(
                            "Vigitemp Agent a rencontré une erreur.\n\n" +
                            "Un log a été écrit dans %LOCALAPPDATA%\\VigitempAgent\\logs\\agent.log\n\n" +
                            e.Exception.Message,
                            "Vigitemp Agent",
                            MessageBoxButtons.OK,
                            MessageBoxIcon.Error
                        );
                    }
                    catch
                    {
                        // ignore
                    }
                };

                AppDomain.CurrentDomain.UnhandledException += (_, e) =>
                {
                    AgentLog.Error("Unhandled exception.", e.ExceptionObject as Exception);
                };

                TaskScheduler.UnobservedTaskException += (_, e) =>
                {
                    AgentLog.Error("Unobserved task exception.", e.Exception);
                    e.SetObserved();
                };

                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);
                Application.Run(new MyCustomApplicationContext(args));
            }
            catch (Exception ex)
            {
                AgentLog.Error("Fatal exception in Main.", ex);
                try
                {
                    MessageBox.Show(
                        "Vigitemp Agent a rencontré une erreur fatale.\n\n" +
                        "Un log a été écrit dans %LOCALAPPDATA%\\VigitempAgent\\logs\\agent.log\n\n" +
                        ex.Message,
                        "Vigitemp Agent",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                }
                catch
                {
                    // ignore
                }
            }


        }
    }
}


















