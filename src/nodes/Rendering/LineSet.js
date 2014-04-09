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
        function (ctx) {
            x3dom.nodeTypes.LineSet.superClass.call(this, ctx);

            this.addField_MFInt32(ctx, 'vertexCount', []);

            this.addField_MFNode('attrib', x3dom.nodeTypes.X3DVertexAttributeNode);
            this.addField_SFNode('coord', x3dom.nodeTypes.X3DCoordinateNode);
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

                    var numColComponents = 3;
                    if (x3dom.isa(colorNode, x3dom.nodeTypes.ColorRGBA)) {
                        numColComponents = 4;
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