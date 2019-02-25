/** @namespace x3dom */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C) 2017 Andreas Plesch
 * Dual licensed under the MIT and GPL
 */

/* ### WalkNavigation ### */

// use DefaultNavigation
x3dom.WalkNavigation = function(navigationNode)
{
    x3dom.DefaultNavigation.call(this, navigationNode);
};

x3dom.WalkNavigation.prototype = Object.create(x3dom.DefaultNavigation.prototype);
x3dom.WalkNavigation.prototype.constructor = x3dom.WalkNavigation; // necessary ?

// redefine onDrag
x3dom.WalkNavigation.prototype.onDrag = function(view, x, y, buttonState)
{
    var navi = this.navi;

    var navType = navi.getType();
    var navRestrict = navi.getExplorationMode(); // may not apply to walk mode ?

    if (navRestrict === 0) {
        return;
    }

    var viewpoint = view._scene.getViewpoint();

    var dx = x - view._lastX;
    var dy = y - view._lastY;
    
    //view._isMoving = true; // only for turntable,examine?

    view._dx = dx;
    view._dy = dy;

    view._lastX = x;
    view._lastY = y;
    // double check, probably not necessary
    if (navType === "walk") {return;}
    console.log("#### CHECK: in WalkNavigation but nav. type is not walk !");
};

// other event handlers from DefaultNavigation could also be simplified
