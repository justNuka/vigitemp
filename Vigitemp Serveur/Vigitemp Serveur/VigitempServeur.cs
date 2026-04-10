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
using System.Configuration;

namespace Vigitemp_Serveur
{
    public partial class VigitempServeur : ServiceBase
    {
        //private NotifyIcon trayIcon;
        public static EventLog eventLog1;
        public static volatile int nombres_interrogations;
        public static volatile int nombres_reponses;
        private static StreamWriter _fileLogWriter;
        private static readonly object _fileLogLock = new object();
        private static readonly object _lock = new object();
        private static readonly long _maxLogFileSizeBytes =
            GetSettingInt("Vigitemp.Log.MaxFileSizeMB", 10) * 1024L * 1024L;
        private System.Timers.Timer _timer;
        private HotlineApiServer _hotlineApi;
        private volatile bool _powerSuspendRequested;
        private long _lastResumeSuspendAtUtcTicks;
        private bool _offsetDisabledForPack;

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
                    RotateLogFileIfNeeded();
                    var writer = GetFileLogWriter();
                    writer.WriteLine($"{DateTime.Now:yyyy-MM-dd HH:mm:ss.fff} {safeMessage}");
                }
                catch
                {
                    // ignore
                }
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

                var baseDir = GetLogBaseDir();
                Directory.CreateDirectory(baseDir);

                var logPath = GetLogPath();
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

