using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Windows.Forms;
using Microsoft.Win32;

namespace VigitempPrereqInstaller;

public sealed class MainForm : Form
{
    private readonly Label _titleLabel;
    private readonly Label _descriptionLabel;
    private readonly Label _statusLabel;
    private readonly Panel _diagnosticPanel;
    private readonly Label _vcStatusLabel;
    private readonly Label _nodeStatusLabel;
    private readonly Label _mysqlStatusLabel;
    private readonly TextBox _logTextBox;
    private readonly Button _refreshButton;
    private readonly Button _installButton;
    private readonly Button _closeButton;
    private bool _running;
    private PrerequisiteDetection _lastDetection = new();

    public MainForm()
    {
        Text = "Installation des prerequis VigiSensys";
        StartPosition = FormStartPosition.CenterScreen;
        Width = 920;
        Height = 660;
        MinimumSize = new Size(920, 660);
        Font = new Font("Segoe UI", 9F, FontStyle.Regular, GraphicsUnit.Point);

        _titleLabel = new Label
        {
            AutoSize = true,
            Font = new Font("Segoe UI Semibold", 18F, FontStyle.Bold, GraphicsUnit.Point),
            Text = "Installateur des prerequis VigiSensys",
            Location = new Point(24, 20),
        };

        _descriptionLabel = new Label
        {
            AutoSize = false,
            Width = 840,
            Height = 68,
            Location = new Point(24, 62),
            Text = "Cet installateur lance directement les prerequis systeme partages (VC++ Redistributable, Node.js et MySQL) depuis le dossier de prerequis prepare.",
        };

        _statusLabel = new Label
        {
            AutoSize = false,
            Width = 840,
            Height = 22,
            Location = new Point(24, 138),
            Text = "Etat : pret",
        };

        _diagnosticPanel = new Panel
        {
            Location = new Point(24, 170),
            Width = 840,
            Height = 96,
            BorderStyle = BorderStyle.FixedSingle,
        };

        _vcStatusLabel = CreatePrerequisiteLabel("VC++ Redistributable", 16);
        _nodeStatusLabel = CreatePrerequisiteLabel("Node.js", 286);
        _mysqlStatusLabel = CreatePrerequisiteLabel("MySQL", 556);
        _diagnosticPanel.Controls.Add(_vcStatusLabel);
        _diagnosticPanel.Controls.Add(_nodeStatusLabel);
        _diagnosticPanel.Controls.Add(_mysqlStatusLabel);

        _logTextBox = new TextBox
        {
            Location = new Point(24, 280),
            Width = 840,
            Height = 290,
            Multiline = true,
            ScrollBars = ScrollBars.Both,
            ReadOnly = true,
            WordWrap = false,
            Font = new Font("Consolas", 9F, FontStyle.Regular, GraphicsUnit.Point),
        };

        _refreshButton = new Button
        {
            Text = "Rafraîchir la détection",
            Width = 170,
            Height = 36,
            Location = new Point(24, 590),
        };
        _refreshButton.Click += async (_, _) => await RefreshDetectionAsync(true);

        _installButton = new Button
        {
            Text = "Installer les prerequis",
            Width = 190,
            Height = 36,
            Location = new Point(204, 590),
        };
        _installButton.Click += async (_, _) => await RunInstallAsync();

        _closeButton = new Button
        {
            Text = "Fermer",
            Width = 120,
            Height = 36,
            Location = new Point(744, 590),
        };
        _closeButton.Click += (_, _) => Close();

        Controls.Add(_titleLabel);
        Controls.Add(_descriptionLabel);
        Controls.Add(_statusLabel);
        Controls.Add(_diagnosticPanel);
        Controls.Add(_logTextBox);
        Controls.Add(_refreshButton);
        Controls.Add(_installButton);
        Controls.Add(_closeButton);

        Shown += async (_, _) => await RefreshDetectionAsync(false);
    }

