using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Globalization;
using MySql.Data.MySqlClient;

namespace Vigitemp_Serveur
{
    /// <summary>
    /// Charge uniquement les GSP qui ont une configuration de lieu à pousser
    /// (Infos_Modifiees_Depuis_Derniere_Mesure = 1) alors que leur surveillance
    /// n'est pas encore pleinement active.
    ///
    /// Ces lignes alimentent le scheduler en mode "configuration uniquement" :
    /// aucune mesure, alarme ou remontée mémoire ne doit être déclenchée pour elles.
    /// </summary>
    internal static class GspPendingConfigurationReader
    {
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
                Server = GetSetting("Vigi.Db.Host", "192.168.63.144"),
                Port = GetSettingUInt("Vigi.Db.Port", 3306),
                Database = GetSetting("Vigi.Db.MainDatabase", "vigitemp"),
                UserID = GetSetting("Vigi.Db.User", "root"),
                Password = GetSetting("Vigi.Db.Password", "pass"),
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

        private static bool IsSqlServer()
        {
            var provider = GetSetting("Vigi.Db.Provider", "mysql").Trim().ToLowerInvariant();
            return provider == "mssql" || provider == "sqlserver";
        }

        private static string NormalizePort(object raw)
        {
            var value = raw == null || raw == DBNull.Value ? string.Empty : raw.ToString().Trim();
            if (string.IsNullOrWhiteSpace(value)) return string.Empty;
            return value.StartsWith("COM", StringComparison.OrdinalIgnoreCase) ? value : "COM" + value;
        }

