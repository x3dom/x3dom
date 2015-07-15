/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Appearance ### */
x3dom.registerNodeType(
    "Appearance",
    "Shape",
    defineClass(x3dom.nodeTypes.X3DAppearanceNode,
        
        /**
         * Constructor for Appearance
         * @constructs x3dom.nodeTypes.Appearance
         * @x3d 3.3
         * @component Shape
         * @status experimental
         * @extends x3dom.nodeTypes.X3DAppearanceNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The Appearance node specifies the visual properties of geometry.
         * The value for each of the fields in this node may be NULL.
         * However, if the field is non-NULL, it shall contain one node of the appropriate type.
         */
        function (ctx) {
            x3dom.nodeTypes.Appearance.superClass.call(this, ctx);


            /**
             * The material field, if specified, shall contain a Material node.
             * If the material field is NULL or unspecified, lighting is off (all lights are ignored during rendering of the object that references this Appearance) and the unlit object colour is (1, 1, 1).
             * @var {x3dom.fields.SFNode} material
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue x3dom.nodeTypes.X3DMaterialNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('material', x3dom.nodeTypes.X3DMaterialNode);

            /**
             * The texture field, if specified, shall contain a texture nodes.
             * If the texture node is NULL or the texture field is unspecified, the object that references this Appearance is not textured.
             * @var {x3dom.fields.SFNode} texture
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('texture',  x3dom.nodeTypes.X3DTextureNode);

            /**
             * The textureTransform field, if specified, shall contain a TextureTransform node. If the textureTransform is NULL or unspecified, the textureTransform field has no effect.
             * @var {x3dom.fields.SFNode} textureTransform
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue x3dom.nodeTypes.X3DTextureTransformNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('textureTransform', x3dom.nodeTypes.X3DTextureTransformNode);

            /**
             * The lineProperties field, if specified, shall contain a LineProperties node. If lineProperties is NULL or unspecified, the lineProperties field has no effect.
             * @var {x3dom.fields.SFNode} lineProperties
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue x3dom.nodeTypes.LineProperties
             * @field x3d
             * @instance
             */
            this.addField_SFNode('lineProperties', x3dom.nodeTypes.LineProperties);

            /**
             * Holds a ColorMaskMode node.
             * @var {x3dom.fields.SFNode} colorMaskMode
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue x3dom.nodeTypes.ColorMaskMode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('colorMaskMode', x3dom.nodeTypes.ColorMaskMode);

            /**
             * Holds the  BlendMode node, that is needed for correct transparency.
             * @var {x3dom.fields.SFNode} blendMode
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue x3dom.nodeTypes.BlendMode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('blendMode', x3dom.nodeTypes.BlendMode);

            /**
             * Holds the depthMode node.
             * @var {x3dom.fields.SFNode} depthMode
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue x3dom.nodeTypes.DepthMode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('depthMode', x3dom.nodeTypes.DepthMode);

            /**
             * Contains ProgramShader (Cg) or ComposedShader (GLSL).
             * @var {x3dom.fields.MFNode} shaders
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue x3dom.nodeTypes.X3DShaderNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('shaders', x3dom.nodeTypes.X3DShaderNode);

            /**
             * Defines the shape type for sorting.
             * @var {x3dom.fields.SFString} sortType
             * @range [auto, transparent, opaque]
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue 'auto'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'sortType', 'auto');

            /**
             * Change render order manually.
             * @var {x3dom.fields.SFInt32} sortKey
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'sortKey', 0);
			
			/**
             * Specify the threshold for the alpha clipping
             * @var {x3dom.fields.SFFloat} alphaClipThreshold
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue 0.1
             * @field x3dom
             * @instance
             */
            this.addField_SFFloat(ctx, 'alphaClipThreshold', 0.1);

            // shortcut to shader program
            this._shader = null;
        
        },
        {
			fieldChanged: function(fieldName) {
				if (fieldName == "alphaClipThreshold") {
				
					Array.forEach(this._parentNodes, function (shape) {
						shape.setAppDirty();
					});
				
				}
			},
		
            nodeChanged: function() {
                //TODO delete this if all works fine
                if (!this._cf.material.node) {
                    //Unlit
                    //this.addChild(x3dom.nodeTypes.Material.defaultNode());
                }

                if (this._cf.shaders.nodes.length) {
                    this._shader = this._cf.shaders.nodes[0];
                }
                else if(this._shader)
                    this._shader=null;

                Array.forEach(this._parentNodes, function (shape) {
                    shape.setAppDirty();
                });

                this.checkSortType();
            },

            checkSortType: function() {
                if (this._vf.sortType == 'auto') {
                    if (this._cf.material.node && (this._cf.material.node._vf.transparency > 0 ||
                        this._cf.material.node._vf.backTransparency && this._cf.material.node._vf.backTransparency > 0)) {
                        this._vf.sortType = 'transparent';
                    }
                    else if (this._cf.texture.node && this._cf.texture.node._vf.url.length) {
                        // uhh, this is a rather coarse guess...
                        if (this._cf.texture.node._vf.url[0].toLowerCase().indexOf('.'+'png') >= 0) {
                            this._vf.sortType = 'transparent';
                        }
                        else {
                            this._vf.sortType = 'opaque';
                        }
                    }
                    else {
                        this._vf.sortType = 'opaque';
                    }
                }
            },

            texTransformMatrix: function() {
                if (this._cf.textureTransform.node === null) {
                    return x3dom.fields.SFMatrix4f.identity();
                }
                else {
                    return this._cf.textureTransform.node.texTransformMatrix();
                }
            },

            parentAdded: function(parent) {
                if (this != x3dom.nodeTypes.Appearance._defaultNode) {
                    /*if (parent._cleanupGLObjects) {
                     parent._cleanupGLObjects(true);
                     }*/
                    parent.setAppDirty();
                }
            }
        }
    )
);

x3dom.nodeTypes.Appearance.defaultNode = function() {
    if (!x3dom.nodeTypes.Appearance._defaultNode) {
        x3dom.nodeTypes.Appearance._defaultNode = new x3dom.nodeTypes.Appearance();
        x3dom.nodeTypes.Appearance._defaultNode.nodeChanged();
    }
    return x3dom.nodeTypes.Appearance._defaultNode;
};