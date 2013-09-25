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

            this.addField_SFFloat(ctx, 'dbottom', 1.0); // Diameter of bottom surface
            this.addField_SFFloat(ctx, 'dtop', 0.5);    // Diameter of top surface
            this.addField_SFFloat(ctx, 'height', 1.0);  // Perpendicular distance between surfaces
            this.addField_SFFloat(ctx, 'xoff', 0.25);   // Displacement of axes along X-axis
            this.addField_SFFloat(ctx, 'yoff', 0.25);   // Displacement of axes along Y-axis
            this.addField_SFBool(ctx, 'bottom', true);
            this.addField_SFBool(ctx, 'top', true);
            this.addField_SFFloat(ctx, 'subdivision', 32);

            this.rebuildGeometry();
        },
        {
            rebuildGeometry: function()
            {
                this._mesh._positions[0] = [];
                this._mesh._normals[0]   = [];
                this._mesh._texCoords[0] = [];
                this._mesh._indices[0]   = [];

                var bottomRadius = this._vf.dbottom / 2, height = this._vf.height;
                var topRadius = this._vf.dtop / 2, sides = this._vf.subdivision;

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
                            this._mesh._indices[0].push(k    );
                            this._mesh._indices[0].push(k + 2);
                            this._mesh._indices[0].push(k + 1);

                            this._mesh._indices[0].push(k + 1);
                            this._mesh._indices[0].push(k + 2);
                            this._mesh._indices[0].push(k + 3);

                            k += 2;
                        }
                    }
                }

                if (bottomRadius > 0 && this._vf.bottom) {
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

                if (topRadius > x3dom.fields.Eps && this._vf.top) {
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

                this.invalidateVolume();
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
            },

            fieldChanged: function (fieldName)
            {
                if (fieldName == "dtop" || fieldName == "dbottom" ||
                    fieldName == "height" || fieldName == "subdivision" ||
                    fieldName == "xoff" || fieldName == "yoff" ||
                    fieldName == "bottom" || fieldName == "top")
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

/* ### Dish ### */
x3dom.registerNodeType(
    "Dish",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Dish.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'diameter', 2); 	//Diameter of base
            this.addField_SFFloat(ctx, 'height', 1);	//Maximum height of dished surface above base (section if < r)
            this.addField_SFFloat(ctx, 'radius', this._vf.diameter / 2);  //Third semi-principal axes of ellipsoid
            this.addField_SFBool(ctx, 'bottom', true);
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

                var twoPi = Math.PI * 2, halfPi = Math.PI / 2;
                var halfDia = this._vf.diameter / 2;

                // If r is 0 or half of diameter, treat as section of sphere, else half of ellipsoid
                var r = this._vf.radius;
                r = (r == 0 || Math.abs(halfDia - r) <= x3dom.fields.Eps) ? halfDia : r;

                // height defines sectional part taken from half of ellipsoid (sphere if r==halfDia)
                var h = Math.min(this._vf.height, r);
                var offset = r - h;

                var a = halfDia;    // 1st semi-principal axes along x
                var b = r;          // 2nd semi-principal axes along y
                var c = halfDia;    // 3rd semi-principal axes along z

                var latitudeBands = this._vf.subdivision.x, longitudeBands = this._vf.subdivision.y;
                var latNumber, longNumber;

                var segTheta = halfPi - Math.asin(1 - h / r);
                var segL = Math.ceil(latitudeBands / halfPi * segTheta);

                var theta, sinTheta, cosTheta;
                var phi, sinPhi, cosPhi;
                var x, y, z, u, v;
                var tmpPosArr = [], tmpTcArr = [];

                for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
                    if (segL == latNumber) {
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
                        this._mesh._normals[0].push(x/(a*a), y/(b*b), z/(c*c));

                        if ((latNumber == latitudeBands) || (segL == latNumber)) {
                            tmpPosArr.push(x, y - offset, z);
                            tmpTcArr.push(u, v);
                        }
                    }

                    if (segL == latNumber)
                        break;
                }

                for (latNumber = 0; latNumber < latitudeBands; latNumber++) {
                    if (segL == latNumber)
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

                if (this._vf.bottom)
                {
                    var origPos = this._mesh._positions[0].length / 3;
                    var t = origPos + 1;

                    for (var i=0, m=tmpPosArr.length/3; i<m; i++) {
                        var j = 3 * i;
                        this._mesh._positions[0].push(tmpPosArr[j  ]);
                        this._mesh._positions[0].push(tmpPosArr[j+1]);
                        this._mesh._positions[0].push(tmpPosArr[j+2]);
                        j = 2 * i;
                        this._mesh._texCoords[0].push(tmpTcArr[j  ]);
                        this._mesh._texCoords[0].push(tmpTcArr[j+1]);
                        this._mesh._normals[0].push(0, -1, 0);

                        if (i >= 2) {
                            this._mesh._indices[0].push(origPos);
                            this._mesh._indices[0].push(t);

                            t = origPos + i;
                            this._mesh._indices[0].push(t);
                        }
                    }
                }

                this.invalidateVolume();
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
            },

            fieldChanged: function(fieldName)
            {
                 if (fieldName == "radius" || fieldName == "height" || fieldName == "diameter" ||
                     fieldName == "subdivision" || fieldName == "bottom")
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
            
            var xTop = this._vf.xtop / 2;
            var yTop = this._vf.ytop / 2;
            var xBot = this._vf.xbottom / 2;
            var yBot = this._vf.ybottom / 2;
            var xOff = this._vf.xoff;
            var yOff = this._vf.yoff;
            var sy = this._vf.height / 2;

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

            // attention, we share per side, therefore creaseAngle > 0
            this._mesh.calcNormals(Math.PI, this._vf.ccw);

            this._mesh._invalidate = true;
            this._mesh._numFaces = 12;
            this._mesh._numCoords = 24;
        },
        {
            fieldChanged: function(fieldName)
            {
                if (fieldName == "xbottom" || fieldName == "ybottom" ||
                    fieldName == "xtop" || fieldName == "ytop" ||
                    fieldName == "xoff" || fieldName == "yoff" || fieldName == "height")
                {
                    var xTop = this._vf.xtop / 2;
                    var yTop = this._vf.ytop / 2;
                    var xBot = this._vf.xbottom / 2;
                    var yBot = this._vf.ybottom / 2;
                    var xOff = this._vf.xoff;
                    var yOff = this._vf.yoff;
                    var sy = this._vf.height / 2;

                    this._mesh._positions[0] = [
                        -xBot,       -sy, -yBot,        -xTop + xOff, sy, -yTop + yOff,  xTop + xOff, sy, -yTop + yOff,  xBot,       -sy, -yBot,
                        -xBot,       -sy,  yBot,        -xTop + xOff, sy,  yTop + yOff,  xTop + xOff, sy,  yTop + yOff,  xBot,       -sy,  yBot,
                        -xBot,       -sy, -yBot,        -xBot,       -sy,  yBot,        -xTop + xOff, sy,  yTop + yOff, -xTop + xOff, sy, -yTop + yOff,
                         xBot,       -sy, -yBot,         xBot,       -sy,  yBot,         xTop + xOff, sy,  yTop + yOff,  xTop + xOff, sy, -yTop + yOff,
                        -xTop + xOff, sy, -yTop + yOff, -xTop + xOff, sy,  yTop + yOff,  xTop + xOff, sy,  yTop + yOff,  xTop + xOff, sy, -yTop + yOff,
                        -xBot,       -sy, -yBot,        -xBot,       -sy,  yBot,         xBot,       -sy,  yBot,         xBot,       -sy, -yBot
                    ];

                    this._mesh._normals[0] = [];
                    this._mesh.calcNormals(Math.PI, this._vf.ccw);

                    this.invalidateVolume();

                    Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
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

            this.addField_SFFloat(ctx, 'innerRadius', 0.5); //Inside radius
            this.addField_SFFloat(ctx, 'outerRadius', 1);	//Outside radius
            this.addField_SFFloat(ctx, 'height', 1);	    //Height of rectangular section
            this.addField_SFFloat(ctx, 'angle', 2 * Math.PI);	//Subtended angle
            this.addField_SFBool(ctx, 'caps', true);        //Show side caps
            this.addField_SFFloat(ctx, 'subdivision', 32);

            this._origCCW = this._vf.ccw;

            this.rebuildGeometry();
        },
        {
            rebuildGeometry: function()
            {
                this._mesh._positions[0] = [];
                this._mesh._normals[0]   = [];
                this._mesh._texCoords[0] = [];
                this._mesh._indices[0]   = [];

                var twoPi = 2.0 * Math.PI;

                this._vf.ccw = !this._origCCW;

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
                var height = this._vf.height / 2;
                var angle = this._vf.angle;
                var sides = this._vf.subdivision;

                var beta, x, z, k, j, nx, nz;
                var delta = angle / sides;

                //Outer Side
                for (j=0, k=0; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.cos(beta);
                    nz = -Math.sin(beta);

                    x = outerRadius * nx;
                    z = outerRadius * nz;

                    this._mesh._positions[0].push(x, -height, z);
                    this._mesh._normals[0].push(nx, 0, nz);

                    this._mesh._positions[0].push(x, height, z);
                    this._mesh._normals[0].push(nx, 0, nz);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k    );
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
                    nx =  Math.cos(beta);
                    nz = -Math.sin(beta);

                    x = innerRadius * nx;
                    z = innerRadius * nz;

                    this._mesh._positions[0].push(x, -height, z);
                    this._mesh._normals[0].push(-nx, 0, -nz);

                    this._mesh._positions[0].push(x, height, z);
                    this._mesh._normals[0].push(-nx, 0, -nz);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k    );

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
                    nx =  Math.cos(beta);
                    nz = -Math.sin(beta);

                    x = outerRadius * nx;
                    z = outerRadius * nz;

                    this._mesh._positions[0].push(x, height, z);
                    this._mesh._normals[0].push(0, 1, 0);

                    x = innerRadius * nx;
                    z = innerRadius * nz;

                    this._mesh._positions[0].push(x, height, z);
                    this._mesh._normals[0].push(0, 1, 0);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k    );
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
                    nx =  Math.cos(beta);
                    nz = -Math.sin(beta);

                    x = outerRadius * nx;
                    z = outerRadius * nz;

                    this._mesh._positions[0].push(x, -height, z);
                    this._mesh._normals[0].push(0, -1, 0);

                    x = innerRadius * nx;
                    z = innerRadius * nz;

                    this._mesh._positions[0].push(x, -height, z);
                    this._mesh._normals[0].push(0, -1, 0);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k    );

                        this._mesh._indices[0].push(k + 3);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        k += 2;
                    }
                }

                //Create Caps
                if (angle < twoPi && this._vf.caps == true)
                {
                    //First Cap
                    k += 2;

                    x = outerRadius;
                    z = 0;

                    this._mesh._positions[0].push(x, height, z);
                    this._mesh._normals[0].push(0, 0, 1);
                    this._mesh._positions[0].push(x, -height, z);
                    this._mesh._normals[0].push(0, 0, 1);

                    x = innerRadius;
                    z = 0;

                    this._mesh._positions[0].push(x, height, z);
                    this._mesh._normals[0].push(0, 0, 1);
                    this._mesh._positions[0].push(x, -height, z);
                    this._mesh._normals[0].push(0, 0, 1);

                    this._mesh._indices[0].push(k    );
                    this._mesh._indices[0].push(k + 1);
                    this._mesh._indices[0].push(k + 2);

                    this._mesh._indices[0].push(k + 2);
                    this._mesh._indices[0].push(k + 1);
                    this._mesh._indices[0].push(k + 3);

                    //Second Cap
                    k+=4;

                    nx =  Math.cos(angle);
                    nz = -Math.sin(angle);

                    x = outerRadius * nx;
                    z = outerRadius * nz;

                    this._mesh._positions[0].push(x, height, z);
                    this._mesh._normals[0].push(nz, 0, -nx);
                    this._mesh._positions[0].push(x, -height, z);
                    this._mesh._normals[0].push(nz, 0, -nx);

                    x = innerRadius * nx;
                    z = innerRadius * nz;

                    this._mesh._positions[0].push(x, height, z);
                    this._mesh._normals[0].push(nz, 0, -nx);
                    this._mesh._positions[0].push(x, -height, z);
                    this._mesh._normals[0].push(nz, 0, -nx);

                    this._mesh._indices[0].push(k + 2);
                    this._mesh._indices[0].push(k + 1);
                    this._mesh._indices[0].push(k    );

                    this._mesh._indices[0].push(k + 3);
                    this._mesh._indices[0].push(k + 1);
                    this._mesh._indices[0].push(k + 2);
                }

                this.invalidateVolume();
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "innerRadius" || fieldName == "outerRadius" ||
                    fieldName == "height" || fieldName == "angle" ||
                    fieldName == "subdivision" || fieldName == "caps")
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
            this.addField_SFFloat(ctx, 'xtshear', 0.26179);
            this.addField_SFFloat(ctx, 'ytshear', 0.0);
            this.addField_SFFloat(ctx, 'xbshear', 0.26179);
            this.addField_SFFloat(ctx, 'ybshear', 0.0);
            this.addField_SFFloat(ctx, 'subdivision', 32);

            this.rebuildGeometry();
        },
        {
            rebuildGeometry: function()
            {
                this._mesh._positions[0] = [];
                this._mesh._normals[0]   = [];
                this._mesh._texCoords[0] = [];
                this._mesh._indices[0]   = [];

                var topSlopeX = this._vf.xtshear;
                var topSlopeY = this._vf.ytshear;
                var botSlopeX = this._vf.xbshear;
                var botSlopeY = this._vf.ybshear;
                var sides = this._vf.subdivision;

                var radius = this._vf.radius;
                var height = this._vf.height / 2;

                var delta = 2.0 * Math.PI / sides;
                var beta, x, y, z;
                var j, k;

                for (j=0, k=0; j<=sides; j++)
                {
                    beta = j * delta;
                    x =  Math.sin(beta);
                    z = -Math.cos(beta);

                    this._mesh._positions[0].push(x * radius, -height + x * botSlopeX + z * botSlopeY, z * radius);
                    this._mesh._texCoords[0].push(1.0 - j / sides, 0);

                    this._mesh._positions[0].push(x * radius,  height + x * topSlopeX + z * topSlopeY, z * radius);
                    this._mesh._texCoords[0].push(1.0 - j / sides, 1);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k    );
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 3);

                        k += 2;
                    }
                }

                var h, base;

                if (this._vf.top && radius > 0)
                {
                    base = this._mesh._positions[0].length / 3;

                    for (j=sides-1; j>=0; j--)
                    {
                        k = 6 * j;
                        x = this._mesh._positions[0][k+3];
                        y = this._mesh._positions[0][k+4];
                        z = this._mesh._positions[0][k+5];

                        this._mesh._positions[0].push(x, y, z);
                        this._mesh._texCoords[0].push(x / 2 + 0.5, -z / 2 + 0.5);
                    }

                    h = base + 1;

                    for (j=2; j<sides; j++)
                    {
                        this._mesh._indices[0].push(base);
                        this._mesh._indices[0].push(h);

                        h = base + j;
                        this._mesh._indices[0].push(h);
                    }
                }

                if (this._vf.bottom && radius > 0)
                {
                    base = this._mesh._positions[0].length / 3;

                    for (j=sides-1; j>=0; j--)
                    {
                        k = 6 * j;
                        x = this._mesh._positions[0][k  ];
                        y = this._mesh._positions[0][k+1];
                        z = this._mesh._positions[0][k+2];

                        this._mesh._positions[0].push(x, y, z);
                        this._mesh._texCoords[0].push(x / 2 + 0.5, z / 2 + 0.5);
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

                // calculate normals and adjust them at seam
                this._mesh.calcNormals(Math.PI, this._vf.ccw);

                var n0b = new x3dom.fields.SFVec3f(this._mesh._normals[0][0],
                                                   this._mesh._normals[0][1],
                                                   this._mesh._normals[0][2]);
                var n0t = new x3dom.fields.SFVec3f(this._mesh._normals[0][3],
                                                   this._mesh._normals[0][4],
                                                   this._mesh._normals[0][5]);
                k = 6 * sides;
                var n1b = new x3dom.fields.SFVec3f(this._mesh._normals[0][k  ],
                                                   this._mesh._normals[0][k+1],
                                                   this._mesh._normals[0][k+2]);
                var n1t = new x3dom.fields.SFVec3f(this._mesh._normals[0][k+3],
                                                   this._mesh._normals[0][k+4],
                                                   this._mesh._normals[0][k+5]);

                var nb = n0b.add(n1b).normalize();
                var nt = n0t.add(n1t).normalize();

                this._mesh._normals[0][0] = nb.x;
                this._mesh._normals[0][1] = nb.y;
                this._mesh._normals[0][2] = nb.z;
                this._mesh._normals[0][3] = nt.x;
                this._mesh._normals[0][4] = nt.y;
                this._mesh._normals[0][5] = nt.z;

                this._mesh._normals[0][k  ] = nb.x;
                this._mesh._normals[0][k+1] = nb.y;
                this._mesh._normals[0][k+2] = nb.z;
                this._mesh._normals[0][k+3] = nt.x;
                this._mesh._normals[0][k+4] = nt.y;
                this._mesh._normals[0][k+5] = nt.z;

                this.invalidateVolume();
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "xtshear" || fieldName == "ytshear" ||
                    fieldName == "xbshear" || fieldName == "ybshear" ||
                    fieldName == "radius" || fieldName == "height" ||
                    fieldName == "bottom" || fieldName == "top" || fieldName == "subdivision")
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

/* ### Nozzle ### */
x3dom.registerNodeType(
    "Nozzle",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Nozzle.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'nozzleHeight', 0.1);
            this.addField_SFFloat(ctx, 'nozzleRadius', 0.6);
            this.addField_SFFloat(ctx, 'height', 1.0);
            this.addField_SFFloat(ctx, 'outerRadius', 0.5);
            this.addField_SFFloat(ctx, 'innerRadius', 0.4);
            this.addField_SFFloat(ctx, 'subdivision', 32);

            this.rebuildGeometry();
        },
        {
            rebuildGeometry: function()
            {
                this._mesh._positions[0] = [];
                this._mesh._normals[0]   = [];
                this._mesh._texCoords[0] = [];
                this._mesh._indices[0]   = [];

                var twoPi = 2.0 * Math.PI;
                var sides = this._vf.subdivision;

                var height = this._vf.height;
                var center = height / 2;

                if (this._vf.innerRadius > this._vf.outerRadius)
                {
                    var tmp = this._vf.innerRadius;
                    this._vf.innerRadius = this._vf.outerRadius;
                    this._vf.outerRadius = tmp;
                }
                var innerRadius = this._vf.innerRadius;
                var outerRadius = this._vf.outerRadius;

                if (this._vf.nozzleRadius < outerRadius)
                {
                    this._vf.nozzleRadius = outerRadius;
                }
                var nozzleRadius = this._vf.nozzleRadius;

                if (this._vf.nozzleHeight > height)
                {
                    this._vf.nozzleHeight = height;
                }
                var nozzleHeight = this._vf.nozzleHeight;

                var beta, delta, x, z, k, j, nx, nz;
                delta = twoPi / sides;

                //Outer Stem Side
                for (j=0, k=0; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.sin(beta);
                    nz = -Math.cos(beta);

                    x = outerRadius * nx;
                    z = outerRadius * nz;

                    this._mesh._positions[0].push(x, -center, z);
                    this._mesh._normals[0].push(nx, 0, nz);

                    this._mesh._positions[0].push(x, (height-nozzleHeight)-center, z);
                    this._mesh._normals[0].push(nx, 0, nz);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k    );
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 3);

                        k += 2;
                    }
                }

                //Inner Stem Side
                for (j=0, k=k+2; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.sin(beta);
                    nz = -Math.cos(beta);

                    x = innerRadius * nx;
                    z = innerRadius * nz;

                    this._mesh._positions[0].push(x, -center, z);
                    this._mesh._normals[0].push(-nx, 0, -nz);

                    this._mesh._positions[0].push(x, (height-nozzleHeight)-center, z);
                    this._mesh._normals[0].push(-nx, 0, -nz);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k    );

                        this._mesh._indices[0].push(k + 3);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        k += 2;
                    }
                }

                //Stem Bottom Side
                for (j=0, k=k+2; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.sin(beta);
                    nz = -Math.cos(beta);

                    x = outerRadius * nx;
                    z = outerRadius * nz;

                    this._mesh._positions[0].push(x, -center, z);
                    this._mesh._normals[0].push(0, -1, 0);

                    x = innerRadius * nx;
                    z = innerRadius * nz;

                    this._mesh._positions[0].push(x, -center, z);
                    this._mesh._normals[0].push(0, -1, 0);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k    );

                        this._mesh._indices[0].push(k + 3);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        k += 2;
                    }
                }

                //Outer Nozzle Side
                for (j=0, k=k+2; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.sin(beta);
                    nz = -Math.cos(beta);

                    x = nozzleRadius * nx;
                    z = nozzleRadius * nz;

                    this._mesh._positions[0].push(x, (height-nozzleHeight)-center, z);
                    this._mesh._normals[0].push(nx, 0, nz);

                    this._mesh._positions[0].push(x, center, z);
                    this._mesh._normals[0].push(nx, 0, nz);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k    );
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 3);

                        k += 2;
                    }
                }

                //Inner Nozzle Side
                for (j=0, k=k+2; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.sin(beta);
                    nz = -Math.cos(beta);

                    x = innerRadius * nx;
                    z = innerRadius * nz;

                    this._mesh._positions[0].push(x, (height-nozzleHeight)-center, z);
                    this._mesh._normals[0].push(-nx, 0, -nz);

                    this._mesh._positions[0].push(x, center, z);
                    this._mesh._normals[0].push(-nx, 0, -nz);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k    );

                        this._mesh._indices[0].push(k + 3);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        k += 2;
                    }
                }

                //Nozzle Bottom Side
                for (j=0, k=k+2; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.sin(beta);
                    nz = -Math.cos(beta);

                    x = nozzleRadius * nx;
                    z = nozzleRadius * nz;

                    this._mesh._positions[0].push(x, (height-nozzleHeight)-center, z);
                    this._mesh._normals[0].push(0, -1, 0);

                    x = outerRadius * nx;
                    z = outerRadius * nz;

                    this._mesh._positions[0].push(x, (height-nozzleHeight)-center, z);
                    this._mesh._normals[0].push(0, -1, 0);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k    );

                        this._mesh._indices[0].push(k + 3);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        k += 2;
                    }
                }

                //Nozzle Top Side
                for (j=0, k=k+2; j<=sides; j++)
                {
                    beta = j * delta;
                    nx =  Math.sin(beta);
                    nz = -Math.cos(beta);

                    x = nozzleRadius * nx;
                    z = nozzleRadius * nz;

                    this._mesh._positions[0].push(x, center, z);
                    this._mesh._normals[0].push(0, 1, 0);

                    x = innerRadius * nx;
                    z = innerRadius * nz;

                    this._mesh._positions[0].push(x, center, z);
                    this._mesh._normals[0].push(0, 1, 0);

                    if (j > 0)
                    {
                        this._mesh._indices[0].push(k    );
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 2);

                        this._mesh._indices[0].push(k + 2);
                        this._mesh._indices[0].push(k + 1);
                        this._mesh._indices[0].push(k + 3);

                        k += 2;
                    }
                }

                this.invalidateVolume();
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
            },

            fieldChanged: function(fieldName) 
			{
                if (fieldName == "nozzleHeight" || fieldName == "nozzleRadius" || fieldName == "height" ||
                    fieldName == "outerRadius" || fieldName == "innerRadius" || fieldName == "subdivision")
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

/* ### SolidOfRevolution ### */
x3dom.registerNodeType(
    "SolidOfRevolution",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.SolidOfRevolution.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'creaseAngle', 0);
            this.addField_MFVec2f(ctx, 'crossSection', []);
            this.addField_SFFloat(ctx, 'angle', 2*Math.PI);
            this.addField_SFBool(ctx, 'caps', true);
            this.addField_SFFloat(ctx, 'subdivision', 32);

            this._origCCW = this._vf.ccw;

            this.rebuildGeometry();
        },
        {
            rebuildGeometry: function()
            {
                this._mesh._positions[0] = [];
                this._mesh._normals[0]   = [];
                this._mesh._texCoords[0] = [];
                this._mesh._indices[0]   = [];

                // assure that angle in [-2.Pi, 2.PI]
                var twoPi = 2.0 * Math.PI;
                if (this._vf.angle < -twoPi)
                    this._vf.angle = -twoPi;
                else if (this._vf.angle > twoPi)
                    this._vf.angle = twoPi;

                var crossSection = this._vf.crossSection, angle = this._vf.angle, steps = this._vf.subdivision;
                var i, j, k, l, m, n = crossSection.length;

                if (n < 1) {
                    x3dom.debug.logWarning("SolidOfRevolution requires crossSection curve.");
                    return;
                }

                var loop = (n > 2) ? crossSection[0].equals(crossSection[n-1], x3dom.fields.Eps) : false;
                var fullRevolution = (twoPi - Math.abs(angle) <= x3dom.fields.Eps);

                var alpha, delta = angle / steps;
                var positions = [], baseCurve = [];

                // fix wrong face orientation in case of clockwise rotation
                this._vf.ccw = (angle < 0) ? this._origCCW : !this._origCCW;

                // check if side caps are required
                if (!loop)
                {
                    if (Math.abs(crossSection[n-1].y) > x3dom.fields.Eps) {
                        crossSection.push(new x3dom.fields.SFVec2f(crossSection[n-1].x, 0));
                    }
                    if (Math.abs(crossSection[0].y) > x3dom.fields.Eps) {
                        crossSection.unshift(new x3dom.fields.SFVec2f(crossSection[0].x, 0));
                    }
                    n = crossSection.length;
                }

                // check curvature, starting from 2nd segment, and adjust base curve
                var pos = null, lastPos = null, penultimatePos = null;
                var duplicate = [];    // to be able to sort out duplicates for caps

                for (j=0; j<n; j++)
                {
                    if (pos) {
                        if (lastPos) {
                            penultimatePos = lastPos;
                        }
                        lastPos = pos;
                    }

                    pos = new x3dom.fields.SFVec3f(crossSection[j].x, 0, crossSection[j].y);

                    if (j >= 2)
                    {
                        alpha = pos.subtract(lastPos).normalize();
                        alpha = alpha.dot(lastPos.subtract(penultimatePos).normalize());
                        alpha = Math.abs(Math.cos(alpha));

                        if (alpha > this._vf.creaseAngle)
                        {
                            baseCurve.push(x3dom.fields.SFVec3f.copy(lastPos));
                            duplicate.push(true);
                        }
                        // TODO; handle case that curve is loop and angle smaller creaseAngle
                    }

                    baseCurve.push(pos);
                    duplicate.push(false);
                }

                n = baseCurve.length;

                // generate body of revolution (with rotation around x-axis)
                for (i=0, alpha=0; i<=steps; i++, alpha+=delta)
                {
                    var mat = x3dom.fields.SFMatrix4f.rotationX(alpha);

                    for (j=0; j<n; j++)
                    {
                        pos = mat.multMatrixPnt(baseCurve[j]);
                        positions.push(pos);

                        this._mesh._positions[0].push(pos.x, pos.y, pos.z);

                        if (i > 0 && j > 0)
                        {
                            this._mesh._indices[0].push((i-1)*n+(j-1), (i-1)*n+ j   ,  i   *n+ j   );
                            this._mesh._indices[0].push( i   *n+ j   ,  i   *n+(j-1), (i-1)*n+(j-1));
                        }
                    }
                }

                if (!fullRevolution && this._vf.caps == true)
                {
                    // add first cap
                    var linklist = new x3dom.DoublyLinkedList();
                    m = this._mesh._positions[0].length / 3;

                    for (j=0, i=0; j<n; j++)
                    {
                        if (!duplicate[j])
                        {
                            // Tessellation leads to errors with duplicated vertices if polygon not convex
                            linklist.appendNode(new x3dom.DoublyLinkedList.ListNode(positions[j], i++));

                            pos = positions[j];
                            this._mesh._positions[0].push(pos.x, pos.y, pos.z);
                        }
                    }

                    var linklist_indices = x3dom.EarClipping.getIndexes(linklist);

                    for (j=linklist_indices.length-1; j>=0; j--)
                    {
                        this._mesh._indices[0].push(m + linklist_indices[j]);
                    }

                    // second cap
                    m = this._mesh._positions[0].length / 3;

                    for (j=0; j<n; j++)
                    {
                        if (!duplicate[j])
                        {
                            pos = positions[n * steps + j];
                            this._mesh._positions[0].push(pos.x, pos.y, pos.z);
                        }
                    }

                    for (j=0; j<linklist_indices.length; j++)
                    {
                        this._mesh._indices[0].push(m + linklist_indices[j]);
                    }
                }

                // calculate and readjust normals if full revolution
                this._mesh.calcNormals(Math.PI, this._vf.ccw);

                if (fullRevolution)
                {
                    m = 3 * n * steps;

                    for (j=0; j<n; j++)
                    {
                        k = 3 * j;
                        this._mesh._normals[0][m+k  ] = this._mesh._normals[0][k  ];
                        this._mesh._normals[0][m+k+1] = this._mesh._normals[0][k+1];
                        this._mesh._normals[0][m+k+2] = this._mesh._normals[0][k+2];
                    }
                }

                this._mesh.calcTexCoords("");

                this.invalidateVolume();
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "crossSection" || fieldName == "angle" || fieldName == "caps" ||
                    fieldName == "subdivision" || fieldName == "creaseAngle")
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


/* ### SphereSegment ### */
x3dom.registerNodeType(
    "SphereSegment",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.SphereSegment.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'radius', 1);
            this.addField_MFFloat(ctx, 'longitude', []);
            this.addField_MFFloat(ctx, 'latitude', []);
            this.addField_SFVec2f(ctx, 'stepSize', 1, 1);

            var r = this._vf.radius;
            var longs = this._vf.longitude;
            var lats = this._vf.latitude;

            var subx = longs.length, suby = lats.length;
            var first, second;

            var latNumber, longNumber;
            var latitudeBands = suby;
            var longitudeBands = subx;

            var theta, sinTheta, cosTheta;
            var phi, sinPhi, cosPhi;
            var x, y, z, u, v;

            for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
                theta = ((lats[latNumber]+90) * Math.PI) / 180;
                sinTheta = Math.sin(theta);
                cosTheta = Math.cos(theta);

                for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                    phi = ((longs[longNumber]) * Math.PI) / 180;

                    sinPhi = Math.sin(phi);
                    cosPhi = Math.cos(phi);

                    x = -cosPhi * sinTheta;
                    y = -cosTheta;
                    z = -sinPhi * sinTheta;

                    u = longNumber / (longitudeBands-1);
                    v = latNumber / (latitudeBands-1);

                    this._mesh._positions[0].push(r * x, r * y, r * z);
                    this._mesh._normals[0].push(x, y, z);
                    this._mesh._texCoords[0].push(u, v);
                }
            }

            for (latNumber = 0; latNumber < latitudeBands; latNumber++) {
                for (longNumber = 0; longNumber < longitudeBands; longNumber++) {
                    first = (latNumber * (longitudeBands + 1)) + longNumber;
                    second = first + longitudeBands + 1;

                    this._mesh._indices[0].push(first);
                    this._mesh._indices[0].push(second);
                    this._mesh._indices[0].push(first + 1);

                    this._mesh._indices[0].push(second);
                    this._mesh._indices[0].push(second + 1);
                    this._mesh._indices[0].push(first + 1);
                }
            }

            this._mesh._invalidate = true;
            this._mesh._numFaces = this._mesh._indices[0].length / 3;
            this._mesh._numCoords = this._mesh._positions[0].length / 3;
        }
    )
);

