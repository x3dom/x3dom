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

// ### X3DDocument ###
x3dom.X3DDocument = function(canvas, ctx, settings) {
    this.properties = settings;
    this.canvas = canvas;
    this.ctx = ctx;
    this.needRender = true;
    this._scene = null;
    this._viewarea = null;
    this._nodeBag = {
        timer: [],
        lights: [],
        clipPlanes: [],
        followers: [],
        trans: [],
        renderTextures: [],
        viewarea: []
    };
    this.downloadCount = 0;
    this.onload = function () {};
    this.onerror = function () {};
};

x3dom.X3DDocument.prototype.load = function (uri, sceneElemPos) {
    // Load uri. Get sceneDoc, list of sub-URIs.
    // For each URI, get docs[uri] = whatever, extend list of sub-URIs.

    var uri_docs = {};
    var queued_uris = [uri];
    var doc = this;

    function next_step() {
        // TODO: detect circular inclusions
        // TODO: download in parallel where possible

        if (queued_uris.length === 0) {
            // All done
            doc._setup(uri_docs[uri], uri_docs, sceneElemPos);
            doc.onload();
            return;
        }
        var next_uri = queued_uris.shift();

        //x3dom.debug.logInfo("loading... next_uri=" + next_uri + ", " + x3dom.isX3DElement(next_uri) + ", " + next_uri.namespaceURI);
        if ( x3dom.isX3DElement(next_uri) &&
            (next_uri.localName.toLowerCase() === 'x3d' || next_uri.localName.toLowerCase() === 'websg') )
        {
            // Special case, when passed an X3D node instead of a URI string
            uri_docs[next_uri] = next_uri;
            next_step();
        }
    }

    next_step();
};

x3dom.findScene = function(x3dElem) {
    var sceneElems = [];

    for (var i=0; i<x3dElem.childNodes.length; i++) {
        var sceneElem = x3dElem.childNodes[i];

        if (sceneElem && sceneElem.localName && sceneElem.localName.toLowerCase() === "scene") {
            sceneElems.push(sceneElem);
        }
    }

    if (sceneElems.length > 1) {
        x3dom.debug.logError("X3D element has more than one Scene child (has " +
                             x3dElem.childNodes.length + ").");
    }
    else {
        return sceneElems[0];
    }
    return null;
};


x3dom.X3DDocument.prototype._setup = function (sceneDoc, uriDocs, sceneElemPos) {

    var doc = this;

    // Test capturing DOM mutation events on the X3D subscene
    var domEventListener = {
        onAttrModified: function(e) {
            if ('_x3domNode' in e.target) {
                var attrToString = {
                    1: "MODIFICATION",
                    2: "ADDITION",
                    3: "REMOVAL"
                };
                //x3dom.debug.logInfo("MUTATION: " + e.attrName + ", " + e.type + ", attrChange=" + attrToString[e.attrChange]);
                e.target._x3domNode.updateField(e.attrName, e.newValue);
                doc.needRender = true;
            }
        },
        
        onNodeRemoved: function(e) {
            if ('_x3domNode' in e.target.parentNode && '_x3domNode' in e.target) {
                var parent = e.target.parentNode._x3domNode;
                var child = e.target._x3domNode;

                //x3dom.debug.logInfo("Child: " + e.target.type + ", removed node=" + e.target.tagName);
                if (parent && child) {
                    parent.removeChild(child);
                    
                    if (doc._viewarea && doc._viewarea._scene)
                        doc._viewarea._scene.updateVolume();
                    doc.needRender = true;
                }
            }
            else if (e.target.localName && e.target.localName.toUpperCase() == "ROUTE") {
                x3dom.debug.logError("Remove ROUTE NYI");   // TODO
            }
        },
        
        onNodeInserted: function(e) {
            var child = e.target;
            
            // only act on x3dom nodes, ignore regular HTML
            if ('_x3domNode' in child.parentNode) {
				if (child.parentNode.tagName && 
				    child.parentNode.tagName.toLowerCase() == 'inline') {
					return;
				}
				else {
					var parent = child.parentNode._x3domNode;
					
					//x3dom.debug.logInfo("Inserted node=" + child.tagName + ", " + child.parentNode.tagName);
					if (parent && parent._nameSpace) {
						var newNode = parent._nameSpace.setupTree(child);
						
                        if (child instanceof Element) {
						    parent.addChild(newNode, child.getAttribute("containerField"));
						    
                            if (doc._viewarea && doc._viewarea._scene)
                                doc._viewarea._scene.updateVolume();
                        }
                        else
                            parent.nodeChanged();
						doc.needRender = true;
					}
					else {
						x3dom.debug.logWarning("No _nameSpace in onNodeInserted");
					}
				}
            }
        }
    };

    //sceneDoc.addEventListener('DOMCharacterDataModified', domEventListener.onAttrModified, true);
    sceneDoc.addEventListener('DOMNodeRemoved', domEventListener.onNodeRemoved, true);
    sceneDoc.addEventListener('DOMNodeInserted', domEventListener.onNodeInserted, true);
    if ( (x3dom.userAgentFeature.supportsDOMAttrModified === true ) ) {
        sceneDoc.addEventListener('DOMAttrModified', domEventListener.onAttrModified, true);
    }

    // sceneDoc is the X3D element here...
    var sceneElem = x3dom.findScene(sceneDoc);

    // create and add BindableBag that holds all bindable stacks
    this._bindableBag = new x3dom.BindableBag(this);

    // create and add the NodeNameSpace
    var nameSpace = new x3dom.NodeNameSpace("scene", doc);
    
    var scene = nameSpace.setupTree(sceneElem);

    // link scene
    this._scene = scene;
    this._bindableBag.setRefNode(scene);

    // create view
    this._viewarea = new x3dom.Viewarea (this, scene);

    this._viewarea._width = this.canvas.width;
    this._viewarea._height = this.canvas.height;
};

