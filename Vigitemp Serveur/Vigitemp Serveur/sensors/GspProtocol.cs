using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using MySql.Data.MySqlClient;

namespace Vigitemp_Serveur.sensors
{
    internal sealed class GspTemperatureResponse
    {
        public string Serial { get; set; }
        public DateTime? ProbeDateTime { get; set; }
        public double? Temperature { get; set; }
        public string Unit { get; set; }
        public int? BatteryPercent { get; set; }
        public int? Rssi { get; set; }
        public bool? IsOnBatteryPower { get; set; }
        public bool IsMaintenanceMode { get; set; }
        public string AlarmStateRaw { get; set; }
    }

    internal sealed class GspConfigurationResponse
    {
        // Logical/legacy view consumed by SensorGSP's existing comparison code.
        public string Serial { get; set; }
        public double? CoeffA { get; set; }
        public double? CoeffB { get; set; }
        public double? CorrectionC { get; set; }
        public double? HighLimit { get; set; }
        public double? LowLimit { get; set; }
        public int? FrequencyMinutes { get; set; }
        public int? AlarmDelayLowMinutes { get; set; }
        public int? AlarmDelayHighMinutes { get; set; }

        // Physical values returned by the new GSP firmware.
        public double? PhysicalCoeffA { get; set; }
        public double? PhysicalCoeffB { get; set; }
        public double? PhysicalCoeffC { get; set; }
        public double? Offset { get; set; }
        public double? AccuracyError { get; set; }
        public int? MultiPoint { get; set; }
        public bool HighLimitDisabled { get; set; }
        public bool LowLimitDisabled { get; set; }
        public bool UsesExtendedMetrology { get; set; }

        public List<string> MissingConfigurationCodes { get; } = new List<string>();
    }

    internal sealed class GspMemoMeasurement
    {
        public int Index { get; set; }
        public DateTime? ProbeDateTime { get; set; }
        public double? Temperature { get; set; }
    }

    internal sealed class GspMemoResponse
    {
        public string Serial { get; set; }
        public int? Offset { get; set; }
        public int? ReturnedCount { get; set; }
        public List<GspMemoMeasurement> Measurements { get; } = new List<GspMemoMeasurement>();
    }

    internal sealed class GspExpectedConfigurationSnapshot
    {
        public int IdLieu { get; set; }
        public string Serial { get; set; }
        public bool HasAdjustment { get; set; }
        public double CoeffX2 { get; set; }
        public bool ApplyCorrectionEj { get; set; }
        public double? AccuracyError { get; set; }
        public bool HighLimitActive { get; set; }
        public double? HighLimit { get; set; }
        public bool LowLimitActive { get; set; }
        public double? LowLimit { get; set; }
    }

    /// <summary>
    /// Reads only the extra fields needed by the extended GSP ECON/DCON protocol.
    /// The existing metrology cache intentionally remains unchanged for non-GSP probes.
    /// This reader is used only during configuration synchronization/checks, never on each
    /// measurement, so a direct DB read also prevents stale multipoint coefficients after
    /// an adjustment/calibration has just completed.
    /// </summary>
    internal static class GspExpectedConfigurationReader
    {
        internal static bool TryGetByIdLieu(int? idLieu, out GspExpectedConfigurationSnapshot snapshot)
        {
            snapshot = null;
            if (!idLieu.HasValue || idLieu.Value <= 0) return false;

            try
            {
                using (var connection = CreateConnection(out var isSqlServer))
                {
                    connection.Open();
                    return TryLoadLocation(connection, isSqlServer, idLieu.Value, null, out snapshot);
                }
            }
            catch (Exception ex)
            {
                VigitempServeur.Log($"[SONDE][CFG-EXPECTED] idLieu={idLieu.Value} status=error error={ex.Message}");
                snapshot = null;
                return false;
            }
        }

        internal static bool TryGetByTarget(string target, out GspExpectedConfigurationSnapshot snapshot)
        {
            snapshot = null;
            var normalizedTarget = (target ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(normalizedTarget)) return false;

            try
            {
                using (var connection = CreateConnection(out var isSqlServer))
                {
                    connection.Open();
                    return TryLoadLocation(connection, isSqlServer, null, normalizedTarget, out snapshot);
                }
            }
            catch (Exception ex)
            {
                VigitempServeur.Log($"[SONDE][CFG-EXPECTED] target={normalizedTarget} status=error error={ex.Message}");
                snapshot = null;
                return false;
            }
        }

        private static bool TryLoadLocation(
            IDbConnection connection,
            bool isSqlServer,
            int? idLieu,
            string target,
            out GspExpectedConfigurationSnapshot snapshot)
        {
            snapshot = null;
            var command = connection.CreateCommand();
            if (idLieu.HasValue)
            {
                command.CommandText =
                    "SELECT Id_Lieu, Sonde_Numero_Serie, Est_Correction_Ej, " +
                    "Est_Consigne_Sup_Active, Est_Consigne_Inf_Active, " +
                    "Tolerance_Surveillance_Sup, Tolerance_Surveillance_Inf " +
                    "FROM t_lieu WHERE Id_Lieu = @idLieu";
                AddParameter(command, "@idLieu", idLieu.Value);
            }
            else
            {
                var selectPrefix = isSqlServer ? "SELECT TOP 1 " : "SELECT ";
                var limitSuffix = isSqlServer ? string.Empty : " LIMIT 1";
                command.CommandText =
                    selectPrefix +
                    "l.Id_Lieu, l.Sonde_Numero_Serie, l.Est_Correction_Ej, " +
                    "l.Est_Consigne_Sup_Active, l.Est_Consigne_Inf_Active, " +
                    "l.Tolerance_Surveillance_Sup, l.Tolerance_Surveillance_Inf " +
                    "FROM t_lieu l " +
                    "LEFT JOIN t_sonde s ON s.Sonde_Numero_Serie = l.Sonde_Numero_Serie " +
                    "WHERE l.Lieu_Etat = 'S' AND (" +
                    "l.Sonde_Numero_Serie = @target OR l.Adresse_Sonde = @target OR " +
                    "s.Sonde_Numero_Serie = @target OR s.Adresse_Sonde = @target) " +
                    "ORDER BY l.Id_Lieu" + limitSuffix;
                AddParameter(command, "@target", target);
            }

            int resolvedIdLieu;
            string serial;
            bool applyCorrectionEj;
            bool highActive;
            bool lowActive;
            double? highLimit;
            double? lowLimit;

            using (var reader = command.ExecuteReader())
            {
                if (!reader.Read()) return false;
                resolvedIdLieu = ReadInt(reader, "Id_Lieu", 0);
                serial = ReadString(reader, "Sonde_Numero_Serie");
                applyCorrectionEj = ReadBool(reader, "Est_Correction_Ej", false);
                highActive = ReadBool(reader, "Est_Consigne_Sup_Active", false);
                lowActive = ReadBool(reader, "Est_Consigne_Inf_Active", false);
                highLimit = ReadDouble(reader, "Tolerance_Surveillance_Sup");
                lowLimit = ReadDouble(reader, "Tolerance_Surveillance_Inf");
            }

            if (resolvedIdLieu <= 0 || string.IsNullOrWhiteSpace(serial)) return false;

            var coeffX2 = 0d;
            var hasAdjustment = false;
            using (var adjustmentCommand = connection.CreateCommand())
            {
                adjustmentCommand.CommandText = isSqlServer
                    ? "SELECT TOP 1 Coeff_X2 FROM t_ajustage WHERE Sonde_Numero_Serie = @serial ORDER BY Date_Heure_Ajustage DESC, Id_Ajustage DESC"
                    : "SELECT Coeff_X2 FROM t_ajustage WHERE Sonde_Numero_Serie = @serial ORDER BY Date_Heure_Ajustage DESC, Id_Ajustage DESC LIMIT 1";
                AddParameter(adjustmentCommand, "@serial", serial);
                var raw = adjustmentCommand.ExecuteScalar();
                if (raw != null && raw != DBNull.Value)
                {
                    hasAdjustment = true;
                    coeffX2 = Convert.ToDouble(raw, CultureInfo.InvariantCulture);
                }
            }

            double? accuracyError = null;
            using (var calibrationCommand = connection.CreateCommand())
            {
                calibrationCommand.CommandText = isSqlServer
                    ? "SELECT TOP 1 Err_Justesse FROM t_etalonnage WHERE Sonde_Numero_Serie = @serial ORDER BY Date_Heure_Etalonnage DESC, Id_Etalonnage DESC"
                    : "SELECT Err_Justesse FROM t_etalonnage WHERE Sonde_Numero_Serie = @serial ORDER BY Date_Heure_Etalonnage DESC, Id_Etalonnage DESC LIMIT 1";
                AddParameter(calibrationCommand, "@serial", serial);
                var raw = calibrationCommand.ExecuteScalar();
                if (raw != null && raw != DBNull.Value)
                {
                    accuracyError = Convert.ToDouble(raw, CultureInfo.InvariantCulture);
                }
            }

            snapshot = new GspExpectedConfigurationSnapshot
            {
                IdLieu = resolvedIdLieu,
                Serial = serial.Trim(),
                HasAdjustment = hasAdjustment,
                CoeffX2 = coeffX2,
                ApplyCorrectionEj = applyCorrectionEj,
                AccuracyError = accuracyError,
                HighLimitActive = highActive,
                HighLimit = highLimit,
                LowLimitActive = lowActive,
                LowLimit = lowLimit,
            };
            return true;
        }

