using System;
using System.Diagnostics;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Timers;
using Vigitemp_Serveur.sensors;
using System.IO.Ports;

namespace Vigitemp_Serveur
{
    class ThreadServeur
    {
        private readonly SemaphoreSlim semaphore = new SemaphoreSlim(1, 1);
        private static readonly object _lock = new object();
        private CancellationToken m_cts;
        private volatile IDatabaseProvider m_database;
        private readonly ConcurrentDictionary<int, SensorSchedule> _schedules =
            new ConcurrentDictionary<int, SensorSchedule>();
        private readonly ConcurrentDictionary<string, GspMemoJob> _gspMemoJobs =
            new ConcurrentDictionary<string, GspMemoJob>(StringComparer.OrdinalIgnoreCase);
        private List<SerialPort> list_SerialPort_open = new List<SerialPort>();

        private System.Timers.Timer _schedulerTimer;
        private System.Timers.Timer _maintenanceTimer;
        private int _idServer;
        private readonly ConcurrentDictionary<int, CachedLieuSettings> _lieuSettingsCache =
            new ConcurrentDictionary<int, CachedLieuSettings>();
        private readonly ConcurrentDictionary<string, CachedMetrology> _sondeMetrologyCache =
            new ConcurrentDictionary<string, CachedMetrology>(StringComparer.OrdinalIgnoreCase);
        private readonly object _lieuSettingsLock = new object();
        private readonly int _settingsCacheSeconds = GetSettingInt("Vigi.License.SettingsCacheSeconds", 60);
        private readonly bool _logSettingsCache = GetSettingBool("Vigitemp.Alarms.LogSettingsCache", true);
        private readonly int _schedulerTickMs = GetSettingInt("Vigitemp.Scheduler.TickMs", 5000);
        private readonly bool _logScheduler = GetSettingBool("Vigitemp.Scheduler.Log", true);
        private readonly bool _logMetrologyDetailed = GetSettingBool("Vigitemp.Metrology.LogDetailed", false);
        private readonly bool _offsetDisabledForPack;
        private readonly int _alarmPollSeconds = GetSettingInt("Vigitemp.Alarms.PollSeconds", 15);
        private readonly int _alarmPollMaxBatch = GetSettingInt("Vigitemp.Alarms.PollMaxBatch", 50);
        private readonly object _alarmPollLock = new object();
        private DateTime _lastAlarmPollUtc = DateTime.MinValue;
        private int _lastAlarmIdSeen = 0;
        private bool _alarmCursorInitialized = false;
        // NOTE: heure locale intentionnelle — correspond au NOW() MySQL qui utilise
        // l'heure locale du serveur de base de données.
        // Ne pas remplacer par DateTime.UtcNow sans aligner le fuseau horaire MySQL.
        private DateTime _lastAlarmEndPollLocal = DateTime.MinValue;
        private readonly ConcurrentDictionary<int, DateTime> _endedAlarmDispatchById =
            new ConcurrentDictionary<int, DateTime>();
        private readonly ConcurrentDictionary<int, (bool flag, DateTime expiry)> _retriggerFlagCache =
            new ConcurrentDictionary<int, (bool, DateTime)>();

        private sealed class CachedLieuSettings
        {
            public CachedLieuSettings(LieuAlarmSettings settings, DateTime fetchedAtUtc)
            {
                Settings = settings;
                FetchedAtUtc = fetchedAtUtc;
            }

            public LieuAlarmSettings Settings { get; }
            public DateTime FetchedAtUtc { get; }
        }

        private sealed class CachedMetrology
        {
            public CachedMetrology(SondeMetrologySettings settings, DateTime fetchedAtUtc)
            {
                Settings = settings;
                FetchedAtUtc = fetchedAtUtc;
            }

            public SondeMetrologySettings Settings { get; }
            public DateTime FetchedAtUtc { get; }
        }

        private sealed class SensorSchedule
        {
            public int IdLieu { get; set; }
            public string Serial { get; set; }
            public string SondeType { get; set; }
            public string FamilleSonde { get; set; }
            public string Adresse { get; set; }
            public string Port { get; set; }
            public string Module { get; set; }
            // NOTE: ConfigDirty est accede uniquement depuis les methodes qui tiennent
            // le SemaphoreSlim(1,1) — pas de volatile requis pour cette raison.
            public bool ConfigDirty { get; set; }
            public int FrequencySeconds { get; set; }
            public DateTime? LastMeasure { get; set; }
            public DateTime NextDue { get; set; }
            public bool InProgress { get; set; }
        }

        private sealed class GspMemoJob
        {
            public string Serial { get; set; }
            public int RequestedCount { get; set; }
            public int BatchSize { get; set; }
            public int CurrentOffset { get; set; }
            public int CompletedCount { get; set; }
            public int ScannedCount { get; set; }
            public int ConsecutiveFailures { get; set; }
            public DateTime CreatedAtUtc { get; set; }
            public DateTime? LastChunkAtUtc { get; set; }
            public bool InProgress { get; set; }
            public DateTime? RecoverFromProbeDateTime { get; set; }
            public DateTime? RecoverUntilProbeDateTime { get; set; }
        }

        public ThreadServeur(CancellationToken obj, int p_idServer, bool offsetDisabledForPack = false)
        {
            this.m_cts = obj;
            this._idServer = p_idServer;
            this._offsetDisabledForPack = offsetDisabledForPack;
        }

        public bool LogMetrologyDetailed => _logMetrologyDetailed;

