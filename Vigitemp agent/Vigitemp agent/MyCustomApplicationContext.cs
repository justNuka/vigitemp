using System;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using System.Threading.Tasks;
using System.Net.Http;
using System.Text;
using System.Windows.Forms;
using VigitempAgent.Properties;

namespace VigitempAgent
{
    public class MyCustomApplicationContext : ApplicationContext
    {
        public static MyCustomApplicationContext Instance { get; private set; }
        public volatile string SITEWEB_URL;
        public volatile string AGENT_SECRET;
        private NotifyIcon trayIcon;
        private System.Windows.Forms.Timer sessionTimer;
        private DateTime lastNoSessionTipUtc = DateTime.MinValue;
        private DateTime lastExpiryTipUtc = DateTime.MinValue;
        private DateTime lastHeartbeatUtc = DateTime.MinValue;
        private string lastAlarmUrl;
        private NotificationTracking lastNotificationTracking;
        private bool lastNotificationClicked;
        public static Thread UIThread;
        public Thread serverThread;
        private volatile Form_Alert _frm;
        public Form_Alert frm
        {
            get { return _frm; }
            set { _frm = value; }
        }

        private StatusForm statusForm;
        private ToolStripMenuItem sessionStatusMenuItem;
        private LoopbackSessionServer loopbackSessionServer;
        private bool usingLoopbackSessionServerOnly;
        private static readonly HttpClient NotificationClient = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(3)
        };
        private static readonly TimeSpan HeartbeatInterval = TimeSpan.FromMinutes(5);
        private readonly object _notifLock = new object();

        private static (string url, bool explicitOverride) ResolveSiteWebUrl()
        {
            try
            {
                var env = Environment.GetEnvironmentVariable("VIGITEMP_SITEWEB_URL");
                if (!string.IsNullOrWhiteSpace(env))
                {
                    return (env.Trim(), true);
                }
            }
            catch
            {
                // ignore
            }

            try
            {
                var cfg =
                    ConfigurationManager.AppSettings["VigitempSiteWebUrl"] ??
                    ConfigurationManager.AppSettings["SITEWEB_URL"] ??
                    ConfigurationManager.AppSettings["SITE_WEB_URL"];

                if (!string.IsNullOrWhiteSpace(cfg))
                {
                    return (cfg.Trim(), true);
                }
            }
            catch
            {
                // ignore
            }

            return ("http://192.168.63.144:3000", false);
        }

        private static string ResolveAgentSecret()
        {
            try
            {
                var env = Environment.GetEnvironmentVariable("VIGITEMP_AGENT_SECRET");
                if (!string.IsNullOrWhiteSpace(env)) return env.Trim();
            }
            catch
            {
                // ignore
            }

            try
            {
                var cfg =
                    ConfigurationManager.AppSettings["VigitempAgentSecret"] ??
                    ConfigurationManager.AppSettings["VIGITEMP_AGENT_SECRET"];
                if (!string.IsNullOrWhiteSpace(cfg)) return cfg.Trim();
            }
            catch
            {
                // ignore
            }

            return null;
        }