x3dom.X3DDocument.prototype.advanceTime = function (t) {
    var i = 0;

    if (this._nodeBag.timer.length) {
        for (i=0; i < this._nodeBag.timer.length; i++)
            { this.needRender |= this._nodeBag.timer[i].tick(t); }
    }
    if (this._nodeBag.followers.length) {
        for (i=0; i < this._nodeBag.followers.length; i++)
            { this.needRender |= this._nodeBag.followers[i].tick(t); }
    }
    // just a temporary tricker solution to update the CSS transforms
    if (this._nodeBag.trans.length) {
        for (i=0; i < this._nodeBag.trans.length; i++)
            { this.needRender |= this._nodeBag.trans[i].tick(t); }
    }
    if (this._nodeBag.viewarea.length) {
        for (i=0; i < this._nodeBag.viewarea.length; i++)
            { this.needRender |= this._nodeBag.viewarea[i].tick(t); }
    }
};

x3dom.X3DDocument.prototype.render = function (ctx) {
    if (!ctx || !this._viewarea) {
        return;
    }

    ctx.renderScene(this._viewarea);
};

x3dom.X3DDocument.prototype.onPick = function (ctx, x, y) {
    if (!ctx || !this._viewarea) {
        return;
    }
	
    ctx.pickValue(this._viewarea, x, y, 1);
};

x3dom.X3DDocument.prototype.onPickRect = function (ctx, x1, y1, x2, y2) {
    if (!ctx || !this._viewarea) {
        return;
    }
	
    return ctx.pickRect(this._viewarea, x1, y1, x2, y2);
};

x3dom.X3DDocument.prototype.onMove = function (ctx, x, y, buttonState) {
    if (!ctx || !this._viewarea) {
        return;
    }

    if (this._viewarea._scene._vf.doPickPass)
        ctx.pickValue(this._viewarea, x, y, buttonState);
    this._viewarea.onMove(x, y, buttonState);
};

x3dom.X3DDocument.prototype.onMoveView = function (ctx, translation, rotation) {
    if (!ctx || !this._viewarea) {
        return;
    }

    this._viewarea.onMoveView(translation, rotation);
};

x3dom.X3DDocument.prototype.onDrag = function (ctx, x, y, buttonState) {
    if (!ctx || !this._viewarea) {
        return;
    }

    if (this._viewarea._scene._vf.doPickPass)
        ctx.pickValue(this._viewarea, x, y, buttonState);
    this._viewarea.onDrag(x, y, buttonState);
};

x3dom.X3DDocument.prototype.onMousePress = function (ctx, x, y, buttonState) {
    if (!ctx || !this._viewarea) {
        return;
    }

    // update volume only on click since expensive!
    this._viewarea._scene.updateVolume();

    ctx.pickValue(this._viewarea, x, y, buttonState);
    this._viewarea.onMousePress(x, y, buttonState);
};

