using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.IO.Ports;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Vigitemp_Serveur.sensors;

namespace Vigitemp_Serveur
{
    internal sealed class HotlineApiServer
    {
        private HttpListener _listener;
        private CancellationTokenSource _cts;
        private Task _listenTask;

        public void Start()
        {
            var prefix = GetSetting("Vigitemp.Hotline.Bind", "http://+:5310/");
            if (!prefix.EndsWith("/"))
            {
                prefix += "/";
            }

            _listener = new HttpListener();
            _listener.Prefixes.Add(prefix);
            _listener.Start();

            _cts = new CancellationTokenSource();
            _listenTask = Task.Run(() => ListenLoop(_cts.Token));
            VigitempServeur.Log("Hotline API started on " + prefix);
        }

        public void Stop()
        {
            try { _cts?.Cancel(); } catch { /* ignore */ }
            try { _listener?.Stop(); } catch { /* ignore */ }
            try { _listener?.Close(); } catch { /* ignore */ }
            try { _listenTask?.Wait(2000); } catch { /* ignore */ }

            _listener = null;
            _cts = null;
            _listenTask = null;
        }

        private async Task ListenLoop(CancellationToken token)
        {
            while (!token.IsCancellationRequested)
            {
                HttpListenerContext context = null;
                try
                {
                    context = await _listener.GetContextAsync().ConfigureAwait(false);
                }
                catch (Exception ex)
                {
                    if (!_listener.IsListening) return;
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
                if (context.Request.HttpMethod != "POST")
                {
                    WriteJson(response, 404, new { ok = false, error = "not_found", message = "Not found" });
                    return;
                }

                if (string.Equals(path, "/api/hotline/login", StringComparison.OrdinalIgnoreCase))
                {
                    HandleLogin(response, ReadJson(context.Request));
                    return;
                }

                if (string.Equals(path, "/api/hotline/sensor-test", StringComparison.OrdinalIgnoreCase))
                {
                    HandleSensorTest(response, ReadJson(context.Request));
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

        private void HandleLogin(HttpListenerResponse response, JObject payload)
        {
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
            if (!string.IsNullOrWhiteSpace(config.Slug) &&
                !string.Equals(slug, config.Slug, StringComparison.Ordinal))
            {
                WriteJson(response, 401, new { ok = false, error = "invalid_credentials", message = "Invalid credentials" });
                return;
            }

            if (!string.Equals(username, config.Username, StringComparison.Ordinal))
            {
                WriteJson(response, 401, new { ok = false, error = "invalid_credentials", message = "Invalid credentials" });
                return;
            }

            if (!HotlinePasswordHasher.VerifyPassword(password, config.PasswordHash))
            {
                WriteJson(response, 401, new { ok = false, error = "invalid_credentials", message = "Invalid credentials" });
                return;
            }

            WriteJson(response, 200, new { ok = true });
        }

        private void HandleSensorTest(HttpListenerResponse response, JObject payload)
        {
            var serial = (payload.Value<string>("serial") ?? string.Empty).Trim();
            var sensorType = (payload.Value<string>("sensorType") ?? string.Empty).Trim().ToUpperInvariant();
            var action = (payload.Value<string>("action") ?? "read").Trim().ToLowerInvariant();
            var gsp = payload["gsp"] as JObject ?? new JObject();

            if (string.IsNullOrWhiteSpace(serial))
            {
                WriteJson(response, 400, new { ok = false, error = "validation_error", message = "serial is required" });
                return;
            }

            if (string.IsNullOrWhiteSpace(sensorType))
            {
                sensorType = serial.StartsWith("GSP", StringComparison.OrdinalIgnoreCase)
                    ? "GSP"
                    : serial.Substring(0, Math.Min(2, serial.Length)).ToUpperInvariant();
            }

            var request = new SensorTestRequest
            {
                Serial = serial,
                SensorType = sensorType,
                Action = action,
                ManualPort = (payload.Value<string>("manualPort") ?? string.Empty).Trim(),
                ManualAddress = (payload.Value<string>("manualAddress") ?? string.Empty).Trim(),
                ManualModule = (payload.Value<string>("manualModule") ?? string.Empty).Trim(),
                BaudRate = ReadNullableInt(payload, "baudRate"),
                Parity = (payload.Value<string>("parity") ?? string.Empty).Trim(),
                DataBits = ReadNullableInt(payload, "dataBits"),
                StopBits = (payload.Value<string>("stopBits") ?? string.Empty).Trim(),
                ReadTimeoutMs = ReadNullableInt(payload, "readTimeoutMs"),
                WriteTimeoutMs = ReadNullableInt(payload, "writeTimeoutMs"),
                Gsp = ParseGspRequest(gsp),
            };

            var result = ExecuteSensorTest(request);
            WriteJson(response, result.Success ? 200 : 400, new { ok = result.Success, data = result });
        }

        private static JObject ReadJson(HttpListenerRequest request)
        {
            using (var reader = new StreamReader(request.InputStream, request.ContentEncoding ?? Encoding.UTF8))
            {
                var body = reader.ReadToEnd();
                if (string.IsNullOrWhiteSpace(body))
                {
                    return new JObject();
                }
                return JObject.Parse(body);
            }
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
            public string CustomCommandPrefix { get; set; }
            public string CustomPayload { get; set; }
            public string RawCommand { get; set; }
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

        private sealed class SensorExchange
        {
            public string Direction { get; set; }
            public string Format { get; set; }
            public string Content { get; set; }
        }

        private static GspSensorTestRequest ParseGspRequest(JObject payload)
        {
            return new GspSensorTestRequest
            {
                SyncConfiguration = payload.Value<bool?>("syncConfiguration") ?? false,
                CoeffA = ReadNullableDouble(payload, "coeffA"),
                CoeffB = ReadNullableDouble(payload, "coeffB"),
                AccuracyError = ReadNullableDouble(payload, "accuracyError"),
                HighLimit = ReadNullableDouble(payload, "highLimit"),
                LowLimit = ReadNullableDouble(payload, "lowLimit"),
                FrequencySeconds = ReadNullableInt(payload, "frequencySeconds"),
                AlarmDelayMinutes = ReadNullableInt(payload, "alarmDelayMinutes"),
                Channel = (payload.Value<string>("channel") ?? string.Empty).Trim(),
                MemoryCount = ReadNullableInt(payload, "memoryCount"),
                CustomCommandPrefix = (payload.Value<string>("customCommandPrefix") ?? string.Empty).Trim(),
                CustomPayload = (payload.Value<string>("customPayload") ?? string.Empty).Trim(),
                RawCommand = (payload.Value<string>("rawCommand") ?? string.Empty),
            };
        }

        private static double? ReadNullableDouble(JObject payload, string key)
        {
            var token = payload[key];
            if (token == null || token.Type == JTokenType.Null) return null;
            if (token.Type == JTokenType.Float || token.Type == JTokenType.Integer) return token.Value<double>();
            var raw = (token.Value<string>() ?? string.Empty).Trim().Replace(',', '.');
            if (string.IsNullOrWhiteSpace(raw)) return null;
            double parsed;
            return double.TryParse(raw, NumberStyles.Float | NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out parsed)
                ? (double?)parsed
                : null;
        }

        private static int? ReadNullableInt(JObject payload, string key)
        {
            var token = payload[key];
            if (token == null || token.Type == JTokenType.Null) return null;
            if (token.Type == JTokenType.Integer) return token.Value<int>();
            var raw = (token.Value<string>() ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(raw)) return null;
            int parsed;
            return int.TryParse(raw, NumberStyles.Integer, CultureInfo.InvariantCulture, out parsed)
                ? (int?)parsed
                : null;
        }

        private static SensorTestResult ExecuteSensorTest(SensorTestRequest request)
        {
            var result = new SensorTestResult
            {
                SensorType = request.SensorType,
                Serial = request.Serial,
                Action = request.Action,
            };

            VigitempServeur.Log(string.Format(
                CultureInfo.InvariantCulture,
                "Hotline sensor-test request: type={0}; serial={1}; action={2}; manualPort={3}; manualAddress={4}; manualModule={5}; baudRate={6}; parity={7}; dataBits={8}; stopBits={9}; readTimeoutMs={10}; writeTimeoutMs={11}",
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
                request.WriteTimeoutMs.HasValue ? request.WriteTimeoutMs.Value.ToString(CultureInfo.InvariantCulture) : string.Empty));

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
                            result.Error = "Sonde introuvable dans la base et aucun port manuel n'a ete fourni.";
                            return result;
                        }

                        var infos = database.getInfosByIdLieu(idLieu);
                        result.Port = infos.Item1;
                        result.Address = infos.Item3;
                        result.Module = infos.Item4;
                    }

                    if (string.IsNullOrWhiteSpace(result.Port))
                    {
                        result.Error = "Port série introuvable pour cette sonde.";
                        return result;
                    }

                    switch (request.SensorType)
                    {
                        case "IN":
                            ProbeAsciiTemperature(result, request.Serial, result.Port, result.Address, false);
                            break;
                        case "IE":
                            ProbeAsciiTemperature(result, request.Serial, result.Port, result.Address, true);
                            break;
                        case "IP":
                            ProbeAsciiResistance(result, request.Serial, result.Port, result.Address, "°C");
                            break;
                        case "IC":
                            ProbeAsciiResistance(result, request.Serial, result.Port, result.Address, "%CO2");
                            break;
                        case "IH":
                            ProbeAsciiResistance(result, request.Serial, result.Port, result.Address, "%HR");
                            break;
                        case "EN":
                            ProbeEn(result, request.Serial, result.Port, result.Address);
                            break;
                        case "HN":
                            ProbeHn(result, request.Serial, result.Port, result.Address, result.Module);
                            break;
                        case "GSP":
                            ProbeGsp(result, request, result.Port, result.Address);
                            break;
                        default:
                            result.Error = "Type de sonde non supporte.";
                            break;
                    }
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

        private static void ProbeAsciiTemperature(SensorTestResult result, string serial, string portName, string address, bool repeatCommand)
        {
            var command = "SM" + (address ?? string.Empty) + "0000000000000000";
            var pattern = @".*(R[A-Z0-9]{4}TEMP-?[0-9]{1,3}.[0-9]{2}'C).*";

            if (string.Equals(result.SensorType, "IP", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(result.SensorType, "IC", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(result.SensorType, "IH", StringComparison.OrdinalIgnoreCase))
            {
                pattern = @".*(R" + serial.Substring(Math.Max(0, serial.Length - 4)) + "R[\x00-\x7F]{2}').*";
            }

            using (var port = CreatePort(portName))
            {
                port.Open();
                port.DiscardInBuffer();
                port.DiscardOutBuffer();
                AddExchange(result, "tx", "ascii", command);
                port.Write(command);
                if (repeatCommand)
                {
                    Thread.Sleep(100);
                    AddExchange(result, "tx", "ascii", command);
                    port.Write(command);
                }

                var response = ReadUntilRegex(port, pattern, 5000);
                AddExchange(result, "rx", "ascii", response);

                var match = Regex.Match(response ?? string.Empty, pattern, RegexOptions.None);
                if (!match.Success || string.IsNullOrWhiteSpace(match.Groups[1].Value))
                {
                    result.Error = "Aucune reponse exploitable recue.";
                    return;
                }

                var parsed = match.Groups[1].Value;
                var rawValue = parsed.Split(new[] { "TEMP" }, StringSplitOptions.None)[1];
                var cleanValue = rawValue.Substring(0, rawValue.Length - 2);
                result.RawValue = cleanValue.Replace(',', '.');
                result.Value = double.Parse(result.RawValue, CultureInfo.InvariantCulture);
                result.Unit = "°C";
            }
        }

        private static void ProbeAsciiResistance(SensorTestResult result, string serial, string portName, string address, string unit)
        {
            var command = "SM" + (address ?? string.Empty) + "0000000000000000";
            var pattern = @".*(R" + serial.Substring(Math.Max(0, serial.Length - 4)) + "R[\x00-\x7F]{2}').*";

            using (var port = CreatePort(portName))
            {
                port.Open();
                port.DiscardInBuffer();
                port.DiscardOutBuffer();
                AddExchange(result, "tx", "ascii", command);
                port.Write(command);

                var response = ReadUntilRegex(port, pattern, 2500);
                AddExchange(result, "rx", "ascii", response);

                var match = Regex.Match(response ?? string.Empty, pattern, RegexOptions.None);
                if (!match.Success || string.IsNullOrWhiteSpace(match.Groups[1].Value))
                {
                    result.Error = "Aucune reponse exploitable recue.";
                    return;
                }

                var frame = match.Groups[1].Value;
                int poidsFort = frame[6];
                int poidsFaible = frame[7];
                var raw = (poidsFort * 256 + poidsFaible - 2048).ToString(CultureInfo.InvariantCulture);
                result.RawValue = raw;
                result.Value = double.Parse(raw, CultureInfo.InvariantCulture);
                result.Unit = unit;
            }
        }

        private static void ProbeEn(SensorTestResult result, string serial, string portName, string address)
        {
            using (var port = CreatePort(portName))
            {
                port.Open();
                port.DiscardInBuffer();
                port.DiscardOutBuffer();

                int addressValue = int.Parse(address, CultureInfo.InvariantCulture);
                byte[] command = {
                    0x51,
                    Convert.ToByte(addressValue),
                    Convert.ToByte(addressValue),
                    Convert.ToByte(addressValue),
                    Convert.ToByte(addressValue),
                    Convert.ToByte(addressValue),
                    0x30,
                    Convert.ToByte(addressValue),
                    Convert.ToByte(addressValue),
                    Convert.ToByte(addressValue),
                    Convert.ToByte(addressValue),
                    Convert.ToByte(addressValue),
                    0x30,
                    0x30
                };

                AddExchange(result, "tx", "hex", ToHex(command));
                port.Write(command, 0, command.Length);

                var buffer = ReadFixedLength(port, 14, 2500);
                AddExchange(result, "rx", "hex", ToHex(buffer));
                if (buffer == null || buffer.Length != 14)
                {
                    result.Error = "Aucune trame EN complete recue.";
                    return;
                }

                int poidsFort = buffer[12];
                int poidsFaible = buffer[13];
                var raw = (poidsFort * 256 + poidsFaible - 2048).ToString(CultureInfo.InvariantCulture);
                result.RawValue = raw;
                result.Value = double.Parse(raw, CultureInfo.InvariantCulture);
                result.Unit = "°C";
            }
        }

        private static void ProbeHn(SensorTestResult result, string serial, string portName, string address, string module)
        {
            using (var port = CreatePort(portName))
            {
                port.Open();
                port.DiscardInBuffer();
                port.DiscardOutBuffer();

                var command = BuildHnChecksumRequest("54", address ?? string.Empty, module ?? string.Empty);
                AddExchange(result, "tx", "hex", ToHex(command));
                port.Write(command, 0, command.Length);

                var buffer = ReadFixedLength(port, 19, 2500);
                AddExchange(result, "rx", "hex", ToHex(buffer));
                if (buffer == null || buffer.Length != 19)
                {
                    result.Error = "Aucune trame HN complete recue.";
                    return;
                }

                var bits = Convert.ToString(buffer[14], 2).PadLeft(8, '0') +
                           Convert.ToString(buffer[15], 2).PadLeft(8, '0') +
                           Convert.ToString(buffer[16], 2).PadLeft(8, '0');
                int rawInt = (int)Convert.ToInt64(bits, 2);
                var raw = ((1 - rawInt / Math.Pow(2, 20) - 0.32) / 0.0047).ToString(CultureInfo.InvariantCulture);
                result.RawValue = raw;
                result.Value = double.Parse(raw, CultureInfo.InvariantCulture);
                result.Unit = "°C";
            }
        }

        private static void ProbeGsp(SensorTestResult result, SensorTestRequest request, string portName, string address)
        {
            var gsp = request.Gsp ?? new GspSensorTestRequest();
            var target = GspProtocol.NormalizeCommandTarget(request.Serial);

            using (var port = CreatePort(portName))
            {
                port.NewLine = "\r\n";
                port.Open();
                port.DiscardInBuffer();
                port.DiscardOutBuffer();

                if (request.Action == "sync-config" || gsp.SyncConfiguration)
                {
                    foreach (var command in BuildGspSyncCommands(target, gsp, address))
                    {
                        result.RequestedCommand = GspProtocol.BuildCommand(command.Key, target, command.Value);
                        var response = SendGspCommand(port, result, command.Key, target, command.Value, true);
                        if (!string.IsNullOrWhiteSpace(response))
                        {
                            result.RawValue = response;
                        }
                    }
                    result.Unit = "config";
                    return;
                }

                if (request.Action == "read-config")
                {
                    foreach (var prefix in new[] { "DD-H", "DCAL", "DETA", "DCON" })
                    {
                        result.RequestedCommand = prefix + target;
                        SendGspCommand(port, result, prefix, target, string.Empty, true);
                    }
                    result.Unit = "config";
                    return;
                }

                if (request.Action == "read-memory")
                {
                    var payload = (gsp.MemoryCount ?? 1).ToString(CultureInfo.InvariantCulture) + "x";
                    result.RequestedCommand = GspProtocol.BuildCommand("MEMO", target, payload);
                    var response = SendGspCommand(port, result, "MEMO", target, payload, false);
                    result.RawValue = response;
                    result.DetectedSerials = GspProtocol.ExtractDetectedSerials(response);
                    result.Unit = "memory";
                    return;
                }

                if (request.Action == "custom")
                {
                    result.RequestedCommand = GspProtocol.BuildCommand(gsp.CustomCommandPrefix, target, gsp.CustomPayload);
                    var response = SendGspCommand(port, result, gsp.CustomCommandPrefix, target, gsp.CustomPayload, false);
                    result.RawValue = response;
                    result.DetectedSerials = GspProtocol.ExtractDetectedSerials(response);
                    var customPrefix = (gsp.CustomCommandPrefix ?? string.Empty).Trim();
                    var customReadsTemperature = string.Equals(customPrefix, "TEMP", StringComparison.OrdinalIgnoreCase)
                        || string.Equals(customPrefix, "FTEM", StringComparison.OrdinalIgnoreCase);
                    if (customReadsTemperature && GspProtocol.TryExtractTemperature(response, target, out var targetedCustomValue))
                    {
                        result.Value = targetedCustomValue;
                    }
                    else if (!customReadsTemperature && TryExtractGspValue(response, (gsp.CustomCommandPrefix ?? string.Empty) + target + (gsp.CustomPayload ?? string.Empty), out var customValue))
                    {
                        result.Value = customValue;
                    }
                    else if (!string.IsNullOrWhiteSpace(response))
                    {
                        result.Error = "Reponse recue mais aucune valeur exploitable pour la sonde demandee n'a ete detectee.";
                    }
                    return;
                }

                if (request.Action == "raw")
                {
                    result.RequestedCommand = gsp.RawCommand;
                    var response = SendRawCommand(port, result, gsp.RawCommand, false);
                    result.RawValue = response;
                    result.DetectedSerials = GspProtocol.ExtractDetectedSerials(response);
                    var rawCommand = (gsp.RawCommand ?? string.Empty).Trim();
                    var rawReadsTemperature = rawCommand.StartsWith("TEMP", StringComparison.OrdinalIgnoreCase)
                        || rawCommand.StartsWith("FTEM", StringComparison.OrdinalIgnoreCase)
                        || rawCommand.StartsWith("RTEMP", StringComparison.OrdinalIgnoreCase);
                    if (rawReadsTemperature && GspProtocol.TryExtractTemperature(response, target, out var targetedRawValue))
                    {
                        result.Value = targetedRawValue;
                    }
                    else if (!rawReadsTemperature && TryExtractGspValue(response, gsp.RawCommand, out var rawValue))
                    {
                        result.Value = rawValue;
                    }
                    else if (IsCommandEchoOnly(response, gsp.RawCommand))
                    {
                        result.Error = "Reponse recue mais elle correspond uniquement a un echo de la commande.";
                    }
                    else if (!string.IsNullOrWhiteSpace(response))
                    {
                        result.Error = "Reponse recue mais aucune valeur exploitable pour la sonde demandee n'a ete detectee.";
                    }
                    return;
                }

                var readPrefix = request.Action == "force-read" ? "FTEM" : "TEMP";
                result.RequestedCommand = readPrefix + target;
                var readResponse = SendGspCommand(port, result, readPrefix, target, string.Empty, false);
                if (string.IsNullOrWhiteSpace(readResponse))
                {
                    AddExchange(result, "info", "ascii", "<wait-5s-before-retry>");
                    Thread.Sleep(5000);
                    readResponse = SendGspCommand(port, result, readPrefix, target, string.Empty, false);
                }
                result.RawValue = readResponse;
                result.DetectedSerials = GspProtocol.ExtractDetectedSerials(readResponse);
                if (!GspProtocol.TryExtractTemperature(readResponse, target, out var value))
                {
                    result.Error = IsCommandEchoOnly(readResponse, readPrefix + target)
                        ? "Reponse recue mais elle correspond uniquement a un echo de la commande."
                        : "Aucune temperature exploitable pour la sonde demandee dans la reponse GSP.";
                    return;
                }

                result.Value = value;
                result.Unit = "°C";
            }
        }

        private static IEnumerable<KeyValuePair<string, string>> BuildGspSyncCommands(string target, GspSensorTestRequest gsp, string address)
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

        private static string SendGspCommand(SerialPort port, SensorTestResult result, string prefix, string target, string payload, bool allowEmptyResponse)
        {
            if (string.IsNullOrWhiteSpace(prefix))
            {
                return string.Empty;
            }

            var baseCommand = GspProtocol.BuildCommand(prefix, target, payload);
            foreach (var command in GspProtocol.BuildCandidateCommands(baseCommand))
            {
                port.DiscardInBuffer();
                port.DiscardOutBuffer();
                AddExchange(result, "tx", "ascii", EscapeForLog(command));
                port.Write(command);
                Thread.Sleep(150);

                var response = port.ReadExisting();
                if (!string.IsNullOrWhiteSpace(response))
                {
                    AddExchange(result, "rx", "ascii", response.Trim());
                    return response.Trim();
                }

                AddExchange(result, "rx", "ascii", "<empty>");

                if (allowEmptyResponse)
                {
                    return string.Empty;
                }
            }

            AddExchange(result, "rx", "ascii", "<timeout>");
            return string.Empty;
        }

        private static string SendRawCommand(SerialPort port, SensorTestResult result, string rawCommand, bool allowEmptyResponse)
        {
            if (string.IsNullOrWhiteSpace(rawCommand))
            {
                AddExchange(result, "rx", "ascii", "<raw-command-empty>");
                return string.Empty;
            }

            foreach (var command in GspProtocol.BuildCandidateCommands(rawCommand))
            {
                port.DiscardInBuffer();
                port.DiscardOutBuffer();
                AddExchange(result, "tx", "ascii", EscapeForLog(command));
                port.Write(command);
                Thread.Sleep(200);

                var response = port.ReadExisting();
                if (!string.IsNullOrWhiteSpace(response))
                {
                    AddExchange(result, "rx", "ascii", response.Trim());
                    return response.Trim();
                }

                AddExchange(result, "rx", "ascii", "<empty>");
                if (allowEmptyResponse)
                {
                    return string.Empty;
                }
            }

            AddExchange(result, "rx", "ascii", "<timeout>");
            return string.Empty;
        }

        private static SerialPort CreatePort(string portName)
        {
            return CreatePort(portName, new SensorTestRequest());
        }

        private static SerialPort CreatePort(string portName, SensorTestRequest request)
        {
            var parity = Parity.None;
            if (!string.IsNullOrWhiteSpace(request.Parity))
            {
                Enum.TryParse(request.Parity, true, out parity);
            }

            var stopBits = StopBits.One;
            if (!string.IsNullOrWhiteSpace(request.StopBits))
            {
                Enum.TryParse(request.StopBits, true, out stopBits);
            }

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

        private static string ReadUntilRegex(SerialPort port, string pattern, int timeoutMs)
        {
            var startedAt = DateTime.UtcNow;
            var buffer = string.Empty;
            while ((DateTime.UtcNow - startedAt).TotalMilliseconds < timeoutMs)
            {
                Thread.Sleep(50);
                var chunk = port.ReadExisting();
                if (!string.IsNullOrEmpty(chunk))
                {
                    buffer += chunk;
                    if (Regex.IsMatch(buffer, pattern, RegexOptions.None))
                    {
                        return buffer;
                    }
                }
            }

            return buffer;
        }

        private static byte[] ReadFixedLength(SerialPort port, int expectedLength, int timeoutMs)
        {
            var startedAt = DateTime.UtcNow;
            var buffer = new List<byte>();
            while ((DateTime.UtcNow - startedAt).TotalMilliseconds < timeoutMs)
            {
                Thread.Sleep(50);
                var available = port.BytesToRead;
                if (available <= 0)
                {
                    continue;
                }

                var chunk = new byte[available];
                port.Read(chunk, 0, available);
                buffer.AddRange(chunk);
                if (buffer.Count >= expectedLength)
                {
                    return buffer.Take(expectedLength).ToArray();
                }
            }

            return buffer.ToArray();
        }

        private static bool TryExtractNumber(string response, out double value)
        {
            value = 0d;
            var matches = Regex.Matches(response ?? string.Empty, @"-?\d+(?:[.,]\d+)?");
            for (var index = matches.Count - 1; index >= 0; index--)
            {
                var candidate = matches[index].Value.Replace(',', '.');
                if (!double.TryParse(candidate, NumberStyles.Float | NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out value))
                {
                    continue;
                }

                return true;
            }

            return false;
        }

        private static bool TryExtractGspValue(string response, string sentCommand, out double value)
        {
            value = 0d;
            var sanitized = StripCommandEcho(response, sentCommand);
            if (string.IsNullOrWhiteSpace(sanitized))
            {
                return false;
            }

            return TryExtractNumber(sanitized, out value);
        }

        private static bool IsCommandEchoOnly(string response, string sentCommand)
        {
            return string.IsNullOrWhiteSpace(StripCommandEcho(response, sentCommand));
        }

        private static string StripCommandEcho(string response, string sentCommand)
        {
            var raw = (response ?? string.Empty).Trim();
            var command = (sentCommand ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(raw) || string.IsNullOrWhiteSpace(command))
            {
                return raw;
            }

            var tokens = Regex.Split(raw, @"\s+")
                .Where(token => !string.IsNullOrWhiteSpace(token))
                .ToList();

            var filtered = tokens
                .Where(token => !string.Equals(token.Trim(), command, StringComparison.OrdinalIgnoreCase))
                .ToList();

            if (filtered.Count == 0)
            {
                return string.Empty;
            }

            return string.Join(" ", filtered);
        }

        private static void AddExchange(SensorTestResult result, string direction, string format, string content)
        {
            result.Exchanges.Add(new SensorExchange
            {
                Direction = direction,
                Format = format,
                Content = content ?? string.Empty,
            });
        }

        private static void LogSensorTestResult(SensorTestResult result)
        {
            var detectedSerials = result.DetectedSerials == null || result.DetectedSerials.Count == 0
                ? string.Empty
                : string.Join(",", result.DetectedSerials);

            VigitempServeur.Log(string.Format(
                CultureInfo.InvariantCulture,
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
                VigitempServeur.Log(string.Format(
                    CultureInfo.InvariantCulture,
                    "Hotline sensor-test exchange: serial={0}; action={1}; direction={2}; format={3}; content={4}",
                    result.Serial ?? string.Empty,
                    result.Action ?? string.Empty,
                    exchange.Direction ?? string.Empty,
                    exchange.Format ?? string.Empty,
                    EscapeForLog(exchange.Content ?? string.Empty)));
            }
        }

        private static string ToHex(byte[] bytes)
        {
            if (bytes == null || bytes.Length == 0) return string.Empty;
            return BitConverter.ToString(bytes);
        }

        private static string EscapeForLog(string value)
        {
            return (value ?? string.Empty)
                .Replace("\r", "\\r")
                .Replace("\n", "\\n");
        }

        private static byte[] BuildHnChecksumRequest(string code, string relais1, string relais2)
        {
            int nval1 = Convert.ToInt32(code, 16);
            int nval2 = Convert.ToInt32("01", 16);
            int nval3 = Convert.ToInt32((relais1 ?? string.Empty).Substring(0, 2), 16);
            int nval4 = Convert.ToInt32((relais1 ?? string.Empty).Substring(2, 2), 16);
            int nval5 = Convert.ToInt32((relais2 ?? string.Empty).Substring(0, 2), 16);
            int nval6 = Convert.ToInt32((relais2 ?? string.Empty).Substring(2, 2), 16);

            int somme = nval1 + nval2 + nval3 + nval4 + nval5 + nval6;
            var chaineBinaire = Convert.ToString(somme, 2).PadLeft(16, '0');
            var chaineResultat = chaineBinaire.Replace('0', 'o').Replace('1', '0').Replace('o', '1');
            chaineResultat = Convert.ToString(Convert.ToInt32(chaineResultat, 2), 16).ToUpperInvariant();

            int nval18 = Convert.ToInt32(chaineResultat.Substring(0, 2), 16);
            int nval19 = Convert.ToInt32(chaineResultat.Substring(2, 2), 16);

            return new[]
            {
                Convert.ToByte(nval1),
                Convert.ToByte(nval2),
                Convert.ToByte(nval3),
                Convert.ToByte(nval4),
                Convert.ToByte(nval5),
                Convert.ToByte(nval6),
                (byte)0,
                (byte)0,
                (byte)0,
                (byte)0,
                (byte)0,
                (byte)0,
                (byte)0,
                (byte)0,
                (byte)0,
                (byte)0,
                (byte)0,
                Convert.ToByte(nval18),
                Convert.ToByte(nval19),
            };
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
            catch
            {
                return defaultValue;
            }
        }

        private static bool ValidateApiKey(HttpListenerRequest request)
        {
            var expected = GetSetting("Vigitemp.Hotline.ApiKey", string.Empty);
            if (string.IsNullOrWhiteSpace(expected))
            {
                VigitempServeur.Log("WARNING HotlineApiServer: Vigitemp.Hotline.ApiKey non configure. Toutes les requetes sont rejetees.");
                return false;
            }
            var provided = request.Headers["x-vigitemp-hotline-key"];
            return string.Equals(expected, provided, StringComparison.Ordinal);
        }
    }
}
