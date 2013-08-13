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


/* ### Snout ### */
x3dom.registerNodeType(
    "Snout",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Snout.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'dbottom', 1.0);
            this.addField_SFFloat(ctx, 'dtop', 0.4);
            this.addField_SFFloat(ctx, 'height', 1.0);
            this.addField_SFFloat(ctx, 'xoff', 0.25);
            this.addField_SFFloat(ctx, 'yoff', 0.25);
            this.addField_SFFloat(ctx, 'subdivision', 32);

            var geoCacheID = 'Snout_' + this._vf.dbottom + '_' + this._vf.dtop + '_' + this._vf.height + '_' +
                             this._vf.xoff + '_' + this._vf.yoff + '_' + this._vf.subdivision;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else {
                var bottomRadius = this._vf.dbottom, height = this._vf.height;
                var topRadius = this._vf.dtop, sides = this._vf.subdivision;

                var beta, x, z;
                var delta = 2.0 * Math.PI / sides;

                var incl = (bottomRadius - topRadius) / height;
                var nlen = 1.0 / Math.sqrt(1.0 + incl * incl);

                var j = 0, k = 0;
                var h, base;

                if (height > 0) {
                    var px = 0, pz = 0;

                    for (j = 0, k = 0; j <= sides; j++) {
                        beta = j * delta;
                        x = Math.sin(beta);
                        z = -Math.cos(beta);

                        if (topRadius > x3dom.fields.Eps) {
                            px = x * topRadius + this._vf.xoff;
                            pz = z * topRadius + this._vf.yoff;
                        }

                        this._mesh._positions[0].push(px, height / 2, pz);
                        this._mesh._normals[0].push(x / nlen, incl / nlen, z / nlen);
                        this._mesh._texCoords[0].push(1.0 - j / sides, 1);

                        this._mesh._positions[0].push(x * bottomRadius, -height / 2, z * bottomRadius);
                        this._mesh._normals[0].push(x / nlen, incl / nlen, z / nlen);
                        this._mesh._texCoords[0].push(1.0 - j / sides, 0);

                        if (j > 0) {
                            this._mesh._indices[0].push(k + 0);
                            this._mesh._indices[0].push(k + 2);
                            this._mesh._indices[0].push(k + 1);

                            this._mesh._indices[0].push(k + 1);
                            this._mesh._indices[0].push(k + 2);
                            this._mesh._indices[0].push(k + 3);

                            k += 2;
                        }
                    }
                }

                if (bottomRadius > 0) {
                    base = this._mesh._positions[0].length / 3;

                    for (j = sides - 1; j >= 0; j--) {
                        beta = j * delta;
                        x = bottomRadius * Math.sin(beta);
                        z = -bottomRadius * Math.cos(beta);

                        this._mesh._positions[0].push(x, -height / 2, z);
                        this._mesh._normals[0].push(0, -1, 0);
                        this._mesh._texCoords[0].push(x / bottomRadius / 2 + 0.5, z / bottomRadius / 2 + 0.5);
                    }

                    h = base + 1;

                    for (j = 2; j < sides; j++) {
                        this._mesh._indices[0].push(h);
                        this._mesh._indices[0].push(base);

                        h = base + j;
                        this._mesh._indices[0].push(h);
                    }
                }

                if (topRadius > x3dom.fields.Eps) {
                    base = this._mesh._positions[0].length / 3;

                    for (j = sides - 1; j >= 0; j--) {
                        beta = j * delta;
                        x =  topRadius * Math.sin(beta);
                        z = -topRadius * Math.cos(beta);

                        this._mesh._positions[0].push(x + this._vf.xoff, height / 2, z + this._vf.yoff);
                        this._mesh._normals[0].push(0, 1, 0);
                        this._mesh._texCoords[0].push(x / topRadius / 2 + 0.5, 1.0 - z / topRadius / 2 + 0.5);
                    }

                    h = base + 1;

                    for (j = 2; j < sides; j++) {
                        this._mesh._indices[0].push(base);
                        this._mesh._indices[0].push(h);

                        h = base + j;
                        this._mesh._indices[0].push(h);
                    }
                }

                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        },
        {
            fieldChanged: function (fieldName)
            {
                if (fieldName === "dtop" || fieldName === "dbottom" ||
                    fieldName === "height" || fieldName === "subdivision" ||
                    fieldName === "xoff" || fieldName === "yoff")
                {
                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] = [];
                    this._mesh._normals[0] = [];
                    this._mesh._texCoords[0] = [];

                    var bottomRadius = this._vf.dbottom, height = this._vf.height;
                    var topRadius = this._vf.dtop, sides = this._vf.subdivision;

                    var beta, x, z;
                    var delta = 2.0 * Math.PI / sides;

                    var incl = (bottomRadius - topRadius) / height;
                    var nlen = 1.0 / Math.sqrt(1.0 + incl * incl);

                    var j = 0, k = 0;
                    var h, base;

                    if (height > 0)
                    {
                        var px = 0, pz = 0;

                        for (j = 0, k = 0; j <= sides; j++) {
                            beta = j * delta;
                            x = Math.sin(beta);
                            z = -Math.cos(beta);

                            if (topRadius > x3dom.fields.Eps) {
                                px = x * topRadius + this._vf.xoff;
                                pz = z * topRadius + this._vf.yoff;
                            }

                            this._mesh._positions[0].push(px, height / 2, pz);
                            this._mesh._normals[0].push(x / nlen, incl / nlen, z / nlen);
                            this._mesh._texCoords[0].push(1.0 - j / sides, 1);

                            this._mesh._positions[0].push(x * bottomRadius, -height / 2, z * bottomRadius);
                            this._mesh._normals[0].push(x / nlen, incl / nlen, z / nlen);
                            this._mesh._texCoords[0].push(1.0 - j / sides, 0);

                            if (j > 0) {
                                this._mesh._indices[0].push(k + 0);
                                this._mesh._indices[0].push(k + 2);
                                this._mesh._indices[0].push(k + 1);

                                this._mesh._indices[0].push(k + 1);
                                this._mesh._indices[0].push(k + 2);
                                this._mesh._indices[0].push(k + 3);

                                k += 2;
                            }
                        }
                    }

                    if (bottomRadius > 0)
                    {
                        base = this._mesh._positions[0].length / 3;

                        for (j = sides - 1; j >= 0; j--) {
                            beta = j * delta;
                            x = bottomRadius * Math.sin(beta);
                            z = -bottomRadius * Math.cos(beta);

                            this._mesh._positions[0].push(x, -height / 2, z);
                            this._mesh._normals[0].push(0, -1, 0);
                            this._mesh._texCoords[0].push(x / bottomRadius / 2 + 0.5, z / bottomRadius / 2 + 0.5);
                        }

                        h = base + 1;

                        for (j = 2; j < sides; j++) {
                            this._mesh._indices[0].push(h);
                            this._mesh._indices[0].push(base);

                            h = base + j;
                            this._mesh._indices[0].push(h);
                        }
                    }

                    if (topRadius > x3dom.fields.Eps)
                    {
                        base = this._mesh._positions[0].length / 3;

                        for (j = sides - 1; j >= 0; j--) {
                            beta = j * delta;
                            x =  topRadius * Math.sin(beta) + this._vf.xoff;
                            z = -topRadius * Math.cos(beta) + this._vf.yoff;

                            this._mesh._positions[0].push(x, height / 2, z);
                            this._mesh._normals[0].push(0, 1, 0);
                            this._mesh._texCoords[0].push(x / topRadius / 2 + 0.5, 1.0 - z / topRadius / 2 + 0.5);
                        }

                        h = base + 1;

                        for (j = 2; j < sides; j++) {
                            this._mesh._indices[0].push(base);
                            this._mesh._indices[0].push(h);

                            h = base + j;
                            this._mesh._indices[0].push(h);
                        }
                    }

                    this.invalidateVolume();
                    this._mesh._numFaces = this._mesh._indices[0].length / 3;
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                        node.invalidateVolume();
                    });
                }
            }
        }
    )
);

