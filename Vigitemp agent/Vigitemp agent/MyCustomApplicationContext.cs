using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using System.Windows.Forms;
using VigitempAgent.Properties;

namespace VigitempAgent
{
    public class MyCustomApplicationContext : ApplicationContext
    {
        //public string IP_SERVEUR;
        //public string IP_CLIENT;
        public string SITEWEB_URL;
        private NotifyIcon trayIcon;
        private Timer sessionTimer;
        private DateTime lastNoSessionTipUtc = DateTime.MinValue;
        private DateTime lastExpiryTipUtc = DateTime.MinValue;
        public static Thread UIThread;
        public Thread serverThread;
        public Form_Alert frm;

        public MyCustomApplicationContext(string[] args)
        {

            


            //enregistrement dans la bdd
            Database database = new Database();
            // Ouverture de la connexion SQL
            //database.InitConnexion();

            Console.WriteLine(Environment.MachineName);
            database.addPCtoDBClientsList(GetLocalIPAddress(), Environment.MachineName);

            database.InitConnexion();
            SITEWEB_URL = database.getWebsiteURL();
            //IP_SERVEUR = database.getServerIp();
            //IP_CLIENT = GetLocalIPAddress();

            frm = new Form_Alert(SITEWEB_URL);
            frm.Show();
            frm.Hide();

            SessionStore.Load();

            // Fermeture de la connexion
            database.CloseConnexion();

            trayIcon = new NotifyIcon()
            {
                Text = "Vigitemp Agent",
                Icon = Resources.AppIcon,
                ContextMenuStrip = new ContextMenuStrip()
                {
                    Items =
                    {
                        new ToolStripMenuItem("Ouvrir le portail", null, OpenPortal),
                        new ToolStripMenuItem("Exit", null, Exit),
                    }
                },
                Visible = true
            };
            trayIcon.BalloonTipClicked += OpenPortal;
            Console.WriteLine(File.Exists("./texte.txt") ? "File exists." : "File does not exist.");

            if (args.Length > 0)
            {
                Console.WriteLine(args[0].ToString());
            }



            // Instanciation du thread, on spécifie dans le 
            // délégué ThreadStart le nom de la méthode qui
            // sera exécutée lorsque l'on appelle la méthode
            // Start() de notre thread.
            serverThread = new Thread(new ThreadStart(Start));

            // Lancement du thread
            serverThread.Start();

            UIThread = Thread.CurrentThread;

            sessionTimer = new Timer();
            sessionTimer.Interval = 60 * 1000;
            sessionTimer.Tick += (_, __) => CheckSessionAndNotify();
            sessionTimer.Start();

            CheckSessionAndNotify();

        }

        private string GetLoginUrl()
        {
            var baseUrl = (SITEWEB_URL ?? "").Trim();
            if (string.IsNullOrWhiteSpace(baseUrl))
            {
                return "http://127.0.0.1:3000/login";
            }

            return baseUrl.TrimEnd('/') + "/login";
        }

        private void OpenPortal(object sender, EventArgs e)
        {
            try
            {
                Process.Start(GetLoginUrl());
            }
            catch
            {
                // ignore
            }
        }

        private void ShowTrayTip(string title, string message, ToolTipIcon icon)
        {
            try
            {
                trayIcon.ShowBalloonTip(6000, title, message, icon);
            }
            catch
            {
                // ignore
            }
        }

        private void CheckSessionAndNotify()
        {
            var connected = SessionStore.HasValidSession();
            var session = SessionStore.Get();

            if (!connected)
            {
                trayIcon.Text = "Vigitemp Agent (déconnecté)";

                if (DateTime.UtcNow - lastNoSessionTipUtc > TimeSpan.FromHours(4))
                {
                    lastNoSessionTipUtc = DateTime.UtcNow;
                    ShowTrayTip(
                        "Connexion requise",
                        "Connectez-vous sur le portail Vigitemp pour recevoir les alarmes sur ce poste.",
                        ToolTipIcon.Info
                    );
                }

                return;
            }

            trayIcon.Text = "Vigitemp Agent";

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
        }

        public static string GetLocalIPAddress()
        {
            var host = Dns.GetHostEntry(Dns.GetHostName());
            foreach (var ip in host.AddressList)
            {
                if (ip.AddressFamily == AddressFamily.InterNetwork)
                {
                    Console.WriteLine(ip);
                    return ip.ToString();
                }
            }
            throw new Exception("No network adapters with an IPv4 address in the system!");
        }


        void Start()
        {
            //try
            //{
            // Create a Http server and start listening for incoming connections
            HttpServer.listener = new HttpListener();
            HttpServer.listener.Prefixes.Add(HttpServer.url);
            HttpServer.listener.Prefixes.Add(HttpServer.url_localhost);
            HttpServer.listener.Start();
            Console.WriteLine("Listening for connections on {0}", HttpServer.url_localhost);

            // Handle requests
            Task listenTask = HttpServer.HandleIncomingConnections(frm);
            listenTask.GetAwaiter().GetResult();

            // Close the listener
            Console.WriteLine("Close on {0}", HttpServer.url_localhost);
            HttpServer.listener.Close();
            //}
            //catch (Exception e)
            //{
            //    MessageBox.Show(e.ToString(), null, MessageBoxButtons.OK);
            //    throw;
            //}

        }
        //public static void showNotif()
        //{
        //    MessageBox.Show("ALARM", null, MessageBoxButtons.OK);
        //    frm.showAlert("alarm");

        //}

        void Exit(object sender, EventArgs e)
        {
            trayIcon.Visible = false;
            if (sessionTimer != null)
            {
                sessionTimer.Stop();
                sessionTimer.Dispose();
                sessionTimer = null;
            }
            serverThread.Abort();
            serverThread.Join();
            Application.Exit();
        }
    }
}
