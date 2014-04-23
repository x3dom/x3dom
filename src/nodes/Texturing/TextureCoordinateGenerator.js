/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### TextureCoordinateGenerator ### */
x3dom.registerNodeType(
    "TextureCoordinateGenerator",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureCoordinateNode,
        
        /**
         * Constructor for TextureCoordinateGenerator
         * @constructs x3dom.nodeTypes.TextureCoordinateGenerator
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureCoordinateNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.TextureCoordinateGenerator.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.SFString} mode
             * @memberof x3dom.nodeTypes.TextureCoordinateGenerator
             * @initvalue "SPHERE"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'mode', "SPHERE");

            /**
             *
             * @var {x3dom.fields.MFFloat} parameter
             * @memberof x3dom.nodeTypes.TextureCoordinateGenerator
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'parameter', []);
        
        }
    )
);