using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;
using System.Configuration;
using System.Diagnostics;
using System.Globalization;

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

        /// <summary>
        /// Insère une mesure dans tm_graphique pour le cache
        /// Appelé après chaque insertion de mesure dans tm_mesures
        /// </summary>
        public static void InsertMeasureToGraphique(
            MySqlConnection connection,
            int idSonde,
            int idLieu,
            string sondeNumeroSerie,
            double? valeur,
            string unite,
            double? resistance,
            float consigne,
            float consigneSup,
            float consigneInf,
            int frequence,
            int etatAlarme,
            int estValeurNull = 0)
        {
            lock (_lock)
            {
                try
                {
                    using (var cmd = connection.CreateCommand())
                    {
                        cmd.CommandText = @"
                        INSERT INTO tm_graphique
                        (Date_Heure_Mesure, Valeur, Valeur_Brute, Consigne, Consigne_Sup, Consigne_Inf,
                         Unite, Sonde_Numero_Serie, Id_Sonde, Id_Lieu, Frequence, Est_Etat_Alarme, Est_Valeur_Null)
                        VALUES
                        (NOW(), @valeur, @valeurBrute, @consigne, @consigneSup, @consigneInf,
                         @unite, @sondeNumeroSerie, @idSonde, @idLieu, @frequence, @etatAlarme, @estValeurNull)";

                        cmd.Parameters.AddWithValue("@valeur", valeur.HasValue ? (object)valeur.Value : DBNull.Value);
                        cmd.Parameters.AddWithValue("@valeurBrute", resistance.HasValue ? (object)resistance.Value : DBNull.Value);
                        cmd.Parameters.AddWithValue("@consigne", consigne);
                        cmd.Parameters.AddWithValue("@consigneSup", consigneSup);
                        cmd.Parameters.AddWithValue("@consigneInf", consigneInf);
                        cmd.Parameters.AddWithValue("@unite", unite);
                        cmd.Parameters.AddWithValue("@sondeNumeroSerie", sondeNumeroSerie);
                        cmd.Parameters.AddWithValue("@idSonde", idSonde);
                        cmd.Parameters.AddWithValue("@idLieu", idLieu);
                        cmd.Parameters.AddWithValue("@frequence", frequence);
                        cmd.Parameters.AddWithValue("@etatAlarme", etatAlarme);
                        cmd.Parameters.AddWithValue("@estValeurNull", estValeurNull);

                        cmd.ExecuteNonQuery();
                    }

                    VigitempServeur.Log($"(InsertMeasureToGraphique) Mesure inseree dans tm_graphique pour idSonde={idSonde}");
                }
                catch (Exception ex)
                {
                    VigitempServeur.Log($"(InsertMeasureToGraphique) Erreur: {ex.Message} | {ex.StackTrace}");
                }
            }
        }
    }
}
