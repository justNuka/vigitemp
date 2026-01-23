namespace VigitempAgentInstaller
{
    partial class MainForm
    {
        private System.ComponentModel.IContainer components = null;
        private System.Windows.Forms.TableLayoutPanel tableLayoutPanel;
        private System.Windows.Forms.Label serverIpLabel;
        private System.Windows.Forms.TextBox serverIpTextBox;
        private System.Windows.Forms.Label siteUrlLabel;
        private System.Windows.Forms.TextBox siteUrlTextBox;
        private System.Windows.Forms.Label installPathLabel;
        private System.Windows.Forms.TextBox installPathTextBox;
        private System.Windows.Forms.Button browseButton;
        private System.Windows.Forms.CheckBox autoStartCheckBox;
        private System.Windows.Forms.CheckBox launchCheckBox;
        private System.Windows.Forms.Button installButton;
        private System.Windows.Forms.TextBox logTextBox;

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
            this.tableLayoutPanel = new System.Windows.Forms.TableLayoutPanel();
            this.serverIpLabel = new System.Windows.Forms.Label();
            this.serverIpTextBox = new System.Windows.Forms.TextBox();
            this.siteUrlLabel = new System.Windows.Forms.Label();
            this.siteUrlTextBox = new System.Windows.Forms.TextBox();
            this.installPathLabel = new System.Windows.Forms.Label();
            this.installPathTextBox = new System.Windows.Forms.TextBox();
            this.browseButton = new System.Windows.Forms.Button();
            this.autoStartCheckBox = new System.Windows.Forms.CheckBox();
            this.launchCheckBox = new System.Windows.Forms.CheckBox();
            this.installButton = new System.Windows.Forms.Button();
            this.logTextBox = new System.Windows.Forms.TextBox();
            this.tableLayoutPanel.SuspendLayout();
            this.SuspendLayout();
            // 
            // tableLayoutPanel
            // 
            this.tableLayoutPanel.ColumnCount = 3;
            this.tableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 140F));
            this.tableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.tableLayoutPanel.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 90F));
            this.tableLayoutPanel.Controls.Add(this.serverIpLabel, 0, 0);
            this.tableLayoutPanel.Controls.Add(this.serverIpTextBox, 1, 0);
            this.tableLayoutPanel.Controls.Add(this.siteUrlLabel, 0, 1);
            this.tableLayoutPanel.Controls.Add(this.siteUrlTextBox, 1, 1);
            this.tableLayoutPanel.Controls.Add(this.installPathLabel, 0, 2);
            this.tableLayoutPanel.Controls.Add(this.installPathTextBox, 1, 2);
            this.tableLayoutPanel.Controls.Add(this.browseButton, 2, 2);
            this.tableLayoutPanel.Controls.Add(this.autoStartCheckBox, 1, 3);
            this.tableLayoutPanel.Controls.Add(this.launchCheckBox, 1, 4);
            this.tableLayoutPanel.Controls.Add(this.installButton, 2, 4);
            this.tableLayoutPanel.Dock = System.Windows.Forms.DockStyle.Top;
            this.tableLayoutPanel.Location = new System.Drawing.Point(12, 12);
            this.tableLayoutPanel.Name = "tableLayoutPanel";
            this.tableLayoutPanel.RowCount = 5;
            this.tableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 28F));
            this.tableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 28F));
            this.tableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 28F));
            this.tableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 26F));
            this.tableLayoutPanel.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Absolute, 30F));
            this.tableLayoutPanel.Size = new System.Drawing.Size(640, 140);
            this.tableLayoutPanel.TabIndex = 0;
            // 
            // serverIpLabel
            // 
            this.serverIpLabel.AutoSize = true;
            this.serverIpLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.serverIpLabel.Location = new System.Drawing.Point(3, 0);
            this.serverIpLabel.Name = "serverIpLabel";
            this.serverIpLabel.Size = new System.Drawing.Size(134, 28);
            this.serverIpLabel.TabIndex = 0;
            this.serverIpLabel.Text = "Server IP";
            this.serverIpLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // serverIpTextBox
            // 
            this.serverIpTextBox.Dock = System.Windows.Forms.DockStyle.Fill;
            this.serverIpTextBox.Location = new System.Drawing.Point(143, 4);
            this.serverIpTextBox.Margin = new System.Windows.Forms.Padding(3, 4, 3, 3);
            this.serverIpTextBox.Name = "serverIpTextBox";
            this.serverIpTextBox.Size = new System.Drawing.Size(404, 20);
            this.serverIpTextBox.TabIndex = 1;
            this.serverIpTextBox.TextChanged += new System.EventHandler(this.OnServerIpChanged);
            // 
            // siteUrlLabel
            // 
            this.siteUrlLabel.AutoSize = true;
            this.siteUrlLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.siteUrlLabel.Location = new System.Drawing.Point(3, 28);
            this.siteUrlLabel.Name = "siteUrlLabel";
            this.siteUrlLabel.Size = new System.Drawing.Size(134, 28);
            this.siteUrlLabel.TabIndex = 2;
            this.siteUrlLabel.Text = "Site web URL";
            this.siteUrlLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // siteUrlTextBox
            // 
            this.siteUrlTextBox.Dock = System.Windows.Forms.DockStyle.Fill;
            this.siteUrlTextBox.Location = new System.Drawing.Point(143, 32);
            this.siteUrlTextBox.Margin = new System.Windows.Forms.Padding(3, 4, 3, 3);
            this.siteUrlTextBox.Name = "siteUrlTextBox";
            this.siteUrlTextBox.Size = new System.Drawing.Size(404, 20);
            this.siteUrlTextBox.TabIndex = 3;
            this.siteUrlTextBox.TextChanged += new System.EventHandler(this.OnSiteUrlChanged);
            // 
            // installPathLabel
            // 
            this.installPathLabel.AutoSize = true;
            this.installPathLabel.Dock = System.Windows.Forms.DockStyle.Fill;
            this.installPathLabel.Location = new System.Drawing.Point(3, 56);
            this.installPathLabel.Name = "installPathLabel";
            this.installPathLabel.Size = new System.Drawing.Size(134, 28);
            this.installPathLabel.TabIndex = 4;
            this.installPathLabel.Text = "Install path";
            this.installPathLabel.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // installPathTextBox
            // 
            this.installPathTextBox.Dock = System.Windows.Forms.DockStyle.Fill;
            this.installPathTextBox.Location = new System.Drawing.Point(143, 60);
            this.installPathTextBox.Margin = new System.Windows.Forms.Padding(3, 4, 3, 3);
            this.installPathTextBox.Name = "installPathTextBox";
            this.installPathTextBox.Size = new System.Drawing.Size(404, 20);
            this.installPathTextBox.TabIndex = 5;
            // 
            // browseButton
            // 
            this.browseButton.Dock = System.Windows.Forms.DockStyle.Fill;
            this.browseButton.Location = new System.Drawing.Point(553, 60);
            this.browseButton.Margin = new System.Windows.Forms.Padding(3, 4, 3, 3);
            this.browseButton.Name = "browseButton";
            this.browseButton.Size = new System.Drawing.Size(84, 21);
            this.browseButton.TabIndex = 6;
            this.browseButton.Text = "Browse...";
            this.browseButton.UseVisualStyleBackColor = true;
            this.browseButton.Click += new System.EventHandler(this.OnBrowseInstallPath);
            // 
            // autoStartCheckBox
            // 
            this.autoStartCheckBox.AutoSize = true;
            this.autoStartCheckBox.Dock = System.Windows.Forms.DockStyle.Fill;
            this.autoStartCheckBox.Location = new System.Drawing.Point(143, 87);
            this.autoStartCheckBox.Name = "autoStartCheckBox";
            this.autoStartCheckBox.Size = new System.Drawing.Size(404, 20);
            this.autoStartCheckBox.TabIndex = 7;
            this.autoStartCheckBox.Text = "Start on Windows boot";
            this.autoStartCheckBox.UseVisualStyleBackColor = true;
            // 
            // launchCheckBox
            // 
            this.launchCheckBox.AutoSize = true;
            this.launchCheckBox.Dock = System.Windows.Forms.DockStyle.Fill;
            this.launchCheckBox.Location = new System.Drawing.Point(143, 113);
            this.launchCheckBox.Name = "launchCheckBox";
            this.launchCheckBox.Size = new System.Drawing.Size(404, 24);
            this.launchCheckBox.TabIndex = 8;
            this.launchCheckBox.Text = "Start agent after install";
            this.launchCheckBox.UseVisualStyleBackColor = true;
            // 
            // installButton
            // 
            this.installButton.Dock = System.Windows.Forms.DockStyle.Fill;
            this.installButton.Location = new System.Drawing.Point(553, 113);
            this.installButton.Name = "installButton";
            this.installButton.Size = new System.Drawing.Size(84, 24);
            this.installButton.TabIndex = 9;
            this.installButton.Text = "Install";
            this.installButton.UseVisualStyleBackColor = true;
            this.installButton.Click += new System.EventHandler(this.OnInstallClick);
            // 
            // logTextBox
            // 
            this.logTextBox.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom)
            | System.Windows.Forms.AnchorStyles.Left)
            | System.Windows.Forms.AnchorStyles.Right)));
            this.logTextBox.Location = new System.Drawing.Point(12, 160);
            this.logTextBox.Multiline = true;
            this.logTextBox.Name = "logTextBox";
            this.logTextBox.ReadOnly = true;
            this.logTextBox.ScrollBars = System.Windows.Forms.ScrollBars.Vertical;
            this.logTextBox.Size = new System.Drawing.Size(640, 230);
            this.logTextBox.TabIndex = 1;
            // 
            // MainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(664, 402);
            this.Controls.Add(this.logTextBox);
            this.Controls.Add(this.tableLayoutPanel);
            this.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.Name = "MainForm";
            this.Padding = new System.Windows.Forms.Padding(12);
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Vigitemp Agent Installer";
            this.tableLayoutPanel.ResumeLayout(false);
            this.tableLayoutPanel.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();
        }
    }
}
