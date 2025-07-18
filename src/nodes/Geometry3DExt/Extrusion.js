/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Extrusion ### */
x3dom.registerNodeType(
    "Extrusion",
    "Geometry3DExt",
    defineClass( x3dom.nodeTypes.X3DGeometryNode,

        /**
         * Constructor for Extrusion
         * @constructs x3dom.nodeTypes.Extrusion
         * @x3d 3.3
         * @component Geometry3DExt
         * @status full
         * @extends x3dom.nodeTypes.X3DGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Extrusion node specifies geometric shapes based on a two dimensional cross-section extruded along a three dimensional spine in the local coordinate system. The cross-section can be scaled and rotated at each spine point to produce a wide variety of shapes.
         */
        function ( ctx )
        {
            x3dom.nodeTypes.Extrusion.superClass.call( this, ctx );

            /**
             * Specifies whether the beginCap should exist.
             * @var {x3dom.fields.SFBool} beginCap
             * @memberof x3dom.nodeTypes.Extrusion
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool( ctx, "beginCap", true );

            /**
             * Specifies whether the endCap should exist.
             * @var {x3dom.fields.SFBool} endCap
             * @memberof x3dom.nodeTypes.Extrusion
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool( ctx, "endCap", true );

            /**
             * The convex field indicates whether all polygons in the shape are convex.
             * @var {x3dom.fields.SFBool} convex
             * @memberof x3dom.nodeTypes.Extrusion
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool( ctx, "convex", true );

            /**
             * The creaseAngle field affects how default normals are generated.
             * If the angle between the geometric normals of two adjacent faces is less than the crease angle, normals shall be calculated so that the faces are shaded smoothly across the edge; otherwise, normals shall be calculated so that a lighting discontinuity across the edge is produced.
             * Crease angles shall be greater than or equal to 0.0 angle base units.
             * @var {x3dom.fields.SFFloat} creaseAngle
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Extrusion
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat( ctx, "creaseAngle", 0 );

            /**
             * Describes the cross section as a 2D piecewise linear curve (series of connected vertices).
             * @var {x3dom.fields.MFVec2f} crossSection
             * @memberof x3dom.nodeTypes.Extrusion
             * @initvalue [(1,1), (1, -1), (-1, -1), (-1, 1), (1, 1)]
             * @field x3d
             * @instance
             */
            this.addField_MFVec2f( ctx, "crossSection", [
                new x3dom.fields.SFVec2f( 1, 1 ),
                new x3dom.fields.SFVec2f( 1, -1 ),
                new x3dom.fields.SFVec2f( -1, -1 ),
                new x3dom.fields.SFVec2f( -1, 1 ),
                new x3dom.fields.SFVec2f( 1, 1 )
            ] );

            /**
             * Defines an array of orientations for each extrusion step.
             * @var {x3dom.fields.MFRotation} orientation
             * @memberof x3dom.nodeTypes.Extrusion
             * @initvalue [(0,0,0,1)]
             * @field x3d
             * @instance
             */
            this.addField_MFRotation( ctx, "orientation", [ new x3dom.fields.Quaternion( 0, 0, 0, 1 ) ] );

            /**
             * Defines an array of 2D scale values for each extrusion step.
             * @var {x3dom.fields.MFVec2f} scale
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Extrusion
             * @initvalue [(1,1)]
             * @field x3d
             * @instance
             */
            this.addField_MFVec2f( ctx, "scale", [ new x3dom.fields.SFVec2f( 1, 1 ) ] );

            /**
             * Describes the spine as a 3D piecewise linear curve (series of conntected vertices).
             * @var {x3dom.fields.MFVec3f} spine
             * @memberof x3dom.nodeTypes.Extrusion
             * @initvalue [(0,0,0)]
             * @field x3d
             * @instance
             */
            this.addField_MFVec3f( ctx, "spine", [ new x3dom.fields.SFVec3f( 0, 0, 0 ),
                new x3dom.fields.SFVec3f( 0, 1, 0 )
            ] );

            /**
             * Convenience field for setting default spine.
             * @var {x3dom.fields.SFFloat} height
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.Extrusion
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat( ctx, "height", 0 );

            // http://www.web3d.org/files/specifications/19775-1/V3.3/Part01/components/geometry3D.html#Extrusion
            // http://accad.osu.edu/~pgerstma/class/vnv/resources/info/AnnotatedVrmlRef/ch3-318.htm
            this.rebuildGeometry();
        },
        {
            // this is called when the node is added to the scene graph
            // nodeChanged: function ()
            // {
            //     this.rebuildGeometry();
            // },

            rebuildGeometry : function ()
            {
                var positions0 = this._mesh._positions[ 0 ] = [],
                    texCoords0 = this._mesh._texCoords[ 0 ] = [],
                    indices0 = this._mesh._indices[ 0 ]     = [];

                var i,
                    im1,
                    j,
                    jm1,
                    n,
                    m,
                    len,
                    sx = 1,
                    sy = 1;

                var spine = this._vf.spine,
                    scale = this._vf.scale,
                    orientation = this._vf.orientation,
                    crossSection = this._vf.crossSection;

                var positions = [],
                    seamMergers = [],
                    seamRing = [],
                    seamIndices = [],
                    startIndex = 0,
                    index = 0;

                m = spine.length;
                n = crossSection.length;

                //x3dom.debug.logInfo( "Extrusion: m = " + m + ", n = " + n );
                // x3dom.debug.logError( "spine: " + spine.toString()  );

                if ( /*m == 0 &&*/ this._vf.height > 0 )
                {
                    spine[ 0 ] = new x3dom.fields.SFVec3f( 0, 0, 0 );
                    spine[ 1 ] = new x3dom.fields.SFVec3f( 0, this._vf.height, 0 );
                    m = 2;
                }

                var x = new x3dom.fields.SFVec3f( 1, 0, 0 ),
                    y = new x3dom.fields.SFVec3f( 0, 1, 0 ),
                    z = new x3dom.fields.SFVec3f( 0, 0, 1 );
                var last_z = new x3dom.fields.SFVec3f( 0, 0, 1 );
                var last_z_candidate,
                    y_collinear,
                    rotYtoy;
                var yAxis = new x3dom.fields.SFVec3f( 0, 1, 0 ),
                    zAxis = new x3dom.fields.SFVec3f( 0, 0, 1 ),
                    pos = new x3dom.fields.SFVec3f( 0, 0, 0 ),
                    baseMat = x3dom.fields.SFMatrix4f.identity(),
                    rotMat = x3dom.fields.SFMatrix4f.identity();

                var texCoordV = 0;
                var texCoordsV = [ 0 ];
                var texCoordU = 0;
                var texCoordsU = [ 0 ];
                var texCoordUj = 0,
                    texCoordVi = 0,
                    texCoordUjm1 = 0,
                    texCoordVim1 = 0,
                    u = 0,
                    v = 0;

                var allCoincident = !spine.some( function ( p )
                { // check if all points in spine are coincident
                    return !p.equals( spine[ 0 ], x3dom.fields.Eps );
                } );

                for ( i = 1; i < m; i++ )
                {
                    v = allCoincident ? i : spine[ i ].subtract( spine[ i - 1 ] ).length();
                    texCoordV = texCoordV + v;
                    texCoordsV[ i ] = texCoordV;
                }

                var maxTexU_x = 0,
                    minTexU_x = 0,
                    helpMax;
                var maxTexU_z = 0,
                    minTexU_z = 0,
                    helpMin;

                for ( j = 1; j < n; j++ )
                {
                    u = crossSection[ j ].subtract( crossSection[ j - 1 ] ).length();
                    texCoordU = texCoordU + u;
                    texCoordsU[ j ] = texCoordU;

                    if ( j == 1 )
                    {
                        maxTexU_x = minTexU_x = crossSection[ j - 1 ].x;
                        maxTexU_z = minTexU_z = crossSection[ j - 1 ].y;
                    }

                    if ( maxTexU_x < crossSection[ j ].x )
                    {
                        maxTexU_x = crossSection[ j ].x;
                    }
                    if ( minTexU_x > crossSection[ j ].x )
                    {
                        minTexU_x = crossSection[ j ].x;
                    }
                    if ( maxTexU_z < crossSection[ j ].y )
                    {
                        maxTexU_z = crossSection[ j ].y;
                    }
                    if ( minTexU_z > crossSection[ j ].y )
                    {
                        minTexU_z = crossSection[ j ].y;
                    }
                }

                if ( Math.abs( maxTexU_x - minTexU_x ) < Math.abs( maxTexU_z - minTexU_z ) )
                {
                    helpMax = maxTexU_x;
                    helpMin = minTexU_x;
                    maxTexU_x = maxTexU_z;
                    minTexU_x = minTexU_z;
                    maxTexU_z = helpMax;
                    minTexU_z = helpMin;
                }

                var diffTexU_x = Math.abs( maxTexU_x - minTexU_x );
                var diffTexU_z = Math.abs( maxTexU_z - minTexU_z );

                if ( m > 2 && !allCoincident )
                {
                    for ( i = 1; i < m - 1; i++ )
                    {
                        last_z_candidate = spine[ i + 1 ].subtract( spine[ i ] ).cross( spine[ i - 1 ].subtract( spine[ i ] ) );
                        if ( last_z_candidate.length() > x3dom.fields.Eps )
                        {
                            last_z = x3dom.fields.SFVec3f.copy( last_z_candidate.normalize() );
                            break;
                        }
                    }

                    if ( last_z_candidate.length() < x3dom.fields.Eps ) // if no valid last_z_candidate was found, spine is a straight line
                    {
                        i = spine.findIndex( function ( p, index ) // find first point that is not equal to the first point
                        {
                            return !p.equals( spine[ 0 ], x3dom.fields.Eps );
                        } );

                        y_collinear = spine[ i ].subtract( spine[ 0 ] ).normalize();
                        rotYtoy = x3dom.fields.Quaternion.rotateFromTo( yAxis, y_collinear ).toMatrix();
                        last_z = rotYtoy.multMatrixVec( zAxis );
                    }
                }

                var spineClosed = ( m > 2 ) ? spine[ 0 ].equals( spine[ m - 1 ], x3dom.fields.Eps ) : false;
                var xsClosed = ( n > 2 ) ? crossSection[ 0 ].equals( crossSection[ n - 1 ], x3dom.fields.Eps ) : false;

                for ( i = 0; i < m; i++ )
                {
                    if ( ( len = scale.length ) > 0 )
                    {
                        if ( i < len )
                        {
                            sx = scale[ i ].x;
                            sy = scale[ i ].y;
                        }
                        else
                        {
                            sx = scale[ len - 1 ].x;
                            sy = scale[ len - 1 ].y;
                        }
                    }

                    //SCP
                    if ( allCoincident )
                    {
                        // redundant, for clarity
                        x.set( 1, 0, 0 );
                        y.set( 0, 1, 0 );
                        z.set( 0, 0, 1 );
                    }
                    else
                    {
                        if ( m > 2 )
                        {
                            if ( i == 0 )
                            {
                                if ( spineClosed )
                                {
                                    y = spine[ 1 ].subtract( spine[ m - 2 ] );
                                    z = spine[ 1 ].subtract( spine[ 0 ] ).cross( spine[ m - 2 ].subtract( spine[ 0 ] ) );
                                }
                                else
                                {
                                    y = spine[ 1 ].subtract( spine[ 0 ] );
                                    z = spine[ 2 ].subtract( spine[ 1 ] ).cross( spine[ 0 ].subtract( spine[ 1 ] ) );
                                }
                                if ( z.length() > x3dom.fields.Eps )
                                {
                                    if ( z.dot( last_z ) < 0 )
                                    {
                                        z = z.negate();
                                    }
                                    last_z = x3dom.fields.SFVec3f.copy( z );
                                }
                            }
                            else if ( i == m - 1 )
                            {
                                if ( spineClosed )
                                {
                                    y = spine[ 1 ].subtract( spine[ m - 2 ] );
                                    z = spine[ 1 ].subtract( spine[ 0 ] ).cross( spine[ m - 2 ].subtract( spine[ 0 ] ) );
                                }
                                else
                                {
                                    y = spine[ m - 1 ].subtract( spine[ m - 2 ] );
                                    z = spine[ i ].subtract( spine[ i - 1 ] ).cross( spine[ i - 2 ].subtract( spine[ i - 1 ] ) );//x3dom.fields.SFVec3f.copy( last_z );
                                }
                            }
                            else
                            {
                                y = spine[ i + 1 ].subtract( spine[ i - 1 ] );
                                z = spine[ i + 1 ].subtract( spine[ i ] ).cross( spine[ i - 1 ].subtract( spine[ i ] ) );
                            }
                        }
                        else if ( m == 2 )
                        {
                            y = spine[ 1 ].subtract( spine[ 0 ] );
                            rotYtoy = x3dom.fields.Quaternion.rotateFromTo( yAxis, y ).toMatrix();
                            z = rotYtoy.multMatrixVec( zAxis );
                        }
                        else
                        {
                            x3dom.debug.logError( "Extrusion: Invalid spine length: " + m + ". At least two points are required." );
                            return;
                        }

                        if ( z.dot( last_z ) < 0 )
                        {
                            z = z.negate();
                        }

                        y = y.normalize();
                        z = z.normalize();

                        if ( z.length() < x3dom.fields.Eps ) // is collinear with last scp
                        {
                            z = x3dom.fields.SFVec3f.copy( last_z );
                            if ( last_z_candidate.length() < x3dom.fields.Eps ) // all collinear
                            {
                                y = x3dom.fields.SFVec3f.copy( y_collinear );
                            }
                        }

                        if ( i != 0 )
                        {
                            last_z = x3dom.fields.SFVec3f.copy( z );
                        }

                        x = y.cross( z ).normalize();
                    }

                    baseMat.setValue( x, y, z );
                    rotMat = ( i < orientation.length ) ? orientation[ i ].toMatrix() :
                        ( ( orientation.length > 0 ) ? orientation[ orientation.length - 1 ].toMatrix() :
                            x3dom.fields.SFMatrix4f.identity() );

                    // cross section instances
                    for ( j = 0; j < n; j++ )
                    {
                        pos = new x3dom.fields.SFVec3f(
                            crossSection[ j ].x * sx,
                            0,
                            crossSection[ j ].y * sy );

                        pos = baseMat.multMatrixPnt( rotMat.multMatrixPnt( pos ) );
                        pos = pos.add( spine[ i ] );

                        pos.crossSection = crossSection[ j ];
                        positions.push( pos );

                        texCoordUj = texCoordsU[ j ] / texCoordU;
                        texCoordVi = texCoordsV[ i ] / texCoordV;

                        im1 = i - 1;
                        jm1 = j - 1;

                        if ( this._vf.creaseAngle <= x3dom.fields.Eps )
                        {
                            if ( i > 0 && j > 0 )
                            {
                                texCoordUjm1 = texCoordsU[ jm1 ] / texCoordU;
                                texCoordVim1 = texCoordsV[ im1 ] / texCoordV;

                                pos = positions[ ( im1 ) * n + ( jm1 ) ];
                                positions0.push( pos.x, pos.y, pos.z );
                                texCoords0.push( texCoordUjm1, texCoordVim1 );

                                pos = positions[ ( im1 ) * n + j ];
                                positions0.push( pos.x, pos.y, pos.z );
                                texCoords0.push( texCoordUj, texCoordVim1 );

                                pos = positions[ i * n + j ];
                                positions0.push( pos.x, pos.y, pos.z );
                                texCoords0.push( texCoordUj, texCoordVi );

                                indices0.push( index++, index++, index++ );

                                positions0.push( pos.x, pos.y, pos.z );
                                texCoords0.push( texCoordUj, texCoordVi );

                                pos = positions[ i * n + ( jm1 ) ];
                                positions0.push( pos.x, pos.y, pos.z );
                                texCoords0.push( texCoordUjm1, texCoordVi );

                                pos = positions[ ( im1 ) * n + ( jm1 ) ];
                                positions0.push( pos.x, pos.y, pos.z );
                                texCoords0.push( texCoordUjm1, texCoordVim1 );

                                indices0.push( index++, index++, index++ );
                            }
                        }
                        else
                        {
                            positions0.push( pos.x, pos.y, pos.z );
                            texCoords0.push( texCoordUj, texCoordVi );

                            if ( i > 0 && j > 0 )
                            {
                                //    j-1   j
                                // i   4----2=3  cross-section
                                //     |     /|
                                //     |    / |
                                //     |   /  |
                                //     |  /   |
                                // i-1 0=5----1
                                {
                                    indices0.push( ( im1 ) * n + ( jm1 ), ( im1 ) * n + j,  i   * n + j );
                                    indices0.push( i   * n + j,  i   * n + ( jm1 ), ( im1 ) * n + ( jm1 ) );
                                    startIndex = indices0.length - 6; // first point of first added triangle
                                    if ( xsClosed && j == 1 ) // add seam first indices
                                    {
                                        seamMergers.push( [ startIndex, startIndex + 5 ] );
                                        if ( i == 1 ) // also cover first ring
                                        {
                                            seamIndices = [ startIndex + 4 ];
                                        }
                                    }
                                    if ( xsClosed && j == n - 1 ) // add seam second indices
                                    {
                                        seamMergers[ seamMergers.length - 1 ].push( startIndex + 1 );
                                        if ( i == 1 )
                                        {
                                            seamIndices.push( startIndex + 2, startIndex + 3 );
                                            seamMergers.push( seamIndices );
                                        }
                                    }
                                    if ( spineClosed && i == 1 ) // add first cross-section
                                    {
                                        seamRing.push( [ startIndex, startIndex + 5 ] ); // first points on i-1
                                        if ( j == n - 1 )
                                        {
                                            seamRing.push( [ startIndex + 1 ] );
                                        }
                                    }
                                    if ( spineClosed && i == m - 1 ) // add last cross-section to first
                                    {
                                        seamRing[ j - 1 ].push( startIndex + 4 );
                                        if ( j == n - 1 )
                                        {
                                            seamRing[ j ].push( startIndex + 2, startIndex + 3 );
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if ( i == m - 1 )
                    {
                        var p0,
                            l,
                            startPos,
                            linklist,
                            linklist_indices;

                        // add bottom (1st cross-section)
                        if ( this._vf.beginCap )
                        {
                            linklist = new x3dom.DoublyLinkedList();
                            l = positions0.length / 3;

                            for ( j = 0; j < n; j++ )
                            {
                                linklist.appendNode( new x3dom.DoublyLinkedList.ListNode( positions[ j ], j ) );

                                if ( this._vf.creaseAngle > x3dom.fields.Eps )
                                {
                                    p0 = positions[ j ];
                                    positions0.push( p0.x, p0.y, p0.z );
                                    texCoords0.push( ( p0.crossSection.x - minTexU_x ) / diffTexU_x,
                                        ( p0.crossSection.y - minTexU_z ) / diffTexU_z );
                                }
                            }
                            if ( this._vf.ccw == false )
                            {linklist.invert();}

                            linklist_indices = x3dom.EarClipping.getIndexes( linklist );

                            for ( j = linklist_indices.length - 1; j >= 0; j-- )
                            {
                                if ( this._vf.creaseAngle > x3dom.fields.Eps )
                                {
                                    indices0.push( l + linklist_indices[ j ] );
                                }
                                else
                                {
                                    p0 = positions[ linklist_indices[ j ] ];
                                    positions0.push( p0.x, p0.y, p0.z );
                                    texCoords0.push( ( p0.crossSection.x - minTexU_x ) / diffTexU_x,
                                        ( p0.crossSection.y - minTexU_z ) / diffTexU_z );
                                    indices0.push( index++ );
                                }
                            }
                        }

                        // add top (last cross-section)
                        if ( this._vf.endCap )
                        {
                            linklist = new x3dom.DoublyLinkedList();
                            startPos = ( m - 1 ) * n;
                            l = positions0.length / 3;

                            for ( j = 0; j < n; j++ )
                            {
                                linklist.appendNode( new x3dom.DoublyLinkedList.ListNode( positions[ startPos + j ], startPos + j ) );

                                if ( this._vf.creaseAngle > x3dom.fields.Eps )
                                {
                                    p0 = positions[ startPos + j ];
                                    positions0.push( p0.x, p0.y, p0.z );
                                    texCoords0.push( ( p0.crossSection.x - minTexU_x ) / diffTexU_x,
                                        ( p0.crossSection.y - minTexU_z ) / diffTexU_z );
                                }
                            }

                            if ( this._vf.ccw == false )
                            {linklist.invert();}

                            linklist_indices = x3dom.EarClipping.getIndexes( linklist );

                            for ( j = 0; j < linklist_indices.length; j++ )
                            {
                                if ( this._vf.creaseAngle > x3dom.fields.Eps )
                                {
                                    indices0.push( l + ( linklist_indices[ j ] - startPos ) );
                                }
                                else
                                {
                                    p0 = positions[ linklist_indices[ j ] ];
                                    positions0.push( p0.x, p0.y, p0.z );
                                    texCoords0.push( ( p0.crossSection.x - minTexU_x ) / diffTexU_x,
                                        ( p0.crossSection.y - minTexU_z ) / diffTexU_z );
                                    indices0.push( index++ );
                                }
                            }
                        }
                    }
                }

                this._mesh.calcNormals( this._vf.creaseAngle, this._vf.ccw );
                // adjust normals at seams for closed spines and cross-sections
                var normals = this._mesh._normals[ 0 ];
                var merged_normal = new x3dom.fields.SFVec3f( 0, 0, 0 );
                if ( seamMergers.length > 0 )
                {
                    seamMergers.concat( seamRing ).forEach( function ( seamIndices )
                    {
                        merged_normal.set( 0, 0, 0 );
                        seamIndices.forEach( function ( index )
                        {
                        // get average normal of all seam vertices
                            startIndex = indices0[ index ] * 3 ;
                            merged_normal.x += normals[ startIndex ];
                            merged_normal.y += normals[ startIndex + 1 ];
                            merged_normal.z += normals[ startIndex + 2 ];
                        }, this );
                        merged_normal.normalize();
                        seamIndices.forEach( function ( index )
                        {
                        // assign average normal of all seam vertices
                            startIndex = indices0[ index ] * 3 ;
                            normals[ startIndex ] = merged_normal.x;
                            normals[ startIndex + 1 ] = merged_normal.y;
                            normals[ startIndex + 2 ] = merged_normal.z;
                        }, this );
                    }, this );
                }
                this.invalidateVolume();
                numFaces = indices0.length / 3;
                numCoords = positions0.length / 3;
            },

            fieldChanged : function ( fieldName )
            {
                if ( fieldName == "beginCap" || fieldName == "endCap" ||
                    fieldName == "crossSection" || fieldName == "orientation" ||
                    fieldName == "scale" || fieldName == "spine" ||
                    fieldName == "height" || fieldName == "creaseAngle" )
                {
                    this.rebuildGeometry();

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