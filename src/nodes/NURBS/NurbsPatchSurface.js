/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2018 A. Plesch, Waltham, MA USA
 * Dual licensed under the MIT and GPL
 */
 /*
 * Ayam, a free 3D modeler for the RenderMan interface.
 *
 * Ayam is copyrighted 1998-2016 by Randolf Schultz
 * (randolf.schultz@gmail.com) and others.
 *
 * All rights reserved.
 *
 * See the file License for details.
 *
 */

/* ### NurbsPatchSurface ### */
x3dom.registerNodeType(
    "NurbsPatchSurface",
    "NURBS",
    defineClass(x3dom.nodeTypes.X3DNurbsSurfaceGeometryNode, //X3DComposedGeometryNode, 
    
        /**
         * Constructor for NurbsPatchSurface
         * @constructs x3dom.nodeTypes.NurbsPatchSurface
         * @x3d 3.3
         * @component NURBS
         * @status experimental
         * @extends x3dom.nodeTypes.X3DComposedGeometryNode //X3DNurbsSurfaceGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The NurbsPatchSurface node is a contiguous NURBS surface patch.
         */
    
        function (ctx) {
            x3dom.nodeTypes.NurbsPatchSurface.superClass.call(this, ctx);
            
            this._needReRender = true;
        },
        {
            nodeChanged: function() {
                x3dom.nodeTypes.NurbsTrimmedSurface.prototype.nodeChanged.call(this);
		            return;
            }
        }
    )
);
