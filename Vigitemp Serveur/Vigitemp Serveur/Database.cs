﻿using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using System.Configuration;
using System.Diagnostics;
using System.Globalization;

namespace Vigitemp_Serveur
{
    class Database : IDatabaseProvider
    {
        private static readonly object _lock = new object();
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

        private static MySqlConnection CreateConnection(string databaseName)
        {
            var host = GetSetting("Vigitemp.Db.Host", "192.168.63.144");
            var port = GetSettingUInt("Vigitemp.Db.Port", 3306);
            var user = GetSetting("Vigitemp.Db.User", "root");
            var password = GetSetting("Vigitemp.Db.Password", "pass");
            var connectionTimeout = GetSettingUInt("Vigitemp.Db.ConnectionTimeoutSeconds", 5);
            var commandTimeout = GetSettingUInt("Vigitemp.Db.CommandTimeoutSeconds", 30);

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

        // Méthode pour initialiser la connexion 
        private bool InitConnexion()
        {
            VigitempServeur.Log("Tentative de connexion à la BDD...");
            try
            {
                var mainDb = GetSetting("Vigitemp.Db.MainDatabase", "vigitemp");
                var mesureDb = GetSetting("Vigitemp.Db.MeasureDatabase", "vigitemp_mesure");

                CloseConnexion();

                connection_vigitemp = CreateConnection(mainDb);
                connection_vigitemp.Open();

                connection_vigitemp_mesure = CreateConnection(mesureDb);
                connection_vigitemp_mesure.Open();
                VigitempServeur.Log("Tentative réussie!");
                return true;
            }
            catch (Exception ex)
            {
                VigitempServeur.Log("Tentative échouée! " + ex.Message);
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

        public int getIDLieuBySerialNumber(string p_sondSerialNumber)
        {
            lock (_lock)
            {
                //int idLieu = 0;
                int idLieu_tmp = 0;

                if (!InitConnexion())
                {
                    return idLieu_tmp;
                }

                MySqlCommand cmd_vigitemp = connection_vigitemp.CreateCommand();

                cmd_vigitemp.CommandText = "select Id_Lieu FROM t_lieu where Sonde_Numero_Serie = @serial;";
                cmd_vigitemp.Parameters.AddWithValue("@serial", p_sondSerialNumber);


                // Exécution de la commande SQL 
                MySqlDataReader dr_IdLieu = cmd_vigitemp.ExecuteReader();
                while (dr_IdLieu.Read())
                {
                    idLieu_tmp = dr_IdLieu.GetInt32("Id_Lieu");
                }

                dr_IdLieu.Close();
                CloseConnexion();

                return idLieu_tmp;
            }
        }

        public (List<float>, bool notificationActive, DateTime Date_Heure_Reactivation_Alarme) getConsignesLieux(int p_idLieu)
        {
            lock (_lock)
            {
                List<float> array_tmp = new List<float>();
                bool notificationActive_tmp = false;
                DateTime Date_Heure_Reactivation_Alarme_tmp = default(DateTime);

                if (!InitConnexion())
                {
                    return (array_tmp, notificationActive_tmp, Date_Heure_Reactivation_Alarme_tmp);
                }

                MySqlCommand cmd_vigitemp = connection_vigitemp.CreateCommand();

                cmd_vigitemp.CommandText = "select Consigne_Sup, Consigne_Inf, Notification_Active, Date_Heure_Reactivation_Alarme from t_lieu " +
                                            "where Id_Lieu= @idLieu;";
                cmd_vigitemp.Parameters.AddWithValue("@idLieu", p_idLieu);

                // Exécution de la commande SQL 
                MySqlDataReader dr_ConsignesLieux = cmd_vigitemp.ExecuteReader();
                while (dr_ConsignesLieux.Read())
                {
                    //array_tmp.Add((float)dr_ConsignesLieux["Consigne_Inf"]);
                    array_tmp.Add(float.Parse(dr_ConsignesLieux["Consigne_Inf"].ToString()));
                    //array_tmp.Add(float.Parse(String.Format("{0:0.00}", dr_ConsignesLieux["Consigne_Sup"])));
                    array_tmp.Add(float.Parse(dr_ConsignesLieux["Consigne_Sup"].ToString()));

                    notificationActive_tmp = dr_ConsignesLieux.GetBoolean("Notification_Active");
                    //VigitempServeur.Log("Date_Heure_Reactivation_Alarme POUR LE LIEU " + p_idLieu + ": " + dr_ConsignesLieux["Date_Heure_Reactivation_Alarme"].ToString());
                    if (dr_ConsignesLieux["Date_Heure_Reactivation_Alarme"].ToString() != "")
                    {
                        //VigitempServeur.Log("V2 IL Y A UNE Date_Heure_Reactivation_Alarme POUR LE LIEU " + p_idLieu);
                        Date_Heure_Reactivation_Alarme_tmp = DateTime.Parse(dr_ConsignesLieux["Date_Heure_Reactivation_Alarme"].ToString());
                    }
                    else
                    {
                        //VigitempServeur.Log("V2 PAS DE Date_Heure_Reactivation_Alarme POUR LE LIEU " + p_idLieu);
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

                dr_ConsignesLieux.Close();
                CloseConnexion();

                return (array_tmp, notificationActive_tmp, Date_Heure_Reactivation_Alarme_tmp);
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

        private LieuAlarmSettings ReadLieuAlarmSettingsV2(int idLieu)
        {
            // Prisma schema convention: Id_Lieu, Sonde_Numero_Serie, ...
            var cmd = this.connection_vigitemp.CreateCommand();
            cmd.CommandText =
                "SELECT " +
                "Id_Lieu, " +
                "Consigne_Inf, Est_Consigne_Inf_Active, Retard_Alarme_Bas, Consigne_Inf_Pre_Alarme, Est_Consigne_Inf_Pre_Alarme_Active, " +
                "Consigne_Sup, Est_Consigne_Sup_Active, Retard_Alarme_Haut, Consigne_Sup_Pre_Alarme, Est_Consigne_Sup_Pre_Alarme_Active " +
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
                    // Legacy fields not present in Prisma schema: default to "enabled"
                    notificationActive: true,
                    dateHeureReactivationAlarme: default(DateTime));
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
                "Retard_Alarme_Bas, Retard_Alarme_Haut, " +
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
                        notificationActive: false,
                        dateHeureReactivationAlarme: default(DateTime));
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
                    notificationActive: notificationActive,
                    dateHeureReactivationAlarme: reactivationAt);
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

                    if (!InitConnexion())
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

                        // Exécution de la commande SQL 
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
                    
                    CloseConnexion();
                    //return (array_ip_tmp, idLieu_tmp);
                    return (array_ip_tmp);
                }
                catch (Exception e)
                {
                    //dr_idLieu.Close();
                    //dr_PCsClients.Close();
                    CloseConnexion();
                    VigitempServeur.Log("erreur getPCsClients: " + e);

                    return array_ip_tmp;
                }
            }
        }


        public bool AddMesure(string p_numeroSerie, double p_valeur, string p_unite, string p_resistance)
        {
            lock (_lock)
            {
                try
                {

                        // Ouverture de la connexion SQL
                        if (!InitConnexion())
                        {
                            return false;
                        }

                        // Création d'une commande SQL en fonction de l'objet connection
                        MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();

                        // Requête SQL - Ajout de IdSonde à la sélection
                        cmd_vigitemp.CommandText = "SELECT Frequence, Consigne, Consigne_Sup, Consigne_Inf, t_module.Id_Serveur, Nom_Lieu, Id_Lieu, t_lieu.Sonde_Numero_Serie, t_sonde.Id_Sonde FROM t_lieu " +
                                                    "INNER JOIN t_sonde ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                                                    "INNER JOIN t_module ON t_sonde.Id_Module = t_module.Id_Module " +
                                                    "WHERE t_lieu.Sonde_Numero_Serie = @serial " +
                                                    "AND t_sonde.Etat_Sonde = 'S' " +
                                                    "AND IFNULL(t_sonde.Est_Sonde_GSO, 0) = 0;";
                        cmd_vigitemp.Parameters.AddWithValue("@serial", p_numeroSerie);

                        // Exécution de la commande SQL
                        int idSonde;
                        int idLieu;
                        float consigne;
                        float consigneSup;
                        float consigneInf;
                        int frequence;
                        object idServeur;

                        using (var dr_lieux = cmd_vigitemp.ExecuteReader())
                        {
                            if (!dr_lieux.Read())
                            {
                                CloseConnexion();
                                VigitempServeur.Log("(AddMesure) Aucune ligne t_lieu pour la sonde: " + p_numeroSerie);
                                return false;
                            }

                            // Récupérer l'IdSonde pour le cache
                            idSonde = (int)dr_lieux["Id_Sonde"];
                            idLieu = (int)dr_lieux["Id_Lieu"];
                            consigne = float.Parse(dr_lieux["Consigne"].ToString());
                            consigneSup = float.Parse(dr_lieux["Consigne_Sup"].ToString());
                            consigneInf = float.Parse(dr_lieux["Consigne_Inf"].ToString());
                            frequence = (int)dr_lieux["Frequence"];
                            idServeur = dr_lieux["Id_Serveur"];
                        }

                        var now = DateTime.Now;
                        MySqlCommand cmd_vigitemp_mesure = this.connection_vigitemp_mesure.CreateCommand();
                        cmd_vigitemp_mesure.CommandText = "INSERT INTO tm_mesures " +
                                                            "(Id_Serveur_BDD, Date_Heure_Mesure, Valeur, Valeur_Brute, Consigne, Consigne_Sup, Consigne_Inf, Unite, Frequence, Sonde_Numero_Serie, Id_Lieu) " +
                                                            "VALUES " +
                                                            "(@idserveurbdd, @dateheuremesure, @valeur, @resistance, @consigne, @consignesup, @consigneinf, @unite, @frequence, @sondenumeroserie, @idlieu)";

                        // utilisation de l'objet contact passé en paramètre 
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@idserveurbdd", idServeur);
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

                        cmd_vigitemp_mesure.ExecuteNonQuery();

                        var cmd_vigitemp_updateLieu = this.connection_vigitemp.CreateCommand();
                        cmd_vigitemp_updateLieu.CommandText = "UPDATE t_lieu SET " +
                                                              "Derniere_Date_Heure = @dateheuremesure, " +
                                                              "Date_Heure_Derniere_Reponse_Recue_OK = @dateheuremesure, " +
                                                              "Derniere_Valeur = @valeur, " +
                                                              "Derniere_Unite = @unite " +
                                                              "WHERE Id_Lieu = @idlieu;";
                        cmd_vigitemp_updateLieu.Parameters.AddWithValue("@dateheuremesure", now.ToString("yyyy-MM-dd HH:mm:ss.fff"));
                        cmd_vigitemp_updateLieu.Parameters.AddWithValue("@valeur", p_valeur);
                        cmd_vigitemp_updateLieu.Parameters.AddWithValue("@unite", p_unite);
                        cmd_vigitemp_updateLieu.Parameters.AddWithValue("@idlieu", idLieu);
                        cmd_vigitemp_updateLieu.ExecuteNonQuery();

                        // Insérer la mesure dans ts_graphique (cache pour les graphs)
                        double resistance = 0;
                        if (!string.IsNullOrWhiteSpace(p_resistance))
                        {
                            double.TryParse(p_resistance, NumberStyles.Any, CultureInfo.InvariantCulture, out resistance);
                        }

                        CacheService.InsertMeasureToGraphique(
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
                            0  // Etat_Alarme par défaut à 0
                        );

                        //check declenchement alarm
                        //requete consigne sondes

                        //si en dehors, check conditions d'alamres
                        //si conditions alors envoyer alarmes

                        //probleme : si plusieurs alarmes, je veut en enlever une comment faire?
                        //le texte change uniquement en fct du type d'alarme et pas en fonction du materiel

                        // Fermeture de la connexion
                        CloseConnexion();

                        VigitempServeur.nombres_reponses++;
                        return true;
                }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(AddMesure) SQL Erreur: " + ex);
                    return false;
                }
            }
        }

        public (List<string>, List<string>, List<string>, List<string>, List<int>, List<DateTime?>) getInfosByIdServeurAndFrequencies(int p_idServer, int p_frequence)
        {
            lock (_lock)
            {
                try
                {
                        List<string> tmp_arr_sondeNumeroSerie = new List<string>();
                        List<string> tmp_arr_sondeAdresse = new List<string>();
                        List<string> tmp_arr_moduleNumeroSerie = new List<string>();
                        List<string> tmp_arr_portSerie = new List<string>();
                        List<int> tmp_arr_idLieu = new List<int>();
                        List<DateTime?> tmp_arr_lastMeasure = new List<DateTime?>();

                        // Ouverture de la connexion SQL
                        if (!InitConnexion())
                        {
                            CloseConnexion();
                            return (tmp_arr_portSerie, tmp_arr_sondeNumeroSerie, tmp_arr_sondeAdresse, tmp_arr_moduleNumeroSerie, tmp_arr_idLieu, tmp_arr_lastMeasure);
                        }

                        // Création d'une commande SQL en fonction de l'objet connection
                        MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();

                        cmd_vigitemp.CommandText = "SELECT t_lieu.Id_Lieu, t_lieu.Derniere_Date_Heure, t_module.Port_Serie, t_module.Module_Numero_Serie, t_sonde.Sonde_Numero_Serie, t_sonde.Adresse_Sonde FROM t_lieu " +
                                                    "INNER JOIN t_sonde ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                                                    "INNER JOIN t_module ON t_sonde.Id_Module = t_module.Id_Module " +
                                                    "WHERE t_lieu.Frequence = @frequence " +
                                                    "AND t_module.Id_Serveur = @idServeur " +
                                                    "AND t_lieu.Lieu_Etat = 'S' " +
                                                    "AND t_sonde.Etat_Sonde = 'S' " +
                                                    "AND IFNULL(t_sonde.Est_Sonde_GSO, 0) = 0;";
                        cmd_vigitemp.Parameters.AddWithValue("@frequence", p_frequence);
                        cmd_vigitemp.Parameters.AddWithValue("@idServeur", p_idServer);


                        // Exécution de la commande SQL
                        MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
                        while (dr_lieux.Read())
                        {
                            tmp_arr_portSerie.Add("COM" + dr_lieux["Port_Serie"].ToString());
                            tmp_arr_sondeNumeroSerie.Add(dr_lieux["Sonde_Numero_Serie"].ToString());
                            tmp_arr_sondeAdresse.Add(dr_lieux["Adresse_Sonde"].ToString());
                            tmp_arr_moduleNumeroSerie.Add(dr_lieux["Module_Numero_Serie"].ToString());
                            tmp_arr_idLieu.Add(Int32.Parse(dr_lieux["Id_Lieu"].ToString()));
                            if (dr_lieux["Derniere_Date_Heure"] == DBNull.Value)
                            {
                                tmp_arr_lastMeasure.Add(null);
                            }
                            else
                            {
                                tmp_arr_lastMeasure.Add(DateTime.Parse(dr_lieux["Derniere_Date_Heure"].ToString()));
                            }
                        }

                        dr_lieux.Close();
                        // Fermeture de la connexion
                        CloseConnexion();


                        return (tmp_arr_portSerie, tmp_arr_sondeNumeroSerie, tmp_arr_sondeAdresse, tmp_arr_moduleNumeroSerie, tmp_arr_idLieu, tmp_arr_lastMeasure);
                    }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(getInfosByIdServeurAndFrequencies) SQL Erreur: " + ex);
                    return (new List<string>(), new List<string>(), new List<string>(), new List<string>(), new List<int>(), new List<DateTime?>());
                }
            }
        }

