using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using System.Diagnostics;
using System.Globalization;

namespace Vigitemp_Serveur
{
    class Database
    {
        private static readonly object _lock = new object();
        private static readonly string IP_ADDRESS = "192.168.63.121";
        private static readonly string PORT = "3306";
        private static readonly string UID = "root";
        private static readonly string PASSWORD = "pass";
        private MySqlConnection connection_vigitemp;
        private MySqlConnection connection_vigitemp_mesure;

        // Constructeur
        public Database()
        {
            //this.InitConnexion();
        }

        // Méthode pour initialiser la connexion 
        private void InitConnexion()
        {
            VigitempServeur.Log("Tentative de connexion à la BDD...");
            try
            {
                string connectionString = "SERVER=" + IP_ADDRESS + "; Port=" + PORT + "; DATABASE=vigitemp; UID=" + UID + "; PASSWORD=" + PASSWORD + ";";
                if (connection_vigitemp == null)
                {
                    connection_vigitemp = new MySqlConnection(connectionString);
                }
                connection_vigitemp.Open();

                connectionString = "SERVER=" + IP_ADDRESS + "; Port=" + PORT + "; DATABASE=vigitemp_mesure; UID=" + UID + "; PASSWORD=" + PASSWORD + ";";
                if (connection_vigitemp_mesure == null)
                {
                    connection_vigitemp_mesure = new MySqlConnection(connectionString);
                }
                connection_vigitemp_mesure.Open();
                VigitempServeur.Log("Tentative Réussi!");
            }
            catch /*(Exception e)*/
            {
                VigitempServeur.Log("Tentative echoué!");
            }
           
        }

        private void CloseConnexion()
        {
            this.connection_vigitemp?.Close();
            this.connection_vigitemp_mesure?.Close();
        }

        public int getIDLieuBySerialNumber(string p_sondSerialNumber)
        {
            lock (_lock)
            {
                //int idLieu = 0;
                int idLieu_tmp = 0;

                InitConnexion();

                MySqlCommand cmd_vigitemp = connection_vigitemp.CreateCommand();

                cmd_vigitemp.CommandText = "select IdLieu FROM t_lieu where SondeNumeroSerie = '"+p_sondSerialNumber+"'";


                // Exécution de la commande SQL 
                MySqlDataReader dr_IdLieu = cmd_vigitemp.ExecuteReader();
                while (dr_IdLieu.Read())
                {
                    idLieu_tmp = dr_IdLieu.GetInt32("IdLieu");
                }

                dr_IdLieu.Close();
                CloseConnexion();

                return idLieu_tmp;
            }
        }

