.. _components:


Components
==========

X3DOM features a component system which allows you to load parts of the system at runtime. Components are a set of X3D nodes logically grouped together and put into a file. For example, the Geometry2D component consists of nodes named Arc2D, Circle2D, etc and is stored in a file named ``Geometry2D.js``. Those components are then further grouped into `profiles <http://www.web3d.org/x3d/specifications/OLD/ISO-IEC-19775-X3DAbstractSpecification/Part01/Architecture.html>`_ which combine them for specific application domains. For example there is a `core profile <http://www.web3d.org/x3d/specifications/OLD/ISO-IEC-19775-X3DAbstractSpecification/Part01/coreprofile.html>`_, an immersive profile, Interchange profile, and so on. Except for the full profile, profiles are an abstract concept and not reflected in file layout.

While logical grouping like this falls mostly into the category of code organization, it can be utilized to load only the parts you need for your application. With X3DOM there are two versions of the library in the distribution package:

    * the standard full profile file: ``x3dom-full.js`` 
    * the core containing only basic nodes: ``x3dom.js``

You will find these files in release directory of X3DOM. Note that this is currently the development version of X3DOM. `<http://x3dom.org/download/dev/>`_.

The full profile contains all the nodes of the official `X3D specification <http://www.web3d.org/x3d/specifications/OLD/ISO-IEC-19775-X3DAbstractSpecification/Part01/>`_, as far as they are implemented in X3DOM, merged into one file.

When using ``x3dom.js`` (core) you may need to either include or dynamically load additional nodes you need to render your model. This can be achieved by including the required node implementations files in your HTML using the ``<script>`` tag, or by instructing X3DOM to load the components at runtime.

By default X3DOM comes with the following additional nodes:

    * Geometry2D
    * VolumeRendering
    * Geospatial

If you are using ``x3dom.js`` and you need to load the nodes above, you can use one of the methods described below.


*Note:* It is recommended that you use the full X3DOM version (``x3dom-full.js``) in production environments - unless there is a very specific reason not to. The full version is compacted, optimized and in almost all cases the right way of including X3DOM. Should you opt for using the methods described here, you are trading negligible saving in initial download size for a much slower loading system, additional requests, way more complicated setup and maintenance, inability to use the browsers cache, problems with firewalls, proxy servers, CORS issues, CDNs, and not being able to run run locally without a web server. 



Static component loading
------------------------

This technique works by manually including the X3DOM core library plus the components you need for rendering your model. Your resulting HTML could look like this.

.. code-block:: html

    <script src="x3dom.js"></script>
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
    
In order to disable security measures in X3DOM, put the following statement in your document ``<head>`` section and before the inclusion of X3DOM:

.. code-block:: html

    <head>
      <script>
        X3DOM_SECURITY_OFF = true;
      </script>
      <script src="x3dom.js"></script> 
      ...
    </head>

Now, dynamic loading components at runtime is enabled and can be used by putting the following parameters in you X3D scene.

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


When to use this method:

    * never (unless there's no other feasible way)


Extending X3DOM
---------------

In this chapter you will learn how to extend X3DOM with your own nodes which you can load using the methods outlined above. We recommend to use the static loading approach in combination with the core profile ``x3dom.js``. This results in the inclusion of ``x3dom.js`` and ``YourComponent.js`` which will contain your custom code.

To follow this chapter you need at least basic understanding of the following concepts, principles, or technologies:

  * object orientation
  * class based object model
  * programming in general
  * Javascript programming
  * the Javascript object model
  * XML and HTML5


Object system
~~~~~~~~~~~~~

In order to register a new node within the X3DOM system, you need to create the equivalent of a *class* that inherits properties from a superclass. Javascript itself does not implement a class based object model, it provides a `prototype model <http://en.wikipedia.org/wiki/Prototype-based_programming>`_. A prototype based object model can be seen as a superset of a traditional class based model. With a prototype based object system, one can implement a more limited class based system. That is exactly what X3DOM does.

For each node you want to implement in X3DOM you need to call the function::

    x3dom.registerNodeType("YourNodeName", "GroupName", definitionObj);

This registers a node within the X3DOM system and provides a hook to the implementation of this class. The first parameter also is the name of the XML tag you are writing code for. The third parameter to registerNodeType is the return value of a call to the X3DOM function::

    defineClass(superclassObj, constructorObj, implementationObj);

This function is roughly equivalent to creating a class definition in a language with an traditional class based object system.

*Note:* The ``defineClass`` function resides in the global Javascript namespace whereas the ``registerNodeType`` function is nested within the ``x3dom`` namespace. This is intentionally so and not a typo.


Hello World
~~~~~~~~~~~

Let's say we want to implement a custom node which echos a "Hello World" to the console, we first need to decided how the XML should look like. In this case, we simply want another XML tag that looks like this:

.. code-block:: xml

    <x3d>
      <scene>
        <hello></hello>    <-- this is new
      </scene>
    </x3d>

Since there is no *Hello* node in the X3DOM system nothing happens when we run this X3D in the browser. The ``<hello>`` tag is not recognized and therefore ignored by X3DOM. In order to make X3DOM aware of the ``<hello>`` tag we need to register a new node with the system and provide an implementation for that node. In order to do so we are using the two function calls described above:

.. code-block:: javascript

    x3dom.registerNodeType(
        "Hello", 
        "Core",
        defineClass(x3dom.nodeTypes.X3DNode,
            function (ctx) {
                x3dom.nodeTypes.Hello.superClass.call(this, ctx);
            }, {
                  nodeChanged: function() {
                      x3dom.debug.logInfo('Hello World from the console');
                  }
            }
        )
    );


First, the hello node is registered with X3DOM, the hello node belongs to the core nodes. We then create an implementation object of the type ``x3dom.nodeTypes.X3DNode``, the superclass. We also define a constructor for our node in form of a function object that we pass to the ``defineClass()`` function (second positional parameter). The last parameter consists of an object literal containing function definitions for the node API. In this example we implement a function called ``nodeChanged`` which will be called by X3DOM anytime there is a change to the node element in the DOM. It is also called when the node is encountered the first time. This is the place where print a message to the console using the X3DOM debug facilities.

The ``nodeChanged`` function is not the only function you can pass your implementation. For example, there is a ``fieldChanged`` method which is called whenever a attribute in the DOM changes, and you can implement your own methods here.


More
~~~~

For more examples of nodes, please refer to `the source code of the X3DOM nodes <https://github.com/x3dom/x3dom/tree/master/src/nodes>`_. It's the best way to learn how to deal with the X3DOM node system.
