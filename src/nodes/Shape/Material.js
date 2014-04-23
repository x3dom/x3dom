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
         * @x3d x.x
         * @component Shape
         * @status experimental
         * @extends x3dom.nodeTypes.X3DMaterialNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Material.superClass.call(this, ctx);

            /**
             *
             * @var {x3dom.fields.SFFloat} ambientIntensity
             * @memberof x3dom.nodeTypes.X3DMaterialNode
             * @initvalue 0.2
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'ambientIntensity', 0.2);

            /**
             *
             * @var {x3dom.fields.SFColor} diffuseColor
             * @memberof x3dom.nodeTypes.X3DMaterialNode
             * @initvalue 0.8,0.8,0.8
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'diffuseColor', 0.8, 0.8, 0.8);

            /**
             *
             * @var {x3dom.fields.SFColor} emissiveColor
             * @memberof x3dom.nodeTypes.X3DMaterialNode
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'emissiveColor', 0, 0, 0);

            /**
             *
             * @var {x3dom.fields.SFFloat} shininess
             * @memberof x3dom.nodeTypes.X3DMaterialNode
             * @initvalue 0.2
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'shininess', 0.2);

            /**
             *
             * @var {x3dom.fields.SFColor} specularColor
             * @memberof x3dom.nodeTypes.X3DMaterialNode
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'specularColor', 0, 0, 0);

            /**
             *
             * @var {x3dom.fields.SFFloat} transparency
             * @memberof x3dom.nodeTypes.X3DMaterialNode
             * @initvalue 0
             * @field x3dom
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