        public (List<float>, bool notificationActive, DateTime dateHeure_reactivationAlarme) getConsignesLieux(int p_idLieu)
        {
            lock (_lock)
            {
                List<float> array_tmp = new List<float>();
                bool notificationActive_tmp = false;
                DateTime dateHeure_reactivationAlarme_tmp = default(DateTime);

                InitConnexion();

                MySqlCommand cmd_vigitemp = connection_vigitemp.CreateCommand();

                cmd_vigitemp.CommandText = "select Consigne_Sup, Consigne_Inf, notification_active, DateHeure_reactivationAlarme from t_lieu " +
                                            "where IdLieu= '"+ p_idLieu + "';";

                // Exécution de la commande SQL 
                MySqlDataReader dr_ConsignesLieux = cmd_vigitemp.ExecuteReader();
                while (dr_ConsignesLieux.Read())
                {
                    //array_tmp.Add((float)dr_ConsignesLieux["Consigne_Inf"]);
                    array_tmp.Add(float.Parse(dr_ConsignesLieux["Consigne_Inf"].ToString()));
                    //array_tmp.Add(float.Parse(String.Format("{0:0.00}", dr_ConsignesLieux["Consigne_Sup"])));
                    array_tmp.Add(float.Parse(dr_ConsignesLieux["Consigne_Sup"].ToString()));

                    notificationActive_tmp = dr_ConsignesLieux.GetBoolean("notification_active");
                    //VigitempServeur.Log("DATEHEURE_REACTIVATIONALARME POUR LE LIEU " + p_idLieu + ": " + dr_ConsignesLieux["DateHeure_reactivationAlarme"].ToString());
                    if (dr_ConsignesLieux["DateHeure_reactivationAlarme"].ToString() != "")
                    {
                        //VigitempServeur.Log("V2 IL Y A UNE DATEHEURE_REACTIVATIONALARME POUR LE LIEU " + p_idLieu);
                        dateHeure_reactivationAlarme_tmp = DateTime.Parse(dr_ConsignesLieux["DateHeure_reactivationAlarme"].ToString());
                    }
                    else
                    {
                        //VigitempServeur.Log("V2 PAS DE DATEHEURE_REACTIVATIONALARME POUR LE LIEU " + p_idLieu);
                    }
                    //if (DateTime.TryParse(dr_ConsignesLieux["DateHeure_reactivationAlarme"].ToString(), out dateHeure_reactivationAlarme_tmp))
                    //if (DateTime.TryParseExact(dr_ConsignesLieux["DateHeure_reactivationAlarme"].ToString(), "yyyy-M-d h:m:s" ,new CultureInfo("FR-fr"),DateTimeStyles.None,out dateHeure_reactivationAlarme_tmp))
                    //{
                    //    VigitempServeur.Log("V2 PAS DE DATEHEURE_REACTIVATIONALARME POUR LE LIEU " + p_idLieu);
                    //}
                    //else
                    //{
                    //    VigitempServeur.Log("V2 IL Y A UNE DATEHEURE_REACTIVATIONALARME POUR LE LIEU " + p_idLieu);
                    //}
                    //dateHeure_reactivationAlarme_tmp = DateTime.Parse(dr_ConsignesLieux["DateHeure_reactivationAlarme"].ToString());
                }

                dr_ConsignesLieux.Close();
                CloseConnexion();

                return (array_tmp, notificationActive_tmp, dateHeure_reactivationAlarme_tmp);
            }
        }

