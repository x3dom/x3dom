/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### MetadataInteger ### */
x3dom.registerNodeType(
    "MetadataInteger",
    "Core",
    defineClass(x3dom.nodeTypes.X3DMetadataObject,
        
        /**
         * Constructor for MetadataInteger
         * @constructs x3dom.nodeTypes.MetadataInteger
         * @x3d x.x
         * @component Core
         * @status experimental
         * @extends x3dom.nodeTypes.X3DMetadataObject
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.MetadataInteger.superClass.call(this, ctx);


            /**
             *
             * @var {MFInt32} value
             * @memberof x3dom.nodeTypes.MetadataInteger
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFInt32(ctx, 'value', []);
        
        }
    )
);