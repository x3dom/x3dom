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
            x3dom.nodeTypes.Cone.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'Dbottom', 1.0);
            this.addField_SFFloat(ctx, 'Dtop', 0.4);
            this.addField_SFFloat(ctx, 'height', 1.0);
            this.addField_SFFloat(ctx, 'XOff', 0.25);
            this.addField_SFFloat(ctx, 'YOff', 0.25);
            this.addField_SFFloat(ctx, 'subdivision', 32);

            var geoCacheID = 'Snout_' + this._vf.bottomRadius + '_' + this._vf.height + '_' +
                             this._vf.bottom + '_' + this._vf.side + '_' + this._vf.topRadius;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using Cone from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else {
                var bottomRadius = this._vf.Dbottom, height = this._vf.height;
                var topRadius = this._vf.Dtop, sides = this._vf.subdivision;

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
                            px = x * topRadius + this._vf.XOff;
                            pz = z * topRadius + this._vf.YOff;
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

                        this._mesh._positions[0].push(x + this._vf.XOff, height / 2, z + this._vf.YOff);
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
                if (fieldName === "Dtop" || fieldName === "Dbottom" ||
                    fieldName === "height" || fieldName === "subdivision" ||
                    fieldName === "XOff" || fieldName === "YOff")
                {
                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] = [];
                    this._mesh._normals[0] = [];
                    this._mesh._texCoords[0] = [];

                    var bottomRadius = this._vf.Dbottom, height = this._vf.height;
                    var topRadius = this._vf.Dtop, sides = this._vf.subdivision;

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
                                px = x * topRadius + this._vf.XOff;
                                pz = z * topRadius + this._vf.YOff;
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
                            x =  topRadius * Math.sin(beta) + this._vf.XOff;
                            z = -topRadius * Math.cos(beta) + this._vf.YOff;

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

            this.addField_SFFloat(ctx, 'diameter', 1); 	//Diameter of base
            this.addField_SFFloat(ctx, 'height', 1);	//Maximum height of dished surface above base
            this.addField_SFFloat(ctx, 'radius', 1);	//If radius is zero, dish is drawn as section of sphere.
            this.addField_SFVec2f(ctx, 'subdivision', 24, 24);

            var geoCacheID = 'Dish_'+ this._vf.radius;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using Dish from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else {
                var latNumber, longNumber;
                var latitudeBands = this._vf.subdivision.x;
                var longitudeBands = this._vf.subdivision.y;

                var theta, sinTheta, cosTheta;
                var phi, sinPhi, cosPhi;
                var x, y, z, u, v;
                
                // Creation of the vertices
                for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
                    theta = (latNumber * (Math.PI / 2)) / latitudeBands;
                    sinTheta = Math.sin(theta);
                    cosTheta = Math.cos(theta);

                    for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                        phi = (longNumber * 2.0 * Math.PI) / longitudeBands;
                        sinPhi = Math.sin(phi);
                        cosPhi = Math.cos(phi);

                        x = -cosPhi * sinTheta;
                        y = cosTheta;
                        z = -sinPhi * sinTheta;

                        u = 0.25 - (longNumber / longitudeBands);
                        v = latNumber / latitudeBands;

                        this._mesh._positions[0].push(this._vf.radius * x);
                        this._mesh._positions[0].push(this._vf.radius * this._vf.height * y);
                        this._mesh._positions[0].push(this._vf.radius * z);
                        this._mesh._normals[0].push(x);
                        this._mesh._normals[0].push(y);
                        this._mesh._normals[0].push(z);
                        this._mesh._texCoords[0].push(u);
                        this._mesh._texCoords[0].push(v);
                    }
                }

                // Creation of the faces of the sphere
                var first, second;
                for (latNumber = 0; latNumber < latitudeBands; latNumber++) {
                    for (longNumber = 0; longNumber < longitudeBands; longNumber++) {
                        first = (latNumber * (longitudeBands + 1)) + longNumber;
                        second = first + longitudeBands + 1;

                        this._mesh._indices[0].push(first + 1);
                        this._mesh._indices[0].push(second);
                        this._mesh._indices[0].push(first);

                        this._mesh._indices[0].push(first + 1);
                        this._mesh._indices[0].push(second + 1);
                        this._mesh._indices[0].push(second);
                    }
                }
                
                // Creation of the faces of the bottom
                var end = Math.floor(this._mesh._positions[0].length / 3) - 1;
                for (var i = this._vf.subdivision.y; i > 0; i--){
                    this._mesh._indices[0].push(end - (i + 1));
                    this._mesh._indices[0].push(end - i);
                    this._mesh._indices[0].push(end);
                }
                 
                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        },
        {
            fieldChanged: function(fieldName) {
                 if (fieldName === "radius" || fieldName === "height") {
                    this._mesh._positions[0] = [];

                    var latNumber, longNumber;
                    var latitudeBands = this._vf.subdivision.x;
                    var longitudeBands = this._vf.subdivision.y;

                    var theta, sinTheta, cosTheta;
                    var phi, sinPhi, cosPhi;
                    var x, y, z;

                    for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
                        theta = (latNumber * (Math.PI / 2)) / latitudeBands;
                        sinTheta = Math.sin(theta);
                        cosTheta = Math.cos(theta);

                        for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
                            phi = (longNumber * 2.0 * Math.PI) / longitudeBands;
                            sinPhi = Math.sin(phi);
                            cosPhi = Math.cos(phi);

                            x = -cosPhi * sinTheta;
                            y = cosTheta;
                            z = -sinPhi * sinTheta;

                            this._mesh._positions[0].push(this._vf.radius * x);
                            this._mesh._positions[0].push(this._vf.radius * this._vf.height * y);
                            this._mesh._positions[0].push(this._vf.radius * z);
                        }
                    }

                    this._mesh._invalidate = true;
                    this._mesh._numCoords = this._mesh._positions[0].length / 3;
				
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                    });
                } else if (fieldName === "subdivision") {
                    
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
			
			this.addField_SFFloat(ctx, 'xbottom', 0);	//Dimension of bottom parallel to X-axis
			this.addField_SFFloat(ctx, 'ybottom', 0);	//Dimension of bottom parallel to Y-axis
			this.addField_SFFloat(ctx, 'xtop', 0);		//Dimension of top parallel to X-axis
			this.addField_SFFloat(ctx, 'ytop', 0);		//Dimension of top parallel to Y-axis
			this.addField_SFFloat(ctx, 'height', 0);	//Height between top and bottom surface
			this.addField_SFFloat(ctx, 'xoff', 0);		//Displacement of axes along X-axis
			this.addField_SFFloat(ctx, 'yoff', 0);		//Displacement of axes along Y-axis
			
			var geoCacheID = 'Pyramid...';

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
            nodeChanged: function() {},
            fieldChanged: function(fieldName) 
			{
			
        	}
		}
    )
);

