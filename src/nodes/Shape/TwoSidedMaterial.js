/** @namespace x3dom.nodeTypes */
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
        
        /**
         * Constructor for TwoSidedMaterial
         * @constructs x3dom.nodeTypes.TwoSidedMaterial
         * @x3d x.x
         * @component Shape
         * @status experimental
         * @extends x3dom.nodeTypes.X3DMaterialNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.TwoSidedMaterial.superClass.call(this, ctx);


            /**
             *
             * @var {SFFloat} backAmbientIntensity
             * @memberof x3dom.nodeTypes.TwoSidedMaterial
             * @initvalue 0.2
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'backAmbientIntensity', 0.2);

            /**
             *
             * @var {SFColor} backDiffuseColor
             * @memberof x3dom.nodeTypes.TwoSidedMaterial
             * @initvalue 0.8,0.8,0.8
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'backDiffuseColor', 0.8, 0.8, 0.8);

            /**
             *
             * @var {SFColor} backEmissiveColor
             * @memberof x3dom.nodeTypes.TwoSidedMaterial
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'backEmissiveColor', 0, 0, 0);

            /**
             *
             * @var {SFFloat} backShininess
             * @memberof x3dom.nodeTypes.TwoSidedMaterial
             * @initvalue 0.2
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'backShininess', 0.2);

            /**
             *
             * @var {SFColor} backSpecularColor
             * @memberof x3dom.nodeTypes.TwoSidedMaterial
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'backSpecularColor', 0, 0, 0);

            /**
             *
             * @var {SFFloat} backTransparency
             * @memberof x3dom.nodeTypes.TwoSidedMaterial
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'backTransparency', 0);

            /**
             *
             * @var {SFBool} separateBackColor
             * @memberof x3dom.nodeTypes.TwoSidedMaterial
             * @initvalue false
             * @field x3dom
             * @instance
             */
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