/* ### Dish ### */
x3dom.registerNodeType(
    "Dish",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Dish.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'diameter', 2); 	//Diameter of base
            this.addField_SFFloat(ctx, 'height', 1);	//Maximum height of dished surface above base
            this.addField_SFFloat(ctx, 'radius', 0);	//If r is 0, treat as section of sphere, else half of ellipsoid
            this.addField_SFVec2f(ctx, 'subdivision', 24, 24);

            this.rebuildGeometry();
        },
        {
            rebuildGeometry: function()
            {
                this._mesh._positions[0] = [];
                this._mesh._normals[0]   = [];
                this._mesh._texCoords[0] = [];
                this._mesh._indices[0]   = [];

                var halfDia = this._vf.diameter / 2, r = this._vf.radius,
                    h = (r == 0) ? Math.min(this._vf.height, halfDia) : this._vf.height;
                var offset = (r == 0) ? (halfDia - h) : 0;
                var twoPi = Math.PI * 2, halfPi = Math.PI / 2;

                var latitudeBands = this._vf.subdivision.x, longitudeBands = this._vf.subdivision.y;
                var latNumber, longNumber;
                var a, b, c;

                var theta, sinTheta, cosTheta;
                var phi, sinPhi, cosPhi;
                var x, y, z, u, v;
                var tmpPosArr = [], tmpTcArr = [];

                if (r == 0) {
                    var segTheta = halfPi - Math.asin(1 - h / halfDia);
                    var segL = Math.ceil(latitudeBands / halfPi * segTheta);

                    a = halfDia;
                    b = halfDia;
                    c = halfDia;
                }
                else {
                    a = halfDia;
                    b = h;
                    c = r;
                }

                for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
                    if (r == 0 && segL == latNumber) {
                        theta = segTheta;
                    }
                    else {
                        theta = (latNumber * halfPi) / latitudeBands;
                    }
                    sinTheta = Math.sin(theta);
                    cosTheta = Math.cos(theta);

                    for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                        phi = (longNumber * twoPi) / longitudeBands;
                        sinPhi = Math.sin(phi);
                        cosPhi = Math.cos(phi);

                        x = a * (-cosPhi * sinTheta);
                        y = b *            cosTheta;
                        z = c * (-sinPhi * sinTheta);

                        u = 0.25 - (longNumber / longitudeBands);
                        v = latNumber / latitudeBands;

                        this._mesh._positions[0].push(x, y - offset, z);
                        this._mesh._texCoords[0].push(u, v);
                        if (r == 0) {
                            this._mesh._normals[0].push(x, y, z);
                        }
                        else {
                            this._mesh._normals[0].push(x/(a*a), y/(b*b), z/(c*c));
                        }

                        if ((latNumber == latitudeBands) || (r == 0 && segL == latNumber)) {
                            tmpPosArr.push(x, y - offset, z);
                            tmpTcArr.push(u, v);
                        }
                    }

                    if (r == 0 && segL == latNumber)
                        break;
                }

                for (latNumber = 0; latNumber < latitudeBands; latNumber++) {
                    if (r == 0 && segL == latNumber)
                        break;

                    for (longNumber = 0; longNumber < longitudeBands; longNumber++) {
                        var first = (latNumber * (longitudeBands + 1)) + longNumber;
                        var second = first + longitudeBands + 1;

                        this._mesh._indices[0].push(first + 1);
                        this._mesh._indices[0].push(second);
                        this._mesh._indices[0].push(first);

                        this._mesh._indices[0].push(first + 1);
                        this._mesh._indices[0].push(second + 1);
                        this._mesh._indices[0].push(second);
                    }
                }

                var origPos = this._mesh._positions[0].length / 3;
                var t = origPos + 1;

                for (var i=0, m=tmpPosArr.length/3; i<m; i++) {
                    this._mesh._positions[0].push(tmpPosArr[3*i  ]);
                    this._mesh._positions[0].push(tmpPosArr[3*i+1]);
                    this._mesh._positions[0].push(tmpPosArr[3*i+2]);
                    this._mesh._texCoords[0].push(tmpTcArr[2*i  ]);
                    this._mesh._texCoords[0].push(tmpTcArr[2*i+1]);
                    this._mesh._normals[0].push(0, -1, 0);

                    if (i >= 2) {
                        this._mesh._indices[0].push(origPos);
                        this._mesh._indices[0].push(t);

                        t = origPos + i;
                        this._mesh._indices[0].push(t);
                    }
                }

                this.invalidateVolume();
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
            },

            fieldChanged: function(fieldName)
            {
                 if (fieldName == "radius" || fieldName == "height" ||
                     fieldName == "diameter" || fieldName == "subdivision")
                 {
                     this.rebuildGeometry();

                     Array.forEach(this._parentNodes, function (node) {
                         node.setAllDirty();
                         node.invalidateVolume();
                     });
                }
            }
        }
    )
);

