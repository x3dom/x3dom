.. _styling:

Styling with CSS
================

This tutorial guides you through the process of using CSS with X3DOM. In order to demonstrate the functionality, we are going to create a HTML document with a X3DOM scene. That scene is then amended with a button that allows to resize the scene by setting CSS attributes using JavaScript.


Basic scene document
--------------------

We are going to use the box example scene established in the :ref:`firststeps` tutorial:

.. code-block:: html

    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>CSS Integration Test</title>
        <link rel="stylesheet" href="http://www.x3dom.org/download/x3dom.css">
        <script src="http://www.x3dom.org/download/x3dom.js"></script>
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

Rendering this document in a `WebGL compatible browser <http://www.x3dom.org/?page_id=9>`_, results in a look similar to this:


.. image:: /_static/tutorial/styling/styling1.png


Basic styling
-------------

In the initial example above, we created the scene using the ``<x3d>`` tag initializing it with ```width``` and ```height``` attributes. In order to take advantage of CSS, we can use a CSS rule to set height and width in the visual layer.

The following CSS rules, added to the ``<head>`` of the HTML document element will resize the scene to 50% height and with of the parent element - in this case the ``body`` element. In order to make this work with IDs, we need to add the ```id``` attribute to the ``<x3d>`` element:

.. code-block:: html

    <head>
      <style>
        #the_element {
          width: 50%;
          height: 50%;
        }
      </style>
    </head>
    ...
    <x3d id="the_one">
    ...
    
We need to remove the ``width`` and ``height`` attributes as well because they take precedence over the CSS rules. In order to change the background of the WebGL viewport we add the CSS background rule. To make this work, the scene must be transparent (default). If you change the background in the X3D definition, it will not be visible because it is disguised by the X3D background.

.. code-block:: css

    #the_element {
        width: 50%;
        height: 50%;
        background:#000 url(http://www.x3dom.org/x3dom/example/texture/solarSystem/starsbg.png);
     }

The result looks something like this:
 
.. image:: /_static/tutorial/styling/styling2.png

Note that the dimensions are relative now and adapted when resizing the browser window.

* `View demo video <../_static/tutorial/styling/styling2.mov>`_
* `View live example <../_static/tutorial/styling/styling2.html>`_


Adding interaction
------------------

The dynamic resizing showed in the last chapter is great for automatically adapting to browser resize and for positioning elements in your layout. In order to add more elaborate interaction with the scene, we can use JavaScript. For example, to change the dimensions of the X3D element so we can resize it to "fullscreen" like the ubiquitous video player. 

In order to achieve this we are going to add a button to our example that allows to switch our X3D element to fullscreen – or more precisely to 100% of the parent HTML element.

First step is adding a piece of markup that we can use for styling as a button. Fortunately there already is a HTML element that is meant for exactly this purpose: ``<button>``. And since we move in a HTML5 context, we put the button element within the ``<x3d>`` element:

.. code-block:: xml

    <x3d id="the_element">
        <button id="toggler">Zoom</button>
        <scene>
        ...
    </x3d>

Semantically we are fine, but now we need to style the button so it floats over the scene. The following style rules will accomplish this. Please note the `position: realtive` property we are setting on the ``x3d`` element. We need this to allow absolute positioning of the button within the ``x3d`` element. Otherwise it would position absolute to the page. Additionally we need to remove the default 1 pixels border added by the X3DOM default stylesheet.

.. code-block:: css

    #the_element {
        ...
        border: none;  // remove the default 1px border
        position: relative;
     }
    
    #toggler {
    	position: absolute;
    	float: left;
    	z-index: 1;
    	top: 0px;
    	left: 0px;
    	width: 10em;
    	height: 2em;
    	border: none;
    	background-color: #202021;
    	color: #ccc;
    }

Looking at our example in a browser reveals that there is a "Zoom" button floating over the x3d element in the top left corner.

.. image:: /_static/tutorial/styling/styling3.png


### A button alone isn’t interaction

Nice. But a button alone is quite useless, we need to be able to do something with it. But first things first. In order to give the user some feedback what is going on, we add a hover effect by simply changing the background color. This is basic `usability <http://www.useit.com/>`_ and a simple style rule will do the job:

.. code-block:: css

    #toggler:hover {
    	background-color:blue;
    }

Next we add some JavasScript to the mix, because we want to actually change something when the user clicks on the button: Fullscreen. First we think of a method name to use, like ``toggle()`` and attach it to the ``onclick`` event of our button:

.. code-block:: html

    <button id="toggler" onclick="toggle(this);return false;">Zoom</button>

Note to the purists: Yes, there are several, more elegant ways of achieving this. For the sake of clarity of this tutorial, we are using the ``onclick`` attribute of the ``button`` element. In practice you probably want to use a DOM library like `jQuery <http://jquery.com>`_ et al.

Next, we need to implement the ``toggle`` function. Within a ``script`` element. **After** the inclusion of ``x3dom.js`` we add the following code:

.. code-block:: javascript

    	var zoomed = false;

    	function toggle(button) {

    		var new_size;
    		var x3d_element;
		
    		x3d_element = document.getElementById('the_element');

    		title = document.getElementById('title')
            body  = document.getElementById('body')
            
    		if (zoomed) {
    			new_size = "50%";
    			button.innerHTML = "Zoom";
    			title.style.display = "block"
    			body.style.padding = '10px'
    		} else {
    			new_size = "100%";
    			button.innerHTML = "Unzoom";
    			title.style.display = "none"
    			body.style.padding = '0'
    		}

    		zoomed = !zoomed;

    		x3d_element.style.width = new_size;
    		x3d_element.style.height = new_size;
    	}

This code implements a simple toggle function. The boolean variable ``zoomed`` tracks the state of the resize. Depending wether the ``x3d`` element is sized to 100% or not, the new size is set and applied to the ``x3d`` element (``x3d_element``). Since we use a square viewport ``width`` and ``height`` have the same values. Additionally, the text of the button is changed to show the action performed when the user is clicking it.

The rest of the styling affects the surrounding elements like the title and the body. In order to achieve the fullscreen effect we obviously hide the `h1` title and remove the default padding of the ``body`` element. Likewise when zooming back, the values are restored.

The last bit in the puzzle is another style rule which resets margin and padding of the body element. Add this rule in front of all others:

.. code-block:: css

    <style>
        body {
            margin:0;
            padding:10px;
        }
        ...
    </style>


Finally the fully zoomed result looks like this: 

.. image:: /_static/tutorial/styling/styling4.png

* `See how it works (video) <../_static/tutorial/styling/styling4.mov>`_
* `Try it for yourself (html) <../_static/tutorial/styling/styling4.html>`_


You will also find another example which also styles other properties `here <http://www.x3dom.org/x3dom/example/x3dom_x3dElementCSSIntegration.html>`_.

