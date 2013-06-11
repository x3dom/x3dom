.. _internals_conventions:

X3DOM conventions
=================


File Encoding, Indentation
--------------------------
With all X3DOM source files the following file format 
and encoding conventions have to be used:

- File encoding: **UTF-8**, without Byte-Order-Mark (BOM)
- Lineendings: **LF** (Unix Line Feed)
- Indentation: **4 spaces** (unless otherwise noted)

A note about indentation: Essentially this is a 
no-tab policy. Which means no tab chars in the code to be used
for indentation. Most editors allow you to configure using tabs, 
but then save the code as spaces. This is very convenient 
functionality you should use if you are used to to indent with
the TAB key.

TODO: basic guide of how to set this for webstorm,vi,emacs,sublime,textmate



Commit early, commit often
--------------------------
If at all possible commit small units of work very often.
Large commits, with no updates of your codebase in between
most likely will lead to conflicts in projects with more
than one committer. Committing often also lets your fellow
programmers know what you are working on and integrate your
changes early on.

Partition your work into small logical pieces and commit as 
often as possible. View ``commit`` and ``push`` as a extended 
save operation. It's far better to have ten 10-liner commits, 
than one 100 liner.


Use descriptive commit messages
-------------------------------
Try to avoid non-descriptive commit messages unless it's really small
correction like fixing a typo or forgotton semi-colon. Always describe
what you have done succinctly. If you are closing a ticket with this
commit refer the ticket in your message. For example::

    git commit -m "Fixing readability problem reported with issue #123"

The following messages also `close the referred ticket`_ in GitHub. No 
need to log in for closing tickets::

    git commit -m "Typo, fixing #123"
    git commit -m "Added CAD example closing #123"


You can refer to github issues, commits and tickets by using the SHA or
issue number::

    git commit -m "Fixing bug introduced with 70b0d56e1aca5ec6b55b915b1810a5caeddfcd62"


More:

  - GitHub Help 



Git Workflow
------------
Make it a policy to issue a ``git pull`` before you start working and
then again before you commit and push. Push your work as soon as 
possible - ideally after a commit.

Make yourself familiar with the `stash`_ command if you need to set 
aside changes during work. 
Even more important is to use `local branches`_ for developing a new 
feature or trying things out. It is very easy to do and you will have
less merge conflicts. If you go this route, it important that you 
regulary merge changes from the upstream master into your local branch
to keep up to date. 

Don't push your branch to GitHub unless more than one person is workin 
on that branch. If you need to sync local branches from say your 
workstation to a laptop or home machine, there are other ways (ssh, 
format-patch, etc.)


Familiarize yourself with the use of the source control on 
the command line (`Git Manual`_). Only after you understand how this 
works, you can switch to GUI tools. It's important to understand
the basics of the versioning system. The GUI tools disguise much
of what's going on. Learning to use a source control system is a 
one-time effort that will benefit you far into the future 
(even if versioning systems change, the learning is only incremental). 
Code conflicts are inevitabel and mastering your tool
can help to resove those conflicts.

Some pointers:

- Git aliases https://git.wiki.kernel.org/index.php/Aliases
- `Git Manual`_


**The versioning system is not a replacement for communication. **





JS Coding Conventions
---------------------
The following coding guidelines should be followed:



Semi colon
+++++++++++
Always end a statement mit a semi-colon. For C coders that's ususally
a non issue. If you are coming from another dynamic language, it happens
frequently to forget the semi-colon.



if/else shortcuts
+++++++++++++++++
Aviod the use if ``if/else`` constructs without curly braces. It impaires
readability and is a potential source for errors:

Good:

.. code-block:: js

    if (condition) {
        doSomething();
    }
    else {
        doAnotherThing();
    }


Bad:

.. code-block:: js

    if (condition)
        doSomething();
    else
        doOtherThing()



- möglichst wenig anonyme funktionen verwenden
- immer mit ; abschliessen
- that = this
- variablen nicht inline deklarieren/initialisieren sondern direkt
  nach funktionsbeginn var x,j,k = 0, var test = true, etc. Auch die
  Zähler (js kennt nur zwei contexte: global und funktionslokal, blocklocal
  gibts bei js nicht.
- sprechende Namen verwenden
- hier mehr zur Inspiration:
  http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml



Documentation and Tests
-----------------------

- Prose
- JSDoc


- Jeder Entwickler ist für die Dokumentation seines codes verantworlich.
  Wer code eincheckt sollte ihn auch Dokumentieren, denn keiner versteht
  besser was er gemacht hat. JSDoc ist da ausreichend, im Idealfall auch
  in der Prosa-Doku.
- Wenn sich was ändert, Doku anpassen. Oft sind das nur Kleinigkeiten
  die schnell gemacht sind.
- Im Idealfall wird auch ein Test geschrieben, vom Implementator des
  Features.
- Wenn ein bug gefunden wird, sollte möglichst ein Test gebaut werden, der den Bug
  verifiziert und nach dem Fix sollte der test dann laufen.
- Konfiguration der IDE oder generierte Files gehören nicht ins repo




Python Files
------------
For Python there are official, very sane, guidelines outlined in
`PEP-8`_. All Python code should follow this styleguide. 


.. _PEP-8: http://www.python.org/dev/peps/pep-0008/
.. _stash: http://git-scm.com/book/en/Git-Tools-Stashing
.. _local branches: http://git-scm.com/book/en/Git-Branching-Branch-Management
.. _Git Manual: http://git-scm.com/doc
.. _GitHub Help: https://help.github.com/
.. _close the referred ticket: https://help.github.com/articles/closing-issues-via-commit-messages