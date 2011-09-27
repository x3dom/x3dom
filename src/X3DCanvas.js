/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
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
    this.initContext = function(canvas) {
        x3dom.debug.logInfo("Initializing X3DCanvas for [" + canvas.id + "]");
        var gl = x3dom.gfx_webgl(canvas);
        if (!gl) {
            x3dom.debug.logError("No 3D context found...");
            this.x3dElem.removeChild(canvas);
            return null;
        }
        return gl;
    };

	this.initFlashContext = function(object) {
        x3dom.debug.logInfo("Initializing X3DObject for [" + object.id + "]");
        var gl = x3dom.gfx_flash(object);
        return gl;
    };

	this.appendParam = function(node, name, value) {
		var param = document.createElement('param');
		param.setAttribute('name', name);
		param.setAttribute('value', value);
		node.appendChild( param );
	};
	
	this.detectFlash = function(required, max)
	{
		var required_version = required;
		var max_version = max;
		var available_version = 0;

		/* dieser Abschnitt ist f�r NS, Mozilla, Firefox und �hnliche Browser */
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
		div.style.width = x3dElem.getAttribute("width");;
		div.style.height = x3dElem.getAttribute("height");;
		div.style.backgroundColor = "#C00";
		div.style.color = "#FFF";
		div.style.fontSize = "20px";
		div.style.fontWidth = "bold";
		div.style.padding = "10px 10px 10px 10px";
		div.style.display = "inline-block";
		div.style.fontFamily = "Arial";
		div.style.textAlign = "center";
		
		div.appendChild(document.createTextNode('Your Browser doesn\'t support X3DOM'));
		div.appendChild(document.createElement('br'));
		div.appendChild(document.createTextNode('Read more about X3DOM Browser support on:'));
		div.appendChild(document.createElement('br'));
		
		var link = document.createElement('a');
		link.setAttribute('href', 'http://www.x3dom.org/?page_id=9');
		link.appendChild( document.createTextNode('X3DOM | Browser Support'));
		div.appendChild(link);
		x3dElem.appendChild(div);
		
		x3dom.debug.logError("Your Browser doesn't support X3DOM!");
	}

	this.createFlashObject = function(x3dElem) {
	
		var result = this.detectFlash(11, 11);
		
		if( !result[0] || result[0] < result[1]) {
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

			//Get width from x3d-Element or set default
			var width = x3dElem.getAttribute("width");
			if( width == null ) {
				width = 550;
			}else{
				var idx = width.indexOf("px");
				if( idx != -1 ) {
					width = width.substr(0, idx);
				}
			}
			//Get height from x3d-Element or set default
			var height = x3dElem.getAttribute("height");
			if( height == null ) {
				height = 400;
			}else{
				var idx = height.indexOf("px");
				if( idx != -1 ) {
					height = height.substr(0, idx);
				}
			}

			var obj = document.createElement('object');
			obj.setAttribute('width', width);
			obj.setAttribute('height', height);
			obj.setAttribute('id', id);

			this.appendParam(obj, 'menu', 'false');
			this.appendParam(obj, 'quality', 'high');
			this.appendParam(obj, 'wmode', 'gpu');
			this.appendParam(obj, 'allowScriptAccess', 'always');
			this.appendParam(obj, 'flashvars', 'width=' + width + '&height=' + height + '&canvasIdx=' + this.canvasIdx);
			this.appendParam(obj, 'movie', swf_path);

			x3dElem.appendChild(obj);

			if(navigator.appName == "Microsoft Internet Explorer")
				obj.setAttribute('classid', 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000');
			else {
				obj.setAttribute('type', 'application/x-shockwave-flash');
				obj.setAttribute('data', swf_path);
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

            // touch
            "ontouchstart",
            "ontouchmove",
            "ontouchend",
            "ontouchcancel",
            "ongesturestart",
            "ongesturechange",
            "ongestureend",

            // mozilla touch
            "MozTouchDown",
            "MozTouchMove",
            "MozTouchUp"

        ];

        // TODO; handle attribute event handlers dynamically during runtime
        for (var i=0; i < evtArr.length; i++)
        {
//            var evtName = "on" + evtArr[i];
            var evtName = evtArr[i];
            var userEvt = x3dElem.getAttribute(evtName);
            if (userEvt) {
                x3dom.debug.logInfo(evtName +", "+ userEvt);
                canvas.setAttribute(evtName, userEvt);
            }
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
        var w = 2;
        var h = 2;

        if ((w = x3dElem.getAttribute("width")) !== null) {
            //Attention: pbuffer dim is _not_ derived from style attribs!
            canvas.style.width = w;
            canvas.setAttribute("width", w);
        }

        if ((h = x3dElem.getAttribute("height")) !== null) {
            //Attention: pbuffer dim is _not_ derived from style attribs!
            canvas.style.height = h;
            canvas.setAttribute("height", h);
        }

        // http://snook.ca/archives/accessibility_and_usability/elements_focusable_with_tabindex
        canvas.setAttribute("tabindex", "0");
        return canvas;
    };

    var _old_dim = [0,0];
    this.watchForResize = function() {

        var new_dim = [
            x3dom.getStyle(that.canvas, "width"),
            x3dom.getStyle(that.canvas, "height")
        ];

        if ((_old_dim[0] != new_dim[0]) || (_old_dim[1] != new_dim[1])) {
            //x3dom.debug.logInfo("Resize detected w/h: " +
            //    _old_dim[0] + "/" + _old_dim[1] + " => " + new_dim[0] + "/" + new_dim[1]);
            _old_dim = new_dim;
            that.x3dElem.setAttribute("width", new_dim[0]);
            that.x3dElem.setAttribute("height", new_dim[1]);
        }
    };

    this.createStatDiv = function() {
        var statDiv = document.createElement('div');
        statDiv.setAttribute("class", "x3dom-statdiv");
        statDiv.innerHTML = "0 fps";
        this.x3dElem.appendChild(statDiv);

        statDiv.oncontextmenu = statDiv.onmousedown = function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.returnValue = false;
            return false;
        };
        return statDiv;
    };

    this.createProgressDiv = function() {
        var progressDiv = document.createElement('div');
        progressDiv.setAttribute("class", "x3dom-progress");

        var _text = document.createElement('strong');
        _text.appendChild(document.createTextNode('Loading...'));
        progressDiv.appendChild(_text);

        var _inner = document.createElement('span');
        _inner.setAttribute('style', "width: 25%;");
        _inner.appendChild(document.createTextNode(" "));  // this needs to be a protected whitespace
        progressDiv.appendChild(_inner);

        this.x3dElem.appendChild(progressDiv);

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

    if(this.x3dElem.getAttribute('backend') == 'flash') {
		this.backend = 'flash';
		this.canvas = this.createFlashObject(x3dElem);
		if(this.canvas != null) {
			this.canvas.parent = this;
			this.gl = this.initFlashContext(this.canvas);
		} else {
			this.createInitFailedDiv(x3dElem);
			return null;
		}
	}else{
		this.backend = 'webgl';
		this.canvas = this.createHTMLCanvas(x3dElem);
		this.canvas.parent = this;
		this.gl = this.initContext(this.canvas);
		if(this.gl == null)
		{
			x3dom.debug.logInfo("Fallback to Flash Renderer");
			this.backend = 'flash';
			this.canvas = this.createFlashObject(x3dElem);
			if(this.canvas != null) {
				this.canvas.parent = this;
				this.gl = this.initFlashContext(this.canvas);
			} else {
				this.createInitFailedDiv(x3dElem);
				return null;
			}
		}
	}

	this.fps_t0 = new Date().getTime();
    this.doc = null;

    // allow listening for (size) changes
    x3dElem.__setAttribute = x3dElem.setAttribute;
    x3dElem.setAttribute = function(attrName, newVal) {
        //var prevVal = this.getAttribute(attrName);
        this.__setAttribute(attrName, newVal);

        switch(attrName) {

            case "width":
                that.canvas.setAttribute("width", newVal);
                if (that.doc._viewarea) {
                    that.doc._viewarea._width = parseInt(that.canvas.getAttribute("width"), 0);
                    //x3dom.debug.logInfo("width: " + that.doc._viewarea._width);
                }
                break;

            case "height":
                that.canvas.setAttribute("height", newVal);
                if (that.doc._viewarea) {
                    that.doc._viewarea._height = parseInt(that.canvas.getAttribute("height"), 0);
                    //x3dom.debug.logInfo("height: " + that.doc._viewarea._height);
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

    this.showStat = x3dElem.getAttribute("showStat");
    this.statDiv = this.createStatDiv();
    this.statDiv.style.display = (this.showStat !== null && this.showStat == "true") ? "inline" : "none";

    this.showProgress = x3dElem.getAttribute("showProgress");
    this.progressDiv = this.createProgressDiv();
    this.progressDiv.style.display = 'inline';


    if (this.canvas !== null && this.gl !== null && this.hasRuntime && this.backend !== "flash") {
        // event handler for mouse interaction
        this.canvas.mouse_dragging = false;
        this.canvas.mouse_button = 0;
        this.canvas.mouse_drag_x = 0;
        this.canvas.mouse_drag_y = 0;

		this.canvas.fingers = [];
		this.canvas.wasMulti = false;
		this.canvas.isMulti = false;

		// this should go into a gestures collection
		this.canvas.pinch_distance = 0;

        this.canvas.oncontextmenu = function(evt) {
            evt.preventDefault();
            evt.stopPropagation();
            evt.returnValue = false;
            return false;
        };

        this.canvas.addEventListener('mousedown', function (evt) {
            this.focus();

            switch(evt.button) {
                case 0:  this.mouse_button = 1; break;  //left
                case 1:  this.mouse_button = 4; break;  //middle
                case 2:  this.mouse_button = 2; break;  //right
                default: this.mouse_button = 0; break;
            }

            this.mouse_drag_x = (evt.layerX || evt.x);
            this.mouse_drag_y = (evt.layerY || evt.y);
            this.mouse_dragging = true;

            if (evt.shiftKey) { this.mouse_button = 1; }
            if (evt.ctrlKey)  { this.mouse_button = 4; }
            if (evt.altKey)   { this.mouse_button = 2; }

            this.parent.doc.onMousePress(that.gl, this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
            this.parent.doc.needRender = true;

            window.status=this.id+' DOWN: '+(evt.layerX || evt.x)+", "+(evt.layerY || evt.y);
            //window.status=this.id+' DOWN: '+evt.screenX+", "+evt.screenY;
            //evt.preventDefault();
            //evt.stopPropagation();
            //evt.returnValue = false;
            evt.returnValue = true;
        }, false);

        this.canvas.addEventListener('mouseup', function (evt) {
            this.mouse_button = 0;
            this.mouse_dragging = false;

            this.parent.doc.onMouseRelease(that.gl, this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
            this.parent.doc.needRender = true;

            //window.status=this.id+' UP: '+evt.screenX+", "+evt.screenY;
            //evt.preventDefault();
            //evt.stopPropagation();
            //evt.returnValue = false;
            evt.returnValue = true;
        }, false);

        this.canvas.addEventListener('mouseover', function (evt) {
            this.mouse_button = 0;
            this.mouse_dragging = false;

            this.parent.doc.onMouseOver(that.gl, this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
            this.parent.doc.needRender = true;

            //window.status=this.id+' IN: '+evt.screenX+", "+evt.screenY;
            //evt.preventDefault();
            //evt.stopPropagation();
            //evt.returnValue = false;
            evt.returnValue = true;
        }, false);

        this.canvas.addEventListener('mouseout', function (evt) {
            this.mouse_button = 0;
            this.mouse_dragging = false;

            this.parent.doc.onMouseOut(that.gl, this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
            this.parent.doc.needRender = true;

            //window.status=this.id+' OUT: '+evt.screenX+", "+evt.screenY;
            //evt.preventDefault();
            //evt.stopPropagation();
            //evt.returnValue = false;
            evt.returnValue = true;
        }, false);

        this.canvas.addEventListener('dblclick', function (evt) {
            this.mouse_button = 0;
            this.mouse_drag_x = (evt.layerX || evt.x);
            this.mouse_drag_y = (evt.layerY || evt.y);
            this.mouse_dragging = false;

            this.parent.doc.onDoubleClick(that.gl, this.mouse_drag_x, this.mouse_drag_y);
            this.parent.doc.needRender = true;

            window.status=this.id+' DBL: '+(evt.layerX || evt.x)+", "+(evt.layerY || evt.y);
            //evt.preventDefault();
            //evt.stopPropagation();
            //evt.returnValue = false;
            evt.returnValue = true;
        }, false);

        this.canvas.addEventListener('mousemove', function (evt) {

            window.status=this.id+' MOVE: '+(evt.layerX || evt.x)+", "+(evt.layerY || evt.y);

            /*
            if (!this.mouse_dragging) {
                return;
            }
            */



            if (evt.shiftKey) { this.mouse_button = 1; }
            if (evt.ctrlKey)  { this.mouse_button = 4; }
            if (evt.altKey)   { this.mouse_button = 2; }

			if (!this.isMulti)
			{
                this.mouse_drag_x = (evt.layerX || evt.x);
                this.mouse_drag_y = (evt.layerY || evt.y);

				if (this.mouse_dragging) {
					this.parent.doc.onDrag(that.gl, this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
				}
				else {
					this.parent.doc.onMove(that.gl, this.mouse_drag_x, this.mouse_drag_y, this.mouse_button);
				}
			}

            this.parent.doc.needRender = true;

            //window.status=this.id+' MOVE: '+dx+", "+dy;
            //evt.preventDefault();
            //evt.stopPropagation();
            //evt.returnValue = false;
            evt.returnValue = true;
        }, false);

        this.canvas.addEventListener('DOMMouseScroll', function (evt) {
            this.mouse_drag_y += 2 * evt.detail;

            this.parent.doc.onDrag(that.gl, this.mouse_drag_x, this.mouse_drag_y, 2);
            this.parent.doc.needRender = true;

            window.status=this.id+' SCROLL: '+evt.detail;
            //evt.preventDefault();
            //evt.stopPropagation();
            //evt.returnValue = false;
            evt.returnValue = true;
        }, false);

        this.canvas.addEventListener('mousewheel', function (evt) {
            this.mouse_drag_y -= 0.1 * evt.wheelDeltaY;

            this.parent.doc.onDrag(that.gl, this.mouse_drag_x, this.mouse_drag_y, 2);
            this.parent.doc.needRender = true;

            window.status=this.id+' SCROLL: '+evt.detail;
            //evt.preventDefault();
            //evt.stopPropagation();
            //evt.returnValue = false;
            evt.returnValue = true;
        }, false);

        this.canvas.addEventListener('keypress', function (evt) {
            var keysEnabled = this.parent.x3dElem.getAttribute("keysEnabled");
            if (!keysEnabled || keysEnabled.toLowerCase() === "true") {
                this.parent.doc.onKeyPress(evt.charCode);
            }
            this.parent.doc.needRender = true;
            evt.returnValue = true;
        }, true);

        // in webkit special keys are only handled on key-up
        this.canvas.addEventListener('keyup', function (evt) {
            var keysEnabled = this.parent.x3dElem.getAttribute("keysEnabled");
            if (!keysEnabled || keysEnabled.toLowerCase() === "true") {
                this.parent.doc.onKeyUp(evt.keyCode);
            }
            this.parent.doc.needRender = true;
            evt.returnValue = true;
        }, true);


        // http://developer.apple.com/library/safari/#documentation/AppleApplications/Reference/SafariWebContent/HandlingEvents/HandlingEvents.html
        // http://backtothecode.blogspot.com/2009/10/javascript-touch-and-gesture-events.html
        // http://www.sitepen.com/blog/2008/07/10/touching-and-gesturing-on-the-iphone/

		var debugMarker = true;
		//var debugMarker = false;

		var touchStartHandler = function(evt)
		{
			x3dom.debug.logInfo("[TOUCH START] New finger ID: " + evt.streamId + " detected");

			if (debugMarker) {
				// set a mark in HTML so we can track the position of the finger visually
				var marker = document.createElement("div");
				marker.appendChild(document.createTextNode("Finger: " + evt.streamId));
				marker.id = evt.streamId;
				marker.className = "x3dom-touch-marker";
				document.body.appendChild(marker);
			}

			// touch object containing info about the detected touch
			var touch = {
				identifier: evt.streamId,
				x: (evt.layerX || evt.x),
				y: (evt.layerY || evt.y),
				dx: 0,
				dy: 0,
				initialx: (evt.layerX || evt.x),
				initialy: (evt.layerY || evt.y)
			};

			this.fingers.push(touch);

			if (this.fingers.length > 1) {
				this.wasMulti = this.isMulti;
				this.isMulti = true;
			}

			x3dom.debug.logInfo("[TOUCH START] Number of fingers active:" + this.fingers.length);

			evt.preventDefault();
        };

        var touchMoveHandler = function(evt)
		{
			for (var i=0; i < this.fingers.length; i++) {

				// tracking the coordinates of the fingers
				if (this.fingers[i].identifier === evt.streamId) {

					this.fingers[i].dx = this.fingers[i].x - (evt.layerX || evt.x);
					this.fingers[i].dy = this.fingers[i].y - (evt.layerY || evt.y);

					this.fingers[i].x = (evt.layerX || evt.x);
					this.fingers[i].y = (evt.layerY || evt.y);

					if (debugMarker) {
						var marker = document.getElementById(evt.streamId);
						marker.style.left = (evt.pageX+10)+"px";
						marker.style.top = (evt.pageY+10)+"px";
					}
				}
			}

			// if two fingers are ready, hard core pinching action
			if (this.fingers.length > 1)
			{
				// calc hypothenuse, distance between two fingers
				var x1 = this.fingers[0].x;
				var y1 = this.fingers[0].y;
	  			var x2 = this.fingers[1].x;
				var y2 = this.fingers[1].y;
				var c = Math.sqrt( Math.pow((x1-x2),2) + Math.pow((y1-y2),2) );
				//x3dom.debug.logInfo("[TOUCH] Distance of fingers: " + c);

				// changes in distance since last triggering of event
				var cdelta = Math.abs(this.pinch_distance - c);
				//x3dom.debug.logInfo("[TOUCH] Distance of fingers: " + c + " delta: " + cdelta);

				if (this.pinch_distance > 0) {
					if (this.pinch_distance > c) {
						this.mouse_drag_y -= 4.0 * cdelta;
					}
					else {
						this.mouse_drag_y += 4.0 * cdelta;
					}
				}
				this.pinch_distance = c; // save distance for next run

				this.parent.doc.onDrag(that.gl, this.mouse_drag_x, this.mouse_drag_y, 2);
				this.parent.doc.needRender = true;
			}

            window.status=this.id+' PINCH: '+evt.detail;
            evt.preventDefault();
            evt.returnValue = true;
        };

		var touchEndHandler = function(evt)
		{
            // mozilla
			var found = false;
            if (evt.streamId) {
                x3dom.debug.logInfo("[TOUCH STOP] Finger ID: " + evt.streamId + " lifted");

				for (var i=0; i < this.fingers.length; i++) {
					if (this.fingers[i].identifier == evt.streamId) {

						x3dom.debug.logInfo("[TOUCH STOP] Removed tracking for finger ID: " +
											this.fingers[i].identifier);
						this.fingers.splice(i,1);

						if (debugMarker) {
							document.body.removeChild(document.getElementById(evt.streamId));
						}
						found = true;
					}
				}
            }
			if (!found && this.fingers.length) {
				this.fingers = [];
			}
			if (this.fingers.length === 0) {
				x3dom.debug.logInfo("[TOUCH STOP] no fingers present");
				this.pinch_distance = 0;

				this.wasMulti = this.isMulti;
				this.isMulti = false;
			}

			// this.parent.doc.needRender = true;
		   	evt.preventDefault();
        };

        var touchCancelHandler = function(evt) {
            x3dom.debug.logInfo("[TOUCH] cancel");
        };

        var gestureStartHandler = function(evt) {
            x3dom.debug.logInfo("[GESTURE] start");
            this.parent.doc.needRender = true;
        };

        var gestureChangeHandler = function(evt) {
            evt.preventDefault();
            x3dom.debug.logInfo("[GESTURE] change Scale: " + evt.scale + ", Rotation: " + evt.rotation);
            this.parent.doc.needRender = true;
        };

        var gestureEndHandler = function(evt) {
            x3dom.debug.logInfo("[GESTURE] end detected");
            this.parent.doc.needRender = true;
        };

        this.canvas.addEventListener('touchstart', touchStartHandler, true);
        this.canvas.addEventListener('touchmove', touchMoveHandler, true);
        this.canvas.addEventListener('touchend', touchEndHandler, true);
        this.canvas.addEventListener('touchcancel', touchCancelHandler, true);

        // mozilla flavour of event naming
        this.canvas.addEventListener('MozTouchDown', touchStartHandler, true);
        this.canvas.addEventListener('MozTouchMove', touchMoveHandler, true);
        this.canvas.addEventListener('MozTouchUp', touchEndHandler, true);

        // gesture events, for now only supported by apple
        this.canvas.addEventListener('gesturestart', gestureStartHandler, true);
        this.canvas.addEventListener('gesturechange', gestureChangeHandler, true);
        this.canvas.addEventListener('gestureend', gestureEndHandler, true);


    }
};

x3dom.X3DCanvas.prototype.tick = function()
{
    var d = new Date().getTime();
    var fps = 1000.0 / (d - this.fps_t0);

    this.fps_t0 = d;

    try {
        this.doc.advanceTime(d / 1000);
        var animD = new Date().getTime() - d;

        if (this.doc.needRender) {

            if (this.x3dElem.runtime.isReady == true) {
                this.x3dElem.runtime.enterFrame(this.x3dElem);
            } else {
                this.x3dElem.runtime.ready();
                this.x3dElem.runtime.isReady = true;
                this.x3dElem.runtime.enterFrame(this.x3dElem);
            }

            if (this.statDiv) {
                this.statDiv.textContent = fps.toFixed(2) + ' fps';
                this.statDiv.appendChild(document.createElement("br"));
                this.statDiv.appendChild(document.createTextNode("anim: " + animD));
            }

            if (this.backend == 'flash') {
				if (this.isFlashReady) {
					this.canvas.setFPS({fps: fps});
					this.doc.needRender = false;    // picking might require another pass
					this.doc.render(this.gl);
				}
			} else{
				this.doc.needRender = false;    // picking might require another pass
				this.doc.render(this.gl);
			}

		}

        if (this.statDiv || this.progressDiv) {
            if (this.statDiv && this.doc.downloadCount) {
                if (this.doc.needRender)
                {
                    this.statDiv.appendChild(document.createElement("br"));
                    this.statDiv.appendChild(document.createTextNode("#Loading: " + this.doc.downloadCount));
                }
                else {
                    this.statDiv.textContent = "#Loading: " + this.doc.downloadCount;
                }
            }

            if (this.progressDiv) {
                // TODO: In order to display a bar we need a max value to determine where we are
                // 100 / total * this.doc.downloadCount
                // this.progressDiv.childNodes[1].setAttribute("style", "width: " + progressPercent + "%");
                this.progressDiv.childNodes[0].textContent = 'Loading: ' + this.doc.downloadCount;
                if (this.doc.downloadCount > 0) {
                    this.progressDiv.style.display = 'inline';
                } else {
                    this.progressDiv.style.display = 'none';
                }

                // TODO: fix these strange window-bound scope issues!
                window.myThat = this;
                window.myStopProgress = function stopProgress() {
                    window.myThat.doc.downloadCount = 0;
                    window.myThat.progressDiv.style.display = 'none';
                };
                window.setTimeout("window.myStopProgress()", 1500);
            }
        }

    } catch (e) {
        x3dom.debug.logException(e);
        throw e;
    }
};

/** Loads the given @p uri.
    @param uri can be a uri or an X3D node
    */
x3dom.X3DCanvas.prototype.load = function(uri, sceneElemPos, settings) {
    this.doc = new x3dom.X3DDocument(this.canvas, this.gl, settings);
    var x3dCanvas = this;

    this.doc.onload = function () {
        x3dom.debug.logInfo("loaded '" + uri + "'");
		
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
