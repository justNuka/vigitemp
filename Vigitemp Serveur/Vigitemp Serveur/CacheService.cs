using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using System.Diagnostics;

namespace Vigitemp_Serveur
{
    /// <summary>
    /// Service de cache utilisant la table tm_graphique
    /// Insère les dernières mesures dans tm_graphique pour un accès ultra-rapide aux graphs
    /// La table tm_graphique se vide régulièrement selon la politique de rétention
    /// </summary>
    class CacheService
    {
        private static readonly object _lock = new object();
        private static readonly string IP_ADDRESS = "192.168.63.144";
        private static readonly string PORT = "3306";
        private static readonly string UID = "root";
        private static readonly string PASSWORD = "pass";

        /// <summary>
        /// Insère une mesure dans tm_graphique pour le cache
        /// Appelé après chaque insertion de mesure dans tm_mesures
        /// </summary>
        public static void InsertMeasureToGraphique(
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
            lock (_lock)
            {
                MySqlConnection connection = null;

                try
                {
                    string connectionString = $"SERVER={IP_ADDRESS}; Port={PORT}; DATABASE=vigitemp_mesures_ifb; UID={UID}; PASSWORD={PASSWORD};";
                    connection = new MySqlConnection(connectionString);
                    connection.Open();

                    MySqlCommand cmd = connection.CreateCommand();
                    cmd.CommandText = @"
                        INSERT INTO tm_graphique 
                        (Date_Heure_Mesure, Valeur, Resistance, Consigne, Consigne_Sup, Consigne_Inf, 
                         Unite, Sonde_Numero_Serie, Id_Sonde, Id_Lieu, Frequence, Etat_Alarme, Valeur_Null)
                        VALUES 
                        (NOW(), @valeur, @resistance, @consigne, @consigneSup, @consigneInf, 
                         @unite, @sondeNumeroSerie, @idSonde, @idLieu, @frequence, @etatAlarme, 0)";

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

                    VigitempServeur.Log($"(InsertMeasureToGraphique) Mesure inséée dans tm_graphique pour idSonde={idSonde}");
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log($"(InsertMeasureToGraphique) Erreur: {ex.Message} | {ex.StackTrace}");
                }
                finally
                {
                    connection?.Close();
                    connection?.Dispose();
                }
            }
        }
    }
}
