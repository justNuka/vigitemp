using System;
using System.Drawing;
using System.IO;
using System.Text;
using System.Windows.Forms;

namespace VigitempWebInstaller;

public sealed class MainForm : Form
{
    private static readonly Color AppBackground = Color.FromArgb(245, 247, 251);
    private static readonly Color CardBackground = Color.White;
    private static readonly Color Accent = Color.FromArgb(14, 116, 144);
    private static readonly Color TextPrimary = Color.FromArgb(15, 23, 42);
    private static readonly Color TextMuted = Color.FromArgb(71, 85, 105);
    private static readonly Color Border = Color.FromArgb(203, 213, 225);

    private static string SqlServerValue(string value) => "{" + value + "}";

    private readonly Settings _s = Settings.Default();
    private readonly TabControl _tabs = new() { Dock = DockStyle.Fill };
    private readonly Label _step = new() { Left = 24, Top = 116, Width = 900, Height = 22, ForeColor = TextMuted };
    private readonly FlowLayoutPanel _progress = new() { Left = 24, Top = 142, Width = 920, Height = 36, Anchor = AnchorStyles.Left | AnchorStyles.Right | AnchorStyles.Top, WrapContents = false, BackColor = AppBackground };
    private readonly Button _back = new() { Text = "Précédent", Width = 120, Height = 38, Left = 24, Top = 666, Anchor = AnchorStyles.Left | AnchorStyles.Bottom };
    private readonly Button _next = new() { Text = "Suivant", Width = 120, Height = 38, Left = 154, Top = 666, Anchor = AnchorStyles.Left | AnchorStyles.Bottom };
    private readonly Button _install = new() { Text = "Installer", Width = 140, Height = 38, Left = 734, Top = 666, Anchor = AnchorStyles.Right | AnchorStyles.Bottom };
    private readonly Button _close = new() { Text = "Fermer", Width = 120, Height = 38, Left = 884, Top = 666, Anchor = AnchorStyles.Right | AnchorStyles.Bottom };
    private readonly TextBox _summary = new() { Multiline = true, ReadOnly = true, ScrollBars = ScrollBars.Vertical, Dock = DockStyle.Top, Height = 190, Font = new Font("Consolas", 9F), BackColor = Color.FromArgb(248, 250, 252), ForeColor = TextPrimary, BorderStyle = BorderStyle.FixedSingle };
    private readonly Label _status = new() { Text = "Etat : prêt", Dock = DockStyle.Top, Height = 30, Padding = new Padding(0, 8, 0, 0), ForeColor = Accent, Font = new Font("Segoe UI Semibold", 9F, FontStyle.Bold) };
    private readonly TextBox _log = new() { Multiline = true, ReadOnly = true, ScrollBars = ScrollBars.Both, WordWrap = false, Dock = DockStyle.Fill, Font = new Font("Consolas", 9F), BackColor = Color.FromArgb(15, 23, 42), ForeColor = Color.FromArgb(226, 232, 240), BorderStyle = BorderStyle.FixedSingle };
    private readonly Label[] _progressBadges = new Label[5];
    private bool _running;

    private readonly TextBox installDir; private readonly TextBox serviceName; private readonly TextBox port; private readonly TextBox websiteBaseUrl; private readonly TextBox appBaseUrl;
    private readonly ComboBox dbProvider; private readonly TextBox dbHost; private readonly TextBox dbPort; private readonly TextBox dbUser; private readonly TextBox dbPassword; private readonly TextBox dbMain; private readonly TextBox dbMeasure; private readonly TextBox dbChat; private readonly TextBox cacheTtl;
    private readonly TextBox logsDir; private readonly TextBox licensePath; private readonly TextBox publicKeyPath; private readonly TextBox agentPrivateKeyPath;
    private readonly TextBox agentPort; private readonly TextBox agentTimeoutMs; private readonly TextBox agentActiveWindowMinutes; private readonly TextBox hotlineServerHost; private readonly TextBox hotlineServerPort; private readonly TextBox hotlineServerTimeoutMs; private readonly TextBox hotlineAccessTokenTtl; private readonly TextBox hotlineRefreshTokenTtl; private readonly TextBox allowedDevOrigins; private readonly TextBox cspConnectSrc; private readonly TextBox dispatchSecret; private readonly TextBox emailTimezone;
    private readonly Button detectFilesButton;