        public (string, string, string, string) getInfosByIdLieu(int p_idLieu)
        {
            lock (_lock)
            {
                try
                {
                        string tmp_arr_sondeNumeroSerie = "";
                        string tmp_arr_sondeAdresse = "";
                        string tmp_arr_moduleNumeroSerie = "";
                        string tmp_arr_portSerie = "";

                        // Ouverture de la connexion SQL
                        if (!InitConnexion())
                        {
                            CloseConnexion();
                            return (tmp_arr_portSerie, tmp_arr_sondeNumeroSerie, tmp_arr_sondeAdresse, tmp_arr_moduleNumeroSerie);
                        }

                        // Création d'une commande SQL en fonction de l'objet connection
                        MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();

                        cmd_vigitemp.CommandText = "SELECT t_module.Port_Serie, t_module.Module_Numero_Serie, t_sonde.Sonde_Numero_Serie, t_sonde.Adresse_Sonde FROM t_lieu " +
                                                    "INNER JOIN t_sonde ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                                                    "INNER JOIN t_module ON t_sonde.Id_Module = t_module.Id_Module " +
                                                    "WHERE t_lieu.Id_Lieu = @idLieu;";
                        cmd_vigitemp.Parameters.AddWithValue("@idLieu", p_idLieu);


                        // Exécution de la commande SQL
                        MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
                        while (dr_lieux.Read())
                        {
                            tmp_arr_portSerie = ("COM" + dr_lieux["Port_Serie"].ToString());
                            tmp_arr_sondeNumeroSerie = (dr_lieux["Sonde_Numero_Serie"].ToString());
                            tmp_arr_sondeAdresse = (dr_lieux["Adresse_Sonde"].ToString());
                            tmp_arr_moduleNumeroSerie = (dr_lieux["Module_Numero_Serie"].ToString());
                        }

                        dr_lieux.Close();
                        // Fermeture de la connexion
                        CloseConnexion();


                        return (tmp_arr_portSerie, tmp_arr_sondeNumeroSerie, tmp_arr_sondeAdresse, tmp_arr_moduleNumeroSerie);
                    }
                catch (Exception ex)
                {
                    CloseConnexion();
                    VigitempServeur.Log("(getInfosByIdLieu) SQL Erreur: " + ex);
                    return ("", "", "", "");
                }
            }
        }

