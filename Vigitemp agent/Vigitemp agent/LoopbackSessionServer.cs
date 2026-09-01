using System;
using System.Globalization;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;

namespace VigitempAgent
{
    internal sealed class LoopbackSessionServer
    {
        private readonly int _port;
        private TcpListener _listener;
        private CancellationTokenSource _cts;

        public LoopbackSessionServer(int port)
        {
            _port = port;
        }

        public void Start()
        {
            if (_listener != null) return;

            _cts = new CancellationTokenSource();
            _listener = new TcpListener(IPAddress.Loopback, _port);
            _listener.Start();
            AgentLog.Info("LoopbackSessionServer listening on http://127.0.0.1:" + _port + "/");

            _ = Task.Run(() => AcceptLoopAsync(_cts.Token));
        }

        public void Stop()
        {
            try
            {
                _cts?.Cancel();
            }
            catch
            {
                // ignore
            }

            try
            {
                _listener?.Stop();
            }
            catch
            {
                // ignore
            }

            _listener = null;
            _cts = null;
        }

        private async Task AcceptLoopAsync(CancellationToken token)
        {
            while (!token.IsCancellationRequested)
            {
                TcpClient client = null;
                try
                {
                    client = await _listener.AcceptTcpClientAsync().ConfigureAwait(false);
                    _ = Task.Run(() => HandleClientAsync(client, token), token);
                }
                catch (ObjectDisposedException)
                {
                    return;
                }
                catch (Exception ex)
                {
                    AgentLog.Error("LoopbackSessionServer accept failed.", ex);
                    try { client?.Close(); } catch { /* ignore */ }
                }
            }
        }

        private static int IndexOfHeaderTerminator(byte[] buffer, int length)
        {
            for (var i = 0; i < length - 3; i++)
            {
                if (buffer[i] == 13 && buffer[i + 1] == 10 && buffer[i + 2] == 13 && buffer[i + 3] == 10)
                {
                    return i;
                }
            }
            return -1;
        }

        private async Task HandleClientAsync(TcpClient client, CancellationToken token)
        {
            using (client)
            using (var stream = client.GetStream())
            {
                stream.ReadTimeout = 5000;
                stream.WriteTimeout = 5000;

                try
                {
                    var headerBuffer = new byte[64 * 1024];
                    var totalRead = 0;
                    var headerEndIdx = -1;

                    while (totalRead < headerBuffer.Length && headerEndIdx < 0)
                    {
                        var read = await stream.ReadAsync(headerBuffer, totalRead, headerBuffer.Length - totalRead, token)
                            .ConfigureAwait(false);
                        if (read <= 0) return;
                        totalRead += read;
                        headerEndIdx = IndexOfHeaderTerminator(headerBuffer, totalRead);
                    }

                    if (headerEndIdx < 0)
                    {
                        await WriteResponseAsync(stream, 400, "text/plain", "Bad Request", token).ConfigureAwait(false);
                        return;
                    }

                    var headerText = Encoding.ASCII.GetString(headerBuffer, 0, headerEndIdx);
                    var lines = headerText.Split(new[] { "\r\n" }, StringSplitOptions.None);
                    if (lines.Length == 0)
                    {
                        await WriteResponseAsync(stream, 400, "text/plain", "Bad Request", token).ConfigureAwait(false);
                        return;
                    }

                    var requestLine = lines[0].Split(' ');
                    if (requestLine.Length < 2)
                    {
                        await WriteResponseAsync(stream, 400, "text/plain", "Bad Request", token).ConfigureAwait(false);
                        return;
                    }

                    var method = requestLine[0].Trim().ToUpperInvariant();
                    var path = requestLine[1].Trim();

                    var contentLength = 0;
                    for (var i = 1; i < lines.Length; i++)
                    {
                        var line = lines[i];
                        var sep = line.IndexOf(':');
                        if (sep <= 0) continue;
                        var name = line.Substring(0, sep).Trim();
                        var value = line.Substring(sep + 1).Trim();
                        if (name.Equals("Content-Length", StringComparison.OrdinalIgnoreCase))
                        {
                            int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out contentLength);
                        }
                    }

                    var bodyBytes = Array.Empty<byte>();
                    var alreadyInBuffer = totalRead - (headerEndIdx + 4);
                    if (contentLength > 0)
                    {
                        bodyBytes = new byte[contentLength];

                        var copied = 0;
                        if (alreadyInBuffer > 0)
                        {
                            var toCopy = Math.Min(contentLength, alreadyInBuffer);
                            Buffer.BlockCopy(headerBuffer, headerEndIdx + 4, bodyBytes, 0, toCopy);
                            copied = toCopy;
                        }

                        while (copied < contentLength)
                        {
                            var read = await stream.ReadAsync(bodyBytes, copied, contentLength - copied, token)
                                .ConfigureAwait(false);
                            if (read <= 0) break;
                            copied += read;
                        }
                    }

                    if (method == "OPTIONS")
                    {
                        await WriteCorsResponseAsync(stream, 204, "", token).ConfigureAwait(false);
                        return;
                    }

                    if (path == "/info" && method == "GET")
                    {
                        var payload =
                            "{\"machineName\":\"" + JsonEscape(Environment.MachineName) + "\"," +
                            "\"ip\":\"" + JsonEscape(HttpServer.GetLocalIPAddress()) + "\"}";
                        await WriteCorsResponseAsync(stream, 200, payload, token, "application/json")
                            .ConfigureAwait(false);
                        return;
                    }

                    if (path == "/session")
                    {
                        if (method == "POST")
                        {
                            var body = bodyBytes.Length > 0 ? Encoding.UTF8.GetString(bodyBytes) : "";
                            var session = new SessionInfo
                            {
                                Token = ExtractJsonString(body, "token"),
                                UserId = ExtractJsonString(body, "userId"),
                                Username = TextEncodingHelper.NormalizeDisplayText(ExtractJsonString(body, "username")),
                                ExpiresAtUtc = ParseJsonDate(body, "expiresAtUtc") ?? ParseJsonDate(body, "expiresAt"),
                            };
                            SessionStore.Save(session);
                            await WriteCorsResponseAsync(stream, 204, "", token).ConfigureAwait(false);
                            return;
                        }

                        if (method == "DELETE")
                        {
                            SessionStore.Clear();
                            await WriteCorsResponseAsync(stream, 204, "", token).ConfigureAwait(false);
                            return;
                        }

                        if (method == "GET")
                        {
                            var s = SessionStore.Get();
                            var connected = SessionStore.HasValidSession();
                            var jsonSession = "{\"connected\":" + (connected ? "true" : "false") +
                                              ",\"username\":\"" + JsonEscape(s != null ? s.Username : "") + "\"" +
                                              ",\"userId\":\"" + JsonEscape(s != null ? s.UserId : "") + "\"" +
                                              ",\"expiresAtUtc\":\"" + (s != null && s.ExpiresAtUtc.HasValue ? s.ExpiresAtUtc.Value.ToString("o") : "") + "\"" +
                                              "}";

                            await WriteCorsResponseAsync(stream, 200, jsonSession, token, "application/json")
                                .ConfigureAwait(false);
                            return;
                        }
                    }

                    await WriteCorsResponseAsync(stream, 404, "{\"error\":\"not_found\"}", token, "application/json")
                        .ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    AgentLog.Error("LoopbackSessionServer request failed.", ex);
                    try
                    {
                        await WriteResponseAsync(stream, 500, "text/plain", "Internal Server Error", token)
                            .ConfigureAwait(false);
                    }
                    catch
                    {
                        // ignore
                    }
                }
            }
        }

