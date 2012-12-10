/*
 * X3DOM JavaScript Library
 * http://x3dom.org
 *
 * (C)2009 Fraunhofer Insitute for Computer
 *         Graphics Reseach, Darmstadt
 * Dual licensed under the MIT and GPL.
 *
 * Based on code originally provided by
 * Philip Taylor: http://philip.html5.org
 */

/* ### Plane ### */
x3dom.registerNodeType(
    "Plane",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Plane.superClass.call(this, ctx);

            this.addField_SFVec2f(ctx, 'size', 2, 2);
            this.addField_SFVec2f(ctx, 'subdivision', 1, 1);
            this.addField_SFVec3f(ctx, 'center', 0, 0, 0);

            var sx = this._vf.size.x, sy = this._vf.size.y;
            var subx = this._vf.subdivision.x, suby = this._vf.subdivision.y;
			
			var geoCacheID = 'Plane_'+sx+'-'+sy+'-'+subx+'-'+suby+'-'+this._vf.center.x+'-'+this._vf.center.y+'-'+this._vf.center.z;

            // Attention: DynamicLOD node internally creates Plane nodes, but MUST NOT 
            //            use geoCache, therefore only use cache if "ctx" is defined!
            // TODO: move mesh generation of all primitives to nodeChanged()
			if( ctx && this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined )
			{
				//x3dom.debug.logInfo("Using Plane from Cache");
				this._mesh = x3dom.geoCache[geoCacheID];
			}
			else
			{
                var x = 0, y = 0;
                var xstep = sx / subx;
                var ystep = sy / suby;

                sx /= 2; sy /= 2;

                for (y = 0; y <= suby; y++) {
                    for (x = 0; x <= subx; x++) {
                        this._mesh._positions[0].push(this._vf.center.x + x * xstep - sx);
						this._mesh._positions[0].push(this._vf.center.y + y * ystep - sy);
						this._mesh._positions[0].push(this._vf.center.z);
						this._mesh._normals[0].push(0);
						this._mesh._normals[0].push(0);
						this._mesh._normals[0].push(1);
						this._mesh._texCoords[0].push(x / subx);
						this._mesh._texCoords[0].push(y / suby);
                    }
                }

                for (y = 1; y <= suby; y++) {
                    for (x = 0; x < subx; x++) {
                        this._mesh._indices[0].push((y - 1) * (subx + 1) + x);
                        this._mesh._indices[0].push((y - 1) * (subx + 1) + x + 1);
                        this._mesh._indices[0].push(y * (subx + 1) + x);

                        this._mesh._indices[0].push(y * (subx + 1) + x);
                        this._mesh._indices[0].push((y - 1) * (subx + 1) + x + 1);
                        this._mesh._indices[0].push(y * (subx + 1) + x + 1);
                    }
                }
                
				this._mesh._invalidate = true;
				this._mesh._numFaces = this._mesh._indices[0].length / 3;
				this._mesh._numCoords = this._mesh._positions[0].length / 3;

				x3dom.geoCache[geoCacheID] = this._mesh;
			}
         },
         {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {
				
				if(fieldName === "size") {
					this._mesh._positions[0] = [];
						
					var sx = this._vf.size.x, sy = this._vf.size.y;
					var subx = this._vf.subdivision.x, suby = this._vf.subdivision.y;
					var x = 0, y = 0;
					var xstep = sx / subx;
					var ystep = sy / suby;
	
					sx /= 2; sy /= 2;
	
					for (y = 0; y <= suby; y++) {
						for (x = 0; x <= subx; x++) {
							this._mesh._positions[0].push(this._vf.center.x + x * xstep - sx);
							this._mesh._positions[0].push(this._vf.center.y + y * ystep - sy);
							this._mesh._positions[0].push(this._vf.center.z);							
						}
					}
		
					this._mesh._invalidate = true;
					this._mesh._numCoords = this._mesh._positions[0].length / 3;
						   
					Array.forEach(this._parentNodes, function (node) {
						node._dirty.positions = true;
					});
				} else if (fieldName === "subdivision") {
					this._mesh._positions[0] = [];
					this._mesh._indices[0] =[];
					this._mesh._normals[0] = [];
					this._mesh._texCoords[0] =[];
						
					var sx = this._vf.size.x, sy = this._vf.size.y;
					var subx = this._vf.subdivision.x, suby = this._vf.subdivision.y;
					
					var x = 0, y = 0;
					var xstep = sx / subx;
					var ystep = sy / suby;
	
					sx /= 2; sy /= 2;
	
					for (y = 0; y <= suby; y++) {
						for (x = 0; x <= subx; x++) {
							this._mesh._positions[0].push(this._vf.center.x + x * xstep - sx);
							this._mesh._positions[0].push(this._vf.center.y + y * ystep - sy);
							this._mesh._positions[0].push(this._vf.center.z);
							this._mesh._normals[0].push(0);
							this._mesh._normals[0].push(0);
							this._mesh._normals[0].push(1);
							this._mesh._texCoords[0].push(x / subx);
							this._mesh._texCoords[0].push(y / suby);
						}
					}
	
					for (y = 1; y <= suby; y++) {
						for (x = 0; x < subx; x++) {
							this._mesh._indices[0].push((y - 1) * (subx + 1) + x);
							this._mesh._indices[0].push((y - 1) * (subx + 1) + x + 1);
							this._mesh._indices[0].push(y * (subx + 1) + x);
	
							this._mesh._indices[0].push(y * (subx + 1) + x);
							this._mesh._indices[0].push((y - 1) * (subx + 1) + x + 1);
							this._mesh._indices[0].push(y * (subx + 1) + x + 1);
						}
					}
					
					this._mesh._invalidate = true;
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
                //this._mesh.calcNormals(this._vf.creaseAngle);
                if (!normals)
                    this._mesh.calcNormals(Math.PI);

				this._mesh._invalidate = true;
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
                        this._mesh.calcNormals(Math.PI);
                    }

                    this._mesh._invalidate = true;

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        if (!normals)
                            node._dirty.normals = true;
                    });
                }
                // TODO: handle other cases!
            }
        }
    )
);

/* ### Box ### */
x3dom.registerNodeType(
    "Box",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Box.superClass.call(this, ctx);

            this.addField_SFVec3f(ctx, 'size', 2, 2, 2);

            var sx = this._vf.size.x,
                sy = this._vf.size.y,
                sz = this._vf.size.z;

			var geoCacheID = 'Box_'+sx+'-'+sy+'-'+sz;

			if( this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined )
			{
				//x3dom.debug.logInfo("Using Box from Cache");
				this._mesh = x3dom.geoCache[geoCacheID];
			}
			else
			{
				sx /= 2; sy /= 2; sz /= 2;

				this._mesh._positions[0] = [
					-sx,-sy,-sz,  -sx, sy,-sz,   sx, sy,-sz,   sx,-sy,-sz, //hinten 0,0,-1
					-sx,-sy, sz,  -sx, sy, sz,   sx, sy, sz,   sx,-sy, sz, //vorne 0,0,1
					-sx,-sy,-sz,  -sx,-sy, sz,  -sx, sy, sz,  -sx, sy,-sz, //links -1,0,0
					 sx,-sy,-sz,   sx,-sy, sz,   sx, sy, sz,   sx, sy,-sz, //rechts 1,0,0
					-sx, sy,-sz,  -sx, sy, sz,   sx, sy, sz,   sx, sy,-sz, //oben 0,1,0
					-sx,-sy,-sz,  -sx,-sy, sz,   sx,-sy, sz,   sx,-sy,-sz  //unten 0,-1,0
				];
				this._mesh._normals[0] = [
					0,0,-1,  0,0,-1,   0,0,-1,   0,0,-1,
					0,0,1,  0,0,1,   0,0,1,   0,0,1,
					-1,0,0,  -1,0,0,  -1,0,0,  -1,0,0,
					1,0,0,   1,0,0,   1,0,0,   1,0,0,
					0,1,0,  0,1,0,   0,1,0,   0,1,0,
					0,-1,0,  0,-1,0,   0,-1,0,   0,-1,0
				];
				this._mesh._texCoords[0] = [
					1,0, 1,1, 0,1, 0,0,
					0,0, 0,1, 1,1, 1,0,
					0,0, 1,0, 1,1, 0,1,
					1,0, 0,0, 0,1, 1,1,
					0,1, 0,0, 1,0, 1,1,
					0,0, 0,1, 1,1, 1,0
				];
				this._mesh._indices[0] = [
					0,1,2, 2,3,0,
					4,7,5, 5,7,6,
					8,9,10, 10,11,8,
					12,14,13, 14,12,15,
					16,17,18, 18,19,16,
					20,22,21, 22,20,23
				];
				this._mesh._invalidate = true;
				this._mesh._numFaces = 12;
				this._mesh._numCoords = 24;

				x3dom.geoCache[geoCacheID] = this._mesh;
			}
        },
        {
            fieldChanged: function(fieldName) {
                if (fieldName === "size") {
                    var sx = this._vf.size.x / 2,
                        sy = this._vf.size.y / 2,
                        sz = this._vf.size.z / 2;

                    this._mesh._positions[0] = [
                        -sx,-sy,-sz,  -sx, sy,-sz,   sx, sy,-sz,   sx,-sy,-sz, //back   0,0,-1
                        -sx,-sy, sz,  -sx, sy, sz,   sx, sy, sz,   sx,-sy, sz, //front  0,0,1
                        -sx,-sy,-sz,  -sx,-sy, sz,  -sx, sy, sz,  -sx, sy,-sz, //left   -1,0,0
                         sx,-sy,-sz,   sx,-sy, sz,   sx, sy, sz,   sx, sy,-sz, //right  1,0,0
                        -sx, sy,-sz,  -sx, sy, sz,   sx, sy, sz,   sx, sy,-sz, //top    0,1,0
                        -sx,-sy,-sz,  -sx,-sy, sz,   sx,-sy, sz,   sx,-sy,-sz  //bottom 0,-1,0
                    ];

                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                    });
                }
            }
        }
    )
);

/* ### Sphere ### */
x3dom.registerNodeType(
    "Sphere",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Sphere.superClass.call(this, ctx);

            // sky box background creates sphere with r = 10000
			this.addField_SFFloat(ctx, 'radius', ctx ? 1 : 10000);
			this.addField_SFVec2f(ctx, 'subdivision', 24, 24);
			 
            var qfactor = 1.0;
			var r = this._vf.radius;
			var subx = this._vf.subdivision.x, suby = this._vf.subdivision.y;
			
			var geoCacheID = 'Sphere_'+r;

			if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
				//x3dom.debug.logInfo("Using Sphere from Cache");
				this._mesh = x3dom.geoCache[geoCacheID];
			}
			else {
				if(ctx) {
					qfactor = ctx.doc.properties.getProperty("PrimitiveQuality", "Medium");
				}
                if (!x3dom.Utils.isNumber(qfactor)) {
                    switch (qfactor.toLowerCase()) {
                        case "low":
                            qfactor = 0.3;
                            break;
                        case "medium":
                            qfactor = 0.5;
                            break;
                        case "high":
                            qfactor = 1.0;
                            break;
                    }
                } else {
                    qfactor = parseFloat(qfactor);
                }
				
				this._quality = qfactor;

				var latNumber, longNumber;
				var latitudeBands = Math.floor(subx * qfactor);
				var longitudeBands = Math.floor(suby * qfactor);

                //x3dom.debug.logInfo("Latitude bands:  "+ latitudeBands);
                //x3dom.debug.logInfo("Longitude bands: "+ longitudeBands);

				var theta, sinTheta, cosTheta;
				var phi, sinPhi, cosPhi;
				var x, y, z, u, v;

				for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
					theta = (latNumber * Math.PI) / latitudeBands;
					sinTheta = Math.sin(theta);
					cosTheta = Math.cos(theta);

					for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
						phi = (longNumber * 2.0 * Math.PI) / longitudeBands;
						sinPhi = Math.sin(phi);
						cosPhi = Math.cos(phi);

						x = -cosPhi * sinTheta;
						y = -cosTheta;
						z = -sinPhi * sinTheta;

						u = 0.25 - ((1.0 * longNumber) / longitudeBands);
						v = latNumber / latitudeBands;

						this._mesh._positions[0].push(r * x);
						this._mesh._positions[0].push(r * y);
						this._mesh._positions[0].push(r * z);
						this._mesh._normals[0].push(x);
						this._mesh._normals[0].push(y);
						this._mesh._normals[0].push(z);
						this._mesh._texCoords[0].push(u);
						this._mesh._texCoords[0].push(v);
					}
				}

				var first, second;

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

				x3dom.geoCache[geoCacheID] = this._mesh;
			}
        },
        {
            fieldChanged: function(fieldName) {
                 if (fieldName === "radius") {  
                    this._mesh._positions[0] = [];
					this._mesh._normals[0] = [];
					var r = this._vf.radius;
					var subx = this._vf.subdivision.x, suby = this._vf.subdivision.y;
					var qfactor = this._quality;
									
					var latNumber, longNumber;
					var latitudeBands = Math.floor(subx * qfactor);
					var longitudeBands = Math.floor(suby * qfactor);
					
					var theta, sinTheta, cosTheta;
					var phi, sinPhi, cosPhi;
					var x, y, z;
	
					for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
						theta = (latNumber * Math.PI) / latitudeBands;
						sinTheta = Math.sin(theta);
						cosTheta = Math.cos(theta);
	
						for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
							phi = (longNumber * 2.0 * Math.PI) / longitudeBands;
							sinPhi = Math.sin(phi);
							cosPhi = Math.cos(phi);
	
							x = -cosPhi * sinTheta;
							y = -cosTheta;
							z = -sinPhi * sinTheta;
	
							this._mesh._positions[0].push(r * x);
							this._mesh._positions[0].push(r * y);
							this._mesh._positions[0].push(r * z);
						}
					}
					
					this._mesh._invalidate = true;
					this._mesh._numCoords = this._mesh._positions[0].length / 3;
				
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                    });
                } else if (fieldName === "subdivision") {
					this._mesh._positions[0] = [];
					this._mesh._indices[0] =[];
					this._mesh._normals[0] = [];
					this._mesh._texCoords[0] =[];
					
					var r = this._vf.radius;
					var subx = this._vf.subdivision.x, suby = this._vf.subdivision.y;
					var qfactor = this._quality;
					
					var latNumber, longNumber;
					var latitudeBands = Math.floor(subx * qfactor);
					var longitudeBands = Math.floor(suby * qfactor);
	
					var theta, sinTheta, cosTheta;
					var phi, sinPhi, cosPhi;
					var x, y, z, u, v;
	
					for (latNumber = 0; latNumber <= latitudeBands; latNumber++) {
						theta = (latNumber * Math.PI) / latitudeBands;
						sinTheta = Math.sin(theta);
						cosTheta = Math.cos(theta);
	
						for (longNumber = 0; longNumber <= longitudeBands; longNumber++) {
							phi = (longNumber * 2.0 * Math.PI) / longitudeBands;
							sinPhi = Math.sin(phi);
							cosPhi = Math.cos(phi);
	
							x = -cosPhi * sinTheta;
							y = -cosTheta;
							z = -sinPhi * sinTheta;
	
							u = 0.25 - ((1.0 * longNumber) / longitudeBands);
							v = latNumber / latitudeBands;
	
							this._mesh._positions[0].push(r * x);
							this._mesh._positions[0].push(r * y);
							this._mesh._positions[0].push(r * z);
							this._mesh._normals[0].push(x);
							this._mesh._normals[0].push(y);
							this._mesh._normals[0].push(z);
							this._mesh._texCoords[0].push(u);
							this._mesh._texCoords[0].push(v);
						}
					}
	
					var first, second;
	
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
					
					 Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                    });
				}
            }
        }
    )
);

