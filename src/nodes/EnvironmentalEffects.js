/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/* ### X3DBackgroundNode ### */
x3dom.registerNodeType(
    "X3DBackgroundNode",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        function (ctx) {
            x3dom.nodeTypes.X3DBackgroundNode.superClass.call(this, ctx);

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

/* ### X3DFogNode ### */
x3dom.registerNodeType(
    "X3DFogNode",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DBindableNode,
        function (ctx) {
            x3dom.nodeTypes.X3DFogNode.superClass.call(this, ctx);
        },
        {
        }
    )
);

/* ### Fog ### */
x3dom.registerNodeType(
    "Fog",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DFogNode,
        function (ctx) {
            x3dom.nodeTypes.Fog.superClass.call(this, ctx);

            this.addField_SFColor(ctx, 'color', 1, 1, 1);
            this.addField_SFString(ctx, 'fogType', "LINEAR");
            this.addField_SFFloat(ctx, 'visibilityRange', 0);
        },
        {
        }
    )
);


/* ### Background ### */
x3dom.registerNodeType(
    "Background",
    "EnvironmentalEffects",
    defineClass(x3dom.nodeTypes.X3DBackgroundNode,
        function (ctx) {
            x3dom.nodeTypes.Background.superClass.call(this, ctx);

            var trans = ctx.autoGen ? 1 : 0;

            this.addField_MFColor(ctx, 'skyColor', [new x3dom.fields.SFColor(0,0,0)]);
            this.addField_MFFloat(ctx, 'skyAngle', []);
            this.addField_MFColor(ctx, 'groundColor', []);
            this.addField_MFFloat(ctx, 'groundAngle', []);
            this.addField_SFFloat(ctx, 'transparency', trans);
            this.addField_MFString(ctx, 'backUrl', []);
            this.addField_MFString(ctx, 'bottomUrl', []);
            this.addField_MFString(ctx, 'frontUrl', []);
            this.addField_MFString(ctx, 'leftUrl', []);
            this.addField_MFString(ctx, 'rightUrl', []);
            this.addField_MFString(ctx, 'topUrl', []);
        },
        {
            fieldChanged: function(fieldName)
            {
                if (fieldName.indexOf("Url") > 0 ||
                    fieldName.search("sky") >= 0 || 
                    fieldName.search("ground") >= 0) {
                    this._dirty = true;
                }
                else if (fieldName === "set_bind") {
                    this.bind(this._vf.set_bind);
                }
            },

            getSkyColor: function() {
                return this._vf.skyColor;
            },

            getGroundColor: function() {
                return this._vf.groundColor;
            },

            getTransparency: function() {
                return this._vf.transparency;
            },

            getTexUrl: function() {
                return [
                    this._nameSpace.getURL(this._vf.backUrl[0]),
                    this._nameSpace.getURL(this._vf.frontUrl[0]),
                    this._nameSpace.getURL(this._vf.bottomUrl[0]),
                    this._nameSpace.getURL(this._vf.topUrl[0]),
                    this._nameSpace.getURL(this._vf.leftUrl[0]),
                    this._nameSpace.getURL(this._vf.rightUrl[0])
                ];
            }
        }
    )
);