        public bool EnqueueGspMemo(string serialNumber, int totalCount, int batchSize, int? startOffset = null)
        {
            var serial = (serialNumber ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(serial))
            {
                return false;
            }

            if (!_schedules.Values.Any(s => string.Equals(s.Serial, serial, StringComparison.OrdinalIgnoreCase)))
            {
                VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={serial} status=rejected reason=schedule-not-found");
                return false;
            }

            var requestedCount = Math.Max(1, totalCount);
            var safeBatchSize = Math.Max(1, batchSize);
            var safeOffset = Math.Max(0, startOffset ?? 0);

            _gspMemoJobs.AddOrUpdate(
                serial,
                _ => new GspMemoJob
                {
                    Serial = serial,
                    RequestedCount = requestedCount,
                    BatchSize = safeBatchSize,
                    CurrentOffset = safeOffset,
                    CompletedCount = 0,
                    ConsecutiveFailures = 0,
                    CreatedAtUtc = DateTime.UtcNow,
                },
                (_, existing) =>
                {
                    existing.RequestedCount = requestedCount;
                    existing.BatchSize = safeBatchSize;
                    existing.CurrentOffset = safeOffset;
                    existing.CompletedCount = 0;
                    existing.ConsecutiveFailures = 0;
                    existing.CreatedAtUtc = DateTime.UtcNow;
                    existing.LastChunkAtUtc = null;
                    existing.InProgress = false;
                    return existing;
                });

            VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={serial} status=queued requested={requestedCount} batch={safeBatchSize} offset={safeOffset}");
            return true;
        }

        public bool CancelGspMemo(string serialNumber)
        {
            var serial = (serialNumber ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(serial))
            {
                return false;
            }

            if (_gspMemoJobs.TryRemove(serial, out _))
            {
                VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={serial} status=cancelled");
                return true;
            }

            return false;
        }

        public bool EnqueueGspRecovery(string serialNumber, DateTime recoverFromProbeDateTime, DateTime recoverUntilProbeDateTime, int expectedMissingCount)
        {
            var serial = (serialNumber ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(serial))
            {
                return false;
            }

            if (recoverUntilProbeDateTime <= recoverFromProbeDateTime)
            {
                return false;
            }

            var requestedCount = Math.Max(1, expectedMissingCount);
            var batchSize = Math.Min(100, Math.Max(20, requestedCount));
            _gspMemoJobs.AddOrUpdate(
                serial,
                _ => new GspMemoJob
                {
                    Serial = serial,
                    RequestedCount = requestedCount,
                    BatchSize = batchSize,
                    CurrentOffset = 0,
                    CompletedCount = 0,
                    ScannedCount = 0,
                    ConsecutiveFailures = 0,
                    CreatedAtUtc = DateTime.UtcNow,
                    RecoverFromProbeDateTime = recoverFromProbeDateTime,
                    RecoverUntilProbeDateTime = recoverUntilProbeDateTime,
                },
                (_, existing) =>
                {
                    existing.RequestedCount = requestedCount;
                    existing.BatchSize = batchSize;
                    existing.CurrentOffset = 0;
                    existing.CompletedCount = 0;
                    existing.ScannedCount = 0;
                    existing.ConsecutiveFailures = 0;
                    existing.CreatedAtUtc = DateTime.UtcNow;
                    existing.LastChunkAtUtc = null;
                    existing.InProgress = false;
                    existing.RecoverFromProbeDateTime = recoverFromProbeDateTime;
                    existing.RecoverUntilProbeDateTime = recoverUntilProbeDateTime;
                    return existing;
                });

            VigitempServeur.Log($"[SONDE][RECOVERY] serial={serial} status=queued from={recoverFromProbeDateTime:O} until={recoverUntilProbeDateTime:O} expectedMissingCount={requestedCount} batch={batchSize}");
            return true;
        }

        public IDatabaseProvider GetDatabase()
        { // singleton
            if (m_database == null)
            {
                lock (_lock)
                {
                    if (m_database == null)
                    {
                        m_database = DatabaseFactory.Create();
                    }
                }
            }
            return m_database;
            // return new Database();
        }

        public LieuAlarmSettings GetLieuAlarmSettingsCached(int idLieu)
        {
            if (idLieu <= 0) return null;

            var nowUtc = DateTime.UtcNow;

            if (_lieuSettingsCache.TryGetValue(idLieu, out var cached))
            {
                if ((nowUtc - cached.FetchedAtUtc).TotalSeconds <= _settingsCacheSeconds)
                {
                    if (_logSettingsCache)
                    {
                        LogLieuSettings(idLieu, cached.Settings, "cache-hit");
                    }
                    return cached.Settings;
                }
                if (_logSettingsCache)
                {
                    LogLieuSettings(idLieu, cached.Settings, "cache-expired");
                }
            }

            lock (_lieuSettingsLock)
            {
                if (_lieuSettingsCache.TryGetValue(idLieu, out cached))
                {
                    if ((nowUtc - cached.FetchedAtUtc).TotalSeconds <= _settingsCacheSeconds)
                    {
                        if (_logSettingsCache)
                        {
                            LogLieuSettings(idLieu, cached.Settings, "cache-hit");
                        }
                        return cached.Settings;
                    }
                    if (_logSettingsCache)
                    {
                        LogLieuSettings(idLieu, cached.Settings, "cache-expired");
                    }
                }

                var settings = GetDatabase().getLieuAlarmSettings(idLieu);
                if (settings == null)
                {
                    if (_logSettingsCache)
                    {
                        VigitempServeur.Log($"LieuAlarmSettings[db-null] idLieu={idLieu}");
                    }
                    return null;
                }

                _lieuSettingsCache[idLieu] = new CachedLieuSettings(settings, nowUtc);
                if (_logSettingsCache)
                {
                    LogLieuSettings(idLieu, settings, "db-refresh");
                }
                return settings;
            }
        }


