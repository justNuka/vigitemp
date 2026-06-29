using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Text;
using System.Runtime.InteropServices;
using System.Text.RegularExpressions;
using System.Drawing.Drawing2D;
using System.Security.Cryptography;
using System.Windows.Forms;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Encodings;
using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Signers;
using Org.BouncyCastle.OpenSsl;
using Org.BouncyCastle.Security;

namespace Vigitemp_License_Generator
{
    public sealed class MainForm : Form
    {
        [DllImport("user32.dll", CharSet = CharSet.Unicode)]
        private static extern IntPtr SendMessage(IntPtr hWnd, int msg, IntPtr wParam, string lParam);

        private const int EM_SETCUEBANNER = 0x1501;
        private const string DefaultHotlineUsername = "mc2-hotline";
        private const string DefaultHotlinePassword = "Vigi106*";
        private const string DefaultHotlineSlug = "mc2-hotline";

        private readonly TextBox _txtCustomerId;
        private readonly ComboBox _cmbEdition;
        private readonly ComboBox _cmbPackSensorLimit;
        private readonly TextBox _txtPackSensorLimitManual;
        private readonly ComboBox _cmbConcurrent;
        private readonly CheckedListBox _clbOptions;
        private readonly TextBox _txtInstancePublicKey;
        private readonly TextBox _txtAgentSecretPublicKey;
        private readonly TextBox _txtAgentSecretPrivateKeyPath;
        private readonly Button _btnGenerateAgentSecretKeys;
        private readonly Button _btnLoadAgentSecretPublicKey;
        private readonly Button _btnCopyAgentSecretPublicKey;
        private readonly TextBox _txtHotlineSlug;
        private readonly TextBox _txtHotlineLogin;
        private readonly TextBox _txtHotlinePassword;
        private readonly TextBox _txtHotlinePasswordConfirm;
        private readonly Button _btnToggleHotlinePassword;
        private readonly Button _btnToggleHotlinePasswordConfirm;
        private bool _hotlinePasswordVisible;
        private readonly CheckBox _chkHasExpiry;
        private readonly DateTimePicker _dtpExpiresAt;
        private readonly TextBox _txtLicenseId;
        private readonly TextBox _txtLicenseToken;
        private readonly TextBox _txtPublicKey;
        private readonly Label _lblKeyStatus;
        private readonly ToolTip _toolTip;
        private string _lastGeneratedHotlineLogin;
        private string _lastGeneratedHotlinePassword;
        private string _lastGeneratedLicensePayloadJson;
        private string _lastGeneratedLicenseToken;
        private bool _licenseRecapPendingDownload;

        private AsymmetricKeyParameter _privateKey;

        private readonly string _keysFolder;
        private readonly string _privateKeyPath;
        private readonly string _publicKeyPath;
        private readonly string _agentSecretPrivateKeyPath;
        private readonly string _agentSecretPublicKeyPath;

        public MainForm()
        {
            Text = "Vigitemp License Generator";
            StartPosition = FormStartPosition.CenterScreen;
            MinimumSize = new Size(900, 700);

            _keysFolder = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "license_keys");
            _privateKeyPath = Path.Combine(_keysFolder, "private_key.pem");
            _publicKeyPath = Path.Combine(_keysFolder, "public_key.pem");
            _agentSecretPrivateKeyPath = Path.Combine(_keysFolder, "agent_secret_private.pem");
            _agentSecretPublicKeyPath = Path.Combine(_keysFolder, "agent_secret_public.pem");

            _toolTip = new ToolTip
            {
                AutoPopDelay = 12000,
                InitialDelay = 400,
                ReshowDelay = 200,
                ShowAlways = true
            };

            FormClosing += MainForm_FormClosing;

            var scrollPanel = new Panel
            {
                Dock = DockStyle.Fill,
                AutoScroll = true,
                Padding = new Padding(12),
            };

            var root = new FlowLayoutPanel
            {
                Dock = DockStyle.Top,
                AutoSize = true,
                AutoSizeMode = AutoSizeMode.GrowAndShrink,
                FlowDirection = FlowDirection.TopDown,
                WrapContents = false,
            };

            scrollPanel.Controls.Add(root);
            Controls.Add(scrollPanel);

            scrollPanel.Resize += (s, e) =>
            {
                var width = Math.Max(0, scrollPanel.ClientSize.Width - scrollPanel.Padding.Horizontal - 20);
                root.MaximumSize = new Size(width, 0);
                foreach (Control child in root.Controls)
                {
                    child.Width = Math.Max(0, width - root.Padding.Horizontal);
                }
            };

            var inputGroup = CreateGroup("Inputs");
            AddGroup(root, inputGroup);

            var inputTable = CreateTable(2);
            inputGroup.Controls.Add(inputTable);

            _txtCustomerId = new TextBox { Width = 240 };
            SetCueBanner(_txtCustomerId, "X9999999");
            AddRowWithInfo(
                inputTable,
                "Numéro client",
                _txtCustomerId,
                "Format requis : X9999999 (lettre X + 7 chiffres).\nExemple : X1234567.\nRemplacer l'exemple par le vrai numéro client."
            );

            _cmbEdition = new ComboBox { DropDownStyle = ComboBoxStyle.DropDownList, Width = 240 };
            _cmbEdition.Items.AddRange(new object[] { "pack", "one", "standard", "expert" });
            _cmbEdition.SelectedIndex = 0;
            AddRowWithInfo(
                inputTable,
                "Type licence",
                _cmbEdition,
                "Pack : licence de base avec limite de sondes.\nOne : fonctions essentielles + offset/ajustage.\nStandard : ajout métrologie avancée.\nExpert : environnement complet MC2."
            );


