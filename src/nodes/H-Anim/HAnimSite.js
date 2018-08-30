/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

// ### HAnimSite ###
x3dom.registerNodeType(
    "HAnimSite",
    "H-Anim",
    defineClass(x3dom.nodeTypes.Transform,
        
        /**
         * Constructor for HAnimSite
         * @constructs x3dom.nodeTypes.HAnimSite
         * @x3d 3.3
         * @component H-Anim
         * @status full
         * @extends x3dom.nodeTypes.Transform
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc An HAnimSite node serves three purposes. The first is to define an "end effecter" location that can be used by an inverse kinematics system.
         * The second is to define an attachment point for accessories such as jewelry and clothing.
         * The third is to define a location for a virtual camera in the reference frame of an HAnimSegment (such as a view "through the eyes" of the humanoid for use in multi-user worlds).
         */
        function (ctx) {
            x3dom.nodeTypes.HAnimSite.superClass.call(this, ctx);


            /**
             * Each Site object shall have a name field that is used for identifying the object. Within the local scope of a Humanoid
             * object, each Site object can be referenced by its name alone (e.g., r_neck_base, l_femoral_lateral_epicn, sellion, etc.).
             * However, when referring to a Site object within a larger or global scope, the name of the Humanoid object shall be added
             * as a distinguishing prefix.
             * Depending on the intended purpose, the Site object's name field shall be altered to appropriately describe its function.
             * If used as an end effector, the Site object shall have a name consisting of the name of the Segment to which it is
             * attached with an "_tip" suffix appended. Site objects that are used to define viewpoint locations shall have a "_view"
             * suffix appended. Site objects that are not end effectors and not camera locations shall have an "_pt" suffix.
             * @var {x3dom.fields.SFString} name
             * @memberof x3dom.nodeTypes.HAnimSite
             * @initvalue ""
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'name', "");
        
        }
    )
);
