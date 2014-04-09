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
         * @x3d x.x
         * @component Texturing3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureCoordinateNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.TextureCoordinate3D.superClass.call(this, ctx);


            /**
             *
             * @var {MFVec3f} point
             * @memberof x3dom.nodeTypes.TextureCoordinate3D
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFVec3f(ctx, 'point', []);
        
        }
    )
);