            var packLimitPanel = new FlowLayoutPanel { FlowDirection = FlowDirection.LeftToRight, AutoSize = true };
            _cmbPackSensorLimit = new ComboBox { DropDownStyle = ComboBoxStyle.DropDownList, Width = 120 };
            _cmbPackSensorLimit.Items.AddRange(new object[] { "5", "10", "15", "20", "25", "manuel" });
            _cmbPackSensorLimit.SelectedIndex = 0;
            _txtPackSensorLimitManual = new TextBox { Width = 100, Enabled = false };
            SetCueBanner(_txtPackSensorLimitManual, "ex: 12");
            _cmbPackSensorLimit.SelectedIndexChanged += (s, e) =>
            {
                _txtPackSensorLimitManual.Enabled =
                    string.Equals(_cmbPackSensorLimit.SelectedItem.ToString(), "manuel", StringComparison.OrdinalIgnoreCase);
                RefreshEditionDependentControls();
            };
            _cmbEdition.SelectedIndexChanged += (s, e) => RefreshEditionDependentControls();
            packLimitPanel.Controls.Add(_cmbPackSensorLimit);
            packLimitPanel.Controls.Add(_txtPackSensorLimitManual);
            AddRowWithInfo(
                inputTable,
                "Limite sondes (Pack)",
                packLimitPanel,
                "Applicable uniquement à la licence Pack.\nValeurs rapides : 5, 10, 15, 20, 25 ou saisie manuelle (>0)."
            );
            RefreshEditionDependentControls();
            _cmbConcurrent = new ComboBox { DropDownStyle = ComboBoxStyle.DropDownList, Width = 240 };
            _cmbConcurrent.Items.AddRange(new object[] { "5", "10", "25", "illimité" });
            _cmbConcurrent.SelectedIndex = 0;
            AddRowWithInfo(
                inputTable,
                "Accès simultanés",
                _cmbConcurrent,
                "Nombre d'utilisateurs connectés en même temps.\n\"illimité\" = pas de limite."
            );

            _clbOptions = new CheckedListBox
            {
                Height = 80,
                Width = 300,
                CheckOnClick = true
            };
            _clbOptions.Items.AddRange(new object[] { "telephonie", "mail", "options_futures" });
            AddRowWithInfo(
                inputTable,
                "Options",
                _clbOptions,
                "Options additionnelles activées selon contrat (téléphonie, mail, etc.)."
            );

            var hotlineGroup = CreateGroup("Hotline");
            AddGroup(root, hotlineGroup);

            var hotlineTable = CreateTable(2);
            hotlineGroup.Controls.Add(hotlineTable);

            _txtHotlineSlug = new TextBox { Width = 240, Text = DefaultHotlineSlug };
            AddRowWithInfo(
                hotlineTable,
                "Hotline slug",
                _txtHotlineSlug,
                "Segment URL du portail hotline (ex: /fr/hotline/<slug>/login)."
            );

            _txtHotlineLogin = new TextBox { Width = 240, Text = DefaultHotlineUsername };
            AddRowWithInfo(
                hotlineTable,
                "Hotline login",
                _txtHotlineLogin,
                "Identifiant pour le portail hotline."
            );

            var hotlinePasswordPanel = new FlowLayoutPanel { FlowDirection = FlowDirection.LeftToRight, AutoSize = true };
            _txtHotlinePassword = new TextBox { Width = 240, UseSystemPasswordChar = true, Text = DefaultHotlinePassword };
            _btnToggleHotlinePassword = CreateEyeButton();
            _btnToggleHotlinePassword.Click += (s, e) => ToggleHotlinePasswordVisibility();
            hotlinePasswordPanel.Controls.Add(_txtHotlinePassword);
            hotlinePasswordPanel.Controls.Add(_btnToggleHotlinePassword);
            AddRowWithInfo(
                hotlineTable,
                "Hotline mot de passe",
                hotlinePasswordPanel,
                "Mot de passe pour le portail hotline."
            );

            var hotlineConfirmPanel = new FlowLayoutPanel { FlowDirection = FlowDirection.LeftToRight, AutoSize = true };
            _txtHotlinePasswordConfirm = new TextBox { Width = 240, UseSystemPasswordChar = true, Text = DefaultHotlinePassword };
            _btnToggleHotlinePasswordConfirm = CreateEyeButton();
            _btnToggleHotlinePasswordConfirm.Click += (s, e) => ToggleHotlinePasswordVisibility();
            hotlineConfirmPanel.Controls.Add(_txtHotlinePasswordConfirm);
            hotlineConfirmPanel.Controls.Add(_btnToggleHotlinePasswordConfirm);
            AddRowWithInfo(
                hotlineTable,
                "Confirmation",
                hotlineConfirmPanel,
                "Confirmer le mot de passe hotline."
            );

            var hotlineWarningLabel = new Label
            {
                AutoSize = true,
                ForeColor = Color.Firebrick,
                MaximumSize = new Size(650, 0),
                Text = "Attention : si vous modifiez le mot de passe hotline, il ne pourra pas etre recupere. Notez-le dans un endroit securise."
            };
            AddRow(hotlineTable, "", hotlineWarningLabel);
            _txtInstancePublicKey = new TextBox { Width = 520, Multiline = true, Height = 80, ScrollBars = ScrollBars.Vertical };
            AddRowWithInfo(
                inputTable,
                "Clé publique instance (RSA)",
                _txtInstancePublicKey,
                "Clé publique RSA optionnelle pour lier la licence à une instance.\nLaisser vide si aucune liaison n'est requise."
            );

            _txtAgentSecretPublicKey = new TextBox { Width = 520, Multiline = true, Height = 80, ScrollBars = ScrollBars.Vertical };
            AddRowWithInfo(
                inputTable,
                "Clé publique secret agent (RSA)",
                _txtAgentSecretPublicKey,
                "Clé publique RSA du secret agent.\nGénérée via le bouton ci-dessous ou chargée depuis un fichier PEM."
            );

            var agentSecretKeyPanel = new FlowLayoutPanel { FlowDirection = FlowDirection.LeftToRight, AutoSize = true };
            _btnGenerateAgentSecretKeys = new Button { Text = "Générer paire RSA (secret agent)", AutoSize = true };
            _btnLoadAgentSecretPublicKey = new Button { Text = "Charger clé publique RSA", AutoSize = true };
            _btnCopyAgentSecretPublicKey = new Button { Text = "Copier clé publique RSA", AutoSize = true, Enabled = false };

