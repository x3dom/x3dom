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

            this._hasFontFace = false;
        },
        {
            nodeChanged : function ()
            {
                this.addFont();
            },

            fieldChanged : function ( fieldName )
            {
                if ( this._hasFontFace )
                {
                    if ( !document.fonts.delete( this._fontFace ) )
                    {
                        x3dom.debug.logWarning( "Could not remove previous font family: " + this_fontFace.family );
                    }
                    this._hasFontFace = false;
                    this.addFont();
                }
            },

            addFont : function ()
            {
                const family = this._vf.family;
                if ( family == "" )
                {
                    x3dom.debug.logError( "FontLibrary family is required but empty for url: " + urls );
                    return;
                }

                const urls = this._vf.url.map( ( url ) => "url(" + this._nameSpace.getURL( url ) + ")" ).join( "," );
                if ( urls.length == 0 )
                {
                    x3dom.debug.logError( "FontLibrary url is required but empty for family: " + family );
                    return;
                }

                if ( x3dom.nodeTypes.FontLibray.reservedFamilies.includes( family.toUpperCase() ))
                {
                    x3dom.debug.logError( "FontLibrary cannot use this reserved family name: " + family );
                    return;
                }

                this._fontFace = new FontFace(
                    family,
                    urls, // same as src of @font-face, can have multiple urls
                    { "display": "swap" } );
                this._hasFontFace = true;
                try
                {
                    document.fonts.add( this._fontFace );
                }
                catch ( error )
                {
                    x3dom.debug.logError( error.message );
                }
            }
        }
    )
);

x3dom.nodeTypes.FontLibray.reservedFamilies = ['SERIF', 'SANS', 'TYPEWRITER'];