        public List<string> getPCsClients()
        {
            lock (_lock)
            {
                try
                {
                    //VigitempServeur.Log("getPCsClients");
                    List<string> array_ip_tmp = new List<string>();
                    //int idLieu_tmp = 0;
                    //bool alarme_active = false;

                    InitConnexion();

                    MySqlCommand cmd_vigitemp = connection_vigitemp.CreateCommand();

                    //cmd_vigitemp.CommandText = "select ip_client, t_lieu.idLieu from t_clients_notifications " +
                    //                            "inner join t_lieu on t_clients_notifications.id_Lieu = t_lieu.idLieu " +
                    //                            "where SondeNumeroSerie = '"+p_sondSerialNumber+"';";
                    //cmd_vigitemp.CommandText = "select IdLieu, notification_active from t_lieu where SondeNumeroSerie='"+p_sondSerialNumber+"';";
                    //MySqlDataReader dr_idLieu = cmd_vigitemp.ExecuteReader();
                    //while (dr_idLieu.Read())
                    //{
                    //    //alarme_active = true;
                    //    idLieu_tmp = dr_idLieu.GetInt32("IdLieu");
                    //    alarme_active = dr_idLieu.GetBoolean("notification_active");
                    //    VigitempServeur.Log("(string)dr_idLieu['IdLieu']: " + idLieu_tmp);
                    //    VigitempServeur.Log("dr_idLieu.GetBoolean('notification_active'): " + alarme_active);

                    //}
                    //dr_idLieu.Close();

                    //if((whichAreActive == true && alarme_active == true) || (whichAreActive == false && alarme_active == false))
                    //{
                        cmd_vigitemp.CommandText = "select AdresseIPConnexion from t_postes_clients";

                        // Exécution de la commande SQL 
                        MySqlDataReader dr_PCsClients = cmd_vigitemp.ExecuteReader();

                        //cmd_vigitemp.CommandText = "select IdLieu from t_lieu where SondeNumeroSerie='" + p_sondSerialNumber + "';";
                        //MySqlDataReader dr_idLieu = cmd_vigitemp.ExecuteReader();
                        while (dr_PCsClients.Read())
                        {
                            array_ip_tmp.Add((string)dr_PCsClients["AdresseIPConnexion"]);
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

                    return (null);
                }
            }
        }


        public bool AddMesure(string p_numeroSerie, double p_valeur, string p_unite, string p_resistance)
        {
            lock (_lock)
            {
                if (this.connection_vigitemp != null || this.connection_vigitemp_mesure != null)
                {
                    try
                    {

                        // Ouverture de la connexion SQL
                        InitConnexion();

                        // Création d'une commande SQL en fonction de l'objet connection
                        MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();

                        // Requête SQL
                        cmd_vigitemp.CommandText = "SELECT Frequence, Consigne, Consigne_Sup, Consigne_Inf, t_module.IDserveur, Nom_Lieu, IdLieu, t_lieu.SondeNumeroSerie FROM t_lieu " +
                                                    "INNER JOIN t_sonde ON t_lieu.SondeNumeroSerie = t_sonde.SondeNumeroSerie " +
                                                    "INNER JOIN t_module ON t_sonde.idModule = t_module.idModule " +
                                                    "WHERE t_lieu.SondeNumeroSerie = '" + p_numeroSerie + "';";

                        // Exécution de la commande SQL
                        MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
                        dr_lieux.Read();

                        MySqlCommand cmd_vigitemp_mesure = this.connection_vigitemp_mesure.CreateCommand();
                        cmd_vigitemp_mesure.CommandText = "INSERT INTO ts_mesure " +
                                                            "(IdServeurBDD, DateHeureMesure, Valeur, Resistance, Consigne, Consigne_Sup, Consigne_Inf, Unite, Frequence, SondeNumeroSerie, IdLieu) " +
                                                            "VALUES " +
                                                            "(@idserveurbdd, @dateheuremesure, @valeur, @resistance, @consigne, @consignesup, @consigneinf, @unite, @frequence, @sondenumeroserie, @idlieu)";

                        // utilisation de l'objet contact passé en paramètre 
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@IdServeurBDD", dr_lieux["IDserveur"]);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@dateheuremesure", DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"));
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@valeur", p_valeur);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@resistance", p_resistance);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@unite", p_unite);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@consigne", dr_lieux["Consigne"]);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@consignesup", dr_lieux["Consigne_Sup"]);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@consigneinf", dr_lieux["Consigne_Inf"]);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@frequence", dr_lieux["Frequence"]);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@sondenumeroserie", p_numeroSerie);
                        cmd_vigitemp_mesure.Parameters.AddWithValue("@idlieu", dr_lieux["IdLieu"]);

                        cmd_vigitemp_mesure.ExecuteNonQuery();

                        dr_lieux.Close();

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
                        //Console.WriteLine("(AddMesure) SQL Erreur: " + ex.StackTrace + ex.Message);
                        //Trace.WriteLine("(AddMesure) SQL Erreur: " + ex.StackTrace + ex.Message);
                        VigitempServeur.Log("(AddMesure) SQL Erreur: " + ex.StackTrace + ex.Message);
                        
                        return false;
                    }
                }

