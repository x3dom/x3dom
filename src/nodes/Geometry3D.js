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


/* ### X3DSpatialGeometryNode ### */
x3dom.registerNodeType(
    "X3DSpatialGeometryNode",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.X3DSpatialGeometryNode.superClass.call(this, ctx);   
        }
    )
);

/* ### Plane ### */
x3dom.registerNodeType(
    "Plane",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Plane.superClass.call(this, ctx);

            this.addField_SFVec2f(ctx, 'size', 2, 2);
            this.addField_SFVec2f(ctx, 'subdivision', 1, 1);
            this.addField_SFVec3f(ctx, 'center', 0, 0, 0);
            this.addField_MFString(ctx, 'primType', ['TRIANGLES']);

            var sx = this._vf.size.x, sy = this._vf.size.y;
            var subx = this._vf.subdivision.x, suby = this._vf.subdivision.y;

            var geoCacheID = 'Plane_' + sx + '-' + sy + '-' + subx + '-' + suby + '-' +
                             this._vf.center.x + '-' + this._vf.center.y + '-' + this._vf.center.z;

            // Attention: DynamicLOD node internally creates Plane nodes, but MUST NOT 
            //            use geoCache, therefore only use cache if "ctx" is defined!
            // TODO: move mesh generation of all primitives to nodeChanged()
            if (ctx && this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using Plane from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else {
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
             fieldChanged: function (fieldName) {
                 if (fieldName == "size" || fieldName == "center") {
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

                     this.invalidateVolume();
                     this._mesh._numCoords = this._mesh._positions[0].length / 3;

                     Array.forEach(this._parentNodes, function (node) {
                         node._dirty.positions = true;
                         node.invalidateVolume();
                     });
                 }
                 else if (fieldName == "subdivision") {
                     this._mesh._positions[0] = [];
                     this._mesh._indices[0] = [];
                     this._mesh._normals[0] = [];
                     this._mesh._texCoords[0] = [];

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

/* ### Box ### */
x3dom.registerNodeType(
    "Box",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
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

/* ### Sphere ### */
x3dom.registerNodeType(
    "Sphere",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Sphere.superClass.call(this, ctx);

            // sky box background creates sphere with r = 10000
			this.addField_SFFloat(ctx, 'radius', ctx ? 1 : 10000);
			this.addField_SFVec2f(ctx, 'subdivision', 24, 24);
			 
            var qfactor = 1.0;
			var r = this._vf.radius;
			var subx = this._vf.subdivision.x, suby = this._vf.subdivision.y;
			
			var geoCacheID = 'Sphere_' + r + '-' + subx + '-' + suby;

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

						u = 0.25 - (longNumber / longitudeBands);
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

                    this.invalidateVolume();
					this._mesh._numCoords = this._mesh._positions[0].length / 3;
				
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        node.invalidateVolume();
                    });
                }
                else if (fieldName === "subdivision") {
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
	
							u = 0.25 - (longNumber / longitudeBands);
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

/* ### Torus ### */
x3dom.registerNodeType(
    "Torus",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Torus.superClass.call(this, ctx);

            var twoPi = 2.0 * Math.PI;

			this.addField_SFFloat(ctx, 'innerRadius', 0.5);
			this.addField_SFFloat(ctx, 'outerRadius', 1.0);
            this.addField_SFFloat(ctx, 'angle', twoPi);
            this.addField_SFBool(ctx, 'caps', true);
			this.addField_SFVec2f(ctx, 'subdivision', 24, 24);
            this.addField_SFBool(ctx, 'insideOutsideRadius', false);    // use other radius/orientation behavior

            // assure that angle in [0, 2 * PI]
            if (this._vf.angle < 0)
                this._vf.angle = 0;
            else if (this._vf.angle > twoPi)
                this._vf.angle = twoPi;

            this._origCCW = this._vf.ccw;

            var innerRadius = this._vf.innerRadius;
            var outerRadius = this._vf.outerRadius;

            if (this._vf.insideOutsideRadius == true)
            {
                if (innerRadius > outerRadius) {
                    var tmp = innerRadius;
                    innerRadius = outerRadius;
                    outerRadius = tmp;
                }

                var rad = (outerRadius - innerRadius) / 2;

                outerRadius = innerRadius + rad;
                innerRadius = rad;

                // fix wrong face orientation in case of clockwise rotation
                this._vf.ccw = !this._origCCW;
            }

			var rings = this._vf.subdivision.x, sides = this._vf.subdivision.y;
            rings = Math.max(3, Math.round((this._vf.angle / twoPi) * rings));

            // FIXME; check/update geoCache on field update (for ALL primitives)!
			var geoCacheID = 'Torus_'+innerRadius+'_'+outerRadius+'_'+this._vf.angle+'_'+
                             this._vf.subdivision+'-'+this._vf.caps;

			if( this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined )
			{
				//x3dom.debug.logInfo("Using Torus from Cache");
				this._mesh = x3dom.geoCache[geoCacheID];
			}
			else
			{
				var ringDelta = this._vf.angle / rings;
				var sideDelta = twoPi / sides;
				var a, b, theta, phi;
                var cosTheta, sinTheta, cosPhi, sinPhi, dist;

				for (a=0, theta=0; a <= rings; a++, theta+=ringDelta)
				{
					cosTheta = Math.cos(theta);
                    sinTheta = Math.sin(theta);

					for (b=0, phi=0; b<=sides; b++, phi+=sideDelta)
					{
						cosPhi = Math.cos(phi);
						sinPhi = Math.sin(phi);
						dist = outerRadius + innerRadius * cosPhi;

                        if (this._vf.insideOutsideRadius) {
                            this._mesh._positions[0].push(cosTheta * dist, innerRadius * sinPhi, -sinTheta * dist);
                            this._mesh._normals[0].push(cosTheta * cosPhi, sinPhi, -sinTheta * cosPhi);
                        }
                        else {
                            this._mesh._positions[0].push(cosTheta * dist, -sinTheta * dist, innerRadius * sinPhi);
                            this._mesh._normals[0].push(cosTheta * cosPhi, -sinTheta * cosPhi, sinPhi);
                        }
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

                if (this._vf.angle < twoPi && this._vf.caps == true)
                {
                    // create first cap
                    var origPos = this._mesh._positions[0].length / 3;

                    if (this._vf.insideOutsideRadius) {
                        this._mesh._positions[0].push(outerRadius, 0, 0);
                        this._mesh._normals[0].push(0, 0, 1);
                    }
                    else {
                        this._mesh._positions[0].push(outerRadius, 0, 0);
                        this._mesh._normals[0].push(0, 1, 0);
                    }
                    this._mesh._texCoords[0].push(0.5, 0.5);

                    for (b=0, phi=0; b<=sides; b++, phi+=sideDelta)
                    {
                        cosPhi = Math.cos(phi);
                        sinPhi = Math.sin(phi);
                        dist = outerRadius + innerRadius * cosPhi;

                        if (this._vf.insideOutsideRadius) {
                            this._mesh._positions[0].push(dist, sinPhi * innerRadius, 0);
                            this._mesh._normals[0].push(0, 0, 1);
                        }
                        else {
                            this._mesh._positions[0].push(dist, 0, sinPhi * innerRadius);
                            this._mesh._normals[0].push(0, 1, 0);
                        }
                        this._mesh._texCoords[0].push((1 + cosPhi) * 0.5, (1 - sinPhi) * 0.5);

                        if (b > 0) {
                            this._mesh._indices[0].push(origPos);
                            this._mesh._indices[0].push(origPos + b);
                            this._mesh._indices[0].push(origPos + b - 1);
                        }
                        if (b == sides) {
                            this._mesh._indices[0].push(origPos);
                            this._mesh._indices[0].push(origPos + 1);
                            this._mesh._indices[0].push(origPos + b);
                        }
                    }

                    // second cap
                    cosTheta = Math.cos(this._vf.angle);
                    sinTheta = Math.sin(this._vf.angle);

                    origPos = this._mesh._positions[0].length / 3;
                    var nx = -sinTheta, ny = -cosTheta;

                    if (this._vf.insideOutsideRadius) {
                        this._mesh._positions[0].push(cosTheta * outerRadius, 0, -sinTheta * outerRadius);
                        this._mesh._normals[0].push(nx, 0, ny);
                    }
                    else {
                        this._mesh._positions[0].push(cosTheta * outerRadius, -sinTheta * outerRadius, 0);
                        this._mesh._normals[0].push(nx, ny, 0);
                    }
                    this._mesh._texCoords[0].push(0.5, 0.5);

                    for (b=0, phi=0; b<=sides; b++, phi+=sideDelta)
                    {
                        cosPhi = Math.cos(phi);
                        sinPhi = Math.sin(phi);
                        dist = outerRadius + innerRadius * cosPhi;

                        if (this._vf.insideOutsideRadius) {
                            this._mesh._positions[0].push(cosTheta * dist, sinPhi * innerRadius, -sinTheta * dist);
                            this._mesh._normals[0].push(nx, 0, ny);
                        }
                        else {
                            this._mesh._positions[0].push(cosTheta * dist, -sinTheta * dist, sinPhi * innerRadius);
                            this._mesh._normals[0].push(nx, ny, 0);
                        }
                        this._mesh._texCoords[0].push(1 - (1 + cosPhi) * 0.5, (1 - sinPhi) * 0.5);

                        if (b > 0) {
                            this._mesh._indices[0].push(origPos);
                            this._mesh._indices[0].push(origPos + b - 1);
                            this._mesh._indices[0].push(origPos + b);
                        }
                        if (b == sides) {
                            this._mesh._indices[0].push(origPos);
                            this._mesh._indices[0].push(origPos + b);
                            this._mesh._indices[0].push(origPos + 1);
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
            fieldChanged: function(fieldName)
            {
                // TODO; invalidate geometry cache if necessary (to be fixed for all primitives)!
                if (fieldName == "innerRadius" || fieldName == "outerRadius" ||
                    fieldName == "subdivision" || fieldName == "angle" ||
                    fieldName == "insideOutsideRadius" || fieldName == "caps")
                {
                    // assure that angle in [0, 2 * PI]
                    var twoPi = 2.0 * Math.PI;

                    if (this._vf.angle < 0)
                        this._vf.angle = 0;
                    else if (this._vf.angle > twoPi)
                        this._vf.angle = twoPi;

                    var innerRadius = this._vf.innerRadius;
                    var outerRadius = this._vf.outerRadius;

                    if (this._vf.insideOutsideRadius == true)
                    {
                        if (innerRadius > outerRadius) {
                            var tmp = innerRadius;
                            innerRadius = outerRadius;
                            outerRadius = tmp;
                        }

                        var rad = (outerRadius - innerRadius) / 2;

                        outerRadius = innerRadius + rad;
                        innerRadius = rad;

                        this._vf.ccw = !this._origCCW;
                    }
                    else
                        this._vf.ccw = this._origCCW;

                    var rings = this._vf.subdivision.x, sides = this._vf.subdivision.y;
                    rings = Math.max(3, Math.round((this._vf.angle / twoPi) * rings));

                    var ringDelta = this._vf.angle / rings;
                    var sideDelta = twoPi / sides;
                    var a, b, theta, phi;
                    var cosTheta, sinTheta, cosPhi, sinPhi, dist;

					this._mesh._positions[0] = [];
					this._mesh._normals[0]   = [];
					this._mesh._texCoords[0] = [];
                    this._mesh._indices[0]   = [];

					for (a=0, theta=0; a <= rings; a++, theta+=ringDelta)
					{
						cosTheta = Math.cos(theta);
						sinTheta = Math.sin(theta);
	
						for (b=0, phi=0; b<=sides; b++, phi+=sideDelta)
						{
							cosPhi = Math.cos(phi);
							sinPhi = Math.sin(phi);
							dist = outerRadius + innerRadius * cosPhi;

                            if (this._vf.insideOutsideRadius) {
                                this._mesh._positions[0].push(cosTheta * dist, innerRadius * sinPhi, -sinTheta * dist);
                                this._mesh._normals[0].push(cosTheta * cosPhi, sinPhi, -sinTheta * cosPhi);
                            }
                            else {
                                this._mesh._positions[0].push(cosTheta * dist, -sinTheta * dist, innerRadius * sinPhi);
                                this._mesh._normals[0].push(cosTheta * cosPhi, -sinTheta * cosPhi, sinPhi);
                            }
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

                    if (this._vf.angle < twoPi && this._vf.caps == true)
                    {
                        // create first cap
                        var origPos = this._mesh._positions[0].length / 3;

                        if (this._vf.insideOutsideRadius) {
                            this._mesh._positions[0].push(outerRadius, 0, 0);
                            this._mesh._normals[0].push(0, 0, 1);
                        }
                        else {
                            this._mesh._positions[0].push(outerRadius, 0, 0);
                            this._mesh._normals[0].push(0, 1, 0);
                        }
                        this._mesh._texCoords[0].push(0.5, 0.5);

                        for (b=0, phi=0; b<=sides; b++, phi+=sideDelta)
                        {
                            cosPhi = Math.cos(phi);
                            sinPhi = Math.sin(phi);
                            dist = outerRadius + innerRadius * cosPhi;

                            if (this._vf.insideOutsideRadius) {
                                this._mesh._positions[0].push(dist, sinPhi * innerRadius, 0);
                                this._mesh._normals[0].push(0, 0, 1);
                            }
                            else {
                                this._mesh._positions[0].push(dist, 0, sinPhi * innerRadius);
                                this._mesh._normals[0].push(0, 1, 0);
                            }
                            this._mesh._texCoords[0].push((1 + cosPhi) * 0.5, (1 - sinPhi) * 0.5);

                            if (b > 0) {
                                this._mesh._indices[0].push(origPos);
                                this._mesh._indices[0].push(origPos + b);
                                this._mesh._indices[0].push(origPos + b - 1);
                            }
                            if (b == sides) {
                                this._mesh._indices[0].push(origPos);
                                this._mesh._indices[0].push(origPos + 1);
                                this._mesh._indices[0].push(origPos + b);
                            }
                        }

                        // second cap
                        cosTheta = Math.cos(this._vf.angle);
                        sinTheta = Math.sin(this._vf.angle);

                        origPos = this._mesh._positions[0].length / 3;
                        var nx = -sinTheta, ny = -cosTheta;

                        if (this._vf.insideOutsideRadius) {
                            this._mesh._positions[0].push(cosTheta * outerRadius, 0, -sinTheta * outerRadius);
                            this._mesh._normals[0].push(nx, 0, ny);
                        }
                        else {
                            this._mesh._positions[0].push(cosTheta * outerRadius, -sinTheta * outerRadius, 0);
                            this._mesh._normals[0].push(nx, ny, 0);
                        }
                        this._mesh._texCoords[0].push(0.5, 0.5);

                        for (b=0, phi=0; b<=sides; b++, phi+=sideDelta)
                        {
                            cosPhi = Math.cos(phi);
                            sinPhi = Math.sin(phi);
                            dist = outerRadius + innerRadius * cosPhi;

                            if (this._vf.insideOutsideRadius) {
                                this._mesh._positions[0].push(cosTheta * dist, sinPhi * innerRadius, -sinTheta * dist);
                                this._mesh._normals[0].push(nx, 0, ny);
                            }
                            else {
                                this._mesh._positions[0].push(cosTheta * dist, -sinTheta * dist, sinPhi * innerRadius);
                                this._mesh._normals[0].push(nx, ny, 0);
                            }
                            this._mesh._texCoords[0].push(1 - (1 + cosPhi) * 0.5, (1 - sinPhi) * 0.5);

                            if (b > 0) {
                                this._mesh._indices[0].push(origPos);
                                this._mesh._indices[0].push(origPos + b - 1);
                                this._mesh._indices[0].push(origPos + b);
                            }
                            if (b == sides) {
                                this._mesh._indices[0].push(origPos);
                                this._mesh._indices[0].push(origPos + b);
                                this._mesh._indices[0].push(origPos + 1);
                            }
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

/* ### Cone ### */
x3dom.registerNodeType(
    "Cone",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Cone.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'bottomRadius', 1.0);
            this.addField_SFFloat(ctx, 'topRadius', 0);
            this.addField_SFFloat(ctx, 'height', 2.0);
            this.addField_SFBool(ctx, 'bottom', true);
            this.addField_SFBool(ctx, 'side', true);
            this.addField_SFBool(ctx, 'top', true);
            this.addField_SFFloat(ctx, 'subdivision', 32);

            var geoCacheID = 'Cone_' + this._vf.bottomRadius + '_' + this._vf.height + '_' + this._vf.top + '_' +
                             this._vf.bottom + '_' + this._vf.side + '_' + this._vf.topRadius + '_' + this._vf.subdivision;

            if (this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined) {
                //x3dom.debug.logInfo("Using Cone from Cache");
                this._mesh = x3dom.geoCache[geoCacheID];
            }
            else {
                var bottomRadius = this._vf.bottomRadius, height = this._vf.height;
                var topRadius = this._vf.topRadius, sides = this._vf.subdivision;

                var beta, x, z;
                var delta = 2.0 * Math.PI / sides;

                var incl = (bottomRadius - topRadius) / height;
                var nlen = 1.0 / Math.sqrt(1.0 + incl * incl);

                var j = 0, k = 0;
                var h, base;

                if (this._vf.side && height > 0) {
                    var px = 0, pz = 0;

                    for (j = 0, k = 0; j <= sides; j++) {
                        beta = j * delta;
                        x = Math.sin(beta);
                        z = -Math.cos(beta);

                        if (topRadius > x3dom.fields.Eps) {
                            px = x * topRadius;
                            pz = z * topRadius;
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

                if (this._vf.bottom && bottomRadius > 0) {
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

                if (this._vf.top && topRadius > x3dom.fields.Eps) {
                    base = this._mesh._positions[0].length / 3;

                    for (j = sides - 1; j >= 0; j--) {
                        beta = j * delta;
                        x =  topRadius * Math.sin(beta);
                        z = -topRadius * Math.cos(beta);

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

                this._mesh._invalidate = true;
                this._mesh._numFaces = this._mesh._indices[0].length / 3;
                this._mesh._numCoords = this._mesh._positions[0].length / 3;

                x3dom.geoCache[geoCacheID] = this._mesh;
            }
        },
        {
            fieldChanged: function (fieldName)
            {
                if (fieldName == "bottomRadius" || fieldName == "topRadius" ||
                    fieldName == "height" || fieldName == "subdivision" ||
                    fieldName == "bottom" || fieldName == "top" || fieldName == "side")
                {
                    this._mesh._positions[0] = [];
                    this._mesh._indices[0] = [];
                    this._mesh._normals[0] = [];
                    this._mesh._texCoords[0] = [];

                    var bottomRadius = this._vf.bottomRadius, height = this._vf.height;
                    var topRadius = this._vf.topRadius, sides = this._vf.subdivision;

                    var beta, x, z;
                    var delta = 2.0 * Math.PI / sides;

                    var incl = (bottomRadius - topRadius) / height;
                    var nlen = 1.0 / Math.sqrt(1.0 + incl * incl);

                    var j = 0, k = 0;
                    var h, base;

                    if (this._vf.side && height > 0)
                    {
                        var px = 0, pz = 0;

                        for (j = 0, k = 0; j <= sides; j++) {
                            beta = j * delta;
                            x = Math.sin(beta);
                            z = -Math.cos(beta);

                            if (topRadius > x3dom.fields.Eps) {
                                px = x * topRadius;
                                pz = z * topRadius;
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

                    if (this._vf.bottom && bottomRadius > 0)
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

                    if (this._vf.top && topRadius > x3dom.fields.Eps)
                    {
                        base = this._mesh._positions[0].length / 3;

                        for (j = sides - 1; j >= 0; j--) {
                            beta = j * delta;
                            x =  topRadius * Math.sin(beta);
                            z = -topRadius * Math.cos(beta);

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

/* ### Cylinder ### */
x3dom.registerNodeType(
    "Cylinder",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Cylinder.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'radius', 1.0);
            this.addField_SFFloat(ctx, 'height', 2.0);
            this.addField_SFBool(ctx, 'bottom', true);
            this.addField_SFBool(ctx, 'top', true);
            this.addField_SFFloat(ctx, 'subdivision', 32);
            this.addField_SFBool(ctx, 'side', true);
			
			var sides = this._vf.subdivision;

			var geoCacheID = 'Cylinder_'+this._vf.radius+'_'+this._vf.height+'_'+this._vf.bottom+'_'+this._vf.top+'_'+
                             this._vf.side+'_'+this._vf.subdivision;

			if( this._vf.useGeoCache && x3dom.geoCache[geoCacheID] !== undefined )
			{
				//x3dom.debug.logInfo("Using Cylinder from Cache");
				this._mesh = x3dom.geoCache[geoCacheID];
			}
			else
			{
				var radius = this._vf.radius;
				var height = this._vf.height / 2;

				var beta, x, z;
				var delta = 2.0 * Math.PI / sides;
				var j, k;

				if (this._vf.side)
				{
				  for (j=0, k=0; j<=sides; j++)
				  {
					beta = j * delta;
					x = Math.sin(beta);
					z = -Math.cos(beta);

					this._mesh._positions[0].push(x * radius, -height, z * radius);
					this._mesh._normals[0].push(x, 0, z);
					this._mesh._texCoords[0].push(1.0 - j / sides, 0);

					this._mesh._positions[0].push(x * radius, height, z * radius);
					this._mesh._normals[0].push(x, 0, z);
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

						this._mesh._positions[0].push(x, height, z);
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

						this._mesh._positions[0].push(x, -height, z);
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
                if (fieldName === "radius" || fieldName === "height")
                {
                    this._mesh._positions[0] = [];
					
					var radius = this._vf.radius, height = this._vf.height / 2;
					var sides = this._vf.subdivision;	
					
					var beta, x, z, j;
					var delta = 2.0 * Math.PI / sides;

					if (this._vf.side)
					{
					  for (j=0; j<=sides; j++)
					  {
						beta = j * delta;
						x = Math.sin(beta);
						z = -Math.cos(beta);
	
						this._mesh._positions[0].push(x * radius, -height, z * radius);
						this._mesh._positions[0].push(x * radius, height, z * radius);
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
	
							this._mesh._positions[0].push(x, height, z);
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
						
						this._mesh._positions[0].push(x, -height, z);
					  }
					}

                    this.invalidateVolume();
					this._mesh._numCoords = this._mesh._positions[0].length / 3;
				
                    Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                        node.invalidateVolume();
                    });
                }
                else if (fieldName === "subdivision" || fieldName === "bottom" ||
                         fieldName === "top" || fieldName === "side")
                {
					this._mesh._positions[0] = [];
					this._mesh._indices[0] =[];
					this._mesh._normals[0] = [];
					this._mesh._texCoords[0] =[];
					
					var radius = this._vf.radius, height = this._vf.height / 2;
					var sides = this._vf.subdivision;
					
					var beta, x, z, j;
					var delta = 2.0 * Math.PI / sides;
					var k = 0;

					if (this._vf.side)
					{
					  for (j=0, k=0; j<=sides; j++)
					  {
						beta = j * delta;
						x = Math.sin(beta);
						z = -Math.cos(beta);
	
						this._mesh._positions[0].push(x * radius, -height, z * radius);
						this._mesh._normals[0].push(x, 0, z);
						this._mesh._texCoords[0].push(1.0 - j / sides, 0);
	
						this._mesh._positions[0].push(x * radius, height, z * radius);
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
	
							this._mesh._positions[0].push(x, height, z);
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
	
							this._mesh._positions[0].push(x, -height, z);
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


/* ### X3DBinaryContainerGeometryNode ### */
x3dom.registerNodeType(
    "X3DBinaryContainerGeometryNode",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.X3DBinaryContainerGeometryNode.superClass.call(this, ctx);

            this.addField_SFVec3f(ctx, 'position', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'size', 1, 1, 1);
            this.addField_MFInt32(ctx, 'vertexCount', [0]);
            this.addField_MFString(ctx, 'primType', ['TRIANGLES']);

            // correct min/max of bounding volume set in BinaryContainerGeometry
            this._mesh._invalidate = false;
            this._mesh._numCoords = 0;
            this._mesh._numFaces = 0;

            this._diameter = this._vf.size.length();
        },
        {
            getMin: function() {
                var vol = this._mesh._vol;

                if (!vol.isValid()) {
                    vol.setBoundsByCenterSize(this._vf.position, this._vf.size);
                }

                return vol.min;
            },

            getMax: function() {
                var vol = this._mesh._vol;

                if (!vol.isValid()) {
                    vol.setBoundsByCenterSize(this._vf.position, this._vf.size);
                }

                return vol.max;
            },

            getVolume: function() {
                var vol = this._mesh._vol;

                if (!vol.isValid()) {
                    vol.setBoundsByCenterSize(this._vf.position, this._vf.size);
                }

                return vol;
            },

            invalidateVolume: function() {
                // at the moment, do nothing here since field updates are not impl.
            },

            getCenter: function() {
                return this._vf.position;
            },

            getDiameter: function() {
                return this._diameter;
            }
        }
    )
);

/* ### BinaryGeometry ### */
x3dom.registerNodeType(
    "BinaryGeometry",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DBinaryContainerGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.BinaryGeometry.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'index', "");   // Uint16
            this.addField_SFString(ctx, 'coord', "");   // Float32
            this.addField_SFString(ctx, 'normal', "");
            this.addField_SFString(ctx, 'texCoord', "");    // THINKABOUTME: add texCoord1, texCoord2, ...?
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
            this.addField_SFBool(ctx, 'idsPerVertex', false);    /// Experimental flag to decide if IDs are in texCoords
            
            // workaround
            this._hasStrideOffset = false;
            this._mesh._numPosComponents = this._vf.normalAsSphericalCoordinates ? 4 : 3;
			this._mesh._numTexComponents = this._vf.numTexCoordComponents;
			this._mesh._numColComponents = this._vf.rgbaColors ? 4 : 3;
			this._mesh._numNormComponents = this._vf.normalAsSphericalCoordinates ? 2 : 3;

		    // info helper members
		    this._vertexCountSum = 0;
		    for (var i=0; i<this._vf.vertexCount.length; ++i) {
                this._vertexCountSum += this._vf.vertexCount[i];
            }
        },
        {
            nodeChanged: function()
            {
                // TODO: handle field updates and retrigger XHR call
            },

            parentAdded: function(parent)
            {
                // TODO; also handle multiple shape parents!
                var offsetInd, strideInd, offset, stride;

                offsetInd = this._vf.coord.lastIndexOf('#');
                strideInd = this._vf.coord.lastIndexOf('+');
                if (offsetInd >= 0 && strideInd >= 0) {
                    offset = +this._vf.coord.substring(++offsetInd, strideInd);
                    stride = +this._vf.coord.substring(strideInd);
                    parent._coordStrideOffset = [stride, offset];
                    this._hasStrideOffset = true;
                    if ((offset / 8) - Math.floor(offset / 8) == 0) {
                        this._mesh._numPosComponents = 4;
                    }
                    //x3dom.debug.logInfo("coord stride/offset: " + stride + ", " + offset);
                }
                else if (strideInd >= 0) {
                    stride = +this._vf.coord.substring(strideInd);
                    parent._coordStrideOffset = [stride, 0];
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
                    parent._normalStrideOffset = [stride, offset];
                    //x3dom.debug.logInfo("normal stride/offset: " + stride + ", " + offset);
                }
                else if (strideInd >= 0) {
                    stride = +this._vf.normal.substring(strideInd);
                    parent._normalStrideOffset = [stride, 0];
                    //x3dom.debug.logInfo("normal stride: " + stride);
                }

                offsetInd = this._vf.texCoord.lastIndexOf('#');
                strideInd = this._vf.texCoord.lastIndexOf('+');
                if (offsetInd >= 0 && strideInd >= 0) {
                    offset = +this._vf.texCoord.substring(++offsetInd, strideInd);
                    stride = +this._vf.texCoord.substring(strideInd);
                    parent._texCoordStrideOffset = [stride, offset];
                    //x3dom.debug.logInfo("texCoord stride/offset: " + stride + ", " + offset);
                }
                else if (strideInd >= 0) {
                    stride = +this._vf.texCoord.substring(strideInd);
                    parent._texCoordStrideOffset = [stride, 0];
                    //x3dom.debug.logInfo("texCoord stride: " + stride);
                }

                offsetInd = this._vf.color.lastIndexOf('#');
                strideInd = this._vf.color.lastIndexOf('+');
                if (offsetInd >= 0 && strideInd >= 0) {
                    offset = +this._vf.color.substring(++offsetInd, strideInd);
                    stride = +this._vf.color.substring(strideInd);
                    parent._colorStrideOffset = [stride, offset];
                    //x3dom.debug.logInfo("color stride/offset: " + stride + ", " + offset);
                }
                else if (strideInd >= 0) {
                    stride = +this._vf.color.substring(strideInd);
                    parent._colorStrideOffset = [stride, 0];
                    //x3dom.debug.logInfo("color stride: " + stride);
                }
                
                if (this._vf.indexType != "Uint16")
    		        x3dom.debug.logWarning("Index type " + this._vf.indexType + " problematic");
            },
			
			doIntersect: function(line)
            {
                var min = this.getMin();
                var max = this.getMax();
                var isect = line.intersect(min, max);

                if (isect && line.enter < line.dist) {
                    line.dist = line.enter;
                    line.hitObject = this;
                    line.hitPoint = line.pos.add(line.dir.multiply(line.enter));
                    return true;
                }
                else {
                    return false;
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
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DBinaryContainerGeometryNode,
        function (ctx) {        
            x3dom.nodeTypes.PopGeometry.superClass.call(this, ctx);

            //@todo: remove this
            this.addField_SFVec3f (ctx, 'tightSize',  1, 1, 1);
            //@todo: add this on export
            this.addField_SFVec3f (ctx, 'maxBBSize',  1, 1, 1);
            this.addField_SFVec3f (ctx, 'bbMinModF',  0, 0, 0);
            this.addField_SFVec3f (ctx, 'bbMaxModF',  1, 1, 1);
            this.addField_SFVec3f (ctx, 'bbMin', 0, 0, 0);
            this.addField_SFVec3f (ctx, 'bbShiftVec', 0, 0, 0);

            if (this._vf.bbMinModF.x > this._vf.bbMaxModF.x)
                this._vf.bbShiftVec.x = 1.0;
            if (this._vf.bbMinModF.y > this._vf.bbMaxModF.y)
                this._vf.bbShiftVec.y = 1.0;
            if (this._vf.bbMinModF.z > this._vf.bbMaxModF.z)
                this._vf.bbShiftVec.z = 1.0;
      
            this.addField_MFNode('levels', x3dom.nodeTypes.PopGeometryLevel);
            
            this.addField_SFInt32(ctx, 'attributeStride',   0);
            this.addField_SFInt32(ctx, 'positionOffset',    0);
            this.addField_SFInt32(ctx, 'normalOffset',      0);
            this.addField_SFInt32(ctx, 'texcoordOffset',    0);
            this.addField_SFInt32(ctx, 'colorOffset',       0);
            this.addField_SFInt32(ctx, 'numAnchorVertices', 0);
            
            this.addField_SFInt32(ctx, 'positionPrecision', 2);
            this.addField_SFInt32(ctx, 'normalPrecision',   1);
            this.addField_SFInt32(ctx, 'texcoordPrecision', 2);
            this.addField_SFInt32(ctx, 'colorPrecision',    1); 

            this.addField_SFInt32(ctx, 'minPrecisionLevel', -1);
            this.addField_SFInt32(ctx, 'maxPrecisionLevel', -1);
            this.addField_SFFloat(ctx, 'precisionFactor',  1.0);

            //those four fields are read by the x3dom renderer            
            this.addField_SFString(ctx, 'coordType',    "Uint16");
            this.addField_SFString(ctx, 'normalType',   "Uint8");
            this.addField_SFString(ctx, 'texCoordType', "Uint16");
            this.addField_SFString(ctx, 'colorType',    "Uint8");            
           
            this.addField_SFInt32(ctx, 'vertexBufferSize', 0);
            
            this.addField_SFBool(ctx, 'indexedRendering', false);
            //ATTENTION: Although it might be supported by aopt,
            //           X3DOM does not accept 16 bit spherical normals yet,
            //           spherical normals are assumed to be 8 bit and get
            //           encoded as the 4th 16 bit position component
            this.addField_SFBool(ctx, 'sphericalNormals', false);
            
            //needed as we manipulate vertexCount during loading
            this.addField_MFInt32(ctx, 'originalVertexCount', [0]);
            
            for (var i = 0; i < this._vf.vertexCount.length; ++i) {
                this._vf.originalVertexCount[i] = this._vf.vertexCount[i];
            }

            //@todo: remove this three lines after cleanup
            this._vf.maxBBSize = x3dom.fields.SFVec3f.copy(this._vf.size);
            this._vf.size  = this._vf.tightSize;
            this._diameter = this._vf.size.length();

            this._bbMinBySize = [ Math.floor(this._vf.bbMin.x / this._vf.maxBBSize.x),
                                  Math.floor(this._vf.bbMin.y / this._vf.maxBBSize.y),
                                  Math.floor(this._vf.bbMin.z / this._vf.maxBBSize.z) ];
            this._volRadius        = this._vf.size.length() / 2;
            this._volLargestRadius = this._vf.maxBBSize.length() / 2;

            // workaround            
            this._mesh._numPosComponents  = this._vf.sphericalNormals ? 4 : 3;
            this._mesh._numNormComponents = this._vf.sphericalNormals ? 2 : 3;
            this._mesh._numTexComponents  = 2;
            this._mesh._numColComponents  = 3;

            x3dom.nodeTypes.PopGeometry.numTotalVerts += this.getVertexCount();
            x3dom.nodeTypes.PopGeometry.numTotalTris  += (this.hasIndex() ? 
                         this.getTotalNumberOfIndices() : this.getVertexCount()) / 3;
        },
        {
            nodeChanged: function() {              
            },

            forceUpdateCoverage: function()
            {
                return true;
            },

            parentAdded: function(parent) {
              //TODO: implement 
            },
            
            getBBoxShiftVec: function() {
              return this._vf.bbShiftVec;
            },
         
            getBBoxSize: function() {
              return this._vf.size;
            },
            
            hasIndex: function() {
              return this._vf.indexedRendering;
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
            //which is used by the renderer
            adaptVertexCount: function(numVerts) {
                var verts = 0;
                for (var i = 0; i < this._vf.originalVertexCount.length; ++i) {
                    if ((this._vf.originalVertexCount[i] + verts) <= numVerts) {
                        this._vf.vertexCount[i] = this._vf.originalVertexCount[i];
                        verts += this._vf.originalVertexCount[i];
                    }
                    else {
                        this._vf.vertexCount[i] = numVerts - verts;
                        break;
                    }                    
                }
            },
            
            hasNormal: function() {
              return (this._vf.normalOffset != 0) && !this._vf.sphericalNormals;
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
            }
        }
    )
);

/** Static class members (needed for stats) */
x3dom.nodeTypes.PopGeometry.ErrorToleranceFactor  = 1;
x3dom.nodeTypes.PopGeometry.PrecisionFactorOnMove = 1;
x3dom.nodeTypes.PopGeometry.numRenderedVerts      = 0;
x3dom.nodeTypes.PopGeometry.numRenderedTris       = 0;
x3dom.nodeTypes.PopGeometry.numTotalVerts         = 0;
x3dom.nodeTypes.PopGeometry.numTotalTris          = 0;

/** Static LUT for LOD computation */
x3dom.nodeTypes.PopGeometry.powLUT = [32768, 16384, 8192, 4096, 2048, 1024, 512, 256,
                                        128,    64,   32,   16,   8,    4,    2,   1];


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
    defineClass(x3dom.nodeTypes.X3DBinaryContainerGeometryNode,
        function (ctx) {	
            x3dom.nodeTypes.BitLODGeometry.superClass.call(this, ctx);

			this.addField_SFString(ctx, 'index', "");   // Uint16
            this.addField_SFBool(ctx, 'usesVLCIndices', false);  // variable-length coding
            this.addField_SFBool(ctx, 'clientSideNormals', false);  // variable-length coding            
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

			// workaround
			this._hasStrideOffset = false;
			this._mesh._numTexComponents = 2;
			this._mesh._numColComponents = 3;

            this._vf.clientSideNormals            = false;
            this._vf.normalPerVertex              = !this._vf.clientSideNormals;
            this._vf.normalAsSphericalCoordinates = this._vf.normalPerVertex;
			this._mesh._numNormComponents         = this._vf.normalAsSphericalCoordinates ? 2 : 3;
		},
		{
			nodeChanged: function()
            {
                // TODO
			},
      
		    parentAdded: function(parent)
		    {
			  parent._coordStrideOffset    = [12, 0];
			  parent._normalStrideOffset   = [12, 8];
			  parent._texCoordStrideOffset = [ 4, 0];
			  parent._colorStrideOffset    = [ 6, 0];
		    },
            
		    fieldChanged: function(fieldName)
		    {
			    // TODO
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
            
            usesClientSideNormals: function()
			{
                return this._vf.clientSideNormals == true;
            },
			
			hasColor: function()
			{
				for(var i=0; i<this.getNumComponents(); i++) {
					for(var j=0; j<this.getComponent(i).getNumAttribs(); j++) {
						if(this.getComponent(i).getAttrib(j) == "color3")
						    return true;
					}
				}
				return false;
			},
			
			hasTexCoord: function()
			{
				for(var i=0; i<this.getNumComponents(); i++) {
					for(var j=0; j<this.getComponent(i).getNumAttribs(); j++) {
						if(this.getComponent(i).getAttrib(j) == "texcoord2")
						    return true;
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
                return "";
			},
			
			getNumVertexCounts: function()
			{
				return this._vf.vertexCount.length;
			},
			
			getVertexCount: function(idx)
			{
				if( idx < this.getNumVertexCounts() ) 
					return this._vf.vertexCount[idx];
                return 0;
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
                        return 255.0 - (Math.pow(2.0, 8.0 - this.loadedLevels) - 1.0);
                    case "Int16":
                        return 32767.0;
                    case "Uint16":
                        if (type === 'normalType')
                            return 65535.0 - (Math.pow(2.0, 16.0 - this.loadedLevels) - 1.0);
                        else
                            return 65535.0 - (Math.pow(2.0, 16.0 - this.loadedLevels*2.0) - 1.0);
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
    defineClass(x3dom.nodeTypes.X3DBinaryContainerGeometryNode,
        function (ctx) {	
            x3dom.nodeTypes.ImageGeometry.superClass.call(this, ctx);

			this.addField_SFVec2f(ctx, 'implicitMeshSize', 256, 256);
			this.addField_SFInt32(ctx, 'numColorComponents', 3);
            this.addField_SFInt32(ctx, 'numTexCoordComponents', 2);

			this.addField_SFNode('index', x3dom.nodeTypes.X3DTextureNode);
			this.addField_MFNode('coord', x3dom.nodeTypes.X3DTextureNode);
			this.addField_SFNode('normal', x3dom.nodeTypes.X3DTextureNode);
			this.addField_SFNode('texCoord', x3dom.nodeTypes.X3DTextureNode);
			this.addField_SFNode('color', x3dom.nodeTypes.X3DTextureNode);
			
			this._mesh._numColComponents = this._vf.numColorComponents;
			this._mesh._numTexComponents = this._vf.numTexCoordComponents;
			
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
							this._mesh._positions[0].push(x / this._vf.implicitMeshSize.x,
                                                          y / this._vf.implicitMeshSize.y, 0);
						}
					}
					
					//this._mesh._invalidate = true;
					this._mesh._numFaces = this._mesh._indices[0].length / 3;
					this._mesh._numCoords = this._mesh._positions[0].length / 3;

					x3dom.geoCache[geoCacheID] = this._mesh;
				}
			}

            // needed because mesh is shared due to cache
            this._vol = new x3dom.fields.BoxVolume();

            this._dirty = {
                coord: true,
                normal: true,
                texCoord: true,
                color: true,
                index: true
            };
		},
		{
            setGeoDirty: function () {
                this._dirty.coord = true;
                this._dirty.normal = true;
                this._dirty.texCoords = true;
                this._dirty.color = true;
                this._dirty.index = true;
            },

            unsetGeoDirty: function () {
                this._dirty.coord = false;
                this._dirty.normal = false;
                this._dirty.texCoords = false;
                this._dirty.color = false;
                this._dirty.index = false;
            },

			nodeChanged: function()
            {		
				Array.forEach(this._parentNodes, function (node) {
                    node._dirty.positions = true;
					node._dirty.normals = true;
					node._dirty.texcoords = true;
                    node._dirty.colors = true;
				});
                this._vol.invalidate();
			},

            fieldChanged: function(fieldName)
            {
                if (fieldName == "coord" || fieldName == "normal" ||
                    fieldName == "texCoord" || fieldName == "color" ||
                    fieldName == "index") {
                    this._dirty[fieldName] = true;
                }
                this._vol.invalidate();
            },

            getMin: function() {
                var vol = this._vol;

                if (!vol.isValid()) {
                    vol.setBoundsByCenterSize(this._vf.position, this._vf.size);
                }

                return vol.min;
            },

            getMax: function() {
                var vol = this._vol;

                if (!vol.isValid()) {
                    vol.setBoundsByCenterSize(this._vf.position, this._vf.size);
                }

                return vol.max;
            },

            getVolume: function() {
                var vol = this._vol;

                if (!vol.isValid()) {
                    vol.setBoundsByCenterSize(this._vf.position, this._vf.size);
                }

                return vol;
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
                
                if (indexes.length && indexes[indexes.length-1] != -1)
                {
                    indexes.push(-1);
                    x3dom.debug.logWarning('Last index value should be -1.');
                }
                
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
                
                var i, j, t, cnt, faceCnt;
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
									else if (normPerVert) { n0 = p0; }
									else { n0 = faceCnt; }

									if (hasTexCoordInd) { t0 = +texCoordInd[i]; }
									else { t0 = p0; }
									if (hasColorInd && colPerVert) { c0 = +colorInd[i]; }
									else if (hasColorInd && !colPerVert) { c0 = +colorInd[faceCnt]; }
									else if (colPerVert) { c0 = p0; }
									else { c0 = faceCnt; }
									t = 1;
								break;
								case 1:
									p1 = +indexes[i];
									if (hasNormalInd && normPerVert) { n1 = +normalInd[i]; }
									else if (hasNormalInd && !normPerVert) { n1 = +normalInd[faceCnt]; }
									else if (normPerVert) { n1 = p1; }
									else { n1 = faceCnt; }

									if (hasTexCoordInd) { t1 = +texCoordInd[i]; }
									else { t1 = p1; }
									if (hasColorInd && colPerVert) { c1 = +colorInd[i]; }
									else if (hasColorInd && !colPerVert) { c1 = +colorInd[faceCnt]; }
									else if (colPerVert) { c1 = p1; }
									else { c1 = faceCnt; }
									t = 2;
								break;
								case 2:
									p2 = +indexes[i];
									if (hasNormalInd && normPerVert) { n2 = +normalInd[i]; }
									else if (hasNormalInd && !normPerVert) { n2 = +normalInd[faceCnt]; }
									else if (normPerVert) { n2 = p2; }
									else { n2 = faceCnt; }

									if (hasTexCoordInd) { t2 = +texCoordInd[i]; }
									else { t2 = p2; }
									if (hasColorInd && colPerVert) { c2 = +colorInd[i]; }
									else if (hasColorInd && !colPerVert) { c2 = +colorInd[faceCnt]; }
									else if (colPerVert) { c2 = p2; }
									else { c2 = faceCnt; }
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
									} else if (normPerVert) {
										n2 = p2;
									} else {
										n2 = faceCnt;
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
									} else if (colPerVert) {
										c2 = p2;
									} else {
										c2 = faceCnt;
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
						var data = {};
						cnt = 0; faceCnt = 0;
												
						for (i = 0; i < indexes.length; ++i)
						{	
							if (indexes[i] == -1) {
								var multi_index_data = x3dom.EarClipping.getMultiIndexes(linklist);
								
								for (j = 0; j < multi_index_data.indices.length; j++)
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
						this._mesh.calcNormals(this._vf.creaseAngle, this._vf.ccw);
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
						linklist = new x3dom.DoublyLinkedList();
						for (i = 0; i < indexes.length; ++i)
						{
							if (indexes[i] == -1) {
								var linklist_indices = x3dom.EarClipping.getIndexes(linklist);

								for (j = 0; j < linklist_indices.length; j++) {
									this._mesh._indices[0].push(linklist_indices[j]);
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
                        this._mesh.calcNormals(this._vf.creaseAngle, this._vf.ccw);
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
                    texCoordNode = this._cf.texCoord.node;
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


					var i, j, t, cnt, faceCnt;
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
									else if (normPerVert) { n0 = p0; }
									else { n0 = faceCnt; }

									if (hasTexCoordInd) { t0 = +texCoordInd[i]; }
									else { t0 = p0; }
									if (hasColorInd && colPerVert) { c0 = +colorInd[i]; }
									else if (hasColorInd && !colPerVert) { c0 = +colorInd[faceCnt]; }
									else if (colPerVert) { c0 = p0; }
									else { c0 = faceCnt; }
									t = 1;
								break;
								case 1:
									p1 = +indexes[i];
									if (hasNormalInd && normPerVert) { n1 = +normalInd[i]; }
									else if (hasNormalInd && !normPerVert) { n1 = +normalInd[faceCnt]; }
									else if (normPerVert) { n1 = p1; }
									else { n1 = faceCnt; }

									if (hasTexCoordInd) { t1 = +texCoordInd[i]; }
									else { t1 = p1; }
									if (hasColorInd && colPerVert) { c1 = +colorInd[i]; }
									else if (hasColorInd && !colPerVert) { c1 = +colorInd[faceCnt]; }
									else if (colPerVert) { c1 = p1; }
									else { c1 = faceCnt; }
									t = 2;
								break;
								case 2:
									p2 = +indexes[i];
									if (hasNormalInd && normPerVert) { n2 = +normalInd[i]; }
									else if (hasNormalInd && !normPerVert) { n2 = +normalInd[faceCnt]; }
									else if (normPerVert) { n2 = p2; }
									else { n2 = faceCnt; }

									if (hasTexCoordInd) { t2 = +texCoordInd[i]; }
									else { t2 = p2; }
									if (hasColorInd && colPerVert) { c2 = +colorInd[i]; }
									else if (hasColorInd && !colPerVert) { c2 = +colorInd[faceCnt]; }
									else if (colPerVert) { c2 = p2; }
									else { c2 = faceCnt; }
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
									} else if (normPerVert) {
										n2 = p2;
									} else {
										n2 = faceCnt;
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
									} else if (colPerVert) {
										c2 = p2;
									} else {
										c2 = faceCnt;
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
						var data = {};
						cnt = 0; faceCnt = 0;
												
						for (i = 0; i < indexes.length; ++i)
						{	
							if (indexes[i] == -1) {
								var multi_index_data = x3dom.EarClipping.getMultiIndexes(linklist);
								
								for (j = 0; j < multi_index_data.indices.length; j++)
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
						this._mesh.calcNormals(this._vf.creaseAngle, this._vf.ccw);
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
                        texCoordNode = this._cf.texCoord.node;
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