    private async Task RunInstallAsync()
    {
        if (_running)
        {
            return;
        }

        var startupDir = AppContext.BaseDirectory;
        var vcRedist = Path.Combine(startupDir, "vcredist", "VC_redist.x64.exe");
        var nodeMsi = FindNodeInstaller(startupDir);
        var mySqlMsi = Path.Combine(startupDir, "mysql", "mysql-8.4.7-winx64.msi");

        vcRedist = Path.GetFullPath(vcRedist);
        if (!string.IsNullOrWhiteSpace(nodeMsi))
        {
            nodeMsi = Path.GetFullPath(nodeMsi);
        }
        mySqlMsi = Path.GetFullPath(mySqlMsi);

        if (!File.Exists(vcRedist) || string.IsNullOrWhiteSpace(nodeMsi) || !File.Exists(nodeMsi) || !File.Exists(mySqlMsi))
        {
            MessageBox.Show("Les installeurs VC++, Node.js ou MySQL sont introuvables dans le package de prerequis.", "Installation impossible", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }

        _running = true;
        _refreshButton.Enabled = false;
        _installButton.Enabled = false;
        _logTextBox.Clear();
        SetStatus("Etat : installation en cours...");
        AppendLog($"[INFO] Package prerequis: {startupDir}");

        try
        {
            var detection = await RefreshDetectionAsync(true);

            var exitCode = await RunInstallersAsync(startupDir, vcRedist, nodeMsi, mySqlMsi, detection);
            if (exitCode == 0 || exitCode == 1638 || exitCode == 3010 || exitCode == 1641)
            {
                SetStatus("Etat : installation terminee avec succes");
                AppendLog("[OK] Installation des prerequis terminee.");
                MessageBox.Show(
                    "Installation des prerequis terminee. Verifiez MySQL si une configuration complementaire est demandee.",
                    "Installation terminee",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information);
            }
            else
            {
                SetStatus($"Etat : installation terminee avec erreur (code {exitCode})");
                AppendLog($"[FAIL] L'installateur a retourne le code {exitCode}.");
                MessageBox.Show(
                    $"L'installation des prerequis a retourne le code {exitCode}. Consulter le journal affiche.",
                    "Installation en erreur",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning);
            }
        }
        catch (Exception ex)
        {
            SetStatus("Etat : erreur de lancement");
            AppendLog("[ERROR] " + ex.Message);
            MessageBox.Show(ex.Message, "Installation impossible", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        finally
        {
            _running = false;
            _refreshButton.Enabled = true;
            _installButton.Enabled = true;
        }
    }

    private static string FindNodeInstaller(string startupDir)
    {
        var nodeDir = Path.Combine(startupDir, "node");
        if (!Directory.Exists(nodeDir))
        {
            return null;
        }

        var candidates = Directory.GetFiles(nodeDir, "node-v*-x64.msi", SearchOption.TopDirectoryOnly)
            .Concat(Directory.GetFiles(nodeDir, "node-*.msi", SearchOption.TopDirectoryOnly))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        if (candidates.Length == 0)
        {
            return null;
        }

        string bestPath = null;
        Version bestVersion = null;
        DateTime bestWriteTime = DateTime.MinValue;
        var regex = new Regex(@"^node-v(?<v>\d+\.\d+\.\d+)-x64\.msi$", RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);

        foreach (var candidate in candidates)
        {
            var fileName = Path.GetFileName(candidate);
            var match = regex.Match(fileName);
            if (match.Success && Version.TryParse(match.Groups["v"].Value, out var version))
            {
                if (bestVersion == null || version > bestVersion)
                {
                    bestVersion = version;
                    bestPath = candidate;
                }
                continue;
            }

            var lastWrite = File.GetLastWriteTimeUtc(candidate);
            if (bestPath == null || (bestVersion == null && lastWrite > bestWriteTime))
            {
                bestWriteTime = lastWrite;
                bestPath = candidate;
            }
        }

        return bestPath;
    }

    private async Task<int> RunInstallersAsync(string workingDirectory, string vcRedistPath, string nodeMsiPath, string mySqlMsiPath, PrerequisiteDetection detection)
    {
        if (detection.VcRedistInstalled)
        {
            AppendLog($"[INFO] VC++ Redistributable déjà détecté{FormatVersionSuffix(detection.VcRedistVersion)}. Installation ignorée.");
        }
        else
        {
            AppendLog("[INFO] Installation VC++ Redistributable...");
            var vcExitCode = await RunProcessAsync(
                fileName: vcRedistPath,
                arguments: "/install /quiet /norestart",
                workingDirectory: workingDirectory,
                requireSuccessCodes: new[] { 0, 1638, 3010 });
            if (vcExitCode != 0 && vcExitCode != 1638 && vcExitCode != 3010)
            {
                return vcExitCode;
            }
        }

        if (detection.NodeInstalled)
        {
            AppendLog($"[INFO] Node.js déjà détecté{FormatVersionSuffix(detection.NodeVersion)}. Installation ignorée.");
        }
        else
        {
            AppendLog("[INFO] Installation Node.js (interactive)...");
            var nodeExitCode = await RunProcessAsync(
                fileName: "msiexec.exe",
                arguments: $"/i \"{nodeMsiPath}\"",
                workingDirectory: workingDirectory,
                requireSuccessCodes: new[] { 0, 3010, 1641, 1638 });
            if (nodeExitCode != 0 && nodeExitCode != 3010 && nodeExitCode != 1641 && nodeExitCode != 1638)
            {
                return nodeExitCode;
            }
        }

        if (detection.MySqlInstalled)
        {
            AppendLog($"[INFO] MySQL déjà détecté{FormatVersionSuffix(detection.MySqlVersion)}. Installation ignorée.");
            return 0;
        }

        AppendLog("[INFO] Installation MySQL (interactive)...");
        var mysqlExitCode = await RunProcessAsync(
            fileName: "msiexec.exe",
            arguments: $"/i \"{mySqlMsiPath}\"",
            workingDirectory: workingDirectory,
            requireSuccessCodes: new[] { 0, 3010, 1641, 1638 });
        return mysqlExitCode;
    }


    private Label CreatePrerequisiteLabel(string title, int left)
    {
        return new Label
        {
            Left = left,
            Top = 16,
            Width = 250,
            Height = 56,
            BorderStyle = BorderStyle.FixedSingle,
            TextAlign = ContentAlignment.MiddleLeft,
            Padding = new Padding(10, 8, 10, 8),
            Font = new Font("Segoe UI Semibold", 9F, FontStyle.Bold, GraphicsUnit.Point),
            Text = title + Environment.NewLine + "V?rification en attente",
            BackColor = Color.FromArgb(248, 250, 252),
        };
    }

    private async Task<PrerequisiteDetection> RefreshDetectionAsync(bool clearLog)
    {
        if (_running && clearLog)
        {
            return _lastDetection;
        }

        _refreshButton.Enabled = false;
        if (clearLog)
        {
            _logTextBox.Clear();
            AppendLog("[INFO] Rafraîchissement manuel de la détection...");
        }

        try
        {
            var detection = await DetectInstalledPrerequisitesAsync();
            _lastDetection = detection;
            UpdateDetectionCards(detection);
            LogDetection(detection);
            return detection;
        }
        finally
        {
            if (!_running)
            {
                _refreshButton.Enabled = true;
            }
        }
    }

    private void UpdateDetectionCards(PrerequisiteDetection detection)
    {
        UpdateDetectionCard(_vcStatusLabel, "VC++ Redistributable", detection.VcRedistInstalled, detection.VcRedistVersion);
        UpdateDetectionCard(_nodeStatusLabel, "Node.js", detection.NodeInstalled, detection.NodeVersion);
        UpdateDetectionCard(_mysqlStatusLabel, "MySQL", detection.MySqlInstalled, detection.MySqlVersion);
    }

    private static void UpdateDetectionCard(Label label, string title, bool installed, string version)
    {
        label.BackColor = installed ? Color.FromArgb(220, 252, 231) : Color.FromArgb(254, 242, 242);
        label.ForeColor = installed ? Color.FromArgb(22, 101, 52) : Color.FromArgb(153, 27, 27);
        var status = installed ? "Détecté" : "À installer";
        var suffix = string.IsNullOrWhiteSpace(version) ? string.Empty : Environment.NewLine + version.Trim();
        label.Text = title + Environment.NewLine + status + suffix;
    }

    private async Task<PrerequisiteDetection> DetectInstalledPrerequisitesAsync()
    {
        var detection = new PrerequisiteDetection
        {
            VcRedistVersion = FindInstalledProgramVersion(name =>
                name.Contains("Microsoft Visual C++", StringComparison.OrdinalIgnoreCase)
                && name.Contains("Redistributable", StringComparison.OrdinalIgnoreCase)
                && name.Contains("(x64)", StringComparison.OrdinalIgnoreCase)),
            MySqlVersion = FindInstalledProgramVersion(name =>
                name.Contains("MySQL", StringComparison.OrdinalIgnoreCase)
                && name.Contains("Server", StringComparison.OrdinalIgnoreCase))
        };

        detection.VcRedistInstalled = !string.IsNullOrWhiteSpace(detection.VcRedistVersion);
        detection.MySqlInstalled = !string.IsNullOrWhiteSpace(detection.MySqlVersion);

        var nodeVersion = await TryGetCommandOutputAsync("node", "--version");
        if (!string.IsNullOrWhiteSpace(nodeVersion))
        {
            detection.NodeInstalled = true;
            detection.NodeVersion = nodeVersion.Trim();
        }

        return detection;
    }

    private void LogDetection(PrerequisiteDetection detection)
    {
        AppendLog("[INFO] Vérification des prérequis installés...");
        AppendLog($"[INFO] VC++ Redistributable : {(detection.VcRedistInstalled ? $"détecté{FormatVersionSuffix(detection.VcRedistVersion)}" : "non détecté")}");
        AppendLog($"[INFO] Node.js : {(detection.NodeInstalled ? $"détecté{FormatVersionSuffix(detection.NodeVersion)}" : "non détecté")}");
        AppendLog($"[INFO] MySQL : {(detection.MySqlInstalled ? $"détecté{FormatVersionSuffix(detection.MySqlVersion)}" : "non détecté")}");
    }

    private static string FormatVersionSuffix(string version)
    {
        return string.IsNullOrWhiteSpace(version) ? string.Empty : $" ({version})";
    }

    private static string FindInstalledProgramVersion(Func<string, bool> namePredicate)
    {
        foreach (var root in new[]
                 {
                     @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall",
                     @"SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall"
                 })
        {
            using var baseKey = Registry.LocalMachine.OpenSubKey(root);
            if (baseKey == null) continue;

            foreach (var subKeyName in baseKey.GetSubKeyNames())
            {
                using var subKey = baseKey.OpenSubKey(subKeyName);
                var displayName = subKey?.GetValue("DisplayName") as string;
                if (string.IsNullOrWhiteSpace(displayName) || !namePredicate(displayName)) continue;

                return (subKey.GetValue("DisplayVersion") as string)?.Trim() ?? displayName.Trim();
            }
        }

        return null;
    }

    private async Task<string> TryGetCommandOutputAsync(string fileName, string arguments)
    {
        try
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = fileName,
                Arguments = arguments,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true,
                StandardOutputEncoding = Encoding.UTF8,
                StandardErrorEncoding = Encoding.UTF8,
            };

            using var process = new Process { StartInfo = startInfo };
            if (!process.Start())
            {
                return null;
            }

            var stdout = await process.StandardOutput.ReadToEndAsync();
            var stderr = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();
            if (process.ExitCode != 0)
            {
                return string.IsNullOrWhiteSpace(stderr) ? null : stderr.Trim();
            }

            return stdout.Trim();
        }
        catch
        {
            return null;
        }
    }

    private async Task<int> RunProcessAsync(string fileName, string arguments, string workingDirectory, int[] requireSuccessCodes)
    {
        var startInfo = new ProcessStartInfo
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

        using var process = new Process { StartInfo = startInfo, EnableRaisingEvents = true };
        process.OutputDataReceived += (_, eventArgs) =>
        {
            if (eventArgs.Data != null)
            {
                AppendLog(eventArgs.Data);
            }
        };
        process.ErrorDataReceived += (_, eventArgs) =>
        {
            if (eventArgs.Data != null)
            {
                AppendLog("[ERR] " + eventArgs.Data);
            }
        };

        if (!process.Start())
        {
            throw new InvalidOperationException($"Impossible de lancer {Path.GetFileName(fileName)}.");
        }

        process.BeginOutputReadLine();
        process.BeginErrorReadLine();
        await process.WaitForExitAsync();

        if (Array.IndexOf(requireSuccessCodes, process.ExitCode) >= 0)
        {
            return process.ExitCode;
        }

        return process.ExitCode;
    }

    private void SetStatus(string status)
    {
        if (InvokeRequired)
        {
            BeginInvoke(new Action<string>(SetStatus), status);
            return;
        }

        _statusLabel.Text = status;
    }

    private void AppendLog(string line)
    {
        if (InvokeRequired)
        {
            BeginInvoke(new Action<string>(AppendLog), line);
            return;
        }

        _logTextBox.AppendText(line + Environment.NewLine);
    }

    private sealed class PrerequisiteDetection
    {
        public bool VcRedistInstalled { get; set; }
        public string VcRedistVersion { get; set; }
        public bool NodeInstalled { get; set; }
        public string NodeVersion { get; set; }
        public bool MySqlInstalled { get; set; }
        public string MySqlVersion { get; set; }
    }

}
