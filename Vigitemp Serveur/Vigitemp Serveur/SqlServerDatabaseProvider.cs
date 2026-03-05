using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Globalization;

namespace Vigitemp_Serveur
{
    internal sealed class SqlServerDatabaseProvider : IDatabaseProvider
    {
        private static readonly object _lock = new object();
        private SqlConnection _connectionMain;
        private SqlConnection _connectionMeasure;

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
            if (int.TryParse(raw, NumberStyles.Integer, CultureInfo.InvariantCulture, out var value))
            {
                return value;
            }
            return defaultValue;
        }

        private static bool GetSettingBool(string key, bool defaultValue)
        {
            var value = GetSetting(key, null);
            if (string.IsNullOrWhiteSpace(value)) return defaultValue;
            bool result;
            return bool.TryParse(value, out result) ? result : defaultValue;
        }

        private static SqlConnection CreateConnection(string databaseName)
        {
            var host = GetSetting("Vigi.Db.Host", "127.0.0.1");
            var port = GetSetting("Vigi.Db.Port", "1433");
            var user = GetSetting("Vigi.Db.User", "sa");
            var password = GetSetting("Vigi.Db.Password", "");
            var connectionTimeout = GetSettingInt("Vigi.Db.ConnectionTimeoutSeconds", 5);

            var dataSource = host;
            if (!string.IsNullOrWhiteSpace(port))
            {
                dataSource = host + "," + port;
            }

            var builder = new SqlConnectionStringBuilder
            {
                DataSource = dataSource,
                InitialCatalog = databaseName,
                UserID = user,
                Password = password,
                ConnectTimeout = connectionTimeout,
                Encrypt = GetSettingBool("Vigi.Db.SqlServer.Encrypt", false),
                TrustServerCertificate = GetSettingBool("Vigi.Db.SqlServer.TrustServerCertificate", true),
                Pooling = true
            };

            return new SqlConnection(builder.ConnectionString);
        }

        private static int GetCommandTimeout()
        {
            return GetSettingInt("Vigi.Db.CommandTimeoutSeconds", 30);
        }

        private bool InitConnexion()
        {
            try
            {
                var mainDb = GetSetting("Vigi.Db.MainDatabase", "vigitemp");
                var mesureDb = GetSetting("Vigi.Db.MeasureDatabase", "vigitemp_mesure");

                CloseConnexion();

                _connectionMain = CreateConnection(mainDb);
                _connectionMain.Open();

                _connectionMeasure = CreateConnection(mesureDb);
                _connectionMeasure.Open();

                return true;
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("Tentative echouee: " + ex.Message);
                CloseConnexion();
                return false;
            }
        }

        private void CloseConnexion()
        {
            try { _connectionMain?.Close(); } catch { }
            try { _connectionMeasure?.Close(); } catch { }
            try { _connectionMain?.Dispose(); } catch { }
            try { _connectionMeasure?.Dispose(); } catch { }
            _connectionMain = null;
            _connectionMeasure = null;
        }

        private SqlCommand CreateCommand(SqlConnection connection, string sql)
        {
            var cmd = connection.CreateCommand();
            cmd.CommandText = sql;
            cmd.CommandTimeout = GetCommandTimeout();
            return cmd;
        }

        public int getIDLieuBySerialNumber(string p_sondSerialNumber)
        {
            lock (_lock)
            {
                var idLieu = 0;

                if (!InitConnexion())
                {
                    return idLieu;
                }

                using (var cmd = CreateCommand(_connectionMain, "SELECT Id_Lieu FROM t_lieu WHERE Sonde_Numero_Serie = @serial;"))
                {
                    cmd.Parameters.AddWithValue("@serial", p_sondSerialNumber);
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            idLieu = reader.GetInt32(reader.GetOrdinal("Id_Lieu"));
                        }
                    }
                }

