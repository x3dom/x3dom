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

/* ### Disk2D ### */
x3dom.registerNodeType(
    "Disk2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DPlanarGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Disk2D.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'innerRadius', 0);
            this.addField_SFFloat(ctx, 'outerRadius', 1);
            this.addField_SFFloat(ctx, 'subdivision', 32);

            var ir = this._vf.innerRadius;
            var or = this._vf.outerRadius;

            var geoCacheID = 'Disk2D_' + ir + or;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using Disk2D from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            } else {

                var anzahl = this._vf.subdivision;
                for (var i = 0; i <= anzahl; i++) {

                    var theta = i * ((2 * Math.PI) / anzahl);

                    var ox = Math.cos(theta) * or;
                    var oy = Math.sin(theta) * or;
                    var ix = Math.cos(theta) * ir;
                    var iy = Math.sin(theta) * ir;
                    this._mesh._positions[0].push(ox);
                    this._mesh._positions[0].push(oy);
                    this._mesh._positions[0].push(0.0);

                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(1);

                    this._mesh._texCoords[0].push((ox + or) / (2 * or));
                    this._mesh._texCoords[0].push((oy + or) / (2 * or));

                    this._mesh._positions[0].push(ix);
                    this._mesh._positions[0].push(iy);
                    this._mesh._positions[0].push(0.0);

                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(1);
                    this._mesh._texCoords[0].push((ix + or) / (2 * or));
                    this._mesh._texCoords[0].push((iy + or) / (2 * or));
                }

                for (i = 0; i < anzahl * 2; i = i + 2) {
                    if (i == (anzahl * 2) - 2) {
                        this._mesh._indices[0].push(i + 1);
                        this._mesh._indices[0].push(i);
                        this._mesh._indices[0].push(1);

                        this._mesh._indices[0].push(1);
                        this._mesh._indices[0].push(i);
                        this._mesh._indices[0].push(0);
                    } else {
                        this._mesh._indices[0].push(i + 1);
                        this._mesh._indices[0].push(i);
                        this._mesh._indices[0].push(i + 3);

                        this._mesh._indices[0].push(i + 3);
                        this._mesh._indices[0].push(i);
                        this._mesh._indices[0].push(i + 2);
                    }
                }

                this._mesh._numTexComponents = 2;
                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 2;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        },
        {
            fieldChanged: function (fieldName) {
                if (fieldName == "innerRadius" || fieldName == "outerRadius" ||
                    fieldName == "subdivision") {
                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] = [];
                    this._mesh._normals[0] = [];
                    this._mesh._texCoords[0] = [];

                    var ir = this._vf.innerRadius;
                    var or = this._vf.outerRadius;

                    var anzahl = this._vf.subdivision;
                    for (var i = 0; i <= anzahl; i++) {

                        var theta = i * ((2 * Math.PI) / anzahl);

                        var ox = Math.cos(theta) * or;
                        var oy = Math.sin(theta) * or;
                        var ix = Math.cos(theta) * ir;
                        var iy = Math.sin(theta) * ir;
                        this._mesh._positions[0].push(ox);
                        this._mesh._positions[0].push(oy);
                        this._mesh._positions[0].push(0.0);

                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(1);

                        this._mesh._texCoords[0].push((ox + or) / (2 * or));
                        this._mesh._texCoords[0].push((oy + or) / (2 * or));

                        this._mesh._positions[0].push(ix);
                        this._mesh._positions[0].push(iy);
                        this._mesh._positions[0].push(0.0);

                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(1);
                        this._mesh._texCoords[0].push((ix + or) / (2 * or));
                        this._mesh._texCoords[0].push((iy + or) / (2 * or));
                    }

                    for (i = 0; i < anzahl * 2; i = i + 2) {
                        if (i == (anzahl * 2) - 2) {
                            this._mesh._indices[0].push(i + 1);
                            this._mesh._indices[0].push(i);
                            this._mesh._indices[0].push(1);

                            this._mesh._indices[0].push(1);
                            this._mesh._indices[0].push(i);
                            this._mesh._indices[0].push(0);
                        } else {
                            this._mesh._indices[0].push(i + 1);
                            this._mesh._indices[0].push(i);
                            this._mesh._indices[0].push(i + 3);

                            this._mesh._indices[0].push(i + 3);
                            this._mesh._indices[0].push(i);
                            this._mesh._indices[0].push(i + 2);
                        }
                    }

                    this._mesh._numTexComponents = 2;
                    this.invalidateVolume();
                    this._mesh._numFaces = this._mesh._indices[0].length / 3;
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                    });
                }
            }
        }
    )
);