        public SondeMetrologySettings GetSondeMetrologyCached(string serialNumber)
        {
            if (string.IsNullOrWhiteSpace(serialNumber))
            {
                return new SondeMetrologySettings();
            }

            if (_sondeMetrologyCache.TryGetValue(serialNumber, out var cached) && cached != null)
            {
                var ageSeconds = (DateTime.UtcNow - cached.FetchedAtUtc).TotalSeconds;
                if (ageSeconds < _settingsCacheSeconds)
                {
                    return cached.Settings;
                }
            }

            var fromDb = GetDatabase().getSondeMetrologyBySerialNumber(serialNumber) ?? new SondeMetrologySettings();
            if (_offsetDisabledForPack)
            {
                fromDb.Offset = null;
            }
            _sondeMetrologyCache[serialNumber] = new CachedMetrology(fromDb, DateTime.UtcNow);
            return fromDb;
        }

        public bool GetLieuRetriggerFlagCached(int idLieu)
        {
            try
            {
                if (_retriggerFlagCache.TryGetValue(idLieu, out var cached) && DateTime.UtcNow < cached.expiry)
                {
                    return cached.flag;
                }
                var flag = GetDatabase().getLieuImmediateRetriggerFlag(idLieu);
                _retriggerFlagCache[idLieu] = (flag, DateTime.UtcNow.AddMilliseconds(5000));
                return flag;
            }
            catch (Exception ex)
            {
                VigitempServeur.Log($"GetLieuRetriggerFlagCached erreur idLieu={idLieu} : {ex.Message}");
                return false;
            }
        }

        public void InvalidateRetriggerFlagCache(int idLieu)
        {
            _retriggerFlagCache.TryRemove(idLieu, out _);
        }

