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
``x3dom.js``         The minified X3DOM library in a given version
``x3dom.css``        Stylesheets for X3DOM, you need to include this file
                     in your webpage in order for X3DOM to display.
                     However you can also take it as template to
                     adapt your own stylesheet.
``x3dom.swf``        The Flash 11 integration, for browsers not supporting
                     native X3DOM or WebGL.
===================  =====================================================

You can `download the files from the X3DOM server <http://x3dom.org/download/>`_
and put them on your harddisk or your webserver. The released versions reside
in subdirectories with version numbers, for exmaple version 1.3 is available
at `1.3/ <http://x3dom.org/download/1.3/>`_. For the current release you can use
the shortcut `current/ <http://x3dom.org/download/current/>`_ it will always point
to the latest released version.


Development builds
------------------
If you are adventurous and want to work with the latest development build of
X3DOM `download the latest builds from the X3DOM server at
<http://x3dom.org/download/dev/>`_.

The development build automatically created every night and will contain
many fixes and features not available to the released versions. We try to
keep the development build at a working stage and not break compatibility
with released versions. However a working dev build can not be guaranteed
all the time.


Build your own
--------------
**Note:** The following is for advanced developers. If you wish to use a rather
recent version of X3DOM and do not want to tinker with Python, just
use the development build.

All source code to X3DOM is kept under the Git revision control and you can
`browse the repository <http://github.com/x3dom/x3dom/>`_ online. There is a
download link available for any file or directory, if you only nee a portion
of the X3DOM code.

If you have access to Git, you can get a copy of the repository here::

    git clone https://github.com/x3dom/x3dom.git

You can also check out a specific release from GitHub::

    git clone https://github.com/x3dom/x3dom.git
    git checkout <version>
    e.g. git checkout 1.2.0

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


