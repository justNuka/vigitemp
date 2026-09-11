using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.IO.Ports;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Vigitemp_Serveur.sensors;

namespace Vigitemp_Serveur
{
    internal sealed class HotlineApiServer
    {
        private const int GspBufferDrainMs = 400;
        private const int GspPostCommandDrainMs = 1000;
        private const int GspPostCommandQuietMs = 250;
        private const int GspEndOfResponseSilenceMs = 500;
        private const int MaxExchangeLogLength = 2000;
        private const int MetrologyPortPollMs = 250;
        private const int DefaultGspPostWriteDelayMs = 150;
        private const int MetrologyConfigurationCommandDelayMs = 500;
        private const int DefaultMetrologyInterrogationGapMs = 1000;
        private const int DefaultMetrologyPortQueueTimeoutMs = 30 * 60 * 1000;

        private HttpListener _listener;
        private CancellationTokenSource _cts;
        private Task _listenTask;

        private sealed class GspSensorTestRequest
        {
            public bool SyncConfiguration { get; set; }
            public double? CoeffA { get; set; }
            public double? CoeffB { get; set; }
            public double? AccuracyError { get; set; }
            public double? HighLimit { get; set; }
            public double? LowLimit { get; set; }
            public int? FrequencySeconds { get; set; }
            public int? AlarmDelayMinutes { get; set; }
            public int? AlarmDelayLowMinutes { get; set; }
            public int? AlarmDelayHighMinutes { get; set; }
            public string Channel { get; set; }
            public int? MemoryCount { get; set; }
            public int? MemoryOffset { get; set; }
            public string RawCommand { get; set; }
            public int? ListenWindowMs { get; set; }
        }

        private sealed class SensorTestRequest
        {
            public string Serial { get; set; }
            public string SensorType { get; set; }
            public string Action { get; set; }
            public string ManualPort { get; set; }
            public string ManualAddress { get; set; }
            public string ManualModule { get; set; }
            public string OperationContext { get; set; }
            public int? BaudRate { get; set; }
            public string Parity { get; set; }
            public int? DataBits { get; set; }
            public string StopBits { get; set; }
            public int? ReadTimeoutMs { get; set; }
            public int? WriteTimeoutMs { get; set; }
            public string NetworkHost { get; set; }
            public int? NetworkPort { get; set; }
            public string ProtocolAddress { get; set; }
            public GspSensorTestRequest Gsp { get; set; }
        }

        private sealed class SensorExchange
        {
            public string Direction { get; set; }
            public string Format { get; set; }
            public string Content { get; set; }
        }

        private sealed class SensorTestResult
        {
            public bool Success { get; set; }
            public string Error { get; set; }
            public string SensorType { get; set; }
            public string Serial { get; set; }
            public string Action { get; set; }
            public string RequestedCommand { get; set; }
            public string Port { get; set; }
            public string Address { get; set; }
            public string Module { get; set; }
            public string NetworkHost { get; set; }
            public int? NetworkPort { get; set; }
            public string ProtocolAddress { get; set; }
            public string OperationContext { get; set; }
            public double? Value { get; set; }
            public string Unit { get; set; }
            public string RawValue { get; set; }
            public List<string> DetectedSerials { get; set; } = new List<string>();
            public List<SensorExchange> Exchanges { get; set; } = new List<SensorExchange>();
        }

        public void Start()
        {
            var prefix = GetSetting("Vigitemp.Hotline.Bind", "http://+:5310/");
            if (!prefix.EndsWith("/")) prefix += "/";

            _listener = new HttpListener();
            _listener.Prefixes.Add(prefix);
            _listener.Start();

            _cts = new CancellationTokenSource();
            _listenTask = Task.Run(() => ListenLoop(_cts.Token));
            VigitempServeur.Log("[HOTLINE][START] bind=" + prefix);
        }

        public void Stop()
        {
            try { _cts?.Cancel(); } catch { }
            try { _listener?.Stop(); } catch { }
            try { _listener?.Close(); } catch { }
            try { _listenTask?.Wait(2000); } catch { }
            _listener = null;
            _cts = null;
            _listenTask = null;
        }

        private async Task ListenLoop(CancellationToken token)
        {
            while (!token.IsCancellationRequested)
            {
                HttpListenerContext context = null;
                try { context = await _listener.GetContextAsync().ConfigureAwait(false); }
                catch (Exception ex)
                {
                    if (_listener == null || !_listener.IsListening) return;
                    VigitempServeur.Log("[HOTLINE][LISTEN] status=error error=" + EscapeForLog(ex.Message));
                    continue;
                }

                _ = Task.Run(() => HandleRequest(context));
            }
        }

        private void HandleRequest(HttpListenerContext context)
        {
            var response = context.Response;
            response.ContentType = "application/json";
            response.Headers["Cache-Control"] = "no-store";

            try
            {
                if (!ValidateApiKey(context.Request))
                {
                    WriteJson(response, 401, new { ok = false, error = "unauthorized", message = "Unauthorized" });
                    return;
                }

                var path = context.Request.Url.AbsolutePath.TrimEnd('/');
                if (string.Equals(path, "/api/hotline/login", StringComparison.OrdinalIgnoreCase))
                {
                    HandleLogin(context.Request, response);
                    return;
                }

                if (string.Equals(path, "/api/hotline/sensor-test", StringComparison.OrdinalIgnoreCase))
                {
                    HandleSensorTest(context.Request, response);
                    return;
                }

                if (string.Equals(path, "/api/hotline/version", StringComparison.OrdinalIgnoreCase))
                {
                    HandleVersion(context.Request, response);
                    return;
                }

                WriteJson(response, 404, new { ok = false, error = "not_found", message = "Not found" });
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("[HOTLINE][API] status=error error=" + EscapeForLog(ex.Message));
                LogHotlineDetailed("[HOTLINE][API][DETAIL] " + ex);
                WriteJson(response, 500, new { ok = false, error = "server_error", message = "Server error" });
            }
        }

        private void HandleLogin(HttpListenerRequest request, HttpListenerResponse response)
        {
            if (!string.Equals(request.HttpMethod, "POST", StringComparison.OrdinalIgnoreCase))
            {
                WriteJson(response, 405, new { ok = false, error = "method_not_allowed", message = "Method not allowed" });
                return;
            }

            var payload = ReadJson(request);
            var slug = payload.Value<string>("slug") ?? string.Empty;
            var username = payload.Value<string>("username") ?? string.Empty;
            var password = payload.Value<string>("password") ?? string.Empty;

            var hotline = LicenseManager.GetHotlineConfigFromConfig();
            if (!hotline.IsValid)
            {
                WriteJson(response, 401, new { ok = false, error = "invalid_license", message = hotline.Reason });
                return;
            }

            var config = hotline.Config;
            if (!string.IsNullOrWhiteSpace(config.Slug) && !string.Equals(slug, config.Slug, StringComparison.Ordinal))
            {
                WriteJson(response, 401, new { ok = false, error = "invalid_credentials", message = "Invalid credentials" });
                return;
            }

            if (!string.Equals(username, config.Username, StringComparison.Ordinal) || !HotlinePasswordHasher.VerifyPassword(password, config.PasswordHash))
            {
                WriteJson(response, 401, new { ok = false, error = "invalid_credentials", message = "Invalid credentials" });
                return;
            }

            WriteJson(response, 200, new { ok = true });
        }

