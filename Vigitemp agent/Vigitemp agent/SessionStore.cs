using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using Newtonsoft.Json.Linq;

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
                catch (Exception ex)
                {
                    AgentLog.Error("SessionStore.Load failed: session file may be corrupt or unreadable.", ex);
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

        private static SessionInfo ParseJson(string json)
        {
            var session = new SessionInfo();
            if (string.IsNullOrWhiteSpace(json)) return session;

            try
            {
                var obj = JObject.Parse(json);
                session.Token = obj.Value<string>("token");
                session.UserId = obj.Value<string>("userId");
                session.Username = obj.Value<string>("username");
                var expiresRaw = obj.Value<string>("expiresAtUtc") ?? obj.Value<string>("expiresAt");
                if (!string.IsNullOrWhiteSpace(expiresRaw) && expiresRaw != "null")
                {
                    DateTime dt;
                    if (DateTime.TryParse(expiresRaw, out dt))
                    {
                        session.ExpiresAtUtc = DateTime.SpecifyKind(dt, DateTimeKind.Utc);
                    }
                }
            }
            catch
            {
                // JSON parse error — return partial/empty session
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
