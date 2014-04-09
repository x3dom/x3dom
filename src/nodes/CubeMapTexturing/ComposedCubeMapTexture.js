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
         * @x3d x.x
         * @component CubeMapTexturing
         * @status experimental
         * @extends x3dom.nodeTypes.X3DEnvironmentTextureNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.ComposedCubeMapTexture.superClass.call(this, ctx);


            /**
             *
             * @var {SFNode} back
             * @memberof x3dom.nodeTypes.ComposedCubeMapTexture
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('back',   x3dom.nodeTypes.Texture);

            /**
             *
             * @var {SFNode} front
             * @memberof x3dom.nodeTypes.ComposedCubeMapTexture
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('front',  x3dom.nodeTypes.Texture);

            /**
             *
             * @var {SFNode} bottom
             * @memberof x3dom.nodeTypes.ComposedCubeMapTexture
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('bottom', x3dom.nodeTypes.Texture);

            /**
             *
             * @var {SFNode} top
             * @memberof x3dom.nodeTypes.ComposedCubeMapTexture
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('top',    x3dom.nodeTypes.Texture);

            /**
             *
             * @var {SFNode} left
             * @memberof x3dom.nodeTypes.ComposedCubeMapTexture
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('left',   x3dom.nodeTypes.Texture);

            /**
             *
             * @var {SFNode} right
             * @memberof x3dom.nodeTypes.ComposedCubeMapTexture
             * @initvalue x3dom.nodeTypes.Texture
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('right',  x3dom.nodeTypes.Texture);
            this._type = "cubeMap";
        
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