        public List<int> getDistinctIdServeur()
        {
            lock (_lock)
            {
                List<int> array_tmp = new List<int>();

                if (!InitConnexion())
                {
                    return array_tmp;
                }

                MySqlCommand cmd_vigitemp = connection_vigitemp.CreateCommand();

                cmd_vigitemp.CommandText = "SELECT distinct Id_Serveur FROM t_sonde " +
                                            "where Etat_Sonde = 'S' " +
                                            "AND IFNULL(Est_Sonde_GSO, 0) = 0;";


                // Exécution de la commande SQL 
                MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
                while (dr_lieux.Read())
                {
                    array_tmp.Add((int)dr_lieux["Id_Serveur"]);
                }

                dr_lieux.Close();
                CloseConnexion();

                return array_tmp;
            }
        }

        public List<int> getDistinctFrequenciesByIdServeur(int p_idServeur)
        {
            lock (_lock)
            {
                List<int> array_tmp = new List<int>();

                if (!InitConnexion())
                {
                    return array_tmp;
                }

                MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();

                cmd_vigitemp.CommandText = "SELECT distinct frequence FROM t_lieu " +
                                            "INNER JOIN t_sonde ON t_lieu.Sonde_Numero_Serie = t_sonde.Sonde_Numero_Serie " +
                                            "INNER JOIN t_module ON t_sonde.Id_Module = t_module.Id_Module " +
                                            "where t_module.Id_Serveur = @idServeur " +
                                            "AND t_lieu.Lieu_Etat = 'S' " +
                                            "AND t_sonde.Etat_Sonde = 'S' " +
                                            "AND IFNULL(t_sonde.Est_Sonde_GSO, 0) = 0;";
                cmd_vigitemp.Parameters.AddWithValue("@idServeur", p_idServeur);


                // Exécution de la commande SQL 
                MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
                while (dr_lieux.Read())
                {
                    var freqObj = dr_lieux["frequence"];
                    if (freqObj == null || freqObj == DBNull.Value) continue;

                    var freqRaw = freqObj.ToString();
                    if (string.IsNullOrWhiteSpace(freqRaw)) continue;

                    if (!int.TryParse(freqRaw, out var frequency))
                    {
                        VigitempServeur.Log("Frequence invalide (t_lieu): " + freqRaw);
                        continue;
                    }

                    array_tmp.Add(frequency);
                }

                dr_lieux.Close();
                CloseConnexion();

                return array_tmp;
            }
        }