        public MyCustomApplicationContext(string[] args)
        {
            Instance = this;
            var resolved = ResolveSiteWebUrl();
            SITEWEB_URL = resolved.url;
            AGENT_SECRET = ResolveAgentSecret();
            if (string.IsNullOrWhiteSpace(AGENT_SECRET))
            {
                try
                {
                    AgentSecretStore.Load();
                    AGENT_SECRET = AgentSecretStore.Get();
                }
                catch
                {
                    // ignore
                }
            }

            sessionStatusMenuItem = new ToolStripMenuItem("Statut: ...")
            {
                Enabled = false
            };

            trayIcon = new NotifyIcon
            {
                Text = "Vigitemp Agent",
                Icon = Resources.AppIcon,
                ContextMenuStrip = new ContextMenuStrip
                {
                    Items =
                    {
                        sessionStatusMenuItem,
                        new ToolStripSeparator(),
                        new ToolStripMenuItem("Ouvrir la fenêtre", null, OpenStatusWindow),
                        new ToolStripMenuItem("Ouvrir le portail", null, OpenPortal),
                        new ToolStripMenuItem("Relancer l'agent", null, RestartAgent),
                        new ToolStripSeparator(),
                        new ToolStripMenuItem("Quitter", null, Exit),
                    }
                },
                Visible = true
            };
            trayIcon.BalloonTipClicked += OnBalloonTipClicked;
            trayIcon.BalloonTipClosed += OnBalloonTipClosed;
            AgentLog.Info("Agent started.");

            try
            {
                // Enregistrement dans la BDD + récupération URL site web (optionnel)
                Database database = new Database();
                database.InitConnexion();
                database.addPCtoDBClientsList(GetLocalIPAddress(), Environment.MachineName);
                var url = database.getWebsiteURL();
                if (!resolved.explicitOverride && !string.IsNullOrWhiteSpace(url))
                {
                    SITEWEB_URL = url;
                }
                database.CloseConnexion();
            }
            catch (Exception ex)
            {
                AgentLog.Error("Database init failed; using configured SITEWEB_URL.", ex);
            }

            try
            {
                frm = new Form_Alert(SITEWEB_URL);
                frm.Show();
                frm.Hide();
            }
            catch (Exception ex)
            {
                AgentLog.Error("Form_Alert init failed.", ex);
            }

            try
            {
                SessionStore.Load();
            }
            catch (Exception ex)
            {
                AgentLog.Error("SessionStore.Load failed.", ex);
            }

            serverThread = new Thread(Start) { IsBackground = true };
            serverThread.Start();

            UIThread = Thread.CurrentThread;

            sessionTimer = new System.Windows.Forms.Timer();
            sessionTimer.Interval = 60 * 1000;
            sessionTimer.Tick += (_, __) =>
            {
                try
                {
                    CheckSessionAndNotify();
                }
                catch (Exception ex)
                {
                    AgentLog.Error("CheckSessionAndNotify failed.", ex);
                }

                try
                {
                    _ = SendHeartbeatIfDueAsync();
                }
                catch (Exception ex)
                {
                    AgentLog.Error("SendHeartbeatIfDueAsync scheduling failed.", ex);
                }
            };
            sessionTimer.Start();

            try
            {
                CheckSessionAndNotify();
            }
            catch (Exception ex)
            {
                AgentLog.Error("Initial CheckSessionAndNotify failed.", ex);
            }

            try
            {
                _ = SendHeartbeatIfDueAsync(force: true);
            }
            catch (Exception ex)
            {
                AgentLog.Error("Initial SendHeartbeatIfDueAsync scheduling failed.", ex);
            }

            try
            {
                Task.Run(async () =>
                {
                    await Task.Delay(2500).ConfigureAwait(false);
                    ShowInstallSummaryIfNeeded();
                });
            }
            catch (Exception ex)
            {
                AgentLog.Error("Schedule install summary failed.", ex);
            }
        }

        private void OpenStatusWindow(object sender, EventArgs e)
        {
            try
            {
                if (statusForm == null || statusForm.IsDisposed)
                {
                    statusForm = new StatusForm(() => SITEWEB_URL);
                }

                statusForm.RefreshStatus();
                statusForm.Show();
                statusForm.BringToFront();
                statusForm.Activate();
            }
            catch (Exception ex)
            {
                AgentLog.Error("OpenStatusWindow failed.", ex);
            }
        }

        private string GetLoginUrl()
        {
            var baseUrl = (SITEWEB_URL ?? "").Trim();
            if (string.IsNullOrWhiteSpace(baseUrl))
            {
                return "http://192.168.63.144:3000/login";
            }

            return baseUrl.TrimEnd('/') + "/login";
        }

        private void OpenPortal(object sender, EventArgs e)
        {
            string alarmUrl;
            lock (_notifLock)
            {
                alarmUrl = lastAlarmUrl;
            }

            try
            {
                var targetUrl = !string.IsNullOrWhiteSpace(alarmUrl) ? alarmUrl : GetLoginUrl();
                Process.Start(new ProcessStartInfo(targetUrl) { UseShellExecute = true });
            }
            catch (Exception ex)
            {
                AgentLog.Error("OpenPortal failed.", ex);
            }
        }

        private bool ShowTrayTip(string title, string message, ToolTipIcon icon)
        {
            try
            {
                trayIcon.ShowBalloonTip(6000, title, message, icon);
                return true;
            }
            catch
            {
                // ignore
                return false;
            }
        }

        public void ShowAlarmNotification(string title, string message, string alarmUrl, NotificationTracking tracking)
        {
            lock (_notifLock)
            {
                if (!string.IsNullOrWhiteSpace(alarmUrl))
                {
                    lastAlarmUrl = alarmUrl;
                }
                lastNotificationTracking = tracking;
                lastNotificationClicked = false;
            }

            var body = string.IsNullOrWhiteSpace(message)
                ? "Cliquez sur la notification pour vous rendre sur la page des alarmes."
                : message + Environment.NewLine + "Cliquez sur la notification pour vous rendre sur la page des alarmes.";

            var shown = ShowTrayTip(title ?? "Alarme Vigitemp", body, ToolTipIcon.Warning);
            if (tracking != null)
            {
                _ = SendNotificationEvent(tracking, shown ? "shown" : "error", shown ? null : "Affichage notification impossible");
            }
        }

