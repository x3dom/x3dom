/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Coordinate ### */
x3dom.registerNodeType(
    "Coordinate",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DCoordinateNode,
        function (ctx) {
            x3dom.nodeTypes.Coordinate.superClass.call(this, ctx);

            this.addField_MFVec3f(ctx, 'point', []);
        },
        {
            getPoints: function() {
                return this._vf.point;
            }
        }
    )
);
