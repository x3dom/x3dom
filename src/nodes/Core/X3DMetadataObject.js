/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DMetadataObject ### */
x3dom.registerNodeType(
    "X3DMetadataObject",
    "Core",
    defineClass(x3dom.nodeTypes.X3DNode,
        
        /**
         * Constructor for X3DMetadataObject
         * @constructs x3dom.nodeTypes.X3DMetadataObject
         * @x3d x.x
         * @component Core
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DMetadataObject.superClass.call(this, ctx);


            /**
             *
             * @var {SFString} name
             * @memberof x3dom.nodeTypes.X3DMetadataObject
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");

            /**
             *
             * @var {SFString} reference
             * @memberof x3dom.nodeTypes.X3DMetadataObject
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'reference', "");
        
        }
    )
);