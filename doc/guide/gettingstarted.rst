.. _gettingstarted:

Getting started
===============


Downloading X3DOM
-----------------
The recommended way of using X3DOM in your application is downloading a
released version to your local machine or server. The code of a released
version should be usable in all modern browsers.

X3DOM itself depends on no external libraries. All you need in order to make
it work are the following files:

===================  =====================================================
``x3dom-v1.2.js``    The minified X3DOM library in a given version
``x3dom-v1.2.css``   Stylesheets for X3DOM, you need to include this file
                     in your webpage in order for X3DOM to display.
                     However you can also take it as template to
                     adapt your own stylesheet.
``x3dom-1.2.swf``    The Flash 11 integration, for browsers not supporting
                     native X3DOM or WebGL.
===================  =====================================================

You can `download the files from the X3DOM server <http://x3dom.org/x3dom/release/>`_
and put them on your harddisk or your webserver. The file naming follows
the pattern: ``x3dom-vMAIOR.MINOR.js``.


Development builds
------------------
If you are adventurous and want to work with the latest development build of
X3DOM `download the latest builds from the X3DOM server <http://x3dom.org/x3dom/release/>`_.
Just use the files ending in no version number:

* `x3dom.js <http://x3dom.org/x3dom/release/x3dom.js>`_
* `x3dom.css <http://x3dom.org/x3dom/release/x3dom.css>`_
* `x3dom.swf <http://x3dom.org/x3dom/release/x3dom.swf>`_

**WARNING:** Do **NOT** use the development builds in a production system. It is
not thoroughly tested. It is not stable and will probably break things. If in
doubt, use the current release.


Build from revision control
---------------------------
**Note:** The following is for advanced developers. If you wish to use a rather
recent version of X3DOM and do not want to tinker with Make and friends, just
use the development build.

All source code to X3DOM is kept under the Git revision control and you can
`browse the repository <http://github.com/x3dom/x3dom/>`_ online. There is a
download link available for any file or directory, if you only nee a portion
of the X3DOM code.

If you have access to Git, you can get a copy of the repository here::

    git clone git://github.com/x3dom/x3dom.git

You can also check out a specific release from GitHub::

    git clone git://github.com/x3dom/x3dom.git
    git checkout <version>
    e.g. git checkout 1.2.0

If you want to build your own copy of jQuery from the Git repository, you
need to build it from the sources.


Build requirements
~~~~~~~~~~~~~~~~~~
X3DOM currently rquires the following components to be installed on your
computer:

* `Make <http://www.gnu.org/software/make/>`_: Available on most Unix-based systems as well as cygwin
* `Python <http://python.org>`_: The Python programming language is
  available for all major platforms
* `Sphinx <http://sphinx.pocoo.org/>`_: A documentation tool, you will
  need this in order to build the documentation. Sphinx is a Python
  package and can be installed by running ``easy_install sphinx``.
* `Node.js <http://nodejs.org/>`_: A Javascript engine, optional.
  You can use this for linting and compressing javascript code.

Once you have all prerequisites installed, you can build X3DOM::

    make

The resulting build will be written to the ``dist/`` directory. Additionally
you have the following targets::

    make lint            Checks for syntax problems
    make runserver       Runs a local web server for testing inline nodes (Ajax)
    make guide           Builds the documentation (in dist/guide/)

In order to restore your source tree to its original state run::

   make clean


Fore more detailed information on working with the source, please see
the `developer wiki <http://github.com/x3dom/x3dom/wiki>`_.


