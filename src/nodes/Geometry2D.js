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
 
/* ### Arc2D ### */
x3dom.registerNodeType(
    "Arc2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Arc2D.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'endAngle', 1.570796);
            this.addField_SFFloat(ctx, 'radius', 1);
            this.addField_SFFloat(ctx, 'startAngle', 0);
            this.addField_SFBool(ctx, 'lit', false);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### ArcClose2D ### */
x3dom.registerNodeType(
    "ArcClose2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.ArcClose2D.superClass.call(this, ctx);

            this.addField_SFString(ctx, 'closureType', "PIE");
            this.addField_SFFloat(ctx, 'endAngle', 1.570796);
            this.addField_SFFloat(ctx, 'radius', 1);
            this.addField_SFFloat(ctx, 'startAngle', 0);
            this.addField_SFBool(ctx, 'solid', false);
            this.addField_SFBool(ctx, 'lit', true);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### Circle2D ### */
x3dom.registerNodeType(
    "Circle2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Circle2D.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'radius', 1);
            this.addField_SFBool(ctx, 'lit', false);
			
			
			var r = this._vf.radius;
			
			var geoCacheID = 'Circle2D_'+r;

			if (x3dom.geoCache[geoCacheID] != undefined) {
				x3dom.debug.logInfo("Using Circle2D from Cache");
				this._mesh = x3dom.geoCache[geoCacheID];
			} else {
				
       			 var anzahl = 30;
				
				for (var i=0; i <= anzahl; i++) {
					var theta = i * ((2*Math.PI) / anzahl);
		 
					var x = Math.cos(theta) * r;
					var y = Math.sin(theta) * r;
		
					this._mesh._positions[0].push(x);
					this._mesh._positions[0].push(y);
					this._mesh._positions[0].push(0.0);
					/*this._mesh._normals[0].push(0);
					this._mesh._normals[0].push(0);
					this._mesh._normals[0].push(1);*/
					this._mesh._colors[0].push(0.5);
					this._mesh._colors[0].push(0.5);
					this._mesh._colors[0].push(0.5);
				}
				

				for (i = 0; i < anzahl; i++) {
					this._mesh._indices[0].push(i);
					if((i + 1) == anzahl) {
						this._mesh._indices[0].push(0);
					} else {
						this._mesh._indices[0].push(i + 1);
					}			
				}
				
				this._mesh._invalidate = true;
				this._mesh._numFaces = this._mesh._indices[0].length / 2;
				this._mesh._numCoords = this._mesh._positions[0].length / 3;

				x3dom.geoCache[geoCacheID] = this._mesh;
			}
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### Disk2D ### */
x3dom.registerNodeType(
    "Disk2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Disk2D.superClass.call(this, ctx);

            this.addField_SFFloat(ctx, 'innerRadius', 0);
            this.addField_SFFloat(ctx, 'outerRadius', 1);
            this.addField_SFBool(ctx, 'solid', false);
            this.addField_SFBool(ctx, 'lit', true);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### Polyline2D ### */
x3dom.registerNodeType(
    "Polyline2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Polyline2D.superClass.call(this, ctx);

            this.addField_MFVec2f(ctx, 'lineSegments', []);
            this.addField_SFBool(ctx, 'lit', false);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### Polypoint2D ### */
x3dom.registerNodeType(
    "Polypoint2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Polypoint2D.superClass.call(this, ctx);

            this.addField_MFVec2f(ctx, 'point', []);
            this.addField_SFBool(ctx, 'lit', false);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);

/* ### Rectangle2D ### */
x3dom.registerNodeType(
    "Rectangle2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Rectangle2D.superClass.call(this, ctx);
			
			this.addField_SFVec2f(ctx, 'size', 2, 2);
            this.addField_SFBool(ctx, 'solid', false);
            this.addField_SFBool(ctx, 'lit', true);

            var sx = this._vf.size.x, sy = this._vf.size.y;
         	
			var geoCacheID = 'Rectangle2D_'+sx+'-'+sy;

			if( x3dom.geoCache[geoCacheID] != undefined )
			{
				x3dom.debug.logInfo("Using Rectangle2D from Cache");
				this._mesh = x3dom.geoCache[geoCacheID];
			}
			else
			{
				sx /= 2; sy /= 2;

				this._mesh._positions[0] = [
					-sx,-sy, 0.0, -sx, sy, 0.0,  sx, sy, 0.0,  sx,-sy, 0.0
				];
				this._mesh._normals[0] = [
					0,0,1,  0,0,1,   0,0,1,   0,0,1
				];
				this._mesh._texCoords[0] = [
					0,0, 0,1, 1,1, 1,0
				];
				this._mesh._indices[0] = [
					0,1,2, 2,3,0
				];
				this._mesh._invalidate = true;
				this._mesh._numFaces = 2;
				this._mesh._numCoords = 4;

				x3dom.geoCache[geoCacheID] = this._mesh;
			}
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {
				if (fieldName == "size")
                { 
                    var size = this._vf.size;
                	var sx = size.x;
               		var sy = size.y;

                   this._mesh._positions[0] = [
						-sx,-sy, 0.0, -sx, sy, 0.0,  sx, sy, 0.0,  sx,-sy, 0.0
				   ]; 
				   
				   this._mesh._invalidate = true;
				   
				   Array.forEach(this._parentNodes, function (node) {
                        node._dirty.positions = true;
                   });
                }
               
			}
        }
    )
);

/* ### TriangleSet2D ### */
x3dom.registerNodeType(
    "TriangleSet2D",
    "Geometry2D",
    defineClass(x3dom.nodeTypes.X3DGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.TriangleSet2D.superClass.call(this, ctx);

            this.addField_MFVec2f(ctx, 'vertices', []);
            this.addField_SFBool(ctx, 'solid', false);
            this.addField_SFBool(ctx, 'lit', true);
        },
        {
            nodeChanged: function() {},
            fieldChanged: function(fieldName) {}
        }
    )
);
