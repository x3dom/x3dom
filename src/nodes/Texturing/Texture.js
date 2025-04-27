/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Texture ### */
// intermediate layer to avoid instantiating X3DTextureNode in web profile
x3dom.registerNodeType(
    "Texture",      // X3DTexture2DNode
    "Texturing",
    defineClass( x3dom.nodeTypes.X3DTextureNode,

        /**
         * Constructor for Texture
         * @constructs x3dom.nodeTypes.Texture
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc (Abstract) class for 2D Textures.
         */
        function ( ctx )
        {
            x3dom.nodeTypes.Texture.superClass.call( this, ctx );

            /**
             * Specifies whether the children are shown or hidden outside the texture.
             * @var {x3dom.fields.SFBool} hideChildren
             * @memberof x3dom.nodeTypes.Texture
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool( ctx, "hideChildren", true );

            this._video = null;
            this._intervalID = null;
            this._canvas = null;
        },
        {
            nodeChanged : function ()
            {
                if ( ( this._vf.url.length && this._vf.url[ 0 ].length ) || !this._xmlNode )
                {
                    return;
                }
                x3dom.debug.logInfo( "No Texture URL given, searching for &lt;img&gt; elements..." );
                var that = this;
                try
                {
                    this._xmlNode.childNodes.forEach( function ( childDomNode )
                    {
                        if ( childDomNode.nodeType === 1 )
                        {
                            var url = childDomNode.getAttribute( "src" );
                            // For testing: look for <img> element if url empty
                            if ( url )
                            {
                                that._vf.url.push( url );
                                x3dom.debug.logInfo( that._vf.url[ that._vf.url.length - 1 ] );

                                if ( childDomNode.localName.toLowerCase() === "video" )
                                {
                                    that._needPerFrameUpdate = true;
                                    //that._video = childDomNode;

                                    that._video = document.createElement( "video" );
                                    that._video.setAttribute( "preload", "auto" );
                                    that._video.setAttribute( "muted", "muted" );
                                    var p = document.getElementsByTagName( "body" )[ 0 ];
                                    p.appendChild( that._video );
                                    that._video.style.display = "none";
                                    that._video.style.visibility = "hidden";
                                }
                            }
                            else if ( childDomNode.localName.toLowerCase() === "canvas" )
                            {
                                that._needPerFrameUpdate = true;
                                that._isCanvas = true;
                                that._canvas = childDomNode;
                            }

                            if ( childDomNode.style && that._vf.hideChildren )
                            {
                                childDomNode.style.display = "none";
                                childDomNode.style.visibility = "hidden";
                            }
                            x3dom.debug.logInfo( "### Found &lt;" + childDomNode.nodeName + "&gt; tag." );
                        }
                    } );
                }
                catch ( e )
                {
                    x3dom.debug.logException( e );
                }
            },

            parentRemoved : function ( parent )
            {
                if ( this._parentNodes.length === 0 && this._video )
                {
                    this._video.pauseVideo();
                    while ( this._video.hasChildNodes() )
                    {
                        this._video.removeChild( this._video.firstChild );
                    }
                    //document.body.removeChild( this._video );
                    if ( this._video.startVideo )
                    {
                        this._video.startVideo = null;
                    }
                    if ( this._video.pauseVideo )
                    {
                        this._video.pauseVideo = null;
                    }
                    this._video = null;
                }
                x3dom.nodeTypes.X3DTextureNode.prototype.parentRemoved.call( this, parent );
            }
        }
    )
);
