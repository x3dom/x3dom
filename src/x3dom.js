/*!
* x3dom javascript library 0.1
* http://instantreality.org/
*
* Copyright (c) 2009 Peter Eschler, Johannes Behr
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
    
    function initContext(canvas) {
        x3dom.debug.logInfo("Initializing X3DCanvas for [" + canvas.id + "]");
        var gl = x3dom.gfx_mozwebgl(canvas);
        if (!gl) {
            x3dom.debug.logError("No 3D context found...");
            // return null;
        }
        return gl;
    }

    function createCanvas(x3dElem) {
        x3dom.debug.logInfo("Creating canvas for X3D element..");
        var canvas = this.canvasDiv = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
        var canvas = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
        canvasDiv.appendChild(canvas);
        x3dElem.parentNode.insertBefore(canvasDiv, x3dElem);

        // Apply the width and height of the X3D element to the canvas 
        var x, y, w, h, showFps;
        canvas.style.position = "relative";
        if ((x = x3dElem.getAttribute("x")) !== null) {
            canvas.style.left = x.toString();
        }
        if ((y = x3dElem.getAttribute("y")) !== null) {
            canvas.style.top = y.toString();
        }
        if ((w = x3dElem.getAttribute("width")) !== null) {
            // x3dom.debug.logInfo("width=" + w);
            canvas.style.width = w.toString();
        }
        if ((h = x3dElem.getAttribute("height")) !== null) {
            // x3dom.debug.logInfo("height=" + h);
            canvas.style.height = h.toString();
        }
        if ((showFps = x3dElem.getAttribute("showFps")) !== null) {
            if (showFps == "false") {
                
            }
            else if (showFps == "true") {
                // createFpsDiv();
            }
        }
        // If the X3D element has an id attribute, append "_canvas"
        // to it and and use that as the id for the canvas
        var id;
        if ((id=x3dElem.getAttribute("id")) !== null) {
            canvasDiv.id = id + "_canvas_div";
            canvas.id = id + "_canvas";
        }
        else {
            // If the X3D element does not have an id... do what?
            // For now check the number of canvas elements in the page
            // and use length+1 for creating a (hopefully) unique id
            var index = (document.getElementsByTagNameNS(x3dom.x3dNS, 'X3D').length+1);
            canvasDiv.id = "canvas_div_" + index;
            canvas.id = "canvas" + index;
        }
        return canvas;
    }

    function createFpsDiv() {
        var fpsDiv = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
        fpsDiv.innerHTML = "fps: ";
        fpsDiv.setAttribute("class", "fps");
        canvasDiv.appendChild(fpsDiv);        
        return fpsDiv;
    }

    this.x3dElem = x3dElem;
    this.canvas = createCanvas(x3dElem, this);
    this.fps_target = 1975;
    this.fps_n = 0;
    this.fps_t0 = 0;
    this.gl = initContext(this.canvas);
    this.doc = null;
    this.t = 0;
    this.canvasDiv = null;
    this.showFps = x3dElem.getAttribute("showFps");
    this.fpsDiv = this.showFps !== null ? createFpsDiv() : null;
    //this.tick = null;

};

x3dom.X3DCanvas.prototype.tick = function() {
    
    if (this.showFps) {
        if (++this.fps_n == 10) {
            this.fpsDiv.textContent = this.fps_n*1000 / (new Date() - this.fps_t0) + ' fps';
            this.fps_t0 = new Date();
            this.fps_n = 0;
        }
        try {
            // doc.advanceTime(t); 
            this.doc.render(this.gl);
        } catch (e) {
            x3dom.debug.logException(e);
            throw e;
        }
        this.t += 1/this.fps_target;
    }
    x3dom.debug.logInfo("#");
};

/** Loads the given @p uri.
    @param uri can be a uri or an X3D node
    */
x3dom.X3DCanvas.prototype.load = function(uri) {
    this.doc = new x3dom.X3DDocument(this.canvas, this.gl);
    var canvas = this;
    var doc = this.doc;
    var gl = this.gl;
    x3dom.debug.logInfo("gl=" + gl + ", this.gl=" + this.gl);
    this.doc.onload = function () {
        // setInterval(tick, 1000/this.fps_target);
        // alert(uri + " loaded...");	
        //var ti = canvas.tick;
        x3dom.debug.logInfo("loaded [" + uri + "]");
        setInterval( function() { 
                doc.render(gl); 
                //for (var c in canvas)
                canvas.tick();
                // x3dom.debug.logInfo("##" + canvas.canvas.id + doc._scene.ctx); 
            }, 
            1000
        );
        
    };
    
    this.doc.onerror = function () { alert('Failed to load X3D document'); };
    this.doc.load(uri);
};


//     // Establish x3dom in the local namespace and also in the window namespace
// 	var x3dom = window.x3dom = function(canvas) {        
//     // var x3dom = function(canvas) {        
//         return new x3dom.fn.init(canvas);
//     };

//     x3dom.fn = x3dom.prototype = {
//     		
//         /** Initializes the given @p canvas for webgl usage.
//           */
//         init: function(canvas) {
//             // alert("x3dom init... canvas=" + canvas);
// 			this.canvas = canvas;
// 
// 			var fps_element = document.createElementNS('http://www.w3.org/1999/xhtml', 'p');
// 			var container = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
// 			container.appendChild(fps_element);
// 			canvas.parentNode.appendChild(container);
// 
// 			var fps_t0 = new Date(), fps_n = 0;
// 			var t = 0;
// 
// 			this.tick = function (doc, gl) {
// 				log_frame_clear();
// 				if (++fps_n == 10) {
// 					fps_element.textContent = fps_n*1000 / (new Date() - fps_t0) + ' fps';
// 					fps_t0 = new Date();
// 					fps_n = 0;
// 				}
// 				try {
// 					// log("doc=" + doc);
// 					// doc.advanceTime(t); 
// 					doc.render(gl);
// 				} catch (e) {
// 					x3dom.debug.logException(e);
// 					throw e;
// 				}
// 				t += 1/this.fps_target;
// 				// x3dom.debug.logInfo(".");
// 			};
// 
//             return this;
//         },        
//     };

(function (){
    
    window.onload = function() {

        // Activate debugging/logging for x3dom. Logging will only work for
        // all log calls after this line!
        x3dom.debug.isActive = true;

        // Search all X3D elements in the page
        var x3ds = document.getElementsByTagNameNS('http://www.web3d.org/specifications/x3d-namespace', 'X3D');
        x3dom.debug.logInfo("Found " + x3ds.length + " X3D nodes...");
        // Convert the collection into a simple array (is this necessary?)
        x3ds = Array.map(x3ds, function (n) { return n; });		

        // Create a HTML canvas for every X3D scene and wrap it with
        // an X3D canvas and load the content
        for (var i in x3ds) {
            //var canvas = createCanvas(x3ds[i]);
            var x3dcanvas = new x3dom.X3DCanvas(x3ds[i]);
            x3dcanvas.load(x3ds[i]);
        }

        // Test nodetype registration
        // x3dom.registerNodeType("Foo", "Bar", {});
    };
})();
