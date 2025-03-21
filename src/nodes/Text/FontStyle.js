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
    "FontStyle",
    "Text",
    defineClass( x3dom.nodeTypes.X3DFontStyleNode,

        /**
         * Constructor for FontStyle
         * @constructs x3dom.nodeTypes.FontStyle
         * @x3d 3.3
         * @component Text
         * @status full
         * @extends x3dom.nodeTypes.X3DFontStyleNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The FontStyle node defines the size, family, and style used for Text nodes, as well as the direction of the text strings and any language-specific rendering techniques used for non-English text.
         */
        function ( ctx )
        {
            x3dom.nodeTypes.FontStyle.superClass.call( this, ctx );

            /**
             * Defines the text family.
             * @var {x3dom.fields.MFString} family
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue ['SERIF']
             * @field x3d
             * @instance
             */
            this.addField_MFString( ctx, "family", [ "SERIF" ] );

            /**
             * Specifies whether the text is shown horizontally or vertically.
             * @var {x3dom.fields.SFBool} horizontal
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool( ctx, "horizontal", true );

            /**
             * Specifies where the text is anchored. The default of ["BEGIN", "FIRST"] is the ISO spec. default. It deviates
             * from ["MIDDLE", "MIDDLE"], the older x3dom default which may require scene tuning.
             * @var {x3dom.fields.MFString} justify
             * @range ["BEGIN","END","FIRST","MIDDLE",""]
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue ['BEGIN', 'FIRST']
             * @field x3d
             * @instance
             */
            this.addField_MFString( ctx, "justify", [ "BEGIN", "FIRST" ] );

            /**
             * The language field specifies the context of the language for the text string in the form of a language and a country in which that language is used.
             * @var {x3dom.fields.SFString} language
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue ""
             * @field x3d
             * @instance
             */
            this.addField_SFString( ctx, "language", "" );

            /**
             * Specifies whether the text is shown from left to right or from right to left.
             * @var {x3dom.fields.SFBool} leftToRight
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool( ctx, "leftToRight", true );

            /**
             * Sets the size of the text.
             * @var {x3dom.fields.SFFloat} size
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue 1.0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat( ctx, "size", 1.0 );

            /**
             * Sets the spacing between lines of text, relative to the text size.
             * @var {x3dom.fields.SFFloat} spacing
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue 1.0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat( ctx, "spacing", 1.0 );

            /**
             * Sets the text style.
             * @var {x3dom.fields.SFString} style
             * @range ["PLAIN","BOLD","ITALIC","BOLDITALIC",""]
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue "PLAIN"
             * @field x3d
             * @instance
             */
            this.addField_SFString( ctx, "style", "PLAIN" );

            /**
             * Specifies whether the text flows from top to bottom or from bottom to top.
             * @var {x3dom.fields.SFBool} topToBottom
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool( ctx, "topToBottom", true );

            /**
             * Sets the quality of the text rendering as an oversampling factor.
             * @var {x3dom.fields.SFFloat} quality
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.FontStyle
             * @initvalue 2.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat( ctx, "quality", 2.0 );
        },
        {
            fieldChanged : function ( fieldName )
            {
                if ( fieldName == "family" || fieldName == "horizontal" || fieldName == "justify" ||
                    fieldName == "language" || fieldName == "leftToRight" || fieldName == "size" ||
                    fieldName == "spacing" || fieldName == "style" || fieldName == "topToBottom" )
                {
                    this._parentNodes.forEach( function ( node )
                    {
                        node._parentNodes.forEach( function ( textnode )
                        {
                            textnode.setAllDirty();
                        } );
                    } );
                }
            },

            getCSSFamily : function ()
            {
                const font_family = this._vf.family.map( function ( s )
                {
                    s = s.trim().replace( /\'/g, "" ).replace( /\"/g, "" );
                    switch ( s )
                    {
                        case "SANS":
                            return "Verdana, sans-serif";
                        case "SERIF":
                            return "Georgia, serif";
                        case "TYPEWRITER":
                            return "monospace";
                        default:
                            return s;
                    }
                } ).join( "," );
                return font_family;
            },

            getCSSStyleWeight : function ()
            {
                const font_style = this._vf.style.toString().replace( /\'/g, "" );
                let weight = "normal";
                let style = "normal";
                switch ( font_style.toUpperCase() )
                {
                    case "PLAIN":
                        break;
                    case "BOLD":
                        weight = "bold";
                        break;
                    case "ITALIC":
                        style = "italic";
                        break;
                    case "BOLDITALIC":
                        style = "italic";
                        weight = "bold";
                        break;
                    default:
                        style = "normal";
                }
                return { "style": style, "weight": weight };
            }
        }
    )
);

x3dom.nodeTypes.FontStyle.defaultNode = function ()
{
    if ( !x3dom.nodeTypes.FontStyle._defaultNode )
    {
        x3dom.nodeTypes.FontStyle._defaultNode = new x3dom.nodeTypes.FontStyle();
        x3dom.nodeTypes.FontStyle._defaultNode.nodeChanged();
    }
    return x3dom.nodeTypes.FontStyle._defaultNode;
};
