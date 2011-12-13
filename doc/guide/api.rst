.. _runtime_api:

API
===

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


Runtime
-------

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


..  js:function:: resetView()

    Navigates to the initial viewpoint.


..  js:function:: uprightView()

    Navigates to upright view.


..  js:function:: showAll()

    Zooms so that all objects are visible.


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