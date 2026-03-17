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

        private const long MaxLogSizeBytes = 5L * 1024 * 1024; // 5 MB

        private static void RotateIfNeeded(string path)
        {
            try
            {
                if (!File.Exists(path)) return;
                var info = new FileInfo(path);
                if (info.Length < MaxLogSizeBytes) return;

                var backupPath = path + ".bak";
                if (File.Exists(backupPath))
                {
                    File.Delete(backupPath);
                }
                File.Move(path, backupPath);
            }
            catch
            {
                // ignore rotation errors — don't break logging
            }
        }

        private static void Write(string level, string message)
        {
            try
            {
                lock (_lock)
                {
                    var filePath = LogPath();
                    RotateIfNeeded(filePath);
                    File.AppendAllText(
                        filePath,
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

