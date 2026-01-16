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

        private static SqlConnection CreateConnection(string databaseName)
        {
            var host = GetSetting("Vigitemp.Db.Host", "127.0.0.1");
            var port = GetSetting("Vigitemp.Db.Port", "1433");
            var user = GetSetting("Vigitemp.Db.User", "sa");
            var password = GetSetting("Vigitemp.Db.Password", "");
            var connectionTimeout = GetSettingInt("Vigitemp.Db.ConnectionTimeoutSeconds", 5);

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
                Encrypt = false,
                TrustServerCertificate = true,
                Pooling = true
            };

            return new SqlConnection(builder.ConnectionString);
        }

        private static int GetCommandTimeout()
        {
            return GetSettingInt("Vigitemp.Db.CommandTimeoutSeconds", 30);
        }

        private bool InitConnexion()
        {
            VigitempServeur.Log("Tentative de connexion a la BDD (MSSQL)...");
            try
            {
                var mainDb = GetSetting("Vigitemp.Db.MainDatabase", "vigitemp");
                var mesureDb = GetSetting("Vigitemp.Db.MeasureDatabase", "vigitemp_mesure");

                CloseConnexion();

                _connectionMain = CreateConnection(mainDb);
                _connectionMain.Open();

                _connectionMeasure = CreateConnection(mesureDb);
                _connectionMeasure.Open();

                VigitempServeur.Log("Tentative reussie.");
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

                using (var cmd = CreateCommand(_connectionMain, "SELECT IdLieu FROM t_lieu WHERE SondeNumeroSerie = @serial;"))
                {
                    cmd.Parameters.AddWithValue("@serial", p_sondSerialNumber);
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            idLieu = reader.GetInt32(reader.GetOrdinal("IdLieu"));
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
                        notificationActive: false,
                        dateHeureReactivationAlarme: default(DateTime));
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
                            notificationActive: false,
                            dateHeureReactivationAlarme: default(DateTime));
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
        private LieuAlarmSettings ReadLieuAlarmSettingsV2(int idLieu)
        {
            var cmd = CreateCommand(
                _connectionMain,
                "SELECT " +
                "Id_Lieu, " +
                "Consigne_Inf, Est_Consigne_Inf_Active, Retard_Alarme_Bas, Consigne_Inf_Pre_Alarme, Est_Consigne_Inf_Pre_Alarme_Active, " +
                "Consigne_Sup, Est_Consigne_Sup_Active, Retard_Alarme_Haut, Consigne_Sup_Pre_Alarme, Est_Consigne_Sup_Pre_Alarme_Active " +
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
                        notificationActive: false,
                        dateHeureReactivationAlarme: default(DateTime));
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
                    notificationActive: true,
                    dateHeureReactivationAlarme: default(DateTime));
            }
        }

        private LieuAlarmSettings ReadLieuAlarmSettingsV1(int idLieu)
        {
            var cmd = CreateCommand(
                _connectionMain,
                "SELECT " +
                "IdLieu, " +
                "Consigne_Inf, Consigne_Sup, notification_active, DateHeure_reactivationAlarme, " +
                "Retard_Alarme_Bas, Retard_Alarme_Haut, " +
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
                        notificationActive: false,
                        dateHeureReactivationAlarme: default(DateTime));
                }

                var notificationActive = GetNullableBool(reader, "notification_active", false);
                var reactivationAt = GetNullableDateTime(reader, "DateHeure_reactivationAlarme");

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
                    notificationActive: notificationActive,
                    dateHeureReactivationAlarme: reactivationAt);
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

                    using (var cmd = CreateCommand(_connectionMain, "select AdresseIPConnexion from t_postes_clients"))
                    using (var reader = cmd.ExecuteReader())
                    {
                        while (reader.Read())
                        {
                            arrayIp.Add(reader["AdresseIPConnexion"].ToString());
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
                        "SELECT Frequence, Consigne, Consigne_Sup, Consigne_Inf, t_module.Id_Serveur, Nom_Lieu, IdLieu, t_lieu.SondeNumeroSerie, t_sonde.IdSonde FROM t_lieu " +
                        "INNER JOIN t_sonde ON t_lieu.SondeNumeroSerie = t_sonde.SondeNumeroSerie " +
                        "INNER JOIN t_module ON t_sonde.idModule = t_module.idModule " +
                        "WHERE t_lieu.SondeNumeroSerie = @serial;"))
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

                            idSonde = (int)reader["IdSonde"];
                            idLieu = (int)reader["IdLieu"];
                            consigne = float.Parse(reader["Consigne"].ToString());
                            consigneSup = float.Parse(reader["Consigne_Sup"].ToString());
                            consigneInf = float.Parse(reader["Consigne_Inf"].ToString());
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

        private void InsertMeasureToGraphique(
            int idSonde,
            int idLieu,
            string sondeNumeroSerie,
            double valeur,
            string unite,
            double resistance,
            float consigne,
            float consigneSup,
            float consigneInf,
            int frequence,
            int etatAlarme)
        {
            try
            {
                var cacheDb = GetSetting("Vigitemp.Db.MeasureCacheDatabase", GetSetting("Vigitemp.Db.MeasureDatabase", "vigitemp_mesure"));
                using (var connection = CreateConnection(cacheDb))
                {
                    connection.Open();
                    using (var cmd = CreateCommand(
                        connection,
                        "INSERT INTO tm_graphique " +
                        "(Date_Heure_Mesure, Valeur, Resistance, Consigne, Consigne_Sup, Consigne_Inf, " +
                        "Unite, Sonde_Numero_Serie, Id_Sonde, Id_Lieu, Frequence, Etat_Alarme, Valeur_Null) " +
                        "VALUES " +
                        "(@date, @valeur, @resistance, @consigne, @consigneSup, @consigneInf, " +
                        "@unite, @sondeNumeroSerie, @idSonde, @idLieu, @frequence, @etatAlarme, 0)"))
                    {
                        cmd.Parameters.AddWithValue("@date", DateTime.Now);
                        cmd.Parameters.AddWithValue("@valeur", valeur);
                        cmd.Parameters.AddWithValue("@resistance", resistance);
                        cmd.Parameters.AddWithValue("@consigne", consigne);
                        cmd.Parameters.AddWithValue("@consigneSup", consigneSup);
                        cmd.Parameters.AddWithValue("@consigneInf", consigneInf);
                        cmd.Parameters.AddWithValue("@unite", unite);
                        cmd.Parameters.AddWithValue("@sondeNumeroSerie", sondeNumeroSerie);
                        cmd.Parameters.AddWithValue("@idSonde", idSonde);
                        cmd.Parameters.AddWithValue("@idLieu", idLieu);
                        cmd.Parameters.AddWithValue("@frequence", frequence);
                        cmd.Parameters.AddWithValue("@etatAlarme", etatAlarme);
                        cmd.ExecuteNonQuery();
                    }
                }
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("(InsertMeasureToGraphique MSSQL) Erreur: " + ex.Message);
            }
        }
        public (List<string>, List<string>, List<string>, List<string>) getInfosByIdServeurAndFrequencies(int p_idServer, int p_frequence)
        {
            lock (_lock)
            {
                try
                {
                    var tmpPort = new List<string>();
                    var tmpSerial = new List<string>();
                    var tmpAdresse = new List<string>();
                    var tmpModule = new List<string>();

                    if (!InitConnexion())
                    {
                        CloseConnexion();
                        return (tmpPort, tmpSerial, tmpAdresse, tmpModule);
                    }

                    using (var cmd = CreateCommand(
                        _connectionMain,
                        "SELECT t_module.Port_serie, t_module.ModuleNumeroSerie, t_sonde.SondeNumeroSerie, t_sonde.Adresse_sonde FROM t_lieu " +
                        "INNER JOIN t_sonde ON t_lieu.SondeNumeroSerie = t_sonde.SondeNumeroSerie " +
                        "INNER JOIN t_module ON t_sonde.idModule = t_module.idModule " +
                        "WHERE t_lieu.Frequence = @frequence " +
                        "AND t_module.Id_Serveur = @idServeur " +
                        "AND t_lieu.Lieu_Etat = 'S';"))
                    {
                        cmd.Parameters.AddWithValue("@frequence", p_frequence);
                        cmd.Parameters.AddWithValue("@idServeur", p_idServer);
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                tmpPort.Add("COM" + reader["Port_serie"].ToString());
                                tmpSerial.Add(reader["SondeNumeroSerie"].ToString());
                                tmpAdresse.Add(reader["Adresse_sonde"].ToString());
                                tmpModule.Add(reader["ModuleNumeroSerie"].ToString());
                            }
                        }
                    }

                    CloseConnexion();
                    return (tmpPort, tmpSerial, tmpAdresse, tmpModule);
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(getInfosByIdServeurAndFrequencies MSSQL) SQL Erreur: " + ex);
                    return (new List<string>(), new List<string>(), new List<string>(), new List<string>());
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
                        "SELECT t_module.Port_serie, t_module.ModuleNumeroSerie, t_sonde.SondeNumeroSerie, t_sonde.Adresse_sonde FROM t_lieu " +
                        "INNER JOIN t_sonde ON t_lieu.SondeNumeroSerie = t_sonde.SondeNumeroSerie " +
                        "INNER JOIN t_module ON t_sonde.idModule = t_module.idModule " +
                        "WHERE t_lieu.IdLieu = @idLieu;"))
                    {
                        cmd.Parameters.AddWithValue("@idLieu", p_idLieu);
                        using (var reader = cmd.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                portSerie = "COM" + reader["Port_serie"].ToString();
                                sondeNumeroSerie = reader["SondeNumeroSerie"].ToString();
                                sondeAdresse = reader["Adresse_sonde"].ToString();
                                moduleNumeroSerie = reader["ModuleNumeroSerie"].ToString();
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

                using (var cmd = CreateCommand(_connectionMain, "SELECT distinct Id_Serveur FROM t_sonde where Etat_Sonde = 'S';"))
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
                    "INNER JOIN t_sonde ON t_lieu.SondeNumeroSerie = t_sonde.SondeNumeroSerie " +
                    "INNER JOIN t_module ON t_sonde.idModule = t_module.idModule " +
                    "where t_module.Id_Serveur = @idServeur " +
                    "AND t_lieu.Lieu_Etat = 'S';"))
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

                using (var cmd = CreateCommand(_connectionMain, "SELECT distinct IdLieu, DateHeure_reactivationAlarme FROM t_lieu where DateHeure_reactivationAlarme is not null;"))
                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        ids.Add(Int32.Parse(reader["IdLieu"].ToString()));
                        dates.Add(DateTime.Parse(reader["DateHeure_reactivationAlarme"].ToString()));
                    }
                }

                CloseConnexion();
                return (ids, dates);
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
                        "UPDATE t_lieu SET notification_active = @valeur, DateHeure_reactivationAlarme = NULL WHERE IdLieu = @idLieu;"))
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
                    "SELECT TOP 1 Coeff_X, Coeff_Constant FROM t_calibrage where SondeNumeroSerie = @serial ORDER BY DateHeureCalibrage DESC"))
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
    }
}
