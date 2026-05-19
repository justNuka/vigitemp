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
        private const int GspEndOfResponseSilenceMs = 500;

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
            public int? BaudRate { get; set; }
            public string Parity { get; set; }
            public int? DataBits { get; set; }
            public string StopBits { get; set; }
            public int? ReadTimeoutMs { get; set; }
            public int? WriteTimeoutMs { get; set; }
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
            VigitempServeur.Log("Hotline API started on " + prefix);
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
                    VigitempServeur.Log("Hotline API error: " + ex.Message);
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
                VigitempServeur.Log("Hotline API failure: " + ex);
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
            var result = new SensorTestResult
            {
                SensorType = request.SensorType,
                Serial = request.Serial,
                Action = request.Action,
            };

            VigitempServeur.Log(string.Format(CultureInfo.InvariantCulture,
                "Hotline sensor-test request: type={0}; serial={1}; action={2}; manualPort={3}; manualAddress={4}; manualModule={5}; baudRate={6}; parity={7}; dataBits={8}; stopBits={9}; readTimeoutMs={10}; writeTimeoutMs={11}; listenWindowMs={12}",
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
                using (var database = DatabaseFactory.Create())
                {
                    if (!string.IsNullOrWhiteSpace(request.ManualPort))
                    {
                        result.Port = request.ManualPort;
                        result.Address = request.ManualAddress;
                        result.Module = request.ManualModule;
                    }
                    else
                    {
                        var idLieu = database.getIDLieuBySerialNumber(request.Serial);
                        if (idLieu <= 0)
                        {
                            result.Error = "Sonde introuvable dans la base et aucun port manuel n'a été fourni.";
                            result.Success = false;
                            LogSensorTestResult(result);
                            return result;
                        }

                        var infos = database.getInfosByIdLieu(idLieu);
                        result.Port = infos.Item1;
                        result.Address = infos.Item3;
                        result.Module = infos.Item4;
                    }
                }

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
                    ProbeGsp(result, request, result.Port, result.Address);
                }
            }
            catch (Exception ex)
            {
                result.Error = ex.Message;
            }

            result.Success = string.IsNullOrWhiteSpace(result.Error);
            LogSensorTestResult(result);
            return result;
        }

        private static int GetRecommendedMemoReadTimeoutMs(int memoryCount)
        {
            if (memoryCount <= 20) return 10000;
            if (memoryCount <= 100) return 30000;
            if (memoryCount <= 500) return 90000;
            return 180000;
        }

        private static int GetRecommendedMemoListenWindowMs(int memoryCount)
        {
            if (memoryCount <= 20) return 1000;
            if (memoryCount <= 100) return 5000;
            if (memoryCount <= 500) return 15000;
            return 30000;
        }

        private static void ProbeGsp(SensorTestResult result, SensorTestRequest request, string portName, string address)
        {
            var gsp = request.Gsp ?? new GspSensorTestRequest();
            var targetSource = string.IsNullOrWhiteSpace(address) ? request.Serial : address;
            var target = GspProtocol.NormalizeCommandTarget(targetSource);

            Mutex namedMutex = null;
            var mutexAcquired = false;
            try
            {
                var mutexName = BuildPortMutexName(portName);
                namedMutex = new Mutex(false, mutexName);
                VigitempServeur.Log($"Hotline sensor-test port-lock waiting: port={portName}; mutex={mutexName}; serial={request.Serial}; action={request.Action}");
                try
                {
                    var lockTimeoutMs = GetIntSetting("VigiSensys.Hotline.PortLockTimeoutMs", GetIntSetting("Vigitemp.Hotline.PortLockTimeoutMs", 5000));
                    mutexAcquired = namedMutex.WaitOne(TimeSpan.FromMilliseconds(Math.Max(1000, lockTimeoutMs)));
                }
                catch (AbandonedMutexException)
                {
                    mutexAcquired = true;
                    VigitempServeur.Log($"Hotline sensor-test port-lock abandoned-acquired: port={portName}; serial={request.Serial}; action={request.Action}");
                }

                if (!mutexAcquired)
                {
                    VigitempServeur.Log($"Hotline sensor-test port-lock timeout: port={portName}; serial={request.Serial}; action={request.Action}");
                    result.Error = "Port série occupé, impossible d'obtenir le verrou dans le délai imparti.";
                    return;
                }

                VigitempServeur.Log($"Hotline sensor-test port-lock acquired: port={portName}; serial={request.Serial}; action={request.Action}");
                using (var port = CreatePort(portName, request))
                {
                    port.Open();
                    port.DiscardInBuffer();
                    port.DiscardOutBuffer();

                    if (request.Action == "sync-config" || gsp.SyncConfiguration)
                    {
                        foreach (var command in BuildGspSyncCommands(gsp, address))
                        {
                            result.RequestedCommand = GspProtocol.BuildCommand(command.Key, target, command.Value);
                            var response = SendGspCommand(port, result, command.Key, target, command.Value, true, gsp.ListenWindowMs);
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
                        foreach (var prefix in new[] { "DD-H", "DCAL", "DETA", "DCON" })
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
                        var memoryCount = Math.Max(1, gsp.MemoryCount ?? 1);
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
                            payload += gsp.MemoryOffset.Value.ToString(CultureInfo.InvariantCulture) + "o";
                        }
                        result.RequestedCommand = GspProtocol.BuildCommand("MEMO", target, payload);
                        var response = SendGspCommand(port, result, "MEMO", target, payload, false, effectiveListenWindowMs);
                        result.RawValue = response;
                        result.DetectedSerials = GspProtocol.ExtractDetectedSerials(response);
                        result.Unit = "memory";
                        return;
                    }

                    if (request.Action == "raw")
                    {
                        result.RequestedCommand = gsp.RawCommand;
                        var response = SendRawCommand(port, result, gsp.RawCommand, false, gsp.ListenWindowMs);
                        result.RawValue = response;
                        result.DetectedSerials = GspProtocol.ExtractDetectedSerials(response);
                        var rawCommand = (gsp.RawCommand ?? string.Empty).Trim();
                        var rawReadsTemperature = rawCommand.StartsWith("TEMP", StringComparison.OrdinalIgnoreCase)
                            || rawCommand.StartsWith("FTEM", StringComparison.OrdinalIgnoreCase)
                            || rawCommand.StartsWith("RTEMP", StringComparison.OrdinalIgnoreCase);
                        if (rawReadsTemperature && GspProtocol.TryExtractTemperature(response, target, out var targetedRawValue))
                        {
                            result.Value = targetedRawValue;
                            result.Unit = "°C";
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
                            result.Error = "Réponse reçue mais aucune valeur exploitable pour la sonde demandee n'a été detectée.";
                        }
                        return;
                    }

                    var readPrefix = string.Equals(request.Action, "force-read", StringComparison.OrdinalIgnoreCase) ? "FTEM" : "TEMP";
                    result.RequestedCommand = GspProtocol.BuildCommand(readPrefix, target, string.Empty);
                    var readResponse = SendGspCommand(port, result, readPrefix, target, string.Empty, false, gsp.ListenWindowMs);
                    if (string.IsNullOrWhiteSpace(readResponse))
                    {
                        AddExchange(result, "info", "ascii", "<wait-10s-before-retry>");
                        Thread.Sleep(10000);
                        readResponse = SendGspCommand(port, result, readPrefix, target, string.Empty, false, gsp.ListenWindowMs);
                    }

                    result.RawValue = readResponse;
                    result.DetectedSerials = GspProtocol.ExtractDetectedSerials(readResponse);
                    if (!GspProtocol.TryExtractTemperature(readResponse, target, out var value))
                    {
                        result.Error = IsCommandEchoOnly(readResponse, result.RequestedCommand)
                            ? "Reponse recue mais elle correspond uniquement a un echo de la commande."
                            : "Aucune temperature exploitable pour la sonde demandee dans la reponse GSP.";
                        return;
                    }

                    result.Value = value;
                    result.Unit = "°C";
                }
            }
            finally
            {
                if (mutexAcquired && namedMutex != null)
                {
                    try
                    {
                        namedMutex.ReleaseMutex();
                        VigitempServeur.Log($"Hotline sensor-test port-lock released: port={portName}; serial={request.Serial}; action={request.Action}");
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

        private static IEnumerable<KeyValuePair<string, string>> BuildGspSyncCommands(GspSensorTestRequest gsp, string address)
        {
            var channel = string.IsNullOrWhiteSpace(gsp.Channel) ? (address ?? string.Empty).Trim() : gsp.Channel.Trim();
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
                alarmDelayMinutes: Math.Max(0, gsp.AlarmDelayMinutes ?? 0),
                frequencySeconds: Math.Max(1, gsp.FrequencySeconds ?? 60));
        }

        private static string SendGspCommand(SerialPort port, SensorTestResult result, string prefix, string target, string payload, bool allowEmptyResponse, int? listenWindowMs)
        {
            if (string.IsNullOrWhiteSpace(prefix)) return string.Empty;

            var baseCommand = GspProtocol.BuildCommand(prefix, target, payload);
            foreach (var command in GspProtocol.BuildCandidateCommands(baseCommand))
            {
                var drained = DrainBufferedData(port);
                if (!string.IsNullOrWhiteSpace(drained)) AddExchange(result, "drain", "ascii", EscapeForLog(drained));

                port.DiscardInBuffer();
                port.DiscardOutBuffer();
                AddExchange(result, "tx", "ascii", EscapeForLog(command));
                port.Write(command);
                Thread.Sleep(150);

                var response = ReadGspResponse(port, listenWindowMs);
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

        private static string SendRawCommand(SerialPort port, SensorTestResult result, string rawCommand, bool allowEmptyResponse, int? listenWindowMs)
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
                port.Write(command);
                Thread.Sleep(200);

                var response = ReadGspResponse(port, listenWindowMs);
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
            }
            return buffer.Trim();
        }

        private static string ReadGspResponse(SerialPort port, int? listenWindowMs)
        {
            var endOfResponseSilenceMs = listenWindowMs.HasValue && listenWindowMs.Value > 0
                ? listenWindowMs.Value
                : GspEndOfResponseSilenceMs;
            var startedAt = DateTime.UtcNow;
            var buffer = string.Empty;
            DateTime? lastDataAt = null;
            while ((DateTime.UtcNow - startedAt).TotalMilliseconds < port.ReadTimeout)
            {
                Thread.Sleep(50);
                var chunk = port.ReadExisting();
                if (string.IsNullOrEmpty(chunk))
                {
                    if (lastDataAt.HasValue && (DateTime.UtcNow - lastDataAt.Value).TotalMilliseconds >= endOfResponseSilenceMs) break;
                    continue;
                }
                buffer += chunk;
                lastDataAt = DateTime.UtcNow;
            }
            return buffer.Trim();
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
            return string.IsNullOrWhiteSpace(StripCommandEcho(response, sentCommand));
        }

        private static string StripCommandEcho(string response, string sentCommand)
        {
            var raw = (response ?? string.Empty).Trim();
            var command = (sentCommand ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(raw) || string.IsNullOrWhiteSpace(command)) return raw;

            var filtered = System.Text.RegularExpressions.Regex.Split(raw, @"\s+")
                .Where(token => !string.IsNullOrWhiteSpace(token))
                .Where(token => !string.Equals(token.Trim(), command, StringComparison.OrdinalIgnoreCase))
                .ToList();

            return filtered.Count == 0 ? string.Empty : string.Join(" ", filtered);
        }

        private static void AddExchange(SensorTestResult result, string direction, string format, string content)
        {
            result.Exchanges.Add(new SensorExchange { Direction = direction, Format = format, Content = content ?? string.Empty });
        }

        private static void LogSensorTestResult(SensorTestResult result)
        {
            var detectedSerials = result.DetectedSerials == null || result.DetectedSerials.Count == 0 ? string.Empty : string.Join(",", result.DetectedSerials);
            VigitempServeur.Log(string.Format(CultureInfo.InvariantCulture,
                "Hotline sensor-test result: success={0}; type={1}; serial={2}; action={3}; requestedCommand={4}; port={5}; address={6}; module={7}; value={8}; unit={9}; detectedSerials={10}; error={11}",
                result.Success ? "true" : "false",
                result.SensorType ?? string.Empty,
                result.Serial ?? string.Empty,
                result.Action ?? string.Empty,
                result.RequestedCommand ?? string.Empty,
                result.Port ?? string.Empty,
                result.Address ?? string.Empty,
                result.Module ?? string.Empty,
                result.Value.HasValue ? result.Value.Value.ToString(CultureInfo.InvariantCulture) : string.Empty,
                result.Unit ?? string.Empty,
                detectedSerials,
                result.Error ?? string.Empty));

            foreach (var exchange in result.Exchanges)
            {
                VigitempServeur.Log(string.Format(CultureInfo.InvariantCulture,
                    "Hotline sensor-test exchange: serial={0}; action={1}; direction={2}; format={3}; content={4}",
                    result.Serial ?? string.Empty,
                    result.Action ?? string.Empty,
                    exchange.Direction ?? string.Empty,
                    exchange.Format ?? string.Empty,
                    EscapeForLog(exchange.Content ?? string.Empty)));
            }
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
            return (value ?? string.Empty).Replace("\r", "\\r").Replace("\n", "\\n");
        }
    }
}
