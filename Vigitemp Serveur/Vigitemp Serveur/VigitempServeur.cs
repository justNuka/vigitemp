using System;
using System.Diagnostics;
using System.Collections.Generic;
using System.Linq;
using System.ServiceProcess;
using System.Threading;
using System.Timers;
using System.IO;
using System.Windows.Forms;

namespace Vigitemp_Serveur
{
    public partial class VigitempServeur : ServiceBase
    {
        //private NotifyIcon trayIcon;
        public static EventLog eventLog1;
        public static int nombres_interrogations;
        public static int nombres_reponses;
        public static StreamWriter w = File.AppendText(@"C:\Users\User\Desktop\log.txt");
        private static readonly object _lock = new object();
        private System.Timers.Timer _timer;
        List<Thread> m_threads = new List<Thread>();
        List<CancellationTokenSource> m_cancellationsTokens = new List<CancellationTokenSource>();
        List<int> m_idServeurs = new List<int>();
        ThreadServeur m_threadServeur;
        Thread m_thread;
        public VigitempServeur()
        {
            InitializeComponent();
            eventLog1 = new EventLog();

            this.CanHandlePowerEvent = true;

            if (!EventLog.SourceExists("Vigitemp"))
            {
                EventLog.CreateEventSource("Vigitemp", "New Vigitemp Serveur");
            }
            eventLog1.Source = "Vigitemp";
            eventLog1.Log = "New Vigitemp Serveur";

            //trayIcon = new NotifyIcon()
            //{
            //    Text = "Vigitemp Serveur",
            //    Icon = Properties.Resources.AppIcon,
            //    ContextMenuStrip = new ContextMenuStrip()
            //    {
            //        Items = { new ToolStripMenuItem("Exit", null, Exit) }
            //    },
            //    Visible = true
            //};
        }

        void Exit(object sender, EventArgs e)
        {
            //trayIcon.Visible = false;
            List<int> tmp_idServeurs = m_idServeurs.ToList();
            foreach (int IdServeur in m_idServeurs)
            {
                int indexOfIdServeur = tmp_idServeurs.IndexOf(IdServeur);
                m_cancellationsTokens[indexOfIdServeur].Cancel();
                m_threads.RemoveAt(indexOfIdServeur);
                tmp_idServeurs.RemoveAt(indexOfIdServeur);
            }
            Application.Exit();
        }

        public static void Log(string logMessage)
        {
            lock (_lock)
            {
                //ecriture dans event viewer
                eventLog1.WriteEntry(logMessage);
                //ecriture dans un fichier log
                w.Write("\r\nLog Entry : ");
                w.WriteLine($"{DateTime.Now.ToLongTimeString()} {DateTime.Now.ToLongDateString()}");
                w.WriteLine("  :");
                w.WriteLine($"  :{logMessage}");
                w.WriteLine("-------------------------------");
                //ecriture dans la console
                Console.WriteLine(logMessage);
                Trace.WriteLine(logMessage);
            }
        }

        protected override void OnStart(string[] args)
        {
            VigitempServeur.Log("Demarrage du service Vigitemp");
            AppContext.SetSwitch("Switch.System.Threading.UseNetCoreTimer", true);
            Database db = new Database();

            Thread.Sleep(2000);

            CancellationTokenSource cts;
            List<int> arr_serveurs = db.getDistinctIdServeur();
            foreach (int IdServeur in arr_serveurs)
            {
                cts = new CancellationTokenSource();
                m_threadServeur = new ThreadServeur(cts.Token, IdServeur);
                m_thread = new Thread(new ThreadStart(m_threadServeur.Start));
                m_thread.IsBackground = true;
                m_thread.Start();
                m_threads.Add(m_thread);
                m_cancellationsTokens.Add(cts);
                m_idServeurs.Add(IdServeur);
            }

            _timer = new System.Timers.Timer(60000);//timer de 1 minutes
                                                    //Set action associated to each tick
            _timer.Elapsed += Process;
            //Start the timer
            _timer.Start();
        }

        protected override void OnStop()
        {
            VigitempServeur.Log("Arrêt du service Vigitemp");
            List<int> tmp_idServeurs = m_idServeurs.ToList();
            foreach (int IdServeur in m_idServeurs)
            {
                int indexOfIdServeur = tmp_idServeurs.IndexOf(IdServeur);
                m_cancellationsTokens[indexOfIdServeur].Cancel();
            }

            foreach (Thread IdServeur in m_threads)
            {
                if (IdServeur.IsAlive)
                {
                    IdServeur.Abort();
                }
            }



        }

