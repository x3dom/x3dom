/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### TextureCoordinate ### */
x3dom.registerNodeType(
    "TextureCoordinate",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureCoordinateNode,
        
        /**
         * Constructor for TextureCoordinate
         * @constructs x3dom.nodeTypes.TextureCoordinate
         * @x3d 3.3
         * @component Texturing
         * @status full
         * @extends x3dom.nodeTypes.X3DTextureCoordinateNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The TextureCoordinate node is a geometry property node that specifies a set of 2D texture coordinates used by vertex-based geometry nodes (EXAMPLE  IndexedFaceSet and ElevationGrid) to map textures to vertices.
         */
        function (ctx) {
            x3dom.nodeTypes.TextureCoordinate.superClass.call(this, ctx);


            /**
             * Specifies the array of texture coordinates.
             * @var {x3dom.fields.MFVec2f} point
             * @memberof x3dom.nodeTypes.TextureCoordinate
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec2f(ctx, 'point', []);
        
        }
    )
);