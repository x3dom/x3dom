/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Material ### */
x3dom.registerNodeType(
    "Material",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DMaterialNode,
        
        /**
         * Constructor for Material
         * @constructs x3dom.nodeTypes.Material
         * @x3d 3.3
         * @component Shape
         * @status full
         * @extends x3dom.nodeTypes.X3DMaterialNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Material node specifies surface material properties for associated geometry nodes and is used by the X3D lighting equations during rendering.
         * All of the fields in the Material node range from 0.0 to 1.0.
         */
        function (ctx) {
            x3dom.nodeTypes.Material.superClass.call(this, ctx);

            /**
             * The ambientIntensity field specifies how much ambient light from light sources this surface shall reflect.
             * Ambient light is omnidirectional and depends only on the number of light sources, not their positions with respect to the surface.
             * Ambient colour is calculated as ambientIntensity × diffuseColor.
             * @var {x3dom.fields.SFFloat} ambientIntensity
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.X3DMaterialNode
             * @initvalue 0.2
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'ambientIntensity', 0.2);

            /**
             * The diffuseColor field reflects all X3D light sources depending on the angle of the surface with respect to the light source.
             * The more directly the surface faces the light, the more diffuse light reflects.
             * The emissiveColor field models "glowing" objects.
             * This can be useful for displaying pre-lit models (where the light energy of the room is computed explicitly), or for displaying scientific data.
             * @var {x3dom.fields.SFColor} diffuseColor
             * @memberof x3dom.nodeTypes.X3DMaterialNode
             * @initvalue 0.8,0.8,0.8
             * @field x3d
             * @instance
             */
            this.addField_SFColor(ctx, 'diffuseColor', 0.8, 0.8, 0.8);

            /**
             * The emissiveColor field models "glowing" objects.
             * This can be useful for displaying pre-lit models (where the light energy of the room is computed explicitly), or for displaying scientific data.
             * @var {x3dom.fields.SFColor} emissiveColor
             * @memberof x3dom.nodeTypes.X3DMaterialNode
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFColor(ctx, 'emissiveColor', 0, 0, 0);

            /**
             * The specularColor and shininess fields determine the specular highlights (e.g., the shiny spots on an apple).
             * When the angle from the light to the surface is close to the angle from the surface to the viewer, the specularColor is added to the diffuse and ambient colour calculations.
             * Lower shininess values produce soft glows, while higher values result in sharper, smaller highlights.
             * @var {x3dom.fields.SFFloat} shininess
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.X3DMaterialNode
             * @initvalue 0.2
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'shininess', 0.2);

            /**
             * The specularColor and shininess fields determine the specular highlights (e.g., the shiny spots on an apple).
             * When the angle from the light to the surface is close to the angle from the surface to the viewer, the specularColor is added to the diffuse and ambient colour calculations.
             * Lower shininess values produce soft glows, while higher values result in sharper, smaller highlights.
             * @var {x3dom.fields.SFColor} specularColor
             * @memberof x3dom.nodeTypes.X3DMaterialNode
             * @initvalue 0,0,0
             * @field x3d
             * @instance
             */
            this.addField_SFColor(ctx, 'specularColor', 0, 0, 0);

            /**
             * The transparency field specifies how "clear" an object is, with 1.0 being completely transparent, and 0.0 completely opaque.
             * @var {x3dom.fields.SFFloat} transparency
             * @range [0, 1]
             * @memberof x3dom.nodeTypes.X3DMaterialNode
             * @initvalue 0
             * @field x3d
             * @instance
             */
            this.addField_SFFloat(ctx, 'transparency', 0);
        
        },
        {
            fieldChanged: function(fieldName) {
                if (fieldName == "ambientIntensity" || fieldName == "diffuseColor" ||
                    fieldName == "emissiveColor" || fieldName == "shininess" ||
                    fieldName == "specularColor" || fieldName == "transparency")
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

x3dom.nodeTypes.Material.defaultNode = function() {
    if (!x3dom.nodeTypes.Material._defaultNode) {
        x3dom.nodeTypes.Material._defaultNode = new x3dom.nodeTypes.Material();
        x3dom.nodeTypes.Material._defaultNode.nodeChanged();
    }
    return x3dom.nodeTypes.Material._defaultNode;
};