using System;
using System.Configuration;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Vigitemp_Serveur
{
    internal sealed class HotlineApiServer
    {
        private HttpListener _listener;
        private CancellationTokenSource _cts;
        private Task _listenTask;

        public void Start()
        {
            var prefix = GetSetting("Vigitemp.Hotline.Bind", "http://127.0.0.1:5310/");
            if (!prefix.EndsWith("/"))
            {
                prefix += "/";
            }

            _listener = new HttpListener();
            _listener.Prefixes.Add(prefix);
            _listener.Start();

            _cts = new CancellationTokenSource();
            _listenTask = Task.Run(() => ListenLoop(_cts.Token));
            VigitempServeur.Log("Hotline API started on " + prefix);
        }

        public void Stop()
        {
            try { _cts?.Cancel(); } catch { /* ignore */ }
            try { _listener?.Stop(); } catch { /* ignore */ }
            try { _listener?.Close(); } catch { /* ignore */ }
            try { _listenTask?.Wait(2000); } catch { /* ignore */ }

            _listener = null;
            _cts = null;
            _listenTask = null;
        }

        private async Task ListenLoop(CancellationToken token)
        {
            while (!token.IsCancellationRequested)
            {
                HttpListenerContext context = null;
                try
                {
                    context = await _listener.GetContextAsync().ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    if (!_listener.IsListening) return;
                    VigitempServeur.Log("Hotline API error: " + ex.Message);
                    continue;
                }

                _ = Task.Run(() => HandleRequest(context));
            }
        }

        private void HandleRequest(HttpListenerContext context)
        {
            var response = context.Response;
            response.ContentType = "application/json";
            response.Headers["Cache-Control"] = "no-store";

            try
            {
                if (!ValidateApiKey(context.Request))
                {
                    WriteJson(response, 401, new { ok = false, error = "unauthorized", message = "Unauthorized" });
                    return;
                }

                var path = context.Request.Url.AbsolutePath.TrimEnd('/');
                if (context.Request.HttpMethod != "POST" || !string.Equals(path, "/api/hotline/login", StringComparison.OrdinalIgnoreCase))
                {
                    WriteJson(response, 404, new { ok = false, error = "not_found", message = "Not found" });
                    return;
                }

                var payload = ReadJson(context.Request);
                var slug = payload.Value<string>("slug") ?? string.Empty;
                var username = payload.Value<string>("username") ?? string.Empty;
                var password = payload.Value<string>("password") ?? string.Empty;

                var hotline = LicenseManager.GetHotlineConfigFromConfig();
                if (!hotline.IsValid)
                {
                    WriteJson(response, 401, new { ok = false, error = "invalid_license", message = hotline.Reason });
                    return;
                }

                var config = hotline.Config;
                if (!string.IsNullOrWhiteSpace(config.Slug) &&
                    !string.Equals(slug, config.Slug, StringComparison.Ordinal))
                {
                    WriteJson(response, 401, new { ok = false, error = "invalid_credentials", message = "Invalid credentials" });
                    return;
                }

                if (!string.Equals(username, config.Username, StringComparison.Ordinal))
                {
                    WriteJson(response, 401, new { ok = false, error = "invalid_credentials", message = "Invalid credentials" });
                    return;
                }

                if (!HotlinePasswordHasher.VerifyPassword(password, config.PasswordHash))
                {
                    WriteJson(response, 401, new { ok = false, error = "invalid_credentials", message = "Invalid credentials" });
                    return;
                }

                WriteJson(response, 200, new { ok = true });
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("Hotline API failure: " + ex);
                WriteJson(response, 500, new { ok = false, error = "server_error", message = "Server error" });
            }
        }

        private static JObject ReadJson(HttpListenerRequest request)
        {
            using (var reader = new StreamReader(request.InputStream, request.ContentEncoding ?? Encoding.UTF8))
            {
                var body = reader.ReadToEnd();
                if (string.IsNullOrWhiteSpace(body))
                {
                    return new JObject();
                }
                return JObject.Parse(body);
            }
        }

        private static void WriteJson(HttpListenerResponse response, int statusCode, object payload)
        {
            response.StatusCode = statusCode;
            var json = JsonConvert.SerializeObject(payload);
            var bytes = Encoding.UTF8.GetBytes(json);
            response.OutputStream.Write(bytes, 0, bytes.Length);
            response.OutputStream.Flush();
            response.OutputStream.Close();
        }

        private static string GetSetting(string key, string defaultValue)
        {
            try
            {
                var value = ConfigurationManager.AppSettings[key];
                return string.IsNullOrWhiteSpace(value) ? defaultValue : value;
            }
            catch
            {
                return defaultValue;
            }
        }

        private static bool ValidateApiKey(HttpListenerRequest request)
        {
            var expected = GetSetting("Vigitemp.Hotline.ApiKey", string.Empty);
            if (string.IsNullOrWhiteSpace(expected)) return true;
            var provided = request.Headers["x-vigitemp-hotline-key"];
            return string.Equals(expected, provided, StringComparison.Ordinal);
        }
    }
}
