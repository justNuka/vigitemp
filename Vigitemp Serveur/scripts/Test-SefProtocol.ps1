param()

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$sourcePath = Join-Path $repoRoot "Vigitemp Serveur\SefProtocol.cs"

if (-not (Test-Path $sourcePath)) {
    throw "SefProtocol.cs introuvable: $sourcePath"
}

$source = Get-Content -Raw -LiteralPath $sourcePath
$harness = @"
namespace Vigitemp_Serveur
{
    public static class SefProtocolHarness
    {
        public static string LastReceivedCommand { get; private set; }

        public static string Build(string address)
        {
            return SefProtocol.BuildReadCommand(address);
        }

        public static bool TryParse(string response, out double value)
        {
            return SefProtocol.TryParseTemperature(response, out value);
        }

        public static double RoundTrip()
        {
            LastReceivedCommand = null;
            var listener = new System.Net.Sockets.TcpListener(System.Net.IPAddress.Loopback, 0);
            listener.Start();
            var port = ((System.Net.IPEndPoint)listener.LocalEndpoint).Port;
            System.Exception serverError = null;

            var serverTask = System.Threading.Tasks.Task.Run(() =>
            {
                try
                {
                    using (var client = listener.AcceptTcpClient())
                    using (var stream = client.GetStream())
                    {
                        var expectedLength = System.Text.Encoding.ASCII.GetByteCount("Q#01\r00000000");
                        var buffer = new byte[expectedLength];
                        var offset = 0;
                        while (offset < expectedLength)
                        {
                            var read = stream.Read(buffer, offset, expectedLength - offset);
                            if (read <= 0)
                            {
                                throw new System.IO.IOException("Connexion fermée avant réception complète de la commande SEF.");
                            }
                            offset += read;
                        }

                        LastReceivedCommand = System.Text.Encoding.ASCII.GetString(buffer, 0, offset);
                        var banner = System.Text.Encoding.ASCII.GetBytes("0030f911b4b9\r\n");
                        stream.Write(banner, 0, banner.Length);
                        stream.Flush();
                        System.Threading.Thread.Sleep(100);
                        var response = System.Text.Encoding.ASCII.GetBytes(">+021.63\r");
                        stream.Write(response, 0, response.Length);
                        stream.Flush();
                    }
                }
                catch (System.Exception ex)
                {
                    serverError = ex;
                }
            });

            SefReadResult result;
            try
            {
                result = SefProtocol.ReadTemperature("127.0.0.1", port, "01", 2000, 2000);
            }
            finally
            {
                if (!serverTask.Wait(5000))
                {
                    listener.Stop();
                    throw new System.TimeoutException("Le serveur SEF simulé n'a pas terminé dans le délai imparti.");
                }
                listener.Stop();
            }

            if (serverError != null)
            {
                throw new System.Exception("Erreur du serveur SEF simulé.", serverError);
            }
            if (!result.Success || result.Error != null)
            {
                throw new System.Exception("Lecture SEF simulée en échec: " + (result.Error ?? "erreur inconnue"));
            }
            if (!result.Value.HasValue)
            {
                throw new System.Exception("Lecture SEF simulée sans valeur.");
            }

            return result.Value.Value;
        }
    }
}
"@

Add-Type -TypeDefinition ($source + [Environment]::NewLine + $harness) -Language CSharp

$expectedCommand = "Q#01`r00000000"
$command = [Vigitemp_Serveur.SefProtocolHarness]::Build("01")
if ($command -ne $expectedCommand) {
    throw "Commande SEF inattendue: [$command]"
}

$normalizedCommand = [Vigitemp_Serveur.SefProtocolHarness]::Build("1")
if ($normalizedCommand -ne $expectedCommand) {
    throw "Normalisation adresse SEF invalide: [$normalizedCommand]"
}

$parsed = 0.0
if (-not [Vigitemp_Serveur.SefProtocolHarness]::TryParse(">+024.08`r", [ref]$parsed)) {
    throw "Impossible de parser la réponse SEF positive de référence."
}
if ([Math]::Abs($parsed - 24.08) -gt 0.0001) {
    throw "Valeur SEF positive inattendue: $parsed"
}

$negative = 0.0
if (-not [Vigitemp_Serveur.SefProtocolHarness]::TryParse(">-005.25`r", [ref]$negative)) {
    throw "Impossible de parser une réponse SEF négative."
}
if ([Math]::Abs($negative + 5.25) -gt 0.0001) {
    throw "Valeur SEF négative inattendue: $negative"
}

$prefixed = 0.0
if (-not [Vigitemp_Serveur.SefProtocolHarness]::TryParse("0030f911b4b9`r`n>+021.63`r", [ref]$prefixed)) {
    throw "Impossible de parser la réponse terrain préfixée par le MAC Sollae."
}
if ([Math]::Abs($prefixed - 21.63) -gt 0.0001) {
    throw "Valeur SEF préfixée inattendue: $prefixed"
}

$invalid = 0.0
if ([Vigitemp_Serveur.SefProtocolHarness]::TryParse("invalid", [ref]$invalid)) {
    throw "Une réponse SEF invalide a été acceptée."
}

$roundTripValue = [Vigitemp_Serveur.SefProtocolHarness]::RoundTrip()
if ([Math]::Abs($roundTripValue - 21.63) -gt 0.0001) {
    throw "Valeur SEF round-trip Sollae inattendue: $roundTripValue"
}
if ([Vigitemp_Serveur.SefProtocolHarness]::LastReceivedCommand -ne $expectedCommand) {
    throw "La sonde SEF simulée n'a pas reçu la trame exacte attendue: [$([Vigitemp_Serveur.SefProtocolHarness]::LastReceivedCommand)]"
}

Write-Host "SEF protocol contract OK"
Write-Host "TX exact : Q#01\\r00000000"
Write-Host "RX terrain: 0030f911b4b9\\r\\n>+021.63\\r => 21.63 °C"
