/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### HAnimHumanoid ###
x3dom.registerNodeType(
    "HAnimHumanoid",
    "H-Anim",
    defineClass(x3dom.nodeTypes.Transform,
        
        /**
         * Constructor for HAnimHumanoid
         * @constructs x3dom.nodeTypes.HAnimHumanoid
         * @x3d 3.3
         * @component H-Anim
         * @status full
         * @extends x3dom.nodeTypes.Transform
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The HAnimHumanoid node is used to store human-readable data such as author and copyright information, as well as to store references to the HAnimJoint, HAnimSegment, and HAnimSite nodes in addition to serving as a container for the entire humanoid.
         * Thus, it serves as a central node for moving the humanoid through its environment.
         */
        function (ctx) {
            x3dom.nodeTypes.HAnimHumanoid.superClass.call(this, ctx);


            /**
             * The name field, which shall be present, and which shall not have the empty string value, 
             * stores the name of the humanoid defined by the Humanoid object.
             * @var {x3dom.fields.SFString} name
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue ""
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");

            /**
             * The version field stores the version of this International Standard to which the Humanoid object conforms.
             * The version value for International Standard V2.0  is "2.0".
             * @var {x3dom.fields.SFString} version
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue ""
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'version', "");

            /**
             * The info field consists of a sequence of strings, each of which is of the form term=value.
             * The following terms are defined in this International Standard:
             *   authorName
             *   authorEmail
             *   copyright
             *   creationDate
             *   usageRestrictions
             *   humanoidVersion
             *   age
             *   gender
             *   height
             *   weight
             * The gender term typically has a value of female, male or neuter. The humanoidVersion term refers to the version
             * of the humanoid being used, in order to track revisions to the data. It is not the same as the version field of 
             * the Humanoid object, which refers to the version of the H-Anim specification that was used when building the humanoid.
             * Additional term=value pairs may be included as needed for specific applications.
             * @var {x3dom.fields.MFString} info
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFString(ctx, 'info', []);

            /**
             * The joints field contains a list of references, one for each Joint object defined within the skeleton field hierarchy
             * of the Humanoid object. The order in which the joints are listed is irrelevant since the names of the joints are
             * stored in the Joint objects themselves. The references to contained Joint objects may be used to support inverse
             * kinematics (IK) and other motion tools animating nodes found within the skeleton field.
             * @var {x3dom.fields.MFNode} joints
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue x3dom.nodeTypes.HAnimJoint
             * @field x3d
             * @instance
             */
            this.addField_MFNode('joints', x3dom.nodeTypes.HAnimJoint);

            /**
             * The segments field contains a list of references, one for each Segment object defined within the skeleton
             * field hierarchy of the Humanoid object. The order in which the segments are listed is irrelevant since
             * the names of the segments are stored in the Segment objects themselves. The references to contained Segment
             * objects may be used to support inverse kinematics (IK) and other motion tools animating nodes found within the skeleton field.
             * @var {x3dom.fields.MFNode} segments
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue x3dom.nodeTypes.HAnimSegment
             * @field x3d
             * @instance
             */
            this.addField_MFNode('segments', x3dom.nodeTypes.HAnimSegment);

            /**
             * The sites field contains a list of references, one for each Site object defined within the skeleton
             * field hierarchy of the Humanoid object. The order in which the sites are listed is irrelevant since
             * the names of the sites are stored in the Site objects themselves. The references to contained Site objects
             * may be used to support inverse kinematics (IK) and other motion tools animating nodes found within the skeleton field.
             * @var {x3dom.fields.MFNode} sites
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue x3dom.nodeTypes.HAnimSite
             * @field x3d
             * @instance
             */
            this.addField_MFNode('sites', x3dom.nodeTypes.HAnimSite);

            /**
             * The skeleton field contains the humanoid_root Joint object. The Humanoid object is considered the parent object
             * of the humanoid_root Joint object and defines a coordinate space for the humanoid_root Joint object. Thus,
             * the Humanoid object's transformation affects the Joint object hierarchy in the skeleton field. A hierarchy of Joint
             * objects is defined for each H-Anim humanoid figure within the skeleton field of the Humanoid object and a hierarchical
             * definition of joints is present even when the geometry of the humanoid figure is not defined within the skeleton field.
             * The skeleton field can also contain zero or more Site objects which allow landmarks to be established with respect to
             * the overall humanoid figure, but which are not affected by the movement of any of the Joint objects.
             * @var {x3dom.fields.MFNode} skeleton
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue x3dom.nodeTypes.HAnimJoint
             * @field x3d
             * @instance
             */
            this.addField_MFNode('skeleton', x3dom.nodeTypes.HAnimJoint);

            /**
             * The skin field contains one or more indexed mesh definitions. Those indexed mesh definitions utilize the point
             * and normal data that is defined within the skinCoord and skinNormal fields, respectively, of the Humanoid object.
             * This field is defined as an generic type for which the specific representation is defined by each binding
             * to a presentation system.
             * @var {x3dom.fields.MFNode} skin
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue x3dom.nodeTypes.X3DChildNode
             * @field x3d
             * @instance
             */
            this.addField_MFNode('skin', x3dom.nodeTypes.X3DChildNode);

            /**
             * The skinCoord field contains a single sequence of points which are used by the internal mechanisms of the Humanoid
             * object to create the appropriate surface deformations as well as by the indexed mesh definitions within the skin field
             * which do the actual rendering of the surface geometry.
             * @var {x3dom.fields.SFNode} skinCoord
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue x3dom.nodeTypes.X3DCoordinateNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('skinCoord', x3dom.nodeTypes.X3DCoordinateNode);

            /**
             * The skinNormal field contains the normal data definition which is used by the internal mechanisms of the Humanoid
             * object to create the appropriate surface deformations as well as the indexed mesh definitions within the skin field
             * which contains the actual surface geometry that is rendered.
             * @var {x3dom.fields.SFNode} skinNormal
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue x3dom.nodeTypes.X3DNormalNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('skinNormal', x3dom.nodeTypes.X3DNormalNode);

            /**
             * The viewpoints field has a different functionality and behaviour than the joints, segments and sites fields.
             * The viewpoints field can contain zero or more Site object definitions. The Site objects defined within this field
             * are affected by the transformations applied to the Humanoid object, but are not affected by any of the transformations
             * performed on the skeletal hierarchy defined within the skeleton field. The purpose of these Site objects is to
             * define locations for virtual cameras in the reference frame of the Humanoid object. Site objects that are defined
             * in this manner are intended to be used as attachment points from which a certain viewing perspective can be seen
             * (such as viewing the face or profile of the human figure).
             * @var {x3dom.fields.MFNode} viewpoints
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue x3dom.nodeTypes.HAnimSite
             * @field x3d
             * @instance
             */
            this.addField_MFNode('viewpoints', x3dom.nodeTypes.HAnimSite);
        
            /**
             * The skeletalConfiguration field identifies the skeletal configuration of this model. Any models that share the
             * same skeletalConfiguration value can also share skeletal animation data. The only specific skeletal configuration
             * defined in this International Standard is the "BASIC" skeletal configuration specified in 4.8.1 Overview. Since the
             * default value of the skeletal configuration is "BASIC", a humanoid model that specifies a skeletalConfiguration value
             * of "BASIC" shall conform to the restrictive skeletal model specified in 4.8.1 Overview. For any other value 
             * the model shall also contain one or more of the five binding fields.
             * @var {x3dom.fields.MFVec3f} skeletalConfiguration
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue 'BASIC'
             * @field x3d
             * @instance
             */
            this.addField_SFString(ctx, 'skeletalConfiguration', 'BASIC');

            /**
             * The jointBindingPositions field specifies position values, respectively, associated with the array of Joint objects
             * contained in the joints field. If only one value is provided (such as the default value) then it is applied to all
             * listed Joint objects equivalently. Applying each set of these translation, rotation, and scale values, in order,
             * to the corresponding Joint objects maps a skeleton to the binding pose.
             * @var {x3dom.fields.MFVec3f} jointBindingPositions
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue [0 0 0]
             * @field x3d
             * @instance
             */
            this.addField_MFVec3f(ctx, 'jointBindingPositions', [0, 0, 0]);
        
            /**
             * The jointBindingRotations field specifies position values, respectively, associated with the array of Joint objects
             * contained in the joints field. If only one value is provided (such as the default value) then it is applied to all
             * listed Joint objects equivalently. Applying each set of these translation, rotation, and scale values, in order,
             * to the corresponding Joint objects maps a skeleton to the binding pose.
             * @var {x3dom.fields.MFVec3f} jointBindingRotations
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue  [0 0 1 0]
             * @field x3d
             * @instance
             */
            this.addField_MFRotation(ctx, 'jointBindingRotations', [0, 0, 1, 0]);
        
            /**
             * The jointBindingScales field specifies scale values, respectively, associated with the array of Joint objects
             * contained in the joints field. If only one value is provided (such as the default value) then it is applied to all
             * listed Joint objects equivalently. Applying each set of these translation, rotation, and scale values, in order,
             * to the corresponding Joint objects maps a skeleton to the binding pose.
             * @var {x3dom.fields.MFVec3f} jointBindingScales
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue [1 1 1]
             * @field x3d
             * @instance
             */
            this.addField_MFVec3f(ctx, 'jointBindingScales', [1, 1, 1]);
        
            /**
             * The skinBindingCoords field specifies an array of vertex locations that define the mesh in the binding pose.
             * For each set of values corresponding to a given pose, the same vertex indexing system that is used for the skinCoord
             * field also applies to this field.
             * @var {x3dom.fields.MFVec3f} skinBindingCoords
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec3f(ctx, 'skinBindingCoords', []);
 
            /**
             * The skinBindingNormals field specifies an array of normal vectors that define the mesh normal vectors in the
             * binding pose. For each set of values corresponding to a given pose, the same normal indexing system used for
             * the skinNormal field also applies to this field.
             * @var {x3dom.fields.MFVec3f} skinBindingNormals
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFVec3f(ctx, 'skinBindingNormals', []);
               
        },
        {
            collectDrawableObjects: function (transform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes)
            {
                // check if multi parent sub-graph, don't cache in that case
                if (singlePath && (this._parentNodes.length > 1))
                    singlePath = false;

                // an invalid world matrix or volume needs to be invalidated down the hierarchy
                if (singlePath && (invalidateCache = invalidateCache || this.cacheInvalid()))
                    this.invalidateCache();

                // check if sub-graph can be culled away or render flag was set to false
                planeMask = drawableCollection.cull(transform, this.graphState(), singlePath, planeMask);
                if (planeMask < 0) {
                    return;
                }

                var cnode, childTransform;

                if (singlePath) {
                    // rebuild cache on change and reuse world transform
                    if (!this._graph.globalMatrix) {
                        this._graph.globalMatrix = this.transformMatrix(transform);
                    }
                    childTransform = this._graph.globalMatrix;
                }
                else {
                    childTransform = this.transformMatrix(transform);
                }

                var n = this._childNodes.length;

                if (x3dom.nodeTypes.ClipPlane.count > 0) {
                    var localClipPlanes = [];

                    for (var j = 0; j < n; j++) {
                        if ( (cnode = this._childNodes[j]) ) {
                            if (x3dom.isa(cnode, x3dom.nodeTypes.ClipPlane) && cnode._vf.on && cnode._vf.enabled) {
                                localClipPlanes.push({plane: cnode, trafo: childTransform});
                            }
                        }
                    }

                    clipPlanes = localClipPlanes.concat(clipPlanes);
                }
                
                //reset skin coords and normals before traversing skeleton
                if (this._cf.skinCoord.node)
                    this._cf.skinCoord.node._vf.point.setValues(this._restCoords);
                
                if (this._cf.skinNormal.node)
                    this._cf.skinNormal.node._vf.vector.setValues(this._restNormals);

                
                this._cf.skeleton.nodes.forEach(function(cnode) {
                   cnode.collectDrawableObjects(childTransform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes);
                });
                
                this._cf.skin.nodes.forEach(function(cnode) {
                   cnode.collectDrawableObjects(childTransform, drawableCollection, singlePath, invalidateCache, planeMask, clipPlanes);
                });
                
                //force coord update
                if (this._cf.skinCoord.node) {
                    this._cf.skinCoord.node._parentNodes.forEach( function(node) {
                        node.fieldChanged('coord');// may need to be more general
                    });
                }
            },
        
            nodeChanged: function()
            {
                //save initial, resting pose
                if (this._cf.skinCoord.node)
                    this._restCoords = this._cf.skinCoord.node._vf.point.copy() ;
                if (this._cf.skinNormal.node)
                    this._restNormals = this._cf.skinNormal.node._vf.vector.copy();
            }
            // TODO skeleton   add functionality for HAnimSite also (unaffected by internal transformations)
            // TODO joints     add functionality: mostly done
            // TODO segments   add functionality: mostly done
            // TODO sites      add functionality: mostly done
            // TODO skin...    add functionality: move to shader
            // TODO viewpoints add functionality: seems to work
            // TODO binding fields: for non default configurations

        }
    )
);
