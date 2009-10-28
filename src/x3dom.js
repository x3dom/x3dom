/*!
* x3dom javascript library 0.1
* http://instantreality.org/
*
* Copyright (c) 2009 Peter Eschler, Johannes Behr, Yvonne Jung
*     based on code originally provided by Philip Taylor:
*     http://philip.html5.org/demos/canvas/3d/x3d/
* Dual licensed under the MIT and GPL licenses.
* 
*/

// Add some JS1.6 Array functions:
// (This only includes the non-prototype versions, because otherwise it messes up 'for in' loops)

if (!Array.forEach) {
    Array.forEach = function (array, fun, thisp) {
        var len = array.length;
        for (var i = 0; i < len; i++) {
            if (i in array) {
                fun.call(thisp, array[i], i, array);
            }
        }
    };
}

if (! Array.map) {
    Array.map = function(array, fun, thisp) {
        var len = array.length;
        var res = [];
        for (var i = 0; i < len; i++) {
            if (i in array) {
                res[i] = fun.call(thisp, array[i], i, array);
            }
        }
        return res;
    };
}

if (! Array.filter) {
    Array.filter = function(array, fun, thisp) {
        var len = array.length;
        var res = [];
        for (var i = 0; i < len; i++) {
            if (i in array) {
                var val = array[i];
                if (fun.call(thisp, val, i, array)) {
                    res.push(val);
                }
            }
        }
        return res;
    };
}

/** @namespace The global x3dom namespace. */
var x3dom = {
    canvases: []
};

x3dom.x3dNS = 'http://www.web3d.org/specifications/x3d-namespace'; // non-standard, but sort of supported by Xj3D
x3dom.x3dextNS = 'http://philip.html5.org/x3d/ext';
x3dom.xsltNS = 'http://www.w3.org/1999/XSL/x3dom.Transform';

/** Wraps the given @p canvas with an X3DCanvas object.

    All wrapped canvases are stored in the x3dom.canvases array.
*/
// x3dom.wrap = function(canvas) {
//     var x3dCanvas = new x3dom.X3DCanvas(canvas);
//     x3dom.canvases.push(x3dCanvas);
//     return x3dCanvas;
// };


