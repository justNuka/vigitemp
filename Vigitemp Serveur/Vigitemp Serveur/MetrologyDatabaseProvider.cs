using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Globalization;
using MySql.Data.MySqlClient;

namespace Vigitemp_Serveur
{
    /// <summary>
    /// Décorateur DB utilisé par le Serveur pour isoler le drapeau de
    /// synchronisation des coefficients de métrologie dans t_ajustage.
    ///
    /// La surveillance continue d'utiliser
    /// t_lieu.Infos_Modifiees_Depuis_Derniere_Mesure. Les parcours
    /// AJUSTAGE/ETALONNAGE récupèrent quant à eux le dernier t_ajustage et
    /// utilisent Coeffs_Modifies_Depuis_Derniere_Mesure, y compris pour une
    /// sonde non affectée à un lieu (cas SPCO notamment).
    /// </summary>
    internal sealed class MetrologyDatabaseProvider : IDatabaseProvider
    {
        // HotlineApiServer transporte historiquement la cible du dirty flag via
        // SondeMetrologySettings.IdLieu. Un token positif permet de conserver ce
        // contrat sans modifier le chemin Surveillance. Les Id_Lieu réels sont
        // très loin de cette plage.
        private const int AdjustmentTokenBase = 1500000000;
        private const int MaxEncodableAdjustmentId = Int32.MaxValue - AdjustmentTokenBase;

        private readonly IDatabaseProvider _inner;
        private readonly string _provider;

        public MetrologyDatabaseProvider(IDatabaseProvider inner)
        {
            _inner = inner ?? throw new ArgumentNullException(nameof(inner));
            _provider = GetSetting("Vigi.Db.Provider", "mysql").Trim().ToLowerInvariant();
        }

