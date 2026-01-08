using System;
using System.Collections.Generic;
using System.Configuration;
using System.Globalization;
using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using Newtonsoft.Json.Linq;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Signers;
using Org.BouncyCastle.OpenSsl;

namespace Vigitemp_Serveur
{
    internal static class LicenseManager
    {
        private static readonly string DefaultLicensePath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
            "Vigitemp",
            "license.vtlic");

        private static readonly string DefaultPublicKeyPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
            "Vigitemp",
            "license_public.pem");

        public static LicenseValidationResult ValidateFromConfig()
        {
            var licensePath = ExpandPath(GetSetting("Vigitemp.License.Path", DefaultLicensePath));
            var publicKeyPath = ExpandPath(GetSetting("Vigitemp.License.PublicKeyPath", DefaultPublicKeyPath));
            var instancePublicKey = GetSetting("Vigitemp.License.InstancePublicKey", string.Empty);

            if (!File.Exists(licensePath))
            {
                return LicenseValidationResult.Fail($"Fichier licence introuvable: {licensePath}");
            }

            if (!File.Exists(publicKeyPath))
            {
                return LicenseValidationResult.Fail($"Clé publique introuvable: {publicKeyPath}");
            }

            var token = File.ReadAllText(licensePath).Trim();
            if (string.IsNullOrWhiteSpace(token))
            {
                return LicenseValidationResult.Fail("Fichier licence vide.");
            }

            try
            {
                return ValidateToken(token, publicKeyPath, instancePublicKey);
            }
            catch (Exception ex)
            {
                return LicenseValidationResult.Fail("Validation licence impossible: " + ex.Message);
            }
        }

        private static LicenseValidationResult ValidateToken(string token, string publicKeyPath, string instancePublicKey)
        {
            var parts = token.Split('.');
            if (parts.Length != 3)
            {
                return LicenseValidationResult.Fail("Format licence invalide (JWS attendu).");
            }

            var headerJson = DecodeBase64UrlToString(parts[0]);
            var payloadJson = DecodeBase64UrlToString(parts[1]);
            var signature = DecodeBase64Url(parts[2]);

            if (!VerifySignature(parts[0], parts[1], signature, publicKeyPath))
            {
                return LicenseValidationResult.Fail("Signature licence invalide.");
            }

            var payload = JObject.Parse(payloadJson);
            var licenseId = payload.Value<string>("licenseId") ?? string.Empty;
            var customerId = payload.Value<string>("customerId") ?? string.Empty;
            var edition = payload.Value<string>("edition") ?? string.Empty;
            var concurrentAccess = payload.Value<string>("concurrentAccess") ?? string.Empty;
            var issuedAtRaw = payload.Value<string>("issuedAt") ?? string.Empty;
            var expiresAtRaw = payload.Value<string>("expiresAt") ?? string.Empty;
            var bindKey = payload["bind"]?["instancePublicKey"]?.ToString() ?? string.Empty;

            var options = new List<string>();
            if (payload["options"] is JArray arr)
            {
                foreach (var item in arr)
                {
                    var value = item?.ToString();
                    if (!string.IsNullOrWhiteSpace(value))
                    {
                        options.Add(value);
                    }
                }
            }

            if (string.IsNullOrWhiteSpace(licenseId) || string.IsNullOrWhiteSpace(customerId))
            {
                return LicenseValidationResult.Fail("Licence incomplète (licenseId/customerId manquant).");
            }

            var expiresAtUtc = ParseUtcDate(expiresAtRaw);
            if (expiresAtUtc.HasValue && DateTime.UtcNow > expiresAtUtc.Value)
            {
                return LicenseValidationResult.Fail($"Licence expirée ({expiresAtUtc:yyyy-MM-dd}).");
            }

            if (!string.IsNullOrWhiteSpace(bindKey))
            {
                var normalizedBind = NormalizeKey(bindKey);
                var normalizedInstance = NormalizeKey(instancePublicKey);
                if (string.IsNullOrWhiteSpace(normalizedInstance) || !string.Equals(normalizedBind, normalizedInstance, StringComparison.Ordinal))
                {
                    return LicenseValidationResult.Fail("Licence liée à une autre instance.");
                }
            }

            return LicenseValidationResult.Success(
                licenseId,
                customerId,
                edition,
                concurrentAccess,
                options,
                issuedAtRaw,
                expiresAtUtc);
        }

        private static bool VerifySignature(string headerPart, string payloadPart, byte[] signature, string publicKeyPath)
        {
            var data = Encoding.UTF8.GetBytes($"{headerPart}.{payloadPart}");
            var publicKey = LoadPublicKey(publicKeyPath);
            var signer = new Ed25519Signer();
            signer.Init(false, publicKey);
            signer.BlockUpdate(data, 0, data.Length);
            return signer.VerifySignature(signature);
        }

        private static AsymmetricKeyParameter LoadPublicKey(string path)
        {
            using (var reader = new StringReader(File.ReadAllText(path)))
            {
                var pemReader = new PemReader(reader);
                var obj = pemReader.ReadObject();
                if (obj is AsymmetricKeyParameter key && !key.IsPrivate)
                {
                    return key;
                }

                if (obj is AsymmetricCipherKeyPair pair)
                {
                    return pair.Public;
                }
            }

            throw new InvalidOperationException("Clé publique invalide.");
        }

        private static string DecodeBase64UrlToString(string input)
        {
            var data = DecodeBase64Url(input);
            return Encoding.UTF8.GetString(data);
        }

        private static byte[] DecodeBase64Url(string input)
        {
            var base64 = input.Replace('-', '+').Replace('_', '/');
            switch (base64.Length % 4)
            {
                case 2:
                    base64 += "==";
                    break;
                case 3:
                    base64 += "=";
                    break;
            }
            return Convert.FromBase64String(base64);
        }

        private static DateTime? ParseUtcDate(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return null;
            if (DateTime.TryParse(raw, CultureInfo.InvariantCulture, DateTimeStyles.AdjustToUniversal, out var value))
            {
                return value.ToUniversalTime();
            }
            if (DateTime.TryParse(raw, CultureInfo.CurrentCulture, DateTimeStyles.AdjustToUniversal, out value))
            {
                return value.ToUniversalTime();
            }
            return null;
        }

        private static string NormalizeKey(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return string.Empty;
            return Regex.Replace(value, "\\s+", "");
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

        private static string ExpandPath(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return value;
            return Environment.ExpandEnvironmentVariables(value);
        }
    }

    internal sealed class LicenseValidationResult
    {
        public bool IsValid { get; private set; }
        public string Reason { get; private set; }
        public string LicenseId { get; private set; }
        public string CustomerId { get; private set; }
        public string Edition { get; private set; }
        public string ConcurrentAccess { get; private set; }
        public IReadOnlyList<string> Options { get; private set; }
        public string IssuedAtRaw { get; private set; }
        public DateTime? ExpiresAtUtc { get; private set; }

        public static LicenseValidationResult Fail(string reason)
        {
            return new LicenseValidationResult
            {
                IsValid = false,
                Reason = reason ?? "Licence invalide.",
                Options = Array.Empty<string>()
            };
        }

        public static LicenseValidationResult Success(
            string licenseId,
            string customerId,
            string edition,
            string concurrentAccess,
            IReadOnlyList<string> options,
            string issuedAtRaw,
            DateTime? expiresAtUtc)
        {
            return new LicenseValidationResult
            {
                IsValid = true,
                Reason = "OK",
                LicenseId = licenseId,
                CustomerId = customerId,
                Edition = edition,
                ConcurrentAccess = concurrentAccess,
                Options = options ?? Array.Empty<string>(),
                IssuedAtRaw = issuedAtRaw,
                ExpiresAtUtc = expiresAtUtc
            };
        }
    }
}
