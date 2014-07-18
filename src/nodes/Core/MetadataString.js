/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### MetadataString ### */
x3dom.registerNodeType(
    "MetadataString",
    "Core",
    defineClass(x3dom.nodeTypes.X3DMetadataObject,
        
        /**
         * Constructor for MetadataString
         * @constructs x3dom.nodeTypes.MetadataString
         * @x3d 3.3
         * @component Core
         * @status full
         * @extends x3dom.nodeTypes.X3DMetadataObject
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The metadata provided by this node is contained in the strings of the value field.
         */
        function (ctx) {
            x3dom.nodeTypes.MetadataString.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.MFString} value
             * @memberof x3dom.nodeTypes.MetadataString
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'value', []);
        
        }
    )
);