/* ### Pyramid ### */
x3dom.registerNodeType(
    "Pyramid",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Pyramid.superClass.call(this, ctx);
            
            this.addField_SFFloat(ctx, 'xbottom', 1);	//Dimension of bottom parallel to X-axis
            this.addField_SFFloat(ctx, 'ybottom', 1);	//Dimension of bottom parallel to Y-axis
            this.addField_SFFloat(ctx, 'xtop', 0.5);		//Dimension of top parallel to X-axis
            this.addField_SFFloat(ctx, 'ytop', 0.5);		//Dimension of top parallel to Y-axis
            this.addField_SFFloat(ctx, 'height', 1);	//Height between top and bottom surface
            this.addField_SFFloat(ctx, 'xoff', 0.25);		//Displacement of axes along X-axis
            this.addField_SFFloat(ctx, 'yoff', 0.25);		//Displacement of axes along Y-axis
            
            var xTop = this._vf.xtop;
            var yTop = this._vf.ytop;
            var xBot = this._vf.xbottom;
            var yBot = this._vf.ybottom;
            var xOff = this._vf.xoff;
            var yOff = this._vf.yoff;
            var sy = this._vf.height / 2;

            var geoCacheID = 'Pyramid_'+xTop+'-'+yTop+'-'+xBot+'-'+yBot+'-'+xOff+'-'+yOff+'-'+sy;

            if( this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined )
            {
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else
            {
                this._mesh._positions[0] = [
                    -xBot,       -sy, -yBot,        -xTop + xOff, sy, -yTop + yOff,  xTop + xOff, sy, -yTop + yOff,  xBot,       -sy, -yBot,
                    -xBot,       -sy,  yBot,        -xTop + xOff, sy,  yTop + yOff,  xTop + xOff, sy,  yTop + yOff,  xBot,       -sy,  yBot,
                    -xBot,       -sy, -yBot,        -xBot,       -sy,  yBot,        -xTop + xOff, sy,  yTop + yOff, -xTop + xOff, sy, -yTop + yOff,
                     xBot,       -sy, -yBot,         xBot,       -sy,  yBot,         xTop + xOff, sy,  yTop + yOff,  xTop + xOff, sy, -yTop + yOff,
                    -xTop + xOff, sy, -yTop + yOff, -xTop + xOff, sy,  yTop + yOff,  xTop + xOff, sy,  yTop + yOff,  xTop + xOff, sy, -yTop + yOff,
                    -xBot,       -sy, -yBot,        -xBot,       -sy,  yBot,         xBot,       -sy,  yBot,         xBot,       -sy, -yBot
                ];
                this._mesh._texCoords[0] = [
                    1, 0, 1, 1, 0, 1, 0, 0,
                    0, 0, 0, 1, 1, 1, 1, 0,
                    0, 0, 1, 0, 1, 1, 0, 1,
                    1, 0, 0, 0, 0, 1, 1, 1,
                    0, 1, 0, 0, 1, 0, 1, 1,
                    0, 0, 0, 1, 1, 1, 1, 0
                ];
                this._mesh._indices[0] = [
                    0, 1, 2, 2, 3, 0,
                    6, 5, 4, 4, 7, 6,
                    8, 9, 10, 10, 11, 8,
                    12, 15, 14, 14, 13, 12,
                    16, 17, 18, 18, 19, 16,
                    20, 23, 22, 22, 21, 20
                ];

                // attention, we share per side, therefore > 0
                this._mesh.calcNormals(Math.PI, this._vf.ccw);

                this._mesh._invalidate = true;
                this._mesh._numFaces = 12;
                this._mesh._numCoords = 24;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        },
        {
            fieldChanged: function(fieldName) {
                if (fieldName === "xbottom" || fieldName === "ybottom" ||
                    fieldName === "xtop" || fieldName === "ytop" ||
                    fieldName === "xoff" || fieldName === "yoff" ||
                    fieldName === "height") {
                
                    var xTop = this._vf.xtop;
                    var yTop = this._vf.ytop;
                    var xBot = this._vf.xbottom;
                    var yBot = this._vf.ybottom;
                    var xOff = this._vf.xoff;
                    var yOff = this._vf.yoff;
                    var sy = this._vf.height / 2;

                    this._mesh._positions[0] = [
                        -xBot,-sy,-yBot,  -xTop + xOff, sy,-yTop + yOff,   xTop + xOff, sy,-yTop + yOff,   xBot,-sy,-yBot,
                        -xBot,-sy, yBot,  -xTop + xOff, sy, yTop + yOff,   xTop + xOff, sy, yTop + yOff,   xBot,-sy, yBot,
                        -xBot,-sy,-yBot,  -xBot,-sy, yBot,  -xTop + xOff, sy, yTop + yOff,  -xTop + xOff, sy,-yTop + yOff,
                         xBot,-sy,-yBot,   xBot,-sy, yBot,   xTop + xOff, sy, yTop + yOff,   xTop + xOff, sy,-yTop + yOff,
                        -xTop + xOff, sy,-yTop + yOff,  -xTop + xOff, sy, yTop + yOff,   xTop + xOff, sy, yTop + yOff,   xTop + xOff, sy,-yTop + yOff,
                        -xBot,-sy,-yBot,  -xBot,-sy, yBot,   xBot,-sy, yBot,   xBot,-sy,-yBot
                    ];

                    this._mesh._normals[0] = [];
                    this._mesh.calcNormals(Math.PI, this._vf.ccw);

                    this.invalidateVolume();

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        node.invalidateVolume();
                    });
                }
            }
        }
    )
);

