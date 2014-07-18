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
             *
             * @var {x3dom.fields.SFString} name
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");

            /**
             *
             * @var {x3dom.fields.SFString} version
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'version', "");

            /**
             *
             * @var {x3dom.fields.MFString} info
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue []
             * @field x3dom
             * @instance
             */
            this.addField_MFString(ctx, 'info', []);


            /**
             *
             * @var {x3dom.fields.MFNode} joints
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue x3dom.nodeTypes.HAnimJoint
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('joints', x3dom.nodeTypes.HAnimJoint);

            /**
             *
             * @var {x3dom.fields.MFNode} segments
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue x3dom.nodeTypes.HAnimSegment
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('segments', x3dom.nodeTypes.HAnimSegment);

            /**
             *
             * @var {x3dom.fields.MFNode} sites
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue x3dom.nodeTypes.HAnimSite
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('sites', x3dom.nodeTypes.HAnimSite);

            /**
             *
             * @var {x3dom.fields.MFNode} skeleton
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue x3dom.nodeTypes.HAnimJoint
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('skeleton', x3dom.nodeTypes.HAnimJoint);

            /**
             *
             * @var {x3dom.fields.MFNode} skin
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue x3dom.nodeTypes.X3DChildNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('skin', x3dom.nodeTypes.X3DChildNode);

            /**
             *
             * @var {x3dom.fields.MFNode} skinCoord
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue x3dom.nodeTypes.X3DCoordinateNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('skinCoord', x3dom.nodeTypes.X3DCoordinateNode);

            /**
             *
             * @var {x3dom.fields.MFNode} skinNormal
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue x3dom.nodeTypes.X3DNormalNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('skinNormal', x3dom.nodeTypes.X3DNormalNode);

            /**
             *
             * @var {x3dom.fields.MFNode} viewpoints
             * @memberof x3dom.nodeTypes.HAnimHumanoid
             * @initvalue x3dom.nodeTypes.HAnimSite
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