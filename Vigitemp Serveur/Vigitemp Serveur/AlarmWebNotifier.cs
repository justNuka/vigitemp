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

        private static string BaseUrl => ConfigurationManager.AppSettings["Vigitemp.WebsiteBaseUrl"];
        private static string Secret => ConfigurationManager.AppSettings["Vigitemp.AlarmDispatchSecret"];

        public static Task NotifyAlarmAsync(int idLieu, double valeur)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(BaseUrl) || string.IsNullOrWhiteSpace(Secret))
                {
                    return Task.CompletedTask;
                }

                var url = Combine(BaseUrl, "/api/alarmes/dispatch");
                var payload =
                    "{" +
                    "\"title\":\"Alarme Vigitemp\"," +
                    "\"body\":\"Alarme declenchee (Lieu " + idLieu + ", valeur " + valeur.ToString("0.##", CultureInfo.InvariantCulture) + ")\"," +
                    "\"url\":\"/surveillance\"" +
                    "}";

                var req = new HttpRequestMessage(HttpMethod.Post, url);
                req.Headers.Add("x-vigitemp-secret", Secret);
                req.Content = new StringContent(payload, Encoding.UTF8, "application/json");

                return _http.SendAsync(req);
            }
            catch
            {
                return Task.CompletedTask;
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