        protected void Process(object sender, ElapsedEventArgs eventArgs)
        {
            // Console.WriteLine("Guid: "+systemi());
            CancellationTokenSource cts;
            Database db = new Database();
            List<int> arr_serveurs = db.getDistinctIdServeur();
            List<int> tmp_idServeurs = m_idServeurs.ToList();
            //ajout de potentiel nouveau serveur créé depuis le lancement du service
            foreach (int IdServeur in arr_serveurs)
            {
                if (!tmp_idServeurs.Contains(IdServeur))
                {
                    cts = new CancellationTokenSource();
                    m_threadServeur = new ThreadServeur(cts.Token, IdServeur);
                    m_thread = new Thread(new ThreadStart(m_threadServeur.Start));
                    m_thread.IsBackground = true;
                    m_thread.Start();
                    m_threads.Add(m_thread);
                    m_cancellationsTokens.Add(cts);
                    tmp_idServeurs.Add(IdServeur);
                }
            }


            //suppression des serveur qui ne sont plus utilisés par les sondes
            foreach (int IdServeur in m_idServeurs)
            {
                if (!arr_serveurs.Contains(IdServeur))
                {
                    int indexOfIdServeur = tmp_idServeurs.IndexOf(IdServeur);
                    m_cancellationsTokens[indexOfIdServeur].Cancel();
                    m_threads.RemoveAt(indexOfIdServeur);
                    tmp_idServeurs.RemoveAt(indexOfIdServeur);
                }
            }
            m_idServeurs = tmp_idServeurs;
        }

        protected override void OnShutdown()
        {
            VigitempServeur.Log("OnShutdown");
            base.OnShutdown();
            List<int> tmp_idServeurs = m_idServeurs.ToList();
            foreach (int IdServeur in m_idServeurs)
            {
                int indexOfIdServeur = tmp_idServeurs.IndexOf(IdServeur);
                m_cancellationsTokens[indexOfIdServeur].Cancel();
                m_threads.RemoveAt(indexOfIdServeur);
                tmp_idServeurs.RemoveAt(indexOfIdServeur);
            }
            Application.Exit();
        }

        protected override bool OnPowerEvent(PowerBroadcastStatus powerStatus)
        {
            VigitempServeur.Log("changement de powerstatus à (avant postpone) " + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"));
            
            VigitempServeur.Log("changement de powerstatus à (apres postpone) " + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss.fff"));
            VigitempServeur.Log("Changement de powerStatus(object): "+powerStatus + "\n" +
                                "Changement de powerStatus(toString): " + powerStatus.ToString() + "\n" +
                                "Changement de powerStatus(GetType): " + powerStatus.GetType() + "\n" +
                                "Changement de powerStatus(GetTypeCode): " + powerStatus.GetTypeCode() + "\n" +
                                "Hasflag de powerStatus(BatteryLow): " + powerStatus.HasFlag(PowerBroadcastStatus.BatteryLow) + "\n" +
                                "Hasflag de powerStatus(Suspend): " + powerStatus.HasFlag(PowerBroadcastStatus.Suspend) + "\n" +
                                "Hasflag de powerStatus(ResumeSuspend): " + powerStatus.HasFlag(PowerBroadcastStatus.ResumeSuspend) + "\n" +
                                "Hasflag de powerStatus(QuerySuspend): " + powerStatus.HasFlag(PowerBroadcastStatus.QuerySuspend) + "\n" 
                                );  
            if (powerStatus.HasFlag(PowerBroadcastStatus.QuerySuspend))
            {
                VigitempServeur.Log("Service need to stop");
                //this.RequestAdditionalTime(10000); // ne marche pas, dans les logs on dirait que ça stop la fonction, il ne se passe rien apres cette ligne
                //OnStop();
                Application.Exit();
                //this.RequestAdditionalTime(10000);
            }

            //if (powerStatus.HasFlag(PowerBroadcastStatus.ResumeSuspend))
            //{
            //    VigitempServeur.Log("Service need to start");
            //    OnStart(null);
            //}

            return base.OnPowerEvent(powerStatus);
        }
    }
}