x3dom.X3DDocument.prototype.onMouseRelease = function (ctx, x, y, buttonState) {
    if (!ctx || !this._viewarea) {
        return;
    }

    ctx.pickValue(this._viewarea, x, y, buttonState);
    this._viewarea.onMouseRelease(x, y, buttonState);
};

x3dom.X3DDocument.prototype.onMouseOver = function (ctx, x, y, buttonState) {
    if (!ctx || !this._viewarea) {
        return;
    }

    ctx.pickValue(this._viewarea, x, y, buttonState);
    this._viewarea.onMouseOver(x, y, buttonState);
};

x3dom.X3DDocument.prototype.onMouseOut = function (ctx, x, y, buttonState) {
    if (!ctx || !this._viewarea) {
        return;
    }

    ctx.pickValue(this._viewarea, x, y, buttonState);
    this._viewarea.onMouseOut(x, y, buttonState);
};

x3dom.X3DDocument.prototype.onDoubleClick = function (ctx, x, y) {
    if (!ctx || !this._viewarea) {
        return;
    }

    this._viewarea.onDoubleClick(x, y);
};


x3dom.X3DDocument.prototype.onKeyDown = function(keyCode)
{
    //x3dom.debug.logInfo("pressed key " + keyCode);
    switch (keyCode) {
        case 37: /* left */
            this._viewarea.strafeLeft();
            break;
        case 38: /* up */
            this._viewarea.moveFwd();
            break;
        case 39: /* right */
            this._viewarea.strafeRight();
            break;
        case 40: /* down */
            this._viewarea.moveBwd();
            break;
        default:
    }
};

x3dom.X3DDocument.prototype.onKeyUp = function(keyCode)
{
    //x3dom.debug.logInfo("released key " + keyCode);
    var stack = null;

    switch (keyCode) {
        case 27: /* ESC */
            window.history.back(); // emulate good old ESC key
            break;
        case 33: /* page up */
            stack = this._scene.getViewpoint()._stack;

            if (stack) {
                stack.switchTo('next');
            }
            else {
                x3dom.debug.logError ('No valid ViewBindable stack.');
            }
            break;
        case 34: /* page down */
            stack = this._scene.getViewpoint()._stack;

            if (stack) {
                stack.switchTo('prev');
            }
            else {
                x3dom.debug.logError ('No valid ViewBindable stack.');
            }
            break;
        case 37: /* left */
            break;
        case 38: /* up */
            break;
        case 39: /* right */
            break;
        case 40: /* down */
            break;
        default:
    }
};

