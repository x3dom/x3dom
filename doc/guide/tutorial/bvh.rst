.. _bvh:

The BVHRefiner component - Refining and Loading hierarchical data dynamically
=============================================================================

The BVHRefiner is a component that refines and loads hierarchical data dynamically during runtime. Two different dataset structures can be used (WMTS, TREE) that are described later.

3D-Example of Puget Sound rendered with a WMTS conform dataset
--------------------------------------------------------------

.. image:: /_static/tutorial/bvh_refiner/puget_sound.jpg
   :align: center


.. code-block:: xml

    <BVHRefiner maxDepth='5'
                minDepth='2'  
                interactionDepth='4'  
                subdivision='64 64'
                size='4096 4096' 
                factor='10'
                maxElevation='410' 
                elevationUrl="Puget Sound WMTS/elevation" 
                textureUrl="Puget Sound WMTS/satellite"
                normalUrl="Puget Sound WMTS/normal"
                elevationFormat='png' 
                textureFormat='png'
                normalFormat='png' 
                mode="3d" 
                submode="wmts">
    </BVHRefiner>


Parameter descriptions
----------------------
The following table lists the parameters currently supported:

==================    =========================    ===========    =================================================
Parameter             Values                       Default        Description
==================    =========================    ===========    =================================================
maxDepth              0, 1, ... n                  3              maximum depth of the tree, or dataset
minDepth              0, 1, ... n                  0              minimum depth of tree that should be rendered as soon as possible
interactionDepth      0, 1, ... n                  maxDepth       maximum rendered depth during user interaction with scene
subdivision           0, 1, ... 125                1 1            resolution of a rendered tile
size                  0, 1 ... n                   1 1            size of the entire terrain
factor                0, 1, ... n                  1.0            factor affects the distance to create or render the next level (the higher the higher the performance, the lower the higher the quality)
maxElevation          0.0, 0.1, ... n              1.0            maximum displacement in y direction 
elevationUrl          string                       ""             Url to dataset of displacement data
textureUrl            string                       ""             Url to dataset of surface texture data
normalUrl             string                       ""             Url to dataset of normal data
elevationFormat       png, jpg, gif ...            png            Data format of displacement dataset
textureFormat         png, jpg, gif ...            png            Data format of surface texture dataset
normalFormat          png, jpg, gif ...            png            Data format of normal dataset
mode                  2D, 3D, bin, bvh             3D             2D (planes), 3D (displaced y-coordinate of 2D-Planes), bin (binary files, WMTS), bvh (binary files, TREE)
submode               WMTS, TREE                   WMTS           utilized dataset (WMTS, TREE (currently only in 2D mode))
==================    =========================    ===========    =================================================


Currently supported dataset formats
-----------------------------------

We support two different types of datasets. The first is based on WMTS specification and the second version is a folder based file arrangement. In the 3D case, only the wmts format is supported. Both, the usage of WMTS and TREE for this BVHRefiner node are specified in the following subsections.

WMTS
~~~~

In WMTS (`more information <http://www.opengeospatial.org/standards/wmts/>`_) a multidimensional dataset of a terrain can be integrated very easy. For every level of detail a new matrix of tiles is required. Every level has its own folder. So if you want to get five different levels of detail in your application, five folders must exist, numbered from 0 to 4. The detail from level to level grows up by a factor of four. Into the folders for the levels, subfolders that describe the columns of the matrix have to be inserted. On level 0 you only have one column, represented through the folder with the name 0. In the next level you have two columns named 0 and 1, growing up by a factor of two from level to level. In the subfolders you place the images that represent the tiles data. There must be as much images as subfolders. On level 0 you only have one image that represents the whole terrain data. On level one exist two subfolders. Every subfolder has to include two images, on the next level four per subfolder and so on. The following figure (figure 1) shows the addressing-scheme:  

.. image:: /_static/tutorial/bvh_refiner/wmts.png
   :align: center
   :scale: 50%

TREE
~~~~

The TREE addressing-scheme is as easy as the WMTS addressing scheme. Every level in the tree defines a level of detail of the terrain. On level 0 we have an image (1.png) that represents the terrain in the worst quality. It has a folder that has its number as name (1). In this folder we find four images where all four images together represent the whole terrain. The resolution grows up every level by a factor of four. Every image has its folder that always includes four images with the next finer resolution quality. If an image has no folder, the final resolution quality has reached. The position of the images for a finer resolution is as follows:

* 1.png: top left
* 2.png: bottom left 
* 3.png: top right
* 4.png: bottom right

.. image:: /_static/tutorial/bvh_refiner/tree.png
   :align: center
   :scale: 50%

Hints for a self-made dataset construction
------------------------------------------

.. image:: /_static/tutorial/bvh_refiner/tile_pyramid.png
   :align: center
   :scale: 82%

To reconstruct a 3D-Terrain from a WMTS conform dataset a special arrangement of the pixels in the images of the WMTS dataset is required. Neighboring tiles have to share the pixels on the boundaries. The figure on top of this subsection shows on the left the original image, in the middle the image of level 0 of the final dataset and on the right the four images of level 1. 
Furthermore the resolution of every image of the final dataset must be of the size *2n + 1*, where *n* is the value of the size attribute of a tile in the *BVHRefiner* node. In the example of Puget Sound on top of this tutorial a value of *'64 64'* is chosen for every tile as size attribute. So on the dataset, every image has to be of the size *'129 129'*. This is a condition for the algorithm to prevent cracks on the mesh representation.   

Using the BVHRefiner Dataset Converter:
---------------------------------------

The BVHRefiner Dataset Converter is a tool to produce a WMTS or TREE conform dataset from single image. This is only a test application and can not handle arbitrary picture sizes. 

.. image:: /_static/tutorial/bvh_refiner/dataset_converter.jpg
   :align: center
   :scale: 100%

1. Representation of the original image
2. Opens  a file dialog where the source image can be chosen 
3. Represents the path where the final dataset should be stored
4. Opens a folder dialog where the storing path of the final dataset can be chosen
5. Convertion settings 
5. a) Convertion Type: Surface-, Displacement- or Normal-Dataset
5. b) Dataset-Format: Currently supported dataset formats (WMTS, TREE)
6. Advanced Settings (are calculated automatically, but can be changed if required)
6. a) Mesh Resolution: Resolution of a tile in the x3dom-application
6. b) Depth of the Quadtree: The depth of the final dataset (levels of detail)
6. c) Image Type: The image format of all images in the final dataset (jpg, png, gif)
7. Starts the convertion of the original source image into the tiled dataset
8. Current progress of the convertion


Download .NET based BVHRefiner Dataset Converter:
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
* Windows 7 x86:  `BVHRefiner Dataset Converter x86 <http://x3dom.org/docs/dev/_static/tutorial/bvh_refiner/BVHRefiner_Dataset_Converter_x64.zip>`_  
* Windows 7 x64:  `BVHRefiner Dataset Converter x64 <http://x3dom.org/docs/dev/_static/tutorial/bvh_refiner/BVHRefiner_Dataset_Converter_x64.zip>`_
* Source Code:    `BVHRefiner Dataset Converter Source <http://x3dom.org/docs/dev/_static/tutorial/bvh_refiner/BVHRefiner_Dataset_Converter_x64.zip>`_  