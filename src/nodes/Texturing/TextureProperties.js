/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### TextureProperties ### */
x3dom.registerNodeType(
    "TextureProperties",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DNode,
        
        /**
         * Constructor for TextureProperties
         * @constructs x3dom.nodeTypes.TextureProperties
         * @x3d x.x
         * @component Texturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.TextureProperties.superClass.call(this, ctx);


            /**
             *
             * @var {x3dom.fields.SFFloat} anisotropicDegree
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue 1.0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'anisotropicDegree', 1.0);

            /**
             *
             * @var {x3dom.fields.SFColorRGBA} borderColor
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue 0,0,0,0
             * @field x3dom
             * @instance
             */
            this.addField_SFColorRGBA(ctx, 'borderColor', 0, 0, 0, 0);

            /**
             *
             * @var {x3dom.fields.SFInt32} borderWidth
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'borderWidth', 0);

            /**
             *
             * @var {x3dom.fields.SFString} boundaryModeS
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue "REPEAT"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'boundaryModeS', "REPEAT");

            /**
             *
             * @var {x3dom.fields.SFString} boundaryModeT
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue "REPEAT"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'boundaryModeT', "REPEAT");

            /**
             *
             * @var {x3dom.fields.SFString} boundaryModeR
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue "REPEAT"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'boundaryModeR', "REPEAT");

            /**
             *
             * @var {x3dom.fields.SFString} magnificationFilter
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue "FASTEST"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'magnificationFilter', "FASTEST");

            /**
             *
             * @var {x3dom.fields.SFString} minificationFilter
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue "FASTEST"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'minificationFilter', "FASTEST");

            /**
             *
             * @var {x3dom.fields.SFString} textureCompression
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue "FASTEST"
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'textureCompression', "FASTEST");

            /**
             *
             * @var {x3dom.fields.SFFloat} texturePriority
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'texturePriority', 0);

            /**
             *
             * @var {x3dom.fields.SFBool} generateMipMaps
             * @memberof x3dom.nodeTypes.TextureProperties
             * @initvalue false
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'generateMipMaps', false);
        
        },
        {
            fieldChanged: function(fieldName)
            {
                if (this._vf.hasOwnProperty(fieldName)) {
                    Array.forEach(this._parentNodes, function (texture) {
                        Array.forEach(texture._parentNodes, function (app) {
                            Array.forEach(app._parentNodes, function (shape) {
                                shape._dirty.texture = true;
                            });
                        });
                    });

                    this._nameSpace.doc.needRender = true;
                }
            }
        }
    )
);