                CloseConnexion();
                return idLieu;
            }
        }

        public LieuAlarmSettings getLieuAlarmSettings(int idLieu)
        {
            lock (_lock)
            {
                if (!InitConnexion())
                {
                    return new LieuAlarmSettings(
                        idLieu,
                        consigneInf: null,
                        consigneSup: null,
                        consigneInfActive: false,
                        consigneSupActive: false,
                        consigneInfPreAlarme: null,
                        consigneInfPreAlarmeActive: false,
                        consigneSupPreAlarme: null,
                        consigneSupPreAlarmeActive: false,
                        retardAlarmeBasMinutes: 0,
                        retardAlarmeHautMinutes: 0,
                        retardNonReponseMinutes: 0,
                        retardAlarmeChangementConsigneMinutes: 0,
                        nbMesuresTemporisationRedeclenchement: 0,
                        notificationActive: false,
                        dateHeureReactivationAlarme: default(DateTime),
                        planningDerniereMaj: default(DateTime));
                }

                try
                {
                    return ReadLieuAlarmSettingsV2(idLieu);
                }
                catch (SqlException)
                {
                    try
                    {
                        return ReadLieuAlarmSettingsV1(idLieu);
                    }
                    catch (SqlException ex)
                    {
                        VigitempServeur.Log("getLieuAlarmSettings MSSQL error: " + ex.Message);
                        return new LieuAlarmSettings(
                            idLieu,
                            consigneInf: null,
                            consigneSup: null,
                            consigneInfActive: false,
                            consigneSupActive: false,
                            consigneInfPreAlarme: null,
                            consigneInfPreAlarmeActive: false,
                            consigneSupPreAlarme: null,
                            consigneSupPreAlarmeActive: false,
                                retardAlarmeBasMinutes: 0,
                                retardAlarmeHautMinutes: 0,
                            retardNonReponseMinutes: 0,
                            retardAlarmeChangementConsigneMinutes: 0,
                            nbMesuresTemporisationRedeclenchement: 0,
                            notificationActive: false,
                            dateHeureReactivationAlarme: default(DateTime),
                            planningDerniereMaj: default(DateTime));
                    }
                }
                finally
                {
                    CloseConnexion();
                }
            }
        }

        private static double? GetNullableDouble(SqlDataReader reader, string column)
        {
            try
            {
                var raw = reader[column]?.ToString();
                if (string.IsNullOrWhiteSpace(raw)) return null;
                if (double.TryParse(raw, NumberStyles.Float, CultureInfo.InvariantCulture, out var value)) return value;
                if (double.TryParse(raw, NumberStyles.Float, CultureInfo.CurrentCulture, out value)) return value;
                return null;
            }
            catch
            {
                return null;
            }
        }

        private static int GetNullableInt(SqlDataReader reader, string column, int defaultValue = 0)
        {
            try
            {
                var raw = reader[column]?.ToString();
                if (string.IsNullOrWhiteSpace(raw)) return defaultValue;
                if (int.TryParse(raw, NumberStyles.Integer, CultureInfo.InvariantCulture, out var value)) return value;
                if (int.TryParse(raw, NumberStyles.Integer, CultureInfo.CurrentCulture, out value)) return value;
                return defaultValue;
            }
            catch
            {
                return defaultValue;
            }
        }

        private static bool GetNullableBool(SqlDataReader reader, string column, bool defaultValue)
        {
            try
            {
                var raw = reader[column]?.ToString();
                if (string.IsNullOrWhiteSpace(raw)) return defaultValue;
                if (raw == "1") return true;
                if (raw == "0") return false;
                if (bool.TryParse(raw, out var value)) return value;
                return defaultValue;
            }
            catch
            {
                return defaultValue;
            }
        }

        private static bool GetOptionalBool(SqlDataReader reader, string column, bool defaultValue)
        {
            try
            {
                var ordinal = reader.GetOrdinal(column);
                if (reader.IsDBNull(ordinal)) return defaultValue;

                var raw = reader.GetValue(ordinal)?.ToString();
                if (string.IsNullOrWhiteSpace(raw)) return defaultValue;

                if (raw == "1") return true;
                if (raw == "0") return false;

                if (bool.TryParse(raw, out var value)) return value;
                return defaultValue;
            }
            catch
            {
                return defaultValue;
            }
        }


        private static double? GetOptionalDouble(SqlDataReader reader, string column)
        {
            try
            {
                var ordinal = reader.GetOrdinal(column);
                if (reader.IsDBNull(ordinal)) return null;

                var raw = reader.GetValue(ordinal)?.ToString();
                if (string.IsNullOrWhiteSpace(raw)) return null;

                if (double.TryParse(raw, NumberStyles.Float, CultureInfo.InvariantCulture, out var value))
                {
                    return value;
                }

                if (double.TryParse(raw, NumberStyles.Float, CultureInfo.CurrentCulture, out value))
                {
                    return value;
                }

                return null;
            }
            catch
            {
                return null;
            }
        }
        private static DateTime GetNullableDateTime(SqlDataReader reader, string column)
        {
            try
            {
                var raw = reader[column]?.ToString();
                if (string.IsNullOrWhiteSpace(raw)) return default(DateTime);
                if (DateTime.TryParse(raw, CultureInfo.CurrentCulture, DateTimeStyles.AssumeLocal, out var value))
                    return value;
                if (DateTime.TryParse(raw, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out value))
                    return value;
                return default(DateTime);
            }
            catch
            {
                return default(DateTime);
            }
        }

        private static float GetFloatOrDefault(object value, float defaultValue = 0f)
        {
            try
            {
                if (value == null || value == DBNull.Value) return defaultValue;
                var raw = value.ToString();
                if (string.IsNullOrWhiteSpace(raw)) return defaultValue;
                if (float.TryParse(raw, NumberStyles.Float, CultureInfo.InvariantCulture, out var parsed))
                {
                    return parsed;
                }
                if (float.TryParse(raw, NumberStyles.Float, CultureInfo.CurrentCulture, out parsed))
                {
                    return parsed;
                }
                return defaultValue;
            }
            catch
            {
                return defaultValue;
            }
        }
        private LieuAlarmSettings ReadLieuAlarmSettingsV2(int idLieu)
        {
            var cmd = CreateCommand(
                _connectionMain,
                "SELECT " +
                "Id_Lieu, " +
                "Tolerance_Surveillance_Inf as Consigne_Inf, Est_Consigne_Inf_Active, Retard_Alarme_Bas, Consigne_Inf_Pre_Alarme, Est_Consigne_Inf_Pre_Alarme_Active, " +
                "Tolerance_Surveillance_Sup as Consigne_Sup, Est_Consigne_Sup_Active, Retard_Alarme_Haut, Consigne_Sup_Pre_Alarme, Est_Consigne_Sup_Pre_Alarme_Active, " +
                "Retard_Non_Reponse, Retard_Alarme_Changement_Consigne, Nb_Mesures_Temporisation_Redeclenchement, Planning_Derniere_Maj " +
                "FROM t_lieu WHERE Id_Lieu = @idLieu;");
            cmd.Parameters.AddWithValue("@idLieu", idLieu);

            using (cmd)
            using (var reader = cmd.ExecuteReader())
            {
                if (!reader.Read())
                {
                    return new LieuAlarmSettings(
                        idLieu,
                        consigneInf: null,
                        consigneSup: null,
                        consigneInfActive: false,
                        consigneSupActive: false,
                        consigneInfPreAlarme: null,
                        consigneInfPreAlarmeActive: false,
                        consigneSupPreAlarme: null,
                        consigneSupPreAlarmeActive: false,
                            retardAlarmeBasMinutes: 0,
                            retardAlarmeHautMinutes: 0,
                        retardNonReponseMinutes: 0,
                        retardAlarmeChangementConsigneMinutes: 0,
                        nbMesuresTemporisationRedeclenchement: 0,
                        notificationActive: false,
                        dateHeureReactivationAlarme: default(DateTime),
                        planningDerniereMaj: default(DateTime));
                }

                return new LieuAlarmSettings(
                    idLieu,
                    consigneInf: GetNullableDouble(reader, "Consigne_Inf"),
                    consigneSup: GetNullableDouble(reader, "Consigne_Sup"),
                    consigneInfActive: GetNullableBool(reader, "Est_Consigne_Inf_Active", true),
                    consigneSupActive: GetNullableBool(reader, "Est_Consigne_Sup_Active", true),
                    consigneInfPreAlarme: GetNullableDouble(reader, "Consigne_Inf_Pre_Alarme"),
                    consigneInfPreAlarmeActive: GetNullableBool(reader, "Est_Consigne_Inf_Pre_Alarme_Active", false),
                    consigneSupPreAlarme: GetNullableDouble(reader, "Consigne_Sup_Pre_Alarme"),
                    consigneSupPreAlarmeActive: GetNullableBool(reader, "Est_Consigne_Sup_Pre_Alarme_Active", false),
                    retardAlarmeBasMinutes: GetNullableInt(reader, "Retard_Alarme_Bas", 0),
                    retardAlarmeHautMinutes: GetNullableInt(reader, "Retard_Alarme_Haut", 0),
                    retardNonReponseMinutes: Math.Max(0, GetNullableInt(reader, "Retard_Non_Reponse", 0)),
                    retardAlarmeChangementConsigneMinutes: Math.Max(0, GetNullableInt(reader, "Retard_Alarme_Changement_Consigne", 0)),
                    nbMesuresTemporisationRedeclenchement: Math.Max(0, GetNullableInt(reader, "Nb_Mesures_Temporisation_Redeclenchement", 0)),
                    notificationActive: true,
                    dateHeureReactivationAlarme: default(DateTime),
                    planningDerniereMaj: GetNullableDateTime(reader, "Planning_Derniere_Maj"));
            }
        }

        private LieuAlarmSettings ReadLieuAlarmSettingsV1(int idLieu)
        {
            var cmd = CreateCommand(
                _connectionMain,
                "SELECT " +
                "IdLieu, " +
                "Consigne_Inf, Consigne_Sup, Notification_Active, Date_Heure_Reactivation_Alarme, " +
                "Retard_Alarme_Bas, Retard_Alarme_Haut, Retard_Non_Reponse, " +
                "Est_Consigne_Inf_Active, Est_Consigne_Sup_Active, " +
                "Consigne_Inf_Pre_Alarme, Est_Consigne_Inf_Pre_Alarme_Active, " +
                "Consigne_Sup_Pre_Alarme, Est_Consigne_Sup_Pre_Alarme_Active " +
                "FROM t_lieu WHERE IdLieu = @idLieu;");
            cmd.Parameters.AddWithValue("@idLieu", idLieu);

            using (cmd)
            using (var reader = cmd.ExecuteReader())
            {
                if (!reader.Read())
                {
                    return new LieuAlarmSettings(
                        idLieu,
                        consigneInf: null,
                        consigneSup: null,
                        consigneInfActive: false,
                        consigneSupActive: false,
                        consigneInfPreAlarme: null,
                        consigneInfPreAlarmeActive: false,
                        consigneSupPreAlarme: null,
                        consigneSupPreAlarmeActive: false,
                            retardAlarmeBasMinutes: 0,
                            retardAlarmeHautMinutes: 0,
                        retardNonReponseMinutes: 0,
                        retardAlarmeChangementConsigneMinutes: 0,
                        nbMesuresTemporisationRedeclenchement: 0,
                        notificationActive: false,
                        dateHeureReactivationAlarme: default(DateTime),
                        planningDerniereMaj: default(DateTime));
                }

                var notificationActive = GetNullableBool(reader, "Notification_Active", false);
                var reactivationAt = GetNullableDateTime(reader, "Date_Heure_Reactivation_Alarme");

                return new LieuAlarmSettings(
                    idLieu,
                    consigneInf: GetNullableDouble(reader, "Consigne_Inf"),
                    consigneSup: GetNullableDouble(reader, "Consigne_Sup"),
                    consigneInfActive: GetNullableBool(reader, "Est_Consigne_Inf_Active", true),
                    consigneSupActive: GetNullableBool(reader, "Est_Consigne_Sup_Active", true),
                    consigneInfPreAlarme: GetNullableDouble(reader, "Consigne_Inf_Pre_Alarme"),
                    consigneInfPreAlarmeActive: GetNullableBool(reader, "Est_Consigne_Inf_Pre_Alarme_Active", false),
                    consigneSupPreAlarme: GetNullableDouble(reader, "Consigne_Sup_Pre_Alarme"),
                    consigneSupPreAlarmeActive: GetNullableBool(reader, "Est_Consigne_Sup_Pre_Alarme_Active", false),
                    retardAlarmeBasMinutes: GetNullableInt(reader, "Retard_Alarme_Bas", 0),
                    retardAlarmeHautMinutes: GetNullableInt(reader, "Retard_Alarme_Haut", 0),
                    retardNonReponseMinutes: Math.Max(0, GetNullableInt(reader, "Retard_Non_Reponse", 0)),
                    retardAlarmeChangementConsigneMinutes: 0,
                    nbMesuresTemporisationRedeclenchement: 0,
                    notificationActive: notificationActive,
                    dateHeureReactivationAlarme: reactivationAt,
                    planningDerniereMaj: default(DateTime));
            }
        }

        public List<string> getPCsClients()
        {
            lock (_lock)
            {
                var arrayIp = new List<string>();
                try
                {
                    if (!InitConnexion())
                    {
                        return arrayIp;
                    }

                    using (var cmd = CreateCommand(_connectionMain, "select Adresse_IP_Connexion from t_postes_clients"))
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            arrayIp.Add(reader["Adresse_IP_Connexion"].ToString());
                        }
                    }

                    CloseConnexion();
                    return arrayIp;
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("erreur getPCsClients: " + ex);
                    return arrayIp;
                }
            }
        }
        public bool AddMesure(string p_numeroSerie, double p_valeur, string p_unite, string p_resistance)
        {
            lock (_lock)
            {
                try
                {
                    if (!InitConnexion())
                    {
                        return false;
                    }

                    int idSonde;
                    int idLieu;
                    float consigne;
                    float consigneSup;
                    float consigneInf;
                    int frequence;
                    object idServeur;

                    using (var cmdMain = CreateCommand(
                        _connectionMain,
                        "SELECT Frequence, Consigne, " +
                        "Tolerance_Surveillance_Sup as Consigne_Sup, " +
                        "Tolerance_Surveillance_Inf as Consigne_Inf, " +
                        "t_module.Id_Serveur, Nom_Lieu, Id_Lieu, t_lieu.Sonde_Numero_Serie, t_sonde.Id_Sonde FROM t_lieu " +
                            "INNER JOIN t_sonde ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                            "INNER JOIN t_module ON t_sonde.Id_Module = t_module.Id_Module " +
                            "WHERE t_lieu.Sonde_Numero_Serie = @serial " +
                        "AND t_sonde.Etat_Sonde = 'S' " +
                        "AND ISNULL(t_sonde.Est_Sonde_GSO, 0) = 0;"))
                    {
                        cmdMain.Parameters.AddWithValue("@serial", p_numeroSerie);
                        using (var reader = cmdMain.ExecuteReader())
                        {
                            if (!reader.Read())
                            {
                                CloseConnexion();
                                VigitempServeur.Log("(AddMesure) Aucune ligne t_lieu pour la sonde: " + p_numeroSerie);
                                return false;
                            }

                            idSonde = (int)reader["Id_Sonde"];
                            idLieu = (int)reader["Id_Lieu"];
                            consigne = GetFloatOrDefault(reader["Consigne"]);
                            consigneSup = GetFloatOrDefault(reader["Consigne_Sup"]);
                            consigneInf = GetFloatOrDefault(reader["Consigne_Inf"]);
                            frequence = (int)reader["Frequence"];
                            idServeur = reader["Id_Serveur"];
                        }
                    }

                    using (var cmdMeasure = CreateCommand(
                        _connectionMeasure,
                        "INSERT INTO tm_mesures " +
                        "(Id_Serveur_BDD, Date_Heure_Mesure, Valeur, Valeur_Brute, Consigne, Consigne_Sup, Consigne_Inf, Unite, Frequence, Sonde_Numero_Serie, Id_Lieu) " +
                        "VALUES " +
                        "(@idserveurbdd, @dateheuremesure, @valeur, @resistance, @consigne, @consignesup, @consigneinf, @unite, @frequence, @sondenumeroserie, @idlieu)"))
                    {
                        cmdMeasure.Parameters.AddWithValue("@idserveurbdd", idServeur);
                        cmdMeasure.Parameters.AddWithValue("@dateheuremesure", DateTime.Now);
                        cmdMeasure.Parameters.AddWithValue("@valeur", p_valeur);
                        cmdMeasure.Parameters.AddWithValue("@resistance", (object)p_resistance ?? DBNull.Value);
                        cmdMeasure.Parameters.AddWithValue("@unite", p_unite);
                        cmdMeasure.Parameters.AddWithValue("@consigne", consigne);
                        cmdMeasure.Parameters.AddWithValue("@consignesup", consigneSup);
                        cmdMeasure.Parameters.AddWithValue("@consigneinf", consigneInf);
                        cmdMeasure.Parameters.AddWithValue("@frequence", frequence);
                        cmdMeasure.Parameters.AddWithValue("@sondenumeroserie", p_numeroSerie);
                        cmdMeasure.Parameters.AddWithValue("@idlieu", idLieu);
                        cmdMeasure.ExecuteNonQuery();
                    }

                    var resistance = 0d;
                    if (!string.IsNullOrWhiteSpace(p_resistance))
                    {
                        double.TryParse(p_resistance, NumberStyles.Any, CultureInfo.InvariantCulture, out resistance);
                    }

                    InsertMeasureToGraphique(
                        idSonde,
                        idLieu,
                        p_numeroSerie,
                        p_valeur,
                        p_unite,
                        resistance,
                        consigne,
                        consigneSup,
                        consigneInf,
                        frequence,
                        0);

                    CloseConnexion();
                    VigitempServeur.nombres_reponses++;
                    return true;
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(AddMesure MSSQL) SQL Erreur: " + ex);
                    return false;
                }
            }
        }

        public bool AddMesureNoResponse(string p_numeroSerie, string p_unite)
        {
            lock (_lock)
            {
                try
                {
                    if (!InitConnexion())
                    {
                        return false;
                    }

                    int idSonde;
                    int idLieu;
                    float consigne;
                    float consigneSup;
                    float consigneInf;
                    int frequence;
                    object idServeur;

                    using (var cmdMain = CreateCommand(
                        _connectionMain,
                        "SELECT Frequence, Consigne, " +
                        "Tolerance_Surveillance_Sup as Consigne_Sup, " +
                        "Tolerance_Surveillance_Inf as Consigne_Inf, " +
                        "t_module.Id_Serveur, Id_Lieu, t_sonde.Id_Sonde FROM t_lieu " +
                            "INNER JOIN t_sonde ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                            "INNER JOIN t_module ON t_sonde.Id_Module = t_module.Id_Module " +
                            "WHERE t_lieu.Sonde_Numero_Serie = @serial " +
                        "AND t_sonde.Etat_Sonde = 'S' " +
                        "AND ISNULL(t_sonde.Est_Sonde_GSO, 0) = 0;"))
                    {
                        cmdMain.Parameters.AddWithValue("@serial", p_numeroSerie);
                        using (var reader = cmdMain.ExecuteReader())
                        {
                            if (!reader.Read())
                            {
                                CloseConnexion();
                                VigitempServeur.Log("(AddMesureNoResponse MSSQL) Aucune ligne t_lieu pour la sonde: " + p_numeroSerie);
                                return false;
                            }

                            idSonde = (int)reader["Id_Sonde"];
                            idLieu = (int)reader["Id_Lieu"];
                            consigne = GetFloatOrDefault(reader["Consigne"]);
                            consigneSup = GetFloatOrDefault(reader["Consigne_Sup"]);
                            consigneInf = GetFloatOrDefault(reader["Consigne_Inf"]);
                            frequence = (int)reader["Frequence"];
                            idServeur = reader["Id_Serveur"];
                        }
                    }

                    var unit = string.IsNullOrWhiteSpace(p_unite) ? getLieuUnite(idLieu) : p_unite;

                    using (var cmdMeasure = CreateCommand(
                        _connectionMeasure,
                        "INSERT INTO tm_mesures " +
                        "(Id_Serveur_BDD, Date_Heure_Mesure, Valeur, Valeur_Brute, Consigne, Consigne_Sup, Consigne_Inf, Unite, Frequence, Sonde_Numero_Serie, Id_Lieu, Est_Valeur_Null) " +
                        "VALUES " +
                        "(@idserveurbdd, @dateheuremesure, @valeur, @resistance, @consigne, @consignesup, @consigneinf, @unite, @frequence, @sondenumeroserie, @idlieu, 1)"))
                    {
                        cmdMeasure.Parameters.AddWithValue("@idserveurbdd", idServeur);
                        cmdMeasure.Parameters.AddWithValue("@dateheuremesure", DateTime.Now);
                        cmdMeasure.Parameters.AddWithValue("@valeur", DBNull.Value);
                        cmdMeasure.Parameters.AddWithValue("@resistance", DBNull.Value);
                        cmdMeasure.Parameters.AddWithValue("@unite", unit);
                        cmdMeasure.Parameters.AddWithValue("@consigne", consigne);
                        cmdMeasure.Parameters.AddWithValue("@consignesup", consigneSup);
                        cmdMeasure.Parameters.AddWithValue("@consigneinf", consigneInf);
                        cmdMeasure.Parameters.AddWithValue("@frequence", frequence);
                        cmdMeasure.Parameters.AddWithValue("@sondenumeroserie", p_numeroSerie);
                        cmdMeasure.Parameters.AddWithValue("@idlieu", idLieu);
                        cmdMeasure.ExecuteNonQuery();
                    }

                    InsertMeasureToGraphique(
                        idSonde,
                        idLieu,
                        p_numeroSerie,
                        null,
                        unit,
                        null,
                        consigne,
                        consigneSup,
                        consigneInf,
                        frequence,
                        0,
                        1);

                    CloseConnexion();
                    VigitempServeur.Log($"(AddMesureNoResponse MSSQL) Mesure null inseree pour non-reponse sonde={p_numeroSerie} lieu={idLieu}");
                    return true;
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(AddMesureNoResponse MSSQL) SQL Erreur: " + ex);
                    return false;
                }
            }
        }


        private void InsertMeasureToGraphique(
            int idSonde,
            int idLieu,
            string sondeNumeroSerie,
            double? valeur,
            string unite,
            double? resistance,
            float consigne,
            float consigneSup,
            float consigneInf,
            int frequence,
            int etatAlarme,
            int estValeurNull = 0)
        {
            try
            {
                var cacheDb = GetSetting("Vigi.Db.MeasureDatabase", "vigitemp_mesure");
                using (var connection = CreateConnection(cacheDb))
                {
                    connection.Open();
                    using (var cmd = CreateCommand(
                        connection,
                        "INSERT INTO tm_graphique " +
                        "(Date_Heure_Mesure, Valeur, Valeur_Brute, Consigne, Consigne_Sup, Consigne_Inf, " +
                        "Unite, Sonde_Numero_Serie, Id_Sonde, Id_Lieu, Frequence, Est_Etat_Alarme, Est_Valeur_Null) " +
                        "VALUES " +
                        "(@date, @valeur, @valeurBrute, @consigne, @consigneSup, @consigneInf, " +
                        "@unite, @sondeNumeroSerie, @idSonde, @idLieu, @frequence, @etatAlarme, @estValeurNull)"))
                    {
                        cmd.Parameters.AddWithValue("@date", DateTime.Now);
                        cmd.Parameters.AddWithValue("@valeur", valeur.HasValue ? (object)valeur.Value : DBNull.Value);
                        cmd.Parameters.AddWithValue("@valeurBrute", resistance.HasValue ? (object)resistance.Value : DBNull.Value);
                        cmd.Parameters.AddWithValue("@consigne", consigne);
                        cmd.Parameters.AddWithValue("@consigneSup", consigneSup);
                        cmd.Parameters.AddWithValue("@consigneInf", consigneInf);
                        cmd.Parameters.AddWithValue("@unite", unite);
                        cmd.Parameters.AddWithValue("@sondeNumeroSerie", sondeNumeroSerie);
                        cmd.Parameters.AddWithValue("@idSonde", idSonde);
                        cmd.Parameters.AddWithValue("@idLieu", idLieu);
                        cmd.Parameters.AddWithValue("@frequence", frequence);
                        cmd.Parameters.AddWithValue("@etatAlarme", etatAlarme);
                        cmd.Parameters.AddWithValue("@estValeurNull", estValeurNull);
                        cmd.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("(InsertMeasureToGraphique MSSQL) Erreur: " + ex.Message);
            }
        }
        public (List<string>, List<string>, List<string>, List<string>, List<int>, List<DateTime?>) getInfosByIdServeurAndFrequencies(int p_idServer, int p_frequence)
        {
            lock (_lock)
            {
                try
                {
                    var tmpPort = new List<string>();
                    var tmpSerial = new List<string>();
                    var tmpAdresse = new List<string>();
                    var tmpModule = new List<string>();
                    var tmpIdLieu = new List<int>();
                    var tmpLastMeasure = new List<DateTime?>();

                    if (!InitConnexion())
                    {
                        CloseConnexion();
                        return (tmpPort, tmpSerial, tmpAdresse, tmpModule, tmpIdLieu, tmpLastMeasure);
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT t_lieu.Id_Lieu, t_lieu.Derniere_Date_Heure, t_module.Port_Serie, t_module.Module_Numero_Serie, t_sonde.Sonde_Numero_Serie, t_sonde.Adresse_Sonde FROM t_lieu " +
                        "INNER JOIN t_sonde ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                        "INNER JOIN t_module ON t_sonde.Id_Module = t_module.Id_Module " +
                        "WHERE t_lieu.Frequence = @frequence " +
                        "AND t_module.Id_Serveur = @idServeur " +
                        "AND t_lieu.Lieu_Etat = 'S' " +
                        "AND t_sonde.Etat_Sonde = 'S' " +
                        "AND ISNULL(t_sonde.Est_Sonde_GSO, 0) = 0;"))
                    {
                        cmd.Parameters.AddWithValue("@frequence", p_frequence);
                        cmd.Parameters.AddWithValue("@idServeur", p_idServer);
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                tmpPort.Add("COM" + reader["Port_Serie"].ToString());
                                tmpSerial.Add(reader["Sonde_Numero_Serie"].ToString());
                                tmpAdresse.Add(reader["Adresse_Sonde"].ToString());
                                tmpModule.Add(reader["Module_Numero_Serie"].ToString());
                                tmpIdLieu.Add(Convert.ToInt32(reader["Id_Lieu"]));
                                if (reader["Derniere_Date_Heure"] == DBNull.Value)
                                {
                                    tmpLastMeasure.Add(null);
                                }
                                else
                                {
                                    tmpLastMeasure.Add(Convert.ToDateTime(reader["Derniere_Date_Heure"]));
                                }
                            }
                        }
                    }

                    CloseConnexion();
                    return (tmpPort, tmpSerial, tmpAdresse, tmpModule, tmpIdLieu, tmpLastMeasure);
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(getInfosByIdServeurAndFrequencies MSSQL) SQL Erreur: " + ex);
                    return (new List<string>(), new List<string>(), new List<string>(), new List<string>(), new List<int>(), new List<DateTime?>());
                }
            }
        }

        public List<SondeScheduleInfo> getSondesActivesByServeur(int idServeur)
        {
            lock (_lock)
            {
                var list = new List<SondeScheduleInfo>();

                try
                {
                    if (!InitConnexion())
                    {
                        return list;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT t_lieu.Id_Lieu, t_lieu.Frequence, t_lieu.Derniere_Date_Heure, " +
                        "t_lieu.Infos_Modifiees_Depuis_Derniere_Mesure, t_lieu.EMT_Choix_Mode, t_lieu.Est_Correction_Ej, " +
                        "t_module.Port_Serie, t_module.Module_Numero_Serie, " +
                        "t_sonde.Sonde_Numero_Serie, t_sonde.Adresse_Sonde, t_sonde.Sonde_Offset, " +
                        "ta.Coeff_X, ta.Coeff_Constant, te.Err_Justesse, te.Incertitude, te.Date_Validite" +
                        "FROM t_lieu " +
                        "INNER JOIN t_sonde ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                        "INNER JOIN t_module ON t_sonde.Id_Module = t_module.Id_Module " +
                        "OUTER APPLY (" +
                        "  SELECT TOP 1 Coeff_X, Coeff_Constant FROM t_ajustage " +
                        "  WHERE Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                        "  ORDER BY Date_Heure_Ajustage DESC, Id_Ajustage DESC" +
                        ") ta " +
                        "OUTER APPLY (" +
                        "  SELECT TOP 1 Err_Justesse, Incertitude, Date_Validite FROM t_etalonnage " +
                        "  WHERE Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                        "  ORDER BY Date_Heure_Etalonnage DESC, Id_Etalonnage DESC" +
                        ") te " +
                        "WHERE t_module.Id_Serveur = @idServeur " +
                        "AND t_lieu.Lieu_Etat = 'S' " +
                        "AND t_sonde.Etat_Sonde = 'S' " +
                        "AND ISNULL(t_sonde.Est_Sonde_GSO, 0) = 0;"))
                    {
                        cmd.Parameters.AddWithValue("@idServeur", idServeur);
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var freqObj = reader["Frequence"];
                                if (freqObj == null || freqObj == DBNull.Value) continue;

                                var freqRaw = freqObj.ToString();
                                if (string.IsNullOrWhiteSpace(freqRaw)) continue;

                                if (!int.TryParse(freqRaw, out var frequency))
                                {
                                    VigitempServeur.Log("Frequence invalide (t_lieu): " + freqRaw);
                                    continue;
                                }

                                DateTime? lastMeasure = null;
                                if (reader["Derniere_Date_Heure"] != DBNull.Value)
                                {
                                    lastMeasure = Convert.ToDateTime(reader["Derniere_Date_Heure"]);
                                }

                                list.Add(new SondeScheduleInfo
                                {
                                    IdLieu = Convert.ToInt32(reader["Id_Lieu"]),
                                    FrequenceSecondes = frequency,
                                    DerniereDateHeure = lastMeasure,
                                    InfosModifiees = GetOptionalBool(reader, "Infos_Modifiees_Depuis_Derniere_Mesure", false),
                                    PortSerie = "COM" + reader["Port_Serie"].ToString(),
                                    ModuleNumeroSerie = reader["Module_Numero_Serie"].ToString(),
                                    SondeNumeroSerie = reader["Sonde_Numero_Serie"].ToString(),
                                    AdresseSonde = reader["Adresse_Sonde"].ToString(),
                                    SondeOffset = GetOptionalDouble(reader, "Sonde_Offset"),
                                    HasAjustage = GetOptionalDouble(reader, "Coeff_X").HasValue && GetOptionalDouble(reader, "Coeff_Constant").HasValue,
                                    CoeffX = GetOptionalDouble(reader, "Coeff_X") ?? 1d,
                                    CoeffConstant = GetOptionalDouble(reader, "Coeff_Constant") ?? 0d,
                                    HasEtalonnage = GetOptionalDouble(reader, "Err_Justesse").HasValue || GetOptionalDouble(reader, "Incertitude").HasValue || GetNullableDateTime(reader, "Date_Validite") != default(DateTime),
                                    EmtChoixMode = GetNullableInt(reader, "EMT_Choix_Mode", 0),
                                    ApplyCorrectionEj = GetOptionalBool(reader, "Est_Correction_Ej", false),
                                    ErrJustesse = GetOptionalDouble(reader, "Err_Justesse"),
                                    CorrectionJustesse = GetOptionalDouble(reader, "Err_Justesse").HasValue ? -GetOptionalDouble(reader, "Err_Justesse").Value : (double?)null,
                                    Incertitude = GetOptionalDouble(reader, "Incertitude"),
                                    DateValiditeEtalonnage = GetNullableDateTime(reader, "Date_Validite") != default(DateTime) ? (DateTime?)GetNullableDateTime(reader, "Date_Validite") : null
                                });
                            }
                        }
                    }

                    CloseConnexion();
                    return list;
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(getSondesActivesByServeur MSSQL) SQL Erreur: " + ex);
                    return list;
                }
            }
        }

        public (string, string, string, string) getInfosByIdLieu(int p_idLieu)
        {
            lock (_lock)
            {
                try
                {
                    string portSerie = "";
                    string sondeNumeroSerie = "";
                    string sondeAdresse = "";
                    string moduleNumeroSerie = "";

                    if (!InitConnexion())
                    {
                        CloseConnexion();
                        return (portSerie, sondeNumeroSerie, sondeAdresse, moduleNumeroSerie);
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT t_module.Port_Serie, t_module.Module_Numero_Serie, t_sonde.Sonde_Numero_Serie, t_sonde.Adresse_Sonde FROM t_lieu " +
                        "INNER JOIN t_sonde ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                        "INNER JOIN t_module ON t_sonde.Id_Module = t_module.Id_Module " +
                        "WHERE t_lieu.Id_Lieu = @idLieu;"))
                    {
                        cmd.Parameters.AddWithValue("@idLieu", p_idLieu);
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                portSerie = "COM" + reader["Port_Serie"].ToString();
                                sondeNumeroSerie = reader["Sonde_Numero_Serie"].ToString();
                                sondeAdresse = reader["Adresse_Sonde"].ToString();
                                moduleNumeroSerie = reader["Module_Numero_Serie"].ToString();
                            }
                        }
                    }

                    CloseConnexion();
                    return (portSerie, sondeNumeroSerie, sondeAdresse, moduleNumeroSerie);
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(getInfosByIdLieu MSSQL) SQL Erreur: " + ex);
                    return ("", "", "", "");
                }
            }
        }

        public List<int> getDistinctIdServeur()
        {
            lock (_lock)
            {
                var arrayTmp = new List<int>();

                if (!InitConnexion())
                {
                    return arrayTmp;
                }

                using (var cmd = CreateCommand(_connectionMain, "SELECT distinct Id_Serveur FROM t_sonde where Etat_Sonde = 'S' AND ISNULL(Est_Sonde_GSO, 0) = 0;"))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        arrayTmp.Add(Convert.ToInt32(reader["Id_Serveur"]));
                    }
                }

                CloseConnexion();
                return arrayTmp;
            }
        }

        public List<int> getDistinctFrequenciesByIdServeur(int p_idServeur)
        {
            lock (_lock)
            {
                var arrayTmp = new List<int>();

                if (!InitConnexion())
                {
                    return arrayTmp;
                }

                using (var cmd = CreateCommand(
                    _connectionMain,
                    "SELECT distinct frequence FROM t_lieu " +
                    "INNER JOIN t_sonde ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                    "INNER JOIN t_module ON t_sonde.Id_Module = t_module.Id_Module " +
                    "where t_module.Id_Serveur = @idServeur " +
                    "AND t_lieu.Lieu_Etat = 'S' " +
                    "AND t_sonde.Etat_Sonde = 'S' " +
                    "AND ISNULL(t_sonde.Est_Sonde_GSO, 0) = 0;"))
                {
                    cmd.Parameters.AddWithValue("@idServeur", p_idServeur);
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            arrayTmp.Add(Int32.Parse(reader["frequence"].ToString()));
                        }
                    }
                }

                CloseConnexion();
                return arrayTmp;
            }
        }

        public (List<int>, List<DateTime>) getLieuxAvecAlarmesEnSnooze()
        {
            lock (_lock)
            {
                var ids = new List<int>();
                var dates = new List<DateTime>();

                if (!InitConnexion())
                {
                    return (ids, dates);
                }

                using (var cmd = CreateCommand(_connectionMain, "SELECT distinct Id_Lieu, Date_Heure_Reactivation_Alarme FROM t_lieu where Date_Heure_Reactivation_Alarme is not null;"))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        ids.Add(Int32.Parse(reader["Id_Lieu"].ToString()));
                        dates.Add(DateTime.Parse(reader["Date_Heure_Reactivation_Alarme"].ToString()));
                    }
                }

                CloseConnexion();
                return (ids, dates);
            }
        }

        public (List<int>, List<DateTime>) getLieuxAvecSurveillanceEnSnooze()
        {
            lock (_lock)
            {
                var ids = new List<int>();
                var dates = new List<DateTime>();

                if (!InitConnexion())
                {
                    return (ids, dates);
                }

                using (var cmd = CreateCommand(
                    _connectionMain,
                    "SELECT distinct Id_Lieu, Date_Heure_Reactivation_Surveillance FROM t_lieu " +
                    "where Date_Heure_Reactivation_Surveillance is not null AND Lieu_Etat = 'D';"))
                {
                    try
                    {
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                ids.Add(Convert.ToInt32(reader["Id_Lieu"]));
                                dates.Add(DateTime.Parse(reader["Date_Heure_Reactivation_Surveillance"].ToString()));
                            }
                        }
                    }
                    catch (Exception e)
                    {
                        VigitempServeur.Log("SQL Error getLieuxAvecSurveillanceEnSnooze MSSQL: " + e);
                    }
                }

                CloseConnexion();
                return (ids, dates);
            }
        }

        public string getLieuUnite(int idLieu)
        {
            lock (_lock)
            {
                try
                {
                    if (!InitConnexion())
                    {
                        return "";
                    }

                    using (var cmd = CreateCommand(_connectionMain, "SELECT Derniere_Unite FROM t_lieu WHERE Id_Lieu = @idLieu;"))
                    {
                        cmd.Parameters.AddWithValue("@idLieu", idLieu);
                        var result = cmd.ExecuteScalar();
                        CloseConnexion();
                        return result == null || result == DBNull.Value ? "" : result.ToString();
                    }
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(getLieuUnite MSSQL) SQL Erreur: " + ex.Message);
                    return "";
                }
            }
        }

        public double getLastMeasure(int p_IdLieu)
        {
            lock (_lock)
            {
                double value = 0.0;

                if (!InitConnexion())
                {
                    return value;
                }

                using (var cmd = CreateCommand(
                    _connectionMeasure,
                    "SELECT TOP 1 * FROM tm_mesures WHERE Id_Lieu = @idLieu ORDER BY Date_Heure_Mesure DESC"))
                {
                    cmd.Parameters.AddWithValue("@idLieu", p_IdLieu);
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            value = double.Parse(reader["Valeur"].ToString());
                        }
                    }
                }

                CloseConnexion();
                return value;
            }
        }

        public (double value, string unit) getLastMeasureWithUnit(int idLieu)
        {
            lock (_lock)
            {
                double value = 0.0;
                string unit = "";

                if (!InitConnexion())
                {
                    return (value, unit);
                }

                using (var cmd = CreateCommand(
                    _connectionMeasure,
                    "SELECT TOP 1 Valeur, Unite FROM tm_mesures WHERE Id_Lieu = @idLieu ORDER BY Date_Heure_Mesure DESC"))
                {
                    cmd.Parameters.AddWithValue("@idLieu", idLieu);
                    using (var reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            var rawValue = reader["Valeur"];
                            if (rawValue != null && rawValue != DBNull.Value)
                            {
                                var rawText = rawValue.ToString();
                                if (!double.TryParse(rawText, NumberStyles.Float, CultureInfo.InvariantCulture, out value))
                                {
                                    double.TryParse(rawText, NumberStyles.Float, CultureInfo.CurrentCulture, out value);
                                }
                            }

                            var rawUnit = reader["Unite"];
                            if (rawUnit != null && rawUnit != DBNull.Value)
                            {
                                unit = rawUnit.ToString();
                            }
                        }
                    }
                }

                CloseConnexion();
                return (value, unit);
            }
        }
        public bool setAlarmeByIdLieu(int p_idLieu, bool p_valeur)
        {
            lock (_lock)
            {
                try
                {
                    if (!InitConnexion())
                    {
                        return false;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "UPDATE t_lieu SET Notification_Active = @valeur, Date_Heure_Reactivation_Alarme = NULL WHERE Id_Lieu = @idLieu;"))
                    {
                        cmd.Parameters.AddWithValue("@valeur", p_valeur);
                        cmd.Parameters.AddWithValue("@idLieu", p_idLieu);
                        cmd.ExecuteNonQuery();
                    }

                    CloseConnexion();
                    return true;
                }
                catch
                {
                    VigitempServeur.Log("ERREUR : IMPOSSIBLE DE CHANGER LE REGLAGE DE NOTIFICATION POUR LE LIEU IdLieu: " + p_idLieu);
                    CloseConnexion();
                    return false;
                }
            }
        }

        public bool setSurveillanceByIdLieu(int p_idLieu, bool p_valeur)
        {
            lock (_lock)
            {
                try
                {
                    if (!InitConnexion())
                    {
                        return false;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "UPDATE t_lieu SET Lieu_Etat = @etat, Date_Heure_Reactivation_Surveillance = NULL WHERE Id_Lieu = @idLieu;"))
                    {
                        cmd.Parameters.AddWithValue("@etat", p_valeur ? "S" : "D");
                        cmd.Parameters.AddWithValue("@idLieu", p_idLieu);
                        cmd.ExecuteNonQuery();
                    }

                    using (var cmdSonde = CreateCommand(
                        _connectionMain,
                        "UPDATE t_sonde SET Surveillance_Etat = @etat " +
                        "WHERE Sonde_Numero_Serie IN (SELECT Sonde_Numero_Serie FROM t_lieu WHERE Id_Lieu = @idLieu);"))
                    {
                        cmdSonde.Parameters.AddWithValue("@etat", p_valeur ? "S" : "D");
                        cmdSonde.Parameters.AddWithValue("@idLieu", p_idLieu);
                        cmdSonde.ExecuteNonQuery();
                    }

                    CloseConnexion();
                    return true;
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(setSurveillanceByIdLieu MSSQL) SQL Erreur: " + ex.Message);
                    return false;
                }
            }
        }

        public bool writeAuditJournal(string codeJournal, string username, string userProfile, int? idLieu, string commentaire, string commentaireUtilisateur)
        {
            lock (_lock)
            {
                try
                {
                    if (!InitConnexion())
                    {
                        return false;
                    }

                    const int serveurId = 1;
                    const string tableName = "tm_journal";
                    int nextId;

                    using (var transaction = _connectionMeasure.BeginTransaction())
                    {
                        using (var ensureCmd = _connectionMeasure.CreateCommand())
                        {
                            ensureCmd.Transaction = transaction;
                            ensureCmd.CommandText =
                                "IF NOT EXISTS (SELECT 1 FROM tm_compteur_id_table WHERE Id_Serveur_BDD = @idServeur AND Nom_Table = @tableName) " +
                                "INSERT INTO tm_compteur_id_table (Id_Serveur_BDD, Nom_Table, Compteur_Id) VALUES (@idServeur, @tableName, 0);";
                            ensureCmd.Parameters.AddWithValue("@idServeur", serveurId);
                            ensureCmd.Parameters.AddWithValue("@tableName", tableName);
                            ensureCmd.ExecuteNonQuery();
                        }

                        using (var updateCmd = _connectionMeasure.CreateCommand())
                        {
                            updateCmd.Transaction = transaction;
                            updateCmd.CommandText =
                                "UPDATE tm_compteur_id_table " +
                                "SET Compteur_Id = Compteur_Id + 1 " +
                                "OUTPUT INSERTED.Compteur_Id " +
                                "WHERE Id_Serveur_BDD = @idServeur AND Nom_Table = @tableName;";
                            updateCmd.Parameters.AddWithValue("@idServeur", serveurId);
                            updateCmd.Parameters.AddWithValue("@tableName", tableName);
                            nextId = Convert.ToInt32(updateCmd.ExecuteScalar());
                        }

                        transaction.Commit();
                    }

                    using (var insertCmd = _connectionMeasure.CreateCommand())
                    {
                        insertCmd.CommandText =
                            "INSERT INTO tm_journal (Id_Serveur_BDD, Id_Journal, Code_Journal, Nom_Utilisateur, Profil_Utilisateur, Date_Heure_Journal, Id_Lieu, Commentaire, Commentaire_Utilisateur) " +
                            "VALUES (@idServeur, @idJournal, @codeJournal, @username, @userProfile, @dateJournal, @idLieu, @commentaire, @commentaireUtilisateur);";
                        insertCmd.Parameters.AddWithValue("@idServeur", serveurId);
                        insertCmd.Parameters.AddWithValue("@idJournal", nextId);
                        insertCmd.Parameters.AddWithValue("@codeJournal", codeJournal ?? string.Empty);
                        insertCmd.Parameters.AddWithValue("@username", username ?? string.Empty);
                        insertCmd.Parameters.AddWithValue("@userProfile", userProfile ?? string.Empty);
                        insertCmd.Parameters.AddWithValue("@dateJournal", DateTime.Now);
                        insertCmd.Parameters.AddWithValue("@idLieu", idLieu.HasValue ? (object)idLieu.Value : DBNull.Value);
                        insertCmd.Parameters.AddWithValue("@commentaire", string.IsNullOrWhiteSpace(commentaire) ? (object)DBNull.Value : commentaire);
                        insertCmd.Parameters.AddWithValue("@commentaireUtilisateur", string.IsNullOrWhiteSpace(commentaireUtilisateur) ? (object)DBNull.Value : commentaireUtilisateur);
                        insertCmd.ExecuteNonQuery();
                    }

                    CloseConnexion();
                    return true;
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(writeAuditJournal MSSQL) SQL Erreur: " + ex.Message);
                    return false;
                }
            }
        }

        public bool setLieuAlarmFlags(int idLieu, bool isPreAlarm, bool isAlarm)
        {
            lock (_lock)
            {
                if (!InitConnexion())
                {
                    return false;
                }

                try
                {
                    try
                    {
                        return SetLieuAlarmFlagsV2(idLieu, isPreAlarm, isAlarm);
                    }
                    catch (SqlException)
                    {
                        return SetLieuAlarmFlagsV1(idLieu, isPreAlarm, isAlarm);
                    }
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("setLieuAlarmFlags MSSQL error: " + ex);
                    return false;
                }
                finally
                {
                    CloseConnexion();
                }
            }
        }

        public bool setLieuInfosModifiees(int idLieu, bool value)
        {
            lock (_lock)
            {
                try
                {
                    if (!InitConnexion())
                    {
                        return false;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "UPDATE t_lieu SET Infos_Modifiees_Depuis_Derniere_Mesure = @value WHERE Id_Lieu = @idLieu;"))
                    {
                        cmd.Parameters.AddWithValue("@value", value ? 1 : 0);
                        cmd.Parameters.AddWithValue("@idLieu", idLieu);
                        cmd.ExecuteNonQuery();
                    }

                    CloseConnexion();
                    return true;
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(setLieuInfosModifiees MSSQL) SQL Erreur: " + ex.Message);
                    return false;
                }
            }
        }

        public bool setNonResponseAlarm(int idLieu, string sondeNumeroSerie, bool isActive)
        {
            lock (_lock)
            {
                try
                {
                    if (!InitConnexion())
                    {
                        return false;
                    }

                    int? alarmId = null;

                    if (isActive)
                    {
                        using (var cmdCheck = CreateCommand(
                            _connectionMain,
                            "SELECT TOP 1 Id_Alarme FROM t_alarme " +
                            "WHERE Id_Lieu = @idLieu AND Type = 'N' AND Date_Heure_Fin IS NULL " +
                            "ORDER BY Date_Heure_Debut DESC;"))
                        {
                            cmdCheck.Parameters.AddWithValue("@idLieu", idLieu);
                            var existing = cmdCheck.ExecuteScalar();

                            if (existing == null || existing == DBNull.Value)
                            {
                                using (var cmdInsert = CreateCommand(
                                    _connectionMain,
                                    "INSERT INTO t_alarme " +
                                    "(Date_Heure_Debut, Valeur, Type, Est_Alarme_Vrai, Id_Lieu, Sonde_Numero_Serie, Unite, " +
                                    "Est_Acquittee, Date_Heure_Derniere_Mesure, Date_Heure_Debut_Alarme_Vrai, " +
                                    "Est_Alarme_Pour_VigiTel, Est_Mail_Envoye, Est_Tel_Acquittee) " +
                                    "VALUES (GETDATE(), NULL, 'N', 1, @idLieu, @serie, NULL, 0, GETDATE(), GETDATE(), 0, 0, 0);"))
                                {
                                    cmdInsert.Parameters.AddWithValue("@idLieu", idLieu);
                                    cmdInsert.Parameters.AddWithValue("@serie", sondeNumeroSerie ?? string.Empty);
                                    cmdInsert.ExecuteNonQuery();
                                }

                                using (var cmdId = CreateCommand(
                                    _connectionMain,
                                    "SELECT CAST(SCOPE_IDENTITY() as int);"))
                                {
                                    alarmId = Convert.ToInt32(cmdId.ExecuteScalar());
                                }
                            }
                            if (existing == null || existing == DBNull.Value)
                            {
                                _ = AlarmWebNotifier.NotifyRealtimeAlarmAsync(alarmId, idLieu, "triggered");
                            }
                            else
                            {
                                using (var cmdUpdate = CreateCommand(
                                    _connectionMain,
                                    "UPDATE t_alarme SET Date_Heure_Derniere_Mesure = GETDATE(), Est_Alarme_Vrai = 1, " +
                                    "Est_Acquittee = 0, Est_Tel_Acquittee = 0 " +
                                    "WHERE Id_Alarme = @idAlarme;"))
                                {
                                    alarmId = Convert.ToInt32(existing);
                                    cmdUpdate.Parameters.AddWithValue("@idAlarme", alarmId.Value);
                                    cmdUpdate.ExecuteNonQuery();
                                }
                            }
                        }

                        if (alarmId.HasValue)
                        {
                            UpdateLieuAlarmReference(idLieu, alarmId.Value);
                            setLieuImmediateRetriggerFlag(idLieu, false);
                        }
                    }
                    else
                    {
                        int updated;
                        using (var cmdResolve = CreateCommand(
                            _connectionMain,
                            "UPDATE t_alarme " +
                            "SET Date_Heure_Fin = GETDATE(), Est_Alarme_Vrai = 0 " +
                            "WHERE Id_Lieu = @idLieu AND Type = 'N' AND Date_Heure_Fin IS NULL;"))
                        {
                            cmdResolve.Parameters.AddWithValue("@idLieu", idLieu);
                            updated = cmdResolve.ExecuteNonQuery();
                        }

                        UpdateLieuEndedFlag(idLieu);
                        if (updated > 0)
                        {
                            _ = AlarmWebNotifier.NotifyRealtimeAlarmAsync(null, idLieu, "ended");
                        }
                    }

                    CloseConnexion();
                    return true;
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(setNonResponseAlarm MSSQL) SQL Erreur: " + ex.Message);
                    return false;
                }
            }
        }

        public bool setThresholdAlarm(int idLieu, string sondeNumeroSerie, string type, double value, string unite, bool isActive)
        {
            lock (_lock)
            {
                try
                {
                    if (!InitConnexion())
                    {
                        return false;
                    }

                    int? alarmId = null;

                    if (isActive)
                    {
                        using (var cmdCheck = CreateCommand(
                            _connectionMain,
                            "SELECT TOP 1 Id_Alarme FROM t_alarme " +
                            "WHERE Id_Lieu = @idLieu AND Type = @type AND Date_Heure_Fin IS NULL " +
                            "ORDER BY Date_Heure_Debut DESC;"))
                        {
                            cmdCheck.Parameters.AddWithValue("@idLieu", idLieu);
                            cmdCheck.Parameters.AddWithValue("@type", type);

                            var existing = cmdCheck.ExecuteScalar();
                            if (existing == null || existing == DBNull.Value)
                            {
                                using (var cmdInsert = CreateCommand(
                                    _connectionMain,
                                    "INSERT INTO t_alarme " +
                                    "(Date_Heure_Debut, Valeur, Type, Est_Alarme_Vrai, Id_Lieu, Sonde_Numero_Serie, Unite, " +
                                    "Est_Acquittee, Date_Heure_Derniere_Mesure, Date_Heure_Debut_Alarme_Vrai, " +
                                    "Est_Alarme_Pour_VigiTel, Est_Mail_Envoye, Est_Tel_Acquittee) " +
                                    "VALUES (GETDATE(), @valeur, @type, 1, @idLieu, @serie, @unite, 0, GETDATE(), GETDATE(), 0, 0, 0);"))
                                {
                                    cmdInsert.Parameters.AddWithValue("@idLieu", idLieu);
                                    cmdInsert.Parameters.AddWithValue("@type", type);
                                    cmdInsert.Parameters.AddWithValue("@valeur", value);
                                    cmdInsert.Parameters.AddWithValue("@serie", sondeNumeroSerie ?? string.Empty);
                                    cmdInsert.Parameters.AddWithValue("@unite", unite ?? string.Empty);
                                    cmdInsert.ExecuteNonQuery();
                                }

                                using (var cmdId = CreateCommand(
                                    _connectionMain,
                                    "SELECT CAST(SCOPE_IDENTITY() as int);"))
                                {
                                    alarmId = Convert.ToInt32(cmdId.ExecuteScalar());
                                }
                            }
                            if (existing == null || existing == DBNull.Value)
                            {
                                _ = AlarmWebNotifier.NotifyRealtimeAlarmAsync(alarmId, idLieu, "triggered");
                            }
                            else
                            {
                                using (var cmdUpdate = CreateCommand(
                                    _connectionMain,
                                    "UPDATE t_alarme SET Valeur = @valeur, Unite = @unite, Date_Heure_Derniere_Mesure = GETDATE(), Est_Alarme_Vrai = 1, " +
                                    "Est_Acquittee = 0, Est_Tel_Acquittee = 0 " +
                                    "WHERE Id_Alarme = @idAlarme;"))
                                {
                                    cmdUpdate.Parameters.AddWithValue("@valeur", value);
                                    cmdUpdate.Parameters.AddWithValue("@unite", unite ?? string.Empty);
                                    alarmId = Convert.ToInt32(existing);
                                    cmdUpdate.Parameters.AddWithValue("@idAlarme", alarmId.Value);
                                    cmdUpdate.ExecuteNonQuery();
                                }
                            }
                        }

                        if (alarmId.HasValue)
                        {
                            UpdateLieuAlarmReference(idLieu, alarmId.Value);
                            setLieuImmediateRetriggerFlag(idLieu, false);
                        }
                    }
                    else
                    {
                        int updated;
                        using (var cmdResolve = CreateCommand(
                            _connectionMain,
                            "UPDATE t_alarme " +
                            "SET Date_Heure_Fin = GETDATE(), Est_Alarme_Vrai = 0 " +
                            "WHERE Id_Lieu = @idLieu AND Type = @type AND Date_Heure_Fin IS NULL;"))
                        {
                            cmdResolve.Parameters.AddWithValue("@idLieu", idLieu);
                            cmdResolve.Parameters.AddWithValue("@type", type);
                            updated = cmdResolve.ExecuteNonQuery();
                        }

                        UpdateLieuEndedFlag(idLieu);
                        if (updated > 0)
                        {
                            _ = AlarmWebNotifier.NotifyRealtimeAlarmAsync(null, idLieu, "ended");
                        }
                    }

                    CloseConnexion();
                    return true;
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(setThresholdAlarm MSSQL) SQL Erreur: " + ex.Message);
                    return false;
                }
            }
        }

        public AlarmSummary getActiveAlarmSummary(int idLieu)
        {
            lock (_lock)
            {
                try
                {
                    if (!InitConnexion())
                    {
                        return null;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT TOP 1 Id_Alarme, Type, Date_Heure_Debut, Date_Heure_Debut_Alarme_Vrai, Date_Heure_Derniere_Mesure, Valeur, Unite " +
                        "FROM t_alarme " +
                        "WHERE Id_Lieu = @idLieu AND Date_Heure_Fin IS NULL " +
                        "ORDER BY Date_Heure_Debut DESC;"))
                    {
                        cmd.Parameters.AddWithValue("@idLieu", idLieu);

                        using (var reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                var id = Convert.ToInt32(reader["Id_Alarme"]);
                                var type = reader["Type"] == DBNull.Value ? null : reader["Type"].ToString();
                                var dateDebut = reader["Date_Heure_Debut"] == DBNull.Value
                                    ? (DateTime?)null
                                    : Convert.ToDateTime(reader["Date_Heure_Debut"]);
                                var dateDebutVrai = reader["Date_Heure_Debut_Alarme_Vrai"] == DBNull.Value
                                    ? (DateTime?)null
                                    : Convert.ToDateTime(reader["Date_Heure_Debut_Alarme_Vrai"]);
                                var dateDerniereMesure = reader["Date_Heure_Derniere_Mesure"] == DBNull.Value
                                    ? (DateTime?)null
                                    : Convert.ToDateTime(reader["Date_Heure_Derniere_Mesure"]);
                                var valeur = GetNullableDouble(reader, "Valeur");
                                var unite = reader["Unite"] == DBNull.Value ? null : reader["Unite"].ToString();

                                CloseConnexion();
                                return new AlarmSummary(
                                    id,
                                    type,
                                    dateDebut,
                                    dateDebutVrai,
                                    dateDerniereMesure,
                                    valeur,
                                    unite);
                            }
                        }
                    }

                    CloseConnexion();
                    return null;
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(getActiveAlarmSummary MSSQL) SQL Erreur: " + ex.Message);
                    return null;
                }
            }
        }

        public bool setThresholdAlarmEnded(int idLieu)
        {
            lock (_lock)
            {
                try
                {
                    if (!InitConnexion())
                    {
                        return false;
                    }

                    int updated;
                    using (var cmdResolve = CreateCommand(
                        _connectionMain,
                        "UPDATE t_alarme " +
                        "SET Date_Heure_Fin = GETDATE(), Est_Alarme_Vrai = 0 " +
                        "WHERE Id_Lieu = @idLieu AND Type IN ('H','B') AND Date_Heure_Fin IS NULL;"))
                    {
                        cmdResolve.Parameters.AddWithValue("@idLieu", idLieu);
                        updated = cmdResolve.ExecuteNonQuery();
                    }

                    UpdateLieuEndedFlag(idLieu);
                    if (updated > 0)
                    {
                        _ = AlarmWebNotifier.NotifyRealtimeAlarmAsync(null, idLieu, "ended");
                    }

                    CloseConnexion();
                    return true;
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(setThresholdAlarmEnded MSSQL) SQL Erreur: " + ex.Message);
                    return false;
                }
            }
        }

        private bool SetLieuAlarmFlagsV2(int idLieu, bool isPreAlarm, bool isAlarm)
        {
            using (var cmd = CreateCommand(
                _connectionMain,
                "UPDATE t_lieu SET Est_Lieu_En_Pre_Alarme = @pre, Est_Lieu_En_Alarme = @alarm WHERE Id_Lieu = @id;"))
            {
                cmd.Parameters.AddWithValue("@pre", isPreAlarm ? 1 : 0);
                cmd.Parameters.AddWithValue("@alarm", isAlarm ? 1 : 0);
                cmd.Parameters.AddWithValue("@id", idLieu);
                cmd.ExecuteNonQuery();
            }
            return true;
        }

        private bool SetLieuAlarmFlagsV1(int idLieu, bool isPreAlarm, bool isAlarm)
        {
            using (var cmd = CreateCommand(
                _connectionMain,
                "UPDATE t_lieu SET Est_Lieu_En_Pre_Alarme = @pre, Est_Lieu_En_Alarme = @alarm WHERE IdLieu = @id;"))
            {
                cmd.Parameters.AddWithValue("@pre", isPreAlarm ? 1 : 0);
                cmd.Parameters.AddWithValue("@alarm", isAlarm ? 1 : 0);
                cmd.Parameters.AddWithValue("@id", idLieu);
                cmd.ExecuteNonQuery();
            }
            return true;
        }

        public bool getLieuImmediateRetriggerFlag(int idLieu)
        {
            lock (_lock)
            {
                try
                {
                    if (!InitConnexion())
                    {
                        return false;
                    }

                    using (var cmd = CreateCommand(_connectionMain,
                        "SELECT ISNULL(Est_Redeclenchement_Immediat, 0) FROM t_lieu WHERE Id_Lieu = @idLieu;"))
                    {
                        cmd.Parameters.AddWithValue("@idLieu", idLieu);
                        var raw = cmd.ExecuteScalar();
                        CloseConnexion();
                        if (raw == null || raw == DBNull.Value)
                        {
                            return false;
                        }

                        return Convert.ToInt32(raw) == 1;
                    }
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(getLieuImmediateRetriggerFlag MSSQL) SQL Erreur: " + ex.Message);
                    return false;
                }
            }
        }

        public bool setLieuImmediateRetriggerFlag(int idLieu, bool enabled)
        {
            lock (_lock)
            {
                try
                {
                    if (!InitConnexion())
                    {
                        return false;
                    }

                    using (var cmd = CreateCommand(_connectionMain,
                        "UPDATE t_lieu SET Est_Redeclenchement_Immediat = @value WHERE Id_Lieu = @idLieu;"))
                    {
                        cmd.Parameters.AddWithValue("@value", enabled ? 1 : 0);
                        cmd.Parameters.AddWithValue("@idLieu", idLieu);
                        cmd.ExecuteNonQuery();
                    }
                    CloseConnexion();
                    return true;
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(setLieuImmediateRetriggerFlag MSSQL) SQL Erreur: " + ex.Message);
                    return false;
                }
            }
        }
        public bool hasActiveAcknowledgedAlarm(int idLieu, string type)
        {
            // Backward-compat wrapper: immediate retrigger is now driven by t_lieu flag.
            return getLieuImmediateRetriggerFlag(idLieu);
        }



        public int getLastAlarmIdByServeur(int idServeur)
        {
            lock (_lock)
            {
                try
                {
                    if (!InitConnexion())
                    {
                        return 0;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT MAX(a.Id_Alarme) " +
                        "FROM t_alarme a " +
                        "INNER JOIN t_lieu l ON a.Id_Lieu = l.Id_Lieu " +
                        "INNER JOIN t_sonde s ON l.Sonde_Numero_Serie = s.Sonde_Numero_Serie " +
                        "INNER JOIN t_module m ON s.Id_Module = m.Id_Module " +
                        "WHERE m.Id_Serveur = @idServeur;"))
                    {
                        cmd.Parameters.AddWithValue("@idServeur", idServeur);
                        var result = cmd.ExecuteScalar();
                        CloseConnexion();
                        if (result == null || result == DBNull.Value) return 0;
                        return Convert.ToInt32(result);
                    }
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(getLastAlarmIdByServeur MSSQL) SQL Erreur: " + ex.Message);
                    return 0;
                }
            }
        }

        public List<AlarmNotificationItem> getNewAlarmsSince(int idServeur, int lastAlarmId, int maxCount)
        {
            lock (_lock)
            {
                var list = new List<AlarmNotificationItem>();
                try
                {
                    if (!InitConnexion())
                    {
                        return list;
                    }

                    var limit = Math.Max(1, maxCount);
                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT TOP (@limit) a.Id_Alarme, a.Id_Lieu, a.Type, a.Valeur, a.Unite, a.Date_Heure_Debut " +
                        "FROM t_alarme a " +
                        "INNER JOIN t_lieu l ON a.Id_Lieu = l.Id_Lieu " +
                        "INNER JOIN t_sonde s ON l.Sonde_Numero_Serie = s.Sonde_Numero_Serie " +
                        "INNER JOIN t_module m ON s.Id_Module = m.Id_Module " +
                        "WHERE a.Id_Alarme > @lastId " +
                        "AND a.Est_Alarme_Vrai = 1 " +
                        "AND m.Id_Serveur = @idServeur " +
                        "ORDER BY a.Id_Alarme ASC;"))
                    {
                        cmd.Parameters.AddWithValue("@limit", limit);
                        cmd.Parameters.AddWithValue("@lastId", lastAlarmId);
                        cmd.Parameters.AddWithValue("@idServeur", idServeur);

                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var id = Convert.ToInt32(reader["Id_Alarme"]);
                                var idLieu = Convert.ToInt32(reader["Id_Lieu"]);
                                var type = reader["Type"] == DBNull.Value ? null : reader["Type"].ToString();
                                var valeur = GetNullableDouble(reader, "Valeur");
                                var unite = reader["Unite"] == DBNull.Value ? null : reader["Unite"].ToString();
                                var dateDebut = reader["Date_Heure_Debut"] == DBNull.Value
                                    ? (DateTime?)null
                                    : Convert.ToDateTime(reader["Date_Heure_Debut"]);

                                list.Add(new AlarmNotificationItem(
                                    id,
                                    idLieu,
                                    type,
                                    valeur,
                                    unite,
                                    dateDebut));
                            }
                        }
                    }

                    CloseConnexion();
                    return list;
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(getNewAlarmsSince MSSQL) SQL Erreur: " + ex.Message);
                    return list;
                }
            }
        }

        public List<AlarmNotificationItem> getEndedAlarmsSince(int idServeur, DateTime sinceLocalTime, int maxCount)
        {
            lock (_lock)
            {
                var list = new List<AlarmNotificationItem>();
                try
                {
                    if (!InitConnexion())
                    {
                        return list;
                    }

                    var limit = Math.Max(1, maxCount);
                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT TOP (@limit) ended.Id_Lieu, ended.First_Alarm_Id " +
                        "FROM (" +
                        "  SELECT a.Id_Lieu, MIN(a.Id_Alarme) AS First_Alarm_Id, MIN(a.Date_Heure_Fin) AS First_End " +
                        "  FROM t_alarme a " +
                        "  INNER JOIN t_lieu l ON a.Id_Lieu = l.Id_Lieu " +
                        "  INNER JOIN t_sonde s ON l.Sonde_Numero_Serie = s.Sonde_Numero_Serie " +
                        "  INNER JOIN t_module m ON s.Id_Module = m.Id_Module " +
                        "  WHERE a.Date_Heure_Fin IS NOT NULL " +
                        "  AND a.Date_Heure_Fin > @since " +
                        "  AND m.Id_Serveur = @idServeur " +
                        "  AND NOT EXISTS (SELECT 1 FROM t_alarme x WHERE x.Id_Lieu = a.Id_Lieu AND x.Date_Heure_Fin IS NULL) " +
                        "  GROUP BY a.Id_Lieu" +
                        ") ended " +
                        "ORDER BY ended.First_End ASC;"))
                    {
                        cmd.Parameters.AddWithValue("@limit", limit);
                        cmd.Parameters.AddWithValue("@since", sinceLocalTime);
                        cmd.Parameters.AddWithValue("@idServeur", idServeur);

                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var idLieu = Convert.ToInt32(reader["Id_Lieu"]);
                                var idAlarme = Convert.ToInt32(reader["First_Alarm_Id"]);
                                list.Add(new AlarmNotificationItem(idAlarme, idLieu, "T", null, null, null));
                            }
                        }
                    }

                    CloseConnexion();
                    return list;
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(getEndedAlarmsSince MSSQL) SQL Erreur: " + ex.Message);
                    return list;
                }
            }
        }

        private void UpdateLieuEndedFlag(int idLieu)
        {
            using (var cmdCount = CreateCommand(
                _connectionMain,
                "SELECT COUNT(*) FROM t_alarme " +
                "WHERE Id_Lieu = @idLieu AND Date_Heure_Fin IS NOT NULL AND ISNULL(Est_Acquittee, 0) = 0;"))
            {
                cmdCount.Parameters.AddWithValue("@idLieu", idLieu);
                var count = Convert.ToInt32(cmdCount.ExecuteScalar());
                var flag = count > 0 ? 1 : 0;

                using (var cmdUpdate = CreateCommand(
                    _connectionMain,
                    "UPDATE t_lieu SET Est_Lieu_Alarme_Terminee_Non_Acquittee = @flag WHERE Id_Lieu = @idLieu;"))
                {
                    cmdUpdate.Parameters.AddWithValue("@flag", flag);
                    cmdUpdate.Parameters.AddWithValue("@idLieu", idLieu);
                    cmdUpdate.ExecuteNonQuery();
                }
            }
        }

        private void UpdateLieuAlarmReference(int idLieu, int alarmId)
        {
            using (var cmdUpdate = CreateCommand(
                _connectionMain,
                "UPDATE t_lieu SET Id_Alarme = @idAlarme WHERE Id_Lieu = @idLieu;"))
            {
                cmdUpdate.Parameters.AddWithValue("@idAlarme", alarmId);
                cmdUpdate.Parameters.AddWithValue("@idLieu", idLieu);
                cmdUpdate.ExecuteNonQuery();
            }
        }

        public (double, double) getCoeffCalibrageBySerialNumber(string p_serial_number)
        {
            lock (_lock)
            {
                double coeffX;
                double coeffConstant;

                if (!InitConnexion())
                {
                    return (1, 0);
                }

                using (var cmd = CreateCommand(
                    _connectionMain,
                    "SELECT TOP 1 Coeff_X, Coeff_Constant FROM t_ajustage where Sonde_Numero_Serie = @serial ORDER BY Date_Heure_Ajustage DESC"))
                {
                    cmd.Parameters.AddWithValue("@serial", p_serial_number);
                    try
                    {
                        using (var reader = cmd.ExecuteReader())
                        {
                            reader.Read();
                            coeffX = Convert.ToDouble(reader["Coeff_X"]);
                            coeffConstant = Convert.ToDouble(reader["Coeff_Constant"]);
                        }
                    }
                    catch
                    {
                        VigitempServeur.Log("ERREUR : PAS DE CALIBRAGE POUR LA SONDE " + p_serial_number);
                        CloseConnexion();
                        return (1, 0);
                    }
                }

                CloseConnexion();
                return (coeffX, coeffConstant);
            }
        }
        public SondeMetrologySettings getSondeMetrologyBySerialNumber(string p_serial_number)
        {
            lock (_lock)
            {
                var settings = new SondeMetrologySettings
                {
                    CoeffX = 1d,
                    CoeffConstant = 0d,
                    Offset = null,
                    HasAjustage = false,
                };

                if (!InitConnexion())
                {
                    return settings;
                }

                using (var cmd = CreateCommand(
                    _connectionMain,
                    "SELECT t_lieu.Id_Lieu, t_lieu.EMT_Choix_Mode, t_lieu.Est_Correction_Ej, t_sonde.Sonde_Offset, ta.Coeff_X, ta.Coeff_Constant, te.Err_Justesse, te.Incertitude, te.Date_Validite FROM t_sonde " +
                    "LEFT JOIN t_lieu ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie AND t_lieu.Lieu_Etat = 'S' " +
                    "OUTER APPLY (" +
                    "  SELECT TOP 1 Coeff_X, Coeff_Constant FROM t_ajustage " +
                    "  WHERE Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                    "  ORDER BY Date_Heure_Ajustage DESC, Id_Ajustage DESC" +
                    ") ta " +
                    "OUTER APPLY (" +
                    "  SELECT TOP 1 Err_Justesse, Incertitude, Date_Validite FROM t_etalonnage " +
                    "  WHERE Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                    "  ORDER BY Date_Heure_Etalonnage DESC, Id_Etalonnage DESC" +
                    ") te " +
                    "WHERE t_sonde.Sonde_Numero_Serie = @serial"))
                {
                    cmd.Parameters.AddWithValue("@serial", p_serial_number);
                    try
                    {
                        using (var reader = cmd.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                var offset = GetOptionalDouble(reader, "Sonde_Offset");
                                if (offset.HasValue && Math.Abs(offset.Value) > 0.0000001d)
                                {
                                    settings.Offset = offset;
                                }

                                var coeffX = GetOptionalDouble(reader, "Coeff_X");
                                var coeffConstant = GetOptionalDouble(reader, "Coeff_Constant");

                                if (coeffX.HasValue && coeffConstant.HasValue)
                                {
                                    settings.HasAjustage = true;
                                    settings.CoeffX = coeffX.Value;
                                    settings.CoeffConstant = coeffConstant.Value;
                                }

                                var errJustesse = GetOptionalDouble(reader, "Err_Justesse");
                                var incertitude = GetOptionalDouble(reader, "Incertitude");
                                var dateValidite = GetNullableDateTime(reader, "Date_Validite");
                                var applyCorrectionEj = GetOptionalBool(reader, "Est_Correction_Ej", false);

                                settings.IdLieu = GetNullableInt(reader, "Id_Lieu", 0);
                                settings.EmtChoixMode = GetNullableInt(reader, "EMT_Choix_Mode", 0);
                                settings.ApplyCorrectionEj = applyCorrectionEj;

                                if (errJustesse.HasValue)
                                {
                                    settings.HasEtalonnage = true;
                                    settings.ErrJustesse = errJustesse.Value;
                                    settings.CorrectionJustesse = -errJustesse.Value;
                                }

                                if (incertitude.HasValue)
                                {
                                    settings.HasEtalonnage = true;
                                    settings.Incertitude = incertitude.Value;
                                }

                                if (dateValidite != default(DateTime))
                                {
                                    settings.HasEtalonnage = true;
                                    settings.DateValiditeEtalonnage = dateValidite;
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        VigitempServeur.Log("getSondeMetrologyBySerialNumber MSSQL error: " + ex.Message);
                    }
                }

                CloseConnexion();
                return settings;
            }
        }
    }
}



