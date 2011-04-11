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
		param.setAttribute(name, value);
		node.appendChild( param );
	};
	
	this.createFlashObject = function(x3dElem) {
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
		
		//Add Alternative Content
		var link = document.createElement('a');
		link.setAttribute('id', id);
		link.setAttribute('href', 'http://www.adobe.com/go/getflash');
		
		var img = document.createElement('img');
		img.setAttribute('src', 'http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif');
		img.setAttribute('alt', 'Get Adobe Flash Player');
		
		link.appendChild(img);
		x3dElem.appendChild(link);
		
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
		var height = x3dElem.getAttribute("height")
		if( height == null ) {
			height = 400;
		}else{
			var idx = height.indexOf("px");
			if( idx != -1 ) {
				height = height.substr(0, idx);
			}
		}
		
		var flashvars = { 
			width: width, 
			height: height,
			canvasIdx: this.canvasIdx
		};
		
		var params = { 
			menu: "false", 
			quality: "high", 
			wmode: "direct", 
			allowScriptAccess: "always" 
		};
		
		swfobject.embedSWF(swf_path, id, width, height, "11.0.0", "", flashvars, params);
		
		return document.getElementById(id);
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
	
	//Need for WebKit Browser
	this.isFlashReady = false;

    this.x3dElem = x3dElem;
	
    if(this.x3dElem.getAttribute('backend') == 'flash') {
		this.backend = 'flash';
		this.canvas = this.createFlashObject(x3dElem);
		this.canvas.parent = this;
		this.gl = this.initFlashContext(this.canvas);
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
			this.canvas.parent = this;
			this.gl = this.initFlashContext(this.canvas);
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
            if (this.statDiv) {
                this.statDiv.textContent = fps.toFixed(2) + ' fps';
                this.statDiv.appendChild(document.createElement("br"));
                this.statDiv.appendChild(document.createTextNode("anim: " + animD));
            }
            
            if(this.backend == 'flash') {
				if(this.isFlashReady) {
					this.doc.needRender = false;    // picking might require another pass
					this.doc.render(this.gl);
				}
			}else{
				this.doc.needRender = false;    // picking might require another pass
				this.doc.render(this.gl);
			}
			
			} else {
            if (this.statDiv) {
                if (this.doc.lastDownloadCount !== this.doc.downloadCount) {
                    this.statDiv.textContent = 'dlc: ' + this.doc.downloadCount;
                }
                this.doc.lastDownloadCount = this.doc.downloadCount;
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
x3dom.X3DCanvas.prototype.load = function(uri, sceneElemPos) {
    this.doc = new x3dom.X3DDocument(this.canvas, this.gl);
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
			
//            setInterval( function() {
//                    x3dCanvas.watchForResize();
//                   x3dCanvas.tick();
//                }, 
//             16  // use typical monitor frequency as bound
//           );
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

x3dom.detectActiveX = function() {
    var isInstalled = false;  
    
    if (window.ActiveXObject)  {  
        var control = null;  

        try  {  
            control = new ActiveXObject('AVALONATX.InstantPluginATXCtrl.1');  
        } catch (e) {
        }  
        
        if (control) {
            isInstalled = true;  
        }
    }
    
    return isInstalled;
};

x3dom.rerouteSetAttribute = function(node) {
    // save old setAttribute method
    node._setAttribute = node.setAttribute;
    node.setAttribute = function(name, value) {
        return node._x3domNode.parseField(name, value);
    };

    for(var i=0; i < node.childNodes.length; i++) {
        var child = node.childNodes[i];
        x3dom.rerouteSetAttribute(child);
    }
};

x3dom.insertActiveX = function(x3d) {
    
    if (typeof x3dom.atxCtrlCounter == 'undefined') {
        x3dom.atxCtrlCounter = 0;
    }
 
    var height = x3d.getAttribute("height");
    var width  = x3d.getAttribute("width");

    var parent = x3d.parentNode;
    
    var divelem = document.createElement("div");
    divelem.setAttribute("id", "x3dplaceholder");

    var inserted = parent.insertBefore(divelem, x3d);
     
    var atx = document.createElement("object");
    
    var containerName = "Avalon" + x3dom.atxCtrlCounter;
    x3dom.atxCtrlCounter++;
    
    atx.setAttribute("id", containerName);
    atx.setAttribute("classid", "CLSID:F3254BA0-99FF-4D14-BD81-EDA9873A471E");
    atx.setAttribute("width",   width   ? width     : "500");
    atx.setAttribute("height",  height  ? height    : "500");
    
    inserted.appendChild(atx);
    
    var atxctrl = document.getElementById(containerName);
    var browser = atxctrl.getBrowser();
    var scene   = browser.importDocument(x3d);
    browser.replaceWorld(scene);
        
    // add backtrack method to get browser from x3d node instead of the ctrl
    x3d.getBrowser = function() {
        return atxctrl.getBrowser();
    };
    
    x3dom.rerouteSetAttribute(x3d);
};

// holds the UserAgent feature
x3dom.userAgentFeature = {
    supportsDOMAttrModified: false
};


// TODO: move to seperate file: runtime.js

/**
 * Class: x3dom._runtime
 *
 * Runtime proxy object to get and set runtime parameters. This object 
 * is attached to each X3D element and can be used in the following manner:
 *
 * > var e = doucment.getElementById('the_x3delement');
 * > e.runtime.showAll();
 * > e.runtime.resetView();
 * > ...
 */
x3dom._runtime = {
	
	
	/**
	 * Function: initialize
	 *
	 * Constructor routine to init runtime object.
	 * 
	 * Parameters:
	 * 		doc - The X3D document
	 *      canvas - The X3D canvas object
	 */
	initialize: function(doc, canvas) {
		this.doc = doc;
		this.canvas = canvas
	},

	/**
	 * Function: getFrameRate
	 *
	 * This method returns the current frame rate.
	 * 
	 * Returns:
	 *
	 * 		The current frame rate
	 */
	getFrameRate: function() {
		return "Not implemented x3dom._runtime.getFrameRate";
	},

	/**
	 * Function: setFrameRate
	 *
	 * Set frame rate.
	 * 
	 * Parameters:
	 * 
	 *		rate - The new integer value for the frame rate
	 */
	setFrameRate: function(rate) {
		return "Not implemented x3dom._runtime.setFrameRate("+ rate + ")";
	},

	/**
	 * Function: getActiveBindable
     *	 
	 * Returns the currently active bindable DOM element of the given typ. 
	 * typeName must be a valid Bindable node (e.g. X3DViewpointNode, 
	 * X3DNavigationInfoNode)
	 * 
	 * Parameters:
	 * 		typeName - bindable type name
	 *
	 * Returns:
	 * 		DOM element
	 */
	getActiveBindable: function(typeName) {
		var stacks;
		var i, current, result;
		
		stacks = this.canvas.doc._bindableBag._stacks;
		result = []
		for (i=0; i < stacks.length; i++) {
			current = stacks[i];
			if (current._type._typeName == typeName) {
				result.push(current.getActive());
			}
		}

		return result[0];
//		alert("Called x3dom.runtime.getActiveBindable("+ typeName + ")");
	},
	
	
	/**
	 * Function: viewpoint
     *	 
	 * Returns the current viewpoint.
	 * 
	 * Returns:
	 * 		The viewpoint
	 */
	viewpoint: function() {
		this.canvas.doc._scene.getViewpoint();
	},
	
	/**
	 * Function: projectionMatrix
     *	 
	 * Returns the current projection matrix.
	 * 
	 * Returns:
	 * 		Matrix object
	 */
	pojectionMatrix: function() {
		this.canvas.doc._viewarea.getProjectionMatrix();
	},

	/**
	 * Function: navigationInfo
     *	 
	 * Returns the current navigation information.
	 * 
	 * Returns:
	 * 		The navigation info node for the scene
	 */
	navigationInfo: function() {
		this.canvas.doc._scene.getNavigationInfo();
	},

	/**
	 * Function: lightMatrix
     *	 
	 * Returns the current light matrix.
	 * 
	 * Returns:
	 * 		The light matrix
	 */
	lightMatrix: function() {
		this.canvas.doc._viewarea.getLightMatrix();
	},
	
	/**
	 * Function: resetView
     *	 
	 * Resets the view to initial.
	 * 
	 */
	resetView: function() {
		this.canvas.doc._viewarea.resetView();
	},
	
	/**
	 * Function: lightView
     *	 
	 * Navigates to the light, if any.
	 * 
	 * Returns:
	 * 		True if navigation was possible, false otherwise.
	 */
	lightView: function() {
		if (this.canvas.doc._nodeBag.lights.length > 0) {
			this.canvas.doc._viewarea.animateTo(this.canvas.doc._viewarea.getLightMatrix()[0], this.canvas.doc._scene.getViewpoint());
			return true;
		} else {
			x3dom.debug.logInfo("No lights to navigate to");
			return false;
		}
	},
	
	/**
	 * Function: uprightView
     *	 
	 * Navigates to upright view
	 * 
	 */
	uprightView: function() {
		this.canvas.doc._viewarea.uprightView();
	},
	
	/**
	 * Function: showAll
     *	 
	 * Zooms so that all objects are fully visible.
	 * 
	 */
	showAll: function() {
		this.canvas.doc._viewarea.showAll();
	},
	
	/**
	 * Function: showDebug
     *	 
	 * Displays the debug window
	 */
	showDebug: function() {
		this.canvas.doc._viewarea._visDbgBuf = true;
		x3dom.debug.logContainer.style.display = "block";
		this.canvas.doc.needRender = true;
	},

	/**
	 * Function: hideDebug
     *	 
	 * Hides the debug window
	 */
	hideDebug: function() {
		this.canvas.doc._viewarea._visDbgBuf = false;
		x3dom.debug.logContainer.style.display = "none";
		this.canvas.doc.needRender = true;
	},
	
	/**
	 * Function: examine
     *	 
	 * Switches to examine mode
	 */
	examine: function() {
		this.canvas.doc._scene.getNavigationInfo()._vf.type[0] = "examine";
        x3dom.debug.logInfo("Switch to examine mode.");
	},

	/**
	 * Function: fly
     *	 
	 * Switches to fly mode
	 */
	fly: function() {
		this.canvas.doc._scene.getNavigationInfo()._vf.type[0] = "fly";
		x3dom.debug.logInfo("Switch to fly mode.");
	},
	
	/**
	 * Function: lookAt
     *	 
	 * Switches to lookAt mode
	 */
	lookAt: function() {
		this.canvas.doc._scene.getNavigationInfo()._vf.type[0] = "lookat";
        x3dom.debug.logInfo("Switch to lookat mode.");
	},

	/**
	 * Function: walk
     *	 
	 * Switches to walk mode
	 */
	walk: function() {
		this.canvas.doc._scene.getNavigationInfo()._vf.type[0] = "walk";
        x3dom.debug.logInfo("Switch to walk mode.");
	},
	
	/**
	 * Function: togglePoints
     *	 
	 * Toggles points attribute
	 */
	togglePoints: function() {
		this.canvas.doc._viewarea._points = !this.canvas.doc._viewarea._points;
	},

	/**
	 * Function: pickMode
	 *
	 * Get the current pickmode intersect type
	 * 
	 * Parameters:
	 *		internal - true/false. If given return the internal representation.
	 *                 Only use for debugging.
	 *
	 * Returns:
	 * 		The current intersect type value suitable to use with changePickMode
	 *      If parameter is, given, provide with internal representation.
	 */
	pickMode: function(internal) {
		if (internal === true) {
			return this.canvas.doc._scene._vf.pickMode;
		}
		return this.canvas.doc._scene._vf.pickMode.toLowerCase();
	},

	/**
	 * Function: changePickMode
	 *
	 * Alter the value of intersct type. Can be one of: idbuf, color, textcoord, box.
	 * Other values are ignored.
	 * 
	 * Parameters:
	 *		type - The new intersect type: idbuf, color, textcoord, or box.
	 *
	 * Returns:
	 * 		true if the type hase been changed, false otherwise
	 */
	changePickMode: function(type) {
		// type one of : idbuf, color, textcoord, box

		type = type.toLowerCase();
		
		switch(type) {
			case 'idbuf':
				type = 'idBuf'; 
				break;
			case 'textcoord': 
				type = 'textCoord'; 
				break;
			case 'color':
				type = 'color';
				break;
			case 'box':
				type = 'box';
				break;

			default:
				x3dom.debug.logWarning("Switch pickMode to "+ type + 'unknown intersect type');
				type = undefined;
		}
		
		if (type !== undefined) {
			this.canvas.doc._scene._vf.pickMode = type;
			x3dom.debug.logInfo("Switched pickMode to '" + type + "'.");
			return false;
		}
		
		return true;
	},

	/**
	 * Function: speed
	 *
	 * Get the current speed value
	 * 
	 * Returns:
	 * 		The current speed value
	 */
	speed: function(newSpeed) {
		return this.canvas.doc._scene.getNavigationInfo()._vf.speed;
	},

	/**
	 * Function: changeSpeed
	 *
	 * Set the speed. 
	 * 
	 * Parameters:
	 *		newSpeed - The new speed value
	 *
	 * Returns:
	 * 		The current speed value
	 */
	changeSpeed: function(newSpeed) {
		if (newSpeed) {
			this.canvas.doc._scene.getNavigationInfo()._vf.speed = newSpeed;
		}
		return this.canvas.doc._scene.getNavigationInfo()._vf.speed;
	},

	/**
	 * Function: statistics
	 *
	 * Get or set statistics info. If parameter is omitted, this method
	 * only returns the the visibility status of the statistics info overlay.
	 * 
	 * Parameters:
	 *		mode - true or false. To enable or disable the statistics info
	 *
	 * Returns:
	 * 		The current visibility of the statistics info (true = visible, false = invisible)
	 */
	statistics: function(mode) {
		var statDiv = this.canvas.statDiv;
        if (statDiv) {  
			
			if (mode === true) {
				statDiv.style.display = 'inline';
				return true;
			}
			if (mode === false) {
				statDiv.style.display = 'none';
				return false;
			}

			// if no parameter is given return current status (false = not visible, true = visible)
			return statDiv.style.display != 'none'
		}
	}
	
};



(function () {

    var onload = function() {

        // Search all X3D elements in the page
        var x3ds = document.getElementsByTagName('X3D');
        var w3sg = document.getElementsByTagName('webSG');

        // active hacky DOMAttrModified workaround to webkit 
        if (window.navigator.userAgent.match(/webkit/i)) {
            x3dom.debug.logInfo ("Active DOMAttrModifiedEvent workaround for webkit ");
            x3dom.userAgentFeature.supportsDOMAttrModified = false;
        }
            
        // Convert the collection into a simple array (is this necessary?)
        x3ds = Array.map(x3ds, function (n) { n.hasRuntime = true;  return n; });
        w3sg = Array.map(w3sg, function (n) { n.hasRuntime = false; return n; });
        
        var i=0; // re-usable counter

        for (i=0; i<w3sg.length; i++) {
            x3ds.push(w3sg[i]);
        }
        
        var activateLog = false;
        for (i=0; i < x3ds.length; i++) {
            var showLog = x3ds[i].getAttribute("showLog");
            if (showLog !== null && showLog.toLowerCase() == "true") {
                activateLog = true;
                break;
            }
        }

        // Activate debugging/logging for x3dom. Logging will only work for
        // all log calls after this line!
        x3dom.debug.activate(activateLog);
        
        if (x3dom.versionInfo !== undefined) {
            x3dom.debug.logInfo("X3Dom version " + x3dom.versionInfo.version + 
                                " Rev. " + x3dom.versionInfo.svnrevision);
        }
        
        x3dom.debug.logInfo("Found " + (x3ds.length - w3sg.length) + " X3D and " + 
                            w3sg.length + " (experimental) WebSG nodes...");
        
        // Create a HTML canvas for every X3D scene and wrap it with
        // an X3D canvas and load the content
        for (i=0; i < x3ds.length; i++)
        {
            var x3d_element = x3ds[i];
		
        /*
            // http://de.selfhtml.org/javascript/objekte/mimetypes.htm
            if (navigator.mimeTypes["model/vrml"] &&
                navigator.mimeTypes["model/vrml"].enabledPlugin != null)
            {
                alert(navigator.mimeTypes["model/vrml"].suffixes);
                
                var domString, embed;
                //var dom = (new DOMParser()).parseFromString(xmlstring, "text/xml");
                domString = (new XMLSerializer()).serializeToString(x3ds[i].childNodes[1]);
                domString = "<X3D>\n" + domString + "\n</X3D>\n";
                //domString = domString.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                //x3dom.debug.logInfo(domString);
                //alert(domString);
                
                embed = document.createElement("embed");
                embed.setAttribute("id", "embed1");
                embed.setAttribute("type", "model/vrml");
                embed.setAttribute("width", x3ds[i].getAttribute("width"));
                embed.setAttribute("height", x3ds[i].getAttribute("height"));
                //embed.setAttribute("src", "flipper.x3d");
                
                x3ds[i].parentNode.insertBefore(embed, x3ds[i]);
                embed.load(domString);
                
                continue;
            }
        */
        
            // http://www.howtocreate.co.uk/wrongWithIE/?chapter=navigator.plugins
            if (x3dom.detectActiveX()) {
                x3dom.insertActiveX(x3d_element);
                continue;
            }
        
            var x3dcanvas = new x3dom.X3DCanvas(x3d_element, i);
            
            if (x3dcanvas.gl === null) {

            /*
                var domString, embed;
                //var dom = (new DOMParser()).parseFromString(xmlstring, "text/xml");
                domString = (new XMLSerializer()).serializeToString(x3ds[i].childNodes[1]);
                domString = "<X3D>\n" + domString + "\n</X3D>\n";
                //domString = domString.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                //x3dom.debug.logInfo(domString);
                //alert(domString);
                
                embed = document.createElement("embed");
                embed.setAttribute("id", "embed1");
                embed.setAttribute("type", "model/vrml");
                embed.setAttribute("width", x3dcanvas.canvasDiv.style.width);
                embed.setAttribute("height", x3dcanvas.canvasDiv.style.height);
                //embed.setAttribute("src", "flipper.x3d");
                x3dcanvas.canvasDiv.appendChild(embed);
                embed.load(domString);
                break;
            */
                
                var altDiv = document.createElement("div");
                altDiv.setAttribute("class", "x3dom-nox3d");
                var altP = document.createElement("p");
                altP.appendChild(document.createTextNode("WebGL is not yet supported in your browser. "));
                var aLnk = document.createElement("a");
                aLnk.setAttribute("href","http://www.x3dom.org/?page_id=9");
                aLnk.appendChild(document.createTextNode("Follow link for a list of supported browsers... "));
                
                altDiv.appendChild(altP);
                altDiv.appendChild(aLnk);
                
                x3dcanvas.x3dElem.appendChild(altDiv);

                // remove the stats div (it's not needed when WebGL doesnt work)
                if (x3dcanvas.statDiv) { 
                    x3d_element.removeChild(x3dcanvas.statDiv);
                }

                // check if "altImg" is specified on x3d element and if so use it as background
                var altImg = x3ds[i].getAttribute("altImg") || null;
                if (altImg) {
                    var altImgObj = new Image();                
                    altImgObj.src = altImg;                    
                    x3d_element.style.backgroundImage = "url("+altImg+")";                    
                }
                continue;
            }
            
            var t0 = new Date().getTime();
            
            x3dcanvas.load(x3ds[i], i);
            x3dom.canvases.push(x3dcanvas);
            

			x3ds[i].runtime = x3dom._runtime;
			x3ds[i].runtime.initialize(x3ds[i], x3dcanvas);

			var t1 = new Date().getTime() - t0;
            x3dom.debug.logInfo("Time for setup and init of GL element no. " + i + ": " + t1 + " ms.");
        }
        
        var ready = (function(eventType) {
            var evt = null;
            
            if (document.createEvent) {
                evt = document.createEvent("Events");    
                evt.initEvent(eventType, true, true);     
                document.dispatchEvent(evt);              
            }
            else if (document.createEventObject) {
                evt = document.createEventObject();
                // http://stackoverflow.com/questions/1874866/how-to-fire-onload-event-on-document-in-ie
                document.body.fireEvent('on' + eventType, evt);   
            }
        })('load');
    };
    
    var onunload = function() {
        for (var i=0; i<x3dom.canvases.length; i++) {
            x3dom.canvases[i].doc.shutdown(x3dom.canvases[i].gl);
        }
    };
    
    if (window.location.pathname.lastIndexOf(".xhtml") > 0) {
        document.__getElementById = document.getElementById;

        document.getElementById = function(id) {
            var obj = this.__getElementById(id);
            
            if (!obj) {
                var elems = this.getElementsByTagName("*");
                for (var i=0; i<elems.length && !obj; i++) {
                    if (elems[i].getAttribute("id") === id) {
                        obj = elems[i];
                    }
                }
            }
            return obj;
        };
    }
    
    if (window.addEventListener)  {
        window.addEventListener('load', onload, false);
        window.addEventListener('unload', onunload, false);
        window.addEventListener('reload', onunload, false);
    } else if (window.attachEvent) {
        window.attachEvent('onload', onload);
        window.attachEvent('onunload', onunload);
        window.attachEvent('onreload', onunload);
    }
    
})();

