.. _runtime_api:

API
===

The X3DOM API is currently split into two parts:

  * Runtime
  * Docs

The runtime api provides progrmmatic live access to the system. The
Documnetation API allows to dynamically generate documentation
artifacts embedded derived from the source code (e.g. a list of
loaded nodes).

Class Documentation
-------------------

.. toctree::
   :maxdepth: 1

   api/x3dom.docs
   api/x3dom.Mesh



Runtime
-------

The X3DOM runtime API provides proxy object to programmatically read
and modify runtime parameters. The runtime proxy is attached to each
X3D element and can be used in the following manner::

    var e = document.getElementById('the_x3delement');
    e.runtime.showAll();
    e.runtime.resetView();
    ...

Some methods, like the ``x3dom.ready()`` function need to be called
before the proxy object can be initialized. You can still override
these functions globally. In order to provide you with the means to
scope your actions to a specific X3D element, the methods receive
the X3D element they are working on as first parameter::

    x3dom.ready = function(element) {
        if (element == target_element) {
            // do something
        }
    };



..  js:function:: ready()

    This method is called once the system initialized and is ready to
    render the first time. It is therefore possible to execute custom
    action by overriding this method in your code::

        x3dom.runtime.ready = function() {
            alert("About to render something the first time");
        };

    It is important to create this override before the document onLoad event
    has fired. Therefore putting it directly under the inclusion of
    ``x3dom.js`` is the preferred way to ensure overloading of this function.


..  js:function:: enterFrame()

    This method is called just before the next frame is rendered. It is
    therefore possible to execute custom actions by overriding this
    method in your code::

        var element = document.getElementById('my_element');
        element.runtime.enterFrame = function() {
            alert('hello custom enter frame');
        };

    During initialization, just after ``ready()`` executed and before the very
    first frame is rendered, only the global override of this method works.

    If you need to execute code before the first frame renders, it is
    therefore best to use the ``ready()`` function instead.