/* ### RectangularTorus ### */
x3dom.registerNodeType(
    "RectangularTorus",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.RectangularTorus.superClass.call(this, ctx);

            var twoPi = 2.0 * Math.PI;

            this.addField_SFFloat(ctx, 'innerRadius', 0.5); //Inside radius
            this.addField_SFFloat(ctx, 'outerRadius', 1);	//Outside radius
            this.addField_SFFloat(ctx, 'height', 1);	//Height of rectangular section
            this.addField_SFFloat(ctx, 'angle', twoPi);	//Subtended angle
            this.addField_SFFloat(ctx, 'subdivision', 32);

            // assure that angle in [0, 2 * PI]
            if (this._vf.angle < 0)
                this._vf.angle = 0;
            else if (this._vf.angle > twoPi)
                this._vf.angle = twoPi;

            // assure that innerRadius < outerRadius
            if (this._vf.innerRadius > this._vf.outerRadius)
            {
                var tmp = this._vf.innerRadius;
                this._vf.innerRadius = this._vf.outerRadius;
                this._vf.outerRadius = tmp;
            }

            var innerRadius = this._vf.innerRadius;
            var outerRadius = this._vf.outerRadius;
            var height = this._vf.height;
            var angle = this._vf.angle;

            var beta, delta, x, z, k, j;
            var sides = this._vf.subdivision;

            var geoCacheID = 'RectangularTorus_'+innerRadius+'-'+outerRadius+'-'+height+'-'+angle;

            if( ctx && this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined )
            {
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else
            {
                delta = angle / sides;

                //Outer Side
                for (j=0, k=0; j<=sides; j++)
                {
                    beta = j * delta;
                    x = outerRadius * Math.sin(beta);
                    z = outerRadius * -Math.cos(beta);

                    this._mesh._positions[0].push(x, -height/2, z);
                    this._mesh._normals[0].push(x, 0, z);

                    this._mesh._positions[0].push(x, height/2, z);
                    this._mesh._normals[0].push(x, 0, z);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k + 0);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 3);

                        k += 2;
                    }
                }

                //Inner Side
                for (j=0, k=k+2; j<=sides; j++)
                {
                    beta = j * delta;
                    x = innerRadius * Math.sin(beta);
                    z = innerRadius * -Math.cos(beta);

                    this._mesh._positions[0].push(x, -height/2, z);
                    this._mesh._normals[0].push(-x, 0, -z);

                    this._mesh._positions[0].push(x, height/2, z);
                    this._mesh._normals[0].push(-x, 0, -z);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 0);

                        this._mesh._indices[0].push(k + 3);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        k += 2;
                    }
                }

                //Top Side
                for (j=0, k=k+2; j<=sides; j++)
                {
                    beta = j * delta;
                    x = outerRadius * Math.sin(beta);
                    z = outerRadius * -Math.cos(beta);

                    this._mesh._positions[0].push(x, height/2, z);
                    this._mesh._normals[0].push(0, 1, 0);

                    x = innerRadius * Math.sin(beta);
                    z = innerRadius * -Math.cos(beta);

                    this._mesh._positions[0].push(x, height/2, z);
                    this._mesh._normals[0].push(0, 1, 0);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k + 0);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 3);

                        k += 2;
                    }
                }

                //Bottom Side
                for (j=0, k=k+2; j<=sides; j++)
                {
                    beta = j * delta;
                    x = outerRadius * Math.sin(beta);
                    z = outerRadius * -Math.cos(beta);

                    this._mesh._positions[0].push(x, -height/2, z);
                    this._mesh._normals[0].push(0, -1, 0);

                    x = innerRadius * Math.sin(beta);
                    z = innerRadius * -Math.cos(beta);

                    this._mesh._positions[0].push(x, -height/2, z);
                    this._mesh._normals[0].push(0, -1, 0);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 0);

                        this._mesh._indices[0].push(k + 3);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        k += 2;
                    }
                }

                //Create Caps
                if (angle < twoPi)
                {
                    //First Cap
                    k += 2;

                    x = outerRadius * Math.sin(0);
                    z = outerRadius * -Math.cos(0);

                    this._mesh._positions[0].push(x, height/2, z);
                    this._mesh._normals[0].push(-1, 0, 0);
                    this._mesh._positions[0].push(x, -height/2, z);
                    this._mesh._normals[0].push(-1, 0, 0);

                    x = innerRadius * Math.sin(0);
                    z = innerRadius * -Math.cos(0);

                    this._mesh._positions[0].push(x, height/2, z);
                    this._mesh._normals[0].push(-1, 0, 0);
                    this._mesh._positions[0].push(x, -height/2, z);
                    this._mesh._normals[0].push(-1, 0, 0);

                    this._mesh._indices[0].push(k + 0);
                    this._mesh._indices[0].push(k + 1);
                    this._mesh._indices[0].push(k + 2);

                    this._mesh._indices[0].push(k + 2);
                    this._mesh._indices[0].push(k + 1);
                    this._mesh._indices[0].push(k + 3);

                    //Second Cap
                    k+=4;

                    x = outerRadius * Math.sin(angle);
                    z = outerRadius * -Math.cos(angle);

                    this._mesh._positions[0].push(x, height/2, z);
                    this._mesh._normals[0].push(z, 0, x);
                    this._mesh._positions[0].push(x, -height/2, z);
                    this._mesh._normals[0].push(z, 0, x);

                    x = innerRadius * Math.sin(angle);
                    z = innerRadius * -Math.cos(angle);

                    this._mesh._positions[0].push(x, height/2, z);
                    this._mesh._normals[0].push(z, 0, x);
                    this._mesh._positions[0].push(x, -height/2, z);
                    this._mesh._normals[0].push(z, 0, x);

                    this._mesh._indices[0].push(k + 2);
                    this._mesh._indices[0].push(k + 1);
                    this._mesh._indices[0].push(k + 0);

                    this._mesh._indices[0].push(k + 3);
                    this._mesh._indices[0].push(k + 1);
                    this._mesh._indices[0].push(k + 2);
                }

                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        },
        {
            fieldChanged: function(fieldname)
            {
                if (fieldname === "innerRadius" || fieldname === "outerRadius" ||
                    fieldname === "height" || fieldname === "angle" ||
                    fieldname === "subdivision")
                {
                    this._mesh._positions[0] = [];
                    this._mesh._normals[0]   = [];
                    this._mesh._texCoords[0] = [];
                    this._mesh._indices[0]   = [];

                    var twoPi = 2.0 * Math.PI;

                    // assure that angle in [0, 2 * PI]
                    if (this._vf.angle < 0)
                        this._vf.angle = 0;
                    else if (this._vf.angle > twoPi)
                        this._vf.angle = twoPi;

                    // assure that innerRadius < outerRadius
                    if (this._vf.innerRadius > this._vf.outerRadius)
                    {
                        var tmp = this._vf.innerRadius;
                        this._vf.innerRadius = this._vf.outerRadius;
                        this._vf.outerRadius = tmp;
                    }

                    var innerRadius = this._vf.innerRadius;
                    var outerRadius = this._vf.outerRadius;
                    var height = this._vf.height;
                    var angle = this._vf.angle;
                    var sides = this._vf.subdivision;

                    var beta, delta, x, z, k, j;

                    delta = angle / sides;

                    //Outer Side
                    for (j=0, k=0; j<=sides; j++)
                    {
                        beta = j * delta;
                        x = outerRadius * Math.sin(beta);
                        z = outerRadius * -Math.cos(beta);

                        this._mesh._positions[0].push(x, -height/2, z);
                        this._mesh._normals[0].push(x, 0, z);

                        this._mesh._positions[0].push(x, height/2, z);
                        this._mesh._normals[0].push(x, 0, z);

                        if (j > 0)
                        {
                            this._mesh._indices[0].push(k + 0);
                            this._mesh._indices[0].push(k + 1);
                            this._mesh._indices[0].push(k + 2);

                            this._mesh._indices[0].push(k + 2);
                            this._mesh._indices[0].push(k + 1);
                            this._mesh._indices[0].push(k + 3);

                            k += 2;
                        }
                    }

                    //Inner Side
                    for (j=0, k=k+2; j<=sides; j++)
                    {
                        beta = j * delta;
                        x = innerRadius * Math.sin(beta);
                        z = innerRadius * -Math.cos(beta);

                        this._mesh._positions[0].push(x, -height/2, z);
                        this._mesh._normals[0].push(-x, 0, -z);

                        this._mesh._positions[0].push(x, height/2, z);
                        this._mesh._normals[0].push(-x, 0, -z);

                        if (j > 0)
                        {
                            this._mesh._indices[0].push(k + 2);
                            this._mesh._indices[0].push(k + 1);
                            this._mesh._indices[0].push(k + 0);

                            this._mesh._indices[0].push(k + 3);
                            this._mesh._indices[0].push(k + 1);
                            this._mesh._indices[0].push(k + 2);

                            k += 2;
                        }
                    }

                    //Top Side
                    for (j=0, k=k+2; j<=sides; j++)
                    {
                        beta = j * delta;
                        x = outerRadius * Math.sin(beta);
                        z = outerRadius * -Math.cos(beta);

                        this._mesh._positions[0].push(x, height/2, z);
                        this._mesh._normals[0].push(0, 1, 0);

                        x = innerRadius * Math.sin(beta);
                        z = innerRadius * -Math.cos(beta);

                        this._mesh._positions[0].push(x, height/2, z);
                        this._mesh._normals[0].push(0, 1, 0);

                        if (j > 0)
                        {
                            this._mesh._indices[0].push(k + 0);
                            this._mesh._indices[0].push(k + 1);
                            this._mesh._indices[0].push(k + 2);

                            this._mesh._indices[0].push(k + 2);
                            this._mesh._indices[0].push(k + 1);
                            this._mesh._indices[0].push(k + 3);

                            k += 2;
                        }
                    }

                    //Bottom Side
                    for (j=0, k=k+2; j<=sides; j++)
                    {
                        beta = j * delta;
                        x = outerRadius * Math.sin(beta);
                        z = outerRadius * -Math.cos(beta);

                        this._mesh._positions[0].push(x, -height/2, z);
                        this._mesh._normals[0].push(0, -1, 0);

                        x = innerRadius * Math.sin(beta);
                        z = innerRadius * -Math.cos(beta);

                        this._mesh._positions[0].push(x, -height/2, z);
                        this._mesh._normals[0].push(0, -1, 0);

                        if (j > 0)
                        {
                            this._mesh._indices[0].push(k + 2);
                            this._mesh._indices[0].push(k + 1);
                            this._mesh._indices[0].push(k + 0);

                            this._mesh._indices[0].push(k + 3);
                            this._mesh._indices[0].push(k + 1);
                            this._mesh._indices[0].push(k + 2);

                            k += 2;
                        }
                    }

                    //Create Caps
                    if (angle < twoPi)
                    {
                        //First Cap
                        k += 2;

                        x = outerRadius * Math.sin(0);
                        z = outerRadius * -Math.cos(0);

                        this._mesh._positions[0].push(x, height/2, z);
                        this._mesh._normals[0].push(-1, 0, 0);
                        this._mesh._positions[0].push(x, -height/2, z);
                        this._mesh._normals[0].push(-1, 0, 0);

                        x = innerRadius * Math.sin(0);
                        z = innerRadius * -Math.cos(0);

                        this._mesh._positions[0].push(x, height/2, z);
                        this._mesh._normals[0].push(-1, 0, 0);
                        this._mesh._positions[0].push(x, -height/2, z);
                        this._mesh._normals[0].push(-1, 0, 0);

                        this._mesh._indices[0].push(k + 0);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 3);

                        //Second Cap
                        k+=4;

                        x = outerRadius * Math.sin(angle);
                        z = outerRadius * -Math.cos(angle);

                        this._mesh._positions[0].push(x, height/2, z);
                        this._mesh._normals[0].push(z, 0, x);
                        this._mesh._positions[0].push(x, -height/2, z);
                        this._mesh._normals[0].push(z, 0, x);

                        x = innerRadius * Math.sin(angle);
                        z = innerRadius * -Math.cos(angle);

                        this._mesh._positions[0].push(x, height/2, z);
                        this._mesh._normals[0].push(z, 0, x);
                        this._mesh._positions[0].push(x, -height/2, z);
                        this._mesh._normals[0].push(z, 0, x);

                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 0);

                        this._mesh._indices[0].push(k + 3);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);
                    }

                    this.invalidateVolume();
                    this._mesh._numFaces = this._mesh._indices[0].length / 3;
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;

                    Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                        node.invalidateVolume();
                    });
                }
            }
        }
    )
);

