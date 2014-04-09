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
         * @x3d x.x
         * @component Lighting
         * @status experimental
         * @extends x3dom.nodeTypes.X3DLightNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.SpotLight.superClass.call(this, ctx);


            /**
             *
             * @var {SFVec3f} direction
             * @memberof x3dom.nodeTypes.SpotLight
             * @initvalue 0,0,-1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'direction', 0, 0, -1);

            /**
             *
             * @var {SFVec3f} attenuation
             * @memberof x3dom.nodeTypes.SpotLight
             * @initvalue 1,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'attenuation', 1, 0, 0);

            /**
             *
             * @var {SFVec3f} location
             * @memberof x3dom.nodeTypes.SpotLight
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'location', 0, 0, 0);

            /**
             *
             * @var {SFFloat} radius
             * @memberof x3dom.nodeTypes.SpotLight
             * @initvalue 100
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'radius', 100);

            /**
             *
             * @var {SFFloat} beamWidth
             * @memberof x3dom.nodeTypes.SpotLight
             * @initvalue 1.5707963
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'beamWidth', 1.5707963);

            /**
             *
             * @var {SFFloat} cutOffAngle
             * @memberof x3dom.nodeTypes.SpotLight
             * @initvalue 1.5707963
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'cutOffAngle', 1.5707963);

            /**
             *
             * @var {SFInt32} shadowCascades
             * @memberof x3dom.nodeTypes.SpotLight
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'shadowCascades', 1);

            /**
             *
             * @var {SFFloat} shadowSplitFactor
             * @memberof x3dom.nodeTypes.SpotLight
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'shadowSplitFactor', 1);

            /**
             *
             * @var {SFFloat} shadowSplitOffset
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