        private static IDbConnection CreateConnection(out bool isSqlServer)
        {
            var provider = GetSetting("Vigi.Db.Provider", "mysql").Trim().ToLowerInvariant();
            var host = GetSetting("Vigi.Db.Host", provider == "mssql" ? "127.0.0.1" : "192.168.63.144");
            var database = GetSetting("Vigi.Db.MainDatabase", "vigitemp");
            var user = GetSetting("Vigi.Db.User", provider == "mssql" ? "sa" : "root");
            var password = GetSetting("Vigi.Db.Password", provider == "mssql" ? string.Empty : "pass");
            var timeout = GetSettingInt("Vigi.Db.ConnectionTimeoutSeconds", 5);

            isSqlServer = provider == "mssql";
            if (isSqlServer)
            {
                var port = GetSetting("Vigi.Db.Port", "1433");
                var source = string.IsNullOrWhiteSpace(port) ? host : host + "," + port;
                var builder = new SqlConnectionStringBuilder
                {
                    DataSource = source,
                    InitialCatalog = database,
                    UserID = user,
                    Password = password,
                    ConnectTimeout = timeout,
                    Encrypt = GetSettingBool("Vigi.Db.SqlServer.Encrypt", false),
                    TrustServerCertificate = GetSettingBool("Vigi.Db.SqlServer.TrustServerCertificate", true),
                    Pooling = true,
                };
                return new SqlConnection(builder.ConnectionString);
            }

            var mysqlPort = (uint)Math.Max(1, GetSettingInt("Vigi.Db.Port", 3306));
            var mysqlBuilder = new MySqlConnectionStringBuilder
            {
                Server = host,
                Port = mysqlPort,
                Database = database,
                UserID = user,
                Password = password,
                ConnectionTimeout = (uint)Math.Max(1, timeout),
                Pooling = true,
            };
            return new MySqlConnection(mysqlBuilder.ConnectionString);
        }

        private static void AddParameter(IDbCommand command, string name, object value)
        {
            var parameter = command.CreateParameter();
            parameter.ParameterName = name;
            parameter.Value = value ?? DBNull.Value;
            command.Parameters.Add(parameter);
        }

        private static string ReadString(IDataRecord reader, string column)
        {
            try
            {
                var ordinal = reader.GetOrdinal(column);
                return reader.IsDBNull(ordinal) ? null : Convert.ToString(reader.GetValue(ordinal), CultureInfo.InvariantCulture);
            }
            catch
            {
                return null;
            }
        }

        private static int ReadInt(IDataRecord reader, string column, int defaultValue)
        {
            try
            {
                var ordinal = reader.GetOrdinal(column);
                return reader.IsDBNull(ordinal) ? defaultValue : Convert.ToInt32(reader.GetValue(ordinal), CultureInfo.InvariantCulture);
            }
            catch
            {
                return defaultValue;
            }
        }

        private static bool ReadBool(IDataRecord reader, string column, bool defaultValue)
        {
            try
            {
                var ordinal = reader.GetOrdinal(column);
                if (reader.IsDBNull(ordinal)) return defaultValue;
                var raw = reader.GetValue(ordinal);
                if (raw is bool) return (bool)raw;
                var text = Convert.ToString(raw, CultureInfo.InvariantCulture);
                if (text == "1") return true;
                if (text == "0") return false;
                return bool.TryParse(text, out var parsed) ? parsed : defaultValue;
            }
            catch
            {
                return defaultValue;
            }
        }

        private static double? ReadDouble(IDataRecord reader, string column)
        {
            try
            {
                var ordinal = reader.GetOrdinal(column);
                if (reader.IsDBNull(ordinal)) return null;
                return Convert.ToDouble(reader.GetValue(ordinal), CultureInfo.InvariantCulture);
            }
            catch
            {
                return null;
            }
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

        private static int GetSettingInt(string key, int defaultValue)
        {
            var raw = GetSetting(key, defaultValue.ToString(CultureInfo.InvariantCulture));
            return int.TryParse(raw, NumberStyles.Integer, CultureInfo.InvariantCulture, out var value)
                ? value
                : defaultValue;
        }

        private static bool GetSettingBool(string key, bool defaultValue)
        {
            var raw = GetSetting(key, null);
            return !string.IsNullOrWhiteSpace(raw) && bool.TryParse(raw, out var value)
                ? value
                : defaultValue;
        }
    }

    internal static class GspProtocol
    {
        internal const int MaxMemoryMeasurementCount = 5330;
        internal const int MaxMemoryMeasurementsPerRequest = 500;
        internal const int MaxModuleCommandCharacters = 60;
        private const double ComparisonTolerance = 0.000001d;

        private static readonly string[] GspTypePrefixes =
        {
            "SPNB", "SPNG", "SPPS", "SPAL", "SPPC", "SPAU", "SPCF", "SPMI",
            "SPCO", "SPHY", "SPTH", "SPDI", "SPAT", "SPLU", "SP01", "SP42",
            "SPOF", "SPXB", "SPXG", "SPXP", "SPFB", "SPFG", "SPFP", "GSP",
        };

        internal static bool TryNormalizeMemoryRequest(int requestedCount, int requestedOffset, out int count, out int offset)
        {
            offset = Math.Max(0, requestedOffset);
            if (offset >= MaxMemoryMeasurementCount)
            {
                count = 0;
                return false;
            }

            count = Math.Min(
                Math.Min(Math.Max(1, requestedCount), MaxMemoryMeasurementsPerRequest),
                MaxMemoryMeasurementCount - offset);
            return count > 0;
        }

