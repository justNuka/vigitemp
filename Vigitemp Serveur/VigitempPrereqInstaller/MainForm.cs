using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace VigitempPrereqInstaller;

public sealed class MainForm : Form
{
    private readonly Label _titleLabel;
    private readonly Label _descriptionLabel;
    private readonly Label _statusLabel;
    private readonly TextBox _logTextBox;
    private readonly Button _installButton;
    private readonly Button _closeButton;
    private bool _running;

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

        _logTextBox = new TextBox
        {
            Location = new Point(24, 170),
            Width = 840,
            Height = 400,
            Multiline = true,
            ScrollBars = ScrollBars.Both,
            ReadOnly = true,
            WordWrap = false,
            Font = new Font("Consolas", 9F, FontStyle.Regular, GraphicsUnit.Point),
        };

        _installButton = new Button
        {
            Text = "Installer les prerequis",
            Width = 190,
            Height = 36,
            Location = new Point(24, 590),
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
        Controls.Add(_logTextBox);
        Controls.Add(_installButton);
        Controls.Add(_closeButton);
    }

    private async Task RunInstallAsync()
    {
        if (_running)
        {
            return;
        }

        var startupDir = AppContext.BaseDirectory;
        var vcRedist = Path.Combine(startupDir, "vcredist", "VC_redist.x64.exe");
        var nodeMsi = Path.Combine(startupDir, "node", "node-v24.12.0-x64.msi");
        var mySqlMsi = Path.Combine(startupDir, "mysql", "mysql-8.4.7-winx64.msi");

        vcRedist = Path.GetFullPath(vcRedist);
        nodeMsi = Path.GetFullPath(nodeMsi);
        mySqlMsi = Path.GetFullPath(mySqlMsi);

        if (!File.Exists(vcRedist) || !File.Exists(nodeMsi) || !File.Exists(mySqlMsi))
        {
            MessageBox.Show("Les installeurs VC++, Node.js ou MySQL sont introuvables dans le package de prerequis.", "Installation impossible", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }

        _running = true;
        _installButton.Enabled = false;
        _logTextBox.Clear();
        SetStatus("Etat : installation en cours...");
        AppendLog($"[INFO] Package prerequis: {startupDir}");

        try
        {
            var exitCode = await RunInstallersAsync(startupDir, vcRedist, nodeMsi, mySqlMsi);
            if (exitCode == 0)
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
            _installButton.Enabled = true;
        }
    }

    private async Task<int> RunInstallersAsync(string workingDirectory, string vcRedistPath, string nodeMsiPath, string mySqlMsiPath)
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

        AppendLog("[INFO] Installation MySQL (interactive)...");
        var mysqlExitCode = await RunProcessAsync(
            fileName: "msiexec.exe",
            arguments: $"/i \"{mySqlMsiPath}\"",
            workingDirectory: workingDirectory,
            requireSuccessCodes: new[] { 0, 3010, 1641 });
        return mysqlExitCode;
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
}
