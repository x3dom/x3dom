/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### PointLight ### */
x3dom.registerNodeType(
    "PointLight",
    "Lighting",
    defineClass(x3dom.nodeTypes.X3DLightNode,
        
        /**
         * Constructor for PointLight
         * @constructs x3dom.nodeTypes.PointLight
         * @x3d 3.3
         * @component Lighting
         * @status full
         * @extends x3dom.nodeTypes.X3DLightNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The PointLight node specifies a point light source at a 3D location in the local coordinate system.
         * A point light source emits light equally in all directions; that is, it is omnidirectional.
         * PointLight nodes are specified in the local coordinate system and are affected by ancestor transformations.
         */
        function (ctx) {
            x3dom.nodeTypes.PointLight.superClass.call(this, ctx);


            /**
             * PointLight node's illumination falls off with distance as specified by three attenuation coefficients. The attenuation factor is:
             * 1/max(attenuation[0] + attenuation[1] × r + attenuation[2] × r^2, 1)
             * where r is the distance from the light to the surface being illuminated.
             * The default is no attenuation.
             * An attenuation value of (0, 0, 0) is identical to (1, 0, 0). Attenuation values shall be greater than or equal to zero.
             * @var {x3dom.fields.SFVec3f} attenuation
             * @memberof x3dom.nodeTypes.PointLight
             * @initvalue 1,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'attenuation', 1, 0, 0);

            /**
             * The position of the Light
             * @var {x3dom.fields.SFVec3f} location
             * @memberof x3dom.nodeTypes.PointLight
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'location', 0, 0, 0);

            /**
             * A PointLight node illuminates geometry within radius length base units of its location.
             * Radius is affected by ancestors' transformations.
             * @var {x3dom.fields.SFFloat} radius
             * @memberof x3dom.nodeTypes.PointLight
             * @initvalue 100
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'radius', 100);

            this._vf.global = true;
        
        },
        {
            getViewMatrix: function(vec) {
                var pos = this.getCurrentTransform().multMatrixPnt(this._vf.location);
                var orientation = x3dom.fields.Quaternion.rotateFromTo(
                    new x3dom.fields.SFVec3f(0, 0, -1), vec);
                return orientation.toMatrix().transpose().
                    mult(x3dom.fields.SFMatrix4f.translation(pos.negate()));
            }
        }
    )
);