        internal static bool HasEndTerminator(string response)
        {
            if (string.IsNullOrWhiteSpace(response)) return false;
            var normalized = response.Replace("\r\n", "\n").Replace('\r', '\n').TrimEnd();
            return Regex.IsMatch(normalized, @"(?:^|\n)\s*END\s*$", RegexOptions.IgnoreCase);
        }

        internal static List<KeyValuePair<string, string>> BuildConfigurationCommands(
            string channel,
            SondeMetrologySettings metrology,
            LieuAlarmSettings alarmSettings,
            int frequencySeconds)
        {
            var highActive = alarmSettings != null && alarmSettings.ConsigneSupActive;
            var lowActive = alarmSettings != null && alarmSettings.ConsigneInfActive;
            return BuildConfigurationCommandsInternal(
                channel,
                metrology,
                alarmSettings?.ConsigneSup,
                highActive,
                alarmSettings?.ConsigneInf,
                lowActive,
                alarmSettings == null ? 0 : Math.Max(0, alarmSettings.RetardAlarmeBasMinutes),
                alarmSettings == null ? 0 : Math.Max(0, alarmSettings.RetardAlarmeHautMinutes),
                frequencySeconds);
        }

        // Compatibility overload used by the Hotline manual sync screen.
        internal static List<KeyValuePair<string, string>> BuildConfigurationCommands(
            string channel,
            SondeMetrologySettings metrology,
            double? highLimit,
            double? lowLimit,
            int alarmDelayLowMinutes,
            int alarmDelayHighMinutes,
            int frequencySeconds)
        {
            return BuildConfigurationCommandsInternal(
                channel,
                metrology,
                highLimit,
                IsEnabledLimit(highLimit, true),
                lowLimit,
                IsEnabledLimit(lowLimit, true),
                alarmDelayLowMinutes,
                alarmDelayHighMinutes,
                frequencySeconds);
        }

        private static List<KeyValuePair<string, string>> BuildConfigurationCommandsInternal(
            string channel,
            SondeMetrologySettings metrology,
            double? highLimit,
            bool highLimitActive,
            double? lowLimit,
            bool lowLimitActive,
            int alarmDelayLowMinutes,
            int alarmDelayHighMinutes,
            int frequencySeconds)
        {
            var commands = new List<KeyValuePair<string, string>>();
            commands.Add(new KeyValuePair<string, string>("ED-H", BuildDateTimePayload(DateTime.Now)));

            ResolvePhysicalCoefficients(
                metrology,
                out var coeffA,
                out var coeffB,
                out var coeffC,
                out var multipoint);
            var offset = metrology?.Offset ?? 0d;

            // Runtime DB settings carry IdLieu. Hotline manual sync does not, so a
            // supplied AccuracyError remains usable there even though ApplyCorrectionEj
            // is not exposed by that legacy request shape.
            var applyAccuracyError = metrology != null &&
                (metrology.ApplyCorrectionEj || (!metrology.IdLieu.HasValue && metrology.ErrJustesse.HasValue));
            var accuracyError = applyAccuracyError ? (metrology.ErrJustesse ?? 0d) : 0d;

            var frequencyMinutes = Math.Max(
                1,
                (int)Math.Round(Math.Max(1, frequencySeconds) / 60d, MidpointRounding.AwayFromZero));

            var highPayload = IsEnabledLimit(highLimit, highLimitActive)
                ? FormatNumericPayload(highLimit.Value)
                : "NAN";
            var lowPayload = IsEnabledLimit(lowLimit, lowLimitActive)
                ? FormatNumericPayload(lowLimit.Value)
                : "NAN";

            var payload = string.Format(
                CultureInfo.InvariantCulture,
                "{0}a{1}b{2}c{3}d{4}e{5}m{6}h{7}l{8}f{9}r{10}t",
                FormatCoefficient(coeffA),
                FormatCoefficient(coeffB),
                FormatCoefficient(coeffC),
                FormatCorrection(offset),
                FormatCorrection(accuracyError),
                multipoint ? 1 : 0,
                highPayload,
                lowPayload,
                frequencyMinutes,
                Math.Max(0, alarmDelayLowMinutes),
                Math.Max(0, alarmDelayHighMinutes));

            commands.Add(new KeyValuePair<string, string>("ECON", payload));

            if (!string.IsNullOrWhiteSpace(channel))
            {
                commands.Add(new KeyValuePair<string, string>("CHAN", channel.Trim() + "n"));
            }

            return commands;
        }

        internal static string BuildMetrologyCoefficientsPayload(
            SondeMetrologySettings metrology,
            bool neutral)
        {
            var coeffA = 1d;
            var coeffB = 0d;
            var coeffC = 0d;

            if (!neutral)
            {
                ResolvePhysicalCoefficients(
                    metrology,
                    out coeffA,
                    out coeffB,
                    out coeffC,
                    out _);
            }

            return string.Format(
                CultureInfo.InvariantCulture,
                "{0}a{1}b{2}c",
                FormatCoefficient(coeffA),
                FormatCoefficient(coeffB),
                FormatCoefficient(coeffC));
        }

        private static void ResolvePhysicalCoefficients(
            SondeMetrologySettings metrology,
            out double coeffA,
            out double coeffB,
            out double coeffC,
            out bool multipoint)
        {
            // The metrology provider loads these values from the latest t_ajustage
            // row for the probe serial number. A location lookup is neither needed
            // nor reliable for probes that are not currently assigned to a location.
            var coeffX2 = metrology?.CoeffX2 ?? 0d;

            multipoint = Math.Abs(coeffX2) > ComparisonTolerance;
            coeffA = multipoint ? coeffX2 : (metrology?.CoeffX ?? 1d);
            coeffB = multipoint ? (metrology?.CoeffX ?? 1d) : (metrology?.CoeffConstant ?? 0d);
            coeffC = multipoint ? (metrology?.CoeffConstant ?? 0d) : 0d;
        }

        private static bool IsEnabledLimit(double? value, bool active)
        {
            return active && value.HasValue && Math.Abs(value.Value - 999d) > ComparisonTolerance;
        }

        private static string FormatCoefficient(double value)
        {
            if (Math.Abs(value) < 0.00000000005d) value = 0d;
            return value.ToString("0.0000000000", CultureInfo.InvariantCulture);
        }

        private static string FormatCorrection(double value)
        {
            if (Math.Abs(value) < 0.005d) value = 0d;
            return value.ToString("0.00", CultureInfo.InvariantCulture);
        }

        internal static string NormalizeCommandTarget(string serialNumber)
        {
            if (string.IsNullOrWhiteSpace(serialNumber)) return string.Empty;
            var trimmed = serialNumber.Trim().ToUpperInvariant();
            if (Regex.IsMatch(trimmed, @"^SP[A-Z0-9]{2}-\d+$", RegexOptions.IgnoreCase)) return trimmed;
            if (trimmed.StartsWith("GSP", StringComparison.OrdinalIgnoreCase) && trimmed.Length > 3)
            {
                return trimmed.Substring(3);
            }
            return trimmed;
        }

        internal static bool IsGspSerial(string serialNumber)
        {
            if (string.IsNullOrWhiteSpace(serialNumber)) return false;
            var trimmed = serialNumber.Trim().ToUpperInvariant();
            return GspTypePrefixes.Any(prefix => trimmed.StartsWith(prefix, StringComparison.OrdinalIgnoreCase));
        }

