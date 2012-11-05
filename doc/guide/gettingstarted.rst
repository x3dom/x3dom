.. _gettingstarted:

Getting started
===============


Using X3DOM
------------
The recommended way of using X3DOM during the development of your
application is linking the online version within your HTML
document. You can use the following boiler-plate to kick-start
development:

.. code-block:: html

    <!doctype html>
    <html>
    <head>
      <meta encoding="utf-8">
      <script src="http://www.x3dom.org/download/dev/x3dom.js"></script>
      <link rel="stylesheet" href="http://www.x3dom.org/download/dev/x3dom.css">
    </head>
    <body>
      <x3d> ...</x3d>
    </body>
    </html>

X3DOM should be usable in all modern browser and depends on no external
libraries.

Please be aware that hot-linking the X3DOM library as outlined
above will give you the cutting-edge build of the library with all pros
and cons. You will recieve the latestest fixes and features, but also
a potentially unstable or temporarliy broken version. We try to maintain
a unbroken dev build, but that can't be guaranteed all the time.

Once you finished developing your application, you should download
the necessary snapshot build and deploy the files with your application
on your server or a CDN. All you need in order to make it work are the
following files:

===================  =====================================================
``x3dom.js``         The minified X3DOM library in a given version.
``x3dom.css``        Stylesheets for X3DOM, you need to include this file
                     in your webpage in order for X3DOM to display.
                     However you can also take it as template to
                     adapt your own stylesheet.
``x3dom.swf``        The Flash 11 integration, for browsers not supporting
                     native X3DOM or WebGL.
===================  =====================================================

You can `download the files from the X3DOM server <http://x3dom.org/download/>`_
and put them on your harddisk or your webserver. The released versions reside
in subdirectories with version numbers, for example version 1.4 is available
at `1.4/ <http://x3dom.org/download/1.4/>`_. For the current development build
you can use the shortcut `dev/ <http://x3dom.org/download/dev/>`_ it will always point
to the latest released version.


Releases, dev builds and library management
-------------------------------------------
Since X3DOM is a research project our official release cycle is fairly long.
In order to keep your application up-to date with any browser related
incompatibilities, you need to manage a local copy of the X3DOM development
build along with your application. In other words: the released versions are
not maintained. Therefore the following release/library management on your
side might be one sensible approach:

  * Use the dev build during development of your application
  * Use the released version if you deploy in a controlled environment
    (Browser and OS versions)
  * Freeze the dev build (or use a release in a controlled environment) and
    deploy that freezed version anlongside your application on your server or CDN
  * If browser issues occur, use the latest X3DOM dev build and test your
    application thourougly.
  * Monitor your environment regulary and perform your own tests with all
    browser versions and OS combinations your application is targed for as
    soon as a X3DOM or browser changes occur

It should be stressed that X3DOM as well as browser development is a moving
target. It is only sensible to adjust your development and library management
processes to this environment.


Development builds
------------------
If you want to work with the latest development build of X3DOM (which in fact 
is recommended), then `download the latest builds from the X3DOM server here
<http://x3dom.org/download/dev/>`_.

The development build is automatically created every night and will contain
many fixes and features not available to the released versions. We try to
keep the development build at a working stage and not break compatibility
with released versions. However, a working dev build can not be guaranteed
all the time.


Build your own
--------------
**Note:** If you wish to use a rather recent version of X3DOM and do not want
to tinker with the build process, just use the development build. If you
like to work on X3DOM itself, use the instructions set forth in this
chapter.

All source code to X3DOM is kept under the Git revision control and you can
`browse the repository <http://github.com/x3dom/x3dom/>`_ online. There is a
download link available for any file or directory, if you only nee a portion
of the X3DOM code.

If you have access to Git, you can get a copy of the repository here::

    git clone https://github.com/x3dom/x3dom.git

You can also check out a specific release from GitHub::

    git clone https://github.com/x3dom/x3dom.git
    git checkout <version>
    e.g. git checkout 1.3.0

If you want to build your own copy of X3DOM from the Git repository, you
need to build it from the sources.


Build requirements
~~~~~~~~~~~~~~~~~~
X3DOM currently requires the following components to be installed on your
computer:

* `Python <http://python.org>`_: The Python programming language is
  available for all major platforms
* `Sphinx <http://sphinx.pocoo.org/>`_: A documentation tool, you will
  need this in order to build the documentation. Sphinx is a Python
  package and can be installed by running ``easy_install sphinx``.
* `argparse <http://pypi.python.org/pypi/argparse>`_: For Python 2.6 or earlier.

Once you have all prerequisites installed, you can build X3DOM::

    python manage.py --build

The resulting build will be written to the ``dist/`` directory. 

Fore more detailed information on working with the source, please see
the `developer wiki <http://github.com/x3dom/x3dom/wiki>`_.