        private static string GetLogBaseDir()
        {
            return Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
                "Vigitemp",
                "logs");
        }

        private static string GetLogPath()
        {
            return Path.Combine(GetLogBaseDir(), "vigitemp-serveur.log");
        }

        private static void RotateLogFileIfNeeded()
        {
            if (_maxLogFileSizeBytes <= 0) return;

            lock (_fileLogLock)
            {
                var logPath = GetLogPath();
                if (!File.Exists(logPath)) return;

                var info = new FileInfo(logPath);
                if (info.Length < _maxLogFileSizeBytes) return;

                try { _fileLogWriter?.Flush(); } catch { /* ignore */ }
                try { _fileLogWriter?.Dispose(); } catch { /* ignore */ }
                _fileLogWriter = null;

                var timestamp = DateTime.Now.ToString("yyyyMMdd-HHmmssfff");
                var rotatedPath = Path.Combine(GetLogBaseDir(), $"vigitemp-serveur-{timestamp}.log");
                try
                {
                    File.Move(logPath, rotatedPath);
                }
                catch
                {
                    // ignore
                }
            }
        }

        private static int GetSettingInt(string key, int defaultValue)
        {
            try
            {
                var raw = ConfigurationManager.AppSettings[key];
                if (string.IsNullOrWhiteSpace(raw)) return defaultValue;
                if (int.TryParse(raw, out var value)) return value;
                return defaultValue;
            }
            catch
            {
                return defaultValue;
            }
        }

        private sealed class LogTextWriter : TextWriter
        {
            public override Encoding Encoding => Encoding.UTF8;

            public override void Write(string value)
            {
                if (string.IsNullOrWhiteSpace(value)) return;
                VigitempServeur.Log(value);
            }

            public override void WriteLine(string value)
            {
                if (string.IsNullOrWhiteSpace(value)) return;
                VigitempServeur.Log(value);
            }
        }

        private void StartWorker(int idServeur)
        {
            lock (_workersLock)
            {
                if (_workers.ContainsKey(idServeur)) return;

                var cts = new CancellationTokenSource();
                var worker = new ThreadServeur(cts.Token, idServeur, _offsetDisabledForPack);
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

        private void SyncWorkersWithDatabase()
        {
            List<int> arr_serveurs;
            using (IDatabaseProvider db = DatabaseFactory.Create())
            {
                arr_serveurs = db.getDistinctIdServeur();
            }

            // ajout de potentiel nouveau serveur cr?? depuis le lancement du service
            foreach (int idServeur in arr_serveurs)
            {
                StartWorker(idServeur);
            }

            // suppression des serveurs qui ne sont plus utilis?s par les sondes
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

        protected override void OnStart(string[] args)
        {
            // Rediriger console/trace vers le logger fichier pour tout capturer.
            try
            {
                var logWriter = new LogTextWriter();
                Console.SetOut(logWriter);
                Console.SetError(logWriter);
                Trace.Listeners.Clear();
                Trace.Listeners.Add(new TextWriterTraceListener(logWriter));
                Trace.AutoFlush = true;
            }
            catch
            {
                // ignore
            }

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

            _offsetDisabledForPack = string.Equals(licenseResult.Edition, "pack", StringComparison.OrdinalIgnoreCase);
            if (_offsetDisabledForPack)
            {
                VigitempServeur.Log("Mode licence Pack: application de l'offset des sondes desactivee.");
            }

            Thread.Sleep(2000);
            SyncWorkersWithDatabase();

            _timer = new System.Timers.Timer(60000);//timer de 1 minutes
                                                    //Set action associated to each tick
            _timer.Elapsed += Process;
            //Start the timer
            _timer.Start();

            try
            {
                _hotlineApi = new HotlineApiServer();
                _hotlineApi.Start();
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("Hotline API start failed: " + ex.Message);
            }
        }

        public void StartConsole(string[] args)
        {
            OnStart(args);
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
            try { _hotlineApi?.Stop(); } catch { /* ignore */ }
            _hotlineApi = null;
            CloseFileLogWriter();

        }

        public void StopConsole()
        {
            OnStop();
        }

        protected void Process(object sender, ElapsedEventArgs eventArgs)
        {
            try
            {
                if (_powerSuspendRequested)
                {
                    VigitempServeur.Log("Process ignore pendant QuerySuspend/Suspend.");
                    return;
                }

                var nowUtc = DateTime.UtcNow;
                var lastResumeTicks = Interlocked.Read(ref _lastResumeSuspendAtUtcTicks);
                if (lastResumeTicks > 0 && (nowUtc - new DateTime(lastResumeTicks, DateTimeKind.Utc)) < TimeSpan.FromSeconds(15))
                {
                    VigitempServeur.Log("Process differe apres ResumeSuspend pour laisser les ressources se stabiliser.");
                    return;
                }

                Interlocked.Exchange(ref _lastResumeSuspendAtUtcTicks, 0L);

                // Console.WriteLine("Guid: "+systemi());
                List<int> arr_serveurs;
                using (IDatabaseProvider db = DatabaseFactory.Create())
                {
                    arr_serveurs = db.getDistinctIdServeur();
                }
                //ajout de potentiel nouveau serveur cr?? depuis le lancement du service
                foreach (int idServeur in arr_serveurs)
                {
                    StartWorker(idServeur);
                }
                //suppression des serveur qui ne sont plus utilis?s par les sondes
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

        private void SetPowerAlarmStateForAllLocations(bool isActive, string sourceEvent)
        {
            try
            {
                var processedLieuIds = new HashSet<int>();
                var updatedCount = 0;

                using (IDatabaseProvider db = DatabaseFactory.Create())
                {
                    var serverIds = db.getDistinctIdServeur();
                    foreach (var serverId in serverIds)
                    {
                        var activeSondes = db.getSondesActivesByServeur(serverId);
                        foreach (var sonde in activeSondes)
                        {
                            if (sonde == null || sonde.IdLieu <= 0) continue;
                            if (!processedLieuIds.Add(sonde.IdLieu)) continue;

                            if (db.setPowerAlarm(sonde.IdLieu, sonde.SondeNumeroSerie, isActive))
                            {
                                updatedCount++;
                            }
                        }
                    }
                }

                VigitempServeur.Log(
                    "Power sector alarm state=" + (isActive ? "active" : "resolved") +
                    " applied on " + updatedCount + " locations (event=" + sourceEvent + ").");
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("SetPowerAlarmStateForAllLocations failed: " + ex.Message);
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
            VigitempServeur.Log("Power event: " + powerStatus);

            if (powerStatus == PowerBroadcastStatus.QuerySuspend)
            {
                _powerSuspendRequested = true;
                SetPowerAlarmStateForAllLocations(true, "QuerySuspend");
                VigitempServeur.Log("QuerySuspend detecte: le service reste actif mais differe les traitements non essentiels.");
                return true;
            }

            if (powerStatus == PowerBroadcastStatus.Suspend)
            {
                _powerSuspendRequested = true;
                SetPowerAlarmStateForAllLocations(true, "Suspend");
                VigitempServeur.Log("Suspend detecte: mise en pause logique des traitements periodiques.");
                return true;
            }

            if (powerStatus == PowerBroadcastStatus.ResumeSuspend)
            {
                _powerSuspendRequested = false;
                Interlocked.Exchange(ref _lastResumeSuspendAtUtcTicks, DateTime.UtcNow.Ticks);
                SetPowerAlarmStateForAllLocations(false, "ResumeSuspend");
                VigitempServeur.Log("ResumeSuspend detecte: reprise differee pendant 15 secondes pour stabilisation.");
                return true;
            }

            if (powerStatus == PowerBroadcastStatus.BatteryLow)
            {
                SetPowerAlarmStateForAllLocations(true, "BatteryLow");
                VigitempServeur.Log("BatteryLow detecte.");
                return true;
            }

            return base.OnPowerEvent(powerStatus);
        }
    }
}
