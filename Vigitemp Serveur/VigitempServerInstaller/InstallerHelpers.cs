using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Windows.Forms;
using System.Xml;
using Microsoft.Win32;

namespace VigitempServerInstaller;

internal static class InstallerHelpers
{
    private const string UninstallRegistryKeyName = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\VigiSensysServer";
    private const string ProductDisplayName = "VigiSensys Server";
    private const string ProductPublisher = "VigiSensys";

    public static string PromptText(IWin32Window owner, string title, string label, string defaultValue = "", bool password = false)
    {
        using var form = new Form();
        form.Text = title;
        form.Width = 560;
        form.Height = 180;
        form.StartPosition = FormStartPosition.CenterParent;
        form.FormBorderStyle = FormBorderStyle.FixedDialog;
        form.MaximizeBox = false;
        form.MinimizeBox = false;

        var lbl = new Label { Left = 16, Top = 16, Width = 500, Text = label };
        var tb = new TextBox { Left = 16, Top = 44, Width = 510, Text = defaultValue ?? string.Empty, UseSystemPasswordChar = password };
        var ok = new Button { Text = "OK", Left = 350, Width = 80, Top = 82, DialogResult = DialogResult.OK };
        var cancel = new Button { Text = "Annuler", Left = 446, Width = 80, Top = 82, DialogResult = DialogResult.Cancel };
        form.Controls.AddRange(new Control[] { lbl, tb, ok, cancel });
        form.AcceptButton = ok;
        form.CancelButton = cancel;
        return form.ShowDialog(owner) == DialogResult.OK ? tb.Text.Trim() : null;
    }

    public static string PromptFile(IWin32Window owner, string title, string filter, string initialPath = "")
    {
        using var dialog = new OpenFileDialog
        {
            Title = title,
            Filter = filter,
        };

        if (!string.IsNullOrWhiteSpace(initialPath))
        {
            try
            {
                dialog.InitialDirectory = Path.GetDirectoryName(initialPath);
                dialog.FileName = Path.GetFileName(initialPath);
            }
            catch { }
        }

        return dialog.ShowDialog(owner) == DialogResult.OK ? dialog.FileName : null;
    }


    public static string GetSharedArtifactsDirectory(string startupDir)
    {
        var normalizedStartup = Path.GetFullPath(startupDir)
            .TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        var packageDir = new DirectoryInfo(normalizedStartup);
        var root = packageDir.Parent ?? packageDir;
        var sharedDir = Path.Combine(root.FullName, "shared-secrets");
        Directory.CreateDirectory(sharedDir);
        return sharedDir;
    }

    public static string GetOrCreateSharedSecret(string startupDir, string fileName, string providedValue = null, int byteLength = 32)
    {
        var sharedDir = GetSharedArtifactsDirectory(startupDir);
        var secretPath = Path.Combine(sharedDir, fileName);
        var secretValue = string.IsNullOrWhiteSpace(providedValue)
            ? (File.Exists(secretPath) ? File.ReadAllText(secretPath).Trim() : null)
            : providedValue.Trim();

        if (string.IsNullOrWhiteSpace(secretValue))
        {
            secretValue = GenerateSecret(byteLength);
        }

        File.WriteAllText(secretPath, secretValue + Environment.NewLine, Encoding.UTF8);
        return secretValue;
    }

