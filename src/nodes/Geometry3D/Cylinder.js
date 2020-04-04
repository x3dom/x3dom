/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Cylinder ### */
x3dom.registerNodeType(
    "Cylinder",
    "Geometry3D",
    defineClass( x3dom.nodeTypes.X3DSpatialGeometryNode,

        /**
         * Constructor for Cylinder
         * @constructs x3dom.nodeTypes.Cylinder
         * @x3d 3.3
         * @component Geometry3D
         * @status experimental
         * @extends x3dom.nodeTypes.X3DSpatialGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Cylinder node specifies a capped cylinder centred at (0,0,0) in the local coordinate system and with a central axis oriented along the local Y-axis.
         * By default, the cylinder is sized at "-1" to "+1" in all three dimensions.
         */
        function ( ctx )
        {
            x3dom.nodeTypes.Cylinder.superClass.call( this, ctx );

            /**
             * The radius field specifies the radius of the cylinder.
             * @var {x3dom.fields.SFFloat} radius
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Cylinder
             * @initvalue 1.0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat( ctx, "radius", 1.0 );

            /**
             * The height field specifies the height of the cylinder along the central axis.
             * @var {x3dom.fields.SFFloat} height
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Cylinder
             * @initvalue 2.0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat( ctx, "height", 2.0 );

            /**
             * The bottom field specifies whether the bottom cap of the cylinder is created.
             * @var {x3dom.fields.SFBool} bottom
             * @memberof x3dom.nodeTypes.Cylinder
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool( ctx, "bottom", true );

            /**
             * The top field specifies whether the top cap of the cylinder is created.
             * @var {x3dom.fields.SFBool} top
             * @memberof x3dom.nodeTypes.Cylinder
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool( ctx, "top", true );

            /**
             * Specifies the number of faces that are generated to approximate the sides of the cylinder.
             * @var {x3dom.fields.SFFloat} subdivision
             * @range [2, inf]
             * @memberof x3dom.nodeTypes.Cylinder
             * @initvalue 32
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat( ctx, "subdivision", 32 );

            /**
             * The side field specifies whether sides of the cylinder are created.
             * @var {x3dom.fields.SFBool} side
             * @memberof x3dom.nodeTypes.Cylinder
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool( ctx, "side", true );

            var sides = this._vf.subdivision;
            var ccw = this._vf.ccw;

            var geoCacheID = [ "Cylinder", this._vf.radius, this._vf.height, this._vf.bottom, this._vf.top, this._vf.side, sides, ccw ].join( "_" );

            if ( this._vf.useGeoCache && x3dom.geoCache[ geoCacheID ] !== undefined )
            {
                //x3dom.debug.logInfo("Using Cylinder from Cache");
                this._mesh = x3dom.geoCache[ geoCacheID ];
            }
            else
            {
                var radius = this._vf.radius;
                var height = this._vf.height / 2;
                var nSign = ccw ? 1 : -1;

                var beta,
                    x,
                    z,
                    delta = 2.0 * Math.PI / sides,
                    j,
                    k;

                if ( this._vf.side )
                {
                    for ( j = 0, k = 0; j <= sides; j++ )
                    {
                        beta = j * delta;
                        x = Math.sin( beta );
                        z = -Math.cos( beta );

                        this._mesh._positions[ 0 ].push( x * radius, -height, z * radius );
                        this._mesh._normals[ 0 ].push( nSign * x, 0, nSign * z );
                        this._mesh._texCoords[ 0 ].push( 1.0 - j / sides, 0 );

                        this._mesh._positions[ 0 ].push( x * radius, height, z * radius );
                        this._mesh._normals[ 0 ].push( nSign * x, 0, nSign * z );
                        this._mesh._texCoords[ 0 ].push( 1.0 - j / sides, 1 );

                        if ( j > 0 )
                        {
                            this._mesh._indices[ 0 ].push( k + 0, k + 1, k + 2 );
                            this._mesh._indices[ 0 ].push( k + 2, k + 1, k + 3 );

                            k += 2;
                        }
                    }
                }

                if ( radius > 0 )
                {
                    var h,
                        base = this._mesh._positions[ 0 ].length / 3;

                    if ( this._vf.top )
                    {
                        for ( j = sides - 1; j >= 0; j-- )
                        {
                            beta = j * delta;
                            x = radius * Math.sin( beta );
                            z = -radius * Math.cos( beta );

                            this._mesh._positions[ 0 ].push( x, height, z );
                            this._mesh._normals[ 0 ].push( 0, nSign * 1, 0 );
                            this._mesh._texCoords[ 0 ].push( x / radius / 2 + 0.5, -z / radius / 2 + 0.5 );
                        }

                        h = base + 1;

                        for ( j = 2; j < sides; j++ )
                        {
                            this._mesh._indices[ 0 ].push( base );
                            this._mesh._indices[ 0 ].push( h );

                            h = base + j;
                            this._mesh._indices[ 0 ].push( h );
                        }

                        base = this._mesh._positions[ 0 ].length / 3;
                    }

                    if ( this._vf.bottom )
                    {
                        for ( j = sides - 1; j >= 0; j-- )
                        {
                            beta = j * delta;
                            x = radius * Math.sin( beta );
                            z = -radius * Math.cos( beta );

                            this._mesh._positions[ 0 ].push( x, -height, z );
                            this._mesh._normals[ 0 ].push( 0, nSign * -1, 0 );
                            this._mesh._texCoords[ 0 ].push( x / radius / 2 + 0.5, z / radius / 2 + 0.5 );
                        }

                        h = base + 1;

                        for ( j = 2; j < sides; j++ )
                        {
                            this._mesh._indices[ 0 ].push( h );
                            this._mesh._indices[ 0 ].push( base );

                            h = base + j;
                            this._mesh._indices[ 0 ].push( h );
                        }
                    }
                }

                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[ 0 ].length / 3;
                this._mesh._numCoords = this._mesh._positions[ 0 ].length / 3;

                x3dom.geoCache[ geoCacheID ] = this._mesh;
            }
        },
        {
            fieldChanged : function ( fieldName )
            {
                if ( fieldName === "radius" || fieldName === "height" )
                {
                    this._mesh._positions[ 0 ] = [];

                    var radius = this._vf.radius,
                        height = this._vf.height / 2;
                    var sides = this._vf.subdivision;

                    var beta,
                        x,
                        z,
                        j;
                    var delta = 2.0 * Math.PI / sides;

                    if ( this._vf.side )
                    {
                        for ( j = 0; j <= sides; j++ )
                        {
                            beta = j * delta;
                            x = Math.sin( beta );
                            z = -Math.cos( beta );

                            this._mesh._positions[ 0 ].push( x * radius, -height, z * radius );
                            this._mesh._positions[ 0 ].push( x * radius, height, z * radius );
                        }
                    }

                    if ( radius > 0 )
                    {
                        var h,
                            base = this._mesh._positions[ 0 ].length / 3;

                        if ( this._vf.top )
                        {
                            for ( j = sides - 1; j >= 0; j-- )
                            {
                                beta = j * delta;
                                x = radius * Math.sin( beta );
                                z = -radius * Math.cos( beta );

                                this._mesh._positions[ 0 ].push( x, height, z );
                            }
                        }
                    }

                    if ( this._vf.bottom )
                    {
                        for ( j = sides - 1; j >= 0; j-- )
                        {
                            beta = j * delta;
                            x = radius * Math.sin( beta );
                            z = -radius * Math.cos( beta );

                            this._mesh._positions[ 0 ].push( x, -height, z );
                        }
                    }

                    this.invalidateVolume();
                    this._mesh._numCoords = this._mesh._positions[ 0 ].length / 3;

                    this._parentNodes.forEach( function ( node )
                    {
                        node._dirty.positions = true;
                        node.invalidateVolume();
                    } );
                }
                else if ( fieldName === "subdivision" || fieldName === "bottom" ||
                    fieldName === "top" || fieldName === "side" )
                {
                    this._mesh._positions[ 0 ] = [];
                    this._mesh._indices[ 0 ] = [];
                    this._mesh._normals[ 0 ] = [];
                    this._mesh._texCoords[ 0 ] = [];

                    var radius = this._vf.radius,
                        height = this._vf.height / 2,
                        sides = this._vf.subdivision,
                        nSign = this._vf.ccw ? 1 : -1,

                        beta,
                        x,
                        z,
                        j;
                    var delta = 2.0 * Math.PI / sides;
                    var k = 0;

                    if ( this._vf.side )
                    {
                        for ( j = 0, k = 0; j <= sides; j++ )
                        {
                            beta = j * delta;
                            x = Math.sin( beta );
                            z = -Math.cos( beta );

                            this._mesh._positions[ 0 ].push( x * radius, -height, z * radius );
                            this._mesh._normals[ 0 ].push( nSign * x, 0, nSign * z );
                            this._mesh._texCoords[ 0 ].push( 1.0 - j / sides, 0 );

                            this._mesh._positions[ 0 ].push( x * radius, height, z * radius );
                            this._mesh._normals[ 0 ].push( nSign * x, 0, nSign * z );
                            this._mesh._texCoords[ 0 ].push( 1.0 - j / sides, 1 );

                            if ( j > 0 )
                            {
                                this._mesh._indices[ 0 ].push( k + 0, k + 1, k + 2 );
                                this._mesh._indices[ 0 ].push( k + 2, k + 1, k + 3 );

                                k += 2;
                            }
                        }
                    }

                    if ( radius > 0 )
                    {
                        var h,
                            base = this._mesh._positions[ 0 ].length / 3;

                        if ( this._vf.top )
                        {
                            for ( j = sides - 1; j >= 0; j-- )
                            {
                                beta = j * delta;
                                x = radius * Math.sin( beta );
                                z = -radius * Math.cos( beta );

                                this._mesh._positions[ 0 ].push( x, height, z );
                                this._mesh._normals[ 0 ].push( 0, nSign * 1, 0 );
                                this._mesh._texCoords[ 0 ].push( x / radius / 2 + 0.5, -z / radius / 2 + 0.5 );
                            }

                            h = base + 1;

                            for ( j = 2; j < sides; j++ )
                            {
                                this._mesh._indices[ 0 ].push( base );
                                this._mesh._indices[ 0 ].push( h );

                                h = base + j;
                                this._mesh._indices[ 0 ].push( h );
                            }

                            base = this._mesh._positions[ 0 ].length / 3;
                        }

                        if ( this._vf.bottom )
                        {
                            for ( j = sides - 1; j >= 0; j-- )
                            {
                                beta = j * delta;
                                x = radius * Math.sin( beta );
                                z = -radius * Math.cos( beta );

                                this._mesh._positions[ 0 ].push( x, -height, z );
                                this._mesh._normals[ 0 ].push( 0, nSign * -1, 0 );
                                this._mesh._texCoords[ 0 ].push( x / radius / 2 + 0.5, z / radius / 2 + 0.5 );
                            }

                            h = base + 1;

                            for ( j = 2; j < sides; j++ )
                            {
                                this._mesh._indices[ 0 ].push( h );
                                this._mesh._indices[ 0 ].push( base );

                                h = base + j;
                                this._mesh._indices[ 0 ].push( h );
                            }
                        }
                    }

                    this.invalidateVolume();
                    this._mesh._numFaces = this._mesh._indices[ 0 ].length / 3;
                    this._mesh._numCoords = this._mesh._positions[ 0 ].length / 3;

                    this._parentNodes.forEach( function ( node )
                    {
                        node.setAllDirty();
                        node.invalidateVolume();
                    } );
                }
            }
        }
    )
);