        private void HandleSensorTest(HttpListenerRequest request, HttpListenerResponse response)
        {
            if (!string.Equals(request.HttpMethod, "POST", StringComparison.OrdinalIgnoreCase))
            {
                WriteJson(response, 405, new { ok = false, error = "method_not_allowed", message = "Method not allowed" });
                return;
            }

            var payload = ReadJson(request);
            var testRequest = ParseSensorTestRequest(payload);
            var result = ExecuteSensorTest(testRequest);
            // A sensor test can fail normally (busy COM port, no response, echo only).
            // Keep these as payload-level failures so the web hotline can always clear its pending state.
            WriteJson(response, 200, new { ok = result.Success, data = result, message = result.Error });
        }


        private void HandleVersion(HttpListenerRequest request, HttpListenerResponse response)
        {
            if (!string.Equals(request.HttpMethod, "GET", StringComparison.OrdinalIgnoreCase))
            {
                WriteJson(response, 405, new { ok = false, error = "method_not_allowed", message = "Method not allowed" });
                return;
            }

            var version = FileVersionInfo.GetVersionInfo(typeof(VigitempServeur).Assembly.Location).ProductVersion;
            if (string.IsNullOrWhiteSpace(version))
            {
                version = typeof(VigitempServeur).Assembly.GetName().Version?.ToString() ?? string.Empty;
            }

            WriteJson(response, 200, new { ok = true, data = new { version } });
        }

        private static SensorTestRequest ParseSensorTestRequest(JObject payload)
        {
            var gspToken = payload["gsp"] as JObject;
            return new SensorTestRequest
            {
                Serial = (payload.Value<string>("serial") ?? string.Empty).Trim(),
                SensorType = ((payload.Value<string>("sensorType") ?? string.Empty).Trim()).ToUpperInvariant(),
                Action = (payload.Value<string>("action") ?? "read").Trim(),
                ManualPort = (payload.Value<string>("manualPort") ?? string.Empty).Trim(),
                ManualAddress = (payload.Value<string>("manualAddress") ?? string.Empty).Trim(),
                ManualModule = (payload.Value<string>("manualModule") ?? string.Empty).Trim(),
                NetworkHost = (payload.Value<string>("networkHost") ?? string.Empty).Trim(),
                NetworkPort = ValueOrNullInt(payload["networkPort"]),
                ProtocolAddress = (payload.Value<string>("protocolAddress") ?? string.Empty).Trim(),
                OperationContext = NormalizeOperationContext(payload.Value<string>("operationContext")),
                BaudRate = ValueOrNullInt(payload["baudRate"]),
                Parity = (payload.Value<string>("parity") ?? string.Empty).Trim(),
                DataBits = ValueOrNullInt(payload["dataBits"]),
                StopBits = (payload.Value<string>("stopBits") ?? string.Empty).Trim(),
                ReadTimeoutMs = ValueOrNullInt(payload["readTimeoutMs"]),
                WriteTimeoutMs = ValueOrNullInt(payload["writeTimeoutMs"]),
                Gsp = gspToken == null ? new GspSensorTestRequest() : new GspSensorTestRequest
                {
                    SyncConfiguration = gspToken.Value<bool?>("syncConfiguration") ?? false,
                    CoeffA = ValueOrNullDouble(gspToken["coeffA"]),
                    CoeffB = ValueOrNullDouble(gspToken["coeffB"]),
                    AccuracyError = ValueOrNullDouble(gspToken["accuracyError"]),
                    HighLimit = ValueOrNullDouble(gspToken["highLimit"]),
                    LowLimit = ValueOrNullDouble(gspToken["lowLimit"]),
                    FrequencySeconds = ValueOrNullInt(gspToken["frequencySeconds"]),
                    AlarmDelayMinutes = ValueOrNullInt(gspToken["alarmDelayMinutes"]),
                    AlarmDelayLowMinutes = ValueOrNullInt(gspToken["alarmDelayLowMinutes"]),
                    AlarmDelayHighMinutes = ValueOrNullInt(gspToken["alarmDelayHighMinutes"]),
                    Channel = (gspToken.Value<string>("channel") ?? string.Empty).Trim(),
                    MemoryCount = ValueOrNullInt(gspToken["memoryCount"]),
                    MemoryOffset = ValueOrNullInt(gspToken["memoryOffset"]),
                    RawCommand = gspToken.Value<string>("rawCommand") ?? string.Empty,
                    ListenWindowMs = ValueOrNullInt(gspToken["listenWindowMs"]),
                }
            };
        }

        private static SensorTestResult ExecuteSensorTest(SensorTestRequest request)
        {
            var startedAt = DateTimeOffset.Now;
            var stopwatch = Stopwatch.StartNew();
            var result = new SensorTestResult
            {
                SensorType = request.SensorType,
                Serial = request.Serial,
                Action = request.Action,
                OperationContext = request.OperationContext,
            };

            var logPrefix = GetOperationLogPrefix(request.OperationContext);
            LogHotlineDetailed(string.Format(CultureInfo.InvariantCulture,
                "{0}[REQUEST] type={1}; serial={2}; action={3}; manualPort={4}; manualAddress={5}; manualModule={6}; baudRate={7}; parity={8}; dataBits={9}; stopBits={10}; readTimeoutMs={11}; writeTimeoutMs={12}; listenWindowMs={13}",
                logPrefix,
                request.SensorType ?? string.Empty,
                request.Serial ?? string.Empty,
                request.Action ?? string.Empty,
                request.ManualPort ?? string.Empty,
                request.ManualAddress ?? string.Empty,
                request.ManualModule ?? string.Empty,
                request.BaudRate.HasValue ? request.BaudRate.Value.ToString(CultureInfo.InvariantCulture) : string.Empty,
                request.Parity ?? string.Empty,
                request.DataBits.HasValue ? request.DataBits.Value.ToString(CultureInfo.InvariantCulture) : string.Empty,
                request.StopBits ?? string.Empty,
                request.ReadTimeoutMs.HasValue ? request.ReadTimeoutMs.Value.ToString(CultureInfo.InvariantCulture) : string.Empty,
                request.WriteTimeoutMs.HasValue ? request.WriteTimeoutMs.Value.ToString(CultureInfo.InvariantCulture) : string.Empty,
                request.Gsp != null && request.Gsp.ListenWindowMs.HasValue ? request.Gsp.ListenWindowMs.Value.ToString(CultureInfo.InvariantCulture) : string.Empty));

            try
            {
                if (string.Equals(request.SensorType, "SEF", StringComparison.OrdinalIgnoreCase))
                {
                    ProbeSef(result, request);
                    result.Success = string.IsNullOrWhiteSpace(result.Error);
                    LogSensorTestResult(result, startedAt, stopwatch.ElapsedMilliseconds);
                    return result;
                }

                SondeMetrologySettings metrologySettings = null;
                using (var database = DatabaseFactory.Create())
                {
                    var idLieu = database.getIDLieuBySerialNumber(request.Serial);
                    if (!string.IsNullOrWhiteSpace(request.ManualPort))
                    {
                        result.Port = request.ManualPort;
                        result.Address = request.ManualAddress;
                        result.Module = request.ManualModule;
                    }
                    else
                    {
                        if (idLieu <= 0)
                        {
                            result.Error = "Sonde introuvable dans la base et aucun port manuel n'a été fourni.";
                            result.Success = false;
                            LogSensorTestResult(result, startedAt, stopwatch.ElapsedMilliseconds);
                            return result;
                        }

                        var infos = database.getInfosByIdLieu(idLieu);
                        result.Port = infos.Item1;
                        result.Address = infos.Item3;
                        result.Module = infos.Item4;
                    }

                    if (IsMetrologyOperation(request.OperationContext) &&
                        IsMetrologyReadAction(request.Action))
                    {
                        // Une sonde de métrologie (notamment un étalon) peut ne pas être affectée
                        // à un lieu. Le port/module manuel suffit alors pour l'interroger.
                        // Sans lieu, aucun drapeau de configuration n'est à consommer.
                        metrologySettings = new SondeMetrologySettings
                        {
                            IdLieu = idLieu > 0 ? (int?)idLieu : null
                        };
                    }
                }

                result.Port = NormalizeSerialPortName(result.Port);
                if (string.IsNullOrWhiteSpace(result.Port))
                {
                    result.Error = "Port série introuvable pour cette sonde.";
                }
                else if (!string.Equals(request.SensorType, "GSP", StringComparison.OrdinalIgnoreCase))
                {
                    result.Error = "Type de sonde non supporte par l'outil hotline actuel.";
                }
                else
                {
                    ProbeGsp(result, request, result.Port, result.Address, metrologySettings);
                }
            }
            catch (Exception ex)
            {
                result.Error = ex.Message;
            }

            result.Success = string.IsNullOrWhiteSpace(result.Error);
            LogSensorTestResult(result, startedAt, stopwatch.ElapsedMilliseconds);
            return result;
        }

