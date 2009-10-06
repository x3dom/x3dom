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

if (! Array.forEach) {
	Array.forEach = function (array, fun, thisp) {
		var len = array.length;
		for (var i = 0; i < len; i++)
			if (i in array)
				fun.call(thisp, array[i], i, array);
	}
}

if (! Array.map) {
	Array.map = function(array, fun, thisp) {
		var len = array.length;
		var res = [];
		for (var i = 0; i < len; i++)
			if (i in array)
				res[i] = fun.call(thisp, array[i], i, array);
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
				if (fun.call(thisp, val, i, array))
					res.push(val);
			}
		}
		return res;
	};
}

// The global namespace
var x3dom = {
	canvases: new Array()
};

/** Wraps the given @p canvas with an X3DCanvas object.

	All wrapped canvases are stored in the x3dom.canvases array.
 */
x3dom.wrap = function(canvas) {
	var x3dCanvas = new x3dom.X3DCanvas(canvas);
	x3dom.canvases.push(x3dCanvas);
	return x3dCanvas;
};


/** @class x3dom.X3DCanvas
 */
x3dom.X3DCanvas = function(canvas) {
	
	this.canvas = canvas;
	this.fps_target = 1975;
	this.fps_n = 0;
    this.gl = initContext(canvas);
	this.doc = null;
	this.tick = null;

	function initContext(canvas) {
		x3dom.debug.logInfo("Initializing X3DCanvas for [" + canvas.id + "]");
		var gl = x3dom.gfx_mozwebgl(canvas);
		if (!gl) {
			x3dom.debug.logError("No 3D context found...");
			// return null;
		}
		return gl;
	};

};

x3dom.X3DCanvas.prototype.tick = function() {
	
// 	if (++fps_n == 10) {
// 		fps_element.textContent = fps_n*1000 / (new Date() - fps_t0) + ' fps';
// 		fps_t0 = new Date();
// 		fps_n = 0;
// 	}
// 	try {
// 		// doc.advanceTime(t); 
// 		this.doc.render(this.gl);
// 	} catch (e) {
// 		x3dom.debug.logException(e);
// 		throw e;
// 	}
// 	t += 1/this.fps_target;
// 	
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
		setInterval( function() { doc.render(gl); x3dom.debug.logInfo("##" + canvas.canvas.id); }, 1000);
		
	};
	
	this.doc.onerror = function () { alert('Failed to load X3D document') };
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