        internal static IEnumerable<string> BuildCandidateCommands(string command)
        {
            var baseCommand = command ?? string.Empty;
            if (string.IsNullOrWhiteSpace(baseCommand))
            {
                yield return string.Empty;
                yield break;
            }
            yield return baseCommand;
        }

        internal static string BuildCommand(string prefix, string target, string payload)
        {
            var normalizedPrefix = (prefix ?? string.Empty).Trim();
            var normalizedTarget = (target ?? string.Empty).Trim();
            var normalizedPayload = (payload ?? string.Empty).Trim();
            return normalizedPayload.Length == 0
                ? normalizedPrefix + normalizedTarget + " "
                : normalizedPrefix + normalizedTarget + " " + normalizedPayload;
        }

        internal static bool TryBuildCommandFragments(
            string prefix,
            string target,
            string payload,
            int maxCommandCharacters,
            out List<string> commands)
        {
            commands = new List<string>();

            var normalizedPrefix = (prefix ?? string.Empty).Trim();
            var normalizedTarget = (target ?? string.Empty).Trim();
            var normalizedPayload = (payload ?? string.Empty).Trim();
            var fullCommand = BuildCommand(normalizedPrefix, normalizedTarget, normalizedPayload);

            if (maxCommandCharacters <= 0)
            {
                return false;
            }

            if (fullCommand.Length <= maxCommandCharacters)
            {
                commands.Add(fullCommand);
                return true;
            }

            if (!string.Equals(normalizedPrefix, "ECON", StringComparison.OrdinalIgnoreCase)
                || string.IsNullOrWhiteSpace(normalizedTarget)
                || string.IsNullOrWhiteSpace(normalizedPayload))
            {
                return false;
            }

            // ECON est composé de couples valeur + marqueur. Les valeurs émises par
            // le Serveur sont décimales fixes (ou NAN), donc les marqueurs minuscules
            // constituent des frontières sûres pour découper sans tronquer une valeur.
            const string parameterMarkers = "abcdemhlfrt";
            var tokens = new List<string>();
            var tokenStart = 0;
            for (var index = 0; index < normalizedPayload.Length; index++)
            {
                if (parameterMarkers.IndexOf(normalizedPayload[index]) < 0)
                {
                    continue;
                }

                if (index <= tokenStart)
                {
                    return false;
                }

                tokens.Add(normalizedPayload.Substring(tokenStart, index - tokenStart + 1));
                tokenStart = index + 1;
            }

            if (tokens.Count == 0 || tokenStart != normalizedPayload.Length)
            {
                return false;
            }

            var currentPayload = new StringBuilder();
            foreach (var token in tokens)
            {
                var candidatePayload = currentPayload.ToString() + token;
                if (BuildCommand(normalizedPrefix, normalizedTarget, candidatePayload).Length <= maxCommandCharacters)
                {
                    currentPayload.Append(token);
                    continue;
                }

                if (currentPayload.Length == 0)
                {
                    return false;
                }

                commands.Add(BuildCommand(normalizedPrefix, normalizedTarget, currentPayload.ToString()));
                currentPayload.Clear();

                if (BuildCommand(normalizedPrefix, normalizedTarget, token).Length > maxCommandCharacters)
                {
                    commands.Clear();
                    return false;
                }

                currentPayload.Append(token);
            }

            if (currentPayload.Length > 0)
            {
                commands.Add(BuildCommand(normalizedPrefix, normalizedTarget, currentPayload.ToString()));
            }

            return commands.Count > 0 && commands.All(command => command.Length <= maxCommandCharacters);
        }

        internal static bool TryBuildEconMetrologyCoefficientsCommand(
            string command,
            string target,
            out string coefficientsCommand)
        {
            coefficientsCommand = string.Empty;

            var normalizedCommand = (command ?? string.Empty).Trim();
            var normalizedTarget = NormalizeCommandTarget(target);
            if (string.IsNullOrWhiteSpace(normalizedCommand) || string.IsNullOrWhiteSpace(normalizedTarget))
            {
                return false;
            }

            var expectedPrefix = "ECON" + normalizedTarget;
            if (!normalizedCommand.StartsWith(expectedPrefix, StringComparison.OrdinalIgnoreCase) ||
                normalizedCommand.Length <= expectedPrefix.Length ||
                !char.IsWhiteSpace(normalizedCommand[expectedPrefix.Length]))
            {
                return false;
            }

            var payload = normalizedCommand.Substring(expectedPrefix.Length).Trim();
            var coefficientAEnd = payload.IndexOf('a');
            var coefficientBEnd = coefficientAEnd < 0 ? -1 : payload.IndexOf('b', coefficientAEnd + 1);
            var coefficientCEnd = coefficientBEnd < 0 ? -1 : payload.IndexOf('c', coefficientBEnd + 1);
            if (coefficientAEnd <= 0 ||
                coefficientBEnd <= coefficientAEnd + 1 ||
                coefficientCEnd <= coefficientBEnd + 1)
            {
                return false;
            }

            if (!double.TryParse(
                    payload.Substring(0, coefficientAEnd),
                    NumberStyles.Float,
                    CultureInfo.InvariantCulture,
                    out _) ||
                !double.TryParse(
                    payload.Substring(coefficientAEnd + 1, coefficientBEnd - coefficientAEnd - 1),
                    NumberStyles.Float,
                    CultureInfo.InvariantCulture,
                    out _) ||
                !double.TryParse(
                    payload.Substring(coefficientBEnd + 1, coefficientCEnd - coefficientBEnd - 1),
                    NumberStyles.Float,
                    CultureInfo.InvariantCulture,
                    out _))
            {
                return false;
            }

            coefficientsCommand = BuildCommand(
                "ECON",
                normalizedTarget,
                payload.Substring(0, coefficientCEnd + 1));
            return true;
        }

        internal static bool TrySplitEconCalibrationCommand(
            string command,
            string target,
            out string coefficientsCommand,
            out string remainingParametersCommand)
        {
            coefficientsCommand = string.Empty;
            remainingParametersCommand = string.Empty;

            var normalizedCommand = (command ?? string.Empty).Trim();
            var normalizedTarget = NormalizeCommandTarget(target);
            if (string.IsNullOrWhiteSpace(normalizedCommand) || string.IsNullOrWhiteSpace(normalizedTarget))
            {
                return false;
            }

            var expectedPrefix = "ECON" + normalizedTarget;
            if (!normalizedCommand.StartsWith(expectedPrefix, StringComparison.OrdinalIgnoreCase) ||
                normalizedCommand.Length <= expectedPrefix.Length ||
                !char.IsWhiteSpace(normalizedCommand[expectedPrefix.Length]))
            {
                return false;
            }

            var payload = normalizedCommand.Substring(expectedPrefix.Length).Trim();
            var coefficientAEnd = payload.IndexOf('a');
            var coefficientBEnd = coefficientAEnd < 0 ? -1 : payload.IndexOf('b', coefficientAEnd + 1);
            if (coefficientAEnd <= 0 ||
                coefficientBEnd <= coefficientAEnd + 1 ||
                coefficientBEnd >= payload.Length - 1)
            {
                return false;
            }

            if (!double.TryParse(
                    payload.Substring(0, coefficientAEnd),
                    NumberStyles.Float,
                    CultureInfo.InvariantCulture,
                    out _) ||
                !double.TryParse(
                    payload.Substring(coefficientAEnd + 1, coefficientBEnd - coefficientAEnd - 1),
                    NumberStyles.Float,
                    CultureInfo.InvariantCulture,
                    out _))
            {
                return false;
            }

            var coefficientsPayload = payload.Substring(0, coefficientBEnd + 1);
            var remainingPayload = payload.Substring(coefficientBEnd + 1);
            var expectedRemainingMarkers = new[] { 'c', 'd', 'e', 'm', 'h', 'l', 'f', 'r', 't' };
            var markerSearchStart = 0;
            foreach (var marker in expectedRemainingMarkers)
            {
                var markerIndex = remainingPayload.IndexOf(marker, markerSearchStart);
                if (markerIndex <= markerSearchStart)
                {
                    return false;
                }
                markerSearchStart = markerIndex + 1;
            }

            if (markerSearchStart != remainingPayload.Length)
            {
                return false;
            }

            coefficientsCommand = BuildCommand("ECON", normalizedTarget, coefficientsPayload);
            remainingParametersCommand = BuildCommand("ECON", normalizedTarget, remainingPayload);
            return true;
        }

