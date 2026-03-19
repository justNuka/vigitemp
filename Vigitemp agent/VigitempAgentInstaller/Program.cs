using System;
using System.Windows.Forms;

namespace VigitempAgentInstaller
{
    internal static class Program
    {
        [STAThread]
        private static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            var uninstallMode = args != null && Array.Exists(args, arg =>
                string.Equals(arg, "/uninstall", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(arg, "-uninstall", StringComparison.OrdinalIgnoreCase));
            Application.Run(new MainForm(uninstallMode));
        }
    }
}
