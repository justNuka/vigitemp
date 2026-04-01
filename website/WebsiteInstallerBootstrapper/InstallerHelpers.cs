using System;
using System.Diagnostics;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Windows.Forms;
using Microsoft.Win32;

namespace VigitempWebInstaller;

internal static class InstallerHelpers
{
    public static string PromptText(IWin32Window owner, string title, string label, string defaultValue = "", bool password = false)
    {
        using var form = new Form();
        form.Text = title;
        form.Width = 560;
        form.Height = 180;
        form.StartPosition = FormStartPosition.CenterParent;
        form.FormBorderStyle = FormBorderStyle.FixedDialog;
        form.MaximizeBox = false;
        form.MinimizeBox = false;

        var lbl = new Label { Left = 16, Top = 16, Width = 500, Text = label };
        var tb = new TextBox { Left = 16, Top = 44, Width = 510, Text = defaultValue ?? string.Empty, UseSystemPasswordChar = password };
        var ok = new Button { Text = "OK", Left = 350, Width = 80, Top = 82, DialogResult = DialogResult.OK };
        var cancel = new Button { Text = "Annuler", Left = 446, Width = 80, Top = 82, DialogResult = DialogResult.Cancel };
        form.Controls.AddRange(new Control[] { lbl, tb, ok, cancel });
        form.AcceptButton = ok;
        form.CancelButton = cancel;
        return form.ShowDialog(owner) == DialogResult.OK ? tb.Text.Trim() : null;
    }

    public static string PromptFile(IWin32Window owner, string title, string filter, string initialPath = "")
    {
        using var dialog = new OpenFileDialog { Title = title, Filter = filter };
        if (!string.IsNullOrWhiteSpace(initialPath))
        {
            try
            {
                dialog.InitialDirectory = Path.GetDirectoryName(initialPath);
                dialog.FileName = Path.GetFileName(initialPath);
            }
            catch { }
        }
        return dialog.ShowDialog(owner) == DialogResult.OK ? dialog.FileName : null;
    }

    public static string GenerateSecret(int byteLength = 32)
    {
        var bytes = new byte[byteLength];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    public static void CopyDirectory(string sourceDir, string destDir)
    {
        var normalizedSource = Path.GetFullPath(sourceDir)
            .TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        var normalizedDest = Path.GetFullPath(destDir)
            .TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);

        Directory.CreateDirectory(normalizedDest);

        foreach (var dir in Directory.GetDirectories(normalizedSource, "*", SearchOption.AllDirectories))
        {
            var relative = Path.GetRelativePath(normalizedSource, dir);
            Directory.CreateDirectory(Path.Combine(normalizedDest, relative));
        }

        foreach (var file in Directory.GetFiles(normalizedSource, "*", SearchOption.AllDirectories))
        {
            var relative = Path.GetRelativePath(normalizedSource, file);
            var target = Path.Combine(normalizedDest, relative);
            var parent = Path.GetDirectoryName(target);
            if (!string.IsNullOrWhiteSpace(parent))
            {
                Directory.CreateDirectory(parent);
            }
            File.Copy(file, target, true);
        }
    }

    public static int RunProcess(string fileName, string arguments, string workingDirectory, Action<string> log)
    {
        var psi = new ProcessStartInfo
        {
            FileName = fileName,
            Arguments = arguments,
            WorkingDirectory = workingDirectory,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true,
            StandardOutputEncoding = Encoding.UTF8,
            StandardErrorEncoding = Encoding.UTF8,
        };
        using var process = new Process { StartInfo = psi };
        process.OutputDataReceived += (_, e) => { if (!string.IsNullOrEmpty(e.Data)) log(e.Data); };
        process.ErrorDataReceived += (_, e) => { if (!string.IsNullOrEmpty(e.Data)) log("[ERR] " + e.Data); };
        process.Start();
        process.BeginOutputReadLine();
        process.BeginErrorReadLine();
        process.WaitForExit();
        return process.ExitCode;
    }

    public static string FindNodeOnPath()
    {
        try
        {
            var psi = new ProcessStartInfo
            {
                FileName = "where.exe",
                Arguments = "node",
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true,
                StandardOutputEncoding = Encoding.UTF8,
            };
            using var process = Process.Start(psi);
            if (process == null) return null;
            var output = process.StandardOutput.ReadToEnd();
            process.WaitForExit();
            if (process.ExitCode == 0)
            {
                foreach (var line in output.Split(new[] { "\r\n", "\n" }, StringSplitOptions.RemoveEmptyEntries))
                {
                    if (File.Exists(line.Trim())) return line.Trim();
                }
            }
        }
        catch { }
        return null;
    }

    public static bool ServiceExists(string serviceName)
    {
        return RunProcess("sc.exe", $"query \"{serviceName}\"", Environment.SystemDirectory, _ => { }) == 0;
    }

    public static void RemoveService(string serviceName, string winswExe, Action<string> log)
    {
        if (File.Exists(winswExe))
        {
            RunProcess(winswExe, "stop", Path.GetDirectoryName(winswExe) ?? Environment.CurrentDirectory, log);
            RunProcess(winswExe, "uninstall", Path.GetDirectoryName(winswExe) ?? Environment.CurrentDirectory, log);
        }
        else
        {
            RunProcess("sc.exe", $"stop \"{serviceName}\"", Environment.SystemDirectory, log);
            RunProcess("sc.exe", $"delete \"{serviceName}\"", Environment.SystemDirectory, log);
        }
        System.Threading.Thread.Sleep(1500);
    }

    public static void WriteRegistryInfo(string installPath, string version)
    {
        using var key = Registry.LocalMachine.CreateSubKey(@"SOFTWARE\Vigitemp\Web");
        key?.SetValue("InstallPath", installPath, RegistryValueKind.String);
        key?.SetValue("Version", version ?? string.Empty, RegistryValueKind.String);
        key?.SetValue("LastInstalledUtc", DateTime.UtcNow.ToString("o"), RegistryValueKind.String);
    }
}
