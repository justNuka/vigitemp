using System;
using System.IO;
using System.Net;
using System.Net.Sockets;
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

            // Fermeture de la connexion
            database.CloseConnexion();

            trayIcon = new NotifyIcon()
            {
                Text = "Vigitemp Agent",
                Icon = Resources.AppIcon,
                ContextMenuStrip = new ContextMenuStrip()
                {
                    Items = { new ToolStripMenuItem("Exit", null, Exit) }
                },
                Visible = true
            };
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
            //HttpServer.listener.Prefixes.Add(HttpServer.url_localhost);
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
            serverThread.Abort();
            serverThread.Join();
            Application.Exit();
        }
    }
}