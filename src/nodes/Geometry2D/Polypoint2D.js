/*
 * X3DOM JavaScript Library
 * http://www.x3dom.org
 *
 * (C)2009 Fraunhofer IGD, Darmstadt, Germany
 * Dual licensed under the MIT and GPL
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/* ### Polypoint2D ### */
x3dom.registerNodeType(
    "Polypoint2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DPlanarGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Polypoint2D.superClass.call(this, ctx);

            this.addField_MFVec2f(ctx, 'point', []);

            this._mesh._primType = 'POINTS';

            var x = 0, y = 0;
            if (this._vf.point.length) {
                x = this._vf.point[0].x;
                y = this._vf.point[0].y;
            }

            var geoCacheID = 'Polypoint2D_' + x + '-' + y;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using Polypoint2D from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else {
                for (var i = 0; i < this._vf.point.length; i++) {
                    x = this._vf.point[i].x;
                    y = this._vf.point[i].y;
                    this._mesh._positions[0].push(x);
                    this._mesh._positions[0].push(y);
                    this._mesh._positions[0].push(0.0);
                }

                this._mesh._invalidate = true;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "point") {
                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] = [];
                    for (var i = 0; i < this._vf.point.length; i++) {
                        var x = this._vf.point[i].x;
                        var y = this._vf.point[i].y;
                        this._mesh._positions[0].push(x);
                        this._mesh._positions[0].push(y);
                        this._mesh._positions[0].push(0.0);
                    }

                    this.invalidateVolume();
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        node.invalidateVolume();
                    });
                }
            }
        }
    )
);