        internal static byte[] EncodeCommand(string command)
        {
            return Encoding.ASCII.GetBytes(command ?? string.Empty);
        }

        internal static bool IsCommandEchoOnly(string response, string command)
        {
            return !string.IsNullOrWhiteSpace(response) &&
                !string.IsNullOrWhiteSpace(command) &&
                string.IsNullOrWhiteSpace(StripCommandEcho(response, command));
        }

        internal static string StripCommandEcho(string response, string command)
        {
            var raw = StripTransportNoise(response);
            var normalizedCommand = NormalizeCommandWhitespace(command);
            if (string.IsNullOrWhiteSpace(raw) || string.IsNullOrWhiteSpace(normalizedCommand)) return raw;

            var commandWithoutTrailingWhitespace = (command ?? string.Empty).Trim();
            if (raw.StartsWith(commandWithoutTrailingWhitespace, StringComparison.OrdinalIgnoreCase))
            {
                var remainder = raw.Substring(commandWithoutTrailingWhitespace.Length);
                if (remainder.Length == 0 || char.IsWhiteSpace(remainder[0])) raw = remainder.TrimStart();
            }

            var filtered = Regex.Split(raw, @"\r?\n")
                .Where(line => !string.IsNullOrWhiteSpace(line))
                .Where(line => !string.Equals(
                    NormalizeCommandWhitespace(line),
                    normalizedCommand,
                    StringComparison.OrdinalIgnoreCase))
                .ToList();

            return StripTransportNoise(filtered.Count == 0 ? string.Empty : string.Join(Environment.NewLine, filtered));
        }