        public void SetAgentSecret(string secret)
        {
            if (string.IsNullOrWhiteSpace(secret)) return;
            AGENT_SECRET = secret.Trim();
            try
            {
                AgentSecretStore.Save(AGENT_SECRET);
            }
            catch
            {
                // ignore
            }
        }

        private void OnBalloonTipClicked(object sender, EventArgs e)
        {
            NotificationTracking tracking;
            lock (_notifLock)
            {
                lastNotificationClicked = true;
                tracking = lastNotificationTracking;
            }

            try
            {
                if (tracking != null)
                {
                    _ = SendNotificationEvent(tracking, "clicked", null);
                }
            }
            catch
            {
                // ignore
            }

            OpenPortal(sender, e);
        }

        private void OnBalloonTipClosed(object sender, EventArgs e)
        {
            NotificationTracking tracking;
            bool clicked;
            lock (_notifLock)
            {
                clicked = lastNotificationClicked;
                tracking = lastNotificationTracking;
                lastNotificationClicked = false;
            }

            try
            {
                if (!clicked && tracking != null)
                {
                    _ = SendNotificationEvent(tracking, "closed", null);
                }
            }
            catch
            {
                // ignore
            }
        }

        private static string JsonEscape(string value)
        {
            if (value == null) return "";
            return value.Replace("\\", "\\\\").Replace("\"", "\\\"");
        }

        private async Task SendNotificationEvent(NotificationTracking tracking, string eventType, string eventData)
        {
            if (tracking == null) return;
            if (tracking.DeliveryId == null && string.IsNullOrWhiteSpace(tracking.CorrelationId)) return;

            var baseUrl = (SITEWEB_URL ?? "").Trim();
            if (string.IsNullOrWhiteSpace(baseUrl)) return;

            var endpoint = baseUrl.TrimEnd('/') + "/api/notifications/agent-event";
            var payload = "{" +
                         "\"deliveryId\":" + (tracking.DeliveryId.HasValue ? tracking.DeliveryId.Value.ToString() : "null") + "," +
                         "\"correlationId\":\"" + JsonEscape(tracking.CorrelationId ?? "") + "\"," +
                         "\"eventType\":\"" + JsonEscape(eventType ?? "") + "\"," +
                         "\"eventData\":\"" + JsonEscape(eventData ?? "") + "\"," +
                         "\"alarmId\":" + (tracking.AlarmId.HasValue ? tracking.AlarmId.Value.ToString() : "null") + "," +
                         "\"lieuId\":" + (tracking.LieuId.HasValue ? tracking.LieuId.Value.ToString() : "null") + "," +
                         "\"machineName\":\"" + JsonEscape(Environment.MachineName) + "\"," +
                         "\"ip\":\"" + JsonEscape(GetLocalIPAddress()) + "\"" +
                         "}";

            try
            {
                var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
                {
                    Content = new StringContent(payload, Encoding.UTF8, "application/json")
                };

                if (!string.IsNullOrWhiteSpace(AGENT_SECRET))
                {
                    request.Headers.Add("x-vigitemp-agent-secret", AGENT_SECRET);
                }

                var response = await NotificationClient.SendAsync(request).ConfigureAwait(false);
                response.Dispose();
            }
            catch (Exception ex)
            {
                AgentLog.Error("SendNotificationEvent failed.", ex);
            }
        }

