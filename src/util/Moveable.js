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
 *  Moveable interface, wraps x3d bounded node with SpaceSensor-like movement functionality,
 *  therefore attaches event handlers, thus to be called earliest in document.onload method.
 *
 *  Cleanup backrefs and listeners on delete by explicitly calling detachHandlers()
 */
x3dom.Moveable = function(x3domElem, boundedObj, callback) {
    this._x3domRoot = x3domElem;
    this._runtime = x3domElem.runtime;

    // callback function for notifying changes
    this._callback = callback;

    this._moveable = boundedObj;
    this._drag = false;

    this._w = 0;
    this._h = 0;

    this._uPlane = null;
    this._vPlane = null;
    this._pPlane = null;

    this._isect = null;
    this._translationOffset = null;

    this._lastX = 0;
    this._lastY = 0;
    this._buttonState = 0;

    this._firstRay = null;
    this._matrixTrafo = null;

    this.attachHandlers();
};

x3dom.Moveable.prototype.attachHandlers = function() {
    // add backref to movable object (for member access and wrapping)
    this._moveable._iMove = this;

    // add backref to <x3d> element
    if (!this._x3domRoot._iMove)
        this._x3domRoot._iMove = [];
    this._x3domRoot._iMove.push(this);

    // mouse events
    this._moveable.addEventListener('mousedown', this.start, false);
    this._moveable.addEventListener('mouseover', this.over, false);
    this._moveable.addEventListener('mouseout', this.out, false);

    if (this._x3domRoot._iMove.length == 1) {
        // more mouse events
        this._x3domRoot.addEventListener('mouseup', this.stop, false);
        this._x3domRoot.addEventListener('mouseout', this.stop, false);
        this._x3domRoot.addEventListener('mousemove', this.move, true);

        // mozilla touch events
        this._x3domRoot.addEventListener('MozTouchDown', this.touchStartHandlerMoz, false);
        this._x3domRoot.addEventListener('MozTouchMove', this.touchMoveHandlerMoz, true);
        this._x3domRoot.addEventListener('MozTouchUp', this.touchEndHandlerMoz, false);
        // w3c / apple touch events
        this._x3domRoot.addEventListener('touchstart', this.touchStartHandler, false);
        this._x3domRoot.addEventListener('touchmove', this.touchMoveHandler, true);
        this._x3domRoot.addEventListener('touchend', this.touchEndHandler, false);
    }
};

x3dom.Moveable.prototype.detachHandlers = function() {
    // remove backref to <x3d> element
    var iMove = this._x3domRoot._iMove;
    if (iMove) {
        for (var i=0, n=iMove.length; i<n; i++) {
            if (iMove[i] == this) {
                iMove.splice(i, 1);
                break;
            }
        }
    }

    // mouse events
    this._moveable.removeEventListener('mousedown', this.start, false);
    this._moveable.removeEventListener('mouseover', this.over, false);
    this._moveable.removeEventListener('mouseout', this.out, false);

    if (iMove.length == 0) {
        // more mouse events
        this._x3domRoot.removeEventListener('mouseup', this.stop, false);
        this._x3domRoot.removeEventListener('mouseout', this.stop, false);
        this._x3domRoot.removeEventListener('mousemove', this.move, true);

        // touch events
        this._x3domRoot.removeEventListener('MozTouchDown', this.touchStartHandlerMoz, false);
        this._x3domRoot.removeEventListener('MozTouchMove', this.touchMoveHandlerMoz, true);
        this._x3domRoot.removeEventListener('MozTouchUp', this.touchEndHandlerMoz, false);
        // mozilla version
        this._x3domRoot.removeEventListener('touchstart', this.touchStartHandler, false);
        this._x3domRoot.removeEventListener('touchmove', this.touchMoveHandler, true);
        this._x3domRoot.removeEventListener('touchend', this.touchEndHandler, false);
    }

    // finally remove backref to movable object
    if (this._moveable._iMove)
        delete this._moveable._iMove;
};

// calculate viewing plane
x3dom.Moveable.prototype.calcViewPlane = function(origin) {
    // init width and height
    this._w = this._runtime.getWidth();
    this._h = this._runtime.getHeight();

    //bottom left of viewarea
    var ray = this._runtime.getViewingRay(0, this._h - 1);
    var r = ray.pos.add(ray.dir);

    //bottom right of viewarea
    ray = this._runtime.getViewingRay(this._w - 1, this._h - 1);
    var s = ray.pos.add(ray.dir);

    //top left of viewarea
    ray = this._runtime.getViewingRay(0, 0);
    var t = ray.pos.add(ray.dir);

    this._uPlane = s.subtract(r).normalize();
    this._vPlane = t.subtract(r).normalize();

    if (arguments.length === 0)
        this._pPlane = r;
    else
        this._pPlane = x3dom.fields.SFVec3f.copy(origin);
};

// helper method to obtain determinant
x3dom.Moveable.prototype.det = function(mat) {
    return mat[0][0] * mat[1][1] * mat[2][2] + mat[0][1] * mat[1][2] * mat[2][0] +
           mat[0][2] * mat[2][1] * mat[1][0] - mat[2][0] * mat[1][1] * mat[0][2] -
           mat[0][0] * mat[2][1] * mat[1][2] - mat[1][0] * mat[0][1] * mat[2][2];
};

