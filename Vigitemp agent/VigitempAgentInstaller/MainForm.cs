using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Security;
using System.Windows.Forms;
using System.Xml;

namespace VigitempAgentInstaller
{
    public partial class MainForm : Form
    {
        private const string AgentExeName = "Vigitemp Agent.exe";
        private const string ConfigFileName = "Vigitemp Agent.exe.config";
        private const string DefaultSiteUrlTemplate = "http://{0}:3000";
        private const int HttpPort = 8000;
        private const string FirewallRuleIn = "Vigitemp Agent inbound";
        private const string FirewallRuleOut = "Vigitemp Agent outbound";
        private readonly string _payloadDir;
        private bool _autoSiteUrl = true;
        private bool _updatingSiteUrl;

        public MainForm()
        {
            InitializeComponent();
            _payloadDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "payload");
            installPathTextBox.Text = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData),
                "Vigitemp",
                "agent");
            autoStartCheckBox.Checked = true;
            launchCheckBox.Checked = true;
        }

        private void OnBrowseInstallPath(object sender, EventArgs e)
        {
            using (var dialog = new FolderBrowserDialog())
            {
                dialog.Description = "Select the installation folder";
                dialog.SelectedPath = installPathTextBox.Text;
                if (dialog.ShowDialog(this) == DialogResult.OK && !string.IsNullOrWhiteSpace(dialog.SelectedPath))
                {
                    installPathTextBox.Text = dialog.SelectedPath;
                }
            }
        }

        private void OnServerIpChanged(object sender, EventArgs e)
        {
            if (!_autoSiteUrl)
            {
                return;
            }

            var ip = serverIpTextBox.Text.Trim();
            if (string.IsNullOrWhiteSpace(ip))
            {
                SetSiteUrlText(string.Empty);
                return;
            }

            SetSiteUrlText(string.Format(DefaultSiteUrlTemplate, ip));
        }

        private void OnSiteUrlChanged(object sender, EventArgs e)
        {
            if (_updatingSiteUrl)
            {
                return;
            }
            _autoSiteUrl = false;
        }

        private void OnInstallClick(object sender, EventArgs e)
        {
            installButton.Enabled = false;
            try
            {
                RunInstall();
                MessageBox.Show(this, "Installation complete.", "Vigitemp Agent Installer",
                    MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                Log("ERROR: " + ex.Message);
                MessageBox.Show(this, ex.Message, "Installation failed",
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                installButton.Enabled = true;
            }
        }

        private void RunInstall()
        {
            var serverIp = serverIpTextBox.Text.Trim();
            var siteUrl = siteUrlTextBox.Text.Trim();
            var installDir = installPathTextBox.Text.Trim();

            if (string.IsNullOrWhiteSpace(installDir))
            {
                throw new InvalidOperationException("Install path is required.");
            }

            if (!Directory.Exists(_payloadDir))
            {
                throw new DirectoryNotFoundException("Payload folder not found: " + _payloadDir);
            }

            var payloadExe = Path.Combine(_payloadDir, AgentExeName);
            if (!File.Exists(payloadExe))
            {
                throw new FileNotFoundException("Agent executable not found in payload.", payloadExe);
            }

            Log("Copying files to " + installDir);
            CopyDirectory(_payloadDir, installDir);

            if (!string.IsNullOrWhiteSpace(siteUrl))
            {
                Log("Updating config for site URL.");
                UpdateAppConfig(Path.Combine(installDir, ConfigFileName), siteUrl);
            }

            Log("Configuring URL ACL for port " + HttpPort);
            RunNetsh("http delete urlacl url=\"http://+:" + HttpPort + "/\"", true);
            RunNetsh("http add urlacl url=\"http://+:" + HttpPort + "/\" sddl=\"D:(A;;GX;;;WD)\"", false);

            if (!string.IsNullOrWhiteSpace(serverIp))
            {
                Log("Configuring firewall rules for server IP " + serverIp);
                ConfigureFirewall(serverIp);
            }
            else
            {
                Log("Server IP is empty, skipping firewall rules.");
            }

            if (autoStartCheckBox.Checked)
            {
                Log("Enabling autostart.");
                ConfigureAutoStart(installDir, true);
            }
            else
            {
                ConfigureAutoStart(installDir, false);
            }

            if (launchCheckBox.Checked)
            {
                Log("Starting agent.");
                StartAgent(installDir);
            }
        }

        private static void CopyDirectory(string sourceDir, string targetDir)
        {
            Directory.CreateDirectory(targetDir);
            foreach (var file in Directory.GetFiles(sourceDir))
            {
                var name = Path.GetFileName(file);
                var dest = Path.Combine(targetDir, name);
                File.Copy(file, dest, true);
            }

            foreach (var directory in Directory.GetDirectories(sourceDir))
            {
                var name = Path.GetFileName(directory);
                var dest = Path.Combine(targetDir, name);
                CopyDirectory(directory, dest);
            }
        }

        private static void UpdateAppConfig(string configPath, string siteUrl)
        {
            if (!File.Exists(configPath))
            {
                return;
            }

            var doc = new XmlDocument();
            doc.Load(configPath);

            var appSettings = doc.SelectSingleNode("/configuration/appSettings");
            if (appSettings == null)
            {
                appSettings = doc.CreateElement("appSettings");
                doc.DocumentElement?.AppendChild(appSettings);
            }

            var node = appSettings.SelectSingleNode("add[@key='VigitempSiteWebUrl']") as XmlElement;
            if (node == null)
            {
                node = doc.CreateElement("add");
                node.SetAttribute("key", "VigitempSiteWebUrl");
                appSettings.AppendChild(node);
            }

            node.SetAttribute("value", siteUrl);
            doc.Save(configPath);
        }

        private void SetSiteUrlText(string value)
        {
            _updatingSiteUrl = true;
            siteUrlTextBox.Text = value;
            _updatingSiteUrl = false;
        }

        private void ConfigureFirewall(string serverIp)
        {
            if (IPAddress.TryParse(serverIp, out _) == false)
            {
                Log("Server IP is not a valid IPv4 address. Firewall rules skipped.");
                return;
            }

            RunNetsh("advfirewall firewall delete rule name=\"" + FirewallRuleIn + "\"", true);
            RunNetsh("advfirewall firewall delete rule name=\"" + FirewallRuleOut + "\"", true);
            RunNetsh("advfirewall firewall add rule name=\"" + FirewallRuleIn + "\" dir=in action=allow protocol=ANY remoteip=" + serverIp, false);
            RunNetsh("advfirewall firewall add rule name=\"" + FirewallRuleOut + "\" dir=out action=allow protocol=ANY remoteip=" + serverIp, false);
        }

        private void ConfigureAutoStart(string installDir, bool enabled)
        {
            var exePath = Path.Combine(installDir, AgentExeName);
            var regPath = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Run";
            var name = "VigitempAgent";

            try
            {
                using (var key = Microsoft.Win32.Registry.LocalMachine.OpenSubKey(regPath, true))
                {
                    if (key != null)
                    {
                        if (enabled)
                        {
                            key.SetValue(name, "\"" + exePath + "\"");
                        }
                        else
                        {
                            key.DeleteValue(name, false);
                        }
                        return;
                    }
                }
            }
            catch (SecurityException)
            {
                Log("HKLM autostart failed. Falling back to HKCU.");
            }
            catch (UnauthorizedAccessException)
            {
                Log("HKLM autostart failed. Falling back to HKCU.");
            }

            using (var key = Microsoft.Win32.Registry.CurrentUser.OpenSubKey(regPath, true))
            {
                if (key == null)
                {
                    return;
                }

                if (enabled)
                {
                    key.SetValue(name, "\"" + exePath + "\"");
                }
                else
                {
                    key.DeleteValue(name, false);
                }
            }
        }

        private static void StartAgent(string installDir)
        {
            var exePath = Path.Combine(installDir, AgentExeName);
            if (!File.Exists(exePath))
            {
                return;
            }

            var info = new ProcessStartInfo
            {
                FileName = exePath,
                WorkingDirectory = installDir,
                UseShellExecute = false
            };
            Process.Start(info);
        }

        private void RunNetsh(string args, bool ignoreErrors)
        {
            var info = new ProcessStartInfo
            {
                FileName = "netsh",
                Arguments = args,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };

            using (var process = Process.Start(info))
            {
                if (process == null)
                {
                    throw new InvalidOperationException("Failed to start netsh.");
                }
                process.WaitForExit();
                var output = process.StandardOutput.ReadToEnd();
                var error = process.StandardError.ReadToEnd();

                if (!string.IsNullOrWhiteSpace(output))
                {
                    Log(output.Trim());
                }
                if (!string.IsNullOrWhiteSpace(error))
                {
                    Log(error.Trim());
                }

                if (!ignoreErrors && process.ExitCode != 0)
                {
                    throw new InvalidOperationException("netsh failed: " + args);
                }
            }
        }

        private void Log(string message)
        {
            if (InvokeRequired)
            {
                BeginInvoke(new Action<string>(Log), message);
                return;
            }

            var line = "[" + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + "] " + message;
            logTextBox.AppendText(line + Environment.NewLine);
        }
    }
}
