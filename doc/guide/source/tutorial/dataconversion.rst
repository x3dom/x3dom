.. _dataconversion:

.. This part of the tutorial appears to be incomplete.

Generic 3D data conversion
===========================

How to get your 3D asset in your application is one of the essential questions that every 3D runtime environment has to answer.

X3DOM uses X3D data embedded in (X)HTML pages and optional X3D-XML files referenced by the embedded part. The X3D-XML files can reference further X3D-XML files and therefore build a hierarchy of asset containers.


.. image:: /_static/tutorial/dataconversion/x3dom-content-creation-pipeline.png
    :scale: 65%
    :alt: Content creation pipeline
   

This tutorial shows how to get your data into the X(HTML) page and how to convert it to X3D-XML so it could be externally referenced.


DCC export
----------

Usually people use some form of Digital Content Creation (DCC) tool to build the 3D models. This can be a modeling system like Maya or 3D Studio Max, and also a CAD-System or simulation package.

They all usually allow exporting the internal representation to some form of 3D data file. Most support X3D or VRML, some even both (e.g. blender) plus other formats. For X3DOM you should look for a X3D exporter. VRML is your second best choice. X3D is a VRML derivate and superset.


Converter
---------

If your DCC-tool does not support X3D or VRML you are forced to utilize another tool which will introduce a extra level of conversion. Depending on your format there are usually different converters. Refer to `X3D/web3d.org data conversion <http://www.web3d.org/x3d/content/examples/X3dResources.html#Conversions>`_ for more information.

However, you should really try to avoid this step and export directly to X3D or VRML.

Transcoding
-----------
If you have an X3D-XML or VRML file you can easily recode your data without any data loss. There are different options but the easiest right now is properly the Avalon-Optimizer (aopt) from the InstantReality_ packages. You can `use it online <http://www.instantreality.org/tools/x3d_encoding_converter/>`_ or on your local machine to recode your data.

Offline Transcoding
~~~~~~~~~~~~~~~~~~~

`Download <http://www.instantreality.org/downloads/>`_ and install the InstantPlayer system. The package includes a command line tool called aopt(.exe) which we will use for conversion. Setup your shell-environment to find and include the binary. The usually paths are:

- Windows: ``C:\Program Files\Instant Player\bin\aopt.exe``
- Mac: ``/Applications/Instant Player.app/Contents/MacOS/aopt``
- Linux: ``/opt/instantReality/bin/aopt``

Then run ``aopt -h`` command to get a full list of options and usage instructions. For this tutorial the most important are::

    aopt -i foo.wrl -x foo.x3d      # Convert VRML to X3D-XML
    aopt -i foo.x3d -N foo.html     # Convert VRML or X3D-XML to HTML
    aopt -i foo.x3d -M foo.xhtml    # Convert VMRL or X3D-XML to XHTML
    aopt -i foo.x3d -u -N foo.html  # Optimization and build DEF/USE reuses



Building the File Hierarchy
---------------------------

A hierarchy of files can be built up with Inline nodes. The advantage here is that bigger objects/ meshes do not need to be directly part of a page’s source code, but can be loaded in parallel in the background.

**Important:** If you use ``<Inline url=”foo.x3d” />`` nodes in your content, you need a real server to run your application. This will not work locally from your disc.


.. _InstantReality: http://www.instantreality.org/