    public static string FindFirstMatchingFile(string startupDir, params string[] fileNames)
    {
        if (fileNames == null || fileNames.Length == 0)
        {
            return null;
        }

        var current = new DirectoryInfo(Path.GetFullPath(startupDir));
        while (current != null)
        {
            foreach (var fileName in fileNames)
            {
                var candidate = Path.Combine(current.FullName, fileName);
                if (File.Exists(candidate))
                {
                    return candidate;
                }
            }

            current = current.Parent;
        }

        return null;
    }
    public static string GenerateSecret(int byteLength = 32)
    {
        var bytes = new byte[byteLength];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    public static void CopyDirectory(string sourceDir, string destDir)
    {
        Directory.CreateDirectory(destDir);

        foreach (var dir in Directory.GetDirectories(sourceDir, "*", SearchOption.AllDirectories))
        {
            var relativeDir = Path.GetRelativePath(sourceDir, dir);
            Directory.CreateDirectory(Path.Combine(destDir, relativeDir));
        }

        foreach (var file in Directory.GetFiles(sourceDir, "*", SearchOption.AllDirectories))
        {
            var relativeFile = Path.GetRelativePath(sourceDir, file);
            var target = Path.Combine(destDir, relativeFile);
            var parent = Path.GetDirectoryName(target);
            if (!string.IsNullOrWhiteSpace(parent))
            {
                Directory.CreateDirectory(parent);
            }
            File.Copy(file, target, true);
        }
    }

    public static void SetAppSetting(string configPath, string key, string value)
    {
        var xml = new XmlDocument();
        xml.PreserveWhitespace = true;
        xml.Load(configPath);

        var appSettings = xml.SelectSingleNode("/configuration/appSettings");
        if (appSettings == null)
        {
            appSettings = xml.CreateElement("appSettings");
            xml.DocumentElement?.AppendChild(appSettings);
        }

        var node = appSettings?.SelectSingleNode($"add[@key='{key}']") as XmlElement;
        if (node == null)
        {
            node = xml.CreateElement("add");
            node.SetAttribute("key", key);
            appSettings?.AppendChild(node);
        }

        node.SetAttribute("value", value ?? string.Empty);
        xml.Save(configPath);
    }

    public static int RunProcess(string fileName, string arguments, string workingDirectory, Action<string> log)
    {
        var psi = new ProcessStartInfo
        {
            FileName = fileName,
            Arguments = arguments,
            WorkingDirectory = workingDirectory,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true,
            StandardOutputEncoding = Encoding.UTF8,
            StandardErrorEncoding = Encoding.UTF8,
        };

        using var process = new Process { StartInfo = psi };
        process.OutputDataReceived += (_, e) => { if (!string.IsNullOrEmpty(e.Data)) log(e.Data); };
        process.ErrorDataReceived += (_, e) => { if (!string.IsNullOrEmpty(e.Data)) log("[ERR] " + e.Data); };
        process.Start();
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();
        process.WaitForExit();
        return process.ExitCode;
    }

    public static bool ServiceExists(string serviceName)
    {
        return RunProcess("sc.exe", $"query \"{serviceName}\"", Environment.SystemDirectory, _ => { }) == 0;
    }

    public static void RemoveService(string serviceName, Action<string> log)
    {
        RunProcess("sc.exe", $"stop \"{serviceName}\"", Environment.SystemDirectory, log);
        RunProcess("sc.exe", $"delete \"{serviceName}\"", Environment.SystemDirectory, log);
        System.Threading.Thread.Sleep(1500);
    }

    public static void InstallServerService(string serviceName, string exePath, Action<string> log)
    {
        var binPath = '"' + exePath + '"';
        EnsureSuccess(RunProcess("sc.exe", $"create \"{serviceName}\" binPath= {binPath} start= auto", Environment.SystemDirectory, log), "sc create");
        RunProcess("sc.exe", $"description \"{serviceName}\" \"VigiSensys C# server service\"", Environment.SystemDirectory, log);
        RunProcess("sc.exe", $"failure \"{serviceName}\" reset= 86400 actions= restart/60000/restart/60000/restart/60000", Environment.SystemDirectory, log);
        RunProcess("sc.exe", $"failureflag \"{serviceName}\" 1", Environment.SystemDirectory, log);
        EnsureSuccess(RunProcess("sc.exe", $"start \"{serviceName}\"", Environment.SystemDirectory, log), "sc start");
    }

    public static void EnsureSuccess(int exitCode, string step)
    {
        if (exitCode != 0)
        {
            throw new InvalidOperationException($"{step} a échoué avec le code {exitCode}.");
        }
    }

    public static string WriteServerUninstallScript(string installPath, string serviceName)
    {
        Directory.CreateDirectory(installPath);
        var scriptPath = Path.Combine(installPath, "Uninstall-VigiSensysServer.ps1");
        var script = $@"Param(
    [string]$ServiceName = ""{serviceName}"",
    [string]$InstallDir = ""{installPath}"",
    [switch]$Force
)

Set-StrictMode -Version Latest
$ErrorActionPreference = ""Stop""

if (-not $Force) {{
    $answer = Read-Host ""Supprimer le service et les fichiers serveur ? (y/n) [y]""
    if ([string]::IsNullOrWhiteSpace($answer)) {{ $answer = ""y"" }}
    if ($answer -ne ""y"") {{ exit 1 }}
}}

try {{ Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue }} catch {{ }}
try {{ & sc.exe delete $ServiceName | Out-Null }} catch {{ }}

if (Test-Path $InstallDir) {{
    Remove-Item -LiteralPath $InstallDir -Recurse -Force
}}

try {{ Remove-Item -Path ""HKLM:\SOFTWARE\Vigitemp\Server"" -Recurse -Force -ErrorAction SilentlyContinue }} catch {{ }}
try {{ Remove-Item -Path ""HKLM:\{UninstallRegistryKeyName}"" -Recurse -Force -ErrorAction SilentlyContinue }} catch {{ }}
";
        File.WriteAllText(scriptPath, script, new UTF8Encoding(false));
        return scriptPath;
    }