        private static async Task WriteCorsResponseAsync(
            Stream stream,
            int statusCode,
            string body,
            CancellationToken token,
            string contentType = "text/plain"
        )
        {
            await WriteResponseAsync(
                stream,
                statusCode,
                contentType,
                body,
                token,
                cors: true
            ).ConfigureAwait(false);
        }

        private static async Task WriteResponseAsync(
            Stream stream,
            int statusCode,
            string contentType,
            string body,
            CancellationToken token,
            bool cors = false
        )
        {
            var bodyBytes = string.IsNullOrEmpty(body) ? Array.Empty<byte>() : Encoding.UTF8.GetBytes(body);
            var sb = new StringBuilder();
            sb.Append("HTTP/1.1 ").Append(statusCode).Append(" ").Append(StatusText(statusCode)).Append("\r\n");
            sb.Append("Connection: close\r\n");
            sb.Append("Content-Length: ").Append(bodyBytes.Length).Append("\r\n");
            sb.Append("Content-Type: ").Append(contentType).Append("; charset=utf-8\r\n");
            if (cors)
            {
                sb.Append("Access-Control-Allow-Origin: *\r\n");
                sb.Append("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS\r\n");
                sb.Append("Access-Control-Allow-Headers: Content-Type\r\n");
                sb.Append("Access-Control-Max-Age: 600\r\n");
            }
            sb.Append("\r\n");

            var headerBytes = Encoding.ASCII.GetBytes(sb.ToString());
            await stream.WriteAsync(headerBytes, 0, headerBytes.Length, token).ConfigureAwait(false);
            if (bodyBytes.Length > 0)
            {
                await stream.WriteAsync(bodyBytes, 0, bodyBytes.Length, token).ConfigureAwait(false);
            }
        }

        private static string StatusText(int status)
        {
            switch (status)
            {
                case 200: return "OK";
                case 204: return "No Content";
                case 400: return "Bad Request";
                case 403: return "Forbidden";
                case 404: return "Not Found";
                case 500: return "Internal Server Error";
                default: return "Unknown";
            }
        }

        private static string JsonEscape(string value)
        {
            if (value == null) return "";
            return value.Replace("\\", "\\\\").Replace("\"", "\\\"");
        }

        private static string ExtractJsonString(string json, string key)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(json)) return null;
                var obj = JObject.Parse(json);
                return obj.Value<string>(key);
            }
            catch
            {
                return null;
            }
        }

        private static DateTime? ParseJsonDate(string json, string key)
        {
            var val = ExtractJsonString(json, key);
            if (string.IsNullOrWhiteSpace(val)) return null;
            DateTime dt;
            if (!DateTime.TryParse(val, out dt)) return null;
            return DateTime.SpecifyKind(dt, DateTimeKind.Utc);
        }
    }
}
