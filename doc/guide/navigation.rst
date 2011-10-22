.. _navigation:


Camera Navigation
=================
The current WebGL/JS implementation of X3DOM provides some generic
interaction and navigation methods. Interactive objects will be handled
by HTML-like events. Navigation can be user-defined or controlled by
specific predefined modes.

Currently X3DOM supports the following interactive navigation modes:

* Examine
* Walk
* Fly
* Look-at
* Game

Non-Interactive movement encompasses the functionality of:

* Resetting a view
* Showing all
* Upright view


Interactive camera movement
---------------------------

Examine
~~~~~~~
Activate this mode by pressing the ``"e"`` key.

========================    ==============================
Function                    Mouse Button
========================    ==============================
Rotate                      Left / Left + Shift
Pan                         Mid / Left + Ctrl
Zoom                        Right / Wheel / Left + Alt
Set center of rotation      Double-click left
========================    ==============================


Walk
~~~~
Activate this mode by pressing the ``"w"`` key.

========================    ==============================
Function                    Mouse Button
========================    ==============================
Move forward                Left
Move backward               Right
========================    ==============================


Fly
~~~
Activate this mode by pressing the ``"f"`` key.

========================    ==============================
Function                    Mouse Button
========================    ==============================
Move forward                Left
Move backward               Right
========================    ==============================


Look at
~~~~~~~
Activate this mode by pressing the ``"l"`` key.

========================    ==============================
Function                    Mouse Button
========================    ==============================
Move in                     Left
Move out                    Right
========================    ==============================


Game
~~~~
Activate this mode by pressing the ``"g"`` key.

To look around (rotate view) move the mouse.

========================    ==============================
Function                    Key
========================    ==============================
Move forward                Cursor up
Move backward               Cursor down
Strafe Left                 Cursor left
Strafe Right                Cursor right
========================    ==============================



Non-interactive camera movement
-------------------------------

========================    ==============================
Function                    Key
========================    ==============================
Reset view                  r
Show all                    a
Upright                     u
========================    ==============================


Mid-Button troubleshooting
--------------------------

If the web page has scroll bars and autoscrolling is enabled, Mid-Button
currently does not work yet. As a workaround, you can disable autoscrolling
by unchecking the **Use autoscrolling** checkbox in the Firefox browser
options, as is shown in the screenshot below (for the Firefox case).

.. image:: _static/UseAutoscrolling.png