                return false;
            }
        }

        public (List<string>, List<string>, List<string>, List<string>) getInfosByIdServeurAndFrequencies(int p_idServer, int p_frequence)
        {
            lock (_lock)
            {
                if (this.connection_vigitemp != null || this.connection_vigitemp_mesure != null)
                {
                    try
                    {
                        List<string> tmp_arr_sondeNumeroSerie = new List<string>();
                        List<string> tmp_arr_sondeAdresse = new List<string>();
                        List<string> tmp_arr_moduleNumeroSerie = new List<string>();
                        List<string> tmp_arr_portSerie = new List<string>();

                        // Ouverture de la connexion SQL
                        InitConnexion();

                        // Création d'une commande SQL en fonction de l'objet connection
                        MySqlCommand cmd_vigitemp = this.connection_vigitemp?.CreateCommand();

                        cmd_vigitemp.CommandText = "SELECT t_module.Port_serie, t_module.ModuleNumeroSerie, t_sonde.SondeNumeroSerie, t_sonde.Adresse_sonde FROM t_lieu " +
                                                    "INNER JOIN t_sonde ON t_lieu.SondeNumeroSerie = t_sonde.SondeNumeroSerie " +
                                                    "INNER JOIN t_module ON t_sonde.idModule = t_module.idModule " +
                                                    "WHERE t_lieu.Frequence = '" + p_frequence + "' " +
                                                    "AND t_module.IDserveur = '" + p_idServer + "' " +
                                                    "AND t_lieu.Lieu_Etat = 'S';";


                        // Exécution de la commande SQL
                        MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
                        while (dr_lieux.Read())
                        {
                            tmp_arr_portSerie.Add("COM" + dr_lieux["Port_serie"].ToString());
                            tmp_arr_sondeNumeroSerie.Add(dr_lieux["SondeNumeroSerie"].ToString());
                            tmp_arr_sondeAdresse.Add(dr_lieux["Adresse_sonde"].ToString());
                            tmp_arr_moduleNumeroSerie.Add(dr_lieux["ModuleNumeroSerie"].ToString());
                        }

                        dr_lieux.Close();
                        // Fermeture de la connexion
                        CloseConnexion();


                        return (tmp_arr_portSerie, tmp_arr_sondeNumeroSerie, tmp_arr_sondeAdresse, tmp_arr_moduleNumeroSerie);
                    }
                    catch (Exception ex)
                    {
                        CloseConnexion();
                        //Console.WriteLine("(getInfosByIdServeurAndFrequencies) SQL Erreur: " + ex.StackTrace + ex.Message);
                        //Trace.WriteLine("(getInfosByIdServeurAndFrequencies) SQL Erreur: " + ex.StackTrace + ex.Message);
                        VigitempServeur.Log("(getInfosByIdServeurAndFrequencies) SQL Erreur: " + ex.StackTrace + ex.Message);
                        return (null, null, null, null);
                    }
                }
            }
            Trace.WriteLine("(getInfosByIdServeurAndFrequencies) connection_vigitemp and connection_vigitemp_mesure are null");
            return (null, null, null, null);
        }

        public (string, string, string, string) getInfosByIdLieu(int p_idLieu)
        {
            lock (_lock)
            {
                if (this.connection_vigitemp != null || this.connection_vigitemp_mesure != null)
                {
                    try
                    {
                        string tmp_arr_sondeNumeroSerie = "";
                        string tmp_arr_sondeAdresse = "";
                        string tmp_arr_moduleNumeroSerie = "";
                        string tmp_arr_portSerie = "";

                        // Ouverture de la connexion SQL
                        InitConnexion();

                        // Création d'une commande SQL en fonction de l'objet connection
                        MySqlCommand cmd_vigitemp = this.connection_vigitemp?.CreateCommand();

                        cmd_vigitemp.CommandText = "SELECT t_module.Port_serie, t_module.ModuleNumeroSerie, t_sonde.SondeNumeroSerie, t_sonde.Adresse_sonde FROM t_lieu " +
                                                    "INNER JOIN t_sonde ON t_lieu.SondeNumeroSerie = t_sonde.SondeNumeroSerie " +
                                                    "INNER JOIN t_module ON t_sonde.idModule = t_module.idModule " +
                                                    "WHERE t_lieu.IdLieu = '" + p_idLieu + "';";


                        // Exécution de la commande SQL
                        MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
                        while (dr_lieux.Read())
                        {
                            tmp_arr_portSerie = ("COM" + dr_lieux["Port_serie"].ToString());
                            tmp_arr_sondeNumeroSerie = (dr_lieux["SondeNumeroSerie"].ToString());
                            tmp_arr_sondeAdresse = (dr_lieux["Adresse_sonde"].ToString());
                            tmp_arr_moduleNumeroSerie = (dr_lieux["ModuleNumeroSerie"].ToString());
                        }

                        dr_lieux.Close();
                        // Fermeture de la connexion
                        CloseConnexion();


                        return (tmp_arr_portSerie, tmp_arr_sondeNumeroSerie, tmp_arr_sondeAdresse, tmp_arr_moduleNumeroSerie);
                    }
                    catch (Exception ex)
                    {
                        CloseConnexion();
                        //Console.WriteLine("(getInfosByIdServeurAndFrequencies) SQL Erreur: " + ex.StackTrace + ex.Message);
                        //Trace.WriteLine("(getInfosByIdServeurAndFrequencies) SQL Erreur: " + ex.StackTrace + ex.Message);
                        VigitempServeur.Log("(getInfosByIdServeurAndFrequencies) SQL Erreur: " + ex.StackTrace + ex.Message);
                        return (null, null, null, null);
                    }
                }
            }
            Trace.WriteLine("(getInfosByIdServeurAndFrequencies) connection_vigitemp and connection_vigitemp_mesure are null");
            return (null, null, null, null);
        }

        public List<int> getDistinctIdServeur()
        {
            lock (_lock)
            {
                List<int> array_tmp = new List<int>();

                InitConnexion();

                MySqlCommand cmd_vigitemp = connection_vigitemp.CreateCommand();

                cmd_vigitemp.CommandText = "SELECT distinct IDserveur FROM t_sonde " +
                                            "where Etat_Sonde = 'S';";


                // Exécution de la commande SQL 
                MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
                while (dr_lieux.Read())
                {
                    array_tmp.Add((int)dr_lieux["IDserveur"]);
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

                InitConnexion();

                MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();

                cmd_vigitemp.CommandText = "SELECT distinct frequence FROM t_lieu " +
                                            "INNER JOIN t_sonde ON t_lieu.SondeNumeroSerie = t_sonde.SondeNumeroSerie " +
                                            "INNER JOIN t_module ON t_sonde.idModule = t_module.idModule " +
                                            "where t_module.IDserveur = '" + p_idServeur + "' " +
                                            "AND t_lieu.Lieu_Etat = 'S';";


                // Exécution de la commande SQL 
                MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
                while (dr_lieux.Read())
                {
                    array_tmp.Add(Int32.Parse(dr_lieux["frequence"].ToString()));
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

                InitConnexion();

                MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();

                cmd_vigitemp.CommandText = "SELECT distinct IdLieu, DateHeure_reactivationAlarme FROM t_lieu " +
                                            "where DateHeure_reactivationAlarme is not null;";


                // Exécution de la commande SQL 
                MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
                while (dr_lieux.Read())
                {
                    array_tmpIdLieu.Add(Int32.Parse(dr_lieux["IdLieu"].ToString()));
                    //VigitempServeur.Log("DateHeure_reactivationAlarme " + DateTime.Parse(dr_lieux["DateHeure_reactivationAlarme"].ToString()).ToString());
                    array_tmpSnoozeDateTime.Add(DateTime.Parse(dr_lieux["DateHeure_reactivationAlarme"].ToString()));
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

                InitConnexion();

                MySqlCommand cmd_vigitemp_mesure = this.connection_vigitemp_mesure.CreateCommand();

                cmd_vigitemp_mesure.CommandText =   "SELECT * from ts_mesure " + 
                                                    "WHERE IdLieu = " + p_IdLieu + " " +
                                                    "ORDER BY DateHeureMesure DESC LIMIT 1";


                VigitempServeur.Log(cmd_vigitemp_mesure.CommandText);
                // Exécution de la commande SQL 
                MySqlDataReader dr_mesure = cmd_vigitemp_mesure.ExecuteReader();
                while (dr_mesure.Read())
                {
                    array_tmpIdLieu = double.Parse(dr_mesure["Valeur"].ToString());
                    //VigitempServeur.Log("DateHeure_reactivationAlarme " + DateTime.Parse(dr_lieux["DateHeure_reactivationAlarme"].ToString()).ToString());
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
                    InitConnexion();

                    // Création d'une commande SQL en fonction de l'objet connection
                    MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();



                    // Exécution de la commande SQL
                    //MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
                    //dr_lieux.Read();

                    //if(valeur == true)
                    //{
                    cmd_vigitemp.CommandText = "UPDATE t_lieu " +
                                                 "SET notification_active = @valeur, " +
                                                 "DateHeure_reactivationAlarme = NULL " +
                                                 "WHERE IdLieu = @idLieu;";

                    //}

                    //cmd_vigitemp.CommandText = "UPDATE t_lieu " +
                    //                            "SET notification_active = @valeur, " +
                    //                            "DateHeure_reactivationAlarme = NULL ;";

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

        public (double, double) getCoeffCalibrageBySerialNumber(string p_serial_number)
        {
            lock (_lock)
            {
                double coeffX, coeffConstant;

                InitConnexion();

                MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();

                cmd_vigitemp.CommandText = "SELECT Coeff_X, Coeff_Constant FROM t_calibrage " +
                                            "where SondeNumeroSerie = '" + p_serial_number + "' " +
                                            "ORDER BY DateHeureCalibrage DESC " +
                                            "LIMIT 1";

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
