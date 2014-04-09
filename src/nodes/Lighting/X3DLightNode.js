/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DLightNode ### */
x3dom.registerNodeType(
    "X3DLightNode",
    "Lighting",
    defineClass(x3dom.nodeTypes.X3DChildNode,
        function (ctx) {
            x3dom.nodeTypes.X3DLightNode.superClass.call(this, ctx);

            if (ctx)
                ctx.doc._nodeBag.lights.push(this);
            else
                x3dom.debug.logWarning("X3DLightNode: No runtime context found!");

            this._lightID = 0;
            this._dirty = true;

            this.addField_SFFloat(ctx, 'ambientIntensity', 0);
            this.addField_SFColor(ctx, 'color', 1, 1, 1);
            this.addField_SFFloat(ctx, 'intensity', 1);
            this.addField_SFBool(ctx, 'global', false);
            this.addField_SFBool(ctx, 'on', true);
            this.addField_SFFloat(ctx, 'shadowIntensity', 0);
            this.addField_SFInt32(ctx, 'shadowMapSize', 1024);
            this.addField_SFInt32(ctx, 'shadowFilterSize', 0);
            this.addField_SFFloat(ctx, 'shadowOffset', 0);
            this.addField_SFFloat(ctx, 'zNear', -1);
            this.addField_SFFloat(ctx, 'zFar', -1);
        },
        {
            getViewMatrix: function(vec) {
                return x3dom.fields.SFMatrix4f.identity;
            },

            nodeChanged: function () {
                if(!this._lightID) {
                    this._lightID = ++x3dom.nodeTypes.X3DLightNode.lightID;
                }
            },

            fieldChanged: function(fieldName)
            {
                if (this._vf.hasOwnProperty(fieldName)) {
                    this._dirty = true;
                }
            },

            parentRemoved: function(parent)
            {
                if (this._parentNodes.length === 0) {
                    var doc = this.findX3DDoc();

                    for (var i=0, n=doc._nodeBag.lights.length; i<n; i++) {
                        if (doc._nodeBag.lights[i] === this) {
                            doc._nodeBag.lights.splice(i, 1);
                        }
                    }
                }
            }
        }
    )
);

/** Static class ID counter (needed for flash performance up) */
x3dom.nodeTypes.X3DLightNode.lightID = 0;