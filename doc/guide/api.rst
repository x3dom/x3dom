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

..  js:function:: ready(element)

    :param element: The X3D element the method is currently operation on.

    This method is called once the system initialized and is ready to
    render the first time. It is therefore possible to execute custom
    action by overriding this method in your code::

        x3dom.runtime.ready = function(data) {
            alert("About to render something the first time");
        };

    It is important to create this override before the document onLoad event
    has fired. Therefore putting it directly under the inclusion of
    ``x3dom.js`` is the preferred way to ensure overloading of this function.


..  js:function:: enterFrame(element)

    :param element: The X3D element the method is currently operation on.

    This method is called just before the next frame is rendered. It is
    therefore possible to execute custom actions by overriding this
    method in your code::

        x3dom.runtime.enterFrame = function(data) {
            alert("About to render next frame");
        };

    It is also possible to override this function on a per X3D
    element basis::

        var element = document.getElementById('my_element');
        element.runtime.enterFrame = function() {
            alert('hello custom enter frame');
        };

    During initialization, just after ``ready()`` executed and before the very
    first frame is rendered, only the global override of this method works.

    If you need to execute code before the first frame renders, it is
    therefore best to use the ``ready()`` function instead.


