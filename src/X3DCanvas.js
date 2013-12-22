/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/**
 * @class x3dom.X3DCanvas
 */
x3dom.X3DCanvas = function(x3dElem, canvasIdx) {

    var that = this;
	this.canvasIdx = canvasIdx;

    this.initContext = function(canvas, forbidMobileShaders, forceMobileShaders, tryWebGL2)
    {
        x3dom.debug.logInfo("Initializing X3DCanvas for [" + canvas.id + "]");
        var gl = x3dom.gfx_webgl(canvas, forbidMobileShaders, forceMobileShaders, tryWebGL2, x3dElem);
        
        if (!gl) {
            x3dom.debug.logError("No 3D context found...");
            this.x3dElem.removeChild(canvas);
            return null;
        } else {
            var webglVersion = parseFloat(x3dom.caps.VERSION.match(/\d+\.\d+/)[0]);
            if (webglVersion < 1.0) {
                x3dom.debug.logError("WebGL version " + x3dom.caps.VERSION +
                    " lacks important WebGL/GLSL features needed for shadows, special vertex attribute types, etc.!");
            }
        }
        
        return gl;
    };

	this.initFlashContext = function(object, renderType) {
        x3dom.debug.logInfo("Initializing X3DObject for [" + object.id + "]");
        return x3dom.gfx_flash(object, renderType);
    };

	this.appendParam = function(node, name, value) {
		var param = document.createElement('param');
		param.setAttribute('name', name);
		param.setAttribute('value', value);
		node.appendChild( param );
	};
	
	this.fileExists = function(url) {
		var xhr = new XMLHttpRequest();
		try {
			xhr.open("HEAD", url, false);
			xhr.send(null);
			return (xhr.status != 404);
		} catch(e) { return true; }
	};		
	
	this.detectFlash = function(required, max)
	{
		var required_version = required;
		var max_version = max;
		var available_version = 0;

		/* this section is for NS, Mozilla, Firefox and similar Browsers */
		if(typeof(navigator.plugins["Shockwave Flash"]) == "object")
		{
			var description = navigator.plugins["Shockwave Flash"].description;
			available_version = description.substr(16, (description.indexOf(".", 16) - 16));
		}
		else if(typeof(ActiveXObject) == "function") {
			for(var i = 10; i < (max_version + 1); i ++) {
				try {
					if(typeof(new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + i)) == "object") {
						available_version = i+1;
					}
			   }
			   catch(error){}
			}
		}
	
		return [available_version, required_version];
	};
	
	this.createInitFailedDiv = function(x3dElem) {
		var div = document.createElement('div');
        div.setAttribute("id", "x3dom-create-init-failed");
		div.style.width = x3dElem.getAttribute("width");
		div.style.height = x3dElem.getAttribute("height");
		div.style.backgroundColor = "#C00";
		div.style.color = "#FFF";
		div.style.fontSize = "20px";
		div.style.fontWidth = "bold";
		div.style.padding = "10px 10px 10px 10px";
		div.style.display = "inline-block";
		div.style.fontFamily = "Helvetica";
		div.style.textAlign = "center";
		
		div.appendChild(document.createTextNode('Your Browser does not support X3DOM'));
		div.appendChild(document.createElement('br'));
		div.appendChild(document.createTextNode('Read more about Browser support on:'));
		div.appendChild(document.createElement('br'));
		
		var link = document.createElement('a');
		link.setAttribute('href', 'http://www.x3dom.org/?page_id=9');
		link.appendChild( document.createTextNode('X3DOM | Browser Support'));
		div.appendChild(link);

        // check if "altImg" is specified on x3d element and if so use it as background
        var altImg = x3dElem.getAttribute("altImg") || null;
        if (altImg) {
            var altImgObj = new Image();
            altImgObj.src = altImg;
            div.style.backgroundImage = "url("+altImg+")";
            div.style.backgroundRepeat = "no-repeat";
            div.style.backgroundPosition = "50% 50%";
        }

        x3dElem.appendChild(div);

        x3dom.debug.logError("Your Browser does not support X3DOM!");
	};

    this.createFlashObject = function (x3dElem) {

        var result = this.detectFlash(11, 11);

        if (!result[0] || result[0] < result[1]) {
            return null;
        } else {

            x3dom.debug.logInfo("Creating FlashObject for (X)3D element...");

            //Get X3D-Element ID
            var id = x3dElem.getAttribute("id");
            if (id !== null) {
                id = "x3dom-" + id + "-object";
            } else {
                var index = new Date().getTime();
                id = "x3dom-" + index + "-object";
            }

            //Get SWFPath
            var swf_path = x3dElem.getAttribute("swfpath");
            if (swf_path === null) {
                swf_path = "x3dom.swf";
            }

            if (!this.fileExists(swf_path)) {
                var version;
                if (x3dom.versionInfo === undefined ||
                    x3dom.versionInfo.version.indexOf('dev') != -1) //use dev version
                {
                    version = "dev";
                }
                else {
                    version = x3dom.versionInfo.version.substr(3);
                }

                swf_path = "http://www.x3dom.org/download/" + version + "/x3dom.swf";

                x3dom.debug.logWarning("Can't find local x3dom.swf (" + version + "). X3DOM now using the online version from x3dom.org." +
                    "The online version needs a <a href='http://examples.x3dom.org/crossdomain.xml'>crossdomain.xml</a> " +
                    "file in the root directory of your domain to access textures");
            }

            //Get width from x3d-Element or set default
            var width = x3dElem.getAttribute("width");
            var idx = -1;
            if (width == null) {
                width = 550;
            } else {
                idx = width.indexOf("px");
                if (idx != -1) {
                    width = width.substr(0, idx);
                }
            }
            //Get height from x3d-Element or set default
            var height = x3dElem.getAttribute("height");
            if (height == null) {
                height = 400;
            } else {
                idx = height.indexOf("px");
                if (idx != -1) {
                    height = height.substr(0, idx);
                }
            }

            //Get flash render type
            var renderType = x3dElem.getAttribute("flashrenderer");
            if (renderType == null) {
                this.flash_renderType = "forward";
            } else {
                this.flash_renderType = "deferred";
            }

            var obj = document.createElement('object');
            obj.setAttribute('width', '100%');
            obj.setAttribute('height', '100%');
            obj.setAttribute('id', id);

            //Check for xhtml
            if (!document.doctype || document.doctype && document.doctype.publicId.search(/DTD XHTML/i) != -1) {
                x3dom.debug.logWarning("Flash backend doesn't like XHTML, please use HTML5!");
                obj.setAttribute('style', 'width:' + width + 'px; height:' + height + 'px;');
            } else {
                if (x3dElem.getAttribute('style') == null) {
                    x3dElem.setAttribute('style', 'width:' + width + 'px; height:' + height + 'px;');
                }
            }

            this.appendParam(obj, 'menu', 'false');
            this.appendParam(obj, 'quality', 'high');
            this.appendParam(obj, 'wmode', 'direct');
            this.appendParam(obj, 'allowScriptAccess', 'always');
            this.appendParam(obj, 'flashvars', 'canvasIdx=' + this.canvasIdx + '&renderType=' + this.flash_renderType);
            this.appendParam(obj, 'movie', swf_path);

            if (navigator.appName == "Microsoft Internet Explorer") {
                x3dElem.appendChild(obj);
                obj.setAttribute('classid', 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000');
            } else {
                obj.setAttribute('type', 'application/x-shockwave-flash');
                obj.setAttribute('data', swf_path);
                x3dElem.appendChild(obj);
            }

            return obj;
        }
    };

    this.createHTMLCanvas = function(x3dElem)
    {
        x3dom.debug.logInfo("Creating canvas for (X)3D element...");
        var canvas = document.createElement('canvas');
        canvas.setAttribute("class", "x3dom-canvas");

        // check if user wants to style the X3D element
        var userStyle = x3dElem.getAttribute("style");
        if (userStyle) {
            x3dom.debug.logInfo("Inline X3D styles detected");
        }

        // check if user wants to attach events to the X3D element
        var evtArr = [
            "onmousedown",
            "onmousemove",
            "onmouseout",
            "onmouseover",
            "onmouseup",
            "onclick",
            "ondblclick",
            "onkeydown",
            "onkeypress",
            "onkeyup",

            // w3c touch: http://www.w3.org/TR/2011/WD-touch-events-20110505/
            "ontouchstart",
            "ontouchmove",
            "ontouchend",
            "ontouchcancel",
            "ontouchleave",
			"ontouchenter",
            
            // apple gestures
            //"ongesturestart",
            //"ongesturechange",
            //"ongestureend",

            // mozilla touch
            "onMozTouchDown",
            "onMozTouchMove",
            "onMozTouchUp",

            // drag and drop, requires 'draggable' source property set true (usually of an img)
            "ondragstart",
            "ondrop",
            "ondragover"
        ];

        // TODO; handle attribute event handlers dynamically during runtime
        //this step is necessary because of some weird behavior in some browsers:
        //we need a canvas element on startup to make every callback (e.g., 'onmousemove') work,
        //which was previously set for the canvas' outer elements
        for (var i=0; i < evtArr.length; i++)
        {
            var evtName = evtArr[i];
            var userEvt = x3dElem.getAttribute(evtName);
            if (userEvt) {
                x3dom.debug.logInfo(evtName +", "+ userEvt);

                canvas.setAttribute(evtName, userEvt);

                //remove the event attribute from the X3D element to prevent duplicate callback invocation
                x3dElem.removeAttribute(evtName);
            }
        }

        var userProp = x3dElem.getAttribute("draggable");
        if (userProp) {
            x3dom.debug.logInfo("draggable=" + userProp);
            canvas.setAttribute("draggable", userProp);
        }

        // workaround since one cannot find out which handlers are registered
        if (!x3dElem.__addEventListener && !x3dElem.__removeEventListener)
        {
            x3dElem.__addEventListener = x3dElem.addEventListener;
            x3dElem.__removeEventListener = x3dElem.removeEventListener;

            // helpers to propagate the element's listeners
            x3dElem.addEventListener = function(type, func, phase) {
                var j, found = false;
                for (j=0; j < evtArr.length && !found; j++) {
                    if (evtArr[j] === type) {
                        found = true;
                    }
                }

                if (found) {
                    x3dom.debug.logInfo('addEventListener for div.on' + type);
                    that.canvas.addEventListener(type, func, phase);
                } else {
                    x3dom.debug.logInfo('addEventListener for X3D.on' + type);
                    this.__addEventListener(type, func, phase);
                }
            };

            x3dElem.removeEventListener = function(type, func, phase) {
                var j, found = false;
                for (j=0; j<evtArr.length && !found; j++) {
                    if (evtArr[j] === type) {
                        found = true;
                    }
                }

                if (found) {
                    x3dom.debug.logInfo('removeEventListener for div.on' + type);
                    that.canvas.removeEventListener(type, func, phase);
                } else {
                    x3dom.debug.logInfo('removeEventListener for X3D.on' + type);
                    this.__removeEventListener(type, func, phase);
                }
            };
        }

        x3dElem.appendChild(canvas);

        // If the X3D element has an id attribute, append "_canvas"
        // to it and and use that as the id for the canvas
        var id = x3dElem.getAttribute("id");
        if (id !== null) {
            canvas.id = "x3dom-" + id + "-canvas";
        } else {
            // If the X3D element does not have an id... do what?
            // For now check the date for creating a (hopefully) unique id
            var index = new Date().getTime();
            canvas.id = "x3dom-" + index + "-canvas";
        }

        // Apply the width and height of the X3D element to the canvas
        var w, h;

        if ((w = x3dElem.getAttribute("width")) !== null) {
            //Attention: pbuffer dim is _not_ derived from style attribs!
            if (w.indexOf("%") >= 0) {
				x3dom.debug.logWarning("The width attribute is to be specified in pixels not in percent.");
			}
            canvas.style.width = w;
            canvas.setAttribute("width", w);
        }

        if ((h = x3dElem.getAttribute("height")) !== null) {
            //Attention: pbuffer dim is _not_ derived from style attribs!
            if (h.indexOf("%") >= 0) {
				x3dom.debug.logWarning("The height attribute is to be specified in pixels not in percent.");
			}
            canvas.style.height = h;
            canvas.setAttribute("height", h);
        }

        // http://snook.ca/archives/accessibility_and_usability/elements_focusable_with_tabindex
        canvas.setAttribute("tabindex", "0");
       // canvas.focus(); ???why - it is necessary - makes touch events break???
        
        return canvas;
    };

    var _old_dim = [0, 0];
    this.watchForResize = function() {

        var new_dim = [
            parseInt(x3dom.getStyle(that.canvas, "width")),
            parseInt(x3dom.getStyle(that.canvas, "height"))
        ];
        
        if ((_old_dim[0] != new_dim[0]) || (_old_dim[1] != new_dim[1])) {
            _old_dim = new_dim;
            that.x3dElem.setAttribute("width", new_dim[0]+"px");
            that.x3dElem.setAttribute("height", new_dim[1]+"px");
        }
    };

    this.createProgressDiv = function() {
        var progressDiv = document.createElement('div');
        progressDiv.setAttribute("class", "x3dom-progress");

        var _text = document.createElement('strong');
        _text.appendChild(document.createTextNode('Loading...'));
        progressDiv.appendChild(_text);

        var _inner = document.createElement('span');
        _inner.setAttribute('style', "width: 25%;");
        _inner.appendChild(document.createTextNode(' '));  // this needs to be a protected whitespace
        progressDiv.appendChild(_inner);

        progressDiv.oncontextmenu = progressDiv.onmousedown = function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.returnValue = false;
            return false;
        };
        return progressDiv;
    };


	//Need for WebKit Browser
	this.isFlashReady = false;

    this.x3dElem = x3dElem;

    x3dom.caps.MOBILE = (navigator.appVersion.indexOf("Mobile") > -1);
	
	this.backend = this.x3dElem.getAttribute('backend');
	if (this.backend)
	    this.backend = this.backend.toLowerCase();
	else
	    this.backend = 'none';

    if (this.backend == 'flash') {
		this.backend = 'flash';
		this.canvas = this.createFlashObject(x3dElem);
		if (this.canvas != null) {
			this.canvas.parent = this;
			this.gl = this.initFlashContext(this.canvas, this.flash_renderType);
		} else {
			this.createInitFailedDiv(x3dElem);
			return;
		}
	} else {
		this.canvas = this.createHTMLCanvas(x3dElem);
		this.canvas.parent = this;
		this.gl = this.initContext( this.canvas, 
		            (this.backend.search("desktop") >= 0), 
		            (this.backend.search("mobile") >= 0),
                    (this.backend.search("webgl2") >= 0));
		this.backend = 'webgl';
		if (this.gl == null)
		{
			x3dom.debug.logInfo("Fallback to Flash Renderer");
			this.backend = 'flash';
			this.canvas = this.createFlashObject(x3dElem);
			if (this.canvas != null) {
				this.canvas.parent = this;
				this.gl = this.initFlashContext(this.canvas, this.flash_renderType);
			} else {
				this.createInitFailedDiv(x3dElem);
				return;
			}
		}
	}
	
	x3dom.caps.BACKEND = this.backend;

    // for FPS measurements
    this.fps_t0 = new Date().getTime();

    this.lastTimeFPSWasTaken = 0;
    this.framesSinceLastTime = 0;

    this.doc = null;

    // allow listening for (size) changes
    x3dElem.__setAttribute = x3dElem.setAttribute;
    x3dElem.setAttribute = function(attrName, newVal) {
        this.__setAttribute(attrName, newVal);

        switch(attrName) {

            case "width":
                that.canvas.setAttribute("width", newVal);
                if (that.doc._viewarea) {
                    that.doc._viewarea._width = parseInt(that.canvas.getAttribute("width"), 0);
                }
                break;

            case "height":
                that.canvas.setAttribute("height", newVal);
                if (that.doc._viewarea) {
                    that.doc._viewarea._height = parseInt(that.canvas.getAttribute("height"), 0);
                }
                break;

            default:
        }

        that.doc.needRender = true;
    };

    var runtimeEnabled = x3dElem.getAttribute("runtimeEnabled");

    if (runtimeEnabled !== null) {
        this.hasRuntime = (runtimeEnabled.toLowerCase() == "true");
    } else {
        this.hasRuntime = x3dElem.hasRuntime;
    }

    if (this.gl === null) {
        this.hasRuntime = false;
    }

	//States only needed for the webgl backend. flash has his own.
    if (this.backend != "flash") {
        this.showStat = x3dElem.getAttribute("showStat");

        this.stateViewer = new x3dom.States(x3dElem);
        if (this.showStat !== null && this.showStat == "true") {
            this.stateViewer.display(true);
        }

        this.x3dElem.appendChild(this.stateViewer.viewer);
    }

    // progress bar
    this.showProgress = x3dElem.getAttribute("showProgress");
    this.progressDiv = this.createProgressDiv();
    this.progressDiv.style.display = (this.showProgress !== null && this.showProgress == "true") ? "inline" : "none";
    this.x3dElem.appendChild(this.progressDiv);

    // touch visualization
    this.showTouchpoints = x3dElem.getAttribute("showTouchpoints");
    this.showTouchpoints = this.showTouchpoints ? !(this.showTouchpoints.toLowerCase() == "false") : true;
    //this.showTouchpoints = this.showTouchpoints ? (this.showTouchpoints.toLowerCase() == "true") : false;

    // disable touch events
    this.disableTouch = x3dElem.getAttribute("disableTouch");
    this.disableTouch = this.disableTouch ? (this.disableTouch.toLowerCase() == "true") : false;
    
    
    if (this.canvas !== null && this.gl !== null && this.hasRuntime && this.backend !== "flash") {
        // event handler for mouse interaction
        this.canvas.mouse_dragging = false;
        this.canvas.mouse_button = 0;
        this.canvas.mouse_drag_x = 0;
        this.canvas.mouse_drag_y = 0;

        this.canvas.isMulti = false;    // don't interfere with multi-touch

        this.canvas.oncontextmenu = function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.returnValue = false;
            return false;
        };
        
        // TODO: handle context lost events properly
        this.canvas.addEventListener("webglcontextlost", function(event) {
            x3dom.debug.logError("WebGL context lost");
            event.preventDefault();
        }, false);
        
        this.canvas.addEventListener("webglcontextrestored", function(event) {
            x3dom.debug.logError("recover WebGL state and resources on context lost NYI");
            event.preventDefault();
        }, false);
        
        
        // Mouse Events
        this.canvas.addEventListener('mousedown', function (evt) {
			if(!this.isMulti) {
				this.focus();
				
				switch(evt.button) {
					case 0:  this.mouse_button = 1; break;  //left
					case 1:  this.mouse_button = 4; break;  //middle
					case 2:  this.mouse_button = 2; break;  //right
					default: this.mouse_button = 0; break;
				}
				
				if (evt.shiftKey) { this.mouse_button = 1; }
				if (evt.ctrlKey)  { this.mouse_button = 4; }
				if (evt.altKey)   { this.mouse_button = 2; }
				
				var pos = this.parent.mousePosition(evt);
				this.mouse_drag_x = pos.x;
				this.mouse_drag_y = pos.y;
				
				this.mouse_dragging = true;
				
				this.parent.doc.onMousePress(that.gl, this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
				this.parent.doc.needRender = true;
				
				evt.returnValue = true;
			}
        }, false);

        this.canvas.addEventListener('mouseup', function (evt) {
			if(!this.isMulti) {
			    var prev_mouse_button = this.mouse_button;
				this.mouse_button = 0;
				this.mouse_dragging = false;

				this.parent.doc.onMouseRelease(that.gl, this.mouse_drag_x, this.mouse_drag_y, this.mouse_button, prev_mouse_button);
				this.parent.doc.needRender = true;
				
				evt.returnValue = true;
			}
        }, false);

        this.canvas.addEventListener('mouseover', function (evt) {
			if(!this.isMulti) {
				this.mouse_button = 0;
				this.mouse_dragging = false;

				this.parent.doc.onMouseOver(that.gl, this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
				this.parent.doc.needRender = true;
				
				evt.returnValue = true;
			}
        }, false);

        this.canvas.addEventListener('mouseout', function (evt) {
			if(!this.isMulti) {
				this.mouse_button = 0;
				this.mouse_dragging = false;

				this.parent.doc.onMouseOut(that.gl, this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
				this.parent.doc.needRender = true;
				
				evt.returnValue = true;
			}
        }, false);

        this.canvas.addEventListener('dblclick', function (evt) {
			if(!this.isMulti) {
				this.mouse_button = 0;
				
				var pos = this.parent.mousePosition(evt);
				this.mouse_drag_x = pos.x;
				this.mouse_drag_y = pos.y;
				
				this.mouse_dragging = false;

				this.parent.doc.onDoubleClick(that.gl, this.mouse_drag_x, this.mouse_drag_y);
				this.parent.doc.needRender = true;
				
				evt.returnValue = true;
			}
        }, false);

        this.canvas.addEventListener('mousemove', function (evt) {
			if(!this.isMulti) {

				if (evt.shiftKey) { this.mouse_button = 1; }
				if (evt.ctrlKey)  { this.mouse_button = 4; }
				if (evt.altKey)   { this.mouse_button = 2; }
           
				var pos = this.parent.mousePosition(evt);
				this.mouse_drag_x = pos.x;
              	this.mouse_drag_y = pos.y; 
				
				if (this.mouse_dragging) {
					this.parent.doc.onDrag(that.gl, this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
				}
				else {
					this.parent.doc.onMove(that.gl, this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
				}
			    
				this.parent.doc.needRender = true;
				
				// deliberately different for performance reasons
				evt.preventDefault();
				evt.stopPropagation();
				evt.returnValue = false;
			}
        }, false);

        this.canvas.addEventListener('DOMMouseScroll', function (evt) {
			if(!this.isMulti) {
                this.focus();

				this.mouse_drag_y += 2 * evt.detail;

				this.parent.doc.onDrag(that.gl, this.mouse_drag_x, this.mouse_drag_y, 2);
				this.parent.doc.needRender = true;

                evt.preventDefault();
                evt.stopPropagation();
                evt.returnValue = false;
			}
        }, false);

        this.canvas.addEventListener('mousewheel', function (evt) {
			if(!this.isMulti) {
                this.focus();

				this.mouse_drag_y -= 0.1 * evt.wheelDeltaY;

				this.parent.doc.onDrag(that.gl, this.mouse_drag_x, this.mouse_drag_y, 2);
				this.parent.doc.needRender = true;

                evt.preventDefault();
                evt.stopPropagation();
                evt.returnValue = false;
			}
        }, false);


        // Key Events
        this.canvas.addEventListener('keypress', function (evt) {
            var keysEnabled = this.parent.x3dElem.getAttribute("keysEnabled");
            if (!keysEnabled || keysEnabled.toLowerCase() == "true") {
                this.parent.doc.onKeyPress(evt.charCode);
            }
            this.parent.doc.needRender = true;
            evt.returnValue = true;
        }, true);

        // in webkit special keys are only handled on key-up
        this.canvas.addEventListener('keyup', function (evt) {
            var keysEnabled = this.parent.x3dElem.getAttribute("keysEnabled");
            if (!keysEnabled || keysEnabled.toLowerCase() == "true") {
                this.parent.doc.onKeyUp(evt.keyCode);
            }
            this.parent.doc.needRender = true;
            evt.returnValue = true;
        }, true);

        this.canvas.addEventListener('keydown', function (evt) {
            var keysEnabled = this.parent.x3dElem.getAttribute("keysEnabled");
            if (!keysEnabled || keysEnabled.toLowerCase() == "true") {
                this.parent.doc.onKeyDown(evt.keyCode);
            }
            this.parent.doc.needRender = true;
            evt.returnValue = true;
        }, true);


        // Multitouch Events
        var touches =
        {
          numTouches : 0,
          
          firstTouchTime: new Date().getTime(),
          firstTouchPoint: new x3dom.fields.SFVec2f(0,0),
          
          lastDrag : new x3dom.fields.SFVec2f(),
          
          lastMiddle : new x3dom.fields.SFVec2f(),
          lastDistance : new x3dom.fields.SFVec2f(),
          lastSquareDistance : 0,
          lastAngle : 0,
		  lastLayer : [],

          examineNavType: true,
          
          calcAngle : function(vector)
          {
            var rotation = vector.normalize().dot(new x3dom.fields.SFVec2f(1,0));
            rotation = Math.acos(rotation);
            
            if(vector.y < 0)
              rotation = Math.PI + (Math.PI - rotation);
              
            return rotation;
          },

          disableTouch: this.disableTouch,
          // set a marker in HTML so we can track the position of the finger visually
          visMarker: this.showTouchpoints,
          visMarkerBag: [],
          
          visualizeTouches: function(evt)
          {
              if (!this.visMarker)
                  return;

              var touchBag = [];
              var marker = null;
              
              for (var i=0; i<evt.touches.length; i++) {
                  var id = evt.touches[i].identifier || evt.touches[i].streamId;
                  if (!id) id = 0;
                  
                  var index = this.visMarkerBag.indexOf(id);
                  
                  if (index >= 0) {
                      marker = document.getElementById("visMarker" + id);

                      marker.style.left = (evt.touches[i].pageX) + "px";
                      marker.style.top  = (evt.touches[i].pageY) + "px";
                  }
                  else {
                      marker = document.createElement("div");
                      
        			  marker.appendChild(document.createTextNode("#" + id));
        			  marker.id = "visMarker" + id;
        			  marker.className = "x3dom-touch-marker";
        			  document.body.appendChild(marker);
        			  
        			  index = this.visMarkerBag.length;
        			  this.visMarkerBag[index] = id;
                  }
                  
                  touchBag.push(id);
              }
              
              for (var j=this.visMarkerBag.length-1; j>=0; j--) {
                  var oldId = this.visMarkerBag[j];
                  
                  if (touchBag.indexOf(oldId) < 0) {
                      this.visMarkerBag.splice(j, 1);
                      marker = document.getElementById("visMarker" + oldId);
                      document.body.removeChild(marker);
                  }
              }
          }
        };
        
        // Mozilla Touches
        var mozilla_ids = [];
		
        var mozilla_touches = 
        {
          touches : [],
          preventDefault : function() {}
        };
        
        // === Touch Start ===
        var touchStartHandler = function(evt, doc)
        {
            this.isMulti = true;
			evt.preventDefault();
			touches.visualizeTouches(evt);

            this.focus();
			
			if (doc == null)
				doc = this.parent.doc;

            var navi = doc._scene.getNavigationInfo();
            touches.examineNavType = (navi.getType() == "examine");

			touches.lastLayer = [];

            var i, pos;
			for(i = 0; i < evt.touches.length; i++) {
				pos = this.parent.mousePosition(evt.touches[i]);
				touches.lastLayer.push(new Array(evt.touches[i].identifier, new x3dom.fields.SFVec2f(pos.x,pos.y)));
			}
           
			if(touches.numTouches < 1 && evt.touches.length == 1) {
			
				touches.numTouches = 1;
				touches.lastDrag = new x3dom.fields.SFVec2f(evt.touches[0].screenX, evt.touches[0].screenY);
			}
			else if(touches.numTouches < 2 && evt.touches.length >= 2) {
			
				touches.numTouches = 2;
            
				var touch0 = new x3dom.fields.SFVec2f(evt.touches[0].screenX, evt.touches[0].screenY);
				var touch1 = new x3dom.fields.SFVec2f(evt.touches[1].screenX, evt.touches[1].screenY);
            
				var distance = touch1.subtract(touch0);
				var middle = distance.multiply(0.5).add(touch0);
				var squareDistance = distance.dot(distance);
            
				touches.lastDistance = distance;
				touches.lastMiddle = middle;
				touches.lastSquareDistance = squareDistance;
				touches.lastAngle = touches.calcAngle(distance);
			}
			
			// update scene bbox
			doc._scene.updateVolume();

            if (touches.examineNavType) {
                for(i = 0; i < evt.touches.length; i++) {
                    pos = this.parent.mousePosition(evt.touches[i]);
                    doc.onPick(that.gl, pos.x, pos.y);
                    doc._viewarea.prepareEvents(pos.x, pos.y, 1, "onmousedown");
                    doc._viewarea._pickingInfo.lastClickObj = doc._viewarea._pickingInfo.pickObj;
                }
            }
            else if (evt.touches.length) {
                pos = this.parent.mousePosition(evt.touches[0]);
                doc.onMousePress(that.gl, pos.x, pos.y, 1);     // 1 means left mouse button
            }

            doc.needRender = true;
        };
        
        var touchStartHandlerMoz = function(evt)
        {
			this.isMulti = true;
			evt.preventDefault();
          
			var new_id = true;
			for(var i=0; i<mozilla_ids.length; ++i)
				if(mozilla_ids[i] == evt.streamId)
					new_id = false;
              
			if(new_id == true) {		
				evt.identifier = evt.streamId;
				mozilla_ids.push(evt.streamId);
				mozilla_touches.touches.push(evt);
			}
			touchStartHandler(mozilla_touches, this.parent.doc);
        };
        
        // === Touch Move ===
        var touchMoveHandler = function(evt, doc)
        {
			evt.preventDefault();
			touches.visualizeTouches(evt);
			
			if (doc == null)
				doc = this.parent.doc;

            var pos = null;
            var rotMatrix = null;

            if (touches.examineNavType) {
                /*
                if (doc._scene._vf.doPickPass && doc._scene._vf.pickMode.toLowerCase() !== "box") {
                    for(var i = 0; i < evt.touches.length; i++) {
                        pos = this.parent.mousePosition(evt.touches[i]);
                        doc.onPick(that.gl, pos.x, pos.y);

                        doc._viewarea.handleMoveEvt(pos.x, pos.y, 1);
                    }
                }
                */

                // one finger: x/y rotation
                if(evt.touches.length == 1) {
                    var currentDrag = new x3dom.fields.SFVec2f(evt.touches[0].screenX, evt.touches[0].screenY);

                    var deltaDrag = currentDrag.subtract(touches.lastDrag);
                    touches.lastDrag = currentDrag;

                    var mx = x3dom.fields.SFMatrix4f.rotationY(deltaDrag.x / 100);
                    var my = x3dom.fields.SFMatrix4f.rotationX(deltaDrag.y / 100);
                    rotMatrix = mx.mult(my);

                    doc.onMoveView(that.gl, null, rotMatrix);
                }
                // two fingers: scale, translation, rotation around view (z) axis
                else if(evt.touches.length >= 2) {
                    var touch0 = new x3dom.fields.SFVec2f(evt.touches[0].screenX, evt.touches[0].screenY);
                    var touch1 = new x3dom.fields.SFVec2f(evt.touches[1].screenX, evt.touches[1].screenY);

                    var distance = touch1.subtract(touch0);
                    var middle = distance.multiply(0.5).add(touch0);
                    var squareDistance = distance.dot(distance);

                    var deltaMiddle = middle.subtract(touches.lastMiddle);
                    var deltaZoom = squareDistance - touches.lastSquareDistance;

                    var deltaMove = new x3dom.fields.SFVec3f(
                                                 deltaMiddle.x / screen.width,
                                                -deltaMiddle.y / screen.height,
                                                 deltaZoom / (screen.width * screen.height * 0.2));

                    var rotation = touches.calcAngle(distance);
                    var angleDelta = touches.lastAngle - rotation;
                    touches.lastAngle = rotation;

                    rotMatrix = x3dom.fields.SFMatrix4f.rotationZ(angleDelta);

                    touches.lastMiddle = middle;
                    touches.lastDistance = distance;
                    touches.lastSquareDistance = squareDistance;

                    doc.onMoveView(that.gl, deltaMove, rotMatrix);
                }
            }
            else if (evt.touches.length) {
                pos = this.parent.mousePosition(evt.touches[0]);
                doc.onDrag(that.gl, pos.x, pos.y, 1);
            }

            doc.needRender = true;
        };
        
        var touchMoveHandlerMoz = function(evt)
        {
			evt.preventDefault();
          
			for(var i=0; i<mozilla_ids.length; ++i)
				if(mozilla_ids[i] == evt.streamId)
					mozilla_touches.touches[i] = evt;
          
			touchMoveHandler(mozilla_touches, this.parent.doc);
        };
        
        // === Touch end ===
        var touchEndHandler = function(evt, doc)
        {
            this.isMulti = false;
			evt.preventDefault();
			touches.visualizeTouches(evt);
			
			if (doc == null)
				doc = this.parent.doc;

			doc._viewarea._isMoving = false;

			// reinit first finger for rotation
			if (touches.numTouches == 2 && evt.touches.length == 1)
				touches.lastDrag = new x3dom.fields.SFVec2f(evt.touches[0].screenX, evt.touches[0].screenY);
			
			var dblClick = false;
			
			if (evt.touches.length < 2) {
			    if (touches.numTouches == 1)
			        dblClick = true;
			    touches.numTouches = evt.touches.length;
			}

            if (touches.examineNavType) {
                for(var i = 0; i < touches.lastLayer.length; i++) {
                    var pos = touches.lastLayer[i][1];

                    doc.onPick(that.gl, pos.x, pos.y);

                    if (doc._scene._vf.pickMode.toLowerCase() !== "box") {
                        doc._viewarea.prepareEvents(pos.x, pos.y, 1, "onmouseup");
                        doc._viewarea._pickingInfo.lastClickObj = doc._viewarea._pickingInfo.pickObj;

                        // click means that mousedown _and_ mouseup were detected on same element
                        if (doc._viewarea._pickingInfo.pickObj &&
                            doc._viewarea._pickingInfo.pickObj ===
                            doc._viewarea._pickingInfo.lastClickObj) {

                            doc._viewarea.prepareEvents(pos.x, pos.y, 1, "onclick");
                        }
                    }
                    else {
                        var line = doc._viewarea.calcViewRay(pos.x, pos.y);
                        var isect = doc._scene.doIntersect(line);
                        var obj = line.hitObject;

                        if (isect && obj) {
                            doc._viewarea._pick.setValues(line.hitPoint);
                            doc._viewarea.checkEvents(obj, pos.x, pos.y, 1, "onclick");

                            x3dom.debug.logInfo("Hit '" + obj._xmlNode.localName + "/ " +
                                                obj._DEF + "' at pos " + doc._viewarea._pick);
                        }
                    }
                }

                if (dblClick) {
                    var now = new Date().getTime();
                    var dist = touches.firstTouchPoint.subtract(touches.lastDrag).length();

                    if (dist < 18 && now - touches.firstTouchTime < 180)
                        doc.onDoubleClick(that.gl, 0, 0);

                    touches.firstTouchTime = now;
                    touches.firstTouchPoint = touches.lastDrag;
                }
            }
            else if (touches.lastLayer.length) {
                pos = touches.lastLayer[0][1];
                doc.onMouseRelease(that.gl, pos.x, pos.y, 0, 1);
            }
			
			doc.needRender = true;
        };
        
        var touchEndHandlerMoz = function(evt)
        {
			this.isMulti = false;
			evt.preventDefault();
          
			var remove_index = -1;
			for(var i=0; i<mozilla_ids.length; ++i)
				if(mozilla_ids[i] == evt.streamId)
					remove_index = i;
              
			if(remove_index != -1)
			{
				mozilla_ids.splice(remove_index, 1);
				mozilla_touches.touches.splice(remove_index, 1);
			}
          
			touchEndHandler(mozilla_touches, this.parent.doc);
        };

        if (!this.disableTouch)
        {
            // mozilla touch events
            this.canvas.addEventListener('MozTouchDown',  touchStartHandlerMoz, true);
            this.canvas.addEventListener('MozTouchMove',  touchMoveHandlerMoz,  true);
            this.canvas.addEventListener('MozTouchUp',    touchEndHandlerMoz,   true);

            // w3c / apple touch events (in Chrome via chrome://flags)
            this.canvas.addEventListener('touchstart',    touchStartHandler, true);
            this.canvas.addEventListener('touchmove',     touchMoveHandler,  true);
            this.canvas.addEventListener('touchend',      touchEndHandler,   true);
        }
    }
    
    /** Helper that converts a point from node coordinates to page coordinates 
        FIXME: does NOT work when x3dom.css is not included so that x3d element is not floating
    */
    this.mousePosition = function(evt)
    {
        var convertPoint = window.webkitConvertPointFromNodeToPage;
        var x = 0, y = 0;

        if ( "getBoundingClientRect" in document.documentElement ) {
            var elem = evt.target.offsetParent;    // should be x3dElem
    		var box = elem.getBoundingClientRect();
    		
    		var scrollLeft =  window.pageXOffset || document.body.scrollLeft;
    		var scrollTop =  window.pageYOffset || document.body.scrollTop;
            
            var compStyle = document.defaultView.getComputedStyle(elem, null);
            
    		var paddingLeft = parseFloat(compStyle.getPropertyValue('padding-left'));
    		var borderLeftWidth = parseFloat(compStyle.getPropertyValue('border-left-width'));
            
    		var paddingTop = parseFloat(compStyle.getPropertyValue('padding-top'));
    		var borderTopWidth = parseFloat(compStyle.getPropertyValue('border-top-width'));
    		
    		x = Math.round(evt.pageX - (box.left + paddingLeft + borderLeftWidth + scrollLeft));
    		y = Math.round(evt.pageY - (box.top + paddingTop + borderTopWidth + scrollTop));
        }
        else if (convertPoint) {
            var point = convertPoint(evt.target, new WebKitPoint(0, 0));

            x = Math.round(point.x);
            y = Math.round(point.y);
        }
        else {
    		x3dom.debug.logError('NO getBoundingClientRect, NO webkitConvertPointFromNodeToPage');
    	}
    	
    	return new x3dom.fields.SFVec2f(x, y);
    };
};

x3dom.X3DCanvas.prototype.tick = function()
{
    try {
        var runtime = this.x3dElem.runtime;

        var d = new Date().getTime();
        var diff = d - this.lastTimeFPSWasTaken;

        var fps = 1000.0 / (d - this.fps_t0);
        this.fps_t0 = d;

        // update routes and stuff
        this.doc.advanceTime(d / 1000.0);
        var animD = new Date().getTime() - d;

        if (this.doc.needRender) {
            // calc average frames per second
            if (diff >= 1000) {
                runtime.fps = this.framesSinceLastTime / (diff / 1000.0);
                runtime.addMeasurement('FPS', runtime.fps);

                this.framesSinceLastTime = 0;
                this.lastTimeFPSWasTaken = d;
            }
            this.framesSinceLastTime++;

            runtime.addMeasurement('ANIM', animD);

            if (runtime.isReady == false) {
                runtime.ready();
                runtime.isReady = true;
            }

            runtime.enterFrame();

            if (this.backend == 'flash') {
                if (this.isFlashReady) {
                    this.canvas.setFPS({fps: fps});

                    this.doc.needRender = false;
                    this.doc.render(this.gl);
                }
            }
            else {
                // picking might require another pass
                this.doc.needRender = false;
                this.doc.render(this.gl);

                if (!this.doc._scene._vf.doPickPass)
                    runtime.removeMeasurement('PICKING');
            }

            runtime.exitFrame();
        }

        if (this.progressDiv) {
            if (this.doc.downloadCount > 0) {
                runtime.addInfo("#LOADS:", this.doc.downloadCount);
            } else {
                runtime.removeInfo("#LOADS:");
            }

            if (this.doc.properties.getProperty("showProgress") !== 'false') {
                if (this.progressDiv) {
                    this.progressDiv.childNodes[0].textContent = 'Loading: ' + (+this.doc.downloadCount);
                    if (this.doc.downloadCount > 0) {
                        this.progressDiv.style.display = 'inline';
                    } else {
                        this.progressDiv.style.display = 'none';
                    }

                    /*
                    var myThat = this;
                    window.setTimeout( function() {
                        myThat.doc.downloadCount = 0;
                        myThat.progressDiv.style.display = 'none';
                    }, 10000 );
                    */
                }
            } else {
                this.progressDiv.style.display = 'none';
            }
        }
    } catch (e) {
        x3dom.debug.logException(e);
        throw e;
    }
};

/** Loads the given @p uri.
    @param uri can be a uri or an X3D node
    @param sceneElemPos
    @param settings properties
    */
x3dom.X3DCanvas.prototype.load = function(uri, sceneElemPos, settings) {
    this.doc = new x3dom.X3DDocument(this.canvas, this.gl, settings);
    var x3dCanvas = this;

    this.doc.onload = function () {
        //x3dom.debug.logInfo("loaded '" + uri + "'");
		
        if (x3dCanvas.hasRuntime) {

			// requestAnimationFrame https://cvs.khronos.org/svn/repos/registry/trunk/public/webgl/sdk/demos/common/webgl-utils.js
			(function mainloop(){
                x3dCanvas.watchForResize();
        		x3dCanvas.tick();
			    window.requestAnimFrame(mainloop, x3dCanvas);
		    })();

        } else {
            x3dCanvas.tick();
        }
    };

    this.x3dElem.render = function() {
        if (x3dCanvas.hasRuntime) {
            x3dCanvas.doc.needRender = true;
        } else {
            x3dCanvas.doc.render(x3dCanvas.gl);
        }
    };

    this.x3dElem.context = x3dCanvas.gl.ctx3d;

    this.doc.onerror = function () {
        alert('Failed to load X3D document');
    };

    this.doc.load(uri, sceneElemPos);
};
