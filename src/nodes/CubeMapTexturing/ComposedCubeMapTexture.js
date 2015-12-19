/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### ComposedCubeMapTexture ### */
x3dom.registerNodeType(
    "ComposedCubeMapTexture",
    "CubeMapTexturing",
    defineClass(x3dom.nodeTypes.X3DEnvironmentTextureNode,
        
        /**
         * Constructor for ComposedCubeMapTexture
         * @constructs x3dom.nodeTypes.ComposedCubeMapTexture
         * @x3d 3.3
         * @component CubeMapTexturing
         * @status full
         * @extends x3dom.nodeTypes.X3DEnvironmentTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc The ComposedCubeMapTexture node defines a cubic environment map source as an explicit set of
         * images drawn from individual 2D texture nodes.
         */
        function (ctx) {
            x3dom.nodeTypes.ComposedCubeMapTexture.superClass.call(this, ctx);


            /**
             * Texture for the back of the cubemap
             * @var {x3dom.fields.SFNode} back
             * @memberof x3dom.nodeTypes.ComposedCubeMapTexture
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3d
             * @instance
             */
            this.addField_SFNode('back',  x3dom.nodeTypes.Texture);

            /**
             * Texture for the front of the cubemap
             * @var {x3dom.fields.SFNode} front
             * @memberof x3dom.nodeTypes.ComposedCubeMapTexture
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3d
             * @instance
             */
            this.addField_SFNode('front',  x3dom.nodeTypes.Texture);

            /**
             * Texture for the bottom of the cubemap
             * @var {x3dom.fields.SFNode} bottom
             * @memberof x3dom.nodeTypes.ComposedCubeMapTexture
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3d
             * @instance
             */
            this.addField_SFNode('bottom', x3dom.nodeTypes.Texture);

            /**
             * Texture for the top of the cubemap
             * @var {x3dom.fields.SFNode} top
             * @memberof x3dom.nodeTypes.ComposedCubeMapTexture
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3d
             * @instance
             */
            this.addField_SFNode('top',    x3dom.nodeTypes.Texture);

            /**
             * Texture for the left side of the cubemap
             * @var {x3dom.fields.SFNode} left
             * @memberof x3dom.nodeTypes.ComposedCubeMapTexture
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3d
             * @instance
             */
            this.addField_SFNode('left',   x3dom.nodeTypes.Texture);

            /**
             * Texture for the right side of the cubemap
             * @var {x3dom.fields.SFNode} right
             * @memberof x3dom.nodeTypes.ComposedCubeMapTexture
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3d
             * @instance
             */
            this.addField_SFNode('right',  x3dom.nodeTypes.Texture);
            this._type = "environmentMap";
        
        },
        {
            getTexUrl: function() {
                return [
                    this._nameSpace.getURL(this._cf.back.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.front.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.bottom.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.top.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.left.node._vf.url[0]),
                    this._nameSpace.getURL(this._cf.right.node._vf.url[0])
                ];
            }
        }
    )
);