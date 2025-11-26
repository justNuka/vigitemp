using System;
using System.Drawing;
using System.Drawing.Text;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace VigitempAgent
{
    public partial class Form_Alert : Form
    {


        PrivateFontCollection fonts = new PrivateFontCollection();
        private string SITEWEB_URL;
        public Form_Alert(string p_SITEWEB_URL)
        {
            InitializeComponent();
            SITEWEB_URL = p_SITEWEB_URL;
            foreach (Control ctl in this.Controls)
            {
                ctl.MouseClick += new MouseEventHandler(Form_Alert_Click);
            }
        }

        public enum enumAction
        {
            wait,
            start,
            restart_1,
            restart_2,
            close
        }

        private Form_Alert.enumAction action;

        private int x, y;

        private void button2_Click(object sender, EventArgs e)
        {
            timer1.Interval = 1;
            action = enumAction.close;
        }

        private void timer1_Tick(object sender, EventArgs e)
        {


            //if (!this.IsHandleCreated)
            //    this.CreateHandle();
            //this.Invoke((MethodInvoker)delegate {
            switch (this.action)
            {
                case enumAction.wait:
                    timer1.Interval = 10000;
                    break;
                case enumAction.start:
                    timer1.Interval = 1;
                    this.Opacity += 0.1;
                    if (this.Location.Y == 10)
                    {
                        this.action = enumAction.restart_1;
                        break;
                    }

                    if (this.Location.Y < 10)
                    {
                        this.Top += (int)Math.Ceiling((10 - this.Location.Y) * 0.1);
                    }
                    else
                    {
                        action = enumAction.wait;
                    }
                    break; 
                case enumAction.restart_1:
                    timer1.Interval = 1;
                    this.Opacity -= 0.02;
                    if (this.Opacity < 0.5)
                    {
                        action = enumAction.restart_2;
                    }
                    break;
                case enumAction.restart_2:
                    timer1.Interval = 1;
                    this.Opacity += 0.02;
                    if (this.Opacity == 1)
                    {
                        action = enumAction.wait;
                    }
                    break;
                case enumAction.close:
                    timer1.Interval = 1;
                    this.Opacity -= 0.1;
                    this.Top -= 3;
                    if (base.Opacity == 0.0)
                    {
                        base.Hide();
                    }
                    break;
            }
            //});
            //switch (this.action)
            //{
            //    case enumAction.wait:
            //        timer1.Interval = 5000;
            //        action = enumAction.close;
            //        break;
            //    case enumAction.start:
            //        timer1.Interval = 1;
            //        this.Opacity += 0.1;
            //        if (this.x < this.Location.X)
            //        {
            //            this.Left--;
            //        }
            //        else
            //        {
            //            if (this.Opacity == 1.0)
            //            {
            //                action = enumAction.wait;
            //            }
            //        }
            //        break;
            //    case enumAction.close:
            //        timer1.Interval = 1;
            //        this.Opacity -= 0.1;
            //        this.Left -= 3;
            //        if (base.Opacity == 0.0)
            //        {
            //            base.Close();
            //        }
            //        break;
            //}
        }

        public void showAlert(string msg)
        {

            byte[] fontData = Properties.Resources.Poppins_SemiBold;
            IntPtr fontPtr = System.Runtime.InteropServices.Marshal.AllocCoTaskMem(fontData.Length);
            Marshal.Copy(fontData, 0, fontPtr, fontData.Length);
            uint dummy = 0;
            fonts.AddMemoryFont(fontPtr, Properties.Resources.Poppins_SemiBold.Length);
            AddFontMemResourceEx(fontPtr, (uint)Properties.Resources.Poppins_SemiBold.Length, IntPtr.Zero, ref dummy);
            Marshal.FreeCoTaskMem(fontPtr);

            this.label2.Font = new Font(fonts.Families[0], 14.0F);
            this.Opacity = 1.0;
            this.StartPosition = FormStartPosition.Manual;

            //Form_Alert frm = (Form_Alert)Application.OpenForms["form_Alert"];

            if(this.Visible == false)
            {
                this.Name = "form_Alert";
                this.x = Screen.PrimaryScreen.WorkingArea.Width - Screen.PrimaryScreen.WorkingArea.Width / 2 - this.Width / 2;
                this.y = -this.Height - 15;
                this.Location = new Point(this.x, this.y);
                this.x = Screen.PrimaryScreen.WorkingArea.Width - base.Width - 5;
                this.Show();
            }
            

            this.TopMost = true;
            this.action = enumAction.start;
            this.timer1.Interval = 1;
            timer1.Start();
        }

        public void hideAlert(string msg)
        {
            //this.action = enumAction.start;
            //this.timer1.Interval = 1;
            //timer1.Start();
            timer1.Interval = 1;
            action = enumAction.close;
        }


        private void Form_Alert_Load(object sender, EventArgs e)
        {
            Region = Region.FromHrgn(CreateRoundRectRgn(0, 0, Width, Height, 20, 20));

        }

        [DllImport("gdi32.dll")]
        private static extern IntPtr AddFontMemResourceEx(IntPtr pbFont, uint cbFont, IntPtr pdv, [In] ref uint pcFonts);

        [DllImport("Gdi32.dll", EntryPoint = "CreateRoundRectRgn")]
        private static extern IntPtr CreateRoundRectRgn
        (
            int nLeftRect,     // x-coordinate of upper-left corner
            int nTopRect,      // y-coordinate of upper-left corner
            int nRightRect,    // x-coordinate of lower-right corner
            int nBottomRect,   // y-coordinate of lower-right corner
            int nWidthEllipse, // width of ellipse
            int nHeightEllipse // height of ellipse
        );

        private void Form_Alert_Click(object sender, EventArgs e)
        {
            System.Diagnostics.Process.Start(SITEWEB_URL + "/metrologie/alarmes");
            //timer1.Interval = 1;
            //action = enumAction.close;
        }

        private void button1_Click_1(object sender, EventArgs e)
        {
            System.Diagnostics.Process.Start(SITEWEB_URL + "/metrologie/alarmes");
            //timer1.Interval = 1;
            action = enumAction.close;
        }

        private void labelmessage_Click_1(object sender, EventArgs e)
        {

        }

        private void button2_Click_1(object sender, EventArgs e)
        {

        }

        public void DisplayAlarm()
        {
            if (this.InvokeRequired)
            {
                this.Invoke(new Action(() =>
                {
                    this.showAlert("alarm");
                    //MessageBox.Show("Alarm triggered!");
                }));
            }
            else
            {

                this.showAlert("alarm");
                //MessageBox.Show("Alarm triggered!");
            }
        }

        private void button3_Click(object sender, EventArgs e)
        {

        }

        private void label1_Click(object sender, EventArgs e)
        {

        }

        private void pictureBox1_Click(object sender, EventArgs e)
        {

        }

        private void button1_Click(object sender, EventArgs e)
        {

        }

        public void HideAlarm()
        {
            if (this.InvokeRequired)
            {
                this.Invoke(new Action(() =>
                {
                    this.hideAlert("alarm");
                    //MessageBox.Show("Alarm triggered!");
                }));
            }
            else
            {

                this.hideAlert("alarm");
                //MessageBox.Show("Alarm triggered!");
            }
        }


    }
}
