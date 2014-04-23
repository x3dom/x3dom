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
         * @x3d 3.3
         * @component Lighting
         * @status experimental
         * @extends x3dom.nodeTypes.X3DLightNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The DirectionalLight node defines a directional light source that illuminates along rays parallel to a given 3-dimensional vector.
         * A directional light source illuminates only the objects in its enclosing parent group.
         * The light may illuminate everything within this coordinate system, including all children and descendants of its parent group.
         * The accumulated transformations of the parent nodes affect the light.
         * DirectionalLight nodes do not attenuate with distance.
         */
        function (ctx) {
            x3dom.nodeTypes.DirectionalLight.superClass.call(this, ctx);


            /**
             * The direction field specifies the direction vector of the illumination emanating from the light source in the local coordinate system.
             * @var {x3dom.fields.SFVec3f} direction
             * @memberof x3dom.nodeTypes.DirectionalLight
             * @initvalue 0,0,-1
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'direction', 0, 0, -1);

            /**
             *
             * @var {x3dom.fields.SFInt32} shadowCascades
             * @memberof x3dom.nodeTypes.DirectionalLight
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'shadowCascades', 1);

            /**
             *
             * @var {x3dom.fields.SFFloat} shadowSplitFactor
             * @memberof x3dom.nodeTypes.DirectionalLight
             * @initvalue 1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'shadowSplitFactor', 1);

            /**
             *
             * @var {x3dom.fields.SFFloat} shadowSplitOffset
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