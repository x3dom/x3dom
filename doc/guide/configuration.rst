.. _configuration:


Configuration
=============

The X3D element supports attributes and a param tag which allows to set configuration for
the runtime.


Usage
-----
The param element behaves just like any other HTML element. It must be
nested below the X3D element. For XHTML you can use the self-closing syntax,
for HTML a closing tag is mandatory::

    <x3d>
        <param name="showLog" value="true" ></param>
        <scene>
            ...
        </scene>
    </x3d>

Note: The param tag used to live as child of the scene element. This behavior has been changed with version 1.3 of
X3DOM. You will get a deprecation warning and support will be removed in 1.4.

Options
-------
The following table lists the parameters currently supported.

=================  =========================  ===========     =================================================
  Parameter          Values                     Default         Description
=================  =========================  ===========     =================================================
showLog	           true, false                false           Hide or display the logging console
showStat           true, false                false           Hide or display the statistics overlay
showProgress       true, false, bar           true            Hide or show the loading indicator. The default
                                                              indicator is a spinner. The value 'bar' will
                                                              use a progress bar.
PrimitiveQuality   High, Medium, Low, float   High/1.0        Render quality (tesselation level) for Box, Cone,
                                                              Cylinder, Sphere.
component          String (i.e. Geometry3D)   none            Name of the component to load
loadpath           String (i.e. nodes/)       none            The path or URI where to find the components
=================  =========================  ===========     =================================================
