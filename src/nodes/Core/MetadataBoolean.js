/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### MetadataBoolean ### */
x3dom.registerNodeType(
    "MetadataBoolean",
    "Core",
    defineClass(x3dom.nodeTypes.X3DMetadataObject,
        
        /**
         * Constructor for MetadataBoolean
         * @constructs x3dom.nodeTypes.MetadataBoolean
         * @x3d 3.3
         * @component Core
         * @status full
         * @extends x3dom.nodeTypes.X3DMetadataObject
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The metadata provided by this node is contained in the Boolean values of the value field.
         */
        function (ctx) {
            x3dom.nodeTypes.MetadataBoolean.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.MFBoolean} value
             * @memberof x3dom.nodeTypes.MetadataBoolean
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFBoolean(ctx, 'value', []);
        
        }
    )
);