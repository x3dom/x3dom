.. _platforms:


Platform Notes
==============

System requirements and browser notes
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

In order to be able to work with X3DOM, you need a WebGL enabled web browser.
We also support different fallback models for browsers not supporting WebGL
natively. The best support of features however is only ensured with a browser
sporting a WebGL implementation. You can check the status of supported
browser `here <http://www.x3dom.org/?page_id=9>`_.


Chrome
~~~~~~
Recent releases of Chrome require you to enable WebGL. Please use the following
command parameters when launching chrome::

    --enable-webgl
    --use-gl=desktop
    --log-level=0
    --allow-file-access-from-files
    --allow-file-access

The last two options enable the browser to load textures from disk. You will
need this if you are developing your site locally.



Platform notes (OS/GPU/Drivers)
-------------------------------

While WebGL is supported in most current browsers, there are various little
differences in operating system and graphics driver support. We can not discuss
any possible OS/GPU/Driver combination here, but you might find some valuable
hints if you can not get WebGL up and running on your system. With all systems
be sure to use latest drivers for your graphics card and be sure those drivers
support the OpenGL standard.


Blacklists
~~~~~~~~~~
Some GPUs and Driver combinations are blacklisted by browser vendors. In case
of strange errors, please check the following lists for:

  * `Mozilla <https://wiki.mozilla.org/Blocklisting/Blocked_Graphics_Drivers>`_
  * `Chrome <http://src.chromium.org/viewvc/chrome/trunk/src/chrome/browser/resources/software_rendering_list.json>`_



Windows
~~~~~~~

**Chrome Frame**

Currently, the only way to use WebGL with Internet Explorer is by using the Google `Chrome Frame plugin <http://code.google.com/chrome/chromeframe/>`_. In order to make X3DOM use the WebGL renderer with Internet Explorer, you need to install Chrome Frame and enable it in your HTML or web browser configuration. The most simple way to enable ChromeFrame is to put this line in your HTML head section:

.. code-block:: html

    <meta http-equiv="X-UA-Compatible" content="chrome=1" />

Download and furhter reading:

    * `Chrome Frame <http://code.google.com/chrome/chromeframe/>`_
    * `Getting started <http://www.chromium.org/developers/how-tos/chrome-frame-getting-started>`_


Mac OS X
~~~~~~~~

Safari 5.1+ is supporting WebGL, however you need to enable it in the Developer menu.
This menu is invisible by default. Go to "Preferences" (Cmd-,) and select the
"Advaned" tab. Enable the option "Show Develop menu in menu bar".

**Rubber band scrolling in Mac OS X 10.7 Lion**

On Mac OS Lion, with Apple input devices scrolling behaves differently. When reaching the end of a page, a rubber band effect kicks in. This behavior is also present on iOS devices.

If you don't like the effect, you can turn if off using a CSS rule:

.. code-block:: css

    body { overflow: hidden }
    
Keep in mind that this rule changes the default behavior of your browser and scrollbars might disappear entirely. It is only a workaround and the preferred fix is to wait for Apple to provide a switch to turn this functionality off. Also note that the rubber band scrolling might not be visible at all with non Apple pointing devices.


Ubuntu Linux
~~~~~~~~~~~~

In order to enable WebGL for Firefox 4 and above you need to:

  1. Install the libosmesa6 package. You can do so by issuing
     the the following command in a terminal window or one of the consoles::

         sudo apt-get install libosmesa6

  2. Open the Firefox application and enter *about:config* in the
     location bar and *webgl* in the filter box.

  3. Set the option *webgl.force-enable* and *webgl.prefer-native-gl* to *true*

  4. Set *webgl.osmesalib* to the the path of the library you installed
     in step 1, usually thi should be: ``/usr/lib/libOSMesa.so.6``

  5. Restart Firefox

