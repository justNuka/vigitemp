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
                catch (Exception ex)
                {
                    AgentLog.Error("AgentSecretStore load failed.", ex);
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
                if (string.IsNullOrWhiteSpace(secret))
                {
                    _secret = null;
                    try
                    {
                        var path = SecretFilePath();
                        if (File.Exists(path)) File.Delete(path);
                    }
                    catch (Exception ex)
                    {
                        AgentLog.Error("AgentSecretStore.Save failed deleting file.", ex);
                    }
                    return;
                }

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
                var bytes = Encoding.UTF8.GetBytes(secret);
                var protectedBytes = ProtectedData.Protect(bytes, null, DataProtectionScope.CurrentUser);
                File.WriteAllBytes(SecretFilePath(), protectedBytes);
            }
            catch (Exception ex)
            {
                AgentLog.Error("AgentSecretStore.Save failed.", ex);
            }
        }
    }
}
