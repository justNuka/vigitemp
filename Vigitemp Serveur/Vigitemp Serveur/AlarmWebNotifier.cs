using System;
using System.Collections.Generic;
using System.Configuration;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Vigitemp_Serveur
{
    internal static class AlarmWebNotifier
    {
        private static readonly HttpClient _http = new HttpClient { Timeout = TimeSpan.FromSeconds(10) };

        private static string BaseUrl => ConfigurationManager.AppSettings["Vigi.WebsiteBaseUrl"];
        private static string Secret => ConfigurationManager.AppSettings["Vigi.AlarmDispatchSecret"];

        public static void ValidateConfig()
        {
            var baseUrl = ConfigurationManager.AppSettings["Vigi.WebsiteBaseUrl"];
            var secret = ConfigurationManager.AppSettings["Vigi.AlarmDispatchSecret"];

            if (string.IsNullOrWhiteSpace(baseUrl))
            {
                VigitempServeur.Log("WARNING AlarmWebNotifier: Vigi.WebsiteBaseUrl non configuré dans App.config. Aucune notification d'alarme ne sera envoyée aux agents.");
            }
            else
            {
                VigitempServeur.Log($"AlarmWebNotifier: WebsiteBaseUrl={baseUrl}");
            }

            if (string.IsNullOrWhiteSpace(secret))
            {
                VigitempServeur.Log("WARNING AlarmWebNotifier: Vigi.AlarmDispatchSecret non configuré dans App.config. Les requêtes seront rejetées avec 401.");
            }
            else
            {
                VigitempServeur.Log("AlarmWebNotifier: AlarmDispatchSecret configuré.");
            }
        }

        public static async Task NotifyAlarmBatchAsync(IReadOnlyList<AlarmNotificationItem> alarms)
        {
            try
            {
                if (alarms == null || alarms.Count == 0)
                {
                    return;
                }

                if (string.IsNullOrWhiteSpace(BaseUrl) || string.IsNullOrWhiteSpace(Secret))
                {
                    VigitempServeur.Log("AlarmWebNotifier: configuration manquante (BaseUrl/Secret)");
                    return;
                }

                var url = Combine(BaseUrl, "/api/alarmes/dispatch");
                var tasks = new List<Task>();
                foreach (var alarm in alarms)
                {
                    if (alarm == null || alarm.IdAlarme <= 0) continue;

                    var capturedAlarm = alarm;
                    tasks.Add(Task.Run(async () =>
                    {
                        try
                        {
                            var payload =
                                "{" +
                                "\"alarmId\":" + capturedAlarm.IdAlarme + "," +
                                "\"eventType\":\"triggered\"" +
                                "}";

                            var req = new HttpRequestMessage(HttpMethod.Post, url);
                            req.Headers.Add("x-vigitemp-secret", Secret);
                            req.Content = new StringContent(payload, Encoding.UTF8, "application/json");

                            VigitempServeur.Log(
                                "AlarmWebNotifier: envoi notification web triggered " +
                                "alarmId=" + capturedAlarm.IdAlarme +
                                " idLieu=" + capturedAlarm.IdLieu +
                                " url=" + url);

                            var response = await _http.SendAsync(req);
                            var statusCode = (int)response.StatusCode;
                            if (statusCode < 200 || statusCode >= 300)
                                VigitempServeur.Log(
                                    "AlarmWebNotifier: WARNING reponse non-2xx triggered (status=" + statusCode + ") " +
                                    "idLieu=" + capturedAlarm.IdLieu +
                                    " alarmId=" + capturedAlarm.IdAlarme);
                            else
                                VigitempServeur.Log(
                                    "AlarmWebNotifier: notification triggered envoyee (status=" + statusCode + ") " +
                                    "idLieu=" + capturedAlarm.IdLieu +
                                    " alarmId=" + capturedAlarm.IdAlarme);
                        }
                        catch (Exception ex)
                        {
                            VigitempServeur.Log("AlarmWebNotifier: echec triggered alarm " + capturedAlarm.IdAlarme + ": " + ex.Message);
                        }
                    }));
                }

                await Task.WhenAll(tasks);
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("AlarmWebNotifier: echec envoi notification batch: " + ex.Message);
            }
        }

        public static async Task NotifyEndedAlarmBatchAsync(IReadOnlyList<AlarmNotificationItem> alarms)
        {
            try
            {
                if (alarms == null || alarms.Count == 0) return;

                if (string.IsNullOrWhiteSpace(BaseUrl) || string.IsNullOrWhiteSpace(Secret))
                {
                    VigitempServeur.Log("AlarmWebNotifier: configuration manquante (BaseUrl/Secret)");
                    return;
                }

                var url = Combine(BaseUrl, "/api/alarmes/dispatch");

                var tasks = new List<Task>();
                foreach (var alarm in alarms)
                {
                    if (alarm == null || alarm.IdAlarme <= 0) continue;

                    var capturedAlarm = alarm; // capture for closure
                    tasks.Add(Task.Run(async () =>
                    {
                        try
                        {
                            var payload =
                                "{" +
                                "\"alarmId\":" + capturedAlarm.IdAlarme + "," +
                                "\"eventType\":\"ended\"" +
                                "}";

                            var req = new HttpRequestMessage(HttpMethod.Post, url);
                            req.Headers.Add("x-vigitemp-secret", Secret);
                            req.Content = new StringContent(payload, Encoding.UTF8, "application/json");

                            var response = await _http.SendAsync(req);
                            var statusCode = (int)response.StatusCode;
                            if (statusCode < 200 || statusCode >= 300)
                                VigitempServeur.Log(
                                    "AlarmWebNotifier: WARNING reponse non-2xx ended (status=" + statusCode + ") " +
                                    "idLieu=" + capturedAlarm.IdLieu +
                                    " alarmId=" + capturedAlarm.IdAlarme);
                            else
                                VigitempServeur.Log(
                                    "AlarmWebNotifier: notification ended envoyee (status=" + statusCode + ") " +
                                    "idLieu=" + capturedAlarm.IdLieu +
                                    " alarmId=" + capturedAlarm.IdAlarme);
                        }
                        catch (Exception ex)
                        {
                            VigitempServeur.Log("AlarmWebNotifier: echec ended alarm " + capturedAlarm.IdAlarme + ": " + ex.Message);
                        }
                    }));
                }

                await Task.WhenAll(tasks);
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("AlarmWebNotifier: echec envoi notification ended batch: " + ex.Message);
            }
        }

        public static async Task NotifyRealtimeAlarmAsync(int? alarmId, int? idLieu, string eventType)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(BaseUrl) || string.IsNullOrWhiteSpace(Secret))
                {
                    VigitempServeur.Log("AlarmWebNotifier: configuration manquante (BaseUrl/Secret)");
                    return;
                }

                var url = Combine(BaseUrl, "/api/alarmes/dispatch-realtime");
                var normalizedEventType = string.Equals(eventType, "ended", StringComparison.OrdinalIgnoreCase)
                    ? "ended"
                    : "triggered";

                var payloadBuilder = new StringBuilder();
                payloadBuilder.Append("{");
                var hasField = false;

                if (alarmId.HasValue)
                {
                    payloadBuilder.Append("\"alarmId\":").Append(alarmId.Value);
                    hasField = true;
                }

                if (idLieu.HasValue)
                {
                    if (hasField) payloadBuilder.Append(",");
                    payloadBuilder.Append("\"idLieu\":").Append(idLieu.Value);
                    hasField = true;
                }

                if (hasField) payloadBuilder.Append(",");
                payloadBuilder.Append("\"eventType\":\"").Append(normalizedEventType).Append("\"");
                payloadBuilder.Append("}");

                var req = new HttpRequestMessage(HttpMethod.Post, url);
                req.Headers.Add("x-vigitemp-secret", Secret);
                req.Content = new StringContent(payloadBuilder.ToString(), Encoding.UTF8, "application/json");

                VigitempServeur.Log(
                    "AlarmWebNotifier: envoi realtime web " +
                    "eventType=" + normalizedEventType +
                    (idLieu.HasValue ? (" idLieu=" + idLieu.Value) : "") +
                    (alarmId.HasValue ? (" alarmId=" + alarmId.Value) : "") +
                    " url=" + url);

                var response = await _http.SendAsync(req);
                var statusCode = (int)response.StatusCode;
                if (statusCode < 200 || statusCode >= 300)
                    VigitempServeur.Log(
                        "AlarmWebNotifier: WARNING reponse non-2xx realtime (status=" + statusCode + ") " +
                        "eventType=" + normalizedEventType +
                        (idLieu.HasValue ? (" idLieu=" + idLieu.Value) : "") +
                        (alarmId.HasValue ? (" alarmId=" + alarmId.Value) : ""));
                else
                    VigitempServeur.Log(
                        "AlarmWebNotifier: realtime web envoye (status=" + statusCode + ") " +
                        "eventType=" + normalizedEventType +
                        (idLieu.HasValue ? (" idLieu=" + idLieu.Value) : "") +
                        (alarmId.HasValue ? (" alarmId=" + alarmId.Value) : ""));
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("AlarmWebNotifier: echec envoi realtime: " + ex.Message);
            }
        }

        public static async Task NotifyGspBatteryAsync(int idLieu, string sondeSerial, int batteryPercent, bool sendEmail)
        {
            try
            {
                if (idLieu <= 0)
                {
                    return;
                }

                if (string.IsNullOrWhiteSpace(BaseUrl) || string.IsNullOrWhiteSpace(Secret))
                {
                    VigitempServeur.Log("AlarmWebNotifier: configuration manquante (BaseUrl/Secret)");
                    return;
                }

                var url = Combine(BaseUrl, "/api/alarmes/dispatch");
                var title = sendEmail ? "Batterie critique sonde GSP" : "Batterie faible sonde GSP";
                var body =
                    "Sonde " + (string.IsNullOrWhiteSpace(sondeSerial) ? "inconnue" : sondeSerial) +
                    " : batterie " + batteryPercent + "% (lieu " + idLieu + ").";

                var payload =
                    "{" +
                    "\"title\":\"" + EscapeJson(title) + "\"," +
                    "\"body\":\"" + EscapeJson(body) + "\"," +
                    "\"url\":\"/fr/alarmes\"," +
                    "\"eventType\":\"triggered\"," +
                    "\"idLieu\":" + idLieu + "," +
                    "\"alarmTypeCode\":\"GSP_BATTERY\"," +
                    "\"lastValue\":\"" + batteryPercent + "%\"," +
                    "\"skipEmail\":" + (sendEmail ? "false" : "true") +
                    "}";

                var req = new HttpRequestMessage(HttpMethod.Post, url);
                req.Headers.Add("x-vigitemp-secret", Secret);
                req.Content = new StringContent(payload, Encoding.UTF8, "application/json");

                VigitempServeur.Log(
                    "AlarmWebNotifier: envoi batterie GSP " +
                    "idLieu=" + idLieu +
                    " sonde=" + (sondeSerial ?? "") +
                    " battery=" + batteryPercent +
                    " sendEmail=" + sendEmail +
                    " url=" + url);

                var response = await _http.SendAsync(req);
                var statusCode = (int)response.StatusCode;
                if (statusCode < 200 || statusCode >= 300)
                {
                    VigitempServeur.Log(
                        "AlarmWebNotifier: WARNING reponse non-2xx batterie GSP (status=" + statusCode + ") " +
                        "idLieu=" + idLieu +
                        " sonde=" + (sondeSerial ?? ""));
                }
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("AlarmWebNotifier: echec envoi batterie GSP: " + ex.Message);
            }
        }

        public static async Task TriggerMonthlyStatsRecapAsync()
        {
            try
            {
                if (string.IsNullOrWhiteSpace(BaseUrl) || string.IsNullOrWhiteSpace(Secret))
                {
                    VigitempServeur.Log("AlarmWebNotifier: configuration manquante (BaseUrl/Secret) pour recap mensuel stats");
                    return;
                }

                var url = Combine(BaseUrl, "/api/statistiques/recap-mensuel/send");
                var req = new HttpRequestMessage(HttpMethod.Get, url);
                req.Headers.Add("x-vigitemp-secret", Secret);

                var response = await _http.SendAsync(req);
                var statusCode = (int)response.StatusCode;
                if (statusCode < 200 || statusCode >= 300)
                {
                    var body = await response.Content.ReadAsStringAsync();
                    if (body != null && body.Length > 200)
                    {
                        body = body.Substring(0, 200);
                    }

                    VigitempServeur.Log(
                        "AlarmWebNotifier: WARNING recap mensuel stats non-2xx " +
                        "(status=" + statusCode + ") body=" + (body ?? ""));
                    return;
                }

                VigitempServeur.Log("AlarmWebNotifier: recap mensuel stats check OK (status=" + statusCode + ")");
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("AlarmWebNotifier: echec check recap mensuel stats: " + ex.Message);
            }
        }

        private static string EscapeJson(string value)
        {
            if (string.IsNullOrEmpty(value)) return "";
            return value
                .Replace("\\", "\\\\")
                .Replace("\"", "\\\"")
                .Replace("\r", "\\r")
                .Replace("\n", "\\n");
        }

        private static string Combine(string baseUrl, string path)
        {
            if (string.IsNullOrEmpty(baseUrl)) return path ?? "";
            if (string.IsNullOrEmpty(path)) return baseUrl;
            return baseUrl.TrimEnd('/') + "/" + path.TrimStart('/');
        }
    }
}

