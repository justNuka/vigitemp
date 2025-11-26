using System;
using MySql.Data.MySqlClient;

public class Database
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
        this.InitConnexion();
    }

    // Méthode pour ouvrir les connexions
    public void InitConnexion()
    {
        string connectionString = "SERVER=" + IP_ADDRESS + "; Port=" + PORT + "; DATABASE=vigitemp; UID=" + UID + "; PASSWORD=" + PASSWORD + ";";
        this.connection_vigitemp = new MySqlConnection(connectionString);
        this.connection_vigitemp.Open();

        connectionString = "SERVER=" + IP_ADDRESS + "; Port=" + PORT + "; DATABASE=vigitemp_mesure; UID=" + UID + "; PASSWORD=" + PASSWORD + ";";
        this.connection_vigitemp_mesure = new MySqlConnection(connectionString);
        this.connection_vigitemp_mesure.Open();
    }

    public void CloseConnexion()
    {
        this.connection_vigitemp?.Close();
        this.connection_vigitemp_mesure?.Close();
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
                Console.WriteLine(ex.StackTrace + ex.Message);
                return null;
            }
        }

        return null;
    }
}
