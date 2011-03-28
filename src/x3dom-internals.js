/*!
* x3dom javascript library 0.1
* http://x3dom.org/
*
* Copyright (c) 2009 Peter Eschler, Johannes Behr, Yvonne Jung
*     based on code originally provided by Philip Taylor:
*     http://philip.html5.org
* Dual licensed under the MIT and GPL licenses.
*/



////// THIS SHOULD GO TO src/x3dom.js, but current buildsystem overwrites it, so it's palced here >>>>>>>>>>>>>
/*
 * Namespace: x3dom
 *
 * Namepsace container for x3dom objects.
 */
var x3dom = {
    canvases: []
};

x3dom.x3dNS = 'http://www.web3d.org/specifications/x3d-namespace'; // non-standard, but sort of supported by Xj3D
x3dom.x3dextNS = 'http://philip.html5.org/x3d/ext';
x3dom.xsltNS = 'http://www.w3.org/1999/XSL/x3dom.Transform';
x3dom.xhtmlNS = 'http://www.w3.org/1999/xhtml';
// <<<<<<<<<<<<<


/*
 *	Function: x3dom.extend
 *
 *	Returns a prototype object suitable for extending the given class
 *	_f_. Rather than constructing a new instance of _f_ to serve as
 *	the prototype (which unnecessarily runs the constructor on the created
 *	prototype object, potentially polluting it), an anonymous function is
 *	generated internally that shares the same prototype:
 *
 *	Parameters:
 *
 *   	f - Method f a constructor
 *
 *	Returns:
 *
 * 		A suitable prototype object
 *
 *	See Also:
 *
 *		Douglas Crockford's essay on <prototypical inheritance at http://javascript.crockford.com/prototypal.html>.
 */
x3dom.extend = function(f) {
  function g() {}
  g.prototype = f.prototype || f;
  return new g();
};



/**
 * Function x3dom.getStyle
 * 
 * Computes the value of the specified CSS property <tt>p</tt> on the
 * specified element <tt>e</tt>.
 *
 * Parameters:
 *     oElm       - The element on wich to compute the CSS property
 *     strCssRule - The name of the CSS property
 *
 *	Returns:
 *
 * 		The computed value of the CSS property
 */
x3dom.getStyle = function(oElm, strCssRule) {
    var strValue;
    if(window && window.getComputedStyle){
        //strValue = window.getComputedStyle(oElm).webkitTransform;
        //strValue = window.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
        strValue = window.getComputedStyle(oElm, "")[strCssRule];
    }
    else if(oElm.currentStyle){
        strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){ return p1.toUpperCase(); });
        strValue = oElm.currentStyle[strCssRule];
    }
    return strValue;
};

/**
 * Provides requestAnimationFrame in a cross browser way.
 * https://cvs.khronos.org/svn/repos/registry/trunk/public/webgl/sdk/demos/common/webgl-utils.js
 */
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
    	   window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           window.oRequestAnimationFrame ||
           window.msRequestAnimationFrame ||
           function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
             window.setTimeout(callback, 1000/60);
           };
})();