        private static void ProbeSef(SensorTestResult result, SensorTestRequest request)
        {
            var sef = SefProtocol.ReadTemperature(
                request.NetworkHost,
                request.NetworkPort,
                request.ProtocolAddress,
                request.ReadTimeoutMs,
                request.WriteTimeoutMs);

            result.NetworkHost = sef.NetworkHost;
            result.NetworkPort = sef.NetworkPort;
            result.ProtocolAddress = sef.ProtocolAddress;
            result.RequestedCommand = sef.Command;
            result.Value = sef.Value;
            result.Unit = sef.Unit;
            result.RawValue = sef.RawResponse;
            result.Error = sef.Error;

            foreach (var exchange in sef.Exchanges)
            {
                result.Exchanges.Add(new SensorExchange
                {
                    Direction = exchange.Direction,
                    Format = exchange.Format,
                    Content = exchange.Content,
                });
            }
        }

        private static SondeMetrologySettings LoadCurrentMetrologySettings(
            string serial,
            int? fallbackIdLieu)
        {
            using (var database = DatabaseFactory.Create())
            {
                var settings = database.getSondeMetrologyBySerialNumber(serial)
                    ?? new SondeMetrologySettings();
                if (!settings.IdLieu.HasValue || settings.IdLieu.Value <= 0)
                {
                    settings.IdLieu = fallbackIdLieu;
                }
                return settings;
            }
        }

        private static bool TrySetMetrologyDirtyFlag(int? idLieu, bool value)
        {
            if (!idLieu.HasValue || idLieu.Value <= 0)
            {
                return false;
            }

            using (var database = DatabaseFactory.Create())
            {
                return database.setLieuInfosModifiees(idLieu.Value, value);
            }
        }

        private static int GetRecommendedMemoReadTimeoutMs(int memoryCount)
        {
            if (memoryCount <= 20) return 10000;
            if (memoryCount <= 100) return 30000;
            if (memoryCount <= 500) return 120000;
            return 180000;
        }

        private static int GetRecommendedMemoListenWindowMs(int memoryCount)
        {
            if (memoryCount <= 20) return 1000;
            if (memoryCount <= 100) return 5000;
            if (memoryCount <= 500) return 15000;
            return 30000;
        }