/** @class x3dom.X3DCanvas
*/
x3dom.X3DCanvas = function(x3dElem) {
    
    this.initContext = function(canvas) {
        x3dom.debug.logInfo("Initializing X3DCanvas for [" + canvas.id + "]");
        var gl = x3dom.gfx_webgl(canvas);
        if (!gl) {
            x3dom.debug.logError("No 3D context found...");
			this.canvasDiv.removeChild(canvas);
            return null;
        }
        return gl;
    }

    this.createHTMLCanvas = function(x3dElem) {
        x3dom.debug.logInfo("Creating canvas for X3D element...");
        // this.canvasDiv = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
        this.canvasDiv.style.position = "relative"; 
        this.canvasDiv.style.cssFloat = "left";
        // this.canvasDiv.style.border = "3px solid #f00";
        var canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
		
        this.canvasDiv.appendChild(canvas);
        x3dElem.parentNode.insertBefore(this.canvasDiv, x3dElem);

        // Apply the width and height of the X3D element to the canvas 
        var x, y, w, h, showStat;
        canvas.style.position = "relative";
		canvas.style.border = "1px solid #000";
		canvas.style.marginBottom = "1em";
		canvas.style.marginRight = "1em";
		canvas.style.cssFloat = "left";
        canvas.style.cursor = "pointer";
		
        if ((x = x3dElem.getAttribute("x")) !== null) {
            canvas.style.left = x.toString();
        }
        if ((y = x3dElem.getAttribute("y")) !== null) {
            canvas.style.top = y.toString();
        }
        if ((w = x3dElem.getAttribute("width")) !== null) {
            //x3dom.debug.logInfo("width=" + w);
            canvas.style.width = this.canvasDiv.style.width = w.toString();
			//Attention: pbuffer dim is _not_ derived from style attribs!
			canvas.setAttribute("width",canvas.style.width);
        }
        if ((h = x3dElem.getAttribute("height")) !== null) {
            //x3dom.debug.logInfo("height=" + h);
            canvas.style.height = this.canvasDiv.style.height = h.toString();
			//Attention: pbuffer dim is _not_ derived from style attribs!
			canvas.setAttribute("height",canvas.style.height);
        }
        
        // If the X3D element has an id attribute, append "_canvas"
        // to it and and use that as the id for the canvas
        var id;
        if ((id=x3dElem.getAttribute("id")) !== null) {
            this.canvasDiv.id = id + "_canvas_div";
            canvas.id = id + "_canvas";
        }
        else {
            // If the X3D element does not have an id... do what?
            // For now check the number of canvas elements in the page
            // and use length+1 for creating a (hopefully) unique id
            var index = (document.getElementsByTagNameNS(x3dom.x3dNS, 'X3D').length+1);
            this.canvasDiv.id = "canvas_div_" + index;
            canvas.id = "canvas" + index;
        }
		
        return canvas;
    }

    this.createStatDiv = function() {
        var statDiv = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
        statDiv.innerHTML = "0 fps";
        
		statDiv.style.margin = "0px";
		statDiv.style.padding = "0px";
		// statDiv.style.left = "10px";
        statDiv.style.right = "10px";
        statDiv.style.top = "10px";
        statDiv.style.position = "absolute";
        // statDiv.style.top = "10px";
        statDiv.style.color = "#00ff00";
		statDiv.style.fontFamily = "sans-serif";
		statDiv.style.fontSize = "small";
        // statDiv.style.backgroundColor = "navajowhite";
        statDiv.style.width = "75px";
        statDiv.style.height = "70px";
        statDiv.style.cssFloat = "right";
		
        this.canvasDiv.appendChild(statDiv);
        
        statDiv.oncontextmenu = statDiv.onmousedown = function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.returnValue = false;
            return false;
        }
        
        return statDiv;
    }

    this.x3dElem = x3dElem;
    this.canvasDiv = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
    this.canvas = this.createHTMLCanvas(x3dElem);
	this.canvas.parent = this;
    this.fps_t0 = new Date().getTime();
    this.gl = this.initContext(this.canvas);
    this.doc = null;

    this.showStat = x3dElem.getAttribute("showStat");
    this.statDiv = (this.showStat !== null && this.showStat == "true") ? this.createStatDiv() : null;
	
	if (this.canvas !== null && this.gl !== null)
	{
		// event handler for mouse interaction
		this.canvas.mouse_dragging = false;
		this.canvas.mouse_button = 0;
		this.canvas.mouse_drag_x = 0;
		this.canvas.mouse_drag_y = 0;
		
		//document.oncontextmenu = function() { return false; }
		
		this.canvas.oncontextmenu = function(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			evt.returnValue = false;
			return false;
		}
		
		this.canvas.addEventListener('mousedown', function (evt) {
			switch(evt.button) {
				case 0:  this.mouse_button = 1; break;	//left
				case 1:  this.mouse_button = 4; break;	//middle
				case 2:  this.mouse_button = 2; break;	//right
				default: this.mouse_button = 0; break;
			}
			this.mouse_drag_x = evt.layerX;
			this.mouse_drag_y = evt.layerY;
			this.mouse_dragging = true;
			
			if (evt.shiftKey) this.mouse_button = 1;
			if (evt.ctrlKey) this.mouse_button = 4;
			if (evt.altKey) this.mouse_button = 2;
			
			this.parent.doc.onMousePress(this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
			
			window.status=this.id+' DOWN: '+evt.layerX+", "+evt.layerY;
			//window.status=this.id+' DOWN: '+evt.screenX+", "+evt.screenY;
			evt.preventDefault();
			evt.stopPropagation();
			evt.returnValue = false;
		}, false);
		
		this.canvas.addEventListener('mouseup', function (evt) {
			this.mouse_button = 0;
			this.mouse_dragging = false;
			
			this.parent.doc.onMouseRelease(this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
			
			//window.status=this.id+' UP: '+evt.screenX+", "+evt.screenY;
			evt.preventDefault();
			evt.stopPropagation();
			evt.returnValue = false;
		}, false);
		
		this.canvas.addEventListener('mouseout', function (evt) {
			this.mouse_button = 0;
			this.mouse_dragging = false;
			
			this.parent.doc.onMouseRelease(this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
			
			//window.status=this.id+' OUT: '+evt.screenX+", "+evt.screenY;
			evt.preventDefault();
			evt.stopPropagation();
			evt.returnValue = false;
		}, false);
		
		this.canvas.addEventListener('dblclick', function (evt) {
			this.mouse_button = 0;
			this.mouse_drag_x = evt.layerX;
			this.mouse_drag_y = evt.layerY;
			this.mouse_dragging = false;
			
			this.parent.doc.onDoubleClick(this.mouse_drag_x, this.mouse_drag_y);
			
			window.status=this.id+' DBL: '+evt.layerX+", "+evt.layerY;
			evt.preventDefault();
			evt.stopPropagation();
			evt.returnValue = false;
		}, false);
		
		this.canvas.addEventListener('mousemove', function (evt) {
			window.status=this.id+' MOVE: '+evt.layerX+", "+evt.layerY;
			
			if (!this.mouse_dragging)
				return;
			
			var dx = evt.layerX - this.mouse_drag_x;
			var dy = evt.layerY - this.mouse_drag_y;
			this.mouse_drag_x = evt.layerX;
			this.mouse_drag_y = evt.layerY;
			
			if (evt.shiftKey) this.mouse_button = 1;
			if (evt.ctrlKey) this.mouse_button = 4;
			if (evt.altKey) this.mouse_button = 2;
			
			//this.parent.doc.ondrag(dx, dy, this.mouse_button);
			this.parent.doc.ondrag(this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
			
			//window.status=this.id+' MOVE: '+dx+", "+dy;
			evt.preventDefault();
			evt.stopPropagation();
			evt.returnValue = false;
		}, false);
		
		this.canvas.addEventListener('DOMMouseScroll', function (evt) {
			//this.parent.doc.ondrag(0, 2*evt.detail, 2);
			this.mouse_drag_y += 2 * evt.detail;
			this.parent.doc.ondrag(this.mouse_drag_x, this.mouse_drag_y, 2);
			
			window.status=this.id+' SCROLL: '+evt.detail;
			evt.preventDefault();
			evt.stopPropagation();
			evt.returnValue = false;
		}, false);
	}
};

x3dom.X3DCanvas.prototype.tick = function() 
{    
	var d = new Date().getTime();
	var fps = 1000.0 / (d - this.fps_t0);
	
	if (this.statDiv)	
		this.statDiv.textContent = fps.toFixed(2) + ' fps';
	this.fps_t0 = d;
	
	try {
		this.doc.advanceTime(d / 1000); 
		this.doc.render(this.gl);
	}
	catch (e) {
		x3dom.debug.logException(e);
		throw e;
	}
};

/** Loads the given @p uri.
    @param uri can be a uri or an X3D node
    */
x3dom.X3DCanvas.prototype.load = function(uri, sceneElemPos) {
    this.doc = new x3dom.X3DDocument(this.canvas, this.gl);
    var x3dCanvas = this;
    var doc = this.doc;
    var gl = this.gl;
    x3dom.debug.logInfo("gl=" + gl.toString() + ", this.gl=" + this.gl + ", pos=" + sceneElemPos);
	
    this.doc.onload = function () {
        x3dom.debug.logInfo("loaded [" + uri + "]");
        setInterval( function() {
                x3dCanvas.tick();
            }, 
            16	// use typical monitor frequency as bound
        );
    };
    
    this.doc.onerror = function () { alert('Failed to load X3D document'); };
    this.doc.load(uri, sceneElemPos);
};


(function () {

    var onload = function() {

        // Search all X3D elements in the page
        var x3ds = document.getElementsByTagNameNS('http://www.web3d.org/specifications/x3d-namespace', 'X3D');
        
        // Convert the collection into a simple array (is this necessary?)
        x3ds = Array.map(x3ds, function (n) { return n; });
		
		var activateLog = false;
		for (var i in x3ds) {
			var showLog = x3ds[i].getAttribute("showLog");
			if (showLog !== null && showLog == "true")
			{
				activateLog = true;
				break;
			}
		}
		
		// Activate debugging/logging for x3dom. Logging will only work for
        // all log calls after this line!
		if (activateLog)
			x3dom.debug.activate();
		
		x3dom.debug.logInfo("Found " + x3ds.length + " X3D nodes...");

        // Create a HTML canvas for every X3D scene and wrap it with
        // an X3D canvas and load the content
        for (var i in x3ds) {
            var x3dcanvas = new x3dom.X3DCanvas(x3ds[i]);
			if (x3dcanvas.gl === null)
			{
				var aDiv = document.createElement("div");
				aDiv.style.border = "1px solid";
				aDiv.style.margin = "4px";
				aDiv.style.padding = "4px";
				aDiv.style.color = "darkblue";
				aDiv.style.fontFamily = "sans-serif";
				aDiv.style.backgroundColor = "navajowhite";
				aDiv.appendChild(document.createTextNode("WebGL is not yet supported in your browser. "));
				aDiv.appendChild(document.createElement("br"));
				aDiv.appendChild(document.createElement("br"));
				var aLnk = document.createElement("a");
				aLnk.setAttribute("href","http://www.x3dom.org/?page_id=9");
				aLnk.appendChild(document.createTextNode("Follow link for a list of supported browsers... "));
				aDiv.appendChild(aLnk);
				
				x3dcanvas.canvasDiv.appendChild(aDiv);

                // remove the stats div (it's not needed when WebGL doesnt work)
                x3dcanvas.canvasDiv.removeChild(x3dcanvas.statDiv);
				continue;
			}
			
            x3dcanvas.load(x3ds[i], i);
            x3dom.canvases.push(x3dcanvas);
        }

        // Test nodetype registration
        // x3dom.registerNodeType("Foo", "Bar", {});
    };
    
    var onunload = function() {
        for (var i=0; i<x3dom.canvases.length; i++) {
            x3dom.canvases[i].doc.shutdown(x3dom.canvases[i].gl);
        }
    };

    window.addEventListener('load', onload, false);
    window.addEventListener('unload', onunload, false);
    window.addEventListener('reload', onunload, false);
    
    document.onkeypress = function(evt) {
        for (var i=0; i<x3dom.canvases.length; i++) {
            x3dom.canvases[i].doc.onKeyPress(evt.charCode);
        }
        return true;
    }

})();
