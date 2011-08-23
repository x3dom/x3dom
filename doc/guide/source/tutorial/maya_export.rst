.. _maya_export:

Maya export
===========

If you are working with `Autodesk Maya <http://www.autodesk.com/>`_ for modeling, shading and animating your 3d scenes, use this tutorial to create an interactive X3DOM website out of your model. This tutorial is tested with Autodesk Maya 2011. Nevertheless, the procedure should work even for older Maya versions.

The basic idea is to export your scene to VRML and convert this to an X3DOM/HTMLsite using InstantReality’s ``aopt`` binary (see :ref:`dataconversion`).


.. image:: /_static/tutorial/maya_export/maya0.png
   :align: center
   :scale: 90%
   :target: http://x3dom.org/x3dom/example/mayaExport/spaceship.html


Step 1
------

Model and shade in Maya as usual. You should use PNG images for texturing.

.. image:: /_static/tutorial/maya_export/maya1.png
   :align: center
   :scale: 80%



Step 2
------
Open ‘Window | Settings/Preferences | Plug-in manager’ and check the ‘loaded’ or ‘Auto load’ option vrml2Export.

.. image:: /_static/tutorial/maya_export/maya2.png
   :align: center



Step 3
------
Open the Export dialog under ‘File | Export All..’, Enter a filename (.wrl suffix) and switch to filetype ‘vrml2′. Don’t forget to check the following export options:

    | Hierarchy: Full
    | Texture Options: Original
    | Export: Normals and Textures

Click the “Export All” button. This will create a vrml2 file in your scenes folder.

.. image:: /_static/tutorial/maya_export/maya3.png
   :align: center



Step 4
------

Open a terminal or command prompt, change to the folder containing your vrml2 model and your textures and run `aopt` (part of InstantReality_, see :ref:`dataconversion` for details) by typing the following command (assuming to be `spaceship.wrl` the name of your model)::

    | aopt -i spaceship.wrl -d Switch -f ImageTexture:repeatS:false
    |      -f ImageTexture:repeatT:false -u -N spaceship.html

**Note:** ``aopt`` is automatically coming with your InstantReality player installation. You will find the executable within the ``bin`` folder of the Player. If you don’t have Instant Reality installed yet, download and install from `www.instantreality.org <http://www.instantreality.org>`_.


Step 5
------
Maya is using absolute path names. Therefore, open your html file with a standard text editor (vi, emacs, notepad++, etc.) and remove all paths from ``ImageTexture``. For example, replace::
 
    url=’”c:\users\me\maya\project\sourceimages\spaceship_color.png”‘ 

with::

    url=’”spaceship_color.png”‘

Step 6
------

Copy HTML and textures into your web folder and open the website with your `X3DOM capable <http://x3dom.org/check>`_ browser.

If you want to try out this tutorial: Here is a `zip archive <../_static/tutorial/maya_export/spaceship1.zip>`_ (208 kb) containing all relevant files including Maya model and texture.

You want to see the result live in your browser? Here is the `final webpage <http://x3dom.org/x3dom/example/mayaExport/spaceship.html>`_

.. _InstantExport: ftp://ftp.igd.fraunhofer.de/outgoing/irbuild/InstantExport/
.. _InstantReality: http://www.instantreality.org/