using System;
using System.Configuration;

namespace Vigitemp_Serveur
{
    internal static class DatabaseFactory
    {
        public static IDatabaseProvider Create()
        {
            var provider = GetSetting("Vigi.Db.Provider", "mysql").Trim().ToLowerInvariant();
            switch (provider)
            {
                case "mysql":
                    return new Database();
                case "mssql":
                    return new SqlServerDatabaseProvider();
                default:
                    throw new NotSupportedException("Unknown DB provider: " + provider);
            }
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
