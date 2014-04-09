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
         * @x3d x.x
         * @component Lighting
         * @status experimental
         * @extends x3dom.nodeTypes.X3DLightNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.PointLight.superClass.call(this, ctx);


            /**
             *
             * @var {SFVec3f} attenuation
             * @memberof x3dom.nodeTypes.PointLight
             * @initvalue 1,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'attenuation', 1, 0, 0);

            /**
             *
             * @var {SFVec3f} location
             * @memberof x3dom.nodeTypes.PointLight
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFVec3f(ctx, 'location', 0, 0, 0);

            /**
             *
             * @var {SFFloat} radius
             * @memberof x3dom.nodeTypes.PointLight
             * @initvalue 100
             * @field x3dom
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