// Translation along plane parallel to viewing plane E:x=p+t*u+s*v
x3dom.Moveable.prototype.translateXY = function(l) {
    var track = null;
    var z = [], n = [];

    for (var i = 0; i < 3; i++) {
        z[i] = [];
        n[i] = [];

        z[i][0] = this._uPlane.at(i);
        n[i][0] = z[i][0];

        z[i][1] = this._vPlane.at(i);
        n[i][1] = z[i][1];

        z[i][2] = (l.pos.subtract(this._pPlane)).at(i);
        n[i][2] = -l.dir.at(i);
    }

    // get intersection line-plane with Cramer's rule
    var s = this.det(n);

    if (s !== 0) {
        var t = this.det(z) / s;
        track = l.pos.addScaled(l.dir, t);
    }

    if (track) {
        if (this._isect) {
            // calc offset from first click position
            track = track.subtract(this._isect);
        }
        track = track.add(this._translationOffset);
    }

    return track;
};

// Translation along picking ray
x3dom.Moveable.prototype.translateZ = function(l, currY) {
    var vol = this._runtime.getSceneBBox();

    var sign = (currY < this._lastY) ? 1 : -1;
    var fact = sign * (vol.max.subtract(vol.min)).length() / 100;

    this._translationOffset = this._translationOffset.addScaled(l.dir, fact);

    return this._translationOffset;
};

x3dom.Moveable.prototype.over = function(event) {
    var that = this._iMove;

    that._runtime.getCanvas().style.cursor = "crosshair";
};

x3dom.Moveable.prototype.out = function(event) {
    var that = this._iMove;

    if (!that._drag)
        that._runtime.getCanvas().style.cursor = "pointer";
};

// start object movement, switch from navigation to interaction
x3dom.Moveable.prototype.start = function(event) {
    var that = this._iMove;

    if (!that._drag) {
        that._lastX = event.layerX;
        that._lastY = event.layerY;

        that._drag = true;

        // temporarily disable navigation
        that._runtime.noNav();

        // calc view-aligned plane through original pick position
        that._isect = new x3dom.fields.SFVec3f(event.worldX, event.worldY, event.worldZ);
        that.calcViewPlane(that._isect);

        that._firstRay = that._runtime.getViewingRay(event.layerX, event.layerY);

        // use mouse button to distinguish between parallel or orthogonal movement
        that._buttonState = event.button;

        var mTrans = that._moveable.getAttribute("translation");
        that._matrixTrafo = null;

        if (mTrans) {
            that._translationOffset = x3dom.fields.SFVec3f.parse(mTrans);
        }
        else {
            mTrans = that._moveable.getAttribute("matrix");

            if (mTrans) {
                that._matrixTrafo = x3dom.fields.SFMatrix4f.parse(mTrans).transpose();
                that._translationOffset = that._matrixTrafo.e3();
            }
            else
                that._translationOffset = new x3dom.fields.SFVec3f(0, 0, 0);
        }

        that._runtime.getCanvas().style.cursor = "crosshair";
    }
};

x3dom.Moveable.prototype.move = function(event) {
    for (var i=0, n=this._iMove.length; i<n; i++) {
        var that = this._iMove[i];

        if (that._drag) {
            var pos = that._runtime.mousePosition(event);
            var ray = that._runtime.getViewingRay(pos[0], pos[1]);

            var track = null;

            // zoom with right mouse button (middle: 4, left: 1)
            if (that._buttonState == 2)
                track = that.translateZ(that._firstRay, pos[1]);
            else
                track = that.translateXY(ray);
            // TODO; what about object rotation like SpaceSensor?

            if (track) {
                if (!that._matrixTrafo)
                    that._moveable.setAttribute("translation", track.toString());
                else {
                    that._matrixTrafo.setTranslate(track);
                    that._moveable.setAttribute("matrix", that._matrixTrafo.toGL().toString());
                }

                if (that._callback) {
                    that._callback(that._moveable, track);
                }
            }

            that._lastX = pos[0];
            that._lastY = pos[1];
        }
    }
};

// stop object movement, switch from interaction to navigation
x3dom.Moveable.prototype.stop = function(event) {
    for (var i=0, n=this._iMove.length; i<n; i++) {
        var that = this._iMove[i];

        if (that._drag) {
            that._lastX = event.layerX;
            that._lastY = event.layerY;

            that._isect = null;
            that._drag = false;

            // we're done, re-enable navigation
            // TODO; set original navigation mode
            that._runtime.examine();

            that._runtime.getCanvas().style.cursor = "pointer";
        }
    }
};

// TODO: impl. special (multi-)touch event stuff
// === Touch Start (W3C) ===
x3dom.Moveable.prototype.touchStartHandler = function (evt) {
    evt.preventDefault();
};

// === Touch Start Moz (Firefox has other touch interface) ===
x3dom.Moveable.prototype.touchStartHandlerMoz = function (evt) {
    evt.preventDefault();
};

// === Touch Move ===
x3dom.Moveable.prototype.touchMoveHandler = function (evt) {
    evt.preventDefault();
};

// === Touch Move Moz ===
x3dom.Moveable.prototype.touchMoveHandlerMoz = function (evt) {
    evt.preventDefault();
};

// === Touch End ===
x3dom.Moveable.prototype.touchEndHandler = function (evt) {
    if (this._iMove.length) {
        var that = this._iMove[0];
        // mouse start code is called, but not stop
        that.stop.apply(that._x3domRoot, [evt]);
    }
    evt.preventDefault();
};

// === Touch End Moz ===
x3dom.Moveable.prototype.touchEndHandlerMoz = function (evt) {
    if (this._iMove.length) {
        var that = this._iMove[0];
        that.stop.apply(that._x3domRoot, [evt]);
    }
    evt.preventDefault();
};
