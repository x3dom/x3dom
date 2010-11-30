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

Rendering this document in a WebGL [compatible browser][browser_support], results in a look similar to this:

![Initial scene](media/styling1.png "Initial scene")


Basic styling
-------------

In the initial example above, we created the scene using the `x3d` tag initializing it with `width` and `height` attributes. In order to take advantage of CSS, we can use a style rule to set height and with dynamically. 

The following CSS rules, added to the `x3d` element will resize the scene to 50% hight and with of the parent element - in this case the `body`:

    ...
    <x3d style="width:50%; height:50%;">
    ...
    
You need to remove the `width/height` attributes as well because they take precedence over any CSS rule. In order to see the CSS in effect we also add a different background color to our scene:

    ...
    <x3d style="width:50%; height:50%; background-color:black">
    ...

The result looks something like this:
 
![Scene with bg and h/w](media/styling2.png "Background and relative dimensions")

Note that the dimensions are relative now and adapted when resizing the browser window ([demo][demo_resize]).


Adding interaction
------------------

The dynamic resizing showed in the last chapter is fine for changing browser size and positioning elements. We can also use JavaScript to change the dimensions of the `x3d` element. In order to achieve this we are going to build a piece of functionality that mimics the "fullscreen" behavior of the ubiquitous video player. In this case we are going to resize the scene to 90% if the browser window (or more precisely to the 90% of the parent html element).

First we need to add a button to our HTML document which floats over the `x3d` element. Fortunately, HTML already provides a `button` tag we can use exactly for this purpose. Since we want to the button to float over the `x3d` element, we need to put both of them into another `div`:

    <div id="container">
        <button id="toggler">Zoom</button>
        <x3d style="width:50%; height:50%; background-color:black">
            ...
        </x3d>
    </div>

In the `head` section of the document we add some `style` definitions to make it look more smooth and ensure the button floats on top of the `x3d` element:
    
    #toggler {
    	position: relative;
    	float:left;
    	z-index:100;
    	top: 0;
    	left: 0;
    	width: 10em;
    	height: 2em;
    	border:none;
    	background-color:#202021;
    	color:#ccc;
    }

We are also going to make the styling more flexible by setting the actual height and width of the `x3d` element indirectly. By taking advantage of the default CSS rule for the `x3d` element, which sets height and width to 100%, we can remove the inline styling and use the container to set the dimensions like so:

	#container {
		width: 50%;
		height: 50%;
	}

    <div id="container">
        <button id="toggler">Zoom</button>
        <x3d style="background-color:black">
            ...
        </x3d>
    </div>

The result of this refactoring is exactly the same as described in the section before with the exception that there is now a "Zoom" button floating over the x3d element in the top left corner.

![Scene with Zoom button](media/styling3.png "Scene with Zoom button")

Nice. But a button alone is quite useless, we need to be able to do something with it. In order to give the user some feedback about, we first going to add a hover effect - by simply changing the background color. A simple style rule will do the job:

    #toggler:hover {
    	background-color:blue;
    }


Next we add some JavasScript to the mix, so we can actually do something when the user clicks on the button. First we think of a method name to use, like `toggle()` and attach it to the `onclick` event of our button:

    ...
    <button id="toggler" onclick="toggle(this);return false;">Zoom</button>
    ...

Note to the purists: Yes, there are several, more elegant ways of doing this. For the sake of clarity we are using the `onclick` attribute of the `button` element in this tutorial.

Next, we need to implement the `toggle` function. Within the `head` element, and after the inclusion of `x3dom.js` we add the following code:

    <script type="text/javascript">

    	var zoomed = false;

    	function toggle(elm) {

    		container = document.getElementById('container')
    		button = document.getElementById('toggler')
	
    		var new_size;

    		if (zoomed) {
    			new_size = "50%";
    			button.innerHTML = "Zoom";
    		} else {
    			new_size = "90%";
    			button.innerHTML = "Unzoom";
    		}

    		zoomed = !zoomed

    		container.style.width = new_size
    		container.style.height = new_size
    	}
    </script>

This code implements a simple toggle function. The boolean variable `zoomed` tracks the state of the resize. Depending wether the `x3d` element is sized to 90% or not, the new size is set and applied to the container element. Additionally, the text of the button is changed to show the action performed when the user is clicking it.


Conclusion
----------

See how it works in this [demo][demo_resize_final].

You will also find another example [here][css_resize_example].




[browser_support]: http://www.x3dom.org/?page_id=9 "X3DOM browser support"
[demo_resize]: media/styling2.mov "Demo resizing"
[demo_resize_final]: media/styling4.mov "Demo resizing"
[getting_started]: http://www.x3dom.org/?page_id=627 "X3DOM Getting Started"
[css_resize_example]: http://www.x3dom.org/?p=1479 "X3DOM resize example"