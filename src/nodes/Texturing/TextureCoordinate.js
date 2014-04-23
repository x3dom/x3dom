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
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureCoordinateNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.TextureCoordinate.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.MFVec2f} point
             * @memberof x3dom.nodeTypes.TextureCoordinate
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFVec2f(ctx, 'point', []);
        
        }
    )
);