        public void Dispose()
        {
            _inner.Dispose();
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

        private static uint GetSettingUInt(string key, uint defaultValue)
        {
            var raw = GetSetting(key, defaultValue.ToString(CultureInfo.InvariantCulture));
            uint value;
            return UInt32.TryParse(raw, NumberStyles.Integer, CultureInfo.InvariantCulture, out value)
                ? value
                : defaultValue;
        }

        private static int GetSettingInt(string key, int defaultValue)
        {
            var raw = GetSetting(key, defaultValue.ToString(CultureInfo.InvariantCulture));
            int value;
            return Int32.TryParse(raw, NumberStyles.Integer, CultureInfo.InvariantCulture, out value)
                ? value
                : defaultValue;
        }

        private static bool GetSettingBool(string key, bool defaultValue)
        {
            var raw = GetSetting(key, null);
            bool value;
            return String.IsNullOrWhiteSpace(raw) || !Boolean.TryParse(raw, out value)
                ? defaultValue
                : value;
        }

        private static MySqlConnection CreateMySqlConnection()
        {
            var builder = new MySqlConnectionStringBuilder
            {
                Server = GetSetting("Vigi.Db.Host", "127.0.0.1"),
                Port = GetSettingUInt("Vigi.Db.Port", 3306),
                Database = GetSetting("Vigi.Db.MainDatabase", "vigitemp"),
                UserID = GetSetting("Vigi.Db.User", "root"),
                Password = GetSetting("Vigi.Db.Password", ""),
                ConnectionTimeout = GetSettingUInt("Vigi.Db.ConnectionTimeoutSeconds", 5),
                DefaultCommandTimeout = GetSettingUInt("Vigi.Db.CommandTimeoutSeconds", 30),
                Pooling = true,
            };
            return new MySqlConnection(builder.ConnectionString);
        }

        private static SqlConnection CreateSqlServerConnection()
        {
            var host = GetSetting("Vigi.Db.Host", "127.0.0.1");
            var port = GetSetting("Vigi.Db.Port", "1433");
            var dataSource = String.IsNullOrWhiteSpace(port) ? host : host + "," + port;
            var builder = new SqlConnectionStringBuilder
            {
                DataSource = dataSource,
                InitialCatalog = GetSetting("Vigi.Db.MainDatabase", "vigitemp"),
                UserID = GetSetting("Vigi.Db.User", "sa"),
                Password = GetSetting("Vigi.Db.Password", ""),
                ConnectTimeout = GetSettingInt("Vigi.Db.ConnectionTimeoutSeconds", 5),
                Encrypt = GetSettingBool("Vigi.Db.SqlServer.Encrypt", false),
                TrustServerCertificate = GetSettingBool("Vigi.Db.SqlServer.TrustServerCertificate", true),
                Pooling = true,
            };
            return new SqlConnection(builder.ConnectionString);
        }

        private static SondeMetrologySettings CreateDefaultSettings()
        {
            return new SondeMetrologySettings
            {
                CoeffX2 = 0d,
                CoeffX = 1d,
                CoeffConstant = 0d,
                Offset = null,
                HasAjustage = false,
                InfosModifiees = false,
            };
        }

        private static double? ReadNullableDouble(object value)
        {
            if (value == null || value == DBNull.Value) return null;
            var raw = Convert.ToString(value, CultureInfo.InvariantCulture);
            double parsed;
            if (Double.TryParse(raw, NumberStyles.Float, CultureInfo.InvariantCulture, out parsed)) return parsed;
            if (Double.TryParse(raw, NumberStyles.Float, CultureInfo.CurrentCulture, out parsed)) return parsed;
            return null;
        }

        private static int? ReadNullableInt(object value)
        {
            if (value == null || value == DBNull.Value) return null;
            int parsed;
            return Int32.TryParse(Convert.ToString(value, CultureInfo.InvariantCulture), NumberStyles.Integer, CultureInfo.InvariantCulture, out parsed)
                ? (int?)parsed
                : null;
        }

        private static bool ReadBool(object value, bool defaultValue = false)
        {
            if (value == null || value == DBNull.Value) return defaultValue;
            var raw = Convert.ToString(value, CultureInfo.InvariantCulture);
            if (raw == "1") return true;
            if (raw == "0") return false;
            bool parsed;
            return Boolean.TryParse(raw, out parsed) ? parsed : defaultValue;
        }

        private static DateTime? ReadNullableDate(object value)
        {
            if (value == null || value == DBNull.Value) return null;
            DateTime parsed;
            if (value is DateTime) return (DateTime)value;
            var raw = Convert.ToString(value, CultureInfo.InvariantCulture);
            if (DateTime.TryParse(raw, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out parsed)) return parsed;
            if (DateTime.TryParse(raw, CultureInfo.CurrentCulture, DateTimeStyles.AssumeLocal, out parsed)) return parsed;
            return null;
        }

        private static int EncodeAdjustmentToken(int adjustmentId)
        {
            if (adjustmentId <= 0 || adjustmentId > MaxEncodableAdjustmentId)
            {
                throw new InvalidOperationException("Id_Ajustage hors plage pour la synchronisation de métrologie.");
            }
            return AdjustmentTokenBase + adjustmentId;
        }

        private static bool TryDecodeAdjustmentToken(int value, out int adjustmentId)
        {
            adjustmentId = 0;
            if (value <= AdjustmentTokenBase) return false;
            var decoded = value - AdjustmentTokenBase;
            if (decoded <= 0 || decoded > MaxEncodableAdjustmentId) return false;
            adjustmentId = decoded;
            return true;
        }

        private static void FillSettingsFromRecord(
            SondeMetrologySettings settings,
            Func<string, object> value,
            int? adjustmentId)
        {
            var offset = ReadNullableDouble(value("Sonde_Offset"));
            if (offset.HasValue && Math.Abs(offset.Value) > 0.0000001d)
            {
                settings.Offset = offset.Value;
            }

            var coeffX2 = ReadNullableDouble(value("Coeff_X2"));
            var coeffX = ReadNullableDouble(value("Coeff_X"));
            var coeffConstant = ReadNullableDouble(value("Coeff_Constant"));
            if (coeffX.HasValue && coeffConstant.HasValue)
            {
                settings.HasAjustage = true;
                settings.CoeffX2 = coeffX2 ?? 0d;
                settings.CoeffX = coeffX.Value;
                settings.CoeffConstant = coeffConstant.Value;
            }

            var dirty = ReadBool(value("Coeffs_Modifies_Depuis_Derniere_Mesure"), false);
            var realIdLieu = ReadNullableInt(value("Id_Lieu"));
            settings.InfosModifiees = dirty;
            settings.IdLieu = dirty && adjustmentId.HasValue
                ? (int?)EncodeAdjustmentToken(adjustmentId.Value)
                : realIdLieu;
            settings.EmtChoixMode = ReadNullableInt(value("EMT_Choix_Mode"));
            settings.ApplyCorrectionEj = ReadBool(value("Est_Correction_Ej"), false);

            var errJustesse = ReadNullableDouble(value("Err_Justesse"));
            if (errJustesse.HasValue)
            {
                settings.HasEtalonnage = true;
                settings.ErrJustesse = errJustesse.Value;
                settings.CorrectionJustesse = -errJustesse.Value;
            }

            var incertitude = ReadNullableDouble(value("Incertitude"));
            if (incertitude.HasValue)
            {
                settings.HasEtalonnage = true;
                settings.Incertitude = incertitude.Value;
            }

            var dateValidite = ReadNullableDate(value("Date_Validite"));
            if (dateValidite.HasValue)
            {
                settings.HasEtalonnage = true;
                settings.DateValiditeEtalonnage = dateValidite.Value;
            }
        }

        private SondeMetrologySettings ReadMySqlMetrologySettings(string serial)
        {
            var settings = CreateDefaultSettings();
            using (var connection = CreateMySqlConnection())
            {
                connection.Open();
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText =
                        "SELECT t_lieu.Id_Lieu, t_lieu.EMT_Choix_Mode, t_lieu.Est_Correction_Ej, " +
                        "t_sonde.Sonde_Offset, ta.Id_Ajustage, " +
                        "IFNULL(ta.Coeffs_Modifies_Depuis_Derniere_Mesure, 0) AS Coeffs_Modifies_Depuis_Derniere_Mesure, " +
                        "ta.Coeff_X2, ta.Coeff_X, ta.Coeff_Constant, " +
                        "te.Err_Justesse, te.Incertitude, te.Date_Validite " +
                        "FROM t_sonde " +
                        "LEFT JOIN t_lieu ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                        "  AND IFNULL(t_lieu.Est_Archive, 0) = 0 " +
                        "LEFT JOIN t_ajustage ta ON ta.Id_Ajustage = (" +
                        "  SELECT ta2.Id_Ajustage FROM t_ajustage ta2 " +
                        "  WHERE ta2.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                        "  ORDER BY ta2.Date_Heure_Ajustage DESC, ta2.Id_Ajustage DESC LIMIT 1" +
                        ") " +
                        "LEFT JOIN t_etalonnage te ON te.Id_Etalonnage = (" +
                        "  SELECT te2.Id_Etalonnage FROM t_etalonnage te2 " +
                        "  WHERE te2.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                        "  ORDER BY te2.Date_Heure_Etalonnage DESC, te2.Id_Etalonnage DESC LIMIT 1" +
                        ") " +
                        "WHERE t_sonde.Sonde_Numero_Serie = @serial " +
                        "ORDER BY CASE " +
                        "  WHEN t_lieu.Lieu_Etat IN ('A', 'D', 'E') THEN 0 " +
                        "  WHEN t_lieu.Lieu_Etat = 'S' THEN 1 ELSE 2 END, t_lieu.Id_Lieu " +
                        "LIMIT 1";
                    cmd.Parameters.AddWithValue("@serial", serial);
                    using (var reader = cmd.ExecuteReader())
                    {
                        if (!reader.Read()) return settings;
                        var adjustmentId = ReadNullableInt(reader["Id_Ajustage"]);
                        FillSettingsFromRecord(settings, name => reader[name], adjustmentId);
                    }
                }
            }
            return settings;
        }

