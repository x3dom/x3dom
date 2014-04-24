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
         * @x3d 3.3
         * @component Texturing
         * @status full
         * @extends x3dom.nodeTypes.X3DTextureCoordinateNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc TextureCoordinateGenerator supports the automatic generation of texture coordinates for geometric shapes.
         */
        function (ctx) {
            x3dom.nodeTypes.TextureCoordinateGenerator.superClass.call(this, ctx);


            /**
             * The mode field describes the algorithm used to compute texture coordinates.
             * @var {x3dom.fields.SFString} mode
             * @memberof x3dom.nodeTypes.TextureCoordinateGenerator
             * @initvalue "SPHERE"
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'mode', "SPHERE");

            /**
             * Specify the parameters. These are mode dependent.
             * @var {x3dom.fields.MFFloat} parameter
             * @memberof x3dom.nodeTypes.TextureCoordinateGenerator
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFFloat(ctx, 'parameter', []);
        
        }
    )
);