            _btnGenerateAgentSecretKeys.Click += (s, e) => GenerateAgentSecretKeyPair();
            _btnLoadAgentSecretPublicKey.Click += (s, e) => LoadAgentSecretPublicKeyFromDialog();
            _btnCopyAgentSecretPublicKey.Click += (s, e) => CopyToClipboard(_txtAgentSecretPublicKey.Text, "Clé publique RSA copiée.");
            _txtAgentSecretPublicKey.TextChanged += (s, e) =>
            {
                _btnCopyAgentSecretPublicKey.Enabled = !string.IsNullOrWhiteSpace(_txtAgentSecretPublicKey.Text);
            };

            agentSecretKeyPanel.Controls.Add(_btnGenerateAgentSecretKeys);
            agentSecretKeyPanel.Controls.Add(_btnLoadAgentSecretPublicKey);
            agentSecretKeyPanel.Controls.Add(_btnCopyAgentSecretPublicKey);

            AddRowWithInfo(
                inputTable,
                "Secret agent (RSA)",
                agentSecretKeyPanel,
                "Génère une paire RSA dédiée au secret agent.\nLa clé publique est collée ci-dessus, la clé privée reste à déposer sur le serveur web."
            );

            _txtAgentSecretPrivateKeyPath = new TextBox { Width = 520, ReadOnly = true };
            _txtAgentSecretPrivateKeyPath.Text = _agentSecretPrivateKeyPath;
            AddRowWithInfo(
                inputTable,
                "Chemin clé privée RSA",
                _txtAgentSecretPrivateKeyPath,
                "Chemin oà¹ la clé privée RSA est enregistrée localement.\nÀ copier sur le serveur web (agent_secret_private.pem)."
            );

            var expiryPanel = new FlowLayoutPanel { FlowDirection = FlowDirection.LeftToRight, AutoSize = true };
            _chkHasExpiry = new CheckBox { Text = "Ajouter expiration", AutoSize = true };
            _dtpExpiresAt = new DateTimePicker { Enabled = false, Width = 240, Format = DateTimePickerFormat.Custom, CustomFormat = "dd/MM/yyyy" };
            _chkHasExpiry.CheckedChanged += (s, e) => _dtpExpiresAt.Enabled = _chkHasExpiry.Checked;
            expiryPanel.Controls.Add(_chkHasExpiry);
            expiryPanel.Controls.Add(_dtpExpiresAt);
            AddRowWithInfo(
                inputTable,
                "Expiration",
                expiryPanel,
                "Optionnel : date de fin de validité.\nDécochez pour une licence sans expiration."
            );

            var keyGroup = CreateGroup("Clé privée");
            AddGroup(root, keyGroup);

            var keyPanel = new FlowLayoutPanel { FlowDirection = FlowDirection.LeftToRight, AutoSize = true };
            _lblKeyStatus = new Label { AutoSize = true, Text = "Aucune clé chargée", Margin = new Padding(0, 8, 16, 8) };
            _toolTip.SetToolTip(_lblKeyStatus, "Aucune clé privée chargée.");
            var btnGenerateKeys = new Button { Text = "Générer paire de clés", AutoSize = true };
            var btnLoadKey = new Button { Text = "Charger clé privée", AutoSize = true };

            btnGenerateKeys.Click += (s, e) => GenerateKeyPair();
            btnLoadKey.Click += (s, e) => LoadPrivateKeyFromDialog();

            keyPanel.Controls.Add(_lblKeyStatus);
            keyPanel.Controls.Add(btnGenerateKeys);
            keyPanel.Controls.Add(btnLoadKey);
            keyGroup.Controls.Add(keyPanel);
            keyGroup.Controls.Add(CreateInfoLabel(
                "La clé privée signe les licences (Ed25519).\nElle doit rester secrète et ne jamais être envoyée au client.\nLa clé publique sert à vérifier la signature côté serveur."
            ));

            var publicKeyTable = CreateTable(2);
            keyGroup.Controls.Add(publicKeyTable);

            _txtPublicKey = new TextBox
            {
                Width = 520,
                Height = 120,
                Multiline = true,
                ScrollBars = ScrollBars.Vertical,
                ReadOnly = true
            };
            AddRowWithInfo(
                publicKeyTable,
                "Clé publique (PEM)",
                _txtPublicKey,
                "Clé publique à communiquer au serveur d'interrogation pour vérifier les licences.\nFormat PEM."
            );

            var btnCopyPublicKey = new Button { Text = "Copier clé publique", AutoSize = true, Enabled = false };
            btnCopyPublicKey.Click += (s, e) => CopyToClipboard(_txtPublicKey.Text, "Clé publique copiée.");
            _txtPublicKey.TextChanged += (s, e) => btnCopyPublicKey.Enabled = !string.IsNullOrWhiteSpace(_txtPublicKey.Text);
            AddRow(publicKeyTable, "", btnCopyPublicKey);

            var outputGroup = CreateGroup("Licence");
            AddGroup(root, outputGroup);

            var outputTable = CreateTable(2);
            outputGroup.Controls.Add(outputTable);

            _txtLicenseId = new TextBox { Width = 320, ReadOnly = true };
            AddRowWithInfo(
                outputTable,
                "Numéro licence",
                _txtLicenseId,
                "Identifiant lisible pour le client et le support (généré automatiquement)."
            );

            var btnGenerate = new Button { Text = "Générer licence", AutoSize = true };
            btnGenerate.Click += (s, e) => GenerateLicense();
            AddRow(outputTable, "", btnGenerate);

            _txtLicenseToken = new TextBox
            {
                Multiline = true,
                ScrollBars = ScrollBars.Vertical,
                Width = 760,
                Height = 220,
                ReadOnly = true
            };
            AddRowWithInfo(
                outputTable,
                "Token (license.vtlic)",
                _txtLicenseToken,
                "Token JWS signé (format compact).\nÀ fournir au client sous forme de fichier .vtlic.\nNe pas modifier manuellement."
            );

