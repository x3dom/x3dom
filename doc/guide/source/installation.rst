.. _installation:

Installation
============

X3DOM itself depends on no external libraries. All you need in order to make it
work are the x3dom.js, x3dom.css, and x3dom.swf files. In order to develop
locally, or without an internet connection, you should simply download these
files to your computer.


Living on the Edge
------------------

If you are adventurous and want to work with the latest development version of
X3DOM, there are two ways: you can either download the latest revision from our
webserver (`x3dom.js <http://x3dom.org/dist/x3dom.js>`_
`x3dom.css <http://x3dom.org/x3dom/dist/x3dom.css>`_,
`x3dom.swf <http://x3dom.org/x3dom/dist/x3dom.swf>`_), or use a `checkout of the
sources <http://github.com/x3dom/x3dom/>`_. The latter approach, building X3DOM
yourself, is the recommended and more up-to-date way.


System Requirements and Browser Support
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

In order to be able to work with X3DOM, you need a WebGL enabled web browser.
We also support different fallback models for browsers not supporting WebGL
natively. The best support of features however is only ensured with a browser
sporting a WebGL implementation. You can check the status of supported
browser `here <http://www.x3dom.org/?page_id=9>`_.


Platform Notes (OS/GPU/Drivers)
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

No specific notes yet.


Mac OS X
~~~~~~~~

Note that Safari is currently not supporing WebGL. You need to use WebKit.


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
     in step 1, usually thi should be: /usr/lib/libOSMesa.so.6

  5. Restart Firefox
  