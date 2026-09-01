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
using System.Reflection;
using System.Threading.Tasks;
using System.Threading;
using System.Web;
using System.Windows.Forms;
using System.ComponentModel;
using Newtonsoft.Json.Linq;
using VigitempAgent;
using VigitempLogTagWorker;

namespace VigitempAgent
{
    class HttpServer
    {
        public static volatile HttpListener listener;
        private static int _resourceAssemblyResolverRegistered;
        private static Mutex _singleInstanceMutex;
        private const string SingleInstanceMutexName = @"Global\VigiSensys.VigitempAgent";

        public static string url_localhost = "http://127.0.0.1:8000/";

        public static string GetUrl()
        {
            try
            {
                return "http://" + GetLocalIPAddress() + ":8000/";
            }
            catch
            {
                return "http://127.0.0.1:8000/";
            }
        }

        private static readonly object _alarmLock = new object();
        internal static readonly object _listenerLock = new object();
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
                var env =
                    Environment.GetEnvironmentVariable("VIGISENSYS_AGENT_SECRET") ??
                    Environment.GetEnvironmentVariable("VIGITEMP_AGENT_SECRET");
                if (!string.IsNullOrWhiteSpace(env)) return env.Trim();
            }
            catch
            {
                // ignore
            }

            try
            {
                var cfg =
                    ConfigurationManager.AppSettings["VigiSensysAgentSecret"] ??
                    ConfigurationManager.AppSettings["VigitempAgentSecret"] ??
                    ConfigurationManager.AppSettings["VIGISENSYS_AGENT_SECRET"] ??
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

            var provided =
                req.Headers["x-vigisensys-agent-secret"] ??
                req.Headers["x-vigitemp-agent-secret"];
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
                System.Configuration.ConfigurationManager.AppSettings["VigiSensysSiteWebUrl"] ??
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

        public static string GetLocalIPAddress()
        {
            try
            {
                var host = Dns.GetHostEntry(Dns.GetHostName());
                foreach (var ip in host.AddressList)
                {
                    if (ip.AddressFamily == AddressFamily.InterNetwork)
                    {
                        return ip.ToString();
                    }
                }
            }
            catch (Exception ex)
            {
                AgentLog.Error("GetLocalIPAddress failed.", ex);
            }
            return "0.0.0.0";
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
                                resp.StatusCode = 204;
                                resp.Close();
                                try { lock (_listenerLock) { listener?.Stop(); } } catch { /* ignore */ }
                                return;
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

                                    var title        = jPayload.Value<string>("title") ?? "Alarme VigiSensys";
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

                                resp.StatusCode = 204;
                                resp.Close();
                                return;
                            }
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

                                string rawConsigneHaute, rawConsigneBasse, rawValeurHaute, rawValeurBasse;
                                if (!postParams.TryGetValue("consigneHaute", out rawConsigneHaute) ||
                                    !postParams.TryGetValue("consigneBasse", out rawConsigneBasse) ||
                                    !postParams.TryGetValue("valeurConsigneHaute", out rawValeurHaute) ||
                                    !postParams.TryGetValue("valeurConsigneBasse", out rawValeurBasse))
                                {
                                    res = "false";
                                    details = "Parametre(s) manquant(s) dans la requete uploadLogTagConfiguration";
                                    json = "{\"res\":" + res + ", \"details\":\"" + JsonEscape(details) + "\"}";
                                    data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                    resp.ContentType = "application/json";
                                    resp.ContentEncoding = Encoding.UTF8;
                                    EnsureCorsHeaders(resp, req);
                                    resp.StatusCode = 400;
                                    resp.ContentLength64 = data.LongLength;
                                    await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                    resp.Close();
                                    break;
                                }
                                bool params_consigneHaute = Convert.ToBoolean(rawConsigneHaute);
                                bool params_consigneBasse = Convert.ToBoolean(rawConsigneBasse);
                                int params_valeurConsigneHaute = Convert.ToInt32(rawValeurHaute);
                                int params_valeurConsigneBasse = Convert.ToInt32(rawValeurBasse);

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
                    else if (req.HttpMethod == "GET")
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
                                    try
                                    {
                                        database.InitConnexion();
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
                    else
                    {
                        // Fallback: unmatched method or path
                        resp.StatusCode = 405;
                        resp.Close();
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
                catch (ObjectDisposedException)
                {
                    // listener.Close() race during shutdown — clean exit
                    return;
                }
                catch (Exception ex)
                {
                    AgentLog.Error("HttpServer GetContextAsync failed.", ex);
                    continue;   // keep accepting — transient error
                }

                // Dispatch each request on the thread pool — don't block the accept loop
                _ = Task.Run(() => HandleRequestAsync(ctx, frm_alert));
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

                if (!TryAcquireSingleInstance())
                {
                    AgentLog.Info("Another VigitempAgent instance is already running. Exiting duplicate process.");
                    return;
                }

                EnsureResourceAssemblyResolver();

                Application.SetUnhandledExceptionMode(UnhandledExceptionMode.CatchException);
                Application.ThreadException += (_, e) =>
                {
                    AgentLog.Error("UI thread exception.", e.Exception);
                    try
                    {
                        MessageBox.Show(
                            "VigiSensys Agent a rencontré une erreur.\n\n" +
                            "Un log a été écrit dans %LOCALAPPDATA%\\VigitempAgent\\logs\\agent.log\n\n" +
                            e.Exception.Message,
                            "VigiSensys Agent",
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
                        "VigiSensys Agent a rencontré une erreur fatale.\n\n" +
                        "Un log a été écrit dans %LOCALAPPDATA%\\VigitempAgent\\logs\\agent.log\n\n" +
                        ex.Message,
                        "VigiSensys Agent",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                }
                catch
                {
                    // ignore
                }
            }
            finally
            {
                ReleaseSingleInstance();
            }
        }

        private static void EnsureResourceAssemblyResolver()
        {
            if (System.Threading.Interlocked.Exchange(ref _resourceAssemblyResolverRegistered, 1) == 1)
            {
                return;
            }

            AppDomain.CurrentDomain.AssemblyResolve += (_, e) =>
            {
                try
                {
                    var requested = new AssemblyName(e.Name);
                    if (!string.Equals(requested.Name, "System.Resources.Extensions", StringComparison.OrdinalIgnoreCase))
                    {
                        return null;
                    }

                    var assemblyPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "System.Resources.Extensions.dll");
                    if (!File.Exists(assemblyPath))
                    {
                        return null;
                    }

                    return Assembly.LoadFrom(assemblyPath);
                }
                catch
                {
                    return null;
                }
            };
        }

        private static bool TryAcquireSingleInstance()
        {
            try
            {
                bool createdNew;
                _singleInstanceMutex = new Mutex(true, SingleInstanceMutexName, out createdNew);
                if (!createdNew)
                {
                    _singleInstanceMutex.Dispose();
                    _singleInstanceMutex = null;
                }

                return createdNew;
            }
            catch (Exception ex)
            {
                AgentLog.Error("Unable to acquire single instance mutex.", ex);
                return true;
            }
        }

        private static void ReleaseSingleInstance()
        {
            try
            {
                if (_singleInstanceMutex == null)
                {
                    return;
                }

                _singleInstanceMutex.ReleaseMutex();
                _singleInstanceMutex.Dispose();
                _singleInstanceMutex = null;
            }
            catch
            {
                // ignore
            }
        }
    }
}
