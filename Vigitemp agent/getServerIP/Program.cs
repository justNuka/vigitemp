using System;

namespace getServerIP
{
    static class Program
    {
        /// <summary>
        /// Point d'entrée principal de l'application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            //enregistrement dans la bdd
            Database database = new Database();
            // Ouverture de la connexion SQL
            database.InitConnexion();
            // Recuperation de l'adresse du serveur
            string server_IP = database.getServerIp();

            //Console.WriteLine(server_IP);
            Console.Out.Write(server_IP);
        }
    }
}
