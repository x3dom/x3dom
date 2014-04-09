/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### TwoSidedMaterial ### */
x3dom.registerNodeType(
    "TwoSidedMaterial",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DMaterialNode,
        function (ctx) {
            x3dom.nodeTypes.TwoSidedMaterial.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'backAmbientIntensity', 0.2);
            this.addField_SFColor(ctx, 'backDiffuseColor', 0.8, 0.8, 0.8);
            this.addField_SFColor(ctx, 'backEmissiveColor', 0, 0, 0);
            this.addField_SFFloat(ctx, 'backShininess', 0.2);
            this.addField_SFColor(ctx, 'backSpecularColor', 0, 0, 0);
            this.addField_SFFloat(ctx, 'backTransparency', 0);
            this.addField_SFBool(ctx, 'separateBackColor', false);
        },
        {
            fieldChanged: function(fieldName) {
                if (fieldName == "ambientIntensity" || fieldName == "diffuseColor" ||
                    fieldName == "emissiveColor" || fieldName == "shininess" ||
                    fieldName == "specularColor" || fieldName == "transparency" ||
                    fieldName == "backAmbientIntensity" || fieldName == "backDiffuseColor" ||
                    fieldName == "backEmissiveColor" || fieldName == "backShininess" ||
                    fieldName == "backSpecularColor" || fieldName == "backTransparency" ||
                    fieldName == "separateBackColor")
                {
                    Array.forEach(this._parentNodes, function (app) {
                        Array.forEach(app._parentNodes, function (shape) {
                            shape._dirty.material = true;
                        });
                        app.checkSortType();
                    });
                }
            }
        }
    )
);