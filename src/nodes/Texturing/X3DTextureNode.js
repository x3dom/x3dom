/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DTextureNode ### */
x3dom.registerNodeType(
    "X3DTextureNode",
    "Texturing",
    defineClass( x3dom.nodeTypes.X3DAppearanceChildNode,

        /**
         * Constructor for X3DTextureNode
         * @constructs x3dom.nodeTypes.X3DTextureNode
         * @x3d 3.3
         * @component Texturing
         * @status full
         * @extends x3dom.nodeTypes.X3DAppearanceChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This abstract node type is the base type for all node types which specify sources for texture images.
         */
        function ( ctx )
        {
            x3dom.nodeTypes.X3DTextureNode.superClass.call( this, ctx );

            /**
             * Specifies the channel count of the texture. 0 means the system should figure out the count automatically.
             * @var {x3dom.fields.SFInt32} origChannelCount
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.X3DTextureNode
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32( ctx, "origChannelCount", 0 );

            /**
             * Sets the url to a resource.
             * @var {x3dom.fields.MFString} url
             * @memberof x3dom.nodeTypes.X3DTextureNode
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString( ctx, "url", [] );

            /**
             * Specifies whether the texture is repeated in s direction.
             * @var {x3dom.fields.SFBool} repeatS
             * @memberof x3dom.nodeTypes.X3DTextureNode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool( ctx, "repeatS", true );

            /**
             * Specifies whether the texture is repeated in t direction.
             * @var {x3dom.fields.SFBool} repeatT
             * @memberof x3dom.nodeTypes.X3DTextureNode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool( ctx, "repeatT", true );

            /**
             * Specifies whether the texture is scaled to the next highest power of two. (Needed, when texture repeat is enabled and texture size is non power of two)
             * @var {x3dom.fields.SFBool} scale
             * @memberof x3dom.nodeTypes.X3DTextureNode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool( ctx, "scale", true );

            /**
             * Cross Origin Mode
             * @var {x3dom.fields.SFString} crossOrigin
             * @memberof x3dom.nodeTypes.X3DTextureNode
             * @initvalue ""
             * @field x3d
             * @instance
             */
            this.addField_SFString( ctx, "crossOrigin", "" );

            /**
             * Sets a TextureProperty node.
             * @var {x3dom.fields.SFNode} textureProperties
             * @memberof x3dom.nodeTypes.X3DTextureNode
             * @initvalue x3dom.nodeTypes.TextureProperties
             * @field x3dom
             * @instance
             */
            this.addField_SFNode( "textureProperties", x3dom.nodeTypes.TextureProperties );

            this.addField_SFBool( ctx, "flipY", false );

            this.addField_SFInt32( ctx, "channel", 0 );

            this._needPerFrameUpdate = false;
            this._isCanvas = false;
            this._type = "diffuseMap";

            this._blending = ( this._vf.origChannelCount == 1 || this._vf.origChannelCount == 2 );
        },
        {
            invalidateGLObject : function ()
            {
                this._parentNodes.forEach( function ( app )
                {
                    app._parentNodes.forEach( function ( shape )
                    {
                        // THINKABOUTME: this is a bit ugly, cleanup more generically
                        if ( x3dom.isa( shape, x3dom.nodeTypes.X3DShapeNode ) )
                        {
                            shape._dirty.texture = true;
                        }
                        else
                        {
                            // Texture maybe in MultiTexture or CommonSurfaceShader
                            shape._parentNodes.forEach( function ( realShape )
                            {
                                if ( x3dom.isa( realShape, x3dom.nodeTypes.X3DShapeNode ) )
                                {
                                    realShape._dirty.texture = true;
                                }
                                else
                                {
                                    realShape._parentNodes.forEach( function ( realShape2 )
                                    {
                                        if ( x3dom.isa( realShape2, x3dom.nodeTypes.X3DShapeNode ) )
                                        {
                                            realShape2._dirty.texture = true;
                                        }
                                    } );
                                }
                            } );
                        }
                    } );
                } );

                this._nameSpace.doc.needRender = true;
            },

            validateGLObject : function ()
            {
                this._parentNodes.forEach( function ( app )
                {
                    app._parentNodes.forEach( function ( shape )
                    {
                        // THINKABOUTME: this is a bit ugly, cleanup more generically
                        if ( x3dom.isa( shape, x3dom.nodeTypes.X3DShapeNode ) )
                        {
                            shape._dirty.texture = false;
                        }
                        else
                        {
                            // Texture maybe in MultiTexture or CommonSurfaceShader
                            shape._parentNodes.forEach( function ( realShape )
                            {
                                if ( x3dom.isa( realShape, x3dom.nodeTypes.X3DShapeNode ) )
                                {
                                    realShape._dirty.texture = false;
                                }
                                else
                                {
                                    realShape._parentNodes.forEach( function ( realShape2 )
                                    {
                                        if ( x3dom.isa( realShape2, x3dom.nodeTypes.X3DShapeNode ) )
                                        {
                                            realShape2._dirty.texture = false;
                                        }
                                    } );
                                }
                            } );
                        }
                    } );
                } );

                this._nameSpace.doc.needRender = true;
            },

            parentAdded : function ( parent )
            {
                parent._parentNodes.forEach( function ( shape )
                {
                    // THINKABOUTME: this is a bit ugly, cleanup more generically
                    if ( x3dom.isa( shape, x3dom.nodeTypes.Shape ) )
                    {
                        shape._dirty.texture = true;
                    }
                    else
                    {
                        // Texture maybe in MultiTexture or CommonSurfaceShader
                        shape._parentNodes.forEach( function ( realShape )
                        {
                            realShape._dirty.texture = true;
                        } );
                    }
                } );
            },

            parentRemoved : function ( parent )
            {
                parent._parentNodes.forEach( function ( shape )
                {
                    // THINKABOUTME: cleanup more generically, X3DShapeNode allows VolumeData
                    if ( x3dom.isa( shape, x3dom.nodeTypes.X3DShapeNode ) )
                    {
                        shape._dirty.texture = true;
                    }
                    else
                    {
                        // Texture maybe in MultiTexture or CommonSurfaceShader
                        shape._parentNodes.forEach( function ( realShape )
                        {
                            realShape._dirty.texture = true;
                        } );
                    }
                } );
            },

            fieldChanged : function ( fieldName )
            {
                if ( fieldName == "url" || fieldName ==  "origChannelCount" ||
                    fieldName == "repeatS" || fieldName == "repeatT" ||
                    fieldName == "scale" || fieldName == "crossOrigin" ||
                    fieldName == "image" )
                {
                    var that = this;

                    that._blending = ( that._vf.origChannelCount == 1 ||
                                      that._vf.origChannelCount == 2 );

                    this._parentNodes.forEach( function ( app )
                    {
                        if ( x3dom.isa( app, x3dom.nodeTypes.X3DAppearanceNode ) )
                        {
                            app.nodeChanged();
                        }
                        else if ( x3dom.isa( app, x3dom.nodeTypes.MultiTexture ) )
                        {
                            app._parentNodes.forEach( function ( realApp )
                            {
                                realApp.nodeChanged();
                            } );
                        }
                        else if ( x3dom.isa( app, x3dom.nodeTypes.ComposedCubeMapTexture ) )
                        {
                            app._parentNodes.forEach( function ( realApp )
                            {
                                realApp.nodeChanged();
                            } );
                        }
                        else if ( x3dom.isa( app, x3dom.nodeTypes.PhysicalMaterial ) )
                        {
                            app._parentNodes.forEach( function ( realApp )
                            {
                                realApp.nodeChanged();
                            } );
                        }
                        else if ( x3dom.nodeTypes.X3DVolumeDataNode !== undefined )
                        {
                            if ( x3dom.isa( app, x3dom.nodeTypes.X3DVolumeRenderStyleNode ) )
                            {
                                if ( that._xmlNode && that._xmlNode.hasAttribute( "containerField" ) )
                                {
                                    if ( app._volumeDataParent )
                                    {
                                        app._volumeDataParent._dirty.texture = true;
                                    }
                                    else
                                    {
                                        //Texture maybe under a ComposedVolumeStyle
                                        var volumeDataParent = app._parentNodes[ 0 ];
                                        while ( !x3dom.isa( volumeDataParent, x3dom.nodeTypes.X3DVolumeDataNode ) && x3dom.isa( volumeDataParent, x3dom.nodeTypes.X3DNode ) )
                                        {
                                            volumeDataParent = volumeDataParent._parentNodes[ 0 ];
                                        }
                                        if ( x3dom.isa( volumeDataParent, x3dom.nodeTypes.X3DNode ) )
                                        {
                                            volumeDataParent._dirty.texture = true;
                                        }
                                    }
                                }
                            }
                            else if ( x3dom.isa( app, x3dom.nodeTypes.X3DVolumeDataNode ) )
                            {
                                if ( that._xmlNode && that._xmlNode.hasAttribute( "containerField" ) )
                                {
                                    app._dirty.texture = true;
                                }
                            }
                        }
                    } );
                }
            },

            getTexture : function ( pos )
            {
                if ( pos === 0 )
                {
                    return this;
                }
                return null;
            },

            size : function ()
            {
                return 1;
            },

            setOrigChannelCount : function ( channelCount )
            {
                this._parentNodes.forEach( function ( app )
                {
                    if ( app._origSortType == "auto" && this._vf.origChannelCount == 0 )
                    {
                        if ( channelCount == 2 || channelCount == 4 )
                        {
                            app._vf.sortType = "transparent";
                        }
                    }
                }.bind( this ) );

                this._vf.origChannelCount = channelCount;

                this.fieldChanged( "origChannelCount" );
            },

            getOrigChannelCount : function ()
            {
                return this._vf.origChannelCount;
            }
        }
    )
);
