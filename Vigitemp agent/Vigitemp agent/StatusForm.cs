using System;
using System.Diagnostics;
using System.Drawing;
using System.Windows.Forms;
using VigitempAgent.Properties;

namespace VigitempAgent
{
    internal sealed class StatusForm : Form
    {
        private readonly Func<string> _getSiteWebUrl;

        private readonly Label _statusValue = new Label();
        private readonly Label _userValue = new Label();
        private readonly Label _expiryValue = new Label();
        private readonly Label _urlValue = new Label();
        private readonly Label _versionValue = new Label();
        private readonly Timer _refreshTimer = new Timer();

        public StatusForm(Func<string> getSiteWebUrl)
        {
            _getSiteWebUrl = getSiteWebUrl;

            Text = "Vigitemp Agent";
            Icon = Resources.AppIcon;
            StartPosition = FormStartPosition.CenterScreen;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = false;
            ShowInTaskbar = true;
            ClientSize = new Size(420, 236);

            var root = new TableLayoutPanel
            {
                Dock = DockStyle.Fill,
                Padding = new Padding(12),
                ColumnCount = 2,
                RowCount = 6,
            };
            root.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 140));
            root.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
            for (var i = 0; i < 5; i++)
            {
                root.RowStyles.Add(new RowStyle(SizeType.Absolute, 28));
            }
            root.RowStyles.Add(new RowStyle(SizeType.Percent, 100));

            var statusLabel = new Label { Text = "Etat:", Dock = DockStyle.Fill, TextAlign = ContentAlignment.MiddleLeft };
            var userLabel = new Label { Text = "Utilisateur:", Dock = DockStyle.Fill, TextAlign = ContentAlignment.MiddleLeft };
            var expiryLabel = new Label { Text = "Expiration:", Dock = DockStyle.Fill, TextAlign = ContentAlignment.MiddleLeft };
            var urlLabel = new Label { Text = "Portail:", Dock = DockStyle.Fill, TextAlign = ContentAlignment.MiddleLeft };
            var versionLabel = new Label { Text = "Version:", Dock = DockStyle.Fill, TextAlign = ContentAlignment.MiddleLeft };

            ConfigureValueLabel(_statusValue);
            ConfigureValueLabel(_userValue);
            ConfigureValueLabel(_expiryValue);
            ConfigureValueLabel(_urlValue);
            ConfigureValueLabel(_versionValue);

            _urlValue.AutoEllipsis = true;

            root.Controls.Add(statusLabel, 0, 0);
            root.Controls.Add(_statusValue, 1, 0);
            root.Controls.Add(userLabel, 0, 1);
            root.Controls.Add(_userValue, 1, 1);
            root.Controls.Add(expiryLabel, 0, 2);
            root.Controls.Add(_expiryValue, 1, 2);
            root.Controls.Add(urlLabel, 0, 3);
            root.Controls.Add(_urlValue, 1, 3);
            root.Controls.Add(versionLabel, 0, 4);
            root.Controls.Add(_versionValue, 1, 4);

            var buttons = new FlowLayoutPanel
            {
                Dock = DockStyle.Fill,
                FlowDirection = FlowDirection.RightToLeft,
                WrapContents = false,
                Padding = new Padding(0, 12, 0, 0),
            };

            var closeBtn = new Button { Text = "Fermer", AutoSize = true };
            closeBtn.Click += (_, __) => Hide();

            var refreshBtn = new Button { Text = "Actualiser", AutoSize = true };
            refreshBtn.Click += (_, __) => RefreshStatus();

            buttons.Controls.Add(closeBtn);
            buttons.Controls.Add(refreshBtn);

            root.Controls.Add(buttons, 0, 5);
            root.SetColumnSpan(buttons, 2);

            Controls.Add(root);

            _refreshTimer.Interval = 3000;
            _refreshTimer.Tick += (_, __) => RefreshStatus();

            FormClosing += (_, e) =>
            {
                e.Cancel = true;
                Hide();
            };

            Shown += (_, __) =>
            {
                RefreshStatus();
                _refreshTimer.Start();
            };

            VisibleChanged += (_, __) =>
            {
                if (Visible) _refreshTimer.Start();
                else _refreshTimer.Stop();
            };

            FormClosed += (_, __) => _refreshTimer.Dispose();
        }

        private static void ConfigureValueLabel(Label label)
        {
            label.Dock = DockStyle.Fill;
            label.TextAlign = ContentAlignment.MiddleLeft;
            label.Font = new Font(SystemFonts.MessageBoxFont, FontStyle.Bold);
        }

        public void RefreshStatus()
        {
            try
            {
                var url = (_getSiteWebUrl?.Invoke() ?? "").Trim();
                _urlValue.Text = string.IsNullOrWhiteSpace(url) ? "-" : url;

                var connected = SessionStore.HasValidSession();
                var session = SessionStore.Get();

                _statusValue.Text = connected ? "Connecte" : "Deconnecte";
                _statusValue.ForeColor = connected ? Color.FromArgb(0, 140, 70) : Color.FromArgb(200, 120, 0);

                _userValue.Text = connected
                    ? (!string.IsNullOrWhiteSpace(session?.Username) ? session.Username : (!string.IsNullOrWhiteSpace(session?.UserId) ? session.UserId : "-"))
                    : "-";

                var version = FileVersionInfo.GetVersionInfo(Application.ExecutablePath).ProductVersion;
                _versionValue.Text = string.IsNullOrWhiteSpace(version) ? Application.ProductVersion : version;

                if (connected && session?.ExpiresAtUtc.HasValue == true)
                {
                    var remaining = session.ExpiresAtUtc.Value - DateTime.UtcNow;
                    if (remaining <= TimeSpan.Zero)
                    {
                        _expiryValue.Text = "Expire";
                    }
                    else
                    {
                        _expiryValue.Text = $"{session.ExpiresAtUtc.Value:yyyy-MM-dd HH:mm} UTC";
                    }
                }
                else
                {
                    _expiryValue.Text = "-";
                }
            }
            catch (Exception ex)
            {
                AgentLog.Error("StatusForm.RefreshStatus failed.", ex);
            }
        }
    }
}
