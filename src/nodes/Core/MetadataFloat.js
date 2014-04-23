/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### MetadataFloat ### */
x3dom.registerNodeType(
    "MetadataFloat",
    "Core",
    defineClass(x3dom.nodeTypes.X3DMetadataObject,
        
        /**
         * Constructor for MetadataFloat
         * @constructs x3dom.nodeTypes.MetadataFloat
         * @x3d 3.3
         * @component Core
         * @status full
         * @extends x3dom.nodeTypes.X3DMetadataObject
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The metadata provided by this node is contained in the single-precision floating point numbers of
         * the value field.
         */
        function (ctx) {
            x3dom.nodeTypes.MetadataFloat.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.MFFloat} value
             * @memberof x3dom.nodeTypes.MetadataFloat
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFFloat(ctx, 'value', []);
        
        }
    )
);