        public (List<int>, List<DateTime>) getLieuxAvecAlarmesEnSnooze()
        {
            lock (_lock)
            {
                List<int> array_tmpIdLieu = new List<int>();
                List<DateTime> array_tmpSnoozeDateTime = new List<DateTime>();

                if (!InitConnexion())
                {
                    return (array_tmpIdLieu, array_tmpSnoozeDateTime);
                }

                MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();

                cmd_vigitemp.CommandText = "SELECT distinct Id_Lieu, Date_Heure_Reactivation_Alarme FROM t_lieu " +
                                            "where Date_Heure_Reactivation_Alarme is not null;";


                // Exécution de la commande SQL 
                MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
                while (dr_lieux.Read())
                {
                    array_tmpIdLieu.Add(Int32.Parse(dr_lieux["Id_Lieu"].ToString()));
                    //VigitempServeur.Log("Date_Heure_Reactivation_Alarme " + DateTime.Parse(dr_lieux["Date_Heure_Reactivation_Alarme"].ToString()).ToString());
                    array_tmpSnoozeDateTime.Add(DateTime.Parse(dr_lieux["Date_Heure_Reactivation_Alarme"].ToString()));
                }

                dr_lieux.Close();
                CloseConnexion();

                return (array_tmpIdLieu, array_tmpSnoozeDateTime);
            }
        }