    public static string WriteInstalledDisplayIcon(string installPath, string productKeyName, string sourceExecutablePath = null)
    {
        Directory.CreateDirectory(installPath);
        var iconPath = Path.Combine(installPath, $"{productKeyName}.ico");
        var iconSource = string.IsNullOrWhiteSpace(sourceExecutablePath) ? Application.ExecutablePath : sourceExecutablePath;
        using var icon = Icon.ExtractAssociatedIcon(iconSource);
        if (icon == null)
        {
            return null;
        }

        using var stream = File.Create(iconPath);
        icon.Save(stream);
        return iconPath;
    }

    public static void WriteRegistryInfo(string installPath, string version, string licensePath, string publicKeyPath, string serviceName, string displayIconPath, string uninstallScriptPath)
    {
        using var key = Registry.LocalMachine.CreateSubKey(@"SOFTWARE\Vigitemp\Server");
        key?.SetValue("InstallPath", installPath, RegistryValueKind.String);
        key?.SetValue("Version", version ?? string.Empty, RegistryValueKind.String);
        key?.SetValue("LastInstalledUtc", DateTime.UtcNow.ToString("o"), RegistryValueKind.String);
        key?.SetValue("LicensePath", licensePath ?? string.Empty, RegistryValueKind.String);
        key?.SetValue("LicensePublicKeyPath", publicKeyPath ?? string.Empty, RegistryValueKind.String);

        using var uninstallKey = Registry.LocalMachine.CreateSubKey(UninstallRegistryKeyName);
        uninstallKey?.SetValue("DisplayName", ProductDisplayName, RegistryValueKind.String);
        uninstallKey?.SetValue("DisplayVersion", version ?? string.Empty, RegistryValueKind.String);
        uninstallKey?.SetValue("Publisher", ProductPublisher, RegistryValueKind.String);
        uninstallKey?.SetValue("InstallLocation", installPath, RegistryValueKind.String);
        if (!string.IsNullOrWhiteSpace(displayIconPath)) uninstallKey?.SetValue("DisplayIcon", displayIconPath, RegistryValueKind.String);
        var uninstallCommand =
            $"powershell.exe -NoProfile -ExecutionPolicy Bypass -File \"{uninstallScriptPath}\" -ServiceName \"{serviceName}\" -InstallDir \"{installPath}\"";
        var quietUninstallCommand = uninstallCommand + " -Force";
        uninstallKey?.SetValue("UninstallString", uninstallCommand, RegistryValueKind.String);
        uninstallKey?.SetValue("QuietUninstallString", quietUninstallCommand, RegistryValueKind.String);
        uninstallKey?.SetValue("NoModify", 1, RegistryValueKind.DWord);
        uninstallKey?.SetValue("NoRepair", 1, RegistryValueKind.DWord);
        if (Directory.Exists(installPath))
        {
            var sizeKb = Math.Max(1L, (new DirectoryInfo(installPath).EnumerateFiles("*", SearchOption.AllDirectories).Sum(f => f.Length) + 1023L) / 1024L);
            uninstallKey?.SetValue("EstimatedSize", (int)Math.Min(int.MaxValue, sizeKb), RegistryValueKind.DWord);
        }
    }
}
