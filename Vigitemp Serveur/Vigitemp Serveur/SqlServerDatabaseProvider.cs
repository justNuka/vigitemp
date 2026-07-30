using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Threading;

namespace Vigitemp_Serveur
{
    internal sealed class SqlServerDatabaseProvider : IDatabaseProvider, IDisposable
    {
        private readonly object _lock = new object();
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

        private bool EnsureConnected()
        {
            lock (_lock)
            {
                try
                {
                    if (_connectionMain != null && _connectionMain.State == System.Data.ConnectionState.Open &&
                        _connectionMeasure != null && _connectionMeasure.State == System.Data.ConnectionState.Open)
                    {
                        return true;
                    }

                    CloseConnexion();

                    var mainDb = GetSetting("Vigi.Db.MainDatabase", "vigitemp");
                    var mesureDb = GetSetting("Vigi.Db.MeasureDatabase", "vigitemp_mesure");

                    _connectionMain = CreateConnection(mainDb);
                    _connectionMain.Open();

                    _connectionMeasure = CreateConnection(mesureDb);
                    _connectionMeasure.Open();

                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("EnsureConnected (MSSQL): connexion echouee: " + ex.Message);
                    CloseConnexion();
                    return false;
                }
            }
        }

        public void Dispose()
        {
            CloseConnexion();
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

                if (!EnsureConnected())
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

                return idLieu;
            }
        }