        private async Task SendHeartbeatIfDueAsync(bool force = false)
        {
            if (!SessionStore.HasValidSession()) return;
            if (string.IsNullOrWhiteSpace(SITEWEB_URL)) return;
            if (string.IsNullOrWhiteSpace(AGENT_SECRET)) return;

            var nowUtc = DateTime.UtcNow;
            if (!force && nowUtc - lastHeartbeatUtc < HeartbeatInterval)
            {
                return;
            }

            lastHeartbeatUtc = nowUtc;
            var session = SessionStore.Get();
            var endpoint = SITEWEB_URL.TrimEnd('/') + "/api/notifications/agent-heartbeat";
            var payload = "{" +
                         "\"machineName\":\"" + JsonEscape(Environment.MachineName) + "\"," +
                         "\"ip\":\"" + JsonEscape(GetLocalIPAddress()) + "\"," +
                         "\"userId\":\"" + JsonEscape(session != null ? session.UserId : null) + "\"," +
                         "\"username\":\"" + JsonEscape(session != null ? session.Username : null) + "\"" +
                         "}";

            try
            {
                var request = new HttpRequestMessage(HttpMethod.Post, endpoint)
                {
                    Content = new StringContent(payload, Encoding.UTF8, "application/json")
                };
                request.Headers.Add("x-vigitemp-agent-secret", AGENT_SECRET);

                var response = await NotificationClient.SendAsync(request).ConfigureAwait(false);
                if (!response.IsSuccessStatusCode)
                {
                    AgentLog.Error("Agent heartbeat failed with HTTP status " + (int)response.StatusCode + ".", null);
                }
                response.Dispose();
            }
            catch (Exception ex)
            {
                AgentLog.Error("SendHeartbeatIfDueAsync failed.", ex);
            }
        }

        private void CheckSessionAndNotify()
        {
            var connected = SessionStore.HasValidSession();
            var session = SessionStore.Get();

            if (!connected)
            {
                trayIcon.Text = "Vigitemp Agent (déconnecté)";
                if (sessionStatusMenuItem != null)
                {
                    sessionStatusMenuItem.Text = "Statut: déconnecté";
                }

                if (DateTime.UtcNow - lastNoSessionTipUtc > TimeSpan.FromHours(4))
                {
                    lastNoSessionTipUtc = DateTime.UtcNow;
                    ShowTrayTip(
                        "Connexion requise",
                        "Connectez-vous sur le portail Vigitemp pour recevoir les alarmes sur ce poste.",
                        ToolTipIcon.Info
                    );
                }

                try
                {
                    statusForm?.RefreshStatus();
                }
                catch
                {
                    // ignore
                }

                return;
            }

            trayIcon.Text = "Vigitemp Agent";
            if (sessionStatusMenuItem != null)
            {
                var who = !string.IsNullOrWhiteSpace(session?.Username)
                    ? session.Username
                    : (!string.IsNullOrWhiteSpace(session?.UserId) ? session.UserId : null);

                sessionStatusMenuItem.Text = who == null ? "Statut: connecté" : ("Statut: connecté (" + who + ")");
            }

            if (session != null && session.ExpiresAtUtc.HasValue)
            {
                var remaining = session.ExpiresAtUtc.Value - DateTime.UtcNow;
                if (remaining > TimeSpan.Zero && remaining <= TimeSpan.FromDays(7))
                {
                    if (DateTime.UtcNow - lastExpiryTipUtc > TimeSpan.FromHours(24))
                    {
                        lastExpiryTipUtc = DateTime.UtcNow;
                        var days = Math.Max(1, (int)Math.Ceiling(remaining.TotalDays));
                        ShowTrayTip(
                            "Connexion bientôt expirée",
                            "Votre connexion Vigitemp va expirer dans " + days + " jour(s). Pensez à vous reconnecter.",
                            ToolTipIcon.Warning
                        );
                    }
                }
            }

            try
            {
                statusForm?.RefreshStatus();
            }
            catch
            {
                // ignore
            }
        }

