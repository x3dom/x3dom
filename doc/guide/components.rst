.. _components:

.. warning::

    THIS SECTION IS WORK IN PROGRESS. THE BUILD SYSTEM DOES NOT YET
    BUILD THE CORE VERSION OF X3DOM.


Components
==========

X3DOM features a component system which allows you to load parts of the system at runtime. Components are a set of X3D nodes logically grouped together and put into a file. For example, the Geometry2D component consists of nodes named Arc2D, Circle2D, etc and is stored in a file named ``Geometry2D.js``. Those components are then further grouped into `profiles <http://www.web3d.org/x3d/specifications/OLD/ISO-IEC-19775-X3DAbstractSpecification/Part01/Architecture.html>`_ which combine them for specific application domains. For example there is a `core profile <http://www.web3d.org/x3d/specifications/OLD/ISO-IEC-19775-X3DAbstractSpecification/Part01/coreprofile.html>`_, an immersive profile, Interchange profile, and so on. Except for the full profile, profiles are an abstract concept and not reflected in file layout.

While logical grouping like this falls mostly into the category of taxonomy and code organization, it can be used to load only the parts you need for your application. With X3DOM there are two versions of the library in the distribution package:

    * the standard full profile file: ``x3dom.js``
    * the core containing only basic nodes: ``x3dom.core.js``

The full profile contains all the nodes of the official `X3D specification <http://www.web3d.org/x3d/specifications/OLD/ISO-IEC-19775-X3DAbstractSpecification/Part01/>`_, as far as they are implemented in X3DOM, merged into one file.

When using ``x3dom.core.js`` you need to either include or dynamically load the nodes you need to render your model. This can be achieved by including the required node implementations files in your HTML using the ``<script>`` tag, or by instructing X3DOM to load the components at runtime.

*Note:* It is recommended that you use the full X3DOM version (``x3dom.js``) in production environments - unless there is a very specific reason not to. The full version is compacted and optimized and in almost all cases the right way of including X3DOM. Should you opt for using the methods described here, you are trading negligible saving in initial download size for a much slower loading system, additional requests, way more complicated setup and maintenance, inability to use the browsers cache, problems with firewalls, proxy servers, CORS issues, CDNs, and not being able to run run locally without a web server. 


Static component loading
------------------------

This technique works by manually including the X3DOM core library plus the components you need for rendering your model. Your resulting HTML could look like this.

.. code-block:: html

    <script src="x3dom.core.js"></script>
    <script src="Primitives2D.js"></script>
    <script src="Other.js"></script>
    

Benefits of this approach:
    
    * static loading (no ajax requests)
    * works locally without a web server instance

Drawbacks of this approach:

    * more requests are required
    * more files to manage in complex setups (could be somewhat mitigated using something like Sprockets)

This is essentially how we build the full profile library, except that we deliver everything in one optimized file. When you write your own components, you can use this method - it also works with the full profile X3DOM file.

When to use this method:

  * When you write your own components
  * During development and testing


Dynamic component loading
-------------------------

X3DOM features a mechanism to load files at runtime. With this approach it is possible to load anything from anywhere and inject that code into your application. Be aware of this possible exploit when using the technique described here.

.. warning::

    In order to allow dynamic loading of components, you need to tell X3DOM to turn off its security precautions *before* including the X3DOM library. These precaution prevents the library from executing code that is known to be insecure. Only use this feature if there is absolutely no other option for you.
    
In order to disable security measures in X3DOM, put the following statement before the inclusion of X3DOM, i.g:

.. code-block:: html
    <html>
    <head>
    <script>
        X3DOM_SECURITY_OFF = true;
    </script>
    <script src="x3dom.js"></script> 
    </head>
    ...

Now, dynamic loading components at runtime can be achieved by putting the following parameters in you X3D scene.

.. code-block:: html

    <x3d>
        <param name="component" value="Primitives2D,Other"></param>
        <param name="loadpath" value="http://yourserver/path/"></param>
        ...
    </x3d>

If `loadpath` is not set X3DOM tries to load the component from the documents parent URL.

Keep in mind that the dynamic loading of X3DOM components performs an **synchronous** Ajax request. As such all the limitations of Ajax requests apply, plus the library is blocking your browser until it gets a response.


Drawbacks of this approach:

    * load order is important and has to be maintained by developer
    * needs a web server running (ajax)
    * blocks the browser during loading of files
    * code injection possibility high
    * needs much more requests
    * ajax request caching not really supported


Benefits of this approach:
    
    * none


Creating your own components
----------------------------

TODO

Walkthrough example of how to extend X3DOM.

    * put em in a file
    * load using methods above

.. code-block:: javascript

    x3dom.registerNodeType(
        "MyExampleNode",
        "MySuperClass",
        defineClass(x3dom.nodeTypes.X3DSensorNode,
            function (ctx) {
                x3dom.nodeTypes.MyExampleNode.superClass.call(this, ctx);
                // fields
            },
            {
                fieldChanged: function(fieldName)
                {
                },

                parentRemoved: function(parent)
                {
                }
            }
        )
    );