    public MainForm()
    {
        Text = "Installation du site VigiSensys";
        StartPosition = FormStartPosition.CenterScreen;
        Width = 980;
        Height = 760;
        MinimumSize = new Size(980, 760);
        Font = new Font("Segoe UI", 9F);
        BackColor = AppBackground;

        Controls.AddRange(new Control[]
        {
            new Panel { Left = 0, Top = 0, Width = 980, Height = 100, Anchor = AnchorStyles.Left | AnchorStyles.Right | AnchorStyles.Top, BackColor = TextPrimary },
            new Label { AutoSize = true, Font = new Font("Segoe UI Semibold", 18F, FontStyle.Bold), ForeColor = Color.White, BackColor = TextPrimary, Text = "Installateur du site VigiSensys", Location = new Point(24, 20) },
            new Label { Width = 900, Height = 44, Location = new Point(24, 56), ForeColor = Color.FromArgb(226, 232, 240), BackColor = TextPrimary, Text = "Renseignez les paramètres d'installation, relisez le résumé, puis lancez l'installation. Vous pouvez revenir en arrière avant l'exécution." },
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
        Button BrowseFolder(TextBox tb) { var b = SecondaryButton("Parcourir", 110); b.Click += (_, _) => { using var d = new FolderBrowserDialog(); if (Directory.Exists(tb.Text)) d.InitialDirectory = tb.Text; if (d.ShowDialog(this) == DialogResult.OK) tb.Text = d.SelectedPath; }; return b; }
        Button BrowseFile(TextBox tb, string filter) { var b = SecondaryButton("Parcourir", 110); b.Click += (_, _) => { using var d = new OpenFileDialog { Filter = filter }; var dir = Path.GetDirectoryName(tb.Text); if (!string.IsNullOrWhiteSpace(dir) && Directory.Exists(dir)) d.InitialDirectory = dir; d.FileName = Path.GetFileName(tb.Text); if (d.ShowDialog(this) == DialogResult.OK) tb.Text = d.FileName; }; return b; }
        Panel Field(string label, Control input, Control action = null)
        {
            var p = new Panel { Dock = DockStyle.Top, Height = 84, Padding = new Padding(0, 0, 0, 12), BackColor = CardBackground };
            var l = new Label { Text = label, Dock = DockStyle.Top, Height = 22, ForeColor = TextPrimary, Font = new Font("Segoe UI Semibold", 9F, FontStyle.Bold) };
            var t = new TableLayoutPanel { Dock = DockStyle.Top, Height = 38, ColumnCount = action == null ? 1 : 2, RowCount = 1, BackColor = CardBackground };
            t.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F));
            if (action != null) t.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 118F));
            if (input is ComboBox combo) { combo.FlatStyle = FlatStyle.Flat; combo.BackColor = Color.White; combo.ForeColor = TextPrimary; }
            t.Controls.Add(input, 0, 0);
            if (action != null) t.Controls.Add(action, 1, 0);
            p.Controls.Add(t);
            p.Controls.Add(l);
            return p;
        }
        TableLayoutPanel StepPanel() { var t = new TableLayoutPanel { Dock = DockStyle.Fill, ColumnCount = 1, AutoScroll = true, BackColor = CardBackground }; t.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100F)); return t; }
        TabPage Page(string title, Control content) { var p = new TabPage(title) { BackColor = CardBackground }; content.Dock = DockStyle.Fill; content.Padding = new Padding(20); p.Controls.Add(content); return p; }

        installDir = T(_s.InstallDir, placeholder: @"C:\ProgramData\VigiSensys\website"); serviceName = T(_s.ServiceName, placeholder: "VigiSensysWeb"); port = T(_s.Port, placeholder: "3000"); websiteBaseUrl = T(_s.WebsiteBaseUrl, placeholder: "http://127.0.0.1:3000/"); appBaseUrl = T(_s.AppBaseUrl, placeholder: "http://127.0.0.1:3000/");
        dbProvider = new ComboBox { Dock = DockStyle.Fill, DropDownStyle = ComboBoxStyle.DropDownList }; dbProvider.Items.AddRange(new object[] { "mysql", "mssql" }); dbProvider.SelectedItem = _s.DbProvider; dbProvider.FlatStyle = FlatStyle.Flat; dbProvider.BackColor = Color.White; dbProvider.ForeColor = TextPrimary;
        dbHost = T(_s.DbHost, placeholder: "127.0.0.1"); dbPort = T(_s.DbPort, placeholder: "3306"); dbUser = T(_s.DbUser, placeholder: "root"); dbPassword = T(_s.DbPassword, true, placeholder: "Mot de passe BDD"); dbMain = T(_s.DbMain, placeholder: "vigi_main"); dbMeasure = T(_s.DbMeasure, placeholder: "vigi_mesures"); dbChat = T(_s.DbChat, placeholder: "vigi_chat"); cacheTtl = T(_s.CacheTtl, placeholder: "30");
        logsDir = T(_s.LogsDir, placeholder: @"C:\ProgramData\VigiSensys\web-logs"); licensePath = T(_s.LicensePath, placeholder: "Chemin du fichier .vtlic"); publicKeyPath = T(_s.PublicKeyPath, placeholder: "Chemin de public_key.pem"); agentPrivateKeyPath = T(_s.AgentPrivateKeyPath, placeholder: "Chemin de agent_secret_private.pem");
        detectFilesButton = SecondaryButton("D?tecter les fichiers", 170); detectFilesButton.Click += (_, _) => DetectSecurityFiles();
        agentPort = T(_s.AgentPort, placeholder: "8000"); agentTimeoutMs = T(_s.AgentTimeoutMs, placeholder: "1500"); agentActiveWindowMinutes = T(_s.AgentActiveWindowMinutes, placeholder: "15"); hotlineServerHost = T(_s.HotlineServerHost, placeholder: "127.0.0.1"); hotlineServerPort = T(_s.HotlineServerPort, placeholder: "5310"); hotlineServerTimeoutMs = T(_s.HotlineServerTimeoutMs, placeholder: "10000"); hotlineAccessTokenTtl = T(_s.HotlineAccessTokenTtl, placeholder: "15"); hotlineRefreshTokenTtl = T(_s.HotlineRefreshTokenTtl, placeholder: "120"); allowedDevOrigins = T(_s.AllowedDevOrigins, placeholder: "http://localhost:3000"); cspConnectSrc = T(_s.CspConnectSrc, placeholder: "http://127.0.0.1:8000,http://localhost:8000"); dispatchSecret = T(_s.DispatchSecret, placeholder: "Laisser vide pour reprise automatique"); emailTimezone = T(_s.EmailTimezone, placeholder: "Europe/Paris");

        dbProvider.SelectedIndexChanged += (_, _) =>
        {
            var mssql = string.Equals(dbProvider.SelectedItem?.ToString(), "mssql", StringComparison.OrdinalIgnoreCase);
            if (string.IsNullOrWhiteSpace(dbPort.Text) || dbPort.Text is "3306" or "1433") dbPort.Text = mssql ? "1433" : "3306";
            if (string.IsNullOrWhiteSpace(dbUser.Text) || dbUser.Text is "root" or "sa") dbUser.Text = mssql ? "sa" : "root";
        };

        var general = StepPanel(); foreach (var c in new Control[] { Field("Dossier d'installation", installDir, BrowseFolder(installDir)), Field("Nom du service Windows", serviceName), Field("Port HTTP", port), Field("URL publique du site", websiteBaseUrl), Field("URL applicative publique", appBaseUrl) }) general.Controls.Add(c);
        var database = StepPanel(); foreach (var c in new Control[] { Field("Type de BDD", dbProvider), Field("Hôte BDD", dbHost), Field("Port BDD", dbPort), Field("Utilisateur BDD", dbUser), Field("Mot de passe BDD", dbPassword), Field("BDD principale", dbMain), Field("BDD mesures", dbMeasure), Field("BDD chat", dbChat), Field("Cache TTL (secondes)", cacheTtl) }) database.Controls.Add(c);
        var security = StepPanel(); foreach (var c in new Control[] { Field("Dossier des logs", logsDir, BrowseFolder(logsDir)), Field("Fichier licence (.vtlic)", licensePath, BrowseFile(licensePath, "Licence (*.vtlic)|*.vtlic|Tous les fichiers (*.*)|*.*")), Field("Clé publique licence (.pem)", publicKeyPath, BrowseFile(publicKeyPath, "PEM (*.pem)|*.pem|Tous les fichiers (*.*)|*.*")), Field("Clé privée agent (.pem)", agentPrivateKeyPath, BrowseFile(agentPrivateKeyPath, "PEM (*.pem)|*.pem|Tous les fichiers (*.*)|*.*")) }) security.Controls.Add(c);
        var advanced = StepPanel(); foreach (var c in new Control[] { Field("Port agent local", agentPort), Field("Timeout agent local (ms)", agentTimeoutMs), Field("Fenêtre active agent (minutes)", agentActiveWindowMinutes), Field("Hôte serveur hotline", hotlineServerHost), Field("Port serveur hotline", hotlineServerPort), Field("Timeout hotline (ms)", hotlineServerTimeoutMs), Field("TTL access hotline (minutes)", hotlineAccessTokenTtl), Field("TTL refresh hotline (minutes)", hotlineRefreshTokenTtl), Field("Fuseau horaire emails (IANA)", emailTimezone), Field("Origins dev autorisés (CSV, optionnel)", allowedDevOrigins), Field("CSP connect-src supplémentaires (CSV, optionnel)", cspConnectSrc), Field("Secret dispatch alarmes (laisser vide pour reprendre/générer)", dispatchSecret) }) advanced.Controls.Add(c);
        var installPanel = new Panel { Padding = new Padding(20), BackColor = CardBackground };
        installPanel.Controls.Add(_log); installPanel.Controls.Add(_status); installPanel.Controls.Add(_summary); installPanel.Controls.Add(new Label { Text = "Résumé avant installation", Dock = DockStyle.Top, Height = 24, ForeColor = TextPrimary, Font = new Font("Segoe UI Semibold", 10F, FontStyle.Bold) });

        _tabs.TabPages.AddRange(new[] { Page("Général", general), Page("Base de données", database), Page("Fichiers et sécurité", security), Page("Paramètres avancés", advanced), Page("Résumé et installation", installPanel) });
        for (var i = 0; i < _progressBadges.Length; i++) { _progressBadges[i] = StepBadge(); _progress.Controls.Add(_progressBadges[i]); }

        StylePrimaryButton(_next);
        StylePrimaryButton(_install);
        StyleSecondaryButton(_back);
        StyleSecondaryButton(_close);

        _back.Click += (_, _) => Go(_tabs.SelectedIndex - 1);
        _next.Click += (_, _) => Go(_tabs.SelectedIndex + 1);
        _install.Click += async (_, _) => await InstallAsync();
        _close.Click += (_, _) => Close();
        DetectSecurityFiles();
        Go(0);
    }

    private Label StepBadge() => new() { AutoSize = false, Width = 176, Height = 32, Margin = new Padding(0, 0, 8, 0), TextAlign = ContentAlignment.MiddleCenter, Font = new Font("Segoe UI Semibold", 9F, FontStyle.Bold), BackColor = Color.White, ForeColor = TextMuted, BorderStyle = BorderStyle.FixedSingle };
    private Button SecondaryButton(string text, int width) { var b = new Button { Text = text, Width = width, Height = 34 }; StyleSecondaryButton(b); return b; }
    private void ApplyPrimaryButtonState(Button button) { if (button.Enabled) { button.BackColor = Accent; button.ForeColor = Color.White; } else { button.BackColor = Color.FromArgb(103, 232, 249); button.ForeColor = Color.White; } }
    private void StylePrimaryButton(Button button) { button.FlatStyle = FlatStyle.Flat; button.FlatAppearance.BorderSize = 0; button.Font = new Font("Segoe UI Semibold", 9F, FontStyle.Bold); button.EnabledChanged += (_, _) => ApplyPrimaryButtonState(button); ApplyPrimaryButtonState(button); }
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
        if (string.IsNullOrWhiteSpace(agentPrivateKeyPath.Text) || !File.Exists(agentPrivateKeyPath.Text))
        {
            var detected = InstallerHelpers.FindFirstMatchingFile(startupDir, "agent_secret_private.pem");
            if (!string.IsNullOrWhiteSpace(detected)) agentPrivateKeyPath.Text = detected;
        }
        var sharedDir = InstallerHelpers.GetSharedArtifactsDirectory(startupDir);
        AppendLog($"[INFO] Secrets partag?s: {sharedDir}");
    }

    private static string FindFirstByPattern(string startupDir, string pattern)
    {
        var current = new DirectoryInfo(Path.GetFullPath(startupDir));
        while (current != null)
        {
            var match = Directory.GetFiles(current.FullName, pattern, SearchOption.TopDirectoryOnly);
            if (match.Length > 0) return match[0];
            current = current.Parent;
        }
        return null;
    }

    private void Persist()
    {
        _s.InstallDir = installDir.Text.Trim(); _s.ServiceName = serviceName.Text.Trim(); _s.Port = port.Text.Trim(); _s.WebsiteBaseUrl = websiteBaseUrl.Text.Trim(); _s.AppBaseUrl = appBaseUrl.Text.Trim();
        _s.DbProvider = string.Equals(dbProvider.SelectedItem?.ToString(), "mssql", StringComparison.OrdinalIgnoreCase) ? "mssql" : "mysql"; _s.DbHost = dbHost.Text.Trim(); _s.DbPort = dbPort.Text.Trim(); _s.DbUser = dbUser.Text.Trim(); _s.DbPassword = dbPassword.Text; _s.DbMain = dbMain.Text.Trim(); _s.DbMeasure = dbMeasure.Text.Trim(); _s.DbChat = dbChat.Text.Trim(); _s.CacheTtl = cacheTtl.Text.Trim();
        _s.LogsDir = logsDir.Text.Trim(); _s.LicensePath = licensePath.Text.Trim(); _s.PublicKeyPath = publicKeyPath.Text.Trim(); _s.AgentPrivateKeyPath = agentPrivateKeyPath.Text.Trim();
        _s.AgentPort = agentPort.Text.Trim(); _s.AgentTimeoutMs = agentTimeoutMs.Text.Trim(); _s.AgentActiveWindowMinutes = agentActiveWindowMinutes.Text.Trim(); _s.HotlineServerHost = hotlineServerHost.Text.Trim(); _s.HotlineServerPort = hotlineServerPort.Text.Trim(); _s.HotlineServerTimeoutMs = hotlineServerTimeoutMs.Text.Trim(); _s.HotlineAccessTokenTtl = hotlineAccessTokenTtl.Text.Trim(); _s.HotlineRefreshTokenTtl = hotlineRefreshTokenTtl.Text.Trim(); _s.EmailTimezone = emailTimezone.Text.Trim(); _s.AllowedDevOrigins = allowedDevOrigins.Text.Trim(); _s.CspConnectSrc = cspConnectSrc.Text.Trim(); _s.DispatchSecret = dispatchSecret.Text.Trim();
    }

    private bool Valid(int idx)
    {
        Persist();
        string m = null;
        if (idx == 0) { if (string.IsNullOrWhiteSpace(_s.InstallDir)) m = "Le dossier d'installation est obligatoire."; else if (string.IsNullOrWhiteSpace(_s.ServiceName)) m = "Le nom du service Windows est obligatoire."; else if (string.IsNullOrWhiteSpace(_s.Port)) m = "Le port HTTP est obligatoire."; else if (string.IsNullOrWhiteSpace(_s.WebsiteBaseUrl)) m = "L'URL publique du site est obligatoire."; else if (string.IsNullOrWhiteSpace(_s.AppBaseUrl)) m = "L'URL applicative publique est obligatoire."; }
        else if (idx == 1) { if (string.IsNullOrWhiteSpace(_s.DbHost)) m = "L'hôte BDD est obligatoire."; else if (string.IsNullOrWhiteSpace(_s.DbPort)) m = "Le port BDD est obligatoire."; else if (string.IsNullOrWhiteSpace(_s.DbUser)) m = "L'utilisateur BDD est obligatoire."; else if (string.IsNullOrWhiteSpace(_s.DbMain) || string.IsNullOrWhiteSpace(_s.DbMeasure) || string.IsNullOrWhiteSpace(_s.DbChat)) m = "Les noms de bases sont obligatoires."; else if (string.IsNullOrWhiteSpace(_s.CacheTtl)) m = "Le cache TTL est obligatoire."; }
        else if (idx == 2) { if (string.IsNullOrWhiteSpace(_s.LogsDir)) m = "Le dossier des logs est obligatoire."; else if (string.IsNullOrWhiteSpace(_s.LicensePath) || !File.Exists(_s.LicensePath)) m = "Le fichier licence est obligatoire."; else if (string.IsNullOrWhiteSpace(_s.PublicKeyPath) || !File.Exists(_s.PublicKeyPath)) m = "La clé publique licence est obligatoire."; else if (string.IsNullOrWhiteSpace(_s.AgentPrivateKeyPath) || !File.Exists(_s.AgentPrivateKeyPath)) m = "La clé privée agent est obligatoire."; }
        else if (idx == 3) { if (string.IsNullOrWhiteSpace(_s.AgentPort)) m = "Le port agent local est obligatoire."; else if (string.IsNullOrWhiteSpace(_s.AgentTimeoutMs)) m = "Le timeout agent local est obligatoire."; else if (string.IsNullOrWhiteSpace(_s.AgentActiveWindowMinutes)) m = "La fenêtre active agent est obligatoire."; else if (string.IsNullOrWhiteSpace(_s.HotlineServerHost)) m = "L'hôte hotline est obligatoire."; else if (string.IsNullOrWhiteSpace(_s.HotlineServerPort)) m = "Le port hotline est obligatoire."; else if (string.IsNullOrWhiteSpace(_s.HotlineServerTimeoutMs)) m = "Le timeout hotline est obligatoire."; else if (string.IsNullOrWhiteSpace(_s.HotlineAccessTokenTtl) || string.IsNullOrWhiteSpace(_s.HotlineRefreshTokenTtl)) m = "Les TTL hotline sont obligatoires."; else if (string.IsNullOrWhiteSpace(_s.EmailTimezone)) m = "Le fuseau horaire emails est obligatoire."; }
        if (m != null) { MessageBox.Show(m, "Configuration incomplète", MessageBoxButtons.OK, MessageBoxIcon.Warning); return false; }
        return true;
    }

    private void Go(int idx)
    {
        if (_running || idx < 0 || idx >= _tabs.TabPages.Count) return;
        if (idx > _tabs.SelectedIndex && !Valid(_tabs.SelectedIndex)) return;
        _tabs.SelectedIndex = idx;
        Persist();
        if (idx == 4) RefreshSummary();
        var titles = new[] { "Général", "Base de données", "Fichiers et sécurité", "Paramètres avancés", "Résumé et installation" };
        _step.Text = $"Étape {idx + 1} / {titles.Length} - {titles[idx]}";
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
        sb.AppendLine("Général"); sb.AppendLine($"- Dossier d'installation : {_s.InstallDir}"); sb.AppendLine($"- Service Windows : {_s.ServiceName}"); sb.AppendLine($"- Port HTTP : {_s.Port}"); sb.AppendLine($"- URL site : {_s.WebsiteBaseUrl}"); sb.AppendLine($"- URL applicative : {_s.AppBaseUrl}"); sb.AppendLine();
        sb.AppendLine("Base de données"); sb.AppendLine($"- Provider : {_s.DbProvider}"); sb.AppendLine($"- Hôte : {_s.DbHost}:{_s.DbPort}"); sb.AppendLine($"- Utilisateur : {_s.DbUser}"); sb.AppendLine($"- BDD principale : {_s.DbMain}"); sb.AppendLine($"- BDD mesures : {_s.DbMeasure}"); sb.AppendLine($"- BDD chat : {_s.DbChat}"); sb.AppendLine();
        sb.AppendLine("Fichiers et sécurité"); sb.AppendLine($"- Logs : {_s.LogsDir}"); sb.AppendLine($"- Licence : {_s.LicensePath}"); sb.AppendLine($"- Clé publique : {_s.PublicKeyPath}"); sb.AppendLine($"- Clé privée agent : {_s.AgentPrivateKeyPath}"); sb.AppendLine();
        sb.AppendLine("Avancé"); sb.AppendLine($"- Agent : {_s.AgentPort} / {_s.AgentTimeoutMs} ms / {_s.AgentActiveWindowMinutes} min"); sb.AppendLine($"- Hotline : {_s.HotlineServerHost}:{_s.HotlineServerPort} / {_s.HotlineServerTimeoutMs} ms"); sb.AppendLine($"- TTL hotline : access {_s.HotlineAccessTokenTtl} min / refresh {_s.HotlineRefreshTokenTtl} min"); sb.AppendLine($"- Fuseau horaire emails : {_s.EmailTimezone}"); sb.AppendLine($"- Origins dev : {_s.AllowedDevOrigins}"); sb.AppendLine($"- CSP connect-src : {_s.CspConnectSrc}"); sb.AppendLine($"- Secret dispatch : {(string.IsNullOrWhiteSpace(_s.DispatchSecret) ? "généré / repris automatiquement" : "fourni manuellement")}");
        _summary.Text = sb.ToString();
    }

    private async System.Threading.Tasks.Task InstallAsync()
    {
        if (_running || !Valid(4)) return;
        var src = AppContext.BaseDirectory;
        var standalone = Path.Combine(src, ".next", "standalone", "server.js");
        if (!File.Exists(standalone)) { MessageBox.Show($"Build standalone introuvable : {standalone}", "Installation impossible", MessageBoxButtons.OK, MessageBoxIcon.Error); return; }
        var node = InstallerHelpers.FindNodeOnPath();
        if (string.IsNullOrWhiteSpace(node)) { MessageBox.Show("Node.js est introuvable dans le PATH. Installez d'abord les prérequis.", "Installation impossible", MessageBoxButtons.OK, MessageBoxIcon.Error); return; }

        _running = true;
        _back.Enabled = _next.Enabled = _install.Enabled = _close.Enabled = false;
        _log.Clear();
        SetStatus("Etat : installation en cours...");
        AppendLog($"[INFO] Source package: {src}");
        try
        {
            Directory.CreateDirectory(_s.InstallDir); InstallerHelpers.CopyDirectory(src, _s.InstallDir); Directory.CreateDirectory(_s.LogsDir); AppendLog("[OK] Fichiers copiés.");
            var winswSource = Path.Combine(_s.InstallDir, "winsw.exe"); if (!File.Exists(winswSource)) throw new FileNotFoundException("winsw.exe introuvable dans le package", winswSource); var winswExe = Path.Combine(_s.InstallDir, _s.ServiceName + ".exe"); File.Copy(winswSource, winswExe, true); var winswXml = Path.Combine(_s.InstallDir, _s.ServiceName + ".xml");
            var sharedSecretsDir = InstallerHelpers.GetSharedArtifactsDirectory(src);
            AppendLog($"[INFO] Secrets partag?s utilis?s: {sharedSecretsDir}");
            var dispatch = InstallerHelpers.GetOrCreateSharedSecret(src, "alarm-dispatch-secret.txt", _s.DispatchSecret);
            var jwt = InstallerHelpers.GetOrCreateSharedSecret(src, "web-jwt-secret.txt");
            var hotlineJwt = InstallerHelpers.GetOrCreateSharedSecret(src, "hotline-jwt-secret.txt");
            var agentSecret = InstallerHelpers.GetOrCreateSharedSecret(src, "agent-runtime-secret.txt");
            var envPath = Path.Combine(_s.InstallDir, ".next", "standalone", ".env"); Directory.CreateDirectory(Path.GetDirectoryName(envPath)!); string dbUrl, dbMesures, dbChatUrl;
            if (_s.DbProvider == "mssql") { var dbUserEscaped = SqlServerValue(_s.DbUser); var dbPasswordEscaped = SqlServerValue(_s.DbPassword); var dbMainEscaped = SqlServerValue(_s.DbMain); var dbMeasureEscaped = SqlServerValue(_s.DbMeasure); var dbChatEscaped = SqlServerValue(_s.DbChat); dbUrl = $"sqlserver://{_s.DbHost}:{_s.DbPort};database={dbMainEscaped};user={dbUserEscaped};password={dbPasswordEscaped};encrypt=true;trustServerCertificate=true;schema=dbo"; dbMesures = $"sqlserver://{_s.DbHost}:{_s.DbPort};database={dbMeasureEscaped};user={dbUserEscaped};password={dbPasswordEscaped};encrypt=true;trustServerCertificate=true;schema=dbo"; dbChatUrl = $"sqlserver://{_s.DbHost}:{_s.DbPort};database={dbChatEscaped};user={dbUserEscaped};password={dbPasswordEscaped};encrypt=true;trustServerCertificate=true;schema=dbo"; }
            else { const string q = "allowPublicKeyRetrieval=true"; dbUrl = $"mysql://{Uri.EscapeDataString(_s.DbUser)}:{Uri.EscapeDataString(_s.DbPassword)}@{_s.DbHost}:{_s.DbPort}/{_s.DbMain}?{q}"; dbMesures = $"mysql://{Uri.EscapeDataString(_s.DbUser)}:{Uri.EscapeDataString(_s.DbPassword)}@{_s.DbHost}:{_s.DbPort}/{_s.DbMeasure}?{q}"; dbChatUrl = $"mysql://{Uri.EscapeDataString(_s.DbUser)}:{Uri.EscapeDataString(_s.DbPassword)}@{_s.DbHost}:{_s.DbPort}/{_s.DbChat}?{q}"; }
            var env = new StringBuilder(); env.AppendLine($"DATABASE_URL=\"{dbUrl}\""); env.AppendLine($"DATABASE_MESURES_URL=\"{dbMesures}\""); env.AppendLine($"DATABASE_CHAT_URL=\"{dbChatUrl}\""); env.AppendLine($"DATABASE_PROVIDER=\"{_s.DbProvider}\""); env.AppendLine($"NEXT_PUBLIC_API_BASE_URL=\"{_s.WebsiteBaseUrl}\""); env.AppendLine($"NEXT_PUBLIC_APP_URL=\"{_s.AppBaseUrl}\""); env.AppendLine($"NEXT_PUBLIC_CACHE_TTL={_s.CacheTtl}"); env.AppendLine($"VIGISENSYS_LICENSE_PATH=\"{_s.LicensePath}\""); env.AppendLine($"VIGISENSYS_LICENSE_PUBLIC_KEY_PATH=\"{_s.PublicKeyPath}\""); env.AppendLine($"VIGISENSYS_AGENT_SECRET_PRIVATE_KEY_PATH=\"{_s.AgentPrivateKeyPath}\""); env.AppendLine($"VIGISENSYS_AGENT_PORT={_s.AgentPort}"); env.AppendLine($"VIGISENSYS_AGENT_TIMEOUT_MS={_s.AgentTimeoutMs}"); env.AppendLine($"VIGISENSYS_AGENT_ACTIVE_WINDOW_MINUTES={_s.AgentActiveWindowMinutes}"); env.AppendLine($"VIGISENSYS_AGENT_SECRET=\"{agentSecret}\""); env.AppendLine($"VIGISENSYS_ALARM_DISPATCH_SECRET=\"{dispatch}\""); env.AppendLine($"VIGISENSYS_SURVEILLANCE_DISPATCH_SECRET=\"{dispatch}\""); env.AppendLine($"VIGISENSYS_LOGS_DIR=\"{_s.LogsDir}\""); env.AppendLine($"VIGISENSYS_EMAIL_TIMEZONE=\"{_s.EmailTimezone}\""); env.AppendLine($"VIGISENSYS_ALLOWED_DEV_ORIGINS=\"{_s.AllowedDevOrigins}\""); env.AppendLine($"VIGISENSYS_CSP_CONNECT_SRC=\"{_s.CspConnectSrc}\""); env.AppendLine($"VIGITEMP_LICENSE_PATH=\"{_s.LicensePath}\""); env.AppendLine($"VIGITEMP_LICENSE_PUBLIC_KEY_PATH=\"{_s.PublicKeyPath}\""); env.AppendLine($"VIGITEMP_AGENT_SECRET_PRIVATE_KEY_PATH=\"{_s.AgentPrivateKeyPath}\""); env.AppendLine($"VIGITEMP_AGENT_PORT={_s.AgentPort}"); env.AppendLine($"VIGITEMP_AGENT_TIMEOUT_MS={_s.AgentTimeoutMs}"); env.AppendLine($"VIGITEMP_AGENT_ACTIVE_WINDOW_MINUTES={_s.AgentActiveWindowMinutes}"); env.AppendLine($"VIGITEMP_AGENT_SECRET=\"{agentSecret}\""); env.AppendLine($"VIGITEMP_ALARM_DISPATCH_SECRET=\"{dispatch}\""); env.AppendLine($"VIGITEMP_SURVEILLANCE_DISPATCH_SECRET=\"{dispatch}\""); env.AppendLine($"VIGITEMP_LOGS_DIR=\"{_s.LogsDir}\""); env.AppendLine($"VIGITEMP_EMAIL_TIMEZONE=\"{_s.EmailTimezone}\""); env.AppendLine($"TZ=\"{_s.EmailTimezone}\""); env.AppendLine($"VIGITEMP_ALLOWED_DEV_ORIGINS=\"{_s.AllowedDevOrigins}\""); env.AppendLine($"VIGITEMP_CSP_CONNECT_SRC=\"{_s.CspConnectSrc}\""); env.AppendLine($"JWT_SECRET=\"{jwt}\""); env.AppendLine($"HOTLINE_SERVER_HOST=\"{_s.HotlineServerHost}\""); env.AppendLine($"HOTLINE_SERVER_PORT={_s.HotlineServerPort}"); env.AppendLine($"HOTLINE_SERVER_TIMEOUT_MS={_s.HotlineServerTimeoutMs}"); env.AppendLine($"HOTLINE_JWT_SECRET=\"{hotlineJwt}\""); env.AppendLine($"HOTLINE_ACCESS_TOKEN_TTL_MINUTES={_s.HotlineAccessTokenTtl}"); env.AppendLine($"HOTLINE_REFRESH_TOKEN_TTL_MINUTES={_s.HotlineRefreshTokenTtl}"); env.AppendLine("NODE_ENV=production"); File.WriteAllText(envPath, env.ToString()); AppendLog("[OK] Fichier .env généré.");
            if (InstallerHelpers.ServiceExists(_s.ServiceName)) { var confirm = MessageBox.Show($"Le service {_s.ServiceName} existe déjà. Le réinstaller ?", "Service existant", MessageBoxButtons.YesNo, MessageBoxIcon.Question); if (confirm != DialogResult.Yes) throw new InvalidOperationException("Installation annulée."); InstallerHelpers.RemoveService(_s.ServiceName, winswExe, AppendLog); }
            var xml = $@"<service>
  <id>{_s.ServiceName}</id>
  <name>{_s.ServiceName}</name>
  <description>VigiSensys Next.js website</description>
  <executable>{node}</executable>
  <arguments>.next\standalone\server.js</arguments>
  <workingdirectory>{_s.InstallDir}</workingdirectory>
  <log mode=""roll-by-size""><sizeThreshold>10240</sizeThreshold><keepFiles>8</keepFiles></log>
  <resetfailure>1 day</resetfailure>
  <onfailure action=""restart"" delay=""60000"" />
  <env name=""NODE_ENV"" value=""production"" />
  <env name=""PORT"" value=""{_s.Port}"" />
  <env name=""HOSTNAME"" value=""0.0.0.0"" />
</service>";
            File.WriteAllText(winswXml, xml); InstallerHelpers.RunProcess(winswExe, "install", _s.InstallDir, AppendLog); InstallerHelpers.RunProcess(winswExe, "start", _s.InstallDir, AppendLog); var uninstallScriptPath = InstallerHelpers.WriteWebUninstallScript(_s.InstallDir, _s.ServiceName); var displayIconPath = InstallerHelpers.WriteInstalledDisplayIcon(_s.InstallDir, "VigiSensysWeb", Application.ExecutablePath) ?? winswExe; InstallerHelpers.WriteRegistryInfo(_s.InstallDir, string.Empty, _s.ServiceName, displayIconPath, uninstallScriptPath);
            SetStatus("Etat : installation terminée avec succès"); AppendLog("[OK] Installation terminée."); MessageBox.Show("Installation du site terminée. Vérifiez le service Windows si nécessaire.", "Installation terminée", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
        catch (Exception ex) { SetStatus("Etat : installation en erreur"); AppendLog("[ERROR] " + ex.Message); MessageBox.Show(ex.Message, "Installation impossible", MessageBoxButtons.OK, MessageBoxIcon.Error); }
        finally { _running = false; Go(_tabs.SelectedIndex); _close.Enabled = true; }
    }

    private void SetStatus(string text) { if (InvokeRequired) { BeginInvoke(new Action<string>(SetStatus), text); return; } _status.Text = text; }
    private void AppendLog(string line) { if (InvokeRequired) { BeginInvoke(new Action<string>(AppendLog), line); return; } _log.AppendText(line + Environment.NewLine); }

    private sealed class Settings
    {
        public string InstallDir, ServiceName, Port, WebsiteBaseUrl, AppBaseUrl, DbProvider, DbHost, DbPort, DbUser, DbPassword, DbMain, DbMeasure, DbChat, CacheTtl, LogsDir, LicensePath, PublicKeyPath, AgentPrivateKeyPath, AgentPort, AgentTimeoutMs, AgentActiveWindowMinutes, HotlineServerHost, HotlineServerPort, HotlineServerTimeoutMs, HotlineAccessTokenTtl, HotlineRefreshTokenTtl, EmailTimezone, AllowedDevOrigins, CspConnectSrc, DispatchSecret;
        public static Settings Default() { var pd = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData); const string p = "3000"; return new Settings { InstallDir = Path.Combine(pd, @"VigiSensys\website"), ServiceName = "VigiSensysWeb", Port = p, WebsiteBaseUrl = $"http://127.0.0.1:{p}/", AppBaseUrl = $"http://127.0.0.1:{p}/", DbProvider = "mysql", DbHost = "127.0.0.1", DbPort = "3306", DbUser = "root", DbPassword = string.Empty, DbMain = "vigi_main", DbMeasure = "vigi_mesures", DbChat = "vigi_chat", CacheTtl = "30", LogsDir = Path.Combine(pd, @"VigiSensys\web-logs"), LicensePath = Path.Combine(pd, @"VigiSensys\licenses\license.vtlic"), PublicKeyPath = Path.Combine(pd, @"VigiSensys\license_keys\public_key.pem"), AgentPrivateKeyPath = Path.Combine(pd, @"VigiSensys\license_keys\agent_secret_private.pem"), AgentPort = "8000", AgentTimeoutMs = "1500", AgentActiveWindowMinutes = "15", HotlineServerHost = "127.0.0.1", HotlineServerPort = "5310", HotlineServerTimeoutMs = "10000", HotlineAccessTokenTtl = "15", HotlineRefreshTokenTtl = "120", EmailTimezone = "Europe/Paris", AllowedDevOrigins = string.Empty, CspConnectSrc = "http://127.0.0.1:8000,http://localhost:8000", DispatchSecret = string.Empty }; }
    }
}
