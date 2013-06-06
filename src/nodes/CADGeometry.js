/*
 * CADGeometry:
 * CADGeometry component of X3D extension to the
 * X3DOM JavaScript Library
 * http://x3dom.org
 *

 * Closely adapted from the code for the Grouping components in X3D as
 * implemented in X3DOM
 
 Dual licensed under the MIT and GPL.
 http://x3dom.org/download/dev/docs/html/license.html
 
 * Based on code originally provided by
 *  Philip Taylor: http://philip.html5.org
 
 * 19 Nov 2012  Vincent Marchetti:  vmarchetti@kshell.com
 * 25 May 2013  -- implemented QuadSet, IndexedQuadSet; based largely on the code
                for IndexedTriangleSet in Rendering.js
 */


// ### IndexedQuadSet ###
x3dom.registerNodeType(
    "IndexedQuadSet",
    "CADGeometry",
    defineClass(x3dom.nodeTypes.X3DComposedGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.IndexedQuadSet.superClass.call(this, ctx);

            this.addField_MFInt32(ctx, 'index', []);
        },
        {
            nodeChanged: function()
            {
                /*
                This code largely taken from the IndexedTriangleSet
                code
                */
                var time0 = new Date().getTime();

                this.handleAttribs();

				var colPerVert = this._vf.colorPerVertex;
                var normPerVert = this._vf.normalPerVertex;

                var indexes = this._vf.index;

                var hasNormal = false, hasTexCoord = false, hasColor = false;
                var positions, normals, texCoords, colors;

                var coordNode = this._cf.coord.node;
                x3dom.debug.assert(coordNode);
                positions = coordNode._vf.point;

                var normalNode = this._cf.normal.node;
                if (normalNode) {
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
                if (texCoordNode) {
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

                var numColComponents = 3;
                var colorNode = this._cf.color.node;
                if (colorNode) {
                    hasColor = true;
                    colors = colorNode._vf.color;

                    if (x3dom.isa(colorNode, x3dom.nodeTypes.ColorRGBA)) {
                        numColComponents = 4;
                    }
                }
                else {
                    hasColor = false;
                }

                this._mesh._indices[0] = [];
                this._mesh._positions[0] = [];
                this._mesh._normals[0] = [];
                this._mesh._texCoords[0] = [];
                this._mesh._colors[0] = [];

                var i, t, cnt, faceCnt, posMax;
                var p0, p1, p2, n0, n1, n2, t0, t1, t2, c0, c1, c2;

                // if positions array too short add degenerate triangle
                while (positions.length % 4 > 0) {
                    positions.push(positions.length-1);
                }
                posMax = positions.length;

                /*
                Note: A separate section setting the _mesh field members
                and starting with this test:
                if (!normPerVert || positions.length > 65535)
                is in the IndexedTriangleSet code. It has been removed
                here until it's applicability to the QUadSet case can
                be evaluated
                */
                if (1)
                {
					faceCnt = 0;
					for (i=0; i<indexes.length; i++)
					{
						if ((i > 0) && (i % 4 === 3 )) {                   
							faceCnt++;
							
							// then pushe the the 2nd triangle
							// of the quad on
							this._mesh._indices[0].push(indexes[i-3]);
							this._mesh._indices[0].push(indexes[i-1]);
							this._mesh._indices[0].push(indexes[i]);
                        }	
						else{
						    this._mesh._indices[0].push(indexes[i]);
						}
							
						if(!normPerVert && hasNormal) {
							this._mesh._normals[0].push(normals[faceCnt].x);
							this._mesh._normals[0].push(normals[faceCnt].y);
							this._mesh._normals[0].push(normals[faceCnt].z);
						}
						if(!colPerVert && hasColor) {								
							this._mesh._colors[0].push(colors[faceCnt].r);
							this._mesh._colors[0].push(colors[faceCnt].g);
							this._mesh._colors[0].push(colors[faceCnt].b);
							if (numColComponents === 4) {
								this._mesh._colors[0].push(colors[faceCnt].a);
							}   
						}  				
					}
               
                    this._mesh._positions[0] = positions.toGL();
                    
                    if (hasNormal) {
                        this._mesh._normals[0] = normals.toGL();
                    }
                    else {
                        this._mesh.calcNormals(normPerVert ? Math.PI : 0);
                    }
                    
                    if (hasTexCoord) {
                        this._mesh._texCoords[0] = texCoords.toGL();
                        this._mesh._numTexComponents = numTexComponents;
                    }
                    else {
                        this._mesh.calcTexCoords(texMode);
                    }
                    
                    if (hasColor && colPerVert) {
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
                var pnts = this._cf.coord.node._vf.point;
                
                if ( pnts.length > 65535 )  // are there other problematic cases?
                {
					// TODO; implement
                    x3dom.debug.logWarning("IndexedTriangleSet: fieldChanged with " + 
                                           "too many coordinates not yet implemented!");
                    return;
                }
                
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
						
					if (this._vf.colorPerVertex) { 
				
						this._mesh._colors[0] = pnts.toGL();	
							
					} else if (!this._vf.colorPerVertex) {
						
						var faceCnt = 0;
						var numColComponents = 3;	
                   		if (x3dom.isa(this._cf.color.node, x3dom.nodeTypes.ColorRGBA)) {
							numColComponents = 4;
						}
							
						this._mesh._colors[0] = [];
							
						var indexes = this._vf.index;
						for (i=0; i < indexes.length; ++i)
						{
							if ((i > 0) && (i % 3 === 0 )) {                   
								faceCnt++;							
							}	
								
							this._mesh._colors[0].push(pnts[faceCnt].r);
							this._mesh._colors[0].push(pnts[faceCnt].g);
							this._mesh._colors[0].push(pnts[faceCnt].b);
							if (numColComponents === 4) {
								this._mesh._colors[0].push(pnts[faceCnt].a);
							}  
						}
					}
					Array.forEach(this._parentNodes, function (node) {
						node._dirty.colors = true;
					});
                }
				else if (fieldName == "normal")
                {                 
					pnts = this._cf.normal.node._vf.vector;
						
					if (this._vf.normalPerVertex) { 
						
						this._mesh._normals[0] = pnts.toGL();
							
					} else if (!this._vf.normalPerVertex) {
							
						var indexes = this._vf.index;
						this._mesh._normals[0] = [];
						
						var faceCnt = 0;
						for (i=0; i < indexes.length; ++i)
						{
							if ((i > 0) && (i % 3 === 0 )) {                   
								faceCnt++;							
							}	
							
							this._mesh._normals[0].push(pnts[faceCnt].x);
							this._mesh._normals[0].push(pnts[faceCnt].y);
							this._mesh._normals[0].push(pnts[faceCnt].z);	
						}
					}

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
        }    )
);

// ### QuadSet ###
x3dom.registerNodeType(
    "QuadSet",
    "CADGeometry",
    defineClass(x3dom.nodeTypes.X3DComposedGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.IndexedQuadSet.superClass.call(this, ctx);

        },
        {
            nodeChanged: function()
            {
                /*
                This code largely taken from the IndexedTriangleSet
                code
                */
                var time0 = new Date().getTime();

                this.handleAttribs();

				var colPerVert = this._vf.colorPerVertex;
                var normPerVert = this._vf.normalPerVertex;


                var hasNormal = false, hasTexCoord = false, hasColor = false;
                var positions, normals, texCoords, colors;

                var coordNode = this._cf.coord.node;
                x3dom.debug.assert(coordNode);
                positions = coordNode._vf.point;

                var normalNode = this._cf.normal.node;
                if (normalNode) {
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
                if (texCoordNode) {
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

                var numColComponents = 3;
                var colorNode = this._cf.color.node;
                if (colorNode) {
                    hasColor = true;
                    colors = colorNode._vf.color;

                    if (x3dom.isa(colorNode, x3dom.nodeTypes.ColorRGBA)) {
                        numColComponents = 4;
                    }
                }
                else {
                    hasColor = false;
                }

                this._mesh._indices[0] = [];
                this._mesh._positions[0] = [];
                this._mesh._normals[0] = [];
                this._mesh._texCoords[0] = [];
                this._mesh._colors[0] = [];

                var i, t, cnt, faceCnt, posMax;
                var p0, p1, p2, n0, n1, n2, t0, t1, t2, c0, c1, c2;

                // if positions array too short add degenerate triangle
                while (positions.length % 4 > 0) {
                    positions.push(positions.length-1);
                }
                posMax = positions.length;

                /*
                Note: A separate section setting the _mesh field members
                and starting with this test:
                if (!normPerVert || positions.length > 65535)
                is in the IndexedTriangleSet code. It has been removed
                here until it's applicability to the QUadSet case can
                be evaluated
                */
                if (1)
                {
					faceCnt = 0;
					for (i=0; i<positions.length; i++)
					{
						if ((i > 0) && (i % 4 === 3 )) {                   
							faceCnt++;
							
							// then pushe the the 2nd triangle
							// of the quad on
							this._mesh._indices[0].push(i-3);
							this._mesh._indices[0].push(i-1);
							this._mesh._indices[0].push(i);
                        }	
						else{
						    this._mesh._indices[0].push(i);
						}
							
						if(!normPerVert && hasNormal) {
							this._mesh._normals[0].push(normals[faceCnt].x);
							this._mesh._normals[0].push(normals[faceCnt].y);
							this._mesh._normals[0].push(normals[faceCnt].z);
						}
						if(!colPerVert && hasColor) {								
							this._mesh._colors[0].push(colors[faceCnt].r);
							this._mesh._colors[0].push(colors[faceCnt].g);
							this._mesh._colors[0].push(colors[faceCnt].b);
							if (numColComponents === 4) {
								this._mesh._colors[0].push(colors[faceCnt].a);
							}   
						}  				
					}
               
                    this._mesh._positions[0] = positions.toGL();
                    
                    if (hasNormal) {
                        this._mesh._normals[0] = normals.toGL();
                    }
                    else {
                        this._mesh.calcNormals(normPerVert ? Math.PI : 0);
                    }
                    
                    if (hasTexCoord) {
                        this._mesh._texCoords[0] = texCoords.toGL();
                        this._mesh._numTexComponents = numTexComponents;
                    }
                    else {
                        this._mesh.calcTexCoords(texMode);
                    }
                    
                    if (hasColor && colPerVert) {
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
                var pnts = this._cf.coord.node._vf.point;
                
                if ( pnts.length > 65535 )  // are there other problematic cases?
                {
					// TODO; implement
                    x3dom.debug.logWarning("QuadSet: fieldChanged with " + 
                                           "too many coordinates not yet implemented!");
                    return;
                }
                
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
						
					if (this._vf.colorPerVertex) { 
				
						this._mesh._colors[0] = pnts.toGL();	
							
					} else if (!this._vf.colorPerVertex) {
						
						var faceCnt = 0;
						var numColComponents = 3;	
                   		if (x3dom.isa(this._cf.color.node, x3dom.nodeTypes.ColorRGBA)) {
							numColComponents = 4;
						}
							
						this._mesh._colors[0] = [];
							
						var indexes = this._vf.index;
						for (i=0; i < indexes.length; ++i)
						{
							if ((i > 0) && (i % 3 === 0 )) {                   
								faceCnt++;							
							}	
								
							this._mesh._colors[0].push(pnts[faceCnt].r);
							this._mesh._colors[0].push(pnts[faceCnt].g);
							this._mesh._colors[0].push(pnts[faceCnt].b);
							if (numColComponents === 4) {
								this._mesh._colors[0].push(pnts[faceCnt].a);
							}  
						}
					}
					Array.forEach(this._parentNodes, function (node) {
						node._dirty.colors = true;
					});
                }
				else if (fieldName == "normal")
                {                 
					pnts = this._cf.normal.node._vf.vector;
						
					if (this._vf.normalPerVertex) { 
						
						this._mesh._normals[0] = pnts.toGL();
							
					} else if (!this._vf.normalPerVertex) {
							
						var indexes = this._vf.index;
						this._mesh._normals[0] = [];
						
						var faceCnt = 0;
						for (i=0; i < indexes.length; ++i)
						{
							if ((i > 0) && (i % 3 === 0 )) {                   
								faceCnt++;							
							}	
							
							this._mesh._normals[0].push(pnts[faceCnt].x);
							this._mesh._normals[0].push(pnts[faceCnt].y);
							this._mesh._normals[0].push(pnts[faceCnt].z);	
						}
					}

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
        }    )
);


// ### CADLayer ###
x3dom.registerNodeType(
    "CADLayer",
    "CADGeometry",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Group.superClass.call(this, ctx);
            this.addField_SFString(ctx,'name', "");
            this.addField_SFVec3f(ctx, 'bboxCenter', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'bboxSize', -1, -1, -1);
            // to be implemented: the 'visible' field
        },
        {
        }
    )
);

// ### CADAssembly ###
x3dom.registerNodeType(
    "CADAssembly",
    "CADGeometry",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Group.superClass.call(this, ctx);
            this.addField_SFString(ctx, 'name', "");

            this.addField_SFVec3f(ctx, 'bboxCenter', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'bboxSize', -1, -1, -1);

        },
        {
        }
    )
);

// According to the CADGeometry specification,
// the CADPart node has transformation fields identical to 
// those used in the Transform node. This implementation is largely
// adapted from the X3DOM implementation of the Transform node.
x3dom.registerNodeType(
    "CADPart",
    "CADGeometry",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Group.superClass.call(this, ctx);
            this.addField_SFString(ctx, 'name', "");
            
            this.addField_SFVec3f(ctx, 'bboxCenter', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'bboxSize', -1, -1, -1);
            
            this._trafo = null; // will hold the transformation matrix
            this.addField_SFVec3f(ctx, 'center', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'translation', 0, 0, 0);
            this.addField_SFRotation(ctx, 'rotation', 0, 0, 1, 0);
            this.addField_SFVec3f(ctx, 'scale', 1, 1, 1);
            this.addField_SFRotation(ctx, 'scaleOrientation', 0, 0, 1, 0);

            // P' = T * C * R * SR * S * -SR * -C * P
            this._trafo = x3dom.fields.SFMatrix4f.translation(
                    this._vf.translation.add(this._vf.center)).
                mult(this._vf.rotation.toMatrix()).
                mult(this._vf.scaleOrientation.toMatrix()).
                mult(x3dom.fields.SFMatrix4f.scale(this._vf.scale)).
                mult(this._vf.scaleOrientation.toMatrix().inverse()).
                mult(x3dom.fields.SFMatrix4f.translation(this._vf.center.negate()));            
        },
        {
            fieldChanged: function (fieldName) {
                // P' = T * C * R * SR * S * -SR * -C * P
                this._trafo = x3dom.fields.SFMatrix4f.translation(
                                this._vf.translation.add(this._vf.center)).
                            mult(this._vf.rotation.toMatrix()).
                            mult(this._vf.scaleOrientation.toMatrix()).
                            mult(x3dom.fields.SFMatrix4f.scale(this._vf.scale)).
                            mult(this._vf.scaleOrientation.toMatrix().inverse()).
                            mult(x3dom.fields.SFMatrix4f.translation(this._vf.center.negate()));
            },
            
            transformMatrix: function(transform) {
                return transform.mult(this._trafo);
            },

        }
    )
);

x3dom.registerNodeType(
    "CADFace",
    "CADGeometry",
    defineClass(x3dom.nodeTypes.X3DGroupingNode,
        function (ctx) {
            x3dom.nodeTypes.Group.superClass.call(this, ctx);
            this.addField_SFString(ctx, 'name', "");
            this.addField_SFVec3f(ctx, 'bboxCenter', 0, 0, 0);
            this.addField_SFVec3f(ctx, 'bboxSize', -1, -1, -1);

            this.addField_SFNode('shape', x3dom.nodeTypes.Shape);
        },
        {
            collectDrawableObjects: function (transform, out)
            {
                if (!this._vf.render || !out) {
                    return;
                }


                if (this._cf.shape) {
                     this._cf.shape.node.collectDrawableObjects(transform, out);
                }

            }

        }
    )
);


