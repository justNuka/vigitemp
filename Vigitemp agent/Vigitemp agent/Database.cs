using System;
using MySql.Data.MySqlClient;
using VigitempAgent;


public class Database
{
    private static readonly object _lock = new object();
    private MySqlConnection connection_vigitemp;
    private MySqlConnection connection_vigitemp_mesure;

    private static string GetSetting(string key, string defaultValue)
    {
        var value = System.Configuration.ConfigurationManager.AppSettings[key];
        return string.IsNullOrWhiteSpace(value) ? defaultValue : value;
    }

    // Constructeur
    public Database()
    {
        this.InitConnexion();
    }

    // Méthode pour ouvrir les connexions
    public void InitConnexion()
    {
        var host      = GetSetting("Vigi.Db.Host",            "127.0.0.1");
        var port      = GetSetting("Vigi.Db.Port",            "3306");
        var user      = GetSetting("Vigi.Db.User",            "root");
        var password  = GetSetting("Vigi.Db.Password",        "");
        var mainDb    = GetSetting("Vigi.Db.MainDatabase",    "vigitemp");
        var measureDb = GetSetting("Vigi.Db.MeasureDatabase", "vigitemp_mesure");

        string connectionString = "SERVER=" + host + "; Port=" + port + "; DATABASE=" + mainDb + "; UID=" + user + "; PASSWORD=" + password + ";";
        this.connection_vigitemp = new MySqlConnection(connectionString);
        this.connection_vigitemp.Open();

        connectionString = "SERVER=" + host + "; Port=" + port + "; DATABASE=" + measureDb + "; UID=" + user + "; PASSWORD=" + password + ";";
        this.connection_vigitemp_mesure = new MySqlConnection(connectionString);
        this.connection_vigitemp_mesure.Open();
    }

    public void CloseConnexion()
    {
        this.connection_vigitemp?.Close();
        this.connection_vigitemp_mesure?.Close();
    }


    public string addPCtoDBClientsList(string adresseIP, string nomMachine)
    {
        if (this.connection_vigitemp != null)
        {
            try
            {

                MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();
                String res;
                cmd_vigitemp.CommandText = "SELECT 1 AS res FROM t_postes_clients WHERE AdresseIpConnexion = @adresseIP";
                cmd_vigitemp.Parameters.AddWithValue("@adresseIP", adresseIP);

                // Exécution de la commande SQL 
                MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
                MySqlCommand cmd_vigitemp_mesure = this.connection_vigitemp.CreateCommand();
                dr_lieux.Read();
                if (dr_lieux.HasRows)
                {
                    dr_lieux.Close();
                    res = "1";
                    
                    cmd_vigitemp_mesure.CommandText = "UPDATE t_postes_clients SET NomMachineConnexion = @nomMachine WHERE AdresseIpConnexion = @adresseIP";
                    cmd_vigitemp_mesure.Parameters.AddWithValue("@nomMachine", nomMachine);
                    cmd_vigitemp_mesure.Parameters.AddWithValue("@adresseIP", adresseIP);

                    cmd_vigitemp_mesure.ExecuteNonQuery();
                    CloseConnexion();
                }
                else
                {
                    dr_lieux.Close();
                    res = "0";
                    cmd_vigitemp_mesure.CommandText = "INSERT INTO t_postes_clients (NomMachineConnexion, AdresseIpConnexion) VALUES (@nomMachine, @adresseIP)";
                    cmd_vigitemp_mesure.Parameters.AddWithValue("@nomMachine", nomMachine);
                    cmd_vigitemp_mesure.Parameters.AddWithValue("@adresseIP", adresseIP);

                    cmd_vigitemp_mesure.ExecuteNonQuery();
                    CloseConnexion();
                }
                //res = dr_lieux["res"].ToString();
                dr_lieux.Close();
                CloseConnexion();

                Console.WriteLine(res);
                return res;
            }
            catch (Exception ex)
            {
                CloseConnexion();
                AgentLog.Error("Database operation failed.", ex);
                return null;
            }
        }

        return null;
    }

    public bool AddMesure(string p_numeroSerie, string p_id_recuperationMesure, double p_valeur_mesure, DateTime p_heure_mesure)
    {
        if (this.connection_vigitemp != null || this.connection_vigitemp_mesure != null)
        {
            try
            {

                MySqlCommand cmd_vigitemp_mesure = this.connection_vigitemp_mesure.CreateCommand();
                cmd_vigitemp_mesure.CommandText = "INSERT INTO ts_mesuresvigiloghugo " +
                                                    "(serialNumber, id_recuperationMesure, valeur_mesure, heure_mesure) " +
                                                    "VALUES " +
                                                    "(@serialNumber, @idrecuperationmesure, @valeurmesure, @heuremesure)";

                // utilisation de l'objet contact passé en paramètre 
                cmd_vigitemp_mesure.Parameters.AddWithValue("@serialNumber", p_numeroSerie);
                cmd_vigitemp_mesure.Parameters.AddWithValue("@idrecuperationmesure", p_id_recuperationMesure);
                cmd_vigitemp_mesure.Parameters.AddWithValue("@valeurmesure", p_valeur_mesure);
                cmd_vigitemp_mesure.Parameters.AddWithValue("@heuremesure", p_heure_mesure);

                cmd_vigitemp_mesure.ExecuteNonQuery();

                CloseConnexion();

                return true;
            }
            catch (Exception ex)
            {
                CloseConnexion();
                AgentLog.Error("Database operation failed.", ex);
                return false;
            }
        }

        return false;
    }

    public string getServerIp()
    {
        if (this.connection_vigitemp != null || this.connection_vigitemp_mesure != null)
        {
            try
            {

                MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();
                String res;
                cmd_vigitemp.CommandText = "SELECT Valeur from t_parametre where MotCle = 'serveur_ip_1';";

                // Exécution de la commande SQL 
                MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
                dr_lieux.Read();
                res = dr_lieux["Valeur"].ToString();
                dr_lieux.Close();
                CloseConnexion();

                return res;
            }
            catch (Exception ex)
            {
                CloseConnexion();
                AgentLog.Error("Database operation failed.", ex);
                return null;
            }
        }

        return null;
    }
    
    public string getWebsiteURL()
    {
        if (this.connection_vigitemp != null || this.connection_vigitemp_mesure != null)
        {
            try
            {

                MySqlCommand cmd_vigitemp = this.connection_vigitemp.CreateCommand();
                String res;
                cmd_vigitemp.CommandText = "SELECT Valeur from t_parametre where MotCle = 'SITE_WEB_URL';";

                // Exécution de la commande SQL 
                MySqlDataReader dr_lieux = cmd_vigitemp.ExecuteReader();
                dr_lieux.Read();
                res = dr_lieux["Valeur"].ToString();
                dr_lieux.Close();
                CloseConnexion();

                return res;
            }
            catch (Exception ex)
            {
                CloseConnexion();
                AgentLog.Error("Database operation failed.", ex);
                return null;
            }
        }

        return null;
    }
}