        internal static string StripTransportNoise(string response)
        {
            var normalized = (response ?? string.Empty).Trim();
            if (normalized.Length == 0) return string.Empty;

            // Certains modules utilisent ponctuellement la séquence de contrôle série
            // « +++ » avant de délivrer la vraie trame GSP. Ce token n'est pas une
            // réponse métier et ne doit pas démarrer les délais de fin de réponse.
            // On ne supprime que le token exact, jamais les '+' contenus dans les
            // valeurs métier (par exemple Alarm=F+D+E+LH+LB+RB+RH).
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

        private static string NormalizeCommandWhitespace(string value)
        {
            return Regex.Replace((value ?? string.Empty).Trim(), @"\s+", " ");
        }

        internal static string BuildDateTimePayload(DateTime value)
        {
            return string.Format(
                CultureInfo.InvariantCulture,
                "{0:00},{1:00},{2:00},{3:00},{4:00},{5:00},",
                value.Year % 100,
                value.Month,
                value.Day,
                value.Hour,
                value.Minute,
                value.Second);
        }

        internal static bool TryExtractTemperature(string response, string target, out double temperature)
        {
            string unit;
            return TryExtractTemperature(response, target, out temperature, out unit);
        }

        internal static bool TryExtractTemperature(string response, string target, out double temperature, out string unit)
        {
            temperature = 0d;
            unit = "C";
            if (!TryParseTemperatureResponse(response, target, out var parsed) || !parsed.Temperature.HasValue) return false;
            temperature = parsed.Temperature.Value;
            unit = string.IsNullOrWhiteSpace(parsed.Unit) ? "C" : parsed.Unit;
            return true;
        }

        internal static bool TryParseTemperatureResponse(string response, string target, out GspTemperatureResponse parsed)
        {
            parsed = null;
            if (string.IsNullOrWhiteSpace(response) || string.IsNullOrWhiteSpace(target)) return false;

            var normalizedTarget = target.Trim().ToUpperInvariant();
            var extractedSerial = TryExtractLineValue(response, "Serial");
            if (!string.IsNullOrWhiteSpace(extractedSerial) &&
                !string.Equals(extractedSerial.Trim(), normalizedTarget, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            var measuredValue = TryExtractTemperatureValue(response, normalizedTarget, out var measuredUnit);
            var result = new GspTemperatureResponse
            {
                Serial = !string.IsNullOrWhiteSpace(extractedSerial)
                    ? extractedSerial.Trim().ToUpperInvariant()
                    : ExtractDetectedSerials(response).FirstOrDefault(),
                ProbeDateTime = TryExtractProbeDateTime(response),
                Temperature = measuredValue,
                Unit = measuredUnit,
                BatteryPercent = TryExtractIntLineValue(response, "Batterie"),
                Rssi = TryExtractIntLineValue(response, "RSSI"),
                AlarmStateRaw = TryExtractLineValue(response, "Alarm"),
            };
            result.IsOnBatteryPower = TryExtractPowerState(result.AlarmStateRaw);
            result.IsMaintenanceMode = ContainsAlarmToken(result.AlarmStateRaw, "M");

            if (!result.Temperature.HasValue) return false;
            parsed = result;
            return true;
        }

        internal static bool TryParseMemoResponse(string response, string target, out GspMemoResponse parsed)
        {
            parsed = null;
            if (string.IsNullOrWhiteSpace(response) || string.IsNullOrWhiteSpace(target)) return false;

            var hasMemoAck = Regex.IsMatch(response, @"(?:^|\r?\n)\s*ACK\s*=\s*MEMO\s*(?:\r?\n|$)", RegexOptions.IgnoreCase);
            var normalizedTarget = target.Trim().ToUpperInvariant();
            var extractedSerial = TryExtractLineValue(response, "Serial");
            if (!string.IsNullOrWhiteSpace(extractedSerial) &&
                !string.Equals(extractedSerial.Trim(), normalizedTarget, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            var result = new GspMemoResponse
            {
                Serial = !string.IsNullOrWhiteSpace(extractedSerial)
                    ? extractedSerial.Trim().ToUpperInvariant()
                    : ExtractDetectedSerials(response).FirstOrDefault(),
                Offset = TryExtractIntLineValue(response, "Offset"),
                ReturnedCount = TryExtractIntLineValue(response, "NombreMesure"),
            };

            foreach (Match match in Regex.Matches(
                response,
                @"^[ \t]*(\d+)\|(\d{2}/\d{2}/\d{4}[ \t]+\d{2}:\d{2}:\d{2})=(-?\d+(?:[.,]\d+)?)[ \t]*\r?$",
                RegexOptions.IgnoreCase | RegexOptions.Multiline))
            {
                if (!match.Success || match.Groups.Count < 4) continue;
                if (!int.TryParse(match.Groups[1].Value, NumberStyles.Integer, CultureInfo.InvariantCulture, out var index)) continue;

                DateTime? probeDateTime = null;
                if (DateTime.TryParseExact(
                    match.Groups[2].Value.Trim(),
                    "dd/MM/yyyy HH:mm:ss",
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.None,
                    out var parsedDateTime))
                {
                    probeDateTime = parsedDateTime;
                }

                if (!double.TryParse(
                    match.Groups[3].Value.Replace(',', '.'),
                    NumberStyles.Float | NumberStyles.AllowLeadingSign,
                    CultureInfo.InvariantCulture,
                    out var temperature)) continue;

                if (double.IsNaN(temperature) || double.IsInfinity(temperature) || Math.Abs(temperature) > 1000d) continue;
                result.Measurements.Add(new GspMemoMeasurement
                {
                    Index = index,
                    ProbeDateTime = probeDateTime,
                    Temperature = temperature,
                });
            }

            if (!hasMemoAck && result.Measurements.Count == 0) return false;
            if (!result.ReturnedCount.HasValue) result.ReturnedCount = result.Measurements.Count;
            if (result.Measurements.Count == 0 && !result.ReturnedCount.HasValue) return false;
            parsed = result;
            return true;
        }

        internal static bool TryParseConfigurationResponse(string response, string target, out GspConfigurationResponse parsed)
        {
            parsed = null;
            if (string.IsNullOrWhiteSpace(response) || string.IsNullOrWhiteSpace(target)) return false;

            var normalizedTarget = target.Trim().ToUpperInvariant();
            var extractedSerial = TryExtractLineValue(response, "Serial");
            if (!string.IsNullOrWhiteSpace(extractedSerial) &&
                !string.Equals(extractedSerial.Trim(), normalizedTarget, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            var physicalA = TryExtractDoubleLineValue(response, "A")
                ?? TryExtractDoubleLineValue(response, "CoeffA")
                ?? TryExtractCompactNumeric(response, 'a');
            var physicalB = TryExtractDoubleLineValue(response, "B")
                ?? TryExtractDoubleLineValue(response, "CoeffB")
                ?? TryExtractCompactNumeric(response, 'b');
            var physicalC = TryExtractDoubleLineValue(response, "C")
                ?? TryExtractDoubleLineValue(response, "Etalonnage")
                ?? TryExtractCompactNumeric(response, 'c');

            var rawOffset = TryExtractLineValue(response, "Off") ?? TryExtractLineValue(response, "Offset");
            var rawAccuracy = TryExtractLineValue(response, "Justesse") ?? TryExtractLineValue(response, "ErreurJustesse");
            var rawMulti = TryExtractLineValue(response, "Multi") ?? TryExtractLineValue(response, "Multipoint");
            var offset = ParseNullableDouble(rawOffset);
            var accuracyError = ParseNullableDouble(rawAccuracy);
            var multipoint = ParseNullableInt(rawMulti);
            var extended = rawOffset != null || rawAccuracy != null || rawMulti != null;

            var highLimit = TryExtractLimit(response, new[] { "LimH", "LimiteHaute", "ConsigneSup", "High" }, 'h', out var highDisabled);
            var lowLimit = TryExtractLimit(response, new[] { "LimB", "LimiteBasse", "ConsigneInf", "Low" }, 'l', out var lowDisabled);

            var frequencyMinutes = TryExtractRoundedIntLineValue(response, "F")
                ?? TryExtractRoundedIntLineValue(response, "Frequence")
                ?? TryExtractRoundedIntLineValue(response, "FrequenceMinutes")
                ?? TryExtractCompactInt(response, 'f');
            var delayLow = TryExtractRoundedIntLineValue(response, "RetB")
                ?? TryExtractRoundedIntLineValue(response, "RetardBas")
                ?? TryExtractRoundedIntLineValue(response, "RetardAlarmeBas")
                ?? TryExtractRoundedIntLineValue(response, "RetardAlarmeBasMinutes")
                ?? TryExtractCompactInt(response, 'r')
                ?? TryExtractRoundedIntLineValue(response, "Retard")
                ?? TryExtractRoundedIntLineValue(response, "RetardAlarme")
                ?? TryExtractRoundedIntLineValue(response, "RetardAlarmeMinutes");
            var delayHigh = TryExtractRoundedIntLineValue(response, "RetH")
                ?? TryExtractRoundedIntLineValue(response, "RetardHaut")
                ?? TryExtractRoundedIntLineValue(response, "RetardAlarmeHaut")
                ?? TryExtractRoundedIntLineValue(response, "RetardAlarmeHautMinutes")
                ?? TryExtractCompactInt(response, 't')
                ?? TryExtractRoundedIntLineValue(response, "Retard")
                ?? TryExtractRoundedIntLineValue(response, "RetardAlarme")
                ?? TryExtractRoundedIntLineValue(response, "RetardAlarmeMinutes");

            // Very old compact DCON variants used d for a shared delay. Do not use
            // that fallback once the new protocol is detected because d is now Offset.
            if (!extended)
            {
                var legacySharedDelay = TryExtractCompactInt(response, 'd');
                if (!delayLow.HasValue) delayLow = legacySharedDelay;
                if (!delayHigh.HasValue) delayHigh = legacySharedDelay;
            }

            var result = new GspConfigurationResponse
            {
                Serial = !string.IsNullOrWhiteSpace(extractedSerial)
                    ? extractedSerial.Trim().ToUpperInvariant()
                    : ExtractDetectedSerials(response).FirstOrDefault(),
                PhysicalCoeffA = physicalA,
                PhysicalCoeffB = physicalB,
                PhysicalCoeffC = physicalC,
                Offset = offset,
                AccuracyError = accuracyError,
                MultiPoint = multipoint,
                HighLimitDisabled = highDisabled,
                LowLimitDisabled = lowDisabled,
                UsesExtendedMetrology = extended,
                FrequencyMinutes = frequencyMinutes,
                AlarmDelayLowMinutes = delayLow,
                AlarmDelayHighMinutes = delayHigh,
            };

            if (extended)
            {
                // Keep the existing SensorGSP comparison code valid by projecting
                // the new physical formula back onto its legacy logical A/B view.
                if (multipoint.GetValueOrDefault(0) == 1)
                {
                    result.CoeffA = physicalB;
                    result.CoeffB = physicalC.HasValue
                        ? physicalC.Value + (offset ?? 0d)
                        : (double?)null;
                }
                else
                {
                    result.CoeffA = physicalA;
                    result.CoeffB = physicalB.HasValue
                        ? physicalB.Value + (offset ?? 0d)
                        : (double?)null;
                }

                result.CorrectionC = accuracyError;
            }
            else
            {
                result.CoeffA = physicalA;
                result.CoeffB = physicalB;
                result.CorrectionC = physicalC;
            }

            foreach (var code in ExtractMissingConfigurationCodes(response)) AddMissingCode(result, code);

            if (extended)
            {
                if (!physicalA.HasValue || !physicalB.HasValue || !physicalC.HasValue ||
                    !offset.HasValue || !accuracyError.HasValue || !multipoint.HasValue)
                {
                    AddMissingCode(result, "METRO");
                }

                if (GspExpectedConfigurationReader.TryGetByTarget(normalizedTarget, out var expected))
                {
                    var expectedMultipoint = expected.HasAdjustment && Math.Abs(expected.CoeffX2) > ComparisonTolerance ? 1 : 0;
                    if (!multipoint.HasValue || multipoint.Value != expectedMultipoint) AddMissingCode(result, "METRO");
                    if (expectedMultipoint == 1)
                    {
                        if (!physicalA.HasValue || !AreClose(physicalA.Value, expected.CoeffX2)) AddMissingCode(result, "METRO");
                    }
                    else if (physicalC.HasValue && !AreClose(physicalC.Value, 0d))
                    {
                        AddMissingCode(result, "METRO");
                    }

                    var expectedAccuracy = expected.ApplyCorrectionEj ? (expected.AccuracyError ?? 0d) : 0d;
                    if (!accuracyError.HasValue || !AreClose(accuracyError.Value, expectedAccuracy)) AddMissingCode(result, "METRO");

                    // SensorGSP's old comparison expects the stored EJ, not the
                    // applied correction (-EJ), so expose the DB value here while
                    // validating the new physical e value independently above.
                    result.CorrectionC = expected.AccuracyError ?? 0d;

                    var expectedHighEnabled = IsEnabledLimit(expected.HighLimit, expected.HighLimitActive);
                    if (expectedHighEnabled)
                    {
                        if (highDisabled || !highLimit.HasValue || !AreClose(highLimit.Value, expected.HighLimit.Value)) AddMissingCode(result, "LIMIT");
                    }
                    else if (!highDisabled)
                    {
                        AddMissingCode(result, "LIMIT");
                    }

                    var expectedLowEnabled = IsEnabledLimit(expected.LowLimit, expected.LowLimitActive);
                    if (expectedLowEnabled)
                    {
                        if (lowDisabled || !lowLimit.HasValue || !AreClose(lowLimit.Value, expected.LowLimit.Value)) AddMissingCode(result, "LIMIT");
                    }
                    else if (!lowDisabled)
                    {
                        AddMissingCode(result, "LIMIT");
                    }

                    // Give the existing comparison code a stable logical value even
                    // when the physical new protocol correctly returns NAN.
                    result.HighLimit = expected.HighLimit ?? 0d;
                    result.LowLimit = expected.LowLimit ?? 0d;
                }
                else
                {
                    result.HighLimit = highDisabled ? 999d : highLimit;
                    result.LowLimit = lowDisabled ? 999d : lowLimit;
                }
            }
            else
            {
                result.HighLimit = highLimit;
                result.LowLimit = lowLimit;
            }

            if (!result.CoeffA.HasValue &&
                !result.CoeffB.HasValue &&
                !result.CorrectionC.HasValue &&
                !result.HighLimit.HasValue &&
                !result.LowLimit.HasValue &&
                !result.FrequencyMinutes.HasValue &&
                !result.AlarmDelayLowMinutes.HasValue &&
                !result.AlarmDelayHighMinutes.HasValue &&
                result.MissingConfigurationCodes.Count == 0)
            {
                return false;
            }

            parsed = result;
            return true;
        }

        private static void AddMissingCode(GspConfigurationResponse result, string code)
        {
            if (result == null || string.IsNullOrWhiteSpace(code)) return;
            if (!result.MissingConfigurationCodes.Any(existing => string.Equals(existing, code, StringComparison.OrdinalIgnoreCase)))
            {
                result.MissingConfigurationCodes.Add(code);
            }
        }

        private static bool AreClose(double left, double right)
        {
            return Math.Abs(left - right) < ComparisonTolerance;
        }

        internal static List<string> ExtractDetectedSerials(string response)
        {
            if (string.IsNullOrWhiteSpace(response)) return new List<string>();
            return Regex.Matches(response, @"(?:R?TEMP|R?FTEM|FTEM|DCON|ECON|ED-H|MEMO|DD-H)((?:SP[A-Z0-9]{2}-\d+)|[PN]\d+)", RegexOptions.IgnoreCase)
                .Cast<Match>()
                .Where(match => match.Success && match.Groups.Count >= 2)
                .Select(match => (match.Groups[1].Value ?? string.Empty).Trim().ToUpperInvariant())
                .Concat(
                    Regex.Matches(response, @"(?:^|\r?\n)\s*Serial\s*=\s*([A-Z0-9\-]+)\s*(?:\r?\n|$)", RegexOptions.IgnoreCase)
                        .Cast<Match>()
                        .Where(match => match.Success && match.Groups.Count >= 2)
                        .Select(match => (match.Groups[1].Value ?? string.Empty).Trim().ToUpperInvariant()))
                .Where(serial => !string.IsNullOrWhiteSpace(serial))
                .Distinct()
                .ToList();
        }

        internal static bool TryGetOverflowField(string response, out string field)
        {
            field = null;
            if (string.IsNullOrWhiteSpace(response)) return false;

            var match = Regex.Match(
                response,
                @"(?:^|\r?\n)\s*([A-Za-z][A-Za-z0-9_]*)\s*=\s*ovf\b",
                RegexOptions.IgnoreCase);
            if (!match.Success || match.Groups.Count < 2) return false;

            field = match.Groups[1].Value.Trim();
            return field.Length > 0;
        }

        internal static bool IsAcknowledgementForTarget(string response, string commandPrefix, string target)
        {
            if (string.IsNullOrWhiteSpace(response) || string.IsNullOrWhiteSpace(commandPrefix) || string.IsNullOrWhiteSpace(target)) return false;
            if (TryGetOverflowField(response, out _)) return false;
            var normalizedPrefix = commandPrefix.Trim().ToUpperInvariant();
            var normalizedTarget = target.Trim().ToUpperInvariant();
            if (!Regex.IsMatch(response, @"(?:^|\r?\n)\s*ACK\s*=\s*" + Regex.Escape(normalizedPrefix) + @"\b", RegexOptions.IgnoreCase)) return false;
            return ExtractDetectedSerials(response).Any(serial => string.Equals(serial, normalizedTarget, StringComparison.OrdinalIgnoreCase));
        }

        internal static bool ContainsForeignSerial(string response, string target)
        {
            if (string.IsNullOrWhiteSpace(response) || string.IsNullOrWhiteSpace(target)) return false;
            var normalizedTarget = target.Trim().ToUpperInvariant();
            var detected = ExtractDetectedSerials(response);
            return detected.Count > 0 && !detected.Any(serial => string.Equals(serial, normalizedTarget, StringComparison.OrdinalIgnoreCase));
        }

        internal static string FormatNumericPayload(double value)
        {
            return value.ToString("0.######", CultureInfo.InvariantCulture);
        }

        private static double? TryExtractTemperatureValue(string response, string normalizedTarget, out string unit)
        {
            unit = "C";
            foreach (var definition in new[]
            {
                new { Pattern = @"R?TEMP" + Regex.Escape(normalizedTarget) + @"\s*:\s*(-?\d+(?:[.,]\d+)?)", Unit = "C" },
                new { Pattern = @"R?FTEM" + Regex.Escape(normalizedTarget) + @"\s*:\s*(-?\d+(?:[.,]\d+)?)", Unit = "C" },
                new { Pattern = @"ACK\s*:\s*R?FTEM" + Regex.Escape(normalizedTarget) + @"\s*:\s*(-?\d+(?:[.,]\d+)?)", Unit = "C" },
                new { Pattern = @"(?:^|\r?\n)\s*Temperature\s*=\s*(-?\d+(?:[.,]\d+)?)", Unit = "C" },
                new { Pattern = @"(?:^|\r?\n)\s*Mesure\s*=\s*(-?\d+(?:[.,]\d+)?)", Unit = "C" },
                new { Pattern = @"(?:^|\r?\n)\s*Humidite\s*=\s*(-?\d+(?:[.,]\d+)?)", Unit = "%" },
                new { Pattern = @"(?:^|\r?\n)\s*Humidité\s*=\s*(-?\d+(?:[.,]\d+)?)", Unit = "%" },
                new { Pattern = @"(?:^|\r?\n)\s*Humidity\s*=\s*(-?\d+(?:[.,]\d+)?)", Unit = "%" },
            })
            {
                var matches = Regex.Matches(response, definition.Pattern, RegexOptions.IgnoreCase);
                for (var i = matches.Count - 1; i >= 0; i--)
                {
                    var candidate = matches[i].Groups[1].Value.Replace(',', '.');
                    if (double.TryParse(candidate, NumberStyles.Float | NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out var parsed))
                    {
                        unit = definition.Unit;
                        return parsed;
                    }
                }
            }
            return null;
        }

        private static DateTime? TryExtractProbeDateTime(string response)
        {
            var raw = TryExtractLineValue(response, "DateHeure");
            if (string.IsNullOrWhiteSpace(raw))
            {
                var match = Regex.Match(response, @"DateHeure\s*=\s*(\d{2}/\d{2}/\d{4}\s+\d{2}:\d{2}:\d{2})", RegexOptions.IgnoreCase);
                raw = match.Success ? match.Groups[1].Value : null;
            }
            if (string.IsNullOrWhiteSpace(raw)) return null;
            return DateTime.TryParseExact(raw.Trim(), "dd/MM/yyyy HH:mm:ss", CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed)
                ? (DateTime?)parsed
                : null;
        }

        private static int? TryExtractIntLineValue(string response, string key)
        {
            var raw = TryExtractLineValue(response, key);
            if (string.IsNullOrWhiteSpace(raw)) return null;
            return int.TryParse(raw.Trim(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed) ? (int?)parsed : null;
        }

        private static int? TryExtractRoundedIntLineValue(string response, string key)
        {
            var value = TryExtractDoubleLineValue(response, key);
            return value.HasValue ? (int?)Math.Max(0, (int)Math.Round(value.Value, MidpointRounding.AwayFromZero)) : null;
        }

        private static double? TryExtractDoubleLineValue(string response, string key)
        {
            return ParseNullableDouble(TryExtractLineValue(response, key));
        }

        private static double? ParseNullableDouble(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            return double.TryParse(
                raw.Trim().Replace(',', '.'),
                NumberStyles.Float | NumberStyles.AllowLeadingSign,
                CultureInfo.InvariantCulture,
                out var parsed)
                ? (double?)parsed
                : null;
        }

        private static int? ParseNullableInt(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            return int.TryParse(raw.Trim(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed)
                ? (int?)parsed
                : null;
        }

        private static double? TryExtractLimit(string response, string[] keys, char compactSuffix, out bool disabled)
        {
            disabled = false;
            foreach (var key in keys)
            {
                var raw = TryExtractLineValue(response, key);
                if (raw == null) continue;
                if (string.Equals(raw.Trim(), "NAN", StringComparison.OrdinalIgnoreCase))
                {
                    disabled = true;
                    return null;
                }
                var parsed = ParseNullableDouble(raw);
                if (parsed.HasValue) return parsed;
            }
            return TryExtractCompactNumeric(response, compactSuffix);
        }

        private static double? TryExtractCompactNumeric(string response, char suffix)
        {
            if (string.IsNullOrWhiteSpace(response)) return null;
            var pattern = @"(-?\d+(?:[.,]\d+)?)" + Regex.Escape(suffix.ToString());
            var matches = Regex.Matches(response, pattern, RegexOptions.IgnoreCase);
            for (var i = matches.Count - 1; i >= 0; i--)
            {
                var candidate = matches[i].Groups[1].Value.Replace(',', '.');
                if (double.TryParse(candidate, NumberStyles.Float | NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out var parsed)) return parsed;
            }
            return null;
        }

        private static int? TryExtractCompactInt(string response, char suffix)
        {
            var value = TryExtractCompactNumeric(response, suffix);
            return value.HasValue ? (int?)Math.Max(0, (int)Math.Round(value.Value, MidpointRounding.AwayFromZero)) : null;
        }

        private static string TryExtractLineValue(string response, string key)
        {
            if (string.IsNullOrWhiteSpace(response) || string.IsNullOrWhiteSpace(key)) return null;
            var match = Regex.Match(
                response,
                @"(?:^|\r?\n)\s*" + Regex.Escape(key) + @"\s*=\s*([^\r\n]+)",
                RegexOptions.IgnoreCase);
            return match.Success && match.Groups.Count >= 2 ? match.Groups[1].Value?.Trim() : null;
        }

        private static IEnumerable<string> ExtractMissingConfigurationCodes(string response)
        {
            if (string.IsNullOrWhiteSpace(response)) yield break;
            var rawCodes =
                TryExtractLineValue(response, "EEPROM")
                ?? TryExtractLineValue(response, "ConfigMissing")
                ?? TryExtractLineValue(response, "ConfigurationMissing")
                ?? TryExtractLineValue(response, "Missing")
                ?? TryExtractLineValue(response, "MissingConfig")
                ?? TryExtractLineValue(response, "ParametresManquants")
                ?? TryExtractLineValue(response, "ParamètresManquants")
                ?? TryExtractLineValue(response, "ErreurEEPROM")
                ?? TryExtractLineValue(response, "EepromError");
            if (string.IsNullOrWhiteSpace(rawCodes)) yield break;

            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var token in rawCodes
                .Split(new[] { '+', ',', ';', '|', ' ' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(part => (part ?? string.Empty).Trim().ToUpperInvariant()))
            {
                if (IsKnownMissingConfigurationCode(token) && seen.Add(token)) yield return token;
            }
        }

        private static bool IsKnownMissingConfigurationCode(string code)
        {
            switch ((code ?? string.Empty).Trim().ToUpperInvariant())
            {
                case "A":
                case "B":
                case "C":
                case "D":
                case "E":
                case "M":
                case "LH":
                case "LB":
                case "RB":
                case "RH":
                    return true;
                default:
                    return false;
            }
        }

        private static bool? TryExtractPowerState(string rawAlarmState)
        {
            if (string.IsNullOrWhiteSpace(rawAlarmState)) return null;
            var tokens = rawAlarmState
                .Split(new[] { '+', ',', ';', '|', ' ' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(token => (token ?? string.Empty).Trim().ToUpperInvariant())
                .Where(token => !string.IsNullOrWhiteSpace(token))
                .ToList();
            if (tokens.Count == 0) return null;

            // Compatibility with the historical interpretation already used by SensorGSP.
            if (tokens.Any(token => token == "S" || token == "BAT" || token == "SUR_BATTERIE" || token == "ON_BATTERY" || token == "BATTERY")) return true;
            if (tokens.Any(token => token == "NONE" || token == "NORMAL" || token == "N" || token == "OK" || token == "AUCUNE" || token == "NO")) return false;

            switch (rawAlarmState.Trim().ToUpperInvariant())
            {
                case "NONE":
                case "NORMAL":
                case "N":
                case "OK":
                case "AUCUNE":
                case "NO":
                    return false;
                default:
                    return null;
            }
        }

        private static bool ContainsAlarmToken(string rawAlarmState, string expectedToken)
        {
            if (string.IsNullOrWhiteSpace(rawAlarmState) || string.IsNullOrWhiteSpace(expectedToken)) return false;
            return rawAlarmState
                .Split(new[] { '+', ',', ';', '|', ' ' }, StringSplitOptions.RemoveEmptyEntries)
                .Any(token => string.Equals((token ?? string.Empty).Trim(), expectedToken.Trim(), StringComparison.OrdinalIgnoreCase));
        }
    }
}
