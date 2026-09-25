using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;

namespace Vigitemp_Serveur
{
    internal sealed class SefExchangeFrame
    {
        public string Direction { get; set; }
        public string Format { get; set; }
        public string Content { get; set; }
    }

    internal sealed class SefReadResult
    {
        public bool Success { get; set; }
        public string Error { get; set; }
        public string Command { get; set; }
        public string RawResponse { get; set; }
        public double? Value { get; set; }
        public string Unit { get; set; }
        public string NetworkHost { get; set; }
        public int NetworkPort { get; set; }
        public string ProtocolAddress { get; set; }
        public List<SefExchangeFrame> Exchanges { get; } = new List<SefExchangeFrame>();
    }

    internal static class SefProtocol
    {
        internal const int DefaultNetworkPort = 1470;
        internal const string DefaultProtocolAddress = "01";
        private const string ReadPayload = "00000000";
        private const int DefaultReadTimeoutMs = 5000;
        private const int DefaultWriteTimeoutMs = 5000;
        private const int MaxResponseBytes = 1024;

        private static readonly Regex TemperatureResponseRegex = new Regex(
            @">(?<value>[+-]\d{3}(?:[\.,]\d{2}))",
            RegexOptions.Compiled | RegexOptions.CultureInvariant);

        internal static string NormalizeProtocolAddress(string value)
        {
            var raw = (value ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(raw))
            {
                return DefaultProtocolAddress;
            }

            int numeric;
            if (!int.TryParse(raw, NumberStyles.Integer, CultureInfo.InvariantCulture, out numeric) || numeric < 0 || numeric > 99)
            {
                throw new ArgumentException("L'adresse protocole SEF doit être comprise entre 00 et 99.", nameof(value));
            }

            return numeric.ToString("00", CultureInfo.InvariantCulture);
        }

        internal static string BuildReadCommand(string protocolAddress)
        {
            return "Q#" + NormalizeProtocolAddress(protocolAddress) + "\r" + ReadPayload;
        }

        internal static bool TryParseTemperature(string response, out double value)
        {
            value = 0;
            if (string.IsNullOrWhiteSpace(response))
            {
                return false;
            }

            var match = TemperatureResponseRegex.Match(response);
            if (!match.Success)
            {
                return false;
            }

            var normalized = match.Groups["value"].Value.Replace(',', '.');
            return double.TryParse(normalized, NumberStyles.Float, CultureInfo.InvariantCulture, out value);
        }

        internal static SefReadResult ReadTemperature(
            string networkHost,
            int? networkPort,
            string protocolAddress,
            int? readTimeoutMs,
            int? writeTimeoutMs)
        {
            var host = (networkHost ?? string.Empty).Trim();
            var port = networkPort.GetValueOrDefault(DefaultNetworkPort);
            var normalizedAddress = NormalizeProtocolAddress(protocolAddress);
            var command = BuildReadCommand(normalizedAddress);
            var result = new SefReadResult
            {
                NetworkHost = host,
                NetworkPort = port,
                ProtocolAddress = normalizedAddress,
                Command = EscapeControlCharacters(command),
                Unit = "°C",
            };

            if (string.IsNullOrWhiteSpace(host))
            {
                result.Error = "IP / hôte TCP du convertisseur Sollae / SEF requis.";
                return result;
            }

            if (port < 1 || port > 65535)
            {
                result.Error = "Port TCP SEF invalide.";
                return result;
            }

            var readTimeout = ClampTimeout(readTimeoutMs, DefaultReadTimeoutMs);
            var writeTimeout = ClampTimeout(writeTimeoutMs, DefaultWriteTimeoutMs);

            try
            {
                using (var client = new TcpClient())
                {
                    var connectResult = client.BeginConnect(host, port, null, null);
                    try
                    {
                        if (!connectResult.AsyncWaitHandle.WaitOne(readTimeout))
                        {
                            result.Error = "Timeout de connexion TCP vers la sonde SEF.";
                            return result;
                        }

                        client.EndConnect(connectResult);
                    }
                    finally
                    {
                        connectResult.AsyncWaitHandle.Close();
                    }

                    client.ReceiveTimeout = readTimeout;
                    client.SendTimeout = writeTimeout;

                    using (var stream = client.GetStream())
                    {
                        stream.ReadTimeout = readTimeout;
                        stream.WriteTimeout = writeTimeout;

                        var commandBytes = Encoding.ASCII.GetBytes(command);
                        stream.Write(commandBytes, 0, commandBytes.Length);
                        stream.Flush();
                        result.Exchanges.Add(new SefExchangeFrame
                        {
                            Direction = "tx",
                            Format = "ascii",
                            Content = EscapeControlCharacters(command),
                        });

                        var responseBytes = new List<byte>();
                        var buffer = new byte[128];
                        while (responseBytes.Count < MaxResponseBytes)
                        {
                            int read;
                            try
                            {
                                read = stream.Read(buffer, 0, Math.Min(buffer.Length, MaxResponseBytes - responseBytes.Count));
                            }
                            catch (IOException ex) when (IsSocketTimeout(ex))
                            {
                                break;
                            }

                            if (read <= 0)
                            {
                                break;
                            }

                            for (var index = 0; index < read; index++)
                            {
                                responseBytes.Add(buffer[index]);
                            }

                            var responseSoFar = Encoding.ASCII.GetString(responseBytes.ToArray());
                            var temperatureMatch = TemperatureResponseRegex.Match(responseSoFar);
                            if (temperatureMatch.Success)
                            {
                                var responseEnd = temperatureMatch.Index + temperatureMatch.Length;
                                if (responseSoFar.IndexOf('\r', responseEnd) >= 0)
                                {
                                    break;
                                }
                            }
                        }

                        var rawResponse = Encoding.ASCII.GetString(responseBytes.ToArray());
                        result.RawResponse = EscapeControlCharacters(rawResponse);
                        result.Exchanges.Add(new SefExchangeFrame
                        {
                            Direction = "rx",
                            Format = "ascii",
                            Content = string.IsNullOrEmpty(rawResponse) ? "<timeout>" : result.RawResponse,
                        });

                        double temperature;
                        if (!TryParseTemperature(rawResponse, out temperature))
                        {
                            result.Error = string.IsNullOrEmpty(rawResponse)
                                ? "La sonde SEF n'a renvoyé aucune réponse."
                                : "Réponse SEF reçue mais température non reconnue.";
                            return result;
                        }

                        result.Value = temperature;
                        result.Success = true;
                        return result;
                    }
                }
            }
            catch (SocketException ex)
            {
                result.Error = "Erreur TCP SEF : " + ex.Message;
            }
            catch (IOException ex)
            {
                result.Error = "Erreur d'échange avec la sonde SEF : " + ex.Message;
            }
            catch (Exception ex)
            {
                result.Error = "Erreur lors du test SEF : " + ex.Message;
            }

            return result;
        }

        private static int ClampTimeout(int? value, int fallback)
        {
            var timeout = value.GetValueOrDefault(fallback);
            if (timeout < 250) return 250;
            if (timeout > 60000) return 60000;
            return timeout;
        }

        private static bool IsSocketTimeout(IOException exception)
        {
            var socketException = exception.InnerException as SocketException;
            return socketException != null && socketException.SocketErrorCode == SocketError.TimedOut;
        }

        internal static string EscapeControlCharacters(string value)
        {
            return (value ?? string.Empty)
                .Replace("\r", "\\r")
                .Replace("\n", "\\n");
        }
    }
}
