/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### ClipPlane ### */
x3dom.registerNodeType(
    "ClipPlane",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DChildNode,

        /**
         * Constructor for ClipPlane
         * @constructs x3dom.nodeTypes.ClipPlane
         * @x3d 3.2
         * @component Rendering
         * @status full
         * @extends x3dom.nodeTypes.X3DChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc A clip plane is defined as a plane that generates two half-spaces. The effected geometry in the
         * half-space that is defined as being outside the plane is removed from the rendered image as a result of a
         * clipping operation.
         */
            function (ctx) {
            x3dom.nodeTypes.ClipPlane.superClass.call(this, ctx);


            /**
             * Defines activation state of the clip plane.
             * @var {x3dom.fields.SFBool} enabled
             * @memberof x3dom.nodeTypes.ClipPlane
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'enabled', true);

            /**
             * The ClipPlane node specifies a single plane equation that will be used to clip the geometry.
             * The plane field specifies a four-component plane equation that describes the inside and outside half
             * space. The first three components are a normalized vector describing the direction of the plane's
             * normal direction.
             * @var {x3dom.fields.SFVec4f} plane
             * @memberof x3dom.nodeTypes.ClipPlane
             * @initvalue 0,1,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec4f(ctx, 'plane', 0, 1, 0, 0);

            /**
             * Defines the strength of the capping.
             * @var {x3dom.fields.SFFloat} cappingStrength
             * @memberof x3dom.nodeTypes.ClipPlane
             * @initvalue 0.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'cappingStrength', 0.0);

            /**
             * Defines the color of the capping.
             * @var {x3dom.fields.SFColor} cappingColor
             * @memberof x3dom.nodeTypes.ClipPlane
             * @initvalue 1.0,1.0,1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'cappingColor', 1.0, 1.0, 1.0);


            /**
             * Enables/disables this effector (e.g. light)
             * @var {x3dom.fields.SFBool} on
             * @memberof x3dom.nodeTypes.ClipPlane
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'on', true);
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "enabled" || fieldName == "on") {
                    //TODO
                }
            },

            nodeChanged: function () {
                x3dom.nodeTypes.ClipPlane.count++;
            },

            onRemove: function() {
                x3dom.nodeTypes.ClipPlane.count--;
            },

            parentAdded: function(parent) {
            },

            parentRemoved: function(parent) {
                //TODO
            }
        }
    )
);

/** Static class ID counter (needed for caching) */
x3dom.nodeTypes.ClipPlane.count = 0;
