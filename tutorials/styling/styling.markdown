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

![Initial scene](media/styling1.png "Initial scene")


First styling steps
-------------------

In the initial example above, we created the scene using the `x3d` tag initializing it with a width and height as attributes. In order to take advantage of CSS, we can use a CSS rule to set height and with. Or goal is to create a resizable scene. The following CSS rules, added to the `x3d` element will resize the scene to 50% hight and with of the parent `body` element:

    ...
    <x3d style="width:50%; height:50%;">
    ...
    
You need to remove the `width/height` attributes as well because they take precedence over any CSS rule. In order to see the CSS in effect we also add a different background color to our scene:

    ...
    <x3d style="width:50%; height:50%; background-color:black">
    ...

The result looks something like this:

 
![Scene with bg and h/w](media/styling2.png "Background and relative dimensions")

Note that the dimensions are relative now and adapted when resizing the browser window. Check out a [demo here][demo_resize]



[demo_resize]: media/styling2.mov "Demo resizing"
[getting_started]: http://www.x3dom.org/?page_id=627 "X3DOM Getting Started")