        public double getLastMeasure(int p_IdLieu)
        {
            lock (_lock)
            {
                double array_tmpIdLieu = 0.00;
                 //= new List<DateTime>();

                if (!InitConnexion())
                {
                    return array_tmpIdLieu;
                }

                MySqlCommand cmd_vigitemp_mesure = this.connection_vigitemp_mesure.CreateCommand();

                cmd_vigitemp_mesure.CommandText =   "SELECT * from tm_mesures " + 
                                                    "WHERE Id_Lieu = @idLieu " +
                                                    "ORDER BY Date_Heure_Mesure DESC LIMIT 1";
                cmd_vigitemp_mesure.Parameters.AddWithValue("@idLieu", p_IdLieu);


                VigitempServeur.Log(cmd_vigitemp_mesure.CommandText);
                // Exécution de la commande SQL 
                MySqlDataReader dr_mesure = cmd_vigitemp_mesure.ExecuteReader();
                while (dr_mesure.Read())
                {
                    array_tmpIdLieu = double.Parse(dr_mesure["Valeur"].ToString());
                    //VigitempServeur.Log("Date_Heure_Reactivation_Alarme " + DateTime.Parse(dr_lieux["Date_Heure_Reactivation_Alarme"].ToString()).ToString());
                }

                dr_mesure.Close();
                CloseConnexion();

                return array_tmpIdLieu;
            }
        }