        private static int? ReadNullableInt(object value)
        {
            if (value == null || value == DBNull.Value) return null;
            int parsed;
            return Int32.TryParse(Convert.ToString(value, CultureInfo.InvariantCulture), NumberStyles.Integer, CultureInfo.InvariantCulture, out parsed)
                ? (int?)parsed
                : null;
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

        private static bool ReadBool(object value, bool defaultValue = false)
        {
            if (value == null || value == DBNull.Value) return defaultValue;
            var raw = Convert.ToString(value, CultureInfo.InvariantCulture);
            if (raw == "1") return true;
            if (raw == "0") return false;
            bool parsed;
            return Boolean.TryParse(raw, out parsed) ? parsed : defaultValue;
        }

        private static DateTime? ReadNullableDateTime(object value)
        {
            if (value == null || value == DBNull.Value) return null;
            if (value is DateTime) return (DateTime)value;
            DateTime parsed;
            var raw = Convert.ToString(value, CultureInfo.InvariantCulture);
            if (DateTime.TryParse(raw, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out parsed)) return parsed;
            if (DateTime.TryParse(raw, CultureInfo.CurrentCulture, DateTimeStyles.AssumeLocal, out parsed)) return parsed;
            return null;
        }

        public static List<SondeScheduleInfo> GetPendingSchedules()
        {
            try
            {
                return IsSqlServer() ? ReadSqlServerPendingSchedules() : ReadMySqlPendingSchedules();
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("[SONDE][CFG-PENDING] status=db-error action=list error=" + ex.Message);
                return new List<SondeScheduleInfo>();
            }
        }

        public static bool IsStillEligible(int idLieu, string serialNumber)
        {
            if (idLieu <= 0 || string.IsNullOrWhiteSpace(serialNumber)) return false;

            try
            {
                return IsSqlServer()
                    ? IsStillEligibleSqlServer(idLieu, serialNumber)
                    : IsStillEligibleMySql(idLieu, serialNumber);
            }
            catch (Exception ex)
            {
                // Fail closed : une erreur DB ne doit jamais provoquer une commande
                // matérielle vers une sonde dont l'état n'est pas confirmé.
                VigitempServeur.Log(
                    $"[SONDE][CFG-PENDING] status=db-error action=eligibility idLieu={idLieu} serial={serialNumber} error={ex.Message}");
                return false;
            }
        }

        private static List<SondeScheduleInfo> ReadMySqlPendingSchedules()
        {
            var result = new List<SondeScheduleInfo>();
            using (var connection = CreateMySqlConnection())
            {
                connection.Open();
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText =
                        "SELECT l.Id_Lieu, l.Frequence, l.Derniere_Date_Heure, " +
                        "l.Infos_Modifiees_Depuis_Derniere_Mesure, l.EMT_Choix_Mode, l.Est_Correction_Ej, " +
                        "m.Port_Serie, m.Module_Numero_Serie, m.Type_Module, m.Id_Worker, " +
                        "s.Sonde_Numero_Serie, s.Sonde_Type, st.Famille_Sonde, s.Adresse_Sonde, s.Sonde_Offset " +
                        "FROM t_lieu l " +
                        "INNER JOIN t_sonde s ON s.Sonde_Numero_Serie = l.Sonde_Numero_Serie " +
                        "INNER JOIN t_module m ON m.Id_Module = s.Id_Module " +
                        "LEFT JOIN t_sonde_type st ON st.Sonde_Type = s.Sonde_Type " +
                        "WHERE IFNULL(l.Infos_Modifiees_Depuis_Derniere_Mesure, 0) = 1 " +
                        "AND IFNULL(l.Est_Archive, 0) = 0 " +
                        "AND IFNULL(s.Est_Sonde_Reformee, 0) = 0 " +
                        "AND IFNULL(s.Est_Sonde_GSO, 0) = 0 " +
                        "AND IFNULL(s.Metrologie_en_cours, 0) = 0 " +
                        "AND NOT (l.Lieu_Etat = 'S' AND s.Etat_Sonde = 'S') " +
                        "AND l.Frequence IS NOT NULL AND l.Frequence > 0 " +
                        "AND m.Port_Serie IS NOT NULL AND TRIM(CAST(m.Port_Serie AS CHAR)) <> '' " +
                        "AND (UPPER(IFNULL(st.Famille_Sonde, '')) = 'GSP' " +
                        "  OR UPPER(IFNULL(s.Sonde_Type, '')) = 'GSP' " +
                        "  OR UPPER(IFNULL(s.Sonde_Type, '')) LIKE 'SP%');";

                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            AddSchedule(
                                result,
                                reader["Id_Lieu"],
                                reader["Frequence"],
                                reader["Derniere_Date_Heure"],
                                reader["Infos_Modifiees_Depuis_Derniere_Mesure"],
                                reader["EMT_Choix_Mode"],
                                reader["Est_Correction_Ej"],
                                reader["Port_Serie"],
                                reader["Module_Numero_Serie"],
                                reader["Type_Module"],
                                reader["Id_Worker"],
                                reader["Sonde_Numero_Serie"],
                                reader["Sonde_Type"],
                                reader["Famille_Sonde"],
                                reader["Adresse_Sonde"],
                                reader["Sonde_Offset"]);
                        }
                    }
                }
            }
            return result;
        }

        private static List<SondeScheduleInfo> ReadSqlServerPendingSchedules()
        {
            var result = new List<SondeScheduleInfo>();
            using (var connection = CreateSqlServerConnection())
            {
                connection.Open();
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandTimeout = GetSettingInt("Vigi.Db.CommandTimeoutSeconds", 30);
                    cmd.CommandText =
                        "SELECT l.Id_Lieu, l.Frequence, l.Derniere_Date_Heure, " +
                        "l.Infos_Modifiees_Depuis_Derniere_Mesure, l.EMT_Choix_Mode, l.Est_Correction_Ej, " +
                        "m.Port_Serie, m.Module_Numero_Serie, m.Type_Module, m.Id_Worker, " +
                        "s.Sonde_Numero_Serie, s.Sonde_Type, st.Famille_Sonde, s.Adresse_Sonde, s.Sonde_Offset " +
                        "FROM t_lieu l " +
                        "INNER JOIN t_sonde s ON s.Sonde_Numero_Serie = l.Sonde_Numero_Serie " +
                        "INNER JOIN t_module m ON m.Id_Module = s.Id_Module " +
                        "LEFT JOIN t_sonde_type st ON st.Sonde_Type = s.Sonde_Type " +
                        "WHERE ISNULL(l.Infos_Modifiees_Depuis_Derniere_Mesure, 0) = 1 " +
                        "AND ISNULL(l.Est_Archive, 0) = 0 " +
                        "AND ISNULL(s.Est_Sonde_Reformee, 0) = 0 " +
                        "AND ISNULL(s.Est_Sonde_GSO, 0) = 0 " +
                        "AND ISNULL(s.Metrologie_en_cours, 0) = 0 " +
                        "AND NOT (l.Lieu_Etat = 'S' AND s.Etat_Sonde = 'S') " +
                        "AND l.Frequence IS NOT NULL AND l.Frequence > 0 " +
                        "AND m.Port_Serie IS NOT NULL AND LTRIM(RTRIM(CONVERT(VARCHAR(50), m.Port_Serie))) <> '' " +
                        "AND (UPPER(ISNULL(st.Famille_Sonde, '')) = 'GSP' " +
                        "  OR UPPER(ISNULL(s.Sonde_Type, '')) = 'GSP' " +
                        "  OR UPPER(ISNULL(s.Sonde_Type, '')) LIKE 'SP%');";

                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            AddSchedule(
                                result,
                                reader["Id_Lieu"],
                                reader["Frequence"],
                                reader["Derniere_Date_Heure"],
                                reader["Infos_Modifiees_Depuis_Derniere_Mesure"],
                                reader["EMT_Choix_Mode"],
                                reader["Est_Correction_Ej"],
                                reader["Port_Serie"],
                                reader["Module_Numero_Serie"],
                                reader["Type_Module"],
                                reader["Id_Worker"],
                                reader["Sonde_Numero_Serie"],
                                reader["Sonde_Type"],
                                reader["Famille_Sonde"],
                                reader["Adresse_Sonde"],
                                reader["Sonde_Offset"]);
                        }
                    }
                }
            }
            return result;
        }

        private static void AddSchedule(
            ICollection<SondeScheduleInfo> result,
            object idLieu,
            object frequency,
            object lastMeasure,
            object infosModified,
            object emtMode,
            object applyCorrectionEj,
            object port,
            object moduleSerial,
            object moduleType,
            object workerId,
            object sensorSerial,
            object sensorType,
            object sensorFamily,
            object address,
            object offset)
        {
            var parsedIdLieu = ReadNullableInt(idLieu);
            var parsedFrequency = ReadNullableInt(frequency);
            var normalizedPort = NormalizePort(port);
            var serial = sensorSerial == null || sensorSerial == DBNull.Value ? string.Empty : sensorSerial.ToString().Trim();
            if (!parsedIdLieu.HasValue || !parsedFrequency.HasValue || parsedFrequency.Value <= 0 ||
                string.IsNullOrWhiteSpace(normalizedPort) || string.IsNullOrWhiteSpace(serial))
            {
                return;
            }

            result.Add(new SondeScheduleInfo
            {
                IdLieu = parsedIdLieu.Value,
                FrequenceSecondes = parsedFrequency.Value,
                DerniereDateHeure = ReadNullableDateTime(lastMeasure),
                InfosModifiees = ReadBool(infosModified, true),
                GspRecoveryPending = false,
                PortSerie = normalizedPort,
                ModuleNumeroSerie = moduleSerial == null || moduleSerial == DBNull.Value ? string.Empty : moduleSerial.ToString(),
                ModuleType = ReadNullableInt(moduleType),
                ManualWorkerId = ReadNullableInt(workerId),
                SondeNumeroSerie = serial,
                SondeType = sensorType == null || sensorType == DBNull.Value ? string.Empty : sensorType.ToString(),
                FamilleSonde = sensorFamily == null || sensorFamily == DBNull.Value ? string.Empty : sensorFamily.ToString(),
                AdresseSonde = address == null || address == DBNull.Value ? string.Empty : address.ToString(),
                SondeOffset = ReadNullableDouble(offset),
                EmtChoixMode = ReadNullableInt(emtMode) ?? 0,
                ApplyCorrectionEj = ReadBool(applyCorrectionEj, false),
                ConfigurationOnly = true,
            });
        }

        private static bool IsStillEligibleMySql(int idLieu, string serialNumber)
        {
            using (var connection = CreateMySqlConnection())
            {
                connection.Open();
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandText =
                        "SELECT COUNT(*) FROM t_lieu l " +
                        "INNER JOIN t_sonde s ON s.Sonde_Numero_Serie = l.Sonde_Numero_Serie " +
                        "INNER JOIN t_module m ON m.Id_Module = s.Id_Module " +
                        "LEFT JOIN t_sonde_type st ON st.Sonde_Type = s.Sonde_Type " +
                        "WHERE l.Id_Lieu = @idLieu AND s.Sonde_Numero_Serie = @serial " +
                        "AND IFNULL(l.Infos_Modifiees_Depuis_Derniere_Mesure, 0) = 1 " +
                        "AND IFNULL(l.Est_Archive, 0) = 0 " +
                        "AND IFNULL(s.Est_Sonde_Reformee, 0) = 0 " +
                        "AND IFNULL(s.Est_Sonde_GSO, 0) = 0 " +
                        "AND IFNULL(s.Metrologie_en_cours, 0) = 0 " +
                        "AND NOT (l.Lieu_Etat = 'S' AND s.Etat_Sonde = 'S') " +
                        "AND l.Frequence IS NOT NULL AND l.Frequence > 0 " +
                        "AND m.Port_Serie IS NOT NULL AND TRIM(CAST(m.Port_Serie AS CHAR)) <> '' " +
                        "AND (UPPER(IFNULL(st.Famille_Sonde, '')) = 'GSP' " +
                        "  OR UPPER(IFNULL(s.Sonde_Type, '')) = 'GSP' " +
                        "  OR UPPER(IFNULL(s.Sonde_Type, '')) LIKE 'SP%');";
                    cmd.Parameters.AddWithValue("@idLieu", idLieu);
                    cmd.Parameters.AddWithValue("@serial", serialNumber.Trim());
                    return Convert.ToInt32(cmd.ExecuteScalar()) > 0;
                }
            }
        }

        private static bool IsStillEligibleSqlServer(int idLieu, string serialNumber)
        {
            using (var connection = CreateSqlServerConnection())
            {
                connection.Open();
                using (var cmd = connection.CreateCommand())
                {
                    cmd.CommandTimeout = GetSettingInt("Vigi.Db.CommandTimeoutSeconds", 30);
                    cmd.CommandText =
                        "SELECT COUNT(*) FROM t_lieu l " +
                        "INNER JOIN t_sonde s ON s.Sonde_Numero_Serie = l.Sonde_Numero_Serie " +
                        "INNER JOIN t_module m ON m.Id_Module = s.Id_Module " +
                        "LEFT JOIN t_sonde_type st ON st.Sonde_Type = s.Sonde_Type " +
                        "WHERE l.Id_Lieu = @idLieu AND s.Sonde_Numero_Serie = @serial " +
                        "AND ISNULL(l.Infos_Modifiees_Depuis_Derniere_Mesure, 0) = 1 " +
                        "AND ISNULL(l.Est_Archive, 0) = 0 " +
                        "AND ISNULL(s.Est_Sonde_Reformee, 0) = 0 " +
                        "AND ISNULL(s.Est_Sonde_GSO, 0) = 0 " +
                        "AND ISNULL(s.Metrologie_en_cours, 0) = 0 " +
                        "AND NOT (l.Lieu_Etat = 'S' AND s.Etat_Sonde = 'S') " +
                        "AND l.Frequence IS NOT NULL AND l.Frequence > 0 " +
                        "AND m.Port_Serie IS NOT NULL AND LTRIM(RTRIM(CONVERT(VARCHAR(50), m.Port_Serie))) <> '' " +
                        "AND (UPPER(ISNULL(st.Famille_Sonde, '')) = 'GSP' " +
                        "  OR UPPER(ISNULL(s.Sonde_Type, '')) = 'GSP' " +
                        "  OR UPPER(ISNULL(s.Sonde_Type, '')) LIKE 'SP%');";
                    cmd.Parameters.AddWithValue("@idLieu", idLieu);
                    cmd.Parameters.AddWithValue("@serial", serialNumber.Trim());
                    return Convert.ToInt32(cmd.ExecuteScalar()) > 0;
                }
            }
        }
    }
}
