using System;
using System.Configuration;

namespace Vigitemp_Serveur
{
    internal static class DatabaseFactory
    {
        public static IDatabaseProvider Create()
        {
            var provider = GetSetting("Vigi.Db.Provider", "mysql").Trim().ToLowerInvariant();
            IDatabaseProvider database;
            switch (provider)
            {
                case "mysql":
                    database = new MySqlDatabaseProvider();
                    break;
                case "mssql":
                case "sqlserver":
                    database = new SqlServerDatabaseProvider();
                    break;
                default:
                    throw new NotSupportedException("Unknown DB provider: " + provider);
            }

            return new MetrologyDatabaseProvider(database);
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
    }
}
