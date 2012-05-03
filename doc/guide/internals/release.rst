.. _internals_release:

X3DOM release process
=====================

This doc collects all steps to be done for creating
a X3DOM release.

Documentation
-------------

Set version: doc/guide/conf.py

    version = 'x.x'
    release = 'x.x.x'

Include new version x3dom in docs: doc/guide/_themes/flask/layout.html

    cp dist/x3dom-full.js doc/guide/_static/
    vi doc/guide/_themes/flask/layout.html

    repleace

       <script src="http://x3dom.org/download/x.x/x3dom-full.js"></script>

    with

       <script src="{{pathto('_static/x3dom-full.js', 1) }}"></script>

    Remove dev/beta notice

       <div id="beta_notice"...


Add older version links: doc/guide/_templates/sidebarintro.html


Commit
------
  git commit -Am "Release x.x.x"
  git tag x.x.x
  git push --tags


Build
-----

  ./manage.py --release