..  js:function:: getActiveBindable(typeName)

    :param string typeName: A valid Bindable node (e.g. Viewpoint, Background,
    :returns: Active dom element

    This method returns the currently active bindable DOM element of the given 
    type.

    For example::

        var element, bindable;
        element = doucment.getElementById('the_x3delement');
        bindable = element.runtime.getActiveBindable('background');
        bindable.setAttribute('set_bind', 'false');


..  js:function:: nextView()

    Navigates to the next viewpoint.


..  js:function:: prevView()

    Navigates to the previous viewpoint.


..  js:function:: viewpoint()

    Returns the current viewpoint.


..  js:function:: viewMatrix()

    :return: Matrix object

    Returns the current view matrix object.


..  js:function:: projectionMatrix()

    :return: Matrix object

    Returns the current projection matrix object.


..  js:function:: getWorldToCameraCoordinatesMatrix()

    :return: Matrix object

    Returns the current world to camera coordinates matrix.


..  js:function:: getCameraToWorldCoordinatesMatrix()

    :returns: Matrix object

    Returns the current camera to world coordinates matrix.


..  js:function:: getViewingRay(x,y)

    :param x: World X position
    :param y: World Y position
    :return: Line object

    Returns the width of the canvas element.


..  js:function:: getWidth()

    :returns: Width in pixels

    Returns the width of the canvas element.


..  js:function:: getHeight()

    :returns: Height in pixels

    Returns the height of the canvas element.


..  js:function:: mousePosition(event)

    :param event: The event
    :return: [x,y] position

    Returns the 2d canvas layer position [x,y] for a given mouse event, i.e.,
    the mouse cursor's x and y positions relative to the canvas (x3d) element.


..  js:function:: calcCanvasPos(wx,wy,xz)

    :param wx: World coordiante X axis
    :param wy: World coordiante Y axis
    :param wz: World coordiante Z axis
    :return: Array with 2D corrdinates (x,y)

    Takes world coordinates (x,y,z) of the scene and calculates
    the relating 2D X/Y coordinates respective to the canvas
    the scene is rendered on.

    This allows you to relate 3D world coordinates
    to a specific position on the 2D canvas. This can be usable
    to position a HTML element over the canvaas (like a hint window
    for exmaple).


..  js:function:: calcPagePos(wx,wy,xz)

    :param wx: World coordiante X axis
    :param wy: World coordiante Y axis
    :param wz: World coordiante Z axis
    :return: Array with 2D corrdinates (x,y)

    Takes world coordinates (x,y,z) of the scene and calculates
    the relating 2D X/Y coordinates relative to the document the
    scene is rendered in.


..  js:function:: calcClientPos(wx,wy,xz)

    :param wx: World coordiante X axis
    :param wy: World coordiante Y axis
    :param wz: World coordiante Z axis
    :return: Array with 2D corrdinates (x,y)

    Takes world coordinates (x,y,z) of the scene and calculates
    the relating 2D X/Y coordinates relative to the window the
    scene is rendered in.


..  js:function:: getScreenshot()

    :return: URL to image

    Returns a Base64 encoded `data URI <http://tools.ietf.org/html/rfc2397>`_ 
    containing png image consisting of the current rendering. The resulting 
    URL will look similar to this::

        data:image/png;base64,iVBORw0KGgo...

    The browser will interpret this as a PNG image and display it.
    A list of browsers which support data URI can be 
    `found here <http://en.wikipedia.org/wiki/Data_URI_scheme>`_.
    
    The following example illustrates the usage::
    
        var url = ...runtime.getScreenshot();
        var img = document.createElement("img");
        img.src = url;
        ...

..  js:function:: lightMatrix()

    :return: The current light matrix

    Returns the current light matrix.


..  js:function:: resetView()

    Navigates to the initial viewpoint.


..  js:function:: lightView()

    :return: True if navigation was possible, false otherwise.

    Navigates to the first light, if any.


..  js:function:: uprightView()

    Navigates to upright view.


..  js:function:: showAll()

    Zooms so that all objects are visible.

    :param string axis: the axis as string: posX, negX, posY, negY, posZ, negZ


..  js:function:: showObject(obj, axis)

    :param obj: the scene-graph element on which to focus
    :param axis: the axis as string, one of: posX, negX, posY, negY, posZ, negZ

    Zooms so that a given object is fully visible.


..  js:function:: getCenter(domNode)

    :param domNode: the node for which its center shall be returned
    :return: Node center or 'null' if donNode is not a Shape or Geometry

    Returns the center of a X3DShapeNode or X3DGeometryNode as SF3Vec3f object.

..  js:function:: getCurrentTransform(domNode)

    :param domNode: the node for which its transformation shall be returned
    :return: Transformation matrix (or null no valid node is given)

    Returns the current to world transformation of a given node. If no valid
    node is given ``null`` is returned.


..  js:function:: debug(show)
    
    :param boolean show: true/false to show or hide the debug window
    :returns: The current visibility status of the debug window (true/false)

    Displays or hides the debug window. If the paramter is omitted, the 
    current visibility satus is returned.


..  js:function:: navigationType()

    :returns: A string representing the active navigation type.
    
    A readout of the currently active navigation type.


..  js:function:: examine()

    Switches to examine mode.


..  js:function:: lookAt()

    Switches to lookAt mode.


..  js:function:: lookAround()

    Switches to lookAround mode.


..  js:function:: walk()

    Switches to walk mode.


..  js:function:: game()

     Switches to game mode.


..  js:function:: helicopter()

     Switches to helicopter mode.


..  js:function:: resetExamin()

     Resets all variables required by examin mode to init state


..  js:function:: togglePoints()

     Toggles points attribute


..  js:function:: pickRect(x1, y1, x2, y2)

    :param x1: x1 coordinate of rectangle
    :param y1: y1 coordinate of rectangle
    :param x2: x2 coordinate of rectangle
    :param z2: y2 coordinate of rectangle
    :returns: Array of shape elements

     Returns an array of all shape elements that are within the picked
     rectangle defined by (x1, y1) and (x2, y2) in canvas coordinates


..  js:function:: pickMode(options)

    :param object options: An object of properties i.e. options = {'internals': true}
    :returns: The current intersect type value suitable to use with changePickMode

     Get the current pickmode intersect type. If the option 'internals':true is
     provided, the interal representation is returned.


..  js:function:: changePickMode(type, options)

    :param string type: The new intersect type: idbuf, color, textcoord, or box.
    :returns: True if the type hase been changed, false otherwise

    Alter the value of intersct type. Can be one of: idbuf, color, textcoord, box.
    Other values are ignored.


..  js:function:: speed(newSpeed)
    
    :param float newSpeed: The new speed value (optional)
    :returns: The current speed value
    
    Get the current speed value. If parameter is given the new speed value is 
    set accordingly.

..  js:function:: statistics(mode)

    :param boolean mode: true/false to enable or disable the stats info
    :returns: The current visibility of the stats info (true/false)

    Get or set the visibility of the statistics information. If parameter is 
    omitted, this method returns the visibility status as boolean.

..  js:function:: isA(domNode, nodeType)

    :param object domNode: the node to test for
    :param string nodeType: node name to test domNode against
    :returns: True or false

    Test a DOM node object against a node type string. This method
    can be used to determine the "type" of a DOM node.


..  js:function:: processIndicator(mode)

    :param boolean mode: true to show indicator, false to hide
    :returns: The current visibility of the process indicator info (true = visible, false = invisible)

    Enable or disable the process indicator. If parameter is omitted, this method
    only returns the the visibility status of the statistics info overlay.

..  js:function:: backendName()

    :returns: The current render backend name as string

    Returns the currently used render backend name.

..  js:function:: properties()

    :returns: Properties object

    Returns the properties object of the X3D element.
    This holds all configuration parameters of the X3D element.




Docs
----

The documentation API is a set of static functions (object literal)
which allows to obtain documetantion related information form the
library::

    var info;
    var info_pane;
    info = x3dom.docs.getNodeTreeInfo();
    info_pane = getElementById('infopane');
    info_pane.innerHTML = info;

The documentation module is optional and only provided with the
x3dom-full package.

..  js:function:: getNodeTreeInfo()

    :returns: A div element containin the nodes and link to specification

    Return a div filled with nodes implemented and link to documentation.
    This can be used to build interactive documentation.

    Note: Unstable API method. Name and retrun value might change

..  js:function:: getComponentInfo()

    :returns: A div element containin the nodes and link to specification,
              grouped by components and sorted alphabetically

    Return a div filled with nodes implemented and link to documentation.
    This particular method returns the the nodes grouped by components
    and sorted alphabetically.

    This can be used to build interactive documentation.

    Note: Unstable API method. Name and retrun value might change

