using System;
using System.Diagnostics;
using System.ServiceProcess;

namespace Vigitemp_Serveur
{
    static class Program
    {
        /// <summary>
        /// Point d'entrée principal de l'application.
        /// </summary>
        static void Main()
        {

            try
            {
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
