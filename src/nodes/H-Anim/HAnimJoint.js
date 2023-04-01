/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### HAnimJoint ###
x3dom.registerNodeType(
    "HAnimJoint",
    "H-Anim",
    defineClass( x3dom.nodeTypes.Transform,

        /**
         * Constructor for HAnimJoint
         * @constructs x3dom.nodeTypes.HAnimJoint
         * @x3d 3.3
         * @component H-Anim
         * @status experimental
         * @extends x3dom.nodeTypes.Transform
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc Each joint in the body is represented by an HAnimJoint node, which is used to define the relationship of each body segment to its immediate parent.
         * An HAnimJoint may only be a child of another HAnimJoint node or a child within the skeleton field in the case of the HAnimJoint used as a humanoid root (i.e., an HAnimJoint may not be a child of an HAnimSegment).
         * The HAnimJoint node is also used to store other joint-specific information. In particular, a joint name is provided so that applications can identify each HAnimJoint node at run-time.
         * The HAnimJoint node may contain hints for inverse-kinematics systems that wish to control the H-Anim figure.
         * These hints include the upper and lower joint limits, the orientation of the joint limits, and a stiffness/resistance value.
         */
        function ( ctx )
        {
            x3dom.nodeTypes.HAnimJoint.superClass.call( this, ctx );

            /**
             * Each Joint object shall have a name field, which shall not have the empty string value, that is used for identifying
             * the object. Within the local scope of a Humanoid object, each Joint object can be referenced by its name alone
             * (e.g., r_shoulder, l_hip, or skullbase). However, when referring to a Joint object within a larger or global scope,
             * the name of the Humanoid object shall be added as a distinguishing prefix.
             * @var {x3dom.fields.SFString} name
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue ""
             * @field x3d
             * @instance
             */
            this.addField_SFString( ctx, "name", "" );

            /**
             * The displacers field contains a list of Displacer objects that are used to morph the deformable mesh using
             * the morph targets defined in the Displacer objects.
             * @var {x3dom.fields.MFNode} displacers
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue x3dom.nodeTypes.HAnimDisplacer
             * @field x3d
             * @instance
             */
            this.addField_MFNode( "displacers", x3dom.nodeTypes.HAnimDisplacer );

            /**
             * The limitOrientation field gives the orientation of the coordinate frame in which the ulimit and llimit values
             * are to be interpreted. It describes the orientation of ulimit and llimit fields in the local coordinate frame,
             * relative to the Joint object centre position described by the center field.
             * @var {x3dom.fields.SFRotation} limitOrientation
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue 0 0 1 0
             * @field x3d
             * @instance
             */
            this.addField_SFRotation( ctx, "limitOrientation", "0 0 1 0" );

            /**
             * The llimit field specifies lower joint rotation limits. Its components storee the lower (i.e., minimum) values
             * for rotation around the X, Y and Z axes. A sequence containing zero elements indicates that the joint is unconstrained.
             * A non-empty sequence can only consist of a single three-value element. If ulimit and llimit values are provided,
             * both must be defined together. If llimit and ulimit are equal, no constraints are applied to Joint object rotations.
             * @var {x3dom.fields.MFFloat} llimit
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFFloat( ctx, "llimit", [] );

            /**
             * The ulimit field specifies the upper joint rotation limits. Its components store the upper (i.e. maximum) values for rotation
             * around the X, Y and Z axes. A sequence containing zero elements indicates that the joint is unconstrained. A non-empty
             * sequence can only consist of a single three-value element. If ulimit and llimit values are provided, both must be defined
             * together. If llimit and ulimit are equal, no constraints are applied to Joint object rotations.
             * @var {x3dom.fields.MFFloat} ulimit
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFFloat( ctx, "ulimit", [] );

            /**
             *
             * @var {x3dom.fields.MFInt32} skinCoordIndex
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFInt32( ctx, "skinCoordIndex", [] );

            /**
             * The skinCoordWeight field contains a list of floating point values between 0.0 and 1.0 that describe an amount
             * of weighting that should be used to affect a particular vertex from the skinCoord field of the Humanoid object.
             * Each item in this list has a corresponding index value in the skinCoordIndex field of the Joint object indicating
             * exactly which coordinate is to be influenced.
             * @var {x3dom.fields.MFFloat} skinCoordWeight
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFFloat( ctx, "skinCoordWeight", [] );

            /**
             * The stiffness field, if present, contains values that specify to an inverse kinematics (IK) system how much each degree
             * of freedom should scale the calculated joint rotation at each step of the IK solver. A scale factor of (1 - stiffness)
             * is applied around the corresponding axis (X, Y, or Z for entries 0, 1 and 2 of the stiffness field). Thus a stiffness
             * value of zero means that no rotation scaling occurs, while a stiffness value of one means that no rotation occurs
             * regardless of any provided rotation.
             * @var {x3dom.fields.MFFloat} stiffness
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @initvalue 0 0 0
             * @field x3d
             * @instance
             */
            this.addField_MFFloat( ctx, "stiffness", [ 0, 0, 0 ] );
        },
        {
            nodeChanged : function ()
            {
                this._humanoid = _findRoot( this._xmlNode );

                function _findRoot ( domNode )
                {
                    var parent = domNode.parentNode._x3domNode; //_parentNodes not yet available
                    if ( x3dom.isa( parent, x3dom.nodeTypes.Scene ) ) {return false;}
                    if ( x3dom.isa( parent, x3dom.nodeTypes.HAnimHumanoid ) ) {return parent;}
                    return _findRoot( parent._xmlNode );
                }
            },

            collectDrawableObjects : function ( transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes )
            {
                // check if multi parent sub-graph, don't cache in that case
                if ( singlePath && ( this._parentNodes.length > 1 ) )
                {singlePath = false;}

                // an invalid world matrix or volume needs to be invalidated down the hierarchy
                if ( singlePath && ( invalidateCache = invalidateCache || this.cacheInvalid() ) )
                {this.invalidateCache();}

                this.collectBbox( transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes );

                // check if sub-graph can be culled away or render flag was set to false
                planeMask = drawableCollection.cull( transform, this.graphState(), singlePath, planeMask );
                // do skinning in any case
                var skinCoord = this._humanoid._cf.skinCoord.node;
                if ( planeMask < 0 && !skinCoord )
                {
                    return;
                }

                var cnode,
                    childTransform;

                if ( singlePath )
                {
                    // rebuild cache on change and reuse world transform
                    if ( !this._graph.globalMatrix )
                    {
                        this._graph.globalMatrix = this.transformMatrix( transform );
                    }
                    childTransform = this._graph.globalMatrix;
                }
                else
                {
                    childTransform = this.transformMatrix( transform );
                }

                var n = this._childNodes.length;

                if ( x3dom.nodeTypes.ClipPlane.count > 0 )
                {
                    var localClipPlanes = [];

                    for ( var j = 0; j < n; j++ )
                    {
                        if ( ( cnode = this._childNodes[ j ] ) )
                        {
                            if ( x3dom.isa( cnode, x3dom.nodeTypes.ClipPlane ) && cnode._vf.on && cnode._vf.enabled )
                            {
                                localClipPlanes.push( {plane: cnode, trafo: childTransform} );
                            }
                        }
                    }

                    clipPlanes = localClipPlanes.concat( clipPlanes );
                }

                //skin

                var skinCoordIndex,
                    skinCoordWeight,
                    humanoid,
                    trafo,
                    displacers;

                if ( skinCoord )
                {
                    humanoid = this._humanoid;
                    trafo = humanoid.getCurrentTransform().inverse().mult( childTransform );//factor in root trafo

                    // first add displacers
                    displacers = this._cf.displacers.nodes;
                    if ( displacers.length !== 0 )
                    {
                        displacers.forEach( function ( displacer )
                        {
                            var weight = displacer._vf.weight;
                            var MFdisplacements = displacer._vf.displacements;
                            var offsets = MFdisplacements.length;
                            if ( offsets !== 0 )
                            {
                                displacer._vf.coordIndex.forEach( function ( coordIndex, i )
                                {
                                    skinCoord._vf.point[ coordIndex ] = skinCoord._vf.point[ coordIndex ]
                                        .addScaled( trafo.multMatrixVec( MFdisplacements[ i % offsets ] ), weight );
                                } );
                            }
                        } );
                    }

                    // then add weighted skinCoordIndex
                    skinCoordIndex = this._vf.skinCoordIndex;
                    if ( skinCoordIndex.length !== 0 )
                    {
                        skinCoordWeight = this._vf.skinCoordWeight;
                        //blend in contribution rel. to undeformed resting
                        skinCoordIndex.forEach( function ( coordIndex, i )
                        {
                            //update coord
                            var restCoord = humanoid._restCoords[ coordIndex ];
                            skinCoord._vf.point[ coordIndex ] = skinCoord._vf.point[ coordIndex ]
                                .add( trafo.multMatrixPnt( restCoord )
                                    .subtract( restCoord )
                                    .multiply( skinCoordWeight[ Math.min( i, skinCoordWeight.length - 1 ) ] )
                                ); //in case of not enough weights
                        } );
                    }
                }

                var skinNormal = this._humanoid._cf.skinNormal.node;
                if ( skinNormal )
                {
                    skinCoordIndex = this._vf.skinCoordIndex;
                    if ( skinCoordIndex.length !== 0 )
                    {
                        skinCoordWeight = this._vf.skinCoordWeight;
                        humanoid = this._humanoid;
                        // use inverse transpose for normal
                        trafo = humanoid.getCurrentTransform().inverse().mult( childTransform ).inverse().transpose();
                        //blend in contribution rel. to undeformed resting
                        skinCoordIndex.forEach( function ( coordIndex, i )
                        {
                            //update coord
                            var restNormal = humanoid._restNormals[ coordIndex ];
                            skinNormal._vf.vector[ coordIndex ] = skinNormal._vf.vector[ coordIndex ]
                                .add( trafo.multMatrixVec( restNormal )
                                    .subtract( restNormal )
                                    .multiply( skinCoordWeight[ Math.min( i, skinCoordWeight.length - 1 ) ] )
                                ); //in case of not enough weights
                        } );
                    }
                }

                for ( var i = 0; i < n; i++ )
                {
                    if ( ( cnode = this._childNodes[ i ] ) )
                    {
                        cnode.collectDrawableObjects( childTransform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes );
                    }
                }
            }
        }

        //TODO: for skinned animation
        //custom collectDrawableObjects which receives skinCoord and skinNormal fields
        //or use fieldChanged and search for skinCoord
        //or search for Humanoid, skinCoord at nodeChanged
    )
);
