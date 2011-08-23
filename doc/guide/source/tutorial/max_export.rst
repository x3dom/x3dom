.. _max_export:

3ds Max Export
==============

If you are using `Autodesk 3ds Max <http://usa.autodesk.com/adsk/servlet/pc/index?id=13567410&siteID=123112>`_ for modeling (available only for Microsoft Windows), you can install our exporter plug-in InstantExport. If you do not yet have installed 3ds Max, there is also a 30-day trial version of the modeling software available.
Nightly beta builds of InstantExport_ are available for download `here <ftp://ftp.igd.fraunhofer.de/outgoing/irbuild/InstantExport/>`_.

InstantExport is the InstantReality_ X3D exporter for 3ds Max and not only exports XML-based X3D as well as VRML, its classic encoding, but it can also now directly export to HTML/XHTML.
But please note that – as the exporter plug-in is still under development – there are still lots of features in Max, which yet cannot be properly exported. So, if you find a bug, please report it in the `InstantReality forum <http://forum.instantreality.org/index.php?board=19.0>`_.


Installation
------------

After having downloaded the exporter, unzip the zip file and choose the correct version for your system and Max version. After that, (assumed you are using the standard installation path and 3ds Max 2008) copy the file ``InstantExport.dle`` (the Max version of a DLL) into ``C:\Program Files\Autodesk\3ds Max 2008\plugins``.

Export
------

Then start 3ds Max, load the 3d model you want to export, choose *Export* in the File menu, type in a file name, e.g. ``test.xhtml``, and select the file type – in this case *InstantExport (*.WRL,*.XHTML,*.X3D)*
After that, the exporter GUI pops up. Here, under *Encoding* choose *XHTML*, as shown in the screenshot below. Finally, press the *Export* button. For more information, the zip file also includes a help file for the exporter.

.. image:: /_static/tutorial/max_export/instantExport1.png
    :scale: 65%


.. _InstantExport: ftp://ftp.igd.fraunhofer.de/outgoing/irbuild/InstantExport/
.. _InstantReality: http://www.instantreality.org/