/* ### SlopedCylinder ### */
x3dom.registerNodeType(
    "SlopedCylinder",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.SlopedCylinder.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'radius', 1.0);
            this.addField_SFFloat(ctx, 'height', 2.0);
            this.addField_SFBool(ctx, 'bottom', true);
            this.addField_SFBool(ctx, 'top', true);
            this.addField_SFFloat(ctx, 'xtshear', -15.0);
            this.addField_SFFloat(ctx, 'ytshear', 10.0);
            this.addField_SFFloat(ctx, 'xbshear', 5.0);
            this.addField_SFFloat(ctx, 'ybshear', 35.0);
            this.addField_SFFloat(ctx, 'subdivision', 32);

            var pi180 = Math.PI / 180;
            var topSlopeX = this._vf.radius * (Math.tan(this._vf.xtshear * pi180));
            var topSlopeY = this._vf.radius * (Math.tan(this._vf.ytshear * pi180));
            var botSlopeX = this._vf.radius * (Math.tan(this._vf.xbshear * pi180));
            var botSlopeY = this._vf.radius * (Math.tan(this._vf.ybshear * pi180));
            
            var sides = this._vf.subdivision;

            var geoCacheID = 'SlopedCylinder_'+this._vf.radius+'_'+this._vf.height+'_'+this._vf.bottom+'_'+this._vf.top;

            if( this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined )
            {
                //x3dom.debug.logInfo("Using Cylinder from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else
            {
                var radius = this._vf.radius;
                var height = this._vf.height;

                var beta, x, z;
                var delta = 2.0 * Math.PI / sides;

                var j = 0;
                var k = 0;

                for (j=0, k=0; j<=sides; j++)
                {
                      beta = j * delta;
                      x = Math.sin(beta);
                      z = -Math.cos(beta);

                      this._mesh._positions[0].push(x * radius, -height/2 + x * botSlopeX + z * botSlopeY, z * radius);
                      this._mesh._normals[0].push(x, 0, z);
                      this._mesh._texCoords[0].push(1.0 - j / sides, 0);

                      this._mesh._positions[0].push(x * radius, height/2 + x * topSlopeX + z * topSlopeY, z * radius);
                      this._mesh._normals[0].push(x, 0, z);
                      this._mesh._texCoords[0].push(1.0 - j / sides, 1);

                      if (j > 0)
                      {
                              this._mesh._indices[0].push(k + 0);
                              this._mesh._indices[0].push(k + 1);
                              this._mesh._indices[0].push(k + 2);

                              this._mesh._indices[0].push(k + 2);
                              this._mesh._indices[0].push(k + 1);
                              this._mesh._indices[0].push(k + 3);

                              k += 2;
                      }
                }

                if (radius > 0)
                {
                    var h, base = this._mesh._positions[0].length / 3;

                    if (this._vf.top)
                    {
                        for (j=sides-1; j>=0; j--)
                        {
                              beta = j * delta;
                              x = radius * Math.sin(beta);
                              z = -radius * Math.cos(beta);

                              this._mesh._positions[0].push(x, height/2 + x * topSlopeX + z * topSlopeY, z);
                              this._mesh._normals[0].push(0, 1, 0);
                              this._mesh._texCoords[0].push(x / radius / 2 + 0.5, -z / radius / 2 + 0.5);
                        }

                        h = base + 1;

                        for (j=2; j<sides; j++)
                        {
                              this._mesh._indices[0].push(base);
                              this._mesh._indices[0].push(h);

                              h = base + j;
                              this._mesh._indices[0].push(h);
                        }

                        base = this._mesh._positions[0].length / 3;
                    }

                    if (this._vf.bottom)
                    {
                        for (j=sides-1; j>=0; j--)
                        {
                              beta = j * delta;
                              x = radius * Math.sin(beta);
                              z = -radius * Math.cos(beta);

                              this._mesh._positions[0].push(x, -height/2 + x * botSlopeX + z * botSlopeY, z);
                              this._mesh._normals[0].push(0, -1, 0);
                              this._mesh._texCoords[0].push(x / radius / 2 + 0.5, z / radius / 2 + 0.5);
                        }

                        h = base + 1;

                        for (j=2; j<sides; j++)
                        {
                              this._mesh._indices[0].push(h);
                              this._mesh._indices[0].push(base);

                              h = base + j;
                              this._mesh._indices[0].push(h);
                        }
                    }
                }

                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
         },
        {
            fieldChanged: function(fieldName) {
                if (fieldName === "xtshear" || fieldName === "ytshear" ||
                    fieldName === "xbshear" || fieldName === "ybshear" ||
                    fieldName === "radius" || fieldName === "height") { 
		
                    this._mesh._positions[0] = [];

                    var pi180 = Math.PI / 180;
                    var topSlopeX = (Math.tan(this._vf.xtshear * pi180));
                    var topSlopeY = (Math.tan(this._vf.ytshear * pi180));
                    var botSlopeX = (Math.tan(this._vf.xbshear * pi180));
                    var botSlopeY = (Math.tan(this._vf.ybshear * pi180));

                    var sides = this._vf.subdivision;
                    
                    var radius = this._vf.radius;
                    var height = this._vf.height;

                    var beta, x, z;
                    var delta = 2.0 * Math.PI / sides;
                    var j = 0;

                    for (j=0; j<=sides; j++)
                    {
                          beta = j * delta;
                          x = Math.sin(beta);
                          z = -Math.cos(beta);

                          this._mesh._positions[0].push(x * radius,
                              -height/2 + x * botSlopeX * radius + z * botSlopeY * radius, z * radius);
                          this._mesh._positions[0].push(x * radius,
                              height/2 + x * topSlopeX * radius + z * topSlopeY * radius, z * radius);
                    }

                    if (radius > 0)
                    {
                        if (this._vf.top)
                        {
                            for (j=sides-1; j>=0; j--)
                            {
                                  beta = j * delta;
                                  x = radius * Math.sin(beta);
                                  z = -radius * Math.cos(beta);

                                  this._mesh._positions[0].push(x, height/2 + x * topSlopeX + z * topSlopeY, z);
                            }
                        }

                        if (this._vf.bottom)
                        {
                            for (j=sides-1; j>=0; j--)
                            {
                                  beta = j * delta;
                                  x = radius * Math.sin(beta);
                                  z = -radius * Math.cos(beta);

                                  this._mesh._positions[0].push(x, -height/2 + x * botSlopeX + z * botSlopeY, z);
                            }
                        }
                    }

                    // TODO: subdivision
                    this.invalidateVolume();
                    
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        node.invalidateVolume();
                    });
                }		
            }
        }
    )
);

/* ### Nozzle ### */
x3dom.registerNodeType(
    "Nozzle",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Nozzle.superClass.call(this, ctx);
			
			this.addField_SFFloat(ctx, 'height', 0);
			this.addField_SFFloat(ctx, 'angle', 0);
			this.addField_SFFloat(ctx, 'radius', 0);
			
			var geoCacheID = 'Nozzle...';

			if( ctx && this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined )
			{
				this._mesh = x3dom.geoCache[geoCacheID];
			}
			else
			{                
				this._mesh._invalidate = true;
				this._mesh._numFaces = this._mesh._indices[0].length / 3;
				this._mesh._numCoords = this._mesh._positions[0].length / 3;

				x3dom.geoCache[geoCacheID] = this._mesh;
			}
         },
         {
            fieldChanged: function(fieldName) 
			{
        	}
		}
    )
);
