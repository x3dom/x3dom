.. _components:

.. warning::

    THIS SECTION IS WORK IN PROGRESS.


Components
==========

X3DOM features a component system which allows you to load parts of the system at runtime. Basically there are two versions of the X3DOM library you can use. The full profile file (x3dom.js), containing all nodes of all components and a stripped down core (x3dom.core.js) containing only basic nodes.

When using x3dom.core.js you need to include or dynamically load the nodes you need to render your model. This can either be achieved by including the required node files in your HTML directly or by instruction X3DOM to load the components at runtime.

.. warning::

    It is recommended that you use the full X3DOM version (x3dom.js) and ignore this chapter unless there is a very specific reason not to. You are trading some negligible saving in initial download size (that is cached by browsers anyway) for a much slower loading system which uses additional requests, can not use the browsers cache, may cause problems with firewalls, CORS, proxy servers, CDNs, and is not able run locally without a web server.


Loading components using script tag
-----------------------------------

.. code-block:: html

    <script src="x3dom.core.js"></script>
    <script src="Primitives2D.js"></script>
    <script src="Other.js"></script>
    


Dynamically load components using X3DOM
---------------------------------------

.. code-block:: html

    <x3d>
        <param name="component" value="Primitives2D"></param>
        <param name="loadpath" value="http://yourserver/path/"></param>
        ...
    </x3d>

If the loadpath is not given X3DOM tries to load the component from the documents parent URL.

Keep in mind that the dynamic loading of X3DOM components performs an **synchronous** Ajax request. As such all the limitations of Ajax requests apply, plus the library is blocking your browser until it gets a response.
