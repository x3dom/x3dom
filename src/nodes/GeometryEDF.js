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
			
			this.addField_SFFloat(ctx, 'dtop', 0);		//Diameter of the top surface
			this.addField_SFFloat(ctx, 'dbottom', 0);	//diameter of the bottom surface
			this.addField_SFFloat(ctx, 'xoff', 0);		//Displacement of axes along X-axis
			this.addField_SFFloat(ctx, 'yoff', 0);		//Displacement of axes along Y-axis
			this.addField_SFFloat(ctx, 'height', 0);	//Perpendicular distance between surfaces
			
			var geoCacheID = 'Snout...';

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

/* ### Dish ### */
x3dom.registerNodeType(
    "Dish",
    "Geometry3D",
    defineClass(x3dom.nodeTypes.X3DSpatialGeometryNode,
        function (ctx) {
            x3dom.nodeTypes.Dish.superClass.call(this, ctx);
			
			this.addField_SFFloat(ctx, 'diameter', 0); 	//Diameter of base
			this.addField_SFFloat(ctx, 'height', 0);	//Maximum height of dished surface above base
			this.addField_SFFloat(ctx, 'radius', 0);	//If radius is zero, dish is drawn as section of sphere.
														//If radius is greater than zero, dish is defined as half of an ellipsoid
			
			var geoCacheID = 'Dish...';

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