using System;
using System.Diagnostics;
using System.ServiceProcess;
using System.Threading;

namespace Vigitemp_Serveur
{
    static class Program
    {
        /// <summary>
        /// Point d'entrée principal de l'application.
        /// </summary>
        static void Main(string[] args)
        {

            try
            {
                var runAsConsole = Environment.UserInteractive ||
                    (args != null && Array.Exists(args, arg => arg.Equals("--console", StringComparison.OrdinalIgnoreCase)));

                if (runAsConsole)
                {
                    var server = new VigitempServeur();
                    server.StartConsole(args ?? Array.Empty<string>());

                    Console.WriteLine("Vigitemp Serveur (console). Press Ctrl+C to stop.");

                    var exitEvent = new ManualResetEvent(false);
                    Console.CancelKeyPress += (sender, eventArgs) =>
                    {
                        eventArgs.Cancel = true;
                        server.StopConsole();
                        exitEvent.Set();
                    };

                    exitEvent.WaitOne();
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
                EventLog.WriteEntry("NewVigitemp", ex.ToString(), EventLogEntryType.Error);
            }
        }
    }
}
