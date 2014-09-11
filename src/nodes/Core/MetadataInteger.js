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
         * @x3d 3.3
         * @component Core
         * @status full
         * @extends x3dom.nodeTypes.X3DMetadataObject
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The metadata provided by this node is contained in the integers of the value field.
         */
        function (ctx) {
            x3dom.nodeTypes.MetadataInteger.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.MFInt32} value
             * @memberof x3dom.nodeTypes.MetadataInteger
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFInt32(ctx, 'value', []);
        
        }
    )
);