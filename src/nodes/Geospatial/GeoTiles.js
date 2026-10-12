/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * (C)2025 Andreas Plesch, Waltham, MA, U.S.A
 * Dual licensed under the MIT and GPL
 */

/* ### GeoTiles ### */
x3dom.registerNodeType(
    "GeoTiles",
    "Geospatial",
    defineClass( x3dom.nodeTypes.X3DGroupingNode,

        /**
         * Constructor for GeoTiles
         * @constructs x3dom.nodeTypes.GeoTiles
         * @x3d 4.1
         * @component Geospatial
         * @status experimental
         * @extends x3dom.nodeTypes.X3DBoundedObject
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The GeoTiles node loads OGC 3d Tilesets from a url.
         */
        function ( ctx )
        {
            x3dom.nodeTypes.GeoTiles.superClass.call( this, ctx );

            /**
             * The geoSystem field is used to define the spatial reference frame. Not used.
             * @var {x3dom.fields.MFString} geoSystem
             * @range {["GD", ...], ["UTM", ...], ["GC", ...]}
             * @memberof x3dom.nodeTypes.GeoTiles
             * @initvalue ['GD','WE']
             * @field x3d
             * @instance
             */
            // The content of the Tileset is always expected to be given in GC
            //this.addField_MFString( ctx, "geoSystem", [ "GD", "WE" ] );

            /**
             * The rootUrl specifies the json or x3d file for the tileset.
             * @var {x3dom.fields.MFString} rootUrl
             * @memberof x3dom.nodeTypes.GeoTiles
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString( ctx, "rootUrl", [] );

            /**
             * Specifies the maximum ScreenSpace Error.
             * @var {x3dom.fields.SFFloat} maximumScreenSpaceError
             * @range [1, inf]
             * @memberof x3dom.nodeTypes.GeoTiles
             * @initvalue 8
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat( ctx, "maximumScreenSpaceError", 8 ); //100000);

            /**
             * The geoOrigin field is used to specify a local coordinate frame for extended precision.
             * @var {x3dom.fields.SFNode} geoOrigin
             * @memberof x3dom.nodeTypes.GeoTiles
             * @initvalue x3dom.nodeTypes.X3DChildNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode( "geoOrigin", x3dom.nodeTypes.GeoOrigin );

            this._ctx = ctx;

            this._loaded = new Map();
            this._inlined = new Set();
            this._unselectedTiles = new Set();
            this._initialUpdate = true;
            this._maximumScreenSpaceError = this._vf.maximumScreenSpaceError;
            this._fovBuffer = 0; // for conservative culling
            this._lastTileUpdate = -1;
            this._updatePeriod = 300; // updates only every milliseconds

            this._load = x3dom.loaders.core.load;
            this._Tiles3DLoader = x3dom.loaders[ "3d-tiles" ].Tiles3DLoader;
            this._Tileset3D = x3dom.loaders.tiles.Tileset3D;
            this._Viewport = x3dom.deck.core.Viewport;
            this._WebMercatorViewport = x3dom.deck.core.WebMercatorViewport;//x3dom.deck.core.WebMercatorViewport;
            this._GlobeViewport = x3dom.deck.core._GlobeViewport;
            this._GlobeMaxZoom = 3;

            this._geoOriginTransform = new x3dom.nodeTypes.GeoTransform( this._ctx );
            this._geoOriginTransform._cf.geoOrigin = this._cf.geoOrigin;
            this._geoOriginTransform._vf.globalGeoOrigin = true;
            this._geoOriginTransform.nodeChanged();
            this.addChild( this._geoOriginTransform );
        },
        {
            onBeforeCollectChildNodes : function ( transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes )
            {
                if ( this._initialUpdate )
                {
                    this._initialUpdate = false;
                    return;
                }
                const doc = this._nameSpace.doc;
                if ( doc.downloadCount < 2 )
                {
                    this._unselectedTiles.forEach( ( tile ) => this._setTileVisible( tile, false ) );
                    //removedTiles.forEach( this._onTileUnload, this );
                }
                const rt = doc._x3dElem.runtime;
                if ( rt.canvas.doc.isAnimating() )
                {
                    console.log( "animating" );
                    return;
                }
                const rad2deg = 180 / Math.PI;
                var mat_view = drawableCollection.viewMatrix;
                var center = new x3dom.fields.SFVec3f( 0, 0, 0 ); // eye
                // if ( mat_view.det() == 0 )
                // {
                //     x3dom.debug.logWarning( "no inverse of view matrix: singular matrix, " +
                //                 "skip tiles update" );
                //     return
                // }
                center = mat_view.inverse().multMatrixPnt( center );
                //transform eye point to the LOD node's local coordinate system
                // if ( transform.det() == 0 )
                // {
                //     x3dom.debug.logWarning( "no inverse of tranform matrix: singular matrix, " +
                //                 "skip tiles update" );
                //     return
                // }
                var eye = transform.inverse().multMatrixPnt( center );
                //console.log('eye:', eye);
                var geoSystem = [ "GC", "WE" ];
                var eyegc = x3dom.nodeTypes.GeoCoordinate.prototype.X3DtoGC( geoSystem, this._cf.geoOrigin, [ eye ] )[ 0 ];
                var gd = x3dom.nodeTypes.GeoCoordinate.prototype.X3DtoGD( geoSystem, this._cf.geoOrigin, [ eye ] )[ 0 ];
                //console.log('gd:', gd);
                //do pitch and bearing for tileset3d use
                let forward = new x3dom.fields.SFVec3f( 0, 0, -gd.z * 0.01 ); //direction into the screen scaled by elevation for precision reasons
                forward = mat_view.inverse().multMatrixPnt( forward );
                forward = transform.inverse().multMatrixPnt( forward );
                const fwdgc = x3dom.nodeTypes.GeoCoordinate.prototype.X3DtoGC( geoSystem, this._cf.geoOrigin, [ forward ] )[ 0 ];
                const negFwdDir = eyegc.subtract( fwdgc );
                let rotation = x3dom.fields.Quaternion.rotateFromTo( eyegc, negFwdDir );
                const pitch = rotation.angle() * rad2deg;
                //console.log( pitch );
                //get North vector from shifted GD latitude or Northpole GC
                //let northPoleGC = new x3dom.fields.SFVec3f( 0, 0, 6356752.29822);//6378137*(1-1/298.257) );
                const northShiftGD = new x3dom.fields.SFVec3f( gd.y + 0.001, gd.x, gd.z );
                var northShiftGC = x3dom.nodeTypes.GeoCoordinate.prototype.GDtoGC( geoSystem, [ northShiftGD ] )[ 0 ];
                const north = northShiftGC.subtract( eyegc );
                //project fwd onto tangential plane
                const fwdDir = negFwdDir.negate();
                const upDir = eyegc.normalize();
                const fwdPlaneNormal = upDir.multiply( fwdDir.dot( upDir ) );
                const fwdPlane = fwdDir.subtract( fwdPlaneNormal );
                rotation = x3dom.fields.Quaternion.rotateFromTo( fwdPlane, north );
                //rotation to north vector
                //bearing
                rotation = rotation.toAxisAngle();//angle() * 180/Math.PI;
                const axisUp = rotation[ 0 ].dot( upDir );
                const bearing = rotation[ 1 ] * rad2deg * Math.sign( axisUp );
                //console.log( 'bearing: ', northShiftGD, gd, north, rotation[1] * 180/Math.PI, axisUp );
                const fov = rt.viewpoint()._vf.fieldOfView;// * rad2deg; // is fovy if height<width
                const height = rt.getHeight();
                const width = rt.getWidth();
                const fovy = fov * rad2deg + this._fovBuffer; //2 * Math.atan( height/width * Math.tan(fov * 0.5)) * rad2deg;
                const zoom = this.getZoomFromElevation( {
                    elevation : Math.max( gd.z, 1 ), //not 0, divide by zero error
                    latitude  : gd.y,
                    height    : height,
                    pitch     : pitch,
                    fovy      : fovy * 2.0 // 90 is most robust
                } );
                rt.addMeasurement( "pitch", pitch );
                rt.addMeasurement( "bearing", bearing );
                rt.addMeasurement( "zoom", zoom );
                rt.addInfo( "#TILES", this.tileset3d.selectedTiles.length );
                rt.addInfo( "#KB_TSET", Math.round( this.tileset3d.gpuMemoryUsageInBytes * 0.001 ) );
                //console.log ( zoom );
                const viewportOpts = {
                    width     : width * 1.0,
                    height    : height * 1.0,
                    latitude  : gd.y,
                    longitude : gd.x,
                    pitch     : pitch, // from vertical
                    bearing   : bearing, // from N ccw
                    zoom      : zoom,
                    fovy      : fovy * 2.0
                };
                let viewport_unchanged = true;
                for ( const p in viewportOpts )
                {
                    viewport_unchanged &&= viewportOpts[ p ] == this.viewport[ p ];
                }
                if ( !viewport_unchanged )
                {
                    console.log( "viewport changed, waiting for calm" );
                    this.viewport = zoom > this._GlobeMaxZoom ? new this._WebMercatorViewport( viewportOpts ) : new this._GlobeViewport( viewportOpts );
                    return;
                }
                //this.tileset3d.update ( this.viewport );
                //console.log(this.tileset3d.selectedTiles);
                return this.tileset3d.selectTiles( this.viewport ); //select tiles seems to time better
            },

            getVolume : function ()
            {
                var vol = this._graph.volume;
                //below may not apply for GeoTiles
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
                const tilesetJson = this._xmlNode._tilesetJson; // may have been provided by GeoTileset
                let tilesetJsonPromise;
                if ( tilesetJson )
                {
                    tilesetJsonPromise = Promise.resolve( tilesetJson );
                }
                else
                {
                    this._Tiles3DLoader.options[ "3d-tiles" ].loadGLTF = false;
                    tilesetJsonPromise = this._load(
                        this._vf.rootUrl[ 0 ],
                        this._Tiles3DLoader,
                        {
                            "3d-tiles" :
                            {
                                isTileset : true,
                                loadGLTF  : false // does not work
                            }
                        } );
                }
                var that = this;
                tilesetJsonPromise.then(
                    function fullfilled ( tilesetJson )
                    {
                        //patch asset property
                        if ( ! ( "asset" in tilesetJson ) )
                        {
                            tilesetJson.asset = { "version": "1.1" };
                        }
                        console.log( tilesetJson );
                        const tileset3d = new that._Tileset3D( tilesetJson,
                            {
                                throttleRequests               : false,
                                onTileLoad                     : that._onTileLoad.bind( that ),
                                __onTileLoad                   : that._updateX3DTiles.bind( that ),
                                onTileUnload                   : that._onTileUnload.bind( that ),
                                onTraversalComplete            : that._onTraversalComplete.bind( that ),
                                maximumMemoryUsage             : 256, // 32 MBytes, The maximum amount of memory in MB that can be used by the tileset.
                                updateTransforms               : false, // true (Boolean) - Always check if the tileset modelMatrix was updated. Set to false to improve performance when the tileset remains stationary in the scene.
                                maximumScreenSpaceError        : that._maximumScreenSpaceError, // 8 (Number) - The maximum screen space error used to drive level of detail refinement.
                                memoryAdjustedScreenSpaceError : true // false - Whether to adjust the maximum screen space error to comply with the maximum memory limitation
                            } );
                        const rt = that._nameSpace.doc._x3dElem.runtime;
                        const viewportOpts = {
                            width     : rt.getWidth(),
                            height    : rt.getHeight(),
                            latitude  : tileset3d.cartographicCenter[ 1 ],
                            longitude : tileset3d.cartographicCenter[ 0 ],
                            pitch     : 1, // from vertical
                            bearing   : 10, //  The bearing (rotation) of the map from north, in degrees counter-clockwise (0 means north is up)
                            zoom      : 14 // size=360/2^zoom; 360/size=2^zoom; zoom=ln2(360/size);
                            // nearZ: 0.59679,
                            // farZ: 5967.85292
                            // projectionMatrix: rt.projectionMatrix().toGL()
                        };
                        const zoom = that.getZoomFromElevation( {
                            elevation : 7500,
                            latitude  : viewportOpts.latitude,
                            height    : viewportOpts.height
                        } );
                        //console.log ( zoom );
                        that.viewport = new that._WebMercatorViewport( viewportOpts );
                        tileset3d.update( that.viewport );
                        this._initialUpdate = true;
                        console.log( tileset3d );
                        that.tileset3d = tileset3d;
                        return; //tileset3d.selectTiles ( that.viewport );
                    },
                    function rejected ( reason )
                    {
                        x3dom.debug.logInfo( " Tileset rejected: " + reason );
                        // try next url
                    }
                );

                this.invalidateVolume();
            },

            _updateX3DTiles : function ( tile )
            {
                // this._onTraversalComplete( tile.tileset.tiles.filter(
                //     ( tile ) => tile.selected
                // ) );
                return;
            },

            _onTraversalComplete : function ( selectedTiles )
            {
                //selected tiles are the tiles which need to be shown
                //so needs to check which tiles need to be hidden, eg. visible=false
                //maintain set of x3d tiles in scene
                //not selected now (and visible) need to become visible=false
                //
                //also needs to check if any hidden tiles need to be shown
                //selected now (and not visible) need to become visible=true
                //this.tileset3d.stats.stats has numbers
                //
                //console.log( "afterTraversal:", selectedTiles );
                if ( Date.now() - this._lastTileUpdate < this._updatePeriod ) { return selectedTiles; }
                this._lastTileUpdate = Date.now();
                const selected = new Set( selectedTiles );//.map( t => t.id ));
                const missingTiles = selected.difference( this._inlined );
                const removedTiles = this._inlined.difference( selected );
                this._unselectedTiles = removedTiles;
                //missingTiles.forEach( this._onTileLoad, this );
                //only hide after parent is visible and loaded, or all children are loaded and visible
                //this._inlined = selected;
                //this._inlined = selected;
                //missingTiles.forEach( ( tile ) => this._setTileVisible( tile, true ) );
                selected.forEach( ( tile ) => this._setTileVisible( tile, true ) );
                //console.log( 'missing:', missingTiles );
                //console.log( 'removed:', removedTiles );
                this._geoOriginTransform.nodeChanged();
                return selectedTiles; //required
            },

            _setTileVisible : function ( tile, visible )
            {
                visible = !!visible;
                const x3d_tileTransform = this._loaded.get( tile );
                if ( !x3d_tileTransform ) {return;}
                if ( x3d_tileTransform._vf.visible == visible )
                {
                    return;
                }
                tile.tileDrawn = visible;
                x3d_tileTransform._vf.visible = visible;
                x3d_tileTransform.fieldChanged( "render" );
                console.log( "tile", visible, tile );
            },

            _onTileUnload : function ( tile )
            {
                //called when loader decides there is not enough memory and tiles need to be disposed
                // this._unselectedTiles.forEach ( ( tile ) =>
                // {
                console.log( "unloaded:", tile.screenSpaceError, tile.id );
                const x3d_tileTransform = this._loaded.get( tile );
                //setTimeout( () => // should wait until after all tiles loaded from current traveral
                //{
                console.log( "removing Inline: ", x3d_tileTransform );
                this._geoOriginTransform.removeChild( x3d_tileTransform );
                if ( "objectUrl" in tile )
                {
                    URL.revokeObjectURL( tile.objectUrl );
                }
                //this._geoOriginTransform.nodeChanged();
                this._geoOriginTransform.invalidateVolume();
                //}, 0 );
                this._loaded.delete( tile );
                this._inlined.delete( tile );
                this._unselectedTiles.delete( tile );
                tile.tileset.gpuMemoryUsageInBytes -= tile.gpuMemoryUsageInBytes;
                //tile.destroy();
                // } );
                return;
            },

            _onTileLoad : function ( tile )
            {
                //called when a not already loaded tile needs to be created and shown
                console.log( tile.screenSpaceError, tile );
                if ( this._inlined.has( tile ) )
                {
                    console.log( " tile already loaded and added: should not happen ", tile );
                    return;
                }
                if ( tile.hasTilesetContent ) // needs another update to continue to traverse
                {
                    tile.tileset.selectTiles( this.viewport ); // kicks off next onTileLoad call
                    return;
                }

                const tileCtx =
                {
                    doc       : this._ctx.doc,
                    runtime   : this._ctx.runtime,
                    xmlNode   : this._ctx.xmlNode.cloneNode( true ), // overwritten
                    nameSpace : this._ctx.nameSpace
                };

                tileCtx.xmlNode = document.createElement( "Transform" );
                const glTFTransform = new x3dom.nodeTypes.Transform( tileCtx );
                glTFTransform._vf.rotation = x3dom.fields.Quaternion.parseAxisAngle( "1 0 0 " + Math.PI / 2 );
                glTFTransform.fieldChanged( "rotation" ); //applies to trafo

                tileCtx.xmlNode = document.createElement( "Inline" );
                const glTFInline = new x3dom.nodeTypes.Inline( tileCtx );
                glTFInline._vf.log = false; //no logging
                const contentUrl = this.contentUrl( tile );
                glTFInline._vf.url = x3dom.fields.MFString.parse( contentUrl );
                if ( contentUrl.startsWith( "blob:" ) )
                {
                    glTFInline._vf.contentType = "model/gltf-binary";
                }

                glTFInline.nodeChanged(); //is necessary and loads the inline scene

                glTFTransform.addChild( glTFInline );
                glTFTransform.nodeChanged(); //is necessary

                tileCtx.xmlNode = document.createElement( "MatrixTransform" );
                const tileTransform = new x3dom.nodeTypes.MatrixTransform( tileCtx );
                tileTransform._vf.matrix = x3dom.fields.SFMatrix4f.fromArray( tile.computedTransform ).transpose();
                tileTransform.fieldChanged( "matrix" ); //applies to trafo
                //tileTransform._trafo.setFromArray ( tile.computedTransform ); //shortcut works but does not update field
                tileTransform.addChild( glTFTransform );
                const dbg = !!this._nameSpace.doc._viewarea?._visDbgBuf;
                tileTransform._vf.bboxDisplay = dbg;
                var bbDom = x3dom.bboxDom.cloneNode( true );
                tileTransform._bboxNode = this._nameSpace.setupTree( bbDom, this._xmlNode );//.parentElement );
                // tileTransform._vf.visible = this._initialUpdate; // hide to avoid flashing? except first time: does not help much
                tileTransform.nodeChanged();

                this._loaded.set( tile, tileTransform );
                this._inlined.add( tile ); // in case tile is added onload and before traversal complete

                this._geoOriginTransform.addChild( tileTransform );
                this._geoOriginTransform.nodeChanged(); //is necessary and loads the inline scene
                this._geoOriginTransform.invalidateVolume();
                //this.nodeChanged();
                this.invalidateVolume();
            },

            contentUrl : function ( tile )
            {
                let contentUrl = tile.contentUrl;
                const arrayBuffer = tile.content.gltfArrayBuffer;
                const path = URL.parse( contentUrl ).pathname; //deal with search and other params
                if ( path.endsWith( ".glb" ) && arrayBuffer.byteLength > 0 )
                {
                    contentUrl = x3dom.Utils.arrayBufferToObjectURL( arrayBuffer, "model/gltf-binary" );
                    tile.objectURL = contentUrl; //attach to tile for easy revoking
                    tile.gpuMemoryUsageInBytes = arrayBuffer.byteLength; //estimate
                    tile.tileset.gpuMemoryUsageInBytes += arrayBuffer.byteLength; //basic accounting
                }
                return contentUrl;
            },

            _fieldChanged : function ( fieldName )
            {
                //this._needReRender = true;
                if ( fieldName == "render" )
                {
                    this.invalidateVolume();
                }
            },

            //below from loaders.gl PR

            getMeterZoom : function ( latitude )
            {
                const latCosine = Math.cos( latitude * Math.PI / 180 );
                const EARTH_CIRCUMFERENCE = 40.03e6;
                return this.scaleToZoom( EARTH_CIRCUMFERENCE * latCosine ) - 9;
            },

            scaleToZoom : function ( scale )
            {
                return Math.log2( scale );
            },

            fovyToAltitude : function ( fovy )
            {
                return 0.5 / Math.tan( 0.5 * fovy * Math.PI / 180 );
            },

            /**
             * Returns the zoom level that will position the camera at the given elevation above the ground.
             * Can be used to create a WebMercatorViewport from a camera at a known physical elevation (e.g. for 3D tileset traversal).
             *
             * @param options
             * @param options.elevation - Physical camera elevation in meters above the ground
             * @param options.latitude - Latitude of the viewport center in degrees
             * @param options.height - Height of the viewport in pixels
             * @param options.pitch - Tilt of the camera in degrees. Default `0`
             * @param options.fovy - Camera field of view in degrees. If provided, overrides `altitude`
             * @param options.altitude - Camera altitude relative to the viewport height. Default `1.5`
             * @returns Zoom level for use in WebMercatorViewport
             */
            getZoomFromElevation : function getZoomFromElevation ( options = {
                elevation : 0,
                latitude  : 0,
                height    : 0,
                pitch     : 0,
                fovy      : null,
                altitude  : 1.5
            } )
            {
                const { elevation, latitude, height, pitch = 0, fovy, altitude = 1.5 } = options;
                const altitudeRatio = fovy ? this.fovyToAltitude( fovy ) : altitude;
                return (
                    this.getMeterZoom( latitude ) +
                            Math.log2( Math.abs( ( altitudeRatio * Math.cos( pitch * ( Math.PI / 180 ) ) * height ) / elevation ) )
                );
            },

            /**
             * Returns the camera elevation in meters for the given zoom level.
             * This is the inverse of `getZoomFromElevation`.
             *
             * @param options
             * @param options.zoom - Zoom level
             * @param options.latitude - Latitude of the viewport center in degrees
             * @param options.height - Height of the viewport in pixels
             * @param options.pitch - Tilt of the camera in degrees. Default `0`
             * @param options.fovy - Camera field of view in degrees. If provided, overrides `altitude`
             * @param options.altitude - Camera altitude relative to the viewport height. Default `1.5`
             * @returns Camera elevation in meters above the ground
             */
            getElevationFromZoom : function getElevationFromZoom ( options = {
                zoom     : 0,
                latitude : 0,
                height   : 0,
                pitch    : 0,
                fovy     : null,
                altitude : 1.5
            } )
            {
                const {zoom, latitude, height, pitch = 0, fovy, altitude = 1.5} = options;
                const altitudeRatio = fovy ? this.fovyToAltitude( fovy ) : altitude;
                return (
                    ( altitudeRatio * Math.cos( pitch * ( Math.PI / 180 ) ) * height ) /
                Math.pow( 2, zoom - this.getMeterZoom( latitude ) )
                );
            }
        }
    )
);
