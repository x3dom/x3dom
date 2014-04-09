/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### MetadataDouble ### */
x3dom.registerNodeType(
    "MetadataDouble",
    "Core",
    defineClass(x3dom.nodeTypes.X3DMetadataObject,
        
        /**
         * Constructor for MetadataDouble
         * @constructs x3dom.nodeTypes.MetadataDouble
         * @x3d x.x
         * @component Core
         * @status experimental
         * @extends x3dom.nodeTypes.X3DMetadataObject
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.MetadataDouble.superClass.call(this, ctx);


            /**
             *
             * @var {MFDouble} value
             * @memberof x3dom.nodeTypes.MetadataDouble
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFDouble(ctx, 'value', []);
        
        }
    )
);