using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Windows.Forms;

namespace VigitempServerInstaller;

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
        Text = "Installation du serveur VigiSensys";
        StartPosition = FormStartPosition.CenterScreen;
        Width = 900;
        Height = 640;
        MinimumSize = new Size(900, 640);
        Font = new Font("Segoe UI", 9F, FontStyle.Regular, GraphicsUnit.Point);

        _titleLabel = new Label { AutoSize = true, Font = new Font("Segoe UI Semibold", 18F, FontStyle.Bold, GraphicsUnit.Point), Text = "Installateur du serveur VigiSensys", Location = new Point(24, 20) };
        _descriptionLabel = new Label { AutoSize = false, Width = 820, Height = 52, Location = new Point(24, 62), Text = "Installe le serveur C# depuis le package offline, configure le fichier .config et crée le service Windows." };
        _statusLabel = new Label { AutoSize = false, Width = 820, Height = 22, Location = new Point(24, 122), Text = "Etat : pret" };
        _logTextBox = new TextBox { Location = new Point(24, 154), Width = 820, Height = 388, Multiline = true, ScrollBars = ScrollBars.Both, ReadOnly = true, WordWrap = false, Font = new Font("Consolas", 9F, FontStyle.Regular, GraphicsUnit.Point) };
        _installButton = new Button { Text = "Lancer l'installation", Width = 170, Height = 36, Location = new Point(24, 560) };
        _closeButton = new Button { Text = "Fermer", Width = 120, Height = 36, Location = new Point(724, 560) };
        _installButton.Click += async (_, _) => await RunInstallAsync();
        _closeButton.Click += (_, _) => Close();

        Controls.AddRange(new Control[] { _titleLabel, _descriptionLabel, _statusLabel, _logTextBox, _installButton, _closeButton });
    }

    private async System.Threading.Tasks.Task RunInstallAsync()
    {
        if (_running)
        {
            return;
        }

        var startupDir = AppContext.BaseDirectory;
        var sourceExe = Path.Combine(startupDir, "Vigitemp Serveur.exe");
        if (!File.Exists(sourceExe))
        {
            MessageBox.Show($"Executable serveur introuvable : {sourceExe}", "Installation impossible", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }

        var installDir = InstallerHelpers.PromptText(this, "Installation serveur", "Dossier d'installation", Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), @"Vigitemp\server"));
        if (string.IsNullOrWhiteSpace(installDir)) return;
        var serviceName = InstallerHelpers.PromptText(this, "Installation serveur", "Nom du service Windows", "VigitempServeur");
        if (string.IsNullOrWhiteSpace(serviceName)) return;
        var websiteBaseUrl = InstallerHelpers.PromptText(this, "Installation serveur", "URL du site web", "http://127.0.0.1:3000");
        if (string.IsNullOrWhiteSpace(websiteBaseUrl)) return;
        var dbProvider = InstallerHelpers.PromptText(this, "Installation serveur", "Type de BDD (mysql/mssql)", "mysql") ?? "mysql";
        if (!string.Equals(dbProvider, "mssql", StringComparison.OrdinalIgnoreCase)) dbProvider = "mysql";
        var dbPortDefault = dbProvider == "mssql" ? "1433" : "3306";
        var dbUserDefault = dbProvider == "mssql" ? "sa" : "root";
        var dbHost = InstallerHelpers.PromptText(this, "Installation serveur", "Hôte BDD", "127.0.0.1"); if (dbHost == null) return;
        var dbPort = InstallerHelpers.PromptText(this, "Installation serveur", "Port BDD", dbPortDefault); if (dbPort == null) return;
        var dbUser = InstallerHelpers.PromptText(this, "Installation serveur", "Utilisateur BDD", dbUserDefault); if (dbUser == null) return;
        var dbPassword = InstallerHelpers.PromptText(this, "Installation serveur", "Mot de passe BDD", "", password: true); if (dbPassword == null) return;
        var dbMain = InstallerHelpers.PromptText(this, "Installation serveur", "Nom BDD principale", "vigi_main"); if (dbMain == null) return;
        var dbMeasure = InstallerHelpers.PromptText(this, "Installation serveur", "Nom BDD mesures", "vigi_mesures"); if (dbMeasure == null) return;
        var dbConnectionTimeoutSeconds = InstallerHelpers.PromptText(this, "Installation serveur", "Timeout connexion BDD (secondes)", "5"); if (dbConnectionTimeoutSeconds == null) return;
        var dbCommandTimeoutSeconds = InstallerHelpers.PromptText(this, "Installation serveur", "Timeout requ?te BDD (secondes)", "30"); if (dbCommandTimeoutSeconds == null) return;
        var sqlServerEncrypt = InstallerHelpers.PromptText(this, "Installation serveur", "SQL Server encrypt (true/false)", "false"); if (sqlServerEncrypt == null) return;
        var sqlServerTrustServerCertificate = InstallerHelpers.PromptText(this, "Installation serveur", "SQL Server trustServerCertificate (true/false)", "true"); if (sqlServerTrustServerCertificate == null) return;
        var licenseHysteresisDelta = InstallerHelpers.PromptText(this, "Installation serveur", "Delta hysteresis alarmes", "0"); if (licenseHysteresisDelta == null) return;
        var licenseDebounceSeconds = InstallerHelpers.PromptText(this, "Installation serveur", "Debounce alarmes (secondes)", "0"); if (licenseDebounceSeconds == null) return;
        var licenseShowWhileSnoozed = InstallerHelpers.PromptText(this, "Installation serveur", "Afficher alarmes pendant snooze (true/false)", "true"); if (licenseShowWhileSnoozed == null) return;
        var settingsCacheSeconds = InstallerHelpers.PromptText(this, "Installation serveur", "Cache r?glages alarmes (secondes)", "60"); if (settingsCacheSeconds == null) return;
        var metrologyLogDetailed = InstallerHelpers.PromptText(this, "Installation serveur", "Logs m?trologie d?taill?s (true/false)", "false"); if (metrologyLogDetailed == null) return;
        var licensePath = InstallerHelpers.PromptFile(this, "Choisir la licence (.vtlic)", "Licence (*.vtlic)|*.vtlic|Tous les fichiers (*.*)|*.*");
        if (string.IsNullOrWhiteSpace(licensePath)) return;
        var publicKeyPath = InstallerHelpers.PromptFile(this, "Choisir la clé publique licence (.pem)", "PEM (*.pem)|*.pem|Tous les fichiers (*.*)|*.*");
        if (string.IsNullOrWhiteSpace(publicKeyPath)) return;
        var instancePublicKey = InstallerHelpers.PromptText(this, "Installation serveur", "Clé publique instance (optionnel)", "") ?? string.Empty;
        var dispatchSecret = InstallerHelpers.PromptText(this, "Installation serveur", "Secret dispatch alarmes (laisser vide pour génération auto)", "") ?? string.Empty;
        if (string.IsNullOrWhiteSpace(dispatchSecret)) dispatchSecret = InstallerHelpers.GenerateSecret();

        _running = true;
        _installButton.Enabled = false;
        _logTextBox.Clear();
        SetStatus("Etat : installation en cours...");
        AppendLog($"[INFO] Source package: {startupDir}");

        try
        {
            Directory.CreateDirectory(installDir);
            InstallerHelpers.CopyDirectory(startupDir, installDir);
            AppendLog("[OK] Fichiers copiés.");

            const string exeName = "Vigitemp Serveur.exe";
            var configPath = Path.Combine(installDir, exeName + ".config");
            if (!File.Exists(configPath)) throw new FileNotFoundException("Config introuvable", configPath);

            var programData = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData);
            var secretDir = Path.Combine(programData, "Vigitemp", "shared-secrets");
            Directory.CreateDirectory(secretDir);
            var secretFile = Path.Combine(secretDir, "alarm-dispatch-secret.txt");
            File.WriteAllText(secretFile, dispatchSecret);

            var licenseDir = Path.Combine(programData, "Vigitemp", "licenses");
            var publicKeyDir = Path.Combine(programData, "Vigitemp", "license_keys");
            Directory.CreateDirectory(licenseDir);
            Directory.CreateDirectory(publicKeyDir);
            var licenseDestPath = Path.Combine(licenseDir, Path.GetFileName(licensePath));
            var publicKeyDestPath = Path.Combine(publicKeyDir, "public_key.pem");
            File.Copy(licensePath, licenseDestPath, true);
            File.Copy(publicKeyPath, publicKeyDestPath, true);

            InstallerHelpers.SetAppSetting(configPath, "Vigi.WebsiteBaseUrl", websiteBaseUrl);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.AlarmDispatchSecret", dispatchSecret);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.Provider", dbProvider);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.Host", dbHost);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.Port", dbPort);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.User", dbUser);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.Password", dbPassword);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.MainDatabase", dbMain);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.MeasureDatabase", dbMeasure);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.ConnectionTimeoutSeconds", dbConnectionTimeoutSeconds);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.CommandTimeoutSeconds", dbCommandTimeoutSeconds);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.SqlServer.Encrypt", sqlServerEncrypt);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.SqlServer.TrustServerCertificate", sqlServerTrustServerCertificate);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.License.HysteresisDelta", licenseHysteresisDelta);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.License.DebounceSeconds", licenseDebounceSeconds);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.License.ShowWhileSnoozed", licenseShowWhileSnoozed);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.License.SettingsCacheSeconds", settingsCacheSeconds);
            InstallerHelpers.SetAppSetting(configPath, "Vigitemp.Metrology.LogDetailed", metrologyLogDetailed);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.License.Path", licenseDestPath);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.License.PublicKeyPath", publicKeyDestPath);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.License.InstancePublicKey", instancePublicKey);
            AppendLog("[OK] Configuration mise à jour.");

            if (InstallerHelpers.ServiceExists(serviceName))
            {
                var confirm = MessageBox.Show($"Le service {serviceName} existe déjà. Le réinstaller ?", "Service existant", MessageBoxButtons.YesNo, MessageBoxIcon.Question);
                if (confirm != DialogResult.Yes) throw new InvalidOperationException("Installation annulée.");
                InstallerHelpers.RemoveService(serviceName, AppendLog);
            }

            var installedExe = Path.Combine(installDir, exeName);
            InstallerHelpers.InstallServerService(serviceName, installedExe, AppendLog);
            var version = FileVersionInfo.GetVersionInfo(installedExe).ProductVersion ?? string.Empty;
            InstallerHelpers.WriteRegistryInfo(installDir, version, licenseDestPath, publicKeyDestPath);

            SetStatus("Etat : installation terminee avec succes");
            AppendLog("[OK] Installation terminee.");
            MessageBox.Show("Installation terminee. Verifiez le service Windows si nécessaire.", "Installation terminee", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
        catch (Exception ex)
        {
            SetStatus("Etat : installation en erreur");
            AppendLog("[ERROR] " + ex.Message);
            MessageBox.Show(ex.Message, "Installation impossible", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
        finally
        {
            _running = false;
            _installButton.Enabled = true;
        }
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
