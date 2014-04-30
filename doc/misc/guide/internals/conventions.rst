.. _internals_conventions:

X3DOM conventions
=================


File Encoding, Indentation
--------------------------
With all X3DOM source files the following file format 
and encoding conventions have to be used:

- File encoding: **UTF-8**, without Byte-Order-Mark (BOM)
- Line endings: **LF** (Unix Line Feed)
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
correction like fixing a typo or forgotton semicolon. Always describe
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


**The versioning system is not a replacement for communication.**





JS Coding Conventions
---------------------
The following coding guidelines should be followed:



Semicolon
+++++++++++
Always end a statement mit a semicolon. For C/C++ coders that's ususally
a non issue. If you are coming from another dynamic language, it happens
frequently to forget the semicolon.



if/else shortcuts
+++++++++++++++++
Avoid the use of ``if/else`` constructs without curly braces. It impaires
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



Other conventions
+++++++++++++++++
- Empty line between functions
- Anonymous functions only if really necessary
- Don't forget ``that = this`` when adding internal functions
- JS only has global and function-local scope, but **no** block-local scope
  (variables declared in ``for`` loops are accessible in whole function).
  Variables thus should be declared/initialized at beginning of function
- Use speaking names (verbNoun)
- methods and variables start with lower-case character, e.g. doStuff()
- "classes" internally start with upper-case character, e.g. Transform
- For inspiration:
  http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml



Documentation and Tests
-----------------------
- Document your code yourself. JSDoc is ok, ideally also in prose documentation
- Update documentation after code modifications
- Write/add test for new feature
- When bug was found, build test for verifying bug. After fix, test should work
- Don't commit configuration files of IDE or other generated files




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
