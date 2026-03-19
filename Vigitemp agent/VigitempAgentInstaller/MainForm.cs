using Microsoft.Win32;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Reflection;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace VigitempAgentInstaller
{
    public partial class MainForm : Form
    {
        private const string AgentExeName = "VigitempAgent.exe";
        private const string SetupExeName = "VigiSensysAgentSetup.exe";
        private const string AgentRunRegistryName = "VigitempAgent";
        private const string UninstallRegistryKeyName = @"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\VigiSensysAgent";
        private const string ProductDisplayName = "VigiSensys Agent";
        private const string ProductPublisher = "VigiSensys";
        private const int HttpPort = 8000;
        private const int MinimumStepDisplayMs = 700;

        private readonly string _installDirectory;
        private readonly InstallerMode _mode;
        private readonly List<InstallStepModel> _steps;
        private WizardPage _currentPage = WizardPage.Welcome;
        private bool _installationStarted;
        private bool _installationSucceeded;
        private bool _installationRunning;
        private string _workingDirectory;
        private string _agentExecutablePath;

        public MainForm(bool uninstallMode)
        {
            InitializeComponent();
            _installDirectory = ResolveInstallDirectory();
            _mode = uninstallMode ? InstallerMode.Uninstall : InstallerMode.Install;
            _steps = BuildSteps(_mode);
            BuildStepCards();
            ConfigurePageCopy();
            ShowPage(WizardPage.Welcome);
        }

        private static string ResolveInstallDirectory()
        {
            var programFilesX86 = Environment.GetEnvironmentVariable("ProgramFiles(x86)");
            if (!string.IsNullOrWhiteSpace(programFilesX86))
            {
                return Path.Combine(programFilesX86, "Vigitemp", "Agent");
            }

            return Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles),
                "Vigitemp",
                "Agent");
        }

        private static List<InstallStepModel> BuildSteps(InstallerMode mode)
        {
            if (mode == InstallerMode.Uninstall)
            {
                return new List<InstallStepModel>
                {
                    new InstallStepModel("prepare", "Preparation de la desinstallation", "Arret de l'agent existant avant suppression."),
                    new InstallStepModel("autostart", "Suppression du demarrage automatique", "Retrait de l'agent du lancement Windows."),
                    new InstallStepModel("urlacl", "Suppression de l'acces local", "Retrait de la reservation 127.0.0.1:8000."),
                    new InstallStepModel("uninstall-entry", "Suppression de l'entree Windows", "Retrait de l'application dans Applications installees."),
                    new InstallStepModel("files", "Suppression des fichiers", "Suppression du dossier d'installation de l'agent."),
                    new InstallStepModel("verify", "Verification finale", "Controle final de la desinstallation."),
                };
            }

            return new List<InstallStepModel>
            {
                new InstallStepModel("prepare", "Preparation du poste", "Arret de l'agent existant et extraction des ressources embarquees."),
                new InstallStepModel("copy", "Copie des fichiers", "Copie de l'agent et de ses dependances dans le dossier d'installation."),
                new InstallStepModel("driver", "Installation du driver cradle", "Installation silencieuse du driver USB du cradle LogTag."),
                new InstallStepModel("urlacl", "Configuration de l'acces local", "Nettoyage des anciennes reservations et ajout de 127.0.0.1:8000."),
                new InstallStepModel("autostart", "Activation du demarrage automatique", "Ajout de l'agent au lancement Windows."),
                new InstallStepModel("verify", "Verification finale", "Controle des fichiers installes et synthese des resultats."),
            };
        }

        private void ConfigurePageCopy()
        {
            if (_mode == InstallerMode.Uninstall)
            {
                Text = "Desinstallation de l'agent VigiSensys";
                headerTitleLabel.Text = "Desinstallation de l'agent VigiSensys";
                headerSubtitleLabel.Text = "Suppression de l'agent local et de sa configuration Windows";
                welcomeTitleLabel.Text = "Bienvenue dans la desinstallation";
                welcomeDescriptionLabel.Text = "Cet assistant va arreter l'agent VigiSensys, retirer le demarrage automatique, supprimer la reservation locale 127.0.0.1:8000, retirer l'entree Windows dans Applications installees et supprimer les fichiers installes.";
                installTitleLabel.Text = "Etapes de la desinstallation";
                installDescriptionLabel.Text = "Les etapes ci-dessous seront executees l'une apres l'autre pendant la desinstallation.";
                finishTitleLabel.Text = "Desinstallation terminee";
                finishDescriptionLabel.Text = "Le recapitulatif ci-dessous liste le resultat de chaque etape executee.";
            }
        }

        private void BuildStepCards()
        {
            stepsFlowPanel.SuspendLayout();
            stepsFlowPanel.Controls.Clear();
            installProgressBar.Minimum = 0;
            installProgressBar.Maximum = _steps.Count;
            installProgressBar.Value = 0;
            installProgressCountLabel.Text = string.Format("0/{0} etapes", _steps.Count);
            installProgressLabel.Text = "0%";

            foreach (var step in _steps)
            {
                var card = new Panel
                {
                    Width = 760,
                    Height = 74,
                    Margin = new Padding(0, 0, 0, 12),
                    BackColor = Color.White,
                    BorderStyle = BorderStyle.FixedSingle,
                    Padding = new Padding(16, 12, 16, 12),
                };

                var iconLabel = new Label
                {
                    AutoSize = false,
                    TextAlign = ContentAlignment.MiddleCenter,
                    Font = new Font("Segoe UI Semibold", 10F, FontStyle.Bold),
                    ForeColor = Color.FromArgb(103, 113, 130),
                    BackColor = Color.FromArgb(239, 243, 248),
                    Location = new Point(16, 18),
                    Size = new Size(38, 38),
                };

                var titleLabel = new Label
                {
                    AutoSize = false,
                    Text = step.Title,
                    Font = new Font("Segoe UI Semibold", 11F, FontStyle.Bold),
                    ForeColor = Color.FromArgb(28, 44, 72),
                    Location = new Point(70, 10),
                    Size = new Size(366, 22),
                };

                var descriptionLabel = new Label
                {
                    AutoSize = false,
                    Text = step.Description,
                    Font = new Font("Segoe UI", 9.25F, FontStyle.Regular),
                    ForeColor = Color.FromArgb(96, 107, 128),
                    Location = new Point(70, 34),
                    Size = new Size(486, 26),
                };

                var statusLabel = new Label
                {
                    AutoSize = false,
                    TextAlign = ContentAlignment.MiddleCenter,
                    Font = new Font("Segoe UI Semibold", 9F, FontStyle.Bold),
                    Location = new Point(590, 18),
                    Size = new Size(148, 34),
                };

                card.Controls.Add(iconLabel);
                card.Controls.Add(titleLabel);
                card.Controls.Add(descriptionLabel);
                card.Controls.Add(statusLabel);

                step.CardPanel = card;
                step.IconLabel = iconLabel;
                step.StatusLabel = statusLabel;

                stepsFlowPanel.Controls.Add(card);
                ApplyStepState(step, InstallStepState.Pending, "En attente");
            }

            stepsFlowPanel.ResumeLayout();
        }

        private void ShowPage(WizardPage page)
        {
            _currentPage = page;

            welcomePanel.Visible = page == WizardPage.Welcome;
            installPanel.Visible = page == WizardPage.Install;
            finishPanel.Visible = page == WizardPage.Finish;

            backButton.Visible = page == WizardPage.Install && !_installationStarted;
            cancelButton.Visible = page != WizardPage.Finish;

            switch (page)
            {
                case WizardPage.Welcome:
                    nextButton.Text = "Suivant";
                    nextButton.Enabled = true;
                    cancelButton.Enabled = true;
                    break;
                case WizardPage.Install:
                    nextButton.Text = _installationStarted
                        ? (_mode == InstallerMode.Install ? "Installation en cours..." : "Desinstallation en cours...")
                        : (_mode == InstallerMode.Install ? "Lancer l'installation" : "Lancer la desinstallation");
                    nextButton.Enabled = !_installationRunning && !_installationStarted;
                    cancelButton.Enabled = !_installationRunning;
                    break;
                case WizardPage.Finish:
                    nextButton.Text = _mode == InstallerMode.Install ? "Finaliser" : "Fermer";
                    nextButton.Enabled = true;
                    break;
            }
        }

        private async void OnNextClick(object sender, EventArgs e)
        {
            if (_currentPage == WizardPage.Welcome)
            {
                ShowPage(WizardPage.Install);
                return;
            }

            if (_currentPage == WizardPage.Install)
            {
                if (_installationStarted || _installationRunning)
                {
                    return;
                }

                if (_mode == InstallerMode.Install)
                {
                    var driverPromptResult = MessageBox.Show(
                        "Avant de continuer, debranchez tous les USB Interface Cradles du poste.\r\n\r\nReconnectez-les seulement une fois l'installation du driver terminee.\r\n\r\nCliquez sur OK pour lancer l'installation, ou sur Annuler pour revenir.",
                        "Preparation de l'installation",
                        MessageBoxButtons.OKCancel,
                        MessageBoxIcon.Information);

                    if (driverPromptResult != DialogResult.OK)
                    {
                        return;
                    }
                }

                if (_mode == InstallerMode.Install)
                {
                    await RunInstallationAsync();
                }
                else
                {
                    await RunUninstallAsync();
                }
                return;
            }

            if (_currentPage == WizardPage.Finish)
            {
                if (_mode == InstallerMode.Install && _installationSucceeded)
                {
                    TryLaunchAgent();
                }

                Close();
            }
        }

        private void OnBackClick(object sender, EventArgs e)
        {
            if (_installationStarted || _installationRunning)
            {
                return;
            }

            ShowPage(WizardPage.Welcome);
        }

        private void OnCancelClick(object sender, EventArgs e)
        {
            if (_installationRunning)
            {
                return;
            }

            Close();
        }

        private async Task RunInstallationAsync()
        {
            _installationStarted = true;
            _installationRunning = true;
            _installationSucceeded = false;
            ShowPage(WizardPage.Install);

            foreach (var step in _steps)
            {
                ApplyStepState(step, InstallStepState.Pending, "En attente");
            }
            UpdateProgressBar();

            try
            {
                await RunStepAsync("prepare", async () =>
                {
                    StopRunningAgent();
                    _workingDirectory = ExtractEmbeddedPayload();
                    _agentExecutablePath = Path.Combine(_workingDirectory, "agent", AgentExeName);
                    if (!File.Exists(_agentExecutablePath))
                    {
                        throw new FileNotFoundException("Executable agent embarque introuvable.", _agentExecutablePath);
                    }

                    await Task.CompletedTask;
                    return "Ressources extraites avec succes.";
                });

                await RunStepAsync("copy", async () =>
                {
                    var sourceDirectory = Path.Combine(_workingDirectory, "agent");
                    CopyDirectory(sourceDirectory, _installDirectory);
                    CopySetupExecutableToInstallDirectory();
                    await Task.CompletedTask;
                    return "Fichiers copies vers " + _installDirectory;
                });

                await RunStepAsync("driver", async () =>
                {
                    var driverPath = FindEmbeddedDriverExecutable();
                    if (driverPath == null)
                    {
                        return new StepExecutionResult(InstallStepState.Warning, "Driver cradle non trouve dans le package.");
                    }

                    var driverResult = TryInstallDriver(driverPath);
                    if (driverResult.ExitCode == 3010 || driverResult.ExitCode == 1641)
                    {
                        return new StepExecutionResult(InstallStepState.Warning, "Driver installe. Un redemarrage Windows peut etre requis.");
                    }

                    if (driverResult.Succeeded)
                    {
                        await Task.CompletedTask;
                        return "Driver cradle installe.";
                    }

                    return new StepExecutionResult(
                        InstallStepState.Warning,
                        "Installation automatique du driver non confirmee. Installer manuellement si le cradle n'est pas detecte. Detail: " + driverResult.Output);
                });

                await RunStepAsync("urlacl", async () =>
                {
                    RemoveUrlAclIfExists("http://localhost:8000/");
                    foreach (var ip in GetLocalIpv4Addresses())
                    {
                        RemoveUrlAclIfExists(string.Format("http://{0}:8000/", ip));
                    }

                    EnsureLoopbackUrlAcl();
                    await Task.CompletedTask;
                    return "Reservation locale configuree pour 127.0.0.1:8000.";
                });

                await RunStepAsync("autostart", async () =>
                {
                    EnsureStartupRegistry();
                    EnsureUninstallRegistry();
                    await Task.CompletedTask;
                    return "Demarrage automatique et entree Windows configures.";
                });

                await RunStepAsync("verify", async () =>
                {
                    var installedExePath = Path.Combine(_installDirectory, AgentExeName);
                    if (!File.Exists(installedExePath))
                    {
                        throw new FileNotFoundException("Executable agent absent apres installation.", installedExePath);
                    }

                    await Task.CompletedTask;
                    return "Installation terminee. L'agent sera lance a la finalisation.";
                });

                _installationSucceeded = true;
                finishTitleLabel.Text = "Installation terminee";
                finishDescriptionLabel.Text = "L'installation de l'agent VigiSensys est terminee. Cliquez sur Finaliser pour lancer l'agent.";
            }
            catch (Exception ex)
            {
                _installationSucceeded = false;
                finishTitleLabel.Text = "Installation terminee avec erreur";
                finishDescriptionLabel.Text = "Une ou plusieurs etapes ont echoue. Consultez le recapitulatif avant de fermer.";
                AppendSummaryLine("Erreur globale : " + ex.Message);
            }
            finally
            {
                _installationRunning = false;
                BuildSummary();
                ShowPage(WizardPage.Finish);
            }
        }

        private async Task RunUninstallAsync()
        {
            _installationStarted = true;
            _installationRunning = true;
            _installationSucceeded = false;
            ShowPage(WizardPage.Install);

            foreach (var step in _steps)
            {
                ApplyStepState(step, InstallStepState.Pending, "En attente");
            }
            UpdateProgressBar();

            try
            {
                await RunStepAsync("prepare", async () =>
                {
                    StopRunningAgent();
                    await Task.CompletedTask;
                    return "Agent arrete avant suppression.";
                });

                await RunStepAsync("autostart", async () =>
                {
                    RemoveStartupRegistry();
                    await Task.CompletedTask;
                    return "Demarrage automatique supprime.";
                });

                await RunStepAsync("urlacl", async () =>
                {
                    RemoveUrlAclIfExists("http://127.0.0.1:8000/");
                    RemoveUrlAclIfExists("http://localhost:8000/");
                    foreach (var ip in GetLocalIpv4Addresses())
                    {
                        RemoveUrlAclIfExists(string.Format("http://{0}:8000/", ip));
                    }

                    await Task.CompletedTask;
                    return "Reservation locale supprimee.";
                });

                await RunStepAsync("uninstall-entry", async () =>
                {
                    RemoveUninstallRegistry();
                    await Task.CompletedTask;
                    return "Entree Applications installees supprimee.";
                });

                await RunStepAsync("files", async () =>
                {
                    ScheduleInstallDirectoryDeletion();
                    await Task.CompletedTask;
                    return "Suppression des fichiers planifiee.";
                });

                await RunStepAsync("verify", async () =>
                {
                    await Task.CompletedTask;
                    return "Desinstallation terminee. Les derniers fichiers seront nettoyes apres fermeture.";
                });

                _installationSucceeded = true;
                finishTitleLabel.Text = "Desinstallation terminee";
                finishDescriptionLabel.Text = "La desinstallation de l'agent VigiSensys est terminee.";
            }
            catch (Exception ex)
            {
                _installationSucceeded = false;
                finishTitleLabel.Text = "Desinstallation terminee avec erreur";
                finishDescriptionLabel.Text = "Une ou plusieurs etapes ont echoue. Consultez le recapitulatif avant de fermer.";
                AppendSummaryLine("Erreur globale : " + ex.Message);
            }
            finally
            {
                _installationRunning = false;
                BuildSummary();
                ShowPage(WizardPage.Finish);
            }
        }

        private async Task RunStepAsync(string stepKey, Func<Task<object>> action)
        {
            var step = _steps.First(item => item.Key == stepKey);
            ApplyStepState(step, InstallStepState.Running, "En cours...");
            var startedAt = DateTime.UtcNow;

            try
            {
                var result = await action();
                await EnsureMinimumStepVisibilityAsync(startedAt);
                if (result is StepExecutionResult executionResult)
                {
                    ApplyStepState(step, executionResult.State, executionResult.Message);
                    if (executionResult.State == InstallStepState.Error)
                    {
                        throw new InvalidOperationException(executionResult.Message);
                    }
                    return;
                }

                ApplyStepState(step, InstallStepState.Success, result as string ?? "Termine");
            }
            catch (Exception ex)
            {
                await EnsureMinimumStepVisibilityAsync(startedAt);
                ApplyStepState(step, InstallStepState.Error, ex.Message);
                throw;
            }
        }

        private static async Task EnsureMinimumStepVisibilityAsync(DateTime startedAtUtc)
        {
            var elapsed = DateTime.UtcNow - startedAtUtc;
            var remaining = MinimumStepDisplayMs - (int)elapsed.TotalMilliseconds;
            if (remaining > 0)
            {
                await Task.Delay(remaining);
            }
        }

        private void ApplyStepState(InstallStepModel step, InstallStepState state, string detail)
        {
            step.State = state;
            step.Detail = detail ?? string.Empty;

            Color background;
            Color textColor;

            switch (state)
            {
                case InstallStepState.Running:
                    background = Color.FromArgb(224, 240, 255);
                    textColor = Color.FromArgb(0, 92, 179);
                    break;
                case InstallStepState.Success:
                    background = Color.FromArgb(214, 236, 255);
                    textColor = Color.FromArgb(0, 92, 179);
                    break;
                case InstallStepState.Warning:
                    background = Color.FromArgb(255, 243, 220);
                    textColor = Color.FromArgb(172, 100, 0);
                    break;
                case InstallStepState.Error:
                    background = Color.FromArgb(255, 228, 230);
                    textColor = Color.FromArgb(179, 38, 54);
                    break;
                default:
                    background = Color.FromArgb(239, 243, 248);
                    textColor = Color.FromArgb(103, 113, 130);
                    break;
            }

            step.CardPanel.BackColor = state == InstallStepState.Pending ? Color.White : background;
            step.StatusLabel.BackColor = background;
            step.StatusLabel.ForeColor = textColor;
            step.StatusLabel.Text = GetStepStateLabel(state);
            step.IconLabel.BackColor = background;
            step.IconLabel.ForeColor = textColor;
            step.IconLabel.Text = GetStepStateIcon(state);
            step.CardPanel.Padding = state == InstallStepState.Running
                ? new Padding(14, 10, 14, 10)
                : new Padding(16, 12, 16, 12);
            UpdateProgressBar();
        }

        private void UpdateProgressBar()
        {
            if (installProgressBar == null)
            {
                return;
            }

            var completedCount = _steps.Count(step =>
                step.State == InstallStepState.Success ||
                step.State == InstallStepState.Warning ||
                step.State == InstallStepState.Error);

            installProgressBar.Value = Math.Min(completedCount, installProgressBar.Maximum);
            var percentage = installProgressBar.Maximum == 0
                ? 0
                : (int)Math.Round((double)installProgressBar.Value / installProgressBar.Maximum * 100d);
            installProgressCountLabel.Text = string.Format("{0}/{1} etapes", completedCount, _steps.Count);
            installProgressLabel.Text = percentage.ToString() + "%";
        }

        private static string GetStepStateLabel(InstallStepState state)
        {
            switch (state)
            {
                case InstallStepState.Running:
                    return "EN COURS";
                case InstallStepState.Success:
                    return "OK";
                case InstallStepState.Warning:
                    return "ATTENTION";
                case InstallStepState.Error:
                    return "ECHEC";
                default:
                    return "EN ATTENTE";
            }
        }

        private static string GetStepStateIcon(InstallStepState state)
        {
            switch (state)
            {
                case InstallStepState.Running:
                    return ">";
                case InstallStepState.Success:
                    return "OK";
                case InstallStepState.Warning:
                    return "!";
                case InstallStepState.Error:
                    return "X";
                default:
                    return "...";
            }
        }

        private string ExtractEmbeddedPayload()
        {
            var assembly = Assembly.GetExecutingAssembly();
            var payloadResources = assembly
                .GetManifestResourceNames()
                .Where(name => name.StartsWith("Payload/", StringComparison.OrdinalIgnoreCase))
                .ToArray();

            if (payloadResources.Length == 0)
            {
                throw new InvalidOperationException("Aucune ressource embarquee de payload n'a ete trouvee.");
            }

            var targetDirectory = Path.Combine(Path.GetTempPath(), "VigiSensysAgentSetup", Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(targetDirectory);

            foreach (var resourceName in payloadResources)
            {
                var relativePath = resourceName.Substring("Payload/".Length).Replace('/', Path.DirectorySeparatorChar);
                var destinationPath = Path.Combine(targetDirectory, relativePath);
                var destinationDirectory = Path.GetDirectoryName(destinationPath);
                if (!string.IsNullOrWhiteSpace(destinationDirectory))
                {
                    Directory.CreateDirectory(destinationDirectory);
                }

                using (var resourceStream = assembly.GetManifestResourceStream(resourceName))
                using (var destinationStream = File.Create(destinationPath))
                {
                    if (resourceStream == null)
                    {
                        throw new InvalidOperationException("Ressource introuvable: " + resourceName);
                    }

                    resourceStream.CopyTo(destinationStream);
                }
            }

            return targetDirectory;
        }

        private string FindEmbeddedDriverExecutable()
        {
            if (string.IsNullOrWhiteSpace(_workingDirectory) || !Directory.Exists(_workingDirectory))
            {
                return null;
            }

            var matches = Directory.GetFiles(_workingDirectory, "*.exe", SearchOption.AllDirectories)
                .Where(path => Path.GetFileName(path).IndexOf("cradle", StringComparison.OrdinalIgnoreCase) >= 0)
                .OrderBy(path => path)
                .ToArray();

            if (matches.Length > 0)
            {
                return matches[0];
            }

            return Directory.GetFiles(_workingDirectory, "*.exe", SearchOption.AllDirectories)
                .FirstOrDefault(path =>
                    Path.GetFileName(path).IndexOf("driver", StringComparison.OrdinalIgnoreCase) >= 0 &&
                    Path.GetFileName(path).IndexOf("usb", StringComparison.OrdinalIgnoreCase) >= 0);
        }

        private static ProcessExecutionResult TryInstallDriver(string driverPath)
        {
            var workingDirectory = Path.GetDirectoryName(driverPath);
            var argumentCandidates = new[]
            {
                "/s /v\"/qn /norestart\"",
                "/S",
                "/quiet /norestart",
                string.Empty,
            };

            ProcessExecutionResult lastResult = null;
            foreach (var arguments in argumentCandidates)
            {
                var result = RunProcessWindowed(driverPath, arguments, workingDirectory, ProcessWindowStyle.Minimized);
                lastResult = result;
                if (result.ExitCode == 0 || result.ExitCode == 1641 || result.ExitCode == 3010)
                {
                    return result;
                }
            }

            return lastResult ?? new ProcessExecutionResult(-1, "Aucun resultat driver.");
        }

        private static void CopyDirectory(string sourceDirectory, string destinationDirectory)
        {
            Directory.CreateDirectory(destinationDirectory);

            foreach (var file in Directory.GetFiles(sourceDirectory))
            {
                File.Copy(file, Path.Combine(destinationDirectory, Path.GetFileName(file)), true);
            }

            foreach (var subDirectory in Directory.GetDirectories(sourceDirectory))
            {
                CopyDirectory(
                    subDirectory,
                    Path.Combine(destinationDirectory, Path.GetFileName(subDirectory)));
            }
        }

        private static void StopRunningAgent()
        {
            foreach (var process in Process.GetProcessesByName(Path.GetFileNameWithoutExtension(AgentExeName)))
            {
                try
                {
                    process.Kill();
                    process.WaitForExit(5000);
                }
                catch
                {
                    // ignore
                }
            }
        }

        private static IEnumerable<string> GetLocalIpv4Addresses()
        {
            try
            {
                return Dns.GetHostAddresses(Dns.GetHostName())
                    .Where(ip => ip.AddressFamily == AddressFamily.InterNetwork)
                    .Select(ip => ip.ToString())
                    .Where(ip => ip != "127.0.0.1" && !ip.StartsWith("169.254.", StringComparison.Ordinal))
                    .Distinct()
                    .ToArray();
            }
            catch
            {
                return Array.Empty<string>();
            }
        }

        private static void RemoveUrlAclIfExists(string url)
        {
            RunProcess("netsh", "http delete urlacl url=\"" + url + "\"", null, new[] { 0, 1, 2 });
        }

        private static void EnsureLoopbackUrlAcl()
        {
            var showOutput = RunProcessCapture("netsh", "http show urlacl url=\"http://127.0.0.1:8000/\"");
            if (showOutput.ExitCode == 0 && showOutput.Output.IndexOf("127.0.0.1:8000", StringComparison.OrdinalIgnoreCase) >= 0)
            {
                return;
            }

            var addExitCode = RunProcess(
                "netsh",
                "http add urlacl url=\"http://127.0.0.1:8000/\" sddl=\"D:(A;;GX;;;WD)\"",
                null,
                new[] { 0 });

            if (addExitCode != 0)
            {
                throw new InvalidOperationException("Impossible d'ajouter la reservation URLACL loopback.");
            }
        }

        private void EnsureStartupRegistry()
        {
            var exePath = Path.Combine(_installDirectory, AgentExeName);
            using (var key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Run", true))
            {
                if (key == null)
                {
                    throw new InvalidOperationException("Impossible d'ouvrir la cle de demarrage automatique.");
                }

                key.SetValue(AgentRunRegistryName, "\"" + exePath + "\"");
            }
        }

        private void RemoveStartupRegistry()
        {
            using (var key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows\CurrentVersion\Run", true))
            {
                if (key == null)
                {
                    return;
                }

                if (key.GetValue(AgentRunRegistryName) != null)
                {
                    key.DeleteValue(AgentRunRegistryName, false);
                }
            }
        }

        private void EnsureUninstallRegistry()
        {
            var setupPath = Path.Combine(_installDirectory, SetupExeName);
            var agentPath = Path.Combine(_installDirectory, AgentExeName);
            var version = Assembly.GetExecutingAssembly().GetName().Version;
            var displayVersion = version == null ? "1.0.0" : string.Format("{0}.{1}.{2}", version.Major, version.Minor, version.Build);

            using (var key = Registry.LocalMachine.CreateSubKey(UninstallRegistryKeyName))
            {
                if (key == null)
                {
                    throw new InvalidOperationException("Impossible de creer l'entree Applications installees.");
                }

                key.SetValue("DisplayName", ProductDisplayName);
                key.SetValue("DisplayVersion", displayVersion);
                key.SetValue("Publisher", ProductPublisher);
                key.SetValue("InstallLocation", _installDirectory);
                key.SetValue("DisplayIcon", agentPath);
                key.SetValue("UninstallString", "\"" + setupPath + "\" /uninstall");
                key.SetValue("QuietUninstallString", "\"" + setupPath + "\" /uninstall");
                key.SetValue("NoModify", 1, RegistryValueKind.DWord);
                key.SetValue("NoRepair", 1, RegistryValueKind.DWord);
            }
        }

        private static void RemoveUninstallRegistry()
        {
            Registry.LocalMachine.DeleteSubKeyTree(UninstallRegistryKeyName, false);
        }

        private void CopySetupExecutableToInstallDirectory()
        {
            var currentSetupPath = Application.ExecutablePath;
            var destinationPath = Path.Combine(_installDirectory, SetupExeName);
            Directory.CreateDirectory(_installDirectory);

            if (!string.Equals(currentSetupPath, destinationPath, StringComparison.OrdinalIgnoreCase))
            {
                File.Copy(currentSetupPath, destinationPath, true);
            }
        }

        private void ScheduleInstallDirectoryDeletion()
        {
            if (!Directory.Exists(_installDirectory))
            {
                return;
            }

            var tempScriptPath = Path.Combine(Path.GetTempPath(), "VigiSensysAgentCleanup_" + Guid.NewGuid().ToString("N") + ".cmd");
            var setupPath = Path.Combine(_installDirectory, SetupExeName);
            var scriptContent =
                "@echo off\r\n" +
                "ping 127.0.0.1 -n 6 > nul\r\n" +
                "taskkill /IM " + AgentExeName + " /F >nul 2>nul\r\n" +
                "del /f /q \"" + setupPath + "\" >nul 2>nul\r\n" +
                "rmdir /s /q \"" + _installDirectory + "\" >nul 2>nul\r\n" +
                "del /f /q \"%~f0\" >nul 2>nul\r\n";
            File.WriteAllText(tempScriptPath, scriptContent);

            Process.Start(new ProcessStartInfo
            {
                FileName = "cmd.exe",
                Arguments = "/c \"" + tempScriptPath + "\"",
                CreateNoWindow = true,
                UseShellExecute = false,
                WindowStyle = ProcessWindowStyle.Hidden,
            });
        }

        private void TryLaunchAgent()
        {
            var exePath = Path.Combine(_installDirectory, AgentExeName);
            if (!File.Exists(exePath))
            {
                MessageBox.Show(
                    "L'installation est terminee, mais l'executable de l'agent est introuvable.\r\n\r\nChemin attendu : " + exePath,
                    "Lancement de l'agent impossible",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning);
                return;
            }

            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = exePath,
                    WorkingDirectory = _installDirectory,
                    UseShellExecute = true,
                });
            }
            catch (System.ComponentModel.Win32Exception ex)
            {
                MessageBox.Show(
                    "L'installation est terminee, mais Windows a bloque le lancement automatique de l'agent.\r\n\r\n" +
                    "Chemin : " + exePath + "\r\n\r\n" +
                    "Message Windows : " + ex.Message + "\r\n\r\n" +
                    "Vous pouvez lancer l'agent manuellement apres avoir autorise son execution sur ce poste.",
                    "Lancement automatique bloque",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning);
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    "L'installation est terminee, mais le lancement automatique de l'agent a echoue.\r\n\r\n" +
                    "Chemin : " + exePath + "\r\n\r\n" +
                    "Erreur : " + ex.Message,
                    "Lancement automatique echoue",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning);
            }
        }

        private static int RunProcess(string fileName, string arguments, string workingDirectory, int[] acceptedExitCodes)
        {
            var result = RunProcessCapture(fileName, arguments, workingDirectory);
            if (acceptedExitCodes == null || !acceptedExitCodes.Contains(result.ExitCode))
            {
                throw new InvalidOperationException(
                    string.Format(
                        "Commande echouee ({0} {1}) - code {2}{3}",
                        fileName,
                        arguments,
                        result.ExitCode,
                        string.IsNullOrWhiteSpace(result.Output) ? string.Empty : " : " + result.Output.Trim()
                    ));
            }

            return result.ExitCode;
        }

        private static ProcessExecutionResult RunProcessCapture(string fileName, string arguments, string workingDirectory = null)
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = fileName,
                Arguments = arguments,
                WorkingDirectory = string.IsNullOrWhiteSpace(workingDirectory) ? Environment.CurrentDirectory : workingDirectory,
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true,
            };

            using (var process = Process.Start(startInfo))
            {
                if (process == null)
                {
                    throw new InvalidOperationException("Impossible de lancer le processus " + fileName);
                }

                var output = process.StandardOutput.ReadToEnd();
                var error = process.StandardError.ReadToEnd();
                process.WaitForExit();

                return new ProcessExecutionResult(process.ExitCode, (output + Environment.NewLine + error).Trim());
            }
        }

        private static ProcessExecutionResult RunProcessWindowed(
            string fileName,
            string arguments,
            string workingDirectory,
            ProcessWindowStyle windowStyle)
        {
            var startInfo = new ProcessStartInfo
            {
                FileName = fileName,
                Arguments = arguments,
                WorkingDirectory = string.IsNullOrWhiteSpace(workingDirectory) ? Environment.CurrentDirectory : workingDirectory,
                UseShellExecute = true,
                WindowStyle = windowStyle,
            };

            using (var process = Process.Start(startInfo))
            {
                if (process == null)
                {
                    throw new InvalidOperationException("Impossible de lancer le processus " + fileName);
                }

                process.WaitForExit();
                return new ProcessExecutionResult(process.ExitCode, string.Empty);
            }
        }

        private void BuildSummary()
        {
            summaryTextBox.Clear();
            summaryTextBox.AppendText("Dossier d'installation : " + _installDirectory + Environment.NewLine + Environment.NewLine);

            foreach (var step in _steps)
            {
                AppendSummaryLine(string.Format("{0} - {1}: {2}", GetStepStateLabel(step.State), step.Title, step.Detail));
            }
        }

        private void AppendSummaryLine(string value)
        {
            summaryTextBox.AppendText(value + Environment.NewLine);
        }

        private enum WizardPage
        {
            Welcome,
            Install,
            Finish
        }

        private enum InstallerMode
        {
            Install,
            Uninstall
        }

        private enum InstallStepState
        {
            Pending,
            Running,
            Success,
            Warning,
            Error
        }

        private sealed class InstallStepModel
        {
            public InstallStepModel(string key, string title, string description)
            {
                Key = key;
                Title = title;
                Description = description;
            }

            public string Key { get; private set; }
            public string Title { get; private set; }
            public string Description { get; private set; }
            public InstallStepState State { get; set; }
            public string Detail { get; set; }
            public Panel CardPanel { get; set; }
            public Label IconLabel { get; set; }
            public Label StatusLabel { get; set; }
        }

        private sealed class StepExecutionResult
        {
            public StepExecutionResult(InstallStepState state, string message)
            {
                State = state;
                Message = message;
            }

            public InstallStepState State { get; private set; }
            public string Message { get; private set; }
        }

        private sealed class ProcessExecutionResult
        {
            public ProcessExecutionResult(int exitCode, string output)
            {
                ExitCode = exitCode;
                Output = output ?? string.Empty;
            }

            public int ExitCode { get; private set; }
            public string Output { get; private set; }
            public bool Succeeded
            {
                get { return ExitCode == 0 || ExitCode == 1641 || ExitCode == 3010; }
            }
        }
    }
}