        public bool setAlarmeByIdLieu(int p_idLieu, bool p_valeur)
        {
            lock (_lock)
            {
                try
                {
                    // Ouverture de la connexion SQL
                    if (!InitConnexion())
                    {
                        return false;
                    }

                    // Création d'une commande SQL en fonction de l'objet connection
                    MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();



                    // Exécution de la commande SQL
                    //MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
                    //dr_lieux.Read();

                    //if(valeur == true)
                    //{
                    cmd_vigitemp.CommandText = "UPDATE t_lieu " +
                                                 "SET Notification_Active = @valeur, " +
                                                 "Date_Heure_Reactivation_Alarme = NULL " +
                                                 "WHERE Id_Lieu = @idLieu;";

                    //}

                    //cmd_vigitemp.CommandText = "UPDATE t_lieu " +
                    //                            "SET Notification_Active = @valeur, " +
                    //                            "Date_Heure_Reactivation_Alarme = NULL ;";

                    // utilisation de l'objet contact passé en paramètre 
                    cmd_vigitemp.Parameters.AddWithValue("@valeur", p_valeur);
                    cmd_vigitemp.Parameters.AddWithValue("@idLieu", p_idLieu);
                    //cmd_vigitemp_mesure.Parameters.AddWithValue("@dateheuremesure", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"));
                    //cmd_vigitemp_mesure.Parameters.AddWithValue("@valeur", p_valeur);
                    //cmd_vigitemp_mesure.Parameters.AddWithValue("@resistance", p_resistance);
                    //cmd_vigitemp_mesure.Parameters.AddWithValue("@unite", p_unite);
                    //cmd_vigitemp_mesure.Parameters.AddWithValue("@consigne", dr_lieux["Consigne"]);
                    //cmd_vigitemp_mesure.Parameters.AddWithValue("@consignesup", dr_lieux["Consigne_Sup"]);
                    //cmd_vigitemp_mesure.Parameters.AddWithValue("@consigneinf", dr_lieux["Consigne_Inf"]);
                    //cmd_vigitemp_mesure.Parameters.AddWithValue("@frequence", dr_lieux["Frequence"]);
                    //cmd_vigitemp_mesure.Parameters.AddWithValue("@sondenumeroserie", p_numeroSerie);
                    //cmd_vigitemp_mesure.Parameters.AddWithValue("@idlieu", dr_lieux["IdLieu"]);
                    //VigitempServeur.Log(cmd_vigitemp.CommandText);


                    cmd_vigitemp.ExecuteNonQuery();

                    //dr_lieux.Close();

                    //check declenchement alarm
                    //requete consigne sondes

                    //si en dehors, check conditions d'alamres
                    //si conditions alors envoyer alarmes

                    //probleme : si plusieurs alarmes, je veut en enlever une comment faire?
                    //le texte change uniquement en fct du type d'alarme et pas en fonction du materiel

                    // Fermeture de la connexion
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
                finally
                {
                    CloseConnexion();
                }
            }
        }

        private bool SetLieuAlarmFlagsV2(int idLieu, bool isPreAlarm, bool isAlarm)
        {
            var cmd = this.connection_vigitemp.CreateCommand();
            cmd.CommandText =
                "UPDATE t_lieu SET " +
                "Est_Lieu_En_Pre_Alarme = @pre, " +
                "Est_Lieu_En_Alarme = @alarm " +
                "WHERE Id_Lieu = @id;";
            cmd.Parameters.AddWithValue("@pre", isPreAlarm ? 1 : 0);
            cmd.Parameters.AddWithValue("@alarm", isAlarm ? 1 : 0);
            cmd.Parameters.AddWithValue("@id", idLieu);
            cmd.ExecuteNonQuery();
            return true;
        }

        private bool SetLieuAlarmFlagsV1(int idLieu, bool isPreAlarm, bool isAlarm)
        {
            var cmd = this.connection_vigitemp.CreateCommand();
            cmd.CommandText =
                "UPDATE t_lieu SET " +
                "Est_Lieu_En_Pre_Alarme = @pre, " +
                "Est_Lieu_En_Alarme = @alarm " +
                "WHERE IdLieu = @id;";
            cmd.Parameters.AddWithValue("@pre", isPreAlarm ? 1 : 0);
            cmd.Parameters.AddWithValue("@alarm", isAlarm ? 1 : 0);
            cmd.Parameters.AddWithValue("@id", idLieu);
            cmd.ExecuteNonQuery();
            return true;
        }

        public (double, double) getCoeffCalibrageBySerialNumber(string p_serial_number)
        {
            lock (_lock)
            {
                double coeffX, coeffConstant;

                if (!InitConnexion())
                {
                    return (1, 0);
                }

                MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();

                cmd_vigitemp.CommandText = "SELECT Coeff_X, Coeff_Constant FROM t_calibrage " +
                                            "where Sonde_Numero_Serie = @serial " +
                                            "ORDER BY Date_Heure_Calibrage DESC " +
                                            "LIMIT 1";
                cmd_vigitemp.Parameters.AddWithValue("@serial", p_serial_number);

                // Exécution de la commande SQL
                try
                {
                    MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
                    dr_lieux.Read();
                    coeffX = Convert.ToDouble(dr_lieux["Coeff_X"]);
                    coeffConstant = Convert.ToDouble(dr_lieux["Coeff_Constant"]);
                    dr_lieux.Close();
                }
                catch
                {
                    //Console.WriteLine("ERREUR : PAS DE CALIBRAGE POUR LA SONDE " + p_serial_number + "\n" + sqle);
                    //Trace.WriteLine("ERREUR : PAS DE CALIBRAGE POUR LA SONDE " + p_serial_number);
                    VigitempServeur.Log("ERREUR : PAS DE CALIBRAGE POUR LA SONDE " + p_serial_number);
                    CloseConnexion();
                    return (1, 0);
                }

                CloseConnexion();

                return (coeffX, coeffConstant);
            }
        }
    }
}