        private static void ProbeGsp(
            SensorTestResult result,
            SensorTestRequest request,
            string portName,
            string address,
            SondeMetrologySettings metrologySettings)
        {
            var gsp = request.Gsp ?? new GspSensorTestRequest();
            var logPrefix = GetOperationLogPrefix(request.OperationContext);
            var targetSource = string.IsNullOrWhiteSpace(address) ? request.Serial : address;
            var target = GspProtocol.NormalizeCommandTarget(targetSource);
            var normalizedOperationContext = NormalizeOperationContext(request.OperationContext);
            var metrologyOperation = IsMetrologyOperation(normalizedOperationContext);

            Mutex namedMutex = null;
            var mutexAcquired = false;
            try
            {
                var mutexName = BuildPortMutexName(portName);
                namedMutex = new Mutex(false, mutexName);
                LogHotlineDetailed($"{logPrefix}[LOCK] status=waiting port={portName}; mutex={mutexName}; serial={request.Serial}; action={request.Action}");

                if (metrologyOperation)
                {
                    var queueTimeoutMs = Math.Max(
                        1000,
                        GetIntSetting("VigiSensys.Hotline.MetrologyPortQueueTimeoutMs", DefaultMetrologyPortQueueTimeoutMs));
                    var queueStartedAt = DateTime.UtcNow;
                    var queuedLogged = false;

                    while (!mutexAcquired &&
                           (DateTime.UtcNow - queueStartedAt).TotalMilliseconds < queueTimeoutMs)
                    {
                        try
                        {
                            mutexAcquired = namedMutex.WaitOne(0);
                        }
                        catch (AbandonedMutexException)
                        {
                            mutexAcquired = true;
                            VigitempServeur.Log($"{logPrefix}[LOCK] status=abandoned-acquired port={portName}; serial={request.Serial}; action={request.Action}");
                        }

                        if (mutexAcquired)
                        {
                            break;
                        }

                        if (!queuedLogged)
                        {
                            VigitempServeur.Log(
                                $"{logPrefix}[LOCK] status=queued port={portName}; serial={request.Serial}; action={request.Action}; priority=surveillance-first");
                            queuedLogged = true;
                        }

                        Thread.Sleep(MetrologyPortPollMs);
                    }

                    if (!mutexAcquired)
                    {
                        VigitempServeur.Log($"{logPrefix}[LOCK] status=queue-timeout port={portName}; serial={request.Serial}; action={request.Action}");
                        result.Error = "Le serveur est resté occupé trop longtemps. La lecture de métrologie n'a pas pu démarrer.";
                        return;
                    }

                    if (queuedLogged)
                    {
                        VigitempServeur.Log(
                            $"{logPrefix}[LOCK] status=dequeued port={portName}; serial={request.Serial}; action={request.Action}; priority=surveillance-first");
                    }
                }
                else
                {
                    try
                    {
                        var lockTimeoutMs = GetIntSetting("VigiSensys.Hotline.PortLockTimeoutMs", GetIntSetting("Vigitemp.Hotline.PortLockTimeoutMs", 5000));
                        mutexAcquired = namedMutex.WaitOne(TimeSpan.FromMilliseconds(Math.Max(1000, lockTimeoutMs)));
                    }
                    catch (AbandonedMutexException)
                    {
                        mutexAcquired = true;
                        VigitempServeur.Log($"{logPrefix}[LOCK] status=abandoned-acquired port={portName}; serial={request.Serial}; action={request.Action}");
                    }

                    if (!mutexAcquired)
                    {
                        VigitempServeur.Log($"{logPrefix}[LOCK] status=timeout port={portName}; serial={request.Serial}; action={request.Action}");
                        result.Error = "Port série occupé, impossible d'obtenir le verrou dans le délai imparti.";
                        return;
                    }
                }

                LogHotlineDetailed($"{logPrefix}[LOCK] status=acquired port={portName}; serial={request.Serial}; action={request.Action}");
                using (var port = CreatePort(portName, request))
                {
                    port.Open();
                    port.DiscardInBuffer();
                    port.DiscardOutBuffer();

                    if (metrologyOperation && IsMetrologyReadAction(request.Action))
                    {
                        metrologySettings = LoadCurrentMetrologySettings(
                            request.Serial,
                            metrologySettings != null ? metrologySettings.IdLieu : null);
                    }

                    if (request.Action == "sync-config" || gsp.SyncConfiguration)
                    {
                        foreach (var command in BuildGspSyncCommands(gsp))
                        {
                            result.RequestedCommand = GspProtocol.BuildCommand(command.Key, target, command.Value);
                            // Le mutex du port reste détenu pendant cette attente. Cela protège aussi
                            // les requêtes suivantes visant d’autres sondes du même module/port.
                            var response = SendGspCommand(
                                port,
                                result,
                                command.Key,
                                target,
                                command.Value,
                                true,
                                gsp.ListenWindowMs,
                                metrologyOperation
                                    ? MetrologyConfigurationCommandDelayMs
                                    : DefaultGspPostWriteDelayMs);
                            if (!string.IsNullOrWhiteSpace(response))
                            {
                                result.RawValue = response;
                                result.DetectedSerials = GspProtocol.ExtractDetectedSerials(response);
                            }
                        }
                        result.Unit = "config";
                        return;
                    }

                    if (request.Action == "read-config")
                    {
                        foreach (var prefix in new[] { "DD-H", "DCON" })
                        {
                            result.RequestedCommand = GspProtocol.BuildCommand(prefix, target, string.Empty);
                            var response = SendGspCommand(port, result, prefix, target, string.Empty, true, gsp.ListenWindowMs);
                            if (!string.IsNullOrWhiteSpace(response))
                            {
                                result.RawValue = response;
                                result.DetectedSerials = GspProtocol.ExtractDetectedSerials(response);
                            }
                        }
                        result.Unit = "config";
                        return;
                    }

                    if (request.Action == "read-memory")
                    {
                        var requestedMemoryCount = Math.Max(1, gsp.MemoryCount ?? 1);
                        var requestedMemoryOffset = Math.Max(0, gsp.MemoryOffset ?? 0);
                        if (!GspProtocol.TryNormalizeMemoryRequest(
                                requestedMemoryCount,
                                requestedMemoryOffset,
                                out var memoryCount,
                                out var memoryOffset))
                        {
                            result.Error = string.Format(
                                CultureInfo.InvariantCulture,
                                "La plage demandée dépasse la capacité mémoire de la sonde ({0} mesures maximum).",
                                GspProtocol.MaxMemoryMeasurementCount);
                            return;
                        }

                        var recommendedReadTimeoutMs = GetRecommendedMemoReadTimeoutMs(memoryCount);
                        var recommendedListenWindowMs = GetRecommendedMemoListenWindowMs(memoryCount);
                        var effectiveReadTimeoutMs = Math.Max(port.ReadTimeout, recommendedReadTimeoutMs);
                        var effectiveListenWindowMs = Math.Max(gsp.ListenWindowMs ?? 0, recommendedListenWindowMs);

                        if (effectiveReadTimeoutMs != port.ReadTimeout)
                        {
                            port.ReadTimeout = effectiveReadTimeoutMs;
                        }

                        AddExchange(result, "info", "ascii", string.Format(CultureInfo.InvariantCulture,
                            "<memo-timeout readTimeoutMs={0} listenWindowMs={1} count={2}>",
                            effectiveReadTimeoutMs,
                            effectiveListenWindowMs,
                            memoryCount));

                        var payload = memoryCount.ToString(CultureInfo.InvariantCulture) + "x";
                        if (gsp.MemoryOffset.HasValue)
                        {
                            payload += memoryOffset.ToString(CultureInfo.InvariantCulture) + "o";
                        }
                        result.RequestedCommand = GspProtocol.BuildCommand("MEMO", target, payload);
                        var response = SendGspCommand(port, result, "MEMO", target, payload, false, effectiveListenWindowMs);
                        result.RawValue = response;
                        result.DetectedSerials = GspProtocol.ExtractDetectedSerials(response);
                        result.Unit = "memory";
                        if (string.IsNullOrWhiteSpace(response))
                        {
                            result.Error = "Aucune réponse reçue pour la demande mémoire.";
                            return;
                        }

                        if (!GspProtocol.TryParseMemoResponse(response, target, out var parsedMemory))
                        {
                            result.Error = IsCommandEchoOnly(response, result.RequestedCommand)
                                ? "Réponse reçue mais elle correspond uniquement à un écho de la commande."
                                : "Réponse reçue mais aucune mesure mémoire exploitable n'a été détectée.";
                            return;
                        }

                        result.Value = parsedMemory.ReturnedCount ?? parsedMemory.Measurements.Count;
                        return;
                    }

                    if (request.Action == "raw")
                    {
                        var rawCommand = (gsp.RawCommand ?? string.Empty).Trim();
                        var rawReadsTemperature = rawCommand.StartsWith("TEMP", StringComparison.OrdinalIgnoreCase)
                            || rawCommand.StartsWith("FTEM", StringComparison.OrdinalIgnoreCase)
                            || rawCommand.StartsWith("RTEMP", StringComparison.OrdinalIgnoreCase);
                        var rawIsEcon = rawCommand.StartsWith("ECON", StringComparison.OrdinalIgnoreCase);

                        if (metrologyOperation && rawIsEcon)
                        {
                            if (!TryBuildCompactMetrologyEconCommand(rawCommand, target, out var compactCommand))
                            {
                                result.Error = "La commande ECON de métrologie doit contenir les coefficients A, B et C dans cet ordre.";
                                return;
                            }

                            result.RequestedCommand = compactCommand;
                            AddExchange(
                                result,
                                "info",
                                "ascii",
                                string.Format(
                                    CultureInfo.InvariantCulture,
                                    "<metrology-econ compact=abc sourceChars={0} sentChars={1}>",
                                    rawCommand.Length,
                                    compactCommand.Length));

                            var compactResponse = SendRawCommand(
                                port,
                                result,
                                compactCommand,
                                false,
                                gsp.ListenWindowMs,
                                MetrologyConfigurationCommandDelayMs);
                            result.RawValue = compactResponse;
                            result.DetectedSerials = GspProtocol.ExtractDetectedSerials(compactResponse);
                            if (!IsEconAcknowledged(compactResponse))
                            {
                                result.Error = "La commande ECON compacte A/B/C n'a pas été acquittée.";
                                return;
                            }

                            result.Unit = "config";
                            return;
                        }

                        result.RequestedCommand = gsp.RawCommand;
                        var response = SendRawCommand(port, result, gsp.RawCommand, false, gsp.ListenWindowMs);
                        result.RawValue = response;
                        result.DetectedSerials = GspProtocol.ExtractDetectedSerials(response);
                        var econAcknowledged = rawIsEcon && IsEconAcknowledged(response);

                        if (econAcknowledged)
                        {
                            result.Unit = "config";
                        }
                        else if (rawReadsTemperature && GspProtocol.TryExtractTemperature(response, target, out var targetedRawValue, out var targetedUnit))
                        {
                            result.Value = targetedRawValue;
                            result.Unit = FormatGspUnitForHotline(targetedUnit);
                        }
                        else if (!rawReadsTemperature && TryExtractGspValue(response, gsp.RawCommand, out var rawValue))
                        {
                            result.Value = rawValue;
                        }
                        else if (IsCommandEchoOnly(response, gsp.RawCommand))
                        {
                            result.Error = "Réponse reçue mais elle correspond uniquement à un écho de la commande.";
                        }
                        else if (!string.IsNullOrWhiteSpace(response))
                        {
                            result.Error = "Réponse reçue mais aucune valeur exploitable pour la sonde demandée n'a été détectée.";
                        }
                        return;
                    }

                    if (metrologyOperation && IsMetrologyReadAction(request.Action))
                    {
                        if (metrologySettings != null && metrologySettings.InfosModifiees)
                        {
                            var idLieu = metrologySettings.IdLieu;
                            if (!TrySetMetrologyDirtyFlag(idLieu, false))
                            {
                                result.Error = "Impossible de réserver la mise à jour des coefficients avant l'interrogation.";
                                return;
                            }

                            var mustRestoreDirtyFlag = true;
                            try
                            {
                                // Le démarrage d'ajustage peut envoyer les coefficients neutres via une
                                // commande raw. Ici, une modification explicite depuis le portail doit
                                // toujours envoyer les coefficients physiques a, b et c enregistrés.
                                var coefficientsPayload = GspProtocol.BuildMetrologyCoefficientsPayload(
                                    metrologySettings,
                                    false);
                                var coefficientsCommand = GspProtocol.BuildCommand(
                                    "ECON",
                                    target,
                                    coefficientsPayload);

                                result.RequestedCommand = coefficientsCommand;
                                AddExchange(
                                    result,
                                    "info",
                                    "ascii",
                                    $"<metrology-read-econ reason=coefficients-modified part=a-b-c length={coefficientsCommand.Length}>");
                                VigitempServeur.Log(
                                    $"{logPrefix}[CFG] serial={request.Serial} idLieu={idLieu} infosModifiees=1 action=send-econ-abc");

                                var coefficientsResponse = SendGspCommand(
                                    port,
                                    result,
                                    "ECON",
                                    target,
                                    coefficientsPayload,
                                    false,
                                    gsp.ListenWindowMs,
                                    MetrologyConfigurationCommandDelayMs);
                                if (!IsEconAcknowledged(coefficientsResponse))
                                {
                                    result.RawValue = coefficientsResponse;
                                    result.DetectedSerials = GspProtocol.ExtractDetectedSerials(coefficientsResponse);
                                    result.Error = "La commande ECON des coefficients A, B et C préalable à la lecture n'a pas été acquittée.";
                                    return;
                                }

                                mustRestoreDirtyFlag = false;
                                VigitempServeur.Log(
                                    $"{logPrefix}[CFG] serial={request.Serial} idLieu={idLieu} infosModifiees=0 action=econ-abc-ack");
                            }
                            finally
                            {
                                if (mustRestoreDirtyFlag)
                                {
                                    var restored = TrySetMetrologyDirtyFlag(idLieu, true);
                                    VigitempServeur.Log(
                                        $"{logPrefix}[CFG] serial={request.Serial} idLieu={idLieu} infosModifiees=1 action=restore-after-econ-failure status={(restored ? "ok" : "error")}");
                                }
                            }
                        }
                        else
                        {
                            LogHotlineDetailed(
                                $"{logPrefix}[CFG] serial={request.Serial} idLieu={metrologySettings?.IdLieu} infosModifiees=0 action=skip-econ");
                        }
                    }

                    var readPrefix = string.Equals(request.Action, "force-read", StringComparison.OrdinalIgnoreCase) ? "FTEM" : "TEMP";
                    result.RequestedCommand = GspProtocol.BuildCommand(readPrefix, target, string.Empty);
                    var readResponse = SendGspCommand(port, result, readPrefix, target, string.Empty, false, gsp.ListenWindowMs);
                    var operationContext = NormalizeOperationContext(request.OperationContext);
                    var isMetrologyRead = string.Equals(operationContext, "AJUSTAGE", StringComparison.Ordinal)
                        || string.Equals(operationContext, "ETALONNAGE", StringComparison.Ordinal);
                    if (string.IsNullOrWhiteSpace(readResponse) && !isMetrologyRead)
                    {
                        AddExchange(result, "info", "ascii", "<wait-10s-before-retry>");
                        Thread.Sleep(10000);
                        readResponse = SendGspCommand(port, result, readPrefix, target, string.Empty, false, gsp.ListenWindowMs);
                    }

                    result.RawValue = readResponse;
                    result.DetectedSerials = GspProtocol.ExtractDetectedSerials(readResponse);
                    if (!GspProtocol.TryExtractTemperature(readResponse, target, out var value, out var unit))
                    {
                        result.Error = string.IsNullOrWhiteSpace(readResponse)
                            ? "Aucune réponse reçue pour la lecture de la sonde."
                            : IsCommandEchoOnly(readResponse, result.RequestedCommand)
                                ? "Réponse reçue mais elle correspond uniquement à un écho de la commande."
                                : "Aucune température exploitable pour la sonde demandée dans la réponse GSP.";
                        return;
                    }

                    result.Value = value;
                    result.Unit = FormatGspUnitForHotline(unit);
                }
            }
            finally
            {
                if (mutexAcquired && namedMutex != null)
                {
                    try
                    {
                        if (metrologyOperation && IsMetrologyReadAction(request.Action))
                        {
                            var interrogationGapMs = Math.Max(
                                0,
                                GetIntSetting(
                                    "VigiSensys.Hotline.MetrologyInterrogationGapMs",
                                    DefaultMetrologyInterrogationGapMs));
                            if (interrogationGapMs > 0)
                            {
                                Thread.Sleep(interrogationGapMs);
                            }
                        }

                        namedMutex.ReleaseMutex();
                        LogHotlineDetailed($"{logPrefix}[LOCK] status=released port={portName}; serial={request.Serial}; action={request.Action}");
                    }
                    catch (ApplicationException)
                    {
                    }
                }
                if (namedMutex != null)
                {
                    namedMutex.Dispose();
                }
            }
        }

