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
 * Class: x3dom.runtime
 *
 * Runtime proxy object to get and set runtime parameters. This object
 * is attached to each X3D element and can be used in the following manner:
 *
 * > var e = document.getElementById('the_x3delement');
 * > e.runtime.showAll();
 * > e.runtime.resetView();
 * > ...
 */

// Global runtime
x3dom.runtime = {};


x3dom.Runtime = function(doc, canvas) {
    this.doc = doc;
    this.canvas = canvas;
    this.isReady = false;
};

x3dom.Runtime.prototype.initialize = function(doc, canvas) {
    this.doc = doc;
    this.canvas = canvas;

    // place to hold configuration data, i.e. fash backend path, etc.
    // format and structure needs to be decided.
    this.config = { };
    this.isReady = false;
};


/**
 * APIFunction: ready
 *
 * This method is called once the system initialized and is ready to render
 * the first time. It is therefore possible to execute custom
 * action by overriding this method in your code:
 *
 * > x3dom.runtime.ready = function() {
 * >    alert("About to render something the first time");
 * > }
 *
 * It is important to create this override before the document onLoad event has fired.
 * Therefore putting it directly under the inclusion of x3dom.js is the preferred
 * way to ensure overloading of this function.
 *
 * Parameters:
 * 		element - The x3d element this handler is acting upon
 */
x3dom.Runtime.prototype.ready = function() {
    x3dom.debug.logInfo('System ready.');
};

/**
 * APIFunction: enterFrame
 *
 * This method is called just before the next frame is
 * rendered. It is therefore possible to execute custom
 * action by overriding this method in your code:
 *
 * > var element = document.getElementById('my_element');
 * > element.runtime.enterFrame = function() {
 *     alert('hello custom enter frame');
 * };
 *
 * If you have more than one X3D element in your HTML
 * During initialization, just after ready() executed and before the very first frame
 * is rendered, only the global override of this method works. If you need to execute
 * code before the first frame renders, it is therefore best to use the ready()
 * function instead.
 *
 * Parameters:
 * 		element - The x3d element this handler is acting upon
 */
x3dom.Runtime.prototype.enterFrame = function() {
    //x3dom.debug.logInfo('Render frame imminent');
    // to be overwritten by user
},

/**
 * APIFunction: getActiveBindable
 *
 * Returns the currently active bindable DOM element of the given type.
 * typeName must be a valid Bindable node (e.g. Viewpoint, Background, etc.).
 *
 * For example:
 *
 *   > var element, bindable;
 *   > element = doucment.getElementById('the_x3delement');
 *   > bindable = element.runtime.getActiveBindable('background');
 *   > bindable.setAttribute('set_bind', 'false');
 *
 * Parameters:
 * 		typeName - bindable type name
 *
 * Returns:
 * 		The active DOM element
 */
x3dom.Runtime.prototype.getActiveBindable = function(typeName) {
    var stacks;
    var i, current, result;
    var type;

    stacks = this.canvas.doc._bindableBag._stacks;
    result = [];

    type = x3dom.nodeTypesLC[typeName.toLowerCase()];

    if (!type) {
        x3dom.debug.logError('No node of type "' + typeName + '" found');
        return null;
    }

    for (i=0; i < stacks.length; i++) {
        current = stacks[i].getActive();
//			if (x3dom.isa(current, x3dom.nodeTypes.X3DBindableNode)) {
            if (current._xmlNode !== undefined && x3dom.isa(current, type) ) {
                result.push(current);
            }
//			}
    }
    return result[0] ? result[0]._xmlNode : null;
};

/**
 * APIFunction: nextView
 *
 * Navigates tho the next viewpoint
 *
 */
x3dom.Runtime.prototype.nextView = function() {
    var stack = this.canvas.doc._scene.getViewpoint()._stack;
    if (stack) {
        stack.switchTo('next');
    } else {
        x3dom.debug.logError('No valid ViewBindable stack.');
    }
};

/**
 * APIFunction: prevView
 *
 * Navigates tho the previous viewpoint
 *
 */
x3dom.Runtime.prototype.prevView = function() {
    var stack = this.canvas.doc._scene.getViewpoint()._stack;
    if (stack) {
        stack.switchTo('prev');
    } else {
        x3dom.debug.logError('No valid ViewBindable stack.');
    }
};

/**
 * Function: viewpoint
 *
 * Returns the current viewpoint.
 *
 * Returns:
 * 		The viewpoint
 */
x3dom.Runtime.prototype.viewpoint = function() {
    return this.canvas.doc._scene.getViewpoint();
};

/**
 * Function: projectionMatrix
 *
 * Returns the current projection matrix.
 *
 * Returns:
 * 		Matrix object
 */
x3dom.Runtime.prototype.pojectionMatrix = function() {
    return this.canvas.doc._viewarea.getProjectionMatrix();
};

/**
 * Function: lightMatrix
 *
 * Returns the current light matrix.
 *
 * Returns:
 * 		The light matrix
 */
x3dom.Runtime.prototype.lightMatrix = function() {
    this.canvas.doc._viewarea.getLightMatrix();
};

/**
 * APIFunction: resetView
 *
 * Resets the view to initial.
 *
 */
x3dom.Runtime.prototype.resetView = function() {
    this.canvas.doc._viewarea.resetView();
};

/**
 * Function: lightView
 *
 * Navigates to the light, if any.
 *
 * Returns:
 * 		True if navigation was possible, false otherwise.
 */
x3dom.Runtime.prototype.lightView = function() {
    if (this.canvas.doc._nodeBag.lights.length > 0) {
        this.canvas.doc._viewarea.animateTo(this.canvas.doc._viewarea.getLightMatrix()[0],
                                            this.canvas.doc._scene.getViewpoint());
        return true;
    } else {
        x3dom.debug.logInfo("No lights to navigate to");
        return false;
    }
};

