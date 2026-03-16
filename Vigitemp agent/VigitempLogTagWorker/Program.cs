using System;

namespace VigitempLogTagWorker
{
    internal static class Program
    {
        [STAThread]
        private static int Main(string[] args)
        {
            return VigilogWorkerRunner.Run(args);
        }
    }
}
