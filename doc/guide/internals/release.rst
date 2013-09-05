.. _internals_release:

X3DOM release process
=====================

This doc collects all steps to be done for creating
a X3DOM release. At this point, release notes should be done,
everything should be committed and pusehd, ready for release.


Documentation
-------------

Copy release notes to ``doc/guide/releasenotes.rst``

Set version: ``doc/guide/conf.py``

    version = 'x.x'
    release = 'x.x.x'

Include new version x3dom in docs: doc/guide/_themes/flask/layout.html

.. code-block::

    cp dist/x3dom-full.js doc/guide/_static/
    vi doc/guide/_themes/flask/layout.html

replace

.. code-block::

    <script src="http://x3dom.org/download/x.x/x3dom-full.js"></script>

with

.. code-block::

       <script src="{{pathto('_static/x3dom-full.js', 1) }}"></script>

Remove dev/beta notice

.. code-block:

       <div id="beta_notice"...


Add older version links: ``doc/guide/_templates/sidebarintro.html``


Commit
------

.. code-block:

  ./manage.py --changelog
  git commit -Am "Release x.x.x"
  git tag x.x.x
  git push --tags


Build
-----

.. code-block::

  ./manage.py --release x.x.x
  
Copy ``dist/`` output to ``download/x.x.x/`` folder.

Revert documentation changes.

Finally the webpage nees to be updated, espeically the "status" section.