/* ### ElevationGrid ### */
x3dom.registerNodeType(
    "ElevationGrid",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.ElevationGrid.superClass.call(this, ctx);

            this.addField_SFBool(ctx, 'colorPerVertex', true);
            this.addField_SFBool(ctx, 'normalPerVertex', true);
            this.addField_SFFloat(ctx, 'creaseAngle', 0);

            this.addField_MFNode('attrib', x3dom.nodeTypes.X3DVertexAttributeNode);
            this.addField_SFNode('normal', x3dom.nodeTypes.Normal);
            this.addField_SFNode('color', x3dom.nodeTypes.X3DColorNode);
            this.addField_SFNode('texCoord', x3dom.nodeTypes.X3DTextureCoordinateNode);

            this.addField_MFFloat(ctx, 'height', []);
            this.addField_SFInt32(ctx, 'xDimension', 0);
            this.addField_SFFloat(ctx, 'xSpacing', 1.0);
            this.addField_SFInt32(ctx, 'zDimension', 0);
            this.addField_SFFloat(ctx, 'zSpacing', 1.0);
        },
        {
            nodeChanged: function()
            {
                this._mesh._indices[0] = [];
                this._mesh._positions[0] = [];
                this._mesh._normals[0] = [];
                this._mesh._texCoords[0] = [];
                this._mesh._colors[0] = [];

                var x = 0, y = 0;
                var subx = this._vf.xDimension-1;
                var suby = this._vf.zDimension-1;

                var h = this._vf.height;

                x3dom.debug.assert((h.length === this._vf.xDimension*this._vf.zDimension));

                var normals = null, texCoords = null, colors = null;

                if (this._cf.normal.node) {
                    normals = this._cf.normal.node._vf.vector;
                }

                var numTexComponents = 2;

                var texCoordNode = this._cf.texCoord.node;
                if (x3dom.isa(texCoordNode, x3dom.nodeTypes.MultiTextureCoordinate)) {
                    if (texCoordNode._cf.texCoord.nodes.length)
                        texCoordNode = texCoordNode._cf.texCoord.nodes[0];
                }

                if (texCoordNode) {
                    if (texCoordNode._vf.point) {
                        texCoords = texCoordNode._vf.point;
                        if (x3dom.isa(texCoordNode, x3dom.nodeTypes.TextureCoordinate3D)) {
                            numTexComponents = 3;
                        }
                    }
                }

                var numColComponents = 3;
                if (this._cf.color.node) {
                    colors = this._cf.color.node._vf.color;
                    if (x3dom.isa(this._cf.color.node, x3dom.nodeTypes.ColorRGBA)) {
                        numColComponents = 4;
                    }
                }

                var c = 0;

                for (y = 0; y <= suby; y++)
                {
                    for (x = 0; x <= subx; x++)
                    {
                        this._mesh._positions[0].push(x * this._vf.xSpacing);
                        this._mesh._positions[0].push(h[c]);
                        this._mesh._positions[0].push(y * this._vf.zSpacing);

                        if (normals) {
                            this._mesh._normals[0].push(normals[c].x);
                            this._mesh._normals[0].push(normals[c].y);
                            this._mesh._normals[0].push(normals[c].z);
                        }

                        if (texCoords) {
                            this._mesh._texCoords[0].push(texCoords[c].x);
                            this._mesh._texCoords[0].push(texCoords[c].y);
                            if (numTexComponents === 3) {
                                this._mesh._texCoords[0].push(texCoords[c].z);
                            }
                        }
                        else {
                            this._mesh._texCoords[0].push(x / subx);
                            this._mesh._texCoords[0].push(y / suby);
                        }

                        if (colors) {
                            this._mesh._colors[0].push(colors[c].r);
                            this._mesh._colors[0].push(colors[c].g);
                            this._mesh._colors[0].push(colors[c].b);
                            if (numColComponents === 4) {
                                this._mesh._colors[0].push(colors[c].a);
                            }
                        }

                        c++;
                    }
                }

                for (y = 1; y <= suby; y++) {
                    for (x = 0; x < subx; x++) {
                        this._mesh._indices[0].push((y - 1) * (subx + 1) + x);
                        this._mesh._indices[0].push(y * (subx + 1) + x);
                        this._mesh._indices[0].push((y - 1) * (subx + 1) + x + 1);

                        this._mesh._indices[0].push(y * (subx + 1) + x);
                        this._mesh._indices[0].push(y * (subx + 1) + x + 1);
                        this._mesh._indices[0].push((y - 1) * (subx + 1) + x + 1);
                    }
                }

                // TODO; handle at least per quad normals
                //       (corresponds to creaseAngle = 0)
                //this._mesh.calcNormals(this._vf.creaseAngle, this._vf.ccw);
                if (!normals)
                    this._mesh.calcNormals(Math.PI, this._vf.ccw);

                this.invalidateVolume();
                this._mesh._numTexComponents = numTexComponents;
                this._mesh._numColComponents = numColComponents;
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
            },

            fieldChanged: function(fieldName)
            {
                var normals = null;

                if (this._cf.normal.node) {
                    normals = this._cf.normal.node._vf.vector;
                }

                if (fieldName == "height")
                {
                    var i, n = this._mesh._positions[0].length / 3;
                    var h = this._vf.height;

                    for (i=0; i<n; i++) {
                        this._mesh._positions[0][3*i+1] = h[i];
                    }

                    if (!normals) {
                        this._mesh._normals[0] = [];
                        this._mesh.calcNormals(Math.PI, this._vf.ccw);
                    }

                    this.invalidateVolume();

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        if (!normals)
                            node._dirty.normals = true;
                        node.invalidateVolume();
                    });
                }
                // TODO: handle other cases!
            }
        }
    )
);

