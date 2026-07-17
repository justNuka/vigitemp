using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Vigitemp_Serveur
{
    internal static class AlarmWebNotifier
    {
        private static readonly HttpClient _http = new HttpClient { Timeout = TimeSpan.FromSeconds(10) };
        private static DateTime _monthlyStatsPauseUntilUtc = DateTime.MinValue;

        private static string BaseUrl =>
            ConfigurationManager.AppSettings["VigiSensys.WebsiteBaseUrl"] ??
            ConfigurationManager.AppSettings["Vigi.WebsiteBaseUrl"];

        private static string Secret =>
            ConfigurationManager.AppSettings["VigiSensys.AlarmDispatchSecret"] ??
            ConfigurationManager.AppSettings["Vigi.AlarmDispatchSecret"];

        public static void ValidateConfig()
        {
            var baseUrl = BaseUrl;
            var secret = Secret;

            if (string.IsNullOrWhiteSpace(baseUrl))
            {
                VigitempServeur.Log("[ALARM][WEB] status=config-warning issue=missing-base-url");
            }

            if (string.IsNullOrWhiteSpace(secret))
            {
                VigitempServeur.Log("[ALARM][WEB] status=config-warning issue=missing-secret");
                return;
            }

            if (!string.IsNullOrWhiteSpace(baseUrl))
            {
                VigitempServeur.Log("[ALARM][WEB] status=config-ok baseUrl=" + baseUrl);
            }
        }

        public static async Task<IReadOnlyList<int>> NotifyAlarmBatchAsync(IReadOnlyList<AlarmNotificationItem> alarms)
        {
            var mailedAlarmIds = new List<int>();
            var mailedAlarmIdsLock = new object();

            try
            {
                if (alarms == null || alarms.Count == 0)
                {
                    return mailedAlarmIds;
                }

                if (string.IsNullOrWhiteSpace(BaseUrl) || string.IsNullOrWhiteSpace(Secret))
                {
                    VigitempServeur.Log("[ALARM][WEB] event=triggered status=skipped reason=missing-config");
                    return mailedAlarmIds;
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
                            AddDispatchSecretHeaders(req);
                            req.Content = new StringContent(payload, Encoding.UTF8, "application/json");

                            var response = await _http.SendAsync(req);
                            var statusCode = (int)response.StatusCode;
                            if (statusCode < 200 || statusCode >= 300)
                            {
                                VigitempServeur.Log(
                                    "[ALARM][WEB] event=triggered status=warning code=" + statusCode +
                                    " idLieu=" + capturedAlarm.IdLieu +
                                    " alarmId=" + capturedAlarm.IdAlarme);
                            }
                            else
                            {
                                VigitempServeur.Log(
                                    "[ALARM][WEB] event=triggered status=sent code=" + statusCode +
                                    " idLieu=" + capturedAlarm.IdLieu +
                                    " alarmId=" + capturedAlarm.IdAlarme);
                                lock (mailedAlarmIdsLock)
                                {
                                    mailedAlarmIds.Add(capturedAlarm.IdAlarme);
                                }
                            }
                        }
                        catch (Exception ex)
                        {
                            VigitempServeur.Log("[ALARM][WEB] event=triggered status=error alarmId=" + capturedAlarm.IdAlarme + " error=" + ex.Message);
                        }
                    }));
                }

                await Task.WhenAll(tasks);
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("[ALARM][WEB] event=triggered status=batch-error error=" + ex.Message);
            }

            return mailedAlarmIds;
        }

        public static async Task<IReadOnlyList<int>> NotifyEndedAlarmBatchAsync(IReadOnlyList<AlarmNotificationItem> alarms)
        {
            var dispatchedAlarmIds = new ConcurrentBag<int>();
            try
            {
                if (alarms == null || alarms.Count == 0) return new List<int>();

                if (string.IsNullOrWhiteSpace(BaseUrl) || string.IsNullOrWhiteSpace(Secret))
                {
                    VigitempServeur.Log("[ALARM][WEB] event=ended status=skipped reason=missing-config");
                    return new List<int>();
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
                                "\"eventType\":\"ended\"" +
                                "}";

                            var req = new HttpRequestMessage(HttpMethod.Post, url);
                            AddDispatchSecretHeaders(req);
                            req.Content = new StringContent(payload, Encoding.UTF8, "application/json");

                            var response = await _http.SendAsync(req);
                            var statusCode = (int)response.StatusCode;
                            if (statusCode < 200 || statusCode >= 300)
                            {
                                VigitempServeur.Log(
                                    "[ALARM][WEB] event=ended status=warning code=" + statusCode +
                                    " idLieu=" + capturedAlarm.IdLieu +
                                    " alarmId=" + capturedAlarm.IdAlarme);
                            }
                            else
                            {
                                dispatchedAlarmIds.Add(capturedAlarm.IdAlarme);
                                VigitempServeur.Log(
                                    "[ALARM][WEB] event=ended status=sent code=" + statusCode +
                                    " idLieu=" + capturedAlarm.IdLieu +
                                    " alarmId=" + capturedAlarm.IdAlarme);
                            }
                        }
                        catch (Exception ex)
                        {
                            VigitempServeur.Log("[ALARM][WEB] event=ended status=error alarmId=" + capturedAlarm.IdAlarme + " error=" + ex.Message);
                        }
                    }));
                }

                await Task.WhenAll(tasks);
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("[ALARM][WEB] event=ended status=batch-error error=" + ex.Message);
            }

            return dispatchedAlarmIds.ToList();
        }

        public static async Task NotifyRealtimeAlarmAsync(int? alarmId, int? idLieu, string eventType)
        {
            try
            {
                var normalizedEventType = string.Equals(eventType, "ended", StringComparison.OrdinalIgnoreCase)
                    ? "ended"
                    : "triggered";

                if (string.IsNullOrWhiteSpace(BaseUrl) || string.IsNullOrWhiteSpace(Secret))
                {
                    VigitempServeur.Log("[ALARM][WEB] event=" + normalizedEventType + " status=skipped reason=missing-config");
                    return;
                }

                var url = Combine(BaseUrl, "/api/alarmes/dispatch-realtime");
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
                AddDispatchSecretHeaders(req);
                req.Content = new StringContent(payloadBuilder.ToString(), Encoding.UTF8, "application/json");

                var response = await _http.SendAsync(req);
                var statusCode = (int)response.StatusCode;
                var target =
                    (idLieu.HasValue ? (" idLieu=" + idLieu.Value) : string.Empty) +
                    (alarmId.HasValue ? (" alarmId=" + alarmId.Value) : string.Empty);

                if (statusCode < 200 || statusCode >= 300)
                {
                    VigitempServeur.Log("[ALARM][WEB] event=" + normalizedEventType + " status=warning code=" + statusCode + target);
                }
                else
                {
                    VigitempServeur.Log("[ALARM][WEB] event=" + normalizedEventType + " status=sent code=" + statusCode + target);
                }
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("[ALARM][WEB] status=realtime-error error=" + ex.Message);
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
                    VigitempServeur.Log("[ALARM][WEB] event=gsp-battery status=skipped reason=missing-config");
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
                AddDispatchSecretHeaders(req);
                req.Content = new StringContent(payload, Encoding.UTF8, "application/json");

                var response = await _http.SendAsync(req);
                var statusCode = (int)response.StatusCode;
                if (statusCode < 200 || statusCode >= 300)
                {
                    VigitempServeur.Log(
                        "[ALARM][WEB] event=gsp-battery status=warning code=" + statusCode +
                        " idLieu=" + idLieu +
                        " sonde=" + (sondeSerial ?? string.Empty));
                }
                else
                {
                    VigitempServeur.Log(
                        "[ALARM][WEB] event=gsp-battery status=sent code=" + statusCode +
                        " idLieu=" + idLieu +
                        " sonde=" + (sondeSerial ?? string.Empty) +
                        " battery=" + batteryPercent +
                        " sendEmail=" + sendEmail);
                }
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("[ALARM][WEB] event=gsp-battery status=error error=" + ex.Message);
            }
        }

        public static async Task TriggerMonthlyStatsRecapAsync()
        {
            try
            {
                if (_monthlyStatsPauseUntilUtc > DateTime.UtcNow)
                {
                    return;
                }

                if (string.IsNullOrWhiteSpace(BaseUrl) || string.IsNullOrWhiteSpace(Secret))
                {
                    VigitempServeur.Log("[STATS][MONTHLY] status=skipped reason=missing-config");
                    return;
                }

                var url = Combine(BaseUrl, "/api/statistiques/recap-mensuel/send");
                var req = new HttpRequestMessage(HttpMethod.Get, url);
                AddDispatchSecretHeaders(req);

                using (var cts = new CancellationTokenSource(TimeSpan.FromSeconds(8)))
                {
                    var response = await _http.SendAsync(req, cts.Token);
                    var statusCode = (int)response.StatusCode;
                    if (statusCode < 200 || statusCode >= 300)
                    {
                        var body = await response.Content.ReadAsStringAsync();
                        if (body != null && body.Length > 200)
                        {
                            body = body.Substring(0, 200);
                        }

                        VigitempServeur.Log(
                            "[STATS][MONTHLY] status=warning code=" + statusCode + " body=" + (body ?? string.Empty));
                        return;
                    }

                    VigitempServeur.Log("[STATS][MONTHLY] status=ok code=" + statusCode);
                    _monthlyStatsPauseUntilUtc = DateTime.MinValue;
                }
            }
            catch (Exception ex)
            {
                _monthlyStatsPauseUntilUtc = DateTime.UtcNow.AddHours(6);
                VigitempServeur.Log("[STATS][MONTHLY] status=error pauseHours=6 error=" + ex.Message);
            }
        }

        public static async Task ProcessPendingAlarmEmailsAsync(int maxBatch)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(BaseUrl) || string.IsNullOrWhiteSpace(Secret))
                {
                    return;
                }

                var url = Combine(BaseUrl, "/api/notifications/email-process");
                var payload = "{\"maxBatch\":" + Math.Max(1, Math.Min(200, maxBatch)) + "}";
                var req = new HttpRequestMessage(HttpMethod.Post, url);
                AddDispatchSecretHeaders(req);
                req.Content = new StringContent(payload, Encoding.UTF8, "application/json");

                var response = await _http.SendAsync(req);
                var statusCode = (int)response.StatusCode;
                if (statusCode < 200 || statusCode >= 300)
                {
                    VigitempServeur.Log("[ALARM][EMAIL-QUEUE] status=warning code=" + statusCode);
                    return;
                }

                VigitempServeur.LogDetailed("[ALARM][EMAIL-QUEUE] status=processed code=" + statusCode);
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("[ALARM][EMAIL-QUEUE] status=error error=" + ex.Message);
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

        private static void AddDispatchSecretHeaders(HttpRequestMessage req)
        {
            req.Headers.Add("x-vigisensys-secret", Secret);
            req.Headers.Add("x-vigitemp-secret", Secret);
        }

        private static string Combine(string baseUrl, string path)
        {
            if (string.IsNullOrEmpty(baseUrl)) return path ?? "";
            if (string.IsNullOrEmpty(path)) return baseUrl;
            return baseUrl.TrimEnd('/') + "/" + path.TrimStart('/');
        }
    }
}
