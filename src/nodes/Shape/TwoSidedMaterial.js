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
    defineClass(x3dom.nodeTypes.Material,
        
        /**
         * Constructor for TwoSidedMaterial
         * @constructs x3dom.nodeTypes.TwoSidedMaterial
         * @x3d 3.3
         * @component Shape
         * @status full
         * @extends x3dom.nodeTypes.X3DMaterialNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This node defines material properties that can effect both the front and back side of a polygon individually.
         * These materials are used for both the front and back side of the geometry whenever the X3D lighting model is active.
         */
        function (ctx) {
            x3dom.nodeTypes.TwoSidedMaterial.superClass.call(this, ctx);


            /**
             * Defines the ambient intensity for the back side.
             * @var {x3dom.fields.SFFloat} backAmbientIntensity
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.TwoSidedMaterial
             * @initvalue 0.2
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'backAmbientIntensity', 0.2);

            /**
             * Defines the diffuse color for the back side.
             * @var {x3dom.fields.SFColor} backDiffuseColor
             * @memberof x3dom.nodeTypes.TwoSidedMaterial
             * @initvalue 0.8,0.8,0.8
             * @field x3d
             * @instance
             */
            this.addField_SFColor(ctx, 'backDiffuseColor', 0.8, 0.8, 0.8);

            /**
             * Defines the emissive color for the back side.
             * @var {x3dom.fields.SFColor} backEmissiveColor
             * @memberof x3dom.nodeTypes.TwoSidedMaterial
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFColor(ctx, 'backEmissiveColor', 0, 0, 0);

            /**
             * Defines the shininess for the back side.
             * @var {x3dom.fields.SFFloat} backShininess
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.TwoSidedMaterial
             * @initvalue 0.2
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'backShininess', 0.2);

            /**
             * Defines the specular color for the back side.
             * @var {x3dom.fields.SFColor} backSpecularColor
             * @memberof x3dom.nodeTypes.TwoSidedMaterial
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFColor(ctx, 'backSpecularColor', 0, 0, 0);

            /**
             * Defines the transparency for the back side.
             * @var {x3dom.fields.SFFloat} backTransparency
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.TwoSidedMaterial
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'backTransparency', 0);

            /**
             * If the separateBackColor field is set to TRUE, the rendering shall render the front and back faces of the geometry with different values.
             * If the value is FALSE, the front colours are used for both the front and back side of the polygon, as per the existing X3D lighting rules.
             * @var {x3dom.fields.SFBool} separateBackColor
             * @memberof x3dom.nodeTypes.TwoSidedMaterial
             * @initvalue false
             * @field x3d
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