/* ### Extrusion ### */
x3dom.registerNodeType(
    "Extrusion",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Extrusion.superClass.call(this, ctx);

            this.addField_SFBool(ctx, 'beginCap', true);
            this.addField_SFBool(ctx, 'endCap', true);
            this.addField_SFBool(ctx, 'convex', true);
            this.addField_SFFloat(ctx, 'creaseAngle', 0);
            this.addField_MFVec2f(ctx, 'crossSection', []);   //1, 1, 1, -1, -1, -1, -1, 1, 1, 1
            this.addField_MFRotation(ctx, 'orientation', []); //0, 0, 1, 0
            this.addField_MFVec2f(ctx, 'scale', []); //1, 1
            this.addField_MFVec3f(ctx, 'spine', []); //0, 0, 0, 0, 1, 0
            this.addField_SFFloat(ctx, 'height', 0); // convenience field for setting default spine

            // http://www.web3d.org/files/specifications/19775-1/V3.3/Part01/components/geometry3D.html#Extrusion
            // http://accad.osu.edu/~pgerstma/class/vnv/resources/info/AnnotatedVrmlRef/ch3-318.htm
            this.rebuildGeometry();
        },
        {
            rebuildGeometry: function()
            {
                this._mesh._positions[0] = [];
                this._mesh._normals[0]   = [];
                this._mesh._texCoords[0] = [];
                this._mesh._indices[0]   = [];

                var i, j, n, m, len, sx = 1, sy = 1;
                var spine = this._vf.spine,
                    scale = this._vf.scale,
                    orientation = this._vf.orientation,
                    crossSection = this._vf.crossSection;
                var positions = [], index = 0;
                var cleanSpine = false;

                m = spine.length;
                n = crossSection.length;

                if (m == 0 && this._vf.height > 0) {
                    spine[0] = new x3dom.fields.SFVec3f(0, 0, 0);
                    spine[1] = new x3dom.fields.SFVec3f(0, this._vf.height, 0);
                    m = 2;
                    cleanSpine = true;
                }

                var x, y, z, last_z;
                var spineClosed = (m > 2) ? spine[0].equals(spine[spine.length-1], x3dom.fields.Eps) : false;

                for (i=0; i<m; i++) {
                    if ((len = scale.length) > 0) {
                        if (i < len) {
                            sx = scale[i].x;
                            sy = scale[i].y;
                        }
                        else {
                            sx = scale[len-1].x;
                            sy = scale[len-1].y;
                        }
                    }

                    for (j=0; j<n; j++) {
                        var pos = new x3dom.fields.SFVec3f(
                            crossSection[j].x * sx + spine[i].x,
                            spine[i].y,
                            crossSection[j].y * sy + spine[i].z);

                        if (m > 2 && orientation.length == m) {
                            if (i == 0) {
                                if (spineClosed) {
                                    y = spine[1].subtract(spine[m-2]).normalize();
                                    z = spine[1].subtract(spine[0]).normalize().cross(spine[m-2].subtract(spine[0]).normalize());
                                }
                                else {
                                    y = spine[1].subtract(spine[0]).normalize();
                                    z = spine[2].subtract(spine[1]).normalize().cross(spine[0].subtract(spine[1]).normalize());
                                }
                                last_z = x3dom.fields.SFVec3f.copy(z);
                            }
                            else if (i == m-1) {
                                if (spineClosed) {
                                    y = spine[1].subtract(spine[m-2]).normalize();
                                    z = spine[1].subtract(spine[0]).normalize().cross(spine[m-2].subtract(spine[0]).normalize());
                                }
                                else {
                                    y = spine[m-1].subtract(spine[m-2]).normalize();
                                    z = x3dom.fields.SFVec3f.copy(last_z);
                                }
                            }
                            else {
                                y = spine[i+1].subtract(spine[i]).normalize();
                                z = y.cross(spine[i-1].subtract(spine[i]).normalize());
                            }
                            if (z.dot(last_z) < 0) {
                                z = z.negate();
                            }
                            if (i != 0) {
                                last_z = x3dom.fields.SFVec3f.copy(z);
                            }
                            x = y.cross(z);

                            var baseMat = x3dom.fields.SFMatrix4f.identity();
                            baseMat.setValue(x, y, z);
                            var rotMat = orientation[i].toMatrix();

                            pos = pos.subtract(spine[i]);
                            pos = baseMat.multMatrixPnt(rotMat.multMatrixPnt(pos));
                            pos = pos.add(spine[i]);
                        }

                        positions.push(pos);

                        if (this._vf.creaseAngle <= x3dom.fields.Eps) {
                            if (i > 0 && j > 0) {
                                var iPos = (i-1)*n+(j-1);
                                this._mesh._positions[0].push(positions[iPos].x, positions[iPos].y, positions[iPos].z);
                                iPos = (i-1)*n+j;
                                this._mesh._positions[0].push(positions[iPos].x, positions[iPos].y, positions[iPos].z);
                                iPos = i*n+j;
                                this._mesh._positions[0].push(positions[iPos].x, positions[iPos].y, positions[iPos].z);

                                this._mesh._indices[0].push(index++, index++, index++);

                                this._mesh._positions[0].push(positions[iPos].x, positions[iPos].y, positions[iPos].z);
                                iPos = i*n+(j-1);
                                this._mesh._positions[0].push(positions[iPos].x, positions[iPos].y, positions[iPos].z);
                                iPos = (i-1)*n+(j-1);
                                this._mesh._positions[0].push(positions[iPos].x, positions[iPos].y, positions[iPos].z);

                                this._mesh._indices[0].push(index++, index++, index++);
                            }
                        }
                        else {
                            this._mesh._positions[0].push(pos.x, pos.y, pos.z);

                            if (i > 0 && j > 0) {
                                this._mesh._indices[0].push((i-1)*n+(j-1), (i-1)*n+ j   ,  i   *n+ j   );
                                this._mesh._indices[0].push( i   *n+ j   ,  i   *n+(j-1), (i-1)*n+(j-1));
                            }
                        }
                    }

                    if (i == m-1) {
                        var p0, l, startPos;
                        var linklist, linklist_indices;

                        // add bottom (1st cross-section)
                        if (this._vf.beginCap) {
                            linklist = new x3dom.DoublyLinkedList();
                            l = this._mesh._positions[0].length / 3;

                            for (j=0; j<n; j++) {
                                linklist.appendNode(new x3dom.DoublyLinkedList.ListNode(positions[j], j));

                                if (this._vf.creaseAngle > x3dom.fields.Eps) {
                                    p0 = positions[j];
                                    this._mesh._positions[0].push(p0.x, p0.y, p0.z);
                                }
                            }

                            linklist_indices = x3dom.EarClipping.getIndexes(linklist);

                            for (j=linklist_indices.length-1; j>=0; j--) {
                                if (this._vf.creaseAngle > x3dom.fields.Eps) {
                                    this._mesh._indices[0].push(l + linklist_indices[j]);
                                }
                                else {
                                    p0 = positions[linklist_indices[j]];
                                    this._mesh._positions[0].push(p0.x, p0.y, p0.z);
                                    this._mesh._indices[0].push(index++);
                                }
                            }
                        }

                        // add top (last cross-section)
                        if (this._vf.endCap) {
                            linklist = new x3dom.DoublyLinkedList();
                            startPos = (m - 1) * n;
                            l = this._mesh._positions[0].length / 3;

                            for (j=0; j<n; j++) {
                                linklist.appendNode(new x3dom.DoublyLinkedList.ListNode(positions[startPos+j], startPos+j));

                                if (this._vf.creaseAngle > x3dom.fields.Eps) {
                                    p0 = positions[startPos+j];
                                    this._mesh._positions[0].push(p0.x, p0.y, p0.z);
                                }
                            }

                            linklist_indices = x3dom.EarClipping.getIndexes(linklist);

                            for (j=0; j<linklist_indices.length; j++) {
                                if (this._vf.creaseAngle > x3dom.fields.Eps) {
                                    this._mesh._indices[0].push(l + (linklist_indices[j] - startPos));
                                }
                                else {
                                    p0 = positions[linklist_indices[j]];
                                    this._mesh._positions[0].push(p0.x, p0.y, p0.z);
                                    this._mesh._indices[0].push(index++);
                                }
                            }
                        }
                    }
                }

                if (cleanSpine) {
                    this._vf.spine = new x3dom.fields.MFVec3f();
                }

                this._mesh.calcNormals(this._vf.creaseAngle, this._vf.ccw);
                this._mesh.calcTexCoords("");

                this.invalidateVolume();
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName == "beginCap" || fieldName == "endCap" ||
                    fieldName == "crossSection" || fieldName == "orientation" ||
                    fieldName == "scale" || fieldName == "spine" ||
                    fieldName == "height" || fieldName == "creaseAngle")
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

