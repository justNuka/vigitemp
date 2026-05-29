using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using System.Configuration;
using System.Diagnostics;
using System.Globalization;
using System.Linq;
using System.Threading;

namespace Vigitemp_Serveur
{
    class Database : IDatabaseProvider, IDisposable
    {
        private readonly object _lock = new object();
        private MySqlConnection connection_vigitemp;
        private MySqlConnection connection_vigitemp_mesure;

        // Constructeur
        public Database()
        {
            //this.InitConnexion();
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
            if (uint.TryParse(raw, NumberStyles.Integer, CultureInfo.InvariantCulture, out var value))
            {
                return value;
            }

            return defaultValue;
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

        private static MySqlConnection CreateConnection(string databaseName)
        {
            var host = GetSetting("Vigi.Db.Host", "192.168.63.144");
            var port = GetSettingUInt("Vigi.Db.Port", 3306);
            var user = GetSetting("Vigi.Db.User", "root");
            var password = GetSetting("Vigi.Db.Password", "pass");
            var connectionTimeout = GetSettingUInt("Vigi.Db.ConnectionTimeoutSeconds", 5);
            var commandTimeout = GetSettingUInt("Vigi.Db.CommandTimeoutSeconds", 30);

            var builder = new MySqlConnectionStringBuilder
            {
                Server = host,
                Port = port,
                Database = databaseName,
                UserID = user,
                Password = password,
                ConnectionTimeout = connectionTimeout,
                DefaultCommandTimeout = commandTimeout,
                Pooling = true,
            };

            return new MySqlConnection(builder.ConnectionString);
        }

        // M?thode pour initialiser la connexion 
        private bool InitConnexion()
        {
            try
            {
                var mainDb = GetSetting("Vigi.Db.MainDatabase", "vigitemp");
                var mesureDb = GetSetting("Vigi.Db.MeasureDatabase", "vigitemp_mesure");

                CloseConnexion();

                connection_vigitemp = CreateConnection(mainDb);
                connection_vigitemp.Open();

                connection_vigitemp_mesure = CreateConnection(mesureDb);
                connection_vigitemp_mesure.Open();
                return true;
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("Tentative ?chou?e! " + ex.Message);
                CloseConnexion();
                return false;
            }
           
        }

        private void CloseConnexion()
        {
            try { this.connection_vigitemp?.Close(); } catch { /* ignore */ }
            try { this.connection_vigitemp_mesure?.Close(); } catch { /* ignore */ }
            try { this.connection_vigitemp?.Dispose(); } catch { /* ignore */ }
            try { this.connection_vigitemp_mesure?.Dispose(); } catch { /* ignore */ }
            this.connection_vigitemp = null;
            this.connection_vigitemp_mesure = null;
        }

        private bool EnsureConnected()
        {
            lock (_lock)
            {
                try
                {
                    if (connection_vigitemp != null && connection_vigitemp.State == System.Data.ConnectionState.Open &&
                        connection_vigitemp_mesure != null && connection_vigitemp_mesure.State == System.Data.ConnectionState.Open)
                    {
                        return true;
                    }

                    CloseConnexion();

                    var mainDb = GetSetting("Vigi.Db.MainDatabase", "vigitemp");
                    var mesureDb = GetSetting("Vigi.Db.MeasureDatabase", "vigitemp_mesure");

                    connection_vigitemp = CreateConnection(mainDb);
                    connection_vigitemp.Open();

                    connection_vigitemp_mesure = CreateConnection(mesureDb);
                    connection_vigitemp_mesure.Open();

                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("EnsureConnected: connexion echouee: " + ex.Message);
                    CloseConnexion();
                    return false;
                }
            }
        }

        public void Dispose()
        {
            CloseConnexion();
        }

        public int getIDLieuBySerialNumber(string p_sondSerialNumber)
        {
            lock (_lock)
            {
                //int idLieu = 0;
                int idLieu_tmp = 0;

                if (!EnsureConnected())
                {
                    return idLieu_tmp;
                }

                using (var cmd_vigitemp = connection_vigitemp.CreateCommand())
                {
                    cmd_vigitemp.CommandText = "select Id_Lieu FROM t_lieu where Sonde_Numero_Serie = @serial;";
                    cmd_vigitemp.Parameters.AddWithValue("@serial", p_sondSerialNumber);

                    // Ex?cution de la commande SQL
                    using (var dr_IdLieu = cmd_vigitemp.ExecuteReader())
                    {
                        while (dr_IdLieu.Read())
                        {
                            idLieu_tmp = dr_IdLieu.GetInt32("Id_Lieu");
                        }
                    }
                }

                return idLieu_tmp;
            }
        }

        [Obsolete("Utiliser getLieuAlarmSettings / ReadLieuAlarmSettingsV2 a la place.")]
        public (List<float>, bool notificationActive, DateTime Date_Heure_Reactivation_Alarme) getConsignesLieux(int p_idLieu)
        {
            lock (_lock)
            {
                List<float> array_tmp = new List<float>();
                bool notificationActive_tmp = false;
                DateTime Date_Heure_Reactivation_Alarme_tmp = default(DateTime);

                if (!EnsureConnected())
                {
                    return (array_tmp, notificationActive_tmp, Date_Heure_Reactivation_Alarme_tmp);
                }

                using (var cmd_vigitemp = connection_vigitemp.CreateCommand())
                {
                    cmd_vigitemp.CommandText = "select " +
                                                "Tolerance_Surveillance_Sup as Consigne_Sup, " +
                                                "Tolerance_Surveillance_Inf as Consigne_Inf, " +
                                                "Notification_Active, Date_Heure_Reactivation_Alarme from t_lieu " +
                                                "where Id_Lieu= @idLieu;";
                    cmd_vigitemp.Parameters.AddWithValue("@idLieu", p_idLieu);

                    // Ex?cution de la commande SQL
                    using (var dr_ConsignesLieux = cmd_vigitemp.ExecuteReader())
                    {
                        while (dr_ConsignesLieux.Read())
                        {
                            //array_tmp.Add((float)dr_ConsignesLieux["Consigne_Inf"]);
                            array_tmp.Add(GetFloatOrDefault(dr_ConsignesLieux["Consigne_Inf"]));
                            //array_tmp.Add(float.Parse(String.Format("{0:0.00}", dr_ConsignesLieux["Consigne_Sup"])));
                            array_tmp.Add(GetFloatOrDefault(dr_ConsignesLieux["Consigne_Sup"]));

                            notificationActive_tmp = dr_ConsignesLieux.GetBoolean("Notification_Active");
                            //VigitempServeur.Log("Date_Heure_Reactivation_Alarme POUR LE LIEU " + p_idLieu + ": " + dr_ConsignesLieux["Date_Heure_Reactivation_Alarme"].ToString());
                            var rawDate = dr_ConsignesLieux["Date_Heure_Reactivation_Alarme"].ToString();
                            if (rawDate != "")
                            {
                                if (!DateTime.TryParse(rawDate, CultureInfo.InvariantCulture, DateTimeStyles.AssumeLocal, out Date_Heure_Reactivation_Alarme_tmp))
                                {
                                    DateTime.TryParse(rawDate, CultureInfo.CurrentCulture, DateTimeStyles.AssumeLocal, out Date_Heure_Reactivation_Alarme_tmp);
                                }
                            }
                            //if (DateTime.TryParse(dr_ConsignesLieux["Date_Heure_Reactivation_Alarme"].ToString(), out Date_Heure_Reactivation_Alarme_tmp))
                            //if (DateTime.TryParseExact(dr_ConsignesLieux["Date_Heure_Reactivation_Alarme"].ToString(), "yyyy-M-d h:m:s" ,new CultureInfo("FR-fr"),DateTimeStyles.None,out Date_Heure_Reactivation_Alarme_tmp))
                            //{
                            //    VigitempServeur.Log("V2 PAS DE Date_Heure_Reactivation_Alarme POUR LE LIEU " + p_idLieu);
                            //}
                            //else
                            //{
                            //    VigitempServeur.Log("V2 IL Y A UNE Date_Heure_Reactivation_Alarme POUR LE LIEU " + p_idLieu);
                            //}
                            //Date_Heure_Reactivation_Alarme_tmp = DateTime.Parse(dr_ConsignesLieux["Date_Heure_Reactivation_Alarme"].ToString());
                        }
                    }
                }

                return (array_tmp, notificationActive_tmp, Date_Heure_Reactivation_Alarme_tmp);
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
                catch (MySqlException)
                {
                    try
                    {
                        return ReadLieuAlarmSettingsV1(idLieu);
                    }
                    catch (MySqlException ex)
                    {
                        VigitempServeur.Log("getLieuAlarmSettings MySQL error: " + ex.Message);
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

        private static double? GetNullableDouble(MySqlDataReader reader, string column)
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

        private static int GetNullableInt(MySqlDataReader reader, string column, int defaultValue = 0)
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

        private static bool GetNullableBool(MySqlDataReader reader, string column, bool defaultValue)
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

        private static bool GetOptionalBool(MySqlDataReader reader, string column, bool defaultValue)
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

        private static double? GetOptionalDouble(MySqlDataReader reader, string column)
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
        private static DateTime GetNullableDateTime(MySqlDataReader reader, string column)
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
            // Prisma schema convention: Id_Lieu, Sonde_Numero_Serie, ...
            var cmd = this.connection_vigitemp.CreateCommand();
            cmd.CommandText =
                "SELECT " +
                "Id_Lieu, " +
                "Tolerance_Surveillance_Inf as Consigne_Inf, Est_Consigne_Inf_Active, Retard_Alarme_Bas, Consigne_Inf_Pre_Alarme, Est_Consigne_Inf_Pre_Alarme_Active, " +
                "Tolerance_Surveillance_Sup as Consigne_Sup, Est_Consigne_Sup_Active, Retard_Alarme_Haut, Consigne_Sup_Pre_Alarme, Est_Consigne_Sup_Pre_Alarme_Active, " +
                "Retard_Non_Reponse, Retard_Alarme_Changement_Consigne, Nb_Mesures_Temporisation_Redeclenchement, Planning_Derniere_Maj, " +
                "Notification_Active, Date_Heure_Reactivation_Alarme " +
                "FROM t_lieu WHERE Id_Lieu = @idLieu;";
            cmd.Parameters.AddWithValue("@idLieu", idLieu);

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
                    notificationActive: GetNullableBool(reader, "Notification_Active", true),
                    dateHeureReactivationAlarme: GetNullableDateTime(reader, "Date_Heure_Reactivation_Alarme"),
                    planningDerniereMaj: GetNullableDateTime(reader, "Planning_Derniere_Maj"));
            }
        }

        private LieuAlarmSettings ReadLieuAlarmSettingsV1(int idLieu)
        {
            // Legacy schema convention: IdLieu, SondeNumeroSerie, ...
            var cmd = this.connection_vigitemp.CreateCommand();
            cmd.CommandText =
                "SELECT " +
                "IdLieu, " +
                "Consigne_Inf, Consigne_Sup, Notification_Active, Date_Heure_Reactivation_Alarme, " +
                "Retard_Alarme_Bas, Retard_Alarme_Haut, Retard_Non_Reponse, " +
                "Est_Consigne_Inf_Active, Est_Consigne_Sup_Active, " +
                "Consigne_Inf_Pre_Alarme, Est_Consigne_Inf_Pre_Alarme_Active, " +
                "Consigne_Sup_Pre_Alarme, Est_Consigne_Sup_Pre_Alarme_Active " +
                "FROM t_lieu WHERE IdLieu = @idLieu;";
            cmd.Parameters.AddWithValue("@idLieu", idLieu);

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
                List<string> array_ip_tmp = new List<string>();
                try
                {
                    //VigitempServeur.Log("getPCsClients");
                    //int idLieu_tmp = 0;
                    //bool alarme_active = false;

                    if (!EnsureConnected())
                    {
                        return array_ip_tmp;
                    }

                    MySqlCommand cmd_vigitemp = connection_vigitemp.CreateCommand();

                    //cmd_vigitemp.CommandText = "select ip_client, t_lieu.idLieu from t_clients_notifications " +
                    //                            "inner join t_lieu on t_clients_notifications.id_Lieu = t_lieu.idLieu " +
                    //                            "where SondeNumeroSerie = '"+p_sondSerialNumber+"';";
                    //cmd_vigitemp.CommandText = "select IdLieu, Notification_Active from t_lieu where SondeNumeroSerie='"+p_sondSerialNumber+"';";
                    //MySqlDataReader dr_idLieu = cmd_vigitemp.ExecuteReader();
                    //while (dr_idLieu.Read())
                    //{
                    //    //alarme_active = true;
                    //    idLieu_tmp = dr_idLieu.GetInt32("IdLieu");
                    //    alarme_active = dr_idLieu.GetBoolean("Notification_Active");
                    //    VigitempServeur.Log("(string)dr_idLieu['IdLieu']: " + idLieu_tmp);
                    //    VigitempServeur.Log("dr_idLieu.GetBoolean('Notification_Active'): " + alarme_active);

                    //}
                    //dr_idLieu.Close();

                    //if((whichAreActive == true && alarme_active == true) || (whichAreActive == false && alarme_active == false))
                    //{
                        cmd_vigitemp.CommandText = "select Adresse_IP_Connexion from t_postes_clients";

                        // Ex?cution de la commande SQL 
                        MySqlDataReader dr_PCsClients = cmd_vigitemp.ExecuteReader();

                        //cmd_vigitemp.CommandText = "select IdLieu from t_lieu where SondeNumeroSerie='" + p_sondSerialNumber + "';";
                        //MySqlDataReader dr_idLieu = cmd_vigitemp.ExecuteReader();
                        while (dr_PCsClients.Read())
                        {
                            array_ip_tmp.Add(dr_PCsClients["Adresse_IP_Connexion"].ToString());
                            //VigitempServeur.Log("(string)dr_PCsClients['AdresseIPConnexion']: " + (string)dr_PCsClients["AdresseIPConnexion"]);
                            //idLieu_tmp = Int32.Parse((string)dr_idLieu["IdLieu"]);
                            //VigitempServeur.Log("(string)dr_idLieu['IdLieu']: " + Int32.Parse((string)dr_idLieu["IdLieu"]));

                        }

                        //dr_idLieu.Close();
                        dr_PCsClients.Close();
                    //}

                    //return (array_ip_tmp, idLieu_tmp);
                    return (array_ip_tmp);
                }
                catch (Exception e)
                {
                    //dr_idLieu.Close();
                    //dr_PCsClients.Close();
                    VigitempServeur.Log("erreur getPCsClients: " + e);

                    return array_ip_tmp;
                }
            }
        }


        public bool AddMesure(string p_numeroSerie, double p_valeur, string p_unite, string p_resistance, string p_rssi = null)
        {
            lock (_lock)
            {
                try
                {

                        // Ouverture de la connexion SQL
                        if (!EnsureConnected())
                        {
                            return false;
                        }

                        // Création d'une commande SQL en fonction de l'objet connection
                        MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();

                        // Requ?te SQL - Ajout de IdSonde ? la sélection
                        cmd_vigitemp.CommandText = "SELECT Frequence, Consigne, " +
                                                    "Tolerance_Surveillance_Sup as Consigne_Sup, " +
                                                    "Tolerance_Surveillance_Inf as Consigne_Inf, " +
                                                    "Nom_Lieu, Id_Lieu, t_lieu.Est_Lieu_En_Alarme, t_lieu.Sonde_Numero_Serie, t_sonde.Id_Sonde FROM t_lieu " +
                                                    "INNER JOIN t_sonde ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                                                    "INNER JOIN t_module ON t_sonde.Id_Module = t_module.Id_Module " +
                                      "LEFT JOIN t_sonde_type tt ON tt.Sonde_Type = t_sonde.Sonde_Type " +
                                                    "WHERE t_lieu.Sonde_Numero_Serie = @serial " +
                                                    "AND t_sonde.Etat_Sonde = 'S' " +
                                                    "AND IFNULL(t_sonde.Est_Sonde_GSO, 0) = 0;";
                        cmd_vigitemp.Parameters.AddWithValue("@serial", p_numeroSerie);

                        // Ex?cution de la commande SQL
                        int idSonde;
                        int idLieu;
                        float consigne;
                        float consigneSup;
                        float consigneInf;
                        int frequence;
                        const int idServeurBdd = 1;
                        int estEtatAlarme;

                        using (var dr_lieux = cmd_vigitemp.ExecuteReader())
                        {
                            if (!dr_lieux.Read())
                            {
                                VigitempServeur.Log("(AddMesure) Aucune ligne t_lieu pour la sonde: " + p_numeroSerie);
                                return false;
                            }

                            // R?cup?rer l'IdSonde pour le cache
                            idSonde = (int)dr_lieux["Id_Sonde"];
                            idLieu = (int)dr_lieux["Id_Lieu"];
                            consigne = GetFloatOrDefault(dr_lieux["Consigne"]);
                            consigneSup = GetFloatOrDefault(dr_lieux["Consigne_Sup"]);
                            consigneInf = GetFloatOrDefault(dr_lieux["Consigne_Inf"]);
                            frequence = (int)dr_lieux["Frequence"];
                            estEtatAlarme = Convert.ToInt32(dr_lieux["Est_Lieu_En_Alarme"]);
                        }

                        var now = DateTime.Now;
                        if (HasRecentMeasurement(p_numeroSerie, now, requireNonNullValue: true))
                        {
                            VigitempServeur.Log($"(AddMesure) Doublon ignore sonde={p_numeroSerie} windowSec={GetDuplicateGuardSeconds()}");
                            return false;
                        }

                        MySqlCommand cmd_vigitemp_mesure = this.connection_vigitemp_mesure.CreateCommand();
                        cmd_vigitemp_mesure.CommandText = "INSERT INTO tm_mesures " +
                                                            "(Id_Serveur_BDD, Date_Heure_Mesure, Valeur, Valeur_Brute, Consigne, Consigne_Sup, Consigne_Inf, Unite, Frequence, Sonde_Numero_Serie, Id_Lieu, Est_Etat_Alarme, Rssi) " +
                                                            "VALUES " +
                                                            "(@idserveurbdd, @dateheuremesure, @valeur, @resistance, @consigne, @consignesup, @consigneinf, @unite, @frequence, @sondenumeroserie, @idlieu, @estEtatAlarme, @rssi)";

                        // utilisation de l'objet contact pass? en param?tre 
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@idserveurbdd", idServeurBdd);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@dateheuremesure", now.ToString("yyyy-MM-dd HH:mm:ss.fff"));
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@valeur", p_valeur);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@resistance", (object)p_resistance ?? DBNull.Value);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@unite", p_unite);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@consigne", consigne);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@consignesup", consigneSup);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@consigneinf", consigneInf);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@frequence", frequence);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@sondenumeroserie", p_numeroSerie);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@idlieu", idLieu);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@estEtatAlarme", estEtatAlarme);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@rssi", string.IsNullOrWhiteSpace(p_rssi) ? (object)DBNull.Value : p_rssi);

                        cmd_vigitemp_mesure.ExecuteNonQuery();

                        var cmd_vigitemp_updateLieu = this.connection_vigitemp.CreateCommand();
                        cmd_vigitemp_updateLieu.CommandText = "UPDATE t_lieu SET " +
                                                              "Derniere_Date_Heure = @dateheuremesure, " +
                                                              "Date_Heure_Derniere_Reponse_Recue_OK = @dateheuremesure, " +
                                                              "Derniere_Valeur = @valeur, " +
                                                              "Derniere_Unite = @unite, " +
                                                              "Derniere_Valeur_Null = 0 " +
                                                              "WHERE Id_Lieu = @idlieu;";
                        cmd_vigitemp_updateLieu.Parameters.AddWithValue("@dateheuremesure", now.ToString("yyyy-MM-dd HH:mm:ss.fff"));
                        cmd_vigitemp_updateLieu.Parameters.AddWithValue("@valeur", p_valeur);
                        cmd_vigitemp_updateLieu.Parameters.AddWithValue("@unite", p_unite);
                        cmd_vigitemp_updateLieu.Parameters.AddWithValue("@idlieu", idLieu);
                        cmd_vigitemp_updateLieu.ExecuteNonQuery();

                        // Ins?rer la mesure dans ts_graphique (cache pour les graphs)
                        double resistance = 0;
                        if (!string.IsNullOrWhiteSpace(p_resistance))
                        {
                            double.TryParse(p_resistance, NumberStyles.Any, CultureInfo.InvariantCulture, out resistance);
                        }

                        CacheService.InsertMeasureToGraphique(
                            connection_vigitemp_mesure,
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
                            estEtatAlarme
                        );

                        //check declenchement alarm
                        //requete consigne sondes

                        //si en dehors, check conditions d'alamres
                        //si conditions alors envoyer alarmes

                        //probleme : si plusieurs alarmes, je veut en enlever une comment faire?
                        //le texte change uniquement en fct du type d'alarme et pas en fonction du materiel

                        Interlocked.Increment(ref VigitempServeur.nombres_reponses);
                        return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(AddMesure) SQL Erreur: " + ex);
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

                    MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();
                    cmd_vigitemp.CommandText = "SELECT Frequence, Consigne, " +
                                                "Tolerance_Surveillance_Sup as Consigne_Sup, " +
                                                "Tolerance_Surveillance_Inf as Consigne_Inf, " +
                                                "Id_Lieu, t_lieu.Est_Lieu_En_Alarme FROM t_lieu " +
                                                "INNER JOIN t_sonde ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                                                "INNER JOIN t_module ON t_sonde.Id_Module = t_module.Id_Module " +
                                                "WHERE t_lieu.Sonde_Numero_Serie = @serial " +
                                                "AND t_sonde.Etat_Sonde = 'S' " +
                                                "AND IFNULL(t_sonde.Est_Sonde_GSO, 0) = 0;";
                    cmd_vigitemp.Parameters.AddWithValue("@serial", p_numeroSerie);

                    int idLieu;
                    float consigne;
                    float consigneSup;
                    float consigneInf;
                    int frequence;
                    const int idServeurBdd = 1;
                    int estEtatAlarme;

                    using (var reader = cmd_vigitemp.ExecuteReader())
                    {
                        if (!reader.Read())
                        {
                            VigitempServeur.Log("(AddHistoricalMesureIfMissing) Aucune ligne t_lieu pour la sonde: " + p_numeroSerie);
                            return false;
                        }

                        idLieu = (int)reader["Id_Lieu"];
                        consigne = GetFloatOrDefault(reader["Consigne"]);
                        consigneSup = GetFloatOrDefault(reader["Consigne_Sup"]);
                        consigneInf = GetFloatOrDefault(reader["Consigne_Inf"]);
                        frequence = (int)reader["Frequence"];
                        estEtatAlarme = Convert.ToInt32(reader["Est_Lieu_En_Alarme"]);
                    }

                    var cmdCheck = this.connection_vigitemp_mesure.CreateCommand();
                    cmdCheck.CommandText = "SELECT 1 FROM tm_mesures WHERE Sonde_Numero_Serie = @serial AND Date_Heure_Mesure = @dateheuremesure LIMIT 1;";
                    cmdCheck.Parameters.AddWithValue("@serial", p_numeroSerie);
                    cmdCheck.Parameters.AddWithValue("@dateheuremesure", measureDateTime.ToString("yyyy-MM-dd HH:mm:ss.fff"));
                    var existing = cmdCheck.ExecuteScalar();
                    if (existing != null && existing != DBNull.Value)
                    {
                        return false;
                    }

                    var cmdInsert = this.connection_vigitemp_mesure.CreateCommand();
                    cmdInsert.CommandText = "INSERT INTO tm_mesures " +
                                            "(Id_Serveur_BDD, Date_Heure_Mesure, Valeur, Valeur_Brute, Est_Valeur_Memoire, Consigne, Consigne_Sup, Consigne_Inf, Unite, Frequence, Sonde_Numero_Serie, Id_Lieu, Est_Etat_Alarme) " +
                                            "VALUES " +
                                            "(@idserveurbdd, @dateheuremesure, @valeur, @resistance, 1, @consigne, @consignesup, @consigneinf, @unite, @frequence, @sondenumeroserie, @idlieu, @estEtatAlarme)";
                    cmdInsert.Parameters.AddWithValue("@idserveurbdd", idServeurBdd);
                    cmdInsert.Parameters.AddWithValue("@dateheuremesure", measureDateTime.ToString("yyyy-MM-dd HH:mm:ss.fff"));
                    cmdInsert.Parameters.AddWithValue("@valeur", p_valeur);
                    cmdInsert.Parameters.AddWithValue("@resistance", (object)p_resistance ?? DBNull.Value);
                    cmdInsert.Parameters.AddWithValue("@consigne", consigne);
                    cmdInsert.Parameters.AddWithValue("@consignesup", consigneSup);
                    cmdInsert.Parameters.AddWithValue("@consigneinf", consigneInf);
                    cmdInsert.Parameters.AddWithValue("@unite", p_unite);
                    cmdInsert.Parameters.AddWithValue("@frequence", frequence);
                    cmdInsert.Parameters.AddWithValue("@sondenumeroserie", p_numeroSerie);
                    cmdInsert.Parameters.AddWithValue("@idlieu", idLieu);
                    cmdInsert.Parameters.AddWithValue("@estEtatAlarme", estEtatAlarme);
                    cmdInsert.ExecuteNonQuery();

                    var cmdUpdateLieu = this.connection_vigitemp.CreateCommand();
                    cmdUpdateLieu.CommandText = "UPDATE t_lieu SET " +
                                                "Derniere_Date_Heure = IF(Derniere_Date_Heure IS NULL OR Derniere_Date_Heure < @dateheuremesure, @dateheuremesure, Derniere_Date_Heure), " +
                                                "Date_Heure_Derniere_Reponse_Recue_OK = IF(Date_Heure_Derniere_Reponse_Recue_OK IS NULL OR Date_Heure_Derniere_Reponse_Recue_OK < @dateheuremesure, @dateheuremesure, Date_Heure_Derniere_Reponse_Recue_OK), " +
                                                "Derniere_Valeur = IF(Derniere_Date_Heure IS NULL OR Derniere_Date_Heure < @dateheuremesure, @valeur, Derniere_Valeur), " +
                                                "Derniere_Unite = IF(Derniere_Date_Heure IS NULL OR Derniere_Date_Heure < @dateheuremesure, @unite, Derniere_Unite) " +
                                                "WHERE Id_Lieu = @idlieu;";
                    cmdUpdateLieu.Parameters.AddWithValue("@dateheuremesure", measureDateTime.ToString("yyyy-MM-dd HH:mm:ss.fff"));
                    cmdUpdateLieu.Parameters.AddWithValue("@valeur", p_valeur);
                    cmdUpdateLieu.Parameters.AddWithValue("@unite", p_unite);
                    cmdUpdateLieu.Parameters.AddWithValue("@idlieu", idLieu);
                    cmdUpdateLieu.ExecuteNonQuery();

                    VigitempServeur.Log($"(AddHistoricalMesureIfMissing) mesure historisee serial={p_numeroSerie} date={measureDateTime:O} value={p_valeur.ToString(CultureInfo.InvariantCulture)}");
                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(AddHistoricalMesureIfMissing) SQL Erreur: " + ex);
                    return false;
                }
            }
        }

        public bool UpdateLieuWirelessMetrics(string p_numeroSerie, int? batteryPercent, int? rssi)
        {
            lock (this)
            {
                try
                {
                    if (!EnsureConnected() || connection_vigitemp == null)
                    {
                        return false;
                    }

                    var cmd = this.connection_vigitemp.CreateCommand();
                    cmd.CommandText = "UPDATE t_lieu SET Derniere_Val_Batterie = @battery, Derniere_Val_Rssi = @rssi WHERE Sonde_Numero_Serie = @serial;";
                    cmd.Parameters.AddWithValue("@battery", batteryPercent.HasValue ? (object)batteryPercent.Value : DBNull.Value);
                    cmd.Parameters.AddWithValue("@rssi", rssi.HasValue ? (object)rssi.Value.ToString(CultureInfo.InvariantCulture) : DBNull.Value);
                    cmd.Parameters.AddWithValue("@serial", p_numeroSerie);
                    cmd.ExecuteNonQuery();
                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(UpdateLieuWirelessMetrics) Erreur SQL: " + ex.Message);
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

                    MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();
                    cmd_vigitemp.CommandText = "SELECT Frequence, Consigne, " +
                                                "Tolerance_Surveillance_Sup as Consigne_Sup, " +
                                                "Tolerance_Surveillance_Inf as Consigne_Inf, " +
                                                "Id_Lieu, t_lieu.Est_Lieu_En_Alarme, t_sonde.Id_Sonde FROM t_lieu " +
                                                "INNER JOIN t_sonde ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                                                "INNER JOIN t_module ON t_sonde.Id_Module = t_module.Id_Module " +
                                                "WHERE t_lieu.Sonde_Numero_Serie = @serial " +
                                                "AND t_sonde.Etat_Sonde = 'S' " +
                                                "AND IFNULL(t_sonde.Est_Sonde_GSO, 0) = 0;";
                    cmd_vigitemp.Parameters.AddWithValue("@serial", p_numeroSerie);

                    int idSonde;
                    int idLieu;
                    float consigne;
                    float consigneSup;
                    float consigneInf;
                    int frequence;
                    const int idServeurBdd = 1;
                    int estEtatAlarme;

                    using (var dr_lieux = cmd_vigitemp.ExecuteReader())
                    {
                        if (!dr_lieux.Read())
                        {
                            VigitempServeur.Log("(AddMesureNoResponse) Aucune ligne t_lieu pour la sonde: " + p_numeroSerie);
                            return false;
                        }

                        idSonde = (int)dr_lieux["Id_Sonde"];
                        idLieu = (int)dr_lieux["Id_Lieu"];
                        consigne = GetFloatOrDefault(dr_lieux["Consigne"]);
                        consigneSup = GetFloatOrDefault(dr_lieux["Consigne_Sup"]);
                        consigneInf = GetFloatOrDefault(dr_lieux["Consigne_Inf"]);
                        frequence = (int)dr_lieux["Frequence"];
                        estEtatAlarme = Convert.ToInt32(dr_lieux["Est_Lieu_En_Alarme"]);
                    }

                    var unit = string.IsNullOrWhiteSpace(p_unite) ? getLieuUnite(idLieu) : p_unite;
                    var now = DateTime.Now;
                    if (HasRecentMeasurement(p_numeroSerie, now, requireNonNullValue: false))
                    {
                        VigitempServeur.Log($"(AddMesureNoResponse) Doublon ignore sonde={p_numeroSerie} windowSec={GetDuplicateGuardSeconds()}");
                        return false;
                    }

                    MySqlCommand cmd_vigitemp_mesure = this.connection_vigitemp_mesure.CreateCommand();
                    cmd_vigitemp_mesure.CommandText = "INSERT INTO tm_mesures " +
                                                        "(Id_Serveur_BDD, Date_Heure_Mesure, Valeur, Valeur_Brute, Consigne, Consigne_Sup, Consigne_Inf, Unite, Frequence, Sonde_Numero_Serie, Id_Lieu, Est_Etat_Alarme, Est_Valeur_Null) " +
                                                        "VALUES " +
                                                        "(@idserveurbdd, @dateheuremesure, @valeur, @resistance, @consigne, @consignesup, @consigneinf, @unite, @frequence, @sondenumeroserie, @idlieu, @estEtatAlarme, 1)";

                    cmd_vigitemp_mesure.Parameters.AddWithValue("@idserveurbdd", idServeurBdd);
                    cmd_vigitemp_mesure.Parameters.AddWithValue("@dateheuremesure", now.ToString("yyyy-MM-dd HH:mm:ss.fff"));
                    cmd_vigitemp_mesure.Parameters.AddWithValue("@valeur", DBNull.Value);
                    cmd_vigitemp_mesure.Parameters.AddWithValue("@resistance", DBNull.Value);
                    cmd_vigitemp_mesure.Parameters.AddWithValue("@unite", unit);
                    cmd_vigitemp_mesure.Parameters.AddWithValue("@consigne", consigne);
                    cmd_vigitemp_mesure.Parameters.AddWithValue("@consignesup", consigneSup);
                    cmd_vigitemp_mesure.Parameters.AddWithValue("@consigneinf", consigneInf);
                    cmd_vigitemp_mesure.Parameters.AddWithValue("@frequence", frequence);
                    cmd_vigitemp_mesure.Parameters.AddWithValue("@sondenumeroserie", p_numeroSerie);
                    cmd_vigitemp_mesure.Parameters.AddWithValue("@idlieu", idLieu);
                    cmd_vigitemp_mesure.Parameters.AddWithValue("@estEtatAlarme", estEtatAlarme);
                    cmd_vigitemp_mesure.ExecuteNonQuery();

                    CacheService.InsertMeasureToGraphique(
                        connection_vigitemp_mesure,
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

                    var cmdUpdateLieu = this.connection_vigitemp.CreateCommand();
                    cmdUpdateLieu.CommandText = "UPDATE t_lieu SET " +
                                                "Derniere_Date_Heure = @dateheuremesure, " +
                                                "Date_Heure_Derniere_Reponse = @dateheuremesure, " +
                                                "Derniere_Valeur = NULL, " +
                                                "Derniere_Unite = @unite, " +
                                                "Derniere_Valeur_Null = 1 " +
                                                "WHERE Id_Lieu = @idlieu;";
                    cmdUpdateLieu.Parameters.AddWithValue("@dateheuremesure", now.ToString("yyyy-MM-dd HH:mm:ss.fff"));
                    cmdUpdateLieu.Parameters.AddWithValue("@unite", unit);
                    cmdUpdateLieu.Parameters.AddWithValue("@idlieu", idLieu);
                    cmdUpdateLieu.ExecuteNonQuery();

                    VigitempServeur.Log($"(AddMesureNoResponse) Mesure null inseree pour non-reponse sonde={p_numeroSerie} lieu={idLieu}");
                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(AddMesureNoResponse) SQL Erreur: " + ex);
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

            var cmd = this.connection_vigitemp_mesure.CreateCommand();
            cmd.CommandText =
                "SELECT 1 FROM tm_mesures " +
                "WHERE Sonde_Numero_Serie = @serial " +
                "AND Date_Heure_Mesure >= @since " +
                (requireNonNullValue ? "AND Valeur IS NOT NULL " : string.Empty) +
                "ORDER BY Date_Heure_Mesure DESC LIMIT 1;";
            cmd.Parameters.AddWithValue("@serial", serial);
            cmd.Parameters.AddWithValue("@since", now.AddSeconds(-guardSeconds).ToString("yyyy-MM-dd HH:mm:ss.fff"));
            var existing = cmd.ExecuteScalar();
            return existing != null && existing != DBNull.Value;
        }


        public List<SondeScheduleInfo> getSondesActivesByServeur(int idServeur)
        {
            return getSondesActivesInternal();
        }

        public List<SondeScheduleInfo> getSondesActivesAllServeurs()
        {
            return getSondesActivesInternal();
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

                    var cmd = connection_vigitemp.CreateCommand();
                    cmd.CommandText = "SELECT t_lieu.Id_Lieu, t_lieu.Frequence, t_lieu.Derniere_Date_Heure, " +
                                      "t_lieu.Infos_Modifiees_Depuis_Derniere_Mesure, t_lieu.EMT_Choix_Mode, t_lieu.Est_Correction_Ej, " +
                                      "t_module.Port_Serie, t_module.Module_Numero_Serie, t_module.Type_Module, t_module.Id_Worker AS Id_Worker, " +
                                      "t_sonde.Sonde_Numero_Serie, t_sonde.Sonde_Type, tt.Famille_Sonde, t_sonde.Adresse_Sonde, t_sonde.Sonde_Offset, " +
                                      "ta.Coeff_X, ta.Coeff_Constant, te.Err_Justesse, te.Incertitude, te.Date_Validite " +
                                      "FROM t_lieu " +
                                      "INNER JOIN t_sonde ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                                      "INNER JOIN t_module ON t_sonde.Id_Module = t_module.Id_Module " +
                                      "LEFT JOIN t_sonde_type tt ON tt.Sonde_Type = t_sonde.Sonde_Type " +
                                      "LEFT JOIN (" +
                                      "  SELECT Sonde_Numero_Serie, Coeff_X, Coeff_Constant " +
                                      "  FROM (" +
                                      "    SELECT Sonde_Numero_Serie, Coeff_X, Coeff_Constant, " +
                                      "           ROW_NUMBER() OVER (PARTITION BY Sonde_Numero_Serie " +
                                      "                             ORDER BY Date_Heure_Ajustage DESC, Id_Ajustage DESC) AS rn " +
                                      "    FROM t_ajustage" +
                                      "  ) ranked_a WHERE rn = 1" +
                                      ") ta ON ta.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                                      "LEFT JOIN (" +
                                      "  SELECT Sonde_Numero_Serie, Err_Justesse, Incertitude, Date_Validite " +
                                      "  FROM (" +
                                      "    SELECT Sonde_Numero_Serie, Err_Justesse, Incertitude, Date_Validite, " +
                                      "           ROW_NUMBER() OVER (PARTITION BY Sonde_Numero_Serie " +
                                      "                             ORDER BY Date_Heure_Etalonnage DESC, Id_Etalonnage DESC) AS rn " +
                                      "    FROM t_etalonnage" +
                                      "  ) ranked_e WHERE rn = 1" +
                                      ") te ON te.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                                      "WHERE t_lieu.Lieu_Etat = 'S' " +
                                      "AND t_sonde.Etat_Sonde = 'S' " +
                                      "AND IFNULL(t_sonde.Est_Sonde_GSO, 0) = 0;";

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
                                lastMeasure = DateTime.Parse(reader["Derniere_Date_Heure"].ToString());
                            }

                            var coeffX = GetOptionalDouble(reader, "Coeff_X");
                            var coeffConstant = GetOptionalDouble(reader, "Coeff_Constant");
                            var errJustesse = GetOptionalDouble(reader, "Err_Justesse");
                            var incertitude = GetOptionalDouble(reader, "Incertitude");
                            var dateValidite = GetNullableDateTime(reader, "Date_Validite");

                            list.Add(new SondeScheduleInfo
                            {
                                IdLieu = Int32.Parse(reader["Id_Lieu"].ToString()),
                                FrequenceSecondes = frequency,
                                DerniereDateHeure = lastMeasure,
                                InfosModifiees = GetOptionalBool(reader, "Infos_Modifiees_Depuis_Derniere_Mesure", false),
                                PortSerie = "COM" + reader["Port_Serie"].ToString(),
                                ModuleNumeroSerie = reader["Module_Numero_Serie"].ToString(),
                                ModuleType = GetNullableInt(reader, "Type_Module"),
                                ManualWorkerId = GetNullableInt(reader, "Id_Worker"),
                                SondeNumeroSerie = reader["Sonde_Numero_Serie"].ToString(),
                                SondeType = reader["Sonde_Type"] == DBNull.Value ? string.Empty : reader["Sonde_Type"].ToString(),
                                FamilleSonde = reader["Famille_Sonde"] == DBNull.Value ? string.Empty : reader["Famille_Sonde"].ToString(),
                                AdresseSonde = reader["Adresse_Sonde"].ToString(),
                                SondeOffset = GetOptionalDouble(reader, "Sonde_Offset"),
                                HasAjustage = coeffX.HasValue && coeffConstant.HasValue,
                                CoeffX = coeffX ?? 1d,
                                CoeffConstant = coeffConstant ?? 0d,
                                HasEtalonnage = errJustesse.HasValue || incertitude.HasValue || dateValidite != default(DateTime),
                                EmtChoixMode = GetNullableInt(reader, "EMT_Choix_Mode", 0),
                                ApplyCorrectionEj = GetOptionalBool(reader, "Est_Correction_Ej", false),
                                ErrJustesse = errJustesse,
                                CorrectionJustesse = errJustesse.HasValue ? -errJustesse.Value : (double?)null,
                                Incertitude = incertitude,
                                DateValiditeEtalonnage = dateValidite == default(DateTime) ? (DateTime?)null : dateValidite,
                            });
                        }
                    }

                    return list;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getSondesActivesInternal) SQL Erreur: " + ex);
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
                        string tmp_arr_sondeNumeroSerie = "";
                        string tmp_arr_sondeType = "";
                        string tmp_arr_familleSonde = "";
                        string tmp_arr_sondeAdresse = "";
                        string tmp_arr_moduleNumeroSerie = "";
                        int? tmp_arr_moduleType = null;
                        string tmp_arr_portSerie = "";

                        // Ouverture de la connexion SQL
                        if (!EnsureConnected())
                        {
                            return (tmp_arr_portSerie, tmp_arr_sondeNumeroSerie, tmp_arr_sondeType, tmp_arr_familleSonde, tmp_arr_sondeAdresse, tmp_arr_moduleNumeroSerie, tmp_arr_moduleType);
                        }

                        // Création d'une commande SQL en fonction de l'objet connection
                        using (var cmd_vigitemp = this.connection_vigitemp.CreateCommand())
                        {
                            cmd_vigitemp.CommandText = "SELECT t_module.Port_Serie, t_module.Module_Numero_Serie, t_module.Type_Module, t_sonde.Sonde_Numero_Serie, t_sonde.Sonde_Type, tt.Famille_Sonde, t_sonde.Adresse_Sonde FROM t_lieu " +
                                                        "INNER JOIN t_sonde ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                                                        "INNER JOIN t_module ON t_sonde.Id_Module = t_module.Id_Module " +
                                                        "LEFT JOIN t_sonde_type tt ON tt.Sonde_Type = t_sonde.Sonde_Type " +
                                                        "WHERE t_lieu.Id_Lieu = @idLieu;";
                            cmd_vigitemp.Parameters.AddWithValue("@idLieu", p_idLieu);

                            // Ex?cution de la commande SQL
                            using (var dr_lieux = cmd_vigitemp.ExecuteReader())
                            {
                                while (dr_lieux.Read())
                                {
                                    tmp_arr_portSerie = ("COM" + dr_lieux["Port_Serie"].ToString());
                                    tmp_arr_sondeNumeroSerie = (dr_lieux["Sonde_Numero_Serie"].ToString());
                                    tmp_arr_sondeType = dr_lieux["Sonde_Type"] == DBNull.Value ? string.Empty : dr_lieux["Sonde_Type"].ToString();
                                    tmp_arr_familleSonde = dr_lieux["Famille_Sonde"] == DBNull.Value ? string.Empty : dr_lieux["Famille_Sonde"].ToString();
                                    tmp_arr_sondeAdresse = (dr_lieux["Adresse_Sonde"].ToString());
                                    tmp_arr_moduleNumeroSerie = (dr_lieux["Module_Numero_Serie"].ToString());
                                    tmp_arr_moduleType = dr_lieux["Type_Module"] == DBNull.Value ? (int?)null : Convert.ToInt32(dr_lieux["Type_Module"]);
                                }
                            }
                        }

                        return (tmp_arr_portSerie, tmp_arr_sondeNumeroSerie, tmp_arr_sondeType, tmp_arr_familleSonde, tmp_arr_sondeAdresse, tmp_arr_moduleNumeroSerie, tmp_arr_moduleType);
                    }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getInfosByIdLieu) SQL Erreur: " + ex);
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

                    using (var cmd = connection_vigitemp.CreateCommand())
                    {
                        cmd.CommandText =
                            "SELECT DISTINCT Id_Worker AS Id_Worker " +
                            "FROM t_module " +
                            "WHERE Id_Worker IS NOT NULL AND Id_Worker > 0;";
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
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getDistinctIdServeur) SQL Erreur: " + ex);
                }

                return workerIds.Distinct().OrderBy(id => id).ToList();
            }
        }

        public (List<int>, List<DateTime>) getLieuxAvecAlarmesEnSnooze()
        {
            lock (_lock)
            {
                List<int> array_tmpIdLieu = new List<int>();
                List<DateTime> array_tmpSnoozeDateTime = new List<DateTime>();

                if (!EnsureConnected())
                {
                    return (array_tmpIdLieu, array_tmpSnoozeDateTime);
                }

                using (var cmd_vigitemp = this.connection_vigitemp.CreateCommand())
                {
                    cmd_vigitemp.CommandText = "SELECT distinct Id_Lieu, Date_Heure_Reactivation_Alarme FROM t_lieu " +
                                                "where Date_Heure_Reactivation_Alarme is not null AND Date_Heure_Reactivation_Alarme <= NOW();";

                    // Ex?cution de la commande SQL
                    using (var dr_lieux = cmd_vigitemp.ExecuteReader())
                    {
                        while (dr_lieux.Read())
                        {
                            array_tmpIdLieu.Add(Int32.Parse(dr_lieux["Id_Lieu"].ToString()));
                            //VigitempServeur.Log("Date_Heure_Reactivation_Alarme " + DateTime.Parse(dr_lieux["Date_Heure_Reactivation_Alarme"].ToString()).ToString());
                            array_tmpSnoozeDateTime.Add(DateTime.Parse(dr_lieux["Date_Heure_Reactivation_Alarme"].ToString()));
                        }
                    }
                }

                return (array_tmpIdLieu, array_tmpSnoozeDateTime);
            }
        }

        public (double value, string unit, bool hasValue) getLastMeasureWithUnit(int idLieu)
        {
            lock (_lock)
            {
                double value = 0.00;
                string unit = "";
                bool hasValue = false;

                if (!EnsureConnected())
                {
                    return (value, unit, hasValue);
                }

                var cmd = this.connection_vigitemp_mesure.CreateCommand();
                cmd.CommandText =
                    "SELECT Valeur, Unite FROM tm_mesures " +
                    "WHERE Id_Lieu = @idLieu " +
                    "ORDER BY Date_Heure_Mesure DESC LIMIT 1";
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

                    var cmd_vigitemp = this.connection_vigitemp.CreateCommand();
                    cmd_vigitemp.CommandText = "UPDATE t_lieu " +
                                               "SET Notification_Active = @valeur, " +
                                               "Date_Heure_Reactivation_Alarme = NULL " +
                                               "WHERE Id_Lieu = @idLieu;";
                    cmd_vigitemp.Parameters.AddWithValue("@valeur", p_valeur);
                    cmd_vigitemp.Parameters.AddWithValue("@idLieu", p_idLieu);
                    cmd_vigitemp.ExecuteNonQuery();

                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("ERREUR : IMPOSSIBLE DE CHANGER LE REGLAGE DE NOTIFICATION POUR LE LIEU IdLieu: " + p_idLieu + " => " + ex.Message);
                    return false;
                }
            }
        }

        public (List<int>, List<DateTime>) getLieuxAvecSurveillanceEnSnooze()
        {
            lock (_lock)
            {
                List<int> array_tmpSnooze = new List<int>();
                List<DateTime> array_tmpSnoozeDateTime = new List<DateTime>();

                if (!EnsureConnected())
                {
                    return (array_tmpSnooze, array_tmpSnoozeDateTime);
                }

                MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();
                cmd_vigitemp.CommandText = "SELECT distinct Id_Lieu, Date_Heure_Reactivation_Surveillance FROM t_lieu " +
                                           "where Date_Heure_Reactivation_Surveillance is not null AND Lieu_Etat = 'D' AND Date_Heure_Reactivation_Surveillance <= NOW();";

                try
                {
                    MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
                    while (dr_lieux.Read())
                    {
                        array_tmpSnooze.Add(Int32.Parse(dr_lieux["Id_Lieu"].ToString()));
                        array_tmpSnoozeDateTime.Add(DateTime.Parse(dr_lieux["Date_Heure_Reactivation_Surveillance"].ToString()));
                    }
                    dr_lieux.Close();
                }
                catch (Exception e)
                {
                    VigitempServeur.Log("SQL Error getLieuxAvecSurveillanceEnSnooze: " + e);
                }

                return (array_tmpSnooze, array_tmpSnoozeDateTime);
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

                    var cmd = this.connection_vigitemp.CreateCommand();
                    cmd.CommandText = "SELECT Derniere_Unite FROM t_lieu WHERE Id_Lieu = @idLieu;";
                    cmd.Parameters.AddWithValue("@idLieu", idLieu);

                    object result = cmd.ExecuteScalar();

                    return result == null || result == DBNull.Value ? "" : result.ToString();
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getLieuUnite) SQL Erreur: " + ex.Message);
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

                    var cmd = this.connection_vigitemp.CreateCommand();
                    cmd.CommandText =
                        "SELECT Valeur FROM t_parametre " +
                        "WHERE UPPER(Section) = UPPER(@section) AND UPPER(Mot_Cle) = UPPER(@motCle) " +
                        "LIMIT 1;";
                    cmd.Parameters.AddWithValue("@section", section ?? string.Empty);
                    cmd.Parameters.AddWithValue("@motCle", motCle ?? string.Empty);

                    var result = cmd.ExecuteScalar();
                    return result == null || result == DBNull.Value ? null : result.ToString();
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getParameterValue) SQL Erreur: " + ex.Message);
                    return null;
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

                    MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();
                    cmd_vigitemp.CommandText =
                        "UPDATE t_lieu SET Lieu_Etat = @etat, Date_Heure_Reactivation_Surveillance = NULL " +
                        "WHERE Id_Lieu = @idLieu;";
                    cmd_vigitemp.Parameters.AddWithValue("@etat", p_valeur ? "S" : "D");
                    cmd_vigitemp.Parameters.AddWithValue("@idLieu", p_idLieu);
                    cmd_vigitemp.ExecuteNonQuery();

                    MySqlCommand cmdSonde = this.connection_vigitemp.CreateCommand();
                    cmdSonde.CommandText =
                        "UPDATE t_sonde SET Surveillance_Etat = @etat " +
                        "WHERE Sonde_Numero_Serie IN (SELECT Sonde_Numero_Serie FROM t_lieu WHERE Id_Lieu = @idLieu);";
                    cmdSonde.Parameters.AddWithValue("@etat", p_valeur ? "S" : "D");
                    cmdSonde.Parameters.AddWithValue("@idLieu", p_idLieu);
                    cmdSonde.ExecuteNonQuery();

                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(setSurveillanceByIdLieu) SQL Erreur: " + ex.Message);
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

                    using (var ensureCmd = this.connection_vigitemp_mesure.CreateCommand())
                    {
                        ensureCmd.CommandText =
                            "INSERT INTO tm_compteur_id_table (Id_Serveur_BDD, Nom_Table, Compteur_Id) " +
                            "VALUES (@idServeur, @tableName, 0) " +
                            "ON DUPLICATE KEY UPDATE Compteur_Id = Compteur_Id;";
                        ensureCmd.Parameters.AddWithValue("@idServeur", serveurId);
                        ensureCmd.Parameters.AddWithValue("@tableName", tableName);
                        ensureCmd.ExecuteNonQuery();
                    }

                    // NOTE: La s�quence UPDATE+SELECT LAST_INSERT_ID() + INSERT est atomique
                    // du point de vue de cette instance Database car toutes les m�thodes
                    // utilisent le m�me lock(_lock). En mode multi-serveur, chaque ThreadServeur
                    // a sa propre instance Database, donc son propre lock.
                    int nextId;
                    using (var updateCmd = this.connection_vigitemp_mesure.CreateCommand())
                    {
                        updateCmd.CommandText =
                            "UPDATE tm_compteur_id_table " +
                            "SET Compteur_Id = LAST_INSERT_ID(Compteur_Id + 1) " +
                            "WHERE Id_Serveur_BDD = @idServeur AND Nom_Table = @tableName;";
                        updateCmd.Parameters.AddWithValue("@idServeur", serveurId);
                        updateCmd.Parameters.AddWithValue("@tableName", tableName);
                        updateCmd.ExecuteNonQuery();

                        updateCmd.CommandText = "SELECT LAST_INSERT_ID();";
                        nextId = Convert.ToInt32(updateCmd.ExecuteScalar());
                    }

                    using (var insertCmd = this.connection_vigitemp_mesure.CreateCommand())
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
                    VigitempServeur.Log("(writeAuditJournal) SQL Erreur: " + ex.Message);
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
                    catch (MySqlException)
                    {
                        return SetLieuAlarmFlagsV1(idLieu, isPreAlarm, isAlarm);
                    }
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("setLieuAlarmFlags error: " + ex);
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

                    var cmd = this.connection_vigitemp.CreateCommand();
                    cmd.CommandText = "UPDATE t_lieu " +
                                      "SET Infos_Modifiees_Depuis_Derniere_Mesure = @value " +
                                      "WHERE Id_Lieu = @idLieu;";
                    cmd.Parameters.AddWithValue("@value", value ? 1 : 0);
                    cmd.Parameters.AddWithValue("@idLieu", idLieu);
                    cmd.ExecuteNonQuery();

                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(setLieuInfosModifiees) SQL Erreur: " + ex.Message);
                    return false;
                }
            }
        }

        public bool setNonResponseAlarm(int idLieu, string sondeNumeroSerie, bool isActive)
        {
            return setTechnicalAlarm(idLieu, sondeNumeroSerie, "N", isActive, "setNonResponseAlarm");
        }

        public bool setPowerAlarm(int idLieu, string sondeNumeroSerie, bool isActive)
        {
            return setTechnicalAlarm(idLieu, sondeNumeroSerie, "A", isActive, "setPowerAlarm");
        }

        public bool setModuleAlarm(int idLieu, string sondeNumeroSerie, bool isActive)
        {
            return setTechnicalAlarm(idLieu, sondeNumeroSerie, "M", isActive, "setModuleAlarm");
        }

        private bool setTechnicalAlarm(int idLieu, string sondeNumeroSerie, string alarmType, bool isActive, string logContext)
        {
            bool notifyTriggered = false;
            int? capturedAlarmId = null;
            bool notifyEnded = false;

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
                        using (var transaction = connection_vigitemp.BeginTransaction())
                        {
                            try
                            {
                                var cmdCheck = this.connection_vigitemp.CreateCommand();
                                cmdCheck.Transaction = transaction;
                                cmdCheck.CommandText =
                                    "SELECT Id_Alarme FROM t_alarme " +
                                    "WHERE Id_Lieu = @idLieu AND " + typeFilterSql + " AND Date_Heure_Fin IS NULL " +
                                    "ORDER BY Date_Heure_Debut DESC LIMIT 1;";
                                cmdCheck.Parameters.AddWithValue("@idLieu", idLieu);
                                cmdCheck.Parameters.AddWithValue("@type", alarmType);

                                object existing = cmdCheck.ExecuteScalar();

                                if (existing == null || existing == DBNull.Value)
                                {
                                    var cmdInsert = this.connection_vigitemp.CreateCommand();
                                    cmdInsert.Transaction = transaction;
                                    cmdInsert.CommandText =
                                        "INSERT INTO t_alarme " +
                                        "(Date_Heure_Debut, Valeur, Type, Id_Lieu, Sonde_Numero_Serie, Unite, " +
                                        "Est_Acquittee, Date_Heure_Derniere_Mesure, Est_Alarme_Pour_VigiTel, Est_Mail_Envoye, Est_Tel_Acquittee) " +
                                        "VALUES (NOW(), NULL, @type, @idLieu, @serie, @unite, 0, NOW(), 0, 0, 0);";
                                    cmdInsert.Parameters.AddWithValue("@idLieu", idLieu);
                                    cmdInsert.Parameters.AddWithValue("@type", alarmType);
                                    cmdInsert.Parameters.AddWithValue("@serie", sondeNumeroSerie ?? string.Empty);
                                    cmdInsert.Parameters.AddWithValue("@unite", alarmUnit);
                                    cmdInsert.ExecuteNonQuery();

                                    var cmdId = this.connection_vigitemp.CreateCommand();
                                    cmdId.Transaction = transaction;
                                    cmdId.CommandText = "SELECT LAST_INSERT_ID();";
                                    alarmId = Convert.ToInt32(cmdId.ExecuteScalar());
                                }
                                if (existing == null || existing == DBNull.Value)
                                {
                                    notifyTriggered = true;
                                    capturedAlarmId = alarmId;
                                }
                                else
                                {
                                    var cmdUpdate = this.connection_vigitemp.CreateCommand();
                                    cmdUpdate.Transaction = transaction;
                                    cmdUpdate.CommandText =
                                        "UPDATE t_alarme SET Date_Heure_Derniere_Mesure = NOW(), Unite = @unite, " +
                                        "Est_Acquittee = 0, Est_Tel_Acquittee = 0 " +
                                        "WHERE Id_Alarme = @idAlarme;";
                                    alarmId = Convert.ToInt32(existing);
                                    cmdUpdate.Parameters.AddWithValue("@idAlarme", alarmId.Value);
                                    cmdUpdate.Parameters.AddWithValue("@unite", alarmUnit);
                                    cmdUpdate.ExecuteNonQuery();
                                }

                                transaction.Commit();
                            }
                            catch
                            {
                                try { transaction.Rollback(); } catch { /* ignore */ }
                                throw;
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
                        var cmdResolve = this.connection_vigitemp.CreateCommand();
                        cmdResolve.CommandText =
                            "UPDATE t_alarme " +
                            "SET Date_Heure_Fin = NOW() " +
                            "WHERE Id_Lieu = @idLieu AND " + typeFilterSql + " AND Date_Heure_Fin IS NULL;";
                        cmdResolve.Parameters.AddWithValue("@idLieu", idLieu);
                        cmdResolve.Parameters.AddWithValue("@type", alarmType);
                        var updated = cmdResolve.ExecuteNonQuery();

                        UpdateLieuEndedFlag(idLieu);
                        if (updated > 0)
                        {
                            notifyEnded = true;
                        }
                    }
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(" + logContext + ") SQL Erreur: " + ex.Message);
                    return false;
                }
            }

            if (notifyTriggered)
                _ = AlarmWebNotifier.NotifyRealtimeAlarmAsync(capturedAlarmId, idLieu, "triggered");
            if (notifyEnded)
                _ = AlarmWebNotifier.NotifyRealtimeAlarmAsync(null, idLieu, "ended");

            return true;
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

                    var cmd = this.connection_vigitemp.CreateCommand();
                    cmd.CommandText =
                        "SELECT Id_Alarme, Type, Date_Heure_Debut, Date_Heure_Derniere_Mesure, Valeur, Unite " +
                        "FROM t_alarme " +
                        "WHERE Id_Lieu = @idLieu AND Date_Heure_Fin IS NULL " +
                        "ORDER BY Date_Heure_Debut DESC LIMIT 1;";
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

                    return null;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getActiveAlarmSummary) SQL Erreur: " + ex.Message);
                    return null;
                }
            }
        }

        public bool setThresholdAlarm(int idLieu, string sondeNumeroSerie, string type, double value, string unite, bool isActive)
        {
            bool notifyTriggered = false;
            int? capturedTriggeredAlarmId = null;
            bool notifyEnded = false;

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
                        using (var transaction = connection_vigitemp.BeginTransaction())
                        {
                            try
                            {
                                var cmdCheck = this.connection_vigitemp.CreateCommand();
                                cmdCheck.Transaction = transaction;
                                cmdCheck.CommandText =
                                    "SELECT Id_Alarme FROM t_alarme " +
                                    "WHERE Id_Lieu = @idLieu AND Type = @type AND Date_Heure_Fin IS NULL " +
                                    "ORDER BY Date_Heure_Debut DESC LIMIT 1;";
                                cmdCheck.Parameters.AddWithValue("@idLieu", idLieu);
                                cmdCheck.Parameters.AddWithValue("@type", type);

                                object existing = cmdCheck.ExecuteScalar();

                                if (existing == null || existing == DBNull.Value)
                                {
                                    var cmdInsert = this.connection_vigitemp.CreateCommand();
                                    cmdInsert.Transaction = transaction;
                                    cmdInsert.CommandText =
                                        "INSERT INTO t_alarme " +
                                        "(Date_Heure_Debut, Valeur, Type, Id_Lieu, Sonde_Numero_Serie, Unite, " +
                                        "Est_Acquittee, Date_Heure_Derniere_Mesure, Est_Alarme_Pour_VigiTel, Est_Mail_Envoye, Est_Tel_Acquittee) " +
                                        "VALUES (NOW(), @valeur, @type, @idLieu, @serie, @unite, 0, NOW(), 0, 0, 0);";
                                    cmdInsert.Parameters.AddWithValue("@idLieu", idLieu);
                                    cmdInsert.Parameters.AddWithValue("@type", type);
                                    cmdInsert.Parameters.AddWithValue("@valeur", value);
                                    cmdInsert.Parameters.AddWithValue("@serie", sondeNumeroSerie ?? string.Empty);
                                    cmdInsert.Parameters.AddWithValue("@unite", unite ?? string.Empty);
                                    cmdInsert.ExecuteNonQuery();

                                    var cmdId = this.connection_vigitemp.CreateCommand();
                                    cmdId.Transaction = transaction;
                                    cmdId.CommandText = "SELECT LAST_INSERT_ID();";
                                    alarmId = Convert.ToInt32(cmdId.ExecuteScalar());
                                }
                                if (existing == null || existing == DBNull.Value)
                                {
                                    notifyTriggered = true;
                                    capturedTriggeredAlarmId = alarmId;
                                }
                                else
                                {
                                    var cmdUpdate = this.connection_vigitemp.CreateCommand();
                                    cmdUpdate.Transaction = transaction;
                                    cmdUpdate.CommandText =
                                        "UPDATE t_alarme SET Valeur = @valeur, Unite = @unite, Date_Heure_Derniere_Mesure = NOW(), " +
                                        "Est_Acquittee = 0, Est_Tel_Acquittee = 0 " +
                                        "WHERE Id_Alarme = @idAlarme;";
                                    cmdUpdate.Parameters.AddWithValue("@valeur", value);
                                    cmdUpdate.Parameters.AddWithValue("@unite", unite ?? string.Empty);
                                    alarmId = Convert.ToInt32(existing);
                                    cmdUpdate.Parameters.AddWithValue("@idAlarme", alarmId.Value);
                                    cmdUpdate.ExecuteNonQuery();
                                }

                                transaction.Commit();
                            }
                            catch
                            {
                                try { transaction.Rollback(); } catch { /* ignore */ }
                                throw;
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
                        var cmdResolve = this.connection_vigitemp.CreateCommand();
                        cmdResolve.CommandText =
                            "UPDATE t_alarme " +
                            "SET Date_Heure_Fin = NOW() " +
                            "WHERE Id_Lieu = @idLieu AND Type = @type AND Date_Heure_Fin IS NULL;";
                        cmdResolve.Parameters.AddWithValue("@idLieu", idLieu);
                        cmdResolve.Parameters.AddWithValue("@type", type);
                        var updated = cmdResolve.ExecuteNonQuery();

                        UpdateLieuEndedFlag(idLieu);
                        if (updated > 0)
                        {
                            notifyEnded = true;
                        }
                    }
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(setThresholdAlarm) SQL Erreur: " + ex.Message);
                    return false;
                }
            }

            if (notifyTriggered)
                _ = AlarmWebNotifier.NotifyRealtimeAlarmAsync(capturedTriggeredAlarmId, idLieu, "triggered");
            if (notifyEnded)
                _ = AlarmWebNotifier.NotifyRealtimeAlarmAsync(null, idLieu, "ended");

            return true;
        }

        private bool SetLieuAlarmFlagsV2(int idLieu, bool isPreAlarm, bool isAlarm)
        {
            using (var cmd = this.connection_vigitemp.CreateCommand())
            {
                cmd.CommandText =
                    "UPDATE t_lieu SET " +
                    "Est_Lieu_En_Pre_Alarme = @pre, " +
                    "Est_Lieu_En_Alarme = @alarm " +
                    "WHERE Id_Lieu = @id;";
                cmd.Parameters.AddWithValue("@pre", isPreAlarm ? 1 : 0);
                cmd.Parameters.AddWithValue("@alarm", isAlarm ? 1 : 0);
                cmd.Parameters.AddWithValue("@id", idLieu);
                cmd.ExecuteNonQuery();
            }
            return true;
        }

        private bool SetLieuAlarmFlagsV1(int idLieu, bool isPreAlarm, bool isAlarm)
        {
            using (var cmd = this.connection_vigitemp.CreateCommand())
            {
                cmd.CommandText =
                    "UPDATE t_lieu SET " +
                    "Est_Lieu_En_Pre_Alarme = @pre, " +
                    "Est_Lieu_En_Alarme = @alarm " +
                    "WHERE IdLieu = @id;";
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

                    var cmd = this.connection_vigitemp.CreateCommand();
                    cmd.CommandText =
                        "SELECT IFNULL(Est_Redeclenchement_Immediat, 0) FROM t_lieu WHERE Id_Lieu = @idLieu LIMIT 1;";
                    cmd.Parameters.AddWithValue("@idLieu", idLieu);

                    var raw = cmd.ExecuteScalar();
                    if (raw == null || raw == DBNull.Value)
                    {
                        return false;
                    }

                    return Convert.ToInt32(raw) == 1;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getLieuImmediateRetriggerFlag) SQL Erreur: " + ex.Message);
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

                    var cmd = this.connection_vigitemp.CreateCommand();
                    cmd.CommandText =
                        "UPDATE t_lieu SET Est_Redeclenchement_Immediat = @value WHERE Id_Lieu = @idLieu;";
                    cmd.Parameters.AddWithValue("@value", enabled ? 1 : 0);
                    cmd.Parameters.AddWithValue("@idLieu", idLieu);
                    cmd.ExecuteNonQuery();

                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(setLieuImmediateRetriggerFlag) SQL Erreur: " + ex.Message);
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

                    var cmd = this.connection_vigitemp.CreateCommand();
                    cmd.CommandText =
                        "SELECT MAX(a.Id_Alarme) " +
                        "FROM t_alarme a;";

                    var result = cmd.ExecuteScalar();
                    if (result == null || result == DBNull.Value) return 0;
                    return Convert.ToInt32(result);
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getLastAlarmIdByServeur) SQL Erreur: " + ex.Message);
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
                    var cmd = this.connection_vigitemp.CreateCommand();
                    cmd.CommandText =
                        "SELECT a.Id_Alarme, a.Id_Lieu, a.Type, a.Valeur, a.Unite, a.Date_Heure_Debut " +
                        "FROM t_alarme a " +
                        "WHERE a.Id_Alarme > @lastId " +
                        "AND a.Date_Heure_Debut IS NOT NULL " +
                        "ORDER BY a.Id_Alarme ASC " +
                        "LIMIT @limit;";
                    cmd.Parameters.AddWithValue("@lastId", lastAlarmId);
                    cmd.Parameters.AddWithValue("@limit", limit);

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

                    return list;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getNewAlarmsSince) SQL Erreur: " + ex.Message);
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
                    var cmd = this.connection_vigitemp.CreateCommand();
                    cmd.CommandText =
                        "SELECT a.Id_Alarme, a.Id_Lieu, a.Type, a.Valeur, a.Unite, a.Date_Heure_Debut " +
                        "FROM t_alarme a " +
                        "WHERE a.Date_Heure_Fin IS NULL " +
                        "AND IFNULL(a.Est_Mail_Envoye, 0) <> 1 " +
                        "AND a.Date_Heure_Debut IS NOT NULL " +
                        (maxStartLocalTime.HasValue ? "AND a.Date_Heure_Debut <= @maxStart " : string.Empty) +
                        "ORDER BY a.Id_Alarme ASC " +
                        "LIMIT @limit;";
                    if (maxStartLocalTime.HasValue)
                    {
                        cmd.Parameters.AddWithValue("@maxStart", maxStartLocalTime.Value.ToString("yyyy-MM-dd HH:mm:ss"));
                    }
                    cmd.Parameters.AddWithValue("@limit", limit);

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

                    return list;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getUnsentOpenAlarms) SQL Erreur: " + ex.Message);
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
                    var cmd = this.connection_vigitemp.CreateCommand();
                    cmd.CommandText =
                        "SELECT a.Id_Lieu, a.Id_Alarme " +
                        "FROM t_alarme a " +
                        "WHERE a.Date_Heure_Fin IS NOT NULL " +
                        "AND a.Date_Heure_Fin > @since " +
                        "ORDER BY a.Date_Heure_Fin ASC " +
                        "LIMIT @limit;";
                    cmd.Parameters.AddWithValue("@since", sinceLocalTime.ToString("yyyy-MM-dd HH:mm:ss"));
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

                    return list;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(getEndedAlarmsSince) SQL Erreur: " + ex.Message + " | idServeur=" + idServeur + " | since=" + sinceLocalTime.ToString("yyyy-MM-dd HH:mm:ss") + " | maxCount=" + maxCount);
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

                    var cmd = this.connection_vigitemp.CreateCommand();
                    cmd.CommandText =
                        "UPDATE t_alarme " +
                        "SET Est_Mail_Envoye = 1 " +
                        "WHERE Id_Alarme = @idAlarme;";
                    cmd.Parameters.AddWithValue("@idAlarme", alarmId);
                    cmd.ExecuteNonQuery();

                    return true;
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log("(markAlarmMailSent) SQL Erreur: " + ex.Message + " | alarmId=" + alarmId);
                    return false;
                }
            }
        }

        private void UpdateLieuEndedFlag(int idLieu)
        {
            try
            {
                int count;
                using (var cmdCount = this.connection_vigitemp.CreateCommand())
                {
                    cmdCount.CommandText =
                        "SELECT COUNT(*) FROM t_alarme " +
                        "WHERE Id_Lieu = @idLieu AND Date_Heure_Fin IS NOT NULL AND IFNULL(Est_Acquittee, 0) = 0;";
                    cmdCount.Parameters.AddWithValue("@idLieu", idLieu);
                    count = Convert.ToInt32(cmdCount.ExecuteScalar());
                }

                var flag = count > 0 ? 1 : 0;

                using (var cmdUpdate = this.connection_vigitemp.CreateCommand())
                {
                    cmdUpdate.CommandText =
                        "UPDATE t_lieu SET Est_Lieu_Alarme_Terminee_Non_Acquittee = @flag WHERE Id_Lieu = @idLieu;";
                    cmdUpdate.Parameters.AddWithValue("@flag", flag);
                    cmdUpdate.Parameters.AddWithValue("@idLieu", idLieu);
                    cmdUpdate.ExecuteNonQuery();
                }
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("(UpdateLieuEndedFlag) SQL Erreur idLieu=" + idLieu + ": " + ex.Message);
            }
        }

        public List<(int idLieu, bool isAlarm, bool isNonResponse)> getActiveLieuAlarmStates()
        {
            lock (_lock)
            {
                var result = new List<(int, bool, bool)>();
                if (!EnsureConnected())
                {
                    return result;
                }

                try
                {
                    using (var cmd = this.connection_vigitemp.CreateCommand())
                    {
                        cmd.CommandText =
                            "SELECT l.Id_Lieu, l.Est_Lieu_En_Alarme, " +
                            "CASE WHEN nr.Id_Lieu IS NOT NULL THEN 1 ELSE 0 END AS Has_Non_Reponse " +
                            "FROM t_lieu l " +
                            "LEFT JOIN (SELECT DISTINCT Id_Lieu FROM t_alarme WHERE Type = 'N' AND Date_Heure_Fin IS NULL) nr " +
                            "ON l.Id_Lieu = nr.Id_Lieu " +
                            "WHERE l.Est_Lieu_En_Alarme = 1 OR nr.Id_Lieu IS NOT NULL;";

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
                    VigitempServeur.Log("getActiveLieuAlarmStates MySQL error: " + ex.Message);
                }

                return result;
            }
        }

        private void UpdateLieuAlarmReference(int idLieu, int alarmId)
        {
            try
            {
                using (var cmdUpdate = this.connection_vigitemp.CreateCommand())
                {
                    cmdUpdate.CommandText =
                        "UPDATE t_lieu SET Id_Alarme = @idAlarme WHERE Id_Lieu = @idLieu;";
                    cmdUpdate.Parameters.AddWithValue("@idAlarme", alarmId);
                    cmdUpdate.Parameters.AddWithValue("@idLieu", idLieu);
                    cmdUpdate.ExecuteNonQuery();
                }
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("(UpdateLieuAlarmReference) SQL Erreur idLieu=" + idLieu + " alarmId=" + alarmId + ": " + ex.Message);
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

                var cmd = this.connection_vigitemp.CreateCommand();
                cmd.CommandText = "SELECT t_lieu.Id_Lieu, t_lieu.EMT_Choix_Mode, t_lieu.Est_Correction_Ej, " +
                                  "t_sonde.Sonde_Offset, ta.Coeff_X, ta.Coeff_Constant, te.Err_Justesse, te.Incertitude, te.Date_Validite " +
                                  "FROM t_sonde " +
                                  "LEFT JOIN t_lieu ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie AND t_lieu.Lieu_Etat = 'S' " +
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
                                  "LIMIT 1";
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
                    VigitempServeur.Log("getSondeMetrologyBySerialNumber MySQL error: " + ex.Message);
                }

                return settings;
            }
        }
    }
}






