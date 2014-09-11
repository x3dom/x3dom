/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### MetadataSet ### */
x3dom.registerNodeType(
    "MetadataSet",
    "Core",
    defineClass(x3dom.nodeTypes.X3DMetadataObject,
        
        /**
         * Constructor for MetadataSet
         * @constructs x3dom.nodeTypes.MetadataSet
         * @x3d 3.3
         * @component Core
         * @status full
         * @extends x3dom.nodeTypes.X3DMetadataObject
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The metadata provided by this node is contained in the metadata nodes of the value field.
         */
        function (ctx) {
            x3dom.nodeTypes.MetadataSet.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.MFNode} value
             * @memberof x3dom.nodeTypes.MetadataSet
             * @initvalue x3dom.nodeTypes.X3DMetadataObject
             * @field x3d
             * @instance
             */
            this.addField_MFNode('value', x3dom.nodeTypes.X3DMetadataObject);
        
        }
    )
);