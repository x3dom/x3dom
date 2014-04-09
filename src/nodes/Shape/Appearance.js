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
         * @x3d x.x
         * @component Shape
         * @status experimental
         * @extends x3dom.nodeTypes.X3DAppearanceNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.Appearance.superClass.call(this, ctx);


            /**
             *
             * @var {SFNode} material
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue x3dom.nodeTypes.X3DMaterialNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('material', x3dom.nodeTypes.X3DMaterialNode);

            /**
             *
             * @var {SFNode} texture
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue x3dom.nodeTypes.X3DTextureNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('texture',  x3dom.nodeTypes.X3DTextureNode);

            /**
             *
             * @var {SFNode} textureTransform
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue x3dom.nodeTypes.X3DTextureTransformNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('textureTransform', x3dom.nodeTypes.X3DTextureTransformNode);

            /**
             *
             * @var {SFNode} lineProperties
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue x3dom.nodeTypes.LineProperties
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('lineProperties', x3dom.nodeTypes.LineProperties);

            /**
             *
             * @var {SFNode} colorMaskMode
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue x3dom.nodeTypes.ColorMaskMode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('colorMaskMode', x3dom.nodeTypes.ColorMaskMode);

            /**
             *
             * @var {SFNode} blendMode
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue x3dom.nodeTypes.BlendMode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('blendMode', x3dom.nodeTypes.BlendMode);

            /**
             *
             * @var {SFNode} depthMode
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue x3dom.nodeTypes.DepthMode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('depthMode', x3dom.nodeTypes.DepthMode);

            /**
             *
             * @var {MFNode} shaders
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue x3dom.nodeTypes.X3DShaderNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('shaders', x3dom.nodeTypes.X3DShaderNode);

            /**
             *
             * @var {SFString} sortType
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue 'auto'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'sortType', 'auto');      // [auto, transparent, opaque]

            /**
             *
             * @var {SFInt32} sortKey
             * @memberof x3dom.nodeTypes.Appearance
             * @initvalue 0
             * @field x3dom
             * @instance
             */
            this.addField_SFInt32(ctx, 'sortKey', 0);             // Change render order manually

            // shortcut to shader program
            this._shader = null;
        
        },
        {
            nodeChanged: function() {
                //TODO delete this if all works fine
                if (!this._cf.material.node) {
                    //Unlit
                    //this.addChild(x3dom.nodeTypes.Material.defaultNode());
                }

                if (this._cf.shaders.nodes.length) {
                    this._shader = this._cf.shaders.nodes[0];
                }

                Array.forEach(this._parentNodes, function (shape) {
                    shape.setAppDirty();
                });

                this.checkSortType();
            },

            checkSortType: function() {
                if (this._vf.sortType == 'auto') {
                    if (this._cf.material.node && this._cf.material.node._vf.transparency > 0) {
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