/* ### Torus ### */
x3dom.registerNodeType(
    "Torus",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Torus.superClass.call(this, ctx);
			this.addField_SFFloat(ctx, 'innerRadius', 0.5);
			this.addField_SFFloat(ctx, 'outerRadius', 1.0);
			this.addField_SFVec2f(ctx, 'subdivision', 24, 24);
			
			var innerRadius = this._vf.innerRadius;
			var outerRadius = this._vf.outerRadius;
			var rings = this._vf.subdivision.x, sides = this._vf.subdivision.y;
					
			var geoCacheID = 'Torus_'+innerRadius+'_'+outerRadius;

			if( this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined )
			{
				//x3dom.debug.logInfo("Using Torus from Cache");
				this._mesh = x3dom.geoCache[geoCacheID];
			}
			else
			{
				var ringDelta = 2.0 * Math.PI / rings;
				var sideDelta = 2.0 * Math.PI / sides;
				var p = [], n = [], t = [], i = [];
				var a, b, theta, phi;

				for (a=0, theta=0; a <= rings; a++, theta+=ringDelta)
				{
					var cosTheta = Math.cos(theta);
					var sinTheta = Math.sin(theta);

					for (b=0, phi=0; b<=sides; b++, phi+=sideDelta)
					{
						var cosPhi = Math.cos(phi);
						var sinPhi = Math.sin(phi);
						var dist = outerRadius + innerRadius * cosPhi;

						this._mesh._normals[0].push(cosTheta * cosPhi, -sinTheta * cosPhi, sinPhi);
						this._mesh._positions[0].push(cosTheta * dist, -sinTheta * dist, innerRadius * sinPhi);
						this._mesh._texCoords[0].push(-a / rings, b / sides);
					}
				}

				for (a=0; a<sides; a++)
				{
					for (b=0; b<rings; b++)
					{
						this._mesh._indices[0].push(b * (sides+1) + a);
						this._mesh._indices[0].push(b * (sides+1) + a + 1);
						this._mesh._indices[0].push((b + 1) * (sides+1) + a);

						this._mesh._indices[0].push(b * (sides+1) + a + 1);
						this._mesh._indices[0].push((b + 1) * (sides+1) + a + 1);
						this._mesh._indices[0].push((b + 1) * (sides+1) + a);
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
                if (fieldName === "innerRadius" || fieldName === "outerRadius") { 
				
                    this._mesh._positions[0] = [];
					
					var innerRadius = this._vf.innerRadius;
					var outerRadius = this._vf.outerRadius;
					var rings = this._vf.subdivision.x, sides = this._vf.subdivision.y;
				
					var ringDelta = 2.0 * Math.PI / rings;
					var sideDelta = 2.0 * Math.PI / sides;
					var a, b, theta, phi;
	
					for (a=0, theta=0; a <= rings; a++, theta+=ringDelta)
					{
						var cosTheta = Math.cos(theta);
						var sinTheta = Math.sin(theta);
	
						for (b=0, phi=0; b<=sides; b++, phi+=sideDelta)
						{
							var cosPhi = Math.cos(phi);
							var sinPhi = Math.sin(phi);
							var dist = outerRadius + innerRadius * cosPhi;
							this._mesh._positions[0].push(cosTheta * dist, -sinTheta * dist, innerRadius * sinPhi);
						}
					}
					
					this._mesh._invalidate = true;
					this._mesh._numCoords = this._mesh._positions[0].length / 3;
				
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                    });
                } else if (fieldName === "subdivision") {
					
					this._mesh._positions[0] = [];
					this._mesh._indices[0] =[];
					this._mesh._normals[0] = [];
					this._mesh._texCoords[0] =[];
					
					var innerRadius = this._vf.innerRadius;
					var outerRadius = this._vf.outerRadius;
					var rings = this._vf.subdivision.x, sides = this._vf.subdivision.y;
					
					var ringDelta = 2.0 * Math.PI / rings;
					var sideDelta = 2.0 * Math.PI / sides;
					var a, b, theta, phi;
	
					for (a=0, theta=0; a <= rings; a++, theta+=ringDelta)
					{
						var cosTheta = Math.cos(theta);
						var sinTheta = Math.sin(theta);
	
						for (b=0, phi=0; b<=sides; b++, phi+=sideDelta)
						{
							var cosPhi = Math.cos(phi);
							var sinPhi = Math.sin(phi);
							var dist = outerRadius + innerRadius * cosPhi;
	
							this._mesh._normals[0].push(cosTheta * cosPhi, -sinTheta * cosPhi, sinPhi);
							this._mesh._positions[0].push(cosTheta * dist, -sinTheta * dist, innerRadius * sinPhi);
							this._mesh._texCoords[0].push(-a / rings, b / sides);
						}
					}
	
					for (a=0; a<sides; a++)
					{
						for (b=0; b<rings; b++)
						{
							this._mesh._indices[0].push(b * (sides+1) + a);
							this._mesh._indices[0].push(b * (sides+1) + a + 1);
							this._mesh._indices[0].push((b + 1) * (sides+1) + a);
	
							this._mesh._indices[0].push(b * (sides+1) + a + 1);
							this._mesh._indices[0].push((b + 1) * (sides+1) + a + 1);
							this._mesh._indices[0].push((b + 1) * (sides+1) + a);
						}
					}
				
					this._mesh._invalidate = true;
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


/* ### Cone ### */
x3dom.registerNodeType(
    "Cone",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Cone.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'bottomRadius', 1.0);
            this.addField_SFFloat(ctx, 'height', 2.0);
            this.addField_SFBool(ctx, 'bottom', true);
			this.addField_SFFloat(ctx, 'subdivision', 32);
            this.addField_SFBool(ctx, 'side', true);
			
			var sides = this._vf.subdivision;

			var geoCacheID = 'Cone_'+this._vf.bottomRadius+'_'+this._vf.height+'_'+this._vf.bottom+'_'+this._vf.side;

			if( this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined )
			{
				//x3dom.debug.logInfo("Using Cone from Cache");
				this._mesh = x3dom.geoCache[geoCacheID];
			}
			else
			{
				var bottomRadius = this._vf.bottomRadius, height = this._vf.height;

				var beta, x, z;
				var delta = 2.0 * Math.PI / sides;
				var incl = bottomRadius / height;
				var nlen = 1.0 / Math.sqrt(1.0 + incl * incl);
		
				var j = 0;
        		var k = 0;

				if (this._vf.side)
				{
				  for (j=0, k=0; j<=sides; j++)
				  {
					beta = j * delta;
					x = Math.sin(beta);
					z = -Math.cos(beta);

					this._mesh._positions[0].push(0, height/2, 0);
					this._mesh._normals[0].push(x/nlen, incl/nlen, z/nlen);
					this._mesh._texCoords[0].push(1.0 - j / sides, 1);

					this._mesh._positions[0].push(x * bottomRadius, -height/2, z * bottomRadius);
					this._mesh._normals[0].push(x/nlen, incl/nlen, z/nlen);
					this._mesh._texCoords[0].push(1.0 - j / sides, 0);

					if (j > 0)
					{
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

				if (this._vf.bottom && bottomRadius > 0)
				{
					var base = this._mesh._positions[0].length / 3;

					for (j=sides-1; j>=0; j--)
					{
						beta = j * delta;
						x = bottomRadius * Math.sin(beta);
						z = -bottomRadius * Math.cos(beta);

						this._mesh._positions[0].push(x, -height/2, z);
						this._mesh._normals[0].push(0, -1, 0);
						this._mesh._texCoords[0].push(x / bottomRadius / 2 + 0.5, z / bottomRadius / 2 + 0.5);
					}

					var h = base + 1;

					for (j=2; j<sides; j++)
					{
						this._mesh._indices[0].push(h);
						this._mesh._indices[0].push(base);

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
            fieldChanged: function(fieldName) {
                if (fieldName === "bottomRadius" || fieldName === "height") { 
				
                    this._mesh._positions[0] = [];
					
					var bottomRadius = this._vf.bottomRadius, height = this._vf.height;
					var sides = this._vf.subdivision;
					
					var beta, x, z;
					var delta = 2.0 * Math.PI / sides;
					var incl = bottomRadius / height;
					var nlen = 1.0 / Math.sqrt(1.0 + incl * incl);			
	
					if (this._vf.side)
					{
					  for (var j=0; j<=sides; j++)
					  {
						beta = j * delta;
						x = Math.sin(beta);
						z = -Math.cos(beta);
	
						this._mesh._positions[0].push(0, height/2, 0);
						this._mesh._positions[0].push(x * bottomRadius, -height/2, z * bottomRadius);
					  }
					}
	
					if (this._vf.bottom && bottomRadius > 0)
					{
						var base = this._mesh._positions[0].length / 3;
	
						for (var j=sides-1; j>=0; j--)
						{
							beta = j * delta;
							x = bottomRadius * Math.sin(beta);
							z = -bottomRadius * Math.cos(beta);
	
							this._mesh._positions[0].push(x, -height/2, z);
						}			
					}
					
					this._mesh._invalidate = true;
					this._mesh._numCoords = this._mesh._positions[0].length / 3;
				
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                    });
                } else if (fieldName === "subdivision" || fieldName === "bottom") {
					
					this._mesh._positions[0] = [];
					this._mesh._indices[0] =[];
					this._mesh._normals[0] = [];
					this._mesh._texCoords[0] =[];
					
					var bottomRadius = this._vf.bottomRadius, height = this._vf.height;
					var sides = this._vf.subdivision;
					
					var beta, x, z;
					var delta = 2.0 * Math.PI / sides;
					var incl = bottomRadius / height;
					var nlen = 1.0 / Math.sqrt(1.0 + incl * incl);	
					
					var j = 0;
					var k = 0;
	
					if (this._vf.side)
					{
					  for (j=0, k=0; j<=sides; j++)
					  {
						beta = j * delta;
						x = Math.sin(beta);
						z = -Math.cos(beta);
	
						this._mesh._positions[0].push(0, height/2, 0);
						this._mesh._normals[0].push(x/nlen, incl/nlen, z/nlen);
						this._mesh._texCoords[0].push(1.0 - j / sides, 1);
	
						this._mesh._positions[0].push(x * bottomRadius, -height/2, z * bottomRadius);
						this._mesh._normals[0].push(x/nlen, incl/nlen, z/nlen);
						this._mesh._texCoords[0].push(1.0 - j / sides, 0);
	
						if (j > 0)
						{
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
	
					if (this._vf.bottom && bottomRadius > 0)
					{
						var base = this._mesh._positions[0].length / 3;
	
						for (j=sides-1; j>=0; j--)
						{
							beta = j * delta;
							x = bottomRadius * Math.sin(beta);
							z = -bottomRadius * Math.cos(beta);
	
							this._mesh._positions[0].push(x, -height/2, z);
							this._mesh._normals[0].push(0, -1, 0);
							this._mesh._texCoords[0].push(x / bottomRadius / 2 + 0.5, z / bottomRadius / 2 + 0.5);
						}
	
						var h = base + 1;
	
						for (j=2; j<sides; j++)
						{
							this._mesh._indices[0].push(h);
							this._mesh._indices[0].push(base);
	
							h = base + j;
							this._mesh._indices[0].push(h);
						}
					}
					
					this._mesh._invalidate = true;
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
/* ### Cylinder ### */
x3dom.registerNodeType(
    "Cylinder",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Cylinder.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'radius', 1.0);
            this.addField_SFFloat(ctx, 'height', 2.0);
            this.addField_SFBool(ctx, 'bottom', true);
            this.addField_SFBool(ctx, 'top', true);
			this.addField_SFFloat(ctx, 'subdivision', 32);
            this.addField_SFBool(ctx, 'side', true);
			
			var sides = this._vf.subdivision;

			var geoCacheID = 'Cylinder_'+this._vf.radius+'_'+this._vf.height+'_'+this._vf.bottom+'_'+this._vf.top+'_'+this._vf.side;

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
				if (this._vf.side)
				{
				  for (j=0, k=0; j<=sides; j++)
				  {
					beta = j * delta;
					x = Math.sin(beta);
					z = -Math.cos(beta);

					this._mesh._positions[0].push(x * radius, -height/2, z * radius);
					this._mesh._normals[0].push(x, 0, z);
					this._mesh._texCoords[0].push(1.0 - j / sides, 0);

					this._mesh._positions[0].push(x * radius, height/2, z * radius);
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

						this._mesh._positions[0].push(x, height/2, z);
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

						this._mesh._positions[0].push(x, -height/2, z);
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
                if (fieldName === "radius" || fieldName === "height") { 
				
                    this._mesh._positions[0] = [];
					
					var radius = this._vf.radius, height = this._vf.height;
					var sides = this._vf.subdivision;	
					
					var beta, x, z;
					var delta = 2.0 * Math.PI / sides;
	
					var j = 0;
					if (this._vf.side)
					{
					  for (j=0; j<=sides; j++)
					  {
						beta = j * delta;
						x = Math.sin(beta);
						z = -Math.cos(beta);
	
						this._mesh._positions[0].push(x * radius, -height/2, z * radius);
						this._mesh._positions[0].push(x * radius, height/2, z * radius);	
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
	
							this._mesh._positions[0].push(x, height/2, z);							
						  }
						}
					}
	
					if (this._vf.bottom)
					{
					  for (j=sides-1; j>=0; j--)
					  {
						beta = j * delta;
						x = radius * Math.sin(beta);
						z = -radius * Math.cos(beta);
						
						this._mesh._positions[0].push(x, -height/2, z);
					  }
					}
				
					this._mesh._invalidate = true;
					this._mesh._numCoords = this._mesh._positions[0].length / 3;
				
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                    });
                } else if (fieldName === "subdivision" || fieldName === "bottom" || fieldName === "top") {
					
					this._mesh._positions[0] = [];
					this._mesh._indices[0] =[];
					this._mesh._normals[0] = [];
					this._mesh._texCoords[0] =[];
					
					var radius = this._vf.radius, height = this._vf.height;
					var sides = this._vf.subdivision;
					
					var beta, x, z;
					var delta = 2.0 * Math.PI / sides;

					var j = 0;
					 var k = 0;
					if (this._vf.side)
					{
					  for (j=0, k=0; j<=sides; j++)
					  {
						beta = j * delta;
						x = Math.sin(beta);
						z = -Math.cos(beta);
	
						this._mesh._positions[0].push(x * radius, -height/2, z * radius);
						this._mesh._normals[0].push(x, 0, z);
						this._mesh._texCoords[0].push(1.0 - j / sides, 0);
	
						this._mesh._positions[0].push(x * radius, height/2, z * radius);
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
	
							this._mesh._positions[0].push(x, height/2, z);
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
	
							this._mesh._positions[0].push(x, -height/2, z);
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
					
					 Array.forEach(this._parentNodes, function (node) {
                        node.setAllDirty();
                    });
				}
            }
        }
    )
);


/* ### BinaryGeometry ### */
x3dom.registerNodeType(
    "BinaryGeometry",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.BinaryGeometry.superClass.call(this, ctx);

            this.addField_SFVec3f (ctx, 'position', 0, 0, 0);
            this.addField_SFVec3f (ctx, 'size', 1, 1, 1);
            this.addField_MFInt32 (ctx, 'vertexCount', [0]);
            this.addField_MFString(ctx, 'primType', ['TRIANGLES']);
            
            this.addField_SFString(ctx, 'index', "");   // Uint16
            this.addField_SFString(ctx, 'coord', "");   // Float32
            this.addField_SFString(ctx, 'normal', "");
            this.addField_SFString(ctx, 'texCoord', "");
            this.addField_SFString(ctx, 'color', "");
            this.addField_SFString(ctx, 'tangent', "");     // TODO
            this.addField_SFString(ctx, 'binormal', "");    // TODO

            // Typed Array View Types
            // Int8, Uint8, Int16, Uint16, Int32, Uint32, Float32, Float64
            this.addField_SFString(ctx, 'indexType', "Uint16");
            this.addField_SFString(ctx, 'coordType', "Float32");
            this.addField_SFString(ctx, 'normalType', "Float32");
            this.addField_SFString(ctx, 'texCoordType', "Float32");
            this.addField_SFString(ctx, 'colorType', "Float32");
            this.addField_SFString(ctx, 'tangentType', "Float32");
            this.addField_SFString(ctx, 'binormalType', "Float32");
            
            this.addField_SFBool(ctx, 'normalAsSphericalCoordinates', false);
            this.addField_SFBool(ctx, 'rgbaColors', false);
            this.addField_SFInt32(ctx, 'numTexCoordComponents', 2);
            this.addField_SFBool(ctx, 'normalPerVertex', true);
            this.addField_SFBool(ctx, 'idsPerVertex', false);     // Experimental flag to decide if IDs are in texCoords
            
            // workaround
            this._hasStrideOffset = false;
            this._mesh._numPosComponents = this._vf.normalAsSphericalCoordinates ? 4 : 3;
			this._mesh._numTexComponents = this._vf.numTexCoordComponents;
			this._mesh._numColComponents = this._vf.rgbaColors ? 4 : 3;
			this._mesh._numNormComponents = this._vf.normalAsSphericalCoordinates ? 2 : 3;
			
			this._mesh._invalidate = false;
			this._mesh._numCoords = 0;
		    this._mesh._numFaces = 0;
        },
        {
            nodeChanged: function()
            {
                // TODO: handle field updates and retrigger XHR
            },

            parentAdded: function()
            {
                var offsetInd, strideInd, offset, stride;

                offsetInd = this._vf.coord.lastIndexOf('#');
                strideInd = this._vf.coord.lastIndexOf('+');
                if (offsetInd >= 0 && strideInd >= 0) {
                    offset = +this._vf.coord.substring(++offsetInd, strideInd);
                    stride = +this._vf.coord.substring(strideInd);
                    this._parentNodes[0]._coordStrideOffset = [stride, offset];
                    this._hasStrideOffset = true;
                    if ((offset / 8) - Math.floor(offset / 8) == 0) {
                        this._mesh._numPosComponents = 4;
                    }
                    //x3dom.debug.logInfo("coord stride/offset: " + stride + ", " + offset);
                }
                else if (strideInd >= 0) {
                    stride = +this._vf.coord.substring(strideInd);
                    this._parentNodes[0]._coordStrideOffset = [stride, 0];
                    if ((stride / 8) - Math.floor(stride / 8) == 0) {
                        this._mesh._numPosComponents = 4;   // ???
                    }
                    //x3dom.debug.logInfo("coord stride: " + stride);
                }

                offsetInd = this._vf.normal.lastIndexOf('#');
                strideInd = this._vf.normal.lastIndexOf('+');
                if (offsetInd >= 0 && strideInd >= 0) {
                    offset = +this._vf.normal.substring(++offsetInd, strideInd);
                    stride = +this._vf.normal.substring(strideInd);
                    this._parentNodes[0]._normalStrideOffset = [stride, offset];
                    //x3dom.debug.logInfo("normal stride/offset: " + stride + ", " + offset);
                }
                else if (strideInd >= 0) {
                    stride = +this._vf.normal.substring(strideInd);
                    this._parentNodes[0]._normalStrideOffset = [stride, 0];
                    //x3dom.debug.logInfo("normal stride: " + stride);
                }

                offsetInd = this._vf.texCoord.lastIndexOf('#');
                strideInd = this._vf.texCoord.lastIndexOf('+');
                if (offsetInd >= 0 && strideInd >= 0) {
                    offset = +this._vf.texCoord.substring(++offsetInd, strideInd);
                    stride = +this._vf.texCoord.substring(strideInd);
                    this._parentNodes[0]._texCoordStrideOffset = [stride, offset];
                    //x3dom.debug.logInfo("texCoord stride/offset: " + stride + ", " + offset);
                }
                else if (strideInd >= 0) {
                    stride = +this._vf.texCoord.substring(strideInd);
                    this._parentNodes[0]._texCoordStrideOffset = [stride, 0];
                    //x3dom.debug.logInfo("texCoord stride: " + stride);
                }

                offsetInd = this._vf.color.lastIndexOf('#');
                strideInd = this._vf.color.lastIndexOf('+');
                if (offsetInd >= 0 && strideInd >= 0) {
                    offset = +this._vf.color.substring(++offsetInd, strideInd);
                    stride = +this._vf.color.substring(strideInd);
                    this._parentNodes[0]._colorStrideOffset = [stride, offset];
                    //x3dom.debug.logInfo("color stride/offset: " + stride + ", " + offset);
                }
                else if (strideInd >= 0) {
                    stride = +this._vf.color.substring(strideInd);
                    this._parentNodes[0]._colorStrideOffset = [stride, 0];
                    //x3dom.debug.logInfo("color stride: " + stride);
                }
                
                if (this._vf.indexType != "Uint16")
    		        x3dom.debug.logWarning("Index type " + this._vf.indexType + " problematic");
            },
            
            getMin: function()
			{
			    var center, size;
			    
				if (this._parentNodes.length >= 1 && this._vf.coordType == "Float32") {
                    center = this._parentNodes[0]._vf.bboxCenter;
                    size = this._parentNodes[0]._vf.bboxSize;
                }
                else {
                    center = this._vf.position;
                    size = this._vf.size;
                }
                
                if (size.x < 0 || size.y < 0 || size.z < 0) {
                    return center;
                }
                
                return center.subtract(size.multiply(0.5));
			},
			
			getMax: function()
			{
			    var center, size;
			    
				if (this._parentNodes.length >= 1 && this._vf.coordType == "Float32") {
                    center = this._parentNodes[0]._vf.bboxCenter;
                    size = this._parentNodes[0]._vf.bboxSize;
                }
                else {
                    center = this._vf.position;
                    size = this._vf.size;
                }
                
                if (size.x < 0 || size.y < 0 || size.z < 0) {
                    return center;
                }
                    
                return center.add(size.multiply(0.5));
			},
			
			getVolume: function(min, max, invalidate)
			{
				min.setValues(this.getMin());
				max.setValues(this.getMax());
				
				return true;
			},
			
			getCenter: function()
			{
				if (this._parentNodes.length >= 1 && this._vf.coordType == "Float32") {
				    // compatibility with old implementation and examples
                    return this._parentNodes[0]._vf.bboxCenter;
                }
                else {
                    return this._vf.position;
                }
			},
			
			getPrecisionMax: function(type)
			{
    			switch(this._vf[type])
                {
                    case "Int8":
                        return 127.0;
                    case "Uint8":
                        return 255.0;
                    case "Int16":
                        return 32767.0;
                    case "Uint16":
                        return 65535.0;
                    case "Int32":
                        return 2147483647.0;
                    case "Uint32":
                        return 4294967295.0;
                    case "Float32":
                    case "Float64":
                    default:
                        return 1.0;
                }
			}
        }
    )
);

/* ### PopGeometryLevel ### */
x3dom.registerNodeType(
    "PopGeometryLevel",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
      function (ctx) {	
          x3dom.nodeTypes.PopGeometryLevel.superClass.call(this, ctx);
    
          this.addField_SFString(ctx, 'src', "");
          this.addField_SFInt32(ctx, 'numIndices', 0);			
          this.addField_SFInt32(ctx, 'vertexDataBufferOffset', 0);
      },
      {
        nodeChanged: function() {	
          //TODO: implement
        },

        fieldChanged: function(fieldName) {
        },
			
        getSrc: function() {
          return this._vf.src;
        },
			
        getNumIndices: function() {
          return this._vf.numIndices;
        },
        
        getVertexDataBufferOffset: function() {
            return this._vf.vertexDataBufferOffset;
        }
	  }
	)
);

/* ### PopGeometry ### */
x3dom.registerNodeType(
    "PopGeometry",
    "Rendering",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {        
            x3dom.nodeTypes.PopGeometry.superClass.call(this, ctx);
            
            this.addField_MFInt32 (ctx, 'vertexCount', [0]);            
            this.addField_MFString(ctx, 'primType', ['TRIANGLES']);
            this.addField_SFVec3f (ctx, 'position', 0, 0, 0);
            this.addField_SFVec3f (ctx, 'size',     1, 1, 1);            
            
            this.addField_MFNode('levels', x3dom.nodeTypes.PopGeometryLevel);
            
            this.addField_SFInt32(ctx, 'attributeStride', 0);
            this.addField_SFInt32(ctx, 'positionOffset',  0);
            this.addField_SFInt32(ctx, 'normalOffset',    0);
            this.addField_SFInt32(ctx, 'texcoordOffset',  0);
            this.addField_SFInt32(ctx, 'colorOffset',     0);
            
            this.addField_SFInt32(ctx, 'positionPrecision', 2);
            this.addField_SFInt32(ctx, 'normalPrecision',   1);
            this.addField_SFInt32(ctx, 'texcoordPrecision', 2);
            this.addField_SFInt32(ctx, 'colorPrecision',    1);            
           
            this.addField_SFInt32(ctx, 'vertexBufferSize', 0);
            
            this.addField_SFBool(ctx, 'indexedRendering', false);
            this.addField_SFBool(ctx, 'sphericalNormals', false);
            
            //those four fields are read by the x3dom renderer,
            //and they are updated with the actual values on "nodeChanged"
            this.addField_SFString(ctx, 'coordType',    "Uint16");
            this.addField_SFString(ctx, 'normalType',   "Uint8");
            this.addField_SFString(ctx, 'texCoordType', "Uint16");
            this.addField_SFString(ctx, 'colorType',    "Uint8");           
            
            //needed as we manipulate vertexCount during loading
            this.addField_MFInt32(ctx, 'originalVertexCount', [0]);
            
            // workaround            
            this._hasStrideOffset = false;
            this._mesh._numPosComponents  = 3;
            this._mesh._numNormComponents = this._vf.sphericalNormals ? 2 : 3;
            this._mesh._numTexComponents  = 2;
            this._mesh._numColComponents  = 3;
            
            this._mesh._invalidate = false;
            this._mesh._numCoords  = 0;
            this._mesh._numFaces   = 0;
        
            this._mesh._invalidate = false;
            this._mesh._numCoords  = 0;
            this._mesh._numFaces   = 0;
        },
        {
            nodeChanged: function() {
              this._vf.coordType    = this.getBufferTypeStringFromByteCount(this._vf.positionPrecision);
              this._vf.normalType   = this.getBufferTypeStringFromByteCount(this._vf.normalPrecision);
              this._vf.texCoordType = this.getBufferTypeStringFromByteCount(this._vf.texcoordPrecision);
              this._vf.colorType    = this.getBufferTypeStringFromByteCount(this._vf.colorPrecision);
              
              for (var i = 0; i < this._vf.vertexCount.length; ++i) {
                this._vf.originalVertexCount[i] = this._vf.vertexCount[i];
              }
              
              this._vf.sphericalNormals ? 2 : 3;
            },

            parentAdded: function() {
              //TODO: implement 
            },
            
            getMin: function() {
              return this._vf.position.subtract( this._vf.size.multiply(0.5) );
            },
            
            getMax: function() {
              return this._vf.position.add( this._vf.size.multiply(0.5) );
            },
            
            getBBoxSize: function() {
              return this._vf.size;
            },
            
            getVolume: function(min, max, invalidate) {
              min.setValues(this.getMin());
              max.setValues(this.getMax());
              
              return true;
            },
            
            getCenter: function() {
              return this._vf.position;
            },
            
            hasIndex: function() {
              return (this._vf.indexedRendering) ? true : false;
            },
            
            getTotalNumberOfIndices: function() {                
              if (this._vf.indexedRendering) {
                var sum = 0;
                for (var i = 0; i < this._vf.originalVertexCount.length; ++i) {
                    sum += this._vf.originalVertexCount[i];
                }
                return sum;
              }
              else  {
                return 0;
              }              
            },
            
            getVertexCount: function() {
                var sum = 0;
                for (var i = 0; i < this._vf.originalVertexCount.length; ++i) {
                    sum += this._vf.originalVertexCount[i];
                }
                return sum;
            },
            
            //adapts the vertex count according to the given total number of indices / vertices
            //which is used by X3DOM's renderer
            adaptVertexCount: function(numVerts) {
                var verts = 0;
                for (var i = 0; i < this._vf.originalVertexCount.length; ++i) {
                    if ((this._vf.originalVertexCount[i] + verts) <= numVerts) {
                        this._vf.vertexCount[i] = this._vf.originalVertexCount[i];
                        verts += this._vf.originalVertexCount[i];
                    }
                    else {
                        this._vf.vertexCount[i] = (numVerts-verts);
                        break;
                    }                    
                }
            },
            
            hasNormal: function() {
              return (this._vf.normalOffset != 0);
            },
            
            hasTexCoord: function() {
              return (this._vf.texcoordOffset != 0);
            },
            
            hasColor: function() {
              return (this._vf.colorOffset != 0);
            },
            
            getPositionPrecision : function() {
              return this._vf.positionPrecision;
            },
            
            getNormalPrecision : function() {
              return this._vf.normalPrecision;
            },
            
            getTexCoordPrecision : function() {
              return this._vf.texcoordPrecision;
            },
            
            getColorPrecision : function() {
              return this._vf.colorPrecision;
            },
            
            getAttributeStride : function() {
              return this._vf.attributeStride;
            },
            
            getPositionOffset : function() {
              return this._vf.positionOffset;
            },
            
            getNormalOffset : function() {
              return this._vf.normalOffset;
            },
            
            getTexCoordOffset : function() {
              return this._vf.texcoordOffset;
            },
            
            getColorOffset : function() {
              return this._vf.colorOffset;
            },
            
            getBufferTypeStringFromByteCount: function(bytes) {
                switch(bytes)
                {
                    case 1:
                        return "Uint8";
                    case 2:
                        return "Uint16";              
                    //case 4: //currently not supported by PopGeometry
                    //    return "Float32";
                    default:
                        return 0;
                }
            },            
            
            getDataURLs : function() {
              var urls = [];
                                  
              for (var i = 0; i < this._cf.levels.nodes.length; ++i) {
                urls.push(this._cf.levels.nodes[i].getSrc());                          
              }
              
              return urls;
            },
            
            getNumIndicesByLevel : function(lvl) {
              return this._cf.levels.nodes[lvl].getNumIndices();
            },
            
            getNumLevels : function(lvl) {
              return this._cf.levels.nodes.length;
            },
            
            getVertexDataBufferOffset : function(lvl) {
              return this._cf.levels.nodes[lvl].getVertexDataBufferOffset();
            },
            
            getPrecisionMax: function(type) {
              switch(this._vf[type])
              {
                  //currently, only Uint8 and Uint16 are supported
                  //case "Int8":
                  //    return 127.0;
                  case "Uint8":
                      return 255.0;
                  //case "Int16":
                  //    return 32767.0;
                  case "Uint16":
                      return 65535.0;
                  //case "Int32":
                     //return 2147483647.0;
                  //case "Uint32":
                     //return 4294967295.0;
                  //case "Float32":
                  //case "Float64":
                  default:
                      return 1.0;
              }
            },
            
            insideViewFrustum : function(bboxCenter, bboxSize, near, far, ratio, imgPlaneHeightAtDistOne) {
                //test our bounding box against the frustum's separating planes
                //return true;
                
                var halfBBDiag = bboxSize.length()* 0.5;
               
                //near
                if ((bboxCenter.z - near) - halfBBDiag > 0)
                    return false;
                
                //far
                if ((bboxCenter.z - far) - halfBBDiag > 0)
                    return false;
                
                //we could multiply by near here, but that's not necessary
                var top    = 0.5 * imgPlaneHeightAtDistOne;
                var bottom = -top;
                var left   = bottom * ratio;
                var right  = -left;
                
                var bl = new x3dom.fields.SFVec3f(left,  bottom, 1.0).normalize();
                var br = new x3dom.fields.SFVec3f(right, bottom, 1.0).normalize();
                var tl = new x3dom.fields.SFVec3f(left,  top,    1.0).normalize();
                var tr = new x3dom.fields.SFVec3f(right, top,    1.0).normalize();
                
                //@todo: take bounding box size into account!
                
                
                
                //left
                var vleft = tl.cross(bl);                
                if ((vleft.dot(bboxCenter) - halfBBDiag) > 0) 
                    return false;
                
                //right
                var vright = br.cross(tr);                
                if ((vright.dot(bboxCenter) - halfBBDiag) > 0) 
                    return false;
                
                //bottom
                var vbottom = bl.cross(br);                
                if ((vbottom.dot(bboxCenter) - halfBBDiag) > 0) 
                    return false;
                
                //top
                var vtop = tr.cross(tl);                
                if ((vtop.dot(bboxCenter) - halfBBDiag) > 0) 
                    return false;
                
                return true;
            }
        }
    )
);

/* ### BitLODGeoComponent ### */
x3dom.registerNodeType(
    "BitLODGeoComponent",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometricPropertyNode,
        function (ctx) {
            x3dom.nodeTypes.BitLODGeoComponent.superClass.call(this, ctx);
			
			this.addField_SFString(ctx, 'src', "");
			this.addField_MFInt32(ctx, 'format', []);
			this.addField_MFString(ctx, 'attrib', []);
			
			this._attribShift = [];
			this._attribShiftDec = [];
			this._mask = [];
			
			this._bitsPerComponent = 0;
		},
		{
			nodeChanged: function()
            {		
				//Get Bits per component
				for(var f=0; f<this._vf.format.length; f++) {
					this._bitsPerComponent += this._vf.format[f];
				}
				
				/*for(var a=0; a<this._vf.attrib.length; a++) {
					if(this._vf.attrib[a] == "coord3") {
						this._attribShiftDec[a] = this._vf.format[a]/3;
					} else if(this._vf.attrib[a] == "normal2") {
						this._attribShiftDec[a] = this._vf.format[a]/2;
					} else if(this._vf.attrib[a] == "normal3") {
						this._attribShiftDec[a] = this._vf.format[a]/3;
					} else if(this._vf.attrib[a] == "texcoord2") {
						this._attribShiftDec[a] = this._vf.format[a]/2;
					} else if(this._vf.attrib[a] == "texcoord3") {
						this._attribShiftDec[a] = this._vf.format[a]/3;
					} else if(this._vf.attrib[a] == "color3") {
						this._attribShiftDec[a] = this._vf.format[a]/3;
					} else if(this._vf.attrib[a] == "color4") {
						this._attribShiftDec[a] = this._vf.format[a]/4;
					}
					
					this._attribShift[a] = this._bitsPerComponent - ((a) ? this._vf.format[a-1] : 0);
					this._mask[a] = Math.pow(2, this._attribShiftDec[a]) - 1;
				}*/
			},

            fieldChanged: function(fieldName)
            {
            },
			
			getSrc: function()
			{
				return this._vf.src;
			},
			
			getFormat: function()
			{
				return this._vf.format;
			},
			
			getAttrib: function(idx)
			{
				return this._vf.attrib[idx];
			},
			
			getNumAttribs: function()
			{
				return this._vf.attrib.length;
			}
		}
	)
);

/* ### BitLODGeometry ### */
x3dom.registerNodeType(
    "BitLODGeometry",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {	
            x3dom.nodeTypes.BitLODGeometry.superClass.call(this, ctx);
			
			this.addField_SFVec3f(ctx, 'position', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'size', 1, 1, 1);
			this.addField_MFInt32(ctx, 'vertexCount', [0]);
			this.addField_MFString(ctx, 'primType', ['TRIANGLES']);
			this.addField_SFString(ctx, 'index', "");   // Uint16
            this.addField_SFBool(ctx, 'usesVLCIndices', false);  // variable-length coding
            this.addField_SFBool(ctx, 'normalAsSphericalCoordinates', false);
            this.addField_SFBool(ctx, 'normalPerVertex', true);
			this.addField_MFNode('components', x3dom.nodeTypes.BitLODGeoComponent);

			// Typed Array View Types
            // Int8, Uint8, Int16, Uint16, Int32, Uint32, Float32, Float64
            //this.addField_SFString(ctx, 'indexType', "Uint16");
            this.addField_SFString(ctx, 'coordType', "Uint16");
            this.addField_SFString(ctx, 'normalType', "Uint16");
            this.addField_SFString(ctx, 'texCoordType', "Uint16");
            this.addField_SFString(ctx, 'colorType', "Uint16");
            //this.addField_SFString(ctx, 'tangentType', "Float32");
            //this.addField_SFString(ctx, 'binormalType', "Float32");
			
			/*this._actComponent = -1;
			
			this._bitsPerVertex		= 0;
			this._bitsPerNormal		= 0;
			this._bitsPerTexCoord 	= 0;
			this._bitsPerColor 		= 0;
			
			this._componentsPerVertex 	= 0;
			this._componentsPerNormal 	= 0;
			this._componentsPerTexCoord = 0;
			this._componentsPerColor 	= 0;
			
			this._vertexShift 	= 0;
			this._normalShift 	= 0;
			this._texCoordShift = 0;
			this._colorShift 	= 0;	
			
			this._vertexShiftDec 	= 0;
			this._normalShiftDec 	= 0;
			this._texCoordShiftDec 	= 0;	
			this._colorShiftDec 	= 0;*/
			
			// workaround
			this._hasStrideOffset = false;
			this._mesh._numTexComponents = 2;
			this._mesh._numColComponents = 3;
            
            //a chain of assumptions, not very beautiful yet:
            //- using vlc indices leads to per-face-normals, which use 3 components
            //- for all other cases, per-vertex-normals are used, with 2 components
            this._vf.normalPerVertex              = !this._vf.usesVLCIndices;
            this._vf.normalAsSphericalCoordinates = true;//this._vf.normalPerVertex;
			this._mesh._numNormComponents         = this._vf.normalAsSphericalCoordinates ? 2 : 3;
			
			this._mesh._invalidate = false;
			this._mesh._numCoords = 0;
		    this._mesh._numFaces = 0;
		},
		{
			nodeChanged: function()
            {	 
				/*for(var i=0; i<this._cf.components.nodes.length; i++) {
					for(var j=0; j<this._cf.components.nodes[i]._vf.attrib.length; j++) {
						if(this._cf.components.nodes[i]._vf.attrib[j] == "coord3") {
							this._bitsPerVertex += (this._cf.components.nodes[i]._vf.format[j] / 3);
							this._componentsPerVertex++;
						} else if(this._cf.components.nodes[i]._vf.attrib[j] == "normal2") {
							this._bitsPerNormal += (this._cf.components.nodes[i]._vf.format[j] / 2);
							this._componentsPerNormal++;
						} else if(this._cf.components.nodes[i]._vf.attrib[j] == "normal3") {
							this._bitsPerNormal += (this._cf.components.nodes[i]._vf.format[j] / 3);
							this._componentsPerNormal++;
						} else if(this._cf.components.nodes[i]._vf.attrib[j] == "texcoord2") {
							this._bitsPerTexCoord += (this._cf.components.nodes[i]._vf.format[j] / 2);
							this._componentsPerTexCoord++;
						} else if(this._cf.components.nodes[i]._vf.attrib[j] == "texcoord3") {
							this._bitsPerTexCoord += (this._cf.components.nodes[i]._vf.format[j] / 3);
							this._componentsPerTexCoord++;
						} else if(this._cf.components.nodes[i]._vf.attrib[j] == "color3") {
							this._bitsPerColor += (this._cf.components.nodes[i]._vf.format[j] / 3);
							this._componentsPerColor++;
						} else if(this._cf.components.nodes[i]._vf.attrib[j] == "color4") {
							this._bitsPerColor += (this._cf.components.nodes[i]._vf.format[j] / 4);
							this._componentsPerColor++;
						}
					}
				}
				
				//Calculate attribute left shift decrement value
				this._vertexShiftDec	= this._bitsPerVertex   / this._componentsPerVertex;
				this._normalShiftDec 	= this._bitsPerNormal   / this._componentsPerNormal;
				this._texCoordShiftDec	= this._bitsPerTexCoord / this._componentsPerTexCoord;
				this._colorShiftDec 	= this._bitsPerColor    / this._componentsPerColor;
				
				//Set attribute left shift value
				this._vertexShift		= this._bitsPerVertex   - this._vertexShiftDec;
				this._normalShift		= this._bitsPerNormal   - this._normalShiftDec;
				this._texCoordShift		= this._bitsPerTexCoord - this._texCoordShiftDec;
				this._colorShift		= this._bitsPerColor    - this._colorShiftDec;
				
				//Set attribute types
				this._vf.coordType		= this.getAttribType(this._bitsPerVertex);
				this._vf.normalType		= this.getAttribType(this._bitsPerNormal);
				this._vf.texCoordType	= this.getAttribType(this._bitsPerTexCoord);
				this._vf.colorType		= this.getAttribType(this._bitsPerColor);*/
			},
      
		    parentAdded: function()
		    {
			  this._parentNodes[0]._coordStrideOffset = [12, 0];
			  this._parentNodes[0]._normalStrideOffset = [12, 8];
			  this._parentNodes[0]._texCoordStrideOffset = [4, 0];
			  this._parentNodes[0]._colorStrideOffset = [6, 0];
		    },
            
		    fieldChanged: function(fieldName)
		    {
			    // TODO
		    },
			
			getMin: function()
			{
				return this._vf.position.subtract( this._vf.size.multiply(0.5) );
			},
			
			getMax: function()
			{
				return this._vf.position.add( this._vf.size.multiply(0.5) );
			},
			
			getVolume: function(min, max, invalidate)
			{
				min.setValues(this.getMin());
				max.setValues(this.getMax());
				
				return true;
			},
			
			getCenter: function()
			{
				return this._vf.position;
			},
			
			// ATTENTION: the following accessor methods are NOT shared 
			// by all Geometry nodes, so be careful when using them!!!
			hasIndex: function()
			{
				return (this._vf.index.length) ? true : false;
			},

            usesVLCIndices: function()
			{
				return this._vf.usesVLCIndices == true;
			},
			
			hasColor: function()
			{
				for(var i=0; i<this.getNumComponents(); i++) {
					for(var j=0; j<this.getComponent(i).getNumAttribs(); j++) {
						if(this.getComponent(i).getAttrib(j) == "color3") return true;
					}
				}
				return false;
			},
			
			hasTexCoord: function()
			{
				for(var i=0; i<this.getNumComponents(); i++) {
					for(var j=0; j<this.getComponent(i).getNumAttribs(); j++) {
						if(this.getComponent(i).getAttrib(j) == "texcoord2") return true;
					}
				}
				return false;
			},
			
			getCoordNormalURLs: function() {
				var coordNormalURLs = [];
				for(var i=0; i<this.getNumComponents(); i++) {
					for(var j=0; j<this.getComponent(i).getNumAttribs(); j++) {
						if(this.getComponent(i).getAttrib(j) == "coord3") {
							coordNormalURLs.push(this.getComponent(i).getSrc());
						}
					}
				}
				return coordNormalURLs;
			},
			
			getTexCoordURLs: function() {
				var texCoordURLs = [];
				for(var i=0; i<this.getNumComponents(); i++) {
					for(var j=0; j<this.getComponent(i).getNumAttribs(); j++) {
						if(this.getComponent(i).getAttrib(j) == "texcoord2") {
							texCoordURLs.push(this.getComponent(i).getSrc());
						}
					}
				}
				return texCoordURLs;
			},
			
			getColorURLs: function() {
				var colorURLs = [];
				for(var i=0; i<this.getNumComponents(); i++) {
					for(var j=0; j<this.getComponent(i).getNumAttribs(); j++) {
						if(this.getComponent(i).getAttrib(j) == "color3") {
							colorURLs.push(this.getComponent(i).getSrc());
						}
					}
				}
				return colorURLs;
			},
			
			getNumPrimTypes: function()
			{
				return this._vf.primType.length;
			},
			
			getPrimType: function(idx)
			{
				if( idx < this.getNumPrimTypes() )
					return this._vf.primType[idx].toUpperCase();
			},
			
			getNumVertexCounts: function()
			{
				return this._vf.vertexCount.length;
			},
			
			getVertexCount: function(idx)
			{
				if( idx < this.getNumVertexCounts() ) 
					return this._vf.vertexCount[idx];
			},
			
			setVertexCount: function(idx, value)
			{
				this._vf.vertexCount[idx] = value;
			},
			
			getNumComponents: function()
			{
				return this._cf.components.nodes.length;
			},
			
			getComponent: function(idx)
			{
				return this._cf.components.nodes[idx];
			},
			
			getComponentsURLs: function()
			{
				var URLs = [];
				
				for(var c=0; c<this._cf.components.nodes.length; c++)
					URLs[c] = this._cf.components.nodes[c].getSrc();
					
				return URLs;
			},
			
			getComponentFormats: function()
			{
				var formats = [];
				
				for(var c=0; c<this._cf.components.nodes.length; c++)
					formats[c] = this._cf.components.nodes[c]._vf.format;
					
				return formats;
			},
			
			getComponentAttribs: function()
			{
				var attribs = [];
				
				for(var c=0; c<this._cf.components.nodes.length; c++)
					attribs[c] = this._cf.components.nodes[c]._vf.attrib;
					
				return attribs;
			},
			
			getNumVertices: function()
			{
				var count = 0;
				for(var i=0; i<this._vf.vertexCount.length; i++) {
					count += this._vf.vertexCount[i];
				}
				
				return count;
			},

			getAttribType: function(bits)
			{
    			switch(bits)
                {
                    case 8:
                        return "Uint8";
                    case 16:
                        return "Uint16";
                    case 32:
                        return "Float32";
                    default:
                        return 0;
                }
			},
			
			getPrecisionMax: function(type)
			{
    			switch(this._vf[type])
                {
                    case "Int8":
                        return 127.0;
                    case "Uint8":
                        return 255.0;
                    case "Int16":
                        return 32767.0;
                    case "Uint16":
                        return 65535.0;
                    case "Int32":
                        return 2147483647.0;
                    case "Uint32":
                        return 4294967295.0;
                    case "Float32":
                    case "Float64":
                    default:
                        return 1.0;
                }
			}
		}
	)
);



/* ### ImageGeometry ### */
x3dom.registerNodeType(
    "ImageGeometry",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {	
            x3dom.nodeTypes.ImageGeometry.superClass.call(this, ctx);
			
			this.addField_SFVec3f(ctx, 'position', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'size', 1, 1, 1);
			this.addField_MFInt32(ctx, 'vertexCount', [0]);
			this.addField_MFString(ctx, 'primType', ['TRIANGLES']);
			this.addField_SFVec2f(ctx, 'implicitMeshSize', 256, 256);
			this.addField_SFInt32(ctx, 'numColorComponents', 3);
			
			this.addField_SFNode('index', x3dom.nodeTypes.X3DTextureNode);
			this.addField_MFNode('coord', x3dom.nodeTypes.X3DTextureNode);
			this.addField_SFNode('normal', x3dom.nodeTypes.X3DTextureNode);
			this.addField_SFNode('texCoord', x3dom.nodeTypes.X3DTextureNode);
			this.addField_SFNode('color', x3dom.nodeTypes.X3DTextureNode);
			
			// TODO: this._mesh._numTexComponents
			this._mesh._numColComponents = this._vf.numColorComponents;
			
			if (this._vf.implicitMeshSize.y == 0)
			    this._vf.implicitMeshSize.y = this._vf.implicitMeshSize.x;
			
			//TODO check if GPU-Version is supported (Flash, etc.)
			//Dummy mesh generation only needed for GPU-Version
			
			if(x3dom.caps.BACKEND == 'webgl' && x3dom.caps.MAX_VERTEX_TEXTURE_IMAGE_UNITS > 0) {
			
				var geoCacheID = 'ImageGeometry';   // TODO: FIXME implicitMeshSize may differ!!!

				if( this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined )
				{
					//x3dom.debug.logInfo("Using ImageGeometry-Mesh from Cache");
					this._mesh = x3dom.geoCache[geoCacheID];
				}
				else
				{
					for(var y=0; y<this._vf.implicitMeshSize.y; y++)
					{
						for(var x=0; x<this._vf.implicitMeshSize.x; x++)
						{
							this._mesh._positions[0].push(x/this._vf.implicitMeshSize.x, y/this._vf.implicitMeshSize.y, 0);
						}
					}
					
					this._mesh._invalidate = true;
					this._mesh._numFaces = this._mesh._indices[0].length / 3;
					this._mesh._numCoords = this._mesh._positions[0].length / 3;

					x3dom.geoCache[geoCacheID] = this._mesh;
				}
			}

            this._dirty = {
                coord: true,
                normal: true,
                texCoord: true,
                color: true,
                index: true
            };
		},
		{
			nodeChanged: function()
            {		
				Array.forEach(this._parentNodes, function (node) {
                    node._dirty.positions = true;
					node._dirty.normals = true;
					node._dirty.texcoords = true;
                    node._dirty.colors = true;
				});
			},

            fieldChanged: function(fieldName)
            {
                if (fieldName == "coord" || fieldName == "normal" ||
                    fieldName == "texCoord" || fieldName == "color" ||
                    fieldName == "index") {
                    this._dirty[fieldName] = true;
                }
            },
			
			getMin: function()
			{
				return this._vf.position.subtract( this._vf.size.multiply(0.5) );
			},
			
			getMax: function()
			{
				return this._vf.position.add( this._vf.size.multiply(0.5) );
			},
			
			getVolume: function(min, max, invalidate)
			{
				min.setValues(this.getMin());
				max.setValues(this.getMax());
				
				return true;
			},
			
			getCenter: function()
			{
				return this._vf.position;
			},
			
			numCoordinateTextures: function()
			{
				return this._cf.coord.nodes.length;
			},
			
			getIndexTexture: function()
            {
                if(this._cf.index.node) {
					this._cf.index.node._type = "IG_index";
                    return this._cf.index.node;
                } else {
                    return null;
                }
            },
			
			getIndexTextureURL: function()
            {
                if(this._cf.index.node) {
                    return this._cf.index.node._vf.url;
                } else {
                    return null;
                }
            },
			
			getCoordinateTexture: function(pos)
            {
                if(this._cf.coord.nodes[pos]) {
					this._cf.coord.nodes[pos]._type = "IG_coords" + pos;
                    return this._cf.coord.nodes[pos];
                } else {
                    return null;
                }
            },
			
			getCoordinateTextureURL: function(pos)
            {
                if(this._cf.coord.nodes[pos]) {
                    return this._cf.coord.nodes[pos]._vf.url;
                } else {
                    return null;
                }
            },
			
			getCoordinateTextureURLs: function()
            {
                var urls = [];
				for(var i=0; i<this._cf.coord.nodes.length; i++)
				{
					urls.push(this._cf.coord.nodes[i]._vf.url);
				}
                return urls;
            },

            getNormalTexture: function()
            {
                if(this._cf.normal.node) {
					this._cf.normal.node._type = "IG_normals";
                    return this._cf.normal.node;
                } else {
                    return null;
                }
            },
			
			getNormalTextureURL: function()
            {
                if(this._cf.normal.node) {
                    return this._cf.normal.node._vf.url;
                } else {
                    return null;
                }
            },

            getTexCoordTexture: function()
            {
                if(this._cf.texCoord.node) {
					this._cf.texCoord.node._type = "IG_texCoords";
                    return this._cf.texCoord.node;
                } else {
                    return null;
                }
            },
			
			getTexCoordTextureURL: function()
            {
                if(this._cf.texCoord.node) {
                    return this._cf.texCoord.node._vf.url;
                } else {
                    return null;
                }
            },
			
			getColorTexture: function()
            {
                if(this._cf.color.node) {
					this._cf.color.node._type = "IG_colors";
                    return this._cf.color.node;
                } else {
                    return null;
                }
            },
			
			getColorTextureURL: function()
            {
                if(this._cf.color.node) {
                    return this._cf.color.node._vf.url;
                } else {
                    return null;
                }
			},
			
			getTextures: function()
			{
				var textures = [];
				
				var index = this.getIndexTexture();
				if(index) textures.push(index);
				
				for(i=0; i<this.numCoordinateTextures(); i++) {
					var coord = this.getCoordinateTexture(i);
					if(coord) textures.push(coord);
				}
				
				var normal = this.getNormalTexture();
				if(normal) textures.push(normal);
				
				var texCoord = this.getTexCoordTexture();
				if(texCoord) textures.push(texCoord);
				
				var color = this.getColorTexture();
				if(color) textures.push(color);
				
				return textures;
			}
		}
	)
);

/* ### IndexedFaceSet ### */
x3dom.registerNodeType(
    "IndexedFaceSet",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DComposedGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.IndexedFaceSet.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'creaseAngle', 0);   // TODO

            this.addField_MFInt32(ctx, 'coordIndex', []);
            this.addField_MFInt32(ctx, 'normalIndex', []);
            this.addField_MFInt32(ctx, 'colorIndex', []);
            this.addField_MFInt32(ctx, 'texCoordIndex', []);
			this.addField_SFBool(ctx, 'convex', true);
        },
        {
            nodeChanged: function()
            {
                var time0 = new Date().getTime();

                this.handleAttribs();

                var indexes = this._vf.coordIndex;
                var normalInd = this._vf.normalIndex;
                var texCoordInd = this._vf.texCoordIndex;
                var colorInd = this._vf.colorIndex;

                var hasNormal = false, hasNormalInd = false;
                var hasTexCoord = false, hasTexCoordInd = false;
                var hasColor = false, hasColorInd = false;

                var colPerVert = this._vf.colorPerVertex;
                var normPerVert = this._vf.normalPerVertex;

                if (normalInd.length > 0)
                {
                    hasNormalInd = true;
                }
                if (texCoordInd.length > 0)
                {
                    hasTexCoordInd = true;
                }
                if (colorInd.length > 0)
                {
                    hasColorInd = true;
                }

                var positions, normals, texCoords, colors;

                var coordNode = this._cf.coord.node;
                x3dom.debug.assert(coordNode);
                positions = coordNode.getPoints();

                var normalNode = this._cf.normal.node;
                if (normalNode)
                {
                    hasNormal = true;
                    normals = normalNode._vf.vector;
                }
                else {
                    hasNormal = false;
                }

                var texMode = "", numTexComponents = 2;
                var texCoordNode = this._cf.texCoord.node;
                if (x3dom.isa(texCoordNode, x3dom.nodeTypes.MultiTextureCoordinate)) {
                    if (texCoordNode._cf.texCoord.nodes.length)
                        texCoordNode = texCoordNode._cf.texCoord.nodes[0];
                }
                if (texCoordNode)
                {
                    if (texCoordNode._vf.point) {
                        hasTexCoord = true;
                        texCoords = texCoordNode._vf.point;

                        if (x3dom.isa(texCoordNode, x3dom.nodeTypes.TextureCoordinate3D)) {
                            numTexComponents = 3;
                        }
                    }
                    else if (texCoordNode._vf.mode) {
                        texMode = texCoordNode._vf.mode;
                    }
                }
                else {
                    hasTexCoord = false;
                }
                this._mesh._numTexComponents = numTexComponents;

                var numColComponents = 3;
                var colorNode = this._cf.color.node;
                if (colorNode)
                {
                    hasColor = true;
                    colors = colorNode._vf.color;

                    if (x3dom.isa(colorNode, x3dom.nodeTypes.ColorRGBA)) {
                        numColComponents = 4;
                    }
                }
                else {
                    hasColor = false;
                }
                this._mesh._numColComponents = numColComponents;

                this._mesh._indices[0] = [];
                this._mesh._positions[0] = [];
                this._mesh._normals[0] = [];
                this._mesh._texCoords[0] = [];
                this._mesh._colors[0] = [];
                
                var i, t, cnt, faceCnt;
                var p0, p1, p2, n0, n1, n2, t0, t1, t2, c0, c1, c2;

                if ( (this._vf.creaseAngle <= x3dom.fields.Eps) ||  // FIXME; what to do for ipols?
                     (positions.length > 65535) ||
                     (hasNormal && hasNormalInd) ||
                     (hasTexCoord && hasTexCoordInd) ||
                     (hasColor && hasColorInd) )
                {
                    if (this._vf.creaseAngle <= x3dom.fields.Eps)
                        x3dom.debug.logWarning('Fallback to inefficient multi-index mode since creaseAngle=0.');
                    
                    // Found MultiIndex Mesh
					if(this._vf.convex) {
						t = 0;
						cnt = 0;
						faceCnt = 0;
						this._mesh._multiIndIndices = [];
						this._mesh._posSize = positions.length;
						
						for (i=0; i < indexes.length; ++i)
						{
							// Convert non-triangular polygons to a triangle fan
							// (TODO: this assumes polygons are convex)
							if (indexes[i] == -1) {
								t = 0;
								faceCnt++;
								continue;
							}
	
							if (hasNormalInd) {
								x3dom.debug.assert(normalInd[i] != -1);
							}
							if (hasTexCoordInd) {
								x3dom.debug.assert(texCoordInd[i] != -1);
							}
							if (hasColorInd) {
								x3dom.debug.assert(colorInd[i] != -1);
							}
	
							//TODO: OPTIMIZE but think about cache coherence regarding arrays!!!
							switch (t)
							{
								case 0:
									p0 = +indexes[i];
									if (hasNormalInd && normPerVert) { n0 = +normalInd[i]; }
									else if (hasNormalInd && !normPerVert) { n0 = +normalInd[faceCnt]; }
									else { n0 = p0; }
									if (hasTexCoordInd) { t0 = +texCoordInd[i]; }
									else { t0 = p0; }
									if (hasColorInd && colPerVert) { c0 = +colorInd[i]; }
									else if (hasColorInd && !colPerVert) { c0 = +colorInd[faceCnt]; }
									else { c0 = p0; }
									t = 1;
								break;
								case 1:
									p1 = +indexes[i];
									if (hasNormalInd && normPerVert) { n1 = +normalInd[i]; }
									else if (hasNormalInd && !normPerVert) { n1 = +normalInd[faceCnt]; }
									else { n1 = p1; }
									if (hasTexCoordInd) { t1 = +texCoordInd[i]; }
									else { t1 = p1; }
									if (hasColorInd && colPerVert) { c1 = +colorInd[i]; }
									else if (hasColorInd && !colPerVert) { c1 = +colorInd[faceCnt]; }
									else { c1 = p1; }
									t = 2;
								break;
								case 2:
									p2 = +indexes[i];
									if (hasNormalInd && normPerVert) { n2 = +normalInd[i]; }
									else if (hasNormalInd && !normPerVert) { n2 = +normalInd[faceCnt]; }
									else { n2 = p2; }
									if (hasTexCoordInd) { t2 = +texCoordInd[i]; }
									else { t2 = p2; }
									if (hasColorInd && colPerVert) { c2 = +colorInd[i]; }
									else if (hasColorInd && !colPerVert) { c2 = +colorInd[faceCnt]; }
									else { c2 = p2; }
									t = 3;
	
									this._mesh._indices[0].push(cnt++, cnt++, cnt++);
	
									this._mesh._positions[0].push(positions[p0].x);
									this._mesh._positions[0].push(positions[p0].y);
									this._mesh._positions[0].push(positions[p0].z);
									this._mesh._positions[0].push(positions[p1].x);
									this._mesh._positions[0].push(positions[p1].y);
									this._mesh._positions[0].push(positions[p1].z);
									this._mesh._positions[0].push(positions[p2].x);
									this._mesh._positions[0].push(positions[p2].y);
									this._mesh._positions[0].push(positions[p2].z);
	
									if (hasNormal) {
										this._mesh._normals[0].push(normals[n0].x);
										this._mesh._normals[0].push(normals[n0].y);
										this._mesh._normals[0].push(normals[n0].z);
										this._mesh._normals[0].push(normals[n1].x);
										this._mesh._normals[0].push(normals[n1].y);
										this._mesh._normals[0].push(normals[n1].z);
										this._mesh._normals[0].push(normals[n2].x);
										this._mesh._normals[0].push(normals[n2].y);
										this._mesh._normals[0].push(normals[n2].z);
									}
									else {
										this._mesh._multiIndIndices.push(p0, p1, p2);
										//this._mesh._multiIndIndices.push(cnt-3, cnt-2, cnt-1);
									}
	
									if (hasColor) {
										this._mesh._colors[0].push(colors[c0].r);
										this._mesh._colors[0].push(colors[c0].g);
										this._mesh._colors[0].push(colors[c0].b);
										if (numColComponents === 4) {
											this._mesh._colors[0].push(colors[c0].a);
										}
										this._mesh._colors[0].push(colors[c1].r);
										this._mesh._colors[0].push(colors[c1].g);
										this._mesh._colors[0].push(colors[c1].b);
										if (numColComponents === 4) {
											this._mesh._colors[0].push(colors[c1].a);
										}
										this._mesh._colors[0].push(colors[c2].r);
										this._mesh._colors[0].push(colors[c2].g);
										this._mesh._colors[0].push(colors[c2].b);
										if (numColComponents === 4) {
											this._mesh._colors[0].push(colors[c2].a);
										}
									}
	
									if (hasTexCoord) {
										this._mesh._texCoords[0].push(texCoords[t0].x);
										this._mesh._texCoords[0].push(texCoords[t0].y);
										if (numTexComponents === 3) {
											this._mesh._texCoords[0].push(texCoords[t0].z);
										}
										this._mesh._texCoords[0].push(texCoords[t1].x);
										this._mesh._texCoords[0].push(texCoords[t1].y);
										if (numTexComponents === 3) {
											this._mesh._texCoords[0].push(texCoords[t1].z);
										}
										this._mesh._texCoords[0].push(texCoords[t2].x);
										this._mesh._texCoords[0].push(texCoords[t2].y);
										if (numTexComponents === 3) {
											this._mesh._texCoords[0].push(texCoords[t2].z);
										}
									}
	
									//faceCnt++;
								break;
								case 3:
									p1 = p2;
									t1 = t2;
									if (normPerVert) {
										n1 = n2;
									}
									if (colPerVert) {
										c1 = c2;
									}
									p2 = +indexes[i];
	
									if (hasNormalInd && normPerVert) {
										n2 = +normalInd[i];
									} else if (hasNormalInd && !normPerVert) {
										/*n2 = +normalInd[faceCnt];*/
									} else {
										n2 = p2;
									}
	
									if (hasTexCoordInd) {
										t2 = +texCoordInd[i];
									} else {
										t2 = p2;
									}
	
									if (hasColorInd && colPerVert) {
										c2 = +colorInd[i];
									} else if (hasColorInd && !colPerVert) {
										/*c2 = +colorInd[faceCnt];*/
									} else {
										c2 = p2;
									}
	
									this._mesh._indices[0].push(cnt++, cnt++, cnt++);
	
									this._mesh._positions[0].push(positions[p0].x);
									this._mesh._positions[0].push(positions[p0].y);
									this._mesh._positions[0].push(positions[p0].z);
									this._mesh._positions[0].push(positions[p1].x);
									this._mesh._positions[0].push(positions[p1].y);
									this._mesh._positions[0].push(positions[p1].z);
									this._mesh._positions[0].push(positions[p2].x);
									this._mesh._positions[0].push(positions[p2].y);
									this._mesh._positions[0].push(positions[p2].z);
	
									if (hasNormal) {
										this._mesh._normals[0].push(normals[n0].x);
										this._mesh._normals[0].push(normals[n0].y);
										this._mesh._normals[0].push(normals[n0].z);
										this._mesh._normals[0].push(normals[n1].x);
										this._mesh._normals[0].push(normals[n1].y);
										this._mesh._normals[0].push(normals[n1].z);
										this._mesh._normals[0].push(normals[n2].x);
										this._mesh._normals[0].push(normals[n2].y);
										this._mesh._normals[0].push(normals[n2].z);
									}
									else {
										this._mesh._multiIndIndices.push(p0, p1, p2);
										//this._mesh._multiIndIndices.push(cnt-3, cnt-2, cnt-1);
									}
	
									if (hasColor) {
										this._mesh._colors[0].push(colors[c0].r);
										this._mesh._colors[0].push(colors[c0].g);
										this._mesh._colors[0].push(colors[c0].b);
										if (numColComponents === 4) {
											this._mesh._colors[0].push(colors[c0].a);
										}
										this._mesh._colors[0].push(colors[c1].r);
										this._mesh._colors[0].push(colors[c1].g);
										this._mesh._colors[0].push(colors[c1].b);
										if (numColComponents === 4) {
											this._mesh._colors[0].push(colors[c1].a);
										}
										this._mesh._colors[0].push(colors[c2].r);
										this._mesh._colors[0].push(colors[c2].g);
										this._mesh._colors[0].push(colors[c2].b);
										if (numColComponents === 4) {
											this._mesh._colors[0].push(colors[c2].a);
										}
									}
	
									if (hasTexCoord) {
										this._mesh._texCoords[0].push(texCoords[t0].x);
										this._mesh._texCoords[0].push(texCoords[t0].y);
										if (numTexComponents === 3) {
											this._mesh._texCoords[0].push(texCoords[t0].z);
										}
										this._mesh._texCoords[0].push(texCoords[t1].x);
										this._mesh._texCoords[0].push(texCoords[t1].y);
										if (numTexComponents === 3) {
											this._mesh._texCoords[0].push(texCoords[t1].z);
										}
										this._mesh._texCoords[0].push(texCoords[t2].x);
										this._mesh._texCoords[0].push(texCoords[t2].y);
										if (numTexComponents === 3) {
											this._mesh._texCoords[0].push(texCoords[t2].z);
										}
									}
	
									//faceCnt++;
								break;
								default:
							}
						}
					} 
					else {
						var linklist = new x3dom.DoublyLinkedList();
						var data = new Object();
						cnt = 0, faceCnt = 0;
												
						for (var i = 0; i < indexes.length; ++i)
						{	
							if (indexes[i] == -1) {
								var multi_index_data = x3dom.EarClipping.getMultiIndexes(linklist);
								
								for (var j = 0; j < multi_index_data.indices.length; j++)
								{	
									this._mesh._indices[0].push(cnt);
									cnt++;
									
									this._mesh._positions[0].push(multi_index_data.point[j].x,
																  multi_index_data.point[j].y,
																  multi_index_data.point[j].z);
									if (hasNormal) { 
										this._mesh._normals[0].push(multi_index_data.normals[j].x,
																	multi_index_data.normals[j].y,
																	multi_index_data.normals[j].z);
									}
									if (hasColor) { 
										this._mesh._colors[0].push(multi_index_data.colors[j].r, 
																   multi_index_data.colors[j].g, 
																   multi_index_data.colors[j].b);
										if (numColComponents === 4) {
											this._mesh._colors[0].push(multi_index_data.colors[j].a);
										}
									} 
									if (hasTexCoord) {	
										this._mesh._texCoords[0].push(multi_index_data.texCoords[j].x,
																	  multi_index_data.texCoords[j].y);
										if (numTexComponents === 3) {
											this._mesh._texCoords[0].push(multi_index_data.texCoords[j].z);
										}
									}
								}
									
								linklist = new x3dom.DoublyLinkedList();
								faceCnt++;
								continue;
							}
										
							if (hasNormal) {
								if (hasNormalInd && normPerVert) {
									data.normals =  normals[normalInd[i]];	
								} else if (hasNormalInd && !normPerVert) {
									data.normals =  normals[normalInd[faceCnt]];
								} else {
									data.normals =  normals[indexes[i]];
								}		
							}
							
							if (hasColor) {
								if (hasColorInd && colPerVert) {
									data.colors =  colors[colorInd[i]];
								} else if (hasColorInd && !colPerVert) {
									data.colors =  colors[colorInd[faceCnt]];
								} else if (colPerVert) {
									data.colors =  colors[indexes[i]];
								} else {
									data.colors =  colors[faceCnt];
								}
							}
							if (hasTexCoord) {
								if (hasTexCoordInd) {
									data.texCoords =  texCoords[texCoordInd[i]];
								} else {
									data.texCoords =  texCoords[indexes[i]];
								}			
							}
							
							linklist.appendNode(new x3dom.DoublyLinkedList.ListNode(
							    positions[indexes[i]], indexes[i], data.normals, data.colors, data.texCoords));						
						}		
					}
					
					if (!hasNormal) {
						this._mesh.calcNormals(this._vf.creaseAngle);
					}
					if (!hasTexCoord) {
						this._mesh.calcTexCoords(texMode);
					}
	
					this._mesh.splitMesh();
                } // if isMulti
                else
                {
                    t = 0;
                    if(this._vf.convex) {
						for (i = 0; i < indexes.length; ++i)
						{
							// Convert non-triangular polygons to a triangle fan
							
							if (indexes[i] == -1) {
								t = 0;
								continue;
							}
							
							switch (t) {
							case 0: n0 = +indexes[i]; t = 1; break;
							case 1: n1 = +indexes[i]; t = 2; break;
							case 2: n2 = +indexes[i]; t = 3; this._mesh._indices[0].push(n0, n1, n2); break;
							case 3: n1 = n2; n2 = +indexes[i]; this._mesh._indices[0].push(n0, n1, n2); break;
							}

						}
					} else {
						//  Convert non-triangular convex polygons to a triangle fan					
						var linklist = new x3dom.DoublyLinkedList();					
						for (var i = 0; i < indexes.length; ++i)
						{
							if (indexes[i] == -1) {
								var linklist_indces = x3dom.EarClipping.getIndexes(linklist);
															
								for (var j = 0; j < linklist_indces.length; j++) {
									this._mesh._indices[0].push(linklist_indces[j]);
								}
								linklist = new x3dom.DoublyLinkedList();
							continue;
							}
							
							linklist.appendNode(new x3dom.DoublyLinkedList.ListNode(positions[indexes[i]], indexes[i]));
						}								
					}
                   
                    this._mesh._positions[0] = positions.toGL();
	
                    if (hasNormal) {
                        this._mesh._normals[0] = normals.toGL();
                    }
                    else {
                        this._mesh.calcNormals(this._vf.creaseAngle);
                    }
                    if (hasTexCoord) {
                        this._mesh._texCoords[0] = texCoords.toGL();
                        this._mesh._numTexComponents = numTexComponents;
                    }
                    else {
                        this._mesh.calcTexCoords(texMode);
                    }
                    if (hasColor) {
                        this._mesh._colors[0] = colors.toGL();
                        this._mesh._numColComponents = numColComponents;
                    }
                }

                this._mesh._invalidate = true;
                this._mesh._numFaces = 0;
                this._mesh._numCoords = 0;
                for (i=0; i<this._mesh._indices.length; i++) {
                    this._mesh._numFaces += this._mesh._indices[i].length / 3;
                    this._mesh._numCoords += this._mesh._positions[i].length / 3;
                }

                var time1 = new Date().getTime() - time0;
                //x3dom.debug.logInfo("Mesh load time: " + time1 + " ms");
            },

            fieldChanged: function(fieldName)
            {
                if (fieldName != "coord" && fieldName != "normal" &&
    				fieldName != "texCoord" && fieldName != "color")
    			{
    			    x3dom.debug.logWarning("IndexedFaceSet: fieldChanged for " +
    			                           fieldName + " not yet implemented!");
    			    return;
    			}
                
                var pnts = this._cf.coord.node._vf.point;
                var n = pnts.length;
                
                var texCoordNode = this._cf.texCoord.node;
                if (x3dom.isa(texCoordNode, x3dom.nodeTypes.MultiTextureCoordinate)) {
                    if (texCoordNode._cf.texCoord.nodes.length)
                        texCoordNode = texCoordNode._cf.texCoord.nodes[0];
                }
                
                if ((this._vf.creaseAngle <= x3dom.fields.Eps) || (n > 65535) ||
                    (this._vf.normalIndex.length > 0 && this._cf.normal.node) ||
                    (this._vf.texCoordIndex.length > 0 && texCoordNode) ||
                    (this._vf.colorIndex.length > 0 && this._cf.color.node))
                {
					this._mesh._positions[0] = [];
					this._mesh._indices[0] =[];
					this._mesh._normals[0] = [];
					this._mesh._texCoords[0] =[];
					this._mesh._colors[0] = [];
					
					var indexes = this._vf.coordIndex;
					var normalInd = this._vf.normalIndex;
					var texCoordInd = this._vf.texCoordIndex;
					var colorInd = this._vf.colorIndex;
					var hasNormal = false, hasNormalInd = false;
					var hasTexCoord = false, hasTexCoordInd = false;
					var hasColor = false, hasColorInd = false;

					var colPerVert = this._vf.colorPerVertex;
					var normPerVert = this._vf.normalPerVertex;

					if (normalInd.length > 0)
					{
						hasNormalInd = true;
					}
					if (texCoordInd.length > 0)
					{
						hasTexCoordInd = true;
					}
					if (colorInd.length > 0)
					{
						hasColorInd = true;
					}

					var positions, normals, texCoords, colors;

					var coordNode = this._cf.coord.node;
					x3dom.debug.assert(coordNode);
					positions = coordNode.getPoints();

					var normalNode = this._cf.normal.node;
					if (normalNode)
					{
						hasNormal = true;
						normals = normalNode._vf.vector;
					}
					else {
						hasNormal = false;
					}

					var texMode = "", numTexComponents = 2;
                    var texCoordNode = this._cf.texCoord.node;
                    if (x3dom.isa(texCoordNode, x3dom.nodeTypes.MultiTextureCoordinate)) {
                        if (texCoordNode._cf.texCoord.nodes.length)
                            texCoordNode = texCoordNode._cf.texCoord.nodes[0];
                    }
					if (texCoordNode)
					{
						if (texCoordNode._vf.point) {
							hasTexCoord = true;
							texCoords = texCoordNode._vf.point;

							if (x3dom.isa(texCoordNode, x3dom.nodeTypes.TextureCoordinate3D)) {
								numTexComponents = 3;
							}
						}
						else if (texCoordNode._vf.mode) {
							texMode = texCoordNode._vf.mode;
						}
					}
					else {
						hasTexCoord = false;
					}
					this._mesh._numTexComponents = numTexComponents;

					var numColComponents = 3;
					var colorNode = this._cf.color.node;
					if (colorNode)
					{
						hasColor = true;
						colors = colorNode._vf.color;

						if (x3dom.isa(colorNode, x3dom.nodeTypes.ColorRGBA)) {
							numColComponents = 4;
						}
					}
					else {
						hasColor = false;
					}
					this._mesh._numColComponents = numColComponents;


					var i, t, cnt, faceCnt;
					var p0, p1, p2, n0, n1, n2, t0, t1, t2, c0, c1, c2;
					
					if(this._vf.convex) {
						t = 0;
						cnt = 0;
						faceCnt = 0;
						this._mesh._multiIndIndices = [];
						this._mesh._posSize = positions.length;

						for (i=0; i < indexes.length; ++i)
						{
							if (indexes[i] == -1) {
								t = 0;
								faceCnt++;
								continue;
							}

							if (hasNormalInd) {
								x3dom.debug.assert(normalInd[i] != -1);
							}
							if (hasTexCoordInd) {
								x3dom.debug.assert(texCoordInd[i] != -1);
							}
							if (hasColorInd) {
								x3dom.debug.assert(colorInd[i] != -1);
							}

							switch (t)
							{
								case 0:
									p0 = +indexes[i];
									if (hasNormalInd && normPerVert) { n0 = +normalInd[i]; }
									else if (hasNormalInd && !normPerVert) { n0 = +normalInd[faceCnt]; }
									else { n0 = p0; }
									if (hasTexCoordInd) { t0 = +texCoordInd[i]; }
									else { t0 = p0; }
									if (hasColorInd && colPerVert) { c0 = +colorInd[i]; }
									else if (hasColorInd && !colPerVert) { c0 = +colorInd[faceCnt]; }
									else { c0 = p0; }
									t = 1;
								break;
								case 1:
									p1 = +indexes[i];
									if (hasNormalInd && normPerVert) { n1 = +normalInd[i]; }
									else if (hasNormalInd && !normPerVert) { n1 = +normalInd[faceCnt]; }
									else { n1 = p1; }
									if (hasTexCoordInd) { t1 = +texCoordInd[i]; }
									else { t1 = p1; }
									if (hasColorInd && colPerVert) { c1 = +colorInd[i]; }
									else if (hasColorInd && !colPerVert) { c1 = +colorInd[faceCnt]; }
									else { c1 = p1; }
									t = 2;
								break;
								case 2:
									p2 = +indexes[i];
									if (hasNormalInd && normPerVert) { n2 = +normalInd[i]; }
									else if (hasNormalInd && !normPerVert) { n2 = +normalInd[faceCnt]; }
									else { n2 = p2; }
									if (hasTexCoordInd) { t2 = +texCoordInd[i]; }
									else { t2 = p2; }
									if (hasColorInd && colPerVert) { c2 = +colorInd[i]; }
									else if (hasColorInd && !colPerVert) { c2 = +colorInd[faceCnt]; }
									else { c2 = p2; }
									t = 3;

									this._mesh._indices[0].push(cnt++, cnt++, cnt++);

									this._mesh._positions[0].push(positions[p0].x);
									this._mesh._positions[0].push(positions[p0].y);
									this._mesh._positions[0].push(positions[p0].z);
									this._mesh._positions[0].push(positions[p1].x);
									this._mesh._positions[0].push(positions[p1].y);
									this._mesh._positions[0].push(positions[p1].z);
									this._mesh._positions[0].push(positions[p2].x);
									this._mesh._positions[0].push(positions[p2].y);
									this._mesh._positions[0].push(positions[p2].z);

									if (hasNormal) {
										this._mesh._normals[0].push(normals[n0].x);
										this._mesh._normals[0].push(normals[n0].y);
										this._mesh._normals[0].push(normals[n0].z);
										this._mesh._normals[0].push(normals[n1].x);
										this._mesh._normals[0].push(normals[n1].y);
										this._mesh._normals[0].push(normals[n1].z);
										this._mesh._normals[0].push(normals[n2].x);
										this._mesh._normals[0].push(normals[n2].y);
										this._mesh._normals[0].push(normals[n2].z);
									}
									else {
										this._mesh._multiIndIndices.push(p0, p1, p2);
									}

									if (hasColor) {
										this._mesh._colors[0].push(colors[c0].r);
										this._mesh._colors[0].push(colors[c0].g);
										this._mesh._colors[0].push(colors[c0].b);
										if (numColComponents === 4) {
											this._mesh._colors[0].push(colors[c0].a);
										}
										this._mesh._colors[0].push(colors[c1].r);
										this._mesh._colors[0].push(colors[c1].g);
										this._mesh._colors[0].push(colors[c1].b);
										if (numColComponents === 4) {
											this._mesh._colors[0].push(colors[c1].a);
										}
										this._mesh._colors[0].push(colors[c2].r);
										this._mesh._colors[0].push(colors[c2].g);
										this._mesh._colors[0].push(colors[c2].b);
										if (numColComponents === 4) {
											this._mesh._colors[0].push(colors[c2].a);
										}
									}

									if (hasTexCoord) {
										this._mesh._texCoords[0].push(texCoords[t0].x);
										this._mesh._texCoords[0].push(texCoords[t0].y);
										if (numTexComponents === 3) {
											this._mesh._texCoords[0].push(texCoords[t0].z);
										}
										this._mesh._texCoords[0].push(texCoords[t1].x);
										this._mesh._texCoords[0].push(texCoords[t1].y);
										if (numTexComponents === 3) {
											this._mesh._texCoords[0].push(texCoords[t1].z);
										}
										this._mesh._texCoords[0].push(texCoords[t2].x);
										this._mesh._texCoords[0].push(texCoords[t2].y);
										if (numTexComponents === 3) {
											this._mesh._texCoords[0].push(texCoords[t2].z);
										}
									}

									//faceCnt++;
								break;
								case 3:
									p1 = p2;
									t1 = t2;
									if (normPerVert) {
										n1 = n2;
									}
									if (colPerVert) {
										c1 = c2;
									}
									p2 = +indexes[i];

									if (hasNormalInd && normPerVert) {
										n2 = +normalInd[i];
									} else if (hasNormalInd && !normPerVert) {
										/*n2 = +normalInd[faceCnt];*/
									} else {
										n2 = p2;
									}

									if (hasTexCoordInd) {
										t2 = +texCoordInd[i];
									} else {
										t2 = p2;
									}

									if (hasColorInd && colPerVert) {
										c2 = +colorInd[i];
									} else if (hasColorInd && !colPerVert) {
										/*c2 = +colorInd[faceCnt];*/
									} else {
										c2 = p2;
									}

									this._mesh._indices[0].push(cnt++, cnt++, cnt++);

									this._mesh._positions[0].push(positions[p0].x);
									this._mesh._positions[0].push(positions[p0].y);
									this._mesh._positions[0].push(positions[p0].z);
									this._mesh._positions[0].push(positions[p1].x);
									this._mesh._positions[0].push(positions[p1].y);
									this._mesh._positions[0].push(positions[p1].z);
									this._mesh._positions[0].push(positions[p2].x);
									this._mesh._positions[0].push(positions[p2].y);
									this._mesh._positions[0].push(positions[p2].z);

									if (hasNormal) {
										this._mesh._normals[0].push(normals[n0].x);
										this._mesh._normals[0].push(normals[n0].y);
										this._mesh._normals[0].push(normals[n0].z);
										this._mesh._normals[0].push(normals[n1].x);
										this._mesh._normals[0].push(normals[n1].y);
										this._mesh._normals[0].push(normals[n1].z);
										this._mesh._normals[0].push(normals[n2].x);
										this._mesh._normals[0].push(normals[n2].y);
										this._mesh._normals[0].push(normals[n2].z);
									}
									else {
										this._mesh._multiIndIndices.push(p0, p1, p2);
										//this._mesh._multiIndIndices.push(cnt-3, cnt-2, cnt-1);
									}

									if (hasColor) {
										this._mesh._colors[0].push(colors[c0].r);
										this._mesh._colors[0].push(colors[c0].g);
										this._mesh._colors[0].push(colors[c0].b);
										if (numColComponents === 4) {
											this._mesh._colors[0].push(colors[c0].a);
										}
										this._mesh._colors[0].push(colors[c1].r);
										this._mesh._colors[0].push(colors[c1].g);
										this._mesh._colors[0].push(colors[c1].b);
										if (numColComponents === 4) {
											this._mesh._colors[0].push(colors[c1].a);
										}
										this._mesh._colors[0].push(colors[c2].r);
										this._mesh._colors[0].push(colors[c2].g);
										this._mesh._colors[0].push(colors[c2].b);
										if (numColComponents === 4) {
											this._mesh._colors[0].push(colors[c2].a);
										}
									}

									if (hasTexCoord) {
										this._mesh._texCoords[0].push(texCoords[t0].x);
										this._mesh._texCoords[0].push(texCoords[t0].y);
										if (numTexComponents === 3) {
											this._mesh._texCoords[0].push(texCoords[t0].z);
										}
										this._mesh._texCoords[0].push(texCoords[t1].x);
										this._mesh._texCoords[0].push(texCoords[t1].y);
										if (numTexComponents === 3) {
											this._mesh._texCoords[0].push(texCoords[t1].z);
										}
										this._mesh._texCoords[0].push(texCoords[t2].x);
										this._mesh._texCoords[0].push(texCoords[t2].y);
										if (numTexComponents === 3) {
											this._mesh._texCoords[0].push(texCoords[t2].z);
										}
									}

									//faceCnt++;
								break;
								default:
							}
						}
					} 
					else {
						var linklist = new x3dom.DoublyLinkedList();
						var data = new Object();
						cnt = 0, faceCnt = 0;
												
						for (var i = 0; i < indexes.length; ++i)
						{	
							if (indexes[i] == -1) {
								var multi_index_data = x3dom.EarClipping.getMultiIndexes(linklist);
								
								for (var j = 0; j < multi_index_data.indices.length; j++)
								{	
									this._mesh._indices[0].push(cnt);
									cnt++;
									
									this._mesh._positions[0].push(multi_index_data.point[j].x,
																  multi_index_data.point[j].y,
																  multi_index_data.point[j].z);
									if (hasNormal) { 
										this._mesh._normals[0].push(multi_index_data.normals[j].x,
																	multi_index_data.normals[j].y,
																	multi_index_data.normals[j].z);
									}
									if (hasColor) { 
										this._mesh._colors[0].push(multi_index_data.colors[j].r, 
																   multi_index_data.colors[j].g, 
																   multi_index_data.colors[j].b);
										if (numColComponents === 4) {
											this._mesh._colors[0].push(multi_index_data.colors[j].a);
										}
									} 
									if (hasTexCoord) {	
										this._mesh._texCoords[0].push(multi_index_data.texCoords[j].x,
																	  multi_index_data.texCoords[j].y);
										if (numTexComponents === 3) {
											this._mesh._texCoords[0].push(multi_index_data.texCoords[j].z);
										}
									}
								}
									
								linklist = new x3dom.DoublyLinkedList();
								faceCnt++;
								continue;
							}
										
							if (hasNormal) {
								if (hasNormalInd && normPerVert) {
									data.normals =  normals[normalInd[i]];	
								} else if (hasNormalInd && !normPerVert) {
									data.normals =  normals[normalInd[faceCnt]];
								} else {
									data.normals =  normals[indexes[i]];
								}		
							}
							
							if (hasColor) {
								if (hasColorInd && colPerVert) {
									data.colors =  colors[colorInd[i]];
								} else if (hasColorInd && !colPerVert) {
									data.colors =  colors[colorInd[faceCnt]];
								} else {
									data.colors =  colors[indexes[i]];
								}
							}
							if (hasTexCoord) {
								if (hasTexCoordInd) {
									data.texCoords =  texCoords[texCoordInd[i]];
								} else {
									data.texCoords =  texCoords[indexes[i]];
								}			
							}
							
							linklist.appendNode(new x3dom.DoublyLinkedList.ListNode(
								positions[indexes[i]], indexes[i], data.normals, data.colors, data.texCoords));						
						}		
					}

					if (!hasNormal) {
						this._mesh.calcNormals(this._vf.creaseAngle);
					}
					if (!hasTexCoord) {
						this._mesh.calcTexCoords(texMode);
					}

					this._mesh.splitMesh();
					
					this._mesh._invalidate = true;
					this._mesh._numFaces = 0;
					this._mesh._numCoords = 0;
					
					for (i=0; i<this._mesh._indices.length; i++) {
						this._mesh._numFaces += this._mesh._indices[i].length / 3;
						this._mesh._numCoords += this._mesh._positions[i].length / 3;
					}
	
					Array.forEach(this._parentNodes, function (node) {
						node.setGeoDirty();
					});	 
                } 
				else {

					if (fieldName == "coord")
					{
						this._mesh._positions[0] = pnts.toGL();
						
						// tells the mesh that its bbox requires update
						this._mesh._invalidate = true;

						Array.forEach(this._parentNodes, function (node) {					
							 node._dirty.positions = true;
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
					else if (fieldName == "normal")
					{
						pnts = this._cf.normal.node._vf.vector;
						
						this._mesh._normals[0] = pnts.toGL();
						
						Array.forEach(this._parentNodes, function (node) {
							 node._dirty.normals = true;
						});
					}
					else if (fieldName == "texCoord")
					{
                        var texCoordNode = this._cf.texCoord.node;
                        if (x3dom.isa(texCoordNode, x3dom.nodeTypes.MultiTextureCoordinate)) {
                            if (texCoordNode._cf.texCoord.nodes.length)
                                texCoordNode = texCoordNode._cf.texCoord.nodes[0];
                        }
						pnts = texCoordNode._vf.point;
						
						this._mesh._texCoords[0] = pnts.toGL();
						
						Array.forEach(this._parentNodes, function (node) {
							node._dirty.texcoords = true;
						});
					}
				}
            }
        }
    )
);

