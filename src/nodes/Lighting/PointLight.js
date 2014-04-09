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
        function (ctx) {
            x3dom.nodeTypes.PointLight.superClass.call(this, ctx);

            this.addField_SFVec3f(ctx, 'attenuation', 1, 0, 0);
            this.addField_SFVec3f(ctx, 'location', 0, 0, 0);
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