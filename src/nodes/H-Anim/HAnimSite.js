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
             *
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