        private void SetSondeMetrologyFromSchedule(SondeScheduleInfo row)
        {
            if (row == null || string.IsNullOrWhiteSpace(row.SondeNumeroSerie))
            {
                return;
            }

            var effectiveOffset = _offsetDisabledForPack ? (double?)null : row.SondeOffset;

            _sondeMetrologyCache[row.SondeNumeroSerie] = new CachedMetrology(new SondeMetrologySettings
            {
                IdLieu = row.IdLieu,
                Offset = effectiveOffset,
                HasAjustage = row.HasAjustage,
                CoeffX = row.CoeffX,
                CoeffConstant = row.CoeffConstant,
                HasEtalonnage = row.HasEtalonnage,
                EmtChoixMode = row.EmtChoixMode,
                ApplyCorrectionEj = row.ApplyCorrectionEj,
                ErrJustesse = row.ErrJustesse,
                CorrectionJustesse = row.CorrectionJustesse,
                Incertitude = row.Incertitude,
                DateValiditeEtalonnage = row.DateValiditeEtalonnage,
            }, DateTime.UtcNow);

            if (_logMetrologyDetailed)
            {
                VigitempServeur.Log(
                    $"Metrology cache update serial={row.SondeNumeroSerie} idLieu={row.IdLieu} " +
                    $"mode={row.EmtChoixMode?.ToString() ?? "null"} corrEJ={row.ApplyCorrectionEj} " +
                    $"hasAjustage={row.HasAjustage} coeffX={row.CoeffX} coeffC={row.CoeffConstant} " +
                    $"offset={(effectiveOffset.HasValue ? effectiveOffset.Value.ToString(CultureInfo.InvariantCulture) : "null")} " +
                    $"hasEtalonnage={row.HasEtalonnage} errJustesse={(row.ErrJustesse.HasValue ? row.ErrJustesse.Value.ToString(CultureInfo.InvariantCulture) : "null")} " +
                    $"corrJustesse={(row.CorrectionJustesse.HasValue ? row.CorrectionJustesse.Value.ToString(CultureInfo.InvariantCulture) : "null")} " +
                    $"incertitude={(row.Incertitude.HasValue ? row.Incertitude.Value.ToString(CultureInfo.InvariantCulture) : "null")}");
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

        private static void LogLieuSettings(int idLieu, LieuAlarmSettings settings, string source)
        {
            if (settings == null) return;
            VigitempServeur.Log(
                $"LieuAlarmSettings[{source}] idLieu={idLieu} " +
                $"consigneInf={settings.ConsigneInf?.ToString() ?? "null"} " +
                $"consigneSup={settings.ConsigneSup?.ToString() ?? "null"} " +
                $"consigneInfActive={settings.ConsigneInfActive} " +
                $"consigneSupActive={settings.ConsigneSupActive} " +
                $"consigneInfPre={settings.ConsigneInfPreAlarme?.ToString() ?? "null"} " +
                $"consigneInfPreActive={settings.ConsigneInfPreAlarmeActive} " +
                $"consigneSupPre={settings.ConsigneSupPreAlarme?.ToString() ?? "null"} " +
                $"consigneSupPreActive={settings.ConsigneSupPreAlarmeActive} " +
                $"retardBasMin={settings.RetardAlarmeBasMinutes} " +
                $"retardHautMin={settings.RetardAlarmeHautMinutes} " +
                $"retardNonReponseMin={settings.RetardNonReponseMinutes} " +
                $"retardChangementConsigneMin={settings.RetardAlarmeChangementConsigneMinutes} " +
                $"planningDerniereMaj={settings.PlanningDerniereMaj:O} " +
                $"temporisationRedeclenchementMesures={settings.NbMesuresTemporisationRedeclenchement} " +
                $"notificationActive={settings.NotificationActive} " +
                $"reactivationUtc={settings.DateHeureReactivationAlarme:O}"
            );
        }

        private void EnsureAlarmCursorInitialized()
        {
            if (_alarmCursorInitialized)
            {
                return;
            }

            try
            {
                var lastId = GetDatabase().getLastAlarmIdByServeur(_idServer);
                _lastAlarmIdSeen = Math.Max(0, lastId);
                _alarmCursorInitialized = true;
                VigitempServeur.Log($"Alarm poll init: lastAlarmId={_lastAlarmIdSeen} server={_idServer}");
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("Alarm poll init error (will retry next tick): " + ex.Message);
                // _alarmCursorInitialized reste false → skip poll ce tick
            }
        }

        private void EnsureAlarmEndCursorInitialized()
        {
            if (_lastAlarmEndPollLocal != DateTime.MinValue)
            {
                return;
            }

            _lastAlarmEndPollLocal = DateTime.Now;
            VigitempServeur.Log($"Alarm end poll init: since={_lastAlarmEndPollLocal:O} server={_idServer}");
        }

        private async Task PollNewAlarmsAsync()
        {
            if (_alarmPollSeconds <= 0)
            {
                return;
            }

            var nowUtc = DateTime.UtcNow;
            if ((nowUtc - _lastAlarmPollUtc).TotalSeconds < _alarmPollSeconds)
            {
                return;
            }

            lock (_alarmPollLock)
            {
                if ((nowUtc - _lastAlarmPollUtc).TotalSeconds < _alarmPollSeconds)
                {
                    return;
                }
                _lastAlarmPollUtc = nowUtc;
            }

            EnsureAlarmCursorInitialized();

            if (!_alarmCursorInitialized)
            {
                VigitempServeur.Log("Alarm poll skipped: cursor not initialized yet");
                return;
            }

            var newAlarms = GetDatabase().getNewAlarmsSince(_idServer, _lastAlarmIdSeen, _alarmPollMaxBatch);
            if (newAlarms == null || newAlarms.Count == 0)
            {
                return;
            }

            var maxId = _lastAlarmIdSeen;
            foreach (var alarm in newAlarms)
            {
                if (alarm != null && alarm.IdAlarme > maxId)
                {
                    maxId = alarm.IdAlarme;
                }
            }
            _lastAlarmIdSeen = maxId;

            await AlarmWebNotifier.NotifyAlarmBatchAsync(newAlarms);

            // Legacy agent endpoint (/alarm?action=show) is deprecated.
            // Agent notifications now go through web dispatch (/api/alarmes/dispatch -> /notify).
        }

        private void PollEndedAlarms()
        {
            if (_alarmPollSeconds <= 0)
            {
                return;
            }

            EnsureAlarmEndCursorInitialized();

            var pollNow = DateTime.Now;
            var queryFrom = _lastAlarmEndPollLocal.AddSeconds(-10);
            var ended = GetDatabase().getEndedAlarmsSince(_idServer, queryFrom, _alarmPollMaxBatch);
            _lastAlarmEndPollLocal = pollNow;

            if (ended == null || ended.Count == 0)
            {
                return;
            }

            var dedupeCutoff = pollNow.AddHours(-12);
            foreach (var item in _endedAlarmDispatchById.ToArray())
            {
                if (item.Value < dedupeCutoff)
                {
                    _endedAlarmDispatchById.TryRemove(item.Key, out _);
                }
            }

            var filtered = new List<AlarmNotificationItem>();
            foreach (var alarm in ended)
            {
                if (alarm == null || alarm.IdAlarme <= 0)
                {
                    continue;
                }

                if (_endedAlarmDispatchById.TryGetValue(alarm.IdAlarme, out var sentAt) && sentAt >= dedupeCutoff)
                {
                    continue;
                }

                _endedAlarmDispatchById[alarm.IdAlarme] = pollNow;
                filtered.Add(alarm);
            }

            if (filtered.Count == 0)
            {
                return;
            }

            // Legacy agent endpoint (/alarm?action=hide) is deprecated.
            // End-of-alarm handling is now done by web dispatch and email flow.

            _ = AlarmWebNotifier.NotifyEndedAlarmBatchAsync(filtered);
        }

        public void Start()
        {
            VigitempServeur.Log("Starting Thread#" + _idServer + "...");
            AlarmWebNotifier.ValidateConfig();
            try
            {
                var activeStates = GetDatabase().getActiveLieuAlarmStates();
                foreach (var s in activeStates)
                {
                    Sensor.SeedAlarmState(s.idLieu, s.isAlarm, s.isNonResponse);
                }
                VigitempServeur.Log($"Alarm state seeded: {activeStates.Count} lieux actifs en DB au d\u00e9marrage.");
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("Alarm state seed error (non-fatal): " + ex.Message);
            }
            RefreshSchedule();

            _schedulerTimer = new System.Timers.Timer(_schedulerTickMs);
            _schedulerTimer.Elapsed += ProcessSchedulerTick;
            _schedulerTimer.Start();
            if (_logScheduler)
            {
                VigitempServeur.Log($"Thread#{_idServer} scheduler start: tickMs={_schedulerTickMs}");
            }

            _maintenanceTimer = new System.Timers.Timer(60000);//timer de 1 minutes
                                                              //Set action associated to each tick
            _maintenanceTimer.Elapsed += ProcessMaintenanceTick;
            //Start the timer
            _maintenanceTimer.Start();
            //Console.WriteLine("Thread#" + _idServer + " started!");
            //Trace.WriteLine("Thread#" + _idServer + " started!");
            VigitempServeur.Log("Thread#" + _idServer + " started!");
        }

        public void Stop()
        {

            //Clean your ressources here

            //Console.WriteLine("Stopping Thread#" + _idServer + "...");
            //Trace.WriteLine("Stopping Thread#" + _idServer + "...");
            VigitempServeur.Log("Stopping Thread#" + _idServer + "...");

            try
            {
                _schedulerTimer?.Stop();
                _schedulerTimer?.Dispose();
                _schedulerTimer = null;
            }
            catch
            {
                // ignore
            }

            _schedules.Clear();

            try
            {
                _maintenanceTimer?.Stop();
                _maintenanceTimer?.Dispose();
                _maintenanceTimer = null;
            }
            catch
            {
                // ignore
            }

            foreach (SerialPort sp in list_SerialPort_open)
            {
                if (sp.IsOpen)
                {
                    sp.Close();
                }
                sp.Dispose();
            }

            try
            {
                m_database?.Dispose();
                m_database = null;
            }
            catch
            {
                // ignore
            }

            //Stop timer
            //Console.WriteLine("Thread#" + _idServer + " stopped!");
            //Trace.WriteLine("Thread#" + _idServer + " stopped!");
            VigitempServeur.Log("Thread#" + _idServer + " stopped!");

        }

        public void list_addComPort(SerialPort p_serialport)
        {
            this.list_SerialPort_open.Add(p_serialport);
        }

        public void list_removeComPort(SerialPort p_serialport)
        {
            this.list_SerialPort_open.RemoveAll((SerialPort element) => { return element.Equals(p_serialport); });
        }

        private void ProcessSchedulerTick(object sender, ElapsedEventArgs e)
        {
            _ = ProcessSchedulerTickAsync();
        }

        private async Task ProcessSchedulerTickAsync()
        {
            var acquired = false;

            try
            {
                try
                {
                    if (!await semaphore.WaitAsync(0, m_cts))
                    {
                        return;
                    }
                    acquired = true;
                }
                catch (OperationCanceledException)
                {
                    return;
                }

                if (m_cts.IsCancellationRequested)
                {
                    return;
                }

                if (_schedules.IsEmpty)
                {
                    RefreshSchedule();
                }

                var now = DateTime.Now;
                double ComputePriority(SensorSchedule schedule)
                {
                    if (schedule == null) return double.MinValue;
                    var freq = Math.Max(1, schedule.FrequencySeconds);
                    var latenessSeconds = (now - schedule.NextDue).TotalSeconds;
                    if (latenessSeconds < 0) latenessSeconds = 0;
                    return latenessSeconds / freq;
                }

                var due = _schedules.Values
                    .Where(s => !s.InProgress && IsScheduleDue(s, now))
                    .OrderByDescending(ComputePriority)
                    .ThenBy(s => s.FrequencySeconds)
                    .ThenBy(s => s.NextDue)
                    .ToList();

                foreach (var schedule in due)
                {
                    schedule.InProgress = true;
                    try
                    {
                        await InterrogateSchedule(schedule);
                    }
                    catch (Exception ex)
                    {
                        VigitempServeur.Log("ThreadServeur.Scheduler error: " + ex);
                    }
                    finally
                    {
                        schedule.LastMeasure = DateTime.Now;
                        schedule.NextDue = schedule.LastMeasure.Value.AddSeconds(schedule.FrequencySeconds);
                        schedule.InProgress = false;
                    }
                }

                await ProcessPendingGspMemoBatchAsync();
                await PollNewAlarmsAsync();
                PollEndedAlarms();
            }
            finally
            {
                if (acquired)
                {
                    semaphore.Release();
                }
            }
        }

        private async Task ProcessPendingGspMemoBatchAsync()
        {
            var job = _gspMemoJobs.Values
                .Where(j => j != null && !j.InProgress)
                .OrderBy(j => j.LastChunkAtUtc ?? j.CreatedAtUtc)
                .FirstOrDefault();

            if (job == null)
            {
                return;
            }

            var schedule = _schedules.Values.FirstOrDefault(s =>
                string.Equals(s.Serial, job.Serial, StringComparison.OrdinalIgnoreCase));
            if (schedule == null)
            {
                _gspMemoJobs.TryRemove(job.Serial, out _);
                VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={job.Serial} status=aborted reason=schedule-not-found");
                return;
            }

            var remaining = Math.Max(0, job.RequestedCount - job.CompletedCount);
            if (!job.RecoverUntilProbeDateTime.HasValue && remaining <= 0)
            {
                _gspMemoJobs.TryRemove(job.Serial, out _);
                VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={job.Serial} status=completed requested={job.RequestedCount} completed={job.CompletedCount} offset={job.CurrentOffset}");
                return;
            }

            if (job.ScannedCount >= 6000)
            {
                _gspMemoJobs.TryRemove(job.Serial, out _);
                VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={job.Serial} status=aborted reason=scan-limit scanned={job.ScannedCount}");
                return;
            }

            var count = job.RecoverUntilProbeDateTime.HasValue
                ? job.BatchSize
                : Math.Min(job.BatchSize, remaining);
            job.InProgress = true;
            try
            {
                Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
                VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={job.Serial} status=chunk-start count={count} offset={job.CurrentOffset}");
                var sensor = new SensorGSP(this, schedule.Port, schedule.Serial, schedule.Adresse, schedule.FrequencySeconds, false);
                var memo = await sensor.ReadMemoryChunkAsync(count, job.CurrentOffset);
                if (memo == null)
                {
                    job.ConsecutiveFailures++;
                    if (job.ConsecutiveFailures >= 3)
                    {
                        _gspMemoJobs.TryRemove(job.Serial, out _);
                        VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={job.Serial} status=failed failures={job.ConsecutiveFailures}");
                    }
                    else
                    {
                        VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={job.Serial} status=retry failures={job.ConsecutiveFailures} nextOffset={job.CurrentOffset}");
                    }
                    return;
                }

                var returnedCount = memo.ReturnedCount ?? memo.Measurements.Count;
                var effectiveOffset = memo.Offset ?? job.CurrentOffset;
                job.LastChunkAtUtc = DateTime.UtcNow;
                job.ConsecutiveFailures = 0;
                job.ScannedCount += Math.Max(0, returnedCount);

                if (returnedCount <= 0)
                {
                    _gspMemoJobs.TryRemove(job.Serial, out _);
                    VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={job.Serial} status=completed requested={job.RequestedCount} completed={job.CompletedCount} offset={job.CurrentOffset} reason=no-more-data");
                    return;
                }

                var insertedThisBatch = 0;
                var reachedRecoveryEnd = false;

                if (job.RecoverUntilProbeDateTime.HasValue)
                {
                    var fromDate = job.RecoverFromProbeDateTime;
                    var untilDate = job.RecoverUntilProbeDateTime.Value;
                    foreach (var measurement in memo.Measurements)
                    {
                        if (!measurement.ProbeDateTime.HasValue || !measurement.Temperature.HasValue)
                        {
                            continue;
                        }

                        var measurementDate = measurement.ProbeDateTime.Value;
                        if (measurementDate <= fromDate.GetValueOrDefault(DateTime.MinValue))
                        {
                            continue;
                        }

                        if (measurementDate >= untilDate)
                        {
                            reachedRecoveryEnd = true;
                            continue;
                        }

                        if (GetDatabase().AddHistoricalMesureIfMissing(
                            job.Serial,
                            Math.Round(measurement.Temperature.Value, 2, MidpointRounding.AwayFromZero),
                            "C",
                            measurement.Temperature.Value.ToString("0.########", CultureInfo.InvariantCulture),
                            measurementDate))
                        {
                            insertedThisBatch++;
                            job.CompletedCount++;
                        }
                    }
                }
                else
                {
                    job.CompletedCount += returnedCount;
                }

                job.CurrentOffset = effectiveOffset + returnedCount;
                VigitempServeur.Log(
                    $"[SONDE][MEMO-JOB] serial={job.Serial} status=batch returned={returnedCount} inserted={insertedThisBatch} completed={job.CompletedCount}/{job.RequestedCount} nextOffset={job.CurrentOffset} scanned={job.ScannedCount}");

                var shouldComplete = job.RecoverUntilProbeDateTime.HasValue
                    ? reachedRecoveryEnd || returnedCount < count
                    : job.CompletedCount >= job.RequestedCount || returnedCount < count;
                if (shouldComplete)
                {
                    _gspMemoJobs.TryRemove(job.Serial, out _);
                    VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={job.Serial} status=completed requested={job.RequestedCount} completed={job.CompletedCount} offset={job.CurrentOffset} scanned={job.ScannedCount}");
                }
            }
            catch (Exception ex)
            {
                job.ConsecutiveFailures++;
                if (job.ConsecutiveFailures >= 3)
                {
                    _gspMemoJobs.TryRemove(job.Serial, out _);
                    VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={job.Serial} status=failed failures={job.ConsecutiveFailures} error={ex}");
                }
                else
                {
                    VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={job.Serial} status=retry failures={job.ConsecutiveFailures} error={ex.Message}");
                }
            }
            finally
            {
                job.InProgress = false;
            }
        }

        private async Task InterrogateSchedule(SensorSchedule schedule)
        {
            var serial = schedule.Serial;
            if (string.IsNullOrEmpty(serial) || serial.Length < 2)
            {
                VigitempServeur.Log("Numero de serie invalide pour le lieu " + schedule.IdLieu + ".");
                return;
            }

            VigitempServeur.Log("--------------------ID SERVEUR : " + _idServer + "---CAPTEUR : " + serial + "--------------------");
            VigitempServeur.Log("Ouverture du port " + schedule.Port + " pour la sonde " + serial);
            var sensorType = string.Equals(schedule.FamilleSonde, "GSP", StringComparison.OrdinalIgnoreCase)
                ? "GSP"
                : (GspProtocol.IsGspSerial(serial) ? "GSP" : serial.Substring(0, 2));

            switch (sensorType)
            {
                case "IN":
                    Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
                    var sensorIN = new SensorIN(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.Log($"Interrogation sonde IN serial={serial} port={schedule.Port} adresse={schedule.Adresse}");
                    await sensorIN.read();
                    break;
                case "IE":
                    Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
                    var sensorIE = new SensorIE(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.Log($"Interrogation sonde IE serial={serial} port={schedule.Port} adresse={schedule.Adresse}");
                    await sensorIE.read();
                    break;
                case "IQ":
                    break;
                case "IP":
                    Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
                    var sensorIP = new SensorIP(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.Log($"Interrogation sonde IP serial={serial} port={schedule.Port} adresse={schedule.Adresse}");
                    await sensorIP.read();
                    break;
                case "IC":
                    Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
                    var sensorIC = new SensorIC(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.Log($"Interrogation sonde IC serial={serial} port={schedule.Port} adresse={schedule.Adresse}");
                    await sensorIC.read();
                    break;
                case "IH":
                    Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
                    var sensorIH = new SensorIH(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.Log($"Interrogation sonde IH serial={serial} port={schedule.Port} adresse={schedule.Adresse}");
                    await sensorIH.read();
                    break;
                case "EN":
                    Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
                    var sensorEN = new SensorEN(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.Log($"Interrogation sonde EN serial={serial} port={schedule.Port} adresse={schedule.Adresse}");
                    await sensorEN.read();
                    break;
                case "HN":
                    Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
                    var sensorHN = new SensorHN(this, schedule.Port, serial, schedule.Adresse, schedule.Module);
                    VigitempServeur.Log($"Interrogation sonde HN serial={serial} port={schedule.Port} adresse={schedule.Adresse} module={schedule.Module}");
                    await sensorHN.read();
                    break;
                case "GSP":
                    Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
                    var gspSensor = new SensorGSP(this, schedule.Port, serial, schedule.Adresse, schedule.FrequencySeconds, schedule.ConfigDirty);
                    VigitempServeur.Log($"Interrogation sonde GSP serial={serial} port={schedule.Port} adresse={schedule.Adresse} configDirty={schedule.ConfigDirty}");
                    await gspSensor.read();
                    if (gspSensor.ConfigurationSynchronized)
                    {
                        schedule.ConfigDirty = false;
                    }
                    break;
                default:
                    break;
            }
        }

        private void ProcessMaintenanceTick(object sender, ElapsedEventArgs e)
        {
            _ = ProcessMaintenanceTickAsync();
        }

        private async Task ProcessMaintenanceTickAsync()
        {
            var acquired = false;

            try
            {
                try
                {
                    await semaphore.WaitAsync(m_cts);
                    acquired = true;
                }
                catch (OperationCanceledException)
                {
                    return;
                }

                RefreshSchedule();

                //cherche les lieux avec une dateReactivationAlarme pass� pour r�activer les alarmes
                //VigitempServeur.Log("process 1 minute");
                (List<int> arr_lieuxAvecAlarmeSnooze, _) = GetDatabase().getLieuxAvecAlarmesEnSnooze();
                for (int i = 0; i < arr_lieuxAvecAlarmeSnooze.Count(); i++)
                {
                    var idLieu = arr_lieuxAvecAlarmeSnooze[i];
                    try
                    {
                        VigitempServeur.Log("Le lieu " + idLieu + " doit etre reactiv�.");

                        GetDatabase().setAlarmeByIdLieu(idLieu, true);

                        var derniereMesure = GetDatabase().getLastMeasureWithUnit(idLieu);

                        if (!derniereMesure.hasValue)
                        {
                            VigitempServeur.Log($"Snooze lieu {idLieu} : alarme réactivée, aucune mesure disponible pour comparaison (ignoré).");
                            continue;
                        }

                        //recuperer infos du lieu
                        (string arr_portSerie, string arr_sondeNumeroSerie, string arr_sondeType, string arr_familleSonde, string arr_sondeAdresse, string arr_moduleNumeroSerie) = GetDatabase().getInfosByIdLieu(idLieu);

                        if (string.IsNullOrEmpty(arr_sondeNumeroSerie) || arr_sondeNumeroSerie.Length < 2)
                        {
                            VigitempServeur.Log("Numero de serie invalide pour le lieu " + idLieu + ".");
                            continue;
                        }
                        VigitempServeur.Log("Ouverture du port " + arr_portSerie + " pour la sonde " + arr_sondeNumeroSerie);
                        var sensorType = string.Equals(arr_familleSonde, "GSP", StringComparison.OrdinalIgnoreCase)
                            ? "GSP"
                            : (GspProtocol.IsGspSerial(arr_sondeNumeroSerie) ? "GSP" : arr_sondeNumeroSerie.Substring(0, 2));

                        Sensor sensor = null;
                        switch (sensorType)
                        {
                            case "IN":
                                sensor = new SensorIN(this, arr_portSerie, arr_sondeNumeroSerie, arr_sondeAdresse);
                                break;
                            case "IE":
                                sensor = new SensorIE(this, arr_portSerie, arr_sondeNumeroSerie, arr_sondeAdresse);
                                break;
                            case "IQ":
                                break;
                            case "IP":
                                sensor = new SensorIP(this, arr_portSerie, arr_sondeNumeroSerie, arr_sondeAdresse);
                                break;
                            case "IC":
                                sensor = new SensorIC(this, arr_portSerie, arr_sondeNumeroSerie, arr_sondeAdresse);
                                break;
                            case "IH":
                                sensor = new SensorIH(this, arr_portSerie, arr_sondeNumeroSerie, arr_sondeAdresse);
                                break;
                            case "EN":
                                sensor = new SensorEN(this, arr_portSerie, arr_sondeNumeroSerie, arr_sondeAdresse);
                                break;
                            case "HN":
                                sensor = new SensorHN(this, arr_portSerie, arr_sondeNumeroSerie, arr_sondeAdresse, arr_moduleNumeroSerie);
                                break;
                            case "GSP":
                                sensor = new SensorGSP(this, arr_portSerie, arr_sondeNumeroSerie, arr_sondeAdresse);
                                break;
                            default: break;
                        }

                        if (sensor == null)
                        {
                            VigitempServeur.Log("Aucun capteur cree pour le lieu " + idLieu + ".");
                            continue;
                        }
                        string unit;
                        if (string.IsNullOrWhiteSpace(derniereMesure.unit))
                        {
                            var fallbackUnit = GetDatabase().getLieuUnite(idLieu);
                            VigitempServeur.Log(
                                $"Unite mesure absente en maintenance (lieu {idLieu}). Fallback Derniere_Unite={fallbackUnit}");
                            unit = fallbackUnit;
                        }
                        else
                        {
                            unit = derniereMesure.unit;
                        }

                        sensor.compareMeasuresAndLimits(derniereMesure.value, unit);
                    }
                    catch (Exception exLieu)
                    {
                        VigitempServeur.Log($"ProcessMaintenanceTick: erreur lieu {idLieu}: {exLieu.Message}");
                    }
                }

                // R�activation automatique de la surveillance (Lieu_Etat)
                (List<int> arr_lieuxSurveillanceSnooze, _) = GetDatabase().getLieuxAvecSurveillanceEnSnooze();
                for (int i = 0; i < arr_lieuxSurveillanceSnooze.Count(); i++)
                {
                    VigitempServeur.Log("Surveillance r�activ�e pour le lieu " + arr_lieuxSurveillanceSnooze[i] + ".");
                    GetDatabase().setSurveillanceByIdLieu(arr_lieuxSurveillanceSnooze[i], true);
                    GetDatabase().writeAuditJournal(
                        "ACT",
                        "SERVEUR",
                        "SYSTEME",
                        arr_lieuxSurveillanceSnooze[i],
                        "R�activation automatique de la surveillance",
                        null);
                }
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("ThreadServeur.ProcessMaintenanceTick error: " + ex);
            }
            finally
            {
                if (acquired)
                {
                    semaphore.Release();
                }
            }
        }

        private void RefreshSchedule()
        {
            var now = DateTime.Now;
            var rows = GetDatabase().getSondesActivesByServeur(this._idServer);
            var seen = new HashSet<int>();

            foreach (var row in rows)
            {
                if (row == null) continue;
                if (row.FrequenceSecondes <= 0) continue;

                seen.Add(row.IdLieu);

                if (!_schedules.TryGetValue(row.IdLieu, out var schedule))
                {
                    schedule = BuildSchedule(row, now);
                    _schedules[row.IdLieu] = schedule;
                    SetSondeMetrologyFromSchedule(row);
                    if (_logScheduler)
                    {
                        VigitempServeur.Log($"Scheduler add idLieu={row.IdLieu} serial={row.SondeNumeroSerie} freqSec={row.FrequenceSecondes}");
                    }

                    if (row.InfosModifiees)
                    {
                        GetDatabase().setLieuInfosModifiees(row.IdLieu, false);
                    }
                    continue;
                }

                var hasChanges = row.InfosModifiees ||
                                 !string.Equals(schedule.Serial, row.SondeNumeroSerie, StringComparison.Ordinal) ||
                                 !string.Equals(schedule.Adresse, row.AdresseSonde, StringComparison.Ordinal) ||
                                 !string.Equals(schedule.Port, row.PortSerie, StringComparison.Ordinal) ||
                                 !string.Equals(schedule.Module, row.ModuleNumeroSerie, StringComparison.Ordinal) ||
                                 schedule.FrequencySeconds != row.FrequenceSecondes;

                if (hasChanges)
                {
                    SetSondeMetrologyFromSchedule(row);
                    schedule.Serial = row.SondeNumeroSerie;
                    schedule.Adresse = row.AdresseSonde;
                    schedule.Port = row.PortSerie;
                    schedule.Module = row.ModuleNumeroSerie;
                    schedule.ConfigDirty = row.InfosModifiees || schedule.ConfigDirty;
                    schedule.FrequencySeconds = row.FrequenceSecondes;
                    schedule.LastMeasure = row.DerniereDateHeure ?? schedule.LastMeasure;
                    schedule.NextDue = ComputeNextDue(now, schedule.LastMeasure, schedule.FrequencySeconds);

                    if (_logScheduler)
                    {
                        VigitempServeur.Log($"Scheduler update idLieu={row.IdLieu} serial={row.SondeNumeroSerie} freqSec={row.FrequenceSecondes}");
                    }

                    if (row.InfosModifiees)
                    {
                        GetDatabase().setLieuInfosModifiees(row.IdLieu, false);
                    }
                }
            }

            var toRemove = _schedules.Keys.Where(id => !seen.Contains(id)).ToList();
            foreach (var idLieu in toRemove)
            {
                if (_schedules.TryRemove(idLieu, out var removed) && removed != null && !string.IsNullOrWhiteSpace(removed.Serial))
                {
                    _sondeMetrologyCache.TryRemove(removed.Serial, out _);
                    Sensor.ClearAlarmState(idLieu);
                    InvalidateRetriggerFlagCache(idLieu);
                }
                if (_logScheduler)
                {
                    VigitempServeur.Log($"Scheduler remove idLieu={idLieu}");
                }
            }
        }

        private static SensorSchedule BuildSchedule(SondeScheduleInfo info, DateTime now)
        {
            var lastMeasure = info.DerniereDateHeure;
            return new SensorSchedule
            {
                IdLieu = info.IdLieu,
                Serial = info.SondeNumeroSerie,
                SondeType = info.SondeType,
                FamilleSonde = info.FamilleSonde,
                Adresse = info.AdresseSonde,
                Port = info.PortSerie,
                Module = info.ModuleNumeroSerie,
                ConfigDirty = info.InfosModifiees || string.Equals(info.FamilleSonde, "GSP", StringComparison.OrdinalIgnoreCase) || GspProtocol.IsGspSerial(info.SondeNumeroSerie),
                FrequencySeconds = info.FrequenceSecondes,
                LastMeasure = lastMeasure,
                NextDue = ComputeNextDue(now, lastMeasure, info.FrequenceSecondes)
            };
        }

        private static bool IsScheduleDue(SensorSchedule schedule, DateTime now)
        {
            if (schedule == null) return false;

            if (schedule.LastMeasure.HasValue)
            {
                var minDue = schedule.LastMeasure.Value.AddSeconds(schedule.FrequencySeconds);
                return now >= minDue;
            }

            return schedule.NextDue <= now;
        }

        private static DateTime ComputeNextDue(DateTime now, DateTime? lastMeasure, int frequencySeconds)
        {
            var baseTime = lastMeasure ?? now;
            if (baseTime > now)
            {
                baseTime = now;
            }
            return baseTime.AddSeconds(frequencySeconds);
        }
    }
}