x3dom.X3DDocument.prototype.onKeyPress = function(charCode)
{
    //x3dom.debug.logInfo("pressed key " + charCode);
    var nav = this._scene.getNavigationInfo();

    switch (charCode)
    {
        case  32: /* space */
            var stateCanvas = this.canvas.parent.stateCanvas;
			
			if (stateCanvas) {
				stateCanvas.display();
			}

            x3dom.debug.logInfo("a: show all | d: show helper buffers | s: light view | " +
                                "m: toggle render mode | p: intersect type | r: reset view | " +
                                "e: examine mode | f: fly mode | w: walk mode | h: helicopter mode | " +
                                "l: lookAt mode | g: game mode | u: upright position");
            break;
        case  43: /* + (incr. speed) */
            nav._vf.speed = 2 * nav._vf.speed;
            x3dom.debug.logInfo("Changed navigation speed to " + nav._vf.speed);
            break;
        case  45: /* - (decr. speed) */
            nav._vf.speed = 0.5 * nav._vf.speed;
            x3dom.debug.logInfo("Changed navigation speed to " + nav._vf.speed);
            break;
        case  54: /* 6 (incr height) */
            nav._vf.typeParams[1] += 1.0;
            nav._heliUpdated = false;
            x3dom.debug.logInfo("Changed helicopter height to " + nav._vf.typeParams[1]);
            break;
        case  55: /* 7 (decr height) */
            nav._vf.typeParams[1] -= 1.0;
            nav._heliUpdated = false;
            x3dom.debug.logInfo("Changed helicopter height to " + nav._vf.typeParams[1]);
            break;
        case  56: /* 8 (decr height) */
            nav._vf.typeParams[0] -= 0.02;
            nav._heliUpdated = false;
            x3dom.debug.logInfo("Changed helicopter angle to " + nav._vf.typeParams[0]);
            break;
        case  57: /* 9 (incr angle) */
            nav._vf.typeParams[0] += 0.02;
            nav._heliUpdated = false;
            x3dom.debug.logInfo("Changed helicopter angle to " + nav._vf.typeParams[0]);
            break;
        case  97: /* a, view all */
            this._viewarea.showAll();
            break;
        case  100: /* d, switch on/off buffer view for dbg */
            if (this._viewarea._visDbgBuf === undefined) {
                this._viewarea._visDbgBuf = true;
            }
            else {
                this._viewarea._visDbgBuf = !this._viewarea._visDbgBuf;
            }

            x3dom.debug.logContainer.style.display =
                    (this._viewarea._visDbgBuf === true) ? "block" : "none";
            break;
        case 101: /* e, examine mode */
            nav.setType("examine", this._viewarea);
            break;
        case 102: /* f, fly mode */
            nav.setType("fly", this._viewarea);
            break;
        case 103: /* g, game mode */
            nav.setType("game", this._viewarea);
            break;
        case 104: /* h, helicopter mode */
            nav.setType("helicopter", this._viewarea);
            break;
        case 108: /* l, lookAt mode */
            nav.setType("lookat", this._viewarea);
            break;
        case 109: /* m, toggle "points" attribute */
            if (this._viewarea._points === undefined) {
                this._viewarea._points = 0;
            }
            this._viewarea._points = ++this._viewarea._points % 3; // % 2;
            break;
        case 111: /* o, look around like in fly, but don't move */
            nav.setType("lookaround", this._viewarea);
            break;
        case 112: /* p, switch intersect type */
            switch(this._scene._vf.pickMode.toLowerCase())
            {
                case "idbuf":
                    this._scene._vf.pickMode = "color";
                    break;
                case "color":
                    this._scene._vf.pickMode = "texCoord";
                    break;
                case "texcoord":
                    this._scene._vf.pickMode = "box";
                    break;
                default:
                    this._scene._vf.pickMode = "idBuf";
                    break;
            }

            x3dom.debug.logInfo("Switch pickMode to '" +
                                this._scene._vf.pickMode + "'.");
            break;
        case 114: /* r, reset view */
            this._viewarea.resetView();
            break;
        case 115: /* s, light view */
            if (this._nodeBag.lights.length > 0)
            {
                this._viewarea.animateTo(this._viewarea.getLightMatrix()[0],
                                         this._scene.getViewpoint());
            }
            break;
        case 117: /* u, upright position */
            this._viewarea.uprightView();
            break;
        case 118: /* v, print viewpoint position/orientation */
            var that = this;
            (function() {
                var mat_view = that._viewarea.getViewMatrix();
                var e_viewpoint = that._viewarea._scene.getViewpoint();
                
    			var e_viewtrafo = e_viewpoint.getCurrentTransform();
    			e_viewtrafo = e_viewtrafo.inverse().mult(mat_view);
    			
    			var e_mat = e_viewtrafo.inverse();
    			
    			var rotation = new x3dom.fields.Quaternion(0, 0, 1, 0);
    			rotation.setValue(e_mat);
    			
    			var translation = e_mat.e3();
				var rot = rotation.toAxisAngle();
    			
    			x3dom.debug.logInfo('&lt;Viewpoint position="' + translation.x.toFixed(5) + ' ' 
    			                    + translation.y.toFixed(5) + ' ' + translation.z.toFixed(5) + '" ' +
    								'orientation="' + rot[0].x.toFixed(5) + ' ' + rot[0].y.toFixed(5) + ' ' 
    								+ rot[0].z.toFixed(5) + ' ' + rot[1].toFixed(5) + '" \n\t' +
                                    'zNear="' + e_viewpoint.getNear().toFixed(6) + '" ' +
    								'zFar="' + e_viewpoint.getFar().toFixed(6) + '" ' +
    								'description="' + e_viewpoint._vf.description + '"&gt;');
            })();
            break;
        case 119: /* w, walk mode */
            nav.setType("walk", this._viewarea);
            break;
        default:
    }
};

x3dom.X3DDocument.prototype.shutdown = function(ctx)
{
    if (!ctx) {
        return;
    }
    ctx.shutdown(this._viewarea);
};
