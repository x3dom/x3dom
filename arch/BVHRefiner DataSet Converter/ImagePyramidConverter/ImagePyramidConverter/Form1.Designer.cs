namespace ImagePyramidConverter
{
    partial class Form1
    {
        /// <summary>
        /// Erforderliche Designervariable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Verwendete Ressourcen bereinigen.
        /// </summary>
        /// <param name="disposing">True, wenn verwaltete Ressourcen gelöscht werden sollen; andernfalls False.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Vom Windows Form-Designer generierter Code

        /// <summary>
        /// Erforderliche Methode für die Designerunterstützung.
        /// Der Inhalt der Methode darf nicht mit dem Code-Editor geändert werden.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Form1));
            this.groupBox1 = new System.Windows.Forms.GroupBox();
            this.image_pb = new System.Windows.Forms.PictureBox();
            this.image_btn = new System.Windows.Forms.Button();
            this.advancedSettings = new System.Windows.Forms.GroupBox();
            this.label3 = new System.Windows.Forms.Label();
            this.meshDimension = new System.Windows.Forms.TextBox();
            this.label2 = new System.Windows.Forms.Label();
            this.convertingType = new System.Windows.Forms.ComboBox();
            this.label1 = new System.Windows.Forms.Label();
            this.qtDepth = new System.Windows.Forms.TextBox();
            this.groupBox4 = new System.Windows.Forms.GroupBox();
            this.storingPath = new System.Windows.Forms.TextBox();
            this.storing_btn = new System.Windows.Forms.Button();
            this.convert_btn = new System.Windows.Forms.Button();
            this.convertState = new System.Windows.Forms.ProgressBar();
            this.groupBox2 = new System.Windows.Forms.GroupBox();
            this.label4 = new System.Windows.Forms.Label();
            this.datasetFormat = new System.Windows.Forms.ComboBox();
            this.label5 = new System.Windows.Forms.Label();
            this.datasetType = new System.Windows.Forms.ComboBox();
            this.advancedSettings_cb = new System.Windows.Forms.CheckBox();
            this.menuStrip1 = new System.Windows.Forms.MenuStrip();
            this.infoToolStripMenuItem = new System.Windows.Forms.ToolStripMenuItem();
            this.groupBox1.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.image_pb)).BeginInit();
            this.advancedSettings.SuspendLayout();
            this.groupBox4.SuspendLayout();
            this.groupBox2.SuspendLayout();
            this.menuStrip1.SuspendLayout();
            this.SuspendLayout();
            // 
            // groupBox1
            // 
            this.groupBox1.Controls.Add(this.image_pb);
            this.groupBox1.Controls.Add(this.image_btn);
            this.groupBox1.Location = new System.Drawing.Point(12, 36);
            this.groupBox1.Name = "groupBox1";
            this.groupBox1.Size = new System.Drawing.Size(310, 372);
            this.groupBox1.TabIndex = 7;
            this.groupBox1.TabStop = false;
            this.groupBox1.Text = "Convertion Image";
            // 
            // image_pb
            // 
            this.image_pb.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            this.image_pb.Location = new System.Drawing.Point(6, 22);
            this.image_pb.Name = "image_pb";
            this.image_pb.Size = new System.Drawing.Size(298, 298);
            this.image_pb.TabIndex = 7;
            this.image_pb.TabStop = false;
            this.image_pb.Click += new System.EventHandler(this.image_pb_Click);
            // 
            // image_btn
            // 
            this.image_btn.Font = new System.Drawing.Font("Calibri", 9.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.image_btn.Location = new System.Drawing.Point(5, 324);
            this.image_btn.Name = "image_btn";
            this.image_btn.Size = new System.Drawing.Size(299, 42);
            this.image_btn.TabIndex = 6;
            this.image_btn.Text = "Choose Image";
            this.image_btn.UseVisualStyleBackColor = true;
            this.image_btn.Click += new System.EventHandler(this.image_btn_Click);
            // 
            // advancedSettings
            // 
            this.advancedSettings.Controls.Add(this.label3);
            this.advancedSettings.Controls.Add(this.meshDimension);
            this.advancedSettings.Controls.Add(this.label2);
            this.advancedSettings.Controls.Add(this.convertingType);
            this.advancedSettings.Controls.Add(this.label1);
            this.advancedSettings.Controls.Add(this.qtDepth);
            this.advancedSettings.Enabled = false;
            this.advancedSettings.Location = new System.Drawing.Point(329, 281);
            this.advancedSettings.Name = "advancedSettings";
            this.advancedSettings.Size = new System.Drawing.Size(311, 127);
            this.advancedSettings.TabIndex = 9;
            this.advancedSettings.TabStop = false;
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Font = new System.Drawing.Font("Calibri", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label3.Location = new System.Drawing.Point(8, 34);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(101, 15);
            this.label3.TabIndex = 20;
            this.label3.Text = "Mesh Resolution:";
            // 
            // meshDimension
            // 
            this.meshDimension.Font = new System.Drawing.Font("Microsoft Sans Serif", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.meshDimension.Location = new System.Drawing.Point(247, 30);
            this.meshDimension.Name = "meshDimension";
            this.meshDimension.Size = new System.Drawing.Size(55, 22);
            this.meshDimension.TabIndex = 19;
            this.meshDimension.Text = "0";
            this.meshDimension.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Font = new System.Drawing.Font("Calibri", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label2.Location = new System.Drawing.Point(9, 89);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(70, 15);
            this.label2.TabIndex = 8;
            this.label2.Text = "Image Type:";
            // 
            // convertingType
            // 
            this.convertingType.Font = new System.Drawing.Font("Calibri", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.convertingType.FormattingEnabled = true;
            this.convertingType.Items.AddRange(new object[] {
            "png",
            "jpg",
            "gif"});
            this.convertingType.Location = new System.Drawing.Point(247, 86);
            this.convertingType.Name = "convertingType";
            this.convertingType.Size = new System.Drawing.Size(56, 23);
            this.convertingType.TabIndex = 6;
            this.convertingType.Text = "png";
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Font = new System.Drawing.Font("Calibri", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label1.Location = new System.Drawing.Point(9, 62);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(130, 15);
            this.label1.TabIndex = 3;
            this.label1.Text = "Depth of the Quadtree:";
            // 
            // qtDepth
            // 
            this.qtDepth.Font = new System.Drawing.Font("Microsoft Sans Serif", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.qtDepth.Location = new System.Drawing.Point(247, 58);
            this.qtDepth.Name = "qtDepth";
            this.qtDepth.Size = new System.Drawing.Size(55, 22);
            this.qtDepth.TabIndex = 2;
            this.qtDepth.Text = "0";
            this.qtDepth.TextAlign = System.Windows.Forms.HorizontalAlignment.Right;
            // 
            // groupBox4
            // 
            this.groupBox4.Controls.Add(this.storingPath);
            this.groupBox4.Controls.Add(this.storing_btn);
            this.groupBox4.Location = new System.Drawing.Point(329, 36);
            this.groupBox4.Name = "groupBox4";
            this.groupBox4.Size = new System.Drawing.Size(311, 110);
            this.groupBox4.TabIndex = 10;
            this.groupBox4.TabStop = false;
            this.groupBox4.Text = "Storage directory of converted dataset";
            // 
            // storingPath
            // 
            this.storingPath.Font = new System.Drawing.Font("Calibri", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.storingPath.Location = new System.Drawing.Point(6, 25);
            this.storingPath.Name = "storingPath";
            this.storingPath.ReadOnly = true;
            this.storingPath.Size = new System.Drawing.Size(298, 23);
            this.storingPath.TabIndex = 13;
            this.storingPath.Click += new System.EventHandler(this.storingPath_Click);
            // 
            // storing_btn
            // 
            this.storing_btn.Font = new System.Drawing.Font("Calibri", 9.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.storing_btn.Location = new System.Drawing.Point(6, 59);
            this.storing_btn.Name = "storing_btn";
            this.storing_btn.Size = new System.Drawing.Size(299, 44);
            this.storing_btn.TabIndex = 14;
            this.storing_btn.Text = "Choose Storage Directory";
            this.storing_btn.Click += new System.EventHandler(this.storing_btn_Click);
            // 
            // convert_btn
            // 
            this.convert_btn.Font = new System.Drawing.Font("Calibri", 12F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.convert_btn.Location = new System.Drawing.Point(12, 418);
            this.convert_btn.Name = "convert_btn";
            this.convert_btn.Size = new System.Drawing.Size(629, 47);
            this.convert_btn.TabIndex = 11;
            this.convert_btn.Text = "Convert Dataset ";
            this.convert_btn.UseVisualStyleBackColor = true;
            this.convert_btn.Click += new System.EventHandler(this.convert_btn_Click);
            // 
            // convertState
            // 
            this.convertState.Location = new System.Drawing.Point(12, 471);
            this.convertState.Name = "convertState";
            this.convertState.Size = new System.Drawing.Size(629, 32);
            this.convertState.TabIndex = 12;
            // 
            // groupBox2
            // 
            this.groupBox2.Controls.Add(this.label4);
            this.groupBox2.Controls.Add(this.datasetFormat);
            this.groupBox2.Controls.Add(this.label5);
            this.groupBox2.Controls.Add(this.datasetType);
            this.groupBox2.Location = new System.Drawing.Point(329, 166);
            this.groupBox2.Name = "groupBox2";
            this.groupBox2.Size = new System.Drawing.Size(311, 94);
            this.groupBox2.TabIndex = 15;
            this.groupBox2.TabStop = false;
            this.groupBox2.Text = "Convertion Settings";
            // 
            // label4
            // 
            this.label4.AutoSize = true;
            this.label4.Font = new System.Drawing.Font("Calibri", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label4.Location = new System.Drawing.Point(9, 60);
            this.label4.Name = "label4";
            this.label4.Size = new System.Drawing.Size(94, 15);
            this.label4.TabIndex = 20;
            this.label4.Text = "Dataset Format:";
            // 
            // datasetFormat
            // 
            this.datasetFormat.Font = new System.Drawing.Font("Calibri", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.datasetFormat.FormattingEnabled = true;
            this.datasetFormat.Items.AddRange(new object[] {
            "wmts",
            "tree"});
            this.datasetFormat.Location = new System.Drawing.Point(249, 57);
            this.datasetFormat.Name = "datasetFormat";
            this.datasetFormat.Size = new System.Drawing.Size(54, 23);
            this.datasetFormat.TabIndex = 19;
            this.datasetFormat.Text = "wmts";
            // 
            // label5
            // 
            this.label5.AutoSize = true;
            this.label5.Font = new System.Drawing.Font("Calibri", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label5.Location = new System.Drawing.Point(8, 30);
            this.label5.Name = "label5";
            this.label5.Size = new System.Drawing.Size(96, 15);
            this.label5.TabIndex = 16;
            this.label5.Text = "Convertion Type:";
            // 
            // datasetType
            // 
            this.datasetType.Font = new System.Drawing.Font("Calibri", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.datasetType.FormattingEnabled = true;
            this.datasetType.Items.AddRange(new object[] {
            "Displacement-Map",
            "Surface-Texture",
            "Normal-Map"});
            this.datasetType.Location = new System.Drawing.Point(165, 28);
            this.datasetType.Name = "datasetType";
            this.datasetType.Size = new System.Drawing.Size(137, 23);
            this.datasetType.TabIndex = 15;
            this.datasetType.Text = "Displacement-Map";
            this.datasetType.SelectedIndexChanged += new System.EventHandler(this.datasetType_SelectedIndexChanged);
            // 
            // advancedSettings_cb
            // 
            this.advancedSettings_cb.AutoSize = true;
            this.advancedSettings_cb.Location = new System.Drawing.Point(335, 281);
            this.advancedSettings_cb.Name = "advancedSettings_cb";
            this.advancedSettings_cb.Size = new System.Drawing.Size(148, 19);
            this.advancedSettings_cb.TabIndex = 16;
            this.advancedSettings_cb.Text = "Use Advanced Settings";
            this.advancedSettings_cb.UseVisualStyleBackColor = true;
            this.advancedSettings_cb.CheckedChanged += new System.EventHandler(this.advancedSettings_cb_CheckedChanged);
            // 
            // menuStrip1
            // 
            this.menuStrip1.BackColor = System.Drawing.Color.Silver;
            this.menuStrip1.Font = new System.Drawing.Font("Calibri", 9F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.menuStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.infoToolStripMenuItem});
            this.menuStrip1.Location = new System.Drawing.Point(0, 0);
            this.menuStrip1.Name = "menuStrip1";
            this.menuStrip1.Size = new System.Drawing.Size(652, 24);
            this.menuStrip1.TabIndex = 17;
            this.menuStrip1.Text = "menuStrip1";
            // 
            // infoToolStripMenuItem
            // 
            this.infoToolStripMenuItem.Name = "infoToolStripMenuItem";
            this.infoToolStripMenuItem.Size = new System.Drawing.Size(48, 20);
            this.infoToolStripMenuItem.Text = "About";
            this.infoToolStripMenuItem.Click += new System.EventHandler(this.infoToolStripMenuItem_Click);
            // 
            // Form1
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(7F, 15F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(652, 514);
            this.Controls.Add(this.advancedSettings_cb);
            this.Controls.Add(this.groupBox2);
            this.Controls.Add(this.convertState);
            this.Controls.Add(this.convert_btn);
            this.Controls.Add(this.groupBox4);
            this.Controls.Add(this.advancedSettings);
            this.Controls.Add(this.groupBox1);
            this.Controls.Add(this.menuStrip1);
            this.Font = new System.Drawing.Font("Calibri", 9.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.Icon = ((System.Drawing.Icon)(resources.GetObject("$this.Icon")));
            this.MainMenuStrip = this.menuStrip1;
            this.MaximumSize = new System.Drawing.Size(668, 552);
            this.MinimumSize = new System.Drawing.Size(668, 552);
            this.Name = "Form1";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "BVHRefiner Dataset Converter";
            this.FormClosing += new System.Windows.Forms.FormClosingEventHandler(this.Form1_FormClosing);
            this.groupBox1.ResumeLayout(false);
            ((System.ComponentModel.ISupportInitialize)(this.image_pb)).EndInit();
            this.advancedSettings.ResumeLayout(false);
            this.advancedSettings.PerformLayout();
            this.groupBox4.ResumeLayout(false);
            this.groupBox4.PerformLayout();
            this.groupBox2.ResumeLayout(false);
            this.groupBox2.PerformLayout();
            this.menuStrip1.ResumeLayout(false);
            this.menuStrip1.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.GroupBox groupBox1;
        private System.Windows.Forms.PictureBox image_pb;
        private System.Windows.Forms.Button image_btn;
        private System.Windows.Forms.GroupBox advancedSettings;
        private System.Windows.Forms.TextBox qtDepth;
        private System.Windows.Forms.GroupBox groupBox4;
        private System.Windows.Forms.TextBox storingPath;
        private System.Windows.Forms.Button storing_btn;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Button convert_btn;
        private System.Windows.Forms.ProgressBar convertState;
        private System.Windows.Forms.ComboBox convertingType;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.CheckBox advancedSettings_cb;
        private System.Windows.Forms.GroupBox groupBox2;
        private System.Windows.Forms.Label label5;
        private System.Windows.Forms.ComboBox datasetType;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.TextBox meshDimension;
        private System.Windows.Forms.Label label4;
        private System.Windows.Forms.ComboBox datasetFormat;
        private System.Windows.Forms.MenuStrip menuStrip1;
        private System.Windows.Forms.ToolStripMenuItem infoToolStripMenuItem;

    }
}

