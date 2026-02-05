using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Vigitemp_Serveur
{
    internal static class AlarmWebNotifier
    {
        private static readonly HttpClient _http = new HttpClient();

        private static string BaseUrl => ConfigurationManager.AppSettings["Vigi.WebsiteBaseUrl"];
        private static string Secret => ConfigurationManager.AppSettings["Vigi.AlarmDispatchSecret"];

        public static async Task NotifyAlarmAsync(int idLieu, double valeur, int? alarmId = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(BaseUrl) || string.IsNullOrWhiteSpace(Secret))
                {
                    VigitempServeur.Log("AlarmWebNotifier: configuration manquante (BaseUrl/Secret)");
                    return;
                }

                var url = Combine(BaseUrl, "/api/alarmes/dispatch");
                string payload;
                if (alarmId.HasValue)
                {
                    payload = "{" + "\"alarmId\":" + alarmId.Value + "}";
                }
                else
                {
                    payload =
                        "{" +
                        "\"title\":\"Alarme Vigitemp\"," +
                        "\"body\":\"Alarme declenchee (Lieu " + idLieu + ", valeur " + valeur.ToString("0.##", CultureInfo.InvariantCulture) + ")\"," +
                        "\"url\":\"/surveillance\"" +
                        "}";
                }

                var req = new HttpRequestMessage(HttpMethod.Post, url);
                req.Headers.Add("x-vigitemp-secret", Secret);
                req.Content = new StringContent(payload, Encoding.UTF8, "application/json");

                VigitempServeur.Log(
                    "AlarmWebNotifier: envoi notification web " +
                    "idLieu=" + idLieu +
                    (alarmId.HasValue ? (" alarmId=" + alarmId.Value) : "") +
                    " url=" + url);

                var response = await _http.SendAsync(req);
                VigitempServeur.Log(
                    "AlarmWebNotifier: notification envoyee (status=" + (int)response.StatusCode + ") " +
                    "idLieu=" + idLieu +
                    (alarmId.HasValue ? (" alarmId=" + alarmId.Value) : ""));

                return;
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("AlarmWebNotifier: echec envoi notification: " + ex.Message);
                return;
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
                var title = alarms.Count == 1 ? "Alarme Vigitemp" : $"Alarmes Vigitemp ({alarms.Count})";

                var lines = new List<string>();
                var maxLines = Math.Min(alarms.Count, 5);
                for (int i = 0; i < maxLines; i++)
                {
                    var alarm = alarms[i];
                    var type = string.IsNullOrWhiteSpace(alarm.Type) ? "?" : alarm.Type;
                    var valueText = alarm.Valeur.HasValue
                        ? alarm.Valeur.Value.ToString("0.##", CultureInfo.InvariantCulture)
                        : "-";
                    var unite = string.IsNullOrWhiteSpace(alarm.Unite) ? "" : (" " + alarm.Unite);
                    lines.Add($"Lieu {alarm.IdLieu} ({type}) {valueText}{unite}".Trim());
                }

                if (alarms.Count > maxLines)
                {
                    lines.Add($"et {alarms.Count - maxLines} autre(s)...");
                }

                var body = string.Join("\n", lines);

                var payload =
                    "{" +
                    "\"title\":\"" + title + "\"," +
                    "\"body\":\"" + EscapeJson(body) + "\"," +
                    "\"url\":\"/surveillance\"" +
                    "}";

                var req = new HttpRequestMessage(HttpMethod.Post, url);
                req.Headers.Add("x-vigitemp-secret", Secret);
                req.Content = new StringContent(payload, Encoding.UTF8, "application/json");

                VigitempServeur.Log(
                    "AlarmWebNotifier: envoi notification web batch " +
                    "count=" + alarms.Count +
                    " url=" + url);

                var response = await _http.SendAsync(req);
                VigitempServeur.Log(
                    "AlarmWebNotifier: notification batch envoyee (status=" + (int)response.StatusCode + ") " +
                    "count=" + alarms.Count);
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("AlarmWebNotifier: echec envoi notification batch: " + ex.Message);
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