        private SondeMetrologySettings ReadSqlServerMetrologySettings(string serial)
        {
            var settings = CreateDefaultSettings();
            using (var connection = CreateSqlServerConnection())
            {
                connection.Open();
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandTimeout = GetSettingInt("Vigi.Db.CommandTimeoutSeconds", 30);
                    cmd.CommandText =
                        "SELECT TOP 1 t_lieu.Id_Lieu, t_lieu.EMT_Choix_Mode, t_lieu.Est_Correction_Ej, " +
                        "t_sonde.Sonde_Offset, ta.Id_Ajustage, " +
                        "ISNULL(ta.Coeffs_Modifies_Depuis_Derniere_Mesure, 0) AS Coeffs_Modifies_Depuis_Derniere_Mesure, " +
                        "ta.Coeff_X2, ta.Coeff_X, ta.Coeff_Constant, " +
                        "te.Err_Justesse, te.Incertitude, te.Date_Validite " +
                        "FROM t_sonde " +
                        "LEFT JOIN t_lieu ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                        "  AND ISNULL(t_lieu.Est_Archive, 0) = 0 " +
                        "OUTER APPLY (" +
                        "  SELECT TOP 1 ta2.Id_Ajustage, ta2.Coeffs_Modifies_Depuis_Derniere_Mesure, ta2.Coeff_X2, ta2.Coeff_X, ta2.Coeff_Constant " +
                        "  FROM t_ajustage ta2 WHERE ta2.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                        "  ORDER BY ta2.Date_Heure_Ajustage DESC, ta2.Id_Ajustage DESC" +
                        ") ta " +
                        "OUTER APPLY (" +
                        "  SELECT TOP 1 te2.Err_Justesse, te2.Incertitude, te2.Date_Validite " +
                        "  FROM t_etalonnage te2 WHERE te2.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                        "  ORDER BY te2.Date_Heure_Etalonnage DESC, te2.Id_Etalonnage DESC" +
                        ") te " +
                        "WHERE t_sonde.Sonde_Numero_Serie = @serial " +
                        "ORDER BY CASE " +
                        "  WHEN t_lieu.Lieu_Etat IN ('A', 'D', 'E') THEN 0 " +
                        "  WHEN t_lieu.Lieu_Etat = 'S' THEN 1 ELSE 2 END, t_lieu.Id_Lieu";
                    cmd.Parameters.AddWithValue("@serial", serial);
                    using (var reader = cmd.ExecuteReader())
                    {
                        if (!reader.Read()) return settings;
                        var adjustmentId = ReadNullableInt(reader["Id_Ajustage"]);
                        FillSettingsFromRecord(settings, name => reader[name], adjustmentId);
                    }
                }
            }
            return settings;
        }

