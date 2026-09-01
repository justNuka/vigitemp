namespace VigitempAgentInstaller
{
    partial class MainForm
    {
        private System.ComponentModel.IContainer components = null;
        private System.Windows.Forms.Panel headerPanel;
        private System.Windows.Forms.Label headerTitleLabel;
        private System.Windows.Forms.Label headerSubtitleLabel;
        private System.Windows.Forms.Panel contentHostPanel;
        private System.Windows.Forms.Panel welcomePanel;
        private System.Windows.Forms.Label welcomeTitleLabel;
        private System.Windows.Forms.Label welcomeDescriptionLabel;
        private System.Windows.Forms.Panel installPanel;
        private System.Windows.Forms.Label installTitleLabel;
        private System.Windows.Forms.Label installDescriptionLabel;
        private System.Windows.Forms.ProgressBar installProgressBar;
        private System.Windows.Forms.Label installProgressLabel;
        private System.Windows.Forms.Label installProgressCountLabel;
        private System.Windows.Forms.FlowLayoutPanel stepsFlowPanel;
        private System.Windows.Forms.Panel finishPanel;
        private System.Windows.Forms.Label finishTitleLabel;
        private System.Windows.Forms.Label finishDescriptionLabel;
        private System.Windows.Forms.TextBox summaryTextBox;
        private System.Windows.Forms.Panel footerPanel;
        private System.Windows.Forms.Button backButton;
        private System.Windows.Forms.Button nextButton;
        private System.Windows.Forms.Button cancelButton;

        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        private void InitializeComponent()
        {
            this.headerPanel = new System.Windows.Forms.Panel();
            this.headerSubtitleLabel = new System.Windows.Forms.Label();
            this.headerTitleLabel = new System.Windows.Forms.Label();
            this.contentHostPanel = new System.Windows.Forms.Panel();
            this.welcomePanel = new System.Windows.Forms.Panel();
            this.welcomeDescriptionLabel = new System.Windows.Forms.Label();
            this.welcomeTitleLabel = new System.Windows.Forms.Label();
            this.installPanel = new System.Windows.Forms.Panel();
            this.installProgressCountLabel = new System.Windows.Forms.Label();
            this.installProgressLabel = new System.Windows.Forms.Label();
            this.installProgressBar = new System.Windows.Forms.ProgressBar();
            this.stepsFlowPanel = new System.Windows.Forms.FlowLayoutPanel();
            this.installDescriptionLabel = new System.Windows.Forms.Label();
            this.installTitleLabel = new System.Windows.Forms.Label();
            this.finishPanel = new System.Windows.Forms.Panel();
            this.summaryTextBox = new System.Windows.Forms.TextBox();
            this.finishDescriptionLabel = new System.Windows.Forms.Label();
            this.finishTitleLabel = new System.Windows.Forms.Label();
            this.footerPanel = new System.Windows.Forms.Panel();
            this.cancelButton = new System.Windows.Forms.Button();
            this.backButton = new System.Windows.Forms.Button();
            this.nextButton = new System.Windows.Forms.Button();
            this.headerPanel.SuspendLayout();
            this.contentHostPanel.SuspendLayout();
            this.welcomePanel.SuspendLayout();
            this.installPanel.SuspendLayout();
            this.finishPanel.SuspendLayout();
            this.footerPanel.SuspendLayout();
            this.SuspendLayout();
            // 
            // headerPanel
            // 
            this.headerPanel.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(17)))), ((int)(((byte)(37)))), ((int)(((byte)(68)))));
            this.headerPanel.Controls.Add(this.headerSubtitleLabel);
            this.headerPanel.Controls.Add(this.headerTitleLabel);
            this.headerPanel.Dock = System.Windows.Forms.DockStyle.Top;
            this.headerPanel.Location = new System.Drawing.Point(0, 0);
            this.headerPanel.Name = "headerPanel";
            this.headerPanel.Padding = new System.Windows.Forms.Padding(28, 24, 28, 20);
            this.headerPanel.Size = new System.Drawing.Size(884, 106);
            this.headerPanel.TabIndex = 0;
            // 
            // headerSubtitleLabel
            // 
            this.headerSubtitleLabel.AutoSize = true;
            this.headerSubtitleLabel.Font = new System.Drawing.Font("Segoe UI", 10F);
            this.headerSubtitleLabel.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(195)))), ((int)(((byte)(211)))), ((int)(((byte)(235)))));
            this.headerSubtitleLabel.Location = new System.Drawing.Point(30, 62);
            this.headerSubtitleLabel.Name = "headerSubtitleLabel";
            this.headerSubtitleLabel.Size = new System.Drawing.Size(394, 19);
            this.headerSubtitleLabel.TabIndex = 1;
            this.headerSubtitleLabel.Text = "Installation autonome de l'agent et du driver du cradle LogTag";
            // 
            // headerTitleLabel
            // 
            this.headerTitleLabel.AutoSize = true;
            this.headerTitleLabel.Font = new System.Drawing.Font("Segoe UI Semibold", 20F, System.Drawing.FontStyle.Bold);
            this.headerTitleLabel.ForeColor = System.Drawing.Color.White;
            this.headerTitleLabel.Location = new System.Drawing.Point(26, 20);
            this.headerTitleLabel.Name = "headerTitleLabel";
            this.headerTitleLabel.Size = new System.Drawing.Size(372, 37);
            this.headerTitleLabel.TabIndex = 0;
            this.headerTitleLabel.Text = "Installation de l'agent VigiSensys";
            // 
            // contentHostPanel
            // 
            this.contentHostPanel.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(245)))), ((int)(((byte)(247)))), ((int)(((byte)(251)))));
            this.contentHostPanel.Controls.Add(this.welcomePanel);
            this.contentHostPanel.Controls.Add(this.installPanel);
            this.contentHostPanel.Controls.Add(this.finishPanel);
            this.contentHostPanel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.contentHostPanel.Location = new System.Drawing.Point(0, 106);
            this.contentHostPanel.Name = "contentHostPanel";
            this.contentHostPanel.Padding = new System.Windows.Forms.Padding(28, 24, 28, 16);
            this.contentHostPanel.Size = new System.Drawing.Size(884, 470);
            this.contentHostPanel.TabIndex = 1;
            // 
            // welcomePanel
            // 
            this.welcomePanel.BackColor = System.Drawing.Color.White;
            this.welcomePanel.Controls.Add(this.welcomeDescriptionLabel);
            this.welcomePanel.Controls.Add(this.welcomeTitleLabel);
            this.welcomePanel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.welcomePanel.Location = new System.Drawing.Point(28, 24);
            this.welcomePanel.Name = "welcomePanel";
            this.welcomePanel.Padding = new System.Windows.Forms.Padding(34, 32, 34, 32);
            this.welcomePanel.Size = new System.Drawing.Size(828, 430);
            this.welcomePanel.TabIndex = 0;
            // 
            // welcomeDescriptionLabel
            // 
            this.welcomeDescriptionLabel.AutoSize = true;
            this.welcomeDescriptionLabel.Font = new System.Drawing.Font("Segoe UI", 12F);
            this.welcomeDescriptionLabel.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(76)))), ((int)(((byte)(88)))), ((int)(((byte)(108)))));
            this.welcomeDescriptionLabel.Location = new System.Drawing.Point(38, 100);
            this.welcomeDescriptionLabel.MaximumSize = new System.Drawing.Size(700, 0);
            this.welcomeDescriptionLabel.Name = "welcomeDescriptionLabel";
            this.welcomeDescriptionLabel.Size = new System.Drawing.Size(686, 63);
            this.welcomeDescriptionLabel.TabIndex = 1;
            this.welcomeDescriptionLabel.Text = "Cet assistant va installer l'agent VigiSensys, copier les fichiers necessaires, " +
    "installer le driver du cradle LogTag, configurer l'acces local sur 127.0.0.1:8" +
    "000 et activer le demarrage automatique.";
            // 
            // welcomeTitleLabel
            // 
            this.welcomeTitleLabel.AutoSize = true;
            this.welcomeTitleLabel.Font = new System.Drawing.Font("Segoe UI Semibold", 24F, System.Drawing.FontStyle.Bold);
            this.welcomeTitleLabel.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(20)))), ((int)(((byte)(31)))), ((int)(((byte)(54)))));
            this.welcomeTitleLabel.Location = new System.Drawing.Point(34, 38);
            this.welcomeTitleLabel.Name = "welcomeTitleLabel";
            this.welcomeTitleLabel.Size = new System.Drawing.Size(404, 45);
            this.welcomeTitleLabel.TabIndex = 0;
            this.welcomeTitleLabel.Text = "Bienvenue dans l'installation";
            // 
            // installPanel
            // 
            this.installPanel.BackColor = System.Drawing.Color.White;
            this.installPanel.Controls.Add(this.installProgressCountLabel);
            this.installPanel.Controls.Add(this.installProgressLabel);
            this.installPanel.Controls.Add(this.installProgressBar);
            this.installPanel.Controls.Add(this.stepsFlowPanel);
            this.installPanel.Controls.Add(this.installDescriptionLabel);
            this.installPanel.Controls.Add(this.installTitleLabel);
            this.installPanel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.installPanel.Location = new System.Drawing.Point(28, 24);
            this.installPanel.Name = "installPanel";
            this.installPanel.Padding = new System.Windows.Forms.Padding(28, 24, 28, 24);
            this.installPanel.Size = new System.Drawing.Size(828, 430);
            this.installPanel.TabIndex = 1;
            // 
            // installProgressCountLabel
            // 
            this.installProgressCountLabel.Font = new System.Drawing.Font("Segoe UI", 9F);
            this.installProgressCountLabel.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(88)))), ((int)(((byte)(99)))), ((int)(((byte)(120)))));
            this.installProgressCountLabel.Location = new System.Drawing.Point(36, 58);
            this.installProgressCountLabel.Name = "installProgressCountLabel";
            this.installProgressCountLabel.Size = new System.Drawing.Size(180, 20);
            this.installProgressCountLabel.TabIndex = 5;
            this.installProgressCountLabel.Text = "0/0 etapes";
            this.installProgressCountLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // installProgressLabel
            // 
            this.installProgressLabel.Font = new System.Drawing.Font("Segoe UI Semibold", 9.5F, System.Drawing.FontStyle.Bold);
            this.installProgressLabel.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(0)))), ((int)(((byte)(92)))), ((int)(((byte)(179)))));
            this.installProgressLabel.Location = new System.Drawing.Point(689, 58);
            this.installProgressLabel.Name = "installProgressLabel";
            this.installProgressLabel.Size = new System.Drawing.Size(103, 20);
            this.installProgressLabel.TabIndex = 4;
            this.installProgressLabel.Text = "0%";
            this.installProgressLabel.TextAlign = System.Drawing.ContentAlignment.MiddleRight;
            // 
            // installProgressBar
            // 
            this.installProgressBar.Location = new System.Drawing.Point(36, 94);
            this.installProgressBar.Name = "installProgressBar";
            this.installProgressBar.Size = new System.Drawing.Size(756, 18);
            this.installProgressBar.Style = System.Windows.Forms.ProgressBarStyle.Continuous;
            this.installProgressBar.TabIndex = 3;
            // 
            // stepsFlowPanel
            // 
            this.stepsFlowPanel.AutoScroll = true;
            this.stepsFlowPanel.FlowDirection = System.Windows.Forms.FlowDirection.TopDown;
            this.stepsFlowPanel.Location = new System.Drawing.Point(31, 122);
            this.stepsFlowPanel.Name = "stepsFlowPanel";
            this.stepsFlowPanel.Size = new System.Drawing.Size(766, 278);
            this.stepsFlowPanel.TabIndex = 2;
            this.stepsFlowPanel.WrapContents = false;
            // 
            // installDescriptionLabel
            // 
            this.installDescriptionLabel.AutoSize = true;
            this.installDescriptionLabel.Font = new System.Drawing.Font("Segoe UI", 11F);
            this.installDescriptionLabel.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(88)))), ((int)(((byte)(99)))), ((int)(((byte)(120)))));
            this.installDescriptionLabel.Location = new System.Drawing.Point(33, 58);
            this.installDescriptionLabel.Name = "installDescriptionLabel";
            this.installDescriptionLabel.Size = new System.Drawing.Size(505, 20);
            this.installDescriptionLabel.TabIndex = 1;
            this.installDescriptionLabel.Text = "Les etapes ci-dessous seront executees l'une apres l'autre pendant l'installatio" +
    "n.";
            // 
            // installTitleLabel
            // 
            this.installTitleLabel.AutoSize = true;
            this.installTitleLabel.Font = new System.Drawing.Font("Segoe UI Semibold", 20F, System.Drawing.FontStyle.Bold);
            this.installTitleLabel.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(20)))), ((int)(((byte)(31)))), ((int)(((byte)(54)))));
            this.installTitleLabel.Location = new System.Drawing.Point(27, 18);
            this.installTitleLabel.Name = "installTitleLabel";
            this.installTitleLabel.Size = new System.Drawing.Size(364, 37);
            this.installTitleLabel.TabIndex = 0;
            this.installTitleLabel.Text = "Etapes de l'installation agent";
            // 
            // finishPanel
            // 
            this.finishPanel.BackColor = System.Drawing.Color.White;
            this.finishPanel.Controls.Add(this.summaryTextBox);
            this.finishPanel.Controls.Add(this.finishDescriptionLabel);
            this.finishPanel.Controls.Add(this.finishTitleLabel);
            this.finishPanel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.finishPanel.Location = new System.Drawing.Point(28, 24);
            this.finishPanel.Name = "finishPanel";
            this.finishPanel.Padding = new System.Windows.Forms.Padding(28, 24, 28, 24);
            this.finishPanel.Size = new System.Drawing.Size(828, 430);
            this.finishPanel.TabIndex = 2;
            // 
            // summaryTextBox
            // 
            this.summaryTextBox.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(248)))), ((int)(((byte)(250)))), ((int)(((byte)(253)))));
            this.summaryTextBox.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.summaryTextBox.Font = new System.Drawing.Font("Consolas", 10F);
            this.summaryTextBox.Location = new System.Drawing.Point(34, 103);
            this.summaryTextBox.Multiline = true;
            this.summaryTextBox.Name = "summaryTextBox";
            this.summaryTextBox.ReadOnly = true;
            this.summaryTextBox.ScrollBars = System.Windows.Forms.ScrollBars.Vertical;
            this.summaryTextBox.Size = new System.Drawing.Size(758, 286);
            this.summaryTextBox.TabIndex = 2;
            // 
            // finishDescriptionLabel
            // 
            this.finishDescriptionLabel.AutoSize = true;
            this.finishDescriptionLabel.Font = new System.Drawing.Font("Segoe UI", 11F);
            this.finishDescriptionLabel.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(88)))), ((int)(((byte)(99)))), ((int)(((byte)(120)))));
            this.finishDescriptionLabel.Location = new System.Drawing.Point(32, 61);
            this.finishDescriptionLabel.Name = "finishDescriptionLabel";
            this.finishDescriptionLabel.Size = new System.Drawing.Size(444, 20);
            this.finishDescriptionLabel.TabIndex = 1;
            this.finishDescriptionLabel.Text = "Le recapitulatif ci-dessous liste le resultat de chaque etape executee.";
            // 
            // finishTitleLabel
            // 
            this.finishTitleLabel.AutoSize = true;
            this.finishTitleLabel.Font = new System.Drawing.Font("Segoe UI Semibold", 20F, System.Drawing.FontStyle.Bold);
            this.finishTitleLabel.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(20)))), ((int)(((byte)(31)))), ((int)(((byte)(54)))));
            this.finishTitleLabel.Location = new System.Drawing.Point(28, 20);
            this.finishTitleLabel.Name = "finishTitleLabel";
            this.finishTitleLabel.Size = new System.Drawing.Size(252, 37);
            this.finishTitleLabel.TabIndex = 0;
            this.finishTitleLabel.Text = "Installation terminee";
            // 
            // footerPanel
            // 
            this.footerPanel.BackColor = System.Drawing.Color.White;
            this.footerPanel.Controls.Add(this.cancelButton);
            this.footerPanel.Controls.Add(this.backButton);
            this.footerPanel.Controls.Add(this.nextButton);
            this.footerPanel.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.footerPanel.Location = new System.Drawing.Point(0, 576);
            this.footerPanel.Name = "footerPanel";
            this.footerPanel.Padding = new System.Windows.Forms.Padding(28, 18, 28, 18);
            this.footerPanel.Size = new System.Drawing.Size(884, 78);
            this.footerPanel.TabIndex = 2;
            // 
            // cancelButton
            // 
            this.cancelButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.cancelButton.BackColor = System.Drawing.Color.White;
            this.cancelButton.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.cancelButton.Font = new System.Drawing.Font("Segoe UI Semibold", 10F, System.Drawing.FontStyle.Bold);
            this.cancelButton.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(20)))), ((int)(((byte)(31)))), ((int)(((byte)(54)))));
            this.cancelButton.Location = new System.Drawing.Point(585, 16);
            this.cancelButton.Name = "cancelButton";
            this.cancelButton.Size = new System.Drawing.Size(120, 40);
            this.cancelButton.TabIndex = 2;
            this.cancelButton.Text = "Annuler";
            this.cancelButton.UseVisualStyleBackColor = false;
            this.cancelButton.Click += new System.EventHandler(this.OnCancelClick);
            // 
            // backButton
            // 
            this.backButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.backButton.BackColor = System.Drawing.Color.White;
            this.backButton.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.backButton.Font = new System.Drawing.Font("Segoe UI Semibold", 10F, System.Drawing.FontStyle.Bold);
            this.backButton.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(20)))), ((int)(((byte)(31)))), ((int)(((byte)(54)))));
            this.backButton.Location = new System.Drawing.Point(454, 16);
            this.backButton.Name = "backButton";
            this.backButton.Size = new System.Drawing.Size(120, 40);
            this.backButton.TabIndex = 1;
            this.backButton.Text = "Retour";
            this.backButton.UseVisualStyleBackColor = false;
            this.backButton.Click += new System.EventHandler(this.OnBackClick);
            // 
            // nextButton
            // 
            this.nextButton.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Right)));
            this.nextButton.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(24)))), ((int)(((byte)(142)))), ((int)(((byte)(215)))));
            this.nextButton.FlatAppearance.BorderSize = 0;
            this.nextButton.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.nextButton.Font = new System.Drawing.Font("Segoe UI Semibold", 10F, System.Drawing.FontStyle.Bold);
            this.nextButton.ForeColor = System.Drawing.Color.White;
            this.nextButton.Location = new System.Drawing.Point(717, 16);
            this.nextButton.Name = "nextButton";
            this.nextButton.Size = new System.Drawing.Size(139, 40);
            this.nextButton.TabIndex = 0;
            this.nextButton.Text = "Suivant";
            this.nextButton.UseVisualStyleBackColor = false;
            this.nextButton.Click += new System.EventHandler(this.OnNextClick);
            // 
            // MainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.BackColor = System.Drawing.Color.White;
            this.ClientSize = new System.Drawing.Size(884, 654);
            this.Controls.Add(this.contentHostPanel);
            this.Controls.Add(this.footerPanel);
            this.Controls.Add(this.headerPanel);
            this.Font = new System.Drawing.Font("Segoe UI", 9F);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "MainForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Installation de l'agent VigiSensys";
            this.headerPanel.ResumeLayout(false);
            this.headerPanel.PerformLayout();
            this.contentHostPanel.ResumeLayout(false);
            this.welcomePanel.ResumeLayout(false);
            this.welcomePanel.PerformLayout();
            this.installPanel.ResumeLayout(false);
            this.installPanel.PerformLayout();
            this.finishPanel.ResumeLayout(false);
            this.finishPanel.PerformLayout();
            this.footerPanel.ResumeLayout(false);
            this.ResumeLayout(false);

        }
    }
}
