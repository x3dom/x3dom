Styling with CSS
================

This tutorial guides you through the process of using CSS with X3DOM. In order to demonstrate the functionality, we are going to create a HTML document with a X3DOM scene. That scene is then amended with a button that allows to resize the scene by setting CSS attributes using JavaScript.

Basic scene document
--------------------

We are going to use the box example scene established in the [getting started][getting_started] tutorial:

    <!DOCTYPE html>
    <html>
      <head>
        <title>X3DOM styling tutorial</title>
        <link rel="stylesheet" href="http://www.x3dom.org/x3dom/release/x3dom.css">
        <script src="http://www.x3dom.org/x3dom/release/x3dom.js"></script>
      </head>
      <body>
        <h1>Styling tutorial</h1>
        <x3d width="400px" height="300px">
          <scene>
            <shape>
              <appearance>
                <material diffuseColor='red'></material>  
              </appearance>
              <box></box>
            </shape>
          </scene>
        </x3d>
      </body>
    </html>

Rendering this document in a WebGL compatible browser, results in a look similar to this:

![Initial scene](media/example1.png"Initial scene")


First styling steps
-------------------

In the initial example above, we created the scene using the `x3d` tag initializing it with a width and height as attributes. In order to take advantage of CSS, we can use a CSS rule to set height and with. Or goal is to create a resizable scene. The following CSS rules will ensure that our scene is 50% of width and 50% of the height of the parent `body` element:

    body {
        width: 100%;
        height: 100%
    }

    #my_scene {
        width: 50%;
        height:50%;
    }

To access the `x3d` element with a CSS rule, the `id` attribute is added, and the `width/height` attributes removed because they take precedence of any CSS rule. The resulting HTML/CSS document looks like this:

    <!DOCTYPE html>
    <html>
      <head>
        <title>X3DOM styling tutorial</title>
        <link rel="stylesheet" href="http://www.x3dom.org/x3dom/release/x3dom.css">
        <script src="http://www.x3dom.org/x3dom/release/x3dom.js"></script>
        <style>
            body {
                width: 100%;
                height: 100%
            }
            #my_scene {
                width: 50%;
                height:50%;
            }
        </style>
      </head>
      <body>
        <h1>Styling tutorial</h1>
        <x3d id="my_scene">
          <scene>
            <shape>
              <appearance>
                <material diffuseColor='red'></material>  
              </appearance>
              <box></box>
            </shape>
          </scene>
        </x3d>
      </body>
    </html>


[getting_started]: http://www.x3dom.org/?page_id=627 "X3DOM Getting Started")