/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * (C)2025 Andreas Plesch, Waltham, MA, U.S.A
 * Dual licensed under the MIT and GPL
 */

/* ### GeoTileset ### */
x3dom.registerNodeType(
    "GeoTileset",
    "Geospatial",
    defineClass( x3dom.nodeTypes.X3DTransformNode,

        /**
         * Constructor for GeoTileset
         * @constructs x3dom.nodeTypes.GeoTileset
         * @x3d 4.1
         * @component Geospatial
         * @status experimental
         * @extends x3dom.nodeTypes.X3DTransformNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The GeoTileset node loads a OGC 3d Tileset from a url. It constructs a GeoTiles
         * which is available from the SFNode tileset field. The constructed node is a child node.
         */
        function ( ctx )
        {
            x3dom.nodeTypes.GeoTileset.superClass.call( this, ctx );

            /**
             * The url specifies the json file for the tileset.
             * @var {x3dom.fields.MFString} url
             * @memberof x3dom.nodeTypes.GeoTileset
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString( ctx, "url", [] );

            /**
             * The geoOrigin field is used to specify a local coordinate frame for extended precision.
             * @var {x3dom.fields.SFNode} geoOrigin
             * @memberof x3dom.nodeTypes.GeoTileset
             * @initvalue x3dom.nodeTypes.X3DChildNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode( "geoOrigin", x3dom.nodeTypes.GeoOrigin );

            /**
             * Specifies the maximum ScreenSpace Error.
             * @var {x3dom.fields.SFFloat} maximumScreenSpaceError
             * @range [1, inf]
             * @memberof x3dom.nodeTypes.GeoTiles
             * @initvalue 8
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat( ctx, "maximumScreenSpaceError", 8 );

            /**
             * The read-only tileset field holds the tile tree of the OGC tileset.
             * @var {x3dom.fields.SFNode} tileset
             * @memberof x3dom.nodeTypes.GeoTileset
             * @initvalue x3dom.nodeTypes.X3DChildNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode( "tileset", x3dom.nodeTypes.GeoTiles );

            //this._ctx = ctx;

            this._trafo = new x3dom.fields.SFMatrix4f();

            this._loaded = new Map();

            this._load = x3dom.loaders.core.load;
            this._Tiles3DLoader = x3dom.loaders[ "3d-tiles" ].Tiles3DLoader;
        },
        {
            getVolume : function ()
            {
                var vol = this._graph.volume;
                //below may not apply for GeoLOD
                if ( !this.volumeValid() && ( this._vf.bboxDisplay || this.renderFlag && this.renderFlag() ) )
                {
                    var child,
                        childVol;
                    // use childUrlNodes ?
                    for ( var i = 0, n = this._childNodes.length; i < n; i++ )
                    {
                        if ( !( child = this._childNodes[ i ] ) || child.renderFlag && child.renderFlag() !== true  && !child._vf.bboxDisplay )
                        {continue;}
                        childVol = child.getVolume();
                        if ( childVol && childVol.isValid() )
                        {vol.extendBounds( childVol.min, childVol.max );}
                    }
                    //}
                }
                return vol;
            },

            nodeChanged : function ()
            {
                //this._needReRender = true;
                if ( this._loaded.has( this._vf.url[ 0 ] ) ) {return;}
                this._Tiles3DLoader.options[ "3d-tiles" ].loadGLTF = false;
                const tilesetJsonPromise = this._load(
                    this._vf.url[ 0 ],
                    this._Tiles3DLoader,
                    {
                        "3d-tiles" :
                        {
                            isTileset : true,
                            loadGLTF  : false // does not work
                        }
                    } );
                var that = this;
                tilesetJsonPromise.then(
                    function fullfilled ( tilesetJson )
                    {
                        console.log( tilesetJson );
                        that._loaded.set( that._vf.url[ 0 ], "loaded" );

                        that._xmlNode.querySelector('GeoTiles')?.remove();
                    
                        const tilesetDOM = document.createElement( "GeoTiles" );
                        tilesetDOM.setAttribute( "containerField", "tileset" );
                        tilesetDOM.setAttribute( "geometricError", tilesetJson.geometricError );
                        tilesetDOM.setAttribute( "maximumScreenSpaceError", that._vf.maximumScreenSpaceError );
                        tilesetDOM._tilesetJson = tilesetJson; // avoid refetching

                        // metadata

                        const metadataSet = document.createElement( "MetadataSet" );
                        metadataSet.setAttribute( "name", "OGC 3D Tiles" );
                        metadataSet.setAttribute( "reference", "https://www.ogc.org/standards/3dtiles/" );
                        metadataSet.setAttribute( "containerField", "metadata" );
                        tilesetDOM.appendChild( metadataSet );

                        metadataSet.appendChild( _createMetadataString( "asset.version", `"${tilesetJson?.asset?.version}"` ) );
                        metadataSet.appendChild( _createMetadataString( "asset.tilesetVersion", `"${tilesetJson?.asset?.tilesetVersion}"` ) );
                        //...
                        //reuse glTF metadata parser

                        function _createMetadataString ( name, value )
                        {
                            const metadata = document.createElement( "MetadataString" );
                            metadata.setAttribute( "name", name );
                            metadata.setAttribute( "value", value );
                            return metadata;
                        }

                        // GeoOrigin
                        // pass on, but better to set this._trafo here
                        const geoOrigin = that._cf.geoOrigin.node;
                        if ( geoOrigin )
                        {
                            const geoOriginClone = geoOrigin._xmlNode.cloneNode();
                            geoOriginClone.setAttribute( "containerField", "geoOrigin" );
                            tilesetDOM.appendChild( geoOriginClone );
                        }

                        // root
                        // if GeoTiles is given json it constructs its own root tile node from it

                        //trigger update
                        that._xmlNode.appendChild( tilesetDOM );
                    },
                    function rejected ( reason )
                    {
                        x3dom.debug.logInfo( " Tileset rejected: " + reason );
                        // try next url
                    }
                );

                //this.invalidateVolume();
            },

            fieldChanged : function ( fieldName )
            {
                //this._needReRender = true;
                if ( fieldName == "render" )
                {
                    this.invalidateVolume();
                }
                if ( fieldName == "url" )
                {
                    this.nodeChanged();
                }
            }
        }
    )
);
