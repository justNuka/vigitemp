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
        private static readonly ConcurrentDictionary<string, SemaphoreSlim> _portLocks =
            new ConcurrentDictionary<string, SemaphoreSlim>(StringComparer.OrdinalIgnoreCase);
        private static int _gspRecoveryStartupResetDone;
        private readonly ConcurrentDictionary<string, GspMemoJob> _gspMemoJobs =
            new ConcurrentDictionary<string, GspMemoJob>(StringComparer.OrdinalIgnoreCase);
        private readonly ConcurrentQueue<GspMemoProcessingBatch> _gspMemoProcessingQueue =
            new ConcurrentQueue<GspMemoProcessingBatch>();
        private readonly SemaphoreSlim _gspMemoProcessingSignal = new SemaphoreSlim(0);
        private readonly ConcurrentDictionary<string, DateTime> _nextProbeDueBySerial =
            new ConcurrentDictionary<string, DateTime>(StringComparer.OrdinalIgnoreCase);
        private readonly ConcurrentDictionary<string, ModuleFailureState> _moduleFailures =
            new ConcurrentDictionary<string, ModuleFailureState>(StringComparer.OrdinalIgnoreCase);
        private readonly ConcurrentDictionary<string, DateTime> _moduleBackoffUntilUtc =
            new ConcurrentDictionary<string, DateTime>(StringComparer.OrdinalIgnoreCase);
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
        private readonly bool _logSettingsCache = GetSettingBool("Vigitemp.Alarms.LogSettingsCache", false);
        private readonly int _schedulerTickMs = GetSettingInt("Vigitemp.Scheduler.TickMs", 5000);
        private readonly bool _logScheduler = GetSettingBool("Vigitemp.Scheduler.Log", false);
        private readonly int _gspConfigFreeSlotMinSeconds = GetSettingInt("Vigitemp.Gsp.ConfigFreeSlotMinSeconds", 10);
        private readonly int _gspConfigCheckEverySuccessfulProbes = GetSettingInt("Vigitemp.Gsp.ConfigCheckEverySuccessfulProbes", 12);
        private readonly int _gspGraphDisplayEveryMeasures = GetSettingInt("Vigitemp.Gsp.GraphDisplayEveryMeasures", 0);
        private readonly int _gspConfigModuleBackoffSeconds = GetSettingInt("Vigitemp.Gsp.ConfigModuleBackoffSeconds", 300);
        private readonly int _gspMemoFreeSlotMinSeconds = GetSettingInt("Vigitemp.Gsp.MemoFreeSlotMinSeconds", 10);
        private readonly int _gspMemoMaxNormalProbes = GetSettingInt("Vigitemp.Gsp.MemoMaxNormalProbes", 20);
        private readonly int _portSaturationLogIntervalSeconds = GetSettingInt("Vigitemp.Scheduler.PortSaturationLogIntervalSeconds", 300);
        private readonly int _portSaturationBaselineProbeSeconds = GetSettingInt("Vigitemp.Scheduler.PortSaturationBaselineProbeSeconds", 4);
        private readonly bool _logMetrologyDetailed = GetSettingBool("Vigitemp.Metrology.LogDetailed", false);
        private readonly bool _offsetDisabledForPack;
        private readonly int _alarmPollSeconds = GetSettingInt("Vigitemp.Alarms.PollSeconds", 15);
        private readonly int _alarmPollMaxBatch = GetSettingInt("Vigitemp.Alarms.PollMaxBatch", 50);
        private readonly int _alarmPollServerId = GetSettingInt("Vigitemp.Alarms.PollServerId", 1);
        private readonly bool _alarmRetryUnsentEnabled = GetSettingBool("Vigitemp.Alarms.RetryUnsent.Enabled", true);
        private readonly int _alarmRetryUnsentIntervalSeconds = GetSettingInt("Vigitemp.Alarms.RetryUnsent.IntervalSeconds", 60);
        private readonly int _alarmRetryUnsentMaxBatch = GetSettingInt("Vigitemp.Alarms.RetryUnsent.MaxBatch", 50);
        private readonly int _alarmRetryUnsentMinAgeMinutes = GetSettingInt("Vigitemp.Alarms.RetryUnsent.MinAgeMinutes", 2);
        private readonly bool _statsMonthlyDispatchEnabled = GetSettingBool("Vigitemp.StatsMonthlyDispatch.Enabled", true);
        private readonly int _statsMonthlyDispatchServerId = GetSettingInt("Vigitemp.StatsMonthlyDispatch.ServerId", 1);
        private readonly int _statsMonthlyDispatchIntervalMinutes = GetSettingInt("Vigitemp.StatsMonthlyDispatch.IntervalMinutes", 60);
        private readonly Func<IReadOnlyList<int>> _activeWorkerIdsProvider;
        private string _lastAssignmentLogSignature = null;
        private string _lastPortOwnershipSignature = null;
        private readonly object _alarmPollLock = new object();
        private DateTime _lastAlarmPollUtc = DateTime.MinValue;
        private DateTime _lastAlarmRetryUtc = DateTime.MinValue;
        private int _alarmRetryInFlight = 0;
        private DateTime _lastStatsMonthlyDispatchAttemptUtc = DateTime.MinValue;
        private int _statsMonthlyDispatchInFlight = 0;
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
        private long _lastSchedulerHeartbeatUtcTicks;
        private long _lastMaintenanceHeartbeatUtcTicks;
        private Task _gspMemoProcessingTask;
        private volatile bool _stopRequested;
        private readonly ConcurrentDictionary<string, DateTime> _lastPortSaturationLogUtc =
            new ConcurrentDictionary<string, DateTime>(StringComparer.OrdinalIgnoreCase);

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
            public int? ModuleType { get; set; }
            public int? ManualWorkerId { get; set; }
            public bool ConfigurationOnly { get; set; }
            // NOTE: ConfigDirty est accede uniquement depuis les methodes qui tiennent
            // le SemaphoreSlim(1,1) — pas de volatile requis pour cette raison.
            public bool ConfigDirty { get; set; }
            public bool ConfigCheckDue { get; set; }
            public int ConfigConsecutiveFailures { get; set; }
            public DateTime? ConfigNextAttemptUtc { get; set; }
            public int SuccessfulProbeCountSinceConfigCheck { get; set; }
            public DateTime? LastConfigCheckUtc { get; set; }
            public int FrequencySeconds { get; set; }
            public DateTime? LastMeasure { get; set; }
            public DateTime NextDue { get; set; }
            public DateTime? CurrentCycleSchedulingAnchor { get; set; }
            public bool InProgress { get; set; }
            public int SuccessfulProbeCountTotal { get; set; }
        }

        private sealed class ModuleFailureState
        {
            public DateTime FirstFailureAt { get; set; }
            public DateTime LastFailureAt { get; set; }
            public int ConsecutiveFailures { get; set; }
            public bool AlarmRaised { get; set; }
            public HashSet<int> RaisedLieuIds { get; } = new HashSet<int>();
        }

        private sealed class GspMemoJob
        {
            public object SyncRoot { get; } = new object();
            public string Serial { get; set; }
            public int IdLieu { get; set; }
            public List<int> SpanIds { get; } = new List<int>();
            public int RequestedCount { get; set; }
            public int RequestSize { get; set; }
            public int CurrentOffset { get; set; }
            public int CompletedCount { get; set; }
            public int ScannedCount { get; set; }
            public int ConsecutiveFailures { get; set; }
            public DateTime CreatedAtUtc { get; set; }
            public DateTime? LastChunkAtUtc { get; set; }
            public bool InProgress { get; set; }
            public DateTime? RecoverFromProbeDateTime { get; set; }
            public DateTime? RecoverUntilProbeDateTime { get; set; }
            public int PendingBufferedBatches { get; set; }
            public bool RequestCompleted { get; set; }
            public bool Finalized { get; set; }
            public string FailureReason { get; set; }
        }

        private sealed class GspMemoProcessingBatch
        {
            public string Serial { get; set; }
            public int IdLieu { get; set; }
            public DateTime RecoverFromProbeDateTime { get; set; }
            public DateTime RecoverUntilProbeDateTime { get; set; }
            public List<GspMemoMeasurement> Measurements { get; } = new List<GspMemoMeasurement>();
        }

        public ThreadServeur(
            CancellationToken obj,
            int p_idServer,
            Func<IReadOnlyList<int>> activeWorkerIdsProvider = null,
            bool offsetDisabledForPack = false)
        {
            this.m_cts = obj;
            this._idServer = p_idServer;
            this._activeWorkerIdsProvider = activeWorkerIdsProvider;
            this._offsetDisabledForPack = offsetDisabledForPack;
            var nowTicks = DateTime.UtcNow.Ticks;
            Interlocked.Exchange(ref _lastSchedulerHeartbeatUtcTicks, nowTicks);
            Interlocked.Exchange(ref _lastMaintenanceHeartbeatUtcTicks, nowTicks);
        }

        public bool LogMetrologyDetailed => _logMetrologyDetailed;

        public DateTime LastSchedulerHeartbeatUtc
        {
            get
            {
                var ticks = Interlocked.Read(ref _lastSchedulerHeartbeatUtcTicks);
                return ticks <= 0 ? DateTime.MinValue : new DateTime(ticks, DateTimeKind.Utc);
            }
        }

        public bool EnqueueGspMemo(string serialNumber, int totalCount, int batchSize, int? startOffset = null)
        {
            if (VigitempServeur.InterrogationOnlyMode)
            {
                VigitempServeur.Log("[SERVER][MODE] memory request rejected: interrogation-only mode.");
                return false;
            }

            var serial = (serialNumber ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(serial))
            {
                return false;
            }

            if (!_schedules.Values.Any(s => !s.ConfigurationOnly && string.Equals(s.Serial, serial, StringComparison.OrdinalIgnoreCase)))
            {
                VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={serial} status=rejected reason=schedule-not-found");
                return false;
            }

            var schedule = _schedules.Values.FirstOrDefault(s => !s.ConfigurationOnly && string.Equals(s.Serial, serial, StringComparison.OrdinalIgnoreCase));

            var requestedCount = Math.Max(1, totalCount);
            var requestSize = Math.Min(
                Math.Max(1, batchSize),
                GspProtocol.MaxMemoryMeasurementsPerRequest);
            var safeOffset = Math.Max(0, startOffset ?? 0);

            _gspMemoJobs.AddOrUpdate(
                serial,
                _ => new GspMemoJob
                {
                    Serial = serial,
                    RequestedCount = requestedCount,
                    RequestSize = requestSize,
                    CurrentOffset = safeOffset,
                    CompletedCount = 0,
                    ConsecutiveFailures = 0,
                    CreatedAtUtc = DateTime.UtcNow,
                },
                (_, existing) =>
                {
                    existing.RequestedCount = requestedCount;
                    existing.RequestSize = requestSize;
                    existing.CurrentOffset = safeOffset;
                    existing.CompletedCount = 0;
                    existing.ConsecutiveFailures = 0;
                    existing.CreatedAtUtc = DateTime.UtcNow;
                    existing.LastChunkAtUtc = null;
                    existing.InProgress = false;
                    return existing;
                });

            if (schedule != null)
            {
                GetDatabase().setLieuGspRecoveryPending(schedule.IdLieu, true);
            }

            VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={serial} status=queued requested={requestedCount} offset={safeOffset}");
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
                var schedule = _schedules.Values.FirstOrDefault(s => !s.ConfigurationOnly && string.Equals(s.Serial, serial, StringComparison.OrdinalIgnoreCase));
                if (schedule != null)
                {
                    GetDatabase().setLieuGspRecoveryPending(schedule.IdLieu, false);
                }
                VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={serial} status=cancelled");
                return true;
            }

            return false;
        }

        public bool EnqueueGspRecovery(string serialNumber, DateTime recoverFromProbeDateTime, DateTime recoverUntilProbeDateTime, int expectedMissingCount)
        {
            if (VigitempServeur.InterrogationOnlyMode)
            {
                VigitempServeur.Log("[SERVER][MODE] memory recovery rejected: interrogation-only mode.");
                return false;
            }

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
            var requestSize = Math.Min(
                requestedCount,
                GspProtocol.MaxMemoryMeasurementsPerRequest);
            _gspMemoJobs.AddOrUpdate(
                serial,
                _ => new GspMemoJob
                {
                    Serial = serial,
                    RequestedCount = requestedCount,
                    RequestSize = requestSize,
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
                    existing.RequestSize = requestSize;
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

            VigitempServeur.Log($"[SONDE][RECOVERY] serial={serial} status=queued from={recoverFromProbeDateTime:O} until={recoverUntilProbeDateTime:O} expectedMissingCount={requestedCount}");
            return true;
        }

        public bool RegisterGspRecoveryGap(int idLieu, string serialNumber, DateTime recoverFromProbeDateTime, DateTime recoverUntilProbeDateTime)
        {
            var serial = (serialNumber ?? string.Empty).Trim();
            if (idLieu <= 0 || string.IsNullOrWhiteSpace(serial) || recoverUntilProbeDateTime <= recoverFromProbeDateTime)
            {
                return false;
            }

            var saved = GetDatabase().addGspRecoverySpan(idLieu, serial, recoverFromProbeDateTime, recoverUntilProbeDateTime);
            if (!saved)
            {
                return false;
            }

            GetDatabase().setLieuGspRecoveryPending(idLieu, true);
            VigitempServeur.Log($"[SONDE][RECOVERY] serial={serial} status=span-recorded idLieu={idLieu} from={recoverFromProbeDateTime:O} until={recoverUntilProbeDateTime:O}");
            return true;
        }

        private async Task RunGspMemoProcessingLoopAsync()
        {
            while (!_stopRequested && !m_cts.IsCancellationRequested)
            {
                try
                {
                    await _gspMemoProcessingSignal.WaitAsync(1000, m_cts);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch
                {
                    // ignore and try to drain queue below
                }

                while (_gspMemoProcessingQueue.TryDequeue(out var batch))
                {
                    try
                    {
                        ProcessBufferedGspMemoBatch(batch);
                    }
                    catch (Exception ex)
                    {
                        VigitempServeur.Log($"[SONDE][MEMO-PROC] serial={batch?.Serial} status=error error={ex.Message}");
                    }
                }
            }
        }

        private void ProcessBufferedGspMemoBatch(GspMemoProcessingBatch batch)
        {
            if (batch == null || string.IsNullOrWhiteSpace(batch.Serial))
            {
                return;
            }

            var insertedCount = 0;
            foreach (var measurement in batch.Measurements)
            {
                if (!measurement.ProbeDateTime.HasValue || !measurement.Temperature.HasValue)
                {
                    continue;
                }

                if (double.IsNaN(measurement.Temperature.Value)
                    || double.IsInfinity(measurement.Temperature.Value)
                    || Math.Abs(measurement.Temperature.Value) > 1000d)
                {
                    VigitempServeur.Log(
                        $"[SONDE][MEMO-PROC] serial={batch.Serial} status=discarded reason=invalid-value value={measurement.Temperature.Value.ToString(CultureInfo.InvariantCulture)}");
                    continue;
                }

                var measurementDate = measurement.ProbeDateTime.Value;
                if (measurementDate <= batch.RecoverFromProbeDateTime || measurementDate >= batch.RecoverUntilProbeDateTime)
                {
                    continue;
                }

                if (GetDatabase().AddHistoricalMesureIfMissing(
                    batch.Serial,
                    Math.Round(measurement.Temperature.Value, 2, MidpointRounding.AwayFromZero),
                    "C",
                    measurement.Temperature.Value.ToString("0.########", CultureInfo.InvariantCulture),
                    measurementDate))
                {
                    insertedCount++;
                }
            }

            if (_gspMemoJobs.TryGetValue(batch.Serial, out var job))
            {
                lock (job.SyncRoot)
                {
                    job.CompletedCount += insertedCount;
                    job.PendingBufferedBatches = Math.Max(0, job.PendingBufferedBatches - 1);
                }

                VigitempServeur.Log($"[SONDE][MEMO-PROC] serial={batch.Serial} status=batch inserted={insertedCount} completed={job.CompletedCount} pendingBuffers={job.PendingBufferedBatches}");
                TryFinalizeGspRecoveryJob(job, "processor");
            }
        }

        private bool TryQueuePendingGspRecovery(SondeScheduleInfo row, SensorSchedule schedule, DateTime now)
        {
            if (row == null || schedule == null || row.ConfigurationOnly || !row.GspRecoveryPending)
            {
                return false;
            }

            var serial = (row.SondeNumeroSerie ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(serial))
            {
                return false;
            }

            if (_gspMemoJobs.ContainsKey(serial))
            {
                return false;
            }

            if (GetDatabase().hasBlockingGspRecoveryAlarm(row.IdLieu))
            {
                if (_logScheduler)
                {
                    VigitempServeur.Log($"[SONDE][RECOVERY] serial={serial} status=deferred reason=blocking-alarm");
                }
                return false;
            }

            var spans = GetDatabase().getPendingGspRecoverySpans(row.IdLieu, serial);
            if (spans == null || spans.Count == 0)
            {
                GetDatabase().setLieuGspRecoveryPending(row.IdLieu, false);
                if (_logScheduler)
                {
                    VigitempServeur.Log($"[SONDE][RECOVERY] serial={serial} status=cleared reason=no-pending-span");
                }
                return false;
            }

            var recoverFrom = spans.Min(s => s.RecoverFromProbeDateTime);
            var recoverUntil = spans.Max(s => s.RecoverUntilProbeDateTime);
            var frequencySeconds = Math.Max(1, row.FrequenceSecondes);
            var currentOffset = ComputeGspMemoOffset(now, recoverUntil, frequencySeconds);
            var requestedCount = ComputeGspMemoRequestedCount(recoverFrom, recoverUntil, frequencySeconds);
            var requestSize = Math.Min(
                requestedCount,
                GspProtocol.MaxMemoryMeasurementsPerRequest);

            var spanIds = spans.Select(s => s.Id).Where(id => id > 0).Distinct().ToList();
            if (spanIds.Count == 0)
            {
                return false;
            }

            if (!GetDatabase().setGspRecoverySpansStatus(spanIds, "EN_COURS", null, incrementAttempts: true))
            {
                VigitempServeur.Log($"[SONDE][RECOVERY] serial={serial} status=deferred reason=claim-failed");
                return false;
            }

            var job = new GspMemoJob
            {
                Serial = serial,
                IdLieu = row.IdLieu,
                RequestedCount = requestedCount,
                RequestSize = requestSize,
                CurrentOffset = currentOffset,
                CompletedCount = 0,
                ScannedCount = 0,
                ConsecutiveFailures = 0,
                CreatedAtUtc = DateTime.UtcNow,
                RecoverFromProbeDateTime = recoverFrom,
                RecoverUntilProbeDateTime = recoverUntil,
            };
            job.SpanIds.AddRange(spanIds);
            _gspMemoJobs[serial] = job;

            SensorGSP.PrimeLastSuccessfulProbeDateTime(serial, recoverUntil);

            VigitempServeur.Log(
                $"[SONDE][RECOVERY] serial={serial} status=queued spans={spanIds.Count} idLieu={row.IdLieu} from={recoverFrom:O} until={recoverUntil:O} requested={requestedCount} offset={currentOffset}");
            return true;
        }

        private static int ComputeGspMemoOffset(DateTime serverNow, DateTime recoverUntilProbeDateTime, int frequencySeconds)
        {
            var gapSeconds = Math.Max(0d, (serverNow - recoverUntilProbeDateTime).TotalSeconds);
            var offset = (int)Math.Floor(gapSeconds / Math.Max(1, frequencySeconds));
            return Math.Max(0, offset - 1);
        }

        private static int ComputeGspMemoRequestedCount(DateTime recoverFromProbeDateTime, DateTime recoverUntilProbeDateTime, int frequencySeconds)
        {
            var spanSeconds = Math.Max(0d, (recoverUntilProbeDateTime - recoverFromProbeDateTime).TotalSeconds);
            var baseCount = (int)Math.Ceiling(spanSeconds / Math.Max(1, frequencySeconds));
            return Math.Max(1, baseCount + 4);
        }

        private void MarkGspRecoveryJobCompleted(GspMemoJob job, string origin)
        {
            if (job == null)
            {
                return;
            }

            lock (job.SyncRoot)
            {
                if (job.RecoverUntilProbeDateTime.HasValue && job.ScannedCount < job.RequestedCount)
                {
                    VigitempServeur.Log(
                        $"[SONDE][RECOVERY] serial={job.Serial} status=incomplete origin={origin} scanned={job.ScannedCount}/{job.RequestedCount}");
                    return;
                }

                job.RequestCompleted = true;
            }

            TryFinalizeGspRecoveryJob(job, origin);
        }

        private void MarkGspRecoveryJobFailed(GspMemoJob job, string reason, string origin)
        {
            if (job == null)
            {
                return;
            }

            lock (job.SyncRoot)
            {
                job.RequestCompleted = true;
                job.FailureReason = string.IsNullOrWhiteSpace(reason) ? "unknown-error" : reason.Trim();
            }

            TryFinalizeGspRecoveryJob(job, origin);
        }

        private void TryFinalizeGspRecoveryJob(GspMemoJob job, string origin)
        {
            if (job == null || job.SpanIds.Count == 0)
            {
                return;
            }

            bool shouldFinalize;
            bool success;
            string failureReason;

            lock (job.SyncRoot)
            {
                shouldFinalize = !job.Finalized && job.RequestCompleted && job.PendingBufferedBatches <= 0;
                success = string.IsNullOrWhiteSpace(job.FailureReason);
                failureReason = job.FailureReason;
                if (shouldFinalize)
                {
                    job.Finalized = true;
                }
            }

            if (!shouldFinalize)
            {
                return;
            }

            if (success)
            {
                GetDatabase().setGspRecoverySpansStatus(job.SpanIds, "TRAITEE", null, incrementAttempts: false);
            }
            else
            {
                GetDatabase().setGspRecoverySpansStatus(job.SpanIds, "ERREUR", failureReason, incrementAttempts: false);
            }

            var hasPending = GetDatabase().hasPendingGspRecoverySpans(job.IdLieu, job.Serial);
            GetDatabase().setLieuGspRecoveryPending(job.IdLieu, hasPending);
            _gspMemoJobs.TryRemove(job.Serial, out _);

            VigitempServeur.Log(
                $"[SONDE][RECOVERY] serial={job.Serial} status={(success ? "completed" : "failed")} origin={origin} inserted={job.CompletedCount} scanned={job.ScannedCount} pending={(hasPending ? 1 : 0)} reason={(string.IsNullOrWhiteSpace(failureReason) ? "-" : failureReason)}");
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
            // Le provider concret est selectionne par DatabaseFactory.
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
                        VigitempServeur.Log($"[CACHE][LIEU-SETTINGS] idLieu={idLieu} status=db-null");
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
                $"[CACHE][LIEU-SETTINGS] idLieu={idLieu} status={source}" +
                (string.Equals(source, "db-refresh", StringComparison.OrdinalIgnoreCase)
                    ? $" retardBasMin={settings.RetardAlarmeBasMinutes} retardHautMin={settings.RetardAlarmeHautMinutes} retardNonReponseMin={settings.RetardNonReponseMinutes}"
                    : string.Empty)
            );
        }

        private void InvalidateLieuSettingsCache(int idLieu, string reason)
        {
            if (idLieu <= 0)
            {
                return;
            }

            if (_lieuSettingsCache.TryRemove(idLieu, out _))
            {
                if (_logSettingsCache)
                {
                    VigitempServeur.Log($"[CACHE][LIEU-SETTINGS] idLieu={idLieu} status=invalidated reason={reason}");
                }
            }
        }

        private void EnsureAlarmCursorInitialized()
        {
            if (_idServer != _alarmPollServerId)
            {
                _alarmCursorInitialized = true;
                return;
            }

            if (_alarmCursorInitialized)
            {
                return;
            }

            try
            {
                var lastId = GetDatabase().getLastAlarmIdByServeur(_idServer);
                _lastAlarmIdSeen = Math.Max(0, lastId);
                _alarmCursorInitialized = true;
                VigitempServeur.Log($"[ALARM][POLL] status=init lastAlarmId={_lastAlarmIdSeen} server={_idServer}");
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("[ALARM][POLL] status=init-error error=" + ex.Message);
                // _alarmCursorInitialized reste false → skip poll ce tick
            }
        }

        private void EnsureAlarmEndCursorInitialized()
        {
            if (_idServer != _alarmPollServerId)
            {
                _lastAlarmEndPollLocal = DateTime.Now;
                return;
            }

            if (_lastAlarmEndPollLocal != DateTime.MinValue)
            {
                return;
            }

            _lastAlarmEndPollLocal = DateTime.Now;
            VigitempServeur.Log($"[ALARM][END-POLL] status=init since={_lastAlarmEndPollLocal:O} server={_idServer}");
        }

        private async Task PollNewAlarmsAsync()
        {
            if (_idServer != _alarmPollServerId)
            {
                return;
            }

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
            if (newAlarms != null && newAlarms.Count > 0)
            {
                var maxId = _lastAlarmIdSeen;
                foreach (var alarm in newAlarms)
                {
                    if (alarm != null && alarm.IdAlarme > maxId)
                    {
                        maxId = alarm.IdAlarme;
                    }
                }
                _lastAlarmIdSeen = maxId;

                var mailedAlarmIds = await AlarmWebNotifier.NotifyAlarmBatchAsync(newAlarms);
                if (mailedAlarmIds != null)
                {
                    foreach (var alarmId in mailedAlarmIds)
                    {
                        if (alarmId > 0)
                        {
                            GetDatabase().markAlarmMailSent(alarmId);
                        }
                    }
                }
            }

            await RetryUnsentOpenAlarmsIfNeededAsync(nowUtc);

            // Legacy agent endpoint (/alarm?action=show) is deprecated.
            // Agent notifications now go through web dispatch (/api/alarmes/dispatch -> /notify).
        }

        private async Task RetryUnsentOpenAlarmsIfNeededAsync(DateTime nowUtc)
        {
            if (_idServer != _alarmPollServerId)
            {
                return;
            }

            var retryIntervalSeconds = Math.Max(15, _alarmRetryUnsentIntervalSeconds);
            if (_lastAlarmRetryUtc != DateTime.MinValue &&
                (nowUtc - _lastAlarmRetryUtc).TotalSeconds < retryIntervalSeconds)
            {
                return;
            }

            if (Interlocked.CompareExchange(ref _alarmRetryInFlight, 1, 0) != 0)
            {
                return;
            }

            _lastAlarmRetryUtc = nowUtc;
            try
            {
                var maxBatch = Math.Max(1, _alarmRetryUnsentMaxBatch);
                await AlarmWebNotifier.ProcessPendingAlarmEmailsAsync(maxBatch);

                if (!_alarmRetryUnsentEnabled)
                {
                    return;
                }

                var maxStartLocalTime = DateTime.Now.AddMinutes(-Math.Max(0, _alarmRetryUnsentMinAgeMinutes));
                var pending = GetDatabase().getUnsentOpenAlarms(maxBatch, maxStartLocalTime);
                if (pending == null || pending.Count == 0)
                {
                    return;
                }

                VigitempServeur.Log(
                    $"Alarm retry unsent: server={_idServer} pending={pending.Count} maxBatch={maxBatch} minAgeMin={Math.Max(0, _alarmRetryUnsentMinAgeMinutes)}");

                var mailedAlarmIds = await AlarmWebNotifier.NotifyAlarmBatchAsync(pending);
                if (mailedAlarmIds == null || mailedAlarmIds.Count == 0)
                {
                    return;
                }

                foreach (var alarmId in mailedAlarmIds)
                {
                    if (alarmId <= 0)
                    {
                        continue;
                    }

                    GetDatabase().markAlarmMailSent(alarmId);
                }

                VigitempServeur.Log(
                    $"Alarm retry unsent: marked mailed ids=[{string.Join(",", mailedAlarmIds)}]");
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("Alarm retry unsent error: " + ex.Message);
            }
            finally
            {
                Interlocked.Exchange(ref _alarmRetryInFlight, 0);
            }
        }

        private async Task PollEndedAlarmsAsync()
        {
            if (_idServer != _alarmPollServerId)
            {
                return;
            }

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

                filtered.Add(alarm);
            }

            if (filtered.Count == 0)
            {
                return;
            }

            VigitempServeur.Log(
                $"Alarm ended dispatch: {filtered.Count} alarme(s) ids=[{string.Join(",", filtered.Select(a => a.IdAlarme))}]");

            // Legacy agent endpoint (/alarm?action=hide) is deprecated.
            // End-of-alarm handling is now done by web dispatch and email flow.

            var dispatchedAlarmIds = await AlarmWebNotifier.NotifyEndedAlarmBatchAsync(filtered);
            foreach (var alarmId in dispatchedAlarmIds)
            {
                if (alarmId <= 0)
                {
                    continue;
                }

                if (GetDatabase().markAlarmEndMailSent(alarmId))
                {
                    _endedAlarmDispatchById[alarmId] = pollNow;
                }
            }
        }

        public void Start()
        {
            VigitempServeur.Log("Starting Thread#" + _idServer + "...");
            if (!VigitempServeur.InterrogationOnlyMode)
            {
                AlarmWebNotifier.ValidateConfig();
            }
            _stopRequested = false;
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

            if (!VigitempServeur.InterrogationOnlyMode &&
                Interlocked.CompareExchange(ref _gspRecoveryStartupResetDone, 1, 0) == 0)
            {
                try
                {
                    var resetCount = GetDatabase().resetInProgressGspRecoverySpans();
                    VigitempServeur.Log($"[SONDE][RECOVERY] startup-reset worker={_idServer} spans={resetCount}");
                }
                catch (Exception ex)
                {
                    Interlocked.Exchange(ref _gspRecoveryStartupResetDone, 0);
                    VigitempServeur.Log("[SONDE][RECOVERY] erreur reset spans au demarrage: " + ex.Message);
                }
            }

            RefreshSchedule();
            if (!VigitempServeur.InterrogationOnlyMode)
            {
                _gspMemoProcessingTask = Task.Run(async () => await RunGspMemoProcessingLoopAsync());
            }

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
            _stopRequested = true;
            try
            {
                _gspMemoProcessingSignal.Release();
            }
            catch
            {
                // ignore
            }
            try
            {
                _gspMemoProcessingTask?.Wait(TimeSpan.FromSeconds(5));
            }
            catch
            {
                // ignore
            }
            finally
            {
                _gspMemoProcessingTask = null;
            }

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
            Interlocked.Exchange(ref _lastSchedulerHeartbeatUtcTicks, DateTime.UtcNow.Ticks);
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

                // Prioritize explicit GSP config pushes before any normal probe so that
                // the next measurement is taken with the expected runtime parameters.
                // Process at most one push per tick so a dirty backlog cannot starve TEMP probes.
                if (!VigitempServeur.InterrogationOnlyMode)
                {
                    await ProcessPendingGspConfigurationAsync(prioritizeDirtyPushes: true);
                }
                if (m_cts.IsCancellationRequested)
                {
                    return;
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
                    .Where(s => !s.InProgress && !s.ConfigurationOnly && IsScheduleDue(s, now))
                    .OrderByDescending(ComputePriority)
                    .ThenBy(s => s.FrequencySeconds)
                    .ThenBy(s => s.NextDue)
                    .ToList();

                LogSaturatedPorts(now, due);

                var normalGspProbesSinceMemo = 0;
                foreach (var schedule in due)
                {
                    if (!GetDatabase().isSondeAvailableForSurveillance(schedule.IdLieu, schedule.Serial))
                    {
                        _schedules.TryRemove(schedule.IdLieu, out _);
                        VigitempServeur.Log(
                            $"[SONDE][SKIP] idLieu={schedule.IdLieu} serial={schedule.Serial} " +
                            "reason=surveillance-suspended-or-metrology");
                        continue;
                    }

                    schedule.InProgress = true;
                    schedule.CurrentCycleSchedulingAnchor = null;
                    try
                    {
                        if (IsModulePortUnavailable(schedule))
                        {
                            HandleModuleProbeFailure(schedule, "port-missing");
                            continue;
                        }

                        var success = false;
                        await RunWithPortLockAsync(schedule.Port, schedule.Serial, async () =>
                        {
                            success = await InterrogateSchedule(schedule);
                        });

                        if (success)
                        {
                            ClearModuleFailure(schedule);
                        }
                    }
                    catch (Exception ex)
                    {
                        if (IsPortOpenFailure(ex))
                        {
                            HandleModuleProbeFailure(schedule, ex.GetType().Name);
                        }
                        VigitempServeur.Log("ThreadServeur.Scheduler error: " + ex);
                    }
                    finally
                    {
                        var schedulingAnchor = schedule.CurrentCycleSchedulingAnchor ?? DateTime.Now;
                        schedule.LastMeasure = schedulingAnchor;
                        SetScheduleNextDue(schedule, schedule.LastMeasure.Value.AddSeconds(schedule.FrequencySeconds));
                        schedule.CurrentCycleSchedulingAnchor = null;
                        schedule.InProgress = false;
                    }

                    if (!VigitempServeur.InterrogationOnlyMode && IsGspSchedule(schedule))
                    {
                        normalGspProbesSinceMemo++;
                        if (_gspMemoMaxNormalProbes > 0 &&
                            normalGspProbesSinceMemo >= _gspMemoMaxNormalProbes)
                        {
                            await ProcessPendingGspMemoBatchAsync(
                                forceForFairness: true,
                                preferredPort: schedule.Port);
                            normalGspProbesSinceMemo = 0;
                        }
                    }
                }

                if (!VigitempServeur.InterrogationOnlyMode)
                {
                    await ProcessPendingGspConfigurationAsync(prioritizeDirtyPushes: false);
                    await ProcessPendingGspMemoBatchAsync();
                    await PollNewAlarmsAsync();
                    await PollEndedAlarmsAsync();
                }
            }
            finally
            {
                if (acquired)
                {
                    semaphore.Release();
                }
            }
        }

        private async Task<bool> ProcessPendingGspConfigurationAsync(bool prioritizeDirtyPushes)
        {
            if (VigitempServeur.InterrogationOnlyMode)
            {
                return false;
            }

            var now = DateTime.Now;
            IEnumerable<SensorSchedule> candidates = _schedules.Values
                .Where(s => s != null &&
                            !s.InProgress &&
                            IsGspSchedule(s) &&
                            IsGspConfigAttemptDue(s, now) &&
                            !IsModuleBackoffActive(s, now));

            SensorSchedule schedule;
            DateTime? nextDue = null;

            if (prioritizeDirtyPushes)
            {
                schedule = candidates
                    .Where(s => s.ConfigDirty)
                    .OrderBy(s => IsScheduleDue(s, now) ? 0 : 1)
                    .ThenBy(s => s.NextDue)
                    .FirstOrDefault();
            }
            else
            {
                schedule = candidates
                    .Where(s => (s.ConfigDirty || s.ConfigCheckDue) && !IsScheduleDue(s, now))
                    .OrderBy(s => s.NextDue)
                    .FirstOrDefault(s => HasFreePortWindow(s.Port, _gspConfigFreeSlotMinSeconds, now, out _));
            }

            if (schedule == null)
            {
                return false;
            }

            if (schedule.ConfigurationOnly)
            {
                if (!schedule.ConfigDirty ||
                    !GspPendingConfigurationReader.IsStillEligible(schedule.IdLieu, schedule.Serial))
                {
                    _schedules.TryRemove(schedule.IdLieu, out _);
                    _sondeMetrologyCache.TryRemove(schedule.Serial, out _);
                    _nextProbeDueBySerial.TryRemove(schedule.Serial, out _);
                    VigitempServeur.Log(
                        $"[SONDE][CFG-JOB] serial={schedule.Serial} status=deferred " +
                        "reason=configuration-only-no-longer-eligible");
                    return false;
                }

                // Ne jamais reutiliser un cache peuple par un ancien schedule de Surveillance :
                // le provider metrologie doit relire le dernier ajustage, y compris Coeff_X2.
                _sondeMetrologyCache.TryRemove(schedule.Serial, out _);
                InvalidateLieuSettingsCache(schedule.IdLieu, "configuration-only");
            }
            else if (!GetDatabase().isSondeAvailableForSurveillance(schedule.IdLieu, schedule.Serial))
            {
                _schedules.TryRemove(schedule.IdLieu, out _);
                VigitempServeur.Log(
                    $"[SONDE][CFG-JOB] serial={schedule.Serial} status=deferred " +
                    "reason=surveillance-suspended-or-metrology");
                return false;
            }

            if (!schedule.ConfigurationOnly && GetDatabase().isSondeInNoResponse(schedule.IdLieu, schedule.Serial))
            {
                schedule.ConfigNextAttemptUtc = DateTime.UtcNow.AddSeconds(
                    Math.Max(10, Math.Min(60, schedule.FrequencySeconds)));
                VigitempServeur.Log(
                    $"[SONDE][CFG-JOB] serial={schedule.Serial} status=deferred " +
                    "reason=no-response configPending=true");
                return false;
            }

            if (!prioritizeDirtyPushes && !HasFreePortWindow(schedule.Port, _gspConfigFreeSlotMinSeconds, now, out var computedNextDue))
            {
                nextDue = computedNextDue;
                if (_logScheduler)
                {
                    VigitempServeur.Log(
                        $"[SONDE][CFG-JOB] serial={schedule.Serial} status=deferred reason=no-free-slot nextDue={FormatDateForLog(nextDue.Value)}");
                }
                return false;
            }

            schedule.InProgress = true;
            try
            {
                var fullConfiguration = schedule.ConfigDirty;
                var mode = fullConfiguration ? "push" : "verify";
                VigitempServeur.Log(
                    $"[SONDE][CFG-JOB] serial={schedule.Serial} status=start mode={mode} port={schedule.Port} priority={(prioritizeDirtyPushes ? "dirty-first" : "free-slot")} minWindowSec={_gspConfigFreeSlotMinSeconds} nextDue={FormatDateForLog(nextDue)} dirty={schedule.ConfigDirty} checkDue={schedule.ConfigCheckDue} configurationOnly={schedule.ConfigurationOnly}");

                var synchronized = false;
                await RunWithPortLockAsync(schedule.Port, schedule.Serial, async () =>
                {
                    var sensor = new SensorGSP(this, schedule.Port, schedule.Serial, schedule.Adresse, schedule.FrequencySeconds, true);
                    synchronized = await sensor.SynchronizeConfigurationOnlyAsync(fullConfiguration);
                });

                if (synchronized)
                {
                    var wasDirty = schedule.ConfigDirty;
                    schedule.ConfigDirty = false;
                    schedule.ConfigCheckDue = false;
                    schedule.SuccessfulProbeCountSinceConfigCheck = 0;
                    schedule.LastConfigCheckUtc = DateTime.UtcNow;
                    schedule.ConfigConsecutiveFailures = 0;
                    schedule.ConfigNextAttemptUtc = null;
                    if (wasDirty)
                    {
                        GetDatabase().setLieuInfosModifiees(schedule.IdLieu, false);
                    }
                    if (schedule.ConfigurationOnly)
                    {
                        _schedules.TryRemove(schedule.IdLieu, out _);
                        _sondeMetrologyCache.TryRemove(schedule.Serial, out _);
                        _nextProbeDueBySerial.TryRemove(schedule.Serial, out _);
                    }
                    VigitempServeur.Log($"[SONDE][CFG-JOB] serial={schedule.Serial} status=success mode={mode} configurationOnly={schedule.ConfigurationOnly}");
                }
                else
                {
                    RegisterGspConfigFailure(schedule, mode + ":not-synchronized");
                    VigitempServeur.Log($"[SONDE][CFG-JOB] serial={schedule.Serial} status=failed mode={mode}");
                }
            }
            catch (Exception ex)
            {
                RegisterGspConfigFailure(schedule, ex.Message);
                VigitempServeur.Log($"[SONDE][CFG-JOB] serial={schedule.Serial} status=error error={ex.Message}");
            }
            finally
            {
                schedule.InProgress = false;
            }

            return true;
        }

        private async Task ProcessPendingGspMemoBatchAsync(
            bool forceForFairness = false,
            string preferredPort = null)
        {
            if (VigitempServeur.InterrogationOnlyMode)
            {
                return;
            }

            var candidates = _gspMemoJobs.Values
                .Where(j => j != null && !j.InProgress);

            if (!string.IsNullOrWhiteSpace(preferredPort))
            {
                var normalizedPreferredPort = NormalizePortLockKey(preferredPort);
                candidates = candidates.Where(j =>
                {
                    var candidateSchedule = _schedules.Values.FirstOrDefault(s =>
                        string.Equals(s.Serial, j.Serial, StringComparison.OrdinalIgnoreCase));
                    return candidateSchedule != null &&
                           string.Equals(
                               NormalizePortLockKey(candidateSchedule.Port),
                               normalizedPreferredPort,
                               StringComparison.OrdinalIgnoreCase);
                });
            }

            var job = candidates
                .OrderBy(j => j.LastChunkAtUtc ?? j.CreatedAtUtc)
                .FirstOrDefault();

            if (job == null)
            {
                return;
            }

            var schedule = _schedules.Values.FirstOrDefault(s =>
                !s.ConfigurationOnly &&
                string.Equals(s.Serial, job.Serial, StringComparison.OrdinalIgnoreCase));
            if (schedule == null)
            {
                if (job.SpanIds.Count > 0)
                {
                    MarkGspRecoveryJobFailed(job, "schedule-not-found", "request");
                }
                else
                {
                    _gspMemoJobs.TryRemove(job.Serial, out _);
                }
                VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={job.Serial} status=aborted reason=schedule-not-found");
                return;
            }

            if (!GetDatabase().isSondeAvailableForSurveillance(schedule.IdLieu, schedule.Serial))
            {
                _schedules.TryRemove(schedule.IdLieu, out _);
                if (_logScheduler)
                {
                    VigitempServeur.Log(
                        $"[SONDE][MEMO-JOB] serial={job.Serial} status=deferred " +
                        "reason=surveillance-suspended-or-metrology");
                }
                return;
            }

            if (GetDatabase().hasBlockingGspRecoveryAlarm(schedule.IdLieu))
            {
                if (_logScheduler)
                {
                    VigitempServeur.Log(
                        $"[SONDE][MEMO-JOB] serial={job.Serial} status=deferred reason=blocking-alarm");
                }
                return;
            }

            var remaining = Math.Max(0, job.RequestedCount - job.CompletedCount);
            if (!job.RecoverUntilProbeDateTime.HasValue && remaining <= 0)
            {
                _gspMemoJobs.TryRemove(job.Serial, out _);
                GetDatabase().setLieuGspRecoveryPending(schedule.IdLieu, false);
                VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={job.Serial} status=completed requested={job.RequestedCount} completed={job.CompletedCount} offset={job.CurrentOffset}");
                return;
            }

            var count = job.RecoverUntilProbeDateTime.HasValue
                ? Math.Min(
                    GspProtocol.MaxMemoryMeasurementsPerRequest,
                    Math.Max(1, job.RequestedCount - job.ScannedCount))
                : Math.Min(job.RequestSize, remaining);

            if (!GspProtocol.TryNormalizeMemoryRequest(
                    count,
                    job.CurrentOffset,
                    out var limitedCount,
                    out var limitedOffset))
            {
                var reason =
                    $"memory-range-outside-eeprom:offset={job.CurrentOffset}:capacity={GspProtocol.MaxMemoryMeasurementCount}";
                if (job.SpanIds.Count > 0)
                {
                    MarkGspRecoveryJobFailed(job, reason, "request");
                }
                else
                {
                    _gspMemoJobs.TryRemove(job.Serial, out _);
                    GetDatabase().setLieuGspRecoveryPending(schedule.IdLieu, false);
                }

                VigitempServeur.Log(
                    $"[SONDE][MEMO-JOB] serial={job.Serial} status=failed reason=eeprom-range-exhausted requested={count} offset={job.CurrentOffset} capacity={GspProtocol.MaxMemoryMeasurementCount}");
                return;
            }

            if (limitedCount != count || limitedOffset != job.CurrentOffset)
            {
                VigitempServeur.Log(
                    $"[SONDE][MEMO-JOB] serial={job.Serial} status=limited requested={count} offset={job.CurrentOffset} count={limitedCount} safeOffset={limitedOffset} capacity={GspProtocol.MaxMemoryMeasurementCount}");
            }

            count = limitedCount;
            job.CurrentOffset = limitedOffset;
            var minWindowSeconds = EstimateGspMemoFreeSlotSeconds();
            var hasFreeWindow = HasFreePortWindow(schedule.Port, minWindowSeconds, DateTime.Now, out var nextDue);
            if (!hasFreeWindow && !forceForFairness)
            {
                job.LastChunkAtUtc = DateTime.UtcNow;
                if (_logScheduler)
                {
                    VigitempServeur.Log(
                        $"[SONDE][MEMO-JOB] serial={job.Serial} status=deferred reason=no-free-slot count={count} minWindowSec={minWindowSeconds} nextDue={FormatDateForLog(nextDue)}");
                }
                return;
            }

            if (!hasFreeWindow && forceForFairness)
            {
                VigitempServeur.Log(
                    $"[SONDE][MEMO-JOB] serial={job.Serial} status=forced reason=fairness port={schedule.Port} afterNormalProbes={_gspMemoMaxNormalProbes} count={count} nextDue={FormatDateForLog(nextDue)}");
            }

            job.InProgress = true;
            try
            {
                Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
                VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={job.Serial} status=chunk-start count={count} offset={job.CurrentOffset}");
                GspMemoResponse memo = null;
                await RunWithPortLockAsync(schedule.Port, schedule.Serial, async () =>
                {
                    var sensor = new SensorGSP(this, schedule.Port, schedule.Serial, schedule.Adresse, schedule.FrequencySeconds, false);
                    memo = await sensor.ReadMemoryChunkAsync(count, job.CurrentOffset);
                });
                if (memo == null)
                {
                    job.ConsecutiveFailures++;
                    if (job.ConsecutiveFailures >= 3)
                    {
                        if (job.SpanIds.Count > 0)
                        {
                            MarkGspRecoveryJobFailed(job, "memo-timeout", "request");
                        }
                        else
                        {
                            _gspMemoJobs.TryRemove(job.Serial, out _);
                            GetDatabase().setLieuGspRecoveryPending(schedule.IdLieu, false);
                        }
                        VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={job.Serial} status=failed failures={job.ConsecutiveFailures}");
                    }
                    else
                    {
                        VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={job.Serial} status=retry failures={job.ConsecutiveFailures} nextOffset={job.CurrentOffset}");
                    }
                    return;
                }

                var returnedCount = memo.ReturnedCount ?? memo.Measurements.Count;
                var receivedMeasurementCount = job.RecoverUntilProbeDateTime.HasValue
                    ? memo.Measurements.Count
                    : Math.Max(0, returnedCount);
                var effectiveOffset = memo.Offset ?? job.CurrentOffset;
                job.LastChunkAtUtc = DateTime.UtcNow;
                job.ConsecutiveFailures = 0;
                job.ScannedCount += receivedMeasurementCount;

                if (receivedMeasurementCount <= 0)
                {
                    if (job.SpanIds.Count > 0)
                    {
                        MarkGspRecoveryJobFailed(
                            job,
                            $"memory-range-incomplete:scanned={job.ScannedCount}/{job.RequestedCount}",
                            "request:no-more-data");
                    }
                    else
                    {
                        _gspMemoJobs.TryRemove(job.Serial, out _);
                        GetDatabase().setLieuGspRecoveryPending(schedule.IdLieu, false);
                    }
                    VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={job.Serial} status={(job.SpanIds.Count > 0 ? "failed" : "completed")} requested={job.RequestedCount} completed={job.CompletedCount} scanned={job.ScannedCount} offset={job.CurrentOffset} reason=no-more-data");
                    return;
                }

                var insertedThisBatch = 0;
                if (job.RecoverUntilProbeDateTime.HasValue)
                {
                    var fromDate = job.RecoverFromProbeDateTime;
                    var untilDate = job.RecoverUntilProbeDateTime.Value;
                    var batch = new GspMemoProcessingBatch
                    {
                        Serial = job.Serial,
                        IdLieu = schedule.IdLieu,
                        RecoverFromProbeDateTime = fromDate.GetValueOrDefault(DateTime.MinValue),
                        RecoverUntilProbeDateTime = untilDate,
                    };

                    foreach (var measurement in memo.Measurements)
                    {
                        batch.Measurements.Add(measurement);
                    }

                    if (batch.Measurements.Count > 0)
                    {
                        lock (job.SyncRoot)
                        {
                            job.PendingBufferedBatches++;
                        }
                        _gspMemoProcessingQueue.Enqueue(batch);
                        _gspMemoProcessingSignal.Release();
                    }
                }
                else
                {
                    job.CompletedCount += returnedCount;
                }

                // NombreMesure may be larger than the payload actually decoded. Advancing by
                // parsed measurements prevents silently skipping part of a recovery range.
                job.CurrentOffset = effectiveOffset + receivedMeasurementCount;
                VigitempServeur.Log(
                    $"[SONDE][MEMO-JOB] serial={job.Serial} status=batch announced={returnedCount} received={receivedMeasurementCount} inserted={insertedThisBatch} completed={job.CompletedCount}/{job.RequestedCount} nextOffset={job.CurrentOffset} scanned={job.ScannedCount}");

                var shouldComplete = job.RecoverUntilProbeDateTime.HasValue
                    ? job.ScannedCount >= job.RequestedCount
                    : job.CompletedCount >= job.RequestedCount || returnedCount < count;
                if (shouldComplete)
                {
                    if (job.SpanIds.Count > 0)
                    {
                        MarkGspRecoveryJobCompleted(job, "request:range-complete");
                    }
                    else
                    {
                        _gspMemoJobs.TryRemove(job.Serial, out _);
                        GetDatabase().setLieuGspRecoveryPending(schedule.IdLieu, false);
                        VigitempServeur.Log($"[SONDE][MEMO-JOB] serial={job.Serial} status=completed requested={job.RequestedCount} completed={job.CompletedCount} offset={job.CurrentOffset} scanned={job.ScannedCount}");
                    }
                }
            }
            catch (Exception ex)
            {
                job.ConsecutiveFailures++;
                if (job.ConsecutiveFailures >= 3)
                {
                    if (job.SpanIds.Count > 0)
                    {
                        MarkGspRecoveryJobFailed(job, ex.Message, "request");
                    }
                    else
                    {
                        _gspMemoJobs.TryRemove(job.Serial, out _);
                        GetDatabase().setLieuGspRecoveryPending(schedule.IdLieu, false);
                    }
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

        private bool IsModulePortUnavailable(SensorSchedule schedule)
        {
            var port = NormalizePortLockKey(schedule?.Port);
            if (string.IsNullOrWhiteSpace(port))
            {
                return true;
            }

            try
            {
                return !SerialPort.GetPortNames()
                    .Any(p => string.Equals(NormalizePortLockKey(p), port, StringComparison.OrdinalIgnoreCase));
            }
            catch (Exception ex)
            {
                VigitempServeur.Log($"[MODULE][PORT-CHECK] module={BuildModuleKey(schedule)} port={port} status=error error={ex.Message}");
                return false;
            }
        }

        private bool IsGspConfigAttemptDue(SensorSchedule schedule, DateTime nowLocal)
        {
            if (schedule?.ConfigNextAttemptUtc == null)
            {
                return true;
            }

            return DateTime.UtcNow >= schedule.ConfigNextAttemptUtc.Value;
        }

        private void RegisterGspConfigFailure(SensorSchedule schedule, string reason)
        {
            if (schedule == null)
            {
                return;
            }

            schedule.ConfigConsecutiveFailures++;
            var delaySeconds = Math.Min(
                Math.Max(30, _gspConfigModuleBackoffSeconds),
                30 * (int)Math.Pow(2, Math.Min(schedule.ConfigConsecutiveFailures, 4)));
            schedule.ConfigNextAttemptUtc = DateTime.UtcNow.AddSeconds(delaySeconds);

            VigitempServeur.Log(
                $"[SONDE][CFG-JOB] serial={schedule.Serial} status=backoff failures={schedule.ConfigConsecutiveFailures} delaySec={delaySeconds} reason={reason}");

            if (IsGspSchedule(schedule) &&
                !string.IsNullOrWhiteSpace(reason) &&
                reason.IndexOf("semaphore", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                RegisterModuleBackoff(schedule, reason);
            }
        }

        private bool IsModuleBackoffActive(SensorSchedule schedule, DateTime nowLocal)
        {
            var moduleKey = BuildModuleKey(schedule);
            if (!_moduleBackoffUntilUtc.TryGetValue(moduleKey, out var untilUtc))
            {
                return false;
            }

            if (DateTime.UtcNow >= untilUtc)
            {
                _moduleBackoffUntilUtc.TryRemove(moduleKey, out _);
                return false;
            }

            if (_logScheduler)
            {
                VigitempServeur.Log(
                    $"[MODULE][BACKOFF] key={moduleKey} port={schedule?.Port} status=active until={untilUtc:O}");
            }
            return true;
        }

        private void RegisterModuleBackoff(SensorSchedule schedule, string reason)
        {
            var moduleKey = BuildModuleKey(schedule);
            var untilUtc = DateTime.UtcNow.AddSeconds(Math.Max(30, _gspConfigModuleBackoffSeconds));
            _moduleBackoffUntilUtc.AddOrUpdate(moduleKey, untilUtc, (_, current) => current > untilUtc ? current : untilUtc);
            VigitempServeur.Log(
                $"[MODULE][BACKOFF] key={moduleKey} port={schedule?.Port} status=set until={untilUtc:O} reason={reason}");
        }

        private static bool IsPortOpenFailure(Exception ex)
        {
            if (ex == null)
            {
                return false;
            }

            if (ex is UnauthorizedAccessException || ex is System.IO.IOException || ex is InvalidOperationException)
            {
                return true;
            }

            return IsPortOpenFailure(ex.InnerException);
        }

        private string BuildModuleKey(SensorSchedule schedule)
        {
            var module = (schedule?.Module ?? string.Empty).Trim();
            if (!string.IsNullOrWhiteSpace(module))
            {
                return "module:" + module.ToUpperInvariant();
            }

            var port = NormalizePortLockKey(schedule?.Port);
            return string.IsNullOrWhiteSpace(port) ? "module:unknown" : "port:" + port;
        }

        private void HandleModuleProbeFailure(SensorSchedule schedule, string reason)
        {
            if (schedule == null)
            {
                return;
            }

            var moduleKey = BuildModuleKey(schedule);
            var now = DateTime.Now;
            var state = _moduleFailures.AddOrUpdate(
                moduleKey,
                _ => new ModuleFailureState
                {
                    FirstFailureAt = now,
                    LastFailureAt = now,
                    ConsecutiveFailures = 1,
                },
                (_, existing) =>
                {
                    existing.LastFailureAt = now;
                    existing.ConsecutiveFailures++;
                    return existing;
                });

            VigitempServeur.Log(
                $"[MODULE][FAIL] key={moduleKey} serial={schedule.Serial} port={schedule.Port} reason={reason} count={state.ConsecutiveFailures} first={state.FirstFailureAt:O}");

            RegisterModuleBackoff(schedule, reason);

            if (state.ConsecutiveFailures < 2)
            {
                return;
            }

            var moduleSchedules = GetModuleSchedules(schedule).ToList();
            var dueForAnyLocation = moduleSchedules.Any(s =>
            {
                if (state.RaisedLieuIds.Contains(s.IdLieu))
                {
                    return false;
                }

                var settings = GetLieuAlarmSettingsCached(s.IdLieu);
                var delayMinutes = Math.Max(0, settings?.RetardNonReponseMinutes ?? 60);
                return (now - state.FirstFailureAt).TotalMinutes >= delayMinutes;
            });

            if (!dueForAnyLocation)
            {
                return;
            }

            foreach (var moduleSchedule in moduleSchedules)
            {
                if (state.RaisedLieuIds.Contains(moduleSchedule.IdLieu))
                {
                    continue;
                }

                var settings = GetLieuAlarmSettingsCached(moduleSchedule.IdLieu);
                var delayMinutes = Math.Max(0, settings?.RetardNonReponseMinutes ?? 60);
                if ((now - state.FirstFailureAt).TotalMinutes < delayMinutes)
                {
                    continue;
                }

                GetDatabase().AddMesureNoResponse(moduleSchedule.Serial, null);
                GetDatabase().setModuleAlarm(moduleSchedule.IdLieu, moduleSchedule.Serial, true);
                state.RaisedLieuIds.Add(moduleSchedule.IdLieu);
                VigitempServeur.Log(
                    $"[MODULE][ALARM] key={moduleKey} idLieu={moduleSchedule.IdLieu} serial={moduleSchedule.Serial} status=active delayMin={delayMinutes}");
            }

            state.AlarmRaised = state.RaisedLieuIds.Count > 0;
        }

        private void ClearModuleFailure(SensorSchedule schedule)
        {
            if (schedule == null)
            {
                return;
            }

            var moduleKey = BuildModuleKey(schedule);
            if (!_moduleFailures.TryRemove(moduleKey, out var state))
            {
                return;
            }

            _moduleBackoffUntilUtc.TryRemove(moduleKey, out _);

            foreach (var moduleSchedule in GetModuleSchedules(schedule))
            {
                GetDatabase().setModuleAlarm(moduleSchedule.IdLieu, moduleSchedule.Serial, false);
            }

            VigitempServeur.Log(
                $"[MODULE][RECOVER] key={moduleKey} serial={schedule.Serial} port={schedule.Port} previousCount={state.ConsecutiveFailures}");
        }

        private IEnumerable<SensorSchedule> GetModuleSchedules(SensorSchedule schedule)
        {
            var module = (schedule?.Module ?? string.Empty).Trim();
            var port = NormalizePortLockKey(schedule?.Port);
            return _schedules.Values.Where(s =>
                s != null &&
                !s.ConfigurationOnly &&
                !string.IsNullOrWhiteSpace(s.Serial) &&
                ((!string.IsNullOrWhiteSpace(module) &&
                  string.Equals((s.Module ?? string.Empty).Trim(), module, StringComparison.OrdinalIgnoreCase)) ||
                 (string.IsNullOrWhiteSpace(module) &&
                  string.Equals(NormalizePortLockKey(s.Port), port, StringComparison.OrdinalIgnoreCase))));
        }

        private async Task RunWithPortLockAsync(string port, string serial, Func<Task> action)
        {
            if (action == null)
            {
                return;
            }

            var portKey = NormalizePortLockKey(port);
            if (string.IsNullOrWhiteSpace(portKey))
            {
                await action();
                return;
            }

            var localLock = _portLocks.GetOrAdd(portKey, _ => new SemaphoreSlim(1, 1));
            await localLock.WaitAsync(m_cts);
            try
            {
                // Le même mutex nommé est utilisé par l'API hotline. Une opération
                // d'ajustage/étalonnage attend ainsi la fin de la mesure de surveillance
                // déjà engagée, et la surveillance attend symétriquement la libération
                // du port par l'opération de métrologie.
                await Task.Run(() =>
                {
                    var mutexName = BuildPortMutexName(portKey);
                    using (var namedMutex = new Mutex(false, mutexName))
                    {
                        var mutexAcquired = false;
                        try
                        {
                            while (!mutexAcquired)
                            {
                                m_cts.ThrowIfCancellationRequested();
                                try
                                {
                                    mutexAcquired = namedMutex.WaitOne(100);
                                }
                                catch (AbandonedMutexException)
                                {
                                    mutexAcquired = true;
                                    VigitempServeur.LogDetailed(
                                        $"[SONDE][PORT-LOCK] status=abandoned-acquired port={portKey} serial={serial}");
                                }
                            }

                            action().GetAwaiter().GetResult();
                        }
                        finally
                        {
                            if (mutexAcquired)
                            {
                                try
                                {
                                    namedMutex.ReleaseMutex();
                                }
                                catch (ApplicationException)
                                {
                                }
                            }
                        }
                    }
                }, m_cts);
            }
            finally
            {
                localLock.Release();
            }
        }

        private static string NormalizePortLockKey(string port)
        {
            return (port ?? string.Empty).Trim().ToUpperInvariant();
        }

        private static string BuildPortMutexName(string portKey)
        {
            var safe = new string((portKey ?? string.Empty)
                .Select(ch => char.IsLetterOrDigit(ch) ? ch : '_')
                .ToArray());

            return @"Global\VigitempSerialPort_" + safe;
        }

        private async Task<bool> InterrogateSchedule(SensorSchedule schedule)
        {
            var serial = schedule.Serial;
            if (string.IsNullOrEmpty(serial) || serial.Length < 2)
            {
                VigitempServeur.Log("Numero de serie invalide pour le lieu " + schedule.IdLieu + ".");
                return false;
            }

            VigitempServeur.LogDetailed($"[SONDE][ASSIGN] workerServer={_idServer} idLieu={schedule.IdLieu} serial={serial} type={schedule.SondeType} port={schedule.Port}");
            var sensorType = ResolveSensorType(serial, schedule.SondeType, schedule.FamilleSonde, schedule.ModuleType);

            switch (sensorType)
            {
                case "IN":
                    Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
                    var sensorIN = new SensorIN(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.LogDetailed($"[SONDE][START] type=IN serial={serial} port={schedule.Port} adresse={schedule.Adresse} workerServer={_idServer}");
                    return await sensorIN.read();
                case "IE":
                    Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
                    var sensorIE = new SensorIE(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.LogDetailed($"[SONDE][START] type=IE serial={serial} port={schedule.Port} adresse={schedule.Adresse} workerServer={_idServer}");
                    return await sensorIE.read();
                case "IQ":
                    return true;
                case "IP":
                    Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
                    var sensorIP = new SensorIP(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.LogDetailed($"[SONDE][START] type=IP serial={serial} port={schedule.Port} adresse={schedule.Adresse} workerServer={_idServer}");
                    return await sensorIP.read();
                case "IC":
                    Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
                    var sensorIC = new SensorIC(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.LogDetailed($"[SONDE][START] type=IC serial={serial} port={schedule.Port} adresse={schedule.Adresse} workerServer={_idServer}");
                    return await sensorIC.read();
                case "IH":
                    Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
                    var sensorIH = new SensorIH(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.LogDetailed($"[SONDE][START] type=IH serial={serial} port={schedule.Port} adresse={schedule.Adresse} workerServer={_idServer}");
                    return await sensorIH.read();
                case "EN":
                    Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
                    var sensorEN = new SensorEN(this, schedule.Port, serial, schedule.Adresse);
                    VigitempServeur.LogDetailed($"[SONDE][START] type=EN serial={serial} port={schedule.Port} adresse={schedule.Adresse} workerServer={_idServer}");
                    return await sensorEN.read();
                case "HN":
                    Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
                    var sensorHN = new SensorHN(this, schedule.Port, serial, schedule.Adresse, schedule.Module);
                    VigitempServeur.LogDetailed($"[SONDE][START] type=HN serial={serial} port={schedule.Port} adresse={schedule.Adresse} module={schedule.Module} workerServer={_idServer}");
                    return await sensorHN.read();
                case "GSP":
                    Interlocked.Increment(ref VigitempServeur.nombres_interrogations);
                    var requestGraphDisplay = ShouldRequestGspGraphDisplay(schedule);
                    var gspSensor = new SensorGSP(this, schedule.Port, serial, schedule.Adresse, schedule.FrequencySeconds, false, requestGraphDisplay);
                    VigitempServeur.LogDetailed($"[SONDE][START] type=GSP serial={serial} port={schedule.Port} adresse={schedule.Adresse} configDirty={schedule.ConfigDirty} requestGraphDisplay={requestGraphDisplay} workerServer={_idServer}");
                    var gspSuccess = await gspSensor.read();
                    if (!gspSuccess && gspSensor.LastFailureLooksLikeModuleUnavailable)
                    {
                        HandleModuleProbeFailure(schedule, gspSensor.LastFailureReason);
                    }
                    if (gspSuccess)
                    {
                        schedule.CurrentCycleSchedulingAnchor = gspSensor.LastResponseReceivedAtLocal;
                        RegisterGspSuccessfulProbe(schedule);
                    }
                    return gspSuccess;
                default:
                    return false;
            }
        }

        private void RegisterGspSuccessfulProbe(SensorSchedule schedule)
        {
            if (VigitempServeur.InterrogationOnlyMode ||
                schedule == null ||
                schedule.ConfigDirty ||
                !IsGspSchedule(schedule))
            {
                return;
            }

            schedule.SuccessfulProbeCountTotal++;

            if (_gspConfigCheckEverySuccessfulProbes <= 0)
            {
                return;
            }

            schedule.SuccessfulProbeCountSinceConfigCheck++;
            if (schedule.ConfigCheckDue ||
                schedule.SuccessfulProbeCountSinceConfigCheck < _gspConfigCheckEverySuccessfulProbes)
            {
                return;
            }

            schedule.ConfigCheckDue = true;
            if (_logScheduler)
            {
                VigitempServeur.Log(
                    $"[SONDE][CFG-CHECK-JOB] serial={schedule.Serial} status=queued successfulProbes={schedule.SuccessfulProbeCountSinceConfigCheck} interval={_gspConfigCheckEverySuccessfulProbes}");
            }
        }

        private static string ResolveSensorType(string serial, string sondeType, string familleSonde, int? moduleType)
        {
            if (string.Equals(familleSonde, "GSP", StringComparison.OrdinalIgnoreCase) ||
                GspProtocol.IsGspSerial(serial))
            {
                return "GSP";
            }

            var prefix = !string.IsNullOrWhiteSpace(serial) && serial.Length >= 2
                ? serial.Substring(0, 2).ToUpperInvariant()
                : string.Empty;

            if (string.Equals(prefix, "EN", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(prefix, "HN", StringComparison.OrdinalIgnoreCase))
            {
                return prefix;
            }

            var normalizedSondeType = string.IsNullOrWhiteSpace(sondeType)
                ? string.Empty
                : sondeType.Trim().ToUpperInvariant();

            if (normalizedSondeType == "E" && moduleType == 3)
            {
                return "EN";
            }

            if (normalizedSondeType == "H" && moduleType == 6)
            {
                return "HN";
            }

            // Legacy generic type "I" is used in DB for several concrete wired probes.
            // When the serial already carries a concrete prefix (e.g. INX08J -> IN),
            // prefer that concrete family so interrogation uses the right handler.
            if (normalizedSondeType == "I")
            {
                switch (prefix)
                {
                    case "IN":
                    case "IE":
                    case "IP":
                    case "IC":
                    case "IH":
                    case "IQ":
                        return prefix;
                }
            }

            if (!string.IsNullOrWhiteSpace(normalizedSondeType))
            {
                return normalizedSondeType;
            }

            return prefix;
        }

        private void ProcessMaintenanceTick(object sender, ElapsedEventArgs e)
        {
            Interlocked.Exchange(ref _lastMaintenanceHeartbeatUtcTicks, DateTime.UtcNow.Ticks);
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
                if (VigitempServeur.InterrogationOnlyMode)
                {
                    return;
                }

                //cherche les lieux avec une dateReactivationAlarme passe pour reactiver les alarmes
                //VigitempServeur.Log("process 1 minute");
                (List<int> arr_lieuxAvecAlarmeSnooze, _) = GetDatabase().getLieuxAvecAlarmesEnSnooze();
                for (int i = 0; i < arr_lieuxAvecAlarmeSnooze.Count(); i++)
                {
                    var idLieu = arr_lieuxAvecAlarmeSnooze[i];
                    try
                    {
                        VigitempServeur.Log("Le lieu " + idLieu + " doit etre reactive.");

                        GetDatabase().setAlarmeByIdLieu(idLieu, true);

                        var derniereMesure = GetDatabase().getLastMeasureWithUnit(idLieu);

                        if (!derniereMesure.hasValue)
                        {
                            VigitempServeur.Log($"Snooze lieu {idLieu} : alarme réactivée, aucune mesure disponible pour comparaison (ignoré).");
                            continue;
                        }

                        //recuperer infos du lieu
                        (string arr_portSerie, string arr_sondeNumeroSerie, string arr_sondeType, string arr_familleSonde, string arr_sondeAdresse, string arr_moduleNumeroSerie, int? arr_moduleType) = GetDatabase().getInfosByIdLieu(idLieu);

                        if (string.IsNullOrEmpty(arr_sondeNumeroSerie) || arr_sondeNumeroSerie.Length < 2)
                        {
                            VigitempServeur.Log("Numero de serie invalide pour le lieu " + idLieu + ".");
                            continue;
                        }
                        VigitempServeur.Log("Ouverture du port " + arr_portSerie + " pour la sonde " + arr_sondeNumeroSerie);
                        var sensorType = ResolveSensorType(arr_sondeNumeroSerie, arr_sondeType, arr_familleSonde, arr_moduleType);

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

                // Reactivation automatique de la surveillance (Lieu_Etat)
                (List<int> arr_lieuxSurveillanceSnooze, _) = GetDatabase().getLieuxAvecSurveillanceEnSnooze();
                for (int i = 0; i < arr_lieuxSurveillanceSnooze.Count(); i++)
                {
                    VigitempServeur.Log("Surveillance reactivee pour le lieu " + arr_lieuxSurveillanceSnooze[i] + ".");
                    GetDatabase().setSurveillanceByIdLieu(arr_lieuxSurveillanceSnooze[i], true);
                    GetDatabase().writeAuditJournal(
                        "ACT",
                        "SERVEUR",
                        "SYSTEME",
                        arr_lieuxSurveillanceSnooze[i],
                        "Reactivation automatique de la surveillance",
                        null);
                }

                await TriggerMonthlyStatsDispatchIfNeededAsync();
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

        private Task TriggerMonthlyStatsDispatchIfNeededAsync()
        {
            try
            {
                if (!_statsMonthlyDispatchEnabled)
                {
                    return Task.CompletedTask;
                }

                if (_idServer != _statsMonthlyDispatchServerId)
                {
                    return Task.CompletedTask;
                }

                var nowUtc = DateTime.UtcNow;
                var intervalMinutes = Math.Max(5, _statsMonthlyDispatchIntervalMinutes);
                if (_lastStatsMonthlyDispatchAttemptUtc != DateTime.MinValue &&
                    (nowUtc - _lastStatsMonthlyDispatchAttemptUtc).TotalMinutes < intervalMinutes)
                {
                    return Task.CompletedTask;
                }

                if (Interlocked.CompareExchange(ref _statsMonthlyDispatchInFlight, 1, 0) != 0)
                {
                    return Task.CompletedTask;
                }

                _lastStatsMonthlyDispatchAttemptUtc = nowUtc;
                VigitempServeur.Log(
                    $"[STATS][MONTHLY] status=start server={_idServer} intervalMin={intervalMinutes}");

                _ = Task.Run(async () =>
                {
                    try
                    {
                        await AlarmWebNotifier.TriggerMonthlyStatsRecapAsync();
                    }
                    catch (Exception ex)
                    {
                        VigitempServeur.Log("Monthly stats dispatch background error: " + ex);
                    }
                    finally
                    {
                        Interlocked.Exchange(ref _statsMonthlyDispatchInFlight, 0);
                    }
                });
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("TriggerMonthlyStatsDispatchIfNeededAsync error: " + ex.Message);
                Interlocked.Exchange(ref _statsMonthlyDispatchInFlight, 0);
            }

            return Task.CompletedTask;
        }

        private void RefreshSchedule()
        {
            var now = DateTime.Now;
            var rows = GetAssignedSondesForCurrentWorker();
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
                    if (row.ConfigurationOnly)
                    {
                        _sondeMetrologyCache.TryRemove(row.SondeNumeroSerie, out _);
                        InvalidateLieuSettingsCache(row.IdLieu, "configuration-only-added");
                    }
                    else
                    {
                        RememberNextProbeDue(schedule);
                        SetSondeMetrologyFromSchedule(row);
                        BootstrapPendingGspRecovery(row, schedule, now);
                    }
                    if (_logScheduler)
                    {
                        VigitempServeur.Log($"Scheduler add idLieu={row.IdLieu} serial={row.SondeNumeroSerie} freqSec={row.FrequenceSecondes} configurationOnly={row.ConfigurationOnly}");
                    }

                    continue;
                }

                if (row.InfosModifiees)
                {
                    InvalidateLieuSettingsCache(row.IdLieu, "infos-modifiees");
                    schedule.ConfigDirty = true;
                    schedule.ConfigCheckDue = false;
                }

                var hasChanges = !string.Equals(schedule.Serial, row.SondeNumeroSerie, StringComparison.Ordinal) ||
                                 !string.Equals(schedule.SondeType, row.SondeType, StringComparison.Ordinal) ||
                                 !string.Equals(schedule.FamilleSonde, row.FamilleSonde, StringComparison.Ordinal) ||
                                 !string.Equals(schedule.Adresse, row.AdresseSonde, StringComparison.Ordinal) ||
                                 !string.Equals(schedule.Port, row.PortSerie, StringComparison.Ordinal) ||
                                 !string.Equals(schedule.Module, row.ModuleNumeroSerie, StringComparison.Ordinal) ||
                                 schedule.ModuleType != row.ModuleType ||
                                 schedule.ManualWorkerId != NormalizeWorkerId(row.ManualWorkerId) ||
                                 schedule.ConfigurationOnly != row.ConfigurationOnly ||
                                 schedule.FrequencySeconds != row.FrequenceSecondes;

                if (hasChanges)
                {
                    var previousSerial = schedule.Serial;
                    if (row.ConfigurationOnly)
                    {
                        _sondeMetrologyCache.TryRemove(row.SondeNumeroSerie, out _);
                    }
                    else
                    {
                        SetSondeMetrologyFromSchedule(row);
                    }
                    schedule.Serial = row.SondeNumeroSerie;
                    schedule.SondeType = row.SondeType;
                    schedule.FamilleSonde = row.FamilleSonde;
                    schedule.Adresse = row.AdresseSonde;
                    schedule.Port = row.PortSerie;
                    schedule.Module = row.ModuleNumeroSerie;
                    schedule.ModuleType = row.ModuleType;
                    schedule.ManualWorkerId = NormalizeWorkerId(row.ManualWorkerId);
                    schedule.ConfigurationOnly = row.ConfigurationOnly;
                    schedule.FrequencySeconds = row.FrequenceSecondes;
                    schedule.LastMeasure = row.DerniereDateHeure ?? schedule.LastMeasure;
                    if (!string.Equals(previousSerial, schedule.Serial, StringComparison.OrdinalIgnoreCase) &&
                        !string.IsNullOrWhiteSpace(previousSerial))
                    {
                        _nextProbeDueBySerial.TryRemove(previousSerial, out _);
                    }
                    SetScheduleNextDue(schedule, ComputeNextDue(now, schedule.LastMeasure, schedule.FrequencySeconds));

                    if (_logScheduler)
                    {
                        VigitempServeur.Log($"Scheduler update idLieu={row.IdLieu} serial={row.SondeNumeroSerie} freqSec={row.FrequenceSecondes} configurationOnly={row.ConfigurationOnly}");
                    }

                }

                BootstrapPendingGspRecovery(row, schedule, now);
            }

            var toRemove = _schedules.Keys.Where(id => !seen.Contains(id)).ToList();
            foreach (var idLieu in toRemove)
            {
                if (_schedules.TryRemove(idLieu, out var removed) && removed != null && !string.IsNullOrWhiteSpace(removed.Serial))
                {
                    _sondeMetrologyCache.TryRemove(removed.Serial, out _);
                    _nextProbeDueBySerial.TryRemove(removed.Serial, out _);
                    Sensor.ClearAlarmState(idLieu);
                    InvalidateRetriggerFlagCache(idLieu);
                }
                if (_logScheduler)
                {
                    VigitempServeur.Log($"Scheduler remove idLieu={idLieu}");
                }
            }
        }

        private void BootstrapPendingGspRecovery(SondeScheduleInfo row, SensorSchedule schedule, DateTime now)
        {
            if (row == null || schedule == null || row.ConfigurationOnly || !row.GspRecoveryPending)
            {
                return;
            }

            TryQueuePendingGspRecovery(row, schedule, now);
        }

        private void SyncGspRecoveryPendingFlag(SensorSchedule schedule)
        {
            if (schedule == null || schedule.IdLieu <= 0 || string.IsNullOrWhiteSpace(schedule.Serial))
            {
                return;
            }

            var hasPending = GetDatabase().hasPendingGspRecoverySpans(schedule.IdLieu, schedule.Serial);
            GetDatabase().setLieuGspRecoveryPending(schedule.IdLieu, hasPending);
        }

        private List<SondeScheduleInfo> GetAssignedSondesForCurrentWorker()
        {
            var rows = GetDatabase().getSondesActivesAllServeurs() ?? new List<SondeScheduleInfo>();

            // Les configurations dirty hors Surveillance sont gerees par un seul worker
            // logique afin de ne pas perturber la repartition des sondes actives entre ports.
            if (!VigitempServeur.InterrogationOnlyMode && _idServer == 1)
            {
                var activeLieuIds = new HashSet<int>(rows.Where(r => r != null).Select(r => r.IdLieu));
                var pendingConfigurationRows = GspPendingConfigurationReader.GetPendingSchedules();
                foreach (var pending in pendingConfigurationRows)
                {
                    if (pending == null || activeLieuIds.Contains(pending.IdLieu))
                    {
                        continue;
                    }

                    pending.ManualWorkerId = 1;
                    rows.Add(pending);
                    activeLieuIds.Add(pending.IdLieu);
                }
            }

            if (rows.Count == 0)
            {
                return new List<SondeScheduleInfo>();
            }

            var workerIds = _activeWorkerIdsProvider?.Invoke()?
                .Where(id => id > 0)
                .Distinct()
                .OrderBy(id => id)
                .ToList();

            if (workerIds == null || workerIds.Count == 0)
            {
                workerIds = new List<int> { _idServer };
            }
            else if (!workerIds.Contains(_idServer))
            {
                workerIds.Add(_idServer);
                workerIds = workerIds.Distinct().OrderBy(id => id).ToList();
            }

            var orderedRows = rows
                .Where(r => r != null && r.FrequenceSecondes > 0)
                .OrderBy(r => r.IdLieu)
                .ThenBy(r => r.SondeNumeroSerie ?? string.Empty, StringComparer.OrdinalIgnoreCase)
                .ToList();

            var manualRows = orderedRows
                .Where(r => NormalizeWorkerId(r.ManualWorkerId).HasValue)
                .ToList();
            var autoRows = orderedRows
                .Where(r => !NormalizeWorkerId(r.ManualWorkerId).HasValue)
                .ToList();

            var autoWorkerCount = Math.Max(1, autoRows
                .Select(BuildAssignmentGroupKey)
                .Where(IsPortGroupKey)
                .Distinct(StringComparer.Ordinal)
                .Count());
            var autoWorkerIds = Enumerable.Range(1, autoWorkerCount)
                .Where(workerIds.Contains)
                .ToList();
            if (autoWorkerIds.Count == 0)
            {
                autoWorkerIds.Add(workerIds[0]);
            }

            var assignmentByKey = new Dictionary<string, int>(StringComparer.Ordinal);
            var portKeys = autoRows
                .Select(BuildAssignmentGroupKey)
                .Where(IsPortGroupKey)
                .Distinct(StringComparer.Ordinal)
                .OrderBy(k => k, StringComparer.Ordinal)
                .ToList();
            for (var i = 0; i < portKeys.Count; i++)
            {
                var ownerWorkerId = autoWorkerIds[i % autoWorkerIds.Count];
                assignmentByKey[portKeys[i]] = ownerWorkerId;
            }

            // Fallback pour les lignes sans port: repartition deterministe et equilibree.
            var sensorKeysWithoutPort = autoRows
                .Select(BuildAssignmentGroupKey)
                .Where(k => !IsPortGroupKey(k))
                .Distinct(StringComparer.Ordinal)
                .OrderBy(k => k, StringComparer.Ordinal)
                .ToList();
            for (var i = 0; i < sensorKeysWithoutPort.Count; i++)
            {
                var ownerWorkerId = autoWorkerIds[(i + portKeys.Count) % autoWorkerIds.Count];
                assignmentByKey[sensorKeysWithoutPort[i]] = ownerWorkerId;
            }

            var assignedRows = orderedRows
                .Where(r =>
                {
                    var manualWorkerId = NormalizeWorkerId(r.ManualWorkerId);
                    if (manualWorkerId.HasValue)
                    {
                        return manualWorkerId.Value == _idServer;
                    }

                    var groupKey = BuildAssignmentGroupKey(r);
                    var ownerWorkerId = ResolveWorkerOwnerForKey(groupKey, autoWorkerIds, assignmentByKey);
                    return ownerWorkerId == _idServer;
                })
                .ToList();

            if (_logScheduler)
            {
                var assignmentSignature =
                    string.Join("|", workerIds) +
                    "#auto=" + string.Join("|", autoWorkerIds) +
                    "#manual=" + manualRows.Count +
                    "#" + orderedRows.Count +
                    "#" + assignedRows.Count;
                if (!string.Equals(_lastAssignmentLogSignature, assignmentSignature, StringComparison.Ordinal))
                {
                    _lastAssignmentLogSignature = assignmentSignature;
                    VigitempServeur.Log(
                        $"[SCHED][ASSIGN] worker={_idServer} activeWorkers={string.Join(",", workerIds)} autoWorkers={string.Join(",", autoWorkerIds)} totalSensors={orderedRows.Count} manualSensors={manualRows.Count} assignedSensors={assignedRows.Count}");
                }

                var ownership = autoRows
                    .Select(r => BuildAssignmentGroupKey(r))
                    .Distinct(StringComparer.Ordinal)
                    .OrderBy(k => k, StringComparer.Ordinal)
                    .Select(k => $"{k}->{ResolveWorkerOwnerForKey(k, autoWorkerIds, assignmentByKey)}")
                    .Concat(manualRows
                        .Select(r => $"{BuildAssignmentGroupKey(r)}=>manual:{NormalizeWorkerId(r.ManualWorkerId)}")
                        .Distinct(StringComparer.Ordinal)
                        .OrderBy(k => k, StringComparer.Ordinal))
                    .ToList();
                var ownershipSignature = string.Join("|", ownership);
                if (!string.Equals(_lastPortOwnershipSignature, ownershipSignature, StringComparison.Ordinal))
                {
                    _lastPortOwnershipSignature = ownershipSignature;
                    VigitempServeur.Log(
                        $"[SCHED][PORT-OWNERSHIP] activeWorkers={string.Join(",", workerIds)} mapping={string.Join(", ", ownership)}");
                }
            }

            return assignedRows;
        }

        private static string BuildAssignmentGroupKey(SondeScheduleInfo row)
        {
            var port = (row?.PortSerie ?? string.Empty).Trim();
            if (!string.IsNullOrWhiteSpace(port))
            {
                return "port:" + port.ToUpperInvariant();
            }

            // Fallback deterministe si aucun port COM n'est renseigne.
            return "sensor:" + ((row?.SondeNumeroSerie ?? string.Empty).Trim().ToUpperInvariant());
        }

        private static int? NormalizeWorkerId(int? workerId)
        {
            return workerId.HasValue && workerId.Value > 0 ? workerId.Value : (int?)null;
        }

        private static bool IsPortGroupKey(string key)
        {
            return !string.IsNullOrWhiteSpace(key) && key.StartsWith("port:", StringComparison.Ordinal);
        }

        private static int ResolveWorkerOwnerForKey(string key, List<int> workerIds, Dictionary<string, int> assignmentByKey)
        {
            if (workerIds == null || workerIds.Count == 0)
            {
                return 1;
            }

            if (assignmentByKey != null && assignmentByKey.TryGetValue(key ?? string.Empty, out var owner))
            {
                return owner;
            }

            return workerIds[0];
        }

        private void SetScheduleNextDue(SensorSchedule schedule, DateTime nextDue)
        {
            if (schedule == null)
            {
                return;
            }

            schedule.NextDue = nextDue;
            RememberNextProbeDue(schedule);
        }

        private void RememberNextProbeDue(SensorSchedule schedule)
        {
            if (schedule == null || string.IsNullOrWhiteSpace(schedule.Serial))
            {
                return;
            }

            _nextProbeDueBySerial[schedule.Serial] = schedule.NextDue;
        }

        private bool HasFreePortWindow(string port, int minWindowSeconds, DateTime now, out DateTime? nextDue)
        {
            nextDue = null;
            var portKey = NormalizePortLockKey(port);
            if (string.IsNullOrWhiteSpace(portKey))
            {
                return false;
            }

            var dueOnPort = _schedules.Values
                .Where(s => s != null &&
                            !s.ConfigurationOnly &&
                            !s.InProgress &&
                            string.Equals(NormalizePortLockKey(s.Port), portKey, StringComparison.OrdinalIgnoreCase))
                .Select(s => s.NextDue)
                .OrderBy(d => d)
                .ToList();

            if (dueOnPort.Count == 0)
            {
                return true;
            }

            nextDue = dueOnPort[0];
            return (nextDue.Value - now).TotalSeconds >= Math.Max(1, minWindowSeconds);
        }

        private void LogSaturatedPorts(DateTime now, IReadOnlyCollection<SensorSchedule> dueSchedules)
        {
            if (dueSchedules == null || dueSchedules.Count == 0)
            {
                return;
            }

            var nowUtc = DateTime.UtcNow;
            var baselineSeconds = Math.Max(1, _portSaturationBaselineProbeSeconds);
            var logIntervalSeconds = Math.Max(30, _portSaturationLogIntervalSeconds);

            foreach (var portGroup in _schedules.Values
                .Where(s => s != null && !s.ConfigurationOnly && !string.IsNullOrWhiteSpace(s.Port))
                .GroupBy(s => NormalizePortLockKey(s.Port), StringComparer.OrdinalIgnoreCase))
            {
                var port = portGroup.Key;
                var assigned = portGroup.ToList();
                var due = dueSchedules
                    .Where(s => string.Equals(
                        NormalizePortLockKey(s.Port),
                        port,
                        StringComparison.OrdinalIgnoreCase))
                    .ToList();

                if (due.Count == 0)
                {
                    continue;
                }

                var minFrequencySeconds = assigned.Min(s => Math.Max(1, s.FrequencySeconds));
                var maxLateSeconds = Math.Max(0d, due.Max(s => (now - s.NextDue).TotalSeconds));
                var estimatedCycleSeconds = assigned.Count * baselineSeconds;
                var estimatedLoadPercent = assigned.Sum(s =>
                    (double)baselineSeconds / Math.Max(1, s.FrequencySeconds)) * 100d;
                var saturated = estimatedLoadPercent >= 100d ||
                                maxLateSeconds >= Math.Max(60d, minFrequencySeconds * 2d);

                if (!saturated)
                {
                    continue;
                }

                if (_lastPortSaturationLogUtc.TryGetValue(port, out var lastLogUtc) &&
                    (nowUtc - lastLogUtc).TotalSeconds < logIntervalSeconds)
                {
                    continue;
                }

                _lastPortSaturationLogUtc[port] = nowUtc;
                var topLate = string.Join(
                    ",",
                    due.OrderByDescending(s => (now - s.NextDue).TotalSeconds)
                        .Take(5)
                        .Select(s =>
                            $"{s.Serial}:{Math.Max(0, (int)(now - s.NextDue).TotalSeconds)}s"));

                VigitempServeur.Log(
                    $"[SCHED][PORT-SATURATION] worker={_idServer} port={port} assigned={assigned.Count} due={due.Count} maxLateSec={(int)maxLateSeconds} minFreqSec={minFrequencySeconds} estimatedCycleSec={estimatedCycleSeconds} estimatedLoadPct={estimatedLoadPercent:0} baselineProbeSec={baselineSeconds} topLate=[{topLate}]");
            }
        }

        private bool IsGspSchedule(SensorSchedule schedule)
        {
            if (schedule == null)
            {
                return false;
            }

            return string.Equals(schedule.FamilleSonde, "GSP", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(schedule.SondeType, "GSP", StringComparison.OrdinalIgnoreCase) ||
                   ((schedule.SondeType ?? string.Empty).Trim().StartsWith("SP", StringComparison.OrdinalIgnoreCase));
        }

        private int EstimateGspMemoFreeSlotSeconds()
        {
            return Math.Max(1, _gspMemoFreeSlotMinSeconds);
        }

        private static string FormatDateForLog(DateTime? value)
        {
            return value.HasValue
                ? value.Value.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture)
                : "none";
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
                ModuleType = info.ModuleType,
                ManualWorkerId = NormalizeWorkerId(info.ManualWorkerId),
                ConfigurationOnly = info.ConfigurationOnly,
                ConfigDirty = info.InfosModifiees,
                ConfigCheckDue = false,
                FrequencySeconds = info.FrequenceSecondes,
                LastMeasure = lastMeasure,
                NextDue = ComputeNextDue(now, lastMeasure, info.FrequenceSecondes),
                SuccessfulProbeCountTotal = 0
            };
        }

        private bool ShouldRequestGspGraphDisplay(SensorSchedule schedule)
        {
            if (VigitempServeur.InterrogationOnlyMode ||
                schedule == null ||
                !IsGspSchedule(schedule))
            {
                return false;
            }

            if (_gspGraphDisplayEveryMeasures <= 0)
            {
                return false;
            }

            var everyMeasures = Math.Max(1, _gspGraphDisplayEveryMeasures);
            var nextProbeIndex = schedule.SuccessfulProbeCountTotal + 1;
            return nextProbeIndex % everyMeasures == 0;
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
