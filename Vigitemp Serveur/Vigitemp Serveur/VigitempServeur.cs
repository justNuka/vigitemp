using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.Linq;
using System.ServiceProcess;
using System.Threading;
using System.Timers;
using System.IO;
using System.Globalization;
using System.Text;
using System.Windows.Forms;

namespace Vigitemp_Serveur
{
    public partial class VigitempServeur : ServiceBase
    {
        //private NotifyIcon trayIcon;
        public static EventLog eventLog1;
        public static int nombres_interrogations;
        public static int nombres_reponses;
        private static StreamWriter _fileLogWriter;
        private static readonly object _fileLogLock = new object();
        private static readonly object _lock = new object();
        private System.Timers.Timer _timer;

        private readonly object _workersLock = new object();
        private readonly Dictionary<int, (ThreadServeur worker, CancellationTokenSource cts)> _workers =
            new Dictionary<int, (ThreadServeur worker, CancellationTokenSource cts)>();
        public VigitempServeur()
        {
            InitializeComponent();
            eventLog1 = new EventLog();

            this.CanHandlePowerEvent = true;

            try
            {
                if (!EventLog.SourceExists("Vigitemp"))
                {
                    EventLog.CreateEventSource("Vigitemp", "New Vigitemp Serveur");
                }
                eventLog1.Source = "Vigitemp";
                eventLog1.Log = "New Vigitemp Serveur";
            }
            catch
            {
                eventLog1.Source = "Application";
                eventLog1.Log = "Application";
            }

            //trayIcon = new NotifyIcon()
            //{
            //    Text = "Vigitemp Serveur",
            //    Icon = Properties.Resources.AppIcon,
            //    ContextMenuStrip = new ContextMenuStrip()
            //    {
            //        Items = { new ToolStripMenuItem("Exit", null, Exit) }
            //    },
            //    Visible = true
            //};
        }

        void Exit(object sender, EventArgs e)
        {
            //trayIcon.Visible = false;
            try
            {
                StopAllWorkers();
            }
            catch
            {
                // ignore
            }
        }

        public static void Log(string logMessage)
        {
            lock (_lock)
            {
                //ecriture dans event viewer
                var safeMessage = SanitizeLog(logMessage);

                try
                {
                    eventLog1.WriteEntry(safeMessage);
                }
                catch
                {
                    // ignore
                }

                // ecriture dans un fichier log (best-effort, chemin compatible service)
                try
                {
                    var writer = GetFileLogWriter();
                    writer.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} {safeMessage}");
                }
                catch
                {
                    // ignore
                }
                //ecriture dans la console
                Console.WriteLine(safeMessage);
                Trace.WriteLine(safeMessage);
            }
        }

        private static string SanitizeLog(string message)
        {
            if (string.IsNullOrEmpty(message)) return message;

            var normalized = message.Normalize(NormalizationForm.FormKD);
            var sb = new StringBuilder(normalized.Length);

            foreach (var ch in normalized)
            {
                var category = CharUnicodeInfo.GetUnicodeCategory(ch);
                if (category == UnicodeCategory.NonSpacingMark) continue;

                if (ch <= 0x7F)
                {
                    sb.Append(ch);
                    continue;
                }

                switch (ch)
                {
                    case '\u2018':
                    case '\u2019':
                        sb.Append('\'');
                        break;
                    case '\u2013':
                    case '\u2014':
                        sb.Append('-');
                        break;
                    case '\u2026':
                        sb.Append("...");
                        break;
                    default:
                        // Drop any other non-ASCII char to keep logs readable in ASCII.
                        break;
                }
            }

            return sb.ToString();
        }

