/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### HAnimSegment ###
x3dom.registerNodeType(
    "HAnimSegment",
    "H-Anim",
    defineClass( x3dom.nodeTypes.X3DGroupingNode,

        /**
         * Constructor for HAnimSegment
         * @constructs x3dom.nodeTypes.HAnimSegment
         * @x3d 3.3
         * @component H-Anim
         * @status full
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Each body segment is stored in an HAnimSegment node.
         * The HAnimSegment node is a grouping node that will typically contain either a number of Shape nodes or perhaps Transform nodes that position the body part within its coordinate system.
         */
        function ( ctx )
        {
            x3dom.nodeTypes.HAnimSegment.superClass.call( this, ctx );

            /**
             * Each Segment object shall have a name field, which shall not have the empty string value, that is used for identifying
             * the object. Within the local scope of a Humanoid object, each Segment object can be referenced by its name alone
             * (e.g., r_upperarm, l_thigh, or skull). However, when referring to a Segment object within a larger or global scope,
             * the name of the Humanoid object shall be added as a distinguishing prefix.
             * @var {x3dom.fields.SFString} name
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @initvalue ""
             * @field x3d
             * @instance
             */
            this.addField_SFString( ctx, "name", "" );

            /**
             * The centerOfMass field is the location within the segment of its centre of mass.
             * @var {x3dom.fields.SFVec3f} centerOfMass
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f( ctx, "centerOfMass", 0, 0, 0 );

            /**
             * The mass field is the total mass of the segment. A value of -1 for mass specifies that no mass value is available.
             * @var {x3dom.fields.SFFloat} mass
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat( ctx, "mass", 0 );

            /**
             * The momentsOfInertia field contains the moment of inertia matrix. The first three elements are the first row
             * of the 3×3 matrix, the next three elements are the second row, and the final three elements are the third row.
             * @var {x3dom.fields.MFFloat} momentsOfInertia
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @initvalue [0,0,0,0,0,0,0,0,0]
             * @field x3d
             * @instance
             */
            this.addField_MFFloat( ctx, "momentsOfInertia", [ 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );

            /**
             * The coord field is used for Segment objects that have deformable meshes and shall contain coordinates referenced
             * from the indexed mesh for the Segment object. The coordinates are given the same name as the Segment object,
             * but with a "_coords" appended (e.g., "skull_coords").
             * @var {x3dom.fields.SFNode} coord
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @initvalue x3dom.nodeTypes.X3DCoordinateNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode( "coord", x3dom.nodeTypes.X3DCoordinateNode );

            /**
             * The displacers field stores the Displacer objects for a particular Segment object.
             * @var {x3dom.fields.MFNode} displacers
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @initvalue x3dom.nodeTypes.HAnimDisplacer
             * @field x3d
             * @instance
             */
            this.addField_MFNode( "displacers", x3dom.nodeTypes.HAnimDisplacer );
        },
        {
            nodeChanged : function ()
            {
                this._restCoord = this._cf.coord.node && this._cf.coord.node._vf.point.copy();
                this._field_changed = false;
            },

            graphState : function ()
            {
                //this._graph.needCulling = !this._humanoid._cf.skinCoord.node; //never cull if skinned
                //this._graph.needCulling = false; //never cull
                return this._graph;
            },

            onBeforeCollectChildNodes : function ( childTransform )
            {
                const segment = this;
                if ( !this._restCoord || !segment._field_changed ) {return;}
                const points = this._cf.coord.node._vf.point;
                points.setValues( segment._restCoord );
                //accumulate all displacements
                segment._cf.displacers.nodes.forEach( ( displacer ) =>
                {
                    const displacements = displacer._vf.displacements;
                    const w = displacer._vf.weight;
                    displacer._vf.coordIndex.forEach( ( coordIndex, index ) =>
                    {
                        const point = points[ coordIndex ];
                        const d = displacements[ index ];
                        points[ coordIndex ].set( point.x + w * d.x, point.y + w * d.y, point.z + w * d.z );
                    } );
                } );
                segment._cf.coord.node.fieldChanged( "point" );
                segment._field_changed = false;
                // var _pointString = JSON.stringify( this._vf.point );
                // if (  _pointString != this._lastPointString )
                {
                    // this._lastPointString = _pointString;
                    segment._cf.coord.node.postMessage( "point", segment._cf.coord.node._vf.point );
                }
            }
        }
    )
);
