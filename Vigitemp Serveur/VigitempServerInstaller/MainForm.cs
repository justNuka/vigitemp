using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Text;
using System.Windows.Forms;

namespace VigitempServerInstaller;

public sealed class MainForm : Form
{
    private const string InstallModeNormalLabel = "Installation normale";
    private const string InstallModeUpdateLabel = "Migration Vigitemp -> VigiSensys (sans seeds SQL)";

    private static readonly Color AppBackground = Color.FromArgb(245, 247, 251);
    private static readonly Color CardBackground = Color.White;
    private static readonly Color Accent = Color.FromArgb(14, 116, 144);
    private static readonly Color TextPrimary = Color.FromArgb(15, 23, 42);
    private static readonly Color TextMuted = Color.FromArgb(71, 85, 105);
    private static readonly Color Border = Color.FromArgb(203, 213, 225);

    private readonly Settings _s = Settings.Default();
    private readonly TabControl _tabs = new() { Dock = DockStyle.Fill };
    private readonly Label _step = new() { Left = 24, Top = 116, Width = 900, Height = 22, ForeColor = TextMuted };
    private readonly FlowLayoutPanel _progress = new() { Left = 24, Top = 142, Width = 920, Height = 36, Anchor = AnchorStyles.Left | AnchorStyles.Right | AnchorStyles.Top, WrapContents = false, BackColor = AppBackground };
    private readonly Button _back = new() { Text = "Precedent", Width = 120, Height = 38, Left = 24, Top = 666, Anchor = AnchorStyles.Left | AnchorStyles.Bottom };
    private readonly Button _next = new() { Text = "Suivant", Width = 120, Height = 38, Left = 154, Top = 666, Anchor = AnchorStyles.Left | AnchorStyles.Bottom };
    private readonly Button _install = new() { Text = "Installer", Width = 140, Height = 38, Left = 734, Top = 666, Anchor = AnchorStyles.Right | AnchorStyles.Bottom };
    private readonly Button _close = new() { Text = "Fermer", Width = 120, Height = 38, Left = 884, Top = 666, Anchor = AnchorStyles.Right | AnchorStyles.Bottom };
    private readonly TextBox _summary = new() { Multiline = true, ReadOnly = true, ScrollBars = ScrollBars.Vertical, Dock = DockStyle.Top, Height = 190, Font = new Font("Consolas", 9F), BackColor = Color.FromArgb(248, 250, 252), ForeColor = TextPrimary, BorderStyle = BorderStyle.FixedSingle };
    private readonly Label _status = new() { Text = "Etat : pret", Dock = DockStyle.Top, Height = 30, Padding = new Padding(0, 8, 0, 0), ForeColor = Accent, Font = new Font("Segoe UI Semibold", 9F, FontStyle.Bold) };
    private readonly TextBox _log = new() { Multiline = true, ReadOnly = true, ScrollBars = ScrollBars.Both, WordWrap = false, Dock = DockStyle.Fill, Font = new Font("Consolas", 9F), BackColor = Color.FromArgb(15, 23, 42), ForeColor = Color.FromArgb(226, 232, 240), BorderStyle = BorderStyle.FixedSingle };
    private readonly Label[] _progressBadges = new Label[5];
    private bool _running;

    private readonly TextBox installDir;
    private readonly ComboBox installMode;
    private readonly TextBox serviceName;
    private readonly TextBox websiteBaseUrl;
    private readonly ComboBox dbProvider;
    private readonly TextBox dbHost;
    private readonly TextBox dbPort;
    private readonly TextBox dbUser;
    private readonly TextBox dbPassword;
    private readonly TextBox dbMain;
    private readonly TextBox dbMeasure;
    private readonly TextBox dbConnectionTimeoutSeconds;
    private readonly TextBox dbCommandTimeoutSeconds;
    private readonly ComboBox sqlServerEncrypt;
    private readonly ComboBox sqlServerTrustServerCertificate;
    private readonly TextBox licensePath;
    private readonly TextBox publicKeyPath;
    private readonly TextBox instancePublicKey;
    private readonly TextBox dispatchSecret;
    private readonly Button detectFilesButton;
    private readonly TextBox licenseHysteresisDelta;
    private readonly TextBox licenseDebounceSeconds;
    private readonly ComboBox licenseShowWhileSnoozed;
    private readonly TextBox settingsCacheSeconds;
    private readonly ComboBox metrologyLogDetailed;

