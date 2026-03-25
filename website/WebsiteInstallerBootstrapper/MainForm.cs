using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Text;
using System.Windows.Forms;

namespace VigitempWebInstaller;

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
        Text = "Installation du site VigiSensys";
        StartPosition = FormStartPosition.CenterScreen;
        Width = 900;
        Height = 640;
        MinimumSize = new Size(900, 640);
        Font = new Font("Segoe UI", 9F, FontStyle.Regular, GraphicsUnit.Point);

        _titleLabel = new Label { AutoSize = true, Font = new Font("Segoe UI Semibold", 18F, FontStyle.Bold, GraphicsUnit.Point), Text = "Installateur du site VigiSensys", Location = new Point(24, 20) };
        _descriptionLabel = new Label { AutoSize = false, Width = 820, Height = 52, Location = new Point(24, 62), Text = "Installe le site Next.js standalone depuis le package offline et crée le service Windows." };
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
        var standaloneEntry = Path.Combine(startupDir, ".next", "standalone", "server.js");
        if (!File.Exists(standaloneEntry))
        {
            MessageBox.Show($"Build standalone introuvable : {standaloneEntry}", "Installation impossible", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }

        var installDir = InstallerHelpers.PromptText(this, "Installation web", "Dossier d'installation", Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), @"Vigitemp\website"));
        if (string.IsNullOrWhiteSpace(installDir)) return;
        var serviceName = InstallerHelpers.PromptText(this, "Installation web", "Nom du service Windows", "VigitempWeb"); if (string.IsNullOrWhiteSpace(serviceName)) return;
        var port = InstallerHelpers.PromptText(this, "Installation web", "Port HTTP", "3000"); if (string.IsNullOrWhiteSpace(port)) return;
        var websiteBaseUrl = InstallerHelpers.PromptText(this, "Installation web", "URL publique du site", $"http://127.0.0.1:{port}/"); if (string.IsNullOrWhiteSpace(websiteBaseUrl)) return;
        var appBaseUrl = InstallerHelpers.PromptText(this, "Installation web", "URL applicative publique", websiteBaseUrl); if (string.IsNullOrWhiteSpace(appBaseUrl)) return;
        var dbProvider = InstallerHelpers.PromptText(this, "Installation web", "Type de BDD (mysql/mssql)", "mysql") ?? "mysql";
        if (!string.Equals(dbProvider, "mssql", StringComparison.OrdinalIgnoreCase)) dbProvider = "mysql";
        var dbPortDefault = dbProvider == "mssql" ? "1433" : "3306";
        var dbUserDefault = dbProvider == "mssql" ? "sa" : "root";
        var dbHost = InstallerHelpers.PromptText(this, "Installation web", "Hôte BDD", "127.0.0.1"); if (dbHost == null) return;
        var dbPort = InstallerHelpers.PromptText(this, "Installation web", "Port BDD", dbPortDefault); if (dbPort == null) return;
        var dbUser = InstallerHelpers.PromptText(this, "Installation web", "Utilisateur BDD", dbUserDefault); if (dbUser == null) return;
        var dbPassword = InstallerHelpers.PromptText(this, "Installation web", "Mot de passe BDD", "", password: true); if (dbPassword == null) return;
        var dbMain = InstallerHelpers.PromptText(this, "Installation web", "Nom BDD principale", "vigi_main"); if (dbMain == null) return;
        var dbMeasure = InstallerHelpers.PromptText(this, "Installation web", "Nom BDD mesures", "vigi_mesures"); if (dbMeasure == null) return;
        var dbChat = InstallerHelpers.PromptText(this, "Installation web", "Nom BDD chat", "vigi_chat"); if (dbChat == null) return;
        var cacheTtl = InstallerHelpers.PromptText(this, "Installation web", "Cache TTL (secondes)", "30"); if (cacheTtl == null) return;

        var programData = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData);
        var logsDir = InstallerHelpers.PromptText(this, "Installation web", "Dossier des logs", Path.Combine(programData, @"Vigitemp\web-logs")); if (logsDir == null) return;
        var licensePath = InstallerHelpers.PromptFile(this, "Choisir la licence site (.vtlic)", "Licence (*.vtlic)|*.vtlic|Tous les fichiers (*.*)|*.*", Path.Combine(programData, @"Vigitemp\licenses\license.vtlic")); if (string.IsNullOrWhiteSpace(licensePath)) return;
        var publicKeyPath = InstallerHelpers.PromptFile(this, "Choisir la clé publique licence (.pem)", "PEM (*.pem)|*.pem|Tous les fichiers (*.*)|*.*", Path.Combine(programData, @"Vigitemp\license_keys\public_key.pem")); if (string.IsNullOrWhiteSpace(publicKeyPath)) return;
        var agentPrivateKeyPath = InstallerHelpers.PromptFile(this, "Choisir la clé privée agent (.pem)", "PEM (*.pem)|*.pem|Tous les fichiers (*.*)|*.*", Path.Combine(programData, @"Vigitemp\license_keys\agent_secret_private.pem")); if (string.IsNullOrWhiteSpace(agentPrivateKeyPath)) return;
        var agentPort = InstallerHelpers.PromptText(this, "Installation web", "Port agent local", "8000"); if (agentPort == null) return;
        var agentTimeoutMs = InstallerHelpers.PromptText(this, "Installation web", "Timeout agent local (ms)", "1500"); if (agentTimeoutMs == null) return;
        var agentActiveWindowMinutes = InstallerHelpers.PromptText(this, "Installation web", "Fen?tre active agent (minutes)", "15"); if (agentActiveWindowMinutes == null) return;
        var hotlineServerHost = InstallerHelpers.PromptText(this, "Installation web", "H?te serveur hotline", "127.0.0.1"); if (hotlineServerHost == null) return;
        var hotlineServerPort = InstallerHelpers.PromptText(this, "Installation web", "Port serveur hotline", "5310"); if (hotlineServerPort == null) return;
        var hotlineServerTimeoutMs = InstallerHelpers.PromptText(this, "Installation web", "Timeout hotline (ms)", "10000"); if (hotlineServerTimeoutMs == null) return;
        var hotlineAccessTokenTtl = InstallerHelpers.PromptText(this, "Installation web", "TTL access hotline (minutes)", "15"); if (hotlineAccessTokenTtl == null) return;
        var hotlineRefreshTokenTtl = InstallerHelpers.PromptText(this, "Installation web", "TTL refresh hotline (minutes)", "120"); if (hotlineRefreshTokenTtl == null) return;
        var allowedDevOrigins = InstallerHelpers.PromptText(this, "Installation web", "Origins dev autoris?es (CSV, optionnel)", ""); if (allowedDevOrigins == null) return;
        var cspConnectSrc = InstallerHelpers.PromptText(this, "Installation web", "CSP connect-src suppl?mentaires (CSV, optionnel)", "http://127.0.0.1:8000,http://localhost:8000"); if (cspConnectSrc == null) return;
        var dispatchSecret = InstallerHelpers.PromptText(this, "Installation web", "Secret dispatch alarmes (laisser vide pour reprendre/g?n?rer)", "") ?? string.Empty;

        var nodePath = InstallerHelpers.FindNodeOnPath();
        if (string.IsNullOrWhiteSpace(nodePath))
        {
            MessageBox.Show("Node.js est introuvable dans le PATH. Installez d'abord les prérequis.", "Installation impossible", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }

        _running = true;
        _installButton.Enabled = false;
        _logTextBox.Clear();
        SetStatus("Etat : installation en cours...");
        AppendLog($"[INFO] Source package: {startupDir}");

        try
        {
            Directory.CreateDirectory(installDir);
            InstallerHelpers.CopyDirectory(startupDir, installDir);
            Directory.CreateDirectory(logsDir);
            AppendLog("[OK] Fichiers copiés.");

            var winswSource = Path.Combine(installDir, "winsw.exe");
            if (!File.Exists(winswSource)) throw new FileNotFoundException("winsw.exe introuvable dans le package", winswSource);
            var winswExe = Path.Combine(installDir, serviceName + ".exe");
            File.Copy(winswSource, winswExe, true);
            var winswXml = Path.Combine(installDir, serviceName + ".xml");

            var dispatchSecretFile = Path.Combine(programData, "Vigitemp", "shared-secrets", "alarm-dispatch-secret.txt");
            var dispatchSecretDir = Path.GetDirectoryName(dispatchSecretFile);
            if (!string.IsNullOrWhiteSpace(dispatchSecretDir)) Directory.CreateDirectory(dispatchSecretDir);
            if (string.IsNullOrWhiteSpace(dispatchSecret) && File.Exists(dispatchSecretFile))
            {
                dispatchSecret = File.ReadAllText(dispatchSecretFile).Trim();
            }
            if (string.IsNullOrWhiteSpace(dispatchSecret))
            {
                dispatchSecret = InstallerHelpers.GenerateSecret();
            }
            File.WriteAllText(dispatchSecretFile, dispatchSecret);

            var jwtSecret = InstallerHelpers.GenerateSecret();
            var hotlineJwtSecret = InstallerHelpers.GenerateSecret();
            var agentSharedSecret = InstallerHelpers.GenerateSecret();
            var envPath = Path.Combine(installDir, ".next", "standalone", ".env");
            var envDir = Path.GetDirectoryName(envPath);
            if (!string.IsNullOrWhiteSpace(envDir)) Directory.CreateDirectory(envDir);

            string databaseUrl;
            string databaseMesuresUrl;
            string databaseChatUrl;
            if (dbProvider == "mssql")
            {
                databaseUrl = $"sqlserver://{dbUser}:{dbPassword}@{dbHost}:{dbPort};database={dbMain};encrypt=false;trustServerCertificate=true";
                databaseMesuresUrl = $"sqlserver://{dbUser}:{dbPassword}@{dbHost}:{dbPort};database={dbMeasure};encrypt=false;trustServerCertificate=true";
                databaseChatUrl = $"sqlserver://{dbUser}:{dbPassword}@{dbHost}:{dbPort};database={dbChat};encrypt=false;trustServerCertificate=true";
            }
            else
            {
                const string mysqlQuery = "allowPublicKeyRetrieval=true";
                databaseUrl = $"mysql://{Uri.EscapeDataString(dbUser)}:{Uri.EscapeDataString(dbPassword)}@{dbHost}:{dbPort}/{dbMain}?{mysqlQuery}";
                databaseMesuresUrl = $"mysql://{Uri.EscapeDataString(dbUser)}:{Uri.EscapeDataString(dbPassword)}@{dbHost}:{dbPort}/{dbMeasure}?{mysqlQuery}";
                databaseChatUrl = $"mysql://{Uri.EscapeDataString(dbUser)}:{Uri.EscapeDataString(dbPassword)}@{dbHost}:{dbPort}/{dbChat}?{mysqlQuery}";
            }

            var envBuilder = new StringBuilder();
            envBuilder.AppendLine($"DATABASE_URL=\"{databaseUrl}\"");
            envBuilder.AppendLine($"DATABASE_MESURES_URL=\"{databaseMesuresUrl}\"");
            envBuilder.AppendLine($"DATABASE_CHAT_URL=\"{databaseChatUrl}\"");
            envBuilder.AppendLine($"DATABASE_PROVIDER=\"{dbProvider}\"");
            envBuilder.AppendLine($"NEXT_PUBLIC_API_BASE_URL=\"{websiteBaseUrl}\"");
            envBuilder.AppendLine($"NEXT_PUBLIC_APP_URL=\"{appBaseUrl}\"");
            envBuilder.AppendLine($"NEXT_PUBLIC_CACHE_TTL={cacheTtl}");
            envBuilder.AppendLine($"VIGITEMP_LICENSE_PATH=\"{licensePath}\"");
            envBuilder.AppendLine($"VIGITEMP_LICENSE_PUBLIC_KEY_PATH=\"{publicKeyPath}\"");
            envBuilder.AppendLine($"VIGITEMP_AGENT_SECRET_PRIVATE_KEY_PATH=\"{agentPrivateKeyPath}\"");
            envBuilder.AppendLine($"VIGITEMP_AGENT_PORT={agentPort}");
            envBuilder.AppendLine($"VIGITEMP_AGENT_TIMEOUT_MS={agentTimeoutMs}");
            envBuilder.AppendLine($"VIGITEMP_AGENT_ACTIVE_WINDOW_MINUTES={agentActiveWindowMinutes}");
            envBuilder.AppendLine($"VIGITEMP_AGENT_SECRET=\"{agentSharedSecret}\"");
            envBuilder.AppendLine($"VIGITEMP_ALARM_DISPATCH_SECRET=\"{dispatchSecret}\"");
            envBuilder.AppendLine($"VIGITEMP_SURVEILLANCE_DISPATCH_SECRET=\"{dispatchSecret}\"");
            envBuilder.AppendLine($"VIGITEMP_LOGS_DIR=\"{logsDir}\"");
            envBuilder.AppendLine("VIGITEMP_ALLOWED_DEV_ORIGINS=\"\"");
            envBuilder.AppendLine("VIGITEMP_CSP_CONNECT_SRC=\"http://127.0.0.1:8000,http://localhost:8000\"");
            envBuilder.AppendLine($"JWT_SECRET=\"{jwtSecret}\"");
            envBuilder.AppendLine("HOTLINE_SERVER_HOST=\"127.0.0.1\"");
            envBuilder.AppendLine($"HOTLINE_SERVER_PORT={hotlineServerPort}");
            envBuilder.AppendLine($"HOTLINE_SERVER_TIMEOUT_MS={hotlineServerTimeoutMs}");
            envBuilder.AppendLine($"HOTLINE_JWT_SECRET=\"{hotlineJwtSecret}\"");
            envBuilder.AppendLine($"HOTLINE_ACCESS_TOKEN_TTL_MINUTES={hotlineAccessTokenTtl}");
            envBuilder.AppendLine($"HOTLINE_REFRESH_TOKEN_TTL_MINUTES={hotlineRefreshTokenTtl}");
            envBuilder.AppendLine("NODE_ENV=production");
            File.WriteAllText(envPath, envBuilder.ToString());
            AppendLog("[OK] Fichier .env généré.");

            if (InstallerHelpers.ServiceExists(serviceName))
            {
                var confirm = MessageBox.Show($"Le service {serviceName} existe déjà. Le réinstaller ?", "Service existant", MessageBoxButtons.YesNo, MessageBoxIcon.Question);
                if (confirm != DialogResult.Yes) throw new InvalidOperationException("Installation annulée.");
                InstallerHelpers.RemoveService(serviceName, winswExe, AppendLog);
            }

            var xml = $@"<service>
  <id>{serviceName}</id>
  <name>{serviceName}</name>
  <description>VigiSensys Next.js website</description>
  <executable>{nodePath}</executable>
  <arguments>.next\standalone\server.js</arguments>
  <workingdirectory>{installDir}</workingdirectory>
  <log mode=""roll-by-size"">
    <sizeThreshold>10240</sizeThreshold>
    <keepFiles>8</keepFiles>
  </log>
  <resetfailure>1 day</resetfailure>
  <onfailure action=""restart"" delay=""60000"" />
  <env name=""NODE_ENV"" value=""production"" />
  <env name=""PORT"" value=""{port}"" />
  <env name=""HOSTNAME"" value=""0.0.0.0"" />
</service>";
            File.WriteAllText(winswXml, xml);
            InstallerHelpers.RunProcess(winswExe, "install", installDir, AppendLog);
            InstallerHelpers.RunProcess(winswExe, "start", installDir, AppendLog);

            var version = string.Empty;
            var packageJson = Path.Combine(installDir, "package.json");
            if (File.Exists(packageJson))
            {
                version = FileVersionInfo.GetVersionInfo(winswExe).ProductVersion ?? string.Empty;
            }
            InstallerHelpers.WriteRegistryInfo(installDir, version);

            SetStatus("Etat : installation terminee avec succes");
            AppendLog("[OK] Installation terminee.");
            MessageBox.Show("Installation du site terminee. Verifiez le service Windows si nécessaire.", "Installation terminee", MessageBoxButtons.OK, MessageBoxIcon.Information);
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
