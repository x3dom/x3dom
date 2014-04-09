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
        function (ctx) {
            x3dom.nodeTypes.ComposedCubeMapTexture.superClass.call(this, ctx);

            this.addField_SFNode('back',   x3dom.nodeTypes.Texture);
            this.addField_SFNode('front',  x3dom.nodeTypes.Texture);
            this.addField_SFNode('bottom', x3dom.nodeTypes.Texture);
            this.addField_SFNode('top',    x3dom.nodeTypes.Texture);
            this.addField_SFNode('left',   x3dom.nodeTypes.Texture);
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