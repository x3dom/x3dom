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


// ### X3DDocument ###
x3dom.X3DDocument = function(canvas, ctx, settings) {
    this.canvas = canvas;       // The <canvas> elem
    this.ctx = ctx;             // WebGL context object, AKA gl
    this.properties = settings; // showStat, showLog, etc.
    this.needRender = true;     // Trigger redraw if true
    this._x3dElem = null;       // Backref to <X3D> root element (set on parsing)
    this._scene = null;         // Scene root element
    this._viewarea = null;      // Viewport, handles rendering and interaction
    this.downloadCount = 0;     // Counter for objects to be loaded
    this.previousDownloadCount = 0;

    // bag for pro-active (or multi-core-like) elements
    this._nodeBag = {
        timer: [],                // TimeSensor (tick)
        lights: [],               // Light
        clipPlanes: [],           // ClipPlane
        followers: [],            // X3DFollowerNode
        trans: [],                // X3DTransformNode (for listening to CSS changes)
        renderTextures: [],       // RenderedTexture
        viewarea: [],             // Viewport (for updating camera navigation)
        affectedPointingSensors: [] // all X3DPointingDeviceSensor currently activated (i.e., used for interaction),
                                    // this list is maintained for efficient update / deactivation
    };

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

        if ( x3dom.isX3DElement(next_uri) &&
            (next_uri.localName.toLowerCase() === 'x3d' || next_uri.localName.toLowerCase() === 'websg') )
        {
            // Special case, when passed an X3D node instead of a URI string
            uri_docs[next_uri] = next_uri;
            doc._x3dElem = next_uri;
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

    function cleanNodeBag(bag, node) {
        for (var i=0, n=bag.length; i<n; i++) {
            if (bag[i] === node) {
                bag.splice(i, 1);
                break;
            }
        }
    }

    function removeX3DOMBackendGraph(domNode) {
        var children = domNode.childNodes;

        for (var i=0, n=children.length; i<n; i++) {
            removeX3DOMBackendGraph(children[i]);
        }

        if (domNode._x3domNode) {
            var node = domNode._x3domNode;
            var nameSpace = node._nameSpace;

            if (x3dom.isa(node, x3dom.nodeTypes.X3DShapeNode)) {
                if (node._cleanupGLObjects) {
                    node._cleanupGLObjects(true);
                    // TODO: more cleanups, e.g. texture/shader cache?
                }
                if (x3dom.nodeTypes.Shape.idMap.nodeID[node._objectID]) {
                    delete x3dom.nodeTypes.Shape.idMap.nodeID[node._objectID];
                }
            }
            else if (x3dom.isa(node, x3dom.nodeTypes.TimeSensor)) {
                cleanNodeBag(doc._nodeBag.timer, node);
            }
            else if (x3dom.isa(node, x3dom.nodeTypes.X3DLightNode)) {
                cleanNodeBag(doc._nodeBag.lights, node);
            }
            else if (x3dom.isa(node, x3dom.nodeTypes.X3DFollowerNode)) {
                cleanNodeBag(doc._nodeBag.followers, node);
            }
            else if (x3dom.isa(node, x3dom.nodeTypes.X3DTransformNode)) {
                cleanNodeBag(doc._nodeBag.trans, node);
            }
            else if (x3dom.isa(node, x3dom.nodeTypes.RenderedTexture)) {
                cleanNodeBag(doc._nodeBag.renderTextures, node);
                if (node._cleanupGLObjects) {
                    node._cleanupGLObjects();
                }
            }
            else if (x3dom.isa(node, x3dom.nodeTypes.X3DPointingDeviceSensorNode)) {
                cleanNodeBag(doc._nodeBag.affectedPointingSensors, node);
            }
            else if (x3dom.isa(node, x3dom.nodeTypes.Texture)) {
                node.shutdown();    // general texture might have video
            }
            else if (x3dom.isa(node, x3dom.nodeTypes.AudioClip)) {
                node.shutdown();
            }
            else if (x3dom.isa(node, x3dom.nodeTypes.X3DBindableNode)) {
                var stack = node._stack;
                if (stack) {
                    node.bind(false);
                    cleanNodeBag(stack._bindBag, node);
                }
                // Background may have geometry
                if (node._cleanupGLObjects) {
                    node._cleanupGLObjects();
                }
            }
            else if (x3dom.isa(node, x3dom.nodeTypes.Scene)) {
                if (node._webgl) {
                    node._webgl = null;
                    // TODO; explicitly delete all gl objects
                }
            }

            //do not remove node from namespace if it was only "USE"d	
            if (nameSpace && !(domNode.getAttribute('use') || domNode.getAttribute('USE')))
            {
                nameSpace.removeNode(node._DEF);
            }
            node._xmlNode = null;

            delete domNode._x3domNode;
        }
    }

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
            var domNode = e.target;
            if (!domNode)
                return;

            if ('_x3domNode' in domNode.parentNode && '_x3domNode' in domNode) {
                var parent = domNode.parentNode._x3domNode;
                var child = domNode._x3domNode;

                if (parent && child) {
                    parent.removeChild(child);
                    parent.nodeChanged();

                    removeX3DOMBackendGraph(domNode);

                    if (doc._viewarea && doc._viewarea._scene) {
                        doc._viewarea._scene.nodeChanged();
                        doc._viewarea._scene.updateVolume();
                        doc.needRender = true;
                    }
                }
            }
            else if (domNode.localName && domNode.localName.toUpperCase() == "ROUTE" && domNode._nodeNameSpace) {
                var fromNode = domNode._nodeNameSpace.defMap[domNode.getAttribute('fromNode')];
                var toNode = domNode._nodeNameSpace.defMap[domNode.getAttribute('toNode')];

                if (fromNode && toNode) {
                    fromNode.removeRoute(domNode.getAttribute('fromField'), toNode, domNode.getAttribute('toField'));
                }
            }
            else if (domNode.localName && domNode.localName.toUpperCase() == "X3D") {
                var runtime = domNode.runtime;

                if (runtime && runtime.canvas && runtime.canvas.doc && runtime.canvas.doc._scene) {
                    var sceneNode = runtime.canvas.doc._scene._xmlNode;

                    removeX3DOMBackendGraph(sceneNode);

                    // also clear corresponding X3DCanvas element
                    for (var i=0; i<x3dom.canvases.length; i++) {
                        if (x3dom.canvases[i] === runtime.canvas) {
                            x3dom.canvases[i].doc.shutdown(x3dom.canvases[i].gl);
                            x3dom.canvases.splice(i, 1);
                            break;
                        }
                    }

                    runtime.canvas.doc._scene = null;
                    runtime.canvas.doc._viewarea = null;
                    runtime.canvas.doc = null;
                    runtime.canvas = null;
                    runtime = null;

                    domNode.context = null;
                    domNode.runtime = null;
                }
            }
        },
        
        onNodeInserted: function(e) {
            var child = e.target;
            var parentNode = child.parentNode;
            
            // only act on x3dom nodes, ignore regular HTML
            if ('_x3domNode' in parentNode) {
				if (parentNode.tagName && parentNode.tagName.toLowerCase() == 'inline' ||
                    parentNode.tagName.toLowerCase() == 'multipart') {
                    // do nothing
				}
				else {
					var parent = parentNode._x3domNode;
					
					if (parent && parent._nameSpace && (child instanceof Element)) {

                        if (x3dom.caps.DOMNodeInsertedEvent_perSubtree)
                        {
                            removeX3DOMBackendGraph(child);    // not really necessary...
                        }

                        var newNode = parent._nameSpace.setupTree(child);

                        parent.addChild(newNode, child.getAttribute("containerField"));
                        parent.nodeChanged();

                        var grandParentNode = parentNode.parentNode;
                        if (grandParentNode && grandParentNode._x3domNode)
                            grandParentNode._x3domNode.nodeChanged();

                        if (doc._viewarea && doc._viewarea._scene) {
                            doc._viewarea._scene.nodeChanged();
                            doc._viewarea._scene.updateVolume();
                            doc.needRender = true;
                        }
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
        return [];
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

x3dom.X3DDocument.prototype.onMoveView = function (ctx,evt, touches, translation, rotation) {
    if (!ctx || !this._viewarea) {
        return;
    }

    this._scene.getNavigationInfo()._impl.onTouchDrag(this._viewarea, evt, touches, translation, rotation);
};

x3dom.X3DDocument.prototype.onDrag = function (ctx, x, y, buttonState) {
    if (!ctx || !this._viewarea) {
        return;
    }

    if (this._viewarea._scene._vf.doPickPass)
        ctx.pickValue(this._viewarea, x, y, buttonState);
    this._viewarea.onDrag(x, y, buttonState);
};

x3dom.X3DDocument.prototype.onWheel = function (ctx, x, y, originalY) {
    if (!ctx || !this._viewarea) {
        return;
    }

    if (this._viewarea._scene._vf.doPickPass)
        ctx.pickValue(this._viewarea, x, originalY, 0);
    this._viewarea.onDrag(x, y, 2);
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

x3dom.X3DDocument.prototype.onMouseRelease = function (ctx, x, y, buttonState, prevButton) {
    if (!ctx || !this._viewarea) {
        return;
    }

    var button = (prevButton << 8) | buttonState;   // for shadowObjectIdChanged
    ctx.pickValue(this._viewarea, x, y, button);
    this._viewarea.onMouseRelease(x, y, buttonState, prevButton);
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
        case 13: /* return */
            x3dom.toggleFullScreen();
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
    var env = this._scene.getEnvironment();

    switch (charCode)
    {
        case  32: /* space */
            var states = this.canvas.parent.stateViewer;
			if (states) {
				states.display();
			}
            x3dom.debug.logInfo("a: show all | d: show helper buffers | s: small feature culling | t: light view | " +
                                "m: toggle render mode | c: frustum culling | p: intersect type | r: reset view | \n" +
                                "e: examine mode | f: fly mode | y: freefly mode | w: walk mode | h: helicopter mode | " +
                                "l: lookAt mode | o: lookaround | g: game mode | n: turntable | u: upright position | \n" +
                                "v: print viewpoint info | pageUp: next view | pageDown: prev. view | " +
                                "+: increase speed | -: decrease speed ");
            break;
        case  43: /* + (incr. speed) */
            nav._vf.speed = 2 * nav._vf.speed;
            x3dom.debug.logInfo("Changed navigation speed to " + nav._vf.speed);
            break;
        case  45: /* - (decr. speed) */
            nav._vf.speed = 0.5 * nav._vf.speed;
            x3dom.debug.logInfo("Changed navigation speed to " + nav._vf.speed);
            break;
        case  51: /* 3 (decr pg error tol) */
            x3dom.nodeTypes.PopGeometry.ErrorToleranceFactor += 0.5;
            x3dom.debug.logInfo("Changed POP error tolerance to " + x3dom.nodeTypes.PopGeometry.ErrorToleranceFactor);
            break;
        case  52: /* 4 (incr pg error tol) */
            x3dom.nodeTypes.PopGeometry.ErrorToleranceFactor -= 0.5;
            x3dom.debug.logInfo("Changed POP error tolerance to " + x3dom.nodeTypes.PopGeometry.ErrorToleranceFactor);
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
        case  56: /* 8 (decr angle) */
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
        case  99: /* c, toggle frustum culling */
            env._vf.frustumCulling = !env._vf.frustumCulling;
            x3dom.debug.logInfo("Viewfrustum culling " + (env._vf.frustumCulling ? "on" : "off"));
            break;
        case  100: /* d, switch on/off buffer view for dbg */
            if (this._viewarea._visDbgBuf === undefined) {
                this._viewarea._visDbgBuf = (this._x3dElem.getAttribute("showLog") === 'true');
            }
            this._viewarea._visDbgBuf = !this._viewarea._visDbgBuf;
            x3dom.debug.logContainer.style.display = (this._viewarea._visDbgBuf == true) ? "block" : "none";
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
        case 105: /* i, fit all */
            this._viewarea.fit(this._scene._lastMin, this._scene._lastMax);
            break;
        case 108: /* l, lookAt mode */
            nav.setType("lookat", this._viewarea);
            break;
        case 109: /* m, toggle "points" attribute */
            //"0" = triangles
            //"1" = points
            //"2" = lines
	    //TODO: here, as option "2", we originally rendered triangle meshes as lines
            //	    instead, we should create a separate line buffer and render it
            this._viewarea._points = ++this._viewarea._points % 2;
            break;
        case 110: /* n, turntable */
            nav.setType("turntable", this._viewarea);
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
            x3dom.debug.logInfo("Switch pickMode to '" + this._scene._vf.pickMode + "'.");
            break;
        case 114: /* r, reset view */
            this._viewarea.resetView();
            break;
        case 115: /* s, toggle small feature culling */
            env._vf.smallFeatureCulling = !env._vf.smallFeatureCulling;
            x3dom.debug.logInfo("Small feature culling " + (env._vf.smallFeatureCulling ? "on" : "off"));
            break;
        case 116: /* t, light view */
            if (this._nodeBag.lights.length > 0) {
                this._viewarea.animateTo(this._viewarea.getLightMatrix()[0], this._scene.getViewpoint());
            }
            break;
        case 117: /* u, upright position */
            this._viewarea.uprightView();
            break;
        case 118: /* v, print viewpoint position/orientation */
            var that = this;
            (function() {
                var viewpoint = that._viewarea._scene.getViewpoint();
                var mat_view = that._viewarea.getViewMatrix().inverse();
    			
    			var rotation = new x3dom.fields.Quaternion(0, 0, 1, 0);
    			rotation.setValue(mat_view);
    			var rot = rotation.toAxisAngle();
    			var translation = mat_view.e3();
    			
    			x3dom.debug.logInfo('\n&lt;Viewpoint position="' + translation.x.toFixed(5) + ' '
    			                    + translation.y.toFixed(5) + ' ' + translation.z.toFixed(5) + '" ' +
    								'orientation="' + rot[0].x.toFixed(5) + ' ' + rot[0].y.toFixed(5) + ' ' 
    								+ rot[0].z.toFixed(5) + ' ' + rot[1].toFixed(5) + '" \n\t' +
                                    'zNear="' + viewpoint.getNear().toFixed(5) + '" ' +
    								'zFar="' + viewpoint.getFar().toFixed(5) + '" ' +
    								'description="' + viewpoint._vf.description + '"&gt;' +
                                    '&lt;/Viewpoint&gt;');
            })();
            break;
        case 119: /* w, walk mode */
            nav.setType("walk", this._viewarea);
            break;
        case 121: /* y, freefly mode */
            nav.setType("freefly", this._viewarea);
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