            var btnCopyToken = new Button { Text = "Copier token", AutoSize = true };
            btnCopyToken.Click += (s, e) => CopyToClipboard(_txtLicenseToken.Text, "Token copié.");
            AddRow(outputTable, "", btnCopyToken);

            var btnSave = new Button { Text = "Enregistrer .vtlic", AutoSize = true };
            btnSave.Click += (s, e) => SaveTokenToFile();
            AddRow(outputTable, "", btnSave);

            var btnSaveHotline = new Button { Text = "Exporter identifiants hotline (.txt)", AutoSize = true };
            btnSaveHotline.Click += (s, e) => SaveHotlineCredentialsToFile();
            AddRow(outputTable, "", btnSaveHotline);

            var btnSaveRecap = new Button { Text = "Exporter recap licence (.txt)", AutoSize = true };
            btnSaveRecap.Click += (s, e) => SaveLicenseRecapToFile();
            AddRow(outputTable, "", btnSaveRecap);

            RefreshEditionDependentControls();
            TryLoadDefaultKey();
        }

        private static void AddGroup(FlowLayoutPanel root, Control group)
        {
            group.Margin = new Padding(0, 0, 0, 12);
            group.Width = Math.Max(0, root.ClientSize.Width - root.Padding.Horizontal);
            root.Controls.Add(group);
        }

        private static GroupBox CreateGroup(string title)
        {
            return new GroupBox
            {
                Text = title,
                AutoSize = true,
                AutoSizeMode = AutoSizeMode.GrowAndShrink,
                Dock = DockStyle.Top,
                Padding = new Padding(10),
                Anchor = AnchorStyles.Left | AnchorStyles.Right | AnchorStyles.Top
            };
        }

