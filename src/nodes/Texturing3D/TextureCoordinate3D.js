/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### TextureCoordinate3D ### */
x3dom.registerNodeType(
    "TextureCoordinate3D",
    "Texturing3D",
    defineClass(x3dom.nodeTypes.X3DTextureCoordinateNode,
        
        /**
         * Constructor for TextureCoordinate3D
         * @constructs x3dom.nodeTypes.TextureCoordinate3D
         * @x3d 3.3
         * @component Texturing3D
         * @status full
         * @extends x3dom.nodeTypes.X3DTextureCoordinateNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The TextureCoordinate3D node is a geometry property node that specifies a set of 3D texture coordinates used by vertex-based geometry nodes (e.g., IndexedFaceSet and ElevationGrid) to map 3D textures to vertices.
         */
        function (ctx) {
            x3dom.nodeTypes.TextureCoordinate3D.superClass.call(this, ctx);


            /**
             * Specifies the array of texture coordinates.
             * @var {x3dom.fields.MFVec3f} point
             * @memberof x3dom.nodeTypes.TextureCoordinate3D
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec3f(ctx, 'point', []);
        
        }
    )
);