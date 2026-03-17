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
        // Connexion gérée par l'appelant via InitConnexion() / CloseConnexion()
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
        if (this.connection_vigitemp == null || this.connection_vigitemp_mesure == null)
            return null;

        try
        {
            string res;
            using (var cmd = this.connection_vigitemp.CreateCommand())
            {
                cmd.CommandText = "SELECT 1 AS res FROM t_postes_clients WHERE AdresseIpConnexion = @adresseIP";
                cmd.Parameters.AddWithValue("@adresseIP", adresseIP);

                using (var dr = cmd.ExecuteReader())
                {
                    dr.Read();
                    res = dr.HasRows ? "1" : "0";
                }
            }

            using (var cmd2 = this.connection_vigitemp.CreateCommand())
            {
                if (res == "1")
                {
                    cmd2.CommandText = "UPDATE t_postes_clients SET NomMachineConnexion = @nomMachine WHERE AdresseIpConnexion = @adresseIP";
                }
                else
                {
                    cmd2.CommandText = "INSERT INTO t_postes_clients (NomMachineConnexion, AdresseIpConnexion) VALUES (@nomMachine, @adresseIP)";
                }
                cmd2.Parameters.AddWithValue("@nomMachine", nomMachine);
                cmd2.Parameters.AddWithValue("@adresseIP", adresseIP);
                cmd2.ExecuteNonQuery();
            }

            return res;
        }
        catch (Exception ex)
        {
            AgentLog.Error("Database operation failed.", ex);
            return null;
        }
    }

    public bool AddMesure(string p_numeroSerie, string p_id_recuperationMesure, double p_valeur_mesure, DateTime p_heure_mesure)
    {
        if (this.connection_vigitemp == null || this.connection_vigitemp_mesure == null)
            return false;

        try
        {
            using (var cmd = this.connection_vigitemp_mesure.CreateCommand())
            {
                cmd.CommandText = "INSERT INTO ts_mesuresvigiloghugo " +
                                  "(serialNumber, id_recuperationMesure, valeur_mesure, heure_mesure) " +
                                  "VALUES (@serialNumber, @idrecuperationmesure, @valeurmesure, @heuremesure)";
                cmd.Parameters.AddWithValue("@serialNumber", p_numeroSerie);
                cmd.Parameters.AddWithValue("@idrecuperationmesure", p_id_recuperationMesure);
                cmd.Parameters.AddWithValue("@valeurmesure", p_valeur_mesure);
                cmd.Parameters.AddWithValue("@heuremesure", p_heure_mesure);
                cmd.ExecuteNonQuery();
            }
            return true;
        }
        catch (Exception ex)
        {
            AgentLog.Error("Database operation failed.", ex);
            return false;
        }
    }

    public string getServerIp()
    {
        if (this.connection_vigitemp == null || this.connection_vigitemp_mesure == null)
            return null;

        try
        {
            using (var cmd = this.connection_vigitemp.CreateCommand())
            {
                cmd.CommandText = "SELECT Valeur from t_parametre where MotCle = 'serveur_ip_1';";
                using (var dr = cmd.ExecuteReader())
                {
                    if (!dr.Read()) return null;
                    return dr["Valeur"].ToString();
                }
            }
        }
        catch (Exception ex)
        {
            AgentLog.Error("Database operation failed.", ex);
            return null;
        }
    }
    
    public string getWebsiteURL()
    {
        if (this.connection_vigitemp == null || this.connection_vigitemp_mesure == null)
            return null;

        try
        {
            using (var cmd = this.connection_vigitemp.CreateCommand())
            {
                cmd.CommandText = "SELECT Valeur from t_parametre where MotCle = 'SITE_WEB_URL';";
                using (var dr = cmd.ExecuteReader())
                {
                    if (!dr.Read()) return null;
                    return dr["Valeur"].ToString();
                }
            }
        }
        catch (Exception ex)
        {
            AgentLog.Error("Database operation failed.", ex);
            return null;
        }
    }
}