/* ### Rectangular Torus ### */
x3dom.registerNodeType(
    "RectangularTorus",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.RectangularTorus.superClass.call(this, ctx);
			
			this.addField_SFFloat(ctx, 'rinside', 0); 	//Inside radius
			this.addField_SFFloat(ctx, 'routside', 0);	//Outside radius	
			this.addField_SFFloat(ctx, 'height', 0);	//Height of rectangular section
			this.addField_SFFloat(ctx, 'angle', 0);		//Subtended angle (max. 180 degrees)
			
			var geoCacheID = 'RectangularTorus...';

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
            nodeChanged: function() {},
            fieldChanged: function(fieldName) 
			{
			
        	}
		}
    )
);

/* ### Slope-Bottom Cylinder ### */
x3dom.registerNodeType(
    "SlopeBottomCylinder",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.SlopeBottomCylinder.superClass.call(this, ctx);
			
			this.addField_SFFloat(ctx, 'diameter', 0);	//Diameter
			this.addField_SFFloat(ctx, 'height', 0);	//Height along axis, between P1 and P2
			this.addField_SFFloat(ctx, 'xtshear', 0);	//Inclination of top face to X-axis
			this.addField_SFFloat(ctx, 'ytshear', 0);	//Inclination of top face to Y-axis
			this.addField_SFFloat(ctx, 'xbshear', 0);	//Inclination of bottom face to X-axis
			this.addField_SFFloat(ctx, 'ybshear', 0);	//Inclination of bottom face to Y-axis
			
			var geoCacheID = 'SlopeBottomCylinder...';

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
            nodeChanged: function() {},
            fieldChanged: function(fieldName) 
			{
			
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
            nodeChanged: function() {},
            fieldChanged: function(fieldName) 
			{
			
        	}
		}
    )
);