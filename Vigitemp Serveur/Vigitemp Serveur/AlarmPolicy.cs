using System;
using System.Configuration;
using System.Globalization;

namespace Vigitemp_Serveur
{
    internal sealed class AlarmPolicy
    {
        public double HysteresisDelta { get; }
        public int DebounceSeconds { get; }
        public bool ShowWhileSnoozed { get; }

        private AlarmPolicy(double hysteresisDelta, int debounceSeconds, bool showWhileSnoozed)
        {
            HysteresisDelta = hysteresisDelta;
            DebounceSeconds = debounceSeconds;
            ShowWhileSnoozed = showWhileSnoozed;
        }

        private static readonly Lazy<AlarmPolicy> _current = new Lazy<AlarmPolicy>(Load);
        public static AlarmPolicy Current => _current.Value;

        private static AlarmPolicy Load()
        {
            var hysteresis = GetSettingDouble("Vigi.License.HysteresisDelta", 0);
            var debounceSeconds = GetSettingInt("Vigi.License.DebounceSeconds", 0);
            var showWhileSnoozed = GetSettingBool("Vigi.License.ShowWhileSnoozed", true);

            if (hysteresis < 0) hysteresis = 0;
            if (debounceSeconds < 0) debounceSeconds = 0;

            return new AlarmPolicy(hysteresis, debounceSeconds, showWhileSnoozed);
        }

        private static string GetSetting(string key)
        {
            try { return ConfigurationManager.AppSettings[key]; } catch { return null; }
        }

        private static double GetSettingDouble(string key, double defaultValue)
        {
            var raw = GetSetting(key);
            if (string.IsNullOrWhiteSpace(raw)) return defaultValue;
            if (double.TryParse(raw, NumberStyles.Float, CultureInfo.InvariantCulture, out var value)) return value;
            if (double.TryParse(raw, NumberStyles.Float, CultureInfo.CurrentCulture, out value)) return value;
            return defaultValue;
        }

        private static int GetSettingInt(string key, int defaultValue)
        {
            var raw = GetSetting(key);
            if (string.IsNullOrWhiteSpace(raw)) return defaultValue;
            if (int.TryParse(raw, NumberStyles.Integer, CultureInfo.InvariantCulture, out var value)) return value;
            if (int.TryParse(raw, NumberStyles.Integer, CultureInfo.CurrentCulture, out value)) return value;
            return defaultValue;
        }

        private static bool GetSettingBool(string key, bool defaultValue)
        {
            var raw = GetSetting(key);
            if (string.IsNullOrWhiteSpace(raw)) return defaultValue;
            if (bool.TryParse(raw, out var value)) return value;
            return defaultValue;
        }
    }
}

