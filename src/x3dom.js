/*!
 * x3dom javascript library 0.1
 * http://instantreality.org/
 *
 * Copyright (c) 2009 Peter Eschler, Johannes Behr
 * Dual licensed under the MIT and GPL licenses.
 * 
 */

// Self-executing anonymous function wrapping all x3dom stuff...
(function () {

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


    // Establish x3dom in the local namespace and also in the window namespace
	var x3dom = window.x3dom = function(canvas) {        
    // var x3dom = function(canvas) {        
        return new x3dom.fn.init(canvas);
    };

    x3dom.fn = x3dom.prototype = {
    
		
        init: function(canvas) {
            // alert("x3dom init... canvas=" + canvas);
			this.canvas = canvas;

			var log_element = document.createElementNS('http://www.w3.org/1999/xhtml', 'p');
			log_element.setAttribute('class', 'log');
			var log_frame_element = document.createElementNS('http://www.w3.org/1999/xhtml', 'p');
			log_frame_element.setAttribute('class', 'log');
			var fps_element = document.createElementNS('http://www.w3.org/1999/xhtml', 'p');
			var container = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');			
			container.appendChild(log_element);
			container.appendChild(log_frame_element);
			container.appendChild(fps_element);
			canvas.parentNode.appendChild(container);
			
			function log(msg) {
				log_element.appendChild(document.createTextNode(msg+"\n"));
			}

			function log_frame(msg) {
				log_frame_element.appendChild(document.createTextNode(msg+"\n"));
			}

			function log_frame_clear() {
				log_frame_element.innerHTML = '';
			}

			function assert(c, msg) {
				if (!c) {
					log("Assertion failed in " + assert.caller.name + ': ' + msg);
				}
			}

			this.gl = this.gfx_mozwebgl(canvas);
            if (!this.gl) {
                alert("No 3D context found...");
				// return null;
			}

			this.env = { assert: assert, log: log, log_frame: log_frame, log_frame_clear: log_frame_clear };

			var fps_t0 = new Date(), fps_n = 0;
			var t = 0;

			this.tick = function (doc, gl) {
				log_frame_clear();
				if (++fps_n == 10) {
					fps_element.textContent = fps_n*1000 / (new Date() - fps_t0) + ' fps';
					fps_t0 = new Date();
					fps_n = 0;
				}
				try {
					// log("doc=" + doc);
					// doc.advanceTime(t); 
					doc.render(gl);
				} catch (e) {
					log(e);
					throw e;
				}
				t += 1/this.fps_target;
				this.env.log(".");
			};

			// setInterval(this.tick, 1000);
			// this.gl.renderScene(env, 0, 0);
            return this;
        },        

		canvas: null,
		fps_target: 1975,
        gl: null,
		env: null,
		doc: null,
		tick: null,

		/** Loads the given @p uri.
			@param uri can be a uri or an X3D node
		  */
		load: function(uri) {
			this.doc = new x3dom.X3DDocument(this.canvas, this.gl, this.env);
			var env = this.env;
			var self = this;
			var gl = this.gl;
			var doc = this.doc;
			var tick = function() { self.tick(doc, gl); }
			this.doc.onload = function () {
				// setInterval(tick, 1000/this.fps_target);
				// alert(uri + " loaded...");	
				setInterval(tick, 1000);
				
			};
			
			this.doc.onerror = function () { alert('Failed to load X3D document') };
			this.doc.load(uri);
		}
    };

	// Give the init function the x3dom prototype for later instantiation
	x3dom.fn.init.prototype = x3dom.fn;	

})();