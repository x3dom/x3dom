/** @namespace x3dom.nodeTypes */
/*
 * HAnim Humanoid Animation component, X3D extension to the
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * Closely adapted from the code for the Grouping and CAD components in X3D as
 * implemented in X3DOM
 
 Dual licensed under the MIT and GPL.
 http://x3dom.org/download/dev/docs/html/license.html
 
 * Based on code originally provided by
 *  Philip Taylor: http://philip.html5.org
 
 * 30 NOV 2013  Don Brutzman
 */


// H-Anim (Humanoid Animation) Component
// http://www.web3d.org/files/specifications/19775-1/V3.3/Part01/components/hanim.html
// http://www.web3d.org/files/specifications/19774/V1.0/HAnim/HAnim.html

// ### HAnimDisplacer ###
x3dom.registerNodeType(
    "HAnimDisplacer",
    "H-Anim",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        
        /**
         * Constructor for HAnimDisplacer
         * @constructs x3dom.nodeTypes.HAnimDisplacer
         * @x3d x.x
         * @component H-Anim
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometricPropertyNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.HAnimDisplacer.superClass.call(this, ctx);


            /**
             *
             * @var {SFString} name
             * @memberof x3dom.nodeTypes.HAnimDisplacer
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx,'name', "");

            /**
             *
             * @var {SFFloat} weight
             * @memberof x3dom.nodeTypes.HAnimDisplacer
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'weight', 0);

            /**
             *
             * @var {MFInt32} coordIndex
             * @memberof x3dom.nodeTypes.HAnimDisplacer
             * @field x3dom
             * @instance
             */
            this.addField_MFInt32(ctx, 'coordIndex', []);

            /**
             *
             * @var {MFVec3f} displacements
             * @memberof x3dom.nodeTypes.HAnimDisplacer
             * @field x3dom
             * @instance
             */
            this.addField_MFVec3f(ctx, 'displacements', []);

            // TODO displacement (add functionality e.g. via matrix palette skinning in shader)
            x3dom.debug.logWarning("HAnimDisplacer NYI!");
        
        }
    )
);

// ### HAnimJoint ###
x3dom.registerNodeType(
    "HAnimJoint",
    "H-Anim",
    defineClass(x3dom.nodeTypes.Transform,
        
        /**
         * Constructor for HAnimJoint
         * @constructs x3dom.nodeTypes.HAnimJoint
         * @x3d x.x
         * @component H-Anim
         * @status experimental
         * @extends x3dom.nodeTypes.Transform
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.HAnimJoint.superClass.call(this, ctx);


            /**
             *
             * @var {SFString} name
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");

            /**
             *
             * @var {MFNode} displacers
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('displacers', x3dom.nodeTypes.HAnimDisplacer);
            

            /**
             *
             * @var {SFRotation} limitOrientation
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @field x3dom
             * @instance
             */
            this.addField_SFRotation(ctx, 'limitOrientation', 0, 0, 1, 0);

            /**
             *
             * @var {MFFloat} llimit
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'llimit', []);

            /**
             *
             * @var {MFFloat} ulimit
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'ulimit', []);

            /**
             *
             * @var {MFInt32} skinCoordIndex
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @field x3dom
             * @instance
             */
            this.addField_MFInt32(ctx, 'skinCoordIndex', []);

            /**
             *
             * @var {MFFloat} skinCoordWeight
             * @memberof x3dom.nodeTypes.HAnimJoint
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'skinCoordWeight', []);
        
        }
    )
);

// ### HAnimSegment ###
x3dom.registerNodeType(
    "HAnimSegment",
    "H-Anim",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        
        /**
         * Constructor for HAnimSegment
         * @constructs x3dom.nodeTypes.HAnimSegment
         * @x3d x.x
         * @component H-Anim
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGroupingNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.HAnimSegment.superClass.call(this, ctx);


            /**
             *
             * @var {SFString} name
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx,'name', "");

            /**
             *
             * @var {SFVec3f} centerOfMass
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'centerOfMass', 0, 0, 0);

            /**
             *
             * @var {SFFloat} mass
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'mass', 0);

            /**
             *
             * @var {MFFloat} momentsOfInertia
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @field x3dom
             * @instance
             */
            this.addField_MFFloat(ctx, 'momentsOfInertia', [0, 0, 0, 0, 0, 0, 0, 0, 0]);


            /**
             *
             * @var {SFNode} coord
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('coord', x3dom.nodeTypes.X3DCoordinateNode);

            /**
             *
             * @var {MFNode} displacers
             * @memberof x3dom.nodeTypes.HAnimSegment
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('displacers', x3dom.nodeTypes.HAnimDisplacer);
        
        },
        {
            // TODO coord      add functionality
            // TODO displacers add functionality
        }
    )
);

// ### HAnimSite ###
x3dom.registerNodeType(
    "HAnimSite",
    "H-Anim",
    defineClass(x3dom.nodeTypes.Transform,
        
        /**
         * Constructor for HAnimSite
         * @constructs x3dom.nodeTypes.HAnimSite
         * @x3d x.x
         * @component H-Anim
         * @status experimental
         * @extends x3dom.nodeTypes.Transform
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.HAnimSite.superClass.call(this, ctx);


            /**
             *
             * @var {SFString} name
             * @memberof x3dom.nodeTypes.HAnimSite
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");
        
        }
    )
);

// ### HAnimHumanoid ###
x3dom.registerNodeType(
    "HAnimHumanoid",
    "H-Anim",
    defineClass(x3dom.nodeTypes.Transform,
        
        /**
         * Constructor for HAnimHumanoid
         * @constructs x3dom.nodeTypes.HAnimHumanoid
         * @x3d x.x
         * @component H-Anim
         * @status experimental
         * @extends x3dom.nodeTypes.Transform
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.HAnimHumanoid.superClass.call(this, ctx);


            /**
             *
             * @var {SFString} name
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");

            /**
             *
             * @var {SFString} version
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'version', "");

            /**
             *
             * @var {MFString} info
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'info', []);


            /**
             *
             * @var {MFNode} joints
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('joints', x3dom.nodeTypes.HAnimJoint);

            /**
             *
             * @var {MFNode} segments
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('segments', x3dom.nodeTypes.HAnimSegment);

            /**
             *
             * @var {MFNode} sites
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('sites', x3dom.nodeTypes.HAnimSite);

            /**
             *
             * @var {MFNode} skeleton
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('skeleton', x3dom.nodeTypes.HAnimJoint);

            /**
             *
             * @var {MFNode} skin
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('skin', x3dom.nodeTypes.X3DChildNode);

            /**
             *
             * @var {MFNode} skinCoord
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('skinCoord', x3dom.nodeTypes.X3DCoordinateNode);

            /**
             *
             * @var {MFNode} skinNormal
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('skinNormal', x3dom.nodeTypes.X3DNormalNode);

            /**
             *
             * @var {MFNode} viewpoints
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('viewpoints', x3dom.nodeTypes.HAnimSite);
        
        },
        {
            // TODO skeleton   contains the HumanoidRoot Joint object functionality: map similar to children of Group
            // TODO skeleton   add functionality for HAnimSite also (unaffected by internal transformations)
            // TODO joints     add functionality
            // TODO segments   add functionality
            // TODO sites      add functionality
            // TODO skin...    add functionality
            // TODO viewpoints add functionality
        }
    )
);
