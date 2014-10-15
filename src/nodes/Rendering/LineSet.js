/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### LineSet ### */
x3dom.registerNodeType(
    "LineSet",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        
        /**
         * Constructor for LineSet
         * @constructs x3dom.nodeTypes.LineSet
         * @x3d 3.3
         * @component Rendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         * @classdesc LineSet is a geometry node that can contain a Color node and a Coordinate node.
         * Color values or a Material emissiveColor is used to draw lines and points.
         * Lines are not lit, are not texture-mapped, and do not participate in collision detection.
         * Hint: use a different color (or emissiveColor) than the background color.
         * Hint: if rendering Coordinate points originally defined for an IndexedFaceSet, index values may need to repeat each initial vertex to close each polygon outline.
         * Hint: insert a Shape node before adding geometry or Appearance.
         */
        function (ctx) {
            x3dom.nodeTypes.LineSet.superClass.call(this, ctx);


            /**
             * vertexCount describes how many vertices are used in each polyline from Coordinate field. Coordinates are assigned to each line by taking vertexCount[n] vertices from Coordinate field.
             * @var {x3dom.fields.MFInt32} vertexCount
             * @range [2, inf]
             * @memberof x3dom.nodeTypes.LineSet
             * @initvalue []
             * @field x3d
             * @instance
             */
            this.addField_MFInt32(ctx, 'vertexCount', []);


            /**
             * If the "attrib" field is not empty it shall contain a list of per-vertex attribute information for programmable shaders
             * @var {x3dom.fields.MFNode} attrib
             * @memberof x3dom.nodeTypes.LineSet
             * @initvalue x3dom.nodeTypes.X3DVertexAttributeNode
             * @field x3d
             * @instance
             */
            this.addField_MFNode('attrib', x3dom.nodeTypes.X3DVertexAttributeNode);

            /**
             * Coordinate node specifiying the vertices used by the geometry.
             * @var {x3dom.fields.SFNode} coord
             * @memberof x3dom.nodeTypes.LineSet
             * @initvalue x3dom.nodeTypes.X3DCoordinateNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('coord', x3dom.nodeTypes.X3DCoordinateNode);

            /**
             * If NULL the geometry is rendered using the Material and texture defined in the Appearance node. If not NULL the field shall contain a Color node whose colours are applied depending on the value of "colorPerVertex".
             * @var {x3dom.fields.SFNode} color
             * @memberof x3dom.nodeTypes.LineSet
             * @initvalue x3dom.nodeTypes.X3DColorNode
             * @field x3d
             * @instance
             */
            this.addField_SFNode('color', x3dom.nodeTypes.X3DColorNode);

            this._mesh._primType = "LINES";
            x3dom.Utils.needLineWidth = true;
        
        },
        {
            nodeChanged: function() {
                var coordNode = this._cf.coord.node;
                x3dom.debug.assert(coordNode);
                var positions = coordNode.getPoints();

                this._mesh._positions[0] = positions.toGL();

                var colorNode = this._cf.color.node;
                if (colorNode) {
                    var colors = colorNode._vf.color;

                    this._mesh._colors[0] = colors.toGL();

                    this._mesh._numColComponents = 3;
                    if (x3dom.isa(colorNode, x3dom.nodeTypes.ColorRGBA)) {
                        this._mesh._numColComponents = 4;
                    }
                }

                var cnt = 0;
                this._mesh._indices[0] = [];

                for (var i=0, n=this._vf.vertexCount.length; i<n; i++) {
                    var vc = this._vf.vertexCount[i];
                    if (vc < 2) {
                        x3dom.debug.logError("LineSet.vertexCount must not be smaller than 2!");
                        break;
                    }
                    for (var j=vc-2; j>=0; j--) {
                        this._mesh._indices[0].push(cnt++, cnt);
                        if (j == 0) cnt++;
                    }
                }
            },

            fieldChanged: function(fieldName) {
                if (fieldName == "coord") {
                    var pnts = this._cf.coord.node.getPoints();
                    this._mesh._positions[0] = pnts.toGL();

                    this.invalidateVolume();
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        node.invalidateVolume();
                    });
                }
                else if (fieldName == "color") {
                    var cols = this._cf.color.node._vf.color;
                    this._mesh._colors[0] = cols.toGL();

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.colors = true;
                    });
                }
            }
        }
    )
);