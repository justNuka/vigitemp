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
        private static readonly HashSet<string> AllowedEditions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "pack",
            "one",
            "standard",
            "expert"
        };

        private static readonly string DefaultLicensePath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
            "Vigitemp",
            "license.vtlic");

        private static readonly string DefaultPublicKeyPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
            "Vigitemp",
            "public_key.pem");

        public static LicenseValidationResult ValidateFromConfig()
        {
            var licensePath = ExpandPath(GetSetting("Vigi.License.Path", DefaultLicensePath));
            var publicKeyPath = ExpandPath(GetSetting("Vigi.License.PublicKeyPath", DefaultPublicKeyPath));
            var instancePublicKey = GetSetting("Vigi.License.InstancePublicKey", string.Empty);

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
                JObject payload;
                return ValidateToken(token, publicKeyPath, instancePublicKey, out payload);
            }
            catch (Exception ex)
            {
                return LicenseValidationResult.Fail("Validation licence impossible: " + ex.Message);
            }
        }

        public static HotlineLicenseConfigResult GetHotlineConfigFromConfig()
        {
            var licensePath = ExpandPath(GetSetting("Vigi.License.Path", DefaultLicensePath));
            var publicKeyPath = ExpandPath(GetSetting("Vigi.License.PublicKeyPath", DefaultPublicKeyPath));
            var instancePublicKey = GetSetting("Vigi.License.InstancePublicKey", string.Empty);

            if (!File.Exists(licensePath))
            {
                return HotlineLicenseConfigResult.Fail($"Fichier licence introuvable: {licensePath}");
            }

            if (!File.Exists(publicKeyPath))
            {
                return HotlineLicenseConfigResult.Fail($"ClÇ¸ publique introuvable: {publicKeyPath}");
            }

            var token = File.ReadAllText(licensePath).Trim();
            if (string.IsNullOrWhiteSpace(token))
            {
                return HotlineLicenseConfigResult.Fail("Fichier licence vide.");
            }

            try
            {
                JObject payload;
                var validation = ValidateToken(token, publicKeyPath, instancePublicKey, out payload);
                if (!validation.IsValid)
                {
                    return HotlineLicenseConfigResult.Fail(validation.Reason);
                }

                var hotlinePayload = payload["hotline"] as JObject;
                if (hotlinePayload == null)
                {
                    return HotlineLicenseConfigResult.Fail("Hotline absente de la licence.");
                }

                var enabled = hotlinePayload.Value<bool?>("enabled") ?? true;
                if (!enabled)
                {
                    return HotlineLicenseConfigResult.Fail("Hotline dÇ¸sactivÇ¸e.");
                }

                var slug = hotlinePayload.Value<string>("slug") ?? string.Empty;
                var username = hotlinePayload.Value<string>("username") ?? string.Empty;
                var passwordHash = hotlinePayload.Value<string>("passwordHash") ?? string.Empty;

                if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(passwordHash))
                {
                    return HotlineLicenseConfigResult.Fail("Hotline incomplÇùte dans la licence.");
                }

                return HotlineLicenseConfigResult.Success(new HotlineLicenseConfig
                {
                    Slug = slug,
                    Username = username,
                    PasswordHash = passwordHash
                });
            }
            catch (Exception ex)
            {
                return HotlineLicenseConfigResult.Fail("Validation hotline impossible: " + ex.Message);
            }
        }

        private static LicenseValidationResult ValidateToken(
            string token,
            string publicKeyPath,
            string instancePublicKey,
            out JObject payload)
        {
            payload = null;
            var parts = token.Split('.');
            if (parts.Length != 3)
            {
                return LicenseValidationResult.Fail("Format licence invalide (JWS attendu).");
            }

            var headerJson = DecodeBase64UrlToString(parts[0]);
            var payloadJson = DecodeBase64UrlToString(parts[1]);
            var signature = DecodeBase64Url(parts[2]);
            var header = JObject.Parse(headerJson);
            var alg = header.Value<string>("alg") ?? string.Empty;

            if (!string.Equals(alg, "EdDSA", StringComparison.Ordinal))
            {
                return LicenseValidationResult.Fail("Algorithme de licence invalide.");
            }

            if (!VerifySignature(parts[0], parts[1], signature, publicKeyPath))
            {
                return LicenseValidationResult.Fail("Signature licence invalide.");
            }

            payload = JObject.Parse(payloadJson);
            var licenseId = payload.Value<string>("licenseId") ?? string.Empty;
            var customerId = payload.Value<string>("customerId") ?? string.Empty;
            var editionRaw = payload.Value<string>("edition") ?? string.Empty;
            var edition = editionRaw.Trim().ToLowerInvariant();
            var concurrentAccess = payload.Value<string>("concurrentAccess") ?? string.Empty;
            var issuedAtRaw = payload.Value<string>("issuedAt") ?? string.Empty;
            var expiresAtRaw = payload.Value<string>("expiresAt") ?? string.Empty;
            var bindKey = payload["bind"]?["instancePublicKey"]?.ToString() ?? string.Empty;
            var maxSensorsToken = payload["maxSensors"];
            int? maxSensors = null;

            if (maxSensorsToken != null && maxSensorsToken.Type != JTokenType.Null)
            {
                if (maxSensorsToken.Type == JTokenType.Integer)
                {
                    maxSensors = maxSensorsToken.Value<int>();
                }
                else if (int.TryParse(maxSensorsToken.ToString(), NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsedMaxSensors))
                {
                    maxSensors = parsedMaxSensors;
                }
                else
                {
                    return LicenseValidationResult.Fail("maxSensors invalide.");
                }
            }

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
                return LicenseValidationResult.Fail("Licence incomplete (licenseId/customerId manquant).");
            }

            if (!AllowedEditions.Contains(edition))
            {
                return LicenseValidationResult.Fail("Type de licence invalide.");
            }

            if (string.Equals(edition, "pack", StringComparison.OrdinalIgnoreCase) && (!maxSensors.HasValue || maxSensors.Value <= 0))
            {
                return LicenseValidationResult.Fail("Licence Pack invalide (maxSensors requis).");
            }

            var expiresAtUtc = ParseUtcDate(expiresAtRaw);
            if (expiresAtUtc.HasValue && DateTime.UtcNow > expiresAtUtc.Value)
            {
                return LicenseValidationResult.Fail($"Licence expiree ({expiresAtUtc:yyyy-MM-dd}).");
            }

            if (!string.IsNullOrWhiteSpace(bindKey))
            {
                var normalizedBind = NormalizeKey(bindKey);
                var normalizedInstance = NormalizeKey(instancePublicKey);
                if (string.IsNullOrWhiteSpace(normalizedInstance) || !string.Equals(normalizedBind, normalizedInstance, StringComparison.Ordinal))
                {
                    return LicenseValidationResult.Fail("Licence liee a une autre instance.");
                }
            }

            return LicenseValidationResult.Success(
                licenseId,
                customerId,
                edition,
                concurrentAccess,
                options,
                issuedAtRaw,
                expiresAtUtc,
                maxSensors);
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
        public int? MaxSensors { get; private set; }

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
            DateTime? expiresAtUtc,
            int? maxSensors)
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
                ExpiresAtUtc = expiresAtUtc,
                MaxSensors = maxSensors
            };
        }
    }

    internal sealed class HotlineLicenseConfig
    {
        public string Slug { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; }
    }

    internal sealed class HotlineLicenseConfigResult
    {
        public bool IsValid { get; private set; }
        public string Reason { get; private set; }
        public HotlineLicenseConfig Config { get; private set; }

        public static HotlineLicenseConfigResult Fail(string reason)
        {
            return new HotlineLicenseConfigResult
            {
                IsValid = false,
                Reason = reason ?? "Hotline invalide.",
                Config = null
            };
        }

        public static HotlineLicenseConfigResult Success(HotlineLicenseConfig config)
        {
            return new HotlineLicenseConfigResult
            {
                IsValid = true,
                Reason = "OK",
                Config = config
            };
        }
    }
}