        private static TableLayoutPanel CreateTable(int columns)
        {
            var table = new TableLayoutPanel
            {
                ColumnCount = columns,
                AutoSize = true,
                AutoSizeMode = AutoSizeMode.GrowAndShrink,
                Dock = DockStyle.Top,
                Anchor = AnchorStyles.Left | AnchorStyles.Right | AnchorStyles.Top,
                CellBorderStyle = TableLayoutPanelCellBorderStyle.None
            };
            table.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
            table.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100f));
            return table;
        }

        private static void AddRow(TableLayoutPanel table, string label, Control control)
        {
            var rowIndex = table.RowCount++;
            table.RowStyles.Add(new RowStyle(SizeType.AutoSize));

            if (!string.IsNullOrWhiteSpace(label))
            {
                var lbl = new Label
                {
                    Text = label,
                    AutoSize = true,
                    TextAlign = ContentAlignment.MiddleLeft,
                    Margin = new Padding(0, 6, 12, 6)
                };
                table.Controls.Add(lbl, 0, rowIndex);
            }
            else
            {
                table.Controls.Add(new Label { AutoSize = true }, 0, rowIndex);
            }

            if (control is TextBox || control is ComboBox || control is CheckedListBox || control is DateTimePicker || control is FlowLayoutPanel)
            {
                control.Dock = DockStyle.Fill;
                control.Anchor = AnchorStyles.Left | AnchorStyles.Right;
            }
            else
            {
                control.Anchor = AnchorStyles.Left | AnchorStyles.Right;
            }

            control.Margin = new Padding(0, 3, 0, 6);
            table.Controls.Add(control, 1, rowIndex);
        }

        private void TryLoadDefaultKey()
        {
            if (!File.Exists(_privateKeyPath))
            {
                UpdateKeyStatus(false);
                return;
            }

            try
            {
                _privateKey = LoadPrivateKey(_privateKeyPath);
                UpdateKeyStatus(true, _privateKeyPath);
                TryLoadPublicKeyForPrivate(_privateKeyPath);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Erreur lecture clé privée : {ex.Message}", "Key load error", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                UpdateKeyStatus(false);
            }
        }

        private void UpdateKeyStatus(bool ok, string path = null)
        {
            var resolvedPath = path ?? _privateKeyPath;
            _lblKeyStatus.Text = ok
                ? $"Clé privée chargée\n{resolvedPath}"
                : "Aucune clé chargée";
            _toolTip.SetToolTip(
                _lblKeyStatus,
                ok
                    ? $"Clé privée chargée depuis : {resolvedPath}"
                    : "Aucune clé privée chargée."
            );
        }

        private void GenerateKeyPair()
        {
            Directory.CreateDirectory(_keysFolder);

            var generator = new Ed25519KeyPairGenerator();
            generator.Init(new Ed25519KeyGenerationParameters(new SecureRandom()));
            var keyPair = generator.GenerateKeyPair();

            WritePrivateKey(_privateKeyPath, keyPair.Private);
            WritePublicKey(_publicKeyPath, keyPair.Public);

            _privateKey = keyPair.Private;
            UpdateKeyStatus(true, _privateKeyPath);
            if (!LoadPublicKeyFromFile(_publicKeyPath))
            {
                var derived = TryDerivePublicKeyPem(_privateKey);
                _txtPublicKey.Text = derived ?? string.Empty;
            }

            MessageBox.Show($"Clés générées :\n{_privateKeyPath}\n{_publicKeyPath}", "OK", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }

        private void LoadPrivateKeyFromDialog()
        {
            using (var dialog = new OpenFileDialog())
            {
                dialog.Title = "Charger clé privée";
                dialog.Filter = "PEM|*.pem|All files|*.*";
                if (dialog.ShowDialog(this) != DialogResult.OK) return;

                try
                {
                    _privateKey = LoadPrivateKey(dialog.FileName);
                    UpdateKeyStatus(true, dialog.FileName);
                    TryLoadPublicKeyForPrivate(dialog.FileName);
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Erreur lecture clé privée : {ex.Message}", "Key load error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }

        private static AsymmetricKeyParameter LoadPrivateKey(string path)
        {
            using (var reader = File.OpenText(path))
            {
                var pemReader = new PemReader(reader);
                var obj = pemReader.ReadObject();
                if (obj is AsymmetricCipherKeyPair pair) return pair.Private;
                if (obj is AsymmetricKeyParameter key && key.IsPrivate) return key;
                throw new InvalidOperationException("Clé privée invalide.");
            }
        }

        private static void WritePrivateKey(string path, AsymmetricKeyParameter privateKey)
        {
            using (var writer = new StreamWriter(path, false, Encoding.ASCII))
            {
                var pemWriter = new PemWriter(writer);
                pemWriter.WriteObject(privateKey);
            }
        }

        private static void WritePublicKey(string path, AsymmetricKeyParameter publicKey)
        {
            using (var writer = new StreamWriter(path, false, Encoding.ASCII))
            {
                var pemWriter = new PemWriter(writer);
                pemWriter.WriteObject(publicKey);
            }
        }

        private void GenerateLicense()
        {
            if (_privateKey == null)
            {
                MessageBox.Show("Aucune clé privée chargée.", "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            var customerId = _txtCustomerId.Text.Trim();
            if (!Regex.IsMatch(customerId, "^X\\d{7}$"))
            {
                MessageBox.Show("Format numéro client invalide (X9999999).", "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            var edition = (_cmbEdition.SelectedItem?.ToString() ?? "one").Trim().ToLowerInvariant();
            var concurrent = _cmbConcurrent.SelectedItem?.ToString() ?? "5";

            int? maxSensors = null;
            if (string.Equals(edition, "pack", StringComparison.OrdinalIgnoreCase))
            {
                var selectedPackLimit = (_cmbPackSensorLimit.SelectedItem?.ToString() ?? "").Trim().ToLowerInvariant();
                string limitRaw;
                if (selectedPackLimit == "manuel")
                {
                    limitRaw = _txtPackSensorLimitManual.Text.Trim();
                }
                else
                {
                    limitRaw = selectedPackLimit;
                }

                if (!int.TryParse(limitRaw, out var parsedLimit) || parsedLimit <= 0)
                {
                    MessageBox.Show("Limite de sondes Pack invalide (entier > 0 requis).", "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    return;
                }

                maxSensors = parsedLimit;
            }
            var options = new List<string>();
            foreach (var item in _clbOptions.CheckedItems)
            {
                var option = item.ToString();
                if (!string.Equals(edition, "pack", StringComparison.OrdinalIgnoreCase)
                    && string.Equals(option, "mail", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                options.Add(option);
            }

            var hotlineSlug = (_txtHotlineSlug.Text ?? string.Empty).Trim().ToLowerInvariant();
            var hotlineLogin = _txtHotlineLogin.Text.Trim();
            var hotlinePassword = _txtHotlinePassword.Text;
            var hotlineConfirm = _txtHotlinePasswordConfirm.Text;
            if (string.IsNullOrWhiteSpace(hotlineSlug) ||
                string.IsNullOrWhiteSpace(hotlineLogin) ||
                string.IsNullOrWhiteSpace(hotlinePassword) ||
                string.IsNullOrWhiteSpace(hotlineConfirm))
            {
                MessageBox.Show("Renseignez les identifiants hotline (slug/login/mot de passe).", "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            if (!Regex.IsMatch(hotlineSlug, "^[a-z0-9][a-z0-9-]{2,63}$"))
            {
                MessageBox.Show("Slug hotline invalide (a-z, 0-9, tiret, 3 a 64 caracteres).", "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            if (!string.Equals(hotlinePassword, hotlineConfirm, StringComparison.Ordinal))
            {
                MessageBox.Show("Les mots de passe hotline ne correspondent pas.", "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            _lastGeneratedHotlineLogin = hotlineLogin;
            _lastGeneratedHotlinePassword = hotlinePassword;

            var hotlinePasswordHash = HashHotlinePassword(hotlinePassword);
            var licenseId = $"VT-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N").Substring(0, 8).ToUpperInvariant()}";
            _txtLicenseId.Text = licenseId;

            var isPack = IsPackEdition();
            string agentSecret = null;

            var payload = new Dictionary<string, object>
            {
                { "licenseId", licenseId },
                { "customerId", customerId },
                { "edition", edition },
                { "concurrentAccess", concurrent == "illimité" ? "unlimited" : concurrent },
                { "options", options },
                { "issuedAt", DateTime.UtcNow.ToString("o") },
            };

            if (maxSensors.HasValue)
            {
                payload["maxSensors"] = maxSensors.Value;
            }

            if (!isPack)
            {
                agentSecret = GenerateAgentSecret();
                payload["agentSecret"] = agentSecret;
            }

            payload["hotline"] = new Dictionary<string, object>
            {
                { "enabled", true },
                { "slug", hotlineSlug },
                { "username", hotlineLogin },
                { "passwordHash", hotlinePasswordHash }
            };
            if (_chkHasExpiry.Checked)
            {
                payload["expiresAt"] = _dtpExpiresAt.Value.Date.ToUniversalTime().ToString("o");
            }

            var instanceKey = _txtInstancePublicKey.Text.Trim();
            if (!string.IsNullOrWhiteSpace(instanceKey))
            {
                payload["bind"] = new Dictionary<string, object>
                {
                    { "instancePublicKey", instanceKey }
                };
            }

            var agentSecretPublicKey = _txtAgentSecretPublicKey.Text.Trim();
            if (!isPack && string.IsNullOrWhiteSpace(agentSecretPublicKey))
            {
                MessageBox.Show("Clé publique du secret agent requise pour chiffrer le secret.", "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            if (!isPack)
            {
                payload["agentSecretEnc"] = new Dictionary<string, object>
                {
                    { "alg", "RSA-OAEP" },
                    { "value", EncryptAgentSecret(agentSecret, agentSecretPublicKey) }
                };
            }

            var header = new Dictionary<string, object>
            {
                { "alg", "EdDSA" },
                { "typ", "JWT" }
            };

            var headerJson = JsonConvert.SerializeObject(header, Formatting.None);
            var payloadJson = JsonConvert.SerializeObject(payload, Formatting.None, new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore
            });

            var headerPart = Base64UrlEncode(Encoding.UTF8.GetBytes(headerJson));
            var payloadPart = Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));
            var signingInput = $"{headerPart}.{payloadPart}";

            var signature = SignEd25519(_privateKey, Encoding.UTF8.GetBytes(signingInput));
            var signaturePart = Base64UrlEncode(signature);

            _txtLicenseToken.Text = $"{signingInput}.{signaturePart}";
            _lastGeneratedLicenseToken = _txtLicenseToken.Text;
            _lastGeneratedLicensePayloadJson = JsonConvert.SerializeObject(payload, Formatting.Indented, new JsonSerializerSettings
            {
                NullValueHandling = NullValueHandling.Ignore
            });
            _licenseRecapPendingDownload = true;

            MessageBox.Show(
                "Licence generee. Un recapitulatif va maintenant etre exporte.\nConservez-le dans un emplacement securise.",
                "Recapitulatif licence",
                MessageBoxButtons.OK,
                MessageBoxIcon.Information);
            SaveLicenseRecapToFile(true);
        }


        private bool IsPackEdition()
        {
            return string.Equals(_cmbEdition.SelectedItem?.ToString(), "pack", StringComparison.OrdinalIgnoreCase);
        }

        private void RefreshEditionDependentControls()
        {
            var isPack = IsPackEdition();
            _cmbPackSensorLimit.Enabled = isPack;
            _txtPackSensorLimitManual.Enabled =
                isPack && string.Equals(_cmbPackSensorLimit.SelectedItem?.ToString(), "manuel", StringComparison.OrdinalIgnoreCase);

            foreach (var control in new Control[]
            {
                _txtAgentSecretPublicKey,
                _txtAgentSecretPrivateKeyPath,
                _btnGenerateAgentSecretKeys,
                _btnLoadAgentSecretPublicKey,
                _btnCopyAgentSecretPublicKey
            })
            {
                if (control != null)
                {
                    control.Enabled = !isPack;
                }
            }

            if (_clbOptions == null)
            {
                return;
            }

            for (var index = 0; index < _clbOptions.Items.Count; index++)
            {
                var option = _clbOptions.Items[index]?.ToString();
                if (string.Equals(option, "mail", StringComparison.OrdinalIgnoreCase) && !isPack)
                {
                    _clbOptions.SetItemChecked(index, false);
                }
            }
        }
        private static byte[] SignEd25519(AsymmetricKeyParameter privateKey, byte[] data)
        {
            var signer = new Ed25519Signer();
            signer.Init(true, privateKey);
            signer.BlockUpdate(data, 0, data.Length);
            return signer.GenerateSignature();
        }

        private static string Base64UrlEncode(byte[] input)
        {
            return Convert.ToBase64String(input)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }

        private static string GenerateAgentSecret()
        {
            var bytes = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(bytes);
            }
            return Base64UrlEncode(bytes);
        }

        private static AsymmetricKeyParameter LoadPublicKeyFromPemString(string pem)
        {
            using (var reader = new StringReader(pem))
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

            throw new InvalidOperationException("Clé publique instance invalide (PEM attendu).");
        }

        private static string EncryptAgentSecret(string secret, string publicKeyPem)
        {
            var publicKey = LoadPublicKeyFromPemString(publicKeyPem);
            var cipher = new OaepEncoding(new RsaEngine());
            cipher.Init(true, publicKey);
            var input = Encoding.UTF8.GetBytes(secret ?? string.Empty);
            var encrypted = cipher.ProcessBlock(input, 0, input.Length);
            return Base64UrlEncode(encrypted);
        }

        private void GenerateAgentSecretKeyPair()
        {
            try
            {
                Directory.CreateDirectory(_keysFolder);

                var generator = new RsaKeyPairGenerator();
                generator.Init(new KeyGenerationParameters(new SecureRandom(), 2048));
                var keyPair = generator.GenerateKeyPair();

                WritePrivateKey(_agentSecretPrivateKeyPath, keyPair.Private);
                WritePublicKey(_agentSecretPublicKeyPath, keyPair.Public);

                _txtAgentSecretPublicKey.Text = File.ReadAllText(_agentSecretPublicKeyPath, Encoding.ASCII);
                _txtAgentSecretPrivateKeyPath.Text = _agentSecretPrivateKeyPath;

                MessageBox.Show(
                    "Paire RSA générée.\n- Clé publique copiée dans le champ.\n- Clé privée enregistrée sur disque.",
                    "OK",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information
                );
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Erreur génération RSA : {ex.Message}", "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void LoadAgentSecretPublicKeyFromDialog()
        {
            using (var dialog = new OpenFileDialog())
            {
                dialog.Title = "Charger clé publique RSA";
                dialog.Filter = "PEM|*.pem|All files|*.*";
                if (dialog.ShowDialog(this) != DialogResult.OK) return;

                try
                {
                    _txtAgentSecretPublicKey.Text = File.ReadAllText(dialog.FileName, Encoding.ASCII);
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Erreur lecture clé publique : {ex.Message}", "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }

        private void SaveTokenToFile()
        {
            if (string.IsNullOrWhiteSpace(_txtLicenseToken.Text))
            {
                MessageBox.Show("Aucun token généré.", "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            var defaultName = string.IsNullOrWhiteSpace(_txtLicenseId.Text)
                ? "license.vtlic"
                : $"{_txtLicenseId.Text}.vtlic";

            using (var dialog = new SaveFileDialog())
            {
                dialog.Title = "Enregistrer licence";
                dialog.Filter = "License|*.vtlic|All files|*.*";
                dialog.FileName = defaultName;
                if (dialog.ShowDialog(this) != DialogResult.OK) return;

                File.WriteAllText(dialog.FileName, _txtLicenseToken.Text, Encoding.UTF8);
                MessageBox.Show($"Licence enregistrée :\n{dialog.FileName}", "OK", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        private void SaveHotlineCredentialsToFile()
        {
            var login = _lastGeneratedHotlineLogin ?? _txtHotlineLogin.Text.Trim();
            var password = _lastGeneratedHotlinePassword ?? _txtHotlinePassword.Text;

            if (string.IsNullOrWhiteSpace(login) || string.IsNullOrWhiteSpace(password))
            {
                MessageBox.Show("Identifiants hotline indisponibles.", "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            var defaultName = string.IsNullOrWhiteSpace(_txtLicenseId.Text)
                ? "hotline_credentials.txt"
                : $"{_txtLicenseId.Text}_hotline_credentials.txt";

            using (var dialog = new SaveFileDialog())
            {
                dialog.Title = "Exporter identifiants hotline";
                dialog.Filter = "Text file|*.txt|All files|*.*";
                dialog.FileName = defaultName;
                if (dialog.ShowDialog(this) != DialogResult.OK) return;

                var content = new StringBuilder();
                content.AppendLine("Identifiants hotline");
                content.AppendLine("====================");
                content.AppendLine($"Licence: {_txtLicenseId.Text}");
                content.AppendLine($"Slug: {_txtHotlineSlug.Text.Trim().ToLowerInvariant()}");
                content.AppendLine($"Login: {login}");
                content.AppendLine($"Mot de passe: {password}");
                content.AppendLine();
                content.AppendLine("Attention: stockez ce fichier dans un emplacement securise.");

                File.WriteAllText(dialog.FileName, content.ToString(), Encoding.UTF8);
                MessageBox.Show($"Identifiants exportes :\n{dialog.FileName}", "OK", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        private void MainForm_FormClosing(object sender, FormClosingEventArgs e)
        {
            if (!_licenseRecapPendingDownload)
            {
                return;
            }

            MessageBox.Show(
                "Le recapitulatif licence n'a pas encore ete exporte.\nExportez-le avant de fermer l'application.",
                "Export recapitulatif requis",
                MessageBoxButtons.OK,
                MessageBoxIcon.Warning);

            SaveLicenseRecapToFile(true);
            if (_licenseRecapPendingDownload)
            {
                e.Cancel = true;
            }
        }

        private void SaveLicenseRecapToFile(bool required = false)
        {
            if (string.IsNullOrWhiteSpace(_lastGeneratedLicensePayloadJson))
            {
                MessageBox.Show("Aucune licence generee.", "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            var defaultName = string.IsNullOrWhiteSpace(_txtLicenseId.Text)
                ? "license_recap.txt"
                : $"{_txtLicenseId.Text}_recap.txt";

            using (var dialog = new SaveFileDialog())
            {
                dialog.Title = "Exporter recapitulatif licence";
                dialog.Filter = "Text file|*.txt|All files|*.*";
                dialog.FileName = defaultName;

                if (dialog.ShowDialog(this) != DialogResult.OK)
                {
                    if (required)
                    {
                        MessageBox.Show(
                            "Export annule. La fermeture restera bloquee tant que le recapitulatif n'est pas enregistre.",
                            "Export obligatoire",
                            MessageBoxButtons.OK,
                            MessageBoxIcon.Warning);
                    }
                    return;
                }

                var payload = JObject.Parse(_lastGeneratedLicensePayloadJson);
                var hotline = payload["hotline"] as JObject;
                var options = payload["options"] as JArray;

                var content = new StringBuilder();
                content.AppendLine("Recapitulatif licence Vigitemp");
                content.AppendLine("============================");
                content.AppendLine($"Date generation UTC: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}");
                content.AppendLine($"Licence ID: {payload.Value<string>("licenseId") ?? _txtLicenseId.Text}");
                content.AppendLine($"Client: {payload.Value<string>("customerId") ?? string.Empty}");
                content.AppendLine($"Edition: {payload.Value<string>("edition") ?? string.Empty}");
                content.AppendLine($"Concurrent access: {payload.Value<string>("concurrentAccess") ?? string.Empty}");
                content.AppendLine($"IssuedAt: {payload.Value<string>("issuedAt") ?? string.Empty}");
                content.AppendLine($"ExpiresAt: {payload.Value<string>("expiresAt") ?? "(none)"}");
                content.AppendLine($"Max sensors: {(payload["maxSensors"] != null ? payload["maxSensors"].ToString() : "(none)")}");
                content.AppendLine();

                content.AppendLine("Options:");
                if (options == null || options.Count == 0)
                {
                    content.AppendLine("- (none)");
                }
                else
                {
                    foreach (var option in options)
                    {
                        content.AppendLine("- " + option.ToString());
                    }
                }
                content.AppendLine();

                content.AppendLine("Hotline:");
                content.AppendLine($"- Username: {hotline?.Value<string>("username") ?? _lastGeneratedHotlineLogin ?? string.Empty}");
                content.AppendLine($"- Password (plain): {_lastGeneratedHotlinePassword ?? string.Empty}");
                content.AppendLine($"- Password hash: {hotline?.Value<string>("passwordHash") ?? string.Empty}");
                content.AppendLine($"- Slug: {hotline?.Value<string>("slug") ?? "(not set in license)"}");
                content.AppendLine();

                content.AppendLine("Technical:");
                content.AppendLine($"- Token generated: {!string.IsNullOrWhiteSpace(_lastGeneratedLicenseToken)}");
                content.AppendLine($"- Bind instance key present: {payload["bind"] != null}");
                content.AppendLine($"- Agent integration required: {!string.Equals(payload.Value<string>("edition"), "pack", StringComparison.OrdinalIgnoreCase)}");
                content.AppendLine($"- Agent secret encrypted present: {payload["agentSecretEnc"] != null}");
                content.AppendLine();
                content.AppendLine("WARNING: keep this file in a secure storage.");

                File.WriteAllText(dialog.FileName, content.ToString(), Encoding.UTF8);
                _licenseRecapPendingDownload = false;
                MessageBox.Show($"Recapitulatif exporte :\n{dialog.FileName}", "OK", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }

        private void TryLoadPublicKeyForPrivate(string privateKeyPath)
        {
            var folder = Path.GetDirectoryName(privateKeyPath);
            if (!string.IsNullOrWhiteSpace(folder))
            {
                var candidate = Path.Combine(folder, "public_key.pem");
                if (File.Exists(candidate))
                {
                    if (LoadPublicKeyFromFile(candidate))
                    {
                        return;
                    }
                }
            }

            var derived = TryDerivePublicKeyPem(_privateKey);
            if (!string.IsNullOrWhiteSpace(derived))
            {
                _txtPublicKey.Text = derived;
                return;
            }

            _txtPublicKey.Text = string.Empty;
        }

        private bool LoadPublicKeyFromFile(string path)
        {
            try
            {
                _txtPublicKey.Text = File.ReadAllText(path, Encoding.ASCII);
                return !string.IsNullOrWhiteSpace(_txtPublicKey.Text);
            }
            catch
            {
                _txtPublicKey.Text = string.Empty;
                return false;
            }
        }

        private static string TryDerivePublicKeyPem(AsymmetricKeyParameter privateKey)
        {
            if (privateKey is Ed25519PrivateKeyParameters edPrivate)
            {
                var publicKey = edPrivate.GeneratePublicKey();
                using (var writer = new StringWriter())
                {
                    var pemWriter = new PemWriter(writer);
                    pemWriter.WriteObject(publicKey);
                    return writer.ToString();
                }
            }

            return null;
        }

        private void CopyToClipboard(string text, string successMessage)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                MessageBox.Show("Aucune donnée à copier.", "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            try
            {
                Clipboard.SetText(text);
                MessageBox.Show(successMessage, "OK", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Erreur copie : {ex.Message}", "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void SetCueBanner(TextBox textBox, string cue)
        {
            if (textBox == null) return;
            SendMessage(textBox.Handle, EM_SETCUEBANNER, (IntPtr)1, cue);
        }

        private Control CreateInfoLabel(string message)
        {
            var icon = new PictureBox
            {
                Image = SystemIcons.Information.ToBitmap(),
                SizeMode = PictureBoxSizeMode.StretchImage,
                Size = new Size(16, 16),
                Cursor = Cursors.Hand,
                Margin = new Padding(6, 6, 0, 0)
            };
            _toolTip.SetToolTip(icon, message);
            return icon;
        }

        private Button CreateEyeButton()
        {
            var button = new Button
            {
                AutoSize = true,
                Width = 30,
                Height = 26,
                Image = CreateEyeIcon(false),
                FlatStyle = FlatStyle.Flat,
                Text = ""
            };
            button.FlatAppearance.BorderSize = 0;
            button.Margin = new Padding(4, 0, 0, 0);
            return button;
        }

        private static Image CreateEyeIcon(bool open)
        {
            var bmp = new Bitmap(16, 16);
            using (var g = Graphics.FromImage(bmp))
            using (var pen = new Pen(Color.DimGray, 1.4f))
            {
                g.Clear(Color.Transparent);
                g.SmoothingMode = SmoothingMode.AntiAlias;
                var rect = new Rectangle(1, 4, 14, 8);
                g.DrawEllipse(pen, rect);
                if (open)
                {
                    using (var brush = new SolidBrush(Color.DimGray))
                    {
                        g.FillEllipse(brush, 7, 7, 2, 2);
                    }
                }
                else
                {
                    g.DrawLine(pen, 3, 12, 13, 4);
                }
            }
            return bmp;
        }
        private void ToggleHotlinePasswordVisibility()
        {
            _hotlinePasswordVisible = !_hotlinePasswordVisible;
            var mask = !_hotlinePasswordVisible;
            _txtHotlinePassword.UseSystemPasswordChar = mask;
            _txtHotlinePasswordConfirm.UseSystemPasswordChar = mask;
            _btnToggleHotlinePassword.Image = CreateEyeIcon(_hotlinePasswordVisible);
            _btnToggleHotlinePasswordConfirm.Image = CreateEyeIcon(_hotlinePasswordVisible);
        }

        private static string HashHotlinePassword(string password)
        {
            const int saltSize = 16;
            const int keySize = 32;
            const int iterations = 100000;

            using (var rng = RandomNumberGenerator.Create())
            {
                var salt = new byte[saltSize];
                rng.GetBytes(salt);
                using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iterations, HashAlgorithmName.SHA256))
                {
                    var hash = pbkdf2.GetBytes(keySize);
                    return string.Format(
                        "PBKDF2{0}{1}{0}{2}{0}{3}",
                        "$",
                        iterations,
                        Convert.ToBase64String(salt),
                        Convert.ToBase64String(hash)
                    );
                }
            }
        }
        private void AddRowWithInfo(TableLayoutPanel table, string label, Control control, string infoMessage)
        {
            var rowIndex = table.RowCount++;
            table.RowStyles.Add(new RowStyle(SizeType.AutoSize));

            var labelPanel = new FlowLayoutPanel
            {
                AutoSize = true,
                FlowDirection = FlowDirection.LeftToRight,
                WrapContents = false
            };
            labelPanel.Controls.Add(new Label
            {
                Text = label,
                AutoSize = true,
                TextAlign = ContentAlignment.MiddleLeft,
                Margin = new Padding(0, 6, 4, 6)
            });
            labelPanel.Controls.Add(CreateInfoLabel(infoMessage));

            table.Controls.Add(labelPanel, 0, rowIndex);
            if (control is TextBox || control is ComboBox || control is CheckedListBox || control is DateTimePicker)
            {
                control.Dock = DockStyle.Fill;
                control.Anchor = AnchorStyles.Left | AnchorStyles.Right;
            }
            else
            {
                control.Anchor = AnchorStyles.Left | AnchorStyles.Right;
            }

            control.Margin = new Padding(0, 3, 0, 6);
            table.Controls.Add(control, 1, rowIndex);
        }
    }
}



