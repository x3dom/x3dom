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
         * @x3d 3.3
         * @component Core
         * @status full
         * @extends x3dom.nodeTypes.X3DMetadataObject
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The metadata provided by this node is contained in the double-precision floating point numbers of
         * the value field.
         */
        function (ctx) {
            x3dom.nodeTypes.MetadataDouble.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.MFDouble} value
             * @memberof x3dom.nodeTypes.MetadataDouble
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFDouble(ctx, 'value', []);
        
        }
    )
);