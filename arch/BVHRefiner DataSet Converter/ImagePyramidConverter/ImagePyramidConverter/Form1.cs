using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using AForge.Imaging.Filters;
using System.Collections;
using System.IO;
using System.Drawing.Imaging;
using AForge.Imaging;
using System.Diagnostics;

namespace ImagePyramidConverter
{
    public partial class Form1 : Form
    {
        // original input image
        private Bitmap image;



        /// <summary>
        /// Initializes the component
        /// </summary>
        public Form1()
        {
            InitializeComponent();
        }



        /// <summary>
        /// Finishes the application
        /// </summary>
        void Form1_FormClosing(object sender, FormClosingEventArgs e)
        {
            Application.Exit();
        }



        /// <summary>
        /// Loads an image that can be chosen by File-Dialog
        /// </summary>
        private void image_btn_Click(object sender, EventArgs e)
        {
            openImage();
        }



        /// <summary>
        /// Loads an image that can be chosen by File-Dialog
        /// </summary>
        private void image_pb_Click(object sender, EventArgs e)
        {
            openImage();
        }



        /// <summary>
        /// Opens an image by File-Dialog
        /// </summary>
        private void openImage()
        {
            String imagePath = createOpenFileDialog("Opening an image that should be converted");
            if (imagePath != "")
            {
                image = new Bitmap(imagePath);
                Bitmap bmpNew = AForge.Imaging.Image.Clone(image,
                                System.Drawing.Imaging.PixelFormat.Format24bppRgb);
                image_pb.Image = createImagePreview(bmpNew);

                autoCalculateSettings();
            }
        }



        /// <summary>
        /// Opens a File-Dialog
        /// </summary>
        private String createOpenFileDialog(String headline) {

            OpenFileDialog fd = new OpenFileDialog();
            fd.Filter = "all files (*.png, *.jpg, *.gif,*.tiff)|*.png;*.jpg;*.gif*.tiff|" + 
                        "png files (*.png)|*.png|jpg files (*.jpg)|*.jpg|" + 
                        "gif files (*.gif)|*.gif|tiff files (*.tif,*.tiff)|*.tif;*.tiff";
            fd.Title = headline;
            fd.Multiselect = false;
            fd.InitialDirectory = ImagePyramidConverter.Properties.
                                            Resources.LastFilePath;
            if (fd.ShowDialog() == DialogResult.OK)
            {
                 return fd.FileName;
            }

            return "";
        }



        /// <summary>
        /// Creates a preview image
        /// </summary>
        private Bitmap createImagePreview(Bitmap bmp) {
            ResizeNearestNeighbor filter = new ResizeNearestNeighbor(298, 298);
            return filter.Apply(bmp);
        }



        /// <summary>
        /// Creates a storage folder choose dialog
        /// </summary>
        private void storing_btn_Click(object sender, EventArgs e)
        {
            openFolderDialog();
        }



        /// <summary>
        /// Creates a storage folder choose dialog
        /// </summary>
        private void storingPath_Click(object sender, EventArgs e)
        {
            openFolderDialog();
        }



        /// <summary>
        /// Opens a Folder Dialog
        /// </summary>
        private void openFolderDialog()
        {
            FolderBrowserDialog fdb = new FolderBrowserDialog();

            fdb.SelectedPath = @"C:\Users\Michael\Desktop\test";
            if (fdb.ShowDialog() == DialogResult.OK)
            {
                storingPath.Text = fdb.SelectedPath;
            }
        }



