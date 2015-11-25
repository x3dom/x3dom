/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### X3DComposedGeometryNode ### */
x3dom.registerNodeType(
    "X3DComposedGeometryNode",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        
        /**
         * Constructor for X3DComposedGeometryNode
         * @constructs x3dom.nodeTypes.X3DComposedGeometryNode
         * @x3d 3.3
         * @component Rendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc This is the base node type for all composed 3D geometry in X3D.
         * A composed geometry node type defines an abstract type that composes geometry from a set of nodes that define individual components.
         * Composed geometry may have color, coordinates, normal and texture coordinates supplied.
         * The rendered output of the combination of these is dependent on the concrete node definition.
         */
        function (ctx) {
            x3dom.nodeTypes.X3DComposedGeometryNode.superClass.call(this, ctx);


            /**
             * If colorPerVertex is FALSE, colours are applied to each face. If colorPerVertex is true, colours are applied to each vertex.
             * @var {x3dom.fields.SFBool} colorPerVertex
             * @memberof x3dom.nodeTypes.X3DComposedGeometryNode
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'colorPerVertex', true);

            /**
             * If normalPerVertex is FALSE, normals are applied to each face. If normalPerVertex is true, normals are applied to each vertex.
             * @var {x3dom.fields.SFBool} normalPerVertex
             * @memberof x3dom.nodeTypes.X3DComposedGeometryNode
             * @initvalue true
             * @field x3d
             * @instance
             */
            this.addField_SFBool(ctx, 'normalPerVertex', true);

            /**
             *
             * @var {x3dom.fields.SFString} normalUpdateMode
             * @memberof x3dom.nodeTypes.X3DComposedGeometryNode
             * @initvalue 'fast'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'normalUpdateMode', 'fast');  // none; fast; nice


            /**
             * If the attrib field is not empty it shall contain a list of per-vertex attribute information for programmable shaders.
             * @var {x3dom.fields.MFNode} attrib
             * @memberof x3dom.nodeTypes.X3DComposedGeometryNode
             * @initvalue x3dom.nodeTypes.X3DVertexAttributeNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('attrib', x3dom.nodeTypes.X3DVertexAttributeNode);


            /**
             * Contains a Coordinate node.
             * @var {x3dom.fields.SFNode} coord
             * @memberof x3dom.nodeTypes.X3DComposedGeometryNode
             * @initvalue x3dom.nodeTypes.X3DCoordinateNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('coord', x3dom.nodeTypes.X3DCoordinateNode);

            /**
             * If the normal field is not NULL, it shall contain a Normal node whose normals are applied to the vertices or faces of the X3DComposedGeometryNode in a manner exactly equivalent to that described above for applying colours to vertices/faces (where normalPerVertex corresponds to colorPerVertex and normalIndex corresponds to colorIndex).
             * If the normal field is NULL, the browser shall automatically generate normals in accordance with the node's definition. If the node does not define a behaviour, the default is to generate an averaged normal for all faces that share that vertex.
             * @var {x3dom.fields.SFNode} normal
             * @memberof x3dom.nodeTypes.X3DComposedGeometryNode
             * @initvalue x3dom.nodeTypes.Normal
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('normal', x3dom.nodeTypes.Normal);

            /**
             * If the color field is NULL, the geometry shall be rendered normally using the Material and texture defined in the Appearance node.
             * @var {x3dom.fields.SFNode} color
             * @memberof x3dom.nodeTypes.X3DComposedGeometryNode
             * @initvalue x3dom.nodeTypes.X3DColorNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('color', x3dom.nodeTypes.X3DColorNode);

            /**
             * If the texCoord field is not NULL, it shall contain a TextureCoordinate node.
             * @var {x3dom.fields.SFNode} texCoord
             * @memberof x3dom.nodeTypes.X3DComposedGeometryNode
             * @initvalue x3dom.nodeTypes.X3DTextureCoordinateNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('texCoord', x3dom.nodeTypes.X3DTextureCoordinateNode);
        
        },
        {
            handleAttribs: function()
            {
                //var time0 = new Date().getTime();

                // TODO; handle case that more than 2^16-1 attributes are to be referenced
                var i, n = this._cf.attrib.nodes.length;

                for (i=0; i<n; i++)
                {
                    var name = this._cf.attrib.nodes[i]._vf.name;

                    switch (name.toLowerCase())
                    {
                        case "position":
                            this._mesh._positions[0] = this._cf.attrib.nodes[i]._vf.value.toGL();
                            break;
                        case "normal":
                            this._mesh._normals[0] = this._cf.attrib.nodes[i]._vf.value.toGL();
                            break;
                        case "texcoord":
                            this._mesh._texCoords[0] = this._cf.attrib.nodes[i]._vf.value.toGL();
                            break;
                        case "color":
                            this._mesh._colors[0] = this._cf.attrib.nodes[i]._vf.value.toGL();
                            break;
                        default:
                            this._mesh._dynamicFields[name] = {};
                            this._mesh._dynamicFields[name].numComponents =
                                this._cf.attrib.nodes[i]._vf.numComponents;
                            this._mesh._dynamicFields[name].value =
                                this._cf.attrib.nodes[i]._vf.value.toGL();
                            break;
                    }
                }

                //var time1 = new Date().getTime() - time0;
                //x3dom.debug.logInfo("Mesh load time: " + time1 + " ms");
            }
        }
    )
);
