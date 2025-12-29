using System;
using System.IO;
using System.Text;

namespace VigitempAgent
{
    internal static class AgentLog
    {
        private static readonly object _lock = new object();

        private static string LogPath()
        {
            var dir = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "VigitempAgent",
                "logs"
            );
            Directory.CreateDirectory(dir);
            return Path.Combine(dir, "agent.log");
        }

        public static void Info(string message)
        {
            Write("INFO", message);
        }

        public static void Error(string message, Exception ex = null)
        {
            var full = ex == null ? message : message + Environment.NewLine + ex;
            Write("ERROR", full);
        }

        private static void Write(string level, string message)
        {
            try
            {
                lock (_lock)
                {
                    File.AppendAllText(
                        LogPath(),
                        $"{DateTime.UtcNow:O} [{level}] {message}{Environment.NewLine}",
                        Encoding.UTF8
                    );
                }
            }
            catch
            {
                // ignore
            }
        }
    }
}

