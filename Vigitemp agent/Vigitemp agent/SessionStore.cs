using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace VigitempAgent
{
    internal sealed class SessionInfo
    {
        public string Token { get; set; }
        public string UserId { get; set; }
        public string Username { get; set; }
        public DateTime? ExpiresAtUtc { get; set; }
    }

    internal static class SessionStore
    {
        private static readonly object _lock = new object();
        private static SessionInfo _session;

        private static string SessionFilePath()
        {
            var dir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "VigitempAgent"
            );
            Directory.CreateDirectory(dir);
            return Path.Combine(dir, "session.dat");
        }

        public static void Load()
        {
            lock (_lock)
            {
                try
                {
                    var path = SessionFilePath();
                    if (!File.Exists(path))
                    {
                        _session = null;
                        return;
                    }

                    var protectedBytes = File.ReadAllBytes(path);
                    var bytes = ProtectedData.Unprotect(protectedBytes, null, DataProtectionScope.CurrentUser);
                    var json = Encoding.UTF8.GetString(bytes);

                    _session = ParseJson(json);
                }
                catch
                {
                    _session = null;
                }
            }
        }

        public static SessionInfo Get()
        {
            lock (_lock)
            {
                return _session;
            }
        }

        public static bool HasValidSession()
        {
            lock (_lock)
            {
                if (_session == null) return false;
                if (string.IsNullOrWhiteSpace(_session.Token)) return false;
                if (_session.ExpiresAtUtc.HasValue && DateTime.UtcNow >= _session.ExpiresAtUtc.Value)
                {
                    _session = null;
                    try
                    {
                        var path = SessionFilePath();
                        if (File.Exists(path)) File.Delete(path);
                    }
                    catch
                    {
                        // ignore
                    }
                    return false;
                }
                return true;
            }
        }

        public static void Save(SessionInfo session)
        {
            lock (_lock)
            {
                _session = session;
                Persist(session);
            }
        }

        public static void Clear()
        {
            lock (_lock)
            {
                _session = null;
                try
                {
                    var path = SessionFilePath();
                    if (File.Exists(path)) File.Delete(path);
                }
                catch
                {
                    // ignore
                }
            }
        }

        private static void Persist(SessionInfo session)
        {
            try
            {
                var json = SerializeJson(session);
                var bytes = Encoding.UTF8.GetBytes(json);
                var protectedBytes = ProtectedData.Protect(bytes, null, DataProtectionScope.CurrentUser);
                File.WriteAllBytes(SessionFilePath(), protectedBytes);
            }
            catch
            {
                // ignore
            }
        }

        // Minimal JSON (avoid extra deps)
        private static SessionInfo ParseJson(string json)
        {
            // Expected keys: token, userId, username, expiresAtUtc
            var session = new SessionInfo();
            if (string.IsNullOrWhiteSpace(json)) return session;

            string GetValue(string key)
            {
                var token = "\"" + key + "\"";
                var idx = json.IndexOf(token, StringComparison.OrdinalIgnoreCase);
                if (idx < 0) return null;
                idx = json.IndexOf(':', idx);
                if (idx < 0) return null;
                idx++;
                while (idx < json.Length && char.IsWhiteSpace(json[idx])) idx++;
                if (idx >= json.Length) return null;
                if (json[idx] == '"')
                {
                    idx++;
                    var end = json.IndexOf('"', idx);
                    if (end < 0) return null;
                    return json.Substring(idx, end - idx);
                }
                // non-string (null/number/bool)
                var end2 = idx;
                while (end2 < json.Length && json[end2] != ',' && json[end2] != '}') end2++;
                return json.Substring(idx, end2 - idx).Trim();
            }

            session.Token = GetValue("token");
            session.UserId = GetValue("userId");
            session.Username = GetValue("username");
            var expires = GetValue("expiresAtUtc") ?? GetValue("expiresAt");
            if (!string.IsNullOrWhiteSpace(expires) && expires != "null")
            {
                DateTime dt;
                if (DateTime.TryParse(expires, out dt))
                {
                    session.ExpiresAtUtc = DateTime.SpecifyKind(dt, DateTimeKind.Utc);
                }
            }

            return session;
        }

        private static string SerializeJson(SessionInfo session)
        {
            string esc(string s) => (s ?? "").Replace("\\", "\\\\").Replace("\"", "\\\"");
            var expires = session?.ExpiresAtUtc.HasValue == true
                ? "\"" + session.ExpiresAtUtc.Value.ToString("o") + "\""
                : "null";

            return "{" +
                   "\"token\":\"" + esc(session?.Token) + "\"," +
                   "\"userId\":\"" + esc(session?.UserId) + "\"," +
                   "\"username\":\"" + esc(session?.Username) + "\"," +
                   "\"expiresAtUtc\":" + expires +
                   "}";
        }
    }
}
