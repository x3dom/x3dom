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

/* ### ArcClose2D ### */
x3dom.registerNodeType(
    "ArcClose2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DPlanarGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.ArcClose2D.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'closureType', "PIE");
            this.addField_SFFloat(ctx, 'radius', 1);
            this.addField_SFFloat(ctx, 'startAngle', 0);
            this.addField_SFFloat(ctx, 'endAngle', 1.570796);
            this.addField_SFFloat(ctx, 'subdivision', 32);

            var r = this._vf.radius;
            var start = this._vf.startAngle;
            var end = this._vf.endAngle;
            var anzahl = this._vf.subdivision;

            // The following code ensures that:
            // 1. 0 <= startAngle < 2*Pi
            // 2. startAngle < endAngle
            // 3. endAngle - startAngle <= 2*Pi
            var Pi2 = Math.PI * 2.0;
            start -= Math.floor(start / Pi2) * Pi2;
            end -= Math.floor(end / Pi2) * Pi2;
            if (end <= start)
                end += Pi2;

            var geoCacheID = 'ArcClose2D_' + r + start + end + this._vf.closureType;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using ArcClose2D from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            } else {
                var t = (end - start) / anzahl;
                var theta = start;

                if (this._vf.closureType.toUpperCase() == 'PIE') {

                    this._mesh._positions[0].push(0.0);
                    this._mesh._positions[0].push(0.0);
                    this._mesh._positions[0].push(0.0);

                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(1);

                    this._mesh._texCoords[0].push(0.5);
                    this._mesh._texCoords[0].push(0.5);

                    for (var i = 0; i <= anzahl; i++) {
                        var x = Math.cos(theta) * r;
                        var y = Math.sin(theta) * r;

                        this._mesh._positions[0].push(x);
                        this._mesh._positions[0].push(y);
                        this._mesh._positions[0].push(0.0);

                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(1);

                        this._mesh._texCoords[0].push((x + r) / (2 * r));
                        this._mesh._texCoords[0].push((y + r) / (2 * r));

                        theta += t;
                    }

                    for (var j = 1; j <= anzahl; j++) {
                        this._mesh._indices[0].push(j + 1);
                        this._mesh._indices[0].push(0);
                        this._mesh._indices[0].push(j);
                    }

                } else {    // "CHORD"
                    for (var i = 0; i <= anzahl; i++) {
                        var x = Math.cos(theta) * r;
                        var y = Math.sin(theta) * r;

                        this._mesh._positions[0].push(x);
                        this._mesh._positions[0].push(y);
                        this._mesh._positions[0].push(0.0);

                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(1);

                        this._mesh._texCoords[0].push((x + r) / (2 * r));
                        this._mesh._texCoords[0].push((y + r) / (2 * r));

                        theta += t;
                    }

                    var x = (this._mesh._positions[0][0] + this._mesh._positions[0][this._mesh._positions[0].length - 3]) / 2;
                    var y = (this._mesh._positions[0][1] + this._mesh._positions[0][this._mesh._positions[0].length - 2]) / 2;

                    this._mesh._positions[0].push(x);
                    this._mesh._positions[0].push(y);
                    this._mesh._positions[0].push(0.0);

                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(0);
                    this._mesh._normals[0].push(1);

                    this._mesh._texCoords[0].push((x + r) / (2 * r));
                    this._mesh._texCoords[0].push((y + r) / (2 * r));

                    for (var j = 0; j < anzahl; j++) {
                        this._mesh._indices[0].push(j + 1);
                        this._mesh._indices[0].push(anzahl + 1);
                        this._mesh._indices[0].push(j);
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
                var r = this._vf.radius;
                var start = this._vf.startAngle;
                var end = this._vf.endAngle;
                var anzahl = this._vf.subdivision;

                var Pi2 = Math.PI * 2.0;
                start -= Math.floor(start / Pi2) * Pi2;
                end -= Math.floor(end / Pi2) * Pi2;
                if (end <= start)
                    end += Pi2;

                var t = (end - start) / anzahl;
                var theta = start;

                if (fieldName === "radius") {
                    this._mesh._positions[0] = [];

                    if (this._vf.closureType.toUpperCase() == 'PIE') {

                        this._mesh._positions[0].push(0.0);
                        this._mesh._positions[0].push(0.0);
                        this._mesh._positions[0].push(0.0);

                        for (var i = 0; i <= anzahl; i++) {
                            var x = Math.cos(theta) * r;
                            var y = Math.sin(theta) * r;

                            this._mesh._positions[0].push(x);
                            this._mesh._positions[0].push(y);
                            this._mesh._positions[0].push(0.0);

                            theta += t;
                        }
                    } else {
                        for (var i = 0; i <= anzahl; i++) {
                            var x = Math.cos(theta) * r;
                            var y = Math.sin(theta) * r;

                            this._mesh._positions[0].push(x);
                            this._mesh._positions[0].push(y);
                            this._mesh._positions[0].push(0.0);

                            theta += t;
                        }

                        var x = (this._mesh._positions[0][0] + this._mesh._positions[0][this._mesh._positions[0].length - 3]) / 2;
                        var y = (this._mesh._positions[0][1] + this._mesh._positions[0][this._mesh._positions[0].length - 2]) / 2;

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

                } else if (fieldName == "closureType" || fieldName == "subdivision" ||
                           fieldName == "startAngle" || fieldName == "endAngle") {
                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] = [];
                    this._mesh._normals[0] = [];
                    this._mesh._texCoords[0] = [];

                    if (this._vf.closureType.toUpperCase() == 'PIE') {

                        this._mesh._positions[0].push(0.0);
                        this._mesh._positions[0].push(0.0);
                        this._mesh._positions[0].push(0.0);

                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(1);

                        this._mesh._texCoords[0].push(0.5);
                        this._mesh._texCoords[0].push(0.5);

                        for (var i = 0; i <= anzahl; i++) {
                            var x = Math.cos(theta) * r;
                            var y = Math.sin(theta) * r;

                            this._mesh._positions[0].push(x);
                            this._mesh._positions[0].push(y);
                            this._mesh._positions[0].push(0.0);

                            this._mesh._normals[0].push(0);
                            this._mesh._normals[0].push(0);
                            this._mesh._normals[0].push(1);

                            this._mesh._texCoords[0].push((x + r) / (2 * r));
                            this._mesh._texCoords[0].push((y + r) / (2 * r));

                            theta += t;
                        }

                        for (var j = 1; j <= anzahl; j++) {
                            this._mesh._indices[0].push(j + 1);
                            this._mesh._indices[0].push(0);
                            this._mesh._indices[0].push(j);
                        }

                    } else {
                        for (var i = 0; i <= anzahl; i++) {
                            var x = Math.cos(theta) * r;
                            var y = Math.sin(theta) * r;

                            this._mesh._positions[0].push(x);
                            this._mesh._positions[0].push(y);
                            this._mesh._positions[0].push(0.0);

                            this._mesh._normals[0].push(0);
                            this._mesh._normals[0].push(0);
                            this._mesh._normals[0].push(1);

                            this._mesh._texCoords[0].push((x + r) / (2 * r));
                            this._mesh._texCoords[0].push((y + r) / (2 * r));

                            theta += t;
                        }

                        var x = (this._mesh._positions[0][0] + this._mesh._positions[0][this._mesh._positions[0].length - 3]) / 2;
                        var y = (this._mesh._positions[0][1] + this._mesh._positions[0][this._mesh._positions[0].length - 2]) / 2;

                        this._mesh._positions[0].push(x);
                        this._mesh._positions[0].push(y);
                        this._mesh._positions[0].push(0.0);

                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(0);
                        this._mesh._normals[0].push(1);

                        this._mesh._texCoords[0].push((x + r) / (2 * r));
                        this._mesh._texCoords[0].push((y + r) / (2 * r));

                        for (var j = 0; j < anzahl; j++) {
                            this._mesh._indices[0].push(j + 1);
                            this._mesh._indices[0].push(anzahl + 1);
                            this._mesh._indices[0].push(j);
                        }
                    }

                    this._mesh._numTexComponents = 2;
                    this.invalidateVolume();
                    this._mesh._numFaces = this._mesh._indices[0].length / 2;
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                    });
                }
            }
        }
    )
);