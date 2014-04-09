/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### MultiTextureCoordinate ### */
x3dom.registerNodeType(
    "MultiTextureCoordinate",
    "Texturing",
    defineClass(x3dom.nodeTypes.X3DTextureCoordinateNode,
        function (ctx) {
            x3dom.nodeTypes.MultiTextureCoordinate.superClass.call(this, ctx);

            this.addField_MFNode('texCoord', x3dom.nodeTypes.X3DTextureCoordinateNode);
        }
    )
);