    public MainForm()
    {
        Text = "Installation du serveur VigiSensys";
        StartPosition = FormStartPosition.CenterScreen;
        Width = 980;
        Height = 760;
        MinimumSize = new Size(980, 760);
        Font = new Font("Segoe UI", 9F);
        BackColor = AppBackground;

        Controls.AddRange(new Control[]
        {
            new Panel { Left = 0, Top = 0, Width = 980, Height = 100, Anchor = AnchorStyles.Left | AnchorStyles.Right | AnchorStyles.Top, BackColor = TextPrimary },
            new Label { AutoSize = true, Font = new Font("Segoe UI Semibold", 18F, FontStyle.Bold), ForeColor = Color.White, BackColor = TextPrimary, Text = "Installateur du serveur VigiSensys", Location = new Point(24, 20) },
            new Label { Width = 900, Height = 44, Location = new Point(24, 56), ForeColor = Color.FromArgb(226, 232, 240), BackColor = TextPrimary, Text = "Renseignez les parametres serveur, relisez le resume, puis lancez l'installation. Vous pouvez revenir en arriere avant l'execution." },
            _step, _progress, _tabs, _back, _next, _install, _close
        });

        _tabs.Left = 24;
        _tabs.Top = 188;
        _tabs.Width = 920;
        _tabs.Height = 460;
        _tabs.Anchor = AnchorStyles.Top | AnchorStyles.Left | AnchorStyles.Right | AnchorStyles.Bottom;
        _tabs.Appearance = TabAppearance.FlatButtons;
        _tabs.ItemSize = new Size(0, 1);
        _tabs.SizeMode = TabSizeMode.Fixed;
        _tabs.Padding = new Point(0, 0);
        _tabs.DrawMode = TabDrawMode.OwnerDrawFixed;
        _tabs.DrawItem += (_, _) => { };

        TextBox T(string v = "", bool pwd = false, string placeholder = "") => new() { Dock = DockStyle.Fill, Text = v ?? string.Empty, UseSystemPasswordChar = pwd, BorderStyle = BorderStyle.FixedSingle, BackColor = Color.White, ForeColor = TextPrimary, PlaceholderText = placeholder ?? string.Empty };
        ComboBox BoolBox(string value)
        {
            var combo = new ComboBox { Dock = DockStyle.Fill, DropDownStyle = ComboBoxStyle.DropDownList, FlatStyle = FlatStyle.Flat, BackColor = Color.White, ForeColor = TextPrimary };
            combo.Items.AddRange(new object[] { "true", "false" });
            combo.SelectedItem = string.Equals(value, "true", StringComparison.OrdinalIgnoreCase) ? "true" : "false";
            return combo;
        }
        Button BrowseFolder(TextBox tb)
        {
            var b = SecondaryButton("Parcourir", 110);
            b.Click += (_, _) =>
            {
                using var d = new FolderBrowserDialog();
                if (Directory.Exists(tb.Text)) d.InitialDirectory = tb.Text;
                if (d.ShowDialog(this) == DialogResult.OK) tb.Text = d.SelectedPath;
            };
            return b;
        }
        Button BrowseFile(TextBox tb, string filter)
        {
            var b = SecondaryButton("Parcourir", 110);
            b.Click += (_, _) =>
            {
                using var d = new OpenFileDialog { Filter = filter };
                var dir = Path.GetDirectoryName(tb.Text);
                if (!string.IsNullOrWhiteSpace(dir) && Directory.Exists(dir)) d.InitialDirectory = dir;
                d.FileName = Path.GetFileName(tb.Text);
                if (d.ShowDialog(this) == DialogResult.OK) tb.Text = d.FileName;
            };
            return b;
        }
        Panel Field(string label, Control input, Control action = null)
        {
            var p = new Panel { Dock = DockStyle.Top, Height = 84, Padding = new Padding(0, 0, 0, 12), BackColor = CardBackground };
            var l = new Label { Text = label, Dock = DockStyle.Top, Height = 22, ForeColor = TextPrimary, Font = new Font("Segoe UI Semibold", 9F, FontStyle.Bold) };
            var t = new TableLayoutPanel { Dock = DockStyle.Top, Height = 38, ColumnCount = action == null ? 1 : 2, RowCount = 1, BackColor = CardBackground };
            t.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));
            if (action != null) t.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 118F));
            if (input is ComboBox combo)
            {
                combo.FlatStyle = FlatStyle.Flat;
                combo.BackColor = Color.White;
                combo.ForeColor = TextPrimary;
            }
            t.Controls.Add(input, 0, 0);
            if (action != null) t.Controls.Add(action, 1, 0);
            p.Controls.Add(t);
            p.Controls.Add(l);
            return p;
        }
        TableLayoutPanel StepPanel()
        {
            var t = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, AutoScroll = true, BackColor = CardBackground };
            t.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));
            return t;
        }
        TabPage Page(string title, Control content)
        {
            var p = new TabPage(title) { BackColor = CardBackground };
            content.Dock = DockStyle.Fill;
            content.Padding = new Padding(20);
            p.Controls.Add(content);
            return p;
        }

        var localIpv4 = InstallerHelpers.GetPreferredLocalIpv4();
        var genericIpPlaceholder = string.IsNullOrWhiteSpace(localIpv4) ? "<ip-machine>" : localIpv4;
        var websiteUrlPlaceholder = string.IsNullOrWhiteSpace(localIpv4) ? "http://<ip-machine>:3000" : $"http://{localIpv4}:3000";

        installDir = T(_s.InstallDir, placeholder: @"C:\ProgramData\VigiSensys\server");
        installMode = new ComboBox { Dock = DockStyle.Fill, DropDownStyle = ComboBoxStyle.DropDownList, FlatStyle = FlatStyle.Flat, BackColor = Color.White, ForeColor = TextPrimary };
        installMode.Items.AddRange(new object[] { InstallModeNormalLabel, InstallModeUpdateLabel });
        installMode.SelectedItem = string.Equals(_s.InstallMode, "update", StringComparison.OrdinalIgnoreCase) ? InstallModeUpdateLabel : InstallModeNormalLabel;
        serviceName = T(_s.ServiceName, placeholder: "VigiSensysServeur");
        websiteBaseUrl = T(_s.WebsiteBaseUrl, placeholder: websiteUrlPlaceholder);
        dbProvider = new ComboBox { Dock = DockStyle.Fill, DropDownStyle = ComboBoxStyle.DropDownList };
        dbProvider.Items.AddRange(new object[] { "mysql", "mssql" });
        dbProvider.SelectedItem = _s.DbProvider;
        dbHost = T(_s.DbHost, placeholder: genericIpPlaceholder);
        dbPort = T(_s.DbPort, placeholder: "3306");
        dbUser = T(_s.DbUser, placeholder: "Compte SQL dédié (pas root)");
        dbPassword = T(_s.DbPassword, true, placeholder: "Mot de passe BDD");
        dbMain = T(_s.DbMain, placeholder: "vigi_main");
        dbMeasure = T(_s.DbMeasure, placeholder: "vigi_mesures");
        dbConnectionTimeoutSeconds = T(_s.DbConnectionTimeoutSeconds, placeholder: "5");
        dbCommandTimeoutSeconds = T(_s.DbCommandTimeoutSeconds, placeholder: "30");
        sqlServerEncrypt = BoolBox(_s.SqlServerEncrypt);
        sqlServerTrustServerCertificate = BoolBox(_s.SqlServerTrustServerCertificate);
        licensePath = T(_s.LicensePath, placeholder: "Chemin du fichier .vtlic");
        publicKeyPath = T(_s.PublicKeyPath, placeholder: "Chemin de public_key.pem");
        instancePublicKey = T(_s.InstancePublicKey, placeholder: "Optionnel");
        dispatchSecret = T(_s.DispatchSecret, placeholder: "Laisser vide pour reprise automatique");
        detectFilesButton = SecondaryButton("Détecter les fichiers", 170);
        detectFilesButton.Click += (_, _) => DetectSecurityFiles();
        licenseHysteresisDelta = T(_s.LicenseHysteresisDelta, placeholder: "0");
        licenseDebounceSeconds = T(_s.LicenseDebounceSeconds, placeholder: "0");
        licenseShowWhileSnoozed = BoolBox(_s.LicenseShowWhileSnoozed);
        settingsCacheSeconds = T(_s.SettingsCacheSeconds, placeholder: "60");
        metrologyLogDetailed = BoolBox(_s.MetrologyLogDetailed);

        dbProvider.SelectedIndexChanged += (_, _) =>
        {
            var mssql = string.Equals(dbProvider.SelectedItem?.ToString(), "mssql", StringComparison.OrdinalIgnoreCase);
            if (string.IsNullOrWhiteSpace(dbPort.Text) || dbPort.Text is "3306" or "1433") dbPort.Text = mssql ? "1433" : "3306";
            if (string.IsNullOrWhiteSpace(dbUser.Text) || dbUser.Text is "root" or "sa") dbUser.Text = mssql ? "sa" : string.Empty;
        };

        var general = StepPanel();
        foreach (var c in new Control[]
                 {
                     Field("Dossier d'installation", installDir, BrowseFolder(installDir)),
                     Field("Mode d'installation", installMode),
                     Field("Nom du service Windows", serviceName),
                     Field("URL du site web", websiteBaseUrl)
                 }) general.Controls.Add(c);

        var database = StepPanel();
        foreach (var c in new Control[]
                 {
                     Field("Type de BDD", dbProvider),
                     Field("Hete BDD", dbHost),
                     Field("Port BDD", dbPort),
                     Field("Utilisateur BDD", dbUser),
                     Field("Mot de passe BDD", dbPassword),
                     Field("BDD principale", dbMain),
                     Field("BDD mesures", dbMeasure),
                     Field("Timeout connexion BDD (secondes)", dbConnectionTimeoutSeconds),
                     Field("Timeout requete BDD (secondes)", dbCommandTimeoutSeconds),
                     Field("SQL Server encrypt", sqlServerEncrypt),
                     Field("SQL Server trustServerCertificate", sqlServerTrustServerCertificate)
                 }) database.Controls.Add(c);

        var security = StepPanel();
        foreach (var c in new Control[]
                 {
                     Field("Détection automatique", detectFilesButton),
                     Field("Fichier licence (.vtlic)", licensePath, BrowseFile(licensePath, "Licence (*.vtlic)|*.vtlic|Tous les fichiers (*.*)|*.*")),
                     Field("Cle publique licence (.pem)", publicKeyPath, BrowseFile(publicKeyPath, "PEM (*.pem)|*.pem|Tous les fichiers (*.*)|*.*")),
                     Field("Cle publique instance (optionnel)", instancePublicKey),
                     Field("Secret dispatch alarmes", dispatchSecret)
                 }) security.Controls.Add(c);

        var advanced = StepPanel();
        foreach (var c in new Control[]
                 {
                     Field("Delta hysteresis alarmes", licenseHysteresisDelta),
                     Field("Debounce alarmes (secondes)", licenseDebounceSeconds),
                     Field("Afficher alarmes pendant snooze", licenseShowWhileSnoozed),
                     Field("Cache reglages alarmes (secondes)", settingsCacheSeconds),
                     Field("Logs metrologie detailles", metrologyLogDetailed)
                 }) advanced.Controls.Add(c);

        var installPanel = new Panel { Padding = new Padding(20), BackColor = CardBackground };
        installPanel.Controls.Add(_log);
        installPanel.Controls.Add(_status);
        installPanel.Controls.Add(_summary);
        installPanel.Controls.Add(new Label { Text = "Resume avant installation", Dock = DockStyle.Top, Height = 24, ForeColor = TextPrimary, Font = new Font("Segoe UI Semibold", 10F, FontStyle.Bold) });

        _tabs.TabPages.AddRange(new[]
        {
            Page("General", general),
            Page("Base de donnees", database),
            Page("Licence et securite", security),
            Page("Parametres avances", advanced),
            Page("Resume et installation", installPanel)
        });

        for (var i = 0; i < _progressBadges.Length; i++)
        {
            _progressBadges[i] = StepBadge();
            _progress.Controls.Add(_progressBadges[i]);
        }

        StylePrimaryButton(_next);
        StylePrimaryButton(_install);
        StyleSecondaryButton(_back);
        StyleSecondaryButton(_close);

        _back.Click += (_, _) => Go(_tabs.SelectedIndex - 1);
        _next.Click += (_, _) => Go(_tabs.SelectedIndex + 1);
        _install.Click += async (_, _) => await RunInstallAsync();
        _close.Click += (_, _) => Close();
        DetectSecurityFiles();
        Go(0);
    }

    private Label StepBadge() => new() { AutoSize = false, Width = 176, Height = 32, Margin = new Padding(0, 0, 8, 0), TextAlign = ContentAlignment.MiddleCenter, Font = new Font("Segoe UI Semibold", 9F, FontStyle.Bold), BackColor = Color.White, ForeColor = TextMuted, BorderStyle = BorderStyle.FixedSingle };
    private Button SecondaryButton(string text, int width) { var b = new Button { Text = text, Width = width, Height = 34 }; StyleSecondaryButton(b); return b; }
    private void StylePrimaryButton(Button button) { button.FlatStyle = FlatStyle.Flat; button.FlatAppearance.BorderSize = 0; button.BackColor = Accent; button.ForeColor = Color.White; button.Font = new Font("Segoe UI Semibold", 9F, FontStyle.Bold); }
    private void StyleSecondaryButton(Button button) { button.FlatStyle = FlatStyle.Flat; button.FlatAppearance.BorderColor = Border; button.FlatAppearance.BorderSize = 1; button.BackColor = Color.White; button.ForeColor = TextPrimary; button.Font = new Font("Segoe UI Semibold", 9F, FontStyle.Bold); }

    private void DetectSecurityFiles()
    {
        var startupDir = AppContext.BaseDirectory;
        if (string.IsNullOrWhiteSpace(licensePath.Text) || !File.Exists(licensePath.Text))
        {
            var detected = InstallerHelpers.FindFirstMatchingFile(startupDir, "license.vtlic");
            if (string.IsNullOrWhiteSpace(detected))
            {
                detected = FindFirstByPattern(startupDir, "*.vtlic");
            }
            if (!string.IsNullOrWhiteSpace(detected)) licensePath.Text = detected;
        }

        if (string.IsNullOrWhiteSpace(publicKeyPath.Text) || !File.Exists(publicKeyPath.Text))
        {
            var detected = InstallerHelpers.FindFirstMatchingFile(startupDir, "public_key.pem");
            if (!string.IsNullOrWhiteSpace(detected)) publicKeyPath.Text = detected;
        }

        var sharedDir = InstallerHelpers.GetSharedArtifactsDirectory(startupDir);
        AppendLog($"[INFO] Secrets partag?s: {sharedDir}");
    }

    private static string FindFirstByPattern(string startupDir, string pattern)
    {
        var current = new DirectoryInfo(Path.GetFullPath(startupDir));
        while (current != null)
        {
            var matches = Directory.GetFiles(current.FullName, pattern, SearchOption.TopDirectoryOnly);
            if (matches.Length > 0) return matches[0];
            current = current.Parent;
        }

        return null;
    }

    private void Persist()
    {
        _s.InstallDir = installDir.Text.Trim();
        _s.InstallMode = string.Equals(installMode.SelectedItem?.ToString(), InstallModeUpdateLabel, StringComparison.OrdinalIgnoreCase) ? "update" : "normal";
        _s.ServiceName = serviceName.Text.Trim();
        _s.WebsiteBaseUrl = websiteBaseUrl.Text.Trim();
        _s.DbProvider = string.Equals(dbProvider.SelectedItem?.ToString(), "mssql", StringComparison.OrdinalIgnoreCase) ? "mssql" : "mysql";
        _s.DbHost = dbHost.Text.Trim();
        _s.DbPort = dbPort.Text.Trim();
        _s.DbUser = dbUser.Text.Trim();
        _s.DbPassword = dbPassword.Text;
        _s.DbMain = dbMain.Text.Trim();
        _s.DbMeasure = dbMeasure.Text.Trim();
        _s.DbConnectionTimeoutSeconds = dbConnectionTimeoutSeconds.Text.Trim();
        _s.DbCommandTimeoutSeconds = dbCommandTimeoutSeconds.Text.Trim();
        _s.SqlServerEncrypt = sqlServerEncrypt.SelectedItem?.ToString() ?? "false";
        _s.SqlServerTrustServerCertificate = sqlServerTrustServerCertificate.SelectedItem?.ToString() ?? "true";
        _s.LicensePath = licensePath.Text.Trim();
        _s.PublicKeyPath = publicKeyPath.Text.Trim();
        _s.InstancePublicKey = instancePublicKey.Text.Trim();
        _s.DispatchSecret = dispatchSecret.Text.Trim();
        _s.LicenseHysteresisDelta = licenseHysteresisDelta.Text.Trim();
        _s.LicenseDebounceSeconds = licenseDebounceSeconds.Text.Trim();
        _s.LicenseShowWhileSnoozed = licenseShowWhileSnoozed.SelectedItem?.ToString() ?? "true";
        _s.SettingsCacheSeconds = settingsCacheSeconds.Text.Trim();
        _s.MetrologyLogDetailed = metrologyLogDetailed.SelectedItem?.ToString() ?? "false";
    }

    private bool Valid(int idx)
    {
        Persist();
        string m = null;
        if (idx == 0)
        {
            if (string.IsNullOrWhiteSpace(_s.InstallDir)) m = "Le dossier d'installation est obligatoire.";
            else if (string.IsNullOrWhiteSpace(_s.ServiceName)) m = "Le nom du service Windows est obligatoire.";
            else if (string.IsNullOrWhiteSpace(_s.WebsiteBaseUrl)) m = "L'URL du site web est obligatoire.";
        }
        else if (idx == 1)
        {
            if (string.IsNullOrWhiteSpace(_s.DbHost)) m = "L'hete BDD est obligatoire.";
            else if (string.IsNullOrWhiteSpace(_s.DbPort)) m = "Le port BDD est obligatoire.";
            else if (string.IsNullOrWhiteSpace(_s.DbUser)) m = "L'utilisateur BDD est obligatoire.";
            else if (string.Equals(_s.DbProvider, "mysql", StringComparison.OrdinalIgnoreCase) && string.Equals(_s.DbUser, "root", StringComparison.OrdinalIgnoreCase)) m = "Le compte MySQL root n'est pas supporté. Créez un compte SQL dédié.";
            else if (string.IsNullOrWhiteSpace(_s.DbMain) || string.IsNullOrWhiteSpace(_s.DbMeasure)) m = "Les noms de bases sont obligatoires.";
            else if (string.IsNullOrWhiteSpace(_s.DbConnectionTimeoutSeconds) || string.IsNullOrWhiteSpace(_s.DbCommandTimeoutSeconds)) m = "Les timeouts BDD sont obligatoires.";
        }
        else if (idx == 2)
        {
            if (string.IsNullOrWhiteSpace(_s.LicensePath) || !File.Exists(_s.LicensePath)) m = "Le fichier licence est obligatoire.";
            else if (string.IsNullOrWhiteSpace(_s.PublicKeyPath) || !File.Exists(_s.PublicKeyPath)) m = "La cle publique licence est obligatoire.";
        }
        else if (idx == 3)
        {
            if (string.IsNullOrWhiteSpace(_s.LicenseHysteresisDelta)) m = "Le delta d'hysteresis est obligatoire.";
            else if (string.IsNullOrWhiteSpace(_s.LicenseDebounceSeconds)) m = "Le debounce alarmes est obligatoire.";
            else if (string.IsNullOrWhiteSpace(_s.SettingsCacheSeconds)) m = "Le cache reglages alarmes est obligatoire.";
        }

        if (m != null)
        {
            MessageBox.Show(m, "Configuration incomplete", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            return false;
        }

        return true;
    }

    private void Go(int idx)
    {
        if (_running || idx < 0 || idx >= _tabs.TabPages.Count) return;
        if (idx > _tabs.SelectedIndex && !Valid(_tabs.SelectedIndex)) return;
        _tabs.SelectedIndex = idx;
        Persist();
        if (idx == 4) RefreshSummary();
        var titles = new[] { "General", "Base de donnees", "Licence et securite", "Parametres avances", "Resume et installation" };
        _step.Text = $"etape {idx + 1} / {titles.Length} - {titles[idx]}";
        _back.Enabled = idx > 0;
        _next.Enabled = idx < 4;
        _install.Enabled = idx == 4;
        for (var i = 0; i < _progressBadges.Length; i++)
        {
            _progressBadges[i].Text = $"{i + 1}. {titles[i]}";
            _progressBadges[i].BackColor = i == idx ? Accent : i < idx ? Color.FromArgb(220, 252, 231) : Color.White;
            _progressBadges[i].ForeColor = i == idx ? Color.White : i < idx ? Color.FromArgb(22, 101, 52) : TextMuted;
        }
    }

    private void RefreshSummary()
    {
        Persist();
        var sb = new StringBuilder();
        sb.AppendLine("General");
        sb.AppendLine($"- Dossier d'installation : {_s.InstallDir}");
        sb.AppendLine($"- Mode : {(_s.InstallMode == "update" ? InstallModeUpdateLabel : InstallModeNormalLabel)}");
        sb.AppendLine($"- Service Windows : {_s.ServiceName}");
        sb.AppendLine($"- URL du site web : {_s.WebsiteBaseUrl}");
        sb.AppendLine();
        sb.AppendLine("Base de donnees");
        sb.AppendLine($"- Provider : {_s.DbProvider}");
        sb.AppendLine($"- Hete : {_s.DbHost}:{_s.DbPort}");
        sb.AppendLine($"- Utilisateur : {_s.DbUser}");
        sb.AppendLine($"- BDD principale : {_s.DbMain}");
        sb.AppendLine($"- BDD mesures : {_s.DbMeasure}");
        sb.AppendLine($"- Timeouts : connexion {_s.DbConnectionTimeoutSeconds}s / requete {_s.DbCommandTimeoutSeconds}s");
        sb.AppendLine();
        sb.AppendLine("Licence et securite");
        sb.AppendLine($"- Licence : {_s.LicensePath}");
        sb.AppendLine($"- Cle publique : {_s.PublicKeyPath}");
        sb.AppendLine($"- Cle publique instance : {(string.IsNullOrWhiteSpace(_s.InstancePublicKey) ? "vide" : "renseignee")}");
        sb.AppendLine($"- Secret dispatch : {(string.IsNullOrWhiteSpace(_s.DispatchSecret) ? "genere / repris automatiquement" : "fourni manuellement")}");
        sb.AppendLine();
        sb.AppendLine("Parametres avances");
        sb.AppendLine($"- Hysteresis : {_s.LicenseHysteresisDelta}");
        sb.AppendLine($"- Debounce : {_s.LicenseDebounceSeconds} s");
        sb.AppendLine($"- Show while snoozed : {_s.LicenseShowWhileSnoozed}");
        sb.AppendLine($"- Cache reglages alarmes : {_s.SettingsCacheSeconds} s");
        sb.AppendLine($"- Logs metrologie detailles : {_s.MetrologyLogDetailed}");
        _summary.Text = sb.ToString();
    }

    private async System.Threading.Tasks.Task RunInstallAsync()
    {
        if (_running || !Valid(4)) return;

        var startupDir = AppContext.BaseDirectory;
        var sourceExe = Path.Combine(startupDir, "VigiSensysServeur.exe");
        if (!File.Exists(sourceExe))
        {
            MessageBox.Show($"Executable serveur introuvable : {sourceExe}", "Installation impossible", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }

        Persist();
        var dispatchSecretValue = InstallerHelpers.GetOrCreateSharedSecret(startupDir, "alarm-dispatch-secret.txt", _s.DispatchSecret);

        _running = true;
        _back.Enabled = _next.Enabled = _install.Enabled = _close.Enabled = false;
        _log.Clear();
        SetStatus("Etat : installation en cours...");
        AppendLog($"[INFO] Source package: {startupDir}");

        try
        {
            Directory.CreateDirectory(_s.InstallDir);
            InstallerHelpers.CopyDirectory(startupDir, _s.InstallDir);
            AppendLog("[OK] Fichiers copies.");

            const string exeName = "VigiSensysServeur.exe";
            var configPath = Path.Combine(_s.InstallDir, exeName + ".config");
            if (!File.Exists(configPath)) throw new FileNotFoundException("Config introuvable", configPath);

            var programData = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData);
            var sharedSecretsDir = InstallerHelpers.GetSharedArtifactsDirectory(startupDir);
            AppendLog($"[INFO] Secrets partag?s utilis?s: {sharedSecretsDir}");
            if (_s.InstallMode == "update")
            {
                AppendLog("[INFO] Mode migration Vigitemp -> VigiSensys: aucune seed SQL n'est appliquee, les bases existantes sont conservees.");
            }

            var licenseDir = Path.Combine(programData, "VigiSensys", "licenses");
            var publicKeyDir = Path.Combine(programData, "VigiSensys", "license_keys");
            Directory.CreateDirectory(licenseDir);
            Directory.CreateDirectory(publicKeyDir);
            var licenseDestPath = Path.Combine(licenseDir, Path.GetFileName(_s.LicensePath));
            var publicKeyDestPath = Path.Combine(publicKeyDir, "public_key.pem");
            if (!File.Exists(licenseDestPath))
            {
                File.Copy(_s.LicensePath, licenseDestPath, false);
                AppendLog("[OK] Licence copiee.");
            }
            else
            {
                AppendLog("[OK] Licence deje presente, conservation du fichier existant.");
            }

            if (!File.Exists(publicKeyDestPath))
            {
                File.Copy(_s.PublicKeyPath, publicKeyDestPath, false);
                AppendLog("[OK] Cle publique copiee.");
            }
            else
            {
                AppendLog("[OK] Cle publique deje presente, conservation du fichier existant.");
            }

            InstallerHelpers.SetAppSetting(configPath, "Vigi.WebsiteBaseUrl", _s.WebsiteBaseUrl);
            InstallerHelpers.SetAppSetting(configPath, "VigiSensys.WebsiteBaseUrl", _s.WebsiteBaseUrl);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.AlarmDispatchSecret", dispatchSecretValue);
            InstallerHelpers.SetAppSetting(configPath, "VigiSensys.AlarmDispatchSecret", dispatchSecretValue);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.Provider", _s.DbProvider);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.Host", _s.DbHost);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.Port", _s.DbPort);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.User", _s.DbUser);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.Password", _s.DbPassword);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.MainDatabase", _s.DbMain);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.MeasureDatabase", _s.DbMeasure);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.ConnectionTimeoutSeconds", _s.DbConnectionTimeoutSeconds);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.CommandTimeoutSeconds", _s.DbCommandTimeoutSeconds);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.SqlServer.Encrypt", _s.SqlServerEncrypt);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.Db.SqlServer.TrustServerCertificate", _s.SqlServerTrustServerCertificate);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.License.HysteresisDelta", _s.LicenseHysteresisDelta);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.License.DebounceSeconds", _s.LicenseDebounceSeconds);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.License.ShowWhileSnoozed", _s.LicenseShowWhileSnoozed);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.License.SettingsCacheSeconds", _s.SettingsCacheSeconds);
            InstallerHelpers.SetAppSetting(configPath, "Vigitemp.Metrology.LogDetailed", _s.MetrologyLogDetailed);
            InstallerHelpers.SetAppSetting(configPath, "VigiSensys.License.Path", licenseDestPath);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.License.Path", licenseDestPath);
            InstallerHelpers.SetAppSetting(configPath, "VigiSensys.License.PublicKeyPath", publicKeyDestPath);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.License.PublicKeyPath", publicKeyDestPath);
            InstallerHelpers.SetAppSetting(configPath, "Vigi.License.InstancePublicKey", _s.InstancePublicKey);
            AppendLog("[OK] Configuration mise e jour.");

            if (InstallerHelpers.ServiceExists(_s.ServiceName))
            {
                var confirm = MessageBox.Show($"Le service {_s.ServiceName} existe deje. Le reinstaller ?", "Service existant", MessageBoxButtons.YesNo, MessageBoxIcon.Question);
                if (confirm != DialogResult.Yes) throw new InvalidOperationException("Installation annulee.");
                InstallerHelpers.RemoveService(_s.ServiceName, AppendLog);
            }

            var installedExe = Path.Combine(_s.InstallDir, exeName);
            InstallerHelpers.InstallServerService(_s.ServiceName, installedExe, AppendLog);
            var version = FileVersionInfo.GetVersionInfo(installedExe).ProductVersion ?? string.Empty;
            var uninstallScriptPath = InstallerHelpers.WriteServerUninstallScript(_s.InstallDir, _s.ServiceName);
            var displayIconPath = InstallerHelpers.WriteInstalledDisplayIcon(_s.InstallDir, "VigiSensysServer", installedExe) ?? installedExe;
            InstallerHelpers.WriteRegistryInfo(_s.InstallDir, version, licenseDestPath, publicKeyDestPath, _s.ServiceName, displayIconPath, uninstallScriptPath);

            SetStatus("Etat : installation terminee avec succes");
            AppendLog("[OK] Installation terminee.");
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
            Go(_tabs.SelectedIndex);
            _close.Enabled = true;
        }
    }

    private void SetStatus(string status)
    {
        if (InvokeRequired)
        {
            BeginInvoke(new Action<string>(SetStatus), status);
            return;
        }

        _status.Text = status;
    }

    private void AppendLog(string line)
    {
        if (InvokeRequired)
        {
            BeginInvoke(new Action<string>(AppendLog), line);
            return;
        }

        _log.AppendText(line + Environment.NewLine);
    }

    private sealed class Settings
    {
        public string InstallDir = string.Empty;
        public string InstallMode = string.Empty;
        public string ServiceName = string.Empty;
        public string WebsiteBaseUrl = string.Empty;
        public string DbProvider = string.Empty;
        public string DbHost = string.Empty;
        public string DbPort = string.Empty;
        public string DbUser = string.Empty;
        public string DbPassword = string.Empty;
        public string DbMain = string.Empty;
        public string DbMeasure = string.Empty;
        public string DbConnectionTimeoutSeconds = string.Empty;
        public string DbCommandTimeoutSeconds = string.Empty;
        public string SqlServerEncrypt = string.Empty;
        public string SqlServerTrustServerCertificate = string.Empty;
        public string LicensePath = string.Empty;
        public string PublicKeyPath = string.Empty;
        public string InstancePublicKey = string.Empty;
        public string DispatchSecret = string.Empty;
        public string LicenseHysteresisDelta = string.Empty;
        public string LicenseDebounceSeconds = string.Empty;
        public string LicenseShowWhileSnoozed = string.Empty;
        public string SettingsCacheSeconds = string.Empty;
        public string MetrologyLogDetailed = string.Empty;

        public static Settings Default()
        {
            var pd = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData);
            return new Settings
            {
                InstallDir = Path.Combine(pd, @"VigiSensys\server"),
                InstallMode = "normal",
                ServiceName = "VigiSensysServeur",
                WebsiteBaseUrl = string.Empty,
                DbProvider = "mysql",
                DbHost = string.Empty,
                DbPort = "3306",
                DbUser = string.Empty,
                DbPassword = string.Empty,
                DbMain = "vigi_main",
                DbMeasure = "vigi_mesures",
                DbConnectionTimeoutSeconds = "5",
                DbCommandTimeoutSeconds = "30",
                SqlServerEncrypt = "false",
                SqlServerTrustServerCertificate = "true",
                LicensePath = Path.Combine(pd, @"VigiSensys\licenses\license.vtlic"),
                PublicKeyPath = Path.Combine(pd, @"VigiSensys\license_keys\public_key.pem"),
                InstancePublicKey = string.Empty,
                DispatchSecret = string.Empty,
                LicenseHysteresisDelta = "0",
                LicenseDebounceSeconds = "0",
                LicenseShowWhileSnoozed = "true",
                SettingsCacheSeconds = "60",
                MetrologyLogDetailed = "false"
            };
        }
    }
}



