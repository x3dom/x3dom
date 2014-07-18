/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### SpotLight ### */
x3dom.registerNodeType(
    "SpotLight",
    "Lighting",
    defineClass(x3dom.nodeTypes.X3DLightNode,
        
        /**
         * Constructor for SpotLight
         * @constructs x3dom.nodeTypes.SpotLight
         * @x3d 3.3
         * @component Lighting
         * @status full
         * @extends x3dom.nodeTypes.X3DLightNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The SpotLight node defines a light source that emits light from a specific point along a specific direction vector and constrained within a solid angle.
         * Spotlights may illuminate geometry nodes that respond to light sources and intersect the solid angle defined by the SpotLight.
         * Spotlight nodes are specified in the local coordinate system and are affected by ancestors' transformations.
         */
        function (ctx) {
            x3dom.nodeTypes.SpotLight.superClass.call(this, ctx);


            /**
             * The direction field specifies the direction vector of the light's central axis defined in the local coordinate system.
             * @var {x3dom.fields.SFVec3f} direction
             * @memberof x3dom.nodeTypes.SpotLight
             * @initvalue 0,0,-1
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'direction', 0, 0, -1);

            /**
             * SpotLight node's illumination falls off with distance as specified by three attenuation coefficients. The attenuation factor is:
             * 1/max(attenuation[0] + attenuation[1] × r + attenuation[2] × r^2, 1)
             * where r is the distance from the light to the surface being illuminated.
             * The default is no attenuation.
             * An attenuation value of (0, 0, 0) is identical to (1, 0, 0). Attenuation values shall be greater than or equal to zero.
             * @var {x3dom.fields.SFVec3f} attenuation
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.SpotLight
             * @initvalue 1,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'attenuation', 1, 0, 0);

            /**
             * The location field specifies a translation offset of the centre point of the light source from the light's local coordinate system origin.
             * This point is the apex of the solid angle which bounds light emission from the given light source.
             * Location is affected by ancestors' transformations.
             * @var {x3dom.fields.SFVec3f} location
             * @memberof x3dom.nodeTypes.SpotLight
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFVec3f(ctx, 'location', 0, 0, 0);

            /**
             * The radius field specifies the radial extent of the solid angle and the maximum distance from location that may be illuminated by the light source.
             * The light source does not emit light outside this radius. The radius shall be greater than or equal to zero.
             * Radius is affected by ancestors' transformations.
             * @var {x3dom.fields.SFFloat} radius
             * @range [0, inf]
             * @memberof x3dom.nodeTypes.SpotLight
             * @initvalue 100
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'radius', 100);

            /**
             *  The beamWidth field specifies an inner solid angle in which the light source emits light at uniform full intensity.
             *  The light source's emission intensity drops off from the inner solid angle (beamWidth) to the outer solid angle (cutOffAngle).
             *  If the beamWidth is greater than the cutOffAngle, beamWidth is defined to be equal to the cutOffAngle and the light source emits full intensity within the entire solid angle defined by cutOffAngle.
             * @var {x3dom.fields.SFFloat} beamWidth
             * @range [0, pi/2]
             * @memberof x3dom.nodeTypes.SpotLight
             * @initvalue 1.5707963
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'beamWidth', 1.5707963);

            /**
             * The cutOffAngle field specifies the outer bound of the solid angle. The light source does not emit light outside of this solid angle.
             * The light source's emission intensity drops off from the inner solid angle (beamWidth) to the outer solid angle (cutOffAngle).
             * If the beamWidth is greater than the cutOffAngle, beamWidth is defined to be equal to the cutOffAngle and the light source emits full intensity within the entire solid angle defined by cutOffAngle.
             * @range [0, pi/2]
             * @var {x3dom.fields.SFFloat} cutOffAngle
             * @memberof x3dom.nodeTypes.SpotLight
             * @initvalue 1.5707963
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'cutOffAngle', 1.5707963);

            /**
             *
             * @var {x3dom.fields.SFInt32} shadowCascades
             * @memberof x3dom.nodeTypes.SpotLight
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'shadowCascades', 1);

            /**
             *
             * @var {x3dom.fields.SFFloat} shadowSplitFactor
             * @memberof x3dom.nodeTypes.SpotLight
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'shadowSplitFactor', 1);

            /**
             *
             * @var {x3dom.fields.SFFloat} shadowSplitOffset
             * @memberof x3dom.nodeTypes.SpotLight
             * @initvalue 0.1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'shadowSplitOffset', 0.1);

            this._vf.global = true;
        
        },
        {
            getViewMatrix: function(vec) {
                var pos = this.getCurrentTransform().multMatrixPnt(this._vf.location);
                var dir = this.getCurrentTransform().multMatrixVec(this._vf.direction).normalize();
                var orientation = x3dom.fields.Quaternion.rotateFromTo(
                    new x3dom.fields.SFVec3f(0, 0, -1), dir);
                return orientation.toMatrix().transpose().
                    mult(x3dom.fields.SFMatrix4f.translation(pos.negate()));
            }
        }
    )
);
