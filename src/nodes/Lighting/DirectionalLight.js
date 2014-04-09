/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### DirectionalLight ### */
x3dom.registerNodeType(
    "DirectionalLight",
    "Lighting",
    defineClass(x3dom.nodeTypes.X3DLightNode,
        
        /**
         * Constructor for DirectionalLight
         * @constructs x3dom.nodeTypes.DirectionalLight
         * @x3d x.x
         * @component Lighting
         * @status experimental
         * @extends x3dom.nodeTypes.X3DLightNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.DirectionalLight.superClass.call(this, ctx);


            /**
             *
             * @var {SFVec3f} direction
             * @memberof x3dom.nodeTypes.DirectionalLight
             * @initvalue 0,0,-1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'direction', 0, 0, -1);

            /**
             *
             * @var {SFInt32} shadowCascades
             * @memberof x3dom.nodeTypes.DirectionalLight
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'shadowCascades', 1);

            /**
             *
             * @var {SFFloat} shadowSplitFactor
             * @memberof x3dom.nodeTypes.DirectionalLight
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'shadowSplitFactor', 1);

            /**
             *
             * @var {SFFloat} shadowSplitOffset
             * @memberof x3dom.nodeTypes.DirectionalLight
             * @initvalue 0.1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'shadowSplitOffset', 0.1);
        
        },
        {
            getViewMatrix: function(vec) {
                var dir = this.getCurrentTransform().multMatrixVec(this._vf.direction).normalize();
                var orientation = x3dom.fields.Quaternion.rotateFromTo(
                    new x3dom.fields.SFVec3f(0, 0, -1), dir);
                return orientation.toMatrix().transpose().
                    mult(x3dom.fields.SFMatrix4f.translation(vec.negate()));
            }
        }
    )
);