        private bool SetAdjustmentDirty(int adjustmentId, bool value)
        {
            try
            {
                if (_provider == "mssql" || _provider == "sqlserver")
                {
                    using (var connection = CreateSqlServerConnection())
                    {
                        connection.Open();
                        using (var cmd = connection.CreateCommand())
                        {
                            cmd.CommandTimeout = GetSettingInt("Vigi.Db.CommandTimeoutSeconds", 30);
                            cmd.CommandText =
                                "UPDATE t_ajustage SET Coeffs_Modifies_Depuis_Derniere_Mesure = @value WHERE Id_Ajustage = @id;";
                            cmd.Parameters.AddWithValue("@value", value ? 1 : 0);
                            cmd.Parameters.AddWithValue("@id", adjustmentId);
                            return cmd.ExecuteNonQuery() > 0;
                        }
                    }
                }

                using (var connection = CreateMySqlConnection())
                {
                    connection.Open();
                    using (var cmd = connection.CreateCommand())
                    {
                        cmd.CommandText =
                            "UPDATE t_ajustage SET Coeffs_Modifies_Depuis_Derniere_Mesure = @value WHERE Id_Ajustage = @id;";
                        cmd.Parameters.AddWithValue("@value", value ? 1 : 0);
                        cmd.Parameters.AddWithValue("@id", adjustmentId);
                        return cmd.ExecuteNonQuery() > 0;
                    }
                }
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("setMetrologyAdjustmentDirty SQL error: " + ex.Message);
                return false;
            }
        }

