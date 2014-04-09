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
         * @x3d x.x
         * @component Core
         * @status experimental
         * @extends x3dom.nodeTypes.X3DMetadataObject
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.MetadataSet.superClass.call(this, ctx);


            /**
             *
             * @var {MFNode} value
             * @memberof x3dom.nodeTypes.MetadataSet
             * @initvalue x3dom.nodeTypes.X3DMetadataObject
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('value', x3dom.nodeTypes.X3DMetadataObject);
        
        }
    )
);