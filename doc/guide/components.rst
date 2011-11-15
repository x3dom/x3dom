.. _components:

.. warning::

    THIS SECTION IS WORK IN PROGRESS. THE BUILD SYSTEM DOES NOT YET
    BUILD THE CORE VERSION OF X3DOM.


Components
==========

X3DOM features a component system which allows you to load parts of the system at runtime. Basically there are two versions of the X3DOM library you can use:

    * the standard full profile file: ``x3dom.js``
    * the core containing only basic nodes: ``x3dom.core.js``

The full profile contains all the nodes of the official X3D specification, as far as they are implemented in X3DOM. The core library contains only basic nodes.

When using ``x3dom.core.js`` you need to include or dynamically load the nodes you need to render your model. This can achieved by including the required node files in your HTML directly or by instruction X3DOM to load the components at runtime.

It is recommended that you use the full X3DOM version (``x3dom.js``) unless there is a very specific reason not to. You are trading some negligible saving in initial download size for a much slower loading system which uses additional requests, can not use the browsers cache (x3dom is usually cached by browsers, so it is only downloaded once), may cause problems with firewalls, CORS, proxy servers, CDNs, and is not able run locally without a web server.


Loading components using script tag
-----------------------------------

This technique works by manually including the X3DOM core library plus the components you need for rendering your model. Your resulting HTML could look like this.

.. code-block:: html

    <script src="x3dom.core.js"></script>
    <script src="Primitives2D.js"></script>
    <script src="Other.js"></script>
    

Benefits of this approach:
    
    * static loading (no ajax requests)
    * works locally without a webserver

Drawbacks of this approach:

    * more requests are required
    * more files to manage in complex setups (however could be somewhat mitigated using something like Sprockets)


Dynamically load components using X3DOM
---------------------------------------

X3DOM features a mechanism to load files at runtime. 

.. warning::

    With this approach it is possible to load anything. An excellent way to inject malicious code into your application. Be aware of this possible exploit when using the technique described here.

In order to allow dynamic loading of components, you need to set a global variable in javascript *before* including X3DOM. This security precaution prevents the library from executing code that is known to be insecure. In order to disable security measures in X3DOM, put the following statement before the inclusion of X3DOM, i.g:

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