        public LieuAlarmSettings getLieuAlarmSettings(int idLieu)
        {
            lock (_lock)
            {
                if (!EnsureConnected())
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
                "Retard_Non_Reponse, Retard_Alarme_Changement_Consigne, Nb_Mesures_Temporisation_Redeclenchement, Planning_Derniere_Maj, " +
                "Notification_Active, Date_Heure_Reactivation_Alarme, Date_Heure_Derniere_Reponse, Date_Heure_Derniere_Reponse_Recue_OK " +
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
                        planningDerniereMaj: default(DateTime),
                        dateHeureDerniereReponse: default(DateTime));
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
                    notificationActive: GetNullableBool(reader, "Notification_Active", true),
                    dateHeureReactivationAlarme: GetNullableDateTime(reader, "Date_Heure_Reactivation_Alarme"),
                    planningDerniereMaj: GetNullableDateTime(reader, "Planning_Derniere_Maj"),
                    dateHeureDerniereReponse: GetNullableDateTime(reader, "Date_Heure_Derniere_Reponse"),
                    dateHeureDerniereReponseRecueOk: GetNullableDateTime(reader, "Date_Heure_Derniere_Reponse_Recue_OK"));
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
                "Consigne_Sup_Pre_Alarme, Est_Consigne_Sup_Pre_Alarme_Active, " +
                "Date_Heure_Derniere_Reponse, Date_Heure_Derniere_Reponse_Recue_OK " +
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
                        planningDerniereMaj: default(DateTime),
                        dateHeureDerniereReponse: default(DateTime));
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
                    planningDerniereMaj: default(DateTime),
                    dateHeureDerniereReponse: GetNullableDateTime(reader, "Date_Heure_Derniere_Reponse"),
                    dateHeureDerniereReponseRecueOk: GetNullableDateTime(reader, "Date_Heure_Derniere_Reponse_Recue_OK"));
            }
        }

        public List<string> getPCsClients()
        {
            lock (_lock)
            {
                var arrayIp = new List<string>();
                try
                {
                    if (!EnsureConnected())
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

                    return arrayIp;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("erreur getPCsClients: " + ex);
                    return arrayIp;
                }
            }
        }
        public bool AddMesure(string p_numeroSerie, double p_valeur, string p_unite, string p_resistance, string p_rssi = null)
        {
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
                    {
                        return false;
                    }

                    int idSonde;
                    int idLieu;
                    float consigne;
                    float consigneSup;
                    float consigneInf;
                    bool consigneSupActive;
                    bool consigneInfActive;
                    int frequence;
                    const int idServeurBdd = 1;
                    int estEtatAlarme;

                    using (var cmdMain = CreateCommand(
                        _connectionMain,
                        "SELECT Frequence, Consigne, " +
                        "Tolerance_Surveillance_Sup as Consigne_Sup, " +
                        "Tolerance_Surveillance_Inf as Consigne_Inf, " +
                        "Est_Consigne_Sup_Active, Est_Consigne_Inf_Active, " +
                        "Nom_Lieu, Id_Lieu, t_lieu.Est_Lieu_En_Alarme, t_lieu.Sonde_Numero_Serie, t_sonde.Id_Sonde FROM t_lieu " +
                            "INNER JOIN t_sonde ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                            "INNER JOIN t_module ON t_sonde.Id_Module = t_module.Id_Module " +
                        "LEFT JOIN t_sonde_type tt ON tt.Sonde_Type = t_sonde.Sonde_Type " +
                            "WHERE t_lieu.Sonde_Numero_Serie = @serial " +
                        "AND t_sonde.Etat_Sonde = 'S' " +
                        "AND ISNULL(t_sonde.Est_Sonde_GSO, 0) = 0;"))
                    {
                        cmdMain.Parameters.AddWithValue("@serial", p_numeroSerie);
                        using (var reader = cmdMain.ExecuteReader())
                        {
                            if (!reader.Read())
                            {
                                VigitempServeur.Log("(AddMesure) Aucune ligne t_lieu pour la sonde: " + p_numeroSerie);
                                return false;
                            }

                            idSonde = (int)reader["Id_Sonde"];
                            idLieu = (int)reader["Id_Lieu"];
                            consigne = GetFloatOrDefault(reader["Consigne"]);
                            consigneSup = GetFloatOrDefault(reader["Consigne_Sup"]);
                            consigneInf = GetFloatOrDefault(reader["Consigne_Inf"]);
                            consigneSupActive = GetNullableBool(reader, "Est_Consigne_Sup_Active", false);
                            consigneInfActive = GetNullableBool(reader, "Est_Consigne_Inf_Active", false);
                            frequence = (int)reader["Frequence"];
                            estEtatAlarme = Convert.ToInt32(reader["Est_Lieu_En_Alarme"]);
                        }
                    }

                    var now = DateTime.Now;
                    if (HasRecentMeasurement(p_numeroSerie, now, requireNonNullValue: true))
                    {
                        VigitempServeur.Log($"(AddMesure MSSQL) Doublon ignore sonde={p_numeroSerie} windowSec={GetDuplicateGuardSeconds()}");
                        return false;
                    }

                    using (var cmdMeasure = CreateCommand(
                        _connectionMeasure,
                        "INSERT INTO tm_mesures " +
                        "(Id_Serveur_BDD, Date_Heure_Mesure, Valeur, Valeur_Brute, Consigne, Consigne_Sup, Consigne_Inf, Unite, Frequence, Sonde_Numero_Serie, Id_Lieu, Est_Etat_Alarme, Rssi) " +
                        "VALUES " +
                        "(@idserveurbdd, @dateheuremesure, @valeur, @resistance, @consigne, @consignesup, @consigneinf, @unite, @frequence, @sondenumeroserie, @idlieu, @estEtatAlarme, @rssi)"))
                    {
                        cmdMeasure.Parameters.AddWithValue("@idserveurbdd", idServeurBdd);
                        cmdMeasure.Parameters.AddWithValue("@dateheuremesure", now);
                        cmdMeasure.Parameters.AddWithValue("@valeur", p_valeur);
                        cmdMeasure.Parameters.AddWithValue("@resistance", (object)p_resistance ?? DBNull.Value);
                        cmdMeasure.Parameters.AddWithValue("@unite", p_unite);
                        cmdMeasure.Parameters.AddWithValue("@consigne", consigne);
                        cmdMeasure.Parameters.AddWithValue("@consignesup", consigneSup);
                        cmdMeasure.Parameters.AddWithValue("@consigneinf", consigneInf);
                        cmdMeasure.Parameters.AddWithValue("@frequence", frequence);
                        cmdMeasure.Parameters.AddWithValue("@sondenumeroserie", p_numeroSerie);
                        cmdMeasure.Parameters.AddWithValue("@idlieu", idLieu);
                        cmdMeasure.Parameters.AddWithValue("@estEtatAlarme", estEtatAlarme);
                        cmdMeasure.Parameters.AddWithValue("@rssi", string.IsNullOrWhiteSpace(p_rssi) ? (object)DBNull.Value : p_rssi);
                        cmdMeasure.ExecuteNonQuery();
                    }

                    var isInActiveThresholds =
                        (!consigneSupActive || p_valeur <= consigneSup) &&
                        (!consigneInfActive || p_valeur >= consigneInf);
                    using (var cmdUpdateLieu = CreateCommand(
                        _connectionMain,
                        "UPDATE t_lieu SET " +
                        "Derniere_Date_Heure = @dateheuremesure, " +
                        "Date_Heure_Derniere_Reponse = @dateheuremesure, " +
                        "Date_Heure_Derniere_Reponse_Recue_OK = CASE WHEN @isok = 1 THEN @dateheuremesure ELSE Date_Heure_Derniere_Reponse_Recue_OK END, " +
                        "Derniere_Valeur = @valeur, " +
                        "Derniere_Unite = @unite, " +
                        "Derniere_Valeur_Null = 0 " +
                        "WHERE Id_Lieu = @idlieu;"))
                    {
                        cmdUpdateLieu.Parameters.AddWithValue("@dateheuremesure", now);
                        cmdUpdateLieu.Parameters.AddWithValue("@valeur", p_valeur);
                        cmdUpdateLieu.Parameters.AddWithValue("@unite", p_unite);
                        cmdUpdateLieu.Parameters.AddWithValue("@isok", isInActiveThresholds ? 1 : 0);
                        cmdUpdateLieu.Parameters.AddWithValue("@idlieu", idLieu);
                        cmdUpdateLieu.ExecuteNonQuery();
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
                        estEtatAlarme);

                    Interlocked.Increment(ref VigitempServeur.nombres_reponses);
                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(AddMesure MSSQL) SQL Erreur: " + ex);
                    return false;
                }
            }
        }

        public bool AddHistoricalMesureIfMissing(string p_numeroSerie, double p_valeur, string p_unite, string p_resistance, DateTime measureDateTime)
        {
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
                    {
                        return false;
                    }

                    int idLieu;
                    float consigne;
                    float consigneSup;
                    float consigneInf;
                    bool consigneSupActive;
                    bool consigneInfActive;
                    int frequence;
                    const int idServeurBdd = 1;
                    var planningActif = false;

                    using (var cmdMain = CreateCommand(
                        _connectionMain,
                        "SELECT Frequence, Consigne, " +
                        "Tolerance_Surveillance_Sup as Consigne_Sup, " +
                        "Tolerance_Surveillance_Inf as Consigne_Inf, " +
                        "Est_Consigne_Sup_Active, Est_Consigne_Inf_Active, " +
                        "Id_Lieu, t_lieu.Est_Lieu_En_Alarme FROM t_lieu " +
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
                                VigitempServeur.Log("(AddHistoricalMesureIfMissing MSSQL) Aucune ligne t_lieu pour la sonde: " + p_numeroSerie);
                                return false;
                            }

                            idLieu = (int)reader["Id_Lieu"];
                            consigne = GetFloatOrDefault(reader["Consigne"]);
                            consigneSup = GetFloatOrDefault(reader["Consigne_Sup"]);
                            consigneInf = GetFloatOrDefault(reader["Consigne_Inf"]);
                            consigneSupActive = GetNullableBool(reader, "Est_Consigne_Sup_Active", false);
                            consigneInfActive = GetNullableBool(reader, "Est_Consigne_Inf_Active", false);
                            frequence = (int)reader["Frequence"];
                        }
                    }

                    using (var cmdPlanning = CreateCommand(
                        _connectionMain,
                        "SELECT TOP (1) COALESCE(Consigne_Apres, @consigne) AS Consigne_Apres, " +
                        "COALESCE(Tolerance_Surveillance_Sup_Apres, @consignesup) AS Tolerance_Surveillance_Sup_Apres, " +
                        "COALESCE(Tolerance_Surveillance_Inf_Apres, @consigneinf) AS Tolerance_Surveillance_Inf_Apres " +
                        "FROM t_lieu_planning_audit " +
                        "WHERE Id_Lieu = @idlieu AND Type = 'PLAN_APPLY' " +
                        "AND Date_Heure_Debut_Changement <= @dateheuremesure " +
                        "AND (Date_Heure_Fin_Changement IS NULL OR Date_Heure_Fin_Changement >= @dateheuremesure) " +
                        "ORDER BY Date_Heure_Debut_Changement DESC, Id_Audit DESC;"))
                    {
                        cmdPlanning.Parameters.AddWithValue("@idlieu", idLieu);
                        cmdPlanning.Parameters.AddWithValue("@dateheuremesure", measureDateTime);
                        cmdPlanning.Parameters.AddWithValue("@consigne", consigne);
                        cmdPlanning.Parameters.AddWithValue("@consignesup", consigneSup);
                        cmdPlanning.Parameters.AddWithValue("@consigneinf", consigneInf);

                        using (var reader = cmdPlanning.ExecuteReader())
                        {
                            if (reader.Read())
                            {
                                consigne = GetFloatOrDefault(reader["Consigne_Apres"]);
                                consigneSup = GetFloatOrDefault(reader["Tolerance_Surveillance_Sup_Apres"]);
                                consigneInf = GetFloatOrDefault(reader["Tolerance_Surveillance_Inf_Apres"]);
                                planningActif = true;
                            }
                        }
                    }

                    var isInActiveThresholds =
                        (!consigneSupActive || p_valeur <= consigneSup) &&
                        (!consigneInfActive || p_valeur >= consigneInf);
                    var estEtatAlarme = isInActiveThresholds ? 0 : 1;

                    var duplicateGuardSeconds = GetDuplicateGuardSeconds();
                    using (var cmdCheck = CreateCommand(
                        _connectionMeasure,
                        duplicateGuardSeconds > 0
                            ? "SELECT TOP 1 1 FROM tm_mesures WHERE Sonde_Numero_Serie = @serial AND ABS(DATEDIFF(SECOND, Date_Heure_Mesure, @dateheuremesure)) <= @duplicateGuardSeconds AND ISNULL(Est_Valeur_Null, 0) = 0;"
                            : "SELECT TOP 1 1 FROM tm_mesures WHERE Sonde_Numero_Serie = @serial AND Date_Heure_Mesure = @dateheuremesure AND ISNULL(Est_Valeur_Null, 0) = 0;"))
                    {
                        cmdCheck.Parameters.AddWithValue("@serial", p_numeroSerie);
                        cmdCheck.Parameters.AddWithValue("@dateheuremesure", measureDateTime);
                        if (duplicateGuardSeconds > 0)
                        {
                            cmdCheck.Parameters.AddWithValue("@duplicateGuardSeconds", duplicateGuardSeconds);
                        }
                        var existing = cmdCheck.ExecuteScalar();
                        if (existing != null && existing != DBNull.Value)
                        {
                            return false;
                        }
                    }

                    var nullMatchToleranceSeconds = Math.Max(60, Math.Min(900, (Math.Max(1, frequence) / 2) + 30));
                    var replacedNull = false;
                    using (var cmdReplaceNull = CreateCommand(
                        _connectionMeasure,
                        ";WITH missing AS (" +
                        " SELECT TOP (1) * FROM tm_mesures" +
                        " WHERE Sonde_Numero_Serie = @sondenumeroserie AND Id_Lieu = @idlieu" +
                        " AND ISNULL(Est_Valeur_Null, 0) = 1" +
                        " AND ABS(DATEDIFF(SECOND, Date_Heure_Mesure, @dateheuremesure)) <= @toleranceSeconds" +
                        " ORDER BY ABS(DATEDIFF(SECOND, Date_Heure_Mesure, @dateheuremesure))" +
                        ") UPDATE missing SET Date_Heure_Mesure = @dateheuremesure, Valeur = @valeur," +
                        " Valeur_Brute = @resistance, Est_Valeur_Memoire = 1, Est_Valeur_Null = 0," +
                        " Consigne = @consigne, Consigne_Sup = @consignesup, Consigne_Inf = @consigneinf," +
                        " Unite = @unite, Frequence = @frequence, Est_Etat_Alarme = @estEtatAlarme," +
                        " Planning_Regle_Existe = @planningactif, Planning_Actif = @planningactif;"))
                    {
                        cmdReplaceNull.Parameters.AddWithValue("@dateheuremesure", measureDateTime);
                        cmdReplaceNull.Parameters.AddWithValue("@valeur", p_valeur);
                        cmdReplaceNull.Parameters.AddWithValue("@resistance", (object)p_resistance ?? DBNull.Value);
                        cmdReplaceNull.Parameters.AddWithValue("@unite", p_unite);
                        cmdReplaceNull.Parameters.AddWithValue("@consigne", consigne);
                        cmdReplaceNull.Parameters.AddWithValue("@consignesup", consigneSup);
                        cmdReplaceNull.Parameters.AddWithValue("@consigneinf", consigneInf);
                        cmdReplaceNull.Parameters.AddWithValue("@frequence", frequence);
                        cmdReplaceNull.Parameters.AddWithValue("@sondenumeroserie", p_numeroSerie);
                        cmdReplaceNull.Parameters.AddWithValue("@idlieu", idLieu);
                        cmdReplaceNull.Parameters.AddWithValue("@estEtatAlarme", estEtatAlarme);
                        cmdReplaceNull.Parameters.AddWithValue("@planningactif", planningActif ? 1 : 0);
                        cmdReplaceNull.Parameters.AddWithValue("@toleranceSeconds", nullMatchToleranceSeconds);
                        replacedNull = cmdReplaceNull.ExecuteNonQuery() > 0;
                    }

                    if (!replacedNull)
                    {
                        using (var cmdMeasure = CreateCommand(
                            _connectionMeasure,
                            "INSERT INTO tm_mesures " +
                            "(Id_Serveur_BDD, Date_Heure_Mesure, Valeur, Valeur_Brute, Est_Valeur_Memoire, Consigne, Consigne_Sup, Consigne_Inf, Unite, Frequence, Sonde_Numero_Serie, Id_Lieu, Est_Etat_Alarme, Planning_Regle_Existe, Planning_Actif) " +
                            "VALUES " +
                            "(@idserveurbdd, @dateheuremesure, @valeur, @resistance, 1, @consigne, @consignesup, @consigneinf, @unite, @frequence, @sondenumeroserie, @idlieu, @estEtatAlarme, @planningactif, @planningactif)"))
                        {
                            cmdMeasure.Parameters.AddWithValue("@idserveurbdd", idServeurBdd);
                            cmdMeasure.Parameters.AddWithValue("@dateheuremesure", measureDateTime);
                            cmdMeasure.Parameters.AddWithValue("@valeur", p_valeur);
                            cmdMeasure.Parameters.AddWithValue("@resistance", (object)p_resistance ?? DBNull.Value);
                            cmdMeasure.Parameters.AddWithValue("@unite", p_unite);
                            cmdMeasure.Parameters.AddWithValue("@consigne", consigne);
                            cmdMeasure.Parameters.AddWithValue("@consignesup", consigneSup);
                            cmdMeasure.Parameters.AddWithValue("@consigneinf", consigneInf);
                            cmdMeasure.Parameters.AddWithValue("@frequence", frequence);
                            cmdMeasure.Parameters.AddWithValue("@sondenumeroserie", p_numeroSerie);
                            cmdMeasure.Parameters.AddWithValue("@idlieu", idLieu);
                            cmdMeasure.Parameters.AddWithValue("@estEtatAlarme", estEtatAlarme);
                            cmdMeasure.Parameters.AddWithValue("@planningactif", planningActif ? 1 : 0);
                            cmdMeasure.ExecuteNonQuery();
                        }
                    }

                    using (var cmdUpdateLieu = CreateCommand(
                        _connectionMain,
                        "UPDATE t_lieu SET " +
                        "Derniere_Date_Heure = CASE WHEN Derniere_Date_Heure IS NULL OR Derniere_Date_Heure < @dateheuremesure THEN @dateheuremesure ELSE Derniere_Date_Heure END, " +
                        "Date_Heure_Derniere_Reponse = CASE WHEN Date_Heure_Derniere_Reponse IS NULL OR Date_Heure_Derniere_Reponse < @dateheuremesure THEN @dateheuremesure ELSE Date_Heure_Derniere_Reponse END, " +
                        "Date_Heure_Derniere_Reponse_Recue_OK = CASE WHEN @isok = 1 AND (Date_Heure_Derniere_Reponse_Recue_OK IS NULL OR Date_Heure_Derniere_Reponse_Recue_OK < @dateheuremesure) THEN @dateheuremesure ELSE Date_Heure_Derniere_Reponse_Recue_OK END, " +
                        "Derniere_Valeur = CASE WHEN Derniere_Date_Heure IS NULL OR Derniere_Date_Heure < @dateheuremesure THEN @valeur ELSE Derniere_Valeur END, " +
                        "Derniere_Unite = CASE WHEN Derniere_Date_Heure IS NULL OR Derniere_Date_Heure < @dateheuremesure THEN @unite ELSE Derniere_Unite END " +
                        "WHERE Id_Lieu = @idlieu;"))
                    {
                        cmdUpdateLieu.Parameters.AddWithValue("@dateheuremesure", measureDateTime);
                        cmdUpdateLieu.Parameters.AddWithValue("@valeur", p_valeur);
                        cmdUpdateLieu.Parameters.AddWithValue("@unite", p_unite);
                        cmdUpdateLieu.Parameters.AddWithValue("@isok", isInActiveThresholds ? 1 : 0);
                        cmdUpdateLieu.Parameters.AddWithValue("@idlieu", idLieu);
                        cmdUpdateLieu.ExecuteNonQuery();
                    }

                    VigitempServeur.Log($"(AddHistoricalMesureIfMissing MSSQL) mesure historisee serial={p_numeroSerie} date={measureDateTime:O} value={p_valeur.ToString(CultureInfo.InvariantCulture)}");
                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(AddHistoricalMesureIfMissing MSSQL) SQL Erreur: " + ex);
                    return false;
                }
            }
        }

        public bool UpdateLieuWirelessMetrics(string p_numeroSerie, int? batteryPercent, int? rssi)
        {
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
                    {
                        return false;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "UPDATE t_lieu SET Derniere_Val_Batterie = @battery, Derniere_Val_Rssi = @rssi WHERE Sonde_Numero_Serie = @serial;"))
                    {
                        cmd.Parameters.AddWithValue("@battery", batteryPercent.HasValue ? (object)batteryPercent.Value : DBNull.Value);
                        cmd.Parameters.AddWithValue("@rssi", rssi.HasValue ? (object)rssi.Value.ToString(CultureInfo.InvariantCulture) : DBNull.Value);
                        cmd.Parameters.AddWithValue("@serial", p_numeroSerie);
                        cmd.ExecuteNonQuery();
                    }

                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(UpdateLieuWirelessMetrics) SQL Server Erreur: " + ex.Message);
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
                    if (!EnsureConnected())
                    {
                        return false;
                    }

                    int idSonde;
                    int idLieu;
                    float consigne;
                    float consigneSup;
                    float consigneInf;
                    int frequence;
                    const int idServeurBdd = 1;
                    int estEtatAlarme;

                    using (var cmdMain = CreateCommand(
                        _connectionMain,
                        "SELECT Frequence, Consigne, " +
                        "Tolerance_Surveillance_Sup as Consigne_Sup, " +
                        "Tolerance_Surveillance_Inf as Consigne_Inf, " +
                        "Id_Lieu, t_lieu.Est_Lieu_En_Alarme, t_sonde.Id_Sonde FROM t_lieu " +
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
                                VigitempServeur.Log("[SONDE][DB] action=insert-null status=no-lieu serial=" + p_numeroSerie + " provider=mssql");
                                return false;
                            }

                            idSonde = (int)reader["Id_Sonde"];
                            idLieu = (int)reader["Id_Lieu"];
                            consigne = GetFloatOrDefault(reader["Consigne"]);
                            consigneSup = GetFloatOrDefault(reader["Consigne_Sup"]);
                            consigneInf = GetFloatOrDefault(reader["Consigne_Inf"]);
                            frequence = (int)reader["Frequence"];
                            estEtatAlarme = Convert.ToInt32(reader["Est_Lieu_En_Alarme"]);
                        }
                    }

                    var unit = string.IsNullOrWhiteSpace(p_unite) ? getLieuUnite(idLieu) : p_unite;
                    var now = DateTime.Now;
                    if (HasRecentMeasurement(p_numeroSerie, now, requireNonNullValue: false))
                    {
                        return false;
                    }

                    using (var cmdMeasure = CreateCommand(
                        _connectionMeasure,
                        "INSERT INTO tm_mesures " +
                        "(Id_Serveur_BDD, Date_Heure_Mesure, Valeur, Valeur_Brute, Consigne, Consigne_Sup, Consigne_Inf, Unite, Frequence, Sonde_Numero_Serie, Id_Lieu, Est_Etat_Alarme, Est_Valeur_Null) " +
                        "VALUES " +
                        "(@idserveurbdd, @dateheuremesure, @valeur, @resistance, @consigne, @consignesup, @consigneinf, @unite, @frequence, @sondenumeroserie, @idlieu, @estEtatAlarme, 1)"))
                    {
                        cmdMeasure.Parameters.AddWithValue("@idserveurbdd", idServeurBdd);
                        cmdMeasure.Parameters.AddWithValue("@dateheuremesure", now);
                        cmdMeasure.Parameters.AddWithValue("@valeur", DBNull.Value);
                        cmdMeasure.Parameters.AddWithValue("@resistance", DBNull.Value);
                        cmdMeasure.Parameters.AddWithValue("@unite", unit);
                        cmdMeasure.Parameters.AddWithValue("@consigne", consigne);
                        cmdMeasure.Parameters.AddWithValue("@consignesup", consigneSup);
                        cmdMeasure.Parameters.AddWithValue("@consigneinf", consigneInf);
                        cmdMeasure.Parameters.AddWithValue("@frequence", frequence);
                        cmdMeasure.Parameters.AddWithValue("@sondenumeroserie", p_numeroSerie);
                        cmdMeasure.Parameters.AddWithValue("@idlieu", idLieu);
                        cmdMeasure.Parameters.AddWithValue("@estEtatAlarme", estEtatAlarme);
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
                        estEtatAlarme,
                        1);

                    using (var cmdUpdateLieu = CreateCommand(
                        _connectionMain,
                        "UPDATE t_lieu SET " +
                        "Derniere_Date_Heure = @dateheuremesure, " +
                        "Derniere_Valeur = NULL, " +
                        "Derniere_Unite = @unite, " +
                        "Derniere_Valeur_Null = 1 " +
                        "WHERE Id_Lieu = @idlieu;"))
                    {
                        cmdUpdateLieu.Parameters.AddWithValue("@dateheuremesure", now);
                        cmdUpdateLieu.Parameters.AddWithValue("@unite", unit);
                        cmdUpdateLieu.Parameters.AddWithValue("@idlieu", idLieu);
                        cmdUpdateLieu.ExecuteNonQuery();
                    }

                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("[SONDE][DB] action=insert-null status=error serial=" + p_numeroSerie + " provider=mssql error=" + ex.Message);
                    return false;
                }
            }
        }

        private static int GetDuplicateGuardSeconds()
        {
            return Math.Max(0, GetSettingInt("Vigitemp.Measurements.DuplicateGuardSeconds", 10));
        }

        private bool HasRecentMeasurement(string serial, DateTime now, bool requireNonNullValue)
        {
            var guardSeconds = GetDuplicateGuardSeconds();
            if (guardSeconds <= 0 || string.IsNullOrWhiteSpace(serial))
            {
                return false;
            }

            using (var cmd = CreateCommand(
                _connectionMeasure,
                "SELECT TOP 1 1 FROM tm_mesures " +
                "WHERE Sonde_Numero_Serie = @serial " +
                "AND Date_Heure_Mesure >= @since " +
                (requireNonNullValue ? "AND Valeur IS NOT NULL " : string.Empty) +
                "ORDER BY Date_Heure_Mesure DESC;"))
            {
                cmd.Parameters.AddWithValue("@serial", serial);
                cmd.Parameters.AddWithValue("@since", now.AddSeconds(-guardSeconds));
                var existing = cmd.ExecuteScalar();
                return existing != null && existing != DBNull.Value;
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
                VigitempServeur.Log("[CACHE][GRAPH] status=error provider=mssql idSonde=" + idSonde + " error=" + ex.Message);
            }
        }

        public List<SondeScheduleInfo> getSondesActivesByServeur(int idServeur)
        {
            return getSondesActivesInternal();
        }

        public List<SondeScheduleInfo> getSondesActivesAllServeurs()
        {
            return getSondesActivesInternal();
        }

        public bool isSondeAvailableForSurveillance(int idLieu, string sondeNumeroSerie)
        {
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
                    {
                        return true;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT COUNT(*) " +
                        "FROM t_lieu " +
                        "INNER JOIN t_sonde ON t_sonde.Sonde_Numero_Serie = t_lieu.Sonde_Numero_Serie " +
                        "WHERE t_lieu.Id_Lieu = @idLieu " +
                        "AND t_sonde.Sonde_Numero_Serie = @serial " +
                        "AND t_lieu.Lieu_Etat = 'S' " +
                        "AND t_sonde.Etat_Sonde = 'S' " +
                        "AND ISNULL(t_sonde.Metrologie_en_cours, 0) = 0;"))
                    {
                        cmd.Parameters.AddWithValue("@idLieu", idLieu);
                        cmd.Parameters.AddWithValue("@serial", sondeNumeroSerie ?? string.Empty);
                        return Convert.ToInt32(cmd.ExecuteScalar()) > 0;
                    }
                }
                catch (Exception ex)
                {
                    // A database read failure must not suspend all normal surveillance.
                    VigitempServeur.Log($"[SCHEDULER][STATE-CHECK] status=error provider=mssql idLieu={idLieu} serial={sondeNumeroSerie} error={ex.Message}");
                    return true;
                }
            }
        }

        public bool isSondeInNoResponse(int idLieu, string sondeNumeroSerie)
        {
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
                    {
                        return true;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT TOP 1 1 FROM t_lieu " +
                        "WHERE Id_Lieu = @idLieu " +
                        "AND Sonde_Numero_Serie = @serial " +
                        "AND (" +
                        "  ISNULL(Derniere_Valeur_Null, 0) = 1 " +
                        "  OR EXISTS (" +
                        "    SELECT 1 FROM t_alarme " +
                        "    WHERE t_alarme.Id_Lieu = t_lieu.Id_Lieu " +
                        "    AND t_alarme.Type IN ('N', 'M') " +
                        "    AND t_alarme.Date_Heure_Fin IS NULL" +
                        "  )" +
                        ");"))
                    {
                        cmd.Parameters.AddWithValue("@idLieu", idLieu);
                        cmd.Parameters.AddWithValue("@serial", sondeNumeroSerie ?? string.Empty);
                        var scalar = cmd.ExecuteScalar();
                        return scalar != null && scalar != DBNull.Value;
                    }
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log(
                        $"[SONDE][STATE-CHECK] status=error provider=mssql idLieu={idLieu} serial={sondeNumeroSerie} error={ex.Message}");
                    return true;
                }
            }
        }

        private List<SondeScheduleInfo> getSondesActivesInternal()
        {
            lock (_lock)
            {
                var list = new List<SondeScheduleInfo>();

                try
                {
                    if (!EnsureConnected())
                    {
                        return list;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT t_lieu.Id_Lieu, t_lieu.Frequence, t_lieu.Derniere_Date_Heure, " +
                        "t_lieu.Infos_Modifiees_Depuis_Derniere_Mesure, ISNULL(t_lieu.Est_Remontee_Memoire_A_Faire, 0) AS Est_Remontee_Memoire_A_Faire, t_lieu.EMT_Choix_Mode, t_lieu.Est_Correction_Ej, " +
                        "t_module.Port_Serie, t_module.Module_Numero_Serie, t_module.Type_Module, t_module.Id_Worker AS Id_Worker, " +
                        "t_sonde.Sonde_Numero_Serie, t_sonde.Sonde_Type, tt.Famille_Sonde, t_sonde.Adresse_Sonde, t_sonde.Sonde_Offset, " +
                        "ta.Coeff_X, ta.Coeff_Constant, te.Err_Justesse, te.Incertitude, te.Date_Validite " +
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
                        "WHERE t_lieu.Lieu_Etat = 'S' " +
                        "AND t_sonde.Etat_Sonde = 'S' " +
                        "AND ISNULL(t_sonde.Est_Sonde_GSO, 0) = 0;"))
                    {
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
                                    GspRecoveryPending = GetOptionalBool(reader, "Est_Remontee_Memoire_A_Faire", false),
                                    PortSerie = "COM" + reader["Port_Serie"].ToString(),
                                    ModuleNumeroSerie = reader["Module_Numero_Serie"].ToString(),
                                    ModuleType = GetNullableInt(reader, "Type_Module"),
                                    ManualWorkerId = GetNullableInt(reader, "Id_Worker"),
                                    SondeNumeroSerie = reader["Sonde_Numero_Serie"].ToString(),
                                    SondeType = reader["Sonde_Type"] == DBNull.Value ? string.Empty : reader["Sonde_Type"].ToString(),
                                    FamilleSonde = reader["Famille_Sonde"] == DBNull.Value ? string.Empty : reader["Famille_Sonde"].ToString(),
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

                    return list;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getSondesActivesInternal MSSQL) SQL Erreur: " + ex);
                    return list;
                }
            }
        }

        public (string portSerie, string sondeNumeroSerie, string sondeType, string familleSonde, string sondeAdresse, string moduleNumeroSerie, int? moduleType) getInfosByIdLieu(int p_idLieu)
        {
            lock (_lock)
            {
                try
                {
                    string portSerie = "";
                    string sondeNumeroSerie = "";
                    string sondeType = "";
                    string familleSonde = "";
                    string sondeAdresse = "";
                    string moduleNumeroSerie = "";
                    int? moduleType = null;

                    if (!EnsureConnected())
                    {
                        return (portSerie, sondeNumeroSerie, sondeType, familleSonde, sondeAdresse, moduleNumeroSerie, moduleType);
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT t_module.Port_Serie, t_module.Module_Numero_Serie, t_module.Type_Module, t_sonde.Sonde_Numero_Serie, t_sonde.Sonde_Type, tt.Famille_Sonde, t_sonde.Adresse_Sonde FROM t_lieu " +
                        "INNER JOIN t_sonde ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                        "INNER JOIN t_module ON t_sonde.Id_Module = t_module.Id_Module " +
                        "LEFT JOIN t_sonde_type tt ON tt.Sonde_Type = t_sonde.Sonde_Type " +
                        "WHERE t_lieu.Id_Lieu = @idLieu;"))
                    {
                        cmd.Parameters.AddWithValue("@idLieu", p_idLieu);
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                portSerie = "COM" + reader["Port_Serie"].ToString();
                                sondeNumeroSerie = reader["Sonde_Numero_Serie"].ToString();
                                sondeType = reader["Sonde_Type"] == DBNull.Value ? string.Empty : reader["Sonde_Type"].ToString();
                                familleSonde = reader["Famille_Sonde"] == DBNull.Value ? string.Empty : reader["Famille_Sonde"].ToString();
                                sondeAdresse = reader["Adresse_Sonde"].ToString();
                                moduleNumeroSerie = reader["Module_Numero_Serie"].ToString();
                                moduleType = reader["Type_Module"] == DBNull.Value ? (int?)null : Convert.ToInt32(reader["Type_Module"]);
                            }
                        }
                    }

                    return (portSerie, sondeNumeroSerie, sondeType, familleSonde, sondeAdresse, moduleNumeroSerie, moduleType);
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getInfosByIdLieu MSSQL) SQL Erreur: " + ex);
                    return ("", "", "", "", "", "", null);
                }
            }
        }

        public List<int> getDistinctIdServeur()
        {
            lock (_lock)
            {
                var workerIds = new List<int>();

                try
                {
                    if (!EnsureConnected())
                    {
                        return workerIds;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT DISTINCT Id_Worker AS Id_Worker FROM t_module WHERE Id_Worker IS NOT NULL AND Id_Worker > 0;"))
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            var workerId = GetNullableInt(reader, "Id_Worker");
                            if (workerId > 0)
                            {
                                workerIds.Add(workerId);
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getDistinctIdServeur MSSQL) SQL Erreur: " + ex);
                }

                return workerIds.Distinct().OrderBy(id => id).ToList();
            }
        }

        public (List<int>, List<DateTime>) getLieuxAvecAlarmesEnSnooze()
        {
            lock (_lock)
            {
                var ids = new List<int>();
                var dates = new List<DateTime>();

                if (!EnsureConnected())
                {
                    return (ids, dates);
                }

                using (var cmd = CreateCommand(_connectionMain, "SELECT distinct Id_Lieu, Date_Heure_Reactivation_Alarme FROM t_lieu where Date_Heure_Reactivation_Alarme is not null AND Date_Heure_Reactivation_Alarme <= GETDATE();"))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        ids.Add(Int32.Parse(reader["Id_Lieu"].ToString()));
                        dates.Add(DateTime.Parse(reader["Date_Heure_Reactivation_Alarme"].ToString()));
                    }
                }

                return (ids, dates);
            }
        }

        public (List<int>, List<DateTime>) getLieuxAvecSurveillanceEnSnooze()
        {
            lock (_lock)
            {
                var ids = new List<int>();
                var dates = new List<DateTime>();

                if (!EnsureConnected())
                {
                    return (ids, dates);
                }

                using (var cmd = CreateCommand(
                    _connectionMain,
                    "SELECT distinct Id_Lieu, Date_Heure_Reactivation_Surveillance FROM t_lieu " +
                    "where Date_Heure_Reactivation_Surveillance is not null AND Lieu_Etat = 'D' AND Date_Heure_Reactivation_Surveillance <= GETDATE();"))
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

                return (ids, dates);
            }
        }

        public string getLieuUnite(int idLieu)
        {
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
                    {
                        return "";
                    }

                    using (var cmd = CreateCommand(_connectionMain, "SELECT Derniere_Unite FROM t_lieu WHERE Id_Lieu = @idLieu;"))
                    {
                        cmd.Parameters.AddWithValue("@idLieu", idLieu);
                        var result = cmd.ExecuteScalar();
                        return result == null || result == DBNull.Value ? "" : result.ToString();
                    }
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getLieuUnite MSSQL) SQL Erreur: " + ex.Message);
                    return "";
                }
            }
        }

        public string getParameterValue(string section, string motCle)
        {
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
                    {
                        return null;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT TOP 1 Valeur FROM t_parametre " +
                        "WHERE UPPER(Section) = UPPER(@section) AND UPPER(Mot_Cle) = UPPER(@motCle);"))
                    {
                        cmd.Parameters.AddWithValue("@section", section ?? string.Empty);
                        cmd.Parameters.AddWithValue("@motCle", motCle ?? string.Empty);
                        var result = cmd.ExecuteScalar();
                        return result == null || result == DBNull.Value ? null : result.ToString();
                    }
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getParameterValue MSSQL) SQL Erreur: " + ex.Message);
                    return null;
                }
            }
        }

        public (double value, string unit, bool hasValue) getLastMeasureWithUnit(int idLieu)
        {
            lock (_lock)
            {
                double value = 0.0;
                string unit = "";
                bool hasValue = false;

                if (!EnsureConnected())
                {
                    return (value, unit, hasValue);
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
                                hasValue = true;
                            }

                            var rawUnit = reader["Unite"];
                            if (rawUnit != null && rawUnit != DBNull.Value)
                            {
                                unit = rawUnit.ToString();
                            }
                        }
                    }
                }

                return (value, unit, hasValue);
            }
        }
        public bool setAlarmeByIdLieu(int p_idLieu, bool p_valeur)
        {
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
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

                    return true;
                }
                catch
                {
                    VigitempServeur.Log("ERREUR : IMPOSSIBLE DE CHANGER LE REGLAGE DE NOTIFICATION POUR LE LIEU IdLieu: " + p_idLieu);
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
                    if (!EnsureConnected())
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

                    return true;
                }
                catch (Exception ex)
                {
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
                    if (!EnsureConnected())
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

                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(writeAuditJournal MSSQL) SQL Erreur: " + ex.Message);
                    return false;
                }
            }
        }

        public bool setLieuAlarmFlags(int idLieu, bool isPreAlarm, bool isAlarm)
        {
            lock (_lock)
            {
                if (!EnsureConnected())
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
            }
        }

        public bool setLieuInfosModifiees(int idLieu, bool value)
        {
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
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

                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(setLieuInfosModifiees MSSQL) SQL Erreur: " + ex.Message);
                    return false;
                }
            }
        }

        public bool setLieuGspRecoveryPending(int idLieu, bool value)
        {
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
                    {
                        return false;
                    }

                    using (var cmd = CreateCommand(_connectionMain,
                        "UPDATE t_lieu SET Est_Remontee_Memoire_A_Faire = @value WHERE Id_Lieu = @idLieu;"))
                    {
                        cmd.Parameters.AddWithValue("@value", value ? 1 : 0);
                        cmd.Parameters.AddWithValue("@idLieu", idLieu);
                        cmd.ExecuteNonQuery();
                    }

                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(setLieuGspRecoveryPending MSSQL) SQL Erreur: " + ex.Message);
                    return false;
                }
            }
        }

        public bool addGspRecoverySpan(int idLieu, string serialNumber, DateTime recoverFromProbeDateTime, DateTime recoverUntilProbeDateTime)
        {
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
                    {
                        return false;
                    }

                    var normalizedSerial = (serialNumber ?? string.Empty).Trim();
                    if (idLieu <= 0 || string.IsNullOrWhiteSpace(normalizedSerial) || recoverUntilProbeDateTime <= recoverFromProbeDateTime)
                    {
                        return false;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMeasure,
                        "INSERT INTO dbo.[tm_remontee_plage_gsp] " +
                        "([Id_Lieu], [GSP_SN], [Date_Heure_Debut], [Date_Heure_Fin], [Statut], [Date_Creation], [Date_Derniere_Maj], [Nb_Tentatives], [Derniere_Erreur]) " +
                        "VALUES " +
                        "(@idLieu, @serial, @dateDebut, @dateFin, 'A_FAIRE', GETDATE(), GETDATE(), 0, NULL);"))
                    {
                        cmd.Parameters.AddWithValue("@idLieu", idLieu);
                        cmd.Parameters.AddWithValue("@serial", normalizedSerial);
                        cmd.Parameters.AddWithValue("@dateDebut", recoverFromProbeDateTime);
                        cmd.Parameters.AddWithValue("@dateFin", recoverUntilProbeDateTime);
                        cmd.ExecuteNonQuery();
                    }

                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(addGspRecoverySpan MSSQL) SQL Erreur: " + ex.Message);
                    return false;
                }
            }
        }

        public List<GspRecoverySpan> getPendingGspRecoverySpans(int idLieu, string serialNumber)
        {
            lock (_lock)
            {
                var result = new List<GspRecoverySpan>();
                try
                {
                    if (!EnsureConnected())
                    {
                        return result;
                    }

                    var normalizedSerial = (serialNumber ?? string.Empty).Trim();
                    if (idLieu <= 0 || string.IsNullOrWhiteSpace(normalizedSerial))
                    {
                        return result;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMeasure,
                        "SELECT [Id], [Id_Lieu], [GSP_SN], [Date_Heure_Debut], [Date_Heure_Fin], [Statut], [Date_Creation], [Date_Derniere_Maj], [Nb_Tentatives], [Derniere_Erreur] " +
                        "FROM dbo.[tm_remontee_plage_gsp] " +
                        "WHERE [Id_Lieu] = @idLieu AND [GSP_SN] = @serial AND [Statut] = 'A_FAIRE' " +
                        "ORDER BY [Date_Heure_Debut] ASC, [Id] ASC;"))
                    {
                        cmd.Parameters.AddWithValue("@idLieu", idLieu);
                        cmd.Parameters.AddWithValue("@serial", normalizedSerial);
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                result.Add(new GspRecoverySpan
                                {
                                    Id = Convert.ToInt32(reader["Id"]),
                                    IdLieu = Convert.ToInt32(reader["Id_Lieu"]),
                                    Serial = reader["GSP_SN"]?.ToString(),
                                    RecoverFromProbeDateTime = Convert.ToDateTime(reader["Date_Heure_Debut"]),
                                    RecoverUntilProbeDateTime = Convert.ToDateTime(reader["Date_Heure_Fin"]),
                                    Status = reader["Statut"]?.ToString(),
                                    CreatedAt = Convert.ToDateTime(reader["Date_Creation"]),
                                    UpdatedAt = reader["Date_Derniere_Maj"] == DBNull.Value ? (DateTime?)null : Convert.ToDateTime(reader["Date_Derniere_Maj"]),
                                    AttemptCount = reader["Nb_Tentatives"] == DBNull.Value ? 0 : Convert.ToInt32(reader["Nb_Tentatives"]),
                                    LastError = reader["Derniere_Erreur"] == DBNull.Value ? null : reader["Derniere_Erreur"].ToString()
                                });
                            }
                        }
                    }

                    return result;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getPendingGspRecoverySpans MSSQL) SQL Erreur: " + ex.Message);
                    return result;
                }
            }
        }

        public bool setGspRecoverySpansStatus(IEnumerable<int> spanIds, string status, string lastError = null, bool incrementAttempts = false)
        {
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
                    {
                        return false;
                    }

                    var ids = (spanIds ?? Enumerable.Empty<int>()).Where(id => id > 0).Distinct().ToList();
                    if (ids.Count == 0 || string.IsNullOrWhiteSpace(status))
                    {
                        return true;
                    }

                    using (var cmd = _connectionMeasure.CreateCommand())
                    {
                        var parameterNames = new List<string>(ids.Count);
                        for (var index = 0; index < ids.Count; index++)
                        {
                            var parameterName = "@id" + index;
                            parameterNames.Add(parameterName);
                            cmd.Parameters.AddWithValue(parameterName, ids[index]);
                        }

                        cmd.CommandText =
                            "UPDATE dbo.[tm_remontee_plage_gsp] " +
                            "SET [Statut] = @status, " +
                            "[Date_Derniere_Maj] = GETDATE(), " +
                            "[Derniere_Erreur] = @lastError, " +
                            "[Nb_Tentatives] = [Nb_Tentatives] + @incrementAttempts " +
                            "WHERE [Id] IN (" + string.Join(", ", parameterNames) + ");";
                        cmd.Parameters.AddWithValue("@status", status.Trim().ToUpperInvariant());
                        cmd.Parameters.AddWithValue("@lastError", string.IsNullOrWhiteSpace(lastError) ? (object)DBNull.Value : lastError.Trim());
                        cmd.Parameters.AddWithValue("@incrementAttempts", incrementAttempts ? 1 : 0);
                        cmd.ExecuteNonQuery();
                    }

                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(setGspRecoverySpansStatus MSSQL) SQL Erreur: " + ex.Message);
                    return false;
                }
            }
        }

        public bool hasPendingGspRecoverySpans(int idLieu, string serialNumber)
        {
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
                    {
                        return false;
                    }

                    var normalizedSerial = (serialNumber ?? string.Empty).Trim();
                    if (idLieu <= 0 || string.IsNullOrWhiteSpace(normalizedSerial))
                    {
                        return false;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMeasure,
                        "SELECT TOP 1 1 " +
                        "FROM dbo.[tm_remontee_plage_gsp] " +
                        "WHERE [Id_Lieu] = @idLieu AND [GSP_SN] = @serial AND [Statut] <> 'TRAITEE';"))
                    {
                        cmd.Parameters.AddWithValue("@idLieu", idLieu);
                        cmd.Parameters.AddWithValue("@serial", normalizedSerial);
                        var scalar = cmd.ExecuteScalar();
                        return scalar != null && scalar != DBNull.Value;
                    }
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(hasPendingGspRecoverySpans MSSQL) SQL Erreur: " + ex.Message);
                    return false;
                }
            }
        }

        public bool hasBlockingGspRecoveryAlarm(int idLieu)
        {
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
                    {
                        return true;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT TOP 1 1 FROM t_alarme " +
                        "WHERE Id_Lieu = @idLieu AND Type IN ('N', 'M', 'A', 'S') AND Date_Heure_Fin IS NULL;"))
                    {
                        cmd.Parameters.AddWithValue("@idLieu", idLieu);
                        var scalar = cmd.ExecuteScalar();
                        return scalar != null && scalar != DBNull.Value;
                    }
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(hasBlockingGspRecoveryAlarm MSSQL) SQL Erreur: " + ex.Message);
                    return true;
                }
            }
        }

        public int resetInProgressGspRecoverySpans()
        {
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
                    {
                        return 0;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMeasure,
                        "UPDATE dbo.[tm_remontee_plage_gsp] " +
                        "SET [Statut] = 'A_FAIRE', [Date_Derniere_Maj] = GETDATE(), [Derniere_Erreur] = @lastError " +
                        "WHERE [Statut] = 'EN_COURS';"))
                    {
                        cmd.Parameters.AddWithValue("@lastError", "server-restart");
                        return cmd.ExecuteNonQuery();
                    }
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(resetInProgressGspRecoverySpans MSSQL) SQL Erreur: " + ex.Message);
                    return 0;
                }
            }
        }

        public bool setNonResponseAlarm(int idLieu, string sondeNumeroSerie, bool isActive)
        {
            return setTechnicalAlarm(idLieu, sondeNumeroSerie, "N", isActive, "setNonResponseAlarm MSSQL");
        }

        public bool? getPowerAlarmActiveState(int idLieu)
        {
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
                    {
                        return null;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT TOP 1 1 FROM t_alarme " +
                        "WHERE Id_Lieu = @idLieu AND Type IN ('A', 'S') AND Date_Heure_Fin IS NULL " +
                        "ORDER BY Date_Heure_Debut DESC;"))
                    {
                        cmd.Parameters.AddWithValue("@idLieu", idLieu);
                        var result = cmd.ExecuteScalar();
                        return result != null && result != DBNull.Value;
                    }
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getPowerAlarmActiveState MSSQL) SQL Erreur: " + ex.Message);
                    return null;
                }
            }
        }

        public bool setPowerAlarm(int idLieu, string sondeNumeroSerie, bool isActive)
        {
            return setTechnicalAlarm(idLieu, sondeNumeroSerie, "A", isActive, "setPowerAlarm MSSQL");
        }

        public bool setModuleAlarm(int idLieu, string sondeNumeroSerie, bool isActive)
        {
            return setTechnicalAlarm(idLieu, sondeNumeroSerie, "M", isActive, "setModuleAlarm MSSQL");
        }

        private bool setTechnicalAlarm(int idLieu, string sondeNumeroSerie, string alarmType, bool isActive, string logContext)
        {
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
                    {
                        return false;
                    }

                    int? alarmId = null;
                    var typeFilterSql = alarmType == "A" ? "Type IN ('A','S')" : "Type = @type";

                    if (isActive)
                    {
                        var alarmUnit = getLieuUnite(idLieu) ?? string.Empty;
                        using (var cmdCheck = CreateCommand(
                            _connectionMain,
                            "SELECT TOP 1 Id_Alarme FROM t_alarme " +
                            "WHERE Id_Lieu = @idLieu AND " + typeFilterSql + " AND Date_Heure_Fin IS NULL " +
                            "ORDER BY Date_Heure_Debut DESC;"))
                        {
                            cmdCheck.Parameters.AddWithValue("@idLieu", idLieu);
                            cmdCheck.Parameters.AddWithValue("@type", alarmType);
                            var existing = cmdCheck.ExecuteScalar();

                            if (existing == null || existing == DBNull.Value)
                            {
                                using (var cmdInsert = CreateCommand(
                                    _connectionMain,
                                    "INSERT INTO t_alarme " +
                                    "(Date_Heure_Debut, Valeur, Type, Id_Lieu, Sonde_Numero_Serie, Unite, " +
                                    "Est_Acquittee, Date_Heure_Derniere_Mesure, Est_Alarme_Pour_VigiTel, Est_Mail_Envoye, Est_Tel_Acquittee) " +
                                    "VALUES (GETDATE(), NULL, @type, @idLieu, @serie, @unite, 0, GETDATE(), 0, 0, 0);"))
                                {
                                    cmdInsert.Parameters.AddWithValue("@idLieu", idLieu);
                                    cmdInsert.Parameters.AddWithValue("@type", alarmType);
                                    cmdInsert.Parameters.AddWithValue("@serie", sondeNumeroSerie ?? string.Empty);
                                    cmdInsert.Parameters.AddWithValue("@unite", alarmUnit);
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
                                    "UPDATE t_alarme SET Date_Heure_Derniere_Mesure = GETDATE(), Unite = @unite, " +
                                    "Est_Acquittee = 0, Est_Tel_Acquittee = 0 " +
                                    "WHERE Id_Alarme = @idAlarme;"))
                                {
                                    alarmId = Convert.ToInt32(existing);
                                    cmdUpdate.Parameters.AddWithValue("@idAlarme", alarmId.Value);
                                    cmdUpdate.Parameters.AddWithValue("@unite", alarmUnit);
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
                            "SET Date_Heure_Fin = GETDATE() " +
                            "WHERE Id_Lieu = @idLieu AND " + typeFilterSql + " AND Date_Heure_Fin IS NULL;"))
                        {
                            cmdResolve.Parameters.AddWithValue("@idLieu", idLieu);
                            cmdResolve.Parameters.AddWithValue("@type", alarmType);
                            updated = cmdResolve.ExecuteNonQuery();
                        }

                        var autoAcknowledged = alarmType == "N" && AutoAcknowledgeEndedNonResponseAlarms(idLieu);
                        if (!autoAcknowledged)
                        {
                            UpdateLieuEndedFlag(idLieu);
                        }
                        if (updated > 0)
                        {
                            _ = AlarmWebNotifier.NotifyRealtimeAlarmAsync(null, idLieu, "ended");
                        }
                    }

                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(" + logContext + ") SQL Erreur: " + ex.Message);
                    return false;
                }
            }
        }

        private bool AutoAcknowledgeEndedNonResponseAlarms(int idLieu)
        {
            using (var cmdEnabled = CreateCommand(
                _connectionMain,
                "SELECT TOP 1 Est_Acq_Auto_Alarme_NR FROM t_lieu WHERE Id_Lieu = @idLieu;"))
            {
                cmdEnabled.Parameters.AddWithValue("@idLieu", idLieu);
                var enabled = cmdEnabled.ExecuteScalar();
                if (enabled == null || enabled == DBNull.Value || !Convert.ToBoolean(enabled))
                {
                    return false;
                }
            }

            using (var transaction = _connectionMain.BeginTransaction())
            {
                try
                {
                    using (var cmdDelete = CreateCommand(
                        _connectionMain,
                        "DELETE FROM t_alarme " +
                        "WHERE Id_Lieu = @idLieu AND Type = 'N' AND Date_Heure_Fin IS NOT NULL " +
                        "AND ISNULL(Est_Acquittee, 0) = 0;"))
                    {
                        cmdDelete.Transaction = transaction;
                        cmdDelete.Parameters.AddWithValue("@idLieu", idLieu);
                        cmdDelete.ExecuteNonQuery();
                    }

                    using (var cmdLieu = CreateCommand(
                        _connectionMain,
                        "UPDATE t_lieu SET Id_Alarme = 0, Est_Lieu_En_Alarme = 0, " +
                        "Est_Lieu_Alarme_Terminee_Non_Acquittee = 0 " +
                        "WHERE Id_Lieu = @idLieu;"))
                    {
                        cmdLieu.Transaction = transaction;
                        cmdLieu.Parameters.AddWithValue("@idLieu", idLieu);
                        cmdLieu.ExecuteNonQuery();
                    }

                    transaction.Commit();
                    return true;
                }
                catch
                {
                    try { transaction.Rollback(); } catch { /* ignore */ }
                    throw;
                }
            }
        }

        public bool setThresholdAlarm(int idLieu, string sondeNumeroSerie, string type, double value, string unite, bool isActive)
        {
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
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
                                    "(Date_Heure_Debut, Valeur, Type, Id_Lieu, Sonde_Numero_Serie, Unite, " +
                                    "Est_Acquittee, Date_Heure_Derniere_Mesure, Est_Alarme_Pour_VigiTel, Est_Mail_Envoye, Est_Tel_Acquittee) " +
                                    "VALUES (GETDATE(), @valeur, @type, @idLieu, @serie, @unite, 0, GETDATE(), 0, 0, 0);"))
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
                                    "UPDATE t_alarme SET Valeur = @valeur, Unite = @unite, Date_Heure_Derniere_Mesure = GETDATE(), " +
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
                            "SET Date_Heure_Fin = GETDATE() " +
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

                    return true;
                }
                catch (Exception ex)
                {
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
                    if (!EnsureConnected())
                    {
                        return null;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT TOP 1 Id_Alarme, Type, Date_Heure_Debut, Date_Heure_Derniere_Mesure, Valeur, Unite " +
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
                                var dateDerniereMesure = reader["Date_Heure_Derniere_Mesure"] == DBNull.Value
                                    ? (DateTime?)null
                                    : Convert.ToDateTime(reader["Date_Heure_Derniere_Mesure"]);
                                var valeur = GetNullableDouble(reader, "Valeur");
                                var unite = reader["Unite"] == DBNull.Value ? null : reader["Unite"].ToString();

                                return new AlarmSummary(
                                    id,
                                    type,
                                    dateDebut,
                                    dateDerniereMesure,
                                    valeur,
                                    unite);
                            }
                        }
                    }

                    return null;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getActiveAlarmSummary MSSQL) SQL Erreur: " + ex.Message);
                    return null;
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
                    if (!EnsureConnected())
                    {
                        return false;
                    }

                    using (var cmd = CreateCommand(_connectionMain,
                        "SELECT ISNULL(Est_Redeclenchement_Immediat, 0) FROM t_lieu WHERE Id_Lieu = @idLieu;"))
                    {
                        cmd.Parameters.AddWithValue("@idLieu", idLieu);
                        var raw = cmd.ExecuteScalar();
                        if (raw == null || raw == DBNull.Value)
                        {
                            return false;
                        }

                        return Convert.ToInt32(raw) == 1;
                    }
                }
                catch (Exception ex)
                {
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
                    if (!EnsureConnected())
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
                    return true;
                }
                catch (Exception ex)
                {
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
                    if (!EnsureConnected())
                    {
                        return 0;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT MAX(a.Id_Alarme) " +
                        "FROM t_alarme a;"))
                    {
                        var result = cmd.ExecuteScalar();
                        if (result == null || result == DBNull.Value) return 0;
                        return Convert.ToInt32(result);
                    }
                }
                catch (Exception ex)
                {
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
                    if (!EnsureConnected())
                    {
                        return list;
                    }

                    var limit = Math.Max(1, maxCount);
                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT TOP (@limit) a.Id_Alarme, a.Id_Lieu, a.Type, a.Valeur, a.Unite, a.Date_Heure_Debut " +
                        "FROM t_alarme a " +
                        "WHERE a.Id_Alarme > @lastId " +
                        "AND a.Date_Heure_Debut IS NOT NULL " +
                        "ORDER BY a.Id_Alarme ASC;"))
                    {
                        cmd.Parameters.AddWithValue("@limit", limit);
                        cmd.Parameters.AddWithValue("@lastId", lastAlarmId);

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

                    return list;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getNewAlarmsSince MSSQL) SQL Erreur: " + ex.Message);
                    return list;
                }
            }
        }

        public List<AlarmNotificationItem> getUnsentOpenAlarms(int maxCount, DateTime? maxStartLocalTime = null)
        {
            lock (_lock)
            {
                var list = new List<AlarmNotificationItem>();
                try
                {
                    if (!EnsureConnected())
                    {
                        return list;
                    }

                    var limit = Math.Max(1, maxCount);
                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT TOP (@limit) a.Id_Alarme, a.Id_Lieu, a.Type, a.Valeur, a.Unite, a.Date_Heure_Debut " +
                        "FROM t_alarme a " +
                        "WHERE a.Date_Heure_Fin IS NULL " +
                        "AND ISNULL(a.Est_Mail_Envoye, 0) <> 1 " +
                        "AND a.Date_Heure_Debut IS NOT NULL " +
                        (maxStartLocalTime.HasValue ? "AND a.Date_Heure_Debut <= @maxStart " : string.Empty) +
                        "ORDER BY a.Id_Alarme ASC;"))
                    {
                        cmd.Parameters.AddWithValue("@limit", limit);
                        if (maxStartLocalTime.HasValue)
                        {
                            cmd.Parameters.AddWithValue("@maxStart", maxStartLocalTime.Value);
                        }

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

                    return list;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getUnsentOpenAlarms MSSQL) SQL Erreur: " + ex.Message);
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
                    if (!EnsureConnected())
                    {
                        return list;
                    }

                    var limit = Math.Max(1, maxCount);
                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT TOP (@limit) a.Id_Lieu, a.Id_Alarme " +
                        "FROM t_alarme a " +
                        "WHERE a.Date_Heure_Fin IS NOT NULL " +
                        "AND ISNULL(a.Est_Mail_Fin_Envoye, 0) <> 1 " +
                        "ORDER BY a.Date_Heure_Fin ASC, a.Id_Alarme ASC;"))
                    {
                        cmd.Parameters.AddWithValue("@limit", limit);

                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                var idLieu = Convert.ToInt32(reader["Id_Lieu"]);
                                var idAlarme = Convert.ToInt32(reader["Id_Alarme"]);
                                list.Add(new AlarmNotificationItem(idAlarme, idLieu, "T", null, null, null));
                            }
                        }
                    }

                    return list;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getEndedAlarmsSince MSSQL) SQL Erreur: " + ex.Message);
                    return list;
                }
            }
        }

        public bool markAlarmMailSent(int alarmId)
        {
            lock (_lock)
            {
                try
                {
                    if (alarmId <= 0)
                    {
                        return false;
                    }

                    if (!EnsureConnected())
                    {
                        return false;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "UPDATE t_alarme SET Est_Mail_Envoye = 1 WHERE Id_Alarme = @idAlarme;"))
                    {
                        cmd.Parameters.AddWithValue("@idAlarme", alarmId);
                        cmd.ExecuteNonQuery();
                    }

                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(markAlarmMailSent MSSQL) SQL Erreur: " + ex.Message + " | alarmId=" + alarmId);
                    return false;
                }
            }
        }

        public bool markAlarmEndMailSent(int alarmId)
        {
            lock (_lock)
            {
                try
                {
                    if (alarmId <= 0 || !EnsureConnected())
                    {
                        return false;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "UPDATE t_alarme SET Est_Mail_Fin_Envoye = 1 WHERE Id_Alarme = @idAlarme;"))
                    {
                        cmd.Parameters.AddWithValue("@idAlarme", alarmId);
                        return cmd.ExecuteNonQuery() > 0;
                    }
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(markAlarmEndMailSent MSSQL) SQL Erreur: " + ex.Message + " | alarmId=" + alarmId);
                    return false;
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
        public List<(int idLieu, bool isAlarm, bool isNonResponse)> getActiveLieuAlarmStates()
        {
            var result = new List<(int, bool, bool)>();
            lock (_lock)
            {
                try
                {
                    if (!EnsureConnected())
                    {
                        return result;
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT l.Id_Lieu, l.Est_Lieu_En_Alarme, " +
                        "CASE WHEN nr.Id_Lieu IS NOT NULL THEN 1 ELSE 0 END AS Has_Non_Reponse " +
                        "FROM t_lieu l " +
                        "LEFT JOIN (SELECT DISTINCT Id_Lieu FROM t_alarme WHERE Type = 'N' AND Date_Heure_Fin IS NULL) nr " +
                        "ON l.Id_Lieu = nr.Id_Lieu " +
                        "WHERE l.Est_Lieu_En_Alarme = 1 OR nr.Id_Lieu IS NOT NULL;"))
                    {
                        using (var dr = cmd.ExecuteReader())
                        {
                            while (dr.Read())
                            {
                                result.Add((
                                    Convert.ToInt32(dr["Id_Lieu"]),
                                    Convert.ToInt32(dr["Est_Lieu_En_Alarme"]) == 1,
                                    Convert.ToInt32(dr["Has_Non_Reponse"]) == 1));
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("getActiveLieuAlarmStates SQL Server error: " + ex.Message);
                }

                return result;
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

                if (!EnsureConnected())
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

                return settings;
            }
        }
    }
}





