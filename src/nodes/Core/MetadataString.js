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
         * @x3d x.x
         * @component Core
         * @status experimental
         * @extends x3dom.nodeTypes.X3DMetadataObject
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.MetadataString.superClass.call(this, ctx);


            /**
             *
             * @var {MFString} value
             * @memberof x3dom.nodeTypes.MetadataString
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'value', []);
        
        }
    )
);