/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

x3dom.registerNodeType(
    "X3DBackgroundNode",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        function (ctx) {
            x3dom.nodeTypes.X3DBackgroundNode.superClass.call(this, ctx);

            this.addField_SFBool(ctx, 'withCredentials', false);

            this._dirty = true;
        },
        {
            getSkyColor: function() {
                return new x3dom.fields.SFColor(0,0,0);
            },
            getTransparency: function() {
                return 0;
            },
            getTexUrl: function() {
                return [];
            }
        }
    )
);