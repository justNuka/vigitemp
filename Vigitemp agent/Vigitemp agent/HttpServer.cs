using System;
using System.Collections.Generic;
using System.Configuration;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Text;
using System.IO;
using System.Threading.Tasks;
using System.Web;
using System.Windows.Forms;
//using LogTagNET;
using LogTagNETV2;
using Newtonsoft.Json.Linq;
using VigitempAgent;

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

        public static int pageViews = 0;
        public static int requestCount = 0;
        public static string pageData =
            "<!DOCTYPE>" +
            "<html>" +
            "  <head>" +
            "    <title>HttpListener Example</title>" +
            "  </head>" +
            "  <body>" +
            "    <p>Page Views: {0}</p>" +
            "    <form method=\"post\" action=\"query?ouais=super\">" +
            "      <input type=\"submit\" value=\"Shutdown\" {1}>" +
            "    </form>" +
            "  </body>" +
            "</html>";
        public static string url = "http://" + GetLocalIPAddress() + ":8000/";
        public static string url_localhost = "http://127.0.0.1:8000/";


        public static List<int> idLieuxEnAlarmes = new List<int>();

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

        private static void EnsureCorsHeaders(HttpListenerResponse resp)
        {
            var allowedOrigin = System.Configuration.ConfigurationManager.AppSettings["VigitempSiteWebUrl"] ?? "http://127.0.0.1:3000";
            resp.Headers["Access-Control-Allow-Origin"] = allowedOrigin;
            resp.Headers["Access-Control-Allow-Methods"] = "GET, POST, DELETE, OPTIONS";
            resp.Headers["Access-Control-Allow-Headers"] = "Content-Type";
            resp.Headers["Access-Control-Max-Age"] = "600";
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

        public static async Task HandleIncomingConnections(Form_Alert frm_alert)
        {
            bool runServer = true;

            //try
            //{
            // While a user hasn't visited the `shutdown` url, keep on handling requests
            while (runServer)
            {
                // Will wait here until we hear from a connection
                HttpListenerContext ctx = await listener.GetContextAsync();

                // Peel out the requests and response objects
                HttpListenerRequest req = ctx.Request;
                HttpListenerResponse resp = ctx.Response;

                EnsureCorsHeaders(resp);

                if (req.HttpMethod == "OPTIONS")
                {
                    resp.StatusCode = 204;
                    resp.Close();
                    continue;
                }
                if (req.HttpMethod == "GET" && req.Url.AbsolutePath == "/info")
                {
                    if (!IsLoopback(req))
                    {
                        resp.StatusCode = 403;
                        resp.Close();
                        continue;
                    }

                    var payload =
                        "{\"machineName\":\"" + JsonEscape(Environment.MachineName) + "\"," +
                        "\"ip\":\"" + JsonEscape(GetLocalIPAddress()) + "\"}";
                    var infoData = Encoding.UTF8.GetBytes(payload.ToCharArray());
                    resp.ContentType = "application/json";
                    resp.ContentEncoding = Encoding.UTF8;
                    EnsureCorsHeaders(resp);
                    resp.ContentLength64 = infoData.LongLength;
                    await resp.OutputStream.WriteAsync(infoData, 0, infoData.Length);
                    resp.Close();
                    continue;
                }

                //réponse de la fonction renvoyées par le HttpListener
                string res = "false";
                string details = "erreur";
                string json = "";
                byte[] data = new byte[0];

                string[] rawParams;
                Dictionary<string, string> postParams = new Dictionary<string, string>();

                // Print out some info about the request
                Console.WriteLine("Request #: {0}", ++requestCount);
                Console.WriteLine(req.Url.ToString());
                Console.WriteLine(req.HttpMethod);
                Console.WriteLine(req.UserHostName);
                Console.WriteLine(req.UserAgent);
                Console.WriteLine();

                // If `shutdown` url requested w/ POST, then shutdown the server after serving the page
                if (req.HttpMethod == "POST")
                {
                    switch (req.Url.AbsolutePath)
                    {
                        case "/shutdown":
                            Console.WriteLine("Shutdown requested");
                            runServer = false;
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
                                        frm_alert.Invoke((Action)(() =>
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
                                        }));
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
                                if (!idLieuxEnAlarmes.Contains(idLieuVal))
                                    idLieuxEnAlarmes.Add(idLieuVal);
                                if (SessionStore.HasValidSession())
                                    frm_alert.Invoke((Action)(() => frm_alert.DisplayAlarm()));
                                else
                                    frm_alert.Invoke((Action)(() => frm_alert.HideAlarm()));
                            }
                            if (action == "hide" && idLieuVal > 0)
                            {
                                idLieuxEnAlarmes.Remove(idLieuVal);
                                Console.WriteLine("alamres en cours: " + idLieuxEnAlarmes.Count);
                                if (idLieuxEnAlarmes.Count == 0)
                                    frm_alert.Invoke((Action)(() => frm_alert.HideAlarm()));
                            }
                        }

                            //frm_alert.DisplayAlarm();
                            resp.ContentType = "application/json";
                            resp.ContentEncoding = Encoding.UTF8;
                            EnsureCorsHeaders(resp);
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

                            if (idLieuxEnAlarmes.Count > 0 && SessionStore.HasValidSession())
                            {
                                frm_alert.Invoke((Action)(() => frm_alert.DisplayAlarm()));
                            }

                            resp.ContentType = "application/json";
                            resp.ContentEncoding = Encoding.UTF8;
                            EnsureCorsHeaders(resp);
                            resp.ContentLength64 = 0;
                            await resp.OutputStream.WriteAsync(new byte[0], 0, 0);
                            resp.Close();
                            break;

                        case "/uploadLogTagConfiguration":
                            Console.WriteLine(req.RawUrl);
                            if (req.RawUrl.Split('?').Length <= 1)
                            {
                                Console.WriteLine("Erreur: fermeture logtag");
                                res = "false";
                                details = "Echec d'envoi des paramatres -> aucun parametre";
                                json = "{\"res\":" + res + ", \"details\":\"" + details + "\"}";
                                data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                resp.ContentType = "application/json";
                                resp.ContentEncoding = Encoding.UTF8;
                                EnsureCorsHeaders(resp);
                                resp.ContentLength64 = data.LongLength;

                                // Write out to the response stream (asynchronously), then close it
                                await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                resp.Close();

                                break;
                            }
                            rawParams = req.RawUrl.Split('?')[1].Split('&');
                            foreach (string param in rawParams)
                            {
                                string[] kvPair = param.Split('=');
                                string key = kvPair[0];
                                string value = HttpUtility.UrlDecode(kvPair[1]);
                                postParams.Add(key, value);
                            }

                            //Usage
                            //Paramètres utilisés pour cette fonction
                            //consigneHaute: 1 ou 0
                            bool params_consigneHaute = Convert.ToBoolean(postParams["consigneHaute"]);
                            //consigneBasse: 1 ou 0
                            bool params_consigneBasse = Convert.ToBoolean(postParams["consigneBasse"]);
                            //valeurConsigneHaute: entier
                            int params_valeurConsigneHaute = Convert.ToInt32(postParams["valeurConsigneHaute"]);
                            //valeurConsigneBasse: entier
                            int params_valeurConsigneBasse = Convert.ToInt32(postParams["valeurConsigneBasse"]);
                            
                            //var hWnd = WinRT.Interop.WindowNative.GetWindowHandle(this);
                            HINSTANCE hInstance = GetModuleHandle(null);
                            uint portCount = 0;

                            //connexion au module logTAG
                            LOGTAG_HANDLE hLogTag = LogTag.OpenAccess(hInstance);
                            if (hLogTag == 0)
                            {
                                Console.WriteLine("tentative de connexion");
                                if (LogTag.LogOnUser(null, null, null) != 0) Console.WriteLine("Erreur LogOnUser: fermeture logtag");
                                hLogTag = LogTag.OpenAccess(hInstance);
                                if (hLogTag == 0)
                                {
                                    Console.WriteLine("Erreur: fermeture logtag");
                                    LogTag.Close(hLogTag);
                                    res = "false";
                                    details = "Impossible d'accéder au logtag";
                                    json = "{\"res\":" + res + ", \"details\":\"" + details + "\"}";
                                    data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                    resp.ContentType = "application/json";
                                    resp.ContentEncoding = Encoding.UTF8;
                                    EnsureCorsHeaders(resp);
                                    resp.ContentLength64 = data.LongLength;

                                    // Write out to the response stream (asynchronously), then close it
                                    await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                    resp.Close();

                                    break;
                                }
                            }

                            //récupération du nombre de dock logtag connectés
                            if (LogTag.GetPortInfo(null, ref portCount, 4) != 0) Console.WriteLine("Erreur GetPortInfo 1: fermeture logtag");
                            if (portCount > 1)
                            {
                                Console.WriteLine("Erreur GetPortInfo: Logtag non détecté");
                                LogTag.Close(hLogTag);
                                res = "false";
                                details = "Plusieurs docker connectés";
                                json = "{\"res\":" + res + ", \"details\":\"" + details + "\"}";
                                data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                resp.ContentType = "application/json";
                                resp.ContentEncoding = Encoding.UTF8;
                                EnsureCorsHeaders(resp);
                                resp.ContentLength64 = data.LongLength;

                                // Write out to the response stream (asynchronously), then close it
                                await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                resp.Close();

                                break;
                            }
                            else if (portCount == 0)
                            {
                                Console.WriteLine("Erreur GetPortInfo: Logtag non détecté");
                                LogTag.Close(hLogTag);
                                res = "false";
                                details = "Aucun docker logtag connecté";
                                json = "{\"res\":" + res + ", \"details\":\"" + details + "\"}";
                                data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                resp.ContentType = "application/json";
                                resp.ContentEncoding = Encoding.UTF8;
                                EnsureCorsHeaders(resp);
                                resp.ContentLength64 = data.LongLength;

                                // Write out to the response stream (asynchronously), then close it
                                await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                resp.Close();

                                break;
                            }
                            //Console.WriteLine("Erreur: plusieurs interfaces vigilog connectées");
                            //if (portCount == 0) Console.WriteLine("Erreur: aucune interface vigilog connectée");

                            //recuperation des infos du dock logtag
                            LOGTAG_PORTINFO[] tabPortInfo = new LOGTAG_PORTINFO[portCount];
                            if (tabPortInfo == null) Console.WriteLine("Erreur: fermeture logtag");
                            if (LogTag.GetPortInfo(tabPortInfo, ref portCount, 4) != 0) Console.WriteLine("Erreur GetPortInfo 2: fermeture logtag");
                            tabPortInfo[0].cbSize = (uint)Marshal.SizeOf(tabPortInfo[0]);
                            tabPortInfo[0].wPortIndex = 1;

                            //connexion au dock via le port de communication
                            LOGTAG_INTERFACE[] ltInterface = new LOGTAG_INTERFACE[1];
                            ltInterface[0].cbSize = (uint)Marshal.SizeOf(ltInterface[0]);
                            if (LogTag.OpenIO(hLogTag, tabPortInfo) != 0) Console.WriteLine("Erreur OpenIO: fermeture logtag");

                            //recuperation les informations de l'interface
                            if (LogTag.GetInterface(hLogTag, ltInterface) != 0) Console.WriteLine("Erreur GetInterface: fermeture logtag");

                            //recupere les informations du logtag
                            LOGTAG_INFO[] ltinfo = new LOGTAG_INFO[1];
                            LOGTAG_INFO[] ltinfo_before = new LOGTAG_INFO[1];
                            ltinfo[0].cbSize = (uint)Marshal.SizeOf(ltinfo[0]);
                            LOGTAG_SENSOR[] ltsensor = new LOGTAG_SENSOR[1];
                            LOGTAG_SENSOR[] ltsensor_before = new LOGTAG_SENSOR[1];
                            if (LogTag.GetInfo2(hLogTag, ltinfo, ltsensor) != 0)
                            {
                                Console.WriteLine("Erreur GetInfo2: Logtag non détecté");
                                LogTag.Close(hLogTag);
                                res = "false";
                                details = "Pas de capteur logtag dans le dock";
                                json = "{\"res\":" + res + ", \"details\":\"" + details + "\"}";
                                data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                resp.ContentType = "application/json";
                                resp.ContentEncoding = Encoding.UTF8;
                                EnsureCorsHeaders(resp);
                                resp.ContentLength64 = data.LongLength;

                                // Write out to the response stream (asynchronously), then close it
                                await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                resp.Close();

                                break;
                            }
                            //ltsensor[0].cbSize = (uint)Marshal.SizeOf(ltsensor[0]);
                            ltsensor[0].cbSize = 0;
                            //ltinfo[0].wSensorCount = ltinfo[0].wNumOfSensors; 
                            ltinfo[0].wSensorCount = 1;


                            for (int i = 0; i < ltinfo[0].wSensorCount; i++)
                            {
                                //ltsensor[i].nFlags = 1;

                                ltsensor[i].wConsecutiveAlertDelay = 0;

                                // Active le voyant alerte après wConsecutiveAlertDelay mesures hors consignes
                                //if (bConsigneSupActive OU bConsigneInfActive) {
                                // Active les alertes de dépassement avec retard d'alarme
                                ltsensor[i].wConsecutiveAlertDelay = (1 / 1) - 1;

                                // Active le voyant rouge
                                //ltsensor[i].nFlags += 512;
                                //ltsensor[i].nFlags += 8;
                                ////  }

                                //// Active le voyant vert
                                //ltsensor[i].nFlags += 256;

                                // Consignes
                                if (params_consigneBasse)
                                {
                                    ltsensor[i].dLowerAlert = params_valeurConsigneBasse;
                                }

                                if (params_consigneHaute)
                                {
                                    ltsensor[i].dUpperAlert = params_valeurConsigneHaute;
                                }
                            }

                            ltinfo[0].dwLogInterval = 1 * 60 * 1000;

                            // Lecture en continu
                            //ltinfo[0].nFlags = 1;
                            ltinfo[0].nFlags = 9251;


                            // Démarrage des mesures par bouton
                            ltinfo[0].wStartMethod = 1;

                            if (params_consigneBasse)
                            {
                                ltinfo[0].baAlertControlByte[0] = 128;
                            }
                            else {
                                ltinfo[0].baAlertControlByte[0] = 0;
                            }

                            if (params_consigneHaute)
                            {
                                ltinfo[0].baAlertControlByte[1] = 129;
                            }
                            else
                            {
                                ltinfo[0].baAlertControlByte[1] = 0;
                            }

                            ltinfo[0].baAlertDelay[0] = 1;
                            ltinfo[0].baAlertDelay[1] = 1;

                            if (params_consigneBasse)
                            {
                                ltinfo[0].fAlertThreshVal[0] = Convert.ToSByte(params_valeurConsigneBasse);
                                Console.WriteLine("ltinfo[0].fAlertThreshVal[0]: " + ltinfo[0].fAlertThreshVal[0]);
                            }

                            if (params_consigneHaute)
                            { 
                                ltinfo[0].fAlertThreshVal[1] = Convert.ToSByte(params_valeurConsigneHaute);
                                Console.WriteLine("ltinfo[0].fAlertThreshVal[1]: " + ltinfo[0].fAlertThreshVal[1]);
                            }

                            if (LogTag.SetInfo2(hLogTag, ltinfo, ltsensor) != 0)
                            {
                                Console.WriteLine("Erreur SetInfo2: Parametrage du logtag impossible");
                                LogTag.Close(hLogTag);
                                res = "false";
                                details = "Paramétrage échoué";
                                json = "{\"res\":" + res + ", \"details\":\"" + details + "\"}";
                                data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                resp.ContentType = "application/json";
                                resp.ContentEncoding = Encoding.UTF8;
                                EnsureCorsHeaders(resp);
                                resp.ContentLength64 = data.LongLength;

                                // Write out to the response stream (asynchronously), then close it
                                await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                resp.Close();

                                break;
                            }

                            LogTag.Close(hLogTag);
                            res = "true";
                            details = "Paramétrages correctement appliqués";
                            json = "{\"res\":" + res + ", \"details\":\"" + details + "\"}";
                            data = Encoding.UTF8.GetBytes(json.ToCharArray());
                            resp.ContentType = "application/json";
                            resp.ContentEncoding = Encoding.UTF8;
                            EnsureCorsHeaders(resp);
                            resp.ContentLength64 = data.LongLength;

                            // Write out to the response stream (asynchronously), then close it
                            await resp.OutputStream.WriteAsync(data, 0, data.Length);
                            resp.Close();

                            break;

                        default:
                            break;
                    }

                }
                else if (req.HttpMethod == "DELETE" && req.Url.AbsolutePath == "/session")
                {
                    if (!IsLoopback(req))
                    {
                        resp.StatusCode = 403;
                        resp.Close();
                        continue;
                    }

                    SessionStore.Clear();
                    frm_alert.Invoke((Action)(() => frm_alert.HideAlarm()));

                    resp.StatusCode = 204;
                    resp.Close();
                    continue;
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
                    EnsureCorsHeaders(resp);
                    resp.ContentLength64 = bytes.LongLength;
                    await resp.OutputStream.WriteAsync(bytes, 0, bytes.Length);
                    resp.Close();
                    continue;
                }
                if (req.HttpMethod == "GET")
                {
                    switch (req.Url.AbsolutePath)
                    {
                        case "/DownloadLogTagData":
                            {
                                //var hWnd = WinRT.Interop.WindowNative.GetWindowHandle(this);
                                HINSTANCE hInstance = GetModuleHandle(null);
                                uint portCount = 0;

                                //connexion au module logTAG
                                LOGTAG_HANDLE hLogTag = LogTag.OpenAccess(hInstance);
                                if (hLogTag == 0)
                                {
                                    Console.WriteLine("tentative de connexion");
                                    if (LogTag.LogOnUser(null, null, null) != 0) Console.WriteLine("Erreur LogOnUser: fermeture logtag");
                                    hLogTag = LogTag.OpenAccess(hInstance);
                                    if (hLogTag == 0)
                                    {
                                        Console.WriteLine("Erreur: fermeture logtag");
                                        LogTag.Close(hLogTag);
                                        res = "false";
                                        details = "Impossible d'accéder au logtag";
                                        json = "{\"res\":" + res + ", \"details\":\"" + details + "\"}";
                                        data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                        resp.ContentType = "application/json";
                                        resp.ContentEncoding = Encoding.UTF8;
                                        EnsureCorsHeaders(resp);
                                        resp.ContentLength64 = data.LongLength;

                                        // Write out to the response stream (asynchronously), then close it
                                        await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                        resp.Close();

                                        break;
                                    }
                                }

                                //recuperation du nombre de dock logtag connectés
                                //if (LogTag.GetPortInfo(null, ref portCount, 4) != 0) Console.WriteLine("Erreur GetPortInfo 1: fermeture logtag");
                                if (LogTag.GetPortInfo(null, ref portCount, 4) != 0) Console.WriteLine("Erreur GetPortInfo 1: fermeture logtag");
                                //Console.WriteLine("Erreur GetInfo2: Logtag non détecté");
                                //LogTag.Close(hLogTag);
                                //res = "false";
                                //details = "nombre de logtag";
                                //json = "{\"res\":" + res + ", \"details\":\"" + portCount + "\"}";
                                //data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                //resp.ContentType = "application/json";
                                //resp.ContentEncoding = Encoding.UTF8;
                                //EnsureCorsHeaders(resp);
                                //resp.ContentLength64 = data.LongLength;

                                //// Write out to the response stream (asynchronously), then close it
                                //await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                //resp.Close();
                                //
                                //break;

                                if (portCount > 1)
                                {
                                    Console.WriteLine("Erreur GetInfo2: Logtag non détecté");
                                    LogTag.Close(hLogTag);
                                    res = "false";
                                    details = "Plusieurs docker connectés";
                                    json = "{\"res\":" + res + ", \"details\":\"" + details + "\"}";
                                    data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                    resp.ContentType = "application/json";
                                    resp.ContentEncoding = Encoding.UTF8;
                                    EnsureCorsHeaders(resp);
                                    resp.ContentLength64 = data.LongLength;

                                    // Write out to the response stream (asynchronously), then close it
                                    await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                    resp.Close();

                                    break;
                                }
                                else if (portCount == 0)
                                {
                                    Console.WriteLine("Erreur GetInfo2: Logtag non détecté");
                                    LogTag.Close(hLogTag);
                                    res = "false";
                                    details = "Aucun docker logtag connecté";
                                    json = "{\"res\":" + res + ", \"details\":\"" + details + "\"}";
                                    data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                    resp.ContentType = "application/json";
                                    resp.ContentEncoding = Encoding.UTF8;
                                    EnsureCorsHeaders(resp);
                                    resp.ContentLength64 = data.LongLength;

                                    // Write out to the response stream (asynchronously), then close it
                                    await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                    resp.Close();

                                    break;
                                }
                                //Console.WriteLine("Erreur: plusieurs interfaces vigilog connectées");
                                //if (portCount == 0) Console.WriteLine("Erreur: aucune interface vigilog connectée");

                                //recuperation des infos du dock logtag
                                LOGTAG_PORTINFO[] tabPortInfo = new LOGTAG_PORTINFO[portCount];
                                if (tabPortInfo == null) Console.WriteLine("Erreur: fermeture logtag");
                                if (LogTag.GetPortInfo(tabPortInfo, ref portCount, 4) != 0) Console.WriteLine("Erreur GetPortInfo 2: fermeture logtag");
                                tabPortInfo[0].cbSize = (uint)Marshal.SizeOf(tabPortInfo[0]);
                                tabPortInfo[0].wPortIndex = 1;

                                //connexion au dock via le port de communication
                                LOGTAG_INTERFACE[] ltInterface = new LOGTAG_INTERFACE[1];
                                ltInterface[0].cbSize = (uint)Marshal.SizeOf(ltInterface[0]);
                                if (LogTag.OpenIO(hLogTag, tabPortInfo) != 0) Console.WriteLine("Erreur OpenIO: fermeture logtag");

                                //recuperation les informations de l'interface
                                if (LogTag.GetInterface(hLogTag, ltInterface) != 0) Console.WriteLine("Erreur GetInterface: fermeture logtag");

                                //recupere les informations du logtag
                                LOGTAG_INFO[] ltinfo = new LOGTAG_INFO[1];
                                ltinfo[0].cbSize = (uint)Marshal.SizeOf(ltinfo[0]);
                                LOGTAG_SENSOR[] ltsensor = new LOGTAG_SENSOR[1];
                                if (LogTag.GetInfo2(hLogTag, ltinfo, ltsensor) != 0)
                                {
                                    Console.WriteLine("Erreur GetInfo2: Logtag non détecté");
                                    LogTag.Close(hLogTag);
                                    res = "false";
                                    details = "Pas de capteur logtag dans le dock";
                                    json = "{\"res\":" + res + ", \"details\":\"" + details + "\"}";
                                    data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                    resp.ContentType = "application/json";
                                    resp.ContentEncoding = Encoding.UTF8;
                                    EnsureCorsHeaders(resp);
                                    resp.ContentLength64 = data.LongLength;

                                    // Write out to the response stream (asynchronously), then close it
                                    await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                    resp.Close();

                                    break;
                                }
                                ltsensor[0].cbSize = (uint)Marshal.SizeOf(ltsensor[0]);
                                ltinfo[0].wSensorCount = ltinfo[0].wNumOfSensors;

                                //recupere les données du logtag
                                LOGTAG_READING[] ltreading = new LOGTAG_READING[ltinfo[0].dwNumOfReadings];
                                ltinfo[0].dwReadingsCount = ltinfo[0].dwNumOfReadings;
                                if (LogTag.GetData2(hLogTag, ltinfo, ltsensor, ltreading) != 0) Console.WriteLine("Erreur: fermeture logtag");

                                // recuperation du numero de serie a partir de la réponse en code ASCII
                                string serialNumber = "";
                                for (int i = 0; i < ltinfo[0].szChannelInfo.Length; i += 2)
                                {
                                    if (ltinfo[0].szChannelInfo[i] == 0)
                                    {
                                        break;
                                    }
                                    serialNumber += (char)ltinfo[0].szChannelInfo[i];
                                }
                                //creation d'un identifiant liée à cette collecte de mesure contenant la date de reception
                                string id_recuperationMesure = DateTime.Now.ToString("yyyyMMddHHmmss");

                                //enregistrement dans la bdd
                                Database database = new Database();
                                // Ouverture de la connexion SQL
                                database.InitConnexion();
                                for (int i = 0; i < ltreading.Length; i++)
                                {
                                    //AddMesure(serialNumber, id_recuperationMesure, valeur_mesure, heure_mesure)
                                    DateTime dt_mesure = new DateTime(ltreading[i].stTaken.wYear, ltreading[i].stTaken.wMonth, ltreading[i].stTaken.wDay, ltreading[i].stTaken.wHour, ltreading[i].stTaken.wMinute, ltreading[i].stTaken.wSecond);

                                    database.AddMesure(serialNumber, id_recuperationMesure, ltreading[i].dReading[0], dt_mesure);
                                }

                                // Fermeture de la connexion
                                database.CloseConnexion();

                                //database.AddMesure(m_sondeSerialNumber, float.Parse(String.Format("{0:0.00}", tmp_temperature)), "°C");

                                LogTag.Close(hLogTag);
                                res = "true";
                                details = "Valeur correctement récupérées";
                                json = "{\"res\":" + res + ", \"details\":\"" + details + "\", \"id_recuperationMesure\":" + id_recuperationMesure + "}";
                                data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                resp.ContentType = "application/json";
                                resp.ContentEncoding = Encoding.UTF8;
                                EnsureCorsHeaders(resp);
                                resp.ContentLength64 = data.LongLength;

                                // Write out to the response stream (asynchronously), then close it
                                await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                resp.Close();


                                break;
                            }
                           

                        case "/downloadLogTagConfiguration":
                            {
                                //var hWnd = WinRT.Interop.WindowNative.GetWindowHandle(this);
                                HINSTANCE hInstance = GetModuleHandle(null);
                                uint portCount = 0;

                                //connexion au module logTAG
                                LOGTAG_HANDLE hLogTag = LogTag.OpenAccess(hInstance);
                                if (hLogTag == 0)
                                {
                                    Console.WriteLine("tentative de connexion");
                                    if (LogTag.LogOnUser(null, null, null) != 0) Console.WriteLine("Erreur LogOnUser: fermeture logtag");
                                    hLogTag = LogTag.OpenAccess(hInstance);
                                    if (hLogTag == 0)
                                    {
                                        Console.WriteLine("Erreur: fermeture logtag");
                                        LogTag.Close(hLogTag);
                                        res = "false";
                                        details = "Impossible d'accéder au logtag";
                                        json = "{\"res\":" + res + ", \"details\":\"" + details + "\"}";
                                        data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                        resp.ContentType = "application/json";
                                        resp.ContentEncoding = Encoding.UTF8;
                                        EnsureCorsHeaders(resp);
                                        resp.ContentLength64 = data.LongLength;

                                        // Write out to the response stream (asynchronously), then close it
                                        await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                        resp.Close();

                                        break;
                                    }
                                }

                                //recuperation du nombre de dock logtag connectés
                                if (LogTag.GetPortInfo(null, ref portCount,4) != 0) Console.WriteLine("Erreur GetPortInfo 1: fermeture logtag");
                                if(portCount == 0)
                                {
                                    if (LogTag.GetPortInfo(null, ref portCount, 8) != 0) Console.WriteLine("Erreur GetPortInfo 1: fermeture logtag");
                                }
                                //Console.WriteLine("Erreur GetInfo2: Logtag non détecté");
                                //LogTag.Close(hLogTag);
                                //res = "false";
                                //details = "nombre de logtag";
                                //json = "{\"res\":" + res + ", \"details5\":\"" + portCount + "\"}";
                                //data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                //resp.ContentType = "application/json";
                                //resp.ContentEncoding = Encoding.UTF8;
                                //EnsureCorsHeaders(resp);
                                //resp.ContentLength64 = data.LongLength;

                                //// Write out to the response stream (asynchronously), then close it
                                //await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                //resp.Close();

                                //break;

                                if (portCount > 1)
                                {
                                    Console.WriteLine("Erreur GetInfo2: Logtag non détecté");
                                    LogTag.Close(hLogTag);
                                    res = "false";
                                    details = "Plusieurs docker connectés";
                                    json = "{\"res\":" + res + ", \"details\":\"" + details + "\"}";
                                    data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                    resp.ContentType = "application/json";
                                    resp.ContentEncoding = Encoding.UTF8;
                                    EnsureCorsHeaders(resp);
                                    resp.ContentLength64 = data.LongLength;

                                    // Write out to the response stream (asynchronously), then close it
                                    await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                    resp.Close();

                                    break;
                                }
                                else if (portCount == 0)
                                {
                                    Console.WriteLine("Erreur GetInfo2: Logtag non détecté");
                                    LogTag.Close(hLogTag);
                                    res = "false";
                                    details = "Aucun docker logtag connecté";
                                    json = "{\"res\":" + res + ", \"details\":\"" + details + "\"}";
                                    data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                    resp.ContentType = "application/json";
                                    resp.ContentEncoding = Encoding.UTF8;
                                    EnsureCorsHeaders(resp);
                                    resp.ContentLength64 = data.LongLength;

                                    // Write out to the response stream (asynchronously), then close it
                                    await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                    resp.Close();

                                    break;
                                }
                                //Console.WriteLine("Erreur: plusieurs interfaces vigilog connectées");
                                //if (portCount == 0) Console.WriteLine("Erreur: aucune interface vigilog connectée");

                                //recuperation des infos du dock logtag
                                LOGTAG_PORTINFO[] tabPortInfo = new LOGTAG_PORTINFO[portCount];
                                if (tabPortInfo == null) Console.WriteLine("Erreur: fermeture logtag");
                                if (LogTag.GetPortInfo(tabPortInfo, ref portCount, 4) != 0) Console.WriteLine("Erreur GetPortInfo 2: fermeture logtag");
                                tabPortInfo[0].cbSize = (uint)Marshal.SizeOf(tabPortInfo[0]);
                                tabPortInfo[0].wPortIndex = 1;

                                //connexion au dock via le port de communication
                                LOGTAG_INTERFACE[] ltInterface = new LOGTAG_INTERFACE[1];
                                ltInterface[0].cbSize = (uint)Marshal.SizeOf(ltInterface[0]);
                                if (LogTag.OpenIO(hLogTag, tabPortInfo) != 0) Console.WriteLine("Erreur OpenIO: fermeture logtag");

                                //recuperation les informations de l'interface
                                if (LogTag.GetInterface(hLogTag, ltInterface) != 0) Console.WriteLine("Erreur GetInterface: fermeture logtag");

                                //recupere les informations du logtag
                                LOGTAG_INFO[] ltinfo = new LOGTAG_INFO[1];
                                ltinfo[0].cbSize = (uint)Marshal.SizeOf(ltinfo[0]);
                                LOGTAG_SENSOR[] ltsensor = new LOGTAG_SENSOR[1];
                                if (LogTag.GetInfo2(hLogTag, ltinfo, ltsensor) != 0)
                                {
                                    Console.WriteLine("Erreur GetInfo2: Logtag non détecté");
                                    LogTag.Close(hLogTag);
                                    res = "false";
                                    details = "Pas de capteur logtag dans le dock";
                                    json = "{\"res\":" + res + ", \"details\":\"" + details + "\"}";
                                    data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                    resp.ContentType = "application/json";
                                    resp.ContentEncoding = Encoding.UTF8;
                                    EnsureCorsHeaders(resp);
                                    resp.ContentLength64 = data.LongLength;

                                    // Write out to the response stream (asynchronously), then close it
                                    await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                    resp.Close();

                                    break;
                                }


                                string res_consigneHauteActive = (ltinfo[0].baAlertControlByte[0] == 129) ? "true" : "false";
                                string res_consigneBasseActive = (ltinfo[0].baAlertControlByte[1] == 128) ? "true" : "false";
                                float res_consigneHauteValeur = ltinfo[0].fAlertThreshVal[0];
                                float res_consigneBasseValeur = ltinfo[0].fAlertThreshVal[1];

                                LogTag.Close(hLogTag);
                                res = "true";
                                details = "Valeur correctement récupérées";
                                json =  "{\"res\":" + res + ", " +
                                        "\"details\":\"" + details + "\", " +
                                        "\"res_consigneBasseActive\":" + res_consigneBasseActive + ", " +
                                        "\"res_consigneHauteActive\":" + res_consigneHauteActive + ", " +
                                        "\"res_consigneBasseValeur\":" + res_consigneBasseValeur + ", " +
                                        "\"res_consigneHauteValeur\":" + res_consigneHauteValeur + "}";
                                data = Encoding.UTF8.GetBytes(json.ToCharArray());
                                resp.ContentType = "application/json";
                                resp.ContentEncoding = Encoding.UTF8;
                                EnsureCorsHeaders(resp);
                                resp.ContentLength64 = data.LongLength;

                                // Write out to the response stream (asynchronously), then close it
                                await resp.OutputStream.WriteAsync(data, 0, data.Length);
                                resp.Close();

                                break;
                            }
                            
                        default:
                            break;
                    }
                }

                // Make sure we don't increment the page views counter if `favicon.ico` is requested
                if (req.Url.AbsolutePath != "/favicon.ico")
                    pageViews += 1;
                resp.Close();
            }
            //}
            //catch (Exception)
            //{
            //    Console.WriteLine("Thread terminé");
            //}
        }


        public static void Main(string[] args)
        {
            //ApplicationConfiguration.Initialize();
            //Application.Run(new MyCustomApplicationContext(args));
            try
            {
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

















