using System;
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

        private static string Combine(string baseUrl, string path)
        {
            if (string.IsNullOrEmpty(baseUrl)) return path ?? "";
            if (string.IsNullOrEmpty(path)) return baseUrl;
            return baseUrl.TrimEnd('/') + "/" + path.TrimStart('/');
        }
    }
}

