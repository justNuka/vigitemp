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
using System.Threading.Tasks;

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
        private static readonly bool _detailedLogsEnabled =
            GetSettingBool("Vigitemp.Log.Detailed", false);
        private static int _exceptionHooksInitialized = 0;
        private System.Timers.Timer _timer;
        private HotlineApiServer _hotlineApi;
        private volatile bool _powerSuspendRequested;
        private long _lastResumeSuspendAtUtcTicks;
        private bool _offsetDisabledForPack;

        private readonly object _workersLock = new object();
        private readonly Dictionary<int, (ThreadServeur worker, CancellationTokenSource cts)> _workers =
            new Dictionary<int, (ThreadServeur worker, CancellationTokenSource cts)>();
        private const int MinWorkerCount = 1;
        private const int MaxWorkerCount = 16;
        private string _lastLoggedWorkerConfigSignature = null;
        private static readonly TimeSpan WorkerHeartbeatStaleAfter = TimeSpan.FromMinutes(3);
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
                "VigiSensys",
                "logs");
        }

        public static void LogDetailed(string logMessage)
        {
            if (_detailedLogsEnabled)
            {
                Log(logMessage);
            }
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
            ThreadServeur workerToStart = null;
            CancellationTokenSource ctsToStart = null;

            lock (_workersLock)
            {
                if (_workers.ContainsKey(idServeur)) return;

                ctsToStart = new CancellationTokenSource();
                workerToStart = new ThreadServeur(ctsToStart.Token, idServeur, GetConfiguredWorkerServerIdsSnapshot, _offsetDisabledForPack);
                _workers[idServeur] = (workerToStart, ctsToStart);
            }

            try
            {
                Log($"StartWorker request: worker={idServeur}");
                workerToStart.Start();
                Log($"StartWorker success: worker={idServeur}");
            }
            catch (Exception ex)
            {
                lock (_workersLock)
                {
                    if (_workers.TryGetValue(idServeur, out var current) && object.ReferenceEquals(current.worker, workerToStart))
                    {
                        _workers.Remove(idServeur);
                    }
                }

                try { ctsToStart?.Cancel(); } catch { /* ignore */ }
                try { ctsToStart?.Dispose(); } catch { /* ignore */ }
                Log($"StartWorker failed: worker={idServeur} error={ex}");
                throw;
            }
        }

        private static bool GetSettingBool(string key, bool defaultValue)
        {
            try
            {
                var raw = ConfigurationManager.AppSettings[key];
                if (string.IsNullOrWhiteSpace(raw)) return defaultValue;
                if (bool.TryParse(raw, out var value)) return value;
                return defaultValue;
            }
            catch
            {
                return defaultValue;
            }
        }

        private IReadOnlyList<int> GetConfiguredWorkerServerIdsSnapshot()
        {
            return GetConfiguredWorkerServerIds();
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
            Log("SyncWorkersWithDatabase: start");
            var arr_serveurs = GetConfiguredWorkerServerIds();
            Log("SyncWorkersWithDatabase: configured workers=[" + string.Join(",", arr_serveurs) + "]");

            // ajout de potentiel nouveau serveur cr?? depuis le lancement du service
            foreach (int idServeur in arr_serveurs)
            {
                try
                {
                    StartWorker(idServeur);
                }
                catch (Exception ex)
                {
                    Log($"SyncWorkersWithDatabase: start worker failed worker={idServeur} error={ex.Message}");
                }
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
            Log("SyncWorkersWithDatabase: done");
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

            EnsureGlobalExceptionHooks();

            VigitempServeur.Log("Demarrage du service VigiSensys");
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

            VigitempServeur.Log("OnStart: pre-sync sleep 2s");
            Thread.Sleep(2000);
            VigitempServeur.Log("OnStart: worker sync begin");
            var syncSw = Stopwatch.StartNew();
            try
            {
                var syncTask = Task.Run(() => SyncWorkersWithDatabase());
                if (!syncTask.Wait(TimeSpan.FromSeconds(45)))
                {
                    VigitempServeur.Log("OnStart: worker sync timeout after 45s (startup continues).");
                }
                else if (syncTask.IsFaulted && syncTask.Exception != null)
                {
                    VigitempServeur.Log("OnStart: worker sync failed: " + syncTask.Exception.GetBaseException());
                }
                else
                {
                    VigitempServeur.Log($"OnStart: worker sync complete in {syncSw.Elapsed.TotalSeconds:n1}s");
                }
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("OnStart: worker sync exception: " + ex);
            }
            finally
            {
                syncSw.Stop();
            }

            _timer = new System.Timers.Timer(60000);//timer de 1 minutes
                                                    //Set action associated to each tick
            _timer.Elapsed += Process;
            //Start the timer
            _timer.Start();
            VigitempServeur.Log("OnStart: maintenance timer started (60s).");

            try
            {
                _hotlineApi = new HotlineApiServer();
                _hotlineApi.Start();
                VigitempServeur.Log("OnStart: hotline API started.");
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("Hotline API start failed: " + ex.Message);
            }

            VigitempServeur.Log("OnStart: completed.");
        }

        public void StartConsole(string[] args)
        {
            OnStart(args);
        }

        protected override void OnStop()
        {
            VigitempServeur.Log("Arret du service VigiSensys");
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
                var arr_serveurs = GetConfiguredWorkerServerIds();
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

                RestartStalledWorkersIfNeeded();
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("VigitempServeur.Process error: " + ex);
            }
        }

        private void RestartStalledWorkersIfNeeded()
        {
            var nowUtc = DateTime.UtcNow;
            List<int> staleWorkers = null;

            lock (_workersLock)
            {
                foreach (var kvp in _workers)
                {
                    var workerId = kvp.Key;
                    var worker = kvp.Value.worker;
                    if (worker == null) continue;

                    var heartbeatUtc = worker.LastSchedulerHeartbeatUtc;
                    if (heartbeatUtc == DateTime.MinValue) continue;

                    if ((nowUtc - heartbeatUtc) > WorkerHeartbeatStaleAfter)
                    {
                        if (staleWorkers == null) staleWorkers = new List<int>();
                        staleWorkers.Add(workerId);
                    }
                }
            }

            if (staleWorkers == null || staleWorkers.Count == 0)
            {
                return;
            }

            foreach (var workerId in staleWorkers)
            {
                try
                {
                    VigitempServeur.Log(
                        $"Worker heartbeat stale: worker={workerId} staleAfterMin={WorkerHeartbeatStaleAfter.TotalMinutes}. Restarting worker.");
                    StopWorker(workerId);
                    StartWorker(workerId);
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log($"Worker restart failed worker={workerId}: {ex}");
                }
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
                    var activeSondes = db.getSondesActivesAllServeurs();
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

                VigitempServeur.Log(
                    "Power sector alarm state=" + (isActive ? "active" : "resolved") +
                    " applied on " + updatedCount + " locations (event=" + sourceEvent + ").");
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("SetPowerAlarmStateForAllLocations failed: " + ex.Message);
            }
        }

        private List<int> GetConfiguredWorkerServerIds()
        {
            var count = 1;
            var ports = new List<string>();
            var manualWorkerIds = new List<int>();
            try
            {
                using (var db = DatabaseFactory.Create())
                {
                    var rows = db.getSondesActivesAllServeurs();
                    ports = rows
                        .Where(r => r != null && !string.IsNullOrWhiteSpace(r.PortSerie))
                        .Select(r => r.PortSerie.Trim().ToUpperInvariant())
                        .Distinct(StringComparer.Ordinal)
                        .OrderBy(p => p, StringComparer.Ordinal)
                        .ToList();
                    manualWorkerIds = rows
                        .Where(r => r != null && r.ManualWorkerId.HasValue && r.ManualWorkerId.Value > 0)
                        .Select(r => r.ManualWorkerId.Value)
                        .Distinct()
                        .OrderBy(id => id)
                        .ToList();
                }

                count = Math.Max(1, ports.Count);
            }
            catch (Exception ex)
            {
                Log("Worker auto-config read failed, fallback to 1 worker: " + ex.Message);
                count = 1;
            }

            if (count < MinWorkerCount) count = MinWorkerCount;
            if (count > MaxWorkerCount) count = MaxWorkerCount;

            var ids = Enumerable.Range(1, count)
                .Concat(manualWorkerIds)
                .Where(id => id > 0 && id <= MaxWorkerCount)
                .Distinct()
                .OrderBy(id => id)
                .ToList();
            if (ids.Count == 0)
            {
                ids.Add(1);
            }
            var portsText = ports.Count == 0 ? "none" : string.Join(",", ports.Take(12));
            var manualText = manualWorkerIds.Count == 0 ? "none" : string.Join(",", manualWorkerIds);
            var signature = $"count={count}|ports={portsText}|manual={manualText}|ids={string.Join(",", ids)}";
            if (!string.Equals(_lastLoggedWorkerConfigSignature, signature, StringComparison.Ordinal))
            {
                _lastLoggedWorkerConfigSignature = signature;
                Log("Worker auto-config: ports=" + ports.Count + " [" + portsText + "] manualWorkers=[" + manualText + "] => workers=[" + string.Join(",", ids) + "]");
            }
            return ids;
        }

        private static void EnsureGlobalExceptionHooks()
        {
            if (Interlocked.CompareExchange(ref _exceptionHooksInitialized, 1, 0) != 0)
            {
                return;
            }

            AppDomain.CurrentDomain.UnhandledException += (sender, args) =>
            {
                try
                {
                    var ex = args.ExceptionObject as Exception;
                    Log("UnhandledException: " + (ex != null ? ex.ToString() : args.ExceptionObject?.ToString()));
                }
                catch
                {
                    // ignore
                }
            };

            System.Threading.Tasks.TaskScheduler.UnobservedTaskException += (sender, args) =>
            {
                try
                {
                    Log("UnobservedTaskException: " + args.Exception);
                    args.SetObserved();
                }
                catch
                {
                    // ignore
                }
            };
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
