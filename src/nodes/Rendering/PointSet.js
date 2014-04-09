/** @namespace x3dom.nodeTypes */
/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 */

/* ### PointSet ### */
x3dom.registerNodeType(
    "PointSet",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        
        /**
         * Constructor for PointSet
         * @constructs x3dom.nodeTypes.PointSet
         * @x3d x.x
         * @component Rendering
         * @status experimental
         * @extends x3dom.nodeTypes.X3DGeometryNode
         * @param {Object} [ctx=null] - context object, containing initial settings like namespace
         */
        function (ctx) {
            x3dom.nodeTypes.PointSet.superClass.call(this, ctx);


            /**
             *
             * @var {SFNode} coord
             * @memberof x3dom.nodeTypes.PointSet
             * @initvalue x3dom.nodeTypes.X3DCoordinateNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('coord', x3dom.nodeTypes.X3DCoordinateNode);

            /**
             *
             * @var {SFNode} color
             * @memberof x3dom.nodeTypes.PointSet
             * @initvalue x3dom.nodeTypes.X3DColorNode
             * @field x3dom
             * @instance
             */
            this.addField_SFNode('color', x3dom.nodeTypes.X3DColorNode);

            this._mesh._primType = 'POINTS';
        
        },
        {
            nodeChanged: function()
            {
                var time0 = new Date().getTime();

                var coordNode = this._cf.coord.node;
                x3dom.debug.assert(coordNode);
                var positions = coordNode.getPoints();

                var numColComponents = 3;
                var colorNode = this._cf.color.node;
                var colors = new x3dom.fields.MFColor();
                if (colorNode) {
                    colors = colorNode._vf.color;
                    x3dom.debug.assert(positions.length == colors.length);

                    if (x3dom.isa(colorNode, x3dom.nodeTypes.ColorRGBA)) {
                        numColComponents = 4;
                    }
                }

                this._mesh._numColComponents = numColComponents;
                this._mesh._lit = false;

                this._mesh._indices[0] = [];
                this._mesh._positions[0] = positions.toGL();
                this._mesh._colors[0] = colors.toGL();
                this._mesh._normals[0] = [];
                this._mesh._texCoords[0] = [];

                this.invalidateVolume();
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                var time1 = new Date().getTime() - time0;
                //x3dom.debug.logInfo("Mesh load time: " + time1 + " ms");
            },

            fieldChanged: function(fieldName)
            {
                var pnts = null;

                if (fieldName == "coord")
                {
                    pnts = this._cf.coord.node.getPoints();

                    this._mesh._positions[0] = pnts.toGL();

                    this.invalidateVolume();

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        node.invalidateVolume();
                    });
                }
                else if (fieldName == "color")
                {
                    pnts = this._cf.color.node._vf.color;

                    this._mesh._colors[0] = pnts.toGL();

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.colors = true;
                    });
                }
            }
        }
    )
);