        private static StreamWriter GetFileLogWriter()
        {
            lock (_fileLogLock)
            {
                if (_fileLogWriter != null) return _fileLogWriter;

                var baseDir = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
                    "Vigitemp",
                    "logs");
                Directory.CreateDirectory(baseDir);

                var logPath = Path.Combine(baseDir, "vigitemp-serveur.log");
                _fileLogWriter = new StreamWriter(
                    new FileStream(logPath, FileMode.Append, FileAccess.Write, FileShare.ReadWrite),
                    new System.Text.UTF8Encoding(encoderShouldEmitUTF8Identifier: true))
                {
                    AutoFlush = true
                };

                return _fileLogWriter;
            }
        }

        private static void CloseFileLogWriter()
        {
            lock (_fileLogLock)
            {
                try { _fileLogWriter?.Flush(); } catch { /* ignore */ }
                try { _fileLogWriter?.Dispose(); } catch { /* ignore */ }
                _fileLogWriter = null;
            }
        }

        private void StartWorker(int idServeur)
        {
            lock (_workersLock)
            {
                if (_workers.ContainsKey(idServeur)) return;

                var cts = new CancellationTokenSource();
                var worker = new ThreadServeur(cts.Token, idServeur);
                worker.Start();
                _workers[idServeur] = (worker, cts);
            }
        }

        private void StopWorker(int idServeur)
        {
            (ThreadServeur worker, CancellationTokenSource cts) entry;

            lock (_workersLock)
            {
                if (!_workers.TryGetValue(idServeur, out entry)) return;
                _workers.Remove(idServeur);
            }

            try { entry.cts.Cancel(); } catch { /* ignore */ }
            try { entry.worker.Stop(); } catch { /* ignore */ }
            try { entry.cts.Dispose(); } catch { /* ignore */ }
        }

        private void StopAllWorkers()
        {
            int[] ids;
            lock (_workersLock)
            {
                ids = _workers.Keys.ToArray();
            }

            foreach (var id in ids)
            {
                StopWorker(id);
            }
        }

        protected override void OnStart(string[] args)
        {
            VigitempServeur.Log("Demarrage du service Vigitemp");
            AppContext.SetSwitch("Switch.System.Threading.UseNetCoreTimer", true);

            var licenseResult = LicenseManager.ValidateFromConfig();
            if (!licenseResult.IsValid)
            {
                VigitempServeur.Log("Licence invalide: " + licenseResult.Reason);
                try { this.Stop(); } catch { /* ignore */ }
                return;
            }

            VigitempServeur.Log(
                "Licence OK: " +
                $"{licenseResult.LicenseId} " +
                $"edition={licenseResult.Edition} " +
                $"concurrent={licenseResult.ConcurrentAccess} " +
                $"expires={licenseResult.ExpiresAtUtc?.ToString("yyyy-MM-dd") ?? "none"}");

            Database db = new Database();

            Thread.Sleep(2000);

            List<int> arr_serveurs = db.getDistinctIdServeur();
            foreach (int IdServeur in arr_serveurs)
            {
                StartWorker(IdServeur);
            }

            _timer = new System.Timers.Timer(60000);//timer de 1 minutes
                                                    //Set action associated to each tick
            _timer.Elapsed += Process;
            //Start the timer
            _timer.Start();
        }

        protected override void OnStop()
        {
            VigitempServeur.Log("Arrêt du service Vigitemp");
            try
            {
                _timer?.Stop();
                _timer?.Dispose();
                _timer = null;
            }
            catch
            {
                // ignore
            }

            StopAllWorkers();
            CloseFileLogWriter();

        }

        protected void Process(object sender, ElapsedEventArgs eventArgs)
        {
            try
            {
            // Console.WriteLine("Guid: "+systemi());
            Database db = new Database();
            List<int> arr_serveurs = db.getDistinctIdServeur();
            //ajout de potentiel nouveau serveur créé depuis le lancement du service
            foreach (int idServeur in arr_serveurs)
            {
                StartWorker(idServeur);
            }


            //suppression des serveur qui ne sont plus utilisés par les sondes
            int[] currentIds;
            lock (_workersLock)
            {
                currentIds = _workers.Keys.ToArray();
            }

            foreach (var idServeur in currentIds)
            {
                if (!arr_serveurs.Contains(idServeur))
                {
                    StopWorker(idServeur);
                }
            }
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("VigitempServeur.Process error: " + ex);
            }
        }

        protected override void OnShutdown()
        {
            VigitempServeur.Log("OnShutdown");
            try
            {
                OnStop();
            }
            catch
            {
                // ignore
            }

            base.OnShutdown();
        }

        protected override bool OnPowerEvent(PowerBroadcastStatus powerStatus)
        {
            VigitempServeur.Log("changement de powerstatus à (avant postpone) " + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"));
            
            VigitempServeur.Log("changement de powerstatus à (apres postpone) " + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"));
            VigitempServeur.Log("Changement de powerStatus(object): "+powerStatus + "\n" +
                                "Changement de powerStatus(toString): " + powerStatus.ToString() + "\n" +
                                "Changement de powerStatus(GetType): " + powerStatus.GetType() + "\n" +
                                "Changement de powerStatus(GetTypeCode): " + powerStatus.GetTypeCode() + "\n" +
                                "Hasflag de powerStatus(BatteryLow): " + powerStatus.HasFlag(PowerBroadcastStatus.BatteryLow) + "\n" +
                                "Hasflag de powerStatus(Suspend): " + powerStatus.HasFlag(PowerBroadcastStatus.Suspend) + "\n" +
                                "Hasflag de powerStatus(ResumeSuspend): " + powerStatus.HasFlag(PowerBroadcastStatus.ResumeSuspend) + "\n" +
                                "Hasflag de powerStatus(QuerySuspend): " + powerStatus.HasFlag(PowerBroadcastStatus.QuerySuspend) + "\n" 
                                );  
            if (powerStatus.HasFlag(PowerBroadcastStatus.QuerySuspend))
            {
                VigitempServeur.Log("Service need to stop");
                //this.RequestAdditionalTime(10000); // ne marche pas, dans les logs on dirait que ça stop la fonction, il ne se passe rien apres cette ligne
                //OnStop();
                try
                {
                    this.Stop();
                }
                catch
                {
                    // ignore
                }
                //this.RequestAdditionalTime(10000);
            }

            if (powerStatus.HasFlag(PowerBroadcastStatus.ResumeSuspend))
            {
               VigitempServeur.Log("Resume detecte (service deja actif).");
            }

            return base.OnPowerEvent(powerStatus);
        }
    }
}
