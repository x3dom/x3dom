.. _firststeps:

First steps with X3DOM
=======================

This tutorial is intended to be a quick start for people who have no experience with 3D graphics so far but want to try out X3DOM. Those who want to learn more about it, should have a look at the book `X3D: Extensible 3D Graphics for Web Authors <http://x3dgraphics.com/>`_ about X3D, on which X3DOM is based, by Don Brutzman and Leonard Daly.

Authoring X3DOM content is very similar to authoring HTML. So just open an editor and start with the  usual stuff as shown next. Please note the ``<link>`` tag, which includes the X3DOM stylesheet for having everything nicely formatted, and the ``<script>`` tag, which includes all JavaScript functions that are necessary to run your 3D scene:

.. code-block:: html

    <html>
      <head>
        <title>My first X3DOM page</title>
        <link rel="stylesheet" type="text/css" 
              href="http://www.x3dom.org/download/x3dom.css">
        </link>
        <script type="text/javascript" 
                src="http://www.x3dom.org/download/x3dom.js">
        </script>
      </head>
      <body>
        <h1>My X3DOM world</h1>
        <p>
          This is my first html page with some 3d objects.
        </p>
      </body>
    </html>


Save your file and open it in an `WebGL capable browser <http://www.x3dom.org/?page_id=9>`_. As you can see, there is only some text. What’s missing are the X3DOM-specific tags for specifying the 3D objects.

Hence, we’ll now insert a red box into our page by inserting the following code after the closing ``<p>`` tag. Similar to a ``<p>`` or ``<div>`` element, the ``<x3d>`` element defines a rectangular region that contains all its children elements (in this case the red box).

.. code-block:: xml

    <x3d width="500px" height="400px">
      <scene>
        <shape>
          <appearance>
            <material diffuseColor='red'></material>  
          </appearance>
          <box></box>
        </shape>
      </scene>
    </x3d>
    

You might wonder, why the ``<box>`` tag isn’t enough and what the other tags are good for. ``<scene>`` simply says, that you are going to define a 3D scene. And a ``<shape>`` defines the geometry (here a ``<box>``) as well as the ``<appearance>`` of an object. In our example, the whole appearance only consists of a red ``<material>``. If you want to learn more about these elements (or nodes as they are called in X3D), just follow `this link <http://x3dom.org/download/dumpNodeTypeTree.html>`_ and click on the node you are interested in.

Because simply looking at one side of the box is bit boring, you can navigate within your scene with the help of the mouse. If you move the mouse with pressed left mouse button inside the area surrounded by a black border, you’ll rotate the point of view. With the middle mouse button you can pan around and with the right button you can zoom in and out. For more information see:  :ref:`navigation`.

Ok, now you can move around, but admittedly this scene still is sort of boring. Thus, we’ll add another object, a blue ``<sphere>``, into our little scene. As is shown next, the ``<shape>`` is now surrounded by another element, the ``<transform>`` tag. This is necessary, because otherwise both objects would appear at the same position, namely the virtual origin of the 3D scene.

Thereto, the ‘translation’ attribute of the first ``<transform>`` element moves the box two units to the left, and the ‘translation’ attribute of the second ``<transform>`` element moves the sphere two units to the right. As can be seen in the example below, the value of the ‘translation’ attribute consists of three numbers. The first denotes the local x-axis (movement to the left/ right), the second defines the movement along the local y-axis (up/ down), and the third defines the movement along the local z-axis (back/ front).

.. code-block:: xml

    <x3d width="500px" height="400px">
      <scene>
        <transform translation="-2 0 0">
          <shape>
            <appearance>
              <material diffuseColor='red'></material>  
            </appearance>
            <box></box>
          </shape>
        </transform>
        <transform translation="2 0 0">
          <shape>
            <appearance>
              <material diffuseColor='blue'></material>  
            </appearance>
            <sphere></sphere>
          </shape>
        </transform>
      </scene>
    </x3d>
    
    
Now you know the basics of X3DOM. As you might have expected, there are certainly more nodes or elements you can try out like the ``<cone>`` or the ``<cylinder>``. Also, there are other material properties like ‘specularColor’ and ‘transparency’. By applying an ``<imageTexture>`` to your object, you can achieve fancy effects like a teapot that looks like earth as demonstrated in `this example <http://x3dom.org/x3dom/example/x3dom_objectAndText.xhtml>`_. When you have a look at the example’s source code, you’ll find a new tag called ``<indexedFaceSet>``, which can be used for creating arbitrary kinds of geometry.

The example discussed here is also `available online <http://www.x3dom.org/x3dom/example/x3dom_gettingStarted.html>`_. Moreover, there are already lots of other `X3DOM examples <http://www.x3dom.org/?page_id=5>`_. Just try them out, and even more important, have a look at the source code to learn what’s going on. 

Please note, that there are slight differences between XHTML and HTML encoding: e.g. the latter does not yet work with self-closing tags but requires that tags are always closed in the form ``</tagName>``.

If you ever have problems, please first check the :ref:`troubleshooting` section of this guide, much helpful information is collected there.

