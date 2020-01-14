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

/* ### NurbsTrimmedSurface ### */
x3dom.registerNodeType(
    "NurbsTrimmedSurface",
    "NURBS",
    defineClass( x3dom.nodeTypes.X3DNurbsSurfaceGeometryNode, //NurbsPatchSurface

        /**
         * Constructor for NurbsTrimmedSurface
         * @constructs x3dom.nodeTypes.NurbsTrimmedSurface
         * @x3d 3.3
         * @component NURBS
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNurbsSurfaceGeometryNode //NurbsPatchSurface
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The NurbsTrimmedSurface node defines a NURBS surface that is trimmed by a set of trimming loops.
         */

        function ( ctx )
        {
            x3dom.nodeTypes.NurbsTrimmedSurface.superClass.call( this, ctx );

            /**
             * The trimmingContour field, if specified, shall contain a set of Contour2D nodes. Trimming loops shall be processed
             * as described for the Contour2D node. If no trimming contours are defined, the NurbsTrimmedSurface node shall have
             * the same semantics as the NurbsPatchSurface node.
             * @var {x3dom.fields.MFNode} trimmingContour
             * @memberof x3dom.nodeTypes.NurbsTrimmedSurface
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFNode( "trimmingContour", x3dom.nodeTypes.Contour2D );

            this._needReRender = true;
        },
        {

        }
    )
);
