/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### Mesh ### */
x3dom.registerNodeType(
    "Mesh",         // experimental WebSG geo node
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Mesh.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'primType', "triangle");
            this.addField_MFInt32(ctx, 'index', []);

            this.addField_MFNode('vertexAttributes', x3dom.nodeTypes.X3DVertexAttributeNode);
        },
        {
            nodeChanged: function()
            {
                var time0 = new Date().getTime();

                var i, n = this._cf.vertexAttributes.nodes.length;

                for (i=0; i<n; i++)
                {
                    var name = this._cf.vertexAttributes.nodes[i]._vf.name;

                    switch (name.toLowerCase())
                    {
                        case "position":
                            this._mesh._positions[0] = this._cf.vertexAttributes.nodes[i]._vf.value.toGL();
                            break;
                        case "normal":
                            this._mesh._normals[0] = this._cf.vertexAttributes.nodes[i]._vf.value.toGL();
                            break;
                        case "texcoord":
                            this._mesh._texCoords[0] = this._cf.vertexAttributes.nodes[i]._vf.value.toGL();
                            break;
                        case "color":
                            this._mesh._colors[0] = this._cf.vertexAttributes.nodes[i]._vf.value.toGL();
                            break;
                        default:
                            this._mesh._dynamicFields[name] = {};
                            this._mesh._dynamicFields[name].numComponents =
                                this._cf.vertexAttributes.nodes[i]._vf.numComponents;
                            this._mesh._dynamicFields[name].value =
                                this._cf.vertexAttributes.nodes[i]._vf.value.toGL();
                            break;
                    }
                }

                this._mesh._indices[0] = this._vf.index.toGL();

                this.invalidateVolume();

                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                var time1 = new Date().getTime() - time0;
                x3dom.debug.logWarning("Mesh load time: " + time1 + " ms");
            }
        }
    )
);