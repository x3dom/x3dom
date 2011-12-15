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
    //this.animNode = [];
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

                //x3dom.debug.logInfo("Child: " + e.target.type + ", MUTATION: " + e + ", " + e.type + ", removed node=" + e.target.tagName);
                if (parent) {
                    parent.removeChild(child);
                    doc.needRender = true;
                }
            }
        },
        onNodeInserted: function(e) {
			
            // only act on x3dom nodes, ignore regular HTML
            if ('_x3domNode' in e.target.parentNode) {
				if(e.target.parentNode.tagName == 'Inline' 
				   || e.target.parentNode.tagName == 'INLINE' 
				   || e.target.parentNode.tagName == 'inline') {
					return;
				} else {
					var parent = e.target.parentNode._x3domNode;
					var child = e.target;
	
					//x3dom.debug.logInfo("INSERT: " + e + ", " + e.type + ", inserted node=" + child.tagName + ", " + child.parentNode.tagName);
	
					if (parent._nameSpace) {
						var newNode = parent._nameSpace.setupTree(child);
						parent.addChild(newNode, child.getAttribute("containerField"));
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

    // create and add BindableBag
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
    var that;
    var i;

    if (this._nodeBag.timer.length) {
        this.needRender = true;
        for (i=0; i < this._nodeBag.timer.length; i++) { this._nodeBag.timer[i].onframe(t); }
//        Array.forEach( this._nodeBag.timer, function (node) { node.onframe(t); } );
    }
    if (this._nodeBag.followers.length) {
        that = this;
        for (i=0; i < this._nodeBag.followers.length; i++) { this.needRender |= this._nodeBag.followers[i].tick(t); }
//        Array.forEach( this._nodeBag.followers, function (node) { that.needRender |= node.tick(t); } );
    }
    // just a temporary tricker solution to update the CSS-trans
    if (this._nodeBag.trans.length) {
        that = this;
        for (i=0; i < this._nodeBag.trans.length; i++) { this.needRender |= this._nodeBag.trans[i].tick(t); }
//        Array.forEach( this._nodeBag.trans, function (node) { that.needRender |= node.tick(t); } );
    }
    if (this._nodeBag.viewarea.length) {
        that = this;
        for (i=0; i < this._nodeBag.viewarea.length; i++) { this.needRender |= this._nodeBag.viewarea[i].tick(t); }
//        Array.forEach( this._nodeBag.viewarea, function (node) { that.needRender |= node.tick(t); } );
    }
};

x3dom.X3DDocument.prototype.render = function (ctx) {
    if (!ctx || !this._viewarea) {
        return;
    }

    ctx.renderScene(this._viewarea);
};

x3dom.X3DDocument.prototype.onMove = function (ctx, x, y, buttonState) {
    if (!ctx || !this._viewarea) {
        return;
    }

    ctx.pickValue(this._viewarea, x, y);
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

    ctx.pickValue(this._viewarea, x, y);
    this._viewarea.onDrag(x, y, buttonState);
};

x3dom.X3DDocument.prototype.onMousePress = function (ctx, x, y, buttonState) {
    if (!ctx || !this._viewarea) {
        return;
    }

    // update volume only on click since expensive!
    var min = x3dom.fields.SFVec3f.MAX();
    var max = x3dom.fields.SFVec3f.MIN();

    this._viewarea._scene.getVolume(min, max, true);
    this._viewarea._scene._lastMin = min;
    this._viewarea._scene._lastMax = max;

    ctx.pickValue(this._viewarea, x, y);
    this._viewarea.onMousePress(x, y, buttonState);
};

x3dom.X3DDocument.prototype.onMouseRelease = function (ctx, x, y, buttonState) {
    if (!ctx || !this._viewarea) {
        return;
    }

    ctx.pickValue(this._viewarea, x, y);
    this._viewarea.onMouseRelease(x, y, buttonState);
};

x3dom.X3DDocument.prototype.onMouseOver = function (ctx, x, y, buttonState) {
    if (!ctx || !this._viewarea) {
        return;
    }

    ctx.pickValue(this._viewarea, x, y);
    this._viewarea.onMouseOver(x, y, buttonState);
};

x3dom.X3DDocument.prototype.onMouseOut = function (ctx, x, y, buttonState) {
    if (!ctx || !this._viewarea) {
        return;
    }

    ctx.pickValue(this._viewarea, x, y);
    this._viewarea.onMouseOut(x, y, buttonState);
};

x3dom.X3DDocument.prototype.onDoubleClick = function (ctx, x, y) {
    if (!ctx || !this._viewarea) {
        return;
    }

    this._viewarea.onDoubleClick(x, y);
};


// touch events
x3dom.X3DDocument.prototype.onTouchMove = function (ctx, touch) {
    if (!ctx || !this._viewarea) {
        return;
    }

    x3dom.debug.logWarning("onTouchMove not implemented");
};

x3dom.X3DDocument.prototype.onKeyDown = function(keyCode)
{
    //x3dom.debug.logInfo("presses key " + keyCode);

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
            var statDiv = this.canvas.parent.statDiv;

            if (statDiv) {
                statDiv.style.display = ((statDiv.style.display == 'none') ? 'inline' : 'none');
            }

            x3dom.debug.logInfo("a: show all | d: show helper buffers | s: light view | " +
                                "m: toggle render mode | p: intersect type | r: reset view | " +
                                "e: examine mode | f: fly mode | w: walk mode | " +
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
        case 108: /* l, lookAt mode */
            nav.setType("lookat", this._viewarea);
            break;
        case 109: /* m, toggle "points" attribute */
            if (this._viewarea._points === undefined) {
                this._viewarea._points = true;
            }
            else {
                this._viewarea._points = !this._viewarea._points;
            }
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
            };

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
