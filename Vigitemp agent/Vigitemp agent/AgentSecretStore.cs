using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;

namespace VigitempAgent
{
    internal static class AgentSecretStore
    {
        private static readonly object _lock = new object();
        private static string _secret;

        private static string SecretFilePath()
        {
            var dir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "VigitempAgent"
            );
            Directory.CreateDirectory(dir);
            return Path.Combine(dir, "agent_secret.dat");
        }

        public static void Load()
        {
            lock (_lock)
            {
                try
                {
                    var path = SecretFilePath();
                    if (!File.Exists(path))
                    {
                        _secret = null;
                        return;
                    }

                    var protectedBytes = File.ReadAllBytes(path);
                    var bytes = ProtectedData.Unprotect(protectedBytes, null, DataProtectionScope.CurrentUser);
                    _secret = Encoding.UTF8.GetString(bytes);
                }
                catch
                {
                    _secret = null;
                }
            }
        }

        public static string Get()
        {
            lock (_lock)
            {
                return _secret;
            }
        }

        public static void Save(string secret)
        {
            lock (_lock)
            {
                _secret = secret;
                Persist(secret);
            }
        }

        public static void Clear()
        {
            lock (_lock)
            {
                _secret = null;
                try
                {
                    var path = SecretFilePath();
                    if (File.Exists(path)) File.Delete(path);
                }
                catch
                {
                    // ignore
                }
            }
        }

        private static void Persist(string secret)
        {
            try
            {
                var bytes = Encoding.UTF8.GetBytes(secret ?? "");
                var protectedBytes = ProtectedData.Protect(bytes, null, DataProtectionScope.CurrentUser);
                File.WriteAllBytes(SecretFilePath(), protectedBytes);
            }
            catch
            {
                // ignore
            }
        }
    }
}
