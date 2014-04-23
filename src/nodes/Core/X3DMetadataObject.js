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
         * @x3d 3.3
         * @component Core
         * @status full
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This abstract interface is the basis for all metadata nodes. The interface is inherited by
         * all metadata nodes.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DMetadataObject.superClass.call(this, ctx);


            /**
             * The specification of a non-empty value for the name field is required.
             * @var {x3dom.fields.SFString} name
             * @memberof x3dom.nodeTypes.X3DMetadataObject
             * @initvalue ""
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");

            /**
             * The specification of the reference field is optional. If provided, it identifies the metadata standard
             * or other specification that defines the name field. If the reference field is not provided or is empty,
             * the meaning of the name field is considered implicit to the characters in the string.
             * @var {x3dom.fields.SFString} reference
             * @memberof x3dom.nodeTypes.X3DMetadataObject
             * @initvalue ""
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'reference', "");
        
        }
    )
);