        public SondeMetrologySettings getSondeMetrologyBySerialNumber(string p_serial_number)
        {
            try
            {
                return (_provider == "mssql" || _provider == "sqlserver")
                    ? ReadSqlServerMetrologySettings(p_serial_number)
                    : ReadMySqlMetrologySettings(p_serial_number);
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("getSondeMetrologyBySerialNumber metrology wrapper fallback: " + ex.Message);
                return _inner.getSondeMetrologyBySerialNumber(p_serial_number);
            }
        }

        public bool setLieuInfosModifiees(int idLieu, bool value)
        {
            int adjustmentId;
            return TryDecodeAdjustmentToken(idLieu, out adjustmentId)
                ? SetAdjustmentDirty(adjustmentId, value)
                : _inner.setLieuInfosModifiees(idLieu, value);
        }

        // Délégation intégrale des autres opérations DB : leur comportement
        // Surveillance reste inchangé.
        public int getIDLieuBySerialNumber(string p_sondSerialNumber) => _inner.getIDLieuBySerialNumber(p_sondSerialNumber);
        public LieuAlarmSettings getLieuAlarmSettings(int idLieu) => _inner.getLieuAlarmSettings(idLieu);
        public List<string> getPCsClients() => _inner.getPCsClients();
        public bool AddMesure(string p_numeroSerie, double p_valeur, string p_unite, string p_resistance, string p_rssi = null) => _inner.AddMesure(p_numeroSerie, p_valeur, p_unite, p_resistance, p_rssi);
        public bool AddHistoricalMesureIfMissing(string p_numeroSerie, double p_valeur, string p_unite, string p_resistance, DateTime measureDateTime) => _inner.AddHistoricalMesureIfMissing(p_numeroSerie, p_valeur, p_unite, p_resistance, measureDateTime);
        public bool AddMesureNoResponse(string p_numeroSerie, string p_unite) => _inner.AddMesureNoResponse(p_numeroSerie, p_unite);
        public bool UpdateLieuWirelessMetrics(string p_numeroSerie, int? batteryPercent, int? rssi) => _inner.UpdateLieuWirelessMetrics(p_numeroSerie, batteryPercent, rssi);
        public List<SondeScheduleInfo> getSondesActivesByServeur(int idServeur) => _inner.getSondesActivesByServeur(idServeur);
        public List<SondeScheduleInfo> getSondesActivesAllServeurs() => _inner.getSondesActivesAllServeurs();
        public bool isSondeAvailableForSurveillance(int idLieu, string sondeNumeroSerie) => _inner.isSondeAvailableForSurveillance(idLieu, sondeNumeroSerie);
        public bool isSondeInNoResponse(int idLieu, string sondeNumeroSerie) => _inner.isSondeInNoResponse(idLieu, sondeNumeroSerie);
        public (string portSerie, string sondeNumeroSerie, string sondeType, string familleSonde, string sondeAdresse, string moduleNumeroSerie, int? moduleType) getInfosByIdLieu(int p_idLieu) => _inner.getInfosByIdLieu(p_idLieu);
        public List<int> getDistinctIdServeur() => _inner.getDistinctIdServeur();
        public (List<int>, List<DateTime>) getLieuxAvecAlarmesEnSnooze() => _inner.getLieuxAvecAlarmesEnSnooze();
        public (List<int>, List<DateTime>) getLieuxAvecSurveillanceEnSnooze() => _inner.getLieuxAvecSurveillanceEnSnooze();
        public (double value, string unit, bool hasValue) getLastMeasureWithUnit(int idLieu) => _inner.getLastMeasureWithUnit(idLieu);
        public bool setAlarmeByIdLieu(int p_idLieu, bool p_valeur) => _inner.setAlarmeByIdLieu(p_idLieu, p_valeur);
        public bool setSurveillanceByIdLieu(int p_idLieu, bool p_valeur) => _inner.setSurveillanceByIdLieu(p_idLieu, p_valeur);
        public bool setThresholdAlarm(int idLieu, string sondeNumeroSerie, string type, double value, string unite, bool isActive) => _inner.setThresholdAlarm(idLieu, sondeNumeroSerie, type, value, unite, isActive);
        public bool setLieuAlarmFlags(int idLieu, bool isPreAlarm, bool isAlarm) => _inner.setLieuAlarmFlags(idLieu, isPreAlarm, isAlarm);
        public bool getLieuImmediateRetriggerFlag(int idLieu) => _inner.getLieuImmediateRetriggerFlag(idLieu);
        public bool setLieuImmediateRetriggerFlag(int idLieu, bool enabled) => _inner.setLieuImmediateRetriggerFlag(idLieu, enabled);
        public bool setLieuGspRecoveryPending(int idLieu, bool value) => _inner.setLieuGspRecoveryPending(idLieu, value);
        public bool addGspRecoverySpan(int idLieu, string serialNumber, DateTime recoverFromProbeDateTime, DateTime recoverUntilProbeDateTime) => _inner.addGspRecoverySpan(idLieu, serialNumber, recoverFromProbeDateTime, recoverUntilProbeDateTime);
        public List<GspRecoverySpan> getPendingGspRecoverySpans(int idLieu, string serialNumber) => _inner.getPendingGspRecoverySpans(idLieu, serialNumber);
        public bool setGspRecoverySpansStatus(IEnumerable<int> spanIds, string status, string lastError = null, bool incrementAttempts = false) => _inner.setGspRecoverySpansStatus(spanIds, status, lastError, incrementAttempts);
        public bool hasPendingGspRecoverySpans(int idLieu, string serialNumber) => _inner.hasPendingGspRecoverySpans(idLieu, serialNumber);
        public bool hasBlockingGspRecoveryAlarm(int idLieu) => _inner.hasBlockingGspRecoveryAlarm(idLieu);
        public int resetInProgressGspRecoverySpans() => _inner.resetInProgressGspRecoverySpans();
        public bool setNonResponseAlarm(int idLieu, string sondeNumeroSerie, bool isActive) => _inner.setNonResponseAlarm(idLieu, sondeNumeroSerie, isActive);
        public bool? getPowerAlarmActiveState(int idLieu) => _inner.getPowerAlarmActiveState(idLieu);
        public bool setPowerAlarm(int idLieu, string sondeNumeroSerie, bool isActive) => _inner.setPowerAlarm(idLieu, sondeNumeroSerie, isActive);
        public bool setModuleAlarm(int idLieu, string sondeNumeroSerie, bool isActive) => _inner.setModuleAlarm(idLieu, sondeNumeroSerie, isActive);
        public string getParameterValue(string section, string motCle) => _inner.getParameterValue(section, motCle);
        public AlarmSummary getActiveAlarmSummary(int idLieu) => _inner.getActiveAlarmSummary(idLieu);
        public bool hasActiveAcknowledgedAlarm(int idLieu, string type) => _inner.hasActiveAcknowledgedAlarm(idLieu, type);
        public int getLastAlarmIdByServeur(int idServeur) => _inner.getLastAlarmIdByServeur(idServeur);
        public List<AlarmNotificationItem> getNewAlarmsSince(int idServeur, int lastAlarmId, int maxCount) => _inner.getNewAlarmsSince(idServeur, lastAlarmId, maxCount);
        public List<AlarmNotificationItem> getUnsentOpenAlarms(int maxCount, DateTime? maxStartLocalTime = null) => _inner.getUnsentOpenAlarms(maxCount, maxStartLocalTime);
        public List<AlarmNotificationItem> getEndedAlarmsSince(int idServeur, DateTime sinceLocalTime, int maxCount) => _inner.getEndedAlarmsSince(idServeur, sinceLocalTime, maxCount);
        public bool markAlarmMailSent(int alarmId) => _inner.markAlarmMailSent(alarmId);
        public bool markAlarmEndMailSent(int alarmId) => _inner.markAlarmEndMailSent(alarmId);
        public string getLieuUnite(int idLieu) => _inner.getLieuUnite(idLieu);
        public bool writeAuditJournal(string codeJournal, string username, string userProfile, int? idLieu, string commentaire, string commentaireUtilisateur) => _inner.writeAuditJournal(codeJournal, username, userProfile, idLieu, commentaire, commentaireUtilisateur);
        public List<(int idLieu, bool isAlarm, bool isNonResponse)> getActiveLieuAlarmStates() => _inner.getActiveLieuAlarmStates();
    }
}