        public static string GetLocalIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    return ip.ToString();
                }
            }
            throw new Exception("No network adapters with an IPv4 address in the system!");
        }

        private static string GetInstallSummaryMarkerPath()
        {
            var folder = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                "VigitempAgent");
            Directory.CreateDirectory(folder);
            return Path.Combine(folder, "install-summary-shown.txt");
        }

        private static bool HasLoopbackUrlAcl()
        {
            try
            {
                var psi = new ProcessStartInfo
                {
                    FileName = "netsh",
                    Arguments = "http show urlacl",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using (var process = Process.Start(psi))
                {
                    if (process == null)
                    {
                        return false;
                    }

                    var output = process.StandardOutput.ReadToEnd();
                    process.WaitForExit(3000);
                    return output.IndexOf("http://127.0.0.1:8000/", StringComparison.OrdinalIgnoreCase) >= 0;
                }
            }
            catch
            {
                return false;
            }
        }

        private void ShowInstallSummaryIfNeeded()
        {
            try
            {
                var marker = GetInstallSummaryMarkerPath();
                if (File.Exists(marker))
                {
                    return;
                }

                var installPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory ?? "", "VigitempAgent.exe");
                var agentInstalled = File.Exists(installPath);
                var urlAclOk = HasLoopbackUrlAcl();
                var httpServerOk = HttpServer.listener != null && HttpServer.listener.IsListening;
                var localApiStatus = httpServerOk
                    ? "OK"
                    : (usingLoopbackSessionServerOnly ? "Mode degrade" : "ECHEC");

                var summary =
                    "Installation terminee." + Environment.NewLine + Environment.NewLine +
                    "Agent installe : " + (agentInstalled ? "OK" : "ECHEC") + Environment.NewLine +
                    "Reservation HTTP : " + (urlAclOk ? "OK" : "ECHEC") + Environment.NewLine +
                    "API locale : " + localApiStatus + Environment.NewLine + Environment.NewLine +
                    "Si l'icone Vigitemp n'apparait pas dans la zone de notification, fermez puis rouvrez votre session Windows.";

                File.WriteAllText(marker, DateTime.UtcNow.ToString("o"));

                if (trayIcon != null && trayIcon.Visible)
                {
                    trayIcon.ShowBalloonTip(8000, "Vigitemp Agent", summary, ToolTipIcon.Info);
                }

                MessageBox.Show(summary, "Vigitemp Agent", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
            catch (Exception ex)
            {
                AgentLog.Error("ShowInstallSummaryIfNeeded failed.", ex);
            }
        }

        private void Start()
        {
            try
            {
                try
                {
                    lock (HttpServer._listenerLock)
                    {
                        HttpServer.listener = new HttpListener();
                        HttpServer.listener.Prefixes.Add(HttpServer.url_localhost);
                        HttpServer.listener.Start();
                    }

                    AgentLog.Info("HttpServer listening: " + HttpServer.url_localhost);
                    var listenTask = HttpServer.HandleIncomingConnections(frm);
                    listenTask.GetAwaiter().GetResult();
                }
                catch (HttpListenerException ex) when (ex.ErrorCode == 5)
                {
                    // Access denied on HTTP.SYS (missing loopback URLACL). Keep only session API via TcpListener.
                    usingLoopbackSessionServerOnly = true;
                    AgentLog.Error("HttpServer access denied; starting LoopbackSessionServer only.", ex);
                    loopbackSessionServer = new LoopbackSessionServer(8000);
                    loopbackSessionServer.Start();

                    while (true)
                    {
                        try
                        {
                            Thread.Sleep(1000);
                        }
                        catch (ThreadInterruptedException)
                        {
                            AgentLog.Info("LoopbackSessionServer fallback loop interrupted (clean shutdown).");
                            return;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                AgentLog.Error("HttpServer thread crashed.", ex);
            }
        }

        private void Exit(object sender, EventArgs e)
        {
            Shutdown(relaunch: false);
        }

        private void RestartAgent(object sender, EventArgs e)
        {
            Shutdown(relaunch: true);
        }

        private void Shutdown(bool relaunch)
        {
            try
            {
                AgentLog.Info(relaunch ? "Shutdown requested (relaunch)." : "Shutdown requested.");
            }
            catch
            {
                // ignore
            }

            if (sessionTimer != null)
            {
                try
                {
                    sessionTimer.Stop();
                    sessionTimer.Dispose();
                }
                catch
                {
                    // ignore
                }
                sessionTimer = null;
            }

            try
            {
                lock (HttpServer._listenerLock)
                {
                    if (HttpServer.listener != null)
                    {
                        try { HttpServer.listener.Stop(); } catch { /* ignore */ }
                        try { HttpServer.listener.Close(); } catch { /* ignore */ }
                        HttpServer.listener = null;
                    }
                }
            }
            catch
            {
                // ignore
            }

            try
            {
                loopbackSessionServer?.Stop();
            }
            catch
            {
                // ignore
            }

            try
            {
                if (serverThread != null && serverThread.IsAlive)
                {
                    if (!serverThread.Join(1500))
                    {
                        try { serverThread.Interrupt(); } catch { /* ignore */ }
                    }
                }
            }
            catch
            {
                // ignore
            }

            if (relaunch)
            {
                try
                {
                    var exePath = Application.ExecutablePath;
                    Process.Start(new ProcessStartInfo(exePath) { UseShellExecute = true });
                }
                catch (Exception ex)
                {
                    AgentLog.Error("Failed to relaunch agent.", ex);
                }
            }

            try
            {
                trayIcon.Visible = false;
                trayIcon.Dispose();
            }
            catch
            {
                // ignore
            }

            try
            {
                statusForm?.Dispose();
            }
            catch
            {
                // ignore
            }

            try
            {
                ExitThread();
            }
            catch
            {
                // ignore
            }

            try
            {
                Application.ExitThread();
            }
            catch
            {
                // ignore
            }

            Environment.Exit(0);
        }
    }
}