        private static string BuildPortMutexName(string portName)
        {
            var normalized = string.IsNullOrWhiteSpace(portName)
                ? "__NO_PORT__"
                : portName.Trim().ToUpperInvariant();
            var safe = new string(normalized.Select(ch => char.IsLetterOrDigit(ch) ? ch : '_').ToArray());
            return "Global\\VigitempSerialPort_" + safe;
        }

        private static bool IsMetrologyReadAction(string action)
        {
            return string.Equals(action, "read", StringComparison.OrdinalIgnoreCase)
                || string.Equals(action, "force-read", StringComparison.OrdinalIgnoreCase);
        }

        private static bool IsMetrologyOperation(string operationContext)
        {
            var normalized = NormalizeOperationContext(operationContext);
            return string.Equals(normalized, "AJUSTAGE", StringComparison.Ordinal)
                || string.Equals(normalized, "ETALONNAGE", StringComparison.Ordinal);
        }

        private static bool IsMetrologyMeasurementRequest(SensorTestRequest request)
        {
            if (request == null || !IsMetrologyOperation(request.OperationContext))
            {
                return false;
            }

            if (string.Equals(request.Action, "read", StringComparison.OrdinalIgnoreCase)
                || string.Equals(request.Action, "force-read", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            if (!string.Equals(request.Action, "raw", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            var rawCommand = (request.Gsp?.RawCommand ?? string.Empty).Trim();
            return rawCommand.StartsWith("TEMP", StringComparison.OrdinalIgnoreCase)
                || rawCommand.StartsWith("FTEM", StringComparison.OrdinalIgnoreCase)
                || rawCommand.StartsWith("RTEMP", StringComparison.OrdinalIgnoreCase);
        }

        private static bool TryBuildCompactMetrologyEconCommand(string rawCommand, string target, out string compactCommand)
        {
            compactCommand = string.Empty;
            var normalizedCommand = (rawCommand ?? string.Empty).Trim();
            var normalizedTarget = GspProtocol.NormalizeCommandTarget(target);
            if (string.IsNullOrWhiteSpace(normalizedCommand) || string.IsNullOrWhiteSpace(normalizedTarget))
            {
                return false;
            }

            var expectedPrefix = "ECON" + normalizedTarget;
            if (!normalizedCommand.StartsWith(expectedPrefix, StringComparison.OrdinalIgnoreCase)
                || normalizedCommand.Length <= expectedPrefix.Length
                || !char.IsWhiteSpace(normalizedCommand[expectedPrefix.Length]))
            {
                return false;
            }

            var payload = normalizedCommand.Substring(expectedPrefix.Length).Trim();
            var coefficientAEnd = payload.IndexOf('a');
            var coefficientBEnd = coefficientAEnd < 0 ? -1 : payload.IndexOf('b', coefficientAEnd + 1);
            var coefficientCEnd = coefficientBEnd < 0 ? -1 : payload.IndexOf('c', coefficientBEnd + 1);
            if (coefficientAEnd <= 0
                || coefficientBEnd <= coefficientAEnd + 1
                || coefficientCEnd <= coefficientBEnd + 1)
            {
                return false;
            }

            if (!double.TryParse(
                    payload.Substring(0, coefficientAEnd),
                    NumberStyles.Float,
                    CultureInfo.InvariantCulture,
                    out _)
                || !double.TryParse(
                    payload.Substring(coefficientAEnd + 1, coefficientBEnd - coefficientAEnd - 1),
                    NumberStyles.Float,
                    CultureInfo.InvariantCulture,
                    out _)
                || !double.TryParse(
                    payload.Substring(coefficientBEnd + 1, coefficientCEnd - coefficientBEnd - 1),
                    NumberStyles.Float,
                    CultureInfo.InvariantCulture,
                    out _))
            {
                return false;
            }

            var compactPayload = payload.Substring(0, coefficientCEnd + 1);
            compactCommand = GspProtocol.BuildCommand("ECON", normalizedTarget, compactPayload);
            return true;
        }

        private static string NormalizeOperationContext(string value)
        {
            var normalized = (value ?? string.Empty).Trim();
            if (string.Equals(normalized, "AJUSTAGE", StringComparison.OrdinalIgnoreCase)) return "AJUSTAGE";
            if (string.Equals(normalized, "ETALONNAGE", StringComparison.OrdinalIgnoreCase)) return "ETALONNAGE";
            return "HOTLINE";
        }

        private static string GetOperationLogPrefix(string operationContext)
        {
            return "[" + NormalizeOperationContext(operationContext) + "]";
        }

        private static string NormalizeSerialPortName(string portName)
        {
            var normalized = (portName ?? string.Empty).Trim();
            if (normalized.Length == 0) return string.Empty;

            int numericPort;
            if (int.TryParse(normalized, NumberStyles.None, CultureInfo.InvariantCulture, out numericPort))
            {
                return "COM" + numericPort.ToString(CultureInfo.InvariantCulture);
            }

            var match = System.Text.RegularExpressions.Regex.Match(
                normalized,
                @"^COM\s*(\d+)$",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);
            return match.Success ? "COM" + match.Groups[1].Value : normalized;
        }

        private static IEnumerable<KeyValuePair<string, string>> BuildGspSyncCommands(GspSensorTestRequest gsp)
        {
            // CHAN is never inferred from the probe address. It is only sent when
            // the hotline caller explicitly provides a channel.
            var channel = (gsp.Channel ?? string.Empty).Trim();
            SondeMetrologySettings metrology = null;
            if (gsp.CoeffA.HasValue || gsp.CoeffB.HasValue || gsp.AccuracyError.HasValue)
            {
                metrology = new SondeMetrologySettings
                {
                    CoeffX = gsp.CoeffA ?? 1d,
                    CoeffConstant = gsp.CoeffB ?? 0d,
                    ErrJustesse = gsp.AccuracyError,
                };
            }

            return GspProtocol.BuildConfigurationCommands(
                channel: channel,
                metrology: metrology,
                highLimit: gsp.HighLimit,
                lowLimit: gsp.LowLimit,
                alarmDelayLowMinutes: Math.Max(0, gsp.AlarmDelayLowMinutes ?? gsp.AlarmDelayMinutes ?? 0),
                alarmDelayHighMinutes: Math.Max(0, gsp.AlarmDelayHighMinutes ?? gsp.AlarmDelayMinutes ?? 0),
                frequencySeconds: Math.Max(1, gsp.FrequencySeconds ?? 60));
        }

        private static string SendGspCommand(SerialPort port, SensorTestResult result, string prefix, string target, string payload, bool allowEmptyResponse, int? listenWindowMs, int postWriteDelayMs = DefaultGspPostWriteDelayMs)
        {
            if (string.IsNullOrWhiteSpace(prefix)) return string.Empty;

            var baseCommand = GspProtocol.BuildCommand(prefix, target, payload);
            if (string.Equals(prefix, "ECON", StringComparison.OrdinalIgnoreCase)
                && baseCommand.Length > GspProtocol.MaxModuleCommandCharacters)
            {
                if (!GspProtocol.TryBuildCommandFragments(
                        prefix,
                        target,
                        payload,
                        GspProtocol.MaxModuleCommandCharacters,
                        out var econCommands))
                {
                    AddExchange(result, "info", "ascii", "<econ-split status=rejected reason=unsplittable>");
                    return string.Empty;
                }

                AddExchange(
                    result,
                    "info",
                    "ascii",
                    string.Format(
                        CultureInfo.InvariantCulture,
                        "<econ-split parts={0} maxChars={1}>",
                        econCommands.Count,
                        GspProtocol.MaxModuleCommandCharacters));

                var commandHead = "ECON" + (target ?? string.Empty).Trim();
                var lastResponse = string.Empty;
                for (var partIndex = 0; partIndex < econCommands.Count; partIndex++)
                {
                    var fragment = econCommands[partIndex];
                    var fragmentPayload = fragment.Substring(commandHead.Length).Trim();
                    lastResponse = SendGspCommand(
                        port,
                        result,
                        "ECON",
                        target,
                        fragmentPayload,
                        false,
                        listenWindowMs,
                        postWriteDelayMs);
                    if (!IsEconAcknowledged(lastResponse))
                    {
                        AddExchange(result, "info", "ascii", $"<econ-split status=ack-mismatch part={partIndex + 1}/{econCommands.Count}>");
                        return lastResponse;
                    }
                }

                return lastResponse;
            }

            var commands = GspProtocol.BuildCandidateCommands(baseCommand).ToList();
            for (var index = 0; index < commands.Count; index++)
            {
                var command = commands[index];
                var drained = DrainBufferedData(port);
                if (!string.IsNullOrWhiteSpace(drained)) AddExchange(result, "drain", "ascii", EscapeForLog(drained));

                port.DiscardInBuffer();
                port.DiscardOutBuffer();
                AddExchange(result, "tx", "ascii", EscapeForLog(command));
                var commandBytes = GspProtocol.EncodeCommand(command);
                port.Write(commandBytes, 0, commandBytes.Length);
                Thread.Sleep(Math.Max(0, postWriteDelayMs));

                string response;
                try
                {
                    response = ReadGspResponse(port, command, listenWindowMs);
                }
                finally
                {
                    PurgeAfterGspCommand(port, result);
                }
                if (!string.IsNullOrWhiteSpace(response))
                {
                    AddExchange(result, "rx", "ascii", response.Trim());
                    return response.Trim();
                }

                AddExchange(result, "rx", "ascii", "<empty>");
                if (allowEmptyResponse && index == commands.Count - 1) return string.Empty;
            }

            AddExchange(result, "rx", "ascii", "<timeout>");
            return string.Empty;
        }

        private static bool IsEconAcknowledged(string response)
        {
            return System.Text.RegularExpressions.Regex.IsMatch(
                response ?? string.Empty,
                @"(?:^|\r?\n)\s*ACK\s*=\s*ECON\b",
                System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        }

        private static string SendRawCommand(
            SerialPort port,
            SensorTestResult result,
            string rawCommand,
            bool allowEmptyResponse,
            int? listenWindowMs,
            int postWriteDelayMs = 200)
        {
            if (string.IsNullOrWhiteSpace(rawCommand))
            {
                AddExchange(result, "rx", "ascii", "<raw-command-empty>");
                return string.Empty;
            }

            foreach (var command in GspProtocol.BuildCandidateCommands(rawCommand))
            {
                var drained = DrainBufferedData(port);
                if (!string.IsNullOrWhiteSpace(drained)) AddExchange(result, "drain", "ascii", EscapeForLog(drained));

                port.DiscardInBuffer();
                port.DiscardOutBuffer();
                AddExchange(result, "tx", "ascii", EscapeForLog(command));
                var commandBytes = GspProtocol.EncodeCommand(command);
                port.Write(commandBytes, 0, commandBytes.Length);
                Thread.Sleep(Math.Max(0, postWriteDelayMs));

                string response;
                try
                {
                    response = ReadGspResponse(port, command, listenWindowMs);
                }
                finally
                {
                    PurgeAfterGspCommand(port, result);
                }
                if (!string.IsNullOrWhiteSpace(response))
                {
                    AddExchange(result, "rx", "ascii", response.Trim());
                    return response.Trim();
                }

                AddExchange(result, "rx", "ascii", "<empty>");
                if (allowEmptyResponse) return string.Empty;
            }

            AddExchange(result, "rx", "ascii", "<timeout>");
            return string.Empty;
        }

        private static string DrainBufferedData(SerialPort port)
        {
            var startedAt = DateTime.UtcNow;
            var buffer = string.Empty;
            DateTime? lastDataAt = null;
            while ((DateTime.UtcNow - startedAt).TotalMilliseconds < GspBufferDrainMs)
            {
                Thread.Sleep(25);
                var chunk = port.ReadExisting();
                if (string.IsNullOrEmpty(chunk))
                {
                    if (lastDataAt.HasValue && (DateTime.UtcNow - lastDataAt.Value).TotalMilliseconds >= 100) break;
                    continue;
                }
                buffer += chunk;
                lastDataAt = DateTime.UtcNow;
                if (GspProtocol.HasEndTerminator(buffer))
                {
                    break;
                }
            }
            return buffer.Trim();
        }

        private static void PurgeAfterGspCommand(SerialPort port, SensorTestResult result)
        {
            if (port == null || !port.IsOpen) return;

            var startedAt = DateTime.UtcNow;
            var quietSince = startedAt;
            var buffer = string.Empty;
            while ((DateTime.UtcNow - startedAt).TotalMilliseconds < GspPostCommandDrainMs)
            {
                Thread.Sleep(25);
                var chunk = port.ReadExisting();
                if (!string.IsNullOrEmpty(chunk))
                {
                    buffer += chunk;
                    quietSince = DateTime.UtcNow;
                    continue;
                }

                if ((DateTime.UtcNow - quietSince).TotalMilliseconds >= GspPostCommandQuietMs) break;
            }

            port.DiscardInBuffer();
            port.DiscardOutBuffer();
            if (!string.IsNullOrWhiteSpace(buffer))
            {
                AddExchange(result, "purge", "ascii", EscapeForLog(buffer.Trim()));
            }
        }

        private static string StripGspTransportNoise(string response)
        {
            var normalized = (response ?? string.Empty).Trim();
            if (normalized.Length == 0) return string.Empty;

            // Certains modules passent brièvement par leur séquence de contrôle « +++ »
            // avant de délivrer la vraie réponse de la sonde. Cette séquence n'est pas une
            // réponse GSP et ne doit surtout pas démarrer le délai de silence de fin de trame.
            // On ne retire que le token exact « +++ », jamais les '+' contenus dans une
            // valeur métier (par exemple Alarm=F+D+E+LH+LB+RB+RH).
            while (normalized.StartsWith("+++", StringComparison.Ordinal))
            {
                normalized = normalized.Substring(3).TrimStart();
            }

            if (normalized.Length == 0) return string.Empty;

            var lines = normalized
                .Replace("\r\n", "\n")
                .Replace('\r', '\n')
                .Split(new[] { '\n' }, StringSplitOptions.None)
                .Where(line => !string.Equals(line.Trim(), "+++", StringComparison.Ordinal));

            return string.Join(Environment.NewLine, lines).Trim();
        }

        private static string ReadGspResponse(SerialPort port, string command, int? listenWindowMs)
        {
            var endOfResponseSilenceMs = listenWindowMs.HasValue && listenWindowMs.Value > 0
                ? listenWindowMs.Value
                : GspEndOfResponseSilenceMs;
            var startedAt = DateTime.UtcNow;
            var buffer = string.Empty;
            DateTime? lastMeaningfulDataAt = null;
            while ((DateTime.UtcNow - startedAt).TotalMilliseconds < port.ReadTimeout)
            {
                Thread.Sleep(50);
                var chunk = port.ReadExisting();
                if (string.IsNullOrEmpty(chunk))
                {
                    if (lastMeaningfulDataAt.HasValue &&
                        (DateTime.UtcNow - lastMeaningfulDataAt.Value).TotalMilliseconds >= endOfResponseSilenceMs)
                    {
                        break;
                    }
                    continue;
                }

                buffer += chunk;
                var responseWithoutEcho = StripGspTransportNoise(
                    GspProtocol.StripCommandEcho(buffer, command));
                if (string.IsNullOrWhiteSpace(responseWithoutEcho))
                {
                    continue;
                }

                lastMeaningfulDataAt = DateTime.UtcNow;
                if (GspProtocol.HasEndTerminator(responseWithoutEcho))
                {
                    break;
                }
            }

            return StripGspTransportNoise(
                GspProtocol.StripCommandEcho(buffer, command));
        }

        private static SerialPort CreatePort(string portName, SensorTestRequest request)
        {
            var parity = Parity.None;
            if (!string.IsNullOrWhiteSpace(request.Parity)) Enum.TryParse(request.Parity, true, out parity);
            var stopBits = StopBits.One;
            if (!string.IsNullOrWhiteSpace(request.StopBits)) Enum.TryParse(request.StopBits, true, out stopBits);

            return new SerialPort
            {
                PortName = portName,
                BaudRate = request.BaudRate ?? 9600,
                Parity = parity,
                DataBits = request.DataBits ?? 8,
                StopBits = stopBits,
                DtrEnable = false,
                RtsEnable = false,
                Handshake = Handshake.None,
                ReadTimeout = request.ReadTimeoutMs ?? 5000,
                WriteTimeout = request.WriteTimeoutMs ?? 5000,
            };
        }

        private static int? ValueOrNullInt(JToken token)
        {
            if (token == null || token.Type == JTokenType.Null) return null;
            int parsed;
            return int.TryParse(token.ToString(), NumberStyles.Integer, CultureInfo.InvariantCulture, out parsed) ? (int?)parsed : null;
        }

        private static double? ValueOrNullDouble(JToken token)
        {
            if (token == null || token.Type == JTokenType.Null) return null;
            double parsed;
            var raw = token.ToString().Replace(',', '.');
            return double.TryParse(raw, NumberStyles.Float | NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out parsed) ? (double?)parsed : null;
        }

        private static bool TryExtractNumber(string response, out double value)
        {
            value = 0d;
            if (string.IsNullOrWhiteSpace(response)) return false;
            var matches = System.Text.RegularExpressions.Regex.Matches(response, @"-?\d+(?:[.,]\d+)?");
            for (var index = matches.Count - 1; index >= 0; index--)
            {
                var candidate = matches[index].Value.Replace(',', '.');
                if (double.TryParse(candidate, NumberStyles.Float | NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out value)) return true;
            }
            return false;
        }

        private static bool TryExtractGspValue(string response, string sentCommand, out double value)
        {
            value = 0d;
            var sanitized = StripCommandEcho(response, sentCommand);
            return !string.IsNullOrWhiteSpace(sanitized) && TryExtractNumber(sanitized, out value);
        }

        private static bool IsCommandEchoOnly(string response, string sentCommand)
        {
            return GspProtocol.IsCommandEchoOnly(response, sentCommand);
        }

        private static string StripCommandEcho(string response, string sentCommand)
        {
            return GspProtocol.StripCommandEcho(response, sentCommand);
        }

        private static void AddExchange(SensorTestResult result, string direction, string format, string content)
        {
            result.Exchanges.Add(new SensorExchange { Direction = direction, Format = format, Content = content ?? string.Empty });
        }

        private static void LogSensorTestResult(SensorTestResult result, DateTimeOffset startedAt, long elapsedMs)
        {
            var detectedSerials = result.DetectedSerials == null || result.DetectedSerials.Count == 0 ? string.Empty : string.Join(",", result.DetectedSerials);
            var logPrefix = GetOperationLogPrefix(result.OperationContext);
            VigitempServeur.Log(string.Format(CultureInfo.InvariantCulture,
                "{0}[DONE] status={1} startedAt={2} elapsedMs={3} type={4} serial={5} action={6} command={7} port={8} value={9}{10} detected={11} error={12}",
                logPrefix,
                result.Success ? "ok" : "error",
                startedAt.ToString("O", CultureInfo.InvariantCulture),
                elapsedMs,
                result.SensorType ?? string.Empty,
                result.Serial ?? string.Empty,
                result.Action ?? string.Empty,
                result.RequestedCommand ?? string.Empty,
                result.Port ?? string.Empty,
                result.Value.HasValue ? result.Value.Value.ToString(CultureInfo.InvariantCulture) : string.Empty,
                result.Unit ?? string.Empty,
                detectedSerials,
                EscapeForLog(result.Error ?? string.Empty)));

            if (result.Exchanges == null || result.Exchanges.Count == 0)
            {
                return;
            }

            var exchanges = string.Join(" || ", result.Exchanges.Select(exchange => string.Format(
                CultureInfo.InvariantCulture,
                "{0}[{1}]={2}",
                (exchange.Direction ?? string.Empty).ToUpperInvariant(),
                exchange.Format ?? string.Empty,
                EscapeForLog(exchange.Content ?? string.Empty))));

            VigitempServeur.Log(string.Format(
                CultureInfo.InvariantCulture,
                "{0}[IO] serial={1} action={2} {3}",
                logPrefix,
                result.Serial ?? string.Empty,
                result.Action ?? string.Empty,
                TruncateForLog(exchanges, MaxExchangeLogLength)));
        }

        private static void LogHotlineDetailed(string message)
        {
            if (!GetBoolSetting("Vigitemp.Hotline.LogDetailed", false)) return;
            VigitempServeur.Log(message);
        }

        private static string TruncateForLog(string value, int maxLength)
        {
            if (string.IsNullOrEmpty(value) || value.Length <= maxLength) return value ?? string.Empty;
            return value.Substring(0, Math.Max(0, maxLength)) + "...[truncated]";
        }

        private static JObject ReadJson(HttpListenerRequest request)
        {
            using (var reader = new StreamReader(request.InputStream, request.ContentEncoding ?? Encoding.UTF8))
            {
                var body = reader.ReadToEnd();
                return string.IsNullOrWhiteSpace(body) ? new JObject() : JObject.Parse(body);
            }
        }

        private static void WriteJson(HttpListenerResponse response, int statusCode, object payload)
        {
            response.StatusCode = statusCode;
            var json = JsonConvert.SerializeObject(payload);
            var bytes = Encoding.UTF8.GetBytes(json);
            response.OutputStream.Write(bytes, 0, bytes.Length);
            response.OutputStream.Flush();
            response.OutputStream.Close();
        }

        private static string GetSetting(string key, string defaultValue)
        {
            try
            {
                var value = ConfigurationManager.AppSettings[key];
                return string.IsNullOrWhiteSpace(value) ? defaultValue : value;
            }
            catch { return defaultValue; }
        }

        private static int GetIntSetting(string key, int defaultValue)
        {
            var rawValue = GetSetting(key, string.Empty);
            return int.TryParse(rawValue, out var value) ? value : defaultValue;
        }

        private static bool GetBoolSetting(string key, bool defaultValue)
        {
            var rawValue = GetSetting(key, string.Empty);
            return bool.TryParse(rawValue, out var value) ? value : defaultValue;
        }

        private static bool ValidateApiKey(HttpListenerRequest request)
        {
            var expected = GetSetting("VigiSensys.Hotline.ApiKey", GetSetting("Vigitemp.Hotline.ApiKey", string.Empty));
            if (string.IsNullOrWhiteSpace(expected)) return true;
            var provided =
                request.Headers["x-vigisensys-hotline-key"] ??
                request.Headers["x-vigitemp-hotline-key"];
            return string.Equals(expected, provided, StringComparison.Ordinal);
        }

        private static string EscapeForLog(string value)
        {
            var escaped = (value ?? string.Empty).Replace("\r", "\\r").Replace("\n", "\\n");
            var trailingSpaces = escaped.Length - escaped.TrimEnd(' ').Length;
            if (trailingSpaces <= 0)
            {
                return escaped;
            }

            return escaped.TrimEnd(' ') + new string(' ', trailingSpaces).Replace(" ", "<space>");
        }

        private static string FormatGspUnitForHotline(string unit)
        {
            return string.Equals(unit, "C", StringComparison.OrdinalIgnoreCase) ? "°C" : unit;
        }
    }
}
