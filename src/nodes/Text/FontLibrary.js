/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### FontStyle ### */
x3dom.registerNodeType(
    "FontLibrary",
    "Text",
    defineClass( x3dom.nodeTypes.X3DNode,

        /**
         * Constructor for FontStyle
         * @constructs x3dom.nodeTypes.FontLibrary
         * @x3d 4.1
         * @component Text
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The FontLibrary node adds font file to the scene and names the font.
         */
        function ( ctx )
        {
            x3dom.nodeTypes.FontStyle.superClass.call( this, ctx );

            /**
             * Sets the font family name.
             * @var {x3dom.fields.SFString} family
             * @memberof x3dom.nodeTypes.FontLibrary
             * @initvalue ''
             * @field x3d
             * @instance
             */
            this.addField_SFString( ctx, "family", "" );

            /**
             * urls of web font files to use
             * @var {x3dom.fields.MFString} url
             * @memberof x3dom.nodeTypes.FontLibrary
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString( ctx, "url", [] );
        },
        {
            fieldChanged : function ( fieldName )
            {

            }
        }
    )
);