        /// <summary>
        /// Disables GUI-Elements, tests the parameter conformance and starts the conversion
        /// </summary>
        private void convert_btn_Click(object sender, EventArgs e)
        {
            // Disables functionality of GUI during convertion
            groupBox1.Enabled = false;
            groupBox2.Enabled = false;
            groupBox4.Enabled = false;
            advancedSettings.Enabled = false;
            advancedSettings_cb.Enabled = false;
            convert_btn.Enabled = false;
            Application.DoEvents();

            // Converts only if a storage path and image is given
            if (storingPath.Text != "" && image != null &&
                Convert.ToInt32(qtDepth.Text) >= 0)     
            {
                // Displacement-Maps only operate exclusively with png
                if (datasetType.Text == "Displacement-Map" && convertingType.Text != "png")
                {
                    if (System.Windows.Forms.DialogResult.OK == 
                        MessageBox.Show("Displacement-Maps are only supported with the image type " + 
                                        "'png'. Please type 'OK' for switching to 'png' file format or " + 
                                        "'Cancel'.", "Information", 
                                        MessageBoxButtons.OKCancel, MessageBoxIcon.Asterisk))
                    {
                        convertingType.Text = "png";
                        CreatePyramid();
                    }
                }
                else
                {
                    CreatePyramid();
                }
            }
            else
            {
                MessageBox.Show("Please check parameters. Image or storage path are not given.", 
                                "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            groupBox1.Enabled = true;
            groupBox2.Enabled = true;
            groupBox4.Enabled = true;
            if (advancedSettings_cb.Checked)
                advancedSettings.Enabled = true;
            advancedSettings_cb.Enabled = true;
            convert_btn.Enabled = true;
        }



        /// <summary>
        /// Runs through all levels and creates the parameters that are required to
        /// produce all images for each level, and starts the conversion
        /// </summary>
        private void CreatePyramid()
        {
            // The resolution of the image has to be n*2+1 to grid size in x3dom
            int meshDim = Convert.ToInt32(meshDimension.Text) * 2 + 1;  
            double factor = 1.0;
            // List of nodes that is only required for tree extraction
            ArrayList nodes = new ArrayList();
            // Creates the coordinates on the image of the output size of all nodes
            UV[,] VertexData = createVertexData(meshDim);
            int entireTiles = 0;
            int currentTiles = 0;
            TreeTileData rootTreeTileData = null;

            // Calculation of the count of all tiles that should be produced in all levels
            for (int count = 0; count <= Convert.ToDouble(qtDepth.Text); count++)
            {
                entireTiles += (int)Math.Pow(4, count);
            }
            TreeTileData[] treeTileData = null;
            
            // Only required for tree output 
            if (datasetFormat.Text == "tree")
            {
                treeTileData = new TreeTileData[entireTiles];
                rootTreeTileData = new TreeTileData(Convert.ToInt32(qtDepth.Text),storingPath.Text, 0, 0, 0, 1, treeTileData);
            }

            // Convertion of all nodes of all levels
            for (double level = 0.0; level <= Convert.ToDouble(qtDepth.Text); level++)
            {
                int quadNumber = 0;
                int rowCount = (int)Math.Sqrt(Math.Pow(4.0, level));
                double step = 1.0 / (double)((double) rowCount);
                double xStep = 0.0, yStep = 0.0;
                
                // Convertion of all nodes of the current level
                for (int y = 0; y < rowCount; y++)
                {
                    for (int x = 0; x < rowCount; x++)
                    {
                        OutputNode node = new OutputNode(xStep, yStep, factor, (int)level, quadNumber,
                                                         VertexData,image, new Bitmap(meshDim, meshDim,
                                                         System.Drawing.Imaging.PixelFormat.Format32bppArgb),
                                                         storingPath.Text, convertingType.Text,
                                                         x, y, treeTileData);
                        node.CreateImage();
                        // Refresh the progress
                        currentTiles++;
                        convertState.Value = (int)Math.Floor((double)currentTiles / 
                                                            ((double)entireTiles / 
                                                            100.0));
                        quadNumber++;
                        xStep += step;

                        // Refresh the form 
                        convertState.Refresh();
                        this.Refresh();
                        Application.DoEvents();
                    }
                    xStep = 0.0;
                    yStep += step;
                }
                yStep = 0.0;
                factor /= 2;
            }

            // final message
            MessageBox.Show("The convertion has been finished successfully! \n " + 
                            "Please use the following configuration and replace all [] " + 
                            "through right pathes etc. (all settings with '*' are only " + 
                            "required if mode=3D): \n------------------------------------" + 
                            "---------------------------------------\n\n" +
                            "<BVHRefiner maxDepth='" + qtDepth.Text + "'" + 
                            "\n\t     minDepth='[0.." + qtDepth.Text + "]'" +
                            "\n\t     interactionDepth='[0.." + qtDepth.Text + "]'" +
                            "\n\t     smoothLoading='5'" +
                            "\n\t     subdivision='" + meshDimension.Text + " " + meshDimension.Text + "'" +
                            "\n\t     size='" + image.Width + " " + image.Width + "'" +
                            "\n\t     factor='10'" +
                            "\n\t     maxElevation='[0..n]'" +
                            "\n\t     elevationUrl='[path to elevation data]*'" +
                            "\n\t     textureUrl='[path to texture data]'" +
                            "\n\t     normalUrl='[path to normal data]*'" +
                            "\n\t     elevationFormat='[png]*'" +
                            "\n\t     textureFormat='[jpg, png, gif]'" +
                            "\n\t     normalFormat='[jpg, png, gif]*'" +
                            "\n\t     mode='[2D, 3D, bin, bvh]'>" + 
                            "\n</BVHRefiner>\n\n" + 
                            "The node is copied to clipboard automatically. Please insert in HTML with " + 
                            "'Ctrl + V'.", 
                            "Result message", 
                            MessageBoxButtons.OK, MessageBoxIcon.Information);
            convertState.Value = 0;

            // copy the node definition to clipboard
            String clipboardMessage = "<BVHRefiner maxDepth='" + qtDepth.Text + "'" +
                              "\n\t     minDepth='[0.." + qtDepth.Text + "]'" +
                              "\n\t     interactionDepth='[0.." + qtDepth.Text + "]'" +
                              "\n\t     smoothLoading='5'" +
                              "\n\t     subdivision='" + meshDimension.Text + " " + meshDimension.Text + "'" +
                              "\n\t     size='" + image.Width + " " + image.Width + "'" +
                              "\n\t     factor='10'" +
                              "\n\t     maxElevation='[0..n]'" +
                              "\n\t     elevationUrl='[path to elevation data]*'" +
                              "\n\t     textureUrl='[path to texture data]'" +
                              "\n\t     normalUrl='[path to normal data]*'" +
                              "\n\t     elevationFormat='[png]*'" +
                              "\n\t     textureFormat='[jpg, png, gif]'" +
                              "\n\t     normalFormat='[jpg, png, gif]*'" +
                              "\n\t     mode='[2D, 3D, bin, bvh]'>" +
                              "\n</BVHRefiner>";
            Clipboard.SetText(clipboardMessage);
        }



        /// <summary>
        /// Creates the coordinates of all pixels that will be generated in texture space 
        /// </summary>
        /// <param name="size">resolution in x and z direction</param>
        /// <returns></returns>
        private UV[,] createVertexData(double size)
        {
            UV [,] result = new UV[(int)(size), (int)(size)];
            double step = 1.0 / (size - 1.0);

            for (int y = 0; y < size; y ++)
            {
                for (int x = 0; x < size; x ++)
                {
                    result[(int)x, (int)y] = new UV(y * step, x * step);
                }
            }

            return result;
        }



        /// <summary>
        /// Enables/Disables the advanced setting parameters
        /// </summary>
        private void advancedSettings_cb_CheckedChanged(object sender, EventArgs e)
        {
            if (advancedSettings_cb.Checked == true)
            {
                advancedSettings.Enabled = true;
            }
            else
            {
                advancedSettings.Enabled = false;
            }
        }



        /// <summary>
        /// Automatically calculation of a good parameter constellation
        /// </summary>
        private void autoCalculateSettings()
        {
            int finalResolution = -1;
            int smallestRestValue = 100000;

            // Searches a resolution without residual value or with the smallest residual value
            for (int i = 125; i > 63; i--)
            {
                if (image.Width % i == 0)
                {
                    finalResolution = i;
                    break;
                }
                else
                {
                    if (image.Width % i < smallestRestValue)
                    {
                        smallestRestValue = i;
                    }
                }
            }

            if (finalResolution == -1)
            {
                finalResolution = smallestRestValue;
            }


            int tilesPerRow = image.Width / (finalResolution * 2);
            int finalDepth = -1;

            // calculates the level that is required to get all pixels of the origin image
            for (int i = 0; i < 7; i++)
            {
                int tilesPerRowOnLevel = (int)Math.Sqrt(Math.Pow(4, i));
                if (tilesPerRow <= tilesPerRowOnLevel)
                {
                    finalDepth = i;
                    break;
                }
            }

            if (finalDepth == -1)
            {
                finalDepth = 7;
            }

            qtDepth.Text = finalDepth.ToString();
            meshDimension.Text = finalResolution.ToString();
            setDatasetConvertionType();
        }



        /// <summary>
        /// Sets the convertion type (png, jpg, gif) of output dataset
        /// </summary>
        private void datasetType_SelectedIndexChanged(object sender, EventArgs e)
        {
            setDatasetConvertionType();
        }


        /// <summary>
        /// Sets the convertion type (png, jpg, gif) of output dataset
        /// </summary>
        private void setDatasetConvertionType()
        {
            if (datasetType.Text == "Displacement-Map")
            {
                convertingType.Text = "png";
            }
            else
            {
                convertingType.Text = "jpg";
            }
        }



        /// <summary>
        /// Shows the information of this tool
        /// </summary>
        private void infoToolStripMenuItem_Click(object sender, EventArgs e)
        {
            MessageBox.Show("Author: \t\tMichael Englert\nDate: \t\t17.09.2013\nCompany: " +
                            "\tFraunhofer IGD\nVersion: \t\t1.0\nLicense: \t\tGNU GPL\n\nDescription:\nThis tool " + 
                            "generates WMTS or TREE conform datasets from a given source image. " + 
                            "The output dataset can be used with the 'BVHRefiner' component of X3DOM.",
                            "Tool Information", MessageBoxButtons.OK, MessageBoxIcon.Information);
        }
    }



    /// <summary>
    /// UV-Coordinate Helper-Class
    /// </summary>
    class UV
    {
        public double U { get; set; }
        public double V { get; set; }

        public UV(double u, double v)
        {
            U = u;
            V = v;
        }
    }



    /// <summary>
    /// Helper class to produce the output pathes and names for the tree-dataset
    /// </summary>
    class TreeTileData
    {
        private ArrayList children = new ArrayList();
        public String StroingDirectory { get; set; } 


        public TreeTileData(int maxDepth, String path, int level, int column, int row, int number, TreeTileData [] treeTileData)
        {
            int levelStartID = 0;
            int tileCount = (int)Math.Sqrt(Math.Pow(4.0, level));
            this.StroingDirectory = path + "/" + number;
            
            for (int i = 0; i < level; i++)
            {
                levelStartID += (int)Math.Pow(4, i);
            }
            int sid = levelStartID + (row * tileCount + column);
            treeTileData[sid] = this;
            if (level < maxDepth)
            {
                children.Add(new TreeTileData(maxDepth, this.StroingDirectory,
                                             (level + 1), (column * 2), (row * 2), 1, treeTileData));
                children.Add(new TreeTileData(maxDepth, this.StroingDirectory,
                                             (level + 1), (column * 2), (row * 2 + 1), 2, treeTileData));
                children.Add(new TreeTileData(maxDepth, this.StroingDirectory,
                                             (level + 1), (column * 2 + 1), (row * 2), 3, treeTileData));
                children.Add(new TreeTileData(maxDepth, this.StroingDirectory,
                                             (level + 1), (column * 2 + 1), (row * 2 + 1), 4, treeTileData));
            }
        }
    }



    /// <summary>
    /// Helper Class that produces an image for a given node by a set of parameters
    /// </summary>
    class OutputNode
    {
        public int Level { get; set; }
        public int QuadNumber { get; set; }
        public double XOffset { get; set; }
        public double YOffset { get; set; }
        public double Factor { get; set; }
        public UV[,] TransformedUVCoords;
        public Bitmap BMP { get; set; }
        public Bitmap ResultBMP { get; set; }
        public String StoringPath { get; set; }
        public String Type { get; set; }
        public bool ExtractPositions { get; set; }
        public String PositionOutput { get; set; }
        public int Column { get; set; }
        public int Row { get; set; }
        public TreeTileData[] TreePathData { get; set; }


        public OutputNode(double xOffset, double yOffset, double factor, 
                        int level, int quadNumber, UV[,] UVCoords, Bitmap bmp, 
                        Bitmap resultBmp, String storingPath, String type,
                        int column, int row, TreeTileData [] treeTileData)
        {
            Column = column;
            Row = row;
            XOffset = xOffset;
            YOffset = yOffset;
            Factor = factor;
            Level = level;
            QuadNumber = quadNumber;
            BMP = bmp;
            ResultBMP = resultBmp;
            TransformedUVCoords = new UV[UVCoords.GetLength(0), UVCoords.GetLength(1)];
            StoringPath = storingPath;
            TreePathData = treeTileData;
            Type = type;
            // transforms the original texture coordinates to local space
            for (int x = 0; x < UVCoords.GetLength(0); x++)
            {
                for (int y = 0; y < UVCoords.GetLength(1); y++)
                {
                    TransformedUVCoords[x, y] = new UV(xOffset + UVCoords[x, y].U * factor, 
                                                       yOffset + UVCoords[x, y].V * factor);
                }
            }
        }


        /// <summary>
        /// Creates the image data
        /// </summary>
        public void CreateImage()
        {
            double bmpXStep = 1.0 / (double)(BMP.Width - 1);
            double bmpYStep = 1.0 / (double)(BMP.Height - 1);
            int xCoord, yCoord;
            for (int x = 0; x < TransformedUVCoords.GetLength(0); x++)
            {
                for (int y = 0; y < TransformedUVCoords.GetLength(1); y++)
                {
                    xCoord = (int)Math.Floor(TransformedUVCoords[y, x].U / bmpXStep);
                    yCoord = (int)Math.Floor(TransformedUVCoords[y, x].V / bmpYStep);
                    ResultBMP.SetPixel(x, y, BMP.GetPixel(xCoord, yCoord));
                }
            }

            if (TreePathData == null)
                createFolderFileWMTS();
            else
                createFolderFileTREE();
        }



        /// <summary>
        /// Creates the folders and stores the image for WMTS
        /// </summary>
        private void createFolderFileWMTS()
        {
            if (!System.IO.Directory.Exists(StoringPath + @"\" + Level + @"\" + Column))
            {
                System.IO.Directory.CreateDirectory(StoringPath + @"\" + Level + @"\" + Column);
            }

            if (Type == "jpg")
            {
                ResultBMP.Save(StoringPath + @"\" + Level + @"\" + Column + @"\" + Row + ".jpg",
                               System.Drawing.Imaging.ImageFormat.Jpeg);
            }
            else if (Type == "gif")
            {
                ResultBMP.Save(StoringPath + @"\" + Level + @"\" + Column + @"\" + Row + ".gif",
                               System.Drawing.Imaging.ImageFormat.Gif);
            }
            else
            {
                ResultBMP.Save(StoringPath + @"\" + Level + @"\" + Column + @"\" + Row + ".png",
                               System.Drawing.Imaging.ImageFormat.Png);
            }
        }



        /// <summary>
        /// Creates the folders and stores the image for TREE
        /// </summary>
        private void createFolderFileTREE()
        {
            int tileCount = (int)Math.Sqrt(Math.Pow(4.0, this.Level));
            int levelStartID = 0;
            for (int i = 0; i < this.Level; i++)
            {
                levelStartID += (int)Math.Pow(4, i);
            }
            int sid = levelStartID + (this.Row * tileCount + this.Column);


            if (!System.IO.Directory.Exists(this.TreePathData[sid].StroingDirectory))
            {
                System.IO.Directory.CreateDirectory(this.TreePathData[sid].StroingDirectory);
            }

            if (Type == "jpg")
            {
                ResultBMP.Save(this.TreePathData[sid].StroingDirectory + ".jpg",
                               System.Drawing.Imaging.ImageFormat.Jpeg);
            }
            else if (Type == "gif")
            {
                ResultBMP.Save(this.TreePathData[sid].StroingDirectory + ".gif",
                               System.Drawing.Imaging.ImageFormat.Gif);
            }
            else
            {
                ResultBMP.Save(this.TreePathData[sid].StroingDirectory + ".png",
                               System.Drawing.Imaging.ImageFormat.Png);
            }
        }
    }
}
