.. _internals_conventions:

X3DOM conventions
=================


File Encoding, Indentation
--------------------------
With all X3DOM source files the following file format 
and encoding conventions have to be used. Please set your 
editor to the following settings:

File encoding: **UTF-8**, without Byte-Order-Mark (BOM)
Lineendings: **LF** (Unix Line Feed)
Indentation: 4 spaces (unless otherwise noted)

A note about indentation: Essentially this is a 
no-tab policy. Which means no tab chars in the code to be used
for indentation. Most editors allow you to configure using tabs, 
but then save the code as spaces. This is very convenient 
functionality you should use if you are used to to indent with
the TAB key.



Commit early, commit often
--------------------------
If at all possible commit small units of work very often.
Large commits, with no updates of your codebase in between
most likely will lead to conflicts in projects with more
than one committer. Partition your work into small logical 
pieces and commit as often as possible. View the commit and
push as a extended save operation. It's far better to have 10
10-liner commits, than one 100 liner.


Git Workflow
------------
Make it a policy to pull changes before you start working and
then again before you push.

Also make yourself familiar with the stash command. Even more
important is to use local branches for developing a new feature
or trying things out. It is very easy to do and you will have
less merge conflicts.

Familiarize yourself with the use of the source control on 
the command line. Only after you understand how this works,
you can switch to GUI tools. It's important to understand
the basics of the versioning system. The GUI tools disguise much
of what's going on. Learning to use a source control system is a 
one-time effort that will benefit you far into the future 
(even if versioning systems change, the learning is 
only incremental). Code conflicts are inevitabel and mastering your tool
can help to resove those conflicts.

The versioning system is not a replacement for communication. 


JS Coding Conventions
---------------------


Documentation and Tests
-----------------------

- Prose
- JSDoc



Python Files
------------
For Python there are official, very sane, guidelines outlined in
`PEP-8`_. All Python code should follow this styleguide. 


.. _PEP-8: http://www.python.org/dev/peps/pep-0008/`

