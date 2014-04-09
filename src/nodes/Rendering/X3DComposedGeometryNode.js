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
         * @x3d x.x
         * @component Rendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.X3DComposedGeometryNode.superClass.call(this, ctx);


            /**
             *
             * @var {SFBool} colorPerVertex
             * @memberof x3dom.nodeTypes.X3DComposedGeometryNode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'colorPerVertex', true);

            /**
             *
             * @var {SFBool} normalPerVertex
             * @memberof x3dom.nodeTypes.X3DComposedGeometryNode
             * @initvalue true
             * @field x3dom
             * @instance
             */
            this.addField_SFBool(ctx, 'normalPerVertex', true);

            /**
             *
             * @var {SFString} normalUpdateMode
             * @memberof x3dom.nodeTypes.X3DComposedGeometryNode
             * @initvalue 'fast'
             * @field x3dom
             * @instance
             */
            this.addField_SFString(ctx, 'normalUpdateMode', 'fast');  // none; fast; nice


            /**
             *
             * @var {MFNode} attrib
             * @memberof x3dom.nodeTypes.X3DComposedGeometryNode
             * @initvalue x3dom.nodeTypes.X3DVertexAttributeNode
             * @field x3dom
             * @instance
             */
            this.addField_MFNode('attrib', x3dom.nodeTypes.X3DVertexAttributeNode);


            /**
             *
             * @var {SFNode} coord
             * @memberof x3dom.nodeTypes.X3DComposedGeometryNode
             * @initvalue x3dom.nodeTypes.X3DCoordinateNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('coord', x3dom.nodeTypes.X3DCoordinateNode);

            /**
             *
             * @var {SFNode} normal
             * @memberof x3dom.nodeTypes.X3DComposedGeometryNode
             * @initvalue x3dom.nodeTypes.Normal
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('normal', x3dom.nodeTypes.Normal);

            /**
             *
             * @var {SFNode} color
             * @memberof x3dom.nodeTypes.X3DComposedGeometryNode
             * @initvalue x3dom.nodeTypes.X3DColorNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('color', x3dom.nodeTypes.X3DColorNode);

            /**
             *
             * @var {SFNode} texCoord
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