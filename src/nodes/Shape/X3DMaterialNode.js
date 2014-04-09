/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DMaterialNode ### */
x3dom.registerNodeType(
    "X3DMaterialNode",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DAppearanceChildNode,
        
        /**
         * Constructor for X3DMaterialNode
         * @constructs x3dom.nodeTypes.X3DMaterialNode
         * @x3d x.x
         * @component Shape
         * @status experimental
         * @extends x3dom.nodeTypes.X3DAppearanceChildNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DMaterialNode.superClass.call(this, ctx);


            /**
             *
             * @var {SFFloat} ambientIntensity
             * @memberof x3dom.nodeTypes.X3DMaterialNode
             * @initvalue 0.2
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'ambientIntensity', 0.2);

            /**
             *
             * @var {SFColor} diffuseColor
             * @memberof x3dom.nodeTypes.X3DMaterialNode
             * @initvalue 0.8,0.8,0.8
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'diffuseColor', 0.8, 0.8, 0.8);

            /**
             *
             * @var {SFColor} emissiveColor
             * @memberof x3dom.nodeTypes.X3DMaterialNode
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'emissiveColor', 0, 0, 0);

            /**
             *
             * @var {SFFloat} shininess
             * @memberof x3dom.nodeTypes.X3DMaterialNode
             * @initvalue 0.2
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'shininess', 0.2);

            /**
             *
             * @var {SFColor} specularColor
             * @memberof x3dom.nodeTypes.X3DMaterialNode
             * @initvalue 0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFColor(ctx, 'specularColor', 0, 0, 0);

            /**
             *
             * @var {SFFloat} transparency
             * @memberof x3dom.nodeTypes.X3DMaterialNode
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'transparency', 0);
        
        }
    )
);