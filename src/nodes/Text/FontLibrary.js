/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * (c)2025 Andreas Plesch, Waltham, MA, U.S.A.
 * Dual licensed under the MIT and GPL
 */

/* ### FontLibrary ### */
x3dom.registerNodeType(
    "FontLibrary",
    "Text",
    defineClass( x3dom.nodeTypes.X3DNode,

        /**
         * Constructor for FontLibrary
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

                if ( x3dom.nodeTypes.FontLibrary.reservedFamilies.includes( family.toUpperCase() ) )
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
                    //check unresolved lateFontStyles
                    let _ns = this._nameSpace,
                        lateFontStyle;
                    while ( _ns.parent )
                    {
                        lateFontStyle = _ns.parent.lateFontStyles.get( family );
                        if ( lateFontStyle )
                        {
                            _ns.parent.lateFontStyles.delete( family );
                            lateFontStyle.fieldChanged( "family" );
                            _ns.parent.doc.needRender = true;
                        }
                        _ns = _ns.parent;
                    }
                }
                catch ( error )
                {
                    x3dom.debug.logError( "when adding font " + this._vf.family + " " + error.message );
                }
            }
        }
    )
);

x3dom.nodeTypes.FontLibrary.reservedFamilies = [ "SERIF", "SANS", "TYPEWRITER" ];