/**
 * APIFunction: uprightView
 *
 * Navigates to upright view
 *
 */
x3dom.Runtime.prototype.uprightView = function() {
    this.canvas.doc._viewarea.uprightView();
};

/**
 * APIFunction: showAll
 *
 * Zooms so that all objects are fully visible.
 *
 */
x3dom.Runtime.prototype.showAll = function() {
    this.canvas.doc._viewarea.showAll();
};

/**
 * APIFunction: debug
 *
 * Displays or hides the debug window. If parameter is omitted,
 * the current visibility status is returned.
 *
 * Parameter:
 *     show - true to show debug window, false to hide
 *
 * Returns:
 *     Current visibility status of debug window (true=visible, false=hidden)
 */
x3dom.Runtime.prototype.debug = function(show) {
    if (show === true) {
        this.canvas.doc._viewarea._visDbgBuf = true;
        x3dom.debug.logContainer.style.display = "block";
        this.canvas.doc.needRender = true;
    }
    if (show === false) {
        this.canvas.doc._viewarea._visDbgBuf = false;
        x3dom.debug.logContainer.style.display = "none";
        this.canvas.doc.needRender = true;
    }
    return this.canvas.doc._viewarea._visDbgBuf;
};

/**
 * APIFunction: navigationType
 *
 * Readout of the currently active navigation.
 *
 * Returns:
 *     A string representing the active navigation type
 */
x3dom.Runtime.prototype.navigationType = function() {
    return this.canvas.doc._scene.getNavigationInfo().getType();
};


/**
 * APIFunction: examine
 *
 * Switches to examine mode
 */
x3dom.Runtime.prototype.examine = function() {
    this.canvas.doc._scene.getNavigationInfo().setType("examine");
};

/**
 * APIunction: fly
 *
 * Switches to fly mode
 */
x3dom.Runtime.prototype.fly = function() {
    this.canvas.doc._scene.getNavigationInfo().setType("fly");
};

/**
 * APIFunction: lookAt
 *
 * Switches to lookAt mode
 */
x3dom.Runtime.prototype.lookAt = function() {
    this.canvas.doc._scene.getNavigationInfo().setType("lookat");
};
/**
 * APIFunction: lookAround
 *
 * Switches to lookAround mode
 */
x3dom.Runtime.prototype.lookAround = function() {
    this.canvas.doc._scene.getNavigationInfo().setType("lookaround");
};

/**
 * APIFunction: walk
 *
 * Switches to walk mode
 */
x3dom.Runtime.prototype.walk = function() {
    this.canvas.doc._scene.getNavigationInfo().setType("walk");
};

/**
 * APIFunction: game
 *
 * Switches to game mode
 */
x3dom.Runtime.prototype.game = function() {
    this.canvas.doc._scene.getNavigationInfo().setType("game");
};

/**
 * Function: resetExamin
 *
 * Resets all variables required by examin mode to init state
 */
 x3dom.Runtime.prototype.resetExamin = function() {
		this.canvas.doc._viewarea._rotMat = x3dom.fields.SFMatrix4f.identity();
    	this.canvas.doc._viewarea._transMat = x3dom.fields.SFMatrix4f.identity();
    	this.canvas.doc._viewarea._movement = new x3dom.fields.SFVec3f(0, 0, 0);
		this.canvas.doc.needRender = true;
 };

/**
 * Function: togglePoints
 *
 * Toggles points attribute
 */
x3dom.Runtime.prototype.togglePoints = function() {
    this.canvas.doc._viewarea._points = !this.canvas.doc._viewarea._points;
    this.canvas.doc.needRender = true;
};

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
x3dom.Runtime.prototype.pickMode = function(options) {
    if (options && options.internal === true) {
        return this.canvas.doc._scene._vf.pickMode;
    }
    return this.canvas.doc._scene._vf.pickMode.toLowerCase();
};

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
x3dom.Runtime.prototype.changePickMode = function(type, options) {

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
};

/**
 * APIFunction: speed
 *
 *	Get the current speed value. If parameter is given the new speed value is set.
 *
 * Parameters:
 *		newSpeed - The new speed value (optional)
 *
 * Returns:
 * 		The current speed value
 */
x3dom.Runtime.prototype.speed = function(newSpeed) {
    if (newSpeed) {
        this.canvas.doc._scene.getNavigationInfo()._vf.speed = newSpeed;
        x3dom.debug.logInfo("Changed navigation speed to " + this.canvas.doc._scene.getNavigationInfo()._vf.speed);
    }
    return this.canvas.doc._scene.getNavigationInfo()._vf.speed;
};

/**
 * APIFunction: statistics
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
x3dom.Runtime.prototype.statistics = function(mode) {
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
};

/**
 * Function: processIndicator
 *
 * Enable or disable the process indicator. If parameter is omitted, this method
 * only returns the the visibility status of the statistics info overlay.
 *
 * Parameters:
 *		mode - true or false. To enable or disable the process indicator
 *
 * Returns:
 * 		The current visibility of the process indicator info (true = visible, false = invisible)
 */
x3dom.Runtime.prototype.processIndicator = function(mode) {
    var processDiv = this.canvas.processDiv;
    if (processDiv) {

        if (mode === true) {
            processDiv.style.display = 'inline';
            return true;
        }
        if (mode === false) {
            processDiv.style.display = 'none';
            return false;
        }

        // if no parameter is given return current status (false = not visible, true = visible)
        return processDiv.style.display != 'none'
    }
},


x3dom.Runtime.prototype.properties = function() {
    return this.canvas.doc.properties;
};

x3dom.Runtime.prototype.backendName = function() {
    return this.canvas.backend;
};



