using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using System.Diagnostics;

namespace Vigitemp_Serveur
{
    /// <summary>
    /// Service de cache utilisant la table ts_graphique
    /// Insère les dernières mesures dans ts_graphique pour un accès ultra-rapide aux graphs
    /// La table ts_graphique se vide régulièrement selon la politique de rétention
    /// </summary>
    class CacheService
    {
        private static readonly object _lock = new object();
        private static readonly string IP_ADDRESS = "192.168.63.144";
        private static readonly string PORT = "3306";
        private static readonly string UID = "root";
        private static readonly string PASSWORD = "pass";

        /// <summary>
        /// Insère une mesure dans ts_graphique pour le cache
        /// Appelé après chaque insertion de mesure dans ts_mesure
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
                        INSERT INTO ts_graphique 
                        (DateHeureMesure, Valeur, Resistance, Consigne, Consigne_Sup, Consigne_Inf, 
                         Unite, SondeNumeroSerie, IdSonde, IdLieu, Frequence, Etat_Alarme, ValeurNull)
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

                    VigitempServeur.Log($"(InsertMeasureToGraphique) Mesure inséée dans ts_graphique pour idSonde={idSonde}");
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
