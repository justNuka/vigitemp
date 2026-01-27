using System;
using System.Diagnostics;
using System.ServiceProcess;
using System.Threading;
using System.IO;
using System.Threading.Tasks;

namespace Vigitemp_Serveur
{
    static class Program
    {
        private static void SafeLog(string message)
        {
            try
            {
                VigitempServeur.Log(message);
                return;
            }
            catch
            {
                // fall through
            }

            try
            {
                var baseDir = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
                    "Vigitemp",
                    "logs");
                Directory.CreateDirectory(baseDir);
                var logPath = Path.Combine(baseDir, "vigitemp-serveur.log");
                File.AppendAllText(
                    logPath,
                    $"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} {message}{Environment.NewLine}");
            }
            catch
            {
                // ignore
            }
        }

        /// <summary>
        /// Point d'entrée principal de l'application.
        /// </summary>
        static void Main(string[] args)
        {

            try
            {
                AppDomain.CurrentDomain.UnhandledException += (sender, eventArgs) =>
                {
                    SafeLog("UnhandledException: " + eventArgs.ExceptionObject);
                };
                TaskScheduler.UnobservedTaskException += (sender, eventArgs) =>
                {
                    SafeLog("UnobservedTaskException: " + eventArgs.Exception);
                    eventArgs.SetObserved();
                };

                var pid = Process.GetCurrentProcess().Id;
                var runAsConsole = Environment.UserInteractive ||
                    (args != null && Array.Exists(args, arg => arg.Equals("--console", StringComparison.OrdinalIgnoreCase)));

                SafeLog(
                    $"Process start pid={pid} runAsConsole={runAsConsole} userInteractive={Environment.UserInteractive} args={string.Join(" ", args ?? Array.Empty<string>())}");

                if (runAsConsole)
                {
                    var server = new VigitempServeur();
                    server.StartConsole(args ?? Array.Empty<string>());

                    SafeLog("Console mode active. Press Ctrl+C to stop.");

                    var exitEvent = new ManualResetEvent(false);
                    Console.CancelKeyPress += (sender, eventArgs) =>
                    {
                        eventArgs.Cancel = true;
                        server.StopConsole();
                        SafeLog("Console stop requested (Ctrl+C).");
                        exitEvent.Set();
                    };

                    exitEvent.WaitOne();
                    SafeLog("Console wait ended.");
                    return;
                }

                ServiceBase[] ServicesToRun;
                ServicesToRun = new ServiceBase[]
                {
                    new VigitempServeur()
                };
                ServicesToRun[0].CanHandlePowerEvent = true;
                ServiceBase.Run(ServicesToRun);
            }
            catch (Exception ex)
            {
                SafeLog("Fatal exception in Main: " + ex);
                try
                {
                    EventLog.WriteEntry("NewVigitemp", ex.ToString(), EventLogEntryType.Error);
                }
                catch
                {
                    // ignore
                }
            }
        }
    }
}
